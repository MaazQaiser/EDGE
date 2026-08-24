import { Tooltip } from '@mui/material';
import { Box, Typography } from '@mui/material';
import classNames from 'classnames';
import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PlusIcon } from 'src/app/obx/pages/schedules/components/harmonizeFlow/components/Glyphs';

/**
 * The days — **one row, present from the first frame.**
 *
 * ## What this merged, and why it is Split's own rather than the drawer's
 *
 * There were two rows of the same three dates stacked forty pixels apart: a row of boxed
 * pills in ① carrying zone and shift, and the drawer's `DayTabs` under it carrying a stop
 * count and the drop targets. Different jobs, identical subjects, and the second row was
 * the one that answered *which day am I reading* — so the pills were a second index for a
 * thing that already had one.
 *
 * They are one row now, and it is the tab row, because a tab is what a row of mutually
 * exclusive dates is. **The zone and the shift hours came off it**: they belong to the
 * route, the route header states both, and that header is on screen at the same time — so
 * a tab repeating them was a caption for a card sitting directly below it.
 *
 * This is the **one** ③ component Split does not take from the drawer, and the divergence
 * is deliberate rather than drift. Two things the drawer's `DayTabs` cannot do and should
 * not learn: it maps `runsheets`, so it cannot exist before a run; and it prints `0` for an
 * empty day, which is a true statement about a solved day and a false one about a day
 * nobody has solved.
 *
 * **Every class is handed in, and the two shells now hand in different ones.** This used to
 * be `harmonizeFlow.styles.js`'s tab rules in both cases, on the argument that a shared sheet
 * is what stops two rows drifting in appearance. Split overrides them wholesale now — its row
 * is a segmented control of bordered boxes where the drawer's is an underlined strip — so the
 * appearance is deliberately two answers to the same question, which is what a comparison
 * shell is for. What cannot drift is the *behaviour*, because that is this file and there is
 * one of it.
 *
 * **A third reason used to be the zone colour dot, and it has been removed.** Each tab
 * carried a 7px dot in its zone's hue, argued for as the tie between a date in this row and
 * a shape on the map beside it. Removed on instruction, and the tie survives without it:
 * the route header directly below states the zone by name in its chip, and every territory
 * on the map is captioned with its own name. What the dot added on top of those was a
 * colour a reader has to learn before it means anything, on the row whose job is simply
 * *which day am I reading*.
 *
 * **The amber overrun dot stays.** It is not a marker for the day, it is a statement that
 * this day finishes past its shift — the only such mark in the row, and the reason the row
 * can be compared at a glance at all.
 *
 * ## Before the press it is still a tab row
 *
 * That is the point of it existing early. The planner picks a day, the route header under
 * it fills with that day's zone, shift and forecast, and the map focuses its territory —
 * all before anything is sequenced. Pressing Harmonize then changes the *contents* of a
 * layout that is already on screen rather than conjuring one, which is what stops the
 * column jumping at the moment somebody is reading it.
 */
