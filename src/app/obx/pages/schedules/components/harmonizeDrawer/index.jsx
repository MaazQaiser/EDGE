import { Box, Button, InputLabel, TextField, Typography } from '@mui/material';
import { useJsApiLoader } from '@react-google-maps/api';
import classNames from 'classnames';
import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CustomDropDown from 'src/app/components/common/customDropDown';
import GoogleMapSearchAddressComponent from 'src/app/components/common/googleMap/searchAddress';
import RightDrawer from 'src/app/components/common/rightDrawer';
import {
  formatMinutesAsDuration,
  MAN_DAY_MINUTES,
} from 'src/app/obx/pages/runSheets/buildRoute/helper';
import { Clossicon } from 'src/assets/svg';
import { GOOGLE_MAPS_API_VERSION, GOOGLE_MAPS_LIBRARIES } from 'src/utils/constants';

import AddressSearchField from './components/AddressSearchField';
import DayMeter from './components/DayMeter';
import OverflowBucket from './components/OverflowBucket';
import RouteMap from './components/RouteMap';
import RouteOptions from './components/RouteOptions';
import SelectionList from './components/SelectionList';
import StopList from './components/StopList';
import { buildVisits, defaultTargetDay, runsheetsOnDay } from './demoVisits';
import { useStyles } from './harmonizeDrawer.styles';
import {
  applyManualOrder,
  dedupePlans,
  defaultMergeTarget,
  optionsAreEquivalent,
  planAllOptions,
  ROUTE_OPTION,
} from './harmonizePlan';
import { useDirections } from './useDirections';
import { useStartPoint } from './useStartPoint';

/**
 * Harmonize: collapse a week of scattered visits into one day.
 *
 * The question is not "how do I drive less this week" — it is "can I do all of
 * this in one trip". So the man-day is the governing constraint and the meter
 * is the answer, not a supporting widget. Everything above the meter is a lever
 * that changes it; everything below is the consequence.
 *
 * It stays a drawer because selection happened on the calendar, on the visits
 * themselves, and the calendar behind can show the days emptying as the plan
 * changes. Nothing is written until Apply.
 */

/* The route leaves from and returns to one place, so the drive home is always
   charged to the day. There is no open-route variant to choose between. */
const RETURN_TO_START = true;

const MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

/* The system drawer is 523px. This one carries a map, a meter and an ordered
   list side by side with their numbers, so it asks for 30% more. */
const DRAWER_WIDTH = 680;

const DAY_START_MINUTES = 9 * 60;
const DAY_WINDOW = 14;

