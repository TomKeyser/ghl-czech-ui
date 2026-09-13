# Designs decided but not built

Nothing in this file is implemented. It is the home for designs Tom has
decided on, so they stop living only in a session transcript. See
`[[design-mode-no-code]]`: in a discussion we document, we do not code.

---

## 1. The user message area — status notices in the user's own language

**Raised by Tom, 12 September 2026. BUILT in engine v132/v133, and ON BY DEFAULT
since v134.** Tom, 13 Sep: *"leave our status messages on"*. He chose that
knowing the Czech sentence is not yet native-reviewed and the three questions
below are still open. A browser opts out with `?kanotes=0`, and opts back in
(clearing dismissals) with `?kanotes=1`. A loader can set
`window.__kaNotices = false` to switch notices off for a whole agency.
See **"As built"** below for what the build decided and what it deliberately left out.

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

### WHITE LABEL — a hard rule, not a preference

**Tom, 12 September: system messages never mention HighLevel.**

The platform is resold under the agency's own domain and brand. To the person
reading a notice, HighLevel does not exist — and on a real white-labelled
account it genuinely does not appear anywhere on screen (verified: the string
"HighLevel" renders nowhere, and HighLevel strips its own name from its own
search placeholder). A notice that names the vendor would leak in a way the
platform itself does not, on a screen we injected. That is the worst possible
place for the leak to come from.

The rule goes further than the vendor's name, and the reason is worth stating,
because this layer is meant to be sold to other agencies:

- **No vendor name.** Not HighLevel, not LeadConnector, not the frame hosts.
- **No Keytone either.** If another agency ships this, our name is as wrong on
  their screen as HighLevel's is on Tom's. Notice text is brand-free; if an
  agency ever wants attribution, that is a pack or config option, never a
  literal in the engine.
- **No technical vocabulary that implies a vendor** — "cross-origin",
  "iframe", a `*.leadconnectorhq.com` hostname. These are true and they are
  also a trail straight back to the platform.

So the notice may say only what it can say without naming anyone:

> *Tuto část se zatím nedaří přeložit — načítá se z jiného systému.*
> ("This section cannot be translated yet — it loads from another system.")

"Jiný systém" is honest, brand-free, and means nothing to someone who should
not be thinking about it. **To be reviewed by the native reviewer before it
ships.**

⚠ **The developer line for agency users breaks this rule by design** — it
carries the host name and the internal reason. It is therefore gated on
`STATUS.audience === 'agency'` and must never render for anyone else. That
gate is the whole safety of it, so it needs a test, not a comment.

### Honesty limits on the wording

The notice may say **only what we know**. "This area cannot be translated"
is true. "The platform does not support Czech" is a different and much larger
claim, and not ours to make on someone's screen.

### Agency users see more

`STATUS.audience` is already computed. Same component, one extra line for an
agency user carrying the host name and the developer reason, so Tom can
diagnose from the page instead of the console. End users never see it.

### Accessibility

`role="status"` and `aria-live="polite"` — announced, never focus-stealing.
Dismiss reachable by keyboard with a visible focus ring. Respects
`prefers-reduced-motion` if it animates in at all.

### Tom's answers, 13 September

1. **Once or every time?** *"The dismissed notice stays hidden for the session,
   only for that page."* Built in v136: dismissals live in `sessionStorage`,
   keyed by notice and screen. They survive reloads in the same tab, and a new
   session (a new tab or browser) shows the notice again. Permanent dismissals
   written by v132–v135 are dropped once.
2. **How much "why"?** *"It explains it perfectly."* The wording stands, pending
   the native reviewer (row `r3-775` in the review page).
