import { Box, Button, FormControl, InputLabel, TextField, Typography } from '@mui/material';
import { ReactComponent as EditTermIcon } from 'assets/svg/edit-bg.svg?react';
import ResponsiveDatePickers from 'commonComponents/datePicker';
import DaysSelection from 'commonComponents/daysSelection';
import FileUpload from 'commonComponents/fileUpload';
import LoaderComponent from 'commonComponents/loader';
import ModalComponent from 'commonComponents/modal';
import RichTextEditor, { convertDataToHtml, convertToDraft } from 'commonComponents/richText';
import dayjs from 'dayjs';
import { EditorState } from 'draft-js';
import PropTypes from 'prop-types';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  createExceptionInstructions,
  getExceptionInstructionById,
  updateExceptionInstructions,
} from 'services/sites.services';
import { getUniqueOrderedDaysOfWeekBetweenDates } from 'src/helper/utilityFunctions';
import useFormHook from 'src/hooks/useFormHook';
import { allowedFileExtensions, supportedFileFormats, toastSettings } from 'src/utils/constants';
import formValidatorJoi from 'src/utils/formValidator/formValidator.requiredCheck';
import { toaster } from 'src/utils/toast';

import { useStyles } from './addExceptionStyles';

const editInstructionsFormData = {
  title: '',
  content: EditorState.createEmpty(),
  weekDays: [],
  startDate: dayjs(),
  endDate: dayjs(),
  instructFiles: [],
};

const formConst = {
  TITLE: 'title',
  CONTENT: 'content',
  START_DATE: 'startDate',
  END_DATE: 'endDate',
  DAYS: 'weekDays',
};
const daysData = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

