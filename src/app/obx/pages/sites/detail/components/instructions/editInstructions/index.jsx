import { Box, Button, InputLabel, Typography } from '@mui/material';
import { ReactComponent as EditTermIcon } from 'assets/svg/edit-bg.svg?react';
import FileUpload from 'commonComponents/fileUpload';
import LoaderComponent from 'commonComponents/loader';
import ModalComponent from 'commonComponents/modal';
import RichTextEditor, { convertDataToHtml, convertToDraft } from 'commonComponents/richText';
import { EditorState } from 'draft-js';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { createSiteInstructions, updateSiteInstructions } from 'services/sites.services';
import useFormHook from 'src/hooks/useFormHook';
import { allowedFileExtensions, supportedFileFormats, toastSettings } from 'src/utils/constants';
import formValidatorJoi from 'src/utils/formValidator/formValidator.requiredCheck';
import { toaster } from 'src/utils/toast';

import { useStyles } from './editInstructionStyles';

const editInstructionsFormData = {
  content: EditorState.createEmpty(),
  instructFiles: [],
};

const formConst = {
  CONTENT: 'content',
};
const EditInstructions = ({
  open,
  handleClose,
  id,
  siteId,
  refreshData,
  instructions,
  instructionType,
}) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const {
    handleInputChange,
    formData,
    setFormData,
    errorMessages,
    setErrorMessages,
    setDisabled,
    disabled,
    updateFormHandler,
  } = useFormHook({ defaultFormData: editInstructionsFormData });

  const [loading, setLoading] = useState(false);
  const [instructionFile, setInstructionFile] = useState([]);

  const renderError = (name) => {
    let message = null;

    if (errorMessages[name]) {
      message = errorMessages[name];
    }
    return (
      message && (
        <Typography variant="body2" className={classes.invalidFeedback}>
          {message}
        </Typography>
      )
    );
  };
  const setInstructionsData = async () => {
    try {
      // ? NOTE: if the variable "exceptions, startDate, endDate" is not getting used add _ before it or this rule will suffice the need here.
      // eslint-disable-next-line no-unused-vars
      const { exceptions, startDate, endDate, title, ...rest } = instructions;
      const instructionsFormData = {
        ...rest,
        content: convertToDraft(rest?.content),
        instructFiles: rest?.files,
      };
      setFormData(instructionsFormData);
    } catch (e) {
      toaster.error({
        text: e?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let finalPayload = JSON.parse(JSON.stringify(formData));
      finalPayload.content = convertDataToHtml(formData?.content);
      finalPayload.instructionType = instructionType;
      delete finalPayload['title'];

      const errors = await formValidatorJoi(finalPayload, t);
      if (errors && Object.keys(errors).length) {
        setErrorMessages((prev) => ({ ...prev, ...errors }));

        return;
      }

      // eslint-disable-next-line no-unused-vars
      const { files, instructFiles, ...rest } = finalPayload;

      finalPayload = rest;

      let finalData = new FormData();

      for (const [key, value] of Object.entries(finalPayload)) {
        let item = value;
        if (typeof item === 'object' && item !== null) {
          item = JSON.stringify(item);
        }
        if (!item) {
          item = '';
        }
        finalData.append(key, item);
      }

      finalData.append('files', JSON.stringify(formData?.instructFiles || []));

      for (let x = 0; instructionFile?.length > x; x++) {
        finalData.append('newFiles[]', instructionFile[x]);
      }

      setDisabled(true);
      setLoading(true);

      let res = null;

      if (id) {
        res = await updateSiteInstructions(id, finalData);
      } else {
        res = await createSiteInstructions(siteId, finalData);
      }

      setDisabled(false);

      if (res?.statusCode === 200) {
        handleClose();
        refreshData();
        toaster.success({
          text: res?.message,
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
      }

      setLoading(false);
    } catch (e) {
      setDisabled(false);
      setLoading(false);

      toaster.error({
        text: e?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };

  useEffect(() => {
    if (instructions?.id) setInstructionsData();
  }, [instructions]);

  const instructionButtonText = !id
    ? t('buttons.createInstruction')
    : t('buttons.updateInstructions');

  const modalBody = (
    <>
      {loading && <LoaderComponent size={50} color={'primary'} label={'Loading'} />}
      <Box
        component="form"
        onSubmit={handleSubmit}
        noValidate
        autoComplete="off"
        className={classes.mainBoxForm}
      >
        <Box className={classes.headerTitle}>
          <EditTermIcon />
          <Typography variant="h3" className={classes.zoneCustomText}>
            {t('obx.sites.siteInformation.instructionEditor')}
          </Typography>
          <Typography variant="body2" className={classes.zoneDetailText}>
            {t('obx.sites.siteInformation.instructionEditorDes')}
          </Typography>
        </Box>
        <Box className={classes.modalBody}>
          <Box className={classes.formBoxGrid}>
            <RichTextEditor
              className={classes.editor}
              value={formData?.content}
              handleChange={handleInputChange}
              name="content"
              placeholder={t('obx.form.input.textField.instructions.placeHolder')}
            />
            <>{renderError(formConst?.CONTENT)}</>
          </Box>

          {instructionType === 'general' && (
            <Box>
              <InputLabel>{t('obx.sites.siteInformation.attachments')}</InputLabel>
              {formData?.instructFiles && Array.isArray(formData?.instructFiles) && (
                <FileUpload
                  formData={formData}
                  formImageKey="instructFiles"
                  updateFormHandler={updateFormHandler}
                  errorMessages={errorMessages}
                  setErrorMessages={setErrorMessages}
                  selectedFiles={instructionFile}
                  setFile={setInstructionFile}
                  supportedTypes={supportedFileFormats}
                  supportedTypesText="Images, Vides, PDFs (max. 25mbs)"
                  allowedExtensions={allowedFileExtensions}
                />
              )}
            </Box>
          )}
        </Box>
        <Box className={classes.btnBox}>
          <Box className={classes.buttonGroup}>
            <Button
              onClick={() => {
                handleClose();
              }}
              variant="secondaryGrey"
              className={classes.cancelBtn}
            >
              {t('buttons.cancel')}
            </Button>
            <Button disabled={disabled} variant="primary" type="submit">
              {instructionButtonText}
            </Button>
          </Box>
        </Box>
      </Box>
    </>
  );
  return <ModalComponent open={open} handleClose={handleClose} body={modalBody}></ModalComponent>;
};

EditInstructions.propTypes = {
  open: PropTypes.bool,
  handleClose: PropTypes.func,
  id: PropTypes.number,
  siteId: PropTypes.number,
  refreshData: PropTypes.func,
  instructionType: PropTypes.string,
  instructions: PropTypes.object,
};
export default EditInstructions;
