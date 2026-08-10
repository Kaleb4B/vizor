'use strict';

const router = require('express').Router();
const { getHeatmapData } = require('../services/clickhouse.service');

router.get('/', async (req, res, next) => {
  try {
    const data = await getHeatmapData();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
