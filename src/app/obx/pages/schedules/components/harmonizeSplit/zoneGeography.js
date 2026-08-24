/**
 * Where the zones are, what colour each one is, and how the flow's grid becomes a map.
 *
 * The Split shell adds one component to the drawer — a map — and a map needs three things
 * the drawer's model does not carry: coordinates, boundaries, and a way to tell one zone
 * from another at a glance. This module is all three, and nothing else in the shell knows
 * how any of them are arrived at.
 *
 * ## The geography is projected, not invented
 *
 * `harmonizeFlow`'s fixture places its sites on a notional flat grid in miles — `{ x, y }`
 * about a base at the origin — and says so plainly, because the planner only ever needs
 * relative distance to price a leg. Settings already solved the same problem for the zone
 * editor: `zoneSites.js` reads that grid out as latitude and longitude around the demo
 * anchor, so a boundary can be drawn over streets.
 *
 * **This module imports that projection rather than repeating it**, and the four lines it
 * would have taken to repeat are exactly the point. `zoneSites.js` states the failure it
 * exists to prevent: if two surfaces sat on different anchors, every distance either of
 * them showed would be wrong in the same direction, which reads as a broken optimizer
 * rather than a bad default. One anchor, one geography, one file that decides it.
 *
 * ## The boundaries prefer the planner's own
 *
 * A zone's shape can come from two places. If somebody has drawn one in Settings, the
 * saved rule carries it in latitude and longitude and it wins outright — that is the whole
 * reason the editor exists. Failing that, the fixture's seeded boundary is projected the
 * same way the sites are. A planner who draws North in Settings and reopens Harmonize sees
 * the North they drew.
 */

import {
  readHarmonizationSettings,
  ZONE_SHAPE,
} from 'src/app/common/pages/settings/preferences/harmonization/harmonizationSettings';
import { gridToLatLng } from 'src/app/common/pages/settings/preferences/harmonization/zoneSites';
import { zoneColor } from 'src/app/components/common/zonePalette';
import {
  SITES,
  VISITS,
  ZONES,
} from 'src/app/obx/pages/schedules/components/harmonizeFlow/model/fixtures';

/**
 * The palette lives in `components/common/zonePalette` now — re-exported here so every existing
 * importer of this module keeps working untouched.
 *
 * It moved because the Settings zone editor needed the same table, and a *forked* validated
 * palette is an accessibility regression that arrives silently: whichever copy gets edited
 * still looks fine on its own screen. It moved **above both features** rather than being
 * imported from here because `harmonizeSplit/` is one of three comparison shells and
 * `schedules/index.jsx` states the plan to delete "the losing shell" once the choice lands — so
 * a shipped screen importing from this directory would have been depending on a file scheduled
 * for possible deletion.
 *
 * The whole argument, the contract, and the outstanding contrast debt are in that module's own
 * header. Read it there rather than keeping a second copy here, which is how the two would
 * drift.
 */
export { ZONE_COLOR_FALLBACK, ZONE_COLORS, zoneColor } from 'src/app/components/common/zonePalette';

/** Every site the flow knows about, as a point on the ground. */
export const SITE_POINTS = SITES.map((site) => ({
  id: site.id,
  name: site.name,
  company: site.company,
  zoneId: site.zoneId || null,
  ...gridToLatLng(site),
}));

export const sitePointById = (id) => SITE_POINTS.find((site) => site.id === id) || null;

/**
 * Everything worth saying about one site, for the map's hover card.
 *
 * ## What earns a place, and what does not
 *
 * The card answers *"what is this pin, and why is it in this week's work"*, so it carries
 * exactly the facts that answer that and nothing that merely happens to be in the fixture:
 *
 * | Fact | Why it is on the card |
 * | --- | --- |
 * | Company | The pin is one of several a company may own — `Downtown Holdings` has two in North alone — so the site name alone is ambiguous to anyone who works by account |
 * | Site | What the planner is pointing at |
 * | Zone | Which territory claims it, and therefore which day can serve it. The one fact that explains a stranded visit |
 * | Filters | The work. The cost model is `10 + 20 × filters`, so this *is* the duration in disguise, and it is the number that decides whether a day fits |
 * | Due | Why it is in scope at all |
 * | Can move | The need-by window. Whether a refusal is fixable by moving the day or only by widening the rule |
 * | From base | Every route is a round trip from base, so distance is what the drive is made of |
 *
 * Deliberately absent: the visit id (a key, not information), the raw grid coordinates
 * (the map *is* the coordinate), and anything about the route — the caller owns that,
 * because whether this site is on a runsheet is a fact about the run and not about the site.
 *
 * **Aggregated across visits, because a site can have more than one.** Filters sum, the due
 * date is the earliest, and the window is the union — the widest span any of this site's work
 * could legally move within. Taking the first visit's values instead would quietly under-report
 * a site with two.
 */
