import { Box, Button, InputLabel, TextField, Typography } from '@mui/material';
import { ReactComponent as CloseIcon } from 'assets/svg/close.svg?react';
import LoaderComponent from 'commonComponents/loader';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { reportAProblem } from 'services/faqs.services';
import FileUpload from 'src/app/components/common/fileUpload';
import RequiredAsterik from 'src/app/components/common/requiredAsterik';
import { useApiControllers } from 'src/helper/axios';
import useFormHook from 'src/hooks/useFormHook';
import { toastSettings } from 'src/utils/constants';
import formValidatorJoi from 'src/utils/formValidator/formValidator.requiredCheck';
import { toaster } from 'src/utils/toast';

import { useStyles } from './reportProblemDrawer.styles';

const MAX_CHARACTER_LIMIT = 2000;

// const TEST_SITE_KEY = '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI';
/**
 * This Site key is generated on the v3 version of Google Recaptcha
 * The current package installed supports on v2 so to enable this we need to install a separate package
 * of google recaptcha that support v3.
 * */
// const V3_RECAPTCHA_SITE_KEY = '6LeQzL0pAAAAAAcs6XxkzOG-tdkfitTUvqbJbQJx'; // V3 repatcha key
const V2_SITE_KEY = process.env.REACT_APP_GOOGLE_CAPTCHA_KEY;

