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
  var VERSION = 'v95';

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

  /* PLAIN CSS RULES FROM THE PACK (pack.css), for typography a language needs
     that HighLevel's styling fights. The case that forced it, 11 Sep: the
     invoice status cell is text-transform: capitalize, which title-cases every
     word. Right for English, wrong for Czech — "Částečně Uhrazeno", "Splatnost
     Za 1 Den". Language-specific, so it comes from the pack, never the engine.

     SAME STYLE ELEMENT AS THE PSEUDO RULES, deliberately: revertAll() already
     removes it when the gate closes and flush() puts it back, so an English
     viewer gets HighLevel's own capitalisation back without any extra code. */
  var PACK_CSS = [];

  /* RENAMED 11 Sep from 'ghl-cs-pseudo', which escaped the v32 namespace sweep:
     an element id Keytone creates, in HighLevel's prefix, and missing from
     NAMESPACE.md. Internal — nothing outside this file reads it. */
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
    /* OUR OWN INJECTED UI MARKS ITSELF. Tom's idea, 10 Sep. Anything Keytone
       puts on the page sets data-ka-ignore on its root and the engine leaves the
       whole subtree alone -- text AND attributes, since BLOCKED_ATTR is built
       from this list.

       AN ATTRIBUTE RATHER THAN A JS PROPERTY, DELIBERATELY: el.__kaIgnore could
       not appear in a selector, so the engine would need its own ancestor walk on
       every node. This costs nothing, because closest() is already doing the walk.

       It replaces the <code> wrapper the tools used to hide inside -- that worked
       only because code was already in this list, and it forced every overlay to
       live in a monospace element and undo its own styling. */
    '[data-ka-ignore]',
    /* noscript: HighLevel's "doesn't work without JavaScript" notice is text in
       the DOM on every page, never shown, and the collector reported it on
       every route. Added v78. */
    'code', 'pre', 'style', 'script', 'noscript', 'svg',
    '[contenteditable="true"]', '[contenteditable=""]',
    '.ql-editor', '.ProseMirror', '.CodeMirror', '.monaco-editor',
    /* CodeMirror 6 — a different class from CM5's .CodeMirror above. Found 11
       Sep on Settings > External tracking, where the editor shows the
       account's own tracking key ("tk_…") inside a script tag. Code is never
       translated, and that key is the account's. */
    '.cm-editor',
    /* verified against HighLevel's own DOM, 2026-09-10 */
    '.chat-message', '.chat-content', '[data-testid="CENTRALPANEL_NAME"]',
    /* a whole conversation-list row: the contact name, the message preview and
       the timestamp all sit inside it. Blocking the row costs us translating
       the relative time ("2 days ago") in that list, which is a cosmetic loss
       against protecting the densest customer data on the busiest screen. The
       preview line is named separately in case a row ever lacks the id. */
    '[data-conversation-id]', '[data-testid="ASSERT_LC_LEFTPANEL"]',
    /* the header account card: the signed-in user's own name and email address.
       Found by the collector flagging a real address as suspect on the dashboard,
       which is the detector doing precisely what it exists for. */
    '.user-info-card',
    /* THE CONTACTS TABLE, AND EVERY OTHER TABULATOR LIST. Measured on a real
       smart list, 10 Sep: 160 body cells, and the ONLY translatable content in
       any of them was the date columns -- the rest was contact names, company
       names, phone numbers, email addresses and tags. Tabulator labels each
       cell with tabulator-field, which names the column semantically and comes
       from HighLevel's column config rather than from styling.

       BLOCK EVERYTHING EXCEPT DATE-LIKE COLUMNS, rather than listing the data
       columns. Smart lists are user-configurable: an unknown or newly added
       column must be treated as customer data by default, and a rule that
       lists what to protect would silently miss every column added later.
       Header cells are untouched, so column titles still translate. */
    '.tabulator-cell:not([tabulator-field*="date" i]):not([tabulator-field*="time" i]):not([tabulator-field*="activity" i]):not([tabulator-field*="created" i]):not([tabulator-field*="updated" i])',
    /* the dashboard widget tables (.hr-data-table__body-cell) are NOT listed
       here any more — see hrCellBlocked(), v90. Their cells carry no column key,
       so a selector could only block every cell, dates included ("Mar 18, 2025
       11:05 PM" on the funnels list stayed English). The column is now read
       from the header cell, with the same let-through as the tables below. */
    /* THE INVOICE LIST — and any other table built on the same component. Found
       11 Sep, the first day the account had real invoices: the customer's
       INITIALS were protected (.hr-avatar__text) but their NAME reached the
       engine, along with the invoice title, number and amount. The same
       one-member-of-a-family mistake, again.

       SAME POLICY AS THE CONTACTS TABLE ABOVE, AND FOR THE SAME REASON: block
       every column EXCEPT the ones known to hold our text, instead of listing
       the ones that hold theirs. Each cell names its column in data-col-key
       (name, invoiceNumber, contactDetails.name, issueDate, amount, status,
       actions) — semantic, from HighLevel's column config, not styling. A
       column added later is protected by default.

       LET THROUGH, and nothing else:
         *date* / *At     dates and timestamps (issueDate, startDate,
                          updatedAt, createdAt, fulfilledAt) — formatted by us.
                          $="At" is CASE-SENSITIVE on purpose: it matches the
                          camelCase timestamp suffix and not a word like "format".
         *status*         our vocabulary ("Status" too, hence the i flag)
         action*          the row menu — "action" on some screens, "actions"
         productType, paymentProviderType
                          NAMED EXPLICITLY, not *type*: the transactions table
                          has an entitySourceType column that holds the SOURCE
                          INVOICE'S NAME ("New Invoice") — record data wearing
                          a type-shaped key. A blanket *type* would leak it.
         *edOn            timestamps spelt with "On" (lastIssuedOn). ADDED v69,
                          and it is the cost described below showing up the
                          same day: the recurring-invoice list's issue date was
                          silently blocked because its key ended in "On", not
                          "Date" or "At". "edOn" rather than "On", so a record
                          column like "addOn" is not let through with it.
         schedule*        the recurrence text HighLevel generates ("Every
                          month") — ours to translate. Also ADDED v69, also
                          found blocked and silent.

       TWO CLASS PREFIXES, ONE COMPONENT. hr-data-table-td is HighLevel's copy
       of Naive UI's n-data-table-td, and both carry data-col-key. v67 named only
       hr-, which covers the invoice list; the SAME DAY the products list leaked
       product names through n-. Measured on 11 Sep, n- sits under every
       payments list: products, transactions, orders, subscriptions, payment
       links, coupons, proposals. The fifth instance of naming one member of a
       family — see FIREWALL.md.

       ⚠ THE COST, STATED PLAINLY: a column holding OUR text under a key not
       listed above stays English, AND NOTHING REPORTS IT — blocked text never
       reaches the collector. The only signal is a person seeing English in a
       table. The gap picker then says "content-zone" with this selector, and
       the fix is one more :not() here. That trade is deliberate: an unlisted
       column is more likely to hold a customer's words than ours. */
    ':is(td.hr-data-table-td, td.n-data-table-td)[data-col-key]:not([data-col-key*="date" i]):not([data-col-key$="At"]):not([data-col-key*="status" i]):not([data-col-key^="action" i]):not([data-col-key="productType"]):not([data-col-key="paymentProviderType"]):not([data-col-key$="edOn"]):not([data-col-key^="schedule"])',
    /* THE PRODUCT EDITOR'S PRICE LIST: each price has a NAME the business gave
       it ("zz digital goods price name"), and it reached the engine. Censused
       11 Sep — the .price-scroll container holds only three kinds of text: the
       price name (span.truncate), the currency marks ($, USD), and two input
       placeholders rendered as spans ("Compare-at price", "Available
       Quantity") which are OURS. So block the name alone, not the container.

       .price-scroll is semantic; .truncate is a Tailwind utility and could go
       in a restyle. If it does, this rule matches nothing and the name leaks
       again — the collector flags it, which is failing open, not silently. */
    '.price-scroll span.truncate',
    /* THE PRODUCT EDITOR'S TOOLBAR repeats the product's name between Back and
       Save. Found v69's check, 11 Sep. The Back label and the name share a
       styling class (span.text-gray-800), so the class would take Back with
       it. What separates them is STRUCTURE, not position: Back sits inside a
       <button>, the name is a bare span directly under its toolbar group. So
       '> span' — a direct child — takes the name and leaves every button.

       Scoped to #createProducts (both create and edit use it). Other editors
       probably share this toolbar; widen only after looking at one, since a
       toolbar group elsewhere may hold a bare span of OUR text. */
    '#createProducts .hl-toolbar-group > span',
    /* THE INVOICE PREVIEW — left untranslated ON PURPOSE. Tom's decision,
       11 Sep: "keep the preview English. If they want the invoice in Czech the
       user will need to build a template."

       WHY IT IS A DECISION AND NOT A GAP: the editor shows a live preview of
       the document the CUSTOMER receives, and that document is never touched
       by this layer — the engine only switches on under /location/<id>, and a
       customer's invoice link is not such a path. Translating the preview
       would show a Czech invoice while an English one goes out: the one
       mistake a person running a business must never be shown. Left alone,
       the preview is truthful. A user who wants Czech invoices writes Czech
       into their own invoice template, and this rule then shows that text
       exactly as the customer will see it.

       IT IS ALSO A FIREWALL RULE. The preview carried the business address,
       the customer's name, the invoice number and every amount to the engine.
       Censused 11 Sep: .preview-section holds only the document card, whose
       one button ("Pay $112.00") is part of the customer's view — nothing of
       ours sits in it.

       THREE EDITORS, ONE RULE (widened v74). Checked 11 Sep rather than
       assumed: the recurring-invoice editor and the template editor are
       DIFFERENT components with different containers —
         #invoice-editor-container            one-off invoices, new and edit
         #recurring-invoice-editor-container  recurring invoices
         #invoice-template-editor-container   invoice templates
       — but all three use the same .preview-section. v71 named only the
       first, so the recurring editor's preview was being translated and its
       customer block leaked a phone number. The id pattern "contains invoice,
       ends editor-container" matches all three and no other container seen.
       Estimates and proposals are not covered; walk them when they have data.

       THE TEMPLATE EDITOR IS WHERE THIS MATTERS MOST: a user building a Czech
       template (t64/t65) sees exactly the labels HighLevel will send — their
       own Czech as typed, and HighLevel's fixed labels as they really are. */
    '[id*="invoice"][id$="editor-container"] .preview-section',
    /* THE INVOICE EDITOR'S BUSINESS AND CUSTOMER BLOCKS. The customer block
       sent the customer's EMAIL AND PHONE to the engine (found 11 Sep, the
       first invoice with a real customer on it). Censused: each
       .business-details-preview holds only record data — the business name in
       one, the customer's name, email and phone in the other — and no label
       or attribute of ours. The "Edit business details" and "Contact menu"
       buttons sit outside it and still translate. */
    '[id*="invoice"][id$="editor-container"] .business-details-preview',
    /* THE TAXES ATTACHED TO A PRODUCT. Each selected tax shows as a tag reading
       "{tax name} ({rate}%)" — the business's own tax name. Blocked by the id
       of the select that holds it, not by a pattern: a rule matching any
       "X (N%)" string would also swallow unrelated screens and hide real gaps
       from the collector. #taxSelect names what it holds. */
    '#taxSelect .n-tag',
    /* FILE NAMES in Media Storage — "Adam_Sandler.jpg" reached the engine the
       day product images were uploaded (11 Sep). A file name is whatever the
       business called its file: customer data. span.file-name is a semantic
       class. The same name also sits in each thumbnail's alt text; that copy
       is caught by the record backstop (noted here first, read later in the
       walk), and an alt holding a name WITH an extension cannot match a
       dictionary word anyway. */
    '.file-name',
    /* THE APP MARKETPLACE (/integration), v81. Each card's name, "By
       <developer>" and description are the DEVELOPER's words: third-party
       content, and translating "Restaurant Menu" or "Spintax For Workflow"
       would rename someone else's product. HighLevel's data-testid names the
       parts, which beats any styling class. The header holds name + developer;
       the description is the clamped paragraph. The footer — price tag,
       "Zdarma", "Free to Install" — is ours and stays open. Censused 11 Sep:
       everything else in the grid is ratings or our own text. */
    '[data-testid="app-card-header"]',
    '[data-testid="app-card"] p.line-clamp-2',
    /* THE AI AGENT TEMPLATES marketplace, v84 — the same case in a different
       component: each bot card's title, name, author and description belong to
       whoever published the agent ("Clara", "GenZAutomates"). The author's
       LABEL beside the name is ours, so only the truncated name is blocked. */
    '[data-testid="bot-card-title-column"]',
    '[data-testid="bot-card-name"]',
    '[data-testid="bot-card-author"] p.truncate',
    '[data-testid="bot-card-body"] p.line-clamp-2',
    /* install counts ("318.8K"): figures, not words, and noise in every sweep */
    '[data-testid="bot-card-usage"]',
    /* A CONTACT'S ATTRIBUTION SOURCE, v84: "První zdroj atribuce: CRM UI". The
       label is ours; the value is whatever brought the contact in, which for a
       real account is a campaign name or a UTM string someone typed. */
    '#attribution-value',
    /* THE RECORD CARD on a contact's left panel, v85: avatar, then the NAME
       ("ZZ Test Ř"). The backstop catches it once the centre panel's name has
       been seen, but on first paint the left panel can arrive first, and the
       sweep recorded exactly that. HighLevel names the avatar .record-avatar;
       its next sibling is the record's name, on any record type. */
    '.record-avatar + *',
    /* TAG CHIPS: the id is built from the tag's own text
       (hr-tag-ellipsis-tag-zz-followup), and tags are user-authored. Seen on
       the contact card and the opportunities forecast, 11 Sep. */
    '[id^="hr-tag-ellipsis-tag-"]',
    /* PARKED, NOT CUSTOMER DATA: the survey and quiz builders' template
       galleries. HighLevel's sample templates, whose tags arrive truncated
       ("Digital Mark...") and so cannot be translated. Blocked so they stop
       filling every sweep; remove if the galleries are ever translated. */
    '#start-with-template [id^="template-card-"] .font-bold',
    '[id^="hr-tag-count-wrapper-template-tag-"]',
    /* PARKED, NOT CUSTOMER DATA: Settings > Labs feature cards — HighLevel's
       release notes, a new set every week, most cut off mid-word ("private
       file fie..."). The title (twice) and the description are blocked; the
       card's own controls — Zobrazit více, the "Activate now" tag, Odeslat
       zpětnou vazbu — stay open. The page header carries ids and is excluded. */
    '#Labs .card-container .hr-card-header .hr-text-3xl:not([id])',
    '#Labs .card-container .hr-card-content p.hr-text-md.hr-text-medium:not([id])',
    '#Labs .card-container .hr-card-content p.hr-text-sm.hr-text-regular:not([id])',
    /* THE ADS REPORTS (Google, Facebook), v84: a Bootstrap table whose body is
       campaign names and figures. Sample campaigns today ("Lawn Space
       Gardening"), a real account's own campaigns once connected. The column
       headers are in thead and stay open. */
    '.table-hl tbody',
    /* THE OPPORTUNITIES BOARD. Stage names are user-authored ("ZZ New Lead"),
       and HighLevel gives each one an id of its own: data-stage-name-<uuid>.
       An id prefix is a better anchor than any class here -- it names what the
       element holds rather than how it looks.

       PRECISELY THIS ELEMENT, NOT THE CARD AROUND IT. The stage header also
       contains data-stage-total-<uuid>, which reads "1 příležitost" because our
       plural rule already handles it. Blocking the card would take the
       translation away with the data. */
    '[id^="data-stage-name-"]',
    /* THE SUB-ACCOUNT SWITCHER in the sidebar: the account's own name and its
       address ("ZZ My Gym", "ZZ Las Vegas, NV"). Both sit in .hl_location-text
       inside div#location-switcher-sidbar-v2 (HighLevel's own typo). Blocking
       the text wrapper rather than the switcher leaves the switcher's chrome
       translatable. Found by the harvest walk once the noise was cleared. */
    '.hl_location-text',
    /* DASHBOARD WIDGETS. Task titles are whatever the user called the task
       ("zz call the prospect"), and HighLevel gives each one the same id —
       task-title-text — on every row, so an attribute selector catches them all.

       The widget's pipeline filter sits in a dropdown whose id is the generic
       "select-id". Checked before scoping to it: that id appears ONLY on the
       dashboard, across opportunities, reporting, tasks, payments and social
       planner — so blocking its selected label costs no enum value elsewhere.
       If it ever turns up on another screen holding a status, this rule will
       leave that status in English, and the zero-match audit will not notice:
       it will still be matching something. */
    '[id="task-title-text"]',
    /* THE REST OF THAT WIDGET'S RECORD FIELDS. Censused 11 Sep rather than
       guessed at -- the widget uses five ids and they do NOT all hold the same
       kind of thing:
         task-checkbox           empty
         task-title-text         the task's name          BLOCKED (v45)
         task-description-text   the task's body          BLOCKED here
         task-contact-text       ":  <span>contact</span>" BLOCKED here; the
                                 leading colon is punctuation, not a label,
                                 so blocking the element costs no translation
         task-assigned-to-text   "Assigned to: <span>X</span>" -- LEFT ALONE.
                                 Its label and its "Unassigned" value are both
                                 ours and translate correctly; when X is a real
                                 person the record backstop below catches the
                                 name, which is the case it was built for.
       Naming task-title-text alone in v45 is the third instance this week of
       fixing one member of a family and assuming it was the family. */
    '[id="task-description-text"]',
    '[id="task-contact-text"]',
    '[id="select-id"] .hr-base-selection-label',
    /* THE OPPORTUNITY CARDS THEMSELVES. Only visible once a pipeline has cards
       in it, which is why the board looked clean when the stage headings were
       fixed in v45 — an empty board has no records to leak.

       Each card carries a two-cell table per field: the LABEL in the first cell
       ("Název firmy:", ours, translated) and the VALUE in the second (the
       customer's). `td + td` takes every value cell and no label — measured on
       the live board: 15 values matched, 0 labels.

       The title is the only link inside a card's content. */
    '.opportunitiesCard tr[id] td + td',
    '.opportunitiesCard .ui-card-content a',
    /* the selected pipeline, also user-named. Scoped to that dropdown on
       purpose: .hr-base-selection-label is HighLevel's design system and is
       used by every select in the product, including status pickers whose
       values we DO translate. (Their id really is spelled DropdDown.)

       AN ID PREFIX, NOT THE EXACT ID. There are TWO of these selects and they
       are different elements: #pipelineDropdDown on the board and
       #pipelineDropdDown-listview in the list-view toolbar. v45 named only the
       listview one, so the board's pipeline name leaked in BOTH its text and
       its title attribute for ten versions -- found on /opportunities, 11 Sep.
       The prefix covers whatever the next view calls its copy. */
    '[id^="pipelineDropdDown"] .hr-base-selection-label',
    /* AVATAR INITIALS. Always derived from a person's name, so they are as much
       customer data as the name is -- "ZZ" here is the sub-account owner. Two
       characters never carry interface meaning, so there is nothing to lose by
       blocking the class wholesale.

       .avatar_img, NOT .hl_header--avatar: the anchor around it carries the
       aria-label "Open profile menu", which IS ours to translate.

       TWO avatar components, so two selectors: .avatar_img is HighLevel's older
       header avatar, .hr-avatar__text the design-system one used in lists and
       on opportunity cards. Naming only the first left five initials leaking on
       the list view in v55 -- the same one-of-two mistake as the pipeline
       dropdown, found in the same walk. */
    '.avatar_img', '.hr-avatar__text',
    /* THE CALENDAR SIDEBAR'S FILTER LISTS. Under each heading -- Users,
       Calendars, Groups -- sits a checkbox row per record, and the row's label
       is the record's name ("Gym Classes/Sessions", a calendar group the
       account owner named). The heading buttons carry .interactive-element too,
       but their label span is .text-sm.font-medium, not .text-left, so the
       headings keep translating and only the rows are protected.

       ONE GROUP EXISTS IN THIS ACCOUNT, so the shape is confirmed against a
       single record. It is a per-row structure, so N records give N matches of
       the same shape -- but if this ever stops matching, that single sample is
       where to look first. */
    '.interactive-element button span.text-left',
    /* our own tooling, so the engine never rewrites its own overlays */
    '#claude-agent-glow-border', '#claude-agent-stop-container', '#claude-phantom-cursor'
  ];

  /* attributes: everything above, but form controls are allowed */
  var BLOCKED_ATTR = CONTENT_ZONES.join(',');

  /* ATTRIBUTE-ONLY ZONES, v81: an element whose OWN attributes hold a record
     while its children are ours. CONTENT_ZONES cannot express that — they
     work through closest(), so a zone on a container silences everything
     inside it. Matched with matches(), never closest(): the element itself,
     not its descendants.

     The product editor's toolbar carries the product's name as its title
     ("ZZ digital goods") and holds Zpět / Zahodit / Uložit, which must
     translate. The record backstop usually catches the title — but only once
     the name has been seen in a zone, and on the first paint the toolbar can
     arrive first. The collector recorded exactly that single leak. */
  var SELF_ATTR_ZONES = [
    '.hl-toolbar[title]'
  ];
  var SELF_ATTR = SELF_ATTR_ZONES.join(',');
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

  var DATA_VERSION  = 'v69';          /* bump when lang/<locale>.js changes */
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

  /* Resolve pack.byRoute for the CURRENT path. Cached on the pathname, because
     translate() is called thousands of times per pass and the path changes only
     on navigation. Re-resolved when it does, so an in-app route change takes
     effect on the pass that notices the re-render it caused. */
  var ROUTE_PATH = null;
  var ROUTE_MAP = null;

  function routeOverrides() {
    var path = window.location.pathname;
    if (ROUTE_PATH === path) return ROUTE_MAP;
    ROUTE_PATH = path;
    ROUTE_MAP = null;
    var by = PACK && PACK.byRoute;
    if (!by) return null;
    /* EVERY matching prefix, merged shortest first, so a longer one overrides
       key by key and inherits the rest (v93). Until v93 only the single longest
       match applied, so a narrow route could not correct one word without
       re-listing its parent's whole vocabulary. The recurring list's row menu
       needed "End" as a verb (Ukončit) while its editor needs the noun (Konec),
       both under /payments. */
    var keys = [];
    for (var k in by) {
      if (own(by, k) && path.indexOf(k) !== -1) keys.push(k);
    }
    if (!keys.length) return null;
    keys.sort(function (a, b) { return a.length - b.length; });
    ROUTE_MAP = {};
    for (var i = 0; i < keys.length; i++) {
      var m = by[keys[i]];
      for (var w in m) if (own(m, w)) ROUTE_MAP[w] = m[w];
    }
    return ROUTE_MAP;
  }

  function translate(raw) {
    if (!DICT) return null;                      /* not ready: touch nothing */
    var key = String(raw).trim();
    if (!key) return null;

    /* Brands and technical tokens, checked BEFORE the dictionary so no pack can
       accidentally translate one. Returns the string unchanged rather than null:
       null would mean "miss", and every brand name on the page would then pile
       up in the harvest queue for ever. */
    if (RULES && RULES.neverTranslate) {
      var keep = RULES.neverTranslate(key);
      if (keep !== null) return keep;
    }

    /* ROUTE-SCOPED OVERRIDES, checked before the global dictionary.

       SOME ENGLISH WORDS ARE ONE WORD IN ENGLISH AND TWO IN CZECH, and which
       one is right depends on the DOMAIN, not the sentence. "Overdue" is the
       case that forced this: a task is "po termínu" (past its deadline) and an
       invoice is "po splatnosti" (past its maturity) -- the accounting term.
       There is no word that covers both, and using the task word on an invoice
       reads wrong to anyone who runs a business, which is exactly our user.

       ⚠ THIS FAILURE CLASS IS INVISIBLE TO EVERY TOOL WE HAVE, and that is why
       the machinery exists before the bug does. The collector only sees MISSES.
       "Overdue" -> "Po termínu" on an invoice screen is a confident HIT: the
       gap picker paints it green, the coverage figure counts it as translated,
       and it ships at 98.6% while being wrong. Nothing reports it but a person
       who reads Czech and knows accounting.

       LONGEST MATCHING PREFIX WINS, deliberately -- not first-declared. Object
       key order would otherwise be a hidden dependency, and the day someone
       reorders the pack for tidiness the translations change.

       KEEP THIS SMALL. It is for genuine domain splits, not a place to fix a
       word you dislike on one screen. If a string needs different Czech in two
       places for any reason OTHER than the domain owning different vocabulary,
       the answer is a pattern rule or a better single word. */
    var byRoute = routeOverrides();
    if (byRoute && own(byRoute, key)) return byRoute[key];

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
    /* RENAMED v76 to the ka prefix — these three escaped the v32 sweep because
       they are set by the DATA files, which the sweep never grepped. The old
       names are read as a FALLBACK for one release: the engine file can sit in
       a browser's cache for ~10 minutes after a deploy while the data files
       load fresh, and an old engine meeting new names (or the reverse) would
       find nothing and switch the layer off. The data files set BOTH names for
       the same reason. Remove the old names once no cached copy can remain —
       see NAMESPACE.md. */
    var R = window.__kaRules || window.I18nRules;
    var SS = window.__kaSource || window.GhlSourceRules;
    var PP = window.__kaPacks || window.GhlLangPacks;
    var S = SS && SS.en;
    var P = PP && PP[locale];

    if (!R || typeof R.applyRules !== 'function') return disable('i18n-rules.js loaded but __kaRules.applyRules is missing');
    if (!S || !S.rules || !S.rules.length)        return disable('source-en.js loaded but its rule table is empty');
    if (!P)                                       return disable('pack for ' + locale + ' loaded but did not register itself');
    if (!P.dict || !P.patterns || !P.plurals)     return disable('pack ' + locale + ' is malformed (needs dict, patterns, plurals)');

    RULES = R; SOURCE = S; PACK = P;
    PSEUDO = Array.isArray(P.pseudo) ? P.pseudo : [];
    PACK_CSS = Array.isArray(P.css) ? P.css : [];

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

  /* HIGHLEVEL'S WIDGET TABLES, v90. Their body cells (td.hr-data-table__body-cell)
     carry no data-col-key, unlike the invoice-list tables. The column's key
     lives on the HEADER cell, as its aria-label ("dateUpdated", "steps") — which
     this engine itself translates, so the original is read from the property
     doAttrs leaves behind (__kaAttrSrc_aria-label).

     Same default as every other table: a cell is BLOCKED unless its column is
     known to hold our text. Unknown header, no header, no key: blocked. The
     let-through is the data-col-key list in CONTENT_ZONES plus "steps" (a count,
     "3 Steps"). cellIndex and tHead are O(1), so this costs nothing per node. */
  function hrColumnLetThrough(k) {
    return /date/i.test(k) || /At$/.test(k) || /status/i.test(k) || /^action/i.test(k) ||
           k === 'productType' || k === 'paymentProviderType' || /edOn$/.test(k) ||
           /^schedule/.test(k) || k === 'steps';
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

  /* FALLBACK, v93: some of these tables carry no key at all (the tags list).
     Their header's own TITLE is HighLevel's column name. It's read in the
     ORIGINAL English (the text node's __kaSrc, since we translate headers)
     and let through only on an exact date-or-status title. Anchored at both
     ends, so "Last Name" or "Created By" can never open a column. */
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

  function blockedText(el) {
    if (!el || !el.closest) return true;
    if (el.closest(BLOCKED_TEXT)) return true;
    if (hrCellBlocked(el)) return true;
    /* an <option> is allowed unless it belongs to a record picker */
    if (el.tagName === 'OPTION' || el.closest('option')) return inDataPicker(el);
    return false;
  }

  function blockedAttr(el) {
    if (!el) return true;
    if (el.matches && el.matches(SELF_ATTR)) return true;
    if (!el.closest) return true;
    return !!el.closest(BLOCKED_ATTR) || hrCellBlocked(el);
  }

  /* ---------- MIRRORED RECORDS: the backstop behind the selectors ---------
     CONTENT_ZONES is a map of WHERE customer data lives, and a map can only
     name places that exist. HighLevel copies a record's name into places the
     map cannot reach: hover tooltips portalled to <body>, aria-labels and
     title attributes on wrapper elements. Measured on /opportunities, 11 Sep:
     the card-hover tooltip holding a contact's name is structurally IDENTICAL
     to the five action tooltips beside it -- same classes, same parent, same
     child span -- so no selector can separate "zz tom zz keyser" from
     "Add note". Only the content differs.

     So use the content. Every string the firewall REJECTS is customer data by
     definition; remember those, and refuse to report the same string when it
     turns up somewhere the selectors do not cover. The set maintains itself
     from the firewall we already have, and needs no new selector per mirror.

     IT SUPPRESSES REPORTING, NOT TRANSLATION, and that limit is deliberate.
     A record named "Call" would otherwise stop the Call BUTTON translating
     everywhere on the page -- a customer's data silently breaking the product
     for them, which is worse than the leak it would close. The suppression
     therefore sits on the miss path only, where translate() has already
     returned null: nothing that was going to be translated is affected, and
     the names stop flowing to the collector, the picker and the error channel.

     Bounded and per-page-load. Nothing is persisted. */
  var RECORDS = Object.create(null);
  var RECORDS_N = 0;
  var MAX_RECORDS = 800;

  function noteRecord(s) {
    if (!s) return;
    s = String(s).trim();
    /* 3 chars minimum: shorter strings are initials and symbols, which collide
       with interface text far more often than they identify anyone. */
    if (s.length < 3 || s.length > 80) return;
    if (RECORDS[s] || RECORDS_N >= MAX_RECORDS) return;
    RECORDS[s] = 1;
    RECORDS_N++;
  }

  function isRecordMirror(s) {
    return !!RECORDS[String(s).trim()];
  }

  /* A FILE NAME IS CUSTOMER DATA BY ITS SHAPE. Added v75. "Adam_Sandler.jpg"
     turned up in Media Storage (blocked by .file-name in v73), then again as
     an ATTACHMENT on a recurring invoice — in bare Tailwind classes with no
     anchor at all. Chasing every place a file name can appear with a styling
     selector is how the one-member-of-a-family misses keep happening.

     The shape is reliable where a person's name is not: no path, no leading
     or trailing space, ending in a known extension. HighLevel's interface
     never uses a bare file name as a label. "Allowed Files -> PNG, CSV, PDF"
     does not end in one; "Upload .csv" has a space before the dot and is
     refused, so a real label can not be silenced by accident.

     Same contract as the rest of the backstop: it suppresses REPORTING only.
     A file name cannot be translated anyway — no dictionary word ends in
     ".jpg" — so there is nothing to stop on that side. */
  var FILE_NAME = /^[^\s\/\\][^\/\\\n]{0,150}[^\s\/\\.]\.(?:jpe?g|png|gif|webp|svg|bmp|tiff?|heic|pdf|csv|txt|docx?|xlsx?|pptx?|odt|ods|zip|rar|mp3|wav|m4a|mp4|mov|avi|webm)$/i;

  function looksLikeFileName(s) {
    return FILE_NAME.test(String(s).trim());
  }

  /* A URL, likewise, added v79: the client portal prints the account's own
     portal address as a link, and a business's website or a booking link can
     turn up anywhere. Untranslatable, often the customer's own, and reported
     on every sweep. Whole-string only — "Visit https://…" is a sentence. */
  /* also a bare path, "/product/" — the fixed prefix beside a product's URL
     handle (v83). Slash-first, no spaces: no label is spelled like that. */
  /* and a bare domain, "app.clientclub.net" (v85): a customer's domain is
     theirs, and HighLevel's own is untranslatable. A KNOWN TOP-LEVEL DOMAIN,
     lower-case, on purpose: HighLevel's raw message keys have the same
     dotted shape ("common.resize"), and those are real gaps to see. */
  var URL_SHAPE = /^(?:(?:https?:\/\/|www\.)[^\s]+|\/[\w\-.\/]+|(?:[a-z0-9-]+\.)+(?:com|net|org|io|co|cz|sk|de|at|pl|eu|uk|us|ca|au|app|ai|dev|me|info|biz|site|online|store))$/;

  function looksLikeUrl(s) {
    return URL_SHAPE.test(String(s).trim());
  }

  /* And a database id, v81: 24 hex digits, HighLevel's record ids. The
     product editor prints the product's "Internal Product Id" as plain text;
     every sweep reported it. Nothing in any language is spelled like this. */
  var OBJECT_ID = /^[0-9a-f]{24}$/i;

  /* And a bare phone number or e-mail address, v84: the contact screen's call
     button carries "Call: +420…" as its label (translated by a pattern that
     passes the number through), and the bare forms turn up wherever a contact
     is shown. Reporting them would put a customer's number in the harvest. */
  /* not an ISO date: "2026-09-10" has the same characters, and an untranslated
     date shown as text is a real gap worth seeing */
  var PHONE_SHAPE = /^(?!\d{4}-\d{2}-\d{2}$)\+?\(?\d[\d\s().-]{6,}\d$/;
  var EMAIL_SHAPE = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

  /* the shapes together: the reason why() gives, or null */
  function recordShape(s) {
    var t = String(s).trim();
    if (FILE_NAME.test(t)) return 'file-name';
    if (URL_SHAPE.test(t)) return 'url';
    if (OBJECT_ID.test(t)) return 'record-id';
    if (PHONE_SHAPE.test(t)) return 'phone';
    if (EMAIL_SHAPE.test(t)) return 'email';
    return null;
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

  /* why(node[, attr]) -> { reason, ... }
     reasons: not-ready | empty | too-long | iframe | content-zone |
              data-picker | record-mirror | file-name | missing |
              translated                                                */
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
        return { reason: 'content-zone', zone: zoneOf(el, true) || 'hr-data-table column',
                 on: describe(el.closest(BLOCKED_ATTR) || el), text: key };
      }
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
    /* seen inside the firewall elsewhere on this page: a mirror of a record,
       not a gap. Reported separately so the picker can show it as protected
       rather than as work outstanding. */
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
    maxLen: MAX_LEN,
    /* HOW MANY record strings the firewall has caught on this page, not WHICH.
       The count is the useful diagnostic -- a zero here on a screen full of
       records means the selectors have stopped matching. The strings themselves
       are customer data and are deliberately not exposed, least of all through
       a surface whose whole purpose is to be read by tooling. */
    records: function () { return RECORDS_N; },
    /* WHICH domain overrides are active on this screen, and what they change.
       Without this, "why is it 'Po splatnosti' here and 'Po termínu' on tasks?"
       has no answer short of reading the pack. */
    routeOverrides: function () {
      var m = routeOverrides();
      return m ? { scope: ROUTE_PATH, overrides: m } : null;
    }
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
    /* NEVER REPORT OUR OWN OUTPUT AS A GAP. Text nodes are safe because
       __kaDone stops them before they reach here, but ATTRIBUTES carry no
       marker: doAttrs re-reads its own Czech on every pass, translate() misses
       because Czech is not a key, and the collector recorded it as missing.
       Measured 10 Sep on one dashboard: our own aria-labels held the top three
       places by frequency (31, 18, 15 sightings), which is exactly the ranking
       that was supposed to sort real work to the top. Same root cause as the
       why() bug fixed in v34 -- fixed there, missed here. */
    if (isOurOutput(String(raw).trim())) return;
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
    if (out === null) {
      if (!isRecordMirror(raw) && !recordShape(raw)) missed(raw, node, null);
      return;
    }
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
      /* THE ATTRIBUTE EQUIVALENT OF __kaDone. Text nodes have carried a marker
         since the beginning; attributes never did, so doAttrs re-read its own
         output on every pass and reported it as a gap. isOurOutput() covered
         the literal case in v41, but not strings COMPOSED by a pattern rule --
         "Zobrazit stranku 1" is built at runtime and is in no dictionary, so
         the reverse index could not recognise it. A per-attribute marker closes
         the class of bug rather than the instance, and stops us re-translating
         every attribute on every pass as a side effect.

         If the application rewrites the attribute back to English the value no
         longer matches the marker, so it is translated again -- the same
         contract text nodes have always had. */
      var mark = '__kaAttr_' + a;
      if (el[mark] === v) continue;              /* ours, and untouched since */
      var out = translate(v);
      if (out === null) {
        if (!isRecordMirror(v) && !recordShape(v)) missed(v, el, a);
        continue;
      }
      if (out === v) continue;
      el.setAttribute(a, out);
      el[mark] = out;
      /* the ORIGINAL, v90: a widget table's column key is its header cell's
         aria-label, and translating it would otherwise destroy the key that
         hrCellBlocked() reads. Same lifetime as the marker above. */
      el['__kaAttrSrc_' + a] = v;
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
    var css = document.getElementById(PACK_STYLE_ID);
    if (css && css.parentNode) css.parentNode.removeChild(css);

    STATUS.reverted = restored;
    return restored;
  }

  function walk(root) {
    if (!root) return;
    /* re-checked per pass so switching sub-accounts in-app takes effect at once */
    if (!shouldTranslate()) return;

    if (root.nodeType === 3) {
      if (blockedText(root.parentElement)) noteRecord(root.textContent);
      else doTextNode(root);
      return;
    }
    if (root.nodeType !== 1) return;
    /* BLOCKED_ATTR is the looser list, so being blocked for attributes means
       being blocked for everything -- safe to bail on the whole subtree.
       closest() only, NOT blockedAttr(): an attribute-only zone blocks the
       element's own attributes, and bailing here would silence its children. */
    if (root.closest && root.closest(BLOCKED_ATTR)) return;

    /* INPUT VALUES ARE RECORDS — note them before anything else reads the page.
       Added v70, from the product editor: its toolbar repeats the product's
       NAME beside Save and Discard, and that copy reached the engine as a gap.
       Nearly every edit screen does this — the record's name echoed in a
       header, a breadcrumb, a title. The input holding it is already blocked,
       but nothing told the record backstop that its value IS a record, so the
       echo looked like ordinary untranslated text.

       A text input's value is customer data by definition, so it goes in the
       record set — except values WE wrote (__kaVal), which are our own Czech.
       BEFORE the text walk, for the reason the walk order is load-bearing:
       otherwise the header copy is reported on the first pass, before its
       input has been seen.

       Like the rest of the backstop this suppresses REPORTING, not
       translation. Stopping the echo being translated still needs a selector
       — see '#createProducts .hl-toolbar-group > span' in CONTENT_ZONES. */
    var recFields = root.querySelectorAll('input,textarea');
    for (var rf = -1; rf < recFields.length; rf++) {
      var fe = rf < 0 ? root : recFields[rf];
      if (fe.tagName !== 'INPUT' && fe.tagName !== 'TEXTAREA') continue;
      if (fe.tagName === 'INPUT' && fe.type && !/^(text|search)$/i.test(fe.type)) continue;
      if (fe.value && fe.__kaVal !== fe.value) noteRecord(fe.value);
    }

    /* TEXT FIRST, ATTRIBUTES SECOND, AND THE ORDER IS LOAD-BEARING.

       The text walk is what POPULATES the record set: every node the firewall
       rejects is noted as customer data on the way past. The attribute pass
       then CONSULTS that set to recognise a wrapper attribute mirroring a
       record below it.

       Run attributes first -- as this did until v59 -- and on the FIRST pass
       over a freshly rendered screen every such attribute is reported before
       the records underneath it exist. Measured on the dashboard: the tasks
       widget puts each task's title in the CHECKBOX's aria-label, and all
       three were recorded by the collector on pass one, then correctly
       suppressed on every pass after. A gap that appears once and never again
       is the worst kind to chase, because by the time anyone looks it has
       stopped happening.

       Nothing else depends on the order: doTextNode and doAttrs touch
       different things and neither reads the other's output. */

    /* text nodes (form controls excluded -- their text is customer data) */
    var w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) {
        if (!blockedText(n.parentElement)) return NodeFilter.FILTER_ACCEPT;
        /* the firewall rejected it, so it is customer data -- remember it */
        noteRecord(n.textContent);
        return NodeFilter.FILTER_REJECT;
      }
    });
    var n;
    while ((n = w.nextNode())) doTextNode(n);

    /* attributes on the root and everything under it (form controls included).
       The ROOT goes through blockedAttr() like every other element (v91). It
       used to be translated unconditionally, which was safe only while every
       zone was a closest() zone and the bail above had already caught it. The
       v82 attribute-only zones and the v90 widget-table columns are not caught
       by that bail. The v90 sweep found a snippet's text and a product's name
       reported from exactly this line, when the changed element was the
       cell's own child. */
    if (!blockedAttr(root)) doAttrs(root);
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
    if (STATUS.translatingHere) injectPackCss();   /* cheap; restores it if removed */
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
    if (shouldTranslate()) injectPackCss();
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
