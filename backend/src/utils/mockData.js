'use strict';

/**
 * Mock data generator for dashboard analytics
 * Used when ClickHouse is not yet available or for development
 */

const { subDays, subHours, format } = require('date-fns');

function generateMockDashboardSummary() {
  return {
    total_visitors: 48392,
    human_visitors: 39874,
    bot_visitors: 6284,
    suspected_visitors: 2234,
    fraud_clicks: 1847,
    live_visitors: Math.floor(Math.random() * 80) + 30,
    bounce_rate: 38.4,
    avg_session_seconds: 142,
    conversion_rate: 3.74,
    click_quality_avg: 72.3,
    human_rate: 82.4,
    bot_rate: 13.0,
    period: '24h',
    // Trends vs previous period
    trends: {
      total_visitors: +12.4,
      human_visitors: +8.2,
      bot_visitors: +31.5,
      fraud_clicks: +18.9,
      bounce_rate: -2.1,
      conversion_rate: -0.8,
    }
  };
}

function generateMockTimeseriesData(hours = 24) {
  const data = [];
  const now = new Date();
  for (let i = hours; i >= 0; i--) {
    const t = subHours(now, i);
    const base = Math.floor(Math.random() * 300) + 100;
    data.push({
      timestamp: t.toISOString(),
      hour: format(t, 'HH:00'),
      total: base,
      human: Math.floor(base * 0.8),
      bot: Math.floor(base * 0.12),
      fraud: Math.floor(base * 0.08),
    });
  }
  return data;
}

function generateMockGeoData() {
  return [
    { country: 'ID', country_name: 'Indonesia', visitors: 15832, bots: 1243, fraud: 423, bot_rate: 7.8 },
    { country: 'US', country_name: 'United States', visitors: 8943, bots: 1893, fraud: 287, bot_rate: 21.2 },
    { country: 'SG', country_name: 'Singapore', visitors: 4821, bots: 654, fraud: 132, bot_rate: 13.6 },
    { country: 'MY', country_name: 'Malaysia', visitors: 3654, bots: 432, fraud: 98, bot_rate: 11.8 },
    { country: 'AU', country_name: 'Australia', visitors: 2987, bots: 231, fraud: 67, bot_rate: 7.7 },
    { country: 'GB', country_name: 'United Kingdom', visitors: 2341, bots: 298, fraud: 54, bot_rate: 12.7 },
    { country: 'DE', country_name: 'Germany', visitors: 1876, bots: 143, fraud: 38, bot_rate: 7.6 },
    { country: 'IN', country_name: 'India', visitors: 1654, bots: 432, fraud: 124, bot_rate: 26.1 },
    { country: 'JP', country_name: 'Japan', visitors: 1243, bots: 87, fraud: 23, bot_rate: 7.0 },
    { country: 'BR', country_name: 'Brazil', visitors: 987, bots: 198, fraud: 67, bot_rate: 20.1 },
  ];
}

function generateMockDeviceData() {
  return {
    devices: [
      { type: 'Desktop', count: 22431, percentage: 46.4 },
      { type: 'Mobile', count: 21784, percentage: 45.0 },
      { type: 'Tablet', count: 4177, percentage: 8.6 },
    ],
    browsers: [
      { name: 'Chrome', count: 28943, percentage: 59.8 },
      { name: 'Safari', count: 9432, percentage: 19.5 },
      { name: 'Firefox', count: 4321, percentage: 8.9 },
      { name: 'Edge', count: 3241, percentage: 6.7 },
      { name: 'Other', count: 2455, percentage: 5.1 },
    ],
    os: [
      { name: 'Windows', count: 19843, percentage: 41.0 },
      { name: 'Android', count: 14321, percentage: 29.6 },
      { name: 'iOS', count: 8954, percentage: 18.5 },
      { name: 'macOS', count: 4321, percentage: 8.9 },
      { name: 'Linux', count: 953, percentage: 2.0 },
    ]
  };
}

function generateMockLiveVisitors() {
  const countries = ['ID', 'US', 'SG', 'MY', 'AU', 'GB', 'DE', 'JP'];
  const devices = ['Desktop', 'Mobile', 'Tablet'];
  const pages = ['/', '/about', '/products', '/pricing', '/contact', '/blog', '/checkout'];
  const sources = ['google', 'facebook', 'direct', 'email', 'instagram', 'twitter'];

  return Array.from({ length: 35 }, (_, i) => ({
    session_id: `sess_${i}_${Date.now()}`,
    visitor_id: `vis_${Math.random().toString(36).substr(2, 8)}`,
    ip_address: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
    country: countries[Math.floor(Math.random() * countries.length)],
    device_type: devices[Math.floor(Math.random() * devices.length)],
    current_page: pages[Math.floor(Math.random() * pages.length)],
    source: sources[Math.floor(Math.random() * sources.length)],
    human_score: Math.floor(Math.random() * 60) + 40,
    bot_score: Math.floor(Math.random() * 35),
    click_quality_score: Math.floor(Math.random() * 50) + 50,
    is_bot: Math.random() < 0.15,
    is_fraud: Math.random() < 0.1,
    time_on_page_ms: Math.floor(Math.random() * 180000),
    started_at: subHours(new Date(), Math.random()).toISOString()
  }));
}

