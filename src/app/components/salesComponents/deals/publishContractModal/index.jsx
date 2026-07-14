import { Button, InputLabel } from '@mui/material';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Typography from '@mui/material/Typography';
import { ReactComponent as DeleteIcon } from 'assets/icons/trashIcon.svg?react';
import classNames from 'classnames';
import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ResponsiveDatePickers from 'src/app/components/common/datePicker';
import LoaderComponent from 'src/app/components/common/loader';
import { SALES_DEAL } from 'src/app/router/constant/ROUTE';
import history from 'src/app/router/utils/history';
import { Featuredicon, UploadSVGIcon, WarningIcon } from 'src/assets/svg';
import { publishContract } from 'src/services/deal.service';
import { toastSettings } from 'src/utils/constants';
import { joiValidateErrors } from 'src/utils/formValidator/formValidator.requiredCheck';
import { convertMMDDYYYYToDayJsDate, formatDayJsDate } from 'src/utils/passTime/time';
import { toaster } from 'src/utils/toast';

import { ContractActions, publishStatuses } from '../dealContract';
import { useStyles } from './publishContractModal';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '100%',
  maxWidth: '500px',
  bgcolor: 'background.paper',
  padding: '24px',
  boxShadow: '0px 8px 8px -4px rgba(16, 24, 40, 0.04), 0px 20px 24px -4px rgba(16, 24, 40, 0.10)',
  borderRadius: '12px',
};

const FormKeys = {
  START_DATE: 'startDate',
  END_DATE: 'endDate',
};

const FileErrors = {
  INVALID: 1,
  NOT_ATTACHED: 2,
};

const inititalFileInfoState = { file: null, name: '', size: null, error: null };

const getPublishPayload = ({
  formData,
  fileInfo,
  areDatesFilled,
  isPublishingWithSign,
  isUploadAfterPublishFlow,
  isReplaceSignedContractFlow,
}) => {
  const payload = new FormData();

  if (isReplaceSignedContractFlow) {
    payload.append('file', fileInfo.file);
    return payload;
  }

  const dates = {
    startDate: formatDayJsDate(formData.startDate, 'date'),
    endDate: formatDayJsDate(formData.endDate, 'date'),
  };
  if (isPublishingWithSign) payload.append('file', fileInfo.file);

  if (!areDatesFilled) {
    payload.append(`startDate`, dates.startDate);
    payload.append(`endDate`, dates.endDate);
  }

  if (!isUploadAfterPublishFlow)
    payload.append(
      'publishingStatus',
      isPublishingWithSign
        ? publishStatuses.PUBLISHED_WITH_SIGN
        : publishStatuses.PUBLISHED_WITHOUT_SIGN,
    );
  return payload;
};

