# Harmonization settings — design and build

Where the harmonization rule lives, what it says, and what the screen has to tell a
planner about the consequences of saying it.

Companion to [`harmonize-drawer.md`](harmonize-drawer.md), which is the source of truth
for the run-time surface. This document owns the **defaults** that surface reads.

Built and in the app at **Settings → Roles & Permissions → Harmonization**
(`src/app/common/pages/settings/preferences/harmonization/`).

---

## 1. What this screen is for

Harmonization answers *"which day does this visit belong to?"* — the half of route
optimization where the time is actually saved ([visits README](visits-feature/README.md)).
Today the drawer asks that question from scratch every time it opens: it takes the week
on screen as its plan window, every visit in it as a candidate, and the day already
holding most of the work as its first route day.

Those are reasonable guesses. They are not a policy. A franchise that runs filter routes
on Mondays and Thursdays, covers a tight urban core on one and a rural ring on the other,
and is contractually allowed three days of slack against a due date, is re-entering that
policy on every single run.

So: three controls, read at drawer-open.

| Setting | Default | What it decides |
| --- | --- | --- |
| **Route days**, with a radius each | off / 10 km | Which weekdays harmonized routes land on, and how far each travels |
| **Plan window** | 1 week | How much of the schedule one run may pull from |
| **Need by window** | ± 3 days | How far a visit may move from its due date |

**It seeds, it does not bind.** Every one of these is still overridable inside the drawer
for a single run. That is the most important sentence on the screen, because the failure
mode of a settings page is a planner who cannot tell whether saving takes the controls
away from them. The neighbouring **Global Preferences** drawer on Runsheets says
*"Changing these will re-create all runsheets for the selected period"* — this screen has
to say the opposite just as plainly, or it inherits that expectation.

---

## 2. Home — and why it moved twice

**A vertical list item under the Roles & Permissions tab.** The Settings strip keeps the
tabs it already had; that tab now owns a two-item list — *Roles & Permissions* and
*Harmonization* — the same `components` shape Preferences uses.

It got here in three steps, and each correction was to the same mistake at a different
scale.

| | Placement | Why it was wrong |
| --- | --- | --- |
| 1 | Vertical item under **Preferences** | Chosen by adjacency: its neighbour is Runsheet Settings and both are route-planning rules. But the Preferences tab is filtered out for any role lacking `settings.preferences.view`, and the roles that plan routes turned out not to have it. On a live FilterGo franchise-owner account the strip holds Report Templates and Roles & Permissions and nothing else — so a sub-tab of a tab that never renders is unreachable, not tucked away |
| 2 | **Top-level tab** | Reachable, and more prominence than four fields deserve beside whole subsystems. Rejected by the user |
| 3 | Vertical item under **Roles & Permissions** | Where it lives now |

**The lesson, and this repo keeps re-learning it:** placement by adjacency is a guess until
it is checked against a real role. Ask what the actual permission set renders *before*
deciding where something lives — the drawer's design record has three separate passes that
ended in a control nobody could reach.

Gated on `ACL_OBX_SETTINGS_VIEW` (`settings.view`) — deliberately the weakest honest gate:
if you can open Settings at all, you can see this. It needs its own
`MODULE_OBX_SETTINGS_HARMONIZATION` once the backend defines one. Note the parent tab still
gates the pair: without `...ROLES_PERMISSIONS_VIEW` neither item renders.

**The `franchiseId` guard is dropped**, and not only because it was one more way to
disappear. Gating a whole tab on having a franchise is a blunter tool than the thing it
stood in for: what a radius needs is a *depot address*, and the honest handling for its
absence is the named-remedy message specified as E5 — disable the radius column and say
why — not an item that silently is not there.

**The page heading came back.** While this was a top-level tab the tab itself said
"Harmonization" and an `h4` repeating it was pure restatement, so it went. Its label is now
an item in a vertical list — a different region — and every other sub-screen in this shell
(Threshold Values, System Defaults) carries its own heading. Matching the shell beat the
general rule.

