import { InputLabel, TextField } from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import PropTypes from 'prop-types';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ModalComponent from 'src/app/components/common/modal';
import RequiredAsterik from 'src/app/components/common/requiredAsterik';
import { joiValidateErrors } from 'src/utils/formValidator/formValidator.requiredCheck';

import { useStyles } from './TerminateStyle';

/**
 * RejectModal is a modal component for cloning entities.
 *
 * @param {Boolean} open - Controls the visibility of the modal.
 * @param {Function} handleCancelButton - Function to close the modal.
 * @param {Function} handleConfirmButton - Function to perform the confirm operation.
 * @return Component
 */

const TerminateModal = ({
  open,
  showReason,
  handleCancelButton,
  handleConfirmButton,
  disabled,
  title,
  icon,
  text,
  confirmButtonText,
  cancelButtonText,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();

  const [formData, setFormData] = useState({ reason: '' });
  const [errorMessages, setErrorMessages] = useState({});

  /**
   * common function to update data to formDat object
   */
  const updateFormHandler = useCallback(
    (name, value) => {
      setFormData((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    },
    [setFormData],
  );

  const inputChangedHandler = (event) => {
    const { name, value } = event.target;

    if (value) {
      const { [name]: _key, ...rest } = errorMessages;
      setErrorMessages(rest);
    }
    updateFormHandler(name, value);
  };

  const onConfirm = async () => {
    if (showReason) {
      const errors = await joiValidateErrors({
        data: formData,
        t,
      });

      if (errors) {
        setErrorMessages(errors);
        return;
      }
    }

    handleConfirmButton(showReason ? formData.reason : null);
  };

  const terminateModalBody = (
    <Box className={classes.rejectModal}>
      {icon}
      <Box className={classes.rejectModalContent}>
        <Typography variant="h4" className={classes.rejectModalTitle}>
          {title}
        </Typography>
        <Typography variant="body2" className={classes.rejectModalDescription}>
          {text}
        </Typography>
      </Box>
      {showReason && (
        <Box className={classes.rejectModalField}>
          <InputLabel htmlFor="reason">
            {t('sales.deals.reason')}
            <RequiredAsterik />
          </InputLabel>
          <TextField
            placeholder={t('sales.deals.addReason')}
            multiline
            required
            name="reason"
            id="reason"
            value={formData.reason}
            onChange={inputChangedHandler}
            className={classes.rejectModalTextField}
            error={!!errorMessages.reason}
            helperText={errorMessages.reason}
            inputProps={{ maxLength: 225 }}
          />
        </Box>
      )}
      <Box className={classes.rejectModalActions}>
        <Button disabled={disabled} variant="secondaryGrey" onClick={handleCancelButton}>
          {cancelButtonText}
        </Button>
        <Button disabled={disabled} variant="destructive" onClick={onConfirm}>
          {confirmButtonText}
        </Button>
      </Box>
    </Box>
  );

  return (
    <>
      <ModalComponent open={open} handleClose={handleCancelButton} body={terminateModalBody} />
    </>
  );
};

TerminateModal.propTypes = {
  open: PropTypes.bool,
  showReason: PropTypes.bool,
  handleCancelButton: PropTypes.func,
  handleConfirmButton: PropTypes.func,
  disabled: PropTypes.bool,
  title: PropTypes.string,
  icon: PropTypes.icon,
  text: PropTypes.text,
  confirmButtonText: PropTypes.text,
  cancelButtonText: PropTypes.text,
};

TerminateModal.defaultProps = {
  open: false,
};

export default TerminateModal;
