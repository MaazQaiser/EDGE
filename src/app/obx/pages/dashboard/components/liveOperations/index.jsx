import { Box, Skeleton, Tooltip, Typography } from '@mui/material';
import { ReactComponent as ToolTipIcon } from 'assets/icons/info.svg?react';
import PropTypes from 'prop-types';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useTenantLabel } from 'src/helper/utilityHooks';
import { fomatNumbersWithCommas } from 'src/utils/currencyFormater';

import { useStyles } from '../../dashboardStyles.js';

function LiveOperations({ data, isLoading }) {
  const classes = useStyles();
  const { t } = useTranslation();
  const { getLabel } = useTenantLabel();
  return (
    <Box className={classes.LiveOperations}>
      <Box className={classes.headerWrapper}>
        <Typography className={classes.LiveOperationsTitle}>
          {t('obx.dashboard.liveOperations')}
          <Tooltip
            arrow
            slotProps={{
              popper: {
                modifiers: [
                  {
                    name: 'offset',
                    options: {
                      offset: [0, -14],
                    },
                  },
                ],
                sx: { cursor: 'pointer' },
              },
            }}
            title={
              <Box className={classes.tootlipWrapper}>
                <Typography variant="subtitle3" component={'li'} className={classes.tooltipStyle}>
                  <b>{t('obx.dashboard.liveOperationsTooltip.tooltip.unassignedShifts.title')}</b>
                  {t('obx.dashboard.liveOperationsTooltip.tooltip.unassignedShifts.description')}
                </Typography>

                <Typography component={'li'} variant="subtitle3" className={classes.tooltipStyle}>
                  <b>{t('obx.dashboard.liveOperationsTooltip.tooltip.nonFunctionalSites.title')}</b>
                  {t('obx.dashboard.liveOperationsTooltip.tooltip.nonFunctionalSites.description')}
                </Typography>
                <Typography component={'li'} variant="subtitle3" className={classes.tooltipStyle}>
                  <b>{t('obx.dashboard.liveOperationsTooltip.tooltip.timeOffRequests.title')}</b>
                  {t('obx.dashboard.liveOperationsTooltip.tooltip.timeOffRequests.description')}
                </Typography>
                <Typography component={'li'} variant="subtitle3" className={classes.tooltipStyle}>
                  <b>{t('obx.dashboard.liveOperationsTooltip.tooltip.reportApprovals.title')}</b>
                  {t('obx.dashboard.liveOperationsTooltip.tooltip.reportApprovals.description')}
                </Typography>
                <Typography component={'li'} variant="subtitle3" className={classes.tooltipStyle}>
                  <b>
                    {t('obx.dashboard.liveOperationsTooltip.tooltip.officersTimeOff.title', {
                      officers: getLabel('terms', 'officers', t),
                    })}
                  </b>
                  {t('obx.dashboard.liveOperationsTooltip.tooltip.officersTimeOff.description', {
                    officers: getLabel('terms', 'officers', t),
                  })}
                </Typography>
                <Typography component={'li'} variant="subtitle3" className={classes.tooltipStyle}>
                  <b>
                    {t('obx.dashboard.liveOperationsTooltip.tooltip.officersAbsent.title', {
                      officers: getLabel('terms', 'officers', t),
                    })}
                  </b>
                  {t('obx.dashboard.liveOperationsTooltip.tooltip.officersAbsent.description', {
                    officers: getLabel('terms', 'officers', t),
                  })}
                </Typography>
                <Typography component={'li'} variant="subtitle3" className={classes.tooltipStyle}>
                  <b>
                    {t('obx.dashboard.liveOperationsTooltip.tooltip.missedHits.title', {
                      hits: getLabel('terms', 'hits', t),
                    })}
                  </b>
                  {t('obx.dashboard.liveOperationsTooltip.tooltip.missedHits.description', {
                    hits: getLabel('terms', 'hits', t),
                  })}
                </Typography>
              </Box>
            }
            slots={<Box />}
            placement="bottom"
          >
            <ToolTipIcon />
          </Tooltip>
        </Typography>
      </Box>
      <Box className={classes.liveOperationsWrapper}>
        <Box className={classes.listLive}>
          <Box className={classes.metricListLive}>
            <Typography
              variant="body2"
              className={classes.labelStyles}
              color={data?.unassingedJobs?.textColour}
            >
              {!isLoading && data?.unassingedJobs?.name}
              {isLoading && <Skeleton animation="wave" variant="rounded" width={120} height={13} />}
            </Typography>
            <Typography
              variant="h5"
              className={classes.valueStyles}
              color={data?.unassingedJobs?.valueColour}
            >
              {!isLoading && fomatNumbersWithCommas(data?.unassingedJobs?.value)}
              {isLoading && <Skeleton animation="wave" variant="rounded" width={50} height={12} />}
            </Typography>
          </Box>
          <Box className={classes.metricListLive}>
            <Typography
              variant="body2"
              className={classes.labelStyles}
              color={data?.nonFunctionalSites?.textColour}
            >
              {!isLoading && data?.nonFunctionalSites?.name}
              {isLoading && <Skeleton animation="wave" variant="rounded" width={120} height={13} />}
            </Typography>
            <Typography
              variant="h5"
              className={classes.valueStyles}
              color={data?.nonFunctionalSites?.valueColour}
            >
              {!isLoading && fomatNumbersWithCommas(data?.nonFunctionalSites?.value)}
              {isLoading && <Skeleton animation="wave" variant="rounded" width={50} height={12} />}
            </Typography>
          </Box>

          <Box className={classes.metricListLive}>
            <Typography
              variant="body2"
              className={classes.labelStyles}
              color={data?.timeOffRequest?.textColour}
            >
              {!isLoading && data?.timeOffRequest?.name}
              {isLoading && <Skeleton animation="wave" variant="rounded" width={120} height={13} />}
            </Typography>
            <Typography
              variant="h5"
              className={classes.valueStyles}
              color={data?.timeOffRequest?.valueColour}
            >
              {!isLoading && fomatNumbersWithCommas(data?.timeOffRequest?.value)}
              {isLoading && <Skeleton animation="wave" variant="rounded" width={50} height={12} />}
            </Typography>
          </Box>

          <Box className={classes.metricListLive}>
            <Typography
              variant="body2"
              className={classes.labelStyles}
              color={data?.officerOnTimeOff?.textColour}
            >
              {!isLoading && data?.officerOnTimeOff?.name}
              {isLoading && <Skeleton animation="wave" variant="rounded" width={120} height={13} />}
            </Typography>
            <Typography
              variant="h5"
              className={classes.valueStyles}
              color={data?.officerOnTimeOff?.valueColour}
            >
              {!isLoading && fomatNumbersWithCommas(data?.officerOnTimeOff?.value)}
              {isLoading && <Skeleton animation="wave" variant="rounded" width={50} height={12} />}
            </Typography>
          </Box>

          <Box className={classes.metricListLive}>
            <Typography
              variant="body2"
              className={classes.labelStyles}
              color={data?.absentOfficer?.textColour}
            >
              {!isLoading && data?.absentOfficer?.name}
              {isLoading && <Skeleton animation="wave" variant="rounded" width={120} height={13} />}
            </Typography>
            <Typography
              variant="h5"
              className={classes.valueStyles}
              color={data?.absentOfficer?.valueColour}
            >
              {!isLoading && fomatNumbersWithCommas(data?.absentOfficer?.value)}
              {isLoading && <Skeleton animation="wave" variant="rounded" width={50} height={12} />}
            </Typography>
          </Box>

          <Box className={classes.metricListLive}>
            <Typography
              variant="body2"
              className={classes.labelStyles}
              color={data?.missedHits?.textColour}
            >
              {!isLoading && data?.missedHits?.name}
              {isLoading && <Skeleton animation="wave" variant="rounded" width={120} height={13} />}
            </Typography>
            <Typography
              variant="h5"
              className={classes.valueStyles}
              color={data?.missedHits?.valueColour}
            >
              {!isLoading && fomatNumbersWithCommas(data?.missedHits?.value)}
              {isLoading && <Skeleton animation="wave" variant="rounded" width={50} height={12} />}
            </Typography>
          </Box>

          <Box className={classes.metricListLive}>
            <Typography
              variant="body2"
              className={classes.labelStyles}
              color={data?.dispatchNewAlarms?.textColour}
            >
              {!isLoading && data?.dispatchNewAlarms?.name}
              {isLoading && <Skeleton animation="wave" variant="rounded" width={120} height={13} />}
            </Typography>
            <Typography
              variant="h5"
              className={classes.valueStyles}
              color={data?.dispatchNewAlarms?.valueColour}
            >
              {!isLoading && fomatNumbersWithCommas(data?.dispatchNewAlarms?.value)}
              {isLoading && <Skeleton animation="wave" variant="rounded" width={50} height={12} />}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

LiveOperations.propTypes = {
  data: PropTypes.object,
  isLoading: PropTypes.bool,
};

export default LiveOperations;
