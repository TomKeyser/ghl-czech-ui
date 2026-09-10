/* =============================================================================
   HighLevel UI -> Czech (cs-CZ) translation layer
   Built for: Keytone Services (app.keytoneservices.com)

   WHY THIS EXISTS: HighLevel's platform language list does not include Czech.
   This script translates the application chrome (navigation, buttons, tabs,
   column headers, common modals) client-side using a curated glossary.

   SAFETY MODEL
   - Whole-string exact matches only. Never substring replacement, so a contact
     named "New" or a company called "Centene" is never altered.
   - Hard skip list for anything that holds customer data: inputs, textareas,
     rich-text editors, message bodies, contenteditable regions.
   - NO CRM DATA LEAVES THE BROWSER. No API key, no cost, no telemetry.
     CORRECTED IN v28: this used to read "no network calls", which is no
     longer true -- the layer now fetches three static files (the rules engine
     and the language pack) from its own origin at boot. Nothing is ever sent
     OUT: the requests are plain GETs for public JavaScript, carry no query
     data about the account, and no contact, message or record ever leaves the
     page. The privacy claim stands; the "zero requests" claim does not, and
     saying so plainly matters more than keeping a tidy bullet.
   - IF THE LANGUAGE FILES DO NOT LOAD, THE LAYER DOES NOTHING. It never
     half-translates: a partly-Czech screen looks like corruption and is far
     worse than an English one. See bootData()/activate() below, and check
     window.__kaStatus to diagnose.

   GATED to the sub-accounts listed in ONLY_LOCATIONS below — as of v29 the two
   test accounts, NOT the whole agency. Off those paths the layer still loads
   and reports "active", but walk() declines to touch the DOM, so the screen
   stays English with no error. If translation is missing, check the gate
   before suspecting anything else:
     location.pathname   vs   ONLY_LOCATIONS
   Setting ONLY_LOCATIONS to [] turns it on for EVERY sub-account under the
   agency, live client accounts included. That is the production setting and a
   deliberate decision, not a cleanup.

   KNOWN LIMITATION - IFRAMED SCREENS  (investigated, closed, do not re-dig)
   Some Settings screens - Settings > Business Profile (/settings/company) is
   the confirmed example - render inside a CROSS-ORIGIN iframe (id
   "settings-app"). This script runs in the parent page, and the browser
   forbids a page from reading or modifying a cross-origin frame's DOM. Those
   screens therefore CANNOT be translated by this script. Adding terms for
   them produces a bigger file and zero visible change. This is a browser
   security boundary, not a bug and not a missing feature.

   Being a Settings page does NOT predict this either way: Settings > Custom
   fields (/settings/fields) renders in the main document and translates
   fully. Before investigating any "missing translation", check first:

       document.querySelectorAll('iframe')

   If the content sits in a cross-origin iframe, stop - nothing here can fix
   it. The only workaround is a userscript manager (e.g. Tampermonkey) with
   @match on the iframe's own origin and all-frames enabled, which trades
   account-wide coverage for a per-browser install. Deliberately not done.

   If that route is ever taken: allowedHere() below gates on
   location.pathname containing /location/<id>. Inside the iframe the path
   differs, so the gate would silently disable the script there - relax it
   first, or you will debug a script that is working exactly as written.

   KILL SWITCH  (use this first if anything looks wrong)
     Add  ?nocs=1  to the URL  -> disables the layer permanently for that browser
     Add  ?nocs=0  to the URL  -> re-enables it
   Example: https://app.keytoneservices.com/v2/location/XXXX/launchpad?nocs=1
============================================================================= */

