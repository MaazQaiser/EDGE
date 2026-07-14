import { Box } from '@mui/material';
import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { convertDataToHtml, convertToDraft } from 'src/app/components/common/richText';
import SideDrawer from 'src/app/components/common/sideDrawer';
import {
  dayjsWithStandardOffset,
  getCurrentStandardTimeInIsoWrtTimezone,
  getDaysBetweenDatesRangeWrtStandardDate,
  getDaysWrtTimezoneAsPerStandardTime,
  getEmbededDateAndTimeWRTStandardOffset,
  getHoursDiff24HourFormat,
  getLastShiftStartEndTimeOfJob,
  getStartEndTimeWithDesiredDate,
} from 'src/app/obx/pages/schedules/helper';
import { useApiControllers } from 'src/helper/axios';
import { useTenantLabel } from 'src/helper/utilityHooks';
import useFormHook from 'src/hooks/useFormHook';
import {
  assignShift,
  cancelShift,
  createTourTemplate,
  fetchCheckpointsBySiteId,
  fetchShiftDetailForAssignmentById,
  getActiveAndInActiveOfficers,
  getReportTemplatesList,
  reassignShift,
  restoreShift,
} from 'src/services/duty.services';
import { fetchSettingsPreferences } from 'src/services/settings.services';
import { getSitesAllLocations } from 'src/services/sites.services';
import transformArrayForOptions from 'src/utils/array/transformArrayForOptions';
import { toastSettings } from 'src/utils/constants';
import {
  DRAWER_TYPE,
  SCHEDULE_DUTIES_TOUR_TEMPLATES,
  ShiftStatus,
} from 'src/utils/constants/schedules';
import joiValidate from 'src/utils/formValidator/formValidator.requiredCheck';
import { toaster } from 'src/utils/toast';

import { assignmentMinDate } from '..';
import { getStartEndTimeForValidation } from '../splitJobSideDrawer';
import { useStyles } from './assignmentSideDrawer.styles';
import AssignShift from './AssignShift';
import Layout from './Layout';
import ReassignShift from './ReassignShift';
import CreateTourTemplate from './tourTemplate/CreateTourTemplate';
import { INFINITE_REPEAT_TOUR } from './tourTemplate/Occurances';

export const hourlyRateAssignmentFor = {
  THIS_SHIFT: 'thisShift',
  UPCOMMING_SHIFT_OMWARDS: 'upcommingShiftOnwards',
};

// When shiftStatus is present, these values mean the assign drawer stays editable. Jobs shift-details often omit shiftStatus (undefined) — treat that as editable too.
const ASSIGNMENT_EDITABLE_SHIFT_STATUSES = [
  ShiftStatus.SHIFT_NOT_STARTED,
  ShiftStatus.UPCOMING,
  ShiftStatus.UNASSIGNED,
];

export const defaultCreateTourTemplateValues = {
  name: '',
  checkpoints: [],
  report: {},
  startTime: null,
  duration: {},
  occurances: null,
};

const initialAssignmentValue = {
  selectedDates: [],
  value: null,
  error: {
    date: '',
    value: '',
  },
};

const assignmentDefaultValues = {
  location: initialAssignmentValue,
  hourlyRate: initialAssignmentValue,
  reassignedOfficer: {
    ...initialAssignmentValue,
    reassignmentEnabled: false,
  },
  officer: {
    selectedDays: [],
    ...initialAssignmentValue,
    error: {
      ...initialAssignmentValue.error,
      days: [],
    },
  },
};
const unassignOfficerValue = 'unassign';

const dateForValidation = '2024-01-01'; // choose this date, because it will always return standard time and not DLS time in any case.

