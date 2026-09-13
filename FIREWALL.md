# The customer-data firewall

How the layer keeps a customer's own words out of the translator, what each
mechanism can and cannot reach, and one approach that was measured and **not**
taken.

Written 11 September 2026, engine v66. If you are here because a record name
turned up somewhere it should not, start at *Known gaps* at the bottom.

---

## Why there are two mechanisms and not one

The engine translates by **exact whole-string match**, so a contact named
"Zuzana" is never at risk — no dictionary has her name in it. The risk is a
customer whose company is called **Open House**, a tag reading **New**, a note
reading **Meeting**, or a pipeline stage called **Won**. Those *are* in the
dictionary, and without a firewall they would be silently rewritten in the
customer's own records.

Two mechanisms stop that, and they fail in different directions, which is why
both exist.

### 1. `CONTENT_ZONES` — a map of where customer data lives

A list of CSS selectors. Any element matching one, or inside one, is left
entirely alone — text and attributes both. It is checked with `closest()`, so
the question it answers is about **ancestry**: *is this node inside a
customer-data region?*

That question is stable. Once an element exists, its ancestors do not change
underneath it, so the answer is the same on every pass.

Its limit is equally simple: **a map can only name places that exist.** Every
selector was read off HighLevel's live DOM, and the list is audited with
`__kaDebug.dead()` because a selector matching nothing is not protection, it
only reads like protection.

### 2. The record backstop — content, where structure gives no signal

HighLevel copies record names into places no selector can reach. The case that
forced this: on the opportunities board, the hover tooltip holding a contact's
name is **structurally identical** to the five action tooltips beside it — same
class string, same parent, same child `<span>`, same attributes, all portalled
to `<body>`. Blocking the class would have reverted five correct translations
(*Hovor, Zobrazit konverzace, Přidat poznámku, Přidat úkol, Přidat schůzku*) to
protect one name. Only the **content** differs.

So the engine remembers every string the firewall **rejects**, and refuses to
report that same string where the selectors do not reach. `why()` calls it
`record-mirror`, distinct from `missing`.

It **suppresses reporting, not translation**, deliberately. A contact or company
named "Call" would otherwise stop the Call *button* translating everywhere on
the page — a customer's own data silently breaking the product for them, which
is worse than the leak it would close. The suppression therefore sits only on
the miss path, after `translate()` has already returned null.

Bounded at 800 strings, minimum length 3, per page load, never persisted.
`__kaDebug.records()` returns the **count**, never the strings.

**More ways the backstop learns what is customer data** (v70, v75, v79):

- **Input values.** A text input's value is customer data by definition, and
  nearly every edit screen repeats the record's name in a header or breadcrumb.
  Values are noted before the text walk, skipping any value we wrote ourselves.
- **The shape of a file name.** No path, no leading space, a known extension:
  `Adam_Sandler.jpg`, `smlouva-final_v2.pdf`. It turned up in Media Storage and
  then as an invoice attachment in bare styling classes with no anchor. The
  shape is reliable where a person's name is not; our interface never uses a
  bare file name as a label. `why()` reports it as `file-name`. A label like
  "Upload .csv" has a space before the dot and is not caught.
- **The shape of a whole URL** (v79). `https://…` or `www.…` and nothing else:
  the client portal prints the account's portal address as a link, and a
  business's website or booking link can turn up anywhere. `why()` reports it
  as `url`. A sentence containing a link is not caught.

- **The shape of a record id** (v81). 24 hex digits, HighLevel's database ids,
  printed as plain text by the product editor ("Internal Product Id").
  `why()` says `record-id`.

- **The shape of a phone number or e-mail address** (v84). Whole strings only;
  an ISO date is excluded, since it has the same characters. Found because
  the contact screen's call button is labelled "Call: +420555000121", and
  that label, number included, reached the harvest as a gap. The label itself
  is now translated by a pattern (`CALL_TO`) that passes the number through.

All of these suppress reporting only, like the rest of the backstop.

