import { Box, Button, Popover, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CustomDropDown from 'src/app/components/common/customDropDown';
import DateRangePicker from 'src/app/components/common/RangeDatepicker';
import SearchComponent from 'src/app/components/common/search';
import { ReactComponent as LeftArrow } from 'src/assets/svg/calendar-left.svg';
import { ReactComponent as RightArrow } from 'src/assets/svg/calendar-right.svg';
import { useTenantLabel } from 'src/helper/utilityHooks';

import {
  COMPANIES_VIEW,
  formatRangeLabel,
  isViewingCurrentPeriod,
  rangeForView,
  snapsToGrain,
  stepRange,
} from './companiesViewRange';
import { isScopeNarrowed, STATUS_FILTER_ALL, statusFilterOptions } from './companyVisitFilters';

const useStyles = makeStyles((theme) => ({
  /**
   * The scheduler's toolbar, to the pixel.
   *
   * `calendarHeaderToolbarWithFilters` is `minHeight: 64px; padding: 8px 0 12px`
   * with a 14px gap between filters, and this tab sits directly beside it under a
   * shared tab row — so any divergence reads as two different products rather than
   * as one screen with two tabs. Copied in values, not in code, because the
   * scheduler's sheet is bound to the `classes` object the calendar threads down.
   */
  toolbar: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: '14px',
    flex: '0 0 auto',
    minHeight: '64px',
    padding: '8px 0 12px',
  },

  spacer: { flex: 1 },

  /* The search box. Width-capped rather than flexed: this row already has a
     `spacer` doing the pushing, and a search that grew to fill it would make the
     three dropdowns beside it look like an afterthought clinging to the left edge.
     220px fits a company name, which is the longest thing anyone types here. */
  search: {
    flex: '0 0 auto',
    width: '220px',
    '& .MuiInputBase-root': {
      height: '32px',
    },
  },

  /* Borderless dropdowns: `label: value ▾`, the shape every filter on the week
     grid takes. Copied in behaviour, not in code, because the scheduler's version
     is bound to its own `classes` object passed down from the calendar. */
  dropdown: {
    '&.MuiBox-root': {
      height: '28px',
      minWidth: 'auto',
      border: 'none !important',
      boxShadow: 'none !important',
      borderRadius: 0,
      background: 'transparent',
    },
    '& > .MuiBox-root': {
      height: '28px',
      alignItems: 'center',
      padding: '0 !important',
      columnGap: '4px',
    },
    '& .MuiTypography-root': {
      fontSize: '12px',
      fontWeight: 400,
      lineHeight: '18px',
      color: `${theme.palette.textPrimary} !important`,
      textTransform: 'none !important',
    },
    '& svg': { width: '16px', height: '16px', display: 'block' },
  },

  /* --- the date-range pill -------------------------------------------------
     Pixel-for-pixel the scheduler's own date navigator
     (`calendarHeaderToolbarLeft*` in `calendar/calendar.styles.js`), copied in
     values rather than imported: that shell is bound to FullCalendar's
     prev/next/today and a single "jump to date" popover, none of which exist
     for this tab's own from/to window (see `CompaniesFilters`'s own step/today
     handlers below — they now step in the active view's grain, which is the same
     job the reference does, done against a scope instead of against a calendar
     instance). Keep these in step with the reference by hand
     — the two are meant to read as one visual language, not two toolbars that
     happen to look alike today. */
  dateNavigator: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '2px',
    border: `1px solid ${theme.palette.borderSubtle1}`,
    borderRadius: '8px',
    height: '32px',
    padding: '0 2px',
    boxSizing: 'border-box',
    flex: '0 0 auto',
    background: theme.palette.surfaceWhite,
  },

  dateNavigatorText: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
      minWidth: '148px',
      padding: '0 4px',
      textAlign: 'center',
      whiteSpace: 'nowrap',
      fontVariantNumeric: 'tabular-nums',
    },
  },

  dateNavigatorTextTrigger: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid transparent',
    borderRadius: '6px',
    padding: 0,
    background: 'none',
    cursor: 'pointer',
    font: 'inherit',
    '&:hover': {
      backgroundColor: theme.palette.surfaceGreySubtle,
    },
  },

  /* Only the outer shell — margin, border, radius, shadow, and enough padding to
     keep the picker's own field off the edge. The picker's day-grid opens in its
     own nested popper (`datePickerPopper` in `RangeDatepicker/index.jsx`), already
     styled there, so there is no selected-day override to duplicate here. */
  dateNavigatorPopover: {
    '& .MuiPopover-paper': {
      marginTop: '4px',
      padding: '12px',
      borderRadius: '8px',
      border: `1px solid ${theme.palette.borderSubtle1}`,
      boxShadow:
        '0px 4px 6px -2px rgba(16, 24, 40, 0.05), 0px 12px 16px -4px rgba(16, 24, 40, 0.10)',
    },
  },

  dateNavigatorAction: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    '&.MuiButtonBase-root': {
      width: '28px',
      height: '28px',
      minWidth: '28px',
      padding: '0',
      borderRadius: '6px',
    },
    '& svg': {
      width: '8px',
      height: '14px',
    },
  },

  dateNavigatorDivider: {
    width: '1px',
    height: '20px',
    flex: '0 0 auto',
    margin: '0 2px',
    background: theme.palette.borderSubtle1,
  },

  dateNavigatorToday: {
    '&.MuiButtonBase-root': {
      height: '28px',
      minWidth: 'auto',
      padding: '0 10px',
      borderRadius: '6px',
      fontSize: '12px',
      fontWeight: 500,
      lineHeight: '16px',
      whiteSpace: 'nowrap',
    },
    '&.Mui-disabled': {
      opacity: 0.45,
    },
  },

  /* Only rendered while something is narrowing the list, because a permanently
     visible reset invites the reading that the screen is filtered when it is
     not. */
  clearButton: {
    '&.MuiButton-root': {
      minWidth: 'auto',
      height: '28px',
      padding: '0 8px',
      fontSize: '12px',
      fontWeight: 500,
      lineHeight: '18px',
      color: theme.palette.textBrand,
      textTransform: 'none',
      whiteSpace: 'nowrap',
      '&:hover': { background: theme.palette.surfaceGreySubtle },
    },
  },
}));

