import { Box, Button, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useStyles } from '../harmonizeDrawer.styles';

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
const FIT_PADDING = 48;

/* Long enough to recognise a site, short enough that a label cannot run off a
   240px panel. The stop list carries the full name. */
const LABEL_MAX = 22;
const truncate = (value = '') =>
  value.length > LABEL_MAX ? `${value.slice(0, LABEL_MAX - 1)}…` : value;

/* CARTO's public basemap. Keyless, and its light style is quiet enough that a
   brand-coloured route stays the loudest thing on the panel. Attribution is a
   condition of use, not decoration — it renders bottom-right. */
const TILE_URL = (z, x, y) => `https://a.basemaps.cartocdn.com/light_all/${z}/${x}/${y}.png`;

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

const TileRouteMap = ({
  startPoint,
  devicePoint,
  stops = [],
  overflowStops = [],
  highlightedSiteId,
  onHighlight,
  onMoveToOverflow,
  onBringBack,
  pending = false,
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

  const points = [
    ...(startPoint ? [startPoint] : []),
    ...(devicePoint ? [devicePoint] : []),
    ...stops,
    ...overflowStops,
  ].filter((point) => Number.isFinite(Number(point?.lat)) && Number.isFinite(Number(point?.lng)));

  /* Refit when the set of places changes, not on every render — otherwise panning
     is undone the moment the route re-solves. A deliberate pan or zoom sets its own
     view and this key stops matching until the places themselves change. */
  const fitKey = points.map((point) => `${point.lat},${point.lng}`).join('|');

  useEffect(() => {
    if (!points.length || !size.width || !size.height) return;
    setView(fitView(points, size.width, size.height));
    // Refit is keyed on the places and the viewport, never on the plan's order.
  }, [fitKey, size.width, size.height]);

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
    const origin = project(view.center.lat, view.center.lng, view.zoom);
    dragRef.current = { x: event.clientX, y: event.clientY, origin };
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const onPointerMove = (event) => {
    const drag = dragRef.current;
    if (!drag || !view) return;
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
  stops.forEach((stop) => {
    if (stop.order != null && highlightedSiteId !== stop.siteId) return;
    labels.push({
      key: `stop-${stop.siteId}`,
      at: toScreen(stop),
      dy: highlightedSiteId === stop.siteId ? 28 : 25,
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
        {linePath && (
          <>
            {/* Casing under the line so it stays legible over street detail. */}
            <path
              d={linePath}
              fill="none"
              stroke={theme.palette.surfaceWhite}
              strokeWidth="8"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.9"
            />
            <path
              d={linePath}
              fill="none"
              stroke={theme.palette.surfaceBrand}
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={pending ? 0.4 : 1}
            />
          </>
        )}

        {overflowStops.map((stop) => {
          const at = toScreen(stop);
          return (
            <circle
              key={stop.siteId}
              data-map-mark="true"
              cx={at.x}
              cy={at.y}
              r={highlightedSiteId === stop.siteId ? 8 : 6}
              fill={theme.palette.textSecondary3}
              stroke={theme.palette.surfaceWhite}
              strokeWidth="2"
              style={{ cursor: 'pointer' }}
              onMouseEnter={() => onHighlight?.(stop.siteId)}
              onMouseLeave={() => onHighlight?.(null)}
              onClick={() => setOpenStopId(stop.siteId)}
            />
          );
        })}

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

        {startPoint && (
          <circle
            cx={toScreen(startPoint).x}
            cy={toScreen(startPoint).y}
            r="9"
            fill={theme.palette.textPrimary}
            stroke={theme.palette.surfaceWhite}
            strokeWidth="3"
          />
        )}

        {stops.map((stop) => {
          const at = toScreen(stop);
          const isHighlighted = highlightedSiteId === stop.siteId;
          return (
            <g
              key={stop.siteId}
              data-map-mark="true"
              style={{ cursor: 'pointer' }}
              onMouseEnter={() => onHighlight?.(stop.siteId)}
              onMouseLeave={() => onHighlight?.(null)}
              onClick={() => setOpenStopId(stop.siteId)}
            >
              <circle
                cx={at.x}
                cy={at.y}
                r={isHighlighted ? 15 : 12}
                fill={isHighlighted ? theme.palette.surfaceBrandHover : theme.palette.surfaceBrand}
                stroke={theme.palette.surfaceWhite}
                strokeWidth="3"
              />
              {stop.order != null && (
                <text
                  x={at.x}
                  y={at.y + 4}
                  textAnchor="middle"
                  fontSize="11"
                  fontWeight="600"
                  fill={theme.palette.textOnColor}
                  style={{ pointerEvents: 'none', userSelect: 'none' }}
                >
                  {stop.order}
                </text>
              )}
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
          className={classes.tileMapBubble}
          sx={{ left: openStopScreen.x, top: openStopScreen.y - 18 }}
        >
          <Typography className={classes.mapBubbleTitle}>
            {openStop.siteName || openStop.name}
          </Typography>
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
        </Box>
      )}

      <Box className={classes.tileMapZoom}>
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
  highlightedSiteId: PropTypes.string,
  onHighlight: PropTypes.func,
  onMoveToOverflow: PropTypes.func,
  onBringBack: PropTypes.func,
  pending: PropTypes.bool,
};

export default TileRouteMap;