**One structural cost, accepted rather than hidden.** `RolesAndPermissions` renders its own
left-hand list of roles (Supervisor / Franchise Owner / Installer), so selecting that item
shows a list inside a list. Harmonization does not have the problem; the roles screen does,
and fixing it would mean restructuring a screen this work has no business touching.

### The preview route, and the shell around it

`/harmonization?activeTab=rolesAndPermissions` is a public route with no auth and no ACL
check (`base.route.jsx`), because the payload problem above means there is otherwise no
way to look at this screen at all. It renders the real tab chrome and the real panel, and
a drawn app shell around them — `demoShell.jsx`.

Drawn, not mounted, and the reason is the same one that produced the route: `appMain`
wants a signed-in user, a franchise list and a tenant. The real sidebar filters every item
through the ACL in the store and renders an empty rail without one; the real franchise
picker fetches its list on mount; the account menu reads a user that does not exist. What
the shell is worth to a preview is the frame it puts around a settings screen, and a frame
can be drawn honestly. The icons and the wordmark are the app's own assets, and the
geometry (76 / 240px rail, 60px header) is lifted from `sideBar.js` and `navBar.jsx`.

Two things it does *not* copy from the real sidebar:

| | Real | Preview |
| --- | --- | --- |
| Active nav item | `background: #007aff`, hardcoded | `palette.surfaceBrand`. On a green tenant the literal is the one element on screen still speaking Signal's brand |
| Tenant | `mainDomain()`, i.e. a localStorage key the demo switcher writes | Pinned to `FILTER_GO_TENANT` via its own `ThemeProvider`. A browser that has never touched that key rendered this green-branded screen in Signal blue — the one thing about a preview nobody would think to doubt |

`CustomTabsWithPermissions` gained a `basePath` prop for this: it wrote `activeTab` onto
`COMMON_SETTING` unconditionally, so clicking a tab on the preview navigated to a Settings
route that needs the session the preview does not have. Defaults to `COMMON_SETTING`, so
no real caller changes.

---

## 3. The audit that shaped it

The first draft had five regions: a stated depot origin, a route-days table with a
computed *Sites In Reach* column, two timing rows, and a derived read-out with a summary
line, coverage counts, a named list of uncovered sites and a scope caveat.

Removing the origin and the reach column — both asked for — took **six more things with
them**, because they were load-bearing for exactly the parts being removed. Recorded so
nobody restores one half of a pair.

| Removed | Why it went with them |
| --- | --- |
| **Coverage counts** (`49 of 52 sites fall inside a route day`) | The read-out half of the reach column. With no counts and no stated origin they have no basis on screen — and it drops a site-list data dependency from a settings page |
| **The named uncovered sites** | Same source. Naming beats counting, but only when the screen is entitled to make the claim |
| **"A site is claimed by its tightest route day"** | That rule was only *visible* through the counts. It still holds in the engine; a screen should not explain a rule it cannot show. It lives in §6 now |
| **"Reach, not capacity…"** | It existed to stop the coverage numbers implying the routes had been sized. No numbers, no misreading, no paragraph |
| **The summary line** (`2 route days · Mon 10 km · … · ± 3 days`) | Restated the controls sitting directly above it. The drawer's own thirteenth pass killed a panel for precisely this |
| **The `✓` rows and the read-out's section header** | A region that renders in order to report that everything is fine is a region people learn to skip — the drawer's eleventh-pass rule, applied here |
| **`Reset Defaults`** | Every other preferences page in this app has one button. A second one here for a convenience nobody asked for makes this page the odd one out |

What survives from the read-out is the one thing nothing else on the screen can say:
**which visits the rule would make unschedulable.** It is no longer a section — it is a
single note that appears only when something is wrong, sitting under the field a planner
would change to fix it.

**Five regions became two sections, three controls and one conditional note.**

### The copy pass

