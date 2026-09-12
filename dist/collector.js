(function () {
  'use strict';
  var VERSION = 'c5';
  var KEY = 'ka_collect_v1';
  var MAX_ENTRIES = 6000;
  var MAX_BYTES = 3 * 1024 * 1024;
  var FLUSH_MS = 4000;
  if (window.top !== window) return;
  if (window.__kaCollectActive) return;
  if (location.search.indexOf('nocollect=1') !== -1) {
    console.info('[collect] disabled via ?nocollect=1');
    return;
  }
  window.__kaCollectActive = true;
  var FALLBACK_LOCATIONS = ['SbA5m1DElMNEKBVnixsX', 'zWR1h9iaCeH2Ki6kGZLD'];
  function allowedHere() {
    var s = window.__kaStatus;
    var list = (s && s.onlyLocations && s.onlyLocations.length) ? s.onlyLocations : FALLBACK_LOCATIONS;
    if (!list.length) return true;
    for (var i = 0; i < list.length; i++) {
      if (location.pathname.indexOf('/location/' + list[i]) !== -1) return true;
    }
    return false;
  }
  function routeOf() {
    return location.pathname.replace(/^\/v[0-9]+\/location\/[^/]+/, '') || '/';
  }
  function locationId() {
    var m = /\/location\/([^/]+)/.exec(location.pathname);
    return m ? m[1] : null;
  }
  var store = { picks: {}, started: new Date().toISOString() };
  try {
    var saved = localStorage.getItem(KEY);
    if (saved) {
      var parsed = JSON.parse(saved);
      if (parsed && parsed.picks) store = parsed;
    }
  } catch (e) {   }
  var dirty = false, flushTimer = null;
  function flush() {
    flushTimer = null;
    if (!dirty) return;
    dirty = false;
    try {
      var json = JSON.stringify(store);
      if (json.length > MAX_BYTES) {
        console.warn('[collect] storage full — __kaCollect.download() then .clear()');
        return;
      }
      localStorage.setItem(KEY, json);
    } catch (e) {   }
  }
  function schedule() {
    dirty = true;
    if (flushTimer) return;
    flushTimer = setTimeout(flush, FLUSH_MS);
  }
  window.addEventListener('beforeunload', flush);
  var LOOKS_LIKE_DATA = [
    { name: 'email',   re: /[^\s@]+@[^\s@]+\.[a-z]{2,}/i },
    { name: 'phone',   re: /(?:\+?\d[\s().-]{0,2}){7,}/ },
    { name: 'url',     re: /https?:\/\/|www\./i },
    { name: 'money',   re: /[$£€]\s?\d/ },
    { name: 'id-ish',  re: /^[A-Za-z0-9_-]{16,}$/ },
    { name: 'mostly-digits', re: /^[\d\s.,:/-]{6,}$/ }
  ];
  function suspectOf(text) {
    for (var i = 0; i < LOOKS_LIKE_DATA.length; i++) {
      if (LOOKS_LIKE_DATA[i].re.test(text)) return LOOKS_LIKE_DATA[i].name;
    }
    return null;
  }
  function whereOf(node, attr) {
    try {
      var el = (node && node.nodeType === 3) ? node.parentElement : node;
      if (!el || !el.tagName) return '';
      var hop = 0, out = el.tagName.toLowerCase();
      for (var n = el; n && hop < 8; n = n.parentElement, hop++) {
        if (n.id) return n.tagName.toLowerCase() + '#' + n.id + ' ' + out;
        var c = (n.className && n.className.baseVal !== undefined) ? n.className.baseVal : n.className;
        c = String(c || '').trim().split(/\s+/).filter(function (x) {
          return x.length > 2 && x.length < 28 && !/^(ng-|v-|css-|is-|has-|hl-?)/.test(x);
        })[0];
        if (c) return n.tagName.toLowerCase() + '.' + c + ' ' + out;
      }
      return out + (attr ? '[' + attr + ']' : '');
    } catch (e) { return ''; }
  }
  var entries = 0;
  for (var k in store.picks) if (Object.prototype.hasOwnProperty.call(store.picks, k)) entries++;
  var SETTLE_MS = 700;
  var pending = new Map();
  function looksTruncated(t) {
    if (/\s(\.{3}|…)$/.test(t)) return true;
    var m = /(\S+)(?:\.{3}|…)$/.exec(t);
    if (!m) return false;
    var lastWord = m[1].replace(/[.…]+$/, '');
    return lastWord.length > 0 && lastWord.length < 4;
  }
  function record(text, node, attr, transient) {
    var id = (attr ? attr + '|' : '') + text;
    var rec = store.picks[id];
    var route = routeOf();
    if (!rec) {
      if (entries >= MAX_ENTRIES) return;
      entries++;
      rec = store.picks[id] = {
        text: text,
        attr: attr || null,
        seen: 0,
        routes: [],
        accounts: [],
        where: whereOf(node, attr),
        suspect: suspectOf(text),
        truncated: looksTruncated(text),
        transient: !!transient,
        first: new Date().toISOString()
      };
    }
    rec.seen++;
    if (rec.routes.indexOf(route) === -1 && rec.routes.length < 25) rec.routes.push(route);
    var acc = locationId();
    if (acc && rec.accounts.indexOf(acc) === -1) rec.accounts.push(acc);
    schedule();
  }
  window.__kaOnMiss = function (raw, node, attr) {
    if (!allowedHere()) return;
    var text = String(raw == null ? '' : raw).trim();
    if (!text) return;
    if (text.length < 2) return;
    if (/^[\s\W\d]+$/.test(text)) return;
    if (attr || !node || node.nodeType !== 3) { record(text, node, attr); return; }
    var parent = node.parentElement;
    if (!parent) { record(text, node, null); return; }
    var prev = pending.get(parent);
    if (prev) {
      clearTimeout(prev.timer);
      var sameString = text.indexOf(prev.text) === 0 || prev.text.indexOf(text) === 0;
      if (!sameString) record(prev.text, prev.node, null);
    }
    var entry = { text: text, node: node };
    entry.timer = setTimeout(function () {
      pending.delete(parent);
      try {
        var dbg = window.__kaDebug;
        if (dbg && dbg.why && parent && !parent.isConnected) {
          record(entry.text, entry.node, null, true);
          return;
        }
        if (dbg && dbg.why && parent.isConnected) {
          var anyOutstanding = false;
          for (var c = parent.firstChild; c && !anyOutstanding; c = c.nextSibling) {
            if (c.nodeType !== 3) continue;
            if (!(c.textContent || '').trim()) continue;
            if (dbg.why(c).reason === 'missing') anyOutstanding = true;
          }
          if (!anyOutstanding) return;
        }
      } catch (e) {   }
      record(entry.text, entry.node, null);
    }, SETTLE_MS);
    pending.set(parent, entry);
  };
  function all() {
    var out = [];
    for (var k in store.picks) {
      if (Object.prototype.hasOwnProperty.call(store.picks, k)) out.push(store.picks[k]);
    }
    return out.sort(function (a, b) { return b.seen - a.seen; });
  }
  function stats() {
    var list = all();
    var byRoute = {}, suspects = 0;
    for (var i = 0; i < list.length; i++) {
      if (list[i].suspect) suspects++;
      for (var j = 0; j < list[i].routes.length; j++) {
        byRoute[list[i].routes[j]] = (byRoute[list[i].routes[j]] || 0) + 1;
      }
    }
    return {
      strings: list.length,
      suspect: suspects,
      routesSeen: Object.keys(byRoute).length,
      perRoute: byRoute,
      since: store.started,
      engine: window.__kaVersion || null
    };
  }
  window.__kaCollect = {
    version: VERSION,
    stats: stats,
    all: all,
    truncated: function () { return all().filter(function (r) { return r.truncated; }); },
    transient: function () { return all().filter(function (r) { return r.transient; }); },
    top: function (n) {
      var list = all().filter(function (r) { return !r.suspect && !r.truncated && !r.transient; }).slice(0, n || 30);
      if (console.table) console.table(list.map(function (r) {
        return { seen: r.seen, text: r.text.slice(0, 70), attr: r.attr || '', routes: r.routes.length };
      }));
      return list;
    },
    suspect: function () {
      var list = all().filter(function (r) { return !!r.suspect; });
      if (!list.length) {
        console.info('[collect] nothing suspicious — the do-not-touch list is holding here so far.');
        return list;
      }
      console.warn('[collect] ' + list.length + ' strings reached the engine that look like customer ' +
        'data. Each one is a hole in CONTENT_ZONES, not a translation candidate.');
      if (console.table) console.table(list.map(function (r) {
        return { kind: r.suspect, text: r.text.slice(0, 60), where: r.where, routes: r.routes.join(' ') };
      }));
      return list;
    },
    download: function () {
      flush();
      var payload = {
        version: VERSION,
        engine: window.__kaVersion || null,
        locale: (window.__kaStatus && window.__kaStatus.locale) || null,
        exportedAt: new Date().toISOString(),
        since: store.started,
        stats: stats(),
        strings: all()
      };
      var blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'harvest-' + new Date().toISOString().slice(0, 10) + '.json';
      a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); }, 4000);
      return payload.stats;
    },
    clear: function () {
      store = { picks: {}, started: new Date().toISOString() };
      entries = 0;
      try { localStorage.removeItem(KEY); } catch (e) {}
      return 'cleared';
    }
  };
  window.addEventListener('ka:collect', function (e) {
    var cmd = (e && e.detail && e.detail.cmd) || 'stats';
    var result;
    if (cmd === 'dump') result = { stats: stats(), strings: all() };
    else if (cmd === 'clear') result = window.__kaCollect.clear();
    else result = stats();
    window.dispatchEvent(new CustomEvent('ka:collect:result', { detail: { cmd: cmd, result: result } }));
  });
  if (!window.__kaActive) {
    console.warn('[collect] ' + VERSION + ' loaded, but the engine is not active on this page. ' +
      'Nothing will be recorded until it is.');
  } else if (typeof window.__kaOnMiss !== 'function') {
    console.warn('[collect] hook did not register — unexpected.');
  } else {
    console.info('[collect] ' + VERSION + ' listening · engine ' + (window.__kaVersion || '?') +
      ' · ' + entries + ' strings already stored · ' +
      (allowedHere() ? 'recording here' : 'not a gated sub-account, idle') +
      ' · __kaCollect.top() / .suspect() / .download()');
  }
})();