**Third-party content is customer data too** (v81, v84). The App
Marketplace and the AI agent templates list other companies' products: names,
publishers and descriptions. They're blocked on HighLevel's `data-testid`
names (`app-card-header`, `bot-card-name`, …), because translating
"Restaurant Menu" would rename someone else's product. The ads reports'
campaign table (`.table-hl tbody`) and a contact's attribution source
(`#attribution-value`) are blocked for the usual reason: they're the
account's own data.

**Widget tables read their column from the header** (v90, `hrCellBlocked()`).
HighLevel's own table component (`td.hr-data-table__body-cell`) carries no
column key on its cells, so until v90 the only possible rule was to block
every cell. That left dates and counts in English on the funnels list, the
dashboard widgets, and anywhere else the component is used. The key is on the
header cell instead, as its `aria-label` ("dateUpdated", "steps"). The cell's
`cellIndex` finds that header cell in O(1). The let-through is the same as for
the `data-col-key` tables, plus "steps". An unknown header, a missing header
or an empty key means blocked, as before. One subtlety: the engine translates
those aria-labels itself, so it now keeps each rewritten attribute's original
in `__kaAttrSrc_<name>` (NAMESPACE.md).

**Cost, measured 11 Sep:** the extra `closest('td.hr-data-table__body-cell')`
per text node adds **0.3–1.0 ms** to a full pass over every text node on
screen (funnels 115 nodes, dashboard 139, contacts list 302). The existing
zone check costs 1.5–2.5 ms on the same pass. Real passes walk only what
changed. Unlike the parked `:has()` approach, it doesn't grow with the
selector list.

When a table has no key at all (the tags list, v93), the header's original
English title is the fallback. It opens the column only on an exact date or
status title ("Created On", "Status"), anchored so that "Last Name" or
"Created By" never matches.

**Attribute-only zones** (v81, `SELF_ATTR_ZONES`). A zone works through
`closest()`, so it silences everything inside it. That cannot express "this
element's own attributes are a record, its children are ours". The product
editor's toolbar has exactly that shape: `title="ZZ digital goods"` on a bar
holding Zpět / Zahodit / Uložit. These selectors are tested with `matches()`
on the element itself. The walk still descends into it; only its own
attributes are refused. The backstop usually catches such a title anyway, but
only after the name has been seen in a zone, and on first paint the toolbar
can arrive first. The collector recorded that single leak, which is how it
was found.

**Order is load-bearing.** The text walk populates the record set; the attribute
pass consults it. Running attributes first — as the engine did until v59 — meant
that on the first pass over a freshly rendered screen, every wrapper attribute
mirroring a record was reported before the records underneath it existed. That
produced a leak that appeared exactly once and never again, which is the worst
kind to chase.

---

## The third mechanism, measured and not taken: `:has()`

**Status: parked, 11 September 2026. Nothing was built. Revisit if the trigger
below fires.**

The idea was to let `CONTENT_ZONES` ask about *descendants* as well as
ancestors — block an element's attributes if it **contains** a record:

```css
[aria-label]:has([id^="data-stage-name-"])
[aria-label]:has([id="task-title-text"])
[title]:has(.hr-avatar__text)
```

It would slot straight into the existing list, since `closest()` accepts it.

### What it costs — measured on the live dashboard

2,282 elements, 120 elements carrying `placeholder`/`title`/`aria-label`,
timing `closest()` over the whole zone list once per target:

| Selector list | ms per attribute pass |
|---|---|
| current | **11.0** |
| `+ [title]:has(.hr-avatar__text)` | 11.1 |
| `+ [aria-label]:has([id="task-title-text"])` | 24.8 |
| `+ [aria-label]:has([id^="data-stage-name-"])` | **71.6** |
| all three | **115.9** (11×) |

The same three rules on other routes:

| Route | DOM | targets | now | with `:has()` | |
|---|---|---|---|---|---|
| contacts smart list | 2,300 | 49 | 1.8 | 2.2 | 1.2× |
| opportunities | 1,514 | 40 | 2.3 | 2.7 | 1.2× |
| conversations | 984 | 48 | 2.8 | 4.8 | 1.8× |

Two things fall out, and the second matters more than the first.

