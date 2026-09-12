# Coverage — measured, 10 September 2026

**98.6% of translatable interface text on the operator surface.**
Engine v52, Czech, measured on a live sub-account rather than against a corpus.

## The number that matters, and the two that don't

Three different figures have been quoted during this project. Only the third is
defensible.

| | |
|---|---|
| **99.6%** | Coverage of HighLevel's *localization API corpus*. Meaningless — that corpus does not include the newer product surfaces at all, which is why a native reviewer still found untranslated screens. |
| **50.5%** | The same corpus including wordpress, yext and reselling — surfaces a sub-account operator never opens. Measures the wrong product. |
| **98.6%** | What a person using the CRM actually sees. Measured below. |

## Method

Walk twelve operator routes, wait for the DOM to settle, then ask the engine's
own diagnosis (`__kaDebug.why()`) about every visible text node:

- **translated** — we wrote it
- **content-zone / data-picker** — deliberately off limits: message bodies,
  contact names, pipeline and stage names, table cells holding records
- **missing** — reached the engine and had no translation

Coverage is `translated / (translated + missing)`, counted per **text node**, so
a string appearing forty times counts forty times. That is the right denominator
for "what does a user see", and the wrong one for "how big is the dictionary".

## Result

| Route | Translated | Gaps | Off limits | % |
|---|---|---|---|---|
| Opportunities | 122 | 9 | 12 | 93.1 |
| Contacts list | 123 | 10 | 146 | 92.5 |
| Dashboard | 145 | 12 | 105 | 92.4 |
| Reputation | 100 | 9 | 5 | 91.7 |
| Payments | 95 | 9 | 5 | 91.3 |
| Tasks | 93 | 9 | 22 | 91.2 |
| Calendars | 101 | 11 | 5 | 90.2 |
| Reporting | 68 | 9 | 5 | 88.3 |
| Contact detail | 89 | 12 | 6 | 88.1 |
| Conversations | 66 | 9 | 5 | 88.0 |
| Social planner | 119 | 18 | 5 | 86.9 |
| Media storage | 46 | 7 | 2 | 86.8 |
| **Raw total** | **1,167** | **124** | **323** | **90.4** |

## Why the honest figure is higher than the raw one

Of those 124 "gaps", 108 are not translatable text:

| Count | What | |
|---|---|---|
| 60 | `×` `*` `#` `T` | single-character symbols |
| 24 | `snapshots.loadSnapshotsTemplate.selectSnapshotTemplate` | **HighLevel's own untranslated key**, leaking into the DOM |
| 12 | `<strong>We're sorry but the application…` | the `<noscript>` block — never rendered |
| 12 | `ctrlK` | a keyboard-shortcut token |

Leaving **16 genuine gaps** across twelve screens: `Win%`, `0s`, `$0/M`,
`1 more`, and a handful of fragments.

**1,167 / (1,167 + 16) = 98.6%.**

### Since that measurement — engine v63, 11 September

The figure above is the v52 walk and is left as measured. What has changed:

- `1 more` is **closed** (pattern `N_MORE` with a Czech one/few/other table).
  Fixing it also caught `PLUS_MORE`, an older rule rendering a hardcoded
  `dalších`, so `+1 more` had been reading `+1 dalších`.
- The same twelve-route walk now leaves the collector holding **seven**
  strings, and none of them is work: HighLevel's own leaked
  `snapshots.…selectSnapshotTemplate`, `Win%`, `0s`, `$0/M`, `GMT -07:00`,
  `ctrlK`, and the two smart-list view names below.

Restating the percentage would need a full re-walk; the honest statement is
that the gap list has shrunk by one and nothing new has appeared.

## What is excluded, and why that is the point

**323 nodes off limits** — message bodies, contact and company names, pipeline
and stage names, tags, the account switcher, table cells holding records. These
are customer data. Not translating them is the product working, not a shortfall,
and the count is worth quoting alongside the coverage figure: it is the size of
what we deliberately never touch.

