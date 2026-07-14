import { Box, Button, Typography } from '@mui/material';
import { EditorState } from 'draft-js';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ModalComponent from 'src/app/components/common/modal';
import RichTextEditor, {
  convertDataToHtml,
  convertToDraft,
  getPlainTextOfDraft,
} from 'src/app/components/common/richText/index.jsx';
import useFormHook from 'src/hooks/useFormHook.jsx';
import { updateDispatch } from 'src/services/dispatch.services.js';
import { toastSettings } from 'src/utils/constants/index.js';
import joiValidate from 'src/utils/formValidator/formValidator.requiredCheck.js';
import { toaster } from 'src/utils/toast/index.jsx';

import { useStyles } from './style.js';

const defaultAdditionalDetails = {
  additionalDetails: EditorState.createEmpty(),
};

const AdditionalServiceModalBody = ({ handleCloseModal, dispatch, refetchDispatch = () => {} }) => {
  const { t } = useTranslation();
  const classes = useStyles();

  const [loading, setLoading] = useState(false);

  const { handleInputChange, formData, setFormData, errorMessages, setErrorMessages } = useFormHook(
    {
      defaultFormData: defaultAdditionalDetails,
    },
  );

  const handleCloseDetails = async () => {
    setLoading(false);
    handleCloseModal();
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const additionalDetailsHtml = convertDataToHtml(formData?.additionalDetails);
      const payload = {
        additionalDetails: additionalDetailsHtml || null,
      };

      const errors = await joiValidate(payload, t);
      if (Object.keys(errors).length) {
        setErrorMessages(errors);
        return;
      }

      if (!dispatch.id) return;
      const response = await updateDispatch(dispatch.id, { dispatchRequest: payload });
      if (response && response?.statusCode === 200) {
        toaster.success({
          text: response?.message,
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
        refetchDispatch();
      }
    } catch (err) {
      toaster.error({
        text: err?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    } finally {
      handleCloseDetails();
    }
  };

  useEffect(() => {
    if (dispatch?.additionalDetails) {
      setFormData((prev) => ({
        ...prev,
        additionalDetails: convertToDraft(dispatch?.additionalDetails),
      }));
    }
  }, []);

  return (
    <Box className={classes.modalWrapper}>
      <Typography variant="h3" className={classes.headText}>
        {t('obx.dispatch.additionalService')}
      </Typography>

      <RichTextEditor
        handleChange={handleInputChange}
        name={'additionalDetails'}
        placeholder={t('obx.dispatch.placeHolderAdditionalService')}
        value={formData?.additionalDetails || EditorState.createEmpty()}
        className={classes.richText}
        textLimit={2000}
        showTotalCountInsteadOfRemaining
        error={!!errorMessages?.additionalDetails}
      />
      {!!errorMessages?.additionalDetails && (
        <Typography className={classes.errorMessage}>{errorMessages.additionalDetails}</Typography>
      )}
      <Box className={classes.inlineButtons}>
        <Button onClick={handleCloseModal} variant="secondaryGrey">
          {t('obx.dispatch.cancel')}
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={loading || getPlainTextOfDraft(formData?.additionalDetails)?.length < 1}
          variant="primary"
        >
          {t('obx.dispatch.save')}
        </Button>
      </Box>
    </Box>
  );
};

AdditionalServiceModalBody.propTypes = {
  handleCloseModal: PropTypes.func.isRequired,
  dispatch: PropTypes.object.isRequired,
  refetchDispatch: PropTypes.func,
};

const AdditionalServiceModal = ({
  openModal,
  handleCloseModal,
  dispatch,
  refetchDispatch = () => {},
}) => {
  return (
    <ModalComponent
      open={openModal}
      handleClose={handleCloseModal}
      body={
        <AdditionalServiceModalBody
          handleCloseModal={handleCloseModal}
          dispatch={dispatch}
          refetchDispatch={refetchDispatch}
        />
      }
    />
  );
};

AdditionalServiceModal.propTypes = {
  openModal: PropTypes.bool.isRequired,
  handleCloseModal: PropTypes.func.isRequired,
  dispatch: PropTypes.object.isRequired,
  refetchDispatch: PropTypes.func,
};

export default AdditionalServiceModal;
