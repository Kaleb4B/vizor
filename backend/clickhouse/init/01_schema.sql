-- ClickHouse initialization SQL
-- Main event log table

CREATE DATABASE IF NOT EXISTS vizor;

CREATE TABLE IF NOT EXISTS vizor.click_events (
    event_id UUID DEFAULT generateUUIDv4(),
    site_id String,
    session_id String,
    visitor_id String,
    event_type LowCardinality(String),
    timestamp DateTime64(3) DEFAULT now64(),
    page_url String,
    referrer String,
    ip_address IPv4,
    user_agent String,
    device_fingerprint String,
    x_coord Int32 DEFAULT 0,
    y_coord Int32 DEFAULT 0,
    viewport_width Int32 DEFAULT 0,
    viewport_height Int32 DEFAULT 0,
    scroll_depth Float32 DEFAULT 0,
    time_since_page_load_ms UInt32 DEFAULT 0,
    time_on_page_ms UInt32 DEFAULT 0,
    -- Device
    browser LowCardinality(String),
    browser_version String,
    os LowCardinality(String),
    device_type LowCardinality(String),
    screen_resolution String,
    language LowCardinality(String),
    timezone String,
    -- Network & Geo
    country LowCardinality(String),
    city String,
    region String,
    asn String,
    isp String,
    is_vpn UInt8 DEFAULT 0,
    is_proxy UInt8 DEFAULT 0,
    is_tor UInt8 DEFAULT 0,
    is_datacenter UInt8 DEFAULT 0,
    -- Campaign
    utm_source String,
    utm_medium String,
    utm_campaign String,
    utm_term String,
    utm_content String,
    -- Scores
    bot_score Float32 DEFAULT 0,
    human_score Float32 DEFAULT 100,
    click_quality_score Float32 DEFAULT 100,
    conversion_probability Float32 DEFAULT 0,
    anomaly_score Float32 DEFAULT 0,
    is_anomaly UInt8 DEFAULT 0,
    anomaly_reason String,
    is_fraud UInt8 DEFAULT 0,
    fraud_reason String,
    -- Behavior signals (JSON packed)
    behavior_signals String DEFAULT '{}',
    -- Session aggregates
    mouse_movement_count UInt32 DEFAULT 0,
    click_count UInt16 DEFAULT 0,
    rage_click UInt8 DEFAULT 0,
    dead_click UInt8 DEFAULT 0,
    copy_count UInt8 DEFAULT 0,
    is_bot UInt8 DEFAULT 0,
    bot_type LowCardinality(String)
)
ENGINE = MergeTree()
PARTITION BY toYYYYMM(timestamp)
ORDER BY (site_id, timestamp, session_id)
TTL timestamp + INTERVAL 90 DAY
SETTINGS index_granularity = 8192;

-- Aggregated sessions table (materialized by consumer)
CREATE TABLE IF NOT EXISTS vizor.sessions (
    session_id String,
    site_id String,
    visitor_id String,
    start_time DateTime64(3),
    end_time DateTime64(3) DEFAULT '1970-01-01 00:00:00',
    duration_ms UInt32 DEFAULT 0,
    page_count UInt16 DEFAULT 1,
    click_count UInt16 DEFAULT 0,
    scroll_max_depth Float32 DEFAULT 0,
    ip_address String,
    country LowCardinality(String),
    city String,
    browser LowCardinality(String),
    os LowCardinality(String),
    device_type LowCardinality(String),
    utm_source String,
    utm_campaign String,
    bot_score Float32 DEFAULT 0,
    human_score Float32 DEFAULT 100,
    is_bot UInt8 DEFAULT 0,
    is_fraud UInt8 DEFAULT 0,
    is_converted UInt8 DEFAULT 0
)
ENGINE = ReplacingMergeTree(end_time)
ORDER BY (site_id, session_id)
SETTINGS index_granularity = 8192;

-- Heatmap aggregation table
CREATE TABLE IF NOT EXISTS vizor.heatmap_events (
    site_id String,
    page_url String,
    event_type LowCardinality(String),
    x_coord Int32,
    y_coord Int32,
    count UInt64 DEFAULT 1,
    date Date DEFAULT today()
)
ENGINE = SummingMergeTree(count)
PARTITION BY toYYYYMM(date)
ORDER BY (site_id, page_url, event_type, date, x_coord, y_coord)
SETTINGS index_granularity = 8192;
