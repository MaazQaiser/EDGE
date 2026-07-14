import { Box, Button, Typography } from '@mui/material';
import LoaderComponent from 'commonComponents/loader';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import {
  fetchSettingsPreferences,
  fetchSettingsPreferencesConfig,
  updateSettings,
} from 'services/settings.services';
import SystemDefaultsRow from 'src/app/common/pages/settings/preferences/systemDefaults/component/SystemDefaultsRow';
import { getErrorKey, removeKey } from 'src/helper/utilityFunctions';
import { useTenantLabel } from 'src/helper/utilityHooks';
import { useCurrency } from 'src/hooks/useCurrency';
import useFormHook from 'src/hooks/useFormHook';
import { setTimeFormat } from 'src/redux/store/slices/auth';
import { toastSettings } from 'src/utils/constants';
import formValidatorJoi from 'src/utils/formValidator/formValidator.requiredCheck';
import { toaster } from 'src/utils/toast';

import { useStyles } from '../settingsStyle';

const enumData = {
  max_shift_duration: {
    label: 'maxShiftDuration',
    value: 'timeValue',
  },
  holiday_peak_factor: {
    label: 'peakRates',
    value: 'value',
  },
};

const timeOptions = [
  {
    value: '12hrs',
    label: '12 hr',
  },
  {
    value: '24hrs',
    label: '24 hr',
  },
];

// const onDemandTrackingEnum = {
//   live_tracking: {
//     label: 'live_tracking',
//     val: 'active',
//     inputType: 'switch',
//   },
// };

const geofenceEnum = {
  geofence: {
    label: 'geofence',
    val: 'active',
    inputType: 'switch',
  },
  geofence_notification: {
    label: 'geofence_notification',
    val: 'active',
    inputType: 'switch',
  },
};

const defaultValueKey = 'value';

