import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Skeleton,
  Typography,
} from '@mui/material';
import DynamicTemplateRender from 'commonComponents/dynamicFormRender';
import {
  applyDescriptionAIIsAIModifiedFlags,
  getSubmitReportIsAIModified,
} from 'commonComponents/dynamicFormRender/descriptionAICompareUtils';
import { DescriptionAIProvider } from 'commonComponents/dynamicFormRender/descriptionAIContext';
import TableImage from 'commonComponents/tableImage';
import { useStyles } from 'commonComponents/tourReportAccordion/tourReportAccordion';
import PropTypes from 'prop-types';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useHistory, useLocation } from 'react-router-dom';
import { getReportDetails, updateReport } from 'services/reports.services';
import {
  assignTheAnswers,
  generateInitialValues,
  isObjectEmpty,
  removeNotRequiredKeys,
} from 'src/helper/utilityFunctions';
import useDateTime from 'src/hooks/useDateTime';
import useFormHook from 'src/hooks/useFormHook';
import { dayjsFormatsEnum, toastSettings } from 'src/utils/constants';
import formValidatorJoi from 'src/utils/formValidator/formValidator.requiredCheck';
import { toaster } from 'src/utils/toast';

const enumDynamicForm = {
  dynamicFormField: 'dynamicFormField',
};
const CheckPointAccordion = ({ row, checkpointNumber, handleChange, selectedAccordion }) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const location = useLocation();
  const history = useHistory();
  const { formatDayjsDateTime } = useDateTime();

  const [template, setTemplate] = useState({});

  const [loading, setLoading] = useState(true);

  const [_uploadProgress, setUploadProgress] = useState(0);

  const [_failedToUpload, setFailedToUpload] = useState([]);

  const { handleInputChange, errorMessages, setErrorMessages, removeError, formData, setFormData } =
    useFormHook({
      defaultFormData: {},
    });

  const descriptionAISelectionsRef = useRef({});

  const saasToken = useSelector((state) => state.auth.saasToken);

  const getTemplateDetails = async () => {
    try {
      setLoading(true);
      const res = await getReportDetails(row?.reportId);
      if (res.statusCode === 200) {
        setTemplate({ ...res?.data });
        const hardCopy = JSON.parse(JSON.stringify(res?.data));

        const { initialValues } = generateInitialValues(hardCopy?.sectionsAttributes);

        setFormData(initialValues);
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

  useEffect(() => {
    if (row?.reportId && selectedAccordion === checkpointNumber && isObjectEmpty(template)) {
      getTemplateDetails();
    }
  }, [row?.reportId, selectedAccordion]);

  const handleFormSubmit = async () => {
    try {
      const validateThis = {
        [enumDynamicForm.dynamicFormField]: removeNotRequiredKeys({ ...formData }, { ...template }),
      };

      const errors = await formValidatorJoi(validateThis, t, {}, true);

      setErrorMessages(errors);
      if (!isObjectEmpty(errors)) {
        return;
      }

      setLoading(true);

      let uploadedData = await assignTheAnswers({
        value: formData,
        reportData: template,
        setUploadProgress,
        setIsUploading: setLoading,
        setFailedToUpload,
        saasToken,
        t,
      });
      if (uploadedData?.error) {
        setLoading(false);
        toaster.error({
          text: uploadedData?.error,
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
        return;
      }

      applyDescriptionAIIsAIModifiedFlags(uploadedData, descriptionAISelectionsRef.current);
      uploadedData.isAIModified = getSubmitReportIsAIModified(uploadedData);

      uploadedData['id'] = uploadedData?.templateId;
      uploadedData['reportId'] = row?.reportId;

      const params = {};
      if (template?.tourId) {
        params.tourId = template.tourId;
      }
      if (row?.checkpoint?.id) {
        params.checkpointId = row?.checkpoint?.id;
      }
      const response = await updateReport(template?.shiftWrapId, uploadedData, params);

      if (response.statusCode === 200) {
        // If redirectPath query Param exist in URL, then redirect to that path
        const urlParam = new URLSearchParams(location.search);
        const redirectPathParam = urlParam.get('redirectPath');
        if (redirectPathParam) {
          history.push(redirectPathParam);
        }

        toaster.success({
          text: response?.message,
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
      }
      setLoading(false);
    } catch (e) {
      setLoading(false);
      toaster.error({
        text: e?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };

  return (
    <Accordion
      expanded={selectedAccordion === checkpointNumber}
      onChange={handleChange(checkpointNumber)}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="panel1a-content"
        id="panel1a-header"
      >
        <Box className={classes.summeryWrapper}>
          {row?.checkpoint && (
            <Typography variant="subtitle1">Checkpoint {checkpointNumber + 1}</Typography>
          )}

          {!row?.checkpoint && (row?.title || template?.title) && (
            <Typography variant="subtitle1">{row?.title || template?.title}</Typography>
          )}
          {(row?.checkpoint || template?.title || (!row?.checkpoint && row?.title)) && (
            <Typography className={classes.dotCode}>&#183;</Typography>
          )}
          {row?.checkpoint && (
            <>
              <Typography variant="subtitle1" className={classes.CheckPointText}>
                {row?.checkpoint?.imageUrl && (
                  <TableImage
                    imageUrl={row?.checkpoint?.imageUrl}
                    alt={`${t('commonText.image.alt', {
                      name: `${row?.checkpoint?.type}`,
                    })}`}
                  />
                )}
                {row?.checkpoint?.type}
              </Typography>
              <Typography className={classes.dotCode}>&#183;</Typography>
            </>
          )}

          {(template?.submittedAt || row?.submittedAt) && (
            <Typography variant="subtitle2">
              {formatDayjsDateTime({
                value: template?.submittedAt || row?.submittedAt,
                formatType: dayjsFormatsEnum.dateTime,
              })}
            </Typography>
          )}
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        <Box className={classes.accordionData}>
          {/* {!isObjectEmpty(template) && (
            <Box className={classes.borderWrapper}>
              <DynamicTemplateRender
                template={template}
                handleChange={handleInputChange}
                errorMessages={errorMessages}
                fieldName={enumDynamicForm.dynamicFormField}
                removeError={removeError}
                setErrorMessages={setErrorMessages}
                styleClass={classes.reportFormWrapper}
              />
            </Box>
          )} */}
          {loading ? (
            <Box className={classes.skeletonWrraper}>
              <Skeleton variant="rectangular" width={'80%'} height={30} />
              <Skeleton variant="rectangular" width={'60%'} height={26} />
              <Skeleton variant="rectangular" width={'60%'} height={40} />
              <Skeleton variant="rectangular" width={'60%'} height={20} />
              <Skeleton variant="rectangular" width={'40%'} height={40} />
              <Skeleton variant="rectangular" width={'60%'} height={20} />
              <Skeleton variant="rectangular" width={'40%'} height={40} />
              <Skeleton variant="rectangular" width={'60%'} height={20} />
              <Skeleton variant="rectangular" width={'40%'} height={40} />
              <Skeleton variant="rectangular" width={'60%'} height={20} />
              <Skeleton variant="rectangular" width={'40%'} height={40} />
              <Skeleton variant="rectangular" width={'60%'} height={60} />
              <Skeleton variant="rectangular" width={'60%'} height={20} />
              <Skeleton variant="rectangular" width={'40%'} height={40} />
            </Box>
          ) : (
            !isObjectEmpty(template) && (
              <Box className={classes.borderWrapper}>
                <DescriptionAIProvider
                  resetKey={row?.reportId}
                  selectionsRef={descriptionAISelectionsRef}
                >
                  <DynamicTemplateRender
                    template={template}
                    handleChange={handleInputChange}
                    errorMessages={errorMessages}
                    fieldName={enumDynamicForm.dynamicFormField}
                    removeError={removeError}
                    setErrorMessages={setErrorMessages}
                    styleClass={classes.reportFormWrapper}
                    fieldValues={formData}
                    inferenceKey={row?.reportId}
                  />
                </DescriptionAIProvider>
              </Box>
            )
          )}
          {!isObjectEmpty(template) && (
            <Box className={classes.footerWrapper}>
              <Button variant="primary" onClick={handleFormSubmit} disabled={loading}>
                {t('buttons.update')}
              </Button>
            </Box>
          )}
        </Box>
      </AccordionDetails>
    </Accordion>
  );
};

CheckPointAccordion.propTypes = {
  row: PropTypes.object,
  checkpointNumber: PropTypes.number,
  handleChange: PropTypes.func,
  selectedAccordion: PropTypes.string,
};

export default CheckPointAccordion;