**What goes *inside* `:has()` decides the cost.** A **class** is near-free — the
browser resolves it from a bucket. An **attribute** selector, and especially a
**prefix** match, forces a scan of every descendant of every ancestor, per
element, per pass.

**The cost is paid precisely where the rule is relevant.** It is nearly free on
screens where the `:has()` finds nothing, and 11× on the one screen it would
protect. That is the worst possible distribution: you pay for the rule only when
it is doing its job.

> **Measurement caveat, recorded so nobody repeats it.** A fourth case,
> `:has(div)`, benchmarked at 4.7 ms — *faster* than the 11.0 baseline. That is
> not a speedup. `closest()` returns on the first matching ancestor, so a rule
> that matches immediately stops the rest of the list being evaluated. The
> benchmark measures "closest until first match", not the cost of a rule in
> isolation. Any future timing of this has the same hazard.

### Why it was not taken — cost is the least of it

**1. It fails open, and non-deterministically.** This is the one that decided
it. Every other zone entry asks *"is this inside a customer-data region?"* —
ancestry, stable from the moment the element exists. `:has()` asks *"does this
contain customer data right now?"* — which depends on whether the children have
rendered. In a Vue app they arrive asynchronously, so the same wrapper is
blocked on one pass and not on another, and on the pass where it is not, the
attribute leaks.

That is the v59 walk-order bug again — except there the fix was reordering, and
here no ordering helps, because the children genuinely do not exist yet. **A
firewall whose answer changes between passes is worse than one with a known
hole**, because the hole is not reproducible and nobody can confirm a fix.

**2. It does not cover the case that motivated it.** The opportunity-card
tooltip has no record *inside* it. It is a sibling portal at `<body>` level
whose own text **is** the record — there is nothing to `:has()`. The cases it
*would* cover, such as the task checkbox whose `aria-label` mirrors the title
below it, are already handled by the backstop, deterministically, at one Set
lookup on the miss path.

**3. One bad selector stops the whole firewall.** `closest()` throws on an
invalid selector, and the zone list is a single joined string — so a malformed
entry does not degrade the firewall, it **kills** it, and `blockedAttr()`
returning falsy means *translate everything*. Today's selectors are simple
enough that this is theoretical. `:has()` selectors are intricate enough that it
is not. Fixable — validate each selector at boot and drop the bad one loudly —
but that is machinery added for this.

**4. A browser floor for nothing.** `:has()` inside `closest()` needs
Firefox 121 (December 2023), Chrome 105, Safari 15.4. Probably fine. But it is a
minimum taken on in exchange for something already solved.

### What would change the decision

The collector reporting **wrapper attributes the backstop cannot catch** — a
record name in an attribute whose string appears nowhere inside the firewall on
that page — often enough that writing a selector per component becomes tedious.

As of 11 September that rate is **zero**: twelve routes, no suspects.

If it does change, the measurement above says write `:has(.some-class)`, never
`:has([attr])` and never a prefix match.

### It was taken after all, in the opposite direction — v114, 12 September

The decision above still stands for what it actually decided. v114 uses
`:not(:has(...))` anyway, and the difference is worth being precise about,
because "we parked `:has()`" would otherwise read as a contradiction.

**The parked proposal used `:has()` to CREATE a block.** "Block this wrapper's
attributes if it *contains* a record." Its fatal flaw was the direction of
failure: before the children render, the `:has()` finds nothing, the block does
not apply, and the attribute leaks. It **fails open**, non-deterministically.

**v114 uses `:not(:has(...))` to NARROW a block that already exists.** The zone
blocks every contact-field label; the `:not(:has(standard slug))` carves out
HighLevel's own fields. Before the children render, the `:has()` finds nothing,
`:not()` is therefore true, and the label **stays blocked**. It **fails
closed** — toward the firewall, never through it. The worst outcome of a late
render is an English label for one paint, which is the same outcome as not
having written the rule.

That inversion is the whole argument. Objection 1 — the one that decided the
parking — does not apply to a subtractive rule, and cannot.

