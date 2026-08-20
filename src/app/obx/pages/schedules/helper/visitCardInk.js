import { IN_PROGRESS_WASH } from 'src/app/components/common/calendar/calendarStatusWash';
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
 * (`calendar.styles.js`) — stated outright rather than borrowed from theme, for the
 * tenant-palette reason that file gives: `surfaceBrandSubtle` is pale green on Filter
 * Go, so a status washed with the brand told a planner a live route was finished.
 *
 * In progress no longer needs keeping in sync by hand: it is *imported* from
 * `calendarStatusWash.js`, which the grid's two in-progress classes read as well, so
 * the three surfaces state one blue between them. The remaining hexes here are still
 * hand-matched copies.
 */
/**
 * **The untinted chip** — one treatment, two meanings, told apart by a mark.
 *
 * Two states on the Companies views have no colour to spend. `UNASSIGNED` is
 * deliberately untinted (the reasoning is on its entry below), and *upcoming* —
 * scheduled, but not due today — is untinted because there is nothing to flag about
 * ordinary future work, which on a twelve-month view is most of the screen.
 *
 * They were briefly given two different fills so they could be told apart: grey for
 * unassigned, **white** for upcoming. That was asked to change, and this is the one
 * definition both now take, so they are the same treatment **by construction**
 * rather than by two stylesheets agreeing to be similar. What separates them is not
 * a colour at all — it is the unassigned mark, the same glyph and the same predicate
 * the calendar's month chip uses for exactly this problem (`VisitMonthChipContent`:
 * *"a chip's fill is the whole state signal here — except for the one state that has
 * no fill"*). One vocabulary across the two surfaces, and no second neutral for a
 * reader to have to discriminate on a 132px chip.
 *
 * **The hairline is load-bearing, and it is an inset shadow rather than a border.**
 * `surfaceGreySubtle` is also the year matrix's own row-hover fill
 * (`bodyRow`'s `&:hover`), so without an edge every quiet chip in a row *vanished*
 * under the pointer — the one moment a planner is definitely looking at it. An inset
 * shadow paints inside the box and costs no layout, where a real border would spend a
 * pixel of the card's shared `padding: 3px 8px` and sit these two variants a hair
 * smaller than their filled neighbours. The "no border of any style" rule in this
 * file's header is about *duty accents on filled cards*; this is the unfilled case it
 * never had to describe.
 */
export const visitCardQuietChip = (theme) => ({
  background: theme.palette.surfaceGreySubtle,
  boxShadow: `inset 0 0 0 1px ${theme.palette.borderSubtle1}`,
});

export const visitCardFills = (theme) => ({
  [calendarShiftStatusEnum.NOT_STARTED]: { background: '#FFF7E1' },

  [calendarShiftStatusEnum.IN_PROGRESS]: { background: IN_PROGRESS_WASH },
  [calendarShiftStatusEnum.SHIFT_STARTED]: { background: IN_PROGRESS_WASH },

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
     here would be a mark the grid's card cannot make.

     It is `visitCardQuietChip` rather than a bare background, and that is the whole
     resolution of a collision: *upcoming* is now this same grey, so the fill can no
     longer be what tells "no route" from "nothing to report". The mark is — see the
     note on that export. Sharing the treatment is deliberate; the two must not drift
     into two neutrals nobody can separate at chip size. */
  [calendarShiftStatusEnum.UNASSIGNED]: visitCardQuietChip(theme),
});

/**
 * The treatments a legend has to name, in the order a visit moves through them.
 *
 * Derived from the same map the cards use, so a legend can no longer describe a
 * colour the cards stopped drawing — which the feature's own note calls out as worse
 * than having no legend at all. It said "the four treatments" while the map above
 * defined six, and an audit found the two it omitted were both reachable: a card
 * could go blue or struck-through with nothing underneath explaining either.
 *
 * It is **six** now, and the list changed shape rather than just growing:
 *
 * - **Upcoming** and **Due today** split what used to be one yellow `Scheduled` row.
 *   Yellow is now spent only on the day a visit is due (`visitCardClassFor`); the
 *   ordinary future work that made up most of a twelve-month view is unfilled, and
 *   an unfilled card still needs naming or the quietest thing on screen is the one
 *   thing the key does not admit to.
 * - **In progress** is here because the card can draw it — `visitCardLive` is mapped
 *   on both Companies views — and that is the standard this list is held to, the same
 *   one D28 states for the scheduler's own legend: name the vocabulary, not whatever
 *   the current payload happens to contain. Worth knowing that the demo book will not
 *   show you one here: `buildCompanyVisitMatrix` generates its own month-grained dates
 *   and never consults the forced-visit anchor, so the in-progress visit that now
 *   exists on the week grid has no equivalent on this surface. The entry is honest
 *   about the card, not about the mock.
 * - **Cancelled** is deliberately absent, and this is the one place that absence is
 *   correct rather than an omission: cancelled visits are not drawn at all unless the
 *   status filter asks for them, so naming the fill would describe a card the view
 *   never shows. This is also why the *scheduler's* footer legend dropped it.
 *
 * **Two entries share a swatch, and one of them therefore carries a `markStatus`.**
 * `Upcoming` and `No route` are the same grey — see `visitCardQuietChip` — so a key
 * of six colours would be a key of five colours and a repeat, describing a
 * distinction the cards do not make with colour. `markStatus` names the status whose
 * badge from `calendarIndicatorIcons` the card actually draws, and the two views
 * render it beside that entry's swatch. That is the same standard this list is
 * already held to, applied to a mark instead of a fill: **name what the card draws.**
 * Every other entry has no `markStatus` because its card carries no glyph.
 *
 * The glyph is named here rather than imported here on purpose — this is a plain
 * helper with no JSX, and the icon registry lives in a component module. The views
 * resolve the status to an element; this file decides *which* status, which is the
 * half that has to agree with the card.
 */
export const visitCardLegend = (theme) => {
  const fills = visitCardFills(theme);

  return [
    {
      id: 'upcoming',
      labelKey: 'obx.schedules.calendar.companies.legendUpcoming',
      /* Not from `fills` — there is no such status. The untinted chip is a *date*
         reading, not a state one; see `visitCardClassFor`. Same grey as `No route`
         below, and from the same definition, because that is what the cards do. */
      style: { background: visitCardQuietChip(theme).background },
    },
    {
      id: 'dueToday',
      labelKey: 'obx.schedules.calendar.companies.legendDueToday',
      style: { background: fills[calendarShiftStatusEnum.NOT_STARTED].background },
    },
    {
      id: 'inProgress',
      labelKey: 'obx.schedules.calendar.companies.legendInProgress',
      style: { background: fills[calendarShiftStatusEnum.IN_PROGRESS].background },
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
