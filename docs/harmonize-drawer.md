# Harmonize drawer — implementation spec

Decisions from the design session on 2026-08-10. This supersedes the current
`harmonizeDrawer` implementation and is the source of truth for the rebuild.

---

## 1. What it is

**"Can I do this whole week in one trip?"**

The planner selects visits on the calendar, opens the drawer, and the system
collapses them into a single day's route. The win is *five days becoming one* —
saved driving is a consequence, not the headline. The binding constraint is the
eight-hour man-day.

This replaces the old model ("how do I drive less across this week?"), which
shuffled visits between days and led with `−2h 4m`. Week-spreading keeps its
existing home in the full `optimizeRoute` page and does not appear here.

Two entry points, **one engine** (`buildRoute/helper.js`):

| Entry | Surface | Candidate selection |
| --- | --- | --- |
| Calendar | Drawer | Already chosen, on the calendar |
| Runsheet list | `buildRoute` page | `CandidatePool` + search |

---

## 2. Resolved decisions

| # | Decision | Rationale |
| --- | --- | --- |
| 1 | Consolidation only, no mode switch | Two modes means every number means something different depending on a control the user must notice |
| 2 | Drawer, not full page | Selection happens in context; the calendar behind can ghost-preview the move |
| 3 | Target day auto-selects the day holding the most selected visits | Fewest moves = fewest client notifications = least risk |
| 4 | Start ladder: GPS → franchise → typed address (always visible) | A start point almost always exists; "pins only" becomes rare, not designed-for |
| 5 | "Current position" offered only when target day is today | The planner's browser location is not the technician's Thursday origin |
| 6 | End defaults to return-to-start; return leg counts against budget | Already true in `buildRoutePlan` |
| 7 | Open-route toggle surfaces as the suggested fix when visits spill | Teaches itself at the moment it's useful |
| 8 | Overflow is a **bucket**, never a second plan | Day 2 gets a date picker, list, and service total — no map, meter, or ordering |
| 9 | Overflow default = next day; user can change | |
| 10 | Overflowed visits land **unassigned** on day 2 | We never routed them; the calendar already has an "Unassigned Visits" row |
| 11 | No cascade. Want day 2 planned? Apply, reselect, harmonize again | Iteration over recursion — second pass is identical to the first |
| 12 | Merge target defaults to the **existing** runsheet with most remaining capacity; tie-break to `worker: null` | Avoids runsheet sprawl |
| 13 | `live` runsheets are selectable but never the default | Harmonize is a planning act, not a dispatch one |
| 14 | Meter keeps the 8h scale and adds an "already on route" segment | Don't rescale to remaining — show *why* there's no room |
| 15 | Merging **re-solves** the whole route, interleaved | Appending saves nothing and makes the feature look broken |
| 16 | Completed stops lock; no drag handle rendered on them | |
| 17 | Re-solve must be disclosed: *"3 added, 2 existing stops re-ordered"* | Silently rewriting someone else's route destroys trust |
| 18 | First manual drag switches route to manual; solver stops until `Re-optimize` | One bit of visible state beats a pin/float model the user must predict |
| 19 | Map is a read-out, not an editor | Two-way hover/click highlighting only |
| 20 | Removing a visit *is* overflowing it — `⋮ → Move to Tue 11` | One place things go |
| 21 | Haversine orders (instant); one Directions call decides | Ordering doesn't need precision; the meter does |
| 22 | Meter may nudge when Directions lands; the **fits/doesn't-fit split may not** | Numbers can settle, decisions can't flip-flop |
| 23 | Three alternate **orderings**, not alternate roads | Google ignores `provideRouteAlternatives` when waypoints are present, and road choice is not a planner's decision |
| 24 | Options strip collapses when options differ by <5 min and same fit count | No decision offered where there isn't one |
| 25 | Manual drag hides the options strip | Alternates are solver output; they overrode the solver |
| 26 | Calendar ghost-previews the move while the drawer is open | Confirmation *before* commitment; apply becomes the smallest possible event |
| 27 | Apply closes the drawer — no success screen | The calendar is the success screen |
| 28 | **No notifications fire on apply** | Send is a second, deliberate act |
| 29 | Pending notification is a **state on the object**, not a toast moment | A toast vanishes and three clients never hear |
| 30 | Undo: 15s in toast, indefinite via activity log | Safe by construction, since nothing outbound fired |
| 31 | Device push held 15s **only** for `live` merge targets | One narrow special case |

### Route options

| Option | Optimises | Default |
| --- | --- | --- |
| Shortest driving | Least windshield time | ✓ |
| Fits the most | Max visit count in the day; drops expensive outliers to overflow | |
| Overdue first | Compliance-safe sequence; costs more driving | |

All three solved together (parallel Directions calls, 400ms debounce) so
switching is instant with real numbers.

---

## 3. Layout

