import 'slick-carousel/slick/slick-theme.css';
import 'slick-carousel/slick/slick.css';

import { Button, Skeleton } from '@mui/material';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { ReactComponent as EditIcon } from 'assets/icons/editPencilIcon.svg?react';
import { ReactComponent as ArrowLeftIcon } from 'assets/svg/arrow-left.svg?react';
import { ReactComponent as ArrowRightIcon } from 'assets/svg/arrow-right-gray.svg?react';
import { ReactComponent as DeleteIcon } from 'assets/svg/delete-modal.svg?react';
import { ReactComponent as TrashIcon } from 'assets/svg/trash.svg?react';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import Slider from 'react-slick';
import InfoCardSkeleton from 'src/app/components/common/skeletonLoader/infoCardSkeleton';
import SweetAlertModal from 'src/app/components/common/sweetAlertModal';
import {
  ACL_OBX_VEHICLES_DELETE,
  ACL_OBX_VEHICLES_UPDATE,
} from 'src/app/router/constant/OBXMODULE';
import history from 'src/app/router/utils/history';
import RenderIfHasPermission from 'src/hoc/RenderIfHasPermission';
import useDateTime from 'src/hooks/useDateTime';
import { deleteVehicle } from 'src/services/vehicles.services';
import { dayjsFormatsEnum, defaultVehicleImage, toastSettings } from 'src/utils/constants';
import { toaster } from 'src/utils/toast';

import * as routes from '../../../../../router/constant/ROUTE';
import { useStyles } from './commonTabsStyle';

const ArrowNext = (props) => {
  const { className, onClick } = props;
  return <ArrowRightIcon className={className} style={{ color: '#6A6A70' }} onClick={onClick} />;
};

const ArrowPrev = (props) => {
  const { className, onClick } = props;
  return <ArrowLeftIcon className={className} onClick={onClick} />;
};

