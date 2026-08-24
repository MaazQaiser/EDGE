/**
 * Web Mercator, and the tile arithmetic that goes with it.
 *
 * Lifted verbatim out of `TileRouteMap`, which wrote it by hand rather than pulling in
 * Leaflet on the argument that fit-to-bounds, pan, zoom and a click target is about 120
 * lines and a mapping library is a new dependency plus a second set of conventions. That
 * argument still holds; what changed is that there are now **two** maps that need those
 * 120 lines — the route map in the harmonize workspace and the zone editor in Settings —
 * and a second hand-written copy is how the two end up disagreeing about where a
 * coordinate is.
 *
 * So this is the one copy. Pure functions, no React, no theme, no opinion about what is
 * being drawn: given a latitude, a longitude and a zoom you get a pixel, and given a
 * pixel you get back the same latitude and longitude. Everything that differs between a
 * route and a zone — pins, lines, rings, boundaries, what a click means — stays in the
 * component that owns it.
 */

export const TILE = 256;
export const MIN_ZOOM = 3;
export const MAX_ZOOM = 17;

/**
 * CARTO's public basemap: OpenStreetMap data, raster tiles, no API key.
 *
 * Attribution is a condition of use, so every renderer that calls this must show it.
 */
export const TILE_URL = (z, x, y) =>
  `https://a.basemaps.cartocdn.com/rastertiles/voyager/${z}/${x}/${y}.png`;

/** The margin a fit leaves around its content, per edge. */
export const FIT_PADDING = 48;

export const project = (lat, lng, zoom) => {
  const scale = TILE * 2 ** zoom;
  const sinLat = Math.sin((lat * Math.PI) / 180);
  return {
    x: ((lng + 180) / 360) * scale,
    y: (0.5 - Math.log((1 + sinLat) / (1 - sinLat)) / (4 * Math.PI)) * scale,
  };
};

export const unproject = (x, y, zoom) => {
  const scale = TILE * 2 ** zoom;
  const n = Math.PI - (2 * Math.PI * y) / scale;
  return {
    lng: (x / scale) * 360 - 180,
    lat: (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n))),
  };
};

/**
 * The closest zoom at which every point fits, and the centre that puts them there.
 *
 * Walks down from the tightest zoom rather than solving for one, because the answer has
 * to be an integer zoom — raster tiles do not come at 13.4 — and stepping down from
 * `MAX_ZOOM` finds the largest integer that fits without any rounding to argue about.
 */
export const fitView = (points, width, height, padding = FIT_PADDING) => {
  const usableW = Math.max(width - padding * 2, 64);
  const usableH = Math.max(height - padding * 2, 64);

  for (let zoom = MAX_ZOOM; zoom >= MIN_ZOOM; zoom -= 1) {
    const projected = points.map((point) => project(Number(point.lat), Number(point.lng), zoom));
    const xs = projected.map((p) => p.x);
    const ys = projected.map((p) => p.y);
    const spanX = Math.max(...xs) - Math.min(...xs);
    const spanY = Math.max(...ys) - Math.min(...ys);

    if (spanX <= usableW && spanY <= usableH) {
      const centre = unproject(
        (Math.max(...xs) + Math.min(...xs)) / 2,
        (Math.max(...ys) + Math.min(...ys)) / 2,
        zoom,
      );
      return { zoom, center: centre };
    }
  }

  return { zoom: MIN_ZOOM, center: { lat: Number(points[0].lat), lng: Number(points[0].lng) } };
};

/**
 * Ground metres to a screen pixel at a given latitude and zoom.
 *
 * What turns a distance into a radius. Recompute it rather than caching the pixel value:
 * a ring is a claim about kilometres, and a cached radius would keep the circle the same
 * size on screen while the streets under it changed scale — the one thing a distance mark
 * must never do.
 */
export const metresPerPixel = (lat, zoom) =>
  (156543.03392 * Math.cos((lat * Math.PI) / 180)) / 2 ** zoom;

/**
 * The tiles covering a viewport, with their screen offsets.
 *
 * `wrappedX` is what lets the map cross the antimeridian without asking for tile −1;
 * rows outside the pyramid are skipped rather than wrapped, because there is no tile
 * above the north pole to fetch.
 */
