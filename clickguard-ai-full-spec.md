# Project: ClickGuard AI — Real Human & Click Fraud Detection Platform Named Vizor

Aplikasi web enterprise untuk deteksi kualitas traffic, click fraud, bot detection, dan behavioral analysis pada landing page — setara gabungan Google Analytics 4 + Hotjar + Microsoft Clarity + Cloudflare Bot Management, dengan diferensiasi AI Click Quality Score dan AI Conversion Prediction.

---

## Tech Stack

**Backend**
- Node.js + Express.js (API Server)
- Go (opsional, untuk ingestion service berthroughput tinggi jika skala event sudah sangat besar)
- PostgreSQL (metadata: users, sites, alert rules, webhooks, billing)
- ClickHouse (event log time-series — wajib untuk analytical query di skala jutaan event/hari, Postgres saja tidak cukup di skala ini)
- Kafka (message queue/event buffer — wajib untuk menahan burst anomali ekstrem tanpa menjatuhkan sistem)
- Redis (session state real-time + cache)
- Socket.io (push update realtime ke dashboard — **bukan** untuk ingestion pipeline, hanya untuk live visitor feed)
- JWT Authentication

**Frontend**
- React.js + Vite
- Tailwind CSS
- Recharts
- React Query

**Tracking SDK**
- Vanilla JavaScript, async-loaded, <10KB
- Instalasi:
```html
<script src="clickguard.js"></script>
<script>
ClickGuard.init({ websiteId: "YOUR_WEBSITE_ID" });
</script>
```

**ML Scoring**
- Python (scikit-learn/XGBoost untuk awal, Isolation Forest untuk anomaly detection)
- Berjalan sebagai batch service terpisah, membaca dari ClickHouse

---

## System Architecture

```
                    USER
                      │
                      ▼
               Landing Page
                      │
       <script src="clickguard.js">
                      │
                      ▼
            ClickGuard SDK (Library)
       (capture click, mouse, scroll, keyboard,
        fingerprint, device, network signal)
                      │
                      ▼
             API Gateway + Rate Limiter
          (nginx/Kong — proteksi SDK jadi
              vektor DDoS balik ke server)
                      │
                      ▼
             ClickGuard API Server
           (validasi payload, JWT/auth token,
              lempar ke Kafka producer)
                      │
                      ▼
              Kafka (partitioned by
                site_id / session_id)
                      │
        ┌─────────────┼──────────────┐
        ▼             ▼              ▼
  Consumer Group   Consumer Group  Consumer Group
  Real-time Rules  Fingerprint &   Analytics Sink
  (velocity, burst  Session Engine  (raw event →
   bot signature)    (Redis state)   ClickHouse)
        │             │              │
        └─────────────┼──────────────┘
                      ▼
              Alert/Webhook Service
           (kalau anomali score tinggi →
         notify realtime via Socket.io + webhook)
                      │
                      ▼
         PostgreSQL (metadata, users,
          site config, alert rules)
                      +
         ClickHouse (event log, time-series,
          buat query analytics & dashboard)
                      │
                      ▼
              ML Scoring Service
        (batch job — Click Quality Score,
         Conversion Prediction, Anomaly Score,
         jalan terpisah, baca dari ClickHouse)
                      │
                      ▼
        Dashboard (React) — realtime via
              Socket.io untuk live feed
                      │
                      ▼
             Website Owner
```

### Prinsip Desain Wajib

- **Real-time layer harus sub-50ms.** Rule-based detection (velocity check, timing anomaly, fingerprint mismatch) berjalan sinkron dan cepat. ML tidak boleh berada di jalur ini.
- **ML scoring async/batch**, baca dari ClickHouse, update skor ke record tersimpan. Model tidak akan akurat di awal karena minim data historis — mulai dari weighted rule-based scoring dulu, baru upgrade ke ML sungguhan setelah data cukup (skala jutaan event).
- **Kafka topic partitioned by `site_id`** agar traffic satu klien yang kena serangan bot tidak memblokir klien lain. Partisi tambahan by `session_id` hash untuk load balancing antar consumer.
- **Consumer group dipisah per fungsi**: Real-time Rules, Fingerprint/Session Engine, Analytics Sink. Jangan satu consumer mengerjakan semuanya.
- **Circuit breaker & sampling** saat burst ekstrem: kalau consumer lag menumpuk, auto-throttle atau sampling (proses 1 dari 10 event untuk rule check, tapi tetap simpan semua raw event).
- **Dead Letter Queue (DLQ)** untuk event gagal parse/invalid.
- **Session state di Redis**, di-flush berkala ke ClickHouse untuk historical analysis.
- **Socket.io hanya untuk push notification/live dashboard**, bukan jalur ingestion event dari SDK — ingestion tetap lewat REST API → Kafka agar tahan burst jutaan event.
- **Webhook signature wajib HMAC-SHA256** dengan shared secret agar tidak bisa di-spoof.

