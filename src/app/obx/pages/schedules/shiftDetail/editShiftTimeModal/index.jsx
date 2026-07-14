import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { Box, Button, Chip, IconButton, InputLabel, Tooltip, Typography } from '@mui/material';
import ResponsiveDateTimePickers from 'commonComponents/dateTimePicker';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ModalComponent from 'src/app/components/common/modal';
import {
  dayjsWithStandardOffset,
  getCurrentStandardTimeInIsoWrtTimezone,
  isEarlierThan,
  isMoreThan24HoursApart,
} from 'src/app/obx/pages/schedules/helper';
import { AlertIcon } from 'src/assets/svg';
import { ReactComponent as AlertJobIcon } from 'src/assets/svg/AlertJobIcon.svg?react';
import { ReactComponent as BlueEditPencilIcon } from 'src/assets/svg/edit-bg.svg?react';
import { isObjectEmpty } from 'src/helper/utilityFunctions';
import useDateTime from 'src/hooks/useDateTime';
import { updateShiftTimeDedicated } from 'src/services/duty.services';
import { dayjsFormatsEnum, toastSettings } from 'src/utils/constants';
import { calendarShiftStatusEnum } from 'src/utils/constants/schedules';
import joiValidate from 'src/utils/formValidator/formValidator.requiredCheck';
import { toaster } from 'src/utils/toast';

import { useStyles } from './EditShiftTimeModal';

