import { Box, Button, Chip, CircularProgress, Skeleton, Tooltip, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { callFromMonitoringServiceTypeOptions } from 'src/app/obx/pages/dispatch/helper';
import { getTimeDiff, getTimeDiffWithFormat } from 'src/app/obx/pages/schedules/helper';
import { ACL_OBX_DISPATCH_UPDATE } from 'src/app/router/constant/OBXMODULE';
import { AddIcon } from 'src/assets/svg';
import { ReactComponent as DownloadIcon } from 'src/assets/svg/DownloadIcon.svg?react';
import { ReactComponent as EditIcon } from 'src/assets/svg/edit.svg?react';
import { useApiControllers } from 'src/helper/axios';
import { useTenantLabel } from 'src/helper/utilityHooks';
import RenderIfHasPermission from 'src/hoc/RenderIfHasPermission';
import useDateTime from 'src/hooks/useDateTime';
import { downloadDispatchCallerDetails } from 'src/services/dispatch.services';
import { toastSettings } from 'src/utils/constants';
import { dayjsFormatsEnum } from 'src/utils/constants';
import { toaster } from 'src/utils/toast';

import AdditionalServiceModal from '../../../components/additionalServiceModal';
import { DISPATCH_STATUS_ENUM } from '../../../dispatch.constant';
import UpdateAddressModal from '../../updateAddressModal';
import { useStyles } from './dipacthDetails';

const showTimeElapsedWarning = (dispatch, t) => {
  return (
    getTimeDiff(dispatch?.createdAt, new Date(), 'minute') > dispatch?.threshold &&
    dispatch?.status === DISPATCH_STATUS_ENUM(t).assigned.value
  );
};

const DipacthDetails = ({ dispatch, loading, refetchDispatch = () => {} }) => {
  const classes = useStyles();
  const { getNewApiController } = useApiControllers();
  const [downloadingCallerDetails, setDownloading] = useState(false);
  const [updateAddressModalOpen, setUpdateAddressModalOpen] = useState(false);

  const { t } = useTranslation();
  let findCloseCompletedDispatch = null;
  if (dispatch) {
    findCloseCompletedDispatch = dispatch?.logs?.find(
      (log) =>
        log?.status === DISPATCH_STATUS_ENUM(t)?.completed.value ||
        log?.status === DISPATCH_STATUS_ENUM(t)?.close.value ||
        log.status === 'closed',
    );
  }
  const NA = t('commonText.nA');
  const { formatDayjsDateTime } = useDateTime();
  const { getLabel } = useTenantLabel();
  // const { data: DISPATCH_TYPE_ENUM } = usePersistentApiData('dispatch-types', getDispatchTypes);
  const [openServiceModal, setOpenServiceModal] = useState(false);

  const warning = showTimeElapsedWarning(dispatch, t);

  const isCloseOrCompleted = [
    DISPATCH_STATUS_ENUM(t)?.close.value,
    DISPATCH_STATUS_ENUM(t)?.completed.value,
  ].includes(dispatch?.status);

  const isNotNewAlarmAndSameAsSiteAddress =
    dispatch?.status !== DISPATCH_STATUS_ENUM(t)?.new_alarm.value && dispatch?.sameAddressAsSite;

  const isEditAddressDisabled = isCloseOrCompleted || isNotNewAlarmAndSameAsSiteAddress;

  const handleOpenServiceModal = () => {
    setOpenServiceModal(true);
  };

  const handleCloseServiceModal = () => {
    setOpenServiceModal(false);
  };

  const downloadLocalPDf = (url) => {
    try {
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute(
        'download',
        `${dispatch?.callerDetail?.callerName || ''}_${dispatch?.id}_caller_details.pdf`,
      );

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toaster.success({
        text: t('obx.dispatch.downloadDetailsSuccess', {
          dispatch: getLabel('terms', 'dispatch', t),
        }),
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    } catch {
      toaster.error({
        text: t('obx.dispatch.downloadDetailsFail', {
          dispatch: getLabel('terms', 'dispatch', t).toLowerCase(),
        }),
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };

  const downloadCaller = async () => {
    const apiController = getNewApiController();
    try {
      setDownloading(true);
      const response = await downloadDispatchCallerDetails(dispatch?.id, {
        signal: apiController.signal,
        responseType: 'blob',
      });

      const url = URL.createObjectURL(response);

      downloadLocalPDf(url);
    } catch (error) {
      if (!apiController.signal.aborted) {
        toaster.error({
          text: t('obx.dispatch.downloadDetailsFail', {
            dispatch: getLabel('terms', 'dispatch', t).toLowerCase(),
          }),
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
      }
    } finally {
      setDownloading(false);
    }
  };

  if (loading)
    return (
      <Box className={classes.dispatchSkelton}>
        <Skeleton variant="text" height={'50px'} />
        <Skeleton variant="text" height={'50px'} />
        <Skeleton variant="text" height={'50px'} />
        <Skeleton variant="text" height={'50px'} />
      </Box>
    );

  return (
    <>
      <Box className={classes.dipacthDetails}>
        <Box className={classes.dipatchInfoRow}>
          <Box className={classes.dipatchTitleRow}>
            <Typography variant="h3" className={classes.intabHeading}>
              {`${t('obx.dispatch.generalInformation')}`}
            </Typography>

            {downloadingCallerDetails ? (
              <Box marginRight={2}>
                <CircularProgress size={14} />
              </Box>
            ) : (
              <Button
                startIcon={<DownloadIcon />}
                disableRipple
                className={classes.downloadCallerButton}
                variant="text-only"
                onClick={downloadCaller}
              >
                {t('obx.dispatch.download')}
              </Button>
            )}
          </Box>
          <Box className={classes.dipatchRowBox}>
            <Box className={classes.dipatchRowDate}>
              <Typography variant="body3" className={classes.textLabel}>
                {`${t('obx.dispatch.id', {
                  dispatch: getLabel('terms', 'dispatch', t),
                })}`}
              </Typography>
              <Typography variant="body2" className={classes.textDetail}>
                {dispatch?.uuid || NA}
              </Typography>
            </Box>
            <Box className={classes.dipatchRowDate}>
              <Typography variant="body3" className={classes.textLabel}>
                {`${t('obx.dispatch.createdBy')}`}
              </Typography>
              <Typography variant="body2" className={classes.textDetail}>
                {dispatch?.createdBy}
              </Typography>
            </Box>
            <Box className={classes.dipatchRowDate}>
              <Typography variant="body3" className={classes.textLabel}>
                {`${t('obx.dispatch.timeElapsed')}`}
              </Typography>
              {warning ? (
                <Tooltip
                  title={`${t('obx.dispatch.alertsMRTsTooltip', { dispatch: getLabel('terms', 'dispatch', t).toLowerCase(), officer: getLabel('roles', 'officer', t).toLowerCase() })}`}
                  arrow
                >
                  <Chip
                    label={getTimeDiffWithFormat(dispatch?.createdAt, new Date())}
                    className={classes.pulseAnimation}
                  />
                </Tooltip>
              ) : (
                <Chip
                  label={
                    findCloseCompletedDispatch
                      ? getTimeDiffWithFormat(
                          dispatch?.createdAt,
                          findCloseCompletedDispatch?.datetime,
                        )
                      : getTimeDiffWithFormat(dispatch?.createdAt, new Date())
                  }
                  className={classes.textLabelChip}
                />
              )}
            </Box>
          </Box>
          <Box className={[classes.dipatchRowDateFull, classes.dipatchRowBox]}>
            <Box className={classes.dipatchRowDate}>
              <Typography variant="body3" className={classes.textLabel}>
                {`${t('obx.dispatch.createdAt')}`}
              </Typography>
              <Typography variant="body2" className={classes.textDetail}>
                {formatDayjsDateTime({
                  value: dispatch?.createdAt,
                  formatType: dayjsFormatsEnum.dateTime,
                })}
              </Typography>
            </Box>
            <Box className={classes.dipatchRowDate}>
              <Typography variant="body3" className={classes.textLabel}>
                {`${t('obx.dispatch.runsheetShfitName', { runsheet: getLabel('terms', 'runsheet', t) })}`}
              </Typography>
              <Typography variant="body2" className={classes.textDetail}>
                {dispatch?.assignee?.shiftName || NA}
              </Typography>
            </Box>
            <Box className={classes.dipatchRowDate}>
              <Typography variant="body3" className={classes.textLabel}>
                {`${t('obx.dispatch.moniteroingService')}`}
              </Typography>
              <Typography variant="body2" className={classes.textDetail}>
                {callFromMonitoringServiceTypeOptions(t)?.find(
                  (a) => a.value === dispatch?.callerDetail?.monitoringServiceType,
                )?.label || NA}
              </Typography>
            </Box>
          </Box>
          <Box className={[classes.dipatchRowDateFull, classes.dipatchRowBox]}>
            <Box className={classes.dipatchRowDate}>
              <Typography variant="body3" className={classes.textLabel}>
                {`${t('obx.dispatch.jobId')}`}
              </Typography>
              <Typography variant="body2" className={classes.textDetail}>
                {dispatch?.jobId || NA}
              </Typography>
            </Box>
          </Box>
        </Box>
        <Box className={classes.space}></Box>
        <Box className={classes.dipatchInfoRow}>
          <Box className={classes.dipatchTitleRow}>
            <Typography variant="h3" className={classes.intabHeading}>
              {`${t('obx.dispatch.callerDetails')}`}
            </Typography>
          </Box>

          <Box className={classes.dipatchRowBox}>
            <Box className={classes.dipatchRowDate}>
              <Typography variant="body3" className={classes.textLabel}>
                {`${t('obx.dispatch.callerPhoneNo')}`}
              </Typography>
              <Typography variant="body2" className={classes.textDetail}>
                {dispatch?.callerDetail?.phoneNo || NA}
              </Typography>
            </Box>
            <Box className={classes.dipatchRowDate}>
              <Typography variant="body3" className={classes.textLabel}>
                {`${t('obx.dispatch.callerName')}`}
              </Typography>
              <Typography variant="body2" className={classes.textDetail}>
                {dispatch?.callerDetail?.callerName || NA}
              </Typography>
            </Box>
            <Box className={classes.dipatchRowDate}>
              <Typography variant="body3" className={classes.textLabel}>
                {`${t('obx.dispatch.buildingNumber')}`}
              </Typography>
              <Typography variant="body2" className={classes.textDetail}>
                {dispatch?.callerDetail?.buildingNumber || NA}
              </Typography>
            </Box>
          </Box>

          <Box className={[classes.dipatchRowDateFull, classes.dipatchRowBox]}>
            <Box className={classes.dipatchRowDate}>
              <Typography variant="body3" className={classes.textLabel}>
                {`${t('obx.dispatch.apartmentNumber')}`}
              </Typography>
              <Typography variant="body2" className={classes.textDetail}>
                {dispatch?.callerDetail?.apartmentNumber || NA}
              </Typography>
            </Box>
            <Box className={classes.dipatchRowDate}>
              <Typography variant="body3" className={classes.textLabel}>
                {`${t('obx.dispatch.callerAddress')}`}
              </Typography>
              <Typography variant="body2" className={classes.textDetail}>
                {dispatch?.callerDetail?.address || NA}
              </Typography>
            </Box>
            <Box className={classes.dipatchRowDate}></Box>
          </Box>
        </Box>

        <Box className={classes.space}></Box>
        <Box className={classes.dipatchInfoRow}>
          <Box className={classes.dipatchTitleRow}>
            <Typography variant="h3" className={classes.intabHeading}>
              {`${t('obx.dispatch.dispatchDetails', {
                dispatch: getLabel('terms', 'dispatch', t),
              })}`}
            </Typography>
            <RenderIfHasPermission name={ACL_OBX_DISPATCH_UPDATE}>
              <Button
                startIcon={<EditIcon />}
                className={classes.addButton}
                variant="contained"
                color="primary"
                onClick={() => setUpdateAddressModalOpen(true)}
                disabled={isEditAddressDisabled}
              >
                {`${t('obx.dispatch.editAddress.editAddressCta')}`}
              </Button>
            </RenderIfHasPermission>
          </Box>
          <Box className={classes.dipatchRowBox}>
            <Box className={classes.dipatchRowDate}>
              <Typography variant="body3" className={classes.textLabel}>
                {`${t('obx.dispatch.callBackRequest')}`}
              </Typography>
              <Typography variant="body2" className={classes.textDetail}>
                {dispatch?.callerDetail?.callbackRequest ? 'Yes' : 'No'}
              </Typography>
            </Box>
            <Box className={classes.dipatchRowDate}>
              <Typography variant="body3" className={classes.textLabel}>
                {`${t('obx.dispatch.dispatchType', {
                  dispatch: getLabel('terms', 'dispatch', t),
                })}`}
              </Typography>
              <Typography variant="body2" className={classes.textDetail}>
                {dispatch?.dispatchType || NA}
              </Typography>
            </Box>
            <Box className={classes.dipatchRowDate}>
              <Typography variant="body3" className={classes.textLabel}>
                {`${t('obx.dispatch.contract')}`}
              </Typography>
              <Typography variant="body2" className={classes.textDetail}>
                <Chip label={dispatch?.site?.contractName} className={classes.textLabelChip} />
              </Typography>
            </Box>
          </Box>
          <Box className={[classes.dipatchRowDateFull, classes.dipatchRowBox]}>
            <Box className={classes.dipatchRowDate}>
              <Typography variant="body3" className={classes.textLabel}>
                {`${t('obx.dispatch.callDescription')}`}
              </Typography>
              <Typography variant="body2" className={classes.textDetail}>
                <Box
                  className={classes.htmlDescription}
                  dangerouslySetInnerHTML={{
                    __html: dispatch?.callerDetail?.description || NA,
                  }}
                />
              </Typography>
            </Box>
            <Box className={classes.dipatchRowDate}>
              <Typography variant="body3" className={classes.textLabel}>
                {`${t('obx.dispatch.address', { dispatch: getLabel('terms', 'dispatch', t) })}`}
              </Typography>
              <Typography variant="body2" className={classes.textDetail}>
                {(dispatch?.sameAddressAsSite
                  ? t('obx.dispatch.sameAsSiteAddress')
                  : dispatch?.address) || NA}
              </Typography>
            </Box>
            <Box className={classes.dipatchRowDate}></Box>
          </Box>
        </Box>
        <Box className={classes.space}></Box>
        <Box className={classes.dipatchInfoRow}>
          <Box className={classes.addButtonContainer}>
            <Typography variant="h3" className={classes.intabHeading}>
              {`${t('obx.dispatch.additionalDetails')}`}
            </Typography>
            <RenderIfHasPermission name={ACL_OBX_DISPATCH_UPDATE}>
              {dispatch?.additionalDetails ? (
                <Button
                  startIcon={<EditIcon />}
                  className={classes.addButton}
                  variant="contained"
                  color="primary"
                  onClick={() => setOpenServiceModal(true)}
                  disabled={[
                    DISPATCH_STATUS_ENUM(t)?.on_site.value,
                    DISPATCH_STATUS_ENUM(t)?.completed.value,
                    DISPATCH_STATUS_ENUM(t)?.close.value,
                  ].includes(dispatch?.status)}
                >
                  {`${t('obx.dispatch.editButton')}`}
                </Button>
              ) : null}
            </RenderIfHasPermission>
          </Box>
          {!dispatch?.additionalDetails ? (
            <RenderIfHasPermission name={ACL_OBX_DISPATCH_UPDATE}>
              <Button
                startIcon={<AddIcon />}
                className={classes.addButton}
                variant="contained"
                color="primary"
                onClick={handleOpenServiceModal}
                disabled={[
                  DISPATCH_STATUS_ENUM(t)?.on_site.value,
                  DISPATCH_STATUS_ENUM(t)?.completed.value,
                  DISPATCH_STATUS_ENUM(t)?.close.value,
                ].includes(dispatch?.status)}
              >
                {`${t('obx.dispatch.addButton')}`}
              </Button>
            </RenderIfHasPermission>
          ) : null}
        </Box>
        {dispatch?.additionalDetails ? (
          <Box className={classes.dipatchInfoRow}>
            <Box
              className={classes.textDetail}
              flex={'0.7'}
              dangerouslySetInnerHTML={{
                __html: dispatch?.additionalDetails,
              }}
            />
          </Box>
        ) : null}
      </Box>
      {openServiceModal && (
        <AdditionalServiceModal
          openModal={openServiceModal}
          handleCloseModal={handleCloseServiceModal}
          mode="edit"
          dispatch={dispatch}
          refetchDispatch={refetchDispatch}
        />
      )}
      {updateAddressModalOpen && (
        <UpdateAddressModal
          openModal={updateAddressModalOpen}
          handleCloseModal={() => setUpdateAddressModalOpen(false)}
          dispatch={dispatch}
          refetchDispatch={refetchDispatch}
        />
      )}
    </>
  );
};

DipacthDetails.propTypes = {
  loading: PropTypes.bool,
  dispatch: PropTypes.object,
  refetchDispatch: PropTypes.func,
};

export default DipacthDetails;
