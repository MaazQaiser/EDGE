import { Box, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import classNames from 'classnames';
import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { STOP_PIN_PATH } from 'src/app/obx/pages/schedules/components/harmonize/components/MapPins';
import {
  FIT_PADDING,
  fitView,
  MAX_ZOOM,
  MIN_ZOOM,
  project,
  tilesFor,
  unproject,
} from 'src/app/obx/pages/schedules/components/harmonize/tileProjection';

import { BASE_POINT, SITE_POINTS, siteFacts, sitePointById } from '../zoneGeography';

/**
 * The territory, and what the week does to it.
 *
 * ## Why this is a third map and not a prop on either of the other two
 *
 * The Workspace's `RouteMap` draws **one route inside one circle** from a start point, over
 * a domain model with no zones in it. Settings' `ZoneMap` draws **one editable shape** and
 * has no idea what a runsheet is. What this shell needs is neither: every zone at once,
 * each in its own colour, with a route lying inside each worked one and the open day's
 * route picked out of the set. Bolting that onto either would mean teaching a component
 * about a model it does not have.
 *
 * What all three *do* share is `tileProjection` — one copy of the Mercator arithmetic, so
 * a coordinate lands in the same place on all three surfaces and a planner who has learned
 * to drag one has learned all of them. That was the whole point of lifting it out.
 *
 * ## The week at once, with one day emphasised
 *
 * The drawer can only ever discuss one day, because it only has room for one. A map does
 * not have that problem, and pretending it does — drawing only the open day — would throw
 * away the one fact this shell exists to show: *the week is three rounds, and here is how
 * they sit relative to each other.* So every **worked** zone is drawn and every runsheet is
 * drawn, and the open day is separated from them by weight rather than by exclusion.
 *
 * The separation is deliberately **three cues, not one**: the open zone keeps its hue and
 * its denser fill where the others go grey, its route is opaque and twice the width, and
 * its stops are numbered where the others are plain dots. Colour alone would fail the moment
 * two zones are adjacent and a planner is red-green colourblind, which is the case the
 * palette's own validation is run against.
 *
 * **A zone no day in the range works is not drawn.** It used to be, dashed, and the dash is
 * gone with it — see `emphasisFor`.
 *
 * ## Territories are circles
 *
 * A zone is a radius around a point, never a traced boundary. `zoneRings` decides where the
 * circle is and how wide; what arrives here is that circle already flattened to a path, which
 * is why this component still draws `<polygon>` and still hit-tests by ray casting.
 *
 * ## The map is a way to change the day
 *
 * One zone per day and one day per zone (D15), so a zone *is* a day here — which makes
 * clicking a circle the most direct way there is to say "show me Tuesday". It is the same
 * selection the tab row makes, routed through the same handler, so the two cannot disagree.
 * Every circle on screen has a day, so every circle takes a click.
 */

/** A pan has to travel before it stops being a click. 4px is a deliberate press's wobble. */
const DRAG_SLOP = 4;

/** How close to a pin a click counts as hitting it. A 6px dot is a small target. */
const PIN_GRAB = 20;

/**
 * The site marker, and why it is the product's own pin rather than a circle.
 *
 * Sites were plain `r=5` circles. A circle marks a *place on a surface* — it is what a
 * scatter plot uses — and it centres on its coordinate, so at a glance it reads as an area
 * rather than a point. A teardrop pin points at one spot, which is what a site is, and it is
 * the mark this product already uses for a stop everywhere else: `STOP_PIN_PATH` in
 * `harmonize/components/MapPins.jsx`, imported rather than redrawn, so the unsequenced pin at
 * ① and the numbered pin at ③ are the same silhouette at two strengths.
 *
 * The path is authored on a 20×20 box with its **tip at (10, 20)**, so placing it means
 * offsetting by half its width and all of its height — a pin whose centre sat on the
 * coordinate would point at somewhere it is not.
 */
const SITE_PIN_SIZE = 19;
const PIN_ART_BOX = 20;

/** Where the hover card sits relative to the pin, and how wide it is allowed to be. */
const CARD_WIDTH = 236;
const CARD_GAP = 12;
/* Below this much room above the pin, the card flips under it rather than being clipped. */
const CARD_FLIP_ABOVE = 190;

/**
 * The fill a zone gets, by how much the screen is currently saying about it.
 *
 * Low numbers because these are stacked over a raster basemap with roads and labels in it:
 * anything past about 0.20 stops being a tint and starts hiding the streets that make the
 * territory legible in the first place.
 *
 * **`muted` is now much quieter than `worked` was, and the reason is that it is grey.** The
 * old pair sat at 0.18 against 0.10 — close together on purpose, because before a plan
 * existed *every* worked zone was in the subordinate bucket and three washed shapes on a
 * busy basemap were invisible at the one moment the map had nothing to do but show the
 * planner their ground. Neither half of that argument survives: a day is always selected, so
 * there is always exactly one zone in the `open` bucket, and a muted circle no longer has to
 * hold a hue at low opacity — it is drawn in grey, which reads at 0.07 where a pale orange
 * does not. The separation is doing the work the closeness used to prevent.
 *
 * There is no `idle` any more. A zone no day works is not drawn — see `emphasisFor`.
 */
const ZONE_FILL = { open: 0.18, muted: 0.07 };

/**
 * The grey a subordinate circle is drawn in.
 *
 * `borderStrong1`'s value, copied rather than read: this is an SVG attribute, so it cannot
 * take a theme token, and picking the palette entry that is already this product's "present
 * but not the subject" line keeps the map speaking the app's language. Dark enough to hold a
 * 1.4px stroke over CARTO's yellow arterials, light enough that the open circle beside it is
 * unambiguously the loud one.
 */
const MUTED_INK = '#9E9E9E';

/**
 * The route weight for a day that is not the open one.
 *
 * 0.28 was too quiet to count as drawn — "all days, the open one highlighted" turned into
 * "the open day, and some dots" — and the whole argument for drawing the others is that
 * *where the week's three rounds sit relative to each other* is the fact this shell exists
 * to show. 0.5 is far enough below the open day's 0.9 that the hierarchy still reads, and
 * the numbered pins carry the rest of that separation anyway.
 */
const ROUTE_OPACITY = { open: 0.95, other: 0.45 };

/**
 * The open day's route, drawn twice: a white casing, then the line.
 *
 * **This is what "make the route prominent" actually needs.** Widening a single coloured
 * stroke does not do it over a raster basemap — CARTO's own roads are 2–4px of saturated
 * yellow and white, so a 3px line laid over them competes rather than reads, and thickening
 * it further just makes a fatter thing to lose. A **casing** — a wider stroke of the
 * surface colour painted underneath — cuts the route out of the map first, so the coloured
 * line sits in its own clear channel. It is the standard cartographic answer and it is why
 * every transit map you have ever read is legible over its own street grid.
 *
 * Only the open day gets one. Casing every route would carve three channels through the
 * basemap and flatten the hierarchy the second and third routes exist to sit inside.
 */
const ROUTE_CASING = { width: 7, color: '#FFFFFF', opacity: 0.92 };
const ROUTE_WIDTH = { open: 3.5, other: 1.5 };

/**
 * How heavily each zone's boundary is drawn.
 *
 * **Deliberately restrained, and a heavier version of this was tried and rejected.** A
 * boundary is *context* — where the territory is — and the thing that needs to be
 * unmistakable is the **route** inside it. Taking the open zone's outline to 3.25 made the
 * territory shout and left the line it contains looking like a thread across it, which is
 * the wrong subject drawn loudest. The route carries the emphasis now (see `ROUTE_CASING`)
 * and the boundary went back to being the frame it always was.
 */
const ZONE_STROKE = { open: 2.25, hovered: 1.75, muted: 1.4 };

/**
 * Ray casting, in screen pixels.
 *
 * `tileProjection` exports the same test in latitude and longitude and argues — correctly
 * — that membership is a fact about the ground and should not depend on the zoom somebody
 * happened to be at. This is not that question. This asks *what did the planner just click
 * on*, which is a question about the picture in front of them, and the honest frame for it
 * is the one their pointer is in.
 *
 * Declared above its caller rather than below, which this codebase has paid for twice: a
 * `const` read from a line above its own declaration is a temporal-dead-zone
 * `ReferenceError` that lints and builds cleanly and then blanks the page.
 */
const pointInScreenRing = (point, ring) => {
  let inside = false;
  for (let i = 0; i < ring.length; i += 1) {
    const a = ring[i];
    const b = ring[(i + 1) % ring.length];
    if (a.y > point.y !== b.y > point.y) {
      const crossing = ((b.x - a.x) * (point.y - a.y)) / (b.y - a.y) + a.x;
      if (point.x < crossing) inside = !inside;
    }
  }
  return inside;
};

const useMapStyles = makeStyles((theme) => ({
  root: {
    position: 'relative',
    flex: 1,
    minHeight: 0,
    borderRadius: 8,
    overflow: 'hidden',
    border: `1px solid ${theme.palette.borderSubtle1}`,
    backgroundColor: theme.palette.surfaceGreySubtle,
    touchAction: 'none',
    userSelect: 'none',
    cursor: 'grab',
    '&:active': { cursor: 'grabbing' },
  },
  tile: {
    position: 'absolute',
    width: 256,
    height: 256,
    pointerEvents: 'none',
    userSelect: 'none',
  },
  /* Nothing drawn is clickable — the surface owns every pointer event and works out what
     was hit by distance, the same way Settings' map does. A pin that swallowed the click
     would leave a dead spot exactly where the planner is aiming. */
  overlay: { position: 'absolute', inset: 0, pointerEvents: 'none' },

  zoom: {
    position: 'absolute',
    right: 12,
    top: 12,
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  zoomButton: {
    minWidth: 32,
    width: 32,
    height: 32,
    padding: 0,
    borderRadius: 6,
    border: `1px solid ${theme.palette.borderSubtle2}`,
    backgroundColor: theme.palette.surfaceWhite,
    color: theme.palette.textSecondary1,
    fontSize: 16,
    lineHeight: 1,
    cursor: 'pointer',
    boxShadow: '0 1px 2px rgba(16, 24, 40, 0.06)',
    '&:hover': { backgroundColor: theme.palette.surfaceGreySubtle },
    '&:disabled': { opacity: 0.45, cursor: 'default' },
  },

  /** Attribution is a condition of using the tiles, so it is not optional chrome. */
  attribution: {
    '&.MuiTypography-root': {
      position: 'absolute',
      right: 8,
      bottom: 6,
      padding: '2px 6px',
      borderRadius: 4,
      backgroundColor: 'rgba(255, 255, 255, 0.86)',
      color: theme.palette.textSecondary2,
      fontSize: 10,
      lineHeight: '14px',
    },
  },

  /**
   * The hover card.
   *
   * **White paper on a soft lift, not a dark tooltip.** A dark tooltip is right for a label —
   * one line, read and dismissed. This is a small record with a hierarchy in it, so it wants
   * to read as a card lifted off the map: white ground, a hairline, and a two-layer shadow
   * (a tight contact shadow plus a wide soft one) which is what separates paper from a map
   * that is itself full of colour and texture. A single blurred shadow on a raster basemap
   * reads as a smudge.
   *
   * `pointerEvents: none` throughout. The card follows the pointer's own target, so a card
   * that could be hovered would sit under the pointer, take the enter event, and flicker
   * against the pin it belongs to.
   */
  card: {
    position: 'absolute',
    zIndex: 3,
    width: CARD_WIDTH,
    padding: '11px 13px 12px',
    borderRadius: 10,
    background: theme.palette.surfaceWhite,
    border: `1px solid ${theme.palette.borderSubtle1}`,
    boxShadow: '0 1px 2px rgba(16, 24, 40, 0.08), 0 8px 24px rgba(16, 24, 40, 0.14)',
    pointerEvents: 'none',
  },

  /**
   * The identity block: company over site.
   *
   * Company **above** the site name and a step quieter, which is the opposite of the obvious
   * arrangement and the right one. The site is what the planner is pointing at, so it is the
   * heading; the company is the context that disambiguates it — `Downtown Holdings` owns two
   * pins in North alone — and context read *before* a heading is an eyebrow, which is exactly
   * the relationship. Reversed, the eye lands on the account and has to hunt for which of its
   * sites this is.
   */
  cardCompany: {
    '&.MuiTypography-root': {
      ...theme.typography.body3,
      color: theme.palette.textSecondary3,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
  },
  cardSite: {
    '&.MuiTypography-root': {
      ...theme.typography.subtitle1,
      color: theme.palette.textPrimary,
      marginTop: 1,
    },
  },

  /* The zone, as the colour it is on the map beside it. The dot is the whole reason this is
     not just a word: it is the one element on the card that ties the record to the territory
     the pointer is inside. */
  cardZone: { display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 },
  cardZoneDot: { width: 7, height: 7, borderRadius: '50%', flex: '0 0 auto' },
  cardZoneName: {
    '&.MuiTypography-root': {
      ...theme.typography.subtitle3,
      fontWeight: 600,
      color: theme.palette.textSecondary1,
    },
  },
  cardZoneNote: {
    '&.MuiTypography-root': { ...theme.typography.body3, color: theme.palette.textSecondary3 },
  },

  /**
   * The facts, as a label/value grid.
   *
   * `1fr auto` with the values right-aligned and tabular, so `3` and `12` line up on their
   * units rather than on their first digit — four rows of numbers that do not share an edge
   * are four rows the eye has to read individually. The hairline above it is what makes the
   * identity block and the data two things instead of six stacked lines.
   */
  cardFacts: {
    display: 'grid',
    gridTemplateColumns: '1fr auto',
    gap: '5px 12px',
    marginTop: 10,
    paddingTop: 9,
    borderTop: `1px solid ${theme.palette.borderSubtle1}`,
  },
  cardLabel: {
    '&.MuiTypography-root': { ...theme.typography.body3, color: theme.palette.textSecondary2 },
  },
  cardValue: {
    '&.MuiTypography-root': {
      ...theme.typography.subtitle3,
      fontWeight: 600,
      color: theme.palette.textPrimary,
      textAlign: 'right',
      fontVariantNumeric: 'tabular-nums',
    },
  },
  /* The one row that is a finding rather than a fact, so it is the one row with a colour. */
  cardValueWarn: { '&.MuiTypography-root': { color: '#B54708' } },

  /* The verdict a drag is about to get, said in words over the map. The zone flashing is
     the fast read; this is the one that survives being colourblind. */
  dropVerdict: {
    position: 'absolute',
    left: '50%',
    bottom: 14,
    transform: 'translateX(-50%)',
    padding: '6px 12px',
    borderRadius: 999,
    fontSize: 12,
    lineHeight: '18px',
    fontWeight: 500,
    whiteSpace: 'nowrap',
    boxShadow: '0 2px 8px rgba(16, 24, 40, 0.14)',
    pointerEvents: 'none',
  },
  dropVerdictLegal: {
    background: theme.palette.surfaceSuccessSubtle,
    color: '#1B5E33',
    border: `1px solid ${theme.palette.borderSuccess}`,
  },
  dropVerdictRefused: {
    background: theme.palette.surfaceAlertSubtle,
    color: theme.palette.textAlert,
    border: `1px solid ${theme.palette.borderAlert}`,
  },
}));

/**
 * One site, as a pin.
 *
 * The product's own `STOP_PIN_PATH`, placed by its tip rather than its centre — the art box
 * is 20×20 with the point at (10, 20), so the transform offsets by half a width and a full
 * height. A white casing behind it, which is the same trick the open day's route uses and for
 * the same reason: this sits on a raster basemap whose own roads are saturated yellow, and a
 * coloured shape with no casing loses its edge the moment it crosses one.
 *
 * `hollow` is the spilled state — white bodied, dashed in its zone's colour. Still *in* its
 * colour, because the remedy for a stranded visit is to work its zone, and a mark that had
 * dropped its colour would be hiding the one fact that fixes it.
 *
 * The hover state grows the pin by 15% about its own tip. Growing it about its centre would
 * slide the point off the place it is marking, which is the one thing a pin must not do.
 *
 * `dulled` is a pin outside the open day's territory. It keeps its hue and its size — it is
 * still real work at a real address, and greying it would make it look excluded rather than
 * subordinate — and loses about half its presence to a group opacity. Without this the circles
 * grey and the pins inside them do not, which reads as the emphasis having failed rather than
 * as a hierarchy: a pale grey ring full of saturated orange pins says *look here* twice.
 */
const SitePin = ({ at, color, hovered, hollow, dulled }) => {
  const scale = (SITE_PIN_SIZE / PIN_ART_BOX) * (hovered ? 1.15 : 1);
  const transform = `translate(${at.x - (PIN_ART_BOX * scale) / 2}, ${
    at.y - PIN_ART_BOX * scale
  }) scale(${scale})`;

  return (
    <g
      transform={transform}
      opacity={dulled && !hovered ? 0.45 : 1}
      style={{ pointerEvents: 'none', transition: 'opacity 200ms ease' }}
    >
      <path d={STOP_PIN_PATH} fill="#FFFFFF" stroke="#FFFFFF" strokeWidth={4.5} />
      <path
        d={STOP_PIN_PATH}
        fill={hollow ? '#FFFFFF' : color}
        fillOpacity={hollow ? 1 : 0.92}
        stroke={color}
        strokeWidth={hollow ? 2 : 1.25}
        strokeDasharray={hollow ? '3 2' : undefined}
      />
      {/* The bowl's own hole, so a filled pin reads as a pin rather than as a blob. Omitted on
          the hollow one, which is already mostly hole. */}
      {hollow ? null : <circle cx={10} cy={8.2} r={3} fill="#FFFFFF" fillOpacity={0.92} />}
    </g>
  );
};

SitePin.propTypes = {
  at: PropTypes.object.isRequired,
  color: PropTypes.string.isRequired,
  hovered: PropTypes.bool,
  hollow: PropTypes.bool,
  dulled: PropTypes.bool,
};

SitePin.defaultProps = { hovered: false, hollow: false, dulled: false };

const ZoneRouteMap = ({
  zones,
  runsheets,
  workedDays,
  openDay,
  onOpenDay,
  hoveredZoneId,
  highlightedSiteId,
  onHighlight,
  planned,
  looseSiteIds,
  dropZoneId,
  dropLegal,
  dropReason,
  announcedRouteDates,
}) => {
  const classes = useMapStyles();
  const { t } = useTranslation();
  const tt = (key, options) => t(`obx.runsheet.harmonizeSplit.${key}`, options);

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
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  /**
   * Fit once, to the whole territory, and then leave the view alone.
   *
   * **To every zone and the base, not to the open day's stops.** Refitting when the day
   * changes is the obvious behaviour and it is the wrong one: the tabs are a comparison
   * control, and a map that re-zoomed on every tab press would make comparing two days
   * impossible — the thing being compared is *where they are relative to each other*, and
   * that fact only exists in a stationary frame. So the frame holds the week and the
   * emphasis moves inside it.
   */
  /**
   * **Keyed on the circles themselves, not on how many points they have.**
   *
   * It used to be `ring.length` joined, which was already nearly a constant and is now
   * exactly one: every ring is `RADIUS_RING_SEGMENTS` long whatever the zone is, so a zone
   * moving or resizing would not have changed the key at all. Centre and radius are what a
   * circle *is*, so they are what a change to one looks like.
   */
  const fitKey = zones
    .map((zone) => `${zone.centre?.lat},${zone.centre?.lng},${zone.radiusMiles}`)
    .join('|');
  useEffect(() => {
    if (fittedRef.current || !size.width || !size.height) return;
    /* Fits the zones that are **drawn**, plus the base. A zone no day works is not on
       screen, so reserving room for it would leave the week's actual ground smaller than
       the frame it was given — the old dashed West cost about a fifth of the width. */
    const source = drawnZones.length ? drawnZones : zones;
    const points = [...source.flatMap((zone) => zone.ring), BASE_POINT].filter(
      (point) => Number.isFinite(Number(point?.lat)) && Number.isFinite(Number(point?.lng)),
    );
    if (!points.length) return;
    fittedRef.current = true;
    setView(fitView(points, size.width, size.height, FIT_PADDING));
    /* `drawnZones` is deliberately absent from the deps: it depends on `openDay` through
       `emphasisFor`, and the whole point of `fittedRef` is that this runs once. Listing it
       would make the rule read as though a tab press could refit the map. */
  }, [fitKey, size.width, size.height, zones]);

  const zoomBy = useCallback(
    (delta) =>
      setView((previous) =>
        previous
          ? { ...previous, zoom: Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, previous.zoom + delta)) }
          : previous,
      ),
    [],
  );

  /** Which day works which zone — the map's whole reason for taking a click. */
  const dayOfZone = useMemo(() => {
    const out = {};
    workedDays.forEach((day) => {
      if (day.zoneId && !out[day.zoneId]) out[day.zoneId] = day.date;
    });
    return out;
  }, [workedDays]);

  /**
   * The zone the open day works — **read off the worked days, not off the proposal.**
   *
   * It used to come from `runsheets`, which only exist once Harmonize has been pressed, so
   * before the press no zone was open and every circle took the same weight. That was
   * defensible when the tab row arrived with the proposal; it is wrong now that the tabs are
   * on screen from the first frame. Pressing `Tue 18` has to move the emphasis on the map
   * whether or not anything has been solved — that response *is* what ties the row to the
   * map — and `workedDays` carries the day→zone pairing from Config A, which is the fact
   * being asked about. One zone per day and one day per zone (D15), so the lookup is exact.
   */
  const openZoneId = useMemo(
    () => workedDays.find((day) => day.date === openDay)?.zoneId || null,
    [workedDays, openDay],
  );

  /**
   * How loudly to draw one zone. Three answers, and only two of them are drawn.
   *
   * - `open` — the selected day's territory. The subject.
   * - `muted` — a territory some *other* day in the range works. Present, so the week still
   *   reads as a set of rounds sitting relative to each other, but grey and very quiet: it
   *   is context for the one circle that is being discussed.
   * - `hidden` — a zone **no day in this range works at all**. Not drawn. It used to be, in
   *   a dashed outline meaning "not worked", and the dash is gone with it on instruction:
   *   the fact is already stated in words by the issues tray, which owns that sentence, and a
   *   fourth shape on the map competing with three that matter is a worse way to say it.
   *
   * **There is no pre-plan special case any more, and there does not need to be one.** The
   * old rule handed every worked zone the open weight while `openZoneId` was null, because
   * before the press nothing was selected and ranking them would have invented a hierarchy.
   * A day is always selected now — the tab row defaults to the first worked one — so there is
   * always a genuine subject to emphasise.
   */
  const emphasisFor = useCallback(
    (zoneId) => {
      if (!dayOfZone[zoneId]) return 'hidden';
      if (!openZoneId) return 'open';
      return zoneId === openZoneId ? 'open' : 'muted';
    },
    [dayOfZone, openZoneId],
  );

  /** The circles that are on screen: every zone some day in this range works. */
  const drawnZones = useMemo(
    () => zones.filter((zone) => zone.ring.length >= 3 && emphasisFor(zone.id) !== 'hidden'),
    [zones, emphasisFor],
  );

  const looseSet = useMemo(() => new Set(looseSiteIds || []), [looseSiteIds]);

  /**
   * Which pin the pointer is over.
   *
   * Local to the map, unlike `highlightedSiteId`, which is a *selection* shared with the stop
   * list and survives the pointer leaving. Hover is transient and belongs to whichever surface
   * the pointer is on; routing it through the parent would make moving the mouse across the
   * map re-render the whole shell.
   */
  const [hoverSiteId, setHoverSiteId] = useState(null);

  /**
   * Which territory the pointer is inside.
   *
   * **The zone name is no longer painted on the map**; it is shown only while the pointer is
   * over the territory. Asked for directly, and it stands — but it leaves an accessibility
   * claim elsewhere in this feature **false**, so read this before trusting that one.
   *
   * ## The palette's relief rule is currently undischarged
   *
   * `components/common/zonePalette` documents that two of the four hues sit under 3:1 against the
   * basemap's land tone — orange at 2.92, aqua at 2.57 — and that the palette therefore owes a
   * *relief*: something other than hue that identifies a zone. It names the always-on caption
   * on every territory as that relief, and calls it load-bearing rather than decorative,
   * because the map's legend had already been removed as redundant.
   *
   * That caption is what this state replaced. A hover-only caption is **not** relief for a
   * touch user, a keyboard user, or anyone who simply does not hover, so in the default state
   * two of four zones now have no non-colour identity on the map at all.
   *
   * **An earlier draft of this note claimed the day tabs carry the mitigation. They do not.**
   * The tabs label *days*, and they do carry a zone→day mapping off the map — which is worth
   * having and is why the surface is still usable — but it is not the same fact: it does not
   * tell anyone which shape on the map is which zone, which is precisely what the rule is
   * about. Recorded because a half-true mitigation in a comment is worse than none; the next
   * reader would have taken the rule as satisfied.
   *
   * ## What would actually discharge it
   *
   * Any one of these, none of them started:
   *
   * - a **permanent short label** on each territory — an abbreviation rather than the full
   *   name, which is most of what made the old caption feel heavy;
   * - a **per-zone pattern fill** (hatch direction, dot density), which is relief that
   *   survives both greyscale and not hovering;
   * - **hues that clear 3:1 on their own**, which removes the need for relief entirely and is
   *   the only option that costs nothing on screen. The current four cleared the *separation*
   *   gates and it is the contrast-against-basemap gate that fails, so a candidate set only has
   *   to fix that one — but note the validator itself is **missing from the tree**, so this
   *   means re-deriving the check rather than re-running it. `components/common/zonePalette`
   *   records both gates and the figures needed to rebuild it.
   */
  const [hoverZoneId, setHoverZoneId] = useState(null);

  const isChrome = (event) => Boolean(event.target?.closest?.('[data-map-chrome]'));
  const localPoint = (event) => {
    const box = event.currentTarget.getBoundingClientRect();
    return { x: event.clientX - box.left, y: event.clientY - box.top };
  };

  const onPointerDown = (event) => {
    if (!view || isChrome(event)) return;
    dragRef.current = {
      x: event.clientX,
      y: event.clientY,
      origin: project(view.center.lat, view.center.lng, view.zoom),
    };
    movedRef.current = false;
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      /* A pointer the browser has not seen. The handlers work without capture. */
    }
  };

  /**
   * The nearest site to a point, or null past `PIN_GRAB`.
   *
   * Shared by the click handler and the hover handler on purpose: a pin you can hover but not
   * click, or the reverse, is the kind of inconsistency nobody reports and everybody feels.
   * Measured against `SITE_POINTS` rather than against the runsheets' stops, so it works
   * identically before a run — when there are no runsheets to search — and after one.
   */
  const siteNear = (at) => {
    let closest = null;
    let distance = Infinity;
    SITE_POINTS.forEach((site) => {
      const screen = toScreen(site);
      const gap = Math.hypot(screen.x - at.x, screen.y - at.y);
      if (gap < distance) {
        distance = gap;
        closest = site;
      }
    });
    return distance <= PIN_GRAB ? closest : null;
  };

  const onPointerMove = (event) => {
    const drag = dragRef.current;

    /* Hover is resolved before the pan guard, because most pointer movement over this map is
       not a drag at all — and while one *is* in progress the card would be chasing the
       pointer across a moving surface, so it is dropped for the duration. */
    if (!drag) {
      const at = view ? localPoint(event) : null;
      const near = at ? siteNear(at) : null;
      const nextSite = near?.id || null;
      if (nextSite !== hoverSiteId) setHoverSiteId(nextSite);

      /* **The pin wins**, the same precedence `handleClick` uses: a pointer resting on Kelvin
         Court has asked about Kelvin Court, not about North, and showing both would put the
         territory's name under the card that covers it. */
      const zoneUnder =
        at && !nextSite
          ? drawnZones.find((zone) => pointInScreenRing(at, zone.ring.map(toScreen)))
          : null;
      const nextZone = zoneUnder?.id || null;
      if (nextZone !== hoverZoneId) setHoverZoneId(nextZone);
    } else {
      if (hoverSiteId) setHoverSiteId(null);
      if (hoverZoneId) setHoverZoneId(null);
    }

    if (!view || !drag) return;
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
    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch {
      /* Nothing was captured. */
    }
  };

  if (!view || !size.width || !size.height) {
    return <Box ref={containerRef} className={classes.root} />;
  }

  const { zoom, center } = view;
  const centrePx = project(center.lat, center.lng, zoom);
  const originX = centrePx.x - size.width / 2;
  const originY = centrePx.y - size.height / 2;

  const toScreen = (point) => {
    const world = project(Number(point.lat), Number(point.lng), zoom);
    return { x: world.x - originX, y: world.y - originY };
  };

  const ringPath = (ring) =>
    ring.map((point) => `${toScreen(point).x},${toScreen(point).y}`).join(' ');

  /**
   * A click on the ground picks the nearest *pin* first, then the zone it landed in.
   *
   * Pins win because they are the smaller target and the more specific intent — a planner
   * aiming at Kelvin Court has not asked to change days. Below that, a click anywhere
   * inside a zone selects the day that works it.
   */
  const handleClick = (event) => {
    if (movedRef.current || isChrome(event)) return;
    const at = localPoint(event);

    let closestSite = null;
    let closestDistance = Infinity;
    runsheets.forEach((sheet) =>
      sheet.stops.forEach((stop) => {
        const point = sitePointById(stop.site?.id);
        if (!point) return;
        const screen = toScreen(point);
        const distance = Math.hypot(screen.x - at.x, screen.y - at.y);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestSite = { stop, sheet };
        }
      }),
    );

    if (closestSite && closestDistance <= PIN_GRAB) {
      /* A pin in another day selects that day *and* highlights the stop — one press for
         "show me this one", rather than a tab press followed by a hunt down the list. */
      if (closestSite.sheet.date !== openDay) onOpenDay?.(closestSite.sheet.date);
      onHighlight?.(closestSite.stop.site?.id || null);
      return;
    }

    /* Only the drawn circles are clickable, which needs no extra guard: `drawnZones` is
       exactly the set some day works, so a hit always has a day to open. Circles overlap, so
       `find` takes the first in paint order — the same one whose stroke is on top. */
    const hit = drawnZones.find((zone) => pointInScreenRing(at, zone.ring.map(toScreen)));
    if (hit) onOpenDay?.(dayOfZone[hit.id]);
  };

  /**
   * The hovered site's card, resolved.
   *
   * A plain const rather than a `useMemo`, and that is forced rather than chosen: `toScreen`
   * is defined below the early return for an unmeasured container, so anything depending on it
   * is below that return too — and a hook cannot live after a conditional return. The work is
   * one array scan over eleven sites, on pointer moves that already re-render.
   */
  const hoverCard = (() => {
    if (!hoverSiteId) return null;
    const facts = siteFacts(hoverSiteId);
    const point = sitePointById(hoverSiteId);
    if (!facts || !point) return null;

    const at = toScreen(point);
    const day = (date) => dayjs(date).format('ddd D MMM');

    /* Where this site's work actually is, which is the one thing on the card that is a fact
       about the *run* rather than about the site — hence resolved here and not in `siteFacts`. */
    let placement = { text: '—', warn: false };
    const onSheet = runsheets.find((sheet) =>
      sheet.stops.some((stop) => stop.site?.id === hoverSiteId),
    );
    if (onSheet) {
      const index = onSheet.stops.findIndex((stop) => stop.site?.id === hoverSiteId);
      placement = {
        text: tt('cardOnRoute', { day: dayjs(onSheet.date).format('ddd D'), stop: index + 1 }),
        warn: false,
      };
    } else if (!dayOfZone[facts.zoneId]) {
      /* No day works this zone, so no amount of re-running places it. The one finding the card
         can make, and the reason it is the only coloured row. */
      placement = { text: tt('cardZoneNotWorked'), warn: true };
    } else if (planned) {
      placement = { text: tt('cardNotPlaced'), warn: true };
    } else {
      placement = {
        text: dayjs(dayOfZone[facts.zoneId]).format('ddd D'),
        warn: false,
      };
    }

    /* Clamped to the surface. A pin near an edge is ordinary on a map this wide, and an
       unclamped card would hang half off it. */
    const below = at.y < CARD_FLIP_ABOVE;
    return {
      facts,
      due: facts.dueDate ? day(facts.dueDate) : '—',
      window:
        facts.needByFrom && facts.needByTo
          ? `${dayjs(facts.needByFrom).format('D MMM')} – ${dayjs(facts.needByTo).format('D MMM')}`
          : '—',
      placement: placement.text,
      placementWarn: placement.warn,
      left: Math.min(Math.max(at.x - CARD_WIDTH / 2, 8), Math.max(8, size.width - CARD_WIDTH - 8)),
      top: below ? at.y + CARD_GAP : at.y - SITE_PIN_SIZE - CARD_GAP,
      below,
    };
  })();

  const tiles = tilesFor({ originX, originY, width: size.width, height: size.height, zoom });
  const basePx = toScreen(BASE_POINT);

  return (
    <Box
      ref={containerRef}
      className={classes.root}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      /* The card has to go when the pointer does, or it is left hanging over a map nobody is
         pointing at — `pointerleave` rather than `mouseout`, so it fires once for the surface
         instead of once per child the pointer crosses. */
      onPointerLeave={() => {
        setHoverSiteId(null);
        setHoverZoneId(null);
      }}
      onClick={handleClick}
      onWheel={(event) => {
        event.preventDefault();
        zoomBy(event.deltaY > 0 ? -1 : 1);
      }}
      role="application"
      aria-label={tt('mapAria')}
    >
      {tiles.map((tile) => (
        <Box
          key={tile.key}
          component="img"
          src={tile.url}
          alt=""
          draggable={false}
          className={classes.tile}
          sx={{ left: tile.left, top: tile.top }}
        />
      ))}

      <Box
        component="svg"
        className={classes.overlay}
        viewBox={`0 0 ${size.width} ${size.height}`}
        preserveAspectRatio="none"
      >
        {/* ── The territories ──────────────────────────────────────────────────
            **One circle per zone, and only the zones this range works.** A zone is a
            radius around a point now, not a traced boundary — see `zoneRings` — so what
            is drawn here is a 96-gon standing in for a circle, which is why the polygon
            element survived a change of model.

            Fills first, all of them, then every stroke — rather than fill-and-stroke per
            zone. Circles overlap by nature, far more than the old lassoed shapes did, and
            where two edges cross a later zone's translucent fill drawn over an earlier
            zone's stroke turns that arc a different colour from the rest of it, which
            reads as a third territory in the seam. Two passes cost nothing and every edge
            stays its own colour. */}
        {drawnZones.map((zone) => {
          const emphasis = emphasisFor(zone.id);
          /* **Not gated by the reveal, and that reverses a first pass.** Hiding the
             territories until the narration named them made the map flicker: shapes
             arriving one at a time is an answer being built, and a zone is not an answer —
             it is the ground the answer will be drawn on, true before anybody pressed
             anything and unchanged by pressing it. What ② withholds is the *routes*. */
          return (
            <polygon
              key={`fill-${zone.id}`}
              points={ringPath(zone.ring)}
              fill={emphasis === 'open' ? zone.color : MUTED_INK}
              fillOpacity={ZONE_FILL[emphasis]}
              style={{ transition: 'fill-opacity 260ms ease, fill 260ms ease' }}
            />
          );
        })}

        {drawnZones.map((zone) => {
          const emphasis = emphasisFor(zone.id);
          const hovered = zone.id === hoveredZoneId;
          /* **A muted circle is grey, not its own hue at low opacity.** Asked for directly
             — *"the other radiuses will be very much less prominent and grayed out"* — and
             it is also the stronger read: four washed-out hues on a raster basemap are four
             things competing quietly, whereas grey is unmistakably *not the subject*. The
             colour comes back on hover, because a hovered circle is one the planner is
             asking about, and its hue is the answer to which zone it is. */
          const muted = emphasis !== 'open' && !hovered;

          return (
            <polygon
              key={`stroke-${zone.id}`}
              points={ringPath(zone.ring)}
              fill="none"
              stroke={muted ? MUTED_INK : zone.color}
              strokeOpacity={emphasis === 'open' || hovered ? 0.95 : 0.55}
              strokeWidth={
                emphasis === 'open'
                  ? ZONE_STROKE.open
                  : hovered
                    ? ZONE_STROKE.hovered
                    : ZONE_STROKE.muted
              }
              /* **No dash.** It used to mean "no day in this range works this zone", and
                 those zones are not drawn at all now, so the only thing a dashed circle
                 could say here is nothing. Removed on instruction; the fact itself is still
                 stated in words by the issues tray, which owns that sentence. */
              strokeLinejoin="round"
              style={{ transition: 'stroke-opacity 200ms ease, stroke-width 160ms ease' }}
            />
          );
        })}

        {/* ── The drop verdict, as an overlay ring ─────────────────────────────
            While a stop is in flight, the zone under the pointer says whether it would
            take it. One zone per day means most cross-day moves are simply the wrong
            ground, so this is the commonest verdict the feature gives and the one the
            drawer could only ever state in words.

            **It is drawn over the zone rather than recolouring it, and that was a bug
            first.** Repainting the boundary green or red assumed the zone's own colour
            would get out of the way — and East is orange `#eb6834` against a refusal red
            of `#E43F32`, which at 2px on a busy basemap is the same line. The refusal was
            invisible on exactly one of four zones, which is worse than not drawing it,
            because it is invisible unpredictably.

            A separate ring outside the boundary, at three times the weight and with a
            wash inside it, cannot be confused with the territory it is annotating
            whatever colour that territory is. The wash is what carries it at a glance;
            the ring is what says which shape is being talked about. */}
        {dropZoneId
          ? (() => {
              const zone = zones.find((entry) => entry.id === dropZoneId);
              if (!zone || zone.ring.length < 3) return null;
              const ink = dropLegal ? '#2E964B' : '#E43F32';

              return (
                <g key="drop-verdict" style={{ pointerEvents: 'none' }}>
                  <polygon points={ringPath(zone.ring)} fill={ink} fillOpacity={0.14} />
                  <polygon
                    points={ringPath(zone.ring)}
                    fill="none"
                    stroke={ink}
                    strokeOpacity={0.95}
                    strokeWidth={3.5}
                    strokeDasharray={dropLegal ? undefined : '9 6'}
                    strokeLinejoin="round"
                  />
                </g>
              );
            })()
          : null}

        {/* ── The routes ───────────────────────────────────────────────────────
            Every worked day's legs, base out and base back (D9). Straight lines, and
            that is honest rather than lazy: the fixture's geography is notional miles
            on a flat grid and the planner's own cost model is Euclidean, so a
            road-following path would be a more detailed drawing of a thing that was
            never measured that way. */}
        {runsheets.map((sheet) => {
          const zone = zones.find((entry) => entry.id === sheet.zoneId);
          if (!zone || !sheet.stops.length) return null;
          const isOpen = sheet.date === openDay;
          /* A day the narration has not announced yet has no route on the map. The zone
             stays — it is the frame — but the answer inside it waits for the line that
             states it, which is the whole of what ② is for. */
          if (announcedRouteDates && !announcedRouteDates.includes(sheet.date)) return null;

          const points = [
            basePx,
            ...sheet.stops.map((stop) => toScreen(sitePointById(stop.site?.id) || BASE_POINT)),
            basePx,
          ];

          const path = points.map((point) => `${point.x},${point.y}`).join(' ');

          return (
            <g key={`route-${sheet.date}`}>
              {isOpen ? (
                <polyline
                  points={path}
                  fill="none"
                  stroke={ROUTE_CASING.color}
                  strokeOpacity={ROUTE_CASING.opacity}
                  strokeWidth={ROUTE_CASING.width}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ) : null}
              <polyline
                points={path}
                fill="none"
                stroke={zone.color}
                strokeOpacity={isOpen ? ROUTE_OPACITY.open : ROUTE_OPACITY.other}
                strokeWidth={isOpen ? ROUTE_WIDTH.open : ROUTE_WIDTH.other}
                strokeLinecap="round"
                strokeLinejoin="round"
                /* A dashed leg back to base would be the obvious flourish and it would be a
                   lie: the return drive is as real as any other leg and it is what makes
                   the day's total what it is. */
                style={{ transition: 'stroke-opacity 220ms ease, stroke-width 160ms ease' }}
              />
            </g>
          );
        })}

        {/* ── The stops ────────────────────────────────────────────────────────
            Numbered on the open day, plain on the rest. The number is the second cue
            that separates the open day from the others — the first being the route's
            weight — and it is the one that survives being read in greyscale. */}
        {runsheets.map((sheet) => {
          const zone = zones.find((entry) => entry.id === sheet.zoneId);
          if (!zone) return null;
          if (announcedRouteDates && !announcedRouteDates.includes(sheet.date)) return null;
          const isOpen = sheet.date === openDay;

          return sheet.stops.map((stop) => {
            const point = sitePointById(stop.site?.id);
            if (!point) return null;
            const at = toScreen(point);
            const lit = stop.site?.id === highlightedSiteId;

            return (
              <g key={`stop-${sheet.date}-${stop.visit.id}`} style={{ pointerEvents: 'none' }}>
                {lit ? (
                  <circle
                    cx={at.x}
                    cy={at.y}
                    r={isOpen ? 15 : 11}
                    fill={zone.color}
                    fillOpacity={0.2}
                  />
                ) : null}
                <circle
                  cx={at.x}
                  cy={at.y}
                  r={isOpen ? 9 : 5}
                  fill={zone.color}
                  fillOpacity={isOpen ? 1 : 0.55}
                  stroke="#FFFFFF"
                  strokeWidth={isOpen ? 2 : 1.5}
                  style={{ transition: 'r 160ms ease, fill-opacity 200ms ease' }}
                />
                {isOpen ? (
                  <text
                    x={at.x}
                    y={at.y}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill="#FFFFFF"
                    fontSize="9"
                    fontWeight="600"
                  >
                    {stop.index}
                  </text>
                ) : null}
              </g>
            );
          });
        })}

        {/* ── The work, before anything has sequenced it ──────────────────────
            A plain dot per site in its own zone's colour: no number, no line, no order.
            That is the whole truth at ①, and it is the thing the range is actually
            scoping — where this week's work is, and which territory each piece is in.

            **Drawn instead of the routes, not alongside them.** `plan.runsheets` is
            solved from the first frame (the engine is synchronous), so the map *could*
            show the finished answer here and briefly did. A sequence on screen before
            the press makes the button decorative and leaves the reveal with nothing to
            reveal. Numbers and lines are what Harmonize adds. */}
        {!planned
          ? SITE_POINTS.map((site) => {
              const zone = zones.find((entry) => entry.id === site.zoneId);
              const at = toScreen(site);
              return (
                <SitePin
                  key={`site-${site.id}`}
                  at={at}
                  color={zone?.color || '#6A6A70'}
                  hovered={site.id === hoverSiteId}
                  /* Everything outside the open day's zone is subordinate, including the
                     sites of a zone no day works — those have no circle at all now, so
                     their pins are the only thing left saying they are in scope. */
                  dulled={emphasisFor(site.zoneId) !== 'open'}
                />
              );
            })
          : null}

        {/* Work that landed on no day at all — spilled off a full day, or stranded in a
            zone nobody works. Hollow, in its zone's colour, because it is still *of* that
            zone: the whole remedy for a stranded visit is to work its zone, and a mark
            that had dropped its colour would be hiding the one fact that fixes it. */}
        {(planned ? [...looseSet] : []).map((siteId) => {
          const point = sitePointById(siteId);
          if (!point) return null;
          const zone = zones.find((entry) => entry.id === point.zoneId);
          const at = toScreen(point);
          return (
            <SitePin
              key={`loose-${siteId}`}
              at={at}
              color={zone?.color || '#6A6A70'}
              hovered={siteId === hoverSiteId}
              hollow
            />
          );
        })}

        {/* Base, drawn as a ring rather than a pin — it is not a stop, and giving it the
            same mark as one would put an extra numberless stop in every route. */}
        <g style={{ pointerEvents: 'none' }}>
          <circle cx={basePx.x} cy={basePx.y} r={8} fill="#FFFFFF" fillOpacity={0.9} />
          <circle
            cx={basePx.x}
            cy={basePx.y}
            r={5.5}
            fill="none"
            stroke="#262527"
            strokeWidth={2}
          />
          <circle cx={basePx.x} cy={basePx.y} r={1.75} fill="#262527" />
        </g>

        {/* ── The names ────────────────────────────────────────────────────────
            The hovered territory's name, and nothing else's. `hoverZoneId` records what
            that costs the palette's relief rule and what would discharge it.

            The `not worked` second line that used to hang under a zone's name is **gone
            with the zones it described** — a zone no day works is not drawn at all now, so
            there is no shape left to caption. The fact is still stated in words, by the
            issues tray, which owns that sentence.

            Painted stroke-first so the white halo sits behind the glyphs and the name
            survives crossing a road or a park. */}
        {drawnZones.map((zone) => {
          if (!zone.centroid) return null;
          /* Only the hovered territory names itself now — see `hoverZoneId`, which records what
             that costs and why nothing currently discharges the palette's relief rule. */
          if (zone.id !== hoverZoneId) return null;
          const at = toScreen(zone.centroid);
          const emphasis = emphasisFor(zone.id);

          return (
            <text
              key={`label-${zone.id}`}
              x={at.x}
              y={at.y}
              textAnchor="middle"
              dominantBaseline="central"
              fill={zone.color}
              fontSize={emphasis === 'open' ? 13 : 11.5}
              fontWeight={emphasis === 'open' ? 700 : 600}
              stroke="#FFFFFF"
              strokeWidth={3}
              paintOrder="stroke"
              letterSpacing="0.04em"
              style={{ pointerEvents: 'none', textTransform: 'uppercase' }}
            >
              {zone.name}
            </text>
          );
        })}
      </Box>

      {/* ── Chrome ───────────────────────────────────────────────────────────── */}
      <Box className={classes.zoom} data-map-chrome>
        <Box
          component="button"
          type="button"
          className={classes.zoomButton}
          disabled={zoom >= MAX_ZOOM}
          aria-label={tt('zoomIn')}
          onClick={() => zoomBy(1)}
        >
          +
        </Box>
        <Box
          component="button"
          type="button"
          className={classes.zoomButton}
          disabled={zoom <= MIN_ZOOM}
          aria-label={tt('zoomOut')}
          onClick={() => zoomBy(-1)}
        >
          −
        </Box>
      </Box>

      {dropZoneId ? (
        <Box
          className={classNames(
            classes.dropVerdict,
            dropLegal ? classes.dropVerdictLegal : classes.dropVerdictRefused,
          )}
        >
          {dropLegal ? tt('dropLegal') : dropReason}
        </Box>
      ) : null}

      {/**
       * The hover card.
       *
       * ## Placed against the container, not the pin
       *
       * Centred over the pin and lifted clear of its tip, then **clamped to the map's own
       * edges** — an unclamped card on a pin near the right edge is a card half off the
       * surface, and this map is a 40-mile box whose pins reach all four sides. It flips
       * *under* the pin when there is not `CARD_FLIP_ABOVE` of room above it, which is the
       * only case where covering the thing you are pointing at is the lesser fault.
       *
       * ## What it says, and the order it says it in
       *
       * Company as an eyebrow, site as the heading, zone in its own colour, then the facts
       * on a hairline-separated grid — see `siteFacts` for why each fact is on the card and
       * what was left off. The one row that is a *finding* rather than a fact — a zone no day
       * works, which is why a visit is stranded — is the one row with a colour on it.
       */}
      {hoverCard ? (
        <Box
          className={classes.card}
          style={{
            left: hoverCard.left,
            top: hoverCard.top,
            transform: hoverCard.below ? 'none' : 'translateY(-100%)',
          }}
        >
          <Typography className={classes.cardCompany}>{hoverCard.facts.company}</Typography>
          <Typography className={classes.cardSite}>{hoverCard.facts.name}</Typography>

          <Box className={classes.cardZone}>
            <Box
              className={classes.cardZoneDot}
              style={{ background: hoverCard.facts.zoneColor }}
              aria-hidden="true"
            />
            <Typography className={classes.cardZoneName}>
              {hoverCard.facts.zoneName || tt('anyZoneShort')}
            </Typography>
            <Typography className={classes.cardZoneNote}>
              {tt('milesFromBase', { miles: hoverCard.facts.milesFromBase.toFixed(1) })}
            </Typography>
          </Box>

          <Box className={classes.cardFacts}>
            <Typography className={classes.cardLabel}>{tt('cardFilters')}</Typography>
            <Typography className={classes.cardValue}>{hoverCard.facts.filters}</Typography>

            <Typography className={classes.cardLabel}>{tt('cardDue')}</Typography>
            <Typography className={classes.cardValue}>{hoverCard.due}</Typography>

            <Typography className={classes.cardLabel}>{tt('cardWindow')}</Typography>
            <Typography className={classes.cardValue}>{hoverCard.window}</Typography>

            <Typography className={classes.cardLabel}>{tt('cardPlacement')}</Typography>
            <Typography
              className={classNames(
                classes.cardValue,
                hoverCard.placementWarn && classes.cardValueWarn,
              )}
            >
              {hoverCard.placement}
            </Typography>
          </Box>
        </Box>
      ) : null}

      <Typography className={classes.attribution}>{tt('attribution')}</Typography>
    </Box>
  );
};

