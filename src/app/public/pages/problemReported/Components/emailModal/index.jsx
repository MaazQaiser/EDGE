import { Box, Button, Divider, InputLabel, Modal, TextField, Typography } from '@mui/material';
import { EditorState } from 'draft-js';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { sendEmail } from 'services/faqs.services';
import RichTextEditor, { convertDataToHtml } from 'src/app/components/common/richText';
import { useApiControllers } from 'src/helper/axios';
import useFormHook from 'src/hooks/useFormHook';
import { toastSettings } from 'src/utils/constants';
import formValidatorJoi from 'src/utils/formValidator/formValidator.requiredCheck';
import { toaster } from 'src/utils/toast';

import { useStyles } from './EmailModal';

const emailFormData = {
  description: EditorState.createEmpty(),
  email: '',
  subject: '',
};

const EmailModal = ({ data, open, handleClose, refreshData }) => {
  const { t } = useTranslation();
  const classes = useStyles();

  const { getNewApiController } = useApiControllers();

  const [disabled, setDisabled] = useState(false);

  const {
    handleInputChange,
    formData,
    // setFormData,
    errorMessages,
    setErrorMessages,
  } = useFormHook({
    defaultFormData: {
      ...emailFormData,
      email: data?.email ? data?.email : '',
      subject: data?.emailSubject ? data?.emailSubject : '',
    },
  });

  const validateForm = async () => {
    let overallPayload = {
      ...formData,
      description: convertDataToHtml(formData?.description),
    };

    const errors = await formValidatorJoi(overallPayload, t);

    if (errors && Object.keys(errors).length) {
      setErrorMessages((prev) => ({ ...prev, ...errors }));
      return;
    }

    const finalPayload = {
      ...formData,
      body: convertDataToHtml(formData?.description),
    };

    submitForm(finalPayload);
  };

  const submitForm = async (payload) => {
    const apiController = getNewApiController();
    try {
      setDisabled(true);
      const response = await sendEmail(data.id, payload, {
        signal: apiController.signal,
      });

      if (response?.statusCode === 200) {
        toaster.success({
          text: response?.message,
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
        refreshData();
        handleClose(false);
      }
    } catch (error) {
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    } finally {
      setDisabled(false);
      if (!apiController.signal.aborted) {
        // TODO: handle abort controller
      }
    }
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box className={classes.emailModal}>
        <Typography variant="h4" className={classes.primarytext}>
          {t('reportProblem.SendEmail')}
        </Typography>
        <Typography className={classes.subtext} variant="body2">
          {t('reportProblem.mailtext')}
        </Typography>
        <Box>
          <Box className={classes.marginBottomColum}>
            <InputLabel htmlFor={t('reportProblem.to')}>{t('reportProblem.to')}</InputLabel>
            <TextField
              name={'email'}
              id={t('reportProblem.to')}
              fullWidth
              placeholder={t('reportProblem.emailPlaceholder')}
              type="email"
              className={classes.inputField}
              value={formData?.email}
              onChange={handleInputChange}
              disabled={!!data?.email}
            />
          </Box>
          <Divider className={classes.dividerGap} />
          <Box className={classes.marginBottomColum}>
            <InputLabel htmlFor={t('reportProblem.subject')}>
              {t('reportProblem.subject')}
            </InputLabel>
            <TextField
              name={'subject'}
              id={t('reportProblem.subject')}
              fullWidth
              placeholder={t('reportProblem.subjectPlaceholder')}
              type="text"
              className={classes.inputField}
              value={formData?.subject}
              onChange={handleInputChange}
              disabled={!!data?.emailSubject}
            />
          </Box>
          <RichTextEditor
            placeholder={t('reportProblem.textarea')}
            className={classes.descriptionTextArea}
            name={'description'}
            value={formData?.description}
            handleChange={handleInputChange}
          />
          {!!errorMessages?.description && (
            <Box className={classes.invalidFeedback}>{errorMessages?.description}</Box>
          )}
        </Box>
        <Box className={classes.emailButtons}>
          <Button variant="secondaryGrey" onClick={handleClose}>
            {t('links.cancel')}
          </Button>
          <Button variant="primary" onClick={validateForm} disabled={disabled}>
            {t('reportProblem.SendEmail')}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};
EmailModal.propTypes = {
  data: PropTypes.object.isRequired,
  open: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  refreshData: PropTypes.func.isRequired,
};
export default EmailModal;
