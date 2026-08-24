/**
 * The demo book: four zones, sixteen points on a notional map, fifteen visits.
 *
 * **Why a fixture and not the API.** Nothing behind this flow exists yet — §5 of
 * `HARMONIZE-CONTEXT.md` lists what the backend would have to return and every item
 * on it is unbuilt. The choice was between drawing the states against literals baked
 * into each component, or against one dataset with a real shape that a planner can
 * be run over. The second is the only one that can *be wrong* — a fixture that
 * produces an impossible week is a bug you can see, where a hard-coded `5h38m` in a
 * capacity tab is always right and says nothing.
 *
 * So this file is shaped like the payload §5 asks for, field for field: every visit
 * carries `dueDate`, `needByFrom`, `needByTo`, `filterCount`, `zoneId`, site and
 * company, so a card renders slack without a second call. When the endpoint lands,
 * this file is what it replaces and no component changes.
 *
 * **The geography is coordinates, not a matrix.** §5 wants "enough of the travel
 * matrix to re-price a move client-side" — a 16 × 16 table of hand-written minutes
 * would satisfy that and be unmaintainable, and every edit to it would be a chance
 * to write a table where A→B and B→A disagree. Points plus one distance function
 * cannot drift, and moving a site is moving a site rather than editing 30 cells.
 * `travelMins` in `planner.js` is the whole of the road model.
 *
 * **Distances are notional miles on a flat grid** and the flow says so wherever it
 * quotes a drive time (Q25). Nothing here claims to be a road network.
 */

/**
 * Four zones, three worked in the canonical week.
 *
 * **West exists in order to be unworked.** It is the fixture's most important
 * feature: E6 — work in a zone the range never visits — is the most common failure
 * the flow has to explain, and §14.5 wants ① to *predict* it before the engine runs
 * rather than report it after. A book where every zone is covered can demonstrate
 * neither, and the unplaced tray, the ⑤ "stays unplanned" row and ⑥'s unplanned
 * panel would all be drawn against an empty state that never occurs.
 */
/**
 * **The boundaries a planner lassoed**, in grid coordinates — the same `{ x, y }` notional
 * miles the sites are placed on.
 *
 * ## Nothing reads these any more
 *
 * They were control points for `handDrawnRing` in `harmonizeSplit/zoneGeography.js`, which
 * resampled and wobbled them into a lassoed-looking outline. **That function is gone and so
 * is the model behind it**: a zone is a radius around a point now, and the circle is derived
 * from the zone's own sites rather than from any shape stored here. See that module's header.
 *
 * Left in place rather than deleted because the fixture is shared and nothing depends on
 * their absence — but do not add to them, and do not read them as the zones' geometry.
 *
 * ## They overlap, and that is the honest part
 *
 * The territories deliberately run into each other by a few miles across the empty middle
 * of the book. Nobody lassoing four regions in a row keeps them perfectly abutting, and
 * the model does not ask them to: membership lives on the **site** (`zoneId`), so a shape
 * is the tool that produced the assignments and not the definition of the zone. As
 * `harmonizationSettings.js` puts it, two overlapping shapes just mean whichever was drawn
 * last won the site.
 *
 * **No site sits in the contested ground**, and `zoneGeography.test.js` pins that. The
 * overlaps are in the gaps between the four clusters — which is exactly where a real hand
 * gets sloppy, because there is nothing there to be careful about.
 *
 * ## This does not reach Settings
 *
 * `defaultZones()` in `harmonizationSettings.js` picks `id` and `name` off these records
 * and writes `shape: null` itself, on the stated argument that an undrawn zone should say
 * so. That argument is about the zone *editor*, where the shape is the thing being
 * authored; it does not bind a map that has to render four territories today. A boundary
 * actually drawn in Settings still wins — see `zoneGeography.js`.
 */
