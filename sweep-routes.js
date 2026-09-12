/* =============================================================================
   sweep-routes.js — the post-deploy collector sweep, as a console snippet

   NOT LOADED BY ANYTHING. Paste it into the DevTools console of a logged-in
   sub-account tab, or run it through the browser MCP. It exists so nobody
   rewrites the walker from memory again, and so the route list travels with
   the code rather than with whoever last did a sweep.

   THE RULE IT SERVES: every deploy gets the FULL sweep, not a check of the
   screens the change touched. A new zone, a formatter or a walk-order change
   moves text on screens the deploy never visited, and only the full walk sees
   that. A few minutes in a FOREGROUND tab; a background tab throttles timers
   and the v128 walk took about 45 minutes.

     await kaSweep.start()                  // export, then clear
     await kaSweep.run(kaSweep.ALL)         // CORE, SUBMENUS, SETTINGS, LAST
     kaSweep.report()                       // what is left, and what is new

   THROUGH THE BROWSER MCP the page-script call times out at 45 s, so do not
   await run(): start it, then poll kaSweep.progress with short calls.

   start() hands back everything the collector held BEFORE clearing — keep it.
   Clearing without exporting first has already lost one session's history.

   The route list is the sweep's blind spot: it can only see screens it opens.
   COVERAGE.md ("The sweep route list") is the canonical list and these arrays
   mirror it exactly — brace groups there are expanded here. Read routes off the
   menus when a module gains a page, and add them in BOTH places. Brought back in
   step 12 Sep (v129) after drifting by about 50 routes. Not here, by design:
   contacts/detail/<one contact>, which needs a record id — open it by hand.
============================================================================= */

