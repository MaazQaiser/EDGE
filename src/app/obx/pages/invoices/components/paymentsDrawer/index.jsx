import { Box, Button, Chip, TextField, Tooltip, Typography } from '@mui/material';
import { ReactComponent as CloseIcon } from 'assets/svg/close.svg?react';
import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CustomDropDown from 'src/app/components/common/customDropDown';
import ResponsiveDatePickers from 'src/app/components/common/datePicker';
import { ReactComponent as DustinBinIcon } from 'src/assets/svg/DustinBinIcon.svg?react';
import { useCurrency } from 'src/hooks/useCurrency.jsx';
import {
  getInvoicePayments,
  markInvoiceAsPaid,
  reversePayment,
} from 'src/services/invoice.services';
import { toastSettings } from 'src/utils/constants';
import { toaster } from 'src/utils/toast';

import { DISCREPANCY_META, formatMoney, PAYMENT_STATE_META } from '../../reconciliation.constants';
import { useStyles } from './paymentsDrawer.styles';

const PAYMENT_METHOD_OPTIONS = (t) => [
  { label: t('obx.invoice.payments.methods.bankTransfer'), value: 'bank_transfer' },
  { label: t('obx.invoice.payments.methods.check'), value: 'check' },
  { label: t('obx.invoice.payments.methods.cash'), value: 'cash' },
  { label: t('obx.invoice.payments.methods.card'), value: 'card' },
];

const emptyForm = {
  amount: '',
  method: {},
  receivedOn: dayjs(),
  reference: '',
};

/**
 * The single place a receipt is recorded, reversed or read back.
 *
 * It replaces the old "Pay Now" modal, which could only ever mark an invoice
 * paid in full for its exact grand total. Everything the reconciliation view
 * needs to be honest about — part payments, overpayments, several receipts
 * against one invoice, and reversing a mis-keyed one — is only expressible here.
 */
