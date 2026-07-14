import styled from '@emotion/styled';
import { Avatar, Box, LinearProgress, linearProgressClasses, Typography } from '@mui/material';
import { ReactComponent as MapOnSiteIcon } from 'assets/svg/MapOnSiteIcon.svg?react';
import PropTypes from 'prop-types';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { calculatePercentage } from 'src/helper/utilityFunctions';
import useDateTime from 'src/hooks/useDateTime';
import { dayjsFormatsEnum } from 'src/utils/constants';
import { capitalizeFirstLetter } from 'src/utils/string/common';

import { useStyles } from './officerPopup.style';

const BorderLinearProgress = styled(LinearProgress)(({ theme }) => ({
  height: 10,
  borderRadius: 5,
  [`&.${linearProgressClasses.colorPrimary}`]: {
    backgroundColor: theme.palette.grey[200],
    ...theme.applyStyles('dark', {
      backgroundColor: theme.palette.grey[800],
    }),
  },
  [`& .${linearProgressClasses.bar}`]: {
    borderRadius: 5,
    backgroundColor: '#1a90ff',
    ...theme.applyStyles('dark', {
      backgroundColor: '#308fe8',
    }),
  },
}));

const OfficerPopup = ({ data }) => {
  const { t } = useTranslation();
  const classes = useStyles();

  const job = data?.data;
  const { formatDayjsDateTime } = useDateTime();

  return (
    <Box className={classes.modalWrapper}>
      <Box className={classes.textWrap}>
        <Box className={classes.textWrapInner}>
          <Typography variant="subtitle1" className={classes.headText}>
            {job?.site?.name}
          </Typography>
        </Box>
      </Box>
      <Box className={classes.offierLeft}>
        <Box className={classes.offierImage}>
          <Avatar
            alt={job?.site?.name}
            src={job?.officer?.image || '/static/images/avatar/1.jpg'}
          />
        </Box>

        <Box className={classes.jobDetails}>
          <Box className={classes.chipAndText}>
            <Typography variant="subtitle2">
              {capitalizeFirstLetter(job?.officer?.name) || t('commonText.nA')}
            </Typography>
            <Box className={classes.iconText}>
              <MapOnSiteIcon />
              <Typography variant="subtitle2">On site</Typography>
            </Box>
          </Box>
          <Box className={classes.inlineValue}>
            <Typography variant="subtitle3">L2</Typography>
            <Typography variant="subtitle3" className={classes.smallDot}>
              •
            </Typography>
            <Typography variant="subtitle3">👮🏻‍ ️️Dedicated</Typography>

            <Typography variant="subtitle3" className={classes.smallDot}>
              •
            </Typography>
            <Typography variant="subtitle3">
              {formatDayjsDateTime({ value: job?.startsAt, formatType: dayjsFormatsEnum.time })} -{' '}
              {formatDayjsDateTime({ value: job?.endsAt, formatType: dayjsFormatsEnum.time })}
            </Typography>
          </Box>
        </Box>
      </Box>
      <Box className={classes.progressBar}>
        <BorderLinearProgress
          variant="determinate"
          value={calculatePercentage(job?.completedTours, job?.totalTours)}
        />
      </Box>
      <Box className={classes.progressBarBottom}>
        <Typography variant="subtitle2">{job?.status || t('commonText.nA')}</Typography>
        <Typography variant="subtitle2">
          {`${job?.completedTours} / ${job?.totalTours} Tours`}
        </Typography>
      </Box>
    </Box>
  );
};

OfficerPopup.propTypes = {
  data: PropTypes.object,
};

export default OfficerPopup;
