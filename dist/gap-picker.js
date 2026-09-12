(function () {
  'use strict';
  var VERSION = 'g3';
  var KEY = 'ka_gaps_v1';
  var POS_KEY = 'ka_gap_pos';
  var MAX_BYTES = 4 * 1024 * 1024;
  var FALLBACK_LOCATIONS = [
    'SbA5m1DElMNEKBVnixsX',
    'zWR1h9iaCeH2Ki6kGZLD'
  ];
  if (window.top !== window) return;
  if (window.__kaPickerActive) return;
  if (location.search.indexOf('nopick=1') !== -1) {
    console.info('[gap] disabled via ?nopick=1');
    return;
  }
  try {
    var q = location.search;
    if (q.indexOf('kapick=1') !== -1) localStorage.setItem('ka_pick', '1');
    if (q.indexOf('kapick=0') !== -1) localStorage.removeItem('ka_pick');
    if (localStorage.getItem('ka_pick') !== '1') return;
  } catch (e) { return; }
  window.__kaPickerActive = true;
  window.__kaPickerVersion = VERSION;
  function gatedLocations() {
    var s = window.__kaStatus;
    return (s && s.onlyLocations && s.onlyLocations.length) ? s.onlyLocations : FALLBACK_LOCATIONS;
  }
  function allowedHere() {
    var list = gatedLocations();
    if (!list.length) return true;
    for (var i = 0; i < list.length; i++) {
      if (location.pathname.indexOf('/location/' + list[i]) !== -1) return true;
    }
    return false;
  }
  function dbg() { return window.__kaDebug || null; }
  function diagnose(node, attr) {
    var d = dbg();
    if (!d || !d.why) return { reason: 'no-debug-surface' };
    try { return d.why(node, attr) || { reason: 'unknown' }; }
    catch (e) { return { reason: 'why-threw', error: String(e && e.message || e) }; }
  }
  var store = { picks: [], zones: {} };
  try {
    var saved = localStorage.getItem(KEY);
    if (saved) {
      var parsed = JSON.parse(saved);
      if (parsed && parsed.picks) store = parsed;
      else if (parsed && parsed.length) store.picks = parsed;
    }
  } catch (e) {   }
  function save() {
    try {
      var json = JSON.stringify(store);
      if (json.length > MAX_BYTES) {
        console.warn('[gap] storage full — Download now, then Clear.');
        paintBadge();
        return;
      }
      localStorage.setItem(KEY, json);
    } catch (e) {   }
    paintBadge();
  }
  function routeOf() {
    return location.pathname.replace(/^\/v[0-9]+\/location\/[^/]+/, '') || '/';
  }
  function locationId() {
    var m = /\/location\/([^/]+)/.exec(location.pathname);
    return m ? m[1] : null;
  }
  function classesOf(n) {
    var c = (n.className && n.className.baseVal !== undefined) ? n.className.baseVal : n.className;
    return String(c || '').trim().split(/\s+/).filter(function (x) {
      return x.length > 2 && x.length < 28 && !/^(ng-|v-|css-|is-|has-|hl-?|active|open|show)/.test(x);
    });
  }
  function selectorFor(el) {
    var chain = [], depth = 0, byId = '', byClass = '';
    for (var n = el; n && n.nodeType === 1 && depth < 12; n = n.parentElement, depth++) {
      var tag = n.tagName.toLowerCase();
      if (depth < 5) chain.unshift(tag);
      if (!byId && n.id) byId = tag + '#' + n.id;
      if (!byClass) {
        var c = classesOf(n)[0];
        if (c) byClass = tag + '.' + c;
      }
    }
    var anchor = byId || byClass;
    return anchor ? anchor + ' ' + chain.join('>') : chain.join('>');
  }
  function ruleSelectorFor(el) {
    var own = classesOf(el)[0];
    var self = el.tagName.toLowerCase() + (own ? '.' + own : '');
    var host = '';
    var depth = 0;
    for (var n = el.parentElement; n && depth < 6; n = n.parentElement, depth++) {
      var c = classesOf(n)[0];
      if (c) { host = n.tagName.toLowerCase() + '.' + c; break; }
    }
    var sel = host ? host + ' ' + self : self;
    var matches = -1;
    try { matches = document.querySelectorAll(sel).length; } catch (e) {}
    return { selector: sel, matches: matches };
  }
  var ATTRS = ['placeholder', 'title', 'aria-label', 'alt'];
  function ownText(el) {
    if (!el || !el.childNodes) return null;
    for (var i = 0; i < el.childNodes.length; i++) {
      var n = el.childNodes[i];
      if (n.nodeType === 3 && n.textContent && n.textContent.trim()) return n;
    }
    return null;
  }
  function targetUnder(start) {
    for (var el = start, depth = 0; el && el.nodeType === 1 && depth < 5; el = el.parentElement, depth++) {
      var t = ownText(el);
      if (t) return { node: t, el: el, attr: null, text: t.textContent.trim() };
      for (var i = 0; i < ATTRS.length; i++) {
        if (el.hasAttribute && el.hasAttribute(ATTRS[i])) {
          var v = (el.getAttribute(ATTRS[i]) || '').trim();
          if (v) return { node: el, el: el, attr: ATTRS[i], text: v };
        }
      }
    }
    return null;
  }
  var panel = null;
  function closePanel() {
    if (panel && panel.parentNode) panel.parentNode.removeChild(panel);
    panel = null;
  }
  var UNTOUCHABLE = 'font:inherit;background:none;color:inherit;padding:0;margin:0;border:0';
  function tagButton(label, colour, fn) {
    var b = document.createElement('button');
    b.type = 'button';
    b.textContent = label;
    b.style.cssText = [
      'font:11px/1 system-ui,sans-serif', 'padding:6px 9px', 'cursor:pointer',
      'background:' + colour, 'color:#fff', 'border:0', 'border-radius:3px'
    ].join(';');
    b.addEventListener('click', function (e) {
      e.preventDefault(); e.stopPropagation(); fn();
    });
    return b;
  }
  function line(parent, text, colour) {
    var d = document.createElement('div');
    d.textContent = text;
    d.style.cssText = 'font:11px/1.4 ui-monospace,SFMono-Regular,Menlo,monospace;color:' +
      (colour || '#9aa') + ';word-break:break-word;margin-bottom:4px';
    parent.appendChild(d);
    return d;
  }
  function askTag(hit, x, y) {
    closePanel();
    var info = diagnose(hit.node, hit.attr);
    var rule = ruleSelectorFor(hit.el);
    panel = document.createElement('div');
    panel.id = 'ka-gap-panel';
    panel.setAttribute('data-ka-ignore', '');
    panel.style.cssText = [
      'position:fixed', 'z-index:2147483647',
      'left:' + Math.min(x, window.innerWidth - 340) + 'px',
      'top:' + Math.min(y + 12, window.innerHeight - 250) + 'px',
      'width:320px', 'background:#1E211F', 'color:#fff', 'border-radius:6px',
      'padding:12px', 'box-shadow:0 6px 26px rgba(0,0,0,.45)',
      'font:12px/1.4 system-ui,sans-serif'
    ].join(';');
    var box = document.createElement('code');
    box.style.cssText = UNTOUCHABLE + ';display:block';
    panel.appendChild(box);
    var head = document.createElement('div');
    head.textContent = hit.text.length > 120 ? hit.text.slice(0, 120) + '…' : hit.text;
    head.style.cssText = 'font:600 13px/1.35 system-ui,sans-serif;color:#fff;margin-bottom:6px';
    box.appendChild(head);
    var reasonColour = { missing: '#E0A24A', translated: '#6EBE95', 'content-zone': '#7FA9D8',
                         'data-picker': '#D88A8A', iframe: '#9aa', 'no-debug-surface': '#D85A5A' };
    line(box, 'engine says: ' + info.reason +
      (info.zone ? '  (' + info.zone + ')' : '') +
      (info.to ? '  → ' + info.to : ''), reasonColour[info.reason] || '#9aa');
    if (hit.attr) line(box, 'attribute: ' + hit.attr);
    line(box, 'rule: ' + rule.selector + '   · matches ' + rule.matches + ' here');
    var note = document.createElement('input');
    note.type = 'text';
    note.placeholder = 'note (optional)';
    note.style.cssText = 'width:100%;box-sizing:border-box;margin:6px 0 8px;padding:6px 7px;' +
      'font:12px system-ui,sans-serif;background:#111;color:#fff;border:1px solid #444;border-radius:3px';
    box.appendChild(note);
    function record(tag) {
      store.picks.push({
        tag: tag,
        text: hit.text,
        attr: hit.attr || null,
        reason: info.reason,
        zone: info.zone || null,
        translatedTo: info.to || null,
        rule: rule.selector,
        ruleMatches: rule.matches,
        where: selectorFor(hit.el),
        route: routeOf(),
        account: locationId(),
        note: note.value.trim(),
        at: new Date().toISOString()
      });
      save();
      blink(hit.el, tag);
      closePanel();
    }
    var row = document.createElement('div');
    row.style.cssText = 'display:flex;gap:6px;flex-wrap:wrap';
    row.appendChild(tagButton('Missing', '#8A5A1F', function () { record('missing'); }));
    row.appendChild(tagButton('Name', '#2E5E8A', function () { record('name'); }));
    row.appendChild(tagButton('Data', '#8A2E3A', function () { record('data'); }));
    row.appendChild(tagButton('Unsure', '#444', function () { record('unsure'); }));
    box.appendChild(row);
    var hint = document.createElement('div');
    hint.textContent = 'Esc to cancel';
    hint.style.cssText = 'margin-top:8px;font:10px system-ui,sans-serif;color:#777';
    box.appendChild(hint);
    document.body.appendChild(panel);
    note.focus();
  }
  var BLINK = { missing: '#E0A24A', name: '#5B8FD0', data: '#D06A6A', unsure: '#888' };
  function blink(el, tag) {
    var prev = el.style.outline;
    el.style.outline = '2px solid ' + (BLINK[tag] || '#fff');
    setTimeout(function () { el.style.outline = prev; }, 450);
  }
  var mapOn = false;
  var styleEl = null;
  function ensureStyle() {
    if (styleEl) return;
    styleEl = document.createElement('style');
    styleEl.textContent =
      '.ka-gap{outline:1px dashed rgba(224,162,74,.8)!important;outline-offset:1px}' +
      '.ka-off{outline:1px dotted rgba(127,169,216,.7)!important;outline-offset:1px}' +
      '.ka-ok{outline:1px solid rgba(110,190,149,.35)!important;outline-offset:1px}' +
      '.ka-pickmode *{cursor:crosshair!important}';
    document.head.appendChild(styleEl);
  }
  function unpaint() {
    var els = document.querySelectorAll('.ka-gap,.ka-off,.ka-ok');
    for (var i = 0; i < els.length; i++) els[i].classList.remove('ka-gap', 'ka-off', 'ka-ok');
  }
  function paintMap() {
    unpaint();
    if (!dbg()) return;
    var w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) {
        if (!n.textContent || !n.textContent.trim()) return NodeFilter.FILTER_REJECT;
        var p = n.parentElement;
        if (!p) return NodeFilter.FILTER_REJECT;
        if (p.closest && p.closest('#ka-gap-badge, #ka-gap-panel')) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    var n, painted = 0;
    while ((n = w.nextNode()) && painted < 4000) {
      var el = n.parentElement;
      var r = diagnose(n, null).reason;
      if (r === 'missing') el.classList.add('ka-gap');
      else if (r === 'content-zone' || r === 'data-picker') el.classList.add('ka-off');
      else if (r === 'translated') el.classList.add('ka-ok');
      painted++;
    }
  }
  function setMap(on) {
    mapOn = on;
    ensureStyle();
    if (on) paintMap(); else unpaint();
    paintBadge();
  }
  function auditZones() {
    var d = dbg();
    if (!d || !d.dead) return;
    var route = routeOf();
    if (store.zones[route]) return;
    try { store.zones[route] = d.dead(); save(); } catch (e) {}
  }
  var pickMode = false;
  function setPickMode(on) {
    pickMode = on;
    ensureStyle();
    document.body.classList.toggle('ka-pickmode', on);
    paintBadge();
  }
  document.addEventListener('click', function (e) {
    if (!(e.altKey || pickMode)) return;
    if (!allowedHere()) return;
    if (e.target.closest && e.target.closest('#ka-gap-badge, #ka-gap-panel')) return;
    var hit = targetUnder(e.target);
    if (!hit) return;
    e.preventDefault();
    e.stopPropagation();
    askTag(hit, e.clientX, e.clientY);
  }, true);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closePanel();
  }, true);
  function clamp(v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; }
  var badge = document.createElement('div');
  badge.id = 'ka-gap-badge';
  badge.setAttribute('aria-hidden', 'true');
  badge.setAttribute('data-ka-ignore', '');
  badge.style.cssText = [
    'position:fixed', 'z-index:2147483646',
    'background:#1E211F', 'color:#fff', 'border-radius:6px', 'padding:8px 10px',
    'font:12px/1.35 system-ui,sans-serif', 'box-shadow:0 2px 10px rgba(0,0,0,.35)',
    'display:flex', 'gap:8px', 'align-items:center',
    'opacity:.6', 'transition:opacity .15s', 'user-select:none'
  ].join(';');
  badge.addEventListener('mouseenter', function () { badge.style.opacity = '1'; });
  badge.addEventListener('mouseleave', function () { badge.style.opacity = '.6'; });
  var badgeInner = document.createElement('code');
  badgeInner.style.cssText = UNTOUCHABLE + ';display:flex;gap:8px;align-items:center';
  badge.appendChild(badgeInner);
  function applyPos() {
    var p = null;
    try { p = JSON.parse(localStorage.getItem(POS_KEY) || 'null'); } catch (e) {}
    if (p && typeof p.left === 'number' && typeof p.top === 'number') {
      badge.style.left = clamp(p.left, 0, window.innerWidth - 80) + 'px';
      badge.style.top = clamp(p.top, 0, window.innerHeight - 40) + 'px';
      badge.style.right = badge.style.bottom = badge.style.transform = '';
    } else {
      badge.style.left = '50%';
      badge.style.bottom = '12px';
      badge.style.transform = 'translateX(-50%)';
    }
  }
  applyPos();
  document.body.appendChild(badge);
  function makeDraggable(handle) {
    var dx = 0, dy = 0, dragging = false;
    handle.addEventListener('mousedown', function (e) {
      e.preventDefault();
      var r = badge.getBoundingClientRect();
      dx = e.clientX - r.left;
      dy = e.clientY - r.top;
      dragging = true;
      badge.style.transform = '';
      badge.style.right = badge.style.bottom = '';
      badge.style.opacity = '1';
      document.addEventListener('mousemove', move, true);
      document.addEventListener('mouseup', up, true);
    });
    function move(e) {
      if (!dragging) return;
      badge.style.left = clamp(e.clientX - dx, 0, window.innerWidth - badge.offsetWidth) + 'px';
      badge.style.top = clamp(e.clientY - dy, 0, window.innerHeight - badge.offsetHeight) + 'px';
    }
    function up() {
      dragging = false;
      document.removeEventListener('mousemove', move, true);
      document.removeEventListener('mouseup', up, true);
      var r = badge.getBoundingClientRect();
      try { localStorage.setItem(POS_KEY, JSON.stringify({ left: r.left, top: r.top })); } catch (e) {}
    }
  }
  function button(label, fn) {
    var b = document.createElement('button');
    b.type = 'button';
    b.textContent = label;
    b.style.cssText = [
      'font:11px/1 system-ui,sans-serif', 'padding:5px 8px', 'cursor:pointer',
      'background:#333833', 'color:#fff', 'border:1px solid #555', 'border-radius:3px'
    ].join(';');
    b.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); fn(); });
    return b;
  }
  var countEl = document.createElement('span');
  countEl.style.cssText = 'font-weight:600;white-space:nowrap;cursor:move';
  badgeInner.appendChild(countEl);
  makeDraggable(countEl);
  var pickBtn = button('Pick', function () { setPickMode(!pickMode); });
  badgeInner.appendChild(pickBtn);
  var mapBtn = button('Map', function () { setMap(!mapOn); });
  badgeInner.appendChild(mapBtn);
  badgeInner.appendChild(button('Download', function () {
    var payload = {
      version: VERSION,
      engine: window.__kaVersion || null,
      exportedAt: new Date().toISOString(),
      picks: store.picks,
      zoneAudit: store.zones
    };
    var blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'gaps-' + new Date().toISOString().slice(0, 10) + '.json';
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 4000);
  }));
  var clearArmed = false, clearTimer = null;
  var clearBtn = button('Clear', function () {
    if (!clearArmed) {
      clearArmed = true;
      clearBtn.textContent = 'click again';
      clearTimer = setTimeout(function () {
        clearArmed = false; clearBtn.textContent = 'Clear';
      }, 4000);
      return;
    }
    clearTimeout(clearTimer);
    clearArmed = false;
    clearBtn.textContent = 'Clear';
    store = { picks: [], zones: {} };
    try { localStorage.removeItem(KEY); } catch (e) {}
    save();
  });
  badgeInner.appendChild(clearBtn);
  function paintBadge() {
    var by = { missing: 0, name: 0, data: 0, unsure: 0 };
    for (var i = 0; i < store.picks.length; i++) by[store.picks[i].tag] = (by[store.picks[i].tag] || 0) + 1;
    countEl.textContent = store.picks.length + ' picked  (' +
      by.missing + 'm ' + by.name + 'n ' + by.data + 'd ' + by.unsure + '?)';
    pickBtn.textContent = pickMode ? 'Pick ON' : 'Pick';
    mapBtn.textContent = mapOn ? 'Map ON' : 'Map';
  }
  var wasAllowed = null;
  function syncVisibility() {
    var ok = allowedHere();
    if (ok === wasAllowed) return;
    wasAllowed = ok;
    badge.style.display = ok ? '' : 'none';
    if (!ok) { if (pickMode) setPickMode(false); if (mapOn) setMap(false); closePanel(); }
    else auditZones();
  }
  syncVisibility();
  auditZones();
  setInterval(syncVisibility, 1000);
  var repaint = null, lastRoute = routeOf();
  new MutationObserver(function () {
    syncVisibility();
    if (routeOf() !== lastRoute) { lastRoute = routeOf(); auditZones(); }
    if (!mapOn) return;
    clearTimeout(repaint);
    repaint = setTimeout(paintMap, 400);
  }).observe(document.body, { childList: true, subtree: true });
  paintBadge();
  console.info('[gap] ' + VERSION + ' ready · ' + store.picks.length + ' picks stored · ' +
    'engine ' + (window.__kaActive ? window.__kaVersion : 'NOT ACTIVE') + ' · ' +
    (dbg() ? 'diagnosis available' : 'NO __kaDebug — engine older than v32, picks will carry no reason') +
    ' · here: ' + (allowedHere() ? 'ACTIVE' : 'not a gated sub-account, badge hidden') +
    ' · Alt-click anything, or press Pick.');
})();
