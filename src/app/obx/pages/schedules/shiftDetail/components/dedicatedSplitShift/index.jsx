import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { Box, Button, Chip, Divider, IconButton, Tooltip, Typography } from '@mui/material';
import { ReactComponent as CloseIcon } from 'assets/svg/close.svg?react';
import { ReactComponent as AlertIcon } from 'assets/svg/info.svg?react';
import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ResponsiveDateTimePickers from 'src/app/components/common/dateTimePicker';
import SideDrawer from 'src/app/components/common/sideDrawer';
import {
  getCurrentStandardTimeInIsoWrtTimezone,
  isEarlierThan,
} from 'src/app/obx/pages/schedules/helper';
import { convertMinutesToHMFormat } from 'src/helper/utilityFunctions';
import useDateTime from 'src/hooks/useDateTime';
import { dedicatedSplitShiftDuty } from 'src/services/duty.services';
import { dayjsFormatsEnum, toastSettings } from 'src/utils/constants';
import { calendarShiftStatusEnum } from 'src/utils/constants/schedules';
import { toaster } from 'src/utils/toast';

import useSplitShiftStyles from './DedicatedsplitShift.styles';

const useStyles = useSplitShiftStyles;

const dateFormat = 'DD-MM-YYYY hh:mm A';

const SplitPointErrorTooltip = ({ show }) => {
  const { t } = useTranslation();
  if (!show) return null;
  const title = t('obx.schedules.splitShift.splitPointTimeTooltip');
  return (
    <Tooltip title={title} placement="top" arrow>
      <IconButton size="small" sx={{ p: 0.25, color: 'error.main' }} aria-label={title}>
        <ErrorOutlineIcon sx={{ fontSize: 18, color: 'inherit' }} />
      </IconButton>
    </Tooltip>
  );
};

SplitPointErrorTooltip.propTypes = { show: PropTypes.bool.isRequired };