export default function GeneralInformation({ vehicleData, className, loading }) {
  const { t } = useTranslation();
  const classes = useStyles();
  const { formatDayjsDateTime } = useDateTime();

  const NA = t('commonText.nA');

  const [showModal, setShowModal] = useState(false);
  const [_disabled, setDisabled] = useState(false);
  const handleAlertCancel = () => {
    setShowModal(false);
  };
  const showAlert = () => {
    setShowModal(true);
  };
  const handleDeleteVehicle = async () => {
    try {
      const response = await deleteVehicle(vehicleData?.id);
      setDisabled(false);
      if (response && response?.statusCode === 200) {
        toaster.success({
          text: response?.message,
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
        setTimeout(() => {
          history.push(routes.OBX_VEHICLES);
        }, 1500);
      }
    } catch (error) {
      setDisabled(false);
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    } finally {
      setDisabled(false);
      setShowModal(false);
    }
  };

  const settings = {
    dots: false,
    arrows: vehicleData?.images?.length > 1,
    lazyLoad: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    initialSlide: 1,
    autoplay: false,
    nextArrow: <ArrowNext className={classes.arrowNextSlider} />,
    prevArrow: <ArrowPrev />,
  };

  const vehicleImage = (
    <>
      <CardContent className={classes.cardContainer} sx={{ padding: '0px !important' }}>
        <Box className={classes.cardImgWrapper}>
          {loading ? (
            <Skeleton
              animation="wave"
              variant="rectangular"
              className={classes.cardImageSkeleton}
            />
          ) : vehicleData?.images?.length ? (
            <Slider {...settings}>
              {vehicleData?.images?.map((image) => {
                return (
                  <React.Fragment key={image.id}>
                    <img
                      src={image?.url}
                      alt={vehicleData?.makeModelYear}
                      className={classes.vehicleImage}
                    />
                  </React.Fragment>
                );
              })}
            </Slider>
          ) : (
            <Box className={classes.noImagePlaceholder}>
              <img src={defaultVehicleImage} />
              <Typography variant="subtitle1" className={classes.noImageText}>
                {t('obx.vehicles.noImageText')}
              </Typography>
            </Box>
          )}
        </Box>
      </CardContent>
    </>
  );

  const generalInformation = (
    <CardContent className={classes.cardContainer} sx={{ padding: '0px !important' }}>
      <Box className={classes.cardFlexContent}>
        <Typography variant="subtitle1" className={classes.cardHeading}>
          {t('ho.vehicle.detail.vehicle_information.title')}
        </Typography>
        <RenderIfHasPermission name={ACL_OBX_VEHICLES_UPDATE}>
          <Link
            to={`${routes.OBX_VEHICLE_FORM}?id=${vehicleData?.id}`}
            className={classes.editIcon}
          >
            <EditIcon className={classes.editIcon} />
          </Link>
        </RenderIfHasPermission>
      </Box>

      {loading ? (
        <Box className={classes.skeletonWrapperCard}>
          <InfoCardSkeleton noOfRows={4} />
        </Box>
      ) : (
        <Box className={classes.informationCard}>
          <Box className={classes.mainContent}>
            <Box className={classes.contentDetail}>
              <Typography className={classes.columnHeading} variant="body3">
                {t('ho.vehicle.detail.vehicle_information.reg')}
              </Typography>
              <Typography variant="subtitle2" className={classes.columnDetail}>
                {vehicleData?.registrationNumber || NA}
              </Typography>
            </Box>
            <Box className={classes.contentDetail}>
              <Typography className={classes.columnHeading} variant="body3">
                {t('ho.vehicle.detail.vehicle_information.makeModeYear')}
              </Typography>
              <Typography classvariant="subtitle2" className={classes.columnDetail}>
                {vehicleData?.makeModelYear || NA}
              </Typography>
            </Box>
            <Box className={classes.contentDetail}>
              <Typography className={classes.columnHeading} variant="body3">
                {t('ho.vehicle.detail.vehicle_information.createdAt')}
              </Typography>
              <Typography variant="subtitle2" className={classes.columnDetail}>
                {formatDayjsDateTime({
                  value: vehicleData?.createdAt,
                  formatType: dayjsFormatsEnum.date,
                })}
              </Typography>
            </Box>
            <Box className={classes.contentDetail}>
              <Typography className={classes.columnHeading} variant="body3">
                {t('ho.vehicle.detail.vehicle_information.lastMaintained')}
              </Typography>
              <Typography variant="subtitle2" className={classes.columnDetail}>
                {formatDayjsDateTime({
                  value: vehicleData?.lastMaintenance,
                  formatType: dayjsFormatsEnum.date,
                })}
              </Typography>
            </Box>
          </Box>
          <Box className={classes.mainContent}>
            <Box className={classes.contentDetail}>
              <Typography className={classes.columnHeading} variant="body3">
                {t('ho.vehicle.detail.vehicle_information.assignedTo')}
              </Typography>
              <Typography variant="subtitle2" className={classes.columnDetail}>
                {vehicleData?.zone?.name || NA}
              </Typography>
            </Box>
          </Box>
        </Box>
      )}
    </CardContent>
  );

  return (
    <>
      <Box className={className}>
        <Box className={classes.mainBoxSection}>
          <Box className={classes.internalBoxWrapper}>
            <Card className={classes.cardContent}>{generalInformation}</Card>
          </Box>
          <Box className={classes.internalBoxWrapper}>
            <Box className={classes.internalBox}>{vehicleImage}</Box>
          </Box>
        </Box>
        <RenderIfHasPermission name={ACL_OBX_VEHICLES_DELETE}>
          <Box className={classes.mapSection}>
            <Box onClick={showAlert}>
              <Button variant="destructiveSecondary" startIcon={<TrashIcon />}>
                {t('ho.vehicle.detail.vehicle_information.removeButton')}
              </Button>
            </Box>
          </Box>
        </RenderIfHasPermission>
      </Box>
      <SweetAlertModal
        type="warning"
        title={t('commonText.modal.areYouSure.title')}
        text={t('commonText.modal.areYouSure.desc')}
        cancelButtonText={t('buttons.no')}
        confirmButtonText={t('buttons.yes')}
        show={showModal}
        handleConfirmButton={handleDeleteVehicle}
        handleCancelButton={handleAlertCancel}
        icon={<DeleteIcon />}
      />
    </>
  );
}

GeneralInformation.propTypes = {
  className: PropTypes.string,
  vehicleData: PropTypes.object,
  loading: PropTypes.bool,
};

ArrowNext.propTypes = {
  className: PropTypes.string,
  onClick: PropTypes.func,
};

ArrowPrev.propTypes = {
  className: PropTypes.string,
  onClick: PropTypes.func,
};
