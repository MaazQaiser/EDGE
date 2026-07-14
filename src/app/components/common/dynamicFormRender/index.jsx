import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { Box, Tooltip, Typography } from '@mui/material';
import classNames from 'classnames';
import AIDescriptionCompare from 'commonComponents/dynamicFormRender/aiDescriptionCompare';
import {
  getAiSuggestedAnswers,
  isAiTextCompareResponseType,
  shouldMountAIDescriptionCompare,
} from 'commonComponents/dynamicFormRender/descriptionAICompareUtils';
import DynamicCustomRadioButtons from 'commonComponents/dynamicFormRender/dynamicCustomRadioButtons';
import DynamicDateOrTimePicker from 'commonComponents/dynamicFormRender/dynamicDateOrTimePicker';
import DynamicDateTimePicker from 'commonComponents/dynamicFormRender/dynamicDateTimePicker';
import DynamicImageUploader from 'commonComponents/dynamicFormRender/dynamicImageUploader';
import DynamicInput from 'commonComponents/dynamicFormRender/dynamicInput';
import DynamicMultiOptionsSelector from 'commonComponents/dynamicFormRender/dynamicMultiOptionsSelector';
import DynamicWebCamImage from 'commonComponents/dynamicFormRender/dynamicWebCamImage';
import PropTypes from 'prop-types';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import RequiredAsterik from 'src/app/components/common/requiredAsterik';
import { enumResponseType, supportedImageFormats, videoFileFormats } from 'src/utils/constants';

import SignaturePad from '../signaturePad';
import DynamicDropdown from './dynamicDropdown';
import { useStyles } from './dynamicTemplate.style';

const PreviewTemplateSection = ({ title, text, children, required, showAiModifiedPill }) => {
  const classes = useStyles();
  const { t } = useTranslation();
  return (
    <Box className={classes.previewTemplateQuestion}>
      {showAiModifiedPill ? (
        <Box className={classes.previewTemplateTitleAndPill}>
          <Typography variant="h4" className={classes.previewTemplateQuestionTitleCluster}>
            {title}
            {required && <RequiredAsterik />}
          </Typography>
          <Tooltip arrow placement="top" title={t('obx.shiftReports.descriptionAI.aiModifiedPill')}>
            <Box
              className={`${classes.previewTemplateAiSparkleWrap} ${classes.previewTemplateAiSparkleTooltipTrigger}`}
              component="span"
              data-testid="description-ai-modified-pill"
              aria-label={t('obx.shiftReports.descriptionAI.aiModifiedPill')}
            >
              <AutoAwesomeIcon fontSize="small" />
            </Box>
          </Tooltip>
        </Box>
      ) : (
        <Typography variant="h4" className={classes.previewTemplateQuestionTitle}>
          {title}
          {required && <RequiredAsterik />}
        </Typography>
      )}
      {text && (
        <Typography variant="subtitle2" className={classes.previewTemplateQuestionText}>
          {text}
        </Typography>
      )}
      {children}
    </Box>
  );
};

PreviewTemplateSection.propTypes = {
  title: PropTypes.string,
  text: PropTypes.string,
  children: PropTypes.node,
  required: PropTypes.bool,
  showAiModifiedPill: PropTypes.bool,
};

