import { Box, Chip, Divider, Typography } from '@mui/material';
import classNames from 'classnames';
import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import React, { Fragment, useState } from 'react';
import ResponsiveDatePickers from 'src/app/components/common/datePicker';
import LoaderComponent from 'src/app/components/common/loader';
import RequiredAsterik from 'src/app/components/common/requiredAsterik';
import SignaturePad from 'src/app/components/common/signaturePad';
import CustomInput from 'src/app/components/common/templates/customInput';
import CustomRadioGroup from 'src/app/components/common/templates/customRadioGroup';
import ResponsiveTimePickers from 'src/app/components/common/timePicker';
import history from 'src/app/router/utils/history';
import { updateReportStatus } from 'src/services/reports.services';
import { toastSettings } from 'src/utils/constants';
import { isValidiOSDateFormat } from 'src/utils/date';
import { toaster } from 'src/utils/toast';

import ApproveModal from '../approveModal';
import ButtonGroup from '../buttonGroup';
import RejectModal from '../rejectModal';
import ReportProfile from '../reportProfile';
import { useStyles } from './reportPreview.styles';

const enumResponseType = {
  text: 'Text',
  number: 'Number',
  multiselect: 'Multiselect',
  datetime: 'Datetime',
  radio: 'Radio',
  date: 'Date',
  imageVideo: 'Imagevideo',
  time: 'Time',
  signature: 'Signature',
};

const statusValidationEnum = {
  submitted: 'submitted',
  approves: 'accepted',
  rejected: 'rejected',
};

const enumReportTypes = {
  equipmentInspection: 'Equipment Inspection',
  vehicleInspection: 'Vehicle Inspection',
  tourReports: 'Tour Reports',
  shiftDayEndReport: 'Shift Day End Report',
  incidentReport: 'Incident Report',
};

const formatDateForDatePicker = (value) => {
  if (!isValidiOSDateFormat(value)) {
    return null;
  }
  return dayjs(new Date(value).toISOString());
};

const _formatDateForTimePicker = (value) => {
  const [hours, minutes] = value?.split(':')?.map(Number) ?? [];
  const date = new Date();
  date.setHours(hours);
  date.setMinutes(minutes);
  return dayjs(date.toISOString());
};

function _isImageUrl(url) {
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp']; // Add more extensions if needed
  const lowerCaseUrl = url.toLowerCase();

  return imageExtensions.some((ext) => lowerCaseUrl.endsWith(`.${ext}`));
}

function isVideoUrl(url) {
  const videoExtensions = ['mp4', 'webm', 'ogg']; // Add more extensions if needed
  const lowerCaseUrl = url.toLowerCase();

  return videoExtensions.some((ext) => lowerCaseUrl.endsWith(`.${ext}`));
}

const PreviewTemplateSection = ({ title, text, children }) => {
  const classes = useStyles();
  return (
    <Box className={classes.previewTemplateQuestion}>
      <Typography variant="h4" className={classes.previewTemplateQuestionTitle}>
        {title}
        <RequiredAsterik />
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
};

const renderImageAndVideo = (url) => {
  const classes = useStyles();
  if (isVideoUrl(url))
    return (
      <Box className={classes.previewTemplateImage}>
        <video controls>
          <source src={url} type="video/mp4" />
        </video>
      </Box>
    );

  return (
    <Box className={classes.previewTemplateImage}>
      <img src={url} />
    </Box>
  );
};
const getChildComponet = ({
  responseTypeLabel,
  optionsAttributes = [],
  answers = [],
  ...props
}) => {
  const classes = useStyles();
  switch (responseTypeLabel) {
    case enumResponseType.text:
      return (
        <Box className={classNames(classes.previewTemplateField, classes.disabledPointer)}>
          <CustomInput label="" value={answers || null} />
        </Box>
      );
    case enumResponseType.number:
      return (
        <Box className={classNames(classes.previewTemplateField, classes.disabledPointer)}>
          <CustomInput label="" value={answers || null} />
        </Box>
      );
    case enumResponseType.multiselect:
      return (
        <Box className={classNames(classes.previewTemplateOptions, classes.disabledPointer)}>
          {optionsAttributes.map((option) => (
            <Typography
              variant="body1"
              key={option?.id}
              className={classNames(
                classes.previewTemplateOption,
                answers.filter((item) => item?.id == option?.id)?.length > 0 &&
                  classes.previewTemplateOptionSelected,
              )}
            >
              {option?.optionText}
            </Typography>
          ))}
        </Box>
      );
    case enumResponseType.datetime:
      return (
        <Box className={classNames(classes.previewTemplateDateTime, classes.disabledPointer)}>
          <ResponsiveDatePickers
            value={answers ? formatDateForDatePicker(answers) : null}
            onChange={() => {}}
            format="YYYY-MM-DD"
            inputFormat="YYYY-MM-DD"
          />
          <ResponsiveTimePickers
            value={answers ? formatDateForDatePicker(answers) : null}
            onChange={() => {}}
            format="hh:mm aa"
            inputFormat="hh:mm aa"
          />
        </Box>
      );
    case enumResponseType.radio:
      return (
        <Box className={classNames(classes.previewTemplateRadio, classes.disabledPointer)}>
          <CustomRadioGroup value={answers || ''} options={optionsAttributes} />
        </Box>
      );
    case enumResponseType.date:
      return (
        <Box className={classNames(classes.previewTemplatePicker, classes.disabledPointer)}>
          <ResponsiveDatePickers
            value={answers ? formatDateForDatePicker(answers) : null}
            onChange={() => {}}
            format="YYYY-MM-DD"
            inputFormat="YYYY-MM-DD"
          />
        </Box>
      );
    case enumResponseType.time:
      return (
        <Box className={classNames(classes.previewTemplatePicker)}>
          <ResponsiveTimePickers
            value={answers ? formatDateForDatePicker(answers) : null}
            // onChange={(value) => {
            //   console.log(value?.toISOString());
            // }}
            format="hh:mm aa"
            inputFormat="hh:mm aa"
          />
        </Box>
      );

    case enumResponseType.imageVideo:
      return (
        <Box className={classes.previewTemplateImageVideo}>
          {answers.map((answer, index) => (
            <Fragment key={index}>{renderImageAndVideo(answer)}</Fragment>
          ))}
        </Box>
      );

    case enumResponseType.signature:
      console.log({ props });
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
        <Box className={classNames(classes.previewTemplateField, classes.disabledPointer)}>
          <CustomInput label="" />
        </Box>
      );
  }
};

