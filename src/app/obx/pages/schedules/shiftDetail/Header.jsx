import { Box, Button, Chip, Skeleton, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { ReactComponent as EditShiftTimeIcon } from 'assets/icons/editPencilIcon.svg';
import { ReactComponent as ClockBlockIcon } from 'assets/svg/clockBlock.svg';
import { ReactComponent as CloseIcon } from 'assets/svg/close.svg';
import { ReactComponent as EditIcon } from 'assets/svg/editshift.svg';
import { ReactComponent as CancelShiftIcon } from 'assets/svg/red-cross.svg';
import { ReactComponent as RestoreShiftIcon } from 'assets/svg/refresh.svg';
import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import PopoverButton from 'src/app/components/common/popoverButton';
import {
  ACL_OBX_SCHEDULES_DELETE,
  ACL_OBX_SCHEDULES_UPDATE,
  // ACL_OBX_SHIFT_RATE_VIEW,
} from 'src/app/router/constant/OBXMODULE';
import { MoreVert, SplittedCalenderIcon } from 'src/assets/svg';
import { useTenantLabel } from 'src/helper/utilityHooks';
import RenderIfHasPermission from 'src/hoc/RenderIfHasPermission';
import { theme } from 'src/theme';
import userHasPermission from 'src/utils/auth/userHasPermission';
import {
  calendarShiftStatusEnum,
  DRAWER_TYPE,
  SCHEDULE_DUTIES,
  ShiftStatus,
} from 'src/utils/constants/schedules';
import { toaster } from 'src/utils/toast';

import { getCurrentStandardTimeInIsoWrtTimezone } from '../helper';
import EditShiftTimeModal from './editShiftTimeModal';

const useStyles = makeStyles({
  dutyDetailHeader: {
    padding: '24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '16px',
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
  },

  dutyDetailHeaderLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flex: 1,
  },

  dutyDetailHeaderRight: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: '12px',
    minWidth: '100px',
  },

  dutyDetailHeaderTitle: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
    },
  },

  dutyDetailHeaderChip: {
    padding: '2px 8px',
    borderRadius: '16px',
    background: theme.palette.surfaceSuccessSubtle,
    color: theme.palette.textSuccess,
    textAlign: 'center',
    fontSize: '12px',
    fontWeight: '500',
    lineHeight: '18px',
  },

  dutyDetailHeaderClose: {
    '&.MuiButton-root': {
      padding: '0px',
      minWidth: 'auto',
    },
  },

  titleSkeleton: {
    '&.MuiSkeleton-root': {
      width: '164.5px',
      height: '30px',
    },
  },
  templateActionsRegular: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 14px',
    cursor: 'pointer',

    '&:hover': {
      backgroundColor: theme.palette.surfaceGreySubtle,
    },
  },
  templateActionsTextRegular: {
    '&.MuiTypography-root': {
      color: '#5B5B5F',
    },
  },
  cancelShiftMenuText: {
    '&.MuiTypography-root': {
      color: theme.palette.textAlert,
    },
  },
  restoreShiftMenuText: {
    '&.MuiTypography-root': {
      color: theme.palette.textBrand,
    },
  },
  templateActions: {
    '& .MuiPaper-root': {
      width: '162px',
      backgroundColor: theme.palette.surfaceWhite,
      padding: '4px 0',
      border: `1px solid ${theme.palette.borderSubtle1}`,
      borderRadius: '8px',
      boxShadow: `0px 4px 6px -2px rgba(16, 24, 40, 0.05), 0px 12px 16px -4px rgba(16, 24, 40, 0.10)`,
    },
  },
});

