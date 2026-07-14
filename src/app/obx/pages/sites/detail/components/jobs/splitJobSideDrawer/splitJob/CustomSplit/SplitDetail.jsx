import { Box, Chip, Typography } from '@mui/material';
import { ReactComponent as AlertIcon } from 'assets/svg/alertCircle.svg?react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { convertMinutesToHMFormat } from 'src/helper/utilityFunctions';

import { useStyles } from '../../splitJob.styles';

const SplitDetail = ({ shiftDetail }) => {
  const classes = useStyles();
  const { t } = useTranslation();

  return (
    <Box className={classes.splitCustomDutyDivider}>
      <Box className={classes.splitCustomInfo}>
        <Box className={classes.splitCustomInfoBox}>
          <Typography variant="body2" className={classes.splitCustomInfoTitle}>
            {t('obx.schedules.assignDedicatedDuty.splitDuties.splitType.custom.shiftDuration')}:
          </Typography>
          <Typography variant="h5" className={classes.splitCustomInfoText}>
            {convertMinutesToHMFormat(shiftDetail?.durationInHrsForWeek * 60)}
          </Typography>
        </Box>
        <Box className={classes.splitCustomInfoBox}>
          <Typography variant="body2" className={classes.splitCustomInfoTitle}>
            {t('obx.schedules.assignDedicatedDuty.splitDuties.splitType.custom.allocatedHours')}:
          </Typography>
          <Typography variant="h5" className={classes.splitCustomInfoText}>
            {convertMinutesToHMFormat(shiftDetail?.allocatedHoursForWeek * 60)}
          </Typography>
        </Box>
        <Chip
          icon={<AlertIcon />}
          className={classes.splitCustomInfoStatus}
          color="error"
          label={t(
            'obx.schedules.assignDedicatedDuty.splitDuties.splitType.custom.unallocatedHours',
            {
              time: `${shiftDetail?.unallocatedHoursForWeek < 0 ? '-' : ''}${convertMinutesToHMFormat(Math.abs(shiftDetail?.unallocatedHoursForWeek) * 60)}`,
            },
          )}
        />
      </Box>
    </Box>
  );
};

export default SplitDetail;

SplitDetail.propTypes = {
  shiftDetail: PropTypes.object,
  splittedShifts: PropTypes.array,
  setShiftDetail: PropTypes.func,
};
