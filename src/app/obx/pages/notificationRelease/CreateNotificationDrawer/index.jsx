import {
  Box,
  Button,
  FormControlLabel,
  IconButton,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import { ReactComponent as CloseIcon } from 'assets/svg/close.svg?react';
import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ResponsiveDateTimePickers from 'src/app/components/common/dateTimePicker';
import RequiredAsterik from 'src/app/components/common/requiredAsterik';
import SideDrawer from 'src/app/components/common/sideDrawer';
import {
  createReleaseNotification,
  updateReleaseNotificationById,
} from 'src/services/releaseNotifications.service';
import { toastSettings } from 'src/utils/constants';
import joiValidate from 'src/utils/formValidator/formValidator.requiredCheck';
import { toaster } from 'src/utils/toast';

import {
  dayjsWithStandardOffset,
  getCurrentStandardTimeInIsoWrtTimezone,
} from '../../schedules/helper';
import { useStyles } from './styles';

const initialFormState = {
  title: '',
  message: '',
};
const alphaNumericWithSpacesRegex = /^[a-zA-Z0-9\s]+$/;

const CreateNotificationDrawer = ({ isOpen, onClose, notification, onSuccess }) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const [formData, setFormData] = useState(initialFormState);
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduleDate, setScheduleDate] = useState(null);
  const [saving, setSaving] = useState(false);
  const [errorMessages, setErrorMessages] = useState({});

  const isEditMode = !!notification;

  useEffect(() => {
    if (isOpen && notification) {
      setFormData({
        title: notification.title || '',
        message: notification.message || '',
      });
      setIsScheduled(notification.status === 'scheduled');
      setScheduleDate(notification.scheduledAt ? dayjs(notification.scheduledAt) : null);
    }
  }, [isOpen, notification]);

  const resetForm = useCallback(() => {
    setFormData(initialFormState);
    setIsScheduled(false);
    setScheduleDate(null);
    setErrorMessages({});
  }, []);

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    if (errorMessages[field]) {
      setErrorMessages((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSave = async () => {
    setErrorMessages({});

    const validationData = {
      title: formData.title?.trim(),
      message: formData.message?.trim(),
      ...(isScheduled && {
        scheduledAt: scheduleDate
          ? (dayjs.isDayjs(scheduleDate)
              ? scheduleDate
              : dayjsWithStandardOffset(scheduleDate)
            ).toISOString()
          : '',
      }),
    };

    const errors = await joiValidate(validationData, t);

    if (errors && Object.keys(errors).length) {
      setErrorMessages(errors);
      return;
    }

    const trimmedTitle = formData.title?.trim();
    const trimmedMessage = formData.message?.trim();
    const fieldErrors = {};

    if (trimmedTitle && !alphaNumericWithSpacesRegex.test(trimmedTitle)) {
      fieldErrors.title = 'Only alphanumeric text is allowed';
    }

    if (trimmedMessage && !alphaNumericWithSpacesRegex.test(trimmedMessage)) {
      fieldErrors.message = 'Only alphanumeric text is allowed';
    }

    if (Object.keys(fieldErrors).length) {
      setErrorMessages(fieldErrors);
      return;
    }

    const scheduledAt =
      isScheduled && scheduleDate
        ? (dayjs.isDayjs(scheduleDate) ? scheduleDate : dayjs(scheduleDate)).toISOString()
        : undefined;

    const payload = {
      system_notification: {
        title: formData.title.trim(),
        message: formData.message.trim(),
        status: isScheduled ? 'scheduled' : 'draft',
        ...(isScheduled && { scheduledAt }),
      },
    };

    try {
      setSaving(true);
      let response;

      if (isEditMode) {
        response = await updateReleaseNotificationById(notification.id, payload);
      } else {
        response = await createReleaseNotification(payload);
      }

      if (response?.statusCode === 200) {
        toaster.success({
          text: response?.message || (isEditMode ? 'Notification updated' : 'Notification created'),
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
        onSuccess?.();
        handleClose();
      }
    } catch (error) {
      toaster.error({
        text: error?.message || 'Something went wrong',
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <SideDrawer isOpen={isOpen} closeDrawer={handleClose} totalWidth="700px">
      <Box className={classes.drawerContainer}>
        <Box className={classes.drawerHeader}>
          <Box>
            <Typography variant="h4" className={classes.drawerTitle}>
              {isEditMode
                ? t('obx.notificationRelease.createDrawer.editTitle', {
                    defaultValue: 'Edit Notification',
                  })
                : t('obx.notificationRelease.createDrawer.title')}
            </Typography>
            <Typography variant="body2" className={classes.drawerSubtitle}>
              {t('obx.notificationRelease.createDrawer.subtitle')}
            </Typography>
          </Box>
          <IconButton onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Box className={classes.drawerBody}>
          <Box className={classes.drawerField}>
            <Typography variant="subtitle2" className={classes.drawerLabel}>
              {t('obx.notificationRelease.createDrawer.titleLabel')}
              <RequiredAsterik />
            </Typography>
            <TextField
              fullWidth
              size="small"
              value={formData.title}
              onChange={handleChange('title')}
              placeholder={t('obx.notificationRelease.createDrawer.titlePlaceholder')}
              inputProps={{ maxLength: 40 }}
              error={!!errorMessages.title}
              helperText={errorMessages.title || null}
            />
            <Typography
              variant="caption"
              className={`${classes.drawerSubtitle} ${classes.drawerSubtitleMaxLength}`}
            >
              {formData.title.length}/40
            </Typography>
          </Box>

          <Box className={classes.drawerField}>
            <Typography variant="subtitle2" className={classes.drawerLabel}>
              {t('obx.notificationRelease.createDrawer.messageLabel')}
              <RequiredAsterik />
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={4}
              value={formData.message}
              onChange={handleChange('message')}
              placeholder={t('obx.notificationRelease.createDrawer.messagePlaceholder')}
              inputProps={{ maxLength: 120 }}
              error={!!errorMessages.message}
              helperText={errorMessages.message || null}
            />
            <Typography
              variant="caption"
              className={`${classes.drawerSubtitle} ${classes.drawerSubtitleMaxLength}`}
            >
              {formData.message.length}/120
            </Typography>
          </Box>

          <Box className={classes.drawerToggle}>
            <Box>
              <Typography variant="subtitle2" fontWeight={600}>
                {t('obx.notificationRelease.createDrawer.scheduleToggleLabel')}
              </Typography>
              <Typography variant="body2" className={classes.drawerSubtitle}>
                {t('obx.notificationRelease.createDrawer.scheduleToggleDescription')}
              </Typography>
            </Box>
            <FormControlLabel
              control={
                <Switch
                  className={classes.scheduleSwitch}
                  checked={isScheduled}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setIsScheduled(checked);
                    if (!checked) {
                      setScheduleDate(null);
                      setErrorMessages((prev) => ({ ...prev, scheduledAt: undefined }));
                    }
                  }}
                />
              }
              label=""
            />
          </Box>

          {isScheduled && (
            <Box className={classes.drawerField}>
              <Typography variant="subtitle2" className={classes.drawerLabel}>
                {t('obx.notificationRelease.createDrawer.scheduleDateLabel')}
                <RequiredAsterik />
              </Typography>
              <ResponsiveDateTimePickers
                value={scheduleDate}
                onChange={(val) => {
                  setScheduleDate(val);
                  if (errorMessages.scheduledAt) {
                    setErrorMessages((prev) => ({ ...prev, scheduledAt: undefined }));
                  }
                }}
                minDateTime={getCurrentStandardTimeInIsoWrtTimezone()}
                placeholder={t('obx.notificationRelease.createDrawer.scheduleDatePlaceholder')}
              />
              {errorMessages.scheduledAt && (
                <Typography variant="caption" color="error">
                  {errorMessages.scheduledAt}
                </Typography>
              )}
            </Box>
          )}
        </Box>

        <Box className={classes.drawerFooter}>
          <Button variant="secondaryGrey" onClick={handleClose} disabled={saving}>
            {t('obx.notificationRelease.createDrawer.cancel')}
          </Button>
          <Button variant="primary" color="primary" onClick={handleSave} disabled={saving}>
            {isEditMode
              ? t('obx.notificationRelease.createDrawer.save', { defaultValue: 'Save' })
              : t('obx.notificationRelease.createDrawer.create')}
          </Button>
        </Box>
      </Box>
    </SideDrawer>
  );
};

CreateNotificationDrawer.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  notification: PropTypes.object,
  onSuccess: PropTypes.func,
};

export default CreateNotificationDrawer;