**56 more** reached the engine and looked like customer data, mostly on the
opportunities board. **Closed in v55–v57** (11 September), and worth recording
how, because three of the four fixes were the same mistake:

| | |
|---|---|
| Pipeline name, text **and** `title` | There are **two** pipeline selects. v45 named only `#pipelineDropdDown-listview`, so the board's copy leaked for ten versions. Now an id prefix. |
| Avatar initials | **Two** avatar components. `.avatar_img` is the old header one, `.hr-avatar__text` the design-system one used in lists. |
| Dashboard task fields | **Five** ids in that widget. v45 named only `task-title-text`; the body and the contact name leaked. |
| Card hover tooltip | No selector possible — identical to the action tooltips beside it. Closed by the **record backstop** instead (see NAMESPACE.md). |

The lesson is worth more than the fixes: **when a selector names one member of a
family, census the family.** Every instance above was found by asking the live
DOM what else shared the shape, not by reading the code.

### That leak, closed — v98, 11 September

Smart-list **view names** ("ZZ few", "ZZ many") shared an element class with
HighLevel's own "All" and "Add Smart List", so no selector separated them.
Closed by the **per-zone phrase allowlist** (FIREWALL.md): the tabs are zoned,
`Add Smart List` keeps translating because it sits outside `.lists`, and `All`
is let back through as an exact phrase.

Building it turned up **six more pickers of the same shape** on the dashboard
alone — five reporting widgets each with their own pipeline select, plus the
workflow, campaign, user and Google-Business-page pickers. All were leaking a
record's name the moment somebody chose one, and all looked clean here only
because this account has a single pipeline and no workflows. Zoned in v99.

## The sweep route list

**The walker itself is `sweep-routes.js` in the repo** — a console snippet, not
loaded by anything, carrying this list plus the discipline that goes with it
(export before clearing, wait for the DOM to stop moving, report suspects
separately). Paste it into a logged-in tab. When a module gains a page, add it
in both places.

