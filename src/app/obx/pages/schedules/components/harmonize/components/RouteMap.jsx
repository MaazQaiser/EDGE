import { Box, Button, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Circle, GoogleMap, InfoWindow, Marker, Polyline } from '@react-google-maps/api';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { kmToMiles } from 'src/app/common/pages/settings/preferences/harmonization/harmonizationSettings';

import { useStyles } from '../harmonize.styles';
import { PIN_FILL, START_BADGE } from './MapPins';
import TileRouteMap from './TileRouteMap';

/**
 * The route, on a real map, and editable there.
 *
 * The map is not a read-out any more — it is one of the two places the plan can be
 * changed. Clicking a stop offers to drop it to the next day; clicking a spilled
 * visit offers to pull it into this one. Both go through the same handlers the stop
 * list uses (`moveToOverflow` / `bringBack`), so the map and the list cannot end up
 * describing different plans, and the solver re-runs either way.
 *
 * Order stays the list's job. Dragging the polyline is deliberately *not* enabled:
 * Google's draggable `DirectionsRenderer` inserts waypoints that are not visits,
 * which would silently corrupt a plan whose whole point is which visits are in it.
 * Dragging a stop marker is out for the same reason — a site's coordinates are a
 * fact about the site, not a property of this route.
 *
 * Pins are drawn the instant the drawer opens: the coordinates came in with the
 * selection, so there is nothing to wait for. The route line is the only thing that
 * arrives late.
 *
 * Purpose-built rather than reusing the shared directions map, which carries a
 * thousand lines of runsheet behaviour this needs none of.
 */
const CONTAINER = { width: '100%', height: '100%' };

/**
 * **No `styles` override, and that is the answer to "this map is too grey".**
 *
 * This carried `googleMapStyles` from `utils/constants`, which opens with
 * `featureType: 'all', visibility: 'off'` and then switches nine feature types back on. The
 * result is a deliberately drained map — no transit, no POI beyond parks, no local road
 * fill, no place labels below locality — which is right for the screens it was written for,
 * where a map is a backdrop behind a form. Here the map is half the workspace and the
 * planner is reading geography off it: which sites cluster, which one is out on its own,
 * whether the ring reaches the industrial park. Google's own basemap says that; a
 * nine-rule subtraction of it does not.
 *
 * Left in `constants` untouched — every other caller still gets the quiet version. This is
 * one screen opting out, not a palette change.
 */
const MAP_OPTIONS = {
  disableDefaultUI: true,
  zoomControl: true,
  clickableIcons: false,
  gestureHandling: 'greedy',
};

const HAS_KEY = Boolean(process.env.REACT_APP_GOOGLE_MAPS_API_KEY);

