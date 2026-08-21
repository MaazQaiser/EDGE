/**
 * Vocabulary for the reconciliation surfaces.
 *
 * Payment state and sync state are two independent axes and users conflate them,
 * so they get visibly different treatments: sync state keeps the existing filled
 * status chips, payment state gets its own column, and discrepancies are outlined
 * chips that always carry a tooltip explaining what the reader should do about it.
 *
 * Keys mirror `stubbedData/mocks/invoice.mock` (`PAYMENT_STATE`, `DISCREPANCY`).
 */

/**
 * Money for the reconciliation surfaces. Grouped thousands (these are totals
 * people read at a glance) and the sign outside the symbol — "-$1,296.00", not
 * "$-1,296.00".
 */
export const formatMoney = (currency, value) => {
  const amount = Number(value || 0);
  const formatted = Math.abs(amount).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${amount < 0 ? '-' : ''}${currency}${formatted}`;
};

/**
 * Money inside a table cell, where the column header already carries the currency.
 * Grouped thousands so magnitudes are comparable down the column, and negatives in
 * parentheses — the accounting convention every finance reader already has, and a
 * good deal clearer than appending the word "credit" to a positive-looking number.
 * Pair with a right-aligned cell: unaligned decimals cannot be compared by eye.
 */
export const formatAmount = (value) =>
  Number(value || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export const formatSignedAmount = (value) => {
  const amount = Number(value || 0);
  return amount < 0 ? `(${formatAmount(Math.abs(amount))})` : formatAmount(amount);
};

export const PAYMENT_STATE = {
  unpaid: 'unpaid',
  partial: 'partial',
  paid: 'paid',
  overpaid: 'overpaid',
  credit: 'credit',
};

export const DISCREPANCY = {
  shortPaid: 'shortPaid',
  overpaid: 'overpaid',
  unpaidOverdue: 'unpaidOverdue',
  paidLate: 'paidLate',
  notIssued: 'notIssued',
};

export const AGING_BUCKET = {
  current: 'current',
  d1_30: 'd1_30',
  d31_60: 'd31_60',
  d61_90: 'd61_90',
  d90_plus: 'd90_plus',
};

export const PAYMENT_STATE_META = (t) => ({
  [PAYMENT_STATE.unpaid]: { label: t('obx.invoice.paymentStates.unpaid'), color: 'default' },
  [PAYMENT_STATE.partial]: { label: t('obx.invoice.paymentStates.partial'), color: 'warning' },
  [PAYMENT_STATE.paid]: { label: t('obx.invoice.paymentStates.paid'), color: 'success' },
  [PAYMENT_STATE.overpaid]: { label: t('obx.invoice.paymentStates.overpaid'), color: 'info' },
  [PAYMENT_STATE.credit]: { label: t('obx.invoice.paymentStates.credit'), color: 'info' },
});

export const DISCREPANCY_META = (t) => ({
  [DISCREPANCY.shortPaid]: {
    label: t('obx.invoice.discrepancies.shortPaid.label'),
    description: t('obx.invoice.discrepancies.shortPaid.description'),
    color: 'warning',
  },
  [DISCREPANCY.overpaid]: {
    label: t('obx.invoice.discrepancies.overpaid.label'),
    description: t('obx.invoice.discrepancies.overpaid.description'),
    color: 'info',
  },
  [DISCREPANCY.unpaidOverdue]: {
    label: t('obx.invoice.discrepancies.unpaidOverdue.label'),
    description: t('obx.invoice.discrepancies.unpaidOverdue.description'),
    color: 'error',
  },
  [DISCREPANCY.paidLate]: {
    label: t('obx.invoice.discrepancies.paidLate.label'),
    description: t('obx.invoice.discrepancies.paidLate.description'),
    color: 'default',
  },
  [DISCREPANCY.notIssued]: {
    label: t('obx.invoice.discrepancies.notIssued.label'),
    description: t('obx.invoice.discrepancies.notIssued.description'),
    color: 'error',
  },
});

export const AGING_META = (t) => ({
  [AGING_BUCKET.current]: { label: t('obx.invoice.aging.current'), tone: 'neutral' },
  [AGING_BUCKET.d1_30]: { label: t('obx.invoice.aging.d1_30'), tone: 'watch' },
  [AGING_BUCKET.d31_60]: { label: t('obx.invoice.aging.d31_60'), tone: 'watch' },
  [AGING_BUCKET.d61_90]: { label: t('obx.invoice.aging.d61_90'), tone: 'risk' },
  [AGING_BUCKET.d90_plus]: { label: t('obx.invoice.aging.d90_plus'), tone: 'risk' },
});

/*
 * Payment state is a dropdown in the All Invoices filter row (`paymentStateFilter`
 * in `invoices/index.jsx`), sitting with the other scope filters and moving the
 * summary with it. It replaced a row of counted pills: the counts read well, but a
 * second row of controls that filtered rows *without* moving the figures above them
 * needed a line of prose underneath to explain itself, and four of the five
 * "exception" pills beside it were restatements of the payment state or the sync
 * status. `paidLate` is the one that is not, and it survives as a chip in the
 * Payment column.
 */
