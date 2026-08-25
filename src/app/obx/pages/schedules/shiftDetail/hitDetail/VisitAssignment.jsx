import { Avatar, Box, Button, Skeleton, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CustomDropDown from 'src/app/components/common/customDropDown';
import {
  getVisitActionRules,
  VISIT_STATE,
  VISIT_STATE_LABEL_KEYS,
} from 'src/app/obx/pages/schedules/helper/visitState';
import { ReactComponent as CancelledIcon } from 'src/assets/svg/CancelledIcon.svg';
import { ReactComponent as CompletedIcon } from 'src/assets/svg/CompletedIcon.svg';
import { ReactComponent as InProgressIcon } from 'src/assets/svg/InProgressIcon.svg';
import { ReactComponent as LocationIcon } from 'src/assets/svg/location.svg';
import { ReactComponent as MissedIcon } from 'src/assets/svg/MissedIcon.svg';
import { ReactComponent as NotStartedIcon } from 'src/assets/svg/notStartedScheduleStatus.svg';
import { ReactComponent as RunsheetIcon } from 'src/assets/svg/runsheetHit.svg';
import { ReactComponent as UnassignedIcon } from 'src/assets/svg/UnassignedIcon.svg';
import { ReactComponent as WarningIcon } from 'src/assets/svg/warningCalander.svg';
import { ReactComponent as CarIcon } from 'src/assets/svg/WhiteCarIcon.svg';
import { useTenantLabel } from 'src/helper/utilityHooks';
import { fetchRunsheetList } from 'src/services/duty.services';

import { toRunsheetArray } from '../../helper';

/**
 * Tones mirror the grid's card treatments in `calendar.styles.js` — red needs
 * attention, amber is blocked, blue is live, grey is settled. A visit must not
 * read as one thing on the grid and another in the drawer; that divergence is
 * exactly what the audit found.
 */
const CALLOUT_TONES = {
  attention: { border: '1px dashed #F04438', background: '#FEF3F2', title: '#B42318' },
  blocked: { border: '1px dashed #DC6803', background: '#FFFAEB', title: '#B54708' },
  live: { border: '1px solid #B2DDFF', background: '#EFF8FF', title: '#175CD3' },
  settled: { border: '1px solid #EAECF0', background: '#F9FAFB', title: '#475467' },
};

const useStyles = makeStyles((theme) => ({
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    padding: '20px 24px',
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
  },
  /* Whatever needs saying about this visit's state leads the drawer, with the
     action that resolves it — or no action at all when the state forbids one. */
  callout: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '16px',
    padding: '14px 16px',
    borderRadius: '8px',
  },
  calloutText: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    minWidth: 0,
    '& svg': { width: '18px', height: '18px', flexShrink: 0 },
  },
  calloutTitle: {
    '&.MuiTypography-root': {
      fontSize: '14px',
      fontWeight: 600,
      lineHeight: '20px',
    },
  },
  calloutHint: {
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary1,
      fontSize: '12px',
      lineHeight: '16px',
    },
  },
  /* Three columns cannot hold these three values. A runsheet is named after its
     site plus the word "Route" ("Northgate Cold Storage Route", ~200px) and a
     vehicle carries its plate ("Van 12 — FL 4821 KQ", ~180px); at 660px of drawer
     the row has 532px to give, so something always ellipsised — and re-weighting
     the columns only moved which one.

     So the runsheet takes its own line. It is also the right hierarchy: which
     route claimed this visit is the question the drawer was opened to answer, and
     the technician and the vehicle are one fact about that route, read together.
     Collapses to a single column when the drawer is narrow. */
  assignedGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: '16px',
    [theme.breakpoints.down('sm')]: {
      gridTemplateColumns: '1fr',
    },
  },
  routeField: {
    gridColumn: '1 / -1',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    minWidth: 0,
  },
  fieldLabel: {
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary1,
      fontSize: '12px',
      lineHeight: '16px',
    },
  },
  /* Every value row is the same height whatever media it carries — icon, avatar
     or vehicle badge — so the three columns share one baseline. The avatar was
     rendering at MUI's default 40px and dragging its text 10px below the
     neighbouring columns. */
  fieldValue: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    minWidth: 0,
    height: '20px',
    '& svg': { width: '16px', height: '16px', flexShrink: 0 },
  },
  fieldValueText: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
      fontSize: '14px',
      fontWeight: 500,
      lineHeight: '20px',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
  },
  // `.MuiAvatar-root` sets 40px of its own and its emotion styles are injected
  // after makeStyles, so a plain `width` here silently loses.
  avatar: {
    '&.MuiAvatar-root': {
      width: '20px',
      height: '20px',
      fontSize: '10px',
      flexShrink: 0,
    },
  },
  carBadge: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    background: theme.palette.textSecondary1,
    '& svg': { width: '12px', height: '12px' },
  },
  /* `location.svg` ships with a hard-coded `fill="white"`, so the pin was
     invisible on the drawer's white surface — present in the layout, absent to
     the eye. The address therefore sat 24px right of every other row in the
     block, indented by an icon nobody could see. Fill comes from the row now. */
  addressRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '8px',
    color: theme.palette.textSecondary1,
    '& svg': { width: '16px', height: '16px', flexShrink: 0, marginTop: '2px' },
    '& svg path': { fill: 'currentColor' },
  },
  addressText: {
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary1,
      fontSize: '13px',
      lineHeight: '18px',
    },
  },
  /* The route field is a control, not a caption, so it sits on the same 20px line
     as the other two values rather than inheriting the dropdown's own height. */
  routeDropdown: {
    '&.MuiBox-root': {
      minWidth: 0,
      width: '100%',
      maxWidth: '320px',
    },
  },
}));

