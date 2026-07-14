import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import SideDrawer from 'src/app/components/common/sideDrawer';
import {
  dayjsWithStandardOffset,
  getCurrentTimeWithDisabledDlsInIso,
  getDaysWrtTimezoneAsPerStandardTime,
  getDisabledDaysFromEnabledDays,
  getEmbededDateAndTimeWRTStandardOffset,
  getHoursDiff24HourFormat,
  getLastShiftStartEndTimeOfJob,
  getSplittedShiftName,
  getStartEndTimeWithDesiredDate,
  isShiftScheduleFullyCancelled,
  selectDayNumber,
} from 'src/app/obx/pages/schedules/helper';
import { convertMinutesToHMFormat } from 'src/helper/utilityFunctions';
import useDateTime from 'src/hooks/useDateTime';
import { fetchShiftDetailForSplittingById, splitShift } from 'src/services/duty.services';
import { fetchSettingsPreferences } from 'src/services/settings.services';
import { dayjsFormatsEnum, toastSettings } from 'src/utils/constants';
import { numberToDays, SPLIT_TYPE } from 'src/utils/constants/schedules';
import { toaster } from 'src/utils/toast';

import { sortSplittedShifts } from '..';
import Layout from '../assignmentSideDrawer/Layout';
import SplitJob from './splitJob';

export const defaultSplittedShift = {
  key: 1,
  startsAt: null,
  endsAt: null,
  selectedDays: [], // 0 - 6
  allocatedHours: 0,
  errors: [],
};

const dateForValidation = dayjs('2024-01-01'); // choose this date, because it will always return standard time and not DLS time in any case.