const EditShiftTimeModal = ({ open, onClose, refetchJobs, selectedJob, closeSideDrawer }) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const isOngoingShift = selectedJob?.shiftStatus === calendarShiftStatusEnum?.SHIFT_STARTED;
  const currentTime = getCurrentStandardTimeInIsoWrtTimezone();
  const selectedShiftEndTime = selectedJob?.selectedShiftEndTime ?? selectedJob?.endsAt;
  const isPastShift = selectedShiftEndTime && isEarlierThan(selectedShiftEndTime, currentTime);
  const { formatDayjsDateTime } = useDateTime();

  const [formData, setFormData] = useState({ startsAt: null, endsAt: null });
  const [errorMessages, setErrorMessages] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Initialize form data when job changes
  useEffect(() => {
    if (selectedJob) {
      setFormData({
        startsAt: selectedJob?.selectedShiftStartTime,
        endsAt: selectedJob?.selectedShiftEndTime,
      });
    }
  }, [selectedJob]);

  const handleDateChange = useCallback((key, value) => {
    const isValid = value?.$d != null && !Number.isNaN(Number(value.$d));
    setFormData((prev) => ({
      ...prev,
      [key]: isValid ? value : null,
    }));
    setErrorMessages({});
  }, []);

  const handleSubmit = useCallback(async () => {
    const { startsAt, endsAt } = formData;

    const validatePayload = {
      startsAt: startsAt ? dayjsWithStandardOffset(startsAt).toISOString() : '',
      endsAt: endsAt ? dayjsWithStandardOffset(endsAt).toISOString() : '',
    };

    const validationError = await joiValidate(validatePayload, t);
    if (validationError && Object.keys(validationError).length) {
      setErrorMessages(validationError);
      return;
    }

    // Checking if the end time is before the start time
    if (!isEarlierThan(startsAt, endsAt)) {
      setErrorMessages({ errorText: t('obx.schedules.errorMessages.isStartAfterEnd') });
      return;
    }

    // Checking if end time is before the current time for ongoing shifts
    if (isOngoingShift && isEarlierThan(endsAt, getCurrentStandardTimeInIsoWrtTimezone())) {
      setErrorMessages({ errorText: t('obx.schedules.errorMessages.endTimeBeforeCurrentTime') });
      return;
    }

    // Checking if the time duration is more than 24 hours
    if (isMoreThan24HoursApart(startsAt, endsAt)) {
      setErrorMessages({ errorText: t('obx.schedules.errorMessages.timeDurationMoreThan24') });
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        shiftType: selectedJob.shiftType,
        shiftId: selectedJob.id,
        startsAt: selectedJob.selectedShiftStartTime,
        endsAt: selectedJob.selectedShiftEndTime,
        activityLogId: selectedJob.logId || selectedJob.id,
        timeDetails: [
          {
            ...(!isOngoingShift && {
              newStartsAt: dayjsWithStandardOffset(startsAt).toISOString(),
            }),
            newEndsAt: dayjsWithStandardOffset(endsAt).toISOString(),
          },
        ],
      };

      const response = await updateShiftTimeDedicated({ payload });
      if (response?.statusCode === 200) {
        toaster.success({
          text: response.message,
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
        refetchJobs();
        closeSideDrawer();
        onClose();
      }
    } catch (err) {
      setErrorMessages({
        errorText: err?.message,
      });
    } finally {
      setIsLoading(false);
    }
  }, [formData, selectedJob, refetchJobs, t, onClose, closeSideDrawer, isOngoingShift]);

  const isShiftTimeSame = () =>
    selectedJob?.selectedShiftStartTime ===
      dayjsWithStandardOffset(formData?.startsAt)?.toISOString() &&
    selectedJob?.selectedShiftEndTime === dayjsWithStandardOffset(formData?.endsAt)?.toISOString();

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
                {t('obx.schedules.editDedicatedShift')}
              </Typography>
              <Typography className={classes.subText} variant="subtitle2">
                {t('obx.schedules.editDedicatedShiftDes')}
              </Typography>
              <Box className={classes.reassignShiftChip}>
                <Chip
                  icon={<AlertIcon />}
                  label={t('obx.schedules.editDedicatedShiftAlert')}
                  color="primary"
                />
              </Box>
            </Box>

            <Box className={classes.inlinefield}>
              {['startsAt', 'endsAt'].map((key) => {
                const isStartField = key === 'startsAt';
                const isStartDisabled = isStartField && isOngoingShift;
                const picker = (
                  <ResponsiveDateTimePickers
                    name={key}
                    id={key}
                    timeStepsMinutes={1}
                    value={formData[key] || null}
                    onChange={(value) => handleDateChange(key, value)}
                    error={!!errorMessages[key]}
                    helperText={errorMessages[key]}
                    minDateTime={
                      key === 'endsAt' ? formData?.startsAt : isPastShift ? null : currentTime
                    }
                    disabled={isStartDisabled}
                  />
                );
                return (
                  <Box key={key} className={classes.inlinefieldInner}>
                    <InputLabel sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      {t(
                        `obx.sites.jobs.editDedicatedJobTime.${
                          isStartField ? 'startTime' : 'endTime'
                        }`,
                      )}
                      {isStartDisabled && (
                        <Tooltip
                          title={t(
                            'obx.schedules.errorMessages.startTimeCannotBeEditedForOngoingShifts',
                          )}
                          placement="top"
                          arrow
                        >
                          <IconButton
                            size="small"
                            sx={{ p: 0.25, ml: 0.25, color: 'primary.main' }}
                            aria-label={t(
                              'obx.schedules.errorMessages.startTimeCannotBeEditedForOngoingShifts',
                            )}
                          >
                            <InfoOutlinedIcon sx={{ fontSize: 18, color: 'inherit' }} />
                          </IconButton>
                        </Tooltip>
                      )}
                    </InputLabel>
                    {picker}
                  </Box>
                );
              })}
            </Box>

            <Box className={classes.timeAndError}>
              <Box className={classes.inlinefieldText}>
                <InputLabel>{t('obx.schedules.editDedicatedShiftDay')}</InputLabel>
                <Typography variant="subtitle2">
                  {formatDayjsDateTime({
                    value: formData.startsAt,
                    formatType: dayjsFormatsEnum.dayMonDY,
                  })}
                </Typography>
              </Box>

              {!isObjectEmpty(errorMessages?.errorText) && (
                <Box className={classes.inlinefieldError}>
                  <Box severity="error" className={classes.siteAlert}>
                    <AlertJobIcon />
                    <Typography variant="body2">{errorMessages.errorText}</Typography>
                  </Box>
                </Box>
              )}
            </Box>
          </Box>

          <Box className={classes.rejectModalActions}>
            <Button variant="secondaryGrey" onClick={onClose}>
              {t('obx.sites.jobs.editDedicatedJobTime.cancel')}
            </Button>
            <Button
              variant="primary"
              disabled={isLoading || isShiftTimeSame() || !isObjectEmpty(errorMessages?.errorText)}
              onClick={handleSubmit}
            >
              {t('obx.sites.jobs.editDedicatedJobTime.updateShiftTime')}
            </Button>
          </Box>
        </Box>
      }
    />
  );
};

EditShiftTimeModal.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  refetchJobs: PropTypes.func,
  selectedJob: PropTypes.object,
  setShiftData: PropTypes.func,
  closeSideDrawer: PropTypes.func,
};

EditShiftTimeModal.defaultProps = {
  open: false,
  onClose: () => {},
  refetchJobs: () => {},
  selectedJob: null,
  setShiftData: () => {},
  closeSideDrawer: () => {},
};

export default React.memo(EditShiftTimeModal);
