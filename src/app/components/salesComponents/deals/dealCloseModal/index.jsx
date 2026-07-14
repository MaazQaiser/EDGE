import {
  Box,
  Button,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Typography,
} from '@mui/material';
import { ReactComponent as AlertCircle } from 'assets/svg/alertCircle.svg?react';
import { ReactComponent as ClosedWonIcon } from 'assets/svg/ClosedWonIcon.svg?react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import CustomDropDown from 'src/app/components/common/customDropDown/index.jsx';
import ModalComponent from 'src/app/components/common/modal';
import transformArrayForOptions from 'src/utils/array/transformArrayForOptions.js';

// import { toastSettings } from 'src/utils/constants/index.js';
import DrawerHeader from '../../components/drawerHeader/index.jsx';
import { stageValues } from '../dealStages/stage.constant';
import { useStyles } from './dealCloseModal.js';

const DealCloseModalBody = ({
  // data,
  stages,
  setStages,
  updateDealStage,
  fetchStageOptions,
  handleCloseModal,
}) => {
  const { t } = useTranslation();

  const classes = useStyles();
  const [selected, setSelected] = useState({ stage: stageValues.CLOSED_LOST, hubspotStage: null });
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);
  const disabled = !selected.hubspotStage || isSubmittingForm;

  useEffect(() => {
    setStages([]);
    fetchStageOptions(selected.stage);
  }, [selected.stage]);

  const inputChangedHandler = (event) => {
    setSelected((prevData) => ({
      ...prevData,
      hubspotStage: event.target.value,
    }));
  };

  const handleRadioChange = (event) => {
    // if (event.target.value === stageValues.CLOSED_WON && !data?.isQuestionnaireFilled) {
    //   toaster.error(t('sales.deals.notFilledQuestionnaire'), {
    //     position: 'top-right',
    //     autoClose: toastSettings.AUTO_CLOSE,
    //   });
    //   return;
    // }
    setSelected({ stage: event.target.value, hubspotStage: null });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsSubmittingForm(true);
    const payload = {
      stageId: selected.hubspotStage?.id,
      dealStage: selected.stage,
    };
    await updateDealStage(payload);
    setIsSubmittingForm(false);
  };

  return (
    <Box className={classes.modalWrapper} component="form" onSubmit={handleFormSubmit}>
      <DrawerHeader
        title={t('sales.deals.closeDeal')}
        subtext={t('sales.deals.closeDealText')}
        handleCloseDrawer={handleCloseModal}
      />
      <Box>
        <FormControl className={classes.radioOption}>
          <RadioGroup row value={selected.stage} onChange={handleRadioChange}>
            <FormControlLabel
              value={stageValues.CLOSED_WON}
              control={<Radio disableRipple />}
              label="Closed Won"
            />
            <FormControlLabel
              value={stageValues.CLOSED_LOST}
              control={<Radio disableRipple />}
              label="Closed Lost"
            />
          </RadioGroup>
          <Box className={classes.stageDropdwon}>
            <Typography className={classes.spaceBelow} variant="h5">
              {t('sales.locations.chooseMap')}
            </Typography>
            <CustomDropDown
              name="hubspotStage"
              id="hubspotStage"
              placeHolder={t('sales.deals.chooseHubspotStage')}
              options={transformArrayForOptions(stages, 'name', 'id') || []}
              selectedValues={selected.hubspotStage || {}}
              handleChange={inputChangedHandler}
              className={classes.borderLessDrop}
              customDropdownOptionsListClass={classes.dropdwonValues}
              customDropdownSelectHeaderCusrom={classes.dropheader}
              bordered
            />
          </Box>
        </FormControl>
      </Box>

      <Box className={classes.sidefooter}>
        {selected.stage === stageValues.CLOSED_LOST && (
          <Box className={classNames(classes.footerText, classes.closeWon)}>
            <ClosedWonIcon className={classes.alterIcon} />
            <Typography component="p" className={classes.bulkSubHeading}>
              {t('sales.deals.closeLost')}
            </Typography>
          </Box>
        )}
        {selected.stage === stageValues.CLOSED_WON && (
          <Box className={classNames(classes.footerTextBelow, classes.closeLost)}>
            <AlertCircle className={classes.alterIconRed} />
            <Typography component="p" className={classes.bulkSubHeading}>
              {t('sales.deals.closeWonAlert')}
            </Typography>
          </Box>
        )}
        <Box className={classes.footerButtons}>
          <Button onClick={handleCloseModal} variant="secondaryGrey">
            {t('sales.locations.cancel')}
          </Button>

          <Button type="submit" variant="primary" disabled={disabled}>
            {t('sales.locations.save')}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

DealCloseModalBody.propTypes = {
  data: PropTypes.object, // Adjust the type accordingly based on the expected data structure
  stages: PropTypes.array, // Adjust the type accordingly based on the expected data structure
  setStages: PropTypes.func,
  updateDealStage: PropTypes.func,
  fetchStageOptions: PropTypes.func,
  handleCloseModal: PropTypes.func,
};

const DealCloseModal = ({
  data,
  openModal,
  handleCloseModal,
  stages,
  updateDealStage,
  fetchStageOptions,
  setStages,
}) => {
  return (
    <ModalComponent
      open={openModal}
      handleClose={handleCloseModal}
      body={
        <DealCloseModalBody
          data={data}
          stages={stages}
          setStages={setStages}
          updateDealStage={updateDealStage}
          fetchStageOptions={fetchStageOptions}
          handleCloseModal={handleCloseModal}
        />
      }
    />
  );
};

DealCloseModal.propTypes = {
  data: PropTypes.object, // Adjust the type accordingly based on the expected data structure
  openModal: PropTypes.bool,
  handleCloseModal: PropTypes.func,
  stages: PropTypes.array, // Adjust the type accordingly based on the expected data structure
  updateDealStage: PropTypes.func,
  fetchStageOptions: PropTypes.func,
  setStages: PropTypes.func,
};

export default DealCloseModal;
