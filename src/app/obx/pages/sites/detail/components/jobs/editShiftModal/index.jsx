import { Box, InputLabel } from '@mui/material';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ModalComponent from 'src/app/components/common/modal';
import RequiredAsterik from 'src/app/components/common/requiredAsterik';
import ResponsiveTimePickers from 'src/app/components/common/timePicker';
import { ReactComponent as BlueEditPencilIcon } from 'src/assets/svg/edit-bg.svg?react';
import { updateShiftTime } from 'src/services/duty.services';
import { toastSettings } from 'src/utils/constants';
import joiValidate from 'src/utils/formValidator/formValidator.requiredCheck';
import { toaster } from 'src/utils/toast';

import { useStyles } from './EditShiftModal';

const EditShiftModal = ({ open, onClose, refetchJobs, selectedJob }) => {
  const classes = useStyles();
  const [formData, setFormData] = useState(null);
  const [errorMessages, setErrorMessages] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (selectedJob) setFormData(selectedJob);
  }, []);

  const { t } = useTranslation();

  const handleSubmit = async () => {
    const validatePayload = {
      startsAt: formData?.startsAt ? dayjs(formData?.startsAt).toISOString() : '',
      endsAt: formData?.endsAt ? dayjs(formData?.endsAt).toISOString() : '',
    };
    const error = await joiValidate(validatePayload, t);
    if (error && Object.keys(error).length) {
      setErrorMessages(error);
      return;
    }
    try {
      setIsLoading(true);
      const payload = {
        startsAt: dayjs(formData?.startsAt).toISOString(),
        endsAt: dayjs(formData?.endsAt).toISOString(),
      };

      const response = await updateShiftTime({ shiftId: selectedJob?.id, payload });

      if (response && response?.statusCode === 200) {
        toaster.success({
          text: response?.message,
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
        refetchJobs();
      }
    } catch (error) {
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    } finally {
      onClose();
      setIsLoading(false);
    }
  };

  const addSelectedHoursBody = (
    <Box className={classes.rejectModal}>
      <Box className={classes.rejectModalInner}>
        <BlueEditPencilIcon />
        <Typography variant="h3" className={classes.rejectModalTitle}>
          {t('obx.sites.jobs.editJob.title')}
        </Typography>
        <Typography className={classes.subText} variant="subtitle2">
          {t('obx.sites.jobs.editJob.description')}
        </Typography>

        <Box className={classes.inlinefield}>
          <Box>
            <InputLabel>
              {t('obx.sites.jobs.editJob.startTime')} <RequiredAsterik />
            </InputLabel>
            <ResponsiveTimePickers
              name="startsAt"
              id="startsAt"
              timeStepsMinutes={1}
              value={formData?.startsAt || null}
              onChange={(value) => {
                const isValidDate = !isNaN(value['$d']);
                if (isValidDate)
                  setFormData((prevState) => ({
                    ...prevState,
                    startsAt: value,
                  }));
                else
                  setFormData((prevState) => ({
                    ...prevState,
                    startsAt: null,
                  }));
              }}
              error={!!errorMessages?.startsAt}
              helperText={errorMessages && errorMessages?.startsAt}
            />
          </Box>

          <Box>
            <InputLabel>
              {t('obx.sites.jobs.editJob.endTime')} <RequiredAsterik />
            </InputLabel>
            <ResponsiveTimePickers
              name="endsAt"
              id="endsAt"
              timeStepsMinutes={1}
              value={formData?.endsAt || null}
              onChange={(value) => {
                const isValidDate = !isNaN(value['$d']);
                if (isValidDate)
                  setFormData((prevState) => ({
                    ...prevState,
                    endsAt: value,
                  }));
                else
                  setFormData((prevState) => ({
                    ...prevState,
                    endsAt: null,
                  }));
              }}
              error={!!errorMessages?.endsAt}
              helperText={errorMessages && errorMessages?.endsAt}
            />
          </Box>
        </Box>
      </Box>
      <Box className={classes.rejectModalActions}>
        <Button variant="secondaryGrey" onClick={onClose}>
          {t('obx.sites.jobs.editJob.cancel')}
        </Button>
        <Button variant="primary" disabled={isLoading} onClick={handleSubmit}>
          {t('obx.sites.jobs.editJob.updateJobTime')}
        </Button>
      </Box>
    </Box>
  );

  return <ModalComponent open={open} handleClose={onClose} body={addSelectedHoursBody} />;
};

EditShiftModal.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  refetchJobs: PropTypes.func,
  selectedJob: PropTypes.object,
};

EditShiftModal.defaultProps = {
  open: false,
  onClose: () => {},
  refetchJobs: () => {},
  selectedJob: null,
};

export default EditShiftModal;
