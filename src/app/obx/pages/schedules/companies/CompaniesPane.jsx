import { Box } from '@mui/material';
import { makeStyles } from '@mui/styles';
import PropTypes from 'prop-types';
import { useCallback, useEffect, useState } from 'react';

import {
  anchorForRange,
  COMPANIES_VIEW,
  DEFAULT_COMPANIES_VIEW,
  rangeForView,
  SELECTABLE_COMPANIES_VIEWS,
} from './companiesViewRange';
/* Aliased to what each one *draws*, because the module names say the opposite and
   that is what made this wiring wrong — see `VIEWS`. `./index` is the month matrix;
   `./timeline` is the collapsible grouped list. */
import CompaniesMonthMatrix from './index';
import CompaniesGroupedList from './timeline';
import useCompanyVisitSchedule, { defaultCompanyScope } from './useCompanyVisitSchedule';

/** Survives a tab round-trip, which remounting the pane otherwise resets. */
const STORAGE_KEY = 'schedules.companies.view';

const useStyles = makeStyles(() => ({
  /* No gap and no chrome: the view switch now renders inside whichever view is
     mounted (each view threads it into its own `CompaniesFilters` row via the
     `viewSwitch` slot), so the pane itself is nothing but that view. */
  pane: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    minHeight: 0,
  },
}));

/**
 * Whatever is in storage, checked against the views a planner can still *pick*.
 *
 * That check is what makes retiring a view safe, and it has now done the job three
 * times: the dropped `'listing'`, the `'timeline'`/`'compact'` density pair this
 * switch offered before it became Day/Week/Month/Year, and now `'month'`/`'year'`
 * themselves, retired from the switch in the same move. None of the retired values
 * is kept as a dead alias — `'compact'` named a *shape*, `'month'`/`'year'` name
 * ranges the tab still knows how to draw but no longer offers, and mapping any of
 * them onto Day or Week would be picking a period on the planner's behalf. They all
 * open on the default instead.
 *
 * Validated against `SELECTABLE_COMPANIES_VIEWS`, not the full `COMPANIES_VIEW`
 * enum — the enum still lists Month and Year because `VIEWS` below still knows how
 * to draw them, but a stored `'month'`/`'year'` from before this change must not
 * pass this check, or a planner would land on a view syncing to no toggle segment
 * and no way back to one.
 */
const readStoredView = () => {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return SELECTABLE_COMPANIES_VIEWS.includes(stored) ? stored : DEFAULT_COMPANIES_VIEW;
  } catch {
    // Private mode, or storage disabled by policy. Not worth failing a render over.
    return DEFAULT_COMPANIES_VIEW;
  }
};

/**
 * Which shape each range is drawn in — **two components, four options**, and the
 * one place that binding is stated.
 *
 * The tab has always had exactly these two shapes; what changed is what chooses
 * between them. They used to be a *density* toggle (Timeline / Compact) over one
 * fixed rolling year, which meant both had to be good at the same range and each
 * was only good at half of it:
 *
 * - `./index` draws a table with **month columns across the top** (Aug '26, Sep '26,
 *   Oct '26 …), one row per site, one small card per month cell. A month axis earns
 *   its width when there are twelve of them, and only then — so it draws **Year**.
 * - `./timeline` draws collapsible company groups with the sites as rows and **no
 *   month header at all**: a row is just that location's visits in date order. Its
 *   own stylesheet is explicit that dropping the axis is what fixed it — *"a
 *   location serviced quarterly fills three cells in twelve and the other nine are
 *   ruled whitespace"*. A sequence with no axis is exactly what a day, a week or a
 *   month is, so it draws all three.
 *
 * So the density question dissolves instead of being answered: each shape is now
 * bound to the range it was built for, and no second control is needed to choose
 * between them. Nothing was deleted — the same two components render, with the same
 * props, from the same payload.
 *
 * **Left stale on purpose:** the `timeline/` directory and the `CompaniesTimeline`
 * component name now name the grouped list that draws Day/Week/Month, which is the
 * one range grain it is *not* named after. The old `COMPANIES_VIEW.TIMELINE` key is
 * gone, so the misleading half of that ladder is down to the directory name;
 * renaming it touches the stylesheet and both view files, so it stays a follow-up
 * rather than a rider on this change. The aliased imports above are the guard rail
 * until then.
 *
 * **All four entries stay, regardless of which are reachable.** `CompaniesViewSwitch`
 * renders `SELECTABLE_COMPANIES_VIEWS` — currently Year alone, having been Day and
 * Week alone one edit before that — but the binding every grain has to its shape is
 * correct and cheap to keep whether or not the switch currently offers it. Restoring
 * any of the other three is a one-line change to that list, not a rewrite of this
 * map.
 */
