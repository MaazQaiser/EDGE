import { Box, InputLabel } from '@mui/material';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ResponsiveDatePickers from 'src/app/components/common/datePicker';
import ModalComponent from 'src/app/components/common/modal';
import RequiredAsterik from 'src/app/components/common/requiredAsterik';
import { ReactComponent as BlueLockIPayramIcon } from 'src/assets/svg/BlueLockIPayramIcon.svg?react';
import { lockPayrun } from 'src/services/payroll.services';
import { toastSettings } from 'src/utils/constants';
import joiValidate from 'src/utils/formValidator/formValidator.requiredCheck';
import { toaster } from 'src/utils/toast';

import { appendDefaultStartAndEndTimeWithDates } from '../../../schedules/helper';
import { useStyles } from './timeOffModal';

const initialFormdata = {
  startDate: '',
  endDate: '',
};

const TimeOffModal = ({ open, onClose, refetchPayroll, isPatrol, isLockedPayrun }) => {
  const classes = useStyles();
  const [formData, setFormData] = useState(initialFormdata);
  const [errorMessages, setErrorMessages] = useState(null);
  const [isLoading, setLoading] = useState(false);

  const { t } = useTranslation();

  const handleSubmit = async () => {
    setLoading(true);
    const validatePayload = {
      startDate: formData?.startDate ? formData?.startDate?.format() : '',
      endDate: formData?.endDate ? formData?.endDate?.format() : '',
    };
    const error = await joiValidate(validatePayload, t);
    if (error && Object.keys(error).length) {
      setErrorMessages(error);
      return;
    }
    if (dayjs(formData?.endDate).isBefore(dayjs(formData?.startDate))) {
      setErrorMessages({
        endDate: t('obx.payroll.endDateError'),
        startDate: t('obx.payroll.startDateError'),
      });
      return;
    } else {
      setErrorMessages({});
    }
    try {
      const _timezoneOffset = new Date().getTimezoneOffset();
      const convertedDates = appendDefaultStartAndEndTimeWithDates([
        formData?.startDate,
        formData?.endDate,
      ]);
      const startDate = convertedDates[0] ? convertedDates[0] : null;
      const endDate = convertedDates[1] ? convertedDates[1] : null;

      const payload = {
        windowStart: startDate,
        windowEnd: endDate,
      };

      if (isPatrol) payload.isPatrol = true;
      if (isLockedPayrun) payload.isSync = true;
      const response = await lockPayrun(payload);

      if (response && response?.statusCode === 200) {
        toaster.success({
          text: t('commonText.successMessagePayRun'),
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
        refetchPayroll();
      }
    } catch (error) {
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    } finally {
      setLoading(false);
      onClose();
    }
  };

  const addSelectedHoursBody = (
    <Box className={classes.rejectModal}>
      <Box className={classes.rejectModalInner}>
        <BlueLockIPayramIcon />
        <Typography variant="h3" className={classes.rejectModalTitle}>
          {isLockedPayrun ? t('obx.payroll.resyncPayrun') : t('obx.payroll.lockPayrun')}
        </Typography>
        <Typography className={classes.subText} variant="subtitle2">
          {isLockedPayrun ? t('obx.payroll.resyncPayrunText') : t('obx.payroll.lockPayrunText')}
        </Typography>

        <Box className={classes.inlinefield}>
          <Box>
            <InputLabel>
              {t('obx.payroll.from')} <RequiredAsterik />
            </InputLabel>
            <ResponsiveDatePickers
              placeholder="12/24/2023"
              value={formData?.startDate || null}
              format="MM/DD/YYYY"
              inputFormat="MM/DD/YYYY"
              onChange={(value) => {
                const isValidDate = !isNaN(value['$d']);
                if (isValidDate)
                  setFormData((prevState) => ({
                    ...prevState,
                    startDate: value,
                  }));
                else
                  setFormData((prevState) => ({
                    ...prevState,
                    startDate: null,
                  }));
              }}
              error={!!errorMessages?.startDate}
              helperText={errorMessages && errorMessages?.startDate}
            />
          </Box>

          <Box>
            <InputLabel>
              {t('obx.payroll.to')} <RequiredAsterik />
            </InputLabel>
            <ResponsiveDatePickers
              placeholder="12/24/2023"
              value={formData?.endDate || null}
              format="MM/DD/YYYY"
              inputFormat="MM/DD/YYYY"
              onChange={(value) => {
                const isValidDate = !isNaN(value['$d']);
                if (isValidDate)
                  setFormData((prevState) => ({
                    ...prevState,
                    endDate: value,
                  }));
                else
                  setFormData((prevState) => ({
                    ...prevState,
                    endDate: null,
                  }));
              }}
              error={!!errorMessages?.endDate}
              helperText={errorMessages && errorMessages?.endDate}
            />
          </Box>
        </Box>
        {!isLockedPayrun && (
          <Typography variant="info" className={classes.subText}>
            <Typography className={classes.Boldtext}>{t('obx.payroll.disclaimer')}</Typography>{' '}
            {t('obx.payroll.disclaimerText')}
          </Typography>
        )}
      </Box>
      <Box className={classes.rejectModalActions}>
        <Button variant="secondaryGrey" onClick={onClose}>
          {t('obx.payroll.cancel')}
        </Button>
        <Button variant="primary" disabled={isLoading} onClick={handleSubmit}>
          {isLockedPayrun ? t('obx.payroll.resynsPayrunBtnText') : t('obx.payroll.lockPayrun')}
        </Button>
      </Box>
    </Box>
  );

  return <ModalComponent open={open} handleClose={onClose} body={addSelectedHoursBody} />;
};

TimeOffModal.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  refetchPayroll: PropTypes.func,
  isPatrol: PropTypes.bool,
  isLockedPayrun: PropTypes.bool,
};

TimeOffModal.defaultProps = {
  open: false,
  onClose: () => {},
  refetchPayroll: () => {},
  isPatrol: false,
  isLockedPayrun: false,
};

export default TimeOffModal;
