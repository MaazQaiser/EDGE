import { Box, Chip, Divider, Typography } from '@mui/material';
import { ReactComponent as UploadIcon } from 'assets/svg/upload-plus.svg?react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import ResponsiveDatePickers from 'src/app/components/common/datePicker';
import RequiredAsterik from 'src/app/components/common/requiredAsterik';
import SignaturePad from 'src/app/components/common/signaturePad';
import CustomInput from 'src/app/components/common/templates/customInput';
import CustomRadioGroup from 'src/app/components/common/templates/customRadioGroup';
import ResponsiveTimePickers from 'src/app/components/common/timePicker';
import { COMMON_SETTING, HO_TEMPLATE_UPDATE } from 'src/app/router/constant/ROUTE';
import history from 'src/app/router/utils/history';
import { useTenantLabel } from 'src/helper/utilityHooks';
import useBackNavigation from 'src/hooks/useBackNavigation';

import ButtonGroup from '../buttonGroup';
import { useStyles } from './previewTemplate.styles';

const enumResponseType = {
  text: 0,
  number: 1,
  multiselect: 2,
  datetime: 3,
  radio: 4,
  date: 5,
  imageVideo: 6,
  time: 7,
  webCam: 10,
  signature: 13,
};

const PreviewTemplateSection = ({ title, text, children, required }) => {
  const classes = useStyles();
  return (
    <Box className={classes.previewTemplateQuestion}>
      <Typography variant="h4" className={classes.previewTemplateQuestionTitle}>
        {title}
        {required && <RequiredAsterik />}
      </Typography>
      <Typography variant="subtitle2" className={classes.previewTemplateQuestionText}>
        {text}
      </Typography>
      {children}
    </Box>
  );
};

PreviewTemplateSection.propTypes = {
  title: PropTypes.string,
  text: PropTypes.string,
  children: PropTypes.node,
  required: PropTypes.bool,
};
const getChildComponet = ({ responseType, optionsAttributes = [], ...props }) => {
  const classes = useStyles();
  switch (responseType) {
    case enumResponseType.text:
      return (
        <Box className={classNames(classes.previewTemplateField, classes.disabledEvent)}>
          <CustomInput label="" />
        </Box>
      );
    case enumResponseType.number:
      return (
        <Box className={classNames(classes.previewTemplateField, classes.disabledEvent)}>
          <CustomInput label="" />
        </Box>
      );
    case enumResponseType.multiselect:
      return (
        <Box className={classNames(classes.previewTemplateOptions, classes.disabledEvent)}>
          {optionsAttributes.map((option) => (
            <Typography variant="body1" key={option?.id} className={classes.previewTemplateOption}>
              {option.optionText}
            </Typography>
          ))}
        </Box>
      );
    case enumResponseType.datetime:
      return (
        <Box className={classNames(classes.previewTemplateDateTime, classes.disabledEvent)}>
          <ResponsiveDatePickers
            value={null}
            onChange={() => {}}
            format="YYYY-MM-DD"
            inputFormat="YYYY-MM-DD"
          />
          <ResponsiveTimePickers
            value={null}
            onChange={() => {}}
            format="YYYY-MM-DD"
            inputFormat="YYYY-MM-DD"
          />
        </Box>
      );
    case enumResponseType.radio:
      return (
        <Box className={classNames(classes.previewTemplateOptions, classes.disabledEvent)}>
          <CustomRadioGroup options={optionsAttributes} />
        </Box>
      );
    case enumResponseType.date:
      return (
        <Box className={classNames(classes.previewTemplatePicker, classes.disabledEvent)}>
          <ResponsiveDatePickers
            value={null}
            onChange={() => {}}
            format="YYYY-MM-DD"
            inputFormat="YYYY-MM-DD"
          />
        </Box>
      );
    case enumResponseType.time:
      return (
        <Box className={classNames(classes.previewTemplatePicker, classes.disabledEvent)}>
          <ResponsiveTimePickers
            value={null}
            onChange={() => {}}
            format="YYYY-MM-DD"
            inputFormat="YYYY-MM-DD"
          />
        </Box>
      );

    case enumResponseType.imageVideo:
      return (
        <Box className={classNames(classes.previewTemplateUploaded, classes.disabledEvent)}>
          <UploadIcon />
        </Box>
      );

    case enumResponseType.signature:
      return (
        <SignaturePad
          {...props}
          id={props.id}
          key={props.id}
          nameField={props.nameField}
          handleChange={() => {}}
          disabled={true}
        />
      );

    default:
      return (
        <Box className={classNames(classes.previewTemplateField, classes.disabledEvent)}>
          <CustomInput label="" />
        </Box>
      );
  }
};

