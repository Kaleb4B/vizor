'use strict';

const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const { getBotEvents } = require('../services/clickhouse.service');
const mock = require('../utils/mockData');

router.get('/', authenticate, async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 25;
    const realData = await getBotEvents(limit);
    const data = realData.length > 0 ? realData : mock.generateMockBotEvents();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
