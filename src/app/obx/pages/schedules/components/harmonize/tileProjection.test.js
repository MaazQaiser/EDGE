import {
  fitView,
  MAX_ZOOM,
  metresPerPixel,
  MIN_ZOOM,
  pointInRing,
  project,
  simplifyPath,
  simplifyToBudget,
  tilesFor,
  unproject,
} from './tileProjection';

/**
 * The geometry two maps now share, so a mistake here is a mistake in both.
 *
 * `pointInRing` gets the most attention because it is the one function whose wrongness is
 * invisible: a projection that is off shows up as a map that looks wrong, and a
 * containment test that is off shows up as a zone quietly holding the wrong sites.
 */
describe('project / unproject', () => {
  it('round-trips a coordinate at every zoom the renderer offers', () => {
    const place = { lat: 28.0587, lng: -82.4572 };

    for (let zoom = MIN_ZOOM; zoom <= MAX_ZOOM; zoom += 1) {
      const { x, y } = project(place.lat, place.lng, zoom);
      const back = unproject(x, y, zoom);

      expect(back.lat).toBeCloseTo(place.lat, 9);
      expect(back.lng).toBeCloseTo(place.lng, 9);
    }
  });

  it('puts the null island at the centre of the world', () => {
    /* Zoom 0 is one 256px tile, so 0,0 is its middle. A sign error anywhere in the
       projection moves this and nothing else would notice. */
    expect(project(0, 0, 0)).toEqual({ x: 128, y: 128 });
  });

  it('puts north above south and east right of west', () => {
    const north = project(40, 0, 10);
    const south = project(20, 0, 10);
    const east = project(0, 40, 10);
    const west = project(0, 20, 10);

    expect(north.y).toBeLessThan(south.y);
    expect(east.x).toBeGreaterThan(west.x);
  });
});

describe('fitView', () => {
  it('zooms in further for a tighter cluster', () => {
    const tight = fitView(
      [
        { lat: 28.05, lng: -82.45 },
        { lat: 28.06, lng: -82.44 },
      ],
      800,
      400,
    );
    const loose = fitView(
      [
        { lat: 27.5, lng: -83.5 },
        { lat: 28.6, lng: -81.4 },
      ],
      800,
      400,
    );

    expect(tight.zoom).toBeGreaterThan(loose.zoom);
  });

  it('centres on the middle of the span, not the first point', () => {
    const { center } = fitView(
      [
        { lat: 28.0, lng: -82.6 },
        { lat: 28.4, lng: -82.2 },
      ],
      800,
      400,
    );

    expect(center.lat).toBeGreaterThan(28.0);
    expect(center.lat).toBeLessThan(28.4);
    expect(center.lng).toBeGreaterThan(-82.6);
    expect(center.lng).toBeLessThan(-82.2);
  });

  it('falls back to the widest zoom on a span nothing can hold', () => {
    const { zoom } = fitView(
      [
        { lat: 80, lng: -179 },
        { lat: -80, lng: 179 },
      ],
      200,
      200,
    );

    expect(zoom).toBe(MIN_ZOOM);
  });
});

describe('metresPerPixel', () => {
  it('halves with every extra zoom level', () => {
    expect(metresPerPixel(0, 11)).toBeCloseTo(metresPerPixel(0, 10) / 2, 6);
  });

  it('shrinks away from the equator', () => {
    expect(metresPerPixel(60, 10)).toBeLessThan(metresPerPixel(0, 10));
  });
});

describe('tilesFor', () => {
  it('covers the viewport', () => {
    const tiles = tilesFor({ originX: 0, originY: 0, width: 512, height: 256, zoom: 10 });

    /* 512 wide spans x tiles 0,1,2 (the third is the partial one at the right edge) and
       256 tall spans y tiles 0,1 — the loop is inclusive of the tile the far edge lands in. */
    expect(tiles.length).toBe(6);
    expect(tiles[0].left).toBe(0);
    expect(tiles[0].top).toBe(0);
  });

  it('wraps across the antimeridian rather than asking for a negative tile', () => {
    /* Zoom 1 is a 2x2 pyramid, so tile x = -1 must come back as 1. */
    const tiles = tilesFor({ originX: -256, originY: 0, width: 10, height: 10, zoom: 1 });

    expect(tiles.every((tile) => !tile.url.includes('/-1/'))).toBe(true);
    expect(tiles.some((tile) => tile.url.includes('/1/1/0.png'))).toBe(true);
  });

  it('skips rows above the pole instead of wrapping them', () => {
    const tiles = tilesFor({ originX: 0, originY: -600, width: 10, height: 10, zoom: 1 });

    expect(tiles).toEqual([]);
  });
});