(function (root) {
  'use strict';

  var CORE = [
    'launchpad', 'dashboard', 'conversations/conversations', 'calendars/view',
    'contacts/smart_list/All', 'opportunities/list',
    'payments/invoices', 'payments/recurring-templates', 'payments/invoice-templates',
    'payments/v2/estimates', 'payments/integrations/dashboard',
    'payments/proposals-estimates', 'payments/proposals-estimates/templates',
    'payments/v2/orders', 'payments/v2/abandoned-checkouts', 'payments/v2/subscriptions',
    'payments/v2/paymentlinks', 'payments/v2/transactions',
    'payments/products', 'payments/products/collections', 'payments/products/inventory',
    'payments/products/reviews', 'payments/coupons', 'payments/gift-cards',
    'payments/settings/receipts', 'payments/settings/taxes',
    'marketing/social-planner', 'automation/workflows', 'funnels-websites/funnels',
    'memberships/client-portal/client-portal-ai', 'media-storage',
    'reputation/overview', 'reporting/reports', 'integration', 'settings/company'
  ];

  var SUBMENUS = [
    'conversations/manual_actions', 'conversations/templates', 'conversations/trigger-links',
    'conversations/analytics', 'conversations/settings', 'calendars/appointments',
    'contacts/bulk/actions', 'tasks', 'businesses/list',
    'opportunities/forecast', 'opportunities/pipeline', 'opportunities/bulk-actions',
    'automation/workflows/settings',
    'marketing/emails/statistics', 'marketing/templates', 'marketing/countdown-timer',
    'marketing/trigger-links', 'marketing/affiliate-manager/dashboard',
    'marketing/affiliate-manager/media', 'marketing/affiliate-manager/settings',
    'marketing/ad-manager/home',
    'funnels-websites/websites', 'funnels-websites/stores', 'funnels-websites/webinars',
    'funnels-websites/chat-widget', 'analytics', 'blogs',
    'wordpress', 'funnels-websites/client-portal/dashboard',
    'funnels-websites/client-portal/settings', 'funnels-websites/client-portal/branded-app',
    'form-builder/main', 'survey-builder/main', 'quiz-builder/main', 'qr-codes',
    'memberships/client-portal/settings', 'memberships/client-portal/branded-app',
    'memberships/courses/dashboard-v2', 'memberships/courses/products-v2',
    'memberships/courses/offers-list-v2', 'memberships/courses/analytics-v2',
    'memberships/communities/community-groups',
    'memberships/communities/clientportal-domain-setup',
    'memberships/communities/communities-branded-app',
    'memberships/certificates/create-certificates', 'memberships/gokollab/activation',
    'reputation/requests', 'reputation/reviews', 'reputation/video-testimonials',
    'reputation/widget', 'reputation/listing', 'reputation/settings',
    'reporting/google-ads', 'reporting/facebook-ads', 'reporting/attribution',
    'reporting/call', 'reporting/appointment',
    'ai-agents/getting-started', 'ai-agents/agent-studio', 'ai-agents/voice-ai',
    'ai-agents/conversation-ai', 'ai-agents/knowledge-base', 'ai-agents/agent-templates',
    'ai-agents/content-ai', 'ai-agents/agent-logs'
  ];

  /* DOM pages only: most of Settings is a cross-origin micro-frontend */
  var SETTINGS = [
    'settings/company-billing/billing', 'settings/phone_system', 'settings/whatsapp',
    'settings/objects', 'settings/fields', 'settings/custom_values', 'settings/import-data',
    'settings/scoring', 'settings/preferences', 'settings/domain', 'settings/external-tracking',
    'settings/lc-integrations', 'settings/private-integrations', 'settings/tags',
    'settings/labs', 'settings/audit/logs'
  ];

  /* froze the renderer for about 2.5 minutes on the v128 sweep; every script
     call timed out until it recovered, so it goes after everything else */
  var LAST = ['reporting/local-marketing-audit'];

  function base() {
    var m = location.pathname.match(/\/v2\/location\/[^/]+\//);
    if (!m) throw new Error('not inside a sub-account');
    return m[0];
  }

  /* WAIT FOR THE DOM TO STOP MOVING, never a fixed delay. A half-rendered
     screen records skeleton text as missing strings, and a screen that loads
     in 900 ms should not cost eight seconds. */
  function settle(quietMs, capMs) {
    return new Promise(function (done) {
      var last = Date.now(), t0 = last;
      var obs = new MutationObserver(function () { last = Date.now(); });
      obs.observe(document.body, { subtree: true, childList: true, characterData: true });
      (function tick() {
        var now = Date.now();
        if ((now - last > quietMs && now - t0 > 3500) || now - t0 > capMs) {
          obs.disconnect();
          return done(Math.round((now - t0) / 1000));
        }
        setTimeout(tick, 300);
      })();
    });
  }

  var kaSweep = {
    CORE: CORE,
    SUBMENUS: SUBMENUS,
    SETTINGS: SETTINGS,
    LAST: LAST,
    ALL: CORE.concat(SUBMENUS, SETTINGS, LAST),

    /* { done, total, route, log, finished } — readable while run() is going */
    progress: null,

    /* export first, THEN clear: a sweep answers "what is true now", and
       "first seen after T" would hide old misses that are still live */
    start: async function () {
      var before = root.__kaCollect ? root.__kaCollect.all() : [];
      kaSweep.before = before;
      if (root.__kaCollect) root.__kaCollect.clear();
      console.log('[sweep] engine ' + root.__kaVersion + ', data ' +
                  (root.__kaStatus && root.__kaStatus.dataVersion) +
                  ' — kept ' + before.length + ' entries in kaSweep.before');
      return before;
    },

    run: async function (routes) {
      var R = root.AppUtils && root.AppUtils.RouteHelper;
      if (!R) throw new Error('no RouteHelper');
      var b = base(), out = [];
      var p = kaSweep.progress = { done: 0, total: routes.length, route: null, log: out, finished: false };
      for (var i = 0; i < routes.length; i++) {
        p.route = routes[i];
        try { await R.navigate({ path: b + routes[i] }); }
        catch (e) { out.push([routes[i], 'nav-failed']); p.done++; continue; }
        var secs = await settle(1800, 14000);
        out.push([routes[i], secs + 's']);
        p.done++;
      }
      p.finished = true;
      return out;
    },

    report: function () {
      var c = root.__kaCollect;
      if (!c) return 'no collector loaded';
      var before = kaSweep.before || [];
      var fresh = c.all().filter(function (r) {
        return !before.some(function (k) { return k.text === r.text && k.attr === r.attr; });
      });
      var out = {
        stats: c.stats(),
        suspect: c.suspect(),          /* anything shaped like customer data: a firewall hole */
        truncated: c.truncated().length,
        newSinceLastSweep: fresh.length,
        fresh: fresh.map(function (r) {
          return { text: r.text, attr: r.attr, seen: r.seen, routes: r.routes };
        }),
        top: c.top(40)
      };
      console.log('[sweep] ' + out.stats.strings + ' strings · ' +
                  out.suspect.length + ' suspects · ' + fresh.length + ' new');
      return out;
    }
  };

  root.kaSweep = kaSweep;
  console.log('[sweep] ready — kaSweep.start(), kaSweep.run(kaSweep.ALL), kaSweep.report()');
})(window);
