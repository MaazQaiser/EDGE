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

### Ninth pass — the optimizer proposes, the planner edits (session 7)

A redesign, not a fix. The brief, verbatim in six parts: the feature is **AI suggesting the
optimized route**; clicking harmonize considers **all the visits in the current week**; it
takes the **planner's current location** as start and end; a runsheet is a **Route** on Filter
Go; time on site is **20 minutes per filter** with the breakdown available but not on the face
of the card; and the day is **8 hours**, with the remainder becoming another route on a day the
planner picks.

**What the old flow got wrong.** It opened with *Select visits* and closed with a choice
between three orderings, and both ends asked the planner to do the solver's job. Which visits
can share a day is precisely the question the solver can answer and they cannot; and
"shortest driving" versus "fits the most" differ by minutes that are invisible on a map. So the
drawer now opens on an answer and their job is to accept it, re-date it, or overrule it.

**The four questions it now asks, in order.**

| | |
|---|---|
| **Plan window** | The days the plan may use — a date range, defaulting to the week on screen. Every day picker below is bounded by it |
| **First route day** | Defaults to the day already holding most of the week's work |
| **Start & end** | The planner's position, *stated* rather than offered as an empty search box, with `Change` next to it |
| **The spill** | Which day, and what on that day: merge into a route that already exists there, or create one |

**One plan, not three.** `planBestRoute` runs all three orderings — they are cheap — and keeps
the one that serves the most visits, breaking ties towards the shorter drive. What replaces the
choice is the **reasoning**: a panel that names what was read (`10 visits across 10 sites`),
what was estimated (`14h on site — 42 filters × 20 min`), what was sequenced, and what it was
fitted to (`an 8h day, driving included`). Every step states a number the plan actually used —
that constraint is the whole discipline here, because a step reading "analysing…" is theatre,
and theatre is what makes a planner distrust the numbers underneath it.

The steps arrive one at a time over ~1.7s and then **stay**, with the conclusion above them.
Nothing clears: a planner asking why a visit was left out is asking about a step. Reduced
motion goes straight to the finished list.

**The plan is computed locally and synchronously** by the same route maths as before. The
reveal is an experience, not a wait — but it is an honest one, because those are the stages the
maths would be slow in if it were slow.

**Time on site is filters × 20 minutes, and that model has one home** (`utils/constants/serviceTime`,
imported by both the route maths and the demo data). Two things follow from stating it once:
the drawer, the grid card and the visit drawer cannot disagree about the same visit — the
drawer's "Service Time" was a flat 45 minutes before, which agreed with nothing — and the
number is *decomposable*, which is what makes the tooltip possible. The row shows `1h 40m`; the
tooltip shows `5 filters × 20 min`, the drive leg, and the arrival. A stop list of arithmetic is
unreadable; an estimate you cannot decompose is one you have to take on faith. One number on
the row, the working one hover away.

**The spill is a destination now, not a bucket.** It used to end with "they'll land unassigned —
somebody still has to put them on a route", which is an unfinished sentence: the planner is
already here, already looking at these visits, already knows the day they want. It asks the day
(bounded by the window, never the first day — that day is what refused them) and then what on
that day, defaulting to whichever existing route has the most room and to creating one when the
day is empty. It is still **not** a second solved route: sequencing the spill doubles the drawer
and then raises the same question about a third day.

It does warn when the spill cannot fit its own day either — `9h 20m` of service in an `8h`
budget will spill again, and saying nothing there would promise a route that cannot exist.

**Start point: three rungs and a stated assumption.** Device position, then a typed address,
then the franchise — and when all three fail, which is the demo's default state because
geolocation is denied and `franchiseInfo` is null, **the centre of the week's own visits**. That
last rung exists because without any origin there is no sequence, no arrival times and no meter
(§7.45 again). It is labelled `ASSUMED` and overruled in one click. A plan built on a stated
assumption beats an empty drawer; an unlabelled one would be worse than either.

**Deliberately not done.** The spill is not sequenced and has no meter. A third day is never
proposed — the warning names the problem and the planner decides. Nothing writes: Apply emits
`routes` and `createdRoutes` payloads nobody consumes yet.

**Three traps worth recording.**

1. **`RangeDatepicker`'s propTypes are wrong about its own dates.** They ask for
   `instanceOf(Date)`; the values go straight to MUI's `DatePicker` running `AdapterDayjs`,
   which calls `value.isUTC()` on them. A `Date` throws `value.isUTC is not a function` and
   takes the whole drawer down. Pass **dayjs**.
2. **Its `selectedDates` prop must be referentially stable.** It mirrors the prop into its own
   state from an effect keyed on the prop, so a fresh `[start, end]` literal each render makes
   that effect fire every render and the field renders blank about half the time.
3. **§7.16 for the third time.** `harmonizableVisits` was declared above the `activeTab` it
   reads — built clean, linted clean, blanked the Schedules page. Derived values go below
   everything they read, every time.

### Tenth pass — a run of routes, and an optimizer that looks like it is working

Seven refinements, all from reading the built screen. Six are copy and layout; the
seventh changed the architecture.

**1. The title claimed a scope it did not own.** "Harmonize this week" stops being
true the moment the planner widens the plan window to a fortnight — and a title that
needs re-reading every time a control below it changes is not a title. It is
**Optimize routes** now, scope-neutral; what is actually being planned is stated in
the panel, where the numbers are.

**2. "Do the first route on" was a dropdown of the window's days.** Same information,
in a control that cannot show a month — and a planner moving work to "the Tuesday
after next" is thinking in dates, not list positions. Each route now carries a real
**date picker** (`components/common/datePicker`), bounded by the plan window.

**3. Start & end is a field with an address in it.** It was a label with a `Change`
link, and the label read `Current position` — which names the *source*, not the
place, and a route leaving from an unnamed point cannot be sanity-checked against
the work it visits. The device fix is now **reverse-geocoded** through Photon, the
same keyless geocoder the field searches, so the box holds a street address however
it was filled.

**4. The stop marker is the product's marker.** Numbered teardrop pins with dashed
connectors, matching the runsheet drawer's stop list and the pins on the map
directly above — same shape, same colour, same digit. A circle was a third shape for
the same object. Colour carries state and nothing else: brand for planned, green for
done, amber for a site whose access window could not be checked.

**5. One diagnosis, in one place.** The panel said "0 of 4 visits fit", the footer
said "Nothing fits on Thu 13 Aug", and a paragraph above the CTA explained the far
start point. Three statements of one fact read as three problems. The **panel** now
owns the diagnosis — including the far-start and nothing-fits cases, which used to
be their own paragraphs — and the footer owns only what Apply will do.

**6. The footer is three figures, not two sentences.** `3 routes · 10 visits
scheduled · 2 left over`, with the exception in amber and nothing else. It was two
prose lines restating the panel in a different register.

**7. The spill is a route, and there can be several.** This is the architectural
one. The brief was always "create a new route if the visits spill", and a bucket
handed to a date was not that: it had no sequence, no capacity and no destination,
which made the second day the one part of the plan the planner could not check.
`planRun` now walks the window greedily — fill a day, hand the remainder to the next
available day, solve that too — and every route in the run is the same object: a
date picker, a merge-or-create target, an ordered stop list, a meter. One card is
expanded at a time and the map follows it; three polylines at once is no map at all.

Two consequences worth recording:

- **Auto-picked days move forward from the last route's day**, not from the start of
  the window. Otherwise pinning route 1 to Thursday sends route 2 back to Monday —
  an unused day, and nonsense as a sequence of work. Re-dating route 2 to Thu 27
  pushes route 3 to Fri 28, which is what a planner expects and what it does.
