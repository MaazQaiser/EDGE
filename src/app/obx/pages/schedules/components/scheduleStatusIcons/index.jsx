import { Box, Button } from '@mui/material';
import { makeStyles } from '@mui/styles';
import PropTypes from 'prop-types';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { SplittedCalenderIcon } from 'src/assets/svg';
import { ReactComponent as CancelledIcon } from 'src/assets/svg/CancelledIcon.svg';
import { ReactComponent as CompletedIcon } from 'src/assets/svg/CompletedIcon.svg';
import { ReactComponent as IncompleteIcon } from 'src/assets/svg/incompleteScheduleStatus.svg';
import { ReactComponent as InProgressIcon } from 'src/assets/svg/InProgressIcon.svg';
import { ReactComponent as MissedIcon } from 'src/assets/svg/MissedIcon.svg';
import { ReactComponent as NotStartedIcon } from 'src/assets/svg/notStartedScheduleStatus.svg';
import { ReactComponent as UnassignedIcon } from 'src/assets/svg/UnassignedIcon.svg';
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

  /**
   * The Cancelled mark, greyed so it agrees with the card it describes.
   *
   * A cancelled visit's card is flat grey (`visitFillCancelled`, `#F6F7F9`) —
   * void, not absent, and nothing about it invites action — but
   * `CancelledIcon.svg` draws a red disc, so the legend was promising a red card
   * the grid stopped drawing.
   *
   * The grey is applied **here, at the legend's call site, rather than in the
   * asset**, because the asset is shared and red is still right in its other two
   * homes: the grid stamps card badges from `calendarIndicatorIcons` below, and
   * the visit drawer's status chip imports the same svg
   * (`shiftDetail/hitDetail/VisitAssignment.jsx`). Recolouring the file would
   * have changed all three from one edit.
   *
   * `grayscale(1)` rather than a fill override: the svg states its colours as
   * presentation attributes on half a dozen nested nodes, so overriding them
   * means selecting on hex literals a Figma re-export would silently invalidate.
   * The filter is the same idiom `scheduleCalendar.styles.js` already uses to
   * retire a card, and it keeps the white glyph legible — a flat `#F6F7F9`, the
   * card's own fill, would be an invisible mark on this white footer.
   */
  cancelledMark: {
    '& svg': {
      filter: 'grayscale(1)',
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
            className={
              status === calendarShiftStatusEnum.CANCELLED ? classes.cancelledMark : undefined
            }
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
