import { Box, Button, Chip, Typography } from '@mui/material';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useFlipReorder } from 'src/hooks/useFlipReorder';

import { formatMinutesAsDuration, formatSignedDuration } from '../helper';
import { isFrozen, SEQUENCE_ROUTE, SEQUENCE_STOPS, STOP_STATE } from '../mockSequence';
import { useStyles } from '../optimizeRoute.styles';

/**
 * A route reorder does not deserve a screen. It changes one list the planner is
 * already looking at, so the diff happens in that list: the proposed order
 * renders, and each moved stop shows where it came from.
 *
 * The "was" column is the whole diff. The compare toggle exists because the one
 * question this scope raises — is the new order actually better than mine? — is
 * answered by seeing both, not by reading a number.
 */
const SequenceDiff = ({ onApply, onDiscard }) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const tt = (key, options) => t(`obx.runsheet.optimize.${key}`, options);

  const [showingCurrent, setShowingCurrent] = useState(false);
  const listRef = useRef(null);

  const stops = useMemo(
    () => (showingCurrent ? [...SEQUENCE_STOPS].sort((a, b) => a.was - b.was) : SEQUENCE_STOPS),
    [showingCurrent],
  );

  /* Rows travel to their new places, but only while the diff is small enough
     for that to be comprehension rather than noise. */
  useFlipReorder(listRef, showingCurrent);

  const solvableIndex = stops.findIndex((stop) => !isFrozen(stop));

  return (
    <>
      <Box className={classes.seqPane}>
        <Box className={classes.paneHeader}>
          <Box className={classes.seqHeaderLeft}>
            <Typography className={classes.sectionLabel}>{SEQUENCE_ROUTE.name}</Typography>
            <Typography className={classes.hintText}>{SEQUENCE_ROUTE.date}</Typography>
            {SEQUENCE_ROUTE.live && (
              <Chip className={classes.liveChip} label={tt('live')} size="small" />
            )}
          </Box>
          <Button
            disableRipple
            variant="onlyText"
            aria-pressed={showingCurrent}
            onClick={() => setShowingCurrent((previous) => !previous)}
          >
            {tt(showingCurrent ? 'seqShowProposed' : 'seqShowCurrent')}
          </Button>
        </Box>

        <Box className={classes.seqColumns}>
          <Typography className={classes.seqColLabel}>{tt('seqWas')}</Typography>
          <Typography className={classes.seqColLabel}>
            {tt(showingCurrent ? 'seqCurrentOrder' : 'seqProposedOrder')}
          </Typography>
          <Typography className={classNames(classes.seqColLabel, classes.seqColRight)}>
            {tt('seqArrive')}
          </Typography>
          <Typography className={classNames(classes.seqColLabel, classes.seqColRight)}>
            {tt('seqChange')}
          </Typography>
        </Box>

        <Box className={classes.paneScroll} ref={listRef}>
          {stops.map((stop, index) => {
            const position = index + 1;
            const frozen = isFrozen(stop);
            const moved = !showingCurrent && stop.state === STOP_STATE.MOVED;
            const locked = stop.state === STOP_STATE.LOCKED;

            return (
              <React.Fragment key={stop.id}>
                {index === solvableIndex && solvableIndex > 0 && (
                  <Typography className={classes.seqTailNote}>
                    {tt('seqSolvableTail', {
                      time: formatMinutesAsDuration(SEQUENCE_ROUTE.remainingMinutes),
                    })}
                  </Typography>
                )}

                <Box
                  data-flip-id={stop.id}
                  className={classNames(classes.seqRow, frozen && classes.seqRowFrozen)}
                >
                  <Box className={classes.seqWas}>
                    {/* Unchanged stops show a faint old number; moved ones show the jump. */}
                    <Typography
                      className={classNames(classes.seqWasNumber, moved && classes.seqWasMoved)}
                    >
                      {stop.was}
                    </Typography>
                    {moved && (
                      <Box component="span" className={classes.seqWasArrow} aria-hidden="true">
                        →
                      </Box>
                    )}
                  </Box>

                  <Box className={classes.seqBadgeCell}>
                    {frozen ? (
                      <Box
                        className={classNames(
                          classes.seqBadge,
                          classes.seqBadgeFrozen,
                          stop.state === STOP_STATE.IN_PROGRESS && classes.seqBadgeLive,
                        )}
                      >
                        {stop.state === STOP_STATE.IN_PROGRESS ? '◉' : '✓'}
                      </Box>
                    ) : (
                      <Box
                        className={classNames(
                          classes.seqBadge,
                          moved && classes.seqBadgeMoved,
                          locked && classes.seqBadgeLocked,
                        )}
                      >
                        {position}
                      </Box>
                    )}
                  </Box>

                  <Box className={classes.seqBody}>
                    <Typography className={classes.changeTitle}>
                      {stop.site}{' '}
                      <Box component="span" className={classes.changeUnit}>
                        · {stop.unit}
                      </Box>
                    </Typography>

                    {stop.state === STOP_STATE.DONE && (
                      <Typography className={classes.heldMeta}>
                        {tt('seqDone', { time: stop.arrival })}
                      </Typography>
                    )}
                    {stop.state === STOP_STATE.IN_PROGRESS && (
                      <Typography className={classes.heldMeta}>{tt('seqOnSite')}</Typography>
                    )}
                    {moved && stop.reason && (
                      <Typography className={classes.changeReason}>
                        {tt(`reason.${stop.reason.code}`, stop.reason)}
                      </Typography>
                    )}
                    {locked && (
                      <Typography className={classes.seqLockNote}>
                        🔒 {tt('seqPinned', { reason: stop.lockReason })}
                      </Typography>
                    )}
                  </Box>

                  <Typography className={classes.seqArrival}>
                    {frozen && stop.state === STOP_STATE.DONE ? '—' : stop.arrival}
                  </Typography>

                  <Typography
                    className={classNames(
                      classes.changeDelta,
                      !stop.deltaMinutes && classes.changeDeltaNone,
                    )}
                  >
                    {frozen
                      ? tt('seqFrozen')
                      : locked
                        ? tt('seqHeld')
                        : formatSignedDuration(stop.deltaMinutes || 0)}
                  </Typography>
                </Box>
              </React.Fragment>
            );
          })}
        </Box>
      </Box>

      <Box className={classes.commitBar}>
        <Box className={classes.commitSummary}>
          <Typography className={classes.commitLine}>
            {tt('seqFooter', {
              time: formatMinutesAsDuration(SEQUENCE_ROUTE.savedMinutes),
              now: SEQUENCE_ROUTE.finishNow,
              was: SEQUENCE_ROUTE.finishWas,
            })}
          </Typography>
          <Typography className={classes.commitSubline}>{tt('seqNoDayChange')}</Typography>
        </Box>
        <Box className={classes.commitActions}>
          <Button disableRipple variant="secondaryGrey" onClick={onDiscard}>
            {tt('discard')}
          </Button>
          <Button disableRipple variant="primary" onClick={onApply}>
            {tt('seqApplyOrder')}
          </Button>
        </Box>
      </Box>
    </>
  );
};

SequenceDiff.propTypes = {
  onApply: PropTypes.func,
  onDiscard: PropTypes.func,
};

export default SequenceDiff;
