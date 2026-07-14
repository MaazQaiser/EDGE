import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import { Box, Button, Typography } from '@mui/material';
import { hasDescriptionAIPair } from 'commonComponents/dynamicFormRender/descriptionAICompareUtils';
import { useDescriptionAI } from 'commonComponents/dynamicFormRender/descriptionAIContext';
import DynamicInput from 'commonComponents/dynamicFormRender/dynamicInput';
import DOMPurify from 'dompurify';
import PropTypes from 'prop-types';
import React, { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useStyles } from './aiDescriptionCompare.styles';

const AIDescriptionCompare = ({
  id,
  fieldDisable,
  classes: themeClasses,
  handleChange,
  errorMessage,
  nameField,
  removeError,
  originalTextFlagAnswers: originalText = '',
  aIModifiedAnswers: suggestedText = '',
  isAIModified: _isAIModifiedFromApi,
  aiFixCount,
  answers: templateAnswers = '',
  effectiveAnswer,
  inferenceKey,
  ...inputRest
}) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const { setSelection } = useDescriptionAI();

  const qForPair = { originalTextFlagAnswers: originalText, aIModifiedAnswers: suggestedText };
  const hasPair = hasDescriptionAIPair(qForPair);

  const fixesCountDisplay = useMemo(() => {
    const n = Number(aiFixCount);
    if (!Number.isFinite(n) || n <= 0) return null;
    return Math.floor(n);
  }, [aiFixCount]);

  /** Side-by-side compare + flagged “current” HTML only when there is at least one fix. */
  const showSplitCompare = hasPair && fixesCountDisplay != null;

  const [view, setView] = useState('split');
  const [choice, setChoice] = useState('split');
  const sanitizedOriginalHtml = useMemo(
    () => DOMPurify.sanitize(String(originalText ?? '')),
    [originalText],
  );

  useLayoutEffect(() => {
    if (!showSplitCompare) {
      setView('editing');
      return;
    }
    setView('split');
    setChoice('split');
  }, [showSplitCompare, id, inferenceKey]);

  useEffect(() => {
    if (!showSplitCompare) return;
    if (view === 'editing' && choice === 'suggested') setSelection(id, 'suggested');
    else if (view === 'editing' && choice === 'current') setSelection(id, 'current');
    else setSelection(id, 'split');
  }, [view, choice, showSplitCompare, id, setSelection]);

  if (!showSplitCompare) {
    return (
      <DynamicInput
        {...inputRest}
        id={id}
        classes={themeClasses}
        handleChange={handleChange}
        answers={
          effectiveAnswer !== undefined && effectiveAnswer !== null
            ? effectiveAnswer
            : templateAnswers
        }
        errorMessage={errorMessage}
        removeError={removeError}
        nameField={nameField}
        fieldDisable={fieldDisable}
        multiline
        rows={3}
      />
    );
  }

  const selectCurrent = () => {
    setChoice('current');
    setView('editing');
    handleChange({ target: { name: id, value: String(templateAnswers ?? '') } });
  };

  const selectSuggested = () => {
    setChoice('suggested');
    setView('editing');
    handleChange({ target: { name: id, value: String(suggestedText ?? '') } });
  };

  const onReselect = () => {
    setChoice('split');
    setView('split');
  };

  const inputAnswer =
    effectiveAnswer !== undefined && effectiveAnswer !== null
      ? effectiveAnswer
      : choice === 'suggested'
        ? String(suggestedText ?? '')
        : String(templateAnswers ?? '');

  return (
    <Box>
      {view === 'split' && (
        <Box className={classes.splitRow}>
          <Box
            className={classes.splitCard}
            onClick={fieldDisable ? undefined : selectCurrent}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                if (!fieldDisable) selectCurrent();
              }
            }}
          >
            <Box className={classes.splitCardHeaderCurrent}>
              <Box className={classes.splitCardHeaderLeft}>
                <ArticleOutlinedIcon
                  className={classes.headerIcon}
                  color="error"
                  fontSize="small"
                />
                <Typography className={classes.currentTitle} variant="subtitle2">
                  {t('obx.shiftReports.descriptionAI.currentVersion')}
                </Typography>
              </Box>
              {fixesCountDisplay != null && (
                <Box className={classes.fixesPill} component="span">
                  {t('obx.shiftReports.descriptionAI.fixesCount', { count: fixesCountDisplay })}
                </Box>
              )}
            </Box>
            <Box className={classes.splitCardBody}>
              <Box
                className={classes.textBlock}
                dangerouslySetInnerHTML={{ __html: sanitizedOriginalHtml }}
              />
            </Box>
          </Box>
          <Box
            className={classes.splitCard}
            onClick={fieldDisable ? undefined : selectSuggested}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                if (!fieldDisable) selectSuggested();
              }
            }}
          >
            <Box className={classes.splitCardHeaderSuggested}>
              <Box className={classes.splitCardHeaderLeft}>
                <AutoAwesomeIcon className={classes.headerIcon} color="success" fontSize="small" />
                <Typography className={classes.suggestedTitle} variant="subtitle2">
                  {t('obx.shiftReports.descriptionAI.suggestedVersion')}
                </Typography>
              </Box>
              <Box className={classes.aiPill} component="span">
                <AutoAwesomeIcon fontSize="inherit" />
                {t('obx.shiftReports.descriptionAI.aiBadge')}
              </Box>
            </Box>
            <Box className={classes.splitCardBody}>
              <Typography className={classes.textBlock} variant="body2">
                {String(suggestedText ?? '')}
              </Typography>
            </Box>
          </Box>
        </Box>
      )}

      {view === 'editing' && (
        <Box>
          <Box className={classes.editingHeader}>
            <Button
              className={classes.reselectBtn}
              variant="onlyText"
              disableRipple
              startIcon={<RefreshOutlinedIcon />}
              onClick={onReselect}
              disabled={!!fieldDisable}
            >
              {t('obx.shiftReports.descriptionAI.reselect')}
            </Button>
          </Box>
          <DynamicInput
            {...inputRest}
            key={`${id}-${choice}`}
            id={id}
            classes={themeClasses}
            handleChange={handleChange}
            answers={inputAnswer}
            errorMessage={errorMessage}
            removeError={removeError}
            nameField={nameField}
            fieldDisable={fieldDisable}
            multiline
            rows={3}
          />
        </Box>
      )}
    </Box>
  );
};

AIDescriptionCompare.propTypes = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  fieldDisable: PropTypes.bool,
  classes: PropTypes.object,
  handleChange: PropTypes.func.isRequired,
  errorMessage: PropTypes.string,
  nameField: PropTypes.string,
  removeError: PropTypes.func,
  originalTextFlagAnswers: PropTypes.string,
  aIModifiedAnswers: PropTypes.string,
  isAIModified: PropTypes.bool,
  aiFixCount: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  answers: PropTypes.string,
  effectiveAnswer: PropTypes.string,
  inferenceKey: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

export default AIDescriptionCompare;
