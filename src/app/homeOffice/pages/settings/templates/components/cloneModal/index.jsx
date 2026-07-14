import { InputLabel, TextField } from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { ReactComponent as EditIcon } from 'assets/svg/edit-bg.svg?react';
import PropTypes from 'prop-types';
import { useState } from 'react';
import ModalComponent from 'src/app/components/common/modal';

import { useStyles } from './cloneModal.styles';

/**
 * CloneModal is a modal component for cloning entities.
 *
 * @param {Boolean} open - Controls the visibility of the modal.
 * @param {String} title - The title displayed at the top of the modal.
 * @param {String} description - A description or instructions displayed in the modal.
 * @param {String} titlePlaceHolder - Placeholder text for the title input field.
 * @param {String} titleFieldLabel - Label for the title input field.
 * @param {String} cloneButtonText - Text displayed on the 'Clone' button.
 * @param {String} cancelButtonText - Text displayed on the 'Cancel' button.
 * @param {Function} handleClose - Function to close the modal.
 * @param {Function} handleClone - Function to perform the clone operation.
 * @return Component
 */

const CloneModal = ({
  open,
  title,
  description,
  titlePlaceHolder,
  titleFiledLabel,
  cloneButtonText,
  cancelButtonText,
  handleClose,
  handleClone,
}) => {
  const [cloningTitle, setCloningTitle] = useState('');
  const classes = useStyles();

  const handleChange = (event) => {
    setCloningTitle(event.target.value);
  };

  const cloneModalBody = (
    <Box className={classes.cloneModal}>
      <EditIcon />
      <Box className={classes.cloneModalContent}>
        <Typography variant="h3" className={classes.cloneModalTitle}>
          {title}
        </Typography>
        <Typography variant="body2" className={classes.cloneModalText}>
          {description}
        </Typography>
      </Box>
      <Box className={classes.cloneModalField}>
        <InputLabel htmlFor="cloningTitle" className={classes.cloneModalFieldLabel}>
          {titleFiledLabel}
        </InputLabel>
        <TextField
          className={classes.cloneModalFieldInput}
          placeholder={titlePlaceHolder}
          multiline
          required
          name={'cloningTitle'}
          id="cloningTitle"
          value={cloningTitle}
          onChange={handleChange}
        />
      </Box>
      <Box className={classes.cloneModalActions}>
        <Button variant="secondaryGrey" onClick={handleClose}>
          {cancelButtonText}
        </Button>
        <Button
          variant="primary"
          disabled={!cloningTitle || cloningTitle.trim() === ''}
          onClick={() => handleClone(cloningTitle)}
        >
          {cloneButtonText}
        </Button>
      </Box>
    </Box>
  );

  return (
    <>
      <ModalComponent open={open} handleClose={handleClose} body={cloneModalBody} />
    </>
  );
};

CloneModal.propTypes = {
  open: PropTypes.bool.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  titlePlaceHolder: PropTypes.string.isRequired,
  titleFieldLabel: PropTypes.string.isRequired,
  cloneButtonText: PropTypes.string.isRequired,
  cancelButtonText: PropTypes.string.isRequired,
  handleClose: PropTypes.func.isRequired,
  handleClone: PropTypes.func.isRequired,
  titleFiledLabel: PropTypes.string.isRequired,
};

CloneModal.defaultProps = {
  titleFieldLabel: '',
  titlePlaceHolder: '',
  cloneButtonText: '',
  cancelButtonText: '',
  description: '',
  title: '',
  open: false,
};

export default CloneModal;
