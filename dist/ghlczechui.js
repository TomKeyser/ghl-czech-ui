(function () {
  'use strict';
  var VERSION = 'v140';
  if (window.__kaActive) return;
  window.__kaActive = true;
  window.__kaVersion = VERSION;
  var ONLY_LOCATIONS = [
    'SbA5m1DElMNEKBVnixsX',
    'zWR1h9iaCeH2Ki6kGZLD',
    'qO4OrGisQvYo5ozx4j5U'
  ];
  function allowedHere() {
    if (!ONLY_LOCATIONS.length) return true;
    var path = window.location.pathname;
    for (var i = 0; i < ONLY_LOCATIONS.length; i++) {
      if (path.indexOf('/location/' + ONLY_LOCATIONS[i]) !== -1) return true;
    }
    return false;
  }
  var PACK_SOURCE = 'en';
  function platformLang() {
    var v = '';
    try { v = localStorage.getItem('locale') || ''; } catch (e) {}
    return String(v).toLowerCase().split(/[-_]/)[0];
  }
  function sourceMatches() {
    var l = platformLang();
    return !l || l === PACK_SOURCE;
  }
  var audience = null;
  var AUDIENCE_TIMEOUT_MS = 6000;
  function agencyToo() {
    if (window.__kaAgencyToo === true) return true;
    try { return window.location.search.indexOf('csagency=1') !== -1; } catch (e) { return false; }
  }
  function resolveAudience() {
    if (agencyToo()) { audience = true; STATUS.userType = 'any (override)'; return; }
    var settled = false;
    function settle(val, why) {
      if (settled) return;
      settled = true;
      audience = val;
      STATUS.userType = why;
      try { schedule(document.body); } catch (e) {}
    }
    setTimeout(function () {
      settle(true, 'unknown (AppUtils did not answer; translating anyway)');
    }, AUDIENCE_TIMEOUT_MS);
    try {
      var U = window.AppUtils && window.AppUtils.Utilities;
      if (!U || !U.getCurrentUser) { settle(true, 'unknown (no AppUtils)'); return; }
      Promise.resolve(U.getCurrentUser()).then(function (u) {
        var t = (u && u.type) || '';
        settle(t !== 'agency', t || 'unknown');
      }, function () {
        settle(true, 'unknown (getCurrentUser failed)');
      });
    } catch (e) { settle(true, 'unknown (threw)'); }
  }
  function shouldTranslate() {
    return allowedHere() && sourceMatches() && audience === true;
  }
  function refreshStatus() {
    STATUS.translatingHere = shouldTranslate();
    STATUS.platformLang = platformLang();
    STATUS.packSource = PACK_SOURCE;
    STATUS.audience = audience;
    STATUS.notTranslatingBecause = STATUS.translatingHere ? null : (
      !allowedHere()   ? 'sub-account is not in ONLY_LOCATIONS' :
      !sourceMatches() ? 'platform language is "' + platformLang() + '", but this pack ' +
                         'translates from "' + PACK_SOURCE + '" — set the platform language ' +
                         'back to English for this sub-account' :
      audience === null ? 'waiting to find out who is logged in'
                        : 'agency user — the platform language is left alone'
    );
  }
  try {
    var qs = window.location.search;
    if (qs.indexOf('nocs=1') !== -1) localStorage.setItem('ka_off', '1');
    if (qs.indexOf('nocs=0') !== -1) localStorage.removeItem('ka_off');
    if (localStorage.getItem('ka_off') === '1') {
      console.info('[cs-CZ] translation layer disabled via kill switch');
      return;
    }
  } catch (e) {   }
  var PSEUDO = [];
  var PACK_CSS = [];
  var PACK_STYLE_ID = 'ka-pack-css';
  function injectPackCss() {
    if (!PSEUDO.length && !PACK_CSS.length) return;
    if (document.getElementById(PACK_STYLE_ID)) return;
    if (!document.head) return;
    var css = '';
    for (var i = 0; i < PSEUDO.length; i++) {
      var esc = String(PSEUDO[i].text).replace(/\\/g, '\\\\').replace(/"/g, '\\"');
      css += PSEUDO[i].selector + '{content:"' + esc + '" !important;}\n';
    }
    for (var j = 0; j < PACK_CSS.length; j++) css += String(PACK_CSS[j]) + '\n';
    var el = document.createElement('style');
    el.id = PACK_STYLE_ID;
    el.textContent = css;
    document.head.appendChild(el);
  }
  var STD_CONTACT_FIELDS = [
    'contact.first_name', 'contact.last_name', 'contact.name',
    'contact.email', 'contact.phone', 'contact.source', 'contact.type',
    'contact.date_of_birth', 'contact.company_name', 'contact.website',
    'contact.address1', 'contact.city', 'contact.state',
    'contact.postal_code', 'contact.country', 'contact.timezone',
    'contact.assigned_to', 'contact.tags', 'contact.dnd'
  ];
  var FIELD_LABEL_ZONE = (function () {
    var all = '#field-container [id$="-form-item"] .hr-form-item-label__text';
    var not = ':not(:has(' + STD_CONTACT_FIELDS.map(function (s) {
      return '[id="' + s + '"]';
    }).join(',') + '))';
    var scoped = '#field-container [id$="-form-item"]' + not +
                 ' .hr-form-item-label__text';
    try { document.querySelector(scoped); return scoped; }
    catch (e) { return all; }
  })();
  var DECLARED_WALLS = [
    {
      id: 'invoice-preview',
      zone: '[id*="invoice"][id$="editor-container"] .preview-section',
      note: 'The live preview of the document the CUSTOMER receives. Left in ' +
            'English on purpose: this layer never runs on the page where that ' +
            'document is rendered, so a translated preview would promise a ' +
            'Czech invoice and send an English one. Left alone it is truthful. ' +
            'A business wanting Czech invoices writes Czech into its own ' +
            'template, and this rule then shows that text exactly as the ' +
            'customer will see it. Covers all three editors (one-off, ' +
            'recurring, template). NOT yet covering estimates or proposals — ' +
            'those have never been seen with data on them, and a selector ' +
            'written for an unobserved shape is how the old firewall came to ' +
            'match nothing.'
    }
  ];
  var WALL_ZONES = DECLARED_WALLS.map(function (w) { return w.zone; }).join(',');
  function declaredWall(el) {
    if (!el || !el.closest || !WALL_ZONES) return null;
    try { if (!el.closest(WALL_ZONES)) return null; } catch (e) { return null; }
    for (var i = 0; i < DECLARED_WALLS.length; i++) {
      try { if (el.closest(DECLARED_WALLS[i].zone)) return DECLARED_WALLS[i]; } catch (e) {}
    }
    return null;
  }
  var CONTENT_ZONES = [
    '[data-ka-ignore]',
    'code', 'pre', 'style', 'script', 'noscript', 'svg',
    '[contenteditable="true"]', '[contenteditable=""]',
    '.ql-editor', '.ProseMirror', '.CodeMirror', '.monaco-editor',
    '.cm-editor',
    '.chat-message', '.chat-content', '[data-testid="CENTRALPANEL_NAME"]',
    '.message-item',
    '.folder-card-wrapper .truncate', '.media-file-name',
    '#notification-list',
    '.hero-stats-value', '.trust-value', '.agent-conversation-panel__user-row',
    '.feature-discovery-main-container',
    '[data-conversation-id]', '[data-testid="ASSERT_LC_LEFTPANEL"]',
    '.user-info-card',
    '.tabulator-cell:not([tabulator-field*="date" i]):not([tabulator-field*="time" i]):not([tabulator-field*="activity" i]):not([tabulator-field*="created" i]):not([tabulator-field*="updated" i])',
    ':is(td.hr-data-table-td, td.n-data-table-td)[data-col-key]:not([data-col-key*="date" i]):not([data-col-key$="At"]):not([data-col-key*="status" i]):not([data-col-key^="action" i]):not([data-col-key="productType"]):not([data-col-key="paymentProviderType"]):not([data-col-key$="edOn"]):not([data-col-key^="schedule"])',
    '.price-scroll span.truncate',
    '#createProducts .hl-toolbar-group > span',
    '[id*="invoice"][id$="editor-container"] .preview-section',
    '[id*="invoice"][id$="editor-container"] .business-details-preview',
    '#taxSelect .n-tag',
    '.file-name',
    '[data-testid="app-card-header"]',
    '[data-testid="app-card"] p.line-clamp-2',
    '[data-testid="bot-card-title-column"]',
    '[data-testid="bot-card-name"]',
    '[data-testid="bot-card-author"] p.truncate',
    '[data-testid="bot-card-body"] p.line-clamp-2',
    '[data-testid="bot-card-usage"]',
    '#attribution-value',
    '.record-avatar + *',
    '[id^="hr-tag-ellipsis-tag-"]',
    '#start-with-template [id^="template-card-"] .font-bold',
    '[id^="hr-tag-count-wrapper-template-tag-"]',
    '#Labs .card-container .hr-card-header .hr-text-3xl:not([id])',
    '#Labs .card-container .hr-card-content p.hr-text-md.hr-text-medium:not([id])',
    '#Labs .card-container .hr-card-content p.hr-text-sm.hr-text-regular:not([id])',
    '.table-hl tbody',
    '[id^="data-stage-name-"]',
    '.hl_location-text',
    '[id="task-title-text"]',
    '[id="task-description-text"]',
    '[id="task-contact-text"]',
    '[id="select-id"] .hr-base-selection-label',
    '[id*="-select-pipeline_"] .hr-base-selection-label',
    '[id*="manual-action-workflow-selection"] .hr-base-selection-label',
    '[id*="manual-action-campaign-selection"] .hr-base-selection-label',
    '[id*="task-user-selection"] .hr-base-selection-label',
    '[id*="user-sales-efficiency"] .hr-base-selection-label',
    '[id*="gbp-page"] .hr-base-selection-label',
    '#views-bar .lists .view-label',
    '.opportunitiesCard tr[id] td + td',
    '.opportunitiesCard .ui-card-content a',
    '[id^="pipelineDropdDown"] .hr-base-selection-label',
    '.avatar_img', '.hr-avatar__text',
    '.interactive-element button span.text-left',
    '#i18n-feedback',
    '.welcome-hero__highlight', '.typewriter-cursor', '.hint-word',
    FIELD_LABEL_ZONE,
    '#claude-agent-glow-border', '#claude-agent-stop-container', '#claude-phantom-cursor'
  ];
  var BLOCKED_ATTR = CONTENT_ZONES.join(',');
  var WALL_DRIFT = DECLARED_WALLS.filter(function (w) {
    return CONTENT_ZONES.indexOf(w.zone) === -1;
  }).map(function (w) { return w.id; });
  var SELF_ATTR_ZONES = [
    '.hl-toolbar[title]'
  ];
  var SELF_ATTR = SELF_ATTR_ZONES.join(',');
  var BLOCKED_TEXT = CONTENT_ZONES.concat(['input', 'textarea', 'select']).join(',');
  var ZONE_PHRASES = [
    { zone: '#views-bar .lists .view-label', phrases: ['All'] },
    { zone: '[id="select-id"] .hr-base-selection-label', phrases: ['No pipeline available'] },
    { zone: '[id*="-select-pipeline_"] .hr-base-selection-label', phrases: ['All pipelines'] },
    { zone: '[id*="manual-action-workflow-selection"] .hr-base-selection-label', phrases: ['All', 'all'] },
    { zone: '[id*="manual-action-campaign-selection"] .hr-base-selection-label', phrases: ['All', 'all'] },
    { zone: '[id*="task-user-selection"] .hr-base-selection-label', phrases: ['All users'] },
    { zone: '[id*="user-sales-efficiency"] .hr-base-selection-label', phrases: ['All users'] },
    { zone: '[id*="gbp-page"] .hr-base-selection-label', phrases: ['Please Select'] }
  ];
  (function () {
    var base = CONTENT_ZONES.concat(['input', 'textarea', 'select']);
    for (var i = 0; i < ZONE_PHRASES.length; i++) {
      var zp = ZONE_PHRASES[i];
      zp.others = base.filter(function (s) { return s !== zp.zone; }).join(',');
      zp.set = Object.create(null);
      for (var j = 0; j < zp.phrases.length; j++) zp.set[zp.phrases[j]] = 1;
    }
  })();
  var PHRASE_ZONES = ZONE_PHRASES.map(function (z) { return z.zone; }).join(',');
  function zonePhrase(n) {
    var el = n && n.parentElement;
    if (!el || !el.closest || !PHRASE_ZONES || !el.closest(PHRASE_ZONES)) return false;
    for (var i = 0; i < ZONE_PHRASES.length; i++) {
      var zp = ZONE_PHRASES[i];
      if (!el.closest(zp.zone)) continue;
      if (el.closest(zp.others) || hrCellBlocked(el)) return false;
      if (n.__kaDone !== undefined && n.__kaDone === n.textContent) return true;
      return zp.set[String(n.textContent).trim()] === 1;
    }
    return false;
  }
  var DATA_PICKERS = [
    '[name*="assignee" i]', '[name*="user" i]', '[name*="contact" i]',
    '[name*="calendar" i]', '[name*="pipeline" i]', '[name*="owner" i]',
    '[name*="tag" i]', '[name*="member" i]', '[name*="team" i]',
    '[id*="assignee" i]', '[id*="user" i]', '[id*="contact" i]',
    '[id*="calendar" i]', '[id*="pipeline" i]', '[id*="owner" i]',
    '[id*="tag" i]', '[id*="member" i]', '[id*="team" i]',
    '[class*="assignee" i]', '[class*="user-select" i]', '[class*="contact-select" i]'
  ].join(',');
  function inDataPicker(el) {
    if (!el || !el.closest) return false;
    var sel = el.closest('select');
    if (sel) return !!(sel.matches && sel.matches(DATA_PICKERS));
    var box = el.closest('[role="listbox"],[role="combobox"]');
    return !!(box && box.matches && box.matches(DATA_PICKERS));
  }
  var ATTRS = ['placeholder', 'title', 'aria-label', 'alt'];
  var TRANSLATE_PREFILLS = true;
  var MAX_LEN = 400;
  var DATA_VERSION  = 'v95';
  var DEFAULT_LOCALE = 'cs-CZ';
  var AVAILABLE = { 'cs-CZ': 1, 'es': 1 };
  var LOAD_TIMEOUT_MS = 15000;
  var BASE = (function () {
    try {
      var s = document.currentScript && document.currentScript.src;
      if (s) return s.replace(/[^/]*(?:\?.*)?$/, '');
    } catch (e) {}
    return 'https://tomkeyser.github.io/ghl-czech-ui/dist/';
  })();
  var STATUS = window.__kaStatus = {
    version: VERSION, dataVersion: DATA_VERSION, base: BASE,
    locale: null, localeSource: null, state: 'loading', terms: 0, error: null,
    onlyLocations: ONLY_LOCATIONS.slice(),
    translatingHere: null
  };
  var LANG_KEY = 'ka_lang';
  function validLocale(v) {
    return typeof v === 'string' &&
      /^[A-Za-z]{2}(?:-[A-Za-z]{2})?$/.test(v) &&
      Object.prototype.hasOwnProperty.call(AVAILABLE, v);
  }
  function pickLocale() {
    var known = Object.keys(AVAILABLE).join(', ');
    var qs = window.location.search;
    if (/[?&]cslang=0(?:&|$)/.test(qs)) {
      try { localStorage.removeItem(LANG_KEY); } catch (e) {}
      console.info('[lang] cleared the stored language override; using the loader default');
    } else {
      var m = /[?&]cslang=([A-Za-z]{2}(?:-[A-Za-z]{2})?)(?:&|$)/.exec(qs);
      var want = m && m[1];
      if (want) {
        if (validLocale(want)) {
          try { localStorage.setItem(LANG_KEY, want); } catch (e) {}
          STATUS.localeSource = 'url (?cslang=, remembered)';
          return want;
        }
        console.warn('[lang] unknown ?cslang=' + want + ' — ignoring it. Available: ' + known);
      }
    }
    var stored = null;
    try { stored = localStorage.getItem(LANG_KEY); } catch (e) {}
    if (stored) {
      if (validLocale(stored)) {
        STATUS.localeSource = 'stored override (clear with ?cslang=0)';
        return stored;
      }
      try { localStorage.removeItem(LANG_KEY); } catch (e) {}
      console.warn('[lang] stored language "' + stored + '" is not available any more — cleared it');
    }
    var fromLoader = window.__kaLang;
    if (fromLoader) {
      if (validLocale(fromLoader)) {
        STATUS.localeSource = 'loader (window.__kaLang)';
        return fromLoader;
      }
      console.warn('[lang] loader set __kaLang="' + fromLoader + '", which is not available. ' +
                   'Available: ' + known + '. Falling back to ' + DEFAULT_LOCALE);
    }
    STATUS.localeSource = 'default';
    return DEFAULT_LOCALE;
  }
  var RULES = null, SOURCE = null, PACK = null, DICT = null, LOOKUP = null;
  var own = function (o, k) { return Object.prototype.hasOwnProperty.call(o, k); };
  function plain(str) {
    if (!DICT) return null;
    var k = String(str).trim();
    if (!k) return null;
    if (own(DICT, k)) return DICT[k];
    var l = k.toLowerCase();
    return own(LOOKUP, l) ? LOOKUP[l] : null;
  }
  var ROUTE_PATH = null;
  var ROUTE_MAP = null;
  function entryText(v) {
    if (typeof v === 'string') return v;
    if (!v || typeof v.t !== 'string') return null;
    if (v.seen && v.ttl) {
      var seen = Date.parse(v.seen);
      if (!isNaN(seen) && Date.now() > seen + v.ttl * 86400000) return null;
    }
    return v.t;
  }
  function routeOverrides() {
    var path = window.location.pathname;
    if (ROUTE_PATH === path) return ROUTE_MAP;
    ROUTE_PATH = path;
    ROUTE_MAP = null;
    var by = PACK && PACK.byRoute;
    if (!by) return null;
    var keys = [];
    for (var k in by) {
      if (own(by, k) && path.indexOf(k) !== -1) keys.push(k);
    }
    if (!keys.length) return null;
    keys.sort(function (a, b) { return a.length - b.length; });
    ROUTE_MAP = {};
    for (var i = 0; i < keys.length; i++) {
      var m = by[keys[i]];
      for (var w in m) {
        if (!own(m, w)) continue;
        var rv = entryText(m[w]);
        if (rv !== null) ROUTE_MAP[w] = rv;
      }
    }
    return ROUTE_MAP;
  }
  function translate(raw) {
    if (!DICT) return null;
    var key = String(raw).trim();
    if (!key) return null;
    if (RULES && RULES.neverTranslate) {
      var keep = RULES.neverTranslate(key);
      if (keep !== null) return keep;
    }
    var byRoute = routeOverrides();
    if (byRoute && own(byRoute, key)) return byRoute[key];
    if (own(DICT, key)) return DICT[key];
    var viaRule = RULES.applyRules(SOURCE, PACK, key, { plain: plain, translate: translate });
    if (viaRule !== null) return viaRule;
    var lower = key.toLowerCase();
    if (own(LOOKUP, lower)) {
      var out = LOOKUP[lower];
      if (key.length > 1 && key === key.toUpperCase() && key !== key.toLowerCase()) {
        return out.toUpperCase();
      }
      return out;
    }
    return null;
  }
  function disable(why) {
    STATUS.state = 'disabled';
    STATUS.error = why;
    console.warn('[cs-CZ] language layer DISABLED — ' + why +
      '. The interface is left in English; nothing was partially translated. ' +
      'Details: window.__kaStatus');
  }
  function loadScript(url, done) {
    try {
      var s = document.createElement('script');
      s.src = url;
      s.async = true;
      s.onload = function () { done(null); };
      s.onerror = function () { done(new Error('could not load ' + url)); };
      (document.head || document.documentElement).appendChild(s);
    } catch (e) { done(e); }
  }
  function activate(locale) {
    var R = window.__kaRules;
    var SS = window.__kaSource;
    var PP = window.__kaPacks;
    var S = SS && SS.en;
    var P = PP && PP[locale];
    if (!R || typeof R.applyRules !== 'function') return disable('i18n-rules.js loaded but __kaRules.applyRules is missing');
    if (!S || !S.rules || !S.rules.length)        return disable('source-en.js loaded but its rule table is empty');
    if (!P)                                       return disable('pack for ' + locale + ' loaded but did not register itself');
    if (!P.dict || !P.patterns || !P.plurals)     return disable('pack ' + locale + ' is malformed (needs dict, patterns, plurals)');
    RULES = R; SOURCE = S; PACK = P;
    PSEUDO = Array.isArray(P.pseudo) ? P.pseudo : [];
    PACK_CSS = Array.isArray(P.css) ? P.css : [];
    DICT = {};
    var api = P.dictApi || {}, k, tv;
    for (k in api) if (own(api, k) && (tv = entryText(api[k])) !== null) DICT[k] = tv;
    for (k in P.dict) if (own(P.dict, k) && (tv = entryText(P.dict[k])) !== null) DICT[k] = tv;
    LOOKUP = {};
    var halves = [P.dict, api], h, kk, lower;
    for (h = 0; h < halves.length; h++) {
      for (kk in halves[h]) {
        if (!own(halves[h], kk)) continue;
        lower = kk.toLowerCase();
        if (own(LOOKUP, lower)) continue;
        tv = entryText(halves[h][kk]);
        if (tv !== null) LOOKUP[lower] = tv;
      }
    }
    resolveAudience();
    STATUS.state = 'ready';
    STATUS.terms = Object.keys(DICT).length;
    STATUS.curated = Object.keys(P.dict).length;
    STATUS.fromApi = Object.keys(api).length;
    return true;
  }
  function beginTranslating() {
    try {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', start);
      } else {
        start();
      }
    } catch (e) {
      disable('dictionary loaded but the DOM pass failed to start: ' + (e && e.message));
    }
  }
  function bootData() {
    var locale = pickLocale();
    STATUS.locale = locale;
    var pending = 3, settled = false;
    var timer = window.setTimeout(function () {
      if (settled) return;
      settled = true;
      disable('timed out after ' + LOAD_TIMEOUT_MS + 'ms waiting for language files');
    }, LOAD_TIMEOUT_MS);
    function done(err) {
      if (settled) return;
      if (err) {
        settled = true;
        window.clearTimeout(timer);
        return disable(err.message);
      }
      if (--pending > 0) return;
      settled = true;
      window.clearTimeout(timer);
      var ok;
      try { ok = activate(locale); }
      catch (e) { return disable('failed while building the dictionary: ' + (e && e.message)); }
      if (ok) beginTranslating();
    }
    var bust = '?t=' + Date.now();
    var pin  = '?v=' + encodeURIComponent(DATA_VERSION);
    loadScript(BASE + 'i18n-rules.js' + bust, done);
    loadScript(BASE + 'lang/source-en.js' + bust, done);
    loadScript(BASE + 'lang/' + locale + '.js' + pin, done);
  }
  function hrColumnLetThrough(k) {
    return /date/i.test(k) || /At$/.test(k) || /status/i.test(k) || /^action/i.test(k) ||
           k === 'productType' || k === 'paymentProviderType' || /edOn$/.test(k) ||
           /^schedule/.test(k) || k === 'steps' ||
           k === '_id';
  }
  function hrColumnKey(td) {
    var table = td.closest('table');
    var head = table && table.tHead;
    if (!head || !head.rows.length) return null;
    var th = head.rows[head.rows.length - 1].cells[td.cellIndex];
    if (!th) return null;
    return th['__kaAttrSrc_aria-label'] || th.getAttribute('data-col-key') ||
           th.getAttribute('aria-label') || null;
  }
  var HR_TITLE_LET = /^(?:(?:date\s+)?(?:created|updated|modified|added)(?:\s+(?:on|at|date))?|date|due date|last (?:updated|modified)|status)$/i;
  function hrHeaderTitle(td) {
    var table = td.closest('table');
    var head = table && table.tHead;
    if (!head || !head.rows.length) return null;
    var th = head.rows[head.rows.length - 1].cells[td.cellIndex];
    if (!th) return null;
    var w = document.createTreeWalker(th, NodeFilter.SHOW_TEXT), n;
    while ((n = w.nextNode())) {
      var t = (n.__kaSrc || n.textContent || '').trim();
      if (t) return t;
    }
    return null;
  }
  function hrCellBlocked(el) {
    var td = el.closest('td.hr-data-table__body-cell');
    if (!td) return false;
    var key = hrColumnKey(td);
    if (key) return !hrColumnLetThrough(key);
    var title = hrHeaderTitle(td);
    return !(title && HR_TITLE_LET.test(title));
  }
  var RECORD_MENU = '.hr-select-menu-container';
  var RECORD_MENU_LABEL = '.hr-select-option-label';
  var RECORD_MENU_HEADS = ['All users', 'All pipelines'];
  var recordHeadSet = null;
  function isRecordHead(text) {
    var t = String(text || '').trim();
    if (!recordHeadSet) {
      var set = Object.create(null);
      for (var i = 0; i < RECORD_MENU_HEADS.length; i++) {
        var h = RECORD_MENU_HEADS[i];
        set[h] = 1;
        if (DICT && own(DICT, h) && typeof DICT[h] === 'string') set[DICT[h]] = 1;
      }
      if (!DICT) return set[t] === 1;
      recordHeadSet = set;
    }
    return recordHeadSet[t] === 1;
  }
  function recordMenuBlocked(el) {
    var menu = el && el.closest && el.closest(RECORD_MENU);
    if (!menu) return false;
    if (!menu.__kaRecordMenu) {
      var labels = menu.querySelectorAll(RECORD_MENU_LABEL);
      for (var i = 0; i < labels.length; i++) {
        if (isRecordHead(labels[i].textContent)) { menu.__kaRecordMenu = true; break; }
      }
      if (!menu.__kaRecordMenu) return false;
    }
    var label = el.closest(RECORD_MENU_LABEL);
    return !(label && isRecordHead(label.textContent));
  }
  function blockedText(el) {
    if (!el || !el.closest) return true;
    if (el.closest(BLOCKED_TEXT)) return true;
    if (hrCellBlocked(el)) return true;
    if (recordMenuBlocked(el)) return true;
    if (el.tagName === 'OPTION' || el.closest('option')) return inDataPicker(el);
    return false;
  }
  function blockedAttr(el) {
    if (!el) return true;
    if (el.matches && el.matches(SELF_ATTR)) return true;
    if (!el.closest) return true;
    return !!el.closest(BLOCKED_ATTR) || hrCellBlocked(el) || recordMenuBlocked(el);
  }
  var RECORDS = Object.create(null);
  var RECORDS_N = 0;
  var MAX_RECORDS = 800;
  function noteRecord(s) {
    if (!s) return;
    s = String(s).trim();
    if (s.length < 3 || s.length > 80) return;
    if (RECORDS[s] || RECORDS_N >= MAX_RECORDS) return;
    RECORDS[s] = 1;
    RECORDS_N++;
  }
  function isRecordMirror(s) {
    return !!RECORDS[String(s).trim()];
  }
  var FILE_NAME = /^[^\s\/\\][^\/\\\n]{0,150}[^\s\/\\.]\.(?:jpe?g|png|gif|webp|svg|bmp|tiff?|heic|pdf|csv|txt|docx?|xlsx?|pptx?|odt|ods|zip|rar|mp3|wav|m4a|mp4|mov|avi|webm)$/i;
  function looksLikeFileName(s) {
    return FILE_NAME.test(String(s).trim());
  }
  var URL_SHAPE = /^(?:(?:https?:\/\/|www\.)[^\s]+|\/[\w\-.\/]+|(?:[a-z0-9-]+\.)+(?:com|net|org|io|co|cz|sk|de|at|pl|eu|uk|us|ca|au|app|ai|dev|me|info|biz|site|online|store))$/;
  function looksLikeUrl(s) {
    return URL_SHAPE.test(String(s).trim());
  }
  var OBJECT_ID = /^[0-9a-f]{24}$/i;
  var PHONE_SHAPE = /^(?!\d{4}-\d{2}-\d{2}$)\+?\(?\d[\d\s().-]{6,}\d$/;
  var EMAIL_SHAPE = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;
  var CODE_SHAPE = /^(?:\(\s*[\w\s,{}[\]$.]*\)\s*=>|function\s*\*?\s*[\w$]*\s*\(|\(\s*function\s*[\w$]*\s*\()/;
  function recordShape(s) {
    var t = String(s).trim();
    if (FILE_NAME.test(t)) return 'file-name';
    if (URL_SHAPE.test(t)) return 'url';
    if (OBJECT_ID.test(t)) return 'record-id';
    if (PHONE_SHAPE.test(t)) return 'phone';
    if (EMAIL_SHAPE.test(t)) return 'email';
    if (CODE_SHAPE.test(t)) return 'source-code';
    return null;
  }
  function describe(el) {
    if (!el || !el.tagName) return '';
    if (el.id) return '#' + el.id;
    var cls = (el.className && el.className.baseVal !== undefined)
      ? el.className.baseVal : el.className;
    cls = String(cls || '').split(/\s+/).filter(function (c) {
      return c && !/^(data-v-|v-|ng-|is-|has-|svelte-)/.test(c) && c.length > 2;
    })[0];
    return el.tagName.toLowerCase() + (cls ? '.' + cls : '');
  }
  var REVERSE_OUTPUTS = null;
  function isOurOutput(v) {
    if (!DICT || !v) return false;
    if (!REVERSE_OUTPUTS) {
      REVERSE_OUTPUTS = Object.create(null);
      for (var k in DICT) {
        if (own(DICT, k) && typeof DICT[k] === 'string') REVERSE_OUTPUTS[DICT[k]] = 1;
      }
    }
    return !!REVERSE_OUTPUTS[v] || !!REVERSE_OUTPUTS[v.toLowerCase()];
  }
  function zoneOf(el, forAttr) {
    if (forAttr) {
      for (var j = 0; j < SELF_ATTR_ZONES.length; j++) {
        try { if (el.matches(SELF_ATTR_ZONES[j])) return SELF_ATTR_ZONES[j] + ' (self)'; } catch (e) {}
      }
    }
    var list = forAttr ? CONTENT_ZONES : CONTENT_ZONES.concat(['input', 'textarea', 'select']);
    for (var i = 0; i < list.length; i++) {
      try { if (el.closest(list[i])) return list[i]; } catch (e) {}
    }
    return null;
  }
  function why(node, attr) {
    if (!node) return { reason: 'no-node' };
    if (!DICT) return { reason: 'not-ready' };
    var isText = node.nodeType === 3;
    var el = isText ? node.parentElement : node;
    if (!el) return { reason: 'no-element' };
    if (el.tagName === 'IFRAME') {
      return { reason: 'iframe', src: el.getAttribute('src') || '',
               note: 'cross-origin micro-frontend: unreachable from any DOM layer' };
    }
    var raw = attr ? (el.getAttribute && el.getAttribute(attr))
                   : (isText ? node.textContent : el.textContent);
    var key = String(raw == null ? '' : raw).trim();
    if (!key) return { reason: 'empty' };
    if (isText && node.__kaDone === node.textContent) {
      return { reason: 'translated', text: key, attr: null };
    }
    if (isOurOutput(key)) {
      return { reason: 'translated', text: key, attr: attr || null };
    }
    if (key.length > MAX_LEN) {
      return { reason: 'too-long', length: key.length, max: MAX_LEN, text: key.slice(0, 60) };
    }
    var wall = declaredWall(el);
    if (wall) {
      return { reason: 'declared-wall', wall: wall.id, zone: wall.zone,
               note: wall.note, text: key, attr: attr || null };
    }
    if (recordMenuBlocked(el)) {
      return { reason: 'record-menu', on: describe(el.closest(RECORD_MENU)), text: key,
               attr: attr || null, note: 'an option below a record menu\'s head (v140)' };
    }
    if (attr) {
      if (blockedAttr(el)) {
        return { reason: 'content-zone', zone: zoneOf(el, true) || 'hr-data-table column',
                 on: describe(el.closest(BLOCKED_ATTR) || el), text: key };
      }
    } else if (isText && zonePhrase(node)) {
    } else {
      if (el.closest(BLOCKED_TEXT)) {
        return { reason: 'content-zone', zone: zoneOf(el, false),
                 on: describe(el.closest(BLOCKED_TEXT) || el), text: key };
      }
      if (hrCellBlocked(el)) {
        var hrTd = el.closest('td.hr-data-table__body-cell');
        return { reason: 'content-zone', zone: 'hr-data-table column: ' + (hrColumnKey(hrTd) || '(no key)'),
                 on: describe(hrTd), text: key };
      }
      if ((el.tagName === 'OPTION' || el.closest('option')) && inDataPicker(el)) {
        return { reason: 'data-picker', on: describe(el.closest('select') || el), text: key };
      }
    }
    var out = translate(key);
    if (out !== null) return { reason: 'translated', text: key, to: out, attr: attr || null };
    if (isRecordMirror(key)) {
      return { reason: 'record-mirror', text: key, attr: attr || null,
               note: 'same string was blocked by a content zone elsewhere on this page' };
    }
    if (looksLikeFileName(key)) {
      return { reason: 'file-name', text: key, attr: attr || null,
               note: 'shaped like a file name: customer data wherever it appears' };
    }
    if (looksLikeUrl(key)) {
      return { reason: 'url', text: key, attr: attr || null,
               note: 'a whole URL: untranslatable, and often the customer\'s own' };
    }
    if (OBJECT_ID.test(key)) {
      return { reason: 'record-id', text: key, attr: attr || null,
               note: '24 hex digits: a HighLevel record id' };
    }
    if (PHONE_SHAPE.test(key) || EMAIL_SHAPE.test(key)) {
      return { reason: recordShape(key), text: key, attr: attr || null,
               note: 'a phone number or e-mail address: customer data' };
    }
    return { reason: 'missing', text: key, attr: attr || null };
  }
  function dead() {
    return CONTENT_ZONES.map(function (sel) {
      var n = 0;
      try { n = document.querySelectorAll(sel).length; } catch (e) { n = -1; }
      return { selector: sel, matches: n };
    });
  }
  function frameReachable(f) {
    try { return f.contentDocument !== null; } catch (e) { return false; }
  }
  function isWallFrame(f) {
    return !frameReachable(f) && f.clientWidth > 400 && f.clientHeight > 300;
  }
  function frames() {
    var out = [];
    document.querySelectorAll('iframe').forEach(function (f) {
      var host = '';
      try { host = new URL(f.src, location.href).host; } catch (e) { host = '(no src)'; }
      out.push({
        host: host,
        w: f.clientWidth, h: f.clientHeight,
        wall: isWallFrame(f),
        reachable: frameReachable(f)
      });
    });
    return out;
  }
  var NOTICES = {};
  var NOTICES_ON = null;
  var NOTICE_DISMISSED_KEY = 'ka_notes_dismissed';
  var NOTICE_KINDS = {
    limit: ['#D97757', '#D97757', '#1a1a1a'], info: ['#2563eb', '#eff6ff', '#1f2937'],
    warn:  ['#D97757', '#D97757', '#1a1a1a'], error: ['#dc2626', '#fef2f2', '#1f2937']
  };
  function noticesOn() {
    if (NOTICES_ON !== null) return NOTICES_ON;
    var on = window.__kaNotices !== false;
    try {
      var qs = window.location.search;
      localStorage.removeItem(NOTICE_DISMISSED_KEY);
      if (/[?&]kanotes=1(?:&|$)/.test(qs)) {
        localStorage.removeItem('ka_notes');
        sessionStorage.removeItem(NOTICE_DISMISSED_KEY);
      }
      if (/[?&]kanotes=0(?:&|$)/.test(qs)) localStorage.setItem('ka_notes', '0');
      if (localStorage.getItem('ka_notes') === '0') on = false;
    } catch (e) {
      if (/[?&]kanotes=0(?:&|$)/.test(window.location.search)) on = false;
    }
    return (NOTICES_ON = on);
  }
  function noticeText(code) {
    var N = PACK && PACK.notices;
    return N && typeof N[code] === 'string' ? N[code] : null;
  }
  function noticeRoute() {
    return window.location.pathname.replace(/^.*\/location\/[^/]+\//, '').split('/').slice(0, 2).join('/');
  }
  function noticeDismissed(id) {
    try {
      var m = JSON.parse(sessionStorage.getItem(NOTICE_DISMISSED_KEY) || '{}');
      return !!(m && m[id + '|' + noticeRoute()]);
    } catch (e) { return false; }
  }
  function dismissNotice(id) {
    try {
      var m = JSON.parse(sessionStorage.getItem(NOTICE_DISMISSED_KEY) || '{}') || {};
      m[id + '|' + noticeRoute()] = 1;
      sessionStorage.setItem(NOTICE_DISMISSED_KEY, JSON.stringify(m));
    } catch (e) {}
    removeNotice(id);
  }
  function removeNotice(id) {
    var c = NOTICES[id];
    if (c && c.el.parentNode) c.el.parentNode.removeChild(c.el);
    if (c && c.style && c.style.parentNode) c.style.parentNode.removeChild(c.style);
    delete NOTICES[id];
  }
  function removeAllNotices() {
    for (var id in NOTICES) if (own(NOTICES, id)) removeNotice(id);
  }
  function buildNotice(id, kind, text, dismissible) {
    var colours = NOTICE_KINDS[kind] || NOTICE_KINDS.limit;
    var box = document.createElement('div');
    box.setAttribute('data-ka-ignore', '');
    box.setAttribute('data-ka-notice', id);
    box.setAttribute('role', 'status');
    box.setAttribute('aria-live', 'polite');
    box.style.cssText =
      'box-sizing:border-box;display:flex;align-items:center;gap:12px;margin:0;' +
      'padding:8px 8px 8px 12px;font:700 14px/1.4 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;' +
      'color:' + colours[2] + ';background:' + colours[1] + ';border:1px solid ' + colours[0] + ';' +
      'border-left:4px solid ' + colours[0] + ';border-radius:6px;';
    var msg = document.createElement('span');
    msg.textContent = text;
    msg.style.cssText = 'flex:1 1 auto;min-width:0;';
    box.appendChild(msg);
    var label = noticeText('dismiss');
    if (label && dismissible) {
      var b = document.createElement('button');
      b.type = 'button';
      b.textContent = '×';
      b.setAttribute('aria-label', label);
      b.title = label;
      b.style.cssText = 'flex:none;border:0;background:transparent;color:' + colours[2] + ';' +
        'font-size:20px;line-height:1;padding:2px 8px;border-radius:4px;cursor:pointer;';
      b.addEventListener('click', function () { dismissNotice(id); });
      box.appendChild(b);
    }
    return box;
  }
  var noticeSlots = 0;
  function fitRule(slot, h) {
    return ':has(> [data-ka-notice-slot="' + slot + '"]) > iframe { height: calc(100% - ' + h + 'px) !important; }';
  }
  function fitHeight(c) {
    var h = Math.ceil(c.el.getBoundingClientRect().height);
    if (h === c.h) return;
    c.h = h;
    c.style.textContent = fitRule(c.slot, h);
  }
  function placeAbove(id, box, frame) {
    var parent = frame.parentNode;
    var fills = Math.abs(frame.getBoundingClientRect().height - parent.clientHeight) < 2;
    parent.insertBefore(box, frame);
    var c = { el: box, style: null, slot: null, h: 0, frame: frame, mode: 'inline', route: noticeRoute() };
    if (fills) {
      c.slot = 'n' + (++noticeSlots);
      box.setAttribute('data-ka-notice-slot', c.slot);
      c.style = document.createElement('style');
      c.style.setAttribute('data-ka-ignore', '');
      document.head.appendChild(c.style);
      c.mode = 'fit';
      fitHeight(c);
    }
    return (NOTICES[id] = c);
  }
  function wallFrame() {
    var fs = document.querySelectorAll('iframe');
    for (var i = 0; i < fs.length; i++) if (isWallFrame(fs[i])) return fs[i];
    return null;
  }
  function placePage(box) {
    var hdr = document.querySelector('header.hl_header');
    var r = hdr ? hdr.getBoundingClientRect() : null;
    var z = hdr ? parseInt(getComputedStyle(hdr).zIndex, 10) : NaN;
    box.style.top = (r ? Math.max(0, Math.round(r.bottom)) : 0) + 'px';
    box.style.left = (r ? Math.round(r.left) : 0) + 'px';
    box.style.width = (r ? Math.round(r.width) : window.innerWidth) + 'px';
    box.style.zIndex = String(isNaN(z) ? 999 : Math.max(1, z - 1));
  }
  function syncPageNotice(id, want) {
    var cur = NOTICES[id];
    if (!want) { if (cur) removeNotice(id); return; }
    if (!cur || !cur.el.isConnected) {
      if (cur) removeNotice(id);
      var box = buildNotice(id, 'warn', noticeText(id), false);
      box.style.position = 'fixed';
      box.style.margin = '0';
      box.style.borderRadius = '0';
      document.body.appendChild(box);
      cur = NOTICES[id] = { el: box, style: null, slot: null, h: 0, frame: null, mode: 'page', route: noticeRoute() };
    }
    placePage(cur.el);
  }
  function syncFrameNotice(fr) {
    var id = 'frame-unreachable', cur = NOTICES[id];
    if (!fr || noticeDismissed(id)) { if (cur) removeNotice(id); return; }
    if (cur && cur.el.isConnected && cur.frame === fr && fr.isConnected) {
      if (cur.mode === 'fit') fitHeight(cur);
      return;
    }
    if (cur) removeNotice(id);
    placeAbove(id, buildNotice(id, 'limit', noticeText(id), true), fr);
  }
  var NOTICE_PRIORITY = { 'wrong-platform-language': 1, 'frame-unreachable': 2 };
  function updateNotices() {
    var on = noticesOn() && !!PACK;
    var langWrong = on && allowedHere() && audience === true && !sourceMatches() &&
                    !!noticeText('wrong-platform-language');
    var fr = on && STATUS.translatingHere && noticeText('frame-unreachable') ? wallFrame() : null;
    var eligible = [];
    if (langWrong) eligible.push('wrong-platform-language');
    if (fr && !noticeDismissed('frame-unreachable')) eligible.push('frame-unreachable');
    var best = null, i;
    for (i = 0; i < eligible.length; i++) {
      if (best === null || NOTICE_PRIORITY[eligible[i]] < NOTICE_PRIORITY[best]) best = eligible[i];
    }
    for (i = 0; i < eligible.length; i++) {
      if (NOTICES[eligible[i]] && NOTICE_PRIORITY[eligible[i]] === NOTICE_PRIORITY[best]) best = eligible[i];
    }
    STATUS.userReason = best;
    syncPageNotice('wrong-platform-language', best === 'wrong-platform-language');
    syncFrameNotice(best === 'frame-unreachable' ? fr : null);
  }
  var noticeTimer = null, noticeLast = 0;
  function scheduleNotices() {
    if (noticeTimer) return;
    noticeTimer = window.setTimeout(function () {
      noticeTimer = null;
      noticeLast = Date.now();
      try { updateNotices(); } catch (e) {   }
    }, Math.max(0, 400 - (Date.now() - noticeLast)));
  }
  var frameLog = null;
  function watchFrames() {
    if (frameLog) return frameLog;
    frameLog = [];
    window.addEventListener('message', function (e) {
      if (!/leadconnectorhq\.com$/.test(String(e.origin).replace('https://', ''))) return;
      var d = e.data, kind = null, detail = null;
      if (d && d.type === 'load') { kind = 'load'; detail = d.url; }
      else if (d && d.postmate === 'emit' && d.value) {
        if (d.value.name === 'route-change') {
          kind = 'route-change';
          detail = d.value.data && d.value.data.path;
        } else if (d.value.name === 'update-document-title') {
          kind = 'title';
          detail = d.value.data && d.value.data.title;
        }
      }
      if (!kind) return;
      frameLog.push({ t: Math.round(performance.now()), kind: kind, detail: detail });
      if (frameLog.length > 200) frameLog.shift();
    });
    return frameLog;
  }
  window.__kaDebug = {
    version: VERSION,
    translate: translate,
    why: why,
    describe: describe,
    dead: dead,
    frames: frames,
    watchFrames: watchFrames,
    frameLog: function () { return frameLog ? frameLog.slice() : null; },
    walls: function () {
      return DECLARED_WALLS.map(function (w) {
        var n = 0;
        try { n = document.querySelectorAll(w.zone).length; } catch (e) { n = -1; }
        return { id: w.id, zone: w.zone, live: n, blocking: CONTENT_ZONES.indexOf(w.zone) !== -1,
                 note: w.note };
      });
    },
    wallDrift: WALL_DRIFT,
    zones: CONTENT_ZONES,
    phrases: ZONE_PHRASES.map(function (z) { return { zone: z.zone, phrases: z.phrases.slice() }; }),
    attrs: ATTRS,
    maxLen: MAX_LEN,
    records: function () { return RECORDS_N; },
    routeOverrides: function () {
      var m = routeOverrides();
      return m ? { scope: ROUTE_PATH, overrides: m } : null;
    }
  };
  function missed(raw, node, attr) {
    var h = window.__kaOnMiss;
    if (typeof h !== 'function') return;
    if (isOurOutput(String(raw).trim())) return;
    try { h(String(raw), node, attr || null); } catch (e) {   }
  }
  function doTextNode(node) {
    if (node.__kaDone === node.textContent) return;
    var raw = node.textContent;
    if (!raw || raw.length > MAX_LEN) return;
    var out = translate(raw);
    if (out === null) {
      if (!isRecordMirror(raw) && !recordShape(raw)) missed(raw, node, null);
      return;
    }
    var lead = raw.match(/^\s*/)[0];
    var tail = raw.match(/\s*$/)[0];
    node.__kaSrc = raw;
    node.textContent = lead + out + tail;
    node.__kaDone = node.textContent;
  }
  function doAttrs(el) {
    for (var i = 0; i < ATTRS.length; i++) {
      var a = ATTRS[i];
      if (!el.hasAttribute || !el.hasAttribute(a)) continue;
      var v = el.getAttribute(a);
      if (!v || v.length > MAX_LEN) continue;
      var mark = '__kaAttr_' + a;
      if (el[mark] === v) continue;
      var out = translate(v);
      if (out === null) {
        if (!isRecordMirror(v) && !recordShape(v)) missed(v, el, a);
        continue;
      }
      if (out === v) continue;
      el.setAttribute(a, out);
      el[mark] = out;
      el['__kaAttrSrc_' + a] = v;
      if (TOUCHED_ATTRS.length < MAX_TOUCHED) TOUCHED_ATTRS.push([el, a, v, out]);
    }
  }
  function doValues(el) {
    if (!TRANSLATE_PREFILLS) return;
    if (el.tagName === 'INPUT' && el.type && !/^(text|search)$/i.test(el.type)) return;
    if (el === document.activeElement) return;
    var v = el.value;
    if (!v || v.length > MAX_LEN) return;
    if (el.__kaVal === v) return;
    if (!RULES || typeof RULES.isPrefillDefault !== 'function') return;
    if (!RULES.isPrefillDefault(v)) return;
    var out = translate(v);
    if (out === null || out === v) return;
    el.value = out;
    el.__kaVal = out;
    try {
      el.dispatchEvent(new Event('input',  { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    } catch (e) {}
  }
  var MAX_TOUCHED = 6000;
  var TOUCHED_ATTRS = [];
  function revertAll() {
    var restored = 0;
    var w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
    var n;
    while ((n = w.nextNode())) {
      if (n.__kaSrc === undefined) continue;
      if (n.__kaDone === n.textContent) { n.textContent = n.__kaSrc; restored++; }
      n.__kaSrc = undefined;
      n.__kaDone = undefined;
    }
    for (var i = 0; i < TOUCHED_ATTRS.length; i++) {
      var t = TOUCHED_ATTRS[i];
      try {
        if (t[0].getAttribute && t[0].getAttribute(t[1]) === t[3]) {
          t[0].setAttribute(t[1], t[2]);
          restored++;
        }
      } catch (e) {   }
    }
    TOUCHED_ATTRS = [];
    var css = document.getElementById(PACK_STYLE_ID);
    if (css && css.parentNode) css.parentNode.removeChild(css);
    STATUS.reverted = restored;
    return restored;
  }
  function walk(root) {
    if (!root) return;
    if (!shouldTranslate()) return;
    if (root.nodeType === 3) {
      if (blockedText(root.parentElement) && !zonePhrase(root)) noteRecord(root.textContent);
      else doTextNode(root);
      return;
    }
    if (root.nodeType !== 1) return;
    if (root.closest && root.closest(BLOCKED_ATTR)) {
      if (PHRASE_ZONES && root.closest(PHRASE_ZONES)) {
        var pw = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null), pn;
        while ((pn = pw.nextNode())) {
          if (zonePhrase(pn)) doTextNode(pn);
          else noteRecord(pn.textContent);
        }
      }
      return;
    }
    var recFields = root.querySelectorAll('input,textarea');
    for (var rf = -1; rf < recFields.length; rf++) {
      var fe = rf < 0 ? root : recFields[rf];
      if (fe.tagName !== 'INPUT' && fe.tagName !== 'TEXTAREA') continue;
      if (fe.tagName === 'INPUT' && fe.type && !/^(text|search)$/i.test(fe.type)) continue;
      if (fe.value && fe.__kaVal !== fe.value) noteRecord(fe.value);
    }
    var w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) {
        if (!blockedText(n.parentElement)) return NodeFilter.FILTER_ACCEPT;
        if (zonePhrase(n)) return NodeFilter.FILTER_ACCEPT;
        noteRecord(n.textContent);
        return NodeFilter.FILTER_REJECT;
      }
    });
    var n;
    while ((n = w.nextNode())) doTextNode(n);
    if (!blockedAttr(root)) doAttrs(root);
    var withAttrs = root.querySelectorAll('[placeholder],[title],[aria-label]');
    for (var i = 0; i < withAttrs.length; i++) {
      if (!blockedAttr(withAttrs[i])) doAttrs(withAttrs[i]);
    }
    if (TRANSLATE_PREFILLS) {
      if (root.tagName === 'INPUT' || root.tagName === 'TEXTAREA') {
        if (!blockedAttr(root)) doValues(root);
      }
      var fields = root.querySelectorAll('input,textarea');
      for (var v = 0; v < fields.length; v++) {
        if (!blockedAttr(fields[v])) doValues(fields[v]);
      }
    }
  }
  var queue = [];
  var scheduled = false;
  function flush() {
    scheduled = false;
    var wasHere = STATUS.translatingHere;
    refreshStatus();
    if (wasHere === true && STATUS.translatingHere === false) {
      try { revertAll(); } catch (e) {   }
    }
    if (STATUS.translatingHere) injectPackCss();
    if (noticesOn()) scheduleNotices();
    var batch = queue;
    queue = [];
    for (var i = 0; i < batch.length; i++) {
      try { walk(batch[i]); } catch (e) {   }
    }
  }
  var defer = typeof window.queueMicrotask === 'function'
    ? function (fn) { window.queueMicrotask(fn); }
    : function (fn) { Promise.resolve().then(fn); };
  function schedule(node) {
    queue.push(node);
    if (scheduled) return;
    scheduled = true;
    defer(flush);
  }
  function start() {
    refreshStatus();
    if (shouldTranslate()) injectPackCss();
    walk(document.body);
    window.__kaDebug.notices = function () {
      var out = [];
      for (var id in NOTICES) if (own(NOTICES, id)) {
        out.push({ id: id, mode: NOTICES[id].mode, route: NOTICES[id].route,
                   connected: NOTICES[id].el.isConnected, text: NOTICES[id].el.textContent });
      }
      return { on: noticesOn(), userReason: STATUS.userReason || null, shown: out };
    };
    if (noticesOn()) {
      window.addEventListener('resize', scheduleNotices);
      scheduleNotices();
    }
    new MutationObserver(function (muts) {
      try {
      for (var i = 0; i < muts.length; i++) {
        var m = muts[i];
        if (m.type === 'characterData') {
          schedule(m.target);
        } else if (m.type === 'attributes') {
          schedule(m.target);
        } else {
          for (var j = 0; j < m.addedNodes.length; j++) schedule(m.addedNodes[j]);
        }
      }
      } catch (e) {   }
    }).observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ATTRS
    });
    console.info('[' + STATUS.locale + '] language layer ' + VERSION +
      ' active — ' + STATUS.terms + ' terms (' + STATUS.curated + ' curated, ' +
      STATUS.fromApi + ' from HighLevel), data ' + DATA_VERSION +
      ' — language from ' + STATUS.localeSource +
      '. Override with ?cslang=<locale>, clear with ?cslang=0, disable with ?nocs=1');
    if (!allowedHere()) {
      console.info('[' + STATUS.locale + '] ...but NOT translating this screen: ' +
        'the sub-account is not in ONLY_LOCATIONS. path ' + window.location.pathname +
        ' | allowed ' + (ONLY_LOCATIONS.length ? ONLY_LOCATIONS.join(', ') : '(all)'));
    }
  }
  bootData();
})();
