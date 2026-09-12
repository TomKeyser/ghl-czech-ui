/* =============================================================================
   intl-format.js — locale-agnostic formatting for the HighLevel language layer

   REPLACES, in ghlczechui.js v25:
     czPlural(n, one, few, many)          -> plural(locale, n) + a CLDR forms map
     STAMP + MONTH_ABBR + MON_FULL_CZ
       + MONTH_GEN + MONTH_GEN_ABBR       -> formatStamp(locale, text)
     hand-written number handling         -> formatNumber(locale, n)

   WHY: those three carry Czech grammar inside engine code, so adding a language
   means writing new grammar. Every browser already ships CLDR data for all of
   it. After this change a new language is a JSON file, not a code change.

   No dependencies. Safe in any browser with Intl (all of them since ~2017).
   Every function is total: bad input returns null and the caller leaves the
   DOM alone, which is the engine's existing contract.
============================================================================= */

(function (root) {
  'use strict';

  /* ---------- plural ------------------------------------------------------
     Intl.PluralRules returns a CLDR category: one | two | few | many | other.
     Czech uses one (1), few (2-4), many (fractions), other (0, 5+).
     Polish, Russian and Slovak each differ — and none of that is our problem
     any more, because the browser knows.                                    */
  var prCache = {};
  function plural(locale, n) {
    try {
      var pr = prCache[locale] || (prCache[locale] = new Intl.PluralRules(locale));
      return pr.select(n);
    } catch (e) { return 'other'; }
  }

  /* forms is { one, few, many, other, two? } from the locale's target file.
     Falls back through the CLDR chain so a partial forms map still works.   */
  function pluralize(locale, n, forms) {
    if (!forms) return null;
    var cat = plural(locale, n);
    var v = forms[cat];
    if (v === undefined) v = forms.other;
    if (v === undefined) v = forms.many;
    if (v === undefined) v = forms.one;
    return v === undefined ? null : String(v).replace('{n}', formatNumber(locale, n));
  }

  /* ---------- numbers ----------------------------------------------------
     1,000 in English is 1 000 in Czech and 1.000 in German. Free.           */
  var nfCache = {};
  function formatNumber(locale, n, opts) {
    if (typeof n !== 'number' || !isFinite(n)) return String(n);
    var key = locale + '|' + JSON.stringify(opts || null);
    try {
      var nf = nfCache[key] || (nfCache[key] = new Intl.NumberFormat(locale, opts || undefined));
      return nf.format(n);
    } catch (e) { return String(n); }
  }

  /* ---------- dates ------------------------------------------------------- */
  var MONTHS = { jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
                 jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11 };

  /* HighLevel renders American formats. These are the shapes seen in the wild:
       "Aug 31, 2026 01:57 PM"   "Sep 4, 2026"   "07:13 PM"
     parseEnglish returns { date, hasDate, hasTime } or null.                 */
  var RE_STAMP = /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{1,2}),\s*(\d{4})(?:\s+(\d{1,2}):(\d{2})\s*(AM|PM))?$/i;
  var RE_TIME  = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i;

  function parseEnglish(text) {
    var s = String(text).trim(), m;
    if ((m = s.match(RE_STAMP))) {
      var mon = MONTHS[m[1].toLowerCase()];
      var day = +m[2], year = +m[3];
      var hasTime = m[4] !== undefined;
      var h = 0, min = 0;
      if (hasTime) {
        h = +m[4] % 12;
        if (/pm/i.test(m[6])) h += 12;   /* 12 AM -> 0, 12 PM -> 12 */
        min = +m[5];
      }
      var d = new Date(year, mon, day, h, min);
      if (isNaN(d.getTime()) || d.getDate() !== day) return null;
      return { date: d, hasDate: true, hasTime: hasTime };
    }
    if ((m = s.match(RE_TIME))) {
      var hh = +m[1] % 12;
      if (/pm/i.test(m[3])) hh += 12;
      var t = new Date(2000, 0, 1, hh, +m[2]);
      if (isNaN(t.getTime())) return null;
      return { date: t, hasDate: false, hasTime: true };
    }
    return null;
  }

  var dtCache = {};
  function dtf(locale, opts) {
    var key = locale + '|' + JSON.stringify(opts);
    return dtCache[key] || (dtCache[key] = new Intl.DateTimeFormat(locale, opts));
  }

  /* ---------- date style, per locale --------------------------------------
     'numeric' -> 31. 8. 2026      'short' -> 31 sie 2026      'long' -> 31. srpna 2026

     TWO SEPARATE CONCERNS, AND CONFLATING THEM IS THE MISTAKE TO AVOID:

       DATE STAMPS  — a rendered date like "31. 8. 2026". Style is a per-locale
                      CHOICE, set below or from the target file. Czech is
                      numeric, confirmed by a native speaker.
       NAME LABELS  — monthNames.*, monthNamesShort.*, schedule.days.* and chart
                      axes. These are ALWAYS names, in EVERY language. There is
                      no locale where a month dropdown reading "1, 2, 3" is
                      correct, so this is deliberately NOT configurable.

     Czech is pinned rather than left to CLDR: cs 'short' happens to resolve
     numeric today, but that is the library agreeing with us by coincidence and
     an ICU update could start emitting month names under us.

     Default is numeric because that is the majority convention; override per
     locale in the map, or — preferably — let each target file declare its own
     via configure(), so adding a language stays a data change.               */
  var DATE_STYLE = { cs: 'numeric', sk: 'numeric' };
  var DEFAULT_DATE_STYLE = 'numeric';

  var MONTH_FIELD = { numeric: 'numeric', short: 'short', long: 'long' };

  /* configure({ dateStyle: { pl: 'short', de: 'long' } })
     Also accepts a whole target file: configure(csCZ) picks up a top-level
     "dateStyle" plus its "locale", so the JSON owns its own convention.      */
  function configure(cfg) {
    if (!cfg) return;
    if (cfg.dateStyle && typeof cfg.dateStyle === 'object') {
      for (var k in cfg.dateStyle) {
        if (MONTH_FIELD[cfg.dateStyle[k]]) DATE_STYLE[k] = cfg.dateStyle[k];
      }
    } else if (typeof cfg.dateStyle === 'string' && cfg.locale && MONTH_FIELD[cfg.dateStyle]) {
      DATE_STYLE[cfg.locale] = cfg.dateStyle;
      DATE_STYLE[String(cfg.locale).split('-')[0]] = cfg.dateStyle;
    }
    if (cfg.defaultDateStyle && MONTH_FIELD[cfg.defaultDateStyle]) {
      DEFAULT_DATE_STYLE = cfg.defaultDateStyle;
    }
  }

  function dateStyleFor(locale) {
    var base = String(locale || '').split('-')[0];
    return DATE_STYLE[locale] || DATE_STYLE[base] || DEFAULT_DATE_STYLE;
  }

  /* Reformat an American date/time string into the target locale.
     Returns null when the input is not one of the recognised shapes, so the
     caller can leave the node untouched — the engine's existing contract.
     `style` overrides the per-locale default; omit it in normal use.         */
  function formatStamp(locale, text, style) {
    var p = parseEnglish(text);
    if (!p) return null;
    try {
      var month = MONTH_FIELD[style || dateStyleFor(locale)] || 'numeric';
      var dateOpts = { day: 'numeric', month: month, year: 'numeric' };
      var timeOpts = { hour: '2-digit', minute: '2-digit' };
      if (p.hasDate && p.hasTime) {
        var o = {}; for (var k in dateOpts) o[k] = dateOpts[k];
        for (var j in timeOpts) o[j] = timeOpts[j];
        return dtf(locale, o).format(p.date);
      }
      if (p.hasDate) return dtf(locale, dateOpts).format(p.date);
      return dtf(locale, timeOpts).format(p.date);
    } catch (e) { return null; }
  }

  /* Month name lists, for the monthNames / monthNamesShort keys that
     HighLevel exposes. Generated, not hand-written.                          */
  function monthNames(locale, style) {
    var out = {}, f = dtf(locale, { month: style || 'long' });
    var names = ['january','february','march','april','may','june',
                 'july','august','september','october','november','december'];
    for (var i = 0; i < 12; i++) out[names[i]] = f.format(new Date(2000, i, 1));
    return out;
  }

  function weekdayNames(locale, style) {
    var out = [], f = dtf(locale, { weekday: style || 'long' });
    /* 2024-01-07 was a Sunday */
    for (var i = 0; i < 7; i++) out.push(f.format(new Date(2024, 0, 7 + i)));
    return out;
  }

  var api = {
    plural: plural,
    pluralize: pluralize,
    formatNumber: formatNumber,
    parseEnglish: parseEnglish,
    formatStamp: formatStamp,
    configure: configure,
    dateStyleFor: dateStyleFor,
    /* NOTE monthNames/weekdayNames are for the monthNames.* and schedule.days.*
       dictionary KEYS — standalone labels in pickers, dropdowns and chart axes.
       Those stay as names in every locale; a month dropdown reading "1, 2, 3"
       would be worse, not more Czech. The numeric rule above governs formatted
       DATE STAMPS only. */
    monthNames: monthNames,
    weekdayNames: weekdayNames
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.IntlFormat = api;
})(typeof window !== 'undefined' ? window : globalThis);
