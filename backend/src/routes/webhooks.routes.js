'use strict';
const router = require('express').Router();
const { authenticate } = require('../middleware/auth');

function getMockWebhooks() {
  return [
    {
      id: 'wh-001',
      name: 'Slack Bot Alert',
      url: 'https://hooks.slack.com/services/T0123/B0456/xxxx',
      events: ['BOT_SPIKE', 'FRAUD_SPIKE', 'DDOS_DETECTED'],
      isActive: true,
      lastTriggered: new Date(Date.now() - 3600000).toISOString(),
      failCount: 0,
    },
    {
      id: 'wh-002',
      name: 'Telegram Notification',
      url: 'https://api.telegram.org/bot123456:TOKEN/sendMessage',
      events: ['FRAUD_SPIKE', 'CONVERSION_DROP'],
      isActive: false,
      lastTriggered: new Date(Date.now() - 86400000).toISOString(),
      failCount: 2,
    }
  ];
}

router.get('/', authenticate, async (req, res, next) => {
  try {
    const data = getMockWebhooks();
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

router.post('/', authenticate, async (req, res, next) => {
  try {
    const { name, url, events } = req.body;
    if (!name || !url) return res.status(400).json({ success: false, error: 'Name and URL required' });
    const newWebhook = {
      id: `wh-${Date.now()}`,
      name,
      url,
      events: events || [],
      isActive: true,
      lastTriggered: null,
      failCount: 0,
    };
    res.status(201).json({ success: true, data: newWebhook });
  } catch (err) { next(err); }
});

router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    res.json({ success: true, message: `Webhook ${req.params.id} deleted` });
  } catch (err) { next(err); }
});

module.exports = router;