Every line rewritten for plainness. The pattern in the "was" column is the same one
throughout: naming a mechanism where a consequence would do.

| Was | Now |
| --- | --- |
| "Defaults for the optimizer on the Visits scheduler. A planner can still override any of these for a single run, and saving does not change routes that have already been applied." | "Starting values for planning routes on the Visits scheduler. You can change them for any single run, and saving here won't change routes you've already applied." |
| "The weekdays filter routes run on, and how far each one reaches from the depot. A site is claimed by its tightest route day." | "The days you run filter routes, and how far each one travels." |
| "Days one run may spread its routes across" | "How far ahead a single run can schedule work." |
| "How far a visit may move from its due date" | "How many days early or late a visit can be done." |
| "A visit due Thursday or Friday cannot reach Monday inside ± 2 days. They will never be harmonized. Widen the window to ± 3 days, or add a route day." | "Visits due Thursday or Friday can't be done on Monday. They'll never be scheduled. Allow ± 3 days, or add a route day." |

Three rules came out of it:

- **"Harmonized" is our word, not the planner's.** The note says *scheduled*. The screen is
  called Harmonization because the feature is; the sentences describe what happens to work.
- **"Cannot reach" is a graph metaphor.** *Can't be done on Monday* is the same fact in the
  planner's own terms.
- **Name the number, not the gesture.** *Widen the window* leaves them guessing how far.
  `smallestSafeNeedBy` computes the value and the copy states it, so the remedy is
  actionable without arithmetic.

The section heading is **Timing**, not *Plan Window* — a section whose header repeats the
label of the first row inside it is a heading doing no work.

---

## 4. Decisions

| # | Decision | Rationale |
| --- | --- | --- |
| H1 | **Empty route days = today's behaviour**, not "off" | The setting has to be additive. A tenant that never opens this screen must get the optimizer it has now. There is no `enabled` flag to forget to check: `routeDays: []` *is* the off state |
| H2 | Radius is a **number field, not a slider** | A slider is right for one value in a drawer (`editPreferences`) and wrong for a column of seven — the number is what a planner compares between days |
| H3 | Plan window is a **dropdown of 1 / 2 / 4 weeks** | `RANGE_MAX_DAYS = 28` already caps the drawer's range picker. A number field would accept 60 and be silently clamped; three options make the control and the code agree by construction |
| H4 | There is **no window shorter than 1 week** | The window runs forward from today, so any window of a week or more contains every weekday and therefore every route day. Below that a run can see no route day at all, and produce nothing for reasons the planner cannot see |
| H5 | Need by renders as **`± 3 days`**, prefix included | `3 days` is ambiguous between "three days early" and "a three-day span". The `±` is the whole meaning in one character |
| H6 | The note renders **only when the rule breaks** | H11 of the first draft, corrected: not a region that reports health, a note that reports a fault |
| H7 | The row is a **checkbox, not a switch** | This is a selection inside a table, not a setting that acts the moment it is flipped, which is what a switch promises. It also sidesteps a real theme problem — see §7 |
| H8 | Saving **does not touch routes already applied** | Harmonization is a planning act performed on demand. Said out loud because the neighbouring preferences screen re-creates runsheets on save |
| H9 | **Vertical item under Roles & Permissions, gated on `settings.view`** | §2. Reachability beat adjacency, twice |

---

## 5. Layout

No cards, no shadows — the page surface is already white. Regions are separated by 32px
of space, and the only horizontal rules left on the screen are the ones the two tables
draw for themselves.

**That is a correction.** The first build ruled every region: under the intro, under each
of the two section headings, under the column headings, under each row, and above the
footer. Three of those landed within 30px of a rule that was already there — under "Route
Days" the heading's rule and the column header's rule were stacked with a single row of
labels between them, and under "Timing" the heading's rule sat directly on top of the
first row's own. A rule that close to another rule separates nothing; it is texture. The
three went, the section gap went from 24 to 32, and the last row of the Timing table gave
up its rule to the footer's, which was 24px below it and has a second job the row's does
not: occluding what scrolls under a sticky bar.

