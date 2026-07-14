import { Box, Typography } from '@mui/material';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { useStyles } from '../dealsStyles';

const Locations = () => {
  const { t } = useTranslation();
  const classes = useStyles();
  return (
    <>
      <Box className={classes.header}>
        <Typography variant="h4" className={classes.title}>
          {t('obx.settings.preferences.mappingPreferences.locationsData.settingTitle')}
        </Typography>
        <Typography variant="body2" className={classes.tagline}>
          {t('obx.settings.preferences.mappingPreferences.locationsData.tagLine')}
        </Typography>
      </Box>
      <Box className={classes.tableWrapperOne}>
        <Box className={classes.timeHeader}>
          <Typography variant="subtitle3" className={classes.tableCalendarHeading}>
            {t(
              'obx.settings.preferences.mappingPreferences.locationsData.table.columnsHeader.stages',
            )}
          </Typography>
          <Typography variant="subtitle3" className={classes.tableCalendarHeading}>
            {t(
              'obx.settings.preferences.mappingPreferences.locationsData.table.columnsHeader.mapTo',
            )}
          </Typography>
        </Box>
      </Box>
    </>
  );
};

export default Locations;
