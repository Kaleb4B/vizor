'use strict';

require('dotenv').config();
const app = require('./app');
const { logger } = require('./config/logger');
const { connectKafka, disconnectKafka } = require('./config/kafka');
const { connectRedis } = require('./config/redis');
const { initClickHouse } = require('./config/clickhouse');

const PORT = process.env.PORT || 4000;

async function bootstrap() {
  try {
    logger.info('🚀 Starting Vizor API Server...');

    // Connect infrastructure
    await connectRedis();
    logger.info('✅ Redis connected');

    await initClickHouse();
    logger.info('✅ ClickHouse connected');

    await connectKafka();
    logger.info('✅ Kafka connected');

    // Start HTTP server
    const server = app.listen(PORT, () => {
      logger.info(`✅ Vizor API Server running on port ${PORT}`);
      logger.info(`📚 Swagger UI: http://localhost:${PORT}/api/docs`);
      logger.info(`🔧 Environment: ${process.env.NODE_ENV}`);
    });

    // Socket.io attach
    const { initSocket } = require('./config/socket');
    initSocket(server);
    logger.info('✅ Socket.io initialized');

    // Graceful shutdown
    const shutdown = async (signal) => {
      logger.info(`${signal} received. Shutting down gracefully...`);
      server.close(async () => {
        await disconnectKafka();
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

  } catch (err) {
    logger.error('Fatal error during startup:', err);
    process.exit(1);
  }
}

bootstrap();
