'use strict';

const { Server } = require('socket.io');
const { logger } = require('./logger');
const { verifyToken } = require('../middleware/auth');

let io;

function initSocket(server) {
  io = new Server(server, {
    cors: {
      origin: process.env.CORS_ORIGIN || '*',
      methods: ['GET', 'POST']
    }
  });

  // Auth middleware for socket connections
  io.use(async (socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) {
      // Allow anonymous for public dashboard views
      return next();
    }
    try {
      const user = verifyToken(token);
      socket.user = user;
      next();
    } catch {
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket) => {
    logger.debug(`Socket connected: ${socket.id}`);

    socket.on('subscribe_site', (siteId) => {
      socket.join(`site:${siteId}`);
      logger.debug(`Socket ${socket.id} subscribed to site:${siteId}`);
    });

    socket.on('unsubscribe_site', (siteId) => {
      socket.leave(`site:${siteId}`);
    });

    socket.on('disconnect', () => {
      logger.debug(`Socket disconnected: ${socket.id}`);
    });
  });

  // Start emitting mock realtime data for demo mode
  if (process.env.NODE_ENV === 'development') {
    startMockRealtime();
  }

  return io;
}

function getIO() {
  return io;
}

// Emit to all subscribers of a site
function emitToSite(siteId, event, data) {
  if (!io) return;
  io.to(`site:${siteId}`).emit(event, data);
}

// Emit alert
function emitAlert(siteId, alert) {
  emitToSite(siteId, 'alert', alert);
}

// Mock realtime data for development/demo
function startMockRealtime() {
  const mockSiteId = 'demo-site';
  const countries = ['ID', 'US', 'SG', 'MY', 'AU', 'GB', 'DE', 'JP', 'IN', 'BR'];
  const devices = ['Desktop', 'Mobile', 'Tablet'];
  const pages = ['/', '/about', '/products', '/pricing', '/contact', '/blog'];
  const sources = ['google', 'facebook', 'direct', 'email', 'twitter'];

  setInterval(() => {
    if (!io) return;

    // New visitor event
    const visitor = {
      session_id: `sess_${Date.now()}`,
      visitor_id: `vis_${Math.random().toString(36).substr(2, 9)}`,
      country: countries[Math.floor(Math.random() * countries.length)],
      device: devices[Math.floor(Math.random() * devices.length)],
      page: pages[Math.floor(Math.random() * pages.length)],
      source: sources[Math.floor(Math.random() * sources.length)],
      human_score: Math.floor(Math.random() * 60) + 40,
      bot_score: Math.floor(Math.random() * 30),
      is_bot: Math.random() < 0.15,
      is_fraud: Math.random() < 0.1,
      timestamp: new Date().toISOString()
    };

    emitToSite(mockSiteId, 'visitor:new', visitor);

    // Stats update
    const stats = {
      total_visitors: Math.floor(Math.random() * 1000) + 500,
      live_visitors: Math.floor(Math.random() * 50) + 10,
      bot_visitors: Math.floor(Math.random() * 100) + 20,
      fraud_clicks: Math.floor(Math.random() * 50) + 5,
      bounce_rate: (Math.random() * 30 + 30).toFixed(1),
      avg_session: (Math.random() * 180 + 60).toFixed(0),
      conversion_rate: (Math.random() * 5 + 1).toFixed(2)
    };

    emitToSite(mockSiteId, 'stats:update', stats);
  }, 3000);
}

module.exports = { initSocket, getIO, emitToSite, emitAlert };
