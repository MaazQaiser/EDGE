import { Box, Button, Typography } from '@mui/material';
import LoaderComponent from 'commonComponents/loader';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { fetchSettingsPreferences, updateSettings } from 'services/settings.services';
import SettingPreferencesRow from 'src/app/common/pages/settings/preferences/components/settingPreferencesRow';
import { getErrorKey, removeKey } from 'src/helper/utilityFunctions';
import { useTenantLabel } from 'src/helper/utilityHooks';
import useFormHook from 'src/hooks/useFormHook';
import { toastSettings } from 'src/utils/constants';
import formValidatorJoi from 'src/utils/formValidator/formValidator.requiredCheck';
import { toaster } from 'src/utils/toast';

import { useStyles } from '../settingsStyle';

const ThresholdValues = () => {
  const { t } = useTranslation();
  const { getLabel } = useTenantLabel();
  const classes = useStyles();

  const { formData, setFormData, updateFormHandler, errorMessages, setErrorMessages } = useFormHook(
    {
      defaultFormData: {
        thresholds: [],
        autoClockOut: [],
        overtimeHoursLimit: [],
      },
    },
  );

  const [loading, setLoading] = useState(false);

  const mapPayloadForRunSheet = () => {
    let preferences = [];

    formData?.thresholds?.map((a) => {
      preferences = [
        ...preferences,
        {
          id: a.id,
          timeValue: a.timeValue,
        },
      ];
    });

    formData?.autoClockOut?.map((a) => {
      if (a.timeValue)
        preferences = [
          ...preferences,
          {
            id: a.id,
            timeValue: a.timeValue,
          },
        ];
    });

    formData?.overtimeHoursLimit?.map((a) => {
      if (a.value)
        preferences = [
          ...preferences,
          {
            id: a.id,
            value: a?.value,
          },
        ];
    });

    return preferences;
  };

  const updateRunSheet = async () => {
    try {
      const validatePayload = {
        thresholds: formData?.thresholds,
        autoClockOut: formData?.autoClockOut,
        overtimeHoursLimit: formData?.overtimeHoursLimit,
      };
      const errors = await formValidatorJoi(validatePayload, t);

      if (errors && Object.keys(errors).length) {
        setErrorMessages(errors);
        return;
      }

      setLoading(true);

      const payLoad = {
        preferences: mapPayloadForRunSheet(),
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

  const handleValueChange = (event, index, key) => {
    const { name, value } = event.target;

    const formDataRunSheet = formData?.[name];

    formDataRunSheet[index] = {
      ...formDataRunSheet[index],
      [key]: value,
    };

    const errorKey = getErrorKey(key, name, index);
    setErrorMessages((prev) => removeKey([errorKey], prev));
    updateFormHandler(name, formDataRunSheet);
  };

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await fetchSettingsPreferences();
      if (response.statusCode === 200) {
        const data = response?.data?.preferences || [];

        setFormData({
          thresholds: data?.thresholds,
          autoClockOut: data?.autoClockOut,
          overtimeHoursLimit: data?.overtimeHoursLimit,
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

  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <Box className={classes.sitesListingCommonContainer}>
      {loading && <LoaderComponent size={50} color={'primary'} label={'Loading'} />}

      <Box className={classes.mainBoxWrapperAvailbiltity}>
        <Box className={classes.tableWrapper}>
          <Box className={classes.headerTitlle}>
            <Typography variant="h4" className={classes.zoneCustomText} gutterBottom>
              {t('obx.thresholdValues.headings.main')}
            </Typography>
            <Typography variant="body2" className={classes.zoneDetailText}>
              {t('obx.thresholdValues.headings.desc', { officer: getLabel('roles', 'officer', t) })}
            </Typography>
          </Box>
        </Box>

        <Box className={classes.tableWrapperOne}>
          <Box className={classes.timeHeader}>
            <Typography variant="subtitle3" className={classes.tableCalendarHeading}>
              {t('obx.thresholdValues.tables.listing.columnsHeader.event')}
            </Typography>
            <Typography variant="subtitle3" className={classes.tableCalendarHeading}>
              {t('obx.thresholdValues.tables.listing.columnsHeader.description')}
            </Typography>
            <Typography variant="subtitle3" className={classes.tableCalendarHeading}>
              {t('obx.thresholdValues.tables.listing.columnsHeader.time')}
            </Typography>
          </Box>
        </Box>
        <Box className={classes.tableWrapperCalendar}>
          {formData?.thresholds?.map((a, index) => {
            return (
              <Box key={index}>
                <SettingPreferencesRow
                  index={index}
                  data={a}
                  onValueChange={handleValueChange}
                  errors={errorMessages}
                  name="thresholds"
                  valKey="timeValue"
                />
              </Box>
            );
          })}
        </Box>

        <Box className={classes.tableTitleWrapper}>
          <Typography variant="h5" className={classes.tableTitle}>
            {t('obx.systemDefaults.headings.autoClocOut')}
          </Typography>
        </Box>

        <Box className={classes.tableWrapperOne}>
          <Box className={classes.timeHeader}>
            <Typography variant="subtitle3" className={classes.tableCalendarHeading}>
              {t('obx.systemDefaults.tables.listing.columnsHeader.userType')}
            </Typography>
            <Typography variant="subtitle3" className={classes.tableCalendarHeading}>
              {t('obx.systemDefaults.tables.listing.columnsHeader.description')}
            </Typography>
            <Typography variant="subtitle3" className={classes.tableCalendarHeading}>
              {t('obx.systemDefaults.tables.listing.columnsHeader.timeBracketsInMins')}
            </Typography>
          </Box>
        </Box>
        <Box className={classes.tableWrapperCalendar}>
          {formData?.autoClockOut?.map((a, index) => {
            return (
              <Box key={index}>
                <SettingPreferencesRow
                  index={index}
                  data={a}
                  onValueChange={handleValueChange}
                  errors={errorMessages}
                  name={'autoClockOut'}
                  valKey={'timeValue'}
                  descKey={'description'}
                />
              </Box>
            );
          })}
        </Box>

        <Box className={classes.tableTitleWrapper}>
          <Typography variant="h5" className={classes.tableTitle}>
            {t('obx.systemDefaults.headings.overtimeHoursLimit')}
          </Typography>
        </Box>

        <Box className={classes.tableWrapperOne}>
          <Box className={classes.timeHeader}>
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
          {formData?.overtimeHoursLimit?.map((a, index) => {
            return (
              <Box key={index}>
                <SettingPreferencesRow
                  index={index}
                  data={a}
                  onValueChange={handleValueChange}
                  errors={errorMessages}
                  name={'overtimeHoursLimit'}
                  valKey={'value'}
                  descKey={'description'}
                  type="input"
                />
              </Box>
            );
          })}
        </Box>

        <Box className={classes.saveBtnWrapper}>
          <Button disabled={loading} variant="primary" type="button" onClick={updateRunSheet}>
            {t('obx.buttons.save')}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default ThresholdValues;
