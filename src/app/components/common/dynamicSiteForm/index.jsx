import {
  Alert,
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  InputLabel,
  Radio,
  RadioGroup,
  Skeleton,
  Stack,
  Switch,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { ReactComponent as CautionIcon } from 'assets/svg/caution-thin.svg?react';
import { ReactComponent as DustinBinIcon } from 'assets/svg/DustinBinIcon.svg?react';
import { ReactComponent as VisitIcon } from 'assets/svg/VisitIcon.svg?react';
import { ReactComponent as PlusIcon } from 'assets/svg/Whiteplus.svg?react';
import PropTypes from 'prop-types';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { serviceTypes, visitTypes } from 'salesComponents/contractCreation/addServices/helper';
import CustomDropDown from 'src/app/components/common/customDropDown';
import DaysSelection from 'src/app/components/common/daysSelection';
import ResponsiveTimePickers from 'src/app/components/common/timePicker';
import { DeleteIcon } from 'src/assets/svg';
import { ReactComponent as Regular } from 'src/assets/svg/checkbox.svg?react';
import { ReactComponent as Iregular } from 'src/assets/svg/checkbox-checked.svg?react';
// import { ReactComponent as Regular } from 'src/assets/svg/checkbox.svg';
// import { ReactComponent as Iregular } from 'src/assets/svg/checkbox-checked.svg';
import { FormKeys } from 'src/helper/contract.js';
import {
  getUniqueOrderedDaysOfWeekBetweenDates,
  isObjectEmpty,
  removeKey,
} from 'src/helper/utilityFunctions';
import { useTenantLabel } from 'src/helper/utilityHooks';
import { useLabels } from 'src/hooks/updateObjectLabelsHook';
import { useCurrency } from 'src/hooks/useCurrency.jsx';
import transformArrayForOptions from 'src/utils/array/transformArrayForOptions.js';
import { daysOfWeekWithVal, regexValues } from 'src/utils/constants';
import { capitalizeFirstLetter } from 'src/utils/string/common';

import DispatchBillingInfoComponent from '../dispatchBillingInfoComponent/index.jsx';
import FuelSurchargeInputDropdown from '../fuelSurchargeInputDropdown/index.jsx';
import RequiredAsterik from '../requiredAsterik/index.jsx';
import { useStyles } from './index.js';

const officerTypeOptions = [
  {
    id: 'armed_officer',
    name: 'Armed Officer',
  },
  { id: 'patrol_officer', name: 'Patrol Officer', [FormKeys.TYPE]: serviceTypes.PATROL },
  { id: 'dedicated_officer', name: 'Dedicated Officer', [FormKeys.TYPE]: serviceTypes.DEDICATED },
];

const MAX_NUMBER_OF_VISITS = 50;

const DynamicSiteForm = ({
  startDate = null,
  endDate = null,
  errorMessages,
  formDataKey,
  formData,
  updateFormHandler,
  setErrorMessages,
  togglableWeekDays = false,
  required = true,
  sageItems,
  loadingDropdown,
}) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const { currency: franchiseCurrency } = useCurrency();
  const { getLabel } = useTenantLabel();
  const services = useSelector((state) => state.auth.tenantInfo?.services || {});

  const addForm = () => {
    setErrorMessages((prev) => removeKey([formDataKey], prev));

    updateFormHandler(formDataKey, [
      ...(formData?.[formDataKey] ?? []),
      {
        serviceName: '',
        serviceType: {},
        sageItem: {},
        nonBillable: false,
        officersRequired: 0,
        hourlyRate: 1,
        startTime: null,
        endTime: null,
        weekDays: [],
        visitorManagement: false,
        loadManagement: false,
        fuelSurchargeEnabled: false,
        fuelSurchargeType: 'percentage',
        fuelSurchargeValue: '',
        // designation: {},
        visits: [],
        totalVisits: 0,
        // officerType: {},
        pricePerVisit: '',
        isDispatch: false,
        dispatchBillingInfo: {},
      },
    ]);
  };

  const getTotalDutyDays = (serviceIndex) => {
    // return formData?.[formDataKey]?.[serviceIndex]?.visits?.map(
    //   (visit) => visit?.visitsPerDay * visit?.visitDays?.length,
    // );
    const totalDutyDays = {};

    const totalVisits = formData?.[formDataKey]?.[serviceIndex]?.visits?.reduce((acc, visit) => {
      visit['visitDays'].map((visitDutyDay) => {
        if (totalDutyDays[visitDutyDay]) {
          totalDutyDays[visitDutyDay] += Number(visit['visitsPerDay']);
          return;
        }
        totalDutyDays[visitDutyDay] = Number(visit['visitsPerDay']);
      });
      return visit['visitsPerDay'] * visit['visitDays']?.length + acc;
    }, 0);

    return { totalVisits, totalDutyDays };
  };

  const addVisit = (serviceIndex) => {
    // Ensure that the serviceIndex is valid
    if (serviceIndex < 0 || serviceIndex >= (formData?.[formDataKey]?.length || 0)) {
      // console.error('Invalid service index');
      return;
    }

    const updatedSiteServices = formData?.[formDataKey]?.map((service, index) => {
      if (index === serviceIndex) {
        return {
          ...service,
          visits: [
            ...(service?.visits || []),
            {
              visitType: visitTypes.RANDOM,
              visitsPerDay: 1,
              startTime: null,
              endTime: null,
              visitDays: [],
              visitTime: null,
            },
          ],
        };
      }
      return service;
    });

    // Update the form with the modified site services array
    updateFormHandler(formDataKey, updatedSiteServices);
  };

  const deleteVisit = (serviceIndex, visitIndex) => {
    const updatedForms = [...(formData?.[formDataKey] || [])];

    // Ensure that the serviceIndex and visitIndex are valid
    if (
      serviceIndex < 0 ||
      serviceIndex >= updatedForms?.length ||
      visitIndex < 0 ||
      visitIndex >= (updatedForms[serviceIndex]?.visits?.length || 0)
    ) {
      // console.error('Invalid service or visit index');
      return;
    }

    updatedForms[serviceIndex] = {
      ...updatedForms[serviceIndex],
      visits: updatedForms[serviceIndex].visits.filter((_, index) => index !== visitIndex),
    };

    // Update the form with the modified site services array
    updateFormHandler(formDataKey, updatedForms);
  };

  const _filteredOfficerTypeOptions = (serviceType) => {
    const officers = officerTypeOptions.filter(
      (officerType) => !officerType[FormKeys.TYPE] || officerType[FormKeys.TYPE] === serviceType,
    );

    return transformArrayForOptions(officers, 'name', 'id');
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

    setErrorMessages((prev) => removeKey([getErrorKey('contact', formDataKey, index)], prev));
    setErrorMessages((prev) => removeKey([getErrorKey('name', formDataKey, index)], prev));
    setErrorMessages((prev) => removeKey([getErrorKey('email', formDataKey, index)], prev));
  };

  /**
   *
   * @param {*} index
   * @param {*} field
   * @param {*} value
   */

  const handleFieldChange = (index, field, value, nestedKey = null) => {
    let updatedForms = [...(formData?.[formDataKey] || [])];

    /**
     * It will only store floating values upto 2 decimel places
     */
    if (field === 'pricePerVisit' && !value.match(/^(?:\d{1,3}(\.\d{1,2})?)?$/)) {
      return;
    }
    if (field === 'hourlyRate' && !String(value).match(regexValues.price)) {
      return;
    }
    if (nestedKey) {
      updatedForms[index][nestedKey] = {
        ...updatedForms[index][nestedKey],
        [field]: value,
      };
    } else {
      updatedForms[index] = {
        ...updatedForms[index],
        [field]: value,
      };
    }

    updateFormHandler(formDataKey, updatedForms);

    const errorKey = getErrorKey(field, formDataKey, index);
    if (value) {
      setErrorMessages((prev) => removeKey([errorKey], prev));
    }
  };

  const handleVisitFieldChange = (serviceIndex, visitIndex, field, value) => {
    const updatedForms = formData?.[formDataKey];

    // Ensure that the serviceIndex and visitIndex are valid
    if (
      serviceIndex < 0 ||
      serviceIndex >= updatedForms?.length ||
      visitIndex < 0 ||
      visitIndex >= (updatedForms[serviceIndex]?.visits?.length || 0)
    ) {
      // console.error('Invalid service or visit index');
      return;
    }

    updatedForms[serviceIndex] = {
      ...updatedForms[serviceIndex],
      visits: updatedForms[serviceIndex].visits.map((visit, index) => {
        if (index === visitIndex) {
          return {
            ...visit,
            [field]: value,
          };
        }
        return visit;
      }),
    };

    // Update the form with the modified site services array
    updateFormHandler(formDataKey, updatedForms);

    if (value) {
      // const errorKey = getNestedErrorKey({
      //   formDataKey: formDataKey,
      //   index: serviceIndex,
      //   key: 'visits',
      //   nestedIndex: visitIndex,
      //   nestedFormDataKey: field,
      // });
      //
      // setErrorMessages((prev) => removeKey([errorKey], prev));

      removeNestedErrorKey({
        parentIndex: serviceIndex,
        nestedIndex: visitIndex,
        nestedKeyName: field,
      });
    }
  };

  const showError = (key, formDataKey, index) => {
    return errorMessages?.[`${getErrorKey(key, formDataKey, index)}`];
  };

  const showNestedError = ({ parentIndex, nestedIndex, nestedKey }) => {
    return errorMessages?.[
      `${getNestedErrorKey({ formDataKey: formDataKey, index: parentIndex, key: 'visits', nestedIndex: nestedIndex, nestedFormDataKey: nestedKey })}`
    ];
  };

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

  const getNestedErrorKey = ({ formDataKey, index, key, nestedIndex, nestedFormDataKey }) => {
    return `${formDataKey},${index},${key},${nestedIndex},${nestedFormDataKey}`;
    // return `${activeStep},${index},${nestedFormDataKey},${nestedIndex},${key}`;
  };

  const getNestedError = (parentIndex, visitIndex, key) => {
    return errorMessages[
      getNestedErrorKey({
        formDataKey,
        index: parentIndex,
        key: FormKeys.VISITS,
        nestedIndex: visitIndex,
        nestedFormDataKey: key,
      })
    ];
  };

  const removeNestedErrorKey = ({ parentIndex, nestedIndex, nestedKeyName }) => {
    const errorKey = getNestedErrorKey({
      formDataKey,
      index: parentIndex,
      key: FormKeys.VISITS,
      nestedIndex: nestedIndex,
      nestedFormDataKey: nestedKeyName,
    });
    // Remove the error key from the error messages
    setErrorMessages((prev) => removeKey([errorKey], prev));
  };

  const handleVisitChange = (customEvent, index) => {
    const { name, visitIndex } = customEvent;
    let { value } = customEvent;

    removeNestedErrorKey({ parentIndex: index, nestedIndex: visitIndex, nestedKeyName: name });

    if (name === 'visitType' && value === 'fixed') {
      handleVisitFieldChange(index, visitIndex, 'visitsPerDay', 1);
    }

    if (name === 'visitsPerDay' && value > MAX_NUMBER_OF_VISITS) value = MAX_NUMBER_OF_VISITS;
    handleVisitFieldChange(index, visitIndex, name, value);
  };

  /**
   * Show error messages on state
   * @param {*} key
   * @param {*} formDataKey
   * @param {*} index
   * @returns
   */

  const serviceType = (t) => {
    const allServiceTypes = [
      { id: 1, label: t('obx.sites.createSite.serviceTypes.dedicated'), value: 'dedicated' },
      { id: 2, label: t('obx.sites.createSite.serviceTypes.patrol'), value: 'patrol' },
      { id: 3, label: t('obx.sites.createSite.serviceTypes.dispatch'), value: 'dispatch' },
    ];

    // Filter service types based on services configuration
    return allServiceTypes.filter((serviceType) => {
      if (serviceType.value === 'dedicated') {
        return services?.dedicated === true;
      }
      if (serviceType.value === 'patrol') {
        return services?.patrol === true;
      }
      if (serviceType.value === 'dispatch') {
        return services?.dispatch === true;
      }
      return false;
    });
  };
  // const designation = [{ id: 1, label: 'Armed Officer', value: 'Armed Officer' }];

  const serviceTypesOptions = useLabels(
    serviceType(t),
    'tenantConfigs.labels.shift_types',
    'value',
  );

  const clearFuelSurchargeErrors = (index) => {
    const valKey = getErrorKey('fuelSurchargeValue', formDataKey, index);
    const typeKey = getErrorKey('fuelSurchargeType', formDataKey, index);
    setErrorMessages((prev) => removeKey(valKey, removeKey(typeKey, prev)));
  };

  const handleFuelSurchargeCheckChange = (index, isChecked) => {
    const updatedForms = [...(formData?.[formDataKey] || [])];
    updatedForms[index] = {
      ...updatedForms[index],
      fuelSurchargeEnabled: isChecked,
      ...(!isChecked && {
        fuelSurchargeValue: '',
        fuelSurchargeType: 'percentage',
      }),
    };
    updateFormHandler(formDataKey, updatedForms);
    clearFuelSurchargeErrors(index);
  };

  const handleFuelSurchargeValueChange = (index, value) => {
    handleFieldChange(index, 'fuelSurchargeValue', value);
    const valKey = getErrorKey('fuelSurchargeValue', formDataKey, index);
    setErrorMessages((prev) => removeKey(valKey, prev));
  };

  const handleFuelSurchargeTypeChange = (index, value) => {
    handleFieldChange(index, 'fuelSurchargeType', value);
    clearFuelSurchargeErrors(index);
  };

  const getFuelSurchargeError = (index) => {
    return (
      showError('fuelSurchargeValue', formDataKey, index) ||
      showError('fuelSurchargeType', formDataKey, index) ||
      ''
    );
  };

  return (
    <>
      {formData?.[formDataKey] &&
        formData?.[formDataKey].map((service, index) => {
          let days = daysOfWeekWithVal(t);
          const showWeekdays = togglableWeekDays
            ? service?.startTime && service?.endTime && endDate && startDate
            : true;
          if (startDate && endDate) {
            days = getUniqueOrderedDaysOfWeekBetweenDates(startDate, endDate);
          }

          const totalDutyDaysObj = getTotalDutyDays(index);
          return (
            <Box key={index} className={classes.siteDetais}>
              <Box className={classes.inlineBtnsCols}>
                <Typography variant="subtitle1">
                  {' '}
                  {`${t('obx.sites.createSite.service')} ${index + 1}`}
                </Typography>
                <Box className={classes.inlinbtns}>
                  <Button
                    disableRipple
                    className={classes.notesCloseBtn}
                    variant="onlyText"
                    startIcon={<DustinBinIcon />}
                    onClick={() => removeForm(index)}
                  ></Button>
                </Box>
              </Box>
              <Box className={classes.siteDetaisFields}>
                {service?.serviceType?.value !== serviceTypes.DISPATCH && (
                  <Box className={classes.fieldWrapper}>
                    <InputLabel htmlFor="Service Name">
                      {t('obx.sites.createSite.serviceName')} <RequiredAsterik />
                    </InputLabel>

                    <TextField
                      name="serviceName"
                      id="serviceName"
                      fullWidth
                      placeholder={t('obx.sites.createSite.serviceName')}
                      type="text"
                      value={service?.serviceName}
                      className={classes?.textFiledFilter}
                      onChange={(e) => handleFieldChange(index, 'serviceName', e.target.value)}
                      error={!!showError('serviceName', formDataKey, index)}
                      helperText={
                        !!showError('serviceName', formDataKey, index)
                          ? showError('serviceName', formDataKey, index)
                          : null
                      }
                    />
                  </Box>
                )}

                <Box className={classes.fieldWrapper}>
                  <InputLabel htmlFor="serviceType">
                    {t('obx.sites.createSite.serviceType')} <RequiredAsterik />
                  </InputLabel>
                  <CustomDropDown
                    label={t('obx.sites.createSite.serviceType')}
                    name="serviceType"
                    id="serviceType"
                    placeHolder={`${t('obx.sites.createSite.select')} ${t('obx.sites.createSite.serviceType')}`}
                    placeHolderClassName={classes.placeHolderColor}
                    className={classes.dropdownWrap}
                    options={serviceTypesOptions}
                    selectedValues={service?.serviceType || {}}
                    handleChange={(e) => handleFieldChange(index, 'serviceType', e.target.value)}
                    bordered
                  />

                  {!!showError('serviceType', formDataKey, index) && (
                    <Box className={classes.invalidFeedback}>
                      {showError('serviceType', formDataKey, index)}
                    </Box>
                  )}
                </Box>
                {service?.serviceType?.value !== serviceTypes.DISPATCH && (
                  <Box className={classes.fieldWrapper}>
                    {loadingDropdown ? (
                      <Skeleton className={classes.skeletonDropdown} />
                    ) : (
                      <>
                        <InputLabel>
                          {t('obx.sites.createSite.lineItem')} <RequiredAsterik />
                          <Tooltip
                            placement="right"
                            arrow
                            title={t('obx.sites.tooltips.applyFlatRateTooltip')}
                          >
                            <CautionIcon />
                          </Tooltip>
                        </InputLabel>
                        <CustomDropDown
                          name="sageItem"
                          placeHolder={`${t('obx.sites.createSite.select')} ${t('sales.contract.lineItem')}`}
                          bordered
                          searchable
                          options={sageItems}
                          placeHolderClassName={classes.placeHolderColor}
                          className={classes.dropdownWrap}
                          selectedValues={service?.sageItem || {}}
                          handleChange={(e) => handleFieldChange(index, 'sageItem', e.target.value)}
                          disabled={formData?.applyFlatRate}
                        />

                        {!!showError('sageItem', formDataKey, index) && (
                          <Box className={classes.invalidFeedback}>
                            {showError('sageItem', formDataKey, index)}
                          </Box>
                        )}
                      </>
                    )}
                  </Box>
                )}

                {/*{service?.serviceType?.value === serviceTypes.PATROL && (*/}
                {/*  <Box className={classes.marginBottomDropDown}>*/}
                {/*    <InputLabel htmlFor={'officerType'}>*/}
                {/*      {t('sales.contract.officerType')} <RequiredAsterik />*/}
                {/*    </InputLabel>*/}
                {/*    <CustomDropDown*/}
                {/*      name={'officerType'}*/}
                {/*      id={'officerType'}*/}
                {/*      placeHolder={t('sales.contract.selectOfficerType')}*/}
                {/*      options={filteredOfficerTypeOptions(service?.serviceType.value)}*/}
                {/*      selectedValues={service['officerType'] || {}} // Change here to an array*/}
                {/*      // handleChange={(event) => servicesInputChangedHandler(event)(index)}*/}
                {/*      handleChange={(e) => handleFieldChange(index, 'officerType', e.target.value)}*/}
                {/*      className={classes.dropHeader}*/}
                {/*      bordered*/}
                {/*      // isError={!!getErrorKey('officerType', formDataKey, index)}*/}
                {/*    />*/}
                {/*    {!!showError('officerType', formDataKey, index) && (*/}
                {/*      <Box className={classes.invalidFeedback}>*/}
                {/*        {showError('officerType', formDataKey, index)}*/}
                {/*      </Box>*/}
                {/*    )}*/}
                {/*  </Box>*/}
                {/*)}*/}

                {/* <Box className={classes.onecols}>
                  <InputLabel htmlFor="designation">
                    {t('obx.sites.createSite.designation')}
                  </InputLabel>
                  <CustomDropDown
                    label={t('obx.sites.createSite.designation')}
                    name="designation"
                    id="designation"
                    placeHolder={`${t('obx.sites.createSite.select')} ${t('obx.sites.createSite.designation')}`}
                    placeHolderClassName={classes.placeHolderColor}
                    className={classes.dropdownWrap}
                    options={transformArrayForOptions(designation, 'label', 'value')}
                    selectedValues={service.designation}
                    handleChange={(e) => handleFieldChange(index, 'designation', e.target.value)}
                    bordered
                  />

                  {!!showError('designation', formDataKey, index) && (
                    <Box className={classes.invalidFeedback}>
                      {showError('designation', formDataKey, index)}
                    </Box>
                  )}
                </Box> */}
              </Box>

              {service?.serviceType?.value === serviceTypes.DEDICATED && (
                <>
                  <Box className={classes.siteDetaisFields}>
                    <Box className={classes.fieldWrapper}>
                      <InputLabel htmlFor="officersRequired">
                        {t('obx.sites.createSite.officersRequired', {
                          officers: getLabel('terms', 'officers', t),
                        })}{' '}
                        <RequiredAsterik />
                      </InputLabel>

                      <TextField
                        onWheel={(e) => e.target.blur()}
                        name="officersRequired"
                        id="officersRequired"
                        fullWidth
                        placeholder={t('obx.sites.createSite.eg2')}
                        type="Number"
                        className={classes?.textFiledFilter}
                        onChange={(e) =>
                          handleFieldChange(index, 'officersRequired', e.target.value)
                        }
                        error={!!showError('officersRequired', formDataKey, index)}
                        helperText={
                          !!showError('officersRequired', formDataKey, index)
                            ? showError('officersRequired', formDataKey, index)
                            : null
                        }
                      />
                    </Box>

                    <Box className={classes.fieldWrapper}>
                      <InputLabel htmlFor="startTime">
                        {t('obx.sites.createSite.startTime')}
                        <RequiredAsterik />
                      </InputLabel>
                      <ResponsiveTimePickers
                        useLocalTimeZone
                        name="startTime"
                        id="startTime"
                        timeStepsMinutes={1}
                        value={service?.startTime || null}
                        placeholder={`${t('obx.sites.createSite.select')} ${t('obx.sites.createSite.startTime')}`}
                        error={!!showError('startTime', formDataKey, index)}
                        helperText={
                          !!showError('startTime', formDataKey, index)
                            ? showError('startTime', formDataKey, index)
                            : null
                        }
                        onChange={(value) => {
                          if (value) {
                            handleFieldChange(index, 'endTime', null || null);
                            handleFieldChange(index, 'startTime', value || null);
                          }
                        }}
                      />
                    </Box>
                    <Box className={classes.fieldWrapper}>
                      <InputLabel htmlFor="endTime">
                        {t('obx.sites.createSite.endTime')}
                        <RequiredAsterik />
                      </InputLabel>
                      <ResponsiveTimePickers
                        useLocalTimeZone
                        value={service.endTime || null}
                        name="endTime"
                        disabled={!service.startTime}
                        id="endTime"
                        timeStepsMinutes={1}
                        placeholder={`${t('obx.sites.createSite.select')} ${t('obx.sites.createSite.endTime')}`}
                        error={!!showError('endTime', formDataKey, index)}
                        helperText={
                          !!showError('endTime', formDataKey, index)
                            ? showError('endTime', formDataKey, index)
                            : null
                        }
                        onChange={(value) => {
                          handleFieldChange(index, 'endTime', value || null);

                          // if (service.startTime) {
                          // const startTimeDayjs = dayjs(service.startTime, 'HH:mm');
                          // const endTimeDayjs = dayjs(value, 'HH:mm');
                          // if (endTimeDayjs.isAfter(startTimeDayjs)) {
                          // handleFieldChange(index, 'endTime', value || null);
                          // } else {
                          // if endTime is before startTime, set endTime to startTime + 1 minute
                          // handleFieldChange(index, 'endTime', service.startTime || null);
                          // return;
                          // }
                          // }
                          // return;
                        }}
                      />
                    </Box>
                  </Box>
                  <Box className={classes.siteDetaisFields}>
                    <Box className={classes.fieldWrapperHalf}>
                      <InputLabel htmlFor="hourlyRate">
                        {`${t('obx.sites.createSite.hourlyRate')} (${franchiseCurrency})`}
                        <Tooltip
                          placement="right"
                          arrow
                          title={t('obx.sites.tooltips.applyFlatRateTooltip')}
                        >
                          <CautionIcon />
                        </Tooltip>
                      </InputLabel>

                      <TextField
                        onWheel={(e) => e.target.blur()}
                        name="hourlyRate"
                        id="hourlyRate"
                        fullWidth
                        disabled={formData?.applyFlatRate}
                        placeholder={t('obx.sites.createSite.eg20')}
                        type="text"
                        value={service?.hourlyRate ?? ''}
                        className={classes?.textFiledFilter}
                        onChange={(e) => handleFieldChange(index, 'hourlyRate', e.target.value)}
                        error={!!showError('hourlyRate', formDataKey, index)}
                        helperText={
                          !!showError('hourlyRate', formDataKey, index)
                            ? showError('hourlyRate', formDataKey, index)
                            : null
                        }
                      />
                    </Box>
                  </Box>
                  {showWeekdays && (
                    <Box className={classes.DaysTopWrap}>
                      <Typography variant="subtitle1">
                        {' '}
                        {t('obx.sites.createSite.jobDays')} <RequiredAsterik />
                      </Typography>
                      <Box className={classes.DaysWrap}>
                        <DaysSelection
                          name="weekDays"
                          selectedDays={service?.weekDays || []}
                          truncateTo={3}
                          data={days}
                          handleChange={(e) => {
                            handleFieldChange(index, e.target.name, e.target.value);
                          }}
                          styledClass={classes.selectedDaysBtns}
                        />

                        {!!showError('weekDays', formDataKey, index) && (
                          <Box
                            component="span"
                            className={`${classes.invalidFeedback}`}
                            sx={{ width: '100%' }}
                          >
                            {showError('weekDays', formDataKey, index)}
                          </Box>
                        )}
                      </Box>
                    </Box>
                  )}

                  <Box className={classes.addServises}>
                    <Typography variant="subtitle1">
                      {t('obx.sites.createSite.additionalServices')}{' '}
                      {required && <RequiredAsterik />}
                    </Typography>
                    <Box className={classes.inlineCheckBox}>
                      <Typography className={classes.footerlable} variant="body2">
                        {t('obx.sites.createSite.visitorManagement')}
                      </Typography>
                      <Switch
                        error={!!showError('visitorManagement', formDataKey, index)}
                        helperText={
                          !!showError('visitorManagement', formDataKey, index)
                            ? showError('visitorManagement', formDataKey, index)
                            : null
                        }
                        id="visitorManagement"
                        checked={service[FormKeys.VISITOR_MANAGEMENT]}
                        name={`${t('sales.contract.visitorManagement')}`}
                        onChange={(event) => {
                          handleFieldChange(
                            index,
                            FormKeys.VISITOR_MANAGEMENT,
                            event.target.checked,
                          );
                        }}
                        inputProps={{ 'aria-label': 'ant design' }}
                      />
                    </Box>

                    <Box className={classes.inlineCheckBox}>
                      <Typography className={classes.footerlable} variant="body2">
                        {t('obx.sites.createSite.loadManagement')}
                      </Typography>
                      <Switch
                        error={!!errorMessages?.siteName}
                        helperText={!!errorMessages?.siteName ? errorMessages?.siteName : null}
                        checked={service[FormKeys.LOAD_MANAGEMENT]}
                        name={`${t('sales.contract.loadManagement')}`}
                        onChange={(event) =>
                          handleFieldChange(index, FormKeys.LOAD_MANAGEMENT, event.target.checked)
                        }
                        inputProps={{ 'aria-label': 'ant design' }}
                      />
                    </Box>
                    {/* <Box className={classes.inlineCheckBox}>
                      <Typography className={classes.footerlable} variant="body2">
                        {t('obx.sites.createSite.dispatch')}
                      </Typography>
                      <Switch
                        error={!!errorMessages?.isDispatch}
                        helperText={!!errorMessages?.isDispatch ? errorMessages?.isDispatch : null}
                        checked={service[FormKeys.DISPATCH]}
                        name={service[FormKeys.DISPATCH]}
                        onChange={(event) =>
                          handleFieldChange(index, FormKeys.DISPATCH, event.target.checked)
                        }
                        inputProps={{ 'aria-label': 'ant design' }}
                      />
                    </Box> */}
                  </Box>

                  {service?.isDispatch && (
                    <DispatchBillingInfoComponent
                      formDataKey="dispatchBillingInfo"
                      errorMessages={errorMessages}
                      formData={service}
                      parentKey={formDataKey}
                      index={index}
                      updateFormHandler={updateFormHandler}
                      setErrorMessages={setErrorMessages}
                      handleFieldChange={handleFieldChange}
                      flatRate={formData?.applyFlatRate}
                    />
                  )}
                </>
              )}

              {service?.serviceType?.value === serviceTypes.PATROL && (
                <>
                  <Box className={classes.serviceTypeField}>
                    <InputLabel htmlFor={'pricePerVisit'}>
                      {`${t('sales.contract.pricePerVisit')} (${franchiseCurrency})`}{' '}
                      <RequiredAsterik />
                      <Tooltip
                        placement="right"
                        arrow
                        title={t('obx.sites.tooltips.applyFlatRateTooltip')}
                      >
                        <CautionIcon />
                      </Tooltip>
                    </InputLabel>
                    <TextField
                      name={'pricePerVisit'}
                      id={'pricePerVisit'}
                      fullWidth
                      placeholder={`${franchiseCurrency}25`}
                      value={service['pricePerVisit']}
                      disabled={formData?.applyFlatRate}
                      onChange={(event) =>
                        handleFieldChange(index, 'pricePerVisit', event.target.value)
                      }
                      type="number"
                      className={classes.inputField}
                      error={!!showError('pricePerVisit', formDataKey, index)}
                      helperText={showError('pricePerVisit', formDataKey, index)}
                      InputProps={{
                        inputProps: {
                          min: 0,
                          onWheel: (e) => e.target.blur(),
                        },
                      }}
                    />
                  </Box>
                  <Box className={classes.petrolArea}>
                    <Box>
                      <Typography className={classes.petrolAreaTitle} variant="h5">
                        {t('sales.contract.totalVisits')} ({totalDutyDaysObj?.totalVisits})
                      </Typography>
                    </Box>
                    {service?.visits?.length > 0 && (
                      <Box className={classes.visitAreaBox}>
                        {service?.visits?.map((visit, visitIndex) => {
                          const showVisitWeekdays = !!(togglableWeekDays && endDate && startDate);
                          return (
                            <Box className={classes.visitBox} key={`${index}${visitIndex}`}>
                              <Box className={classes.petrolAreaHeader}>
                                <Typography className={classes.visitAreaTitle} variant="h5">
                                  {t('sales.contract.visitsSet')} {visitIndex + 1}
                                </Typography>
                                {service?.visits?.length > 1 && (
                                  <Box
                                    className={classes.deleteBtn}
                                    onClick={() => deleteVisit(index, visitIndex)}
                                  >
                                    <DeleteIcon />
                                  </Box>
                                )}
                              </Box>
                              <Box className={classes.radioOption}>
                                <RadioGroup
                                  aria-labelledby="demo-radio-buttons-group-label"
                                  name={'visitType'}
                                  row
                                  value={visit['visitType']}
                                  onChange={(event) =>
                                    handleVisitChange(
                                      {
                                        serviceIndex: index,
                                        name: 'visitType',
                                        value: event.target.value,
                                        visitIndex,
                                      },
                                      index,
                                    )
                                  }
                                >
                                  <FormControlLabel
                                    value={visitTypes.RANDOM}
                                    control={<Radio />}
                                    label={t('sales.contract.random')}
                                    className={
                                      visit['visitType'] === visitTypes.RANDOM &&
                                      classes.activeLabel
                                    }
                                  />
                                  <FormControlLabel
                                    value={visitTypes.FIXED}
                                    control={<Radio />}
                                    label={t('sales.contract.fixed')}
                                    className={
                                      visit['visitType'] === visitTypes.FIXED && classes.activeLabel
                                    }
                                  />
                                </RadioGroup>
                              </Box>
                              <Box className={classes.fullFields}>
                                <InputLabel htmlFor={'visitsPerDay'}>
                                  {t('sales.contract.visitsPerDay')} <RequiredAsterik />
                                </InputLabel>
                                <TextField
                                  name={'visitsPerDay'}
                                  id={'visitsPerDay'}
                                  fullWidth
                                  value={visit['visitsPerDay']}
                                  onChange={(event) =>
                                    handleVisitChange(
                                      {
                                        name: 'visitsPerDay',
                                        value: event.target.value,
                                        visitIndex,
                                      },
                                      index,
                                    )
                                  }
                                  type="number"
                                  placeholder="1"
                                  className={classes.inputField}
                                  error={!!getNestedError(index, visitIndex, 'visitsPerDay')}
                                  helperText={
                                    getNestedError(index, visitIndex, 'visitsPerDay') &&
                                    t('sales.contract.visitsPerDayError')
                                  }
                                  InputProps={{
                                    inputProps: {
                                      min: 1,
                                    },
                                  }}
                                  disabled={visit['visitType'] === visitTypes.FIXED}
                                />
                              </Box>
                              <Typography className={classes.visitAreaTitle} variant="h5">
                                {t('sales.contract.timeDuration')}
                              </Typography>
                              {visit['visitType'] === visitTypes.RANDOM ? (
                                <Box className={classes.timePickerField}>
                                  <Box className={classes.fieldWrapper}>
                                    <InputLabel htmlFor="startTime">
                                      {t('obx.sites.createSite.startTime')}
                                      <RequiredAsterik />
                                    </InputLabel>
                                    <ResponsiveTimePickers
                                      useLocalTimeZone
                                      name="startTime"
                                      id="visitStartTime"
                                      timeStepsMinutes={1}
                                      value={visit?.startTime || null}
                                      placeholder={`${t('obx.sites.createSite.select')} ${t('obx.sites.createSite.startTime')}`}
                                      error={
                                        !!showNestedError({
                                          parentIndex: index,
                                          nestedIndex: visitIndex,
                                          nestedKey: 'startTime',
                                        })
                                      }
                                      helperText={
                                        !!showNestedError({
                                          parentIndex: index,
                                          nestedIndex: visitIndex,
                                          nestedKey: 'startTime',
                                        })
                                          ? showNestedError({
                                              parentIndex: index,
                                              nestedIndex: visitIndex,
                                              nestedKey: 'startTime',
                                            })
                                          : null
                                      }
                                      onChange={(value) => {
                                        if (value) {
                                          // handleVisitChange(index, 'endTime', null || null);
                                          // handleFieldChange(index, 'startTime', value || null);
                                          handleVisitChange(
                                            {
                                              name: 'endTime',
                                              value: null,
                                              visitIndex,
                                            },
                                            index,
                                          );
                                          handleVisitChange(
                                            {
                                              name: 'startTime',
                                              value: value,
                                              visitIndex,
                                            },
                                            index,
                                          );
                                        }
                                      }}
                                    />
                                  </Box>
                                  <Box className={classes.fieldWrapper}>
                                    <InputLabel htmlFor="endTime">
                                      {t('obx.sites.createSite.endTime')}
                                      <RequiredAsterik />
                                    </InputLabel>
                                    <ResponsiveTimePickers
                                      useLocalTimeZone
                                      value={visit.endTime || null}
                                      name="endTime"
                                      disabled={!visit.startTime}
                                      id="visitEndTime"
                                      timeStepsMinutes={1}
                                      placeholder={`${t('obx.sites.createSite.select')} ${t('obx.sites.createSite.endTime')}`}
                                      error={
                                        !!showNestedError({
                                          parentIndex: index,
                                          nestedIndex: visitIndex,
                                          nestedKey: 'endTime',
                                        })
                                      }
                                      helperText={
                                        !!showNestedError({
                                          parentIndex: index,
                                          nestedIndex: visitIndex,
                                          nestedKey: 'endTime',
                                        })
                                          ? showNestedError({
                                              parentIndex: index,
                                              nestedIndex: visitIndex,
                                              nestedKey: 'endTime',
                                            })
                                          : null
                                      }
                                      onChange={(value) => {
                                        handleVisitChange(
                                          {
                                            name: 'endTime',
                                            value: value,
                                            visitIndex,
                                          },
                                          index,
                                        );
                                      }}
                                    />
                                  </Box>
                                </Box>
                              ) : (
                                // <SelectTimer
                                //   visit={visit}
                                //   visitIndex={visitIndex}
                                //   serviceType={serviceType}
                                //   index={index}
                                //   errorMessages={errorMessages}
                                //   baseRates={baseRates}
                                //   getNestedError={getNestedError}
                                // />
                                <Box className={classes.singleTime}>
                                  <InputLabel htmlFor="level">
                                    {t('sales.contract.visitTime')}
                                    <RequiredAsterik />
                                  </InputLabel>
                                  <ResponsiveTimePickers
                                    useLocalTimeZone
                                    timeStepsMinutes={1}
                                    value={visit.visitTime || null}
                                    onChange={(value) =>
                                      handleVisitChange(
                                        { name: 'visitTime', value, visitIndex },
                                        index,
                                      )
                                    }
                                    format="hh:mm A"
                                    inputFormat="hh:mm A"
                                    placeholder={t('sales.contract.timeplaceholde')}
                                    error={!!getNestedError(index, visitIndex, 'visitTime')}
                                    helperText={getNestedError(index, visitIndex, 'visitTime')}
                                  />
                                </Box>
                              )}
                              {showVisitWeekdays && (
                                <Box className={classes.dayPicker}>
                                  <InputLabel htmlFor={FormKeys.DUTY_DAYS}>
                                    {t('sales.contract.visitDays')}
                                  </InputLabel>
                                  <Box className={classes.DaysWrap}>
                                    <DaysSelection
                                      data={days}
                                      selectedDays={visit['visitDays'] || []}
                                      handleChange={(event) =>
                                        handleVisitChange(
                                          {
                                            name: 'visitDays',
                                            value: event.target.value,
                                            visitIndex,
                                          },
                                          index,
                                        )
                                      }
                                      name={'visitDays'}
                                      styledClass={classes.dutyDays}
                                      truncateTo={3}
                                    />
                                  </Box>
                                  {!!showNestedError({
                                    parentIndex: index,
                                    nestedIndex: visitIndex,
                                    nestedKey: 'visitDays',
                                  }) && (
                                    <Box
                                      component="span"
                                      className={`${classes.invalidFeedback}`}
                                      sx={{ width: '100%' }}
                                    >
                                      {showNestedError({
                                        parentIndex: index,
                                        nestedIndex: visitIndex,
                                        nestedKey: 'visitDays',
                                      })}
                                    </Box>
                                  )}
                                </Box>
                              )}
                            </Box>
                          );
                        })}
                      </Box>
                    )}
                    {!!showError('visits', formDataKey, index) && (
                      <Box className={classes.invalidFeedback}>
                        {showError('visits', formDataKey, index)}
                      </Box>
                    )}

                    <Button
                      disableRipple
                      variant="onlyText"
                      className={classes.notesCloseBtn}
                      onClick={() => {
                        addVisit(index);
                      }}
                    >
                      <VisitIcon />{' '}
                      <Box component={'span'} sx={{ paddingLeft: '8px' }}>
                        {t('sales.contract.addVisit')}
                      </Box>
                    </Button>
                  </Box>
                  {/*Show total duty days here*/}
                  <Box className={classes.petrolAreaBlue}>
                    <Typography className={classes.petrolAreaBlueTitle} variant="h4">
                      {t('sales.contract.total')} {totalDutyDaysObj?.totalVisits}:
                    </Typography>
                    <Typography className={classes.petrolAreaBlueText} variant="body1">
                      {days
                        .map(
                          (day) =>
                            `${capitalizeFirstLetter(day?.label?.substring(0, 3))} ${totalDutyDaysObj?.totalDutyDays[day.value] || 0}`,
                        )
                        .join(', ')}
                    </Typography>
                  </Box>
                  {/* <Box className={classes.internalMapBox}>
                    <Checkbox
                      checked={service[FormKeys.FUEL_SURCHARGE]}
                      onClick={() => {
                        handleFieldChange(index, FormKeys.FUEL_SURCHARGE, event.target.checked);

                        // setFilters((prev) => ({ ...prev, old: !prev?.old }));
                      }}
                      // className={classes.chekBoxMap}
                      icon={<Regular />}
                      checkedIcon={<Iregular />}
                      className={classes.checkBoxCustom}
                    />
                    <InputLabel className={classes.mb0}>Include Fuel Surcharge</InputLabel>
                  </Box> */}
                  {/* <Box className={classes.addServises}>
                    <Typography variant="subtitle1">
                      {t('obx.sites.createSite.additionalServices')}
                      <RequiredAsterik />
                    </Typography>

                    <Box className={classes.inlineCheckBox}>
                      <Typography className={classes.footerlable} variant="body2">
                        {t('obx.sites.createSite.dispatch')}
                      </Typography>
                      <Switch
                        error={!!errorMessages?.isDispatch}
                        helperText={!!errorMessages?.isDispatch ? errorMessages?.isDispatch : null}
                        checked={service[FormKeys.DISPATCH]}
                        name={service[FormKeys.DISPATCH]}
                        onChange={(event) =>
                          handleFieldChange(index, FormKeys.DISPATCH, event.target.checked)
                        }
                        inputProps={{ 'aria-label': 'ant design' }}
                      />
                    </Box>
                  </Box> */}{' '}
                  {service?.isDispatch && (
                    <DispatchBillingInfoComponent
                      formDataKey="dispatchBillingInfo"
                      errorMessages={errorMessages}
                      formData={service}
                      parentKey={formDataKey}
                      index={index}
                      updateFormHandler={updateFormHandler}
                      setErrorMessages={setErrorMessages}
                      handleFieldChange={handleFieldChange}
                      flatRate={formData?.applyFlatRate}
                    />
                  )}
                </>
              )}

              {service?.serviceType?.value === serviceTypes.DISPATCH && (
                <DispatchBillingInfoComponent
                  formDataKey="dispatchBillingInfo"
                  errorMessages={errorMessages}
                  noCharge={true}
                  formData={service}
                  parentKey={formDataKey}
                  index={index}
                  updateFormHandler={updateFormHandler}
                  setErrorMessages={setErrorMessages}
                  handleFieldChange={handleFieldChange}
                  flatRate={formData?.applyFlatRate}
                />
              )}
              {/* billable break */}
              <Box className={classes.fuelSurchargeAndBillableWrapper}>
                <Box className={classes.radioWrapper}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={Boolean(service?.nonBillable)}
                        onChange={(event) =>
                          handleFieldChange(index, 'nonBillable', event.target.checked)
                        }
                        icon={<Regular />}
                        checkedIcon={<Iregular />}
                        className={classes.checkBoxCustom}
                      />
                    }
                    label={t('obx.sites.createSite.billingOptions.nonBillable')}
                  />
                </Box>

                {/* //service? */}
                {!formData?.applyFlatRate &&
                  service?.serviceType?.value !== serviceTypes.DISPATCH && (
                    <FuelSurchargeInputDropdown
                      name="fuelSurchargeValue"
                      id={`fuelSurchargeValue-${index}`}
                      label={t(
                        'obx.sites.createSite.includeFuelSurcharge',
                        'Include Fuel Surcharge',
                      )}
                      checked={!!service?.fuelSurchargeEnabled}
                      onCheckChange={(isChecked) =>
                        handleFuelSurchargeCheckChange(index, isChecked)
                      }
                      placeholder={t('obx.sites.createSite.enterFuelSurcharge', 'E.g; 20')}
                      value={service?.fuelSurchargeValue || ''}
                      dropdownValue={service?.fuelSurchargeType || 'percentage'}
                      onChange={(e) => handleFuelSurchargeValueChange(index, e.target.value)}
                      onDropdownChange={(e) => handleFuelSurchargeTypeChange(index, e.target.value)}
                      error={!!getFuelSurchargeError(index)}
                      helperText={getFuelSurchargeError(index)}
                      surchargeServiceType={
                        service?.serviceType?.value === serviceTypes.PATROL ||
                        service?.serviceType?.value === serviceTypes.DEDICATED
                          ? service.serviceType.value
                          : undefined
                      }
                    />
                  )}
              </Box>

              {/* <Box className={classes.richTextBox}>
              <Typography className={classes.marginBottom} variant="subtitle1">
                {' '}
                {t('obx.sites.createSite.instructions')}
              </Typography>

              <RichTextEditor
                error={!!errorMessages?.siteName}
                helperText={!!errorMessages?.siteName ? errorMessages?.siteName : null}
                className={classes.editor}
                value={service[FormKeys.INSTRUCTIONS] || EditorState.createEmpty()}
                handleChange={(event) =>
                  handleFieldChange(index, FormKeys.INSTRUCTIONS, event.target.value)
                }
                name="instructions"
                textLimit={5000}
                placeholder={t('obx.form.input.textField.instructions.placeHolder')}
              />
            </Box> */}
            </Box>
          );
        })}

      <Box className={classes.grayBox}>
        <Typography variant="h2"> {t('obx.sites.createSite.addServices')}</Typography>
        <Typography variant="body2"> {t('obx.sites.createSite.addServicesText')}</Typography>
        <Button onClick={addForm} variant="primary" startIcon={<PlusIcon />}>
          {t('obx.sites.createSite.addServices')}
        </Button>
      </Box>
      {errorMessages?.[formDataKey] && (
        <Stack sx={{ width: '100%', marginTop: '20px', alignItems: 'center' }} spacing={2}>
          <Alert severity="error">{errorMessages?.[formDataKey]}</Alert>
        </Stack>
      )}
    </>
  );
};
export default DynamicSiteForm;

DynamicSiteForm.propTypes = {
  formData: PropTypes.object,
  errorMessages: PropTypes.object,
  updateFormHandler: PropTypes.func,
  formDataKey: PropTypes.string,
  setErrorMessages: PropTypes.func,
  togglableWeekDays: PropTypes.bool,
  startDate: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  endDate: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  sageItems: PropTypes.array,
  loadingDropdown: PropTypes.bool,
  required: PropTypes.bool,
};
