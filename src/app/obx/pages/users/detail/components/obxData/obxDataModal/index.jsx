import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormLabel,
  IconButton,
  Radio,
  RadioGroup,
  Typography,
} from '@mui/material';
import { ReactComponent as CloseIcon } from 'assets/svg/CrossIcon.svg?react';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ACL_OBX_USERS_OBX_FORM_UPDATE } from 'src/app/router/constant/OBXMODULE';
import { isObjectEmpty, removeKey } from 'src/helper/utilityFunctions';
import useFormHook from 'src/hooks/useFormHook';
import { submitObxDataFormOfUser } from 'src/services/user.services';
import userHasPermission from 'src/utils/auth/userHasPermission';
import { OBX_DATA_TITLE_ENUM, toastSettings } from 'src/utils/constants';
import { toaster } from 'src/utils/toast';

import { useStyles } from './obxDataModal.styles';

const ObxDataModal = ({ open, onClose, data, refetchData, isProfile }) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const [formData, setFormData] = useState([]);
  const [answers, setAnswers] = useState({});
  const [isLoading, setLoading] = useState(false);
  const { errorMessages, setErrorMessages } = useFormHook({
    defaultFormData: {},
  });

  // Memoized computed values
  const modalTitle = useMemo(
    () => OBX_DATA_TITLE_ENUM(t)?.[data?.formType] || '',
    [data?.formType],
  );

  const questionsAttributes = useMemo(
    () => data?.template?.sectionsAttributes?.[0]?.questionsAttributes || [],
    [data?.template?.sectionsAttributes],
  );

  // Memoized callback functions
  const handleRadioChange = useCallback(
    (questionId, value) => {
      setErrorMessages((prev) => removeKey([questionId], prev));
      setAnswers((prev) => ({
        ...prev,
        [questionId]: JSON.parse(value),
      }));
    },
    [setErrorMessages],
  );

  // Validation
  const validateForm = useCallback(() => {
    const errors = {};
    formData.forEach((question) => {
      if (answers[question?.id] === null) {
        errors[question?.id] = t('obx.users.obxData.modal.selectOptionValidation');
      }
    });

    if (Object.keys(errors).length) {
      setErrorMessages((prev) => ({ ...prev, ...errors }));
      return errors;
    }
  }, [formData, answers]);

  // Handle cancel
  const handleCancel = useCallback(() => {
    setErrorMessages({});
    setAnswers({});
    onClose();
  }, [onClose]);

  // Handle submit
  const handleSubmit = useCallback(async () => {
    setLoading(true);
    const errors = validateForm();
    if (!isObjectEmpty(errors)) {
      setLoading(false);
      return;
    }

    try {
      const response = await submitObxDataFormOfUser(data.id, { response: answers });
      if (response.statusCode === 200) {
        refetchData();
        onClose();
      }
    } catch (error) {
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    } finally {
      setLoading(false);
    }
  }, [formData, answers, setErrorMessages, onClose, setAnswers, refetchData]);

  // Optimized useEffect with memoized dependency
  useEffect(() => {
    if (questionsAttributes?.length) {
      setFormData(questionsAttributes);
      setAnswers(
        questionsAttributes.reduce((acc, question) => {
          acc[question?.id] = null;
          return acc;
        }, {}),
      );
    }
  }, [questionsAttributes]);

  // Disable the button when:
  // 1. The form or action is currently loading, OR
  // 2. The user is not on their own profile AND doesn't have permission to update the form
  const isDisabled = isLoading || (!isProfile && !userHasPermission(ACL_OBX_USERS_OBX_FORM_UPDATE));

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth className={classes.dialog}>
      <DialogTitle className={classes.dialogTitle}>
        <Box className={classes.titleContainer}>
          <Typography variant="h2" className={classes.title}>
            {modalTitle}
          </Typography>
          <IconButton onClick={onClose} className={classes.closeButton} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <Box className={classes.dialogContent}>
        <Box className={classes.formContainer}>
          {formData?.map((question) => (
            <Box key={question.id} className={classes.questionContainer}>
              <Box className={classes.questionHeader}>
                <Typography variant="body1" className={classes.questionText}>
                  {question?.questionStatement}
                </Typography>
              </Box>

              <FormControl component="fieldset" className={classes.radioGroup}>
                <FormLabel className={classes.radioLabel}>
                  {t('obx.users.obxData.modal.selectOption')}
                </FormLabel>
                <RadioGroup
                  value={
                    answers[question.id] !== null && answers[question.id] !== undefined
                      ? String(answers[question.id])
                      : ''
                  }
                  onChange={(e) => handleRadioChange(question.id, e.target.value)}
                  className={classes.radioOptions}
                >
                  <FormControlLabel
                    value={true}
                    control={<Radio className={classes.radio} />}
                    label="Yes"
                    className={classes.radioOption}
                  />
                  <FormControlLabel
                    value={false}
                    control={<Radio className={classes.radio} />}
                    label="No"
                    className={classes.radioOption}
                  />
                </RadioGroup>
              </FormControl>
              {errorMessages[question.id] && (
                <Typography className={classes.invalidFeedback}>
                  {errorMessages[question.id]}
                </Typography>
              )}
            </Box>
          ))}
        </Box>
      </Box>
      <Box className={classes.dialogActions}>
        <Button onClick={handleCancel} variant="secondaryGrey" disabled={isLoading}>
          {t('obx.users.obxData.modal.cancel')}
        </Button>
        <Button onClick={handleSubmit} variant="primary" disabled={isDisabled}>
          {t('obx.users.obxData.modal.submitForm')}
        </Button>
      </Box>
    </Dialog>
  );
};

ObxDataModal.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  data: PropTypes.object,
  refetchData: PropTypes.func,
  isProfile: PropTypes.bool,
};

ObxDataModal.defaultProps = {
  data: null,
  refetchData: () => {},
  onClose: () => {},
  open: false,
  isProfile: false,
};

export default ObxDataModal;
