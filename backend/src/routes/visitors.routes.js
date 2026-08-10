'use strict';

const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const { getLiveVisitors } = require('../services/clickhouse.service');
const mock = require('../utils/mockData');

router.get('/', authenticate, async (req, res, next) => {
  try {
    const realData = await getLiveVisitors();
    const data = realData.length > 0 ? realData : mock.generateMockLiveVisitors();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
