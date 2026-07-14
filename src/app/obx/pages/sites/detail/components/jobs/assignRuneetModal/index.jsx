import { Box, Button, Typography } from '@mui/material';
import { ReactComponent as DustinBinIcon } from 'assets/svg/warning.svg?react';
import PropTypes from 'prop-types';
import React from 'react';
import { useTranslation } from 'react-i18next';
import ModalComponent from 'src/app/components/common/modal';
import { useTenantLabel } from 'src/helper/utilityHooks';

import { useStyles } from './AssignRunsheet';
const DeleteBody = ({ handleCloseModal }) => {
  const { t } = useTranslation();
  const { getLabel } = useTenantLabel();
  const classes = useStyles();

  const handleClose = () => {
    handleCloseModal();
  };

  return (
    <Box className={classes.modalWrapper}>
      <DustinBinIcon />
      <Box>
        <Typography variant="h3" className={classes.headText}>
          {t('obx.runsheet.confirmAssignment')}
        </Typography>
        <Typography variant="info" className={classes.closetext}>
          {t('obx.runsheet.confirmAssignmentText', {
            hits: getLabel('terms', 'hits', t).toLowerCase(),
            runsheet: getLabel('terms', 'runsheet', t).toLowerCase(),
          })}
        </Typography>
      </Box>

      <Box className={classes.inlineButtons}>
        <Button onClick={handleClose} variant="secondaryGrey">
          {t('obx.runsheet.cancel')}
        </Button>
        <Button variant="primary">
          {t('obx.runsheet.assignHits', { hits: getLabel('terms', 'hits') })}
        </Button>
      </Box>
    </Box>
  );
};

DeleteBody.propTypes = {
  handleCloseModal: PropTypes.func,
};

const AssignToRunsheetModal = ({ openModal, handleCloseModal }) => {
  return (
    <ModalComponent
      open={openModal}
      // handleClose={handleCloseModal}
      body={<DeleteBody handleCloseModal={handleCloseModal} />}
    />
  );
};

AssignToRunsheetModal.propTypes = {
  openModal: PropTypes.bool,
  handleCloseModal: PropTypes.func,
};

export default AssignToRunsheetModal;
