import { Box, Button, Chip, Step, StepLabel, Stepper, Tooltip, Typography } from '@mui/material';
import { ReactComponent as CheckIcon } from 'assets/svg/StepperCheckBox.svg?react';
import dayjs from 'dayjs';
import React, { useCallback, useEffect, useMemo, useReducer, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom/cjs/react-router-dom.min';
import DirectionsMap from 'src/app/components/common/directionsMap';
import SplitDirectionsMap from 'src/app/components/common/directionsMap/splitRunSheetMap';
import LoaderComponent from 'src/app/components/common/loader';
import SweetAlertModal from 'src/app/components/common/sweetAlertModal';
import { ACL_OBX_RUNSHEET_CREATE } from 'src/app/router/constant/OBXMODULE';
import { OBX_RUNSHEET, OBX_SCHEDULES } from 'src/app/router/constant/ROUTE';
import history from 'src/app/router/utils/history';
import { WarningIcon } from 'src/assets/svg';
import { ReactComponent as BackIcon } from 'src/assets/svg/BlackBackIcon.svg?react';
import { ReactComponent as CreateHitIcon } from 'src/assets/svg/CreateHitIcon.svg?react';
import { ReactComponent as FranchiseIcon } from 'src/assets/svg/FranchiseIcon.svg?react';
import { ReactComponent as HitsIcons } from 'src/assets/svg/HitsIcons.svg?react';
import { ReactComponent as SeeListIcon } from 'src/assets/svg/SeeListIcon.svg?react';
// import { ReactComponent as SiteIcon } from 'src/assets/svg/SiteIcon.svg';
import { ReactComponent as StartingPointIcon } from 'src/assets/svg/StartingPointIcon.svg?react';
import {
  calculateAndDisplayRouteUtils,
  createUniqueHash,
  decode,
  isObjectEmpty,
  mapRunSheetData,
  updateLastItemWithUniqueId,
} from 'src/helper/utilityFunctions';
import { useTenantLabel } from 'src/helper/utilityHooks';
import RenderIfHasPermission from 'src/hoc/RenderIfHasPermission';
import useDateTime from 'src/hooks/useDateTime';
import {
  createRunSheetReducer,
  runSheetInitialState,
  SET_ENTIRE_STATE,
  UPDATE_RUNSHEET_STATE,
} from 'src/redux/reducers/runSheetReducer';
import {
  createRunSheet,
  getSplitRunsheetDetails,
  splitRunSheet,
} from 'src/services/runsheet.services';
import {
  CONST_CREATE_RUNSHEET,
  CONST_RE_ORDER_HITS,
  CONST_RUNSHEET_SELECT_HITS,
  CONST_SPLIT_RUNSHEET,
  CONST_SPLIT_RUNSHEET_ASSIGN_OFFICER,
  dayjsFormatsEnum,
  daysOfWeekWithVal,
  toastSettings,
} from 'src/utils/constants';
import { toaster } from 'src/utils/toast';

import formValidatorJoi from '../../../../../utils/formValidator/formValidator.requiredCheck';
import {
  dayjsWithStandardOffset,
  getCurrentStandardTimeInIsoWrtTimezone,
  getDayName,
  getEmbededDateAndTimeWRTStandardOffset,
  getStartEndTimeWithDesiredDate,
} from '../../schedules/helper';
import { getStartEndTimeForValidation } from '../../sites/detail/components/jobs/splitJobSideDrawer';
import AssignRunsheetTab from '../components/assignRunsheetTab';
import MapBottomButton from '../components/mapBottomButton';
import RunSheetDetailsTabs from '../components/runsheetDetailsTab';
import SelectHitsTab from '../components/selectHitsTab';
import SplitRunSheetHits from '../components/splitRunSheet/hits/hits.jsx';
import SplitReOrderHits from '../components/splitRunSheet/reOrder/index.jsx';
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
  splitRunSheet: {
    SPLIT_RUN_SHEET_PAGE_ONE: 'Hits',
    CONST_RE_ORDER_HITS: CONST_RE_ORDER_HITS,
    CONST_SPLIT_RUNSHEET_ASSIGN_OFFICER: CONST_SPLIT_RUNSHEET_ASSIGN_OFFICER,
  },
};

const ActiveSteps = (pageKey) => [...Object.values(ActiveStepsKeys[pageKey])];
const steps = (t, getLabel) => ({
  createRunsheet: [
    {
      name: t('obx.runsheet.runsheetDetails', {
        runsheet: getLabel('terms', 'runsheet', t),
      }),
      subtext: t('obx.runsheet.runsheetDetailsSubtext', {
        hits: getLabel('terms', 'hits', t)?.toLowerCase(),
      }),
      props: { hideMap: true },
    },

    {
      name: t('obx.runsheet.selectHits', {
        hits: getLabel('terms', 'hits', t),
      }),
      subtext: t('obx.runsheet.selectHitsSubtext', {
        runsheet: getLabel('terms', 'runsheet', t)?.toLowerCase(),
        hits: getLabel('terms', 'hits', t)?.toLowerCase(),
      }),
      props: { onlyShowMarkers: true, enableHitHover: true },
    },
    {
      name: t('obx.runsheet.reorderHits', {
        hits: getLabel('terms', 'hits', t),
      }),
      subtext: t('obx.runsheet.reorderHitsSubtext', {
        hits: getLabel('terms', 'hits', t)?.toLowerCase(),
      }),
      props: { showApplyNow: true, drawOnlyLines: true },
    },
  ],
  splitRunSheet: [
    {
      name: t('obx.runsheet.hits', {
        hits: getLabel('terms', 'hits', t),
      }),
      subtext: t('obx.runsheet.hitsSubtext', {
        hits: getLabel('terms', 'hits', t)?.toLowerCase(),
      }),
      props: { hideMap: false },
    },
    {
      name: t('obx.runsheet.reorderHits', {
        hits: getLabel('terms', 'hits', t),
      }),
      subtext: t('obx.runsheet.reorderHitsSubtext', {
        hits: getLabel('terms', 'hits', t)?.toLowerCase(),
      }),
      props: { onlyShowMarkers: true },
    },
    {
      name: t('obx.runsheet.assign'),
      subtext: t('obx.runsheet.assignSubtext', {
        runsheet: getLabel('terms', 'runsheet', t)?.toLowerCase(),
      }),
      props: { showApplyNow: true, drawOnlyLines: true },
    },
  ],
});

