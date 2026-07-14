import { Box, Button, Typography } from '@mui/material';
import { ReactComponent as AlertYellowIcon } from 'assets/svg/AlertYellowIcon.svg?react';
import PropTypes from 'prop-types';
import React from 'react';
import { useTranslation } from 'react-i18next';
import ModalComponent from 'src/app/components/common/modal';
import { useTenantLabel } from 'src/helper/utilityHooks';

import { useStyles } from './noTemplateAssignedModal';
export const NoTourTemplateModalBody = ({ handleCloseModal, handleSubmit }) => {
  const { t } = useTranslation();
  const { getLabel } = useTenantLabel();
  const classes = useStyles();

  const handleClose = () => {
    handleCloseModal();
  };

  return (
    <Box className={classes.modalWrapper}>
      <AlertYellowIcon />
      <Box>
        <Typography variant="h3" className={classes.headText}>
          {t('obx.runsheet.noTourTemplateAssigned', { tour: getLabel('terms', 'tour', t) })}
        </Typography>
        <Typography variant="info" className={classes.closetext}>
          {t('obx.runsheet.noTourTemplateAssignedDescription', {
            runsheet: getLabel('terms', 'runsheet', t).toLowerCase(),
            tour: getLabel('terms', 'tour', t).toLowerCase(),
            hit: getLabel('terms', 'hit', t).toLowerCase(),
          })}
        </Typography>
      </Box>

      <Box className={classes.inlineButtons}>
        <Button onClick={handleClose} variant="secondaryGrey">
          {t('obx.runsheet.cancel')}
        </Button>
        <Button variant="primary" onClick={handleSubmit}>
          {t('obx.runsheet.addTemplate')}
        </Button>
      </Box>
    </Box>
  );
};

NoTourTemplateModalBody.propTypes = {
  handleCloseModal: PropTypes.func,
  handleSubmit: PropTypes.func,
};

const NoTourTemplateModal = ({ openModal, handleCloseModal, handleSubmit }) => {
  return (
    <ModalComponent
      open={openModal}
      body={
        <NoTourTemplateModalBody handleCloseModal={handleCloseModal} handleSubmit={handleSubmit} />
      }
    />
  );
};

NoTourTemplateModal.propTypes = {
  openModal: PropTypes.bool,
  handleCloseModal: PropTypes.func,
  handleSubmit: PropTypes.func,
};

export default NoTourTemplateModal;
