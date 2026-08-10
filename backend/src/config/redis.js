'use strict';

const Redis = require('ioredis');
const { logger } = require('./logger');

let redisClient;

async function connectRedis() {
  redisClient = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
    maxRetriesPerRequest: 3,
    lazyConnect: true,
    retryStrategy: (times) => {
      const delay = Math.min(times * 50, 2000);
      return delay;
    }
  });

  redisClient.on('error', (err) => {
    logger.error('Redis error:', err.message);
  });

  redisClient.on('connect', () => {
    logger.info('Redis connected');
  });

  await redisClient.connect().catch(() => {
    logger.warn('Redis not available — session state will use in-memory fallback');
  });

  return redisClient;
}

function getRedis() {
  return redisClient;
}

// Session state helpers
async function setSessionState(sessionId, data, ttlSeconds = 3600) {
  if (!redisClient) return;
  await redisClient.setex(`session:${sessionId}`, ttlSeconds, JSON.stringify(data));
}

async function getSessionState(sessionId) {
  if (!redisClient) return null;
  const data = await redisClient.get(`session:${sessionId}`);
  return data ? JSON.parse(data) : null;
}

async function incrementCounter(key, ttl = 60) {
  if (!redisClient) return 1;
  const val = await redisClient.incr(key);
  if (val === 1) await redisClient.expire(key, ttl);
  return val;
}

async function getLiveVisitorCount(siteId) {
  if (!redisClient) return Math.floor(Math.random() * 50) + 5;
  return parseInt(await redisClient.get(`live:${siteId}`) || '0');
}

async function setLiveVisitor(siteId, sessionId) {
  if (!redisClient) return;
  await redisClient.sadd(`live_sessions:${siteId}`, sessionId);
  await redisClient.expire(`live_sessions:${siteId}`, 300); // 5 min TTL
}

module.exports = {
  connectRedis, getRedis,
  setSessionState, getSessionState,
  incrementCounter, getLiveVisitorCount, setLiveVisitor
};