The collector sees only screens someone opens, so the post-deploy sweep is
only as good as its list of routes. On 11 Sep the list in use had two stale
payments paths (`payments/transactions` and `payments/subscriptions`, which
are really under `payments/v2/`). It also had never included fifteen payments
sub-pages. Both rendered nothing, the sweep reported "clean", and about 45
gaps plus the whole app marketplace sat unseen. **Read routes off the menus
(the side bar, and each module's top bar), not from memory.** The list as of
v82, relative to `/v2/location/<id>/`:

```
launchpad  dashboard  conversations/conversations  calendars/view
contacts/smart_list/All  opportunities/list
payments/invoices  payments/recurring-templates  payments/invoice-templates
payments/v2/estimates  payments/integrations/dashboard
payments/proposals-estimates  payments/proposals-estimates/templates
payments/v2/orders  payments/v2/abandoned-checkouts  payments/v2/subscriptions
payments/v2/paymentlinks  payments/v2/transactions
payments/products  payments/products/collections  payments/products/inventory
payments/products/reviews  payments/coupons  payments/gift-cards
payments/settings/receipts  payments/settings/taxes
marketing/social-planner  automation/workflows  funnels-websites/funnels
memberships/client-portal/client-portal-ai  media-storage
reputation/overview  reporting/reports  integration  settings/company
```

**The sub-menus** (added v84, read off each module's own top bar; about 90
pages, 425 strings on the first pass):

```
conversations/manual_actions  conversations/templates  conversations/trigger-links
conversations/analytics  conversations/settings  calendars/appointments
contacts/bulk/actions  tasks  businesses/list  contacts/detail/<one contact>
opportunities/forecast  opportunities/pipeline  opportunities/bulk-actions
automation/workflows/settings
marketing/emails/statistics  marketing/templates  marketing/countdown-timer
marketing/trigger-links  marketing/affiliate-manager/{dashboard,media,settings}
marketing/ad-manager/home
funnels-websites/{websites,stores,webinars,chat-widget}  analytics  blogs
wordpress  funnels-websites/client-portal/{dashboard,settings,branded-app}
form-builder/main  survey-builder/main  quiz-builder/main  qr-codes
memberships/client-portal/{settings,branded-app}
memberships/courses/{dashboard-v2,products-v2,offers-list-v2,analytics-v2}
memberships/communities/{community-groups,clientportal-domain-setup,communities-branded-app}
memberships/certificates/create-certificates  memberships/gokollab/activation
reputation/{requests,reviews,video-testimonials,widget,listing,settings}
reporting/{google-ads,facebook-ads,attribution,call,appointment,local-marketing-audit}
ai-agents/{getting-started,agent-studio,voice-ai,conversation-ai,knowledge-base,agent-templates,content-ai,agent-logs}
```

**Running the sweep through the browser MCP — three things learned on the v128 sweep (12 Sep):**

- **The page-script call times out at 45 s**, so a batch cannot be awaited. Start the
  walker without awaiting it, have it write progress to `window`, and poll with short calls.
- **A background tab throttles timers.** `settle()` is meant to cap at 14 s; screens took
  about 60 s, and the whole walk took roughly 45 minutes instead of 3. Keep the sweep tab in the foreground.
- **`reporting/local-marketing-audit` froze the renderer for about 2.5 minutes.** Nothing failed;
  every script call just timed out until it recovered. Walk it last, or skip it and open it by hand.
- **The browser MCP is signed in as the agency owner**, and the engine stands aside for agency
  users. Open the first route with `?csagency=1`. The audience is resolved once at boot,
  so in-app navigation keeps the override.
- `sweep-routes.js` **was brought back in step on 12 Sep (v129)**. It had drifted by about 50
  routes. It now mirrors these blocks exactly: 117 routes in `CORE`, `SUBMENUS`, `SETTINGS` and
  `LAST` (`local-marketing-audit` alone, walked last), with `kaSweep.ALL` as the whole walk.
  `contacts/detail/<one contact>` is left out because it needs a record id. The walker also
  writes `kaSweep.progress`, so the MCP can start it unawaited and poll. A one-off Node check
  expanded the brace groups here and compared: nothing missing, nothing extra.

**Settings** (added v86 — DOM pages only; see the iframe caveat):

```
settings/company-billing/billing  settings/phone_system  settings/whatsapp
settings/objects  settings/fields  settings/custom_values  settings/import-data
settings/scoring  settings/preferences  settings/domain  settings/external-tracking
settings/lc-integrations  settings/private-integrations  settings/tags
settings/labs  settings/audit/logs
```

**Dialogs** (added v89). The route list cannot reach what sits behind a
button, so these are opened and closed **unsaved** (Escape, then Zrušit).
Afterwards, check the lists: the v89 walk left nothing behind.

**Create forms and menus, swept 12 September.** Every create form below was
opened and abandoned unsaved; nothing was created, and the lists were checked
afterwards. Coupons, tags, payment links, gift cards, custom values, fields,
QR codes, blogs, trigger links and scoring all came back clean but two:

- The invoice list's **New** menu held three untranslated descriptions
  ("Send a one-time invoice to the customer right away.", and two more). No
  route walk can reach a dropdown, which is exactly the blind spot the picker
  exists for — these were found only because the menu happened to be open.
- The **scoring rule builder** composes a sentence around three controls and
  its opener, "If a", was untranslated. Now `Pokud`, scoped to that route.

**Only two lists expose a row menu that declares itself** (`aria-haspopup`):
invoices and products, both clean. On the rest the trigger is undeclared, and
per the v93 rule an undeclared element in an action column must not be clicked
by a machine — on Tax settings that was the delete icon. Those menus need a
human with the picker.

**A transient leak worth knowing about:** HighLevel renders raw i18n keys for
a beat before resolving them — `crmObjectsSettingsApp.manageTags.newTag` and
four siblings flash in the create-tag dialog, then read correctly. They are
not translated and should not be: an entry per frame-long string would sit in
the pack for ever fixing something nobody can read.

**Row menus** (v93). Open each list's first-row "…" menu and read it. **Only
click an element that declares itself a menu trigger** (`aria-haspopup`, a
dropdown class). The first row-menu walk clicked "whatever is in the last
cell". On Tax settings that was the **delete** icon, and on Tags the edit
pencil. Escape cancelled both, and both lists were checked afterwards and
found intact, but a blind click in an action column is one confirm-click away
from deleting a record.

```
contacts/smart_list/All  → Přidat kontakt        opportunities/list → Přidat příležitost
tasks                    → Přidat úkol           businesses/list    → Přidat společnost
payments/coupons         → Vytvořit kupón        payments/v2/paymentlinks → Vytvořit odkaz
payments/gift-cards      → Vytvořit dárkový poukaz   payments/v2/subscriptions → Přidat předplatné
settings/custom_values   → Přidat vlastní hodnotu    settings/tags → Vytvořit štítek
settings/fields          → Vytvořit pole         settings/objects   → Přidat vlastní objekt
marketing/trigger-links  → Přidat odkaz          marketing/templates → Nový úryvek
blogs → Nový blog   qr-codes → Vytvořit QR kód   reputation/requests → Odeslat žádost o recenzi
funnels-websites/funnels → Nový trychtýř         memberships/courses/products-v2 → Vytvořit nový kurz
settings/scoring → Přidat nové pravidlo
```

Plus one saved record per editor (a product, a recurring invoice), and a
*create* form wherever toggles hide sections (see the caveat below).

**HighLevel's own sales pages — BUILT 11 Sep**, data v70. About 185 strings
across `ai-agents/getting-started` (the landing page of the "AI agenti" menu
item, sales copy plus four demo conversations), the `ai-agents/voice-ai`
welcome shown until the first agent exists, and the `wordpress/dashboard`
hosting pitch shown until WordPress is activated. Tom's reasoning: which menu
items a client sees is the **agency owner's** choice, so anything visible must
be translatable.

Every figure and price is kept **exactly** as HighLevel prints it — `62%`,
`$200k`, `14.7M+` — and only the words around them are translated, including
the units (`/mo` → `/měs.`, `hrs/day` → `hod./den`). Clock times inside the
demo chat *are* localised (`4 PM` → `16:00`): a time is formatting, not one of
their claims. HighLevel's sample names — John Doe, Sara Smith, Lumen Studio,
Johnson HVAC — are left in place inside the sentences around them.

All of it is my Czech. It goes to the reviewer's **pass 3** as one batch, with
three questions asked explicitly in the pack: percent spacing (`62%` vs the
Czech `62 %`), whether the agent names should stay English as the pack already
treats Voice AI and Content AI, and the unit abbreviations.

### Animated text — the one thing on those pages we do not translate

The Voice AI hero types its role a character at a time: `sal`, `sales assi`,
`sales assistant`. The engine sees every frame, and translated whichever one
happened to match a dictionary word — it was flashing **"Prodeje"** and
**"Schůzka"** in the middle of an English word, live, before this was found.
No dictionary entry can fix that: the key is a fragment whose length changes
twenty times a second.

The hint under the orb is the same mechanism carrying **the sub-account's own
name** — "ZZ" "My" "Gym's" "AI" "assistant", one word per element — so it is
customer data *and* an animation, and word-by-word replacement could not
produce Czech word order in any case.

Both are zoned (`.welcome-hero__highlight`, `.typewriter-cursor`,
`.hint-word`), so the sentence around them reads Czech and the moving part
holds still: *"Váš AI receptionist je připraven."* The Czech either side is
written to work with an English masculine noun in the middle, which is what
every role HighLevel rotates through happens to be.

**Settings › Labs cards stay blocked** until pack entries can expire (the
format exists since v97, unused) and there's a way to learn what's live. Labs
churns about daily, and its cards arrive cut off with "…". Also left alone: the survey and quiz builders' template
galleries, whose names and truncated tags ("Digital Mark...") are HighLevel's
sample content.

### The sweep after all of it — engine v106, data v73, 11 September

Twenty-one routes walked with the collector cleared first. **Sixteen strings,
zero suspects, nothing truncated** — and every one of the sixteen is something
we decline to translate on purpose:

| | |
|---|---|
| John Doe · Sara Smith · Lumen Studio · SS · LS | HighLevel's demo content on the AI sales page |
| 14.7M+ · 860K+ · 18.7M+ · 27M+ · 24x7 · ~34 min · 0.8s | their marketing figures, kept exactly |
| `()=>(0,a.h)("span",null,d("listView.bulkActions.delete"))` | **their bug** — a component definition rendering as an aria-label. It is in the goodwill e-mail (t57) |
| Threads | deliberately out of the brand set: it is also an ordinary word |
| 👍 1.2k | a sample engagement count in the social planner |

`Kč0/M` is gone from this list, which is the one thing that changed.

### The three invoice editors — checked, 11 September

The template editor is `#invoice-template-editor-container`, **not** the
`#invoice-editor-container` an earlier note assumed. It does not matter: the
preview rule had already been widened in v74 to
`[id*="invoice"][id$="editor-container"] .preview-section`, which matches all
three. Verified on the live page — every node in the template preview reports
`content-zone` naming that rule, so a user building a Czech invoice template
sees exactly what their customer will get.

The rest of the template editor walks clean: 34 strings translated, one miss,
and that is a `12 / 40` character counter. The recurring-invoice list is clean
as well.

## What this layer can never reach

Three surfaces, one reason: they are not under `/location/<id>`, or they are a cross-origin frame.
Measured 12 September 2026, and worth keeping in one place because each was discovered separately.

| Surface | Why |
|---|---|
| The customer's **invoice, estimate and receipt** | HighLevel renders them on its own page. Our engine never loads there. |
| The **booking widget** | Served *only* from `api.leadconnectorhq.com` — the white-label domain 404s — and it ships `iframeResizer.contentWindow.js`, so the embed is an iframe **by design**. Custom JS on the agency's own funnel page cannot reach into it. `?locale=` and `?lang=` are ignored. |
| **Settings** company, profile, users, calendars, and the workflow builder | Cross-origin micro-frontends. |

**This is the ceiling of a DOM layer, not of this implementation.** No competitor reaches them
either. The only thing that would is HighLevel rendering those surfaces in the account's locale, or
letting an account supply its own strings — which is the ask in the founders brief.

**Still open on the booking widget:** whether it follows the account's platform language the way the
invoice document does. Untested — the language was already back to English when the widget was
checked. It changes nothing about reachability.

### Two money formats in one viewport — the sharpest evidence yet, 12 Sep

Opening the invoice editor on the **real business account** (nothing saved;
a draft is not created until Save is pressed — Tom, 12 Sep) puts HighLevel's
defect and our fix side by side on the same screen, for the same number:

| Half of the screen | Renders zero as | Whose code |
|---|---|---|
| the editor's own UI, left | **`0,00 Kč`** | ours — correct Czech |
| the document preview, right | **`Kč0.00`** | HighLevel's |

Verified in the DOM, not by eye: every node matching a zero amount, bucketed by
whether it sits inside `.preview-section`. Two on each side, and they disagree.

**This is worth more than any argument about Czech.** It is not a subtle
internationalisation complaint that a product manager can file behind twelve
shipped languages. It is a single screenshot in which HighLevel contradicts
itself — same product, same viewport, same value, one of them wrong — and the
wrong one is the half the *customer* receives. Use it in the ticket and in the
founders brief.

Evidence image: `harvest/evidence-two-money-formats.jpeg` — **local only.**
`harvest/` is gitignored because this repository is public, and that image
carries the business's real address and phone number. It is not in the repo and
must not be put there. Redact before any external use, and ask Tom first: it is
his brother-in-law's company, not a prop.

### Why the preview stays English, restated because the instinct is to fix it

The preview is **in our DOM and reachable** — it is left alone on purpose, by
the zone `[id*="invoice"][id$="editor-container"] .preview-section`. The
customer's actual document is rendered by HighLevel on a path the engine never
runs on. Translating the preview would show the operator a Czech invoice while
an English one goes to the customer: **the one mistake a person running a
business must never be shown.** Left alone, the preview is truthful.

A future session will notice the preview is reachable and want to translate it.
Do not.

### The notifications drawer — a deliberate trade, 12 September

`#notification-list` is blocked whole, so **notification titles stay English**
("New Email from …", "New Live Chat message from …"). Tom's decision, same day:
*"english titles are fine for now, we can revisit it later."*

Blocked whole rather than body-only because each row welds HighLevel's frame to
the record inside it to the message body below it, and one account's drawer is
not enough structure to carve safely. The refinement, once more notification
shapes have been seen, is a pattern per title with the record as a raw capture —
exactly what the activity feed already does.

Worth remembering what it was hiding: opening the bell put a customer's full
name, their phone number, an email address and the body of a reply sent to them
into the engine in one pass. Nothing was mistranslated; they were misses, and
misses feed the harvest queue.

### The map, measured route by route — 12 September, the real account

The row above said "the workflow builder" from one observation. Walking every nav
area on a real sub-account showed the wall is wider than that, and also narrower
than it sounds. Detection: a viewport-sized iframe whose `contentDocument` is
`null` and whose `contentWindow.location` throws `SecurityError`.

Reachable, swept, and at **zero misses** on real data:

Launchpad · Dashboard · Conversations (+ manual actions, templates, trigger
links, analytics, settings) · Contacts (+ import, tasks, companies, smart
lists) · Opportunities · Payments (invoices, estimates, proposals, recurring,
templates, subscriptions, transactions, orders, products, **invoice
settings**) · Calendars (+ appointments) · Websites · Funnels · Stores ·
Webinars · **Forms** · Surveys · Quizzes · Chat widget · QR codes · Media
library · Social Planner · Marketing (templates, countdown, trigger links,
brand boards) · Reporting (reports, Google Ads, Meta Ads, attribution, calls,
appointments) · Reputation (overview, requests, reviews, widgets, listings,
settings) · Memberships (courses, offers, client portal) · AI Agents ·
App Marketplace · Logo Showcase · the notifications drawer · the profile menu

Walled off — six, every one a cross-origin micro-frontend:

| Area | Host |
|---|---|
| **Automation** (workflows) | `client-app-automation-workflows.leadconnectorhq.com` |
| **Marketing → Emails** | `email-home-prod.leadconnectorhq.com` |
| **Page builder** (websites *and* funnels) | `page-builder.leadconnectorhq.com` |
| **Settings** (company, profile, users, …) | `client-app-crm-settings.leadconnectorhq.com` |
| **Affiliate Manager** | `client-app-affiliate-manager.leadconnectorhq.com` |
| **AI Studio** (vibe builder) | `leadgen-vibe-ai-builder.leadconnectorhq.com` |

The page builder is the most complete wall of the six: it fills the viewport
and the parent document contains **zero** characters of text.

**The cost is not evenly distributed, and that matters more than the count.**

- The **page builder** is a canvas — icons, drag handles, direct manipulation,
  instant visual feedback. The origin user built websites in it in English,
  unprompted, before this layer existed. It is the surface that needs language
  least, and losing it costs almost nothing.
- **AI Studio** and **Affiliate Manager** cost this business nothing at all: it
  uses neither.
- **Settings** is configured once, usually by the agency, not the operator.
- **Marketing → Emails** matters only when campaigns start.
- **Automation** is the expensive one. Triggers, conditions, action names, wait
  steps: all language, all consequence, and no visual scaffolding to guess
  from. A wrong guess there sends the wrong message to a real customer.

So of six walled areas, **one** hurts a working operator daily. That is the
number to quote — not six, which invites the reply that most of them do not
matter, and not one without the other five, which hides how much of the
product HighLevel has moved out of an agency's reach.

So "three walled areas" overstates the damage and understates the argument. The
wall does not fall on decoration. It falls hardest on the one area where being
wrong is expensive — which is the version of this to put in front of HighLevel.

### `onload` as a way in — tested, 12 September

Asked whether the iframe's load event could be used as a hook. It can be
attached, and it fires. It is a doorbell, not a key:

```
contentWindow.location.href  →  SecurityError
contentDocument              →  null
injecting a <script>         →  impossible
```

**One trap worth recording.** Read the frame too early and every one of those
*succeeds* — `contentDocument` returns a real document and reads fine. That is
the initial `about:blank`, which is same-origin. The shutter comes down when the
frame navigates to its own origin. Anyone testing this will get a false positive
first and could spend a day on it.

What *is* available across the boundary, all of it read-only:

| Signal | Use |
|---|---|
| `iframe.onload` | the frame finished loading |
| `{"type":"load","url":…}` | it says so itself, with the URL |
| postmate `route-change` | every navigation *inside* the frame, with the path |
| postmate `update-document-title` | the frame's page title |

These are worth wiring into settle detection — guessed wait times produced two
wrong route sweeps in one session before these were found.

**And one thing deliberately not used.** The child frame serialises its whole
DOM with rrweb and posts it to the parent — measured at **1,214 KB in 30
seconds** on the workflows screen. That is Pendo's cross-frame session recording
(installed natively by HighLevel), and it means the DOM we cannot read is being
volunteered out the front door. It stays unused: it is read-only anyway, it
carries customer data, and it belongs to someone else's telemetry channel.
Reading it in shipped code is exactly what the firewall exists to prevent. As a
measuring instrument on our own account it could quantify precisely how many
strings in Automation no agency can localise — which is ammunition, not a
feature.

**The same measurement, for the record:** 1,214 KB crossed the frame boundary
inside the browser while **600 bytes** left it, in two requests. The DOM is not
being uploaded. An earlier claim here that sessions were "sent to Pendo" was
asserted from the shape of the traffic and was not supported when measured.
Limits: ~55 seconds of one session, replay is commonly sampled, and the child
frame's own network is invisible for the same reason its DOM is.

## Honest caveats

- One sub-account, one dataset. A screen with no records shows fewer strings.
- Cross-origin iframes are outside this measurement entirely. No DOM layer can
  reach them, ours or a competitor's. **Checked 11 Sep:** of the Settings
  pages, only company, profile, users and calendars still sit in HighLevel's
  settings frame (`client-app-crm-settings.leadconnectorhq.com`), plus SMTP
  in a second one. The other sixteen are ordinary DOM and are now swept
  (phone system, WhatsApp, objects, fields, custom values, import, scoring,
  preferences, domains, tracking, integrations, private integrations, tags,
  Labs, audit logs, billing). The note that "Settings are iframes" was true
  once and had quietly stopped being true.
- The collector sees only what renders. Sections behind a toggle are invisible
  until someone flips it. The product editor's online-store fields (SEO,
  handle, collection, inventory) were off on every saved test product and
  showed up only as a **transient** flash while the form loaded (v77).
  **A transient miss on a form usually means a conditional section.** Walk the
  *create* form, where HighLevel's defaults switch things on, before
  dismissing it as noise.
- Counts occurrences, not distinct strings. The **distinct** gap across the whole
  operator surface is about fifty strings, which is the figure to use when
  estimating work rather than describing the product.
