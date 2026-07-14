import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';
import { Button, Skeleton, Tooltip } from '@mui/material';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import { ReactComponent as EditIcon } from 'assets/icons/editPencilIcon.svg?react';
import { ReactComponent as CautionIcon } from 'assets/svg/caution-thin.svg?react';
import { ReactComponent as EmergencyIcon } from 'assets/svg/emergency-phone.svg?react';
import MapComponent, { actionItemTypeKeys } from 'commonComponents/geoFencing';
import PropTypes from 'prop-types';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import InfoCardSkeleton from 'src/app/components/common/skeletonLoader/infoCardSkeleton';
import { getFranchiseIdWithRoleAndSource } from 'src/app/obx/pages/schedules/helper';
import { ACL_OBX_SITE_RATE_VIEW, ACL_OBX_SITE_UPDATE } from 'src/app/router/constant/OBXMODULE';
import history from 'src/app/router/utils/history';
import { isObjectEmpty } from 'src/helper/utilityFunctions';
import { useTenantLabel } from 'src/helper/utilityHooks';
import RenderIfHasPermission from 'src/hoc/RenderIfHasPermission';
import { useCurrency } from 'src/hooks/useCurrency';
import {
  franchiseIdUrlQueryParam,
  rolesEnumWithName,
  timeZoneKeyUrlQueryParam,
} from 'src/utils/constants';
import { capitalizeFirstLetter } from 'src/utils/string/common';

import * as routes from '../../../../../../router/constant/ROUTE';
import { OBX_ZONE_SITE_UPDATE } from '../../../../../../router/constant/ROUTE';
import { useStyles } from './generalInfoStyles';

