import { Box, Button, Popover, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CustomDropDown from 'src/app/components/common/customDropDown';
import DateRangePicker from 'src/app/components/common/RangeDatepicker';
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
import { siteTerms } from './siteTerm';

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

  /**
   * The separator **inside** the date navigator, between the arrows and Today.
   *
   * Stays short, and is the one separator on this row that does: it sits inside a
   * 32px bordered shell whose own controls are 28px, so a full-height rule would
   * meet that shell's top and bottom border and read as a seam splitting the pill in
   * two rather than as a gap between two of its buttons. 20px is the 28px buttons'
   * measure, not the row's.
   */
  dateNavigatorDivider: {
    width: '1px',
    height: '20px',
    flex: '0 0 auto',
    margin: '0 2px',
    background: theme.palette.borderSubtle1,
  },

  /**
   * The separator **between clusters** of the toolbar itself.
   *
   * **28px, the height of the controls it separates** — the three dropdowns and
   * Clear all all run at 28, as do the arrows and Today inside the date navigator.
   * It was 32 first, on the reasoning that 32 is what every segmented pill in this
   * app stands at (`calendarHeaderToolbarToggle` and the two switches copied from
   * it), so a separator should match them. That was measuring against the wrong
   * thing: the pills are not in this row — the only 32px box here is the date
   * navigator's *shell*, and a rule matching the shell overshot every control it
   * actually sits between and read as the tallest mark in the row. Reported directly
   * as longer than the toggles, which it was.
   *
   * Stated as its own class rather than reusing `dateNavigatorDivider` because the
   * two answer different questions — that one is a gap *inside* a control, this one a
   * gap *between* clusters — even now that the numbers are close.
   */
  toolbarDivider: {
    width: '1px',
    height: '28px',
    flex: '0 0 auto',
    background: theme.palette.borderSubtle1,
  },

  /**
   * The rule that fences the **leading** switch off from the filter run.
   *
   * Same job, and the same drawing, as `calendarHeaderToolbarLeadingDivider` in the
   * scheduler's own toolbar: what leads this row re-groups the whole surface rather
   * than narrowing it, and flush against a run of borderless dropdowns it reads as
   * the first of them.
   *
   * **32px, not the 28 of `toolbarDivider` above and not the reference's
   * `alignSelf: stretch`.** It is measured against the thing it fences off — a 32px
   * segmented pill — where that one is measured against the 28px controls it sits
   * between; the two separators in this row answer different questions and the
   * heights follow from what is on either side of each. Stretching it, which is what
   * the reference does inside a taller shell, would make it the tallest mark in a row
   * whose tallest control is 32.
   */
  toolbarLeadingDivider: {
    width: '1px',
    height: '32px',
    flex: '0 0 auto',
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
const CompaniesFilters = ({
  scope,
  onChange,
  companies = [],
  view,
  viewSwitch = null,
  leadingSwitch = null,
  filterAction = null,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const { getLabel } = useTenantLabel();

  /* Was the same two lines inline, with `Locations` as the no-label fallback — a third
     word for the object, on a screen that already had two. See `./siteTerm`. */
  const { singular: locationTerm } = siteTerms(getLabel, t);

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

  /**
   * A picked range, committed **in date order whichever order it was clicked**.
   *
   * `dates[0]` used to be trusted as the start. Every consumer downstream then
   * assumes `from <= to`: `narrowCompanies` keeps a visit when
   * `date >= from && date <= to`, so a reversed pair silently matches *nothing* and
   * the tab reads "No companies have visits in this period" for a period that is
   * full of them. The date pill hides the same fault on the Year grain, because
   * `MMM 'YY – MMM 'YY` prints no day: `26 Aug → 17 Aug` and `17 Aug → 26 Aug` are
   * the same label, so the control cannot show which way round it went.
   *
   * Sorting here rather than asking the picker to guarantee it: this is the boundary
   * where a pair of dates becomes *the scope*, and the scope's invariant is its own
   * to hold. One comparison, and the two clicks mean the same window in either
   * order — which is also what a planner means by them.
   */
  const handleRangeChange = (dates = []) => {
    const [first, second] = dates;
    if (!first || !second) return;

    const a = dayjs(first);
    const b = dayjs(second);
    const [start, end] = a.isAfter(b) ? [b, a] : [a, b];

    const from = start.format('YYYY-MM-DD');
    const to = end.format('YYYY-MM-DD');
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
      {/* The grouping switch, when this pane is a *segment* of the scheduler rather
          than a tab of its own — Var 2's Routes / Visits / Companies.

          It leads this row for the same reason it leads the grid's, and it is in this
          row at all because it used to be in one of its own: a bare toolbar above the
          pane, so the toggles and the filters that came with them stacked into two
          rows where every other surface reads them as one. Reported directly. The slot
          is a `node` rather than the switch itself because the switch is the
          *calendar's* control, wired to the calendar's grouping state — this row only
          decides where it sits.

          The rule is drawn with it, so a caller that threads in nothing (Var 1, where
          Companies is a tab and there is no toggle to come back through) gets no stray
          line at the head of the row. */}
      {leadingSwitch ? (
        <>
          {leadingSwitch}
          <Box className={classes.toolbarLeadingDivider} aria-hidden />
        </>
      ) : null}

      {/* **No search box here.** This row had one, added because `scope.query` was
          wired end to end with nothing on screen setting it — and it was the wrong
          answer to that. Both dropdowns below are `searchable`, so a planner hunting
          for a company or a building already types into the control that then *shows
          them what they picked*; a second field doing the same narrowing invisibly,
          with an empty state of its own, made two ways to ask one question with no
          way to see which was in force. Asked for directly.

          The `query` path is left standing — `narrowCompanies` matches it against
          company and location names, `defaultCompanyScope` seeds it, Clear all resets
          it — so nothing downstream had to be unpicked and a caller arriving
          pre-searched still works. Nothing in the UI sets it today. */}
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

      {/* Whatever the mounted view wants to put beside its filters — today the year
          matrix's collapse button, and nothing at all on the grouped list, which has
          no month axis to fold.

          Separated by a rule, because it is not one of them: everything to its left
          narrows *which* rows are on screen and this changes how they are drawn.
          Rendered together with its separator, so a view that threads in nothing does
          not leave a rule with nothing on the far side of it. */}
      {filterAction ? (
        <>
          <Box className={classes.toolbarDivider} aria-hidden />
          {filterAction}
        </>
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
  /** The grain switch, rendered at the trailing end of this row beside the date. */
  viewSwitch: PropTypes.node,
  /**
   * The scheduler's grouping switch, rendered at the *leading* end behind a rule.
   * Threaded down from the calendar when this pane is mounted as a grouping segment;
   * omitted when it is a tab, where the tab row is the way back out.
   */
  leadingSwitch: PropTypes.node,
  /**
   * One control belonging to the mounted view, rendered after the filters behind a
   * separator — the year matrix's collapse button. Omitted, neither it nor its
   * separator is drawn.
   */
  filterAction: PropTypes.node,
};

export default CompaniesFilters;