export const siteFacts = (siteId) => {
  const site = SITES.find((entry) => entry.id === siteId);
  if (!site) return null;

  const zone = ZONES.find((entry) => entry.id === site.zoneId) || null;
  const visits = VISITS.filter((visit) => visit.siteId === siteId);
  const dates = (key) =>
    visits
      .map((visit) => visit[key])
      .filter(Boolean)
      .sort();

  const due = dates('dueDate');
  const from = dates('needByFrom');
  const to = dates('needByTo');

  return {
    id: site.id,
    name: site.name,
    company: site.company,
    zoneId: site.zoneId || null,
    zoneName: zone?.name || null,
    zoneColor: zoneColor(site.zoneId),
    visitCount: visits.length,
    filters: visits.reduce((total, visit) => total + (visit.filterCount || 0), 0),
    dueDate: due[0] || null,
    needByFrom: from[0] || null,
    needByTo: to[to.length - 1] || null,
    /* Straight-line miles on the fixture's own grid, which is what every other distance in
       this feature is measured in. Not driving miles — the engine works those out, and a
       hover card that quoted one would be promising a number the optimizer has not produced. */
    milesFromBase: Math.hypot(site.x, site.y),
  };
};

/**
 * Where the van starts and ends.
 *
 * The fixture's base is its grid origin, so this is the anchor itself — but it is written
 * as a projection of `{ x: 0, y: 0 }` rather than as the anchor, because the day the base
 * moves off the origin this line should keep being true without anybody noticing it needs
 * to change.
 */
export const BASE_POINT = { id: 'base', name: 'Base', ...gridToLatLng({ x: 0, y: 0 }) };

/**
 * A ring's middle, for hanging its name on.
 *
 * The **area centroid**, not the average of the vertices. Averaging vertices is a point
 * pulled toward whichever edge the planner clicked most while drawing, which on a lassoed
 * boundary — hundreds of samples down one side, four down another — can land the label
 * outside the shape entirely. Settings' own zone map anchors locked-zone labels at
 * `points[0]`, which is worse again: the first vertex is on the *edge*, so the name sits
 * half in the zone and half out of it.
 *
 * Falls back to the vertex mean for a degenerate ring — three collinear points enclose no
 * area, so the shoelace term is zero and the centroid is a division by it. Such a ring
 * cannot be drawn anyway; this only decides where its name would go if it were.
 */
export const ringCentroid = (ring = []) => {
  if (!ring.length) return null;

  let twiceArea = 0;
  let lat = 0;
  let lng = 0;

  for (let i = 0; i < ring.length; i += 1) {
    const a = ring[i];
    const b = ring[(i + 1) % ring.length];
    const cross = a.lng * b.lat - b.lng * a.lat;
    twiceArea += cross;
    lng += (a.lng + b.lng) * cross;
    lat += (a.lat + b.lat) * cross;
  }

  if (Math.abs(twiceArea) < 1e-12) {
    return {
      lat: ring.reduce((total, point) => total + point.lat, 0) / ring.length,
      lng: ring.reduce((total, point) => total + point.lng, 0) / ring.length,
    };
  }

  return { lat: lat / (3 * twiceArea), lng: lng / (3 * twiceArea) };
};

/**
 * A saved radius shape, read out as a ring.
 *
 * The map draws one kind of thing — a closed path — so a circle is turned into a polygon
 * here rather than the renderer growing a second shape branch. 48 segments is smooth at
 * every zoom the map offers; the longitude term widens by the cosine of the latitude, the
 * same flat-earth assumption the projection this file imports already makes.
 */
const RADIUS_RING_SEGMENTS = 48;
const MILES_PER_DEGREE_LAT = 69.0;

const radiusToRing = (shape) => {
  const { anchor, radiusMiles } = shape;
  const miles = Number(radiusMiles);
  if (!anchor || !Number.isFinite(miles) || miles <= 0) return null;

  const perDegreeLng = MILES_PER_DEGREE_LAT * Math.cos((anchor.lat * Math.PI) / 180);

  return Array.from({ length: RADIUS_RING_SEGMENTS }, (_unused, index) => {
    const angle = (index / RADIUS_RING_SEGMENTS) * 2 * Math.PI;
    return {
      lat: anchor.lat + (miles * Math.sin(angle)) / MILES_PER_DEGREE_LAT,
      lng: anchor.lng + (miles * Math.cos(angle)) / perDegreeLng,
    };
  });
};

