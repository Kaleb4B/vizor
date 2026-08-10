'use strict';

const router = require('express').Router();
const { authenticateApiKey } = require('../middleware/auth');
const { scoreEvent } = require('../services/scoring.service');
const { publishEvent } = require('../config/kafka');
const { AppError } = require('../middleware/errorHandler');
const { v4: uuidv4 } = require('uuid');

/**
 * @swagger
 * /api/events:
 *   post:
 *     summary: Ingest click/tracking events from SDK
 *     tags: [Events]
 */
router.post('/', authenticateApiKey, async (req, res, next) => {
  try {
    const { events } = req.body;
    if (!Array.isArray(events) || events.length === 0) {
      throw new AppError('events array is required', 400);
    }
    if (events.length > 500) {
      throw new AppError('Max 500 events per batch', 400);
    }

    // Score each event in real-time (rule-based, sub-50ms)
    const scored = events.map(ev => {
      const scores = scoreEvent(ev);
      return {
        event_id: uuidv4(),
        site_id: ev.site_id || req.headers['x-site-id'],
        session_id: ev.session_id,
        visitor_id: ev.visitor_id,
        event_type: ev.event_type || 'pageview',
        timestamp: ev.timestamp || new Date().toISOString(),
        ...ev,
        ...scores,
      };
    });

    // Publish to Kafka & direct insert to ClickHouse
    const { insertEvents } = require('../config/clickhouse');
    insertEvents(scored).catch(() => {});
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
        is_bot: e.is_bot,
        is_fraud: e.is_fraud
      }))
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