function generateMockSessions(limit = 50) {
  const countries = ['ID', 'US', 'SG', 'MY', 'AU'];
  const devices = ['Desktop', 'Mobile', 'Tablet'];
  return Array.from({ length: limit }, (_, i) => ({
    session_id: `sess_${i}_mock`,
    visitor_id: `vis_${Math.random().toString(36).substr(2, 8)}`,
    ip_address: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
    country: countries[Math.floor(Math.random() * countries.length)],
    device_type: devices[Math.floor(Math.random() * devices.length)],
    page_count: Math.floor(Math.random() * 8) + 1,
    click_count: Math.floor(Math.random() * 20),
    duration_ms: Math.floor(Math.random() * 300000),
    scroll_max_depth: Math.floor(Math.random() * 100),
    human_score: Math.floor(Math.random() * 60) + 40,
    bot_score: Math.floor(Math.random() * 35),
    is_bot: Math.random() < 0.15,
    is_fraud: Math.random() < 0.1,
    start_time: subHours(new Date(), Math.random() * 24).toISOString(),
  }));
}

function generateMockFraudEvents(limit = 30) {
  const fraudTypes = ['Repeated IP Click', 'Click Farm', 'VPN/Proxy Abuse', 'Rapid Repeat Visit', 'Campaign Abuse', 'Fake Conversion'];
  return Array.from({ length: limit }, (_, i) => ({
    event_id: `fraud_${i}`,
    ip_address: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.1`,
    visitor_id: `vis_${Math.random().toString(36).substr(2, 8)}`,
    fraud_type: fraudTypes[Math.floor(Math.random() * fraudTypes.length)],
    fraud_score: Math.floor(Math.random() * 40) + 60,
    click_count: Math.floor(Math.random() * 100) + 10,
    country: ['ID', 'CN', 'RU', 'IN', 'BR'][Math.floor(Math.random() * 5)],
    is_vpn: Math.random() < 0.4,
    is_proxy: Math.random() < 0.3,
    is_tor: Math.random() < 0.1,
    detected_at: subHours(new Date(), Math.random() * 6).toISOString(),
    severity: Math.random() < 0.3 ? 'CRITICAL' : Math.random() < 0.5 ? 'HIGH' : 'MEDIUM',
  }));
}

function generateMockBotEvents(limit = 25) {
  const botTypes = ['Headless Chrome', 'Selenium', 'Puppeteer', 'GPTBot', 'ClaudeBot', 'GoogleBot', 'Scrapy', 'Python-requests'];
  return Array.from({ length: limit }, (_, i) => ({
    event_id: `bot_${i}`,
    ip_address: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.1`,
    visitor_id: `bot_${Math.random().toString(36).substr(2, 8)}`,
    bot_type: botTypes[Math.floor(Math.random() * botTypes.length)],
    bot_score: Math.floor(Math.random() * 30) + 70,
    detection_flags: ['BOT_USER_AGENT', 'NO_MOUSE_MOVEMENT', 'INSTANT_BOUNCE'].slice(0, Math.floor(Math.random() * 3) + 1).join(', '),
    country: ['US', 'DE', 'NL', 'SG', 'GB'][Math.floor(Math.random() * 5)],
    is_datacenter: Math.random() < 0.7,
    request_count: Math.floor(Math.random() * 500) + 50,
    detected_at: subHours(new Date(), Math.random() * 12).toISOString(),
  }));
}

function generateMockCampaignData() {
  return [
    { utm_source: 'google', utm_medium: 'cpc', utm_campaign: 'brand_id', visitors: 8432, fraud_clicks: 234, bot_rate: 2.8, conversion_rate: 4.2, quality_score: 87 },
    { utm_source: 'facebook', utm_medium: 'cpm', utm_campaign: 'awareness_q4', visitors: 5823, fraud_clicks: 891, bot_rate: 15.3, conversion_rate: 1.8, quality_score: 54 },
    { utm_source: 'instagram', utm_medium: 'cpc', utm_campaign: 'product_promo', visitors: 4321, fraud_clicks: 432, bot_rate: 10.0, conversion_rate: 2.9, quality_score: 68 },
    { utm_source: 'google', utm_medium: 'cpc', utm_campaign: 'competitor_kw', visitors: 3219, fraud_clicks: 1243, bot_rate: 38.6, conversion_rate: 0.8, quality_score: 31 },
    { utm_source: 'email', utm_medium: 'email', utm_campaign: 'newsletter_aug', visitors: 2987, fraud_clicks: 43, bot_rate: 1.4, conversion_rate: 6.8, quality_score: 94 },
    { utm_source: 'tiktok', utm_medium: 'cpm', utm_campaign: 'viral_content', visitors: 2341, fraud_clicks: 567, bot_rate: 24.2, conversion_rate: 1.2, quality_score: 45 },
  ];
}

function generateMockAlerts() {
  const types = ['BOT_SPIKE', 'FRAUD_SPIKE', 'BOUNCE_SPIKE', 'TRAFFIC_SPIKE'];
  const severities = ['CRITICAL', 'HIGH', 'MEDIUM'];
  return Array.from({ length: 8 }, (_, i) => ({
    id: `alert_${i}`,
    type: types[Math.floor(Math.random() * types.length)],
    severity: severities[Math.floor(Math.random() * severities.length)],
    message: [
      'Bot traffic spiked 340% in the last 5 minutes',
      'Fraud click rate exceeded 25% threshold',
      'Suspicious traffic from AS16509 (AWS) detected',
      'Bounce rate jumped to 78% from campaign source',
      'Click farm activity detected — 50+ clicks from single IP',
    ][Math.floor(Math.random() * 5)],
    value: Math.floor(Math.random() * 100) + 50,
    threshold: 30,
    created_at: subHours(new Date(), Math.random() * 2).toISOString(),
    acknowledged: Math.random() < 0.3,
  }));
}

module.exports = {
  generateMockDashboardSummary,
  generateMockTimeseriesData,
  generateMockGeoData,
  generateMockDeviceData,
  generateMockLiveVisitors,
  generateMockSessions,
  generateMockFraudEvents,
  generateMockBotEvents,
  generateMockCampaignData,
  generateMockAlerts,
};
