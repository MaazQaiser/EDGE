/**
 * The sites this screen draws zones around, placed on real coordinates.
 *
 * **Why this file exists at all.** The harmonize flow's fixture
 * (`harmonizeFlow/model/fixtures.js`) places its fifteen sites on a *notional flat
 * grid* in miles — `{ x, y }` about a base at the origin — and says so plainly,
 * because the flow only ever needs relative distance to price a leg. That is the
 * right model for a planner and the wrong one for this screen: Settings already
 * deals in real latitude and longitude (`startLocation` is geocoded, the picker is
 * a street map, `resolveHarmonizeRule` compares haversine kilometres), and a zone
 * boundary drawn over a grid that is not a place cannot be drawn over streets.
 *
 * So the grid is *projected* rather than replaced. `x`/`y` stay exactly as the
 * fixture wrote them — nothing in the flow changes, and moving a site is still
 * moving a site in one file — and this module reads them out as coordinates around
 * the same demo anchor the settings screen already falls back to for its start
 * point. That last part is the load-bearing bit: if the zone map and the start
 * location sat on different anchors, every distance the screen showed would be
 * wrong in the same direction, which reads as a broken optimizer rather than a bad
 * default. One anchor, one geography.
 *
 * Demo scaffolding, and it says so: delete this alongside `demoVisits` and the
 * fixture once sites carry their own coordinates from the API. Nothing above it
 * knows that it is derived.
 */

import { DEMO_ANCHOR } from 'src/app/obx/pages/schedules/components/harmonize/demoVisits';
import {
  SITES,
  VISITS,
  ZONES,
} from 'src/app/obx/pages/schedules/components/harmonizeFlow/model/fixtures';

/**
 * Miles to a degree, at the anchor's latitude.
 *
 * A degree of latitude is 69 miles very nearly everywhere; a degree of longitude
 * shrinks by the cosine of the latitude it is measured at. Both are evaluated once,
 * at the anchor, rather than per site — which is the same flat-earth assumption the
 * fixture's own grid already makes, and over a forty-mile box the error is smaller
 * than the accuracy the fixture claims for its notional miles in the first place.
 * Doing it per site would imply a precision the underlying `x`/`y` do not have.
 */
const MILES_PER_DEGREE_LAT = 69.0;
const MILES_PER_DEGREE_LNG = MILES_PER_DEGREE_LAT * Math.cos((DEMO_ANCHOR.lat * Math.PI) / 180);

/** The fixture's grid origin is its base, so the anchor is where `{ x: 0, y: 0 }` lands. */
export const ZONE_GEO_ANCHOR = DEMO_ANCHOR;

export const gridToLatLng = ({ x = 0, y = 0 } = {}) => ({
  lat: DEMO_ANCHOR.lat + y / MILES_PER_DEGREE_LAT,
  lng: DEMO_ANCHOR.lng + x / MILES_PER_DEGREE_LNG,
});

/**
 * Filters per site, summed across the week's visits.
 *
 * The cost model is `10 + 20 × filters`, so filter count — not site count — is what
 * a zone actually costs a day. A zone editor that reports "4 sites" and nothing else
 * is hiding the number that decides whether the day fits, which is §14.4's complaint
 * about the flow's own headline metric. Summed rather than taken from one visit
 * because a site can be visited twice in a range.
 */
const filtersBySite = VISITS.reduce((total, visit) => {
  const id = visit.siteId;
  const count = Number(visit.filterCount);
  if (!id || !Number.isFinite(count)) return total;
  total[id] = (total[id] || 0) + count;
  return total;
}, {});

/**
 * The site book: the fixture's own records, plus coordinates and a filter total.
 *
 * `zoneId` is carried through as the fixture's *default* assignment. It is not the
 * answer this screen reads — see `zoneOfSite` in `harmonizationSettings`, which lets
 * a saved rule override it — but it is the state a franchise that never opens this
 * screen plans against, which is what makes shipping the section safe.
 */
export const ZONE_SITES = SITES.map((site) => ({
  id: site.id,
  name: site.name,
  company: site.company,
  defaultZoneId: site.zoneId || null,
  filters: filtersBySite[site.id] || 0,
  ...gridToLatLng(site),
}));

export const ZONE_DEFINITIONS = ZONES;

export const siteById = (id) => ZONE_SITES.find((site) => site.id === id) || null;
