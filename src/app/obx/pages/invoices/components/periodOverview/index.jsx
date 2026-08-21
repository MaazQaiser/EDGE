import { Box, Button, Skeleton, Typography } from '@mui/material';
import DateRangePicker from 'commonComponents/RangeDatepicker';
import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CustomDropDown from 'src/app/components/common/customDropDown';
import SearchComponentWithQuery from 'src/app/components/common/searchWithQuery/index.jsx';
import { useCurrency } from 'src/hooks/useCurrency.jsx';
import { getPeriodReconciliation } from 'src/services/invoice.services';
import transformArrayForOptions from 'src/utils/array/transformArrayForOptions';
import { toastSettings } from 'src/utils/constants';
import { toaster } from 'src/utils/toast';

import { formatMoney } from '../../reconciliation.constants';
import { useStyles } from './periodOverview.styles';

const API_DATE = 'YYYY-MM-DD';

/**
 * The default is **this month**: the question "how are we doing" is nearly always
 * asked about the month in progress, and a default of "everything ever" makes the
 * numbers meaningless as a period read.
 */
export const PERIOD_PRESETS = [
  { key: 'thisMonth', range: () => [dayjs().startOf('month'), dayjs()] },
  {
    key: 'lastMonth',
    range: () => [
      dayjs().subtract(1, 'month').startOf('month'),
      dayjs().subtract(1, 'month').endOf('month'),
    ],
  },
  { key: 'lastQuarter', range: () => [dayjs().subtract(3, 'month').startOf('month'), dayjs()] },
  { key: 'yearToDate', range: () => [dayjs().startOf('year'), dayjs()] },
];

export const defaultPeriod = () => PERIOD_PRESETS[0].range();

/** The aging split, as the two things a reader does something about. */
export const AGING_SPLIT = { notYetDue: 'notYetDue', overdue: 'overdue' };

/**
 * The summary and filter card above the invoice listing.
 *
 * **The one rule: the numbers describe exactly the rows in the table.** That is why
 * this card owns the filters as well as the figures — a filter bar somewhere else
 * would be a second scope, and a second scope is how you end up with totals for
 * nine invoices above a table showing none. The card is handed the same query the
 * listing fetches with (`summaryQuery`), so the two cannot drift apart by
 * construction rather than by discipline. Every control in the row below the strip
 * moves the figures with it — including payment state, which is why it is a
 * dropdown alongside its peers rather than a second, differently-behaved row of
 * counts.
 *
 * **Four figures, one story, one shape.** Billed, Received, Not yet due and Overdue
 * all describe the same invoices as of today, and they close:
 * `billed − received = notYetDue + overdue` (less any surplus held). Each cell is
 * the same three lines — marker and label, the figure, one qualifying line — so the
 * strip can be read across without re-learning its layout in every cell.
 *
 * The last two cells are also the aging filter. They are the only control that
 * narrows the table without moving the figures above it, because the reader clicked
 * one of those figures to get there and needs it to stay put; the pressed cell says
 * so on its own, without a line of prose underneath.
 */