```
┌──────────────────────────────────────────────┐
│ Harmonize 7 visits                         ✕ │
│ Nothing is written until you apply.          │
├──────────────────────────────────────────────┤
│  Into   [ Mon 10 Aug            ▾ ]          │
│  Start  [ Northgate Depot       ▾ ]          │
│  End    [ Return to start       ▾ ]          │
├──────────────────────────────────────────────┤
│          MAP — pins, then route              │
│   pins immediate · polyline fades in         │
├──────────────────────────────────────────────┤
│  7h 30m of 8h                     30m left   │
│  ██████████████████████░░░░░░░░░░            │
│  ▪ already on route 5h 20m                   │
│  ▪ service 1h 30m   ▪ travel 40m             │
│                                              │
│  Lands on  [ Alex Green · Mon North    ▾ ]   │
├──────────────────────────────────────────────┤
│  ROUTE OPTIONS                               │
│  ◉ Shortest driving    6h 12m   all 7 fit    │
│  ○ Fits the most       6h 48m   all 7 fit    │
│  ○ Overdue first       7h 05m   6 fit        │
├──────────────────────────────────────────────┤
│  ROUTE · Your order        [ Re-optimize ]   │
│   1 ✓ Mill Street       8:15 · done   🔒     │
│   2 ● Downtown Plaza   10:05 · 45m   NEW ⋮   │
│   3   Harborview Hub   11:20 · 30m       ⋮   │
├──────────────────────────────────────────────┤
│  OVERFLOW  2 visits  →  [ Tue 11 Aug   ▾ ]   │
│   Harborview Logistics Hub                   │
│   Downtown Plaza          1h 15m of service  │
├──────────────────────────────────────────────┤
│  [ Keep current plan ]   [ Apply → Mon 10 ]  │
└──────────────────────────────────────────────┘
```

Open the drawer with the calendar scrolled so the **target day sits leftmost**
in the visible strip — otherwise the drawer occludes the day it's discussing.

---

## 4. Loading and failure

Never a full-drawer spinner. Everything known renders on frame one; only the
unknown parts are visibly pending. **The hole in the meter is the loading
indicator.**

| Element | On open | While solving |
| --- | --- | --- |
| Controls | Immediate | Live |
| Map pins | Immediate (coords come from selection) | Live |
| Route polyline | — | Fades in |
| Meter · service | Immediate | Solid |
| Meter · travel | — | Shimmer |
| Stop arrival times | `—:—` | Resolve |
| Fits/overflow split | — | Held until Directions lands |

| Failure | Behaviour |
| --- | --- |
| GPS denied / timeout | Silent fall back to franchise; address field stays visible. Not an error, no dialog |
| Directions unreachable | Keep haversine numbers, label meter `Estimated` |
| Maps SDK absent | `NoMapIcon` / `mapPlaceholder`; list and meter carry on |
| Apply fails | Toast; drawer stays open with all state intact |

---

## 5. State model

```js
targetDay        // ISO date — defaults to day holding most selected visits
startPoint       // { mode: 'current'|'franchise'|'address', location }
endPoint         // { mode: 'start'|'last'|'address', location }
mergeTargetId    // null = new runsheet
routeOption      // 'shortest' | 'mostFit' | 'overdueFirst'
manualOrder      // null = solver-owned; array of stop ids = manual
overflowDay      // ISO date — defaults to targetDay + 1
solveState       // 'ordering' | 'routing' | 'ready' | 'estimated'
```

---

## 6. Reuse vs net-new

**Reuse unchanged**

- `buildRoute/helper.js` — `MAN_DAY_MINUTES`, `groupVisitsIntoStops`,
  `orderStopsByProximity`, `buildRoutePlan`, `buildVanLoad`, formatters
- `RightDrawer`, `CustomDropDown`, `toaster`
- `googleMap/searchAddress.jsx` — Places autocomplete for typed address
- `franchiseInfo` (lat/lng) from redux — already used as map centre in
  `franchiseMap`, `runSheets/details`, `dispatchMap`

**Reuse with changes**

- `CapacityMeter` — add the "already on route" segment
- `RouteTimeline` — locked stops, `NEW` badges, drag handles, row `⋮` menu
- `NotifyDialog` — lift from `optimizeRoute/components` to shared

**Net-new**

- `useCurrentPosition` hook — `navigator.geolocation` appears nowhere in the
  codebase today; ~15 lines plus permission handling
- Directions fetch layer — one waypointed call per option, 3 in parallel,
  400ms debounce
- Three-option solver (`shortest` / `mostFit` / `overdueFirst`)
- Overflow bucket, route options strip, manual/auto order control
- Ghost preview on `ScheduleCalendarGrid`
- `Client not told` marker + persistent runsheet notification bar

**Delete**

- `harmonizeDrawer/demoProposal.js` — `buildDemoProposal`, `summarise`,
  `CHANGE_KIND` all belong to the old week-shuffle model
- The entire current drawer body

**Engineering note:** `common/directionsMap` is 1365+ lines carrying a lot of
runsheet-specific behaviour. Build a thinner map for the drawer rather than
reusing it — the drawer needs pins, one polyline, and hover sync, nothing else.

