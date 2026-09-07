/* =============================================================================
   Czech/Spanish REVIEW TOOL  —  DEV TOOL, NOT PART OF THE SHIPPED LAYER

   WHAT IT IS FOR
   A native speaker walks the product and clicks any word the layer translated
   that is wrong. Each flag records the screen, the translated text, the English
   it came from, and their correction — then downloads as one JSON file.

   WHY IT CLICKS ONLY ON OUR OWN TEXT
   The engine marks every text node it writes with  node.__csDone  (and every
   attribute with  el.__csVal ). This tool will ONLY flag nodes carrying those
   marks. That is not a convenience, it is the safety property: those nodes have
   already passed the engine's CONTENT_ZONES / BLOCKED_TEXT firewall, so a flag
   can never capture a contact name, a message body, or anything else belonging
   to the customer. If the engine did not write it, this tool cannot see it.

   HOW TO USE IT
   1. Paste BELOW the existing loader in
      Agency > Settings > Company > Whitelabel > Custom JS.  Append, do not
      replace. Remove it when the review is finished — it is a tool, not a
      feature.
   2. Log in as a user of the gated sub-account and open any screen.
   3. ALT-CLICK any translated word to flag it. Or press the badge to turn on
      Flag mode, which outlines everything we translated and makes plain clicks
      flag instead of navigate.
   4. Type the correction, press Enter. Esc cancels.
   5. Press Download on the badge. One JSON file with everything.

   SAFETY
   - Hard-gated to ONE sub-account. Outside it, nothing runs.
   - Reads only nodes the translation engine itself wrote. Never reads .value,
     never touches contenteditable, never makes a network call of any kind.
   - Writes nothing to the page except its own badge, outlines and input.
   - Kill switch: append ?noreview=1 to any URL.
============================================================================= */

