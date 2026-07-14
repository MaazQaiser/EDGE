import { Box, Button, Typography } from '@mui/material';
import { ReactComponent as GroupsIcon } from 'assets/svg/delete-modal.svg?react';
import PropTypes from 'prop-types';
import React from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ModalComponent from 'src/app/components/common/modal';
import { deleteBreakTypeById } from 'src/services/breakRules.service';
import { toastSettings } from 'src/utils/constants';
import { toaster } from 'src/utils/toast';

import { useStyles } from './RemoveTypeDrawer';

const RemoveTypeModal = ({
  openModal,
  handleCloseModal,
  breakType,
  refetchBreakTypes,
  setSelectedBreakType,
}) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const [buttonDisabled, setButtonDisabled] = useState(false);

  const deleteBreakType = async () => {
    try {
      setButtonDisabled(true);
      const response = await deleteBreakTypeById(breakType?.id);

      if (response.statusCode === 200) {
        toaster.success({
          text: response?.message,
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
        handleCloseModal();
        setButtonDisabled(false);
        refetchBreakTypes();
        setSelectedBreakType(null);
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
    if (breakType?.id) deleteBreakType();
  };

  const deleteModalBody = (
    <Box className={classes.modalWrapper}>
      <GroupsIcon />
      <Box className={classes.modalWrapperIn}>
        <Typography variant="h3" className={classes.headText}>
          {t('obx.settings.preferences.breakRules.removeBreakType')}!
        </Typography>
        <Typography variant="info" className={classes.closetext}>
          {t('obx.settings.preferences.breakRules.removeBreakTypeText')}
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
          {t('obx.settings.preferences.breakRules.removeBreakType')}
        </Button>
      </Box>
    </Box>
  );

  return <ModalComponent open={openModal} body={deleteModalBody} />;
};

RemoveTypeModal.propTypes = {
  openModal: PropTypes.bool,
  handleCloseModal: PropTypes.func,
  breakType: PropTypes.object,
  refetchBreakTypes: PropTypes.func,
  setSelectedBreakType: PropTypes.func,
};

export default RemoveTypeModal;
