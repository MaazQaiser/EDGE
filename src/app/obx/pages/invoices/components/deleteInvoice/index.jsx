import { Box } from '@mui/material';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { ReactComponent as DeleteInvoiceIcon } from 'assets/svg/modal-cancel.svg?react';
import PropTypes from 'prop-types';
import React from 'react';
import { useTranslation } from 'react-i18next';
import ModalComponent from 'src/app/components/common/modal';

import { useStyles } from './deleteInvoice.styles';

const DeleteInvoice = ({ open, onClose, onSubmit, loading }) => {
  const classes = useStyles();

  const { t } = useTranslation();

  const addDeleteInvoiceBody = (
    <Box className={classes.rejectModal}>
      <DeleteInvoiceIcon />
      <Box className={classes.rejectModalContent}>
        <Typography variant="h3" className={classes.rejectModalTitle}>
          {t('obx.invoice.deleteInvoice')}
        </Typography>
        <Typography className={classes.subText} variant="body2">
          {t('obx.invoice.deleteInvoiceText')}
        </Typography>
      </Box>

      <Box className={classes.rejectModalActions}>
        <Button variant="secondaryGrey" onClick={onClose} disabled={loading}>
          {t('obx.invoice.cancel')}
        </Button>
        <Button variant="destructive" onClick={onSubmit} disabled={loading}>
          {t('obx.invoice.delete')}
        </Button>
      </Box>
    </Box>
  );

  return <ModalComponent open={open} handleClose={onClose} body={addDeleteInvoiceBody} />;
};

DeleteInvoice.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  onSubmit: PropTypes.func,
  loading: PropTypes.bool,
};

export default DeleteInvoice;
