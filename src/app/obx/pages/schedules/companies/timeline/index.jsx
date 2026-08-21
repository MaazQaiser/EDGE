import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { Box, IconButton, Skeleton, Tooltip, Typography, useTheme } from '@mui/material';
import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import { Fragment, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formatShiftScheduleTimeRange } from 'src/app/obx/pages/schedules/helper';
import { visitCardLegend } from 'src/app/obx/pages/schedules/helper/visitCardInk';
import { useTenantLabel } from 'src/helper/utilityHooks';
import useDateTime from 'src/hooks/useDateTime';
import { calendarShiftStatusEnum } from 'src/utils/constants/schedules';

import CompaniesFilters from '../CompaniesFilters';
import { COMPANIES_VIEW, isExecutionGrain } from '../companiesViewRange';
import CompaniesViewSwitch from '../CompaniesViewSwitch';
import { narrowCompanies, visitsInDateOrder } from '../companyVisitFilters';
import { visitCardClassFor } from '../visitCardClass';
import { useStyles } from './companiesTimeline.styles';

/**
 * Why the screen is blank, in the grain's own terms.
 *
 * Only the two execution grains get their own line, and only because those two
 * drop their quiet rows and so can land here on an ordinary day. Month keeps every
 * location, so reaching the empty state there means the *book* is empty — which is
 * what `emptyBody` already says, and is genuinely worth a raised eyebrow.
 */
const EMPTY_BODY_KEY = {
  [COMPANIES_VIEW.DAY]: 'emptyDay',
  [COMPANIES_VIEW.WEEK]: 'emptyWeek',
};

/**
 * Companies as a list of stacked visits — **the tab's Day, Week and Month**.
 *
 * A company collapses; its locations are the rows; a row is that location's
 * visits, in date order. There is no month axis — see the note in the stylesheet
 * for why the grid it replaced was mostly empty space.
 *
 * Having no axis is exactly what makes this the right shape for all three of the
 * narrow grains, and why the tab's switch could stop being a density choice: a
 * day, a week and a month are each a short sequence, and a sequence is what this
 * draws. Nothing here is grain-aware except the two things that have to be — how
 * far the payload is trimmed, and what the empty state says — because the same
 * row reads correctly at every one of them. The Year grain mounts the month matrix
 * (`../index`) instead; see `CompaniesPane`'s `VIEWS`.
 */
