(function (root) {
  'use strict';
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
                      day: 'agoDays', week: 'agoWeeks', month: 'agoMonths',
                      year: 'agoYears', _default: 'agoMonths' };
  function month(pack, which, token) {
    var t = pack.months && pack.months[which];
    if (!t) return null;
    var k = String(token);
    if (t[k] !== undefined) return t[k];
    var lk = k.toLowerCase();
    return t[lk] !== undefined ? t[lk] : null;
  }
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
  function weekday(pack, which, token) {
    var t = pack.weekdays && pack.weekdays[which];
    if (!t) return null;
    var k = String(token).slice(0, 3).toLowerCase();
    return t[k] !== undefined ? t[k] : null;
  }
  var FORMATTERS = {
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
    createdOnStampDmy: function (pack, m) {
      return FORMATTERS.createdOnStamp(pack, [m[0], m[2], m[1], m[3], m[4], m[5], m[6], m[7]]);
    },
    overdueSlash: function (pack, m) {
      var f = pack.frames && pack.frames.overdue;
      return f ? f.replace('{date}', numericDate(pack, m[2], parseInt(m[1], 10), m[3])) : null;
    },
    monDay: function (pack, m) {
      if (isNumeric(pack)) {
        var i = monthIndex(m[1]);
        return i === null ? null : parseInt(m[2], 10) + '. ' + i + '.';
      }
      var mo = month(pack, 'genitive', m[1]);
      return mo === null ? null : parseInt(m[2], 10) + '. ' + mo;
    },
    monDayYear: function (pack, m) {
      var i = monthIndex(m[1]);
      if (i === null) return null;
      if (isNumeric(pack)) return numericDate(pack, m[2], i, m[3]);
      var mo = month(pack, 'genitive', m[1]);
      return mo === null ? null : parseInt(m[2], 10) + '. ' + mo + ' ' + m[3];
    },
    dayWeekday: function (pack, m) {
      var w = weekday(pack, 'abbr', m[2]);
      return w === null ? null : m[1] + ' ' + w;
    },
    hourLabel: function (pack, m) { return to24(m[1], m[2]) + ':00'; },
    dayRangeInMonth: function (pack, m) {
      var d1 = parseInt(m[2], 10), d2 = parseInt(m[3], 10), y = m[4];
      if (isNumeric(pack)) {
        var i = monthIndex(m[1]);
        return i === null ? null : d1 + '.–' + d2 + '. ' + i + '. ' + y;
      }
      var mo = month(pack, 'genitive', m[1]);
      return mo === null ? null : d1 + '.–' + d2 + '. ' + mo + ' ' + y;
    },
    dateFull: function (pack, m) {
      if (isNumeric(pack)) { var i = monthIndex(m[1]); return i === null ? null : numericDate(pack, m[2], i, m[3]); }
      var mo = month(pack, 'genitive', m[1]);
      return mo === null ? null : m[2] + '. ' + mo + ' ' + m[3];
    },
    stamp: function (pack, m) {
      var time = to24(m[4], m[6]) + ':' + m[5];
      if (isNumeric(pack)) { var i = monthIndex(m[1]); return i === null ? null : numericDate(pack, m[2], i, m[3]) + ' ' + time; }
      var mo = month(pack, 'abbr', m[1]);
      return mo === null ? null : m[2] + '. ' + mo + ' ' + m[3] + ' ' + time;
    },
    stampDayFirst: function (pack, m) {
      return FORMATTERS.stamp(pack, [m[0], m[2], String(+m[1]), m[3], m[4], m[5], m[6]]);
    },
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
      var h = to24(m[3], m[5]);
      var time = h + ':' + m[4];
      var frame = (pack.frames && pack.frames.dateTime) || '{date} {time}';
      var at = '';
      if (frame.indexOf('{at}') !== -1 && pack.timePrep) {
        var hn = parseInt(h, 10);
        var longHours = pack.timePrep.long || [];
        var isLong = false;
        for (var i2 = 0; i2 < longHours.length; i2++) if (longHours[i2] === hn) isLong = true;
        at = isLong ? (pack.timePrep.longWord || '') : (pack.timePrep.word || '');
      }
      return frame.replace('{date}', date).replace('{at}', at).replace('{time}', time);
    },
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
    recurringEvery: function (pack, m) {
      var every = FORMATTERS.everyInterval(pack, m);
      var R = pack.recurrence;
      if (every === null || !R || !R.label) return null;
      return R.label.replace('{every}', every.charAt(0).toLowerCase() + every.slice(1));
    },
    monYear: function (pack, m) {
      var mo = month(pack, 'full', m[1]);
      return mo === null ? null : mo + ' ' + m[2];
    },
    ordStamp: function (pack, m) {
      var mo = month(pack, 'abbr', m[1]);
      if (mo === null) return null;
      return m[2] + '. ' + mo + ', ' + to24(m[3], m[5]) + ':' + m[4];
    },
    dateAbbr: function (pack, m) {
      if (isNumeric(pack)) { var i = monthIndex(m[1]); return i === null ? null : numericDate(pack, m[2], i, m[3]); }
      var mo = month(pack, 'genitiveAbbr', m[1]);
      return mo === null ? null : m[2] + '. ' + mo + ' ' + m[3];
    },
    dateDayFirst: function (pack, m) {
      return FORMATTERS.dateAbbr(pack, [m[0], m[2], String(+m[1]), m[3]]);
    },
    timeAmPm: function (pack, m) { return to24(m[1], m[3]) + ':' + m[2]; },
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
    lastPeriod: function (pack, m) {
      var n = parseInt(m[1], 10);
      var word = pluralForm(pack, /month/i.test(m[2]) ? 'periodMonths' : 'periodDays', n);
      if (word === null) return null;
      return ((pack.frames && pack.frames.lastPeriod) || '({n} {unit})')
        .replace('{n}', String(n)).replace('{unit}', word);
    },
    invoices: function (pack, m) {
      var n = parseInt(m[1], 10);
      var noun = pluralForm(pack, 'invoices', n);
      var st = pack.maps && pack.maps.invoiceState && pack.maps.invoiceState[String(m[2]).toLowerCase()];
      if (noun === null || st === undefined) return null;
      if (st && typeof st === 'object') {
        var agreed = st[category(pack.locale, n)];
        if (agreed === undefined) agreed = st.other;
        if (agreed === undefined) return null;
        st = agreed;
      }
      return m[1] + ' ' + noun + ' ' + st;
    }
  };
  var NEVER = {};
  ('Facebook,Instagram,WhatsApp,Messenger,LinkedIn,TikTok,YouTube,Pinterest,Bluesky,' +
   'Google,Google Ads,Google Analytics,Gmail,Stripe,PayPal,Quickbooks,QuickBooks,' +
   'Authorize.net,NMI,Mercado Pago,Zapier,Slack,Shopify,WordPress,Yext,Twilio,' +
   'Mailgun,LeadConnector,HighLevel,Gokollab,Gokollab Marketplace,Zoom,Calendly,' +
   'OpenAI,Anthropic,Claude,SMS,MMS,UTM,CPC,CTR,SEO,HTML,CSS,API,URL,PDF,CSV,' +
   'CZK,USD,EUR,GBP,' +
   'Xero,Wave,Intuit,reCAPTCHA,' +
   'Inter,ctrlK,Kč,' +
   'CPS,CPL,ROI %,Agent Studio,Calendar AI,https://,http://,' +
   'Printful,Printify,Shippo,Shipstation,Clio,Google Calendar,Google Lead Ads,' +
   'Google Merchant Center,TikTok Messaging,TikTok Lead Ads,API v2.0,Canva,' +
   'WooCommerce,ClickUp,Notion,Google Contacts,Airtable,BaseCamp,Basecamp,Typeform,' +
   'Asana,Google Forms,Monday.com,OpenRouter,Manus,Fathom,Apify,Mistral AI,' +
   'Todoist,Cal.com,HubSpot,Klaviyo,Browse AI,Housecall Pro,Jira,Jotform,' +
   'abc def ghi jkl mno pqr stu'
  ).split(',').forEach(function (n) { NEVER[n.toLowerCase()] = n; });
  function neverTranslate(s) {
    var t = String(s).trim();
    return Object.prototype.hasOwnProperty.call(NEVER, t.toLowerCase()) ? t : null;
  }
  var PREFILL_DEFAULTS = {};
  ('New smart list,New Invoice,New Recurring Invoice'
  ).split(',').forEach(function (n) { PREFILL_DEFAULTS[n] = 1; });
  function isPrefillDefault(s) {
    return Object.prototype.hasOwnProperty.call(PREFILL_DEFAULTS, String(s).trim());
  }
  function applyRules(source, pack, key, ctx) {
    var rules = source.rules, ov = pack.ruleOverrides || null;
    for (var i = 0; i < rules.length; i++) {
      var id = rules[i][0], re = rules[i][1], h = rules[i][2];
      if (ov && Object.prototype.hasOwnProperty.call(ov, id)) {
        var o = ov[id];
        if (!o) continue;
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
    }
    return null;
  }
  var api = {
    applyRules: applyRules,
    category: category,
    pluralForm: pluralForm,
    neverTranslate: neverTranslate,
    isPrefillDefault: isPrefillDefault,
    prefillDefaults: Object.keys(PREFILL_DEFAULTS),
    FORMATTERS: FORMATTERS
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else { root.__kaRules = api; }
})(typeof window !== 'undefined' ? window : globalThis);
