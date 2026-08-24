import { Box, Menu, MenuItem, Tooltip, Typography } from '@mui/material';
import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { formatCompact } from '../model/durations';
import { MoveIcon } from './Glyphs';

/**
 * Move this stop to another day — **a menu, not the start of a drag.**
 *
 * ## What this replaces, and why the old one read as broken
 *
 * The button was here already and it called `onStartMove`, which put the run into a
 * *drag-in-flight* state and waited for the planner to then click a day tab. That is a
 * coherent design — `DayTabs` prices and refuses a click exactly as it would a drop, so it
 * is the drag's two halves with the pointer released in between — but as a **button** it
 * behaved like nothing else in the product: pressing it appeared to do nothing. No menu, no
 * dialog, no obvious change; the affordance the press actually armed was thirty pixels above
 * and easy to miss. Reported as "the icon does not open the day drop-down", which is exactly
 * what a reader would conclude.
 *
 * So the button now opens the list of days directly. The drag path is untouched and still
 * the primary gesture; `onStartMove` is still wired to the grip and to the keyboard.
 *
 * ## Every other day in the run, each with its price
 *
 * The list is every worked day except the one the stop is on. It is not filtered by zone or
 * by need-by window: dropping is unrestricted now (see `droppableDatesFor`), so a filtered
 * menu would be offering fewer destinations than a drag would accept — the two paths have
 * to agree or one of them is lying about the rules.
 *
 * Each row carries what the move would **cost that day**, quoted through the same
 * `priceMove` the drag quotes with, so the number in the menu is the number the card shows
 * afterwards. `+1h 30m` reads as "this day gets that much heavier", which is the thing a
 * planner is choosing between. A day that would go over its shift says so on the row rather
 * than only after the fact — that is the one warning the unrestricted drop rules took away,
 * given back at the point of decision.
 *
 * The quotes are computed **when the menu opens**, not per render: there are at most a
 * handful of days and `priceMove` rebuilds two runsheets per call, which is far too much to
 * do for every stop of every route on every keystroke elsewhere in the drawer.
 */
const StopMoveMenu = ({ classes, visitId, site, currentDate, days, onQuote, onMove }) => {
  const { t } = useTranslation();
  const tt = (key, options) => t(`obx.runsheet.harmonizeFlow.${key}`, options);

  const [anchor, setAnchor] = useState(null);

  /* Only while open — see the note above. `days` is already filtered to the run's worked
     days by the caller; this drops the day the stop is already on, which `priceMove` would
     refuse as `alreadyHere` anyway. Offering it and then refusing it is the pattern this
     component exists to stop repeating. */
  const options = anchor
    ? days
        .filter((day) => day.date !== currentDate)
        .map((day) => ({ day, quote: onQuote(visitId, day.date) }))
        .filter(({ quote }) => quote?.legal)
    : [];

  const label = tt('moveVisit', { site });

  return (
    <>
      <Tooltip arrow title={label}>
        <Box
          component="button"
          type="button"
          /* `data-move` is what `stopHoverRow` keys its reveal-on-hover rule off. It stays
             on the trigger, so the button still only appears when the row is hovered. */
          data-move="true"
          className={classes.stopMoveButton}
          aria-label={label}
          aria-haspopup="menu"
          aria-expanded={Boolean(anchor)}
          onClick={(event) => setAnchor(event.currentTarget)}
        >
          <MoveIcon size={18} />
        </Box>
      </Tooltip>

      <Menu
        open={Boolean(anchor)}
        anchorEl={anchor}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        MenuListProps={{ dense: true, 'aria-label': label }}
      >
        {/* A menu with nothing in it is still worth opening — it answers the question the
            press asked. One worked day in the run means there is nowhere to move to, and
            saying so is better than a button that opens an empty box. */}
        {options.length ? (
          options.map(({ day, quote }) => {
            const overAfter = quote.target.after.durationMins > day.shiftMins;
            return (
              <MenuItem
                key={day.date}
                onClick={() => {
                  onMove(visitId, day.date);
                  setAnchor(null);
                }}
              >
                <Box className={classes.moveMenuRow}>
                  <Typography className={classes.moveMenuDay}>
                    {dayjs(day.date).format('ddd D MMM')}
                  </Typography>
                  <Typography
                    className={overAfter ? classes.moveMenuCostOver : classes.moveMenuCost}
                  >
                    {tt('overBy', { amount: formatCompact(quote.target.deltaMins) })}
                  </Typography>
                </Box>
              </MenuItem>
            );
          })
        ) : (
          <MenuItem disabled>
            <Typography className={classes.moveMenuEmpty}>{tt('moveNowhere')}</Typography>
          </MenuItem>
        )}
      </Menu>
    </>
  );
};

StopMoveMenu.propTypes = {
  classes: PropTypes.object.isRequired,
  visitId: PropTypes.string.isRequired,
  /** The site's name, for the button's label and tooltip. */
  site: PropTypes.string,
  /** The date the stop is on now — excluded from the list. */
  currentDate: PropTypes.string.isRequired,
  /** The run's worked days, `{ date, shiftMins, … }`. */
  days: PropTypes.array.isRequired,
  /** `(visitId, date) => priceMove verdict` — called only while the menu is open. */
  onQuote: PropTypes.func.isRequired,
  onMove: PropTypes.func.isRequired,
};

export default StopMoveMenu;
