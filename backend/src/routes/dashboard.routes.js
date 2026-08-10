'use strict';

const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const mock = require('../utils/mockData');

/**
 * @swagger
 * /api/dashboard/summary:
 *   get:
 *     summary: Get dashboard KPI summary
 *     tags: [Dashboard]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: site_id
 *         schema: { type: string }
 *       - in: query
 *         name: period
 *         schema: { type: string, enum: [1h, 6h, 24h, 7d, 30d] }
 */
router.get('/summary', authenticate, async (req, res, next) => {
  try {
    // TODO: Replace with real ClickHouse query when data flows
    const data = mock.generateMockDashboardSummary();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

router.get('/timeseries', authenticate, async (req, res, next) => {
  try {
    const hours = req.query.period === '7d' ? 168 : req.query.period === '6h' ? 6 : 24;
    const data = mock.generateMockTimeseriesData(hours);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

router.get('/alerts', authenticate, async (req, res, next) => {
  try {
    const data = mock.generateMockAlerts();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
