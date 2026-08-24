/**
 * The circles have to be *checkable*, or they are decoration.
 *
 * A zone is a radius around a point (`zoneRings`), and where that point and that radius come
 * from is arithmetic over hand-placed fixture sites — exactly the kind of thing that looks
 * right in a diff and is wrong on screen. One site half a mile outside the circle that claims
 * it, and the map reads as a bug in the planner rather than as a fixture a nudge short. So
 * containment is asserted rather than eyeballed: every site is inside its own circle and
 * inside no other.
 *
 * That second half is the one worth having. `zoneOfSite` cannot report a site caught by two
 * territories — membership lives on the site, so the model has no way to notice — and it is
 * invisible until the day somebody has to explain why a move was refused for being in the
 * wrong zone.
 *
 * **What this suite used to be about.** Every assertion here was previously about a *lassoed
 * polygon*: that the ring had more corners than the fixture's control shape, that most
 * vertices turned a real angle rather than easing round, that the seeded wobble closed without
 * a seam, and that the territories genuinely overlapped because a hand-drawn boundary is not
 * precise. None of those questions exist any more — the shape is a circle, it has no control
 * points, no wobble and no seam — so they are gone rather than adapted. The two that survive
 * in spirit are containment and the cap on how many translucent fills may stack.
 */

import dayjs from 'dayjs';
import { pointInRing } from 'src/app/obx/pages/schedules/components/harmonize/tileProjection';
import { SITES, ZONES } from 'src/app/obx/pages/schedules/components/harmonizeFlow/model/fixtures';

import {
  announcedDates,
  deriveZoneCircle,
  ringCentroid,
  SITE_POINTS,
  ZONE_COLORS,
  zoneColor,
  zoneRings,
} from './zoneGeography';

/* The rule as it ships: four zones, none of them set. Passing it explicitly rather than
   letting the default read `localStorage` keeps the suite from depending on whatever a
   previous test — or a developer's own browser profile — happened to leave behind. */
const UNDRAWN = { zones: ZONES.map((zone) => ({ id: zone.id, name: zone.name, shape: null })) };

/** The flat-earth miles this module measures in, so a test can check a radius. */
const MILES_PER_DEGREE_LAT = 69.0;
const milesBetween = (a, b) => {
  const dLat = (a.lat - b.lat) * MILES_PER_DEGREE_LAT;
  const dLng =
    (a.lng - b.lng) * MILES_PER_DEGREE_LAT * Math.cos((((a.lat + b.lat) / 2) * Math.PI) / 180);
  return Math.hypot(dLat, dLng);
};

