/* =============================================================================
   collector.js — PASSIVE HARVEST. Every screen anyone visits contributes.

   The native review showed the gaps are dictionary coverage, not engine reach:
   on the bulk-action modals the TITLE was Czech and the BODY was English, which
   means we walked those nodes and simply had no words for them. HighLevel's
   localization corpus does not cover the newer surfaces, so the source of new
   strings has to be the product itself.

   The cheap way to read the product is to stop treating harvesting as an
   errand. This listens while you work. No crawler, no session set aside,
   nothing clicked, no badge — coverage grows in proportion to the screens
   people ACTUALLY USE, which is the right weighting anyway.

   HOW IT HEARS ABOUT A MISS
     The engine has exactly one place a text node fails to translate and one
     for an attribute, and since v33 both call window.__kaOnMiss if something
     has registered it. We register it. We do NOT run our own observer: that
     would duplicate the engine's entire walk on every mutation, for nothing.

   WHY CUSTOMER DATA CANNOT ARRIVE HERE BY ACCIDENT
     By the time the engine reaches either miss site the string has already
     passed CONTENT_ZONES and the length guard. So the stream contains only
     text the engine was already willing to translate. If something that looks
     like personal data turns up anyway, THAT IS NOT NOISE — it is evidence
     that the do-not-touch list is decorative in that place. Those are flagged,
     never silently dropped, and counted separately.

   FREQUENCY IS THE SORT ORDER
     Interface chrome repeats across routes and accounts; a customer's name
     appears once. Counting sightings orders the harvest queue for you and
     drops the suspicious tail to the bottom on its own.

   NOTHING LEAVES THE BROWSER. It accumulates in localStorage and you take it
   with __kaCollect.download(). No endpoint, no beacon, no network at all.

   INSTALL — after the engine, in the Whitelabel Custom JS box:
     <script src="https://tomkeyser.github.io/ghl-czech-ui/collector.js"></script>

   CONSOLE
     __kaCollect.stats()      what has been seen, by route
     __kaCollect.top(40)      the 40 most-sighted missing strings
     __kaCollect.suspect()    strings that look like customer data — firewall holes
     __kaCollect.download()   one JSON
     __kaCollect.clear()      start again

   KILL SWITCH:  ?nocollect=1
============================================================================= */

