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
      /* Calendar furniture. Found by the automated walk on 10 Sep: the
         Calendars screen produced 106 misses, and almost every one was a clock
         or a weekday rather than a word. These three rules replace 33 of them,
         and no dictionary entry could have done it -- "1 PM" is 13:00 in Czech,
         not a translation. */
      /* A STATUS PREFIX ON A USER-NAMED RECORD. Tom's note on the pick said it
         exactly: "(Drafted) only, the rest of the line is user defined". The
         template passes the capture through untouched, so "(Drafted) Boxing
         Class" becomes "(Koncept) Boxing Class" and the calendar keeps the name
         its owner gave it. A dictionary entry could never do this, and blocking
         the element would lose the status word. */
      /* COMPOSED DATE LINES — the shape the native reviewer flagged in
         Reporting: a label, a US-format stamp and a timezone, all in one
         string. No dictionary entry can reach any of it.

         The zone is passed through unchanged: it is the account's real setting
         and varies per sub-account. Writing zones into a pack is precisely the
         mistake that has a competitor shipping "Created (BST)" to a CEST
         location, where the header then stays English because of a timezone. */
      ['CREATED_ON_TZ',  /^Created on:\s*(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{1,2})\s+(\d{4}),\s*(\d{1,2}):(\d{2})\s*(AM|PM)(?:\s*\(([A-Za-z]{2,5})\))?$/i, '@createdOnStamp'],
      ['OVERDUE_SLASH',  /^Overdue\s*-\s*(\d{1,2})\/(\d{1,2})\/(\d{4})$/i, '@overdueSlash'],
      ['MON_DAY',        /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{1,2})$/i, '@monDay'],
      /* ACTIVITY FEED on contact detail. Inspected before writing these: the
         line arrives as THREE separate text nodes, not one string --
           [Opportunity Zz Test R] [moved] [from A → B in C]
         so "moved" is a plain dictionary entry and only the third node needs a
         pattern. Had it been one node, all of it would have been one rule; had
         it been five, none of it could have been. Check the node structure
         before writing a rule for any composed line.

         Captures pass through with {1}: every one of them is a pipeline, stage
         or opportunity name its owner chose. */
      ['ACT_MOVE_LINE',  /^from (.+?) → (.+?) in (.+)$/],
      ['ACT_IN_STAGE',   /^in (.+?) - (.+)$/],
      /* NOT an interface label. The opportunity modal's first tab is
         "Opportunity details", and this rule turned it into "Příležitost
         details" (found 11 Sep, v92). A dictionary entry now takes that string
         first, and the lookahead refuses the lower-case interface words that
         follow "Opportunity" in HighLevel's own labels. A record name is
         whatever its owner typed, so this can only be a blocklist. */
      ['ACT_OPP_NAMED',  /^Opportunity (?!(?:details|name|value|source|owner|status|stage|stages|pipeline|fields|settings|list|card|cards|notes|tasks|payments|appointments|created|updated|deleted|moved|won|lost|abandoned|open)\b)(.+)$/],
      /* The two compose, so the combination gets its own rule rather than
         nesting a translate() call inside the template. Passing the capture
         through {*1} would work here and would also run the dictionary over
         user-named records -- a calendar called "Manual" would be rewritten.
         An explicit rule costs one line and touches no name. Must precede
         CAL_DRAFTED, which would otherwise match first and stop. */
      ['CAL_DRAFT_PERS', /^\(Drafted\)\s+(.+)['’]s Personal Calendar$/i],
      ['CAL_DRAFTED',    /^\(Drafted\)\s+(.+)$/i],
      /* "tom keyser's Personal Calendar" — a possessive around a person's name.
         Rendered as a dash rather than a Czech possessive, because declining a
         name we did not author goes wrong in a language with seven cases. */
      ['CAL_PERSONAL',   /^(.+)['’]s Personal Calendar$/i],
      ['CAL_DAY_COL',    /^(\d{1,2})\s+(Mon|Tue|Wed|Thu|Fri|Sat|Sun)$/i, '@dayWeekday'],
      ['CAL_HOUR',       /^(\d{1,2})\s*(AM|PM)$/i, '@hourLabel'],
      ['CAL_DAY_RANGE',  /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{1,2})\s*[–-]\s*(\d{1,2}),\s*(\d{4})$/i, '@dayRangeInMonth'],
      ['STAMP',          /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{1,2}),\s*(\d{4})\s+(\d{1,2}):(\d{2})\s*(AM|PM)$/i, '@stamp'],
      /* "September 10, 2026 09:20 PM" — the product editor's Created/Updated,
         11 Sep. The FULL month name and no comma after the year, so STAMP
         cannot see it. Same formatter: monthIndex reads the first three
         letters, so "September" and "Sep" land on the same month. A separate
         rule rather than a widened STAMP, so the reviewed output of that one
         cannot move. */
      /* day first: "04 Sep 2026 / 07:13 PM" (tags), "9 Sep 2026, 1:47 PM"
         (knowledge base) */
      /* "Sep 5 2026, 8:00 AM" — no comma after the day, one after the year
         (a task's due line in the opportunity modal). Same captures as STAMP. */
      ['STAMP_YEAR_COMMA', /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{1,2})\s+(\d{4}),\s*(\d{1,2}):(\d{2})\s*(AM|PM)$/i, '@stamp'],
      /* "Due: Sep 5 2026, 8:00 AM (PDT)" — a TASK's due line, so the task word */
      ['DUE_TZ',         /^Due:\s*(.+?)\s+\(([A-Z]{2,5})\)$/],
      /* "8:00 AM – 8:30 AM" — an appointment slot. Each end goes back through
         TIME_AMPM, so the 24-hour clock is the same everywhere. */
      ['TIME_RANGE',     /^(\d{1,2}:\d{2}\s*[AP]M)\s*[–-]\s*(\d{1,2}:\d{2}\s*[AP]M)$/i],
      /* "Created On: Sep 4, 2026 9:34 PM (PDT)" — the task drawer's footer */
      ['CREATED_ON_TZ',  /^Created On:\s*(.+?)\s+\(([A-Z]{2,5})\)$/],
      /* "Delete Tax - ZZ DPH 12 %" — the confirm dialog; the tax name is the
         business's own and passes through raw */
      ['DELETE_TAX',     /^Delete Tax - (.+)$/],
      /* 'Edit "Zz Test Quebec"' — the opportunity modal's title. The quoted part
         is the record's name and passes through raw. */
      ['EDIT_QUOTED',    /^Edit\s+"(.+)"$/],
      ['STAMP_DAY_FIRST', /^(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{4})\s*[\/,]\s*(\d{1,2}):(\d{2})\s*(AM|PM)$/i, '@stampDayFirst'],
      ['STAMP_FULL',     /^(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2}),\s*(\d{4}),?\s+(\d{1,2}):(\d{2})\s*(AM|PM)$/i, '@stamp'],
      /* THE TAX LINE ON AN INVOICE, 11 Sep — the business's tax NAME wrapped in
         HighLevel's wording. Two shapes, one per pricing mode:
           "ZZ DPH 21 % (21% - included in prices)"   tax inside the price
           "ZZ DPH 12 % (12% on $100.00)"             tax added on top
         {1} is the business's own tax name and passes through RAW — never {*1},
         which would run the dictionary over it and rewrite a tax someone
         called "Standard". Specific enough to be safe: "included in prices"
         and "% on" do not turn up by accident. */
      ['TAX_INCLUDED',   /^(.+)\s\((\d+(?:\.\d+)?)%\s-\sincluded in prices\)$/i],
      ['TAX_ON',         /^(.+)\s\((\d+(?:\.\d+)?)%\son\s(.+)\)$/i],
      /* "Kč4,526.87", "Kč0.00", "-Kč12.00" — a CZK amount as HighLevel renders
         it once an account's currency is CZK (measured 11 Sep). Anchored, so
         "Kč0 (20.00%) - 1" and friends are left alone. Only Kč for now: EUR and
         the rest have not been SEEN in this layout, and a rule written for a
         shape nobody has observed is how the old firewall came to match
         nothing. Add them when a real account shows them. */
      ['MONEY_KC',       /^(-?)(Kč)\s?(\d{1,3}(?:,\d{3})+|\d+)(?:\.(\d{1,2}))?$/, '@money'],
      /* "(Kč0.00)" — the same amount in brackets, the forecast's at-risk rows.
         The inside goes back through the rules, so MONEY_KC formats it. */
      ['MONEY_KC_PAREN', /^\((-?Kč\s?(?:\d{1,3}(?:,\d{3})+|\d+)(?:\.\d{1,2})?)\)$/],
      /* "Kč0/M" — the dashboard's per-month metric, the last open item on the
         invoice-vocabulary pass. The amount goes back through the rules, so
         MONEY_KC formats it and this rule only has to say what "/M" means.
         Kč only, like MONEY_KC: the dollar shape has not been seen since the
         account's currency changed, and a rule for an unobserved shape is how
         the old firewall came to match nothing. */
      ['MONEY_KC_PER_M', /^(-?Kč\s?(?:\d{1,3}(?:,\d{3})+|\d+)(?:\.\d{1,2})?)\/M$/],
      /* THE RECURRING-INVOICE EDITOR, 11 Sep */
      ['RECURRING_EVERY', /^Recurring\s+Every\s+(\d*)\s*(day|week|month|year)s?$/i, '@recurringEvery'],
      /* the dates are HighLevel's own and go through the date rules via {*N} */
      ['FIRST_INVOICE',  /^First invoice will be due on (.+) and sent on (.+)$/i],
      ['FLAT_CUR',       /^Flat \(([A-Z]{3})\)$/],
      ['MAX_LATE_CUR',   /^Max Late Fees \(([A-Z]{3})\)$/],
      /* "Every  month", "Every 3 weeks" — recurring invoice schedule, 11 Sep */
      ['EVERY_N',        /^Every\s+(\d*)\s*(day|week|month|year)s?$/i, '@everyInterval'],
      /* "Sep 10 at 09:20 PM" — payments lists, 11 Sep */
      ['MON_DAY_TIME',   /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{1,2})\s+at\s+(\d{1,2}):(\d{2})\s*(AM|PM)$/i, '@monDayTime'],
      ['MON_YEAR',       /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{4})$/, '@monYear'],
      /* must precede N_OPPS, which would otherwise never see the longer string */
      ['N_OPPS_SEL',     /^(\d+)\s+opportunit(?:y|ies)\s+selected$/i],
      ['N_OPPS',         /^(\d+)\s+opportunit(?:y|ies)$/i],
      /* the overflow indicator on a tag or list cell -- "1 more", "3 more".
         A count, so it needs the plural machinery rather than a dictionary
         entry: Czech would otherwise read "3 další" where it wants "dalších".

         NO LEADING PLUS HERE: the "+N more" variant already had its own rule,
         PLUS_MORE, twenty lines above this one -- and I added this without
         looking, then briefly made it accept "+3 more" too and render a plus
         sign HighLevel had not written. The census lesson from the same day's
         firewall work, repeated in the pack: BEFORE ADDING A RULE, GREP FOR
         THE WORD. Two rules matching overlapping shapes is how one of them
         silently stops firing.

         The visible good that came of it: PLUS_MORE had a hardcoded "dalších"
         and read "+1 dalších". It now shares this rule's plural table. */
      ['N_MORE',         /^(\d+)\s+more$/i],
      /* the status of a SENT invoice, counting down to its due date. Seen only
         in the invoice list's status column, 11 Sep. The Czech is the invoice
         word (splatnost), so if TASKS ever render this exact string they will
         get an accounting word — patterns are not route-scoped the way
         pack.byRoute is. Check that before widening this. The screen shows it
         as "Due In 1 Day(S)", but only through CSS: the text itself is
         "Due in 1 day(s)", which is what this matches. */
      ['DUE_IN_DAYS',    /^Due in (\d+) day\(s\)$/i],
      /* trailing period OPTIONAL. This greeting is typed out a character at a
         time, and the frame before the last one is the whole sentence WITHOUT
         its full stop -- the collector recorded exactly that on 11 Sep while
         the finished sentence was already correctly in Czech. Making the period
         optional translates that frame too, so the typewriter lands in Czech
         one frame earlier and the collector stops reporting a phantom gap. */
      ['CAL_AI_HI',      /^Hi\s+(.+?)!\s*I'm Calendar AI\.\s*Tell me what you'd like help with, or choose an option below\.?$/i],
      ['N_PIPES',        /^(\d+)\s+pipelines?$/i],
      ['N_APPLIED',      /^(\d+)\s+applied$/i],
      ['OUT_OF',         /^(.+?)\s*\((\d+)\s+out of\s+(\d+)\)$/i],
      ['POS_OF',         /^Currently at position (\d+) of (\d+)$/i],
      ['DEL_PIPE',       /^Delete pipeline\s+[“"](.+)[”"]\?$/],
      ['UNSAVED_N',      /^You have (\d+) unsaved change\(s\)$/i],
      ['PIPE_DASH',      /^Pipeline - (.+)$/],
      ['ORD_STAMP',      /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{1,2})(?:st|nd|rd|th),\s*(\d{1,2}):(\d{2})\s*(am|pm)$/i, '@ordStamp'],
      ['DATE_DAY_FIRST', /^(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{4})$/, '@dateDayFirst'],
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
      /* "0s" — the dashboard's average deal length with no closed deals, 11 Sep.
         Only the seconds form has been SEEN; longer lengths ("3d 4h"?) have
         not, so they are not guessed at here. Case-sensitive on purpose. */
      ['DUR_SECS',       /^(\d+)s$/],
      /* "Call: +420555000121" — the contact screen's call button, as its
         aria-label. The number is the CONTACT'S and passes through raw. Until
         v84 it reached the harvest as a gap, number and all. */
      ['CALL_TO',        /^Call:\s*(\+?\d[\d\s().-]{5,}\d)$/],
      /* "1 month" — a period picker's value (agent logs), 11 Sep. Whole string
         only, so it does not collide with the /payments "month" fragment. */
      /* the sub-menu sweep, 11 Sep — counts and percentages on AI agents,
         courses, reviews, stores and site analytics */
      ['PROGRESS_PCT',   /^Progress bar (\d+)%$/],
      ['MINS_CLOCK',     /^(\d{1,2}:\d{2})\s+Mins?$/],
      ['CURRENT_PAGE',   /^Current page (\d+)$/],
      ['INCREASED_BY',   /^Increased by (\d+(?:\.\d+)?)%$/],
      ['DECREASED_BY',   /^Decreased by (\d+(?:\.\d+)?)%$/],
      /* THE "SHIP AI" CARDS on ai-agents/getting-started, 11 Sep. Each card's
         headline stat COUNTS UP when the card scrolls into view, so the string
         arrives as "0% missed calls", "7% missed calls" … "98% response rate".
         Fixed entries would translate only the last frame of each; a rule
         translates every frame and needs no maintenance when HighLevel edits
         the number in its marketing copy. */
      ['SHIP_MISSED_PCT', /^(\d+)% missed calls$/i],
      ['SHIP_CONV_PCT',   /^(\d+)% conversion rate$/i],
      ['SHIP_RESP_PCT',   /^(\d+)% response rate$/i],
      ['SHIP_MORE_BOOK',  /^\+(\d+)% more bookings$/i],
      ['N_REVIEWS_PAREN', /^\((\d+) Reviews?\)$/],
      ['AGENTS_RANGE',   /^(\d+)\s*-\s*(\d+) of (\d+) agents?$/],
      ['N_MANAGED',      /^(\d+) Managed Agents?$/],
      ['KB_USAGE',       /^Knowledge base usage: (\d+) of (\d+) used, (\d+) slots? left$/],
      /* Settings > Labs: a beta feature's tag, "Activate now - Live in 19 days" */
      ['LABS_LIVE_IN',   /^Activate now - Live in (\d+) days?$/],
      /* a text box's counter, "0 / 2000 characters" (the new-task dialog) */
      ['CHAR_COUNT',     /^(\d+)\s*\/\s*(\d+)\s+characters$/],
      /* "3 Steps" — a funnel's step count, in the funnels list */
      ['N_STEPS',        /^(\d+)\s+Steps?$/],
      /* "7 Pages" — a website's page count, the websites list */
      ['N_PAGES',        /^(\d+)\s+Pages?$/],
      /* the forecast's summary tooltips: one title attribute, three lines.
         The amounts go back through the rules (MONEY_KC). */
      ['FC_TIP_EXPECTED', /^Expected revenue: (.+)\nMax potential revenue: (.+)\nExpected revenue rate: (\d+(?:\.\d+)?)%$/],
      ['FC_TIP_TOTAL',   /^Total potential: (.+)\nBreakdown: (.+) \(Expected revenue\) \+ (.+) \(Won revenue\)$/],
      ['N_MONTHS',       /^(\d+)\s+months?$/i],
      ['N_DAYS',         /^(\d+)\s+days?$/i],
      /* "16px" — the rich-text editor's font-size box. A CSS size, the same in
         every language; the rule exists so it stops reading as a gap. No "%":
         Czech writes "50 %", so a percentage is not an identity. */
      ['CSS_SIZE',       /^(\d+(?:\.\d+)?)(px|pt|em|rem)$/],
      /* identities, so a sweep shows only real gaps: a time-zone offset
         ("GMT -07:00"), a time-zone abbreviation in brackets ("(PDT)"), and a
         chart axis in thousands ("1k", "3k") — all written the same in Czech
         interfaces, or at least understood. */
      ['TZ_OFFSET',      /^(GMT\s?[+-]\d{2}:\d{2})$/],
      ['TZ_ABBR',        /^(\([A-Z]{2,5}\))$/],
      ['AXIS_K',         /^(\d+(?:\.\d+)?k)$/],
      ['TOTAL_MEM',      /^(\d+)\s+total members?$/i],
      ['REL_LONG',       /^(\d+)\s+(second|minute|hour|day|week|month)s?\s+ago$/i, '@relLong'],
      ['LAST_UPD',       /^Last updated:\s*(.+)$/i],
      ['BYTES_USED',     /^([\d.,]+)\s*(Bytes|B|KB|MB|GB|TB)\s+used$/i],
      ['N_ACCOUNTS',     /^(\d+)\s+Accounts?$/i],
      /* "0 in sent", "0  in sent" (sic, two spaces) — the estimates summary
         tiles: how many estimates are in each state. 11 Sep. */
      ['EST_IN',         /^(\d+)\s+in\s+(sent|accepted|declined|invoiced)$/i],
      /* "1665 Apps" — the marketplace's result count, 11 Sep */
      ['N_APPS',         /^(\d+)\s+Apps?$/i],
      ['DATE_RANGE',     /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{1,2}),\s*(\d{4})\s*-\s*(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{1,2}),\s*(\d{4})$/, '@dateRange'],
      ['ABBR_PAREN',     /^(.+?)\s*\(\s*([A-Z]{2,6})\s*\)$/]
    ]
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = source;
  /* __kaSource is the name; GhlSourceRules is the pre-v76 alias for one release. */
  else {
    root.__kaSource = root.__kaSource || {}; root.__kaSource.en = source;
    root.GhlSourceRules = root.GhlSourceRules || {}; root.GhlSourceRules.en = source;
  }
})(typeof window !== 'undefined' ? window : globalThis);
