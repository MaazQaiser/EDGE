/**
 * The seeded boundaries have to be *checkable*, or they are decoration.
 *
 * A hand-authored polygon around a cluster of hand-placed sites is exactly the kind of
 * thing that looks right in a diff and is wrong on screen — one vertex a mile short and a
 * site sits outside the zone that works it, which on this map reads as a bug in the
 * planner rather than a typo in a fixture. So the containment is asserted rather than
 * eyeballed: every site is inside its own zone and inside no other.
 *
 * That second half is the one worth having. Four convex-ish territories drawn freehand
 * around a 42-mile box overlap easily at the corners, and an overlap is invisible until
 * the day somebody moves a site into the seam. `zoneOfSite` cannot report it — membership
 * lives on the site, so the model has no way to notice that two shapes both cover it.
 */

import dayjs from 'dayjs';
import { pointInRing } from 'src/app/obx/pages/schedules/components/harmonize/tileProjection';
import { SITES, ZONES } from 'src/app/obx/pages/schedules/components/harmonizeFlow/model/fixtures';

import {
  announcedDates,
  ringCentroid,
  SITE_POINTS,
  ZONE_COLORS,
  zoneColor,
  zoneRings,
} from './zoneGeography';

/* The rule as it ships: four zones, none of them drawn. Passing it explicitly rather than
   letting the default read `localStorage` keeps the suite from depending on whatever a
   previous test — or a developer's own browser profile — happened to leave behind. */
const UNDRAWN = { zones: ZONES.map((zone) => ({ id: zone.id, name: zone.name, shape: null })) };

