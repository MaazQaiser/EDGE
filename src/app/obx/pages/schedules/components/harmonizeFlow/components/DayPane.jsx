import { Box, Typography } from '@mui/material';
import classNames from 'classnames';
import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { capacityDelta, formatCompact, formatElapsed } from '../model/durations';
import { zoneName } from '../model/fixtures';
import { ChevronDown, DragHandle } from './Glyphs';
import WindowStrip from './WindowStrip';

/**
 * One day, as a route card — the same object the workspace draws.
 *
 * ## The anatomy, and why it is this one
 *
 * The workspace already settled how a harmonized route looks in this product, and a
 * planner comparing the two shells should be comparing *shells*, not relearning what a
 * stop is. So the card is reproduced part for part:
 *
 *   **head**   — the route's name, the used-of-budget figure on the right, and a gauge
 *                directly beneath. One glance: what day, how full.
 *   **rail**   — a grey anchor, then a numbered pin per stop on a dashed track, then a
 *                grey anchor. The track is the day; the pins are the order.
 *   **row**    — grip · pin · site name · `distance · duration` · chevron.
 *   **detail** — the chevron opens the arithmetic behind the figure.
 *
 * Two departures from the workspace, both forced by this shell's model rather than by
 * taste:
 *
 * - **The figure's left half is a drive time, not a distance.** The workspace measures a
 *   radius in miles from a start point and has distances to quote; this model has no
 *   radius at all (D15 replaced it with zones), and quoting notional straight-line miles
 *   would be inventing precision the geometry does not have. So the leg reads `drive
 *   15m`, which is the number the day's total is actually built from.
 * - **The disclosure states elapsed arrival and departure** (D16), because that is what
 *   this model produces and what §14.3 wants visible before it goes downstream.
 *
 * The travel leg is drawn as part of the *track* rather than as its own row, which is
 * how the workspace does it and why the return leg has anywhere to live — a
 * `travelFromPrev` column on each stop leaves the drive home with no row, and the day's
 * stated duration stops adding up on screen.
 */
