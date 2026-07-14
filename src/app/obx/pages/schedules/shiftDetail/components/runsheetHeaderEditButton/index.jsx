import { Box, Typography } from '@mui/material';
import { ReactComponent as EditIcon } from 'assets/icons/editPencilIcon.svg?react';
import PopoverButton from 'commonComponents/popoverButton';
import PropTypes from 'prop-types';
import queryString from 'query-string';
import { useTranslation } from 'react-i18next';
import { OBX_RUNSHEET } from 'src/app/router/constant/ROUTE';
import history from 'src/app/router/utils/history';
import { MoreVert } from 'src/assets/svg';
import { ReactComponent as ClockBlockIcon } from 'src/assets/svg/clockBlock.svg?react';
import { ReactComponent as RepeatIcon } from 'src/assets/svg/repeat-black.svg?react';
import { ReactComponent as SplitIcon } from 'src/assets/svg/splitDrawerIcon.svg?react';
import { useTenantLabel } from 'src/helper/utilityHooks';
import { toastSettings } from 'src/utils/constants';
import { calendarShiftStatusEnum, ShiftStatus } from 'src/utils/constants/schedules';
import { toaster } from 'src/utils/toast';

import { dayjsWithStandardOffset, getCurrentStandardTimeInIsoWrtTimezone } from '../../../helper';
import { useStyles } from './runsheetHeaderEditButton.styles';

const isDateGreaterThanCurrentPlus6Days = (isoDate) => {
  const inputDate = dayjsWithStandardOffset(isoDate).startOf('day');
  const futureDate = dayjsWithStandardOffset().startOf('day').add(29, 'days');

  return inputDate.isAfter(futureDate);
};

