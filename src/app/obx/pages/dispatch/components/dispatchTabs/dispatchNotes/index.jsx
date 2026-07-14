import { Box } from '@mui/material';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import ActivityBarSkeleton from 'src/app/components/common/skeletonLoader/activityBarSkeleton';
import { getDispatchNotes } from 'src/services/dispatch.services';
import { toastSettings } from 'src/utils/constants';
import { toaster } from 'src/utils/toast';

import { useStyles } from './notes.styles';
import NotesEmptyState from './notesEmpty';
import NotesList from './NotesList';

const Notes = ({ objectId }) => {
  const classes = useStyles();

  const [notesList, setNotesList] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchNotesList = async () => {
    try {
      setLoading(true);
      const response = await getDispatchNotes(objectId);
      setNotesList(response?.data?.notes || []);
    } catch (error) {
      setNotesList([]);
      toaster.error({
        text: error.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
    setLoading(false);
  };

  const handleSaveEditNote = (note) => {
    setNotesList((prev) => {
      const index = prev.findIndex((n) => n.id === note.id);
      if (index !== -1) {
        const updatedNotes = [...prev];
        updatedNotes[index] = note;
        return updatedNotes;
      } else {
        return [...prev, note];
      }
    });
  };

  const handleDeleteNote = (noteId) => {
    setNotesList((notes) => {
      return notes.filter((note) => note.id !== noteId);
    });
  };

  useEffect(() => {
    fetchNotesList();
  }, [objectId]);

  if (loading) {
    return (
      <Box className={classes.activitySkeleton}>
        <ActivityBarSkeleton noOfRows={5} />
      </Box>
    );
  }

  return (
    <Box>
      {notesList?.length > 0 && !loading ? (
        <NotesList
          notesList={notesList}
          objectId={objectId}
          onSaveEditNote={handleSaveEditNote}
          onDelete={handleDeleteNote}
        />
      ) : (
        <Box className={classes.emptyNotes}>
          <NotesEmptyState objectId={objectId} onSaveEditNote={handleSaveEditNote} />
        </Box>
      )}
    </Box>
  );
};

Notes.propTypes = {
  createdByName: PropTypes.string,
  createdAt: PropTypes.instanceOf(Date),
  objectId: PropTypes.string,
  getRunsheetDetail: PropTypes.func,
  startsAt: PropTypes.string,
  endsAt: PropTypes.string,
};

export default Notes;
