'use strict';

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const { errorHandler } = require('./middleware/errorHandler');
const { logger } = require('./config/logger');

const app = express();

// ─── Security middleware ───────────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));

app.use(cors({
  origin: true, // Dynamically reflects request origin (e.g. https://taneko.co.id) to support credentials: true
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key', 'X-Site-Id'],
  credentials: true
}));

// ─── Rate limiting ─────────────────────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 60000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' }
});

const eventLimiter = rateLimit({
  windowMs: 1000,
  max: 100,
  message: { error: 'Event ingestion rate exceeded.' }
});

app.use(globalLimiter);

// ─── Body parser ───────────────────────────────────────────────────────────
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Request logging ───────────────────────────────────────────────────────
app.use(morgan('combined', {
  stream: { write: (msg) => logger.http(msg.trim()) }
}));

// ─── SDK Script Serving ───────────────────────────────────────────────────
app.get('/clickguard.js', (req, res) => {
  res.sendFile(require('path').join(__dirname, '../../sdk/clickguard.js'));
});

// ─── Health check ──────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'vizor-api', timestamp: new Date().toISOString() });
});

// ─── API Documentation ─────────────────────────────────────────────────────
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Vizor API Docs'
}));

// ─── Routes ────────────────────────────────────────────────────────────────
app.use('/api/events', eventLimiter, require('./routes/events.routes'));
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/dashboard', require('./routes/dashboard.routes'));
app.use('/api/visitors', require('./routes/visitors.routes'));
app.use('/api/sessions', require('./routes/sessions.routes'));
app.use('/api/fraud', require('./routes/fraud.routes'));
app.use('/api/bots', require('./routes/bots.routes'));
app.use('/api/analytics', require('./routes/analytics.routes'));
app.use('/api/heatmap', require('./routes/heatmap.routes'));
app.use('/api/sites', require('./routes/sites.routes'));
app.use('/api/alerts', require('./routes/alerts.routes'));
app.use('/api/webhooks', require('./routes/webhooks.routes'));
app.use('/api/reports', require('./routes/reports.routes'));

// ─── 404 handler ──────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.originalUrl} not found` });
});

// ─── Error handler ─────────────────────────────────────────────────────────
app.use(errorHandler);

module.exports = app;