The shell around it, and then the panel itself:

```
 Report Templates │ Roles & Permissions          ← Settings tab strip
──────────────────────────────────────────────────────────────────────
 Roles & Permissions          ⎪
 Harmonization      ◀ active  ⎪   the panel drawn below
```

```
Harmonization                                                        h4
Starting values for planning routes on the Visits scheduler. You     body2
can change them for any single run, and saving here won't change
routes you've already applied.

Route Days                                                           h5
The days you run filter routes, and how far each one travels.         body3

  DAY            ON      RADIUS  1–200 km                      subtitle3
 ─────────────────────────────────────────────────────────────────────
  Monday         ☑       [    10 ] km
 ─────────────────────────────────────────────────────────────────────
  Tuesday        ☐       —
  ⋮
  Sunday         ☐       —
 ─────────────────────────────────────────────────────────────────────

  ┌ shown only while nothing is on ─────────────────────────────────┐
  │ No route days set. Work stays on the day that already has       │
  │ the most of it.                                                 │
  └─────────────────────────────────────────────────────────────────┘

Timing                                                               h5

  Need By Window  How many days early or late a visit can be done. ± [ 3 ] days
 ─────────────────────────────────────────────────────────────────────

  ┌ shown only when the rule breaks ────────────────────────────────┐
  │ ⚠ Visits due Thursday or Friday can't be done on Monday.        │
  │   They'll never be scheduled. Allow ± 3 days, or add a route day.│
  └─────────────────────────────────────────────────────────────────┘

  Plan Window     How far ahead a single run can schedule work.  [1 Week│2 Weeks│Month]
──────────────────────────────────────────────────────────────────────
                                          Unsaved changes   [ Save ]
```

### The sticky footer needed two corrections

Both are one-liners and both were invisible until the panel was looked at on a 900px
viewport with the footer actually stuck.

- **`z-index: 1`.** Sticky is not enough to win the paint. Every MUI input root is
  `position: relative`, which puts it in the same positioned layer as the bar at
  `z-index: auto`, and paint order there is tree order — so the Need By field, which sits
  exactly where the bar pins, drew its value on top of Save.
- **`bottom: -12`, not `0`.** Sticky offsets are measured against the scrollport's
  *padding* box, and the settings shell pads its scrollport by 12px at the bottom. At `0`
  the bar pinned 12px up and rows scrolled through the strip underneath it in full view.

### The vertical list was one line too narrow

`horizontalTabList` in `customTabsWithPermissions.js` had `minWidth: 157px`, and "Roles &
Permissions" needs about 160 plus the item's own 24px of padding — so the label wrapped to
two lines inside the selected pill, the only two-line element on any settings screen. Now
180px, which also unwraps "Extra Services Charges" on the Preferences tab.

### Row height does not move when a day is toggled

Two constants at the top of the stylesheet, and both are needed:

```js
const ROW_HEIGHT = 52; // pinned on the row, with border-box
const CONTROL_HEIGHT = 36; // pinned on the radius cell, field or dash
```

`ROW_HEIGHT` alone is not enough — a 36px field in an auto-height cell still grows the row
past the 20px line of text it replaced. `CONTROL_HEIGHT` alone is not enough either, since
the row would still resize around the cell's own margins. The radius cell is always
`CONTROL_HEIGHT` tall and always holds *something*: the field when the day is on, an
em-dash in `textDisabled` when it is off.

Measured live with days on and off: **every row 52px, no exceptions.**

### Colour

The note's amber is the drawer's amber, and it is these three values rather than the
palette's for a reason already recorded in `harmonize-drawer.md`: `surfaceWarningSubtle`
(`#FEF0C7`) is far heavier than a hairline note needs, and `textWarning` (`#f19f02`) fails
contrast as body copy on white — it can mark a border but never carry a sentence.

