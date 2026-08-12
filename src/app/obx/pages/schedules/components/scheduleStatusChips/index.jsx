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
  /**
   * In progress is blue, explicitly — not MUI `primary`.
   *
   * `primary` resolves to the tenant brand, so on a green-branded tenant the
   * "In Progress" chip rendered green while the matching visit card and its
   * label were blue. Live work is blue in the state system; the chip has to say
   * the same thing whatever the brand happens to be.
   */
  blueChip: {
    '&.MuiChip-root.MuiChip-filled': {
      backgroundColor: '#EFF8FF',
      color: '#175CD3',
    },
  },
}));

const statusColorVariant = {
  [calendarShiftStatusEnum.NOT_STARTED]: 'warning',
  [calendarShiftStatusEnum.COMPLETED]: 'success',
  [calendarShiftStatusEnum.MISSED]: 'error',
  [calendarShiftStatusEnum.INCOMPLETE]: 'error',
  [calendarShiftStatusEnum.CANCELLED]: 'error',
  [calendarShiftStatusEnum.UNASSIGNED]: 'error',
  //   [calendarShiftStatusEnum.UPCOMING]: '',
};

/** Statuses whose colour is set explicitly rather than via a MUI palette slot. */
const STATUS_CHIP_CLASS_KEYS = {
  [calendarShiftStatusEnum.UPCOMING]: 'purpleChip',
  [calendarShiftStatusEnum.IN_PROGRESS]: 'blueChip',
  [calendarShiftStatusEnum.SHIFT_STARTED]: 'blueChip',
};

export const ScheduleStatusChips = ({ scheduleStatus }) => {
  const classes = useStyles();
  const { t } = useTranslation();

  const explicitClassKey = STATUS_CHIP_CLASS_KEYS[scheduleStatus];

  return (
    <Chip
      label={calendarShiftStatusValues(t)?.[scheduleStatus]}
      size="small"
      {...(explicitClassKey
        ? { className: classes[explicitClassKey] }
        : { color: statusColorVariant[scheduleStatus] })}
    />
  );
};

ScheduleStatusChips.propTypes = {
  scheduleStatus: PropTypes.string,
};
