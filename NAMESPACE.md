# Namespace registry

Every name Keytone puts on somebody else's page.

**The rule: everything we add starts with `ka`.** One prefix, no exceptions, so
`grep -rn "\bka[A-Z_]\|data-ka-\|ka_" .` finds all of it. This exists to stop us
colliding with **ourselves** — the next Keytone product will run in the same DOM
as this one, and a silent collision between two of our own scripts is far harder
to spot than one with a stranger's.

Renamed wholesale on 2026-09-10 (engine v32). The old names were `__cs*` and
`__ghl*`: `cs` meant Czech in a product that already ships Spanish, and `__ghl`
sat in *HighLevel's* namespace, reading as though they had set it.

---

## Window globals

| Name | Set by | Notes |
|---|---|---|
| `__kaLang` | **the loader** | The only one set from **outside** the engine. Changing it means editing the Custom JS field in every install — cheap now, expensive after launch. |
| `__kaAgencyToo` | the loader, optionally | Opts agency users back into translation, for a Czech-speaking agency. |
| `__kaActive` | engine | Guard against double-loading. |
| `__kaVersion` | engine | Deployment check: `__kaVersion` in the console tells you whether the CDN has caught up. |
| `__kaStatus` | engine | Diagnosis: state, locale, localeSource, platformLang, packSource, audience, userType, translatingHere, notTranslatingBecause, reverted, terms/curated/fromApi. |
| `__kaDebug` | engine | Read-only. `why(node[,attr])`, `dead()`, `records()`, `translate`, `zones`, `attrs`, `maxLen`. |
| `__kaOnMiss` | **a collector registers it** | The engine calls it at its two miss sites if present. Absent by default. |
| `__kaCollect` | collector.js | `stats() top() suspect() truncated() transient() all() download() clear()` |
| `__kaCollectActive` | collector.js | Double-load guard. |
| `__kaPickerActive`, `__kaPickerVersion` | gap-picker.js | |
| `__kaRules` | i18n-rules.js | The language-free pattern engine and formatters. |
| `__kaSource` | lang/source-*.js | Source-language rule tables, keyed by language (`__kaSource.en`). |
| `__kaPacks` | lang/<locale>.js | Target language packs, keyed by locale (`__kaPacks['cs-CZ']`). |

**Renamed v76, 11 Sep 2026, from `I18nRules`, `GhlSourceRules` and
`GhlLangPacks`.** They escaped the v32 sweep because the DATA files set them, and
that sweep only grepped the engine. For one release both names were published —
an engine can sit in a browser's cache for about ten minutes after a deploy while
the data files load fresh, and an engine meeting only names it does not know
switches the layer off.

**The aliases were removed on 12 Sep 2026** (v111), thirty releases later, from
i18n-rules.js, source-en.js, cs-CZ.js, es.js and the fallback in `activate()`.
`review-tool.js` went with them — and its copy under `harvest/` turned out to
read *only* the old name, so that copy would have broken the moment the alias
went. Both copies now read `__kaPacks`. **Two copies of a file are two places to
change**, which is the same lesson the v32 sweep left.

## Node properties

Set on DOM nodes, not attributes: invisible in markup, never serialised into
`innerHTML`, never saved anywhere.

| Name | On | Holds |
|---|---|---|
| `__kaDone` | text nodes | The translated text we wrote. Compared against `textContent` so a framework re-render is retranslated and an untouched node is skipped. |
| `__kaSrc` | text nodes | The **English we replaced**, so the shell can be put back when the gate closes. |
| `__kaAttr_<name>` | elements | The attribute value we wrote, e.g. `__kaAttr_title`. The counterpart of `__kaDone`; without it `doAttrs` re-read its own output every pass and reported it as a gap. |
| `__kaVal` | inputs, textareas | The prefilled value we wrote. |
| `__kaAttrSrc_<name>` | elements | The attribute's **original** value, before we translated it (v90). A widget table's column key lives in its header cell's `aria-label` ("dateUpdated"). Translating that label would otherwise destroy the key that `hrCellBlocked()` reads to decide whether a column is ours. |

## The record backstop (v55)

Not a name, but it belongs beside the attribute contract because it is the other
half of the firewall. **FIREWALL.md** is the full account — both mechanisms,
what each cannot reach, the known gaps, and the `:has()` approach that was
measured and parked.

`CONTENT_ZONES` is a map of **where** customer data lives, and a map can only
name places that exist. HighLevel copies record names into places no selector
can reach: the opportunity card's hover tooltip holding a contact's name is
structurally identical to the five action tooltips beside it — same classes,
same parent, same child span. Only the content differs.

So the engine remembers every string the firewall **rejects**, and refuses to
report that same string when it reappears somewhere the selectors do not cover.
`why()` calls it `record-mirror`, distinct from `missing`.

It suppresses **reporting, not translation**, deliberately: a record named
"Call" would otherwise stop the Call button translating everywhere on the page.
Bounded at 800 strings, per page load, never persisted. `__kaDebug.records()`
returns the **count**, never the strings — the whole point is that customer data
does not reach tooling, and a debug surface exists to be read by tooling.

## What we rewrite on HighLevel's page

Decided with Tom on 11 Sep 2026 (design, v97).

**WHITE LABEL (Tom, 12 Sep 2026): nothing we author ever names the platform.**
Applies to every string we put on screen — the planned user message area first
(`DESIGN.md` §1), but also the dictionary, because a translation is text we
author even when the English was not.

