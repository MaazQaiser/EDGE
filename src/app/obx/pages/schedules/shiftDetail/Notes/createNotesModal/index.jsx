import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { editNotesOfShift } from 'src/services/duty.services';
import { toastSettings } from 'src/utils/constants';
import { toaster } from 'src/utils/toast';

import NoteModal, { notesCharacterLimit } from './NoteModal';

const CreateNotesModal = ({
  open,
  handleClose,
  onSaveEdit,
  runsheetId,
  shiftActivityLogId,
  editableNote,
  className = null,
  createNoteHandler,
}) => {
  const { t } = useTranslation();
  const [description, setDescription] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (event) => {
    const data = event?.target?.value;
    setDescription(data);

    if (data) {
      setErrorMessage('');
    }
  };

  const handleCancel = () => {
    setDescription(null);
    handleClose();
    setErrorMessage('');
  };

  const handleSave = async () => {
    if (!description) {
      return setErrorMessage(t('obx.schedules.dutyDetail.notes.addNotesErrorMsg'));
    }
    if (description?.length > notesCharacterLimit) {
      return setErrorMessage(
        t('obx.schedules.dutyDetail.notes.addNotesTextLimitErrorMsg', {
          limit: notesCharacterLimit,
        }),
      );
    }

    const payload = {
      note: description,
    };

    try {
      let response;
      if (editableNote?.id) {
        response = await editNotesOfShift({
          payload,
          shiftActivityLogId: shiftActivityLogId || runsheetId,
          noteId: editableNote?.id,
        });
      } else {
        response = await createNoteHandler(payload);
      }

      toaster.success({
        text: response?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });

      onSaveEdit(response?.createdLogId);
      handleClose();
      setDescription(null);
    } catch (error) {
      toaster.success({
        text: response?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };

  useEffect(() => {
    if (editableNote && open) {
      setDescription(editableNote?.text);
    }
  }, [open, editableNote]);

  return (
    <>
      <NoteModal
        {...{
          open,
          handleCloseModal: handleClose,
          className,
          title: editableNote ? t('sales.companies.editNotes') : t('sales.companies.addNotes'),
          noteValue: description,
          errorMessage,
          handleChangeNoteValue: handleChange,
          handleCancelBtn: handleCancel,
          handleSaveBtn: handleSave,
        }}
      />
    </>
  );
};

CreateNotesModal.propTypes = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  open: PropTypes.bool,
  handleClose: PropTypes.func,
  onSaveEdit: PropTypes.func,
  className: PropTypes.string,
  editableNote: PropTypes.object,
  shiftActivityLogId: PropTypes.string,
  runsheetId: PropTypes.string,
  createNoteHandler: PropTypes.func,
};

export default CreateNotesModal;