---

## 7. Build order

1. **Shell on the existing engine** — drawer, three controls, meter, stop list,
   haversine only, no map. Proves the model end to end.
2. **Map** — pins first, then polyline.
3. **Directions** — real times, then the three options.
4. **Overflow + merge semantics** — including re-solve and locked stops.
5. **Ghost preview, apply, undo, notification state.**

---

## 8. Open risks

**Site access windows — the biggest correctness risk.**
`orderStopsByProximity` orders purely by proximity and its own comment admits it
ignores access windows. Tolerable when nudging a week around; not tolerable when
cramming a week into one day, because a site serviceable only 14:00–16:00 can
invalidate the whole sequence while the meter cheerfully reports it fits.

*v1 assumption:* ships without window handling. Any visit with a hard window
gets a `⚠` on its row and is excluded from the "all 7 fit" claim. Honest about
the gap rather than silently wrong.

**Day start time.**
Hardcoded `9 * 60` in `buildRoute/index.jsx`. Starting at 07:00 buys two hours
of budget — a real lever for consolidation.

*v1 assumption:* not a control. Inherited from the target runsheet when merging,
franchise default otherwise. A fourth control above the meter would cost more
clarity than it buys.

Both to be confirmed at team sync.

---

## 9. Build log

Built, lint-clean, `vite build` passing, 22 unit tests green.

| File | |
| --- | --- |
| `harmonizeDrawer/index.jsx` | rewritten — orchestration |
| `harmonizePlan.js` | new — three orderings, packing, merge interleave |
| `demoVisits.js` | new — replaces `demoProposal.js` (deleted) |
| `useStartPoint.js` | new — GPS → franchise → typed address ladder |
| `useDirections.js` | new — one waypointed call, 400ms debounce |
| `components/DayMeter.jsx` | new |
| `components/RouteMap.jsx` | new |
| `components/RouteOptions.jsx` | new |
| `components/StopList.jsx` | new |
| `components/OverflowBucket.jsx` | new |
| `harmonizePlan.test.js` | new — 22 tests |
| `calendar/index.jsx`, `ScheduleCalendarGrid.jsx`, `scheduleCalendar.styles.js` | ghost preview + richer selection payload |
| `locales/en/obx.json` | `runsheet.harmonize` namespace, 65 keys |

### Where the build diverged from §2, and why

**§14 got better.** The spec had the existing runsheet load *eating* the budget.
It doesn't: the day is always a full eight hours, the existing work is a segment
inside it, and committed stops carry `canSpill: false` so they can never be
pushed to overflow — only the new work can. That is more truthful and it made
the "already on route" segment fall out naturally.

**Two components were duplicated rather than extended.** `CapacityMeter` and
`RouteTimeline` are horizontal, page-shaped, and coupled to `buildRoute.styles`.
The drawer needs vertical, 580px versions with locked stops and drag handles.
Flagging one shared component into two very different layouts would have cost
more than the ~60 lines of layout each. The *maths* is still shared —
`helper.js` is imported, not copied.

**Native HTML5 drag, not `react-beautiful-dnd`** (which is installed). The
drawer is positioned with a CSS transform, which breaks that library's absolute
positioning.

### Not built

- **Undo and the notification state (§28–31).** Apply fires a summary toast; it
  has no `Undo` action, `NotifyDialog` was not lifted to shared, and the
  `Client not told` marker does not exist. The drawer *computes* `notifyCount`
  and hands it to `onApplied`, so the wiring point is there.
- **Ghost preview is partial.** Departing visits fade and the target/overflow
  columns tint. Phantom cards do **not** appear on the target day — that needs
  an injected FullCalendar event source.
- **Typed address is a plain input with a stubbed geocode.** The Places
  component (`googleMap/searchAddress.jsx`) is not wired in yet.

### Verification

Logic is covered by 23 tests — packing, the return-leg charge, open-route gain,
same-site collapse, merge interleave, committed stops never spilling, completed
stops pinned, overdue-first, merge-target defaulting, day defaulting, and that
"fits the most" never fits fewer than its siblings.

The drawer itself was rendered and inspected in a browser via a temporary
isolated harness (real theme, real translations, stub store), since the app is
behind a login this session could not authenticate through. Checked at 1280×900
and at 375×812. The harness has been deleted.

`.env` has no `REACT_APP_GOOGLE_MAPS_API_KEY`, so the map shows its placeholder
and the meter reads `Estimated` from haversine. Both are designed states, but
they are what a demo will show until a key is set.

---

## 10. UI pass — bugs found and fixed

Every one of these was found by rendering the thing and looking at it.

