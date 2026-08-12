# Handoff — FilterGo Visits: clubbing, scheduler tenancy, route optimization

**Repo:** `/Users/abdullah.qamar/EDGE - Signal` · **Branch:** `feature/scheduler-ui-refresh`
**Written:** 2026-08-10 · **Updated:** 2026-08-12 (session 5 — the harmonize drawer's empty state)
**Nothing has been committed.** All work is in the working tree.
**This file lives at** `docs/visits-feature/HANDOFF.md`.

---

## 1. What this project is

A frontend design demo for a field-service product that ships as two tenants off one
codebase:

- **Signal** — security guarding (patrol + dedicated shifts)
- **Filter Go** — commercial air-filter replacement

They share every code path. The API says `patrol` for both; the UI relabels per tenant.
The user is **new to the product themselves**, and so was I — the domain model in the
artifacts below was reconstructed from the frontend, not from documentation. Treat it as
well-evidenced inference, not gospel.

## 2. What has been done, in order

**Session 1 — discovery, design, route builder**

1. Discovery → design for a feature that clubs multiple visits into one runsheet, ending in
   a full design plus an end-to-end route optimization design (artifacts in §4).
2. Implementation of a route-builder screen, plus a chain of tenant-config bugs.

**Session 2 — scheduler audit, then build**

3. A read-only audit of the FilterGo scheduler view, driven by the problem statement *"user
   was unable to view all the hits in one view, assigned/unassigned and others."*
4. Implementation of the audit findings: the crashes first, then the **Visits view** that
   the problem statement was actually asking for, then the side drawers, day/month, and an
   edge-case sweep.

**Session 3 — the harmonize drawer**

5. Design interview (`grill-me`) then implementation of **Harmonize**: collapse a week of
   scattered visits into one day. Full record in **`docs/harmonize-drawer.md`** — decisions,
   reversals, bugs found, and what is deliberately not built.

**Session 3B — visit states, density, ordering** *(ran in parallel with 3, same day)*

6. The user answered the blocking product questions, and the `06` edge-case sweep was built
   out against those answers: the **eight visit states** as a first-class system, a
   **sparse-cadence density pass**, **chronological row ordering**, and a **quick filter**.
   Full record in **`06-visits-scheduler-edge-cases.md`** (decisions D1–D10).

**Session 4 — the UI pass, driven entirely by the user reading the screen**

7. A long correction loop over the built scheduler. Nothing new was designed from scratch;
   almost every change came from the user pointing at something and saying it was wrong,
   which makes this session's record the most useful of the lot — it is a list of what a
   fresh pair of eyes could not parse. Covers the toolbar and its CTAs, the visit card,
   the visit drawer, the month view, the demo data's honesty, and five passes over the
   harmonize drawer. Full record in **`docs/harmonize-drawer.md`** (passes three to seven)
   and **`06`** (D11, D12).

**Session 5 — the harmonize drawer showed neither the visits nor the places**

8. One reported defect — *"i dont see the visits on the side drawer, neither locations on the
   map"* — which turned out to be **four faces of one unresolved value**: the drawer never
   resolved a start point on this tenant, and everything downstream of it (the plan, the stop
   list, the route line, the meter) is gated on that. Fixed by giving the visit list and the
   map an existence independent of the plan, un-gating the device position, and stopping the
   target day defaulting into the past. Full record in **`docs/harmonize-drawer.md`**
   (eighth pass) and **`06`** case 2.6.

> **These two streams were concurrent, not sequential.** They overlap in
> `calendar/index.jsx`, `ScheduleCalendarGrid.jsx`, `scheduleTabConfigs.js` and `obx.json`,
> and 3B *depends on* 3's `VISITS_SCHEDULE_TAB_ID` export. Neither is a superset of the
> other; read both records. See the concurrency note at the end of §6.

The audit's conclusion is worth carrying forward, because it reframes the problem: it was
not that visits were *hard* to see, it was that **no surface in the scheduler showed an
individual visit at all**. The week grid showed runsheets, day/month were empty, the
runsheet drawer's visit list said "No Record Found", and the missed-visits drawer crashed
the app. Meanwhile the footer read "96/120 Visits Completed" — the data existed, the view
could not draw it.

## 3. Domain model in one paragraph

A **site** has **jobs**; a job generates **visits** (API calls them "hits") — one
required service occurrence with a time window on a given day. A **runsheet** is an
ordered route of visits for one weekday, assigned to a worker and vehicle. Critically:
a runsheet is a **weekday-recurring template** (`POST /shiftassignment/patrol/template`),
not a dated object. A runsheet's list is heterogeneous — it can hold visits, missed
visits, and dispatch jobs. Filter Go's on-screen term for everything is **"Visits"**.

## 4. Design docs — read these first

**All of it is committed alongside the code in `docs/visits-feature/`.** Start with the
README there. The thinking is done — do not duplicate or re-litigate it.

| File | Also published at |
|---|---|
| `01-discovery.html` | https://claude.ai/code/artifact/9624f9c4-b3db-4a29-9ac0-71f0749d8fc3 |
| `02-discovery-questions.html` | https://claude.ai/code/artifact/41dfa584-8c0f-4724-8411-20c7ae2c86bf |
| `03-clubbing-design.html` — **the spec** | https://claude.ai/code/artifact/0fd068d8-0d1e-4d74-89d7-9e63a658b9e3 |
| `04-edge-case-brainstorm.html` | https://claude.ai/code/artifact/d608491f-9a2f-435c-8a48-437963e0e9f2 |
| `05-route-optimization.html` | https://claude.ai/code/artifact/132cde01-bad8-475d-9959-3d655e023b5f |
| `06-visits-scheduler-edge-cases.md` | — not published; markdown, sessions 2, **3B** and **4** |
| `FilterGo-Visits-Route-Building.docx` | — compiles 01–04 for sharing |
| `../harmonize-drawer.md` | — not published; **sessions 3 and 4**, lives at `docs/`, not here |

The HTML files are self-contained — open them in a browser directly.

`06` is the **view**-level edge-case sweep for the scheduler as built. `04` remains the
domain-level one; they do not overlap. **`06` is now the primary design record for the
visits scheduler** — session 3B grew it to ~40 cases and, more importantly, added a
**Decisions section (D1–D12)** carrying the user's answers to the questions that used to
block this work, plus the reasoning behind each build call. Read that section before
touching the visits grid; several table rows only make sense in its light.

**`docs/harmonize-drawer.md` is the same thing for the harmonize drawer**, and session 4
added four more passes to it (three to seven). It is now as much a record of *how the UI
was wrong* as of how it was designed — read it before changing that drawer, because most
of its current shape is a correction of something that shipped looking reasonable.

If you revise an HTML doc, edit the file in `docs/visits-feature/` and republish to the
**same** artifact URL by passing it as the `url` param to the Artifact tool. Omitting it
mints a new URL and the two copies drift apart.

## 5. Code changes in the working tree

> **Important:** the branch had ~50 modified and ~18 untracked paths *before* session 1 —
> a schedule-calendar refresh someone else is mid-way through. **That person was still
> active during session 2** (see §6). Anything not listed below is not ours.

**Session 1 — the route builder** (`/app/obx/runsheet/buildRoute`):

```
src/app/obx/pages/runSheets/buildRoute/
  index.jsx · buildRoute.styles.js · helper.js · mockVisits.js
  components/CapacityMeter.jsx · CandidatePool.jsx · RouteTimeline.jsx
```

Plus `src/assets/images/filterGoLogoShort.svg`, the demo tenant switcher in
`layout/sideBar/`, per-tenant `services`/`terms` in `utils/constants/multiTanentAuthInfo/`
and `helper/mockData/`, and `OBX_BUILD_ROUTE` routing.

**Session 2 — the visits scheduler.** New files:

| File | What |
|---|---|
| `schedules/components/scheduleErrorBoundary/index.jsx` | Scoped, recoverable boundary around the calendar |
| `schedules/shiftDetail/hitDetail/VisitAssignment.jsx` | The visit drawer's assignment block |
| `docs/visits-feature/06-visits-scheduler-edge-cases.md` | Edge-case sweep |

Modified:

| File | Why |
|---|---|
| `stubbedData/mocks/schedule.mock.js` | The bulk of it. Visits grid, day-view shape, month aggregate shape, missed-visits list, runsheet detail, visit detail, status filtering, shift/visit registries |
| `helper/mockData/urlRouter.js` | Routes for three endpoints that were being swallowed by generic handlers; services passed to the month aggregate |
| `helper/mockData/mockUserData.js` | `roles` label category (see §7.1) |
| `App.jsx`, `redux/store/slices/tenantConfigs/`, `public/pages/login/login.jsx` | Tenant + schema-version stamping on the label cache |
| `schedules/config/scheduleTabConfigs.js` | `visits` tab config; single-service tab collapse; `SITES` resource header |
| `schedules/hooks/useScheduleCalendarViewModel.js` | Visits week view; single-section overview; day-view ordering |
| `schedules/helper/scheduleResponseAdapter.js` | `hit` shift type; `pinUnassignedFirst`; visits footer mapping |
| `schedules/calendar/index.jsx` | Status-filter control, error boundary, require-attention toggle, tabs in day/month, day fetch honours tab, filter preservation across tabs |
| `schedules/calendar/ScheduleCalendarGrid.jsx` | `VisitCardContent`, unassigned band label, card aria-labels, `StatusTooltip` fix, day-view sections |
| `schedules/components/scheduleStatsFooter/index.jsx` | `VISITS` variant; status counts are now filters |
| `schedules/components/missedHitsDrawer/` | Array guard + empty state (this was the crash) |
| `schedules/shiftDetail/index.jsx` | `composeDrawerTitle`; `onAssignToRoute` |
| `schedules/shiftDetail/hitDetail/index.jsx` | Rebuilt around assignment state |
| `schedules/shiftDetail/RunsheetDetail/index.jsx` | NaN/undefined guards; map gated on a Maps key |
| `schedules/index.jsx` | Status-control wiring between calendar and footer |
| `components/common/calendar/index.jsx` + `calendar.styles.js` | Today button, nav aria-labels, visits styles, day-view surface, month cell overflow |
| `utils/i18next/locales/en/obx.json` | ~20 new keys under `schedules.calendar` and `runsheet` |

**Session 3 — the harmonize drawer.** New files, all under
`schedules/components/harmonizeDrawer/`:

| File | What |
|---|---|
| `index.jsx` | Orchestration. Rewritten from the old list-only drawer |
| `harmonizePlan.js` | Three orderings, budget packing, merge interleave, dedupe |
| `harmonizePlan.test.js` | 23 unit tests |
| `demoVisits.js` | Replaces `demoProposal.js` (**deleted**). Geo-located demo visits + merge targets |
| `useStartPoint.js` | GPS → franchise fallback for the start/end field |
| `useDirections.js` | One waypointed Directions call, 400ms debounce |
| `components/` | `DayMeter` · `RouteMap` · `RouteOptions` · `StopList` · `OverflowBucket` |
| `../../../../../docs/harmonize-drawer.md` | The full design + build record |

Modified:

| File | Why |
|---|---|
| `schedules/calendar/index.jsx` | Harmonize gated to the visits tab; richer selection payload (date, coords, service minutes); ghost-preview state; apply toast |
| `schedules/calendar/ScheduleCalendarGrid.jsx` | `harmonizePreview` prop → `data-harmonizing` / `data-harmonize-target` datasets |
| `schedules/calendar/scheduleCalendar.styles.js` | Ghost-preview global styles |
| `schedules/config/scheduleTabConfigs.js` | `VISITS_SCHEDULE_TAB_ID` export |
| `components/common/rightDrawer/index.jsx` | Optional `width` prop (default unchanged at 523) + responsive rules — it had **none** |
| `components/common/customDropDown/index.jsx` | Opt-in `labelMaxLength`; `zIndexValue` default fixed (see §9) |
| `utils/i18next/locales/en/obx.json` | `runsheet.harmonize` namespace |

**Session 3B — visit states, density, ordering.** New file:

| File | What |
|---|---|
| `schedules/helper/visitState.js` | **The single source of truth for visit state.** Resolves any visit to one of eight states, and to its action rules (D3/D4/D5). Every surface that draws or acts on a visit goes through it |

Modified:

| File | Why |
|---|---|
| `stubbedData/mocks/schedule.mock.js` | Rewritten visits generator: a **service cadence** (46 sites, 14–120 day intervals, two unscheduled) instead of two visits per site per day. Stable ids derived from site + date. `nextVisitAt` per row. Month counts now derived from the same cadence. Addresses for the wider site book |
| `schedules/helper/scheduleResponseAdapter.js` | Chronological row ordering; `isFirstQuietRow` divider marker; `filterResourcesToScheduled` for the quick filter; `sitesServiced` footer stat |
| `schedules/hooks/useScheduleCalendarViewModel.js` | `showOnlyScheduledSites` — applies the quick filter to mapped resources (no refetch) |
| `schedules/calendar/ScheduleCalendarGrid.jsx` | `VisitStateLabel` + eight card treatments; visits month cell; quiet-row labels with next-due dates; visit state in aria-labels |
| `schedules/calendar/index.jsx` | Quick-filter toggle button and its state |
| `components/common/calendar/calendar.styles.js` | Eight visit-state card classes; quiet-row + divider styles; visits month cell styles |
| `schedules/shiftDetail/hitDetail/VisitAssignment.jsx` | Rebuilt around `getVisitActionRules`: state callout with tone, per-state actions, avatar/baseline alignment, address de-duplication |
| `schedules/shiftDetail/hitDetail/index.jsx` | `onAssignTour` passthrough |
| `schedules/shiftDetail/index.jsx` | `composeDrawerTitle` containment test made symmetric; `onAssignTour` wired to the tour drawer |
| `schedules/components/scheduleStatusChips/index.jsx` | **Shared component.** In-progress is now explicitly blue instead of MUI `primary` (see §7.27) |
| `schedules/components/scheduleStatsFooter/index.jsx` | `sitesServiced` stat; `suffix` support in `renderStatText` |
| `runSheets/components/runsheetHits/runsheetHits.style.js` | Instructions body no longer indented from its own heading |
| `utils/i18next/locales/en/obx.json` | `schedules.calendar.visits.state` / `.stateHint` namespaces, row/month/quick-filter keys; `runsheet` section headings de-coloned |

**Session 4 — the UI pass.** New files:

| File | What |
|---|---|
| `harmonizeDrawer/components/TileRouteMap.jsx` | **A real street map with no API key.** Web Mercator against CARTO's public OSM raster tiles: fit-to-bounds, pan, zoom, click-to-edit. Used whenever the Google SDK does not load |
| `harmonizeDrawer/components/AddressSearchField.jsx` | Keyless address search, geocoding through Photon (OSM). The Places path is still preferred when the SDK is available |

Modified:

| File | Why |
|---|---|
| `schedules/calendar/index.jsx` | Quick filter moved into the filters row; CTAs back to plain design-system buttons; toolbar pill class split from the alert pill |
| `schedules/calendar/scheduleCalendar.styles.js` | `TOOLBAR_PILL` shared by the two filter chips; selection tick and outline rehung on the card; not-selectable treatment; month today marker |
| `schedules/calendar/ScheduleCalendarGrid.jsx` | Card rebuilt to three fixed lines; `isSelectableForHarmonize`; `aria-pressed` in selection mode; `data-visit-card` |
| `schedules/components/scheduleCalendarFilters/index.jsx` | `trailingFilter` slot |
| `schedules/helper/visitState.js` | Past-and-never-started resolves to `MISSED` (D11) |
| `schedules/shiftDetail/index.jsx` | Flush tab panel for the visit drawer; `onChangeRunsheet` |
| `schedules/shiftDetail/hitDetail/VisitAssignment.jsx` | Runsheet field is a dropdown; two-column grid; address icon fix |
| `components/common/calendar/index.jsx` + `calendar.styles.js` | Month: `fixedWeekCount: false`, `contentHeight: 'auto'`, `monthGridCompact`; `visitRouteName` |
| `stubbedData/mocks/schedule.mock.js` | Date-aware visit status — past is completed or missed, today is live or not started, future is not started |
| `harmonizeDrawer/` (index, styles, `RouteMap`, `OverflowBucket`, `demoVisits`) | Labels, the create-runsheet field, the meter gate, the map card, the overflow box. See `docs/harmonize-drawer.md` |
| `utils/i18next/locales/en/obx.json` | ~20 keys added or rewritten under `runsheet.harmonize` |

Deleted: `harmonizeDrawer/components/RouteSketch.jsx` — an SVG schematic built when the
map could not render, withdrawn at the user's direction in favour of a real map.

**Session 5 — the harmonize drawer's empty state.** New file:

| File | What |
|---|---|
| `harmonizeDrawer/components/SelectionList.jsx` | The selected visits **before there is a route** — a set, not a sequence: chronological, no numbers, no arrival times, each row carrying its service time and the day it currently sits on. The drawer had no list at all until a plan solved |

Modified:

| File | Why |
|---|---|
| `harmonizeDrawer/useStartPoint.js` | Device position no longer gated on the target day being today (**reverses** design decision 5 — see §8); exposes `devicePoint` and `isDeviceToday` so the map can draw it even when the planner has typed a different origin |
| `harmonizeDrawer/demoVisits.js` | `defaultTargetDay` takes a `today` and never returns a day that has passed |
| `harmonizeDrawer/index.jsx` | `SelectionList` replaces the standalone "set a starting point" panel; day options open no earlier than today; `devicePoint` passed to the map |
| `harmonizeDrawer/components/TileRouteMap.jsx` | Site-name labels on pins (always when unnumbered, on hover when solved); the device mark as a ring |
| `harmonizeDrawer/components/RouteMap.jsx` | One `drawnStops` for both renderers, so the Google path draws pre-plan pins too; `devicePoint` through both; legend entries conditional on their mark being drawn |
| `harmonizeDrawer/components/AddressSearchField.jsx` | A pre-filled value is not a query; suggestions only open while focused |
| `harmonizeDrawer/harmonizeDrawer.styles.js` | Selection-list rows, `mapLegendRing`; `noFit`/`noFitText` removed with the panel they styled |
| `harmonizeDrawer/harmonizePlan.test.js` | Three tests for the past-day rule; the two existing `defaultTargetDay` tests now pass an explicit `today` rather than depending on the date they run on |
| `utils/i18next/locales/en/obx.json` | 5 keys: `selectionLabel` · `selectionSpread` · `mapYouAreHere` · `legendDevice` · `legendSelected` |

## 6. State of the implementation

**Works and was verified in-browser** (FilterGo tenant, demo mocks). Session 2 built these;
where 3B changed them the current behaviour is what is described:

- **Visits view** — rows are sites, unassigned demand pinned above them in a red dashed
  band, visit-level cards, footer split into "on a runsheet" vs "unassigned". *3B: rows are
  now ordered chronologically and carry next-due dates; see §6 session 3B.*
- **Two tabs, not three** — single-service tenants collapse Overview into their service tab
  and keep the KPI footer. Signal still gets Overview + Dedicated + Patrol + Visits.
- **Runsheet drawer** — title, Technician/Vehicle labels, status chip, visits-done roll-up,
  start/end location, ordered stop list. Matches the production reference screenshot.
- **Visit drawer** — leads with assignment state; unassigned visits get an **Add to a
  Runsheet** action wired to the existing reassign flow. *3B: the action offered is now
  decided by `getVisitActionRules`, so it changes per state.*
- **Day view** — unassigned first, cards sized to content, tabs visible in day and month.
  *3B: it now lists only the sites being worked that day, not every site with an empty
  state — a quiet row earns its space on a planning surface, not an execution one.*
- **Month view** — *rebuilt in 3B.* Count-led (`2 Visits`), service name dropped, unassigned
  shown as a numbered badge. Counts derive from the cadence and reconcile with the week grid.
- Missed-visits drawer no longer crashes; footer counts filter the grid; Today button;
  filters survive tab changes; every card has an accessible name.

**Deliberately not done:**

- **No map.** No Google Maps key in the demo env, so `RunsheetMap` returns null rather than
  rendering a grey panel with an error dialog. Additive later.
- **The optimizer is a placeholder** (session 1). Nearest-neighbour over straight-line
  distance, ignores site access windows. `buildRoute/helper.js:62` says so.
- **Nothing writes.** All mock data; no endpoint is called for real.
- ~~**Cancelled visits** have no treatment on the visits grid, and **missed visits** are
  marked in their own drawer but not on the grid.~~ **Both done in session 3B** — all eight
  states now draw on the grid, so a visit reads the same everywhere.

**Session 3 — harmonize** (`Select visits` → `Harmonize N visits`, visits tab only):

- **Consolidation, not week-shuffling.** The question is "can I do this whole week in one
  trip", so the eight-hour man-day is the constraint and the capacity meter is the answer.
  It runs on `buildRoute/helper.js` — same maths, no second solver.
- Target day auto-picks the day already holding most of the selection. One **Start & end**
  field (round trip). Merge into an existing runsheet **re-solves interleaved**, with
  completed stops locked and the re-order count stated before Apply.
- What does not fit spills to a bucket on the next day, landing **unassigned**.
- Re-order by drag handle or `↑`/`↓`; the solver stops until `Re-optimize`.
- The calendar behind ghosts the move while the drawer is open.

**Deliberately not done in session 3:** undo, the "client not told" marker, phantom cards on
the target day, and Places autocomplete for the address (stubbed geocode — needs a Maps
key). Access windows are still ignored; visits carrying one are flagged `⚠` and excluded
from the "all N fit" claim rather than silently counted.

**Session 3B — visit states, density, ordering** (visits tab, verified in-browser):

- **Eight visit states, one resolver.** Unassigned · blocked-no-tour · scheduled ·
  route-in-progress · inserted-after-start · completed · missed · cancelled. All eight draw
  on the grid *and* in the drawer, from `helper/visitState.js`. The encoding is layered and
  never colour-alone: **border style** = is there a plan (dashed = not routed), **colour** =
  family (red attention, amber blocked, blue live, green done, grey void), plus an icon and
  a text label on every card. `SCHEDULED` deliberately renders no label — it is the baseline.
- **Action rules follow the user's answers.** A started runsheet still accepts visits but the
  insert is marked; a completed visit is read-only; a past date is read-only *except* missed
  visits, which keep a **Reschedule** action; a visit with no tour is offered a tour, not a
  runsheet.
- **Sparse cadence.** The demo book is 46 sites on 14–120 day intervals — a typical week is
  **8–12 visits touching 8–12 sites**. Quiet rows carry `Next visit Sep 8`; a site with no
  future visit at all reads amber `Not scheduled`. Footer states `8/46 Sites serviced`.
  Quiet rows compress to 40px below a divider: 3123px of scroll down to 1966px.
- **Chronological ordering.** Rows read top-to-bottom as the order work happens; quiet rows
  continue the same timeline by next-due date. The signature is a diagonal cascade of cards.
- **Quick filter** (`Sites with Visits`, visits week view only) drops quiet rows on demand —
  47 rows to 9. Off by default; the unassigned band always survives it.
- **Month view rebuilt.** Count-led (`2 Visits`), service name dropped, unassigned shown as a
  badge carrying its number. Counts derive from the cadence and reconcile with the week.
- **Day view** lists only the sites being worked, not all 46.

**Deliberately not done in session 3B:** bulk add (decided in `06` D2, not built — there is a
*Select visits* mode with no bulk-assign flow behind it), marking inserted stops in the
**runsheet's own** stop list, URL state, and overdue-against-contract (blocked, §8).

**Session 4 — the UI pass** (verified in-browser throughout):

- **Toolbar.** `Sites with Visits` sits with the filters, not in the action cluster, and has
  a visible pressed state for the first time — it shared the unrouted-demand pill's class,
  which painted it in the *alert* palette and pinned its colours so the active variant never
  took. `Select visits` / `Cancel` / `Harmonize` are plain design-system buttons again.
- **Selection works and looks it.** The tick was being painted against FullCalendar's event
  harness, 8px larger than the card, so it landed outside it; it is on the card now, with
  `aria-pressed`. **Completed and cancelled visits are no longer selectable** — dimmed, no
  tick, still openable. Missed stays selectable (D5).
- **The card is three fixed lines** — time + status icon, site, runsheet or **Unassigned**
  (D12). The per-state text label is gone; colour, border and icon carry state.
- **The data stopped lying.** Status is a function of the date now, and a routed visit whose
  window passed without starting resolves to **missed** (D11).
- **Visit drawer.** Runsheet is a dropdown that can move the visit; padding matches the
  runsheet drawer; the address pin is visible.
- **Month view.** No phantom sixth week, rows sized to content (~66px, was ~150px), today
  marked. Its CSS had never applied — every selector in it was for FullCalendar v6 (§7.36).
- **Harmonize.** Clear labels, a create-runsheet flow whose only field is the name, the meter
  gated until there is a route, a map card with a legend, an editable map, a Places-backed
  search, and an overflow box that reads as a sentence. Five passes, all in
  `docs/harmonize-drawer.md`.

**Deliberately not done in session 4:** dragging the route line or the stop markers on the
map (both would corrupt a plan whose subject is *which visits are in it* — order stays the
stop list's job), and Directions-quality driving legs, which need a Maps key.

**Session 5 — the harmonize drawer's empty state** (verified in-browser, FilterGo tenant):

- **The drawer states its subject on frame one.** `Visits you selected · spread over 2 days`,
  then each visit with its service time and the day it sits on today. Nothing about it waits
  for a plan, because nothing about it needs one.
- **The map names places.** Unnumbered pins carry site labels; solved pins are named on hover.
  The legend lists only marks that are actually drawn.
- **Current position is used and shown.** Requested on every open, pre-fills the field, and is
  drawn as a ring — suppressed when the route already leaves from it.
- **The target day is never in the past**, and the day dropdown cannot offer one.
- The whole chain now resolves on the demo tenant: start point → plan → ordered stop list with
  drive legs and arrival times → capacity meter (`6h 23m of 8h · 1h 37m left`, marked
  `ESTIMATED`) → `Apply → Fri 14 Aug` enabled.

> **Verification note.** Geolocation is **denied at the browser-pane level** in this
> environment (`navigator.permissions` reports `denied`), so the real permission path could not
> be exercised here — the device-position rendering was verified against a stubbed
> `getCurrentPosition`, with only the browser API replaced. The *denied* path is the one that
> ran unstubbed, and it is now a legible state rather than a dead end: empty field, visits
> still listed, pins still named. **Somebody should confirm the granted path on a real
> browser.**

> **Concurrency warning.** `ScheduleCalendarGrid.jsx` now has **five authors**: the
> pre-existing calendar refresh, session 2, session 3 (harmonize ghost-preview datasets),
> session 3B (state treatments, month cell, quiet-row labels), and session 4 (the three-line
> card, `isSelectableForHarmonize`, `data-visit-card`). Session 2 established the
> pattern the others follow — visit selection is a `data-visit-id` dataset painted onto
> already-mounted nodes, because FullCalendar caches event content and re-rendering does not
> work. **Untangle before committing.**
>
> `calendar/index.jsx`, `scheduleTabConfigs.js` and `obx.json` were edited by both 3 and 3B.
> 3B's quick-filter button consumes `VISITS_SCHEDULE_TAB_ID`, which 3 exported — so **3B does
> not apply cleanly without 3**.
>
> Between them the two streams touched four shared components: `rightDrawer` and
> `customDropDown` (session 3), `scheduleStatusChips` and `runsheetHits.style.js`
> (session 3B). Only `scheduleStatusChips` changes behaviour for existing callers — the
> in-progress chip is now blue everywhere, including the runsheet and dedicated screens.
> That is intentional and consistent with the state system, but it is a change outside the
> visits tab and easy to miss in a diff.
>
> One accident worth knowing: running `eslint src --fix` across the whole tree reordered an
> import in `sites/update/index.jsx`, a file another session owns. It was reverted. **Lint
> only the paths you touched.**

## 7. Gotchas — these cost real time, don't rediscover them

1. **`getLabel` has categories, and `roles` is not `terms`.** The runsheet drawer reads
   `getLabel('roles', 'officer', t)`. The mock supplied only `terms`, so it resolved to
   `''` — and because the i18n value is bare interpolation (`"officer": "{{officer}}"`),
   the label rendered as **nothing at all** rather than a fallback. If a label is
   mysteriously blank, check the category before anything else.
2. **Tenant labels are persisted and were never invalidated.** They now carry a `tenant`
   and a `version`. **Bump `TENANT_LABELS_VERSION`** in
   `redux/store/slices/tenantConfigs/index.jsx` whenever the labels payload shape changes,
   or every existing session keeps the old shape forever.
3. **The mock router is order-sensitive.** Generic handlers for `/shiftActivityLog`,
   `/shift/` and `/runsheet` sit near the bottom and will swallow anything more specific.
   Three endpoints were being answered with the wrong shape this way — the missed-visits
   list (which crashed the app), the runsheet detail and the visit detail. New routes go
   **above** them, with a comment saying why.
4. **Detail endpoints only receive an id.** `shiftRegistry` / `visitRegistry` in
   `schedule.mock.js` record what each generated row was, so the drawer opens the same site
   the card showed. Without them the drawer derived a site arithmetically and contradicted
   the grid.
5. **Day view and week view consume different shapes from the same endpoint.** Week wants
   `sections[].rows[].shifts[]`; day wants `shifts` **keyed by location name** plus a flat
   `locations[]`. Returning the week shape to the day view is why it said "No Shifts Found".
6. **Month wants a third shape again.** `getDutiesByMonth` walks `Object.values(row)` and
   keeps anything carrying a `type`, so a row is `{ date, patrol: {...}, dedicated: {...} }`.
7. **The day view's location order is the response's order.** It used to re-sort by id,
   which buried the unassigned group at the bottom. The server decides; don't re-sort.
8. **i18n namespace.** `locales/en/obx.json` is nested under an `obx` key in
   `locales/en/index.js`. A key at `runsheet.buildRoute.title` is called as
   `t('obx.runsheet.buildRoute.title')`. Missing the prefix silently renders the raw key.
9. **Demo mode needs a gitignored `.env`.** It already exists locally:
   `REACT_APP_NODE_ENV=localhost` and `REACT_APP_TENANT=teamsignal.com`. Without it
   `isLocalDemo()` is false and the tenant switcher never renders.
10. **`tenantInfo` holds two kinds of data** — tenant branding, and the signed-in user's
    `tenantConfiguration` (services/permissions). The demo switcher used to wipe the whole
    object, which destroyed `services` and rendered the scheduler blank. **If a scheduler
    goes blank, check `services` in the persisted `auth.tenantInfo` first.**
11. **Empty object is truthy.** `services: {}` beat the fallback and caused the above.
12. **MUI `Tooltip` needs a ref-holding child.** The generated SVG components don't forward
    refs, and a missing icon reaches it as `children: undefined`. `StatusTooltip` now
    guards both; don't pass a bare SVG straight into a Tooltip.
13. **Dev server port drifts.** `.claude/launch.json` has `autoPort`, so if 3000 is busy you
    get a different origin — different localStorage, fresh login.
14. **No LibreOffice on this machine.** The docx skill's PDF-render verification fails;
    verify document output with `pandoc -t markdown` instead.
15. **Pre-existing lint errors** you did not cause, in files nobody in these sessions
    touched: `mockStores.js`, `siteGeoMock.js` (prettier), and `SIGNAL_TENANT` unused in
    `tenantMockData.js`.

**Session 3 additions — every one of these cost real time:**

16. **`vite build` passing does not mean the app runs.** A `useEffect` placed above the
    `useState` it reads is a temporal-dead-zone `ReferenceError`: it compiles, lints, and
    builds clean, then blanks the entire Schedules page at runtime. **Load the page after
    changing a component.** This shipped and the user found it, not me.
17. **`CustomDropDown` returns `null` when `selectedValues` is undefined.** It does not
    degrade — the control silently vanishes. A `.find()` that misses therefore *deletes the
    field*. Always pass a fallback object. This is why the Start dropdown was missing on a
    tenant with no franchise coordinates.
18. **`CustomDropDown` truncates the selected label at 20 characters**, regardless of how
    wide the control is (`truncateLabel(selectLabel, 20)`). There is now an opt-in
    `labelMaxLength` prop; the default is unchanged.
19. **Prettier runs between your edits.** Patching by string-match against code you read
    earlier will silently no-op once the formatter has reflowed it. Three fixes were
    reported as done that never applied. **Make patches fail loudly** on a missed pattern,
    or use exact-read edits.
20. **Your test fixture can hide the bug.** The isolated preview harness had a franchise
    location in its stub store; the real tenant has none. Everything passed in the harness
    and was broken in the app. Make the harness default to the *hostile* case.
21. **Google Maps with no API key draws its own modal over your UI.** Gate on the key and
    render your own placeholder; never instantiate a map you cannot key.
22. **`will-change: transform` plus a transition can leave transforms unsettled.** A
    meter rewritten to `translateX() scaleX()` computed correctly with `transition: none`
    and painted at `scaleX(0)` with it on. Do not animate layout properties — but the fix
    is usually *no animation*, not a cleverer one.
23. **The repo's jest config is broken.** `testEnvironment: 'react'` is not a valid
    environment, so every suite fails to start. `npm test` only passes because of
    `--passWithNoTests`. Session 3's tests run under an inline config; **worth fixing
    properly.**
24. **Firefox will not start an HTML5 drag without `dataTransfer.setData`.** Chrome will,
    so this looks fine until someone opens Firefox.

**Session 3B additions:**

25. **The duty palette is the tenant brand, so it cannot carry semantics.** `dutyBlueBg`
    resolves to `surfaceBrandSubtle` and `dutyBlue` to `borderBrand` — on Filter Go's green
    brand, a card the state system had coloured blue rendered **green**. Two systems were
    colouring one card and the brand won. Visit cards now take colour from
    `visitState.js` alone. **Never source a semantic colour from a theme slot whose meaning
    is set elsewhere.**
26. **`borderColor` after `borderLeft` in the same rule silently resets the accent.** The
    shorthand sets all four sides including colour; a later `borderColor` overwrites
    `border-left-color` too. A "4px solid #1570EF" left edge rendered pale blue. The visit
    state classes use ordered longhand for this reason — don't "tidy" them back to shorthand.
27. **MUI `primary` is the brand, not "in progress".** `ScheduleStatusChips` used
    `color="primary"`, so the In Progress chip was green on Filter Go. It now sets blue
    explicitly. Same root cause as §7.25.
28. **`makeStyles` loses to MUI's own component classes.** `.MuiAvatar-root` sets 40px and
    emotion injects after makeStyles, so a plain `width: 20px` was ignored — the drawer's
    technician avatar rendered at 40px and dragged its column's text 10px out of alignment.
    Scope the selector (`'&.MuiAvatar-root'`) or use `sx`. Same trap bit the quiet-row text
    colour, which needed a doubled selector (`'&&.MuiTypography-root'`) to beat a parent's
    descendant rule at equal specificity.
29. **Absence of a field is not absence of the thing.** The blocked-no-tour state first
    tested `!visit.tour` — but the week grid is a *list* payload that does not carry the tour
    object, so every visit on screen badged as blocked. `isBlockedWithoutTour` now requires
    an **explicit** denial (`hasTour === false`, `tour === null`, `requiresTourAssignment`).
    Default to not-blocked.
30. **Mock ids from a call counter break identity.** `visitSeq` minted new ids on every
    fetch, so the same visit changed id when you navigated away and back, and `visitRegistry`
    grew unbounded. Ids are now derived from site + date (`visitIdFor`), which also lets the
    detail endpoint reconstruct a visit on a cold load with an empty registry.
31. **A screenshot taken too early lies about row heights.** FullCalendar's `expandRows`
    stretches the few rows rendered so far to fill the viewport, then reflows. Two
    "the rows are enormous" readings were this artefact — the DOM measured 40–104px the whole
    time. **Measure with `getBoundingClientRect`, or wait for the reflow before screenshotting.**
32. **`overflow-wrap: anywhere` breaks inside words.** It split "Runsheet" into "Runsh/eet"
    in a narrow day column. Use `break-word` with `word-break: normal` so it only splits when
    a single word genuinely cannot fit.
33. **`str.replace` on a missing anchor fails silently.** Two doc sections were written and
    silently dropped this way when the anchor heading was not present. Related to §7.19 —
    **assert the pattern was found**, in prose files as much as in code.

**Session 4 additions:**

34. **A `variant`'s palette cannot be overridden from `makeStyles`. At all.** The quick filter
    switched `variant` on its active state and nothing happened, because the class it wore
    pinned `background` and `color`. Escalating lost every time: `&.MuiButtonBase-root`, then
    `&&` (four classes, beating emotion's single class on specificity), then `sx` at the call
    site — which merged the right values into the emotion class and was *still* overridden —
    then two `!important` classes, which only fought each other. **The fix is to stop
    competing:** let the theme's variant own colour and keep the local class to geometry.
    Generalises §7.28: with `@mui/styles` and emotion side by side, whoever declares a
    property *last in the layer that wins* takes it, and reasoning about specificity will
    mislead you. If you are writing a third override, you have the layering wrong.
35. **`getComputedStyle` over the browser bridge lies about transitioned properties.** It
    reported `background-color: white` on a pill that a screenshot showed as solid green,
    across several reloads, while correctly reporting `font-weight`. Two of the escalations in
    §7.34 were chasing that phantom. Related to §7.31 — **when a measurement disagrees with a
    screenshot, believe the screenshot.**
36. **This is FullCalendar v7, and its class names are hashed per build** (`fc-classic-wsy`,
    `fc-Ao`, …). Every `.fc-dayGridMonth-view`, `.fc-daygrid-day-frame`, `.fc-day-today`
    selector in `calendar.styles.js` is **dead code** — it matches nothing, which is why the
    month view had no today marker and why a `minHeight: 140px` that appeared to explain the
    tall cells was not the cause. The stable hooks are **attributes**: `data-date`,
    `role="gridcell"`, `aria-current="date"`, plus the `className="fc"` the wrapper sets
    explicitly. The harmonize rules already worked this way; follow them.
37. **Month row heights are computed in JavaScript.** FC v7 divides the scrollport by the week
    count and writes an inline `flex-basis` on each row, so CSS on the *cell* can never shrink
    it — the row is what has to be overridden. Two other month defaults are worth knowing:
    `fixedWeekCount` pads every month to six weeks (the empty Sep 5–11 row), and
    `contentHeight: 'auto'` is **ignored whenever `height` is set**.
38. **`fetchRunsheetList` does not return an array.** It wraps its rows, and the key varies by
    caller. Storing `response.data` straight into state and calling `.map` on it took the whole
    visit drawer down with `.map is not a function`. Same family as §7.29 — coerce at the
    boundary, and never let a non-array reach a list.
39. **`location.svg` has a hard-coded `fill="white"`.** On the drawer's white surface the pin
    was invisible, so the address row looked indented by 24px for no reason — the icon was
    there the whole time. Set `fill: currentColor` on the `path` when using it on light
    surfaces.
40. **A drag handler on a container eats the clicks of everything inside it.** The tile map's
    pan called `setPointerCapture` on its root, which retargets every later pointer event to
    that root — so a marker's own `click` never fired and the map's editing actions were
    silently unreachable. Interactive children have to be exempted: they are tagged
    `data-map-mark` and the gesture bails on them.
41. **A container's tone is a claim about what is inside it.** The harmonize overflow box was
    neutral grey — which in this product reads *inert* — over the only actionable thing on
    screen, and when nothing fits it holds the planner's entire selection. Full amber then
    overshot and shouted louder than the route above it. The rule that came out of it: **the
    smallest element carries the colour.** A four-line box in full attention colour competes
    with the thing it is a footnote to; put the signal in the heading and keep the fill a wash.
42. **The visit drawer's "Places" component renders `null` when the Maps SDK is absent.**
    `GoogleMapSearchAddressComponent` is gated on `isLoaded` internally, so dropping it in
    without a fallback silently deletes the field. Same family as §7.17 — in this codebase,
    **a control that cannot render tends to render nothing rather than degrade**, so always
    ask what the keyless/empty path shows.
43. **`npm run dev` has `autoPort`, and a new port is a new origin.** After a restart the app
    came up on 59123, which meant empty localStorage and a fresh login — and any tab still on
    the old port is looking at a dead server. Extends §7.13: if the app looks logged out or
    stale after a restart, check the port before debugging anything else.

**Session 5 additions:**

44. **`franchiseInfo` is null on the demo tenant, not just missing coordinates.** §7.17 and the
    harmonize doc's second pass both record the *symptom* (a start control that vanishes); the
    cause is that `auth.franchiseInfo` is `null` outright here, so **every** fallback that ends
    at the franchise ends at nothing. If a feature has a location ladder, assume the franchise
    rung is absent in the demo and check what the last rung shows.
45. **One unresolved value can look like four separate bugs.** No start point meant no plan,
    which meant no stop list, no route line and no meter — reported as "no visits, no
    locations, no map, nothing works". **When several things go blank at once, find the single
    input they descend from before treating them as separate defects**, then ask of each
    element what the *least* it can honestly show is. A set of visits with no order is still
    worth drawing; the list only needed a plan because it happened to live behind one.
46. **A pre-filled input is not a typed query.** `AddressSearchField` seeded its state from
    `defaultValue` and ran its debounced geocode over it, so the moment the field pre-filled
    with `Current position` it searched that phrase, found nothing, and dropped a `No records`
    list over the map before anyone typed. Anything that searches-as-you-type needs to
    distinguish *given* from *entered*, and should only open suggestions while focused.
47. **A `const` used above its own declaration builds clean and blanks the page.** Hit again
    while adding `drawnStops` to `RouteMap` — it was referenced by a `fitKey` template literal
    twelve lines above where it was declared. §7.16 exactly; the only defence is to declare
    derived values above the first thing that reads them.
48. **HMR does not reliably re-run a changed hook's effects.** After editing `useStartPoint.js`
    the drawer kept the *old* gated behaviour until a full page reload — so a fix looked like it
    had not worked. Related to §7.16's lesson but the opposite failure: **when a change to a
    hook appears to have no effect, hard-reload before debugging the change.**
49. **A screenshot can under-report as well as over-report.** The tile map read as a flat grey
    panel in one screenshot while the DOM showed six tiles loaded, positioned and
    `naturalWidth: 256` — they simply had not painted yet. §7.31 said believe the screenshot
    over a measurement; the honest rule is **believe whichever one you can corroborate**: check
    the DOM, then take a second screenshot before concluding anything is broken.
50. **Clicking Login blanks the page — and the login still succeeds.** The login screen's
    `LoaderComponent` renders a Lottie animation whose data is not extensible, so
    `lottie-react` throws `Cannot add property completed, object is not extensible` during the
    sign-in transition and takes the tree down with no error boundary above it. Auth has
    already landed by then: **reload and you are inside the app.** Pre-existing, nothing to do
    with the visits work, and unrelated to §7.16 — but it is the first thing a fresh session
    hits, and it looks like a broken build. Worth fixing (deep-clone the animation data before
    handing it to Lottie), or at least worth knowing.
51. **Do not reformat `obx.json` with a JSON round-trip.** Rewriting it with
    `json.dump(indent=2)` collapsed nothing but changed nine blank lines and expanded one
    inline object — a 4-insertion, 9-deletion whitespace diff in a file **three sessions
    share**, and prettier cannot reverse it because both forms are prettier-valid. Add keys by
    surgical text edit. (It was restored here by re-emitting from the parsed data and reversing
    the nine formatting sites with **line-anchored** patterns — an unanchored `re.escape('  "zones": {')`
    also matches inside `      "zones": {`, which is how the first repair attempt inserted
    newlines mid-indentation.)

## 8. Open decisions the user still owes answers on

Full lists are in the artifacts; `06` marks the view-level ones.

**Still blocking:**

- **Are site access windows real restrictions, or nominal service times?** Decides whether
  routing needs time-window constraints. Blocks any solver work, and remains session 3's
  biggest risk — the harmonize meter will happily claim a physically impossible day fits.
- **Is the 8-hour day fixed or per worker?**
- **Is the contracted service interval stored per site?** **Narrowed in 3B:** it no longer
  gates due dates — the next visit is already in the schedule and quiet rows now show it.
  It gates only *"is this site **overdue** against its contract"* (`06` case 1.9).

**Needs a decision from someone other than the designer — added in session 4:**

- **The keyless map and geocoder are a demo dependency, not a product one.** With no
  `REACT_APP_GOOGLE_MAPS_API_KEY` the drawer calls `basemaps.cartocdn.com` for tiles and
  `photon.komoot.io` for geocoding. Attribution is rendered as their terms require and both
  are fine for a demo, but **rate limits and commercial terms need checking before this runs
  in front of customers** — or a Maps key needs adding, which switches both back to Google
  with no code change. This is a deliberate fork in the road, not an oversight.
- **Does the backend transition a past, never-started visit to `missed`?** The client now
  does it regardless (D11). If the backend does too, the rule is harmless belt-and-braces; if
  it does not, every other consumer of the API still loses those visits.
- **Should the map be able to reorder a route?** Session 4 says no: dragging the polyline
  inserts waypoints that are not visits, and dragging a stop marker implies the *site* moved.
  Order stays the stop list's job. If that is wrong, the workable version is
  drag-a-pin-onto-another-pin to swap, not free dragging.

**Decided in session 5 by the user — a reversal, do not re-derive the old rule.** Full
reasoning in `docs/harmonize-drawer.md`, eighth pass:

- **The device position is offered whenever the drawer opens**, not only when the target day is
  today. This **reverses** design decision 5, whose reasoning — the planner is in the office,
  the technician drives Thursday's round — was right about the *route* and wrong about the
  *field*: a pre-fill is a guess, not an assertion. On a tenant with no franchise coordinates
  it was also the only rung that could resolve, so gating it left the drawer with no start
  point at all. It is labelled `Current position`, and typing beats it. **Cost:** the location
  permission prompt now appears on every open rather than only for today's routes.
- **The map draws the planner's own position** as well as the visits, as a ring rather than a
  pin, suppressed when the route already leaves from it.

**Answered in session 4 — do not re-ask.** Full reasoning in `06` D11–D12:

- **"What is not started yet in the past? Wouldn't that be missed?"** Yes, for a *routed*
  visit — it now resolves to `missed` whatever the record says. Not extended to unrouted
  visits: those failed earlier and differently and belong in the unassigned band.
- **What goes on a visit card?** Three fixed lines: time + status icon, site, runsheet or
  **Unassigned**. Colour, border and icon carry state; the per-state text label is retired.
- **What does a new runsheet need from harmonize?** Only its name. `editRunsheet` asks for
  `startsAt` · `endsAt` · `startDate` · `runsheetName` · `startEndLocation` · `visitSet`, and
  the drawer already holds all but the name.
- **Can completed visits be harmonized?** No — not selectable at all.

**Answered in session 3B — do not re-ask.** Full reasoning in `06` D1–D5:

- **Weekday pattern or specific dates?** *This was "the big one" and it is settled.* A visit
  is assigned to **a runsheet**, or to **a new runsheet on a chosen day**. Never to a weekday.
  The UI must never offer "assign to Tuesday" or imply recurrence.
  > **Carry forward:** a runsheet is still a weekday-recurring *template* server-side
  > (`POST /shiftassignment/patrol/template`). "New runsheet on a day" has to resolve to one
  > dated instance. That is an integration problem, not a design one, and it will bite
  > whoever wires the real endpoint.
- **A visit with no tour template in a bulk add** → add what has tours, **skip** what does
  not, and surface the skipped set as an actionable list. Blocking all would let one
  un-templated site stall nineteen good ones. *Single* add was never actually open — existing
  production code already refuses it (`unassignedHits/index.jsx:52`).
  > **What a "tour" is**, since the user did not know and it is not documented: the work
  > template attached to a visit — the on-site checklist that produces the submitted report.
  > For Signal that is the patrol checkpoint route; for Filter Go the filter-replacement
  > checklist. No tour means no defined work, which is why it cannot be routed.
- **Can a visit be added to a runsheet that has already started?** **Yes — allow it, and flag
  it.** In the field a live route is exactly when demand gets inserted. The UI carries the
  consequence instead of refusing: the inserted stop is visually distinct from a planned one.
- **Can a completed visit be reassigned?** **No.** Read-only, showing the route it ran on.
- **Past weeks?** Read-only, with one exception: a **missed** visit can be re-added to a
  runsheet or moved to another day. This makes missed the only state that outlives its own
  date, which is why marking it on the grid became load-bearing rather than cosmetic.
- **Density** is a *sparsity* problem, not a volume one. A site is serviced monthly,
  quarterly or less often, so the pressure is empty rows. Quiet rows are **sorted, not
  hidden** — with a quick filter to hide them on demand.

Answered during session 3, recorded so they are not re-asked:

- **Harmonize is consolidation only** — collapse a week into one day. Week-spreading stays
  on the `optimizeRoute` page.
- **Start and end are one place** (round trip). This **reverses** an earlier decision in
  `docs/harmonize-drawer.md` §2 that split them and offered an open route. The cost: an
  open route fits one or two more visits per day, and that lever is now gone. The
  arithmetic is still tested if it is ever wanted back.
- Overflow lands **unassigned** on the next day, and the planner picks the day.
- Merging **re-solves** the target runsheet rather than appending.
- Still open from the list above and still blocking session 3's biggest risk: **are access
  windows real restrictions?** The meter will happily claim a physically impossible day fits.

Calls made on the user's behalf that they should confirm:

- `dispatch` and `extra` are **off** for Filter Go, reading "only patrol services"
  literally. Only `dedicated` was named explicitly.
- Gating `extra` on `services.extra` is a **production behaviour change** for any real
  tenant whose API omits `extra`.
- Filter Go's officer term is **"Technicians"**.
- Single-service tenants lose the Overview tab and gain a service-named one. Multi-service
  tenants are unaffected.
- **Session 3B:** the in-progress status chip is now blue **everywhere**, not just on the
  visits tab — it is a shared component. Consistent with the state system, but it changes the
  runsheet and dedicated screens too.
- ~~**Session 3B:** `SCHEDULED` visit cards are now plain white with a neutral edge~~
  **Session 4:** a white fill read as *no card at all* on a white lane. `SCHEDULED` now takes
  `surfaceGreySubtle` — the same fill, radius and padding as a card on the runsheet schedule —
  so a routed visit is recognisably the same object on both surfaces. The accent stays slate
  rather than the runsheet card's brand colour: brand is green on Filter Go and blue on
  Signal, which are exactly the completed and in-progress accents (§7.25).

## 9. Suggested next steps

1. ~~**Answer the weekday-vs-date question.**~~ **Answered in 3B** (§8). The remaining piece
   is the integration one: make "new runsheet on a day" resolve to a dated instance against
   a template endpoint.
2. **Build bulk add.** Decided in `06` D2, not built. There is a *Select visits* mode in the
   toolbar with no bulk-assign flow behind it, and sparse cadence makes this the highest-value
   gap: a week's work is 8–12 visits, exactly the size a planner wants to route in one action.
3. ~~**Density.**~~ **Done in 3B** — but the framing was wrong in this list. It is not
   crowded cells needing "+N more"; it is empty rows. See `06` D8. Still untested:
   `REACT_APP_SCHEDULE_CALENDAR_VIRTUALIZATION` at a few hundred sites.
4. **URL state** for tab / view / week / filters. Cheap, and it makes a week shareable —
   which is most of what a scheduler is socially used for.
5. ~~**Cancelled and missed treatments on the visits grid.**~~ **Done in 3B** — all eight
   states draw.
6. **Decide the Maps key question** (§8). Adding `REACT_APP_GOOGLE_MAPS_API_KEY` to `.env`
   switches the harmonize map and its address search from the keyless OSM path back to
   Google, upgrades the route legs from straight lines to real driving directions, and
   retires the commercial-terms question in one move. Then **wire the map** into the route
   builder and the runsheet drawer, which still render nothing without it.
7. **Build the propose→diff→accept loop** from the optimization design — start at Stage 1
   and do not ship wider scopes before locking exists.
8. **Fix the jest config** (§7.23) so the 23 harmonize tests run under `npm test` rather
   than an inline config.
9. **Finish harmonize:** undo, the "client not told" marker, and phantom cards on the target
   day. All listed in `docs/harmonize-drawer.md`. *(Places autocomplete came off this list in
   session 4 — the address field is a real search on both the keyed and keyless paths.)*
10. **Wire the two write paths that are still proposals.** The visit drawer's runsheet
    dropdown hands off to the existing reassign flow rather than writing, and harmonize's
    Apply emits a `createdRunsheet` payload nobody consumes yet. Both are deliberate — the
    reassign flow owns route recalculation — but they are the seam where this stops being a
    demo.
11. **Commit.** Nothing is committed and the tree mixes three people's work.

~~Pending chip: `CustomDropDown`'s `zIndexValue` defaultProp.~~ **Done in session 3** —
it was warning on every page with a dropdown.

## 10. Suggested skills

- **`impeccable`** — for further UI work; matches the visual bar set here.
- **`artifact-design`** + **`artifact-diagramming`** — required before writing any new
  Artifact page. Docs 01–05 share one visual system (green `#2DA551`, mono display face,
  single-column with full-bleed figures); match it if you extend the set.
- **`anthropic-skills:docx`** — if the compiled Word doc needs updating. Note gotcha §7.14.
- **`grill-me`** — the user responded well to being asked one sharp question at a time with
  a recommendation attached.
- **`code-review`** / **`simplify`** — before committing, given the tree mixes authors.

## 11. Working style that landed well

- The user delegates decisions readily — **make the call, state it, and flag what you
  assumed** rather than stalling on confirmation.
- They correct decisively when a call is wrong. Expect and invite that.
- Resolving questions **from the codebase instead of asking** was valued explicitly.
- **Verify in the browser and show the result.** Session 2's audit was accepted because
  every claim came with a reproduction; the fixes were accepted because each was
  demonstrated running.
- Flagging risks they had not considered — interval drift, route churn, time windows
  turning TSP into VRPTW, one visit reading differently in two places — consistently drew
  follow-up. Keep doing it.
- **Correcting your own earlier analysis is welcome, not penalised.** Session 3B told the user
  the horizon problem was blocked on the service-interval field; it was not. Saying so plainly
  and unblocking the work landed better than quietly moving on would have.
- They answer in **terse fragments covering several questions at once** ("That has already
  started, Allow it, but flag or show in the UI. No, reassingign already completed visits
  should not be part."). Map each fragment to the question it answers, restate the mapping,
  and act — don't ask them to expand.
- They also **rewrite the options you offer** rather than picking one ("dont hid empty rows,
  bring the sites with visits up top"). Treat a rejected option list as the answer it
  contains, not as a non-answer.
- **Ask about the data before designing against it.** The single most valuable thing the user
  said all session was that a site might be visited once a month or once a quarter. Every
  density decision made before that was made against a mock that lied.

**Session 4 additions — the whole session was this, so these are the important ones:**

- **"Fix it yourself" means don't hand back a blocker.** Told the map needed a Maps key that
  cannot be created here, the user's answer was two words. The right response was not to ask
  again — it was to find the path that did not need one (keyless OSM tiles and geocoding) and
  ship it, then flag the commercial-terms question as a decision rather than an obstacle.
  **Surface constraints once, with the workaround already built.**
- **When they say they are confused, the design is wrong — do not explain it.** *"What does
  this UI mean? I am confused."* about the overflow box was not a request for a walkthrough.
  Every element they questioned turned out to be a genuine defect: a heading naming only a
  failure, a grey container over the only actionable thing on screen, a control that read as
  a filter. Answer the question in one line, then fix the thing.
- **They read the screen literally, and they are right to.** "Why is it inside the grey box",
  "the message should be inside the box below", "I am still not seeing the map" — each is a
  precise report. None needed interpretation; all of them were true.
- **They reverse decisions, including ones they prompted.** The SVG schematic was built to
  solve a real problem and scrapped one turn later for a real map. Build it so the reversal
  is cheap, record why it existed so nobody re-derives it, and do not argue.
- **Numbers in copy earn their keep.** "Nothing fits in this day" was accepted for one turn
  and then questioned; naming *which* runsheet and *how much* of the day it was eating ended
  the conversation. State the cause, not the symptom.
- **The demo data is part of the design.** Two of this session's findings were data bugs
  wearing UI clothes: past visits marked "Not started", and every route in the drawer leaving
  from one hard-coded coordinate. **If the screen looks wrong, check what it is being fed
  before redesigning it.**
