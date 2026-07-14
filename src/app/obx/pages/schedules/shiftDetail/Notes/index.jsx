import { Box, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import ActivityBarSkeleton from 'src/app/components/common/skeletonLoader/activityBarSkeleton';
import {
  addNotesToShift,
  addNotesToShiftWithoutLogId,
  fetchNotesById,
} from 'src/services/duty.services';
import { toastSettings } from 'src/utils/constants';
import { toaster } from 'src/utils/toast';

import { useStyles } from './notes.styles';
import NotesEmptyState from './notesEmpty';
import NotesList from './NotesList';

const _Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
  color: theme.palette.text.secondary,
}));

const Notes = ({ shiftActivityLogId, runsheetId, cbUponNotesCreation, startsAt, endsAt }) => {
  const classes = useStyles();
  const [notesList, setNotesList] = useState(undefined);
  const fetchNotesList = async (logId) => {
    try {
      setNotesList(undefined);
      let params = {};
      let logIdparam = logId || shiftActivityLogId;
      if (!logIdparam) {
        logIdparam = runsheetId;
        params = { startDate: startsAt };
      }
      const response = await fetchNotesById({
        shiftActivityLogId: logIdparam,
        params,
      });
      setNotesList(response?.data?.notes || []);
    } catch (error) {
      setNotesList([]);
      toaster.success({
        text: response?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };

  useEffect(() => {
    // Fetch Notes List
    fetchNotesList();
  }, []);

  if (notesList === undefined) {
    return (
      // Notes Skeleton
      <Box className={classes.activitySkeleton}>
        <ActivityBarSkeleton noOfRows={5} />
      </Box>
    );
  }

  const createNoteHandler = async ({ note }) => {
    const payload = {
      note,
    };
    if (!shiftActivityLogId) {
      // if shift type is patrol and shiftActivityLogId is not created yet

      payload.startsAt = startsAt;
      payload.endsAt = endsAt;
      const response = await addNotesToShiftWithoutLogId({
        payload: { startDate: startsAt, note: payload.note },
        runsheetId,
      });
      return {
        ...response,
        createdLogId: response?.data?.id,
      };
    } else {
      return await addNotesToShift({ payload, shiftActivityLogId });
    }
  };

  const onSaveEditNote = async (createdLogId) => {
    if (!shiftActivityLogId) {
      await cbUponNotesCreation(createdLogId);
    }

    fetchNotesList(createdLogId);
  };

  return (
    <Box>
      {notesList?.length > 0 ? (
        // Notes List
        <NotesList
          notesList={notesList}
          shiftActivityLogId={shiftActivityLogId}
          runsheetId={runsheetId}
          createNoteHandler={createNoteHandler}
          onSaveEditNote={onSaveEditNote}
          fetchNotesList={fetchNotesList}
        />
      ) : (
        // When No notes Added
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="calc(100vh - 135px)"
        >
          <NotesEmptyState
            shiftActivityLogId={shiftActivityLogId}
            createNoteHandler={createNoteHandler}
            onSaveEditNote={onSaveEditNote}
          />
        </Box>
      )}
    </Box>
  );
};

Notes.propTypes = {
  createdByName: PropTypes.string,
  createdAt: PropTypes.instanceOf(Date),
  shiftActivityLogId: PropTypes.string,
  runsheetId: PropTypes.string,
  cbUponNotesCreation: PropTypes.func,
  startsAt: PropTypes.string,
  endsAt: PropTypes.string,
};

export default Notes;
