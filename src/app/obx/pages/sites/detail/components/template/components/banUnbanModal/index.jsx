import { Box, Button, InputLabel, TextField, Typography } from '@mui/material';
import { ReactComponent as BanIcon } from 'assets/svg/ban-modal-icon.svg?react';
import { ReactComponent as UnBanIcon } from 'assets/svg/unban-modal-icon.svg?react';
import PropTypes from 'prop-types';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import ModalComponent from 'src/app/components/common/modal';
import RequiredAsterik from 'src/app/components/common/requiredAsterik';
import useFormHook from 'src/hooks/useFormHook';
import { BanUnban } from 'src/utils/constants';
import formValidatorJoi from 'src/utils/formValidator/formValidator.requiredCheck';

import { useStyles } from './banUnbanModal.styles';

const BanUnbanModal = ({ loading, showActionModal, closeActionModal, status, onSubmit }) => {
  const classes = useStyles();
  const { t } = useTranslation();

  const userInfo = useSelector((state) => state.user.info);

  const { handleInputChange, formData, _setFormData, errorMessages, setErrorMessages } =
    useFormHook({
      defaultFormData: {
        reason: '',
        banReason: null,
        bannedById: userInfo.id,
        bannedByName: userInfo.name,
        unbanReason: null,
        unbannedById: userInfo.id,
        unbannedByName: userInfo.name,
      },
    });

  const banSubmit = async () => {
    const payLoad = {
      reason: formData.reason,
    };
    const errors = await formValidatorJoi(payLoad, t);

    if (errors && Object.keys(errors).length) {
      setErrorMessages((prev) => ({ ...prev, ...errors }));
      return;
    }

    const finalPayLoad = {
      banReason: payLoad.reason,
      bannedById: formData.bannedById,
      bannedByName: formData.bannedByName,
    };

    onSubmit(finalPayLoad);
  };

  const unbanSubmit = async () => {
    const payLoad = {
      reason: formData.reason,
    };
    const errors = await formValidatorJoi(payLoad, t);

    if (errors && Object.keys(errors).length) {
      setErrorMessages((prev) => ({ ...prev, ...errors }));
      return;
    }

    const finalPayLoad = {
      unbanReason: payLoad.reason,
      unbannedById: formData.unbannedById,
      unbannedByName: formData.unbannedByName,
    };
    onSubmit(finalPayLoad);
  };

  const REASONS_CHARACTER_LIMIT = 300;

  const banModalBody = (
    <Box className={classes.banModalBody}>
      <BanIcon />
      <Typography variant="h3" className={classes.banModalBodyTitle}>
        {t('obx.visitors.modals.banVisitor.banVisitor')}
      </Typography>
      <Typography variant="body2" className={classes.banModalBodyText}>
        {t('obx.visitors.modals.banVisitor.areYouSure')}
      </Typography>
      <Box className={classes.banModalBodyField}>
        <InputLabel>
          {t('obx.visitors.modals.banVisitor.reason')} <RequiredAsterik />
        </InputLabel>
        <TextField
          className={classes.banModalBodyFieldArea}
          placeholder={t('obx.visitors.modals.banVisitor.addReason')}
          multiline
          minRows={5}
          maxRows={5}
          onChange={handleInputChange}
          name="reason"
          value={formData?.reason}
          helperText={
            <Box className={classes.addBannedHelperText}>
              <Box className={classes.invalidFeedback}>{errorMessages?.reason || ''}</Box>
              <Typography
                variant="body2"
                className={classes.reasonCharacterLimit}
              >{`${formData?.reason.length}/${REASONS_CHARACTER_LIMIT}`}</Typography>
            </Box>
          }
          error={!!errorMessages?.reason}
          inputProps={{
            maxlength: REASONS_CHARACTER_LIMIT,
          }}
        />
      </Box>
      <Box className={classes.banModalBodyActions}>
        <Button onClick={closeActionModal} variant="secondaryGrey">
          {t('obx.visitors.modals.banVisitor.cancel')}
        </Button>
        <Button variant="destructive" onClick={banSubmit} disabled={loading}>
          {t('obx.visitors.modals.banVisitor.button')}
        </Button>
      </Box>
    </Box>
  );

  const unbanModalBody = (
    <Box className={classes.banModalBody}>
      <UnBanIcon />
      <Typography variant="h3" className={classes.banModalBodyTitle}>
        {t('obx.visitors.modals.unbanVisitor.unbanVisitor')}
      </Typography>
      <Typography variant="body2" className={classes.banModalBodyText}>
        {t('obx.visitors.modals.unbanVisitor.areYouSure')}
      </Typography>
      <Box className={classes.banModalBodyField}>
        <InputLabel>
          {t('obx.visitors.modals.unbanVisitor.reason')} <RequiredAsterik />
        </InputLabel>
        <TextField
          className={classes.banModalBodyFieldArea}
          placeholder={t('obx.visitors.modals.unbanVisitor.addReason')}
          multiline
          minRows={5}
          maxRows={5}
          onChange={handleInputChange}
          name="reason"
          value={formData?.reason}
          helperText={
            <Box className={classes.addBannedHelperText}>
              <Box className={classes.invalidFeedback}>{errorMessages?.reason || ''}</Box>
              <Typography
                variant="body2"
                className={classes.reasonCharacterLimit}
              >{`${formData?.reason.length}/${REASONS_CHARACTER_LIMIT}`}</Typography>
            </Box>
          }
          error={!!errorMessages?.reason}
          inputProps={{
            maxlength: REASONS_CHARACTER_LIMIT,
          }}
        />
      </Box>
      <Box className={classes.banModalBodyActions}>
        <Button onClick={closeActionModal} variant="secondaryGrey">
          {t('obx.visitors.modals.unbanVisitor.cancel')}
        </Button>
        <Button variant="primary" onClick={unbanSubmit} disabled={loading}>
          {t('obx.visitors.modals.unbanVisitor.button')}
        </Button>
      </Box>
    </Box>
  );

  return (
    // <ModalComponent
    //   open={showActionModal}
    //   onClose={closeActionModal}
    //   body={status === BanUnban.ban ? unbanModalBody : banModalBody}
    // />
    <ModalComponent
      open={showActionModal}
      handleClose={closeActionModal}
      body={status === BanUnban.ban ? unbanModalBody : banModalBody}
    />
  );
};

BanUnbanModal.propTypes = {
  loading: PropTypes.bool.isRequired,
  showActionModal: PropTypes.bool.isRequired,
  closeActionModal: PropTypes.func.isRequired,
  status: PropTypes.oneOf(BanUnban).isRequired,
  onSubmit: PropTypes.func.isRequired,
};

export default BanUnbanModal;