export const ZONES = [
  {
    id: 'north',
    name: 'North',
    shape: [
      { x: -13.0, y: 3.0 },
      { x: -8.5, y: 18.0 },
      { x: -1.5, y: 27.0 },
      { x: 7.5, y: 24.5 },
      { x: 11.0, y: 13.5 },
      { x: 8.0, y: 1.5 },
      { x: -2.0, y: -2.5 },
      { x: -9.0, y: -1.0 },
    ],
  },
  {
    id: 'east',
    name: 'East',
    shape: [
      { x: 5.5, y: 1.0 },
      { x: 8.0, y: 9.0 },
      { x: 15.0, y: 12.0 },
      { x: 23.5, y: 7.0 },
      { x: 25.0, y: -4.0 },
      { x: 18.5, y: -9.5 },
      { x: 9.5, y: -7.0 },
    ],
  },
  {
    id: 'south',
    name: 'South',
    shape: [
      { x: -12.0, y: -9.0 },
      { x: -7.0, y: -2.5 },
      { x: 2.0, y: -1.0 },
      { x: 10.5, y: -5.0 },
      { x: 13.5, y: -14.0 },
      { x: 9.0, y: -22.0 },
      { x: 0.5, y: -26.5 },
      { x: -8.0, y: -22.5 },
    ],
  },
  {
    id: 'west',
    name: 'West',
    shape: [
      { x: -7.5, y: 4.0 },
      { x: -11.0, y: 10.0 },
      { x: -19.0, y: 9.5 },
      { x: -25.5, y: 2.0 },
      { x: -24.0, y: -8.0 },
      { x: -16.0, y: -12.0 },
      { x: -9.0, y: -6.0 },
    ],
  },
];

export const zoneName = (zoneId) => ZONES.find((z) => z.id === zoneId)?.name || '—';

/**
 * Where the van starts and ends every day (D9 — a runsheet is base→…→base).
 *
 * One base for the whole franchise rather than one per day. Config A has no per-day
 * base field and inventing one here would be the fixture making a product decision.
 *
 * **Named as a place, not as a role.** It read `Base`, and both ends of every runsheet
 * printed that word — which is the *category* of the stop rather than the stop, and left
 * a planner reading a route whose first and last rows named nowhere. A depot address is
 * what a driver would actually be told, and the same string is used at both ends because
 * it is genuinely the same location (D9): the van returns to where it started.
 */
export const BASE = { id: 'base', name: '2210 W Cypress St', x: 0, y: 0 };

/**
 * The sites, placed so that each zone is a genuine cluster with one awkward member.
 *
 * A book where every zone is a tidy circle makes the sequencer look better than it
 * is and never produces the case ④ exists for — a stop whose best day is not the day
 * it landed on. Kelvin Court is the deliberate outlier: far enough north that it is
 * the leg that tips Monday, and in a zone worked exactly once, so it has no second
 * legal day and `Move day` has to refuse (§13.7, X1).
 */
export const SITES = [
  // Zone North — a tight trio near base, plus the outlier.
  {
    id: 'fenchurch',
    name: 'Fenchurch Chambers',
    company: 'Downtown Holdings',
    zoneId: 'north',
    x: -3.5,
    y: 8.2,
  },
  {
    id: 'verity',
    name: 'Verity House',
    company: 'Downtown Holdings',
    zoneId: 'north',
    x: -1.2,
    y: 12.4,
  },
  {
    id: 'marchmont',
    name: 'Marchmont Library',
    company: 'Southgate Civic',
    zoneId: 'north',
    x: 3.8,
    y: 15.1,
  },
  {
    id: 'kelvin',
    name: 'Kelvin Court Offices',
    company: 'Elmsworth Trust',
    zoneId: 'north',
    x: 1.4,
    y: 21.6,
  },

  // Zone East.
  {
    id: 'harborview',
    name: 'Harborview Logistics Hub',
    company: 'Harborview Logistics',
    zoneId: 'east',
    x: 11.3,
    y: 2.1,
  },
  {
    id: 'langford',
    name: 'Langford Textiles',
    company: 'Elmsworth Trust',
    zoneId: 'east',
    x: 16.8,
    y: 5.4,
  },
  {
    id: 'fairmont',
    name: 'Fairmont Office Tower',
    company: 'Fairmont Estates',
    zoneId: 'east',
    x: 19.2,
    y: -1.3,
  },
  {
    id: 'ashgrove',
    name: 'Ashgrove Clinic',
    company: 'Ashgrove Health',
    zoneId: 'east',
    x: 13.6,
    y: -4.8,
  },

  // Zone South.
  {
    id: 'southgate',
    name: 'Southgate Civic Hall',
    company: 'Southgate Civic',
    zoneId: 'south',
    x: 2.4,
    y: -9.7,
  },
  {
    id: 'pemberton',
    name: 'Pemberton House',
    company: 'Pemberton Group',
    zoneId: 'south',
    x: -4.1,
    y: -13.2,
  },
  {
    id: 'rosslyn',
    name: 'Rosslyn Court',
    company: 'Rosslyn Holdings',
    zoneId: 'south',
    x: 5.9,
    y: -16.4,
  },
  {
    id: 'whitmore',
    name: 'Whitmore Depot',
    company: 'Whitmore Freight',
    zoneId: 'south',
    x: -1.8,
    y: -21.3,
  },
  {
    id: 'calder',
    name: 'Calder Works',
    company: 'Calder Industrial',
    zoneId: 'south',
    x: 8.2,
    y: -11.1,
  },

  // Zone West — never worked in the canonical week. See ZONES.
  {
    id: 'brookfield',
    name: 'Brookfield Data Centre',
    company: 'Brookfield Tech',
    zoneId: 'west',
    x: -17.4,
    y: 3.2,
  },
  {
    id: 'sableridge',
    name: 'Sable Ridge Warehouse',
    company: 'Sable Ridge Ltd',
    zoneId: 'west',
    x: -21.1,
    y: -4.6,
  },
];

