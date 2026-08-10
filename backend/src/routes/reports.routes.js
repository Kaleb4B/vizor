'use strict';
const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const mock = require('../utils/mockData');

router.get('/', authenticate, async (req, res, next) => {
  try {
    const summary = mock.generateMockDashboardSummary();
    const geo = mock.generateMockGeoData();
    const campaign = mock.generateMockCampaignData();
    const fraudEvents = mock.generateMockFraudEvents(10);

    const data = {
      summary,
      geo_top5: geo.slice(0, 5),
      campaign_top5: campaign.slice(0, 5),
      recent_fraud: fraudEvents.slice(0, 5),
      period: req.query.period || '24h',
      generated_at: new Date().toISOString(),
    };
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

module.exports = router;
