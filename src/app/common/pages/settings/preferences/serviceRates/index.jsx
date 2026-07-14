import { Box, Button, Typography } from '@mui/material';
import LoaderComponent from 'commonComponents/loader';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { fetchSettingsPreferences, updateSettings } from 'services/settings.services';
import SettingServiceRatesRow from 'src/app/common/pages/settings/preferences/serviceRates/component/settingServiceRatesRow';
import { getErrorKey, removeKey } from 'src/helper/utilityFunctions';
import { useCurrency } from 'src/hooks/useCurrency';
import useFormHook from 'src/hooks/useFormHook';
import { toastSettings } from 'src/utils/constants';
import formValidatorJoi from 'src/utils/formValidator/formValidator.requiredCheck';
import { toaster } from 'src/utils/toast';

import { useStyles } from '../settingsStyle';

const ServiceRates = () => {
  const { t } = useTranslation();
  const { currency: franchiseCurrency } = useCurrency();

  const classes = useStyles();

  const { formData, setFormData, updateFormHandler, errorMessages, setErrorMessages } = useFormHook(
    {
      defaultFormData: {
        operationalServices: [],
        additionalClientServices: [],
      },
    },
  );

  const [loading, setLoading] = useState(false);

  const mapPayloadForRunSheet = () => {
    let preferences = [];

    formData?.operationalServices?.map((a) => {
      preferences = [
        ...preferences,
        {
          id: a.id,
          maxRate: Number(a.maxRate),
          minRate: Number(a.minRate),
        },
      ];
    });

    formData?.additionalClientServices?.map((a) => {
      preferences = [
        ...preferences,
        {
          id: a.id,
          rateValue: a.rateValue,
        },
      ];
    });

    return preferences;
  };

  const updateRunSheet = async () => {
    try {
      const validatePayload = {
        operationalServices: formData?.operationalServices,
        additionalClientServices: formData?.additionalClientServices,
      };

      const errors = await formValidatorJoi(validatePayload, t);

      if (errors && Object.keys(errors).length) {
        setErrorMessages(errors);
        return;
      }

      setLoading(true);
      setErrorMessages({});
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
        const data = response?.data?.preferences;
        setFormData({
          operationalServices: data?.operationalServices,
          additionalClientServices: data?.additionalClientServices,
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
              {t('obx.serviceRatesSettings.headings.main')}
            </Typography>
            <Typography variant="body2" className={classes.zoneDetailText}>
              {t('obx.serviceRatesSettings.headings.desc')}
            </Typography>
          </Box>
        </Box>
        <Box className={classes.tableTitleWrapper}>
          <Typography variant="h5" className={classes.tableTitle}>
            {t('obx.serviceRatesSettings.headings.operationalServices')}
          </Typography>
        </Box>
        <Box className={classes.tableWrapperOne}>
          <Box className={classes.serviceHeader}>
            <Typography variant="subtitle3" className={classes.tableCalendarHeading}>
              {t('obx.serviceRatesSettings.tables.listing.columnsHeader.serviceType')}
            </Typography>
            <Typography variant="subtitle3" className={classes.tableCalendarHeading}>
              {t('obx.serviceRatesSettings.tables.listing.columnsHeader.unitRate')}
            </Typography>
            <Typography variant="subtitle3" className={classes.tableCalendarHeading}>
              {`${t('obx.serviceRatesSettings.tables.listing.columnsHeader.rate')} (in ${franchiseCurrency})`}
            </Typography>
          </Box>
        </Box>
        <Box className={classes.tableWrapperCalendar}>
          {formData?.operationalServices?.map((a, index) => {
            return (
              <Box key={index}>
                <SettingServiceRatesRow
                  index={index}
                  data={a}
                  onValueChange={handleValueChange}
                  errors={errorMessages}
                  name={'operationalServices'}
                  valKey={'minRate'}
                  secValKey={'maxRate'}
                  descKey={'rateUnit'}
                  isRange
                />
              </Box>
            );
          })}
        </Box>

        <Box className={classes.tableTitleWrapper}>
          <Typography variant="h5" className={classes.tableTitle}>
            {t('obx.serviceRatesSettings.headings.additionalClientServices')}
          </Typography>
        </Box>
        <Box className={classes.tableWrapperOne}>
          <Box className={classes.serviceHeader}>
            <Typography variant="subtitle3" className={classes.tableCalendarHeading}>
              {t('obx.serviceRatesSettings.tables.listing.columnsHeader.serviceType')}
            </Typography>
            <Typography variant="subtitle3" className={classes.tableCalendarHeading}>
              {t('obx.serviceRatesSettings.tables.listing.columnsHeader.unitRate')}
            </Typography>
            <Typography variant="subtitle3" className={classes.tableCalendarHeading}>
              {`${t('obx.serviceRatesSettings.tables.listing.columnsHeader.rate')} (in ${franchiseCurrency})`}
            </Typography>
          </Box>
        </Box>
        <Box className={classes.tableWrapperCalendar}>
          {formData?.additionalClientServices?.map((a, index) => {
            return (
              <Box key={index}>
                <SettingServiceRatesRow
                  index={index}
                  data={a}
                  onValueChange={handleValueChange}
                  errors={errorMessages}
                  name={'additionalClientServices'}
                  valKey={'rateValue'}
                  descKey={'rateUnit'}
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

export default ServiceRates;
