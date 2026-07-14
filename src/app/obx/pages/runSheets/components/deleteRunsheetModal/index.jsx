import { Box, Button, Typography } from '@mui/material';
import { ReactComponent as DustinBinIcon } from 'assets/svg/delete-modal.svg?react';
import PropTypes from 'prop-types';
import React from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ModalComponent from 'src/app/components/common/modal';
import { OBX_RUNSHEET } from 'src/app/router/constant/ROUTE';
import history from 'src/app/router/utils/history';
import { useTenantLabel } from 'src/helper/utilityHooks';
import { deleteRunsheetById } from 'src/services/runsheet.services';
import { toastSettings } from 'src/utils/constants';
import { toaster } from 'src/utils/toast';

import { useStyles } from './deleteRunsheetModal.style';

const DeleteRunsheetModal = ({ openModal, handleCloseModal, runsheetTemplateId }) => {
  const { t } = useTranslation();
  const { getLabel } = useTenantLabel();
  const classes = useStyles();
  const [buttonDisabled, setButtonDisabled] = useState(false);

  const deleteRunsheet = async () => {
    try {
      setButtonDisabled(true);
      const response = await deleteRunsheetById(runsheetTemplateId);

      if (response.statusCode === 200) {
        toaster.success({
          text: response?.message,
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
        handleCloseModal();
        setButtonDisabled(false);
        history.push(`${OBX_RUNSHEET}`);
      }
    } catch (error) {
      setButtonDisabled(false);
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };

  const handleDelete = () => {
    if (runsheetTemplateId) {
      deleteRunsheet();
    }
  };

  const deleteModalBody = (
    <Box className={classes.modalWrapper}>
      <DustinBinIcon />
      <Box>
        <Typography variant="h3" className={classes.headText}>
          {t('obx.runsheet.deleteRunsheet!', {
            runsheet: getLabel('terms', 'runsheet', t),
          })}
        </Typography>
        <Typography variant="info" className={classes.closetext}>
          {t('obx.runsheet.deleteText', {
            runsheet: getLabel('terms', 'runsheet', t).toLowerCase(),
            hits: getLabel('terms', 'hits', t).toLowerCase(),
          })}
        </Typography>
      </Box>

      <Box className={classes.inlineButtons}>
        <Button
          onClick={() => handleCloseModal()}
          disabled={buttonDisabled}
          variant="secondaryGrey"
        >
          {t('obx.runsheet.cancel')}
        </Button>
        <Button variant="destructive" onClick={() => handleDelete()} disabled={buttonDisabled}>
          {t('obx.runsheet.deleteRunsheet', {
            runsheet: getLabel('terms', 'runsheet', t),
          })}
        </Button>
      </Box>
    </Box>
  );

  return (
    <ModalComponent
      open={openModal}
      // handleClose={handleCloseModal}
      body={deleteModalBody}
    />
  );
};

DeleteRunsheetModal.propTypes = {
  openModal: PropTypes.bool,
  handleCloseModal: PropTypes.func,
  runsheetTemplateId: PropTypes.number,
};

export default DeleteRunsheetModal;
