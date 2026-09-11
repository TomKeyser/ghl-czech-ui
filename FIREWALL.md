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

---

## Known gaps

**Smart-list view names**, `#views-bar .view-label` on the contacts screen
("ZZ few", "ZZ many"). The same class holds HighLevel's own labels — *All*,
*Add Smart List* — which we translate correctly, so a selector would break two
working strings to protect two user-authored ones.

Neither mechanism reaches it: the backstop cannot help because a smart list's
name appears nowhere inside the firewall, and `:has()` would not help either
(`.view-label` has no record child). Left deliberately. Severity is low — the
name is the user's own, seen only by them, and exact-match translation cannot
alter it unless it collides with a dictionary key.

**Cross-origin iframes** — Settings sub-pages, the workflow builder — are
outside every mechanism here, and outside any DOM layer's reach.

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
