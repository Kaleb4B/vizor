'use strict';

const { logger } = require('../../config/logger');
const { insertEvents } = require('../../config/clickhouse');

async function analyticsConsumer(kafka) {
  const consumer = kafka.consumer({ groupId: process.env.KAFKA_GROUP_ANALYTICS || 'vizor.group.analytics' });
  await consumer.connect();
  await consumer.subscribe({ topic: process.env.KAFKA_TOPIC_EVENTS || 'vizor.click_events', fromBeginning: false });

  let batch = [];
  const BATCH_SIZE = 100;
  const FLUSH_INTERVAL_MS = 5000;

  async function flushBatch() {
    if (batch.length === 0) return;
    const toFlush = [...batch];
    batch = [];
    try {
      await insertEvents(toFlush);
      logger.debug(`Flushed ${toFlush.length} events to ClickHouse`);
    } catch (err) {
      logger.error('Failed to flush events to ClickHouse:', err);
    }
  }

  setInterval(flushBatch, FLUSH_INTERVAL_MS);

  await consumer.run({
    eachMessage: async ({ message }) => {
      try {
        const event = JSON.parse(message.value.toString());
        batch.push(event);
        if (batch.length >= BATCH_SIZE) {
          await flushBatch();
        }
      } catch (err) {
        logger.error('Error in analytics consumer:', err);
      }
    }
  });

  return consumer;
}

module.exports = { analyticsConsumer };
