import { Box, Button, Tooltip, Typography } from '@mui/material';
import { ReactComponent as DownloadIcon } from 'assets/icons/downloadIcon.svg?react';
import { ReactComponent as EyeIcon } from 'assets/icons/eyeIcon.svg?react';
import { ReactComponent as PdfIcon } from 'assets/icons/pdfIcon.svg?react';
import { ReactComponent as UploadPdfIcon } from 'assets/icons/uploadIcon.svg?react';
import { DeleteAlter, DeleteIcon, EditTermIcon, SignalIcon } from 'assets/svg';
import { MoreVert } from 'assets/svg';
import { ReactComponent as ContactPdfIcon } from 'assets/svg/ContactPdfIcon.svg?react';
import { ReactComponent as ContractTerminateIcon } from 'assets/svg/ContractTerminateIcon.svg?react';
import { ReactComponent as ReplaceIcon } from 'assets/svg/ReplaceIcon.svg?react';
import { ReactComponent as TerminateCircleIcon } from 'assets/svg/TerminateCircleIcon.svg?react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { stageValues } from 'salesComponents/deals/dealStages/stage.constant';
import CustomDropDown from 'src/app/components/common/customDropDown';
import LoaderComponent from 'src/app/components/common/loader/index.jsx';
import PopoverButton from 'src/app/components/common/popoverButton';
import { SALES_DEAL } from 'src/app/router/constant/ROUTE.jsx';
import history from 'src/app/router/utils/history.jsx';
import {
  getContractPDF,
  getSignedContractPDF,
  publishContract,
  terminateContract,
} from 'src/services/deal.service.js';
import { toastSettings } from 'src/utils/constants/index.js';
import { fomatNumbersWithCommas } from 'src/utils/currencyFormater/index.js';
import { openFile } from 'src/utils/files/index.js';
import {
  convertISODateTimeToMMMDoYYYY,
  convertMMDDYYYYToDayJsDate,
} from 'src/utils/passTime/time.jsx';
import capitalize from 'src/utils/string/capitalize.jsx';
import { toaster } from 'src/utils/toast/index.jsx';

import { getCurrentDate } from '../../contractCreation/addServices/helper.js';
import { getPlanTypeTitles, PlanTypeEnums } from '../../contractCreation/paymentTerms/helper.js';
import PublishContractModal from '../publishContractModal/index.jsx';
import { useStyles } from './dealContract.js';
import TerminateModal from './terminateModal/index.jsx';

export const ContractActions = {
  TERMINATE_CONTRACT: 'terminateContract',
  DELETE_CONTRACT: 'deleteContract',
  PREVIEW_CONTRACT: 'previewContract',
  PREVIEW_SIGNED_CONTRACT: 'previewSignedContract',
  REPLACE_SIGNED_CONTRACT: 'replaceSignedContract',
  PUBLISH_WITH_SIGN: 'publishWithSign',
  PUBLISH_WITHOUT_SIGN: 'publishWithoutSign',
};

export const publishStatuses = {
  UNPUBLISHED: 'unpublished_and_unsigned',
  PUBLISHED_WITHOUT_SIGN: 'published_and_unsigned',
  PUBLISHED_WITH_SIGN: 'published_and_signed',
  TERMINATED: 'terminated',
};

const publishedStatusOptions = [
  {
    value: publishStatuses.PUBLISHED_WITHOUT_SIGN,
    label: 'Published without sign',
  },
  {
    value: publishStatuses.PUBLISHED_WITH_SIGN,
    label: 'Published and signed',
    className: 'greenDropdown',
  },
  { value: publishStatuses.TERMINATED, label: 'Terminated', className: 'terminateDropdown' },
];

const inititalDeleteContractModalState = {
  action: '',
  show: false,
  title: '',
  text: '',
  confirmButtonText: '',
  icon: '',
  handleConfirmButton: () => {},
};

const initialpublishModalState = {
  open: false,
  action: '',
};