const VIEWS = {
  [COMPANIES_VIEW.DAY]: CompaniesGroupedList,
  [COMPANIES_VIEW.WEEK]: CompaniesGroupedList,
  [COMPANIES_VIEW.MONTH]: CompaniesGroupedList,
  [COMPANIES_VIEW.YEAR]: CompaniesMonthMatrix,
};

/**
 * The Companies tab, in whichever shape the planner last chose.
 *
 * The pane owns the two things that are true of the tab rather than of a view: the
 * **scope** (date range, company, location, status, search text) and the **fetch**
 * that serves it. Each view used to hold its own copy of both, so switching view
 * refetched an identical year and a filter set on one view was gone on the next —
 * which made the switch feel like separate screens instead of two readings of one.
 *
 * Only the active view is mounted. Each draws every company in the book across the
 * window, and keeping an idle one alive would double a DOM that is already fifteen
 * companies by twelve months.
 *
 * Because Day, Week and Month all mount the *same* component, React keeps that
 * instance across a switch between the three — so a planner who collapsed six
 * companies on Week still has them collapsed on Day. That falls out of the mapping
 * rather than being arranged, but it is the behaviour you would want and worth not
 * breaking: giving the grains distinct `key`s would remount and silently reopen
 * everything.
 */
const CompaniesPane = ({ onOpenVisit, initialCustomerId = null }) => {
  const classes = useStyles();
  const [view, setView] = useState(readStoredView);
  /* Seeded from the *restored* view, not from the tab's default one. The window is
     the view now, so a planner who left on Week and comes back to a year of data
     would be looking at a Week toggle over a range it does not describe — for the
     one render it took the range to catch up, and for a whole extra fetch. `view`
     is already assigned by the time this initialiser runs. */
  const [scope, setScope] = useState(() => ({
    ...defaultCompanyScope(view),
    customerIds: initialCustomerId ? [initialCustomerId] : [],
  }));
  const { data, loading } = useCompanyVisitSchedule(scope);

  /**
   * A drill-through from the week grid arrives as a single company id, and it has
   * to win over whatever this tab was last scoped to. The filter bar is
   * multi-select, so the id is seeded in as the sole member of `customerIds`
   * rather than replacing some wider selection the planner had built up.
   *
   * Keyed on the id rather than applied once on mount: the pane stays mounted while
   * the planner is on this tab, so a *second* click-through from the other tab has
   * to move the scope again. Everything else in the scope survives — the planner
   * clicked a company, not a reset.
   */
  useEffect(() => {
    if (!initialCustomerId) return;
    setScope((previous) =>
      previous.customerIds.length === 1 && previous.customerIds[0] === initialCustomerId
        ? previous
        : { ...previous, customerIds: [initialCustomerId], siteIds: [] },
    );
  }, [initialCustomerId]);

  /**
   * The view, and the window that goes with it.
   *
   * These move together or not at all: "Week" showing eleven months is not a Week
   * view, it is a mislabelled Year one. So the switch re-ranges the scope in the
   * same update that changes the view — one render, one refetch, and the toolbar
   * pill beside the switch never spends a frame naming the old period.
   *
   * `anchorForRange` decides *which* week: today if today is on screen, and the
   * window's start otherwise, so stepping back to March and then narrowing to Week
   * lands on the first week of March rather than snapping back to this one.
   *
   * Everything else in the scope survives — the planner changed the period, not the
   * company, location, status or search they had set up.
   */
  const handleChange = useCallback((next) => {
    setView(next);
    setScope((previous) => ({ ...previous, ...rangeForView(next, anchorForRange(previous)) }));
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Remembering the choice is a convenience; losing it must not break the switch.
    }
  }, []);

  /* Merged, not replaced: the controls each own one key and none of them should
     have to restate the rest of the scope to change it. */
  const handleScopeChange = useCallback((partial) => {
    setScope((previous) => ({ ...previous, ...partial }));
  }, []);

  /* Falls back through the *default view* rather than naming a component directly:
     the previous fallback hard-coded one, which is a second place for the mapping
     above to be wrong from — and it named the component this fix just re-pointed. */
  const ActiveView = VIEWS[view] || VIEWS[DEFAULT_COMPANIES_VIEW];

  return (
    <Box className={classes.pane}>
      <ActiveView
        data={data}
        loading={loading}
        scope={scope}
        onScopeChange={handleScopeChange}
        onOpenVisit={onOpenVisit}
        view={view}
        onViewChange={handleChange}
      />
    </Box>
  );
};

CompaniesPane.propTypes = {
  /** Opens the existing visit drawer for a real (non-projected) visit. */
  onOpenVisit: PropTypes.func,
  /** Company clicked through from the week grid — preselects the company filter. */
  initialCustomerId: PropTypes.string,
};

export default CompaniesPane;
