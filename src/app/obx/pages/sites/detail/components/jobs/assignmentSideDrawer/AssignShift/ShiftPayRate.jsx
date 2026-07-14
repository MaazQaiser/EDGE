import { Box, Switch, Typography } from '@mui/material';
import React, { useState } from 'react';
import { useCurrency } from 'src/hooks/useCurrency';

import { useStyles } from '../assignmentSideDrawer.styles';

const ShiftPayRate = () => {
  const classes = useStyles();
  const { currency: franchiseCurrency } = useCurrency();

  const [payRateOverrideEnabled, setPayRateOverrideEnabled] = useState(true);

  return (
    <Box>
      <Box className={classes.thisShiftSettingRow}>
        <Box className={classes.thisShiftSettingText}>
          <Typography variant="h5" className={classes.thisShiftSettingTextTitle}>
            {`${t('obx.schedules.assignDedicatedDuty.assignShift.shiftPayRate.title')} (${franchiseCurrency})`}
          </Typography>
          <Typography variant="body2" className={classes.thisShiftSettingTextDescription}>
            {t('obx.schedules.assignDedicatedDuty.assignShift.shiftPayRate.description')}
          </Typography>
        </Box>
        <Switch
          size="small"
          checked={payRateOverrideEnabled}
          onChange={(e) => setPayRateOverrideEnabled(e.target.checked)}
          className={classes.thisShiftSwitch}
        />
      </Box>
      {/* <Box>
        <WageRateOverrideInput
          name="shiftPayRate"
          label={t('obx.schedules.assignDedicatedDuty.assignShift.shiftRateOverride')}
          tooltipTitle={t('obx.schedules.assignDedicatedDuty.assignShift.shiftRateOverrideTooltip')}
          placeholder={t('obx.contracts.rateOverride.placeholder')}
          onChange={handleInputChange}
          errorMessages={{ shiftPayRate: assignmentValue?.shiftPayRate?.error?.value }}
          currentValue={assignmentValue?.shiftPayRate?.value}
          disabled={!userHasPermission(ACL_OBX_SHIFT_RATE_UPDATE)}
          hideLabel
        />
      </Box> */}
    </Box>
  );
};

export default ShiftPayRate;