describe('zoneGeography', () => {
  describe('seeded boundaries', () => {
    it('gives every zone a ring with at least three points', () => {
      zoneRings(UNDRAWN).forEach((zone) => {
        expect(zone.ring.length).toBeGreaterThanOrEqual(3);
        expect(zone.drawn).toBe(false);
      });
    });

    it('adds corners to the fixture shape without becoming a curve', () => {
      /* The fixture holds seven or eight control points per zone; what reaches the map is
         resampled and wobbled. Two bounds, and they pull in opposite directions on purpose.

         **The lower bound** catches the lasso pass being bypassed — equal to the control
         count means the zones are plain octagons again.

         **The upper bound is the new one.** This assertion used to demand `> control * 4`,
         from when the ring was 44 points and smoothed into a curve. Sharp corners were asked
         for, so the ring is 18 and unsmoothed, and a *dense* ring is now the failure rather
         than the goal: past roughly 24 vertices the edges get too short to read as straight
         and the outline goes back to looking traced. */
      zoneRings(UNDRAWN).forEach((zone) => {
        const control = ZONES.find((entry) => entry.id === zone.id).shape.length;
        expect(zone.ring.length).toBeGreaterThan(control);
        expect(zone.ring.length).toBeLessThanOrEqual(24);
      });
    });

    it('turns a real corner at most vertices, rather than easing round them', () => {
      /* What "sharp" actually means, asserted rather than assumed. At each vertex, measure
         the turn between the incoming and outgoing edge; a smoothed ring turns a degree or
         two at a time, a lassoed polygon turns visibly. Requiring most vertices — not all —
         because a wobble that happens to push two neighbours the same way legitimately
         leaves one nearly straight, and pinning every vertex would make this test fail on a
         change to the noise phases that nothing else objects to. */
      zoneRings(UNDRAWN).forEach((zone) => {
        const ring = zone.ring;
        const turns = ring.map((point, index) => {
          const before = ring[(index - 1 + ring.length) % ring.length];
          const after = ring[(index + 1) % ring.length];
          const inbound = Math.atan2(point.lat - before.lat, point.lng - before.lng);
          const outbound = Math.atan2(after.lat - point.lat, after.lng - point.lng);
          let turn = Math.abs(outbound - inbound);
          if (turn > Math.PI) turn = 2 * Math.PI - turn;
          return (turn * 180) / Math.PI;
        });
        const sharp = turns.filter((degrees) => degrees > 8).length;
        expect(sharp).toBeGreaterThanOrEqual(Math.ceil(ring.length * 0.6));
      });
    });

    it('is the same shape every time it is asked', () => {
      /* Seeded, not random. A territory that reshuffled itself between renders would be
         worse than a clean polygon — it would read as the map being unable to decide. */
      const first = zoneRings(UNDRAWN).map((zone) => zone.ring);
      const second = zoneRings(UNDRAWN).map((zone) => zone.ring);
      expect(second).toEqual(first);
    });

    it('closes without a seam', () => {
      /* The wobble is applied around a closed ring, so the offset at the last point has to
         meet the offset at the first. A non-periodic noise leaves a step there — a notch
         always in the same place, which reads as a rendering fault rather than a hand. The
         final gap should be no larger than the ordinary spacing between samples. */
      zoneRings(UNDRAWN).forEach((zone) => {
        const gaps = zone.ring.map((point, index) => {
          const next = zone.ring[(index + 1) % zone.ring.length];
          return Math.hypot(next.lat - point.lat, next.lng - point.lng);
        });
        const closing = gaps[gaps.length - 1];
        const median = [...gaps].sort((a, b) => a - b)[Math.floor(gaps.length / 2)];
        expect(closing).toBeLessThan(median * 2.5);
      });
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

    it('puts no site inside a zone it does not belong to', () => {
      /**
       * **The shapes overlap on purpose and this still has to hold.**
       *
       * Membership lives on the site, so a site caught by two boundaries is not a data
       * error — `zoneOfSite` would resolve it the same way regardless. It is a *reading*
       * error: the map's whole claim is that you can see which territory a pin is in, and
       * a pin in the seam makes that claim false at exactly the moment somebody is trying
       * to work out why a move was refused for being in the wrong zone.
       *
       * So the overlaps are allowed to exist and are not allowed to contain anything.
       */
      const rings = zoneRings(UNDRAWN);

      SITE_POINTS.forEach((site) => {
        const trespassing = rings
          .filter((zone) => zone.id !== site.zoneId && pointInRing(site, zone.ring))
          .map((zone) => zone.id);

        expect({ site: site.name, trespassing }).toEqual({ site: site.name, trespassing: [] });
      });
    });

    it('does overlap its neighbours, because a lasso is not precise', () => {
      /* The inverse of the test above, and it is an assertion rather than a tolerance: if
         the territories ever come back perfectly disjoint, somebody has tidied them into
         the generated-looking shapes this pass deliberately replaced. Sampled on the ring
         points themselves — a vertex of one zone falling inside another is the cheapest
         honest evidence that the two intersect. */
      const rings = zoneRings(UNDRAWN);
      const overlapping = rings.filter((zone) =>
        rings.some(
          (other) =>
            other.id !== zone.id && zone.ring.some((point) => pointInRing(point, other.ring)),
        ),
      );

      expect(overlapping.length).toBeGreaterThanOrEqual(2);
    });

    it('never stacks more than two territories over the same ground', () => {
      /**
       * **The limit on the overlap, now that overlap is the point.**
       *
       * This replaces an assertion that the base sat outside every zone. That was written
       * when the boundaries were disjoint, and it stopped being either true or interesting
       * the moment they were drawn to run into each other — the depot is at the origin, the
       * territories now reach the middle of the book, and a depot inside the territory it
       * mostly serves is what a real franchise looks like. It is drawn as a ring rather
       * than a pin, so it was never going to read as somebody's stop.
       *
       * What does still need holding is the *visual* consequence. The fills are translucent
       * and they compound: two at 0.18 read as about 0.33, which is a legible seam, and
       * three read as a bruise in the middle of the map with no zone identifiably under it.
       * Two is the most any point may carry.
       *
       * Sampled over every ring vertex, every site and the base — the vertices are where
       * the shapes actually reach, so they are where a three-way pile-up would first show.
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
  });

  describe('the saved rule wins', () => {
    it('prefers a boundary drawn in Settings over the seed', () => {
      const drawnRing = [
        { lat: 28.5, lng: -82.9 },
        { lat: 28.6, lng: -82.8 },
        { lat: 28.5, lng: -82.7 },
      ];

      const north = zoneRings({
        zones: [{ id: 'north', name: 'North', shape: { kind: 'boundary', points: drawnRing } }],
      }).find((zone) => zone.id === 'north');

      expect(north.ring).toEqual(drawnRing);
      expect(north.drawn).toBe(true);
    });

    it('reads a saved radius out as a closed ring', () => {
      const east = zoneRings({
        zones: [
          {
            id: 'east',
            name: 'East',
            shape: {
              kind: 'radius',
              siteId: 'langford',
              anchor: { address: 'Langford Textiles', lat: 28.13, lng: -82.18 },
              radiusMiles: 6,
            },
          },
        ],
      }).find((zone) => zone.id === 'east');

      expect(east.drawn).toBe(true);
      expect(east.ring.length).toBe(48);
      /* Six miles north of the anchor, give or take the rounding in 69 miles a degree. */
      const north = east.ring.reduce((top, point) => (point.lat > top.lat ? point : top));
      expect(north.lat - 28.13).toBeCloseTo(6 / 69, 3);
    });

    it('falls back to the seed for a radius with no usable anchor', () => {
      const south = zoneRings({
        zones: [
          { id: 'south', name: 'South', shape: { kind: 'radius', anchor: null, radiusMiles: 4 } },
        ],
      }).find((zone) => zone.id === 'south');

      expect(south.drawn).toBe(false);
      expect(south.ring.length).toBeGreaterThanOrEqual(3);
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
