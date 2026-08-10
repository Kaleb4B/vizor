'use strict';
const router = require('express').Router();
const { authenticate } = require('../middleware/auth');

// Mock sites from database
function getMockSites(userId) {
  return [
    {
      id: 'site-001',
      name: 'Taneko Official Store',
      domain: 'taneko.co.id',
      apiKey: 'vz_live_tk8f3b2d91a4e7c6f5',
      plan: 'PRO',
      isActive: true,
      createdAt: '2025-01-15T00:00:00Z',
      stats: { total_visitors: 48392, bot_rate: 13.0 }
    },
    {
      id: 'site-002',
      name: 'Landing Page Lead Gen',
      domain: 'promo.taneko.co.id',
      apiKey: 'vz_live_lp9c4d3e82b5f7a1',
      plan: 'STARTER',
      isActive: true,
      createdAt: '2025-03-10T00:00:00Z',
      stats: { total_visitors: 12834, bot_rate: 8.4 }
    }
  ];
}

router.get('/', authenticate, async (req, res, next) => {
  try {
    const data = getMockSites(req.user.id);
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

router.post('/', authenticate, async (req, res, next) => {
  try {
    const { name, domain } = req.body;
    if (!name || !domain) return next(new (require('../middleware/errorHandler').AppError)('Name and domain required', 400));

    const newSite = {
      id: `site-${Date.now()}`,
      name,
      domain,
      apiKey: `vz_live_${Math.random().toString(36).substr(2, 16)}`,
      plan: 'FREE',
      isActive: true,
      createdAt: new Date().toISOString(),
      stats: { total_visitors: 0, bot_rate: 0 }
    };
    res.status(201).json({ success: true, data: newSite });
  } catch (err) { next(err); }
});

module.exports = router;