(function () {
  'use strict';

  /* ===== BUMP THIS WHENEVER YOU CHANGE THE FILE =====================
     It is the fastest way to tell whether GitHub Pages has finished
     deploying your edit. After committing, refresh HighLevel and check
     the browser console, or just type   __kaVersion   there.
     If it still shows the old value, the Pages build has not landed yet. */
  var VERSION = 'v40';

  if (window.__kaActive) return;
  window.__kaActive = true;
  window.__kaVersion = VERSION;

  /* ---------- which sub-accounts get Czech --------------------------------
     HighLevel's Custom JS box lives at the AGENCY level, so without this gate
     the layer would switch on for every sub-account under the agency.
     Listed here = Keytone Services only.
     To roll it out agency-wide later, set this to an empty array: []          */
  var ONLY_LOCATIONS = [
    'SbA5m1DElMNEKBVnixsX',   /* dummy / clean test sub-account */
    'zWR1h9iaCeH2Ki6kGZLD'    /* second test sub-account (the harvester's) */
  ];

  function allowedHere() {
    if (!ONLY_LOCATIONS.length) return true;
    var path = window.location.pathname;
    for (var i = 0; i < ONLY_LOCATIONS.length; i++) {
      if (path.indexOf('/location/' + ONLY_LOCATIONS[i]) !== -1) return true;
    }
    return false;
  }

  /* ---------- WHICH LANGUAGE IS THE SCREEN ALREADY IN? ---------------------
     Every key in the pack is ENGLISH, so the layer only works when HighLevel
     is rendering English. If a sub-account admin sets the platform language to
     Spanish, the UI arrives in Spanish, every lookup misses, and we do nothing
     -- silently, which is the support call Tom predicted on day one: "the
     system's not working, only because the sub-account admin changed or
     selected the wrong platform language."

     HighLevel resolves the CURRENT USER's platform language into
     localStorage.locale (hyphenated: 'en-US'), and mirrors the primary subtag
     onto <html lang>. Neither costs a token or an API call, and both are
     maintained by the same machinery that re-renders the shell -- so we sit on
     HighLevel's own axis rather than inventing one.                        */
  var PACK_SOURCE = 'en';               /* the language our KEYS are written in */

  /* MEASURED 2026-09-10, and it settled which signal to trust: impersonating a
     user whose platform language is Spanish gave localStorage.locale = 'es'
     while <html lang> STAYED 'en'. So the lang attribute is decorative -- it
     is not a fallback, and watching it for changes would never fire. The
     locale key is re-resolved per session, including on impersonation, which
     is exactly the axis we want. Every pass re-reads it, so a change is picked
     up by the same pass that notices the re-render it causes. */
  function platformLang() {
    var v = '';
    try { v = localStorage.getItem('locale') || ''; } catch (e) {}
    return String(v).toLowerCase().split(/[-_]/)[0];   /* 'en-US' -> 'en' */
  }

  function sourceMatches() {
    var l = platformLang();
    return !l || l === PACK_SOURCE;     /* unknown: assume English, as before */
  }

  /* ---------- WHO IS READING IT? ------------------------------------------
     DECISION 2026-09-10: sub-account staff get the translated interface;
     agency users keep whatever the platform gives them. An agency owner who
     opens a Czech client's sub-account to fix something must be able to read
     the screen -- that is their normal working day, not an edge case.

     AppUtils.Utilities.getCurrentUser() carries no language field, but it does
     carry type: 'agency' | 'account', which is exactly the distinction needed.

     A CZECH-SPEAKING AGENCY IS THE EXCEPTION, so the loader can set
     window.__kaAgencyToo = true, and ?csagency=1 does the same for one page
     load while testing.

     UNKNOWN MEANS WAIT, NOT GUESS: audience starts null and nothing is
     translated until it resolves, so nobody sees a flash of Czech that is then
     reverted. If AppUtils never answers we fall back to translating, because
     doing nothing is the more visible failure -- and STATUS records that it
     was a fallback rather than an answer.                                   */
  var audience = null;                  /* null unknown · true yes · false no */
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
      /* the answer may arrive after the first passes have already run */
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

  /* everything that has to be true before a single node is touched */
  function shouldTranslate() {
    return allowedHere() && sourceMatches() && audience === true;
  }

  /* Called from start() as well as from every pass, so __kaStatus answers
     honestly the moment the page loads rather than only after the first
     mutation. A diagnostic that is empty when you go looking is worse than
     no diagnostic -- it reads as "the layer never ran". */
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

  /* ---------- kill switch ---------------------------------------------- */
  try {
    var qs = window.location.search;
    if (qs.indexOf('nocs=1') !== -1) localStorage.setItem('ka_off', '1');
    if (qs.indexOf('nocs=0') !== -1) localStorage.removeItem('ka_off');
    if (localStorage.getItem('ka_off') === '1') {
      console.info('[cs-CZ] translation layer disabled via kill switch');
      return;
    }
  } catch (e) { /* private mode: carry on */ }


  /* ---------- CSS pseudo-element labels ----------------------------------
     Some sidebar labels are not DOM text at all -- they are drawn by CSS
     `content` on a ::before pseudo-element. A text-node translator can never
     reach those, so they need a CSS override instead.

     SPECIFICITY WARNING: HighLevel's own rule beats `#sb_launchpad .nav-title`
     (id + class). The selector must include element types to outrank it, e.g.
     `a#sb_launchpad span.nav-title`. Dropping the `a` / `span` silently fails.

     To find others, paste this in DevTools on any HighLevel screen:

       [...document.querySelectorAll('*')].flatMap(e =>
         ['::before','::after'].map(ps => {
           const c = getComputedStyle(e, ps).content;
           return (c && c !== 'none' && c !== 'normal' &&
                   !/^["']\\\\/.test(c) && /[A-Za-z]{2,}/.test(c))
             ? {text: c, ps, id: e.id || e.parentElement?.id, cls: e.className} : null;
         })).filter(Boolean)
  */
  /* FILLED FROM THE LANGUAGE PACK at activate(). It used to hold a Czech
     literal, which would have CSS-injected 'Rychlý start' into a Spanish UI --
     language content that escaped the v28 migration because it is CSS rather
     than dictionary. Empty until a pack supplies pack.pseudo. */
  var PSEUDO = [];

  var PSEUDO_STYLE_ID = 'ghl-cs-pseudo';

  function injectPseudoCss() {
    if (!PSEUDO.length) return;
    if (document.getElementById(PSEUDO_STYLE_ID)) return;
    if (!document.head) return;
    var css = '';
    for (var i = 0; i < PSEUDO.length; i++) {
      var esc = String(PSEUDO[i].text).replace(/\\/g, '\\\\').replace(/"/g, '\\"');
      css += PSEUDO[i].selector + '{content:"' + esc + '" !important;}\n';
    }
    var el = document.createElement('style');
    el.id = PSEUDO_STYLE_ID;
    el.textContent = css;
    document.head.appendChild(el);
  }

  /* ---------- do-not-touch zones ---------------------------------------- */
  /* Anything holding customer data or user input is never rewritten. */
  /* Two lists, because text and attributes carry different risk.

     A field's *value* is customer data and must never be touched. Its
     *placeholder* ("Type a message") is UI chrome and should be translated.
     Lumping input/textarea/select into one blocklist blocks both, which is why
     placeholders stayed English. So: text nodes use the strict list, attributes
     use the looser one that permits form controls. We only ever write the
     placeholder / title / aria-label attributes -- never `.value`. */

  /* AUDITED 2026-09-10 AND LARGELY REBUILT. What was here before was REASONED,
     never OBSERVED: .message-body, .contact-name, .note-body and the rest were
     plausible names that HighLevel does not use. Every one of them matched ZERO
     elements on twelve routes -- including a conversation holding real messages
     and an open contact -- so the customer-data half of this firewall was
     protecting nothing at all. Nothing bad had happened only because the
     dictionary happens not to contain anyone's name; a company called "Open
     House" or a contact tagged "New" would have been rewritten.

     WHAT REPLACED THEM, each read off the live DOM:
       .chat-message / .chat-content   message bodies, inbound and outbound.
                                       Both wrap the same text; keeping both
                                       because they are siblings in one
                                       component and a rename may spare one.
       [data-testid="CENTRALPANEL_NAME"]  the contact identity in the
                                       conversation header.

     PREFER data-testid WHERE IT EXISTS. HighLevel's visible classes are
     Tailwind utilities -- text-[14px], flex, gap-1 -- and change whenever
     someone restyles a component. Test ids change rarely, because their own
     tests break when they do.

     STILL UNMAPPED, and honestly recorded rather than guessed at: EMAIL bodies
     (a different component from .chat-message; no email thread was available
     to inspect), NOTE bodies, CUSTOM FIELD values, and contact names in LISTS
     and the right-hand panel. __kaDebug.dead() reports which of these match
     nothing on a given screen; a selector at zero everywhere is decoration.  */
  var CONTENT_ZONES = [
    'code', 'pre', 'script', 'style', 'svg',
    '[contenteditable="true"]', '[contenteditable=""]',
    '.ql-editor', '.ProseMirror', '.CodeMirror', '.monaco-editor',
    /* verified against HighLevel's own DOM, 2026-09-10 */
    '.chat-message', '.chat-content', '[data-testid="CENTRALPANEL_NAME"]',
    /* a whole conversation-list row: the contact name, the message preview and
       the timestamp all sit inside it. Blocking the row costs us translating
       the relative time ("2 days ago") in that list, which is a cosmetic loss
       against protecting the densest customer data on the busiest screen. The
       preview line is named separately in case a row ever lacks the id. */
    '[data-conversation-id]', '[data-testid="ASSERT_LC_LEFTPANEL"]',
    /* our own tooling, so the engine never rewrites its own overlays */
    '#claude-agent-glow-border', '#claude-agent-stop-container', '#claude-phantom-cursor'
  ];

  /* attributes: everything above, but form controls are allowed */
  var BLOCKED_ATTR = CONTENT_ZONES.join(',');
  /* text nodes: the above plus form controls, whose text is data.
     `option` is NOT in this list -- native dropdown options are translated,
     but only outside the data pickers listed in DATA_PICKERS below. */
  var BLOCKED_TEXT = CONTENT_ZONES.concat(['input', 'textarea', 'select']).join(',');

  /* Dropdowns whose options are RECORDS, not fixed enums: assignees, users,
     contacts, calendars, pipelines, tags. A person or record in one of these
     could legitimately be named "Open" or "Other" and would otherwise be
     rewritten. Fixed enums (status, type, timezone, direction) are fine. */
  var DATA_PICKERS = [
    '[name*="assignee" i]', '[name*="user" i]', '[name*="contact" i]',
    '[name*="calendar" i]', '[name*="pipeline" i]', '[name*="owner" i]',
    '[name*="tag" i]', '[name*="member" i]', '[name*="team" i]',
    '[id*="assignee" i]', '[id*="user" i]', '[id*="contact" i]',
    '[id*="calendar" i]', '[id*="pipeline" i]', '[id*="owner" i]',
    '[id*="tag" i]', '[id*="member" i]', '[id*="team" i]',
    '[class*="assignee" i]', '[class*="user-select" i]', '[class*="contact-select" i]'
  ].join(',');

  /* THE PICKER ITSELF DECIDES -- never an ancestor. The old version fell
     through to el.closest(DATA_PICKERS), which meant any container with
     "contact" in its id suppressed everything beneath it. On a CONTACT DETAIL
     page that is most of the screen: div#contacts-more-action-options alone
     swallowed "Manage duplicates" and "Contact settings". An id containing
     "contact" says nothing about whether the text is a record.

     So: a native <option> is judged by ITS OWN <select>, and a custom listbox
     by the element actually carrying the role. Nothing else is a picker. */
  function inDataPicker(el) {
    if (!el || !el.closest) return false;
    var sel = el.closest('select');
    if (sel) return !!(sel.matches && sel.matches(DATA_PICKERS));
    var box = el.closest('[role="listbox"],[role="combobox"]');
    return !!(box && box.matches && box.matches(DATA_PICKERS));
  }

  var ATTRS = ['placeholder', 'title', 'aria-label', 'alt'];

  /* ---------- prefilled input values -------------------------------------
     OFF by default everywhere else in this script's history: a field's value
     is normally customer data. Tom asked for prefills (e.g. the smart-list
     name defaulting to "New smart list") to be translated too, accepting the
     risk. Flip this to false to switch the behaviour off in one move.

     Three guards remain, and they matter:
       1. Only plain text/search inputs -- never email, tel, number, password,
          date, hidden or checkbox values.
       2. Never the focused element, so a value is never rewritten mid-typing.
       3. Whole-string glossary match only, and each element is rewritten once.

     Residual risk Tom accepted: a real record whose value happens to equal a
     glossary term exactly (a list literally named "New") would be rewritten. */
  var TRANSLATE_PREFILLS = true;

  /* Longest string the layer will touch, measured on the ENGLISH SOURCE, not
     on the Czech output — the guard runs before translate().
     400, not 160: 23 translated strings have an English source longer than 160
     and were silently skipped in every language (longest 334 chars,
     reputation…reviewsAIAgents.createStarterModalContent). A length cap is a
     SILENT coverage hole — nothing errors, the text simply stays English — so
     check this first whenever a translation that IS in the dictionary fails to
     appear on screen. 400 clears the longest known string with ~20% headroom
     while still excluding genuine prose and customer data. Re-measure if the
     dictionary ever gains longer entries. */
  var MAX_LEN = 400;

  /* Labels that carry a live count are one text node whose content changes:
       "Pending SMS: 0"   "Companies (0)"   "Contacts (1/10)"   "3 items"
     A fixed glossary can never match those. These three patterns peel the
     number off, translate the label, and put the number back. The numeric part
     is matched strictly as digits (with an optional /n), so nothing that could
     be customer data is ever captured. */
  /* "Hi Tom! I'm your calendar setup assistant..." - the name is interpolated,
     so this can only be matched as a pattern, never as a literal. */


  /* HighLevel is inconsistent about capitalisation across screens: the same
     label appears as "Contact details" on one and "Contact Details" on
     another, "Audit Logs" here and "audit logs" there. Exact-match alone means
     chasing these one at a time forever, so we also keep a lowercased index
     and fall back to it. Exact matches still win, so a deliberately
     case-specific entry (e.g. an all-caps badge) can override the general one. */

  /* Czech numerals take three forms, unlike English's two:
       1 položka | 2-4 položky | 0, 5+ položek
     Getting this wrong ("3 položek") reads as broken Czech to a native
     speaker, so counted nouns go through here. */


  /* ===================================================================
     LANGUAGE DATA — loaded at runtime, not baked into this file

     WHAT MOVED OUT: the 5,029-entry glossary, the 52 pattern regexes, the
     four month tables and czPlural all used to live here, which made this
     file 381 KB and made "add a language" a code change. They now live in:
       i18n-rules.js      engine: composition + formatters, no language
       lang/source-en.js  the regexes -- they match what HighLevel RENDERS,
                          so they belong to the SOURCE language
       lang/<locale>.js   every emitted word, per target language

     CACHING, and why the two URLs differ:
       engine files carry ?t=<now> because they change while we develop and
         a stale copy is indistinguishable from a broken one;
       the DATA file carries ?v=<DATA_VERSION>, a stable URL, so the browser
         and GitHub Pages can actually cache 340 KB instead of refetching it
         on every full page load. Bump DATA_VERSION when the pack changes.

     FAILURE MODE — THE IMPORTANT PART: if anything fails to load, is
     missing, or is malformed, the layer DOES NOTHING. start() is never
     called, the MutationObserver is never attached, and not one DOM node is
     touched. A half-translated interface is worse than an English one: it
     looks like corruption, it is hard to diagnose, and it destroys trust in
     the layer. English is a correct, complete, boring fallback.
     Diagnose with  window.__kaStatus  in the console.
     =================================================================== */

  var DATA_VERSION  = 'v30';          /* bump when lang/<locale>.js changes */
  var DEFAULT_LOCALE = 'cs-CZ';
  /* Whitelist of packs that exist at BASE + 'lang/<locale>.js'. A locale not
     listed here is refused by pickLocale() -- see the security note there.
     Adding a language is: ship lang/<locale>.js, add it here, bump VERSION. */
  var AVAILABLE = { 'cs-CZ': 1, 'es': 1 };
  var LOAD_TIMEOUT_MS = 15000;

  /* Prefer our own <script src> as the base so a fork, a CDN move or a
     per-agency bundle needs no edit here. Falls back to the canonical host. */
  var BASE = (function () {
    try {
      var s = document.currentScript && document.currentScript.src;
      if (s) return s.replace(/[^/]*(?:\?.*)?$/, '');
    } catch (e) {}
    return 'https://tomkeyser.github.io/ghl-czech-ui/';
  })();

  var STATUS = window.__kaStatus = {
    version: VERSION, dataVersion: DATA_VERSION, base: BASE,
    locale: null, localeSource: null, state: 'loading', terms: 0, error: null,
    /* Which sub-accounts this build will touch, and whether it is touching the
       CURRENT one. translatingHere is refreshed on every pass rather than
       captured once, because HighLevel is an SPA: you can navigate between
       sub-accounts without a reload, and a value frozen at boot would go
       quietly wrong -- the exact kind of stale artifact this file keeps
       getting bitten by. */
    onlyLocations: ONLY_LOCATIONS.slice(),
    translatingHere: null
  };

  /* ?cslang=cs-CZ switches language for now. The value is interpolated into
     a script URL, so it is checked TWICE: a tight character class, then a
     whitelist. Never relax this into "whatever the user typed" -- that is a
     path-traversal / script-injection hole straight into the agency's page. */
  /* ---------- which language ----------------------------------------------
     FOUR SOURCES, highest priority first. Set the normal one in the LOADER;
     the URL is for testing.

       1. ?cslang=<locale>  explicit override. PERSISTED, because HighLevel is
                            an SPA and rewrites the url on navigation — without
                            storing it the choice would evaporate on the first
                            click, which is exactly what happened before v31.
       2. ?cslang=0         clears a persisted override, back to the loader's
                            choice. Mirrors ?nocs=0 deliberately: one pattern to
                            remember, not two.
       3. window.__kaLang  set by the loader in the agency's Custom JS box.
                            THIS IS THE NORMAL WAY TO CHOOSE A LANGUAGE —
                            one line, no urls, no per-browser state.
       4. DEFAULT_LOCALE

     EVERY source is validated against AVAILABLE, not just the url one. The
     value ends up inside a script url, and localStorage is user-writable, so
     "it came from our own loader" is not a reason to skip the check.         */
  var LANG_KEY = 'ka_lang';

  function validLocale(v) {
    return typeof v === 'string' &&
      /^[A-Za-z]{2}(?:-[A-Za-z]{2})?$/.test(v) &&
      Object.prototype.hasOwnProperty.call(AVAILABLE, v);
  }

  function pickLocale() {
    var known = Object.keys(AVAILABLE).join(', ');
    var qs = window.location.search;

    /* 2 — clear, before we read anything stored */
    if (/[?&]cslang=0(?:&|$)/.test(qs)) {
      try { localStorage.removeItem(LANG_KEY); } catch (e) {}
      console.info('[lang] cleared the stored language override; using the loader default');
    } else {
      /* 1 — explicit override, remembered so it survives SPA navigation */
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

    /* 3 — a previous ?cslang=, still in force */
    var stored = null;
    try { stored = localStorage.getItem(LANG_KEY); } catch (e) {}
    if (stored) {
      if (validLocale(stored)) {
        STATUS.localeSource = 'stored override (clear with ?cslang=0)';
        return stored;
      }
      /* pack was removed, or someone edited localStorage by hand */
      try { localStorage.removeItem(LANG_KEY); } catch (e) {}
      console.warn('[lang] stored language "' + stored + '" is not available any more — cleared it');
    }

    /* 4 — the loader's choice: the normal path */
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

  /* plain(): exact hit, then case-insensitive. Used by pattern rules for the
     embedded label in "Pending SMS: 0" and friends. */
  function plain(str) {
    if (!DICT) return null;
    var k = String(str).trim();
    if (!k) return null;
    if (own(DICT, k)) return DICT[k];
    var l = k.toLowerCase();
    return own(LOOKUP, l) ? LOOKUP[l] : null;
  }

  function translate(raw) {
    if (!DICT) return null;                      /* not ready: touch nothing */
    var key = String(raw).trim();
    if (!key) return null;
    if (own(DICT, key)) return DICT[key];

    var viaRule = RULES.applyRules(SOURCE, PACK, key, { plain: plain, translate: translate });
    if (viaRule !== null) return viaRule;

    var lower = key.toLowerCase();
    if (own(LOOKUP, lower)) {
      var out = LOOKUP[lower];
      /* Status chips and section headers render in ALL CAPS ("LOST",
         "MY BUSINESS"). A case-insensitive hit would otherwise hand back
         mixed-case Czech and break the visual rhythm, so match the source. */
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

  /* Everything arrived: validate hard before touching the DOM. */
  function activate(locale) {
    var R = window.I18nRules;
    var S = window.GhlSourceRules && window.GhlSourceRules.en;
    var P = window.GhlLangPacks && window.GhlLangPacks[locale];

    if (!R || typeof R.applyRules !== 'function') return disable('i18n-rules.js loaded but I18nRules.applyRules is missing');
    if (!S || !S.rules || !S.rules.length)        return disable('source-en.js loaded but its rule table is empty');
    if (!P)                                       return disable('pack for ' + locale + ' loaded but did not register itself');
    if (!P.dict || !P.patterns || !P.plurals)     return disable('pack ' + locale + ' is malformed (needs dict, patterns, plurals)');

    RULES = R; SOURCE = S; PACK = P;
    PSEUDO = Array.isArray(P.pseudo) ? P.pseudo : [];

    /* dictApi first, then dict, so HAND-CURATED WINS on conflict. */
    DICT = {};
    var api = P.dictApi || {}, k;
    for (k in api) if (own(api, k)) DICT[k] = api[k];
    for (k in P.dict) if (own(P.dict, k)) DICT[k] = P.dict[k];

    /* LOOKUP is the case-insensitive fallback and it is FIRST-WINS, so the
       insertion order below is DATA, not tidiness. Several English strings
       share a lowercase form with deliberately different translations
       ("Close"/"close", "Success"/"SUCCESS" -> Úspěch/Hotovo). Curated must
       be inserted first, and neither half may be re-sorted -- doing so once
       silently rendered "CLOSE (ESC)" as "zavřít (ESC)". */
    LOOKUP = {};
    var halves = [P.dict, api], h, kk, lower;
    for (h = 0; h < halves.length; h++) {
      for (kk in halves[h]) {
        if (!own(halves[h], kk)) continue;
        lower = kk.toLowerCase();
        if (!own(LOOKUP, lower)) LOOKUP[lower] = halves[h][kk];
      }
    }

    resolveAudience();
    STATUS.state = 'ready';
    STATUS.terms = Object.keys(DICT).length;
    STATUS.curated = Object.keys(P.dict).length;
    STATUS.fromApi = Object.keys(api).length;
    return true;
  }

  /* Kept separate from activate() on purpose. Wrapping both in one try/catch
     made a crash inside start() report itself as "failed while building the
     dictionary" -- a misleading message that would have sent a future session
     hunting through the language pack for a DOM bug. Attribute failures to the
     stage that actually failed. */
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

    var bust = '?t=' + Date.now();                    /* engine: always fresh */
    var pin  = '?v=' + encodeURIComponent(DATA_VERSION); /* data: cacheable   */
    loadScript(BASE + 'i18n-rules.js' + bust, done);
    loadScript(BASE + 'lang/source-en.js' + bust, done);
    loadScript(BASE + 'lang/' + locale + '.js' + pin, done);
  }

  function blockedText(el) {
    if (!el || !el.closest) return true;
    if (el.closest(BLOCKED_TEXT)) return true;
    /* an <option> is allowed unless it belongs to a record picker */
    if (el.tagName === 'OPTION' || el.closest('option')) return inDataPicker(el);
    return false;
  }

  function blockedAttr(el) {
    return !el || (el.closest && el.closest(BLOCKED_ATTR));
  }

  /* ---------- __kaDebug: read-only diagnosis surface ----------------------
     The gap picker and the errors channel both need to answer ONE question
     about a string on screen: why is this not in Czech? Everything needed to
     answer it lives in this closure, so expose it deliberately rather than
     letting a tool re-implement the selector lists and drift out of step.

     Nothing here writes to the page. It is safe to leave in production, and
     the errors channel gets its diagnosis from the same function a human
     would use with the picker. */

  function describe(el) {
    if (!el || !el.tagName) return '';
    if (el.id) return '#' + el.id;
    var cls = (el.className && el.className.baseVal !== undefined)
      ? el.className.baseVal : el.className;
    cls = String(cls || '').split(/\s+/).filter(function (c) {
      /* framework noise: scoped ids, utility classes, state flags */
      return c && !/^(data-v-|v-|ng-|is-|has-|svelte-)/.test(c) && c.length > 2;
    })[0];
    return el.tagName.toLowerCase() + (cls ? '.' + cls : '');
  }

  /* Everything we have already written into the page. Text nodes carry
     __kaDone so they need no lookup, but attributes are stamped with nothing,
     and a node re-rendered by the framework can lose its marker while keeping
     our Czech. Built once, on first use. */
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

  /* which CONTENT_ZONES entry actually caught this element */
  function zoneOf(el, forAttr) {
    var list = forAttr ? CONTENT_ZONES : CONTENT_ZONES.concat(['input', 'textarea', 'select']);
    for (var i = 0; i < list.length; i++) {
      try { if (el.closest(list[i])) return list[i]; } catch (e) {}
    }
    return null;
  }

  /* why(node[, attr]) -> { reason, ... }
     reasons: not-ready | empty | too-long | iframe | content-zone |
              data-picker | missing | translated                        */
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

    /* ALREADY OURS -- ask this before translating, or the answer is nonsense.
       Once a node is translated its textContent IS the Czech, so looking that
       up misses the dictionary and reports 'missing' for the very strings that
       are working. The gap picker's map painted an entire screen amber for
       exactly this reason. */
    if (isText && node.__kaDone === node.textContent) {
      return { reason: 'translated', text: key, attr: null };
    }
    if (isOurOutput(key)) {
      return { reason: 'translated', text: key, attr: attr || null };
    }
    if (key.length > MAX_LEN) {
      return { reason: 'too-long', length: key.length, max: MAX_LEN, text: key.slice(0, 60) };
    }

    /* MIRROR blockedText EXACTLY. An earlier version ran inDataPicker on every
       element, which the engine never does -- it consults it only for <option>.
       The gap picker's first export therefore blamed seven perfectly ordinary
       menu items on a suppression that had not happened. A diagnostic that does
       not match the code it describes is worse than none. */
    if (attr) {
      if (blockedAttr(el)) {
        return { reason: 'content-zone', zone: zoneOf(el, true),
                 on: describe(el.closest(BLOCKED_ATTR) || el), text: key };
      }
    } else {
      if (el.closest(BLOCKED_TEXT)) {
        return { reason: 'content-zone', zone: zoneOf(el, false),
                 on: describe(el.closest(BLOCKED_TEXT) || el), text: key };
      }
      if ((el.tagName === 'OPTION' || el.closest('option')) && inDataPicker(el)) {
        return { reason: 'data-picker', on: describe(el.closest('select') || el), text: key };
      }
    }

    var out = translate(key);
    return out === null
      ? { reason: 'missing', text: key, attr: attr || null }
      : { reason: 'translated', text: key, to: out, attr: attr || null };
  }

  /* Zero-match audit. A do-not-touch selector that matches nothing on any
     screen is not protecting anything -- it only reads like protection.
     Run it screen by screen; absence on one page is not absence everywhere. */
  function dead() {
    return CONTENT_ZONES.map(function (sel) {
      var n = 0;
      try { n = document.querySelectorAll(sel).length; } catch (e) { n = -1; }
      return { selector: sel, matches: n };
    });
  }

  window.__kaDebug = {
    version: VERSION,
    translate: translate,
    why: why,
    describe: describe,
    dead: dead,
    zones: CONTENT_ZONES,
    attrs: ATTRS,
    maxLen: MAX_LEN
  };

  /* ---------- the miss hook ----------------------------------------------
     There is exactly ONE place a text node fails to translate and one for an
     attribute, and both are below. A passive collector wants precisely those
     two moments, so hand them over rather than making it re-walk the DOM
     behind us -- that would duplicate this entire pass on every mutation.

     SAFE BY CONSTRUCTION, and this is the reason it is here and not in a
     collector's own observer: by the time either site is reached the string
     has ALREADY passed CONTENT_ZONES and the length guard. Customer data
     cannot reach a listener unless the firewall has a hole -- and if it ever
     does, that is exactly what the collector should be flagging. */
  function missed(raw, node, attr) {
    var h = window.__kaOnMiss;
    if (typeof h !== 'function') return;
    try { h(String(raw), node, attr || null); } catch (e) { /* never break a render */ }
  }

  function doTextNode(node) {
    /* Skip if we already wrote this exact value (survives Vue re-renders) */
    if (node.__kaDone === node.textContent) return;
    var raw = node.textContent;
    /* Length guard — see MAX_LEN. Raised 80 -> 160 (empty-state sentences)
       -> 400 (long warnings and tooltips). Applies to the English source. */
    if (!raw || raw.length > MAX_LEN) return;
    var out = translate(raw);
    if (out === null) { missed(raw, node, null); return; }
    /* preserve surrounding whitespace so layout/spacing is unchanged */
    var lead = raw.match(/^\s*/)[0];
    var tail = raw.match(/\s*$/)[0];
    node.__kaSrc = raw;                 /* the English we are replacing */
    node.textContent = lead + out + tail;
    node.__kaDone = node.textContent;
  }

  function doAttrs(el) {
    for (var i = 0; i < ATTRS.length; i++) {
      var a = ATTRS[i];
      if (!el.hasAttribute || !el.hasAttribute(a)) continue;
      var v = el.getAttribute(a);
      if (!v || v.length > MAX_LEN) continue;
      var out = translate(v);
      if (out === null) { missed(v, el, a); continue; }
      if (out === v) continue;
      el.setAttribute(a, out);
      if (TOUCHED_ATTRS.length < MAX_TOUCHED) TOUCHED_ATTRS.push([el, a, v, out]);
    }
  }

  function doValues(el) {
    if (!TRANSLATE_PREFILLS) return;
    if (el.tagName === 'INPUT' && el.type && !/^(text|search)$/i.test(el.type)) return;
    if (el === document.activeElement) return;          /* never mid-typing */
    var v = el.value;
    if (!v || v.length > MAX_LEN) return;
    if (el.__kaVal === v) return;                       /* already handled */
    var out = translate(v);
    if (out === null || out === v) return;
    el.value = out;
    el.__kaVal = out;
    /* Without these the framework's model keeps the English string: the user
       would see Czech and save English, or the next render would revert it. */
    try {
      el.dispatchEvent(new Event('input',  { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    } catch (e) {}
  }

  /* ---------- putting it back --------------------------------------------
     HighLevel is an SPA: moving between sub-accounts does not reload the page,
     and the shell -- sidebar, top bar -- is not re-rendered. So the nodes we
     translated on a gated sub-account are the SAME NODES when you arrive
     somewhere ungated, still carrying our Czech. The engine correctly stops
     TRANSLATING, but until now it had no way to put anything BACK, so an
     agency owner clicking from a Czech client into any other client saw a
     half-Czech sidebar until they hard-refreshed.

     Found by Tom on 2026-09-10 by switching to his agency sub-account.

     Only ever restore text we still recognise as ours: if the app has since
     rewritten a node, __kaDone no longer matches and we leave it alone. The
     alternative -- blindly writing __kaSrc back -- would clobber whatever the
     application put there, which is far worse than a stale Czech label.

     Prefilled VALUES are deliberately not reverted: restoring one means
     dispatching input/change into the framework's model, and firing synthetic
     events at an app we are only decorating is not worth it for a niche
     feature. They are re-checked on the next pass anyway.                  */
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
      } catch (e) { /* node gone */ }
    }
    TOUCHED_ATTRS = [];

    /* the pseudo-element rules are ours too, and would keep applying */
    var css = document.getElementById(PSEUDO_STYLE_ID);
    if (css && css.parentNode) css.parentNode.removeChild(css);

    STATUS.reverted = restored;
    return restored;
  }

  function walk(root) {
    if (!root) return;
    /* re-checked per pass so switching sub-accounts in-app takes effect at once */
    if (!shouldTranslate()) return;

    if (root.nodeType === 3) {
      if (!blockedText(root.parentElement)) doTextNode(root);
      return;
    }
    if (root.nodeType !== 1) return;
    /* BLOCKED_ATTR is the looser list, so being blocked for attributes means
       being blocked for everything -- safe to bail on the whole subtree. */
    if (blockedAttr(root)) return;

    /* attributes on the root and everything under it (form controls included) */
    doAttrs(root);
    var withAttrs = root.querySelectorAll('[placeholder],[title],[aria-label]');
    for (var i = 0; i < withAttrs.length; i++) {
      if (!blockedAttr(withAttrs[i])) doAttrs(withAttrs[i]);
    }

    /* prefilled values (see TRANSLATE_PREFILLS above) */
    if (TRANSLATE_PREFILLS) {
      if (root.tagName === 'INPUT' || root.tagName === 'TEXTAREA') {
        if (!blockedAttr(root)) doValues(root);
      }
      var fields = root.querySelectorAll('input,textarea');
      for (var v = 0; v < fields.length; v++) {
        if (!blockedAttr(fields[v])) doValues(fields[v]);
      }
    }

    /* text nodes (form controls excluded -- their text is customer data) */
    var w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) {
        return blockedText(n.parentElement) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
      }
    });
    var n;
    while ((n = w.nextNode())) doTextNode(n);
  }

  /* ---------- batched observer ------------------------------------------ */
  var queue = [];
  var scheduled = false;

  function flush() {
    scheduled = false;
    /* re-evaluated every pass, so __kaStatus.translatingHere stays true
       to the screen you are actually looking at after an in-app sub-account
       switch. allowedHere() was already being called here; this just records
       the answer. */
    var wasHere = STATUS.translatingHere;
    refreshStatus();
    /* the gate just closed behind us -- put the shell back into English */
    if (wasHere === true && STATUS.translatingHere === false) {
      try { revertAll(); } catch (e) { /* never break the app */ }
    }
    if (STATUS.translatingHere) injectPseudoCss();   /* cheap; restores it if removed */
    var batch = queue;
    queue = [];
    for (var i = 0; i < batch.length; i++) {
      try { walk(batch[i]); } catch (e) { /* never break the app */ }
    }
  }

  /* Scheduling notes (both of these were real bugs):
     1. Schedulers must be invoked on `window`. An unbound reference throws,
        and requestIdleCallback's 2nd argument is an options object, not a
        delay -- either mistake kills the observer silently.
     2. requestIdleCallback and requestAnimationFrame do NOT run in a
        background tab, and setTimeout is throttled to about once a minute
        there. Using them means the UI sits in English until the tab is
        focused. queueMicrotask always runs, so we use that. The work is
        cheap because we only walk the subtrees that actually changed. */
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
    if (shouldTranslate()) injectPseudoCss();
    walk(document.body);

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
      } catch (e) { /* never let a mutation kill the layer */ }
    }).observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ATTRS
    });

    /* Diagnostic line: locale and provenance split, because "is it even
       loaded, and which language?" is the first question every support
       conversation starts with. Full detail in window.__kaStatus. */
    console.info('[' + STATUS.locale + '] language layer ' + VERSION +
      ' active — ' + STATUS.terms + ' terms (' + STATUS.curated + ' curated, ' +
      STATUS.fromApi + ' from HighLevel), data ' + DATA_VERSION +
      ' — language from ' + STATUS.localeSource +
      '. Override with ?cslang=<locale>, clear with ?cslang=0, disable with ?nocs=1');

    /* "Active" is true of the LAYER, not of this SCREEN. Off-gate, everything
       above still happens -- files load, dictionary builds, observer attaches
       -- and walk() then declines to touch the DOM, so the page stays English
       with no error anywhere. That combination cost a real debugging round
       trip: the console claimed success while the screen showed none. Say it
       out loud instead of leaving someone to infer it. */
    if (!allowedHere()) {
      console.info('[' + STATUS.locale + '] ...but NOT translating this screen: ' +
        'the sub-account is not in ONLY_LOCATIONS. path ' + window.location.pathname +
        ' | allowed ' + (ONLY_LOCATIONS.length ? ONLY_LOCATIONS.join(', ') : '(all)'));
    }
  }

  /* Nothing runs until the language files are in hand. bootData() calls
     activate(), which validates them and only then calls start(). If any of
     that fails the layer stays dormant and the UI remains English. */
  bootData();
})();