- **Merge-or-create is now solved, not assumed — but merging stays the default.**
  `defaultMergeTarget` picks the emptiest route on a day, which is the right
  preference and the wrong decision alone: a route already carrying six hours is
  still the emptiest one there, and dropping a 100-minute visit into it produced
  `1 visit · 9h 38m of 8h` — a day the optimizer proposed and nobody could work. So
  both ways are solved, and **the merge is taken whenever it fits inside the eight
  hours**; a fresh route only when the merge would overrun and a fresh one would
  not; and if neither fits, the one serving more visits.
  > **The order of those tests is the whole thing, and I had it wrong first.**
  > Ranking by visits-served *first* made a fresh route win almost every time —
  > an empty day always has room for more — which is a better number and the wrong
  > answer: it silently stopped merging altogether, against an explicit product
  > rule ("if there was already a runsheet on that day, these visits will be merged
  > in"). Fit is a constraint; merging is the preference. Constraints filter,
  > preferences choose.

**The avatar.** The panel had a static `✦` beside changing text, which reads as a
label *for* the text rather than the author of it. It is now a 34px SVG with two
states: **working** — a sweep rotating on a visible track, three satellites orbiting
at three radii on three durations, and a core that breathes; **done** — the sweep
fades, the satellites fold into the core, and the track and star remain. The
transition is the signal: motion stopping is what says the number above it is final.
Beside it, the conclusion carries a clipped sheen while it works, each step slides up
as it lands, and the plan area shows **skeleton rows** rather than the solved route —
showing the answer during the reveal would make the steps a lie.

All of it is transform/opacity CSS on one 34px mark (§7.22), and it is inline SVG
rather than Lottie on purpose: the login screen's Lottie is the one animation in this
app that reliably crashes it (§7.50). `prefers-reduced-motion` gets the resting mark
and the full list — the whole explanation, minus the theatre. **One media block, not
two**: a duplicate key in a JSS sheet is a silent overwrite, not a merge, so the
avatar's opt-out was being thrown away by the panel's until they were combined.

Honesty note: the sweep is not tied to real progress, because the solve is
synchronous and there is no progress to report. It shows *occupancy*; the steps
beside it, which name real numbers, are what report the work.


### Eleventh pass — the bottom messaging, back and doing a different job

Asked for in four words: *"re add the bottom messaging in the drawer"*. The tenth
pass had stripped the footer to three figures because two prose lines there restated
the panel's diagnosis — and in doing so it also deleted the one sentence nothing else
on the screen carried: **what Apply actually writes**.

That is a different fact from the plan. The panel above says what the optimizer
found; the footer now says what pressing the button does to the schedule:

```
3 routes   10 visits scheduled
Apply creates 2 new routes and adds 5 visits to Alex Green · Sun North.
1 stop on an existing route will be re-ordered to fit.
```

Three registers, in size order, each earning its place:

- **The figures** are the scoreboard — comparable at a glance, and between runs.
- **The sentence** names the write, and names existing routes by their worker,
  because "adds 5 visits to Alex Green · Sun North" is something a planner can act on
  and "adds 5 visits" is not. It is composed from clauses rather than written per
  case: create-only, merge-only, both, with leftovers, with re-orders — one key per
  combination is how copy goes stale.
- **The caveat**, amber and last, is the only warning here: re-solving a route the
  planner never picked rewrites somebody's day. **This is the line that made the
  re-add worth doing.** It had existed in the old footer, went out with the prose,
  and its only remaining home was the toast *after* Apply — a consequence that
  appears after the fact is one nobody consented to.

What did *not* come back: the diagnosis. "Nothing fits on Thu 13 Aug" and the
far-start explanation stay in the panel, where the optimizer speaks.

### Twelfth pass — the reveal, choreographed end to end

Asked for as a sequence rather than a set of fixes: press Harmonize and see the
plan window and the day being planned; an AI widget working below them with **one
line** under it naming the current action, replaced by the next; then the map
arriving with the route already drawn, closest-path connected; then the visits
below loading in one by one; the amber "these fall outside the route" message
walked through properly; and on Apply, the drawer closing while the calendar's
visits go to a loading state and then **stack onto their route's day**.

Most of the ingredients existed after the tenth pass — an avatar with two states,
line-draw motion on both map renderers, a staggered stop list, `routeMotion`'s
shared clock. What did not exist was a *sequence*. They were composed as a panel
at the top with a stacking step list, a map mounted from frame one, and an Apply
that closed the drawer and fired a toast over an unchanged calendar.

**One clock, in one place.** `useAiPlan` is replaced by `useHarmonizeReveal`,
which owns all three beats — `composing` → `drawing` → `ready`, plus a short
`resolving` blip for edits. The old hook only sequenced the step list while the
map and the stop list each ran their own `useEffect` computing `delayForIndex`
independently. That is the same clock twice, and the same clock twice is a clock
that drifts the moment one component re-renders and the other does not. Now the
map's line, the pins and the rows all read `stopsRevealed` from the hook, and
`StopList`'s stagger effect is deleted in favour of rows that mount when it is
their turn and animate themselves in.

| | Was | Now |
|---|---|---|
| **On open** | Panel at the top saying "Working out the best routes…", above the controls it was working *from*; map already mounted with pins; three generic skeleton rows | Controls first, then the drawer's whole body is the optimizer: a 60px avatar, a scope line (`4 VISITS · THU 13 AUG – WED 19 AUG`), **one** status line, and four ticks. No map, no list, no figures |
| **The working-out** | Four steps stacking up as they landed — text moving every 420ms while being read, and by the end four lines with no indication which was current | One line, replaced. The four are kept as the record behind **Show working**, so nothing that was said is lost |
| **The map** | Mounted always; drew its line whenever a plan appeared | Mounted at `drawing`, so its **first painted frame is the frame the route starts drawing on**. A map that sat empty for two seconds and then sprouted a line is a diagram updating; this is a route being made |
| **The stops** | Three fixed-width skeleton bars, then the whole solved list | The list has its **true length** from the first frame and resolves content in order. `revealCount` gates each row; the drive home and the finish time land last, once every stop has |
| **The spill** | Inferable only by noticing there were two cards | An amber ribbon on the route that absorbed it, naming what did not fit, off which day, and what was created — with a **Leave these visits where they are** action |
| **Apply** | Drawer closed, toast, calendar unchanged | Every visit card shimmers, then the moved ones land on **their own route's day**, staggered in route order |

**Two voices for the same four facts.** `lineRead` / `lineEstimate` /
`lineSequence` / `lineFit` are present tense for the stage; `stepRead` … stay past
tense for the record. A status line and a log read differently — "Sequencing 12
stops…" is what is happening, "Sequenced 12 stops" is what was done — and a list
of gerunds after the fact reads like a process that never finished. Every one of
them still names a number the plan actually used; that constraint is the whole
discipline, because a line reading "analysing…" is theatre and theatre is what
makes a planner distrust the numbers underneath it.

**The full reveal plays on open, and only on open.** The old hook replayed
everything whenever the start point or a pinned day changed, so re-dating one
route made the planner sit through the introduction again. An edit is a *diff*:
it gets a 380ms acknowledgement and the map's existing 240ms redraw, and the rows
travel rather than re-enter. `runKey` is the sitting; `solveKey` is the answer.

**The amber, named once.** `SPILL_WASH` / `SPILL_LINE` / `SPILL_INK` are constants
at the top of the stylesheet, because the palette cannot do this job:
`surfaceWarningSubtle` (`#FEF0C7`) is heavier than the barely-there wash the
seventh pass landed on, and `textWarning` (`#f19f02`) fails contrast as body copy
on any light ground — it can mark a bar or a border but never carry a sentence.
Those three hexes were already in the drawer, scattered and unexplained; they now
have one home and one reason, and the spill ribbon, the nowhere-to-go box and the
footer caveat speak in the same voice because of it.

#### Five things found by building it and looking at it

1. **The spill ribbon was invisible.** It started inside the card body, directly
   above the date picker and route dropdown that answer it — which read well and
   was wrong, because **only one card is expanded at a time and it is never this
   one**. The most consequential thing the optimizer did without being asked was
   hidden behind a click the planner had no reason to make. It is now between the
   header and the body, outside the `Collapse`, so it shows either way. An amber
   index on a shut card is a hint; it is not the sentence.

2. **The relocation moved the data and not the cards.** A calendar event here
   carries *two* dates: `startsAt`, the payload timestamp, and `start`, which is
   what FullCalendar positions from — `mapShiftToCalendarEvent` writes it as a bare
   `YYYY-MM-DD` and its own comment says why. Rewriting `startsAt` alone meant the
   apply sequence played its shimmer and its landing animation over nine cards
   that had not gone anywhere. `reDate` now re-dates all four fields and
   **preserves each one's shape** — date-only stays date-only, a timestamp keeps
   its clock time — because normalising `start` to an ISO timestamp would be a
   second, quieter version of the same bug.

3. **The answer leaked out of the disabled button.** The footer figures are gated
   on the reveal, but `Apply → Thu 13 Aug` still printed the day during composing.
   A disabled control carrying an answer the screen has withheld is the one place
   that cannot read as provisional. It says `Working it out…`, which is also why
   it is disabled.

4. **`$keyframes` do not resolve inside `@global`.** The calendar's apply rules
   target FullCalendar's own nodes, so `@global` was the obvious home — but there
   `animation: '$applySettle …'` is passed through as a literal and the animation
   silently never runs. They are a scoped `applyingGrid` class on
   `scheduleCalendarFull` instead, added only while the sequence runs, which also
   means the selectors cost nothing the rest of the time.

5. **A button that made three visits vanish.** "Leave these visits where they are"
   routes through the same `movedOut` set as *move a stop out*, which removes work
   from the run entirely — and nothing anywhere accounted for it, so the visit
   count simply went down. The footer has a fourth figure now, `N left as they
   are`, which is deliberately **not** the same fact as `N left over`: one was
   chosen, the other could not be placed.

#### Verified

Sequence measured in the running app on a fresh load, sampling the DOM from the
click: `COMPOSING: Reading 4 visits across…` → `Estimating 2h 20m on site…` →
`Sequencing 4 stops from…` → `PLAN rows=1 pending=3` → `PLAN rows=4 pending=0`.
The stop reveal caught mid-flight is the `rows=1 pending=3` frame.

Apply, measured the same way: all nine cards `data-applying="settling"` with the
grid class on, then four `landing` with delays `0 / 55 / 110 / 165ms` and five
untouched; visits `1635221` (Mon 10) and `1655225` (Fri 14) relocated to Thu 13,
joining the two already there. Every card outside the plan stayed put.

Spill verified by temporarily shrinking `MAN_DAY_MINUTES` to 90 (reverted): two
routes, the ribbon on the shut Route 2 card reading *"1 visit wouldn't fit on Thu
13 Aug — So a new route was created for them"*, and its action collapsing the run
back to one route with `1 left as they are` in the footer.

26 route-maths tests green, `vite build` passing, `eslint --ext .jsx,.js` clean
across the schedules module, and no console errors beyond the app's pre-existing
`defaultProps` deprecation warning.

**Two pre-existing problems this pass ran into and did not fully fix.**

- **The test harness cannot run.** `jest.config.js` sets `testEnvironment: 'react'`
  (not a real environment) and referenced a `__mocks__/svgrMock.js` that was never
  committed, so *every* suite failed to resolve at the first icon import. The
  missing mock is restored here; the invalid `testEnvironment` and a
  `setupTests.js` that boots an MSW server pulling in a top-level-await module
  under babel-jest's CJS output are both still broken. The 26 tests above were run
  with a minimal config that drops `setupFilesAfterEnv`. `npm test` remains dead.
- **Three components are now unimported dead code** — `OverflowBucket.jsx`,
  `RouteOptions.jsx`, `SpillPlan.jsx` — leftovers from the bucket model and the
  three-option strip. Left in place rather than deleted as part of an animation
  pass.

**Scope of the calendar move, stated plainly.** It patches `allDuties` only —
the collection the visits week and month grids read — and it does not survive:
any change of view, tab, filter or date window refetches, and the move is gone,
because nothing was written. Re-keying the day and list views' own collections to
fake persistence would be worse than not doing it, since the calendar would then
be asserting a schedule the server does not have.

### Thirteenth pass — six corrections from the built screen

All six reported against the twelfth pass, and one of them was a bug the pass had
introduced by omission.

**1. The origin is an address, and it is not labelled.** The field held *"Centre of
this week's visits"* — a description of a method, not a place. A planner cannot check
a route against it, cannot tell whether it is five minutes or fifty from the first
stop, and cannot recognise it as wrong, which is the only thing a start point has to
support. `useStartPoint` reverse-geocoded the *device* fix only; it now resolves
whichever rung answered, through the same Photon geocoder, and the demo reads
`North Dale Mabry Highway, Carrollwood, Florida`.

The `CURRENT` / `ASSUMED` chip is **gone** with it. It named how the drawer guessed,
which is the drawer's problem; and it put a badge on the most accurate origin
available while leaving a typed one bare, so the honest case wore the mark of doubt.
The address is the answer, and a wrong one is recognisable as wrong — which is what
the chip was really for.

**2. The panel is an exception report, and it is amber.** It used to dock with a
conclusion (*"All 4 visits fit in one day"*), a driving total, and — when the origin
sat far from the work — an explanation of the distance. All three are out. Every
number in them was already on screen somewhere it could be acted on: the counts are
the footer's figures, the driving is each route's meter. So the panel was the one
region that repeated other regions, in the tint that made it look like the most
important of them.

What is left is the only thing nothing else says — **which visits the plan leaves
out** — named rather than counted, because "3 could not be placed" is a number a
planner can do nothing with and three site names are three decisions. It is amber
because a plan that does not include all the work is an exception, not an outcome;
it uses the same wash / hairline / ink as the spill ribbon, since both are the same
claim at two scales. And when nothing falls outside, **the panel does not render** —
a region that appears in order to report nothing is a region people learn to skip.

The `nowhere to go` box under the routes went with it. Two amber boxes describing one
set of visits reads as two problems.

**3. The CTAs stopped moving.** The footer is `space-between`, which only pushes the
buttons right while something else is in the row — and while the optimizer composes
there are no figures, so they sat at the left edge and jumped right when the plan
landed. `marginLeft: auto` on the actions instead of relying on the parent. The
buttons are the one thing on this screen that must not move.

**4. Apply refused without saying why, in two different ways.** This is the bug.

- It could arrive **disabled** — no origin, no plan, an origin on another continent —
  and after correction 2 the reason had nowhere to live at all, because the panel had
  stopped carrying diagnoses.
- It could be pressed and **silently do nothing**: the handler bails when a new route
  has no name, marks the field and expands its card, which in a 680px drawer is easy
  to miss and impossible to connect to the click that caused it. The planner's next
  move is to press it again.

There is one `applyBlock` now, checked in the order the planner would have to fix
things — an origin before a plan, a plan before its name — and each case names the
**remedy**, because the state is not the move:

```
⚠ Give the new route a name before applying.
⚠ The start location is 4,182km from the nearest visit, so no one-day route is
  possible. Search for an address near the work.
⚠ Nothing fits inside an 8h day from this start location. Try a closer address,
  or widen the plan window.
```

It renders last in the footer's left column, immediately beside the button it is
about. The unnamed case deliberately leaves Apply **enabled**: pressing it is what
focuses the field that needs filling, and a disabled button cannot take the planner
anywhere.

**5. The stop rows are rebuilt to the supplied spec.** A stack of 68px units — a 36px
row over a 32px dashed connector — each row a grip, a numbered teardrop, and a
grey-subtle pill carrying the site in bold, two meta facts separated by 4px dots, a
state badge, and a circular chevron. The track scrolls at a fixed 340px.

| | |
|---|---|
| **Geometry is named, not chosen** | The dashed connector only lands on the pin's centre axis while `GRIP + PIN_GAP + PIN/2` equals `GRIP + CONNECTOR_GAP`. Both give 34. They are constants at the top of the sheet because a stray edit to either silently bends the timeline |
| **Colour is state and nothing else** | `STOP_TONES` — green done, blue planned, grey for a stop whose access window could not be checked. Pin fill, pin rim and connector are one object, because three values that must agree should not be three rules |
| **The detail moved into the chevron** | The row used to carry a hover tooltip with the arithmetic behind its estimate, plus a `⋮` that moved the stop out. A tooltip is unreachable by keyboard, and a `⋮` beside a drag handle is two glyphs for two kinds of move. Both are behind one affordance now: filters × 20, the drive leg, the day it moved from, and *move out* |
| **A drawn dot, not a middot** | A typographic separator inherits the font's own vertical centring and drifts against a 20px line |

**The 4px that mattered.** `minHeight` gave 72px units against the spec's 68: the
pill's 20px line plus 16px padding plus 1px borders is 38, which grows the row by 2
and the unit by 4. Over twelve stops that is half a row of drift, and the connectors
stop matching the gaps they bridge. Both row and pill are pinned heights with
`border-box`, and the unit measures 68 / 36 / 32 exactly.

**Deliberate divergences from the spec, so they are not read as mistakes:** the
chevron's disc is white rather than `#F5F5F6`, because the spec gives it the same
fill as the pill it sits on and it disappears. The spec's `15 mins free time / Make
this break` strip is `display: none` in the source and is not built. `stopRow` /
`stopBody` / `stopName` are untouched — the unordered selection list borrows them,
and before a route solves the visits are a *set*, with no pins, numbers or
connectors; rebuilding the shared keys under this spec would have pulled a
timeline's geometry into a list that must not imply one.

#### Verified

Measured in the running app: `stopUnit` 68 / `stopUnitRow` 36 / `stopConnector` 32,
track 340 with 376 of content; the start field holding
`North Dale Mabry Highway, Carrollwood, Florida` with no badge element in the DOM;
footer actions right edge at 1936 against a parent right edge of 1960 (the footer's
own 24px inset) in **both** the composing and ready states; the amber panel reading
`1 visit falls outside the route` over `Vantage Point Labs — 1h` with
`aiPanelWarn` applied and no conclusion line; and clearing a route name producing
`⚠ Give the new route a name before applying.` *before* the click as well as the
field error after it.

The spill case was forced by temporarily setting `MAN_DAY_MINUTES` to 75 (reverted).
26 route-maths tests green, `eslint --ext .jsx,.js` clean, `vite build` passing.

**Now dead, and flagged rather than deleted:** `VisitTimeChip.jsx` joins
`OverflowBucket.jsx`, `RouteOptions.jsx` and `SpillPlan.jsx` — the chevron detail
panel replaced the tooltip it was, and its only remaining importer is `SpillPlan`,
which nothing imports. A good number of stop-row style keys and locale strings are
orphaned with them.

### Fourteenth pass — the supplied marker and reorder icons

The route row from the thirteenth pass was built from the CSS dump alone, which
described the marker's box but not its outline. `assets/svg/mapStopPin.svg` was
supplied with this pass and both icons now come from it.

**The teardrop is the asset's own path.** Hand-approximating it was close and not
right: the marker is 16.57 × 20 inside a 20 × 20 box with a specific shoulder curve,
and a pin whose point sits a fraction low leaves the dashed connector starting
*beside* it rather than continuing from it. `PIN_PATH` is the same `d` the asset
carries, so the shape is the design's and the colour and number are the component's.

Two details that had to be reproduced rather than simplified:

- **The rim is inside the shape.** The spec says `border: 1px solid` with
  `box-sizing: border-box`, and the asset does that with a mask — a 2px stroke
  clipped to the fill so only the inner half survives. A centred 1px stroke would
  have been one line of code and would grow the silhouette by half a pixel on every
  side, which matters because this pin and the map's marker are the same mark at the
  same size.
- **The digit is `<text>`, not the asset's outlined glyph.** An outline can only ever
  be a `1`; a route has stops 2 through 12. Same family, weight and size, and the
  1.5px lift is the spec's own optical centring — a numeral's visual centre sits
  above a tapering shape's geometric one.

**`maskId` is per-instance**, keyed on the stop. One hard-coded id would collide
across twelve pins and every one of them would resolve to whichever mask the
document defined last.

**The reorder handle is `drag_indicator` at the spec's proportions** — six dots in a
20 × 20 box, the cluster spanning 29.16%–70.84% across and 16.67%–83.33% down, which
is what fixes r at 1.25 and the centres at 7.083 / 12.917 and 4.583 / 10 / 15.417.
Drawn inline rather than reusing either drag asset already in `assets`:
`DragIcon.svg` is 28 × 28 and carries its own grey rounded-rect background,
`draggable.svg` is 7 × 10, and both hard-code a fill. Inline and `currentColor` means
the handle darkens on hover and focus without a second file. It replaces a `⠿`
braille glyph that rendered at whatever size the body font felt like and sat a couple
of pixels off the row's centre line.

**The chevron disc is now `surface/grey-subtle` as specified**, reversing the
thirteenth pass's white. On a pill of the same fill it reads as the glyph alone,
which is the intent — a hit area, not a button — and the hover state is what makes it
findable without drawing a second shape on every row.

**The badge is gone from the plain planned row.** The spec sets it `display: none`
there and shows it on the completed and grey variants, which is the right rule and
worth stating: *every* stop in the list was added by this plan, so `Added to this day`
appeared on nearly every row and distinguished nothing. The blue pin already says
"this route will do this". The badge is for the two states that are not the default.

#### Two bugs the icon work surfaced

**1. The method name was still leaking, for about a second.** The field was fixed in
the thirteenth pass, but `startAddress` falls back to the point's `label`, and the
centroid's label was `Centre of this week's visits` — so during the geocoder's
round-trip that string appeared in the field *and* in the route's start anchor, then
was replaced under the reader. A value that changes after you have read it is worse
than one that was never there. The centroid carries no label now, `useStartPoint`
describes every point as a place, and the two waits are named separately: `Locating…`
while finding the coordinate, `Finding the address…` while naming it.

**2. `reverseGeocode` had no timeout, and a public geocoder's failure mode is
silence.** Photon throttles, and a throttled request can simply never settle — at
which point `isResolving` stays true and the field sits on `Finding the address…` for
the rest of the session. Observed live after a session's worth of requests: nine
seconds, no resolution, no error. A rejected fetch already fell through gracefully; a
hanging one had to be *made* to fail first. There is a 4s `AbortController` now, and
the ladder ends in **coordinates** rather than in a method name — four decimals is
about 11 metres, which is a place that can be checked against the pins on the map
directly above and cannot be mistaken for a street it is not.

#### Verified

Measured live: four pins with distinct mask ids (`stopPinRim-115`, `-107`, `-2`,
`-113`), fills `#3F99FF` / `#86868B` and rims `#0058FF` / `#5B5B5F` matching the tone
of each stop; six circles per grip at computed colour `rgb(134, 134, 139)` — Grey/400;
units still 68 / 36 / 32; the badge appearing on the access-window row only; and the
start point resolving to `North Dale Mabry Highway, Carrollwood, Florida` in the
field and both route anchors with no `Centre of this week's` string in any sample and
no stuck resolving state.

26 route-maths tests green, `eslint --ext .jsx,.js` clean, `vite build` passing.

**Unrelated but visible while testing:** with no Maps key the tile basemap sometimes
renders grey — CARTO throttling the keyless path, which the sixth pass already flags
as a demo-only dependency. The route line, pins and legend draw regardless.

### Fifteenth pass — the screen was broken, not unbalanced

Reported as a screenshot with "refine the UI and alignment and balance". The screen
in it could not be balanced, because it was in a failure state: `0 routes · 0 visits
scheduled · 4 left over`, a map zoomed out to two continents, and an amber panel
offering to widen the plan window.

**One value caused all of it.** The reviewer opened the drawer from Lahore; the demo's
visits sit around Tampa. `useStartPoint`'s first rung is the browser's own position,
so the origin became a point **12,941km** from the nearest visit, and everything
downstream followed: no route could be built, the map fitted its viewport to both
locations, and the footer reported zeros.

**The far-origin guard already existed, and this is the difference between detecting
and handling.** `FAR_START_KM` correctly measured the distance, reported it, and then
used the point anyway. A device fix now has to be within `DEVICE_MAX_KM` (400km — well
past anything an eight-hour day can reach and return from) of the work to enter the
ladder at all; otherwise it falls through to the franchise, or to the centre of the
week's own visits. From the same Lahore position the drawer now opens on `1 route · 4
visits scheduled`, framed on Tampa.

`devicePoint` is still returned, because the map's "you are here" ring is worth
drawing — but the drawer only passes it to the map when it is usable, since the map
fits its viewport to everything it draws and a ring 12,000km away costs the route its
legibility for information the field already carries. Every legend entry is
conditional on its mark, so `Your location` drops with it.

**Two controls that would have silently done nothing.** `Use my current location` was
shown whenever `devicePoint` existed — including when the ladder had just refused it,
where `clearAddress()` drops back to the same rejected rung and nothing changes. It
reads `canUseDevice` now. And Apply's label interpolated the first route's day, so
with no routes it rendered `Apply →` with an arrow pointing at nothing; there is a
plain `Apply` for that case, because an arrow is a promise about a destination.

#### Four refinements to balance, all of them content before spacing

**1. The prominent message was the wrong one.** The panel and the footer were each
deciding what to advise, and they disagreed: the panel — larger, higher, amber — said
*"widen the plan window, or drop a stop from a route"* while the footer, three lines
from the bottom, named the actual problem. Following the prominent advice would have
changed nothing. There is one `diagnosis` now, derived in the order a planner would
have to fix things, and both surfaces render from it — the panel takes the remedy, the
footer takes the sentence. The two can no longer drift.

**2. The same four visits were listed twice, 200px apart.** The amber panel named
Cedar Mill, Downtown Plaza, Meridian Hotel and Vantage Point Labs; `Visits this week`
named the same four underneath. The list earns its place as the *difference* between
what was planned and what was not — so it renders only when there is a plan to be
outside of. With no plan the headline and the remedy are the whole message, and the
duplication was most of the panel's height. The headline reads a separate `count`, or
it would have announced "0 visits fall outside the route" on the one screen where all
of them do.

**3. Bold zeros are not a neutral count.** `0 routes · 0 visits scheduled` at the
largest type size in the footer, directly above the sentence explaining that nothing
could be computed, made the zeros the loudest thing on a screen whose actual message
was one line below them. The figures render only when there is a plan.

**4. Alignment follows what is in the column, not what usually is.** The footer is
top-aligned so the buttons sit level with the figures row — right when the figures are
there, and wrong when the column is a single 17px amber line with 40px buttons
towering over it. `footerBalanced` centres it in that case. Separately, the panel's
`Show working` disclosure sat between the remedy and the list it was interrupting, so
the reader met an aside before the panel's own subject; it moved below the list, and
the list is capped at four rows with a scroll so a run leaving twelve visits out does
not push the map off the page with an inventory of what is *not* on it.

#### Verified

Reproduced the exact failure by stubbing `getCurrentPosition` to Lahore
(31.5021, 74.3245). Before: 0 routes, world-scale map, "widen the plan window". After,
same stub: start field `28.0648, -82.5043` (the visits' own centre — coordinates
because Photon was throttling, which is the fallback working), map framed on Tampa
with four numbered stops, legend `Route · Visit in this day · Starting & ending point`
with no `Your location`, footer `1 route · 4 visits scheduled`, no block message, and
`Apply → Thu 13 Aug` enabled.

26 route-maths tests green, `eslint --ext .jsx,.js` clean, `vite build` passing.

**The lesson, and it is the ninth pass's lesson again from the other side.** §"Eighth
pass" recorded *when several things on a screen are all blank at once, look for the
single input they all descend from*. This was the same shape with the failures dressed
as design problems: a zoomed-out map, a wrong remedy, a duplicated list and a row of
zeros were four symptoms of one coordinate. **Do not balance a screen that is
reporting a failure — find out what failed.** The layout work that remained after
fixing the origin was real but small.

### Sixteenth pass — the bottom of the drawer, measured

Reported as a crop of the meter and the footer with "bottom UI needs adjustments".
Every item below came out of measuring the DOM rather than reading the picture, and
the numbers are kept because they are the argument.

**1. One route card had three left edges.** Measured inside a single open card: the
meter's rows ran **744 → 1366**, the fields above them **756 → 1354**, and the stop
track **768 → 1342**. The meter had no inset at all, so its bar ran border to border;
the stop list carried the *drawer's* 24px inset, a leftover from when that list sat in
the drawer body rather than inside a card.

`CARD_INSET` is now the one number for everything inside a route card — 12, matching
the card header's own `10px 12px` — and the header, the spill ribbon, the fields, the
stop list and the meter all read it. `StopList` renders `routeStops` rather than
`stopList` for this reason; `SelectionList` keeps `stopList`, because it genuinely does
sit in the drawer body. Verified: fields, track, meter top line, bar and legend all at
one left and one right edge.

**2. `4h 18m left` ended flush against the card border.** 1366 against an edge at 1367,
which reads as clipped text rather than as a figure at its margin. It is a consequence
of (1) and it is fixed by the same change — 12px of gap now.

**3. The footer's buttons sat 8px right of every card above them.** Card right edge
**2047**, Apply's right edge **2055**. The drawer body scrolls and the footer does not,
so the body loses 8px to its scrollbar and the footer keeps them. Stated as a rule
because it will happen again: **fixed chrome beside a scrolling region does not share
that region's usable width, and the two only line up if one of them says so.** The
footer's right padding is `24 + SCROLLBAR_W`, the constant reading off `global.scss`'s
`::-webkit-scrollbar { width: 8px }`, and the scroll container gets
`scrollbar-gutter: stable` so the correction is right whether or not the content
happens to be overflowing.

**4. The bar could not show one of its own numbers.** `meterTravel` used
`surfaceBrandSubtle`, which resolves to `#E8F7ED` on this tenant, against a trough of
`surfaceGreyLight` `#f6f6f6`. Two near-whites: the driving segment could not be told
from the empty remainder, and its legend swatch looked like a blank square. Driving is
`surfaceBrand` at 40% now — derived rather than picked, so it stays a shade of whatever
brand the tenant has — and the trough moved to `borderSubtle1` (`#E6E6E7`), because at
a 1% step from the card the bar had no visible extent and appeared to simply stop where
the fill ended. Three legible steps: `rgb(45,165,81)`, the same at 0.4, `#E6E6E7`.

The wash and the strong tone are separate tenant tokens and can be recoloured
independently, which is exactly how these two drifted into being the same value.
Deriving one from the other is what stops it recurring.

**5. The 340px cap sliced a row in half.** The spec's height and its
`overflow-y: scroll` are both right, but a four-stop route is `4 × 68` plus two anchors
and their connectors, so it always clears 340 — and the boundary cut a pill
horizontally, directly above the meter, where it reads as a rendering fault rather than
as "there is more below". A 14px `mask-image` fade on the scroll box says the same
thing as an edge. Paint-only, and on the box rather than the content so it stays put
while the rows move under it.

#### Verified

Deltas after the change, measured live: card-right to Apply-right **0**, meter-left to
track-left **0**, meter-right to track-right **0**, `4h 18m left` to card edge **12**.
Computed styles confirm the mask is applied and the three bar tones are distinct.

26 route-maths tests green, `eslint --ext .jsx,.js` clean, `vite build` passing.

---

### Seventeenth pass — the rule the drawer was never reading

Sixteen passes of this drawer solved a geometry problem: *how much of this week fits in
eight hours*. That is a real problem and it is not what harmonizing is. A filter
replacement is **due** on a date the contract fixed, it may be pulled forward or pushed
back only so far, the franchise works particular weekdays, and the van travels a set
distance from wherever the planner is standing. Three rules decide who is in the run
before the solver is entitled to an opinion, and until this pass the drawer read none of
them — `harmonization-settings.md` §10 item 5 recorded exactly that: *"Nothing reads
these settings yet."*

Now it does. The engine is `harmonizeRule.js`, and it is pure and dateless so the whole
triage can be recomputed inside a `useMemo` while a planner drags a number.

#### What the run is now

```
                     14 visits in the plan window
   need by window  ──────────► 10 can be done on Mon 17 Aug within ± 3 days
   radius          ──────────►  7 of those within 10 km of the start
   eight hours     ──────────►  6 fit, out and back, from Club Drive and home
```

Each step is the input to the next, and each is a number the plan actually used. The
counts coming *down* through that funnel is the most interesting thing the drawer says,
which is why the reveal now narrates six lines rather than four, and why `LINE_MS` came
down from 620 to 440 to hold the whole composition at about two and a half seconds.

| Decision | Value | Owner |
| --- | --- | --- |
| The route day | first route day in the window, else the day holding most work | Settings → Harmonization, overridable per run |
| Need by window | `± 3 days`, tightened per visit by contract | Settings, overridable per run |
| Radius | `10 km`, **measured from the start point** | Settings, overridable per run |
| The day's budget | `MAN_DAY_MINUTES`, travel included, out and back | constant, not a preference |

#### Two deliberate divergences from the documents

**1. The radius is measured from where the day starts, not from the depot.** §11 of
`harmonization-settings.md` keeps two origins for two questions — the van's origin
today, and the depot the territory is drawn around — and warns that they look like
duplication. The product decision is that this feature does not consider the company's
location at all. One origin: the planner's own position, which the route leaves from and
returns to, and which the radius is drawn around. It is also the only version of the
rule a **map can show**, and the ring turns out to do more explaining than any sentence
in the panel: a grey pin outside it has answered the question before anyone reads a word.

**2. A route day is assumed when Settings names none.** H1 says `routeDays: []` is the
off state and a tenant that never opens the screen must get the optimizer it has today.
That still holds everywhere else, but a prototype whose entire subject is *harmonize onto
your route day* cannot demonstrate itself from an unset rule, so the resolver fills in
Monday at 10 km and reports `fromSettings: false`. The drawer says which it is, in the
field's own hint: *"Assuming Monday. Set your route days in Settings."* Revisit before
this ships to a tenant.

#### What moved on the screen

**The day is a control now, and it is the first one.** "Harmonize onto" is route one's
own date, hoisted out of the card. The run collapses work onto one day; that is the
whole feature and it does not belong inside a card that is shut most of the time. Route
one therefore renders **no** date field — `showDayField` — and spill routes keep theirs,
because which day absorbs an overflow is a decision about that route alone. One value,
one control.

**The two knobs are a region with a read-out.** `RuleStrip` carries the need-by window
and the radius, and under them the count they produce: *"7 of 14 visits qualify · 7 left
out"*, with **one dot per visit**, filled when the rule takes it. Dots rather than a bar,
because a bar is a continuous quantity and would read as a second capacity meter — the
one thing on this screen it must not be confused with. A number field with no read-out is
a knob attached to nothing, and this is a knob a planner will turn.

**The panel is a triage, and it moved below the plan.** There are three ways to be left
out and they have three different remedies: a need-by window that does not reach the
date, a site outside the radius, and eight hours that ran out. A flat list of names
flattens those into one apparent problem and sends the planner to widen a radius that
would not move a single contract-bound visit. So each cause is its own group, and each
group carries **the one action that would take it, with the number computed**: *Allow ±
8 days*, *Extend to 17 km*. Pressing one sets the field two hundred pixels above and the
plan re-solves.

It sits under the routes now rather than over them. At two lines it belonged above the
map; at three groups with their names it is 400px, and 400px above the map pushed the
route — the thing the planner opened the drawer for — off the first screen. Nothing is
lost by the move: its headline is already stated twice above it, by the rule strip before
the plan and by the footer's warn figure beside Apply.

**Where a remedy does not exist, the group says so.** A contract window tighter than the
franchise's own setting is not the planner's to overrule, and `smallestWindowToInclude`
excludes those visits from its arithmetic rather than proposing a value that would still
not reach them. The note names how many.

**Every grey pin explains itself.** All four kinds of "not in this day" share one grey
mark and differ only in what their bubble says, because it is one idea and four marks
would make it four. An **action** appears only where the planner's own hand caused it:
a stop they took out can go back. Work the eight hours refused cannot be clicked into
existence, and work the rule refused must not be — pulling a visit onto a date its
contract forbids is not a thing a click should do quietly.

| Bubble | Says | Offers |
| --- | --- | --- |
| taken out | *You took this out of the day.* | **Add to this day** |
| no room | *No room left on Mon 17 Aug.* | nothing |
| outside the radius | *12.7 km away, outside the 10 km radius.* | nothing |
| outside the window | *Due Sat 22 Aug, outside ± 3 days of this route day.* | nothing |

**The due date is on the row.** Behind a stop's chevron, first, above the arithmetic
about time: *"Due Thu 20 Aug, so 3 days early."* It is the only line there that could
stop the move. `SelectionList` carries the same fact next to the day the visit sits on
today, and suppresses it when the two dates are the same.

#### Bugs this pass found, three of them latent for several passes

**1. `Number(null)` is `0`, and reading it as absence broke the whole screen.**
`windowDaysOf` asked `Number.isFinite(Number(visit.needByWindowDays))` to mean "does
this visit state a contract window", and for every visit that did **not**, `Number(null)`
answered with a perfectly finite `0`. So every visit was read as having a **zero-day**
window: only work due exactly on the route day qualified, the panel reported eleven of
fourteen as contract-bound, and the remedy attached to that was wrong too — while every
individual number on screen looked plausible. It is the shape of fault a screen cannot
show you. Absence has to be tested for absence.

**2. The map offered an action nothing was listening to.** Both renderers have drawn a
grey pin for work outside the day since the eighth pass, with *Add to this day* on it.
`onBringBack` was never passed from the drawer. The one action the map offered did
nothing at all — the exact fault the footer's `applyBlock` exists to prevent, sitting
unnoticed on the larger of the two surfaces. `bringBack` exists now.

**3. The meter never shimmered.** `RouteCard` passed `pending` to `DayMeter`, whose prop
is `pendingTravel`, so the travel segment's loading state — the one §4 names as *the*
loading indicator — had never once rendered. An unknown prop is not an error, which is
how a mismatch survives a rebuild.

**And 66 keys of copy did not exist.** `obx.runsheet.harmonize` held 93 keys against the
112 the drawer reads, and the missing ones were the newest: `titleOptimize`, `lineRead`,
`routeCardTitle`, every `footer*`, every `block*`, every `spill*`, every `time*`. i18next
returns the key path when it cannot resolve one, so the drawer had been rendering
`obx.runsheet.harmonize.titleOptimize` as its own title. Every pass from the twelfth on
was verified against a screen whose copy was partly key paths. **Add the key when you
add the `tt()` call**, and if a harness is the only way to see the screen, read the
harness output rather than trusting that a string resolved.

#### The narration has to survive its own funnel

The working record read: *"…7 of those within 10 km of the start · 18h on site, from 54
filters at 20 minutes each · Sequenced 6 stops"*. The 18h was the service time for all
**fourteen** visits, quoted after three lines of narrowing. Every number was true and the
passage was not. The estimate is measured over the visits that qualify now, which is the
set the next line sequences.

#### Verified

Live, in a temporary harness with the real theme, the real `obx.json` and the real
`global.scss` — the app is behind a login this session could not authenticate through, so
the same approach `harmonization-settings.md` §13 records was used, with the store
stubbed for `useTenantLabel` **and** `useDateTime` (without the second, the shared date
pickers fall back to `YYYY-MM-DD` and the harness shows a raw ISO date where the product
shows the tenant's format). Harness deleted.

- **The funnel, from the running screen:** 14 read at 14 sites → 10 inside `± 3 days` of
  Mon 17 Aug → 7 inside 10 km → 6 sequenced and fitted inside 8h. Footer `1 route · 6
  visits scheduled · 8 not included`, and 6 + 8 = 14.
- **Both remedies applied.** *Allow ± 8 days* moved the field 3 → 8 and the dots 7 → 8;
  the visits it released that were also outside the radius moved into the radius group,
  which then offered *Extend to 17 km*. The triage chains rather than dead-ends.
- **All eight grey pins**, each with its own reason, and the button on exactly one of
  them — the stop that had been moved out by hand. Bringing it back re-solved.
- **`± 1 day`, not `± 1 days`.** i18next pluralizes on `count`, and every sentence about
  the window already spends `count` on a visit total, so the day count is pluralized
  alone and interpolated as a phrase.
- **The map earned 48px.** The ring plus the route at 240px chose a zoom two steps out
  from what the width allowed and drew the plan as a knot of overlapping pins; the fit is
  decided by the shorter axis. 288px buys back a zoom level.
- **The card's one field spans the row** now that the first route has no date picker —
  `routeCardFields` is a two-column grid and one child in it wraps at half width.

`eslint --ext .jsx,.js` clean, `vite build` passing, no console errors beyond the known
`DateRangePicker` `minDate` propTypes warning (its propTypes are wrong, not the adapter).

**Not verified by tests, and it should have been.** `npm test` cannot start: `jest.config.js`
names a `testEnvironment` that does not exist, and forcing `jsdom` then fails in
`setupTests.js` on a top-level `await` in the tenant-config tree. The need-by arithmetic
is exactly the kind of pure function that should be pinned by a table rather than by a
screenshot. Recorded in `harmonization-settings.md` §10.

---

### Eighteenth pass — the route cards, and five controls that were not connected

Scoped to everything below the map: the `N ROUTES` header, the route cards, their
capacity gauges, the spill ribbon, the merge dropdown, the runsheet-name field, the stop
list and the meter. This is the payoff region — sixteen passes of funnel, rule and
narration exist to produce it — and it was the region carrying the most dead wiring.

#### The bugs, and four of them had been shipping for several passes

**1. Two numbers for one day, differing by however much roads differ from straight
lines.** The collapsed card read `usedMinutes` off `plan.dayTotalMinutes`, which is
haversine throughout, while the meter one element below composed its total from
`existingLoadMinutes + serviceMinutes + travelMinutes` — and on the expanded route that
last term is the *Directions* figure. So a card said `7h 12m of 8h` above a meter saying
`7h 26m of 8h` about the same eight hours. `RouteCard` now derives the header figure from
the same three parts the meter adds up, so whichever travel number the card is handed is
the one both surfaces spend.

**2. The meter's over-budget segment was drawing minutes it had already drawn.** The
scale stretches past the man-day when a day overruns — correct, decision 22 — and the bar
then added a fourth amber flex child sized `overflow / scale` *on top of* a travel
segment that already contained those minutes. The children summed to 120% of a track with
`overflow: hidden`, so flex silently shrank all four: a 9h 12m day rendered its 1h 12m
excess as 16.7% of a bar where it is 20% of the scale, and every other segment
under-reported to pay for it. No clipping, no warning, four individually plausible
figures. It is the first bug's shape again — *the screen cannot show you an error that
every part of it agrees on.* The excess is `meterOverBand` now, a wash and a hairline laid
over the segments from the eight-hour mark to the end, which is both arithmetically right
and a better statement: the work keeps the colours that say what is taking the room, and
the band says which part of it is past the day. `flexShrink: 0` on the segments so the sum
can never quietly absorb a mistake like that again.

**3. `StopList`'s `summary` prop had never been passed by anything.** It has existed since
the list was rebuilt and no caller ever supplied it, so `{summary && …}` was unreachable
code — and what it is *for* is decision 17, the one this document calls out as trust-
critical: *"silently rewriting someone else's route destroys trust"*. The disclosure
existed only in the footer, six hundred pixels below the sequence it describes.
`plan.reorderedExistingCount` now renders in the stop list's own header, in the spill
amber, on both the solver and the manual branch.

**4. `estimated` was hard-coded `true` on the meter.** §4 says the pill appears when
Directions is *unreachable*. It was nailed on, so a route whose numbers had come back
measured still called them an estimate — and a qualifier that is always present qualifies
nothing. It is a prop now: false on the expanded route once `directions.state === 'ready'`,
true everywhere else, which is honest because only the expanded route is ever sent to
Directions at all.

**5. The pending stop's placeholder was the wrong size and the wrong shape.**
`stopPinPending` was `INDEX_SIZE × 30` — the geometry of the *old* row's 24px index disc —
against a pin that is 20 × 20, so every pill on a skeleton row started 4px right of where
it would land and the list stepped sideways once per stop during the reveal, which is the
one thing the placeholder exists to prevent. It was also rendered as
`classNames(stopPinPending, skeletonBar)`, and in a JSS sheet the later-*declared* rule
wins whatever order the class names are written in — `skeletonBar` sits below it in the
file, so its `height: 10` and `borderRadius: 5` overrode both and the teardrop its comment
describes has never once rendered. Stated as a rule because it will happen again:
**composing two JSS classes that both set geometry is not a cascade you control.** The
placeholder owns its geometry and its shimmer.

**6. Native drag had no feedback of any kind.** The gesture was: press a 20px grip, watch
a 20px grip follow the cursor, release, find out afterwards. `stopRowDragging` and
`stopRowOver` were written for the pre-rebuild row and orphaned by the rebuild — the
styles were there and nothing wired them. There is a fade on the row being moved and a
2px brand rule on the row the drop lands above, cleared on `dragend`, on `drop`, and on a
`dragleave` whose `relatedTarget` is genuinely outside the unit (it bubbles from every
child, so without that check the rule flickers once per internal boundary).

**7. The keyboard reorder path moved rows and said nothing.** Arrow keys on the grip work
and always have; a planner not watching the screen got silence, which means it was a
shortcut for looking rather than a keyboard path. There is a clipped `role="status"` live
region now — `{{site}} moved to stop {{position}} of {{total}}` — and `nudge` gained the
bounds check it was relying on `moveTo` to make for it.

**8. `windowWarning` carried a sentence in an amber this file says cannot carry one.** The
top of `harmonizeDrawer.styles.js` records that `textWarning` (`#f19f02`) *"fails contrast
as body copy on any light ground"*, and the access-window caveat in a stop's detail was
rendering in exactly that. It uses `SPILL_INK` now, via a new `stopDetailWarn` — the class
itself is left alone for the drawer-body list that also uses it.

**Two typed glyphs replaced with paths.** The fourteenth pass replaced a `⠿` with a drawn
handle and gave the reason: a character renders at whatever size, weight and baseline the
body font decides. That argument was never applied to the four `⌄` disclosure chevrons or
to the spill ribbon's `⚠`, and the second one matters more than tidiness — U+26A0 has an
emoji presentation and Chrome resolves it to the colour glyph often enough that an amber
hairline ribbon can acquire a full-colour triangle. `components/Glyphs.jsx` holds both, in
`currentColor`, so hover and `SPILL_INK` still reach them.

**No i18n keys were missing this time.** Every `tt()` in the region resolved against
`obx.runsheet.harmonize` before the pass started — the seventeenth pass's 66-key repair
held. Nine keys were added with the calls that read them, and `dragHint` lost the `⠿` from
its copy, which had outlived the glyph by four passes.

#### The design, and what the redesign is arguing

**The collapsed header was four facts in an 11px ellipsised run.** `Route 2 · Tue 18 Aug`
above `6 visits · 7h 12m of 8h · Alex Green · Sun North`, with a 54px bar in the middle of
the row. Three things were wrong with it and they compound: the index disc and the words
beside it said the number *twice* while the day — the fact a run of routes is *about* —
arrived third; the destination was simultaneously the least legible thing in the header
and the first thing `text-overflow` ate, while being the only *consequence* a shut card
states anywhere; and at 54px the difference between a six-hour day and a seven-hour one is
four pixels, sitting at a different x on every card because the text beside it was a
different length.

So: the disc carries the number, the title carries the day with the visit count beside it,
the destination gets its own line in a legible tier — `Into Alex Green · Sun North`, or
`New runsheet · Tue 18 Aug Route` reading the name straight out of the field so the header
shows exactly what Apply will write — and the figure moves right as two tiers, `7h 12m`
over `of 8h`, or `Over by 1h 12m` in the alert colour. The bar is full-bleed to the card's
inset underneath all of it. Three stacked cards then have three bars of one length on one
axis, which is the only arrangement in which *which of these days is fullest* is answered
by looking rather than by reading. It shares the meter's scale rule — the man-day,
stretched if the day overruns — so the shut bar and the open bar cannot mean different
things, and it carries the same eight-hour mark when it has run past.

**The figure and the bar are gone when the card is open, and that is the pass's one real
argument about collapsed-versus-expanded.** A collapsed header is a summary of a body that
is not on screen; when the body *is* on screen it has no summarising left to do. The meter
is the first thing in the body now and prints the same total at 22px with the remainder and
the legend beside it, so leaving them in place put `7h 12m / of 8h` forty pixels above
`7h 12m of 8h · 48m left`, and a 5px bar directly above a 10px bar of the same value. The
fifteenth pass's rule was about one message on two surfaces 200px apart; at forty pixels it
is worse, not better. What the open header keeps is identity — which route, which day, how
many, where it lands, and the way shut.

**The body was in the wrong order, and both §3 and the code's own docstring said so.** It
was fields → sequence → meter: opening a card presented a *dropdown* first and put the
answer last, underneath a list that can be five hundred pixels tall. §3's layout has the
meter, then the merge control, then the ordered stops. `DayMeter`'s docstring is more
specific and had been wrong about its own component for six passes — *"switching the merge
target back to a new runsheet empties that segment in front of the planner, which is the
whole reason the merge control sits directly underneath"*. It did not sit underneath. It
does now, and the order reads how full is this day → where does it get written → what is in
it, with each block earning the one below it and hairlines between them rather than nested
cards.

**The 340px cap and its mask are deleted, and the reordering is why.** Both were right for
the layout that had them: the meter sat under the list, so a six-stop route pushed the
answer off the fold and the list had to be contained to protect it; the sixteenth pass then
added a `mask-image` because the cap landed mid-row and a horizontally sliced pill reads as
a rendering fault. Both were fixes for a consequence of the ordering, and the ordering has
changed. With the list last in the card there is nothing below it to protect, and what the
cap costs is worse than what it bought: a scroll region nested inside the drawer's own
scroll region, where the wheel stops at a boundary the planner cannot see, a
drag-to-reorder has to auto-scroll a 340px window to reach stop nine, and the mask fades
the very row being dragged. Only one card is expanded at a time, so at most one list is
ever tall. **The answer to nested scrolling was to stop needing it, not to soften its
edge.**

**A stop row says its two facts in two places instead of one.** The name and the badge
first, because the badge says what *kind* of stop this is and it was last in the row behind
two durations that only make sense once you know. Then `45m on site` inline. Then the
arrival time in a right-aligned tabular column against the chevron — it was inline after
the service time, which meant that down a six-stop list the times started at six different
x positions behind six site names of six different lengths, and the one thing a planner
reads a sequence *for* could not be scanned. Nothing moved out from behind the chevron: the
need-by line, the filter arithmetic, the drive leg and *Move out of this day* stay where the
thirteenth pass put them.

**`New` is back on the badge, and only on a merge.** The badge was removed from planned
rows on the reasoning that every stop in the list was added by this plan, so a badge saying
so distinguished nothing. That premise is false the moment the route merges into an existing
runsheet: the solver interleaves our work with stops that already belonged to somebody's
day, and the two were rendered identically — same blue pin, same pill, nothing. Decision 17
again, from the other side: a *count* of re-ordered stops in the footer is not the same as
being able to see which three of eight rows are ours. `showNewBadge` is false on a fresh
route, so the original objection still holds everywhere it applied.

**The spill ribbon lost a sentence.** It said what did not fit and then, on a second line,
what was created or joined — which is now the header's destination line one element above,
in a legible tier and stated for every route rather than only the spilled ones. Three lines
of amber on a shut card made the exception louder than the route it is a footnote to, which
is the seventh pass's correction arriving for the third time. What is left is the fact and
the way out, side by side on one line.

**`Stops, in order`, not `Route`.** A section label inside a card whose header is a route,
in a drawer whose tenant term for a runsheet may itself be "Route", labels nothing. What is
useful is that the rows are a sequence.

**The region header says what the map is showing.** One map draws whichever card is open —
right, and stated nowhere: with two routes, opening the second silently redraws the panel
300px above and the planner is left to infer the connection from having clicked. `Map shows
route 2`, keyed to the card's own index disc, and only above one route.

**Motion is slower, deliberately, because this is being presented.** Card entrance 280 →
440ms and the stagger 90 → 140, since a stagger not perceived as a sequence is just three
cards appearing at once; the card's `Collapse` 220 → 300; the stop row's entrance 240 →
300, still shorter than a reveal tick so a row settles before the next starts; the spill
ribbon 300 → 420; both chevrons 200 → 260. And the collapsed gauge stopped transitioning
`width`, which is a layout property this file's own meter comment forbids two hundred lines
above the rule that was doing it — `scaleX` from a left origin, 380ms.

#### What this pass did not do

- **`components/SpillPlan.jsx`, `OverflowBucket.jsx`, `RouteOptions.jsx` and
  `VisitTimeChip.jsx` are dead** — nothing imports any of them, and `VisitTimeChip` only
  from the dead `SpillPlan`. `SpillPlan` is also the only reader of the five
  `obx.runsheet.harmonize` keys still missing from the JSON (`spillTitle`, `spillDayLabel`,
  `spillTargetLabel`, `spillFooter`, `spillOverBudget`), which is the tidiest possible proof
  that it does not render. Left in place, not deleted, and not worked on.
- **Five style keys are now dead**: `stopRowLocked`, `stopRowDragging`, `stopRowOver`,
  `stopRowPending`, `stopBodyPending`, all leftovers from the pre-rebuild row, plus the
  i18n keys `routeCardTitle`, `routeCardMeta`, `spillRibbonCreated` and `spillRibbonMerged`
  that this pass stopped reading. Left rather than swept, because a delete pass across a
  2,300-line stylesheet shared with three other agents this week is a merge conflict for no
  behavioural gain.
- **`applyManualOrder` preserves `reorderedExistingCount` from the solver's plan**, so a
  hand-reordered merge reports the solver's count rather than a recomputed one. It
  under-reports. `harmonizePlan.js` was out of scope for this pass; the manual pill and
  `Re-optimize` are what dominate that header row anyway.
- **The first route still has no date field**, `showDayField={route.index > 0}`, and the
  lone merge control still spans the two-column grid with `fieldWide`. Untouched, and the
  seventeenth pass's reasoning stands: the day the run lands on is a run decision and lives
  at the top of the drawer.

#### Verified

`npx eslint --ext .js,.jsx` clean on `RouteCard.jsx`, `StopList.jsx`, `DayMeter.jsx`,
`Glyphs.jsx`, `harmonizeDrawer.styles.js` and `index.jsx`; `npx vite build` passing in
~15s; `obx.json` parses and every `tt()` in the region resolves against it. Not verified on
screen — the shared browser tab was being driven by another session this pass, and `npm
test` still cannot start for the reasons the seventeenth pass recorded.

---

### Nineteenth pass — the question, in fewer words, and a map that shows the working

Four corrections from the built screen, all of them the user's, and one of them changes
what the middle of the drawer is for.

#### The controls read broad to specific now, and the label lost its preposition

**Plan window on the left, route day on the right.** The day led this row for one pass on
the argument that it is what the run *is*. Reading it back, the order fought the sentence:
the window is the wider fact and the day is a date chosen out of it, so the eye was asked
to narrow and then widen again. It is also the order the reveal narrates them in.

**"Route day", not "Harmonize onto".** The old label ended in a preposition and left the
field completing a sentence nobody had finished — and *harmonize* is our word for the
feature, not the planner's word for a date. *Route day* is the term the product already
uses for this exact idea: Settings names the weekdays a franchise runs filter work on, and
this is one of them, as a date. One word for one thing, and it sits symmetrically beside
*Plan window* instead of reading like an instruction.

#### Nine text elements became two, and the box went with them

`What goes in` was a bordered panel with a header, a provenance line, two labelled fields
and two helper lines. Two numbers, nine text elements. Three faults, worth separating:

1. **The border made a setting look like a result.** It sat a few pixels from the map card
   and the route card, which *are* results. A hairline and the drawer's own inset is how
   this app separates a group of controls everywhere else.
2. **The helper lines explained mechanism where a consequence belonged.** *"How far a
   visit may move to reach Mon 17 Aug"* is first-run knowledge; the planner turning that
   knob wants to know what it costs them, which is the count.
3. **Text fields are invisible to an audience.** This drawer is being demonstrated, and a
   typed value cannot be seen from the back of a room.

So: **steppers**. `−` and `+` are a gesture, the dots and the plan move under them, and a
whole class of half-typed states disappears with the free number field. A day at a time
for the need-by window, because a day is the unit a contract is written in; five
kilometres for the radius, because nobody deliberates over 10 versus 11 and stepping to 25
one kilometre at a time is fifteen presses. Remedies still set exact values, so *Extend to
17 km* still lands on 17.

The outcome moved up level with the label, where the eye already is. And every explanation
moved into a **tip** on the label — `FieldLabel`, a real focusable button, on four labels
now. The rule is stated once and it is worth keeping: **the label says what it is, the tip
says how it works, and what stays visible under a field is only ever a fact about this
run.** Two short hints survive that test (*"Assuming Monday."*, *"2 route days in here."*);
six lines of prose did not.

#### The reveal is paced for a room

`LINE_MS` has now been tuned twice in opposite directions, and the second time is the one
to keep: 620ms for four lines, then 440ms when the rule made it six, on a budget of "the
whole composition in about two and a half seconds". That is the right instinct for a
planner who runs this twenty times a day and the wrong one for a screen being *presented*.
Six lines in 2.6 seconds is a flicker — line three is up before line one has been read,
and nobody can talk over it.

900ms, which is about the pace of a spoken sentence, and deliberately not derived from a
total budget any more: the total is not what is being optimised, the legibility of each
line is. The draw slowed with it (`MIN_DRAW_MS` 380 → 900, cap 900 → 2200, per stop 60 →
130) and its easing gentled, because at this duration a sharp ease-out spends most of its
time nearly stopped and reads as the line stalling rather than arriving. **One constant is
the dial for all of it.**

Ready is now `max(draw finishing, every line having had its full beat)`. Without that the
line stating the conclusion was the one line nobody could finish reading.

#### The map is the working-out, and that reverses a six-pass rule

The rule was: nothing but the status line while the optimizer composes, because the solve
is synchronous and showing any part of the answer would make the line above it a lie. It
was right while the only thing a map could show was the finished route.

What is on the map now is not the answer, it is the **elimination**. The narration is a
funnel and the map follows it, step by step, on the same numbers:

| Line | What the map does |
| --- | --- |
| Reading 14 visits at 14 sites | every visit, as an unnumbered candidate |
| 10 can be done on Mon 17 Aug within ± 3 days | the four the window refuses fade to grey |
| 7 of those are within 10 km of the start | the ring settles out from the start point; three more fade |
| 7h on site, 21 filters at 20 minutes each | holds |
| Sequencing 6 stops, out and back | each pin is claimed and numbered as the line reaches it; the one with no room greys |
| It all fits inside 8h on Mon 17 Aug | done |

`MAP_STEP` holds the indices, so the ring appears on the line that names the radius
because both read the same number. The claim and the picture are the same claim, so there
is nothing left to be a lie about — and it is the answer to *"the system creates routes
and there is no indication of it"*: the indication is now the whole middle of the drawer.

Three things had to be true for it to read as elimination rather than as a series of
different pictures:

- **The set of places never changes.** `mapStillIn` and `mapRuledOut` always union to every
  visit in play, so the viewport is fitted once and never re-fits. A pin goes grey *where
  it stands*.
- **Both states are one element.** The in-route pins and the out-of-route pins were two
  arrays rendered in two places, so a visit dropping out unmounted one node and mounted
  another — instantaneous and unanimatable. One keyed list of `marks` means a visit keeps
  its node whatever happens to it, and `fill`, `r` and `stroke-width` are CSS transitions
  on a stable element.
- **A claim, not an arrival.** The stop-landing animation used to run from `opacity: 0,
  scale(0.4)`, which was right when every pin was new. These pins already exist as
  candidates, so animating from nothing made an existing pin blink out and return, reading
  as a *different* place. It swells and settles instead, 1 → 1.28 → 1, and the number
  fades up inside it.

Two smaller corrections came out of building it. **Unnumbered pins are no longer named
unconditionally** — that was sound for four or five, and the reveal opens on fourteen,
which is a screen of overlapping halo'd labels with a map somewhere underneath; past six
the names come on hover, which is the rule a solved route already followed. And
**`scrollComposing` is retired**: it pinned the body to `overflow: hidden` for the
composing span, which now crops the map's legend and refuses to let anyone scroll to it.

**The map is not editable while it is being explained.** A bubble opening mid-reveal would
offer an action against a plan the drawer has not finished stating.

#### Verified

Sampled in the running harness rather than eyeballed, because the whole point is a
sequence: replayed on demand and traced every 700ms.

```
1.1s  ticks 6 | ring 0 | grey 0 | numbered 0 | Reading 14 visits at 14 sites…
2.2s  ticks 6 | ring 0 | grey 4 | numbered 0 | 10 can be done on Mon 17 Aug within ± 3 days…
3.2s  ticks 6 | ring 1 | grey 7 | numbered 0 | 7 of those are within 10 km of the start…
4.2s  ticks 6 | ring 1 | grey 7 | numbered 0 | 7h on site: 21 filters at 20 minutes each…
5.2s  ticks 6 | ring 1 | grey 8 | numbered 6 | Sequencing 6 stops, out and back…
6.2s  ticks 6 | ring 1 | grey 8 | numbered 6 | It all fits inside 8h on Mon 17 Aug.
7.2s  ticks 0 | ring 1 | grey 8 | numbered 6 | (stage gone, plan on screen)
```

The `grey 7` at the radius line is a fix this trace produced: the visit with **no room** was
greying out alongside the radius refusals, which said the day was full before anything had
been packed into it. It is not refused by the rule at all, so it cannot go out until the
route has been sequenced.

Also checked: all four tips open on hover and on focus and carry their text as an
accessible label; the stepper buttons read *"Allow one day more either side"* rather than
the composed *"+1 days"* they started as; the map legend stays inside the body during the
reveal; `eslint` clean.

**Known and deliberate:** the Google renderer gets the staging (it reads the same phased
props) but not the transitions — no key is set in this environment, so the keyless tile
renderer is the one being presented and is the one that was made smooth. The tile
renderer's route line is also drawn **straight between stops** rather than along roads,
since road geometry needs a Directions call. If "the map does not align with the system"
meant *that*, it is a separate piece of work and a keyed build already has it.

#### Addendum — the fields are the system's fields now

The user supplied the `Frame 1000007439` spec the rest of the product's fields are built
from: a 14px/500/20px label in `Text/secondary-03`, a 6px gap, and a 44px input with
`10px 14px` padding, an `8px` radius, a `1px solid #D0CFD2` outline and `16px/24px`
`Text/primary` value. 70px for the group.

**Almost all of it was already in the theme.** `muiTextField.js` sets the padding, the
44px cap, the radius, the outline colour and the 16px/24px value. What had happened is
that this drawer *opted out* of the last of those in two places — `datePicker` and
`addressSearch` each forced `fontSize: 14` on the input — so the harmonize fields rendered
a size smaller than the identical fields on every other screen, and the label was 12px on
`textSecondary1`: a scale of its own invention, and **darker than the value it labels**, so
the label out-shouted the answer.

| | Was | Now |
| --- | --- | --- |
| Label | 12px / 500 / 16px / `#444446` | 14px / 500 / 20px / `#86868B` |
| Label → input | 4px gap **plus** a 4px `marginBottom` | one 6px gap |
| Input value | 14px (local override) | 16px / 24px / `#262527`, from the theme |
| Hint | 11px | 12px |
| Stepper | 34px pill, `17px` radius | 44px, `8px` radius, `1px #D0CFD2` |

Two notes worth keeping. The label→input distance was **two** declarations that summed to
8px, which is how a spec drifts: neither 4 looks wrong on its own. And the steppers moved
onto the input frame rather than staying pills — a pill looked deliberate in isolation and
looked like *a different kind of thing* sitting 12px under three 44px fields. They are
still segmented, by hairlines on the inside; the outline is the system's.

Nothing local now restates a value the theme already gets right. A copy of a system value
is a value that will be wrong the day the system changes.

**Measured on the built screen**, all three fields: label `14px/500/20px/rgb(134,134,139)`,
gap `6px`, input `44px` with `10px 14px`, outline `1px rgb(208,207,210) r8px`, value
`16px/400/rgb(38,37,39)`, icon `20×20`, group **70px**. 143 tests green, `eslint` clean,
`vite build` passing.

#### Addendum — auditing "which visits go in", and the two dead ends behind it

The user selected this region on a live screen reading **`0 of 5 visits qualify · 5 left
out`** over five hollow dots, and asked for the count to go. The count was the smallest
thing wrong with that screen.

**Audit, worst first.**

| # | Finding | Fix |
| --- | --- | --- |
| 1 | **The route day defaulted to the *earliest* candidate, not a reachable one.** A week running Tue 18 → Mon 24 on a Monday franchise has exactly one route day in its window: the 24th, the **last** day. Every visit sat 3–6 days before it, so at ± 3 almost nothing could legally reach it. The rule was working perfectly and the answer was useless | `bestRouteDay` scores each candidate by how many visits qualify and keeps the best, earliest on a tie |
| 2 | **The remedies were suppressed on exactly the screen that needed them.** `triageGroups` returned `[]` without a plan, so at zero qualifying there was no *why* and no *Allow ± 6 days* anywhere — the count, and nothing else | The rule's own refusals report without a plan. Only **capacity** still needs one: "no room left in the day" is a claim about a day that has been packed |
| 3 | The count itself: a scoreboard reporting a loss, in the one region whose two controls are the way to act on it, duplicating a figure the footer already carries beside Apply | Removed, with the dots. `ruleOutcome`, `ruleDots`, `ruleDot`, `ruleDotIn`, `ruleDotOut`, `ruleCount` and `ruleCountMuted` all deleted |
| 4 | The region's label was **11px uppercase** — the only label in the block on its own scale after the field spec landed — which made two controls look like a new part of the screen | The system's field label, like the three above it |
| 5 | `± 3 days` **either side of** `Mon 24 Aug` said the same thing twice: the `±` *is* "either side" | `± 3 days of Mon 24 Aug` |
| 6 | `from the start` is a pronoun for a field the planner can see | `from North 19th Street` — first line of the address, which is the part they can check |
| 7 | **Two tooltips.** `describeChild` makes MUI clone `title` onto the child, so the browser's native tooltip also fires, a second later, in a different place, saying the same words | Dropped; `aria-label` was already carrying the text |
| 8 | The tip had absorbed two helper lines and a provenance line verbatim — seven lines on hover | Three short sentences |

The through-line in 1, 2 and 3 is the same mistake in three sizes: **the screen reported a
state and withheld the means to change it.** Removing the number was right, and it would
have left a drawer that quietly showed nothing.

**Verified** on the reported data shape (five visits early in the week, one Monday at the
end): it now opens on a route rather than on nothing, and the triage names all four
exclusions with `Allow ± 6 days` and `Extend to 15 km`. Forced to a genuine zero with the
steppers (± 0 days, 5 km), the panel names all five with how far out each one is, offers
`Allow ± 6 days`, and the footer states the blocker beside a disabled Apply — where that
same state previously showed the count and nothing else. Measured: rule label
`14px/500/20px/rgb(134,134,139)`, tip `16×16` with no native `title`. 143 tests green,
`eslint` clean, `vite build` passing.

### Twentieth pass — the screen has a question half and an answer half

Seven changes, and one idea underneath them: **the workspace used to open on an answer, and
it now opens on a question.** Everything else in this pass follows from that, including the
things that look purely cosmetic.

The old flow was defended at length in `index.jsx` — *open on an answer, not on a form; the
optimizer has solved before the screen paints; what the first two seconds do is show its
working*. That was a real argument and it is worth saying what was wrong with it rather than
just replacing it. The plan it opened on was built from whatever Settings happened to hold:
the planner had not chosen their days, their window or their crew, and the screen was already
showing them a route with arrival times on it. It read as confident and it was a guess. Worse,
it made the controls on the left look like filters over a finished result — adjustments to
something that already existed — when they are the inputs that produce it.

So: **the left column asks, the right region answers, and the press between them is the
seam.**

| # | What changed | Why |
|---|---|---|
| 1 | The solve waits for a **Harmonize** press at the foot of the setup column. `hasRun` joins the three conditions in `useHarmonizeRun`'s `run` memo that already meant "no plan" | Nothing downstream needed a new null check — every consumer of `routes` has always had to survive an empty array |
| 2 | The routes column and the map column are **one region**, one heading, no rule between them | They are one answer expressed twice — a list of stops with times, and a line on the ground. The seam claimed they were two subjects, and the working glow pulsed in the left one while the map sat inert beside it |
| 3 | Before the press the region is **empty** — a title, a line, and where to look | The map used to draw the week as loose pins from frame one. Opposite a form nobody has filled in, the most finished-looking thing on screen makes the press look optional |
| 4 | The need-by window is **four pills** — ± 3 / ± 5 / ± 7 / ± 14 — not a −/+ stepper | A stepper says *this number is continuous*, which was true of a radius and never of this. It also hid the set: a planner looking at `± 3` in a box could not see ± 14 existed |
| 5 | The **Radius field is gone** from the setup column. Its remedy lives in the triage panel | It sat at the value Settings gave it and was the only control here whose job was to *exclude* work. A setting that matters in one case belongs where that case is reported |
| 6 | **Installers** — 1 / 2 / 3, default 2 — multiplies the day's budget | Two installers do not make two routes; they make one route with twice the hours. This is the first thing to consume `rule.shiftMinutesFor`, exposed and unread since Settings learned per-day shift hours |
| 7 | The stop disclosure is **two rows**: `Travel time:` and `Filter Installation (n):`, and they sum to the row's figure. `Keep current plan` and the triage's help sentence are gone | Eight lines answering one question. See the reconciliation note below |

**The two-row breakdown had to choose between two kinds of honesty.** The design draws travel
and filter installation and no third row for the per-site call-out — arriving, parking,
finding the units, signing in. Left out entirely, the parts came to less than the total above
them, and a breakdown that does not reconcile reads as a bug in the estimate. Given its own
row, it was a third line of arithmetic in a panel whose whole job is one glance. It is folded
into the installation figure instead: `Filter Installation (5)` names the job performed at the
site, not a multiplication the reader is invited to check. **The consequence, stated because
it will look wrong to somebody counting units: the value is no longer `filterCount × 20`.**

**Three defaults moved, and two of them were policy.** `NEED_BY_MAX` was 7 and is 14, at the
user's direction — the old rationale (a fortnight either side of a contracted date "is not
slack, it is a different visit") describes ± 14 fairly but was the screen deciding a
commercial question; the visit's own contract window still wins wherever it is tighter.
`NEED_BY_DEFAULT` was 3 and is 7, which is arithmetic rather than taste: a week is seven days
wide, one install day sits up to four days from an end of it, and the due-date drift stacks on
top of that, so ± 3 cannot reach a full week from any single route day. `RADIUS_DEFAULT_MILES`
was 10, which sat exactly on the demo book's own furthest site, so the opening state excluded a
visit by a rounding error and offered `Extend to 11 mi` to fix it.

**The demo data was flipped from hostile to happy, reversing a deliberate choice.** The
due-date drift reached ± 4 and roughly one site in six was given a contract window tighter
than any setting, both "chosen to exercise the rule rather than to flatter it". That was right
while the screen opened on a solved plan and the triage was part of the first impression. It is
wrong now: the press is the whole demonstration, and an answer that leaves a third of the week
out at untouched settings reads as the optimizer failing. A synthetic tight contract was the
worse half — unreachable by construction, so no pill, radius or crew size could ever clear the
panel. Drift is capped at one day and the invented contract window is gone; real payloads still
carry `needByWindowDays` and the rule still honours it.

#### Three bugs found by building it

1. **The plan appeared and then vanished on its own.** `useHarmonizeRun`'s reset effect keyed
   on the `visits` array, which `harmonizableVisits` rebuilds on any parent re-render — and
   this workspace *causes* those, because reporting a plan through `onPreviewChange` sets state
   on the calendar. Press, solve, report, parent re-renders, effect resets the run it just
   produced. **It was live before this pass and worse for being silent:** every override in
   that effect — pinned days, route names, hand-ordered stops — was being discarded on any
   parent re-render, so a planner's edits could evaporate mid-session with nothing to blame.
   Keyed on the visit ids now.
2. **`columnBody`'s `flex: 1` silently beat `routesPane`'s `flex: 0 1 40%`.** Same specificity,
   later in the sheet wins, both composed onto one element — so the pane rendered at 51% of the
   region instead of 40% and the map lost 130px it was never asked to give up. Split onto two
   boxes: the outer owns the width, the inner owns the padding and the scroll. Reordering the
   sheet would also have fixed it and left a layout that depends on declaration order, which is
   the trap §7.34 records paying for twice.
3. **Five style keys were deleted with the two they sat between.** `columnHeader`,
   `columnIcon`, `columnTitle`, `columnNote` and `columnBody` lived inside the range replaced
   when `routesColumn`/`mapColumn` became `aiRegion`, so the setup column's 15×15 glyph
   rendered at its natural size — three slider bars filling the top third of the panel — and
   the body lost its padding and its scroll. Caught on the first load, which is the whole
   argument for loading the page: `vite build` passed and `eslint` was clean.

The remedy link also had to learn to snap. `needByReachDays` is the exact window that would
reach the refused visits — ± 8, say — and the pills offer four values, so the setter rounds up
to ± 14. Unsnapped, the link read *Allow ± 8 days*, set 14, and lit a segment the sentence had
never mentioned. The label is snapped as well as the value, so the offer, the press and the lit
pill are one number.

**Verified** in-browser on the Filter Go tenant, end to end. Opening: left column only, right
region reading *Nothing planned yet*, no action bar, `± 7` and `2` preselected, `16h of work in
the day`. Pressing Harmonize: narration, route draws in, **1 route · 6 visits scheduled ·
nothing left over**, `Route for Mon 24 Aug · 10 hr 46 min / 16 hr`, one `Create Route` button.
Dropping to one installer re-solves live to `7 hr 42 min / 8 hr` with one visit reported as
having no room and `Also run Thu` offered — which is the installer control doing real work,
since the six-visit round does not fit one person's day. A stop's disclosure reads `Travel
time: 4 min` and `Filter Installation (2): 50 min` against a row figure of `54 min`. Measured:
setup 381px, routes pane 457px, map 686px on a 1600px viewport — 25 / 30 / 45, unchanged from
before the merge — and no border on either pane. 218 tests green, `eslint` clean on the touched
paths, `vite build` passing.

**Still open.** The map's route-draw animation remains keyless-only: the Google renderer draws
a static polyline, so with a Maps key the stroke reveal does not play. Untouched by this pass
and not made worse by it, but the reveal's choreography now has more riding on it.

### Twenty-first pass — the question half and the answer half get their own footers

A round of corrections read off the built screen, plus one structural change that reverses a
decision made two passes earlier.

**The action bar became two.** The Harmonize press sat at the foot of the setup column and the
commit bar spanned the whole width, so pressing Harmonize made the bar slide in *and* moved the
next action from bottom-left to bottom-right. The first attempt at a fix was one permanent
full-width bar whose single slot renamed itself — *Harmonize*, then *Create Route*. That removed
the travel and introduced a worse ambiguity: the screen looked like it had one action that kept
changing its mind, and neither half of it owned the button that acted on it. The answer is a
footer per half: **Harmonize under the settings it runs, Create Route under the plan it writes.**
Measured after the change — the Harmonize button sits at the same pixel before and after the
press, and is disabled once pressed.

**Which forced the knobs to stop re-solving live, and that is the pass's real change.** A
Harmonize button that is *disabled until the configuration changes* cannot coexist with settings
that re-solve on every keystroke: the answer would already have moved before the control offering
to move it became pressable. So the press now captures the whole question — eligible visits, route
days, rule, crew budget — into a snapshot, and the solver reads only that. Turning a pill marks the
plan stale, says so in the plan's own footer, and re-enables the button. This **reverses** the
nineteenth pass's decision that edits stay live after the first press; that decision existed so
the triage panel's remedy links would move the answer, and they still do, one press later.

| # | Change | Note |
|---|---|---|
| 1 | Installers auto-selects from the officers named against the selected install days | New `officersFor` accessor through the rule. Options widen to hold a crew larger than 3 rather than clamping and disagreeing with Settings |
| 2 | The installers field is then **hidden** | The value still drives the budget; a planner does not choose their headcount from a planning screen. Kept in place, not deleted |
| 3 | `Proposed route` → `Proposed Route`; both region icons forced to 15px | The MUI icon rendered at 24px because `.MuiSvgIcon-root` sets `font-size: 1.5rem` from emotion and beat the makeStyles `width`. Scoped selector, §7.28's family |
| 4 | *When* / *Where from* / *Which visits go in* headings removed | Six fields already carry their own labels; groups now separated by 28px of space rather than a heading and a hairline |
| 5 | No map while the optimizer works — the orb takes the whole region, centred | A map that is already there cannot *arrive*, so the moment the route appears on it had no weight. Verified by probe: `map: false` for the whole composing phase, `true` from ~4.2s |
| 6 | Map gets an 8px radius and a 16px inset, equal on all four sides | Measured 16/16/16/16. It is a panel *within* the region now, not a second region |
| 7 | The `Mon` day-list above the map, the `−`/`+` on the route card, `Stops, in order`, `Drag a handle…`, and the hairline under the route's progress bar all removed | All chrome. The card's head absorbed the `+`'s keyboard path — `role="button"`, a tab stop and Enter/Space when shut — because it was the only focusable way to select a route |
| 8 | The route card no longer scrolls internally | `proposedBody`, a copy of `proposedScroll` without the 252px cap; the shared class stays capped for the triage panel, where the cap is the point. The per-stop chevrons below the old fold are now reachable, which is why they looked absent |
| 9 | A rail down the reasoning steps | One continuous border on the list rather than a pseudo-element per step, so it does not break at every 10px gap |
| 10 | The radius ring is off the map entirely | Which retired a fix made minutes earlier: the ring was drawn from the fitted zoom and therefore cropped whenever it was wider than the view, so it had been added to both renderers' bounds. With no ring, the bounds are the work again and the route gets the pane |

#### Two bugs found by loading the page

1. **`Cannot access 'weekdays' before initialization` — the page went white.** The new
   `configSignature` memo was declared beside the state it serves, above the `weekdays` and
   `range` consts it reads. A `useMemo` runs during render, so that is a temporal-dead-zone
   `ReferenceError` that lints clean, builds clean, and blanks the screen. **This file has now
   paid for §7.16 three times.** The rule that actually prevents it is the one the passes keep
   restating: declare a derived value below every input it reads, not beside the thing it feeds.
2. **Two triages, because one was wrong under the plan.** With the solve snapshotted, the
   exception panel kept reading the *live* triage — so changing a pill after a run left
   `2 visits not included` at the new setting sitting under routes solved at the old one, a
   footnote describing a plan that was not on screen. `planTriage` is the snapshot's, and feeds
   the panel, the reasoning steps and the footer's not-included figure; the coverage hints under
   the pills stay live, because those describe the question being asked rather than the answer.

**Verified** in-browser, Filter Go: open → left column only, empty region, one enabled Harmonize
at bottom-left; press → orb centred across the region with no map, then the map fades in with the
route drawn; result → `1 route · 6 visits scheduled`, nothing excluded, `10 hr 46 min / 16 hr`,
Harmonize now disabled, `Create Route · Mon 24 Aug` in its own footer on the right. Pressing `± 5`
re-enables Harmonize and prints *The set-up has changed. Press Harmonize to rebuild this plan.*
258 tests green, `eslint` clean on the touched paths, `vite build` passing.

### Twenty-second pass — eight hours is the day, and the crew halves the work

**The meter read `10 hr 46 min / 16 hr`, and the budget was the thing that was wrong.** Two
installers had been modelled as doubling the day, which is arithmetically fine for deciding what
fits and a description of a shift nobody works. The crew's effect belongs on the work: two people
at a stop halve the installation time, and the day stays the eight hours it is. Same plan, honestly
stated — `6 hr 43 min / 8 hr`.

`shareBetweenCrew` in `harmonizePlan` divides **only** `filterMinutes`. The per-site call-out —
arriving, parking, finding the plant room, signing in — is carried whole, because the second
installer does not park a second van; halving it would make a two-person round look ten minutes a
stop cheaper than it is. Committed stops from an existing runsheet are untouched: they were
scheduled by somebody else for a crew this plan knows nothing about. The crew size is snapshotted
with the rest of the question, so changing it marks the plan stale rather than silently re-timing it.

Three smaller corrections alongside it:

- **The grey stop is gone.** `windowRisk` resolved to the `idle` tone, so a visit whose access
  window this run has not checked drew in the same grey as the start and end anchors — one pin in
  the middle of a numbered blue sequence, rendered as though it were not part of it. The `Window`
  badge went with it. The risk is still on the model and `accessWindow` is still a real caveat; it
  simply no longer changes how the row is drawn, because this screen does not ask the planner to
  act on it.
- `Harmonized window` → **`Harmonize window`**; `Install days` → **`Installation Days`**, matching
  the Settings screen's own term.
- `Set up the run` → **`Run configuration`**, a noun phrase parallel to `Proposed Route` across the
  seam. The empty state went with it: *No route proposed yet* / *Configure the run on the left, then
  select Harmonize. The proposed route and its map appear here.*

**One process note worth keeping.** Mid-verification the page went blank on a missing
`./config/schedulerLayout` import — a file this pass never touched, being edited by a concurrent
session. `vite build` passed while the dev server kept serving the failure from a poisoned module
graph; restarting the server cleared it, on a new port and therefore a fresh login (§7.43). **When
the dev server reports an error `vite build` cannot reproduce, suspect the module graph before the
code** — and on this tree, suspect another session first.

**Verified** in-browser after a server restart: `Route for Mon 24 Aug · 6 hr 43 min / 8 hr`,
`1 route · 6 visits scheduled`, nothing excluded, every stop pin numbered and blue, labels and
headings as above.