const CompaniesTimeline = ({
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
  const { is24Hours } = useDateTime();

  /* The swatches, from the same source the cards take their fills from. */
  const legend = useMemo(() => visitCardLegend(theme), [theme]);

  /* Collapse is stored as the exception, not the state of every company: an id in
     here is closed. A company that arrives in a later payload is therefore open by
     default, which is the right answer for a set that grows. */
  const [collapsedIds, setCollapsedIds] = useState(() => new Set());

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
  const locationsTerm = t('obx.schedules.calendar.companies.propertyPlural');
  const locationTerm = t('obx.schedules.calendar.companies.propertySingular');

  const searchTerm = `${scope.query ?? ''}`.trim();
  /* Search wins over the grain: a planner who typed something and got nothing back
     needs to be told about their spelling, not about their Tuesday. */
  const emptyBodyKey = searchTerm ? 'emptySearch' : EMPTY_BODY_KEY[view] || 'emptyBody';

  /* The status filter, the search text and the window trim are applied here rather
     than in the request — see `companyVisitFilters.js`. Keyed on the payload and the
     client keys, not on `scope`, which the pane rebuilds whenever the range moves.

     The trim is what makes this component work at three grains off one fetch: the
     request is rounded out to whole calendar months, so a Day view holds all of
     August and shows the 19th of it. `dropQuiet` follows the grain — on a day or a
     week a location with nothing due is noise, on a month it is the answer. */
  const companies = useMemo(
    () =>
      narrowCompanies(data?.companies || [], {
        status: scope.status,
        query: scope.query,
        from: scope.from,
        to: scope.to,
        dropQuiet: isExecutionGrain(view),
      }),
    [data?.companies, scope.status, scope.query, scope.from, scope.to, view],
  );

  const counts = useMemo(
    () => ({
      companies: companies.length,
      locations: companies.reduce((sum, company) => sum + (company.sites || []).length, 0),
      visits: companies.reduce(
        (sum, company) =>
          sum +
          (company.sites || []).reduce((inner, site) => inner + visitsInDateOrder(site).length, 0),
        0,
      ),
    }),
    [companies],
  );

  const toggleCompany = useCallback((customerId) => {
    setCollapsedIds((previous) => {
      const next = new Set(previous);
      if (next.has(customerId)) next.delete(customerId);
      else next.add(customerId);
      return next;
    });
  }, []);

  const renderVisitCard = (site, visit) => {
    const isOpenable = Boolean(visit.id);
    const cardClasses = [
      classes.visitCard,
      classes[visitCardClassFor(visit)],
      isOpenable ? classes.visitCardClickable : '',
    ]
      .filter(Boolean)
      .join(' ');

    const routeName = visit.runsheetName;

    return (
      <Box
        key={visit.date}
        className={cardClasses}
        onClick={isOpenable ? () => onOpenVisit?.(visit, site) : undefined}
      >
        {/* Two lines, not one. Packed onto a single row, four facts at 11–12px ran
            edge to edge and a row of cards read as one unbroken strip — nothing in
            it was findable because nothing in it had an edge. Split, the top line
            answers *when* and the bottom answers *whose round*, which is the order
            the questions are actually asked in. */}
        <Box className={classes.visitCardBody}>
          <Box className={classes.visitWhen}>
            <Typography className={classes.visitDate}>
              {dayjs(visit.date).format('D MMM')}
            </Typography>
            <Typography className={classes.visitTime}>
              {visit.startsAt
                ? formatShiftScheduleTimeRange(visit.startsAt, visit.endsAt, is24Hours)
                : '—'}
            </Typography>
          </Box>

          <Box className={classes.visitRoute}>
            <Typography
              className={`${classes.visitRouteName} ${
                routeName ? '' : classes.visitRouteUnassigned
              }`}
              title={routeName || t('obx.schedules.calendar.unassigned')}
            >
              {routeName || t('obx.schedules.calendar.unassigned')}
            </Typography>
          </Box>
        </Box>
      </Box>
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
      <Box className={classes.timelinePane}>
        {filters}
        <Box className={classes.scroller}>
          {Array.from({ length: 9 }).map((_, index) => (
            <Box key={index} className={classes.skeletonRow}>
              <Skeleton variant="text" width={180} height={16} />
              <Box className={classes.footerSpacer} />
              {/* Sized to the two-line card, not to the strip it replaced — a
                  skeleton half the height of what lands is a visible jump. */}
              <Skeleton variant="rounded" width={212} height={52} />
              <Skeleton variant="rounded" width={212} height={52} />
            </Box>
          ))}
        </Box>
      </Box>
    );
  }

  return (
    <Box className={classes.timelinePane}>
      {filters}

      {!companies.length ? (
        <Box className={classes.scroller}>
          <Box className={classes.empty}>
            <Typography className={classes.emptyTitle}>
              {t('obx.schedules.calendar.companies.emptyTitle')}
            </Typography>
            {/* Three different reasons for one blank screen, and the copy has to
                name the right one. A search that matched nothing is not a quiet
                period — the period is fine, the spelling is not, and only one of
                those is worth checking. And on Day and Week, where the quiet rows
                are dropped, an empty screen is a *routine* answer rather than a
                sign something is wrong: "no companies have visits in this period"
                overstates a Tuesday with no visits on it. */}
            <Typography className={classes.emptyBody}>
              {t(`obx.schedules.calendar.companies.${emptyBodyKey}`, { query: searchTerm })}
            </Typography>
          </Box>
        </Box>
      ) : (
        <Box className={classes.scroller}>
          {companies.map((company) => {
            const isCollapsed = collapsedIds.has(company.customerId);
            const sites = company.sites || [];
            const unscheduled = sites.filter((site) => !site.intervalMonths).length;

            return (
              <Fragment key={company.customerId}>
                <Box className={classes.groupRow}>
                  <IconButton
                    className={classes.groupToggle}
                    disableRipple
                    size="small"
                    aria-expanded={!isCollapsed}
                    aria-label={company.name}
                    onClick={() => toggleCompany(company.customerId)}
                  >
                    <ExpandMoreIcon
                      className={`${classes.groupToggleIcon} ${
                        isCollapsed ? '' : classes.groupToggleIconOpen
                      }`}
                    />
                  </IconButton>
                  <Typography className={classes.groupName} title={company.name}>
                    {company.name}
                  </Typography>
                  <Typography className={classes.groupMeta}>
                    {t('obx.schedules.calendar.companies.timeline.groupMeta', {
                      count: sites.length,
                      sites: sites.length === 1 ? locationTerm : locationsTerm,
                      visits: company.totalVisits,
                    })}
                  </Typography>
                  {/* A company holding a location nobody services is the one thing
                      worth saying on a closed group, because closing it is exactly
                      how it would otherwise be missed. */}
                  {unscheduled ? (
                    <Typography className={`${classes.groupMeta} ${classes.groupMetaAlert}`}>
                      {t('obx.schedules.calendar.companies.timeline.groupUnscheduled', {
                        count: unscheduled,
                      })}
                    </Typography>
                  ) : null}
                </Box>

                {isCollapsed
                  ? null
                  : sites.map((site) => {
                      const visits = visitsInDateOrder(site);

                      return (
                        <Box className={classes.locationRow} key={site.id}>
                          <Box className={classes.locationCell}>
                            {/* The cadence is a *hover*, not a line. Printed under
                                the name it doubled the height of every row in the
                                book to restate what the dates along that row already
                                show — and it is only ever read when a date looks
                                wrong.

                                The name carries no underline: dotted or not, a rule
                                under a word in a column of words reads as a link, and
                                every row wearing one made the column look like a menu.
                                The affordance is a glyph beside the name instead — it
                                is the thing you hover, so it can be quiet, and only
                                the sites that *have* a cadence grow one. */}
                            <Tooltip title={site.name} placement="top" arrow>
                              <Typography className={classes.locationName}>{site.name}</Typography>
                            </Tooltip>
                            {site.cadenceLabel ? (
                              <Tooltip title={site.cadenceLabel} placement="top" arrow>
                                <Box
                                  className={classes.locationHint}
                                  aria-label={site.cadenceLabel}
                                >
                                  <InfoOutlinedIcon />
                                </Box>
                              </Tooltip>
                            ) : null}
                          </Box>

                          {site.intervalMonths ? (
                            <Box className={classes.visitsCell}>
                              {visits.length ? (
                                visits.map((visit) => renderVisitCard(site, visit))
                              ) : (
                                /* Filtered to nothing, and still a row. Dropping it
                                   would reshuffle the list under the planner every
                                   time they touched the status dropdown; an em dash
                                   says "none of that kind here", which is an answer. */
                                <Typography className={classes.visitsCellEmpty}>—</Typography>
                              )}
                            </Box>
                          ) : (
                            /* The fill is the whole message, same as V2's row — see
                               the note there. Named for assistive tech, which cannot
                               see the fill. */
                            <Box
                              className={classes.notScheduledCell}
                              aria-label={t('obx.schedules.calendar.companies.notScheduled')}
                            />
                          )}
                        </Box>
                      );
                    })}
              </Fragment>
            );
          })}
        </Box>
      )}

      <Box className={classes.footer}>
        <Typography className={classes.footerCount}>
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
        <Box className={classes.footerSpacer} />
        {/* Driven off the same map the cards are painted from, so the legend cannot
            name a colour the cards stopped drawing — which is the one way a legend is
            worse than none at all. The swatches used to be four hand-written hex
            pairs here, and two of them had already fallen out of step. */}
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

CompaniesTimeline.propTypes = {
  /** The tab's payload, fetched once by the pane. */
  data: PropTypes.object,
  loading: PropTypes.bool,
  /** `{ from, to, customerIds, siteIds }` — owned by the pane, shared by all views. */
  scope: PropTypes.object.isRequired,
  onScopeChange: PropTypes.func.isRequired,
  /** Opens the existing visit drawer for a visit. */
  onOpenVisit: PropTypes.func,
  /** The active grain — one of `day`, `week` or `month`; never `year`. */
  view: PropTypes.oneOf(Object.values(COMPANIES_VIEW)).isRequired,
  /** Handed to the view switch; owned by `CompaniesPane`, not this view. */
  onViewChange: PropTypes.func.isRequired,
};

export default CompaniesTimeline;
