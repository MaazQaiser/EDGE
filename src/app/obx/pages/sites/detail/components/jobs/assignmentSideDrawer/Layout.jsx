import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Box, Button, Chip, Skeleton, Typography } from '@mui/material';
import { ReactComponent as CloseIcon } from 'assets/svg/close.svg?react';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  dayjsWithStandardOffset,
  getCurrentStandardTimeInIsoWrtTimezone,
  isEarlierThan,
  isShiftScheduleFullyCancelled,
} from 'src/app/obx/pages/schedules/helper';
import DedicatedHeaderEditButton from 'src/app/obx/pages/schedules/shiftDetail/components/dedicatedHeaderEditButton';
import EditShiftTimeModal from 'src/app/obx/pages/schedules/shiftDetail/editShiftTimeModal';
import { ACL_OBX_SCHEDULES_DELETE } from 'src/app/router/constant/OBXMODULE';
import { isObjectEmpty, shiftTypeEnumValue } from 'src/helper/utilityFunctions';
import { useTenantLabel } from 'src/helper/utilityHooks';
import useDateTime from 'src/hooks/useDateTime';
import userHasPermission from 'src/utils/auth/userHasPermission';
import { DUTY_TYPES, toastSettings } from 'src/utils/constants';
import { calendarShiftStatusEnum, DRAWER_TYPE } from 'src/utils/constants/schedules';
import { toaster } from 'src/utils/toast';

import ShiftFullyCancelledInfoIcon from '../ShiftFullyCancelledInfoIcon';
import { useStyles } from './assignmentSideDrawer.styles';
import CancelShiftModal from './CancelShiftModal';
import RestoreShiftModal from './RestoreShiftModal';

