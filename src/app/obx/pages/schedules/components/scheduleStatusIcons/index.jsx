import { Box, Button } from '@mui/material';
import { makeStyles } from '@mui/styles';
import PropTypes from 'prop-types';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { SplittedCalenderIcon } from 'src/assets/svg';
import { ReactComponent as CancelledIcon } from 'src/assets/svg/CancelledIcon.svg?react';
import { ReactComponent as CompletedIcon } from 'src/assets/svg/CompletedIcon.svg?react';
import { ReactComponent as IncompleteIcon } from 'src/assets/svg/incompleteScheduleStatus.svg?react';
import { ReactComponent as InProgressIcon } from 'src/assets/svg/InProgressIcon.svg?react';
import { ReactComponent as MissedIcon } from 'src/assets/svg/MissedIcon.svg?react';
import { ReactComponent as NotStartedIcon } from 'src/assets/svg/notStartedScheduleStatus.svg?react';
import { ReactComponent as UnassignedIcon } from 'src/assets/svg/UnassignedIcon.svg?react';
// import { ReactComponent as UpcomingIcon } from 'src/assets/svg/UpcomingIcon.svg';
import { calendarShiftStatusEnum } from 'src/utils/constants/schedules';

const useStyles = makeStyles((theme) => ({
  bottomArea: {
    backgroundColor: theme.palette.surfaceWhite,

    borderRadius: '0px 0px 5px 5px',
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: '20px',

    padding: '0px 0px 0px 10px',
    '& .MuiButtonBase-root': {
      fontSize: '12px',
      color: theme.palette.textPrimary,
      pointerEvents: 'none',
      padding: '0px',
      height: 'auto',
      flex: '0 0 auto',
    },
  },
}));

export const calendarIndicatorIcons = {
  [calendarShiftStatusEnum.UNASSIGNED]: <UnassignedIcon />,
  [calendarShiftStatusEnum.NOT_STARTED]: <NotStartedIcon />,
  [calendarShiftStatusEnum.IN_PROGRESS]: <InProgressIcon />,
  [calendarShiftStatusEnum.COMPLETED]: <CompletedIcon />,
  [calendarShiftStatusEnum.INCOMPLETE]: <IncompleteIcon />,
  // [calendarShiftStatusEnum.UPCOMING]: <UpcomingIcon />,
  [calendarShiftStatusEnum.MISSED]: <MissedIcon />,
  [calendarShiftStatusEnum.CANCELLED]: <CancelledIcon />,
  [calendarShiftStatusEnum.SPLITTED_SHIFT]: <SplittedCalenderIcon />,
};

export const calendarShiftStatusValues = (t) => ({
  [calendarShiftStatusEnum.NOT_STARTED]: t('obx.schedules.calendar.scheduleStatus.notStarted'),
  [calendarShiftStatusEnum.IN_PROGRESS]: t('obx.schedules.calendar.scheduleStatus.inProgress'),
  [calendarShiftStatusEnum.COMPLETED]: t('obx.schedules.calendar.scheduleStatus.completed'),
  [calendarShiftStatusEnum.INCOMPLETE]: t('obx.schedules.calendar.scheduleStatus.inComplete'),
  [calendarShiftStatusEnum.UPCOMING]: t('obx.schedules.calendar.scheduleStatus.upComing'),
  [calendarShiftStatusEnum.UNASSIGNED]: t('obx.schedules.calendar.scheduleStatus.unAssigned'),
  [calendarShiftStatusEnum.MISSED]: t('obx.schedules.calendar.scheduleStatus.missed'),
  [calendarShiftStatusEnum.CANCELLED]: t('obx.schedules.calendar.scheduleStatus.cancelled'),
  [calendarShiftStatusEnum.SPLITTED_SHIFT]: t(
    'obx.schedules.calendar.scheduleStatus.splittedShift',
  ),
});

const ScheduleStatusIcons = ({ statuses }) => {
  const classes = useStyles();
  const { t } = useTranslation();

  return (
    <Box className={classes.bottomArea}>
      {statuses?.map((status, index) => {
        return (
          <Button
            disableRipple
            startIcon={calendarIndicatorIcons[status]}
            variant="onlyText"
            key={index}
          >
            {calendarShiftStatusValues(t)?.[status]}
          </Button>
        );
      })}
    </Box>
  );
};

export default ScheduleStatusIcons;

ScheduleStatusIcons.propTypes = {
  statuses: PropTypes.array,
};