**Objection 3 still applied and was paid for.** `closest()` throws on an
invalid selector and the zone list is one joined string, so a malformed `:has()`
does not degrade the firewall, it kills it, and a dead firewall translates
customer data. `FIELD_LABEL_ZONE` therefore proves the selector parses —
`document.querySelector(scoped)` inside a `try` — before it is allowed into the
list, and falls back to the blanket zone if it throws. An English label is a
blemish; a firewall that throws is a data leak.

**The cost was re-measured, and the old rule of thumb needs refining.** On the
real contact detail page — 1,428 nodes, 91 attribute targets:

| Selector list | ms per attribute pass |
|---|---|
| blanket zone (no `:has()`) | **0.36** |
| with `:not(:has(19 × [id="…"]))` | **0.60** |

1.7×, not the 11× the dashboard measured — and this is an `[attr]` match with
nineteen of them, exactly the shape the earlier note said never to write. Both
measurements are correct; the rule of thumb was the wrong summary of them.

What actually drives the cost is **how the thing inside `:has()` is resolved**,
not whether it is an attribute:

- `[id="contact.first_name"]` is an **exact id** — the browser answers it from
  the id bucket, as cheaply as a class. Nineteen of them are nineteen bucket
  lookups.
- `[id^="data-stage-name-"]` is a **prefix** — no bucket exists, so it scans
  every descendant of every ancestor, per element, per pass. That is where the
  71.6 ms came from.

And **the outer scope decides how many elements reach the `:has()` at all**. The
v114 rule is gated behind `#field-container [id$="-form-item"]`, which exists on
one route and matches about fifteen elements there; on every other route
`closest()` fails at the gate and the `:has()` is never evaluated.

So the refined rule, replacing the one above: **inside `:has()`, use anything
the browser can resolve from a bucket — a class or an exact id — and never a
prefix or substring match. Gate it behind a selector that is cheap and rare, so
the `:has()` is reached by few elements on one route rather than by many on
all of them.**

---

## HighLevel's own phrases inside a zone — built, v98/v99

Decided with Tom on 11 Sep 2026, built the same day. Some zones mix
HighLevel's own text with customer data in the same component, and no
selector separates them. The fix is a **per-zone allowlist of exact phrases**
that are translated even inside the zone. Everything else in the zone stays
blocked.

**Why this is acceptable:** the users create their records in their own
language. A Czech business does not name a smart list "All" or a pipeline "No
pipeline available", so an exact English interface phrase inside a zone is
almost certainly HighLevel's, not theirs. (Tom's reasoning.)

**How it's bounded:**
- **Scoped to one zone per phrase.** "All" is allowed only in the smart-list
  tabs, never globally inside zones. That keeps the blast radius to the one
  place where the phrase is known to be HighLevel's.
- **Exact, whole-string match** from the dictionary. No rules, no partial
  matches.
- **The residual risk is named, not hidden: snapshots.** An agency snapshot
  built in English (a US template) brings English record names with it: the
  test account's own "ZZ New Lead" came from one. A snapshot record named
  exactly like an allowlisted phrase in the same zone would be translated. The
  per-zone scoping and the shortness of the list keep that unlikely. Check a
  new phrase against common snapshot vocabulary before adding it.

**Structure was checked first, and it decided half of it.** On the live tab bar,
`Add Smart List` sits **outside** `.lists` while `All` sits inside it, in an
element identical to a user's list — same tag, same classes, same attributes,
and the order is the user's to change. So the zone is scoped
`#views-bar .lists .view-label`, which keeps *Add Smart List* translating with
no allowlist at all, and only `All` needs a phrase.

**The entries as built:**

| Zone | Phrases |
|---|---|
| `#views-bar .lists .view-label` | All |
| `[id="select-id"] .hr-base-selection-label` | No pipeline available |
| `[id*="-select-pipeline_"] .hr-base-selection-label` | All pipelines |
| `[id*="manual-action-workflow-selection"] …` | All, all |
| `[id*="manual-action-campaign-selection"] …` | All, all |
| `[id*="task-user-selection"] …`, `[id*="user-sales-efficiency"] …` | All users |
| `[id*="gbp-page"] …` | Please Select |

