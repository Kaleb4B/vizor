'use strict';

const { logger } = require('../../config/logger');
const { emitToSite, emitAlert } = require('../../config/socket');
const { setLiveVisitor, setSessionState } = require('../../config/redis');

async function realtimeConsumer(kafka) {
  const consumer = kafka.consumer({ groupId: process.env.KAFKA_GROUP_REALTIME || 'vizor.group.realtime' });
  await consumer.connect();
  await consumer.subscribe({ topic: process.env.KAFKA_TOPIC_EVENTS || 'vizor.click_events', fromBeginning: false });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      try {
        const event = JSON.parse(message.value.toString());
        const { site_id, session_id, is_bot, is_fraud, bot_score, human_score } = event;

        // Update live visitor state in Redis
        if (site_id && session_id) {
          await setLiveVisitor(site_id, session_id);
          await setSessionState(session_id, {
            last_seen: new Date().toISOString(),
            bot_score,
            human_score,
            is_bot,
            is_fraud
          });
        }

        // Push real-time event via Socket.io
        emitToSite(site_id, 'visitor:activity', event);

        // Real-time alert triggers
        if (is_fraud || bot_score > 80) {
          emitAlert(site_id, {
            id: `alert_${Date.now()}`,
            type: is_fraud ? 'FRAUD_DETECTED' : 'HIGH_BOT_SCORE',
            severity: is_fraud ? 'CRITICAL' : 'HIGH',
            message: `Suspicious activity from IP ${event.ip_address} (Bot Score: ${bot_score})`,
            timestamp: new Date().toISOString()
          });
        }

      } catch (err) {
        logger.error('Error in realtime consumer:', err);
      }
    }
  });

  return consumer;
}

module.exports = { realtimeConsumer };
