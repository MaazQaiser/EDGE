// import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
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
import { applyDescriptionAIIsAIModifiedFlags } from 'commonComponents/dynamicFormRender/descriptionAICompareUtils';
import { DescriptionAIProvider } from 'commonComponents/dynamicFormRender/descriptionAIContext';
import { useStyles } from 'commonComponents/tourReportAccordion/tourReportAccordion';
import PropTypes from 'prop-types';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom/cjs/react-router-dom.min';
import { getDispatchTemplates } from 'services/dispatch.services';
import { updateReportDispatch } from 'services/reports.services';
import { ACL_OBX_DISPATCH_UPDATE } from 'src/app/router/constant/OBXMODULE';
import history from 'src/app/router/utils/history';
import {
  assignTheAnswers,
  generateInitialValues,
  isObjectEmpty,
  removeNotRequiredKeys,
} from 'src/helper/utilityFunctions';
import { useTenantLabel } from 'src/helper/utilityHooks';
import RenderIfHasPermission from 'src/hoc/RenderIfHasPermission';
import useFormHook from 'src/hooks/useFormHook';
import { toastSettings } from 'src/utils/constants';
import formValidatorJoi from 'src/utils/formValidator/formValidator.requiredCheck';
import { toaster } from 'src/utils/toast';
const enumDynamicForm = {
  dynamicFormField: 'dynamicFormField',
};

const CheckPointAccordionReportSubmit = ({
  row,
  checkpointNumber,
  handleChange,
  selectedAccordion,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const location = useLocation();
  const { getLabel } = useTenantLabel();
  const searchParams = new URLSearchParams(location.search);
  const franchiseId = searchParams.get('franchiseId');

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

  const getTemplateDetails = async (type) => {
    try {
      const param = {
        title: type,
      };
      const res = await getDispatchTemplates(param);
      if (res.statusCode === 200) {
        setTemplate({ ...res?.data?.template });
        const hardCopy = JSON.parse(JSON.stringify(res?.data?.template));

        const { initialValues } = generateInitialValues(hardCopy?.sectionsAttributes);

        setFormData(initialValues);
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };

  useEffect(() => {
    if (isObjectEmpty(template) && row?.dispatchType) {
      getTemplateDetails(row?.dispatchType);
    }
  }, [row?.dispatchType]);

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

      uploadedData['reportId'] = row?.reportId;
      let config = {};
      if (franchiseId) {
        config = {
          headers: {
            franchise_id: franchiseId,
          },
        };
      }

      const response = await updateReportDispatch(row?.id, uploadedData, config);

      if (response.statusCode === 200) {
        // If redirectPath query Param exist in URL, then redirect to that path
        history.goBack();

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
        // expandIcon={<ExpandMoreIcon />}
        aria-controls="panel1a-content"
        id="panel1a-header"
      >
        <Box className={classes.summeryWrapper}>
          {!row?.checkpoint && (row?.title || template?.title) && (
            <>
              <Typography variant="subtitle1">
                {t('obx.dispatch.dispatchReport', { dispatch: getLabel('terms', 'dispatch', t) })}
              </Typography>
              <Typography className={classes.dotCode}>&#183;</Typography>
            </>
          )}

          {!row?.checkpoint && (row?.title || template?.title) && (
            <Typography variant="subtitle1">{row?.title || template?.title}</Typography>
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
                  resetKey={row?.id}
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
                    inferenceKey={row?.id}
                  />
                </DescriptionAIProvider>
              </Box>
            )
          )}
          {!isObjectEmpty(template) && (
            <Box className={classes.footerWrapper}>
              <Button
                variant="primary"
                onClick={() => {
                  history.goBack();
                }}
              >
                {t('buttons.cancel')}
              </Button>
              <RenderIfHasPermission name={ACL_OBX_DISPATCH_UPDATE}>
                <Button variant="primary" onClick={handleFormSubmit} disabled={loading}>
                  {t('buttons.submitReport')}
                </Button>
              </RenderIfHasPermission>
            </Box>
          )}
        </Box>
      </AccordionDetails>
    </Accordion>
  );
};

CheckPointAccordionReportSubmit.propTypes = {
  row: PropTypes.object,
  checkpointNumber: PropTypes.number,
  handleChange: PropTypes.func,
  selectedAccordion: PropTypes.string,
};

export default CheckPointAccordionReportSubmit;
