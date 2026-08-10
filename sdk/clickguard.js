(function (window, document) {
  'use strict';

  // Default Cloudflare Tunnel endpoint for live ingestion
  var DEFAULT_ENDPOINT = 'https://named-living-previous-suburban.trycloudflare.com/api/events';

  var ClickGuard = {
    websiteId: null,
    sessionId: null,
    visitorId: null,
    endpoint: DEFAULT_ENDPOINT,
    buffer: [],
    flushInterval: 1000,
    startTime: Date.now(),
    signals: {
      mouseMovementCount: 0,
      mousePositions: [],
      scrollMaxDepth: 0,
      clickCount: 0,
      rageClickCount: 0,
      deadClickCount: 0,
      copyCount: 0,
      keyboardInteraction: false,
      focusEvents: false,
      webdriverDetected: false
    },

    init: function (config) {
      config = config || {};
      this.websiteId = config.websiteId || 'site-001';

      if (config.endpoint) {
        this.endpoint = config.endpoint;
      } else {
        var autoEp = this.autoDetectEndpoint();
        if (autoEp) this.endpoint = autoEp;
      }

      this.sessionId = this.getOrCreateSession();
      this.visitorId = this.generateFingerprint();

      this.detectAutomation();
      this.bindEvents();
      this.startFlushTimer();

      // Track pageview immediately
      this.trackEvent('pageview', { page_url: window.location.href, referrer: document.referrer });
      this.flush(false);

      console.log('[ClickGuard] Tracking active for site:', this.websiteId, 'Endpoint:', this.endpoint);
    },

    autoDetectEndpoint: function () {
      try {
        var scripts = document.getElementsByTagName('script');
        for (var i = 0; i < scripts.length; i++) {
          var src = scripts[i].src || '';
          if (src && (src.indexOf('clickguard.js') !== -1 || src.indexOf('trycloudflare.com') !== -1)) {
            var u = new URL(src);
            return u.origin + '/api/events';
          }
        }
      } catch (e) {}
      return DEFAULT_ENDPOINT;
    },

    getOrCreateSession: function () {
      var name = 'cg_sid';
      var sid = null;
      try { sid = sessionStorage.getItem(name); } catch(e) {}
      if (!sid) {
        sid = 'sess_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
        try { sessionStorage.setItem(name, sid); } catch(e) {}
      }
      return sid;
    },

    generateFingerprint: function () {
      try {
        var str = [
          navigator.userAgent,
          navigator.language,
          screen.colorDepth,
          screen.width + 'x' + screen.height,
          new Date().getTimezoneOffset(),
          navigator.hardwareConcurrency || 'unknown',
          navigator.deviceMemory || 'unknown'
        ].join('||');

        var hash = 0;
        for (var i = 0; i < str.length; i++) {
          hash = (hash << 5) - hash + str.charCodeAt(i);
          hash |= 0;
        }
        return 'fp_' + Math.abs(hash).toString(36);
      } catch (e) {
        return 'fp_fallback_' + Date.now();
      }
    },

    detectAutomation: function () {
      this.signals.webdriverDetected = Boolean(
        navigator.webdriver ||
        window.domAutomation ||
        window.domAutomationController ||
        window._phantom ||
        window.callPhantom
      );
    },

    bindEvents: function () {
      var self = this;
      var lastClickTime = 0;
      var lastClickTarget = null;

      // Mouse & Touch Move
      window.addEventListener('mousemove', function (e) {
        self.signals.mouseMovementCount++;
        if (self.signals.mousePositions.length < 50) {
          self.signals.mousePositions.push({ x: e.clientX, y: e.clientY, t: Date.now() - self.startTime });
        }
      }, { passive: true });

      window.addEventListener('touchmove', function () {
        self.signals.mouseMovementCount++;
      }, { passive: true });

      // Click & Touch Click
      window.addEventListener('click', function (e) {
        self.signals.clickCount++;
        var now = Date.now();
        if (now - lastClickTime < 400 && lastClickTarget === e.target) {
          self.signals.rageClickCount++;
        }
        lastClickTime = now;
        lastClickTarget = e.target;

        self.trackEvent('click', {
          x_coord: e.clientX || 0,
          y_coord: e.clientY || 0,
          target: e.target ? e.target.tagName : 'BODY'
        });
        self.flush(false);
      }, { passive: true });

      // Scroll Depth
      window.addEventListener('scroll', function () {
        var docHeight = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight) - window.innerHeight;
        if (docHeight > 0) {
          var depth = Math.round((window.scrollY / docHeight) * 100);
          if (depth > self.signals.scrollMaxDepth) {
            self.signals.scrollMaxDepth = depth;
          }
        }
      }, { passive: true });

      // Keyboard
      window.addEventListener('keydown', function () {
        self.signals.keyboardInteraction = true;
      }, { passive: true });

      // Focus / Blur
      window.addEventListener('focus', function () {
        self.signals.focusEvents = true;
      }, { passive: true });

      // Copy
      window.addEventListener('copy', function () {
        self.signals.copyCount++;
      }, { passive: true });

      // Page Unload
      window.addEventListener('beforeunload', function () {
        self.trackEvent('unload', { time_on_page_ms: Date.now() - self.startTime });
        self.flush(true);
      });
    },

    trackEvent: function (eventType, meta) {
      var payload = Object.assign({
        site_id: this.websiteId,
        session_id: this.sessionId,
        visitor_id: this.visitorId,
        event_type: eventType,
        timestamp: new Date().toISOString(),
        page_url: window.location.href,
        referrer: document.referrer,
        user_agent: navigator.userAgent,
        viewport_width: window.innerWidth,
        viewport_height: window.innerHeight,
        scroll_depth: this.signals.scrollMaxDepth,
        time_since_page_load_ms: Date.now() - this.startTime,
        behavior_signals: {
          mouse_movement_count: this.signals.mouseMovementCount,
          rage_click_count: this.signals.rageClickCount,
          copy_count: this.signals.copyCount,
          has_keyboard_interaction: this.signals.keyboardInteraction,
          has_focus_event: this.signals.focusEvents,
          webdriver_detected: this.signals.webdriverDetected
        }
      }, meta || {});

      this.buffer.push(payload);
    },

    startFlushTimer: function () {
      var self = this;
      setInterval(function () {
        self.flush(false);
      }, this.flushInterval);
    },

    flush: function (isSync) {
      if (this.buffer.length === 0 || !this.endpoint) return;
      var eventsToSend = this.buffer.splice(0, this.buffer.length);
      var payload = JSON.stringify({ events: eventsToSend });

      // Primary: fetch POST
      try {
        fetch(this.endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': this.websiteId,
            'X-Site-Id': this.websiteId
          },
          body: payload,
          keepalive: true
        }).catch(function () {});
      } catch(e) {}

      // Dual Insurance: Image Pixel Ping (bypasses Safari ITP and browser fetch blockers 100%)
      try {
        var pixelUrl = this.endpoint.replace('/events', '/events/pixel') + '?data=' + encodeURIComponent(payload);
        var img = new Image();
        img.src = pixelUrl;
      } catch(e) {}
    }
  };

  window.ClickGuard = ClickGuard;

  // Immediate auto-init on script load
  try {
    ClickGuard.init({ websiteId: 'site-001' });
  } catch (e) {
    console.warn('[ClickGuard] Auto-init error:', e);
  }
})(window, document);
