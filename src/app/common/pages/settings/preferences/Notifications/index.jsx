import { Box, Button, Switch, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import LoaderComponent from 'src/app/components/common/loader';
import { getErrorKey, removeKey } from 'src/helper/utilityFunctions';
import { useTenantLabel } from 'src/helper/utilityHooks';
import useFormHook from 'src/hooks/useFormHook';
import { fetchSettingsPreferences, updateSettings } from 'src/services/settings.services';
import { toastSettings } from 'src/utils/constants';
import formValidatorJoi from 'src/utils/formValidator/formValidator.requiredCheck';
import { toaster } from 'src/utils/toast';

import SettingPreferencesRow from '../components/settingPreferencesRow';
import { useStyles } from '../settingsStyle';

const Notifications = () => {
  const { t } = useTranslation();
  const classes = useStyles();
  const { getLabel } = useTenantLabel();

  const [loading, setLoading] = useState(false);
  const [showTableWrapper, setShowTableWrapper] = useState({
    officerAttendanceNotifications: false,
    geofenceAlerts: false,
  });

  const { formData, setFormData, updateFormHandler, errorMessages, setErrorMessages } = useFormHook(
    {
      defaultFormData: {
        officerAttendanceNotifications: [],
        geofenceAlerts: [],
      },
    },
  );

  /** Fetch settings on mount */
  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetchSettingsPreferences();

      if (response?.statusCode === 200) {
        const data = response?.data?.preferences || {};
        const officerNotifications = data?.officerAttendanceNotifications || [];
        const geofenceNotifications = data?.geofenceAlert || [];

        setFormData({
          officerAttendanceNotifications: officerNotifications,
          geofenceAlerts: geofenceNotifications,
        });

        setShowTableWrapper({
          officerAttendanceNotifications: officerNotifications?.[0]?.active ?? false,
          geofenceAlerts: geofenceNotifications?.[0]?.active ?? false,
        });
      }
    } catch (e) {
      toaster.error({
        text: e?.message || t('errors.generic'),
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    } finally {
      setLoading(false);
    }
  }, [setFormData, t]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  /** Prepare payload for update */
  const mapPayloadForNotifications = useCallback(() => {
    const preferences = [];

    const appendData = (items, key) => {
      (items || []).forEach((item) => {
        preferences.push({
          id: item?.id,
          timeValue: item?.timeValue ?? null,
          active: showTableWrapper[key],
        });
      });
    };

    appendData(formData?.officerAttendanceNotifications, 'officerAttendanceNotifications');
    appendData(formData?.geofenceAlerts, 'geofenceAlerts');

    return preferences;
  }, [formData, showTableWrapper]);

  /** Update settings handler */
  const updateNotificationSettings = async () => {
    try {
      const validatePayload = {
        officerAttendanceNotifications: formData?.officerAttendanceNotifications?.filter(
          (item) => item?.timeValue !== undefined,
        ),
      };

      const errors = await formValidatorJoi(validatePayload, t);
      if (errors && Object.keys(errors).length) {
        setErrorMessages(errors);
        return;
      }

      setLoading(true);
      const payLoad = { preferences: mapPayloadForNotifications() };
      const response = await updateSettings(payLoad);

      if (response?.statusCode === 200) {
        toaster.success({
          text: response?.message,
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
      }
    } catch (error) {
      toaster.error({
        text: error?.message || t('errors.generic'),
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    } finally {
      setLoading(false);
    }
  };

  /** Value change handler */
  const handleValueChange = (event, index, key) => {
    const { name, value } = event.target;
    const currentArray = [...(formData?.[name] || [])];
    currentArray[index] = { ...currentArray[index], [key]: value };

    const errorKey = getErrorKey(key, name, index);
    setErrorMessages((prev) => removeKey([errorKey], prev));
    updateFormHandler(name, currentArray);
  };

  /** Switch toggle */
  const handleSwitchChange = (name, checked) => {
    setShowTableWrapper((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };
  return (
    <Box className={classes.sitesListingCommonContainer}>
      {loading && <LoaderComponent size={50} color="primary" label={t('common.loading')} />}

      <Box className={classes.mainBoxWrapperAvailbiltity}>
        <Box className={classes.notificationTableTitleWrapper}>
          <Box className={classes.saveBtnWrapper}>
            <Button variant="secondaryGrey" type="button">
              {t('obx.buttons.cancel')}
            </Button>
            <Button
              variant="primary"
              type="button"
              disabled={loading}
              onClick={updateNotificationSettings}
            >
              {t('obx.buttons.saveChanges')}
            </Button>
          </Box>

          {/* Officer Attendance Notifications */}
          <NotificationSection
            name="officerAttendanceNotifications"
            title={t('obx.notificatons.headings.officerAttandace')}
            notifications={formData?.officerAttendanceNotifications}
            showTable={showTableWrapper.officerAttendanceNotifications}
            onSwitchChange={handleSwitchChange}
            onValueChange={handleValueChange}
            errorMessages={errorMessages}
          />

          {/* Geofence Alerts */}
          <NotificationSection
            name="geofenceAlerts"
            title={t('obx.notificatons.headings.dedicatedOfficerGeofenceAlerts', {
              officer: getLabel('terms', 'officer', t),
              dedicated: getLabel('terms', 'dedicated', t),
            })}
            notifications={formData?.geofenceAlerts}
            showTable={showTableWrapper.geofenceAlerts}
            onSwitchChange={handleSwitchChange}
            onValueChange={handleValueChange}
            errorMessages={errorMessages}
            disabledThirdColumn
          />
        </Box>
      </Box>
    </Box>
  );
};

export default Notifications;

/* ------------------------------------ */
/* Child Section Component */
/* ------------------------------------ */
const NotificationSection = ({
  name,
  title,
  notifications,
  showTable,
  onSwitchChange,
  onValueChange,
  errorMessages,
  disabledThirdColumn = false,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();

  return (
    <Box className={classes.mainNotificationSection}>
      <Box className={classes.switchWrapper}>
        <Typography variant="h5" className={classes.tableTitle}>
          {title}
        </Typography>
        <Box className={classes.inlineCheckBox}>
          <Switch
            name={name}
            onChange={(e) => onSwitchChange(name, e.target.checked)}
            checked={!!showTable}
            inputProps={{ 'aria-label': `${name}-notification` }}
          />
          <Typography className={classes.footerlable} variant="body2">
            {t('obx.sites.createSite.pushNotification')}
          </Typography>
        </Box>
      </Box>

      {showTable && (
        <Box className={classes.notificationTableWrapper}>
          <Box className={classes.tableWrapperOne}>
            <Box className={classes.timeHeader}>
              <Typography variant="subtitle3" className={classes.tableCalendarHeading}>
                {t('obx.notificatons.tables.listing.columnsHeader.event')}
              </Typography>
              <Typography variant="subtitle3" className={classes.tableCalendarHeading}>
                {t('obx.notificatons.tables.listing.columnsHeader.description')}
              </Typography>
              {!disabledThirdColumn && (
                <Typography variant="subtitle3" className={classes.tableCalendarHeading}>
                  {t('obx.notificatons.tables.listing.columnsHeader.time')}
                </Typography>
              )}
            </Box>
          </Box>

          {notifications?.map((a, index) => (
            <SettingPreferencesRow
              key={index}
              index={index}
              data={a}
              onValueChange={onValueChange}
              errors={errorMessages}
              name={name}
              valKey={a?.timeValue !== undefined ? 'timeValue' : false}
            />
          ))}
        </Box>
      )}
    </Box>
  );
};

NotificationSection.propTypes = {
  name: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  notifications: PropTypes.array,
  showTable: PropTypes.bool,
  onSwitchChange: PropTypes.func,
  onValueChange: PropTypes.func,
  errorMessages: PropTypes.object,
  disabledThirdColumn: PropTypes.bool,
};
