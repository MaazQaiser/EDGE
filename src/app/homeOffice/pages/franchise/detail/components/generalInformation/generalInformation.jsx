import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';
import { Skeleton, Tooltip } from '@mui/material';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import { ReactComponent as EditIcon } from 'assets/icons/editPencilIcon.svg?react';
import { ReactComponent as EmergencyIcon } from 'assets/svg/emergency-phone.svg?react';
import PropTypes from 'prop-types';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import InfoCardSkeleton from 'src/app/components/common/skeletonLoader/infoCardSkeleton';
import { isObjectEmpty } from 'src/helper/utilityFunctions';
import { useCurrency } from 'src/hooks/useCurrency';
import useDateTime from 'src/hooks/useDateTime';
import { actionItemTypeKeys, dayjsFormatsEnum, rolesEnumWithName } from 'src/utils/constants';
import { numberToAmountFormat } from 'src/utils/currencyFormater';
import { capitalizeFirstLetter } from 'src/utils/string/common';

import MapComponent from '../../../../../../components/common/geoFencing';
import * as routes from '../../../../../../router/constant/ROUTE';
import { useStyles } from './generalInfo';
export default function GeneralInformation({ franchiseData, geoLocation, loading }) {
  const { t } = useTranslation();
  const userRole = useSelector((state) => state.auth.userRole);
  const isHomeOfficer = userRole?.slug === rolesEnumWithName.home_officer.slug;

  const NA = t('commonText.nA');
  const classes = useStyles();
  const { getCurrencyOfFranchise } = useCurrency();
  const { formatDayjsDateTime } = useDateTime();

  const ownerFullName = (firstName, lastName) => {
    // Check if both firstName and lastName are null, and return "N/A" in that case
    if (firstName === null && lastName === null) {
      return NA;
    }

    // Handle null values for firstName and lastName separately
    const fullName = ((firstName || '') + ' ' + (lastName || '')).trim();

    return fullName === '' ? NA : fullName;
  };
  const _showMap =
    geoLocation?.franchises?.[0]?.franchiseLocation &&
    !isObjectEmpty(geoLocation?.franchises?.[0]?.franchiseLocation);

  const franchiseInformation = (
    <CardContent className={classes.cardContainer} sx={{ padding: '0px !important' }}>
      <Box className={classes.cardFlexContent}>
        <Box>
          <Typography variant="subtitle1" className={classes.cardHeading}>
            {t('ho.ho_franchise.detail.franchise_information.title')}
          </Typography>
        </Box>
        <Box className={classes.cardActionWrapper}>
          {/* <Box className="bottomspan"> */}
          {/* <span className="imagspan">
                <img src={Warning} />
              </span>
              <span>{t('ho.ho_franchise.detail.franchise_information.info')}</span> */}
          {loading ? (
            <Skeleton animation="wave" variant="rounded" className={classes.chipBar} />
          ) : (
            <>
              {franchiseData?.id && franchiseData?.coordinates?.length == 0 && (
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
          {/* </Box> */}
          {franchiseData?.id && (
            <Link to={`${routes.HO_FRANCHISE_UPDATE}/${franchiseData?.id}`}>
              <EditIcon className={classes.editIcon} />
            </Link>
          )}
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
                {t('ho.ho_franchise.detail.franchise_information.name')}
              </Typography>
              <Typography variant="subtitle2" className={classes.columnDetail}>
                {capitalizeFirstLetter(franchiseData?.franchiseName) || NA}
              </Typography>
            </Box>
            <Box className={classes.contentDetail}>
              <Typography variant="body3" className={classes.columnHeading}>
                {t('ho.ho_franchise.detail.franchise_information.owner')}
              </Typography>
              <Typography variant="subtitle2" className={classes.columnDetail}>
                {`${ownerFullName(franchiseData?.firstName, franchiseData?.lastName)}`}
              </Typography>
            </Box>
            <Box className={classes.contentDetail}>
              <Typography variant="body3" className={classes.columnHeading}>
                {t('ho.ho_franchise.detail.franchise_information.email')}
              </Typography>
              <Typography variant="subtitle2" className={classes.columnDetailEmail}>
                {franchiseData?.email || NA}
              </Typography>
            </Box>
            <Box className={classes.contentDetail}>
              <Typography variant="body3" className={classes.columnHeading}>
                {t('ho.ho_franchise.detail.franchise_information.number')}
              </Typography>
              <Typography variant="subtitle2" className={classes.columnDetail}>
                {franchiseData?.phoneNumber || NA}
              </Typography>
            </Box>
            <Box className={classes.contentDetail}>
              <Typography variant="body3" className={classes.columnHeading}>
                {t('ho.ho_franchise.detail.franchise_information.workCellNumber')}
              </Typography>
              <Typography variant="subtitle2" className={classes.columnDetail}>
                {franchiseData?.workCellNumber || NA}
              </Typography>
            </Box>
          </Box>
          <Box className={classes.mainContent}>
            <Box className={classes.contentDetail}>
              <Typography variant="body3" className={classes.columnHeading}>
                {t('ho.ho_franchise.detail.franchise_information.country')}
              </Typography>
              <Typography variant="subtitle2" className={classes.columnDetail}>
                {franchiseData?.country?.name || NA}
              </Typography>
            </Box>
            <Box className={classes.contentDetail}>
              <Typography variant="body3" className={classes.columnHeading}>
                {t('ho.ho_franchise.detail.franchise_information.region')}
              </Typography>
              <Typography variant="subtitle2" className={classes.columnDetail}>
                {franchiseData?.state?.name || NA}
              </Typography>
            </Box>
            <Box className={classes.contentDetail}>
              <Typography variant="body3" className={classes.columnHeading}>
                {t('ho.ho_franchise.detail.franchise_information.city')}
              </Typography>
              <Typography variant="subtitle2" className={classes.columnDetail}>
                {franchiseData?.city?.name || NA}
              </Typography>
            </Box>
            <Box className={classes.contentDetail}>
              <Typography variant="body3" className={classes.columnHeading}>
                {t('ho.ho_franchise.detail.franchise_information.address')}
              </Typography>
              <Typography variant="subtitle2" className={classes.columnDetail}>
                {franchiseData?.address} {franchiseData?.address2}
              </Typography>
            </Box>
          </Box>
        </Box>
      )}
    </CardContent>
  );

  const generalInformation = (
    <CardContent className={classes.cardContainer} sx={{ padding: '0px !important' }}>
      <Box className={classes.cardFlexContent}>
        <Box>
          <Typography variant="subtitle1" className={classes.cardHeading}>
            {t('ho.ho_franchise.detail.franchise_information.generalInformation')}
          </Typography>
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
                {t('ho.ho_franchise.detail.franchise_information.Id')}
              </Typography>
              <Typography variant="subtitle2" className={classes.columnDetail}>
                {franchiseData?.id || NA}
              </Typography>
            </Box>

            <Box className={classes.contentDetail}>
              <Typography variant="body3" className={classes.columnHeading}>
                {t('ho.ho_franchise.detail.franchise_information.joined')}
              </Typography>
              <Typography variant="subtitle2" className={classes.columnDetail}>
                {formatDayjsDateTime({
                  value: franchiseData?.functionalAt,
                  formatType: dayjsFormatsEnum.date,
                })}
              </Typography>
            </Box>
            <Box className={classes.contentDetail}>
              <Typography variant="body3" className={classes.columnHeading}>
                {t('ho.ho_franchise.detail.franchise_information.monthlyRevenue')}
              </Typography>
              <Typography variant="subtitle2" className={classes.columnDetail}>
                {`${getCurrencyOfFranchise(franchiseData?.id)?.currencySymbol}${numberToAmountFormat(franchiseData?.monthlyRevenue)}`}
              </Typography>
            </Box>
            <Box className={classes.contentDetail}>
              <Typography variant="body3" className={classes.columnHeading}>
                {t('ho.ho_franchise.detail.franchise_information.noOfCustomers')}
              </Typography>
              <Typography variant="subtitle2" className={classes.columnDetail}>
                {franchiseData?.noOfCustomer || NA}
              </Typography>
            </Box>

            <Box className={classes.contentDetail}>
              <Typography variant="body3" className={classes.columnHeading}>
                {t('ho.ho_franchise.detail.franchise_information.1099')} {''}
                {/* {t('ho.ho_franchise.detail.franchise_information.companyCode')} */}
              </Typography>
              <Typography className={classes.columnDetail} variant={'subtitle2'}>
                {franchiseData?.companyCode1099 || NA}
              </Typography>
            </Box>
          </Box>
          <Box className={classes.mainContent}>
            <Box className={classes.contentDetail}>
              <Typography variant="body3" className={classes.columnHeading}>
                {t('ho.ho_franchise.detail.franchise_information.serviceZips')}
              </Typography>
              <Typography variant="subtitle2" className={classes.columnDetail}>
                {franchiseData?.noOfServiceZips || NA}
              </Typography>
            </Box>
            <Box className={classes.contentDetail}>
              <Typography variant="body3" className={classes.columnHeading}>
                {t('ho.ho_franchise.detail.franchise_information.noOfEmployees')}
              </Typography>
              <Typography variant="subtitle2" className={classes.columnDetail}>
                {franchiseData?.noOfEmployee || NA}
              </Typography>
            </Box>
            <Box className={classes.contentDetail}>
              <Typography variant="body3" className={classes.columnHeading}>
                {t('ho.ho_franchise.detail.franchise_information.hubSpotFranchiseId')}
              </Typography>
              <Typography variant="subtitle2" className={classes.columnDetail}>
                {franchiseData?.referenceNumber ? franchiseData?.referenceNumber : NA}
              </Typography>
            </Box>

            <Box className={classes.contentDetail}>
              <Typography variant="body3" className={classes.columnHeading}>
                {t('ho.ho_franchise.detail.franchise_information.w2')} {''}
                {/* {t('ho.ho_franchise.detail.franchise_information.companyCode')} */}
              </Typography>
              <Typography className={classes.columnDetail} variant={'subtitle2'}>
                {franchiseData?.companyCodeW2 || NA}
              </Typography>
            </Box>

            {/* TODO: commenting this thing as this key is expected to be a string or number but is object currently.*/}
            {/*{!isObjectEmpty(franchiseData?.companyCode) &&*/}
            {/*  Object.entries(franchiseData.companyCode).map(([key, value]) => (*/}
            {/*    <>*/}
            {/*      <Box className={classes.columnDataFlex}>*/}
            {/*        <Typography className={classes.companyCodeTitle} variant={'subtitle2'}>*/}
            {/*          /!*w2:*!/*/}
            {/*          {key}:*/}
            {/*        </Typography>*/}
            {/*        <Typography className={classes.companyCodeText} variant={'body2'}>*/}
            {/*          {value || NA}*/}
            {/*          /!*{franchiseData?.companyCode.w2 || NA}*!/*/}
            {/*        </Typography>*/}
            {/*      </Box>*/}
            {/*    </>*/}
            {/*  ))}*/}
            {/* TODO: Keeping this commented code as I don't know yet that we might need it in future somehow*/}
            {/*{!isObjectEmpty(franchiseData?.companyCode) && (*/}
            {/*  <>*/}
            {/*    <Box className={classes.columnDataFlex}>*/}
            {/*      <Typography className={classes.companyCodeTitle} variant={'subtitle2'}>*/}
            {/*        w2:*/}
            {/*      </Typography>*/}
            {/*      <Typography className={classes.companyCodeText} variant={'body2'}>*/}
            {/*        {franchiseData?.companyCode.w2 || NA}*/}
            {/*      </Typography>*/}
            {/*    </Box>*/}
            {/*    <Box className={classes.columnDataFlex}>*/}
            {/*      <Typography className={classes.companyCodeTitle} variant={'subtitle2'}>*/}
            {/*        1099:*/}
            {/*      </Typography>*/}
            {/*      <Typography className={classes.companyCodeText} variant={'body2'}>*/}
            {/*        {franchiseData?.companyCode['1099'] || NA}*/}
            {/*      </Typography>*/}
            {/*    </Box>*/}
            {/*  </>*/}
            {/*)}*/}
          </Box>
        </Box>
      )}
    </CardContent>
  );

  const additionalcontacts = (
    <CardContent className={classes.cardContainer} sx={{ padding: '0px !important' }}>
      <Box className={classes.cardFlexContent}>
        <Box>
          <Typography variant="subtitle1" className={classes.cardHeading}>
            {t('obx.form.input.textField.additionalContacts.header')}
          </Typography>
        </Box>

        <Box className={classes.cardActionWrapper}>
          {franchiseData?.id && (
            <Link to={`${routes.HO_FRANCHISE_UPDATE}/${franchiseData?.id}`}>
              <EditIcon className={classes.editIcon} />
            </Link>
          )}
        </Box>
      </Box>
      {loading ? (
        <Box className={classes.skeletonWrapperCard}>
          <InfoCardSkeleton noOfRows={4} />
        </Box>
      ) : (
        <Box className={classes.informationCardContact}>
          {franchiseData?.contacts?.length > 0 ? (
            franchiseData?.contacts?.map((a, i) => {
              return (
                <Box key={i} className={classes.mainContentContact}>
                  <Box className={classes.contentDetailContact}>
                    <Typography variant="body3" className={classes.columnHeading}>
                      {t('ho.ho_franchise.detail.franchise_information.personNumber', {
                        count: i + 1,
                      })}
                    </Typography>
                    <Box className={classes.informationEmergencyCard}>
                      <Typography variant="subtitle2" className={classes.nameDetail}>
                        {a?.name}
                        {a?.isEmergencyContact && (
                          <Tooltip title={t('obx.sites.siteInformation.emergencyContact')} arrow>
                            <EmergencyIcon />
                          </Tooltip>
                        )}
                      </Typography>
                      <Box className={classes.inlineFlex}>
                        <Typography variant="body2" className={classes.columnDetailEmail}>
                          {a?.email}
                        </Typography>
                        <Typography variant="body2" className={classes.columnDetail}>
                          {a?.contact}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              );
            })
          ) : (
            <>
              {t('obx.commonText.notAdded.text', {
                name: `Contact`,
              })}
            </>
          )}
        </Box>
      )}
    </CardContent>
  );

  const legalInformation = (
    <Box className={classes.legalInformationSection}>
      {loading ? (
        <>
          <Skeleton animation="wave" variant="rounded" width={140} height={18} sx={{ mb: 2 }} />
          <Box className={classes.legalInformationRow}>
            <Skeleton animation="wave" variant="rounded" width={100} height={10} />
            <Skeleton animation="wave" variant="rounded" width={100} height={10} />
            <Skeleton animation="wave" variant="rounded" width={100} height={10} />
          </Box>
        </>
      ) : (
        <>
          <Typography variant="subtitle1" className={classes.legalInformationTitle}>
            {t('ho.ho_franchise.detail.franchise_information.legalInformation')}
          </Typography>
          <Box className={classes.legalInformationRow}>
            <Box className={classes.legalInformationColumn}>
              <Typography variant="body3" className={classes.columnHeading}>
                {t('ho.ho_franchise.detail.franchise_information.securityLicenseNo')}
              </Typography>
              <Typography variant="subtitle2" className={classes.legalInformationValue}>
                {franchiseData?.licenseNumber || NA}
              </Typography>
            </Box>
            <Box className={classes.legalInformationColumn}>
              <Typography variant="body3" className={classes.columnHeading}>
                {t('ho.ho_franchise.detail.franchise_information.legalEntityName')}
              </Typography>
              <Typography variant="subtitle2" className={classes.legalInformationValue}>
                {franchiseData?.legalEntityName || NA}
              </Typography>
            </Box>
            <Box className={classes.legalInformationColumn}>
              <Typography variant="body3" className={classes.columnHeading}>
                {t('ho.ho_franchise.detail.franchise_information.tCsVersion')}
              </Typography>
              <Typography variant="subtitle2" className={classes.legalInformationValue}>
                {franchiseData?.termsAndConditionsVersion || NA}
              </Typography>
            </Box>
          </Box>
        </>
      )}
    </Box>
  );

  return (
    <>
      <Box className={classes.mainBoxSection}>
        <Box className={classes.internalBoxWrapper}>
          <Card className={classes.cardContentLeft}>{franchiseInformation}</Card>
        </Box>
        <Box className={classes.internalBoxWrapper}>
          <Card className={classes.cardContentRight}>{generalInformation}</Card>
        </Box>
        <Box className={classes.internalBoxWrapper}>
          <Card className={classes.cardContentRight}>{additionalcontacts}</Card>
        </Box>
      </Box>
      {isHomeOfficer && legalInformation}
      <Typography variant="subtitle1" className={classes.mapContent}>
        {t('form.input.textField.geoFencing.header')}
      </Typography>
      <Box className={classes.mapSection}>
        <>
          {loading ? (
            <Box className={classes.mapSkeleton}>
              <Skeleton />
            </Box>
          ) : (
            <MapComponent
              franchiseFormKey="franchiseArea"
              formDataKey={''}
              setErrorMessages={() => {}}
              errorMessages={{}}
              updateFormHandler={() => {}}
              franchiseData={geoLocation}
              createOrUpdate={false}
              key={geoLocation?.franchises?.[0]?.id}
              mapCenter={geoLocation?.franchises?.[0]?.franchiseLocation}
              actionItemType={actionItemTypeKeys.franchise}
            />
          )}
        </>
      </Box>
    </>
  );
}

GeneralInformation.propTypes = {
  geoLocation: PropTypes.object,
  franchiseData: PropTypes.object,
  loading: PropTypes.bool,
};
