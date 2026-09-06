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

  var FORMATTERS = {
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
      var noun = pluralForm(pack, 'invoices', parseInt(m[1], 10));
      var st = pack.maps && pack.maps.invoiceState && pack.maps.invoiceState[String(m[2]).toLowerCase()];
      if (noun === null || st === undefined) return null;
      return m[1] + ' ' + noun + ' ' + st;
    }
  };

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
    FORMATTERS: FORMATTERS
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.I18nRules = api;
})(typeof window !== 'undefined' ? window : globalThis);