| Bug | Fix |
| --- | --- |
| Drawer declared `width: 580` inside a paper `RightDrawer` hardcodes at **523px** — content clipped | Drawer takes `width: 100%`; the paper owns the width |
| `RightDrawer` had **no responsive handling at all** — fixed 523px overflows any narrower viewport | Added `maxWidth: 100vw` and a full-bleed `sm` breakpoint, plus an optional `width` prop (default unchanged) |
| **Scroll container computed to `height: 0`** — the stop list was unreachable, because fixed chrome exceeded the drawer height | Only header and commit bar are fixed now; controls, map and meter scroll, with the meter `position: sticky` so the answer stays on screen. `minHeight: 0` is what actually lets a flex child scroll |
| Native `<select>` / `<input>` / `<input type=radio>` — matched nothing in the product | `CustomDropDown`, MUI `TextField`, MUI `Radio` |
| Inline 62px label column | `InputLabel` stacked above each control, as every other form does it |
| `CustomDropDown` **returns `null`** when `selectedValues` is undefined — a `.find()` miss silently deleted the control | Every `selectedValues` now has a fallback object |
| Selected-value labels truncated at a hardcoded **20 chars** regardless of control width — "Alex Green · Mon Nor…" | Added opt-in `labelMaxLength` (default still 20, so nothing else changes) |
| Sentences read badly through the system's `text-transform: capitalize` — "Return To Start" | Copy changed to short noun phrases that title-case cleanly — "Round Trip", "Last Visit" |
| With no Maps key, Google threw **its own modal over the drawer** | Never instantiate a map without a key; show our placeholder instead |
| Long site names pushed arrival times off the edge | Ellipsis truncation on stop, option and overflow names |
| Footer summary + two buttons could not share 475px | Footer stacks; buttons share the row |
| `zIndexValue` default was `'10000'` (string) against `PropTypes.number` — warned on every dropdown in the app | Changed to a number *(pre-existing, not from this work)* |

### Reversal: one location field, always a round trip

Decisions 4–7 in §2 split start from end and offered "return to start" against
"end at last visit". **That is reversed.** The route leaves from and returns to
one place, so:

- **One field, "Start & end"** — a plain text input the planner types into. No
  mode dropdown, no separate address field revealed by picking a mode.
- Pre-filled with the device position when the target day is today, otherwise
  the franchise. Typing always wins; if nothing resolves the box is simply
  empty, which is a legible state rather than a dead end.
- Commits on **Enter and blur**, independently. Routing Enter through `blur()`
  looked tidy but silently did nothing whenever focus had already moved.
- `returnToStart` is now a constant. The open-route toggle, the "ending at the
  last visit would free up time" remedy, and the `END_MODE` state are gone.

`planOption` keeps its `returnToStart` parameter — the tests still exercise both
arithmetic paths, and the drive home being charged to the day is the reason the
meter reads as it does. The UI just no longer offers the choice.

**Cost of the reversal, so it is not rediscovered later:** an open route fits
one or two more visits into the same eight hours. That lever is now unavailable,
and spilled visits go to the overflow day instead. `harmonizePlan.test.js` still
pins the difference if it is ever wanted back.

### Re-order had no affordance

Decision 18 was built and worked — every stop row carried `draggable="true"` and
`cursor: grab` — but nothing on screen said so. The only glyph in the row was
`⋮`, which is *move to overflow*, so the one visible control in the area did the
opposite of re-ordering. Functionally present, practically invisible.

- **Visible grip (`⠿`)** on every movable row, faint at rest and full strength
  on hover or keyboard focus.
- **The grip is the drag target, not the row.** A draggable row fights text
  selection and swallows the `⋮` menu.
- **Keyboard support** — the grip is a focusable button; `↑`/`↓` move the stop.
  Drag alone made re-ordering mouse-only.
- **`dataTransfer.setData` on drag start** — Firefox refuses to begin a drag
  without a payload, so this never worked there.
- **A hint in the section header**, shown only while the solver still owns the
  order: *"Drag ⠿ or use ↑ ↓ to reorder"*. It is replaced by the `YOUR ORDER`
  pill and `Re-optimize` once the planner takes over.
- Completed stops render a spacer instead of a grip, keeping the column aligned
  without offering a control that would refuse.

**Adding the grip column then broke the timeline's alignment**, because only the
stop rows got it. Measured before the fix:

| element | left |
| --- | --- |
| start/end anchor markers | 381 |
| numbered stop markers | 409 |
| anchor names, drive-time lines | 417 |
| stop names | 445 |

Nothing shared an axis, and the grip sat 18px below its own row's marker —
`alignSelf: center` centring it against a two-line body on a `flex-start` row.

Fixed by making the row geometry explicit and shared: `GRIP_WIDTH`,
`INDEX_SIZE` and `ROW_GAP` are constants at the top of the stylesheet, the leg
lines indent to `GRIP + GAP + INDEX + GAP` rather than a hardcoded `36`, the
anchors render an empty grip spacer, and the grip is `flex-start` at
`INDEX_SIZE` tall so it centres on the marker. All markers now sit at one x, all
names and leg lines at another.

### Coherence pass

