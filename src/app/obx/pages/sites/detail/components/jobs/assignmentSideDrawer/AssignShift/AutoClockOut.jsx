import { Box, Skeleton, Switch, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getCurrentStandardTimeInIsoWrtTimezone } from 'src/app/obx/pages/schedules/helper';
import { fetchShiftDetailById } from 'src/services/duty.services';
import { toggleAutoCheckoutStatus } from 'src/services/runsheet.services';
import { toastSettings } from 'src/utils/constants';
import { ShiftStatus } from 'src/utils/constants/schedules';
import { toaster } from 'src/utils/toast';

import { useStyles } from '../assignmentSideDrawer.styles';

const AutoClockOut = ({ shiftDetail }) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const [autoShiftToggle, setAutoShiftToggle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAutoClockoutStatus = async () => {
      if (!shiftDetail?.logId || !shiftDetail?.shiftDateInISO) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetchShiftDetailById({
          shiftId: shiftDetail?.logId,
          shiftDate: shiftDetail?.shiftDateInISO,
        });

        if (response?.data?.shift) {
          setAutoShiftToggle(response.data.shift.autoClockoutOff);
        }
      } catch (error) {
        toaster.error({
          text: error?.message,
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAutoClockoutStatus();
  }, [shiftDetail?.logId, shiftDetail?.shiftDateInISO]);

  const isDisabled =
    getCurrentStandardTimeInIsoWrtTimezone() >= shiftDetail?.endsAt ||
    [ShiftStatus.SHIFT_ENDED, ShiftStatus.SHIFT_AUTO_ENDED].includes(shiftDetail?.shiftStatus);

  const toggleAutoClockout = async () => {
    try {
      const response = await toggleAutoCheckoutStatus(shiftDetail?.logId);
      if (response && response?.statusCode === 200) {
        // Update state based on response or toggle current state
        const updatedStatus = response?.data?.autoClockoutOff ?? !autoShiftToggle;
        setAutoShiftToggle(updatedStatus);
      }
    } catch (error) {
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };

  if (loading) {
    return (
      <Box className={classes.thisShiftSettingRow}>
        <Box className={classes.thisShiftSettingText}>
          <Skeleton variant="text" width={200} height={28} />
          <Skeleton variant="text" width={400} height={20} style={{ marginTop: 8 }} />
        </Box>
        <Skeleton variant="rectangular" width={44} height={24} />
      </Box>
    );
  }

  return (
    <Box className={classes.thisShiftSettingRow}>
      <Box className={classes.thisShiftSettingText}>
        <Typography variant="h5">
          {t('obx.schedules.assignDedicatedDuty.assignShift.autoClockout.title')}
        </Typography>
        <Typography variant="body2" className={classes.thisShiftSettingTextDescription}>
          {t('obx.schedules.assignDedicatedDuty.assignShift.autoClockout.description')}
        </Typography>
      </Box>
      <Switch
        size="small"
        checked={!autoShiftToggle}
        onChange={toggleAutoClockout}
        className={classes.thisShiftSwitch}
        disabled={isDisabled}
      />
    </Box>
  );
};

export default AutoClockOut;

AutoClockOut.propTypes = {
  shiftDetail: PropTypes.object.isRequired,
};
