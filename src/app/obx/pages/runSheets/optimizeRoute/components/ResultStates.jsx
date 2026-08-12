import { Box, Button, Typography } from '@mui/material';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useStyles } from '../optimizeRoute.styles';

/**
 * The states a solver-backed screen reaches routinely and specs routinely skip.
 * Each one keeps the mode, the target and the locks, so nothing the planner
 * configured is lost to an outcome they did not choose.
 */

/** Sync progress, in place. The plan behind stays readable. */
export const SolvingStrip = ({ label, onCancel }) => {
  const classes = useStyles();
  const { t } = useTranslation();

  return (
    <Box className={classes.solvingStrip} role="status" aria-live="polite">
      <Box className={classes.solvingDot} />
      <Typography className={classes.solvingText}>{label}</Typography>
      {onCancel && (
        <Button disableRipple variant="secondaryGrey" onClick={onCancel}>
          {t('buttons.cancel')}
        </Button>
      )}
    </Box>
  );
};

SolvingStrip.propTypes = { label: PropTypes.string, onCancel: PropTypes.func };

/**
 * A success, not an empty state. Naming the number it rejected is what proves
 * the thing actually ran.
 */
export const NoChangeState = ({ savedMinutesLabel, onDismiss }) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const tt = (key, options) => t(`obx.runsheet.optimize.${key}`, options);

  return (
    <Box className={classNames(classes.stateCard, classes.stateCardGood)}>
      <Typography className={classes.stateTitle}>{tt('noChangeTitle')}</Typography>
      <Typography className={classes.stateBody}>
        {tt('noChangeBody', { time: savedMinutesLabel })}
      </Typography>
      <Box className={classes.stateActions}>
        <Button disableRipple variant="secondaryGrey" onClick={onDismiss}>
          {tt('dismiss')}
        </Button>
      </Box>
    </Box>
  );
};

NoChangeState.propTypes = { savedMinutesLabel: PropTypes.string, onDismiss: PropTypes.func };

/**
 * Never "no solution found". The blocking constraint is named with its numbers,
 * and the best constraint-breaking arrangement stays available as a preview.
 */
export const InfeasibleState = ({ blocker, onRelease, onShowNearMiss }) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const tt = (key, options) => t(`obx.runsheet.optimize.${key}`, options);

  return (
    <Box className={classNames(classes.stateCard, classes.stateCardAlert)}>
      <Typography className={classes.stateTitle}>
        {tt('infeasibleTitle', { site: blocker.site })}
      </Typography>
      <Typography className={classes.stateBody}>
        {tt('infeasibleBody', {
          from: blocker.windowStart,
          to: blocker.windowEnd,
          earliest: blocker.earliestArrival,
        })}
      </Typography>
      <Box className={classes.stateActions}>
        <Button disableRipple variant="primary" onClick={onRelease}>
          {tt('infeasibleRelease')}
        </Button>
        <Button disableRipple variant="secondaryGrey" onClick={onShowNearMiss}>
          {tt('infeasibleNearMiss')}
        </Button>
      </Box>
    </Box>
  );
};

InfeasibleState.propTypes = {
  blocker: PropTypes.object.isRequired,
  onRelease: PropTypes.func,
  onShowNearMiss: PropTypes.func,
};

/**
 * The plan moved underneath an open proposal. Says who moved it and how much of
 * the review survives, because that number is what makes re-solving tolerable.
 */
export const StaleBanner = ({ stale, validCount, totalCount, onResolve }) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const tt = (key, options) => t(`obx.runsheet.optimize.${key}`, options);

  return (
    <Box className={classNames(classes.stateCard, classes.stateCardWarn)} role="alert">
      <Typography className={classes.stateTitle}>{tt('staleTitle')}</Typography>
      <Typography className={classes.stateBody}>
        {/* "7 of your 7 are still valid" is technically true and reads like a warning. */}
        {tt(validCount === totalCount ? 'staleBodyAll' : 'staleBody', {
          who: stale.who,
          what: stale.what,
          valid: validCount,
          total: totalCount,
        })}
      </Typography>
      <Box className={classes.stateActions}>
        <Button disableRipple variant="primary" onClick={onResolve}>
          {tt('staleAction')}
        </Button>
      </Box>
    </Box>
  );
};

StaleBanner.propTypes = {
  stale: PropTypes.object.isRequired,
  validCount: PropTypes.number,
  totalCount: PropTypes.number,
  onResolve: PropTypes.func,
};

/** No apology, no error code in the headline — says what survived and what to do. */
export const FailedState = ({ onRetry }) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const tt = (key, options) => t(`obx.runsheet.optimize.${key}`, options);

  return (
    <Box className={classNames(classes.stateCard, classes.stateCardAlert)} role="alert">
      <Typography className={classes.stateTitle}>{tt('failedTitle')}</Typography>
      <Typography className={classes.stateBody}>{tt('failedBody')}</Typography>
      <Box className={classes.stateActions}>
        <Button disableRipple variant="primary" onClick={onRetry}>
          {tt('failedRetry')}
        </Button>
      </Box>
    </Box>
  );
};

FailedState.propTypes = { onRetry: PropTypes.func };

/** Five minutes, counted down in the open — an honest bound beats an unlimited promise. */
const UNDO_WINDOW_SECONDS = 5 * 60;

export const CommittedState = ({ count, notified, onUndo, onDone }) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const tt = (key, options) => t(`obx.runsheet.optimize.${key}`, options);

  const [secondsLeft, setSecondsLeft] = useState(UNDO_WINDOW_SECONDS);

  useEffect(() => {
    if (secondsLeft <= 0) return undefined;
    const timer = window.setInterval(
      () => setSecondsLeft((previous) => Math.max(0, previous - 1)),
      1000,
    );
    return () => window.clearInterval(timer);
  }, [secondsLeft]);

  const clock = `${Math.floor(secondsLeft / 60)}:${`${secondsLeft % 60}`.padStart(2, '0')}`;

  return (
    <Box
      className={classNames(classes.stateCard, classes.stateCardGood)}
      role="status"
      aria-live="polite"
    >
      <Typography className={classes.stateTitle}>{tt('committedTitle', { count })}</Typography>
      <Typography className={classes.stateBody}>
        {tt(secondsLeft > 0 ? 'committedBody' : 'committedBodyClosed', {
          emailed: tt('committedEmailed', { count: notified }),
        })}
      </Typography>
      <Box className={classes.stateActions}>
        <Button disableRipple variant="secondaryGrey" onClick={onUndo} disabled={secondsLeft <= 0}>
          {secondsLeft > 0 ? tt('undoWithClock', { clock }) : tt('undoClosed')}
        </Button>
        <Button disableRipple variant="primary" onClick={onDone}>
          {tt('backToRunsheets')}
        </Button>
      </Box>
    </Box>
  );
};

CommittedState.propTypes = {
  count: PropTypes.number,
  notified: PropTypes.number,
  onUndo: PropTypes.func,
  onDone: PropTypes.func,
};
