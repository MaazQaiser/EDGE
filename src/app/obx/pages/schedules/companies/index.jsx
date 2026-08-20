import { Box, Skeleton, TableCell, TableRow, Tooltip, Typography, useTheme } from '@mui/material';
import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { visitCardLegend } from 'src/app/obx/pages/schedules/helper/visitCardInk';
import { useTenantLabel } from 'src/helper/utilityHooks';
import { calendarShiftStatusEnum } from 'src/utils/constants/schedules';

import { dayjsWithStandardOffset } from '../helper';
import { COMPANIES_COLUMNS, useStyles } from './companies.styles';
import CompaniesFilters from './CompaniesFilters';
import { COMPANIES_VIEW } from './companiesViewRange';
import CompaniesViewSwitch from './CompaniesViewSwitch';
import { narrowCompanies } from './companyVisitFilters';

/**
 * A visit's card treatment comes from the calendar's own status vocabulary, so a
 * visit reads the same here as it does on the week grid. Projection is the only
 * mark this surface adds, because it is the only thing the grid has no
 * equivalent for.
 */
const STATUS_CARD_CLASS = {
  [calendarShiftStatusEnum.COMPLETED]: 'visitCardCompleted',
  [calendarShiftStatusEnum.IN_PROGRESS]: 'visitCardLive',
  [calendarShiftStatusEnum.SHIFT_STARTED]: 'visitCardLive',
  [calendarShiftStatusEnum.MISSED]: 'visitCardMissed',
  [calendarShiftStatusEnum.CANCELLED]: 'visitCardCancelled',
  [calendarShiftStatusEnum.UNASSIGNED]: 'visitCardUnassigned',
  [calendarShiftStatusEnum.NOT_STARTED]: 'visitCardScheduled',
};

/**
 * The window in the calendar's own clock format — `8a - 10a`, not `08:00`.
 *
 * Resolved through `dayjsWithStandardOffset`, the same franchise-offset helper
 * the week grid places its cards with. Formatting in browser-local time instead
 * put this card an hour or two off the identical visit on the grid, for any
 * viewer not sitting in the franchise's timezone.
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
}) => {
  const classes = useStyles();
  const theme = useTheme();
  const { t } = useTranslation();
  const { getLabel } = useTenantLabel();

  /* The swatches, from the same source the cards take their fills from. */
  const legend = useMemo(() => visitCardLegend(theme), [theme]);

  /* One noun for the physical address, taken from the plural label and
     singularised — asking `getLabel` for both forms returned "Sites" and
     "Location" on this tenant, so the column header and the search box named the
     same thing two different ways. */
  const locationsTerm = getLabel('terms', 'sites', t) || 'Locations';
  const locationTerm = locationsTerm.replace(/s$/i, '') || locationsTerm;

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

  const renderVisitCard = (site, visit) => {
    const isOpenable = Boolean(visit.id);
    const cardClasses = [
      classes.visitCard,
      classes[STATUS_CARD_CLASS[visit.status]] || classes.visitCardScheduled,
      isOpenable ? classes.visitCardClickable : '',
    ]
      .filter(Boolean)
      .join(' ');

    const dateLabel = dayjs(visit.date).format('D MMM');
    const timeLabel = visit.startsAt ? formatVisitWindow(visit.startsAt, visit.endsAt) : null;

    const tooltip = t('obx.schedules.calendar.companies.visitOn', {
      date: dayjs(visit.date).format('D MMM YYYY'),
      status: visit.status,
    });

    return (
      <Tooltip key={visit.date} title={tooltip} placement="top" arrow>
        <Box
          className={cardClasses}
          onClick={isOpenable ? () => onOpenVisit?.(visit, site) : undefined}
        >
          {/* **Date first.** The column is a whole month wide, so the first thing
              asked of a card in it is *which day* — the window is the follow-up, and
              leading with it made the reader skip a clause to find the answer. No
              technician here either: who is on it is a question for the visit
              drawer, and a 16px avatar could only ever say "somebody". */}
          <Typography className={classes.visitCardTime}>
            {dateLabel}
            {timeLabel ? (
              <>
                <span className={classes.visitCardDot}>·</span>
                <span className={classes.visitCardTimeText}>{timeLabel}</span>
              </>
            ) : null}
          </Typography>
        </Box>
      </Tooltip>
    );
  };

  const filters = (
    <CompaniesFilters
      scope={scope}
      onChange={onScopeChange}
      companies={data?.filterOptions?.companies}
      view={view}
      viewSwitch={<CompaniesViewSwitch value={view} onChange={onViewChange} />}
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
          <table className={classes.companiesTable}>
            {/* Explicit widths: `table-layout: fixed` plus a row-spanning first
                column means the frozen pane's `left` offsets have to match the
                columns exactly, or the sticky cells overlap as it scrolls. */}
            <colgroup>
              <col style={{ width: COMPANIES_COLUMNS.COMPANY_WIDTH }} />
              <col style={{ width: COMPANIES_COLUMNS.LOCATION_WIDTH }} />
              {months.map((month) => (
                <col
                  key={`${month.year}-${month.month}`}
                  style={{ width: COMPANIES_COLUMNS.MONTH_WIDTH }}
                />
              ))}
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
                  {locationsTerm}
                </TableCell>
                {months.map((month, index) => {
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
                      {stamp.format("MMM 'YY")}
                    </TableCell>
                  );
                })}
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

                      {site.intervalMonths ? (
                        (site.months || []).map((visits, index) => (
                          <TableCell
                            key={index}
                            className={`${classes.monthCell} ${
                              index === 0 ? classes.monthCellFirst : ''
                            }`}
                          >
                            {visits.map((visit) => renderVisitCard(site, visit))}
                          </TableCell>
                        ))
                      ) : (
                        /* The fill is the whole message. The sentence that used to run
                           along here restated what the empty row already shows, once
                           per unscheduled location, and read as a warning about a
                           location that is simply on the books without a cadence. It is
                           still named for assistive tech, which cannot see the fill. */
                        <TableCell
                          className={classes.notScheduledCell}
                          colSpan={months.length}
                          aria-label={t('obx.schedules.calendar.companies.notScheduled')}
                        />
                      )}
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
};

export default SchedulesCompanies;
