'use strict';

const { createClient } = require('@clickhouse/client');
const { logger } = require('./logger');

let clickhouseClient;

async function initClickHouse() {
  clickhouseClient = createClient({
    url: process.env.CLICKHOUSE_URL || 'http://localhost:8123',
    database: process.env.CLICKHOUSE_DB || 'vizor',
    username: process.env.CLICKHOUSE_USER || 'default',
    password: process.env.CLICKHOUSE_PASSWORD || '',
    clickhouse_settings: {
      async_insert: 1,
      wait_for_async_insert: 0
    }
  });

  // Test connection
  const result = await clickhouseClient.query({ query: 'SELECT 1', format: 'JSONEachRow' }).catch((e) => {
    logger.warn('ClickHouse not available — analytics will use mock data:', e.message);
    return null;
  });

  return clickhouseClient;
}

function getClickHouse() {
  return clickhouseClient;
}

async function insertEvents(events) {
  if (!clickhouseClient) return;
  await clickhouseClient.insert({
    table: 'click_events',
    values: events,
    format: 'JSONEachRow'
  });
}

async function queryClickHouse(query, params = {}) {
  if (!clickhouseClient) return [];
  const result = await clickhouseClient.query({ query, query_params: params, format: 'JSONEachRow' });
  return await result.json();
}

module.exports = { initClickHouse, getClickHouse, insertEvents, queryClickHouse };
