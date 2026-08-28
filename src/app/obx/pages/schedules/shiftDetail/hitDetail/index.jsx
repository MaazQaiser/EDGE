import { Avatar, Box, Button, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import PropTypes from 'prop-types';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { getVisitActionRules } from 'src/app/obx/pages/schedules/helper/visitState';
import { useTenantLabel } from 'src/helper/utilityHooks';

import RunsheetHits from '../../../runSheets/components/runsheetHits';
import { useStyles as useRunsheetHitsStyles } from '../../../runSheets/components/runsheetHits/runsheetHits.style';

/**
 * The customer a visit belongs to, read the same defensive chain
 * `ScheduleCalendarGrid.resolveVisitCompanyName` uses for the grid's own company chip.
 * Duplicated rather than imported — that function is local to a grid component and isn't
 * exported. **Change both if either changes.**
 */
const resolveCompanyName = (hit = {}) =>
  `${
    hit.company?.name ||
    hit.companyName ||
    hit.customer?.name ||
    hit.customerName ||
    hit.site?.company ||
    hit.site?.companyName ||
    ''
  }`.trim();

/** One more field in `RunsheetHits`' three-column grid — wraps to its own row for free. */
const Field = ({ label, value }) => {
  const classes = useRunsheetHitsStyles();
  const { t } = useTranslation();

  return (
    <Box className={classes.hitItem}>
      <Typography variant="body3" className={classes.hitItemTitle}>
        {label}
      </Typography>
      <Typography variant="subtitle2" className={classes.hitItemSubTitle}>
        {value || t('commonText.nA')}
      </Typography>
    </Box>
  );
};

Field.propTypes = {
  label: PropTypes.string,
  value: PropTypes.node,
};

/**
 * The route card, **borrowed whole from the reassign picker.**
 *
 * Every value here is copied from `reassignHitDrawerContent`'s `reassignHit*` classes: the
 * 8px radius, the `surfaceGreySubtle` fill, the 12px padding, the 6px column gap, the 8px
 * head row, the 6px body row with its dotted separators, the 16px avatar. That is the point
 * — a planner picks a route from those cards and then reads the result here, and the two
 * should be the same object seen twice rather than two designs of one idea.
 *
 * **Copied rather than imported**, for one reason: in the picker the card is a `<button>`
 * that selects, so it carries `cursor: pointer`, a hover fill, a focus ring, a selected
 * state and `width: calc(100% - 20px)` (the pane's scrollbar allowance). None of that is
 * true of a card that *reports* which route claimed this visit. Importing the sheet would
 * bring five affordances this card must not offer, and stripping them at the call site is
 * how the two drift anyway. If the card's own look changes, change it in both — that is the
 * cost of the copy, and it is cheaper than a shared class that has to be a button in one
 * place and a panel in the other.
 */
const useRouteWidgetStyles = makeStyles((theme) => ({
  card: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '6px',
    padding: '12px',
    borderRadius: '8px',
    backgroundColor: theme.palette.surfaceGreySubtle,
    /* Full width, unlike the picker's `calc(100% - 20px)` — there is no scrollbar to
       leave room for here, and one card in a panel should fill its column. */
    width: '100%',
    boxSizing: 'border-box',
    /* No hover, no focus ring, no pointer: this card is a read-out. The only thing you
       can press is the action inside it. */
    border: '1px solid transparent',
  },

  /* The name's row, with the action pushed to the far end. `space-between` rather than
     `margin-left: auto` on the button, so the row reads the same when the action is
     absent — which is most read-only states. */
  head: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '8px',
    width: '100%',
    minWidth: 0,
  },

  /* `h4`, the picker's own title weight. Ellipsised, because a route is named after its
     site plus a word ("Northgate Cold Storage Route") and this column is ~330px. */
  title: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
      minWidth: 0,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
  },
  /* Unrouted puts a *state* where a name goes, so it takes the state's colour. The same
     amber the grid's cards and the officer/vehicle fields use for "nobody yet". */
  titleUnassigned: {
    '&.MuiTypography-root': { color: theme.palette.textWarning || '#B54708' },
  },

  /* `N stops · avatar Name · N of M done`. The picker's body row exactly. */
  body: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '6px',
    minWidth: 0,
  },
  bodyText: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    '&.MuiTypography-root': { color: theme.palette.textSecondary1 },
  },
  user: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    '& .MuiAvatar-root': { width: '16px', height: '16px' },
    '& .MuiTypography-root': { color: theme.palette.textSecondary1 },
  },
  /* The dot between facts, drawn rather than imported: the picker uses a `DotIcon` asset,
     and a 3px round span is the same mark without a second SVG in this file. */
  dot: {
    width: '3px',
    height: '3px',
    borderRadius: '50%',
    flexShrink: 0,
    backgroundColor: theme.palette.textSecondary2,
  },

  /**
   * The one element the picker's card does not have.
   *
   * "How much of this route is done" is the question this widget exists to answer, and a
   * fraction on the body line answers it in words but not at a glance — a planner scanning
   * the drawer should see *most of the way* or *barely started* without reading. So: a 4px
   * track as the card's last row, which is a shape the product already uses for exactly
   * this (`ShiftVisitsStatus` on the dedicated and route panels).
   *
   * It is deliberately the **last** row. Above the body it would separate the name from
   * the facts about it; as the final row it reads as a footer to the whole card.
   */
  track: {
    width: '100%',
    height: '4px',
    borderRadius: '2px',
    overflow: 'hidden',
    backgroundColor: theme.palette.borderSubtle1,
  },
  trackFill: {
    height: '100%',
    borderRadius: '2px',
    backgroundColor: theme.palette.surfaceBrand,
    transition: 'width 240ms ease',
  },
  /* Finished rounds go quiet rather than staying brand-bright: a full bar in the accent
     colour reads as "look here", and a completed route needs nothing. */
  trackFillDone: {
    backgroundColor: theme.palette.textSecondary2,
  },

  action: {
    '&.MuiButton-root': {
      flexShrink: 0,
      minWidth: 0,
      height: 'auto',
      padding: 0,
      /* `subtitle3`'s size, so the control sits on the title's line without lifting it. */
      fontSize: '13px',
      fontWeight: 600,
    },
  },

  /**
   * The blocked reason, **on the card and not in a tooltip.**
   *
   * It used to be a `title` attribute on the widget, which meant the one sentence
   * explaining why there is no button was reachable only by hovering the card and waiting
   * — invisible on touch, invisible to anybody who did not think to hover, and invisible
   * in a screenshot. A visit that cannot be re-routed should say so where the button would
   * have been.
   */
  reason: {
    '&.MuiTypography-root': { color: theme.palette.textSecondary2 },
  },
}));