const AssignmentSideDrawer = ({
  drawerData,
  closeSideDrawer,
  callbackUponAssignment,
  changeOnlyDrawerType,
  onOpenDedicatedSplitShift,
}) => {
  const { t } = useTranslation();
  const { getLabel } = useTenantLabel();
  const classes = useStyles();
  const [reports, setReports] = useState(undefined);
  const [checkpoints, setCheckpoints] = useState([]);
  const { formData, setFormData, handleInputChange, errorMessages, setErrorMessages } = useFormHook(
    {
      defaultFormData: defaultCreateTourTemplateValues,
    },
  );
  const { formData: formDataTours, setFormData: setFormDataTours } = useFormHook({
    defaultFormData: [],
  });
  const [errorMessagesTours, setErrorMessagesTours] = useState([]);
  const [reassignmentErrors, setReassignmentErrors] = useState({ startTime: '', officer: '' });
  const [deletedTours, setDeletedTours] = useState([]);

  const [assignmentValue, setAssignmentValue] = useState({
    ...assignmentDefaultValues,
    shiftDate: dayjsWithStandardOffset(drawerData?.shiftDate),
  });
  const [shiftDetail, setShiftDetail] = useState(null);
  const [allOfficers, setAllOfficers] = useState(undefined);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [disableActionBtn, setDisableActionBtn] = useState(false);
  const [serviceTime, setServiceTime] = useState(120);

  const { getNewApiController } = useApiControllers();

  const fetchSettingsServiceTime = async () => {
    try {
      const response = await fetchSettingsPreferences();
      if (response.statusCode === 200) {
        const data = response?.data?.preferences?.visitConfigurations?.[0]?.timeValue ?? 120;
        setServiceTime(data);
      }
    } catch (error) {
      const msg = error?.message;
      toaster.error({
        text: msg == null || msg === '' ? msg : t(String(msg), { defaultValue: String(msg) }),
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };

  useEffect(() => {
    fetchSettingsServiceTime();
  }, []);

  const joiValidateTourTemplate = async () => {
    const joiValidatePayload = {
      name: formData?.name,
      startTime: formData?.startTime?.toISOString() || '',
      duration: formData?.duration?.value || '',
      report: formData?.report?.value || '',
      // checkpoints: formData?.checkpoints?.map((checkpoint) => ({
      //   checkpointId: checkpoint?.value,
      //   description: null,
      // })),
    };

    const errors = await joiValidate({ tourTemplate: joiValidatePayload }, t);

    if (errors && Object.keys(errors).length) {
      const updatedErrors = Object.entries(errors)?.reduce((acc, [key, value]) => {
        const [_joiKey, fieldName] = key.split(',');
        return { ...acc, [fieldName]: value };
      }, {});
      setErrorMessages(updatedErrors);

      return true;
    }
    return false;
  };
  const joiValidateTours = async () => {
    // validation
    const joiValidatePayload =
      formDataTours?.length > 0
        ? formDataTours?.map((tour) => ({
            name: tour?.name,
            startTime: tour?.startTime?.toISOString?.() || '',
            duration: tour?.duration?.value || '',
            report: tour?.report?.id ? tour?.report?.id + '' : '',
            // checkpoints: tour?.checkpoints?.map((checkpoint) => ({
            //   checkpointId: checkpoint?.id,
            //   description: null,
            // })),
            occurances: tour?.occurances
              ? {
                  repeatTour: tour?.occurances?.repeatTour?.value || '',
                  repeatAfterTime: tour?.occurances?.repeatAfterTime?.value || '',
                }
              : null,
          }))
        : undefined;

    const errors = await joiValidate({ tours: joiValidatePayload }, t);
    if (errors && Object.keys(errors).length) {
      const updatedErrors = Object.entries(errors)?.reduce((acc, [key, value]) => {
        const [_joiKey, index, fieldName, secondaryFieldname] = key.split(',');

        acc[index] = {
          ...acc[index],
          [fieldName]: secondaryFieldname
            ? { ...(acc[index]?.[fieldName] || {}), [secondaryFieldname]: value }
            : value,
        };
        return [...acc];
      }, []);

      setErrorMessagesTours(updatedErrors);
      return true;
    }
    return false;
  };

  const updateAssignmentError = (key, error) => {
    setAssignmentValue((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        error: error,
      },
    }));
  };

  const locationOfficerValidations = ({
    id,
    isValidStartDate,
    isValidEndDate,
    officerDays,
    key,
    t,
  }) => {
    const error = {
      value: '',
      date: '',
    };

    if (!id && isValidStartDate) {
      error.value = t('obx.schedules.assignDedicatedDuty.assignShift.tourtemplate.required', {
        name: key,
      });
    }
    if (id && !isValidStartDate) {
      error.date = t(
        'obx.schedules.assignDedicatedDuty.assignShift.tourtemplate.dateRequiredError',
      );
    }
    if (isValidStartDate && !isValidEndDate) {
      error.date = t(
        'obx.schedules.assignDedicatedDuty.assignShift.tourtemplate.endDateRequiredError',
      );
    }
    if (officerDays?.length === 0) {
      error.days = t('obx.schedules.assignDedicatedDuty.assignShift.atLeastOneDayRequired');
    }

    updateAssignmentError(key, error);
    const isError = !!error.date || !!error.value || !!error?.days;
    return { isError };
  };
  const findHourlyRateValues = () => {
    const checked = assignmentValue?.hourlyRate?.checked;
    const hourlyRateValue = assignmentValue?.hourlyRate?.value;

    const thisShift =
      assignmentValue?.hourlyRate?.assignmentFor === hourlyRateAssignmentFor.THIS_SHIFT
        ? true
        : false;
    const hourlyRateValues = checked
      ? {
          thisShift,
          assignDate: thisShift ? assignmentValue?.shiftDate?.toISOString?.() : null,
          rate: hourlyRateValue ? Number(hourlyRateValue) : 0,
        }
      : undefined;

    return hourlyRateValues;
  };

  const handleSubmit = async () => {
    if (drawerData?.type === DRAWER_TYPE.TOUR_TEMPLATE) {
      const isError = await joiValidateTourTemplate();
      if (isError) return;

      // Create Tour Template
      const payload = {
        name: formData?.name,
        startTime: dayjs(formData?.startTime).toISOString(),
        duration: formData?.duration?.value,
        reportId: formData?.report?.value,
        jobType: SCHEDULE_DUTIES_TOUR_TEMPLATES.DEDICATED,
        checkpoints: formData?.checkpoints?.map((checkpoint) => ({
          checkpointId: checkpoint?.value,
          description: checkpoint?.moreDescription
            ? convertDataToHtml(checkpoint?.moreDescription)
            : null,
        })),
      };

      try {
        setDisableActionBtn(true);
        const response = await createTourTemplate({ payload, siteId: drawerData?.siteId });
        changeOnlyDrawerType(DRAWER_TYPE.ASSIGN)();
        setFormData(defaultCreateTourTemplateValues);
        setDisableActionBtn(false);
        toaster.success({
          text: response?.message,
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
      } catch (error) {
        setDisableActionBtn(false);
        const msg = error?.message;
        toaster.error({
          text: msg == null || msg === '' ? msg : t(String(msg), { defaultValue: String(msg) }),
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
      }

      return;
    }

    if (
      [DRAWER_TYPE.REASSIGNMENT, DRAWER_TYPE.EDIT_REASSIGNMENT].includes(drawerData?.type) ||
      assignmentValue?.reassignedOfficer?.reassignmentEnabled
    ) {
      // Create Reassignment Payload
      let payload = {
        logId: shiftDetail?.logId,
        officerId: assignmentValue?.reassignedOfficer?.value?.id,
        start: dayjs(assignmentValue?.reassignedOfficer?.selectedDates?.[0]).toISOString(),
        id: shiftDetail?.reassignOfficer?.id,
      };

      if (shiftDetail?.officerAssignmentId) {
        payload.officerAssignmentId = shiftDetail.officerAssignmentId;
      }

      const validatorPayload = {
        officer: assignmentValue?.reassignedOfficer?.value || {},
        startTime: payload.start,
      };

      const errors = await joiValidate({ reassignment: validatorPayload }, t);
      if (errors && Object.keys(errors).length) {
        const updatedErrors = Object.entries(errors)?.reduce((acc, [key, value]) => {
          const [_joiKey, fieldName] = key.split(',');
          return { ...acc, [fieldName]: value };
        }, {});
        setReassignmentErrors(updatedErrors);
        return;
      }

      const base = dayjs('2000-01-01'); // dummy consistent base

      // Extract shift start, end, and user input time
      // Convert all times to user's timezone for consistent comparison
      const shiftStart = dayjsWithStandardOffset(shiftDetail?.shiftStartTime);
      const shiftEnd = dayjsWithStandardOffset(shiftDetail?.shiftEndTime);
      const userInput = dayjsWithStandardOffset(payload.start); // actual datetime from user

      // Normalize shift times and user time to dummy base date
      const startTime = base.clone().hour(shiftStart.hour()).minute(shiftStart.minute()).second(0);
      let endTime = base.clone().hour(shiftEnd.hour()).minute(shiftEnd.minute()).second(0);
      let userTime = base.clone().hour(userInput.hour()).minute(userInput.minute()).second(0);

      // Handle cross-day shifts
      const isCrossDayShift = !endTime.isAfter(startTime);

      if (isCrossDayShift) {
        endTime = endTime.add(1, 'day');
        if (userTime.isBefore(startTime)) {
          userTime = userTime.add(1, 'day');
        }
      }

      // input time is within shift range
      const isUserTimeOutOfShiftRange = !userTime.isBetween(startTime, endTime, null, '[)');

      // If any validation fails, show error
      if (isUserTimeOutOfShiftRange) {
        setReassignmentErrors((prev) => ({
          ...prev,
          startTime: t(
            'obx.schedules.assignDedicatedDuty.assignShift.reassignment.startTimeBelowError',
          ),
        }));
        return;
      }

      try {
        setDisableActionBtn(true);
        const response = await reassignShift({
          payload,
          shiftId: drawerData?.shiftId,
        });
        toaster.success({
          text: response?.message,
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });

        getShiftDetailById(assignmentValue?.shiftDate);
        changeOnlyDrawerType(DRAWER_TYPE.ASSIGN)();
        setDisableActionBtn(false);
      } catch (error) {
        setDisableActionBtn(false);
        const msg = error?.message;
        toaster.error({
          text: msg == null || msg === '' ? msg : t(String(msg), { defaultValue: String(msg) }),
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
      }

      return;
    }

    const locationId = assignmentValue?.location?.value?.id ?? undefined;
    const officerId = assignmentValue?.officer?.value?.id ?? undefined;

    // Start and end date validation
    const isValidStartDate = assignmentValue?.startDate?.isValid();
    const isValidEndDate = assignmentValue?.endDate?.isValid();

    if (!isValidStartDate || !isValidEndDate) {
      const startErrorText = !isValidStartDate
        ? t('obx.schedules.assignDedicatedDuty.assignShift.startDateRequired')
        : '';
      const endErrorText = !isValidEndDate
        ? t('obx.schedules.assignDedicatedDuty.assignShift.endDateRequired')
        : '';

      // Show appropriate toast message
      let errorMessage;
      if (!isValidStartDate && !isValidEndDate) {
        errorMessage = t('obx.schedules.assignDedicatedDuty.assignShift.startAndEndDateRequired');
      } else if (!isValidStartDate) {
        errorMessage = startErrorText;
      } else {
        errorMessage = endErrorText;
      }

      setAssignmentValue((prev) => ({
        ...prev,
        startDateError: startErrorText,
        endDateError: endErrorText,
      }));
      return toaster.error({
        text: errorMessage,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }

    const { isError: isLocationError } = locationOfficerValidations({
      id: locationId,
      isValidStartDate,
      isValidEndDate,
      key: 'location',
      t,
    });

    // Weekdays apply to officer assignment only; location does not require day selection.
    const hasOfficerWithDates = Boolean(officerId) && isValidStartDate && isValidEndDate;
    const hasSelectedDays = (assignmentValue?.officer?.selectedDays?.length ?? 0) > 0;

    if (hasOfficerWithDates && !hasSelectedDays) {
      const daysError = t('obx.schedules.assignDedicatedDuty.assignShift.atLeastOneDayRequired');
      setAssignmentValue((prev) => ({
        ...prev,
        officer: {
          ...prev?.officer,
          error: {
            ...prev?.officer?.error,
            days: daysError,
          },
        },
      }));
      return toaster.error({
        text: daysError,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }

    const isTourErrors = await joiValidateTours();
    if (isLocationError || isTourErrors) {
      return;
    }

    const startDate = assignmentValue?.startDate;
    const endDate = assignmentValue?.endDate;

    // Location Assignment
    const location =
      locationId && isValidStartDate && isValidEndDate
        ? {
            id: locationId,
            assignmentDuration: {
              start: startDate,
              end: endDate,
            },
          }
        : undefined;

    let officer = undefined;
    if (officerId && isValidStartDate && isValidEndDate) {
      officer = {
        id: officerId === unassignOfficerValue ? undefined : officerId,
        assignedDays: officerAssignedDaysUTC,
        assignmentDuration: {
          start: startDate,
          end: endDate,
        },
      };
    }

    const { isError: isValidationError, updatedTours } = toursValidation();
    setFormDataTours([...updatedTours]);
    if (isValidationError) {
      return toaster.info({
        text: t('obx.schedules.assignDedicatedDuty.assignShift.error.infoMsg'),
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }

    const tours =
      updatedTours?.length > 0
        ? updatedTours?.map((tour) => ({
            id: tour?.id,
            title: tour?.name,
            checkpoints: tour?.checkpoints?.map((checkpoint) => ({
              ...checkpoint,
              reportTemplateId: checkpoint?.templateId,
              description: checkpoint?.moreDescription
                ? convertDataToHtml(checkpoint?.moreDescription)
                : null,
            })),
            windowStart: dayjs(tour?.startTime).toISOString(),
            duration: tour?.duration?.value ? Number(tour?.duration?.value) : null,
            reportTemplateId: tour?.report?.id,
            occurances:
              tour?.occurances?.repeatTour?.value && tour?.occurances?.repeatAfterTime?.value
                ? {
                    infinite: tour?.occurances?.repeatTour?.value === INFINITE_REPEAT_TOUR,
                    repeat: Number(tour?.repeatTourValue),
                    delay: Number(tour?.occurances?.repeatAfterTime?.value),
                  }
                : null,
          }))
        : undefined;
    const payload = {
      location,
      officer,
      hourlyRate: findHourlyRateValues(),
      tours,
      isTimeUpdated: shiftDetail?.isTimeUpdated,
      activityLogId: shiftDetail?.logId,
      deletedTours: deletedTours?.map((deletedTour) => deletedTour?.id),
    };

    try {
      setDisableActionBtn(true);
      const response = await assignShift({ payload, shiftId: drawerData?.shiftId });
      setFormDataTours([]);
      setDeletedTours([]);
      toaster.success({
        text: response?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });

      closeSideDrawer();
      callbackUponAssignment();
      setDisableActionBtn(false);
    } catch (error) {
      setDisableActionBtn(false);
      const msg = error?.message;
      toaster.error({
        text: msg == null || msg === '' ? msg : t(String(msg), { defaultValue: String(msg) }),
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };

  const generateTourOccurrences = () => {
    return formDataTours?.map((tour) => {
      const occurrences = []; // This array will hold each separate tour instance
      const tourDurationMins = Number(tour?.duration?.value);

      // Return early if the tour data is invalid
      if (!dayjs(tour?.startTime).isValid() || !tourDurationMins) {
        return { ...tour, occurrences: [] };
      }

      // --- 1. Calculate the first occurrence ---
      const firstTourEndTime = dayjs(tour?.startTime).add(tourDurationMins, 'm').toISOString();

      // Use your existing function to get the correctly aligned start/end times for the first tour
      const { startTime, endTime } = getStartEndTimeForValidation({
        selectedStartTime: dayjs(tour?.startTime).toISOString(),
        selectedEndTime: firstTourEndTime,
        isEndTimeOnNextDateWrtStandardTime: shiftDetail?.isEndTimeOnNextDateWrtStandardTime,
        shiftStartTime: shiftDetail?.shiftStartTime,
      });

      // Add the first tour instance to our list
      occurrences.push({ startTime, endTime });

      // This will be the reference point for the next repetition's start time
      let lastOccurrenceEndTime = endTime;

      // --- 2. Calculate all subsequent repetitions ---
      let repeatTourValue = tour?.occurances?.repeatTour?.value;
      if (repeatTourValue && tour?.occurances?.repeatAfterTime?.value) {
        const delay = Number(tour?.occurances?.repeatAfterTime?.value); // in minutes

        // This block to calculate the total number of repetitions for "infinite" is correct and is preserved
        if (repeatTourValue === INFINITE_REPEAT_TOUR) {
          repeatTourValue = 0;

          const maxTourEndTime = shiftDetail?.shiftEndTime;
          const remainingTourDurationInMins = dayjs(maxTourEndTime).diff(endTime, 'm', true) % 1440;

          const minsRequiredForATour = delay + tourDurationMins;
          if (remainingTourDurationInMins >= minsRequiredForATour) {
            repeatTourValue = Math.floor(remainingTourDurationInMins / minsRequiredForATour);
            ++repeatTourValue;
          }
        }

        const repeat = Number(repeatTourValue);
        // Loop starts at 1 because we have already calculated the first occurrence
        for (let i = 1; i < repeat; i++) {
          // The next tour starts after the last one ends, plus the delay
          const newStartTime = dayjs(lastOccurrenceEndTime).add(delay, 'm');
          const newEndTime = dayjs(newStartTime).add(tourDurationMins, 'm');

          const newOccurrence = {
            startTime: newStartTime.toISOString(),
            endTime: newEndTime.toISOString(),
          };

          occurrences.push(newOccurrence);
          lastOccurrenceEndTime = newOccurrence.endTime; // Update the end time for the next iteration
        }
      }

      // Return the original tour data, plus the array of occurrences and the calculated repeat value
      return { ...tour, occurrences, repeatTourValue };
    });
  };

  const getSingleShiftDayUtc = (dateValue) => {
    if (!dateValue) return [];
    const parsed = new Date(dateValue);
    if (Number.isNaN(parsed.getTime())) return [];
    return [parsed.getUTCDay()];
  };

  /** Cancel shift: same schedule id as assign and GET /shift/details (drawer first). */
  const getScheduleShiftId = () => `${drawerData?.shiftId ?? shiftDetail?.id ?? ''}`;

  const buildCancelShiftPayload = ({ scope, reason, customRange, fromJobSection }) => {
    const isCustomRange = scope === 'custom_range';
    const isThisAndFollowing = scope === 'this_and_following';

    const defaultShiftStart = fromJobSection
      ? shiftDetail?.assignmentMinDate?.toISOString?.()
      : shiftDetail?.selectedShiftStartTime;

    const startsAt = isCustomRange
      ? dayjs(customRange?.startDate).toISOString()
      : defaultShiftStart;
    const endsAt =
      !isCustomRange && !isThisAndFollowing
        ? defaultShiftStart
        : dayjs(customRange?.endDate).toISOString();

    const days = isCustomRange
      ? getDaysWrtTimezoneAsPerStandardTime(startsAt, customRange?.days || [], true) || []
      : isThisAndFollowing
        ? shiftDetail?.shiftDays || []
        : getSingleShiftDayUtc(defaultShiftStart);

    return {
      shiftType: 'dedicated',
      shiftId: getScheduleShiftId(),
      startsAt,
      endsAt,
      days,
      cancelReason: reason,
    };
  };

  const handleCancelShift = async (cancelShiftModalData) => {
    try {
      const payload = buildCancelShiftPayload({
        ...(cancelShiftModalData ?? {}),
        fromJobSection: drawerData?.fromJobSection,
      });
      const response = await cancelShift({ payload });

      toaster.success({
        text: response?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
      setShiftDetail((prev) => ({
        ...prev,
        isCancelled: true,
        isCanceled: true,
        shiftStatus: 'cancelled',
        scheduleStatus: 'cancelled',
      }));
      callbackUponAssignment?.();
      return true;
    } catch (error) {
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
      return false;
    }
  };

  const getRestoreShiftId = () =>
    shiftDetail?.shiftActivityLogId ||
    shiftDetail?.logId ||
    drawerData?.shiftActivityLogId ||
    shiftDetail?.id ||
    drawerData?.shiftId ||
    '';

  const buildRestoreShiftPayload = () => ({
    shiftType: 'dedicated',
    activityLogId: getRestoreShiftId(),
  });

  const handleRestoreShift = async () => {
    try {
      const activityLogId = getRestoreShiftId();
      if (!activityLogId) {
        toaster.error({
          text: t('obx.commonText.somethingWentWrong'),
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
        return false;
      }
      const payload = buildRestoreShiftPayload();
      const response = await restoreShift({ activityLogId, payload });

      toaster.success({
        text: response?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
      setShiftDetail((prev) => ({
        ...prev,
        isCancelled: false,
        isCanceled: false,
      }));
      callbackUponAssignment?.();
      return true;
    } catch (error) {
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
      return false;
    }
  };

  const doToursOverlap = (tourA, tourB) => {
    // Cannot compare if one of the tours has no valid time slots.
    if (!tourA.occurrences || !tourB.occurrences) {
      return false;
    }

    // Iterate through every occurrence of the first tour
    for (const occA of tourA.occurrences) {
      const startA = dayjs(occA.startTime);
      const endA = dayjs(occA.endTime);

      // Compare it against every occurrence of the second tour
      for (const occB of tourB.occurrences) {
        const startB = dayjs(occB.startTime);
        const endB = dayjs(occB.endTime);

        // Standard algorithm to check if two time ranges overlap:
        // An overlap exists if (StartA < EndB) AND (StartB < EndA)
        if (startA.isBefore(endB) && startB.isBefore(endA)) {
          return true; // Found an overlap, no need to check further.
        }
      }
    }

    return false; // No overlaps found after checking all combinations.
  };

  const toursValidation = () => {
    let isError = false;

    // Step 1: Generate the full list of occurrences for each tour.
    // This calls the function that produces the `occurrences` array for each tour.
    const toursWithOccurrences = generateTourOccurrences() || [];

    // Create a mutable copy to which we will add error messages.
    const toursWithErrors = [...toursWithOccurrences];

    // Step 2: Perform the Boundary Check.
    // Ensure every tour occurrence is valid against the shift's boundaries.
    toursWithErrors.forEach((tour) => {
      tour.errors = []; // Initialize an errors array for each tour.
      if (!tour.occurrences || tour.occurrences.length === 0) {
        return; // No occurrences to validate for this tour.
      }

      for (const occurrence of tour.occurrences) {
        const occStartTime = dayjs(occurrence.startTime);
        const occEndTime = dayjs(occurrence.endTime);
        const shiftStartTime = dayjs(shiftDetail?.shiftStartTime);
        const shiftEndTime = dayjs(shiftDetail?.shiftEndTime);

        // Check if the start time is outside the valid range [shiftStart, shiftEnd).
        if (occStartTime.isBefore(shiftStartTime) || !occStartTime.isBefore(shiftEndTime)) {
          tour.errors.push(
            t('obx.schedules.assignDedicatedDuty.assignShift.error.invalidStartTime'),
          );
          isError = true;
          break; // Exit this tour's loop once an error is found.
        }
        // Check if the end time is outside the valid range (shiftStart, shiftEnd].
        if (occEndTime.isBefore(shiftStartTime) || occEndTime.isAfter(shiftEndTime)) {
          tour.errors.push(
            t('obx.schedules.assignDedicatedDuty.assignShift.error.invalidEndTime', {
              tour: getLabel('terms', 'tour', t),
            }),
          );
          isError = true;
          break; // Exit this tour's loop once an error is found.
        }
      }
    });

    // If we found any boundary errors, return immediately.
    // This prevents showing confusing overlap errors when the fundamental timing is already wrong.
    if (isError) {
      const updatedTours = toursWithErrors.map(({ occurrences: _a, ...rest }) => rest);
      return { isError, updatedTours };
    }

    // Step 3: If no boundary errors, perform the Overlap Check.
    for (let i = 0; i < toursWithErrors.length; i++) {
      for (let j = i + 1; j < toursWithErrors.length; j++) {
        const tourA = toursWithErrors[i];
        const tourB = toursWithErrors[j];

        if (doToursOverlap(tourA, tourB)) {
          isError = true;
          // Add specific error messages to BOTH tours that are overlapping for clarity in the UI.
          const errorMsgForB = t(
            'obx.schedules.assignDedicatedDuty.assignShift.error.timeOverlapped',
            {
              name: t('obx.schedules.assignDedicatedDuty.assignShift.defaultTourName', {
                index: i + 1,
                tour: getLabel('terms', 'tour', t),
              }),
            },
          );
          const errorMsgForA = t(
            'obx.schedules.assignDedicatedDuty.assignShift.error.timeOverlapped',
            {
              name: t('obx.schedules.assignDedicatedDuty.assignShift.defaultTourName', {
                index: j + 1,
                tour: getLabel('terms', 'tour', t),
              }),
            },
          );

          // Add the error message only if it's not already there.
          if (!tourA.errors.includes(errorMsgForA)) tourA.errors.push(errorMsgForA);
          if (!tourB.errors.includes(errorMsgForB)) tourB.errors.push(errorMsgForB);
        }
      }
    }

    // Step 4: Prepare the final return object.
    // We strip out the `occurrences` array as it is large and not needed by the UI rendering component.
    const updatedTours = toursWithErrors.map(({ occurrences: _a, ...rest }) => rest);

    return { isError, updatedTours };
  };

  const clearTemplateStates = () => {
    setFormData(defaultCreateTourTemplateValues);
  };

  const getReportTemplates = async (siteId) => {
    try {
      setReports(undefined);
      const response = await getReportTemplatesList(siteId);
      const reportTemplatesRes =
        transformArrayForOptions(response.data?.templates, 'title', 'id', 'description') || [];
      setReports(reportTemplatesRes);
    } catch (error) {
      setReports([]);
    }
  };
  const getCheckpointsOfSite = async (siteId) => {
    try {
      const response = await fetchCheckpointsBySiteId(siteId);
      const updatedCheckpoints = response?.data?.checkpoints?.map((checkpoint) => ({
        ...checkpoint,
        locationName: checkpoint?.location?.locationName,
      }));
      const checkpointsRes =
        transformArrayForOptions(updatedCheckpoints, 'checkpointType', 'id', 'locationName') || [];
      setCheckpoints(checkpointsRes);
    } catch (error) {
      setCheckpoints([]);
    }
  };

  const getShiftDetailById = async (shiftDate) => {
    try {
      const shiftDateInISO = shiftDate?.toISOString?.();
      setLoading(true);

      setAllOfficers(undefined);
      setShiftDetail({});
      setFormDataTours([]);
      setAssignmentValue((prev) => ({
        ...prev,
        ...assignmentDefaultValues,
      }));

      const response = await fetchShiftDetailForAssignmentById({
        shiftId: drawerData?.shiftId,
        shiftDate: shiftDateInISO,
      });

      const shiftDetail = response?.data?.shift || {};
      const { startsAt, endsAt } = shiftDetail;

      const shiftDays = getDaysWrtTimezoneAsPerStandardTime(
        shiftDetail?.selectedShiftStartTime,
        shiftDetail?.shiftDays,
      ); // update shift days as per timezone

      const { startTime, endTime, isEndTimeOnNextDate, isEndTimeOnNextDateWrtStandardTime } =
        getStartEndTimeWithDesiredDate(dateForValidation, startsAt, endsAt);

      const shiftDurationInHrs = getHoursDiff24HourFormat(startsAt, endsAt);
      const { lastShiftStartTime, lastShiftEndTime } = getLastShiftStartEndTimeOfJob(
        startsAt,
        endsAt,
      );

      const { assignmentStartDate } = defaultAssignmentDates(
        shiftDateInISO,
        startsAt,
        lastShiftStartTime,
      );

      setAssignmentValue((prev) => ({
        ...prev,
        actionStartDate:
          assignmentStartDate ??
          dayjsWithStandardOffset(shiftDetail?.selectedShiftStartTime || shiftDate),
        actionEndDate: dayjsWithStandardOffset(lastShiftStartTime || endsAt),
      }));

      const allowReassignment =
        [
          ShiftStatus.SHIFT_STARTED,
          ShiftStatus.BREAK_STARTED,
          ShiftStatus.BREAK_ENDED,
          ShiftStatus.SHIFT_ENDED,
        ].includes(shiftDetail.shiftStatus) &&
        getCurrentStandardTimeInIsoWrtTimezone() >= shiftDetail?.selectedShiftStartTime &&
        getCurrentStandardTimeInIsoWrtTimezone() < shiftDetail?.selectedShiftEndTime;

      const assignmentSelectionMinDate = () => {
        if (shiftDetail?.onGoingShift) {
          // If shift contains ongoing shift, minimum date will be that shift startsAt
          return dayjsWithStandardOffset(shiftDetail?.onGoingShift?.startsAt);
        }

        return assignmentMinDate(shiftDetail?.startsAt, endTime);
      };

      const shiftStatus = shiftDetail.shiftStatus;
      const assignmentReadOnlyMode =
        shiftStatus != null &&
        shiftStatus !== '' &&
        !ASSIGNMENT_EDITABLE_SHIFT_STATUSES.includes(shiftStatus);

      const updatedShiftDetail = {
        ...shiftDetail,
        shiftDurationInHrs,
        shiftStartTime: startTime,
        shiftEndTime: endTime,
        isEndTimeOnNextDate,
        isEndTimeOnNextDateWrtStandardTime,
        allowReassignment,
        lastShiftStartTime,
        lastShiftEndTime,
        shiftDays,
        shiftDateInISO,
        assignmentReadOnlyMode,
        assignmentMinDate: assignmentSelectionMinDate(),
      };

      setShiftDetail(updatedShiftDetail);
      setInitialAssignment(shiftDateInISO, updatedShiftDetail);

      setLoading(false);
    } catch (error) {
      setLoading(false);
      setShiftDetail({});
    }
  };

  const defaultAssignmentDates = (shiftDateInISO, startsAt, endsAt) => {
    // Default location and officer assignment date ranges
    const isSelectedDateWithinShiftDuration =
      shiftDateInISO >= startsAt && shiftDateInISO <= endsAt;
    const assignmentStartDate = isSelectedDateWithinShiftDuration
      ? dayjsWithStandardOffset(shiftDateInISO)
      : null;
    let assignmentEndDate = null;
    if (assignmentStartDate) {
      const assignmentExpectedEndDate = assignmentStartDate
        ? assignmentStartDate.add(1, 'month')
        : null;
      assignmentEndDate =
        assignmentExpectedEndDate?.toISOString() <= endsAt
          ? assignmentExpectedEndDate
          : getEmbededDateAndTimeWRTStandardOffset(
              shiftDateInISO,
              dayjsWithStandardOffset(endsAt).format('YYYY-MM-DD'),
            );
    }

    return { assignmentStartDate, assignmentEndDate };
  };
  const getAssignmentDates = (shiftDateInISO, shiftDetail) => {
    const { assignmentStartDate, assignmentEndDate } = defaultAssignmentDates(
      shiftDateInISO,
      shiftDetail?.startsAt,
      shiftDetail?.lastShiftStartTime,
    );

    const defaultValue =
      assignmentStartDate && assignmentEndDate ? [assignmentStartDate, assignmentStartDate] : [];
    let officerSelectedDates = defaultValue;
    let locationSelectedDates = defaultValue;
    // set assigned officer date range and value
    if (shiftDetail?.officer?.startsAt && shiftDetail?.officer?.endsAt) {
      officerSelectedDates = [
        assignmentStartDate,
        dayjsWithStandardOffset(shiftDetail?.officer?.endsAt),
      ];
    }

    // set assigned location date range and value
    if (shiftDetail?.location?.startsAt && shiftDetail?.location?.endsAt) {
      locationSelectedDates = [
        assignmentStartDate,
        dayjsWithStandardOffset(shiftDetail?.location?.endsAt),
      ];
    }

    // This check will work, while editing a dedicated shift
    if (shiftDetail?.location && shiftDetail?.officer) {
      locationSelectedDates = [
        dayjsWithStandardOffset(shiftDateInISO),
        dayjsWithStandardOffset(shiftDateInISO),
      ];
      officerSelectedDates = [
        dayjsWithStandardOffset(shiftDateInISO),
        dayjsWithStandardOffset(shiftDateInISO),
      ];
    }
    return { locationSelectedDates, officerSelectedDates };
  };
  const setInitialAssignment = (shiftDateInISO, shiftDetail) => {
    const { locationSelectedDates, officerSelectedDates } = getAssignmentDates(
      shiftDateInISO,
      shiftDetail,
    );

    let selectedDaysFromDates = [];

    if (officerSelectedDates.length) {
      const days = getDaysBetweenDatesRangeWrtStandardDate(
        officerSelectedDates[0],
        officerSelectedDates[1],
      );
      selectedDaysFromDates = days.filter((day) => shiftDetail?.shiftDays.includes(day));
    }

    setAssignmentValue((prev) => ({
      ...prev,
      location: {
        ...prev?.location,
        selectedDates: locationSelectedDates,
      },
      officer: {
        ...prev?.officer,
        selectedDates: officerSelectedDates,
        selectedDays: selectedDaysFromDates.length
          ? selectedDaysFromDates
          : getDaysWrtTimezoneAsPerStandardTime(
              shiftDetail?.selectedShiftStartTime,
              shiftDetail?.officer?.shiftDays,
            ) || [],
        value: shiftDetail?.officer?.id
          ? {
              ...shiftDetail?.officer,
              image: shiftDetail?.officer?.imageUrl,
              label: shiftDetail?.officer?.name,
            }
          : {},
      },
      hourlyRate: shiftDetail?.hourlyRate
        ? {
            ...prev?.hourlyRate,
            checked: !!shiftDetail?.hourlyRate,
            value: shiftDetail?.hourlyRate?.rate + '',
            assignmentFor: shiftDetail?.hourlyRate?.thisShift
              ? hourlyRateAssignmentFor.THIS_SHIFT
              : hourlyRateAssignmentFor.UPCOMMING_SHIFT_OMWARDS,
          }
        : prev?.hourlyRate,
    }));
  };

  useEffect(() => {
    getReportTemplates(drawerData?.siteId);
    getCheckpointsOfSite(drawerData?.siteId);
  }, []);

  useEffect(() => {
    if (!assignmentValue?.shiftDate?.isValid()) return;

    getShiftDetailById(assignmentValue?.shiftDate);
  }, [assignmentValue?.shiftDate]);

  const getLocationsOfSite = async (siteId) => {
    try {
      const response = await getSitesAllLocations(siteId);

      if (response?.statusCode === 200) {
        const locationsRes = response?.data?.locations || [];
        setLocations(transformArrayForOptions(locationsRes, 'name', 'id'));
      }
    } catch (error) {
      setLocations([]);
    }
  };

  // Fetch locations
  useEffect(() => {
    getLocationsOfSite(drawerData?.siteId);
  }, []);
  // populate location, if it already exists in shift detail
  useEffect(() => {
    if (locations?.length > 0 && shiftDetail?.location?.id) {
      const matchedLocation = locations?.find(
        (location) => location?.id === shiftDetail?.location?.id,
      );

      setAssignmentValue((prev) => ({
        ...prev,
        location: {
          ...prev?.location,
          value: matchedLocation,
        },
      }));
    }
  }, [locations, shiftDetail?.location?.id]);

  const getOfficersData = async ({ shiftId, start, end, selectedDays, isReassigned }) => {
    const apiController = getNewApiController();

    if (!start || !end) {
      setAllOfficers({});
      return;
    }

    try {
      setAllOfficers(undefined);
      const queryParams = {
        start,
        end,
        assignmentDays: selectedDays,
        isReassigned,
      };
      const config = { signal: apiController.signal };
      const response = await getActiveAndInActiveOfficers({ shiftId, queryParams, config });

      const data = response?.data || {};
      const assignMe = data?.assignMe && {
        ...data.assignMe,
        disabled: data.assignMe?.isAssigned,
      };
      const assigned = data?.assigned?.map((officer) => ({
        ...officer,
        disabled: officer?.isAssigned,
        role: officer?.label,
        label: officer?.name,
      }));
      const unassigned = data?.unassigned?.map((officer) => ({
        ...officer,
        reason: 'available',
        role: officer?.label,
        label: officer?.name,
      }));
      const isOfficerAlreadyAssigned = shiftDetail?.officer?.id;
      const unassignOfficer =
        isOfficerAlreadyAssigned && !shiftDetail?.reassignOfficer
          ? {
              id: unassignOfficerValue,
              name: t('obx.schedules.assignDedicatedDuty.assignShift.unassignOfficer', {
                officer: getLabel('terms', 'officer', t),
              }),
              imageUrl: null,
              role: 'Officer',
              label: t('obx.schedules.assignDedicatedDuty.assignShift.unassignOfficer', {
                officer: getLabel('terms', 'officer', t),
              }),
              value: unassignOfficerValue,
              isAssigned: false,
            }
          : null;

      setAllOfficers({ ...data, assigned, assignMe, unassignOfficer, unassigned });
    } catch (error) {
      if (!apiController.signal.aborted) {
        setAllOfficers(null);
        const msg = error?.message;
        toaster.error({
          text: msg == null || msg === '' ? msg : t(String(msg), { defaultValue: String(msg) }),
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
      }
    }
  };

  const populateMatchedTours = ({ shiftDetail, checkpoints, reports }) => {
    const matchedTours = shiftDetail?.tours?.map((tour, index) => {
      const tourCheckpointIds = tour?.tour?.checkpoints?.map((chkpt) => chkpt?.id);
      const matchedCheckpoints = checkpoints
        ?.filter((checkpoint) => tourCheckpointIds?.includes(checkpoint?.id))
        ?.map((checkpoint) => {
          const matchedCheckpoint = tour?.tour?.checkpoints?.find(
            (chkpt) => chkpt?.id === checkpoint?.id,
          );
          return {
            ...checkpoint,
            moreDescription: matchedCheckpoint?.description
              ? convertToDraft(matchedCheckpoint?.description)
              : null,
          };
        });

      // Sort matchedCheckpoints according to tourCheckpointIds sequence
      matchedCheckpoints?.sort((a, b) => {
        return tourCheckpointIds?.indexOf(a?.id) - tourCheckpointIds?.indexOf(b?.id);
      });

      return {
        id: tour?.id,
        key: index + 1,
        name: tour?.tour?.title,
        startTime: dayjs(tour?.tour?.startsAt),
        duration: {
          value: tour?.tour?.duration + '',
          label: tour?.tour?.duration + '',
        },
        checkpoints: matchedCheckpoints,
        report: reports?.find((report) => report?.id == tour?.tour?.reportTemplateId),
        occurances: tour?.occurence?.repeat
          ? {
              repeatTour: {
                value: tour?.occurence?.infinite
                  ? INFINITE_REPEAT_TOUR
                  : tour?.occurence?.repeat + '',
                label: tour?.occurence?.infinite
                  ? t('obx.schedules.assignDedicatedDuty.assignShift.repeatInfinite')
                  : tour?.occurence?.repeat + '',
              },
              repeatAfterTime: {
                value: tour?.occurence?.delay + '',
                label: tour?.occurence?.delay + '',
              },
            }
          : null,
      };
    });
    setFormDataTours(matchedTours);
  };

  // Populate tours if tours are already assigned to selected shift date
  useEffect(() => {
    if (shiftDetail?.tours?.length > 0 && reports !== undefined) {
      populateMatchedTours({ shiftDetail, checkpoints, reports });
    }
  }, [shiftDetail?.tours, checkpoints, reports]);

  const handleChangeAssignmentValue = (e) => {
    setAssignmentValue((prev) => {
      const updatedValue =
        e.target.value?.id && prev?.[e.target?.name]?.value?.id === e.target.value?.id
          ? null
          : e.target.value;

      return {
        ...prev,
        [e.target.name]: {
          ...prev[e.target?.name],
          value: updatedValue,
          error: {
            ...prev[e.target?.name].error,
            value: '',
          },
        },
      };
    });
  };

  // Fetch officers only when explicit assignment dates are set by active edit-shift mode.
  const officerAssignmentStart = assignmentValue?.startDate;
  const officerAssignmentEnd = assignmentValue?.endDate;
  const officerAssignmentDays =
    assignmentValue?.officer?.selectedDays || assignmentValue?.selectedDays || [];

  const officerAssignedDaysUTC = useMemo(
    () =>
      getDaysWrtTimezoneAsPerStandardTime(
        shiftDetail?.selectedShiftStartTime,
        officerAssignmentDays,
        true,
      ) || [],
    [shiftDetail?.selectedShiftStartTime, officerAssignmentDays],
  );

  // Deduplicate: dayjs objects are new references on every setAssignmentValue call even
  // when the underlying timestamp hasn't changed. Serialize to ISO strings for comparison
  // so we only hit the API when the effective params actually differ.
  const lastOfficerDataKey = useRef(null);
  useEffect(() => {
    if (
      dayjs(officerAssignmentStart).isValid() &&
      dayjs(officerAssignmentEnd).isValid() &&
      officerAssignedDaysUTC?.length > 0
    ) {
      const start = officerAssignmentStart?.toISOString();
      const end = officerAssignmentEnd?.toISOString();
      const key = `${start}|${end}|${officerAssignedDaysUTC.join(',')}`;
      if (key === lastOfficerDataKey.current) return;
      lastOfficerDataKey.current = key;
      getOfficersData({
        shiftId: drawerData?.shiftId,
        start,
        end,
        selectedDays: officerAssignedDaysUTC,
      });
    }
  }, [officerAssignmentStart, officerAssignmentEnd, officerAssignedDaysUTC]);

  const setChangeDate =
    (key) =>
    (dates = []) => {
      const firstDate = dayjs(dates?.[0]).format('YYYY-MM-DD');
      const secondDate = dayjs(dates?.[1]).format('YYYY-MM-DD');
      const startDate = getEmbededDateAndTimeWRTStandardOffset(shiftDetail?.startsAt, firstDate);
      const endDate = getEmbededDateAndTimeWRTStandardOffset(shiftDetail?.startsAt, secondDate);

      let selectedDates = [startDate, endDate];
      if (key === 'reassignedOfficer') {
        const startDate = dates?.[0] ? dates?.[0] : null;
        const endDate = dates?.[1] ? dates?.[1] : null;

        const start = dates?.[0] ? dayjs(dates?.[0]).toISOString() : null;
        const end = dates?.[1] ? dayjs(shiftDetail?.selectedShiftEndTime).toISOString() : null;

        selectedDates = [startDate, endDate];

        getOfficersData({
          shiftId: drawerData?.shiftId,
          start: start,
          end: end,
          isReassigned: true,
        });
      }

      setAssignmentValue((prev) => ({
        ...prev,
        [key]: {
          ...prev[key],
          selectedDates: selectedDates,
          error: {
            ...prev[key].error,
            date: '',
          },
        },
      }));
    };

  return (
    <SideDrawer totalWidth={'720px'} isOpen={!!drawerData?.type}>
      <Layout
        drawerData={drawerData}
        changeOnlyDrawerType={changeOnlyDrawerType}
        closeSideDrawer={closeSideDrawer}
        handleSubmit={handleSubmit}
        clearTemplateStates={clearTemplateStates}
        shiftDetail={shiftDetail}
        loading={loading}
        disableActionBtn={disableActionBtn}
        refetchSchedule={callbackUponAssignment}
        onOpenDedicatedSplitShift={onOpenDedicatedSplitShift}
        onCancelShift={handleCancelShift}
        onRestoreShift={handleRestoreShift}
      >
        {drawerData?.type === DRAWER_TYPE.TOUR_TEMPLATE ? (
          <Box className={classes.TourTemplatesDrawerWrapper}>
            <CreateTourTemplate
              {...{
                formData,
                handleInputChange,
                reports: reports || [],
                checkpoints,
                errorMessages,
                setFormData,
                setErrorMessages,
                isCreateTourTemplate: drawerData?.type === DRAWER_TYPE.TOUR_TEMPLATE,
                maxServiceTime: serviceTime,
              }}
            />
          </Box>
        ) : [DRAWER_TYPE.REASSIGNMENT, DRAWER_TYPE.EDIT_REASSIGNMENT].includes(drawerData?.type) ? (
          <ReassignShift
            {...{
              handleChangeValue: handleChangeAssignmentValue,
              assignmentValue,
              allOfficers,
              shiftDetail,
              setChangeDate,
              setReassignmentErrors,
              reassignmentErrors,
              setAssignmentValue,
            }}
          />
        ) : (
          <AssignShift
            {...{
              changeOnlyDrawerType,
              handleChangeValue: handleChangeAssignmentValue,
              formDataTours,
              setFormDataTours,
              setDeletedTours,
              assignmentValue,
              setAssignmentValue,
              reports: reports || [],
              checkpoints,
              shiftDetail,
              drawerData,
              errorMessagesTours,
              setErrorMessagesTours,
              allOfficers,
              locations,
              loading,
            }}
          />
        )}
      </Layout>
    </SideDrawer>
  );
};

export default AssignmentSideDrawer;

AssignmentSideDrawer.propTypes = {
  drawerData: PropTypes.object,
  closeSideDrawer: PropTypes.func,
  callbackUponAssignment: PropTypes.func,
  changeOnlyDrawerType: PropTypes.func,
  onOpenDedicatedSplitShift: PropTypes.func,
};
