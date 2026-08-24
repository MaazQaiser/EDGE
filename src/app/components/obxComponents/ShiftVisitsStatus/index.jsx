import { Box, Typography } from '@mui/material';
import LinearProgress, { linearProgressClasses } from '@mui/material/LinearProgress';
import { styled } from '@mui/material/styles';
import { makeStyles } from '@mui/styles';
import { ReactComponent as ClockIcon } from 'assets/svg/DedicatedDuty/schedule.svg?react';
import PropTypes from 'prop-types';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { dayjsWithStandardOffset } from 'src/app/obx/pages/schedules/helper';
import { PANEL_ACCENT } from 'src/app/obx/pages/schedules/shiftDetail/panelAccent';
import { useTenantLabel } from 'src/helper/utilityHooks';
import useDateTime from 'src/hooks/useDateTime';
import { dayjsFormatsEnum } from 'src/utils/constants';
import { TourShiftStatusEnum } from 'src/utils/constants/schedules';

const useStyles = makeStyles((theme) => ({
  shiftVisitStatus: {
    padding: '16px',
    borderRadius: '8px',
    border: `1px solid ${theme.palette.borderSubtle1}`,
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },

  shiftVisitStatusTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
    },
  },

  shiftVisitStatusFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '8px',
  },

  shiftVisitStatusText: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',

    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
    },
  },

  shiftVisitStatusIndicator: {
    width: '5px',
    height: '5px',
    borderRadius: '50%',
  },
  indicatorGreen: {
    backgroundColor: theme.palette.surfaceSuccessStrong,
  },
  indicatorRed: {
    backgroundColor: theme.palette.surfaceAlertStrong,
  },
  indicatorBlue: {
    backgroundColor: theme.palette.textBrand,
  },
  indicatorOrange: {
    backgroundColor: theme.palette.surfaceWarningStrong,
  },

  /**
   * The tour count, in the panels' green rather than the brand blue.
   *
   * These cards only ever appear inside the shift-detail drawers, and those were rebuilt
   * against a design whose only stated departure is that every accent is green — see
   * `shiftDetail/panelAccent`. `indicatorBlue` above is deliberately *not* changed: it is a
   * status colour (in progress, on schedule), and a status that changed colour to match a
   * panel's accent would stop meaning what the legend says it means.
   */
  shiftVisitStatusVisits: {
    '&.MuiTypography-root': {
      color: PANEL_ACCENT,
    },
  },

  assignDrawerCalendarBodyIcon: {
    '& path': {
      fill: theme.palette.textPrimary,
    },
  },
}));

const StatusColors = (theme) => ({
  [TourShiftStatusEnum.NOT_STARTED]: theme.palette.surfaceWarningStrong,
  [TourShiftStatusEnum.IN_PROGRESS]: theme.palette.textBrand,
  [TourShiftStatusEnum.COMPLETED]: theme.palette.surfaceSuccessStrong,
  [TourShiftStatusEnum.BEHIND_SCHEDULE]: theme.palette.surfaceAlertStrong,
  [TourShiftStatusEnum.ON_SCHEDULE]: theme.palette.textBrand,
});

const BorderLinearProgress = styled(LinearProgress)(({ theme, ...rest }) => {
  return {
    height: 10,
    borderRadius: 10,
    [`&.${linearProgressClasses.colorPrimary}`]: {
      backgroundColor: theme.palette.surfaceGreySubtle,
    },
    [`& .${linearProgressClasses.bar}`]: {
      borderRadius: 10,
      backgroundColor: `${StatusColors(theme)[rest?.status]} !important`,
    },
  };
});

export const StatusValues = (t) => ({
  [TourShiftStatusEnum.NOT_STARTED]: t(
    'obx.schedules.dutyDetail.detail.tourShiftStatus.notStarted',
  ),
  [TourShiftStatusEnum.IN_PROGRESS]: t(
    'obx.schedules.dutyDetail.detail.tourShiftStatus.inProgress',
  ),
  [TourShiftStatusEnum.COMPLETED]: t('obx.schedules.dutyDetail.detail.tourShiftStatus.completed'),
  [TourShiftStatusEnum.BEHIND_SCHEDULE]: t(
    'obx.schedules.dutyDetail.detail.tourShiftStatus.behindSchedule',
  ),
  [TourShiftStatusEnum.ON_SCHEDULE]: t(
    'obx.schedules.dutyDetail.detail.tourShiftStatus.onSchedule',
  ),
});

const ShiftVisitsStatus = ({
  startsAt,
  endsAt,
  completedTours = 0,
  status,
  totalTours,
  isVisit = false,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const { getLabel } = useTenantLabel();

  const tourRatioText = isVisit
    ? t('obx.schedules.dutyDetail.detail.visits')
    : t('obx.schedules.dutyDetail.detail.tours', { tours: getLabel('terms', 'tours', t) });
  const noTourText = isVisit
    ? t('obx.schedules.dutyDetail.detail.novisit')
    : t('obx.schedules.dutyDetail.detail.notours', { tours: getLabel('terms', 'tours', t) });

  const indicatorColorsClass = {
    [TourShiftStatusEnum.NOT_STARTED]: classes.indicatorOrange,
    [TourShiftStatusEnum.IN_PROGRESS]: classes.indicatorBlue,
    [TourShiftStatusEnum.COMPLETED]: classes.indicatorGreen,
    [TourShiftStatusEnum.BEHIND_SCHEDULE]: classes.indicatorRed,
    [TourShiftStatusEnum.ON_SCHEDULE]: classes.indicatorBlue,
  };

  return (
    <Box className={classes.shiftVisitStatus}>
      {startsAt && endsAt && (
        <Typography variant="subtitle2" className={classes.shiftVisitStatusTitle}>
          <ClockIcon className={classes.assignDrawerCalendarBodyIcon} />
          <DisplayDateTimeRange startsAt={startsAt} endsAt={endsAt} />
        </Typography>
      )}
      <BorderLinearProgress
        variant="determinate"
        value={totalTours ? (completedTours / totalTours) * 100 : 0}
        status={status}
      />
      <Box className={classes.shiftVisitStatusFooter}>
        <Typography className={classes.shiftVisitStatusText} variant="subtitle2">
          <Box
            className={`${classes.shiftVisitStatusIndicator} ${indicatorColorsClass[status]}`}
          ></Box>
          {StatusValues(t)?.[status]}
        </Typography>

        <Typography variant="subtitle2" className={classes.shiftVisitStatusVisits}>
          {totalTours ? `${completedTours} / ${totalTours} ${tourRatioText}` : noTourText}
        </Typography>
      </Box>
    </Box>
  );
};

ShiftVisitsStatus.propTypes = {
  startsAt: PropTypes.string,
  endsAt: PropTypes.string,
  status: PropTypes.string,
  completedTours: PropTypes.number,
  totalTours: PropTypes.number,
  isVisit: PropTypes.bool,
};

export default ShiftVisitsStatus;

export const DisplayDateTimeRange = ({ startsAt, endsAt }) => {
  const { formatDayjsDateTime } = useDateTime();
  startsAt = dayjsWithStandardOffset(startsAt);
  endsAt = dayjsWithStandardOffset(endsAt);
  const isStartEndDateSame = startsAt.isSame(endsAt, 'date');

  return `${startsAt.format('DD MMM • ')}${formatDayjsDateTime({ value: startsAt, formatType: dayjsFormatsEnum.time })} -
    ${formatDayjsDateTime({ value: endsAt, formatType: dayjsFormatsEnum.time })}${
      isStartEndDateSame ? '' : endsAt.format(' • DD MMM')
    }`;
};
