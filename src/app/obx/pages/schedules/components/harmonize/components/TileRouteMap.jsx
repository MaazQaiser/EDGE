import { Box, Button, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useStyles } from '../harmonize.styles';
import {
  delayForIndex,
  drawDurationMs,
  prefersReducedMotion,
  REDRAW_MS,
  ROUTE_EASING,
  routeSignature,
} from '../routeMotion';
import { PIN_FILL, PIN_RIM, START_BADGE, StartPin, StopPin } from './MapPins';

/**
 * A real street map, with no API key.
 *
 * The Google map in `RouteMap` stays the preferred renderer and is used whenever a
 * key is present. This is what runs when there isn't one — which, in the demo, is
 * always. It is not a schematic: these are the same OpenStreetMap streets, served as
 * raster tiles from CARTO's public basemap, so a route drawn on it is drawn over
 * actual roads at an actual scale.
 *
 * Written directly against the tile protocol rather than pulling in Leaflet: the
 * whole of what this screen needs is fit-to-bounds, pan, zoom and a click target,
 * and that is ~120 lines of Web Mercator. A mapping library would be a new
 * dependency and a second set of conventions for one 240px panel.
 *
 * Editing is the same contract as the Google renderer, and calls the same handlers:
 * click a stop to drop it to the next day, click a spilled visit to pull it in.
 * Order stays the stop list's job — dragging a pin here would imply the *site* had
 * moved, which is a fact about the site and not about this route.
 */

const TILE = 256;
const MIN_ZOOM = 3;
const MAX_ZOOM = 17;
/* The margin the fit leaves around a route, per edge. Symmetric; the ring that briefly made
   this the outer bound is gone, so the content is the stops again. */
const FIT_PADDING = 48;

/* Long enough to recognise a site, short enough that a label cannot run off a
   240px panel. The stop list carries the full name. */
const LABEL_MAX = 22;
const truncate = (value = '') =>
  value.length > LABEL_MAX ? `${value.slice(0, LABEL_MAX - 1)}…` : value;

/** How far the pointer may travel and still have ended in a click rather than a pan. */
const DRAG_SLOP = 4;

/**
 * CARTO's public basemap, on **Voyager** rather than `light_all`.
 *
 * `light_all` is CARTO's "positron" style: near-white ground, grey roads, grey water,
 * almost no colour anywhere. It was chosen so a brand-green route would be the loudest
 * thing on the panel, and it succeeded to a fault — the map read as a wireframe of a
 * city rather than a city, and with the map now half the workspace and the planner
 * reading real geography off it (which cluster is which, what the ring reaches) a
 * drained basemap is withholding the information they came for.
 *
 * Voyager is the same tiles from the same provider under the same attribution, with
 * water in blue, parks in green, built-up land warm, and road classes separated by
 * colour instead of only by width. It is still a *basemap* — nothing in it competes with
 * a 4px saturated stroke, which is the property `light_all` was picked for.
 *
 * **Subdomain `a` on purpose.** CARTO serves `a`–`d`; rotating them was the old trick for
 * beating a browser's per-host connection cap, and over HTTP/2 — which every browser this
 * app supports uses — one host multiplexes the whole viewport on one connection and four
 * hosts mean four TLS handshakes. Attribution is a condition of use, not decoration; it
 * renders bottom-right.
 */
const TILE_URL = (z, x, y) =>
  `https://a.basemaps.cartocdn.com/rastertiles/voyager/${z}/${x}/${y}.png`;

const project = (lat, lng, zoom) => {
  const scale = TILE * 2 ** zoom;
  const sinLat = Math.sin((lat * Math.PI) / 180);
  return {
    x: ((lng + 180) / 360) * scale,
    y: (0.5 - Math.log((1 + sinLat) / (1 - sinLat)) / (4 * Math.PI)) * scale,
  };
};

const unproject = (x, y, zoom) => {
  const scale = TILE * 2 ** zoom;
  const n = Math.PI - (2 * Math.PI * y) / scale;
  return {
    lng: (x / scale) * 360 - 180,
    lat: (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n))),
  };
};

