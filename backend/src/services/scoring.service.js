'use strict';

/**
 * Real-time rule-based Bot Detection & Human Scoring Engine
 * This runs sub-50ms in the request path — NO ML here, ML is async batch.
 */

const BOT_USER_AGENTS = [
  'googlebot', 'bingbot', 'slurp', 'duckduckbot', 'baiduspider',
  'yandexbot', 'facebot', 'ia_archiver', 'scrapy', 'wget', 'curl',
  'python-requests', 'go-http-client', 'java/', 'libwww', 'bot', 'spider',
  'crawler', 'scraper', 'selenium', 'webdriver', 'puppeteer', 'playwright',
  'headless', 'phantomjs', 'gptbot', 'claudebot', 'perplexitybot',
  'bytespider', 'metaexternalagent', 'chatgpt-user', 'ccbot', 'openai'
];

const KNOWN_BOT_TYPES = {
  'googlebot': 'Search Engine Bot',
  'bingbot': 'Search Engine Bot',
  'gptbot': 'AI Crawler',
  'claudebot': 'AI Crawler',
  'perplexitybot': 'AI Crawler',
  'bytespider': 'AI Crawler',
  'selenium': 'Automation Framework',
  'puppeteer': 'Headless Browser',
  'playwright': 'Headless Browser',
  'headlesschrome': 'Headless Browser',
  'phantomjs': 'Headless Browser',
  'scrapy': 'Web Scraper',
};

const DATACENTER_ASN_PREFIXES = ['AS14061', 'AS16509', 'AS15169', 'AS8075', 'AS13335']; // DO, AWS, GCP, Azure, CF

/**
 * Main scoring function — runs real-time
 * Returns { botScore, humanScore, botType, fraudReasons, flags }
 */
function scoreEvent(event) {
  const flags = [];
  let botScore = 0;
  let fraudScore = 0;
  const fraudReasons = [];

  const ua = (event.user_agent || '').toLowerCase();

  // ── 1. User Agent Check ────────────────────────────────────────────────
  const matchedBot = BOT_USER_AGENTS.find(b => ua.includes(b));
  if (matchedBot) {
    botScore += 70;
    flags.push('BOT_USER_AGENT');
    const botType = Object.entries(KNOWN_BOT_TYPES).find(([k]) => ua.includes(k));
    event._botType = botType ? botType[1] : 'Known Bot';
  }

  // webdriver flag in fingerprint
  if (event.behavior_signals?.webdriver_detected) {
    botScore += 40;
    flags.push('WEBDRIVER_DETECTED');
  }

  // ── 2. Behavioral Signals ──────────────────────────────────────────────
  const signals = event.behavior_signals || {};

  // No mouse movement at all
  if (signals.mouse_movement_count === 0 && event.time_on_page_ms > 5000) {
    botScore += 25;
    flags.push('NO_MOUSE_MOVEMENT');
  }

  // Instant bounce (< 500ms)
  if (event.time_on_page_ms < 500 && event.event_type === 'unload') {
    botScore += 20;
    flags.push('INSTANT_BOUNCE');
  }

  // Impossible fast scroll (full page < 1s)
  if (signals.scroll_depth > 80 && event.time_on_page_ms < 1000) {
    botScore += 30;
    flags.push('IMPOSSIBLE_SCROLL_SPEED');
  }

  // Linear/teleport mouse movement
  if (signals.mouse_linearity_score > 0.95) {
    botScore += 35;
    flags.push('LINEAR_MOUSE_MOVEMENT');
  }

  // No keyboard/focus events ever
  if (signals.has_keyboard_interaction === false && signals.has_focus_event === false && event.time_on_page_ms > 10000) {
    botScore += 15;
    flags.push('NO_KEYBOARD_FOCUS');
  }

  // ── 3. Network/IP Signals ─────────────────────────────────────────────
  if (event.is_vpn) {
    botScore += 15;
    fraudScore += 20;
    flags.push('VPN_DETECTED');
    fraudReasons.push('VPN usage detected');
  }

  if (event.is_proxy) {
    botScore += 20;
    fraudScore += 30;
    flags.push('PROXY_DETECTED');
    fraudReasons.push('Proxy detected');
  }

  if (event.is_tor) {
    botScore += 50;
    fraudScore += 60;
    flags.push('TOR_DETECTED');
    fraudReasons.push('TOR network detected');
  }

  if (event.is_datacenter) {
    botScore += 35;
    fraudScore += 25;
    flags.push('DATACENTER_IP');
    fraudReasons.push('Datacenter/hosting IP');
  }

  // ── 4. Click Fraud Signals ────────────────────────────────────────────
  if (event.click_velocity_per_minute > 60) {
    fraudScore += 40;
    flags.push('RAPID_CLICK_VELOCITY');
    fraudReasons.push('Abnormal click velocity');
  }

  if (event.repeat_visit_count > 10 && event.time_between_visits_ms < 30000) {
    fraudScore += 35;
    flags.push('REPEATED_RAPID_VISITS');
    fraudReasons.push('Repeated rapid visits — possible click farm');
  }

  if (signals.rage_click_count > 5) {
    botScore += 10;
    flags.push('EXCESSIVE_RAGE_CLICKS');
  }

  // ── 5. Fingerprint Anomaly ─────────────────────────────────────────────
  if (!signals.canvas_fingerprint) {
    botScore += 10;
    flags.push('NO_CANVAS_FINGERPRINT');
  }

  if (!signals.audio_fingerprint) {
    botScore += 10;
    flags.push('NO_AUDIO_FINGERPRINT');
  }

  // ── 6. Normalize Scores ────────────────────────────────────────────────
  botScore = Math.min(100, botScore);
  fraudScore = Math.min(100, fraudScore);

  const humanScore = computeHumanScore(signals, botScore);

  return {
    bot_score: botScore,
    human_score: humanScore,
    click_quality_score: computeClickQualityScore(botScore, fraudScore, humanScore),
    is_bot: botScore >= 60,
    is_fraud: fraudScore >= 50,
    bot_type: event._botType || (botScore >= 60 ? 'Suspected Bot' : ''),
    fraud_reason: fraudReasons.join('; '),
    anomaly_score: Math.max(botScore, fraudScore) * 0.8,
    is_anomaly: botScore >= 70 || fraudScore >= 60,
    anomaly_reason: flags.join(', ')
  };
}

function computeHumanScore(signals, botScore) {
  let score = 100 - botScore;

  // Positive human signals
  if (signals.mouse_movement_count > 20) score = Math.min(100, score + 10);
  if (signals.has_keyboard_interaction) score = Math.min(100, score + 8);
  if (signals.scroll_depth > 30) score = Math.min(100, score + 5);
  if (signals.time_on_page_ms > 30000) score = Math.min(100, score + 10);
  if (signals.mouse_curve_complexity > 0.3) score = Math.min(100, score + 10);

  return Math.max(0, Math.min(100, Math.round(score)));
}

function computeClickQualityScore(botScore, fraudScore, humanScore) {
  const quality = (humanScore * 0.5) + ((100 - botScore) * 0.3) + ((100 - fraudScore) * 0.2);
  return Math.max(0, Math.min(100, Math.round(quality)));
}

/**
 * Get human category label
 */
function getHumanCategory(score) {
  if (score >= 81) return { label: 'Trusted Human', color: 'green' };
  if (score >= 61) return { label: 'Human', color: 'blue' };
  if (score >= 31) return { label: 'Possible Bot', color: 'orange' };
  return { label: 'Suspicious', color: 'red' };
}

module.exports = { scoreEvent, getHumanCategory };
