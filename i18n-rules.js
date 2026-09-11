/* =============================================================================
   i18n-rules.js — the LANGUAGE-FREE pattern engine

   WHAT THIS REPLACES: the 224-line translate() in ghlczechui.js v27, which held
   52 pattern rules with Czech welded into the code — 'Stránka ' + n, 'Vybráno ',
   czPlural(n,'kontakt','kontakty','kontaktů'), four month tables. Swapping
   czPlural for Intl.PluralRules alone would have changed nothing: the language
   lived in the string concatenation, not in the plural function.

   THREE-WAY SPLIT, and the reason for it:
     ENGINE (this file)  composition logic and formatters. No human language,
                         no regexes. Never changes when a language is added.
     SOURCE (lang/source-en.js)  the regexes. They match what HighLevel
                         RENDERS, so they belong to the platform language, not
                         to the language we translate into. One file per source.
     TARGET (lang/cs-CZ.js)  every emitted word: templates, plural forms, month
                         tables, dictionary. One file per target.
   Source x target is N+M files, not N*M.

   TEMPLATE SYNTAX, used by pack.patterns[ruleId]:
     {1}..{9}    capture group N
     {~form:N}   plural: pack.plurals[form], category from Intl.PluralRules
                 using the integer in capture N. The number is NOT inserted --
                 templates write it explicitly, as "{1} {~items:1}".
     {=N}        glossary lookup of capture N. On a miss THE WHOLE RULE FAILS
                 and matching continues with the next rule, preserving v27's
                 behaviour where an untranslatable label skipped the pattern
                 rather than half-applying it.
     {?N}        glossary lookup of capture N, falling back to the raw capture.
     {*N}        recursive translate() of capture N, falling back to the raw.

   PER-TARGET RULE OVERRIDES: a pack may set
       ruleOverrides: { SOME_RULE: false }              // never apply it
       ruleOverrides: { SOME_RULE: { re: /.../, h: '@fmt' } }   // replace it
   so a target can opt out of a source rule that produces bad output in that
   language, without forking the source file.
============================================================================= */

