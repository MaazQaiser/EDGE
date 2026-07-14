import { Box, Chip, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { getTimeDiff } from 'src/app/obx/pages/schedules/helper';
import { useTenantLabel } from 'src/helper/utilityHooks';
import useDateTime from 'src/hooks/useDateTime';
import { dayjsFormatsEnum } from 'src/utils/constants';
import { capitalizeFirstLetter } from 'src/utils/string/common';

import { useStyles } from './runSheetPopup.style';

const RunSheetPopup = ({ data }) => {
  const { t } = useTranslation();
  const { getLabel } = useTenantLabel();
  const classes = useStyles();
  const { formatDayjsDateTime } = useDateTime();
  return (
    <Box className={classes.modalWrapper}>
      <Box className={classes.textWrap}>
        <Box className={classes.textWrapInner}>
          <Typography variant="h4" className={classes.headText}>
            {capitalizeFirstLetter(data?.data?.runsheetName) || t('commonText.nA')}
          </Typography>
          <Chip
            color="primary"
            size="small"
            label={t('obx.runsheet.patrol', {
              patrol: getLabel('terms', 'patrol', t),
            })}
          />
        </Box>
      </Box>
      <Box>
        <Typography variant="body3" className={classes.secondText}>
          {t('obx.runsheet.estimatedTime', {
            runsheet: getLabel('terms', 'runsheet', t).toLowerCase(),
          })}
        </Typography>{' '}
        <Typography variant="body3" className={classes.thirdText}>
          {formatDayjsDateTime({ value: data?.data?.startsAt, formatType: dayjsFormatsEnum.time })}{' '}
          - {formatDayjsDateTime({ value: data?.data?.endsAt, formatType: dayjsFormatsEnum.time })}{' '}
          ({getTimeDiff(data?.data?.startsAt, data?.data?.endsAt, 'hour')}h)
        </Typography>
      </Box>
    </Box>
  );
};

RunSheetPopup.propTypes = {
  data: PropTypes.object,
};

export default RunSheetPopup;
