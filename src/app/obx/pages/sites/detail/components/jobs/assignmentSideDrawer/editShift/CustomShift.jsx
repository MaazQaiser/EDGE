import { Box, InputLabel, Typography } from '@mui/material';
import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CustomDropDown from 'src/app/components/common/customDropDown';
import ResponsiveDatePickers from 'src/app/components/common/datePicker';
import DaysSelection from 'src/app/components/common/daysSelection';
import FieldError from 'src/app/components/common/fieldError';
import {
  dayjsWithTimezone,
  getDaysBetweenDatesRangeWrtStandardDate,
  getDisabledDaysFromEnabledDays,
  getEmbededDateAndTimeWRTStandardOffset,
  getTimezone,
} from 'src/app/obx/pages/schedules/helper';
import { ReactComponent as InfoIcon } from 'src/assets/svg/infoCurrentColor.svg?react';
import { isObjectEmpty } from 'src/helper/utilityFunctions';
import { useTenantLabel } from 'src/helper/utilityHooks';
import { daysOfWeekWithVal } from 'src/utils/constants';

import { useStyles } from '../assignmentSideDrawer.styles';
import OfficerDropdown from '../AssignShift/OfficerDropdown';

const CustomShift = ({
  formData = {},
  handleInputChange = () => {},
  errorMessages = {},
  locations = [],
  allOfficers,
  setAssignmentValue = () => {},
  shiftDetail = {},
}) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const { getLabel } = useTenantLabel();

  const missingShiftStatus =
    shiftDetail == null ||
    typeof shiftDetail !== 'object' ||
    !Object.hasOwn(shiftDetail || {}, 'shiftStatus');

  const [disabledDays, setDisabledDays] = useState([]);

  // Raw picker values — drive display and day-of-week calculation.
  // assignmentValue.startDate/endDate hold the shift-time-embedded versions for the payload.
  const [pickerStartDate, setPickerStartDate] = useState(null);
  const [pickerEndDate, setPickerEndDate] = useState(null);

  // Embed the shift's occurrence start time into a raw picker calendar date so that
  // assignmentDuration.start in the payload lands on the correct UTC day.
  const embedShiftTime = useCallback(
    (date) => {
      if (!date || !shiftDetail?.selectedShiftStartTime) return date;
      const datePart = dayjsWithTimezone(date).format('YYYY-MM-DD');
      return getEmbededDateAndTimeWRTStandardOffset(shiftDetail.selectedShiftStartTime, datePart);
    },
    [shiftDetail?.selectedShiftStartTime],
  );

  useEffect(() => {
    const assignmentMinDate = shiftDetail?.assignmentMinDate || formData?.shiftDate;
    setPickerStartDate(embedShiftTime(assignmentMinDate));
    setPickerEndDate(embedShiftTime(assignmentMinDate));
    setAssignmentValue((prev) => ({
      ...prev,
      startDate: embedShiftTime(assignmentMinDate),
      endDate: embedShiftTime(assignmentMinDate),
      officer: {
        ...prev?.officer,
        selectedDates: [],
        selectedDays: [],
      },
    }));
  }, [setAssignmentValue, embedShiftTime, shiftDetail?.assignmentMinDate, formData?.shiftDate]);

  const daysBetweenDates = useMemo(() => {
    if (!pickerStartDate || !pickerEndDate) return [];
    const rangeWeekdays = getDaysBetweenDatesRangeWrtStandardDate(pickerStartDate, pickerEndDate);
    const shiftTemplateDays = shiftDetail?.shiftDays || [];
    return rangeWeekdays.filter((day) => shiftTemplateDays.includes(day));
  }, [pickerStartDate, pickerEndDate, shiftDetail?.shiftDays]);

  useEffect(() => {
    if (daysBetweenDates?.length > 0 && shiftDetail?.shiftDays) {
      const enabledDays = daysBetweenDates.filter((day) => shiftDetail?.shiftDays.includes(day));
      const disabledDays = getDisabledDaysFromEnabledDays(enabledDays, t);
      setDisabledDays(disabledDays);
    } else if (shiftDetail?.shiftDays) {
      // If start or end is not selected and shiftDays exists then disable all days
      setDisabledDays(daysOfWeekWithVal(t)?.map((val) => val.value));
    }
  }, [shiftDetail?.shiftDays, daysBetweenDates, t]);

  const isStartEndDateExists = pickerStartDate && pickerEndDate;

  // Handler for date change
  const handleDateChange = (key, value) => {
    if (!setAssignmentValue) return;

    const isValid = value && dayjs(value)?.isValid();
    const specificRequiredMsg =
      key === 'startDate'
        ? t('obx.schedules.assignDedicatedDuty.assignShift.startDateRequired')
        : t('obx.schedules.assignDedicatedDuty.assignShift.endDateRequired');

    if (isValid) {
      // Keep raw picker value in local state for display and day-of-week calculation.
      if (key === 'startDate') setPickerStartDate(value);
      else setPickerEndDate(value);
    }

    setAssignmentValue((prev) => ({
      ...prev,
      // Store the shift-time-embedded value so the payload's assignmentDuration.start/end
      // aligns with the correct UTC day without any extra conversion in handleSubmit.
      [key]: isValid ? embedShiftTime(value) : prev?.[key],
      [`${key}Error`]: isValid ? '' : specificRequiredMsg,
    }));
  };

  // Handler for days selection
  const handleDaysChange = (e) => {
    if (setAssignmentValue) {
      const selectedDays = e.target.value;
      const hasOfficer = formData?.officer?.value?.id;
      const hasValidDates = formData?.startDate && formData?.endDate;

      const daysError =
        hasOfficer && hasValidDates && (!selectedDays || selectedDays?.length === 0)
          ? t('obx.schedules.assignDedicatedDuty.assignShift.atLeastOneDayRequired')
          : '';

      setAssignmentValue((prev) => ({
        ...prev,
        officer: {
          ...prev?.officer,
          selectedDays: selectedDays,
          error: {
            ...prev?.officer?.error,
            days: daysError,
          },
        },
      }));
    }
  };

  // Update the selected days based on the start date and end date
  useEffect(() => {
    if (isStartEndDateExists) {
      const selectedDates = [pickerStartDate, pickerEndDate];
      setAssignmentValue((prev) => ({
        ...prev,
        officer: {
          ...prev?.officer,
          selectedDates,
          selectedDays: daysBetweenDates,
          error: {
            ...prev?.officer?.error,
            days: daysBetweenDates?.length ? '' : prev?.officer?.error?.days,
          },
        },
        startDateError: '',
        endDateError: '',
      }));
      return;
    }

    setAssignmentValue((prev) => ({
      ...prev,
      officer: {
        ...prev?.officer,
        selectedDates: [],
        selectedDays: [],
        error: { ...prev?.officer?.error, days: '' },
      },
    }));
  }, [daysBetweenDates, pickerEndDate, pickerStartDate, isStartEndDateExists, setAssignmentValue]);

  return (
    <Box>
      <Box className={classes.assignShiftBodyW}>
        {/* Start Date and End Date */}
        <Box className={classes.assignShiftBodyContentRow}>
          <Box className={classes.assignShiftBodyContentRowActions}>
            <Box className={classes.createToursInput}>
              <InputLabel>
                {t('obx.schedules.assignDedicatedDuty.assignShift.customShift.startDate')}
              </InputLabel>
              <ResponsiveDatePickers
                value={pickerStartDate || null}
                onChange={(value) => handleDateChange('startDate', value)}
                placeholder={t(
                  'obx.schedules.assignDedicatedDuty.assignShift.customShift.startDatePlaceholder',
                )}
                timezone={getTimezone()}
                disabled={missingShiftStatus}
                error={!!formData?.startDateError}
              />
              <FieldError error={formData?.startDateError} />
            </Box>
            <Box className={classes.createToursInput}>
              <InputLabel>
                {t('obx.schedules.assignDedicatedDuty.assignShift.customShift.endDate')}
              </InputLabel>
              <ResponsiveDatePickers
                value={pickerEndDate || null}
                onChange={(value) => handleDateChange('endDate', value)}
                placeholder={t(
                  'obx.schedules.assignDedicatedDuty.assignShift.customShift.endDatePlaceholder',
                )}
                disabled={missingShiftStatus}
                timezone={getTimezone()}
                error={!!formData?.endDateError}
              />
              <FieldError error={formData?.endDateError} />
            </Box>
          </Box>
        </Box>

        {/* Shift Days */}
        {isStartEndDateExists && (
          <Box className={classes.assignShiftBodyContentRow}>
            <Box className={classes.createToursInput}>
              <InputLabel>
                {t('obx.schedules.assignDedicatedDuty.assignShift.customShift.shiftDays')}
              </InputLabel>
              <Box className={classes.DaysWrap}>
                <DaysSelection
                  name="shiftDays"
                  selectedDays={formData?.officer?.selectedDays}
                  truncateTo={3}
                  data={daysOfWeekWithVal(t)}
                  handleChange={handleDaysChange}
                  styledClass={classes.selectedDaysBtns}
                  disabled={disabledDays}
                  error={!!formData?.officer?.error?.days?.length}
                />
              </Box>
              <FieldError error={formData?.officer?.error?.days} />
            </Box>
          </Box>
        )}

        {/* Location and Officer Selection */}
        <Box className={classes.assignShiftBodyContentRow}>
          <Box className={classes.assignShiftBodyContentRowActions}>
            <Box className={classes.createToursInput}>
              <InputLabel>
                {t('obx.schedules.assignDedicatedDuty.assignShift.title.location')}
              </InputLabel>
              <CustomDropDown
                label={t('obx.schedules.assignDedicatedDuty.assignShift.locationPlaceholder')}
                placeHolder={t('obx.schedules.assignDedicatedDuty.assignShift.locationPlaceholder')}
                name="location"
                selectedValues={formData?.location?.value || {}}
                options={locations}
                handleChange={handleInputChange}
                bordered
                className={classes.assignShiftBodyDropDown}
                isError={!!formData?.location?.error?.value}
                disabled={missingShiftStatus}
              />
              <FieldError error={formData?.location?.error?.value} />
              <Box className={classes.locationInfoWrapper}>
                <Box className={classes.titleWrapper}>
                  <InfoIcon className={classes.locationInfoIcon} />
                  <Typography variant="body2" className={classes.thisShiftSettingTextDescription}>
                    {t('obx.schedules.assignDedicatedDuty.assignShift.locationInfo', {
                      defaultValue: 'Applies within the selected date range only',
                    })}
                  </Typography>
                </Box>
              </Box>
            </Box>
            <Box className={classes.createToursInput}>
              <InputLabel>
                {t('obx.schedules.assignDedicatedDuty.assignShift.title.officer', {
                  officer: getLabel('roles', 'officer', t),
                })}
              </InputLabel>
              <OfficerDropdown
                handleChangeValue={handleInputChange}
                selectedValue={formData?.officer?.value || {}}
                allOfficers={allOfficers}
                name={'officer'}
                errorMsg={errorMessages['officer']}
                disabled={missingShiftStatus || isObjectEmpty(allOfficers)}
                label={t('obx.schedules.assignDedicatedDuty.assignShift.officerPlaceholder', {
                  officer: getLabel('roles', 'officer', t),
                })}
                placeHolder={t('obx.schedules.assignDedicatedDuty.assignShift.officerPlaceholder', {
                  officer: getLabel('roles', 'officer', t),
                })}
                maxWidth="400px"
              />
              <FieldError error={errorMessages['officer']} />
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

CustomShift.propTypes = {
  formData: PropTypes.object,
  handleInputChange: PropTypes.func,
  errorMessages: PropTypes.object,
  locations: PropTypes.array,
  allOfficers: PropTypes.object,
  setAssignmentValue: PropTypes.func,
  shiftDetail: PropTypes.object,
};

export default CustomShift;