/**
 * Which route this visit sits on, how far that round has got, and the way to change it.
 *
 * ## One card, four states
 *
 * The card is the reassign picker's route card (see `useRouteWidgetStyles`). The states are
 * variations *inside* it — the head's title slot, the body's facts, and whether the action
 * and the track are drawn — rather than four different shapes:
 *
 * | | head | body | track | action |
 * |---|---|---|---|---|
 * | **Routed, actionable** | route name | `N stops · assignee · N of M done` | yes | `Change` |
 * | **Routed, read-only** | route name | same facts | yes | the reason instead |
 * | **Unrouted, actionable** | `Unassigned`, amber | "not on a route" hint | no | `Assign` |
 * | **Unrouted, blocked** | `Unassigned`, amber | the reason | no | none |
 *
 * **No track when unrouted**, in either state: a visit nobody has routed has no round to be
 * partway through, and a 0/0 bar is a claim about a thing that does not exist.
 *
 * ## What the action opens
 *
 * `onAssignRoute` — the same drawer in both states. It is
 * `components/reassignHitDrawerContent`, the picker used to reassign missed visits, whose
 * rows are the card above: name, same-day chip, window, stop count, assignee. So assigning
 * and reassigning are one flow with one UI, and the card a planner chooses in is the card
 * they end up reading here.
 *
 * ## Why an action can be absent
 *
 * `getVisitActionRules` decides, not this component. A completed or cancelled visit's route
 * is history (D4); a past visit is read-only unless it was missed (D5); a visit with no tour
 * has no work defined to route. In every one of those the reason is now **printed**, because
 * a control that silently is not there reads as broken.
 */
