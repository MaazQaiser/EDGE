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
 * ## A zone is a radius
 *
 * **Not a boundary.** Every zone on this map is a distance around a point, and the lassoed
 * outline this module used to draw is gone — see the note above `circleRing`. A radius set
 * in Settings wins outright; a boundary saved there is read as the circle that encloses it;
 * failing both, the circle is derived from the sites that belong to the zone.
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
 * ── Zones are circles ──────────────────────────────────────────────────────────────
 *
 * **The radius solution, not the boundary one.** A zone on this map is a distance around a
 * point, and that is now the *only* thing it can be. The lassoed polygon this module used
 * to draw — 18 wobbled vertices resampled off the fixture's control points, with three
 * harmonics of seeded noise to make it look hand-drawn — is gone, along with the whole
 * argument for it. It was a good drawing of the wrong model.
 *
 * Two consequences worth stating rather than discovering:
 *
 * - **A boundary saved in Settings is read as its enclosing circle**, not as the shape
 *   somebody drew. That is a real loss of fidelity and it is deliberate: a surface that
 *   drew one zone as a traced outline and its neighbour as a circle would be showing two
 *   different definitions of the word *zone* on the same screen. Settings still offers both
 *   methods; this map states the radius reading of whichever it finds.
 * - **`ZONES[].shape` in the fixture is no longer read.** Its control points only ever
 *   existed to be lassoed. The circle comes from the zone's **sites** instead, which is the
 *   more honest source anyway — membership lives on the site (`zoneId`), so the sites *are*
 *   the zone, and a circle derived from them cannot leave one of its own sites outside it.
 */

/**
 * A circle, read out as a closed ring.
 *
 * The map draws one kind of thing — a closed path — so a circle is turned into a polygon
 * here rather than the renderer growing a second shape branch. That also keeps every
 * downstream consumer untouched: `ringCentroid`, the view fit, and the map's own
 * ray-casting hit test all take a list of points and none of them needs to learn what a
 * radius is.
 *
 * **96 segments, up from 48.** A polygon standing in for a circle has to survive the
 * closest zoom the map offers, and at 48 a twenty-mile ring shows visible flats on its
 * shoulders — which reads as a *shape* again, which is the one thing this change exists to
 * stop. 96 is 3.75° per segment: indistinguishable from round at `MAX_ZOOM`, and still a
 * trivial path.
 *
 * The longitude term widens by the cosine of the latitude, the same flat-earth assumption
 * the projection this file imports already makes.
 */
const RADIUS_RING_SEGMENTS = 96;
const MILES_PER_DEGREE_LAT = 69.0;

const circleRing = (centre, radiusMiles) => {
  const miles = Number(radiusMiles);
  if (!centre || !Number.isFinite(miles) || miles <= 0) return null;

  const perDegreeLng = MILES_PER_DEGREE_LAT * Math.cos((centre.lat * Math.PI) / 180);

  return Array.from({ length: RADIUS_RING_SEGMENTS }, (_unused, index) => {
    const angle = (index / RADIUS_RING_SEGMENTS) * 2 * Math.PI;
    return {
      lat: centre.lat + (miles * Math.sin(angle)) / MILES_PER_DEGREE_LAT,
      lng: centre.lng + (miles * Math.cos(angle)) / perDegreeLng,
    };
  });
};

/** Miles between two points on the flat-earth reading this module already uses. */
const milesBetween = (a, b) => {
  const dLat = (a.lat - b.lat) * MILES_PER_DEGREE_LAT;
  const dLng =
    (a.lng - b.lng) * MILES_PER_DEGREE_LAT * Math.cos((((a.lat + b.lat) / 2) * Math.PI) / 180);
  return Math.hypot(dLat, dLng);
};

/**
 * How much air a derived circle leaves outside its furthest site.
 *
 * A circle drawn exactly through the outermost site puts that pin *on* the boundary, which
 * looks like a rounding error rather than a territory — and a zone is the ground a van covers,
 * not the convex hull of the addresses currently on the books.
 *
 * **4.5 miles, up from 1.5, and the extra three are for the neighbours rather than the pins.**
 * At 1.5 every circle cleared its own sites comfortably and the set came out *completely
 * disjoint* — three islands with four-to-ten miles of no-man's-land between them, which is not
 * what a franchise's ground looks like and read as three unrelated areas rather than as one
 * book divided up. Asked for directly: *"make the radiuses overlap a little."*
 *
 * The figures, measured rather than guessed (centre-to-centre distance minus the two radii):
 *
 * | Pair | Was | Now |
 * | --- | --- | --- |
 * | East ↔ South | 3.30 mi apart | **2.70 mi of overlap** |
 * | North ↔ East | 4.78 mi apart | **1.22 mi of overlap** |
 * | North ↔ South | 10.36 mi apart | 4.36 mi apart |
 *
 * **North and South staying apart is the right answer, not an unfinished one.** Their centres
 * are 28.7 miles apart — they are not neighbours — and closing that gap needs another 2.2 miles
 * on every radius, which takes East ↔ South to a seven-mile lens. Adjacent territories touch;
 * the two ends of the book do not.
 *
 * The containment tests are what hold the upper bound: past roughly this figure a circle starts
 * capturing a neighbour's sites, and three-way stacking turns the fills to mud.
 */
