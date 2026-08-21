import {
  Box,
  Button,
  Chip,
  Skeleton,
  TableBody,
  TableCell,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import { ReactComponent as ChevronRight } from 'assets/svg/chevron-right.svg?react';
import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import TableComponent from 'src/app/components/common/table/index.jsx';
import { ReactComponent as InfoIcon } from 'src/assets/svg/greyInfoIcon.svg?react';
import { ReactComponent as PayNowIcon } from 'src/assets/svg/pay-now.svg?react';
import { useCurrency } from 'src/hooks/useCurrency.jsx';
import { getOutstandingSummary } from 'src/services/invoice.services';
import { toastSettings } from 'src/utils/constants';
import { toaster } from 'src/utils/toast';

import {
  AGING_BUCKET,
  AGING_META,
  formatMoney,
  formatSignedAmount,
  PAYMENT_STATE_META,
} from '../reconciliation.constants';
import { useStyles } from './outstanding.styles';

const emptySummary = { totals: {}, aging: [], discrepancies: [], customers: [] };

/**
 * The customer queue. Three of the seven columns used to name the same party —
 * customer, customer ID and site — while nothing said how many invoices were behind
 * the balance or how much of it was actually late. These are the five things a
 * collections call is made from: who, how many, how much, how much is late, how
 * late the worst one is.
 *
 * Site is gone from this level on purpose. A customer can be billed for several
 * sites, and this row is a customer; printing the first of them read as fact.
 */
const queueColumns = (t, currency) => [
  { id: 'customer', label: t('obx.invoice.outstanding.customer') },
  { id: 'customerId', label: t('obx.invoice.customerId') },
  { id: 'invoices', label: t('obx.invoice.outstanding.openInvoices'), align: 'right' },
  { id: 'balance', label: `${t('obx.invoice.balanceDue')} (${currency})`, align: 'right' },
  { id: 'overdue', label: `${t('obx.invoice.outstanding.overdue')} (${currency})`, align: 'right' },
  { id: 'oldest', label: t('obx.invoice.outstanding.oldestOverdue'), align: 'right' },
  { id: 'expand', label: '' },
];

/**
 * Title Case, matching every other column label in the module.
 *
 * Money columns carry the currency in the header and the cells carry bare grouped
 * numbers — the convention `formatSignedAmount` was written for, and the one the
 * All Invoices listing follows. `Due Date` and `Due` are two columns for the same
 * reason they are in the listing: one cell holds one field, and "when" and "how
 * late" are two different questions.
 */
const invoiceColumns = (t, currency) => [
  { id: 'invoiceNumber', label: t('obx.invoice.invoiceNumber') },
  { id: 'dueDate', label: t('obx.invoice.dueDate') },
  { id: 'due', label: t('obx.invoice.dueColumn') },
  {
    id: 'invoiced',
    label: `${t('obx.invoice.outstanding.invoiced')} (${currency})`,
    align: 'right',
  },
  {
    id: 'received',
    label: `${t('obx.invoice.outstanding.received')} (${currency})`,
    align: 'right',
  },
  { id: 'balance', label: `${t('obx.invoice.balanceDue')} (${currency})`, align: 'right' },
  { id: 'payment', label: t('obx.invoice.paymentStates.column') },
  { id: 'action', label: '' },
];

/**
 * The Outstanding tab: where the money stands **today**, across every invoice
 * regardless of when it was raised. Its counterpart is the All Invoices tab, which
 * is always scoped to a period — position vs activity, one tab apart.
 *
 * Two strips of equal, hairline-divided cells, in the app's dashboard idiom: the
 * position on top, and the same balance broken down by age below it. The second
 * strip is also the filter — the bands *are* the controls, so there is no separate
 * legend to keep in sync with them.
 *
 * The exception legend that used to sit under them is gone, and so is the
 * "Needs Attention" column it fed. Of its four classes, "Never issued" repeated
 * the sync status, "Short paid" repeated the Part paid chip, "Overpaid" repeated
 * Credits Held, and "Paid late" described settled invoices — which, being settled,
 * are not in this queue at all, so filtering by it emptied the table while the
 * legend beside it claimed two. None of the four told a reader anything about the
 * money they are owed. The classes are all still in the model and the All Invoices
 * tab still shows "Paid late" per invoice, where it means something.
 */
const Outstanding = ({ onOpenInvoice, onOpenPayments, refreshKey }) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const { currency } = useCurrency();

  const [summary, setSummary] = useState(emptySummary);
  const [loading, setLoading] = useState(true);
  const [activeBucket, setActiveBucket] = useState(null);

  const [expanded, setExpanded] = useState([]);

  /** Standalone figures — the two strips — where no header carries the symbol. */
  const money = (value) => formatMoney(currency, value);
  /** Table cells, where the column header already carries the symbol. */
  const amount = (value) => formatSignedAmount(value);

  const fetchSummary = async () => {
    try {
      setLoading(true);
      const response = await getOutstandingSummary({});
      if (response?.statusCode === 200) setSummary(response?.data || emptySummary);
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
    fetchSummary();
  }, [refreshKey]);

  const { totals, aging, customers } = summary;
  const columns = queueColumns(t, currency);
  const innerColumns = invoiceColumns(t, currency);
  const agingMeta = AGING_META(t);
  const paymentStateMeta = PAYMENT_STATE_META(t);

  const markerTone = {
    neutral: classes.markerNeutral,
    watch: classes.markerWarning,
    risk: classes.markerAlert,
  };

  // Only invoices with a balance owing count, which is the same guard the aging
  // strip applies. Counting every row instead read "24 open invoices" beside bands
  // summing to 22, because a credit note carries a negative balance and is not
  // money owed.
  const owing = (invoice) => (Number(invoice.balanceDue) || 0) > 0;
  const lateBuckets = aging.filter((bucket) => bucket.key !== AGING_BUCKET.current);
  const overdueCount = lateBuckets.reduce((total, bucket) => total + bucket.count, 0);
  const oldestDaysLate = customers.reduce(
    (worst, customer) => Math.max(worst, customer.oldestDaysOverdue || 0),
    0,
  );
  const creditCustomers = customers.filter((customer) => (customer.credits || 0) > 0).length;

  /**
   * A customer row describes the invoices under it, not the customer's whole
   * ledger. With a band applied those are two different numbers, and showing the
   * whole ledger put a $30,542.40 balance on a row whose one visible invoice was
   * $11,502.00 — with the line above saying $11,502.00. Unfiltered, every invoice
   * is visible and the two are the same figure.
   */
  const rowFigures = (invoices) => {
    const open = invoices.filter(owing);
    return {
      count: open.length,
      balance: open.reduce((total, invoice) => total + Number(invoice.balanceDue), 0),
      overdue: open
        .filter((invoice) => invoice.daysOverdue > 0)
        .reduce((total, invoice) => total + Number(invoice.balanceDue), 0),
      oldest: open.reduce((worst, invoice) => Math.max(worst, invoice.daysOverdue || 0), 0),
    };
  };

  // Filtering runs over the summary already returned: the strips have to keep
  // describing the whole book while the queue narrows.
  const visibleCustomers = customers
    .map((customer) => ({
      ...customer,
      visibleInvoices: customer.invoices.filter(
        (invoice) => !activeBucket || invoice.agingBucket === activeBucket,
      ),
    }))
    .filter((customer) => customer.visibleInvoices.length > 0);

  const isFiltered = !!activeBucket;
  const visible = visibleCustomers.map((customer) => rowFigures(customer.visibleInvoices));
  const visibleInvoiceCount = visible.reduce((total, figures) => total + figures.count, 0);
  const visibleBalance = visible.reduce((total, figures) => total + figures.balance, 0);

  const toggleExpanded = (customerId) =>
    setExpanded((prev) =>
      prev.includes(customerId) ? prev.filter((id) => id !== customerId) : [...prev, customerId],
    );

  const clearFilters = () => setActiveBucket(null);

  const stat = ({ dotClass, label, value, valueClass, hint, hintTitle }) => (
    <Box className={classes.stat}>
      <Box className={classes.statHead}>
        <Box className={`${classes.statDot} ${dotClass}`} />
        <Typography variant="subtitle2" className={classes.statLabel}>
          {label}
        </Typography>
        {hintTitle && (
          <Tooltip arrow placement="top" title={hintTitle}>
            <Box component="span" className={classes.statInfo} aria-label={hintTitle} role="img">
              <InfoIcon />
            </Box>
          </Tooltip>
        )}
      </Box>
      <Typography variant="h3" className={`${classes.statValue} ${valueClass || ''}`}>
        {value}
      </Typography>
      <Typography variant="body3" className={classes.statHint}>
        {hint}
      </Typography>
    </Box>
  );

  /**
   * An aging band, in the same three lines as the stat cells above it — marker and
   * label, the figure, the count — because it is the same kind of object: part of
   * the balance. It is also the filter, so it is a real button with a pressed
   * state, and a band holding nothing is dimmed *and* disabled rather than being a
   * dead end the reader can see is empty before clicking it.
   */
  const band = (bucket) => {
    const meta = agingMeta[bucket.key] || { label: bucket.label, tone: 'neutral' };
    const active = activeBucket === bucket.key;
    const empty = bucket.count === 0;
    return (
      <Box
        key={bucket.key}
        component="button"
        type="button"
        aria-pressed={active}
        disabled={empty}
        className={`${classes.band} ${active ? classes.bandActive : ''} ${
          empty ? classes.bandEmpty : ''
        }`}
        onClick={() => setActiveBucket(active ? null : bucket.key)}
      >
        <Box className={classes.bandHead}>
          <Box component="span" className={`${classes.bandMarker} ${markerTone[meta.tone]}`} />
          <Typography variant="body3" className={classes.bandLabel}>
            {meta.label}
          </Typography>
        </Box>
        <Typography variant="subtitle1" className={classes.bandValue}>
          {money(bucket.amount)}
        </Typography>
        <Typography variant="body3" className={classes.bandCount}>
          {t('obx.invoice.outstanding.invoiceCount', { count: bucket.count })}
        </Typography>
      </Box>
    );
  };

  /** "in 12 days" / "44 days late", as the listing renders it. */
  const dueRelative = (days) => {
    if (days > 0) {
      return (
        <Typography variant="body2" className={classes.alertText}>
          {t('obx.invoice.dueRelative.daysLate', { count: days })}
        </Typography>
      );
    }
    if (days === 0) {
      return (
        <Typography variant="body2" className={classes.alertText}>
          {t('obx.invoice.dueRelative.today')}
        </Typography>
      );
    }
    return (
      <Typography variant="body2" className={classes.mutedText}>
        {t('obx.invoice.dueRelative.inDays', { count: Math.abs(days) })}
      </Typography>
    );
  };

  const headRow = (cols) => (
    <TableRow>
      {cols.map((column) => (
        <TableCell key={column.id} align={column.align || 'inherit'}>
          {column.label}
        </TableCell>
      ))}
    </TableRow>
  );

  // Nested table, the same shape payroll uses for its inner listing. Single-line
  // cells, one field each — no stacked text, so the 48px row height holds.
  const invoiceTable = (customer) => (
    <TableComponent
      data={customer.visibleInvoices}
      columns={innerColumns}
      classNameTable={classes.innerTable}
      tableHead={() => headRow(innerColumns)}
      hasTBody
      pagination={false}
      tableBody={() => (
        <TableBody>
          {customer.visibleInvoices.map((invoice) => {
            const stateMeta = paymentStateMeta[invoice.paymentState];
            return (
              <TableRow key={invoice.id}>
                <TableCell>
                  <Button
                    variant="onlyText"
                    disableRipple
                    className={classes.invoiceLink}
                    onClick={() => onOpenInvoice?.(invoice)}
                  >
                    {invoice.invoiceNumber}
                  </Button>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" className={classes.mutedText}>
                    {dayjs(invoice.dueDate).format('MM/DD/YYYY')}
                  </Typography>
                </TableCell>
                <TableCell>{dueRelative(Number(invoice.daysOverdue || 0))}</TableCell>
                <TableCell className={classes.numericCell}>{amount(invoice.grandTotal)}</TableCell>
                <TableCell className={classes.numericCell}>{amount(invoice.amountPaid)}</TableCell>
                <TableCell className={classes.numericCell}>
                  <Typography variant="subtitle2" className={classes.strongText}>
                    {amount(invoice.balanceDue)}
                  </Typography>
                </TableCell>
                <TableCell>
                  {stateMeta && (
                    <Chip size="small" color={stateMeta.color} label={stateMeta.label} />
                  )}
                </TableCell>
                <TableCell align="right">
                  <Tooltip title={t('obx.invoice.payments.viewPayments')} arrow placement="top">
                    <Button
                      disableRipple
                      variant="text"
                      className={classes.iconAction}
                      startIcon={<PayNowIcon />}
                      onClick={() => onOpenPayments?.(invoice)}
                    />
                  </Tooltip>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      )}
    />
  );

  const queueBody = () => (
    <TableBody>
      {visibleCustomers.length === 0 && (
        <TableRow>
          <TableCell colSpan={columns.length}>
            <Box className={classes.emptyState}>
              <Typography variant="subtitle1">
                {isFiltered
                  ? t('obx.invoice.outstanding.noMatchTitle')
                  : t('obx.invoice.outstanding.emptyTitle')}
              </Typography>
              <Typography variant="body2" className={classes.emptyBody}>
                {isFiltered
                  ? t('obx.invoice.outstanding.noMatchBody')
                  : t('obx.invoice.outstanding.emptyBody')}
              </Typography>
              {isFiltered && (
                <Button variant="onlyText" disableRipple onClick={clearFilters}>
                  {t('obx.invoice.outstanding.clearFilters')}
                </Button>
              )}
            </Box>
          </TableCell>
        </TableRow>
      )}

      {visibleCustomers.map((customer) => {
        const isOpen = expanded.includes(customer.customerId);
        const figures = rowFigures(customer.visibleInvoices);
        return (
          <React.Fragment key={customer.customerId}>
            <TableRow
              className={classes.customerRow}
              onClick={() => toggleExpanded(customer.customerId)}
            >
              <TableCell>{customer.clientName}</TableCell>
              <TableCell>{customer.customerId}</TableCell>
              <TableCell className={classes.numericCell}>{figures.count}</TableCell>
              <TableCell className={classes.numericCell}>
                <Typography variant="subtitle2" className={classes.strongText}>
                  {amount(figures.balance)}
                </Typography>
              </TableCell>
              {/* One red figure per row. The balance is just money owed; what is
                  late is the part anyone acts on, so it is the part that is red. */}
              <TableCell className={classes.numericCell}>
                {figures.overdue > 0 ? (
                  <Typography variant="subtitle2" className={classes.alertText}>
                    {amount(figures.overdue)}
                  </Typography>
                ) : (
                  <Typography variant="body2" className={classes.mutedText}>
                    —
                  </Typography>
                )}
              </TableCell>
              <TableCell className={classes.numericCell}>
                <Typography variant="body2" className={classes.mutedText}>
                  {figures.oldest > 0
                    ? t('obx.invoice.dueRelative.daysLate', { count: figures.oldest })
                    : '—'}
                </Typography>
              </TableCell>
              <TableCell align="right">
                <Button
                  disableRipple
                  variant="text"
                  className={classes.expandButton}
                  aria-expanded={isOpen}
                  aria-controls={`outstanding-invoices-${customer.customerId}`}
                  aria-label={t(
                    isOpen
                      ? 'obx.invoice.outstanding.hideInvoicesFor'
                      : 'obx.invoice.outstanding.showInvoicesFor',
                    { customer: customer.clientName },
                  )}
                  onClick={(event) => {
                    // The row's own onClick would toggle a second time.
                    event.stopPropagation();
                    toggleExpanded(customer.customerId);
                  }}
                >
                  <Box className={`${classes.chevron} ${isOpen ? classes.chevronOpen : ''}`}>
                    <ChevronRight />
                  </Box>
                </Button>
              </TableCell>
            </TableRow>

            {isOpen && (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className={classes.expansionCell}
                  id={`outstanding-invoices-${customer.customerId}`}
                >
                  {invoiceTable(customer)}
                </TableCell>
              </TableRow>
            )}
          </React.Fragment>
        );
      })}
    </TableBody>
  );

  if (loading) {
    return (
      <Box className={classes.wrapper}>
        <Box className={classes.skeletonStack}>
          <Skeleton variant="rectangular" height={76} />
          <Skeleton variant="rectangular" height={68} />
          <Skeleton variant="rectangular" height={320} />
        </Box>
      </Box>
    );
  }

  return (
    <Box className={classes.wrapper}>
      {/* The position: what we are owed, how much of it is late, and what we owe
          back. Three peers — no figure here is a slice of another except overdue,
          which the strip below breaks out in full. */}
      <Box className={classes.statStrip}>
        {stat({
          dotClass: classes.dotBrand,
          label: t('obx.invoice.outstanding.youAreOwed'),
          value: money(totals.outstanding),
          hint: `${t('obx.invoice.outstanding.openInvoiceCount', {
            count: totals.openInvoiceCount || 0,
          })} · ${t('obx.invoice.outstanding.customerCount', {
            count: totals.customerCount || 0,
          })}`,
        })}
        {stat({
          dotClass: classes.dotAlert,
          label: t('obx.invoice.outstanding.overdue'),
          value: money(totals.overdueOutstanding),
          valueClass: overdueCount > 0 ? classes.statValueAlert : '',
          hint:
            overdueCount > 0
              ? t('obx.invoice.outstanding.overdueHint', {
                  count: overdueCount,
                  days: oldestDaysLate,
                })
              : t('obx.invoice.outstanding.nothingOverdue'),
        })}
        {stat({
          dotClass: classes.dotWarning,
          label: t('obx.invoice.outstanding.creditsHeld'),
          value: money(totals.creditsOnAccount),
          hint: t('obx.invoice.outstanding.creditsOwedBack', { count: creditCustomers }),
          hintTitle: t('obx.invoice.outstanding.creditsHint'),
        })}
      </Box>

      {/* The same balance by age. The bands are the filter — a legend that only
          described them would be a second thing to keep in step with them. */}
      <Box className={classes.bandStrip}>{aging.map(band)}</Box>

      {/* Only while a band is applied. The strips above deliberately keep describing
          the whole book, so something has to say how much of it is on screen —
          without it, "90+ days late" left a $115,737.12 headline over two rows
          holding $11,502.00 and nothing bridging the two. */}
      {isFiltered && visibleCustomers.length > 0 && (
        <Box className={classes.countRow}>
          <Typography variant="body3" className={classes.countText}>
            {t('obx.invoice.outstanding.queueFiltered', {
              shown: visibleCustomers.length,
              count: customers.length,
            })}
            {' · '}
            <Box component="span" className={classes.countStrong}>
              {money(visibleBalance)}
            </Box>{' '}
            {t('obx.invoice.outstanding.inSelection', { count: visibleInvoiceCount })}
          </Typography>
          <Button variant="onlyText" disableRipple onClick={clearFilters}>
            {t('obx.invoice.outstanding.clearFilters')}
          </Button>
        </Box>
      )}

      <TableComponent
        data={visibleCustomers}
        columns={columns}
        tableHead={() => headRow(columns)}
        tableBody={queueBody}
        hasTBody
        pagination={false}
      />
    </Box>
  );
};

Outstanding.propTypes = {
  onOpenInvoice: PropTypes.func,
  onOpenPayments: PropTypes.func,
  refreshKey: PropTypes.number,
};

Outstanding.defaultProps = {
  onOpenInvoice: () => {},
  onOpenPayments: () => {},
  refreshKey: 0,
};

export default Outstanding;