const RouteWidget = ({ shiftData, onAssignRoute }) => {
  const classes = useRouteWidgetStyles();
  const { t } = useTranslation();
  const { getLabel } = useTenantLabel();

  const runsheetTerm = getLabel('terms', 'runsheet', t) || 'Route';
  const hitTerm = getLabel('terms', 'hit', t) || 'Visit';
  const routeName = `${shiftData?.runsheetName || ''}`.trim();
  const isRouted = Boolean(routeName);
  const rules = getVisitActionRules(shiftData || {});
  const canChange = Boolean(onAssignRoute) && rules.canAssignToRunsheet;

  /* The round's own figures — see `routeTotalHits` in the mock. Absent means "no route",
     which is why the track is gated on them rather than on `isRouted` alone. */
  const totalHits = shiftData?.routeTotalHits;
  const visitedHits = shiftData?.routeVisitedHits ?? 0;
  const hasProgress = isRouted && typeof totalHits === 'number' && totalHits > 0;
  const isDone = hasProgress && visitedHits >= totalHits;
  const pct = hasProgress ? Math.min(100, Math.round((visitedHits / totalHits) * 100)) : 0;

  /* The route's driver, which the visit payload carries as its own `officer` — on a routed
     visit those are the same person, because the officer is a fact about the round. */
  const assignee = isRouted ? shiftData?.officer : null;

  const blockedReason = (() => {
    if (canChange) return null;
    const terms = { hit: hitTerm, hits: getLabel('terms', 'hits', t) || 'Visits' };
    if (rules.requiresTourFirst) {
      return t('obx.schedules.calendar.visits.stateHint.blockedNoTour', {
        ...terms,
        tour: getLabel('terms', 'tour', t) || 'Tour',
        runsheet: runsheetTerm.toLowerCase(),
      });
    }
    if (rules.readOnlyReasonKey) {
      return t(`obx.schedules.calendar.visits.stateHint.${rules.readOnlyReasonKey}`, terms);
    }
    return null;
  })();

  const actionLabel = t(
    isRouted
      ? 'obx.schedules.dutyDetail.detail.changeRoute'
      : 'obx.schedules.dutyDetail.detail.assignRoute',
  );

  const facts = [];
  if (hasProgress) {
    facts.push(
      <Typography key="stops" component="span" variant="subtitle4" className={classes.bodyText}>
        {t('obx.schedules.dutyDetail.reassignHit.stopCount', { count: totalHits })}
      </Typography>,
    );
  }
  if (assignee?.name) {
    facts.push(
      <Box key="who" className={classes.user}>
        <Avatar alt={assignee.name} src={assignee.imageUrl || assignee.image || undefined} />
        <Typography component="span" variant="subtitle3">
          {assignee.name}
        </Typography>
      </Box>,
    );
  }
  if (hasProgress) {
    facts.push(
      <Typography key="done" component="span" variant="subtitle4" className={classes.bodyText}>
        {t('obx.schedules.dutyDetail.detail.routeProgress', {
          done: visitedHits,
          total: totalHits,
        })}
      </Typography>,
    );
  }

  return (
    <Box className={classes.card}>
      <Box className={classes.head}>
        {/* `component="span"`: `h4`/`subtitle2` render heading elements by default, which
            put an `<h4>` inside a widget that is not a section — noise in the document
            outline and in a screen reader's heading list. */}
        <Typography
          component="span"
          variant="h4"
          className={`${classes.title} ${isRouted ? '' : classes.titleUnassigned}`}
          /* Truncation only — the route name is the one thing here that can be cut off. */
          title={isRouted ? routeName : undefined}
        >
          {isRouted ? routeName : t('obx.schedules.calendar.unassigned')}
        </Typography>

        {canChange ? (
          <Button
            disableRipple
            variant="onlyText"
            className={classes.action}
            onClick={onAssignRoute}
            /* "Assign" and "Change" are the right words *on screen*, beside the route they
               act on. Read out of context they name no object, and a drawer can hold
               several one-verb controls — so the accessible name says what is being
               assigned, and to what. */
            aria-label={
              isRouted
                ? `${actionLabel} ${runsheetTerm.toLowerCase()}, ${routeName}`
                : `${actionLabel} ${hitTerm.toLowerCase()} ${t(
                    'obx.schedules.dutyDetail.detail.toARoute',
                    { runsheet: runsheetTerm.toLowerCase() },
                  )}`
            }
          >
            {actionLabel}
          </Button>
        ) : null}
      </Box>

      {/* The body says whichever is true: the route's facts, why there is no action, or —
          unrouted and actionable — what the button is for. Never two of them: the facts
          belong to a route, and a blocked routed visit still has facts worth reading, so
          the reason joins them rather than replacing them. */}
      <Box className={classes.body}>
        {facts.length
          ? facts.reduce(
              (out, node, index) =>
                index === 0
                  ? [node]
                  : [
                      ...out,
                      <Box key={`dot-${index}`} className={classes.dot} aria-hidden="true" />,
                      node,
                    ],
              [],
            )
          : null}

        {blockedReason ? (
          <>
            {facts.length ? <Box className={classes.dot} aria-hidden="true" /> : null}
            <Typography component="span" variant="subtitle4" className={classes.reason}>
              {blockedReason}
            </Typography>
          </>
        ) : null}

        {!facts.length && !blockedReason ? (
          <Typography component="span" variant="subtitle4" className={classes.bodyText}>
            {t('obx.schedules.calendar.visits.notOnRouteHint')}
          </Typography>
        ) : null}
      </Box>

      {hasProgress ? (
        <Box
          className={classes.track}
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={totalHits}
          aria-valuenow={visitedHits}
          aria-label={t('obx.schedules.dutyDetail.detail.routeProgress', {
            done: visitedHits,
            total: totalHits,
          })}
        >
          <Box
            className={`${classes.trackFill} ${isDone ? classes.trackFillDone : ''}`}
            style={{ width: `${pct}%` }}
          />
        </Box>
      ) : null}
    </Box>
  );
};