const RADIUS_PADDING_MILES = 4.5;

/**
 * The smallest radius a derived circle is allowed to have.
 *
 * Two sites four hundred yards apart are a real answer from a real deployment, and the
 * circle around them would be a dot. A zone that cannot be seen cannot be clicked, and this
 * map's whole selection model is clicking a zone.
 */
const RADIUS_MIN_DERIVED_MILES = 3;

/**
 * A zone's circle, derived from the sites that belong to it.
 *
 * The centre is the **mean of the sites**, not the middle of their bounding box: the box's
 * centre is decided entirely by the two extremes and ignores where the work actually is, so
 * a zone with a tight cluster and one outlier would be centred half way out to the outlier.
 * The mean is pulled by the cluster, which is where the van spends its day.
 *
 * The radius is then whatever reaches the furthest site, plus air. Derived per zone rather
 * than shared, because the fixture's zones are genuinely different sizes and one radius for
 * all of them would be this module inventing a fact.
 */
export const deriveZoneCircle = (zoneId) => {
  const points = SITE_POINTS.filter((site) => site.zoneId === zoneId);
  if (!points.length) return null;

  const centre = {
    lat: points.reduce((total, point) => total + point.lat, 0) / points.length,
    lng: points.reduce((total, point) => total + point.lng, 0) / points.length,
  };
  const reach = points.reduce((most, point) => Math.max(most, milesBetween(centre, point)), 0);

  return {
    centre,
    radiusMiles: Math.max(reach + RADIUS_PADDING_MILES, RADIUS_MIN_DERIVED_MILES),
  };
};

/**
 * A shape saved in Settings, read as a circle.
 *
 * A saved **radius** is already one, and is taken at its word. A saved **boundary** is
 * reduced to the circle that encloses it — centred on the outline's own area centroid, so
 * the reading is anchored to the shape's middle rather than to a vertex, and wide enough to
 * contain every point the planner drew. No padding is added here: unlike the derived case
 * there is nothing to be generous about, the planner has already said where the edge is.
 */
const savedShapeCircle = (shape) => {
  if (!shape) return null;

  if (shape.kind === ZONE_SHAPE.RADIUS) {
    const miles = Number(shape.radiusMiles);
    if (!shape.anchor || !Number.isFinite(miles) || miles <= 0) return null;
    return { centre: shape.anchor, radiusMiles: miles };
  }

  if (shape.kind === ZONE_SHAPE.BOUNDARY) {
    const points = Array.isArray(shape.points) ? shape.points : [];
    if (points.length < 3) return null;
    const centre = ringCentroid(points);
    if (!centre) return null;
    const reach = points.reduce((most, point) => Math.max(most, milesBetween(centre, point)), 0);
    if (!(reach > 0)) return null;
    return { centre, radiusMiles: reach };
  }

  return null;
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
 * Every zone, with a circle to draw and a colour to draw it in.
 *
 * `settings` is passed rather than read here so the caller decides when the rule is
 * re-read — a component that read storage on every render would re-derive four circles a
 * frame while somebody drags the map. Defaults to the live rule for the convenience of
 * tests and one-off callers.
 *
 * Each zone comes back with **both readings of its geometry**: `centre` and `radiusMiles`,
 * which is what it now *is*, and `ring`, which is that circle flattened to a path so the
 * renderer and the hit test do not have to change. The ring is derived from the pair, never
 * the other way round.
 *
 * `drawn` says which of the two sources answered — a radius the planner set in Settings, or
 * this module's own reading of where their sites are. It is not decoration: one is a
 * statement about their territory and the other is an inference from the work in it, and the
 * map is entitled to say which it is showing.
 */
export const zoneRings = (settings = readHarmonizationSettings()) => {
  const saved = Array.isArray(settings?.zones) ? settings.zones : [];

  return ZONES.map((zone) => {
    const savedShape = saved.find((entry) => entry.id === zone.id)?.shape || null;
    const fromSettings = savedShapeCircle(savedShape);
    const circle = fromSettings || deriveZoneCircle(zone.id);
    const ring = circle ? circleRing(circle.centre, circle.radiusMiles) : null;

    return {
      id: zone.id,
      name: zone.name,
      color: zoneColor(zone.id),
      centre: circle?.centre || null,
      radiusMiles: circle?.radiusMiles || null,
      ring: ring || [],
      drawn: Boolean(fromSettings),
      /* The circle's own centre, not a computed centroid — they agree to within floating
         point, and the centre is the one that is true by construction. */
      centroid: circle?.centre || null,
    };
  });
};
