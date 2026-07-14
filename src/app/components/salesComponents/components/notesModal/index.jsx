import { Box, Button, Modal, Stack, TextField, Typography } from '@mui/material';
import Divider from '@mui/material/Divider';
import RichTextEditor, { convertDataToHtml, convertToDraft } from 'commonComponents/richText';
import { EditorState } from 'draft-js';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import LoaderComponent from 'src/app/components/common/loader';
import RequiredAsterik from 'src/app/components/common/requiredAsterik';
import { isObjectEmpty, removeKey } from 'src/helper/utilityFunctions';
import formValidatiorJoi from 'utils/formValidator/formValidator.requiredCheck';

import { useStyles } from './notesModal';

const defaultNotesForm = {
  title: '',
  description: EditorState.createEmpty(),
};

const NotesModal = ({
  id,
  month,
  title: initialTitle,
  description: initialDescription,
  open,
  handleClose,
  onSaveCreate,
  onSaveEdit,
  className = null,
  createMode = true,
}) => {
  const { t } = useTranslation();
  const classes = useStyles();

  // State for form data and errors
  const [formData, setFormData] = useState(defaultNotesForm);
  const [errorMessages, setErrorMessages] = useState({});
  const [isLoading, _setIsLoading] = useState(false);

  const updateFormHandler = useCallback(
    (name, value) => {
      setFormData((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    },
    [setFormData],
  );

  const handleInputChange = useCallback(
    (event) => {
      const { name, value } = event.target;
      if (value) {
        setErrorMessages((prev) => removeKey([name], prev));
      }
      updateFormHandler(name, value);
    },
    [updateFormHandler],
  );

  const handleEditorChange = (event) => {
    const {
      target: { value },
    } = event;
    if (value) {
      setErrorMessages((prev) => removeKey('description', prev));
    }
    updateFormHandler('description', value);
  };

  // Handle save button click
  const handleSave = async () => {
    // Validate using Joi
    let validationPayload = {
      ...formData,
      description: convertDataToHtml(formData?.description),
    };
    const error = await formValidatiorJoi(validationPayload, t);
    if (error && Object.keys(error).length) {
      // Handle validation errors
      setErrorMessages(error);
    } else {
      // Validation successful, proceed with saving
      if (createMode) {
        onSaveCreate(validationPayload);
      } else {
        onSaveEdit(id, validationPayload, month);
      }
      setFormData(defaultNotesForm);
      handleClose();
    }
  };

  useEffect(() => {
    if (open) {
      setFormData({
        title: initialTitle || '',
        description: initialDescription?.length
          ? convertToDraft(initialDescription)
          : EditorState.createEmpty(),
      });
    }
  }, [open, createMode]);

  return (
    <>
      {isLoading && <LoaderComponent size={50} color={'primary'} label={'Loading'} />}
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
        className={`${classes.notesModalContainer} ${className}`}
      >
        <Box className={classes.popStyle}>
          <Typography variant="h4" id="modal-modal-title">
            {id ? t('sales.companies.editNotes') : t('sales.companies.addNotes')}
          </Typography>
          <Typography
            variant="body2"
            className={classes.marginBottomText}
            id="modal-modal-description"
          >
            {t('sales.companies.richModalText')}
          </Typography>
          <Typography variant="body2" className={classes.marginBottom} id="modal-modal-description">
            {t('sales.companies.subject')} <RequiredAsterik />
          </Typography>

          <TextField
            id="title"
            value={formData?.title || ''}
            error={!!errorMessages.title}
            onChange={handleInputChange}
            name="title"
            variant="outlined"
            helperText={!!errorMessages.title ? errorMessages.title : null}
            fullWidth
          />
          {/*{!!errorMessages?.title && (*/}
          {/*  <Typography className={classes.errorMessage}>{errorMessages.title}</Typography>*/}
          {/*)}*/}

          <Box className={classes.saleCK}>
            <Typography
              variant="body2"
              className={classes.marginBottom}
              id="modal-modal-description"
              sx={{ mt: 1, mb: 2 }}
            >
              {t('form.input.textField.description.label')}
              <RequiredAsterik />
            </Typography>
            <RichTextEditor
              handleChange={handleEditorChange}
              name={'description'}
              placeholder={t('sales.companies.rictTextPlaceholder')}
              value={formData?.description || EditorState.createEmpty()}
              error={!!errorMessages?.description}
            />
            {!!errorMessages?.description && (
              <Typography className={classes.errorMessage}>{errorMessages.description}</Typography>
            )}
          </Box>
          <Divider className={classes.dividerGap} />
          <Box className={classes.sideFooter}>
            <Stack direction="row" justifyContent="end" spacing={2}>
              <Button onClick={handleClose} variant="secondaryGrey">
                {t('links.cancel')}
              </Button>
              <Button
                variant="primary"
                onClick={handleSave}
                disabled={!isObjectEmpty(errorMessages)}
              >
                {t('links.save')}
              </Button>
            </Stack>
          </Box>
        </Box>
      </Modal>
    </>
  );
};

NotesModal.propTypes = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  month: PropTypes.string,
  title: PropTypes.string,
  description: PropTypes.string,
  open: PropTypes.bool,
  handleClose: PropTypes.func,
  onSaveCreate: PropTypes.func,
  onSaveEdit: PropTypes.func,
  className: PropTypes.string,
  createMode: PropTypes.bool,
};

NotesModal.defaultProps = {
  title: '',
  description: EditorState.createEmpty(),
};

export default NotesModal;
