import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { ReactComponent as CheckIcon } from 'assets/svg/check.svg?react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import ModalComponent from 'src/app/components/common/modal';

import { useStyles } from './approveModal.styles';

/**
 * ApproveModal is a modal component for approving report.
 *
 * @param {Boolean} open - Controls the visibility of the modal.
 * @param {Function} handleClose - Function to close the modal.
 * @param {Function} handleApprove - Function to perform the clone operation.
 * @return Component
 */

const ApproveModal = ({ open, handleClose, handleApprove }) => {
  const { t } = useTranslation();
  const classes = useStyles();

  const confirm = (
    <Box className={classes.approveModal}>
      <CheckIcon />
      <Box className={classes.approveModalContent}>
        <Typography variant="h3" className={classes.approveModalTitle}>
          {t('commonText.modal.approveModal.title')}
        </Typography>
        <Typography variant="body2" className={classes.approveModalDescription}>
          {t('commonText.modal.approveModal.description')}
        </Typography>
      </Box>
      <Box className={classes.approveModalActions}>
        <Button variant="secondaryGrey" onClick={handleClose}>
          {t('links.cancel')}
        </Button>
        <Button variant="primary" onClick={handleApprove}>
          {t('buttons.approveReport')}
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

ApproveModal.propTypes = {
  open: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  handleApprove: PropTypes.func.isRequired,
};

ApproveModal.defaultProps = {
  open: false,
};

export default ApproveModal;