```js
const WARN_WASH = '#FFFDF7';
const WARN_LINE = '#F0DFB8';
const WARN_INK = '#8A6410';
```

**These are now declared in two stylesheets.** They should be lifted to one shared module
before a third surface needs them; two homes is how they drifted into being one colour
last time.

The no-route-days hint is **grey, not amber** — it is the shipping default, not a fault.

---

## 6. Reachability — the one thing this screen computes

A visit due on day *D* can be served on any route day within the need-by window of *D*.
Whether **every** weekday's due dates can reach **some** route day is arithmetic over two
settings, and it is invisible in the controls.

```
(route − due + needBy) mod 7  <  2 × needBy + 1
```

The served-by interval is `2 × needBy + 1` days long and contains a weekly-recurring route
day only if it is long enough to reach it. **At the default ± 3 the interval is exactly
seven days, so every due date reaches every route day.** That is what makes ± 3 the right
default, and it means the note can only fire once somebody narrows it — the default is safe
by arithmetic, not by luck.

Route days `{Mon}`, window `± 2` — the interval is five days, and two weekdays reach
nothing:

| Due | Reaches |
| --- | --- |
| Mon Tue Wed | Mon |
| **Thu Fri** | **nothing** |
| Sat Sun | Mon |

Which is the note, verbatim from the running screen:

> ⚠ Visits due Thursday or Friday can't be done on Monday.
> They'll never be scheduled. Allow ± 3 days, or add a route day.

This is the screen's payload. A planner who narrows the window from 3 to 2 has just made
two days a week unschedulable, and no other surface would ever tell them.

### The rule the screen no longer states

Radius is measured from the **franchise address**, and where two days' radii overlap the
**tightest radius containing a site claims it** — Monday's 10 km takes the urban core,
Thursday's 25 km takes only the ring beyond it. Without that tiebreak, a 10 km Monday
inside a 25 km Thursday means every Monday site is also a Thursday site and per-day radius
is decorative.

Claiming is a *preference*, not an assignment: if the need-by window cannot reach the
claiming day, the next containing day takes it. Fit is a constraint, preference chooses —
the same ordering the drawer's merge-or-create logic had to learn (tenth pass).

Both facts are engine behaviour now rather than screen copy, since the screen shows no
per-day counts to make them visible.

---

## 7. Two theme problems found by building it

Both are pre-existing and app-wide. Both cost real time here, so they are written down.

**1. `MuiTextField` forces `minWidth: 220` on every `.MuiInputBase-root`.** A narrow field
silently renders 220px wide and overflows whatever sits beside it — which is how the unit
label ended up painted on top of the input. Every short field in this app has to declare
its width twice, once on the `FormControl` and once on the `InputBase`. `runsheetStyle.js`
already carries the same workaround.

**2. `MuiSwitch` renders an unchecked track at `opacity: 0`.** "Off" is a white thumb
floating on white. Tolerable where a switch is a lone control with a label beside it; not
in a column of seven that a planner reads down. Three attempts to fix it locally each broke
the other state — `@mui/styles` (JSS) injects before emotion, so at equal specificity the
theme wins on order, and once `opacity` was out-specified the theme's `!important` brand
fill stopped reaching the checked track.

The switch was replaced with a **checkbox** (H7), which the theme renders correctly with no
custom CSS at all: `#6A6A70` box, brand when checked. The better control for a table row
anyway — but worth knowing that the switch is the reason it was reconsidered, and that
**every other switch in this product has an invisible off state.** Worth a theme fix on its
own ticket.

---

## 8. State model and persistence

```js
{
  routeDays: [                  // absent weekday = off; [] = H1 fallback
    { weekday: 1, radius: 10 }, // ISO weekday, 1 = Monday
    { weekday: 4, radius: 25 },
  ],
  planWindowDays: 7,            // 7 | 14 | 28
  needByDays: 3,                // 0 – 14
}
```

