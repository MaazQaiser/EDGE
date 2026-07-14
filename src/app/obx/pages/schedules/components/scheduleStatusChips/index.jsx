import { Chip } from '@mui/material';
import { makeStyles } from '@mui/styles';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { calendarShiftStatusEnum } from 'src/utils/constants/schedules';

import { calendarShiftStatusValues } from '../scheduleStatusIcons';

const useStyles = makeStyles((_theme) => ({
  purpleChip: {
    '&.MuiChip-root.MuiChip-filled': {
      backgroundColor: '#F4EDFD',
      color: '#9747FF',
    },
  },
}));

const statusColorVariant = {
  [calendarShiftStatusEnum.NOT_STARTED]: 'warning',
  [calendarShiftStatusEnum.IN_PROGRESS]: 'primary',
  [calendarShiftStatusEnum.COMPLETED]: 'success',
  [calendarShiftStatusEnum.MISSED]: 'error',
  [calendarShiftStatusEnum.INCOMPLETE]: 'error',
  [calendarShiftStatusEnum.CANCELLED]: 'error',
  [calendarShiftStatusEnum.UNASSIGNED]: 'error',
  //   [calendarShiftStatusEnum.UPCOMING]: '',
};

export const ScheduleStatusChips = ({ scheduleStatus }) => {
  const classes = useStyles();
  const { t } = useTranslation();

  return (
    <Chip
      label={calendarShiftStatusValues(t)?.[scheduleStatus]}
      size="small"
      {...(scheduleStatus === calendarShiftStatusEnum.UPCOMING
        ? { className: classes.purpleChip }
        : { color: statusColorVariant[scheduleStatus] })}
    />
  );
};

ScheduleStatusChips.propTypes = {
  scheduleStatus: PropTypes.string,
};
