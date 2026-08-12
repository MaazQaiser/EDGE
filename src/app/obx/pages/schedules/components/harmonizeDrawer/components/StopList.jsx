import { Box, Typography } from '@mui/material';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  formatMinutesAsClock,
  formatMinutesAsDuration,
} from 'src/app/obx/pages/runSheets/buildRoute/helper';

import { useStyles } from '../harmonizeDrawer.styles';

/**
 * The ordered day.
 *
 * Re-ordering happens here and only here — the map is a read-out. Dragging pins
 * around a 580px map to express a sequence is fiddly on the best day, and it
 * would give the planner two places to edit the same thing.
 *
 * Native drag rather than react-beautiful-dnd: the drawer is positioned with a
 * CSS transform, which breaks the absolute positioning that library relies on.
 *
 * Stops the technician has already completed carry no handle at all. A control
 * that is rendered and then refuses is worse than one that was never offered.
 */
const StopList = ({
  stops = [],
  startLabel,
  endLabel,
  returnLegMinutes = 0,
  finishMinutes,
  manual = false,
  summary,
  pendingTimes = false,
  highlightedSiteId,
  onHighlight,
  onReorder,
  onMoveToOverflow,
  onReoptimize,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const tt = (key, options) => t(`obx.runsheet.harmonize.${key}`, options);

  const [draggingId, setDraggingId] = useState(null);
  const [overId, setOverId] = useState(null);

  const moveTo = (fromSiteId, toIndex) => {
    const order = stops.map((stop) => stop.siteId);
    const from = order.indexOf(fromSiteId);
    if (from === -1 || toIndex < 0 || toIndex >= order.length) return;

    order.splice(toIndex, 0, ...order.splice(from, 1));
    onReorder?.(order);
  };

  const commitDrop = (targetSiteId) => {
    if (!draggingId || draggingId === targetSiteId) return;
    moveTo(
      draggingId,
      stops.findIndex((stop) => stop.siteId === targetSiteId),
    );
  };

  /* Dragging is a mouse gesture. The same handle takes arrow keys so the route
     can be reordered without one. */
  const nudge = (siteId, delta) => {
    const index = stops.findIndex((stop) => stop.siteId === siteId);
    const target = index + delta;
    if (stops[target]?.completed) return; // cannot move behind finished work
    moveTo(siteId, target);
  };

  const clock = (minutes) => (pendingTimes ? '—:—' : formatMinutesAsClock(minutes));

  const reorderable = stops.filter((stop) => !stop.completed).length > 1;

  return (
    <Box className={classes.stopList}>
      <Box className={classes.stopListHeader}>
        <Typography className={classes.sectionLabel}>{tt('routeLabel')}</Typography>
        {manual ? (
          <>
            <Box className={classes.manualPill}>{tt('yourOrder')}</Box>
            <Box className={classes.grow} />
            <button type="button" className={classes.linkButton} onClick={onReoptimize}>
              {tt('reoptimize')}
            </button>
          </>
        ) : (
          <>
            {summary && <Typography className={classes.optionMetaText}>{summary}</Typography>}
            <Box className={classes.grow} />
            {/* An invisible feature is not a feature. Say the route can be
                re-ordered, next to the handles that do it. */}
            {reorderable && <Typography className={classes.hintText}>{tt('dragHint')}</Typography>}
          </>
        )}
      </Box>

      <Box className={classes.timeline}>
        <Box className={classes.anchorRow}>
          {/* Anchors carry the grip column too, empty — otherwise the start and
              end markers sit 28px left of every numbered stop. */}
          <Box className={classes.gripSpacer} />
          <Box className={classNames(classes.stopIndex, classes.stopIndexAnchor)}>▲</Box>
          <Box className={classes.stopBody}>
            <Typography className={classes.stopName}>{startLabel}</Typography>
            <Typography className={classes.stopMeta}>{tt('routeStarts')}</Typography>
          </Box>
        </Box>

        {stops.map((stop) => {
          const locked = Boolean(stop.completed);

          return (
            <Box key={stop.siteId}>
              <Box className={classes.legRow}>
                <Typography className={classes.legText}>
                  {pendingTimes
                    ? tt('drivePending')
                    : tt('drive', {
                        time: formatMinutesAsDuration(stop.travelFromPrevious),
                      })}
                </Typography>
              </Box>

              <Box
                onDragOver={(event) => {
                  if (locked || !draggingId) return;
                  event.preventDefault();
                  setOverId(stop.siteId);
                }}
                onDrop={(event) => {
                  event.preventDefault();
                  commitDrop(stop.siteId);
                  setDraggingId(null);
                  setOverId(null);
                }}
                onMouseEnter={() => onHighlight?.(stop.siteId)}
                onMouseLeave={() => onHighlight?.(null)}
                className={classNames(
                  classes.stopRow,
                  locked && classes.stopRowLocked,
                  draggingId === stop.siteId && classes.stopRowDragging,
                  overId === stop.siteId && classes.stopRowOver,
                  highlightedSiteId === stop.siteId && classes.stopRowHighlighted,
                )}
              >
                {/* The grip is the drag target, not the whole row — a draggable
                    row fights text selection and swallows the ⋮ menu. Completed
                    stops get no grip at all rather than one that refuses. */}
                {locked || !reorderable ? (
                  <Box className={classes.gripSpacer} />
                ) : (
                  <button
                    type="button"
                    draggable
                    className={classes.grip}
                    aria-label={tt('reorderStop', { site: stop.siteName })}
                    onDragStart={(event) => {
                      setDraggingId(stop.siteId);
                      event.dataTransfer.effectAllowed = 'move';
                      /* Firefox refuses to start a drag without payload. */
                      event.dataTransfer.setData('text/plain', stop.siteId);
                    }}
                    onDragEnd={() => {
                      setDraggingId(null);
                      setOverId(null);
                    }}
                    onKeyDown={(event) => {
                      if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') return;
                      event.preventDefault();
                      nudge(stop.siteId, event.key === 'ArrowUp' ? -1 : 1);
                    }}
                  >
                    ⠿
                  </button>
                )}

                <Box
                  className={classNames(
                    classes.stopIndex,
                    locked && classes.stopIndexDone,
                    stop.windowRisk && classes.stopIndexWarn,
                  )}
                >
                  {locked ? '✓' : stop.order}
                </Box>

                <Box className={classes.stopBody}>
                  <Box className={classes.stopTopLine}>
                    <Typography className={classes.stopName}>{stop.siteName}</Typography>
                    {stop.visits.length > 1 && (
                      <Box className={classes.jobsBadge}>
                        {tt('jobsAtStop', { count: stop.visits.length })}
                      </Box>
                    )}
                    {stop.isNew && <Box className={classes.newBadge}>{tt('newStop')}</Box>}
                  </Box>

                  <Typography className={classes.stopMeta}>
                    {locked ? tt('alreadyDone') : formatMinutesAsDuration(stop.serviceMinutes)}
                    {stop.movedFromDay ? ` · ${tt('movedFrom', { day: stop.movedFromDay })}` : ''}
                  </Typography>

                  {stop.windowRisk && (
                    <Typography className={classes.windowWarning}>
                      ⚠ {tt('accessWindow')}
                    </Typography>
                  )}
                </Box>

                <Typography className={classes.stopArrival}>
                  {clock(stop.arrivalMinutes)}
                </Typography>

                {!locked && (
                  <button
                    type="button"
                    className={classes.rowAction}
                    aria-label={tt('moveOut', { site: stop.siteName })}
                    onClick={() => onMoveToOverflow?.(stop.siteId)}
                  >
                    ⋮
                  </button>
                )}
              </Box>
            </Box>
          );
        })}

        {returnLegMinutes > 0 && (
          <Box className={classes.legRow}>
            <Typography className={classes.legText}>
              {pendingTimes
                ? tt('drivePending')
                : tt('drive', { time: formatMinutesAsDuration(returnLegMinutes) })}
            </Typography>
          </Box>
        )}

        <Box className={classes.anchorRow}>
          <Box className={classes.gripSpacer} />
          <Box className={classNames(classes.stopIndex, classes.stopIndexAnchor)}>■</Box>
          <Box className={classes.stopBody}>
            <Typography className={classes.stopName}>{endLabel}</Typography>
            <Typography className={classes.stopMeta}>{tt('routeEnds')}</Typography>
          </Box>
          <Typography className={classes.stopArrival}>{clock(finishMinutes)}</Typography>
        </Box>
      </Box>
    </Box>
  );
};

StopList.propTypes = {
  stops: PropTypes.array,
  startLabel: PropTypes.string,
  endLabel: PropTypes.string,
  returnLegMinutes: PropTypes.number,
  finishMinutes: PropTypes.number,
  manual: PropTypes.bool,
  summary: PropTypes.string,
  pendingTimes: PropTypes.bool,
  highlightedSiteId: PropTypes.string,
  onHighlight: PropTypes.func,
  onReorder: PropTypes.func,
  onMoveToOverflow: PropTypes.func,
  onReoptimize: PropTypes.func,
};

export default StopList;
