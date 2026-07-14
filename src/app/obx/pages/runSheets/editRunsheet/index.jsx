import { Box, Button, Step, StepLabel, Stepper, Tooltip, Typography } from '@mui/material';
import { ReactComponent as CheckIcon } from 'assets/svg/StepperCheckBox.svg?react';
import React, { useCallback, useEffect, useMemo, useReducer, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useParams } from 'react-router-dom/cjs/react-router-dom.min';
import DirectionsMap from 'src/app/components/common/directionsMap';
import LoaderComponent from 'src/app/components/common/loader';
import { ACL_OBX_RUNSHEET_UPDATE } from 'src/app/router/constant/OBXMODULE';
import { OBX_RUNSHEET } from 'src/app/router/constant/ROUTE';
import history from 'src/app/router/utils/history';
import { ReactComponent as FranchiseIcon } from 'src/assets/svg/FranchiseIcon.svg?react';
import { ReactComponent as HitsIcons } from 'src/assets/svg/HitsIcons.svg?react';
import { ReactComponent as SeeListIcon } from 'src/assets/svg/SeeListIcon.svg?react';
// import { ReactComponent as SiteIcon } from 'src/assets/svg/SiteIcon.svg';
import { ReactComponent as StartingPointIcon } from 'src/assets/svg/StartingPointIcon.svg?react';
import {
  isObjectEmpty,
  mapRunSheetData,
  updateLastItemWithUniqueId,
} from 'src/helper/utilityFunctions';
import { useTenantLabel } from 'src/helper/utilityHooks';
import RenderIfHasPermission from 'src/hoc/RenderIfHasPermission';
import {
  createRunSheetReducer,
  DELETED_HIT,
  runSheetInitialState,
  SET_ENTIRE_STATE,
  UPDATE_RUNSHEET_STATE,
} from 'src/redux/reducers/runSheetReducer';
import { getRunsheetDetails, updateRunsheet } from 'src/services/runsheet.services';
import {
  CONST_EDIT_RUNSHEET,
  CONST_RE_ORDER_HITS,
  CONST_RUNSHEET_SELECT_HITS,
  daysOfWeekWithVal,
  toastSettings,
} from 'src/utils/constants';
import { toaster } from 'src/utils/toast';

import formValidatorJoi from '../../../../../utils/formValidator/formValidator.requiredCheck';
import {
  // dayjsWithStandardOffset,
  getDayName,
  getStartEndTimeWithDesiredDate,
} from '../../schedules/helper';
import RunSheetDetailsTabs from '../components/runsheetDetailsTab';
import SelectHitsTab from '../components/selectHitsTab';
import { useStyles } from './details';
const defaultCenter = {
  lat: 40.7128,
  lng: -74.006,
};

const ActiveStepsKeys = {
  createRunsheet: {
    RUN_SHEET_DETAILS: 'Runsheet Details',
    HITS: CONST_RUNSHEET_SELECT_HITS,
    RE_ORDER_HITS: CONST_RE_ORDER_HITS,
  },
  editRunsheet: {
    RUN_SHEET_DETAILS: 'Runsheet Details',
    HITS: CONST_RUNSHEET_SELECT_HITS,
    RE_ORDER_HITS: CONST_RE_ORDER_HITS,
  },
};

const ActiveSteps = (pageKey) => [...Object.values(ActiveStepsKeys[pageKey])];