describe('pointInRing', () => {
  /* A unit square, counter-clockwise. Small enough to reason about by hand. */
  const square = [
    { lat: 0, lng: 0 },
    { lat: 0, lng: 10 },
    { lat: 10, lng: 10 },
    { lat: 10, lng: 0 },
  ];

  it('finds a point in the middle', () => {
    expect(pointInRing({ lat: 5, lng: 5 }, square)).toBe(true);
  });

  it.each([
    ['west', { lat: 5, lng: -1 }],
    ['east', { lat: 5, lng: 11 }],
    ['south', { lat: -1, lng: 5 }],
    ['north', { lat: 11, lng: 5 }],
  ])('rejects a point to the %s', (_where, point) => {
    expect(pointInRing(point, square)).toBe(false);
  });

  it('rejects a point level with the ring but outside it', () => {
    /* The case a naive bounding-box test passes and a ray cast has to get right. */
    expect(pointInRing({ lat: 0.0001, lng: 20 }, square)).toBe(false);
  });

  it('handles a concave ring, where a bounding box would be wrong', () => {
    /* A C shape opening east: the notch is inside the box and outside the ring. */
    const cShape = [
      { lat: 0, lng: 0 },
      { lat: 0, lng: 10 },
      { lat: 3, lng: 10 },
      { lat: 3, lng: 4 },
      { lat: 7, lng: 4 },
      { lat: 7, lng: 10 },
      { lat: 10, lng: 10 },
      { lat: 10, lng: 0 },
    ];

    expect(pointInRing({ lat: 5, lng: 2 }, cShape)).toBe(true);
    expect(pointInRing({ lat: 5, lng: 8 }, cShape)).toBe(false);
  });

  it('survives a ring with a horizontal edge through the test latitude', () => {
    /* The divide-by-zero the `!==` guard exists for. */
    expect(pointInRing({ lat: 0, lng: 5 }, square)).not.toBeNull();
    expect(() => pointInRing({ lat: 10, lng: 5 }, square)).not.toThrow();
  });

  it('is closed without repeating the first point', () => {
    /* The caller stores four points for a quadrilateral, not five. */
    const triangle = [
      { lat: 0, lng: 0 },
      { lat: 0, lng: 10 },
      { lat: 10, lng: 0 },
    ];

    expect(pointInRing({ lat: 1, lng: 1 }, triangle)).toBe(true);
    expect(pointInRing({ lat: 8, lng: 8 }, triangle)).toBe(false);
  });

  it('answers false for a ring that cannot enclose anything', () => {
    expect(pointInRing({ lat: 5, lng: 5 }, [])).toBe(false);
    expect(pointInRing({ lat: 5, lng: 5 }, square.slice(0, 2))).toBe(false);
  });

  it('answers false for a point that is not a point', () => {
    expect(pointInRing({ lat: 'north', lng: 5 }, square)).toBe(false);
    expect(pointInRing(null, square)).toBe(false);
  });
});

describe('simplifyPath', () => {
  it('drops points that sit on a straight line', () => {
    const line = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 20, y: 0 },
      { x: 30, y: 0 },
    ];

    expect(simplifyPath(line, 1)).toEqual([
      { x: 0, y: 0 },
      { x: 30, y: 0 },
    ]);
  });

  it('keeps a corner', () => {
    const corner = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 20, y: 0 },
      { x: 20, y: 20 },
    ];
    const out = simplifyPath(corner, 1);

    expect(out).toContainEqual({ x: 20, y: 0 });
    expect(out.length).toBe(3);
  });

  it('always keeps both ends', () => {
    const wiggle = Array.from({ length: 40 }, (_, i) => ({ x: i, y: i % 2 }));
    const out = simplifyPath(wiggle, 10);

    expect(out[0]).toEqual(wiggle[0]);
    expect(out[out.length - 1]).toEqual(wiggle[wiggle.length - 1]);
  });

  it('smooths tremor at a loose tolerance but not a tight one', () => {
    const tremor = Array.from({ length: 60 }, (_, i) => ({ x: i * 4, y: i % 2 === 0 ? 0 : 1.5 }));

    expect(simplifyPath(tremor, 0.2).length).toBeGreaterThan(simplifyPath(tremor, 6).length);
  });

  it('passes short paths through untouched', () => {
    const pair = [
      { x: 0, y: 0 },
      { x: 5, y: 5 },
    ];

    expect(simplifyPath(pair, 1)).toEqual(pair);
    expect(simplifyPath([], 1)).toEqual([]);
  });
});

describe('simplifyToBudget', () => {
  it('brings a long freehand trail inside the budget', () => {
    /* A circle sampled 500 times, which is roughly what a dragged lasso produces. */
    const trail = Array.from({ length: 500 }, (_, i) => {
      const angle = (i / 500) * Math.PI * 2;
      return { x: 200 + Math.cos(angle) * 150, y: 200 + Math.sin(angle) * 150 };
    });
    const out = simplifyToBudget(trail, 60);

    expect(out.length).toBeLessThanOrEqual(60);
    /* Still recognisably the ring, not three points. */
    expect(out.length).toBeGreaterThan(8);
  });

  it('never exceeds the budget even for a path that is all corner', () => {
    const zigzag = Array.from({ length: 400 }, (_, i) => ({ x: i * 20, y: i % 2 === 0 ? 0 : 400 }));

    expect(simplifyToBudget(zigzag, 60).length).toBeLessThanOrEqual(60);
  });

  it('leaves a path already inside the budget alone', () => {
    const triangle = [
      { x: 0, y: 0 },
      { x: 100, y: 0 },
      { x: 50, y: 80 },
    ];

    expect(simplifyToBudget(triangle, 60)).toEqual(triangle);
  });
});