const DayPane = ({
  classes,
  sheet,
  legalDaysByVisit,
  accepted,
  draggingId,
  onDragStart,
  onDragEnd,
  onStartMove,
  isTipping,
}) => {
  const { t } = useTranslation();
  const tt = (key, options) => t(`obx.runsheet.harmonizeFlow.${key}`, options);
  const [openId, setOpenId] = useState(null);

  const delta = capacityDelta(sheet.durationMins, sheet.shiftMins);
  const isAccepted = accepted.includes(sheet.date);

  /* Scaled to the larger of the two so an over day still fits its own track and the
     overrun block has a fixed share of it to occupy. */
  const scale = Math.max(sheet.durationMins, sheet.shiftMins) || 1;
  const withinPct = (Math.min(sheet.durationMins, sheet.shiftMins) / scale) * 100;
  const overPct = (sheet.overrunMins / scale) * 100;

  const anchor = (label, extra) => (
    <Box className={classes.railRow}>
      <Box className={classes.grip} />
      <Box className={classes.pinColumn}>
        <Box className={classes.anchorDot} />
        {extra ? null : <Box className={classes.track} />}
      </Box>
      <Box className={classes.stopBody}>
        <Typography className={classes.stopMeta}>
          {label}
          {extra ? ` · ${extra}` : ''}
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Box className={classes.routeCard}>
      <Box className={classes.routeHead}>
        <Box className={classes.routeHeadRow}>
          <Typography component="h3" className={classes.routeTitle}>
            {tt('routeFor', { day: dayjs(sheet.date).format('ddd D MMM') })}
          </Typography>
          <Typography className={classes.routeBudget}>
            {formatCompact(sheet.durationMins)} / {formatCompact(sheet.shiftMins)}
          </Typography>
        </Box>
        <Typography className={classes.routeMeta}>
          {tt('paneMeta', {
            zone: zoneName(sheet.zoneId),
            stops: tt('count.stop', { count: sheet.stops.length }),
            filters: tt('count.filter', { count: sheet.filterCount }),
            drive: formatCompact(sheet.travelMins),
          })}
          {' · '}
          {delta.direction === 'exact'
            ? tt('exactlyFull')
            : tt(isAccepted && delta.isOver ? 'overAccepted' : delta.direction, {
                amount: formatCompact(delta.magnitude),
              })}
        </Typography>

        <Box className={classes.gaugeTrack}>
          <Box className={classes.gaugeRule}>
            <Box
              className={classNames(classes.gaugeFill, delta.isOver && classes.gaugeFillOver)}
              style={{ width: `${withinPct}%` }}
            />
            {sheet.overrunMins > 0 ? (
              <Box
                className={classNames(
                  classes.gaugeOverrun,
                  isAccepted && classes.gaugeOverrunSettled,
                )}
                style={{ left: `${withinPct}%`, width: `${Math.max(overPct, 2)}%` }}
              />
            ) : null}
          </Box>
        </Box>
      </Box>

      {/* An empty day is the message and nothing else. It used to render the message and
          then the opening anchor unconditionally, so the state was a sentence followed by
          a lone grey ring with a dashed line running down from it into nothing. */}
      {!sheet.stops.length ? (
        <Box className={classes.rail}>
          <Typography className={classes.emptyDay}>
            {tt('emptyDay', {
              zone: zoneName(sheet.zoneId),
              shift: formatCompact(sheet.shiftMins),
            })}
          </Typography>
        </Box>
      ) : (
        <Box className={classes.rail} role="list">
          {anchor(tt('base'))}

          {sheet.stops.map((stop, index) => {
            const isOpen = openId === stop.visit.id;
            const isLast = index === sheet.stops.length - 1;

            return (
              <Box
                className={classNames(
                  classes.railRow,
                  draggingId === stop.visit.id && classes.stopDragging,
                )}
                key={stop.visit.id}
              >
                {/* Visibility is a CSS concern now — `stopRow:hover` and the focused
                  `stopBody` both reveal it. `gripVisible` stays for the one case CSS
                  cannot see: a row whose disclosure is open. */}
                <Box className={classNames(classes.grip, isOpen && classes.gripVisible)}>
                  <DragHandle size={16} />
                </Box>

                <Box className={classes.pinColumn}>
                  <Box className={classes.pin}>
                    <Typography component="span" className={classes.pinLabel}>
                      {stop.index}
                    </Typography>
                  </Box>
                  <Box className={classNames(classes.track, !isLast && classes.trackBrand)} />
                </Box>

                <Box
                  className={classes.stopBody}
                  draggable
                  onDragStart={() => onDragStart(stop.visit.id)}
                  onDragEnd={onDragEnd}
                  tabIndex={0}
                  role="listitem"
                  aria-label={tt('moveStop', { site: stop.site.name })}
                  /* Enter or Space starts the same move a drag starts — the card was
                   focusable with nothing behind it, so drag was the only way to move
                   work between days. */
                  onKeyDown={(e) => {
                    if (e.key !== 'Enter' && e.key !== ' ') return;
                    e.preventDefault();
                    onStartMove(stop.visit.id);
                  }}
                >
                  <Box
                    className={classNames(classes.stopRow, isTipping(stop) && classes.stopTipping)}
                  >
                    <Box sx={{ minWidth: 0 }}>
                      <Typography className={classes.stopName}>{stop.site.name}</Typography>
                      <Typography className={classes.stopMeta}>
                        {tt('stopMeta', {
                          company: stop.site.company,
                          filters: tt('count.filter', { count: stop.visit.filterCount }),
                        })}
                      </Typography>
                      <WindowStrip
                        classes={classes}
                        visit={stop.visit}
                        legalDays={legalDaysByVisit[stop.visit.id] || []}
                        placedDate={sheet.date}
                      />
                    </Box>

                    <Box className={classes.stopFigure}>
                      <Typography className={classes.figureText}>
                        {tt('drive', { time: formatCompact(stop.travelFromPrev) })}
                      </Typography>
                      <Typography className={classes.figureText}>·</Typography>
                      <Typography className={classes.figureText}>
                        {formatCompact(stop.onSiteMins)}
                      </Typography>
                      <Box
                        component="button"
                        type="button"
                        className={classNames(classes.chevron, isOpen && classes.chevronOpen)}
                        aria-expanded={isOpen}
                        aria-label={tt('stopDetailFor', { site: stop.site.name })}
                        onClick={() => setOpenId(isOpen ? null : stop.visit.id)}
                      >
                        <ChevronDown size={16} />
                      </Box>
                    </Box>
                  </Box>

                  {isOpen ? (
                    <Box className={classes.stopDetail}>
                      <Typography className={classes.detailLabel}>{tt('detailArrive')}</Typography>
                      <Typography className={classes.detailValue}>
                        {formatElapsed(stop.arriveMins)}
                      </Typography>
                      <Typography className={classes.detailLabel}>{tt('detailDepart')}</Typography>
                      <Typography className={classes.detailValue}>
                        {formatElapsed(stop.departMins)}
                      </Typography>
                      <Typography className={classes.detailLabel}>{tt('detailOnSite')}</Typography>
                      {/* The arithmetic, not just the answer — `10 + filters × 20` (D10) is
                        the whole cost model and it is the one number a planner is most
                        likely to want to check. */}
                      <Typography className={classes.detailValue}>
                        {tt('detailOnSiteSum', {
                          filters: stop.visit.filterCount,
                          total: formatCompact(stop.onSiteMins),
                        })}
                      </Typography>
                      <Typography className={classes.detailLabel}>{tt('detailDrive')}</Typography>
                      <Typography className={classes.detailValue}>
                        {formatCompact(stop.travelFromPrev)}
                      </Typography>
                    </Box>
                  ) : null}
                </Box>
              </Box>
            );
          })}

          {anchor(tt('base'), tt('elapsedPlain', { time: formatElapsed(sheet.durationMins) }))}
        </Box>
      )}
    </Box>
  );
};

DayPane.propTypes = {
  classes: PropTypes.object.isRequired,
  sheet: PropTypes.object.isRequired,
  legalDaysByVisit: PropTypes.object.isRequired,
  accepted: PropTypes.array.isRequired,
  draggingId: PropTypes.string,
  onDragStart: PropTypes.func.isRequired,
  onDragEnd: PropTypes.func.isRequired,
  onStartMove: PropTypes.func.isRequired,
  isTipping: PropTypes.func.isRequired,
};

export default DayPane;