const AddException = ({ open, handleClose, id, instructionsId, refreshData }) => {
  const { t } = useTranslation();

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

  const [_days] = useState(daysData);
  const classes = useStyles();

  const handleDateChange = (name, value) => {
    const formData = {
      target: {
        value: value,
        name: name,
      },
    };

    handleInputChange(formData);
    resetDaysSelection();
  };

  const resetDaysSelection = () => {
    const formData = {
      target: {
        value: [],
        name: formConst?.DAYS,
      },
    };
    handleInputChange(formData);
  };

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

  const getExceptionsData = async (id) => {
    try {
      setLoading(true);
      const response = await getExceptionInstructionById(id);
      if (response?.statusCode === 200) {
        const exceptionsFormData = {
          ...response?.data?.instruction,
          title: response?.data?.instruction?.title,
          content: convertToDraft(response?.data?.instruction?.content),
          instructFiles: response?.data?.instruction?.files,
        };

        setFormData(exceptionsFormData);
      }
      setLoading(false);
    } catch (e) {
      setLoading(false);
      toaster.error({
        text: e?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let finalPayload = JSON.parse(JSON.stringify(formData));

    finalPayload.content = convertDataToHtml(formData?.content);
    const errors = await formValidatorJoi(finalPayload, t);
    if (errors && Object.keys(errors).length) {
      setErrorMessages((prev) => ({ ...prev, ...errors }));

      return;
    }
    // eslint-disable-next-line no-unused-vars
    const { files, ...rest } = finalPayload;

    finalPayload = rest;
    //
    // const startDate = formData?.startDate
    //
    // const endDate = assignDateToTimeZoneWithStartAndEndsAt(formData?.endDate, true).toISOString();
    //
    // finalPayload.startDate = startDate;
    // finalPayload.endDate = endDate;

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

    finalData.append('files', JSON.stringify(formData?.instructFiles));

    for (let x = 0; instructionFile?.length > x; x++) {
      finalData.append('newFiles[]', instructionFile[x]);
    }

    setDisabled(true);
    setLoading(true);
    try {
      let res = null;

      if (id) {
        res = await updateExceptionInstructions(id, finalData);
      } else {
        res = await createExceptionInstructions(instructionsId, finalData);
      }

      setDisabled(false);
      setLoading(false);
      if (res?.statusCode === 200) {
        handleClose();
        refreshData();
        toaster.success({
          text: res?.message,
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
      }
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

  const daysBetweenDates = useMemo(() => {
    return getUniqueOrderedDaysOfWeekBetweenDates(formData?.startDate, formData?.endDate);
  }, [formData?.startDate, formData?.endDate]);

  useEffect(() => {
    if (id) {
      getExceptionsData(id);
    }
  }, [id]);

  const exceptionInstructionButtonText = !id
    ? t('buttons.addExceptionInstructions')
    : t('buttons.updateExceptionInstructions');

  useEffect(() => {
    const startDate = dayjs(formData?.startDate);
    const endDate = dayjs(formData?.endDate);

    startDate.isAfter(endDate);

    if (startDate.isAfter(endDate)) {
      handleDateChange(formConst?.END_DATE, '');
    }
  }, [formData?.startDate]);

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
            {t('obx.sites.siteInformation.exceptionEditor')}
          </Typography>
          <Typography variant="body2" className={classes.zoneDetailText}>
            {t('obx.sites.siteInformation.exceptionEditorDes')}
          </Typography>
        </Box>
        <Box className={classes.modalBody}>
          <Box className={classes.modalField}>
            <InputLabel>Title</InputLabel>
            <TextField
              value={formData?.title}
              onChange={handleInputChange}
              name="title"
              fullWidth
              id={id}
              placeholder={t('obx.form.input.textField.title.placeHolder')}
            />
            <>{renderError(formConst?.TITLE)}</>
          </Box>
          <Box className={classes.editorWrapper}>
            <RichTextEditor
              className={classes.editor}
              value={formData?.content}
              handleChange={handleInputChange}
              name="content"
              placeholder={t('obx.form.input.textField.exceptions.placeHolder')}
            />
            <>{renderError(formConst?.CONTENT)}</>
          </Box>

          <Box className={classes.formBoxGrid}>
            <Box className={classes.inputWrapper}>
              <InputLabel>{t('obx.form.input.textField.startDate.label')}</InputLabel>
              <ResponsiveDatePickers
                value={dayjs(formData?.startDate)}
                onChange={(value) => {
                  handleDateChange(formConst?.START_DATE, value);
                }}
                format="MM/DD/YYYY"
                placeholder={`${t('obx.form.input.textField.startDate.placeHolder')}`}
                minDate={dayjs()}
                helperText={renderError(formConst?.START_DATE)}
                error={!!renderError(formConst?.START_DATE)}
                timezone={'UTC'}
              />
            </Box>
            <Box className={classes.inputWrapper}>
              <InputLabel>{t('obx.form.input.textField.endDate.label')}</InputLabel>
              <ResponsiveDatePickers
                format="MM/DD/YYYY"
                value={dayjs(formData?.endDate)}
                onChange={(value) => {
                  handleDateChange(formConst?.END_DATE, value);
                }}
                placeholder={`${t('obx.form.input.textField.endDate.placeHolder')}`}
                minDate={dayjs(formData?.startDate)}
                disabled={!formData?.startDate}
                helperText={renderError(formConst?.END_DATE)}
                error={!!renderError(formConst?.END_DATE)}
                timezone={'UTC'}
              />
            </Box>
          </Box>
          {daysBetweenDates?.length > 1 && (
            <Typography className={classes.specifyDate} variant="h6">
              {t('obx.sites.siteInformation.specifyDate')}
            </Typography>
          )}
          <Box className={classes.formBoxGrid}>
            <FormControl className={classes.daysOuterDiv}>
              <DaysSelection
                name="weekDays"
                selectedDays={formData?.weekDays}
                data={daysBetweenDates}
                handleChange={handleInputChange}
                styledClass={classes.dayOuterLayer}
              />
            </FormControl>
          </Box>
          <Box marginBottom={'20px'}>
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
          <Box className={classes.btnBox}>
            <Box className={classes.buttonGroup}>
              <Button
                onClick={() => {
                  handleClose();
                }}
                variant="secondaryGrey"
              >
                {t('buttons.cancel')}
              </Button>
              <Button disabled={disabled} type="submit" variant="primary">
                {exceptionInstructionButtonText}
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  );

  return <ModalComponent open={open} handleClose={handleClose} body={modalBody}></ModalComponent>;
};

AddException.propTypes = {
  open: PropTypes.bool,
  handleClose: PropTypes.func,
  id: PropTypes.number,
  instructionsId: PropTypes.number,
  refreshData: PropTypes.func,
};

export default AddException;
