import { Box, Button, TextField, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { ReactComponent as RejectedIcon } from 'assets/svg/cancel-bg.svg?react';
import { ReactComponent as EditFranchiseIcon } from 'assets/svg/check-circle-green.svg?react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { useTenantLabel } from 'src/helper/utilityHooks';

const requestStatuses = {
  approve: 'approved',
  reject: 'rejected',
};

const useStyles = makeStyles((theme) => ({
  approve: {
    height: '57px',
    width: '57px',
    padding: '12px',
    borderRadius: '28px',
    border: '8px solid  #ECFDF3',
    background: '#D1FADF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: theme.palette.textBrandHover,
  },
  reject: {
    height: '57px',
    width: '57px',
    padding: '12px',
    borderRadius: '28px',
    border: '8px solid  #FBEEED',
    background: '#FECDCA',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: theme.palette.textBrandHover,
  },
  formSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  mainFlexBox: {
    display: 'flex',
    flexDirection: 'column',
  },
  modalContent: {
    '&.MuiTypography-root': {
      color: theme.palette.textPlaceholder,
    },
  },
  buttonWrapper: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end',
    '& .MuiButtonBase-root': {
      width: ' unset',
    },
  },
  mainModalComponent: {
    display: ' flex',
    flexDirection: 'column',
    gap: '20px',
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    background: theme.palette.surfaceWhite,
    boxShadow: '0px 8px 8px -4px rgba(16, 24, 40, 0.04), 0px 20px 24px -4px rgba(16, 24, 40, 0.10)',
    borderRadius: '12px',
    padding: '24px',
    width: '551px',
  },
}));
const ChangeRequestStatusModal = ({ formData, setFormData, handleSubmit, handleClose }) => {
  const { t } = useTranslation();
  const { getLabel } = useTenantLabel();

  const classes = useStyles();

  const updateFormHandler = (name, value) => {
    setFormData((prevState) => {
      return {
        ...prevState,
        [name]: value,
      };
    });
  };

  const inputChangedHandler = (event) => {
    // Get name of changed input, and its corresponding value
    const { name, value } = event.target;
    // Update form state against the target input field
    updateFormHandler(name, value);
  };

  return (
    <>
      <Box component="form" onSubmit={handleSubmit} className={classes.mainModalComponent}>
        {formData.status === requestStatuses.approve ? (
          <Box className={classes.approve}>
            <EditFranchiseIcon />
          </Box>
        ) : (
          <Box className={classes.reject}>
            <RejectedIcon />
          </Box>
        )}
        <Box>
          <Typography id="modal-modal-title" variant="h4">
            {formData.status === requestStatuses.approve
              ? `${t('obx.attendance.pendingAttendanceRequestModal.approveRequest')}`
              : `${t('obx.attendance.pendingAttendanceRequestModal.rejectRequest')}`}
          </Typography>
          <Typography id="modal-modal-description" variant="body2" className={classes.modalContent}>
            {formData.status === requestStatuses.approve
              ? `${t('obx.attendance.pendingAttendanceRequestModal.approveRequestDesc')}`
              : `${t('obx.attendance.pendingAttendanceRequestModal.rejectRequestDesc', {
                  officer: getLabel('terms', 'officer', t),
                })}`}
          </Typography>
        </Box>
        {formData.status !== requestStatuses.approve && (
          <Box className={classes.formSection}>
            <Box className={classes.mainFlexBox}>
              <TextField
                variant="outlined"
                name="supervisorComments"
                multiline
                minRows={4}
                type="textArea"
                placeholder={'Add Comment'}
                defaultValue={''}
                onChange={(e) => inputChangedHandler(e)}
              />
            </Box>
          </Box>
        )}
        <Box className={classes.buttonWrapper}>
          <Button fullWidth variant="secondaryGrey" onClick={handleClose}>
            {t('buttons.cancel')}
          </Button>
          <Button
            variant={formData.status === requestStatuses.approve ? `primary` : 'destructive'}
            fullWidth
            type="submit"
          >
            {formData.status === requestStatuses.approve
              ? `${t('obx.attendance.pendingAttendanceRequestModal.approveRequest')}`
              : `${t('obx.attendance.pendingAttendanceRequestModal.rejectRequest')}`}
          </Button>
        </Box>
      </Box>
    </>
  );
};

ChangeRequestStatusModal.propTypes = {
  formData: PropTypes.object, // Adjust the type accordingly based on the expected data structure
  setFormData: PropTypes.func,
  handleSubmit: PropTypes.func,
  handleClose: PropTypes.func,
};

export default ChangeRequestStatusModal;
