'use strict';

const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const { getDashboardSummary, getTimeseriesData } = require('../services/clickhouse.service');

router.get('/summary', authenticate, async (req, res, next) => {
  try {
    const period = req.query.period || '24h';
    const siteId = req.query.site_id || 'site-001';
    const data = await getDashboardSummary(siteId, period);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

router.get('/timeseries', authenticate, async (req, res, next) => {
  try {
    const hours = req.query.period === '7d' ? 168 : req.query.period === '6h' ? 6 : 24;
    const data = await getTimeseriesData(hours);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

router.get('/alerts', authenticate, async (req, res, next) => {
  try {
    res.json({ success: true, data: [] });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
