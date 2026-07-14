import { Box, Button, IconButton, TextField, Typography } from '@mui/material';
import { EditorState } from 'draft-js';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import { useLocation } from 'react-router-dom/cjs/react-router-dom.min';
import CustomDropDown from 'src/app/components/common/customDropDown';
import RichTextEditor, {
  convertDataToHtml,
  convertToDraft,
} from 'src/app/components/common/richText';
import { OBX_RELEASE } from 'src/app/router/constant/ROUTE';
import { ReactComponent as ArrowBackIcon } from 'src/assets/svg/ArrowLeftBack.svg?react';
import useFormHook from 'src/hooks/useFormHook';
import {
  createQuarter,
  createRoadmap,
  getRoadmapByQuarterId,
  getRoadmaps,
  updateQuarterById,
} from 'src/services/releaseConfigurations.service';
import {
  PLATFORM_INTENT,
  quarterOptions,
  ROADMAP_STATUS_ENUM,
  ROADMAP_STATUS_OPTIONS,
  toastSettings,
  yearOptions,
} from 'src/utils/constants';
import { toaster } from 'src/utils/toast';

import ConfigureSkeleton from './configureSkeleton';
import { useStyles } from './styles';

const currentYear = new Date().getFullYear();

const initialFormData = {
  year: currentYear,
  intent: PLATFORM_INTENT.EDGE,
  quarterAttributes: [
    {
      period: quarterOptions[0].value,
      status: ROADMAP_STATUS_ENUM.PLANNED,
      featureCount: 0,
      fixedCount: 0,
      improvementsCount: 0,
      featuresContent: EditorState.createEmpty(),
      fixesContent: EditorState.createEmpty(),
      improvementsContent: EditorState.createEmpty(),
    },
  ],
};

