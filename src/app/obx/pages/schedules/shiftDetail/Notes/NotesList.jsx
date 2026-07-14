import { Box, Button, Typography } from '@mui/material';
import { ReactComponent as PlusIcon } from 'assets/svg/addIconBlue.svg?react';
import { ReactComponent as DeleteIcon } from 'assets/svg/delete-modal.svg?react';
import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import SweetAlertModal from 'src/app/components/common/sweetAlertModal';
import { ACL_OBX_SCHEDULES_UPDATE } from 'src/app/router/constant/OBXMODULE';
import { ColorCalendar, Delete, Edit } from 'src/assets/svg';
import RenderIfHasPermission from 'src/hoc/RenderIfHasPermission';
import useDateTime from 'src/hooks/useDateTime';
import { deleteNotesOfShift } from 'src/services/duty.services';
import { dayjsFormatsEnum, toastSettings } from 'src/utils/constants';
import { toaster } from 'src/utils/toast';

import CreateNotesModal from './createNotesModal';
import { useStyles } from './notes.styles';

const NotesList = ({
  notesList,
  shiftActivityLogId,
  runsheetId,
  onSaveEditNote,
  fetchNotesList,
  createNoteHandler,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();

  const [open, setOpen] = useState(false);
  const handleChange = () => setOpen(!open);
  const [deletableNoteId, setDeleteableNoteId] = useState(null);
  const { formatDayjsDateTime } = useDateTime();

  const [editableNote, setEditableNote] = useState(null);

  const onConfirmDeleteNote = async () => {
    try {
      const response = await deleteNotesOfShift({
        noteId: deletableNoteId,
        shiftActivityLogId: shiftActivityLogId || runsheetId,
      });
      toaster.success({
        text: response?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });

      setDeleteableNoteId(null);
      fetchNotesList();
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
      <Button
        className={classes.addNoteButton}
        type="button"
        variant="secondaryGrey"
        startIcon={<PlusIcon />}
        onClick={handleClickAdd}
      >
        {t('obx.sites.jobs.accordionHeader.createNewNote')}
      </Button>
      {notesList?.map((note) => (
        <Box className={classes.activityCards} key={note?.id}>
          <Box className={classes.notesTextCol}>
            <Box className={classes.cals}>
              <ColorCalendar />
            </Box>
            <Box className={classes.notesDetails}>
              <Typography variant="body2" className={classes.descriptionText}>
                {note?.text}
              </Typography>
              <Typography variant="body3" className={classes.notesTime}>
                {isNoteUpdated(note)
                  ? t('obx.sites.jobs.accordionHeader.updated')
                  : t('obx.sites.jobs.accordionHeader.created')}
                {note?.lastUpdatedBy?.name} {t('obx.sites.jobs.accordionHeader.At')}
                {formatDayjsDateTime({
                  value: note?.updatedAt,
                  formatType: dayjsFormatsEnum.dateTime,
                })}
              </Typography>
            </Box>
          </Box>

          <Box className={classes.notesBtns}>
            <RenderIfHasPermission name={ACL_OBX_SCHEDULES_UPDATE}>
              <Button
                variant="onlyText"
                aria-label="delete"
                onClick={() => {
                  setDeleteableNoteId(note?.id);
                }}
                className={classes.deleteBtn}
              >
                <Delete />
                {t('commonText.delete')}
              </Button>
            </RenderIfHasPermission>

            <RenderIfHasPermission name={ACL_OBX_SCHEDULES_UPDATE}>
              <Button
                onClick={() => handleClickEdit(note)}
                aria-label="Edit"
                variant="onlyText"
                className={classes.editBtn}
              >
                <Edit /> {t('links.edit')}
              </Button>
            </RenderIfHasPermission>
          </Box>
        </Box>
      ))}
      <CreateNotesModal
        open={open}
        runsheetId={runsheetId}
        handleClose={handleChange}
        editableNote={editableNote}
        shiftActivityLogId={shiftActivityLogId}
        onSaveEdit={onSaveEditNote}
        createNoteHandler={createNoteHandler}
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
  shiftActivityLogId: PropTypes.string,
  onSaveEditNote: PropTypes.func,
  runsheetId: PropTypes.string,
  fetchNotesList: PropTypes.func,
  createNoteHandler: PropTypes.func,
};
