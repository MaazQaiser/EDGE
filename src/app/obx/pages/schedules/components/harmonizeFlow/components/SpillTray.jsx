import { Box, Collapse, Typography } from '@mui/material';
import classNames from 'classnames';
import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ThinkingOrb } from 'thinking-orbs';

import { StopPinIcon } from '../../harmonize/components/StopPinIcon';
import { DragHandle, StopFigure, StopRow } from '../../harmonize/components/StopRowParts';
import { STOP_TONES, useStyles as useRouteStyles } from '../../harmonize/harmonize.styles';
import { formatCompact, onSiteMinsFor } from '../model/durations';
import { zoneName } from '../model/fixtures';
import { UNPLACED_REASON } from '../model/reasons';
import { ChevronDown, WarningIcon } from './Glyphs';

/**
 * Everything ③ produced that is not on a runsheet — **one floating accordion, not two.**
 *
 * ## Why this used to be two components, and why it is not any more
 *
 * `SpillTray` (work with a legal day and no hours on it) and `TrayPane` (work with no
 * legal day at all) were built as separate bands stacked one above the other — the
 * argument being that a spilled visit and a stranded one want different remedies, so they
 * should be different objects. That argument is still true of the *rows*: dragging a
 * spilled visit onto a day tab and reading a stranded visit's reason code are not the same
 * gesture, and the two row shapes below keep both intact. It stopped being a reason to
 * draw **two bars**. Shut, both said the same sentence in the same amber — an icon, a
 * count, an hours figure, a chevron — so a planner scanning the drawer saw two identical
 * warnings before reading either one closely enough to see they differed. One shell, one
 * count, one chevron: the content still tells the two kinds of "not placed" apart, once
 * you open it.
 *
 * `spilled` renders first when both are present — a spilled visit has a remedy inside this
 * very drawer (drag it onto a day), a stranded one mostly does not (it sends the planner to
 * Settings), and §14.4's own rule for the commit summary was to order rows by what a
 * planner can still act on before what they cannot. Same rule, same order, here.
 *
 * ## The accordion
 *
 * Shut by default, because the proposal is the answer and this is the exception to it.
 * Shut, it is one line: the combined count leads, in the unit a planner scans rather than
 * reads, with the combined hours beside the chevron. Open, it is both groups of rows,
 * bounded at a third of the drawer so a badly-spilled week cannot push the runsheet off
 * the top of the screen.
 *
 * ## The rows are the route's rows
 *
 * Both groups build on `StopRow`, with this shell's own pin and type overrides, exactly as
 * `DayPane` builds it — a spilled or stranded visit is the same object as a stop (a site, a
 * company, a filter count, a duration), and one drawn differently from the other asks a
 * planner to learn two ways of reading the same thing in the two places they are most
 * often compared. See the row-level comments below for what each group's pin, track and
 * remedy mean.
 */