---

## Dashboard

UI modern seperti Cloudflare Dashboard / Google Analytics. Dark mode, responsive, loading skeleton, realtime chart, table filter, export PDF/Excel/CSV.

**Menu:**
- Dashboard (summary)
- Live Visitors
- Visitor Sessions
- Click Analysis
- Heatmap
- Session Replay
- Fraud Detection
- Bot Detection
- Device Analytics
- Geo Analytics
- Campaign Analytics
- Reports
- Settings

**Dashboard Summary (realtime via Socket.io):**
Total Visitor, Human Visitor, Bot Visitor, Fraud Click, Bounce Rate, Average Session, Conversion Rate, Live Visitor.

---

## Tracking SDK — Signal yang Direkam

Dikirim secara **batch setiap 5 detik** (bukan per-event) via `sendBeacon()`/`fetch keepalive` agar tidak hilang saat tab ditutup dan tidak membebani jaringan.

**Interaction Signal:**
Mouse Move, Mouse Speed, Mouse Stop, Mouse Direction, Mouse Curve, Scroll, Scroll Depth, Scroll Speed, Keyboard, Copy, Paste, Right Click, Focus, Blur, Visibility Change, Resize, Orientation, Touch Event, Double Click, Dead Click, Rage Click, Idle Time, Time on Page, Unload, Exit Intent.

**Device Fingerprint:**
Browser, Browser Version, OS, Language, Timezone, Resolution, Color Depth, Touch Support, CPU Core, RAM, GPU, Canvas Fingerprint, WebGL Fingerprint, Audio Fingerprint, Fonts, Plugins, Cookies Enabled, Do Not Track, Network Type, Battery API (jika tersedia).

**Network Signal:**
IP Address, Country, City, Region, ASN, ISP, VPN Detection, Proxy Detection, TOR Detection, Hosting/Datacenter Detection, Latency, Request Frequency.

> Catatan privasi: typing content tidak pernah disimpan (hanya pola ketikan/timing), sesuai prinsip session replay yang aman secara hukum privasi data.

---

## Bot Detection

Deteksi otomatis:
- Headless Chrome, Selenium, Playwright, Puppeteer, PhantomJS
- `navigator.webdriver`, fake user agent, automation framework signature
- No mouse movement, instant bounce, fast scroll tak wajar
- No focus/keyboard/visibility event
- Impossible mouse pattern (linear/teleport movement)
- AI crawler: GPTBot, ClaudeBot, PerplexityBot, Bytespider, Meta External Agent, Googlebot, Bingbot (perlu whitelist policy terpisah — crawler resmi search engine biasanya tidak diperlakukan sebagai fraud)

Output: **Bot Score 0–100**, dihitung real-time layer (rule-based) lalu di-refine oleh ML Scoring Service.

## Human Score

Dihitung dari: mouse behaviour, reading time, scroll pattern, keyboard interaction, focus event, click pattern, movement randomness, touch behaviour, idle behaviour, return visit.

| Range | Kategori |
|---|---|
| 0–30 | Suspicious |
| 31–60 | Possible Bot |
| 61–80 | Human |
| 81–100 | Trusted Human |

## Click Fraud Detection

Deteksi: repeated IP, repeated fingerprint, repeated device, rapid click, multiple landing access, campaign abuse, UTM spam, fake conversion, click farm, VPN/proxy/TOR abuse, emulator, virtual machine.

## Behavioral Analysis

Hitung: reading time, scroll completion, hover duration, element engagement, CTA engagement, mouse heat, attention map, interaction rate, exit probability, intent score.

## Heatmap & Session Replay

- **Heatmap:** Click Heatmap, Move Heatmap, Scroll Heatmap, Hover Heatmap.
- **Session Replay:** rekam mouse, scroll, click, resize, typing pattern (tanpa isi input), navigation, focus, blur — playback seperti Hotjar.

## Analytics

Breakdown per: Landing Page, Campaign, Source, Medium, UTM, Country, Device, Browser, Hour, Day, Week, Month.