const HarmonizeDrawer = ({ open, onClose, selectedShifts, onApplied, onPreviewChange }) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const tt = (key, options) => t(`obx.runsheet.harmonize.${key}`, options);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: MAPS_API_KEY,
    version: GOOGLE_MAPS_API_VERSION,
    libraries: GOOGLE_MAPS_LIBRARIES,
  });

  /* With no key, Google renders its own "can't load Maps" modal over the
     drawer. Better to never instantiate a map and show our own placeholder. */
  const mapsReady = Boolean(MAPS_API_KEY) && isLoaded;

  /* Places needs the same SDK as the map. Named separately because they are two
     different promises to the user — one is "you can search for a place", the
     other is "you can see where it is" — and a future keyless build could
     conceivably honour the first without the second. */
  const placesReady = mapsReady;

  const visits = useMemo(() => buildVisits(selectedShifts), [selectedShifts]);

  const [targetDay, setTargetDay] = useState(null);
  const [overflowDay, setOverflowDay] = useState(null);
  const [mergeTargetId, setMergeTargetId] = useState(null);
  const [routeOption, setRouteOption] = useState(ROUTE_OPTION.SHORTEST);
  const [previewOption, setPreviewOption] = useState(null);
  const [manualOrder, setManualOrder] = useState(null);
  const [movedOut, setMovedOut] = useState(() => new Set());
  const [newRunsheetName, setNewRunsheetName] = useState('');
  const [nameTouched, setNameTouched] = useState(false);
  const [addressQuery, setAddressQuery] = useState('');
  const [highlightedSiteId, setHighlightedSiteId] = useState(null);
  const [applying, setApplying] = useState(false);

  /* A fresh selection is a fresh question — every lever goes back to its
     default rather than inheriting the last plan's answers. */
  useEffect(() => {
    if (!visits.length) return;
    /* `defaultTargetDay` refuses days that have already passed — a selection of
       missed visits is a normal thing to harmonize (D5) and used to default the
       whole drawer, Apply button included, onto a date in the past. */
    const day = defaultTargetDay(visits);
    setTargetDay(day);
    setOverflowDay(day.add(1, 'day'));
    setRouteOption(ROUTE_OPTION.SHORTEST);
    setManualOrder(null);
    setMovedOut(new Set());
    setNameTouched(false);
  }, [visits]);

  /* A name the planner will usually accept, so the only remaining field is
     usually a glance rather than a task. Stops the moment they type — an
     auto-name that overwrites what somebody wrote is worse than no auto-name. */
  const dayLabel = targetDay?.isValid() ? targetDay.format('ddd D MMM') : '';

  useEffect(() => {
    if (nameTouched || !dayLabel) return;
    setNewRunsheetName(t('obx.runsheet.harmonize.newRunsheetDefault', { day: dayLabel }));
    /* Depends on the day and on whether the planner has taken over, and on
       nothing else. `tt` is a render-scoped closure, so listing it here would
       re-run this every render and fight them for the field. */
  }, [dayLabel, nameTouched, t]);

  const dayOptions = useMemo(() => {
    if (!visits.length) return [];
    const earliest = visits.reduce(
      (min, visit) => (visit.scheduledFor.isBefore(min) ? visit.scheduledFor : min),
      visits[0].scheduledFor,
    );

    /* The window opens today at the earliest. Work cannot be scheduled into a day
       that has gone, and offering one is worse than useless — it is the control
       that made `Apply → Mon 10 Aug` reachable on the 12th. A selection reaching
       further ahead than today still starts at its own earliest visit. */
    const today = dayjs().startOf('day');
    const first = earliest.isAfter(today, 'day') ? earliest.startOf('day') : today;

    return Array.from({ length: DAY_WINDOW }, (_, index) => {
      const day = first.add(index, 'day');
      return { value: day.format('YYYY-MM-DD'), label: day.format('ddd D MMM') };
    });
  }, [visits]);

  const runsheets = useMemo(() => (targetDay ? runsheetsOnDay(targetDay) : []), [targetDay]);

  useEffect(() => {
    setMergeTargetId(defaultMergeTarget(runsheets));
    setManualOrder(null);
  }, [runsheets]);

  const mergeTarget = runsheets.find((runsheet) => runsheet.id === mergeTargetId) || null;
  const existingStops = useMemo(() => mergeTarget?.existingStops || [], [mergeTarget]);

  /* Each target says who owns it and how full it already is, because choosing
     one is the same act as choosing how much room is left. */
  const mergeOptions = useMemo(
    () => [
      { value: '', label: tt('newRunsheet') },
      ...runsheets.map((runsheet) => ({
        value: runsheet.id,
        label: [
          runsheet.worker || tt('unassigned'),
          runsheet.name,
          tt('loadedShort', { time: formatMinutesAsDuration(runsheet.loadMinutes) }),
          runsheet.status === 'live' ? tt('liveTag') : null,
        ]
          .filter(Boolean)
          .join(' · '),
        description: runsheet.name,
      })),
    ],
    [runsheets],
  );

  const startPoint = useStartPoint({ enabled: open });

  const activeVisits = useMemo(
    () => visits.filter((visit) => !movedOut.has(visit.siteId)),
    [visits, movedOut],
  );

  const plans = useMemo(() => {
    if (!startPoint.point || !activeVisits.length) return [];
    return planAllOptions({
      visits: activeVisits,
      startPoint: startPoint.point,
      returnToStart: RETURN_TO_START,
      existingStops,
      dayStartMinutes: mergeTarget?.startMinutes || DAY_START_MINUTES,
    });
  }, [activeVisits, startPoint.point, existingStops, mergeTarget]);

  /* Only the options that lead somewhere different are worth showing. */
  const visiblePlans = useMemo(() => dedupePlans(plans), [plans]);

  useEffect(() => {
    if (!visiblePlans.length) return;
    if (!visiblePlans.some((plan) => plan.option === routeOption)) {
      setRouteOption(visiblePlans[0].option);
    }
  }, [visiblePlans, routeOption]);

  const basePlan = useMemo(
    () => plans.find((plan) => plan.option === (previewOption || routeOption)) || plans[0] || null,
    [plans, routeOption, previewOption],
  );

  /* Manual order keeps the planner's sequence through every other change. Only
     Re-optimize hands the route back to the solver. */
  const plan = useMemo(() => {
    if (!basePlan) return null;
    if (!manualOrder) return basePlan;

    return applyManualOrder({
      plan: basePlan,
      orderedSiteIds: manualOrder,
      startPoint: startPoint.point,
      returnToStart: RETURN_TO_START,
      dayStartMinutes: mergeTarget?.startMinutes || DAY_START_MINUTES,
    });
  }, [basePlan, manualOrder, startPoint.point, mergeTarget]);

  const endPoint = useMemo(() => {
    if (!plan?.stops.length) return null;
    /* Round trip: the route ends where it started. */
    return startPoint.point;
  }, [plan, startPoint.point]);

  const directions = useDirections({
    isLoaded: mapsReady,
    startPoint: startPoint.point,
    stops: plan?.stops || [],
    endPoint,
    enabled: open,
  });

  /* Directions decide the numbers; haversine only decided the order. When the
     service cannot be reached the estimate stands and says so. */
  const travelMinutes =
    directions.state === 'ready' ? directions.totalTravelMinutes : plan?.travelMinutes || 0;

  const overflowStops = useMemo(() => {
    const spilled = plan?.overflow || [];
    const pushedOut = visits
      .filter((visit) => movedOut.has(visit.siteId))
      .reduce((map, visit) => {
        const existing = map.get(visit.siteId);
        if (existing) {
          existing.visits.push(visit);
          existing.serviceMinutes += visit.serviceMinutes;
        } else {
          map.set(visit.siteId, { ...visit, visits: [visit] });
        }
        return map;
      }, new Map());

    return [...spilled, ...pushedOut.values()];
  }, [plan, visits, movedOut]);

  const overflowVisitCount = overflowStops.reduce((total, stop) => total + stop.visits.length, 0);

  /* The calendar behind ghosts the move while the drawer is open, so Apply is
     confirming something already watched rather than announcing something new. */
  useEffect(() => {
    if (!open || !plan || !targetDay) {
      onPreviewChange?.(null);
      return;
    }

    /* Only the visits we brought are ghosted. Stops that were already on the
       merge target were never part of the selection and are not on the calendar
       as movable cards. */
    const fitted = plan.stops.filter((stop) => stop.isNew).flatMap((stop) => stop.visits);

    onPreviewChange?.({
      targetDay: targetDay.format('YYYY-MM-DD'),
      overflowDay: overflowDay?.format('YYYY-MM-DD'),
      /* A visit already sitting on the target day is not moving, and dimming it
         would say it was. */
      movingVisitIds: fitted
        .filter((visit) => !visit.scheduledFor?.isSame(targetDay, 'day'))
        .map((visit) => visit.id),
      overflowVisitIds: overflowStops.flatMap((stop) => stop.visits.map((visit) => visit.id)),
    });
  }, [open, plan, targetDay, overflowDay, overflowStops, onPreviewChange]);

  /* Committed on Enter as well as on blur — typing an address and pressing
     Enter is the obvious gesture, and doing nothing there reads as broken. */

  const reorder = useCallback((orderedSiteIds) => setManualOrder(orderedSiteIds), []);

  const moveToOverflow = useCallback((siteId) => {
    setMovedOut((previous) => new Set(previous).add(siteId));
    setManualOrder(null);
  }, []);

  const bringBack = useCallback((siteId) => {
    setMovedOut((previous) => {
      const next = new Set(previous);
      next.delete(siteId);
      return next;
    });
    setManualOrder(null);
  }, []);

  const apply = () => {
    /* Creating a runsheet needs the one field this drawer cannot derive. Surface
       that before starting, rather than applying a plan onto something unnamed. */
    if (!mergeTarget && !newRunsheetName.trim()) {
      setNameTouched(true);
      return;
    }
    setApplying(true);
    window.setTimeout(() => {
      setApplying(false);
      onApplied?.({
        fittedVisitCount: plan?.fittedVisitCount || 0,
        overflowVisitCount,
        targetDay: targetDay?.format('ddd D MMM'),
        overflowDay: overflowDay?.format('ddd D MMM'),
        runsheetName: mergeTarget?.name || newRunsheetName.trim(),
        /* What the caller has to create, and everything `editRunsheet` needs to
           create it — so the integration is a payload, not a re-interview. */
        createdRunsheet: mergeTarget
          ? null
          : {
              runsheetName: newRunsheetName.trim(),
              startDate: targetDay?.format('YYYY-MM-DD'),
              startEndLocation: startPoint.point
                ? {
                    address: startPoint.point.address || startPoint.point.label,
                    lat: startPoint.point.lat,
                    lng: startPoint.point.lng,
                  }
                : null,
              visitSet: (plan?.stops || []).flatMap((stop) => stop.visits.map((visit) => visit.id)),
            },
        worker: mergeTarget?.worker || null,
        reorderedCount: plan?.reorderedExistingCount || 0,
        notifyCount:
          plan?.stops.filter((stop) =>
            stop.visits.some((visit) => !visit.scheduledFor.isSame(targetDay, 'day')),
          ).length || 0,
      });
    }, 700);
  };

  const isEmpty = !selectedShifts.length;
  const optionsCollapsed = visiblePlans.length < 2 || optionsAreEquivalent(visiblePlans);
  const startLabel = startPoint.point?.address || startPoint.point?.label || tt('noStartPoint');

  /* There is a route to talk about only once a start point exists — the solver
     needs somewhere to leave from, so no start point means no sequence, no travel
     and nothing for the meter to measure. */
  const hasRoute = Boolean(startPoint.point && plan?.stops?.length);

  /* Why nothing fit, in the box that holds what did not fit.
     "Nothing fits in this day" named the symptom and hid the cause, which left the
     only next move a guess. When a runsheet is being merged into it is almost
     always that runsheet's existing load eating the budget, so name it and its
     load; when a new runsheet is being created there is nothing else on the day,
     so the driving is the whole answer. */
  const noFitReason =
    startPoint.point && !plan?.stops?.length
      ? mergeTarget
        ? tt('nothingFitsBlocked', {
            day: dayLabel,
            runsheet: mergeTarget.worker
              ? `${mergeTarget.worker} · ${mergeTarget.name}`
              : mergeTarget.name,
            load: formatMinutesAsDuration(mergeTarget.loadMinutes),
            budget: formatMinutesAsDuration(MAN_DAY_MINUTES),
          })
        : tt('nothingFitsNew', { budget: formatMinutesAsDuration(MAN_DAY_MINUTES) })
      : '';

  /* No merge target means a new runsheet, which is also the default when the day
     holds none — so this covers both the chosen and the only-option cases. */
  const isCreatingRunsheet = !mergeTarget;
  const nameMissing = isCreatingRunsheet && nameTouched && !newRunsheetName.trim();
  const canApply = hasRoute && (!isCreatingRunsheet || Boolean(newRunsheetName.trim()));

  return (
    <RightDrawer open={open} position="right" onClose={onClose} width={DRAWER_WIDTH}>
      <Box className={classes.drawer}>
        <Box className={classes.header}>
          <Box>
            <Typography className={classes.title}>
              {tt('title', { count: selectedShifts.length })}
            </Typography>
            <Typography className={classes.subtitle}>{tt('subtitle')}</Typography>
          </Box>
          <Button disableRipple className={classes.closeButton} onClick={onClose}>
            <Clossicon />
          </Button>
        </Box>

        {isEmpty ? (
          <Box className={classes.empty}>
            <Typography className={classes.emptyText}>{tt('empty')}</Typography>
          </Box>
        ) : (
          <Box className={classes.scroll}>
            <Box className={classes.controls}>
              <Box className={classes.field}>
                <InputLabel htmlFor="harmonize-into">{tt('into')}</InputLabel>
                <CustomDropDown
                  name="harmonizeInto"
                  options={dayOptions}
                  /* Never the label as a fallback value. When the target day
                     failed to resolve this control read "Into" in both its label
                     and its value, which says nothing twice — and the same
                     unresolved day printed "Invalid Date" into the merge target
                     and the Apply button. The day is guarded at source now
                     (`defaultTargetDay`), and the placeholder here asks for the
                     thing that is missing. */
                  selectedValues={
                    dayOptions.find(
                      (option) => option.value === targetDay?.format('YYYY-MM-DD'),
                    ) || { value: '', label: tt('intoPlaceholder') }
                  }
                  handleChange={(event) => {
                    const day = dayjs(event?.target?.value);
                    if (!day.isValid()) return;
                    setTargetDay(day);
                    setOverflowDay(day.add(1, 'day'));
                  }}
                  placeHolder={tt('intoPlaceholder')}
                  maxWidth="100%"
                  labelMaxLength={32}
                  className={classes.dropdown}
                  bordered
                />
              </Box>

              {/* One field, not two. The round trip leaves from and returns to
                  the same place, so a separate "end" control would only ever
                  restate the start — and the drive home is already charged to
                  the day either way. */}
              <Box className={classes.field}>
                <InputLabel htmlFor="harmonize-address">
                  {tt('startEnd')}
                  {startPoint.isLocating && (
                    <Box component="span" className={classes.labelHint}>
                      {tt('locating')}
                    </Box>
                  )}
                </InputLabel>
                {/* A place, searched — the same Places component the site form
                    uses, so an address entered here is a real geocoded location
                    rather than the stub the free-text box committed. That stub was
                    the reason every route in the demo left from the same point
                    whatever was typed.

                    It renders nothing at all when the Maps SDK has not loaded,
                    which would silently delete the one field the plan cannot be
                    built without (the §7.17 failure mode), so the plain box is
                    kept as the fallback rather than as the default. */}
                {placesReady ? (
                  <Box className={classes.addressSearch}>
                    <GoogleMapSearchAddressComponent
                      isLoaded={placesReady}
                      isUsedInMap
                      formKey="harmonize-address"
                      placeHolder={tt('addressPlaceholder')}
                      address={addressQuery}
                      setAddress={setAddressQuery}
                      setActiveMarker={() => {}}
                      setSelectedLocation={(location) => {
                        if (!location?.position) return;
                        startPoint.setAddress({
                          name: location.name,
                          address: location.name,
                          lat: location.position.lat,
                          lng: location.position.lng,
                        });
                      }}
                    />
                  </Box>
                ) : (
                  /* Keyless path: still a search, and still a real geocode. The
                     plain text box this replaces committed one hard-coded lat/lng
                     for anything typed, so every route in the demo left from the
                     same point and the map drew a fiction. */
                  <AddressSearchField
                    id="harmonize-address"
                    /* Keyed on the resolved default so a franchise or GPS fix
                       arriving late fills the box instead of being ignored. */
                    key={startPoint.defaultKey}
                    placeholder={tt('addressPlaceholder')}
                    defaultValue={startPoint.point?.address || startPoint.point?.label || ''}
                    onSelect={(place) => startPoint.setAddress({ name: place.address, ...place })}
                  />
                )}
              </Box>
            </Box>

            <RouteMap
              isLoaded={mapsReady}
              startPoint={startPoint.point}
              /* Drawn whether or not the route leaves from it, so the planner can
                 see where the work sits relative to them. */
              devicePoint={startPoint.devicePoint}
              stops={plan?.stops || []}
              scatteredPoints={activeVisits}
              overflowStops={overflowStops}
              path={directions.path}
              highlightedSiteId={highlightedSiteId}
              onHighlight={setHighlightedSiteId}
              /* The map edits the plan through the same handlers as the stop list,
                 so the two surfaces cannot describe different plans. */
              onMoveToOverflow={moveToOverflow}
              onBringBack={bringBack}
              pending={directions.isLoading}
            />

            <Box className={classes.meterBlock}>
              {/* The meter is an *answer*, and until there is a start point there
                  is no route and therefore no question it can answer. It used to
                  render regardless, reading "0m of 8h · 8h left" over an empty
                  plan — which is not a neutral zero, it is a confident claim that
                  the day is empty, sitting directly above a hint asking for the
                  address it needs. It appears when the route does. */}
              {hasRoute && (
                <DayMeter
                  existingMinutes={plan?.existingLoadMinutes || 0}
                  serviceMinutes={plan?.serviceMinutes || 0}
                  travelMinutes={travelMinutes}
                  pendingTravel={directions.isLoading}
                  estimated={directions.isEstimated && Boolean(plan?.stops.length)}
                />
              )}

              {/* "Lands on" described where the plan ended up rather than what the
                  planner is doing. This is the assignment step: the visits go onto
                  an existing runsheet, or onto a new one. */}
              {runsheets.length > 0 ? (
                <Box className={classes.field}>
                  <InputLabel htmlFor="harmonize-lands-on">{tt('landsOn')}</InputLabel>
                  <CustomDropDown
                    name="harmonizeLandsOn"
                    options={mergeOptions}
                    selectedValues={
                      mergeOptions.find((option) => option.value === (mergeTargetId || '')) || {
                        value: '',
                        label: tt('newRunsheet'),
                      }
                    }
                    handleChange={(event) => setMergeTargetId(event?.target?.value || null)}
                    placeHolder={tt('newRunsheet')}
                    maxWidth="100%"
                    labelMaxLength={48}
                    className={classes.dropdown}
                    bordered
                  />
                </Box>
              ) : (
                <Typography className={classes.landsOnStatic}>{tt('landsOnNew')}</Typography>
              )}

              {/* Creating the runsheet inline, because this drawer already holds
                  everything `editRunsheet` asks for on the way in. Its two steps
                  want `startsAt`/`endsAt`/`startDate`/`runsheetName`, then
                  `startEndLocation`/`visitSet` — and the plan supplies the day, the
                  window, the origin and the stops. The name is the only field left,
                  so the name is the only field asked for. */}
              {isCreatingRunsheet && (
                <Box className={classes.field}>
                  <InputLabel htmlFor="harmonize-runsheet-name">{tt('newRunsheetName')}</InputLabel>
                  <TextField
                    fullWidth
                    id="harmonize-runsheet-name"
                    className={classes.addressField}
                    placeholder={tt('newRunsheetNamePlaceholder')}
                    value={newRunsheetName}
                    onChange={(event) => {
                      setNameTouched(true);
                      setNewRunsheetName(event.target.value);
                    }}
                    error={nameMissing}
                    helperText={nameMissing ? tt('newRunsheetNameRequired') : ''}
                  />
                  <Typography className={classes.derivedNote}>
                    {/* The stop count before a plan exists is the selection, not
                        zero — "the 0 visits below" was contradicting the footer
                        two lines under it. */}
                    {tt('newRunsheetDerived', {
                      count: plan?.stops?.length || activeVisits.length,
                    })}
                  </Typography>
                </Box>
              )}
            </Box>

            {!manualOrder && visiblePlans.length > 0 && (
              <RouteOptions
                plans={visiblePlans}
                selected={routeOption}
                onSelect={setRouteOption}
                onPreview={setPreviewOption}
                collapsed={optionsCollapsed}
              />
            )}

            {plan?.stops.length ? (
              <StopList
                stops={plan.stops}
                startLabel={startLabel}
                endLabel={startLabel}
                returnLegMinutes={plan.returnLegMinutes}
                finishMinutes={plan.finishMinutes}
                manual={Boolean(manualOrder)}
                summary={
                  optionsCollapsed
                    ? `${formatMinutesAsDuration(plan.totalMinutes)} · ${tt('fitCount', {
                        count: plan.fittedVisitCount,
                      })}`
                    : null
                }
                pendingTimes={directions.isLoading}
                highlightedSiteId={highlightedSiteId}
                onHighlight={setHighlightedSiteId}
                onReorder={reorder}
                onMoveToOverflow={moveToOverflow}
                onReoptimize={() => setManualOrder(null)}
              />
            ) : (
              /* The visits the planner picked, listed as a set rather than a route.
                 Before this, the drawer had no list at all until a plan solved — so
                 on a tenant where no start point resolved (no franchise coordinates,
                 no device fix) it opened onto a day dropdown, an empty address box
                 and a map of unnamed dots, and never once said which visits were in
                 hand. The reason there is no route yet travels *with* the list
                 rather than floating above it, for the same reason the nothing-fits
                 explanation was moved inside the overflow box. */
              <SelectionList
                visits={activeVisits}
                hint={startPoint.point ? '' : tt('needStartPoint')}
                highlightedSiteId={highlightedSiteId}
                onHighlight={setHighlightedSiteId}
              />
            )}

            <OverflowBucket
              stops={overflowStops}
              day={overflowDay?.format('YYYY-MM-DD') || ''}
              /* The box has to name the day the visits are leaving, not just the
                 one they are going to — otherwise "won't fit" has no subject. */
              targetDayLabel={dayLabel}
              dayOptions={dayOptions}
              onDayChange={(value) => setOverflowDay(dayjs(value))}
              onReturn={bringBack}
              /* Only when *nothing* fits. With a partial plan the route above
                 already shows what the day could take, and an explanation of why
                 the rest did not would be restating the obvious. */
              reason={noFitReason}
            />
          </Box>
        )}

        <Box className={classes.footer}>
          <Box className={classes.footerSummary}>
            {/* With no plan the selected visits are not "fitting" anywhere — they
                are simply unaccounted for, and "everything fits" would be a lie
                told over seven visits sitting in limbo. */}
            <Typography className={classes.footerLine}>
              {plan
                ? tt('footerSummary', {
                    count: plan.fittedVisitCount,
                    day: targetDay?.format('ddd D MMM') || '',
                  })
                : tt('footerNoPlan', { count: selectedShifts.length })}
            </Typography>
            <Typography className={classes.footerSubline}>
              {!plan
                ? tt('footerNoPlanHint')
                : overflowVisitCount > 0
                  ? tt('footerOverflow', {
                      count: overflowVisitCount,
                      day: overflowDay?.format('ddd D MMM') || '',
                    })
                  : tt('footerNoOverflow')}
              {/* Re-solving a merge target rewrites stops the planner never
                  picked. That has to be said before Apply, not after. */}
              {plan?.reorderedExistingCount
                ? ` · ${tt('footerReordered', {
                    count: plan.reorderedExistingCount,
                    name: mergeTarget?.name,
                  })}`
                : ''}
            </Typography>
          </Box>

          <Box className={classes.footerActions}>
            <Button disableRipple variant="secondaryGrey" onClick={onClose} disabled={applying}>
              {tt('keepCurrent')}
            </Button>
            <Button
              disableRipple
              variant="primary"
              disabled={!canApply || applying}
              onClick={apply}
              className={classNames(applying && classes.busy)}
            >
              {applying
                ? tt('applying')
                : tt('apply', { day: targetDay?.format('ddd D MMM') || '' })}
            </Button>
          </Box>
        </Box>
      </Box>
    </RightDrawer>
  );
};

HarmonizeDrawer.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  selectedShifts: PropTypes.array,
  onApplied: PropTypes.func.isRequired,
  onPreviewChange: PropTypes.func,
};

HarmonizeDrawer.defaultProps = { selectedShifts: [] };

export default HarmonizeDrawer;