const getChildComponet = (
  fieldsAttribute,
  classes,
  handleChange,
  effectiveAnswers,
  errorMessages,
  fieldName,
  removeError,
  setErrorMessages,
  fieldValues,
  inferenceKey,
  reportRoot,
) => {
  const { responseType, optionsAttributes = [], id, ...props } = fieldsAttribute;
  const answers = effectiveAnswers;
  const nameField = `${fieldName},${id}`;

  switch (responseType) {
    case enumResponseType.text:
    case enumResponseType.description:
      if (shouldMountAIDescriptionCompare(reportRoot, fieldsAttribute)) {
        return (
          <AIDescriptionCompare
            {...props}
            id={id}
            key={id}
            classes={classes}
            handleChange={handleChange}
            errorMessage={errorMessages[nameField]}
            removeError={removeError}
            nameField={nameField}
            originalTextFlagAnswers={fieldsAttribute.originalTextFlagAnswers}
            aIModifiedAnswers={getAiSuggestedAnswers(fieldsAttribute)}
            isAIModified={fieldsAttribute.isAIModified}
            aiFixCount={fieldsAttribute.aiFixCount}
            answers={fieldsAttribute?.answers}
            effectiveAnswer={
              fieldValues != null && fieldValues?.[id] !== undefined ? fieldValues[id] : undefined
            }
            inferenceKey={inferenceKey}
            multiline={responseType === enumResponseType.description}
            rows={responseType === enumResponseType.description ? 3 : undefined}
          />
        );
      }
      if (responseType === enumResponseType.description) {
        return (
          <DynamicInput
            {...props}
            classes={classes}
            handleChange={handleChange}
            answers={answers}
            id={id}
            key={id}
            errorMessage={errorMessages[nameField]}
            removeError={removeError}
            nameField={nameField}
            multiline={true}
            rows={3}
          />
        );
      }
      return (
        <DynamicInput
          {...props}
          classes={classes}
          handleChange={handleChange}
          answers={answers}
          type={'text'}
          id={id}
          key={id}
          errorMessage={errorMessages[nameField]}
          removeError={removeError}
          nameField={nameField}
        />
      );
    case enumResponseType.number:
      return (
        <DynamicInput
          {...props}
          classes={classes}
          handleChange={handleChange}
          answers={answers}
          type={'number'}
          id={id}
          key={id}
          errorMessage={errorMessages[nameField]}
          removeError={removeError}
          nameField={nameField}
        />
      );
    case enumResponseType.multiselect:
      return (
        <DynamicMultiOptionsSelector
          options={optionsAttributes}
          classes={classes}
          handleChange={handleChange}
          answers={answers}
          id={id}
          key={id}
          errorMessage={errorMessages[nameField]}
          removeError={removeError}
          nameField={nameField}
        />
      );
    case enumResponseType.datetime:
      return (
        <DynamicDateTimePicker
          {...props}
          classes={classes}
          handleChange={handleChange}
          answers={answers}
          type={'number'}
          id={id}
          key={id}
          errorMessage={errorMessages[nameField]}
          removeError={removeError}
          nameField={nameField}
        />
      );
    case enumResponseType.radio:
      return (
        <Box
          className={classNames(
            classes.previewTemplateOptions,
            props?.fieldDisable && classes.disabledEvent,
          )}
        >
          <DynamicCustomRadioButtons
            {...props}
            classes={classes}
            handleChange={handleChange}
            answers={answers}
            type={'number'}
            id={id}
            key={id}
            options={optionsAttributes}
            errorMessage={errorMessages[nameField]}
            removeError={removeError}
            nameField={nameField}
          />
        </Box>
      );
    case enumResponseType.date:
      return (
        <Box
          className={classNames(
            classes.previewTemplatePicker,
            props?.fieldDisable && classes.disabledEvent,
          )}
        >
          <DynamicDateOrTimePicker
            {...props}
            classes={classes}
            handleChange={handleChange}
            answers={answers}
            type={'date'}
            id={id}
            key={id}
            errorMessage={errorMessages[nameField]}
            removeError={removeError}
            nameField={nameField}
          />
        </Box>
      );
    case enumResponseType.time:
      return (
        <Box
          className={classNames(
            classes.previewTemplatePicker,
            props?.fieldDisable && classes.disabledEvent,
          )}
        >
          <DynamicDateOrTimePicker
            {...props}
            classes={classes}
            handleChange={handleChange}
            answers={answers}
            id={id}
            key={id}
            errorMessage={errorMessages[nameField]}
            removeError={removeError}
            nameField={nameField}
          />
        </Box>
      );

    case enumResponseType.imageVideo:
      return (
        <DynamicImageUploader
          {...props}
          classes={classes}
          handleChange={handleChange}
          answers={fieldsAttribute?.answers}
          id={id}
          key={id}
          errorMessages={errorMessages}
          removeError={removeError}
          nameField={nameField}
          setErrorMessages={setErrorMessages}
          supportedTypes={[...supportedImageFormats, ...videoFileFormats]}
          allowedExtensions={['.png', '.jpg', '.jpeg', '.mp4', '.avi', '.mov']}
          supportedTypesText="(max. 15mbs)"
        />
      );

    case enumResponseType.attachments:
      return (
        <DynamicImageUploader
          {...props}
          classes={classes}
          handleChange={handleChange}
          answers={fieldsAttribute?.answers}
          id={id}
          key={id}
          errorMessages={errorMessages}
          removeError={removeError}
          nameField={nameField}
          setErrorMessages={setErrorMessages}
          supportedTypes={['application/pdf']}
          allowedExtensions={['.pdf']}
          supportedTypesText="(max. 15mbs)"
        />
      );

    case enumResponseType.webCam:
      return (
        <DynamicWebCamImage
          {...props}
          classes={classes}
          handleChange={handleChange}
          answers={answers}
          id={id}
          key={id}
          errorMessage={errorMessages[nameField]}
          removeError={removeError}
          nameField={nameField}
          multi={false}
        />
      );

    case enumResponseType.phone:
      return (
        <DynamicInput
          {...props}
          classes={classes}
          handleChange={handleChange}
          answers={answers}
          type={'number'}
          id={id}
          key={id}
          errorMessage={errorMessages[nameField]}
          removeError={removeError}
          nameField={nameField}
        />
      );

    case enumResponseType.signature:
      return (
        <SignaturePad
          {...props}
          id={id}
          key={id}
          nameField={nameField}
          handleChange={handleChange}
          errorMessage={errorMessages[nameField]}
        />
      );

    case enumResponseType.dropdown:
      return (
        <DynamicDropdown
          {...props}
          classes={classes}
          handleChange={handleChange}
          answers={answers}
          id={id}
          key={id}
          errorMessage={errorMessages[nameField]}
          removeError={removeError}
          nameField={nameField}
          options={optionsAttributes}
        />
      );

    default:
      return (
        <DynamicInput
          {...props}
          classes={classes}
          handleChange={handleChange}
          answers={answers}
          type={'text'}
          id={id}
          key={id}
          errorMessage={errorMessages[nameField]}
          removeError={removeError}
          nameField={nameField}
        />
      );
  }
};

