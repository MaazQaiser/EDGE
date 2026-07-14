import { Box } from '@mui/material';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { ReactComponent as AlertDeleteIcons } from 'assets/svg/AlertDeleteIcons.svg?react';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { deleteSageContact } from 'services/billing.service';
import ModalComponent from 'src/app/components/common/modal';
import { toastSettings } from 'src/utils/constants';
import { toaster } from 'src/utils/toast';

import { useStyles } from './deleteContacts.style';

const DeleteContactsModal = ({ open, onClose, refreshData, id }) => {
  const classes = useStyles();

  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  const deleteContactApi = async () => {
    setLoading(true);
    try {
      const response = await deleteSageContact(id);

      if (response && response?.statusCode === 200) {
        toaster.success({
          text: response?.message,
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
        refreshData();
      }
      setLoading(false);
    } catch (error) {
      onClose();
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
      setLoading(false);
    }
  };

  const addDeleteInvoiceBody = (
    <Box className={classes.rejectModal}>
      <AlertDeleteIcons />
      <Box className={classes.rejectModalContent}>
        <Typography variant="h3" className={classes.rejectModalTitle}>
          {t('obx.billing.delete')}
        </Typography>
        <Typography className={classes.subText} variant="body2">
          {t('obx.billing.deleteText')}
        </Typography>
      </Box>

      <Box className={classes.rejectModalActions}>
        <Button variant="secondaryGrey" onClick={onClose}>
          {t('obx.invoice.cancel')}
        </Button>
        <Button disabled={loading} variant="destructive" onClick={deleteContactApi}>
          {t('obx.billing.deletePermanently')}
        </Button>
      </Box>
    </Box>
  );

  return <ModalComponent open={open} handleClose={onClose} body={addDeleteInvoiceBody} />;
};

DeleteContactsModal.propTypes = {
  open: PropTypes.bool,
  id: PropTypes.any,
  onClose: PropTypes.func,
  refreshData: PropTypes.func,
};

export default DeleteContactsModal;
