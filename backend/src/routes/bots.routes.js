'use strict';

const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const { getBotEvents } = require('../services/clickhouse.service');

router.get('/', authenticate, async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 25;
    const data = await getBotEvents(limit);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
