import { Box, Radio, Typography } from '@mui/material';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { formatMinutesAsDuration } from 'src/app/obx/pages/runSheets/buildRoute/helper';

import { useStyles } from '../harmonizeDrawer.styles';

/**
 * Three ways to sequence the same day.
 *
 * Not three roads between two points — Google will not return alternatives for
 * a request carrying waypoints, and "ring road or town centre" is not a choice
 * a planner has any basis to make. These are three different answers to the
 * question that is actually being asked: what order, and what does it cost.
 *
 * When the three answers barely differ the strip collapses to a single line.
 * Offering a decision where there isn't one is how a screen starts to feel like
 * paperwork.
 */
const RouteOptions = ({ plans = [], selected, onSelect, onPreview, collapsed = false }) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const tt = (key, options) => t(`obx.runsheet.harmonize.${key}`, options);

  if (!plans.length) return null;

  /* With only one real answer there is no strip to show. The stop list already
     heads itself "Route" and carries the same summary, so rendering a second
     one here just stacks two identical headings. */
  if (collapsed) return null;

  return (
    <Box className={classes.options}>
      <Typography className={classes.sectionLabel}>{tt('routeOptions')}</Typography>

      {plans.map((plan) => {
        const isActive = plan.option === selected;

        return (
          <Box
            key={plan.option}
            component="label"
            htmlFor={`route-option-${plan.option}`}
            className={classNames(classes.optionRow, isActive && classes.optionRowActive)}
            onMouseEnter={() => onPreview?.(plan.option)}
            onMouseLeave={() => onPreview?.(null)}
          >
            <Radio
              id={`route-option-${plan.option}`}
              name="route-option"
              size="small"
              disableRipple
              className={classes.radio}
              checked={isActive}
              onChange={() => onSelect(plan.option)}
            />
            <Typography className={classes.optionName}>{tt(`option.${plan.option}`)}</Typography>
            <Typography className={classes.optionTime}>
              {formatMinutesAsDuration(plan.totalMinutes)}
            </Typography>
            <Typography
              className={classNames(
                classes.optionFit,
                plan.overflowVisitCount > 0 && classes.optionFitPartial,
              )}
            >
              {plan.overflowVisitCount > 0
                ? tt('fitPartial', { count: plan.fittedVisitCount })
                : tt('fitAll', { count: plan.fittedVisitCount })}
            </Typography>
          </Box>
        );
      })}
    </Box>
  );
};

RouteOptions.propTypes = {
  plans: PropTypes.array,
  selected: PropTypes.string,
  onSelect: PropTypes.func.isRequired,
  onPreview: PropTypes.func,
  collapsed: PropTypes.bool,
};

export default RouteOptions;
