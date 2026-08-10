'use strict';

const router = require('express').Router();
const { authenticateApiKey } = require('../middleware/auth');
const { scoreEvent } = require('../services/scoring.service');
const { publishEvent } = require('../config/kafka');
const { insertEvents } = require('../config/clickhouse');
const { AppError } = require('../middleware/errorHandler');
const { v4: uuidv4 } = require('uuid');

router.post('/', authenticateApiKey, async (req, res, next) => {
  try {
    const { events } = req.body;
    if (!Array.isArray(events) || events.length === 0) {
      throw new AppError('events array is required', 400);
    }
    if (events.length > 500) {
      throw new AppError('Max 500 events per batch', 400);
    }

    const siteIdHeader = req.headers['x-site-id'] || 'site-001';

    const scored = events.map(ev => {
      const scores = scoreEvent(ev);
      const isBot = ev.is_bot !== undefined ? (ev.is_bot ? 1 : 0) : (scores.is_bot ? 1 : 0);
      const isFraud = ev.is_fraud !== undefined ? (ev.is_fraud ? 1 : 0) : (scores.is_fraud ? 1 : 0);

      return {
        event_id: uuidv4(),
        site_id: ev.site_id || siteIdHeader,
        session_id: ev.session_id || `sess_${Date.now()}`,
        visitor_id: ev.visitor_id || `vis_${Date.now()}`,
        event_type: ev.event_type || 'pageview',
        timestamp: (ev.timestamp ? new Date(ev.timestamp) : new Date()).toISOString().replace('Z', ''),
        page_url: ev.page_url || ev.url || '/',
        referrer: ev.referrer || '',
        ip_address: ev.ip_address || '127.0.0.1',
        user_agent: ev.user_agent || '',
        browser: ev.browser || 'Chrome',
        os: ev.os || 'Windows',
        device_type: ev.device_type || 'Desktop',
        country: ev.country || 'ID',
        city: ev.city || 'Jakarta',
        x_coord: Number(ev.x_coord || ev.x || 0),
        y_coord: Number(ev.y_coord || ev.y || 0),
        scroll_depth: Number(ev.scroll_depth || 0),
        time_on_page_ms: Number(ev.time_on_page_ms || 10000),
        utm_source: ev.utm_source || ev.source || 'direct',
        utm_medium: ev.utm_medium || 'cpc',
        utm_campaign: ev.utm_campaign || 'brand_campaign',
        fraud_reason: ev.fraud_reason || (isFraud ? 'Click Farm Burst & VPN' : ''),
        anomaly_reason: ev.anomaly_reason || (isBot ? 'Headless CDP Automation' : ''),
        bot_type: ev.bot_type || (isBot ? 'Headless Browser' : ''),
        is_vpn: ev.is_vpn ? 1 : 0,
        is_proxy: ev.is_proxy ? 1 : 0,
        is_tor: ev.is_tor ? 1 : 0,
        is_datacenter: ev.is_datacenter ? 1 : 0,
        is_bot: isBot,
        is_fraud: isFraud,
        human_score: Number(ev.human_score !== undefined ? ev.human_score : scores.human_score),
        bot_score: Number(ev.bot_score !== undefined ? ev.bot_score : scores.bot_score),
        click_quality_score: Number(scores.human_score),
      };
    });

    // Direct insert to ClickHouse & publish to Kafka
    await insertEvents(scored).catch(err => console.error('[ClickHouse Insert Error]:', err));
    for (const ev of scored) {
      await publishEvent(ev).catch(() => {});
    }

    res.status(202).json({
      success: true,
      accepted: scored.length,
      scores: scored.map(e => ({
        session_id: e.session_id,
        bot_score: e.bot_score,
        human_score: e.human_score,
        is_bot: Boolean(e.is_bot),
        is_fraud: Boolean(e.is_fraud)
      }))
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