Measured the drawer against the schedules module's own conventions rather than
against taste. The controlled comparison — sampling the module's font sizes with
`--exclude-dir=harmonizeDrawer` — is what made the biggest problem visible.

**A parallel type scale.** The module uses **14** (22 uses) and **12** (18 uses)
as its body pair and contains **zero** half-step sizes. Every `11.5 / 12.5 /
13.5` in the codebase came from this drawer. Eleven distinct sizes collapsed to
seven, all of which exist in the app:

| | sizes |
| --- | --- |
| App (excl. this drawer) | 10 11 12 13 14 16 18 20 22 |
| Drawer, before | 10 11 **11.5** 12 **12.5** 13 **13.5** **15** 16 18 22 |
| Drawer, after | 10 11 12 14 16 18 22 |

**Hard-coded colour.** Six hexes in `RouteMap` (`#1B7F4D`, `#0F5132`, `#9CA3AF`,
`#1F2937`, `#FFFFFF`). Google's marker and polyline options need literal
strings, so they now read from `useTheme()` rather than being invented — they
would otherwise ignore the tenant palette entirely. Zero hexes remain.

**Drawer chrome.** Header padding `20px 24px 16px` → `24px 24px 16px 24px`, and
footer `14px/gap 10` → `16px 24px/gap 12`, matching every other drawer.

**Hierarchy inversion.** The reorder hint had drifted to 12px, outweighing the
11px section label beside it. Demoted to 11.

**One fix that was worse than the bug.** The bundled detector flagged
`transition: width` on the meter segments (animating layout properties). The
transform-based rewrite — absolutely-positioned segments driven by
`translateX() scaleX()` — computed correctly in isolation but rendered at
`scaleX(0)` in the app: `will-change: transform` promoted each segment to its
own compositor layer whose transform never settled, so two of three bars painted
at zero width. Reverted to plain flex widths with **no** transition at all,
which satisfies the rule (nothing layout-animated) without the breakage. The
meter is a readout; it should snap. Detector now returns `[]`.

**Not done, and worth knowing:** the repo has no PRODUCT.md, so the skill's
context gate was unmet — this pass audited internal consistency against the
codebase, not brand or strategy. Body/meta at 14/12 is a 1.17 ratio, under the
1.25 type-contrast guidance, but it is the app's own pairing and matching the
system won over the generic rule.

### Second UI pass

| Issue | Fix |
| --- | --- |
| **Start control absent entirely** on a tenant with no franchise lat/lng — the mode defaulted to `franchise`, which was not in its own options, so `.find()` missed and `CustomDropDown` returned `null` | `useStartPoint` now snaps the mode to an option that actually exists; the drawer also guards `selectedValues` |
| Address field only appeared once mode was already `ADDRESS`, so with nothing else on the ladder there was **no way to set a start point at all** | The address input shows whenever no point resolved — the last rung is always reachable |
| "Nothing fits in this day" shown when the real problem was a missing origin — sends the planner to change the wrong control | Distinct message: "Set a starting point and the route, timings and capacity appear here" |
| Footer read **"0 visits · Everything fits"** while 7 selected visits sat unaccounted for | With no plan the footer states "7 visits selected · No plan yet — set a starting point" |
| Drawer narrower than the product's others | `RightDrawer` width prop set to **680px** (+30% on the 523px system default) |
| Dropdowns at the component's 36px toolbar default | 44px with 16px text, matching the product's other drawer forms |
| Harmonize offered on runsheet/overview tabs | Gated to the visits tab (`VISITS_SCHEDULE_TAB_ID`); leaving the tab tears down selection, drawer and ghost preview |

**One logic bug the UI exposed:** "Fits the most" was showing **3 fit** while
"Shortest driving" showed **5**. Cheapest-next ordering loses to plain proximity
on clustered work, so the option's name was a promise it was breaking. It now
tries both orderings and keeps whichever genuinely fits more, tie-breaking to
the shorter drive — with a test pinning that invariant. As a consequence it can
land on exactly the shortest-driving route, so identical outcomes are now
collapsed rather than offered as a choice that isn't one.

### Third UI pass — session 4

| Was | Now |
|---|---|
| Target-day label read **"Into"**, and when the day failed to resolve the control's *value* also read "Into" — the label restated as the answer | **"Do all visits on"** + the day, which reads as one sentence. The placeholder is "Choose a day", never the label |
| An unresolved day printed **"Invalid Date"** into the merge-target label and the Apply button, because a truthy-but-unparseable `startsAt` became an invalid `dayjs` and travelled unchecked | Parsed then checked in `buildVisits`; `defaultTargetDay` skips unreadable dates and never returns an invalid day |
| "Start & end" | **"Start and End Location"** |
| Map ran full-bleed while every other block sat on a 24px inset — the one element that is a *figure* was the one with no margin, so it read as a seam across the panel | A card: 24px inset, 12px radius, 1px border, with its key beneath it |
| No legend — pin and line colours were unexplained | Legend strip in the map's card, built from the same theme tokens the pins and polyline are drawn from, so map and key cannot drift |
| Capacity meter rendered before there was a route, reading **"0m of 8h · 8h left"** — not a neutral zero but a confident claim that the day is empty, directly above a hint asking for the address it needed | Gated on `hasRoute` (a start point **and** a solved plan). It appears with the route |