export const siteById = (id) => SITES.find((s) => s.id === id);

/** The canonical week: Sat 15 – Fri 21 August 2026. Aug 15 2026 really is a Saturday. */
export const CANONICAL_RANGE = { from: '2026-08-15', to: '2026-08-21' };

/**
 * Fifteen visits, every one dated inside the range (D17).
 *
 * **Filter counts are the load-bearing numbers here, not the dates.** The cost model
 * is `10 + 20 × filters`, so the filter column *is* the shape of the week — and it is
 * chosen so that Monday's four North visits come to 10 filters, which is
 * `4 × 10 + 10 × 20 = 240` minutes of on-site against a **4-hour shift**. Monday is
 * therefore over its shift before a single mile is driven. The overrun that states
 * ③, X1, X2 and X3 depend on is structural, not a number tuned until it looked right;
 * move a site and it survives.
 *
 * `needByFrom`/`needByTo` are written out rather than derived from a global N. They
 * are per-visit on the wire (§5) precisely so a tighter contract can exist later
 * without the UI learning a second rule, and a fixture that recomputes them from ±3
 * would quietly hide that seam.
 */
export const VISITS = [
  // ── Zone North · due mid-week, windows that all reach Mon 17 ──────────────
  {
    id: 'v1',
    siteId: 'fenchurch',
    filterCount: 3,
    dueDate: '2026-08-18',
    needByFrom: '2026-08-15',
    needByTo: '2026-08-21',
  },
  {
    id: 'v2',
    siteId: 'verity',
    filterCount: 2,
    dueDate: '2026-08-19',
    needByFrom: '2026-08-16',
    needByTo: '2026-08-22',
  },
  {
    id: 'v3',
    siteId: 'marchmont',
    filterCount: 1,
    dueDate: '2026-08-16',
    needByFrom: '2026-08-13',
    needByTo: '2026-08-19',
  },
  /* Due Mon 17, window Fri 14 – Thu 20 — the visit §14.1 does its arithmetic on. */
  {
    id: 'v4',
    siteId: 'kelvin',
    filterCount: 4,
    dueDate: '2026-08-17',
    needByFrom: '2026-08-14',
    needByTo: '2026-08-20',
  },

  // ── Zone East ─────────────────────────────────────────────────────────────
  {
    id: 'v5',
    siteId: 'harborview',
    filterCount: 6,
    dueDate: '2026-08-18',
    needByFrom: '2026-08-15',
    needByTo: '2026-08-21',
  },
  {
    id: 'v6',
    siteId: 'langford',
    filterCount: 4,
    dueDate: '2026-08-19',
    needByFrom: '2026-08-16',
    needByTo: '2026-08-22',
  },
  {
    id: 'v7',
    siteId: 'fairmont',
    filterCount: 3,
    dueDate: '2026-08-17',
    needByFrom: '2026-08-14',
    needByTo: '2026-08-20',
  },
  {
    id: 'v8',
    siteId: 'ashgrove',
    filterCount: 2,
    dueDate: '2026-08-20',
    needByFrom: '2026-08-17',
    needByTo: '2026-08-23',
  },

  // ── Zone South ────────────────────────────────────────────────────────────
  {
    id: 'v9',
    siteId: 'southgate',
    filterCount: 5,
    dueDate: '2026-08-19',
    needByFrom: '2026-08-16',
    needByTo: '2026-08-22',
  },
  {
    id: 'v10',
    siteId: 'pemberton',
    filterCount: 4,
    dueDate: '2026-08-20',
    needByFrom: '2026-08-17',
    needByTo: '2026-08-23',
  },
  {
    id: 'v11',
    siteId: 'rosslyn',
    filterCount: 3,
    dueDate: '2026-08-18',
    needByFrom: '2026-08-15',
    needByTo: '2026-08-21',
  },
  {
    id: 'v12',
    siteId: 'whitmore',
    filterCount: 5,
    dueDate: '2026-08-19',
    needByFrom: '2026-08-16',
    needByTo: '2026-08-22',
  },
  {
    id: 'v13',
    siteId: 'calder',
    filterCount: 2,
    dueDate: '2026-08-21',
    needByFrom: '2026-08-18',
    needByTo: '2026-08-24',
  },

  /* ── Zone West · legal dates, no worked day to put them on (E6) ────────────
     Eight filters and five. §14.4 uses exactly this pair to argue the headline
     metric: reported as "2 visits" they look like a rounding error, reported as
     4h40m they are a fifth of the week's capacity. Both numbers are true; the
     flow leads with the hours. */
  {
    id: 'v14',
    siteId: 'brookfield',
    filterCount: 8,
    dueDate: '2026-08-18',
    needByFrom: '2026-08-15',
    needByTo: '2026-08-21',
  },
  {
    id: 'v15',
    siteId: 'sableridge',
    filterCount: 5,
    dueDate: '2026-08-19',
    needByFrom: '2026-08-16',
    needByTo: '2026-08-22',
  },
];

