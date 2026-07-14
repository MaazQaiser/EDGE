import { Box, Button, Typography } from '@mui/material';
import { ReactComponent as AlertYellowIcon } from 'assets/svg/AlertYellowIcon.svg?react';
import PropTypes from 'prop-types';
import React from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ModalComponent from 'src/app/components/common/modal';
import { useTenantLabel } from 'src/helper/utilityHooks';

import { useStyles } from './UpdateRunsheetModal';
const UpdateBody = ({ handleCloseModal, handleSubmit }) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const [isLoading, setIsLoading] = useState(false);
  const { getLabel } = useTenantLabel();
  const handleClose = () => {
    handleCloseModal();
  };

  const handleUpdate = async () => {
    setIsLoading(true);
    await handleSubmit();
    setIsLoading(false);
  };

  return (
    <Box className={classes.modalWrapper}>
      <AlertYellowIcon />
      <Box>
        <Typography variant="h3" className={classes.headText}>
          {t('obx.runsheet.updateRunsheet!', {
            runsheet: getLabel('terms', 'runsheet', t),
          })}
        </Typography>
        <Typography variant="info" className={classes.closetext}>
          {t('obx.runsheet.updateRunsheetText', {
            runsheet: getLabel('terms', 'runsheet', t).toLowerCase(),
            runsheets: getLabel('terms', 'runsheets', t).toLowerCase(),
            officer: getLabel('terms', 'officer', t).toLowerCase(),
          })}
        </Typography>
      </Box>

      <Box className={classes.inlineButtons}>
        <Button onClick={handleClose} disabled={isLoading} variant="secondaryGrey">
          {t('obx.runsheet.cancel')}
        </Button>
        <Button variant="primary" disabled={isLoading} onClick={handleUpdate}>
          {t('obx.runsheet.updateRunsheet', {
            runsheet: getLabel('terms', 'runsheet', t),
          })}
        </Button>
      </Box>
    </Box>
  );
};

UpdateBody.propTypes = {
  handleCloseModal: PropTypes.func,
  handleSubmit: PropTypes.func,
};

const UpdateRunsheetModal = ({ openModal, handleCloseModal, handleSubmit }) => {
  return (
    <ModalComponent
      open={openModal}
      // handleClose={handleCloseModal}
      body={<UpdateBody handleCloseModal={handleCloseModal} handleSubmit={handleSubmit} />}
    />
  );
};

UpdateRunsheetModal.propTypes = {
  openModal: PropTypes.bool,
  handleCloseModal: PropTypes.func,
  handleSubmit: PropTypes.func,
};

export default UpdateRunsheetModal;