**Everything below the first two rows was found by censusing the family**, and
none of it was in the design. The dashboard has **six more** record pickers
built like the one that was: five reporting widgets with their own pipeline
select (`reporting_<widget>-select-pipeline_<id>`), plus workflow, campaign,
user and Google-Business-page pickers. Each reads `All …` until somebody
chooses, and then shows a record's name. They had been leaking by default and
looked clean only because this account has one pipeline and no workflows.

**How a phrase is applied:** only when its own zone is the *only* thing
blocking the node. Inside any other zone, or a widget-table column, it stays
blocked. Text nodes only — never attributes. A node we already translated is
recognised by its `__kaDone` marker, so a phrase survives re-renders.

**The cost of a missing phrase is silence.** A label inside a zone whose
phrase list does not cover it stays English and is *not* reported as a gap —
zones never report. `__kaDebug.phrases` lists what each zone lets through, and
a sweep's `why()` walk shows such a node as `content-zone` rather than
`missing`. That is the trade for protecting the record names beside it.

## Declared walls — English on purpose, and able to say so (v127)

Tom, 12 Sep: *"create a wall on the invoice preview area so you don't end up
with false reports later."*

There are now **three** reasons a string is not translated, and until v127 the
engine could only express two:

| | meaning | example |
|---|---|---|
| content zone | we **must not** — it is somebody's data | a customer's message |
| iframe | we **cannot** — another origin | the workflow builder |
| **declared wall** | we **could, and doing so would be wrong** | the invoice preview |

The invoice preview is reachable, in our own DOM, and stays English because
**the document the customer receives is English**. A Czech preview over an
English document is the one mistake a person running a business must never be
shown.

**Why the third category earns its keep.** Before v127, `why()` answered
`content-zone` on a preview node. That reads as *"this is customer data"* —
which is not the reason — and it is the exact shape of a false report: a future
session sees English, sees a verdict that does not explain it, and "fixes"
something already correct. The node now answers:

```
reason: 'declared-wall'   wall: 'invoice-preview'   note: <the whole reason>
```

**The blocking has not moved.** `CONTENT_ZONES` still performs it; a declared
wall only *explains* it, so behaviour is byte-for-byte what it was. That split
is deliberate — an explanation layer cannot introduce a leak.

**It checks itself.** A wall that explains a block which is no longer happening
is worse than the generic answer it replaced, so `WALL_DRIFT` proves at boot
that every wall selector is still in `CONTENT_ZONES`, and
`__kaDebug.walls()` reports a **live match count** — a wall HighLevel has
renamed shows `live: 0` instead of staying silent. Verified on the real
account: `live: 1`, `blocking: true`, `drift: []`.

**Not walled, on purpose:** estimates and proposals. Neither has ever been seen
with data on it, and a selector written for an unobserved shape is how the old
firewall came to match nothing. Walk them when the account has one.

## Known gaps

### Closed on the first real account — 12 September, v113–v116

All four needed real data. A test account has no custom fields, no media
folders, no inbox and no notifications, so none of them could appear.

| Gap | What reached the engine | Closed by |
|---|---|---|
| Contact field labels | HighLevel's own six labels were **blocked** by a rule that was simply wrong (see above) | slug-scoped `FIELD_LABEL_ZONE` |
| Message threads | thread status lines carrying no chat bubble | `.message-item` |
| Media folder / file names | seven folder names, safe only by dictionary luck | `.folder-card-wrapper .truncate`, `.media-file-name` |
| **Notifications drawer** | a customer's name, phone, email and a reply body — `suspect: phone`, `suspect: email` | `#notification-list` |

The drawer is the one to remember. **Nothing was mistranslated in any of the
four** — they were misses. A miss enters the harvest queue, and the hive
reports what installs see, so the failure mode was not a wrong word on screen
but someone's customer list reaching a shared store.

Two smaller ones the same night, neither a leak: HighLevel's **marketing
figures and demo names** on the AI Agents page (`.hero-stats-value`,
`.trust-value`, `.agent-conversation-panel__user-row`), and the rotating
**what's-new feed** (`.feature-discovery-main-container`) — zoned because the
content churns weekly, not because it is unimportant. Plus `CODE_SHAPE`, after
the contacts smart list rendered a **Vue render function into a text node**.

### Still open