const SpillTray = ({
  classes,
  spilled,
  unplaced,
  open,
  draggingId,
  onToggle,
  onDragStart,
  onDragEnd,
  onRestore,
}) => {
  const workspace = useRouteStyles();
  const { t } = useTranslation();
  const tt = (key, options) => t(`obx.runsheet.harmonizeFlow.${key}`, options);

  /* The same substitution `DayPane` makes, for the same reason — see the note there. */
  const route = {
    ...workspace,
    stopMarker: classes.flowMarker,
    stopDetailLabel: classes.flowDetailLabel,
    stopPillName: classes.flowStopName,
    stopFigure: classes.flowFigure,
    stopChevron: classes.flowChevron,
    stopChevronIcon: classes.flowChevronIcon,
    /* Centred, not top-aligned — there is no track under this pin for a top alignment to
       be reaching toward. See `flowLoosePinColumn`. */
    stopTrackColumn: classes.flowLoosePinColumn,
    /* The route's row geometry without its 28px connector gap — these rows draw no track,
       so that margin was pure dead space under every one of them. See `flowLooseStopLine`. */
    stopLine: classes.flowLooseStopLine,
  };

  if (!spilled.length && !unplaced.length) return null;

  const totalMins =
    spilled.reduce((sum, u) => sum + onSiteMinsFor(u.visit.filterCount), 0) +
    unplaced.reduce((sum, u) => sum + onSiteMinsFor(u.visit.filterCount), 0);

  return (
    <Box className={classes.spillTray}>
      <Box
        component="button"
        type="button"
        className={classes.spillBar}
        aria-expanded={open}
        aria-controls="harmonize-issues"
        onClick={onToggle}
      >
        <WarningIcon className={classes.spillBarIcon} />
        <Typography component="span" className={classes.spillBarTitle}>
          {tt('issuesTitleCount', { count: spilled.length + unplaced.length })}
        </Typography>
        {/* The hours, where the count used to sit — the bar's second fact, not its first.
            §14.4 still holds for *this* number: `formatCompact` is the unit the rest of the
            flow states a duration in, so the figure reads the same here as everywhere else
            it appears. */}
        {/* One group, so the gap between the figure and the chevron is the rows' own 6px
            rather than the bar's 10 — see `spillBarTrailing`. The chevron is 13px to match
            `flowChevronIcon`, so the two columns are flush glyph-for-glyph. */}
        <Box className={classes.spillBarTrailing}>
          <Typography component="span" className={classes.spillBarCount}>
            {formatCompact(totalMins)}
          </Typography>
          <Box
            className={classNames(classes.spillBarChevron, open && classes.spillBarChevronOpen)}
            aria-hidden="true"
          >
            <ChevronDown size={13} />
          </Box>
        </Box>
      </Box>

      <Collapse in={open} timeout={220} unmountOnExit>
        <Box className={classes.spillBody} id="harmonize-issues">
          {spilled.length ? (
            <>
              {/* **What these are, then what you can do with them** — in that order and in
                  two short clauses. It read: *"Every one of these has a legal day — the day
                  just ran out of hours. Drag one onto a day tab to put it back, and that day
                  goes over its shift."* Thirty words, two of them jargon (`legal day`, `day
                  tab`), and it spent its first clause explaining the engine's classification
                  rather than the planner's options. */}
              <Typography className={classes.spillIntro}>{tt('spillIntro')}</Typography>

              {spilled.map((item) => (
                <Box
                  key={item.visit.id}
                  className={classNames(
                    classes.spillRow,
                    draggingId === item.visit.id && classes.spillRowMoving,
                  )}
                  draggable
                  tabIndex={0}
                  role="button"
                  aria-label={tt('moveStop', { site: item.site?.name })}
                  onDragStart={(event) => {
                    event.dataTransfer.effectAllowed = 'move';
                    /* Firefox refuses to start a drag with no payload. */
                    event.dataTransfer.setData('text/plain', item.visit.id);
                    onDragStart(item.visit.id);
                  }}
                  onDragEnd={onDragEnd}
                  /**
                   * A click picks the row up, the same as Enter and the same as a drag.
                   *
                   * `DayTabs` already treats a tab as a *destination* rather than a filter
                   * while a move is in flight, and prices or refuses a click on it exactly
                   * as it would a drop. So click-to-pick-up, click-a-day-to-drop is the
                   * drag's own two halves with the pointer released in between — and the
                   * only path that works when the tray and the tabs are too far apart to
                   * drag between comfortably.
                   */
                  onClick={() => onDragStart(item.visit.id)}
                  onKeyDown={(event) => {
                    if (event.key !== 'Enter' && event.key !== ' ') return;
                    event.preventDefault();
                    onDragStart(item.visit.id);
                  }}
                >
                  <StopRow
                    classes={route}
                    /* No track: a dashed rule between these would say they are a route. */
                    lineColor="transparent"
                    grip={
                      <Box className={route.stopGrip} aria-hidden="true">
                        <DragHandle className={route.stopGripIcon} />
                      </Box>
                    }
                    pin={
                      /* Amber and unnumbered — a spilled visit has no place in a sequence. */
                      <StopPinIcon
                        tone={STOP_TONES.excluded}
                        className={route.stopMarker}
                        maskId={`spillPin-${item.visit.id}`}
                      />
                    }
                    title={
                      <Box className={route.stopTitleRow}>
                        <Typography className={route.stopPillName}>{item.site?.name}</Typography>
                      </Box>
                    }
                    figure={
                      /* `stopFigureRow`: `stopValues` is a column of value rows, so an
                         unwrapped fragment stacks its children one per line. */
                      <Box className={route.stopFigureRow}>
                        <StopFigure
                          classes={route}
                          duration={formatCompact(onSiteMinsFor(item.visit.filterCount))}
                          /* No disclosure to open: there is no arithmetic behind an
                             unplaced visit — no arrival, no departure, no leg. `StopFigure`
                             draws the chevron unconditionally, so it is held in place and
                             inert, which is what keeps this figure in the routes' own
                             figure column. */
                          open={false}
                        />
                      </Box>
                    }
                  >
                    <Typography className={route.stopDetailLabel}>
                      {tt('stopMeta', {
                        company: item.site?.company,
                        filters: tt('count.filter', { count: item.visit.filterCount }),
                      })}
                    </Typography>
                    {/* Where it came off, and the zone it belongs to — **the two facts a
                        planner needs to find it a new day**, which is the only decision this
                        row supports. It used to spend the line on *why* instead ("its only
                        legal day" / "3 legal days in its window"): true, and an argument
                        about the engine's own reasoning rather than the thing being moved.
                        The zone is what says which days could take it at all. */}
                    <Box className={classes.spillOffRow}>
                      <Box className={classes.spillOffDot} aria-hidden="true" />
                      <Typography className={classes.spillOff}>
                        {tt('spillOffFrom', {
                          day: dayjs(item.date).format('ddd D'),
                          zone: zoneName(item.site?.zoneId),
                        })}
                      </Typography>
                    </Box>
                  </StopRow>
                </Box>
              ))}
            </>
          ) : null}

          {unplaced.length ? (
            <>
              <Typography
                className={classNames(
                  classes.spillIntro,
                  spilled.length && classes.spillIntroSecond,
                )}
              >
                {tt('notPlacedIntro')}
              </Typography>

              {unplaced.map((item) => {
                const aside = item.reason === UNPLACED_REASON.SET_ASIDE;

                return (
                  <Box
                    key={item.visit.id}
                    className={classes.spillRow}
                    /**
                     * **Every row is draggable now, not only the set-aside ones.**
                     *
                     * The old rule was defensible while it held: a stranded visit had
                     * nowhere legal to go, so a grip on its row would have been a gesture
                     * that could only ever be refused. Manual routes changed that —
                     * `priceMove` lets a `custom` day take any zone, so a Zone West visit
                     * with no worked day in the range now has a real destination the moment
                     * a planner adds one. Leaving these inert meant the rows that most need
                     * moving were the only ones that could not be picked up, and they were
                     * also the rows showing no drag handle at all.
                     *
                     * A set-aside row keeps its second behaviour: clicking it puts it
                     * straight back, which is what `onRestore` is for. A stranded row has
                     * nowhere to be "put back" to, so a click only picks it up.
                     */
                    draggable
                    tabIndex={0}
                    role="button"
                    aria-label={
                      aside
                        ? tt('putItBackFor', { site: item.site?.name })
                        : tt('moveStop', { site: item.site?.name })
                    }
                    onDragStart={(event) => {
                      event.dataTransfer.effectAllowed = 'move';
                      event.dataTransfer.setData('text/plain', item.visit.id);
                      onDragStart(item.visit.id);
                    }}
                    onDragEnd={onDragEnd}
                    onClick={() => (aside ? onRestore(item.visit.id) : onDragStart(item.visit.id))}
                    onKeyDown={(event) => {
                      if (event.key !== 'Enter' && event.key !== ' ') return;
                      event.preventDefault();
                      if (aside) onRestore(item.visit.id);
                      else onDragStart(item.visit.id);
                    }}
                  >
                    <StopRow
                      classes={route}
                      lineColor="transparent"
                      grip={
                        /* Every row now, since every row can be picked up — see the note on
                           `draggable` above. The stranded rows were the ones rendering a
                           bare `stopGripSpacer`, which is why no drag handle was visible on
                           them. */
                        <Box className={route.stopGrip} aria-hidden="true">
                          <DragHandle className={route.stopGripIcon} />
                        </Box>
                      }
                      pin={
                        <StopPinIcon
                          /* Neutral for a deliberate choice, amber for a failure — the one
                             distinction this pane has always drawn between the two, carried
                             into the row's own colour rather than only into its text. */
                          tone={aside ? STOP_TONES.idle : STOP_TONES.excluded}
                          className={route.stopMarker}
                          maskId={`trayPin-${item.visit.id}`}
                        />
                      }
                      title={
                        <Box className={route.stopTitleRow}>
                          <Typography className={route.stopPillName}>{item.site?.name}</Typography>
                        </Box>
                      }
                      figure={
                        <Box className={route.stopFigureRow}>
                          <StopFigure
                            classes={route}
                            duration={formatCompact(onSiteMinsFor(item.visit.filterCount))}
                            open={false}
                          />
                        </Box>
                      }
                    >
                      <Typography className={route.stopDetailLabel}>
                        {tt('stopMeta', {
                          company: item.site?.company,
                          filters: tt('count.filter', { count: item.visit.filterCount }),
                        })}
                      </Typography>
                      <Box className={classes.trayReasonRow}>
                        {/* Paused: the orb is the drawer's mark for *the optimizer*, and
                            this is the optimizer's own account of why the visit is here.
                            Frozen because the working-out is over — an animated orb on a
                            settled result would claim something is still happening. */}
                        <Box className={classes.trayReasonOrb} aria-hidden="true">
                          <ThinkingOrb state="breathing" size={20} paused />
                        </Box>
                        <Typography className={classes.trayReason}>
                          {tt(`reason.${item.reason}`, { zone: zoneName(item.site?.zoneId) })}
                        </Typography>
                      </Box>
                      {/**
                       * **The `Give Zone X a working day in settings` button is gone.**
                       *
                       * It was a gear-and-label call to action under any reason that a
                       * Settings change could fix, opening Config A in a new tab. Removed
                       * on instruction, and the reasoning holds up: the reason line
                       * directly above it already names the cause in the planner's own
                       * words (*"Zone West is not worked on any day in this range"*), which
                       * is the actionable half. The button added a second green thing to a
                       * row inside a tray inside a proposal — three levels down from the
                       * work — and it invited a planner mid-review to leave the surface
                       * holding unsaved work in order to change a setting whose effect they
                       * would then have to come back and re-run to see.
                       *
                       * The way to Config A has not gone anywhere: `Configuration` sits on
                       * ①'s own `Scope` heading, at the top of the same column, which is
                       * where a reader looks for a link to settings and where acting on it
                       * is cheap.
                       *
                       * `isFixableInFlow` is consequently unused here. It is left in
                       * `model/reasons.js` — it is the model's own statement about which
                       * refusals a knob can reach, not a UI helper, and X1's remedies still
                       * ask it.
                       */}
                      {aside ? (
                        <Box component="span" className={classes.trayRemedy}>
                          {tt('putItBack')}
                        </Box>
                      ) : null}
                    </StopRow>
                  </Box>
                );
              })}

              {/* **Q21's parked-question paragraph is gone**, on instruction. It said that
                  what happens to an unplaced visit once its window passes is not settled —
                  true, and §14.1's arithmetic behind it is unchanged, but it was four lines
                  of caveat at the bottom of a list of things a planner came here to act on.
                  The honesty it was protecting is now simply *unstated* rather than
                  contradicted: nothing here promises these come back. If Q21 lands the
                  other way, this is where the promise would go. */}
            </>
          ) : null}
        </Box>
      </Collapse>
    </Box>
  );
};

SpillTray.propTypes = {
  classes: PropTypes.object.isRequired,
  /** `{ visit, site, date, legalDays }` per spilled visit — see `model/overspill.js`. */
  spilled: PropTypes.array.isRequired,
  /** `{ visit, site, reason }` per stranded or set-aside visit — see `model/reasons.js`. */
  unplaced: PropTypes.array.isRequired,
  open: PropTypes.bool,
  /** The visit currently in flight, so its row can show it has left. */
  draggingId: PropTypes.string,
  onToggle: PropTypes.func.isRequired,
  onDragStart: PropTypes.func.isRequired,
  onDragEnd: PropTypes.func.isRequired,
  onRestore: PropTypes.func.isRequired,
};

export default SpillTray;
