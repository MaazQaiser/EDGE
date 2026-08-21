import OpenInNewOutlinedIcon from '@mui/icons-material/OpenInNewOutlined';
import RouteOutlinedIcon from '@mui/icons-material/RouteOutlined';
import { Box, Button, Typography } from '@mui/material';
import { useJsApiLoader } from '@react-google-maps/api';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { Clossicon } from 'src/assets/svg';
import { GOOGLE_MAPS_API_VERSION, GOOGLE_MAPS_LIBRARIES } from 'src/utils/constants';

import { MapPinOutlineIcon, SlidersIcon } from './components/Glyphs';
import MapColumn from './components/MapColumn';
import RoutesColumn from './components/RoutesColumn';
import SetupColumn from './components/SetupColumn';
import ThinkingStage from './components/ThinkingStage';
import { buildVisits } from './demoVisits';
import { useStyles } from './harmonizeWorkspace.styles';
import { useDirections } from './useDirections';
import { LINE_MS, useHarmonizeReveal } from './useHarmonizeReveal';
import { dayLabelOf, MAP_STEP, useHarmonizeRun } from './useHarmonizeRun';
import { useStartPoint } from './useStartPoint';

/**
 * Harmonize: the optimizer proposes the week's routes, the planner edits them.
 *
 * **Why this is a screen and not a drawer.** Harmonizing has three parts that are read
 * against each other: the settings that decide who is in the run, the routes that come
 * out, and where those routes actually go. A 680px drawer could only stack them, so
 * changing a radius meant scrolling 400px to find out whether the route improved and
 * scrolling back — the feedback loop the whole feature turns on was the one thing the
 * layout made expensive. Three columns put cause, effect and consequence side by side:
 * **a quarter of the screen asks the question, a quarter shows the answer, half of it
 * draws the answer on the ground.** Nothing moves when a knob turns except the numbers.
 *
 * **What the run is.** The planner works particular weekdays. Every filter replacement is
 * due on a date the contract fixed and may be pulled forward or pushed back only so far.
 * The van leaves from where the planner is and comes back. So a run collapses a week's
 * scattered work onto one route day — everything whose need-by window reaches that date
 * and whose site is inside the radius, sequenced into the shortest round trip that fits
 * eight hours — and hands whatever will not fit to the next route day, solved the same
 * way. It is a *run of routes*, not a route and a leftover: every card is the same object,
 * dated, sequenced, measured against the eight hours, because a second day the planner
 * cannot check is a second day they will not trust.
 *
 * **The flow.** Open on an answer, not on a form. The optimizer has solved before the
 * screen paints; what the first two seconds do is *show its working* on the map, one line
 * at a time, with a way past it for anyone who has seen it before. Then the planner
 * accepts it, re-dates it, or overrules it — and the bar at the bottom states what
 * pressing Apply will write before they press it.
 *
 * State and arithmetic live in `useHarmonizeRun`; this file is the shell and the three
 * regions. Nothing is written until Apply.
 */

const MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

/** Matches `overlayLeaving`'s own duration — the fade has to finish before the unmount. */
const OVERLAY_LEAVE_MS = 220;

