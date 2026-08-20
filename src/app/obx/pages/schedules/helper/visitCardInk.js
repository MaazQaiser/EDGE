import { calendarShiftStatusEnum } from 'src/utils/constants/schedules';

/**
 * One visit card, drawn the same way wherever a visit appears.
 *
 * The week grid states these treatments in `calendar.styles.js` (`visitFill*`), and
 * the two Companies views each had a private `INK` object approximating them. The
 * copies drifted, as copies do: a missed visit was hatched red on the scheduler and
 * flat pink on the Companies tab, a not-started visit was amber there and grey here,
 * and a planner moving between the two tabs had to learn the same object twice.
 *
 * So the vocabulary lives here, once, and it follows the grid — the grid is where
 * these states were designed and where the legend and the drawer already agree with
 * them. The **structure** of a card is still each surface's own business: a day
 * column is 150px and a company row is 212px, and neither should have to pretend to
 * be the other. It is the meaning of a fill that has to be identical.
 *
 * **The wash is the only thing that marks a state, load-bearing.** The grid's
 * visit card used to also carry a left accent for the duty type and a status
 * badge; a later pass (`calendar.styles.js`, `visitFill*`) removed both — one
 * card-wide wash is the whole encoding now, with `borderLeft: none !important`
 * beating every duty accent class at the call site. This file used to carry a
 * matching `VISIT_CARD_ACCENT` for the Companies views' left border and hatch
 * the missed and cancelled fills instead of tinting them flat — both were the
 * grid's *older* design, and both views had quietly fallen out of step with the
 * grid's current one (no border, flat missed/cancelled) until this file was
 * brought back in line with it. Companies-view callers should not draw a left
 * border on `visitCard` any more; the wash alone is the fact.
 */

/**
 * The status treatments, keyed by the calendar's own status vocabulary.
 *
 * Returned as JSS-ready objects rather than bare colours: `completed` and
 * `cancelled` mute or strike their own text, and a caller handed only a background
 * would have to remember to do that — which is exactly how the copies drifted.
 *
 * Every hex here is the literal the grid's own `visitFill*` classes use
 * (`calendar.styles.js`) — copied rather than imported, for the same tenant-palette
 * reason that file states: `dutyBlueBg` resolves to green on Filter Go, so the
 * in-progress wash has to be stated outright rather than borrowed from theme. Keep
 * the two in sync by hand if either changes.
 */
export const visitCardFills = (theme) => ({
  [calendarShiftStatusEnum.NOT_STARTED]: { background: '#FFF7E1' },

  [calendarShiftStatusEnum.IN_PROGRESS]: { background: '#EFF8FF' },
  [calendarShiftStatusEnum.SHIFT_STARTED]: { background: '#EFF8FF' },

  /* Done, and the quietest card on screen: it needs no action, so it must not
     compete with the ones that do. */
  [calendarShiftStatusEnum.COMPLETED]: {
    background: theme.palette.surfaceSuccessSubtle,
    '& .MuiTypography-root': { color: `${theme.palette.textSecondary1} !important` },
  },

  /* Planned and did not happen. Flat red, matching `visitFillMissed` — the grid
     hatched this once; it does not any more, and a hatch here after that change
     would have been the one thing this card said that the grid's did not. */
  [calendarShiftStatusEnum.MISSED]: { background: '#FEE4E2' },

  /* Void, not absent — flat grey with a strike-through, matching `visitFillCancelled`.
     Same history as missed: hatched until the grid went flat. */
  [calendarShiftStatusEnum.CANCELLED]: {
    background: '#F6F7F9',
    '& .MuiTypography-root': {
      textDecoration: 'line-through',
      color: `${theme.palette.textSecondary3} !important`,
    },
  },

  /* Nothing has claimed it. Deliberately **not** tinted: the schedule does not tint
     a shift that has no officer either, so the red belongs on the badge and on the
     line that reads `Unassigned`, not on the whole card. No dashed accent either —
     the grid's visit card carries no border of any style any more, so a dashed one
     here would be a mark the grid's card cannot make. */
  [calendarShiftStatusEnum.UNASSIGNED]: {
    background: theme.palette.surfaceGreySubtle,
  },
});

/**
 * The four treatments a legend has to name, in the order a visit moves through them.
 *
 * Derived from the same map the cards use, so a legend can no longer describe a
 * colour the cards stopped drawing — which the feature's own note calls out as worse
 * than having no legend at all.
 */
export const visitCardLegend = (theme) => {
  const fills = visitCardFills(theme);

  return [
    {
      id: 'scheduled',
      labelKey: 'obx.schedules.calendar.companies.legendScheduled',
      style: fills[calendarShiftStatusEnum.NOT_STARTED],
    },
    {
      id: 'completed',
      labelKey: 'obx.schedules.calendar.companies.legendCompleted',
      style: { background: fills[calendarShiftStatusEnum.COMPLETED].background },
    },
    {
      id: 'missed',
      labelKey: 'obx.schedules.calendar.companies.legendMissed',
      style: { background: fills[calendarShiftStatusEnum.MISSED].background },
    },
    {
      id: 'unassigned',
      labelKey: 'obx.schedules.calendar.companies.legendUnassigned',
      style: { background: fills[calendarShiftStatusEnum.UNASSIGNED].background },
    },
  ];
};
