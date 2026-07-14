import { Box, Chip, InputLabel, Typography } from '@mui/material';
import { ReactComponent as DotIcon } from 'assets/svg/dot.svg?react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { useStyles } from './viewBillingDetails.style';

const ViewBillingDetails = () => {
  const { t } = useTranslation();
  const classes = useStyles();

  return (
    <>
      <Box className={classes.siteWrapper}>
        <Box className={classes.upperWrap}>
          <Box className={classes.fieldsMain}>
            <Box className={classes.mainHeading}>
              <Typography variant="subtitle1">Aleena Javed </Typography>
              <DotIcon className={classes.dot} />
              <Typography variant="body1">+1 336-455-3667</Typography>
            </Box>

            <Box className={classes.fieldWrapperTwin}>
              <Box className={classes.fieldWrapper}>
                <InputLabel htmlFor="firstName">{t('obx.billing.companyName')}</InputLabel>
                <Typography variant="body2">Barnacle parking</Typography>
              </Box>
              <Box className={classes.fieldWrapper}>
                <InputLabel htmlFor="lastName">{t('obx.billing.companyAddress')}</InputLabel>
                <Typography variant="body2">12-Barnacle road, 56189, New Jersey, USA</Typography>
              </Box>
              <Box className={classes.fieldWrapper}>
                <InputLabel htmlFor="phoneNumber">{t('obx.billing.primaryPhone')}</InputLabel>
                <Typography variant="body2">names</Typography>
              </Box>
              <Box className={classes.fieldWrapper}>
                <InputLabel htmlFor="email">{t('obx.billing.primaryEmailAddress')}</InputLabel>
                <Typography variant="body2">names</Typography>
              </Box>
              <Box className={classes.fieldWrapper}>
                <Box className={classes.emailWrapper}>
                  <InputLabel htmlFor="recepientEmails">
                    {t('obx.billing.secondaryEmailAddresses')}
                  </InputLabel>

                  <Box className={classes.ChipsWrap}>
                    <Chip color="info" label="mike@teamsignal.com" />
                    <Chip color="info" label="mike@teamsignal.com" />
                    <Chip color="info" label="mike@teamsignal.com" />
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default ViewBillingDetails;
