import { Button, Typography } from '@mui/material';
import Box from '@mui/material/Box';
import PropTypes from 'prop-types';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import CustomDropDown from 'src/app/components/common/customDropDown';
import { Clossicon } from 'src/assets/svg';

import { useStyles } from './ActivityLogsDrawer';

const ActivityLogDrawer = ({ setShowDrawer }) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const closeDrawer = () => {
    setShowDrawer(false);
  };

  return (
    <Box className={classes.activityDrawer}>
      <Box className={classes.drawerHeader}>
        <Typography variant="h2">{t('obx.runsheet.activityLogs')}</Typography>
        <Button
          className={classes.cancelIcon}
          disableRipple
          variant="onlyText"
          onClick={() => {
            closeDrawer();
          }}
        >
          <Clossicon />
        </Button>
      </Box>

      <Box className={classes?.drawerInner}>
        <Box className={classes.reportsListingsHeader}>
          <Box className={classes.reportsListingsHeaderLeft}>
            <Box className={classes.reportsListingsFilters}>
              <CustomDropDown
                label={t('obx.shiftReports.filters.reports.label')}
                name="reportType"
                // options={templateTypes}
                // selectedValues={queryParams?.reportType || []}
                // handleChange={inputChangedHandler}
                searchPlaceholder={t('obx.shiftReports.filters.reports.search')}
                searchable={true}
                checkmark
                multiSelect={true}
                clearAll={true}
              />
            </Box>
          </Box>
          <Box className={classes.reportsListingsHeaderRight}>
            <Box className={classes.reportsListingsHeaderRightDate} />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

ActivityLogDrawer.propTypes = {
  setShowDrawer: PropTypes.func,
};

export default ActivityLogDrawer;
