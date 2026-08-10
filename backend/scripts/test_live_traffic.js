'use strict';

const http = require('http');

const testEvents = [
  // 1. Human Visitor from Indonesia
  {
    site_id: 'site-001',
    session_id: 'sess_id_human_881',
    visitor_id: 'vis_id_human_01',
    event_type: 'pageview',
    timestamp: new Date().toISOString(),
    page_url: 'https://taneko.co.id/',
    referrer: 'https://google.com',
    ip_address: '180.252.12.98',
    user_agent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1',
    browser: 'Safari',
    os: 'iOS',
    device_type: 'Mobile',
    country: 'ID',
    city: 'Jakarta',
    x_coord: 420,
    y_coord: 680,
    viewport_width: 390,
    viewport_height: 844,
    scroll_depth: 85,
    time_on_page_ms: 45000,
    behavior_signals: { mouse_movement_count: 142, rage_click_count: 0, webdriver_detected: false },
    human_score: 95,
    bot_score: 5,
    is_bot: 0,
    is_fraud: 0,
  },
  // 2. Human Click Event on CTA Button
  {
    site_id: 'site-001',
    session_id: 'sess_id_human_881',
    visitor_id: 'vis_id_human_01',
    event_type: 'click',
    timestamp: new Date().toISOString(),
    page_url: 'https://taneko.co.id/checkout',
    ip_address: '180.252.12.98',
    browser: 'Safari',
    os: 'iOS',
    device_type: 'Mobile',
    country: 'ID',
    city: 'Jakarta',
    x_coord: 450,
    y_coord: 320,
    human_score: 92,
    bot_score: 8,
    is_bot: 0,
    is_fraud: 0,
  },
  // 3. Headless Chrome Bot (Puppeteer CDP)
  {
    site_id: 'site-001',
    session_id: 'sess_bot_puppeteer_02',
    visitor_id: 'vis_bot_02',
    event_type: 'pageview',
    timestamp: new Date().toISOString(),
    page_url: 'https://taneko.co.id/',
    ip_address: '45.142.214.88',
    user_agent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/122.0.0.0 Safari/537.36',
    browser: 'Chrome',
    os: 'Linux',
    device_type: 'Desktop',
    country: 'US',
    city: 'Chicago',
    bot_type: 'Headless Chrome / Puppeteer',
    anomaly_reason: 'navigator.webdriver = true, Linear Mouse Path',
    is_datacenter: 1,
    behavior_signals: { mouse_movement_count: 0, rage_click_count: 0, webdriver_detected: true },
    human_score: 12,
    bot_score: 88,
    is_bot: 1,
    is_fraud: 0,
  },
  // 4. Click Farm Attack (VPN / Proxy Fraud)
  {
    site_id: 'site-001',
    session_id: 'sess_fraud_farm_03',
    visitor_id: 'vis_fraud_03',
    event_type: 'click',
    timestamp: new Date().toISOString(),
    page_url: 'https://taneko.co.id/promo',
    ip_address: '185.220.101.4',
    country: 'RU',
    city: 'Moscow',
    browser: 'Chrome',
    os: 'Windows',
    device_type: 'Desktop',
    fraud_reason: 'Click Farm Burst & Known Tor/VPN Node',
    is_vpn: 1,
    is_proxy: 1,
    is_tor: 1,
    human_score: 5,
    bot_score: 95,
    is_bot: 1,
    is_fraud: 1,
  }
];

const postData = JSON.stringify({ events: testEvents });

const req = http.request({
  hostname: '127.0.0.1',
  port: 4000,
  path: '/api/events',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': 'site-001',
    'Content-Length': Buffer.byteLength(postData)
  }
}, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    console.log('✅ Ingestion Response:', res.statusCode, JSON.parse(body));
  });
});

req.on('error', (e) => {
  console.error('❌ Request error:', e.message);
});

req.write(postData);
req.end();