ZoneRouteMap.propTypes = {
  /** `zoneRings()` output — id, name, colour, ring, centroid. */
  zones: PropTypes.array.isRequired,
  runsheets: PropTypes.array,
  /** Config A's worked days, for the zone → day mapping a click resolves through. */
  workedDays: PropTypes.array,
  openDay: PropTypes.string,
  onOpenDay: PropTypes.func,
  /**
   * Set by a day pill, so pointing at a day lights its ground.
   *
   * One-way on purpose. The map used to emit hover too, from the legend rows that are now
   * gone, and wiring it back through the surface itself would mean hit-testing four rings
   * on every pointer move — during a pan, on the element the pan is happening on. The
   * pills are the index; the map is what the index points at.
   */
  hoveredZoneId: PropTypes.string,
  highlightedSiteId: PropTypes.string,
  onHighlight: PropTypes.func,
  /** Whether a run has happened. Before it, the map draws unsequenced site dots instead
   * of routes — the engine solves eagerly, so "there are runsheets" is true far earlier
   * than "the planner has asked for any". */
  planned: PropTypes.bool,
  /** Sites with work on no day — spilled or stranded. Drawn hollow. */
  looseSiteIds: PropTypes.array,
  /** While a stop is in flight: the zone under the pointer and what it would say. */
  dropZoneId: PropTypes.string,
  dropLegal: PropTypes.bool,
  dropReason: PropTypes.string,
  /** During ②: the runsheet dates the narration has announced. `null` means no gate. */
  announcedRouteDates: PropTypes.array,
};

ZoneRouteMap.defaultProps = {
  runsheets: [],
  workedDays: [],
  looseSiteIds: [],
};

export default ZoneRouteMap;