const Configure = () => {
  const { t } = useTranslation();
  const classes = useStyles();
  const history = useHistory();
  const { search } = useLocation();
  const [isRoadmapLoading, setIsRoadmapLoading] = useState(false);
  const isInitialMount = useRef(true);

  const { roadmapId, quarterId, year, quarterPeriod, isEditMode } = useMemo(() => {
    const params = new URLSearchParams(search);
    const rid = params.get('roadmapId');
    const qid = params.get('quarterId');
    const isEdit = params.get('isEdit');
    return {
      roadmapId: rid,
      quarterId: qid,
      year: params.get('year'),
      quarterPeriod: params.get('quarter'),
      isEditMode: isEdit === 'true',
    };
  }, [search]);

  const [loading, setLoading] = useState(isEditMode);

  const { formData, setFormData, updateFormHandler } = useFormHook({
    defaultFormData: initialFormData,
  });

  const quarter = formData.quarterAttributes?.[0];

  useEffect(() => {
    if (year || quarterId) {
      const quarterPeriod = quarterOptions.find((q) => q.id === +quarterId)?.value;
      setFormData((prev) => ({
        ...prev,
        ...(year && { year: Number(year) }),
        ...(quarterId && {
          quarterAttributes: [
            {
              ...prev.quarterAttributes?.[0],
              period: quarterPeriod,
            },
          ],
        }),
      }));
    }
  }, [year, quarterPeriod, setFormData]);

  const refetchRoadmap = useCallback(
    async (selectedYear) => {
      // Early return if year is not passed
      if (!selectedYear) return;

      setIsRoadmapLoading(true);

      const searchParams = new URLSearchParams(window.location.search);

      try {
        const response = await getRoadmaps({
          year: selectedYear,
          intent: PLATFORM_INTENT.EDGE,
        });

        const roadmap =
          response?.data?.roadmaps?.find((r) => r.year === selectedYear) ||
          response?.data?.roadmaps?.[0];

        if (roadmap?.id) {
          searchParams.set('roadmapId', roadmap.id);
        } else {
          searchParams.delete('roadmapId');
        }
      } catch (error) {
        searchParams.delete('roadmapId');
      } finally {
        searchParams.set('year', selectedYear);
        history.replace({ search: searchParams.toString() });
        setIsRoadmapLoading(false);
      }
    },
    [history],
  );

  useEffect(() => {
    if (isEditMode) return;

    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    refetchRoadmap();
  }, [formData.year, isEditMode, refetchRoadmap]);

  const fetchQuarterData = async () => {
    setLoading(true);

    const getContent = (field) => {
      return field ? convertToDraft(field) : EditorState.createEmpty();
    };

    try {
      const response = await getRoadmapByQuarterId(roadmapId, quarterId);
      if (response?.statusCode === 200 && response?.data) {
        const qd = response.data?.quarter ?? {};
        setFormData({
          year: qd.year || initialFormData.year,
          intent: qd.intent || initialFormData.intent,
          quarterAttributes: [
            {
              period: qd.period || quarterOptions[0].value,
              status: qd.status || ROADMAP_STATUS_ENUM.PLANNED,
              featureCount: qd.featuresCount || qd.featureCount || 0,
              fixedCount: qd.fixesCount || qd.fixedCount || 0,
              improvementsCount: qd.improvementsCount || qd.improvementCount || 0,
              featuresContent: getContent(qd.featuresContent),
              fixesContent: getContent(qd.fixesContent),
              improvementsContent: getContent(qd.improvementsContent),
            },
          ],
        });
      }
    } catch (error) {
      console.error('Error fetching roadmap quarter data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isEditMode) return;
    fetchQuarterData();
  }, [isEditMode, roadmapId, quarterId, setFormData]);

  const handleBack = useCallback(() => {
    history.push({
      pathname: OBX_RELEASE,
      search: `?year=${year}`,
    });
  }, [history]);

  const updateQuarter = useCallback(
    (key, value) => {
      setFormData((prev) => ({
        ...prev,
        quarterAttributes: [
          {
            ...prev.quarterAttributes?.[0],
            [key]: value,
          },
        ],
      }));
    },
    [setFormData],
  );

  const handleSave = async () => {
    const quarterPayload = {
      period: quarter.period,
      status: quarter.status,
      improvementsCount: Number(quarter.improvementsCount),
      featuresContent: convertDataToHtml(quarter.featuresContent),
      fixesContent: convertDataToHtml(quarter.fixesContent),
      improvementsContent: convertDataToHtml(quarter.improvementsContent),
      featuresCount: Number(quarter.featureCount),
      fixesCount: Number(quarter.fixedCount),
    };

    try {
      setLoading(true);
      let response;

      // Upadting the quarter if roadmap is already created
      if (isEditMode) {
        response = await updateQuarterById(roadmapId, quarterId, { quarter: quarterPayload });
      }

      // Creating the roadmap if it is not created
      else if (!roadmapId) {
        const payload = {
          roadmap: {
            year: formData.year,
            intent: formData.intent,
            quartersAttributes: [
              {
                ...quarterPayload,
              },
            ],
          },
        };
        response = await createRoadmap(payload);
      }

      // Creating the quarter if roadmap is not created
      else {
        response = await createQuarter(roadmapId, { quarter: quarterPayload });
      }

      if (response?.statusCode === 200) {
        toaster.success({
          text: response?.message,
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });

        // Redirecting to the release page
        const searchParams = [];
        if (year) searchParams.push(`year=${year}`);
        const searchParamsString = searchParams.join('&');

        history.push({
          pathname: OBX_RELEASE,
          search: `?${searchParamsString}`,
        });
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
  };

  if (loading) {
    return <ConfigureSkeleton isEditMode={isEditMode} />;
  }
  console.log({
    formData,
    filtered: ROADMAP_STATUS_OPTIONS.filter(
      (status) => status.value === formData?.quarterAttributes[0]?.status,
    ),
  });

  return (
    <Box className={classes.configureContainer}>
      <Box className={classes.headerSection}>
        <Box className={classes.headerLeft}>
          <Box className={classes.headerLeftTitle}>
            <IconButton onClick={handleBack} className={classes.backButton}>
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h4" className={classes.headerTitle}>
              {t('obx.release.configure.title')}
            </Typography>
          </Box>

          <Box className={classes.headerDropdowns}>
            {!isEditMode && (
              <>
                <CustomDropDown
                  name="year"
                  options={yearOptions}
                  selectedValues={yearOptions.find((y) => y.value === formData.year)}
                  handleChange={(e) => {
                    const selectedYear = e?.target?.value?.value;
                    if (selectedYear) {
                      updateFormHandler('year', selectedYear);
                      refetchRoadmap(selectedYear);
                    }
                  }}
                  bordered
                  className={classes.headerDropdown}
                />
                <CustomDropDown
                  name="quarter"
                  options={quarterOptions}
                  selectedValues={quarterOptions.find((q) => q.value === quarter.period)}
                  handleChange={(e) => {
                    if (e?.target?.value?.value) updateQuarter('period', e.target.value?.value);
                  }}
                  bordered
                  className={classes.headerDropdown}
                />
              </>
            )}
            <CustomDropDown
              name="status"
              options={ROADMAP_STATUS_OPTIONS}
              selectedValues={ROADMAP_STATUS_OPTIONS.find(
                (status) => status.value === formData?.quarterAttributes[0]?.status,
              )}
              handleChange={(e) => {
                const value = e?.target?.value?.value;
                if (value) updateQuarter('status', value);
              }}
              bordered
              className={classes.headerDropdown}
            />
          </Box>
        </Box>
        <Box className={classes.headerRight}>
          <Button
            variant="tertiaryGrey"
            onClick={handleBack}
            disabled={loading || isRoadmapLoading}
            className={classes.cancelButton}
          >
            {t('obx.release.configure.cancel')}
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={loading || isRoadmapLoading}
            className={classes.saveButton}
          >
            {t('obx.release.configure.save')}
          </Button>
        </Box>
      </Box>

      <Box className={classes.contentSection}>
        <Box className={classes.numericInputsRow}>
          {['featureCount', 'fixedCount', 'improvementsCount'].map((field) => (
            <Box key={field} className={classes.numericInput}>
              <Typography variant="body2" className={classes.inputLabel}>
                {t(`obx.release.roadmap.details.${field}`)}
              </Typography>
              <TextField
                type="number"
                value={quarter[field]}
                onChange={(e) => updateQuarter(field, e.target.value)}
                className={classes.numberInput}
              />
            </Box>
          ))}
        </Box>

        <Box className={classes.editorSection}>
          {[
            { key: 'featuresContent', label: 'features' },
            { key: 'fixesContent', label: 'fixes' },
            { key: 'improvementsContent', label: 'improvements' },
          ].map(({ key, label }) => (
            <Box key={key} className={classes.editorBlock}>
              <Typography variant="body2" className={classes.inputLabel}>
                {t(`obx.release.roadmap.details.${label}`)}
              </Typography>
              <RichTextEditor
                value={quarter[key]}
                handleChange={(e) => {
                  const editorState = e.target.value;
                  if (editorState instanceof EditorState) {
                    updateQuarter(key, editorState);
                  }
                }}
                placeholder={t('obx.release.configure.addInformation')}
                className={classes.richTextEditor}
              />
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default Configure;
