import { Box } from '@mui/material';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import React from 'react';
import { useTranslation } from 'react-i18next';
import ModalComponent from 'src/app/components/common/modal';
import { ReactComponent as CrossIcon } from 'src/assets/svg/CrossIcon.svg?react';
import { useTenantLabel } from 'src/helper/utilityHooks';

import { useStyles } from './notesModal.styles';

const NotesModal = ({ open, onClose, notes }) => {
  const classes = useStyles();

  const { t } = useTranslation();
  const { getLabel } = useTenantLabel();
  const ModalBody = (
    <Box className={classes.rejectModal}>
      <Box className={classes.rejectModalContent}>
        <Typography variant="h2" className={classes.rejectModalTitle}>
          {t('obx.payroll.notes')}
        </Typography>
        <Button
          onClick={onClose}
          className={classes.notesCloseBtn}
          disableRipple
          variant="onlyText"
          startIcon={<CrossIcon />}
        ></Button>
      </Box>
      <Typography className={classes.subText} variant="subtitle2">
        {t('obx.payroll.notesText', {
          supervisor: getLabel('terms', 'supervisor', t)?.toLowerCase(),
        })}
      </Typography>
      {notes?.map((note) => {
        return (
          <Box key={note.id} className={classes.repateNotes}>
            <Typography className={classes.notesSubHeading} variant="subtitle2">
              {note.text}
            </Typography>
            <Typography className={classes.notesArea} variant="subtitle3">
              {note.updatedAt
                ? `Updated: ${dayjs(note.updatedAt).format('YYYY-MM-DD hh:mm')}`
                : `Created: ${dayjs(note.createdAt).format('YYYY-MM-DD hh:mm')}`}
            </Typography>
          </Box>
        );
      })}
    </Box>
  );

  return <ModalComponent open={open} handleClose={onClose} body={ModalBody} />;
};

NotesModal.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  notes: PropTypes.array,
};

export default NotesModal;
