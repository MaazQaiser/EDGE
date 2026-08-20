import { Box, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { formatMinutesAsDuration } from 'src/app/obx/pages/runSheets/buildRoute/helper';
import {
  VISIT_STATE,
  VISIT_STATE_LABEL_KEYS,
  VISIT_STATE_STYLE,
} from 'src/app/obx/pages/schedules/helper/visitState';
import { useTenantLabel } from 'src/helper/utilityHooks';

import { useStyles } from '../harmonize.styles';
import { needByOf } from '../harmonizeRule';

/**
 * A map pin, because these rows are locations.
 *
 * A dot is a bullet — it says "list item". The product already answers this
 * elsewhere: the runsheet's own stop list marks each site with a teardrop pin, so
 * that is the convention for a list of places here, and matching it means a planner
 * reads the same shape for the same idea on both screens.
 *
 * The map keeps circles. That is not an inconsistency: on a map every mark is
 * already understood to be a place, and the circles carry the stop number once the
 * route solves. The pin is what earns its keep in a *list*, where nothing else says
 * "this is somewhere".
 *
 * Colours are literals here because SVG fills cannot read a CSS class, which is the
 * same reason `RouteMap` pulls its marker colours out of the theme.
 */
const StatePin = ({ accent, routed, className, surfaceWhite }) => (
  <Box
    component="svg"
    viewBox="0 0 24 24"
    className={className}
    aria-hidden="true"
    focusable="false"
  >
    <path
      d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
      fill={routed ? accent : surfaceWhite}
      stroke={accent}
      strokeWidth={routed ? 0 : 2}
    />
    {/* The hole in a filled pin. On a hollow one the surface shows through already,
        and punching a second hole would read as a different mark. */}
    {routed && <circle cx="12" cy="9" r="2.6" fill={surfaceWhite} />}
  </Box>
);

StatePin.propTypes = {
  accent: PropTypes.string.isRequired,
  routed: PropTypes.bool,
  className: PropTypes.string,
  surfaceWhite: PropTypes.string,
};

/**
 * The visits the planner picked, before there is a route.
 *
 * This drawer had no such list, and that was its largest hole: until a start
 * point resolved there was no plan, and `StopList` only draws a plan — so the one
 * thing the planner knew for certain, *which visits am I working with*, was the
 * one thing the screen never showed.
 *
 * It is deliberately **not** the stop list in a different costume:
 *
 * - **No numbers and no arrival times.** Before the solver has run these visits
 *   are a *set*, not an order. Numbering them would invent a sequence nobody
 *   produced — the same reason `TileRouteMap` draws no line until the plan solves.
 * - **The current day is the interesting column**, not a projected one. What the
 *   planner is about to collapse is a scatter across the week, so each row says
 *   the day it sits on today. That scatter is the argument for harmonizing at all.
 * - **Chronological**, matching the grid the selection was made on (`06` D7).
 *
 * **Every row carries its visit's state**, because "move these four" means something
 * different for each: one already missed is recovery, one in progress is a live
 * route being changed under a driver, one upcoming is ordinary planning. The rows
 * used to be identical, which flattened all three into one undifferentiated list.
 *
 * The encoding is the grid's, carried on the pin:
 *
 *   colour — the state family, from `VISIT_STATE_STYLE` (the same accents the
 *            cards use), so a visit is the same colour on both surfaces
 *   fill   — filled means somebody planned it, hollow means nobody has. This is
 *            the card's dashed-border rule in pin form, and it is what separates
 *            `MISSED` from `UNASSIGNED`, which share an accent
 *   word   — the state, spelled out in the meta line. Never colour alone.
 *
 * Hovering a row highlights the same site's pin on the map, using the same
 * `onHighlight` channel the solved list uses, so list and map stay one object in
 * two views.
 */

const SelectionList = ({ visits = [], label, hint, highlightedSiteId, onHighlight }) => {
  const classes = useStyles();
  const theme = useTheme();
  const { t } = useTranslation();
  const { getLabel } = useTenantLabel();
  const tt = (key, options) => t(`obx.runsheet.harmonize.${key}`, options);

  if (!visits.length) return null;

  /* The same vocabulary the card uses, with the same tenant terms interpolated —
     one state must not be called two things on two surfaces. `SCHEDULED` stays
     wordless: it is the baseline, and labelling it would drown the rows that
     actually need attention (`06` D6). */
  const stateWordFor = (visit) => {
    const state = visit.visitState;
    if (!state || state === VISIT_STATE.SCHEDULED) return '';
    const key = VISIT_STATE_LABEL_KEYS[state];
    if (!key) return '';
    return t(`obx.schedules.calendar.visits.state.${key}`, {
      runsheet: getLabel('terms', 'runsheet', t),
      tour: getLabel('terms', 'tour', t),
      hit: getLabel('terms', 'hit', t),
    });
  };

  /* Case 4.6 all over again. The demo's fallback address is `${siteName}, Tampa,
     FL`, so printing it under the name renders "Vantage Point Labs" and then
     "Vantage Point Labs, Tampa, FL" directly beneath — which reads as a data
     error rather than a location. An address earns its line only when it says
     something the name above it did not. */
  const addressFor = (visit) => {
    const address = (visit.address || '').trim();
    const site = (visit.siteName || '').trim();
    if (!address || !site) return address;
    return address.toLowerCase().startsWith(site.toLowerCase()) ? '' : address;
  };

  /* Suppressed when it is the same date as the day already shown on the right: two
     identical dates on one row read as a data error, which is the lesson the address
     line above learned first. */
  const dueFor = (visit) => {
    const due = needByOf(visit);
    if (!due?.isValid?.()) return '';
    if (visit.scheduledFor?.isValid?.() && due.isSame(visit.scheduledFor, 'day')) return '';
    return tt('dueOn', { date: due.format('D MMM') });
  };

  /* Read in the order the work currently happens, so the spread across the week
     is legible as a spread rather than as a list of names. */
  const ordered = [...visits].sort((a, b) => {
    if (!a.scheduledFor?.isValid?.() || !b.scheduledFor?.isValid?.()) return 0;
    return a.scheduledFor.valueOf() - b.scheduledFor.valueOf();
  });

  /* How many days the selection is spread over — the number that says whether
     harmonizing is worth doing. One day is already harmonized. */
  const dayCount = new Set(
    ordered
      .filter((visit) => visit.scheduledFor?.isValid?.())
      .map((visit) => visit.scheduledFor.format('YYYY-MM-DD')),
  ).size;

  return (
    <Box className={classes.stopList}>
      <Box className={classes.stopListHeader}>
        {/* The caller names the set. It used to be hard-coded "Visits you
            selected", which stopped being true the moment the optimizer started
            taking the week rather than a selection. */}
        <Typography className={classes.sectionLabel}>{label || tt('selectionLabel')}</Typography>
        <Box className={classes.grow} />
        {dayCount > 1 && (
          <Typography className={classes.optionMetaText}>
            {tt('selectionSpread', { count: dayCount })}
          </Typography>
        )}
      </Box>

      <Box className={classes.timeline}>
        {ordered.map((visit) => {
          const style = VISIT_STATE_STYLE[visit.visitState] || null;
          const stateWord = stateWordFor(visit);
          const address = addressFor(visit);

          return (
            <Box
              key={visit.id}
              onMouseEnter={() => onHighlight?.(visit.siteId)}
              onMouseLeave={() => onHighlight?.(null)}
              className={classNames(
                classes.stopRow,
                classes.selectionRow,
                highlightedSiteId === visit.siteId && classes.stopRowHighlighted,
              )}
            >
              {/* A pin, not an index — it marks a *place* and carries the state
                  without claiming a position in a sequence that does not exist. */}
              <StatePin
                className={classes.selectionMark}
                accent={style?.accent || theme.palette.surfaceBrand}
                routed={style ? style.routed : true}
                surfaceWhite={theme.palette.surfaceWhite}
              />

              <Box className={classes.stopBody}>
                <Typography className={classes.stopName}>{visit.siteName}</Typography>

                {/* State first, because it changes what moving this visit means,
                    then how long it takes. One line, so the row stays two-high. */}
                <Typography className={classes.stopMeta}>
                  {stateWord && (
                    <Box
                      component="span"
                      className={classes.selectionState}
                      style={style ? { color: style.accent } : undefined}
                    >
                      {stateWord}
                    </Box>
                  )}
                  {stateWord ? ' · ' : ''}
                  {formatMinutesAsDuration(visit.serviceMinutes)}
                  {/* **The date the contract fixed, not the date the schedule chose.**
                      The column on the right says where this visit sits today, which is
                      what the plan is about to change; this says when it is actually
                      due, which is what decides whether the plan is allowed to. Both,
                      because the gap between them is the reason the visit is in this
                      list at all. */}
                  {dueFor(visit) ? ` · ${dueFor(visit)}` : ''}
                  {address ? ` · ${address}` : ''}
                </Typography>

                {visit.hasAccessWindow && (
                  <Typography className={classes.windowWarning}>⚠ {tt('accessWindow')}</Typography>
                )}
              </Box>

              {/* Where it sits today — the thing this plan is about to change. */}
              <Typography className={classes.selectionDay}>
                {visit.scheduledFor?.isValid?.() ? visit.scheduledFor.format('ddd D MMM') : ''}
              </Typography>
            </Box>
          );
        })}
      </Box>

      {/* The reason there is no route yet belongs with the list it applies to,
          rather than floating above it as a separate warning (the lesson from the
          overflow box — a message adrift from its subject reads as being about
          something else). */}
      {hint && <Typography className={classes.selectionHint}>{hint}</Typography>}
    </Box>
  );
};

SelectionList.propTypes = {
  visits: PropTypes.array,
  label: PropTypes.string,
  hint: PropTypes.string,
  highlightedSiteId: PropTypes.string,
  onHighlight: PropTypes.func,
};

export default SelectionList;
