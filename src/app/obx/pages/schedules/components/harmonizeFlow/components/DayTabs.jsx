import { Box, Typography } from '@mui/material';
import classNames from 'classnames';
import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { TRAY } from '../useHarmonizeFlow';

/**
 * The days, as the application draws tabs.
 *
 * ## What this replaced, and what survived the swap
 *
 * This was a strip of bordered cards, one per day, each carrying a duration, a shift, a
 * capacity meter and a word — B2's "pinned capacity strip". It was doing two jobs at
 * once (comparison *and* drop target) and it looked like nothing else in the product: a
 * row of four boxed mini-dashboards inside a drawer over a page whose own tabs are plain
 * underlined labels.
 *
 * So the **chrome** is now the app's: 14px/500 in `textPlaceholder`, `4px 4px 12px`, the
 * selected tab in `textBrand` over a 2px `borderBrand` rule — copied by value from
 * `customTabsWithPermissions`, which is the same treatment the schedule page behind this
 * drawer is already drawing.
 *
 * The two jobs survived the move:
 *
 * - **Comparison.** The meters went into the route card, where the route they measure
 *   is. What a tab row *can* carry is a mark, so a day that finishes past its shift gets
 *   an amber dot — enough to answer "which day is the problem" from the tab row, without
 *   pretending a 90px label can hold a bar.
 * - **Drop target.** Unchanged. A tab still accepts a drop, still prices it before
 *   release, and still refuses with a reason — the verdict now shows as the tab's own
 *   colour plus the sentence in the decision box, which has room for it.
 */
const DayTabs = ({
  classes,
  runsheets,
  unplaced,
  openDay,
  onOpenDay,
  accepted,
  drag,
  quotesForDrag,
  onDropOn,
  onDragOverDay,
}) => {
  const { t } = useTranslation();
  const tt = (key, options) => t(`obx.runsheet.harmonizeFlow.${key}`, options);

  /**
   * Whether the row has more tabs than fit.
   *
   * The scrollbar is hidden — 4px of chrome on a 36px row — so without a cue the trailing
   * tabs read as absent rather than off-screen. Five worked days plus the tray is about
   * the limit of 475px, and Mon–Fri is an ordinary answer from Settings. Measured rather
   * than assumed from a day count, because the labels are dates and their widths vary.
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
  }, [runsheets.length]);

  return (
    <Box
      ref={rowRef}
      className={classNames(classes.tabRow, overflows && classes.tabRowScrollable)}
      role="tablist"
      aria-label={tt('stripLabel')}
    >
      {runsheets.map((sheet) => {
        const quote = drag?.visitId ? quotesForDrag[sheet.date] : null;
        const isAccepted = accepted.includes(sheet.date);

        return (
          <Box
            component="button"
            type="button"
            key={sheet.date}
            role="tab"
            id={`harmonize-tab-${sheet.date}`}
            aria-controls="harmonize-panel"
            aria-selected={openDay === sheet.date}
            aria-label={
              quote
                ? tt(quote.legal ? 'a11yDropLegal' : 'a11yDropRefused', {
                    day: dayjs(sheet.date).format('ddd D'),
                    reason: tt(`refuse.${quote.reason}`),
                  })
                : undefined
            }
            className={classNames(
              classes.tab,
              openDay === sheet.date && classes.tabSelected,
              quote?.legal && classes.tabDropLegal,
              quote && !quote.legal && classes.tabDropRefused,
            )}
            onClick={() => {
              /* While a move is in flight a tab is a *destination*, not a filter. This is
                 what gives `Move day` and the keyboard path somewhere to land: a drag
                 completes on drop, but a move started from the decision box has no
                 pointer to release. Clicking a refused tab shows the refusal rather than
                 doing nothing silently. */
              if (drag?.visitId) {
                if (quote?.legal) onDropOn(sheet.date);
                else onDragOverDay(sheet.date);
                return;
              }
              onOpenDay(sheet.date);
            }}
            onDragOver={(e) => {
              /* Prevented even for a refused target, so the refusal can be *reported* on
                 hover rather than expressed as a dead zone the pointer slides over. */
              e.preventDefault();
              onDragOverDay(sheet.date);
            }}
            onDrop={(e) => {
              e.preventDefault();
              onDropOn(sheet.date);
            }}
          >
            {dayjs(sheet.date).format('ddd D')}
            {sheet.overrunMins > 0 ? (
              <Box
                className={classNames(classes.tabDot, isAccepted && classes.tabDotSettled)}
                aria-hidden="true"
              />
            ) : null}
          </Box>
        );
      })}

      {/* The tray is a peer, not a footnote — it is where work goes when no day can take
          it, and burying it under a disclosure would make the commonest failure the
          hardest thing on the screen to find. */}
      <Box
        component="button"
        type="button"
        role="tab"
        id={`harmonize-tab-${TRAY}`}
        aria-controls="harmonize-panel"
        aria-selected={openDay === TRAY}
        className={classNames(classes.tab, openDay === TRAY && classes.tabSelected)}
        onClick={() => onOpenDay(TRAY)}
      >
        {tt('notPlaced')}
        {unplaced.length ? (
          <Typography component="span" className={classes.tabCount}>
            {unplaced.length}
          </Typography>
        ) : null}
      </Box>
    </Box>
  );
};

DayTabs.propTypes = {
  classes: PropTypes.object.isRequired,
  runsheets: PropTypes.array.isRequired,
  unplaced: PropTypes.array.isRequired,
  openDay: PropTypes.string,
  onOpenDay: PropTypes.func.isRequired,
  accepted: PropTypes.arrayOf(PropTypes.string).isRequired,
  drag: PropTypes.object,
  quotesForDrag: PropTypes.object,
  onDropOn: PropTypes.func.isRequired,
  onDragOverDay: PropTypes.func.isRequired,
};

export default DayTabs;