const RouteMap = ({
  isLoaded,
  startPoint,
  devicePoint,
  stops = [],
  overflowStops = [],
  path = [],
  scatteredPoints = [],
  radiusKm,
  onPickPoint,
  highlightedSiteId,
  onHighlight,
  onMoveToOverflow,
  onBringBack,
  pending = false,
  entering = false,
  fill = false,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const tt = (key, options) => t(`obx.runsheet.harmonize.${key}`, options);

  /* The drawer mounts this component only once the optimizer has finished
     composing, so its first painted frame is also the frame the route line starts
     drawing on. The card rises into place under that; `entering` is what says the
     mount was an arrival rather than a re-render. Both renderers share the class,
     because which one is in use depends on a Maps key and the entrance should
     not. */
  /**
   * Two shapes, one renderer.
   *
   * In a drawer the map was a **card**: a fixed 288px panel with its own inset, stacked
   * between the controls above it and the routes below. As a column it is the region — it
   * takes the height it is given and its legend sits over the bottom of it rather than
   * under it, because a 900px-tall map with a legend strip beneath it wastes the one axis
   * this layout is generous with. `fill` is which of the two, and it is the only thing
   * about this component the layout changes.
   */
  const cardClass = classNames(
    fill ? classes.mapPane : classes.mapCard,
    entering && !fill && classes.mapCardEnter,
  );
  const surfaceClass = fill ? classes.mapPaneSurface : classes.mapSurface;

  const hasKey = HAS_KEY;
  /* Google's marker and polyline options take literal colour strings, so the
     tokens have to be read out of the theme rather than referenced in CSS.
     Reading them is still the point — hard-coded hexes here would drift the
     moment the tenant palette changes. */
  const theme = useTheme();
  const mapRef = useRef(null);
  const [openStopId, setOpenStopId] = useState(null);

  /* Pins exist from the moment the drawer opens — their coordinates arrived with
     the selection, so there is nothing to wait for. Before the solver runs they
     carry no `order`, which is what makes them a set rather than a sequence.
     Both renderers read this, so the keyless map and the Google map show the same
     places at the same time; only the Google path used to wait for a plan, which
     meant a keyed build drew an empty map where the keyless one drew the week.

     Declared above `fitKey` and the effects that read it, deliberately: a `const`
     referenced from a line above its own declaration is a temporal-dead-zone
     ReferenceError that compiles, lints and builds perfectly cleanly and then
     blanks the page at runtime (handoff §7.16). */
  const drawnStops = stops.length
    ? stops
    : scatteredPoints.map((visit) => ({ ...visit, order: null }));

  /**
   * Whether there is a ring: a distance to draw, and a centre to draw it about.
   *
   * **Declared here rather than beside the legend that also reads it.** The fit effect below
   * reads this, and a `const` referenced from above its own declaration is the
   * temporal-dead-zone `ReferenceError` this file's own comments warn about twice. It
   * happens to be survivable in an effect — the callback runs after render, by which point
   * the binding is live — and relying on that puts a landmine under the next person who
   * moves one line of this into a `useMemo`.
   */
  const hasRing = Number.isFinite(radiusKm) && radiusKm > 0 && Boolean(startPoint);

  /* Whether the device position gets a mark of its own. Coincident with the
     start point it would be the same dot twice. */
  const showDevice =
    Boolean(devicePoint) &&
    !(
      startPoint &&
      Math.abs(Number(devicePoint.lat) - Number(startPoint.lat)) < 1e-6 &&
      Math.abs(Number(devicePoint.lng) - Number(startPoint.lng)) < 1e-6
    );

  /* Refit whenever the set of things on the map changes, so a stop moving to
     overflow never leaves the viewport pointing at nothing. */
  const fitKey = `${startPoint?.lat},${startPoint?.lng}|${devicePoint?.lat},${
    devicePoint?.lng
  }|${drawnStops.map((stop) => stop.siteId).join(',')}|${overflowStops
    .map((stop) => stop.siteId)
    .join(',')}`;

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !window.google) return;

    const points = [...drawnStops, ...overflowStops];
    if (startPoint) points.push(startPoint);
    if (devicePoint) points.push(devicePoint);
    if (!points.length) return;

    const bounds = new window.google.maps.LatLngBounds();
    points.forEach((point) => bounds.extend({ lat: Number(point.lat), lng: Number(point.lng) }));

    /* **The ring is framed but does not trigger a refit**, matching `TileRouteMap` — the
       effect keys on `fitKey`, which is places only, so dragging the radius redraws the
       circle at the same scale rather than re-fitting the view under the planner's thumb.
       `Circle.getBounds()` is exact and needs no trigonometry; it is available because the
       circle is a Maps object rather than an SVG shape on this path. */
    if (hasRing) {
      const ring = new window.google.maps.Circle({
        center: { lat: Number(startPoint.lat), lng: Number(startPoint.lng) },
        radius: radiusKm * 1000,
      });
      bounds.union(ring.getBounds());
    }

    /* 48, matching `FIT_PADDING` in `TileRouteMap`. The two were 36 and 48, so the same run sat
       at two different scales depending on whether a Maps key was present. */
    map.fitBounds(bounds, { top: 48, right: 48, bottom: 48, left: 48 });
  }, [fitKey, isLoaded]);

  /* An edit removes the thing the bubble was describing, so the bubble goes with
     it rather than hanging over a pin that is no longer there. */
  useEffect(() => {
    if (!openStopId) return;
    const stillOnMap = [...drawnStops, ...overflowStops].some((stop) => stop.siteId === openStopId);
    if (!stillOnMap) setOpenStopId(null);
  }, [openStopId, stops, scatteredPoints, overflowStops]);

  /* The key travels with the map, in the map's own card. Marks are described by
     the same tokens the pins and the polyline are drawn from, so a colour cannot
     drift between the map and its legend.
     Every entry is conditional on its mark actually being drawn. It used to name
     a route and a starting point unconditionally — so the panel a planner sees
     before setting an origin advertised two marks that were not on it, which is
     the map equivalent of a control that does nothing. */
  const hasRouteLine = stops.length > 0 && Boolean(startPoint);
  const legend = [
    ...(hasRouteLine
      ? [{ key: 'legendRoute', kind: 'line', color: theme.palette.surfaceBrand }]
      : []),
    /* The ring earns a legend entry because it is the only mark on the map that is a
       *rule* rather than a place, and it is the one that explains the grey pins
       outside it. Interpolated, so the key states the number it was drawn at. */
    ...(hasRing
      ? [
          {
            key: 'legendRadius',
            kind: 'ring',
            color: theme.palette.surfaceBrand,
            options: { mi: Math.round(kmToMiles(radiusKm)) },
          },
        ]
      : []),
    ...(drawnStops.length
      ? [
          {
            key: stops.length ? 'legendStop' : 'legendSelected',
            kind: 'dot',
            /* The pin's fill, not the palette's brand: see `MapPins`. */
            color: PIN_FILL,
          },
        ]
      : []),
    ...(startPoint ? [{ key: 'legendStart', kind: 'dot', color: START_BADGE }] : []),
    ...(showDevice
      ? [{ key: 'legendDevice', kind: 'ring', color: theme.palette.surfaceBrand }]
      : []),
    ...(overflowStops.length
      ? [{ key: 'legendNotInPlan', kind: 'dot', color: theme.palette.textSecondary3 }]
      : []),
  ];

  /* **No pick hint drawn on the map.** It read *Click the map to set the start point* on a
     plate top-left, and it was removed by request: the field it moves is 400px to the left
     with its own label and the address in it, and an overlay restating a labelled control
     covers geography to say something the column already says. `onPickPoint` still decides
     whether the click does anything — the affordance is undocumented on the surface, which
     is the trade. */
  const legendStrip = (
    <Box className={classNames(classes.mapLegend, fill && classes.mapLegendOverlay)}>
      {legend.map((item) => (
        <Box key={item.key} className={classes.mapLegendItem}>
          <Box
            className={classNames(
              item.kind === 'line' && classes.mapLegendLine,
              item.kind === 'dot' && classes.mapLegendDot,
              item.kind === 'ring' && classes.mapLegendRing,
            )}
            sx={
              item.kind === 'ring'
                ? { borderColor: item.color, background: 'transparent' }
                : { background: item.color }
            }
          />
          <Typography className={classes.mapLegendText}>{tt(item.key, item.options)}</Typography>
        </Box>
      ))}
    </Box>
  );

  /* No key, or the SDK failed to load. We never instantiate a Google map we cannot
     key — it draws its own "can't load Maps" modal over the drawer (§7.21) — but
     "no key" is not a reason to show no map. `TileRouteMap` renders the same
     OpenStreetMap streets from keyless raster tiles and carries the same editing
     contract, so the drawer works fully either way and a key upgrades the renderer
     rather than enabling the feature. */
  if (!isLoaded) {
    /* Before a start point there is no sequence, but there are still places. This
       is the "here is your week, scattered" state — it drew nothing at all because
       the only points the map had came from the solved plan. */
    const hasPlaces = Boolean(
      startPoint || devicePoint || drawnStops.length || overflowStops.length,
    );

    return (
      <Box className={cardClass}>
        <Box className={surfaceClass}>
          {hasPlaces ? (
            <TileRouteMap
              startPoint={startPoint}
              devicePoint={devicePoint}
              stops={drawnStops}
              overflowStops={overflowStops}
              radiusKm={hasRing ? radiusKm : null}
              onPickPoint={onPickPoint}
              highlightedSiteId={highlightedSiteId}
              onHighlight={onHighlight}
              onMoveToOverflow={onMoveToOverflow}
              onBringBack={onBringBack}
              pending={pending}
            />
          ) : (
            <Box className={classes.mapPlaceholder}>
              <Typography className={classes.mapPlaceholderText}>
                {tt(hasKey ? 'mapUnavailable' : 'mapNoKey')}
              </Typography>
            </Box>
          )}
        </Box>
        {legendStrip}
      </Box>
    );
  }

  const pin = (fill, label) => ({
    path: window.google.maps.SymbolPath.CIRCLE,
    scale: label ? 13 : 9,
    fillColor: fill,
    fillOpacity: 1,
    strokeColor: theme.palette.surfaceWhite,
    strokeWeight: 2,
  });

  const openStop =
    [...drawnStops, ...overflowStops].find((stop) => stop.siteId === openStopId) || null;
  const openStopIsSpilled =
    Boolean(openStop) && overflowStops.some((stop) => stop.siteId === openStopId);

  /* The caller supplies both: the sentence, because it knows the cause, and whether
     there is anything to be done about it. A stop inside the route is always
     actionable — taking it out is the action. */
  const reasonLine = openStopIsSpilled ? openStop?.excludeNote || '' : '';
  const canAct = openStopIsSpilled ? Boolean(openStop?.canInclude) : true;

  return (
    <Box className={cardClass}>
      <Box className={surfaceClass}>
        <GoogleMap
          mapContainerStyle={CONTAINER}
          options={MAP_OPTIONS}
          zoom={11}
          center={
            startPoint
              ? { lat: Number(startPoint.lat), lng: Number(startPoint.lng) }
              : {
                  lat: Number(devicePoint?.lat ?? drawnStops[0]?.lat) || 28.0587,
                  lng: Number(devicePoint?.lng ?? drawnStops[0]?.lng) || -82.4572,
                }
          }
          onLoad={(map) => {
            mapRef.current = map;
          }}
          /* The keyed twin of `TileRouteMap`'s `handleSurfaceClick`. Google does not fire
             this for clicks that land on a marker or on its own controls, so the two
             exclusions the tile renderer has to make by hand come free here. */
          onClick={
            onPickPoint
              ? (event) => {
                  if (!event.latLng) return;
                  onPickPoint({ lat: event.latLng.lat(), lng: event.latLng.lng() });
                }
              : undefined
          }
        >
          {/* **First, so everything is drawn on top of it.** The ring is the ground
              the plan stands on: it is the distance the van will travel today, and a
              grey pin outside it has explained itself before the planner reads a word.
              Barely-there fill and a hairline stroke, because a saturated 10km disc
              across a 240px panel would be the loudest thing on a map whose subject is
              the route.

              **Excluded from `fitBounds`, unlike the version this restores.** That one
              was added to the bounds because a ring wider than the viewport was being
              cropped — which fixed the crop and gave the *stops* less room than they
              had, on every run where the radius was generous. A cropped ring is a
              legible mark: its arc still reads as a circle and its centre is on screen.
              A route squeezed into the middle third of the panel to make room for empty
              circumference is not a better trade. So the fit frames the work, and the
              ring is allowed to run off the edge. */}
          {hasRing && (
            <Circle
              center={{ lat: Number(startPoint.lat), lng: Number(startPoint.lng) }}
              radius={radiusKm * 1000}
              options={{
                strokeColor: theme.palette.surfaceBrand,
                strokeOpacity: 0.7,
                strokeWeight: 1.5,
                fillColor: theme.palette.surfaceBrand,
                fillOpacity: 0.06,
                clickable: false,
                zIndex: 0,
              }}
            />
          )}

          {path.length > 1 && (
            <Polyline
              path={path}
              options={{
                strokeColor: theme.palette.surfaceBrand,
                strokeOpacity: pending ? 0.35 : 0.9,
                strokeWeight: 4,
              }}
            />
          )}

          {startPoint && (
            <Marker
              position={{ lat: Number(startPoint.lat), lng: Number(startPoint.lng) }}
              icon={pin(theme.palette.textPrimary)}
              title={startPoint.label || startPoint.address || tt('legendStart')}
              zIndex={5}
            />
          )}

          {/* The planner's own position, when the route is not already leaving
              from it. Ringed rather than filled so it reads as a position and not
              as another stop. */}
          {showDevice && (
            <Marker
              position={{ lat: Number(devicePoint.lat), lng: Number(devicePoint.lng) }}
              icon={{
                path: window.google.maps.SymbolPath.CIRCLE,
                scale: 6,
                fillColor: theme.palette.surfaceBrand,
                fillOpacity: 1,
                strokeColor: theme.palette.surfaceWhite,
                strokeWeight: 3,
              }}
              title={tt('mapYouAreHere')}
              zIndex={4}
            />
          )}

          {drawnStops.map((stop) => (
            <Marker
              key={stop.siteId}
              position={{ lat: Number(stop.lat), lng: Number(stop.lng) }}
              icon={pin(
                highlightedSiteId === stop.siteId
                  ? theme.palette.surfaceBrandHover
                  : theme.palette.surfaceBrand,
                stop.order != null,
              )}
              /* A number only where the solver produced one. Labelling an
                 unsolved pin `null` was the shape this guards against. */
              label={
                stop.order != null
                  ? {
                      text: String(stop.order),
                      color: theme.palette.textOnColor,
                      fontSize: '11px',
                      fontWeight: '600',
                    }
                  : undefined
              }
              /* Names the site without printing twelve labels over the streets —
                 the keyless renderer draws real text because it has no native
                 tooltip to fall back on. */
              title={stop.siteName || stop.name || ''}
              zIndex={highlightedSiteId === stop.siteId ? 20 : 10}
              onMouseOver={() => onHighlight?.(stop.siteId)}
              onMouseOut={() => onHighlight?.(null)}
              onClick={() => setOpenStopId(stop.siteId)}
            />
          ))}

          {/* Spilled visits stay on the map, greyed — they are still part of the
              week the planner is looking at, just not part of this day. Clicking
              one is how it comes back. */}
          {overflowStops.map((stop) => (
            <Marker
              key={stop.siteId}
              position={{ lat: Number(stop.lat), lng: Number(stop.lng) }}
              icon={pin(theme.palette.textSecondary3)}
              zIndex={1}
              onMouseOver={() => onHighlight?.(stop.siteId)}
              onMouseOut={() => onHighlight?.(null)}
              onClick={() => setOpenStopId(stop.siteId)}
            />
          ))}

          {openStop && (
            <InfoWindow
              position={{ lat: Number(openStop.lat), lng: Number(openStop.lng) }}
              onCloseClick={() => setOpenStopId(null)}
              options={{ pixelOffset: new window.google.maps.Size(0, -14) }}
            >
              <Box className={classes.mapBubble}>
                <Typography className={classes.mapBubbleTitle}>
                  {openStop.siteName || openStop.name}
                </Typography>

                {/* **Why this pin is grey, on the pin.** A mark outside the plan used
                    to offer nothing but a button, which asked the planner to work out
                    from its position why it was not in the route. The reason travels on
                    the stop, so the bubble can state it — and where the reason is the
                    need-by window there is no button, because pulling a visit onto a
                    date its contract forbids is not a thing a click should do quietly.
                    Widening the window is the panel's remedy, and it is on the
                    record. */}
                {reasonLine ? (
                  <Typography className={classes.mapBubbleReason}>{reasonLine}</Typography>
                ) : null}

                {/* One action per bubble, and it is the one the stop's own state
                    calls for — in the day, take it out; out of the day, put it
                    in. Both re-solve, so the line redraws either way. */}
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
            </InfoWindow>
          )}
        </GoogleMap>

        {/* Overlay, not a replacement — the geography stays put while the route
            is being re-solved. Re-mounting `GoogleMap` would re-run `fitBounds`
            and throw the viewport away. */}
        {pending && <Box className={classes.mapPending} />}
      </Box>

      {legendStrip}
    </Box>
  );
};

RouteMap.propTypes = {
  isLoaded: PropTypes.bool,
  startPoint: PropTypes.object,
  devicePoint: PropTypes.object,
  stops: PropTypes.array,
  overflowStops: PropTypes.array,
  path: PropTypes.array,
  scatteredPoints: PropTypes.array,
  /** The distance the run will travel from the start point, drawn as a ring. Kilometres,
      and `null` once there is a plan — the ring belongs to the planning state. */
  radiusKm: PropTypes.number,
  /** Called with `{ lat, lng }` for a click on the ground. Absent: clicks do nothing. */
  onPickPoint: PropTypes.func,
  highlightedSiteId: PropTypes.string,
  onHighlight: PropTypes.func,
  onMoveToOverflow: PropTypes.func,
  onBringBack: PropTypes.func,
  pending: PropTypes.bool,
  /** The map is arriving with the answer on it, so the card rises into place. */
  entering: PropTypes.bool,
  /** Fill the region rather than sitting in it as a fixed-height card. */
  fill: PropTypes.bool,
};

export default RouteMap;