const RunsheetHeaderEditButton = (props) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const { getLabel } = useTenantLabel();

  const handleReAssignHitModel = () => {
    props?.setIsReassignHitToRunsheet(true);
  };

  const handleClickSplitRunsheet = () => {
    const { shiftData } = props;
    if (shiftData?.isDeleted) {
      toaster.error({
        text: t('obx.runsheet.cannotSplitRunsheet', { runsheet: getLabel('terms', 'runsheet', t) }),
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
      return;
    }
    const query = queryString.stringify(
      {
        startsAt: shiftData.startsAt,
        endsAt: shiftData?.endedAt ? shiftData?.endedAt : shiftData?.endsAt,
        shiftActivityLogId: shiftData?.shiftActivityLogId,
      },
      {
        arrayFormat: 'index',
        skipEmptyString: true,
        skipNull: true,
      },
    );
    history.push(`${OBX_RUNSHEET}/${props.shiftData?.runsheetId}/splitRunSheet?${query}`);
  };

  const _handleGoToEditPage = () => {
    const { shiftData } = props;
    const query = queryString.stringify(
      { startsAt: shiftData.startsAt, endsAt: shiftData?.endsAt, fromSchedule: true },
      {
        arrayFormat: 'index',
        skipEmptyString: true,
        skipNull: true,
      },
    );
    history.push(`${OBX_RUNSHEET}/details/${props.shiftData?.runsheetId}?${query}`);
  };

  const currentTime = getCurrentStandardTimeInIsoWrtTimezone();
  const runsheetStartsAt = props?.shiftData?.runsheetDetails?.startsAt;
  const runsheetEndsAt = props?.shiftData?.runsheetDetails?.endsAt;
  const shiftEndTime = props?.shiftData?.endsAt || runsheetEndsAt;
  const isPastShift = Boolean(shiftEndTime && currentTime >= shiftEndTime);
  const hasShiftActivityLogId = Boolean(
    props?.shiftData?.shiftActivityLogId || props?.shiftData?.hasActivityLog,
  );
  const officerId = props?.shiftData?.officerId || props?.shiftData?.officer?.id;
  const shiftStatus = props?.shiftData?.shiftStatus;
  // Assigned officer with absent status = never clocked in → allow past time edit
  const officerAllowsPastTimeEdit = !!officerId && shiftStatus === ShiftStatus.ABSENT;

  const missedHitsListing =
    props?.shiftData?.runsheetDetails?.hits?.filter(
      (item) => item?.isMissedHit === true && item?.isMoved !== true,
    ) ?? [];

  const hasMissedHitsToReassign = missedHitsListing.length > 0;

  if (!props?.shiftData?.startsAt) {
    return null;
  }

  const isOngoingRunsheet =
    runsheetStartsAt &&
    shiftEndTime &&
    currentTime >= runsheetStartsAt &&
    currentTime < shiftEndTime;
  const isFutureShift = runsheetStartsAt && currentTime < runsheetStartsAt;

  const hitsCount = props?.shiftData?.runsheetDetails?.hits?.length ?? 0;
  const scheduleStatus = props?.shiftData?.scheduleStatus;

  const notShowSplitButton =
    !props?.shiftData?.startsAt ||
    hitsCount < 2 ||
    scheduleStatus === calendarShiftStatusEnum.COMPLETED ||
    (!isOngoingRunsheet && !isFutureShift);

  const notStartedHitsListing =
    props?.shiftData?.runsheetDetails?.hits?.filter(
      (item) =>
        !!item?.isVisited == false &&
        !!item?.isMoved == false &&
        !!item?.isDisabled == false &&
        !!item?.isCancelled == false &&
        !!item?.isInactive == false &&
        !!!item?.dispatchId &&
        item?.visitType !== 'dispatch',
    ) ?? [];

  const isShowReassignForNotStartedHits =
    props?.shiftData?.scheduleStatus === calendarShiftStatusEnum.IN_PROGRESS
      ? notStartedHitsListing?.length > 1 &&
        !isDateGreaterThanCurrentPlus6Days(props?.shiftData?.startsAt)
      : notStartedHitsListing?.length > 0 &&
        !isDateGreaterThanCurrentPlus6Days(props?.shiftData?.startsAt); // hide the reassignment button if the user goes to a shift which is greater then 6 days from current date because the reassign hit can only be perform form next 6 days.

  const isShowReassignHitMenuOption = isShowReassignForNotStartedHits || hasMissedHitsToReassign;

  const showClockBackInBtn =
    props?.shiftData?.scheduleStatus === calendarShiftStatusEnum.COMPLETED &&
    getCurrentStandardTimeInIsoWrtTimezone() < props?.shiftData?.endsAt &&
    !props?.shiftData?.isPayrollLocked;

  const isCompletedRunsheetShift =
    props?.shiftData?.scheduleStatus === calendarShiftStatusEnum.COMPLETED;

  const canEditPastShiftTime =
    hasShiftActivityLogId && !props?.shiftData?.isApproved && officerAllowsPastTimeEdit;

  const showEditRunsheetOption =
    !isCompletedRunsheetShift && (!isPastShift || canEditPastShiftTime);

  const showSplitOption = !notShowSplitButton && !isCompletedRunsheetShift;
  const showReassignOption = isShowReassignHitMenuOption;
  const showClockBackInOption = showClockBackInBtn;

  const hasAnyMenuOption =
    showEditRunsheetOption || showSplitOption || showReassignOption || showClockBackInOption;

  if (!hasAnyMenuOption) {
    return null;
  }

  return (
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
        {showEditRunsheetOption && (
          <Box
            onClick={() => props?.setIsEditRunsheetModal?.(true)}
            className={classes.templateActionsRegular}
          >
            <EditIcon />
            <Typography className={classes.templateActionsTextRegular} variant="subtitle2">
              {t('obx.schedules.dutyDetail.runsheetDetail.editButtons.editRunsheet', {
                runsheet: getLabel('terms', 'runsheet', t),
              })}
            </Typography>
          </Box>
        )}
        {showSplitOption && (
          <Box onClick={handleClickSplitRunsheet} className={classes.templateActionsRegular}>
            <SplitIcon />
            <Typography className={classes.templateActionsTextRegular} variant="subtitle2">
              {t('obx.schedules.dutyDetail.runsheetDetail.editButtons.splitRunsheet', {
                runsheet: getLabel('terms', 'runsheet', t).toLowerCase(),
              })}
            </Typography>
          </Box>
        )}

        {showReassignOption && (
          <Box onClick={handleReAssignHitModel} className={classes.templateActionsRegular}>
            <RepeatIcon />
            <Typography className={classes.templateActionsTextRegular} variant="subtitle2">
              {t('obx.schedules.dutyDetail.runsheetDetail.editButtons.reassignHits', {
                hit: getLabel('terms', 'hit', t),
              })}
            </Typography>
          </Box>
        )}

        {showClockBackInOption && (
          <Box
            onClick={() => props?.setClockBackInConfirmation(true)}
            className={classes.templateActionsRegular}
          >
            <ClockBlockIcon />
            <Typography className={classes.templateActionsTextRegular} variant="subtitle2">
              {t('obx.schedules.dutyDetail.runsheetDetail.editButtons.clockBackIn')}
            </Typography>
          </Box>
        )}
      </Box>
    </PopoverButton>
  );
};

RunsheetHeaderEditButton.propTypes = {
  shiftData: PropTypes.object,
  setIsReassignHitToRunsheet: PropTypes.func,
  setClockBackInConfirmation: PropTypes.func,
  callbackUponAssignment: PropTypes.func,
  setShiftData: PropTypes.func,
  setIsEditRunsheetModal: PropTypes.func,
};
export default RunsheetHeaderEditButton;