(function () {
  'use strict';

  var VERSION = 'c3';
  var KEY = 'ka_collect_v1';
  var MAX_ENTRIES = 6000;
  var MAX_BYTES = 3 * 1024 * 1024;         /* well under the ~5MB origin cap */
  var FLUSH_MS = 4000;                     /* batch writes; misses arrive in bursts */

  if (window.top !== window) return;       /* top document only */
  if (window.__kaCollectActive) return;
  if (location.search.indexOf('nocollect=1') !== -1) {
    console.info('[collect] disabled via ?nocollect=1');
    return;
  }
  window.__kaCollectActive = true;

  /* ---------- the gate ----------------------------------------------------
     Inherited from the engine rather than copied, and re-read every call:
     HighLevel is an SPA and you can cross into an ungated sub-account without
     a reload. Nothing is recorded where the engine is not translating. */
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

  /* ---------- store -------------------------------------------------------
     Keyed by text + attribute. One entry per distinct string, carrying every
     route it has been seen on — because a string appearing on nine screens is
     chrome and worth translating first, and the routes tell you where to go
     and look at it in context before you do. */
  var store = { picks: {}, started: new Date().toISOString() };
  try {
    var saved = localStorage.getItem(KEY);
    if (saved) {
      var parsed = JSON.parse(saved);
      if (parsed && parsed.picks) store = parsed;
    }
  } catch (e) { /* start empty */ }

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
    } catch (e) { /* quota or private mode: the in-memory copy still downloads */ }
  }

  function schedule() {
    dirty = true;
    if (flushTimer) return;
    flushTimer = setTimeout(flush, FLUSH_MS);
  }
  window.addEventListener('beforeunload', flush);

  /* ---------- what looks like customer data --------------------------------
     Deliberately conservative and deliberately NOT a filter. Anything matching
     is still recorded, marked suspect, and counted — because a personal name or
     an email reaching this stream means the engine was willing to translate it,
     which is a hole in CONTENT_ZONES and the single most useful thing this tool
     can find. Silently dropping them would hide the bug. */
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

  /* A cheap provenance note, computed ONCE on first sighting. Full selector
     derivation on every miss would be pointless work — misses arrive by the
     hundred on a first render. */
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

  /* ---------- the hook ---------------------------------------------------- */
  var entries = 0;
  for (var k in store.picks) if (Object.prototype.hasOwnProperty.call(store.picks, k)) entries++;

  /* ---------- animated text -----------------------------------------------
     The Calendars screen types its greeting out one character at a time, and
     the first walk recorded EVERY FRAME: "Hi", "Hi z", "Hi zz", "Hi zz t" ...
     sixty-odd entries from one string, crowding the frequency ranking that
     makes this queue worth reading.

     So a miss on a TEXT NODE waits to see whether that node is still moving.
     Only the settled text is recorded. It is the same "wait for the DOM to
     stop" discipline the automated walk uses between routes, applied per node.

     Attributes are committed immediately: nothing animates an aria-label, and
     delaying them would only lose misses on nodes that vanish quickly. */
  var SETTLE_MS = 700;
  var pending = new Map();

  /* "Status: Pe..." arrives already cut off — the ellipsis is IN the text, not
     in CSS. No dictionary entry can ever match it, and one entry appears per
     column width. Marked rather than dropped: a marked row can still be counted
     and inspected, whereas a dropped one silently disappears and someone
     re-discovers it later. The test is the last word: "calendars..." is a real
     string, "Pe..." is a fragment. */
  function looksTruncated(t) {
    /* everything after the label cut away: "Due Date: ..." */
    if (/\s(\.{3}|…)$/.test(t)) return true;
    var m = /(\S+)(?:\.{3}|…)$/.exec(t);
    if (!m) return false;
    var lastWord = m[1].replace(/[.…]+$/, '');
    return lastWord.length > 0 && lastWord.length < 4;
  }

  function record(text, node, attr) {
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
    /* single characters, bare numbers and separators are never worth a
       dictionary entry and would swamp the frequency ranking */
    if (text.length < 2) return;
    if (/^[\s\W\d]+$/.test(text)) return;

    if (attr || !node || node.nodeType !== 3) { record(text, node, attr); return; }

    /* KEYED ON THE PARENT ELEMENT, NOT THE TEXT NODE. The first attempt keyed
       on the node and changed nothing, because the greeting does not mutate one
       node's text -- the framework REPLACES the node on every frame, so each
       frame arrived under a fresh key and nothing was ever debounced against
       anything. Checked after the v52 deploy; sixty frames still in the queue.

       A parent can hold several unrelated text children, so collapsing purely
       by parent would lose real siblings. The prefix test separates the two
       cases: an animation frame always extends (or is extended by) the one
       before it, while a genuine sibling shares no such relationship and is
       recorded immediately. */
    var parent = node.parentElement;
    if (!parent) { record(text, node, null); return; }

    var prev = pending.get(parent);
    if (prev) {
      clearTimeout(prev.timer);
      var sameString = text.indexOf(prev.text) === 0 || prev.text.indexOf(text) === 0;
      if (!sameString) record(prev.text, prev.node, null);   /* a real sibling */
    }
    var entry = { text: text, node: node };
    entry.timer = setTimeout(function () {
      pending.delete(parent);
      record(entry.text, entry.node, null);
    }, SETTLE_MS);
    pending.set(parent, entry);
  };

  /* ---------- reading it back --------------------------------------------- */
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
    /* strings the DOM had already cut off — no dictionary entry can match a
       fragment, and there is one per column width */
    truncated: function () { return all().filter(function (r) { return r.truncated; }); },
    top: function (n) {
      var list = all().filter(function (r) { return !r.suspect && !r.truncated; }).slice(0, n || 30);
      /* console.table gives a readable grid; fall back to the array if not there */
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

  /* ---------- extension interface -----------------------------------------
     A content script runs in an isolated world and cannot call the functions
     above directly, but it does not need a button on the page either — which
     would couple us to HighLevel's own markup for no gain. It injects a small
     MAIN-world shim that relays these events. */
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
