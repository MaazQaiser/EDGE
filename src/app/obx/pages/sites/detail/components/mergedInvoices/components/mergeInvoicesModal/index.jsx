import { Box, Button, Checkbox, Skeleton, Typography } from '@mui/material';
import { ReactComponent as NoRecord } from 'assets/svg/noMergeFound.svg?react';
import ModalComponent from 'commonComponents/modal';
import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom/cjs/react-router-dom.min';
import { CloseIcon } from 'src/assets/svg';
import { ReactComponent as CheckBoxRegularIcon } from 'src/assets/svg/checkbox.svg?react';
import { ReactComponent as CheckBoxCheckedIcon } from 'src/assets/svg/checkbox-checked.svg?react';
import useDateTime from 'src/hooks/useDateTime';
import { getMergeableContractSets, mergeInvoices } from 'src/services/invoice.services';
import { billingFrequency, dayjsFormatsEnum, toastSettings } from 'src/utils/constants';
import { toaster } from 'src/utils/toast';

import { useStyles } from './MergeInvoicesModal.style';
const MergeInvoiceModel = ({ open, handleClose, refetchData }) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const { id } = useParams();
  const [mergeableContractSets, setMergeableContractSets] = useState([]);
  const [selectedSet, setSelectedSet] = useState(null);
  const [selectedContracts, setSelectedContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { formatDayjsDateTime } = useDateTime();

  const fetchMergeableContractSets = async () => {
    setLoading(true);
    try {
      const response = await getMergeableContractSets(id);
      if (response && response?.statusCode === 200) {
        setMergeableContractSets(response?.data?.contractSets);
      }
      setLoading(false);
    } catch (error) {
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };

  const handleSelect = (contractId, index) => {
    setSelectedContracts((prevSelectedContracts) => {
      const indexOfContract = prevSelectedContracts.indexOf(contractId);

      const updatedContracts =
        indexOfContract === -1
          ? [...prevSelectedContracts, contractId]
          : prevSelectedContracts.filter((id) => id !== contractId);

      if (updatedContracts.length === 0) {
        setSelectedSet(null);
      } else if (!selectedSet) {
        setSelectedSet(index);
      }

      return updatedContracts;
    });
  };

  useEffect(() => {
    fetchMergeableContractSets();
  }, []);

  const getLabelByValue = (array, value) => {
    const match = array.find((item) => item.value === value);
    return match ? match.label : t('commonText.nA');
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const response = await mergeInvoices({ contractSetIds: selectedContracts });
      if (response && response.statusCode === 200) {
        toaster.success({
          text: response?.message,
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
      }
      handleClose();
      refetchData();
    } catch (error) {
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };

  const formatInternationalizedContractDuration = (duration) =>
    duration
      ?.split(' - ')
      ?.map((item) =>
        formatDayjsDateTime({
          value: dayjs(item, 'DD-MM-YYYY'),
          formatType: dayjsFormatsEnum.date,
          bypassFranchiseTimezone: true,
        }),
      )
      ?.join(' - ');

  const modalBody = (
    <Box className={classes.mergeModal}>
      <Box className={classes.mergeModalHeader}>
        <Typography variant="h2" className={classes.modalTitle}>
          {t('obx.billing.mergeInvoices')}
        </Typography>
        <Button
          disableRipple
          className={classes.notesCloseBtn}
          variant="text"
          onClick={handleClose}
        >
          <CloseIcon />
        </Button>
      </Box>
      <Box className={classes.mergeInvoiceDetails}>
        <Typography variant="body2" className={classes.modalDescription}>
          {t('obx.billing.mergedInvoicesTextModal')}
        </Typography>

        {loading ? (
          <Box className={classes.languageModalSkeletonWrapper}>
            <Skeleton variant="rectangular" height={45} className={classes.languageModalSkeleton} />
            <Skeleton variant="rectangular" height={45} className={classes.languageModalSkeleton} />
            <Skeleton variant="rectangular" height={45} className={classes.languageModalSkeleton} />
            <Skeleton variant="rectangular" height={45} className={classes.languageModalSkeleton} />
          </Box>
        ) : mergeableContractSets?.length ? (
          mergeableContractSets?.map((contractSet, index) => (
            <Box className={classes.mergeSetWrapper} key={index}>
              <Typography variant="h5">
                {t('obx.billing.set')} {index + 1}
              </Typography>
              <Box className={classes.setDates}>
                <Typography variant="caption">
                  {t('obx.billing.cycleRefDate')}:{' '}
                  {contractSet?.cycleReferenceDate &&
                    formatDayjsDateTime({
                      value: contractSet?.cycleReferenceDate,
                      formatType: dayjsFormatsEnum.date,
                      bypassFranchiseTimezone: true,
                    })}
                </Typography>
                <Typography variant="caption">
                  {t('obx.billing.billingFrequency')}:{' '}
                  {getLabelByValue(billingFrequency(t), contractSet?.billingFrequency)}
                </Typography>
              </Box>

              <Box className={classes.mergeSetOptionsWrapper}>
                {contractSet?.contracts?.length
                  ? contractSet?.contracts?.map((contract) => (
                      <Box className={classes.questionOption} key={contract?.id}>
                        <Box className={classes.questionLeft}>
                          <Typography variant="h5">{contract?.name}</Typography>
                          <Typography variant="caption">
                            {t('obx.billing.contractDuration')}:{' '}
                            {contract?.duration &&
                              formatInternationalizedContractDuration(contract?.duration)}
                          </Typography>
                        </Box>
                        <Box className={classes.questionRight}>
                          <Checkbox
                            icon={<CheckBoxRegularIcon />}
                            checkedIcon={<CheckBoxCheckedIcon />}
                            onClick={() => handleSelect(contract?.id, index)}
                            disabled={selectedSet !== null && selectedSet !== index}
                            className={classes.checkBoxCustom}
                          />
                        </Box>
                      </Box>
                    ))
                  : null}
              </Box>
            </Box>
          ))
        ) : (
          <Box className={classes.createInstructionWrapper}>
            <NoRecord />
            <Box className={classes.siteWrapperText}>
              <Typography variant="h2"> {t('obx.commonText.table.noRecordFound')}</Typography>
            </Box>
          </Box>
        )}
      </Box>

      <Box className={classes.buttonWrraper}>
        <Button variant="secondaryGrey" type="button" onClick={handleClose}>
          {t('obx.billing.cancel')}
        </Button>
        <Button
          variant="primary"
          type="button"
          onClick={handleSubmit}
          disabled={!selectedContracts?.length || isSubmitting}
        >
          {t('obx.billing.mergeInvoices')}
        </Button>
      </Box>
    </Box>
  );
  return <ModalComponent open={open} handleClose={handleClose} body={modalBody}></ModalComponent>;
};

MergeInvoiceModel.propTypes = {
  open: PropTypes.bool,
  handleClose: PropTypes.func,
  refetchData: PropTypes.func,
};
export default MergeInvoiceModel;
