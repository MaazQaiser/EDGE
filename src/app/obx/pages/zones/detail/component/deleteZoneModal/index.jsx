import { Box, Button, Typography } from '@mui/material';
import { ReactComponent as DustinBinIcon } from 'assets/svg/delete-modal.svg?react';
import PropTypes from 'prop-types';
import React from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ModalComponent from 'src/app/components/common/modal';
import { OBX_ZONES } from 'src/app/router/constant/ROUTE';
import history from 'src/app/router/utils/history';
import { deleteZoneById } from 'src/services/zone.service';
import { toastSettings } from 'src/utils/constants';
import { toaster } from 'src/utils/toast';

import { useStyles } from './deleteZoneModal.style';

const DeleteZoneModal = ({ openModal, handleCloseModal, zoneId }) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const [buttonDisabled, setButtonDisabled] = useState(false);

  const deleteZone = async () => {
    try {
      setButtonDisabled(true);
      const response = await deleteZoneById(zoneId);

      if (response.statusCode === 200) {
        toaster.success({
          text: response?.message,
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
        handleCloseModal();
        setButtonDisabled(false);
        history.push(`${OBX_ZONES}`);
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
    if (zoneId) {
      deleteZone();
    }
  };

  const deleteModalBody = (
    <Box className={classes.modalWrapper}>
      <DustinBinIcon />
      <Box>
        <Typography variant="h3" className={classes.headText}>
          {t('obx.zones.deleteZone.title')}
        </Typography>
        <Typography variant="info" className={classes.closetext}>
          {t('obx.zones.deleteZone.description')}
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
          {t('obx.zones.deleteZone.action')}
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

DeleteZoneModal.propTypes = {
  openModal: PropTypes.bool,
  handleCloseModal: PropTypes.func,
  zoneId: PropTypes.number,
};

export default DeleteZoneModal;
