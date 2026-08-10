'use strict';

const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const { getGeoData, getDeviceData, getCampaignData } = require('../services/clickhouse.service');

router.get('/', authenticate, async (req, res, next) => {
  try {
    const geo = await getGeoData();
    const device = await getDeviceData();
    const campaign = await getCampaignData();
    res.json({
      success: true,
      data: { geo, device, campaign }
    });
  } catch (err) {
    next(err);
  }
});

router.get('/geo', authenticate, async (req, res, next) => {
  try {
    const data = await getGeoData();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

router.get('/device', authenticate, async (req, res, next) => {
  try {
    const data = await getDeviceData();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

router.get('/campaign', authenticate, async (req, res, next) => {
  try {
    const data = await getCampaignData();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
