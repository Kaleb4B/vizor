'use strict';

const { Kafka, Partitioners } = require('kafkajs');
const { logger } = require('./logger');

let kafka;
let producer;
let consumers = [];

const TOPICS = {
  EVENTS: process.env.KAFKA_TOPIC_EVENTS || 'vizor.click_events',
  EVENTS_DLQ: 'vizor.click_events.dlq'
};

function createKafkaInstance() {
  return new Kafka({
    clientId: process.env.KAFKA_CLIENT_ID || 'vizor-api',
    brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
    retry: {
      initialRetryTime: 300,
      retries: 8
    }
  });
}

async function connectKafka() {
  kafka = createKafkaInstance();

  // Create topics
  const admin = kafka.admin();
  await admin.connect();
  await admin.createTopics({
    waitForLeaders: true,
    topics: [
      {
        topic: TOPICS.EVENTS,
        numPartitions: 12,  // Partition by site_id hash
        replicationFactor: 1
      },
      {
        topic: TOPICS.EVENTS_DLQ,
        numPartitions: 1,
        replicationFactor: 1
      }
    ]
  }).catch(() => {}); // Topics may already exist
  await admin.disconnect();

  // Producer
  producer = kafka.producer({
    createPartitioner: Partitioners.LegacyPartitioner,
    allowAutoTopicCreation: true
  });
  await producer.connect();

  // Start consumer groups
  await startConsumers();
}

async function startConsumers() {
  const { realtimeConsumer } = require('../services/consumers/realtime.consumer');
  const { analyticsConsumer } = require('../services/consumers/analytics.consumer');

  await Promise.all([
    realtimeConsumer(kafka),
    analyticsConsumer(kafka)
  ]);
}

async function publishEvent(event) {
  if (!producer) throw new Error('Kafka producer not initialized');

  // Partition by site_id for isolation
  const key = event.site_id;

  await producer.send({
    topic: TOPICS.EVENTS,
    messages: [{ key, value: JSON.stringify(event) }]
  });
}

async function publishToDLQ(event, error) {
  if (!producer) return;
  await producer.send({
    topic: TOPICS.EVENTS_DLQ,
    messages: [{ value: JSON.stringify({ event, error: error.message, timestamp: new Date().toISOString() }) }]
  });
}

async function disconnectKafka() {
  if (producer) await producer.disconnect();
  for (const consumer of consumers) {
    await consumer.disconnect();
  }
}

module.exports = { connectKafka, disconnectKafka, publishEvent, publishToDLQ, TOPICS, kafka: () => kafka };
