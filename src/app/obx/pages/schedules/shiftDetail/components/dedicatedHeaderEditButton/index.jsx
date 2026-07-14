import { Box, Typography } from '@mui/material';
import { ReactComponent as EditIcon } from 'assets/icons/editPencilIcon.svg?react';
import { ReactComponent as DedicatedSplitshift } from 'assets/svg/dedicatedsplitshift.svg?react';
import { ReactComponent as CancelShiftIcon } from 'assets/svg/red-cross.svg?react';
import { ReactComponent as RestoreShiftIcon } from 'assets/svg/refresh.svg?react';
import PopoverButton from 'commonComponents/popoverButton';
import PropTypes from 'prop-types';
import queryString from 'query-string';
import { useTranslation } from 'react-i18next';
import { ACL_OBX_SCHEDULES_DELETE } from 'src/app/router/constant/OBXMODULE';
import { OBX_RUNSHEET } from 'src/app/router/constant/ROUTE';
import history from 'src/app/router/utils/history';
import { MoreVert } from 'src/assets/svg';
import { useTenantLabel } from 'src/helper/utilityHooks';
import RenderIfHasPermission from 'src/hoc/RenderIfHasPermission';
import { toastSettings } from 'src/utils/constants';
import { calendarShiftStatusEnum } from 'src/utils/constants/schedules';
import { toaster } from 'src/utils/toast';

import {
  dayjsWithStandardOffset,
  dayjsWithTimezone,
  getCurrentStandardTimeInIsoWrtTimezone,
} from '../../../helper';
import { useStyles } from './dedicatedHeaderEditButton.styles';
const DedicatedHeaderEditButton = ({
  shiftData,
  setShowEditJobTimeModal,
  setSelectedJob,
  setDedicatedSplitShift,
  onCancelShift,
  onRestoreShift,
  fromJobSection = false,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const { getLabel } = useTenantLabel();
  const _handleClickSplitRunsheet = () => {
    if (shiftData?.isDeleted) {
      toaster.error({
        text: t('obx.runsheet.cannotSplitRunsheet', {
          runsheet: getLabel('terms', 'runsheet', t).toLowerCase(),
        }),
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
    history.push(`${OBX_RUNSHEET}/${shiftData?.runsheetId}/splitRunSheet?${query}`);
  };

  const handleEditShiftTimeClick = () => {
    setShowEditJobTimeModal(true);
    setSelectedJob(shiftData);
  };

  const isTodayWrtStandardTime =
    dayjsWithTimezone().date() ===
    dayjsWithStandardOffset(shiftData?.runsheetDetails?.startsAt).date();
  const isOngoingRunsheet =
    getCurrentStandardTimeInIsoWrtTimezone() >= shiftData?.runsheetDetails?.startsAt &&
    getCurrentStandardTimeInIsoWrtTimezone() < shiftData?.runsheetDetails?.endsAt;

  const _handleGoToEditPage = () => {
    const query = queryString.stringify(
      { startsAt: shiftData.startsAt, endsAt: shiftData?.endsAt, fromSchedule: true },
      {
        arrayFormat: 'index',
        skipEmptyString: true,
        skipNull: true,
      },
    );
    history.push(`${OBX_RUNSHEET}/details/${shiftData?.runsheetId}?${query}`);
  };
  const currentShiftStatus = shiftData?.shiftStatus || shiftData?.scheduleStatus;
  const isEligibleStatus = [
    calendarShiftStatusEnum.IN_PROGRESS,
    calendarShiftStatusEnum.NOT_STARTED,
    calendarShiftStatusEnum.UPCOMING,
    calendarShiftStatusEnum.UNASSIGNED,
  ].includes(currentShiftStatus);

  const canCancelByStatus = [
    calendarShiftStatusEnum.NOT_STARTED,
    calendarShiftStatusEnum.UNASSIGNED,
  ].includes(currentShiftStatus);

  if (
    !shiftData?.startsAt ||
    currentShiftStatus === calendarShiftStatusEnum.COMPLETED ||
    (!isTodayWrtStandardTime && !isOngoingRunsheet && !isEligibleStatus)
  ) {
    return <></>;
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
        {shiftData?.isCancelled && !fromJobSection ? (
          <Box onClick={() => onRestoreShift?.()} className={classes.templateActionsRegular}>
            <RestoreShiftIcon />
            <Typography
              className={`${classes.templateActionsTextRegular} ${classes.restoreShiftText}`}
              variant="subtitle2"
            >
              {t('obx.schedules.splitShift.restoreShift')}
            </Typography>
          </Box>
        ) : (
          <>
            {!fromJobSection && (
              <Box onClick={handleEditShiftTimeClick} className={classes.templateActionsRegular}>
                <EditIcon />
                <Typography className={classes.templateActionsTextRegular} variant="subtitle2">
                  {t('obx.schedules.editDedicatedShiftDropDown')}
                </Typography>
              </Box>
            )}
            {!fromJobSection && (
              <Box onClick={setDedicatedSplitShift} className={classes.templateActionsRegular}>
                <DedicatedSplitshift />
                <Typography className={classes.templateActionsTextRegular} variant="subtitle2">
                  {t('obx.schedules.splitShift.splitShift')}
                </Typography>
              </Box>
            )}
            {(canCancelByStatus || fromJobSection) && (
              <RenderIfHasPermission name={ACL_OBX_SCHEDULES_DELETE}>
                <Box onClick={() => onCancelShift?.()} className={classes.templateActionsRegular}>
                  <CancelShiftIcon />
                  <Typography
                    className={`${classes.templateActionsTextRegular} ${classes.cancelShiftText}`}
                    variant="subtitle2"
                  >
                    {t('obx.schedules.splitShift.cancelShift')}
                  </Typography>
                </Box>
              </RenderIfHasPermission>
            )}
          </>
        )}
      </Box>

      {/* <Box sx={{ padding: '10px 32px 10px 10px', cursor: 'pointer' }} onClick={handleGoToEditPage}>
        <Typography variant="subtitle2" sx={{ color: '#737378' }}>
          View RunSheet
        </Typography>
      </Box> */}
    </PopoverButton>
  );
};

DedicatedHeaderEditButton.propTypes = {
  shiftData: PropTypes.object,
  setShowEditJobTimeModal: PropTypes.func,
  setSelectedJob: PropTypes.func,
  setDedicatedSplitShift: PropTypes.func,
  onCancelShift: PropTypes.func,
  onRestoreShift: PropTypes.func,
  fromJobSection: PropTypes.bool,
};

DedicatedHeaderEditButton.defaultProps = {
  onRestoreShift: () => {},
};
export default DedicatedHeaderEditButton;
