import { Box, Button, Typography } from '@mui/material';
import classNames from 'classnames';
import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { prefersReducedMotion } from 'src/app/obx/pages/schedules/components/harmonize/routeMotion';
import ComputingState from 'src/app/obx/pages/schedules/components/harmonizeFlow/components/ComputingState';
import DayPane from 'src/app/obx/pages/schedules/components/harmonizeFlow/components/DayPane';
import ExitPanel from 'src/app/obx/pages/schedules/components/harmonizeFlow/components/ExitPanel';
import SpillTray from 'src/app/obx/pages/schedules/components/harmonizeFlow/components/SpillTray';
import { useStyles as useFlowStyles } from 'src/app/obx/pages/schedules/components/harmonizeFlow/harmonizeFlow.styles';
import { formatCompact } from 'src/app/obx/pages/schedules/components/harmonizeFlow/model/durations';
import { VISITS } from 'src/app/obx/pages/schedules/components/harmonizeFlow/model/fixtures';
import { droppableDatesFor } from 'src/app/obx/pages/schedules/components/harmonizeFlow/model/planner';
import {
  FLOW_STATE,
  holdMsForLine,
  useHarmonizeFlow,
} from 'src/app/obx/pages/schedules/components/harmonizeFlow/useHarmonizeFlow';
import { Clossicon } from 'src/assets/svg';

import DayTabRow from './components/DayTabRow';
import ScopePanel from './components/ScopePanel';
import VisitPickList from './components/VisitPickList';
import ZoneRouteMap from './components/ZoneRouteMap';
import { useStyles } from './harmonizeSplit.styles';
import { announcedDates, zoneRings } from './zoneGeography';

/**
 * Harmonize as **two columns**: the drawer's flow down the left, the territory down the
 * right.
 *
 * ## What this shell varies, and what it deliberately does not
 *
 * It runs `useHarmonizeFlow` — the drawer's hook, unedited — and mounts the drawer's own
 * `ComputingState`, `DayTabs`, `DayPane`, `ExitPanel` and `SpillTray` against the drawer's
 * own class sheet. **The engine, the model and every component inside ③ are the same
 * objects, not copies.** That is what makes Drawer↔Split a clean question: whatever a
 * reviewer prefers between them is a fact about the *shell*, because nothing else differs.
 * A second copy of the route card would have made it a question about two route cards.
 *
 * What is new is the frame and one component:
 *
 * - **Scope never leaves.** The drawer replaces ① with ③ because it has one pane. A column
 *   twice the height does not have to, and keeping the range on screen turns "widen it and
 *   run again" into an edit rather than a trip backwards. There is consequently no
 *   `Back to scope` control in this shell — there is nowhere to go back to — and the
 *   footer carries only the write.
 * - **The day table is a row of pills.** Same three facts, two ranks, no header row, and
 *   each one aims the map.
 * - **The map**, which is the actual subject of the comparison: the Workspace draws one
 *   radius around one start point because its model has no zones in it, and this model is
 *   nothing but zones. Four territories, every worked day's route inside its own, and the
 *   open day picked out by weight rather than by hiding the others.
 *
 * ## Where the surface came from
 *
 * The overlay, the portal, the Escape handling and the leaving fade are the Workspace's,
 * copied by value. They are not the drawer's because the drawer is a `DetailDrawer` and
 * this is full screen; they are not imported because the Workspace's sheet is a shipped
 * screen's and a comparison shell must not be able to edit it. Each one carries the
 * argument it was written with — see `harmonizeSplit.styles.js` and the notes below.
 */

/**
 * The two exits, and the one overlap that makes Apply feel like a handover.
 *
 * `CLOSE_MS` matches `overlayLeaving`; `COMMIT_MS` matches `overlayCommitting`. Both have to
 * finish before the unmount, or the surface disappears mid-animation.
 *
 * `HANDOVER_AT_MS` is the interesting one: on a commit, the calendar's own apply sequence is
 * started at 300ms of the 460ms exit rather than after it. The overlay is still mounted and
 * still ~30% opaque at that point, so the grid's sweep begins *behind the dissolving
 * surface* and the two read as one movement. Started at the end instead — which is what it
 * used to do — the plan vanished, nothing happened for a beat, and then the grid animated
 * for reasons the eye had already lost track of.
 */
const OVERLAY_CLOSE_MS = 200;
const OVERLAY_COMMIT_MS = 460;
const HANDOVER_AT_MS = 300;