**The map is now a component with a contract**, because interactions and motion
are coming to it:

- `mapCard` owns the inset and the vertical rhythm. Nothing inside it should set
  its own outer margin.
- `mapSurface` owns the rounded clip and is the **positioned stacking context**.
  Anything overlaid — a hover card, a moving vehicle, a drawn-in route, a re-fit
  control — mounts here, not in the card and not inside `GoogleMap`.
- `mapPending` is that overlay layer, and it exists whenever a route is being
  re-solved rather than replacing the map. **Never tear the map down to show a
  loading state**: re-mounting `GoogleMap` re-runs `fitBounds` and throws the
  viewport away, which is the animation-killer on this screen.
- `mapLegend` is a sibling strip, so adding a key for a new mark never touches
  the map. It scrolls horizontally — the drawer is a fixed width and the legend
  is the part that gives.

### Fourth UI pass — session 4b

| Was | Now |
|---|---|
| **Completed and cancelled visits were selectable.** Harmonize *moves work*, so a planner could build a selection Apply would then have to refuse or silently drop | Not selectable, and it looks it: dimmed and desaturated in selection mode, no checkbox. Clicking still opens the drawer — a completed visit has a report worth reading, and a click that does nothing reads as a broken screen. **Missed stays selectable** (D5): it is the one past state still actionable |
| **"Lands on"** described where the plan ended up, not what the planner was doing | **"Add to runsheet"** — this is the assignment step |
| "Create a new runsheet" was an option with nothing behind it | Selecting it reveals **one field: Runsheet name**, pre-filled `Thu 13 Aug Route`, and a line naming what the drawer is filling in for you |
| No live map without a Google Maps key, so the thing the drawer exists to show was a grey rectangle | An **SVG schematic** that draws the route |

**Why the name is the only field.** `editRunsheet`'s two steps ask for
`startsAt` · `endsAt` · `startDate` · `runsheetName`, then `startEndLocation` ·
`visitSet`. This drawer already holds every one of those except the name — the day
comes from "Do all visits on", the origin from "Start and End Location", the stops
and the window from the solved plan. So `onApplied` now carries a
`createdRunsheet` payload with exactly those fields, and the integration is a
payload rather than a second interview.

**The schematic (`RouteSketch.jsx`) is a sketch, not a map**, and says so on its
face with a `SCHEMATIC` badge. No roads, no labels, no scale — a schematic that
pretended to be a street map would claim precision the solver does not have
either (`buildRoute/helper.js` is nearest-neighbour over straight-line distance).
What it is honest about is what the decision turns on: relative position, order,
and the shape of the trip.

- Stops are projected from real lat/lng into the viewBox, so relative geography
  survives.
- **No line until the solver has produced one.** Before a start point the stops
  are a *set*, not an order, and joining them would invent a route nobody asked
  for. Unnumbered pins are the honest picture of an unsolved selection — and that
  state now draws, where previously the map had no points at all until a plan
  existed.
- The route **draws itself in** via `stroke-dashoffset`, keyed on the stop order so
  every re-solve replays the draw. This is paint-only, which is the whole reason it
  is safe to animate here (handoff §7.22 — do not animate layout).
- A vehicle travels the path on `animateMotion`. That is what makes route creation
  read as an event rather than a diagram.
- Both are decoration over information already on screen, so
  `prefers-reduced-motion` switches them off with nothing lost.

### Fifth UI pass — the map, reversed

**The SVG schematic from the fourth pass is deleted.** It was built because there is
no Maps key in the demo env and the drawer's central figure was a grey rectangle;
the user's call is a real Google map instead, editable. Recorded so nobody
re-derives the schematic later thinking it was an oversight — it was a deliberate
stand-in that has been deliberately withdrawn.

**Consequence, stated plainly: with no `REACT_APP_GOOGLE_MAPS_API_KEY` the map panel
is empty again**, reading "Map needs a Google Maps key". We never instantiate a map
we cannot key (§7.21 — Google draws its own error modal over the UI if you try). One
line in `.env` plus a restart is the whole fix.