(function () {
  'use strict';

  var VERSION = 'r1';
  var ONLY_LOCATION = 'zWR1h9iaCeH2Ki6kGZLD';   /* the seeded test sub-account */
  var KEY = 'ghl_review_v1';
  var MAX_BYTES = 4 * 1024 * 1024;              /* headroom under the ~5MB cap */

  if (window.top !== window) return;            /* top document only */
  if (window.__ghlReviewActive) return;
  if (location.pathname.indexOf('/location/' + ONLY_LOCATION) === -1) return;
  if (location.search.indexOf('noreview=1') !== -1) {
    console.info('[review] disabled via ?noreview=1');
    return;
  }
  window.__ghlReviewActive = true;
  window.__ghlReviewVersion = VERSION;

  /* ---------- storage ---------------------------------------------------- */
  var flags = [];
  try {
    var saved = localStorage.getItem(KEY);
    if (saved) flags = JSON.parse(saved) || [];
  } catch (e) { flags = []; }

  function save() {
    try {
      var json = JSON.stringify(flags);
      if (json.length > MAX_BYTES) { alert('Review storage full — please Download now.'); return; }
      localStorage.setItem(KEY, json);
    } catch (e) { /* quota or private mode: the in-memory copy still downloads */ }
    paintBadge();
  }

  /* ---------- reverse dictionary: translated text -> the English it came from
     The packs register themselves on window.GhlLangPacks. Several English keys
     can share one translation, so this returns every candidate rather than
     pretending to know which one fired. ---------------------------------- */
  var REVERSE = null;
  function reverse(czech) {
    if (!REVERSE) {
      REVERSE = Object.create(null);
      var packs = window.GhlLangPacks || {};
      for (var loc in packs) {
        var p = packs[loc] || {};
        [p.dictApi, p.dict].forEach(function (d) {
          if (!d) return;
          for (var en in d) {
            var out = String(d[en]).trim();
            if (!REVERSE[out]) REVERSE[out] = [];
            if (REVERSE[out].indexOf(en) === -1) REVERSE[out].push(en);
          }
        });
      }
    }
    return REVERSE[String(czech).trim()] || [];
  }

  /* ---------- find the translated thing under a click -------------------- */
  function translatedTextUnder(el) {
    /* the engine stores the exact value it wrote, so a node still carrying its
       mark is one we are responsible for */
    var w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) {
        return (n.__csDone && n.__csDone === n.textContent && n.textContent.trim())
          ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      }
    });
    var n = w.nextNode();
    return n ? n.textContent.trim() : null;
  }

  function findFlaggable(start) {
    for (var el = start; el && el !== document.body; el = el.parentElement) {
      var t = translatedTextUnder(el);
      if (t) return { el: el, text: t, kind: 'text' };
      if (el.__csVal) return { el: el, text: String(el.__csVal).trim(), kind: 'attribute' };
    }
    return null;
  }

  function selectorFor(el) {
    var parts = [], depth = 0;
    for (var n = el; n && n.nodeType === 1 && depth < 5; n = n.parentElement, depth++) {
      var s = n.tagName.toLowerCase();
      if (n.id) { parts.unshift(s + '#' + n.id); break; }
      parts.unshift(s);
    }
    return parts.join('>');
  }

  /* ---------- the correction input --------------------------------------- */
  var input = null;
  function closeInput() {
    if (input && input.parentNode) input.parentNode.removeChild(input);
    input = null;
  }

  function askCorrection(hit, x, y) {
    closeInput();
    var english = reverse(hit.text);

    input = document.createElement('div');
    input.setAttribute('style', [
      'position:fixed', 'z-index:2147483647',
      'left:' + Math.min(x, window.innerWidth - 340) + 'px',
      'top:' + Math.min(y + 12, window.innerHeight - 170) + 'px',
      'width:320px', 'background:#fff', 'color:#111', 'border:1px solid #8C2F39',
      'border-radius:4px', 'box-shadow:0 6px 24px rgba(0,0,0,.22)',
      'font:13px/1.45 system-ui,sans-serif', 'padding:12px'
    ].join(';'));

    var head = document.createElement('div');
    head.setAttribute('style', 'font-weight:600;margin-bottom:2px;word-break:break-word');
    head.textContent = hit.text;
    input.appendChild(head);

    var sub = document.createElement('div');
    sub.setAttribute('style', 'color:#666;margin-bottom:8px;font-size:12px');
    sub.textContent = english.length
      ? 'from English: ' + english.slice(0, 3).join('  /  ')
      : 'source string not found in the pack (may be composed at runtime)';
    input.appendChild(sub);

    var box = document.createElement('input');
    box.type = 'text';
    box.placeholder = 'what should it say?';
    box.setAttribute('style',
      'width:100%;box-sizing:border-box;padding:7px 8px;border:1px solid #ccc;' +
      'border-radius:3px;font:13px system-ui,sans-serif');
    input.appendChild(box);

    var hint = document.createElement('div');
    hint.setAttribute('style', 'color:#888;margin-top:7px;font-size:11px');
    hint.textContent = 'Enter to save · Esc to cancel · leave blank to just mark it wrong';
    input.appendChild(hint);

    document.body.appendChild(input);
    box.focus();

    box.addEventListener('keydown', function (e) {
      e.stopPropagation();
      if (e.key === 'Escape') { closeInput(); return; }
      if (e.key !== 'Enter') return;
      flags.push({
        route: location.pathname.replace('/v2/location/' + ONLY_LOCATION, '') || '/',
        shown: hit.text,
        english: english,
        should_be: box.value.trim(),
        kind: hit.kind,
        where: selectorFor(hit.el),
        at: new Date().toISOString()
      });
      save();
      closeInput();
      blink(hit.el);
    });
  }

  function blink(el) {
    var old = el.style.outline;
    el.style.outline = '2px solid #2F6B4A';
    setTimeout(function () { el.style.outline = old; }, 700);
  }

  /* ---------- flag mode: outline everything we translated ---------------- */
  var flagMode = false;
  var styleEl = null;
  function setFlagMode(on) {
    flagMode = on;
    if (on && !styleEl) {
      styleEl = document.createElement('style');
      styleEl.textContent =
        '.ghl-review-hit{outline:1px dashed rgba(140,47,57,.55)!important;' +
        'outline-offset:1px;cursor:crosshair!important}';
      document.head.appendChild(styleEl);
    }
    if (on) markAll(); else unmarkAll();
    paintBadge();
  }
  function markAll() {
    unmarkAll();
    var w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) {
        return (n.__csDone && n.__csDone === n.textContent) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      }
    });
    var n;
    while ((n = w.nextNode())) if (n.parentElement) n.parentElement.classList.add('ghl-review-hit');
  }
  function unmarkAll() {
    var els = document.querySelectorAll('.ghl-review-hit');
    for (var i = 0; i < els.length; i++) els[i].classList.remove('ghl-review-hit');
  }

  /* ---------- click handling ---------------------------------------------
     ALT-click always flags. A plain click only flags while Flag mode is on, so
     the reviewer can still use the application normally the rest of the time. */
  document.addEventListener('click', function (e) {
    if (!(e.altKey || flagMode)) return;
    var hit = findFlaggable(e.target);
    if (!hit) return;
    e.preventDefault();
    e.stopPropagation();
    askCorrection(hit, e.clientX, e.clientY);
  }, true);

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeInput();
  }, true);

  /* ---------- badge -------------------------------------------------------
     Mechanics lifted from harvester.js, which already learned these the hard
     way: BOTTOM-CENTRE by default because HighLevel puts real controls in the
     bottom-right corner and a badge there covers them; draggable, because every
     screen hides something different; and dimmed at rest so it never competes
     with the interface being reviewed. Position is remembered under its own key
     so the two tools cannot fight over one another's corner. */
  var POS_KEY = 'ghl_review_pos';

  function clamp(v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; }

  var badge = document.createElement('div');
  badge.id = 'ghl-review-badge';
  badge.setAttribute('aria-hidden', 'true');
  badge.style.cssText = [
    'position:fixed', 'z-index:2147483646',
    'background:#1E211F', 'color:#fff', 'border-radius:6px', 'padding:8px 10px',
    'font:12px/1.35 system-ui,sans-serif', 'box-shadow:0 2px 10px rgba(0,0,0,.35)',
    'display:flex', 'gap:8px', 'align-items:center',
    'opacity:.6', 'transition:opacity .15s', 'user-select:none'
  ].join(';');
  badge.addEventListener('mouseenter', function () { badge.style.opacity = '1'; });
  badge.addEventListener('mouseleave', function () { badge.style.opacity = '.6'; });

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
    b.type = 'button';                       /* never submit a HighLevel form */
    b.textContent = label;
    b.style.cssText = [
      'font:11px/1 system-ui,sans-serif', 'padding:5px 8px', 'cursor:pointer',
      'background:#333833', 'color:#fff', 'border:1px solid #555', 'border-radius:3px'
    ].join(';');
    b.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); fn(); });
    return b;
  }

  /* the count doubles as the drag handle, so the buttons stay clickable */
  var countEl = document.createElement('span');
  countEl.style.cssText = 'font-weight:600;white-space:nowrap;cursor:move';
  badge.appendChild(countEl);
  makeDraggable(countEl);

  var modeBtn = button('Flag mode', function () { setFlagMode(!flagMode); });
  badge.appendChild(modeBtn);

  badge.appendChild(button('Download', function () {
    var blob = new Blob([JSON.stringify(flags, null, 2)], { type: 'application/json' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'review-' + new Date().toISOString().slice(0, 10) + '.json';
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 2000);
  }));

  badge.appendChild(button('Clear', function () {
    if (!confirm('Delete all ' + flags.length + ' flags? Download first if you have not.')) return;
    flags = []; save();
  }));

  function paintBadge() {
    countEl.textContent = flags.length + ' flagged';
    modeBtn.textContent = flagMode ? 'Flag mode ON' : 'Flag mode';
    modeBtn.style.background = flagMode ? '#8C2F39' : '#333833';
  }
  paintBadge();

  /* re-outline after SPA navigation while flag mode is on */
  var reMark = null;
  new MutationObserver(function () {
    if (!flagMode) return;
    clearTimeout(reMark);
    reMark = setTimeout(markAll, 400);
  }).observe(document.body, { childList: true, subtree: true });

  console.info('[review] ' + VERSION + ' ready. Alt-click a translated word, or press Flag mode. ' +
               flags.length + ' flags stored. Engine: ' +
               (window.__ghlCzechActive ? window.__ghlCzechVersion : 'NOT ACTIVE — nothing will be flaggable'));
})();
