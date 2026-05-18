// Instagram Unfollow Tool v3.0
// Advanced non-follower detection with anti-ban protection
// Run from browser console on instagram.com: paste this code and press Enter

(async () => {
  'use strict';

  // ─── Error Classes ───────────────────────────────────────────────────
  class RateLimitError extends Error {
    constructor(m) { super(m); this.name = 'RateLimitError'; }
  }
  class ChallengeError extends Error {
    constructor(m) { super(m); this.name = 'ChallengeError'; }
  }
  class NetworkError extends Error {
    constructor(m) { super(m); this.name = 'NetworkError'; }
  }

  // ─── Console Logger ──────────────────────────────────────────────────
  const Console = {
    _prefix: '%c[IG-Unfollow]',
    _styles: {
      info: 'color:#3b82f6;font-weight:bold;',
      success: 'color:#22c55e;font-weight:bold;',
      warn: 'color:#f59e0b;font-weight:bold;',
      error: 'color:#ef4444;font-weight:bold;',
      system: 'color:#a855f7;font-weight:bold;',
    },
    _log(level, ...args) {
      const style = this._styles[level] || this._styles.info;
      console.log(this._prefix, style, ...args);
    },
    info(...args) { this._log('info', ...args); },
    success(...args) { this._log('success', ...args); },
    warn(...args) { this._log('warn', ...args); },
    error(...args) { this._log('error', ...args); },
    system(...args) { this._log('system', ...args); },
    banner() {
      console.log(
        '%c╔══════════════════════════════════════╗\n' +
        '║   Instagram Unfollow Tool v3.0       ║\n' +
        '║   github.com/RanuK12/ig-unfollow     ║\n' +
        '╚══════════════════════════════════════╝',
        'color:#3b82f6;font-size:14px;font-family:monospace;'
      );
    },
    table(data, title) {
      if (title) console.log('%c' + title, 'color:#e4e4e7;font-weight:bold;font-size:13px;');
      console.table(data);
    },
    progress(current, total, label = '') {
      const pct = Math.round((current / total) * 100);
      const filled = Math.round(pct / 5);
      const bar = '█'.repeat(filled) + '░'.repeat(20 - filled);
      console.log(`%c${this._prefix.replace('%c', '')} %c[${bar}] ${pct}% ${label}`,
        this._styles.info, 'color:#a1a1aa;font-family:monospace;');
    },
  };

  Console.banner();
  Console.system('Initializing...');

  // ─── Theme ───────────────────────────────────────────────────────────
  const T = {
    bg: '#0a0a0a',
    surface: '#141414',
    surfaceAlt: '#1c1c1c',
    surfaceHover: '#222',
    surfaceSelected: '#1a2744',
    border: '#2a2a2a',
    borderLight: '#333',
    accent: '#3b82f6',
    accentHover: '#2563eb',
    accentLight: 'rgba(59,130,246,0.1)',
    danger: '#ef4444',
    dangerHover: '#dc2626',
    success: '#22c55e',
    successLight: 'rgba(34,197,94,0.1)',
    warning: '#f59e0b',
    warningLight: 'rgba(245,158,11,0.1)',
    purple: '#a855f7',
    text: '#e4e4e7',
    textSec: '#a1a1aa',
    textMuted: '#71717a',
    overlay: 'rgba(0,0,0,0.85)',
    radius: '10px',
  };

  // ─── Utilities ───────────────────────────────────────────────────────
  const Utils = {
    getCookie(name) {
      const c = '; ' + document.cookie;
      const p = c.split('; ' + name + '=');
      return p.length === 2 ? p.pop().split(';').shift() : null;
    },
    getUserID: () => Utils.getCookie('ds_user_id'),
    getCSRFToken: () => Utils.getCookie('csrftoken'),
    sleep: (ms) => new Promise(r => setTimeout(r, ms)),
    randomDelay: (min, max) => Math.floor(Math.random() * (max - min) + min),
    formatNum: (n) => n.toLocaleString('en-US'),
    formatTime(ms) {
      if (ms < 60000) return Math.round(ms / 1000) + 's';
      if (ms < 3600000) return Math.round(ms / 60000) + 'min';
      return (ms / 3600000).toFixed(1) + 'h';
    },
    estimateTime(count, delayMin, delayMax, batchSize, batchPauseMin) {
      const avgDelay = (delayMin + delayMax) / 2;
      const batches = Math.floor(count / batchSize);
      const totalDelay = count * avgDelay + batches * batchPauseMin;
      return totalDelay;
    },
    generateSessionId() {
      return 'sess_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    },
  };

  // ─── Fingerprint Randomizer (Anti-Detection) ────────────────────────
  const Fingerprint = {
    _requestCount: 0,
    _lastRequestTime: 0,

    getRandomizedHeaders(baseHeaders) {
      const headers = { ...baseHeaders };
      // Randomize X-IG-WWW-Claim timing
      if (Math.random() < 0.3) {
        headers['X-IG-Connection-Speed'] = ['EXCELLENT', 'GOOD', '2G', '3G', '4G'][Math.floor(Math.random() * 5)];
      }
      // Add browser-like headers occasionally
      if (Math.random() < 0.2) {
        headers['X-IG-Bandwidth-Speed-KBPS'] = String(Math.floor(Math.random() * 5000 + 1000));
      }
      return headers;
    },

    getJitteredDelay(baseMin, baseMax) {
      // Add human-like jitter: occasionally much longer pauses
      const roll = Math.random();
      if (roll < 0.05) return Utils.randomDelay(baseMax * 3, baseMax * 5); // 5% chance of very long pause
      if (roll < 0.15) return Utils.randomDelay(baseMax * 1.5, baseMax * 2.5); // 10% chance of longer pause
      if (roll < 0.25) return Utils.randomDelay(baseMin * 0.8, baseMin); // 10% quick action
      return Utils.randomDelay(baseMin, baseMax); // 75% normal
    },

    shouldSimulateActivity() {
      // Occasionally add "browsing" delays to seem more human
      return Math.random() < 0.08;
    },

    getActivityDelay() {
      return Utils.randomDelay(3000, 8000);
    },
  };

  // ─── Safety Manager (Advanced Anti-Ban) ─────────────────────────────
  const Safety = {
    config: {
      unfollowDelay: [10000, 20000],    // Increased from 8-15s to 10-20s
      scanDelay: [500, 1200],            // Slightly increased scan delays
      batchPause: [180000, 420000],      // 3-7 min between batches (up from 2-5)
      batchSize: 7,                      // Reduced from 10 to 7
      dailyLimit: 100,                   // Reduced from 120 to 100 (safer)
      sessionLimit: 50,                  // Reduced from 60 to 50
      hourlyLimit: 25,                   // NEW: max 25 per hour
      initialBackoff: 90000,             // 1.5 min initial backoff
      maxBackoff: 900000,                // 15 min max backoff
      backoffMultiplier: 2.5,
      cooldownAfterError: 300000,        // 5 min cooldown after any error
      maxConsecutiveErrors: 3,
      requestsBeforeLongPause: 30,       // Force long pause every 30 requests
      longPauseRange: [300000, 600000],  // 5-10 min forced pause
    },
    state: {
      sessionCount: 0,
      consecutiveErrors: 0,
      currentBackoff: 90000,
      isPaused: false,
      pauseResolve: null,
      isCancelled: false,
      sessionId: Utils.generateSessionId(),
      hourlyCount: 0,
      hourlyReset: Date.now() + 3600000,
      totalRequests: 0,
      startTime: Date.now(),
    },
    getDailyCount() {
      try {
        const d = JSON.parse(localStorage.getItem('ig_unf_daily') || '{}');
        return d.date === new Date().toISOString().slice(0, 10) ? (d.count || 0) : 0;
      } catch { return 0; }
    },
    incrementDaily() {
      try {
        const today = new Date().toISOString().slice(0, 10);
        const d = JSON.parse(localStorage.getItem('ig_unf_daily') || '{}');
        const count = d.date === today ? (d.count || 0) + 1 : 1;
        localStorage.setItem('ig_unf_daily', JSON.stringify({ date: today, count }));
      } catch {}
    },
    getHourlyCount() {
      if (Date.now() > this.state.hourlyReset) {
        this.state.hourlyCount = 0;
        this.state.hourlyReset = Date.now() + 3600000;
      }
      return this.state.hourlyCount;
    },
    incrementHourly() {
      this.getHourlyCount(); // reset if needed
      this.state.hourlyCount++;
    },
    canContinue() {
      if (this.state.isCancelled) return { ok: false, reason: 'Cancelled by user' };
      if (this.getDailyCount() >= this.config.dailyLimit)
        return { ok: false, reason: `Daily limit reached (${this.config.dailyLimit}). Try again tomorrow.` };
      if (this.state.sessionCount >= this.config.sessionLimit)
        return { ok: false, reason: `Session limit reached (${this.config.sessionLimit}). Restart the tool later.` };
      if (this.getHourlyCount() >= this.config.hourlyLimit)
        return { ok: false, reason: `Hourly limit reached (${this.config.hourlyLimit}). Wait ~${Math.ceil((this.state.hourlyReset - Date.now()) / 60000)} min.` };
      return { ok: true };
    },
    getNextDelay() {
      return Fingerprint.getJitteredDelay(...this.config.unfollowDelay);
    },
    shouldBatchPause() {
      return this.state.sessionCount > 0 && this.state.sessionCount % this.config.batchSize === 0;
    },
    shouldForceLongPause() {
      return this.state.totalRequests > 0 &&
        this.state.totalRequests % this.config.requestsBeforeLongPause === 0;
    },
    getBatchPause() {
      return Utils.randomDelay(...this.config.batchPause);
    },
    getLongPause() {
      return Utils.randomDelay(...this.config.longPauseRange);
    },
    handleError(error) {
      this.state.consecutiveErrors++;
      const fatal = error instanceof ChallengeError;
      const delay = Math.min(
        this.state.currentBackoff * this.state.consecutiveErrors,
        this.config.maxBackoff
      );
      this.state.currentBackoff *= this.config.backoffMultiplier;
      Console.warn(`Error handled. Backoff: ${Utils.formatTime(delay)}. Consecutive: ${this.state.consecutiveErrors}`);
      return { delay, fatal };
    },
    resetErrors() {
      this.state.consecutiveErrors = 0;
      this.state.currentBackoff = this.config.initialBackoff;
    },
    pause() { this.state.isPaused = true; },
    resume() {
      this.state.isPaused = false;
      if (this.state.pauseResolve) {
        this.state.pauseResolve();
        this.state.pauseResolve = null;
      }
    },
    cancel() { this.state.isCancelled = true; this.resume(); },
    reset() {
      this.state.sessionCount = 0;
      this.state.consecutiveErrors = 0;
      this.state.currentBackoff = this.config.initialBackoff;
      this.state.isPaused = false;
      this.state.isCancelled = false;
      this.state.pauseResolve = null;
      this.state.totalRequests = 0;
      this.state.startTime = Date.now();
    },
    async waitIfPaused() {
      while (this.state.isPaused && !this.state.isCancelled) {
        await new Promise(r => { this.state.pauseResolve = r; });
      }
    },
  };


  // ─── Connection Health Monitor ──────────────────────────────────────
  const HealthCheck = {
    lastCheck: 0,
    isHealthy: true,
    checkInterval: 60000,

    async check() {
      if (Date.now() - this.lastCheck < this.checkInterval) return this.isHealthy;
      try {
        const res = await fetch('https://www.instagram.com/api/v1/web/login_page/', {
          credentials: 'include',
          method: 'HEAD',
        });
        this.isHealthy = res.ok || res.status === 302;
        this.lastCheck = Date.now();
        if (!this.isHealthy) Console.warn('Connection health check failed');
        return this.isHealthy;
      } catch {
        this.isHealthy = false;
        Console.error('Connection lost. Check your internet.');
        return false;
      }
    },

    async waitForConnection(maxWait = 60000) {
      const start = Date.now();
      while (!this.isHealthy && (Date.now() - start) < maxWait) {
        await Utils.sleep(5000);
        await this.check();
      }
      return this.isHealthy;
    },
  };

  // ─── Instagram API (v1 REST) ────────────────────────────────────────
  const API = {
    getHeaders() {
      const csrf = Utils.getCSRFToken();
      if (!csrf) throw new Error('No CSRF token. Make sure you are logged in on instagram.com');
      const base = {
        'X-CSRFToken': csrf,
        'X-IG-App-ID': '936619743392459',
        'X-IG-WWW-Claim': sessionStorage.getItem('www-claim-v2') || '0',
        'X-Requested-With': 'XMLHttpRequest',
      };
      return Fingerprint.getRandomizedHeaders(base);
    },

    async request(url, options = {}) {
      Safety.state.totalRequests++;

      // Simulate browsing occasionally
      if (Fingerprint.shouldSimulateActivity()) {
        const actDelay = Fingerprint.getActivityDelay();
        Console.info(`Simulating browsing activity (${Utils.formatTime(actDelay)})...`);
        await Utils.sleep(actDelay);
      }

      try {
        const res = await fetch(url, { credentials: 'include', ...options });

        if (res.status === 429) throw new RateLimitError('Rate limited (429). Instagram detected fast requests.');
        if (res.status === 401) throw new Error('Session expired. Please refresh Instagram and log in again.');
        if (res.status === 403) throw new Error('Forbidden (403). Your session may be invalid.');
        if (res.status === 400) {
          let body;
          try { body = await res.json(); } catch { body = {}; }
          if (body.message === 'challenge_required') throw new ChallengeError('Challenge required - Instagram wants verification');
          if (body.message === 'feedback_required') throw new ChallengeError('Feedback required - Account flagged');
          throw new Error(body.message || 'Bad request (400)');
        }
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      } catch (err) {
        if (err instanceof RateLimitError || err instanceof ChallengeError) throw err;
        if (err.name === 'TypeError' && err.message.includes('fetch')) {
          throw new NetworkError('Network error. Check your connection.');
        }
        throw err;
      }
    },

    async fetchAllFollowing(userId, onProgress) {
      Console.info('Fetching following list...');
      const users = [];
      let maxId = null;
      let page = 0;
      do {
        let url = `https://www.instagram.com/api/v1/friendships/${userId}/following/?count=100`;
        if (maxId) url += '&max_id=' + maxId;
        const data = await this.request(url, { headers: this.getHeaders() });
        users.push(...(data.users || []));
        maxId = data.next_max_id || null;
        page++;
        if (onProgress) onProgress(users.length, !!maxId);
        if (page % 5 === 0) Console.info(`Following: ${users.length} loaded (page ${page})`);
        if (maxId) await Utils.sleep(Fingerprint.getJitteredDelay(...Safety.config.scanDelay));
      } while (maxId);
      Console.success(`Following list complete: ${users.length} users`);
      return users;
    },

    async fetchAllFollowers(userId, onProgress) {
      Console.info('Fetching followers list...');
      const users = [];
      let maxId = null;
      let page = 0;
      do {
        let url = `https://www.instagram.com/api/v1/friendships/${userId}/followers/?count=100`;
        if (maxId) url += '&max_id=' + maxId;
        const data = await this.request(url, { headers: this.getHeaders() });
        users.push(...(data.users || []));
        maxId = data.next_max_id || null;
        page++;
        if (onProgress) onProgress(users.length, !!maxId);
        if (page % 5 === 0) Console.info(`Followers: ${users.length} loaded (page ${page})`);
        if (maxId) await Utils.sleep(Fingerprint.getJitteredDelay(...Safety.config.scanDelay));
      } while (maxId);
      Console.success(`Followers list complete: ${users.length} users`);
      return users;
    },

    async unfollow(targetId) {
      return this.request(
        `https://www.instagram.com/api/v1/friendships/destroy/${targetId}/`,
        {
          method: 'POST',
          headers: { ...this.getHeaders(), 'Content-Type': 'application/x-www-form-urlencoded' },
        }
      );
    },

    async getUserInfo(username) {
      try {
        const data = await this.request(
          `https://www.instagram.com/api/v1/users/web_profile_info/?username=${username}`,
          { headers: this.getHeaders() }
        );
        return data.data?.user || null;
      } catch { return null; }
    },
  };

  // ─── Whitelist (localStorage) ───────────────────────────────────────
  const Whitelist = {
    KEY: 'ig_unf_whitelist',
    _set: null,
    load() {
      try { this._set = new Set(JSON.parse(localStorage.getItem(this.KEY) || '[]').map(String)); }
      catch { this._set = new Set(); }
    },
    save() {
      try { localStorage.setItem(this.KEY, JSON.stringify([...this._set])); } catch {}
    },
    has(id) { return this._set.has(String(id)); },
    add(id) { this._set.add(String(id)); this.save(); },
    remove(id) { this._set.delete(String(id)); this.save(); },
    toggle(id) { this.has(id) ? this.remove(id) : this.add(id); },
    count() { return this._set.size; },
    getAll() { return [...this._set]; },
    importList(ids) {
      ids.forEach(id => this._set.add(String(id)));
      this.save();
    },
    exportList() { return [...this._set]; },
  };
  Whitelist.load();

  // ─── Activity Log (localStorage) ───────────────────────────────────
  const Log = {
    KEY: 'ig_unf_log',
    MAX: 1000,
    entries: [],
    load() {
      try { this.entries = JSON.parse(localStorage.getItem(this.KEY) || '[]'); }
      catch { this.entries = []; }
    },
    save() {
      if (this.entries.length > this.MAX) this.entries = this.entries.slice(-this.MAX);
      try { localStorage.setItem(this.KEY, JSON.stringify(this.entries)); } catch {}
    },
    add(type, data = {}) {
      this.entries.push({ type, ts: Date.now(), session: Safety.state.sessionId, ...data });
      this.save();
    },
    recent(n = 100) { return this.entries.slice(-n).reverse(); },
    clear() { this.entries = []; this.save(); },
    getStats() {
      const now = Date.now();
      const day = 86400000;
      const week = day * 7;
      return {
        total: this.entries.filter(e => e.type === 'unfollow').length,
        today: this.entries.filter(e => e.type === 'unfollow' && (now - e.ts) < day).length,
        thisWeek: this.entries.filter(e => e.type === 'unfollow' && (now - e.ts) < week).length,
        errors: this.entries.filter(e => e.type === 'error' && (now - e.ts) < day).length,
      };
    },
  };
  Log.load();

  // ─── Exporter ───────────────────────────────────────────────────────
  const Exporter = {
    download(content, filename, type) {
      const blob = new Blob([content], { type });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = filename;
      a.click();
      URL.revokeObjectURL(a.href);
    },
    csv(users, filename = 'non_followers') {
      const ts = new Date().toISOString().slice(0, 10);
      const rows = ['username,full_name,user_id,is_verified,is_private,profile_url'];
      users.forEach(u => {
        const uid = u.pk || u.id;
        rows.push([
          u.username,
          '"' + (u.full_name || '').replace(/"/g, '""') + '"',
          uid,
          u.is_verified ? 'true' : 'false',
          u.is_private ? 'true' : 'false',
          'https://instagram.com/' + u.username,
        ].join(','));
      });
      this.download(rows.join('\n'), `${filename}_${ts}.csv`, 'text/csv');
      Console.success(`Exported ${users.length} users to CSV`);
    },
    json(users, filename = 'non_followers') {
      const ts = new Date().toISOString().slice(0, 10);
      const data = users.map(u => ({
        username: u.username,
        full_name: u.full_name || '',
        id: u.pk || u.id,
        is_verified: !!u.is_verified,
        is_private: !!u.is_private,
        url: 'https://instagram.com/' + u.username,
      }));
      this.download(JSON.stringify(data, null, 2), `${filename}_${ts}.json`, 'application/json');
      Console.success(`Exported ${users.length} users to JSON`);
    },
    txt(users, filename = 'non_followers') {
      const ts = new Date().toISOString().slice(0, 10);
      const lines = users.map(u => u.username);
      this.download(lines.join('\n'), `${filename}_${ts}.txt`, 'text/plain');
      Console.success(`Exported ${users.length} usernames to TXT`);
    },
  };


  // ─── Sort Manager ───────────────────────────────────────────────────
  const Sorter = {
    current: 'default',
    options: {
      default: { label: 'Default', fn: () => 0 },
      alpha_asc: { label: 'A → Z', fn: (a, b) => a.username.localeCompare(b.username) },
      alpha_desc: { label: 'Z → A', fn: (a, b) => b.username.localeCompare(a.username) },
      verified: { label: 'Verified first', fn: (a, b) => (b.is_verified ? 1 : 0) - (a.is_verified ? 1 : 0) },
      private_first: { label: 'Private first', fn: (a, b) => (b.is_private ? 1 : 0) - (a.is_private ? 1 : 0) },
      public_first: { label: 'Public first', fn: (a, b) => (a.is_private ? 1 : 0) - (b.is_private ? 1 : 0) },
    },
    sort(arr) {
      if (this.current === 'default') return arr;
      return [...arr].sort(this.options[this.current].fn);
    },
  };

  // ─── DOM Helper ─────────────────────────────────────────────────────
  function el(tag, css, props = {}) {
    const e = document.createElement(tag);
    if (css) e.style.cssText = css;
    if (props.text) e.textContent = props.text;
    if (props.html) e.innerHTML = props.html;
    if (props.class) e.className = props.class;
    if (props.type) e.type = props.type;
    if (props.placeholder) e.placeholder = props.placeholder;
    if (props.title) e.title = props.title;
    return e;
  }

  // ─── State ──────────────────────────────────────────────────────────
  let allFollowing = [];
  let allFollowers = [];
  let nonFollowers = [];
  let fansOnly = []; // People who follow you but you don't follow back
  let filteredList = [];
  let selectedUsers = new Set();
  let searchQuery = '';
  let activeTab = 'list';
  let activeView = 'non_followers'; // 'non_followers' or 'fans'
  let isUnfollowing = false;
  let isScanComplete = false;

  // ─── Inject Styles ──────────────────────────────────────────────────
  const styleTag = document.createElement('style');
  styleTag.id = 'ig-unf-styles';
  styleTag.textContent = `
    @keyframes ig-unf-pulse { 0%,100%{opacity:.4} 50%{opacity:1} }
    @keyframes ig-unf-slide { 0%{transform:translateX(-100%)} 100%{transform:translateX(300%)} }
    @keyframes ig-unf-fadein { 0%{opacity:0;transform:scale(.96)} 100%{opacity:1;transform:scale(1)} }
    @keyframes ig-unf-spin { 0%{transform:rotate(0)} 100%{transform:rotate(360deg)} }
    .ig-unf-btn{transition:all .15s;cursor:pointer;border:0;font-weight:600;font-size:13px;border-radius:8px;padding:9px 16px;display:inline-flex;align-items:center;gap:6px;}
    .ig-unf-btn:hover{filter:brightness(1.15);}
    .ig-unf-btn:active{transform:scale(.97);}
    .ig-unf-btn:disabled{opacity:.5;cursor:not-allowed;filter:none;transform:none;}
    .ig-unf-tab{padding:8px 16px;border:0;background:transparent;color:${T.textMuted};cursor:pointer;font-size:13px;font-weight:500;border-bottom:2px solid transparent;transition:all .15s;}
    .ig-unf-tab:hover{color:${T.textSec};}
    .ig-unf-tab.active{color:${T.accent};border-bottom-color:${T.accent};}
    .ig-unf-scroll::-webkit-scrollbar{width:6px;}
    .ig-unf-scroll::-webkit-scrollbar-track{background:${T.bg};}
    .ig-unf-scroll::-webkit-scrollbar-thumb{background:${T.border};border-radius:3px;}
    .ig-unf-scroll::-webkit-scrollbar-thumb:hover{background:${T.borderLight};}
    .ig-unf-badge{display:inline-flex;align-items:center;gap:3px;font-size:10px;font-weight:600;padding:2px 6px;border-radius:10px;}
    .ig-unf-tooltip{position:absolute;bottom:calc(100% + 6px);left:50%;transform:translateX(-50%);background:${T.surfaceAlt};color:${T.text};font-size:11px;padding:4px 8px;border-radius:4px;white-space:nowrap;pointer-events:none;opacity:0;transition:opacity .15s;border:1px solid ${T.border};}
    .ig-unf-has-tooltip:hover .ig-unf-tooltip{opacity:1;}
    .ig-unf-kbd{background:${T.surfaceAlt};color:${T.textMuted};font-size:10px;padding:2px 5px;border-radius:3px;border:1px solid ${T.border};font-family:monospace;}
  `;
  document.head.appendChild(styleTag);

  // ─── Build UI ───────────────────────────────────────────────────────
  const overlay = el('div', `position:fixed;top:0;left:0;width:100%;height:100%;background:${T.overlay};display:flex;align-items:center;justify-content:center;z-index:99999;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif;padding:16px;box-sizing:border-box;animation:ig-unf-fadein .2s ease;`);
  document.body.appendChild(overlay);

  const panel = el('div', `background:${T.bg};border-radius:16px;width:100%;max-width:780px;height:92vh;display:flex;flex-direction:column;box-shadow:0 25px 80px rgba(0,0,0,.6);border:1px solid ${T.border};overflow:hidden;`);
  overlay.appendChild(panel);

  // ── Header ──
  const header = el('div', `padding:16px 20px 0;flex-shrink:0;`);
  panel.appendChild(header);

  // Title row
  const titleRow = el('div', 'display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;');
  const titleLeft = el('div', 'display:flex;align-items:center;gap:10px;');
  const titleEl = el('div', `font-size:18px;font-weight:700;color:${T.text};`, { text: 'Instagram Unfollow' });
  const versionBadge = el('span', `background:${T.accentLight};color:${T.accent};font-size:10px;font-weight:700;padding:3px 8px;border-radius:10px;`, { text: 'v3.0' });
  titleLeft.appendChild(titleEl);
  titleLeft.appendChild(versionBadge);

  const titleRight = el('div', 'display:flex;align-items:center;gap:8px;');
  const helpBtn = el('button', `background:${T.surfaceAlt};color:${T.textMuted};border:0;width:32px;height:32px;border-radius:50%;cursor:pointer;font-size:14px;display:flex;align-items:center;justify-content:center;`, { text: '?' });
  helpBtn.title = 'Keyboard shortcuts';
  const closeBtn = el('button', `background:${T.surfaceAlt};color:${T.textMuted};border:0;width:32px;height:32px;border-radius:50%;cursor:pointer;font-size:18px;display:flex;align-items:center;justify-content:center;line-height:1;`, { html: '&times;' });
  closeBtn.onclick = () => { if (!isUnfollowing) cleanup(); };
  titleRight.appendChild(helpBtn);
  titleRight.appendChild(closeBtn);

  titleRow.appendChild(titleLeft);
  titleRow.appendChild(titleRight);
  header.appendChild(titleRow);

  // Stats bar
  const statsBar = el('div', `display:none;gap:12px;flex-wrap:wrap;padding:10px 14px;background:${T.surface};border-radius:8px;margin-bottom:12px;font-size:12px;color:${T.textSec};`);
  header.appendChild(statsBar);

  function updateStats() {
    const daily = Safety.getDailyCount();
    const limit = Safety.config.dailyLimit;
    const hourly = Safety.getHourlyCount();
    statsBar.style.display = 'flex';
    statsBar.innerHTML = '';
    const items = [
      { label: 'Following', value: Utils.formatNum(allFollowing.length), color: T.accent },
      { label: 'Non-followers', value: Utils.formatNum(nonFollowers.length), color: T.danger },
      { label: 'Fans', value: Utils.formatNum(fansOnly.length), color: T.purple },
      { label: 'Protected', value: Utils.formatNum(Whitelist.count()), color: T.warning },
      { label: 'Today', value: daily + '/' + limit, color: daily >= limit * 0.8 ? T.danger : T.success },
      { label: 'Hour', value: hourly + '/' + Safety.config.hourlyLimit, color: hourly >= Safety.config.hourlyLimit * 0.8 ? T.warning : T.success },
    ];
    items.forEach(item => {
      const s = el('span', 'display:flex;align-items:center;gap:4px;');
      s.innerHTML = `<span style="width:6px;height:6px;border-radius:50%;background:${item.color};display:inline-block;"></span>` +
        `<span style="color:${T.textMuted};">${item.label}:</span> ` +
        `<span style="color:${T.text};font-weight:600;">${item.value}</span>`;
      statsBar.appendChild(s);
    });
  }

  // Status line
  const statusLine = el('div', `text-align:center;padding:8px 12px;background:${T.surface};border-radius:8px;color:${T.textSec};font-size:12px;margin-bottom:12px;display:flex;align-items:center;justify-content:center;gap:8px;`);
  statusLine.textContent = 'Ready to scan. Make sure you are on instagram.com';
  header.appendChild(statusLine);

  function setStatus(text, type = 'info') {
    const colors = { info: T.textSec, success: T.success, warn: T.warning, error: T.danger };
    statusLine.style.color = colors[type] || colors.info;
    statusLine.textContent = text;
  }

  // Progress bar
  const progressWrap = el('div', `width:100%;height:4px;background:${T.surface};border-radius:2px;margin-bottom:12px;overflow:hidden;display:none;`);
  const progressFill = el('div', `height:100%;background:${T.accent};width:0%;border-radius:2px;transition:width .3s;`);
  progressWrap.appendChild(progressFill);
  header.appendChild(progressWrap);

  function showProgress(show, indeterminate = false) {
    progressWrap.style.display = show ? 'block' : 'none';
    if (indeterminate) {
      progressFill.style.width = '30%';
      progressFill.style.animation = 'ig-unf-slide 1.5s ease-in-out infinite';
    } else {
      progressFill.style.animation = 'none';
    }
  }
  function setProgress(pct) {
    progressFill.style.animation = 'none';
    progressFill.style.width = Math.min(100, Math.round(pct)) + '%';
  }

  // Search + Sort row
  const searchRow = el('div', 'display:none;gap:8px;margin-bottom:12px;align-items:center;');
  const searchInput = el('input', `flex:1;padding:10px 14px;background:${T.surface};color:${T.text};border:1px solid ${T.border};border-radius:8px;font-size:13px;outline:none;box-sizing:border-box;`, { placeholder: 'Search by username or name... (Ctrl+F)' });
  searchInput.addEventListener('focus', () => { searchInput.style.borderColor = T.accent; });
  searchInput.addEventListener('blur', () => { searchInput.style.borderColor = T.border; });
  searchInput.addEventListener('input', (e) => { searchQuery = e.target.value.toLowerCase(); applyFilters(); });

  const sortSelect = el('select', `padding:10px 12px;background:${T.surface};color:${T.text};border:1px solid ${T.border};border-radius:8px;font-size:12px;outline:none;cursor:pointer;`);
  Object.entries(Sorter.options).forEach(([key, opt]) => {
    const o = document.createElement('option');
    o.value = key; o.textContent = opt.label;
    sortSelect.appendChild(o);
  });
  sortSelect.onchange = () => { Sorter.current = sortSelect.value; applyFilters(); };

  searchRow.appendChild(searchInput);
  searchRow.appendChild(sortSelect);
  header.appendChild(searchRow);

  // Tabs
  const tabBar = el('div', `display:none;border-bottom:1px solid ${T.border};margin-bottom:0;`);
  const tabs = {};
  ['list', 'whitelist', 'log', 'settings'].forEach(id => {
    const labels = { list: 'Non-Followers', whitelist: 'Whitelist', log: 'Activity', settings: 'Settings' };
    const btn = el('button', '', { text: labels[id] });
    btn.className = 'ig-unf-tab' + (id === 'list' ? ' active' : '');
    btn.onclick = () => switchTab(id);
    tabs[id] = btn;
    tabBar.appendChild(btn);
  });
  header.appendChild(tabBar);

  // Action buttons row
  const btnRow = el('div', 'display:flex;gap:8px;flex-wrap:wrap;padding:12px 0 0;align-items:center;');
  const scanBtn = el('button', `background:${T.accent};color:white;`, { text: '🔍 Scan' });
  scanBtn.className = 'ig-unf-btn';
  const selectAllBtn = el('button', `background:${T.surfaceAlt};color:${T.text};display:none;`, { text: 'Select All' });
  selectAllBtn.className = 'ig-unf-btn';
  const clearBtn = el('button', `background:${T.surfaceAlt};color:${T.textSec};display:none;`, { text: 'Clear' });
  clearBtn.className = 'ig-unf-btn';
  const exportBtn = el('button', `background:${T.surfaceAlt};color:${T.textSec};display:none;`, { text: '📥 Export' });
  exportBtn.className = 'ig-unf-btn';
  const viewToggle = el('button', `background:${T.surfaceAlt};color:${T.purple};display:none;margin-left:auto;`, { text: '👥 Fans' });
  viewToggle.className = 'ig-unf-btn';
  viewToggle.title = 'Toggle: Non-followers / Fans (people who follow you but you don\'t follow back)';

  [scanBtn, selectAllBtn, clearBtn, exportBtn, viewToggle].forEach(b => btnRow.appendChild(b));
  header.appendChild(btnRow);

  // ETA display
  const etaDisplay = el('div', `display:none;text-align:center;padding:6px 12px;background:${T.warningLight};border-radius:6px;margin-bottom:8px;font-size:11px;color:${T.warning};`);
  header.appendChild(etaDisplay);


  // ── Content Area ──
  const contentArea = el('div', `flex:1;overflow:hidden;position:relative;`);
  panel.appendChild(contentArea);

  // Tab panels
  const tabPanels = {};
  ['list', 'whitelist', 'log', 'settings'].forEach(id => {
    const p = el('div', `width:100%;height:100%;overflow-y:auto;${id !== 'list' ? 'display:none;' : ''}`);
    p.className = 'ig-unf-scroll';
    tabPanels[id] = p;
    contentArea.appendChild(p);
  });

  function switchTab(id) {
    activeTab = id;
    Object.keys(tabs).forEach(k => {
      tabs[k].className = 'ig-unf-tab' + (k === id ? ' active' : '');
      tabPanels[k].style.display = k === id ? 'block' : 'none';
    });
    if (id === 'list') renderVirtualList();
    else if (id === 'whitelist') renderWhitelist();
    else if (id === 'log') renderLog();
    else if (id === 'settings') renderSettings();
  }

  // ── Virtual Scroll (list tab) ──
  const ITEM_H = 60;
  const OVERSCAN = 5;
  const scrollInner = el('div', 'position:relative;');
  tabPanels.list.appendChild(scrollInner);
  let scrollRAF = null;

  tabPanels.list.addEventListener('scroll', () => {
    if (scrollRAF) cancelAnimationFrame(scrollRAF);
    scrollRAF = requestAnimationFrame(renderVirtualList);
  });

  function renderVirtualList() {
    const container = tabPanels.list;
    const data = filteredList;
    const totalH = data.length * ITEM_H;
    scrollInner.style.height = totalH + 'px';

    const scrollTop = container.scrollTop;
    const viewH = container.clientHeight;
    const start = Math.max(0, Math.floor(scrollTop / ITEM_H) - OVERSCAN);
    const end = Math.min(data.length, Math.ceil((scrollTop + viewH) / ITEM_H) + OVERSCAN);

    scrollInner.innerHTML = '';

    if (data.length === 0 && isScanComplete) {
      const emptyMsg = activeView === 'non_followers'
        ? (searchQuery ? `No results for "${searchQuery}"` : '🎉 Everyone follows you back!')
        : (searchQuery ? `No results for "${searchQuery}"` : 'No fans found (everyone you follow, follows you back)');
      const msg = el('div', `text-align:center;padding:40px 20px;color:${T.textMuted};font-size:14px;`, { text: emptyMsg });
      scrollInner.style.height = 'auto';
      scrollInner.appendChild(msg);
      return;
    }

    for (let i = start; i < end; i++) {
      const user = data[i];
      const uid = String(user.pk || user.id);
      const isSel = selectedUsers.has(uid);
      const isWL = Whitelist.has(uid);

      const row = el('div', `display:flex;align-items:center;gap:10px;padding:8px 20px;position:absolute;top:${i * ITEM_H}px;width:100%;box-sizing:border-box;cursor:pointer;background:${isSel ? T.surfaceSelected : 'transparent'};border-left:3px solid ${isSel ? T.accent : 'transparent'};transition:background .1s;`);
      row.onmouseenter = () => { if (!isSel) row.style.background = T.surfaceHover; };
      row.onmouseleave = () => { if (!isSel) row.style.background = 'transparent'; };

      // Profile pic
      const img = el('img', `width:40px;height:40px;border-radius:50%;object-fit:cover;flex-shrink:0;background:${T.border};`);
      img.loading = 'lazy';
      img.src = user.profile_pic_url;
      img.onerror = () => { img.style.background = T.borderLight; img.src = ''; };

      // Info
      const info = el('div', 'flex:1;min-width:0;');
      const nameRow = el('div', 'display:flex;align-items:center;gap:5px;');
      const uname = el('span', `font-weight:600;color:${T.text};font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;`, { text: '@' + user.username });
      nameRow.appendChild(uname);

      // Verified badge
      if (user.is_verified) {
        const verified = el('span', `color:${T.accent};font-size:12px;flex-shrink:0;`, { text: '✓' });
        verified.title = 'Verified account';
        nameRow.appendChild(verified);
      }

      // Private badge
      if (user.is_private) {
        const priv = el('span', `color:${T.textMuted};font-size:10px;flex-shrink:0;`, { text: '🔒' });
        priv.title = 'Private account';
        nameRow.appendChild(priv);
      }

      info.appendChild(nameRow);

      if (user.full_name) {
        const fname = el('div', `color:${T.textMuted};font-size:11px;margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;`, { text: user.full_name });
        info.appendChild(fname);
      }

      row.appendChild(img);
      row.appendChild(info);

      if (isWL && activeView === 'non_followers') {
        const shield = el('span', `color:${T.warning};font-size:11px;flex-shrink:0;background:${T.warningLight};padding:3px 8px;border-radius:12px;`, { text: '🛡️ Protected' });
        row.appendChild(shield);
        row.style.opacity = '0.6';
        row.onclick = () => {
          if (confirm(`Remove @${user.username} from whitelist?`)) {
            Whitelist.remove(uid);
            applyFilters();
            updateStats();
          }
        };
      } else if (activeView === 'non_followers') {
        // Checkbox
        const cb = el('input', `width:18px;height:18px;flex-shrink:0;accent-color:${T.accent};cursor:pointer;`);
        cb.type = 'checkbox';
        cb.checked = isSel;
        row.appendChild(cb);

        // Whitelist button
        const wlBtn = el('button', `background:transparent;border:0;color:${T.textMuted};cursor:pointer;font-size:14px;padding:4px;flex-shrink:0;opacity:0;transition:opacity .15s;`, { text: '🛡️' });
        wlBtn.title = 'Add to whitelist (protect from unfollow)';
        row.appendChild(wlBtn);
        row.onmouseenter = () => { wlBtn.style.opacity = '1'; if (!isSel) row.style.background = T.surfaceHover; };
        row.onmouseleave = () => { wlBtn.style.opacity = '0'; if (!isSel) row.style.background = 'transparent'; };

        wlBtn.onclick = (e) => {
          e.stopPropagation();
          Whitelist.add(uid);
          selectedUsers.delete(uid);
          applyFilters();
          updateStats();
          updateUnfollowBtn();
          Console.info(`Protected @${user.username}`);
        };

        row.onclick = (e) => {
          if (e.target === wlBtn) return;
          isSel ? selectedUsers.delete(uid) : selectedUsers.add(uid);
          updateUnfollowBtn();
          renderVirtualList();
        };
      } else {
        // Fans view - show "Follow back" indicator
        const fanBadge = el('span', `color:${T.purple};font-size:11px;flex-shrink:0;background:rgba(168,85,247,0.1);padding:3px 8px;border-radius:12px;`, { text: '♥ Fan' });
        row.appendChild(fanBadge);
        row.onclick = () => window.open('https://instagram.com/' + user.username, '_blank');
        row.title = 'Click to view profile';
      }

      scrollInner.appendChild(row);
    }
  }

  // ── Whitelist Tab ──
  function renderWhitelist() {
    const container = tabPanels.whitelist;
    container.innerHTML = '';

    const wlIds = Whitelist._set;
    if (wlIds.size === 0) {
      container.appendChild(el('div', `text-align:center;padding:40px 20px;color:${T.textMuted};font-size:14px;`, { text: 'No protected users yet. Click the 🛡️ icon on any user to protect them from unfollowing.' }));
      return;
    }

    // Header with count + clear all
    const wlHeader = el('div', `display:flex;align-items:center;justify-content:space-between;padding:12px 20px;border-bottom:1px solid ${T.border};`);
    wlHeader.appendChild(el('span', `color:${T.text};font-size:13px;font-weight:600;`, { text: `${wlIds.size} protected users` }));
    const clearAllWL = el('button', '', { text: 'Clear All' });
    clearAllWL.className = 'ig-unf-btn';
    clearAllWL.style.cssText += `background:${T.surfaceAlt};color:${T.danger};font-size:11px;padding:5px 12px;`;
    clearAllWL.onclick = () => {
      if (confirm('Remove ALL users from whitelist?')) {
        Whitelist._set.clear(); Whitelist.save();
        renderWhitelist(); applyFilters(); updateStats();
      }
    };
    wlHeader.appendChild(clearAllWL);
    container.appendChild(wlHeader);

    wlIds.forEach(id => {
      const user = allFollowing.find(u => String(u.pk || u.id) === id);
      const row = el('div', `display:flex;align-items:center;gap:12px;padding:12px 20px;border-bottom:1px solid ${T.border};`);

      if (user) {
        const img = el('img', `width:36px;height:36px;border-radius:50%;object-fit:cover;background:${T.border};`);
        img.src = user.profile_pic_url;
        row.appendChild(img);

        const info = el('div', 'flex:1;');
        const nameR = el('div', 'display:flex;align-items:center;gap:4px;');
        nameR.appendChild(el('span', `color:${T.text};font-size:13px;font-weight:600;`, { text: '@' + user.username }));
        if (user.is_verified) nameR.appendChild(el('span', `color:${T.accent};font-size:11px;`, { text: '✓' }));
        info.appendChild(nameR);
        if (user.full_name) info.appendChild(el('div', `color:${T.textMuted};font-size:11px;`, { text: user.full_name }));
        row.appendChild(info);
      } else {
        row.appendChild(el('div', `flex:1;color:${T.textSec};font-size:13px;`, { text: 'User ID: ' + id }));
      }

      const removeBtn = el('button', '', { text: 'Remove' });
      removeBtn.className = 'ig-unf-btn';
      removeBtn.style.cssText += `background:${T.surfaceAlt};color:${T.danger};font-size:11px;padding:5px 12px;`;
      removeBtn.onclick = () => {
        Whitelist.remove(id);
        renderWhitelist(); applyFilters(); updateStats();
      };
      row.appendChild(removeBtn);
      container.appendChild(row);
    });
  }

  // ── Activity Log Tab ──
  function renderLog() {
    const container = tabPanels.log;
    container.innerHTML = '';

    const entries = Log.recent(200);

    // Stats summary
    const stats = Log.getStats();
    const statsRow = el('div', `display:flex;gap:16px;padding:12px 20px;border-bottom:1px solid ${T.border};font-size:12px;`);
    [
      { label: 'Total unfollowed', value: stats.total, color: T.success },
      { label: 'Today', value: stats.today, color: T.accent },
      { label: 'This week', value: stats.thisWeek, color: T.purple },
      { label: 'Errors today', value: stats.errors, color: T.danger },
    ].forEach(s => {
      const d = el('div', '');
      d.innerHTML = `<div style="color:${T.textMuted};">${s.label}</div><div style="color:${s.color};font-weight:700;font-size:16px;">${s.value}</div>`;
      statsRow.appendChild(d);
    });
    container.appendChild(statsRow);

    if (entries.length === 0) {
      container.appendChild(el('div', `text-align:center;padding:40px 20px;color:${T.textMuted};font-size:14px;`, { text: 'No activity yet.' }));
      return;
    }

    // Clear + Export buttons
    const logActions = el('div', `padding:10px 20px;border-bottom:1px solid ${T.border};display:flex;gap:8px;justify-content:flex-end;`);
    const exportLogBtn = el('button', '', { text: 'Export Log' });
    exportLogBtn.className = 'ig-unf-btn';
    exportLogBtn.style.cssText += `background:${T.surfaceAlt};color:${T.textSec};font-size:11px;padding:5px 12px;`;
    exportLogBtn.onclick = () => {
      Exporter.download(JSON.stringify(Log.entries, null, 2), 'ig_unfollow_log.json', 'application/json');
    };
    const clearLogBtn = el('button', '', { text: 'Clear Log' });
    clearLogBtn.className = 'ig-unf-btn';
    clearLogBtn.style.cssText += `background:${T.surfaceAlt};color:${T.danger};font-size:11px;padding:5px 12px;`;
    clearLogBtn.onclick = () => { if (confirm('Clear all activity?')) { Log.clear(); renderLog(); } };
    logActions.appendChild(exportLogBtn);
    logActions.appendChild(clearLogBtn);
    container.appendChild(logActions);

    const colors = { unfollow: T.success, scan: T.accent, error: T.danger, rate_limit: T.warning, pause: T.warning, cancel: T.textMuted, whitelist: T.warning };
    const icons = { unfollow: '✓', scan: '🔍', error: '✗', rate_limit: '⚠', pause: '⏸', cancel: '■', whitelist: '🛡️' };

    entries.forEach(entry => {
      const row = el('div', `display:flex;align-items:flex-start;gap:10px;padding:8px 20px;border-bottom:1px solid ${T.border};font-size:12px;`);

      const icon = el('span', `color:${colors[entry.type] || T.textMuted};font-size:14px;flex-shrink:0;margin-top:1px;`, { text: icons[entry.type] || '-' });
      row.appendChild(icon);

      const content = el('div', 'flex:1;');
      let text = entry.type;
      if (entry.type === 'unfollow') text = 'Unfollowed @' + (entry.username || entry.userId);
      else if (entry.type === 'scan') text = `Scan: ${entry.following || 0} following, ${entry.nonFollowers || 0} non-followers`;
      else if (entry.type === 'error') text = 'Error: ' + (entry.message || 'Unknown');
      else if (entry.type === 'rate_limit') text = 'Rate limited - backed off';
      else if (entry.type === 'pause') text = 'Paused: ' + (entry.reason || '');
      else if (entry.type === 'whitelist') text = 'Whitelisted @' + (entry.username || entry.userId);
      content.appendChild(el('div', `color:${T.text};`, { text }));

      const time = new Date(entry.ts);
      content.appendChild(el('div', `color:${T.textMuted};font-size:11px;margin-top:2px;`,
        { text: time.toLocaleDateString() + ' ' + time.toLocaleTimeString() }));
      row.appendChild(content);

      container.appendChild(row);
    });
  }

  // ── Settings Tab ──
  function renderSettings() {
    const container = tabPanels.settings;
    container.innerHTML = '';

    const settingsGroups = [
      {
        title: '🛡️ Safety Limits',
        items: [
          { label: 'Daily limit', key: 'dailyLimit', type: 'number', min: 10, max: 200 },
          { label: 'Session limit', key: 'sessionLimit', type: 'number', min: 5, max: 100 },
          { label: 'Hourly limit', key: 'hourlyLimit', type: 'number', min: 5, max: 50 },
          { label: 'Batch size', key: 'batchSize', type: 'number', min: 3, max: 20 },
        ],
      },
      {
        title: '⏱️ Timing (milliseconds)',
        items: [
          { label: 'Min unfollow delay', key: 'unfollowDelay[0]', type: 'number', min: 5000, max: 60000 },
          { label: 'Max unfollow delay', key: 'unfollowDelay[1]', type: 'number', min: 10000, max: 120000 },
          { label: 'Min batch pause', key: 'batchPause[0]', type: 'number', min: 60000, max: 600000 },
          { label: 'Max batch pause', key: 'batchPause[1]', type: 'number', min: 120000, max: 900000 },
        ],
      },
    ];

    settingsGroups.forEach(group => {
      const section = el('div', `padding:16px 20px;border-bottom:1px solid ${T.border};`);
      section.appendChild(el('div', `color:${T.text};font-size:14px;font-weight:600;margin-bottom:12px;`, { text: group.title }));

      group.items.forEach(item => {
        const row = el('div', `display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;`);
        row.appendChild(el('label', `color:${T.textSec};font-size:12px;`, { text: item.label }));

        const input = el('input', `width:100px;padding:6px 10px;background:${T.surface};color:${T.text};border:1px solid ${T.border};border-radius:6px;font-size:12px;text-align:right;outline:none;`);
        input.type = 'number';
        input.min = item.min;
        input.max = item.max;

        // Get value
        if (item.key.includes('[')) {
          const [arrKey, idx] = item.key.replace(']', '').split('[');
          input.value = Safety.config[arrKey][parseInt(idx)];
          input.onchange = () => {
            const v = Math.max(item.min, Math.min(item.max, parseInt(input.value) || item.min));
            Safety.config[arrKey][parseInt(idx)] = v;
            input.value = v;
            Console.info(`Updated ${item.label} = ${v}`);
          };
        } else {
          input.value = Safety.config[item.key];
          input.onchange = () => {
            const v = Math.max(item.min, Math.min(item.max, parseInt(input.value) || item.min));
            Safety.config[item.key] = v;
            input.value = v;
            Console.info(`Updated ${item.label} = ${v}`);
          };
        }
        row.appendChild(input);
        section.appendChild(row);
      });

      container.appendChild(section);
    });

    // Data management
    const dataSection = el('div', `padding:16px 20px;`);
    dataSection.appendChild(el('div', `color:${T.text};font-size:14px;font-weight:600;margin-bottom:12px;`, { text: '💾 Data Management' }));

    const dataRow = el('div', 'display:flex;gap:8px;flex-wrap:wrap;');
    const resetBtn = el('button', '', { text: 'Reset Daily Count' });
    resetBtn.className = 'ig-unf-btn';
    resetBtn.style.cssText += `background:${T.surfaceAlt};color:${T.warning};font-size:11px;`;
    resetBtn.onclick = () => {
      localStorage.removeItem('ig_unf_daily');
      updateStats();
      Console.warn('Daily count reset');
    };

    const clearDataBtn = el('button', '', { text: 'Clear All Data' });
    clearDataBtn.className = 'ig-unf-btn';
    clearDataBtn.style.cssText += `background:${T.surfaceAlt};color:${T.danger};font-size:11px;`;
    clearDataBtn.onclick = () => {
      if (confirm('Clear ALL data (whitelist, logs, counts)?')) {
        localStorage.removeItem('ig_unf_daily');
        localStorage.removeItem('ig_unf_whitelist');
        localStorage.removeItem('ig_unf_log');
        Whitelist.load(); Log.load();
        updateStats();
        Console.warn('All data cleared');
      }
    };

    dataRow.appendChild(resetBtn);
    dataRow.appendChild(clearDataBtn);
    dataSection.appendChild(dataRow);

    // Info
    const infoDiv = el('div', `margin-top:16px;padding:12px;background:${T.surface};border-radius:8px;font-size:11px;color:${T.textMuted};line-height:1.6;`);
    infoDiv.innerHTML = `
      <div style="color:${T.text};font-weight:600;margin-bottom:4px;">Tips for safety:</div>
      • Lower limits = safer. Start with 20-30 unfollows/day.<br>
      • Increase delays if you get rate limited.<br>
      • Never run more than once per day.<br>
      • Stop immediately if you get a challenge/verification.<br>
      • Session ID: <code style="color:${T.accent};">${Safety.state.sessionId}</code>
    `;
    dataSection.appendChild(infoDiv);
    container.appendChild(dataSection);
  }


  // ── Footer ──
  const footer = el('div', `padding:12px 20px;border-top:1px solid ${T.border};flex-shrink:0;display:flex;gap:8px;align-items:center;`);
  panel.appendChild(footer);

  const unfollowBtn = el('button', `flex:1;background:${T.danger};color:white;display:none;font-size:14px;`, { text: 'Unfollow (0)' });
  unfollowBtn.className = 'ig-unf-btn';
  const pauseBtn = el('button', `background:${T.surfaceAlt};color:${T.warning};display:none;min-width:90px;`, { text: '⏸ Pause' });
  pauseBtn.className = 'ig-unf-btn';
  const cancelBtn = el('button', `background:${T.surfaceAlt};color:${T.danger};display:none;min-width:70px;`, { text: '■ Stop' });
  cancelBtn.className = 'ig-unf-btn';
  footer.appendChild(unfollowBtn);
  footer.appendChild(pauseBtn);
  footer.appendChild(cancelBtn);

  function updateUnfollowBtn() {
    const count = selectedUsers.size;
    unfollowBtn.textContent = `Unfollow (${count})`;
    // Show ETA
    if (count > 0) {
      const est = Utils.estimateTime(count, Safety.config.unfollowDelay[0], Safety.config.unfollowDelay[1], Safety.config.batchSize, Safety.config.batchPause[0]);
      etaDisplay.style.display = 'block';
      etaDisplay.textContent = `⏱ Estimated time for ${count} users: ~${Utils.formatTime(est)}`;
    } else {
      etaDisplay.style.display = 'none';
    }
  }

  // ── Filter Logic ──
  function applyFilters() {
    let list;
    if (activeView === 'non_followers') {
      list = nonFollowers.filter(u => !Whitelist.has(String(u.pk || u.id)));
    } else {
      list = fansOnly;
    }

    if (searchQuery) {
      list = list.filter(u =>
        u.username.toLowerCase().includes(searchQuery) ||
        (u.full_name && u.full_name.toLowerCase().includes(searchQuery))
      );
    }

    list = Sorter.sort(list);
    filteredList = list;
    if (activeTab === 'list') renderVirtualList();
  }

  function showPostScanUI(show) {
    const d = show ? 'inline-flex' : 'none';
    selectAllBtn.style.display = d;
    clearBtn.style.display = d;
    exportBtn.style.display = d;
    viewToggle.style.display = d;
    searchRow.style.display = show ? 'flex' : 'none';
    tabBar.style.display = show ? 'flex' : 'none';
    unfollowBtn.style.display = show ? 'block' : 'none';
    scanBtn.style.display = show ? 'none' : 'inline-flex';
  }

  // ─── Event Handlers ─────────────────────────────────────────────────

  // View toggle (non-followers vs fans)
  viewToggle.onclick = () => {
    if (activeView === 'non_followers') {
      activeView = 'fans';
      viewToggle.textContent = '🚫 Non-followers';
      viewToggle.style.color = T.danger;
      tabs.list.textContent = 'Fans';
      selectedUsers.clear();
      updateUnfollowBtn();
    } else {
      activeView = 'non_followers';
      viewToggle.textContent = '👥 Fans';
      viewToggle.style.color = T.purple;
      tabs.list.textContent = 'Non-Followers';
    }
    applyFilters();
  };

  // Scan
  scanBtn.onclick = async () => {
    scanBtn.disabled = true;
    showProgress(true, true);
    Console.info('Starting scan...');

    try {
      const userId = Utils.getUserID();
      if (!userId) throw new Error('Not logged in. Open instagram.com and log in first.');

      // Health check
      Console.info('Checking connection...');
      const healthy = await HealthCheck.check();
      if (!healthy) throw new NetworkError('Cannot reach Instagram. Check your connection.');

      setStatus('Scanning who you follow...', 'info');
      const following = await API.fetchAllFollowing(userId, (count, more) => {
        setStatus(`Following: ${Utils.formatNum(count)}${more ? '...' : ' ✓'}`, 'info');
      });

      setStatus('Scanning your followers...', 'info');
      const followers = await API.fetchAllFollowers(userId, (count, more) => {
        setStatus(`Followers: ${Utils.formatNum(count)}${more ? '...' : ' ✓'}`, 'info');
      });

      const followerIds = new Set(followers.map(u => String(u.pk || u.id)));
      const followingIds = new Set(following.map(u => String(u.pk || u.id)));

      allFollowing = following;
      allFollowers = followers;
      nonFollowers = following.filter(u => !followerIds.has(String(u.pk || u.id)));
      fansOnly = followers.filter(u => !followingIds.has(String(u.pk || u.id)));
      isScanComplete = true;

      Log.add('scan', { following: following.length, followers: followers.length, nonFollowers: nonFollowers.length, fans: fansOnly.length });

      showProgress(false);
      setStatus(`${Utils.formatNum(following.length)} following · ${Utils.formatNum(nonFollowers.length)} don't follow back · ${Utils.formatNum(fansOnly.length)} fans`, 'success');
      updateStats();
      applyFilters();
      showPostScanUI(true);

      Console.success('Scan complete!');
      Console.table({
        'Following': following.length,
        'Followers': followers.length,
        'Non-followers': nonFollowers.length,
        'Fans (follow you only)': fansOnly.length,
        'Whitelisted': Whitelist.count(),
      }, 'Scan Results');

    } catch (error) {
      showProgress(false);
      if (error instanceof RateLimitError) {
        setStatus('Rate limited. Wait a few minutes and try again.', 'error');
        Console.error('Rate limited during scan.');
      } else if (error instanceof NetworkError) {
        setStatus('Network error. Check your internet connection.', 'error');
        Console.error(error.message);
      } else {
        setStatus('Error: ' + error.message, 'error');
        Console.error(error.message);
      }
      scanBtn.disabled = false;
    }
  };

  // Select All
  selectAllBtn.onclick = () => {
    if (activeView !== 'non_followers') return;
    filteredList.forEach(u => {
      const uid = String(u.pk || u.id);
      if (!Whitelist.has(uid)) selectedUsers.add(uid);
    });
    updateUnfollowBtn();
    renderVirtualList();
    Console.info(`Selected ${selectedUsers.size} users`);
  };

  // Clear selection
  clearBtn.onclick = () => {
    selectedUsers.clear();
    updateUnfollowBtn();
    renderVirtualList();
  };

  // Export menu
  exportBtn.onclick = () => {
    const menu = el('div', `position:absolute;bottom:100%;left:0;background:${T.surface};border:1px solid ${T.border};border-radius:8px;overflow:hidden;z-index:10;box-shadow:0 4px 20px rgba(0,0,0,.4);`);
    const options = [
      { text: '📄 Export CSV', action: () => Exporter.csv(filteredList) },
      { text: '📋 Export JSON', action: () => Exporter.json(filteredList) },
      { text: '📝 Export TXT (usernames)', action: () => Exporter.txt(filteredList) },
    ];
    options.forEach((opt, idx) => {
      const item = el('div', `padding:10px 20px;color:${T.text};cursor:pointer;font-size:13px;white-space:nowrap;${idx > 0 ? `border-top:1px solid ${T.border};` : ''}`, { text: opt.text });
      item.onmouseenter = () => { item.style.background = T.surfaceHover; };
      item.onmouseleave = () => { item.style.background = 'transparent'; };
      item.onclick = () => { opt.action(); menu.remove(); };
      menu.appendChild(item);
    });
    exportBtn.style.position = 'relative';
    exportBtn.appendChild(menu);
    setTimeout(() => document.addEventListener('click', function rm() { menu.remove(); document.removeEventListener('click', rm); }, { once: true }), 10);
  };

  // Pause/Resume
  pauseBtn.onclick = () => {
    if (Safety.state.isPaused) {
      Safety.resume();
      pauseBtn.textContent = '⏸ Pause';
      pauseBtn.style.color = T.warning;
      Console.info('Resumed');
    } else {
      Safety.pause();
      pauseBtn.textContent = '▶ Resume';
      pauseBtn.style.color = T.success;
      setStatus('Paused. Click Resume to continue.', 'warn');
      Console.warn('Paused by user');
    }
  };

  // Cancel
  cancelBtn.onclick = () => {
    if (confirm('Stop the unfollow process?')) {
      Safety.cancel();
      Log.add('cancel', {});
      Console.warn('Cancelled by user');
    }
  };

  // Help dialog
  helpBtn.onclick = () => {
    const helpOverlay = el('div', `position:absolute;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.7);display:flex;align-items:center;justify-content:center;z-index:10;`);
    const helpCard = el('div', `background:${T.bg};border:1px solid ${T.border};border-radius:12px;padding:24px;max-width:400px;width:90%;`);
    helpCard.innerHTML = `
      <div style="color:${T.text};font-size:16px;font-weight:700;margin-bottom:16px;">⌨️ Keyboard Shortcuts</div>
      <div style="display:grid;grid-template-columns:auto 1fr;gap:8px 16px;font-size:12px;">
        <span class="ig-unf-kbd">Esc</span><span style="color:${T.textSec};">Close panel</span>
        <span class="ig-unf-kbd">Ctrl+F</span><span style="color:${T.textSec};">Focus search</span>
        <span class="ig-unf-kbd">Ctrl+A</span><span style="color:${T.textSec};">Select all</span>
        <span class="ig-unf-kbd">Ctrl+D</span><span style="color:${T.textSec};">Deselect all</span>
        <span class="ig-unf-kbd">Space</span><span style="color:${T.textSec};">Pause/Resume</span>
        <span class="ig-unf-kbd">1-4</span><span style="color:${T.textSec};">Switch tabs</span>
      </div>
      <div style="margin-top:16px;font-size:11px;color:${T.textMuted};">
        v3.0 · Anti-ban protection · github.com/RanuK12/ig-unfollow
      </div>
    `;
    helpOverlay.appendChild(helpCard);
    helpOverlay.onclick = (e) => { if (e.target === helpOverlay) helpOverlay.remove(); };
    panel.style.position = 'relative';
    panel.appendChild(helpOverlay);
  };


  // ─── Unfollow Process ───────────────────────────────────────────────
  unfollowBtn.onclick = async () => {
    if (selectedUsers.size === 0) { setStatus('Select at least one user.', 'warn'); return; }
    if (!confirm(`Unfollow ${selectedUsers.size} users?\n\nThis will take approximately ${Utils.formatTime(Utils.estimateTime(selectedUsers.size, Safety.config.unfollowDelay[0], Safety.config.unfollowDelay[1], Safety.config.batchSize, Safety.config.batchPause[0]))} due to safety delays.`)) return;

    isUnfollowing = true;
    Safety.reset();
    unfollowBtn.disabled = true;
    pauseBtn.style.display = 'inline-flex';
    cancelBtn.style.display = 'inline-flex';
    showProgress(true);
    etaDisplay.style.display = 'none';

    Console.system(`Starting unfollow process: ${selectedUsers.size} targets`);
    Console.info(`Session: ${Safety.state.sessionId}`);

    const targets = [...selectedUsers];
    const total = targets.length;
    let completed = 0;
    let failed = 0;
    const startTime = Date.now();

    for (const uid of targets) {
      await Safety.waitIfPaused();

      const check = Safety.canContinue();
      if (!check.ok) {
        setStatus(check.reason, 'warn');
        Log.add('pause', { reason: check.reason });
        Console.warn(`Stopped: ${check.reason}`);
        break;
      }

      // Periodic health check
      if (completed > 0 && completed % 10 === 0) {
        const healthy = await HealthCheck.check();
        if (!healthy) {
          setStatus('Connection lost. Waiting for reconnect...', 'error');
          Console.error('Connection lost. Waiting...');
          const reconnected = await HealthCheck.waitForConnection(120000);
          if (!reconnected) {
            setStatus('Could not reconnect. Stopping.', 'error');
            break;
          }
          Console.success('Reconnected!');
          await Utils.sleep(5000);
        }
      }

      // Force long pause periodically
      if (Safety.shouldForceLongPause()) {
        const longPause = Safety.getLongPause();
        setStatus(`Mandatory safety pause: ${Utils.formatTime(longPause)}...`, 'warn');
        Console.warn(`Forced safety pause: ${Utils.formatTime(longPause)}`);
        Log.add('pause', { reason: 'forced_safety', duration: longPause });
        await Utils.sleep(longPause);
        await Safety.waitIfPaused();
      }

      const user = allFollowing.find(u => String(u.pk || u.id) === uid);
      const username = user ? user.username : uid;

      try {
        await API.unfollow(uid);
        completed++;
        Safety.state.sessionCount++;
        Safety.incrementDaily();
        Safety.incrementHourly();
        Safety.resetErrors();
        selectedUsers.delete(uid);
        nonFollowers = nonFollowers.filter(u => String(u.pk || u.id) !== uid);
        allFollowing = allFollowing.filter(u => String(u.pk || u.id) !== uid);
        Log.add('unfollow', { username, userId: uid });
        Console.success(`Unfollowed @${username} (${completed}/${total})`);
      } catch (error) {
        failed++;
        const errInfo = Safety.handleError(error);
        Log.add('error', { message: error.message, userId: uid });

        if (errInfo.fatal) {
          setStatus('⚠️ Challenge required! Instagram wants verification. Stopping immediately.', 'error');
          Log.add('rate_limit', { message: 'challenge_required' });
          Console.error('FATAL: Challenge required. Stop all automation.');
          break;
        }

        if (Safety.state.consecutiveErrors >= Safety.config.maxConsecutiveErrors) {
          setStatus(`Too many consecutive errors (${Safety.state.consecutiveErrors}). Stopping for safety.`, 'error');
          Console.error('Max consecutive errors reached. Stopping.');
          break;
        }

        setStatus(`Error on @${username} - backing off ${Utils.formatTime(errInfo.delay)}...`, 'warn');
        Console.warn(`Error: ${error.message}. Backing off ${Utils.formatTime(errInfo.delay)}`);
        await Utils.sleep(errInfo.delay);
        continue;
      }

      setProgress((completed / total) * 100);
      updateUnfollowBtn();

      // Batch pause
      if (Safety.shouldBatchPause()) {
        const pause = Safety.getBatchPause();
        setStatus(`Safety batch pause: ${Utils.formatTime(pause)} (${completed}/${total} done)`, 'warn');
        Console.info(`Batch pause: ${Utils.formatTime(pause)} (${completed}/${total})`);
        Log.add('pause', { reason: 'batch', duration: pause });
        await Utils.sleep(pause);
        await Safety.waitIfPaused();
      } else {
        const delay = Safety.getNextDelay();
        const elapsed = Date.now() - startTime;
        const rate = completed / (elapsed / 60000);
        setStatus(`✓ @${username} (${completed}/${total}) · waiting ${Utils.formatTime(delay)} · ${rate.toFixed(1)}/min`, 'info');
        await Utils.sleep(delay);
      }
    }

    showProgress(false);
    isUnfollowing = false;
    unfollowBtn.disabled = false;
    pauseBtn.style.display = 'none';
    cancelBtn.style.display = 'none';

    const elapsed = Date.now() - startTime;
    const msg = `Done! ${completed} unfollowed${failed > 0 ? `, ${failed} failed` : ''} in ${Utils.formatTime(elapsed)}`;
    setStatus(msg, completed > 0 ? 'success' : 'warn');
    Console.success(msg);
    Console.table({ Completed: completed, Failed: failed, Time: Utils.formatTime(elapsed), 'Rate': (completed / (elapsed / 60000)).toFixed(2) + '/min' }, 'Unfollow Summary');

    updateStats();
    applyFilters();
    updateUnfollowBtn();

    if (nonFollowers.length === 0) {
      showPostScanUI(false);
      scanBtn.style.display = 'inline-flex';
      scanBtn.disabled = false;
    }
  };

  // ─── Keyboard Shortcuts ─────────────────────────────────────────────
  const keyHandler = (e) => {
    // Escape to close (only when not unfollowing)
    if (e.key === 'Escape' && !isUnfollowing) {
      cleanup();
      return;
    }

    // Don't intercept if typing in input
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    // Ctrl+F - focus search
    if (e.ctrlKey && e.key === 'f' && isScanComplete) {
      e.preventDefault();
      searchInput.focus();
      return;
    }

    // Ctrl+A - select all
    if (e.ctrlKey && e.key === 'a' && isScanComplete && activeView === 'non_followers') {
      e.preventDefault();
      selectAllBtn.click();
      return;
    }

    // Ctrl+D - deselect all
    if (e.ctrlKey && e.key === 'd' && isScanComplete) {
      e.preventDefault();
      clearBtn.click();
      return;
    }

    // Space - pause/resume
    if (e.key === ' ' && isUnfollowing) {
      e.preventDefault();
      pauseBtn.click();
      return;
    }

    // Number keys for tabs
    if (isScanComplete && ['1', '2', '3', '4'].includes(e.key)) {
      const tabKeys = ['list', 'whitelist', 'log', 'settings'];
      switchTab(tabKeys[parseInt(e.key) - 1]);
    }
  };
  document.addEventListener('keydown', keyHandler);

  // ─── Cleanup ────────────────────────────────────────────────────────
  function cleanup() {
    overlay.remove();
    styleTag.remove();
    document.removeEventListener('keydown', keyHandler);
    Console.system('Panel closed. Data preserved in localStorage.');
  }

  Console.success('Tool loaded! Click "Scan" to begin.');
  Console.info('Keyboard shortcuts: Press ? button or Esc to close.');
})();