const PaymentsDrawer = ({ invoiceId, onClose, onSaved, readOnly }) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const { currency } = useCurrency();

  const [invoice, setInvoice] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});

  const money = (value) => formatMoney(currency, value);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await getInvoicePayments(invoiceId);
      if (response?.statusCode === 200) {
        setInvoice(response?.data?.invoice || null);
        setPayments(response?.data?.payments || []);
      }
    } catch (error) {
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (invoiceId) fetchPayments();
  }, [invoiceId]);

  // Default the amount to whatever is still owed — the common case is settling
  // the balance, and pre-filling it keeps part payments a deliberate edit.
  useEffect(() => {
    if (invoice?.balanceDue > 0) {
      setForm((prev) => ({ ...prev, amount: String(invoice.balanceDue.toFixed(2)) }));
    }
  }, [invoice?.balanceDue]);

  const amountNumber = Number(form.amount);
  const isOverpayment = invoice && amountNumber > invoice.balanceDue + 0.005;
  const flags = invoice?.flags || [];

  const paymentTotal = useMemo(
    () => payments.reduce((sum, payment) => sum + (payment.amount || 0), 0),
    [payments],
  );

  const handleRecord = async () => {
    const nextErrors = {};
    if (!form.amount || Number.isNaN(amountNumber) || amountNumber === 0) {
      nextErrors.amount = t('obx.invoice.payments.amountRequired');
    }
    if (!form.method?.value) {
      nextErrors.method = t('obx.invoice.payments.methodRequired');
    }
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    try {
      setSaving(true);
      const response = await markInvoiceAsPaid(invoiceId, {
        amount: amountNumber,
        paymentMethod: form.method.value,
        paymentDate: form.receivedOn?.toISOString(),
        reference: form.reference,
      });
      if (response?.statusCode === 200) {
        toaster.success({
          text: response?.message,
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
        setForm(emptyForm);
        setErrors({});
        await fetchPayments();
        onSaved?.();
      }
    } catch (error) {
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleReverse = async (paymentId) => {
    try {
      const response = await reversePayment(paymentId);
      if (response?.statusCode === 200) {
        toaster.success({
          text: response?.message,
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
        await fetchPayments();
        onSaved?.();
      }
    } catch (error) {
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };

  const stateMeta = PAYMENT_STATE_META(t)[invoice?.paymentState];

  return (
    <Box className={classes.drawerWrapper}>
      <Box className={classes.drawerHeader}>
        <Box>
          <Typography variant="h3" className={classes.headerTitle}>
            {t('obx.invoice.payments.title')}
          </Typography>
          <Typography variant="body2" className={classes.headerMeta}>
            {loading
              ? t('obx.invoice.payments.loading')
              : `${invoice?.invoiceNumber} · ${invoice?.siteName}`}
          </Typography>
        </Box>
        <Button disableRipple variant="text" className={classes.closeBtn} onClick={onClose}>
          <CloseIcon />
        </Button>
      </Box>

      <Box className={classes.drawerBody}>
        <Box className={classes.moneyRow}>
          <Box className={classes.moneyTile}>
            <Typography variant="body3" className={classes.moneyTileLabel}>
              {t('obx.invoice.payments.invoiced')}
            </Typography>
            <Typography variant="h3" className={classes.moneyTileValue}>
              {money(invoice?.grandTotal)}
            </Typography>
          </Box>
          <Box className={classes.moneyTile}>
            <Typography variant="body3" className={classes.moneyTileLabel}>
              {t('obx.invoice.payments.received')}
            </Typography>
            <Typography variant="h3" className={classes.moneyTileValue}>
              {money(paymentTotal)}
            </Typography>
          </Box>
          <Box className={classes.moneyTile}>
            <Typography variant="body3" className={classes.moneyTileLabel}>
              {invoice?.balanceDue < 0
                ? t('obx.invoice.payments.creditHeld')
                : t('obx.invoice.payments.balanceDue')}
            </Typography>
            <Typography
              variant="h3"
              className={`${classes.moneyTileValue} ${
                invoice?.balanceDue > 0
                  ? classes.moneyTileValueDue
                  : invoice?.balanceDue < 0
                    ? classes.moneyTileValueCredit
                    : ''
              }`}
            >
              {money(Math.abs(invoice?.balanceDue || 0))}
            </Typography>
          </Box>
        </Box>

        {(stateMeta || flags.length > 0) && (
          <Box className={classes.flagRow}>
            {stateMeta && <Chip size="small" label={stateMeta.label} color={stateMeta.color} />}
            {flags.map((flag) => {
              const meta = DISCREPANCY_META(t)[flag];
              if (!meta) return null;
              return (
                <Tooltip key={flag} title={meta.description} arrow placement="top">
                  <Chip size="small" label={meta.label} color={meta.color} variant="outlined" />
                </Tooltip>
              );
            })}
          </Box>
        )}

        <Box>
          <Typography variant="subtitle1" className={classes.sectionTitle}>
            {t('obx.invoice.payments.ledger')}
          </Typography>
          {payments.length === 0 ? (
            <Box className={classes.emptyLedger}>
              <Typography variant="body2">{t('obx.invoice.payments.noPayments')}</Typography>
            </Box>
          ) : (
            <Box className={classes.ledger}>
              {payments.map((payment) => (
                <Box key={payment.id} className={classes.ledgerRow}>
                  <Typography variant="body2" className={classes.ledgerDate}>
                    {dayjs(payment.receivedOn).format('MM/DD/YYYY')}
                  </Typography>
                  <Box>
                    <Typography variant="body2" className={classes.ledgerMethod}>
                      {payment.method?.replace('_', ' ')}
                    </Typography>
                    {(payment.reference || payment.note) && (
                      <Typography variant="body3" className={classes.ledgerReference}>
                        {[payment.reference, payment.note].filter(Boolean).join(' · ')}
                      </Typography>
                    )}
                  </Box>
                  <Typography variant="body2" className={classes.ledgerAmount}>
                    {money(payment.amount)}
                  </Typography>
                  {!readOnly && (
                    <Tooltip title={t('obx.invoice.payments.reverse')} arrow placement="top">
                      <Button
                        disableRipple
                        variant="text"
                        className={classes.closeBtn}
                        onClick={() => handleReverse(payment.id)}
                        startIcon={<DustinBinIcon />}
                      />
                    </Tooltip>
                  )}
                </Box>
              ))}
            </Box>
          )}
        </Box>

        {!readOnly && (
          <Box className={classes.form}>
            <Typography variant="subtitle1">{t('obx.invoice.payments.record')}</Typography>
            <Box className={classes.formGrid}>
              <Box className={classes.field}>
                <Typography variant="subtitle2">{t('obx.invoice.payments.amount')}</Typography>
                <TextField
                  name="amount"
                  value={form.amount}
                  placeholder="0.00"
                  onChange={(event) => {
                    // Negative values are allowed: a refund out to the customer
                    // is a receipt with the sign flipped.
                    const next = event.target.value.replace(/[^0-9.-]/g, '');
                    setForm((prev) => ({ ...prev, amount: next }));
                    setErrors((prev) => ({ ...prev, amount: undefined }));
                  }}
                  error={!!errors.amount}
                  helperText={errors.amount || null}
                />
                {isOverpayment && (
                  <Typography variant="body3" className={classes.warningText}>
                    {t('obx.invoice.payments.overpaymentWarning', {
                      amount: money(amountNumber - invoice.balanceDue),
                    })}
                  </Typography>
                )}
              </Box>
              <Box className={classes.field}>
                <Typography variant="subtitle2">{t('obx.invoice.payments.method')}</Typography>
                <CustomDropDown
                  label={t('obx.invoice.payments.method')}
                  name="method"
                  placeHolder={t('obx.invoice.payments.selectMethod')}
                  options={PAYMENT_METHOD_OPTIONS(t)}
                  selectedValues={form.method}
                  handleChange={(event) => {
                    setForm((prev) => ({ ...prev, method: event.target.value }));
                    setErrors((prev) => ({ ...prev, method: undefined }));
                  }}
                  bordered
                  isError={!!errors.method}
                />
                {!!errors.method && (
                  <Typography variant="body3" className={classes.warningText}>
                    {errors.method}
                  </Typography>
                )}
              </Box>
              <Box className={classes.field}>
                <Typography variant="subtitle2">{t('obx.invoice.payments.receivedOn')}</Typography>
                <ResponsiveDatePickers
                  format="MM/DD/YYYY"
                  placeholder="MM/DD/YYYY"
                  value={form.receivedOn}
                  onChange={(value) => setForm((prev) => ({ ...prev, receivedOn: value }))}
                />
              </Box>
              <Box className={classes.field}>
                <Typography variant="subtitle2">{t('obx.invoice.payments.reference')}</Typography>
                <TextField
                  name="reference"
                  value={form.reference}
                  placeholder={t('obx.invoice.payments.referencePlaceholder')}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, reference: event.target.value }))
                  }
                />
                <Typography variant="body3" className={classes.helperText}>
                  {t('obx.invoice.payments.referenceHelp')}
                </Typography>
              </Box>
            </Box>
          </Box>
        )}
      </Box>

      <Box className={classes.drawerFooter}>
        <Button variant="secondaryGrey" onClick={onClose}>
          {t('obx.invoice.close')}
        </Button>
        {!readOnly && (
          <Button variant="primary" onClick={handleRecord} disabled={saving || loading}>
            {t('obx.invoice.payments.recordPayment')}
          </Button>
        )}
      </Box>
    </Box>
  );
};

PaymentsDrawer.propTypes = {
  invoiceId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onClose: PropTypes.func,
  onSaved: PropTypes.func,
  readOnly: PropTypes.bool,
};

PaymentsDrawer.defaultProps = {
  onClose: () => {},
  onSaved: () => {},
  readOnly: false,
};

export default PaymentsDrawer;