## AI Anomaly Detection

Dihitung oleh ML Scoring Service (batch, baca dari ClickHouse):
- Anomaly Score
- Human Confidence
- Fraud Probability
- Conversion Quality
- Traffic Quality
- Suspicious Activity

Algoritma awal: Isolation Forest atau anomaly detection sederhana berbasis statistik, upgrade ke model lebih kompleks setelah data historis cukup.

## Alert System

Notifikasi realtime (via Socket.io ke dashboard + webhook ke sistem klien) saat:
Bot meningkat drastis, Fraud Click meningkat, Bounce naik, Conversion turun, Traffic melonjak, DDoS ringan terdeteksi.

---

## Skema Data

### ClickHouse — tabel `click_events`
`event_id`, `site_id`, `session_id`, `visitor_id` (fingerprint hash), `event_type`, `timestamp`, `page_url`, `referrer`, `ip_address`, `user_agent`, `device_fingerprint`, `x_coord`, `y_coord`, `time_since_page_load_ms`, `is_anomaly`, `anomaly_reason`, `click_quality_score`, `conversion_probability`, `bot_score`, `human_score`.

### PostgreSQL — tabel utama
`sites` (site_id, owner, domain, api_key, plan), `users`, `alert_rules`, `webhooks` (endpoint URL, secret key per site), `audit_logs`.

Seluruh ERD dan migration dibuat bertahap sesuai fase pengembangan (lihat di bawah).

---

## API

REST API lengkap dengan dokumentasi Swagger. Struktur folder mengikuti Clean Architecture:
- Controller
- Service
- Repository
- Middleware
- Validator (DTO)
- Routes

Prinsip: SOLID, mudah di-scale untuk jutaan event per hari, production-ready.

---

## Security

Rate Limiter, Helmet, JWT, CSRF Protection, Input Validation, SQL Injection Protection, XSS Protection, Redis Cache, Audit Log, HMAC signature verification untuk webhook.

## Testing

Jest, Supertest, Unit Test, Integration Test.

## Deployment

Docker, Docker Compose (MVP) → Kubernetes (scale), Nginx, PM2, GitHub Actions, production ready.

---

## Contoh Integrasi Client (Express/Node.js — mis. taneko.co.id)

**Middleware:**
```js
const clickguardMiddleware = (req, res, next) => {
  res.locals.clickguardSiteId = process.env.CLICKGUARD_SITE_ID;
  res.locals.clickguardSessionId = req.cookies.cg_session || generateSessionId();
  next();
};
```

**Script tag di layout (EJS/Pug):**
```html
<script 
  src="https://cdn.clickguard.io/clickguard.js" 
  data-site-id="<%= clickguardSiteId %>" 
  data-session="<%= clickguardSessionId %>"
  async>
</script>
```

**Webhook receiver:**
```js
app.post('/webhooks/clickguard', express.json(), (req, res) => {
  // verify HMAC signature dulu sebelum proses payload
  const { event, score, ip, timestamp } = req.body;
  if (score > 80) {
    // trigger action: block IP di reverse proxy, notify admin, dll
  }
  res.sendStatus(200);
});
```

---

## Fase Pengembangan

**Tahap 1 — Fondasi**
- Struktur folder (Clean Architecture)
- Database: PostgreSQL + ClickHouse setup, ERD dan migration awal
- Backend: API Server dasar, Kafka producer, consumer group awal
- SDK Tracking: capture signal dasar (click, mouse, scroll, device)

**Tahap 2 — Dashboard & Realtime**
- Dashboard React dengan menu utama
- API lengkap dengan Swagger
- Realtime via Socket.io (live visitor feed)
- Rule-based Bot Score & Human Score

**Tahap 3 — Heatmap, Replay & AI**
- Heatmap (click/move/scroll/hover)
- Session Replay
- ML Scoring Service (Isolation Forest, Click Quality Score, Conversion Prediction)
- Alert System

**Tahap 4 — Optimasi & Produksi**
- Circuit breaker, sampling, DLQ untuk burst ekstrem
- Security hardening (rate limiter, Helmet, CSRF, audit log)
- Testing (Jest, Supertest, unit + integration)
- Deployment (Docker, Nginx, PM2, GitHub Actions)

Pada setiap tahap, berikan source code lengkap, struktur folder, penjelasan arsitektur, dan alasan desain teknis. Kode mengikuti Clean Architecture dan SOLID, siap untuk skala jutaan event per hari dan production-ready.