/* ── Making a polygon look lassoed ──────────────────────────────────────────────────
   The fixture stores seven or eight control points per zone, and a regular octagon says
   "generated". What a planner actually produced was a lasso — so what this section adds is
   *irregularity*, not curvature: more corners than the control shape has, at uneven
   intervals, none of them square. It also sets the right expectation about precision, which
   is the quieter reason it earns its keep — a boundary you can see was drawn by hand is one
   nobody will read to the nearest street. */

/** A stable pseudo-random in [0, 1) from a string. The same trick `demoVisits` uses. */
const hashUnit = (value) => {
  let hash = 0;
  for (const character of String(value)) hash = (hash * 31 + character.charCodeAt(0)) | 0;
  return (Math.abs(hash) % 10000) / 10000;
};

/**
 * How far the hand strays from the line it meant to draw, in notional miles.
 *
 * A little under a mile at a forty-mile view — visible as unsteadiness, nowhere near
 * enough to move a site across a boundary. The test suite is what actually holds that
 * second claim: every site has at least 1.6 miles of margin to the nearest foreign edge.
 */
const WOBBLE_MILES = 0.7;

/**
 * Vertices in the finished ring. Well under `ZONE_POINTS_MAX`, so a shape like this could be
 * saved from the editor.
 *
 * **18, down from 44, and the drop is the point.** At 44 the vertices are close enough
 * together that the outline reads as a curve whatever you do to it. At 18 each edge is long
 * enough to be seen as a straight segment and each vertex as a corner — which is what a
 * lasso or polygon tool actually produces.
 */
const RING_POINTS = 18;

/**
 * A periodic wobble — three harmonics with hashed phases.
 *
 * **Periodic is the requirement, not a nicety.** The offset is applied around a closed
 * ring, so whatever it returns at `t = 0` it must return again at `t = 1` or the shape
 * ends with a step where the start and the end fail to meet — a visible notch, always in
 * the same place, which is the one artefact that would read as a rendering fault rather
 * than as a human hand. Integer harmonics of a full turn are periodic by construction.
 *
 * Three of them because one is a wave and two is a pattern; the third is what stops the
 * eye finding the rhythm. Amplitudes fall off so the low frequency carries the drift and
 * the high ones only roughen it.
 */
const wobbleFor = (seed) => {
  const phaseA = hashUnit(`${seed}-a`) * Math.PI * 2;
  const phaseB = hashUnit(`${seed}-b`) * Math.PI * 2;
  const phaseC = hashUnit(`${seed}-c`) * Math.PI * 2;

  return (t) =>
    0.55 * Math.sin(2 * Math.PI * 3 * t + phaseA) +
    0.3 * Math.sin(2 * Math.PI * 7 * t + phaseB) +
    0.15 * Math.sin(2 * Math.PI * 13 * t + phaseC);
};

/** Where a fraction `t` of the way round the polygon's perimeter lands. */
const alongPerimeter = (points, t) => {
  const lengths = points.map((point, index) => {
    const next = points[(index + 1) % points.length];
    return Math.hypot(next.x - point.x, next.y - point.y);
  });
  const total = lengths.reduce((sum, length) => sum + length, 0);
  let travelled = t * total;

  for (let i = 0; i < points.length; i += 1) {
    if (travelled <= lengths[i] || i === points.length - 1) {
      const fraction = lengths[i] ? travelled / lengths[i] : 0;
      const a = points[i];
      const b = points[(i + 1) % points.length];
      return { x: a.x + (b.x - a.x) * fraction, y: a.y + (b.y - a.y) * fraction };
    }
    travelled -= lengths[i];
  }
  return points[0];
};

/**
 * Control points in, a lassoed outline out. Grid miles both ends.
 *
 * Resample the control polygon's perimeter evenly, then push each sample in or out along its
 * own radius from the middle. The result is an irregular polygon of `RING_POINTS` **sharp**
 * vertices that follows the control shape's envelope.
 *
 * ## The smoothing pass is gone, and that reverses this function's own argument
 *
 * It used to finish with a three-tap average over each vertex's neighbours, and the docstring
 * argued for it at length: without it the per-sample offsets are independent and the outline
 * reads as a jagged star, which is a shape no pointer has ever traced. That reasoning was
 * sound *at 44 samples*, where the wobble's spatial frequency is high enough to look like
 * noise rather than intent.
 *
 * It is reversed on instruction — *"the zones will have sharp corners, since it will be drawn
 * using the lasso tool"* — and the way to honour that without reintroducing the jagged star is
 * to change the sample count rather than to keep smoothing a dense ring. At 18 vertices the
 * wobble lands as a handful of visible corners on long straight edges: angular, deliberate,
 * and much closer to what a lasso leaves behind than a traced curve was. The wobble amplitude
 * came down with it (0.85 → 0.7 mi) because a corner exaggerates an offset that a smoothed
 * curve used to absorb.
 *
 * **The periodic wobble still matters, for its original reason.** The offset is applied around
 * a closed ring, so it has to return the same value at `t = 1` as at `t = 0` or the shape ends
 * with a step where the start and end fail to meet — and with no smoothing left to soften it,
 * that seam would now be a genuine notch rather than a rounded kink.
 *
 * Deterministic from the zone id, so the same zone is the same shape on every render, in every
 * session, and in the tests. A boundary that reshuffled itself when the map redrew would be
 * worse than an octagon.
 */