const Header = ({
  shiftData,
  closeDrawer,
  setShowDrawer,
  loading,
  readonly = false,
  setClockBackInConfirmation,
  onDedicatedCancelClick,
  onDedicatedRestoreClick,
  refetchShiftDetail,
  // setShiftPayRateModal,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const { getLabel } = useTenantLabel();

  const [isOngoingShift, setIsOngoingShift] = useState(false);
  const [showEditShiftTimeModal, setShowEditShiftTimeModal] = useState(false);
  const [selectedJobForTimeEdit, setSelectedJobForTimeEdit] = useState(null);

  const now = useMemo(() => getCurrentStandardTimeInIsoWrtTimezone(), []);
  const shiftEnd = !shiftData?.reassignedShift ? shiftData?.endsAt : shiftData?.shiftEndsAt;
  const currentShiftStatus = shiftData?.shiftStatus || shiftData?.scheduleStatus;

  const isShiftCompleted = [ShiftStatus.SHIFT_ENDED, ShiftStatus.SHIFT_AUTO_ENDED].includes(
    currentShiftStatus,
  );
  // const isShiftAbsent = currentShiftStatus === ShiftStatus.ABSENT;
  // const isShiftEndTimeReached = now >= shiftEnd;

  useEffect(() => {
    if (shiftEnd) setIsOngoingShift(now < shiftEnd);
  }, [shiftEnd, now]);

  const editHandler = () => {
    if (!isOngoingShift) {
      return toaster.error({
        text: t('obx.schedules.dutyDetail.errors.shiftEnded'),
        position: 'top-right',
      });
    }

    setShowDrawer({
      open: DRAWER_TYPE.ASSIGN,
      data: {
        shiftId: shiftData?.shiftId,
        startsAt: shiftData?.startsAt,
        site: shiftData?.site || {},
      },
    });
  };

  const handleEditShiftTimeClick = () => {
    setSelectedJobForTimeEdit({
      ...shiftData,
      id: shiftData?.shiftId,
      selectedShiftStartTime: shiftData?.selectedShiftStartTime ?? shiftData?.startsAt,
      selectedShiftEndTime: shiftData?.selectedShiftEndTime ?? shiftData?.endsAt,
      logId: shiftData?.logId ?? shiftData?.shiftActivityLogId ?? shiftData?.id,
    });
    setShowEditShiftTimeModal(true);
  };

  const isDedicated = shiftData?.shiftType === SCHEDULE_DUTIES?.DEDICATED.toLowerCase();
  const isPastShift = dayjs(now).isAfter(dayjs(shiftData?.endsAt));
  const isCancelledDedicated = shiftData?.isCancelled ?? false;

  const canDedicatedDutyDetailCancelOrRestore =
    isDedicated &&
    [ShiftStatus.ABSENT, calendarShiftStatusEnum.NOT_STARTED].includes(currentShiftStatus);

  const showClockBackInBtn = isShiftCompleted && now < shiftEnd && !shiftData?.isPayrollLocked;
  const showDedicatedRestoreMenu =
    canDedicatedDutyDetailCancelOrRestore && isCancelledDedicated && onDedicatedRestoreClick;
  const showEditShiftDetailBtn =
    !readonly && isOngoingShift && !isShiftCompleted && !showDedicatedRestoreMenu;
  const showDedicatedCancelMenu =
    canDedicatedDutyDetailCancelOrRestore &&
    !isCancelledDedicated &&
    onDedicatedCancelClick &&
    isPastShift;
  // const showEditShiftPayRateBtn =
  //   (isShiftCompleted || isShiftAbsent) &&
  //   isShiftEndTimeReached &&
  //   userHasPermission(ACL_OBX_SHIFT_RATE_VIEW);
  const showSchedulesUpdateMenuItems =
    showEditShiftDetailBtn || showClockBackInBtn || showDedicatedRestoreMenu;
  const canShowPopover =
    !loading &&
    ((userHasPermission(ACL_OBX_SCHEDULES_UPDATE) && showSchedulesUpdateMenuItems) ||
      (userHasPermission(ACL_OBX_SCHEDULES_DELETE) && showDedicatedCancelMenu));
  //  && userHasPermission(ACL_OBX_SHIFT_RATE_VIEW);

  const showEditShiftTime =
    isDedicated &&
    !shiftData?.isCancelled &&
    !readonly &&
    isPastShift &&
    (shiftData?.officerId || shiftData?.officer?.id) &&
    shiftData?.shiftStatus === ShiftStatus.ABSENT;

  const shiftLabel =
    shiftData?.shiftType === SCHEDULE_DUTIES.EXTRA
      ? getLabel('terms', 'extra', t)
      : getLabel('terms', 'dedicated', t);

  const shiftTitle =
    shiftData?.shiftType === SCHEDULE_DUTIES.EXTRA
      ? shiftData?.site?.name || ''
      : `${shiftData?.site?.name || ''} - ${shiftData?.name || ''}`;

  return (
    <Box className={classes.dutyDetailHeader}>
      <Box className={classes.dutyDetailHeaderLeft}>
        {loading ? (
          <Skeleton animation="wave" className={classes.titleSkeleton} />
        ) : (
          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="h2" className={classes.dutyDetailHeaderTitle}>
              {shiftTitle}
            </Typography>

            <Chip
              label={shiftLabel}
              size="small"
              color={shiftData?.shiftType === SCHEDULE_DUTIES.EXTRA ? 'warning' : 'success'}
            />

            {isDedicated && shiftData?.isSplit && <SplittedCalenderIcon width="23" height="23" />}
          </Box>
        )}
      </Box>

      <Box className={classes.dutyDetailHeaderRight}>
        {canShowPopover ? (
          <PopoverButton
            variant="icon"
            Icon={MoreVert}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'start',
            }}
            className={classes.templateActions}
          >
            <Box className={classes.templateActionsMenu}>
              <RenderIfHasPermission name={ACL_OBX_SCHEDULES_UPDATE}>
                {showEditShiftDetailBtn && (
                  <Box onClick={editHandler} className={classes.templateActionsRegular}>
                    <EditIcon />
                    <Typography variant="subtitle2" className={classes.templateActionsTextRegular}>
                      {t('obx.schedules.dutyDetail.editShiftDetail')}
                    </Typography>
                  </Box>
                )}
                {showClockBackInBtn && (
                  <Box
                    onClick={() => setClockBackInConfirmation(true)}
                    className={classes.templateActionsRegular}
                  >
                    <ClockBlockIcon />
                    <Typography variant="subtitle2" className={classes.templateActionsTextRegular}>
                      {t('obx.schedules.dutyDetail.runsheetDetail.editButtons.clockBackIn')}
                    </Typography>
                  </Box>
                )}
                {showDedicatedRestoreMenu && (
                  <Box onClick={onDedicatedRestoreClick} className={classes.templateActionsRegular}>
                    <RestoreShiftIcon />
                    <Typography
                      variant="subtitle2"
                      className={`${classes.templateActionsTextRegular} ${classes.restoreShiftMenuText}`}
                    >
                      {t('obx.schedules.splitShift.restoreShift')}
                    </Typography>
                  </Box>
                )}

                {showEditShiftTime && (
                  <Box
                    onClick={handleEditShiftTimeClick}
                    className={classes.templateActionsRegular}
                  >
                    <EditShiftTimeIcon />
                    <Typography variant="subtitle2" className={classes.templateActionsTextRegular}>
                      {t('obx.schedules.editDedicatedShiftDropDown')}
                    </Typography>
                  </Box>
                )}
              </RenderIfHasPermission>

              {/* {showEditShiftPayRateBtn && (
                  <RenderIfHasPermission name={ACL_OBX_SHIFT_RATE_VIEW}>
                    <Box
                      className={classes.templateActionsRegular}
                      onClick={() => setShiftPayRateModal(true)}
                    >
                      <EditPencil />
                      <Typography
                        className={classes.templateActionsTextRegular}
                        variant="subtitle2"
                      >
                        {t('obx.schedules.dutyDetail.runsheetDetail.editButtons.editShift')}
                      </Typography>
                    </Box>
                  </RenderIfHasPermission>
                )} */}

              <RenderIfHasPermission name={ACL_OBX_SCHEDULES_DELETE}>
                {showDedicatedCancelMenu && (
                  <Box onClick={onDedicatedCancelClick} className={classes.templateActionsRegular}>
                    <CancelShiftIcon />
                    <Typography
                      variant="subtitle2"
                      className={`${classes.templateActionsTextRegular} ${classes.cancelShiftMenuText}`}
                    >
                      {t('obx.schedules.splitShift.cancelShift')}
                    </Typography>
                  </Box>
                )}
              </RenderIfHasPermission>
            </Box>
          </PopoverButton>
        ) : null}

        <Button
          variant="onlyText"
          className={classes.dutyDetailHeaderClose}
          onClick={closeDrawer}
          disableRipple
        >
          <CloseIcon />
        </Button>
      </Box>

      {showEditShiftTimeModal && (
        <EditShiftTimeModal
          open={showEditShiftTimeModal}
          onClose={() => {
            setSelectedJobForTimeEdit(null);
            setShowEditShiftTimeModal(false);
          }}
          refetchJobs={refetchShiftDetail}
          closeSideDrawer={() => {}}
          selectedJob={selectedJobForTimeEdit}
        />
      )}
    </Box>
  );
};

Header.propTypes = {
  shiftData: PropTypes.object,
  closeDrawer: PropTypes.func,
  setShowDrawer: PropTypes.func,
  loading: PropTypes.bool,
  readonly: PropTypes.bool,
  setClockBackInConfirmation: PropTypes.func,
  setShiftPayRateModal: PropTypes.func,
  onDedicatedCancelClick: PropTypes.func,
  onDedicatedRestoreClick: PropTypes.func,
  refetchShiftDetail: PropTypes.func,
};

Header.defaultProps = {
  readonly: false,
  setClockBackInConfirmation: () => {},
  setShiftPayRateModal: () => {},
  onDedicatedCancelClick: undefined,
  onDedicatedRestoreClick: undefined,
  refetchShiftDetail: () => {},
};

export default Header;