3. **Does it ever offer an action?** Tom asked what "no action" means.
   Definition given: a notice offers an action when the reader can do something
   to change what it describes. `frame-unreachable` offers none, since nobody on
   that screen can make it translatable. A future `wrong-platform-language`
   notice would offer one: switch the platform language back to English.
   Answer 1 already settles the no-action case (it returns each session).
   **Tom's rule for the other case:** *"a message that requires an action can not
   be dismissed, only the corrective action can dismiss it."*
   - An **actionable** notice renders **without the ×** and ignores stored
     dismissals.
   - It disappears only when the condition it describes is gone, i.e. the next
     check no longer finds the cause (e.g. the platform language is English
     again).
   - It shows on **every page**, using the page anchor rather than a region,
     for as long as the cause exists. Tom: *"if they see it on every page and
     can't dismiss it, they will fix it."* The persistence is the point: it is
     the pressure that gets the fix made.
   - A **no-action** notice keeps the × and the session-and-page dismissal from
     answer 1.

   **Not built yet, on purpose:** no actionable notice exists. The first one
   (`wrong-platform-language`) brings the switch with it, so the primitive does
   not carry a flag that nothing uses.

### Questions for Tom before this is built (answered above, kept for the record)

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

### As built — engine v132, 12 Sep night

**What it does.** When a screen is walled (a viewport-sized frame the page
cannot read, using the same test as `__kaDebug.frames()`), a notice appears with the
pack's sentence and a dismiss button. Dismissal is remembered per notice and
per screen in `localStorage`. If storage fails, the notice shows. `?kanotes=1`
turns notices on and clears every dismissal. `__kaDebug.notices()` lists what is
shown and in which mode, and `__kaStatus.userReason` carries the reason code.

**Decided in the build, all reversible:**
- **Anchoring: the frame gives up exactly the notice's height.** This is Tom's
  idea from the night of 12 Sep: *"insert it above and call iframe resize on our
  own"*. Measured first on Automation → Workflows:
  - There is **no iframe-resizer on that screen**: no inline height, no
    resizer object, no global.
  - The frame is `height: 100%` of `#workflowBuilder`, which HighLevel sizes in
    CSS as `calc(100vh - 92px) !important`.

  So the notice goes in as the frame's previous sibling. When the frame fills
  its container, one rule of ours (`calc(100% - <notice height>px)`, scoped by
  `:has()` to the container holding that notice) shrinks the frame by exactly
  that much.
  - **Tried live on Automation:** a 38 px notice took the frame from 827 to
    789 px with its bottom edge unmoved, and it returned to 827 px when the
    notice was removed.
  - The rule is re-measured when the sentence wraps on a narrow window. The
    frame's own attributes are never written.
  - A frame that does not fill its container (Marketing → Emails scrolls) just
    moves down.

  ⚠ **Correction:** an earlier draft of this build said Automation clips a
  notice's worth of the frame, and floated the notice over a corner to avoid
  it. That came from reading the numbers, not measuring. Measured with a real
  notice inserted, the frame's bottom stayed 54 px inside the window. The float
  was removed.
- **Words only from `pack.notices`**, keyed by reason code. No sentence in the
  engine, in any language, so the white-label rule holds by construction.
- **Styling is inline** on a `data-ka-ignore` root. **`limit` stands out (v135,
  Tom, 13 Sep):** *"the same colour as the Claude logo, and make the text bold"*.
  Fill `#D97757`, bold text in `#1a1a1a`. Near-black rather than white, because
  white on that orange is about 3.1:1 against the 4.5:1 that 14 px text needs;
  near-black is about 5.6:1. **Tom saw it live and confirmed: "keep dark text".** No stylesheet is injected, and HighLevel's CSS reaches it only through
  inheritance, which the inline font and colour reset.
- **Throttled** to one check per 400 ms. The observer fires constantly and
  measuring frames forces layout. Nothing runs while notices are off.

**Not built, on purpose:**
- The **agency developer line**. It carries a host name, and its gate needs a
  test, not a comment.
- The other reason codes (`wrong-platform-language`, `pack-failed`). The first
  is shown precisely when we are *not* translating, so which language to write
  it in is a design question of its own. The primitive is ready for both.
