import { Box, Button, Chip, Typography } from '@mui/material';
import classNames from 'classnames';
import React, { useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory, useLocation } from 'react-router-dom';
import * as ROUTE from 'src/app/router/constant/ROUTE';
import { ReactComponent as BackIcon } from 'src/assets/svg/ArrowRightBlack.svg?react';
import { useTenantLabel } from 'src/helper/utilityHooks';

import NotifyDialog from './components/NotifyDialog';
import OptimizePopover from './components/OptimizePopover';
import { ChangeList, SummaryStrip, WeekBars } from './components/ProposalReview';
import {
  CommittedState,
  FailedState,
  InfeasibleState,
  NoChangeState,
  SolvingStrip,
  StaleBanner,
} from './components/ResultStates';
import SelectionPicker from './components/SelectionPicker';
import SequenceDiff from './components/SequenceDiff';
import { buildProposalSummary, formatMinutesAsDuration, formatSignedDuration } from './helper';
import {
  EFFECT_SCOPE,
  MOCK_BLOCKER,
  MOCK_CHANGES,
  MOCK_HELD,
  MOCK_STALE,
  OPTIMIZE_MODE,
  PROPOSAL_META,
  TUE_ROUTES,
  WEEK,
} from './mockProposal';
import { useStyles } from './optimizeRoute.styles';

/**
 * Route optimization review.
 *
 * The whole feature rests on one rule: it proposes, it never applies. Nothing
 * on this screen is written until the planner presses the commit button, and
 * that button always states how many changes it is about to write.
 *
 * Every state the flow can reach is reachable from the demo switcher, because
 * the states nobody designs — already optimal, infeasible, stale — are where
 * this kind of screen usually falls over.
 */

const VIEW = {
  PROPOSAL: 'proposal',
  SOLVING: 'solving',
  NO_CHANGE: 'noChange',
  INFEASIBLE: 'infeasible',
  STALE: 'stale',
  FAILED: 'failed',
  COMMITTING: 'committing',
  COMMITTED: 'committed',
};

/**
 * In the product the scope comes from the surface you pressed the button on —
 * runsheet detail, the day view, the week view — so the blast radius is known
 * before the press. There is no scope selector in the real thing. This one is
 * demo scaffolding standing in for three entry points, so all three can be
 * compared side by side.
 */
const SCOPE = { SEQUENCE: 'sequence', DAY: 'day', WEEK: 'week', SELECTION: 'selection' };

const DEMO_SCOPES = [SCOPE.SEQUENCE, SCOPE.DAY, SCOPE.WEEK, SCOPE.SELECTION];

/** Every visit in the week that could be reconsidered, for the selection scope. */
const buildCandidates = () => [
  ...MOCK_CHANGES.map((change) => ({
    id: change.id,
    site: change.site,
    unit: change.unit,
    group: change.group,
    where: `${change.from.day} · ${change.from.route}, position ${change.from.position}`,
  })),
  ...MOCK_HELD.map((item) => ({
    id: item.id,
    site: item.site,
    unit: item.unit,
    group: item.group,
    where: item.reason,
  })),
];

const DEMO_STATES = [
  VIEW.PROPOSAL,
  VIEW.SOLVING,
  VIEW.NO_CHANGE,
  VIEW.INFEASIBLE,
  VIEW.STALE,
  VIEW.COMMITTING,
  VIEW.COMMITTED,
  VIEW.FAILED,
];

