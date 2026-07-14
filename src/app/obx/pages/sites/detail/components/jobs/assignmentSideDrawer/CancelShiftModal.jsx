import {
  Box,
  Button,
  Dialog,
  DialogContent,
  Divider,
  FormControl,
  FormControlLabel,
  InputLabel,
  Radio,
  RadioGroup,
  TextField,
  Typography,
} from '@mui/material';
import { ReactComponent as CancelShiftIcon } from 'assets/svg/cancel.svg?react';
import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import DaysSelection from 'src/app/components/common/daysSelection';
import DateRangePickerWithButtons from 'src/app/components/common/RangeDatepicker';
import RequiredAsterik from 'src/app/components/common/requiredAsterik';
import SweetAlertModal from 'src/app/components/common/sweetAlertModal';
import {
  dayjsWithStandardOffset,
  getDaysBetweenDatesRangeWrtStandardDate,
  getDisabledDaysFromEnabledDays,
  getEmbededDateAndTimeWRTStandardOffset,
  getTimezone,
} from 'src/app/obx/pages/schedules/helper';
import { daysOfWeekWithVal } from 'src/utils/constants';

import { useStyles } from './assignmentSideDrawer.styles';

const CANCEL_SCOPE = {
  THIS_SHIFT: 'this_shift',
  THIS_AND_FOLLOWING: 'this_and_following',
  CUSTOM_RANGE: 'custom_range',
};

