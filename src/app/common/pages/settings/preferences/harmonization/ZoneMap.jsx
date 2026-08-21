import { Box, Button, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  fitView,
  MAX_ZOOM,
  metresPerPixel,
  MIN_ZOOM,
  project,
  tilesFor,
  unproject,
} from 'src/app/obx/pages/schedules/components/harmonize/tileProjection';

import { useStyles } from './harmonization.styles';

/**
 * The map a zone is drawn on.
 *
 * Presentational on purpose: it renders a shape and reports clicks, and it has no opinion
 * about which sites the shape caught. The dialog above it owns the points, the anchor, the
 * radius and the containment test — which means the same containment answer drives both
 * the pins here and the readout there, and the two cannot disagree about whether
 * Fairmont is in.
 *
 * **Pan and zoom are the same gestures as the workspace's route map**, and the Mercator
 * behind them is literally the same code (`tileProjection`). A planner who has learned to
 * drag one of these maps has learned both.
 *
 * `DRAG_SLOP` is the part worth knowing about: a pan ends in a `click` on the element it
 * started on, so without a slop threshold a planner who dragged the map 300px would also
 * have dropped a boundary point wherever they let go. 4px is the wobble a deliberate
 * click carries, not a judgement about what counts as a drag.
 */

const DRAG_SLOP = 4;
const MILES_TO_METRES = 1609.344;

/**
 * A tighter fit than the route map's 48.
 *
 * That padding exists so a route's end pins are not flush against the panel edge. Here the
 * content is a whole territory and the surface is 400px tall, so 48 per edge spent nearly a
 * quarter of the height on margin and pushed a 43-mile spread of sites down to 8px a mile —
 * far enough out that the streets under them stopped being identifiable, which is the one
 * thing the real basemap is here for.
 */
const FIT_PADDING = 28;

/** Long enough to recognise a site, short enough not to collide with its neighbour. */
const LABEL_MAX = 20;
const truncate = (value = '') =>
  value.length > LABEL_MAX ? `${value.slice(0, LABEL_MAX - 1)}\u2026` : value;