const DealContract = ({
  dealId,
  contractData,
  setContractData,
  handleShowContractForm,
  openModalCloseDeal,
  isDealClosed,
  franchiseId,
  setData,
  data,
}) => {
  const { t } = useTranslation();
  const NA = t('commonText.nA');
  const classes = useStyles();
  const { details } = contractData;
  const { dealStage } = data;
  const contractName = capitalize(details?.name, true) || NA;
  const contractAmount = fomatNumbersWithCommas(details?.amount);
  const planTypeTitles = getPlanTypeTitles(t);
  const planTitle = planTypeTitles[details?.plan];

  const {
    isPublishable = false,
    isEditable = false,
    isUploaded = false,
    isPublished = false,
    isTerminated = false,
    terminatedAt = null,
    status: publishStatus,
    plan,
  } = details;
  const [openPublishModal, setOpenPublishModal] = useState(initialpublishModalState);

  const handleOpenPublishModal = (action) => {
    if (!isDealClosed) {
      openModalCloseDeal();
      return;
    }

    if (isTerminated) {
      toaster.info({
        text: t(`sales.contract.contractTerminatedNoFileUpload`),
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
      return;
    }

    const today = getCurrentDate().startOf('day'); // Start of the current day.
    const startDate = convertMMDDYYYYToDayJsDate(details?.startDate)?.startOf('day'); // Start of startDate

    if (startDate?.isBefore(today)) {
      toaster.info({
        text: t(`sales.contract.startDateBeforePublishingDate`),
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
      return;
    }

    setOpenPublishModal({ open: true, action });
  };
  const handleCloseConvert = () => setOpenPublishModal(initialpublishModalState);

  const [isLoading, setIsLoading] = useState(false);
  const [deleteContractModal, setDeleteContractModal] = useState(inititalDeleteContractModalState);

  const closeDeleteContractModal = () => setDeleteContractModal(inititalDeleteContractModalState);

  const publishStatusDropdownValue = isTerminated
    ? { ...publishedStatusOptions[2], label: `${publishedStatusOptions[2].label} ${terminatedAt}` }
    : publishedStatusOptions.find((option) => option.value === publishStatus);

  const canPublishAndSign = publishStatus === publishStatuses.PUBLISHED_WITHOUT_SIGN && isUploaded;

  const handleViewContract = (action) => {
    if (action === ContractActions.PREVIEW_CONTRACT) fetchPDLLink();
    else if (action === ContractActions.PREVIEW_SIGNED_CONTRACT) fetchPDLLink(true);
  };

  const fetchPDLLink = async (fetchSignedPDFLink = false) => {
    try {
      setIsLoading(true);

      const response = fetchSignedPDFLink
        ? await getSignedContractPDF(dealId)
        : await getContractPDF(dealId);

      if (response.statusCode === 200) {
        openFile(t('sales.contract.contractPdf'), response?.data?.attachment);
      }
    } catch (error) {
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenConfirmation = (action) => {
    if (action === ContractActions.DELETE_CONTRACT) {
      setDeleteContractModal({
        action,
        show: true,
        title: `${t('sales.contract.deleteProposal')}!`,
        text: t('sales.contract.deleteContractText'),
        confirmButtonText: t('sales.contract.deleteProposal'),
        icon: <DeleteAlter />,
        handleConfirmButton: handleTerminateContract,
      });
    } else if (action === ContractActions.TERMINATE_CONTRACT) {
      setDeleteContractModal({
        action,
        show: true,
        title: `${t('sales.contract.terminate')} ${contractName}`,
        text: t('sales.contract.terminateContractText'),
        confirmButtonText: t('sales.contract.terminateContract'),
        icon: <TerminateCircleIcon />,
        handleConfirmButton: handleTerminateContract,
      });
    }
  };

  const handleTerminateContract = async (reason) => {
    try {
      setIsLoading(true);

      const payload = reason ? { reason } : {};

      const response = await terminateContract(dealId, payload);
      if (response.statusCode === 200) {
        setContractData(response?.data?.contract || {});
      }
      closeDeleteContractModal();
    } catch (error) {
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePublishStatus = async () => {
    try {
      setIsLoading(true);
      const payload = { publishingStatus: publishStatuses.PUBLISHED_WITH_SIGN };
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
    } catch (error) {
      if (error?.errorObj?.contract_duty_days_conflict) {
        history.push(`${SALES_DEAL}/${dealId}/contract/${franchiseId}`);
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
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Box className={classNames(classes.proposalSave, classes.proposalEdit)}>
        {isLoading && <LoaderComponent size={50} color={'primary'} label={t('sales.loading')} />}
        <Box className={classes.proposalGrayBox}>
          <Box className={classes.proposalText}>
            <Box className={classes.dropDownSection}>
              <Box className={classes.headingColor}>
                <Typography variant="h4">{contractName}</Typography>
                <Typography variant="h4">{`$${contractAmount} ${planTitle || planTypeTitles[2]}`}</Typography>
              </Box>
              {isPublished && (
                <CustomDropDown
                  name="publishStatus"
                  id="publishStatus"
                  options={[publishedStatusOptions[1]]}
                  selectedValues={publishStatusDropdownValue}
                  className={`${classes.dropHeader} ${publishStatusDropdownValue.className} ${canPublishAndSign ? classes.showArrows : ''}`}
                  bordered
                  handleChange={handleChangePublishStatus}
                  disabled={!canPublishAndSign}
                />
              )}
            </Box>

            {isTerminated && (
              <Box>
                <Typography variant="body2" className={classes.reasonText}>
                  <Box component="span" className={classes.reasonHeading}>
                    {t('sales.deals.reason')}
                  </Box>
                  : {''}
                  {details?.reason || NA}
                </Typography>
              </Box>
            )}
            <Box>
              <Typography variant="body2" className={classes.grayText}>
                {t('sales.contract.created')}{' '}
                {convertISODateTimeToMMMDoYYYY(details?.createdAt) || NA} • {t('sales.contract.by')}{' '}
                {details?.createdBy || NA}
              </Typography>
            </Box>
            {isPublishable && !isTerminated && dealStage.key !== stageValues.CLOSED_LOST && (
              <>
                <Box className={classes.signButtons}>
                  <Button
                    variant="primary"
                    onClick={() => handleOpenPublishModal(ContractActions.PUBLISH_WITH_SIGN)}
                  >
                    {t('sales.contract.publishWithSign')}
                  </Button>
                  <Button
                    variant="secondaryGrey"
                    onClick={() => handleOpenPublishModal(ContractActions.PUBLISH_WITHOUT_SIGN)}
                  >
                    {t('sales.contract.publishWithoutSign')}
                  </Button>
                </Box>
              </>
            )}
          </Box>

          <Box className={classes.editPublishBtn}>
            {isEditable && (
              <Tooltip title="Edit" arrow>
                <Box className={classes.editIcon} onClick={handleShowContractForm}>
                  <EditTermIcon />
                </Box>
              </Tooltip>
            )}

            {isPublished && (
              <Tooltip title="View" arrow>
                <Box className={classes.editIcon} onClick={handleShowContractForm}>
                  <EyeIcon />
                </Box>
              </Tooltip>
            )}
            <Tooltip title="Preview PDF" arrow>
              <Box
                className={classes.editIcon}
                onClick={() => handleViewContract(ContractActions.PREVIEW_CONTRACT)}
              >
                <ContactPdfIcon />
              </Box>
            </Tooltip>
            {!isTerminated && (
              <Box
                className={classes.deleteBtn}
                onClick={() =>
                  handleOpenConfirmation(
                    isPublished
                      ? ContractActions.TERMINATE_CONTRACT
                      : ContractActions.DELETE_CONTRACT,
                  )
                }
              >
                {isPublished ? (
                  <Tooltip title="Terminate" arrow>
                    <Box className={classes.deleteBtn}>
                      <ContractTerminateIcon />
                    </Box>
                  </Tooltip>
                ) : (
                  <Tooltip title="Delete" arrow>
                    <Box className={classes.deleteBtn}>
                      <DeleteIcon />
                    </Box>
                  </Tooltip>
                )}
              </Box>
            )}

            {deleteContractModal.show && (
              <TerminateModal
                showReason={deleteContractModal.action === ContractActions.TERMINATE_CONTRACT}
                title={deleteContractModal.title}
                text={deleteContractModal.text}
                icon={deleteContractModal.icon}
                confirmButtonText={deleteContractModal.confirmButtonText}
                cancelButtonText={t('sales.contract.no')}
                open={deleteContractModal.show}
                handleConfirmButton={deleteContractModal.handleConfirmButton}
                handleCancelButton={closeDeleteContractModal}
              />
            )}
          </Box>
        </Box>
      </Box>
      {isPublished && (
        <Box className={classes.mainOpenSection}>
          <Typography variant="h4"> {t('sales.contract.contract')}</Typography>
          <Box className={classes.mainPdfSection}>
            {isUploaded ? (
              <Box className={classes.pdfBox}>
                <Box className={classes.innerPdfContract}>
                  <Box className={classes.outerPdfBox}>
                    <Box className={classes.pdfContracts}>
                      <PdfIcon />
                      <Typography variant="h4">{t('sales.contract.contractPdf')}</Typography>
                    </Box>
                    <Box>
                      <PopoverButton
                        className={classes.questionBankActions}
                        variant="icon"
                        Icon={MoreVert}
                      >
                        <Box className={classes.questionBankActionsMenu}>
                          <Box
                            className={classes.questionBankActionsRegular}
                            onClick={() =>
                              handleViewContract(ContractActions.PREVIEW_SIGNED_CONTRACT)
                            }
                          >
                            <DownloadIcon className={classes.questionBankActionsIconRegular} />
                            <Typography
                              className={classes.questionBankActionsTextRegular}
                              variant="subtitle2"
                            >
                              {t('sales.contract.previewPDF')}
                            </Typography>
                          </Box>
                          {!isTerminated && (
                            <Box
                              className={classes.questionBankActionsRegular}
                              onClick={() =>
                                handleOpenPublishModal(ContractActions.REPLACE_SIGNED_CONTRACT)
                              }
                            >
                              <ReplaceIcon className={classes.questionBankActionsIconRegular} />
                              <Typography
                                className={classes.questionBankActionsTextRegular}
                                variant="subtitle2"
                              >
                                {t('sales.contract.replaceCopy')}
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      </PopoverButton>
                    </Box>
                  </Box>
                  <Box>
                    <Typography variant="body3" className={classes.grayText}>
                      {t('sales.contract.created')}{' '}
                      {convertISODateTimeToMMMDoYYYY(details?.createdAt) || NA} •{' '}
                      {t('sales.contract.by')} {details?.createdBy || NA}
                    </Typography>
                  </Box>
                  <Box className={classes.signalPdfContent}>
                    <Box className={classes.pdfTop}>
                      <Typography variant="overline"> {contractName}</Typography>
                    </Box>
                    <Box className={classes.pdfcenter}>
                      <SignalIcon className={classes.signalLogo} />
                      <Typography variant="h5"> {t('sales.contract.pdfLabel')}</Typography>
                      <Box className={classes.pdfBottom}>
                        <Typography variant="body3">{contractName}</Typography>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </Box>
            ) : (
              <Box
                className={classes.pdfUploadSection}
                onClick={() => handleOpenPublishModal(ContractActions.PUBLISH_WITH_SIGN)}
              >
                <Box className={classes.uploadInnerContent}>
                  <UploadPdfIcon></UploadPdfIcon>
                  <Typography variant="h4"> {t('sales.contract.uploadSignedContract')}</Typography>
                  <Typography variant="body2" className={classes.grayText}>
                    {t('sales.contract.PdfText')}
                  </Typography>
                </Box>
              </Box>
            )}
          </Box>
        </Box>
      )}

      <PublishContractModal
        openHandle={openPublishModal.open}
        action={openPublishModal.action}
        closeHandle={handleCloseConvert}
        dealId={dealId}
        setContractData={setContractData}
        contractData={contractData}
        areDatesFilled={!!details.startDate}
        isUploadAfterPublishFlow={!isUploaded && isPublished}
        isEventPlan={plan == PlanTypeEnums.EVENT}
        franchiseId={franchiseId}
        setData={setData}
      />
    </>
  );
};

DealContract.propTypes = {
  contractData: PropTypes.object,
  setContractData: PropTypes.func,
  handleShowContractForm: PropTypes.func,
  openModalCloseDeal: PropTypes.func,
  isDealClosed: PropTypes.bool,
  franchiseId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  dealId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  setData: PropTypes.func,
  data: PropTypes.object,
};

export default DealContract;
