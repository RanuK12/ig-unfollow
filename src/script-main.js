// Instagram Unfollow Tool v2.0
// Identifies and unfollows users who don't follow you back
// Run from browser console on instagram.com: paste this code and press Enter

(async () => {
  // ─── Error Classes ───────────────────────────────────────────────────
  class RateLimitError extends Error {
    constructor(m) { super(m); this.name = 'RateLimitError'; }
  }
  class ChallengeError extends Error {
    constructor(m) { super(m); this.name = 'ChallengeError'; }
  }

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
    danger: '#ef4444',
    dangerHover: '#dc2626',
    success: '#22c55e',
    warning: '#f59e0b',
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
  };

  // ─── Safety Manager (Anti-Ban) ──────────────────────────────────────
  const Safety = {
    config: {
      unfollowDelay: [8000, 15000],
      scanDelay: [400, 800],
      batchPause: [120000, 300000],
      batchSize: 10,
      dailyLimit: 120,
      sessionLimit: 60,
      initialBackoff: 60000,
      maxBackoff: 600000,
      backoffMultiplier: 2,
    },
    state: {
      sessionCount: 0,
      consecutiveErrors: 0,
      currentBackoff: 60000,
      isPaused: false,
      pauseResolve: null,
      isCancelled: false,
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
    canContinue() {
      if (this.state.isCancelled) return { ok: false, reason: 'Cancelled' };
      if (this.getDailyCount() >= this.config.dailyLimit)
        return { ok: false, reason: 'Daily limit reached (' + this.config.dailyLimit + ')' };
      if (this.state.sessionCount >= this.config.sessionLimit)
        return { ok: false, reason: 'Session limit reached (' + this.config.sessionLimit + '). Restart later.' };
      return { ok: true };
    },
    getNextDelay() {
      const [min, max] = this.config.unfollowDelay;
      if (Math.random() < 0.1) return Utils.randomDelay(20000, 40000);
      return Utils.randomDelay(min, max);
    },
    shouldBatchPause() {
      return this.state.sessionCount > 0 && this.state.sessionCount % this.config.batchSize === 0;
    },
    getBatchPause() {
      return Utils.randomDelay(...this.config.batchPause);
    },
    handleError(error) {
      this.state.consecutiveErrors++;
      const fatal = error instanceof ChallengeError;
      const delay = Math.min(
        this.state.currentBackoff * this.state.consecutiveErrors,
        this.config.maxBackoff
      );
      this.state.currentBackoff *= this.config.backoffMultiplier;
      return { delay, fatal };
    },
    resetErrors() {
      this.state.consecutiveErrors = 0;
      this.state.currentBackoff = this.config.initialBackoff;
    },
    pause() {
      this.state.isPaused = true;
    },
    resume() {
      this.state.isPaused = false;
      if (this.state.pauseResolve) {
        this.state.pauseResolve();
        this.state.pauseResolve = null;
      }
    },
    cancel() {
      this.state.isCancelled = true;
      this.resume();
    },
    reset() {
      this.state.sessionCount = 0;
      this.state.consecutiveErrors = 0;
      this.state.currentBackoff = this.config.initialBackoff;
      this.state.isPaused = false;
      this.state.isCancelled = false;
      this.state.pauseResolve = null;
    },
    async waitIfPaused() {
      while (this.state.isPaused && !this.state.isCancelled) {
        await new Promise(r => { this.state.pauseResolve = r; });
      }
    },
  };

  // ─── Instagram API (v1 REST) ────────────────────────────────────────
  const API = {
    getHeaders() {
      const csrf = Utils.getCSRFToken();
      if (!csrf) throw new Error('No CSRF token. Make sure you are logged in.');
      return {
        'X-CSRFToken': csrf,
        'X-IG-App-ID': '936619743392459',
        'X-IG-WWW-Claim': sessionStorage.getItem('www-claim-v2') || '0',
        'X-Requested-With': 'XMLHttpRequest',
      };
    },
    async request(url, options = {}) {
      const res = await fetch(url, { credentials: 'include', ...options });
      if (res.status === 429) throw new RateLimitError('Rate limited (429)');
      if (res.status === 400) {
        let body;
        try { body = await res.json(); } catch { body = {}; }
        if (body.message === 'challenge_required') throw new ChallengeError('Challenge required');
        throw new Error(body.message || 'Bad request');
      }
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.json();
    },
    async fetchAllFollowing(userId, onProgress) {
      const users = [];
      let maxId = null;
      do {
        let url = 'https://www.instagram.com/api/v1/friendships/' + userId + '/following/?count=100';
        if (maxId) url += '&max_id=' + maxId;
        const data = await this.request(url, { headers: this.getHeaders() });
        users.push(...(data.users || []));
        maxId = data.next_max_id || null;
        if (onProgress) onProgress(users.length, !!maxId);
        if (maxId) await Utils.sleep(Utils.randomDelay(...Safety.config.scanDelay));
      } while (maxId);
      return users;
    },
    async fetchAllFollowers(userId, onProgress) {
      const users = [];
      let maxId = null;
      do {
        let url = 'https://www.instagram.com/api/v1/friendships/' + userId + '/followers/?count=100';
        if (maxId) url += '&max_id=' + maxId;
        const data = await this.request(url, { headers: this.getHeaders() });
        users.push(...(data.users || []));
        maxId = data.next_max_id || null;
        if (onProgress) onProgress(users.length, !!maxId);
        if (maxId) await Utils.sleep(Utils.randomDelay(...Safety.config.scanDelay));
      } while (maxId);
      return users;
    },
    async unfollow(targetId) {
      return this.request(
        'https://www.instagram.com/api/v1/friendships/destroy/' + targetId + '/',
        {
          method: 'POST',
          headers: { ...this.getHeaders(), 'Content-Type': 'application/x-www-form-urlencoded' },
        }
      );
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
  };
  Whitelist.load();

  // ─── Activity Log (localStorage) ───────────────────────────────────
  const Log = {
    KEY: 'ig_unf_log',
    MAX: 500,
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
      this.entries.push({ type, ts: Date.now(), ...data });
      this.save();
    },
    recent(n = 100) { return this.entries.slice(-n).reverse(); },
    clear() { this.entries = []; this.save(); },
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
    csv(users) {
      const rows = ['username,full_name,user_id,profile_url'];
      users.forEach(u => {
        const uid = u.pk || u.id;
        rows.push(u.username + ',"' + (u.full_name || '').replace(/"/g, '""') + '",' + uid + ',https://instagram.com/' + u.username);
      });
      this.download(rows.join('\n'), 'non_followers.csv', 'text/csv');
    },
    json(users) {
      const data = users.map(u => ({
        username: u.username, full_name: u.full_name || '', id: u.pk || u.id,
        url: 'https://instagram.com/' + u.username,
      }));
      this.download(JSON.stringify(data, null, 2), 'non_followers.json', 'application/json');
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
    return e;
  }

  // ─── State ──────────────────────────────────────────────────────────
  let allFollowing = [];
  let nonFollowers = [];
  let filteredList = [];
  let selectedUsers = new Set();
  let searchQuery = '';
  let activeTab = 'list';
  let isUnfollowing = false;

  // ─── Inject Styles ──────────────────────────────────────────────────
  const styleTag = document.createElement('style');
  styleTag.textContent = `
    @keyframes ig-unf-pulse { 0%,100%{opacity:.4} 50%{opacity:1} }
    @keyframes ig-unf-slide { 0%{transform:translateX(-100%)} 100%{transform:translateX(300%)} }
    .ig-unf-btn{transition:all .15s;cursor:pointer;border:0;font-weight:600;font-size:13px;border-radius:8px;padding:9px 16px;}
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
  `;
  document.head.appendChild(styleTag);

  // ─── Build UI ───────────────────────────────────────────────────────
  const overlay = el('div', `position:fixed;top:0;left:0;width:100%;height:100%;background:${T.overlay};display:flex;align-items:center;justify-content:center;z-index:99999;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif;padding:16px;box-sizing:border-box;`);
  document.body.appendChild(overlay);

  const panel = el('div', `background:${T.bg};border-radius:16px;width:100%;max-width:720px;height:90vh;display:flex;flex-direction:column;box-shadow:0 25px 80px rgba(0,0,0,.6);border:1px solid ${T.border};overflow:hidden;`);
  overlay.appendChild(panel);

  // ── Header ──
  const header = el('div', `padding:16px 20px 0;flex-shrink:0;`);
  panel.appendChild(header);

  // Title row
  const titleRow = el('div', 'display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;');
  const titleEl = el('div', `font-size:18px;font-weight:700;color:${T.text};`, { text: 'Instagram Unfollow' });
  const closeBtn = el('button', `background:${T.surfaceAlt};color:${T.textMuted};border:0;width:32px;height:32px;border-radius:50%;cursor:pointer;font-size:18px;display:flex;align-items:center;justify-content:center;line-height:1;`, { html: '&times;' });
  closeBtn.onclick = () => { overlay.remove(); styleTag.remove(); };
  titleRow.appendChild(titleEl);
  titleRow.appendChild(closeBtn);
  header.appendChild(titleRow);

  // Stats bar
  const statsBar = el('div', `display:flex;gap:12px;flex-wrap:wrap;padding:10px 14px;background:${T.surface};border-radius:8px;margin-bottom:12px;font-size:12px;color:${T.textSec};display:none;`);
  header.appendChild(statsBar);

  function updateStats() {
    const daily = Safety.getDailyCount();
    const limit = Safety.config.dailyLimit;
    statsBar.style.display = 'flex';
    statsBar.innerHTML = '';
    const items = [
      { label: 'Following', value: Utils.formatNum(allFollowing.length), color: T.accent },
      { label: 'Non-followers', value: Utils.formatNum(nonFollowers.length), color: T.danger },
      { label: 'Protected', value: Utils.formatNum(Whitelist.count()), color: T.warning },
      { label: 'Today', value: daily + '/' + limit, color: daily >= limit ? T.danger : T.success },
    ];
    items.forEach(item => {
      const s = el('span', 'display:flex;align-items:center;gap:4px;');
      s.innerHTML = '<span style="width:6px;height:6px;border-radius:50%;background:' + item.color + ';display:inline-block;"></span>' +
        '<span style="color:' + T.textMuted + ';">' + item.label + ':</span> ' +
        '<span style="color:' + T.text + ';font-weight:600;">' + item.value + '</span>';
      statsBar.appendChild(s);
    });
  }

  // Status line
  const statusLine = el('div', `text-align:center;padding:8px 12px;background:${T.surface};border-radius:8px;color:${T.textSec};font-size:12px;margin-bottom:12px;`, { text: 'Ready to scan. Make sure you are on instagram.com' });
  header.appendChild(statusLine);

  function setStatus(text) { statusLine.textContent = text; }

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

  // Search input
  const searchInput = el('input', `width:100%;padding:10px 14px;background:${T.surface};color:${T.text};border:1px solid ${T.border};border-radius:8px;font-size:13px;outline:none;margin-bottom:12px;box-sizing:border-box;display:none;`, { placeholder: 'Search by username or name...' });
  searchInput.addEventListener('focus', () => { searchInput.style.borderColor = T.accent; });
  searchInput.addEventListener('blur', () => { searchInput.style.borderColor = T.border; });
  searchInput.addEventListener('input', (e) => { searchQuery = e.target.value.toLowerCase(); applyFilters(); });
  header.appendChild(searchInput);

  // Tabs
  const tabBar = el('div', `display:flex;border-bottom:1px solid ${T.border};margin-bottom:0;display:none;`);
  const tabs = {};
  ['list', 'whitelist', 'log'].forEach(id => {
    const labels = { list: 'Non-Followers', whitelist: 'Whitelist', log: 'Activity' };
    const btn = el('button', '', { text: labels[id] });
    btn.className = 'ig-unf-tab' + (id === 'list' ? ' active' : '');
    btn.onclick = () => switchTab(id);
    tabs[id] = btn;
    tabBar.appendChild(btn);
  });
  header.appendChild(tabBar);

  // Action buttons
  const btnRow = el('div', 'display:flex;gap:8px;flex-wrap:wrap;padding:12px 0 0;');
  const scanBtn = el('button', `background:${T.accent};color:white;`, { text: 'Scan' });
  scanBtn.className = 'ig-unf-btn';
  const selectAllBtn = el('button', `background:${T.surfaceAlt};color:${T.text};display:none;`, { text: 'Select All' });
  selectAllBtn.className = 'ig-unf-btn';
  const clearBtn = el('button', `background:${T.surfaceAlt};color:${T.textSec};display:none;`, { text: 'Clear' });
  clearBtn.className = 'ig-unf-btn';
  const exportBtn = el('button', `background:${T.surfaceAlt};color:${T.textSec};display:none;`, { text: 'Export' });
  exportBtn.className = 'ig-unf-btn';

  [scanBtn, selectAllBtn, clearBtn, exportBtn].forEach(b => btnRow.appendChild(b));
  header.appendChild(btnRow);

  // ── Content Area ──
  const contentArea = el('div', `flex:1;overflow:hidden;position:relative;`);
  panel.appendChild(contentArea);

  // Tab panels
  const tabPanels = {};
  ['list', 'whitelist', 'log'].forEach(id => {
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
  }

  // ── Virtual Scroll (list tab) ──
  const ITEM_H = 56;
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

    if (data.length === 0 && allFollowing.length > 0) {
      const msg = el('div', `text-align:center;padding:40px 20px;color:${T.textMuted};font-size:14px;`,
        { text: searchQuery ? 'No results for "' + searchQuery + '"' : 'Everyone follows you back!' });
      scrollInner.style.height = 'auto';
      scrollInner.appendChild(msg);
      return;
    }

    for (let i = start; i < end; i++) {
      const user = data[i];
      const uid = String(user.pk || user.id);
      const isSel = selectedUsers.has(uid);
      const isWL = Whitelist.has(uid);

      const row = el('div', `display:flex;align-items:center;gap:10px;padding:7px 20px;position:absolute;top:${i * ITEM_H}px;width:100%;box-sizing:border-box;cursor:pointer;background:${isSel ? T.surfaceSelected : 'transparent'};border-left:3px solid ${isSel ? T.accent : 'transparent'};transition:background .1s;`);
      row.onmouseenter = () => { if (!isSel) row.style.background = T.surfaceHover; };
      row.onmouseleave = () => { if (!isSel) row.style.background = 'transparent'; };

      const img = el('img', `width:36px;height:36px;border-radius:50%;object-fit:cover;flex-shrink:0;background:${T.border};`);
      img.loading = 'lazy';
      img.src = user.profile_pic_url;
      img.onerror = () => { img.style.background = T.borderLight; };

      const info = el('div', 'flex:1;min-width:0;');
      const uname = el('div', `font-weight:600;color:${T.text};font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;`, { text: '@' + user.username });
      info.appendChild(uname);
      if (user.full_name) {
        const fname = el('div', `color:${T.textMuted};font-size:11px;margin-top:1px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;`, { text: user.full_name });
        info.appendChild(fname);
      }

      row.appendChild(img);
      row.appendChild(info);

      if (isWL) {
        const shield = el('span', `color:${T.warning};font-size:11px;flex-shrink:0;background:rgba(245,158,11,.15);padding:3px 8px;border-radius:12px;`, { text: 'Protected' });
        row.appendChild(shield);
        row.style.opacity = '0.6';
        row.onclick = () => {
          if (confirm('Remove @' + user.username + ' from whitelist?')) {
            Whitelist.remove(uid);
            applyFilters();
            updateStats();
          }
        };
      } else {
        const cb = el('input', `width:18px;height:18px;flex-shrink:0;accent-color:${T.accent};cursor:pointer;`);
        cb.type = 'checkbox';
        cb.checked = isSel;
        row.appendChild(cb);

        // Whitelist button (small shield)
        const wlBtn = el('button', `background:transparent;border:0;color:${T.textMuted};cursor:pointer;font-size:14px;padding:4px;flex-shrink:0;opacity:0;transition:opacity .15s;`, { text: '\u{1F6E1}' });
        wlBtn.title = 'Add to whitelist';
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
        };

        row.onclick = (e) => {
          if (e.target === wlBtn) return;
          isSel ? selectedUsers.delete(uid) : selectedUsers.add(uid);
          updateUnfollowBtn();
          renderVirtualList();
        };
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
      container.appendChild(el('div', `text-align:center;padding:40px 20px;color:${T.textMuted};font-size:14px;`, { text: 'No protected users. Click the shield icon on any user to protect them.' }));
      return;
    }

    wlIds.forEach(id => {
      const user = allFollowing.find(u => String(u.pk || u.id) === id);
      const row = el('div', `display:flex;align-items:center;gap:12px;padding:12px 20px;border-bottom:1px solid ${T.border};`);

      if (user) {
        const img = el('img', `width:36px;height:36px;border-radius:50%;object-fit:cover;background:${T.border};`);
        img.src = user.profile_pic_url;
        row.appendChild(img);

        const info = el('div', 'flex:1;');
        info.appendChild(el('div', `color:${T.text};font-size:13px;font-weight:600;`, { text: '@' + user.username }));
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
        renderWhitelist();
        applyFilters();
        updateStats();
      };
      row.appendChild(removeBtn);
      container.appendChild(row);
    });
  }

  // ── Activity Log Tab ──
  function renderLog() {
    const container = tabPanels.log;
    container.innerHTML = '';

    const entries = Log.recent(100);
    if (entries.length === 0) {
      container.appendChild(el('div', `text-align:center;padding:40px 20px;color:${T.textMuted};font-size:14px;`, { text: 'No activity yet.' }));
      return;
    }

    // Clear log button
    const clearRow = el('div', `padding:10px 20px;border-bottom:1px solid ${T.border};text-align:right;`);
    const clearLogBtn = el('button', '', { text: 'Clear Log' });
    clearLogBtn.className = 'ig-unf-btn';
    clearLogBtn.style.cssText += `background:${T.surfaceAlt};color:${T.textMuted};font-size:11px;padding:5px 12px;`;
    clearLogBtn.onclick = () => { Log.clear(); renderLog(); };
    clearRow.appendChild(clearLogBtn);
    container.appendChild(clearRow);

    const colors = { unfollow: T.success, scan: T.accent, error: T.danger, rate_limit: T.warning, pause: T.warning, cancel: T.textMuted };
    const icons = { unfollow: '\u2713', scan: '\u{1F50D}', error: '\u2717', rate_limit: '\u26A0', pause: '\u23F8', cancel: '\u25A0' };

    entries.forEach(entry => {
      const row = el('div', `display:flex;align-items:flex-start;gap:10px;padding:8px 20px;border-bottom:1px solid ${T.border};font-size:12px;`);

      const icon = el('span', `color:${colors[entry.type] || T.textMuted};font-size:14px;flex-shrink:0;margin-top:1px;`, { text: icons[entry.type] || '-' });
      row.appendChild(icon);

      const content = el('div', 'flex:1;');
      let text = entry.type;
      if (entry.type === 'unfollow') text = 'Unfollowed @' + (entry.username || entry.userId);
      else if (entry.type === 'scan') text = 'Scan: ' + (entry.following || 0) + ' following, ' + (entry.nonFollowers || 0) + ' non-followers';
      else if (entry.type === 'error') text = 'Error: ' + (entry.message || 'Unknown');
      else if (entry.type === 'rate_limit') text = 'Rate limited - backed off';
      else if (entry.type === 'pause') text = 'Paused: ' + (entry.reason || '');
      content.appendChild(el('div', `color:${T.text};`, { text }));

      const time = new Date(entry.ts);
      content.appendChild(el('div', `color:${T.textMuted};font-size:11px;margin-top:2px;`,
        { text: time.toLocaleDateString() + ' ' + time.toLocaleTimeString() }));
      row.appendChild(content);

      container.appendChild(row);
    });
  }

  // ── Footer ──
  const footer = el('div', `padding:12px 20px;border-top:1px solid ${T.border};flex-shrink:0;display:flex;gap:8px;`);
  panel.appendChild(footer);

  const unfollowBtn = el('button', `flex:1;background:${T.danger};color:white;display:none;font-size:14px;`, { text: 'Unfollow (0)' });
  unfollowBtn.className = 'ig-unf-btn';
  const pauseBtn = el('button', `background:${T.surfaceAlt};color:${T.warning};display:none;min-width:90px;`, { text: 'Pause' });
  pauseBtn.className = 'ig-unf-btn';
  footer.appendChild(unfollowBtn);
  footer.appendChild(pauseBtn);

  function updateUnfollowBtn() {
    unfollowBtn.textContent = 'Unfollow (' + selectedUsers.size + ')';
  }

  // ── Filter Logic ──
  function applyFilters() {
    let list = nonFollowers.filter(u => !Whitelist.has(String(u.pk || u.id)));
    if (searchQuery) {
      list = list.filter(u =>
        u.username.toLowerCase().includes(searchQuery) ||
        (u.full_name && u.full_name.toLowerCase().includes(searchQuery))
      );
    }
    filteredList = list;
    if (activeTab === 'list') renderVirtualList();
  }

  function showPostScanUI(show) {
    const d = show ? 'inline-flex' : 'none';
    selectAllBtn.style.display = d;
    clearBtn.style.display = d;
    exportBtn.style.display = d;
    searchInput.style.display = show ? 'block' : 'none';
    tabBar.style.display = show ? 'flex' : 'none';
    unfollowBtn.style.display = show ? 'block' : 'none';
    scanBtn.style.display = show ? 'none' : 'inline-flex';
  }

  // ─── Event Handlers ─────────────────────────────────────────────────

  // Scan
  scanBtn.onclick = async () => {
    scanBtn.disabled = true;
    showProgress(true, true);

    try {
      const userId = Utils.getUserID();
      if (!userId) throw new Error('Not logged in. Open instagram.com and log in first.');

      setStatus('Scanning who you follow...');
      const following = await API.fetchAllFollowing(userId, (count, more) => {
        setStatus('Following: ' + Utils.formatNum(count) + (more ? '...' : ' done'));
      });

      setStatus('Scanning your followers...');
      const followers = await API.fetchAllFollowers(userId, (count, more) => {
        setStatus('Followers: ' + Utils.formatNum(count) + (more ? '...' : ' done'));
      });

      const followerIds = new Set(followers.map(u => String(u.pk || u.id)));
      allFollowing = following;
      nonFollowers = following.filter(u => !followerIds.has(String(u.pk || u.id)));

      Log.add('scan', { following: following.length, followers: followers.length, nonFollowers: nonFollowers.length });

      showProgress(false);
      setStatus(Utils.formatNum(following.length) + ' following, ' + Utils.formatNum(nonFollowers.length) + ' don\'t follow back');
      updateStats();
      applyFilters();
      showPostScanUI(true);

    } catch (error) {
      showProgress(false);
      if (error instanceof RateLimitError) {
        setStatus('Rate limited. Wait a few minutes and try again.');
      } else {
        setStatus('Error: ' + error.message);
      }
      scanBtn.disabled = false;
    }
  };

  // Select All
  selectAllBtn.onclick = () => {
    filteredList.forEach(u => {
      const uid = String(u.pk || u.id);
      if (!Whitelist.has(uid)) selectedUsers.add(uid);
    });
    updateUnfollowBtn();
    renderVirtualList();
  };

  // Clear
  clearBtn.onclick = () => {
    selectedUsers.clear();
    updateUnfollowBtn();
    renderVirtualList();
  };

  // Export
  exportBtn.onclick = () => {
    const menu = el('div', `position:absolute;bottom:100%;left:0;background:${T.surface};border:1px solid ${T.border};border-radius:8px;overflow:hidden;z-index:10;box-shadow:0 4px 20px rgba(0,0,0,.4);`);
    const csvOpt = el('div', `padding:10px 20px;color:${T.text};cursor:pointer;font-size:13px;white-space:nowrap;`, { text: 'Export CSV' });
    const jsonOpt = el('div', `padding:10px 20px;color:${T.text};cursor:pointer;font-size:13px;white-space:nowrap;border-top:1px solid ${T.border};`, { text: 'Export JSON' });
    csvOpt.onmouseenter = () => { csvOpt.style.background = T.surfaceHover; };
    csvOpt.onmouseleave = () => { csvOpt.style.background = 'transparent'; };
    jsonOpt.onmouseenter = () => { jsonOpt.style.background = T.surfaceHover; };
    jsonOpt.onmouseleave = () => { jsonOpt.style.background = 'transparent'; };
    csvOpt.onclick = () => { Exporter.csv(filteredList); menu.remove(); };
    jsonOpt.onclick = () => { Exporter.json(filteredList); menu.remove(); };
    menu.appendChild(csvOpt);
    menu.appendChild(jsonOpt);
    exportBtn.style.position = 'relative';
    exportBtn.appendChild(menu);
    setTimeout(() => document.addEventListener('click', function rm() { menu.remove(); document.removeEventListener('click', rm); }, { once: true }), 10);
  };

  // Pause/Resume
  pauseBtn.onclick = () => {
    if (Safety.state.isPaused) {
      Safety.resume();
      pauseBtn.textContent = 'Pause';
      pauseBtn.style.color = T.warning;
    } else {
      Safety.pause();
      pauseBtn.textContent = 'Resume';
      pauseBtn.style.color = T.success;
      setStatus('Paused. Click Resume to continue.');
    }
  };

  // Unfollow
  unfollowBtn.onclick = async () => {
    if (selectedUsers.size === 0) { setStatus('Select at least one user.'); return; }
    if (!confirm('Unfollow ' + selectedUsers.size + ' users? This may take a while due to safety delays.')) return;

    isUnfollowing = true;
    Safety.reset();
    unfollowBtn.disabled = true;
    pauseBtn.style.display = 'inline-flex';
    showProgress(true);

    const targets = [...selectedUsers];
    const total = targets.length;
    let completed = 0;
    let failed = 0;

    for (const uid of targets) {
      await Safety.waitIfPaused();

      const check = Safety.canContinue();
      if (!check.ok) {
        setStatus(check.reason);
        Log.add('pause', { reason: check.reason });
        break;
      }

      const user = allFollowing.find(u => String(u.pk || u.id) === uid);
      const username = user ? user.username : uid;

      try {
        await API.unfollow(uid);
        completed++;
        Safety.state.sessionCount++;
        Safety.incrementDaily();
        Safety.resetErrors();
        selectedUsers.delete(uid);
        nonFollowers = nonFollowers.filter(u => String(u.pk || u.id) !== uid);
        Log.add('unfollow', { username, userId: uid });
      } catch (error) {
        failed++;
        const errInfo = Safety.handleError(error);
        Log.add('error', { message: error.message, userId: uid });

        if (errInfo.fatal) {
          setStatus('Challenge required! Instagram wants verification. Stopping.');
          Log.add('rate_limit', { message: 'challenge_required' });
          break;
        }

        if (Safety.state.consecutiveErrors >= 3) {
          setStatus('Too many errors. Stopping for safety.');
          break;
        }

        setStatus('Error - backing off ' + Math.round(errInfo.delay / 1000) + 's...');
        await Utils.sleep(errInfo.delay);
        continue;
      }

      setProgress((completed / total) * 100);
      updateUnfollowBtn();

      if (Safety.shouldBatchPause()) {
        const pause = Safety.getBatchPause();
        const mins = (pause / 60000).toFixed(1);
        setStatus('Safety pause: ' + mins + ' min (' + completed + '/' + total + ' done)');
        Log.add('pause', { reason: 'batch', duration: pause });
        await Utils.sleep(pause);
        await Safety.waitIfPaused();
      } else {
        const delay = Safety.getNextDelay();
        setStatus('Unfollowed @' + username + ' (' + completed + '/' + total + ') - waiting ' + Math.round(delay / 1000) + 's...');
        await Utils.sleep(delay);
      }
    }

    showProgress(false);
    isUnfollowing = false;
    unfollowBtn.disabled = false;
    pauseBtn.style.display = 'none';

    const msg = completed + ' unfollowed' + (failed > 0 ? ', ' + failed + ' failed' : '');
    setStatus(msg);
    updateStats();
    applyFilters();
    updateUnfollowBtn();

    if (nonFollowers.length === 0) {
      showPostScanUI(false);
      scanBtn.style.display = 'inline-flex';
      scanBtn.disabled = false;
    }
  };

  // Escape to close
  const escHandler = (e) => {
    if (e.key === 'Escape' && !isUnfollowing) {
      overlay.remove();
      styleTag.remove();
      document.removeEventListener('keydown', escHandler);
    }
  };
  document.addEventListener('keydown', escHandler);
})();
