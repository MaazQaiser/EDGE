import { Box, Button, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CustomDropDown from 'src/app/components/common/customDropDown/index.jsx';
import ModalComponent from 'src/app/components/common/modal';
import { WarningIcon } from 'src/assets/svg/index.jsx';
import transformArrayForOptions from 'src/utils/array/transformArrayForOptions.js';

import { stageValues } from '../locationStages/stage.constant.js';
import { useStyles } from './locationClose.js';
const LocationCloseModalBody = ({
  handleCloseModal,
  stages,
  updateLocation,
  fetchStageOptions,
}) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const [selected, setSelected] = useState({});
  const [loading, setLoading] = useState(false);
  const disabled = Object.keys(selected).length === 0 || loading;

  const inputChangedHandler = (event) => {
    setSelected(event.target.value);
  };

  const markUnqualify = async () => {
    setLoading(true);
    const payload = {
      locationStage: stageValues.UNQUALIFIED,
      leadStageId: selected?.id,
    };
    await updateLocation(payload);
    setLoading(false);
  };

  useEffect(() => {
    fetchStageOptions(stageValues.UNQUALIFIED);
  }, []);

  return (
    <Box className={classes.modalWrapper}>
      <WarningIcon className={classes.warnIcon} />
      <Typography variant="h4">{t('sales.locations.closeHeading')}</Typography>
      <Typography variant="body2" className={classes.closetext}>
        {t('sales.locations.closeText')}
      </Typography>
      <Box className={classes.stageDropdwon}>
        <Typography className={classes.spaceBelow} variant="h5">
          {t('sales.locations.chooseMap')}
        </Typography>
        <CustomDropDown
          name="level"
          id="level"
          placeHolder={t('commonText.dropDown.stagePlaceholder')}
          options={transformArrayForOptions(stages, 'name', 'id')}
          selectedValues={selected || {}}
          handleChange={inputChangedHandler}
          className={classes.borderLessDrop}
          customDropdownOptionsListClass={classes.dropdwonValues}
          customDropdownSelectHeaderCusrom={classes.dropheader}
          bordered
        />
      </Box>
      <Box className={classes.inlineButtons}>
        <Button onClick={handleCloseModal} variant="secondaryGrey">
          {t('sales.locations.cancel')}
        </Button>
        <Button onClick={markUnqualify} disabled={disabled} variant="primary">
          {t('sales.locations.markUnqualified')}
        </Button>
      </Box>
    </Box>
  );
};

LocationCloseModalBody.propTypes = {
  handleCloseModal: PropTypes.func,
  stages: PropTypes.array, // Adjust the type accordingly based on the expected data structure
  updateLocation: PropTypes.func,
  fetchStageOptions: PropTypes.func,
};

const LocationCloseModal = ({
  openModal,
  handleCloseModal,
  stages,
  updateLocation,
  fetchStageOptions,
}) => {
  return (
    <ModalComponent
      open={openModal}
      handleClose={handleCloseModal}
      body={
        <LocationCloseModalBody
          handleCloseModal={handleCloseModal}
          stages={stages}
          updateLocation={updateLocation}
          fetchStageOptions={fetchStageOptions}
        />
      }
    />
  );
};

LocationCloseModal.propTypes = {
  openModal: PropTypes.bool,
  handleCloseModal: PropTypes.func,
  stages: PropTypes.array, // Adjust the type accordingly based on the expected data structure
  updateLocation: PropTypes.func,
  fetchStageOptions: PropTypes.func,
};

export default LocationCloseModal;