const HarmonizeSplit = ({ open, onClose, onApplied }) => {
  const classes = useStyles();
  const flowClasses = useFlowStyles();
  const { t } = useTranslation();
  const tt = (key, options) => t(`obx.runsheet.harmonizeSplit.${key}`, options);
  /* ③'s own copy still comes out of the drawer's namespace, because ③ *is* the drawer's
     components — a second set of keys for the same sentences is how two surfaces come to
     word the same refusal differently. */
  const tf = (key, options) => t(`obx.runsheet.harmonizeFlow.${key}`, options);

  /** `null` | `'closing'` | `'committing'` — the exit differs by reason, so it is not a boolean. */
  const [leaving, setLeaving] = useState(null);
  const [spillOpen, setSpillOpen] = useState(false);
  /* Which zone the pointer is over, wherever it came from — a day pill, a legend row, a
     forecast row. View state, so it lives here and not in the flow hook, which holds only
     what a planner has *decided*. */
  const [hoveredZoneId, setHoveredZoneId] = useState(null);
  const [highlightedSiteId, setHighlightedSiteId] = useState(null);

  /**
   * Every way out, in one place — and declared above everything that calls it.
   *
   * **That ordering is not stylistic.** A `const` referenced from a line above its own
   * declaration is a temporal-dead-zone `ReferenceError` that lints and builds perfectly
   * cleanly and then blanks the page at runtime; the Workspace has paid for it twice. The
   * flow hook's `onApplied` below closes over this, and so does the Escape handler.
   *
   * Guarded against a second press mid-fade, which would otherwise stack two timers and
   * close twice. `after` runs when the fade has finished, not when it starts — an apply
   * hands the plan to the calendar as this surface goes, so the two read as one handover
   * rather than as a screen closing and something unrelated happening next.
   */
  const requestClose = useCallback(
    (after, { committing = false } = {}) => {
      setLeaving((already) => {
        if (already) return already;

        if (committing) {
          /* The handover fires *during* the exit, not after it — see `HANDOVER_AT_MS`. The
             unmount still waits for the animation, so the grid animates behind a surface
             that is still on its way out. */
          if (after) window.setTimeout(after, HANDOVER_AT_MS);
          window.setTimeout(() => onClose?.(), OVERLAY_COMMIT_MS);
          return 'committing';
        }

        window.setTimeout(() => {
          onClose?.();
          after?.();
        }, OVERLAY_CLOSE_MS);
        return 'closing';
      });
    },
    [onClose],
  );

  const flow = useHarmonizeFlow({
    open,
    /* Close first, then hand over: the calendar's own motion is the answer, and a surface
       still on screen would be covering all of it. */
    onApplied: (plan) => requestClose(() => onApplied?.(plan), { committing: true }),
  });
  const { state, plan, days, workedDays, openDay, drag, dragQuote, actions } = flow;

  /**
   * The zone shapes, read once per opening rather than per render.
   *
   * `zoneRings` reads the saved rule out of storage, and a component that did that on every
   * render would re-derive four rings a frame while somebody drags the map. Keyed on `open`
   * so a boundary drawn in Settings — in the other tab the `Configuration` link opens —
   * lands the next time this surface is opened.
   */
  const zones = useMemo(() => (open ? zoneRings() : []), [open]);

  /**
   * The drawer's class sheet, with two keys swapped.
   *
   * Spread rather than edited: changing `spillTray` in `harmonizeFlow.styles.js` would
   * restyle the drawer, which is the surface this one is being compared against. The two
   * overrides are the only places a 475px drawer and a 460px column in a full-screen
   * surface genuinely disagree — see the note on them in this shell's own sheet.
   */
  const drawerClasses = useMemo(
    () => ({
      ...flowClasses,
      /* **`flowSpillTray` is gone** — the tray is the drawer's floating accordion exactly as
         the drawer draws it, on instruction. The override widened it for this shell's column;
         the drawer's own geometry is what was asked for, so there is nothing to override. */
      routeBody: classNames(flowClasses.routeBody, classes.flowRouteBody),
      /**
       * **The whole tab treatment, replaced rather than composed onto.**
       *
       * It used to be one key — 2px of left padding on top of the drawer's underlined strip.
       * The row is a segmented control in this shell now (see `splitTab*` in the sheet), so
       * every class the tabs wear is overridden here by name: the drawer's own rules are
       * never emitted for this row, which is what stops two equal-specificity sheets from
       * deciding the appearance by injection order.
       *
       * The drawer is untouched. `DayTabRow` is still one component with one set of
       * behaviours; only the classes handed to it differ.
       */
      tabRow: classes.splitTabRow,
      tab: classes.splitTab,
      tabSelected: classes.splitTabSelected,
      tabCount: classes.splitTabCount,
      tabAdd: classes.splitTabAdd,
      tabDropLegal: classes.splitTabDropLegal,
      tabDropRefused: classes.splitTabDropRefused,
      /* `tabRowScrollable`'s right-edge fade and `tabDot`'s amber overrun mark are the
         drawer's own, unchanged: both are about *what the row says*, not about how a tab is
         drawn, and a box tab has the same need for each. */
    }),
    [flowClasses, classes],
  );

  /**
   * ①'s classes: Split's sheet, with the summary box's five rules taken from the drawer.
   *
   * Listed by name rather than spread wholesale — the two sheets share several key names
   * (`hint`, `section`, `sectionHead`) and a blanket spread would silently hand the drawer's
   * version of each to a panel composed against Split's.
   */
  const scopeClasses = useMemo(
    () => ({
      ...classes,
      statRow: flowClasses.statRow,
      stat: flowClasses.stat,
      statValue: flowClasses.statValue,
      statValueWarn: flowClasses.statValueWarn,
      statLabel: flowClasses.statLabel,
      skeletonBar: flowClasses.skeletonBar,
      skeletonStatValue: flowClasses.skeletonStatValue,
      skeletonStatLabel: flowClasses.skeletonStatLabel,
    }),
    [classes, flowClasses],
  );

  /* `legalDaysByVisit` went too — its last reader was `dueOnActiveDay`. X1's `Move day` uses
     `droppableDatesFor(days)` instead, which is the *droppable* set rather than the engine's
     legal one, and that distinction is deliberate; see its call site. */

  /**
   * The day the column is showing — **defaulted, because the tab row now exists early.**
   *
   * `useHarmonizeFlow` sets `openDay` when the proposal arrives and leaves it null until
   * then, which was right when the tabs arrived with the proposal too. They are on screen
   * from the first frame now, so before the press there would be a tab row with nothing
   * selected and a route header with no day to describe. The first worked day is the
   * answer for the same reason the hook picks it later: a tab strip that opens on nothing
   * makes the operator click before they can read anything.
   */
  const activeDay = openDay || workedDays[0]?.date || null;

  const openSheet = plan.runsheets.find((sheet) => sheet.date === activeDay) || null;

  /* `activeDayRecord` and `dueOnActiveDay` are **gone with `RoutePreview`** — both existed
     only to fill its header and caption at ① and ②, and neither state draws a day header any
     more. `legalDaysByVisit` went with them; see above. */

  /* `previewClasses` — the whitelist that fed `RoutePreview` — is gone with it. Worth
     remembering it existed: it was a *whitelist*, not a spread, so a sheet rule not listed in
     it reached the component as `undefined` and rendered unstyled without failing. That trap
     bit twice. Nothing in this shell has that shape any more. */

  /* The stop the shift expires during — derived, so the sentence naming it stays true when
     the sequence changes rather than pointing at a fixed index. */
  const tippingStop = openSheet?.overrunMins
    ? openSheet.stops.find((stop) => stop.departMins > openSheet.shiftMins)
    : null;

  /* The visit in flight, wherever it came from — a stop on a day, or a card in either
     tray. The spill list has to be searched too, or ④ draws nothing for the commonest
     drag this feature has. */
  const dragVisit = useMemo(() => {
    if (!drag?.visitId) return null;
    const placed = plan.runsheets
      .flatMap((sheet) => sheet.stops)
      .find((stop) => stop.visit.id === drag.visitId);
    return (
      placed ||
      plan.spilled.find((item) => item.visit.id === drag.visitId) ||
      plan.unplaced.find((item) => item.visit.id === drag.visitId) ||
      null
    );
  }, [drag, plan]);

  const isProposal = state === FLOW_STATE.PROPOSAL;
  const isComputing = state === FLOW_STATE.COMPUTING;
  /* Named rather than derived at the call site as `!isProposal && !isComputing`: the column
     now shows three genuinely different things in this region — a list, an orb, a route — and
     a negated pair reads as "the leftovers" rather than as the first act. */
  const isScope = state === FLOW_STATE.SCOPE;

  /**
   * The recompute acknowledgement — what `Harmonize again` turned into.
   *
   * `plan` is derived, so any Config-B edit at ③ rewrites the answer on the next render
   * with nothing on screen saying it happened: the tab row gains a day, the primary button
   * changes its count, and a planner watching the route they were reading has no signal
   * that the machine has been back. This is that signal.
   *
   * **Keyed on a signature of the config, not on `plan`.** `plan` is a fresh object whenever
   * its inputs change identity, which includes changes that alter nothing a planner did —
   * and a pulse that fires without a cause is worse than no pulse. The signature is the
   * fields a planner can actually edit, so it moves when and only when they move something.
   *
   * **The first value is recorded rather than pulsed on.** Arriving at ③ is not a recompute;
   * the wash is already coming down from ② at that moment, and pulsing on top of it would
   * fight its own transition. So the ref is seeded on the transition into ③ and only
   * *subsequent* changes pulse.
   *
   * 650ms — long enough to see against the 700ms fade it rides on, short enough that a
   * planner dragging the range across several days gets one continuous warmth rather than a
   * strobe, since each change restarts the same timer.
   */
  const [recomputing, setRecomputing] = useState(false);
  const configSignature = useMemo(
    () =>
      [
        flow.range.from,
        flow.range.to,
        days
          .map((day) => `${day.date}:${day.worked ? 1 : 0}:${day.zoneId || ''}:${day.shiftMins}`)
          .join(','),
      ].join('|'),
    /* `flow.range`, not a bare `range` — this component destructures `state`, `plan`,
       `days`, `workedDays`, `openDay`, `drag`, `dragQuote` and `actions` off the hook and
       deliberately not the range, which only `ScopePanel` and the top bar read. Writing
       `range` here cost a blank screen: eslint passed it and `vite build` passed it, and it
       threw `ReferenceError: range is not defined` on first render. */
    [flow.range.from, flow.range.to, days],
  );
  const lastSignature = useRef(null);

  useEffect(() => {
    if (!isProposal) {
      /* Cleared on the way out so re-entering ③ seeds fresh rather than comparing against
         a signature from the previous run. */
      lastSignature.current = null;
      setRecomputing(false);
      return undefined;
    }
    if (lastSignature.current === null) {
      lastSignature.current = configSignature;
      return undefined;
    }
    if (lastSignature.current === configSignature) return undefined;

    lastSignature.current = configSignature;
    if (prefersReducedMotion()) return undefined;

    setRecomputing(true);
    const id = window.setTimeout(() => setRecomputing(false), 650);
    return () => window.clearTimeout(id);
  }, [isProposal, configSignature]);
  const startMove = (visitId) => flow.setDrag({ visitId, overDate: null });

  /* Reset on the way in rather than at the end of the fade, so a surface reopened straight
     after closing is not still wearing the leaving class. */
  useEffect(() => {
    if (open) {
      setLeaving(null);
      setSpillOpen(false);
      setHighlightedSiteId(null);
    }
  }, [open]);

  /**
   * Escape leaves, and the page behind does not scroll.
   *
   * The two conventions a full-viewport mode owes its reader, neither of which a plain
   * `position: fixed` box gets for free. Nothing is written until Apply, so leaving by
   * mistake costs the planner their edits and nothing else — which is why Escape closes
   * outright rather than asking.
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

  /**
   * Which days the map is allowed to draw a route for, at this moment.
   *
   * **The zones are not gated and the routes are**, which reverses the first pass and is
   * the distinction that makes ② read: a *territory* is context, present from the first
   * frame and the frame everything else is judged against, so hiding it and bringing it
   * back is a shape flickering rather than an answer arriving. A *route* is the answer, and
   * an answer already on screen before it is announced is the reveal leaking.
   *
   * `null` means "no gate" — every route draws — and that is both the pre-press state
   * (there are no routes) and the proposal (they have all been announced).
   */
  const announcedRouteDates = useMemo(
    () =>
      /* **Nothing at all before the press.** Same cause as `plannedByDate` above and a
         worse symptom: `plan.runsheets` is already solved while ① is on screen, so the map
         drew all three finished routes — the entire answer — before anybody had asked for
         one. The reveal cannot reveal what is already there, and the empty state was
         announcing no routes beside a map covered in them. */
      !isProposal && !isComputing
        ? []
        : isComputing
          ? announcedDates({
              revealLines: flow.revealLines,
              step: flow.step,
              runsheets: plan.runsheets,
              /* The same format the hook interpolates into the sequencing line. If these two
               ever disagree the match fails closed and the route waits for ③. */
              formatDay: (date) => dayjs(date).format('ddd D'),
            })
          : null,
    [isProposal, isComputing, flow.revealLines, flow.step, plan.runsheets],
  );

  /* Which zone a drag is currently over, and what it would say. The zone flashing green or
     red is the fast read of a verdict the decision box states in words — and with one zone
     per day, "wrong zone" is the commonest verdict this feature gives. Saying it as a shape
     on the ground is the single thing the drawer could not do. */
  const dropZoneId = drag?.overDate
    ? plan.runsheets.find((sheet) => sheet.date === drag.overDate)?.zoneId || null
    : null;

  /* Work that landed on no day at all — spilled off a full day, or stranded in a zone
     nobody works. Both are drawn hollow on the map; the tray is where they are acted on. */
  const looseSiteIds = useMemo(
    () => [...plan.spilled, ...plan.unplaced].map((item) => item.site?.id).filter(Boolean),
    [plan.spilled, plan.unplaced],
  );

  if (!open) return null;

  /**
   * Rendered onto `body`, not where it is mounted.
   *
   * This lives in the calendar page's tree because that is where `onApplied` goes, and the
   * calendar page wraps its grid in a container that animates the visit cards during an
   * apply. A `position: fixed` box takes its frame from the nearest ancestor with a
   * transform or a filter rather than from the viewport, so leaving it in place would make
   * a full-screen surface silently depend on styling two components away.
   */
  return createPortal(
    /* `role="dialog"` **without** `aria-modal`, matching the Workspace and for its reason:
       the app's left navigation is deliberately outside this surface and deliberately
       usable, and claiming modality while leaving it interactive would hide a working
       control from exactly the readers who cannot see that it is still there. */
    <Box
      className={classNames(
        classes.overlay,
        leaving === 'committing' && classes.overlayCommitting,
        leaving === 'closing' && classes.overlayLeaving,
      )}
      role="dialog"
      aria-label={tt('title')}
    >
      {/**
       * The header, **rebalanced.**
       *
       * ## What was wrong, measured at 1280px
       *
       * The bar held four children in this order: close button, title, a flex spacer, scope
       * chip. That put a 32px control at x=108, a title ending at x=318, **709px of nothing
       * — 59% of the bar** — and then a 12px line of grey text pinned to the right edge. Two
       * small islands at the extremes with a void between them, which is precisely the
       * "unbalanced" reading. Three separate faults, and they compound:
       *
       * 1. **The close button led the bar.** Every drawer in this product closes from the
       *    top *right* — the shared `DetailDrawer`'s own `titleRow` is `space-between` with
       *    the title first and the close last — and the design record already states this
       *    control "moved to the top-right, matching every other drawer in the app". A
       *    leading X reads as a back arrow or a toolbar button, and it parked the bar's only
       *    control in the one corner where nothing else lived.
       * 2. **The chip sat 737px from the title it qualifies**, so it read as an unrelated
       *    fragment rather than as the subject's own summary. It also *changes meaning* at
       *    ③ — from the scope of the run to its outturn — and a change of meaning is
       *    invisible at that distance and that size.
       * 3. **It was the smallest text in the bar** at 12/400, while being the only summary
       *    of the whole run.
       *
       * ## The fix
       *
       * The title and its summary are **one group on the left**, sharing a baseline; the
       * close button is **alone on the right**. The void does not disappear — it becomes the
       * ordinary breathing room between a block of content and the control that dismisses
       * it, which is the arrangement every dialog in the product already uses and which the
       * eye reads as intentional rather than as a gap.
       *
       * **One line, not two.** A title-over-subtitle stack is the drawer's pattern and would
       * also have worked, but it costs ~17px of header height, and the left column is
       * genuinely height-constrained — with the issues tray open the route body measures
       * 120px. Grouping horizontally buys the same coherence for nothing.
       *
       * Baseline alignment rather than centre: the pair is 20px against 14px, and a shared
       * baseline is what makes two different sizes read as one line of text. The forecast's
       * own `15 visits` pairs do the same, for the same reason.
       */}
      <Box className={classes.topBar}>
        <Box className={classes.titleGroup}>
          {/* `h2`, unchanged. The overlay is `role="dialog"` but deliberately not
              `aria-modal`, so the page's own heading outline is still live underneath —
              promoting this to `h1` would put a second top-level heading on the document. */}
          <Typography component="h2" className={classes.title}>
            {tt('title')}
          </Typography>
          {/**
           * The run's outturn — **and only once there is one.**
           *
           * This used to print at ① too, as `15 visits · Sat 15 Aug – Fri 21 Aug`, on the
           * argument that every count in either column is a count of *this* and without it
           * they have no denominator. The argument was sound when it was written and ① has
           * since grown the parts that answer it: the range is in a field 60px below this
           * line, and the count is the first figure in the forecast box under that. Both of
           * the chip's facts were being restated, in full, within about 120 pixels — which is
           * the single clearest piece of duplication on the surface and reads as clutter
           * before it reads as a summary.
           *
           * At ③ it is not a summary of anything above it. `20h 17m of 24h · 12 of 15 visits
           * placed` is the **answer** — what the engine actually did with the question ① asked
           * — and nothing else on screen states it, so it earns the top bar outright. The
           * denominator argument survives there too: it is the one place the whole run's
           * totals appear while the column below is discussing a single day.
           *
           * So the title stands alone at ①. That is not a regression to the void this bar was
           * rearranged to fix — a lone title left, a lone close button right, is what every
           * dialog in this product does; the void was only a problem when a *third* element
           * sat between them.
           */}
          {isProposal ? (
            <Typography className={classes.scopeChip}>
              {tt('scopeChipPlan', {
                work: formatCompact(plan.totals.placedMins),
                available: formatCompact(plan.totals.availableMins),
                placed: plan.totals.placedCount,
                total: plan.totals.visitCount,
              })}
            </Typography>
          ) : null}
        </Box>

        <Box className={classes.grow} />

        <Box
          component="button"
          type="button"
          className={classes.closeButton}
          onClick={() => requestClose()}
          aria-label={tt('close')}
        >
          <Clossicon />
        </Box>
      </Box>

      <Box className={classes.body}>
        {/* ── The flow column ──────────────────────────────────────────────────── */}
        {/* `data-column` is what `overlayCommitting` selects on to stagger the two
            columns out — an attribute rather than a JSS rule reference, for the reason
            given on that rule. */}
        <Box className={classes.flowColumn} data-column="flow">
          {/* ②'s wash, at the **column** and not inside the state that owns it.
              Four layers, back to front: the colour, the grain inside it, then the white
              that occludes the middle so the orb has a ground to stand on.

              They live out here for the reason the drawer discovered the hard way: the
              aurora is anchored above its own top edge and falls inward from it, so drawn
              from inside a scrolling body it is clipped flat at that body's top and the
              glow ends in a hard horizontal line. The column is what has to clip it.
              Mounted only while ② is on screen — it is decoration with two running
              animations and it has nothing to say over a proposal. */}
          {isComputing ? (
            <>
              <Box
                className={classNames(flowClasses.washLayer, flowClasses.auroraTop)}
                aria-hidden="true"
              />
              <Box
                className={classNames(flowClasses.washLayer, flowClasses.auroraSides)}
                aria-hidden="true"
              />
              <Box
                className={classNames(flowClasses.washLayer, flowClasses.grain)}
                aria-hidden="true"
              />
              <Box
                className={classNames(flowClasses.washLayer, flowClasses.eclipse)}
                aria-hidden="true"
              />
            </>
          ) : null}

          <ScopePanel
            /**
             * Split's sheet, with the **drawer's** stat row spliced in.
             *
             * *"It should be the same component as in the side drawer"* — so rather than a
             * copy of the drawer's five rules kept in step by hand, the drawer's own keys are
             * handed straight through. `scopeBox` (the grey container) and `rangeRow` stay
             * Split's, because the drawer has no equivalent of either.
             */
            classes={scopeClasses}
            range={flow.range}
            forecast={flow.forecast}
            onRangeChange={actions.setRangeDates}
            quiet={isProposal}
          />

          <Box
            className={classes.planRegion}
            /**
             * The wash's level, as one number.
             *
             * The colour belongs to the *region*, not to any one child — ② happens in the
             * body, but the tab band above it and the tray and footer below it are all part
             * of what the engine produced — so it is set here and read by `planRegion`'s
             * own `::before`. Three states, and the ternary is the whole of the rule:
             *
             *   ① nothing has run  → **0**, an empty region has nothing to claim
             *   ② thinking         → **1**, the column warms while the engine works
             *   ③ answered         → **0.3**, cooled but still the machine's half
             *   ③ just recomputed  → **1**, briefly — see `recomputing`
             *
             * The recompute pulse borrows ②'s own level rather than inventing a third, which
             * is the point of it: *the machine has just been back here* is the same statement
             * ② makes, only over in a moment instead of over six seconds.
             *
             * See `planRegion` in the sheet for why this is a custom property rather than
             * modifier classes; the short version is that the class version measurably did
             * not apply and this does.
             */
            style={{ '--plan-wash': isComputing || recomputing ? 1 : isProposal ? 0.3 : 0 }}
          >
            {/**
             * **The tabs arrive with the proposal — and that reverses the reason this row was
             * built early.**
             *
             * It used to be on screen from the first frame, on the argument that a planner
             * could pick a day, watch the route header fill with that day's zone and shift and
             * the map focus its territory, all before anything was sequenced — so pressing
             * Harmonize changed a layout's contents rather than conjuring one, and drift across
             * the press measured 0px.
             *
             * Reversed on instruction: ① is the visit list now, and *"once the user confirms
             * those, start the harmonization, and then the tabs will appear for the day tabs."*
             * The argument for the early row was about a smooth transition; what it cost was a
             * screen that offered three solved days to choose between before it had asked which
             * work was in the run. A day index over an empty answer is chrome.
             *
             * The map keeps following `activeDay` regardless — `workedDays` supplies the day →
             * zone pairing whether or not a plan exists, so the territory a day works is drawn
             * from the first frame even though there is no tab to press yet.
             */}
            {isProposal && workedDays.length ? (
              <Box className={classes.planTabBand}>
                <DayTabRow
                  classes={drawerClasses}
                  days={workedDays}
                  runsheets={plan.runsheets}
                  planned={isProposal}
                  openDay={activeDay}
                  onOpenDay={flow.setOpenDay}
                  onHoverZone={setHoveredZoneId}
                  accepted={flow.accepted}
                  drag={drag}
                  quotesForDrag={flow.quotesForDrag}
                  onDropOn={actions.commitDrag}
                  onDragOverDay={(date) =>
                    flow.setDrag((current) => (current ? { ...current, overDate: date } : current))
                  }
                  onAddRoute={actions.addRoute}
                  /* **No `+` tab here**, on instruction. `actions.addRoute` stays wired and is
                     still reachable from the drawer's own row, so this is a shell difference
                     rather than a lost capability. */
                  showAdd={false}
                />
              </Box>
            ) : null}

            <Box
              className={classes.planBody}
              {...(isProposal
                ? {
                    role: 'tabpanel',
                    id: 'harmonize-panel',
                    'aria-labelledby': `harmonize-tab-${activeDay}`,
                  }
                : {})}
            >
              {/**
               * ① — the work, one row per visit, with a box you can clear.
               *
               * This is the screen now: the planner says what the run is about, and the footer's
               * `Harmonize` is the confirmation. See `VisitPickList` for why it wears the
               * route's own row and what that costs.
               */}
              {isScope ? (
                <VisitPickList
                  classes={classes}
                  flowClasses={flowClasses}
                  visits={VISITS}
                  excluded={flow.excluded}
                  onToggle={actions.toggleVisit}
                />
              ) : null}

              {/**
               * ② — **the orb and the narration, and nothing about a day.**
               *
               * It used to run inside `RoutePreview`, so while the engine worked the column
               * showed `Route for Mon 17 Aug`, a zone, `4h shift` and a due count above the
               * spinner. Removed on instruction: *"when the AI is loading do not show anything
               * of the days."* And it was making a claim it had no right to — Monday was only
               * the *first worked day*, not an answer, so the header named a route the engine
               * had not chosen yet and might not produce.
               *
               * `RoutePreview` is now unreferenced from this shell. Left on disk rather than
               * deleted: it records the header's slot geometry, and ③'s header is `DayPane`'s.
               */}
              {isComputing ? (
                <Box className={classes.computingSlot}>
                  <ComputingState
                    classes={drawerClasses}
                    line={flow.revealLines[Math.min(flow.step, flow.revealLines.length - 1)]}
                    lineIndex={Math.min(flow.step, flow.revealLines.length - 1)}
                    lineCount={flow.revealLines.length}
                    holdMs={holdMsForLine(
                      flow.revealLines[Math.min(flow.step, flow.revealLines.length - 1)],
                    )}
                  />
                </Box>
              ) : null}

              {isProposal && openSheet ? (
                <DayPane
                  classes={drawerClasses}
                  sheet={openSheet}
                  forced={flow.forced}
                  name={flow.routeNames[openSheet.date] || ''}
                  onNameChange={(value) => actions.setRouteName(openSheet.date, value)}
                  /* Installers and hand-added routes. `DayPane` requires all four and the
                     hook has exposed them for a while; the drawer's shell has not caught
                     up, so its installer control and its delete both currently call
                     `undefined`. `isCustom` is read off the day rather than the runsheet
                     because `buildRunsheet` does not copy the flag — see `addRoute`, which
                     is the only thing that sets it. */
                  installerId={flow.installers[openSheet.date] || ''}
                  onAssignInstaller={(id) => actions.setInstaller(openSheet.date, id)}
                  isCustom={Boolean(days.find((day) => day.date === openSheet.date)?.custom)}
                  onRemoveRoute={() => actions.removeRoute(openSheet.date)}
                  draggingId={drag?.visitId}
                  onDragStart={startMove}
                  onDragEnd={() => flow.setDrag(null)}
                  onStartMove={startMove}
                  /* The move menu's destinations and pricing — `DayPane` defaults these to
                     empty, which would open a menu saying there is nowhere to go. Split
                     mounts the drawer's ③ unchanged, so it has to pass whatever the drawer
                     passes or the shared component degrades in only one of the two shells. */
                  workedDays={workedDays}
                  onQuoteMove={actions.quoteMove}
                  onMoveTo={actions.moveVisitTo}
                  isTipping={(stop) => stop.visit.id === tippingStop?.visit.id}
                />
              ) : null}

              {isProposal ? (
                <ExitPanel
                  classes={drawerClasses}
                  sheet={openSheet}
                  accepted={flow.accepted}
                  raisedFrom={flow.raisedFrom}
                  tippingStop={tippingStop}
                  /* The *droppable* set, not the engine's legal set — X1's `Move day` asks
                     where a hand may put this, and dropping is unrestricted now. The
                     `legalDaysByVisit` map above stays for `dueOnActiveDay`, which genuinely
                     wants the engine's own choices. */
                  tippingLegalDays={tippingStop ? droppableDatesFor(days) : []}
                  tippingWasForced={Boolean(
                    tippingStop && flow.forced.includes(tippingStop.visit.id),
                  )}
                  drag={drag}
                  dragVisit={dragVisit}
                  onAccept={actions.acceptOverrun}
                  onUnaccept={actions.unacceptOverrun}
                  onRaise={actions.raiseHours}
                  onRestoreHours={actions.restoreHours}
                  onSetAside={actions.setAsideVisit}
                  onReturnToTray={actions.returnToTray}
                  onStartMove={startMove}
                />
              ) : null}
            </Box>

            {/* **`Reasoning` is gone**, on instruction — the disclosure, its `planTrail` band
                and the `reasoningOpen` state with it. It printed ②'s narration back as a
                footnote under the answer. What that costs: the trail was the only place the
                engine's account of its working survived after ② finished, so a planner who
                missed the narration has no way back to it. Accepted. */}

            {/* **Between the body and the footer, and that ordering is the design.** The
                drag travels upward — out of the tray, past the route it is about to join,
                on to the day tab that accepts it — so the tray has to be below the route
                and the tabs above it, and all three have to stay on screen while the
                pointer crosses them. A tray inside the scrolling body would scroll away
                from its own drop targets. */}
            {isProposal ? (
              <SpillTray
                classes={drawerClasses}
                spilled={plan.spilled}
                unplaced={plan.unplaced}
                open={spillOpen}
                draggingId={drag?.visitId}
                onToggle={() => setSpillOpen((previous) => !previous)}
                onDragStart={startMove}
                onDragEnd={() => flow.setDrag(null)}
                onRestore={actions.restoreVisit}
              />
            ) : null}

            {/**
             * ---------- one action slot, bottom right ----------
             *
             * **Harmonize moved here from the middle of the column, and that reverses two
             * earlier passes.** It was a right-aligned button in a bordered band under the
             * figures, then a full-width slab in the same place. Both were attempts to fix
             * the balance of a control that was in the wrong *region*: the panel is one
             * column read top to bottom, and putting a primary action a third of the way
             * down it cuts the question away from the answer and puts a second green
             * button on a screen that already has one at the bottom.
             *
             * Bottom-right is where this product puts a primary action — every drawer and
             * dialog in it, including this feature's own — and one column has one footer.
             *
             * **The earlier objection does not apply here.** The Workspace argues against a
             * single bar holding "whichever action is next", because *its* actions belong
             * to two columns sitting side by side, so one bar would put the left column's
             * button under the right column's contents. This shell is a single column: its
             * footer is that column's footer, and the drawer — the same shape — does
             * exactly this.
             *
             * **`Harmonize again` is gone, and it was redundant rather than misplaced.**
             * It sat on the left, where this codebase puts a step-backward control, and it
             * called `actions.run` — which replays ② and lands on the same answer, because
             * `useHarmonizeFlow` derives `plan` with a `useMemo` over the config. Nothing
             * about pressing it recomputes anything that has not already recomputed.
             *
             * Measured live rather than reasoned about: pressing the `+` tab at ③ took the
             * primary button from `Apply 3 routes` to `Apply 4 routes` and grew the tab row
             * from three days to four, instantly, with `Harmonize again` never touched. A
             * range change does the same by the same path — `setRangeDates` rebuilds `days`,
             * `days` is a dependency of `rawPlan`. That is the architecture working as its
             * own note says it should: *"a configuration change is the one thing D5 lets
             * re-run the engine. Because the plan is derived, that happens by itself."*
             *
             * So the button's only real effect was six seconds of narration over an answer
             * that was already current — and its presence implied the opposite of the truth,
             * that the answer on screen was stale until you asked again.
             *
             * **What replaces it is an acknowledgement, not a control.** Removing the button
             * exposes the one genuine problem underneath it: the answer changes *silently*
             * when a planner edits the range. So a config edit at ③ now pulses the region's
             * wash — warm, then back down to its settled level — which says *recomputed* in
             * the language item ② already established on this surface, costs no control and
             * no six seconds, and cannot be mistaken for something needing a decision. See
             * `recomputing` above.
             */}
            <Box className={classes.footerBand}>
              <Box className={classes.footer}>
                {isComputing ? (
                  <Button disableRipple variant="secondaryGrey" onClick={actions.cancel}>
                    {tf('stop')}
                  </Button>
                ) : (
                  <>
                    {/* Cancel only while there is nothing to lose by pressing it. Once a
                        plan is up the top bar's close is the way out, and a `Cancel` beside
                        `Apply` reads as *cancel the apply* rather than *close the screen*. */}
                    {isProposal ? null : (
                      <Button disableRipple variant="secondaryGrey" onClick={() => requestClose()}>
                        {tf('cancel')}
                      </Button>
                    )}
                    <Button
                      disableRipple
                      variant="primary"
                      /* Closed with no worked day to run onto **or nothing ticked** — the second is new
                         with the pick list, and `VisitPickList`'s own hint under the list is what
                         explains it, since a disabled button explains nothing. */
                      disabled={
                        isProposal
                          ? !plan.runsheets.length
                          : !workedDays.length || !flow.scopeVisits.length
                      }
                      onClick={isProposal ? actions.apply : actions.run}
                    >
                      {/* **`route`, not `runsheet`.** The drawer's own key interpolates
                          `count.runsheet` — the domain's internal word — and this shell
                          says what the tenant's product says: the calendar behind it
                          labels these Route, and the card above says `Route for Mon 17
                          Aug`. */}
                      {isProposal
                        ? tt('applyRoutes', { count: plan.runsheets.length })
                        : tt('harmonize')}
                    </Button>
                  </>
                )}
              </Box>
            </Box>
          </Box>

          {/* ④ announces its pricing and its refusals rather than only colouring them. The
              refusal reason is the most information-dense thing in the flow, and a drag
              that reports itself in hue alone is unusable without sight — on this shell
              doubly so, since the map is now saying the same thing in colour. */}
          <Box className={classes.srOnly} aria-live="polite">
            {drag?.overDate && dragQuote
              ? dragQuote.legal
                ? tf('quoteHere', { delta: formatCompact(Math.abs(dragQuote.target.deltaMins)) })
                : tf(`refuse.${dragQuote.reason}`)
              : ''}
          </Box>
        </Box>

        {/* ── The map column ───────────────────────────────────────────────────── */}
        <Box className={classes.mapColumn} data-column="map">
          <ZoneRouteMap
            zones={zones}
            runsheets={plan.runsheets}
            workedDays={workedDays}
            /**
             * **`activeDay`, not the hook's `openDay`.**
             *
             * `openDay` is null until a proposal arrives, which used to be the right thing to
             * hand a map that only emphasised a day once there was a route in it. The map
             * emphasises the *territory* now — one circle in its own hue, the rest grey — and
             * that emphasis has to follow the tab row, which is on screen and has a day
             * selected from the first frame. Passing `openDay` here left the map with no open
             * zone before the press, so `emphasisFor` fell through to its no-subject case and
             * drew all three circles at full strength: the tabs moved and the map did not.
             *
             * `activeDay` is the same value the route header and the day tabs read, so all
             * three cannot disagree.
             */
            openDay={activeDay}
            onOpenDay={flow.setOpenDay}
            hoveredZoneId={hoveredZoneId}
            highlightedSiteId={highlightedSiteId}
            onHighlight={setHighlightedSiteId}
            /* Before the press there is nothing sequenced to draw, so the map shows the
               work as plain dots in its own territory — which is the true and complete
               picture at that moment, and the thing ① is actually scoping. */
            planned={isProposal || isComputing}
            looseSiteIds={looseSiteIds}
            dropZoneId={dropZoneId}
            dropLegal={Boolean(dragQuote?.legal)}
            dropReason={dragQuote?.reason ? tf(`refuse.${dragQuote.reason}`) : ''}
            announcedRouteDates={announcedRouteDates}
          />
        </Box>
      </Box>
    </Box>,
    document.body,
  );
};

HarmonizeSplit.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  /** Handed the finished plan. The caller animates the calendar with it. */
  onApplied: PropTypes.func,
};

export default HarmonizeSplit;
