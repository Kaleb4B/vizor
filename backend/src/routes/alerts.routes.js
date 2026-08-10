'use strict';
const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const mock = require('../utils/mockData');

router.get('/', authenticate, async (req, res, next) => {
  try {
    const data = mock.generateMockAlerts();
    res.json({ success: true, data, unread: data.filter(a => !a.acknowledged).length });
  } catch (err) { next(err); }
});

// PATCH /:id/acknowledge
router.patch('/:id/acknowledge', authenticate, async (req, res, next) => {
  try {
    res.json({ success: true, message: 'Alert acknowledged' });
  } catch (err) { next(err); }
});

module.exports = router;
