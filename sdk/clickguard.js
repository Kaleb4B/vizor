(function (window, document) {
  'use strict';

  var ClickGuard = {
    websiteId: null,
    sessionId: null,
    visitorId: null,
    endpoint: 'http://localhost:4000/api/events',
    buffer: [],
    flushInterval: 5000,
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
      if (!config || !config.websiteId) {
        console.error('[ClickGuard] websiteId is required');
        return;
      }
      this.websiteId = config.websiteId;
      this.endpoint = config.endpoint || this.endpoint;
      this.sessionId = this.getOrCreateSession();
      this.visitorId = this.generateFingerprint();

      this.detectAutomation();
      this.bindEvents();
      this.startFlushTimer();
      this.trackEvent('pageview', { url: window.location.href, referrer: document.referrer });

      console.log('[ClickGuard] Initialized for site:', this.websiteId);
    },

    getOrCreateSession: function () {
      var name = 'cg_sid';
      var sid = sessionStorage.getItem(name);
      if (!sid) {
        sid = 'sess_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
        sessionStorage.setItem(name, sid);
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

        // Simple Hash
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

      // Mouse Move
      window.addEventListener('mousemove', function (e) {
        self.signals.mouseMovementCount++;
        if (self.signals.mousePositions.length < 50) {
          self.signals.mousePositions.push({ x: e.clientX, y: e.clientY, t: Date.now() - self.startTime });
        }
      }, { passive: true });

      // Click & Rage Click Detection
      window.addEventListener('click', function (e) {
        self.signals.clickCount++;
        var now = Date.now();
        if (now - lastClickTime < 400 && lastClickTarget === e.target) {
          self.signals.rageClickCount++;
        }
        lastClickTime = now;
        lastClickTarget = e.target;

        self.trackEvent('click', {
          x_coord: e.clientX,
          y_coord: e.clientY,
          target: e.target.tagName
        });
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
      if (this.buffer.length === 0) return;
      var eventsToSend = this.buffer.splice(0, this.buffer.length);
      var payload = JSON.stringify({ events: eventsToSend });

      if (isSync && navigator.sendBeacon) {
        navigator.sendBeacon(this.endpoint, payload);
      } else {
        fetch(this.endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': this.websiteId,
            'X-Site-Id': this.websiteId
          },
          body: payload,
          keepalive: true
        }).catch(function (err) {
          console.warn('[ClickGuard] Ingestion retry warning:', err.message);
        });
      }
    }
  };

  window.ClickGuard = ClickGuard;
})(window, document);
