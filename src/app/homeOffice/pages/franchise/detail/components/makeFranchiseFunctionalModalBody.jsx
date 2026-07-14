import { Box, Button, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { ReactComponent as EditIcon } from 'assets/icons/editIcon.svg?react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';

const useStyles = makeStyles((theme) => ({
  modalContent: {
    '&.MuiTypography-root': {
      color: theme.palette.textPlaceholder,
      marginTop: '4px',
    },
  },

  mainModalTitle: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
      marginTop: '16px',
    },
  },

  buttonSection: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    marginTop: '24px',

    '& .MuiButtonBase-root': {
      minHeight: '40px',
      padding: '10px 16px',
    },
  },

  mainModalComponent: {
    display: ' flex',
    flexDirection: 'column',
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    background: theme.palette.surfaceWhite,
    boxShadow: '0px 8px 8px -4px rgba(16, 24, 40, 0.04), 0px 20px 24px -4px rgba(16, 24, 40, 0.10)',
    borderRadius: '12px',
    padding: '24px',
    width: '500px',
  },
}));
const MakeFranchiseFunctionalModalBody = ({ handleSubmit, handleClose, disabled }) => {
  const { t } = useTranslation();
  const classes = useStyles();

  return (
    <>
      <Box component="form" onSubmit={handleSubmit} className={classes.mainModalComponent}>
        <Box>
          <EditIcon />
        </Box>
        <Box>
          <Typography id="modal-modal-title" variant="h4" className={classes.mainModalTitle}>
            {t('commonText.modal.makeFranchiseFunctional.title')}
          </Typography>
          <Typography id="modal-modal-description" variant="body2" className={classes.modalContent}>
            {t('commonText.modal.makeFranchiseFunctional.text')}
          </Typography>
        </Box>
        <Box className={classes.buttonSection}>
          <Button variant="secondaryGrey" onClick={handleClose}>
            {t('buttons.cancel')}
          </Button>
          <Button variant={'primary'} type="submit" disabled={disabled}>
            {t('buttons.makeFunctional')}
          </Button>
        </Box>
      </Box>
    </>
  );
};

MakeFranchiseFunctionalModalBody.propTypes = {
  franchiseArea: PropTypes.object,
  handleSubmit: PropTypes.func,
  handleClose: PropTypes.func,
  disabled: PropTypes.bool,
};

export default MakeFranchiseFunctionalModalBody;