const Layout = ({
  drawerData,
  changeOnlyDrawerType,
  closeSideDrawer,
  handleSubmit,
  children,
  clearTemplateStates,
  shiftDetail,
  loading,
  disableActionBtn,
  isPatrol,
  title,
  refetchSchedule,
  onOpenDedicatedSplitShift,
  onCancelShift,
  onRestoreShift,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const [showEditJobTimeModal, setShowEditJobTimeModal] = useState(false);
  const [showCancelShiftDrawer, setShowCancelShiftDrawer] = useState(false);
  const [showRestoreShiftModal, setShowRestoreShiftModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [canEditTime, setCanEditTime] = useState(false);

  const { getLabel } = useTenantLabel();
  const { dateformat } = useDateTime();
  const handleOpenDedicatedSplitShift = () => {
    if (!shiftDetail) return;
    if (isShiftScheduleFullyCancelled(shiftDetail)) {
      toaster.info({
        text: t('obx.schedules.assignDedicatedDuty.assignShift.shiftScheduleCancelled'),
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
      return;
    }
    setShowEditJobTimeModal(false);
    onOpenDedicatedSplitShift?.(shiftDetail);
  };

  const headerTitle = {
    [DRAWER_TYPE.ASSIGN]: t('obx.schedules.assignDedicatedDuty.assignShift.title.shift'),
    [DRAWER_TYPE.TOUR_TEMPLATE]: t(
      'obx.schedules.assignDedicatedDuty.assignShift.title.tourTemplate',
      {
        tour: getLabel('terms', 'tour'),
      },
    ),
    [DRAWER_TYPE.REASSIGNMENT]: t(
      'obx.schedules.assignDedicatedDuty.assignShift.title.reassignment',
    ),
    [DRAWER_TYPE.EDIT_REASSIGNMENT]: t(
      'obx.schedules.assignDedicatedDuty.assignShift.title.editReassignment',
    ),
    [DRAWER_TYPE.SPLIT]: shiftDetail?.name,
    [DRAWER_TYPE.TOUR_ASSIGNMENT]: t(
      'obx.schedules.assignDedicatedDuty.assignShift.title.tourAssignment',
      {
        tour: getLabel('terms', 'tour'),
      },
    ),
    [DRAWER_TYPE.TOUR_TEMPLATE_PATROL]: t(
      'obx.schedules.assignDedicatedDuty.assignShift.title.tourTemplate',
      {
        tour: getLabel('terms', 'tour'),
      },
    ),
  };

  useEffect(() => {
    if (isObjectEmpty(shiftDetail)) return;
    const now = getCurrentStandardTimeInIsoWrtTimezone();
    const currentShiftStatus = shiftDetail?.shiftStatus || shiftDetail?.scheduleStatus;
    const isEditableShiftStatus = [
      calendarShiftStatusEnum?.NOT_STARTED,
      calendarShiftStatusEnum?.UNASSIGNED,
      calendarShiftStatusEnum?.UPCOMING,
      calendarShiftStatusEnum?.SHIFT_STARTED,
    ].includes(currentShiftStatus);
    const hasShiftNotEnded = !isEarlierThan(shiftDetail?.selectedShiftEndTime, now);
    const isExtraShift = shiftDetail?.shiftType === DUTY_TYPES.extra.toLowerCase();

    const isCancelledDedicated = shiftDetail?.isCancelled ?? false;
    const isScheduleFullyCancelled = isShiftScheduleFullyCancelled(shiftDetail);

    setCanEditTime(
      isCancelledDedicated ||
        isScheduleFullyCancelled ||
        (drawerData?.fromJobSection && !isExtraShift) ||
        (isEditableShiftStatus && hasShiftNotEnded && !isExtraShift),
    );
  }, [shiftDetail, drawerData?.fromJobSection]);

  const headerDayjs = dayjsWithStandardOffset(getCurrentStandardTimeInIsoWrtTimezone());
  const drawerShiftDateLabel = headerDayjs?.isValid()
    ? `${headerDayjs.format('ddd')}, ${headerDayjs.format(dateformat)}`
    : '';

  const handleCancelShiftConfirm = async (payload) => {
    const isSuccess = await onCancelShift?.(payload);
    if (isSuccess) {
      setShowCancelShiftDrawer(false);
      closeSideDrawer();
    }
  };

  const handleRestoreShiftConfirm = async () => {
    const isSuccess = await onRestoreShift?.();
    if (isSuccess) {
      setShowRestoreShiftModal(false);
      closeSideDrawer();
    }
  };

  return (
    <Box className={classes.assignDrawer}>
      {/* Header */}
      <Box className={classes.assignDrawerHeader}>
        <Box className={classes.assignDrawerHeaderTop}>
          <Box className={classes.assignDrawerHeaderTours}>
            {[
              DRAWER_TYPE.TOUR_TEMPLATE,
              DRAWER_TYPE.REASSIGNMENT,
              DRAWER_TYPE.EDIT_REASSIGNMENT,
              DRAWER_TYPE.TOUR_TEMPLATE_PATROL,
            ].includes(drawerData?.type) && (
              <Button
                variant="secondaryGrey"
                className={classes.assignDrawerHeaderToursBtn}
                onClick={() => {
                  clearTemplateStates();
                  changeOnlyDrawerType?.(
                    isPatrol ? DRAWER_TYPE.TOUR_ASSIGNMENT : DRAWER_TYPE.ASSIGN,
                  )?.();
                }}
              >
                <ArrowBackIcon />
              </Button>
            )}
            {loading ? (
              <Skeleton animation="wave" className={classes.titleSkeleton} />
            ) : (
              <Box>
                <Typography variant="h3" className={classes.assignDrawerHeaderTitle}>
                  {title || headerTitle[drawerData?.type]}
                  <ShiftFullyCancelledInfoIcon
                    shift={shiftDetail}
                    iconClassName={classes.toursInfoIcon}
                    wrapperClassName={classes.shiftFullyCancelledHeaderInfoWrapper}
                  />
                </Typography>
                <Typography variant="body2">
                  <Box>
                    {drawerShiftDateLabel}
                    <span className={classes.titleDivider}>{' • '}</span>
                    <Chip
                      label={shiftTypeEnumValue(shiftDetail?.shiftType)}
                      size="small"
                      color={
                        shiftDetail?.shiftType === DUTY_TYPES.extra.toLowerCase()
                          ? 'warning'
                          : 'success'
                      }
                    />
                  </Box>
                </Typography>
              </Box>
            )}
          </Box>

          <Box className={classes.assignDrawerHeaderTopRight}>
            {/* Shown when shift time can be edited, or when cancelled (restore). */}

            {canEditTime &&
              ((drawerData?.fromJobSection && userHasPermission(ACL_OBX_SCHEDULES_DELETE)) ||
                !drawerData?.fromJobSection) && (
                <DedicatedHeaderEditButton
                  shiftData={{ ...shiftDetail }}
                  setShowEditJobTimeModal={setShowEditJobTimeModal}
                  setSelectedJob={setSelectedJob}
                  setDedicatedSplitShift={handleOpenDedicatedSplitShift}
                  fromJobSection={drawerData?.fromJobSection}
                  onCancelShift={() => setShowCancelShiftDrawer(true)}
                  onRestoreShift={() => setShowRestoreShiftModal(true)}
                />
              )}
            <Button
              disableRipple
              className={classes.assignDrawerHeaderCloseBtn}
              onClick={() => closeSideDrawer()}
            >
              <CloseIcon />
            </Button>
          </Box>
        </Box>
        {!isPatrol && loading && (
          <Box className={classes.assignDrawerHeaderBottomSkeleton}>
            <Skeleton animation="wave" height={40} />
            <Skeleton animation="wave" height={40} />
            <Skeleton animation="wave" height={40} />
          </Box>
        )}
      </Box>

      {children}

      {/* Footer */}
      <Box className={classes.assignDrawerFooter}>
        <Button
          variant="secondaryGrey"
          onClick={() => closeSideDrawer()}
          disabled={disableActionBtn || loading}
        >
          {t('obx.schedules.assignDedicatedDuty.assignShift.cancel')}
        </Button>
        <Button
          variant="primary"
          onClick={handleSubmit}
          disabled={
            disableActionBtn ||
            loading ||
            isShiftScheduleFullyCancelled(shiftDetail) ||
            (!drawerData?.fromJobSection && shiftDetail?.isCancelled) ||
            ((shiftDetail?.assignmentReadOnlyMode ||
              !Object.hasOwn(shiftDetail || {}, 'shiftStatus')) &&
              drawerData?.type === DRAWER_TYPE.ASSIGN)
          }
        >
          {t('obx.schedules.assignDedicatedDuty.assignShift.save')}
        </Button>
      </Box>

      {showEditJobTimeModal && (
        <EditShiftTimeModal
          open={showEditJobTimeModal}
          onClose={() => {
            setSelectedJob(null);
            setShowEditJobTimeModal(false);
          }}
          refetchJobs={refetchSchedule}
          closeSideDrawer={closeSideDrawer}
          selectedJob={selectedJob}
        />
      )}

      <CancelShiftModal
        open={showCancelShiftDrawer}
        onClose={() => setShowCancelShiftDrawer(false)}
        shiftDetail={shiftDetail}
        onConfirm={handleCancelShiftConfirm}
        fromJobSection={drawerData?.fromJobSection}
      />

      <RestoreShiftModal
        open={showRestoreShiftModal}
        onClose={() => setShowRestoreShiftModal(false)}
        onConfirm={handleRestoreShiftConfirm}
      />
    </Box>
  );
};

export default Layout;

Layout.propTypes = {
  drawerData: PropTypes.object,
  changeOnlyDrawerType: PropTypes.func,
  closeSideDrawer: PropTypes.func,
  handleSubmit: PropTypes.func,
  children: PropTypes.node,
  clearTemplateStates: PropTypes.func,
  shiftDetail: PropTypes.object,
  loading: PropTypes.bool,
  disableActionBtn: PropTypes.bool,
  isPatrol: PropTypes.bool,
  title: PropTypes.string,
  refetchSchedule: PropTypes.func,
  onOpenDedicatedSplitShift: PropTypes.func,
  onCancelShift: PropTypes.func,
  onRestoreShift: PropTypes.func,
};

Layout.defaultProps = {
  drawerData: {},
  changeOnlyDrawerType: () => {},
  closeSideDrawer: () => {},
  handleSubmit: () => {},
  children: null,
  clearTemplateStates: () => {},
  shiftDetail: {},
  loading: false,
  disableActionBtn: false,
  isPatrol: false,
  refetchSchedule: () => {},
  onOpenDedicatedSplitShift: () => {},
  onCancelShift: () => false,
  onRestoreShift: () => false,
};
