import { Box, Skeleton, TableCell, TableRow, Tooltip, Typography, useTheme } from '@mui/material';
import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { visitCardLegend } from 'src/app/obx/pages/schedules/helper/visitCardInk';
import { useTenantLabel } from 'src/helper/utilityHooks';

import { dayjsWithStandardOffset } from '../helper';
import { COMPANIES_COLUMNS, useStyles } from './companies.styles';
import CompaniesCollapseButton from './CompaniesCollapseButton';
import CompaniesFilters from './CompaniesFilters';
import { COMPANIES_VIEW } from './companiesViewRange';
import CompaniesViewSwitch from './CompaniesViewSwitch';
import { narrowCompanies, visitsInDateOrder } from './companyVisitFilters';
import { isCollapsed, readMatrixDensity, writeMatrixDensity } from './matrixDensity';
import { siteTerms } from './siteTerm';
import { visitCardClassFor } from './visitCardClass';

/**
 * What a card says: **the date, carrying its year, and nothing else.**
 *
 * The clock window came off. It was the card's second clause — `19 Aug · 8a - 10a`
 * — and it was answering a question this surface does not ask: a twelve-month view
 * is read for *which day*, and the hour a technician arrives is a fact for the visit
 * drawer, on a screen where the row above and below are different buildings. Asked
 * for directly. The `dayjsWithStandardOffset` franchise-offset dance went with it,
 * since `visit.date` is a plain `YYYY-MM-DD` key with no timezone to resolve.
 *
 * The year came on in its place. It keeps the short `'YY` form while the column
 * headings and the date pill print theirs in full, and the difference is deliberate:
 * this label leads with a day, so `'26` cannot be misread as one. Those two print no
 * day, which is what made the short form ambiguous there — see `formatRangeLabel`. It is redundant
 * against the heading in the expanded reading — the card sits *under* `Aug '26` —
 * and load-bearing in the collapsed one, where there is no heading and a strip of
 * cards can run from this December into next. One format for both readings rather
 * than a card that changes what it says depending on how wide its cell is.
 */
const formatVisitDate = (date) => dayjs(date).format("D MMM 'YY");

/**
 * The window in the calendar's own clock format — `8a - 10a`, not `08:00`.
 *
 * This was the card's second clause until it was asked off. It comes back here as a
 * **tooltip** line rather than card text: the objection was to it spending width in a
 * cell scanned twelve-to-a-row, not to the fact itself, and a planner who wants the
 * hour is now the planner who hovered.
 *
 * Resolved through `dayjsWithStandardOffset`, the same franchise-offset helper the
 * week grid places its cards with. Formatting in browser-local time instead put this
 * an hour or two off the identical visit on the grid, for any viewer not sitting in
 * the franchise's timezone.
 */
const formatVisitClock = (iso) => {
  const stamp = dayjsWithStandardOffset(iso);
  const suffix = stamp.hour() < 12 ? 'a' : 'p';
  return stamp.minute() ? `${stamp.format('h:mm')}${suffix}` : `${stamp.format('h')}${suffix}`;
};

const formatVisitWindow = (startsAt, endsAt) =>
  endsAt
    ? `${formatVisitClock(startsAt)} - ${formatVisitClock(endsAt)}`
    : formatVisitClock(startsAt);