const getDisplayAnswer = (fieldValues, id, fallback) => {
  if (fieldValues == null) return fallback;
  if (Object.prototype.hasOwnProperty.call(fieldValues, id)) {
    return fieldValues[id];
  }
  return fallback;
};

const RenderFieldAttributes = ({
  fieldsAttribute = {},
  classes,
  handleChange,
  errorMessages,
  fieldName,
  removeError,
  setErrorMessages,
  fieldValues,
  inferenceKey,
  reportRoot,
}) => {
  const id = fieldsAttribute?.id;
  const displayAnswer = getDisplayAnswer(fieldValues, id, fieldsAttribute?.answers);
  const showAiModifiedPill =
    isAiTextCompareResponseType(fieldsAttribute?.responseType) &&
    fieldsAttribute?.isAIModified === true;
  return (
    <PreviewTemplateSection
      title={fieldsAttribute?.questionStatement}
      text={fieldsAttribute?.instruction}
      key={id}
      required={fieldsAttribute?.required}
      showAiModifiedPill={showAiModifiedPill}
    >
      {getChildComponet(
        fieldsAttribute,
        classes,
        handleChange,
        displayAnswer,
        errorMessages,
        fieldName,
        removeError,
        setErrorMessages,
        fieldValues,
        inferenceKey,
        reportRoot,
      )}
    </PreviewTemplateSection>
  );
};

