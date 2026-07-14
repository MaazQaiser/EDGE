import { Box, Button, TextField, Typography } from '@mui/material';
import { ReactComponent as RejectLeaveIcon } from 'assets/svg/modal-cancel.svg?react';
import ModalComponent from 'commonComponents/modal';
import PropTypes from 'prop-types';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useStyles } from 'src/app/obx/pages/attendance/listing/listingStyles';
import { useTenantLabel } from 'src/helper/utilityHooks';
import useFormHook from 'src/hooks/useFormHook';
import formValidatorJoi from 'src/utils/formValidator/formValidator.requiredCheck';

const RejectReportModal = ({ open, handleClose, onSubmit, isLoading }) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const { getLabel } = useTenantLabel();

  const { handleInputChange, formData, errorMessages, setErrorMessages } = useFormHook({
    defaultFormData: {
      reason: '',
    },
  });

  const onClickReject = async () => {
    const errors = await formValidatorJoi(formData, t);

    if (errors && Object.keys(errors).length) {
      setErrorMessages((prev) => ({ ...prev, ...errors }));

      return;
    }

    onSubmit(formData?.reason);
  };

  const rejectLeaveModalBody = (
    <Box className={classes.rejectLeaveModalBody}>
      <RejectLeaveIcon />

      <Typography variant="h3" className={classes.rejectLeaveModalBodyTitle}>
        {t('obx.schedules.dutyDetail.acceptRejectReport.rejectReport')}
      </Typography>
      <Typography variant="body2" className={classes.rejectLeaveModalBodyText}>
        {t('obx.schedules.dutyDetail.acceptRejectReport.rejectReportDesc', {
          officer: getLabel('terms', 'officer', t)?.toLowerCase(),
        })}
      </Typography>

      <Box className={classes.rejectLeaveModalBodyField}>
        <TextField
          placeholder={t('obx.schedules.dutyDetail.acceptRejectReport.addComment')}
          minRows={5}
          maxRows={5}
          multiline
          onChange={handleInputChange}
          name="reason"
          value={formData?.reason}
          helperText={errorMessages?.reason || ''}
          error={!!errorMessages?.reason}
        />
      </Box>
      <Box className={classes.rejectLeaveModalBodyActions}>
        <Button disabled={isLoading} variant="secondaryGrey" onClick={handleClose}>
          {t('buttons.cancel')}
        </Button>
        <Button disabled={isLoading} onClick={onClickReject} variant="destructive">
          {t('obx.schedules.dutyDetail.acceptRejectReport.rejectReport')}
        </Button>
      </Box>
    </Box>
  );

  return <ModalComponent open={open} handleClose={handleClose} body={rejectLeaveModalBody} />;
};

export default RejectReportModal;

RejectReportModal.propTypes = {
  open: PropTypes.bool,
  handleClose: PropTypes.func,
  handleRejectReason: PropTypes.func,
  value: PropTypes.string,
  isLoading: PropTypes.bool,
  onSubmit: PropTypes.func,
};