~~**Smart-list view names**~~ — **closed in v98** by the phrase allowlist
above. The tabs are zoned and *All* comes back through a phrase, so the user's
list names are protected and HighLevel's two labels still translate.

**A record picker's option MENU**, found 11 Sep while building the allowlist.
The selected label is reachable and is now zoned; the **dropdown's options are
not**. HighLevel portals the menu out of the select — the open list sits in
`.hr-select-menu-container` under a virtual-list wrapper at body level, with
nothing tying it back to the picker that opened it. A zone on
`.hr-select-option-label` would reach it, and would also silence every status,
type and enum picker in the product, which is a far bigger loss than the leak.

Today those options are caught by the **record backstop**: on the dashboard's
user picker, "zz tom zz keyser" reports `record-mirror`, because the same name
appears inside a zone elsewhere on the page. **That is coverage by
coincidence.** A second user, whose name appears nowhere else on that screen,
would reach the engine as an ordinary miss. It cannot be translated unless the
name collides with a dictionary key, but it would reach the harvest.

Worth watching in the sweeps rather than fixing blind: the fix needs a real
second user on the account to confirm against, and this one has one.

**Built in v140, 13 Sep: record menus are recognised by their head.** Tom:
*"only translate the top item of a specific picker and just mark the other
items below ignore."* He confirmed that the dashboard user picker's list opens
with "All users". Tying the portalled menu back to its select turned out to be
unnecessary; the menu's own first option says what it lists.

A menu (`.hr-select__menu-container`, v141) holding an option labelled with a
`RECORD_MENU_HEADS` phrase ("All users", "All pipelines", English or our Czech)
is marked on the container. From then on, only that head translates. Every
other option is blocked text, attributes included, and goes to the record
backstop. The mark is sticky because the list is virtual: the head scrolls out
of the DOM while the names stay on screen. `why()` answers `record-menu`.

Bare "All" and "Please Select" are deliberately NOT heads: they also open
status and type menus. Those pickers (workflow, campaign, GBP) still rely on
the record backstop.

**The live check corrected v140.** `.hr-select-menu-container`, the class the
11 Sep note gave for the menu, wraps each option on its own. The whole menu is
`.hr-select__menu-container` (note the double underscore). v140 therefore
marked the head's own box: "zz tom zz keyser" was still covered only by
`record-mirror`. v141 uses the real menu. The status picker beside it ("Vše /
Čeká / Dokončeno") was unmarked and translated under v140.

**Verified live under v142, 13 Sep, ZZ My Gym dashboard.** The Tasks widget's user menu is marked.
"Všichni uživatelé" (source "All users") reports `translated`, and "zz tom zz keyser" reports
`record-menu`, so it is no longer covered by `record-mirror` coincidence. With both menus open, the
status menu next to it stayed a separate, unmarked container: All / Pending / Completed all read
`translated`. The feared reuse of one container across pickers was not seen.

**The lead-scoring rules list** (`settings/scoring`), found 12 Sep. Each saved
rule renders as one composed sentence — *"if an email is - Opened Add Points
1"* — in a widget table whose cells carry **no column key and no recognisable
header title**, so `hrCellBlocked()` blocks the column by default and the whole
sentence stays English.

It is the right default and the wrong outcome. The sentence genuinely mixes
our words (*if an email is*, *Add Points*, *In calendar*) with the customer's
(a calendar named "Boxing Class", a raw tag id), so letting the column through
would put record names back in front of the dictionary. The shape that fits is
the one the activity feed uses — a **pattern rule with raw captures** — but a
pattern never runs, because the cell is blocked before `translate()` is
reached.

**Left as it is, deliberately, and noted here because nothing else will tell
you:** a blocked column is silent by construction. It cost nothing to find
only because somebody opened the screen. Lead scoring is a builder surface
that a sub-account operator does not configure, so it sits below the operator
work — but if this is ever picked up, the fix is to let that column through
*and* add the pattern in the same change, never one without the other.

**Fixed in v143 / data v96, verified live 13 Sep (ZZ My Gym, impersonating the
account user).** The column was NOT let through. `scoringCell()` admits a text
node only when it is ours: a `SCORE_*` rule matches in "Action", or an exact
dictionary entry appears in "Calculation". A sentence shape we have not seen
stays blocked. All four saved rules read Czech, and `why()` gives `translated`
for each: "Pokud je e-mail – Otevřeno", "Pokud je stav schůzky – Potvrzeno",
"Pokud kontakt odpoví a má štítek – Jxn3s89awJOjROhjUOcu" and "Pokud si kontakt
rezervuje schůzku v kalendáři – Boxing Class". Tag and calendar values pass
through raw; "Add Points" reads "Přidat body". The Czech is MY CZECH and needs
native review.

**Cross-origin iframes** are outside every mechanism here, and outside any
DOM layer's reach. That now means four Settings pages (company, profile,
users, calendars), SMTP, and the workflow builder. Most other Settings pages
moved into the main DOM at some point, and COVERAGE.md lists which.