RenderFieldAttributes.propTypes = {
  handleChange: PropTypes.func.isRequired,
  fieldsAttribute: PropTypes.object,
  removeError: PropTypes.func,
  errorMessages: PropTypes.object,
  classes: PropTypes.object,
  fieldName: PropTypes.string,
  nameField: PropTypes.string,
  setErrorMessages: PropTypes.func,
  fieldValues: PropTypes.object,
  inferenceKey: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  reportRoot: PropTypes.object,
};

const RenderSectionPreview = ({
  section = {},
  classes,
  handleChange,
  errorMessages,
  fieldName,
  removeError,
  setErrorMessages,
  fieldValues,
  inferenceKey,
  reportRoot,
}) => {
  const { title, description, questionsAttributes = [], id } = section;

  return (
    <React.Fragment key={id}>
      <Box className={classes.previewTemplateSection}>
        <Typography variant="h3" className={classes.previewTemplateSectionTitle}>
          {title}
        </Typography>
        {description && (
          <Typography variant="subtitle2" className={classes.previewTemplateSectionText}>
            {description}
          </Typography>
        )}
      </Box>
      {questionsAttributes.map((fieldsAttribute, i) => (
        <RenderFieldAttributes
          key={i}
          fieldsAttribute={fieldsAttribute}
          classes={classes}
          handleChange={handleChange}
          errorMessages={errorMessages}
          fieldName={fieldName}
          removeError={removeError}
          setErrorMessages={setErrorMessages}
          fieldValues={fieldValues}
          inferenceKey={inferenceKey}
          reportRoot={reportRoot}
        />
      ))}
    </React.Fragment>
  );
};

const DynamicTemplateRender = ({
  template = {},
  handleChange,
  errorMessages,
  fieldName,
  removeError,
  setErrorMessages,
  styleClass,
  fieldValues,
  inferenceKey,
}) => {
  const { sectionsAttributes = [] } = template;

  const classes = useStyles();

  const sectionAttributes = useMemo(() => {
    return sectionsAttributes?.map((section, i) => (
      <RenderSectionPreview
        key={i}
        section={section}
        classes={classes}
        handleChange={handleChange}
        errorMessages={errorMessages}
        fieldName={fieldName}
        removeError={removeError}
        setErrorMessages={setErrorMessages}
        fieldValues={fieldValues}
        inferenceKey={inferenceKey}
        reportRoot={template}
      />
    ));
  }, [
    sectionsAttributes,
    template,
    errorMessages,
    fieldValues,
    inferenceKey,
    handleChange,
    fieldName,
    removeError,
    setErrorMessages,
  ]);

  RenderSectionPreview.propTypes = {
    handleChange: PropTypes.func.isRequired,
    removeError: PropTypes.func,
    errorMessage: PropTypes.object,
    classes: PropTypes.object,
    fieldName: PropTypes.string,
    id: PropTypes.number,
    section: PropTypes.object,
    errorMessages: PropTypes.object,
    setErrorMessages: PropTypes.func,
    fieldValues: PropTypes.object,
    inferenceKey: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    reportRoot: PropTypes.object,
  };

  return (
    <Box className={`${classes.previewTemplate} ${styleClass}`}>
      <Box className={classes.previewTemplateContent}>{sectionAttributes}</Box>
    </Box>
  );
};

DynamicTemplateRender.propTypes = {
  template: PropTypes.object,
  handleChange: PropTypes.func,
  errorMessages: PropTypes.object,
  removeError: PropTypes.func,
  fieldName: PropTypes.string,
  setErrorMessages: PropTypes.func,
  styleClass: PropTypes.string,
  fieldValues: PropTypes.object,
  inferenceKey: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};
export default DynamicTemplateRender;