**Start and End Location is a Places search**, reusing
`common/googleMap/searchAddress` — the same component the site form uses — so an
address is a real geocoded place. It replaces a free-text box whose `commitAddress`
handler pinned **every** route in the demo to one hard-coded lat/lng whatever was
typed, which made the whole map a fiction. That component renders `null` when the
SDK has not loaded, which would silently delete the one field a plan cannot be built
without (§7.17's failure mode), so the plain text box is kept as an explicit
fallback rather than as the default.

**What "editable" means here, and what it deliberately does not.** Clicking a stop
opens a bubble offering *Move to next day*; clicking a spilled visit offers *Add to
this day*. Both call the same `moveToOverflow` / `bringBack` the stop list uses, so
the map and the list cannot describe different plans, and the solver re-runs either
way. Two things are switched off on purpose:

- **No draggable `DirectionsRenderer`.** Dragging Google's route inserts waypoints
  that are not visits, which would silently corrupt a plan whose entire subject is
  which visits are in it.
- **No draggable stop markers.** A site's coordinates are a fact about the site, not
  a property of this route; dragging one would imply the visit had moved.

Order therefore stays the stop list's job, where it already has a drag handle and
keyboard controls.

### Sixth pass — a map that renders without a key, and a real search

The fifth pass left the panel empty because there is no `REACT_APP_GOOGLE_MAPS_API_KEY`
and one cannot be created here. Rather than leave the blocker with the user, the map
now renders either way.

**Two renderers, one contract.** `RouteMap` still uses the Google map whenever the SDK
loads — that stays the product's standard and is what production will use. When it
does not load, `TileRouteMap` renders the *same* OpenStreetMap streets as keyless
raster tiles from CARTO's public basemap. Both draw the same marks, both call the same
`moveToOverflow` / `bringBack`, so a key upgrades the renderer rather than enabling
the feature.

`TileRouteMap` is written against the tile protocol directly rather than pulling in
Leaflet: fit-to-bounds, pan, zoom and a click target is ~120 lines of Web Mercator,
and a mapping library would be a new dependency and a second set of conventions for
one 240px panel.

**Start and End Location is a real search on both paths.** With the SDK it is the
product's own Places component (`common/googleMap/searchAddress`). Without it,
`AddressSearchField` geocodes through Photon — OpenStreetMap data served for typeahead,
the same source as the tiles, so a searched address lands where the map says it is.
This retires a genuine falsehood: the old free-text box's `commitAddress` assigned
**one hard-coded lat/lng** to anything typed, so every route in the demo left from the
same place and the map was drawing a fiction. That handler is deleted.

**Flag for review before this ships commercially.** The keyless path makes requests to
two third-party services (`basemaps.cartocdn.com`, `photon.komoot.io`). Attribution is
rendered as their terms require, and both are fine for a demo, but **neither is a
commercial production dependency** — rate limits and terms of use need checking, or a
key needs adding, before this path runs in front of customers. The Google path exists
precisely so that is a config change and not a rewrite.

**One bug worth keeping.** Panning called `setPointerCapture` on the container, which
retargets every later pointer event to it — so a marker's own `click` never fired and
the map's editing actions were silently unreachable. Marks are tagged `data-map-mark`
and the pan gesture now bails on them. **A drag handler on a container will eat the
clicks of everything inside it** unless interactive children are exempted.

### Seventh pass — the overflow box was unreadable

Reported as plain confusion: *"what does this UI mean? Wasn't this supposed to be the
list of visits the user selected? Even if these are those visits, why is it inside the
grey box?"* Both halves of that were the design's fault, and the second half is the
more instructive.

| Was | Now |
|---|---|
| `DOESN'T FIT — 2 VISITS` — an uppercase label naming only the failure, with no subject and no destination | **"2 visits won't fit on Thu 13 Aug"** — what, how many, and off which day |
| Neutral grey box on a grey fill. In this product grey means *inert* — settled, nothing to do | **Amber**, matching `visitStateBlocked` on the grid. This box holds work that lands unassigned unless somebody acts, and when nothing fits it holds the only decision on screen |
| Day dropdown floating beside the heading, reading as a filter | **"Move them to [ Fri 14 Aug ]"** — a sentence with the control as its object |
| "Lands unassigned — someone still needs to route it" as the quietest line in the box | Promoted, and it names the actual consequence: *they'll land unassigned — somebody still has to put them on a runsheet* |
| "Nothing fits in this day. Try another day, or a runsheet with more room." — symptom only, so the next move was a guess | Names the cause: *"{{runsheet}} is already carrying {{load}} of the {{budget}} day, and the driving between them takes the rest"*, or for a new runsheet, that the driving alone uses up the day |

**Follow-up, same pass.** Two more corrections after seeing it in place:

- The nothing-fits explanation was still *outside* the box, floating above it as loose
  orange text — so it read as a separate warning about something else when it is the
  explanation for exactly the list underneath. It now renders **inside** the box, last,
  under a hairline: the box says what and what next, then answers why.
- Full amber overshot. A saturated wash across a box this tall shouted louder than the
  route above it, which is the actual subject. The fill is now a barely-there warm wash
  (`#FFFDF7`) with a hairline border, and **the signal lives in the heading alone**.
  The rule that came out of it: *the smallest element carries the colour* — a four-line
  box in full attention colour competes with the thing it is a footnote to.

**The lesson worth keeping.** When *nothing* fits, this box holds the planner's entire
selection and the route list above it is empty — so a container styled as an exception
pile turned their own list into a rejection notice and left them asking where their
visits went. **A container's tone is a claim about what is inside it.** Grey said
"ignore this" over the only actionable thing on the screen.

### Eighth pass — the drawer showed neither the visits nor the places

Reported flatly: *"When user selects the cards, and open side drawer, i dont see the visits
on the side drawer, neither locations on the map. The map should show the locations, and
user's current location if available."* All of it was true, and it was **one fault with four
faces** — every visible symptom hung off a single unresolved value.

**The chain.** `useStartPoint` asked for the device position *only when the target day was
today*. The reasoning was sound (the planner sits in the office; the technician drives
Thursday's round) but it left the ladder with no reachable rung: the demo tenant's
`franchiseInfo` is **null**, so with the device gated out nothing resolved. And with no start
point there is no origin, so no plan; with no plan `StopList` draws nothing; with no stops
there is no route line and no meter. One null at the top produced a drawer that opened onto a
day dropdown, an empty address box, and two unnamed dots.

| Was | Now |
|---|---|
| **The selected visits were never listed.** The drawer had no list at all until a plan solved, so the one thing the planner knew for certain — *which visits am I working with* — was the one thing the screen never said | A **`SelectionList`**: the visits as a *set*, chronological, each with its service time and the day it currently sits on, headed `Visits you selected · spread over 2 days`. Deliberately no numbers and no arrival times — before the solver runs, ordering them would invent a sequence nobody produced (the same rule that keeps the map's line off) |
| **Two identical green dots**, unnamed. "I don't see locations on the map" is the correct reading of that: a dot is not a location | Pins carry **site-name labels**, drawn stroke-first so they stay legible over street detail. Unnumbered pins are always named — there is no ordered list to cross-reference them against yet; once solved, the number does that job and naming all twelve would bury the route, so a solved pin is named **on hover**, through the same highlight channel the stop list already used |
| **No current location anywhere**, and no way to get one on this tenant | The device position is requested **whenever the drawer opens**, pre-fills the field as `Current position`, and is drawn on the map — as a **ring**, not a disc, because it is a position and not a stop. When the route already leaves from it, the start mark stands there and the ring is suppressed rather than saying one thing twice |
| The legend advertised **Route** and **Starting & ending point** unconditionally — two marks that were not on the panel a planner sees before setting an origin | Every legend entry is conditional on its mark actually being drawn. An unsolved selection reads `Selected visit`, and nothing else |
| **The target day defaulted into the past.** Today was Wed 12 Aug; the drawer picked **Mon 10 Aug** and offered `Apply → Mon 10 Aug` | `defaultTargetDay` excludes days that have gone and falls back to today; the day dropdown opens no earlier than today. Three tests pin it |

**The reversal, stated plainly.** Decision 5 in §2 — *"Current position offered only when target
day is today"* — is **reversed**, at the user's direction. Its reasoning was never wrong about
the *route*: the planner's browser is not the technician's Thursday origin. But it was wrong
about the *field*, because a pre-fill is a starting guess, not an assertion. What keeps it
honest is that the value is labelled `Current position` so it can be recognised and changed,
and typing still beats it. The cost is that the permission prompt is now asked on every open
rather than only for today's routes.

**Why the past-day bug mattered more than it looked.** It was not an edge case. `06` D5 makes a
**missed** visit the only thing still actionable in a past week — so a selection made of past
dates is precisely what harmonize is for, and the old rule counted every selected date and
broke ties towards the *earlier* one. The most ordinary use of the feature aimed it at a day
that had already gone.

**Two more found while fixing, both in the same family as §7.17.**

- **A pre-filled field is not a typed query.** `AddressSearchField` seeds its state from
  `defaultValue` and searched it, so the moment the box read `Current position` the field
  geocoded that phrase, found nothing, and dropped a **`No records`** list over the map before
  the planner had typed a character. A value the field was *handed* now skips the search, and
  suggestions can only open while the field has focus — a late response must not open a list
  over whatever the user has moved on to.
- **The Google renderer waited for a plan when the keyless one did not.** `RouteMap`'s own
  comment promised pins "the instant the drawer opens", and the tile path delivered that from
  `scatteredPoints` while the Google path drew only solved `stops` — so adding a Maps key would
  have *removed* the pre-plan map. Both renderers now read one `drawnStops`.

Also fixed, and it is case **4.6** for the third time: the list's meta line printed
`Vantage Point Labs` and then `51m · Vantage Point Labs, Tampa, FL` directly beneath it,
because the demo's fallback address is the site name with a city appended. An address earns
its line only when it says something the name above it did not.

**The lesson worth keeping.** Four separate bug reports, one missing value. When several
things on a screen are all blank at once, **look for the single input they all descend from
before treating them as separate defects** — and note which of them had no independent
fallback. The visit list did not need a start point to exist; it just happened to live behind
one. Ask of every element: *what is the least this can honestly show?* A set of visits with no
order is still worth drawing. Two named dots with no line between them are still a map.