const reportProblemFormData = {
  attachments: [],
  description: '',
  email: '',
  title: '',
  recaptchaToken: '',
};
const ReportProblemDrawer = ({ setReportProblemDrawer }) => {
  const classes = useStyles();
  const { t } = useTranslation();

  const { getNewApiController } = useApiControllers();

  const [attachmentFiles, setAttachmentFiles] = useState([]);
  // const [profileImage, setImage] = useState(null);
  const userInfo = useSelector((state) => state.user.info);

  const [disable, setDisable] = useState(false);

  const [disableFields, setDisableFields] = useState(false);

  // const [loadCaptcha, setLoadCaptcha] = useState(false);

  const [_showConfirmationModal, setShowConfirmationModal] = useState(false);

  const getClientData = () => {
    let data = {
      browserName: '',
      browserVersion: '',
      platform: '',
    };

    // Get browser name and version
    let userAgent = window.navigator.userAgent;
    if (userAgent.indexOf('Chrome') !== -1) {
      data.browserName = 'Chrome';
      data.browserVersion = userAgent.substring(userAgent.indexOf('Chrome') + 7);
    } else if (userAgent.indexOf('Firefox') !== -1) {
      data.browserName = 'Firefox';
      data.browserVersion = userAgent.substring(userAgent.indexOf('Firefox') + 8);
    } else if (userAgent.indexOf('Safari') !== -1) {
      data.browserName = 'Safari';
      data.browserVersion = userAgent.substring(userAgent.indexOf('Version') + 8);
    } else {
      data.browserName = 'Unknown';
    }

    // Get platform
    if (userAgent.indexOf('Win') !== -1) {
      data.platform = 'Windows';
    } else if (userAgent.indexOf('Mac') !== -1) {
      data.platform = 'macOS';
    } else if (userAgent.indexOf('Linux') !== -1) {
      data.platform = 'Linux';
    } else {
      data.platform = 'Unknown';
    }

    return data;
  };

  const {
    handleInputChange,
    updateFormHandler,
    formData,
    setFormData,
    errorMessages,
    setErrorMessages,
  } = useFormHook({
    defaultFormData: {
      ...reportProblemFormData,
      email: userInfo?.email ? userInfo?.email : '',
    },
  });

  const onCaptchaChange = (value) => {
    // Do something with the value
    setFormData((prev) => ({
      ...prev,
      recaptchaToken: value ? value : '',
    }));
  };

  const validateForm = async () => {
    let overallPayload = {
      ...formData,
    };
    if (attachmentFiles?.length > 0) {
      overallPayload = {
        ...formData,
        attachments: attachmentFiles,
      };
    } else {
      delete overallPayload.attachments;
    }

    delete overallPayload.recaptchaToken;
    const errors = await formValidatorJoi(overallPayload, t);

    if (errors && Object.keys(errors).length) {
      setErrorMessages((prev) => ({ ...prev, ...errors }));
      setDisableFields(false);
      return;
    }
    setDisableFields(true);
    checkRecaptchaAndForm();
    // createSubmitFormData();
  };

  const checkRecaptchaAndForm = async () => {
    let overallPayload = {
      ...formData,
    };
    if (attachmentFiles?.length > 0) {
      overallPayload = {
        ...formData,
        attachments: attachmentFiles,
      };
    } else {
      delete overallPayload.attachments;
    }
    const errors = await formValidatorJoi(overallPayload, t);

    if (errors && Object.keys(errors).length) {
      setErrorMessages((prev) => ({ ...prev, ...errors }));
      return;
    }
    setErrorMessages({});
    createSubmitFormData();
  };

  const createSubmitFormData = async () => {
    // const errors = await formValidatorJoi(formData, t);
    //
    // if (errors && Object.keys(errors).length) {
    //   setErrorMessages((prev) => ({ ...prev, ...errors }));
    //   return;
    // }

    const clientData = getClientData();

    const finalPayload = {
      ...formData,
      metadata: { deviceType: 'web', ...clientData },
    };

    let finalData = new FormData();

    for (let x = 0; attachmentFiles?.length > x; x++) {
      finalData.append('files[]', attachmentFiles[x]);
    }

    for (const [key, value] of Object.entries(finalPayload)) {
      let item = value;
      if (typeof item === 'object' && item !== null) {
        item = JSON.stringify(item);
      }
      if (!item) {
        item = '';
      }
      finalData.append(key, item);
    }

    reportProblem(finalData);
  };

  const reportProblem = async (payload) => {
    const apiController = getNewApiController();

    try {
      setDisable(true);
      const response = await reportAProblem(payload, {
        signal: apiController.signal,
      });

      if (response?.statusCode === 200) {
        toaster.success({
          text: response?.message,
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
        setReportProblemDrawer(false);
      }
    } catch (error) {
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    } finally {
      setDisable(false);
      setDisableFields(false);
      if (!apiController.signal.aborted) {
        // TODO: handle abort controller
      }
    }
  };

  const _resetFormOnEmailChange = (e) => {
    setFormData(reportProblemFormData);
    handleInputChange(e);
  };

  const _toggleConfirmationModal = () => {
    setShowConfirmationModal((a) => !a);
    // setCurrentSelectedId(id || null);
  };

  return (
    <>
      {disable && <LoaderComponent size={50} color={'primary'} label={'Loading'} />}
      <Box className={classes.addBannedVisitorDrawer}>
        <Box className={classes.addBannedVisitorDrawerHeader}>
          <Typography variant="h3" className={classes.addBannedVisitorDrawerTitle}>
            {t('reportProblem.reportProblem')}
          </Typography>
          <Button
            disableRipple
            className={classes.closeBtn}
            onClick={() => {
              setReportProblemDrawer(false);
            }}
          >
            <CloseIcon />
          </Button>
        </Box>
        <Box className={classes.addBannedVisitorDrawerBody}>
          <Box className={classes.addBannedVisitorDrawerFields}>
            <Box className={classes.addBannedVisitorDrawerField}>
              <InputLabel>
                {t('reportProblem.email')} <RequiredAsterik />
              </InputLabel>

              <TextField
                placeholder={t('reportProblem.addEmail')}
                onChange={handleInputChange}
                name="email"
                type="email"
                value={formData?.email}
                disabled={disableFields}
                helperText={errorMessages?.email || ''}
                error={!!errorMessages?.email}
                inputProps={{ maxLength: 100 }}
              />
            </Box>
          </Box>
          <Box className={classes.addBannedVisitorDrawerFields}>
            <Box className={classes.addBannedVisitorDrawerField}>
              <InputLabel>
                {t('reportProblem.title')} <RequiredAsterik />
              </InputLabel>

              <TextField
                placeholder={t('reportProblem.addTitle')}
                onChange={handleInputChange}
                name="title"
                value={formData?.title}
                helperText={errorMessages?.title || ''}
                error={!!errorMessages?.title}
                disabled={disableFields}
                inputProps={{ maxLength: 100 }}
              />
            </Box>
          </Box>

          <Box className={classes.addBannedVisitorDrawerTextArea}>
            <InputLabel>
              {t('reportProblem.description')} <RequiredAsterik />
            </InputLabel>
            <TextField
              placeholder={t('reportProblem.addDescription')}
              multiline
              minRows={5}
              maxRows={5}
              onChange={handleInputChange}
              name="description"
              value={formData?.description}
              disabled={disableFields}
              helperText={
                <Box className={classes.addBannedHelperText}>
                  <Box className={classes.invalidFeedback}>{errorMessages?.description || ''}</Box>
                  <Typography
                    variant="body2"
                    className={classes.reasonCharacterLimit}
                  >{`${formData?.description.length}/${MAX_CHARACTER_LIMIT}`}</Typography>
                </Box>
              }
              error={!!errorMessages?.description}
              inputProps={{
                maxlength: MAX_CHARACTER_LIMIT,
              }}
            />
          </Box>
          <Box>
            <InputLabel>
              {t('obx.visitors.drawer.attachments')}
              {/* <RequiredAsterik /> */}
            </InputLabel>

            {/* Multiple Images Upload Here */}
            {/*<FileUpload supportedTypesText="Images (max. 15mbs)" />*/}
            {formData?.attachments && Array.isArray(formData?.attachments) && (
              <FileUpload
                formData={formData}
                formImageKey="attachments"
                updateFormHandler={updateFormHandler}
                errorMessages={errorMessages}
                setErrorMessages={setErrorMessages}
                selectedFiles={attachmentFiles}
                setFile={setAttachmentFiles}
                supportedTypes={['image/jpeg', 'image/jpg', 'image/png', 'image/gif']}
                supportedTypesText="Images (max. 10mbs)"
                allowedExtensions={['.png', '.jpg', '.jpeg', '.svg']}
                disableFileUploading={disableFields}
                maxAllowedFiles={15}
                maxFileSizeAllowed={10}
              />
            )}
          </Box>
          <Box className={classes.recaptchaBox}>
            {disableFields && (
              <Box>
                <ReCAPTCHA
                  sitekey={V2_SITE_KEY}
                  onChange={onCaptchaChange}
                  onErrored={(error) => {
                    onCaptchaChange(error);
                  }}
                  onExpired={(expired) => {
                    onCaptchaChange(expired);
                  }}
                />
                {!!errorMessages?.recaptchaToken && (
                  <Box className={classes.invalidFeedback}>{errorMessages?.recaptchaToken}</Box>
                )}
              </Box>
            )}
          </Box>
        </Box>

        <Box className={classes.addBannedVisitorDrawerFooter}>
          <Button
            variant="secondaryGrey"
            onClick={() => {
              setReportProblemDrawer(false);
            }}
          >
            {t('obx.visitors.drawer.cancel')}
          </Button>
          <Button variant="primary" onClick={validateForm} disabled={disable}>
            {t('reportProblem.submit')}
          </Button>
        </Box>
      </Box>
      {/*{showConfirmationModal && (*/}
      {/*  <SweetAlertModal*/}
      {/*    type="warning" // 'success', 'error', 'warning', 'info', etc.*/}
      {/*    title={t('commonText.modal.areYouSure.title')}*/}
      {/*    text={t('commonText.modal.areYouSure.desc')}*/}
      {/*    cancelButtonText={t('buttons.no')}*/}
      {/*    confirmButtonText={t('buttons.yes')}*/}
      {/*    show={showConfirmationModal}*/}
      {/*    handleConfirmButton={createSubmitFormData}*/}
      {/*    handleCancelButton={toggleConfirmationModal}*/}
      {/*    icon={<BanIcon />}*/}
      {/*  />*/}
      {/*)}*/}
    </>
  );
};

ReportProblemDrawer.propTypes = {
  siteId: PropTypes.number.isRequired,
  setReportProblemDrawer: PropTypes.func,
  refreshData: PropTypes.func.isRequired,
};

export default ReportProblemDrawer;
