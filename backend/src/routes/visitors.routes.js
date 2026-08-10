'use strict';

const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const { getLiveVisitors } = require('../services/clickhouse.service');

router.get('/', authenticate, async (req, res, next) => {
  try {
    const data = await getLiveVisitors();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
