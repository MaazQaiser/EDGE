import { Box, Button, Typography } from '@mui/material';
import { ReactComponent as DustinBinIcon } from 'assets/svg/warning.svg?react';
import PropTypes from 'prop-types';
import React from 'react';
import { useTranslation } from 'react-i18next';
import ModalComponent from 'src/app/components/common/modal';

import { useStyles } from './resetModalStyle';
const ResetModalBody = ({ handleCloseModal, handleSubmit = () => {} }) => {
  const { t } = useTranslation();
  const classes = useStyles();

  const handleClose = () => {
    handleCloseModal();
  };
  return (
    <Box className={classes.modalWrapper}>
      <DustinBinIcon />
      <Box className={classes.resetModalTextWrapper}>
        <Typography variant="h3" className={classes.headText}>
          {t('obx.settings.rolesPermissions.resetChanges')}
        </Typography>
        <Typography variant="info" className={classes.closetext}>
          {t('obx.settings.rolesPermissions.resetToDefaultText')}
        </Typography>
      </Box>

      <Box className={classes.inlineButtons}>
        <Button onClick={handleClose} variant="secondaryGrey">
          {t('obx.settings.rolesPermissions.cancel')}
        </Button>
        <Button variant="primary" onClick={handleSubmit}>
          {t('obx.settings.rolesPermissions.reset')}
        </Button>
      </Box>
    </Box>
  );
};

ResetModalBody.propTypes = {
  handleCloseModal: PropTypes.func,
  handleSubmit: PropTypes.func,
  selectedRole: PropTypes.func,
};

const ResetModal = ({ openModal, handleCloseModal, handleSubmit, ...props }) => {
  return (
    <ModalComponent
      open={openModal}
      // handleClose={handleCloseModal}
      body={
        <ResetModalBody
          handleCloseModal={handleCloseModal}
          handleSubmit={handleSubmit}
          {...props}
        />
      }
    />
  );
};

ResetModal.propTypes = {
  openModal: PropTypes.bool,
  handleCloseModal: PropTypes.func,
  handleSubmit: PropTypes.func,
};

export default ResetModal;