/**
 * The installers a route can be assigned to — **and the one place D14 is now bent.**
 *
 * D14 says this model is installer-blind, and the *engine* still is: nothing in
 * `planner.js` or `overspill.js` reads this list, no capacity is derived from it, and a
 * route's sequence and hours are identical whoever is on it. What changed is the
 * proposal's own output — a runsheet used to be created unassigned and a planner went
 * looking for the assignment screen afterwards, which the footer note (now removed) spent
 * a sentence explaining. Naming someone on the card is strictly a *label on the runsheet
 * this run will create*, so the constraint that mattered — the optimizer does not know or
 * care who works — is untouched.
 *
 * Same six people, same faces, as the schedule grid's own mock (`schedule.mock.js`), so a
 * demo that assigns Mike Ross here and then looks at the grid behind the drawer sees the
 * same person rather than a second cast. Copied rather than imported for the reason every
 * other fixture in this folder is: `schedule.mock.js` does not export them, and this
 * feature's whole model is a local book §5 will replace wholesale.
 */
export const INSTALLERS = [
  { id: 'i11', name: 'Mike Ross', imageUrl: 'https://i.pravatar.cc/80?img=12' },
  { id: 'i12', name: 'Sarah Connor', imageUrl: 'https://i.pravatar.cc/80?img=5' },
  { id: 'i13', name: 'David Nguyen', imageUrl: 'https://i.pravatar.cc/80?img=15' },
  { id: 'i14', name: 'Priya Shah', imageUrl: 'https://i.pravatar.cc/80?img=32' },
  { id: 'i15', name: 'James Okoro', imageUrl: 'https://i.pravatar.cc/80?img=8' },
  { id: 'i16', name: 'Elena Ruiz', imageUrl: 'https://i.pravatar.cc/80?img=45' },
];

export const installerById = (id) => INSTALLERS.find((i) => i.id === id);

/**
 * Config B as the drawer opens it — seeded from Config A, writes back to nothing (D6).
 *
 * Three worked days, one zone each (D15), and **Monday deliberately short at 4h**
 * where the other two get 10h. A book where every day is generously sized never
 * shows an overrun, and the four-exit E1 sequence is the part of this design with the
 * most riding on it.
 */
export const DEFAULT_RUN_DAYS = [
  { date: '2026-08-15', worked: false, shiftMins: 0, zoneId: null },
  { date: '2026-08-16', worked: false, shiftMins: 0, zoneId: null },
  { date: '2026-08-17', worked: true, shiftMins: 240, zoneId: 'north' },
  { date: '2026-08-18', worked: true, shiftMins: 600, zoneId: 'east' },
  { date: '2026-08-19', worked: true, shiftMins: 600, zoneId: 'south' },
  { date: '2026-08-20', worked: false, shiftMins: 0, zoneId: null },
  { date: '2026-08-21', worked: false, shiftMins: 0, zoneId: null },
];
