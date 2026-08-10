'use strict';
const router = require('express').Router();
const { authenticate } = require('../middleware/auth');

// Generate heatmap click data
function generateHeatmapData() {
  const points = [];
  // Simulate clustered click patterns
  const hotspots = [
    { cx: 0.3, cy: 0.15 }, // top nav area
    { cx: 0.5, cy: 0.4 },  // hero / CTA area
    { cx: 0.7, cy: 0.65 }, // product area
    { cx: 0.25, cy: 0.8 }, // footer links
  ];

  hotspots.forEach(hs => {
    const count = Math.floor(Math.random() * 80) + 40;
    for (let i = 0; i < count; i++) {
      points.push({
        x: Math.max(0, Math.min(1, hs.cx + (Math.random() - 0.5) * 0.2)),
        y: Math.max(0, Math.min(1, hs.cy + (Math.random() - 0.5) * 0.2)),
        value: Math.random() * 0.8 + 0.2,
        is_bot: Math.random() < 0.12,
      });
    }
  });

  // Scatter noise
  for (let i = 0; i < 30; i++) {
    points.push({
      x: Math.random(),
      y: Math.random(),
      value: Math.random() * 0.3,
      is_bot: Math.random() < 0.3,
    });
  }

  return {
    points,
    total_clicks: points.length,
    human_clicks: points.filter(p => !p.is_bot).length,
    bot_clicks: points.filter(p => p.is_bot).length,
    top_element: '#cta-button',
    generated_at: new Date().toISOString(),
  };
}

router.get('/', authenticate, async (req, res, next) => {
  try {
    const data = generateHeatmapData();
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

module.exports = router;