const SplitShiftDrawer = ({ isOpen, closeDrawer, shiftData, setShiftData, onSuccesCloseModal }) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState([]);

  const [shift1, setShift1] = useState({ startTime: null, endTime: null });
  const [shift2, setShift2] = useState({ startTime: null, endTime: null });

  const { formatDayjsDateTime } = useDateTime();

  const getMinutesDiff = (startsAt, endsAt) => {
    return startsAt && endsAt ? dayjs(endsAt).diff(dayjs(startsAt), 'h', true) * 60 : 0;
  };

  const currentTime = getCurrentStandardTimeInIsoWrtTimezone();
  const isOngoingShift = shiftData?.shiftStatus === calendarShiftStatusEnum?.SHIFT_STARTED;
  const splitPointBeforeCurrentTime =
    isOngoingShift && shift1.endTime && isEarlierThan(shift1.endTime, currentTime);

  useEffect(() => {
    if (shiftData && isOpen) {
      const totalMinutes = getMinutesDiff(
        shiftData?.selectedShiftStartTime,
        shiftData?.selectedShiftEndTime,
      );

      setShiftData((prev) => ({
        ...prev,
        totalMinutes,
      }));

      // Find mid date between start and end time
      const halfMinutes = Math.floor(totalMinutes / 2);
      const midDate = dayjs(shiftData?.selectedShiftStartTime)
        .add(halfMinutes, 'minute')
        .toISOString();

      setShift1({ startTime: shiftData?.selectedShiftStartTime, endTime: midDate });
      setShift2({ startTime: midDate, endTime: shiftData?.selectedShiftEndTime });
      setErrors([]);
    }
  }, [isOpen]);

  const getAllocatedMinutes = () => {
    return (
      getMinutesDiff(shift1?.startTime, shift1?.endTime) +
      getMinutesDiff(shift2?.startTime, shift2?.endTime)
    );
  };

  const validateShifts = () => {
    const errorsMsg = [];

    if (!shift1.endTime) {
      errorsMsg.push(t('obx.schedules.splitShift.errors.shift1EndTimeRequired'));
    }
    if (!shift2.startTime) {
      errorsMsg.push(t('obx.schedules.splitShift.errors.shift2StartTimeRequired'));
    }

    if (
      shift1.startTime &&
      shift1.endTime &&
      dayjs(shift1.endTime).isSameOrBefore(dayjs(shift1.startTime))
    ) {
      errorsMsg.push(t('obx.schedules.splitShift.errors.shift1EndAfterOriginalStart'));
    }
    if (
      shift2.startTime &&
      shift2.endTime &&
      (dayjs(shift2.startTime).isAfter(dayjs(shift2.endTime)) ||
        dayjs(shift2.startTime).isSame(dayjs(shift2.endTime)))
    ) {
      errorsMsg.push(t('obx.schedules.splitShift.errors.shift2StartBeforeOriginalEnd'));
    }

    if (!isOngoingShift && shiftData?.totalMinutes !== getAllocatedMinutes()) {
      errorsMsg.push(t('obx.schedules.splitShift.errors.durationMismatch'));
    }

    // Second split end must be equal to or less than original shift end time
    if (
      shift2.endTime &&
      shiftData?.selectedShiftEndTime &&
      dayjs(shift2.endTime).isAfter(dayjs(shiftData.selectedShiftEndTime))
    ) {
      errorsMsg.push(t('obx.schedules.splitShift.errors.shift2EndAtOrBeforeOriginalEnd'));
    }

    // For ongoing shift: split point (shift1 end = shift2 start) must be at or after current time
    if (isOngoingShift && shift1.endTime && isEarlierThan(shift1.endTime, currentTime)) {
      errorsMsg.push(t('obx.schedules.splitShift.errors.splitPointAtOrAfterCurrentTime'));
    }

    setErrors(errorsMsg);
    return errorsMsg.length === 0;
  };

  const handleSave = async () => {
    if (!validateShifts()) return;

    setLoading(true);
    try {
      const objectPayload = {
        shiftType: shiftData?.shiftType,
        shiftId: shiftData?.id,
        startsAt: shiftData?.selectedShiftStartTime,
        endsAt: shiftData?.selectedShiftEndTime,
        activityLogId: shiftData?.logId,
        timeDetails: [
          {
            newStartsAt: dayjs(shiftData?.selectedShiftStartTime)?.toISOString(),
            newEndsAt: dayjs(shift1.endTime)?.toISOString(),
          },
          {
            newStartsAt: dayjs(shift2.startTime)?.toISOString(),
            newEndsAt: isOngoingShift
              ? dayjs(shift2.endTime)?.toISOString()
              : dayjs(shiftData?.selectedShiftEndTime)?.toISOString(),
          },
        ],
      };

      const response = await dedicatedSplitShiftDuty({ payload: objectPayload });
      if (response?.statusCode === 200) {
        toaster.success({
          text: response?.message || t('obx.schedules.splitShift.success'),
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
        closeDrawer();
        onSuccesCloseModal();
      }
    } catch (error) {
      toaster.error({
        text: error?.message || t('obx.schedules.splitShift.errors.saveFailed'),
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    } finally {
      setLoading(false);
    }
  };

  const isSaveDisabled = () =>
    !shift1.startTime || !shift1.endTime || !shift2.startTime || !shift2.endTime || loading;

  return (
    <SideDrawer isOpen={isOpen} closeDrawer={closeDrawer} totalWidth="720px">
      <Box className={classes.drawerContainer}>
        <Box className={classes.drawerHeader}>
          <Typography variant="h2" className={classes.drawerHeaderTitle}>
            {shiftData?.name || t('obx.schedules.splitShift.title')}
          </Typography>
          <Button
            variant="onlyText"
            className={classes.closeButton}
            onClick={closeDrawer}
            disableRipple
            disabled={loading}
          >
            <CloseIcon />
          </Button>
        </Box>

        <Box className={classes.drawerContent}>
          <Box className={classes.shiftInfoSection}>
            <Box className={classes.shiftInfoBox}>
              <Typography variant="body3" className={classes.shiftInfoLabel}>
                {t('obx.schedules.splitShift.time')}
              </Typography>
              <Typography variant="body2" className={classes.shiftInfoValue}>
                {formatDayjsDateTime({ value: shiftData?.selectedShiftStartTime }) +
                  ' - ' +
                  formatDayjsDateTime({ value: shiftData?.selectedShiftEndTime })}
              </Typography>
            </Box>
            <Box className={classes.shiftInfoBoxMiddle}>
              <Typography variant="body3" className={classes.shiftInfoLabel}>
                {t('obx.schedules.splitShift.duration')}
              </Typography>
              <Typography variant="body2" className={classes.shiftInfoValue}>
                {convertMinutesToHMFormat(shiftData?.totalMinutes)}
              </Typography>
            </Box>
            <Box className={classes.shiftInfoBox}>
              <Typography variant="body3" className={classes.shiftInfoLabel}>
                {t('obx.schedules.splitShift.date')}
              </Typography>
              <Box className={classes.itemBox}>
                <Typography className={classes.assignDrawerHeaderBottomText} variant="body2">
                  {`${formatDayjsDateTime({
                    value: shiftData?.selectedShiftStartTime,
                    formatType: dayjsFormatsEnum.monDY,
                  })} - ${formatDayjsDateTime({
                    value: shiftData?.selectedShiftEndTime,
                    formatType: dayjsFormatsEnum.monDY,
                  })}`}
                </Typography>
              </Box>
            </Box>
          </Box>
          <Divider className={classes.dividerTop} />
          <Box className={classes.splitShiftSection}>
            <Typography variant="h4" className={classes.splitShiftTitle}>
              {t('obx.schedules.splitShift.splitShift')}
            </Typography>
            <Typography variant="body2" className={classes.splitShiftDescription}>
              {t('obx.schedules.splitShift.description')}
            </Typography>
            <Box className={classes.splitShiftContent}>
              {/* Shift 1 */}
              <Box className={classes.shiftInputContainer}>
                <Typography variant="subtitle2" className={classes.shiftInputLabel}>
                  {t('obx.schedules.splitShift.shift1')}
                </Typography>
                <Box className={classes.timeInputRow}>
                  <Box className={classes.timeInput}>
                    <ResponsiveDateTimePickers
                      value={shift1.startTime}
                      onChange={() => {}}
                      timeStepsMinutes={1}
                      format={dateFormat}
                      disabled
                    />
                  </Box>
                  <Box
                    className={classes.timeInput}
                    sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                  >
                    <ResponsiveDateTimePickers
                      value={shift1.endTime}
                      onChange={(v) => {
                        setShift1((p) => ({ ...p, endTime: v }));
                        setShift2((p) => ({ ...p, startTime: v }));
                      }}
                      minDateTime={isOngoingShift ? currentTime : shiftData?.selectedShiftStartTime}
                      maxDateTime={shiftData?.selectedShiftEndTime}
                      timeStepsMinutes={1}
                      format={dateFormat}
                      error={splitPointBeforeCurrentTime}
                    />
                    <SplitPointErrorTooltip show={splitPointBeforeCurrentTime} />
                  </Box>
                </Box>
                <Typography className={classes.hoursDisplay}>
                  ({convertMinutesToHMFormat(getMinutesDiff(shift1.startTime, shift1.endTime))})
                </Typography>
              </Box>
              <Divider className={classes.divider} />
              {/* Shift 2 */}
              <Box className={classes.shiftInputContainer}>
                <Typography variant="subtitle2" className={classes.shiftInputLabel}>
                  {t('obx.schedules.splitShift.shift2')}
                </Typography>
                <Box className={classes.timeInputRow}>
                  <Box
                    className={classes.timeInput}
                    sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                  >
                    <ResponsiveDateTimePickers
                      value={shift2.startTime}
                      onChange={(v) => {
                        setShift1((p) => ({ ...p, endTime: v }));
                        setShift2((p) => ({ ...p, startTime: v }));
                      }}
                      minDateTime={isOngoingShift ? currentTime : shiftData?.selectedShiftStartTime}
                      maxDateTime={shiftData?.selectedShiftEndTime}
                      timeStepsMinutes={1}
                      format={dateFormat}
                      error={splitPointBeforeCurrentTime}
                    />
                    <SplitPointErrorTooltip show={splitPointBeforeCurrentTime} />
                  </Box>
                  <Box className={classes.timeInput}>
                    <ResponsiveDateTimePickers
                      value={shift2.endTime}
                      onChange={() => {}}
                      timeStepsMinutes={1}
                      format={dateFormat}
                      disabled
                      error={
                        shift2.endTime &&
                        dayjs(shift2.endTime).isAfter(dayjs(shiftData?.selectedShiftEndTime))
                      }
                    />
                  </Box>
                </Box>
                <Typography className={classes.hoursDisplay}>
                  ({convertMinutesToHMFormat(getMinutesDiff(shift2.startTime, shift2.endTime))})
                </Typography>
              </Box>
              <Divider className={classes.divider} />
              {/* summary section? */}
              <Box className={classes.summaryBar}>
                <Box className={classes.summaryBox}>
                  <Typography className={classes.summaryLabel}>
                    {t('obx.schedules.splitShift.totalShiftDuration')}
                  </Typography>
                  <Typography className={classes.summaryValue}>
                    {convertMinutesToHMFormat(shiftData?.totalMinutes)}
                  </Typography>
                </Box>
                <Box className={classes.summaryBox}>
                  <Typography className={classes.summaryLabel}>
                    {t('obx.schedules.splitShift.allocatedHours')}
                  </Typography>
                  <Typography className={classes.summaryValue}>
                    {convertMinutesToHMFormat(getAllocatedMinutes())}
                  </Typography>
                </Box>
                <Box>
                  {shiftData?.totalMinutes != getAllocatedMinutes() && (
                    <Chip
                      variant="outlined"
                      color="error"
                      icon={<AlertIcon />}
                      className={classes.unallocatedBadge}
                      label={`${convertMinutesToHMFormat(shiftData?.totalMinutes - getAllocatedMinutes())} ${t('obx.schedules.splitShift.unallocated')}`}
                    />
                  )}
                </Box>
              </Box>

              <Box className={classes.customSplitErrorsBottom}>
                {errors?.map((error) => (
                  <Box className={classes.invalidFeedback} key={error}>
                    {error}
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        </Box>

        <Box className={classes.drawerFooter}>
          <Button variant="secondaryGrey" onClick={closeDrawer} disabled={loading}>
            {t('obx.schedules.splitShift.cancel')}
          </Button>
          <Button variant="primary" onClick={handleSave} disabled={isSaveDisabled()}>
            {loading ? t('obx.schedules.splitShift.saving') : t('obx.schedules.splitShift.save')}
          </Button>
        </Box>
      </Box>
    </SideDrawer>
  );
};

SplitShiftDrawer.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  closeDrawer: PropTypes.func.isRequired,
  shiftData: PropTypes.object,
  onSuccesCloseModal: PropTypes.object,
  setShiftData: PropTypes.func.isRequired,
};

export default SplitShiftDrawer;
