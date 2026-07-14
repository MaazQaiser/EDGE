import { Button, Typography } from '@mui/material';
import Box from '@mui/material/Box';
import PropTypes from 'prop-types';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Clossicon } from 'src/assets/svg';
import { useTenantLabel } from 'src/helper/utilityHooks';

import NewHitsAccordionListing from '../newHitsAccordionListing';
import { useStyles } from './removedHitsDrawer';

const RemovedHits = ({ setShowDrawer, excludedHits }) => {
  const { t } = useTranslation();
  const { getLabel } = useTenantLabel();
  const classes = useStyles();
  const closeDrawer = () => {
    setShowDrawer(false);
  };

  return (
    <Box className={classes.activityDrawer}>
      <Box className={classes.drawerHeader}>
        <Box className={classes.drawerHeaderTop}>
          <Typography variant="h2">
            {t('obx.runsheet.excludedHits', {
              hits: getLabel('terms', 'hits', t),
            })}
          </Typography>
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
        <Typography variant="body2">
          {t('obx.runsheet.excludedHitsDescription', {
            hits: getLabel('terms', 'hits', t).toLowerCase(),
            runsheet: getLabel('terms', 'runsheet', t).toLowerCase(),
          })}
        </Typography>
      </Box>

      <Box className={classes?.drawerInner}>
        <NewHitsAccordionListing hitsList={excludedHits} />
      </Box>
    </Box>
  );
};

RemovedHits.propTypes = {
  setShowDrawer: PropTypes.func,
  patrolTemplateId: PropTypes.number,
  excludedHits: PropTypes.object,
};

export default RemovedHits;