**There is no endpoint for this yet.** Rather than have Save report success over a value
that never left the tab, `harmonizationSettings.js` persists to `localStorage`, so the
setting survives a reload and the drawer can read it. `read` and `save` are the seam: when
the API lands they become a GET and a PUT and no caller changes. Everything read back is
run through `sanitise`, so a stale or hand-edited value falls back to the default rather
than reaching the UI.

Weekday names come from `dayjs().day(n).format('dddd')` — the locale's, not a hardcoded
English list.

---

## 9. Edge cases

| | Case | Behaviour |
| --- | --- | --- |
| E1 | **All route days off** | Grey hint: *"No route days set. Work stays on the day that already has the most of it."* Not an error — it is H1 working |
| E2 | **Need by = 0** | Its own copy, because it is the total-failure case: *"A visit can only be done on its exact due date. Only visits due on Monday will be scheduled. Allow ± 3 days, or add a route day."* One note, not two — the general warning would also fire, and two notes for one cause reads as two problems |
| E3 | **Field cleared** | Empty string is a legal transient state so a planner can retype; it reads as 0 for the arithmetic and is restored to the default on blur |
| E4 | **Out-of-range typing** | Accepted while typing and clamped on blur — radius 1–200, need by 0–14 — with the range shown beside the control. Rejecting at the keystroke was the original rule and was reversed: refusing the third digit of `250` silently left `25` in the field, and `0` was accepted only to be rewritten to `1` at save time with nothing said. A correction the planner watches happen, before they commit, beats one that happens under them |
| E5 | **No franchise coordinates** | Radius has no anchor. **Not handled on this screen, and now the only handling there is** — the `franchiseId` tab guard that used to hide the screen entirely is gone (§2), so this is the first thing to add. See §10 |
| E6 | **Unit system** | Hardcoded `km`. Should read from country configuration; `mi` tenants exist |
| E7 | **View-only permission** | Not handled. Values should render as text, not as disabled inputs — a greyed-out form invites the click it will refuse |

---

## 10. Known gaps

Ordered by what would bite first.

1. **No franchise-address guard (E5).** The demo tenant's `franchiseInfo` is null, which is
   exactly the state the drawer's eighth pass is a record of. The radius column should
   disable with the remedy named — *"Radius needs the franchise address"* — rather than
   silently anchoring to nothing.
2. **Its own permission constant.** Currently borrowing `MODULE_OBX_SETTINGS_RUNSHEET`.
3. **Unit from country config (E6).**
4. **Read-only mode (E7).**
5. ~~**Nothing reads these settings yet.**~~ **Done** — the drawer reads all three, via
   `harmonizeDrawer/harmonizeRule.js`. See §11, and the drawer doc's seventeenth pass for
   what it changed on that screen. Two divergences from this document were taken
   deliberately and are recorded in §11.
