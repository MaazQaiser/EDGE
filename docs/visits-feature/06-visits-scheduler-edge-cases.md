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
| 1.2 | Franchise has hundreds of sites | **Handled** | The cost is **empty rows**, not events. Rows are ordered A–Z and quiet sites compress to a single short line. A quick filter drops the quiet rows entirely on demand (47 rows → 9) — with alphabetical order interleaving worked and quiet rows, that filter is the primary answer here. See [D7](#d7--order-the-grid-alphabetically-12--16), [D8](#d8--the-density-pass) and [D10](#d10--the-quick-filter). |
| 1.3 | Unassigned band holds hundreds of visits | **N/A** | Same reasoning as 1.1. The band holds one week's unrouted demand, which is small. |
| 1.4 | Zero unassigned visits this week | **Handled** | The band renders with a `0 awaiting a route` subtitle rather than vanishing — its absence would otherwise be ambiguous with "not loaded". |
| 1.5 | Zero visits at all | **Handled** | Empty state with copy that names the two ways out (change dates, clear filters). |
| 1.6 | **A site has no visit in the visible week** | **Handled** | *The dominant case.* On the demo book 38 of 46 rows are quiet in a typical week. They stay visible by default, sit in the same A–Z run as the worked rows, and — critically — **say something**: `Next visit Sep 8` rather than `0 scheduled`. One click hides them ([D10](#d10--the-quick-filter)). |
| 1.7 | **Cadence exceeds the visible horizon** | **Handled** | A quarterly site's next visit is ~13 weeks out, so no calendar range can show it. Solved without a new view: every quiet row carries its **next due date**, read off the schedule. My earlier note said this was gated on the contracted service interval — **that was wrong**. The next visit is already in the schedule; the interval is only needed to say whether a site is *overdue against contract*, which is a different question (see 1.9). |
| 1.8 | **A site with no future visit at all** | **Handled** | *New, and the one that matters.* Falls out of 1.7 for free: a row with no next-due date has dropped off the schedule entirely. Rendered as amber `Not scheduled` rather than a blank, because nothing else on this screen would ever tell you. |
| 1.9 | **Is a site overdue against its contract?** | **Blocked** | *New.* Distinct from 1.7. Answering it needs the contracted interval per site, which is still unconfirmed. Until then the grid can say when a site is next due but not whether that is late. |
| 1.10 | **One company, two sites, same day** | **Handled** | *New, session 7, and not a restatement of 1.1.* 1.1 rules out two visits to **one site** in a day; this is two visits to **two of one customer's buildings**, which the cadence makes ordinary — a customer with four sites has them on independent intervals. It only bites under the company grouping, where the row is the customer and both cards land in one lane: FullCalendar stacks them, so nothing collides, but cloned verbatim the two cards would read identically. The site line is what separates them, which is why `alwaysNameSite` is not cosmetic and why **V2 had to adapt it** ([D26](#d26--two-candidate-visit-cards-v1-and-v2-behind-a-switch)). Forced into the demo book rather than left to cadence coincidence — Elmsworth Trust, Kelvin Court Offices `8a - 10a` routed and Langford Textiles `2p - 4p` unrouted, repeating every 28 days from today so it is always in the week the reviewer lands on. Verified in week and month. |

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

### D7 — Order the grid alphabetically (1.2 / 1.6)

Rows are **one straight A–Z list of site names**, with the unassigned-demand band pinned
above them. Nothing else about a row decides where it sits: a site worked on Monday, a
site worked on Friday and a site not due until September are interleaved by name.

**This reverses an earlier chronological rule** (rows keyed on their earliest visit in the
range, quiet rows on their next due date, with a divider where this week's work stopped).
The chronological order read well in a screenshot and badly in use: a site's position moved
every time the week was paged, so the row a planner was looking for was somewhere new each
time and the only way to find it was to read every label. A name that is always in the same
place is worth more than an order that encodes dates the columns already carry — and the
row's own subtitle still says when a quiet site is next due (D8), which is the fact the
chronological sort was really being used to deliver.

*Consequence.* Worked and quiet rows now interleave, so the grid no longer groups this
week's work at the top and the quiet-group divider is gone. **The quick filter (D10) is
now the answer to a long book**, not a convenience: `Sites with Visits` drops the quiet
rows outright, 47 rows → 9 on the demo book.

*Consequence.* Rows are still not hidden by default. A quiet site stays in the grid,
because a franchise manager scanning for a site they *expect* to see scheduled learns more
from a visibly quiet row than from an absent one. Note handoff gotcha §7.7 — the **day**
view must keep the server's order; this sort is the visits week view only.

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
3. **Compressed quiet rows.** Quiet rows drop to a single short line. *(The 2px rule
   that used to mark where this week's work stopped went with the chronological sort —
   see [D7](#d7--order-the-grid-alphabetically-12--16). Under A–Z there is no boundary
   to draw, so the quick filter carries this on its own.)*
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

### D13 — The visit card *is* the hit card (session 6)

Asked in two passes. First: *"Look at the logic and UI for the cards on scheduler both on
Filter Go and Signal … design the visit cards according to what the standard is set."* Then,
with a screenshot of the **site-detail Schedule tab** attached: *"Make sure the design matches
the current standard/colors/UI of the cards … just be aware the visits here in Filter Go
behave as patrol hits in Signal."*

That second sentence settles it. A visit is a patrol hit, the schedule has always had a hit
card, and the right answer was not a new card that borrowed the old one's geometry — it was
**the hit card**.

**The standard, read off the reference screen and off `CalendarCardContent`'s `HIT` branch:**

| Slot | Content |
|---|---|
| Header, left | Time window |
| Header, right | ~~The hit's own name, next to the vehicle glyph — `Hit 1`, `Morning visit`~~ → now the site's **preferred service day**, `Prefers Wed`, amber when the visit is not on it. The name was derived from the time window, so it said in words what the time beside it said in numbers; the preferred day is the one fact on this card the day column cannot supply. Amber is suppressed on read-only visits (completed, cancelled, past) — nothing can be done about a wrong day that has already happened, and `visitFillCompleted` mutes the card for exactly that reason. **Missed keeps the mark**: it is still reschedulable |
| Line 2 | ~~⚑ Tour template, **or `Unassigned`**~~ — **dropped, see below** |
| Line 2 (now) | ⇄ Runsheet, **or `Unassigned`** — with the status badge hard right |
| Fill | The **status**: amber not started · blue in progress · green completed · red hatch missed · grey hatch + strike cancelled · plain grey when nothing has claimed it |
| Left accent | The **duty type**, 3px. Blue for patrol on Signal, green on Filter Go — the brand, because on a card that is a statement about *type* |

Two things in that table were missing from the bespoke card entirely, and both are load-bearing:

- **The tour line.** D12 recorded as a *cost* that `BLOCKED_NO_TOUR` had no on-card
  expression, and proposed a status icon if it ever needed one. The standard already had the
  answer: the tour gets a line, and when there is no tour that line reads `Unassigned`. Signal
  has shown blocked hits this way all along.

  **Since removed.** In the FilterGo book every visit is the same service, so this line read
  `Tour Template 1` in every cell of every week — a third of the card's height restating what
  the tab, the row and the grid already say. It carried a fact in exactly one case,
  `BLOCKED_NO_TOUR`, and that case is drawn anyway: the state owns the card's fill and border,
  and it is named in the badge tooltip and the `aria-label`. What is left is the one line that
  differs card to card, the route. D12's cost is therefore *reopened as a nicety, not a gap* —
  if blocked ever needs to be louder than its fill, the fix is a badge, not a line every card
  pays for. Under a genuinely multi-template tenant this decision is worth revisiting.
- **Fill and accent have different owners.** The bespoke card gave both to the state, because
  a state-coloured fill and a brand-coloured `dutyBlueBg` had been fighting over the same
  pixel (§7.25, D9). The real fix is one owner per *property*: status owns the fill, type owns
  the accent. D9's rule survives — nothing semantic is sourced from a brand slot, since the
  status washes are stated as literals rather than taken from `duty*Bg`.

**What this replaced.** Measured, not eyeballed, before anything was changed:

| # | Divergence | Consequence |
|---|---|---|
| 1 | Three type sizes: 10 / 12 / 11px, site at weight 600 | The smallest unit of work was the loudest object on the grid |
| 2 | Status icon at **20px, top-right** | Inflated the header row from 12px to 20px |
| 3 | 1px dashed border on all four sides (unassigned, blocked) | The only cards on the calendar with a full border, and 2px taller than their own siblings |
| 4 | Left accent 3px on some states, 4px on others | Eight states, three geometries |
| 5 | 1+2+3 together | 72–74px against a shift card's 64px, and unequal to each other |
| 6 | Site name on every card, tour on none | Line 2 repeated the row header; the one fact the row could not supply was absent |

Now: **60px** for a routed visit, three rows in the calendar's one type size (10px/12px), the
badge in the corner every other card puts it in. The eight states still resolve through
`visitState.js` — it maps state → *status* (`VISIT_STATE_STATUS`) and status → fill class, so
the badge and the wash cannot disagree, and a visit the backend has not transitioned yet still
reads as missed (D11).

**The site name comes off the card in a site row**, because the row names the site — as the
reference screen's hit cards do not repeat the site they sit under. It is added back for the
unassigned band, whose row says only *"Unassigned Visits"*; that card is 76px and four rows.
This narrows D12's fixed-shape rule rather than breaking it: within any one row, every card is
still the same shape.

`INSERTED_AFTER_START` is the one state the standard vocabulary cannot express — the calendar
has no status for it. It takes the in-progress wash and a **dashed** left accent, the only
non-standard mark left on the card.

**Demo data corrected alongside it,** because the card exposed both:

- Visits now carry a `tour` (`Tour Template 1`), and `null` for the blocked plan — the explicit
  denial `isBlockedWithoutTour` asks for, which is what makes that card's tour line read
  `Unassigned`.
- `VISIT_WINDOWS` was written in **UTC** while the grid renders US Central, so a window built
  at 08:00 drew as `3a` and a card announcing "Morning visit" sat at three in the morning.
  Visit windows are now offset to read as their labels. **Every other time in the mock still
  carries this skew** — a shift written 08:00–16:00 draws as `3a - 11a` — because fixing it
  properly means changing `isoAt`/`isoAtDayIndex` for every surface at once.

**Still not fixed, and worth knowing:** the demo names every runsheet after its site
(`${site.name} Route`, six places in `schedule.mock.js`), so the card's runsheet line echoes
the row header. With real route names the three lines are three facts. The same convention
names the *patrol* tab's runsheet resources, so changing it for visits alone would leave the
grid disagreeing with the runsheet drawer it opens.

> **D14–D24 live in `07-consolidated-visits-view.html`**, the design for the company-level
> consolidated view. The numbering is one sequence across both files. Two of them change a
> decision recorded here — **D22** drops quiet rows from the period roll-up (D10 keeps them on
> this grid) and **D24** adds URL state — and both are scoped to that surface only, for reasons
> stated there. Nothing in 07 is built yet.

## Decisions (session 7)

Four answers from the user, all about the week/day/month grid. D25 reverses a rule this
note recorded as deliberate; the rest are new.

### D25 — A clicked visit opens the visit, not its route

Asked directly: *"clicking on a visit should open the side panel as attached. Currently route
side drawer is shown."*

**This reverses the rule at `openVisitTarget`.** On the company grouping a visit was rewritten
into its runsheet on the way to the drawer (`shiftType: HIT → PATROL`, `id → runsheetId`), on
the reasoning that a planner reading the week by customer wants the round a stop sits on. That
was wrong twice over: clicking a *named visit* and being handed a *route* is not the object you
asked for, and the visit's own facts — service time, checkpoints, report, instructions — ended
up two hops away, down the route's stop list. A click opens the thing under the pointer.

*The route is not lost.* The visit drawer names its runsheet in the header and its assignment
callout is where the route is acted on, so the round is one hop out rather than the landing
page. The rewrite is gone; `openVisitTarget` survives only as the one place that answers "what
does clicking a visit open", because that has been two answers before.

*Not changed, and worth knowing:* the visit drawer shows **only its Details tab**. The
screenshot attached to the request also shows a **Reports** tab, but it predates the change
that removed Activities/Notes/Logs for visits — those describe a shift with its own clock-in
history, which a visit does not have, so they opened onto empty or misleading content. Left
alone rather than restored to match the screenshot; if Reports is wanted back it is a product
decision, not a regression.

### D26 — Two candidate visit cards, V1 and V2, behind a switch

Asked for as *"create V1 and V2 … V2 will have the cards and legends as we have inside the
site scheduler visit view"* — a comparison to be judged by looking, not by describing.

| | V1 (current) | V2 (the site scheduler's card) |
|---|---|---|
| Line 1 | time · Unassigned-or-prefers-day badge | time · car glyph · visit name |
| Line 2 | site · filter count | tour template, or `Unassigned` |
| Line 3 | — | runsheet, or `Unassigned` · status badge |
| Footer | stats footer, clickable counts | plain icon legend |

The trade is what a card spends its height on. V2 restates the tour and the visit's own name,
both of which V1 dropped on purpose ([D13](#d13--the-visit-card-is-the-hit-card-session-6): the
tour named the work on a grid that already says the work, and the name was derived from the time
window beside it). V2's gain is the runsheet and the status *as text* rather than as colour
alone. **Both footers are part of what is being judged**, not a side effect: a badge is only
readable against a key that names the marks, so V2 brings the site scheduler's legend with it on
every view.

**V2 is the default** and its switch **floats over the grid, bottom right**, both asked for once
the pair was on screen. The default inverts the usual defer-to-the-incumbent rule on purpose:
the point of the pair is to pick one, so the candidate is what you live with while forming that
judgement, and V1 is one click away rather than the thing you opt out of. The switch left the
toolbar because the toolbar is where you change *what* the grid shows, and this changes how one
card is drawn — a reviewer's control, parked clear of the filters it is not part of. It is
anchored above the footer off `FOOTER_LAYOUT`'s own `paddingBottom`, so it cannot drift onto the
legend when the footer changes height between views.

**V2's colours are the reference's, exactly** — asked for directly: *"match the colors of the
cards and design exactly as in individual site scheduler visit card designs."* So V2 takes
`EVENT_BG_COLOR_CLASSES` and the reference's `4px 6px` padding, **not** the `visitFill*` washes
and not `visitCardShell`. This overrides the earlier deviation recorded here, and two
consequences come with it that are inherited rather than introduced:

- **In progress is green on Filter Go.** `dutyBlueBg` is `surfaceBrandSubtle`, which
  `tenantBranding.js` maps to the tenant brand — `#E8F7ED` here. That is exactly
  [4.12](#4-data-quality) / [D9](#d9--one-owner-per-pixel), and it is also exactly what the
  reference screen renders on this tenant, so matching it means inheriting it. V1 remains the
  variant that does not, which is now part of what the two are being judged on.
- **Only three statuses have a fill.** Measured on the running grid: not started `#FFF7E1`,
  completed `#EFF8EF`, and **unassigned, missed and cancelled all `#F5F5F6`** — they fall through
  to `eventContent`'s plain grey exactly as they do on the reference. On V2 those three are told
  apart by the status badge alone, where V1 gives each its own wash. The real information cost of
  the match, and the clearest thing to weigh when choosing.

The *status* is still resolved through `visitState` rather than read off `scheduleStatus`
(`getVisitLegacyBgClass`) — the one thing not copied. The badge already resolves that way (D11),
and a fill keyed on the raw status would let the wash and the badge on one card disagree.

One further departure, which the reference could not supply:

- **`alwaysNameSite`.** The reference row *is* one site, so its cards never name one. Under the
  company grouping there is no such row, and [1.10](#1-volume-and-density) stacks two of a
  customer's buildings in one lane — cloned verbatim, both cards read the same. So the header's
  third slot carries the **site** instead of the visit's name, which is the right thing to give
  up for it (see D13). Three lines either way; no geometry changed.

Labelled `V1`/`V2` against [the Companies tab's own decision](../../src/app/obx/pages/schedules/companies/CompaniesViewSwitch.jsx)
to rename its views *away* from those labels. That reasoning holds for a control that ships and
names two permanent views; this one names two candidate designs of one card, live only so
someone can choose, and V1/V2 are the words the choice is being discussed in. **When the
decision lands, the switch and the losing card go together.**

### D27 — The month chip names the customer

Asked for as *"remove filter count, currently we have site name. show company name separated by
dot and then site name, truncated."*

The chip read `Site · N`. It now reads `Company · Site`. This is the *company* grouping and the
month is its only view with **no company row** — so the customer was the one fact on that grid
that appeared nowhere, and with several customers' chips sharing a cell it is also what tells
two chips apart. The filter count told them apart not at all; it and the time are both one hover
away in the card the chip already has.

Company leads in the subject's dark ink, the site qualifies it in the same quiet grey the week
card's route line takes, and the dot is its own element so a visit whose company did not resolve
draws no leading separator. **Both names truncate, and at one seventh of the grid they always
will** — 147px holds about 115px of text against ~240px of two proper nouns. The chip's side
padding was cut 12px → 6px, which was the only part of that squeeze buying nothing; the rest is
inherent, and the hover card is what carries both names in full.

### D28 — The legend spells out the visits vocabulary, and cancelled is grey

Asked for as *"change cancelled legend to grey. Make sure all the legend examples are shown."*

Both halves were real. The legend was `DEFAULT_LEGEND_STATUSES` — the **shift** vocabulary —
which omits Missed and Cancelled, so the grid drew red and grey cards while the key underneath
admitted to neither, and carried `Split shift`, which is permanently 0 for visits. It is now a
visits list of six: Completed · In progress · Not started · Unassigned · Missed · Cancelled, in
the same order as `VISITS_STATUS_STATS` so both footer paths read alike, and every entry renders
at count 0 rather than vanishing.

Kept as its **own** list rather than added to the shift one, for the reason the stats footer
already keeps them apart: dedicated and patrol share `DEFAULT_LEGEND_STATUSES`, and a Missed
entry there would be a mark those grids never make. Incomplete is absent too — no visit state
resolves to it.

The cancelled mark was genuinely red (`#E43F32`) against a card that is grey, so legend and card
disagreed. Fixed at the **call site**, not in the SVG: `CancelledIcon` is shared with the card
badge and the drawer's status chip, where red is not this decision's to change. `grayscale(1)`
rather than a fill override — the icon paints its disc through presentation attributes on nested
nodes, so an override means selecting on hex literals a re-export would silently invalidate, and
the card's own `#F6F7F9` would be invisible on a white footer where grayscale lands near `#616161`
and keeps the glyph legible. Already this codebase's idiom for a retired card.

### D29 — The chrome: one red count, Harmonize by the window controls, Forecasting closes the row

Four asks in one pass, all about the two control rows above the grid.

**Harmonize moved into the filter bar, at its right edge** — after Day/Week/Month, not between
the toggles. Reaching that position needed a **new toolbar slot**: `toolbarRightContent` renders
*between* the date navigator and the view toggles, so anything passed there lands inside the run
of segmented controls, where a filled green page action reads as a third toggle. The shared
calendar shell now also takes `toolbarTrailingContent`, rendered after the view toggles, and
Harmonize goes there while the grouping switch keeps the middle slot — where being read as part of
that cluster is correct. All four of Harmonize's gates moved verbatim (`!isSitesModule`,
`!isUsersModule`, `!isDayView`, and visits-tab-or-company-grouping), plus its
`disabled={!harmonizableVisits.length}`.

**Forecasting closes the header row**, where Harmonize was. This needed no new component — it was
already wired to `SuppliesForecastingDrawer` with its own trend icon and quiet treatment; taking
Harmonize out of the row is what makes it the trailing control. It is gated on the tenant
permission `runsheets.suppliesForecasting`, which the demo did not set, so the button could not be
seen at all. **Turned on in the demo payload** (`helper/mockData/mockUserData.js`) rather than by
relaxing the gate: it is a tenant feature flag, and a tenant that has not bought supplies
forecasting must still not be shown it.

That fix alone did not make the button appear, which turned up **a real bug worth more than this
feature**: `tenantPermissions` was written *only at login*, and the store is persisted, so a
session kept alive across reloads never saw a tenant flag change again. A flag turned on stayed
invisible; a flag **revoked** stayed clickable until the user happened to log out. `App.jsx` had a
`_getPermission` helper meant to refresh this and **nothing ever called it**. It is now a live
effect that refreshes the tenant flags on every boot with a token.

*Only the tenant flags.* Reviving the dead helper wholesale breaks routing: it also dispatched
`setAccessControlPermissions(user.accessControlList)`, and login does not use that field — it
derives module access from the user's **role** (`setUserAccessList`) — so overwriting the store
with the raw payload field collapses module access and every route redirects to the profile page.
Confirmed by doing it: worth knowing, because the helper looks like something to simply call.
Verified the other way too — flag stripped from the persisted store, plain reload, no re-login, and
the button returns.

**The missed-visits pill is gone; the assignment message takes the row.** Two red pills side by
side asked a planner to hold two numbers and then decide which the morning was about. Unrouted
demand has never been given to anybody; a missed visit already has an owner and a history. One
red count, and it is the one actionable from here.

That removal forced a reversal, which is the part worth recording: the assignment pill **used to
be suppressed on the company grouping**, on the reasoning that every unrouted visit is already
drawn on its customer's row with `Unassigned` in red, so a total restated the grid. That held
only while Missed was still in the row — with Missed gone, suppression left the header **empty on
the one grouping the visits work happens in**, costing the screen its running total of unrouted
demand *and* the one-click toggle to filter to it. A fact visible card-by-card is not a total.
The pill now shows on every grouping, with **one message everywhere**:
`N shifts require assignment`. The visits reading used to swap in `N Visits not on a route`, which
named the *symptom* where this names the **action** — somebody has to assign it — and which made
one pill read two ways depending on a grouping toggle the planner may never have touched. The
tooltip still specialises per subject, because that is where the count's scope and the filter it
applies are explained.

*Left standing, deliberately, and needing a decision:* `MissedHitsDrawer` and the whole
`getMissedHitsCountFunc` → `missedHitsCount` → `refreshMissedHitsCount` chain are intact but now
**unreachable** — that pill was their only trigger, the grid's own copy having been retired
earlier. The count still fetches on every window change and nothing displays it (`missedHitsCount`
carries an eslint-disable to say so). Either retire the chain deliberately or give it a new entry
point; do not let it rot as a live fetch with no reader.

**The resource column's header is left-aligned.** `Company` was centred over left-aligned names.
The cause was ours, not FullCalendar's: our sticky-header rule set `alignItems: 'center'` on
`[role="columnheader"]`, and that cell is `flex-direction: column`, so `align-items` is the
*horizontal* axis there. One property to `flex-start`; header text and every name now share
x=116. Vertical centring comes from `justify-content` on the same element and is untouched. The
fix reaches `Routes`, `Locations`, `Officers` and `Sites` too, which had the same mismatch —
every other `columnheader` FullCalendar renders already carries an `align*` class with
`!important` and so is unaffected.

### D30 — Visits is the home reading, not routes

Asked for directly: *"by default the visit week view will be visible… in the toggle, the visit
toggle will come first and route later."*

The main tab now **opens on the company-grouped week grid**. Routes — rows are runsheets — answers
"what is each round doing this week"; visits answers "what does each customer have booked", and on
Filter Go that is the question the screen exists for: work is sold per site on a service cadence,
so the planner's morning starts from demand, not from the vehicles. Routes is one click away for
the execution reading. The week was already the default view type; only the grouping changed.

The toggle's segments are reordered to match — **visits first, routes second**. A segmented
control's first segment reads as its home position, so leading with routes while the grid opened on
visits made the selected segment look like the second choice.

Two things this deliberately does *not* do. A **stored** grouping still wins over the default, so
anyone who has picked routes keeps it — a default is what to show someone who has not chosen, not
an instruction to overrule someone who has. And nothing changes on Signal: `canSwitchGrouping` is
false there, and the guard `canSwitchGrouping ? choice : ROUTES` already pins that tenant to
routes, so the new default cannot leak onto a tenant with no company reading to switch to.

### D31 — The Companies tab's two labels were on each other's views

Reported as *"the Timeline toggle shows the compact view and Compact shows the timeline."* Correct,
and worth recording for **how** it hid rather than for the one-line fix.

- `companies/index.jsx` draws a table with **month columns across the top** (`Aug '26`, `Sep '26`,
  `Oct '26` …), one row per site, one small card per month cell. Months on an axis is what a
  timeline is, whatever the module is called.
- `companies/timeline/index.jsx` draws collapsible company groups, sites as rows, **no month
  header** — the compressed reading. Its own stylesheet already said so: *"V1 is a list, not a
  scheduler."*

The mapping was **self-consistent**: label, hint text, enum key and mounted component all agreed
with each other. So tracing the wiring — enum → segment `value` → `onChange` → the mount
conditional → persistence — finds nothing wrong, and a render test asserting "Timeline mounts
`CompaniesTimeline`" passes. Nothing in the code disagreed with itself; **the code disagreed with
the screen**, and that is only visible by opening both views and looking at them. A first pass over
this concluded there was no bug, on exactly that evidence.

Fixed at the single point that decides what a label mounts (`CompaniesPane`'s `VIEWS`), not by
swapping the labels: the labels are the half that was right, and each still sits with the hint that
describes it. The default is `TIMELINE`, so the tab now opens on the month matrix — verified with
the stored key cleared. A stored `'timeline'` likewise now resolves to the matrix, which is the
point of the fix rather than a migration problem.

Two things left standing, deliberately. The `timeline/` directory, the `CompaniesTimeline`
component and the `COMPANIES_VIEW.TIMELINE` key now all name the *grouped list*; renaming that
ladder touches the stylesheet, the filters and the persisted value together, so it is a follow-up,
and the imports are aliased to what they draw (`CompaniesMonthMatrix` / `CompaniesGroupedList`) as
the guard rail until then. The fallback `VIEWS[view] || CompaniesTimeline` also hard-coded a
component — a second place for the mapping to be wrong from — and now resolves through
`DEFAULT_COMPANIES_VIEW`.

**A tooling note that matters more than this bug:** that dangling `CompaniesTimeline` reference
survived `npx eslint` cleanly after the identifier was renamed. `no-undef` does not appear to be
active in this project's config, so a typo'd or renamed identifier is a runtime error the linter
will not catch. Worth turning on.

### D32 — Two candidate shells, and three card/grid corrections

Asked for as one batch: two whole-screen variations to compare, plus three fixes.

**The two shells** live behind a second floating switch, labelled `Var 1` / `Var 2`
(`config/schedulerLayout.js`). Their *identifiers* are `TABBED_COMPANIES` and
`UNIFIED_TOGGLE`, deliberately not `V1`/`V2`: `VISIT_VIEW_VARIANT.V1/V2` already exists a few
files away naming two candidate **cards**, a different axis entirely, and two `V1`/`V2`
vocabularies in one feature is exactly what let [D31](#d31--the-companies-tabs-two-labels-were-on-each-others-views)
ship. The same reasoning governed the third grouping value in Variation 2: it is
`timelinePane`, containing no `compan*` at all, because `MAIN_VIEW_GROUPING.COMPANIES` already
means "this week, rows re-grouped by customer" while the new one means "replace the grid with a
twelve-month pane" — two values one adjective apart on the axis they must never be confused on.

| | Variation 1 — `TABBED_COMPANIES` | Variation 2 — `UNIFIED_TOGGLE` |
|---|---|---|
| Companies | its own tab, now Day/Week/Month/**Year** | **no tab** — a third grouping on the grid toggle |
| Grid toggle | visits, routes | visits, routes, company timeline |
| Toolbar right, L→R | date → toggle → D/W/M → Harmonize | toggle → D/W/M → date → **Harmonize** |

Variation 1 retires the Timeline/Compact density pair rather than adding a second control:
each shape is bound to the range it was built for — the month matrix earns its axis only at
twelve columns, and the grouped list has no axis, which is what a day, a week and a month are.
The fetch narrows with the range (whole-month envelope, trimmed client-side), and Day and Week
drop quiet rows, following the week grid's own precedent in [D8](#d8--the-density-pass).

"Toggle" in the reordering brief was ambiguous — grouping, Day/Week/Month, or both. Read as
**both**, since they are one adjacent cluster of "how am I looking at this" controls and putting
the date between them splits it. One line to change if that reading is wrong.

**A footer variant had to be invented for this.** Variation 2 reaches the pane from a tab whose
config still says `overview`, so `rendersOwnPane` — which is *tab*-derived — is false, and the
page drew an empty overview stats bar and a status legend under a surface with its own chrome.
`SCHEDULE_STATS_FOOTER_VARIANTS.NONE` now says "no page footer" as an *answer*, distinct from
`null`'s "nothing reported yet, fall back to the tab", which the page resolves with `??`. Matched
by name, not by falsiness — the stopgap reported `''` and leaned on `Boolean(footerVariant)`,
which works by accident.

**Three corrections shipped alongside:**

- **The unassigned avatar.** A shift with nobody on it drew a placeholder face beside the word
  `Unassigned`. Fixed in four places across both the current and legacy cards, keyed on the
  *label's own* `officer?.name || reassignedOfficer?.name` chain so the face and the word cannot
  disagree by construction — not on `calendarShiftStatusEnum.UNASSIGNED`, which is a server status
  driving a different mark. An assigned officer with no photo still gets the placeholder: a person
  without a picture is not nobody. The avatar's wrapper was also the assign-officer click target,
  so on unassigned rows the trigger moves to the row rather than leaving a zero-width one.
- **V2's card** drops the tour line and the car glyph; the **site** takes the freed line, in the
  dark subject treatment with the route muted below it. This retires the `alwaysNameSite`
  adaptation recorded in [D26](#d26--two-candidate-visit-cards-v1-and-v2-behind-a-switch) — the
  site is unconditional now — though the prop stays inert while V1 still uses it.
- Visits-by-company is the default grouping and leads the toggle ([D30](#d30--visits-is-the-home-reading-not-routes)).

**Worth knowing.** The demo's forced same-day pair ([1.10](#1-volume-and-density)) is landing a
day off its anchor. And the mock phases each site's cadence against the *first month of the
requested window*, so a narrow fetch can show a different set of sites for a month than the Year
matrix does — pre-existing, invisible while every request was a rolling year, and a
`schedule.mock.js` fix (phase against a fixed epoch) if the demo needs to reconcile across grains.

### D33 — Toolbar polish: a border on the selected toggle, no `Today`, a divider before the filters

Three small asks against the layout D32 landed.

**A hairline border on the selected grouping segment.** `calendarHeaderToolbarToggleBtn`'s
identical rule was deliberately border-free — that pill is white on a white page, so its own
background gave it an edge for free. `scheduleGroupingToggleBtn`'s pill sits on the grey track
`surfaceGreySubtle`, where the lift-shadow alone read as a soft smudge rather than a boundary.
Added as `1px solid borderSubtle1` inside the same `&&.Mui-selected` rule; the box was already
holding a `1px solid transparent` border, so nothing shifts on select.

**`Today` is gone from the date-range pill.** `handleGoToToday`, `isViewingToday`, the divider that
separated it from the stepper, and the two now-dead style rules (`calendarHeaderToolbarLeftDivider`,
`calendarHeaderToolbarToday`) are removed rather than hidden — nothing else in the file referenced
them. This is the shared calendar shell (`src/app/components/common/calendar/index.jsx`), which the
scheduler is currently its only caller of, so the removal is scoped to this feature in practice but
is not itself scheped to one variation — every schedule tab loses the shortcut. Clicking the date
label still opens the picker.

**A divider between the grouping toggle and the filter row.** New leading-slot pattern:
`toolbarLeadingContent` (added for the grouping toggle in D32) now draws a 1px rule right after
itself, height-matched to the row via `alignSelf: stretch` rather than a fixed height, and — this is
the part worth remembering — **conditioned on the slot actually being filled**. A tenant with no
grouping toggle (`canSwitchGrouping` false) or an embedded site/user schedule passes nothing into
that slot, and a rule dividing the filters from empty space would have been worse than no rule.

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
