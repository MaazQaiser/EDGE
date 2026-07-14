import { Box, Button, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ACL_OBX_SCHEDULES_UPDATE } from 'src/app/router/constant/OBXMODULE';
import { AddIcon } from 'src/assets/svg';
import { ReactComponent as NotesEmptyIcon } from 'src/assets/svg/nonotes.svg?react';
import RenderIfHasPermission from 'src/hoc/RenderIfHasPermission';

import CreateNotesModal from '../createNotesModal';

const useStyles = makeStyles((_theme) => ({
  notesBox: {
    '&.MuiBox-root': {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '16px',
      width: '324px',
      margin: '0 auto',
      textAlign: 'center',
    },
  },
  notesError: {
    '&.MuiTypography-root': {
      fontSize: '22px',
      fontWeight: '700',
      marginBottom: '4px',
    },
  },
  notesMessage: {
    '&.MuiTypography-root': {
      fontSize: '14px',
      fontWeight: '400',
      color: '#5B5B5F',
    },
  },
}));

const NotesEmptyState = ({ shiftActivityLogId, onSaveEditNote, createNoteHandler }) => {
  const { t } = useTranslation();
  const classes = useStyles(); // Move the 'classes' assignment inside the component
  const [open, setOpen] = useState(false);

  const handleCloseModal = () => setOpen(false);

  return (
    <Box className={classes.notesBox}>
      <NotesEmptyIcon />
      <Box>
        <Typography className={classes.notesError}>
          {t('sales.locations.notesErrorShift')}
        </Typography>
        <Typography className={classes.notesMessage}>
          {t('sales.locations.notesErrorMessageShift')}
        </Typography>
      </Box>

      <RenderIfHasPermission name={ACL_OBX_SCHEDULES_UPDATE}>
        <Button variant="primary" startIcon={<AddIcon />} onClick={() => setOpen(true)}>
          {t('obx.sites.jobs.accordionHeader.createNewNote')}
        </Button>
      </RenderIfHasPermission>

      <CreateNotesModal
        open={open}
        handleClose={handleCloseModal}
        editableNote={null}
        onSaveEdit={onSaveEditNote}
        shiftActivityLogId={shiftActivityLogId}
        createNoteHandler={createNoteHandler}
      />
    </Box>
  );
};

export default NotesEmptyState;

NotesEmptyState.propTypes = {
  shiftActivityLogId: PropTypes.string,
  onSaveEditNote: PropTypes.func,
  createNoteHandler: PropTypes.func,
};
