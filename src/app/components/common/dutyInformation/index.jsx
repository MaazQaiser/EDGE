import { Button, InputLabel, Switch, TextField, Typography } from '@mui/material';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { ReactComponent as CloseIcon } from 'assets/svg/close.svg?react';
import { ReactComponent as PlusIcon } from 'assets/svg/plus.svg?react';
import DateRangePicker from 'commonComponents/RangeDatepicker';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import RequiredAsterik from 'src/app/components/common/requiredAsterik';
import { serviceTypes } from 'src/app/components/salesComponents/contractCreation/addServices/helper';
import {
  generateRandomNumbers,
  getUniqueOrderedDaysOfWeekBetweenDates,
  isObjectEmpty,
  removeKey,
  removeKeysFromObject,
} from 'src/helper/utilityFunctions';
import { useTenantLabel } from 'src/helper/utilityHooks';
import { useCurrency } from 'src/hooks/useCurrency';
import useDateTime from 'src/hooks/useDateTime';
import transformArrayForOptions from 'src/utils/array/transformArrayForOptions';

import CustomDropDown from '../customDropDown';
import DaysSelection from '../daysSelection';
import FuelSurchargeInputDropdown from '../fuelSurchargeInputDropdown';
import ResponsiveTimePickers from '../timePicker';
import { useStyles } from './dutyInformation.styles';

dayjs.extend(utc);
dayjs.extend(timezone);

