import { Box, Tooltip, Typography } from '@mui/material';
import classNames from 'classnames';
import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import React from 'react';
import { useTranslation } from 'react-i18next';

/**
 * A visit's need-by window, as one cell per day.
 *
 * **The only thing on a stop card that shows slack**, which is why it survives every
 * width test (N1 measured it at 54px and found it was never the risk). Everything else
 * on the card says where the visit *is*; this says how much room it had — and that is
 * what makes a move in ④ legible and what S4 is quietly protecting on the planner's
 * behalf.
 *
 * Four cell states, and they are deliberately not four colours of the same brightness:
 *
 *   **placed**  — brand green. Where this visit actually landed. One cell, ever.
 *   **due**     — dark grey. The contract's own date, so drift is visible: a green cell
 *                 three places from the grey one is three days of slack spent.
 *   **legal**   — mid grey. A day that could take it — worked, right zone, in window.
 *   **dead**    — pale. Inside the window, but nothing works that day or the zone is wrong.
 *
 * The dead cells are the point. A window showing one legal cell out of seven is the
 * whole explanation for why `Move day` is about to refuse, sitting on the card before
 * anyone clicks anything.
 */
const WindowStrip = ({ classes, visit, legalDays = [], placedDate }) => {
  const { t } = useTranslation();
  const tt = (key, options) => t(`obx.runsheet.harmonizeFlow.${key}`, options);

  const from = dayjs(visit.needByFrom);
  const span = dayjs(visit.needByTo).diff(from, 'day') + 1;
  const legal = new Set(legalDays);

  /* A window wider than a fortnight is legal (N tops out at 14, so 29 cells) but is not
     something 54px can draw honestly. Past a fortnight the strip stops pretending to be
     a calendar and the count beside it carries the meaning instead. */
  if (span > 15) {
    return (
      <Typography className={classes.stopMeta}>
        {tt('windowSpanDays', {
          days: tt('count.day', { count: span }),
          legal: tt('count.legalDay', { count: legalDays.length }),
        })}
      </Typography>
    );
  }

  const cells = Array.from({ length: span }, (_, i) => {
    const date = from.add(i, 'day').format('YYYY-MM-DD');
    return {
      date,
      isPlaced: date === placedDate,
      isDue: date === visit.dueDate,
      isLegal: legal.has(date),
    };
  });

  const label = tt('windowTooltip', {
    from: from.format('MMM D'),
    to: dayjs(visit.needByTo).format('MMM D'),
    due: dayjs(visit.dueDate).format('MMM D'),
    legal: legalDays.length,
  });

  return (
    <Tooltip title={label} placement="top" arrow>
      {/* Labelled as an image with its own description: the cells carry meaning that
          no amount of colour contrast conveys to a screen reader, and the tooltip
          string is already the sentence a sighted user gets on hover. */}
      <Box className={classes.windowStrip} role="img" aria-label={label} tabIndex={0}>
        {cells.map((cell) => (
          <Box
            key={cell.date}
            className={classNames(
              classes.windowCell,
              cell.isLegal && classes.windowCellLegal,
              cell.isDue && classes.windowCellDue,
              cell.isPlaced && classes.windowCellPlaced,
            )}
          />
        ))}
        {/* "only day" — stated in words, not left to be counted off the cells. It is
            the fact that makes an exit unavailable, and X1 reads it out loud. */}
        {legalDays.length === 1 && placedDate ? (
          <Typography component="span" className={classes.windowOnly}>
            {tt('onlyDay')}
          </Typography>
        ) : null}
      </Box>
    </Tooltip>
  );
};

WindowStrip.propTypes = {
  classes: PropTypes.object.isRequired,
  visit: PropTypes.object.isRequired,
  legalDays: PropTypes.arrayOf(PropTypes.string),
  placedDate: PropTypes.string,
};

export default WindowStrip;