const DayTabRow = ({
  classes,
  days,
  runsheets,
  planned,
  openDay,
  onOpenDay,
  onHoverZone,
  accepted,
  drag,
  quotesForDrag,
  onDropOn,
  onDragOverDay,
  onAddRoute,
  showAdd,
}) => {
  const { t } = useTranslation();
  const tt = (key, options) => t(`obx.runsheet.harmonizeFlow.${key}`, options);

  /**
   * Whether the row has more tabs than fit.
   *
   * The scrollbar is hidden — 4px of chrome on a 36px row — so without a cue the trailing
   * tabs read as absent rather than off-screen. Measured rather than counted, because the
   * labels are dates and their widths vary. The drawer's own row does exactly this.
   */
  const rowRef = useRef(null);
  const [overflows, setOverflows] = useState(false);
  useEffect(() => {
    const node = rowRef.current;
    if (!node) return undefined;
    const measure = () => setOverflows(node.scrollWidth > node.clientWidth + 1);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, [days.length]);

  const sheetFor = (date) => runsheets.find((sheet) => sheet.date === date) || null;

  return (
    <Box
      ref={rowRef}
      className={classNames(classes.tabRow, overflows && classes.tabRowScrollable)}
      role="tablist"
      aria-label={tt('stripLabel')}
    >
      {days.map((day) => {
        const sheet = sheetFor(day.date);
        const quote = drag?.visitId ? quotesForDrag?.[day.date] : null;
        const isAccepted = accepted.includes(day.date);
        const selected = openDay === day.date;

        return (
          <Box
            component="button"
            type="button"
            key={day.date}
            role="tab"
            id={`harmonize-tab-${day.date}`}
            aria-controls="harmonize-panel"
            aria-selected={selected}
            aria-label={
              quote
                ? tt(quote.legal ? 'a11yDropLegal' : 'a11yDropRefused', {
                    day: dayjs(day.date).format('ddd D'),
                    reason: tt(`refuse.${quote.reason}`),
                  })
                : undefined
            }
            className={classNames(
              classes.tab,
              selected && classes.tabSelected,
              quote?.legal && classes.tabDropLegal,
              quote && !quote.legal && classes.tabDropRefused,
            )}
            onClick={() => {
              /* While a move is in flight a tab is a *destination*, not a filter — this is
                 what gives `Move day` and the keyboard path somewhere to land. Clicking a
                 refused tab shows the refusal rather than doing nothing silently. */
              if (drag?.visitId) {
                if (quote?.legal) onDropOn(day.date);
                else onDragOverDay(day.date);
                return;
              }
              onOpenDay(day.date);
            }}
            onMouseEnter={() => onHoverZone?.(day.zoneId)}
            onMouseLeave={() => onHoverZone?.(null)}
            onFocus={() => onHoverZone?.(day.zoneId)}
            onBlur={() => onHoverZone?.(null)}
            onDragOver={(event) => {
              /* Prevented even for a refused target, so the refusal can be *reported* on
                 hover rather than expressed as a dead zone the pointer slides over. */
              event.preventDefault();
              onDragOverDay(day.date);
            }}
            onDrop={(event) => {
              event.preventDefault();
              onDropOn(day.date);
            }}
          >
            {/**
             * **Two lines: the day, then what is on it.**
             *
             * The date used to sit on one line with a grey count pill beside it. Restructured
             * to a stacked card on instruction, from a reference showing the weekday over the
             * date over an `N Visits` line — *"use somewhat this design for the tabs. These are
             * too big. reduce them a little bit."*
             *
             * So the structure is the reference's and the scale is not: the weekday and the
             * date share **one** line rather than stacking into three, which is most of what
             * makes the reference card tall. What is kept is the part that matters — the count
             * as its own quiet line underneath, rather than a pill competing with the date on
             * the same one.
             */}
            <Typography component="span" className={classes.tabDay}>
              {dayjs(day.date).format('ddd D')}
            </Typography>

            {/* **The count only once there is one.** Academic in this shell now — the row does
                not exist before the press — but kept, because the tab's second line is what
                gives it its height and a tab that lost a line would resize. */}
            {planned && sheet ? (
              <Box className={classes.tabCountRow}>
                <Typography component="span" className={classes.tabCount}>
                  {tt('count.visit', { count: sheet.stops.length })}
                </Typography>
                {sheet.overrunMins > 0 ? (
                  <Box
                    className={classNames(classes.tabDot, isAccepted && classes.tabDotSettled)}
                    aria-hidden="true"
                  />
                ) : null}
              </Box>
            ) : null}
          </Box>
        );
      })}

      {/* The ghost tab — the drawer's own, including its reasoning: no count, no underline,
          no selected state, quiet until hovered, because it does not *select* a panel, it
          makes a new one. Only once there is a plan to add a route to. */}
      {planned && showAdd ? (
        <Tooltip arrow title={tt('addRouteHint')}>
          <Box
            component="button"
            type="button"
            className={classes.tabAdd}
            aria-label={tt('addRoute')}
            onClick={onAddRoute}
          >
            <PlusIcon size={16} />
          </Box>
        </Tooltip>
      ) : null}
    </Box>
  );
};

DayTabRow.propTypes = {
  classes: PropTypes.object.isRequired,
  /** Config A's worked days — the row's subjects, present whether or not anything is solved. */
  days: PropTypes.array.isRequired,
  /** The solved days, once there are any. Supplies the count and the overrun mark. */
  runsheets: PropTypes.array,
  planned: PropTypes.bool,
  openDay: PropTypes.string,
  onOpenDay: PropTypes.func.isRequired,
  onHoverZone: PropTypes.func,
  accepted: PropTypes.arrayOf(PropTypes.string),
  drag: PropTypes.object,
  quotesForDrag: PropTypes.object,
  onDropOn: PropTypes.func.isRequired,
  onDragOverDay: PropTypes.func.isRequired,
  onAddRoute: PropTypes.func.isRequired,
  /** The `+` ghost tab. Split turns it off; the drawer keeps it. */
  showAdd: PropTypes.bool,
};

DayTabRow.defaultProps = { runsheets: [], accepted: [], showAdd: true };

export default DayTabRow;