const steps = (t, getLabel) => ({
  createRunsheet: [
    {
      name: `${getLabel('terms', 'runsheet', t)} Details`,
      subtext: `Add information & select ${getLabel('terms', 'hits', t)}`,
      props: { hideMap: true },
    },

    {
      name: `Select ${getLabel('terms', 'hits', t)}`,
      subtext: `Choose ${getLabel('terms', 'runsheet', t)?.toLowerCase()} ${getLabel('terms', 'hits', t)}`,
      props: { onlyShowMarkers: true, enableHitHover: true },
    },
    {
      name: `Re-order ${getLabel('terms', 'hits', t)}`,
      subtext: `Add sequence of ${getLabel('terms', 'hits', t)?.toLowerCase()}`,
      props: { showApplyNow: true, drawOnlyLines: true },
    },
  ],
  editRunsheet: [
    {
      name: `${getLabel('terms', 'runsheet', t)} Details`,
      subtext: `Add information & select ${getLabel('terms', 'hits', t)?.toLowerCase()}`,
      props: { hideMap: true },
    },

    {
      name: `Select ${getLabel('terms', 'hits', t)}`,
      subtext: `Choose ${getLabel('terms', 'runsheet', t)?.toLowerCase()} ${getLabel('terms', 'hits', t)}`,
      props: { onlyShowMarkers: true, enableHitHover: true },
    },
    {
      name: `Re-order ${getLabel('terms', 'hits', t)}`,
      subtext: `Add sequence of ${getLabel('terms', 'hits', t)?.toLowerCase()}`,
      props: { showApplyNow: true, drawOnlyLines: true },
    },
  ],
});

const runSheetValidationKeys = {
  createRunsheet: {
    0: ['startsAt', 'endsAt', 'startDate', 'runsheetName'],
    1: ['startEndLocation', 'visitSet'],
    2: [],
  },
  editRunsheet: {
    0: ['startsAt', 'endsAt', 'runsheetName'],
    1: ['startEndLocation', 'visitSet'],
    2: [],
  },
};

const dayjsObjectList = { startsAt: true, endsAt: true, startDate: true };

