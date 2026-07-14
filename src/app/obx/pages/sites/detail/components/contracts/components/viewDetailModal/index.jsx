import { Box, Button, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import ModalComponent from 'src/app/components/common/modal';
import { CloseIcon } from 'src/assets/svg';
import useDateTime from 'src/hooks/useDateTime';
import {
  billingFrequency,
  billingFrequencyType,
  contractTenureTypes,
  dayjsFormatsEnum,
  HOLIDAY_RATE_TYPES,
} from 'src/utils/constants';

import { useStyles } from './viewEditModal.styles';

const ViewDetailModal = ({ open, onClose, data, id, fuelSurchargeLabel }) => {
  const classes = useStyles();
  const { formatDayjsDateTime } = useDateTime();

  const { t } = useTranslation();
  const NA = t('commonText.nA');

  const filteredData = data?.find((item) => String(item?.id) === String(id));

  const getLabelByValue = (array, value) => {
    const match = array.find((item) => item.value === value);
    return match ? match.label : t('commonText.nA');
  };

  const billingFrequencyLabel = getLabelByValue(
    billingFrequency(t),
    filteredData?.billingFrequency,
  );
  const billingFrequencyTypeLabel = getLabelByValue(
    billingFrequencyType(t),
    filteredData?.billingFrequencyType,
  );
  const contractTenureTypeLabel = getLabelByValue(
    contractTenureTypes(t),
    filteredData?.contractTenureType,
  );

  const viewDetailBody = (
    <Box className={classes.viewDetailModal}>
      <Box className={classes.viewDetailModalHeader}>
        <Typography variant="h3" className={classes.viewDetailModalTitle}>
          {t('obx.contracts.billingInformation')}
        </Typography>
        <Button
          disableRipple
          className={classes.notesCloseBtn}
          variant="text"
          onClick={() => onClose(false)}
        >
          <CloseIcon />
        </Button>
      </Box>
      <Box className={classes.viewDetailModalBody}>
        <Box className={classes.viewDetailModalList}>
          <Box className={classes.viewDetailModalCircle}></Box>
          <Box className={classes.viewDetailModalListItem}>
            <Typography variant="body2" className={classes.viewDetailModalListTitle}>
              {t('obx.contracts.billingFrequency')}
            </Typography>
            <Typography variant="body3" className={classes.viewDetailModalListText}>
              {billingFrequencyLabel}
            </Typography>
          </Box>
        </Box>
        <Box className={classes.viewDetailModalList}>
          <Box className={classes.viewDetailModalCircle}></Box>
          <Box className={classes.viewDetailModalListItem}>
            <Typography variant="body2" className={classes.viewDetailModalListTitle}>
              {t('obx.contracts.billingFrequencyType')}
            </Typography>
            <Typography variant="body3" className={classes.viewDetailModalListText}>
              {billingFrequencyTypeLabel}
            </Typography>
          </Box>
        </Box>
        <Box className={classes.viewDetailModalList}>
          <Box className={classes.viewDetailModalCircle}></Box>
          <Box className={classes.viewDetailModalListItem}>
            <Typography variant="body2" className={classes.viewDetailModalListTitle}>
              {t('obx.contracts.contractTenureType')}
            </Typography>
            <Typography variant="body3" className={classes.viewDetailModalListText}>
              {contractTenureTypeLabel}
            </Typography>
          </Box>
        </Box>
        {filteredData?.fixedAmount ? (
          <Box className={classes.viewDetailModalList}>
            <Box className={classes.viewDetailModalCircle}></Box>
            <Box className={classes.viewDetailModalListItem}>
              <Typography variant="body2" className={classes.viewDetailModalListTitle}>
                {t('obx.contracts.flatRateApplied')}
              </Typography>
              <Typography variant="body3" className={classes.viewDetailModalListText}>
                {t('obx.contracts.dollarSign')}
                {filteredData?.fixedAmount || NA}
              </Typography>
            </Box>
          </Box>
        ) : null}
        <Box className={classes.viewDetailModalList}>
          <Box className={classes.viewDetailModalCircle}></Box>
          <Box className={classes.viewDetailModalListItem}>
            <Typography variant="body2" className={classes.viewDetailModalListTitle}>
              {t('obx.contracts.billingStartDate')}
            </Typography>
            <Typography variant="body3" className={classes.viewDetailModalListText}>
              {filteredData?.startDate
                ? formatDayjsDateTime({
                    value: filteredData?.startDate,
                    formatType: dayjsFormatsEnum.date,
                  })
                : NA}
            </Typography>
          </Box>
        </Box>
        <Box className={classes.viewDetailModalList}>
          <Box className={classes.viewDetailModalCircle}></Box>
          <Box className={classes.viewDetailModalListItem}>
            <Typography variant="body2" className={classes.viewDetailModalListTitle}>
              {t('obx.contracts.paymentsTerms')}
            </Typography>
            <Typography variant="body3" className={classes.viewDetailModalListText}>
              {filteredData?.paymentTerm || NA}
            </Typography>
          </Box>
        </Box>
        <Box className={classes.viewDetailModalList}>
          <Box className={classes.viewDetailModalCircle}></Box>
          <Box className={classes.viewDetailModalListItem}>
            <Typography variant="body2" className={classes.viewDetailModalListTitle}>
              {t('obx.contracts.billingEndDate')}
            </Typography>
            <Typography variant="body3" className={classes.viewDetailModalListText}>
              {filteredData?.endDate
                ? formatDayjsDateTime({
                    value: filteredData?.endDate,
                    formatType: dayjsFormatsEnum.date,
                  })
                : NA}
            </Typography>
          </Box>
        </Box>
        <Box className={classes.viewDetailModalList}>
          <Box className={classes.viewDetailModalCircle}></Box>
          <Box className={classes.viewDetailModalListItem}>
            <Typography variant="body2" className={classes.viewDetailModalListTitle}>
              {t('obx.contracts.nextInvoiceDate')}
            </Typography>
            <Typography variant="body3" className={classes.viewDetailModalListText}>
              {filteredData?.nextInvoiceDate
                ? formatDayjsDateTime({
                    value: filteredData?.nextInvoiceDate,
                    formatType: dayjsFormatsEnum.date,
                    bypassFranchiseTimezone: true,
                  })
                : NA}
            </Typography>
          </Box>
        </Box>
        <Box className={classes.viewDetailModalList}>
          <Box className={classes.viewDetailModalCircle}></Box>
          <Box className={classes.viewDetailModalListItem}>
            <Typography variant="body2" className={classes.viewDetailModalListTitle}>
              {filteredData?.holidayRateType === HOLIDAY_RATE_TYPES.FLAT_RATE
                ? t('obx.sites.createSite.billingOptions.flatRate')
                : t('obx.contracts.holidayMultiplier')}
            </Typography>
            <Typography variant="body3" className={classes.viewDetailModalListText}>
              {filteredData?.holidayMultiplier || NA}
            </Typography>
          </Box>
        </Box>
        <Box className={classes.viewDetailModalList}>
          <Box className={classes.viewDetailModalCircle}></Box>
          <Box className={classes.viewDetailModalListItem}>
            <Typography variant="body2" className={classes.viewDetailModalListTitle}>
              {t('obx.contracts.holidayGroup')}
            </Typography>
            <Typography variant="body3" className={classes.viewDetailModalListText}>
              {filteredData?.holidayGroup || NA}
            </Typography>
          </Box>
        </Box>
        <Box className={classes.viewDetailModalList}>
          <Box className={classes.viewDetailModalCircle}></Box>
          <Box className={classes.viewDetailModalListItem}>
            <Typography variant="body2" className={classes.viewDetailModalListTitle}>
              {t('obx.contracts.cycleReferenceDate')}
            </Typography>
            <Typography variant="body3" className={classes.viewDetailModalListText}>
              {filteredData?.cycleReferenceDate
                ? formatDayjsDateTime({
                    value: filteredData?.cycleReferenceDate,
                    formatType: dayjsFormatsEnum.date,
                    bypassFranchiseTimezone: true,
                  })
                : NA}
            </Typography>
          </Box>
        </Box>
        {filteredData?.fixedAmount &&
        fuelSurchargeLabel != null &&
        fuelSurchargeLabel !== '' &&
        String(fuelSurchargeLabel).trim() !== NA ? (
          <Box className={classes.viewDetailModalList}>
            <Box className={classes.viewDetailModalCircle}></Box>
            <Box className={classes.viewDetailModalListItem}>
              <Typography variant="body2" className={classes.viewDetailModalListTitle}>
                {t('obx.contracts.fuelSurcharge')}
              </Typography>
              <Typography variant="body3" className={classes.viewDetailModalListText}>
                {fuelSurchargeLabel}
              </Typography>
            </Box>
          </Box>
        ) : null}
      </Box>
    </Box>
  );

  return <ModalComponent open={open} handleClose={onClose} body={viewDetailBody} />;
};

ViewDetailModal.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  data: PropTypes.array,
  id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  fuelSurchargeLabel: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

export default ViewDetailModal;