const Field = ({ label, children, className = '' }) => {
  const classes = useStyles();
  return (
    <Box className={`${classes.field} ${className}`}>
      <Typography className={classes.fieldLabel}>{label}</Typography>
      <Box className={classes.fieldValue}>{children}</Box>
    </Box>
  );
};

Field.propTypes = {
  label: PropTypes.string,
  children: PropTypes.node,
  className: PropTypes.string,
};

const StateCallout = ({ tone, icon, title, hint, action }) => {
  const classes = useStyles();
  const palette = CALLOUT_TONES[tone] || CALLOUT_TONES.settled;

  return (
    <Box
      className={classes.callout}
      sx={{ border: palette.border, background: palette.background }}
    >
      <Box className={classes.calloutText}>
        {icon}
        <Box>
          <Typography className={classes.calloutTitle} sx={{ color: palette.title }}>
            {title}
          </Typography>
          {hint ? <Typography className={classes.calloutHint}>{hint}</Typography> : null}
        </Box>
      </Box>
      {action}
    </Box>
  );
};

StateCallout.propTypes = {
  tone: PropTypes.string,
  icon: PropTypes.node,
  title: PropTypes.string,
  hint: PropTypes.string,
  action: PropTypes.node,
};

const STATE_CALLOUT_PRESENTATION = {
  [VISIT_STATE.UNASSIGNED]: { tone: 'attention', icon: <UnassignedIcon /> },
  [VISIT_STATE.BLOCKED_NO_TOUR]: { tone: 'blocked', icon: <WarningIcon /> },
  [VISIT_STATE.MISSED]: { tone: 'attention', icon: <MissedIcon /> },
  [VISIT_STATE.ROUTE_IN_PROGRESS]: { tone: 'live', icon: <InProgressIcon /> },
  [VISIT_STATE.INSERTED_AFTER_START]: { tone: 'live', icon: <InProgressIcon /> },
  [VISIT_STATE.COMPLETED]: { tone: 'settled', icon: <CompletedIcon /> },
  [VISIT_STATE.CANCELLED]: { tone: 'settled', icon: <CancelledIcon /> },
};

/**
 * Answers the first question a planner has when they open a visit from the
 * visits grid: is this on a route, and if not, what do I do about it.
 *
 * The visit body below this block describes the *work* (duration, checkpoints,
 * report, instructions) — which is the same whether or not anyone is coming.
 * Placement matters: the assignment state is the reason the drawer was opened.
 */
/**
 * The runsheets a visit could move to: the ones running on its own day.
 *
 * Kept local to the field it feeds. `null` means the fetch failed and `undefined`
 * means it has not answered yet — the two need different treatments, because a
 * dropdown with no options is indistinguishable from a dropdown that is still
 * loading, and `CustomDropDown` renders nothing at all when its value is
 * undefined (handoff §7.17), which would silently delete the field.
 */
