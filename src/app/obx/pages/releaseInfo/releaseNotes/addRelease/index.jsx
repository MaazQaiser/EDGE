import { Box, Button, IconButton, TextField, Typography } from '@mui/material';
import dayjs from 'dayjs';
import { EditorState } from 'draft-js';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import { useLocation } from 'react-router-dom/cjs/react-router-dom.min';
import ResponsiveDatePickers from 'src/app/components/common/datePicker';
import RequiredAsterik from 'src/app/components/common/requiredAsterik';
import RichTextEditor, {
  convertDataToHtml,
  convertToDraft,
} from 'src/app/components/common/richText';
import { OBX_RELEASE } from 'src/app/router/constant/ROUTE';
import { ReactComponent as ArrowBackIcon } from 'src/assets/svg/ArrowLeftBack.svg?react';
import {
  createRelease,
  getReleaseNotesById,
  updateReleaseNotes,
} from 'src/services/releaseConfigurations.service';
import { RELEASE_TABS, toastSettings } from 'src/utils/constants';
import { edgeOptions } from 'src/utils/constants';
import { joiValidateErrors } from 'src/utils/formValidator/formValidator.requiredCheck';
import { toaster } from 'src/utils/toast';

import AddReleaseSkeleton from './addReleaseSkeleton';
import { useStyles } from './styles';

const currentYear = new Date().getFullYear();