export const tilesFor = ({ originX, originY, width, height, zoom }) => {
  const tileCount = 2 ** zoom;
  const tiles = [];

  for (let tx = Math.floor(originX / TILE); tx <= Math.floor((originX + width) / TILE); tx += 1) {
    for (
      let ty = Math.floor(originY / TILE);
      ty <= Math.floor((originY + height) / TILE);
      ty += 1
    ) {
      if (ty < 0 || ty >= tileCount) continue;
      const wrappedX = ((tx % tileCount) + tileCount) % tileCount;
      tiles.push({
        key: `${zoom}/${tx}/${ty}`,
        url: TILE_URL(zoom, wrappedX, ty),
        left: tx * TILE - originX,
        top: ty * TILE - originY,
      });
    }
  }

  return tiles;
};

/**
 * Is this point inside this ring?
 *
 * Ray casting: count the edges a ray from the point crosses, odd means inside. The
 * `(a.lat > lat) !== (b.lat > lat)` test is what makes it safe — it excludes horizontal
 * edges, which are the divide-by-zero, and counts each crossing exactly once so a ray
 * passing through a vertex is not double-counted.
 *
 * Run in lat/lng rather than screen pixels on purpose. A boundary is a fact about the
 * ground, and testing it in pixels would make membership depend on the zoom the planner
 * happened to be at when they looked.
 */
export const pointInRing = (point, ring = []) => {
  if (!point || ring.length < 3) return false;

  const lat = Number(point.lat);
  const lng = Number(point.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return false;

  let inside = false;
  for (let i = 0; i < ring.length; i += 1) {
    const a = ring[i];
    const b = ring[(i + 1) % ring.length];
    if (Number(a.lat) > lat !== Number(b.lat) > lat) {
      const crossing =
        ((Number(b.lng) - Number(a.lng)) * (lat - Number(a.lat))) /
          (Number(b.lat) - Number(a.lat)) +
        Number(a.lng);
      if (lng < crossing) inside = !inside;
    }
  }

  return inside;
};

/**
 * Thin a freehand trail down to the points that carry its shape.
 *
 * Ramer–Douglas–Peucker: keep the two ends, find the point furthest from the line between
 * them, and if it is further than `tolerance` keep it and recurse into both halves. What
 * survives is the corners; what goes is the hand-tremor between them.
 *
 * Needed because a dragged lasso arrives as one point per pointer event — four or five
 * hundred for a shape drawn across a panel — and the stored rule allows sixty. Naive
 * decimation (keep every tenth) would hit that budget too, and would spend it evenly:
 * corners and straight runs get the same number of points, so the corners round off. This
 * spends the budget where the shape actually turns.
 *
 * Operates on screen `{x, y}`, not coordinates, because the tolerance a planner cares about
 * is "how far from where I dragged" and that is a pixel distance at the zoom they drew at.
 */
export const simplifyPath = (points, tolerance = 2.5) => {
  if (points.length < 3) return points.slice();

  const sqTolerance = tolerance * tolerance;

  /** Squared distance from `p` to the segment `a`–`b`. */
  const sqSegmentDistance = (p, a, b) => {
    let x = a.x;
    let y = a.y;
    let dx = b.x - x;
    let dy = b.y - y;

    if (dx !== 0 || dy !== 0) {
      const t = ((p.x - x) * dx + (p.y - y) * dy) / (dx * dx + dy * dy);
      if (t > 1) {
        x = b.x;
        y = b.y;
      } else if (t > 0) {
        x += dx * t;
        y += dy * t;
      }
    }

    dx = p.x - x;
    dy = p.y - y;
    return dx * dx + dy * dy;
  };

  const keep = new Array(points.length).fill(false);
  keep[0] = true;
  keep[points.length - 1] = true;

  const stack = [[0, points.length - 1]];
  while (stack.length) {
    const [first, last] = stack.pop();
    let furthest = -1;
    let maxSq = sqTolerance;

    for (let i = first + 1; i < last; i += 1) {
      const sq = sqSegmentDistance(points[i], points[first], points[last]);
      if (sq > maxSq) {
        maxSq = sq;
        furthest = i;
      }
    }

    if (furthest !== -1) {
      keep[furthest] = true;
      stack.push([first, furthest], [furthest, last]);
    }
  }

  return points.filter((_point, index) => keep[index]);
};

/**
 * Simplify until the ring fits a budget, then hard-cap.
 *
 * Doubling the tolerance each pass converges in a handful of rounds for any real trail. The
 * final slice is a backstop for the pathological case — a trail that is all corner — so the
 * function cannot return more than it promised whatever it is handed.
 */
export const simplifyToBudget = (points, maxPoints, startTolerance = 2.5) => {
  let tolerance = startTolerance;
  let result = simplifyPath(points, tolerance);

  while (result.length > maxPoints && tolerance < 4096) {
    tolerance *= 2;
    result = simplifyPath(points, tolerance);
  }

  return result.slice(0, maxPoints);
};