const EditRunsheet = () => {
  const location = useLocation();
  const urlArray = location.pathname.split('/');
  // Extract the unique identifier
  const { t } = useTranslation();
  const [state, dispatch] = useReducer(createRunSheetReducer, runSheetInitialState);
  const [errorMessages, setErrorMessages] = useState({});
  const [expanded, setExpanded] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const lastSegment = urlArray[urlArray.length - 1];
  const classes = useStyles({ expanded });
  const activeTabKey = ActiveSteps(lastSegment)?.[activeStep];
  const [loading, setLoading] = useState(false);
  const [isSameDate, setIsSameDate] = useState(null);
  const [runsheetDetails, setRunsheetDetails] = useState(null);
  const { id } = useParams();
  const [openUnassignedHits, setOpenUnassignedHits] = useState(false);
  const [checked, setChecked] = useState(null);
  const { getLabel } = useTenantLabel();

  const getActiveFormComponent = useCallback(
    ({ key, ...otherProps }) => {
      let finalProps = {
        ...otherProps,
        activeStep: key,
        setIsSameDate,
        isSameDate,
        isEditRunsheet: true,
        checked,
        setChecked,
      };

      if ([ActiveStepsKeys?.[CONST_EDIT_RUNSHEET].HITS] == key) {
        finalProps = {
          ...finalProps,
          showStartEnd: true,
          showSearch: true,
          showSelectAll: true,
          showSelectionCheckBox: true,
          handleBack,
          openUnassignedHits,
          setOpenUnassignedHits,
        };
      }
      if ([ActiveStepsKeys?.[CONST_EDIT_RUNSHEET].RE_ORDER_HITS] == key) {
        finalProps = {
          ...finalProps,
          showStartEnd: false,
          showOrder: true,
          showDragAndDrop: true,
          showDelete: true,
        };
      }
      const components = {
        [CONST_EDIT_RUNSHEET]: {
          [ActiveStepsKeys?.[CONST_EDIT_RUNSHEET].RUN_SHEET_DETAILS]: (
            <RunSheetDetailsTabs {...finalProps} />
          ),
          [ActiveStepsKeys?.[CONST_EDIT_RUNSHEET].HITS]: <SelectHitsTab {...finalProps} />,
          [ActiveStepsKeys?.[CONST_EDIT_RUNSHEET].RE_ORDER_HITS]: <SelectHitsTab {...finalProps} />,
        },
      };
      return components?.[lastSegment]?.[key];
    },
    [activeTabKey, openUnassignedHits],
  );

  const toggleRightSide = () => {
    setExpanded(!expanded);
  };

  const totalSteps = () => {
    return steps(t, getLabel)?.[lastSegment]?.length;
  };

  const fetchRunsheetDetails = async () => {
    try {
      setLoading(true);
      const response = await getRunsheetDetails(id);
      if (response && response.statusCode === 200) {
        const dataForRunsheet = mapRunSheetData(response?.data || {});
        let data = {
          ...dataForRunsheet,
          // startDate: dayjsWithStandardOffset(response?.startsAt),
          // startsAt: dayjsWithStandardOffset(response?.startsAt),
          // endsAt: dayjsWithStandardOffset(response?.endsAt),
        };

        setRunsheetDetails(dataForRunsheet);
        dispatch({
          type: SET_ENTIRE_STATE,
          payload: data,
        });
      }
    } catch (error) {
      setRunsheetDetails(runSheetInitialState);
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!runsheetDetails) {
      fetchRunsheetDetails();
    }
  }, []);

  const setCoordinatesToMap = (data) => {
    dispatch({ type: UPDATE_RUNSHEET_STATE, payload: { key: 'pathData', value: data } });
  };

  const checkIfAllFieldsAreFilled = useMemo(
    () => (step) => {
      let result = false;
      const activeStepData = runSheetValidationKeys?.[lastSegment]?.[step];
      /** Step that doesnt need any validation */

      if (!activeStepData?.length && activeStep > step) {
        return true;
      }

      if (!activeStepData?.length && activeStep === step) {
        return false;
      }

      if (activeStepData?.length && activeStepData) {
        result = activeStepData.every((key) => {
          return !!state?.[key];
        });
      }

      return result;
    },
    [activeStep],
  );

  const handleNext = async () => {
    let propsToValidate = {};
    let error = null;
    setErrorMessages({});

    // set specific validator object for a each step
    runSheetValidationKeys?.[lastSegment]?.[activeStep]?.forEach((key) => {
      propsToValidate = {
        ...propsToValidate,
        [key]: dayjsObjectList?.[key]
          ? state?.[key]
            ? state?.[key]?.format
              ? state?.[key]?.format()
              : state?.[key]
            : state?.[key]
          : state?.[key],
      };
    });

    let errors = await formValidatorJoi(propsToValidate, t);
    if (Object.keys(errors)?.length) {
      setErrorMessages(errors);
      return;
    }
    // edit runsheet
    if (activeStep === totalSteps() - 1) {
      try {
        const updatedHitsIds = state?.visitSet?.map((hit) => hit?.hitId);
        const existingHits = runsheetDetails?.hits?.map((hit) => hit?.hitId);
        const addedHits = state?.visitSet?.filter((hit) => {
          if (!existingHits?.includes(hit?.hitId)) return hit;
        });
        const deletedHits = runsheetDetails?.hits?.filter((hit) => {
          if (!updatedHitsIds?.includes(hit?.hitId)) return hit;
        });

        const finalStartDate = getStartEndTimeWithDesiredDate(
          state?.startDate || state?.startsAt,
          state?.startsAt,
          state?.endsAt,
          null,
          true,
        );

        let payload = {
          startDate: finalStartDate?.startTime?.toISOString
            ? finalStartDate?.startTime?.toISOString()
            : finalStartDate?.startTime,
          startsAt: finalStartDate?.startTime?.toISOString
            ? finalStartDate?.startTime?.toISOString()
            : finalStartDate?.startTime,
          dutyDay: daysOfWeekWithVal(t).find(
            (data) =>
              data?.label ===
              getDayName(
                finalStartDate?.startTime.toISOString
                  ? finalStartDate?.startTime.toISOString()
                  : finalStartDate?.startTime,
                t,
              ),
          )?.value,
          endsAt: finalStartDate?.endTime?.toISOString
            ? finalStartDate?.endTime?.toISOString()
            : finalStartDate?.endTime,
        };

        if (JSON.stringify(state?.visitSet) !== JSON.stringify(runsheetDetails?.hits)) {
          payload.visitSet = state?.visitSet?.filter((hit) => hit?.status !== DELETED_HIT) || [];
          if (addedHits?.length) payload.addedHits = addedHits;
          if (deletedHits?.length) payload.removedHits = deletedHits;
          payload.pathData = state?.pathData;
          if (runsheetDetails?.startEndLocation?.id) {
            payload.pathData = updateLastItemWithUniqueId(
              state,
              runsheetDetails?.startEndLocation?.id,
            );
          }
        }

        if (state?.runsheetName !== runsheetDetails?.runsheetName) {
          payload.runsheetName = state?.runsheetName;
        }

        payload.startEndLocation = state?.startEndLocation && {
          address: state?.startEndLocation?.name || state?.startEndLocation?.address,
          lat: state?.startEndLocation?.position?.lat,
          lng: state?.startEndLocation?.position?.lng,
          id: runsheetDetails?.startEndLocation?.id,
        };

        // Adding new key in payload
        if (!isObjectEmpty(state?.breakRule)) {
          payload.breakRuleId = state?.breakRule?.id;
          payload.isBreakPayable = state?.isBreakPayable;
        }

        // Deleting keys if they are same
        if (runsheetDetails?.startDate === payload?.startDate) delete payload?.startDate;
        if (runsheetDetails?.startsAt === payload?.startsAt) delete payload?.startsAt;
        if (runsheetDetails?.endsAt === payload?.endsAt) delete payload?.endsAt;

        // Deleting extra keys
        delete payload.breakRule;
        delete payload.totalHits;

        // TO DO
        // Removing isBreakPayable for now because it is not implemented
        delete payload.isBreakPayable;

        payload.isVisitsUpdated = !!state?.isVisitsUpdated;

        setLoading(true);
        const res = await updateRunsheet(id, payload);
        if (res && res?.statusCode === 200) {
          toaster.success({
            text: res?.message,
            position: 'top-right',
            autoClose: toastSettings.AUTO_CLOSE,
          });
          history.push(`${OBX_RUNSHEET}/details/${id}`);
        }
      } catch (e) {
        error = true;
        toaster.error({
          text: e?.message,
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
      } finally {
        setLoading(false);
        setOpenUnassignedHits(false);
      }
    }

    const newActiveStep = activeStep + 1;
    !error && setActiveStep(newActiveStep);
    setChecked(null);
  };

  const handlePageBack = () => {
    history.push(`${OBX_RUNSHEET}/details/${id}`);
  };
  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const disableNextButton = () => {
    let disabled = false;
    for (const key of runSheetValidationKeys?.[lastSegment]?.[activeStep] || []) {
      if (Array.isArray(state?.[key]) && state?.[key].length === 0) {
        disabled = true;
        break;
      }
      if (typeof state[key] === 'string' && state[key].trim() === '') {
        disabled = true;
        break;
      }
      if (!state?.[key] || errorMessages?.[key]) {
        disabled = true;
        break;
      }
    }
    return disabled;
  };

  const mapProps = useMemo(() => {
    return steps(t, getLabel)?.[lastSegment]?.[activeStep]?.props;
  }, [steps, lastSegment, activeStep]);

  console.log({ state });

  return (
    <>
      {loading && <LoaderComponent />}
      {/** Edit Runsheet flow */}
      <Box className={classes.mainWrapper}>
        <Box className={classes.leftSide}>
          <Box className={classes.innerUpperWrapper}>
            <Box className={classes.stepperWrapper}>
              <Stepper activeStep={activeStep}>
                {steps(t, getLabel)?.[lastSegment]?.map((stepper, index) => {
                  const labelProps = {
                    onClick: () => {
                      // if (activeStep === index) return;
                      // setActiveStep(index);
                    },
                  };

                  // Add a conditional class for the active step
                  const isActiveStep = activeStep === index;
                  const stepClassName = isActiveStep ? classes.activeStepWrapper : '';
                  const showCheckIcon = checkIfAllFieldsAreFilled(index);
                  return (
                    <Step key={stepper.name} className={stepClassName}>
                      <Tooltip title={stepper.subtext} arrow>
                        <StepLabel {...labelProps}>
                          <Box className={classes.stepperHead}>
                            <Box className={classes.steperName}>
                              <Typography variant="subtitle2">{`${index + 1}. ${stepper.name}`}</Typography>
                              {showCheckIcon && <CheckIcon className={classes.stepperIcon} />}
                            </Box>
                            <Box className={classes.stepperText}>
                              <Typography variant="caption"> {`${stepper.subtext}`}</Typography>
                            </Box>
                          </Box>
                        </StepLabel>
                      </Tooltip>
                    </Step>
                  );
                })}
              </Stepper>
              <Box className={classes.stepContentWrapper}>
                <Box className={`${classes.stepTabContent}`}>
                  {getActiveFormComponent({
                    key: activeTabKey,
                    state,
                    dispatch,
                    errorMessages,
                    setErrorMessages,
                  })}
                </Box>
              </Box>
            </Box>
          </Box>
          <Box className={classes.bottomSticky}>
            <Box>
              {activeStep === 1 && !openUnassignedHits && (
                <Tooltip
                  title={t('obx.runsheet.addUnassignedHitsBtnTooltip')}
                  disableHoverListener={
                    state?.startEndLocation?.position?.lat && state?.startEndLocation?.position?.lng
                  }
                  arrow
                >
                  <Box>
                    <Button
                      disableRipple
                      variant="secondaryBlue"
                      onClick={() => setOpenUnassignedHits(true)}
                      disabled={
                        !state?.startEndLocation?.position?.lat ||
                        !state?.startEndLocation?.position?.lng
                      }
                    >
                      {t('obx.runsheet.addUnassignedHits', {
                        hits: getLabel('terms', 'hits', t)?.toLowerCase(),
                      })}
                    </Button>
                  </Box>
                </Tooltip>
              )}
            </Box>
            <Box className={classes.flexbtn}>
              {activeStep === 0 && (
                <Button onClick={handlePageBack} disableRipple variant="secondaryGrey">
                  {t('obx.runsheet.cancel')}
                </Button>
              )}
              {activeStep !== 0 && (
                <Button
                  disabled={activeStep === 0}
                  onClick={handleBack}
                  disableRipple
                  variant="secondaryGrey"
                >
                  {t('obx.runsheet.back')}
                </Button>
              )}

              <RenderIfHasPermission name={ACL_OBX_RUNSHEET_UPDATE}>
                <Button
                  onClick={handleNext}
                  disabled={disableNextButton()}
                  disableRipple
                  variant="primary"
                >
                  {activeStep === totalSteps() - 1
                    ? t('buttons.updateRunsheet', {
                        runsheet: getLabel('terms', 'runsheet', t)?.toLowerCase(),
                      })
                    : 'Next'}
                </Button>
              </RenderIfHasPermission>
            </Box>
          </Box>
        </Box>

        <Box className={classes.rightSide}>
          <Button
            disableRipple
            className={classes.toggleButton}
            startIcon={<SeeListIcon className={classes.iconRotate} />}
            variant="onlyText"
            onClick={toggleRightSide}
          >
            {expanded && t('obx.runsheet.SeeList')}
          </Button>

          <Box className={classes.mapArea}>
            <DirectionsMap
              waypoints={state?.visitSet || []}
              origin={state?.startEndLocation || {}}
              center={
                state?.startEndLocation?.position
                  ? state?.startEndLocation?.position
                  : defaultCenter
              }
              mapPlaceholder={t('obx.runsheet.selectMap', {
                runsheets: getLabel('terms', 'runsheets', t)?.toLowerCase(),
              })}
              destination={state?.startEndLocation || {}}
              setCoordinates={setCoordinatesToMap}
              enableHitHover={true}
              errorCallback={() => {
                activeStep && handleBack();
              }}
              {...mapProps}
            />
          </Box>
          {activeStep ? (
            <Box className={classes.bottomArea}>
              <Button disableRipple startIcon={<HitsIcons />} variant="onlyText">
                {getLabel('terms', 'hit', t)}
              </Button>
              <Button disableRipple startIcon={<StartingPointIcon />} variant="onlyText">
                {t('obx.runsheet.startingEndingPoint')}
              </Button>
              <Button disableRipple startIcon={<FranchiseIcon />} variant="onlyText">
                {t('obx.runsheet.franchise')}
              </Button>
            </Box>
          ) : null}
        </Box>
      </Box>
    </>
  );
};

export default EditRunsheet;
