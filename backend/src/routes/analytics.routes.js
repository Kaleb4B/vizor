'use strict';
const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const mock = require('../utils/mockData');

// GET /api/analytics — full analytics bundle
router.get('/', authenticate, async (req, res, next) => {
  try {
    const data = {
      geo: mock.generateMockGeoData(),
      device: mock.generateMockDeviceData(),
      campaign: mock.generateMockCampaignData(),
    };
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

// GET /api/analytics/geo — geo breakdown
router.get('/geo', authenticate, async (req, res, next) => {
  try {
    const data = mock.generateMockGeoData();
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

// GET /api/analytics/device — device, browser, OS breakdown
router.get('/device', authenticate, async (req, res, next) => {
  try {
    const data = mock.generateMockDeviceData();
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

// GET /api/analytics/campaign — UTM campaign performance
router.get('/campaign', authenticate, async (req, res, next) => {
  try {
    const data = mock.generateMockCampaignData();
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

module.exports = router;