/**
 * The scope controls for the Companies tab: **when**, **who**, **where**, and
 * **what state**.
 *
 * Rendered by each view rather than by the pane, but with nothing view-local left
 * in it: every view renders exactly this row, which is the point — the switch
 * changes the period underneath and must not change the *controls* above it. It
 * used to take a `children` slot for per-view extras (the retired listing's status
 * buckets, the grouped list's collapse-all), and the result was toolbars that
 * looked like different screens. `view` is the one thing that reaches in, and it
 * only ever changes what three of these controls *say and do*, never which of them
 * are there.
 *
 * Company and location are multi-select and one flow, not two independent
 * filters: picking locations also folds in their companies, so the pair can never
 * describe a location that is not under one of the companies shown beside it. See
 * the `handleChange` callbacks below for the two directions of that rule.
 *
 * The date range renders on every view, and **is** the view: since the tab grew
 * Day/Week/Month beside Year, `view` decides what the pill says, what one press of
 * an arrow moves, and where "Today" goes. All four answers come from
 * `companiesViewRange` rather than being spelled out here, so the pill can never
 * name a period the arrows do not step through.
 */
const CompaniesFilters = ({ scope, onChange, companies = [], view, viewSwitch = null }) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const { getLabel } = useTenantLabel();

  const locationsTerm = getLabel('terms', 'sites', t) || 'Locations';
  const locationTerm = locationsTerm.replace(/s$/i, '') || locationsTerm;

  const companyOptions = useMemo(
    () =>
      companies.map((company) => ({
        value: String(company.customerId),
        label: company.name,
      })),
    [companies],
  );

  /* Scoped to the chosen companies when there are any. With none chosen the whole
     book is offered, each option captioned with its owner — that is what lets a
     planner who knows the building but not the parent start from the building. */
  const locationOptions = useMemo(() => {
    const scoped = scope.customerIds?.length
      ? companies.filter((company) => scope.customerIds.includes(String(company.customerId)))
      : companies;

    return scoped.flatMap((company) =>
      (company.sites || []).map((site) => ({
        value: String(site.id),
        label: site.name,
        customerId: String(company.customerId),
      })),
    );
  }, [companies, scope.customerIds]);

  /* Every site's owning company, independent of the current company selection —
     unlike `locationOptions` above, which is deliberately narrowed by it. This is
     what lets the two `handleChange` callbacks below reconcile the *other* field
     when one of them changes, without asking "is this site still in the list the
     dropdown happens to be showing right now". */
  const siteCompanyId = useMemo(() => {
    const map = new Map();
    companies.forEach((company) => {
      (company.sites || []).forEach((site) => {
        map.set(String(site.id), String(company.customerId));
      });
    });
    return map;
  }, [companies]);

  const statusOptions = useMemo(() => statusFilterOptions(t), [t]);

  const selectedCompanies = companyOptions.filter((option) =>
    (scope.customerIds || []).includes(option.value),
  );
  const selectedLocations = locationOptions.filter((option) =>
    (scope.siteIds || []).includes(option.value),
  );
  const selectedStatus =
    statusOptions.find((option) => option.value === (scope.status || STATUS_FILTER_ALL)) ||
    statusOptions[0];

  /* Referentially stable, and dayjs rather than Date: `DateRangePickerWithButtons`
     mirrors this prop into its own state from an effect keyed on it, so a fresh
     array each render blanks the field, and the picker calls `.isUTC()` on the
     values, which a `Date` does not have (§7.52). */
  const selectedDates = useMemo(() => [dayjs(scope.from), dayjs(scope.to)], [scope.from, scope.to]);

  const handleRangeChange = (dates = []) => {
    const [start, end] = dates;
    if (!start || !end) return;

    const from = dayjs(start).format('YYYY-MM-DD');
    const to = dayjs(end).format('YYYY-MM-DD');
    // The picker fires on mount with the range it was given; comparing formatted
    // strings makes that a no-op instead of a refetch.
    if (from === scope.from && to === scope.to) return;

    onChange({ from, to });
  };

  /* Whatever the grain calls its window: a weekday for Day, a span of days for
     Week, a named month for Month, and — unchanged — the same `MMM 'YY` pair the
     Year view's own column headers use, so that pill and the grid it narrows never
     disagree about how to say a month. */
  const rangeLabel = formatRangeLabel(view, scope);

  const [datePickerAnchorEl, setDatePickerAnchorEl] = useState(null);
  const isDatePickerOpen = Boolean(datePickerAnchorEl);
  const handleOpenDatePicker = (event) => setDatePickerAnchorEl(event.currentTarget);
  const handleCloseDatePicker = () => setDatePickerAnchorEl(null);

  /**
   * A pick, read as whatever the grain can express.
   *
   * On Day, Week and Month a picked date *is* the window — there is one week
   * containing the 19th — so the first click resolves it through `rangeForView`
   * and the popover closes on it. Making the planner click twice to say "this
   * week" would be asking for information the grain has already decided.
   *
   * On Year the span is theirs to choose, so the original two-click behaviour
   * stands: the picker fires on every click, including the first, setting both
   * ends to the same day while the second is still pending (see
   * `DateRangePickerWithButtons.handleChangeDate`), so closing on any call would
   * dismiss the popover before a range exists at all. Only a genuine two-ended
   * range closes it.
   */
  const handlePickRange = (dates = []) => {
    const [start, end] = dates;

    if (snapsToGrain(view)) {
      if (!start) return;
      onChange(rangeForView(view, dayjs(start)));
      handleCloseDatePicker();
      return;
    }

    handleRangeChange(dates);
    if (start && end && !dayjs(start).isSame(dayjs(end), 'day')) {
      handleCloseDatePicker();
    }
  };

  /* This tab has no FullCalendar view to ask "does today fall in the visible
     range" the way the reference's `isViewingToday` does — there is only a from/to
     window, so the equivalent question is asked directly: is the window already the
     one this grain opens on. Containment would be the wrong test on Year, where a
     window can hold today and still be eleven months from where Today would go. */
  const isViewingCurrentWindow = isViewingCurrentPeriod(view, scope);

  const handleGoToToday = () => onChange(rangeForView(view, dayjs()));

  /* One press, one period of whichever grain is active — day, week, month, or (on
     Year, which draws a column per month and is the one grain whose span the
     planner may have made ragged) one month of a window whose ends move together.
     The arithmetic is `stepRange`'s; this only decides the direction. */
  const handleStep = (direction) => () => onChange(stepRange(view, scope, direction));

  return (
    <Box className={classes.toolbar}>
      {/* **The search had no input.** `scope.query` was already plumbed end to end —
          `defaultCompanyScope` seeds it, `narrowCompanies` matches it against company
          *and* location names, and Clear all resets it — but nothing on screen ever
          set it, so the whole path was unreachable. This is that missing control, not
          a new capability.

          Leads the row because it is the widest net: the dropdowns narrow to things
          you can already name, and this is how you find the one you cannot. Uses the
          scheduler's own `SearchComponent`, which debounces internally, so a keystroke
          does not re-narrow the book. */}
      <SearchComponent
        name="companySearch"
        className={classes.search}
        placeholder={t('form.input.textField.search.placeHolder')}
        /* `onSearch` is wired straight to the input's `onChange`, so it hands back the
           **event**, not the string — read the value off the target. Passing the
           argument through directly put an event object into `scope.query`, and the
           empty-state dutifully reported "no company or site matches [object Object]". */
        onSearch={(event) => onChange({ query: event?.target?.value ?? '' })}
      />

      <CustomDropDown
        name="company"
        label={t('obx.schedules.calendar.companies.companyColumn')}
        className={classes.dropdown}
        options={companyOptions}
        selectedValues={selectedCompanies}
        multiSelect
        checkmark
        searchable
        clearAll
        searchPlaceholder={t('form.input.textField.search.placeHolder')}
        handleChange={(event) => {
          const nextCustomerIds = (event.target.value || []).map((option) => option.value);
          /* Changing companies drops any selected location whose company just left
             the selection: a location can never describe a company that is not in
             the filter shown beside it. A location under a company that is still
             selected survives the change. */
          const nextSiteIds = (scope.siteIds || []).filter((siteId) =>
            nextCustomerIds.includes(siteCompanyId.get(siteId)),
          );
          onChange({ customerIds: nextCustomerIds, siteIds: nextSiteIds });
        }}
      />

      <CustomDropDown
        name="location"
        label={locationTerm}
        className={classes.dropdown}
        options={locationOptions}
        selectedValues={selectedLocations}
        multiSelect
        checkmark
        searchable
        clearAll
        searchPlaceholder={t('form.input.textField.search.placeHolder')}
        handleChange={(event) => {
          const nextSiteIds = (event.target.value || []).map((option) => option.value);
          /* A location implies its company, so adding one narrows both. This is
             the "find the building, get the parent" path stated as one action —
             existing company selections are left alone, only ever added to. */
          const impliedCustomerIds = new Set(scope.customerIds || []);
          nextSiteIds.forEach((siteId) => {
            const owner = siteCompanyId.get(siteId);
            if (owner) impliedCustomerIds.add(owner);
          });
          onChange({ siteIds: nextSiteIds, customerIds: Array.from(impliedCustomerIds) });
        }}
      />

      <CustomDropDown
        name="status"
        label={t('obx.schedules.filters.status.label')}
        className={classes.dropdown}
        options={statusOptions}
        selectedValues={selectedStatus}
        handleChange={(event) => {
          const value = event.target.value?.value;
          /* `STATUS_FILTER_ALL` and "cleared" are the same state, and the dropdown
             reports a cleared single-select as an empty object — both land on null,
             which is what the views read as "every status". */
          onChange({ status: value || null });
        }}
      />

      {/* The way back to everything. It clears the narrowing, not the window: the
          date range is the question being asked, and resetting it would answer a
          different one than the planner set up. */}
      {isScopeNarrowed(scope) ? (
        <Button
          className={classes.clearButton}
          disableRipple
          onClick={() => onChange({ customerIds: [], siteIds: [], status: null, query: '' })}
        >
          {t('commonText.clearAll')}
        </Button>
      ) : null}

      <Box className={classes.spacer} />

      {/* The scheduler's own date navigator, adapted from a FullCalendar-bound
          prev/next/today/jump-to-date control to this tab's arbitrary from/to
          window — see the handlers above. */}
      <Box className={classes.dateNavigator}>
        <Button
          variant="tertiaryGrey"
          className={classes.dateNavigatorAction}
          onClick={handleStep(-1)}
          aria-label={t('obx.schedules.calendar.previousPeriod')}
        >
          <LeftArrow />
        </Button>
        <Box
          component="button"
          type="button"
          className={classes.dateNavigatorTextTrigger}
          onClick={handleOpenDatePicker}
          aria-label={t('obx.schedules.calendar.openDatePicker')}
        >
          <Typography className={classes.dateNavigatorText} variant="subtitle2">
            {rangeLabel}
          </Typography>
        </Box>
        <Popover
          open={isDatePickerOpen}
          anchorEl={datePickerAnchorEl}
          onClose={handleCloseDatePicker}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          transformOrigin={{ vertical: 'top', horizontal: 'left' }}
          className={classes.dateNavigatorPopover}
        >
          <DateRangePicker selectedDates={selectedDates} setDates={handlePickRange} />
        </Popover>
        <Button
          variant="tertiaryGrey"
          className={classes.dateNavigatorAction}
          onClick={handleStep(1)}
          aria-label={t('obx.schedules.calendar.nextPeriod')}
        >
          <RightArrow />
        </Button>
        <Box className={classes.dateNavigatorDivider} aria-hidden />
        <Button
          variant="tertiaryGrey"
          className={classes.dateNavigatorToday}
          onClick={handleGoToToday}
          disabled={isViewingCurrentWindow}
        >
          {t('obx.schedules.calendar.today')}
        </Button>
      </Box>

      {/* Threaded in from whichever view is mounted (see `CompaniesPane`, and
          each view's own `CompaniesFilters` call) rather than owned here — this
          bar renders identically for every view and has no view state of its
          own to switch on. Trailing, beside the date range: both are "how am I
          looking at this" controls, read as one cluster the same way the
          scheduler's own Day/Week/Month toggle reads beside its date
          navigator. */}
      {viewSwitch}
    </Box>
  );
};

CompaniesFilters.propTypes = {
  /** `{ from, to, customerIds, siteIds, status, query }` — the tab's whole scope. */
  scope: PropTypes.object.isRequired,
  /** Receives a partial scope to merge. */
  onChange: PropTypes.func.isRequired,
  /** Every company and location in the book, unnarrowed by the current scope. */
  companies: PropTypes.array,
  /** The active grain — decides the pill's wording, the arrows' unit and Today. */
  view: PropTypes.oneOf(Object.values(COMPANIES_VIEW)).isRequired,
  /** The Day/Week/Month/Year switch, rendered at the trailing end of this row. */
  viewSwitch: PropTypes.node,
};

export default CompaniesFilters;
