import { Box, Typography } from '@mui/material';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { formatMinutesAsDuration } from 'src/app/obx/pages/runSheets/buildRoute/helper';

import { useStyles } from '../harmonizeDrawer.styles';

/**
 * The visits the planner picked, before there is a route.
 *
 * This drawer had no such list, and that was its largest hole: until a start
 * point resolved there was no plan, and `StopList` only draws a plan — so the one
 * thing the planner knew for certain, *which visits am I working with*, was the
 * one thing the screen never showed. On a tenant with no franchise coordinates
 * (the demo) nothing resolved at all, and the drawer opened onto a day dropdown,
 * an empty address box and a map of two anonymous dots.
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
 * Hovering a row highlights the same site's pin, using the same `onHighlight`
 * channel the solved list uses, so list and map stay one object in two views.
 */
const SelectionList = ({ visits = [], hint, highlightedSiteId, onHighlight }) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const tt = (key, options) => t(`obx.runsheet.harmonize.${key}`, options);

  if (!visits.length) return null;

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
        <Typography className={classes.sectionLabel}>{tt('selectionLabel')}</Typography>
        <Box className={classes.grow} />
        {dayCount > 1 && (
          <Typography className={classes.optionMetaText}>
            {tt('selectionSpread', { count: dayCount })}
          </Typography>
        )}
      </Box>

      <Box className={classes.timeline}>
        {ordered.map((visit) => (
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
            {/* A dot, not an index. It marks the row without claiming a position
                in a sequence that does not exist yet. */}
            <Box className={classes.selectionMark} />

            <Box className={classes.stopBody}>
              <Typography className={classes.stopName}>{visit.siteName}</Typography>
              <Typography className={classes.stopMeta}>
                {formatMinutesAsDuration(visit.serviceMinutes)}
                {addressFor(visit) ? ` · ${addressFor(visit)}` : ''}
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
        ))}
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
  hint: PropTypes.string,
  highlightedSiteId: PropTypes.string,
  onHighlight: PropTypes.func,
};

export default SelectionList;
