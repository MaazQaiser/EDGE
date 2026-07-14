import { Box, Button, InputLabel, TextField, Typography } from '@mui/material';
import { ReactComponent as BanIcon } from 'assets/svg/ban-modal-icon.svg?react';
import ModalComponent from 'commonComponents/modal';
import PropTypes from 'prop-types';
import React from 'react';
import { useTranslation } from 'react-i18next';
import ResponsiveDatePickers from 'src/app/components/common/datePicker';
import {
  dayjsWithStandardOffset,
  formatOffset,
  getStandardOffsetWithVariableTimeZone,
  getTimezone,
} from 'src/app/obx/pages/schedules/helper';
import { convertDataFromForeignOffsetToUTC } from 'src/helper/utilityFunctions';
import useFormHook from 'src/hooks/useFormHook';
import { terminateUser } from 'src/services/user.services';
import { toastSettings } from 'src/utils/constants';
import { TIMEZONE_LIST } from 'src/utils/constants/timeZones';
import formValidatorJoi from 'src/utils/formValidator/formValidator.requiredCheck';
import { toaster } from 'src/utils/toast';

import { useStyles } from './terminateUser.style';

const REASONS_CHARACTER_LIMIT = 1000;

const TerminateUserModal = ({ open, handleClose, userId, refetchUser }) => {
  const classes = useStyles();
  const [isTerminating, setIsTerminating] = React.useState(false);
  const { t } = useTranslation();
  const timezone = getTimezone();

  const { handleInputChange, formData, errorMessages, setErrorMessages } = useFormHook({
    defaultFormData: {
      reason: '',
      lastWorkingDay: null,
    },
  });

  const handleTerminateUser = async () => {
    let selectedTimeZone = TIMEZONE_LIST?.find((item) => item.tzCode === timezone)?.utc;
    const standardOffsetWrtTimezone = getStandardOffsetWithVariableTimeZone(
      formData?.lastWorkingDay,
      timezone,
    );
    selectedTimeZone = formatOffset((standardOffsetWrtTimezone + 0) / 60);

    const finalLastWorkingDay = formData?.lastWorkingDay
      ? convertDataFromForeignOffsetToUTC(formData?.lastWorkingDay, selectedTimeZone)[0].format()
      : '';

    const payload = {
      ...formData,
      lastWorkingDay: finalLastWorkingDay ? finalLastWorkingDay : null,
    };

    const errors = await formValidatorJoi(payload, t);
    if (errors && Object.keys(errors).length) {
      setErrorMessages((prev) => ({ ...prev, ...errors }));
      return;
    }

    if (!userId) return;

    try {
      setIsTerminating(true);
      const response = await terminateUser(userId, { user: payload });
      if (response?.statusCode === 200) {
        toaster.success({
          text: response?.message,
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
      }
    } catch (err) {
      toaster.error({
        text: err?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    } finally {
      refetchUser();
      setIsTerminating(false);
      handleClose();
    }
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

  const terminateUserModalBody = (
    <Box className={classes.rejectLeaveModalBody}>
      <BanIcon />
      <Typography variant="h3" className={classes.terminateUserModalBodyTitle}>
        {t('obx.users.terminateUser.title')}
      </Typography>
      <Typography variant="body2" className={classes.rejectLeaveModalBodyText}>
        {t('obx.users.terminateUser.description')}
      </Typography>
      <Box className={classes.rejectLeaveModalBodyDateTime}>
        <Box className={classes.modalDateTimePicker}>
          <InputLabel>{t('obx.users.terminateUser.lastWorkingDay')}</InputLabel>
          {/*<ResponsiveDatePickers />*/}
          <ResponsiveDatePickers
            name="lastWorkingDay"
            format="MM/DD/YYYY"
            value={formData?.lastWorkingDay}
            onChange={(value) => {
              handleDateChange('lastWorkingDay', value);
            }}
            placeholder={`${t('obx.schedules.selectDate')}`}
            minDate={dayjsWithStandardOffset().add(1, 'day').utc()}
            timezone={'UTC'}
            error={!!errorMessages?.lastWorkingDay}
            helperText={!!errorMessages?.lastWorkingDay ? errorMessages?.lastWorkingDay : null}
            setToStartOfDay={true}
            isInputFieldReadOnly={true}
          />
        </Box>
      </Box>
      <Box className={classes.terminateUserModalBodyField}>
        <TextField
          placeholder={t('obx.attendance.leaveRequestForm.reason')}
          minRows={5}
          maxRows={5}
          multiline
          onChange={handleInputChange}
          name="reason"
          value={formData?.reason}
          error={!!errorMessages?.reason}
          helperText={
            <Box className={classes.addBannedHelperText}>
              <Box className={classes.invalidFeedback}>{errorMessages?.reason || ''}</Box>
              <Typography variant="body2" className={classes.reasonCharacterLimit}>
                {`${formData?.reason.length}/${REASONS_CHARACTER_LIMIT}`}
                <Typography variant="body2" className={classes.reasonCharacterLimit}>
                  {t('obx.attendance.leaveRequestForm.characters')}
                </Typography>
              </Typography>
            </Box>
          }
          inputProps={{
            maxlength: REASONS_CHARACTER_LIMIT,
          }}
        />
      </Box>
      <Box className={classes.terminateUserModalBodyActions}>
        <Button variant="secondaryGrey" onClick={handleClose} disabled={isTerminating}>
          {t('buttons.cancel')}
        </Button>
        <Button variant="destructive" onClick={handleTerminateUser} disabled={isTerminating}>
          {t('obx.attendance.leaveRequestForm.terminateUser')}
        </Button>
      </Box>
    </Box>
  );

  return <ModalComponent open={open} handleClose={handleClose} body={terminateUserModalBody} />;
};

export default TerminateUserModal;

TerminateUserModal.propTypes = {
  open: PropTypes.bool,
  handleClose: PropTypes.func,
  isLoading: PropTypes.bool,
  refetchUser: PropTypes.func,
  t: PropTypes.node,
  userId: PropTypes.string,
};

TerminateUserModal.defaultProps = {
  open: false,
  handleClose: () => {},
  isLoading: false,
  refetchUser: () => {},
  userId: null,
};
