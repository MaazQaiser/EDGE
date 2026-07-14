import { Box, Button, Typography } from '@mui/material';
import { ReactComponent as GroupsIcon } from 'assets/svg/delete-modal.svg?react';
import PropTypes from 'prop-types';
import React from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ModalComponent from 'src/app/components/common/modal';
import { deleteBreakRuleById } from 'src/services/breakRules.service';
import { toastSettings } from 'src/utils/constants';
import { toaster } from 'src/utils/toast';

import { useStyles } from './DeleteBreakRule.style';

const DeleteBreakeRuleModal = ({
  openModal,
  handleCloseModal,
  selectedBreakRule,
  refreshBreakRules,
}) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const [buttonDisabled, setButtonDisabled] = useState(false);

  const deleteBreakRule = async () => {
    try {
      setButtonDisabled(true);
      const response = await deleteBreakRuleById(selectedBreakRule?.id);

      if (response.statusCode === 200) {
        toaster.success({
          text: response?.message,
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
        handleCloseModal();
        setButtonDisabled(false);
        refreshBreakRules();
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
    if (selectedBreakRule?.id) deleteBreakRule();
  };

  const deleteModalBody = (
    <Box className={classes.modalWrapper}>
      <GroupsIcon />
      <Box className={classes.modalWrapperIn}>
        <Typography variant="h3" className={classes.headText}>
          {t('obx.settings.preferences.breakRules.deleteBreakRule')}?
        </Typography>
        <Typography variant="info" className={classes.closetext}>
          {t('obx.settings.preferences.breakRules.deleteBreakRuleText')}
        </Typography>
      </Box>

      <Box className={classes.inlineButtons}>
        <Button
          onClick={() => handleCloseModal()}
          disabled={buttonDisabled}
          variant="secondaryGrey"
        >
          {t('obx.settings.preferences.breakRules.cancel')}
        </Button>
        <Button variant="destructive" onClick={() => handleDelete()} disabled={buttonDisabled}>
          {t('obx.settings.preferences.breakRules.deleteBreakRule')}
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

DeleteBreakeRuleModal.propTypes = {
  openModal: PropTypes.bool,
  handleCloseModal: PropTypes.func,
  selectedBreakRule: PropTypes.object,
  refreshBreakRules: PropTypes.func,
};

export default DeleteBreakeRuleModal;
