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
| `__kaDebug` | engine | Read-only. `why(node[,attr])`, `dead()`, `translate`, `zones`, `attrs`, `maxLen`. |
| `__kaOnMiss` | **a collector registers it** | The engine calls it at its two miss sites if present. Absent by default. |
| `__kaCollect` | collector.js | `stats() top() suspect() truncated() all() download() clear()` |
| `__kaCollectActive` | collector.js | Double-load guard. |
| `__kaPickerActive`, `__kaPickerVersion` | gap-picker.js | |

## Node properties

Set on DOM nodes, not attributes: invisible in markup, never serialised into
`innerHTML`, never saved anywhere.

| Name | On | Holds |
|---|---|---|
| `__kaDone` | text nodes | The translated text we wrote. Compared against `textContent` so a framework re-render is retranslated and an untouched node is skipped. |
| `__kaSrc` | text nodes | The **English we replaced**, so the shell can be put back when the gate closes. |
| `__kaAttr_<name>` | elements | The attribute value we wrote, e.g. `__kaAttr_title`. The counterpart of `__kaDone`; without it `doAttrs` re-read its own output every pass and reported it as a gap. |
| `__kaVal` | inputs, textareas | The prefilled value we wrote. |

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
