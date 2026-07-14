import { Box, Tooltip } from '@mui/material';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { isShiftScheduleFullyCancelled } from 'src/app/obx/pages/schedules/helper';
import { ReactComponent as InfoIcon } from 'src/assets/svg/infoCurrentColor.svg?react';

const ShiftFullyCancelledInfoIcon = ({ shift, iconClassName, wrapperClassName }) => {
  const { t } = useTranslation();

  if (!isShiftScheduleFullyCancelled(shift)) {
    return null;
  }

  return (
    <Tooltip
      arrow
      placement="top"
      title={t('obx.schedules.assignDedicatedDuty.assignShift.shiftScheduleFullyCancelledTooltip')}
    >
      <Box
        component="span"
        className={wrapperClassName}
        sx={{ display: 'inline-flex', lineHeight: 0, cursor: 'pointer' }}
        onClick={(event) => event.stopPropagation()}
      >
        <InfoIcon className={iconClassName} />
      </Box>
    </Tooltip>
  );
};

ShiftFullyCancelledInfoIcon.propTypes = {
  shift: PropTypes.object,
  iconClassName: PropTypes.string,
  wrapperClassName: PropTypes.string,
};

ShiftFullyCancelledInfoIcon.defaultProps = {
  shift: {},
  iconClassName: '',
  wrapperClassName: '',
};

export default ShiftFullyCancelledInfoIcon;