const SplitJobSideDrawer = ({ drawerData, closeSideDrawer, callbackUponSplitting }) => {
  const { t } = useTranslation();
  const [shiftDetail, setShiftDetail] = useState({});
  const [defaultShiftDurationInHrs, setDefaultShiftDurationInHrs] = useState(null);
  const [selectSplitType, setSelectSplitType] = useState('');
  const [customSplittedShifts, setCustomSplittedShifts] = useState([defaultSplittedShift]);
  const [defaultSplittedShifts, setDefaultSplittedShifts] = useState([defaultSplittedShift]);
  const [deletedSplittedShifts, setDeletedSplittedShifts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [disableActionBtn, setDisableActionBtn] = useState(false);
  const { formatDayjsDateTime } = useDateTime();

  const fetchShiftDetailAndPreferences = async () => {
    try {
      setLoading(true);
      const response = await Promise.all([
        fetchShiftDetailForSplittingById(drawerData?.shiftId),
        fetchSettingsPreferences(),
      ]);

      setLoading(false);
      return {
        shiftDetailRes: response?.[0]?.data || {},
        preferencesRes: response?.[1] || {},
      };
    } catch (error) {
      setLoading(false);
      return {
        shiftDetailRes: {},
        preferencesRes: {},
      };
    }
  };

  const getShiftDetailById = async (shiftDetailRes) => {
    try {
      let { startsAt, endsAt, splitType } = shiftDetailRes;
      setSelectSplitType(splitType || SPLIT_TYPE.DEFAULT);

      const shiftDurationInHrs = getHoursDiff24HourFormat(startsAt, endsAt);
      const durationInHrsForWeek = shiftDurationInHrs * shiftDetailRes?.shiftDays?.length;

      const { startTime, endTime, isEndTimeOnNextDate, isEndTimeOnNextDateWrtStandardTime } =
        getStartEndTimeWithDesiredDate(dateForValidation, startsAt, endsAt);

      const updatedShiftDays = getDaysWrtTimezoneAsPerStandardTime(
        startTime,
        shiftDetailRes?.shiftDays,
      );

      let additionalShiftDays = [];
      if (isEndTimeOnNextDateWrtStandardTime) {
        additionalShiftDays = updatedShiftDays?.reduce((acc, cur) => {
          const newVal = cur + 1;
          return [...acc, selectDayNumber(newVal)];
        }, []);
      }
      const enabledShiftDays = [...new Set([...(updatedShiftDays || []), ...additionalShiftDays])];
      const disabledShiftDays = getDisabledDaysFromEnabledDays(enabledShiftDays, t);

      const { lastShiftStartTime, lastShiftEndTime } = getLastShiftStartEndTimeOfJob(
        startsAt,
        endsAt,
      );

      const updatedShiftDetail = {
        ...shiftDetailRes,
        shiftDurationInHrs,
        durationInHrsForWeek,
        shiftStartTime: startTime,
        shiftEndTime: endTime,
        isEndTimeOnNextDate, // true if shift falls on two days
        isEndTimeOnNextDateWrtStandardTime,
        additionalShiftDays,
        shiftDays: updatedShiftDays,
        allShiftDays: enabledShiftDays,
        disabledShiftDays,
        lastShiftStartTime,
        lastShiftEndTime,
      };

      populateSplittedShifts(updatedShiftDetail);

      setShiftDetail(updatedShiftDetail);
    } catch (error) {
      setShiftDetail({});
    }
  };

  // set splitted shifts State
  const populateSplittedShifts = (shiftDetail) => {
    let splittedShiftsRes = [];

    const standardDate = dayjsWithStandardOffset().format('YYYY-MM-DD');

    splittedShiftsRes = sortSplittedShifts(shiftDetail?.splitShifts)?.map((shift, index) => {
      const startsAtWRTCurrentDate = getEmbededDateAndTimeWRTStandardOffset(
        shift?.startsAt,
        standardDate,
      );
      const endsAtWRTCurrentDate = getEmbededDateAndTimeWRTStandardOffset(
        shift?.endsAt,
        standardDate,
      );

      const updatedStartsAt = startsAtWRTCurrentDate;
      const updatedEndsAt = endsAtWRTCurrentDate;

      return {
        key: index,
        id: shift?.id,
        name: shift?.name,
        startsAt: updatedStartsAt,
        endsAt: updatedEndsAt,
        selectedDays: getDaysWrtTimezoneAsPerStandardTime(updatedStartsAt, shift?.shiftDays),
        allocatedHours: getHoursDiff24HourFormat(shift?.startsAt, shift?.endsAt),
      };
    });

    // set splitted shifts, if shift is already "custom" splitted
    if (shiftDetail?.splitType === SPLIT_TYPE.CUSTOM) {
      return setCustomSplittedShifts(splittedShiftsRes || []);
    }
    return setDefaultSplittedShifts(splittedShiftsRes || []);
  };

  const getDefaultShiftDuration = async (preferencesRes) => {
    try {
      let duration = null;
      if (preferencesRes?.statusCode === 200) {
        preferencesRes?.data?.preferences?.shifts?.forEach((shift) => {
          if (shift?.slug === 'max_shift_duration') {
            duration = shift?.timeValue;
          }
        });
      }

      if (!duration) {
        toaster.error({
          text: t('obx.schedules.assignDedicatedDuty.errors.shiftDurationError'),
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
      }

      setDefaultShiftDurationInHrs(duration);
    } catch (error) {
      setDefaultShiftDurationInHrs(null);
    }
  };

  // get shift detail and default shift duration
  useEffect(() => {
    fetchShiftDetailAndPreferences().then((res) => {
      if (isShiftScheduleFullyCancelled(res.shiftDetailRes)) {
        toaster.info({
          text: t('obx.schedules.assignDedicatedDuty.assignShift.shiftScheduleCancelled'),
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
        closeSideDrawer();
        return;
      }
      getShiftDetailById(res.shiftDetailRes);
      getDefaultShiftDuration(res.preferencesRes);
    });
  }, []);

  const getErrorsOfAllocatedHoursCount = ({ allocatedHoursCountWRTDays }) => {
    let errors = [];

    Object.entries(allocatedHoursCountWRTDays)?.forEach(([key, value]) => {
      const primaryDay = Number(key);
      const secondaryDay = selectDayNumber(primaryDay + 1);

      const totalMins = ((value[0] || null) + (value[1] || null)) * 60;
      const shiftDurationInMins = shiftDetail?.shiftDurationInHrs * 60;

      // If day from splitted shift exist and allocated hours for that day are not completed yet
      if (
        shiftDetail?.shiftDays?.includes(primaryDay) &&
        Math.round(totalMins) !== Math.round(shiftDurationInMins)
      ) {
        errors.push(
          t(
            'obx.schedules.assignDedicatedDuty.splitDuties.splitType.custom.error.invalidAllocatedHoursError',
            {
              time1: `${numberToDays[primaryDay]}(${formatDayjsDateTime({
                value: shiftDetail?.startsAt,
                formatType: dayjsFormatsEnum.time,
              })})`,
              time2: `${shiftDetail?.isEndTimeOnNextDateWrtStandardTime ? numberToDays[secondaryDay] : ''}(${formatDayjsDateTime(
                {
                  value: shiftDetail?.endsAt,
                  formatType: dayjsFormatsEnum.time,
                },
              )})`,
              allocatedHours: convertMinutesToHMFormat(totalMins),
              total: convertMinutesToHMFormat(shiftDurationInMins),
            },
          ),
        );
      }
    });

    const allocatedMinsForWeek = shiftDetail?.allocatedHoursForWeek * 60;
    const durationInMinsForWeek = shiftDetail?.durationInHrsForWeek * 60;
    if (Math.round(allocatedMinsForWeek) !== Math.round(durationInMinsForWeek)) {
      errors.push(
        t(
          'obx.schedules.assignDedicatedDuty.splitDuties.splitType.custom.error.totalAllocatedHoursError',
          {
            allocatedHours: convertMinutesToHMFormat(allocatedMinsForWeek),
            total: convertMinutesToHMFormat(durationInMinsForWeek),
          },
        ),
      );
    }

    return errors;
  };

  const invalidDaySelection = ({ primaryDay, allocatedHoursCount }) => {
    const errors = [];
    if (shiftDetail?.shiftDays?.includes(primaryDay)) {
      return errors;
    }

    if (allocatedHoursCount?.[0]) {
      errors.push(
        t(
          'obx.schedules.assignDedicatedDuty.splitDuties.splitType.custom.error.invalidDaySelection',
          {
            day: numberToDays[primaryDay],
          },
        ),
      );
    }
    if (allocatedHoursCount?.[1]) {
      errors.push(
        t(
          'obx.schedules.assignDedicatedDuty.splitDuties.splitType.custom.error.invalidTimeSelection',
          {
            day: numberToDays[selectDayNumber(primaryDay + 1)],
          },
        ),
      );
    }

    return errors;
  };
  const invalidStartEndTime = ({ splittedShiftStartTime, splittedShiftEndTime, day }) => {
    const errors = [];

    // check if start time is before shift start time or after shift end time
    if (
      splittedShiftStartTime < shiftDetail?.shiftStartTime ||
      splittedShiftStartTime > shiftDetail?.shiftEndTime
    ) {
      errors.push(
        t('obx.schedules.assignDedicatedDuty.splitDuties.splitType.custom.error.invalidStartTime', {
          day: numberToDays[day],
        }),
      );
    }

    // check if end time is after shift end time or before shift start time
    if (
      splittedShiftEndTime < shiftDetail?.shiftStartTime ||
      splittedShiftEndTime > shiftDetail?.shiftEndTime
    ) {
      errors.push(
        t('obx.schedules.assignDedicatedDuty.splitDuties.splitType.custom.error.invalidEndTime', {
          day: numberToDays[day],
        }),
      );
    }

    return errors;
  };
  const requiredCheck = ({ startTime, endTime, isDaySelected }) => {
    const errors = [];
    startTime = dayjs(startTime);
    endTime = dayjs(endTime);
    if (!startTime?.isValid?.()) {
      errors.push(
        t('obx.schedules.assignDedicatedDuty.splitDuties.splitType.custom.error.requiredStartTime'),
      );
    }
    if (!endTime?.isValid?.()) {
      errors.push(
        t('obx.schedules.assignDedicatedDuty.splitDuties.splitType.custom.error.requiredEndTime'),
      );
    }
    if (!isDaySelected) {
      errors.push(
        t('obx.schedules.assignDedicatedDuty.splitDuties.splitType.custom.error.requiredDay'),
      );
    }

    return errors;
  };

  const startTimeOverlappedError = ({ splittedShiftStartTime, splittedShiftKey, selectedDay }) => {
    let errors = [];

    const updatedSplittedShifts = getCustomSplittedShiftsWithUpdatedTime();
    const matchedSplittedShiftIdx = updatedSplittedShifts?.findIndex((shift) => {
      if (
        shift?.key !== splittedShiftKey && // same shift should not checked
        shift?.shiftPrimaryDays?.includes(selectedDay) && // selectedDay should exist in shift primary days
        splittedShiftStartTime >= shift?.splittedShiftStartTime &&
        splittedShiftStartTime < shift?.splittedShiftEndTime
      ) {
        return true;
      }
      return false;
    });

    if (matchedSplittedShiftIdx !== -1) {
      errors.push(
        t('obx.schedules.assignDedicatedDuty.splitDuties.splitType.custom.error.timeOverlapped', {
          name: getSplittedShiftName(t, shiftDetail?.shiftNumber, matchedSplittedShiftIdx),
          day: numberToDays[selectedDay],
        }),
      );
    }

    return errors;
  };

  const getCustomSplittedShiftsWithUpdatedTime = () => {
    return customSplittedShifts?.map((splittedShift) => {
      if (
        !dayjs(splittedShift?.startsAt).isValid() ||
        !dayjs(splittedShift?.endsAt).isValid() ||
        !splittedShift?.selectedDays?.length
      ) {
        return {
          ...splittedShift,
          splittedShiftStartTime: null,
          splittedShiftEndTime: null,
        };
      }

      const { startTime, endTime, isSecondaryDay } = getStartEndTimeForValidation({
        selectedStartTime: splittedShift?.startsAt,
        selectedEndTime: splittedShift?.endsAt,
        isEndTimeOnNextDateWrtStandardTime: shiftDetail?.isEndTimeOnNextDateWrtStandardTime,
        shiftStartTime: shiftDetail?.shiftStartTime,
      });

      // we are in secondary day, convert shift selected days into primary days
      const shiftPrimaryDays = isSecondaryDay
        ? splittedShift?.selectedDays?.map((day) => selectDayNumber(Number(day) - 1))
        : splittedShift?.selectedDays;

      return {
        ...splittedShift,
        splittedShiftStartTime: startTime,
        splittedShiftEndTime: endTime,
        isSecondaryDay,
        shiftPrimaryDays: shiftPrimaryDays,
      };
    });
  };

  const splittedShiftsWithStartEndTimeError = () => {
    // updated shift start/end time WRT to current Date

    const zeroAllocatedHoursForEachDay = shiftDetail?.shiftDays?.reduce((acc, day) => {
      return { ...acc, [day]: [0, null] };
    }, {});
    let allocatedHoursCountWRTDays = { ...zeroAllocatedHoursForEachDay };

    const updatedSplittedShifts = getCustomSplittedShiftsWithUpdatedTime();

    const splittedShiftsWithErrors = updatedSplittedShifts?.map((splittedShift) => {
      const errors = [];

      // check if start time, end time and day contains any value
      errors.push(
        ...requiredCheck({
          startTime: splittedShift?.startsAt,
          endTime: splittedShift?.endsAt,
          isDaySelected: splittedShift?.selectedDays?.length > 0,
        }),
      );
      if (errors?.length > 0)
        return {
          ...splittedShift,
          errors: [...errors],
        };

      const { splittedShiftStartTime, splittedShiftEndTime, isSecondaryDay } = splittedShift || {};

      // got through each selected day, and throw errors, also calculate allocated hours WRT days
      const hourPerDay = splittedShift?.selectedDays?.reduce((accDays, day) => {
        let primaryDay = day;

        if (isSecondaryDay) {
          primaryDay = selectDayNumber(day - 1); // as day is secondary day, hence decrease day by 1 to get primary day
        }

        const allocatedHoursCount = [
          isSecondaryDay ? null : splittedShift?.allocatedHours, // primary day value
          isSecondaryDay ? splittedShift?.allocatedHours : null, // secondary day value
        ];

        // if a day is selected which does not exist in shift days
        errors.push(...invalidDaySelection({ primaryDay, allocatedHoursCount }));
        // if start or end time is invalid
        errors.push(...invalidStartEndTime({ splittedShiftStartTime, splittedShiftEndTime, day }));
        // Check if same time range is already selected for a day
        errors.push(
          ...startTimeOverlappedError({
            splittedShiftStartTime,
            splittedShiftKey: splittedShift?.key,
            selectedDay: primaryDay,
          }),
        );

        // 0 index is primary day, and 1 index is secondary day
        let primaryDayCount = allocatedHoursCountWRTDays?.[primaryDay]?.[0] || null;
        let secondaryDayCount = allocatedHoursCountWRTDays?.[primaryDay]?.[1] || null;

        const daysCount = [
          primaryDayCount + allocatedHoursCount[0],
          secondaryDayCount + allocatedHoursCount[1],
        ];

        return {
          ...accDays,
          [primaryDay]: daysCount,
        };
      }, {});

      // set allocated hours WRT primary and secondary day. Key will always be primary day and value will be an array whose 1st index will have primary day value and 2nd index will have secondary day value
      allocatedHoursCountWRTDays = {
        ...allocatedHoursCountWRTDays,
        ...hourPerDay,
      };
      return {
        ...splittedShift,
        errors: [...errors],
      };
    });

    return { splittedShiftsWithErrors, allocatedHoursCountWRTDays };
  };

  const checkCustomSplittingErrors = () => {
    // set errors on each splitted shift, if there is any
    const { splittedShiftsWithErrors, allocatedHoursCountWRTDays } =
      splittedShiftsWithStartEndTimeError();
    setCustomSplittedShifts([...splittedShiftsWithErrors]);

    // check if there are any errors of splitted shifts or shift detail
    const isSplittedShiftsErrorExists = splittedShiftsWithErrors?.some(
      (shift) => shift?.errors?.length > 0,
    );
    if (isSplittedShiftsErrorExists) {
      return true;
    }

    // set errors for all splitted shifts at a time, if there is any
    const allocatedHoursCountErrors = getErrorsOfAllocatedHoursCount({
      allocatedHoursCountWRTDays,
    });
    setShiftDetail((prev) => ({
      ...prev,
      errors: allocatedHoursCountErrors,
    }));

    if (allocatedHoursCountErrors?.length > 0) {
      return true;
    }

    return false;
  };

  const handleSubmit = async () => {
    if (!shiftDetail?.id || !selectSplitType) return;

    // clear error states
    setShiftDetail((prev) => ({
      ...prev,
      errors: [],
    }));

    if (selectSplitType === SPLIT_TYPE.CUSTOM) {
      const error = checkCustomSplittingErrors();
      if (error) {
        return toaster.info({
          text: t('obx.schedules.assignDedicatedDuty.splitDuties.splitType.custom.error.infoMsg'),
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
      }
    }

    const payload = createPayload();
    try {
      setDisableActionBtn(true);
      const res = await splitShift({ payload, shiftId: drawerData?.shiftId });
      if (res?.statusCode === 200) {
        closeSideDrawer();
        callbackUponSplitting();
        toaster.success({
          text: res?.message,
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
      }
      setDisableActionBtn(false);
    } catch (error) {
      setDisableActionBtn(false);
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };

  const createPayload = () => {
    let splittedShifts = [];
    let deletedShiftIds = [];

    if (selectSplitType === SPLIT_TYPE.CUSTOM) {
      splittedShifts = customSplittedShifts;

      const customSplitDeletedIds =
        deletedSplittedShifts?.filter((shift) => shift?.id)?.map((shift) => shift?.id) || []; // deleted shifts using cross button
      const defaultDeletedIds =
        shiftDetail?.splitType === SPLIT_TYPE.DEFAULT
          ? shiftDetail?.splitShifts?.map((shift) => shift?.id) || []
          : [];
      deletedShiftIds = [...defaultDeletedIds, ...customSplitDeletedIds];
    }
    if (selectSplitType === SPLIT_TYPE.DEFAULT) {
      splittedShifts = defaultSplittedShifts;

      deletedShiftIds =
        shiftDetail?.splitType === SPLIT_TYPE.CUSTOM
          ? shiftDetail?.splitShifts?.map((shift) => shift?.id) || []
          : [];
    }

    const shifts = splittedShifts?.map((splittedShift, index) => {
      const updatedStartsAt = dayjs(splittedShift?.startsAt).toISOString();
      const updatedEndsAt = dayjs(splittedShift?.endsAt).toISOString();

      const selectedDays = getDaysWrtTimezoneAsPerStandardTime(
        updatedStartsAt,
        splittedShift?.selectedDays,
        true,
      );

      return {
        name: getSplittedShiftName(t, shiftDetail?.shiftNumber, index),
        startsAt: updatedStartsAt,
        endsAt: updatedEndsAt,
        shiftDays: selectedDays,
        id: splittedShift?.id,
      };
    });
    return {
      splitType: selectSplitType,
      deletedShifts: deletedShiftIds,
      shifts,
    };
  };

  return (
    <SideDrawer totalWidth={'730px'} isOpen={!!drawerData?.type}>
      <Layout
        drawerData={drawerData}
        closeSideDrawer={closeSideDrawer}
        handleSubmit={handleSubmit}
        shiftDetail={shiftDetail}
        loading={loading}
        disableActionBtn={disableActionBtn}
      >
        <SplitJob
          {...{
            shiftDetail,
            customSplittedShifts,
            setCustomSplittedShifts,
            defaultSplittedShifts,
            setDefaultSplittedShifts,
            setShiftDetail,
            defaultShiftDurationInHrs,
            selectSplitType,
            setSelectSplitType,
            setDeletedSplittedShifts,
            loading,
          }}
        />
      </Layout>
    </SideDrawer>
  );
};

export default SplitJobSideDrawer;

SplitJobSideDrawer.propTypes = {
  drawerData: PropTypes.object,
  closeSideDrawer: PropTypes.func,
  callbackUponSplitting: PropTypes.func,
};

export const getStartEndTimeForValidation = ({
  selectedStartTime,
  selectedEndTime,
  isEndTimeOnNextDateWrtStandardTime,
  shiftStartTime,
}) => {
  const currentDayMidNightInIso = getCurrentTimeWithDisabledDlsInIso(dateForValidation);

  const startsAtWithStandardOffset = dayjs(selectedStartTime).toISOString();
  const endsAtWithStandardOffset = dayjs(selectedEndTime).toISOString();

  // updated start time WRT to current Date

  const selectedDateStartsAt = getEmbededDateAndTimeWRTStandardOffset(
    startsAtWithStandardOffset,
    dateForValidation,
  )?.toISOString();

  // if shift falls from one day to other and splitted shift start time is after 12 AM and before start time of shift, it means we are in secondary day
  const isSecondaryDay =
    isEndTimeOnNextDateWrtStandardTime &&
    selectedDateStartsAt >= currentDayMidNightInIso &&
    selectedDateStartsAt < shiftStartTime;

  // append 1 date
  const { startTime, endTime } = getStartEndTimeWithDesiredDate(
    isSecondaryDay
      ? dayjs(dateForValidation)?.date(dayjs(dateForValidation).get('date') + 1)
      : dayjs(dateForValidation),
    startsAtWithStandardOffset,
    endsAtWithStandardOffset,
  );

  return { startTime, endTime, isSecondaryDay };
};
