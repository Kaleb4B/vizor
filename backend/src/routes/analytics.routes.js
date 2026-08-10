'use strict';

const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const { getGeoData, getDeviceData, getCampaignData } = require('../services/clickhouse.service');
const mock = require('../utils/mockData');

router.get('/', authenticate, async (req, res, next) => {
  try {
    const geo = await getGeoData();
    const device = await getDeviceData();
    const campaign = await getCampaignData();
    res.json({
      success: true,
      data: {
        geo: geo.length > 0 ? geo : mock.generateMockGeoData(),
        device: device.devices?.length > 0 ? device : mock.generateMockDeviceData(),
        campaign: campaign.length > 0 ? campaign : mock.generateMockCampaignData(),
      }
    });
  } catch (err) {
    next(err);
  }
});

router.get('/geo', authenticate, async (req, res, next) => {
  try {
    const realData = await getGeoData();
    const data = realData.length > 0 ? realData : mock.generateMockGeoData();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

router.get('/device', authenticate, async (req, res, next) => {
  try {
    const realData = await getDeviceData();
    const data = realData.devices?.length > 0 ? realData : mock.generateMockDeviceData();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

router.get('/campaign', authenticate, async (req, res, next) => {
  try {
    const realData = await getCampaignData();
    const data = realData.length > 0 ? realData : mock.generateMockCampaignData();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