describe('zoneGeography', () => {
  describe('derived circles', () => {
    it('gives every zone a centre, a radius and a ring to draw it with', () => {
      zoneRings(UNDRAWN).forEach((zone) => {
        expect(zone.drawn).toBe(false);
        expect(Number.isFinite(zone.centre.lat)).toBe(true);
        expect(Number.isFinite(zone.centre.lng)).toBe(true);
        expect(zone.radiusMiles).toBeGreaterThan(0);
        expect(zone.ring.length).toBe(96);
      });
    });

    it('is actually round, not a polygon that happens to be closed', () => {
      /* The renderer draws a `<polygon>`, so the only thing making it a circle is that every
         vertex is the same distance from the centre. Half a percent of tolerance covers the
         cosine term's own approximation and nothing else — a ring built from the wrong centre,
         or scaled on one axis, misses this by whole miles. */
      zoneRings(UNDRAWN).forEach((zone) => {
        zone.ring.forEach((point) => {
          expect(milesBetween(point, zone.centre) / zone.radiusMiles).toBeCloseTo(1, 2);
        });
      });
    });

    it('is the same circle every time it is asked', () => {
      /* Derived, not random — but worth pinning anyway: a territory that moved between
         renders would read as the map being unable to decide. */
      expect(zoneRings(UNDRAWN)).toEqual(zoneRings(UNDRAWN));
    });

    it('puts every site inside its own zone', () => {
      const rings = Object.fromEntries(zoneRings(UNDRAWN).map((zone) => [zone.id, zone.ring]));

      SITE_POINTS.forEach((site) => {
        expect({
          site: site.name,
          zone: site.zoneId,
          inside: pointInRing(site, rings[site.zoneId]),
        }).toEqual({ site: site.name, zone: site.zoneId, inside: true });
      });
    });

    it('leaves air outside the furthest site rather than drawing through it', () => {
      /* A circle whose edge passes through its outermost pin looks like a rounding error, and
         a zone is the ground a van covers rather than the convex hull of the addresses
         currently on the books. The padding is what makes containment *look* like
         containment, so it is asserted and not just commented. */
      zoneRings(UNDRAWN).forEach((zone) => {
        const reach = SITE_POINTS.filter((site) => site.zoneId === zone.id).reduce(
          (most, site) => Math.max(most, milesBetween(zone.centre, site)),
          0,
        );
        expect(zone.radiusMiles).toBeGreaterThan(reach + 1);
      });
    });

    it('puts no site inside a zone it does not belong to', () => {
      /**
       * **The one assertion that carried straight across from the boundary suite.**
       *
       * A site caught by two territories is not a data error — `zoneOfSite` resolves it off
       * the site either way. It is a *reading* error: the map's whole claim is that you can
       * see which territory a pin is in, and a pin in a seam makes that claim false at
       * exactly the moment somebody is working out why a move was refused.
       *
       * Circles make this easier to hold than lassoed outlines did, not harder — the derived
       * set is currently disjoint (see the test below), so there are no seams to fall into.
       */
      const rings = zoneRings(UNDRAWN);

      SITE_POINTS.forEach((site) => {
        const trespassing = rings
          .filter((zone) => zone.id !== site.zoneId && pointInRing(site, zone.ring))
          .map((zone) => zone.id);

        expect({ site: site.name, trespassing }).toEqual({ site: site.name, trespassing: [] });
      });
    });

    it('never stacks more than two territories over the same ground', () => {
      /**
       * **The limit on overlap, which for circles is a ceiling rather than a target.**
       *
       * The boundary suite asserted that the territories *did* overlap, because a hand-drawn
       * lasso that came back perfectly disjoint meant somebody had tidied it into the
       * generated-looking shape that pass existed to avoid. A circle has no such tell, and
       * the derived set at these radii does not overlap at all — which is a better answer,
       * not a suspicious one.
       *
       * What still needs holding is the visual consequence, because a planner can set any
       * radius they like in Settings. The fills are translucent and they compound: two at
       * 0.18 read as about 0.33, a legible seam, and three read as a bruise with no zone
       * identifiably under it. Two is the most any point may carry.
       *
       * Sampled over every ring vertex, every site and the base — the vertices are where the
       * shapes actually reach, so they are where a pile-up would first show.
       */
      const rings = zoneRings(UNDRAWN);
      const samples = [
        ...rings.flatMap((zone) => zone.ring),
        ...SITE_POINTS,
        { lat: 28.0587, lng: -82.4572 },
      ];

      const worst = samples.reduce((most, point) => {
        const inside = rings.filter((zone) => pointInRing(point, zone.ring)).length;
        return Math.max(most, inside);
      }, 0);

      expect(worst).toBeLessThanOrEqual(2);
    });

    it('is centred on where the work is, not half way out to the outlier', () => {
      /* The mean of the sites, not the middle of their bounding box. North is the case that
         tells them apart: a tight trio near base plus one site well to the north, so the box
         centre sits noticeably further out than the mean does. */
      const north = deriveZoneCircle('north');
      const sites = SITE_POINTS.filter((site) => site.zoneId === 'north');
      const boxCentre = {
        lat: (Math.min(...sites.map((s) => s.lat)) + Math.max(...sites.map((s) => s.lat))) / 2,
        lng: (Math.min(...sites.map((s) => s.lng)) + Math.max(...sites.map((s) => s.lng))) / 2,
      };

      const meanReach = sites.reduce(
        (most, site) => Math.max(most, milesBetween(north.centre, site)),
        0,
      );
      const boxReach = sites.reduce(
        (most, site) => Math.max(most, milesBetween(boxCentre, site)),
        0,
      );
      expect(meanReach).toBeLessThanOrEqual(boxReach);
    });

    it('has nothing to derive for a zone with no sites', () => {
      expect(deriveZoneCircle('nowhere')).toBeNull();
    });
  });

  describe('the saved rule wins', () => {
    it('takes a saved radius at its word', () => {
      const east = zoneRings({
        zones: [
          {
            id: 'east',
            name: 'East',
            shape: {
              kind: 'radius',
              anchor: { address: 'Langford Textiles', lat: 28.13, lng: -82.18 },
              radiusMiles: 6,
            },
          },
        ],
      }).find((zone) => zone.id === 'east');

      expect(east.drawn).toBe(true);
      expect(east.radiusMiles).toBe(6);
      expect(east.centre).toEqual({ address: 'Langford Textiles', lat: 28.13, lng: -82.18 });
      expect(east.ring.length).toBe(96);
      /* Six miles north of the anchor, give or take the rounding in 69 miles a degree. */
      const top = east.ring.reduce((highest, point) => (point.lat > highest.lat ? point : highest));
      expect(top.lat - 28.13).toBeCloseTo(6 / 69, 3);
    });

    it('reads a boundary drawn in Settings as the circle that encloses it', () => {
      /**
       * **A deliberate loss of fidelity, and the reason is on the module.** The planner drew
       * an outline and this map shows a circle round it, because a surface that drew one zone
       * traced and its neighbour as a circle would be showing two different definitions of
       * the word *zone* at once.
       *
       * What has to hold is that the reading is *generous*: every point they drew is inside
       * the circle. A circle that clipped a corner off their own boundary would be worse than
       * either shape on its own.
       */
      const drawnRing = [
        { lat: 28.5, lng: -82.9 },
        { lat: 28.62, lng: -82.78 },
        { lat: 28.54, lng: -82.62 },
        { lat: 28.44, lng: -82.74 },
      ];

      const north = zoneRings({
        zones: [{ id: 'north', name: 'North', shape: { kind: 'boundary', points: drawnRing } }],
      }).find((zone) => zone.id === 'north');

      expect(north.drawn).toBe(true);
      expect(north.ring.length).toBe(96);
      expect(north.centre).toEqual(ringCentroid(drawnRing));
      /* Measured against the radius rather than with `pointInRing`, and the difference is the
         point: the circle is defined *through* the outermost vertex, so that one vertex is
         exactly on the arc and a strict inside-test rejects it. Every other point they drew is
         strictly within. `<=` is the correct relation for "encloses". */
      drawnRing.forEach((point) => {
        expect(milesBetween(point, north.centre)).toBeLessThanOrEqual(north.radiusMiles + 1e-9);
      });
    });

    it('falls back to the derived circle for a radius with no usable anchor', () => {
      const south = zoneRings({
        zones: [
          { id: 'south', name: 'South', shape: { kind: 'radius', anchor: null, radiusMiles: 4 } },
        ],
      }).find((zone) => zone.id === 'south');

      expect(south.drawn).toBe(false);
      expect(south.radiusMiles).toBeCloseTo(deriveZoneCircle('south').radiusMiles, 6);
    });

    it('falls back for a boundary too short to enclose anything', () => {
      const west = zoneRings({
        zones: [
          {
            id: 'west',
            name: 'West',
            shape: { kind: 'boundary', points: [{ lat: 28.1, lng: -82.7 }] },
          },
        ],
      }).find((zone) => zone.id === 'west');

      expect(west.drawn).toBe(false);
      expect(west.ring.length).toBe(96);
    });
  });

  describe('colours', () => {
    it('gives each of the four zones its own hue', () => {
      const hues = ZONES.map((zone) => zoneColor(zone.id));
      expect(new Set(hues).size).toBe(ZONES.length);
    });

    it('keys colour to the zone rather than to its position', () => {
      /* The guarantee that matters: narrowing the range so only two zones are worked must
         not repaint them. Reading the map by colour is only possible if a colour means one
         zone for as long as the screen is open. */
      expect(zoneColor('west')).toBe(ZONE_COLORS.west);
      expect(zoneColor('north')).toBe(ZONE_COLORS.north);
    });

    it('does not invent a hue for a zone it has never heard of', () => {
      expect(ZONE_COLORS['zone-from-the-api']).toBeUndefined();
      expect(zoneColor('zone-from-the-api')).toBe('#6A6A70');
    });
  });

  describe('ringCentroid', () => {
    it('finds the middle of a square', () => {
      const centre = ringCentroid([
        { lat: 0, lng: 0 },
        { lat: 0, lng: 2 },
        { lat: 2, lng: 2 },
        { lat: 2, lng: 0 },
      ]);
      expect(centre.lat).toBeCloseTo(1, 6);
      expect(centre.lng).toBeCloseTo(1, 6);
    });

    it('is not dragged by a crowd of vertices along one edge', () => {
      /* The lasso case. A freehand drag samples one side far more densely than another, so
         a vertex mean drifts toward whichever edge the planner traced slowest — here, six
         points along the bottom against two at the top. The area centroid does not care. */
      const centre = ringCentroid([
        { lat: 0, lng: 0 },
        { lat: 0, lng: 0.4 },
        { lat: 0, lng: 0.8 },
        { lat: 0, lng: 1.2 },
        { lat: 0, lng: 1.6 },
        { lat: 0, lng: 2 },
        { lat: 2, lng: 2 },
        { lat: 2, lng: 0 },
      ]);
      expect(centre.lat).toBeCloseTo(1, 6);
    });

    it('falls back to the vertex mean rather than dividing by zero', () => {
      const centre = ringCentroid([
        { lat: 0, lng: 0 },
        { lat: 1, lng: 1 },
        { lat: 2, lng: 2 },
      ]);
      expect(centre).toEqual({ lat: 1, lng: 1 });
    });

    it('has nothing to say about an empty ring', () => {
      expect(ringCentroid([])).toBeNull();
    });
  });

  /**
   * The seam between what ② *says* and what the map *draws*.
   *
   * This is the one piece of coupling in the shell that a change somewhere else could break
   * silently — the hook owns the narration and this shell reads it — so the contract is
   * pinned rather than trusted. The lines below are the shape `useHarmonizeFlow` actually
   * produces on the canonical week: three fixed lines, then one per runsheet, then a tail.
   */
  describe('announcedDates', () => {
    const LINES = [
      'Reading 15 visits and their need-by windows',
      'Matching each site to one of 3 zones',
      'Finding the legal days for every visit',
      'Sequencing Mon 17 — 3 stops',
      'Sequencing Tue 18 — 4 stops',
      'Sequencing Wed 19 — 5 stops',
      'Checking every day against its shift',
      '1 visit has a day but no hours on it',
    ];
    const SHEETS = [{ date: '2026-08-17' }, { date: '2026-08-18' }, { date: '2026-08-19' }];
    const formatDay = (date) => dayjs(date).format('ddd D');
    const at = (step) => announcedDates({ revealLines: LINES, step, runsheets: SHEETS, formatDay });

    it('announces nothing during the preamble', () => {
      expect(at(0)).toEqual([]);
      expect(at(2)).toEqual([]);
    });

    it('announces each day exactly on the line that names it', () => {
      /* The failure this replaces: a proportional gate lit one day while the narration was
         already talking about the second, so the map was reliably a day behind its own
         commentary on this very week. */
      expect(at(3)).toEqual(['2026-08-17']);
      expect(at(4)).toEqual(['2026-08-17', '2026-08-18']);
      expect(at(5)).toEqual(['2026-08-17', '2026-08-18', '2026-08-19']);
    });

    it('keeps every day announced through the tail', () => {
      expect(at(7)).toEqual(['2026-08-17', '2026-08-18', '2026-08-19']);
    });

    it('fails closed when a line it was matching disappears', () => {
      /* A reworded line still carries the label, because the hook interpolates it. A line
         that is gone entirely leaves its day undrawn until ③ — late, never wrong. */
      const without = LINES.filter((line) => !line.includes('Tue 18'));
      expect(
        announcedDates({ revealLines: without, step: 7, runsheets: SHEETS, formatDay }),
      ).toEqual(['2026-08-17', '2026-08-19']);
    });

    it('has no gate to apply when there are no runsheets', () => {
      expect(announcedDates({ revealLines: LINES, step: 5, runsheets: [], formatDay })).toEqual([]);
    });
  });

  it('projects every site onto the same anchor the fixture is placed around', () => {
    /* Tampa, which is where `DEMO_ANCHOR` puts the base. A projection that quietly changed
       anchors would still pass every containment test above — the sites and the boundaries
       would move together — and would put the whole territory in the wrong state. */
    expect(SITE_POINTS.length).toBe(SITES.length);
    SITE_POINTS.forEach((site) => {
      expect(site.lat).toBeGreaterThan(27.5);
      expect(site.lat).toBeLessThan(28.5);
      expect(site.lng).toBeGreaterThan(-83.0);
      expect(site.lng).toBeLessThan(-82.0);
    });
  });
});
