/* =============================================================================
   lang/source-en.js — the ENGLISH SOURCE rule set

   WHY THIS IS A SOURCE FILE AND NOT PART OF THE ENGINE, and not part of a
   target pack either:

   These regexes match what HIGHLEVEL RENDERS. That is a property of the
   platform language the user is on, not of the language we translate into.
     · Czech, Slovak and Polish targets all read the same English "Page 1 of 5",
       so putting rules in a target pack would copy 52 regexes into every pack
       and guarantee they drift apart.
     · An agency whose platform language is Spanish renders "Página 1 de 5",
       which none of these match. That needs source-es.js — a sibling of this
       file, paired with the SAME target packs.
   Source × target is therefore N+M files, not N×M: one rule set per source
   language, one pack per target language.

   A target pack can still opt out of, or replace, any rule here — see
   `ruleOverrides` in i18n-rules.js. That covers the case where a rule is
   right for the source but produces bad output in one particular target.

   ORDER IS LOAD-BEARING. "0 Contacts Selected" must be tested before
   "0 Contacts", or the longer string never reaches its own rule. Do not sort
   this list. Handlers: '@name' selects a formatter in the engine; omitted
   means "expand pack.patterns[id] as a template".
============================================================================= */

(function (root) {
  'use strict';

  var source = {
    id: 'en',
    name: 'English',

    rules: [
      ['DATE_RE',        /^(January|February|March|April|May|June|July|August|September|October|November|December) (\d{1,2}), (\d{4})$/, '@dateFull'],
      ['COUNT_ITEMS',    /^(\d+)\s+items?$/i],
      ['COUNT_COLON',    /^(.+?):\s*(\d+)$/],
      ['COUNT_PAREN',    /^(.+?)\s*\((\d+(?:\/\d+)?)\)$/],
      ['COLS_RATIO',     /^(\d+)\/(\d+)\s+columns?$/i],
      ['PLUS_MORE',      /^\+(\d+)\s+more$/i],
      ['PAGE_OF',        /^Page\s+(\d+)\s+of\s+(\d+)$/i],
      ['SHOW_PAGE',      /^Show\s+Page\s+(\d+)$/i],
      ['SELECT_ALL_N',   /^Select\s+all\s+(\d+)$/i],
      ['N_CONTACTS_SEL', /^(\d+)\s+Contacts?\s+Selected$/i],
      ['N_CONTACTS',     /^(\d+)\s+Contacts?$/i],
      ['N_TASKS_SEL',    /^(\d+)\s+Tasks?\s+Selected$/i],
      ['N_TASKS',        /^(\d+)\s+Tasks?$/i],
      ['N_COMP_SEL',     /^(\d+)\s+Companies\s+Selected$/i],
      ['N_COMP',         /^(\d+)\s+Companies$/i],
      ['PAGE_N',         /^Page\s+(\d+)$/i],
      ['N_SELECTED',     /^(\d+)\s+selected$/i],
      ['CAL_GREETING',   /^Hi\s+(.+?)!\s*I'm your calendar setup assistant\.\s*What would you like to do\?$/i],
      ['LAST_PERIOD',    /^\(Last\s+(\d+)\s+(month|months|day|days)\)$/i, '@lastPeriod'],
      ['N_PRODUCTS',     /^(\d+)\s+Products?$/i],
      ['N_INVOICES',     /^(\d+)\s+Invoice\(s\)\s+(in Draft|in Due|received|Overdue)$/i, '@invoices'],
      ['REMOVE_FILT',    /^Remove filter:\s*(.+)$/i],
      ['RANGE_OF',       /^(\d+)\s*-\s*(\d+)\s+of\s+(\d+)$/i],
      ['STAMP',          /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{1,2}),\s*(\d{4})\s+(\d{1,2}):(\d{2})\s*(AM|PM)$/i, '@stamp'],
      ['MON_YEAR',       /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{4})$/, '@monYear'],
      ['N_OPPS',         /^(\d+)\s+opportunit(?:y|ies)$/i],
      ['N_PIPES',        /^(\d+)\s+pipelines?$/i],
      ['N_APPLIED',      /^(\d+)\s+applied$/i],
      ['OUT_OF',         /^(.+?)\s*\((\d+)\s+out of\s+(\d+)\)$/i],
      ['POS_OF',         /^Currently at position (\d+) of (\d+)$/i],
      ['DEL_PIPE',       /^Delete pipeline\s+[“"](.+)[”"]\?$/],
      ['UNSAVED_N',      /^You have (\d+) unsaved change\(s\)$/i],
      ['PIPE_DASH',      /^Pipeline - (.+)$/],
      ['ORD_STAMP',      /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{1,2})(?:st|nd|rd|th),\s*(\d{1,2}):(\d{2})\s*(am|pm)$/i, '@ordStamp'],
      ['DATE_ABBR',      /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{1,2}),\s*(\d{4})$/, '@dateAbbr'],
      ['TIME_AMPM',      /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i, '@timeAmPm'],
      ['N_NEW',          /^(\d+)\s+new$/i],
      ['AGO',            /^(\d+)\s*([smhdw])\s+ago$/i, '@ago'],
      ['NAME_AGO',       /^(.+?)\s*·\s*(\d+)\s*([smhdw])\s+ago$/i, '@nameAgo'],
      ['APPROX_COST',    /^Approximate Cost:\s*(\$[\d.,]*)$/i],
      ['CHARS_WORDS',    /^(\d+)\s+characters?\s*\|\s*(\d+)\s+words?$/i],
      ['SEGS',           /^\|\s*(\d+)\s+segs?$/i],
      ['PER_PAGE',       /^(\d+)\s*\/\s*page$/i],
      ['SHOWING_OF',     /^Showing (\d+) to (\d+) of (\d+) results?$/i],
      ['N_HRS',          /^(\d+)\s*Hrs?$/i],
      ['TOTAL_MEM',      /^(\d+)\s+total members?$/i],
      ['REL_LONG',       /^(\d+)\s+(second|minute|hour|day|week|month)s?\s+ago$/i, '@relLong'],
      ['LAST_UPD',       /^Last updated:\s*(.+)$/i],
      ['BYTES_USED',     /^([\d.,]+)\s*(Bytes|B|KB|MB|GB|TB)\s+used$/i],
      ['N_ACCOUNTS',     /^(\d+)\s+Accounts?$/i],
      ['DATE_RANGE',     /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{1,2}),\s*(\d{4})\s*-\s*(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{1,2}),\s*(\d{4})$/, '@dateRange'],
      ['ABBR_PAREN',     /^(.+?)\s*\(\s*([A-Z]{2,6})\s*\)$/]
    ]
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = source;
  else { root.GhlSourceRules = root.GhlSourceRules || {}; root.GhlSourceRules.en = source; }
})(typeof window !== 'undefined' ? window : globalThis);
