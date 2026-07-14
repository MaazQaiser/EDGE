import { Avatar, Box, Typography } from '@mui/material';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ReactComponent as CarIcon } from 'src/assets/svg/carImage.svg?react';
import useDateTime from 'src/hooks/useDateTime';
import { dayjsFormatsEnum, defaultImage } from 'src/utils/constants';
import capitalize from 'src/utils/string/capitalize';

import { useStyles } from './reportProfile.styles';
const status_enum = {
  submitted: 'Pending',
  accepted: 'Approved',
  rejected: 'Rejected',
  not_submitted: 'Pending',
};

const ReportProfile = ({ officer, submittedAt, status = '' }) => {
  const { formatDayjsDateTime } = useDateTime();

  const classes = useStyles();
  const { t } = useTranslation();
  const NA = t('commonText.nA');
  return (
    <Box className={classes.reportProfile}>
      <Box className={classes.reportProfileLeft}>
        <Avatar src={defaultImage} className={classes.reportProfileAvatar} />
        <Box className={classes.reportProfileInfo}>
          <Typography variant="h1" className={classes.reportProfileInfoTitle}>
            {capitalize(officer?.name) || NA}
          </Typography>
          <Typography variant="body3" className={classes.reportProfileInfoText}>
            <Box component="span">
              {t('obx.schedules.assignDedicatedDuty.toursAndReports.reports.details.level')}{' '}
              {officer?.level}
            </Box>
            •
            <Box component="span">
              <CarIcon />
            </Box>
            <Box component="span" className={classes.reportCap}>
              {officer?.type}
            </Box>
          </Typography>
        </Box>
      </Box>
      <Box className={classes.reportProfileRight}>
        <Box className={classes.reportProfileContent}>
          {submittedAt && (
            <>
              <Typography className={classes.reportProfileContentTitle} variant="body3">
                {t(
                  'obx.schedules.assignDedicatedDuty.toursAndReports.reports.details.submittedTime',
                )}
              </Typography>

              <Typography className={classes.reportProfileContentText} variant="body2">
                {formatDayjsDateTime({
                  value: submittedAt,
                  formatType: dayjsFormatsEnum.time,
                })}
              </Typography>
            </>
          )}
        </Box>
        <Box>
          {submittedAt && (
            <>
              <Typography className={classes.reportProfileContentTitle} variant="body3">
                {t(
                  'obx.schedules.assignDedicatedDuty.toursAndReports.reports.details.submittedDate',
                )}
              </Typography>

              <Typography className={classes.reportProfileContentText} variant="body2">
                {formatDayjsDateTime({ value: submittedAt, formatType: dayjsFormatsEnum.date })}
              </Typography>
            </>
          )}
        </Box>
        <Box>
          <Typography className={classes.reportProfileContentTitle} variant="body3">
            {t('obx.schedules.assignDedicatedDuty.toursAndReports.reports.details.status')}
          </Typography>
          <Typography
            variant="caption"
            className={classNames(classes.reportProfileStatus, classes.reportProfileStatusPending)}
          >
            {status_enum[status]}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

ReportProfile.propTypes = {
  officer: PropTypes.object,
  submittedAt: PropTypes.string,
  status: PropTypes.string,
};

export default ReportProfile;
