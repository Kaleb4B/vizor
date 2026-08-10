'use strict';
const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const mock = require('../utils/mockData');

router.get('/', authenticate, async (req, res, next) => {
  try {
    const data = mock.generateMockLiveVisitors();
    res.json({ success: true, data, count: data.length });
  } catch (err) { next(err); }
});

module.exports = router;
