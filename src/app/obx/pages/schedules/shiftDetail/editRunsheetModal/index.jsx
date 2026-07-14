import { Alert, Box, Button, InputLabel, Typography } from '@mui/material';
import ResponsiveDateTimePickers from 'commonComponents/dateTimePicker';
import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ModalComponent from 'src/app/components/common/modal';
import {
  dayjsWithStandardOffset,
  getCurrentStandardTimeInIsoWrtTimezone,
  isEarlierThan,
  isMoreThan24HoursApart,
} from 'src/app/obx/pages/schedules/helper';
import { ReactComponent as AlertJobIcon } from 'src/assets/svg/AlertJobIcon.svg?react';
import { ReactComponent as BlueEditPencilIcon } from 'src/assets/svg/edit-bg.svg?react';
import { useTenantLabel } from 'src/helper/utilityHooks';
import { updateOngoingPatrolShiftTime } from 'src/services/runsheet.services';
import { toastSettings } from 'src/utils/constants';
import { calendarShiftStatusEnum } from 'src/utils/constants/schedules';
import joiValidate from 'src/utils/formValidator/formValidator.requiredCheck';
import { toaster } from 'src/utils/toast';

import ContractBoundaryHitsDisplay from './ContractBoundaryHitsDisplay';
import { useStyles } from './editRunsheetModal.styles';

