import { Box } from '@mui/material';
import { makeStyles } from '@mui/styles';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import DutyIndicator from 'src/app/components/obxComponents/dutyIndicator';
import { ACL_OBX_SITE_EXTRA_JOB_VIEW } from 'src/app/router/constant/OBXMODULE';
import { useTenantLabel } from 'src/helper/utilityHooks';
import userHasPermission from 'src/utils/auth/userHasPermission';
import { SCHEDULE_DUTIES } from 'src/utils/constants/schedules';

import { DUTY_COLORS } from '../../helper/scheduleColors';

const useStyles = makeStyles((theme) => ({
  scheduleCalendarIndicators: {
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
    background: theme.palette.surfaceWhite,
    padding: '0 0px 0px',
  },
}));

const ScheduleIndicators = () => {
  const classes = useStyles();
  const { t } = useTranslation();
  const { getLabel } = useTenantLabel();
  const services = useSelector((state) => state.auth.tenantInfo?.services || {});

  return (
    <Box className={classes.scheduleCalendarIndicators}>
      {services?.dedicated === true ? (
        <DutyIndicator
          color={DUTY_COLORS[SCHEDULE_DUTIES.DEDICATED]}
          label={getLabel('terms', 'dedicated', t)}
        ></DutyIndicator>
      ) : null}
      {services?.patrol === true ? (
        <DutyIndicator
          color={DUTY_COLORS[SCHEDULE_DUTIES.PATROL]}
          label={getLabel('terms', 'patrol', t)}
        ></DutyIndicator>
      ) : null}
      {services?.extra === true && userHasPermission(ACL_OBX_SITE_EXTRA_JOB_VIEW) ? (
        <DutyIndicator
          color={DUTY_COLORS[SCHEDULE_DUTIES.EXTRA]}
          label={getLabel('terms', 'extra', t)}
        ></DutyIndicator>
      ) : null}
      {services?.dispatch === true ? (
        <DutyIndicator
          color={DUTY_COLORS[SCHEDULE_DUTIES.DISPATCH]}
          label={getLabel('terms', 'dispatch', t)}
        ></DutyIndicator>
      ) : null}
      {/* <DutyIndicator color="#E43F32" label={t('obx.schedules.legends.attention')}></DutyIndicator> */}
    </Box>
  );
};

export default ScheduleIndicators;