const ZoneMap = ({
  sites = [],
  capturedIds,
  labelIds,
  basePoint = null,
  points = [],
  anchor = null,
  radiusMiles = null,
  hint = '',
  onPick,
}) => {
  const classes = useStyles();
  const theme = useTheme();

  const containerRef = useRef(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [view, setView] = useState(null);
  const dragRef = useRef(null);
  const movedRef = useRef(false);
  const fittedRef = useRef(false);

  useLayoutEffect(() => {
    const node = containerRef.current;
    if (!node) return undefined;

    const measure = () => setSize({ width: node.clientWidth || 0, height: node.clientHeight || 0 });
    measure();
    /* The dialog animates in, so the first measurement can land while the surface is still
       0px wide — which would fit the view to nothing. */
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  /**
   * Fit once, to the sites, and then leave the view alone.
   *
   * Deliberately **not** refitting when the shape changes. The shape is what the planner
   * is editing, and a map that re-centred on every dropped point would move the ground
   * out from under the next click. The sites are the fixed thing here, so they are what
   * the opening view is chosen for.
   */
  const fitKey = sites.map((site) => `${site.lat},${site.lng}`).join('|');
  useEffect(() => {
    if (fittedRef.current) return;
    if (!size.width || !size.height) return;

    const fitPoints = [...sites, ...(basePoint ? [basePoint] : [])].filter(
      (point) => Number.isFinite(Number(point?.lat)) && Number.isFinite(Number(point?.lng)),
    );
    if (!fitPoints.length) return;

    fittedRef.current = true;
    setView(fitView(fitPoints, size.width, size.height, FIT_PADDING));
  }, [fitKey, size.width, size.height, basePoint]);

  const zoomBy = useCallback(
    (delta) =>
      setView((previous) =>
        previous
          ? { ...previous, zoom: Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, previous.zoom + delta)) }
          : previous,
      ),
    [],
  );

  const isChrome = (event) => Boolean(event.target?.closest?.('[data-map-chrome]'));

  const onPointerDown = (event) => {
    if (!view || isChrome(event)) return;
    dragRef.current = {
      x: event.clientX,
      y: event.clientY,
      origin: project(view.center.lat, view.center.lng, view.zoom),
    };
    movedRef.current = false;
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const onPointerMove = (event) => {
    const drag = dragRef.current;
    if (!drag || !view) return;

    if (
      Math.abs(event.clientX - drag.x) > DRAG_SLOP ||
      Math.abs(event.clientY - drag.y) > DRAG_SLOP
    )
      movedRef.current = true;

    /* Pan in pixel space and convert back once, so a long gesture cannot accumulate
       projection error. */
    const nextX = drag.origin.x - (event.clientX - drag.x);
    const nextY = drag.origin.y - (event.clientY - drag.y);
    setView((previous) => ({ ...previous, center: unproject(nextX, nextY, previous.zoom) }));
  };

  const endDrag = (event) => {
    dragRef.current = null;
    event.currentTarget.releasePointerCapture?.(event.pointerId);
  };

  if (!view || !size.width || !size.height) {
    return <Box ref={containerRef} className={classes.zoneMapRoot} />;
  }

  const { zoom, center } = view;
  const centrePx = project(center.lat, center.lng, zoom);
  const originX = centrePx.x - size.width / 2;
  const originY = centrePx.y - size.height / 2;

  const toScreen = (point) => {
    const world = project(Number(point.lat), Number(point.lng), zoom);
    return { x: world.x - originX, y: world.y - originY };
  };

  const handleClick = (event) => {
    if (!onPick || movedRef.current || isChrome(event)) return;
    const rect = event.currentTarget.getBoundingClientRect();
    onPick(
      unproject(originX + (event.clientX - rect.left), originY + (event.clientY - rect.top), zoom),
    );
  };

  const tiles = tilesFor({
    originX,
    originY,
    width: size.width,
    height: size.height,
    zoom,
  });

  const ringPx =
    anchor && Number.isFinite(Number(radiusMiles)) && Number(radiusMiles) > 0
      ? (Number(radiusMiles) * MILES_TO_METRES) / metresPerPixel(Number(anchor.lat), zoom)
      : 0;

  const boundary = points.map(toScreen);
  const boundaryPath = boundary.length
    ? `${boundary.map((point) => `${point.x},${point.y}`).join(' ')}`
    : '';

  return (
    <Box
      ref={containerRef}
      className={classes.zoneMapRoot}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onClick={handleClick}
      onWheel={(event) => {
        event.preventDefault();
        zoomBy(event.deltaY > 0 ? -1 : 1);
      }}
      role="application"
      aria-label={hint}
    >
      {tiles.map((tile) => (
        <Box
          key={tile.key}
          component="img"
          src={tile.url}
          alt=""
          draggable={false}
          className={classes.zoneMapTile}
          sx={{ left: tile.left, top: tile.top }}
        />
      ))}

      <Box
        component="svg"
        className={classes.zoneMapOverlay}
        viewBox={`0 0 ${size.width} ${size.height}`}
        /* The overlay is exactly the surface's content box and both are measured from the
           same `clientWidth`, so there is nothing to preserve the aspect of — but stating
           it stops a browser default from quietly scaling the shape away from its own
           vertex handles. */
        preserveAspectRatio="none"
      >
        {/* **The shape, under the pins.** A dashed stroke rather than solid: a solid ring
            on a street map reads as something that exists on the ground, and this is a
            rule about which sites belong together. */}
        {ringPx > 0 && anchor ? (
          <circle
            cx={toScreen(anchor).x}
            cy={toScreen(anchor).y}
            r={ringPx}
            fill={theme.palette.surfaceBrand}
            fillOpacity={0.07}
            stroke={theme.palette.surfaceBrand}
            strokeOpacity={0.8}
            strokeWidth={1.5}
            strokeDasharray="6 5"
          />
        ) : null}

        {boundaryPath && points.length >= 3 ? (
          <polygon
            points={boundaryPath}
            fill={theme.palette.surfaceBrand}
            fillOpacity={0.07}
            stroke={theme.palette.surfaceBrand}
            strokeOpacity={0.9}
            strokeWidth={1.5}
            strokeDasharray="6 5"
            strokeLinejoin="round"
          />
        ) : null}

        {/* Fewer than three points is not a shape yet, so it is drawn as the line it is
            rather than as a polygon that would close itself and imply an area. */}
        {boundaryPath && points.length === 2 ? (
          <polyline
            points={boundaryPath}
            fill="none"
            stroke={theme.palette.surfaceBrand}
            strokeWidth={1.5}
            strokeDasharray="6 5"
          />
        ) : null}

        {points.map((point, index) => {
          const at = toScreen(point);
          return (
            <circle
              key={`vertex-${index}`}
              cx={at.x}
              cy={at.y}
              r={5}
              fill={theme.palette.surfaceWhite}
              stroke={theme.palette.surfaceBrand}
              strokeWidth={2}
            />
          );
        })}

        {/* Where every runsheet starts, for reference only — it is not part of the zone
            and is drawn as a ring rather than a pin so it cannot be mistaken for one. */}
        {basePoint ? (
          <g>
            <circle
              cx={toScreen(basePoint).x}
              cy={toScreen(basePoint).y}
              r={9}
              fill={theme.palette.textPrimary}
              fillOpacity={0.12}
            />
            <circle
              cx={toScreen(basePoint).x}
              cy={toScreen(basePoint).y}
              r={4.5}
              fill={theme.palette.textPrimary}
              stroke={theme.palette.surfaceWhite}
              strokeWidth={2}
            />
          </g>
        ) : null}

        {anchor ? (
          <g transform={`translate(${toScreen(anchor).x} ${toScreen(anchor).y})`}>
            <circle r={7} fill={theme.palette.surfaceBrand} stroke="#ffffff" strokeWidth={3} />
          </g>
        ) : null}

        {sites.map((site) => {
          const at = toScreen(site);
          const inside = capturedIds?.has(site.id);
          return (
            <g key={site.id}>
              <circle
                cx={at.x}
                cy={at.y}
                r={inside ? 6 : 5}
                fill={inside ? theme.palette.surfaceBrand : theme.palette.surfaceWhite}
                /* **A captured site is not distinguished by fill alone.** Outside pins
                   keep a dark rim and a white centre, which is a different mark rather
                   than a paler one — a 1.9:1 grey ring on a raster map is not a
                   distinction anybody can see, and colour on its own is not one anybody
                   colour-blind can. */
                stroke={inside ? '#ffffff' : theme.palette.borderStrong2}
                strokeWidth={inside ? 2 : 1.5}
              />
              {inside ? (
                <circle
                  cx={at.x}
                  cy={at.y}
                  r={8}
                  fill="none"
                  stroke={theme.palette.surfaceBrand}
                  strokeWidth={1.5}
                  strokeOpacity={0.5}
                />
              ) : null}
              {/**
               * **Not every site gets a name.** Fifteen labels over a clustered metro is a
               * grey smear — five of them collided into illegibility in the first render of
               * this map. The caller decides which ones matter (the captured set, plus the
               * few nearest the edge), which is the same set and the same order the readout
               * below lists, so the map and the list point at each other rather than each
               * naming a different subset.
               *
               * Painted stroke-first: a halo is what makes text legible over raster streets
               * without a solid plate behind every word.
               */}
              {!labelIds || labelIds.has(site.id) ? (
                <text
                  x={at.x}
                  y={at.y + 19}
                  textAnchor="middle"
                  fontSize="11"
                  fontWeight="600"
                  fill={inside ? theme.palette.textPrimary : theme.palette.textSecondary2}
                  stroke={theme.palette.surfaceWhite}
                  strokeWidth="3"
                  style={{ paintOrder: 'stroke' }}
                >
                  {truncate(site.name)}
                </text>
              ) : null}
            </g>
          );
        })}
      </Box>

      <Box data-map-chrome="true" className={classes.zoneMapZoom}>
        <Button
          className={classes.zoneMapZoomButton}
          onClick={() => zoomBy(1)}
          aria-label="Zoom in"
        >
          +
        </Button>
        <Button
          className={classes.zoneMapZoomButton}
          onClick={() => zoomBy(-1)}
          aria-label="Zoom out"
        >
          &minus;
        </Button>
      </Box>

      {hint ? (
        <Typography variant="body3" className={classes.zoneMapHint} data-map-chrome="true">
          {hint}
        </Typography>
      ) : null}

      <Typography className={classes.zoneMapAttribution} data-map-chrome="true">
        © OpenStreetMap contributors © CARTO
      </Typography>
    </Box>
  );
};

ZoneMap.propTypes = {
  sites: PropTypes.array,
  capturedIds: PropTypes.object,
  labelIds: PropTypes.object,
  basePoint: PropTypes.object,
  points: PropTypes.array,
  anchor: PropTypes.object,
  radiusMiles: PropTypes.number,
  hint: PropTypes.string,
  onPick: PropTypes.func,
};

export default ZoneMap;
