import { Skeleton } from '@mui/material';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { ReactComponent as EditIcon } from 'assets/icons/editPencilIcon.svg?react';
import { ReactComponent as DeleteIcon } from 'assets/svg/delete-modal.svg?react';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
// import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { deleteZone } from 'services/zone.service';
import InfoCardSkeleton from 'src/app/components/common/skeletonLoader/infoCardSkeleton';
import SweetAlertModal from 'src/app/components/common/sweetAlertModal';
import { ACL_OBX_ZONES_DELETE, ACL_OBX_ZONES_UPDATE } from 'src/app/router/constant/OBXMODULE';
import history from 'src/app/router/utils/history';
import { isObjectEmpty } from 'src/helper/utilityFunctions';
import { useTenantLabel } from 'src/helper/utilityHooks';
import RenderIfHasPermission from 'src/hoc/RenderIfHasPermission';
import {
  actionItemTypeKeys,
  geoFencingPolygonTypeKeys,
  // rolesEnum,
  toastSettings,
} from 'src/utils/constants';
import { toaster } from 'src/utils/toast';

import MapComponent from '../../../../../components/common/geoFencing';
import * as routes from '../../../../../router/constant/ROUTE';
import { useStyles } from './commonTabsStyles';
export default function GeneralInformation({ zonesData, franchiseData, loading }) {
  const { t } = useTranslation();
  const { getLabel } = useTenantLabel();
  const classes = useStyles();
  const zoneData = zonesData;
  // const [disabled, setDisabled] = useState(false);
  const { _name, sites, supervisors, _phoneNumber, _officers, _email } = zoneData;
  const [showModal, setShowModal] = useState(false);
  // const { userRole } = useSelector((state) => state.auth);

  const _NA = t('commonText.nA');

  const handleAlertCancel = () => {
    setShowModal(false);
  };
  // const showAlert = () => {
  //   setShowModal(true);
  // };
  const handleDeleteZone = async () => {
    try {
      const response = await deleteZone(zoneData?.id);
      setDisabled(false);
      if (response && response?.statusCode === 200) {
        toaster.delete({
          text: response?.message,
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
        history.push(`${routes.OBX_ZONES}`);
      }
    } catch (error) {
      setDisabled(false);
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    } finally {
      setShowModal(false);
    }
  };
  /**
   * Card for Zone Information
   */
  // const Information = (
  //   <>
  //     <CardContent className={classes.cardContainer} sx={{ padding: '0px !important' }}>
  //       <Box className={classes.cardFlexContent}>
  //         <Box>
  //           <Typography variant="subtitle1" className={classes.cardHeading}>
  //             {t('ho.zones.detail.zones_information.title')}
  //           </Typography>
  //         </Box>
  //         <Box>
  //           {zoneData?.id && (
  //             <Link
  //               to={`${routes.OBX_FRANCHISE_ZONE}/${zoneData?.id}`}
  //               className={classes.editIcon}
  //             >
  //               <EditIcon className={classes.editIcon} />
  //             </Link>
  //           )}
  //         </Box>
  //       </Box>
  //       {loading ? (
  //         <Box className={classes.skeletonWrapperCard}>
  //           <InfoCardSkeleton noOfRows={3} />
  //         </Box>
  //       ) : (
  //         <Box className={classes.informationCard}>
  //           <Box className={classes.mainContent}>
  //             <Box className={classes.contentDetail}>
  //               <Typography className={classes.columnHeading} variant="body3">
  //                 {t('ho.zones.detail.zones_information.name')}
  //               </Typography>
  //               <Typography variant="subtitle2" className={classes.columnDetail}>
  //                 {name || NA}
  //               </Typography>
  //             </Box>
  //             <Box className={classes.contentDetail}>
  //               <Typography className={classes.columnHeading} variant="body3">
  //                 {t('ho.zones.detail.zones_information.email')}
  //               </Typography>
  //               <Typography variant="subtitle2" className={classes.columnDetail}>
  //                 {email || NA}
  //               </Typography>
  //             </Box>
  //             <Box className={classes.contentDetail}>
  //               <Typography className={classes.columnHeading} variant="body3">
  //                 {t('ho.zones.detail.zones_information.number')}
  //               </Typography>

  //               <Typography variant="subtitle2" className={classes.columnDetail}>
  //                 {phoneNumber || NA}
  //               </Typography>
  //             </Box>
  //           </Box>
  //         </Box>
  //       )}
  //     </CardContent>
  //   </>
  // );

  const CardComponent = ({ input, header, subHeading, UIKey, currentlyShowing }) => {
    const data = input?.slice(0, 5);
    return (
      <>
        <CardContent className={classes.cardContainer} sx={{ padding: '0px !important' }}>
          <Box className={classes.cardFlexContent}>
            <Box>
              <Typography variant="subtitle1" className={classes.cardHeading}>
                {header}
              </Typography>
            </Box>
            <Box>
              <Link
                to={`${routes.OBX_FRANCHISE_ZONE}/${zoneData?.id}`}
                className={classes.editIcon}
              >
                <RenderIfHasPermission name={ACL_OBX_ZONES_UPDATE}>
                  <>{!loading && <EditIcon className={classes.editIcon} />}</>
                </RenderIfHasPermission>
              </Link>
            </Box>
          </Box>
          {loading ? (
            <Box className={classes.skeletonWrapperCard}>
              <InfoCardSkeleton noOfRows={4} />
            </Box>
          ) : (
            <Box className={classes.informationCard}>
              <Box className={classes.mainContent}>
                {data?.length > 0 ? (
                  data?.map((site, i) => (
                    <Box className={classes.contentDetail} key={i}>
                      <Typography className={classes.columnHeading} variant="body3">
                        {subHeading} {`${i + 1}`}
                      </Typography>
                      <Typography variant="subtitle2" className={classes.columnDetail}>
                        {site?.[UIKey] || site?.name || site?.siteName}
                      </Typography>
                    </Box>
                  ))
                ) : (
                  <>
                    {currentlyShowing === 'sites' ? (
                      <>
                        {t('obx.commonText.notAdded.text', {
                          name: `Sites`,
                        })}
                      </>
                    ) : (
                      <>
                        {t('obx.commonText.notAdded.text', {
                          name: `Officers`,
                        })}
                      </>
                    )}
                  </>
                )}
              </Box>
            </Box>
          )}
        </CardContent>
      </>
    );
  };

  CardComponent.propTypes = {
    input: PropTypes.string,
    header: PropTypes.string,
    subHeading: PropTypes.string,
    UIKey: PropTypes.string,
    currentlyShowing: PropTypes.string,
  };

  return (
    <Box className={classes.mainWrapper}>
      <Box className={classes.mainBoxSection}>
        {/* <Box className={classes.internalBoxWrapper}>
          <Card className={classes.cardContent}>{Information}</Card>
        </Box> */}
        <Box className={classes.internalBoxWrapper}>
          <Card className={classes.cardContent}>
            {' '}
            <CardComponent
              input={supervisors}
              header={t('ho.zones.detail.zones_information.zoneSupervisors', {
                supervisors: getLabel('terms', 'supervisors', t),
              })}
              subHeading={getLabel('roles', 'supervisor', t)}
              UIKey={'name'}
              currentlyShowing={'supervisors'}
            />
          </Card>
        </Box>
        <Box className={classes.internalBoxWrapper}>
          <Card className={classes.cardContent}>
            {/* {sites?.length && ( */}
            <CardComponent
              input={sites}
              header={t('ho.zones.detail.zones_information.zoneSites')}
              subHeading={t('obx.commonText.standAloneSite')}
              UIKey={'name'}
              currentlyShowing={'sites'}
            />
            {/* )} */}
          </Card>
        </Box>
        {/* <Box className={classes.internalBoxWrapper}>
          <Card className={classes.cardContent}>
            {officers?.length && (
              <CardComponent
                input={officers}
                header={t('ho.zones.detail.zones_information.officers')}
                subHeading={t('ho.zones.detail.zones_information.officer')}
                UIKey={'name'}
                currentlyShowing={'officers'}
              />
            )}
          </Card>
        </Box> */}
      </Box>

      <Typography variant="subtitle1" className={classes.mapContent}>
        {t('form.input.textField.zoneOverView.header')}
      </Typography>
      {loading ? (
        <Box className={classes.mapSkeleton}>
          <Skeleton />
        </Box>
      ) : (
        <>
          <Box className={classes.mapSection}>
            {franchiseData?.franchises?.length &&
              franchiseData?.franchises?.[0] &&
              !isObjectEmpty(franchiseData?.franchises?.[0]?.franchiseLocation) && (
                <MapComponent
                  key={zoneData?.id}
                  errorMessages={{}}
                  setErrorMessages={() => {}}
                  parentBoundry={{}}
                  updateFormHandler={() => {}}
                  createOrUpdate={false}
                  mapCenter={franchiseData?.franchises?.[0]?.franchiseLocation}
                  franchiseArea={zoneData}
                  formDataKey={geoFencingPolygonTypeKeys.zones}
                  actionItem={{}}
                  franchiseData={franchiseData}
                  actionItemType={actionItemTypeKeys.zone}
                />
              )}
          </Box>
          <RenderIfHasPermission name={ACL_OBX_ZONES_DELETE}>
            <>
              {/* {userRole?.slug !== rolesEnum.supervisor && (
                <Box className={classes.deleteZoneBtnWrapper}>
                  <Button
                    variant="destructiveSecondary"
                    disabled={disabled}
                    type="click"
                    onClick={showAlert}
                  >
                    {t('commonText.deleteZone')}
                  </Button>
                </Box>
              )} */}
            </>
          </RenderIfHasPermission>
        </>
      )}
      <SweetAlertModal
        type="warning" // 'success', 'error', 'warning', 'info', etc.
        title={t('commonText.modal.areYouSure.deleteZone')}
        text={t('commonText.modal.areYouSure.descZone')}
        cancelButtonText={t('buttons.no')}
        confirmButtonText={t('buttons.yes')}
        show={showModal}
        handleConfirmButton={handleDeleteZone}
        handleCancelButton={handleAlertCancel}
        icon={<DeleteIcon />}
      />
    </Box>
  );
}

GeneralInformation.propTypes = {
  children: PropTypes.node,
  zonesData: PropTypes.object,
  franchiseData: PropTypes.object,
  loading: PropTypes.bool,
};