Two entries were neutralised the day the rule was set:

| English source | was | now |
|---|---|---|
| `Find anything in HighLevel...` | „…v HighLevelu…" | **„Najít cokoli…"** |
| the MRR footnote | „…existují v HighLevelu…" | **„…existují v systému…"** |

These are the rare cases where the translation is **better than the original
rather than merely faithful**, and they are safe on either kind of account: a
white-labelled instance never renders the vendor's name anyway (verified on a
real agency domain — "HighLevel" appears nowhere on screen), and on an
unbranded one the neutral Czech is still correct.

The rule extends to our own brand. If this layer is sold to other agencies,
"Keytone" on their screen is exactly as wrong as "HighLevel" on Tom's.
Attribution, if ever wanted, is a pack option — never a literal in the engine.

- **Text on screen, `placeholder`, `title` and `aria-label`, and nothing else.**
  Never `id`, `class`, `data-*`, `name`, `href` or `value`, **with one named
  exception**: `TRANSLATE_PREFILLS` (on) lets the engine rewrite an input's
  value when that value is one of **HighLevel's own defaults** — the list is
  `PREFILL_DEFAULTS` in i18n-rules.js, three entries, exact and
  case-sensitive. Nothing else in a text field is touched, because `doValues`
  dispatches `input`/`change`, so whatever it writes is what gets saved.
  Decided 12 Sep after measuring the risk: 25 of 59 record names typical of an
  English snapshot collide with the dictionary. (This line said prefills were
  *off* until 11 Sep, which was simply wrong.)
- **Everything the viewer can perceive is translated, and screen readers
  count.** So `aria-label` is translated too, **including HighLevel's raw keys**
  printed there (`dateUpdated`, `common.resize`). A blind Czech user should hear
  Czech. An earlier proposal to leave key-shaped values untouched was
  **rejected**.
- **Rewritten, never removed.** A translated attribute keeps its English
  original in `__kaAttrSrc_<name>`, and a text node keeps it in `__kaSrc`, so a
  full revert is always possible. Our own code reads the original where it
  needs the key (`hrCellBlocked()`).
- **The risk this accepts:** HighLevel's own code may read an attribute we
  translated (for sorting, tests or analytics) and get Czech. **The safety net is
  an audit, not a blanket exemption:** search HighLevel's loaded scripts for
  selectors that match on `aria-label=` or `title=` values, and exercise
  sorting, filters and row actions on translated screens. Any attribute found
  to be a handle goes on an exemption list. **Audit pending.**

## The attribute contract

**`data-ka-ignore`** — any Keytone UI injected into the page sets this on its
root, and the engine skips the whole subtree, text and attributes alike.

Use it. It replaced an older trick of wrapping overlays in `<code>`, which worked
only because `code` was already in `CONTENT_ZONES` and forced every overlay to
live inside a monospace element and undo its own styling. That hack caused a real
bug during the Czech review: the engine translated the review tool's own buttons,
so flag mode could be switched on and never off.

An **attribute** rather than a JS property, deliberately: a property cannot
appear in a selector, so the engine would need its own ancestor walk on every
text node. The attribute drops into `CONTENT_ZONES` and costs nothing, because
`closest()` is already walking.

## Element ids

`#ka-gap-badge`, `#ka-gap-panel` — the gap picker. Both also carry
`data-ka-ignore`; the ids are for the capture-phase click handler.

`#ka-pack-css` — the engine's `<style>` element in `<head>`, holding the pack's
CSS-drawn labels (`pack.pseudo`) and its typography fixes (`pack.css`). Removed
when the gate closes, restored when it opens. **Renamed 11 Sep from
`ghl-cs-pseudo`**, which escaped the v32 sweep — a name we create, in
HighLevel's prefix, and not listed here. Found by accident while adding
`pack.css`; worth a `grep -n "ghl" ghlczechui.js` for any other stragglers.

## localStorage

| Key | Written by | Lifetime |
|---|---|---|
| `ka_off` | engine (`?nocs=1`) | Until cleared. **The commonest cause of "it worked yesterday"** — the layer stays silent and looks broken. |
| `ka_lang` | engine (`?cslang=`) | Until cleared. Overrides the loader's choice, per browser. |
| `ka_collect_v1` | collector | Until downloaded and cleared. |
| `ka_gaps_v1`, `ka_gap_pos` | gap picker | Picks and badge position. |

Per browser, per device. None of it reaches other viewers or us.

## Not ours, though they appear in our lists

`CONTENT_ZONES` contains `#claude-agent-glow-border`, `#claude-agent-stop-container`
and `#claude-phantom-cursor`. **These are Claude Code's browser-automation
overlay, not Keytone's.** They are excluded so the engine never rewrites the
cursor and controls of the tool driving the browser. Do not "tidy them away".

## What is load-bearing across a version boundary

Changing these means touching every install:

- **`__kaLang`** — set by the loader in the Custom JS field.
- **`__kaAgencyToo`** — same.
- The **script URL** itself, since the engine resolves its own dependencies
  relative to `document.currentScript.src`.

Everything else is internal to one file and free to change: node properties,
element ids, storage keys, the debug surface.

## Adding a name

1. Prefix it `ka`.
2. Add it here.
3. If a **tool** renders anything, set `data-ka-ignore` on its root — do not
   invent a second exemption mechanism.
4. If it persists, use a `ka_` storage key and say what clears it.
