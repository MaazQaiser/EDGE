import { Box, Button, Typography } from '@mui/material';
import { ReactComponent as DeleteIcon } from 'assets/svg/delete-modal.svg?react';
import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import SweetAlertModal from 'src/app/components/common/sweetAlertModal';
import { ColorCalendar, Delete, Edit } from 'src/assets/svg';
import { ReactComponent as PlusIcon } from 'src/assets/svg/WhitePlusIcon.svg?react';
import useDateTime from 'src/hooks/useDateTime';
import { deleteNote } from 'src/services/notes.service';
import { dayjsFormatsEnum, toastSettings } from 'src/utils/constants';
import { toaster } from 'src/utils/toast';

import CreateNotesModal from './createNotesModal';
import { useStyles } from './notes.styles';

const NotesList = ({ notesList, objectId, onSaveEditNote, onDelete }) => {
  const classes = useStyles();
  const { t } = useTranslation();

  const [open, setOpen] = useState(false);
  const handleChange = () => setOpen(!open);
  const [deletableNoteId, setDeleteableNoteId] = useState(null);
  const { formatDayjsDateTime } = useDateTime();

  const [editableNote, setEditableNote] = useState(null);

  const onConfirmDeleteNote = async () => {
    try {
      const response = await deleteNote(deletableNoteId);
      toaster.success({
        text: response?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
      setDeleteableNoteId(null);
      onDelete(deletableNoteId);
    } catch (error) {
      setDeleteableNoteId(null);
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };

  const handleClickEdit = (note) => {
    setOpen(true);
    setEditableNote(note);
  };
  const handleClickAdd = () => {
    setOpen(true);
    setEditableNote(null);
  };

  const isNoteUpdated = (note) => {
    return !dayjs(note?.updatedAt).isSame(note?.createdAt);
  };

  return (
    <Box className={classes.noteWrapper}>
      <Box className={classes.noteheader}>
        <Typography variant="h3"> {t('obx.dispatch.notes')}</Typography>
        <Button variant="primary" startIcon={<PlusIcon />} onClick={handleClickAdd}>
          {t('obx.dispatch.newNote')}
        </Button>
      </Box>

      {notesList?.map((note) => (
        <Box className={classes.activityCards} key={note?.id}>
          <Box className={classes.notesTextCol}>
            <Box className={classes.cals}>
              <ColorCalendar />
            </Box>
            <Box className={classes.notesDetails}>
              <Typography variant="body2" className={classes.descriptionText}>
                {note?.content}
              </Typography>
              <Typography variant="body3" className={classes.notesTime}>
                {isNoteUpdated(note) ? t('obx.dispatch.updatedAt') : t('obx.dispatch.cretedAt')}
                {formatDayjsDateTime({
                  value: note?.updated,
                  formatType: dayjsFormatsEnum.dateTime,
                })}
              </Typography>
            </Box>
          </Box>

          <Box className={classes.notesBtns}>
            <Button
              variant="onlyText"
              aria-label="delete"
              startIcon={<Delete />}
              onClick={() => {
                setDeleteableNoteId(note?.id);
              }}
              className={classes.deleteBtn}
            >
              {t('commonText.delete')}
            </Button>
            <Button
              onClick={() => handleClickEdit(note)}
              aria-label="Edit"
              variant="onlyText"
              startIcon={<Edit />}
              className={classes.editBtn}
            >
              {t('links.edit')}
            </Button>
          </Box>
        </Box>
      ))}
      <CreateNotesModal
        open={open}
        objectId={objectId}
        handleClose={handleChange}
        editableNote={editableNote}
        onSaveEdit={onSaveEditNote}
      />

      <SweetAlertModal
        type="warning" // 'success', 'error', 'warning', 'info', etc.
        title={t('commonText.modal.notes.deleteNote')}
        text={t('commonText.modal.notes.deleteMessage')}
        cancelButtonText={t('links.cancel')}
        confirmButtonText={t('buttons.deleteNote')}
        show={!!deletableNoteId}
        handleConfirmButton={onConfirmDeleteNote}
        handleCancelButton={() => {
          setDeleteableNoteId(null);
        }}
        icon={<DeleteIcon />}
      />
    </Box>
  );
};

export default NotesList;

NotesList.propTypes = {
  notesList: PropTypes.array,
  onSaveEditNote: PropTypes.func,
  onDelete: PropTypes.func,
  objectId: PropTypes.string,
};