const OptimizeRoute = () => {
  const classes = useStyles();
  const { t } = useTranslation();
  const { getLabel } = useTenantLabel();
  const history = useHistory();
  const location = useLocation();
  /* The scheduler launches this with the scope it was showing, so the blast
     radius is inherited from the surface rather than re-chosen here. */
  const scopeFromUrl = new URLSearchParams(location.search).get('scope');
  const tt = (key, options) => t(`obx.runsheet.optimize.${key}`, options);

  const [scope, setScope] = useState(
    Object.values(SCOPE).includes(scopeFromUrl) ? scopeFromUrl : SCOPE.WEEK,
  );
  const [view, setView] = useState(VIEW.PROPOSAL);
  const [mode, setMode] = useState(OPTIMIZE_MODE.TIGHTEST);
  const [effect, setEffect] = useState(EFFECT_SCOPE.ONCE);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [notifyOpen, setNotifyOpen] = useState(false);
  /* Opting a client out is a deliberate act, so it is tracked separately from
     which changes were accepted. */
  const [notifyOptOut, setNotifyOptOut] = useState(() => new Set());
  const triggerRef = useRef(null);

  /* Ticked by default — the planner rejects, rather than having to approve
     nine times to get the answer they asked for. */
  const [acceptedIds, setAcceptedIds] = useState(
    () => new Set(MOCK_CHANGES.map((change) => change.id)),
  );
  const [lockedIds, setLockedIds] = useState(() => new Set());

  const candidates = useMemo(buildCandidates, []);
  const [pickedIds, setPickedIds] = useState(
    () => new Set(MOCK_CHANGES.map((change) => change.id)),
  );
  const [selectionConfirmed, setSelectionConfirmed] = useState(false);

  const visitsTerm = (getLabel('terms', 'visits', t) || 'visits').toLowerCase();

  const isDayScope = scope === SCOPE.DAY;

  /* The day scope is the week screen looking one level down: Tuesday's changes,
     Tuesday's routes. Same object, same arithmetic, narrower rows. */
  const isSelectionScope = scope === SCOPE.SELECTION;

  const scopedChanges = useMemo(() => {
    if (isDayScope) return MOCK_CHANGES.filter((change) => change.group === 'tue');
    if (isSelectionScope) return MOCK_CHANGES.filter((change) => pickedIds.has(change.id));
    return MOCK_CHANGES;
  }, [isDayScope, isSelectionScope, pickedIds]);

  /* Anything left out of the selection is held — and says so, rather than
     quietly disappearing from the proposal. */
  const scopedHeld = useMemo(() => {
    if (isDayScope) return MOCK_HELD.filter((item) => item.group === 'tue');
    if (!isSelectionScope) return MOCK_HELD;

    return [
      ...MOCK_HELD,
      ...MOCK_CHANGES.filter((change) => !pickedIds.has(change.id)).map((change) => ({
        id: `unpicked-${change.id}`,
        site: change.site,
        unit: change.unit,
        group: change.group,
        level: 'selection',
        by: null,
        at: null,
      })),
    ];
  }, [isDayScope, isSelectionScope, pickedIds]);

  const summary = useMemo(
    () => ({
      ...buildProposalSummary({
        changes: scopedChanges,
        acceptedIds,
        rows: isDayScope ? TUE_ROUTES : WEEK,
        impactKey: isDayScope ? 'routeImpact' : 'dayImpact',
      }),
      heldCount: scopedHeld.length,
    }),
    [acceptedIds, scopedChanges, scopedHeld, isDayScope],
  );

  const toggleChange = (id) =>
    setAcceptedIds((previous) => {
      const next = new Set(previous);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const toggleGroup = (groupKey, shouldAccept) =>
    setAcceptedIds((previous) => {
      const next = new Set(previous);
      scopedChanges
        .filter((change) => change.group === groupKey)
        .forEach((change) => {
          if (shouldAccept) next.add(change.id);
          else next.delete(change.id);
        });
      return next;
    });

  /* Locking a row means "and don't suggest this again" — so it drops out of the
     accepted set at the same time. */
  const toggleLock = (id) =>
    setLockedIds((previous) => {
      const next = new Set(previous);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
        setAcceptedIds((accepted) => {
          const updated = new Set(accepted);
          updated.delete(id);
          return updated;
        });
      }
      return next;
    });

  const goBack = () => history.push(ROUTE.OBX_RUNSHEET);

  const solve = () => {
    setPopoverOpen(false);
    setView(VIEW.SOLVING);
  };

  const commit = () => {
    setView(VIEW.COMMITTING);
    /* Stands in for the write. The bar goes busy; the list stays readable so the
       planner can still see what they authorised. */
    window.setTimeout(() => setView(VIEW.COMMITTED), 900);
  };

  const staleValidCount = scopedChanges.filter(
    (change) => acceptedIds.has(change.id) && !MOCK_STALE.conflictingChangeIds.includes(change.id),
  ).length;

  const notifyCount = summary.notifications.filter((item) => !notifyOptOut.has(item.id)).length;
  const silencedCount = summary.notifications.length - notifyCount;

  const toggleNotify = (id) =>
    setNotifyOptOut((previous) => {
      const next = new Set(previous);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const isBusy = view === VIEW.COMMITTING;
  const showReview = [VIEW.PROPOSAL, VIEW.STALE, VIEW.COMMITTING].includes(view);
  const canCommit = view === VIEW.PROPOSAL && summary.acceptedCount > 0;

  return (
    <Box className={classes.page}>
      <Box className={classes.header}>
        <Button
          disableRipple
          variant="onlyText"
          onClick={goBack}
          startIcon={<BackIcon />}
          className={classes.backButton}
          aria-label={t('buttons.back')}
        />
        <Typography variant="h2" className={classes.headerTitle}>
          {tt(`${scope}Title`)}
        </Typography>
        <Chip className={classes.modeChip} label={tt(`modeChip.${mode}`)} />
        <Box className={classes.headerSpacer} />
        <Typography className={classes.headerMeta}>
          {tt('solvedMeta', {
            time: PROPOSAL_META.solvedAt,
            basis: PROPOSAL_META.basis,
            range: PROPOSAL_META.range,
          })}
        </Typography>
      </Box>

      <Box className={classes.subtitleRow}>
        <Typography className={classes.headerSubtitle}>
          {isSelectionScope
            ? tt('subtitleSelection', { count: pickedIds.size })
            : scope === SCOPE.SEQUENCE
              ? tt('subtitleSequence')
              : effect === EFFECT_SCOPE.STANDING
                ? tt('subtitleStanding', { from: PROPOSAL_META.effectiveFrom })
                : tt('subtitleOnce', {
                    range: isDayScope ? 'Tue 26 Aug' : PROPOSAL_META.range,
                    visits: visitsTerm,
                  })}
        </Typography>
        {isSelectionScope && selectionConfirmed && (
          <Button disableRipple variant="onlyText" onClick={() => setSelectionConfirmed(false)}>
            {tt('changeSelection')}
          </Button>
        )}
        <Button
          disableRipple
          variant="onlyText"
          ref={triggerRef}
          onClick={() => setPopoverOpen(true)}
        >
          {tt('changeSettings')}
        </Button>
      </Box>

      {/* Demo scaffolding: every state reachable, because the awkward ones are
          the point of the exercise. */}
      <Box className={classes.demoBar}>
        <Typography className={classes.demoLabel}>{tt('demoSurface')}</Typography>
        {DEMO_SCOPES.map((value) => (
          <button
            key={value}
            type="button"
            className={classNames(classes.demoButton, scope === value && classes.demoButtonActive)}
            aria-pressed={scope === value}
            onClick={() => setScope(value)}
          >
            {tt(`surface.${value}`)}
          </button>
        ))}
        <Box className={classes.demoDivider} />
        <Typography className={classes.demoLabel}>{tt('demoStates')}</Typography>
        {DEMO_STATES.map((state) => (
          <button
            key={state}
            type="button"
            className={classNames(classes.demoButton, view === state && classes.demoButtonActive)}
            aria-pressed={view === state}
            onClick={() => setView(state)}
          >
            {tt(`state.${state}`)}
          </button>
        ))}
      </Box>

      {view === VIEW.SOLVING && (
        <SolvingStrip label={tt('solvingWeek')} onCancel={() => setView(VIEW.PROPOSAL)} />
      )}

      {view === VIEW.NO_CHANGE && (
        <NoChangeState savedMinutesLabel={formatMinutesAsDuration(4)} onDismiss={goBack} />
      )}

      {view === VIEW.INFEASIBLE && (
        <InfeasibleState
          blocker={MOCK_BLOCKER}
          onRelease={() => setView(VIEW.SOLVING)}
          onShowNearMiss={() => setView(VIEW.PROPOSAL)}
        />
      )}

      {view === VIEW.FAILED && <FailedState onRetry={() => setView(VIEW.SOLVING)} />}

      {view === VIEW.COMMITTED && (
        <CommittedState
          count={summary.acceptedCount}
          notified={notifyCount}
          onUndo={() => setView(VIEW.PROPOSAL)}
          onDone={goBack}
        />
      )}

      {view === VIEW.STALE && (
        <StaleBanner
          stale={MOCK_STALE}
          validCount={staleValidCount}
          totalCount={summary.acceptedCount}
          onResolve={() => setView(VIEW.SOLVING)}
        />
      )}

      {showReview && isSelectionScope && !selectionConfirmed && (
        <SelectionPicker
          candidates={candidates}
          selectedIds={pickedIds}
          onToggle={(id) =>
            setPickedIds((previous) => {
              const next = new Set(previous);
              if (next.has(id)) next.delete(id);
              else next.add(id);
              return next;
            })
          }
          onToggleAll={(shouldPick) =>
            setPickedIds(shouldPick ? new Set(candidates.map((item) => item.id)) : new Set())
          }
          onConfirm={() => setSelectionConfirmed(true)}
        />
      )}

      {showReview && scope === SCOPE.SEQUENCE && (
        <SequenceDiff onApply={commit} onDiscard={goBack} />
      )}

      {showReview && scope !== SCOPE.SEQUENCE && !(isSelectionScope && !selectionConfirmed) && (
        <>
          <SummaryStrip
            summary={summary}
            visitsTerm={visitsTerm}
            perRoute={isDayScope}
            onReviewNotifications={() => setNotifyOpen(true)}
          />

          <Box className={classes.body}>
            <Box className={classes.changesPane}>
              <Box className={classes.paneHeader}>
                <Typography className={classes.sectionLabel}>
                  {tt('changesHeading', { count: scopedChanges.length })}
                </Typography>
                <Typography className={classes.hintText}>{tt('lockHint')}</Typography>
              </Box>
              <Box className={classes.paneScroll}>
                <ChangeList
                  changes={scopedChanges}
                  held={scopedHeld}
                  acceptedIds={acceptedIds}
                  lockedIds={lockedIds}
                  standing={effect === EFFECT_SCOPE.STANDING}
                  onToggle={toggleChange}
                  onToggleLock={toggleLock}
                  onToggleGroup={toggleGroup}
                />
              </Box>
            </Box>

            <Box className={classes.weekPane}>
              <Box className={classes.paneHeader}>
                <Typography className={classes.sectionLabel}>
                  {tt(isDayScope ? 'routeLength' : 'dayLength')}
                </Typography>
                <Typography className={classes.hintText}>{tt('ghostIsNow')}</Typography>
              </Box>
              <Box className={classes.paneScroll}>
                <WeekBars summary={summary} perRoute={isDayScope} />
              </Box>
            </Box>
          </Box>

          <Box className={classes.commitBar}>
            <Box className={classes.commitSummary}>
              <Typography className={classes.commitLine}>
                {tt('commitSummary', {
                  accepted: summary.acceptedCount,
                  total: summary.totalCount,
                  time: formatSignedDuration(summary.driveMinutesDelta),
                })}
              </Typography>
              <Typography className={classes.commitSubline}>
                {notifyCount > 0
                  ? tt('commitNotify', { count: notifyCount })
                  : tt('commitNoNotify')}
                {silencedCount > 0 && ` · ${tt('commitSilenced', { count: silencedCount })}`}
                {summary.emptiedRoutes.length > 0 &&
                  ` · ${tt('commitEmptied', { count: summary.emptiedRoutes.length })}`}
              </Typography>
            </Box>

            <Box className={classes.commitActions}>
              <Button disableRipple variant="secondaryGrey" onClick={goBack} disabled={isBusy}>
                {tt('discard')}
              </Button>
              <Button
                disableRipple
                variant="secondaryGrey"
                onClick={() => setView(VIEW.SOLVING)}
                disabled={isBusy}
              >
                {tt('resolve')}
              </Button>
              <Button
                disableRipple
                variant="primary"
                onClick={commit}
                disabled={!canCommit || isBusy}
              >
                {isBusy ? tt('committing') : tt('commit', { count: summary.acceptedCount })}
              </Button>
            </Box>
          </Box>
        </>
      )}

      <NotifyDialog
        open={notifyOpen}
        onClose={() => setNotifyOpen(false)}
        notifications={summary.notifications}
        optedOut={notifyOptOut}
        onToggle={toggleNotify}
      />

      <OptimizePopover
        anchorEl={triggerRef.current}
        open={popoverOpen}
        onClose={() => setPopoverOpen(false)}
        mode={mode}
        onModeChange={setMode}
        effect={effect}
        onEffectChange={setEffect}
        lockCount={scopedHeld.length + lockedIds.size}
        target={tt('targetSummary', { range: PROPOSAL_META.range, routes: 6, stops: 34 })}
        actionLabel={tt(`${scope}Title`)}
        onSolve={solve}
      />
    </Box>
  );
};

export default OptimizeRoute;
