import { Box, Button, Popover, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { EFFECT_SCOPE, MODE_OPTIONS } from '../mockProposal';
import { useStyles } from '../optimizeRoute.styles';

/**
 * A popover rather than a modal, because the thing you are about to change
 * should stay visible while you configure the change.
 *
 * The scope is not offered here — it comes from the surface you pressed the
 * button on, so the blast radius is known before the press rather than after.
 * What *is* offered is the one genuinely consequential choice per scope: the
 * mode, and whether the change stands or applies to this week only.
 */
const OptimizePopover = ({
  anchorEl,
  open,
  onClose,
  mode,
  onModeChange,
  effect,
  onEffectChange,
  lockCount,
  target,
  actionLabel,
  onSolve,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const tt = (key, options) => t(`obx.runsheet.optimize.${key}`, options);

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      transformOrigin={{ vertical: 'top', horizontal: 'left' }}
    >
      <Box className={classes.popover}>
        <Box>
          <Typography className={classes.popTitle}>{actionLabel}</Typography>
          <Typography className={classes.popTarget}>{target}</Typography>
        </Box>

        <Box className={classes.popDivider} />

        <Box role="radiogroup" aria-label={tt('modeGroupAria')}>
          {MODE_OPTIONS.map((option) => (
            <Box
              key={option.value}
              component="label"
              className={classes.modeOption}
              htmlFor={`optimize-mode-${option.value}`}
            >
              <input
                id={`optimize-mode-${option.value}`}
                type="radio"
                name="optimize-mode"
                className={classes.modeRadio}
                checked={mode === option.value}
                onChange={() => onModeChange(option.value)}
              />
              <Box>
                <Typography className={classes.modeLabel}>{tt(option.labelKey)}</Typography>
                {/* Each mode states its cost, not only its benefit. */}
                <Typography className={classes.modeHint}>{tt(option.hintKey)}</Typography>
              </Box>
            </Box>
          ))}
        </Box>

        <Box className={classes.popDivider} />

        {/*
          The one thing a planner must never have to infer: whether they are
          changing this week or every week from now on.
        */}
        <Box role="radiogroup" aria-label={tt('effectGroupAria')}>
          <Box component="label" className={classes.modeOption} htmlFor="optimize-effect-once">
            <input
              id="optimize-effect-once"
              type="radio"
              name="optimize-effect"
              className={classes.modeRadio}
              checked={effect === EFFECT_SCOPE.ONCE}
              onChange={() => onEffectChange(EFFECT_SCOPE.ONCE)}
            />
            <Box>
              <Typography className={classes.modeLabel}>{tt('effectOnce')}</Typography>
              <Typography className={classes.modeHint}>{tt('effectOnceHint')}</Typography>
            </Box>
          </Box>

          <Box component="label" className={classes.modeOption} htmlFor="optimize-effect-standing">
            <input
              id="optimize-effect-standing"
              type="radio"
              name="optimize-effect"
              className={classes.modeRadio}
              checked={effect === EFFECT_SCOPE.STANDING}
              onChange={() => onEffectChange(EFFECT_SCOPE.STANDING)}
            />
            <Box>
              <Typography className={classes.modeLabel}>{tt('effectStanding')}</Typography>
              <Typography className={classes.modeHint}>{tt('effectStandingHint')}</Typography>
            </Box>
          </Box>
        </Box>

        {lockCount > 0 && (
          <Box className={classes.popLocks}>🔒 {tt('locksHeld', { count: lockCount })}</Box>
        )}

        <Box className={classes.popFooter}>
          <Button disableRipple variant="secondaryGrey" onClick={onClose}>
            {t('buttons.cancel')}
          </Button>
          {/* Repeats the action name: the second press is the one that spends the solve. */}
          <Button disableRipple variant="primary" onClick={onSolve}>
            {actionLabel}
          </Button>
        </Box>
      </Box>
    </Popover>
  );
};

OptimizePopover.propTypes = {
  anchorEl: PropTypes.any,
  open: PropTypes.bool,
  onClose: PropTypes.func,
  mode: PropTypes.string,
  onModeChange: PropTypes.func,
  effect: PropTypes.string,
  onEffectChange: PropTypes.func,
  lockCount: PropTypes.number,
  target: PropTypes.string,
  actionLabel: PropTypes.string,
  onSolve: PropTypes.func,
};

export default OptimizePopover;