const runSheetValidationKeys = {
  createRunsheet: {
    0: ['startsAt', 'endsAt', 'startDate', 'runsheetName'],
    1: [],
    2: [],
  },
  splitRunSheet: {
    0: ['startEndLocation', 'visitSet', 'parentEndsAt', 'startsAt', 'endsAt'],
    1: [],
    2: [],
  },
};

const dayjsObjectList = { startsAt: true, endsAt: true, startDate: true };

const RunsheetDetail = () => {
  const [isSplitRunsheet, _setSplitRunsheet] = useState(() => {
    if (window.location.href.indexOf('splitRunSheet') > -1) {
      return true;
    }
    return false;
  });
  const location = useLocation();
  const urlArray = location.pathname.split('/');
  // Extract the unique identifier
  const runSheetId = urlArray[urlArray.length - 2];
  const { t } = useTranslation();
  const [applyOnMap, setaApplyOnMap] = useState(false);
  const [state, dispatch] = useReducer(createRunSheetReducer, runSheetInitialState);
  const [errorMessages, setErrorMessages] = useState({});
  const [expanded, setExpanded] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const lastSegment = urlArray[urlArray.length - 1];
  const { search } = useLocation();
  const classes = useStyles({ expanded });
  const activeTabKey = ActiveSteps(lastSegment)?.[activeStep];
  const [loading, setLoading] = useState(false);
  const [isSameDate, setIsSameDate] = useState(null);
  const [runSheetDetails, setRunsheetDetails] = useState(null);
  const [showSplitRunSheetModal, setShowSplitRunSheetModal] = useState(false);
  const [checked, setChecked] = useState(null);
  const { formatDayjsDateTime } = useDateTime();
  const { getLabel } = useTenantLabel();
  const franchiseCenter = useSelector((state) => {
    const franchiseInfo = state?.auth?.franchiseInfo;
    return { lat: parseFloat(franchiseInfo?.lat), lng: parseFloat(franchiseInfo?.lng) };
  });

  const getActiveFormComponent = useCallback(
    ({ key, ...otherProps }) => {
      let finalProps = {
        ...otherProps,
        activeStep: key,
        setIsSameDate,
        isSameDate,
        checked,
        setChecked,
      };

      if ([ActiveStepsKeys?.[CONST_CREATE_RUNSHEET].HITS] == key) {
        finalProps = {
          ...finalProps,
          showStartEnd: true,
          showSearch: true,
          showSelectAll: true,
          showSelectionCheckBox: true,
          handleBack,
        };
      }
      if ([ActiveStepsKeys?.[CONST_CREATE_RUNSHEET].RE_ORDER_HITS] == key) {
        finalProps = {
          ...finalProps,
          showStartEnd: false,
          showOrder: true,
          showDragAndDrop: true,
          showDelete: true,
        };
      }
      if (ActiveStepsKeys?.[CONST_SPLIT_RUNSHEET].SPLIT_RUN_SHEET_PAGE_ONE == key) {
        finalProps = {
          ...finalProps,
          showSelectionCheckBox: !!isSplitRunsheet,
          splitRunSheet: true,
          isFutureSplit: !!state?.isFutureShift,
        };
      }
      if (ActiveStepsKeys?.[CONST_SPLIT_RUNSHEET].CONST_RE_ORDER_HITS == key) {
        finalProps = {
          ...finalProps,
          showStartEnd: false,
          showOrder: true,
          showDragAndDrop: true,
          showDelete: true,
        };
      }
      if (ActiveStepsKeys?.[CONST_SPLIT_RUNSHEET].CONST_SPLIT_RUNSHEET_ASSIGN_OFFICER == key) {
        finalProps = {
          ...finalProps,
          isSplitRunsheet: true,
        };
      }
      const components = {
        [CONST_CREATE_RUNSHEET]: {
          [ActiveStepsKeys?.[CONST_CREATE_RUNSHEET].RUN_SHEET_DETAILS]: (
            <RunSheetDetailsTabs {...finalProps} />
          ),
          [ActiveStepsKeys?.[CONST_CREATE_RUNSHEET].HITS]: <SelectHitsTab {...finalProps} />,
          [ActiveStepsKeys?.[CONST_CREATE_RUNSHEET].RE_ORDER_HITS]: (
            <SelectHitsTab {...finalProps} />
          ),
        },
        [CONST_SPLIT_RUNSHEET]: {
          [ActiveStepsKeys?.[CONST_SPLIT_RUNSHEET].SPLIT_RUN_SHEET_PAGE_ONE]: (
            <SplitRunSheetHits {...finalProps} />
          ),
          [ActiveStepsKeys?.[CONST_SPLIT_RUNSHEET].CONST_RE_ORDER_HITS]: (
            <SplitReOrderHits {...finalProps} />
          ),
          [ActiveStepsKeys?.[CONST_SPLIT_RUNSHEET].CONST_SPLIT_RUNSHEET_ASSIGN_OFFICER]: (
            <AssignRunsheetTab {...finalProps} />
          ),
        },
      };
      return components?.[lastSegment]?.[key];
    },
    [activeTabKey, checked],
  );

  const toggleRightSide = () => {
    setExpanded(!expanded);
  };

  const totalSteps = () => {
    return steps(t, getLabel)?.[lastSegment]?.length;
  };

  const fetchRunsheetDetails = async () => {
    const query = new URLSearchParams(search);
    const startsAt = query.get('startsAt');
    const endsAt = query.get('endsAt');
    const shiftActivityLogId = query.get('shiftActivityLogId');
    try {
      if (!startsAt || !endsAt) {
        throw new Error('Invalid startsAt or endsAt');
      }
      setLoading(true);
      const response = await getSplitRunsheetDetails(runSheetId, {
        startsAt,
        endsAt,
        shiftActivityLogId,
        forSplit: true,
      });
      if (response && response.statusCode === 200) {
        const isFutureShift =
          getCurrentStandardTimeInIsoWrtTimezone() < response?.data?.runsheetDetails?.startsAt;
        const updateHitsData = response?.data?.runsheetDetails?.hits?.filter((item) => {
          return !item?.isMoved && !item?.isDisabled && !item?.isCancelled && !item?.isInactive;
        });

        let dataForSplit = {
          ...response?.data?.runsheetDetails,
          pathData: response?.data?.pathData,
          shiftDays: response?.data?.shiftDays,
          shiftActivityLogId: response?.data?.shiftActivityLogId,
          hits: updateHitsData,
          noOfHits: updateHitsData.length,
          // vehicleId: response?.data?.vehicle,
          // officerId: response?.data?.officer,
        };

        const splitBoundaryIso = isFutureShift
          ? dayjs(dataForSplit?.startsAt).add(1, 'minute').toISOString()
          : getCurrentStandardTimeInIsoWrtTimezone();

        let dataForRunsheet = mapRunSheetData(dataForSplit || {});
        let data = {
          ...dataForRunsheet,
          startDate: dataForSplit?.startsAt,
          startsAt: splitBoundaryIso,
          parentStartsAt: dataForSplit?.startsAt,
          parentStartDate: dataForSplit?.startsAt,
          parentEndsAt: splitBoundaryIso,
          endsAt: dataForSplit?.endsAt,
          startEndLocation: null,
          visitSet: [],
          isFutureShift,
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
    if (isSplitRunsheet && !runSheetDetails) {
      fetchRunsheetDetails();
    }
  }, [isSplitRunsheet, state?.visitSet]);
  useEffect(() => {
    if (isSplitRunsheet && !isObjectEmpty(state?.startEndLocation)) {
      setaApplyOnMap(false);
      dispatch({ type: UPDATE_RUNSHEET_STATE, payload: { key: 'splittedPathData', value: [] } });
    }
  }, [state?.visitSet, state?.startEndLocation]);

  useEffect(() => {
    let errors = {};
    setErrorMessages({});
    // validation on split runsheet first step
    if (activeStep === 0 && isSplitRunsheet && runSheetDetails?.startsAt) {
      const dateForValidation = dayjs('2024-01-01');
      const fixedParentRunsheetStartTime = runSheetDetails?.startsAt || runSheetDetails?.startDate;
      const fixedParentRunsheetEndTime = runSheetDetails?.endsAt;
      const selectedParentRunsheetEndTime = state?.parentEndsAt || null;

      // NOTE: PARENT RUNSHEET VALIDATION
      // Getting minimum and maximum date ranges with the boolean that end time is on next day or not
      const {
        startTime: minimumParentRunsheetStartTime,
        endTime: maximumParentRunsheetEndTime,
        isEndTimeOnNextDateWrtStandardTime,
      } = getStartEndTimeWithDesiredDate(
        dateForValidation,
        fixedParentRunsheetStartTime,
        fixedParentRunsheetEndTime,
        null,
        true,
      );

      // Getting the modified datetime with the dateForValidation preset applied
      const { startTime: modifiedEndTimeWrtPreset, endTime: _finalPRSEndTIme } =
        getStartEndTimeForValidation({
          selectedStartTime: selectedParentRunsheetEndTime,
          selectedEndTime: fixedParentRunsheetEndTime,
          isEndTimeOnNextDateWrtStandardTime,
          shiftStartTime: minimumParentRunsheetStartTime,
        });

      let presetParentEndTimeWhenTimeNotUpdated = modifiedEndTimeWrtPreset;
      // if the endtime was not updated for parent runsheet
      if (modifiedEndTimeWrtPreset === minimumParentRunsheetStartTime) {
        presetParentEndTimeWhenTimeNotUpdated = dayjs(modifiedEndTimeWrtPreset)
          .add(1, 'day')
          .toISOString();
      }

      // Getting current time
      const now = dayjs().format('HH:mm:ss');
      // Applying preset for keeping the baseline
      let _currentDateWrtPreset = dayjs(`2024-01-01 ${now}`).toISOString();
      if (presetParentEndTimeWhenTimeNotUpdated > maximumParentRunsheetEndTime) {
        errors = {
          ...errors,
          parentEndsAt: "End Time can't be greater than parent runSheet's end time",
        };
      }

      // Setting error message if modified hour is less than min range
      if (
        !state?.isFutureShift &&
        presetParentEndTimeWhenTimeNotUpdated < minimumParentRunsheetStartTime
      ) {
        errors = {
          ...errors,
          parentEndsAt:
            'End time should be greater than parent runsheet’s start time and current time.',
        };
      }

      // NOTE: RUNSHEET VALIDATION
      //calcualation for parent endtime and current time
      let currentTimeInstance = getCurrentStandardTimeInIsoWrtTimezone();
      console.log({ currentTimeInstance });
      const {
        startTime: startRangeForParentRSEndTime,
        endTime: _endRangeForParentRSEndTime,
        isEndTimeOnNextDateWrtStandardTime: isEndTimeOnNextDateWrtStandardTimeParentEndTime,
      } = getStartEndTimeWithDesiredDate(
        dateForValidation,
        runSheetDetails?.startsAt,
        runSheetDetails?.endsAt,
        null,
        true,
      );
      let currentIsOnSecondday =
        isEndTimeOnNextDateWrtStandardTimeParentEndTime &&
        dayjsWithStandardOffset().isAfter(dayjsWithStandardOffset(runSheetDetails.startsAt), 'day');
      // Current time in franchise timezone on validation date (not browser local time)
      const validationDateForNow = currentIsOnSecondday
        ? dayjs(dateForValidation).add(1, 'day')
        : dateForValidation;
      const parentEndTimeSecondVal = getEmbededDateAndTimeWRTStandardOffset(
        getCurrentStandardTimeInIsoWrtTimezone(),
        validationDateForNow,
      ).toISOString();
      const { startTime: _finalParentEndTimeFirstVal, endTime: finalParentEndTimeSecondVal } =
        getStartEndTimeForValidation({
          selectedStartTime: runSheetDetails?.startsAt, //picker start time
          selectedEndTime: state?.parentEndsAt,
          isEndTimeOnNextDateWrtStandardTime: isEndTimeOnNextDateWrtStandardTimeParentEndTime,
          shiftStartTime: startRangeForParentRSEndTime,
        });

      if (!state?.isFutureShift && finalParentEndTimeSecondVal < parentEndTimeSecondVal) {
        errors = { ...errors, parentEndsAt: 'End time cannot be in the past.' };
      }

      // NOTE: NEW RUNSHEET VALIDATION
      const selectedNewRunsheetEndTime = state?.endsAt;
      const selectedNewRunsheetStartTime = state?.startsAt;
      const fixedNewRunsheetEndTime = runSheetDetails?.endsAt;

      // Getting the modified datetime with the dateForValidation preset applied
      const { startTime: modifiedNewRunsheetStartTimeWrtPreset } = getStartEndTimeForValidation({
        selectedStartTime: selectedNewRunsheetStartTime,
        selectedEndTime: runSheetDetails?.endsAt,
        isEndTimeOnNextDateWrtStandardTime,
        shiftStartTime: minimumParentRunsheetStartTime,
      });

      // Getting the modified datetime with the dateForValidation preset applied
      const { startTime: _modifiedNewRunsheetEndTimeWrtPreset } = getStartEndTimeForValidation({
        selectedStartTime: selectedNewRunsheetEndTime,
        selectedEndTime: fixedNewRunsheetEndTime,
        isEndTimeOnNextDateWrtStandardTime,
        shiftStartTime: minimumParentRunsheetStartTime,
      });

      if (
        modifiedNewRunsheetStartTimeWrtPreset < minimumParentRunsheetStartTime ||
        modifiedNewRunsheetStartTimeWrtPreset > maximumParentRunsheetEndTime
      ) {
        errors = {
          ...errors,
          startsAt: 'Start time should be in between the parent runsheet time',
        };
      }

      // End of Split 1 must equal Start of Split 2 (no gaps/overlaps). Compare time-of-day in
      // franchise standard time so cross-day runsheets and time pickers with mismatched dates still validate.
      const parentSplitEndNorm = dayjsWithStandardOffset(state?.parentEndsAt);
      const childSplitStartNorm = dayjsWithStandardOffset(state?.startsAt);
      const splitBoundaryEqual =
        parentSplitEndNorm.isValid() &&
        childSplitStartNorm.isValid() &&
        parentSplitEndNorm.hour() === childSplitStartNorm.hour() &&
        parentSplitEndNorm.minute() === childSplitStartNorm.minute();
      if (parentSplitEndNorm.isValid() && childSplitStartNorm.isValid() && !splitBoundaryEqual) {
        errors = {
          ...errors,
          parentEndsAt: t('obx.runsheet.shift1EndMustEqualShift2Start'),
          startsAt: t('obx.runsheet.shift1EndMustEqualShift2Start'),
        };
      }

      //calculation for start time is behind current time
      const { startTime: finalChildStartTimeFirstVal, endTime: _finalChildStartTimeSecondVal } =
        getStartEndTimeForValidation({
          selectedStartTime: state?.startsAt, //picker start time
          selectedEndTime: runSheetDetails?.endsAt,
          isEndTimeOnNextDateWrtStandardTime: isEndTimeOnNextDateWrtStandardTimeParentEndTime,
          shiftStartTime: startRangeForParentRSEndTime,
        });

      // Setting error message if the end time is less than the current time
      if (!state?.isFutureShift && finalChildStartTimeFirstVal < parentEndTimeSecondVal) {
        errors = {
          ...errors,
          startsAt: 'Start time cannot be earlier than the parent runsheet start time',
        };
      }

      if (!state?.isFutureShift && finalChildStartTimeFirstVal < parentEndTimeSecondVal) {
        errors = {
          ...errors,
          startsAt: 'Start time can not be in the past.',
        };
      }

      // Setting error message if the start time is earlier than the parent runsheet start time
      // if (modifiedNewRunsheetEndTimeWrtPreset > maximumParentRunsheetEndTime) {
      //   errors = {
      //     ...errors,
      //     endsAt: 'End time should be less than parent runsheet’s end time',
      //   };
      // }

      // Setting error message if the new runsheet start time is later than the new runsheet end time
      if (runSheetDetails?.startsAt === state?.startsAt) {
        errors = {
          ...errors,
          startsAt: t('obx.runsheet.startCantBeSame', {
            runsheet: getLabel('terms', 'runsheet', t)?.toLowerCase(),
          }),
        };
      }

      const { startTime: _finalChildEndTimeFirstVal, endTime: _currentTime } =
        getStartEndTimeForValidation({
          selectedStartTime: currentTimeInstance, //picker start time
          selectedEndTime: state?.endsAt,
          isEndTimeOnNextDateWrtStandardTimeParentEndTime,
          shiftStartTime: _endRangeForParentRSEndTime,
        });

      if (Object.keys(errors)?.length > 0) {
        setErrorMessages(errors);
        return;
      }

      // Starts At: Adding one day if the date is on next day

      // const calculatedStartsAt = dayjs(state?.startsAt)?.toISOString();

      const { isEndTimeOnNextDateWrtStandardTime: endsOnNextDay } = getStartEndTimeWithDesiredDate(
        dateForValidation,
        state?.startsAt,
        state?.endsAt,
        null,
        true,
      );

      console.log({ endsOnNextDay });
      const { isEndTimeOnNextDateWrtStandardTime: startsOnNextDay } =
        getStartEndTimeWithDesiredDate(
          dateForValidation,
          state?.parentStartsAt,
          state?.startsAt,
          null,
          true,
        );

      const calculatedStartsAt = startsOnNextDay
        ? dayjs(state?.startsAt)?.add(1, 'day')?.toISOString()
        : dayjs(state?.startsAt)?.toISOString();

      const startPickerDate = dayjsWithStandardOffset(calculatedStartsAt).format('YYYY-MM-DD');

      //   ?.toISOString();
      let _calculatedEndsAt = getEmbededDateAndTimeWRTStandardOffset(
        state?.endsAt,
        startPickerDate,
      ).toISOString();

      let _calculatedEndsAt1 = endsOnNextDay
        ? dayjs(_calculatedEndsAt).add(1, 'day')
        : dayjs(_calculatedEndsAt);

      const {
        // isEndTimeOnNextDateWrtStandardTime: parentOnNextDay,
        endTime: calculatedParentEndsAt,
      } = getStartEndTimeWithDesiredDate(
        dayjsWithStandardOffset(runSheetDetails?.startsAt)?.format('YYYY-MM-DD'),
        runSheetDetails?.startsAt,
        state?.parentEndsAt,
        null,
        true,
      );

      // const calculatedParentEndsAt =
      //   parentOnNextDay &&
      //     ? dayjs(state?.parentEndsAt)?.add(1, 'day')?.toISOString()
      //     : dayjs(state?.parentEndsAt)?.toISOString();

      console.log({
        endsAt: _calculatedEndsAt1.toISOString(),
        startsAt: calculatedStartsAt,
        parentEndsAt: calculatedParentEndsAt,
      });
      dispatch({
        type: UPDATE_RUNSHEET_STATE,
        payload: {
          key: 'tempNewRunsheetDates',
          value: {
            endsAt: _calculatedEndsAt1.toISOString(),
            startsAt: calculatedStartsAt,
            parentEndsAt: calculatedParentEndsAt,
            // adjustDateIfMoreThanTwoDaysApart(
            //   runSheetDetails?.startsAt,
            //   dayjs(state?.parentEndsAt).toISOString(),
            // ),
          },
        },
      });
      // const { isEndTimeOnNextDateWrtStandardTime: endsOnNextDay } = getStartEndTimeWithDesiredDate(
      //   dateForValidation,
      //   state?.startsAt,
      //   state?.endsAt,
      //   null,
      //   true,
      // );

      // const _calculatedEndsAt = endsOnNextDay
      //   ? dayjs(state?.endsAt)?.add(1, 'day')?.toISOString()
      //   : dayjs(state?.endsAt)?.toISOString();

      // // Starts At: Adding one day if the date is on next day

      // const { isEndTimeOnNextDateWrtStandardTime: startsOnNextDay } =
      //   getStartEndTimeWithDesiredDate(
      //     dateForValidation,
      //     state?.parentStartsAt,
      //     state?.startsAt,
      //     null,
      //     false,
      //   );

      // // const calculatedStartsAt = dayjs(state?.startsAt)?.toISOString();
      // const calculatedStartsAt = startsOnNextDay
      //   ? dayjs(state?.startsAt)?.add(1, 'day')?.toISOString()
      //   : dayjs(state?.startsAt)?.toISOString();

      // const { isEndTimeOnNextDateWrtStandardTime: parentOnNextDay } =
      //   getStartEndTimeWithDesiredDate(
      //     dateForValidation,
      //     runSheetDetails?.startsAt,
      //     state?.parentEndsAt,
      //     null,
      //     true,
      //   );

      // const calculatedParentEndsAt = parentOnNextDay
      //   ? dayjs(state?.parentEndsAt)?.add(1, 'day')?.toISOString()
      //   : dayjs(state?.parentEndsAt)?.toISOString();

      // // Adding a temporary object in state for using it in API calls in stepper 3
      // dispatch({
      //   type: UPDATE_RUNSHEET_STATE,
      //   payload: {
      //     key: 'tempNewRunsheetDates',
      //     value: {
      //       endsAt: _calculatedEndsAt,
      //       startsAt: calculatedStartsAt,
      //       parentEndsAt: calculatedParentEndsAt,
      //     },
      //   },
      // });
    }

    // }, []);
  }, [state?.startsAt, state?.endsAt, state?.parentEndsAt]);

  const setCoordinatesToMap = (data) => {
    dispatch({ type: UPDATE_RUNSHEET_STATE, payload: { key: 'pathData', value: data } });
  };

  const setCoordinatesToMapForSplitRunSheet = (data) => {
    dispatch({ type: UPDATE_RUNSHEET_STATE, payload: { key: 'splittedPathData', value: data } });
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

  const _getDateBySplitting = (date) => {
    return date.split('T')?.[0];
  };

  const hasHitsWithoutStartEndLocation = () =>
    activeStep === 1 && state?.visitSet?.length && !state?.startEndLocation;

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

    // Validation that the start end location exists if hit is selected
    if (hasHitsWithoutStartEndLocation()) return false;

    let errors = await formValidatorJoi(propsToValidate, t);
    if (Object.keys(errors)?.length) {
      setErrorMessages(errors);
      return;
    }
    // create runsheet
    if (activeStep === totalSteps() - 1 && !isSplitRunsheet) {
      try {
        const finalStartDate = getStartEndTimeWithDesiredDate(
          state?.startDate,
          state?.startsAt,
          state?.endsAt,
          null,
          true,
        );
        let uniqueUUID = createUniqueHash();

        let updatedPathData = updateLastItemWithUniqueId(state, uniqueUUID);

        let payload = {
          ...state,
          runSheetName: state?.runsheetName.trim(),
          startDate: state?.startDate,
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
          pathData: updatedPathData,
          startEndLocation: {
            lat: state?.startEndLocation?.position?.lat,
            lng: state?.startEndLocation?.position?.lng,
            address: state?.startEndLocation?.name,
            id: uniqueUUID,
          },
          endsAt: finalStartDate?.endTime?.toISOString
            ? finalStartDate?.endTime?.toISOString()
            : finalStartDate?.endTime,
        };

        // Adding new key in payload
        if (!isObjectEmpty(state?.breakRule)) payload.breakRuleId = state?.breakRule?.id;

        // TO DO
        // Removing isBreakPayable for now because it is not implemented
        delete payload.isBreakPayable;

        // Deleting extra keys
        delete payload.breakRule;
        delete payload.totalHits;

        setLoading(true);
        const res = await createRunSheet(payload);
        if (res?.statusCode === 200) {
          toaster.success({
            text: res?.message,
            position: 'top-right',
            autoClose: toastSettings.AUTO_CLOSE,
          });
          history.push(`${OBX_RUNSHEET}`);
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
      }
    }

    //  splitting runsheet
    if (activeStep === totalSteps() - 1 && isSplitRunsheet) {
      try {
        setLoading(true);

        const dateForValidation = dayjs('2024-01-01');
        const fixedParentRunsheetStartTime =
          runSheetDetails?.startsAt || runSheetDetails?.startDate;
        const fixedParentRunsheetEndTime = runSheetDetails?.endsAt;
        const selectedParentRunsheetEndTime = state?.parentEndsAt || null;

        // Getting minimum and maximum date ranges with the boolean that end time is on next day or not
        const { startTime: minimumParentRunsheetStartTime, isEndTimeOnNextDateWrtStandardTime } =
          getStartEndTimeWithDesiredDate(
            dateForValidation,
            fixedParentRunsheetStartTime,
            fixedParentRunsheetEndTime,
            null,
            true,
          );

        // Getting the modified datetime with the dateForValidation preset applied
        const { startTime: _modifiedEndTimeWrtPreset, endTime: _finalPRSEndTIme } =
          getStartEndTimeForValidation({
            selectedStartTime: selectedParentRunsheetEndTime,
            selectedEndTime: fixedParentRunsheetEndTime,
            isEndTimeOnNextDateWrtStandardTime,
            shiftStartTime: minimumParentRunsheetStartTime,
          });

        const _finalStartDate = getStartEndTimeWithDesiredDate(
          state?.startDate,
          state?.startsAt,
          state?.endsAt,
          null,
          true,
        );

        let finalpayload = {};
        let updatedNewPathData = state?.splittedPathData;
        let newRunSheetUUID = createUniqueHash();

        // set the id of startEndLocation to the last pathData hitid
        updatedNewPathData = updateLastItemWithUniqueId(
          { pathData: updatedNewPathData },
          newRunSheetUUID,
        );

        // const { isEndTimeOnNextDateWrtStandardTime: isChildEndTimeOnNextDay } =
        //   getStartEndTimeWithDesiredDate(
        //     dateForValidation,
        //     runSheetDetails?.startsAt,
        //     state?.parentEndsAt,
        //   );

        // // if old parent values move to new day
        // const { isEndTimeOnNextDateWrtStandardTime: isDefaultChildDatesOnNext } =
        //   getStartEndTimeWithDesiredDate(
        //     dateForValidation,
        //     runSheetDetails?.startsAt,
        //     runSheetDetails?.endsAt,
        //   );

        // make new runsheet object
        finalpayload.newRunsheet = {
          endsAt: state?.tempNewRunsheetDates?.endsAt,
          startsAt: state?.tempNewRunsheetDates?.startsAt,
          startDate: state?.tempNewRunsheetDates?.startsAt,
          startEndLocation: {
            lat: state?.startEndLocation?.position?.lat,
            lng: state?.startEndLocation?.position?.lng,
            address: state?.startEndLocation?.name,
            id: newRunSheetUUID,
          },

          runSheetName: `${runSheetDetails.runsheetName} - SPLITTED`,
          pathData: updatedNewPathData,
          visitSet: state?.visitSet,
        };
        if (state?.officerId?.id) {
          finalpayload.newRunsheet.officerId = state?.officerId?.id;
        }
        if (state?.vehicleId?.id) {
          finalpayload.newRunsheet.vehicleId = state?.vehicleId?.id;
        }
        // get new runsheet ids
        finalpayload.splittedHits = state?.visitSet?.map((visit) => visit?.hitId);

        let OldRunSheetData = JSON.parse(JSON.stringify(runSheetDetails));

        let oldRunSheetHits =
          state?.parentVisitSet?.length > 0
            ? state.parentVisitSet
            : OldRunSheetData?.hits?.filter(
                (hit) => !finalpayload.splittedHits.includes(hit?.hitId),
              );

        // update old runsheet path data
        let updateOldRunSheetPathData = await calculateAndDisplayRouteUtils(
          OldRunSheetData?.startEndLocation,
          oldRunSheetHits,
          t,
        );

        // update the last hitID of old runsheet
        if (runSheetDetails.startEndLocation?.id) {
          updateOldRunSheetPathData.visitSetPolyLines = updateLastItemWithUniqueId(
            { pathData: updateOldRunSheetPathData.visitSetPolyLines },
            runSheetDetails.startEndLocation?.id,
          );
        }
        finalpayload.oldPathData = updateOldRunSheetPathData?.visitSetPolyLines;
        finalpayload.runSheetId = runSheetId;
        finalpayload.parentHits = oldRunSheetHits?.map((hit) => hit?.hitId);

        // if new parent values move to new day
        const { isEndTimeOnNextDateWrtStandardTime: _isParentEndTimeOnNextDay } =
          getStartEndTimeWithDesiredDate(
            dateForValidation,
            runSheetDetails?.startsAt,
            state?.parentEndsAt,
          );

        // if old parent values move to new day
        const { isEndTimeOnNextDateWrtStandardTime: _isDefaultDatesOnNext } =
          getStartEndTimeWithDesiredDate(
            dateForValidation,
            runSheetDetails?.startsAt,
            runSheetDetails?.endsAt,
          );

        finalpayload.parentRunsheet = {
          startsAt: runSheetDetails?.startsAt || runSheetDetails?.startDate,
          endsAt: state?.tempNewRunsheetDates?.parentEndsAt,
          activtiyLogId: runSheetDetails?.shiftActivityLogId,
        };

        const res = await splitRunSheet(finalpayload, {
          startsAt: runSheetDetails.startsAt,
          endsAt: runSheetDetails.endsAt,
          shiftActivityLogId: runSheetDetails?.shiftActivityLogId,
        });
        if (res?.statusCode === 200) {
          toaster.success({
            text: res?.message,
            position: 'top-right',
            autoClose: toastSettings.AUTO_CLOSE,
          });
          history.push(`${OBX_SCHEDULES}`);
        }
      } catch (e) {
        error = true;
        toaster.error({
          text: e?.message || e?.e,
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
      } finally {
        setShowSplitRunSheetModal(false);
        setLoading(false);
      }
    }

    const newActiveStep = activeStep + 1;
    !error && setActiveStep(newActiveStep);
    setChecked(null);
  };

  const handlePageBack = () => {
    history.push(`${isSplitRunsheet ? OBX_SCHEDULES : OBX_RUNSHEET}`);
  };
  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const _handleApplyOnMap = () => {
    setaApplyOnMap(true);
  };

  console.log({ errorMessages });
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
    if (hasHitsWithoutStartEndLocation()) disabled = true;
    return disabled;
  };

  const mapProps = useMemo(() => {
    return steps(t, getLabel)?.[lastSegment]?.[activeStep]?.props;
  }, [steps, lastSegment, activeStep]);

  const splitRunSheetFinalPathData = useMemo(() => {
    if (applyOnMap) {
      const data = state.splittedPathData?.map((pathInfo, index) => {
        if (!index) {
          return { ...pathInfo, uniqueId: null, mapPath: decode(pathInfo.mapPath) };
        }
        return {
          ...pathInfo,
          mapPath: decode(pathInfo.mapPath),
          siteImage: state?.visitSet?.[index - 1]?.siteImage || null,
          siteAddress: state?.visitSet?.[index - 1]?.siteAddress,
          uniqueId: state?.visitSet?.[index - 1]?.uniqueId,
          startsAt: state?.visitSet?.[index - 1]?.startsAt,
          endsAt: state?.visitSet?.[index - 1]?.endsAt,
          siteId: state?.visitSet?.[index - 1]?.siteId,
          siteName: state?.visitSet?.[index - 1]?.siteName,
          position: state?.visitSet?.[index - 1]?.position,
        };
      });
      return data;
    } else {
      const updatedPathData = state.pathData?.map((pathInfo) => {
        const filteredData = state.visitSet?.filter((hit) => hit?.hitId === pathInfo?.hitId);
        if (filteredData.length > 0) {
          return { ...pathInfo, isSelected: true };
        }

        return { ...pathInfo, isSelected: false };
      });

      return updatedPathData;
    }
  }, [state.visitSet, state?.startEndLocation, applyOnMap, state.splittedPathData]);

  console.log({ state });

  const getMapCenter = () => {
    if (state?.startEndLocation?.position) return state?.startEndLocation?.position;
    if (franchiseCenter && franchiseCenter?.lat && franchiseCenter?.lng) return franchiseCenter;
    return defaultCenter;
  };

  return (
    <>
      {loading && <LoaderComponent />}
      {/** Create flow */}
      {!isSplitRunsheet ? (
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
                {activeStep === 1 && (
                  <Typography variant="body2">
                    {state?.visitSet?.length}/{state?.totalHits || 0}{' '}
                    {getLabel('terms', 'hits', t)?.toLowerCase()} selected.
                  </Typography>
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

                <RenderIfHasPermission name={ACL_OBX_RUNSHEET_CREATE}>
                  <Button
                    onClick={handleNext}
                    disabled={disableNextButton()}
                    disableRipple
                    variant="primary"
                  >
                    {activeStep === totalSteps() - 1
                      ? t('buttons.createRunSheet', { runsheet: getLabel('terms', 'runsheet', t) })
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
                center={getMapCenter()}
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
      ) : (
        <Box className={classes.mainWrapper}>
          <Box className={classes.leftSide}>
            <Box className={classes.splitHeader}>
              <Box
                className={classes.arrowtext}
                onClick={() => {
                  history.push(OBX_SCHEDULES);
                }}
              >
                <BackIcon />
                <Typography variant="h2">
                  {t('obx.schedules.dutyDetail.runsheetDetail.editButtons.splitRunsheet', {
                    runsheet: getLabel('terms', 'runsheet', t),
                  })}
                </Typography>
              </Box>
              <Box className={classes.splitHeadertext}>
                <Typography variant="h5">{runSheetDetails?.runsheetName}</Typography>
                <Typography className={classes.dots}>&#x2022;</Typography>
                <Typography variant="subtitle2">
                  {runSheetDetails?.startsAt &&
                    runSheetDetails?.endsAt &&
                    `${formatDayjsDateTime({
                      value: runSheetDetails?.startsAt,
                      formatType: dayjsFormatsEnum.time,
                    })} - ${formatDayjsDateTime({
                      value: runSheetDetails?.endsAt,
                      formatType: dayjsFormatsEnum.time,
                    })}`}
                </Typography>
                <Typography className={classes.dots}>&#x2022;</Typography>
                <Typography variant="subtitle2">
                  {formatDayjsDateTime({
                    value: runSheetDetails?.startsAt,
                    formatType: dayjsFormatsEnum.date,
                  })}
                </Typography>
                <Typography className={classes.dots}>&#x2022;</Typography>
                <Chip color="success" size="small" label={getLabel('terms', 'patrol', t)} />
              </Box>
            </Box>
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
                {activeStep === 0 && (
                  <Typography variant="body2">
                    {state?.visitSet?.length}/{state?.noOfHits || 0} {getLabel('terms', 'hits', t)}{' '}
                    selected.
                  </Typography>
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
                <Button
                  onClick={() => {
                    activeStep === totalSteps() - 1
                      ? setShowSplitRunSheetModal(true)
                      : handleNext();
                  }}
                  disabled={
                    disableNextButton() ||
                    !applyOnMap ||
                    (isSplitRunsheet &&
                      state?.visitSet?.length > 0 &&
                      state?.visitSet?.length === state?.hits?.length)
                  }
                  disableRipple
                  variant="primary"
                >
                  {activeStep === totalSteps() - 1
                    ? t('obx.schedules.dutyDetail.runsheetDetail.editButtons.splitRunsheet', {
                        runsheet: getLabel('terms', 'runsheet', t),
                      })
                    : t('sales.contract.next')}
                </Button>
              </Box>
            </Box>
          </Box>
          <Box className={classes.rightSide}>
            <MapBottomButton
              disabled={applyOnMap || disableNextButton()}
              onClick={_handleApplyOnMap}
              isSplit={true}
              label={t('obx.runsheet.applyOnMap')}
            />

            <Button
              disableRipple
              className={classes.toggleButton}
              startIcon={<SeeListIcon className={classes.iconRotate} />}
              variant="onlyText"
              onClick={toggleRightSide}
            >
              {expanded ? t('obx.runsheet.back') : t('obx.runsheet.SeeList')}
            </Button>

            <Box className={classes.mapArea}>
              <SplitDirectionsMap
                waypoints={state?.visitSet || []}
                origin={state?.startEndLocation || {}}
                center={
                  state?.startEndLocation?.position?.lat
                    ? state?.startEndLocation?.position
                    : defaultCenter
                }
                destination={state?.startEndLocation || {}}
                setCoordinates={setCoordinatesToMapForSplitRunSheet}
                pathData={splitRunSheetFinalPathData}
                state={state}
                applyOnMap={applyOnMap}
              />
            </Box>
            <SweetAlertModal
              customClass={{
                confirmButton: classes.sweetAlertConfirmBlueButton,
              }}
              type="info"
              title={t('buttons.confirmSplit')}
              text={t('buttons.splitConfirmationDescription', {
                runsheet: getLabel('terms', 'runsheet', t)?.toLowerCase(),
              })}
              confirmButtonText={t('buttons.yesSplit')}
              cancelButtonText={t('buttons.no')}
              show={showSplitRunSheetModal}
              handleConfirmButton={handleNext}
              handleCancelButton={() => setShowSplitRunSheetModal(false)}
              icon={<WarningIcon />}
            />
            <Box className={classes.bottomArea}>
              {/* <Button disableRipple startIcon={<UnassignedHitsIcon />} variant="onlyText">
                {t('obx.runsheet.unAssignedHits')}
              </Button> */}
              <Button disableRipple startIcon={<CreateHitIcon />} variant="onlyText">
                {getLabel('terms', 'hit', t)}
              </Button>
              <Button disableRipple startIcon={<StartingPointIcon />} variant="onlyText">
                {t('obx.runsheet.startingEndingPoint')}
              </Button>
              <Button disableRipple startIcon={<FranchiseIcon />} variant="onlyText">
                {t('obx.runsheet.franchise')}
              </Button>
            </Box>
          </Box>
        </Box>
      )}
    </>
  );
};

export default RunsheetDetail;
