/* =============================================================================
   sweep-routes.js — the post-deploy collector sweep, as a console snippet

   NOT LOADED BY ANYTHING. Paste it into the DevTools console of a logged-in
   sub-account tab, or run it through the browser MCP. It exists so nobody
   rewrites the walker from memory again, and so the route list travels with
   the code rather than with whoever last did a sweep.

   THE RULE IT SERVES: every deploy gets the FULL sweep, not a check of the
   screens the change touched. A new zone, a formatter or a walk-order change
   moves text on screens the deploy never visited, and only the full walk sees
   that. It takes about three minutes.

     await kaSweep.start()                  // export, then clear
     await kaSweep.run(kaSweep.CORE)        // the operator surfaces
     await kaSweep.run(kaSweep.SUBMENUS)    // everything behind a module's own bar
     kaSweep.report()                       // what is left, and what is new

   start() hands back everything the collector held BEFORE clearing — keep it.
   Clearing without exporting first has already lost one session's history.

   The route list is the sweep's blind spot: it can only see screens it opens.
   Read routes off the menus when a module gains a page, and add them here
   AND in COVERAGE.md.
============================================================================= */

(function (root) {
  'use strict';

  var CORE = [
    'launchpad', 'dashboard', 'conversations/conversations', 'calendars/view',
    'contacts/smart_list/All', 'opportunities/list', 'tasks', 'businesses/list',
    'payments/invoices', 'payments/recurring-templates', 'payments/invoice-templates',
    'payments/v2/estimates', 'payments/products', 'payments/v2/orders',
    'payments/v2/subscriptions', 'payments/v2/transactions', 'payments/coupons',
    'payments/gift-cards', 'payments/v2/paymentlinks', 'payments/settings/taxes',
    'media-storage', 'reputation/overview', 'reporting/reports', 'integration',
    'marketing/social-planner', 'funnels-websites/funnels', 'automation/workflows',
    'ai-agents/getting-started', 'ai-agents/voice-ai', 'wordpress/dashboard',
    'settings/company'
  ];

  var SUBMENUS = [
    'conversations/manual_actions', 'conversations/templates', 'conversations/trigger-links',
    'conversations/analytics', 'conversations/settings', 'calendars/appointments',
    'contacts/bulk/actions', 'opportunities/forecast', 'opportunities/pipeline',
    'marketing/emails/statistics', 'marketing/templates', 'marketing/countdown-timer',
    'marketing/trigger-links', 'marketing/affiliate-manager/dashboard',
    'funnels-websites/websites', 'funnels-websites/stores', 'funnels-websites/chat-widget',
    'analytics', 'blogs', 'form-builder/main', 'survey-builder/main', 'qr-codes',
    'memberships/courses/dashboard-v2', 'memberships/courses/products-v2',
    'memberships/communities/community-groups', 'reputation/requests', 'reputation/reviews',
    'reputation/settings', 'reporting/attribution', 'reporting/call',
    'ai-agents/agent-studio', 'ai-agents/conversation-ai', 'ai-agents/knowledge-base',
    'ai-agents/agent-templates', 'ai-agents/content-ai', 'ai-agents/agent-logs',
    'settings/fields', 'settings/custom_values', 'settings/objects', 'settings/scoring',
    'settings/preferences', 'settings/tags', 'settings/labs', 'settings/audit/logs'
  ];

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
      for (var i = 0; i < routes.length; i++) {
        try { await R.navigate({ path: b + routes[i] }); }
        catch (e) { out.push([routes[i], 'nav-failed']); continue; }
        var secs = await settle(1800, 14000);
        out.push([routes[i], secs + 's']);
      }
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
  console.log('[sweep] ready — kaSweep.start(), kaSweep.run(kaSweep.CORE), kaSweep.report()');
})(window);
