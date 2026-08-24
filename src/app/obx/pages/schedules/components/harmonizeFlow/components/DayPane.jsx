import { Box, InputBase, Tooltip, Typography } from '@mui/material';
import classNames from 'classnames';
import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { StopPinIcon } from '../../harmonize/components/StopPinIcon';
import { DragHandle, StopFigure, StopRow } from '../../harmonize/components/StopRowParts';
import {
  LEG_LINE,
  STOP_TONES,
  useStyles as useRouteStyles,
} from '../../harmonize/harmonize.styles';
import { formatCompact, formatElapsed } from '../model/durations';
import { BASE, zoneName } from '../model/fixtures';
import { MoveIcon, TrashIcon } from './Glyphs';
import RouteAvatar from './RouteAvatar';

/**
 * The base/start and base/end anchors' own tone — **lighter than `STOP_TONES.idle`.**
 *
 * A local constant rather than an edit to `STOP_TONES`: that object is shared with the
 * workspace's own list and map, and darkening or lightening it there would move a pin
 * this drawer has never drawn. `#5B5B5F`/`#86868B` read as near-black next to the route's
 * blue and amber pins, which carry actual state; an anchor marks a place, not a state, so
 * it can afford to recede further than either.
 */
const FLOW_ANCHOR_TONE = { fill: '#AEAEB4', rim: '#86868B', line: '#AEAEB4' };

/** How far apart each row's fade-up starts, in ③'s entrance — see `stopRowEnter`. */
const ROW_STAGGER_MS = 45;

/**
 * One day, as **the workspace's route card** — the same components, not a second drawing.
 *
 * ## What changed, and why it is an import rather than a copy
 *
 * This card used to be a mirror: its own rail, its own pins, its own dashed track, built
 * from `harmonizeFlow.styles.js` against a written description of the workspace's card. The
 * intent was that a planner comparing the two shells would be comparing *shells* rather
 * than relearning what a stop is — and a mirror cannot deliver that, because a mirror is a
 * second implementation and a second implementation drifts. It had already drifted: 24px
 * pins against the workspace's 20px teardrops, a flat disc where the workspace draws a
 * masked rim, a `1fr` label column where the workspace has a label stack and a value stack
 * so figures line up down the card.
 *
 * So the card is now assembled from the workspace's own parts:
 *
 *   `StopRow`      — the four-column row whose dashed track grows with the row's height
 *   `StopFigure`   — the `figure · figure ⌄` cluster on the right
 *   `StopPinIcon`  — the numbered teardrop, the same path the workspace's map draws
 *   `DragHandle`   — the six-dot grip
 *   `harmonize.styles.js` — `proposedHead` / `proposedBar`, and the whole `stop*` family the
 *                           rows are dressed in (minus the handful this shell overrides by
 *                           key — see `route` below)
 *
 * **This reverses a decision, on instruction.** `harmonizeFlow.styles.js` copies the
 * workspace's pin and track colours *by value* and says why: the two shells are a
 * comparison, and a shared constant one of them could edit is a way for one to restyle the
 * other. That argument holds for a *tone* and it does not hold for the card — the card is
 * the thing the comparison is supposed to hold constant. The copied `PIN_FILL` and
 * `TRACK_LINE` in the drawer's own sheet are now unused by this file; `STOP_TONES` and
 * `LEG_LINE` are imported from source.
 *
 * ## The two things this shell's model still forces
 *
 * - **The leg is stated in miles.** It was `Drive 20m`, on the argument that this model has
 *   no radius (D15 replaced it with zones) so quoting distance would invent precision the
 *   geometry does not have. Two things answer that: the fixture's coordinates *are* notional
 *   miles — `travelMins` is derived from them, so the miles are the more primitive figure of
 *   the two — and a planner reads a route in distance. `travelMiles` in the planner returns
 *   the same measurement the minutes are built from, so a leg's miles and its minutes cannot
 *   disagree. The minutes are still in the disclosure, where the day's total is accounted
 *   for.
 * - **Elapsed, not clock.** The workspace's `StopList` prints `14:32` from a real start
 *   hour. D16 denies this run one, so the disclosure states `3:38` — *three hours
 *   thirty-eight into the day* — which is why `StopList` itself is not the thing imported
 *   here: it would have to be taught a second time notation to serve both shells, and the
 *   row parts underneath it are the actual shared object.
 *
 * ## What this card carries that the workspace's does not
 *
 * The grip drags a stop to *another day* rather than reordering it within this one: the
 * drawer shows one day at a time, so the day tabs are the drop targets and there is no
 * second route on screen to drop into.
 *
 * ## The header is this shell's own, not the workspace's
 *
 * It used to reuse `proposedHead`/`proposedNameStatic`/`proposedTime` wholesale — one row,
 * title left, `3h48m / 4h` right — with a second paragraph underneath running the zone,
 * the stop/filter/drive counts and the spare/over verdict together as one sentence. Redrawn
 * as three ranks (`flowRouteHeader*` in the sheet): day + zone chip, then the duration as
 * its own large figure over the gauge, then a quiet caption with the verdict split out and
 * coloured on its own. See the styles for the full reasoning.
 */