const PeriodOverview = ({
  period,
  onPeriodChange,
  summaryQuery,
  agingSplit,
  onAgingSplitChange,
  refreshKey,
  filters,
  onFilterChange,
  onClearAll,
  searchResetKey,
  sites,
  sitesPagination,
  sitesLoader,
  fetchSites,
  paymentOptions,
  statusOptions,
  typeOptions,
  appliedScopeCount,
  selectedCount,
  onBulkApprove,
  onClearSelection,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const { currency } = useCurrency();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showRange, setShowRange] = useState(false);

  const money = (value) => formatMoney(currency, value);
  const [from, to] = period || [];
  const hasRange = !!(from && to);

  // The summary is fetched with the listing's own query, so "describes the rows on
  // screen" is structural. Serialised for the dependency list because it is rebuilt
  // on every render upstream.
  const queryKey = JSON.stringify(summaryQuery || {});

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        setLoading(true);
        const response = await getPeriodReconciliation(summaryQuery || {});
        if (!cancelled && response?.statusCode === 200) setData(response?.data || null);
      } catch (error) {
        if (!cancelled) {
          toaster.error({
            text: error?.message,
            position: 'top-right',
            autoClose: toastSettings.AUTO_CLOSE,
          });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [queryKey, refreshKey]);

  const activePresetKey = (() => {
    if (!hasRange) return null;
    const match = PERIOD_PRESETS.find((preset) => {
      const [presetFrom, presetTo] = preset.range();
      return (
        dayjs(presetFrom).format(API_DATE) === dayjs(from).format(API_DATE) &&
        dayjs(presetTo).format(API_DATE) === dayjs(to).format(API_DATE)
      );
    });
    return match?.key || null;
  })();

  const totals = data || {};
  const searchingAll = !!totals.period?.ignored;
  const customActive = showRange || (hasRange && !activePresetKey);
  const open = totals.stillOpen || {};
  const notYetDue = open.notYetDue || {};
  const overdue = open.overdue || {};

  /**
   * Credit notes and held surplus qualify a figure rather than being one: a credit
   * note is money handed back, not billed, and a surplus is money we are holding,
   * not money owed. They ride on the hint line of the figure they qualify — Billed
   * and Received — because a row that only exists in periods where they happen to
   * occur moves the table every time the reader changes the month.
   */
  const withNote = (base, note) => (note ? `${base} · ${note}` : base);

  /**
   * Narrowing to a band that has just emptied would leave an applied filter with
   * nothing on screen to switch it off — a table of zero rows under a strip
   * claiming eight invoices. If the band the reader is standing in disappears with
   * the scope, step out of it.
   */
  useEffect(() => {
    if (loading || !data || !agingSplit) return;
    const stillOffered =
      agingSplit === AGING_SPLIT.notYetDue ? notYetDue.count > 0 : overdue.count > 0;
    if (!stillOffered) onAgingSplitChange?.(null);
  }, [data, loading]);

  const toggleSplit = (key) => onAgingSplitChange?.(agingSplit === key ? null : key);

  /**
   * One cell shape for all four figures. `split` turns the cell into the aging
   * filter — same three lines, plus a hover tint and a pressed state, because a
   * figure that is also a control should not have to look like a different kind of
   * object to say so.
   */
  const stat = ({ dotClass, label, value, hint, valueClass, split, count }) => {
    const interactive = !!split && count > 0;
    const active = !!split && agingSplit === split;
    const body = (
      <>
        <Box className={classes.statHead}>
          <Box className={`${classes.statDot} ${dotClass}`} />
          <Typography variant="subtitle2" className={classes.statLabel}>
            {label}
          </Typography>
        </Box>
        <Typography variant="h3" className={`${classes.statValue} ${valueClass || ''}`}>
          {value}
        </Typography>
        <Typography variant="body3" className={classes.statHint}>
          {hint}
        </Typography>
      </>
    );

    if (!interactive) {
      return (
        <Box key={label} className={classes.stat}>
          {body}
        </Box>
      );
    }

    return (
      <Box
        key={label}
        component="button"
        type="button"
        aria-pressed={active}
        className={`${classes.stat} ${classes.statButton} ${active ? classes.statActive : ''}`}
        onClick={() => toggleSplit(split)}
      >
        {body}
      </Box>
    );
  };

  return (
    <Box className={classes.widget}>
      {loading ? (
        <Box className={classes.skeletonStrip}>
          <Skeleton variant="rectangular" height={64} />
        </Box>
      ) : (
        <Box className={classes.statStrip}>
          {stat({
            dotClass: classes.dotBrand,
            label: t('obx.invoice.reconciliation.billed'),
            value: money(totals.billed?.amount),
            hint: withNote(
              t('obx.invoice.outstanding.invoiceCount', { count: totals.billed?.count || 0 }),
              totals.credited?.amount > 0 &&
                t('obx.invoice.reconciliation.creditedNote', {
                  amount: money(totals.credited.amount),
                }),
            ),
          })}
          {stat({
            dotClass: classes.dotSuccess,
            label: t('obx.invoice.reconciliation.received'),
            value: money(totals.received?.amount),
            hint: withNote(
              t('obx.invoice.reconciliation.receivedHint', { count: totals.received?.count || 0 }),
              totals.surplus?.amount > 0 &&
                t('obx.invoice.reconciliation.surplusNote', {
                  amount: money(totals.surplus.amount),
                }),
            ),
          })}
          {/* Waiting and chasing are different problems, so they get a cell each
              rather than sharing one under a progress bar. Together they are the
              open balance, and billed − received closes on it. */}
          {stat({
            dotClass: classes.dotNeutral,
            label: t('obx.invoice.aging.current'),
            value: money(notYetDue.amount),
            hint: t('obx.invoice.outstanding.invoiceCount', { count: notYetDue.count || 0 }),
            split: AGING_SPLIT.notYetDue,
            count: notYetDue.count || 0,
          })}
          {stat({
            dotClass: classes.dotAlert,
            label: t('obx.invoice.outstanding.overdue'),
            value: money(overdue.amount),
            valueClass: overdue.count > 0 ? classes.statValueAlert : '',
            hint:
              overdue.count > 0
                ? t('obx.invoice.reconciliation.overdueHint', {
                    count: overdue.count,
                    days: overdue.oldestDaysOverdue || 0,
                  })
                : t('obx.invoice.reconciliation.nothingOverdue'),
            split: AGING_SPLIT.overdue,
            count: overdue.count || 0,
          })}
        </Box>
      )}

      {/* One controls row, and every control in it narrows the figures above as well
          as the rows below. The period sits at the far end because it is the same
          kind of thing as the others, and putting it last keeps the reading order
          "narrow, then when". */}
      <Box className={classes.controlsRow}>
        <Box className={classes.controlsLeft}>
          <Box className={classes.searchBox}>
            <SearchComponentWithQuery
              key={searchResetKey}
              name="invoiceNumber"
              onSearch={onFilterChange}
              placeHolder={`${t('obx.invoice.search')}`}
            />
          </Box>
          <CustomDropDown
            label={`${t('obx.invoice.siteDropdownLabel')}`}
            name="siteName"
            checkmark
            options={transformArrayForOptions(sites, 'name', 'id') || []}
            selectedValues={filters?.siteName}
            handleChange={onFilterChange}
            multiSelect
            searchable
            withTiles
            clearAll
            fetchMoreOptions={fetchSites}
            pagination={sitesPagination}
            isLoading={sitesLoader}
          />
          {/* "Show me what is unpaid" is the most common thing anyone asks of this
              table, so it is a filter in the row where filters live — not a count
              somewhere else that happens to be clickable. */}
          <CustomDropDown
            label={`${t('obx.invoice.paymentStates.all')}`}
            name="paymentStatus"
            options={paymentOptions}
            selectedValues={filters?.paymentStatus}
            handleChange={onFilterChange}
          />
          <CustomDropDown
            label={`${t('obx.invoice.syncStatusDropdownLabel')}`}
            name="status"
            options={statusOptions}
            selectedValues={filters?.status}
            handleChange={onFilterChange}
          />
          <CustomDropDown
            label={`${t('obx.invoice.typesDropdownLabel')}`}
            name="type"
            options={typeOptions}
            selectedValues={filters?.type}
            handleChange={onFilterChange}
          />
          {appliedScopeCount + (agingSplit ? 1 : 0) > 0 && (
            <Button
              variant="onlyText"
              disableRipple
              className={classes.clearAction}
              onClick={onClearAll}
            >
              {t('obx.invoice.reconciliation.clearAll')}
            </Button>
          )}
        </Box>

        {/* One slot, shared by everything that is about *when* or about what the
            reader is doing right now: the presets, the custom range, the note that a
            search has left the period behind, and the selection's actions. They take
            turns rather than stacking, because a second row here moves the table. */}
        <Box className={classes.controlsRight}>
          {/* Selection wins the slot while it lasts — the period is not what anyone
              is thinking about with three invoices ticked and an approval to push. */}
          {selectedCount > 0 ? (
            <Box className={classes.selection}>
              <Typography variant="body3" className={classes.selectionText}>
                {t('obx.invoice.reconciliation.selected', { count: selectedCount })}
              </Typography>
              {onBulkApprove}
              <Button
                variant="onlyText"
                disableRipple
                className={classes.clearAction}
                onClick={onClearSelection}
              >
                {t('obx.invoice.reconciliation.clearSelection')}
              </Button>
            </Box>
          ) : /* A search deliberately looks outside the period, so the period controls
              stop applying. Saying that where the controls are is the only place it
              stops a misread. */
          searchingAll ? (
            <Typography variant="body3" className={classes.searchNote}>
              {t('obx.invoice.reconciliation.searchingAll')}
            </Typography>
          ) : customActive ? (
            <>
              <Box className={classes.rangePicker}>
                {/* Without the sync prop the picker keeps its own copy of the dates and
                    goes stale the moment a preset moves the period. */}
                <DateRangePicker
                  syncSelectedDatesOnStateChange
                  placeHolder="MM/DD/YYYY - MM/DD/YYYY"
                  selectedDates={period}
                  setDates={(next) => onPeriodChange?.(next)}
                />
              </Box>
              <Button
                disableRipple
                className={`${classes.preset} ${classes.presetIdle}`}
                variant="onlyText"
                onClick={() => {
                  setShowRange(false);
                  onPeriodChange?.(PERIOD_PRESETS[0].range());
                }}
              >
                {t('obx.invoice.reconciliation.presets.backToPresets')}
              </Button>
            </>
          ) : (
            <Box className={classes.presetGroup}>
              {PERIOD_PRESETS.map((preset) => {
                const selected = activePresetKey === preset.key;
                return (
                  <Button
                    key={preset.key}
                    disableRipple
                    // Unselected presets are neutral, not brand-coloured: five
                    // brand-coloured buttons in a row all read as chosen, and the one
                    // that actually is has nothing left to distinguish it.
                    className={`${classes.preset} ${selected ? '' : classes.presetIdle}`}
                    variant={selected ? 'primary' : 'onlyText'}
                    onClick={() => onPeriodChange?.(preset.range())}
                  >
                    {t(`obx.invoice.reconciliation.presets.${preset.key}`)}
                  </Button>
                );
              })}
              <Button
                disableRipple
                className={`${classes.preset} ${classes.presetIdle}`}
                variant="onlyText"
                onClick={() => setShowRange(true)}
              >
                {t('obx.invoice.reconciliation.presets.custom')}
              </Button>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

PeriodOverview.propTypes = {
  period: PropTypes.array,
  onPeriodChange: PropTypes.func,
  summaryQuery: PropTypes.object,
  agingSplit: PropTypes.string,
  onAgingSplitChange: PropTypes.func,
  refreshKey: PropTypes.number,
  filters: PropTypes.object,
  onFilterChange: PropTypes.func,
  onClearAll: PropTypes.func,
  searchResetKey: PropTypes.number,
  sites: PropTypes.array,
  sitesPagination: PropTypes.object,
  sitesLoader: PropTypes.bool,
  fetchSites: PropTypes.func,
  paymentOptions: PropTypes.array,
  statusOptions: PropTypes.array,
  typeOptions: PropTypes.array,
  appliedScopeCount: PropTypes.number,
  selectedCount: PropTypes.number,
  onBulkApprove: PropTypes.node,
  onClearSelection: PropTypes.func,
};

PeriodOverview.defaultProps = {
  period: [],
  onPeriodChange: () => {},
  summaryQuery: {},
  agingSplit: null,
  onAgingSplitChange: () => {},
  refreshKey: 0,
  filters: {},
  onFilterChange: () => {},
  onClearAll: () => {},
  searchResetKey: 0,
  sites: [],
  sitesPagination: {},
  sitesLoader: false,
  fetchSites: () => {},
  paymentOptions: [],
  statusOptions: [],
  typeOptions: [],
  appliedScopeCount: 0,
  selectedCount: 0,
  onBulkApprove: null,
  onClearSelection: () => {},
};

export default PeriodOverview;
