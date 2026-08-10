'use strict';
const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const { getReportsSummary } = require('../services/clickhouse.service');

router.get('/', authenticate, async (req, res, next) => {
  try {
    const period = req.query.period || '24h';
    const data = await getReportsSummary(period);
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

module.exports = router;
