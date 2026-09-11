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

### Known remaining leak, one of them

Smart-list **view names** in `#views-bar .view-label` on the contacts screen
("ZZ few", "ZZ many"). The same element class holds HighLevel's own labels
("All", "Add Smart List") which we translate correctly, so a selector would
break two working strings to protect two user-authored ones — and the backstop
cannot help, because a smart list's name appears nowhere inside the firewall.

Left deliberately. Severity is low: the name is the user's own, visible only to
them, and exact-match translation cannot alter it unless it collides with a
dictionary key. It is recorded here rather than quietly rounded off.

## The sweep route list

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
ai-agents/{agent-studio,voice-ai,conversation-ai,knowledge-base,agent-templates,content-ai,agent-logs}
```

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

**Parked, deliberately:** HighLevel's own sales pages. `ai-agents/getting-started`
is about 100 strings of sales copy and demo chats, `ai-agents/voice-ai`
shows a welcome pitch until the first agent exists, and `wordpress/dashboard`
is a hosting pitch until WordPress is activated. Translating them is a product
decision, not a gap. Also left alone: the survey and quiz builders' template
galleries, whose names and truncated tags ("Digital Mark...") are HighLevel's
sample content.

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