---

## The habit that found most of these

**When a selector names one member of a family, census the family.** Three
separate leaks fixed on 11 September were the same mistake, shipped weeks apart:
two pipeline selects where only one was named, two avatar components where only
one was named, five ids in the tasks widget where only one was blocked. Every
one was found by asking the **live DOM** what else shared the shape — not by
reading the code.

A fourth, the same afternoon: the **invoice list** protected the customer's
initials (the avatar rule) and leaked their name, the invoice title, number and
amount. It only appeared once the account had real invoices, which is the other
half of the lesson — **an empty screen cannot leak, so it cannot tell you it is
safe.** Fixed with a column rule on `data-col-key` that lets through dates,
status and the row menu and blocks the rest by default.

Run `__kaDebug.dead()` after any change here, and re-walk with the collector
before claiming a fix worked.

### The stronger form of that lesson — 12 September, first real account

"An empty screen cannot leak" understates it. **A test account does not merely
hide leaks; it invents structure that does not exist in production, and a rule
written against that structure is wrong in a way no amount of re-testing on the
test account can reveal.**

v113 shipped a custom-field firewall keyed on the form-item's id:

```
#field-container [id$="-form-item"]:not([id^="contact."]) .hr-form-item-label__text
```

The `:not([id^="contact."])` was there to let HighLevel's own labels through,
on the belief that HighLevel's fields were wrapped in `contact.first_name-form-item`
while the business's carried a record id. On the test account that looked true,
because the test account **has no custom fields** — there was nothing to
contrast against, and a single observation was read as a rule.

On the first account with real fields in it, every form-item carries a record
id — HighLevel's own six and the business's eight alike. The escape hatch
therefore never fired, and the firewall swallowed *both*: the business's field
names, correctly, and "First name", "Last name", "Email", "Phone", "Contact
source", "Contact type", which are HighLevel's chrome and should have been
Czech. The layer's very first screen on a real business showed English labels.

The real discriminator was one level down, and only visible with both kinds of
field on screen at once:

| label | slug on the inner div |
|---|---|
| First name | `contact.first_name` |
| Contact source | `contact.source` |
| Servis Request | `contact.servis_request` |
| ÚKLID EN Request | `contact.klid_en_request` |

*(The two custom rows are illustrative. The account they were observed on is a
real business and this repository is public — see `.gitignore`. The shape is
exactly as observed; only the words are changed.)*

HighLevel's standard fields use a **closed vocabulary** of slugs. A custom
field's slug is a slugified version of whatever the business typed — which is
why `ÚKLID` becomes `klid`, **the diacritics silently dropped**. So
`STD_CONTACT_FIELDS` is an explicit list and everything absent from it is
somebody's own words.

**Match the slug, never the English label.** The obvious cheaper fix was a
phrase allowlist — let "First name", "Email" and the rest through by text. It
would have worked on this account and quietly mistranslated the first business
that names a custom field "Email" or "Message". Tom's account already has a
custom field called **"Message"** and another called **"Work requested"** —
English words, his authorship, and correctly left in English by the shipped
rule. A text allowlist would have rewritten them.

The generalisation: **a rule that separates the vendor's strings from the
customer's must key on something the vendor controls and the customer cannot
type.** An id slug from a closed set qualifies. An English word never does.
