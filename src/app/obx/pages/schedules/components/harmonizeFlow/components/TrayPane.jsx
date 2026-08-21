import { Box, Typography } from '@mui/material';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { formatCompact, onSiteMinsFor } from '../model/durations';
import { zoneName } from '../model/fixtures';
import { isFixableInFlow, UNPLACED_REASON } from '../model/reasons';
import WindowStrip from './WindowStrip';

/**
 * What the run could not place, and — for each one — why, in its own words.
 *
 * The tray is where this flow either explains itself or looks broken. §5 makes a
 * machine-readable reason a hard requirement of the backend contract precisely so this
 * pane can be written: five codes, five different sentences, and three of them carry a
 * remedy the planner can act on without leaving the drawer.
 *
 * **Hours, not the count, at the top** (§14.4). Two visits sounds like a rounding
 * error. `4h40m — a fifth of the week` is the same fact told in the unit the rest of
 * the flow uses, and it is the one that gets read.
 *
 * **Set-aside sits apart from the failures.** A visit the planner removed on purpose
 * and a visit the engine could not place are both "not placed" and are not the same
 * event; grouping them would let a deliberate decision hide inside a list of problems.
 */
const TrayPane = ({ classes, unplaced, onRestore, onDragStart, onDragEnd, onWorkZone }) => {
  const { t } = useTranslation();
  const tt = (key, options) => t(`obx.runsheet.harmonizeFlow.${key}`, options);

  const totalMins = unplaced.reduce((sum, u) => sum + onSiteMinsFor(u.visit.filterCount), 0);

  if (!unplaced.length) {
    return <Typography className={classes.trayIntro}>{tt('trayEmpty')}</Typography>;
  }

  return (
    <Box>
      <Box className={classes.section}>
        <Typography component="h3" className={classes.routeTitle}>
          {tt('trayTitle', { time: formatCompact(totalMins) })}
        </Typography>
        <Typography className={classes.routeMeta}>
          {tt('trayMeta', { visits: tt('count.visit', { count: unplaced.length }) })}
        </Typography>
      </Box>

      {unplaced.map((item) => {
        const aside = item.reason === UNPLACED_REASON.SET_ASIDE;
        return (
          <Box
            key={item.visit.id}
            className={classNames(classes.trayCard, aside && classes.trayCardDraggable)}
            /* Draggable so a set-aside visit can go back by the same gesture that
               moved it, not only through the panel's own button. */
            draggable={aside}
            onDragStart={() => (aside ? onDragStart(item.visit.id) : undefined)}
            onDragEnd={onDragEnd}
            /* Only the set-aside cards are actionable, so only they are a tab stop — and
               Enter puts one back, which is the same gesture the drag performs. Without
               this the card carried a focus ring it could never show and the only
               keyboard route back was the remedy link below it. */
            {...(aside
              ? {
                  tabIndex: 0,
                  role: 'button',
                  'aria-label': tt('putItBackFor', { site: item.site?.name }),
                  onKeyDown: (e) => {
                    if (e.key !== 'Enter' && e.key !== ' ') return;
                    e.preventDefault();
                    onRestore(item.visit.id);
                  },
                }
              : {})}
          >
            <Typography className={classes.stopName}>{item.site?.name}</Typography>
            <Typography className={classes.stopMeta}>
              {tt('stopMeta', {
                company: item.site?.company,
                filters: tt('count.filter', { count: item.visit.filterCount }),
              })}
              {' · '}
              {formatCompact(onSiteMinsFor(item.visit.filterCount))}
            </Typography>

            <WindowStrip classes={classes} visit={item.visit} legalDays={item.legalDays} />

            <Typography className={classes.trayReason}>
              {tt(`reason.${item.reason}`, { zone: zoneName(item.site?.zoneId) })}
            </Typography>

            {/* A remedy only where one exists inside this drawer. A site with no zone
                cannot be fixed by any control here, and offering a button that opens
                the site record mid-proposal is a worse answer than saying so. */}
            {isFixableInFlow(item.reason) ? (
              <Box
                component="button"
                type="button"
                className={classes.trayRemedy}
                onClick={() => (aside ? onRestore(item.visit.id) : onWorkZone(item.site?.zoneId))}
              >
                {aside ? tt('putItBack') : tt('workZone', { zone: zoneName(item.site?.zoneId) })}
              </Box>
            ) : null}
          </Box>
        );
      })}

      {/**
       * Q21 — parked, and visibly so.
       *
       * The obvious sentence here is "they keep their due dates and come back next time
       * you harmonize", and §14.1 proves it is false for roughly four of every seven
       * due dates: a 7-day window inside a 7-day range only reaches next week when the
       * due date falls in the last three days, and D18 puts past-due visits out of
       * scope, so for the rest it is a silent one-way delete. Writing the comfortable
       * version would be shipping a lie into the screen that is meant to be the honest
       * one, so the drawer states only what it can stand behind and says the rest is
       * undecided. Replace this the moment Q21 lands.
       */}
      <Typography className={classes.hint}>{tt('deferralUndecided')}</Typography>
    </Box>
  );
};

TrayPane.propTypes = {
  classes: PropTypes.object.isRequired,
  unplaced: PropTypes.array.isRequired,
  onRestore: PropTypes.func.isRequired,
  onDragStart: PropTypes.func.isRequired,
  onDragEnd: PropTypes.func.isRequired,
  onWorkZone: PropTypes.func.isRequired,
};

export default TrayPane;
