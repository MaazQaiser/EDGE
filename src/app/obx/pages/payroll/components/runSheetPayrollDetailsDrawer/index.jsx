import { Box, Button, Typography } from '@mui/material';
import classNames from 'classnames';
import { t } from 'i18next';
import PropTypes from 'prop-types';
import React from 'react';
import { CloseIcon } from 'src/assets/svg';
import { ReactComponent as ClockIcon } from 'src/assets/svg/ClockIcon.svg?react';
import { useTenantLabel } from 'src/helper/utilityHooks';

import MissedHitsListing from './components/missedHitsListing';
import PayrollDetailsListing from './components/payrollDetailsListing';
import { useStyles } from './RunSheetPayrollDetailsDrawer';

const RunSheetPayrollDetailsDrawer = ({ setShowDrawer }) => {
  const classes = useStyles();
  const { getLabel } = useTenantLabel();

  // const NA = t('commonText.nA');

  const closeDrawer = () => {
    setShowDrawer(false);
  };

  return (
    <>
      <Box className={classes.drawerWrapper}>
        <Box className={classes.payrollHeader}>
          <Box className={classes.payrollDrawerHeader}>
            <Box className={classes.headerText}>
              <Typography variant="h4">{t('obx.payroll.runSheetPayrollDetails')}</Typography>
              <Box className={classes.textInlineRow}>
                <Typography variant="subtitle2" className={classes.darkText}>
                  Mike Ross
                </Typography>
                <Typography className={classes.smallDot}>•</Typography>
                <Typography variant="subtitle2">Orlando Daytime Runsheet</Typography>
                <Typography className={classes.smallDot}>•</Typography>
                <Typography variant="subtitle2">12/12/2024</Typography>
                <Typography className={classes.smallDot}>•</Typography>
                <Typography variant="subtitle2">8:40a - 4:40p (8h)</Typography>
              </Box>
            </Box>
            <a
              href="#"
              onClick={() => {
                closeDrawer();
              }}
            >
              <CloseIcon />
            </a>
          </Box>
          <Box className={classes.topStatsBar}>
            <Box className={classes.statValue}>
              <Typography variant="body2" className={classes.iconText}>
                <ClockIcon />
                {t('obx.payroll.punchInOut')}
              </Typography>
              <Typography variant="body2" className={classes.blueText}>
                8:40a - 4:40p (6.5h)
              </Typography>
            </Box>
            <Box className={classes.statValue}>
              <Typography variant="body2">
                {t('obx.payroll.totalHits', { hits: getLabel('terms', 'hits', t) })}
              </Typography>
              <Typography variant="body2" className={classes.blueText}>
                10
              </Typography>
            </Box>
            <Box className={classes.statValue}>
              <Typography variant="body2">
                {t('obx.payroll.completedHits', { hits: getLabel('terms', 'hits', t) })}
              </Typography>
              <Typography variant="body2" className={classes.blueText}>
                8
              </Typography>
            </Box>
            <Box className={classes.statValue}>
              <Typography variant="body2">
                {t('obx.payroll.missedHits', { hits: getLabel('terms', 'hits', t) })}
              </Typography>
              <Typography variant="body2" className={classes.blueText}>
                2
              </Typography>
            </Box>
          </Box>
        </Box>
        <Box className={classes.tableWrapper}>
          <PayrollDetailsListing />
          <Typography variant="h4" className={classes.misshitText}>
            {t('obx.payroll.missedHits', { hits: getLabel('terms', 'hits', t) })}
          </Typography>
          <MissedHitsListing />
        </Box>
        <Box className={classes.footerArea}>
          <Box className={classes.bottomStatsBarLeft}>
            <Box className={classes.statValue}>
              <Typography variant="body2">{t('obx.payroll.totalApprovedHours')}</Typography>
              <Typography variant="h5" className={classes.blueText}>
                7.5
              </Typography>
            </Box>
            <Box className={classes.statValue}>
              <Typography variant="body2">{t('obx.payroll.timeOnJobHrs')}</Typography>
              <Typography variant="h5" className={classes.blueText}>
                7.5
              </Typography>
            </Box>
            <Box className={classes.statValue}>
              <Typography variant="body2">{t('obx.payroll.timeOnBreakHrs')}</Typography>
              <Typography variant="h5" className={classes.blueText}>
                0.5
              </Typography>
            </Box>
          </Box>
          <Box className={classes.bottomRight}>
            <Box className={classNames(classes.statValue, classes.redValue)}>
              <Typography variant="body2">{t('obx.payroll.gapsOverlappingTimeEntries')}</Typography>
              <Typography variant="h5" className={classes.redText}>
                3
              </Typography>
            </Box>
            <Box className={classNames(classes.statValue, classes.purpleValue)}>
              <Typography variant="body2">{t('obx.payroll.modifiedEntities')}</Typography>
              <Typography variant="h5" className={classes.purpleText}>
                10
              </Typography>
            </Box>

            <Button variant="primary">{t('obx.invoice.createInvoice')}</Button>
          </Box>
        </Box>
      </Box>
    </>
  );
};
RunSheetPayrollDetailsDrawer.propTypes = {
  setShowDrawer: PropTypes.func,
};

RunSheetPayrollDetailsDrawer.defaultProps = {
  setShowDrawer: () => {},
};

export default RunSheetPayrollDetailsDrawer;
