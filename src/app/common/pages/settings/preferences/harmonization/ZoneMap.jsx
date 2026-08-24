import { Box, Button, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
/* The zone hues, imported rather than restated: they are a validated set, and one table is
   what makes North the same blue here as on the Harmonize map. `zonePalette/index.js` carries
   the argument — the gate they cleared, the id-keyed contract, and the contrast debt two of
   them still owe — and it is not repeated here, because two copies of a long argument drift.
   `zoneColor` rather than the table, so the grey fallback cannot be forgotten. */
import { zoneColor } from 'src/app/components/common/zonePalette';
import {
  fitView,
  MAX_ZOOM,
  metresPerPixel,
  MIN_ZOOM,
  project,
  simplifyToBudget,
  tilesFor,
  unproject,
} from 'src/app/obx/pages/schedules/components/harmonize/tileProjection';

import { useStyles } from './harmonization.styles';
import { ZONE_DEFINITIONS } from './zoneSites';

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
const METRES_TO_MILES = 1 / MILES_TO_METRES;

/** Matches `ZONE_POINTS_MAX` in the settings module: what a stored boundary may hold. */
const MAX_BOUNDARY_POINTS = 60;

/** A freehand trail only records a point once the pointer has actually travelled. */
const TRAIL_MIN_STEP = 3;

/** How close to the ring's edge a grab counts as grabbing the ring. */
const HANDLE_GRAB_SLOP = 14;

/**
 * Pointer capture, but never fatal.
 *
 * `setPointerCapture` throws `NotFoundError` for a pointer id the browser has not seen — a
 * synthetic event, a device that released mid-gesture — and the throw would abandon the
 * gesture at the first `pointerdown`. Capture is an improvement here rather than a
 * requirement: every handler is bound to the same element, so a drag that leaves the
 * surface degrades to ending early instead of breaking.
 */
/* **Both of these used to call themselves**, not the DOM. The recursion had no base case,
   so every `pointerdown` and every release ran the stack to `RangeError` and unwound —
   which the comment-only `catch` then swallowed. Nothing appeared in the console and
   nothing crashed; capture simply never happened, which is precisely the failure the
   paragraph above claims to prevent, plus a stack overflow on the hot path of a drag. */
const capturePointer = (event) => {
  try {
    event.currentTarget.setPointerCapture(event.pointerId);
  } catch {
    /* Not available for this pointer; the handlers still work without it. */
  }
};

const releasePointer = (event) => {
  try {
    event.currentTarget.releasePointerCapture(event.pointerId);
  } catch {
    /* Nothing was captured. */
  }
};

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

/**
 * How heavily a zone is drawn — the Harmonize map's emphasis vocabulary, in the two states
 * this screen is in a position to know.
 *
 * The numbers are lifted unchanged from `harmonizeSplit/components/ZoneRouteMap.jsx` so a
 * territory carries the same weight wherever a planner meets it: fill 0.18 / 0.1, stroke
 * 2.25 / 1.4, stroke opacity 0.95 / 0.6. The fills are low because they stack over a raster
 * basemap — past about 0.20 the tint stops being a tint and starts hiding the streets that
 * make the territory legible in the first place.
 *
 * **These numbers assume shapes that mostly do not stack, and this screen can break that
 * assumption.** The workspace map's tests pin "no point inside three or more zones"; nothing
 * here does, because a boundary is a freehand drag and `harmonizationSettings` says plainly
 * that two overlapping shapes are legal — the site's single `zoneId` decides membership, so
 * the last shape drawn simply wins the site. Where the zone being edited crosses two others
 * the fills compound to about 0.34 over the basemap (1 − 0.82 × 0.9 × 0.9), and three others
 * takes it to 0.40 — past the point where the streets underneath are readable. Two zones
 * overlapping is comfortable, which is the case a planner actually produces while redrawing a
 * border; if this screen ever grows a triple overlap it is the fills that will have to give,
 * not the strokes, since the strokes are what say which shape is which.
 *
 * Split's other two states are deliberately **absent rather than copied**. `hovered` needs a
 * pointer target and this overlay has none (see the locked-zones note below — it is
 * `pointer-events: none` in full). `idle` means "no day works this zone in this range", which
 * is a fact about a schedule the editor is never handed. Copying either would leave a key
 * nothing reads, which Split has already paid for once: its stroke ternary ended
 * `: ZONE_STROKE.worked`, so `idle` was never read and the constant looked broken.
 */
const ZONE_EMPHASIS = {
  open: { fill: 0.18, stroke: 2.25, strokeOpacity: 0.95 },
  worked: { fill: 0.1, stroke: 1.4, strokeOpacity: 0.6 },
};

/**
 * **The weight every already-drawn zone gets — one weight for all of them, and never dashed.**
 *
 * This is the interesting decision on this map, because it is where the two screens' visual
 * languages collide. On the Harmonize map a dashed boundary means *nobody works this zone in
 * this range*, and that solid/dashed pair is half of what the relief there is saying. This
 * panel is handed `otherZones` carrying an id, a name and a shape — and **nothing about the
 * schedule.** Dashing them would assert a fact the editor does not have, and a planner would
 * read a confident answer off a component that was guessing. So they are all solid, and the
 * schedule stays the business of the surface that knows it.
 *
 * One emphasis rather than a per-zone judgement for the same reason: there is no per-zone fact
 * here to judge on. `worked` rather than `idle` because `idle`'s 0.05 fill is the weight of a
 * zone being pushed out of the way in favour of one open one, and these are not in the way —
 * they are the context that stops a planner drawing over territory that is already taken.
 * Split makes the same argument in reverse: its `worked` sits close to `open` precisely so a
 * map full of non-open zones is still a map of somebody's ground.
 */
const OTHER_ZONE_EMPHASIS = ZONE_EMPHASIS.worked;

/**
 * Which palette slot the zone being edited owns.
 *
 * The hue is keyed by the zone's **id**, which is what makes North the same blue here as on
 * the Harmonize map. The map is not handed one: `ZoneEditorPanel` builds the props it shares
 * between the two experiences out of the live name field, so the id stays behind in the panel.
 * `activeZoneId` is the prop to pass the day a caller has it to hand; failing that the name is
 * resolved through `ZONE_DEFINITIONS`, which is the real name→id table — rather than
 * lowercasing the name and hoping that is the id, which is true of today's four by coincidence.
 *
 * A name that matches nothing — a zone somebody renamed, a fifth zone just added — falls
 * through to `zoneColor`'s grey, and that is the honest answer rather than a gap: the palette
 * has four slots, and a zone with no slot should look unassigned. Guessing from *which id is
 * missing from `otherZones`* was the alternative and it is worse than it looks: that list
 * drops zones with no shape yet, so on a fresh rule it is empty and every id looks like the
 * active one — which is how a brand-new zone would come to be painted North's blue.
 */
const zoneIdForName = (name = '') => {
  const wanted = String(name).trim().toLowerCase();
  if (!wanted) return null;
  const match = ZONE_DEFINITIONS.find((zone) => zone.name.trim().toLowerCase() === wanted);
  return match ? match.id : null;
};

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
  otherZones = [],
  activeZoneName = '',
  activeZoneId = null,
  invalid = false,
  hint = '',
  /**
   * `draw`   — drag to lasso an area (the boundary experience)
   * `select` — click a site to centre on it, drag the ring's edge to resize (radius)
   * `view`   — no shape to author here (zip codes); panning and zoom still work
   */
  interaction = 'select',
  /* The zone-method switcher, floating bottom-right. Passed in rather than built here
     because the map does not own which experience is mounted — it only lends the corner. */
  switcher = null,
  /* Lets a caller that owns the map's box raise its height — the day-radius dialog does,
     because a dialog has no spare flex the way the editor panel has. */
  className = '',
  /* Changes when the map is showing a *different* thing — a different zone, a different
     day's circle. Refits the view; a pan inside one open survives. */
  fitToken = null,
  onShapeDrawn,
  onDropPin,
  onRadiusDragged,
}) => {
  const classes = useStyles();
  const theme = useTheme();

  const containerRef = useRef(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [view, setView] = useState(null);
  const dragRef = useRef(null);
  const movedRef = useRef(false);
  const fittedRef = useRef(false);
  /* The in-progress lasso, in screen pixels. Local to the map because it is a gesture, not
     a value: the panel only ever sees the finished ring. */
  const [trail, setTrail] = useState(null);
  const trailRef = useRef(null);
  /* Set while the ring's edge is being dragged, so a resize does not also pan. */
  const ringDragRef = useRef(false);

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
   * Fit when the thing being edited changes, and then leave the view alone.
   *
   * Still **not** refitting as the shape is drawn — a map that re-centred on every dropped
   * point would move the ground out from under the next click. But "fit once, ever" was too
   * few: this map does not unmount between zones (the editor panel is hidden, not removed),
   * so `fittedRef` stayed true for the life of the screen. Open North, pan across the metro,
   * close, open East — East's boundary was wherever the last pan left it, usually off screen,
   * which read as the zone having no shape at all.
   *
   * `fitToken` is the caller's answer to "is this a different thing now": the editor panel
   * changes it per zone-open, so each open refits and every pan inside that open survives.
   *
   * **The active shape joins the fit**, which is the other half of the same bug. Fitting to
   * the site book alone put a boundary drawn outside the cluster off screen on the *first*
   * open too, with no pan needed to get there.
   */
  const fitKey = sites.map((site) => `${site.lat},${site.lng}`).join('|');
  useEffect(() => {
    fittedRef.current = false;
  }, [fitToken]);

  useEffect(() => {
    if (fittedRef.current) return;
    if (!size.width || !size.height) return;

    /* The locked shapes join the fit, so opening the panel to add a second zone shows the
       first one rather than putting it just off screen. */
    const otherPoints = otherZones.flatMap((zone) =>
      zone.kind === 'boundary' ? zone.points : zone.anchor ? [zone.anchor] : [],
    );
    const fitPoints = [
      ...sites,
      ...otherPoints,
      ...points,
      ...(anchor ? [anchor] : []),
      ...(basePoint ? [basePoint] : []),
    ].filter((point) => Number.isFinite(Number(point?.lat)) && Number.isFinite(Number(point?.lng)));
    if (!fitPoints.length) return;

    fittedRef.current = true;
    setView(fitView(fitPoints, size.width, size.height, FIT_PADDING));
    /* `points`/`anchor` are read but deliberately absent from the deps: they are the shape
       being edited, and listing them would refit on every drag — the exact behaviour the note
       above refuses. `fitToken` is what says "a different shape is on screen now". */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fitKey, size.width, size.height, basePoint, otherZones, fitToken]);

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

  /* Screen-space helpers need `view`, which can be null on the first frames; the handlers
     below all guard on it, and the early return under them renders a bare surface. */
  const screenOf = (point) => {
    if (!view) return null;
    const centre = project(view.center.lat, view.center.lng, view.zoom);
    const world = project(Number(point.lat), Number(point.lng), view.zoom);
    return {
      x: world.x - (centre.x - size.width / 2),
      y: world.y - (centre.y - size.height / 2),
    };
  };

  const localPoint = (event) => {
    const box = event.currentTarget.getBoundingClientRect();
    return { x: event.clientX - box.left, y: event.clientY - box.top };
  };

  /** Is this press on the ring's edge rather than in open space? */
  const onRingEdge = (event) => {
    if (interaction !== 'select' || !anchor || !onRadiusDragged) return false;
    const centre = screenOf(anchor);
    if (!centre) return false;
    const ringPx =
      (Number(radiusMiles) * MILES_TO_METRES) / metresPerPixel(Number(anchor.lat), view.zoom);
    if (!(ringPx > 0)) return false;
    const at = localPoint(event);
    return Math.abs(Math.hypot(at.x - centre.x, at.y - centre.y) - ringPx) <= HANDLE_GRAB_SLOP;
  };

  const onPointerDown = (event) => {
    if (!view || isChrome(event)) return;

    /**
     * **Drawing takes the drag, so panning gives it up.**
     *
     * In the boundary experience the whole point of a press-and-drag is to enclose an area,
     * so it cannot also mean "move the map" — the app's own `DrawingManager` behaves the
     * same way while a polygon tool is armed. Zoom stays on the wheel and the buttons, which
     * is enough to reach anywhere without a drag.
     */
    if (interaction === 'draw' && onShapeDrawn) {
      const at = localPoint(event);
      trailRef.current = [at];
      setTrail([at]);
      capturePointer(event);
      return;
    }

    /* Grabbing the ring's edge resizes; grabbing anywhere else pans. */
    if (onRingEdge(event)) {
      ringDragRef.current = true;
      capturePointer(event);
      return;
    }

    dragRef.current = {
      x: event.clientX,
      y: event.clientY,
      origin: project(view.center.lat, view.center.lng, view.zoom),
    };
    movedRef.current = false;
    capturePointer(event);
  };

  const onPointerMove = (event) => {
    if (!view) return;

    if (trailRef.current) {
      const at = localPoint(event);
      const last = trailRef.current[trailRef.current.length - 1];
      /* One point per pixel of travel would store the pointer's sampling rate rather than
         the shape; three is under the width of the stroke being drawn. */
      if (Math.hypot(at.x - last.x, at.y - last.y) < TRAIL_MIN_STEP) return;
      trailRef.current = [...trailRef.current, at];
      setTrail(trailRef.current);
      return;
    }

    if (ringDragRef.current && anchor) {
      const centre = screenOf(anchor);
      const at = localPoint(event);
      const px = Math.hypot(at.x - centre.x, at.y - centre.y);
      /* Pixels back to miles at this latitude and zoom, so the number the planner is
         dragging towards is the number that gets stored. */
      const miles = px * metresPerPixel(Number(anchor.lat), view.zoom) * METRES_TO_MILES;
      onRadiusDragged(miles);
      return;
    }

    const drag = dragRef.current;
    if (!drag) return;

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
    /* A finished lasso: thin it, close it, hand it over as coordinates. */
    if (trailRef.current) {
      const raw = trailRef.current;
      trailRef.current = null;
      setTrail(null);
      releasePointer(event);

      if (raw.length >= 3 && view) {
        const centre = project(view.center.lat, view.center.lng, view.zoom);
        const originX = centre.x - size.width / 2;
        const originY = centre.y - size.height / 2;
        const thinned = simplifyToBudget(raw, MAX_BOUNDARY_POINTS);
        onShapeDrawn(thinned.map((at) => unproject(originX + at.x, originY + at.y, view.zoom)));
      }
      return;
    }

    if (ringDragRef.current) {
      ringDragRef.current = false;
      releasePointer(event);
      return;
    }

    dragRef.current = null;
    releasePointer(event);
  };

  if (!view || !size.width || !size.height) {
    return (
      <Box
        ref={containerRef}
        className={`${classes.zoneMapRoot} ${invalid ? classes.zoneMapRootInvalid : ''} ${className}`}
      />
    );
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
   * A click drops the centre wherever it lands — a reversal of the rule that used to be here.
   *
   * The centre was previously snapped to the **nearest site within 22px**, on the argument
   * that "12 mi around a dropped pin" is a zone nobody can verify. Reversed at the user's
   * direction: a territory's natural centre is often not a site at all, and snapping meant a
   * planner could not place one where they meant to. Bare coordinates, so a click anywhere is
   * an answer — and the drag guard still stands, because a pan ends in a `click` on the
   * element it started on and would otherwise move the pin every time the map moved.
   */
  const handleClick = (event) => {
    if (interaction !== 'select' || !onDropPin) return;
    if (movedRef.current || ringDragRef.current || isChrome(event)) return;

    const at = localPoint(event);
    onDropPin(unproject(originX + at.x, originY + at.y, zoom));
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

  /**
   * **The zone being edited is drawn in its own hue, not in brand.**
   *
   * Brand blue said "this is the interactive one", which is true and is not the thing a
   * planner needs from a colour here. The zone's own hue says *which zone this is*, and it
   * says it in the same language the workspace map uses — so North's boundary is the blue
   * shape on both screens, and the shape drawn here is recognisable in the place it will
   * eventually be used. Everything that belongs to that shape takes the hue with it: the
   * ring, the vertex handles, the radius grab handle, the centre pin, the captured sites and
   * the badge's swatch. Leaving any of them brand would have put a stray blue mark on East's
   * orange territory.
   */
  const activeHue = zoneColor(activeZoneId || zoneIdForName(activeZoneName));

  return (
    <Box
      ref={containerRef}
      className={`${classes.zoneMapRoot} ${invalid ? classes.zoneMapRootInvalid : ''} ${className}`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onClick={handleClick}
      /* Crosshair where a drag encloses something, pointer where a click picks something,
         and the platform default where neither is on offer (`view`) — there is nothing
         here to draw or select, only pan and zoom. `sx` rather than the shared class so
         the interactions can differ without the class having to know which one is mounted. */
      sx={{
        cursor:
          interaction === 'draw' ? 'crosshair' : interaction === 'select' ? 'pointer' : 'default',
        '&:active': {
          cursor:
            interaction === 'draw' ? 'crosshair' : interaction === 'select' ? 'pointer' : 'default',
        },
      }}
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
        {/**
         * **The zones that already exist, drawn first, in their own hues, and drawn dead.**
         *
         * A planner adding a second zone needs to see the first one — otherwise they draw
         * over territory that is already taken and only find out from the readout. But
         * they must not be able to *touch* it: one panel edits one zone, and a map where
         * every shape looks editable is a map where the wrong one gets edited.
         *
         * **They used to be flat grey, and that was one distinction doing two jobs.** Grey
         * said "not the one you are editing", which the emphasis already says — and it also
         * said "unidentified", which is a lie about a zone that has a name, an id and a
         * colour everywhere else in the product. So each one takes its own hue at
         * `OTHER_ZONE_EMPHASIS` (see the argument there for why one weight, and why never
         * dashed), and the grey is left to mean the one thing it should: a zone the palette
         * has no slot for.
         *
         * Locked stays structural: the whole overlay is `pointer-events: none`, so there is
         * no handler to reach rather than a flag somebody could forget to check.
         */}
        {otherZones.map((zone) => {
          const hue = zoneColor(zone.id);
          return zone.kind === 'boundary' && zone.points.length >= 3 ? (
            <g key={`locked-${zone.id}`}>
              <polygon
                points={zone.points
                  .map((p) => {
                    const s2 = toScreen(p);
                    return `${s2.x},${s2.y}`;
                  })
                  .join(' ')}
                fill={hue}
                fillOpacity={OTHER_ZONE_EMPHASIS.fill}
                stroke={hue}
                strokeOpacity={OTHER_ZONE_EMPHASIS.strokeOpacity}
                strokeWidth={OTHER_ZONE_EMPHASIS.stroke}
                /* Load-bearing rather than cosmetic, and the same call the workspace map
                   makes: these rings are Douglas–Peucker vertices off a freehand drag, not a
                   fitted curve, so some interior angles are acute enough that the default
                   miter join shoots a long thin dart off the corner. */
                strokeLinejoin="round"
              />
              {/**
               * The name, always on, in dark ink rather than the zone's hue.
               *
               * Always on because the workspace map's hover-only captions are the wrong
               * trade for an editor: a planner mid-drag has a busy pointer and needs to know
               * which shape is which without hunting for it.
               *
               * **Dark ink, and the hue was measured before it was rejected.** Against the
               * white halo these captions are painted on, orange comes out at 3.3:1 and aqua
               * at 2.9:1 — both under the 4.5:1 that 10px bold text needs, `fontSize` being
               * nowhere near WCAG's large-text threshold. The caption is precisely the relief
               * that discharges the palette's own contrast debt on those two hues, so tinting
               * it would spend the remedy to decorate it. The tie to the hue is the shape the
               * caption is sitting on.
               */}
              <text
                x={toScreen(zone.points[0]).x}
                y={toScreen(zone.points[0]).y - 8}
                textAnchor="middle"
                fontSize="10"
                fontWeight="600"
                fill={theme.palette.textSecondary2}
                stroke={theme.palette.surfaceWhite}
                strokeWidth="3"
                style={{ paintOrder: 'stroke' }}
              >
                {zone.name}
              </text>
            </g>
          ) : zone.kind === 'radius' && zone.anchor ? (
            <g key={`locked-${zone.id}`}>
              <circle
                cx={toScreen(zone.anchor).x}
                cy={toScreen(zone.anchor).y}
                r={
                  (Number(zone.radiusMiles) * MILES_TO_METRES) /
                  metresPerPixel(Number(zone.anchor.lat), zoom)
                }
                fill={hue}
                fillOpacity={OTHER_ZONE_EMPHASIS.fill}
                stroke={hue}
                strokeOpacity={OTHER_ZONE_EMPHASIS.strokeOpacity}
                strokeWidth={OTHER_ZONE_EMPHASIS.stroke}
              />
              <text
                x={toScreen(zone.anchor).x}
                y={toScreen(zone.anchor).y - 10}
                textAnchor="middle"
                fontSize="10"
                fontWeight="600"
                fill={theme.palette.textSecondary2}
                stroke={theme.palette.surfaceWhite}
                strokeWidth="3"
                style={{ paintOrder: 'stroke' }}
              >
                {zone.name}
              </text>
            </g>
          ) : null;
        })}

        {/**
         * **The shape being edited: solid, at the `open` weight, in its own hue.**
         *
         * `open` is the workspace map's word for "the one in focus", so the mapping is exact
         * — the zone this panel exists to edit is the zone the map is currently about.
         *
         * **It used to be dashed, and dropping the dash is the point.** A dash here meant
         * "this is the shape being edited", against locked greys that were solid. On the
         * workspace map a dash means something else entirely — *nobody works this zone in
         * this range* — and keeping both would have left one pattern making two claims on two
         * screens a planner moves between. The dash goes to the drag trail, where it means
         * "not a shape yet" and cannot be read as a schedule, because a trail only exists
         * mid-gesture and never shares the map with a finished ring. Focus is now carried by
         * weight — 2.25 against 1.4, 0.18 fill against 0.1 — which is how the workspace map
         * has always carried it.
         */}
        {ringPx > 0 && anchor ? (
          <circle
            cx={toScreen(anchor).x}
            cy={toScreen(anchor).y}
            r={ringPx}
            fill={activeHue}
            fillOpacity={ZONE_EMPHASIS.open.fill}
            stroke={activeHue}
            strokeOpacity={ZONE_EMPHASIS.open.strokeOpacity}
            strokeWidth={ZONE_EMPHASIS.open.stroke}
          />
        ) : null}

        {boundaryPath && points.length >= 3 && !trail ? (
          <polygon
            points={boundaryPath}
            fill={activeHue}
            fillOpacity={ZONE_EMPHASIS.open.fill}
            stroke={activeHue}
            strokeOpacity={ZONE_EMPHASIS.open.strokeOpacity}
            strokeWidth={ZONE_EMPHASIS.open.stroke}
            strokeLinejoin="round"
          />
        ) : null}

        {/**
         * **The trail, while the lasso is being drawn.**
         *
         * An open line rather than a filled polygon: nothing is enclosed until the pointer
         * comes up, and shading an area mid-gesture claims a result that does not exist
         * yet.
         *
         * **Dashed, and this is now the only dash on the map** — which is what makes the
         * pattern mean one thing: *this is not a shape yet*. The finished ring above is solid,
         * so release is a visible commitment rather than a shape that merely stops moving.
         * A dash was ruled out here once on the grounds that it would crawl while the line
         * grows; it does not, because the pattern is laid out from the path's start, so
         * everything already drawn holds still and only the new end advances — checked on the
         * live surface rather than reasoned about again. Kept at Settings' own `6 5` rather
         * than the workspace map's `7 5`, so two patterns that mean different things do not
         * look identical.
         */}
        {trail && trail.length > 1 ? (
          <polyline
            points={trail.map((at) => `${at.x},${at.y}`).join(' ')}
            fill="none"
            stroke={activeHue}
            strokeWidth={2}
            strokeDasharray="6 5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : null}

        {/**
         * **Vertices only once there is a boundary**, which is the whole reason they are
         * here: they mark a finished shape's corners, and during the drag they would be a
         * hundred dots chasing the cursor. Hidden mid-gesture too, so redrawing over an
         * existing shape does not show the old shape's handles.
         */}
        {!trail && points.length >= 3
          ? points.map((point, index) => {
              const at = toScreen(point);
              return (
                <circle
                  key={`vertex-${index}`}
                  cx={at.x}
                  cy={at.y}
                  r={4}
                  fill={theme.palette.surfaceWhite}
                  stroke={activeHue}
                  strokeWidth={1.75}
                />
              );
            })
          : null}

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

        {/**
         * **A grab handle on the ring, so the radius can be sized on the map.**
         *
         * Placed due east of the centre — an arbitrary but stable spot, so it does not move
         * around the circle as the number changes. The whole edge is grabbable within
         * `HANDLE_GRAB_SLOP`; this is the affordance that says so. Drawn only when there is
         * something to drag.
         */}
        {anchor && ringPx > 0 && onRadiusDragged ? (
          <g>
            <circle
              cx={toScreen(anchor).x + ringPx}
              cy={toScreen(anchor).y}
              r={7}
              fill={theme.palette.surfaceWhite}
              stroke={activeHue}
              strokeWidth={2.5}
            />
            <path
              d={`M ${toScreen(anchor).x + ringPx - 2.5} ${toScreen(anchor).y - 3} L ${
                toScreen(anchor).x + ringPx - 2.5
              } ${toScreen(anchor).y + 3} M ${toScreen(anchor).x + ringPx + 2.5} ${
                toScreen(anchor).y - 3
              } L ${toScreen(anchor).x + ringPx + 2.5} ${toScreen(anchor).y + 3}`}
              stroke={activeHue}
              strokeWidth={1.5}
              strokeLinecap="round"
            />
          </g>
        ) : null}

        {/**
         * The centre, drawn as a **pin** rather than another dot.
         *
         * It used to be a filled circle, which was honest while the centre had to *be* a site
         * — it sat exactly on one, so reading as a site was correct. A dropped pin is a
         * different kind of thing: it is the planner's own mark on the map, usually nowhere
         * near a site, and a third circle among fifteen site dots gives no clue which of them
         * is the centre. A teardrop with a tip at the coordinate says "placed here" and cannot
         * be mistaken for the book.
         *
         * Drawn tip-down from the anchor point, so the pin's *point* is the actual centre and
         * the body sits above it — which is what makes the circle it draws look centred rather
         * than hanging off the marker.
         */}
        {anchor ? (
          <g transform={`translate(${toScreen(anchor).x} ${toScreen(anchor).y})`}>
            <path
              d="M0 0 L-6.5 -11 A 7.5 7.5 0 1 1 6.5 -11 Z"
              fill={activeHue}
              stroke="#ffffff"
              strokeWidth={2}
              strokeLinejoin="round"
            />
            <circle cy={-14} r={2.75} fill="#ffffff" />
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
                fill={inside ? activeHue : theme.palette.surfaceWhite}
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
                  stroke={activeHue}
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

      {/**
       * **Which zone this map is editing, said on the map.**
       *
       * The panel title says it too, but the title is 400px away from the thing being
       * drawn and the zones around it all carry their own names. A planner mid-draw is
       * looking at the cursor, so the answer belongs where they are looking.
       *
       * The swatch carries the zone's own hue rather than brand, which is what ties this
       * caption to the one shape drawn at the `open` weight — now that every zone on the
       * map has a colour, a brand-blue dot would have pointed at North and nothing else.
       * `sx` rather than the stylesheet because the colour is a value the map computes per
       * zone, and emotion's `sx` wins over the `makeStyles` class it would otherwise fight.
       * Colour is not carrying this alone: the name is the next thing in the chip.
       */}
      {activeZoneName ? (
        <Box className={classes.zoneMapBadge} data-map-chrome="true">
          <Box
            component="span"
            className={classes.zoneMapBadgeDot}
            sx={{ backgroundColor: activeHue }}
          />
          <Typography variant="subtitle3" className={classes.zoneMapBadgeText}>
            {activeZoneName}
          </Typography>
        </Box>
      ) : null}

      {hint ? (
        <Typography variant="body3" className={classes.zoneMapHint} data-map-chrome="true">
          {hint}
        </Typography>
      ) : null}

      <Typography className={classes.zoneMapAttribution} data-map-chrome="true">
        © OpenStreetMap contributors © CARTO
      </Typography>

      {switcher ? (
        <Box className={classes.mapSwitcher} data-map-chrome="true">
          {switcher}
        </Box>
      ) : null}
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
  otherZones: PropTypes.array,
  activeZoneName: PropTypes.string,
  activeZoneId: PropTypes.string,
  invalid: PropTypes.bool,
  hint: PropTypes.string,
  interaction: PropTypes.oneOf(['draw', 'select', 'view']),
  switcher: PropTypes.node,
  className: PropTypes.string,
  fitToken: PropTypes.any,
  onShapeDrawn: PropTypes.func,
  onDropPin: PropTypes.func,
  onRadiusDragged: PropTypes.func,
};

export default ZoneMap;