const SystemDefaults = () => {
  const { t } = useTranslation();
  const classes = useStyles();
  const { currency: franchiseCurrency } = useCurrency();
  const dispatch = useDispatch();
  const { getLabel } = useTenantLabel();

  const { formData, setFormData, updateFormHandler, errorMessages, setErrorMessages } = useFormHook(
    {
      defaultFormData: {
        devices: [],
        shifts: [],
        invoiceGeneration: [],
        officerAvaliability: [],
        supervisorAvaliability: [],
        emailAutomation: [],
        timeFormat: [],
        geofence: [],
        onDemandTracking: [],
      },
    },
  );

  const [loading, setLoading] = useState(false);

  const createPayload = () => {
    const preferences = [];

    const pushIf = (array, condition, mapper) => {
      array?.forEach((a) => {
        if (condition(a)) preferences.push(mapper(a));
      });
    };

    // Devices
    pushIf(
      formData?.devices,
      (a) => a.rateValue,
      (a) => ({
        id: a.id,
        rateValue: a.rateValue,
      }),
    );

    // Supervisor Availability
    pushIf(
      formData?.supervisorAvaliability,
      (a) => a.time,
      (a) => ({
        id: a.id,
        time: a.time,
      }),
    );

    // Invoice Generation
    pushIf(
      formData?.invoiceGeneration,
      (a) => a.time,
      (a) => ({
        id: a.id,
        time: a.time,
      }),
    );

    // Officer Availability
    pushIf(
      formData?.officerAvaliability,
      (a) => a.time,
      (a) => ({
        id: a.id,
        time: a.time,
      }),
    );

    // Email Automation
    pushIf(
      formData?.emailAutomation,
      (a) => a.time,
      (a) => ({
        id: a.id,
        time: a.time,
      }),
    );

    // Shifts
    pushIf(
      formData?.shifts,
      (a) => a.value,
      (a) => {
        const optionsVal = enumData[a?.oldSlug]?.value;
        return {
          id: a.id,
          [optionsVal]: a.value,
        };
      },
    );

    // Time Format
    pushIf(
      formData?.timeFormat,
      (a) => a?.timeFormatSlug?.value,
      (a) => {
        dispatch(setTimeFormat(a?.timeFormatSlug?.value));
        return {
          id: a.id,
          format: a?.timeFormatSlug?.value,
          value: a?.timeFormatSlug?.value,
        };
      },
    );

    // Geofence
    pushIf(
      formData?.geofence,
      (a) => {
        const config = geofenceEnum[a?.slug];
        const valKey = config?.val || defaultValueKey;
        return a?.[valKey] !== undefined && a?.[valKey] !== null;
      },
      (a) => {
        const config = geofenceEnum[a?.slug];
        const valKey = config?.val || defaultValueKey;

        return {
          id: a.id,
          [valKey]: a[valKey],
        };
      },
    );

    // On Demand Tracking
    // pushIf(
    //   formData?.onDemandTracking,
    //   (a) => {
    //     const config = onDemandTrackingEnum[a?.slug];
    //     return config && a?.[config.val] !== undefined && a?.[config.val] !== null;
    //   },
    //   (a) => {
    //     const { val } = onDemandTrackingEnum[a?.slug];
    //     return {
    //       id: a.id,
    //       [val]: a[val],
    //     };
    //   },
    // );

    return preferences;
  };

  const updateRunSheet = async () => {
    try {
      const validatePayload = {
        devices: formData?.devices,
        shifts: formData?.shifts,
        invoiceGeneration: formData?.invoiceGeneration,
        officerAvaliability: formData?.officerAvaliability,
        supervisorAvaliability: formData?.supervisorAvaliability,
        emailAutomation: formData?.emailAutomation,
        geofence: formData?.geofence,
      };

      const errors = await formValidatorJoi(validatePayload, t);

      if (errors && Object.keys(errors).length) {
        setErrorMessages(errors);
        return;
      }

      setLoading(true);

      const payLoad = {
        preferences: createPayload(),
      };

      const response = await updateSettings(payLoad);

      if (response?.statusCode === 200) {
        toaster.success({
          text: response?.message,
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
      }

      setLoading(false);
    } catch (error) {
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
      setLoading(false);
    }
  };

  const fetchSettingsTabsConfig = async () => {
    try {
      setLoading(true);
      const response = await fetchSettingsPreferencesConfig();
      if (response.statusCode === 200) {
        await fetchSettings(response?.data);
      }
    } catch (e) {
      setLoading(false);
      toaster.error({
        text: e?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };

  const mapDropDownOptionsOfSettings = (systemData, configData) => {
    return systemData?.map((data) => {
      const optionsKey = enumData[data?.slug]?.label;
      const optionsVal = enumData[data?.slug]?.value;
      const options = configData?.[optionsKey]?.map((a) => {
        return {
          value: a.value.toString(),
          label: a.label,
        };
      });
      const selectedOption = options?.find((a) => a.value == data?.[optionsVal]);
      return {
        ...data,
        options: options,
        [optionsKey]: {
          value: selectedOption?.value || '',
          label: selectedOption?.label || '',
        },
        oldSlug: data?.slug,
        slug: optionsKey,
      };
    });
  };

  const fetchSettings = async (configData) => {
    try {
      setLoading(true);
      const response = await fetchSettingsPreferences();
      if (response.statusCode === 200) {
        const data = response?.data?.preferences;

        setFormData({
          devices: data?.devices,
          emailAutomation: data?.emailAutomation,
          invoiceGeneration: data?.invoiceGeneration,
          officerAvaliability: data?.officerAvaliability,
          supervisorAvaliability: data?.supervisorAvaliability,
          shifts: mapDropDownOptionsOfSettings(data?.shifts, configData),
          geofence: data?.geofence,
          onDemandTracking: data?.liveTracking,
          timeFormat: data?.timeFormat?.map((data) => {
            const selectedOptionLabel = timeOptions.find((a) => a.value === data?.format);
            return {
              ...data,
              options: timeOptions,
              timeFormatSlug: {
                value: selectedOptionLabel?.value,
                label: selectedOptionLabel?.label,
              },
            };
          }),
        });
        setLoading(false);
      }
    } catch (e) {
      setLoading(false);
      toaster.error({
        text: e?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };

  const handleValueChange = (event, index, key, addExtraVal) => {
    const { name, value } = event.target;

    const formDataRunSheet = formData?.[name];

    formDataRunSheet[index] = {
      ...formDataRunSheet[index],
      [key]: value,
    };

    if (addExtraVal) {
      formDataRunSheet[index].value = value?.value;
    }

    const errorKey = getErrorKey(key, name, index);
    setErrorMessages((prev) => removeKey([errorKey], prev));

    updateFormHandler(name, formDataRunSheet);
  };

  useEffect(() => {
    fetchSettingsTabsConfig();
  }, []);

  /**
   * Checks if the primary option is currently inactive
   * while the current item is not the primary one.
   *
   * @param {Object} params - The parameters object.
   * @param {Object} params.currentItem - The current option/item being evaluated.
   * @param {string} params.primaryKey - The slug/identifier of the primary option.
   * @param {Array} params.allItems - The list of all options/items.
   * @returns {boolean} - Returns true if the current item is not the primary one
   *                      and the primary option is inactive (or not present).
   */
  const isPrimaryOptionInactive = ({ currentItem, primaryKey, allItems }) =>
    // Ensure the current item is NOT the primary option
    currentItem?.slug !== primaryKey &&
    // Check if the primary option in the list is inactive (or not present)
    !allItems?.find((item) => item?.slug === primaryKey)?.active;

  return (
    <Box className={classes.sitesListingCommonContainer}>
      {loading && <LoaderComponent size={50} color={'primary'} label={'Loading'} />}

      <Box className={classes.mainBoxWrapperAvailbiltity}>
        <Box className={classes.tableWrapper}>
          <Box className={classes.headerTitlle}>
            <Typography variant="h4" className={classes.zoneCustomText} gutterBottom>
              {t('obx.systemDefaults.headings.main')}
            </Typography>
            <Typography variant="body2" className={classes.zoneDetailText}>
              {t('obx.systemDefaults.headings.desc')}
            </Typography>
          </Box>
        </Box>

        <Box className={classes.tableTitleWrapper}>
          <Typography variant="h5" className={classes.tableTitle}>
            {t('obx.systemDefaults.headings.jobShift')}
          </Typography>
        </Box>

        <Box className={classes.tableWrapperOne}>
          <Box className={classes.serviceHeader}>
            <Typography variant="subtitle3" className={classes.tableCalendarHeading}>
              {t('obx.systemDefaults.tables.listing.columnsHeader.eventName')}
            </Typography>
            <Typography variant="subtitle3" className={classes.tableCalendarHeading}>
              {t('obx.systemDefaults.tables.listing.columnsHeader.eventDescription')}
            </Typography>
            <Typography variant="subtitle3" className={classes.tableCalendarHeading}>
              {t('obx.systemDefaults.tables.listing.columnsHeader.value')}
            </Typography>
          </Box>
        </Box>
        <div className={classes.devices}>
          {formData?.shifts?.map((a, index) => {
            return (
              <Box key={index}>
                <SystemDefaultsRow
                  index={index}
                  data={a}
                  onValueChange={handleValueChange}
                  errors={errorMessages}
                  name={'shifts'}
                  valKey={a.slug}
                  type={'dropDown'}
                  addExtraVal={true}
                />
              </Box>
            );
          })}
        </div>

        <Box className={classes.tableTitleWrapper}>
          <Typography variant="h5" className={classes.tableTitle}>
            {t('obx.systemDefaults.headings.timeFormat')}
          </Typography>
        </Box>

        <Box className={classes.tableWrapperOne}>
          <Box className={classes.serviceHeader}>
            <Typography variant="subtitle3" className={classes.tableCalendarHeading}>
              {t('obx.systemDefaults.tables.listing.columnsHeader.eventName')}
            </Typography>
            <Typography variant="subtitle3" className={classes.tableCalendarHeading}>
              {t('obx.systemDefaults.tables.listing.columnsHeader.eventDescription')}
            </Typography>
            <Typography variant="subtitle3" className={classes.tableCalendarHeading}>
              {t('obx.systemDefaults.tables.listing.columnsHeader.value')}
            </Typography>
          </Box>
        </Box>
        <div className={classes.devices}>
          {formData?.timeFormat?.map((a, index) => {
            return (
              <Box key={index}>
                <SystemDefaultsRow
                  index={index}
                  data={a}
                  onValueChange={handleValueChange}
                  errors={errorMessages}
                  name={'timeFormat'}
                  valKey={'timeFormatSlug'}
                  type={'dropDown'}
                />
              </Box>
            );
          })}
        </div>

        <Box className={classes.tableTitleWrapper}>
          <Typography variant="h5" className={classes.tableTitle}>
            {t('obx.systemDefaults.headings.devices')}
          </Typography>
        </Box>

        <Box className={classes.tableWrapperOne}>
          <Box className={classes.serviceHeader}>
            <Typography variant="subtitle3" className={classes.tableCalendarHeading}>
              {t('obx.systemDefaults.tables.listing.columnsHeader.deviceName')}
            </Typography>
            <Typography variant="subtitle3" className={classes.tableCalendarHeading}>
              {t('obx.systemDefaults.tables.listing.columnsHeader.description')}
            </Typography>
            <Typography variant="subtitle3" className={classes.tableCalendarHeading}>
              {`${t('obx.systemDefaults.tables.listing.columnsHeader.rate')} (in ${franchiseCurrency})`}
            </Typography>
          </Box>
        </Box>
        <Box className={classes.tableWrapperCalendar}>
          {formData?.devices?.map((a, index) => {
            return (
              <Box key={index}>
                <SystemDefaultsRow
                  index={index}
                  data={a}
                  onValueChange={handleValueChange}
                  errors={errorMessages}
                  name={'devices'}
                  valKey={'rateValue'}
                  descKey={'rateUnit'}
                />
              </Box>
            );
          })}
        </Box>

        <Box className={classes.tableTitleWrapper}>
          <Typography variant="h5" className={classes.tableTitle}>
            {t('obx.systemDefaults.headings.invoiceGeneration')}
          </Typography>
        </Box>

        <Box className={classes.tableWrapperOne}>
          <Box className={classes.serviceHeader}>
            <Typography variant="subtitle3" className={classes.tableCalendarHeading}>
              {t('obx.systemDefaults.tables.listing.columnsHeader.event')}
            </Typography>
            <Typography variant="subtitle3" className={classes.tableCalendarHeading}>
              {t('obx.systemDefaults.tables.listing.columnsHeader.description')}
            </Typography>
            <Typography variant="subtitle3" className={classes.tableCalendarHeading}>
              {t('obx.systemDefaults.tables.listing.columnsHeader.timeInvoiceGeneration')}
            </Typography>
          </Box>
        </Box>

        <Box className={classes.tableWrapperCalendar}>
          {formData?.invoiceGeneration?.map((a, index) => {
            return (
              <Box key={index}>
                <SystemDefaultsRow
                  index={index}
                  data={a}
                  onValueChange={handleValueChange}
                  errors={errorMessages}
                  name={'invoiceGeneration'}
                  valKey={'time'}
                  descKey={'description'}
                  type="timer"
                />
              </Box>
            );
          })}
        </Box>

        <Box className={classes.tableTitleWrapper}>
          <Typography variant="h5" className={classes.tableTitle}>
            {t('obx.systemDefaults.headings.officersAvailability', {
              officer: getLabel('terms', 'officer', t),
            })}
          </Typography>
        </Box>

        <Box className={classes.tableWrapperOne}>
          <Box className={classes.serviceHeader}>
            <Typography variant="subtitle3" className={classes.tableCalendarHeading}>
              {t('obx.systemDefaults.tables.listing.columnsHeader.event')}
            </Typography>
            <Typography variant="subtitle3" className={classes.tableCalendarHeading}>
              {t('obx.systemDefaults.tables.listing.columnsHeader.eventDescription')}
            </Typography>
            <Typography variant="subtitle3" className={classes.tableCalendarHeading}>
              {t('obx.systemDefaults.tables.listing.columnsHeader.time')}
            </Typography>
          </Box>
        </Box>

        <Box className={classes.tableWrapperCalendar}>
          {formData?.officerAvaliability?.map((a, index) => {
            return (
              <Box key={index}>
                <SystemDefaultsRow
                  index={index}
                  data={a}
                  onValueChange={handleValueChange}
                  errors={errorMessages}
                  name={'officerAvaliability'}
                  valKey={'time'}
                  descKey={'description'}
                  type="timer"
                />
              </Box>
            );
          })}
        </Box>

        <Box className={classes.tableTitleWrapper}>
          <Typography variant="h5" className={classes.tableTitle}>
            {t('obx.systemDefaults.headings.supervisorAvailability', {
              supervisor: getLabel('terms', 'supervisor', t),
            })}
          </Typography>
        </Box>

        <Box className={classes.tableWrapperOne}>
          <Box className={classes.serviceHeader}>
            <Typography variant="subtitle3" className={classes.tableCalendarHeading}>
              {t('obx.systemDefaults.tables.listing.columnsHeader.event')}
            </Typography>
            <Typography variant="subtitle3" className={classes.tableCalendarHeading}>
              {t('obx.systemDefaults.tables.listing.columnsHeader.eventDescription')}
            </Typography>
            <Typography variant="subtitle3" className={classes.tableCalendarHeading}>
              {t('obx.systemDefaults.tables.listing.columnsHeader.time')}
            </Typography>
          </Box>
        </Box>

        <Box className={classes.tableWrapperCalendar}>
          {formData?.supervisorAvaliability?.map((a, index) => {
            return (
              <Box key={index}>
                <SystemDefaultsRow
                  index={index}
                  data={a}
                  onValueChange={handleValueChange}
                  errors={errorMessages}
                  name={'supervisorAvaliability'}
                  valKey={'time'}
                  descKey={'description'}
                  type="timer"
                />
              </Box>
            );
          })}
        </Box>

        {/* <Box className={classes.serviceSwitchHeader}>
          <Typography variant="h5" className={classes.tableTitle}>
            {t('obx.systemDefaults.headings.onDemandTracking')}
          </Typography>
        </Box>

        <Box className={classes.tableWrapperOne}>
          <Box className={classes.serviceHeader}>
            <Typography variant="subtitle3" className={classes.tableCalendarHeading}>
              {t('obx.systemDefaults.tables.listing.columnsHeader.event')}
            </Typography>
            <Typography variant="subtitle3" className={classes.tableCalendarHeading}>
              {t('obx.systemDefaults.tables.listing.columnsHeader.eventDescription')}
            </Typography>
            <Typography variant="subtitle3" className={classes.tableCalendarHeading}>
              {t('obx.systemDefaults.tables.listing.columnsHeader.currentSetting')}
            </Typography>
          </Box>
        </Box>
        <div className={classes.devices}>
          {formData?.onDemandTracking?.map((a, index) => {
            const { inputType, val } = onDemandTrackingEnum[a?.slug];
            return (
              <Box key={index}>
                <SystemDefaultsRow
                  index={index}
                  data={a}
                  onValueChange={handleValueChange}
                  errors={errorMessages}
                  name="onDemandTracking"
                  valKey={val}
                  type={inputType}
                />
              </Box>
            );
          })}
        </div> */}

        <Box className={classes.tableTitleWrapper}>
          <Typography variant="h5" className={classes.tableTitle}>
            {t('obx.systemDefaults.headings.emailAutomation')}
          </Typography>
        </Box>

        <Box className={classes.tableWrapperOne}>
          <Box className={classes.serviceHeader}>
            <Typography variant="subtitle3" className={classes.tableCalendarHeading}>
              {t('obx.systemDefaults.tables.listing.columnsHeader.event')}
            </Typography>
            <Typography variant="subtitle3" className={classes.tableCalendarHeading}>
              {t('obx.systemDefaults.tables.listing.columnsHeader.eventDescription')}
            </Typography>
            <Typography variant="subtitle3" className={classes.tableCalendarHeading}>
              {t('obx.systemDefaults.tables.listing.columnsHeader.timeAutomation')}
            </Typography>
          </Box>
        </Box>

        <Box className={classes.tableWrapperCalendar}>
          {formData?.emailAutomation?.map((a, index) => {
            return (
              <Box key={index}>
                <SystemDefaultsRow
                  index={index}
                  data={a}
                  onValueChange={handleValueChange}
                  errors={errorMessages}
                  name={'emailAutomation'}
                  valKey={'time'}
                  descKey={'description'}
                  type="timer"
                />
              </Box>
            );
          })}
        </Box>
        <>
          <Box className={classes.serviceSwitchHeader}>
            <Typography variant="h5" className={classes.tableTitle}>
              {t('obx.systemDefaults.headings.geofence')}
            </Typography>
          </Box>
          <Box className={classes.tableWrapperOne}>
            <Box className={classes.serviceHeader}>
              <Typography variant="subtitle3" className={classes.tableCalendarHeading}>
                {t('obx.systemDefaults.tables.listing.columnsHeader.configurationType')}
              </Typography>
              <Typography variant="subtitle3" className={classes.tableCalendarHeading}>
                {t('obx.systemDefaults.tables.listing.columnsHeader.eventDescription')}
              </Typography>
              <Typography variant="subtitle3" className={classes.tableCalendarHeading}>
                {t('obx.systemDefaults.tables.listing.columnsHeader.currentSetting')}
              </Typography>
            </Box>
          </Box>
          <div className={classes.devices}>
            {formData?.geofence?.map((a, index) => {
              const { inputType, val = defaultValueKey } = geofenceEnum?.[a?.slug] || {};
              const isDisabledSecondaryFields = isPrimaryOptionInactive({
                currentItem: a,
                primaryKey: geofenceEnum?.geofence?.label,
                allItems: formData?.geofence,
              });

              return (
                <Box key={index}>
                  <SystemDefaultsRow
                    index={index}
                    data={a}
                    onValueChange={handleValueChange}
                    errors={errorMessages}
                    name="geofence"
                    valKey={val}
                    type={inputType}
                    isDisabled={isDisabledSecondaryFields}
                  />
                </Box>
              );
            })}
          </div>
        </>

        <Box className={classes.saveBtnWrapper}>
          <Button disabled={loading} variant="primary" type="button" onClick={updateRunSheet}>
            {t('obx.buttons.save')}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default SystemDefaults;