6. ~~**No unit tests**, because `npm test` cannot start.~~ **Done — and the runner is fixed.**

   The two faults that stopped it, both now repaired:

   - `jest.config.js` set `testEnvironment: 'react'`, which is not a real environment, so
     every suite died on `TestEnvironment is not a constructor` before a test ran. Now
     `jsdom`. (The `type: 'module'` key above it is not a Jest option either and is gone;
     Jest had been ignoring it, which is the only reason it never surfaced as a second
     error.)
   - With `jsdom` forced it then failed inside `src/setupTests.js`, which reaches
     `utils/constants/multiTanentAuthInfo/tenantConfigs/index.js` and its **top-level
     `await`** — legal ESM, and impossible in the CommonJS Jest transforms to. That file
     now takes four static imports of four small objects and picks between them
     synchronously. No behaviour changes: `multiTanentAuthInfo/index.js` already read
     `Object.keys(MULTI_TENANT_CONFIGURATIONS)` at *its* module scope, so the value had to
     be available synchronously anyway — the top-level await only papered over a load-order
     dependency it also created. A bad `REACT_APP_LOCALHOST_TENANT_CONFIG` is now named in a
     warning instead of throwing an unresolved-module error.

   A third fault was found while fixing them and is worth knowing about: Jest walked the
   **repo root**, so it collected `build/`, every `.claude/worktrees/*` checkout, and any
   vendored copy of the frontend sitting in the working directory — roughly 820 suites
   instead of 48, with haste collisions on the duplicated `__mocks__` files. Discovery is
   now scoped with `roots: ['<rootDir>/src']`.

   What is pinned, 143 tests across three suites:

   | Suite | Covers |
   | --- | --- |
   | `harmonizationSettings.test.js` | The §6 table verbatim at ± 3 / ± 2 / ± 1 / ± 0, `unreachableWeekdays` union-not-intersection, `smallestSafeNeedBy` against the arithmetic rather than a second table, and both E4 clamps |
   | `harmonizeRule.test.js` | `assessVisit` (signed slack, symmetry, need-by-before-radius, no-start-point), `windowDaysOf` as a ten-row table, `triageVisits` funnel counts, both remedy functions including the contract-bound exclusions no knob can reach, `routeDaysInWindow`, `canServeOn`, and the two §11 divergences |
   | `harmonizePlan.test.js` | Existing route maths, plus `planRun`'s `servesOn` hook — spill withheld from a day it cannot reach, held for a later day that can, and reported as `unplaced` rather than dropped |

   The `Number(null)` bug has its own row in the `windowDaysOf` table (`null` → 3, not 0),
   and the whole table is there because absence and an explicit zero are the two rows no
   single assertion can cover. Each of these was checked by mutation rather than trusted:
   reintroducing the `Number(null)` read, dropping the contract-bound filter from
   `smallestWindowToInclude`, ignoring `servesOn` in `planRun`, dropping the today-clamp in
   `routeDaysInWindow`, and making `inNeedByWindow` mirror the eligible count each fail the
   suite. The arithmetic is no longer verified only in the running screen.

---

## 11. What the drawer does with this

**Built.** `harmonizeDrawer/harmonizeRule.js` resolves these settings into one run rule and
owns the arithmetic; the drawer's seventeenth pass is the record of the screen it produced.