const useDayRunsheets = ({ startsAt, endsAt, enabled }) => {
  const [runsheets, setRunsheets] = useState(undefined);

  useEffect(() => {
    if (!enabled || !startsAt) {
      setRunsheets(undefined);
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const response = await fetchRunsheetList({
          params: { startsAt, endsAt: endsAt || startsAt },
        });
        if (!cancelled) setRunsheets(toRunsheetArray(response?.data));
      } catch {
        if (!cancelled) setRunsheets(null);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [startsAt, endsAt, enabled]);

  return runsheets;
};

const VisitAssignment = ({
  visit,
  loading,
  onAssignToRoute,
  onAssignTour,
  onChangeRunsheet,
  canAssign,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const { getLabel } = useTenantLabel();

  const assignmentRules = getVisitActionRules(visit || {});
  const canMoveRoute = Boolean(canAssign && !assignmentRules.isReadOnly && onChangeRunsheet);
  const dayRunsheets = useDayRunsheets({
    startsAt: visit?.startsAt,
    endsAt: visit?.endsAt,
    enabled: canMoveRoute && !loading,
  });

  if (loading) {
    return (
      <Box className={classes.wrapper}>
        <Skeleton variant="rounded" height={64} />
      </Box>
    );
  }

  if (!visit || !Object.keys(visit).length) return null;

  const { runsheetName, officer, vehicle, address, siteName } = visit;

  /* The drawer header already names the site. Falling back to the site name when
     there is no address printed it a second time, three lines apart, which read
     as a data error rather than a location. Show the row only when it adds one. */
  const addressLine =
    address && `${address}`.trim() && `${address}`.trim() !== `${siteName || ''}`.trim()
      ? address
      : null;
  const rules = getVisitActionRules(visit);
  const { state } = rules;
  const isOnRoute = Boolean(runsheetName) && state !== VISIT_STATE.UNASSIGNED;

  const terms = {
    runsheet: getLabel('terms', 'runsheet', t) || 'Runsheet',
    tour: getLabel('terms', 'tour', t) || 'Tour',
    hit: getLabel('terms', 'hit', t) || 'Visit',
    hits: getLabel('terms', 'hits', t) || 'Visits',
    officer: getLabel('roles', 'officer', t) || getLabel('terms', 'officer', t) || 'Officer',
  };

  const isPastReadOnly = rules.readOnlyReasonKey === 'past';
  const presentation = STATE_CALLOUT_PRESENTATION[state] || null;

  /* The route the visit is on stays in the list even if the day's fetch does not
     return it, so the control can always show its own current value — a dropdown
     that opens on a blank is worse than no dropdown. */
  const runsheetList = Array.isArray(dayRunsheets) ? dayRunsheets : [];

  const runsheetOptions = (() => {
    const options = runsheetList
      .filter((runsheet) => runsheet?.id && runsheet?.name)
      .map((runsheet) => ({
        value: runsheet.id,
        label: runsheet.name,
      }));
    const current = visit?.runsheetId;
    if (current && !options.some((option) => option.value === current)) {
      options.unshift({ value: current, label: runsheetName });
    }
    return options;
  })();

  const selectedRunsheetOption =
    runsheetOptions.find((option) => option.value === visit?.runsheetId) || {};

  const handleRunsheetChange = (event) => {
    const nextId = event?.target?.value ?? event?.value;
    if (!nextId || nextId === visit?.runsheetId) return;
    onChangeRunsheet?.({
      ...runsheetList.find((runsheet) => runsheet?.id === nextId),
      id: nextId,
    });
  };

  /* The title always names the visit's own state, even when the date is what
     makes it read-only. Saying "Scheduled" over a card the grid labelled "Needs a
     Service Checklist" is the exact divergence this whole pass exists to remove —
     so a past date changes the *hint* and removes the action, never the name. */
  const calloutTitle =
    state === VISIT_STATE.UNASSIGNED
      ? t('obx.schedules.calendar.visits.notOnRouteTitle', terms)
      : t(`obx.schedules.calendar.visits.state.${VISIT_STATE_LABEL_KEYS[state]}`, terms);

  const calloutHint = isPastReadOnly
    ? t('obx.schedules.calendar.visits.stateHint.past', terms)
    : state === VISIT_STATE.UNASSIGNED
      ? t('obx.schedules.calendar.visits.notOnRouteHint')
      : t(`obx.schedules.calendar.visits.stateHint.${VISIT_STATE_LABEL_KEYS[state]}`, terms);

  /* Actions follow the rules, not the state's appearance: a blocked visit is
     offered a tour rather than a runsheet, a missed one is offered a runsheet
     even though its date has passed, and completed/cancelled are offered
     nothing at all. */
  const renderCalloutAction = () => {
    // One invariant, checked once: read-only means no action, whatever the reason.
    // The state still names itself in the title — it just cannot be acted on.
    if (!canAssign || rules.isReadOnly) return null;

    if (rules.requiresTourFirst && onAssignTour) {
      return (
        <Button variant="primary" onClick={onAssignTour} sx={{ flexShrink: 0 }}>
          {t('obx.schedules.calendar.visits.assignTour', terms)}
        </Button>
      );
    }

    /* A missed visit keeps the action even though it is still nominally attached
       to the route it missed — that attachment is history, and rescheduling it is
       the only thing left to do with it (D5). Every other routed state hides the
       action, because the visit already has a runsheet. */
    const isMissed = state === VISIT_STATE.MISSED;
    if (rules.canAssignToRunsheet && (isMissed || !isOnRoute) && onAssignToRoute) {
      return (
        <Button variant="primary" onClick={onAssignToRoute} sx={{ flexShrink: 0 }}>
          {t(
            isMissed
              ? 'obx.schedules.calendar.visits.reschedule'
              : 'obx.schedules.calendar.visits.addToRoute',
            terms,
          )}
        </Button>
      );
    }

    return null;
  };

  return (
    <Box className={classes.wrapper}>
      {presentation || isPastReadOnly ? (
        <StateCallout
          // A past date drains the colour: nothing here is actionable, so the
          // callout should not shout in red or amber about it.
          tone={isPastReadOnly ? 'settled' : presentation.tone}
          // `SCHEDULED` is the only state with no presentation of its own — it
          // reaches the callout solely because its date has passed. The fallback
          // used to be a `WarningIcon`, which put an amber warning triangle
          // against the word "Scheduled" on a grey, unactionable callout. Nothing
          // is wrong with the visit; it simply never started, so it takes the
          // same not-started marker the grid and the status chip already use.
          icon={presentation?.icon || <NotStartedIcon />}
          title={calloutTitle}
          hint={calloutHint}
          action={renderCalloutAction()}
        />
      ) : null}

      {isOnRoute ? (
        <Box className={classes.assignedGrid}>
          {/* Moving a visit to another route is the most common edit a planner
              makes here, and it used to be reachable only through the drawer's
              kebab — the field itself looked like a caption. It is a control now:
              the route it is on, and the routes it could be on, in one place.

              Read-only states keep the plain caption. A completed or cancelled
              visit has a runsheet as a matter of history (D4), and offering a
              dropdown over history invites an edit the rules then refuse. */}
          <Field label={terms.runsheet} className={classes.routeField}>
            {canMoveRoute && runsheetOptions.length > 1 ? (
              <CustomDropDown
                name="visitRunsheet"
                className={classes.routeDropdown}
                options={runsheetOptions}
                /* Never undefined: `CustomDropDown` returns null rather than
                   degrading, so a `.find()` that misses deletes the field
                   outright (handoff §7.17). */
                selectedValues={selectedRunsheetOption}
                /* The control is wider than 20 characters, and the default
                   truncation is not (handoff §7.18). */
                labelMaxLength={40}
                handleChange={handleRunsheetChange}
                searchable
                searchPlaceholder={t('form.input.textField.search.placeHolder')}
              />
            ) : (
              <>
                <RunsheetIcon />
                <Typography className={classes.fieldValueText} title={runsheetName}>
                  {runsheetName}
                </Typography>
              </>
            )}
          </Field>

          <Field label={terms.officer}>
            {officer?.name ? (
              <>
                <Avatar className={classes.avatar} src={officer?.imageUrl} alt={officer.name} />
                <Typography className={classes.fieldValueText} title={officer.name}>
                  {officer.name}
                </Typography>
              </>
            ) : (
              <>
                <UnassignedIcon />
                <Typography className={classes.fieldValueText}>
                  {t('obx.schedules.calendar.unassigned')}
                </Typography>
              </>
            )}
          </Field>

          <Field label={t('obx.runsheet.vehicle')}>
            {vehicle?.name ? (
              <>
                <Box className={classes.carBadge}>
                  <CarIcon />
                </Box>
                <Typography className={classes.fieldValueText} title={vehicle.name}>
                  {vehicle.name}
                </Typography>
              </>
            ) : (
              <>
                <UnassignedIcon />
                <Typography className={classes.fieldValueText}>
                  {t('obx.schedules.calendar.unassigned')}
                </Typography>
              </>
            )}
          </Field>
        </Box>
      ) : null}

      {addressLine ? (
        <Box className={classes.addressRow}>
          <LocationIcon />
          <Typography className={classes.addressText}>{addressLine}</Typography>
        </Box>
      ) : null}
    </Box>
  );
};

VisitAssignment.propTypes = {
  visit: PropTypes.object,
  loading: PropTypes.bool,
  onAssignToRoute: PropTypes.func,
  onAssignTour: PropTypes.func,
  onChangeRunsheet: PropTypes.func,
  canAssign: PropTypes.bool,
};

export default VisitAssignment;
