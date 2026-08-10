'use strict';
const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const mock = require('../utils/mockData');

router.get('/', authenticate, async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 30;
    const data = mock.generateMockFraudEvents(limit);
    res.json({ success: true, data, total: data.length });
  } catch (err) { next(err); }
});

module.exports = router;