| Drawer element | Before | Now |
| --- | --- | --- |
| **Plan window** picker | Defaults to the week on screen | Opens on the work and runs for `planWindowDays` |
| **The route day** | Not a question the drawer asked | A first-class control, *"Harmonize onto"*, defaulted to the first route day in the window. It is route one's own date, hoisted, so that card no longer carries a picker |
| **Candidate visits** | Every visit in the window | `triageVisits`: need-by reachability, then radius. Both counted under the two knobs (*"7 of 14 visits qualify"*) and both named, per cause, with the smallest setting that would include them |
| **Route date pickers** | Auto-picked, moving forward from the last route | Spill may only land on a **route day**, and only one whose need-by window it can still reach (`planRun`'s `servesOn`) |
| **Which day claims a site** | Not a question the drawer asks | Still not asked. A run harmonizes onto **one** day and carries that day's radius; the tightest-containing-radius tiebreak in §6 is unbuilt and matters only once a run may span two route days with different radii |
| **Start & end location** | Device → typed → franchise → centroid | Unchanged as a ladder, and it is **also the radius origin now** — see below |

**Divergence 1: one origin, not two.** This section used to keep the van's origin and the
depot the territory is drawn around as *"two origins for two questions"*. The product
decision is that harmonization does not consider the company's location at all: the radius
is measured from the point the route leaves from and returns to. So there is one origin,
the planner can move it, and the map draws the ring around it — which turns out to explain
the rule better than any sentence, because a grey pin outside the ring has already
answered why it is grey. The depot-anchored reading is not implemented anywhere.

**Divergence 2: a route day is assumed when none is set.** H1 still holds for this screen:
`routeDays: []` is the off state and there is no `enabled` flag. But the drawer cannot
demonstrate *harmonize onto your route day* from an empty rule, so `resolveHarmonizeRule`
fills in Monday at 10 km and reports `fromSettings: false`; the field's hint then reads
*"Assuming Monday. Set your route days in Settings."* rather than _"Monday is your route
day."_ This is a prototype affordance and should be revisited before a tenant sees it: the
alternative is the drawer's older behaviour, the day already holding the most work.

**Per-visit contract windows are honoured, and they can only be tighter.** A visit may
carry `needByWindowDays` of its own; the effective window is the **minimum** of that and
the planner's knob, since both are constraints. Where a contract is what refuses a visit,
no value of the knob reaches it, so the remedy is not offered and the panel says how many
are in that position. `demoVisits` synthesises one in six.

`MAN_DAY_MINUTES` stays where it is. It is a capacity constant, not a preference, and
whether the eight-hour day is per-worker ([README](visits-feature/README.md)) has to be
answered before it becomes a field on any screen. Travel is charged against it, out and
back, which is what makes the radius and the eight hours the same constraint seen twice.

---

## 12. Naming collisions still open

Two of these settings are new words for things the product already names. Two names for one
thing is how copy goes stale.

| This screen says | Product also says | Recommendation |
| --- | --- | --- |
| **Plan Window** | The drawer's own label is already `planWindow` | Aligned — no action. The brief's word was *Harmonization Tenure*; "tenure" does not mean *duration* in ordinary usage and this would be its only appearance in the product |
| **Need By Window** | The visits grid says **next due date** (`06` D8) | Unresolved. Pick one word for the visit's date. *Need by* reads better as a tolerance, which argues for renaming the grid rather than the setting |

*Preferred* was dropped from every label. Everything on this page is a preference; the word
distinguished nothing and made each label longer.

Copy note throughout: the app's `text-transform: capitalize` turns sentences into Title
Case, so every label is a short noun phrase that title-cases cleanly — the lesson that
turned *"Return To Start"* into *"Round Trip"* in the drawer.

---

## 13. Verified

Rendered on the preview route in Chrome at 1024×768, 1440×900 and 1440×1250, both rail
states, and screenshotted at each. Earlier passes used a temporary harness with the real
theme (`createTenantTheme(FILTER_GO_TENANT)`), the real `obx.json` and the real
`global.scss`, because the app is behind a login this session could not authenticate
through; the preview route replaces it.

Measured live rather than eyeballed:

- **One scrollport, not two.** The settings shell asks for `height: 100dvh` because in the
  app it *is* the whole scrollport under a sticky header; inside the preview's shell it
  would have been a second one. Handing the height back leaves exactly one scrolling
  element on the page (`rightSideArea`), confirmed by walking the DOM for
  `scrollHeight > clientHeight`.
- **Save is drawn over the Need By field, not under it**, with the bar stuck at 1440×900 —
  the `z-index` fix above, checked by screenshot in the state that exposed it.

- **Row heights all 52px**, identical with the radius field shown and hidden, checked and
  unchecked — the fluctuation this pass was asked to remove.
- **Field widths 96 / 96 / 72px** after the `minWidth` fix; 220px before it.
- **Checkbox `rgb(45,165,81)` checked, `rgb(106,106,112)` unchecked** — legible in both.
- **The note reads** `Visits due Thursday or Friday can't be done on Monday.` /
  `They'll never be scheduled. Allow ± 3 days, or add a route day.` on Monday-only at ± 2,
  and does not render at ± 3 with any route days.
- **Save round-trip**: `{"routeDays":[{"weekday":1,"radius":10}],"planWindowDays":7,"needByDays":2}`
  stored, restored on reload, Save disabled on a clean load and enabled on first edit.
- **Fonts Inter throughout.** The harness first rendered `body3` / `subtitle3` in Times —
  a harness artifact, not a product bug: those custom variants carry size and weight but no
  family, and `global.scss` supplies it app-wide. Recorded because the next harness will hit
  it too.

`eslint --ext .jsx,.js` clean, `vite build` passing, no console errors.