- The page-level anchor. No screen needs it yet.

**Verified live, engine v133, 13 Sep just after midnight** (ZZ My Gym, impersonating the account
user, with `?kanotes=1`):

| | Automation → Workflows | Marketing → Emails |
|---|---|---|
| mode | `fit` | `fit` (this frame fills its container too) |
| notice | 42 px, directly above the frame | 42 px, directly above the frame |
| frame | 827 → 785 px, bottom edge unmoved | 824 → 782 px, bottom edge unmoved (1838 px before and after) |
| dismiss (×) | removed, dismissal stored for `automation/workflows` | removed, frame back to 824 px, stored for `marketing/emails` |

- `__kaDebug.why()` on the notice returns `content-zone` / `[data-ka-ignore]`, and none
  of its text reached the collector.
- The frame's own `style` attribute stayed `null` throughout.
- Turned off again afterwards with `?kanotes=0` (confirmed: flag cleared, `on: false`).

**On for everyone since v134**, unless a browser has opted out with `?kanotes=0`.
Confirmed 13 Sep: a browser with no flag at all, running v134, showed the notice on Automation in
`fit` mode (frame 785 of 827 px).

**Wrapping, verified 13 Sep:** the notice was narrowed to 260 px so its sentence wrapped, and a
resize event was fired. The notice grew 42 → 58 px, the rule re-measured to `58px`, and the frame
went 785 → 769 px. Restored, it went back to 42 px and 785 px. Frame plus notice filled the
container exactly at every step. (Resizing the real window did not change the viewport, since the
window was maximized, so the notice's own width was the lever.)

**In-app navigation, verified 13 Sep:** Automation → Emails → Automation through the app's own
router, with no reload. Each screen got a new frame object, exactly one notice directly above it
(`fit`: 782 of 824 px on Emails, 785 of 827 px back on Automation), and exactly one style rule of
ours, so nothing leaked between screens.

### Other uses this unlocks, once the primitive exists

Named so the design is not over-fitted to iframes:
pack failed to load · platform language changed under us · a new pack version
is live · the per-message translate feature's status and errors
(`[[per-message-content-translation]]`) · "this text is your own content, so it
is left alone", if that ever proves worth saying.

---

## 2. A browser extension — the one route past the six walls

**Raised 12 Sep 2026, from a Facebook comment Tom passed on. Not built, not
decided. It reframes something this project has been calling impossible.**

COVERAGE.md says six areas "can never be reached". That is true of **page
JavaScript injected through Custom JS**, which is bound by the same-origin
policy — measured: `contentDocument` is `null` and `contentWindow.location`
throws on every one of them.

**A browser extension is not bound the same way.** A content script declared
with host permissions and `all_frames: true` is injected into *every* frame,
cross-origin ones included, each in an isolated world with full read and write
access to that frame's DOM. On that route, Automation, the page builder,
Settings and Marketing → Emails stop being walls.

The wording in COVERAGE.md was imprecise and has been left as it is with this
note pointing at it: the ceiling is the delivery mechanism's, not the idea's.

### Tom's framing, and it is the one to build on

The first version of this note treated the install as a problem to apologise
for: *everyone would have to install something, which is awkward beside the
white-label rule*. Tom, same day:

> *"we might be able to build an extension for the end user that we ask them
> to install if they want a more complete translation"*

That removes the objection rather than answering it. **The Custom JS layer
stays the product, installed by nobody.** The extension is an **opt-in
upgrade** for a user who wants the rest. Decline it and nothing degrades —
you get exactly today's coverage. The six walled areas stop being a limitation
to explain away and become the reason to install.

Two things make it cheaper than it first looks:

- **It is the same product underneath.** Same pack, same engine, same
  firewall — only the injection differs. Not a second product; a second
  delivery mechanism for the one that exists.
- **It is aimed at one person per account.** The business owner answering
  enquiries never needs it. The operator building workflows does, and for them
  an install is a small ask.

### The boundary that decides what can be promised

**An extension fixes OPERATOR screens. It can never fix CUSTOMER-FACING
documents.**

| | reachable by an extension? | why |
|---|---|---|
| Automation, page builder, Settings, Emails | **yes** | the operator installs it |
| the invoice / estimate / receipt | **no** | the *customer* would have to install it |
| the booking widget | **no** | same — it runs on the visitor's browser |

So this does not weaken the founders argument, it splits it cleanly: an agency
can fix its own staff's experience itself, and **the half that reaches its
customers stays HighLevel's alone to fix**. That is a harder sentence to
answer than a request for Czech.

**The remaining costs, honestly:**

- **Two delivery mechanisms to maintain**, with different injection,
  permissions and update paths.
- **A gatekeeper.** Chrome Web Store review, and a rejection is not appealable
  on a schedule anyone can plan around.
- **The white-label rule still applies to it** — the listing, the name and the
  icon are all end-user visible. See [[white-label-no-vendor-name]].

**The cheap experiment, before any of that:** a throwaway unpacked extension
with one content script that does nothing but report `location.href` and
`document.body.children.length` from inside
`client-app-automation-workflows.leadconnectorhq.com`. If that comes back, the
route is real and worth costing properly. If it does not, this section is
closed for good. An afternoon, and no product decision rides on it until the
answer is known.

## 3. Splitting the repository — source private, distribution public

**Tom, 12 Sep. Tooling built (`deploy-dist.js`), nothing created.**

Git visibility is per-repository; there is no way to make a folder private
inside a public repo, and history keeps whatever was ever committed. As of
12 Sep the repo is public with **0 forks, 0 stars, 0 watchers**, so exposure so
far is almost certainly nil.

Options, in the order they were discussed:

1. **Private repo + GitHub Pages** — needs a paid plan. One toggle, no new
   machinery.
2. **Two repositories** — private source, public distribution. Free.
   `deploy-dist.js` implements it.
3. **Move hosting off GitHub** (Cloudflare Pages) — also brings **brotli**,
   measured at **161 KB → 130 KB** on top of the comment stripping.

**Sequencing is not optional.** A live business runs on this. Flipping the
current repo private on a free plan stops Pages and takes the layer off the
air. So: create the public repo → push → verify it serves → Tom repoints
Custom JS → confirm working → *then* make the source private.

**Do these at the same time, because the URL changes anyway:**

- **A CNAME to a Keytone subdomain.** `tomkeyser.github.io` currently appears
  in the Custom JS field and every user's network tab — Tom's personal GitHub
  username, on a product meant to be resold. Free on Pages for a public repo.
  This is the white-label rule applied to the script URL, which the rule's
  original wording did not cover but plainly should.
- **Hash the sub-account ids.** Private source hides none of this; it is
  compiled in. `deploy-dist.js` prints it on every run:
  `'SbA5m1DElMNEKBVnixsX' ×3`, `'zWR1h9iaCeH2Ki6kGZLD' ×3`,
  `'qO4OrGisQvYo5ozx4j5U' ×1`. A hash compares identically and reveals nothing.

## 4. Per-message content translation — designed 12 Sep, parked

A small icon on each message; click to translate incoming to Czech and the
reply out to English. Three routing modes; mode 3 (the customer's own endpoint,
called from the browser) is the only one where we never see the text, and so
the only one a regulated buyer could use. BYO key is table stakes — Customizer
already does it on a flat rate. Full design in the session record and the
project memory.

## 5. Our own booking widget — designed 12 Sep, parked

Feasible and thinner than it looks: `GET /calendars/:calendarId/free-slots`
returns HighLevel's *computed* slots with a timezone parameter, so we render
their answer rather than rebuilding a scheduler. Explicitly not v1, possibly a
separate product.