const DutyInformation = ({
  formData,
  errorMessages,
  updateFormHandler,
  formDataKey,
  dutyValueRanges,
  setErrorMessages,
  similarItemErrorKey = 'extraDutyItem',
}) => {
  const { t } = useTranslation();
  const [localValidationErrors, setLocalValidationErrors] = useState({});
  const classes = useStyles();
  const { currency: franchiseCurrency } = useCurrency();
  const { dateFormat } = useDateTime();
  const { getLabel } = useTenantLabel();

  console.log('Form Data', formData);

  const addForm = () => {
    setErrorMessages((prev) => removeKey([formDataKey], prev));
    updateFormHandler(formDataKey, [
      ...(formData?.[formDataKey] ?? []),
      {
        randomName: generateRandomNumbers(),
        startsAt: null,
        endsAt: null,
        officerCount: null,
        officerType: {},
        hourlyRate: null,
        dutyDays: [],
        dateRange: [],
        visitManagement: false,
        loadManagement: false,
        fuelSurchargeEnabled: false,
        fuelSurchargeValue: '',
        fuelSurchargeType: 'percentage',
      },
    ]);
  };
  const removeForm = (index) => {
    const updatedForms = formData?.[formDataKey]
      .map((form, i) => {
        if (i === index && form?.id) {
          return { ...form, _destroy: true };
        }
        if (i === index && !form?.id) {
          return {};
        }
        return form;
      })
      .filter((data) => !isObjectEmpty(data));
    updateFormHandler(formDataKey, updatedForms);
    setErrorMessages((prev) => removeKey([getErrorKey('dateRange', formDataKey, index)], prev));
    setErrorMessages((prev) => removeKey([getErrorKey('startsAt', formDataKey, index)], prev));
    setErrorMessages((prev) => removeKey([getErrorKey('endsAt', formDataKey, index)], prev));
    setErrorMessages((prev) => removeKey([getErrorKey('officerCount', formDataKey, index)], prev));
    setErrorMessages((prev) => removeKey([getErrorKey('officerType', formDataKey, index)], prev));
    setErrorMessages((prev) => removeKey([getErrorKey('hourlyRate', formDataKey, index)], prev));
    setErrorMessages((prev) => removeKey([getErrorKey('dutyDays', formDataKey, index)], prev));
    setErrorMessages((prev) => removeKey([getErrorKey('officerType', formDataKey, index)], prev));

    // remove similar duty error
    removeSimilarDutyError();
  };

  /**
   *
   * @param {*} index
   * @param {*} field
   * @param {*} value
   */
  const handleFieldChange = (index, field, value) => {
    const updatedForms = [...(formData?.[formDataKey] ?? [])];
    updatedForms[index][field] = value;
    updateFormHandler(formDataKey, updatedForms);

    const fuelFields = ['fuelSurchargeEnabled', 'fuelSurchargeValue', 'fuelSurchargeType'];
    if (fuelFields.includes(field)) {
      setErrorMessages((prev) =>
        removeKeysFromObject(prev, [
          getErrorKey('fuelSurchargeValue', formDataKey, index),
          getErrorKey('fuelSurchargeType', formDataKey, index),
        ]),
      );
      return;
    }

    if (value) {
      const errorKey = getErrorKey(field, formDataKey, index);
      setErrorMessages((prev) => removeKey([errorKey], prev));
    }
  };

  console.log();
  /**
   * Generate Key for Joi
   * @param {*} key
   * @param {*} formDataKey
   * @param {*} index
   * @returns
   */
  const getErrorKey = (key, formDataKey, index) => {
    return `${formDataKey},${index},${key}`;
  };

  const removeKeysWithSubstring = (obj, substring) => {
    const newObj = {};
    Object.keys(obj).forEach((key) => {
      if (!key.includes(substring)) {
        newObj[key] = obj[key];
      }
    });
    return newObj;
  };

  const removeSimilarDutyError = () => {
    const filteredErrors = removeKeysWithSubstring(errorMessages, 'extraDutyItem');

    setErrorMessages(filteredErrors);
  };

  /**
   * Show error messages on state
   * @param {*} key
   * @param {*} formDataKey
   * @param {*} index
   * @returns
   */
  const showError = (key, formDataKey, index) => {
    return errorMessages?.[`${getErrorKey(key, formDataKey, index)}`];
  };

  const updateValueAtIndex = (index, key, newValue) => {
    setLocalValidationErrors((prevItems) => {
      // Create a copy of the previous state object
      const newObj = { ...prevItems };
      // Update the value at the specified index
      if (newValue === null) {
        delete newObj[index]; // Delete the key if the newValue is null
      } else {
        newObj[index] = { ...newObj[index], [key]: newValue }; // Update the value otherwise
      }
      // Return the updated object
      newValue
        ? setErrorMessages((prev) => ({
            ...prev,
            [getErrorKey(key, formDataKey, index)]: newValue,
          }))
        : setErrorMessages((prev) => removeKey([getErrorKey(key, formDataKey, index)], prev));
      return newObj;
    });
  };

  const handleDateRangeSelection = (startsAt, endsAt, dates, index, key = '') => {
    const [startDate, endDate] = dates;
    if (JSON.stringify(dates) === JSON.stringify(formData?.[formDataKey]?.[index]?.dateRange)) {
      return;
    }
    // const differenceInDays = Math.abs(startDate?.diff(endDate, 'day')) || null;
    // if (differenceInDays > 7) {
    //   updateValueAtIndex(index, 'dateRange', t('obx.schedules.maxSevenDays'));
    //   return;
    // }
    // const currentValues = formData?.[formDataKey]?.[index];
    updateValueAtIndex(index, 'dateRange', null);
    handleFieldChange(index, 'dateRange', [startDate, endDate]);
    handleFieldChange(index, 'selectDays', true);
    handleFieldChange(index, 'dutyDays', []);

    // NOTE: whenever there is a change in date startsAt and endsAt fields have to be selected again
    handleFieldChange(index, 'startsAt', null);
    handleFieldChange(index, 'endsAt', null);

    // Remove Error messages from startsAt and endsAt if any
    updateValueAtIndex(index, 'startsAt');
    updateValueAtIndex(index, 'endsAt');

    removeSimilarDutyError();
    setErrorMessages((prev) =>
      removeKey([getErrorKey(key || similarItemErrorKey, formDataKey, index)], prev),
    );
  };

  const handleRange = (index, event, min, max) => {
    const { name, value } = event.target;
    if (!value || parseFloat(value) > parseFloat(max) || parseFloat(value) < parseFloat(min)) {
      updateValueAtIndex(index, name, t('obx.schedules.valueRange', { min: min || 0, max: max }));
      return;
    }
    updateValueAtIndex(index, name, null);
  };
  const officerDataSet = [
    {
      id: 'armed_officer',
      name: `Armed ${getLabel('roles', 'officer', t) || 'Officer'}`,
    },
    {
      id: 'dedicated_officer',
      name: `${getLabel('terms', 'dedicated', t)} ${getLabel('roles', 'officer', t)}`,
    },
  ];
  const isTrueFlag = (value) => value === true || `${value}`.toLowerCase() === 'true';
  const filteredData = formData?.[formDataKey]?.filter((data) => !data?._destroy);
  const isFlatContract = isTrueFlag(formData?.isFlat) || isTrueFlag(formData?.IsFlat);

  const isTimeDifferenceLessThan30Minutes = (
    startTimeStr,
    endTimeStr,
    startDateStr,
    endDateStr,
  ) => {
    const startTime = dayjs(startTimeStr);
    const endTime = dayjs(endTimeStr);
    const startDate = dayjs(startDateStr);
    const endDate = dayjs(endDateStr);

    // Check if the dates are on the same day
    const sameDay = startDate.isSame(endDate, 'day');

    if (sameDay) {
      // Calculate the difference in minutes
      const minutesDiff = endTime.diff(startTime, 'minute');
      // Check if the difference is less than 30 minutes
      return minutesDiff < 30;
    } else {
      // If the dates are on different days, check if the time difference is less than 30 minutes
      // const hoursDiff = endTime.diff(startTime, 'hour');
      // If the time difference is exactly 24 hours or less, and the end time is greater than the start time
      if (endTime.isAfter(startTime)) {
        // Calculate the difference in minutes
        const minutesDiff = endTime.diff(startTime, 'minute');
        // Check if the difference is less than 30 minutes
        return minutesDiff < 30;
      } else {
        // If the time difference is greater than 24 hours or the end time is not greater than the start time,
        // then return false
        return false;
      }
    }
  };
  return (
    <>
      {filteredData?.map((dutyInformation, index) => {
        const daysBetweenDates = getUniqueOrderedDaysOfWeekBetweenDates(
          dutyInformation?.dateRange?.[0],

          dutyInformation?.dateRange?.[1],
        );

        return (
          <Box key={dutyInformation?.randomName} className={classes.dutyInformation}>
            <Box className={classes.dutyInformationContent}>
              <Box className={classes.dutyInformationGrid}>
                <Box className={classes.dutyInformationDateRange}>
                  <InputLabel> {t('obx.schedules.dutyDuration')}</InputLabel>
                  <DateRangePicker
                    key={`${dutyInformation.randomName}`}
                    selectedDates={dutyInformation?.dateRange}
                    setDates={(dates) => {
                      handleDateRangeSelection('startsAt', 'endsAt', dates, index, 'dateRange');
                    }}
                    placeHolder={dateFormat}
                    // enableSingleDateSelection={true}
                    // minDate={dayjs()}
                  />
                  {(localValidationErrors?.[index]?.dateRange ||
                    errorMessages?.[getErrorKey('dateRange', 'extraDuties', index)]) && (
                    <Box className={classes.invalidFeedback}>
                      {localValidationErrors?.[index]?.dateRange ||
                        errorMessages?.[getErrorKey('dateRange', 'extraDuties', index)]}
                    </Box>
                  )}
                </Box>
                <Box className={classes.dutyInformationDropdownCustom}>
                  <InputLabel>
                    {t('obx.ho_franchise.detail.franchise_information.officerType', {
                      officer: getLabel('roles', 'officer', t),
                    })}
                  </InputLabel>
                  <CustomDropDown
                    label={t('obx.schedules.assignDedicatedDuty.assignShift.officerPlaceholder', {
                      officer: getLabel('roles', 'officer', t),
                    })}
                    options={transformArrayForOptions(officerDataSet, 'name', 'id')}
                    selectedValues={dutyInformation?.officerType || {}}
                    handleChange={(e) => {
                      handleFieldChange(index, 'officerType', e.target.value);
                    }}
                    name="officerType"
                    placeHolder={t(
                      'obx.schedules.assignDedicatedDuty.assignShift.officerPlaceholder',
                      {
                        officer: getLabel('roles', 'officer', t),
                      },
                    )}
                    className={classes.dutyInformationDropdownOfficer}
                    selectedOptionClass={classes.dutyInformationDropdownLabel}
                    isError={
                      !!showError('officerType', formDataKey, index)
                        ? showError('officerType', formDataKey, index)
                        : null
                    }
                    bordered
                  />
                  <Box className={classes.invalidFeedback}>
                    {!!showError('officerType', formDataKey, index)
                      ? showError('officerType', formDataKey, index)
                      : null}
                  </Box>
                </Box>
                <Box className={classes.dutyInformationField}>
                  {/* {{t('commonText.noOfOfficers')}}                 */}
                  <InputLabel>
                    {t('obx.ho_franchise.detail.franchise_information.noOfOfficers', {
                      officers: getLabel('terms', 'officers', t),
                    })}{' '}
                    <RequiredAsterik />
                  </InputLabel>
                  <TextField
                    className={classes.addTypeModalSectionInput}
                    error={!!showError('officerCount', formDataKey, index)}
                    id="outlined-search"
                    onChange={(e) => {
                      handleFieldChange(index, e.target.name, e.target.value);
                    }}
                    name="officerCount"
                    value={dutyInformation?.officerCount || ''}
                    placeholder={t('commonText.noOfOfficers', {
                      officers: getLabel('terms', 'officers', t),
                    })}
                    variant="outlined"
                    type="number"
                    onBlur={(e) => handleRange(index, e, 1, 99)}
                    helperText={
                      !!showError('officerCount', formDataKey, index)
                        ? showError('officerCount', formDataKey, index)
                        : null
                    }
                  />
                </Box>
                <Box className={classes.dutyInformationField}>
                  <InputLabel>{t('obx.form.input.textField.startTime.label')}</InputLabel>
                  <ResponsiveTimePickers
                    useLocalTimeZone
                    value={dutyInformation?.startsAt || null}
                    onChange={(value) => {
                      removeSimilarDutyError();
                      handleFieldChange(index, 'startsAt', value);

                      if (
                        daysBetweenDates.length === 1 &&
                        dutyInformation?.endsAt &&
                        value >= dutyInformation?.endsAt
                      ) {
                        updateValueAtIndex(
                          index,
                          'startsAt',
                          t('obx.schedules.startTimeBeforeEnd'),
                        );
                        return;
                      }
                      if (
                        dutyInformation?.endsAt &&
                        value &&
                        isTimeDifferenceLessThan30Minutes(
                          value,
                          dutyInformation.endsAt,
                          dutyInformation?.dateRange?.[0],
                          dutyInformation?.dateRange?.[1],
                        )
                      ) {
                        updateValueAtIndex(
                          index,
                          'startsAt',
                          t('obx.schedules.timeDiffOf30minutes', {
                            extra: getLabel('terms', 'extra', t),
                          }),
                        );
                        return;
                      }

                      if (
                        dutyInformation?.endsAt &&
                        value &&
                        !isTimeDifferenceLessThan30Minutes(
                          value,
                          dutyInformation.endsAt,
                          dutyInformation?.dateRange?.[0],
                          dutyInformation?.dateRange?.[1],
                        )
                      ) {
                        updateValueAtIndex(index, 'startsAt', null);
                        updateValueAtIndex(index, 'endsAt', null);
                        return;
                      }

                      setErrorMessages((prev) =>
                        removeKey([getErrorKey('startsAt', formDataKey, index)], prev),
                      );
                      setErrorMessages((prev) =>
                        removeKey([getErrorKey(similarItemErrorKey, formDataKey, index)], prev),
                      );
                      updateValueAtIndex(index, 'startsAt', null);
                    }}
                    placeholder={`${t('obx.commonText.startTime')}`}
                    error={!!showError('startsAt', formDataKey, index)}
                    helperText={
                      !!showError('startsAt', formDataKey, index)
                        ? showError('startsAt', formDataKey, index)
                        : null
                    }
                    timezone="default"
                    timeStepsMinutes={1}
                    // disabled={!dutyInformation?.startsAt}
                  />
                </Box>
                <Box className={classes.dutyInformationField}>
                  <InputLabel>{t('obx.form.input.textField.endTime.label')}</InputLabel>
                  <ResponsiveTimePickers
                    useLocalTimeZone
                    value={dutyInformation.endsAt || null}
                    onChange={(value) => {
                      removeSimilarDutyError();
                      handleFieldChange(index, 'endsAt', value);

                      if (
                        daysBetweenDates.length === 1 &&
                        dutyInformation?.startsAt &&
                        value <= dutyInformation?.startsAt
                      ) {
                        updateValueAtIndex(index, 'endsAt', t('obx.schedules.endTimeGreater'));
                        return;
                      }
                      if (
                        dutyInformation?.startsAt &&
                        value &&
                        isTimeDifferenceLessThan30Minutes(
                          dutyInformation.startsAt,
                          value,
                          dutyInformation?.dateRange?.[0],
                          dutyInformation?.dateRange?.[1],
                        )
                      ) {
                        updateValueAtIndex(
                          index,
                          'endsAt',
                          t('obx.schedules.timeDiffOf30minutes', {
                            extra: getLabel('terms', 'extra', t),
                          }),
                        );
                        return;
                      }

                      if (
                        dutyInformation?.startsAt &&
                        value &&
                        !isTimeDifferenceLessThan30Minutes(
                          dutyInformation.startsAt,
                          value,
                          dutyInformation?.dateRange?.[0],
                          dutyInformation?.dateRange?.[1],
                        )
                      ) {
                        updateValueAtIndex(index, 'startsAt', null);
                        updateValueAtIndex(index, 'endsAt', null);
                        return;
                      }

                      setErrorMessages((prev) =>
                        removeKey([getErrorKey('endsAt', formDataKey, index)], prev),
                      );
                      setErrorMessages((prev) =>
                        removeKey([getErrorKey(similarItemErrorKey, formDataKey, index)], prev),
                      );
                      updateValueAtIndex(index, 'endsAt', null);
                    }}
                    helperText={
                      !!showError('endsAt', formDataKey, index)
                        ? showError('endsAt', formDataKey, index)
                        : null
                    }
                    error={!!showError('endsAt', formDataKey, index)}
                    placeholder={t('obx.form.input.textField.endTime.label')}
                    timezone={'default'}
                    disabled={!dutyInformation?.startsAt}
                    timeStepsMinutes={1}
                  />
                </Box>
                <Box className={classes.dutyInformationField}>
                  {/* {{t('commonText.noOfOfficers')}}                 */}
                  <InputLabel>
                    {t('obx.schedules.hourlyRateForExtraDuty', {
                      officer: getLabel('roles', 'officer', t),
                    })}{' '}
                    ({franchiseCurrency}) : <RequiredAsterik />
                  </InputLabel>
                  <TextField
                    className={classes.addTypeModalSectionInput}
                    error={!!showError('hourlyRate', formDataKey, index)}
                    id="outlined-search"
                    onChange={(e) => {
                      handleFieldChange(index, e.target.name, e.target.value);
                    }}
                    name="hourlyRate"
                    value={dutyInformation?.hourlyRate || ''}
                    placeholder={`${franchiseCurrency}${dutyValueRanges?.minRate} - ${franchiseCurrency}${dutyValueRanges?.maxRate || ''}`}
                    variant="outlined"
                    type="number"
                    onBlur={(e) =>
                      handleRange(index, e, dutyValueRanges?.minRate, dutyValueRanges?.maxRate)
                    }
                    helperText={
                      !!showError('hourlyRate', formDataKey, index)
                        ? showError('hourlyRate', formDataKey, index)
                        : null
                    }
                  />
                </Box>
                <Box className={classes.dutyInformationRemoveBtnWrapper}>
                  {index > 0 && (
                    <Button
                      variant="secondaryGrey"
                      onClick={() => removeForm(index)}
                      className={classes.dutyInformationRemoveBtn}
                    >
                      <CloseIcon className={classes.dutyInformationIcon} />
                    </Button>
                  )}
                </Box>
              </Box>
              <Box>
                {dutyInformation?.selectDays && (
                  <>
                    <Box className={classes.selectedDaysWrapper}>
                      <Box className={classes.checkboxLabel}>
                        <InputLabel className={classes.checkboxLabelText} htmlFor="selected-days">
                          {t('obx.schedules.selectDays')} :
                        </InputLabel>
                      </Box>
                      <Box className={classes.dutySelectFlex}>
                        {dutyInformation?.selectDays && (
                          <DaysSelection
                            name="dutyDays"
                            selectedDays={dutyInformation?.dutyDays}
                            truncateTo={3}
                            data={daysBetweenDates}
                            handleChange={(e) => {
                              handleFieldChange(index, e.target.name, e.target.value);
                            }}
                            styledClass={classes.selectedDaysBtns}
                          />
                        )}
                        <Box className={classes.invalidFeedback}>
                          {!!showError('dutyDays', formDataKey, index)
                            ? showError('dutyDays', formDataKey, index)
                            : null}
                        </Box>
                      </Box>
                    </Box>
                    <Box>
                      {!!errorMessages?.[getErrorKey(similarItemErrorKey, formDataKey, index)] && (
                        <Box className={classes.invalidData}>
                          {errorMessages?.[getErrorKey(similarItemErrorKey, formDataKey, index)]}
                        </Box>
                      )}
                    </Box>
                  </>
                )}
              </Box>
              <Box className={classes.addServises}>
                <Typography variant="subtitle1">
                  {t('obx.sites.createSite.additionalServices')}
                </Typography>
                <Box className={classes.inlineCheckBox}>
                  <Typography className={classes.footerlable} variant="body2">
                    {t('obx.sites.createSite.visitorManagement')}
                  </Typography>
                  <Switch
                    name="visitManagement"
                    onChange={(e) => handleFieldChange(index, e.target.name, e.target.checked)}
                    checked={dutyInformation?.visitManagement}
                    inputProps={{ 'aria-label': 'visitor management' }}
                  />
                </Box>

                <Box className={classes.inlineCheckBox}>
                  <Typography className={classes.footerlable} variant="body2">
                    {t('obx.sites.createSite.loadManagement')}
                  </Typography>
                  <Switch
                    name="loadManagement"
                    onChange={(e) => handleFieldChange(index, 'loadManagement', e.target.checked)}
                    checked={dutyInformation?.loadManagement}
                    inputProps={{ 'aria-label': 'load management' }}
                  />
                </Box>
              </Box>
              {!isFlatContract && (
                <FuelSurchargeInputDropdown
                  name="fuelSurchargeValue"
                  id={`fuelSurchargeValue-${index}`}
                  label={t('obx.sites.createSite.includeFuelSurcharge', 'Include Fuel Surcharge')}
                  checked={!!dutyInformation?.fuelSurchargeEnabled}
                  onCheckChange={(isChecked) => {
                    handleFieldChange(index, 'fuelSurchargeEnabled', isChecked);
                    if (!isChecked) {
                      handleFieldChange(index, 'fuelSurchargeValue', '');
                      handleFieldChange(index, 'fuelSurchargeType', 'percentage');
                    }
                  }}
                  placeholder={t('obx.sites.createSite.enterFuelSurcharge', 'E.g; 20')}
                  value={dutyInformation?.fuelSurchargeValue || ''}
                  dropdownValue={dutyInformation?.fuelSurchargeType || 'percentage'}
                  onChange={(e) => handleFieldChange(index, 'fuelSurchargeValue', e.target.value)}
                  onDropdownChange={(e) =>
                    handleFieldChange(index, 'fuelSurchargeType', e.target.value)
                  }
                  surchargeServiceType={serviceTypes.DEDICATED}
                  error={
                    !!(
                      showError('fuelSurchargeValue', formDataKey, index) ||
                      showError('fuelSurchargeType', formDataKey, index)
                    )
                  }
                  helperText={
                    showError('fuelSurchargeValue', formDataKey, index) ||
                    showError('fuelSurchargeType', formDataKey, index) ||
                    ''
                  }
                />
              )}
            </Box>

            {index == formData?.[formDataKey]?.length - 1 && (
              <Box>
                <Box className={classes.dutyInformationFreePlus} />
                <Button
                  variant="secondaryGrey"
                  onClick={addForm}
                  className={classes.dutyInformationRemoveBtn}
                >
                  <PlusIcon className={classes.dutyInformationAddIcon} />
                </Button>
              </Box>
            )}
          </Box>
        );
      })}
      {errorMessages?.[formDataKey] && (
        <Stack sx={{ width: '100%', alignItems: 'center' }} spacing={2}>
          <Alert severity="error">{errorMessages?.[formDataKey]}</Alert>
        </Stack>
      )}
    </>
  );
};

DutyInformation.propTypes = {
  dutyValueRanges: PropTypes.array.isRequired,
  formData: PropTypes.object,
  errorMessages: PropTypes.object,
  updateFormHandler: PropTypes.func,
  formDataKey: PropTypes.string,
  setErrorMessages: PropTypes.func,
  similarItemErrorKey: PropTypes.string,
};

export default DutyInformation;
