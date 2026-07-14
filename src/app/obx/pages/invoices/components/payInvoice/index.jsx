import { Box } from '@mui/material';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ResponsiveDatePickers from 'src/app/components/common/datePicker';
import ModalComponent from 'src/app/components/common/modal';
import CustomRadioGroup from 'src/app/components/common/templates/customRadioGroup';
import { calculateGrandAmount } from 'src/helper/utilityFunctions';
import { useCurrency } from 'src/hooks/useCurrency.jsx';
import joiValidate from 'src/utils/formValidator/formValidator.requiredCheck';

import { useStyles } from './payInvoiceStyles';

const PAYMENT_METHODS = {
  CASH: 'cash',
  CHECK: 'check',
};

const PayInvoice = ({ open, onClose, onPayNow, invoice }) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const { currency } = useCurrency();

  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS.CASH);
  const [receivingDate, setReceivingDate] = useState(dayjs());
  const [checkNumber, setCheckNumber] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!open) {
      setPaymentMethod(PAYMENT_METHODS.CASH);
      setReceivingDate(dayjs());
      setCheckNumber('');
      setErrors({});
    }
  }, [open]);

  const handlePaymentMethodChange = (e) => {
    const next = e.target.value;
    setPaymentMethod(next);
    if (next !== PAYMENT_METHODS.CHECK) {
      setCheckNumber('');
      setErrors({});
    }
  };

  const handleCheckNumberChange = (e) => {
    setCheckNumber(e.target.value.replace(/[^0-9]/g, ''));
    if (errors.checkNumber) {
      setErrors((prev) => ({ ...prev, checkNumber: undefined }));
    }
  };

  const handleCashCheckPay = async () => {
    if (paymentMethod === PAYMENT_METHODS.CHECK) {
      const validationErrors = await joiValidate({ checkNumber }, t);
      if (validationErrors && Object.keys(validationErrors).length) {
        setErrors(validationErrors);
        return;
      }
    }

    const payload = {
      paymentMethod,
      paymentDate: receivingDate?.toISOString(),
      ...(paymentMethod === PAYMENT_METHODS.CHECK && { checkNumber: Number(checkNumber) }),
    };

    onPayNow?.(payload);
  };

  const amountValue =
    invoice?.lineItemsTotal != null
      ? `${currency}${calculateGrandAmount(invoice.lineItemsTotal, invoice?.discount, invoice?.taxAmount)}`
      : '';

  const radioOptions = [
    { id: PAYMENT_METHODS.CASH, optionText: t('obx.invoice.cash') },
    { id: PAYMENT_METHODS.CHECK, optionText: t('obx.invoice.check') },
  ];

  const body = (
    <Box className={classes.payModal}>
      <Typography variant="h3" className={classes.payModalTitle}>
        {t('obx.invoice.payInvoice')}
      </Typography>
      <Typography variant="body2" className={classes.payModalSubtext}>
        {t('obx.invoice.paymentDetailsText')}
      </Typography>

      <Typography className={classes.sectionLabel}>
        {t('obx.invoice.selectPaymentMethod')}
      </Typography>
      <Box className={classes.radioGroupWrapper}>
        <CustomRadioGroup
          options={radioOptions}
          label=""
          value={paymentMethod}
          handleChange={handlePaymentMethodChange}
        />
      </Box>

      <Box className={classes.fieldRow}>
        <Typography className={classes.fieldLabel}>{t('obx.invoice.amountPaid')}</Typography>
        <TextField
          className={classes.fieldInput}
          value={amountValue}
          placeholder={amountValue}
          disabled
          InputProps={{ readOnly: true }}
        />
      </Box>

      {paymentMethod === PAYMENT_METHODS.CHECK && (
        <Box className={classes.fieldRow}>
          <Typography className={classes.fieldLabel}>{t('obx.invoice.enterCheckNo')}</Typography>
          <TextField
            className={classes.fieldInput}
            name="checkNumber"
            value={checkNumber}
            onChange={handleCheckNumberChange}
            error={!!errors.checkNumber}
            helperText={errors?.checkNumber || null}
            inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
          />
        </Box>
      )}

      <Box className={classes.fieldRow}>
        <Typography className={classes.fieldLabel}>{t('obx.invoice.receivingDate')}</Typography>
        <Box className={classes.fieldInput}>
          <ResponsiveDatePickers
            value={receivingDate}
            onChange={(d) => setReceivingDate(d)}
            format="MM/DD/YYYY"
            placeholder="MM/DD/YYYY"
          />
        </Box>
      </Box>

      <Box className={classes.divider} />

      <Box className={classes.payModalActions}>
        <Button variant="secondaryGrey" onClick={onClose}>
          {t('obx.invoice.cancel')}
        </Button>
        <Button variant="primary" onClick={handleCashCheckPay}>
          {t('obx.invoice.payNow')}
        </Button>
      </Box>
    </Box>
  );

  return <ModalComponent open={open} handleClose={onClose} body={body} />;
};

PayInvoice.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  onPayNow: PropTypes.func,
  invoice: PropTypes.object,
};

export default PayInvoice;