/** The largest zoom at which every point still fits inside the viewport. */
const fitView = (points, width, height) => {
  const usableW = Math.max(width - FIT_PADDING * 2, 64);
  const usableH = Math.max(height - FIT_PADDING * 2, 64);

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
 * Metres per pixel at a given latitude and zoom, from the Web Mercator constant.
 *
 * 156543.03392 is the equatorial resolution at zoom 0 for a 256px tile; the cosine
 * corrects for the projection stretching east-west as it goes north. This is what
 * turns "10 km" into a radius the ring can actually be drawn at, and it has to be
 * recomputed on every zoom — a circle drawn once in pixels would claim a different
 * distance at every zoom level, which is worse than not drawing it.
 */
const metresPerPixel = (lat, zoom) => (156543.03392 * Math.cos((lat * Math.PI) / 180)) / 2 ** zoom;

const TileRouteMap = ({
  startPoint,
  devicePoint,
  stops = [],
  overflowStops = [],
  radiusKm,
  highlightedSiteId,
  onHighlight,
  onMoveToOverflow,
  onBringBack,
  pending = false,
  onPickPoint,
  lockView = false,
}) => {
  const classes = useStyles();
  const theme = useTheme();
  const { t } = useTranslation();
  const tt = (key) => t(`obx.runsheet.harmonize.${key}`);

  const containerRef = useRef(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [view, setView] = useState(null);
  const [openStopId, setOpenStopId] = useState(null);
  const dragRef = useRef(null);
  /* Set during a gesture, read by the click that ends it — see `onPointerMove`. */
  const movedRef = useRef(false);

  /* Motion state. `lineRef` holds both the casing and the line so they draw as one
     stroke; `pinRefs` is keyed by siteId so a stop keeps its node across a re-solve
     and can therefore be animated rather than replaced. */
  const lineRefs = useRef([]);
  const pinRefs = useRef(new Map());
  const lastSignature = useRef('');

  useLayoutEffect(() => {
    const node = containerRef.current;
    if (!node) return undefined;

    const measure = () => setSize({ width: node.clientWidth || 0, height: node.clientHeight || 0 });
    measure();

    /* The drawer animates in, so the first measurement can land while the panel is
       still 0px wide — which would fit the view to nothing. */
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  /**
   * Everything the fit has to keep on screen.
   *
   * **The ring is back in the bounds, and it is deliberately *not* in the fit key.** It was
   * here once, taken out with the ring itself, and the objection recorded then was sound: a
   * route squeezed into the middle of the pane to make room for empty circumference is a
   * worse picture than a cropped circle. That objection is about the *plan* state, and the
   * ring no longer exists there — `RouteMap` passes `radiusKm` only while planning, where
   * the circle is the subject rather than furniture around one.
   *
   * The two lists are the split that makes it work. Bounds get the ring, so the opening view
   * frames the whole rule and the planner can see what they are aiming. The key does not, so
   * dragging the slider re-draws the circle at the same scale instead of re-fitting the view
   * under their thumb — which is the version that felt broken, the map zooming out a step on
   * every pixel of travel.
   *
   * The consequence, stated because it is a real limit: drag the radius far past the work and
   * the circle runs off the pane. Its arc and its centre are still on screen, the counts in
   * the left column are still exact, and the zoom control is right there. Refitting instead
   * would trade a legible edge case for an unusable common one.
   *
   * `devicePoint` and `overflowStops` stay: a ruled-out visit the planner is deciding about is
   * something they need to see, and so is where they are standing. The consequence is worth
   * knowing — the view centres on the midpoint of *this* set rather than of the route, so a
   * lone grey pin off to one side pulls the route off centre.
   */
  const placePoints = [
    ...(startPoint ? [startPoint] : []),
    ...(devicePoint ? [devicePoint] : []),
    ...stops,
    ...overflowStops,
  ].filter((point) => Number.isFinite(Number(point?.lat)) && Number.isFinite(Number(point?.lng)));

  /* The circle's four cardinal extremes, which bound it exactly — a `LatLngBounds` of those
     is the ring's own box. Degrees rather than metres because the fit works in lat/lng:
     111.32 km to a degree of latitude, and a degree of longitude shrinks by the cosine of
     the latitude it is measured at. */
  const ringBoundPoints =
    Number.isFinite(radiusKm) && radiusKm > 0 && startPoint
      ? (() => {
          const lat = Number(startPoint.lat);
          const lng = Number(startPoint.lng);
          const dLat = radiusKm / 111.32;
          const dLng = radiusKm / (111.32 * Math.max(0.01, Math.cos((lat * Math.PI) / 180)));
          return [
            { lat: lat + dLat, lng },
            { lat: lat - dLat, lng },
            { lat, lng: lng + dLng },
            { lat, lng: lng - dLng },
          ];
        })()
      : [];

  const points = [...placePoints, ...ringBoundPoints];

  /* Refit when the set of *places* changes, not on every render — otherwise panning
     is undone the moment the route re-solves. A deliberate pan or zoom sets its own
     view and this key stops matching until the places themselves change. The ring is
     absent from this on purpose; see above. */
  const fitKey = placePoints.map((point) => `${point.lat},${point.lng}`).join('|');

  /**
   * Whether the view has been fitted once already, read only by `lockView`.
   *
   * The refit above is right for the workspace: the set of places changes there because
   * the *plan* changed, and a route that has grown a stop the planner cannot see is not
   * a route they can check. It is wrong for a picker, where the set changes because the
   * planner just clicked a spot — refitting on that snaps a single point to `MAX_ZOOM`
   * about their own click and throws away whatever they had zoomed out to aim with.
   * So the first fit still happens either way, and later ones are opt-out.
   */
  const fittedRef = useRef(false);

  useEffect(() => {
    if (!points.length || !size.width || !size.height) return;
    if (lockView && fittedRef.current) return;
    fittedRef.current = true;
    setView(fitView(points, size.width, size.height));
    // Refit is keyed on the places and the viewport, never on the plan's order.
  }, [fitKey, size.width, size.height, lockView]);

  const zoomBy = useCallback(
    (delta) =>
      setView((previous) =>
        previous
          ? {
              ...previous,
              zoom: Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, previous.zoom + delta)),
            }
          : previous,
      ),
    [],
  );

  /* Pan in pixel space and convert back once, so dragging cannot accumulate
     projection error across a long gesture. */
  const onPointerDown = (event) => {
    if (!view) return;
    /* A pin is a click target, not a grab handle. Capturing the pointer here
       retargets every later pointer event to the container, which meant the
       marker's own `click` never fired and the map's editing actions were
       unreachable — the pan gesture ate them. */
    if (event.target?.closest?.('[data-map-mark]')) return;
    /**
     * **The map's own furniture had exactly the same bug, and this is the fix.**
     *
     * `click` is retargeted by pointer capture just as the pointer events are, so a press
     * that began on the zoom `+` was reported on the container and the button's own
     * handler never ran. Verified rather than reasoned about: pressing `−` on the keyless
     * map did not zoom it. The bubble's Move out / Bring back button is the same control
     * in the same container and was unreachable for the same reason.
     *
     * The pin exclusion above stopped one class of victim; this stops the rest. Nothing is
     * lost — a pan that starts on a 26px zoom button or inside a stop's bubble is not a
     * gesture anybody is attempting.
     */
    if (event.target?.closest?.('[data-map-chrome]')) return;
    const origin = project(view.center.lat, view.center.lng, view.zoom);
    dragRef.current = { x: event.clientX, y: event.clientY, origin };
    movedRef.current = false;
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const onPointerMove = (event) => {
    const drag = dragRef.current;
    if (!drag || !view) return;
    /* A pan ends in a `click` on the same element it started on, so without this a
       planner who dragged the map 300px would also have dropped their point wherever
       they let go. 4px is the slop a deliberate click carries, not a threshold for
       what counts as a pan. */
    if (
      Math.abs(event.clientX - drag.x) > DRAG_SLOP ||
      Math.abs(event.clientY - drag.y) > DRAG_SLOP
    )
      movedRef.current = true;
    const nextX = drag.origin.x - (event.clientX - drag.x);
    const nextY = drag.origin.y - (event.clientY - drag.y);
    setView((previous) => ({ ...previous, center: unproject(nextX, nextY, previous.zoom) }));
  };

  const endDrag = (event) => {
    dragRef.current = null;
    event.currentTarget.releasePointerCapture?.(event.pointerId);
  };

  useEffect(() => {
    if (!openStopId) return;
    const stillOnMap = [...stops, ...overflowStops].some((stop) => stop.siteId === openStopId);
    if (!stillOnMap) setOpenStopId(null);
  }, [openStopId, stops, overflowStops]);

  /* The route's own motion. Keyed on the order, so a re-render that changes nothing
     animates nothing — and a re-order, which *is* a different answer, always replays.

     The line is drawn with `pathLength="1"`, which normalises the dash units: offset
     goes 1 → 0 regardless of how long the path actually is, so there is nothing to
     measure and nothing to go stale when the viewport changes. */
  const orderSignature = routeSignature(stops);

  useEffect(() => {
    const paths = lineRefs.current.filter(Boolean);

    /* Nothing to draw on yet, so nothing is recorded either. This component returns a
       bare placeholder until `view` and `size` resolve — the drawer animates in, so
       the first measurement can land at 0px — and an earlier version recorded the
       signature on that render. The reveal was therefore spent on a frame with no
       paths in it, and by the time the real ones mounted the order looked unchanged
       and the line simply appeared. Hence the re-run on `view`/`size`. */
    if (!orderSignature || !paths.length) return;
    if (orderSignature === lastSignature.current) return;

    const isFirstDraw = !lastSignature.current;
    lastSignature.current = orderSignature;

    if (prefersReducedMotion()) return;

    const duration = isFirstDraw ? drawDurationMs(stops.length) : REDRAW_MS;

    paths.forEach((path) => {
      path.animate([{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], {
        duration,
        easing: ROUTE_EASING,
        fill: 'both',
      });
    });

    /* Each pin is claimed as the line reaches it. On a re-solve they do not re-enter —
       they are already there and the planner is reading the change, not the arrival —
       so only the first draw staggers. */
    if (!isFirstDraw) return;

    /**
     * **A claim, not an arrival.**
     *
     * This used to animate each pin from `opacity: 0, scale(0.4)`, which was right when
     * the map was withheld until the plan was final and every pin genuinely was new. The
     * map now opens on these same visits as candidates and the line travels between them
     * while it is being explained, so animating from nothing made an existing pin blink
     * out and reappear — reading as a *different* place rather than as this one being
     * taken into the route.
     *
     * So it swells and settles: 1 → 1.28 → 1, on the beat the line arrives. No fade,
     * because the pin was already there, and the number fading up inside it (a CSS
     * transition on the `<text>`) is what says the sequence now owns it.
     */
    stops.forEach((stop, index) => {
      const node = pinRefs.current.get(stop.siteId);
      if (!node) return;
      node.animate(
        [
          { transform: 'scale(1)' },
          { transform: 'scale(1.28)', offset: 0.45 },
          { transform: 'scale(1)' },
        ],
        {
          duration: 460,
          delay: delayForIndex(index, stops.length, duration),
          easing: ROUTE_EASING,
          fill: 'both',
        },
      );
    });
    // Order is the identity of a route; `stops` itself changes on every render.
    // `view` and `size` are here so the reveal waits for the paths to exist.
  }, [orderSignature, view, size.width, size.height]);

  if (!points.length) return null;
  if (!view || !size.width || !size.height) {
    return <Box ref={containerRef} className={classes.tileMapRoot} />;
  }

  const { zoom, center } = view;
  const centrePx = project(center.lat, center.lng, zoom);
  const originX = centrePx.x - size.width / 2;
  const originY = centrePx.y - size.height / 2;
  const toScreen = (point) => {
    const world = project(Number(point.lat), Number(point.lng), zoom);
    return { x: world.x - originX, y: world.y - originY };
  };

  /**
   * Click-to-place, for callers that are choosing a point rather than reading a route.
   *
   * Opt-in, because the workspace's map already spends a click on something else: there,
   * clicking a pin opens the bubble that moves a visit in or out of the day, and a
   * general "you clicked the ground" handler under it would be a second meaning for the
   * same gesture on the same surface.
   *
   * The two exclusions are what keep it from firing on the map's own furniture. Marks
   * carry `data-map-mark` and are already the pan gesture's exclusion; the zoom pair and
   * the bubble carry `data-map-chrome`, since zooming in to aim and then having the `+`
   * itself drop the point is the failure this exists to prevent.
   */
  const handleSurfaceClick = (event) => {
    if (!onPickPoint) return;
    if (movedRef.current) return;
    if (event.target?.closest?.('[data-map-mark]')) return;
    if (event.target?.closest?.('[data-map-chrome]')) return;

    const rect = event.currentTarget.getBoundingClientRect();
    onPickPoint(
      unproject(originX + (event.clientX - rect.left), originY + (event.clientY - rect.top), zoom),
    );
  };

  // Tiles covering the viewport, wrapped east–west and clamped north–south.
  const tileCount = 2 ** zoom;
  const tiles = [];
  for (
    let tx = Math.floor(originX / TILE);
    tx <= Math.floor((originX + size.width) / TILE);
    tx += 1
  ) {
    for (
      let ty = Math.floor(originY / TILE);
      ty <= Math.floor((originY + size.height) / TILE);
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

  /* A sequence exists only once the solver has produced one. Before that the stops
     are a set, not an order, and joining them would draw a route nobody asked for. */
  const isSolved = Boolean(startPoint) && stops.every((stop) => stop.order != null);
  const routeNodes = isSolved
    ? [
        { ...startPoint, kind: 'start' },
        ...stops.map((stop) => ({ ...stop, kind: 'stop' })),
        { ...startPoint, kind: 'end' },
      ]
    : [];
  const routeLine = routeNodes.map(toScreen);
  const linePath =
    routeLine.length > 1
      ? routeLine.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
      : '';

  const openStop = [...stops, ...overflowStops].find((stop) => stop.siteId === openStopId) || null;
  const openStopIsSpilled =
    Boolean(openStop) && overflowStops.some((stop) => stop.siteId === openStopId);
  const openStopScreen = openStop ? toScreen(openStop) : null;

  /* Supplied by the caller, so the keyless renderer and the Google one cannot word
     the same fact two ways. */
  const reasonLine = openStopIsSpilled ? openStop?.excludeNote || '' : '';
  const canAct = openStopIsSpilled ? Boolean(openStop?.canInclude) : true;

  /* The radius, in pixels at this zoom. Recomputed rather than cached: the ring is a
     claim about kilometres and a pan or zoom must not quietly change what it claims — a
     cached pixel value would keep the circle the same size on screen while the streets
     under it changed scale, which is the one thing a distance mark must never do. */
  const ringCentre =
    Number.isFinite(radiusKm) && radiusKm > 0 && startPoint ? toScreen(startPoint) : null;
  const ringRadiusPx = ringCentre
    ? (radiusKm * 1000) / metresPerPixel(Number(startPoint.lat), zoom)
    : 0;

  const samePlace = (a, b) =>
    Boolean(a && b) &&
    Math.abs(Number(a.lat) - Number(b.lat)) < 1e-6 &&
    Math.abs(Number(a.lng) - Number(b.lng)) < 1e-6;

  /* Drawn only when the route does not already leave from here. When it does, the
     start mark is standing on the same spot and two marks would say one thing
     twice — the start's own label names it instead. */
  const showDevice = Boolean(devicePoint) && !samePlace(devicePoint, startPoint);

  /* Names on the map, because two identical dots are not locations.
     Unnumbered pins are always named: in the pre-plan state there is no ordered
     list to cross-reference them against, so the label is the only thing that
     says which site this is. Once the plan solves, the number does that job and
     naming all twelve would bury the route — so a solved pin is named on hover,
     which is the same channel the stop list highlights through. */
  const labels = [];
  if (startPoint) {
    labels.push({
      key: 'start',
      at: toScreen(startPoint),
      dy: 22,
      text: truncate(startPoint.label || startPoint.address || tt('legendStart')),
      color: theme.palette.textPrimary,
    });
  }
  if (showDevice) {
    labels.push({
      key: 'device',
      at: toScreen(devicePoint),
      dy: 21,
      text: tt('mapYouAreHere'),
      color: theme.palette.textBrand,
    });
  }
  /**
   * How many unnumbered pins can be named before the names *are* the map.
   *
   * Unnumbered pins used to be named unconditionally, on the sound argument that a set
   * with no sequence has nothing to cross-reference against, so the label is the only
   * thing saying which site a dot is. That holds for four or five pins. The reveal now
   * opens on **every** visit in the window as an unnumbered candidate, and fourteen
   * halo'd labels on a 288px panel is a screen of overlapping text with a map somewhere
   * under it. Past the cap the pins stay and the names come on hover, which is the same
   * rule a solved route already follows.
   */
  const unnumbered = stops.filter((stop) => stop.order == null).length;
  const nameUnnumbered = unnumbered <= 6;

  /**
   * Every place on the map, in one keyed list, with `dim` saying which side of the plan
   * it is on. The route's own stops are drawn last so a numbered pin is never buried
   * under a grey one.
   */
  const marks = [
    ...overflowStops.map((stop) => ({ ...stop, dim: true, order: null })),
    ...stops.map((stop) => ({ ...stop, dim: false })),
  ];

  stops.forEach((stop) => {
    const isHighlighted = highlightedSiteId === stop.siteId;
    if (stop.order != null && !isHighlighted) return;
    if (stop.order == null && !nameUnnumbered && !isHighlighted) return;
    labels.push({
      key: `stop-${stop.siteId}`,
      at: toScreen(stop),
      dy: isHighlighted ? 28 : 25,
      text: truncate(stop.siteName || stop.name || ''),
      color: theme.palette.textPrimary,
    });
  });
  overflowStops.forEach((stop) => {
    if (highlightedSiteId !== stop.siteId) return;
    labels.push({
      key: `spilled-${stop.siteId}`,
      at: toScreen(stop),
      dy: 20,
      text: truncate(stop.siteName || stop.name || ''),
      color: theme.palette.textSecondary2,
    });
  });

  return (
    <Box
      ref={containerRef}
      className={classes.tileMapRoot}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onClick={handleSurfaceClick}
      /* A crosshair only where a click means something, and `sx` rather than the shared
         class so the workspace's grab cursor is left exactly as it was. It has to beat
         `tileMapRoot`'s own `&:active` too, or the cursor reverts to `grabbing` for the
         duration of every click. */
      sx={onPickPoint ? { cursor: 'crosshair', '&:active': { cursor: 'crosshair' } } : undefined}
      onWheel={(event) => {
        event.preventDefault();
        zoomBy(event.deltaY > 0 ? -1 : 1);
      }}
    >
      {tiles.map((tile) => (
        <Box
          key={tile.key}
          component="img"
          src={tile.url}
          alt=""
          draggable={false}
          className={classes.tileMapTile}
          sx={{ left: tile.left, top: tile.top }}
        />
      ))}

      <Box
        component="svg"
        className={classes.tileMapOverlay}
        viewBox={`0 0 ${size.width} ${size.height}`}
      >
        {/* **The ring, under everything.** It is the distance the run will travel from
            where the day starts, and it is drawn first because it is ground rather than
            figure: a grey pin outside it has explained itself before the planner reads
            a panel. A dashed stroke, because a solid circle on a street map reads as a
            boundary that exists on the ground — this one is a rule about driving, not a
            fence somebody could walk into.

            **No `ringIn` animation on it here.** That class exists for the ring arriving
            on the narration line that names it, which is not what this is any more: the
            ring is present from the first frame and its radius follows a slider. An 820ms
            settle replayed on every step of a drag is a circle that never stops
            wobbling — the `r` change *is* the feedback, and it should be instant. */}
        {ringCentre && ringRadiusPx > 0 ? (
          <circle
            cx={ringCentre.x}
            cy={ringCentre.y}
            r={ringRadiusPx}
            fill={theme.palette.surfaceBrand}
            fillOpacity={0.06}
            stroke={theme.palette.surfaceBrand}
            strokeOpacity={0.7}
            strokeWidth={1.5}
            strokeDasharray="6 5"
            style={{ pointerEvents: 'none' }}
          />
        ) : null}

        {linePath && (
          <>
            {/* Casing under the line so it stays legible over street detail. It draws
                on the same clock as the line — a casing that arrives first would read
                as a white worm crossing the map. */}
            <path
              ref={(node) => {
                lineRefs.current[0] = node;
              }}
              d={linePath}
              pathLength="1"
              strokeDasharray="1"
              fill="none"
              stroke={theme.palette.surfaceWhite}
              strokeWidth="8"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.9"
            />
            <path
              ref={(node) => {
                lineRefs.current[1] = node;
              }}
              d={linePath}
              pathLength="1"
              strokeDasharray="1"
              fill="none"
              stroke={theme.palette.surfaceBrand}
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={pending ? 0.4 : 1}
            />
          </>
        )}

        {/* Where the planner is, as distinct from where the route leaves. A ring
            rather than a disc, so it reads as a position rather than a stop. */}
        {showDevice && (
          <g>
            <circle
              cx={toScreen(devicePoint).x}
              cy={toScreen(devicePoint).y}
              r="10"
              fill={theme.palette.surfaceBrand}
              opacity="0.18"
            />
            <circle
              cx={toScreen(devicePoint).x}
              cy={toScreen(devicePoint).y}
              r="5"
              fill={theme.palette.surfaceBrand}
              stroke={theme.palette.surfaceWhite}
              strokeWidth="2"
            />
          </g>
        )}

        {/* The origin, as the supplied badge: a disc rather than a teardrop, because this
            is not a stop on the route — it is the point the route is measured from. */}
        {startPoint && (
          <g transform={`translate(${toScreen(startPoint).x} ${toScreen(startPoint).y})`}>
            <StartPin badge={START_BADGE} glyph={PIN_RIM} />
          </g>
        )}

        {/**
         * **Every place on the map is one mark, and being ruled out is a change to it.**
         *
         * The in-the-route pins and the not-in-the-route pins used to be two separate
         * arrays rendered in two places, which meant a visit dropping out of the plan
         * *unmounted* one element and mounted a different one somewhere else in the
         * document. Instantaneous, and unanimatable — exactly the wrong thing for a
         * reveal whose whole subject is elimination, where the planner needs to see
         * *which* pins went out and be able to follow them going.
         *
         * One keyed list fixes it by construction: a visit keeps its DOM node whatever
         * happens to it, so `fill` and `r` are CSS transitions on a stable element and
         * dropping out of the plan is a 400ms fade to grey where it stands.
         */}
        {marks.map((mark) => {
          const at = toScreen(mark);
          const isHighlighted = highlightedSiteId === mark.siteId;
          const numbered = mark.order != null;

          return (
            <g
              key={mark.siteId}
              data-map-mark="true"
              /* Translated to the projected point; the pin draws itself about its own tip
                 from there, so nothing here has to know the artwork's dimensions. */
              transform={`translate(${at.x} ${at.y})`}
              style={{ cursor: onHighlight ? 'pointer' : 'default' }}
              onMouseEnter={() => onHighlight?.(mark.siteId)}
              onMouseLeave={() => onHighlight?.(null)}
              onClick={() => setOpenStopId(mark.siteId)}
            >
              <StopPin
                pinRef={(node) => {
                  if (node) pinRefs.current.set(mark.siteId, node);
                  else pinRefs.current.delete(mark.siteId);
                }}
                /* `fill-box` origin at the tip, so the pin swells about the point it
                   names rather than about the SVG's top-left corner — which would fling
                   it across the map. */
                className={classes.tileMapPin}
                stateClassName={classes.tileMapPinState}
                /* A sequenced stop is full size, a candidate the run has not claimed is
                   smaller, and one that has been ruled out is smaller still. */
                scale={
                  mark.dim ? (isHighlighted ? 0.9 : 0.8) : isHighlighted ? 1.5 : numbered ? 1.3 : 1
                }
                fill={
                  mark.dim
                    ? theme.palette.textSecondary3
                    : isHighlighted
                      ? theme.palette.surfaceBrandHover
                      : PIN_FILL
                }
                stroke={mark.dim ? theme.palette.surfaceWhite : PIN_RIM}
                number={mark.order ?? null}
                numberColor={theme.palette.textOnColor}
              />
            </g>
          );
        })}

        {/* Last, so a name is never hidden under a pin. Painted stroke-first
            against the street detail — a halo is what makes text on a raster map
            legible without a solid plate behind every label. */}
        {labels.map((label) => (
          <text
            key={label.key}
            x={label.at.x}
            y={label.at.y + label.dy}
            textAnchor="middle"
            fontSize="11"
            fontWeight="600"
            fill={label.color}
            stroke={theme.palette.surfaceWhite}
            strokeWidth="3"
            style={{ paintOrder: 'stroke', pointerEvents: 'none', userSelect: 'none' }}
          >
            {label.text}
          </text>
        ))}
      </Box>

      {openStop && openStopScreen && (
        <Box
          data-map-chrome="true"
          className={classes.tileMapBubble}
          sx={{ left: openStopScreen.x, top: openStopScreen.y - 18 }}
        >
          <Typography className={classes.mapBubbleTitle}>
            {openStop.siteName || openStop.name}
          </Typography>

          {/* Why this pin is grey, said on the pin. Where the reason is the rule there
              is no button: a visit is not clicked onto a date its contract forbids. */}
          {reasonLine ? (
            <Typography className={classes.mapBubbleReason}>{reasonLine}</Typography>
          ) : null}

          {canAct ? (
            <Button
              variant={openStopIsSpilled ? 'primary' : 'secondaryGrey'}
              className={classes.mapBubbleAction}
              onClick={() => {
                if (openStopIsSpilled) onBringBack?.(openStop.siteId);
                else onMoveToOverflow?.(openStop.siteId);
                setOpenStopId(null);
              }}
            >
              {tt(openStopIsSpilled ? 'mapBringBack' : 'mapMoveOut')}
            </Button>
          ) : null}
        </Box>
      )}

      <Box data-map-chrome="true" className={classes.tileMapZoom}>
        <Button
          className={classes.tileMapZoomButton}
          onClick={() => zoomBy(1)}
          aria-label="Zoom in"
        >
          +
        </Button>
        <Button
          className={classes.tileMapZoomButton}
          onClick={() => zoomBy(-1)}
          aria-label="Zoom out"
        >
          −
        </Button>
      </Box>

      {/* Attribution is a condition of using the tiles. */}
      <Typography className={classes.tileMapAttribution}>
        © OpenStreetMap contributors © CARTO
      </Typography>
    </Box>
  );
};

TileRouteMap.propTypes = {
  startPoint: PropTypes.object,
  devicePoint: PropTypes.object,
  stops: PropTypes.array,
  overflowStops: PropTypes.array,
  /** The run's travelling distance from the start point, drawn as a ring. Kilometres, and
      `null` once there is a plan — see `RouteMap`, which decides. */
  radiusKm: PropTypes.number,
  highlightedSiteId: PropTypes.string,
  onHighlight: PropTypes.func,
  onMoveToOverflow: PropTypes.func,
  onBringBack: PropTypes.func,
  pending: PropTypes.bool,
  /** Called with `{ lat, lng }` for a click on the ground. Absent: clicks do nothing. */
  onPickPoint: PropTypes.func,
  /** Fit the view once and then leave it alone. See `fittedRef`. */
  lockView: PropTypes.bool,
};

export default TileRouteMap;
