# Visits — clubbing, scheduling and route optimization

Design documentation for the Filter Go visits feature set: combining multiple visits
into a single runsheet, and the route optimization that follows from it.

Written during discovery in August 2026. The domain model in these documents was
reconstructed by reading the frontend, not from an existing spec — treat it as
well-evidenced inference and correct it where the backend disagrees.

## Read in this order

| # | Document | What it covers |
|---|---|---|
| 01 | [Discovery](01-discovery.html) | Domain model — visit vs runsheet vs hit — the five surfaces that touch visits today, and the gap |
| 02 | [Discovery questions](02-discovery-questions.html) | 49 questions split between delivery lead and devs, blocking items flagged |
| 03 | [Clubbing design](03-clubbing-design.html) | **The spec.** 22 decisions, screen design, validation rules. Revision 2 |
| 04 | [Edge case brainstorm](04-edge-case-brainstorm.html) | Contract compliance when visits move, route start/end, access windows, filter stock |
| 05 | [Route optimization](05-route-optimization.html) | Sequencing vs harmonization, three scopes, constraints, the propose-diff-accept loop |
| 06 | [Visits scheduler edge cases](06-visits-scheduler-edge-cases.md) | View-level edge cases for the built visits scheduler — what is handled, open, or blocked |
| 07 | [Consolidated visits view](07-consolidated-visits-view.html) | **The company-level list.** Redesign after the week-calendar demo was rejected: period roll-up, company year, planned vs projected. Decisions D14–D24 |
| 07p | [Companies tab prototype](07-companies-tab-prototype.html) | `07` as a working screen — both views wired up on demo data. Open it in a browser and click |

[**FilterGo-Visits-Route-Building.docx**](FilterGo-Visits-Route-Building.docx) compiles
01–04 into a single Word document for sharing outside the team.

[**HANDOFF.md**](HANDOFF.md) is the working-state note for anyone picking the work up:
what is implemented, what is deliberately unfinished, and the gotchas.

The `.html` files are self-contained — open them directly in a browser. No build step,
no external assets, and they follow the viewer's light or dark theme.

## The short version

A **visit** is one required service occurrence at one site — a time window on a given
day. The API calls it a "hit"; Filter Go calls it a Visit. A **runsheet** is an ordered
route of visits for one weekday, assigned to a worker and vehicle, and it is a
**weekday-recurring template** rather than a dated object.

The feature lets a planner pull visits from any day — overdue, today, or scheduled
ahead — into one route, governed by an eight-hour man-day that includes driving. Route
optimization then splits into two problems that are easy to conflate: **sequencing**
(order the stops in one route) and **harmonization** (decide which day a visit belongs
to at all). The second is where the time is actually saved.

## Status

Design is settled except for the open questions listed in each document. A working
route-builder screen exists at `/app/obx/runsheet/buildRoute`
(`src/app/obx/pages/runSheets/buildRoute/`) running on mock data, with a placeholder
nearest-neighbour optimizer that does not yet honour site access windows.

Four answers block further work:

- Are site access windows real restrictions, or nominal service times?
- Is the contracted service interval stored per site? **Now blocking `07`** — the
  twelve-month company view is arithmetic on this field.
- Does editing a weekday template affect the current week or only future weeks?
- Is the eight-hour day fixed, or per worker?

`07` is the design for the **company-level consolidated view**, written after the demoed
week-calendar version was rejected. It is design only — nothing is built yet.