const renderFieldAttributes = ({ fieldsAttribute = {} }) => {
  const { questionStatement, instruction, responseType, optionsAttributes, required, id } =
    fieldsAttribute;
  return (
    <PreviewTemplateSection
      title={questionStatement}
      text={instruction}
      key={id}
      required={required}
    >
      {getChildComponet({ responseType, optionsAttributes, fieldsAttribute })}
    </PreviewTemplateSection>
  );
};

const renderSectionPreview = ({ section = {} }) => {
  const { title, description, questionsAttributes = [], id } = section;
  const classes = useStyles();
  return (
    <React.Fragment key={id}>
      <Box className={classes.previewTemplateSection}>
        <Typography variant="h3" className={classes.previewTemplateSectionTitle}>
          {title}
        </Typography>
        <Typography variant="subtitle2" className={classes.previewTemplateSectionText}>
          {description}
        </Typography>
      </Box>
      {questionsAttributes.map((fieldsAttribute) => renderFieldAttributes({ fieldsAttribute }))}
    </React.Fragment>
  );
};

const PreviewTemplate = ({ template = {} }) => {
  const { title, description, sectionsAttributes = [], id, templateableType } = template;
  const classes = useStyles();
  const userInfo = useSelector((state) => state.user.info);
  const userRole = useSelector((state) => state.auth.userRole);
  const { navigateBack } = useBackNavigation();

  const { t } = useTranslation();
  const { getLabel } = useTenantLabel();

  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const siteId = searchParams.get('siteId');
  const returnPage = searchParams.get('page');

  const enumTemplateType = {
    equipmentInspection: t('ho.templates.create.report.dropdown.equipmentInspection'),
    vehicleInspection: t('ho.templates.create.report.dropdown.vehicleInspection'),
    tourReports: t('ho.templates.create.report.dropdown.tourReports', {
      tour: getLabel('terms', 'tour', t),
    }),
    shiftDayEndReport: t('ho.templates.create.report.dropdown.shiftDayEndReport'),
    incidentReport: t('ho.templates.create.report.dropdown.incidentReport'),
  };

  const showActionsButton = () => {
    if (userRole?.slug == 'franchise_owner' && template?.createdBy?.id == userInfo.id) {
      return true;
    } else if (userRole.slug == 'home_officer' && template?.createdBy?.role === 'home_officer') {
      return true;
    }
    return false;
  };

  const handleBack = () => {
    navigateBack({ fallbackUrl: `${COMMON_SETTING}?activeTab=reportTemplates` });
  };

  const handleEdit = () => {
    const urlParams = new URLSearchParams(location.search);
    const existingParams = urlParams.toString();

    if (searchParams.get('page') === 'settings') {
      history.push(`${HO_TEMPLATE_UPDATE}/${template?.id}${location.search}`);
      return;
    }

    if (returnPage === 'site') {
      history.push(
        `${HO_TEMPLATE_UPDATE}/${template?.id}?siteId=${siteId}&page=site${existingParams ? `&${existingParams}` : ''}`,
      );
    } else if (existingParams) {
      history.push(`${HO_TEMPLATE_UPDATE}/${id}?${existingParams}`);
    } else {
      history.push(`${HO_TEMPLATE_UPDATE}/${id}`);
    }
  };

  return (
    <Box className={classes.previewTemplate}>
      <ButtonGroup
        showBack={true}
        showCancel={false}
        handleBack={handleBack}
        handleEdit={handleEdit}
        isEdit={showActionsButton()}
        showSave={false}
      />
      <Divider className={classes.previewTemplateDivider} />
      <Box className={classes.previewTemplateInfo}>
        <Typography variant="h3" className={classes.previewTemplateInfoTitle}>
          {title} <Chip label={enumTemplateType[templateableType]} size="small" color="primary" />
        </Typography>
        <Typography variant="body1" className={classes.previewTemplateInfoText}>
          {description}
        </Typography>
      </Box>
      <Box className={classes.previewTemplateContent}>
        {sectionsAttributes?.map((section) => renderSectionPreview({ section }))}
      </Box>
      <ButtonGroup
        showBack={true}
        showCancel={false}
        handleBack={handleBack}
        handleEdit={handleEdit}
        isEdit={showActionsButton()}
        showSave={false}
      />
    </Box>
  );
};

PreviewTemplate.propTypes = {
  template: PropTypes.object,
};
export default PreviewTemplate;
