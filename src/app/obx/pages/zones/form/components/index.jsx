import { Box, Button, InputLabel, Typography } from '@mui/material';
import { ReactComponent as ReplaceModalIcon } from 'assets/svg/replace-modal-icon.svg?react';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { changeSitesZone } from 'services/zone.service';
import CustomDropDown from 'src/app/components/common/customDropDown';
import ModalComponent from 'src/app/components/common/modal';
import { toastSettings } from 'src/utils/constants';
import formValidatorJoi from 'src/utils/formValidator/formValidator.requiredCheck';
import { toaster } from 'src/utils/toast';

import { useStyles } from '../formZone';

const ReplaceZoneModal = ({
  showActionModal,
  closeActionModal,
  siteId,
  refreshData,
  zonesOptions,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const [selectedZone, setSelectedZone] = useState({});
  const [loading, setLoading] = useState(false);
  const [errorMessages, setErrorMessages] = useState({});
  const handleZoneSelect = (e) => {
    setSelectedZone(e?.target?.value);
  };

  const unAssignSiteFromZone = async (e) => {
    e.preventDefault();
    try {
      let payload = { zoneId: selectedZone?.value || null };

      const errors = await formValidatorJoi(payload, t);

      if (errors && Object.keys(errors).length) {
        setErrorMessages((prev) => ({ ...prev, ...errors, ...errorMessages }));
        return;
      }

      setLoading(true);
      const response = await changeSitesZone(siteId, payload);
      if (response.statusCode === 200) {
        toaster.success({
          text: response.message,
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });

        setSelectedZone({});
        closeActionModal();
        refreshData();
      }
      setLoading(false);
    } catch (e) {
      setLoading(false);
      toaster.error({
        text: e.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };

  const replaceZoneModalBody = (
    <Box className={classes.banModalBody}>
      <ReplaceModalIcon />
      <Typography variant="h3" className={classes.banModalBodyTitle}>
        {t('obx.obxZones.popUps.changeZone')}
      </Typography>
      <Typography variant="body2" className={classes.banModalBodyText}>
        {t('obx.obxZones.popUps.changeZoneDes')}
      </Typography>
      <Box className={classes.banModalBodyField}>
        <InputLabel>{t('obx.form.input.dropDown.selectZone.label')}</InputLabel>
        <CustomDropDown
          label={t('obx.form.input.dropDown.selectZone.label')}
          placeHolder={t('obx.form.input.dropDown.selectZone.label')}
          name="zone"
          selectedValues={selectedZone}
          options={zonesOptions}
          handleChange={handleZoneSelect}
          bordered
          searchable
          className={classes.zoneSitesDropDown}
          isError={!!errorMessages?.zoneId}
        />
      </Box>

      <Box className={classes.invalidFeedback}>
        {errorMessages?.zoneId ? errorMessages?.zoneId : null}
      </Box>
      <Box className={classes.banModalBodyActions}>
        <Button onClick={closeActionModal} variant="secondaryGrey">
          {t('links.cancel')}
        </Button>
        <Button disabled={loading} onClick={unAssignSiteFromZone} type={'button'} variant="primary">
          {t('obx.buttons.changeZone')}
        </Button>
      </Box>
    </Box>
  );

  return (
    <ModalComponent open={showActionModal} onClose={closeActionModal} body={replaceZoneModalBody} />
  );
};

ReplaceZoneModal.propTypes = {
  showActionModal: PropTypes.bool.isRequired,
  closeActionModal: PropTypes.func.isRequired,
  refreshData: PropTypes.func,
  siteId: PropTypes.number,
  zonesOptions: PropTypes.array,
};

export default ReplaceZoneModal;
