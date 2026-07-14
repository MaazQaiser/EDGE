import { Box, Skeleton, Typography } from '@mui/material';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Tooltip from '@mui/material/Tooltip';
import { ReactComponent as ArrowRightIcon } from 'assets/svg/arrow-right.svg?react';
import { ReactComponent as StagesArrows } from 'assets/svg/stagesarrows.svg?react';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import CustomDropDown from 'src/app/components/common/customDropDown/index.jsx';
import { AddIcon } from 'src/assets/svg/index.jsx';
import transformArrayForOptions from 'src/utils/array/transformArrayForOptions.js';
import { stageStatus } from 'src/utils/constants/index.js';

import { useStyles } from './dealStages.js';
import { stageName, stageValues, stepperDefaultStage } from './stage.constant.js';

const DealStages = ({
  data,
  updateDealStage,
  fetchStageOptions,
  stages,
  setStages,
  isNotClosed,
  isLoading,
  goToContractsAndTermsTab,
  handleOpenCloseDealModal,
}) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const [open, setOpen] = useState(false);
  const [currAndcomingStage, setcurrAndcomingStage] = useState({
    current: {},
    upcoming: {},
  });
  const [stagesModelData, setStagesModelData] = useState(stepperDefaultStage);
  const [selectedHubSpotStage, setSelectedHubSpotStage] = useState(null);
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);
  const disabled = !selectedHubSpotStage || isSubmittingForm;

  // this will indicate to show Questions -> Proposal Deal Stage Transition Modal
  // once questionnaire is filled
  const showProposalTransitionModal = data?.showProposalTransitionModal;
  useEffect(() => {
    if (showProposalTransitionModal) handleOpen(stagesModelData?.[1]);
  }, [showProposalTransitionModal]);

  useEffect(() => {
    if (data && Object.keys(data).length && stagesModelData.length) {
      const updatedStagesModelData = stagesModelData?.map((button) => {
        const stepperDetail = data?.stepperDetails?.find(
          (stepperDetail) =>
            stepperDetail.name === button.title ||
            stepperDetail.value === stageValues.CLOSED_LOST ||
            stepperDetail.value === stageValues.CLOSED_WON,
        );
        // Check if corresponding stepperDetail is found
        if (stepperDetail) {
          // Update button with values from stepperDetail
          return {
            ...button,
            ...([stageValues.CLOSED_LOST, stageValues.CLOSED_WON].includes(stepperDetail.value) && {
              title:
                stepperDetail.status === stageStatus.CURRENT
                  ? stepperDetail.name
                  : stageName.CLOSED,
            }),
            value: stepperDetail.value,
            status: stepperDetail.status,
          };
        }

        return button; // If no match is found, return the original button
      });

      setStagesModelData(updatedStagesModelData);
    }
  }, [data]);

  /**
   * get the current selected stage from the stepper
   */
  const currentStage = stagesModelData.find((detail) => detail.status === stageStatus.CURRENT);

  const handleClose = () => {
    setOpen(false);
  };

  const inputChangedHandler = (event) => {
    setSelectedHubSpotStage(event.target.value);
  };

  const handleOpen = (stage) => {
    /**
     * previous workflow
     */
    // if ((!stage || stage.value !== stageValues.QUESTIONS) && !data?.isQuestionnaireFilled) {
    //   toaster.error(t('sales.deals.notFilledQuestionnaire'), {
    //     position: 'top-right',
    //     autoClose: toastSettings.AUTO_CLOSE,
    //   });
    //   return;
    // }
    /**
     * Empty previous hubspot stages selected for stage
     */
    setStages([]);
    setSelectedHubSpotStage(null);
    /**
     * get upcoming stage which user want to complete
     * if user click Mark stage as complete button then set current stage as selectedStage
     */
    let selectedStage;
    if (stage) selectedStage = stagesModelData.find((detail) => detail.value === stage.value);
    else
      selectedStage = stagesModelData
        .slice()
        .find((detail) => detail.status === stageStatus.PENDING);

    if (selectedStage.title === stageName.CLOSED) {
      handleOpenCloseDealModal();
      return;
    }

    fetchStageOptions(stage ? stage.value : selectedStage.value);
    setcurrAndcomingStage((prevOptions) => ({
      ...prevOptions,
      upcoming: selectedStage,
      current: currentStage,
    }));

    setOpen(true);
  };

  const handleConfirm = async (e) => {
    e.preventDefault();
    setIsSubmittingForm(true);
    const payload = {
      stageId: selectedHubSpotStage?.id,
      dealStage: currAndcomingStage?.upcoming?.value,
    };
    await updateDealStage(payload);
    // Show Contracts & Terms when transitioning to Proposal
    if (currAndcomingStage?.upcoming?.value === stageValues.PROPOSAL) goToContractsAndTermsTab();
    handleClose();
    setIsSubmittingForm(false);
  };

  return (
    <>
      <Box className={classes.stagesheader}>
        <Typography variant="h5" className={classes.stagesHeading}>
          {t('sales.deals.dealStages')}
        </Typography>
        {isNotClosed ? (
          <Button
            className={classes.noPadding}
            variant="onlyText"
            disableRipple
            startIcon={<AddIcon className={classes.whiteBtn} />}
            onClick={() => handleOpen(null)}
          >
            {t('sales.locations.markCompleted')}
          </Button>
        ) : null}
      </Box>
      {isLoading ? (
        <Box className={classes.stagesStepperSkeletonWrapper}>
          <Skeleton
            animation="wave"
            width={'33%'}
            variant="rounded"
            height={40}
            className={classes.barSkeleton}
          />
          <Skeleton
            animation="wave"
            width={'33%'}
            variant="rounded"
            height={40}
            className={classes.barSkeleton}
          />
          <Skeleton
            animation="wave"
            width={'33%'}
            variant="rounded"
            height={40}
            className={classes.barSkeleton}
          />
        </Box>
      ) : (
        <Box className={classes.stageWraperr}>
          {stagesModelData?.map((stage, i) => {
            const isButtonDisabled =
              stage?.status === stageStatus.COMPLETED ||
              stage?.status === stageStatus.CURRENT ||
              (stage?.value === stageValues.CLOSED_WON && stage?.status === stageStatus.COMPLETED);

            return isButtonDisabled ? (
              <Button
                className={`${classes.defaultStage} ${
                  stage?.status === stageStatus.COMPLETED
                    ? classes.checked
                    : stage?.status === stageStatus.CURRENT
                      ? classes.current
                      : ''
                }`}
                disableRipple
                disabled={isButtonDisabled}
                onClick={() => handleOpen(stage)}
                key={i}
              >
                {stage?.status === stageStatus.COMPLETED ? (
                  <>
                    <StagesArrows /> {stage?.title}
                  </>
                ) : (
                  stage?.title
                )}
              </Button>
            ) : (
              <Tooltip
                className={classes.toolTipBox}
                title={stage.content}
                placement="bottom"
                arrow
                key={i}
              >
                <Button
                  className={`${classes.defaultStage} ${
                    stage?.status === stageStatus.COMPLETED
                      ? classes.checked
                      : stage?.status === stageStatus.CURRENT
                        ? classes.current
                        : ''
                  }`}
                  disableRipple
                  disabled={isButtonDisabled}
                  onClick={() => handleOpen(stage)}
                >
                  {stage?.status === stageStatus.COMPLETED ? (
                    <>
                      <StagesArrows /> {stage?.title}
                    </>
                  ) : (
                    stage?.title
                  )}
                </Button>
              </Tooltip>
            );
          })}
          <Dialog className={classes.stageModal} open={open} onClose={handleClose}>
            <Box className={classes.modalTopArea}>
              <Typography className={classes.modalHeading}>
                {t('sales.locations.askProcessed')}
              </Typography>
              <Box className={classes.modalTypoBox}>
                <Box variant="body3" className={classes.modalTextBody}>
                  <Typography variant="body3" className={classes.modalTextUpper}>
                    {currAndcomingStage?.upcoming?.title}:
                  </Typography>
                  <Typography variant="body3" className={classes.modalText}>
                    {currAndcomingStage?.upcoming?.dialogContent}
                  </Typography>
                </Box>
              </Box>
              <Box display="flex" alignItems="center">
                <Box className={classes.inlineBoxIcons}>
                  {currAndcomingStage?.current?.icon}
                  <Typography className={classes.modalTextBlue}>
                    {currAndcomingStage?.current?.title}
                  </Typography>
                </Box>
                <ArrowRightIcon className={classes.arrowIcons} />
                <Box className={classes.inlineBoxIcons}>
                  {currAndcomingStage?.upcoming?.icon}
                  <Typography className={classes.modalTextBlue}>
                    {currAndcomingStage?.upcoming?.title}
                  </Typography>
                </Box>
              </Box>
              <Box className={classes.stageDropdwon}>
                <Typography className={classes.spaceBelow} variant="h5">
                  {' '}
                  {t('sales.locations.chooseMap')}
                </Typography>
                <CustomDropDown
                  name="stage"
                  id="stage"
                  placeHolder={t('sales.deals.chooseHubspotStage')}
                  options={transformArrayForOptions(stages, 'name', 'id') || []}
                  selectedValues={selectedHubSpotStage || {}}
                  handleChange={inputChangedHandler}
                  className={classes.borderLessDrop}
                  customDropdownOptionsListClass={classes.dropdwonValues}
                  customDropdownSelectHeaderCusrom={classes.dropheader}
                  bordered
                />
              </Box>
            </Box>
            <Box className={classes.modalBottomArea}>
              <Button variant="secondaryGrey" onClick={handleClose}>
                No
              </Button>
              <Button variant="primary" onClick={handleConfirm} disabled={disabled}>
                Yes
              </Button>
            </Box>
          </Dialog>
        </Box>
      )}
    </>
  );
};

DealStages.propTypes = {
  data: PropTypes.object, // Adjust the type accordingly based on the expected data structure
  updateDealStage: PropTypes.func,
  fetchStageOptions: PropTypes.func,
  stages: PropTypes.array, // Adjust the type accordingly based on the expected data structure
  setStages: PropTypes.func,
  isNotClosed: PropTypes.bool,
  isLoading: PropTypes.bool,
  goToContractsAndTermsTab: PropTypes.func,
  handleOpenCloseDealModal: PropTypes.func,
};
export default DealStages;
