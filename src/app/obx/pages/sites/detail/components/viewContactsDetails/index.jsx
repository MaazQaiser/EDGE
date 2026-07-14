import { Box, Button, Chip, InputLabel, Tooltip, Typography } from '@mui/material';
import { ReactComponent as EditContactsICons } from 'assets/svg/EditContactsICons.svg?react';
import { ReactComponent as InfoIcon } from 'assets/svg/InfoIcon.svg?react';
import PropTypes from 'prop-types';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
// import LoaderComponent from 'src/app/components/common/loader';
import RequiredAsterik from 'src/app/components/common/requiredAsterik';
import { CloseIcon } from 'src/assets/svg';

import { useStyles } from './ViewContactsDetails.style';

const ViewContactsDetails = ({ handleClose }) => {
  const { t } = useTranslation();
  const classes = useStyles();

  const countryCounfiguration = useSelector(
    (state) => state?.auth?.countryConfiguration || state?.auth?.defaultCountryConfiguration,
  );
  const isCountryAustralia = countryCounfiguration?.country?.shortCode === 'AU';

  return (
    <>
      {/* {loading && <LoaderComponent size={50} color={'primary'} label={'Loading'} />} */}
      <Box noValidate autoComplete="off" className={classes.siteWrapper}>
        <Box className={classes.boxHeader}>
          <Box className={classes.titleHead}>
            <Box>
              <Typography variant="h3" className={classes.sideTitle}>
                {t('obx.billing.contactDetails')} view
              </Typography>
              <Typography variant="body2" className={classes.bulkSubHeading}>
                {t('obx.billing.viewContacDetails')}
              </Typography>
            </Box>

            <Box className={classes.headerButtons}>
              <Button startIcon={<EditContactsICons />} variant="secondaryBlue">
                {t('obx.billing.edit')}
              </Button>
              <Box className={classes.titleHeadBtn}>
                <a href="#" onClick={handleClose}>
                  <CloseIcon />
                </a>
              </Box>
            </Box>
          </Box>
        </Box>
        <Box className={classes.upperWrap}>
          <Box className={classes.fieldsMain}>
            <Typography variant="subtitle1" className={classes.mainHeading}>
              {t('obx.billing.contactInformation')}
            </Typography>
            <Box className={classes.fieldWrapperTwin}>
              <Box className={classes.fieldWrapper}>
                <InputLabel htmlFor="firstName">{t('obx.billing.firstName')}</InputLabel>
                <Typography variant="body1">names</Typography>
              </Box>
              <Box className={classes.fieldWrapper}>
                <InputLabel htmlFor="lastName">{t('obx.billing.lastName')}</InputLabel>
                <Typography variant="body1">names</Typography>
              </Box>
              <Box className={classes.fieldWrapper}>
                <InputLabel htmlFor="email">
                  {t('obx.billing.primaryEmailAddress')} <RequiredAsterik />
                </InputLabel>
                <Typography variant="body1">names</Typography>
              </Box>

              <Box className={classes.fieldWrapper}>
                <InputLabel htmlFor="firstName">
                  {t('obx.billing.companyName')} <RequiredAsterik />
                </InputLabel>
                <Typography variant="body1">names</Typography>
              </Box>
              <Box className={classes.fieldWrapperHalf}>
                <InputLabel htmlFor="phoneNumber">{t('obx.billing.phoneNo')}</InputLabel>
                <Typography variant="body1">names</Typography>
              </Box>
            </Box>
          </Box>
          <Box className={classes.fieldsMain}>
            <Typography variant="subtitle1" className={classes.mainHeading}>
              {t('obx.billing.address')}
            </Typography>
            <Box className={classes.fieldWrapperTwin}>
              <Box className={classes.fieldWrapper}>
                <InputLabel htmlFor="country">
                  {t('obx.sites.createSite.country')} <RequiredAsterik />
                </InputLabel>
                <Typography variant="body1">names</Typography>
              </Box>
              <Box className={classes.fieldWrapper}>
                <InputLabel htmlFor="state">
                  {t('obx.sites.createSite.state')} <RequiredAsterik />
                </InputLabel>
                <Typography variant="body1">names</Typography>
              </Box>
              <Box className={classes.fieldWrapper}>
                <InputLabel htmlFor="city">
                  {t(`obx.sites.createSite.${isCountryAustralia ? 'suburb' : 'city'}`)}{' '}
                  <RequiredAsterik />
                </InputLabel>
                <Typography variant="body1">names</Typography>
              </Box>
              <Box className={classes.fieldWrapper}>
                <InputLabel htmlFor="zipCode">
                  {t('obx.sites.createSite.zipCode')} <RequiredAsterik />
                </InputLabel>
                <Typography variant="body1">names</Typography>
              </Box>
              <Box className={classes.fieldWrapper}>
                <InputLabel htmlFor="addressLine1">
                  {t('obx.billing.addressLine1')} <RequiredAsterik />
                </InputLabel>
                <Typography variant="body1">names</Typography>
              </Box>
              <Box className={classes.fieldWrapper}>
                <InputLabel htmlFor="addressLine2">
                  {t('obx.billing.addressLine2')} <RequiredAsterik />
                </InputLabel>
                <Typography variant="body1">names</Typography>
              </Box>
            </Box>
          </Box>
          <Box className={classes.fieldsMain}>
            <Typography variant="subtitle1" className={classes.mainHeading}>
              {t('obx.billing.additionalInformation')}
            </Typography>
            <Box className={classes.fieldWrapper}>
              <Box className={classes.emailWrapper}>
                <Box className={classes.inlineFields}>
                  <InputLabel htmlFor="recepientEmails">
                    {t('obx.billing.secondaryEmailAddresses')}
                  </InputLabel>
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
                    title={t('obx.billing.info')}
                    placement="right"
                  >
                    <InfoIcon className={classes.alertIcon} />
                  </Tooltip>
                </Box>
                <Box className={classes.ChipsWrap}>
                  <Chip color="primary" label="mike@teamsignal.com" onDelete={() => {}} />
                  <Chip color="primary" label="mike@teamsignal.com" onDelete={() => {}} />

                  <Chip color="primary" label="mike@teamsignal.com" onDelete={() => {}} />
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  );
};

ViewContactsDetails.propTypes = {
  handleClose: PropTypes.func.isRequired,
  // handleCloseAddBreakType: PropTypes.func.isRequired,
};

export default ViewContactsDetails;