const HarmonizeWorkspace = ({
  open,
  onClose,
  weekVisits,
  routeTerm,
  onApplied,
  onPreviewChange,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const tt = (key, options) => t(`obx.runsheet.harmonize.${key}`, options);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: MAPS_API_KEY,
    version: GOOGLE_MAPS_API_VERSION,
    libraries: GOOGLE_MAPS_LIBRARIES,
  });

  /* With no key, Google renders its own "can't load Maps" modal over the screen. Better
     to never instantiate a map and let the keyless renderer draw the streets instead. */
  const mapsReady = Boolean(MAPS_API_KEY) && isLoaded;

  const [highlightedSiteId, setHighlightedSiteId] = useState(null);
  /**
   * Whether the surface is on its way out.
   *
   * **The exit had no animation at all**, because `open` is the parent's state and the honest
   * response to it going false is to stop rendering — so the whole working area was replaced
   * by the calendar between two frames, which is the abruptness that reads worst: the
   * planner has been reading this screen and it vanishes mid-glance.
   *
   * So leaving is a state of its own. Every way out sets it, the surface plays its fade, and
   * only then is the parent told — which means the parent's `open` stays true for the length
   * of the animation and there is something on screen to animate. It is reset on the way in
   * rather than at the end of the fade, so a workspace reopened straight after closing is not
   * still wearing the leaving class.
   */
  const [leaving, setLeaving] = useState(false);

  /**
   * The optimizer's input, built once and shared.
   *
   * **Built here rather than inside the run, and that ordering is load-bearing.** The run
   * needs a start point, the start point's last-resort rung is the centre of the visits,
   * and the visits are what `buildVisits` produces — a cycle, unless the visits are built
   * above both. Deriving the centroid from the raw calendar payload instead is what broke
   * it once: those rows carry no coordinates at all, so the centroid was `null`, the
   * ladder had nothing to fall back to, and a screen with five visits on the map reported
   * that it could not plan a route.
   */
  const visits = useMemo(() => buildVisits(weekVisits), [weekVisits]);

  /**
   * The origin of last resort: the middle of the week's own work.
   *
   * The spec is "start and end at the planner's current location", and that is what the
   * ladder in `useStartPoint` reaches for first. But the browser can refuse — permission
   * denied is a single click and the demo tenant carries no franchise coordinates — and
   * then there is no origin at all, which means no sequence, no arrival times and no
   * capacity meter: one unresolved value looking like four broken features. A day planned
   * from the centre of its own stops is a defensible assumption, it is within a few
   * minutes of the truth for a clustered round, and the field says out loud that it made
   * it.
   */
  const visitsCentroid = useMemo(() => {
    const points = visits.filter(
      (visit) => Number.isFinite(visit.lat) && Number.isFinite(visit.lng),
    );
    if (!points.length) return null;
    return {
      /* No label. `useStartPoint` describes every point as a place — a geocoded address,
         or its coordinates if the geocoder cannot say — so a rung has no business naming
         itself, least of all by naming its own method. */
      label: '',
      address: '',
      lat: points.reduce((total, visit) => total + visit.lat, 0) / points.length,
      lng: points.reduce((total, visit) => total + visit.lng, 0) / points.length,
    };
  }, [visits]);

  const startPoint = useStartPoint({ enabled: open, fallbackPoint: visitsCentroid });

  const run = useHarmonizeRun({ open, visits, routeTerm, startPoint });

  const {
    activeVisits,
    routes,
    routeCount,
    activeRoute,
    facts,
    hasPlan,
    diagnosis,
    placedVisitCount,
    notInPlanCount,
    keptCount,
    reorderedCount,
    unnamedRoutes,
    unplaced,
    rangeStart,
    rangeEnd,
    runRule,
    term,
    apply,
    applying,
    hasRun,
    harmonize,
    cancel,
    canHarmonize,
    isStale,
    solvedSignature,
    solvedAttempt,
    radiusKm,
    radiusMiles,
    coversCount,
  } = run;

  /**
   * The reveal.
   *
   * `runKey` is this *sitting* — a fresh set of visits — and changing it replays the whole
   * sequence. `solveKey` is the current *answer*, and changing that while the plan is up
   * is an edit: it gets an acknowledgement and the map's fast redraw, not two more seconds
   * of theatre. Replaying on both is what made re-dating one route mean sitting through
   * the introduction again.
   */
  const reveal = useHarmonizeReveal({
    /* **`hasRun` is in the sitting's identity, so the press is an arrival.** The reveal
       distinguishes a fresh sitting, which replays the whole narration, from an edit to a
       standing answer, which gets a 380ms settle. Pressing Harmonize moves `routes` from
       empty to solved, and `routes` is in `solveKey` — so without this the first plan the
       planner ever sees would arrive as an *edit*: no narration, no route drawing itself
       in, just a finished plan appearing. The press is the arrival; everything after it is
       an edit. */
    /* **`solvedAttempt` as well as the signature, because Cancel exists now.** Abandoning a
       run and pressing Harmonize again with nothing changed produces a byte-identical
       signature, so the reveal would treat the second press as the same sitting it had
       already played and hand back a finished plan with no narration — the "opens on an
       answer" behaviour the twentieth pass removed, reachable by pressing one button. Every
       press is an arrival, and the counter is what says so. */
    runKey: `${visits.length}|${open}|${solvedSignature}|${solvedAttempt}`,
    /* The knobs are part of the answer's identity: turning the need-by window is an edit
       to the question, and it gets the same brief acknowledgement a re-dated route does
       rather than passing silently.

       **The install days are in here for a reason that is easy to miss.** They are not
       covered by `routes.map(day)`: un-ticking a weekday the run had no work on, or
       ticking one whose date the run then declines to use, changes which visits are
       *eligible* without moving a single route's date — so the key would not move, the
       reveal would not acknowledge it, and the map would not redraw. That is precisely
       the silent-edit class the whole reveal exists to prevent, and it would show up
       only in the cases where the planner was already unsure what their change did. */
    solveKey: `${startPoint.point?.lat ?? ''}|${routes.map((route) => route.day).join()}|${
      activeVisits.length
    }|${runRule.needByDays}|${runRule.radiusKm}|${runRule.preferredWeekdays.join()}`,
    /* Parked until the press. The machine's off state and its composing state are the
       same value, which is safe here only because nothing in the region renders before
       `hasRun` — see the awaiting branch. */
    enabled: open && hasRun && Boolean(visits.length),
    lineCount: facts.lines.length,
    stopCount: routes[0]?.plan?.stops?.length || 0,
    /* The route travels across the map while the line announcing it is being said, and the
       last line lands over the top of it. Waiting for the whole speech left the map
       holding a set of candidates for five seconds and then drawing in silence. */
    drawFromLine: MAP_STEP.SEQUENCE,
  });

  const directions = useDirections({
    isLoaded: mapsReady,
    startPoint: startPoint.point,
    stops: activeRoute?.plan?.stops || [],
    endPoint: activeRoute?.plan?.stops?.length ? startPoint.point : null,
    enabled: open,
  });

  /* Directions decide the numbers; haversine only decided the order. */
  const travelMinutes =
    directions.state === 'ready'
      ? directions.totalTravelMinutes
      : activeRoute?.plan?.travelMinutes || 0;

  /**
   * How far through its own explanation the map is.
   *
   * `MAP_STEP` holds indices into `facts.lines`, so the map and the narration cannot
   * drift: the ring appears on the line that names the radius because both read the same
   * number. If a line is ever added or reordered, that constant is the one place that has
   * to move with it — which is why the steps are named rather than written as `>= 2`.
   */
  const mapStep = hasRun && reveal.isWorking ? reveal.lineIndex : MAP_STEP.DONE;

  /**
   * The origin, as an address.
   *
   * Not labelled with which rung answered. A `CURRENT` / `ASSUMED` chip named *how the
   * value was arrived at*, which is the screen's problem and not the planner's: the field
   * asks where the day starts, and the answer to that is a street. It also made the honest
   * case look like the doubtful one — a reverse-geocoded device fix is the most accurate
   * origin available and it was the one wearing a badge.
   */
  const startAddress = startPoint.point?.address?.trim() || startPoint.point?.label?.trim() || '';
  const startPending =
    startPoint.isResolving || startPoint.isLocating ? tt('startPending') : tt('noStartPoint');

  /* The calendar behind ghosts the move while this is open, so Apply is confirming
     something already watched rather than announcing something new. */
  useEffect(() => {
    if (!open || !routes.length) {
      onPreviewChange?.(null);
      return;
    }

    const dayKeyOf = (day) => (day?.isValid?.() ? day.format('YYYY-MM-DD') : '');
    const first = routes[0];
    const movingVisitIds = routes.flatMap((route) =>
      route.plan.stops
        .filter((stop) => stop.isNew)
        .flatMap((stop) => stop.visits)
        .filter((visit) => dayKeyOf(visit.scheduledFor) !== route.day)
        .map((visit) => visit.id),
    );

    onPreviewChange?.({
      targetDay: first.day,
      overflowDay: routes[1]?.day || null,
      movingVisitIds,
      overflowVisitIds: routes
        .slice(1)
        .flatMap((route) =>
          route.plan.stops.filter((stop) => stop.isNew).flatMap((stop) => stop.visits),
        )
        .map((visit) => visit.id)
        .concat(unplaced.map((visit) => visit.id)),
    });
    // eslint-disable-next-line
  }, [open, routes, unplaced, onPreviewChange]);

  /**
   * Every way out, in one place.
   *
   * **Declared above the effect that calls it, and that is not stylistic.** A `const`
   * referenced from a line above its own declaration is a temporal-dead-zone
   * `ReferenceError` that lints and builds perfectly cleanly and then blanks the page at
   * runtime — this screen has now paid for that twice, and the keydown effect below reads
   * this value, so this has to come first.
   */
  /* Guarded against a second press mid-fade, which would otherwise stack two timers and
     close twice. */
  const requestClose = useCallback(() => {
    setLeaving((already) => {
      if (already) return already;
      window.setTimeout(() => onClose?.(), OVERLAY_LEAVE_MS);
      return true;
    });
  }, [onClose]);

  useEffect(() => {
    if (open) setLeaving(false);
  }, [open]);

  /**
   * Escape leaves, and the page behind does not scroll.
   *
   * This is a mode covering the whole viewport, so the two conventions a modal surface
   * owes the reader are the ones a plain `position: fixed` box does not get for free.
   * Nothing is written until Apply, so leaving by mistake costs the planner their edits
   * and nothing else — which is why Escape closes outright rather than asking.
   */
  useEffect(() => {
    if (!open) return undefined;

    const onKeyDown = (event) => {
      if (event.key === 'Escape') requestClose();
    };
    document.addEventListener('keydown', onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, requestClose]);

  /* Apply fades out too, and it fades out *after* the write has been reported — the calendar
     behind starts animating the moved visits as this surface goes, so the two read as one
     handover rather than as a screen closing and something unrelated happening next. */
  const onApply = useCallback(
    () =>
      apply((result) => {
        onApplied?.(result);
        setLeaving(true);
      }),
    [apply, onApplied],
  );

  if (!open) return null;

  const isEmpty = !visits.length;

  /**
   * Why Apply will not go, and what to do about it.
   *
   * Apply had two ways of refusing and neither said anything. It could arrive disabled —
   * no plan, no origin, an origin on another continent — and it could be pressed and
   * *silently do nothing*, because the handler bails when a new route has no name. A
   * control that refuses without saying why reads as a broken button, and the planner's
   * next move is to press it again.
   *
   * One value, checked in the order the planner would have to fix things: an origin before
   * a plan, a plan before its name. `diagnosis` is read rather than re-derived so the
   * columns and this bar cannot drift apart; the unnamed-route case is this bar's alone,
   * because it is not a finding about the plan but a form field that has not been filled.
   */
  /**
   * Why Harmonize will not go.
   *
   * The same `diagnosis` the action bar reads, so the two halves of the screen cannot
   * disagree about what is wrong — and it is deliberately the whole of it rather than a
   * pre-press subset: every branch that can be true before a solve is a branch the button
   * has to answer for. The unnamed-route case is not here, because a route cannot be
   * unnamed before it exists.
   */
  const runBlock = hasRun ? null : diagnosis;

  const applyBlock = reveal.isComposing
    ? null /* the button says `Working it out…`, which is explanation enough */
    : diagnosis?.text
      ? diagnosis
      : unnamedRoutes.length
        ? {
            text: tt('blockUnnamed', { count: unnamedRoutes.length, route: term.toLowerCase() }),
            field: 'name',
          }
        : null;

  /* Nothing is applicable until the plan has been shown — enabling Apply during the reveal
     would let a fast planner commit a plan the screen had not finished stating, and the
     button's own label names a day it has not printed yet. The unnamed case deliberately
     leaves the button **enabled**: pressing it is what marks and opens the field that needs
     filling, and a disabled button cannot take the planner anywhere. */
  const canApply =
    hasPlan && !applying && !reveal.isComposing && (!applyBlock || applyBlock.field === 'name');

  /**
   * Rendered onto `body`, not where it is mounted.
   *
   * This lives in the calendar page's tree because that is where its input and its
   * `onApplied` come from, and the calendar page wraps its grid in a container that
   * animates the visit cards during an apply. A `position: fixed` box takes its frame
   * from the nearest ancestor with a transform or a filter rather than from the viewport,
   * so leaving it in place would make a full-screen surface silently depend on styling
   * two components away. A portal makes "full screen" mean the screen.
   */
  return createPortal(
    /**
     * `role="dialog"` **without** `aria-modal`, and that is not an omission.
     *
     * `aria-modal="true"` tells a screen reader that nothing outside this element exists,
     * and the app's left navigation is now deliberately outside it and deliberately
     * usable — harmonizing should not be a room with one door. Claiming modality while
     * leaving the nav interactive would hide a working control from exactly the readers
     * who cannot see that it is still there, which is worse than not making the claim.
     * Nothing here depended on it: Escape closes because of the key handler above, and
     * there is no click-out to trap.
     */
    <Box
      className={classNames(classes.overlay, leaving && classes.overlayLeaving)}
      role="dialog"
      aria-label={tt('titleOptimize')}
    >
      <Box className={classes.topBar}>
        <Button
          disableRipple
          className={classes.backButton}
          onClick={requestClose}
          aria-label={tt('closeWorkspace')}
        >
          <Clossicon />
        </Button>
        <Box className={classes.topBarTitles}>
          <Typography className={classes.title}>{tt('titleOptimize')}</Typography>
        </Box>
        <Box className={classes.grow} />
        {/* What is being harmonized, stated once for the whole screen. Every count in the
            columns is a count *of this*, and without it they are numbers with no
            denominator. */}
        {!isEmpty && rangeStart && rangeEnd ? (
          <Typography className={classes.scopeChip}>
            {tt('stageScope', {
              count: activeVisits.length,
              from: rangeStart.format('ddd D MMM'),
              to: rangeEnd.format('ddd D MMM'),
            })}
          </Typography>
        ) : null}

        {/**
         * **No total-covered chip here any more.**
         *
         * It printed the run's whole cost — travel, time on site, and anything already on a
         * route being merged into — as a second chip beside the scope, and it was the third
         * place this screen stated the size of the answer. The footer carries the figures at
         * 22px and each route card carries its own `6 hr 43 min / 8 hr`, which is the number
         * a planner actually acts on because it is the one measured against a day. A sum
         * across every route is measured against nothing: two routes totalling eleven hours
         * is not a fact about anybody's Tuesday.
         *
         * The scope chip stays, because it is the *denominator* — what is being harmonized —
         * and every count in the columns is a count of it.
         */}
      </Box>

      {isEmpty ? (
        <Box className={classes.empty}>
          <Typography className={classes.emptyText}>{tt('emptyWeek')}</Typography>
        </Box>
      ) : (
        <>
          <Box className={classes.body}>
            <Box className={classNames(classes.column, classes.setupColumn)}>
              <Box className={classes.columnHeader}>
                <SlidersIcon className={classes.columnIcon} />
                <Typography className={classes.columnTitle}>{tt('columnSetup')}</Typography>

                <Box className={classes.grow} />

                {/**
                 * The way out to Config A, in the corner of the column that overrides it.
                 *
                 * **§3 of `HARMONIZE-CONTEXT.md` is the reason this belongs here.** There are two
                 * configuration layers and conflating them is the documented design trap: this
                 * column is Config B — it seeds from the franchise settings and overrides them
                 * *for this run only*, writing nothing back. Every field under this heading is
                 * therefore a temporary answer to a question whose permanent answer lives
                 * somewhere else, and until now the screen gave no way to get to it.
                 *
                 * **A new tab, not a navigation.** Harmonize is a mode holding unsaved work —
                 * nothing is written until Apply — so following a link in place would discard a
                 * proposal to go and look at a setting. `target="_blank"` keeps the run on screen,
                 * which is also why this is drawn as an external link rather than as a tab.
                 *
                 * It lands on Settings › Preferences rather than directly on Harmonization,
                 * because the outer and inner tab strips both read the same `activeTab` query key
                 * (see `customTabsWithPermissions`), so one parameter cannot address both levels —
                 * `activeTab=harmonization` would leave the outer strip unmatched and fall back to
                 * its first tab, which is further from the destination than this is. Deep-linking
                 * the sub-tab is a change to the settings page, not to this link.
                 */}
                <Box
                  component="a"
                  className={classes.configLink}
                  href="/app/settings?activeTab=preferences"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Typography className={classes.configLinkText}>{tt('configureLink')}</Typography>
                  <OpenInNewOutlinedIcon className={classes.configLinkIcon} />
                </Box>
              </Box>
              <Box className={classes.columnBody}>
                <SetupColumn
                  run={run}
                  startPoint={startPoint}
                  startAddress={startAddress}
                  placesReady={mapsReady}
                />
              </Box>

              {/**
               * The question's own footer, holding the press that answers it.
               *
               * **Two footers, one per half, replacing a single bar across the bottom.** The bar
               * put both actions in the same corner, which fixed the CTA jumping left-to-right
               * but created a worse ambiguity: *Harmonize* belongs to the settings on the left
               * and *Create Route* to the plan on the right, and stacking them in one slot made
               * the screen look as though it had one action that kept renaming itself. Each half
               * now ends with its own action, under the thing it acts on.
               *
               * **Disabled once it has been pressed, until something changes.** `canHarmonize`
               * is false while the plan on screen still answers the question on screen — which
               * is the whole reason the knobs stopped re-solving live (see `solved`). Turning any
               * of them re-enables this button, and pressing it re-runs the optimizer.
               */}
              <Box className={classes.columnFooter}>
                {runBlock ? (
                  <Typography className={classes.setupBlockLine}>
                    <Box component="span" className={classes.blockIcon} aria-hidden="true">
                      ⚠
                    </Box>
                    {runBlock.text}
                  </Typography>
                ) : null}
                <Button
                  disableRipple
                  variant="primary"
                  className={classes.harmonizeButton}
                  disabled={Boolean(runBlock) || !canHarmonize}
                  onClick={harmonize}
                  aria-label={tt('harmonizeCtaAria')}
                >
                  {tt('harmonizeCta')}
                </Button>
              </Box>
            </Box>

            {/**
             * ---------- the optimizer's half of the screen ----------
             *
             * **One region holding two panes, where there used to be two columns.** The
             * routes and the map were siblings of the setup column, each with its own
             * heading and a hairline between them, and read cold that said there were
             * three equal parts to this screen. There are two: the planner asks on the
             * left, the optimizer answers on the right. The answer happens to be
             * expressed twice — as a list of stops with times on them, and as a line on
             * the ground — but those are two views of one thing, produced by one press,
             * and the seam between them was claiming otherwise.
             *
             * So: one heading for the whole region, no rule down the middle, one
             * background, and one working glow that washes across both panes rather than
             * pulsing in the left one while the map sits still beside it. The panes keep
             * their own widths and their own data — nothing is merged except the frame.
             *
             * `position: relative` here rather than on the panes, because the glow is a
             * layer of this region now and everything else has to paint above it.
             */}
            <Box className={classes.aiRegion}>
              {/* The AI-working wash, spanning the whole region. `transform`/`opacity`
                  only, on a layer behind the header and the panes — a gradient's stops
                  cannot be keyframed cheaply, a layer's opacity and scale can. It pulses
                  while the optimizer is doing anything visible at all and settles, motion
                  and all, the moment it is done. */}
              {/* **`hasRun` as well as `isWorking`, and it was a live fault before the map
                  arrived.** The reveal's off state and its composing state are the same
                  value — `stage` sits at `COMPOSING` whenever the hook is disabled — so
                  `isWorking` is true from the moment the workspace opens, and this wash has
                  been pulsing on a three-and-a-half-second loop over a region with nothing
                  in it, saying an optimizer was working before anyone had asked it to. It
                  was survivable while that region was an empty state. Over a map the planner
                  is clicking and a slider they are dragging, a breathing green overlay is
                  the loudest thing on the screen and it is reporting activity that is not
                  happening. */}
              <Box
                aria-hidden="true"
                className={classNames(
                  classes.aiGlow,
                  hasRun && reveal.isWorking && classes.aiGlowWorking,
                )}
              />

              {/**
               * ---------- one pane layout, from open to applied ----------
               *
               * **The map is continuous now, and that reverses the twenty-first pass.** That
               * pass took the map away while the optimizer composed, on the argument that *a
               * map that is already there cannot arrive* — so the moment the route appeared on
               * it had no weight. The argument was sound and its premise no longer holds: the
               * map is a *control* before the press, not a preview of the answer. The planner
               * sets the start point by clicking it and drags the radius against the ring
               * drawn on it, which is the feedback loop the whole radius field exists for. A
               * surface you have been working in for thirty seconds cannot be revealed to you.
               *
               * So the geometry is fixed from the first frame — same panes, same widths, same
               * map in the same rectangle — and only the *left* pane changes contents:
               * coverage before the press, the narration during, the routes after. Nothing
               * jumps at the moment of the press, which is what the press being the seam
               * always wanted and the moving layout kept undercutting.
               *
               * What the reveal keeps is the thing it was actually for: the route **drawing
               * itself** across a map the planner already understands, pin by pin, on the same
               * clock the rows arrive on. That was always the stronger half of the
               * choreography — the map's mere appearance was the weaker one.
               */}
              <Box className={classes.aiPanes}>
                {/* **Two boxes, and the nesting is load-bearing.** These classes were
                    composed onto one element and `columnBody`'s `flex: 1` silently beat
                    `routesPane`'s `flex: 0 1 40%` — same specificity, later in the sheet
                    wins — so the pane rendered at 51% of the region instead of 40% and the
                    map lost 130px it was never asked to give up. Reordering the sheet would
                    have fixed it and left a layout that depends on declaration order, which
                    is the trap this codebase has paid for more than once. The outer box owns
                    the width, the inner one owns the padding and the scroll, and neither has
                    an opinion about the other's flex. */}
                <Box className={classes.routesPane}>
                  {/**
                   * The column's own heading, **and it is inside this pane now rather than
                   * across the region.**
                   *
                   * It used to be a child of `aiRegion`, which made it 1143px wide — the full
                   * region — with its icon and title at the far left. Nothing was drawn over
                   * the map, so nothing looked wrong in the tree; what it actually produced was
                   * **a 44px band of empty white directly above the map**, and no value of
                   * `mapPane`'s padding could reach it. Three passes tried: 16 all round, then
                   * the full header/footer compensation, then half of it. All three were tuning
                   * a 16px inset while a 44px band sat above it, so the map measured centred
                   * and read high every time. Above the map was 44 + 16; below it was 16.
                   *
                   * Titling the pane it describes fixes the arithmetic by deleting it — the map
                   * pane now starts at the region's top and its 16px inset is the whole of the
                   * space above it, matching the 16 below. It is also where the heading belongs:
                   * it names the route list, the supplied design draws it over the route cards,
                   * and a heading stretched across a map it does not describe is what let a day
                   * list get added here once and read as a label on the map.
                   */}
                  <Box className={classes.columnHeader}>
                    <RouteOutlinedIcon className={classes.columnIcon} />
                    <Typography className={classes.columnTitle}>{tt('columnAi')}</Typography>
                  </Box>

                  {!hasRun ? (
                    /**
                     * Before the press: **the empty state, and what the radius currently covers.**
                     *
                     * Two things at once, because at this moment the planner needs both. The
                     * instruction, because a screen holding a map, six fields and no result does
                     * not say which order to use them in — and the press is the seam this whole
                     * layout is built around, so the one state that precedes it had better name
                     * it. The count, because the radius they are setting has no other visible
                     * consequence on this side of the screen: the ring is on the map, but *how
                     * many visits it reaches* is a number, and numbers belong in a column.
                     *
                     * `coversCount` is the **live** triage rather than a plan's — there is no
                     * plan. It moves on every press of the stepper, which is the point of
                     * putting it here.
                     */
                    <Box className={classes.emptyState}>
                      <MapPinOutlineIcon className={classes.emptyStateIcon} aria-hidden="true" />
                      <Typography className={classes.emptyStateTitle}>
                        {tt('previewTitle')}
                      </Typography>
                      <Typography className={classes.emptyStateText}>
                        {tt('previewText')}
                      </Typography>

                      {/* Only where there is something to count. On an empty week the figure
                          would read `0 / 0` under an instruction about a radius, which is a
                          scoreboard for a set that does not exist. */}
                      {activeVisits.length ? (
                        <Box className={classes.emptyStateCoverage}>
                          <Typography className={classes.emptyStateFigure}>
                            {tt('previewCoverageFigure', {
                              covers: coversCount,
                              total: activeVisits.length,
                            })}
                          </Typography>
                          <Typography className={classes.emptyStateCoverageLabel}>
                            {tt('previewCoverageLabel', { mi: radiusMiles })}
                          </Typography>
                        </Box>
                      ) : null}
                    </Box>
                  ) : reveal.isComposing ? (
                    /**
                     * While it works: the narration, in the pane its answer will fill.
                     *
                     * **Back in the routes pane, where the nineteenth pass put it and the
                     * twenty-first pass took it from.** It moved to the centre of the whole
                     * region because the map was being withheld and there were no panes to
                     * divide; with the map continuous there are, and the orb standing where the
                     * routes will stand is the arrangement that reads as *this region is
                     * thinking, and then it filled*. The map beside it illustrates each line on
                     * the same `mapStep` clock, which is what keeps the two in step — physical
                     * adjacency never was.
                     */
                    <Box className={classes.columnBody}>
                      <ThinkingStage
                        line={facts.lines[reveal.lineIndex] || ''}
                        lineIndex={reveal.lineIndex}
                        lineCount={facts.lines.length}
                        holdMs={LINE_MS}
                        onCancel={cancel}
                      />
                    </Box>
                  ) : (
                    <Box className={classes.columnBody}>
                      <RoutesColumn
                        run={run}
                        startAddress={startAddress}
                        startPending={startPending}
                        travelMinutes={travelMinutes}
                        directionsState={directions.state}
                        revealStops={reveal.stopsRevealed}
                        highlightedSiteId={highlightedSiteId}
                        onHighlight={setHighlightedSiteId}
                      />
                    </Box>
                  )}
                </Box>

                <Box className={classes.mapPane}>
                  <MapColumn
                    run={run}
                    mapsReady={mapsReady}
                    startPoint={startPoint}
                    path={directions.path}
                    pending={directions.isLoading}
                    mapStep={mapStep}
                    ready={reveal.isReady}
                    /* Before the press the map is the control: the ring is drawn, the pins
                       outside it are grey, and a click on the ground moves the origin. After
                       it, the ring comes off and the map is the selected route's view — see
                       `MapColumn`, which owns that switch. */
                    planning={!hasRun}
                    radiusKm={radiusKm}
                    onPickStart={startPoint.setAddress}
                    highlightedSiteId={highlightedSiteId}
                    onHighlight={setHighlightedSiteId}
                  />
                </Box>
              </Box>

              {/**
               * **The action bar is always here, and the primary button never moves.**
               *
               * It used to arrive with the plan, and the Harmonize press lived at the foot of the
               * setup column — which meant the one control the planner was reaching for jumped
               * from the bottom-left of the screen to the bottom-right at the exact moment they
               * used it, while the bar sliding in pushed the whole body up. Two changes of
               * position in one beat, both caused by the press, and the second one put the *next*
               * action somewhere the eye had no reason to be.
               *
               * So there is one action slot for the whole screen, bottom right, holding whatever
               * the next step is: **Harmonize** before there is a plan, **Create Route · Mon 24
               * Aug** after. The figures and the write sentence still appear only once there is
               * something to report, so the pre-press bar is the button and, if the run cannot
               * go, the reason — but the frame does not move and the button does not travel.
               */}
              {/**
               * **Always rendered, where it used to arrive with the plan.**
               *
               * Two reasons, and the second is the one that shows. A footer that appears on
               * the press moves the whole body up at the exact moment the planner is reading
               * the region's new contents — and it left the map bracketed by a header above
               * and nothing below, so the space over the map read as larger than the space
               * under it and the panel looked to have slipped downward in its own region.
               * Present from the first frame, the map sits between two bands of equal
               * weight and its 16px inset is symmetric in fact as well as in the sheet.
               *
               * Pre-press the bar is the disabled write button and nothing else: the figures
               * are gated on `hasPlan`, the stale note on `isStale`, the re-order caveat on
               * a count. An empty bar with one greyed control in it is the honest state —
               * this is where the plan will be committed, and there is no plan.
               */}
              <Box className={classes.aiFooter}>
                {/* Two registers, doing two different jobs. The **figures** are the
                scoreboard — what the plan amounts to, read in a glance and comparable
                between runs. The **sentence** under them is what pressing Apply will
                actually write: how many routes get created, how many visits join
                somebody's existing route by name, and whether anyone's day gets
                re-ordered in the process. A consequence that only appears in a toast
                after the fact is a consequence nobody consented to. */}
                <Box className={classes.barText}>
                  {/* **Figures only when there are figures.** With no plan these read `0
                  routes · 0 visits scheduled`, and a bold 0 is not a neutral count — it is
                  the scoreboard confidently reporting a result, at the largest type size
                  in the bar, beside the sentence explaining that nothing could be
                  computed. */}
                  {hasPlan && !reveal.isComposing ? (
                    <Box className={classes.facts}>
                      <Box className={classes.fact}>
                        <Typography className={classes.figure}>{routeCount}</Typography>
                        <Typography className={classes.factLabel}>
                          {tt('footerRoutes', { count: routeCount, route: term.toLowerCase() })}
                        </Typography>
                      </Box>
                      <Box className={classes.factDivider} />
                      <Box className={classes.fact}>
                        <Typography className={classes.figure}>{placedVisitCount}</Typography>
                        <Typography className={classes.factLabel}>{tt('footerPlaced')}</Typography>
                      </Box>
                      {/* One figure for everything left out, whatever the cause, because the
                      scoreboard's job is the size of the gap and not its composition —
                      the routes column breaks it into groups and offers the remedy for
                      each. */}
                      {notInPlanCount ? (
                        <>
                          <Box className={classes.factDivider} />
                          <Box className={classes.fact}>
                            <Typography className={classNames(classes.figure, classes.figureWarn)}>
                              {notInPlanCount}
                            </Typography>
                            <Typography className={classes.factLabel}>
                              {tt('footerNotIncluded')}
                            </Typography>
                          </Box>
                        </>
                      ) : null}
                      {/* Not the same fact as "left over". These were taken out on purpose — a
                      stop removed, or a whole spill route declined — and without a figure
                      for them the count of visits simply went down with nothing saying
                      why. */}
                      {keptCount ? (
                        <>
                          <Box className={classes.factDivider} />
                          <Box className={classes.fact}>
                            <Typography className={classes.figure}>{keptCount}</Typography>
                            <Typography className={classes.factLabel}>
                              {tt('footerKept')}
                            </Typography>
                          </Box>
                        </>
                      ) : null}
                    </Box>
                  ) : null}

                  {/* **Said here, not on the left.** The button that fixes it is in the setup
                  column, but the thing that has gone out of date is this plan — and a planner
                  reading a route needs to know it answers a question they have since changed.
                  Above the write sentence, because it qualifies it: what Apply would write is
                  the *old* answer until the optimizer runs again. */}
                  {isStale && !reveal.isComposing ? (
                    <Typography className={classes.caveatLine}>{tt('staleNote')}</Typography>
                  ) : null}

                  {/**
                   * **The write sentence — *Apply creates 1 new route.* — is gone.**
                   *
                   * It existed so the consequence of Apply was stated before the press
                   * rather than in a toast afterwards, which is a good rule and this was
                   * the wrong instance of it: the button 40px to its right already reads
                   * `Create Route · Mon 24 Aug`, and the figures directly above it already
                   * read `1 route · 6 visits scheduled`. Three statements of one fact, in
                   * one bar, at three type sizes.
                   *
                   * What it said that they do not is the *merge* case — joining somebody's
                   * existing route by name. That is disclosed where it is legible: the
                   * route card titles itself with the route being joined, and its stop list
                   * marks our rows `New` and reports how many of theirs moved. Nothing
                   * about a merge is now announced only in a toast.
                   */}
                  {/* Re-solving a route the planner never picked rewrites somebody's day.
                  Amber, because it is a warning rather than a description. */}
                  {reorderedCount ? (
                    <Typography className={classes.caveatLine}>
                      {tt('footerReorderedPlain', {
                        count: reorderedCount,
                        route: term.toLowerCase(),
                      })}
                    </Typography>
                  ) : null}

                  {/**
                   * **`runBlock` is not drawn here, and now that this bar is always on screen
                   * that is a decision rather than dead code.**
                   *
                   * It was rendered in this bar and it could never fire: `runBlock` is
                   * `hasRun ? null : diagnosis` and the bar only existed once `hasRun`. With
                   * the bar permanent the branch would come alive — and print the setup
                   * column's own refusal a second time, at the opposite corner of the screen.
                   * A refusal belongs beside the control that is refusing, which for every
                   * pre-press cause is Harmonize.
                   *
                   * `applyBlock` is gated on `hasRun` for the same reason: before a press it
                   * resolves to the identical `diagnosis`, so ungated it would be the same
                   * duplication by another name. Once there is a plan it says things the setup
                   * column cannot — an unnamed route, most of all — and that is when it draws.
                   */}
                  {hasRun && applyBlock ? (
                    <Typography className={classes.blockLine}>
                      <Box component="span" className={classes.blockIcon} aria-hidden="true">
                        ⚠
                      </Box>
                      {applyBlock.text}
                    </Typography>
                  ) : null}
                </Box>

                <Box className={classes.actions}>
                  {/* One action, and it is the write. The Harmonize press briefly lived here too,
                      as the same slot renaming itself — which is the arrangement the two-footer
                      layout replaces: that button belongs to the settings on the left, this one
                      to the plan on the right. */}
                  <Button disableRipple variant="primary" disabled={!canApply} onClick={onApply}>
                    {/* While composing, the label must not name the day it is about to land
                    on — the screen has not said which day that is yet, and a disabled
                    button carrying an answer the screen has withheld is the answer
                    leaking out of the one control that cannot be read as provisional.
                    `hasPlan` before the day because `applyCreate` interpolates it: with no
                    routes it rendered `Apply →` with a dangling arrow pointing at
                    nothing, and an arrow is a promise about a destination. Named `Create`
                    now rather than `Apply`, because that is the write it performs — a new
                    route, dated. */}
                    {reveal.isComposing
                      ? tt('applyWaiting')
                      : applying
                        ? tt('applying')
                        : !hasPlan
                          ? tt('applyPlain')
                          : routeCount > 1
                            ? tt('applyCreateRoutes', { count: routeCount, route: term })
                            : tt('applyCreate', { route: term, day: dayLabelOf(routes[0]?.day) })}
                  </Button>
                </Box>
              </Box>
            </Box>
          </Box>
        </>
      )}
    </Box>,
    document.body,
  );
};

HarmonizeWorkspace.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  /** Every actionable visit in the week on screen — the optimizer's whole input. */
  weekVisits: PropTypes.array,
  /** The tenant's word for a runsheet. Filter Go says Route. */
  routeTerm: PropTypes.string,
  onApplied: PropTypes.func,
  onPreviewChange: PropTypes.func,
};

HarmonizeWorkspace.defaultProps = {
  weekVisits: [],
};

export default HarmonizeWorkspace;