const AddRelease = () => {
  const { t } = useTranslation();
  const classes = useStyles();
  const history = useHistory();
  const { search } = useLocation();
  const { editReleaseId, isEditMode, selectedYear } = useMemo(() => {
    const params = new URLSearchParams(search);
    return {
      editReleaseId: params.get('id'),
      selectedYear: params.get('year'),
      isEditMode: params.get('isEdit') === 'true',
    };
  }, [search]);
  const [releaseVersion, setReleaseVersion] = useState('');
  const [publishDate, setPublishDate] = useState(null);
  const [errors, setErrors] = useState({
    releaseVersion: null,
    publishDate: null,
  });
  const [descriptionEditor, setDescriptionEditor] = useState(EditorState.createEmpty());
  const [loading, setLoading] = useState(isEditMode);

  const handleBack = useCallback(() => {
    const yearParam = selectedYear ? `&year=${selectedYear}` : '';
    history.push(`${OBX_RELEASE}?tab=${RELEASE_TABS.RELEASE_NOTES}${yearParam}`);
  }, [history, selectedYear]);

  const handleReleaseVersionChange = (event) => {
    setReleaseVersion(event.target.value);
    if (!event.target.value) {
      setErrors((prev) => ({
        ...prev,
        releaseVersion: t('obx.release.addRelease.releaseVersionRequired'),
      }));
    } else {
      setErrors((prev) => ({ ...prev, releaseVersion: null }));
    }
  };

  const handlePublishDateChange = (value) => {
    setPublishDate(value);
    if (!value) {
      setErrors((prev) => ({
        ...prev,
        publishDate: t('obx.release.addRelease.publishDateRequired'),
      }));
    } else {
      setErrors((prev) => ({ ...prev, publishDate: null }));
    }
  };
  const createPayload = (status) => ({
    version: releaseVersion,
    intent: edgeOptions[0].value,
    year: publishDate ? dayjs.utc(publishDate).year() : currentYear,
    publishDate: publishDate ? dayjs.utc(publishDate).toISOString() : '',
    description: convertDataToHtml(descriptionEditor),
    status,
  });

  const fetchReleaseById = useCallback(async () => {
    if (!editReleaseId) return;
    setLoading(true);
    try {
      const response = await getReleaseNotesById(editReleaseId);
      if (response?.statusCode === 200 && response?.data) {
        const release = response?.data?.release ?? response?.data;
        setReleaseVersion(release?.version || '');
        setPublishDate(release?.publishDate ? dayjs(release.publishDate) : null);
        setDescriptionEditor(convertToDraft(release?.description || ''));
      }
    } catch (error) {
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    } finally {
      setLoading(false);
    }
  }, [editReleaseId]);

  useEffect(() => {
    if (!isEditMode) return;
    fetchReleaseById();
  }, [isEditMode, fetchReleaseById]);

  if (isEditMode && loading) {
    return <AddReleaseSkeleton classes={classes} />;
  }

  const handleSave = async (status, successKey, errorKey) => {
    const validationData = {
      releaseVersion: releaseVersion,
      publishDate: publishDate ? dayjs(publishDate).format('YYYY/MM/DD') : '',
    };
    const errors = await joiValidateErrors({ data: validationData, t, field: {} });
    if (errors && Object.keys(errors).length) {
      setErrors(errors);
      return;
    }
    const payload = createPayload(status);

    try {
      setLoading(true);
      const response = isEditMode
        ? await updateReleaseNotes(editReleaseId, { release: payload })
        : await createRelease({ release: payload });
      if (response?.statusCode === 200) {
        toaster.success({
          text: response?.message || t(successKey),
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
        const year = payload.year || currentYear;
        history.replace(`${OBX_RELEASE}?tab=${RELEASE_TABS.RELEASE_NOTES}&year=${year}`);
      }
    } catch (error) {
      toaster.error({
        text: error?.message || t(errorKey),
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className={classes.addReleaseContainer}>
      <Box className={classes.headerSection}>
        <Box className={classes.headerLeft}>
          <IconButton onClick={handleBack} className={classes.backButton}>
            <ArrowBackIcon />
          </IconButton>
          {isEditMode ? (
            <Typography variant="h4" className={classes.headerTitle}>
              {t('obx.release.addRelease.editTitle')}
            </Typography>
          ) : (
            <Typography variant="h4" className={classes.headerTitle}>
              {t('obx.release.addRelease.title')}
            </Typography>
          )}
        </Box>
        <Box className={classes.headerRight}>
          <Button
            variant="tertiaryGrey"
            onClick={handleBack}
            disabled={loading}
            className={classes.cancelButton}
          >
            {t('obx.release.addRelease.cancel')}
          </Button>
          <Button
            variant="primary"
            onClick={() =>
              handleSave(
                'published',
                'obx.release.addRelease.published',
                'obx.release.addRelease.errorPublishing',
              )
            }
            disabled={loading}
            className={classes.savePublishButton}
          >
            {isEditMode
              ? t('obx.release.addRelease.save')
              : t('obx.release.addRelease.savePublish')}
          </Button>
        </Box>
      </Box>
      <Box className={classes.contentSection}>
        <Box className={classes.formSection}>
          <Box className={classes.formField}>
            <Typography variant="body2" className={classes.inputLabel}>
              {t('obx.release.addRelease.releaseVersion')} <RequiredAsterik />
            </Typography>
            <TextField
              value={releaseVersion}
              onChange={handleReleaseVersionChange}
              name="releaseVersion"
              className={classes.textInput}
              placeholder={t('obx.release.addRelease.releaseVersionPlaceholder')}
              error={!!errors.releaseVersion}
              helperText={errors.releaseVersion || ''}
              required
            />
          </Box>
          <Box className={classes.formField}>
            <Typography variant="body2" className={classes.inputLabel}>
              {t('obx.release.addRelease.publishDate')} <RequiredAsterik />
            </Typography>
            <ResponsiveDatePickers
              value={publishDate}
              onChange={handlePublishDateChange}
              format="YYYY/MM/DD"
              inputFormat="YYYY/MM/DD"
              placeholder="YYYY/MM/DD"
              className={classes.datePicker}
              error={!!errors.publishDate}
              helperText={errors.publishDate || ''}
              required
            />
          </Box>
        </Box>
        <Box className={classes.formField}>
          <Typography variant="body2" className={classes.inputLabel}>
            {t('obx.release.addRelease.description')}
          </Typography>
          <RichTextEditor
            value={descriptionEditor}
            handleChange={(e) => {
              const editorState = e.target.value;
              if (editorState instanceof EditorState) {
                setDescriptionEditor(editorState);
              }
            }}
            placeholder={t('obx.release.configure.addInformation')}
            className={classes.richTextEditor}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default AddRelease;