(function (root) {
  'use strict';

  /* ---------- plural ------------------------------------------------------
     Intl.PluralRules gives the CLDR category for any locale. For INTEGERS it
     is exactly equivalent to the old hand-written czPlural (1 -> one,
     2-4 -> few, 0 and 5+ -> other) — verified by differential test over
     24,915 inputs — and it additionally gets Polish, Russian and Arabic right,
     which czPlural never could.                                             */
  var prCache = {};
  function category(locale, n) {
    try {
      var pr = prCache[locale] || (prCache[locale] = new Intl.PluralRules(locale));
      return pr.select(n);
    } catch (e) { return 'other'; }
  }

  function pluralForm(pack, form, n) {
    var forms = pack.plurals && pack.plurals[form];
    if (!forms) return null;
    var v = forms[category(pack.locale, n)];
    if (v === undefined) v = forms.other;
    if (v === undefined) v = forms.many;
    if (v === undefined) v = forms.one;
    return v === undefined ? null : v;
  }

  /* ---------- template expansion ------------------------------------------ */
  var TOKEN = /\{([~=?*]?)([A-Za-z0-9_]+)(?::(\d))?\}/g;

  function expand(pack, tpl, m, ctx) {
    var failed = false;
    var out = tpl.replace(TOKEN, function (_, kind, name, idx) {
      if (kind === '~') {
        var n = parseInt(m[parseInt(idx, 10)], 10);
        var f = pluralForm(pack, name, isNaN(n) ? 0 : n);
        if (f === null) { failed = true; return ''; }
        return f;
      }
      var g = m[parseInt(name, 10)];
      if (kind === '=') {
        var hit = ctx.plain(g);
        if (hit === null) { failed = true; return ''; }
        return hit;
      }
      if (kind === '?') { var h2 = ctx.plain(g); return h2 === null ? g : h2; }
      if (kind === '*') { var h3 = ctx.translate(g); return h3 === null ? g : h3; }
      return g === undefined ? '' : g;
    });
    return failed ? null : out;
  }

  /* ---------- formatters ---------------------------------------------------
     Language-free: every word comes out of the pack.                        */
  function pad2(n) { return n < 10 ? '0' + n : String(n); }

  function to24(h, ampm) {
    var n = parseInt(h, 10) % 12;
    if (/pm/i.test(ampm)) n += 12;
    return pad2(n);
  }

  function relative(pack, n, unitKey, unitMap) {
    var form = unitMap[String(unitKey).toLowerCase()] || unitMap._default;
    var word = pluralForm(pack, form, n);
    if (word === null) return null;
    return ((pack.frames && pack.frames.ago) || '{n} {unit}')
      .replace('{n}', String(n)).replace('{unit}', word);
  }

  var SHORT_UNITS = { s: 'agoSeconds', m: 'agoMinutes', h: 'agoHours', d: 'agoDays', _default: 'agoWeeks' };
  var LONG_UNITS  = { second: 'agoSeconds', minute: 'agoMinutes', hour: 'agoHours',
                      day: 'agoDays', week: 'agoWeeks', _default: 'agoMonths' };

  /* `which` selects a month table, so a language that declines month names
     (Czech genitive) and one that does not share this code path.            */
  function month(pack, which, token) {
    var t = pack.months && pack.months[which];
    if (!t) return null;
    var k = String(token);
    if (t[k] !== undefined) return t[k];
    var lk = k.toLowerCase();
    return t[lk] !== undefined ? t[lk] : null;
  }

  /* A target pack may set dateStyle:'numeric' to render stamps as digits
     (31. 8. 2026) instead of naming the month. Confirmed correct for Czech by
     a native speaker. It applies to DATE STAMPS ONLY — never to month-name or
     weekday labels, which stay words in every language. */
  function numericDate(pack, d, mo, y) {
    var f = (pack.frames && pack.frames.numericDate) || '{d}. {m}. {y}';
    return f.replace('{d}', String(parseInt(d, 10)))
            .replace('{m}', String(mo)).replace('{y}', String(y));
  }
  function isNumeric(pack) { return pack.dateStyle === 'numeric'; }
  function monthIndex(token) {
    var i = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec']
      .indexOf(String(token).slice(0, 3).toLowerCase());
    return i < 0 ? null : i + 1;
  }

  /* Weekday names, like month names, live in the pack. Same shape as months so
     a language that declines them can add another table without touching this
     file. */
  function weekday(pack, which, token) {
    var t = pack.weekdays && pack.weekdays[which];
    if (!t) return null;
    var k = String(token).slice(0, 3).toLowerCase();
    return t[k] !== undefined ? t[k] : null;
  }

  var FORMATTERS = {
    /* "Created on: Sep 4 2026, 7:13 PM (PDT)" — a label, a stamp and a zone.
       THE ZONE IS PASSED THROUGH UNCHANGED: it is the account's real setting,
       not a word to translate, and it varies per sub-account. Writing it into
       the pack is exactly the mistake that leaves a competitor shipping
       "Created (BST)" to a CEST location. */
    createdOnStamp: function (pack, m) {
      var f = pack.frames && pack.frames.createdOn;
      if (!f) return null;
      var date;
      if (isNumeric(pack)) {
        var i = monthIndex(m[1]);
        if (i === null) return null;
        date = numericDate(pack, m[2], i, m[3]);
      } else {
        var mo = month(pack, 'genitive', m[1]);
        if (mo === null) return null;
        date = m[2] + '. ' + mo + ' ' + m[3];
      }
      var out = date + ' ' + to24(m[4], m[6]) + ':' + m[5];
      if (m[7]) out += ' (' + m[7] + ')';
      return f.replace('{stamp}', out);
    },
    /* "Overdue - 9/5/2026" — US month/day/year behind an English label */
    overdueSlash: function (pack, m) {
      var f = pack.frames && pack.frames.overdue;
      return f ? f.replace('{date}', numericDate(pack, m[2], parseInt(m[1], 10), m[3])) : null;
    },
    /* "Sep 4" — a bare month and day, no year */
    monDay: function (pack, m) {
      if (isNumeric(pack)) {
        var i = monthIndex(m[1]);
        return i === null ? null : parseInt(m[2], 10) + '. ' + i + '.';
      }
      var mo = month(pack, 'genitive', m[1]);
      return mo === null ? null : parseInt(m[2], 10) + '. ' + mo;
    },
    /* "06 Sun" — the day-number and weekday a calendar draws above a column */
    dayWeekday: function (pack, m) {
      var w = weekday(pack, 'abbr', m[2]);
      return w === null ? null : m[1] + ' ' + w;
    },
    /* "12 AM", "1 PM" — a calendar gutter hour.
       THIS IS NOT A TRANSLATION, IT IS A CLOCK CHANGE: Czech uses 24-hour
       time, so "1 PM" is 13:00 and "12 AM" is 00:00. No dictionary could
       produce that, which is why the whole calendar column came back as a gap.

       PADDED, CORRECTED 11 Sep. This used its own unpadded helper ("9:00",
       "0:00") on the strength of my claim that Czech calendars label hours
       that way. A native speaker says Czech times are ALWAYS two-digit —
       "00:00", "09:00" — and that she missed it when she approved the
       calendar, because the review looked at the day names and the 24-hour
       switch, not the zero. Every other time in this file already padded
       through to24; the helper that did not is gone, so there is one clock
       and nothing to choose wrongly between. */
    hourLabel: function (pack, m) { return to24(m[1], m[2]) + ':00'; },
    /* "Sep 6 – 12, 2026" — one month, a span of days, shared year */
    dayRangeInMonth: function (pack, m) {
      var d1 = parseInt(m[2], 10), d2 = parseInt(m[3], 10), y = m[4];
      if (isNumeric(pack)) {
        var i = monthIndex(m[1]);
        return i === null ? null : d1 + '.–' + d2 + '. ' + i + '. ' + y;
      }
      var mo = month(pack, 'genitive', m[1]);
      return mo === null ? null : d1 + '.–' + d2 + '. ' + mo + ' ' + y;
    },
    /* "January 4, 2026" */
    dateFull: function (pack, m) {
      if (isNumeric(pack)) { var i = monthIndex(m[1]); return i === null ? null : numericDate(pack, m[2], i, m[3]); }
      var mo = month(pack, 'genitive', m[1]);
      return mo === null ? null : m[2] + '. ' + mo + ' ' + m[3];
    },
    /* "Jan 4, 2026 01:57 PM" */
    stamp: function (pack, m) {
      var time = to24(m[4], m[6]) + ':' + m[5];
      if (isNumeric(pack)) { var i = monthIndex(m[1]); return i === null ? null : numericDate(pack, m[2], i, m[3]) + ' ' + time; }
      var mo = month(pack, 'abbr', m[1]);
      return mo === null ? null : m[2] + '. ' + mo + ' ' + m[3] + ' ' + time;
    },
    /* "Sep 10 at 09:20 PM" — the timestamp in every payments list (products,
       transactions, orders...). No year, and an English "at". The SHAPE comes
       from pack.frames.dateTime, because the connective is language: Czech
       drops it ("10. 9. 21:20") — the preposition would be v/ve depending on
       how the hour is PRONOUNCED, which digits cannot tell you — while another
       language may want one. Same 24-hour clock as @stamp, which a native
       speaker has already confirmed. */
    monDayTime: function (pack, m) {
      var date;
      if (isNumeric(pack)) {
        var i = monthIndex(m[1]);
        if (i === null) return null;
        date = parseInt(m[2], 10) + '. ' + i + '.';
      } else {
        var mo = month(pack, 'genitive', m[1]);
        if (mo === null) return null;
        date = parseInt(m[2], 10) + '. ' + mo;
      }
      var time = to24(m[3], m[5]) + ':' + m[4];
      return ((pack.frames && pack.frames.dateTime) || '{date} {time}')
        .replace('{date}', date).replace('{time}', time);
    },
    /* "Every  month" / "Every 3 weeks" — a recurring invoice's schedule. The
       double space is HighLevel's: an interval of 1 renders as nothing.

       TWO SHAPES, because many languages have a one-word adverb for an
       interval of one ("Měsíčně", monthly) and a counted phrase otherwise.
       In Czech even the counted phrase inflects twice — the "each" word AND
       the unit follow the plural category: "Každé 2 měsíce", "Každých 5
       měsíců". So the pack supplies the adverbs, the unit's plural table, and
       one "each" frame per category. */
    everyInterval: function (pack, m) {
      var R = pack.recurrence;
      if (!R) return null;
      var n = m[1] ? parseInt(m[1], 10) : 1;
      var unit = String(m[2]).toLowerCase();
      if (n === 1) return (R.once && R.once[unit]) || null;
      var word = R.units && R.units[unit] ? pluralForm(pack, R.units[unit], n) : null;
      var each = R.each && (R.each[category(pack.locale, n)] || R.each.other);
      if (word === null || !each) return null;
      return each.replace('{n}', String(n)).replace('{unit}', word);
    },
    /* "Kč4,526.87" — a CZK amount in HighLevel's format. HighLevel knows the
       currency is Czech and still writes the number the American way: symbol
       first, comma thousands, dot decimal. Czech writes "4 526,87 Kč". Tom,
       11 Sep: "Kč4,526.87 is a disaster" — reported upstream, see the action
       list.

       ONLY REACHES TEXT THAT IS ALREADY OURS (Tom's decision, option 1): the
       invoice list's summary tiles, editor totals. Amount COLUMNS stay behind
       the firewall untouched — a blocked node never reaches this function —
       so lists keep HighLevel's format until that is decided separately.

       The shape comes from pack.number: the thousands separator, the decimal
       mark, and where the symbol goes. Czech uses a NON-BREAKING space both
       between thousands and before the symbol, so "4 526,87 Kč" never wraps
       across a line. The digits are regrouped, never recomputed — nothing
       here does arithmetic on money. */
    money: function (pack, m) {
      var N = pack.number;
      if (!N) return null;
      var whole = String(m[3]).replace(/,/g, '');
      if (!/^\d+$/.test(whole)) return null;
      var grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, N.group);
      var num = m[1] + grouped + (m[4] !== undefined && m[4] !== '' ? N.decimal + m[4] : '');
      var sym = (N.symbols && N.symbols[m[2]]) || m[2];
      return (N.money || '{n} {sym}').replace('{n}', num).replace('{sym}', sym);
    },
    /* "Recurring Every  month" — the recurring-invoice editor's summary line.
       The same schedule as @everyInterval, but inside a sentence, so the
       adverb loses its capital: "Opakuje se měsíčně", "Opakuje se každé 2
       měsíce". The frame comes from pack.recurrence.label. */
    recurringEvery: function (pack, m) {
      var every = FORMATTERS.everyInterval(pack, m);
      var R = pack.recurrence;
      if (every === null || !R || !R.label) return null;
      return R.label.replace('{every}', every.charAt(0).toLowerCase() + every.slice(1));
    },
    /* "Sep 2026" — a month LABEL, so it stays a name even in numeric mode */
    monYear: function (pack, m) {
      var mo = month(pack, 'full', m[1]);
      return mo === null ? null : mo + ' ' + m[2];
    },
    /* "Jan 4th, 1:57 pm" */
    ordStamp: function (pack, m) {
      var mo = month(pack, 'abbr', m[1]);
      if (mo === null) return null;
      return m[2] + '. ' + mo + ', ' + to24(m[3], m[5]) + ':' + m[4];
    },
    /* "Jan 4, 2026" */
    dateAbbr: function (pack, m) {
      if (isNumeric(pack)) { var i = monthIndex(m[1]); return i === null ? null : numericDate(pack, m[2], i, m[3]); }
      var mo = month(pack, 'genitiveAbbr', m[1]);
      return mo === null ? null : m[2] + '. ' + mo + ' ' + m[3];
    },
    /* "01:57 PM" */
    timeAmPm: function (pack, m) { return to24(m[1], m[3]) + ':' + m[2]; },
    /* "Jan 4, 2026 - Feb 8, 2026" */
    dateRange: function (pack, m) {
      if (isNumeric(pack)) {
        var a = monthIndex(m[1]), b = monthIndex(m[4]);
        if (a === null || b === null) return null;
        return numericDate(pack, m[2], a, m[3]) + ' – ' + numericDate(pack, m[5], b, m[6]);
      }
      var x = month(pack, 'abbr', m[1]), y = month(pack, 'abbr', m[4]);
      if (x === null || y === null) return null;
      return m[2] + '. ' + x + ' ' + m[3] + ' – ' + m[5] + '. ' + y + ' ' + m[6];
    },
    ago:     function (pack, m) { return relative(pack, parseInt(m[1], 10), m[2], SHORT_UNITS); },
    nameAgo: function (pack, m) {
      var r = relative(pack, parseInt(m[2], 10), m[3], SHORT_UNITS);
      return r === null ? null : m[1] + ' · ' + r;
    },
    relLong: function (pack, m) { return relative(pack, parseInt(m[1], 10), m[2], LONG_UNITS); },
    /* "(Last 3 months)" — unit word depends on which noun the source used */
    lastPeriod: function (pack, m) {
      var n = parseInt(m[1], 10);
      var word = pluralForm(pack, /month/i.test(m[2]) ? 'periodMonths' : 'periodDays', n);
      if (word === null) return null;
      return ((pack.frames && pack.frames.lastPeriod) || '({n} {unit})')
        .replace('{n}', String(n)).replace('{unit}', word);
    },
    /* "3 Invoice(s) in Draft" */
    invoices: function (pack, m) {
      var n = parseInt(m[1], 10);
      var noun = pluralForm(pack, 'invoices', n);
      var st = pack.maps && pack.maps.invoiceState && pack.maps.invoiceState[String(m[2]).toLowerCase()];
      if (noun === null || st === undefined) return null;
      /* A STATE WORD MAY HAVE TO AGREE WITH THE COUNT, so a pack can give
         either a plain string or a { one, few, other } set, the same shape as
         pack.plurals. Czech needs it for a participle: "1 faktura uhrazena",
         "3 faktury uhrazeny", "5 faktur uhrazeno". A prepositional state
         ("v konceptu", "k úhradě") does not change, and stays a string.

         Found on 11 Sep only because the account finally had exactly ONE paid
         invoice. With none, the tile read "0 faktur přijato", which is
         correct for zero — so the bug was invisible on every empty screen. */
      if (st && typeof st === 'object') {
        var agreed = st[category(pack.locale, n)];
        if (agreed === undefined) agreed = st.other;
        if (agreed === undefined) return null;
        st = agreed;
      }
      return m[1] + ' ' + noun + ' ' + st;
    }
  };

  /* ---------- names that are never translated ------------------------------
     A THIRD CATEGORY, and it is neither dictionary nor CONTENT_ZONES. These are
     interface text — they belong to the chrome, not to the customer — but they
     must render unchanged. The harvest walk found them sitting in the queue
     waiting to be translated by someone in a hurry.

     IT LIVES HERE, NOT IN A PACK, because a brand is a brand in Czech, Slovak
     and Polish alike. Every future language inherits the list for free. Same
     argument as the exemption rules generated by the gap picker.

     A SET RATHER THAN IDENTITY ENTRIES IN THE GLOSSARY: "LinkedIn": "LinkedIn"
     would look like unfinished work to anyone auditing the pack, and a reviewer
     would eventually "fix" it.

     DELIBERATELY NOT LISTED: Threads, Square and X. Each is also an ordinary
     word — conversation threads, a shape, a letter — and blocking them here
     would leave real interface text in English somewhere else in the product.
     A brand that collides with a common noun is better handled where it appears
     than globally. Tom's reviewer made the same call about the Integrations
     page: "Built by" is company names, the rest of the page is not. */
  var NEVER = {};
  ('Facebook,Instagram,WhatsApp,Messenger,LinkedIn,TikTok,YouTube,Pinterest,Bluesky,' +
   'Google,Google Ads,Google Analytics,Gmail,Stripe,PayPal,Quickbooks,QuickBooks,' +
   'Authorize.net,NMI,Mercado Pago,Zapier,Slack,Shopify,WordPress,Yext,Twilio,' +
   'Mailgun,LeadConnector,HighLevel,Gokollab,Gokollab Marketplace,Zoom,Calendly,' +
   'OpenAI,Anthropic,Claude,SMS,MMS,UTM,CPC,CTR,SEO,HTML,CSS,API,URL,PDF,CSV,' +
   /* ISO currency codes — identifiers, identical in every language. Added
      11 Sep when the test account switched to CZK and "CZK" / "USD" began
      turning up in the harvest queue as gaps. */
   'CZK,USD,EUR,GBP,' +
   /* accounting providers on Payments > Accounting sync, and the captcha badge */
   'Xero,Wave,Intuit,reCAPTCHA,' +
   /* raw booleans HighLevel sometimes prints as an aria-label */
   'true,false,' +
   /* the rich-text editor's font name, the search box's shortcut hint, and a
      currency symbol standing alone in a price field's prefix. Every sweep
      reported all three. */
   'Inter,ctrlK,Kč'
  ).split(',').forEach(function (n) { NEVER[n.toLowerCase()] = n; });

  /* Returns the string unchanged when it must never be translated, else null.
     The engine returns that value rather than null so the string is marked as
     handled: null would mean "miss", and every brand name would then pile up in
     the harvest queue for ever.

     RETURNS THE STRING EXACTLY AS IT ARRIVED, not the canonical spelling. An
     earlier version handed back the tidy form and turned HighLevel's
     "Quickbooks" into "QuickBooks" — a correction nobody asked for, made by a
     translation layer, in someone else's product. "Never translate" has to mean
     leave it alone. */
  function neverTranslate(s) {
    var t = String(s).trim();
    return Object.prototype.hasOwnProperty.call(NEVER, t.toLowerCase()) ? t : null;
  }

  /* ---------- entry point --------------------------------------------------
     source : a lang/source-*.js rule set (regexes for the rendered language)
     pack   : a lang/<locale>.js target pack (every emitted word)
     ctx    : { plain(str), translate(str) } glossary hooks
     Returns the translated string, or null meaning "leave the DOM alone".   */
  function applyRules(source, pack, key, ctx) {
    var rules = source.rules, ov = pack.ruleOverrides || null;
    for (var i = 0; i < rules.length; i++) {
      var id = rules[i][0], re = rules[i][1], h = rules[i][2];
      if (ov && Object.prototype.hasOwnProperty.call(ov, id)) {
        var o = ov[id];
        if (!o) continue;                       /* target opted out of this rule */
        if (o.re) re = o.re;
        if (o.h !== undefined) h = o.h;
      }
      var m = re.exec(key);
      if (!m) continue;
      var out;
      if (h && h.charAt(0) === '@') {
        var fn = FORMATTERS[h.slice(1)];
        out = fn ? fn(pack, m) : null;
      } else {
        var tpl = pack.patterns && pack.patterns[id];
        out = tpl === undefined ? null : expand(pack, tpl, m, ctx);
      }
      if (out !== null && out !== undefined) return out;
      /* matched but produced nothing -> keep trying, exactly as v27 did when a
         nested glossary lookup missed */
    }
    return null;
  }

  var api = {
    applyRules: applyRules,
    category: category,
    pluralForm: pluralForm,
    neverTranslate: neverTranslate,
    FORMATTERS: FORMATTERS
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  /* __kaRules is the name; I18nRules is the pre-v76 alias, kept one release so a
     cached engine still finds it. Remove with the fallback in activate(). */
  else { root.__kaRules = api; root.I18nRules = api; }
})(typeof window !== 'undefined' ? window : globalThis);