export const handDrawnRing = (controlPoints, seed) => {
  if (!controlPoints || controlPoints.length < 3) return [];

  const middle = controlPoints.reduce(
    (total, point) => ({
      x: total.x + point.x / controlPoints.length,
      y: total.y + point.y / controlPoints.length,
    }),
    { x: 0, y: 0 },
  );
  const noise = wobbleFor(seed);

  return Array.from({ length: RING_POINTS }, (_unused, index) => {
    const t = index / RING_POINTS;
    const base = alongPerimeter(controlPoints, t);
    const dx = base.x - middle.x;
    const dy = base.y - middle.y;
    const reach = Math.hypot(dx, dy) || 1;
    const push = noise(t) * WOBBLE_MILES;
    return { x: base.x + (dx / reach) * push, y: base.y + (dy / reach) * push };
  });
};

/**
 * Which days the narration has actually got to, at this step.
 *
 * ## Why this is matched rather than counted
 *
 * ② draws each day's route as the reveal announces it, which needs an answer to "has the
 * line about Wednesday been said yet". Three ways to get one:
 *
 * - **Proportion** — light `step / lineCount` of the days. Tried first, and it drifts by
 *   design: the narration is a fixed preamble, then one line per day, then a variable tail,
 *   so on the canonical week the map was a day and a half behind its own commentary. It
 *   read as the optimizer talking about Tuesday while drawing Monday, which is worse than
 *   drawing nothing.
 * - **A constant offset** — the sequencing lines start at index 3. Precise today, and a
 *   constant in a second file that has to be moved every time a line is added to the
 *   reveal. That is the drift the Workspace's own `MAP_STEP` avoids only by living beside
 *   the lines it indexes; here the lines live in a hook this shell does not own.
 * - **Matching**, which is what this does. The hook builds each sequencing line by
 *   interpolating `dayjs(date).format('ddd D')` from the runsheet itself, so the day label
 *   is in the string by construction — not by a copy of the wording kept in step.
 *
 * **The failure mode is the safe one.** If a line is reworded the label survives it, and if
 * one is removed altogether the day simply never announces itself during ② and its route
 * appears with the proposal. Nothing renders wrong; something renders late.
 *
 * Takes `formatDay` rather than importing dayjs, so the caller's own formatter is the one
 * that has to agree with the hook — which is the only agreement that matters here.
 */
export const announcedDates = ({ revealLines = [], step = 0, runsheets = [], formatDay }) =>
  runsheets
    .filter((sheet) => {
      const label = formatDay(sheet.date);
      const index = revealLines.findIndex((line) => line.includes(label));
      return index !== -1 && step >= index;
    })
    .map((sheet) => sheet.date);

/**
 * Every zone, with a ring to draw and a colour to draw it in.
 *
 * `settings` is passed rather than read here so the caller decides when the rule is
 * re-read — a component that read storage on every render would re-derive four rings a
 * frame while somebody drags the map. Defaults to the live rule for the convenience of
 * tests and one-off callers.
 *
 * `drawn` says which of the two sources answered. It is not decoration: a boundary the
 * planner drew is a statement about their territory and the seeded one is this fixture's
 * guess at it, and the map is entitled to say which it is showing.
 */
export const zoneRings = (settings = readHarmonizationSettings()) => {
  const saved = Array.isArray(settings?.zones) ? settings.zones : [];

  return ZONES.map((zone) => {
    const savedShape = saved.find((entry) => entry.id === zone.id)?.shape || null;

    let ring = null;
    if (savedShape?.kind === ZONE_SHAPE.BOUNDARY) ring = savedShape.points;
    else if (savedShape?.kind === ZONE_SHAPE.RADIUS) ring = radiusToRing(savedShape);

    const drawn = Boolean(ring);
    /* The seeded fallback goes through the lasso pass first — see `handDrawnRing`. A
       boundary somebody actually drew in Settings does not: it already *is* the shape
       their hand made, and roughening it further would be this module editing a planner's
       own work. */
    if (!drawn) ring = handDrawnRing(zone.shape, zone.id).map(gridToLatLng);

    return {
      id: zone.id,
      name: zone.name,
      color: zoneColor(zone.id),
      ring,
      drawn,
      centroid: ringCentroid(ring),
    };
  });
};