const PublishContractModal = ({
  openHandle,
  closeHandle,
  action,
  dealId,
  areDatesFilled,
  setContractData,
  isUploadAfterPublishFlow,
  isEventPlan,
  franchiseId,
  setData,
}) => {
  /**
   * get today date and time
   */
  const today = dayjs();

  const classes = useStyles();
  const { t } = useTranslation();
  // const NA = t('commonText.nA');
  const [fileInfo, setFileInfo] = useState(inititalFileInfoState);
  const [formData, setFormData] = useState({});
  const [errorMessages, setErrorMessages] = useState({});
  const [isPublishingContract, setIsPublishingContract] = useState(false);

  const isPublishingWithSign = action === ContractActions.PUBLISH_WITH_SIGN;
  const isNoFileOrDateRequired = !isPublishingWithSign && !formData.length;
  const isReplaceSignedContractFlow = action === ContractActions.REPLACE_SIGNED_CONTRACT;
  const isUploadFileFlow = isPublishingWithSign || isReplaceSignedContractFlow;

  const showDates = !isReplaceSignedContractFlow && !isUploadAfterPublishFlow && !areDatesFilled;

  const handleModalClose = () => {
    setErrorMessages({});
    setFileInfo(inititalFileInfoState);
    setFormData({});
    closeHandle();
  };

  /**
   * common function to update data to formDat object
   */
  const updateFormHandler = useCallback(
    (name, value) => {
      setFormData((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    },
    [setFormData],
  );

  const removeErrorKey = (keyName) => {
    setErrorMessages((prevState) => {
      const { [keyName]: _, ...rest } = prevState;
      return rest;
    });
  };

  const handleDateChange = (customEvent) => {
    const { name, value } = customEvent;
    const isValidDate = !isNaN(value?.['$d']);
    if (isValidDate) {
      removeErrorKey(name);
    }
    updateFormHandler(name, isValidDate ? value : null);
  };

  const getError = (key) => {
    return errorMessages[key];
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    const { name, size } = file;
    const sizeInMB = (size / (1024 * 1024)).toFixed(2);

    /**
     * show error if file size exce
     */
    if (sizeInMB > 15) {
      toaster.error({
        text: t('sales.commonText.fileSizeLimit15'),
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
      event.target.value = '';
      return;
    }

    if (!file) {
      setIsUploadingError(true);
      return;
    }

    setFileInfo({ file, name, size: sizeInMB, error: null });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    const validationDates = {
      startDate: formatDayJsDate(formData.startDate, 'date'),
      endDate: formatDayJsDate(formData.endDate, 'date'),
    };
    let errors;

    if (!areDatesFilled)
      errors = await joiValidateErrors({
        data: validationDates,
        t,
      });

    let isError = false;
    if (errors) {
      setErrorMessages(errors);
      isError = true;
    }

    if (isUploadFileFlow && !fileInfo.file) {
      setFileInfo({ ...fileInfo, error: FileErrors.NOT_ATTACHED });
      isError = true;
    }

    if (isError) return;

    try {
      setIsPublishingContract(true);
      const payload = getPublishPayload({
        formData,
        fileInfo,
        areDatesFilled,
        isPublishingWithSign,
        isUploadAfterPublishFlow,
        isReplaceSignedContractFlow,
      });

      const response = await publishContract(dealId, payload);
      if (response.statusCode === 200) {
        setContractData(response?.data?.contract);
        /**
         * update amount in deal detail
         */
        setData((prevData) => ({
          ...prevData,
          amount: response?.data?.contract?.details?.amount,
        }));
      }
      handleModalClose();
    } catch (error) {
      if (error?.errorObj?.contract_duty_days_conflict) {
        history.push(`${SALES_DEAL}/${dealId}/contract/${franchiseId}`);

        toaster.error({
          text: error?.message,
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
        return;
      }
      /**
       * if cycle reference date is not between start and enddate of contract
       */
      if (error?.errorObj?.cycle_ref_date_error) {
        history.push({
          pathname: `${SALES_DEAL}/${dealId}/contract/${franchiseId}`,
          state: { cycltRefError: true },
        });
      }
      // use the following url to redirect
      // sales/deals/deal/${dealId}/contract/${contractId}
      /**
       * show error
       */
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    } finally {
      setIsPublishingContract(false);
    }
  };

  const getModalTypography = () => {
    if (isReplaceSignedContractFlow)
      return {
        title: t('sales.contract.signModalReplaceSignedContractTitle'),
        text: t('sales.contract.signModalReplaceSignedContractText'),
        confirmButtonText: t('sales.contract.replaceCopy'),
      };
    if (isUploadAfterPublishFlow)
      return {
        title: t('sales.contract.signModalUploadAfterPublishTitle'),
        text: t('sales.contract.signModalUploadAfterPublishText'),
        confirmButtonText: t('sales.contract.uploadContract'),
      };
    if (isNoFileOrDateRequired)
      return {
        title: t('sales.contract.signModalNoFileOrDateTitle'),
        text: t('sales.contract.signModalNoFileOrDateText'),
        confirmButtonText: t('sales.contract.publishContract'),
      };
    return {
      title: t('sales.contract.signModalTitle'),
      text: t('sales.contract.signModalText'),
      confirmButtonText: t('sales.contract.publishContract'),
    };
  };

  const modal = getModalTypography();

  return (
    <>
      {isPublishingContract && (
        <LoaderComponent size={50} color={'primary'} label={t('sales.loading')} />
      )}
      <Modal
        open={openHandle}
        onClose={handleModalClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box
          className={classes.converModal}
          sx={style}
          component="form"
          onSubmit={handleFormSubmit}
        >
          <Box className={classes.boxHeader}>
            <WarningIcon className={classes.warnIcon} />
            <Box className={classes.titlehead}>
              <Typography variant="h4" className={classes.sidetitle}>
                {modal.title}
              </Typography>
            </Box>
            <Typography variant="body2" className={classes.bulkSubHeading}>
              {modal.text}
            </Typography>
          </Box>

          <Box className={classes.converInner}>
            {showDates && (
              <Box className={classes.dateWrapper}>
                <Typography variant="subtitle2">{t('sales.contract.contractDuration')}</Typography>
                <Box className={classes.sideBySideCol}>
                  <InputLabel htmlFor="date">{t('sales.contract.startEndDate')}</InputLabel>
                  <Box className={classes.duelTime}>
                    <ResponsiveDatePickers
                      value={
                        formData[FormKeys.START_DATE]
                          ? convertMMDDYYYYToDayJsDate(formData[FormKeys.START_DATE])
                          : null
                      }
                      onChange={(value) => handleDateChange({ name: FormKeys.START_DATE, value })}
                      minDate={
                        isEventPlan && formData[FormKeys.END_DATE]
                          ? convertMMDDYYYYToDayJsDate(formData[FormKeys.END_DATE]).subtract(6, 'd')
                          : today
                      }
                      maxDate={
                        formData[FormKeys.END_DATE]
                          ? convertMMDDYYYYToDayJsDate(formData[FormKeys.END_DATE]).subtract(1, 'd')
                          : null
                      }
                      placeholder={t('sales.contract.datePlaceholder')}
                      format="MM/DD/YYYY"
                      inputFormat="MM/DD/YYYY"
                      error={!!getError(FormKeys.START_DATE)}
                      helperText={getError(FormKeys.START_DATE)}
                    />
                    <ResponsiveDatePickers
                      value={
                        formData[FormKeys.END_DATE]
                          ? convertMMDDYYYYToDayJsDate(formData[FormKeys.END_DATE])
                          : null
                      }
                      minDate={
                        formData[FormKeys.START_DATE]
                          ? convertMMDDYYYYToDayJsDate(formData[FormKeys.START_DATE]).add(1, 'd')
                          : null
                      }
                      /**
                       * only add maxDate check if plan is selected as EVENT
                       */
                      maxDate={
                        isEventPlan && formData[FormKeys.START_DATE]
                          ? convertMMDDYYYYToDayJsDate(formData[FormKeys.START_DATE]).add(6, 'd')
                          : null
                      }
                      onChange={(value) => handleDateChange({ name: FormKeys.END_DATE, value })}
                      disabled={!formData[FormKeys.START_DATE]}
                      placeholder={t('sales.contract.datePlaceholder')}
                      format="MM/DD/YYYY"
                      inputFormat="MM/DD/YYYY"
                      error={!!getError(FormKeys.END_DATE)}
                      helperText={getError(FormKeys.END_DATE)}
                    />
                  </Box>
                </Box>
              </Box>
            )}
            {isUploadFileFlow && (
              <>
                {!isUploadAfterPublishFlow && !isReplaceSignedContractFlow && (
                  <Box className={classes.FileUploader}>
                    <Typography variant="subtitle2">{t('sales.contract.fileUplaod')}</Typography>
                  </Box>
                )}
                {fileInfo.file ? (
                  <Box className={classes.accordionData}>
                    <Box className={classes.attachSuccess}>
                      <Box className={classes.attachSuccessInner}>
                        <Featuredicon className={classes.attachIcons} />
                        <Box className={classes.attachNameWrap}>
                          <Typography className={classes.attachName}>{fileInfo.name}</Typography>
                          <Typography
                            className={classes.attachSize}
                          >{`${fileInfo.size}${t('sales.commonText.mb')}`}</Typography>
                        </Box>
                      </Box>
                      <Box className={classes.deleIcons}>
                        <DeleteIcon
                          onClick={() => setFileInfo(inititalFileInfoState)}
                          sx={{ color: 'red' }}
                        />
                      </Box>
                    </Box>
                  </Box>
                ) : (
                  <Box className={classes.uploadBtnImg}>
                    <input
                      type="file"
                      accept=".pdf, .doc, .docx"
                      onChange={handleFileChange}
                      id="file-input"
                      className={classes.fileUpload}
                    />
                    <label htmlFor="file-input">
                      <Button variant="onlyText" component="span">
                        <UploadSVGIcon className={classes.uploadSvg} />
                      </Button>
                    </label>
                    {fileInfo.error === FileErrors.NOT_ATTACHED && (
                      <Typography variant="body2" className={classes.errorMessage}>
                        {t('sales.commonText.fileNotAttached')}
                      </Typography>
                    )}
                  </Box>
                )}
              </>
            )}
          </Box>
          <Box className={classes.sidefooter}>
            <Button
              variant="secondaryGrey"
              className={classNames(classes.blessbtn, classes.btn)}
              onClick={handleModalClose}
            >
              {t('sales.contract.cancel')}
            </Button>
            <Button
              type="submit"
              variant="primary"
              className={classNames(classes.bluebtn, classes.btn)}
            >
              {modal.confirmButtonText}
            </Button>
          </Box>
        </Box>
      </Modal>
    </>
  );
};

PublishContractModal.propTypes = {
  openHandle: PropTypes.func,
  closeHandle: PropTypes.func,
  setContractData: PropTypes.func,
  contractData: PropTypes.object,
  action: PropTypes.string,
  areDatesFilled: PropTypes.bool,
  isUploadAfterPublishFlow: PropTypes.bool,
  isEventPlan: PropTypes.bool,
  dealId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  franchiseId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  setData: PropTypes.func,
};

export default PublishContractModal;