const renderFieldAttributes = ({ fieldsAttribute = {} }) => {
  // ? NOTE: if the variable "value" is not getting used add _ before it or this rule will suffice the need here.
  // eslint-disable-next-line no-unused-vars
  const {
    questionStatement,
    instruction,
    responseTypeLabel,
    optionsAttributes, // eslint-disable-next-line no-unused-vars
    required,
    id,
    answers,
  } = fieldsAttribute;
  return (
    <PreviewTemplateSection title={questionStatement} text={instruction} key={id}>
      {getChildComponet({ responseTypeLabel, optionsAttributes, answers, fieldsAttribute })}
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

const ReportPreview = ({ template = {}, fetchReport }) => {
  const {
    title,
    description,
    sectionsAttributes = [],
    id,
    templateableType,
    status, // eslint-disable-next-line no-unused-vars
    submittedAt,
    officer = {},
  } = template;
  const classes = useStyles();

  const [rejectModal, setRejectModal] = useState(false);
  const [approveModal, setApproveModal] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleBack = () => {
    history.goBack();
  };

  const closeRejectModal = () => {
    setRejectModal(false);
  };
  const openRejectModal = () => {
    setRejectModal(true);
  };

  const confirmButton = async (comments, isRejected = false) => {
    try {
      setDisabled(true);
      setLoading(true);
      const body = isRejected
        ? {
            status: 'rejected',
            supervisorComments: comments,
          }
        : {
            status: 'accepted',
            supervisorComments: '',
          };
      const response = await updateReportStatus({
        reportId: id,
        report: body,
      });
      if (response?.statusCode == 200) {
        isRejected ? closeRejectModal() : closeApproveModal();
        toaster.success({
          text: response?.message,
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
        await fetchReport();
      }
      setDisabled(false);
      setLoading(false);
    } catch (error) {
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
      setDisabled(false);
      setLoading(false);
    }
  };

  const closeApproveModal = () => {
    setApproveModal(false);
  };
  const openApproveModal = () => {
    setApproveModal(true);
  };

  const showApprove = status == statusValidationEnum.submitted;

  return (
    <>
      {loading && <LoaderComponent size={50} color={'primary'} label={'Loading'} />}
      <Box className={classes.previewTemplate}>
        {showApprove && (
          <>
            <ButtonGroup
              showBack={false}
              handleBack={handleBack}
              handleAccept={openApproveModal}
              handleReject={openRejectModal}
              disabled={disabled}
              showApprove={showApprove}
            />
            <Divider className={classes.previewTemplateDivider} />
          </>
        )}

        <Box className={classes.previewTemplateProfile}>
          <ReportProfile officer={officer} submittedAt={null} status={status} />
        </Box>
        <Box className={classes.previewTemplateInfo}>
          <Typography variant="h3" className={classes.previewTemplateInfoTitle}>
            {title} <Chip label={enumReportTypes[templateableType]} size="small" color="primary" />
          </Typography>
          <Typography variant="body1" className={classes.previewTemplateInfoText}>
            {description}
          </Typography>
        </Box>
        <Box className={classes.previewTemplateContent}>
          {sectionsAttributes?.map((section) => renderSectionPreview({ section }))}
        </Box>
        {showApprove && (
          <Box className={classes.previewTemplateFooter}>
            <ButtonGroup
              showBack={false}
              handleBack={handleBack}
              handleAccept={openApproveModal}
              handleReject={openRejectModal}
              showApprove={showApprove}
            />
          </Box>
        )}
      </Box>
      <RejectModal
        open={rejectModal}
        handleClose={closeRejectModal}
        handleReject={confirmButton}
        disabled={disabled}
      />
      <ApproveModal
        open={approveModal}
        handleClose={closeApproveModal}
        handleApprove={confirmButton}
        disabled={disabled}
      />
    </>
  );
};

ReportPreview.propTypes = {
  template: PropTypes.object,
  fetchReport: PropTypes.any,
};

export default ReportPreview;
