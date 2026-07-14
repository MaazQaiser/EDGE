import { Box, Button, Typography } from '@mui/material';
import { ReactComponent as GroupsIcon } from 'assets/svg/delete-modal.svg?react';
import PropTypes from 'prop-types';
import React from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ModalComponent from 'src/app/components/common/modal';
import { addJobsAndRunsheetToBreakRule } from 'src/services/breakRules.service';
import { toastSettings } from 'src/utils/constants';
import { toaster } from 'src/utils/toast';

import { useStyles } from './deleteModal';

const DeleteJobModal = ({
  openModal,
  handleCloseModal,
  selectedJobOrRunsheet,
  refetchAssociatedList,
}) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const [buttonDisabled, setButtonDisabled] = useState(false);

  const removeJobOrRunsheet = async () => {
    try {
      setButtonDisabled(true);
      const idType =
        selectedJobOrRunsheet?.type === 'dedicated' ? 'removedDedicatedIds' : 'removedPatrolIds';
      const payload = {
        [idType]: [selectedJobOrRunsheet?.id],
        breakRuleId: selectedJobOrRunsheet?.breakRuleId,
      };
      const response = await addJobsAndRunsheetToBreakRule(payload);

      if (response.statusCode === 200) {
        toaster.success({
          text: response?.message,
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
        handleCloseModal();
        setButtonDisabled(false);
        refetchAssociatedList();
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
    if (selectedJobOrRunsheet?.id) removeJobOrRunsheet();
  };

  const deleteModalBody = (
    <Box className={classes.modalWrapper}>
      <GroupsIcon />
      <Box className={classes.modalWrapperIn}>
        <Typography variant="h3" className={classes.headText}>
          {t('obx.settings.preferences.breakRules.removeJob')}!
        </Typography>
        <Typography variant="info" className={classes.closetext}>
          {t('obx.settings.preferences.breakRules.removeJobText')}
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
          {t('obx.settings.preferences.breakRules.yesRemove')}
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

DeleteJobModal.propTypes = {
  openModal: PropTypes.bool,
  handleCloseModal: PropTypes.func,
  selectedJobOrRunsheet: PropTypes.object,
  refetchAssociatedList: PropTypes.func,
};

export default DeleteJobModal;
