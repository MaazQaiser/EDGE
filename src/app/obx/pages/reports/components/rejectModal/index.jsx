import { TextField } from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { ReactComponent as CancelIcon } from 'assets/svg/cancel.svg?react';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ModalComponent from 'src/app/components/common/modal';

import { useStyles } from './rejectModal.styles';

/**
 * RejectModal is a modal component for cloning entities.
 *
 * @param {Boolean} open - Controls the visibility of the modal.
 * @param {Function} handleClose - Function to close the modal.
 * @param {Function} handleReject - Function to perform the clone operation.
 * @return Component
 */

const RejectModal = ({ open, handleClose, handleReject, disabled }) => {
  const { t } = useTranslation();
  const [comments, setComments] = useState('');
  const classes = useStyles();

  const handleChange = (event) => {
    setComments(event.target.value);
  };

  const confirm = (
    <Box className={classes.rejectModal}>
      <CancelIcon />
      <Box className={classes.rejectModalContent}>
        <Typography variant="h3" className={classes.rejectModalTitle}>
          {t('commonText.modal.rejectModal.title')}
        </Typography>
        <Typography variant="body2" className={classes.rejectModalDescription}>
          {t('commonText.modal.rejectModal.description')}
        </Typography>
      </Box>
      <Box className={classes.rejectModalField}>
        <TextField
          placeholder={'Add Comments'}
          multiline
          required
          name={'comments'}
          id="comments"
          value={comments}
          onChange={handleChange}
          className={classes.rejectModalTextField}
        />
      </Box>
      <Box className={classes.rejectModalActions}>
        <Button disabled={disabled} variant="secondaryGrey" onClick={handleClose}>
          {t('links.cancel')}
        </Button>
        <Button
          disabled={disabled}
          variant="destructive"
          onClick={() => handleReject(comments, true)}
        >
          {t('buttons.rejectReport')}
        </Button>
      </Box>
    </Box>
  );

  return (
    <>
      <ModalComponent open={open} handleClose={handleClose} body={confirm} />
    </>
  );
};

RejectModal.propTypes = {
  open: PropTypes.bool,
  handleClose: PropTypes.func,
  handleReject: PropTypes.func,
  disabled: PropTypes.bool,
};

RejectModal.defaultProps = {
  open: false,
};

export default RejectModal;
