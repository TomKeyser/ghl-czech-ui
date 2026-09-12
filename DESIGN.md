# Designs decided but not built

Nothing in this file is implemented. It is the home for designs Tom has
decided on, so they stop living only in a session transcript. See
`[[design-mode-no-code]]`: in a discussion we document, we do not code.

---

## 1. The user message area — status notices in the user's own language

**Raised by Tom, 12 September 2026. Design only; no code.**

> *"It's time to add a message area for the end user to the page for status
> messages. Example: if you're on a page with an iframe I'd like to have the
> message above the iframe that says we can't translate this page and why.
> That new message area for the user can be used throughout the site for other
> things."*

### Why now

Six areas of HighLevel are cross-origin micro-frontends — Automation, Marketing
→ Emails, the page builder, Settings, Affiliate Manager, AI Studio. On those
screens the layer does nothing, silently.

**Silence is the worst available answer.** A user who meets an English screen
with no explanation does not conclude "this particular area is out of reach".
They conclude the translation is unreliable, and that doubt spreads to the
screens we *did* translate. One sentence turns an apparent defect into a stated
boundary.

### What already exists, and what is missing

`refreshStatus()` in `ghlczechui.js` already computes
`STATUS.notTranslatingBecause`. It is not a starting point — it is a
**different channel** that must not be reused:

| | today: `notTranslatingBecause` | needed: user notice |
|---|---|---|
| audience | me, in the console | the end user, on the page |
| language | English, always | the target pack's language |
| wording | `'sub-account is not in ONLY_LOCATIONS'` | a plain sentence |
| scope | the whole page | the page **or one region** |
| visibility | `window.__kaStatus` | rendered |

So the design adds a parallel **reason code** — an enum on `STATUS`, e.g.
`userReason: 'frame-unreachable' | 'wrong-platform-language' | 'pack-failed' |
null` — which each pack turns into a sentence. **The developer string is never
shown to a user.** It names internals and would frighten or confuse.

### The component

One primitive, not a one-off iframe banner, because Tom asked for it to be
reusable:

```
notice({ id, kind, anchor, dismissible })
```

- **`id`** — stable, so dismissal can be remembered.
- **`kind`** — `limit` (we cannot act here, and why) · `info` (something
  changed) · `warn` (the layer is off for a reason the user can fix, e.g. the
  platform language is not English) · `error` (the pack failed to load).
- **`anchor`** — the structural decision. Two scopes, one component:
  - **page** — pinned at the top of the content area. "This screen is not
    translated."
  - **region** — inserted as the previous sibling of a named element. Tom's
    case: immediately above the iframe.
- **`dismissible`** — see below.

### Anchoring above an iframe, carefully

The walled frames are sized by HighLevel's `iframeResizer`, which sets an
explicit height on the frame. Inserting a block above it **adds to the column's
total height** and can produce a scrollbar on a screen that had none, or push
the frame's bottom out of view.

Requirements, to be verified when built:
- Insert as a sibling *before* the frame, inside the frame's own parent — never
  as an overlay, which would cover controls and move when the frame resizes.
- Keep it to a single line at desktop width; allow two at phone width.
- **Never modify the frame's height, style or attributes.** If the notice
  cannot fit without disturbing the layout, it degrades to the page anchor.
- Re-insert on route change: these are SPA frames and get replaced.

### Language and the firewall

- Notice text belongs in a **reserved namespace in the pack** — `notices.*` —
  and **not in `dict`**. Dictionary entries are translations of HighLevel's
  strings; these are our own words, and putting them in `dict` would let the
  walker match them against HighLevel's DOM.
- The container must be added to `CONTENT_ZONES`, like `#i18n-feedback` and the
  agent overlays already are. **Our own injected UI marks itself** (Tom's rule,
  10 Sep) so the engine never rewrites its own output and never harvests it.

### Restraint — the part most likely to go wrong

A banner that appears on every visit to Automation becomes furniture within a
week, and then it is noise on every screen it ever appears on.

- **At most one notice per region, and one per page.** If a page-level cause
  and a region-level cause are the same cause, only the region one shows.
- **`limit` notices are dismissible permanently**, remembered per
  `id` + route in `localStorage`. The user learns the boundary once.
- `localStorage` can throw or come back empty (private window, cleared site
  data). On failure, **show the notice** — a repeated notice is a smaller harm
  than a silently suppressed one.
- A query flag brings them all back: `?kanotes=1`.
- **Never a marketing surface.** No upsell, no product news, nothing Keytone
  wants to say. Only the state of the layer on this screen.

### Honesty limits on the wording

The notice may say **only what we know**. "This area cannot be translated"
is true. "HighLevel does not support Czech" is a different and much larger
claim, and not ours to make on someone's screen.

Draft, to be reviewed by the native reviewer before it ships:

> *Tuto část se nedaří přeložit — HighLevel ji načítá z vlastního serveru.*
> ("This section cannot be translated — HighLevel loads it from its own
> server.")

### Agency users see more

`STATUS.audience` is already computed. Same component, one extra line for an
agency user carrying the host name and the developer reason, so Tom can
diagnose from the page instead of the console. End users never see it.

### Accessibility

`role="status"` and `aria-live="polite"` — announced, never focus-stealing.
Dismiss reachable by keyboard with a visible focus ring. Respects
`prefers-reduced-motion` if it animates in at all.

### Questions for Tom before this is built

1. **Once or every time?** A permanently dismissible notice risks being
   dismissed on day one and never seen again by a user who later wonders why
   Automation is English. The alternative — show it every visit — is the thing
   that becomes furniture. A third option: dismissible, but it returns after a
   new engine version.
2. **How much "why"?** "HighLevel loads it from its own server" is honest and
   slightly technical. "This section is not available in Czech" is softer and
   vaguer. Which does his brother want to read?
3. **Does it ever offer an action?** For `wrong-platform-language` there *is* a
   fix the user can make. For the frames there is none — and a notice with no
   action is only worth showing once.

### Other uses this unlocks, once the primitive exists

Named so the design is not over-fitted to iframes:
pack failed to load · platform language changed under us · a new pack version
is live · the per-message translate feature's status and errors
(`[[per-message-content-translation]]`) · "this text is your own content, so it
is left alone", if that ever proves worth saying.

---

## 2. Per-message content translation — designed 12 Sep, parked

A small icon on each message; click to translate incoming to Czech and the
reply out to English. Three routing modes; mode 3 (the customer's own endpoint,
called from the browser) is the only one where we never see the text, and so
the only one a regulated buyer could use. BYO key is table stakes — Customizer
already does it on a flat rate. Full design in the session record and the
project memory.

## 3. Our own booking widget — designed 12 Sep, parked

Feasible and thinner than it looks: `GET /calendars/:calendarId/free-slots`
returns HighLevel's *computed* slots with a timezone parameter, so we render
their answer rather than rebuilding a scheduler. Explicitly not v1, possibly a
separate product.
