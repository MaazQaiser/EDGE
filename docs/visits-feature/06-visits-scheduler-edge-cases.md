# Visits scheduler — edge cases

Companion to [04-edge-case-brainstorm.html](04-edge-case-brainstorm.html), which covers the
*domain* edge cases of moving visits between routes. This note covers the **view** — what the
visits scheduler has to do when the data is awkward, empty, huge, or mid-flight.

Status key: **Handled** — implemented and verified in the demo · **Open** — known, not built ·
**Blocked** — needs a product answer first · **N/A** — ruled out of scope.

> **Updated 2026-08-10 (session 3).** The user answered the blocking questions. Both items
> previously marked **Blocked** are now resolved, and the density cases are re-framed — see
> [Decisions](#decisions-session-3) at the foot of this note. Read that section first if you
> are picking this up cold; several rows below only make sense in its light.

---

## 1. Volume and density

Visit cadence is **sparse**, not dense: a site may be serviced monthly, quarterly, or at
longer intervals. The pressure on the grid is empty rows, not crowded cells.

| # | Case | Status | Notes |
|---|---|---|---|
| 1.1 | A site has many visits on one day | **N/A** | Ruled out by cadence. A site is serviced on an interval measured in weeks or months; two visits to one site on one day is not a real shape. No per-cell cap needed. |
| 1.2 | Franchise has hundreds of sites | **Handled** | The cost is **empty rows**, not events. Rows are ordered chronologically and quiet sites compress to a single 40px line below a divider — 3123px of scroll down to 1966px on the 46-site demo book. A quick filter drops the quiet rows entirely on demand (47 rows → 9). See [D7](#d7--order-the-grid-chronologically-12--16), [D8](#d8--the-density-pass) and [D10](#d10--the-quick-filter). |
| 1.3 | Unassigned band holds hundreds of visits | **N/A** | Same reasoning as 1.1. The band holds one week's unrouted demand, which is small. |
| 1.4 | Zero unassigned visits this week | **Handled** | The band renders with a `0 awaiting a route` subtitle rather than vanishing — its absence would otherwise be ambiguous with "not loaded". |
| 1.5 | Zero visits at all | **Handled** | Empty state with copy that names the two ways out (change dates, clear filters). |
| 1.6 | **A site has no visit in the visible week** | **Handled** | *The dominant case.* On the demo book 38 of 46 rows are quiet in a typical week. They stay visible by default, sort by when they are next due, and — critically — **say something**: `Next visit Sep 8` rather than `0 scheduled`. One click hides them ([D10](#d10--the-quick-filter)). |
| 1.7 | **Cadence exceeds the visible horizon** | **Handled** | A quarterly site's next visit is ~13 weeks out, so no calendar range can show it. Solved without a new view: every quiet row carries its **next due date**, read off the schedule. My earlier note said this was gated on the contracted service interval — **that was wrong**. The next visit is already in the schedule; the interval is only needed to say whether a site is *overdue against contract*, which is a different question (see 1.9). |
| 1.8 | **A site with no future visit at all** | **Handled** | *New, and the one that matters.* Falls out of 1.7 for free: a row with no next-due date has dropped off the schedule entirely. Rendered as amber `Not scheduled` rather than a blank, because nothing else on this screen would ever tell you. |
| 1.9 | **Is a site overdue against its contract?** | **Blocked** | *New.* Distinct from 1.7. Answering it needs the contracted interval per site, which is still unconfirmed. Until then the grid can say when a site is next due but not whether that is late. |

## 2. Time and boundaries

| # | Case | Status | Notes |
|---|---|---|---|
| 2.1 | Visit window crosses midnight | **N/A** | Explicitly out of scope for this design. Placement uses the start date. Revisit only if overnight service windows become real. |
| 2.2 | Franchise timezone ≠ browser timezone | **Partly handled** | The grid places events with the franchise offset and "today" is highlighted from franchise time. The **Today** button's disabled state uses browser time — cosmetic only, noted in code. |
| 2.3 | DST transition inside the visible week | **Open** | `getCurrentTimeWithDisabledDlsInIso` exists for this; the visits path inherits it but it has not been exercised across a transition. |
| 2.4 | **Weekday template vs calendar date** | **Resolved** | A visit is assigned to a **runsheet**, never to a weekday. Two targets only: an existing runsheet, or a **new runsheet on a chosen day**. The UI never offers "assign to Tuesday" and never implies recurrence. See [D1](#d1--assignment-target-is-a-runsheet-24). |
| 2.5 | Week containing today vs a past week | **Handled** | A past week is **read-only except missed visits**. Built: the drawer replaces the hint with "this date has passed" and withdraws every action, and a missed visit keeps its **Reschedule** button even though its date is gone. See [D5](#d5--past-weeks-are-history-except-missed-visits-25). |
| 2.6 | **A plan targeted at a day that has already passed** | **Handled** | *New, session 5, and it was the default rather than an edge case.* Harmonize picked its target day by counting the selection and breaking ties towards the **earlier** day, with no test for whether that day had gone — so on Wed 12 Aug a selection containing a Mon 10 Aug visit defaulted the whole drawer, Apply button included, to `Apply → Mon 10 Aug`. Not rare: D5 makes **missed** the one state still actionable in a past week, so selections full of past dates are exactly what harmonize is for. Past days are now excluded from the count, the fallback is today, and the day dropdown opens no earlier than today. |

## 3. Assignment state

| # | Case | Status | Notes |
|---|---|---|---|
| 3.1 | Visit on a route, route has no technician | **Handled** | Two different absences, now shown as two different things: the visit sits in its site row (it *is* routed) and the drawer's Technician field reads Unassigned. |
| 3.2 | Visit not on any route | **Handled** | Pinned band, dashed red card, "No Runsheet", and a drawer that leads with **Add to a Runsheet**. |
| 3.3 | Visit on a route that has started | **Handled** | **Allow, and flag it.** The action stays available; the visit is marked as added after the route began, and the runsheet reads as in-progress. See [D3](#d3--adding-to-a-started-runsheet-is-allowed-but-marked-33). |
| 3.4 | Visit already completed | **Handled** | **No reassignment.** A completed visit is read-only; the drawer shows the route it ran on and offers no assignment action. See [D4](#d4--completed-visits-are-read-only-34). |
| 3.5 | Visit cancelled | **Handled** | Hatched grey card, struck-through text, grey left edge, and a `Cancelled` label. Stays on the grid so the gap in a site's service history is visible; offers nothing. |
| 3.6 | Visit missed | **Handled** | Now marked on the grid — solid red left edge, `Missed` label — as well as in its own drawer, so one visit no longer reads two ways. Load-bearing after D5: it is the only thing still actionable in a past week. |
| 3.7 | Visit with no tour template | **Resolved · single add handled, bulk not built** | A **tour** is the work template attached to a visit — the on-site checklist that produces the submitted report. No tour means no defined work. Single add already refuses (`unassignedHits/index.jsx:52`) and routes to tour assignment. For **bulk** add: add what has tours, skip what does not, and surface the skipped set as an actionable list. See [D2](#d2--bulk-add-skips-un-templated-visits-and-surfaces-them-37). |
| 3.8 | **Visit added to a runsheet after it started** | **Partly handled** | *New, from D3.* The visit card and drawer now mark it — same blue as a live route, but with a **broken** left edge, because the driver did not leave with this stop. The runsheet's own stop list does not mark it yet. **Open** for the stop list. |

## 4. Data quality

| # | Case | Status | Notes |
|---|---|---|---|
| 4.1 | Detail endpoint returns an object where a list is expected | **Handled** | This crashed the whole app via the missed-visits drawer. Now normalised, and a scoped error boundary keeps a bad payload inside the calendar. |
| 4.2 | Missing totals / distances | **Handled** | Rendered `Undefined / Undefined` and `NaN Mi`. Now zero-guarded. |
| 4.3 | Very long site or route names | **Handled** | Cards truncate the route line and never the time; month cells ellipsize instead of colliding. |
| 4.4 | Tenant term much longer than the default | **Handled** | "Filter Replacement Service" is 3× "Patrol". Cards clip cleanly; the month cell stopped printing the service name at all (see 4.11). |
| 4.11 | **A month cell naming the service in every day** | **Handled** | *New.* Cells read `1x Filter Replacement Se…` — the same service, truncated, 35 times, with the count reduced to a `1x` prefix. The visits month cell now leads with the **count at size** (`2 Visits`, correctly singular), drops the service name entirely (the tab already says which service), and shows unassigned demand as a red badge carrying its **number** rather than a bare `!`. |
| 4.12 | **A semantic colour taken from the tenant brand** | **Handled** | *New, and it had three symptoms.* `dutyBlueBg` resolves to `surfaceBrandSubtle`, so on Filter Go's green brand a live-route card rendered **green** while its own label said blue; the `In Progress` chip used MUI `primary` and did the same. Visit cards now take their colour from the state system alone — no duty class, no status background — and the in-progress chip sets blue explicitly. A third bug hid behind it: declaring `borderLeft` and then `borderColor` in the same rule silently reset the accent, so the "solid blue" left edge rendered pale blue. Longhand and ordered now. |
| 4.5 | Label cache from another tenant or an older shape | **Handled** | Labels are stamped with tenant + schema version and refetched on either mismatch. |
| 4.6 | Site with no address | **Handled** | The row is **omitted** rather than falling back to the site name — the fallback printed the site a second time, three lines under the header, which read as a data error rather than a location. |
| 4.8 | **A tenant term the payload never defines** | **Handled** | `tour` was never in either tenant's `terms`, so `Needs a {{tour}}` rendered as "Needs a" — gotcha §7.1 all over again. Both tenants now define it (Filter Go: *Service Checklist*; Signal: *Tour*) and `TENANT_LABELS_VERSION` is bumped to 3. |
| 4.9 | **A visit that changes identity between fetches** | **Handled** | *Found during the density pass.* Visit ids came from a call counter, so every fetch minted new ones — the same visit had a different id when you navigated away and back, and the registry the drawer reads grew without bound. Ids are now derived from *what the visit is* (site + date), so a visit keeps its identity, and the detail endpoint can reconstruct it from the id alone on a cold load. |
| 4.10 | **A list payload that omits a field the state depends on** | **Handled** | Reading "no tour" from a missing `tour` key would have badged every visit on the week grid as blocked, because list rows do not carry the tour object. `isBlockedWithoutTour` requires an *explicit* denial (`hasTour: false`, `requiresTourAssignment: true`, or `tour: null`) and defaults to not blocked. |
| 4.7 | **Visit with no tour** | **Handled** | Distinct from 3.7's *behaviour*: the grid used to give no warning until you tried to route it. It now carries an amber dashed card and a `Needs a <tour>` label, and the drawer leads with **Assign a <tour>** instead of an add action the backend would reject. |

## 5. Filters and navigation

| # | Case | Status | Notes |
|---|---|---|---|
| 5.1 | Filter combination yields nothing | **Handled** | Empty state names filters as a cause. |
| 5.2 | Filters silently not applied in a view | **Partly handled** | Day/month drop location and officer from the query. Tabs now stay visible so the user knows which view they are in, but the dropped filters are still silent. **Open**. |
| 5.3 | Filters lost on tab change | **Handled** | Carried across when the destination tab offers the same control. |
| 5.4 | Deep link / refresh / browser Back | **Open** | Nothing is in the URL. Tab, view, week and filters are all local state. |
| 5.5 | Status filter set from three places | **Handled** | The pill, the dropdown and the footer counts now drive one value and stay in sync. |
| 5.7 | **A day view padded with sites that have nothing on** | **Handled** | *New.* The week grid keeps quiet rows because they carry a next-due date. The **day** view listed all 46 sites with empty states — on an execution surface a quiet site says nothing the week grid did not, and 45 empty sections buried the one site actually being serviced. Day view now lists only the sites worked that day. |
| 5.8 | **A month view that invents its own numbers** | **Handled** | *New.* The month aggregate generated counts arithmetically (`(i * 2) % 5`), so it quietly contradicted the week grid. It now derives per-day counts from the same cadence, and the two reconcile — Aug 8–14 reads 1+1+1+2+1+2+1 in the month and 9 visits in the week. Month is the surface that can actually show a monthly rhythm, so it had better be true. |
| 5.6 | **Footer counts that do not sum to the grid** | **Handled** | *Found while building D6.* The footer showed 34 of 42 visits: it counted `split` (a shift concept, always 0 here) and counted neither missed nor cancelled — states the grid was drawing. The visits variant now swaps `split` for **Missed** and **Cancelled**, both filterable, and the numbers reconcile. |

## 6. Permissions

| # | Case | Status | Notes |
|---|---|---|---|
| 6.1 | User cannot update schedules | **Handled** | The assign action is gated on `ACL_OBX_SCHEDULES_UPDATE`; the visit drawer shows the unassigned state without the button. |
| 6.2 | User cannot view summary stats | **Handled** | Existing `useCanViewSummaryStats` collapses the KPI footer. |
| 6.3 | Single-service tenant | **Handled** | Overview and the service tab were identical; they are now one tab named for the service, keeping the KPI footer. |

---

## Decisions (session 3)

Answers from the user, with the reasoning and the consequence for the build.

### D1 — Assignment target is a runsheet (2.4)

A visit is assigned to **a runsheet**, or to **a new runsheet on a chosen day**. Never to a
weekday. This retires the largest blocking question in the project.

*Consequence.* The assignment UI presents a list of runsheets plus "create a new runsheet",
and a day picker only in service of creating one. No recurrence language anywhere.

*Carry forward.* A runsheet is a weekday-recurring **template** server-side
(`POST /shiftassignment/patrol/template`). "New runsheet on a day" must resolve to one dated
instance, and the UI must not suggest the visit repeats with the template. This is an
integration concern, not a design one, but it will bite whoever wires the real endpoint.

### D2 — Bulk add skips un-templated visits and surfaces them (3.7)

Single add already refuses and routes to tour assignment — existing production behaviour, not
a new rule. For bulk add: **add what can be added, skip what cannot, name what was skipped**
with a path to fix it. Block-all lets one un-templated site stall nineteen good ones.

### D3 — Adding to a started runsheet is allowed, but marked (3.3)

Permitted, because in the field a route in progress is exactly when demand gets inserted. The
UI carries the consequence rather than the refusal: the runsheet reads as in-progress, and the
inserted visit is distinguishable from a planned stop (3.8).

### D4 — Completed visits are read-only (3.4)

No reassignment. The drawer shows the route it ran on, its report, and nothing actionable.

### D5 — Past weeks are history except missed visits (2.5)

A past week is read-only, with one exception: a **missed** visit can be re-added to a runsheet
or moved to a new day. This makes missed the only state that stays live after its date has
passed, which is why 3.6's grid treatment is no longer cosmetic — it is how a user finds the
one thing they can still act on in a past week.

### D6 — Every visit state gets a first-class treatment

Requested directly: *"the design should afford different states in good UI."* The states a
visit card and drawer must express, distinctly and consistently in both surfaces:

| State | Grid affordance | Actionable |
|---|---|---|
| Unassigned | Pinned band, dashed outline, "No Runsheet" | Add to a runsheet |
| Assigned, not started | Normal card, runsheet name | Move, remove |
| Assigned, route in progress | In-progress marker on the card | Move, remove, insert |
| Inserted after route start | Distinct from a planned stop (3.8) | Move, remove |
| Completed | Settled/quiet treatment, report link | Read-only (D4) |
| Missed | Marked in the grid, not only in its drawer | Re-add or reschedule (D5) |
| Cancelled | Struck or greyed, still visible | Read-only |
| Blocked — no tour | Blocked affordance before the user tries (4.7) | Assign a tour |

**All eight now draw**, verified in the demo against a mock that generates every state. The
census below is from the running grid, and it reconciles with the footer in both directions —
7 unrouted + 4 blocked = 11 unassigned; 5 live + 3 inserted = 8 in progress.

| State | Count in demo | Card treatment |
|---|---|---|
| Unassigned | 7 | red dashed, `No Runsheet` |
| Blocked — no tour | 4 | amber dashed, `Needs a Service Checklist` |
| Scheduled | 4 | grey card, slate left edge, no label |
| Route in progress | 5 | blue, solid heavy left edge, `Runsheet started` |
| Inserted after start | 3 | blue, **broken** left edge, `Added after start` |
| Completed | 11 | quiet green, `Completed` |
| Missed | 6 | solid red left edge, `Missed` |
| Cancelled | 2 | grey hatch, struck through, `Cancelled` |

Two rules fell out of building it, and both are worth keeping:

- **`SCHEDULED` carries no label.** It is the common case, and badging it would drown the seven
  that need attention. Its runsheet name already says everything.
- **The state label wraps; it never truncates.** A card is one day column wide, and a
  truncated state reads as a *different* state — "Needs a…" and "Added mid-…" say nothing.
  Height is cheaper than ambiguity, and it is the last line of the card.

### D7 — Order the grid chronologically (1.2 / 1.6)

Rows read **top to bottom as the order the work happens**. Each row is keyed on its
earliest visit in the visible range; a quiet row is keyed on its **next due date**, so
it continues the same timeline rather than sitting in a separate alphabetical block.
A site with no future visit at all has no place on a timeline and sorts last.

This replaced an earlier "sites with visits first, then alphabetical" rule. Alphabetical
put Alderwood above Downtown whether Alderwood was serviced on Monday or Friday — no use
to someone planning a week, and it made the eye hunt for a name it already knew instead
of reading the sequence of work. Sites with visits still land above quiet ones, but now
as a *consequence* rather than a rule: a visit inside the range is always earlier than
one beyond it. Ties fall back to the name so order is stable between fetches.

The visible signature is a diagonal cascade of cards from the first day of the range to
the last — which is what a week of work actually looks like.

*Consequence.* Rows are still not hidden. A quiet site stays in the grid, because a
franchise manager scanning for a site they *expect* to see scheduled learns more from a
visibly quiet row than from an absent one. Note handoff gotcha §7.7 — the **day** view
must keep the server's order; this sort is the visits week view only.

### D8 — The density pass

Density was the framing that had to change. The mock generated two visits per site
per day across three sites — dense, uniform, and nothing like the business. Every
judgement made while looking at it was made against the wrong picture.

The demo book is now a **service cadence**: 46 sites on intervals of 14 to 120 days,
two with no recurring schedule at all. A typical week holds **8–12 visits touching
8–12 of 46 sites** — roughly 20% of rows. That is the real shape, and it makes the
pressure on this screen unmistakable: not crowded cells, but 38 rows of nothing.

Four things earn that space back:

1. **Quiet rows say when, not zero.** `Next visit Sep 8` instead of `0 scheduled`.
   This is the horizon answer, and it needed no new view and no new field.
2. **`Not scheduled` in amber** for a site with no future visit at all. A site that
   has fallen off the schedule is the one thing on this screen worth interrupting
   for, and it was previously indistinguishable from a quiet week.
3. **Compressed quiet rows and a divider.** Quiet rows drop to a single 40px line
   below a 2px rule — the point where this week's work stops and the rest of the
   book begins. Scroll height fell from 3123px to 1966px.
4. **`8/46 Sites serviced` in the footer**, so a mostly-empty grid reads as the
   schedule working rather than the screen failing to load.

The day and month views needed opposite treatments, and that is the useful lesson:
**a quiet row is worth its space on a planning surface and worthless on an execution
one.** The week grid keeps quiet sites because they carry a next-due date. The day
view now lists only the sites being worked, because there a quiet site says nothing
the week grid did not already say.

---

### D9 — One owner per pixel

Three separate defects turned out to be the same mistake: **two systems colouring or
sizing one thing.**

- A visit card was coloured by the state system *and* by the tenant duty palette
  (`dutyBlueBg` is `surfaceBrandSubtle`). On Filter Go's green brand the palette won, so a
  live-route card rendered **green** under a blue label. The state system now owns the
  visit card outright — no duty class, no status background.
- The `In Progress` chip took its colour from MUI `primary`, which is also the brand, and
  did the same. It sets blue explicitly now.
- The drawer's technician avatar was sized by `makeStyles` *and* by `.MuiAvatar-root`.
  Emotion injects later, so MUI won at 40px and dragged that column's text 10px below its
  neighbours — the visible "unbalanced" symptom.

The rule worth keeping: **when a value is semantic, do not source it from a theme slot
whose meaning is set elsewhere.** Brand colours change per tenant; "in progress" does not.

The rule has a second edge, found later: **taking the state system's ownership of a card does
not mean discarding the card.** Stripping the duty palette off the baseline visit left it
white on a white lane — a left tick and some text, no card. It now carries the runsheet
schedule's own `surfaceGreySubtle` fill at the same radius and padding, so the two surfaces
draw the same object; only the accent stays neutral, because the runsheet card's accent is the
brand and the brand is green on Filter Go and blue on Signal — the completed and in-progress
accents. Chrome can be shared with a brand-coloured card. Semantics cannot.

A fourth bug hid behind the first: declaring the `borderLeft` shorthand and then
`borderColor` in the same rule silently resets the left edge to the all-sides colour, so
the "solid blue" accent rendered pale blue. Longhand and ordered now.

Smaller alignment fixes in the same pass: the drawer title ran its containment test in
only one direction, producing `Alderwood Business Park - Alderwood Business Park Route`
over two lines; the address row fell back to the site name, printing it a second time
three lines under the header; the Instructions body was indented 24px from its own
heading; and section headings disagreed about colons (`Checkpoints:` / `Report` /
`Instructions:`).

### D10 — The quick filter

Sorting makes the grid scannable; it does not make it short. With 38 of 46 rows quiet,
someone who only wants *this period's work* still scrolls past the rest of the book.

A toolbar toggle — **Sites with Visits** — drops every row with nothing scheduled in the
visible range. On the demo book that is 47 rows down to 9. It is **off by default**, so the
full site list and its next-due dates remain what you see first; hiding is something the
user asks for, not something the screen decides.

Three details worth keeping:

- **The unassigned band always survives the filter.** It is demand, not a site, and hiding
  the work that most needs doing would be the exact opposite of the intent.
- **It is presentational, not a refetch.** It drops rows the client already holds, so it
  applies to mapped resources in the view model and toggles instantly. Events cannot be
  orphaned — a row is only dropped when it has no visits to begin with.
- **It only appears in the visits week view.** Day and month have no site rows to filter,
  and the day view already lists just the sites being worked.

The quiet-group divider disappears while the filter is on: with nothing below it, there is
no boundary left to mark.

**Correction (session 4).** As shipped, none of that was visible. The toggle borrowed the
unrouted-demand pill's class, so it was painted in the *alert* palette — a neutral "show me
fewer rows" control dressed as a warning, sitting beside a real one — and that class also
pinned `background` and `colour`, which meant the active/inactive variant swap never took:
pressing it changed `aria-pressed` and nothing a user could see. A filter that drops 38 of 46
rows with no on-state is indistinguishable from a broken button, which is how it was reported.
The pill now has its own geometry-only class and takes its palette from the variant.

The same session found the selection affordance in the same condition: the tick was painted
against FullCalendar's event *harness*, which is 8px larger than the card on every side, so it
landed outside the card — close enough to the row divider to look like it belonged to the row
above — and the rule meant to indent the card's content to make room for it targeted
FullCalendar's own inner wrapper and never applied. Both now hang off the card. **The lesson
for this screen: state that is stamped on the harness has to be *drawn* on the card.**

### D11 — A past visit that never started is missed (session 4)

Asked directly by the user, looking at the grid: *"What is not started yet in the past?
Wouldn't that be missed?"* Yes. This closes the first of the three questions listed under
**Still unanswered by the product** below, for the routed half of it.

`resolveVisitState` now resolves a **routed** visit whose window has closed and which never
started to `MISSED`, whatever status the record carries. "Scheduled" describes a plan, and
there is no longer a future in which that plan runs — leaving it `SCHEDULED` made it
read-only *and* unflagged, so it fell out of the workflow entirely while a visit the backend
happened to mark `missed` stayed reschedulable.

Deliberately **not** extended to unrouted visits. A past visit that was never on a route
failed earlier and differently — nobody planned it — and it belongs in the unassigned band
where that is the thing being counted.

*The demo data was lying in both directions,* which is why this was visible at all. The mock
applied a fixed status cycle regardless of date, so it generated visits three weeks out
marked **Completed** and visits in the past marked **Not started**. Status is now a function
of the date: past → completed, some missed; today → in progress or not started; future →
not started. An insert-mid-route is a *today* state and is gated to today.

### D12 — The card is three fixed lines (session 4)

Requested directly: *"keep the card consistent … the colours and the top icons already
convey the status, the 3rd line at the bottom should be which runsheet it is part of. If a
visit isn't part of a runsheet, then it should be unassigned."*

| Line | Content |
|---|---|
| 1 | Time window · status icon |
| 2 | Site name |
| 3 | Runsheet name, or **Unassigned** |

This retires the per-state text label from D6. The middle line used to mean the site in the
unassigned band and the runsheet in a site row, and the third line appeared or vanished per
state, so no two cards had the same shape and the card had three ragged heights. State is
still carried by the card's colour, its border style and its status icon, is still spoken in
every card's `aria-label`, and is still stated in full in the drawer's callout.

*What this costs, and it is worth knowing.* Two states were distinguished **only** by that
label, because the status icon comes from the API's status vocabulary and has no glyph for
them: `BLOCKED_NO_TOUR` (now amber-dashed rather than "Needs a Service Checklist") and
`INSERTED_AFTER_START` (now a broken blue left edge rather than "Added after start"). Both
remain unambiguous in the drawer. If either needs to read from the grid again, the status
icon is the place to put it — not a fourth line.

## What I would resolve first

1. **D2 — bulk add.** Decided (skip the un-templated, name what was skipped) but **not built**.
   There is a *Select visits* mode in the toolbar with no bulk-assign flow behind it, so this
   is the natural next piece, and sparse cadence makes it more valuable: a week's work is
   8–12 visits, which is exactly the size a planner would want to route in one action.
2. **1.9 — overdue against contract.** The one density question still open, and the only
   remaining use for the per-site interval field. Blocked on whether it is stored.
3. **3.8 — mark inserted stops in the runsheet's own stop list.** The visit knows it was added
   mid-route; the runsheet drawer does not show it. Half of D3 is still one-sided.
4. **5.4 — URL state.** Cheap, and it unblocks sharing a week with a colleague, which is most
   of what a scheduler is used for socially.
5. **5.2 — the silently dropped filters** in day and month. Now the only remaining case where
   the UI shows something other than what the user asked for.

### Still unanswered by the product

- ~~**Does an unrouted visit whose window has passed become `missed`?**~~ **Half-answered in
  session 4 (D11).** A *routed* past visit that never started is now resolved to `missed` in
  the client. The *unrouted* half is a deliberate no — it stays in the unassigned band. What
  remains is the integration question: does the backend transition these itself? If it does,
  the client-side rule is harmless belt-and-braces; if it does not, the client rule is the
  only thing keeping them in the workflow, and any other consumer of the API still loses them.
- **Is the contracted service interval stored per site?** Gates 1.9 — "is this site overdue"
  — and nothing else now. Next-due dates no longer depend on it.
- **Should past-dated cards be visually marked**, or is the date column enough? Currently
  unmarked on the grid; the drawer is where read-only becomes visible.
