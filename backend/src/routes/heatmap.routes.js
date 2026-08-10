'use strict';

const router = require('express').Router();
const { authenticateApiKey } = require('../middleware/auth');
const { getHeatmapData } = require('../services/clickhouse.service');
const mock = require('../utils/mockData');

router.get('/', async (req, res, next) => {
  try {
    const realData = await getHeatmapData();
    const data = realData.points?.length > 0 ? realData : mock.generateHeatmapData();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