RouteWidget.propTypes = {
  shiftData: PropTypes.object,
  onAssignRoute: PropTypes.func,
};

/** Company and site — who the visit is for, and where. The route is a widget of its
 *  own below these, not a third cell here; see `RouteWidget`. */
const VisitExtraFields = ({ shiftData }) => {
  const { t } = useTranslation();

  return (
    <>
      <Field
        label={t('obx.schedules.calendar.companies.companyColumn')}
        value={resolveCompanyName(shiftData)}
      />
      <Field label={t('obx.schedules.dutyDetail.detail.site')} value={shiftData?.siteName} />
    </>
  );
};

VisitExtraFields.propTypes = {
  shiftData: PropTypes.object,
};

/**
 * One visit, opened from the visits grid or a route's stop list.
 *
 * `RunsheetHits` is the work itself — service time, visit type, status, company,
 * site, the filters this visit is there to replace, report and instructions.
 * Checkpoints are hidden here: a filter-replacement visit is read by what it
 * replaces, not by a device tour, and the route's own stop list is where that
 * still belongs.
 *
 * The route is a **compact widget** below the fields (see `RouteWidget`), not the
 * callout, the tall card or the plain field it has been before. Removing the visit
 * from its route is the kebab's, alongside the drawer's other destructive action.
 */
const HitDetail = ({ shiftData, loading, callbackUponAssignment, onAssignRoute }) => (
  <RunsheetHits
    hitDetails={shiftData}
    hitStatus={shiftData?.scheduleStatus}
    fetchingHitLoading={loading}
    refetchData={callbackUponAssignment}
    readOnly={getVisitActionRules(shiftData || {}).isReadOnly}
    extraFields={<VisitExtraFields shiftData={shiftData} />}
    belowFields={<RouteWidget shiftData={shiftData} onAssignRoute={onAssignRoute} />}
    hideCheckpoints
  />
);

export default HitDetail;

HitDetail.propTypes = {
  shiftData: PropTypes.object,
  loading: PropTypes.bool,
  callbackUponAssignment: PropTypes.func,
  /** Opens the route picker — see `RouteField`. Absent means the field is read-only. */
  onAssignRoute: PropTypes.func,
};