const GeneralInformation = ({ siteData, franchiseData, loading, keyId }) => {
  const { t } = useTranslation();
  const userRole = useSelector((state) => state.auth.userRole);
  const isHomeOfficer = userRole?.slug === rolesEnumWithName.home_officer.slug;
  const { getLabel } = useTenantLabel();
  const classes = useStyles();
  const NA = t('commonText.nA');
  const mappedData = {
    ...siteData,
    coordinates: siteData?.siteArea,
  };

  const searchParams = new URLSearchParams(location.search);
  const { currency: franchiseCurrency } = useCurrency();
  const franchiseIdWithRoleAndSource = getFranchiseIdWithRoleAndSource();
  const franchiseTimeZoneFromUrl = searchParams.get(timeZoneKeyUrlQueryParam);

  const gotoSiteUpdateForm = (id) => {
    const sitePath = OBX_ZONE_SITE_UPDATE.replace(':id', id);
    if (franchiseIdWithRoleAndSource?.role === rolesEnumWithName.home_officer.slug) {
      const queryParams = new URLSearchParams({
        [franchiseIdUrlQueryParam]: franchiseIdWithRoleAndSource?.[franchiseIdUrlQueryParam],
        [timeZoneKeyUrlQueryParam]: franchiseTimeZoneFromUrl,
      }).toString();
      history.push(`${sitePath}?${queryParams}`);
    } else {
      history.push(sitePath);
    }
  };

  const siteInformation = (
    <>
      <CardContent className={classes.cardContainer} sx={{ padding: '0px !important' }}>
        <Box className={classes.cardFlexContent}>
          <Box>
            <Typography variant="subtitle1" className={classes.cardHeading}>
              {t('obx.sites.siteInformation.title')}
            </Typography>
          </Box>
          {/* for release purpose we need to comment this data */}

          <Box className={classes.cardActionWrapper}>
            {loading ? (
              <Skeleton animation="wave" variant="rounded" className={classes.chipBar} />
            ) : (
              <>
                {siteData?.id && mappedData?.coordinates?.length == 0 && (
                  <Chip
                    color="error"
                    icon={<ErrorOutlineOutlinedIcon />}
                    size="small"
                    label={t('ho.ho_franchise.detail.franchise_information.info')}
                    variant="outlined"
                  />
                )}
              </>
            )}
            <RenderIfHasPermission name={ACL_OBX_SITE_UPDATE}>
              <Button
                variant={'onlyText'}
                disableRipple={false}
                className={classes.cancelIcon}
                onClick={() => {
                  gotoSiteUpdateForm(keyId);
                }}
              >
                <EditIcon className={classes.editIcon} />
              </Button>
            </RenderIfHasPermission>
          </Box>
        </Box>
        {loading ? (
          <Box className={classes.skeletonWrapperCard}>
            <InfoCardSkeleton noOfRows={4} />
          </Box>
        ) : (
          <Box className={classes.informationCard}>
            <Box className={classes.mainContent}>
              <Box className={classes.contentDetail}>
                <Typography variant="body3" className={classes.columnHeading}>
                  {t('obx.sites.siteInformation.name')}
                </Typography>
                <Typography variant="subtitle2" className={classes.columnDetail}>
                  {capitalizeFirstLetter(siteData?.name) || NA}
                </Typography>
              </Box>
              <Box className={classes.contentDetail}>
                <Typography variant="body3" className={classes.columnHeading}>
                  {t('obx.sites.siteInformation.client')}
                </Typography>
                <Typography variant="subtitle2" className={classes.columnDetail}>
                  {siteData?.firstName && siteData?.lastName
                    ? `${capitalizeFirstLetter(siteData?.firstName)} ${capitalizeFirstLetter(
                        siteData?.lastName,
                      )}`
                    : NA}
                </Typography>
              </Box>

              <Box className={classes.contentDetail}>
                <Typography variant="body3" className={classes.columnHeading}>
                  {t('obx.sites.siteInformation.secondaryEmail')}
                </Typography>
                <Typography variant="subtitle2" className={classes.columnDetail}>
                  {siteData?.email || NA}
                </Typography>
              </Box>
              <Box className={classes.contentDetail}>
                <Typography variant="body3" className={classes.columnHeading}>
                  {t('obx.sites.siteInformation.number')}
                </Typography>
                <Typography variant="subtitle2" className={classes.columnDetail}>
                  {siteData?.phoneNumber || NA}
                </Typography>
              </Box>
              <Box className={classes.contentDetail}>
                <Typography variant="body3" className={classes.columnHeading}>
                  {t('obx.sites.siteInformation.customerId')}
                </Typography>
                <Typography variant="subtitle2" className={classes.columnDetail}>
                  {siteData?.customerId || NA}
                </Typography>
              </Box>
            </Box>
            <Box className={classes.mainContent}>
              <Box className={classes.contentDetail}>
                <Typography variant="body3" className={classes.columnHeading}>
                  {t('obx.sites.siteInformation.primaryEmail')}
                  {/* <Tooltip
                    placement="right"
                    arrow
                    title={t('obx.sites.tooltips.primaryContactEmailTooltip')}
                  >
                    <CautionIcon />
                  </Tooltip> */}
                </Typography>
                <Typography variant="subtitle2" className={classes.columnDetail}>
                  {siteData?.primaryEmail || NA}
                </Typography>
              </Box>
              <Box className={classes.contentDetail}>
                <RenderIfHasPermission name={ACL_OBX_SITE_RATE_VIEW}>
                  <Typography variant="body3" className={classes.columnHeading}>
                    {t('obx.sites.siteInformation.siteRate')}
                    {franchiseCurrency}
                    <Tooltip
                      placement="right"
                      arrow
                      title={t('obx.sites.tooltips.siteRateTooltip', {
                        officers: getLabel('terms', 'officers', t)?.toLowerCase(),
                      })}
                    >
                      <CautionIcon />
                    </Tooltip>
                  </Typography>
                  <Typography variant="subtitle2" className={classes.columnDetail}>
                    {siteData?.officerRate || NA}
                  </Typography>
                </RenderIfHasPermission>
              </Box>
              <Box className={classes.contentDetail}>
                <Typography variant="body3" className={classes.columnHeading}>
                  {t('obx.sites.siteInformation.dailySiteSummaryReceivers')}
                </Typography>
                <Typography variant="subtitle2" className={classes.columnDetail}>
                  {siteData?.dailySiteSummaryReceivers?.length}
                </Typography>
              </Box>
              <Box className={classes.contentDetail}>
                <Typography variant="body3" className={classes.columnHeading}>
                  {t('obx.sites.siteInformation.incidentReportReceivers')}
                </Typography>
                <Typography variant="subtitle2" className={classes.columnDetail}>
                  {siteData?.incidentReportReceivers?.length}
                </Typography>
              </Box>
              {isHomeOfficer && (
                <Box className={classes.contentDetail}>
                  <Typography variant="body3" className={classes.columnHeading}>
                    {t('obx.sites.siteInformation.termsAndConditionsVersion')}
                  </Typography>
                  <Typography variant="subtitle2" className={classes.columnDetail}>
                    {siteData?.termsAndConditionsVersion || NA}
                  </Typography>
                </Box>
              )}
              {siteData?.isGeofencingEnabled && (
                <Box className={classes.contentDetail}>
                  <Typography variant="body3" className={classes.columnHeading}>
                    {t('obx.sites.siteInformation.geofencing.title')}
                  </Typography>
                  <Chip
                    label={
                      siteData?.geofencingEnabled
                        ? t('obx.form.input.textField.integrations.enabled')
                        : t('obx.form.input.textField.integrations.disabled')
                    }
                    size="small"
                    color={siteData?.geofencingEnabled ? 'success' : 'error'}
                    variant="filled-primary"
                  />
                </Box>
              )}
            </Box>
          </Box>
        )}
      </CardContent>
    </>
  );
  const emergencyContacts = (
    <>
      <CardContent className={classes.cardContainer} sx={{ padding: '0px !important' }}>
        <Box className={classes.cardFlexContent}>
          <Box>
            <Typography variant="subtitle1" className={classes.cardHeading}>
              {t('obx.form.input.textField.additionalContacts.header')}
            </Typography>
          </Box>

          <Box className={classes.cardActionWrapper}>
            <RenderIfHasPermission name={ACL_OBX_SITE_UPDATE}>
              <Link to={`${routes.OBX_ZONE_SITE}/${keyId}?scrollToContacts=true`}>
                <EditIcon className={classes.editIcon} />
              </Link>
            </RenderIfHasPermission>
          </Box>
        </Box>
        {loading ? (
          <Box className={classes.skeletonWrapperCard}>
            <InfoCardSkeleton noOfRows={4} />
          </Box>
        ) : (
          <Box className={classes.informationCardContact}>
            <Box className={classes.mainContentContact}>
              {siteData?.contacts?.length > 0 ? (
                siteData?.contacts?.map((data, i) => (
                  <Box key={data?.id || i} className={classes.contentDetailContact}>
                    <Typography variant="body3" className={classes.columnHeading}>
                      {t('obx.sites.siteInformation.person')} {i + 1}
                    </Typography>
                    <Box className={classes.informationEmergencyCard}>
                      <Typography variant="subtitle2" className={classes.nameDetail}>
                        {data?.name || NA}
                        {data?.isEmergencyContact && (
                          <Tooltip title={t('obx.sites.siteInformation.emergencyContact')} arrow>
                            <EmergencyIcon />
                          </Tooltip>
                        )}
                      </Typography>
                      <Typography variant="body2" className={classes.columnDetailEmail}>
                        {data?.email || NA}
                      </Typography>
                      <Typography variant="body2" className={classes.columnDetail}>
                        {data?.contact || NA}
                      </Typography>
                      <Typography variant="body2" className={classes.columnDetail}>
                        {data?.role || NA}
                      </Typography>
                    </Box>
                  </Box>
                ))
              ) : (
                <>
                  {t('obx.commonText.notAdded.text', {
                    name: `Contact`,
                  })}
                </>
              )}
            </Box>
          </Box>
        )}
      </CardContent>
    </>
  );
  return (
    <>
      <Box className={classes.mainBoxSection}>
        <Box className={classes.internalBoxWrapper}>
          <Card className={classes.cardContentLeft}>{siteInformation}</Card>
        </Box>

        <Box className={classes.internalBoxWrapper}>
          <Card className={classes.cardContentRight}>{emergencyContacts}</Card>
        </Box>
      </Box>
      <Typography variant="subtitle1" className={classes.mapContent}>
        {t('form.input.textField.geoFencing.header')}
      </Typography>
      <Box className={classes.mapSection}>
        {loading && (
          <Box className={classes.mapSkeleton}>
            <Skeleton />
          </Box>
        )}
        {franchiseData?.franchises?.length > 0 &&
          !isObjectEmpty(siteData?.siteLocation) &&
          !loading && (
            <MapComponent
              franchiseData={franchiseData}
              setErrorMessages={() => {}}
              errorMessages={{}}
              updateFormHandler={() => {}}
              createOrUpdate={false}
              formDataKey="siteArea"
              mapCenter={siteData?.siteLocation}
              actionItemType={actionItemTypeKeys.site}
            />
          )}
      </Box>
    </>
  );
};

GeneralInformation.propTypes = {
  franchiseData: PropTypes.object,
  siteData: PropTypes.object,
  loading: PropTypes.bool,
  keyId: PropTypes.string,
};
export default GeneralInformation;
