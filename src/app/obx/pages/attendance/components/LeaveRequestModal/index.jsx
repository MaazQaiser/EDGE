import { Box, Button, InputLabel, TextField, Typography } from '@mui/material';
import ModalComponent from 'commonComponents/modal';
import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import ResponsiveDateTimePickers from 'src/app/components/common/dateTimePicker';
import { useStyles } from 'src/app/obx/pages/attendance/listing/listingStyles';
import useFormHook from 'src/hooks/useFormHook';
import formValidatorJoi from 'src/utils/formValidator/formValidator.requiredCheck';

const dateFormat = 'DD-MM-YYYY HH:mm A';
const LeaveRequestModal = ({ open, handleClose, onSubmit, isLoading, t }) => {
  const classes = useStyles();
  const [endDateTimeDisplayValue, setEndDateTimeDisplayValue] = useState(null);

  const { handleInputChange, formData, errorMessages, setErrorMessages } = useFormHook({
    defaultFormData: {
      leaveReason: '',
      startDateTime: null,
      endDateTime: null,
    },
  });

  // Reset display value when startDateTime changes, endDateTime is cleared, or modal closes
  useEffect(() => {
    if (!open) {
      setEndDateTimeDisplayValue(null);
    } else if (formData?.startDateTime && !formData?.endDateTime) {
      // Set display value to startDateTime so picker opens showing correct date
      setEndDateTimeDisplayValue(formData.startDateTime);
    } else if (!formData?.endDateTime) {
      // Clear display value if endDateTime is cleared
      setEndDateTimeDisplayValue(null);
    }
  }, [formData?.startDateTime, formData?.endDateTime, open]);

  const onApplyLeave = async () => {
    const finalPayLoad = {
      ...formData,
      startDateTime: formData?.startDateTime || null,
      endDateTime: formData?.endDateTime || null,
    };
    const errors = await formValidatorJoi(finalPayLoad, t);

    if (errors && Object.keys(errors).length) {
      setErrorMessages((prev) => ({ ...prev, ...errors }));

      return;
    }

    onSubmit(finalPayLoad);
  };

  const handleDateChange = (name, value) => {
    const event = {
      target: {
        name: name,
        value: value,
      },
    };
    handleInputChange(event);
  };

  const getMinDateTimeForEndDate = () => {
    if (formData?.startDateTime) {
      return dayjs(formData?.startDateTime);
    }
    return dayjs();
  };

  // Get the value to display in the endDateTime picker
  const getEndDateTimeValue = () => {
    // If endDateTime is set, use it
    if (formData?.endDateTime) {
      return formData?.endDateTime;
    }
    // Otherwise use the display value (which is set to startDateTime when picker should open)
    return endDateTimeDisplayValue;
  };

  const handleEndDateTimeChange = (value) => {
    // When user selects a value, update both formData and display value
    handleDateChange('endDateTime', value);
    setEndDateTimeDisplayValue(value);
  };

  const leaveRequestModalBody = (
    <Box className={classes.rejectLeaveModalBody}>
      <Typography variant="h3" className={classes.leaveRequestModalBodyTitle}>
        {t('obx.attendance.leaveRequestForm.title')}
      </Typography>
      <Typography variant="body2" className={classes.rejectLeaveModalBodyText}>
        {t('obx.attendance.leaveRequestForm.desc')}
      </Typography>

      <Box className={classes.rejectLeaveModalBodyDateTime}>
        <Box className={classes.modalDateTimePicker}>
          <InputLabel>{t('obx.attendance.leaveRequestForm.startDateTime')}</InputLabel>
          {/*<ResponsiveDatePickers />*/}
          <ResponsiveDateTimePickers
            name={'startDateTime'}
            value={formData?.startDateTime}
            onChange={(value) => {
              handleDateChange('startDateTime', value);
              handleDateChange('endDateTime', null);
            }}
            timeStepsMinutes={1}
            format={dateFormat}
            placeholder={dayjs().format(dateFormat)}
            minDateTime={dayjs()}
            helperText={errorMessages.startDateTime}
            error={!!errorMessages.startDateTime}
          />
        </Box>

        <Box className={classes.modalDateTimePicker}>
          <InputLabel>{t('obx.attendance.leaveRequestForm.endDateTime')}</InputLabel>
          <ResponsiveDateTimePickers
            name={'endDateTime'}
            timeStepsMinutes={1}
            value={getEndDateTimeValue()}
            disabled={!formData?.startDateTime}
            onChange={handleEndDateTimeChange}
            format={dateFormat}
            placeholder={
              formData?.startDateTime
                ? dayjs(formData?.startDateTime).format(dateFormat)
                : dayjs().format(dateFormat)
            }
            minDateTime={getMinDateTimeForEndDate()}
            helperText={errorMessages.endDateTime}
            error={!!errorMessages.endDateTime}
          />
        </Box>
      </Box>

      <Box className={classes.leaveRequestModalBodyField}>
        <TextField
          placeholder={t('obx.attendance.leaveRequestForm.reason')}
          minRows={5}
          maxRows={5}
          multiline
          onChange={handleInputChange}
          name="leaveReason"
          value={formData?.leaveReason}
          helperText={errorMessages?.leaveReason || ''}
          error={!!errorMessages?.leaveReason}
        />
      </Box>
      <Box className={classes.leaveRequestModalBodyActions}>
        <Button variant="secondaryGrey" onClick={handleClose} disabled={isLoading}>
          {t('buttons.cancel')}
        </Button>
        <Button variant="primary" onClick={onApplyLeave} disabled={isLoading}>
          {t('obx.attendance.leaveRequestForm.applyLeave')}
        </Button>
      </Box>
    </Box>
  );

  return <ModalComponent open={open} handleClose={handleClose} body={leaveRequestModalBody} />;
};

export default LeaveRequestModal;

LeaveRequestModal.propTypes = {
  open: PropTypes.bool,
  handleClose: PropTypes.func,
  isLoading: PropTypes.bool,
  onSubmit: PropTypes.func,
  t: PropTypes.node,
};
