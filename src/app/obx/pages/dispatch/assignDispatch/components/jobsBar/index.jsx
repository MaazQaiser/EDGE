import {
  Avatar,
  Box,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import { useTranslation } from 'react-i18next';
import useDateTime from 'src/hooks/useDateTime';
import { _statusEnum, dayjsFormatsEnum } from 'src/utils/constants';
import { capitalizeFirstLetter } from 'src/utils/string/common';

import { useStyles } from './JobsBar.style';

const JobsBar = ({ job, selectedJob, handleJobChange, type }) => {
  const classes = useStyles();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down(768));
  const { t } = useTranslation();
  const NA = t('commonText.nA');
  const { formatDayjsDateTime } = useDateTime();

  const onclick = () => {
    handleJobChange(job);
  };

  let statusClass = classes[_statusEnum(t)?.[job?.status]?.statusClass || 'commonStageColor'];
  return (
    <Box className={classes.jobGrayBar} onClick={onclick}>
      <Box className={classes.jobDetails}>
        <Box className={classes.chipAndText}>
          {type === 'dedicated' || type === 'patrolSupervisors' ? (
            <Box className={classes.inlineValue}>
              {type === 'patrolSupervisors' && (
                <Avatar alt={job?.name || 'User'} src={job?.imageUrl} />
              )}
              {(() => {
                const fullText =
                  (capitalizeFirstLetter(job?.name) || NA) +
                  (type !== 'patrolSupervisors'
                    ? ` - ${job?.site?.name || ''} (${formatDayjsDateTime({ value: job?.startsAt, formatType: dayjsFormatsEnum.time })} 
                    - ${formatDayjsDateTime({ value: job?.endsAt, formatType: dayjsFormatsEnum.time })})`
                    : '');
                const typography = (
                  <Typography className={classes.jobTitleText}>{fullText}</Typography>
                );
                return isMobile ? (
                  <Tooltip title={fullText} arrow>
                    {typography}
                  </Tooltip>
                ) : (
                  typography
                );
              })()}
            </Box>
          ) : (
            <Typography className={classes.jobTitleText}>
              {capitalizeFirstLetter(job?.runsheetName) || NA}
            </Typography>
          )}

          <Box component="span" className={classNames(classes.commonStageColor, statusClass)}>
            {_statusEnum(t)
              ?.[job?.status]?.title?.toLowerCase()
              ?.split('_')
              ?.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
              ?.join(' ') || NA}
          </Box>
        </Box>
        <Box className={classes.inlineValueTwo}>
          {type !== 'patrolSupervisors' ? (
            <Box className={classes.timeRange}>
              <Typography variant="subtitle3">
                {formatDayjsDateTime({
                  value: job.startsAt,
                  formatType: dayjsFormatsEnum.dateTime,
                })}
              </Typography>
              <Typography>-</Typography>
              <Typography variant="subtitle3">
                {formatDayjsDateTime({
                  value: job.endsAt,
                  formatType: dayjsFormatsEnum.dateTime,
                })}
              </Typography>
            </Box>
          ) : (
            <Typography variant="subtitle3">{job?.role}</Typography>
          )}
          <Typography variant="subtitle3" className={classes.smallDot}>
            •
          </Typography>
          {type !== 'patrolSupervisors' ? (
            <Box className={classes.inlineValueTwoWrapper}>
              <Avatar alt="Remy Sharp" src={job?.officer?.image} />
              <Typography variant="subtitle3">
                {capitalizeFirstLetter(job?.officer?.name) || NA}
              </Typography>
              {job?.officer?.phoneNumber && (
                <Typography variant="subtitle3">({job?.officer?.phoneNumber})</Typography>
              )}
            </Box>
          ) : (
            job?.phoneNumber && <Typography variant="subtitle3">({job?.phoneNumber})</Typography>
          )}
        </Box>
      </Box>
      <Box className={classes.jobCheckbox}>
        <FormControl>
          <RadioGroup
            aria-labelledby="demo-controlled-radio-buttons-group"
            name="controlled-radio-buttons-group"
          >
            <FormControlLabel
              value="Select"
              control={
                <Radio key={job?.uniqueId} checked={job?.uniqueId === selectedJob?.uniqueId} />
              }
              label={t('commonText.select')}
            />
          </RadioGroup>
        </FormControl>
      </Box>
    </Box>
  );
};

JobsBar.propTypes = {
  job: PropTypes.object,
  selectedJob: PropTypes.object,
  handleJobChange: PropTypes.func,
  type: PropTypes.string,
};

export default JobsBar;