const CancelShiftModal = ({
  open,
  onClose,
  shiftDetail,
  onConfirm,
  isPastShift,
  fromJobSection,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const [scope, setScope] = useState(CANCEL_SCOPE.THIS_SHIFT);
  const [reason, setReason] = useState('');
  const [cancelSelectedDates, setCancelSelectedDates] = useState([]);
  const [selectedDays, setSelectedDays] = useState([]);
  const [disabledDays, setDisabledDays] = useState([]);
  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);
  const [showCustomRangeDaysError, setShowCustomRangeDaysError] = useState(false);

  const isDateMounted = useRef();
  const isDefaultDaysSelectionMounted = useRef();
  const prevCustomRangeBoundsKey = useRef('');

  const showThisShiftOption = !fromJobSection;
  const defaultScope = showThisShiftOption
    ? CANCEL_SCOPE.THIS_SHIFT
    : CANCEL_SCOPE.THIS_AND_FOLLOWING;

  /** Same role as `updateSelectedDaysInOfficerAssignment` in AssignShift/OfficerAssignment.jsx */
  const updateSelectedDaysInCancelModal = (days) => {
    setSelectedDays(days);
  };

  const start = cancelSelectedDates?.[0];
  const end = cancelSelectedDates?.[1];
  useEffect(() => {
    if (!open) {
      isDateMounted.current = false;
      isDefaultDaysSelectionMounted.current = false;
      prevCustomRangeBoundsKey.current = '';
      setShowCancelConfirmation(false);
      setShowCustomRangeDaysError(false);
      return;
    }

    const startsAtAnchor =
      shiftDetail?.selectedShiftStartTime || shiftDetail?.startsAt || shiftDetail?.shiftStartTime;
    const rangeEndSource =
      shiftDetail?.lastShiftStartTime || shiftDetail?.endsAt || shiftDetail?.shiftEndTime;

    if (startsAtAnchor && rangeEndSource) {
      const firstDate = dayjs(startsAtAnchor).tz(getTimezone()).format('YYYY-MM-DD');
      const lastDate = dayjs(rangeEndSource).tz(getTimezone()).format('YYYY-MM-DD');
      const startEmbedded = getEmbededDateAndTimeWRTStandardOffset(
        shiftDetail?.startsAt,
        firstDate,
      );
      const endEmbedded = getEmbededDateAndTimeWRTStandardOffset(shiftDetail?.startsAt, lastDate);
      setCancelSelectedDates([startEmbedded, endEmbedded]);
      if (shiftDetail?.shiftDays?.length) {
        const daysInRange = getDaysBetweenDatesRangeWrtStandardDate(startEmbedded, endEmbedded);
        const initialDays = daysInRange.filter((day) => shiftDetail.shiftDays.includes(day));
        setSelectedDays(initialDays.length ? initialDays : []);
      } else {
        setSelectedDays([]);
      }
    } else {
      setCancelSelectedDates([]);
      setSelectedDays([]);
    }

    setReason('');
    setScope(defaultScope);
    setDisabledDays([]);
    setShowCustomRangeDaysError(false);
  }, [open, shiftDetail, defaultScope]);

  useEffect(() => {
    if (start && end && shiftDetail?.shiftDays) {
      const selectedDaysFromDates = getDaysBetweenDatesRangeWrtStandardDate(start, end);
      const enabledDays = shiftDetail?.assignmentReadOnlyMode
        ? []
        : selectedDaysFromDates.filter((day) => shiftDetail?.shiftDays.includes(day));
      const disabledDaysFromRange = getDisabledDaysFromEnabledDays(enabledDays, t);
      setDisabledDays(disabledDaysFromRange);

      const boundsKey = `${start?.toISOString?.() || ''}|${end?.toISOString?.() || ''}`;
      const rangeBoundsChanged = prevCustomRangeBoundsKey.current !== boundsKey;
      prevCustomRangeBoundsKey.current = boundsKey;

      const firstCall =
        !isDefaultDaysSelectionMounted.current && !shiftDetail?.officer?.shiftDays?.length;
      const otherCalls = isDefaultDaysSelectionMounted.current;
      if (firstCall || (otherCalls && rangeBoundsChanged)) {
        updateSelectedDaysInCancelModal(enabledDays);
      }

      isDefaultDaysSelectionMounted.current = true;
    } else if (shiftDetail?.shiftDays) {
      setDisabledDays(daysOfWeekWithVal(t)?.map((val) => val.value));
    }
  }, [start, end, shiftDetail?.shiftDays]);

  const setDates = (dates = []) => {
    if (!isDateMounted.current) {
      isDateMounted.current = true;
      return;
    }

    const startAnchor =
      shiftDetail?.selectedShiftStartTime || shiftDetail?.startsAt || shiftDetail?.shiftStartTime;
    if (!startAnchor) return;

    const firstDate = dayjs(dates?.[0]).format('YYYY-MM-DD');
    const secondDate = dayjs(dates?.[1]).format('YYYY-MM-DD');

    const startDate = getEmbededDateAndTimeWRTStandardOffset(shiftDetail?.startsAt, firstDate);
    const endDate = getEmbededDateAndTimeWRTStandardOffset(shiftDetail?.startsAt, secondDate);
    setCancelSelectedDates([startDate, endDate]);
  };

  const reasonTrimmed = reason.trim();
  const canSubmit = reasonTrimmed.length > 0;
  const isCustomRangeSelected = scope === CANCEL_SCOPE.CUSTOM_RANGE;

  const confirmAndSubmitCancel = async () => {
    if (!canSubmit) return;
    const isInvalidCustomRangeDays =
      scope === CANCEL_SCOPE.CUSTOM_RANGE && !(selectedDays?.length > 0);
    if (isInvalidCustomRangeDays) {
      setShowCancelConfirmation(false);
      setShowCustomRangeDaysError(true);
      return;
    }
    try {
      const isSuccess = await onConfirm?.({
        scope,
        reason: reasonTrimmed,
        customRange: {
          startDate: cancelSelectedDates?.[0]?.toISOString?.() || '',
          endDate: cancelSelectedDates?.[1]?.toISOString?.() || '',
          days: selectedDays,
        },
      });
      if (isSuccess) {
        setShowCancelConfirmation(false);
        onClose?.();
        return;
      }
      // Keep cancel modal open for correction/retry, but close confirmation overlay.
      setShowCancelConfirmation(false);
    } catch (_error) {
      // Recover from API/network errors by closing confirmation overlay.
      setShowCancelConfirmation(false);
    }
  };

  const selectDaysHandler = (e) => {
    updateSelectedDaysInCancelModal(e.target.value);
    if (e.target.value?.length) setShowCustomRangeDaysError(false);
  };

  const openConfirmAlert = () => {
    const isInvalidCustomRangeDays =
      scope === CANCEL_SCOPE.CUSTOM_RANGE && !(selectedDays?.length > 0);
    if (isInvalidCustomRangeDays) {
      setShowCustomRangeDaysError(true);
      return;
    }
    setShowCancelConfirmation(true);
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="sm"
        fullWidth
        scroll="body"
        PaperProps={{
          className: classes.cancelShiftDialogPaper,
        }}
      >
        <DialogContent
          sx={{ p: 3 }}
          className={`${classes.cancelShiftContentWrapper} ${isCustomRangeSelected ? classes.cancelShiftContentWrapperActive : ''}`}
        >
          <Box className={classes.cancelShiftHeaderRow}>
            <CancelShiftIcon />
            <Box>
              <Typography variant="h3" className={classes.cancelShiftTitle}>
                {t('obx.schedules.cancelShiftModal.title')}
              </Typography>
              <Typography variant="body2" className={classes.cancelShiftSubtitle}>
                {t('obx.schedules.cancelShiftModal.subtitle')}
              </Typography>
            </Box>
          </Box>
          <FormControl component="fieldset" variant="standard" fullWidth>
            <RadioGroup
              value={scope}
              onChange={(_, value) => {
                setScope(value);
                if (value !== CANCEL_SCOPE.CUSTOM_RANGE) setShowCustomRangeDaysError(false);
              }}
              name="cancel-shift-scope"
            >
              {showThisShiftOption && (
                <FormControlLabel
                  className={classes.cancelShiftRadioRoot}
                  value={CANCEL_SCOPE.THIS_SHIFT}
                  control={<Radio />}
                  label={t('obx.schedules.cancelShiftModal.thisShift')}
                />
              )}
              {!isPastShift && !shiftDetail?.isTimeUpdated && (
                <>
                  <FormControlLabel
                    className={classes.cancelShiftRadioRoot}
                    value={CANCEL_SCOPE.THIS_AND_FOLLOWING}
                    control={<Radio />}
                    label={t('obx.schedules.cancelShiftModal.thisAndFollowingShifts')}
                  />
                  <Divider className={classes.cancelShiftRadioDivider} />
                  <FormControlLabel
                    className={classes.cancelShiftRadioRoot}
                    value={CANCEL_SCOPE.CUSTOM_RANGE}
                    control={<Radio />}
                    label={t('obx.schedules.cancelShiftModal.customRange')}
                  />
                </>
              )}
            </RadioGroup>
          </FormControl>
          {scope === CANCEL_SCOPE.CUSTOM_RANGE && (
            <Box className={classes.cancelShiftCustomRangePanel}>
              <Box className={classes.cancelShiftCustomRangeContainer}>
                <Box className={classes.assignRangeDatePickers}>
                  <InputLabel className={classes.cancelShiftReasonLabel}>
                    {t('obx.schedules.cancelShiftModal.startEndDate')}
                    <span className={classes.cancelShiftReasonAsterisk}>*</span>
                  </InputLabel>
                  <DateRangePickerWithButtons
                    selectedDates={
                      cancelSelectedDates?.length > 0
                        ? [dayjsWithStandardOffset(start), dayjsWithStandardOffset(end)]
                        : cancelSelectedDates
                    }
                    minDate={dayjsWithStandardOffset().startOf('day')}
                    syncSelectedDatesOnStateChange
                    setDates={setDates}
                    disabled={shiftDetail?.assignmentReadOnlyMode || shiftDetail?.isTimeUpdated}
                  />
                </Box>
                <Typography variant="subtitle2" className={classes.cancelShiftDaysLabel}>
                  {t('obx.schedules.cancelShiftModal.shiftDays')} <RequiredAsterik />
                </Typography>

                <Box className={classes.dayWrapper}>
                  <DaysSelection
                    name="weekDays"
                    selectedDays={selectedDays}
                    data={daysOfWeekWithVal(t)}
                    handleChange={selectDaysHandler}
                    truncateTo={3}
                    styledClass={classes.splitCustomDutyToggles}
                    disabled={disabledDays}
                  />
                </Box>
                {showCustomRangeDaysError && (
                  <Typography variant="body2" color="error" className={classes.invalidFeedback}>
                    {t('obx.runsheet.atLeastOneDayRequired')}
                  </Typography>
                )}
              </Box>
            </Box>
          )}
          <InputLabel className={classes.cancelShiftReasonLabel}>
            {t('obx.schedules.cancelShiftModal.reasonLabel')}
            <span className={classes.cancelShiftReasonAsterisk}>*</span>
          </InputLabel>
          <TextField
            className={classes.cancelShiftReasonField}
            placeholder={t('obx.schedules.cancelShiftModal.reasonPlaceholder')}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            multiline
            minRows={4}
            required
            variant="outlined"
            fullWidth
          />
          <Box className={classes.cancelShiftActions}>
            <Button variant="secondaryGrey" onClick={onClose}>
              {t('obx.schedules.cancelShiftModal.close')}
            </Button>
            <Button variant="destructive" disabled={!canSubmit} onClick={openConfirmAlert}>
              {t('obx.schedules.cancelShiftModal.confirm')}
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      <SweetAlertModal
        type="warning"
        title={t('obx.schedules.cancelShiftModal.title')}
        text={t('obx.schedules.cancelShiftModal.subtitle')}
        cancelButtonText={t('obx.schedules.cancelShiftModal.close')}
        confirmButtonText={t('obx.schedules.cancelShiftModal.confirm')}
        show={showCancelConfirmation}
        handleConfirmButton={confirmAndSubmitCancel}
        handleCancelButton={() => setShowCancelConfirmation(false)}
        icon={<CancelShiftIcon />}
      />
    </>
  );
};

CancelShiftModal.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  shiftDetail: PropTypes.object,
  onConfirm: PropTypes.func,
  isPastShift: PropTypes.bool,
  fromJobSection: PropTypes.bool,
};

CancelShiftModal.defaultProps = {
  open: false,
  onClose: () => {},
  shiftDetail: {},
  onConfirm: undefined,
  isPastShift: false,
  fromJobSection: false,
};

export default CancelShiftModal;