const EditRunsheetModal = ({
  open,
  onClose,
  shiftData,
  shiftId,
  runsheetId: _runsheetId,
  shiftActivityLogId,
  callbackOnSuccess,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const { getLabel } = useTenantLabel();

  const initialStartsAt = shiftData?.runsheetDetails?.startsAt || shiftData?.startsAt;
  const initialEndsAt = shiftData?.runsheetDetails?.endsAt || shiftData?.endsAt;

  const currentTime = useMemo(() => getCurrentStandardTimeInIsoWrtTimezone(), []);
  const isFutureShift = initialStartsAt
    ? currentTime < initialStartsAt
    : shiftData?.scheduleStatus === calendarShiftStatusEnum.NOT_STARTED;
  const isPastShift = Boolean(initialEndsAt && currentTime >= initialEndsAt);
  const isOngoingShift = !isFutureShift && !isPastShift;

  const [formData, setFormData] = useState({ startsAt: null, endsAt: null });
  const [errorMessages, setErrorMessages] = useState({});
  const [errorHits, setErrorHits] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open && shiftData) {
      setFormData({
        startsAt: initialStartsAt,
        endsAt: initialEndsAt,
      });
      setErrorMessages({});
      setErrorHits([]);
    }
  }, [open, shiftData, initialStartsAt, initialEndsAt]);

  const handleDateChange = useCallback((key, value) => {
    const isValid = value && dayjs(value).isValid();
    setFormData((prev) => ({
      ...prev,
      [key]: isValid ? value : null,
    }));
    setErrorMessages({});
    setErrorHits([]);
  }, []);

  const isStartEditable = isFutureShift || isPastShift;

  const handleSubmit = useCallback(async () => {
    const startsAtIso = isStartEditable
      ? dayjsWithStandardOffset(formData.startsAt).toISOString()
      : dayjsWithStandardOffset(initialStartsAt).toISOString();
    const endsAtIso = dayjsWithStandardOffset(formData.endsAt).toISOString();

    const validatePayload = {
      startsAt: isStartEditable
        ? formData.startsAt
          ? dayjsWithStandardOffset(formData.startsAt).toISOString()
          : ''
        : initialStartsAt
          ? dayjsWithStandardOffset(initialStartsAt).toISOString()
          : '',
      endsAt: formData.endsAt ? dayjsWithStandardOffset(formData.endsAt).toISOString() : '',
    };

    const validationError = await joiValidate(validatePayload, t);
    if (validationError && Object.keys(validationError).length) {
      setErrorMessages(validationError);
      return;
    }

    if (isFutureShift) {
      if (!isEarlierThan(currentTime, startsAtIso)) {
        setErrorMessages({ errorText: t('obx.schedules.errorMessages.startTimeBeforeCurrent') });
        return;
      }
    }

    if (isPastShift) {
      if (isEarlierThan(currentTime, startsAtIso) || isEarlierThan(currentTime, endsAtIso)) {
        setErrorMessages({
          errorText: t('obx.schedules.errorMessages.shiftCannotUpdateBeyondCurrentTime'),
        });
        return;
      }
    } else if (!isEarlierThan(currentTime, endsAtIso)) {
      setErrorMessages({ errorText: t('obx.schedules.errorMessages.endTimeBeforeCurrent') });
      return;
    }

    if (!isEarlierThan(startsAtIso, endsAtIso)) {
      setErrorMessages({ errorText: t('obx.schedules.errorMessages.isStartAfterEnd') });
      return;
    }

    if (isOngoingShift && !isEarlierThan(initialStartsAt, endsAtIso)) {
      setErrorMessages({ errorText: t('obx.schedules.errorMessages.endTimeBeforeExecution') });
      return;
    }

    if (isMoreThan24HoursApart(startsAtIso, endsAtIso)) {
      setErrorMessages({ errorText: t('obx.schedules.errorMessages.timeDurationMoreThan24') });
      return;
    }

    setIsLoading(true);
    setErrorMessages({});
    setErrorHits([]);

    try {
      const newStartsAtIso = startsAtIso;
      const newEndsAtIso = endsAtIso;
      const originalStartsAtIso = dayjsWithStandardOffset(initialStartsAt).toISOString();
      const originalEndsAtIso = dayjsWithStandardOffset(initialEndsAt).toISOString();

      const payload = {
        startsAt: originalStartsAtIso,
        endsAt: originalEndsAtIso,
        newStartsAt: newStartsAtIso,
        newEndsAt: newEndsAtIso,
      };

      const response = await updateOngoingPatrolShiftTime({
        activityLogId: shiftActivityLogId,
        runsheetId: shiftId,
        payload,
      });

      if (response?.statusCode === 200) {
        toaster.success({
          text:
            response.message ||
            t('obx.schedules.dutyDetail.runsheetDetail.editRunsheetModal.successMessage'),
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
        callbackOnSuccess?.(newStartsAtIso, newEndsAtIso);
        onClose();
      }
    } catch (err) {
      const hits = err?.violatingHits ?? err?.data?.violatingHits;
      setErrorMessages({ errorText: err?.message || t('errors.somethingWentWrong') });
      setErrorHits(Array.isArray(hits) ? hits : []);
    } finally {
      setIsLoading(false);
    }
  }, [
    formData,
    shiftId,
    shiftActivityLogId,
    initialStartsAt,
    initialEndsAt,
    isFutureShift,
    isPastShift,
    isOngoingShift,
    isStartEditable,
    currentTime,
    t,
    onClose,
    callbackOnSuccess,
  ]);

  const isFormUnchanged = () => {
    const startsSame =
      dayjsWithStandardOffset(initialStartsAt).toISOString() ===
      dayjsWithStandardOffset(formData?.startsAt || initialStartsAt).toISOString();
    const endsSame =
      dayjsWithStandardOffset(initialEndsAt).toISOString() ===
      dayjsWithStandardOffset(formData?.endsAt || initialEndsAt).toISOString();
    return startsSame && endsSame;
  };

  const minStartDateTime = () => {
    if (isFutureShift) return currentTime;
    return null;
  };

  const maxDateTime = () => (isPastShift ? currentTime : null);

  const minEndDateTime = useCallback(() => {
    if (isPastShift) {
      const start = formData?.startsAt || initialStartsAt;
      return start || null;
    }

    const start = formData?.startsAt || initialStartsAt;
    if (!start) return currentTime;
    const startDayjs = dayjsWithStandardOffset(start);
    const currentDayjs = dayjsWithStandardOffset(currentTime);
    return currentDayjs.isAfter(startDayjs) ? currentTime : start;
  }, [formData?.startsAt, initialStartsAt, isPastShift, currentTime]);

  const modalDescription = isPastShift
    ? t('obx.schedules.dutyDetail.runsheetDetail.editRunsheetModal.descriptionPast', {
        runsheet: getLabel('terms', 'runsheet', t).toLowerCase(),
      })
    : isFutureShift
      ? t('obx.schedules.dutyDetail.runsheetDetail.editRunsheetModal.descriptionFuture', {
          runsheet: getLabel('terms', 'runsheet', t).toLowerCase(),
        })
      : t('obx.schedules.dutyDetail.runsheetDetail.editRunsheetModal.description', {
          runsheet: getLabel('terms', 'runsheet', t).toLowerCase(),
        });

  return (
    <ModalComponent
      open={open}
      handleClose={onClose}
      body={
        <Box className={classes.rejectModal}>
          <Box className={classes.rejectModalInner}>
            <BlueEditPencilIcon />
            <Box>
              <Typography variant="h3" className={classes.rejectModalTitle}>
                {t('obx.schedules.dutyDetail.runsheetDetail.editRunsheetModal.title', {
                  runsheet: getLabel('terms', 'runsheet', t),
                })}
              </Typography>
              <Typography className={classes.subText} variant="subtitle2">
                {modalDescription}
              </Typography>
              <Box className={classes.subText}>
                <Alert severity="info" className={classes.grayAlert}>
                  {t('obx.schedules.editDedicatedShiftAlert')}
                </Alert>
              </Box>
            </Box>

            <Box className={classes.inlinefield}>
              <Box className={classes.inlinefieldInner}>
                <InputLabel>
                  {t('obx.schedules.dutyDetail.runsheetDetail.editRunsheetModal.startDate')}
                </InputLabel>
                <ResponsiveDateTimePickers
                  name="startsAt"
                  value={formData?.startsAt ?? initialStartsAt}
                  disabled={!isStartEditable}
                  onChange={
                    isStartEditable ? (value) => handleDateChange('startsAt', value) : () => {}
                  }
                  minDateTime={minStartDateTime()}
                  maxDateTime={maxDateTime()}
                />
              </Box>
              <Box className={classes.inlinefieldInner}>
                <InputLabel>
                  {t('obx.schedules.dutyDetail.runsheetDetail.editRunsheetModal.endDate')}
                </InputLabel>
                <ResponsiveDateTimePickers
                  name="endsAt"
                  value={formData?.endsAt ?? initialEndsAt}
                  onChange={(value) => handleDateChange('endsAt', value)}
                  error={!!errorMessages.endsAt}
                  helperText={errorMessages.endsAt}
                  minDateTime={minEndDateTime()}
                  maxDateTime={maxDateTime()}
                />
              </Box>
            </Box>

            {errorMessages?.errorText && (
              <Box className={classes.inlinefieldError}>
                <Box className={classes.siteAlert}>
                  <AlertJobIcon />
                  <Typography variant="body2">{errorMessages.errorText}</Typography>
                </Box>
                {errorHits?.length > 0 && (
                  <ContractBoundaryHitsDisplay hits={errorHits} classes={classes} />
                )}
              </Box>
            )}
          </Box>

          <Box className={classes.rejectModalActions}>
            <Button variant="secondaryGrey" onClick={onClose}>
              {t('obx.schedules.dutyDetail.runsheetDetail.editRunsheetModal.cancel')}
            </Button>
            <Button
              variant="primary"
              disabled={isLoading || isFormUnchanged() || !!errorMessages?.errorText}
              onClick={handleSubmit}
            >
              {t('obx.schedules.dutyDetail.runsheetDetail.editRunsheetModal.update')}
            </Button>
          </Box>
        </Box>
      }
    />
  );
};

EditRunsheetModal.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  shiftData: PropTypes.object,
  shiftId: PropTypes.string,
  runsheetId: PropTypes.string,
  shiftActivityLogId: PropTypes.string,
  callbackOnSuccess: PropTypes.func,
};

EditRunsheetModal.defaultProps = {
  open: false,
  onClose: () => {},
  shiftData: null,
  shiftId: '',
  runsheetId: undefined,
  shiftActivityLogId: undefined,
  callbackOnSuccess: () => {},
};

export default React.memo(EditRunsheetModal);