const DayPane = ({
  classes,
  sheet,
  forced = [],
  name,
  onNameChange,
  installerId,
  onAssignInstaller,
  isCustom,
  onRemoveRoute,
  draggingId,
  onDragStart,
  onDragEnd,
  onStartMove,
  isTipping,
}) => {
  const workspace = useRouteStyles();
  const { t } = useTranslation();
  /**
   * The workspace's sheet, with this shell's overrides swapped in **by key**.
   *
   * `StopRow`, `StopFigure` and `StopPinIcon` all read their classes off the object they
   * are handed, so an override here is a one-line substitution rather than a fork of the
   * component — and, crucially, it cannot reach the workspace's own list. Editing
   * `stopMarker` or `stopDetailLabel` in `harmonize.styles.js` would have resized the pins
   * on the map-side card too, which is the one thing the two features must not do to each
   * other.
   */
  const route = {
    ...workspace,
    stopMarker: classes.flowMarker,
    stopDetailLabel: classes.flowDetailLabel,
    stopDetailValue: classes.flowDetailValue,
    stopPillName: classes.flowStopName,
    stopFigure: classes.flowFigure,
    stopChevron: classes.flowChevron,
    stopChevronIcon: classes.flowChevronIcon,
    /* The row's own painted box — the hover fill, its radius and its padding all live
       here, sized to match the accordion's rows. The wrapper around it paints nothing;
       see the notes on `flowStopLine` and `stopHoverRow` for the two attempts that had it
       the other way round and why the 28px track gap made that impossible. */
    stopLine: classes.flowStopLine,
  };

  const tt = (key, options) => t(`obx.runsheet.harmonizeFlow.${key}`, options);
  const [openId, setOpenId] = useState(null);

  const over = sheet.overrunMins > 0;

  /* The workspace's own bar rule: the budget, stretched if the day runs past it, so a
     column of cards puts every bar on one axis at one length. Here there is one card at a
     time and the rule still earns its place — it is what makes the fill *stop growing* at
     the shift line and the colour do the talking instead. */
  const gaugeScale = Math.max(sheet.shiftMins, sheet.durationMins) || 1;
  const gaugeFill = Math.min(1, sheet.durationMins / gaugeScale);

  /* Which stops are on the day because the planner put them there. Named on the row, since
     it is the answer to "why is this day amber". */
  const forcedSet = new Set(forced);

  const anchor = (name, meta, maskId, rowIndex) => (
    <Box
      className={classes.stopRowEnter}
      style={{ animationDelay: `${rowIndex * ROW_STAGGER_MS}ms` }}
    >
      <StopRow
        classes={route}
        lineColor={FLOW_ANCHOR_TONE.line}
        rowClassName={meta ? route.stopLineFlush : undefined}
        grip={<Box className={route.stopGripSpacer} />}
        /* No `blank`, unlike the workspace's own anchors — the route's start and end get
           the same plain dot a numberless *visit* pin gets (see `StopPinIcon`), so a
           planner reading pins down the card sees one family of marks throughout rather
           than a bare teardrop at both ends of it. */
        pin={<StopPinIcon tone={FLOW_ANCHOR_TONE} className={route.stopMarker} maskId={maskId} />}
        title={
          <Box className={classNames(route.stopTitleRow, route.stopAnchorTitle)}>
            <Typography className={route.stopPillName}>{name}</Typography>
          </Box>
        }
        figure={
          meta ? (
            /* `stopFigureRow`, as the workspace wraps every figure: `stopValues` is a *column*
               of value rows, so a bare fragment of siblings stacks one per line instead of
               reading across. */
            <Box className={route.stopFigureRow}>
              <Typography className={route.stopFigure}>{meta}</Typography>
              <Box className={classNames(route.stopChevronIcon, route.stopChevronGhost)} />
            </Box>
          ) : null
        }
      />
    </Box>
  );

  return (
    <Box className={classes.routeBody}>
      <Box className={classes.flowRouteHeader}>
        <Box className={classes.flowRouteHeaderTop}>
          {/**
           * The day's title, **inline-editable** — the workspace's own `proposedName`
           * pattern (`harmonize/components/RouteCard`): no border, no background, until
           * hovered or focused, so a field a planner will rarely touch does not look like
           * a form squatting on top of a heading. Uncontrolled towards the placeholder —
           * `value` is the pinned name once one exists, `placeholder` is `Route for {day}`
           * so an unnamed day still reads as the sentence it always was rather than as a
           * blank field waiting to be filled in.
           */}
          <InputBase
            component="h3"
            className={classes.flowRouteTitle}
            value={name}
            onChange={(event) => onNameChange(event.target.value)}
            placeholder={tt('routeFor', { day: dayjs(sheet.date).format('ddd D MMM') })}
            inputProps={{ 'aria-label': tt('routeNameLabel') }}
          />
          {/* D15's hard constraint, given the standing a chip carries and a mid-sentence
              clause did not. */}
          {/* A hand-made route carries no zone (see `addRoute`), so there is no zone to
              name — and `zoneName(null)` would print a bare em dash where every other card
              states its one hard constraint. `Any zone` says the true thing about it: the
              engine's one-zone rule is what it opted out of. */}
          <Typography component="span" className={classes.flowZoneChip}>
            {sheet.zoneId ? zoneName(sheet.zoneId) : tt('anyZone')}
          </Typography>

          {/* Who is on it. On the title's own row rather than down beside the counts,
              because it belongs to the route's *identity* — the same rank as its name and
              its zone — and not to its arithmetic. See `RouteAvatar`. */}
          <RouteAvatar
            classes={classes}
            installerId={installerId}
            onAssign={(id) => onAssignInstaller(sheet.date, id)}
          />

          {/* **Only on a route the planner added by hand.** A Config A day is the
              franchise's answer from Settings and this drawer has no business deleting
              one; `removeRoute` guards the same rule independently, so this is the
              affordance and not the enforcement. */}
          {isCustom ? (
            <Tooltip arrow title={tt('removeRoute')}>
              <Box
                component="button"
                type="button"
                className={classes.routeDeleteButton}
                aria-label={tt('removeRoute')}
                onClick={() => onRemoveRoute(sheet.date)}
              >
                <TrashIcon size={16} />
              </Box>
            </Tooltip>
          ) : null}
        </Box>

        {/* The figure a planner compares card to card — the thing the old caption-sized
            `3h48m / 4h` never earned the eye's first stop for. */}
        <Box className={classes.flowRouteMetric}>
          <Typography
            className={classNames(
              classes.flowRouteMetricValue,
              over && classes.flowRouteMetricOver,
            )}
          >
            {formatCompact(sheet.durationMins)}
          </Typography>
          <Typography className={classes.flowRouteMetricOf}>
            {tt('ofShift', { shift: formatCompact(sheet.shiftMins) })}
          </Typography>
        </Box>

        {/* How full the day is. **The fill turns yellow, it does not overflow** — the track
            is scaled to whichever is larger, so a day past its shift shows a full amber bar
            and the figure above it says by how much. `scaleX`, not width: width is a layout
            property and transitioning it thrashes. */}
        <Box className={route.proposedBar} aria-hidden="true">
          <Box
            className={classNames(route.proposedBarFill, over && route.proposedBarOver)}
            style={{ transform: `scaleX(${gaugeFill})` }}
          />
        </Box>

        {/* Stops, filters, drive — quiet. The spare/over verdict that used to trail this
            line is gone; the big metric above and the gauge under it already say whether
            the day is full. */}
        <Box className={classes.flowRouteCaption}>
          <Typography className={classes.flowRouteCaptionText}>
            {tt('paneMetaCaption', {
              stops: tt('count.stop', { count: sheet.stops.length }),
              filters: tt('count.filter', { count: sheet.filterCount }),
              drive: formatCompact(sheet.travelMins),
            })}
          </Typography>
        </Box>
      </Box>

      {/* An empty day is the message and nothing else — no lone anchor with a dashed line
          running out of it into nothing. */}
      {!sheet.stops.length ? (
        <Typography className={classes.emptyDay}>
          {/* Two different empty days. A *worked* day with nothing legal on it is a
              statement about the zone and the week — nothing this planner can fix here. A
              route they created a second ago is empty because they have not filled it yet,
              and the message's job is to say how. */}
          {sheet.zoneId === null
            ? tt('emptyCustomRoute')
            : tt('emptyDay', {
                zone: zoneName(sheet.zoneId),
                shift: formatCompact(sheet.shiftMins),
              })}
        </Typography>
      ) : (
        <Box className={route.proposedBody}>
          <Box className={route.stopTrack} role="list">
            {anchor(BASE.name, null, `flowStart-${sheet.date}`, 0)}

            {sheet.stops.map((stop, index) => {
              const isOpen = openId === stop.visit.id;
              const isForced = forcedSet.has(stop.visit.id);
              /* The last row's track leads into the end anchor, so it takes the anchor's
                 own tone rather than the workspace's `STOP_TONES.idle` — otherwise the
                 dash and the pin it runs into would be two different greys. Every other
                 row is violet, matching the workspace. The open disclosure has to agree
                 with the connector it interrupts, so it is computed once here. */
              const lineColor = index === sheet.stops.length - 1 ? FLOW_ANCHOR_TONE.line : LEG_LINE;

              return (
                <Box
                  key={stop.visit.id}
                  className={classNames(
                    classes.stopHoverRow,
                    classes.stopRowEnter,
                    draggingId === stop.visit.id && classes.stopDragging,
                    isTipping(stop) && classes.stopTipping,
                  )}
                  style={{ animationDelay: `${(index + 1) * ROW_STAGGER_MS}ms` }}
                  role="listitem"
                >
                  <StopRow
                    classes={route}
                    lineColor={lineColor}
                    details={
                      isOpen
                        ? [
                            {
                              key: 'arrive',
                              label: tt('detailArrive'),
                              value: formatElapsed(stop.arriveMins),
                            },
                            {
                              key: 'depart',
                              label: tt('detailDepart'),
                              value: formatElapsed(stop.departMins),
                            },
                            {
                              key: 'onSite',
                              label: tt('detailOnSite'),
                              /* The arithmetic, not just the answer — `10 + filters × 20`
                                 (D10) is the whole cost model and the one number a planner
                                 is most likely to want to check. */
                              value: tt('detailOnSiteSum', {
                                filters: stop.visit.filterCount,
                                total: formatCompact(stop.onSiteMins),
                              }),
                            },
                            {
                              key: 'drive',
                              label: tt('detailDrive'),
                              value: formatCompact(stop.travelFromPrev),
                            },
                          ]
                        : []
                    }
                    grip={
                      /* The grip is the drag target, not the row: a draggable row fights
                         text selection and swallows the chevron. Enter and Space start the
                         same move, which is the only keyboard route between days. */
                      <Box
                        component="button"
                        type="button"
                        draggable
                        className={route.stopGrip}
                        aria-label={tt('moveStop', { site: stop.site.name })}
                        onDragStart={(event) => {
                          event.dataTransfer.effectAllowed = 'move';
                          /* Firefox refuses to start a drag with no payload. */
                          event.dataTransfer.setData('text/plain', stop.visit.id);
                          onDragStart(stop.visit.id);
                        }}
                        onDragEnd={onDragEnd}
                        onKeyDown={(event) => {
                          if (event.key !== 'Enter' && event.key !== ' ') return;
                          event.preventDefault();
                          onStartMove(stop.visit.id);
                        }}
                      >
                        <DragHandle className={route.stopGripIcon} />
                      </Box>
                    }
                    pin={
                      <StopPinIcon
                        number={stop.index}
                        tone={STOP_TONES.planned}
                        className={route.stopMarker}
                        maskId={`flowPin-${sheet.date}-${stop.visit.id}`}
                      />
                    }
                    title={
                      <Box className={route.stopTitleRow}>
                        <Typography className={route.stopPillName}>{stop.site.name}</Typography>
                        {/* Forced work names itself where the work is. Without it the amber
                            bar above has a cause the planner has to remember rather than
                            read, and this is the row the "raise the hours" offer is about. */}
                        {isForced ? (
                          <>
                            <Box className={route.stopPillDot} />
                            <Typography
                              className={classNames(route.stopDetailLabel, classes.forcedMark)}
                            >
                              {tt('forcedIn')}
                            </Typography>
                          </>
                        ) : null}

                        {/* **Move this visit to another day** — the pointer-free half of the
                            grip beside it. Pressing it does not move anything: it puts the
                            visit in hand, which turns every day tab into a priced drop
                            target and brings up the decision box's own "pick a day" copy.
                            Exactly what the grip's drag does on release, and the only route
                            to it for anyone not dragging — including onto a manual route,
                            which is the reason this was asked for.

                            Hidden until the row is hovered or the button itself is focused
                            (`data-move`, revealed by `stopHoverRow`) — twelve always-on
                            action icons down a 475px list is a toolbar, not a route. */}
                        <Tooltip arrow title={tt('moveVisit', { site: stop.site.name })}>
                          <Box
                            component="button"
                            type="button"
                            data-move="true"
                            className={classes.stopMoveButton}
                            aria-label={tt('moveVisit', { site: stop.site.name })}
                            onClick={() => onStartMove(stop.visit.id)}
                          >
                            <MoveIcon size={15} />
                          </Box>
                        </Tooltip>
                      </Box>
                    }
                    figure={
                      /* Wrapped — see the anchor's own note: without `stopFigureRow` the
                         four children of `StopFigure`'s fragment land in a column and the
                         row reads `8.9 mi` over `1h10m` over the chevron. */
                      <Box className={route.stopFigureRow}>
                        <StopFigure
                          classes={route}
                          /* Miles from the previous stop, then time on site — see the note at
                           the top of the file. One decimal: the grid is notional, so a whole
                           mile would round three of the fixture's legs to the same figure and
                           two decimals would claim a survey. `StopFigure` draws its own
                           separator dot between the two halves. */
                          distance={tt('miles', { value: stop.milesFromPrev.toFixed(1) })}
                          duration={formatCompact(stop.onSiteMins)}
                          open={isOpen}
                          onToggle={() => setOpenId(isOpen ? null : stop.visit.id)}
                          toggleLabel={tt('stopDetailFor', { site: stop.site.name })}
                        />
                      </Box>
                    }
                  >
                    {/* Under the name, in `StopRow`'s own label stack: the company and the
                        filter count. */}
                    <Typography className={route.stopDetailLabel}>
                      {tt('stopMeta', {
                        company: stop.site.company,
                        filters: tt('count.filter', { count: stop.visit.filterCount }),
                      })}
                    </Typography>
                  </StopRow>
                </Box>
              );
            })}

            {anchor(
              BASE.name,
              tt('elapsedPlain', { time: formatElapsed(sheet.durationMins) }),
              `flowEnd-${sheet.date}`,
              sheet.stops.length + 1,
            )}
          </Box>
        </Box>
      )}
    </Box>
  );
};

DayPane.propTypes = {
  classes: PropTypes.object.isRequired,
  sheet: PropTypes.object.isRequired,
  /** Visit ids the planner forced back onto a day — the reason a bar can be amber. */
  forced: PropTypes.arrayOf(PropTypes.string),
  /** A custom name for this day's route, or empty to fall back to `Route for {day}`. */
  name: PropTypes.string,
  onNameChange: PropTypes.func.isRequired,
  /** The installer on this route, or empty for one nobody is on yet. */
  installerId: PropTypes.string,
  onAssignInstaller: PropTypes.func.isRequired,
  /** True for a route the planner added by hand — the only kind that can be deleted. */
  isCustom: PropTypes.bool,
  onRemoveRoute: PropTypes.func.isRequired,
  draggingId: PropTypes.string,
  onDragStart: PropTypes.func.isRequired,
  onDragEnd: PropTypes.func.isRequired,
  onStartMove: PropTypes.func.isRequired,
  isTipping: PropTypes.func.isRequired,
};

export default DayPane;
