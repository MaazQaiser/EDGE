import { Box, Button, Stack, Typography } from '@mui/material';
import LoaderComponent from 'commonComponents/loader';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { updateLocation } from 'src/services/location.service.js';
import { rolesEnumWithName, toastSettings } from 'src/utils/constants/index.js';
import { toaster } from 'src/utils/toast/index.jsx';

import DrawerFooter from '../../components/drawerFooter/index.jsx';
import DrawerHeader from '../../components/drawerHeader/index.jsx';
import { assignToEnums, assignToOptions } from '../newLocationsDrawer/location.constant.js';
import { useStyles } from './approveLocation.js';

const ApproveLocationDrawer = ({
  anchor,
  approveLocationCloseDrawer,
  width,
  locationData,
  refetchLocations,
  isApproveableAndRejectable,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const userRole = useSelector((state) => state.auth.userRole);
  const [isUpdatingLocation, setIsUpdatingLocation] = useState(false);
  const NA = t('commonText.nA');

  const handleLocationUpdate = async (isApproveFlow) => {
    try {
      setIsUpdatingLocation(true);
      const payload = {
        status: isApproveFlow ? 'approved' : 'rejected',
      };

      const apiResponse = await updateLocation(locationData?.id, payload);

      if (apiResponse.statusCode === 200) {
        toaster.success({
          text: isApproveFlow
            ? t('sales.locations.approvedLocation')
            : t('sales.locations.rejectedLocation'),
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
        /**
         * close the side drawer after successful response
         */
        refetchLocations();
        approveLocationCloseDrawer(anchor);
      }
    } catch (error) {
      /**
       * show error
       */
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    } finally {
      setIsUpdatingLocation(false);
    }
  };

  const handleApproveLocation = async (e) => {
    e.preventDefault();
    handleLocationUpdate(true);
  };

  const handleRejectLocation = async (e) => {
    e.preventDefault();
    handleLocationUpdate(false);
  };

  const getAssignToJSX = (locationData) => {
    if (!locationData?.intent) {
      return (
        <Box className={classes.companyFlex}>
          <Box className={classes.cLabel}>{t('sales.locations.name')}</Box>
          <Box className={classes.compDetName}>{NA}</Box>
        </Box>
      );
    }
    const assignToData = assignToOptions.find(
      (assignTo) => assignTo.value === locationData?.intent,
    );
    let assignToJsx = null;
    switch (assignToData?.value) {
      case assignToEnums.HOME_OFFICE:
        assignToJsx = (
          <Box className={classes.companyFlex}>
            <Box className={classes.cLabel}>{t('sales.locations.name')}</Box>
            <Box className={classes.compDetName}>{assignToData.label || NA}</Box>
          </Box>
        );
        break;
      case assignToEnums.SALES_PERSON:
        assignToJsx = (
          <Box className={classes.companyFlex}>
            <Box className={classes.cLabel}>{t('sales.locations.name')}</Box>
            <Box className={classes.compDetName}>
              {locationData.assignedUserName
                ? `${locationData.assignedUserName} (${assignToData.label})`
                : NA}
            </Box>
          </Box>
        );
        break;
      case assignToEnums.INTERN:
        assignToJsx = (
          <>
            <Box className={classes.companyFlex}>
              <Box className={classes.cLabel}>{t('sales.locations.name')}</Box>
              <Box className={classes.compDetName}>
                {locationData.assignedUserName
                  ? `${locationData.assignedUserName} (${assignToData.label})`
                  : NA}
              </Box>
            </Box>
            <Box className={classes.companyFlex}>
              <Box className={classes.cLabel}>{t('sales.locations.associatedSupervisor')}</Box>
              <Box className={classes.compDetName}>{locationData.assignedSupervisorName || NA}</Box>
            </Box>
          </>
        );
        break;
    }
    return assignToJsx;
  };

  return (
    <>
      {isUpdatingLocation && <LoaderComponent label={t('sales.loading')} />}
      <Box
        className={classes.sideBarBox}
        sx={{ width: anchor === 'top' || anchor === 'bottom' ? 'auto' : width }}
        role="presentation"
        component="form"
      >
        <Stack className={classes.boxinner} justifyContent="space-between">
          <Box className={classes.sideheader}>
            {isApproveableAndRejectable ? (
              <DrawerHeader
                title={t('sales.locations.approveLocation')}
                subtext={t('sales.locations.approveText')}
                handleCloseDrawer={approveLocationCloseDrawer}
                anchor={anchor}
              />
            ) : (
              <DrawerHeader
                title={t('sales.locations.rejectLocation')}
                subtext={t('sales.locations.rejectText')}
                handleCloseDrawer={approveLocationCloseDrawer}
                anchor={anchor}
              />
            )}
            <Box className={classes.approveTextBox}>
              <Typography variant="h5">{t('sales.locations.companyAccount')}</Typography>
              <Box className={classes.companyFlex}>
                <Box className={classes.cLabel}>{t('sales.locations.name')}</Box>
                <Box className={classes.compDetName}>{locationData?.companyName || NA}</Box>
              </Box>
              <Box className={classes.companyFlex}>
                <Box className={classes.cLabel}>{t('sales.locations.propertyName')}</Box>
                <Box className={classes.compDetName}>{locationData?.locationName || NA}</Box>
              </Box>
              <Box className={classes.companyFlex}>
                <Box className={classes.cLabel}>{t('sales.locations.locationSource')}</Box>
                <Box className={classes.compDetName}>{locationData?.type || NA}</Box>
              </Box>
              <Box className={classes.companyFlex}>
                <Box className={classes.cLabel}>{t('sales.locations.associatedFranchise')}</Box>
                <Box className={classes.compDetName}>{locationData?.franchiseName || NA}</Box>
              </Box>
            </Box>

            <Box className={classes.approveTextBox}>
              <Typography variant="h5">{t('sales.locations.assignedUserName')}</Typography>
              {getAssignToJSX(locationData)}
            </Box>
            <Box className={classes.approveTextBox}>
              <Typography variant="h5">{t('sales.locations.contactDetails')}</Typography>
              <Box className={classes.companyFlex}>
                <Box className={classes.cLabel}>{t('sales.locations.name')}</Box>
                <Box className={classes.compDetName}>{locationData?.contactName || NA}</Box>
              </Box>
            </Box>
            <Box className={classes.approveTextBox}>
              <Typography variant="h5">{t('sales.locations.address')}</Typography>
              <Box className={classes.companyFlex}>
                <Box className={classes.cLabel}>{t('sales.locations.streetAddress')}</Box>
                <Box className={classes.compDetName}>{locationData?.address || NA}</Box>
              </Box>
              <Box className={classes.companyFlex}>
                <Box className={classes.cLabel}>{t('sales.locations.city')}</Box>
                <Box className={classes.compDetName}>{locationData?.city || NA}</Box>
              </Box>
              <Box className={classes.companyFlex}>
                <Box className={classes.cLabel}>{t('sales.locations.state')}</Box>
                <Box className={classes.compDetName}>{locationData?.state || NA}</Box>
              </Box>
              <Box className={classes.companyFlex}>
                <Box className={classes.cLabel}>{t('sales.locations.postalCode')}</Box>
                <Box className={classes.compDetName}>{locationData?.postalCode || NA}</Box>
              </Box>
            </Box>
          </Box>
          {isApproveableAndRejectable && userRole?.slug !== rolesEnumWithName.sales_person.slug ? (
            <DrawerFooter
              bulkApply={t('sales.locations.approve')}
              bulkCancel={t('sales.locations.reject')}
              anchor={anchor}
              disabled={isUpdatingLocation}
              onSubmit={handleApproveLocation}
              isDoubleActionButton={true}
              disabled2={isUpdatingLocation}
              onSubmit2={handleRejectLocation}
              type="submit"
            />
          ) : (
            <Box className={classes.sideFooter}>
              <Button variant="primary" onClick={() => approveLocationCloseDrawer(anchor)}>
                {t('sales.locations.close')}
              </Button>
            </Box>
          )}
        </Stack>
      </Box>
    </>
  );
};

ApproveLocationDrawer.propTypes = {
  anchor: PropTypes.string,
  approveLocationCloseDrawer: PropTypes.func,
  width: PropTypes.number,
  locationData: PropTypes.object, // Adjust the type accordingly based on the expected data structure
  refetchLocations: PropTypes.func,
  isApproveableAndRejectable: PropTypes.bool,
};

export default ApproveLocationDrawer;