const SchedulesCompanies = ({
  data,
  loading,
  scope,
  onScopeChange,
  onOpenVisit,
  view,
  onViewChange,
  groupingSwitch = null,
}) => {
  const classes = useStyles();
  const theme = useTheme();
  const { t } = useTranslation();
  const { getLabel } = useTenantLabel();

  /* The swatches, from the same source the cards take their fills from. */
  const legend = useMemo(() => visitCardLegend(theme), [theme]);

  /**
   * Expanded or collapsed — owned here, not by the pane.
   *
   * This was pinned to a constant for a while, when the packed reading was asked
   * for as *the* view. The note left at the time said keeping both branches cost a
   * constant where deleting them cost the ability to look at the axis again, "which
   * is the sort of thing that gets asked for once the packed rows have been lived
   * with". It was, so the state and its control come back exactly as they were —
   * the branches below never moved.
   *
   * What did move is the landing: `DEFAULT_MATRIX_DENSITY` is collapsed now, so the
   * pane opens on the packed reading it opens on today and the button is what asks
   * for the twelve columns.
   *
   * Owned here rather than by the pane, which owns what is true of the *tab*: the
   * scope and the one fetch that serves it, because every view reads them. This is
   * true of one view only — the grouped list has no month axis to drop — so lifting
   * it would put a piece of this component's own layout in a parent that cannot use
   * it, and hand it to the grouped list as a prop it would have to ignore.
   *
   * Persisted rather than held in state alone: the pane is remounted on every
   * scheduler tab round-trip. See `matrixDensity.js`.
   */
  const [density, setDensity] = useState(readMatrixDensity);
  const collapsed = isCollapsed(density);

  const handleDensityChange = useCallback((next) => {
    setDensity(next);
    writeMatrixDensity(next);
  }, []);

  /**
   * **Property, not Site** — this view's own word for the physical address.
   *
   * It asked the tenant (`getLabel('terms', 'sites')`) and rendered "Sites". Changed
   * on request, and the change is narrower than it looks: this is the one surface whose
   * design record already speaks this way. `docs/visits-feature/07-consolidated-visits-view.html`
   * is written in "property" throughout — *the year is property-major*, *visit count per
   * property*, *property with no recurring service* — so the screen and the document
   * describing it now use one noun.
   *
   * Deliberately **not** pushed into the tenant label set. `terms.sites` is read by the
   * sites module, the scheduler's own filters and half the app besides; renaming it there
   * to suit this table would rename it on twenty screens nobody asked about. The cost of
   * keeping it local is that a tenant who calls these something else third thing will not
   * see it here — noted, and cheaper than the alternative.
   *
   * The **header takes the singular**, which also settles a small inconsistency it had
   * with its neighbour: the first column has always been "Company", not "Companies", and
   * "Sites" beside it was the odd one. Counts keep the plural.
   */
  /* The tenant's word, so this column and the filter dropdown above it cannot disagree
     — see `siteTerm.js`, which is also where the retired `Property` is explained. */
  const { singular: locationTerm, plural: locationsTerm } = siteTerms(getLabel, t);

  /* The tenant's own words for the two facts the tooltip adds. These two *do* ask the
     tenant, unlike the property vocabulary above — a route and the person on it are the
     tenant's own objects, named differently per franchise, where "property" is this
     view's own noun for the thing every tenant has.

     The **fallbacks are the generic nouns, not Filter Go's**. They read `Route` and
     `Technician` first, which are that tenant's words, so a tenant with no label set
     silently borrowed another tenant's vocabulary — and one of them has since moved
     (Filter Go's officer term is now `Installer`), which is what made the borrowed
     copy visibly stale. `Runsheet` / `Officer` are what the rest of the app falls back
     to (see `getFooterPresentation` in `scheduleStatsFooter`), and a fallback's job is
     to be the neutral word, not a guess at whose tenant this is. */
  const runsheetTerm = getLabel('terms', 'runsheet', t) || 'Runsheet';
  const officerTerm = getLabel('terms', 'officer', t) || 'Officer';

  const months = data?.months || [];
  const searchTerm = `${scope.query ?? ''}`.trim();

  /* Company and location are already narrowed by the endpoint — they are scope. The
     status filter, the search text and the window trim are not, and are applied
     through the shared helper so this view and the grouped list hide exactly the
     same visits. This view used to hold a search of its own, which is why the same
     filter had to be set again after every view switch.

     `from`/`to` are passed even though this is the one view where they are usually
     a no-op — the request is rounded out to whole months, and the Year window is
     already whole months, so nothing normally falls outside it. It stops being a
     no-op the moment a planner drags a *ragged* range on this view: the endpoint is
     then asked for March-through-December and shows March 1st to December 31st,
     while the pill says the 12th to the 6th. This is the cut that keeps those two
     agreeing. `dropQuiet` is deliberately absent — a year of nothing is exactly the
     row a planner needs to see. */
  const visibleCompanies = useMemo(
    () =>
      narrowCompanies(data?.companies || [], {
        status: scope.status,
        query: scope.query,
        from: scope.from,
        to: scope.to,
      }),
    [data?.companies, scope.status, scope.query, scope.from, scope.to],
  );

  const counts = useMemo(
    () => ({
      companies: visibleCompanies.length,
      locations: visibleCompanies.reduce((sum, company) => sum + (company.sites || []).length, 0),
    }),
    [visibleCompanies],
  );

  /**
   * What hovering a card says.
   *
   * **No status.** It used to lead with one — `19 Aug 2026 · notStarted` — which was
   * the raw enum, untranslated, and it was the one thing on the card a reader did not
   * need told: the fill already encodes the state and the legend below names every
   * fill. Asked to come off.
   *
   * What replaces it is the detail the card has no room for. The card is one line in
   * a cell scanned twelve-to-a-row, so everything else a planner might want of a
   * visit had nowhere to go:
   *
   * - **The weekday**, which the card's `19 Aug '26` cannot give and which is the
   *   first thing anyone asks of a date more than a week out.
   * - **The window**, which was on the card until it was asked off.
   * - **The route and who is on it** — never shown anywhere on this surface, and the
   *   two questions that follow "when".
   *
   * The location is deliberately *not* repeated: it is the row, and its column is
   * sticky, so it is on screen already however far right the year has scrolled.
   *
   * **A projected visit gets the date and nothing more.** D19 in
   * `docs/visits-feature/06-visits-scheduler-edge-cases.md`: projected dates carry no
   * route and no status and are inert — arithmetic, not records — so printing "not on
   * a route" for one would be the screen asserting something the system does not
   * know. A missing `id` is what marks them, the same test the click target uses.
   */
  const renderVisitTooltip = (visit) => {
    const isProjected = !visit.id;
    const window = visit.startsAt ? formatVisitWindow(visit.startsAt, visit.endsAt) : null;

    return (
      <Box className={classes.visitTooltip}>
        <Typography className={classes.visitTooltipDate}>
          {dayjs(visit.date).format('ddd D MMM YYYY')}
        </Typography>
        {window ? <Typography className={classes.visitTooltipLine}>{window}</Typography> : null}
        {isProjected ? null : (
          <>
            <Typography className={classes.visitTooltipLine}>
              {visit.runsheetName
                ? `${runsheetTerm}: ${visit.runsheetName}`
                : t('obx.schedules.calendar.companies.visitTooltip.noRoute', {
                    runsheet: runsheetTerm.toLowerCase(),
                  })}
            </Typography>
            {visit.officer?.name ? (
              <Typography className={classes.visitTooltipLine}>
                {`${officerTerm}: ${visit.officer.name}`}
              </Typography>
            ) : null}
          </>
        )}
      </Box>
    );
  };

  /**
   * One card. `packed` is the only thing either reading changes about it — the
   * fills, the copy, the click target and the tooltip are identical, which is what
   * makes the two a density choice rather than two designs of a card.
   */
  const renderVisitCard = (site, visit, { packed = false } = {}) => {
    const isOpenable = Boolean(visit.id);
    const cardClasses = [
      classes.visitCard,
      classes[visitCardClassFor(visit)],
      isOpenable ? classes.visitCardClickable : '',
      packed ? classes.visitCardPacked : '',
    ]
      .filter(Boolean)
      .join(' ');

    const tooltip = renderVisitTooltip(visit);

    return (
      <Tooltip key={visit.id || visit.date} title={tooltip} placement="top" arrow>
        <Box
          className={cardClasses}
          onClick={isOpenable ? () => onOpenVisit?.(visit, site) : undefined}
        >
          {/* The date, and only the date — see `formatVisitDate`. No technician
              either: who is on it is a question for the visit drawer, and a 16px
              avatar could only ever say "somebody". */}
          <Typography className={classes.visitCardTime}>{formatVisitDate(visit.date)}</Typography>
        </Box>
      </Tooltip>
    );
  };

  /**
   * The cells to the right of the frozen pane, in whichever reading is active.
   *
   * Both branches have to agree about **how many cells** they produce, because the
   * `colgroup` above is already committed: twelve months means twelve `<col>`s and
   * twelve cells, collapsed means one and one. A mismatch does not throw — it
   * silently pushes every later row's borders out of alignment with the header,
   * which is the kind of bug this view has had before. Written as one function so
   * the two branches sit next to each other and that count is checkable by eye.
   */
  const renderVisitCells = (site) => {
    if (collapsed) {
      /* No cadence on file. The grey fill the expanded reading uses says this
         across twelve columns; across one it would be a small grey box that reads
         as "nothing due this year" instead, so the fact is stated in words. */
      if (!site.intervalMonths) {
        return (
          <TableCell className={classes.collapsedCell}>
            <Typography className={classes.notScheduledText}>
              {t('obx.schedules.calendar.companies.notScheduled')}
            </Typography>
          </TableCell>
        );
      }

      return (
        <TableCell className={classes.collapsedCell}>
          <Box className={classes.collapsedStrip}>
            {visitsInDateOrder(site).map((visit) => renderVisitCard(site, visit, { packed: true }))}
          </Box>
        </TableCell>
      );
    }

    if (!site.intervalMonths) {
      /* The fill is the whole message. The sentence that used to run along here
         restated what the empty row already shows, once per unscheduled location,
         and read as a warning about a location that is simply on the books without
         a cadence. It is still named for assistive tech, which cannot see the
         fill. */
      return (
        <TableCell
          className={classes.notScheduledCell}
          colSpan={months.length}
          aria-label={t('obx.schedules.calendar.companies.notScheduled')}
        />
      );
    }

    return (site.months || []).map((visits, index) => (
      <TableCell
        key={index}
        className={`${classes.monthCell} ${index === 0 ? classes.monthCellFirst : ''}`}
      >
        {visits.map((visit) => renderVisitCard(site, visit))}
      </TableCell>
    ));
  };

  const filters = (
    <CompaniesFilters
      scope={scope}
      onChange={onScopeChange}
      companies={data?.filterOptions?.companies}
      view={view}
      viewSwitch={<CompaniesViewSwitch value={view} onChange={onViewChange} />}
      leadingSwitch={groupingSwitch}
      /* The one control that belongs to this view rather than to the tab: it changes
         how the rows are *drawn*, where everything to its left changes which rows are
         on screen. `CompaniesFilters` fences it off behind its own rule for that
         reason, and draws neither when the slot is empty — which is what the grouped
         list, having no month axis to fold, threads in. */
      filterAction={<CompaniesCollapseButton value={density} onChange={handleDensityChange} />}
    />
  );

  if (loading) {
    return (
      <Box className={classes.companiesPane}>
        {/* The real row, not a skeleton of it. The controls are live before the first
            payload lands — the date range and the status are what the planner sets
            *while* waiting — and greying them out was also the one moment the two
            views' toolbars did not match, which is the thing the switch must never
            change. */}
        {filters}
        <Box className={classes.companiesTableScroller}>
          {Array.from({ length: 10 }).map((_, index) => (
            <Box key={index} className={classes.skeletonRow}>
              <Skeleton variant="text" width={160} height={16} />
              <Skeleton variant="text" width={190} height={16} />
              <Box className={classes.companiesToolbarSpacer} />
              <Skeleton variant="rounded" width={360} height={44} />
            </Box>
          ))}
        </Box>
      </Box>
    );
  }

  return (
    <Box className={classes.companiesPane}>
      {filters}

      {!visibleCompanies.length ? (
        <Box className={classes.companiesTableScroller}>
          <Box className={classes.companiesEmpty}>
            <Typography className={classes.companiesEmptyTitle}>
              {t('obx.schedules.calendar.companies.emptyTitle')}
            </Typography>
            {/* "No companies have visits in this period" is a lie when the reason is
                a search that matched nothing — the period is fine, the spelling is
                not, and only one of those is worth checking. */}
            <Typography className={classes.companiesEmptyBody}>
              {searchTerm
                ? t('obx.schedules.calendar.companies.emptySearch', { query: searchTerm })
                : t('obx.schedules.calendar.companies.emptyBody')}
            </Typography>
          </Box>
        </Box>
      ) : (
        <Box className={classes.companiesTableScroller}>
          <table
            className={`${classes.companiesTable} ${
              collapsed ? classes.companiesTableCollapsed : ''
            }`}
          >
            {/* Explicit widths: `table-layout: fixed` plus a row-spanning first
                column means the frozen pane's `left` offsets have to match the
                columns exactly, or the sticky cells overlap as it scrolls. The two
                frozen columns keep their widths in both readings — they are what the
                sticky offsets are computed from. Collapsed replaces the twelve month
                columns with one unsized one, so the strip takes whatever is left
                rather than a width derived from a month. */}
            <colgroup>
              <col style={{ width: COMPANIES_COLUMNS.COMPANY_WIDTH }} />
              <col style={{ width: COMPANIES_COLUMNS.LOCATION_WIDTH }} />
              {collapsed ? (
                <col />
              ) : (
                months.map((month) => (
                  <col
                    key={`${month.year}-${month.month}`}
                    style={{ width: COMPANIES_COLUMNS.MONTH_WIDTH }}
                  />
                ))
              )}
            </colgroup>

            <thead>
              {/* `component="th"` is not decoration. MUI's TableCell decides th
                  versus td from its Table/TableHead context, and this is a plain
                  `<table>` — without it every column header rendered as a `<td>`
                  and the grid had no header semantics at all. */}
              <TableRow>
                <TableCell
                  component="th"
                  scope="col"
                  className={`${classes.headCell} ${classes.stickyCompany}`}
                >
                  {t('obx.schedules.calendar.companies.companyColumn')}
                </TableCell>
                <TableCell
                  component="th"
                  scope="col"
                  className={`${classes.headCell} ${classes.stickyLocation}`}
                >
                  {locationTerm}
                </TableCell>
                {/* **Collapsed drops the month headings.** They are the axis, and
                    the axis is what this reading trades away — twelve headings over
                    a strip that no longer lines up with them would be worse than
                    none. The two frozen headings stay: they name the rows, not the
                    columns, and the strip gets a heading of its own so the third
                    column is not the one unlabelled thing in the row. */}
                {collapsed ? (
                  <TableCell component="th" scope="col" className={classes.headCell}>
                    {t('obx.schedules.calendar.companies.visitsColumn')}
                  </TableCell>
                ) : (
                  months.map((month, index) => {
                    const stamp = dayjs().year(month.year).month(month.month);
                    /* "Is this now" is a date test, not an index one. It used to be
                       `monthOffset === 0 && index === 0`, which was true while the
                       window always started at today's month — with a date range the
                       first column can be any month, and `monthOffset` no longer
                       exists at all, so this threw and took the whole view down. */
                    const isCurrentMonth = stamp.isSame(dayjs(), 'month');
                    return (
                      <TableCell
                        component="th"
                        scope="col"
                        key={`${month.year}-${month.month}`}
                        className={`${classes.headCell} ${classes.headCellMonth} ${
                          index === 0 ? classes.headCellMonthFirst : ''
                        } ${isCurrentMonth ? classes.headCellCurrent : ''}`}
                      >
                        {/* Full year, not `'26` — a two-digit year with no day beside
                            it reads as a day-of-month. See `formatRangeLabel`. */}
                        {stamp.format('MMM YYYY')}
                      </TableCell>
                    );
                  })
                )}
              </TableRow>
            </thead>

            <tbody>
              {visibleCompanies.flatMap((company) =>
                (company.sites || []).map((site, siteIndex) => {
                  const isLastOfCompany = siteIndex === (company.sites || []).length - 1;

                  return (
                    <TableRow
                      key={`${company.customerId}-${site.id}`}
                      className={`${classes.bodyRow} ${isLastOfCompany ? classes.groupEndRow : ''}`}
                    >
                      {siteIndex === 0 ? (
                        /* Stated once and spanned down its locations, so the
                           column reads as a column instead of a repeated label. */
                        <TableCell
                          rowSpan={(company.sites || []).length}
                          className={`${classes.stickyCompany} ${classes.companyCell}`}
                        >
                          <Typography className={classes.companyName}>{company.name}</Typography>
                        </TableCell>
                      ) : null}

                      {/* The name and nothing else. The cadence was a second line
                          on every row restating what the filled cells across the row
                          already show — twelve months of dates *are* the interval —
                          and it was the reason a row needed two lines' height. */}
                      <TableCell className={classes.stickyLocation}>
                        <Typography className={classes.locationName} title={site.name}>
                          {site.name}
                        </Typography>
                      </TableCell>

                      {/* Same row, two readings of the space to its right.

                          Expanded: one cell per month in the window, each holding
                          whatever falls in it — position answers "which month"
                          before anything is read, and that is what the twelve
                          columns buy.

                          Collapsed: one cell, holding every visit the location is
                          due in date order, packed. The month axis is gone, so the
                          card's own date carries the answer instead (which is why it
                          now states its year), and a quarterly location takes three
                          cards' width rather than three cells in twelve. */}
                      {renderVisitCells(site)}
                    </TableRow>
                  );
                }),
              )}
            </tbody>
          </table>
        </Box>
      )}

      <Box className={classes.companiesFooter}>
        <Typography className={classes.companiesFooterCount}>
          {t('obx.schedules.calendar.companies.footer', {
            companies: counts.companies,
            companyWord: t(
              counts.companies === 1
                ? 'obx.schedules.calendar.companies.companySingular'
                : 'obx.schedules.calendar.companies.companyPlural',
            ),
            count: counts.locations,
            sites: counts.locations === 1 ? locationTerm : locationsTerm,
          })}
        </Typography>
        <Box className={classes.companiesToolbarSpacer} />
        {/* The same list V1 renders, from the same map the cards are painted from —
            so the two views cannot describe the same fill with different swatches,
            which is what four hand-written hex pairs per view had already produced. */}
        {legend.map((item) => (
          <span className={classes.legendItem} key={item.id}>
            <span className={classes.legendSwatch} style={item.style} />
            {t(item.labelKey)}
          </span>
        ))}
      </Box>
    </Box>
  );
};

SchedulesCompanies.propTypes = {
  /** The tab's payload, fetched once by the pane. */
  data: PropTypes.object,
  loading: PropTypes.bool,
  /** `{ from, to, customerIds, siteIds }` — owned by the pane, shared by all views. */
  scope: PropTypes.object.isRequired,
  onScopeChange: PropTypes.func.isRequired,
  /** Opens the existing visit drawer for a real (non-projected) visit. */
  onOpenVisit: PropTypes.func,
  /** The active grain. Always `year` here — this view is what Year mounts. */
  view: PropTypes.oneOf(Object.values(COMPANIES_VIEW)).isRequired,
  /** Handed to the view switch; owned by `CompaniesPane`, not this view. */
  onViewChange: PropTypes.func.isRequired,
  /**
   * The scheduler's grouping switch, threaded straight through to
   * `CompaniesFilters`'s leading slot. Owned by the calendar, not by this view or the
   * pane — see `CompaniesPane`.
   */
  groupingSwitch: PropTypes.node,
};

export default SchedulesCompanies;
