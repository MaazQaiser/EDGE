import { Box, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import { memo } from 'react';
import { ReactComponent as RunsheetHitsIcon } from 'src/assets/svg/hits-runsheet.svg';

/**
 * The contents of one month-grid **route** chip: the route, and how many visits its
 * run that day is carrying.
 *
 * Only the *contents* — the shell `<Box>` and its status wash belong to the call site
 * in `ScheduleCalendarGrid.jsx`, the same division `VisitMonthChipContent`,
 * `VisitCardContentV2` and `PatrolCardBody` all keep. Extracted for the same reason
 * they were: that file imports FullCalendar, which jest's transform cannot parse, so
 * nothing rendered inside it can be asserted on. `classes` is a prop for the same
 * reason again — `calendar.styles.js` reaches FullCalendar's protected styles and is
 * equally out of reach from a test. See `routeMonthChip.render.test.js`.
 *
 * ── What survives a cell one seventh of the grid wide ──
 *
 * The week's route card is four lines: the run's window, the officer, the visit count
 * with the corner marks, and the route in its row label. A month cell measures about
 * 147px and stacks up to three of these, so it keeps the pair that was asked for —
 * **the route's name, and that route's count** — and drops the rest:
 *
 * - **The route name is promoted onto the chip.** In the week it is the *row* label,
 *   inherited by position; the month has no rows, so it is the one fact the grid
 *   would otherwise never state, and with several routes' chips sharing a cell it is
 *   also what tells two chips apart. Exactly the argument D27 makes for the visit
 *   chip naming its customer.
 * - **The window and the officer come off.** Both are facts about the run rather than
 *   about which run this is, and both are one click away in the drawer this chip
 *   opens. The window is also the least useful of the three at this width — the day
 *   cell already says which day, and a route's start hour rarely moves.
 * - **The notes and split marks come off.** They are the two marks the week card
 *   carries *in addition* to its status badge, and a 14px glyph that is absent on
 *   most cards cannot be read as a column; the drawer states both.
 *
 * ── The count is the week card's count, not a second one ──
 *
 * Same figure, same glyph, same classes (`patrolVisitCount*`) and the same number: it is
 * `getRouteVisitCount` over `buildRouteVisitCounts`, resolved by the caller's
 * `routeVisitCountProps` — the one expression the week card is fed from. There is no month
 * derivation of this fact to drift from the week's.
 *
 * **The count no longer carries a native `title`.** It had one, and it was the only thing on
 * this chip that said the noun — which was the problem reported: the chip shows a route's
 * name and a bare numeral, and nothing said that the card *is* a route or that the number
 * counts *visits*, unless you rested on the 14px glyph long enough for the OS tooltip. That
 * answer now comes from `RouteMonthChipTooltip`, which covers the whole chip and says both
 * facts. The native attribute is removed rather than left alongside it: MUI's tooltip and the
 * browser's would both fire, one over the other, saying nearly the same sentence — the exact
 * duplication `FieldLabel` documents avoiding by refusing `describeChild`.
 *
 * Quiet by construction, per **D29**. The count on every route in every day cell is a
 * lot of new figures on one screen, so each is the week card's own treatment and
 * nothing louder: an 11px/700 tabular numeral beside `hits-runsheet.svg`'s native
 * muted `#6A6A70`, no pill, no colour, and no noun. The single red count this chrome
 * allows itself is still the header's assignment pill.
 *
 * `null`/`undefined` draws nothing at all, which is a different statement from `0` —
 * see `buildRouteVisitCounts`, which decides that once for the whole window.
 *
 * ── The status mark ──
 *
 * The wash is the shell's and comes from `EVENT_BG_COLOR_CLASSES`, but only three
 * statuses take one: unassigned, missed and cancelled runs all fall through to the
 * shell's plain grey and are told apart by their badge. So the badge comes too, on
 * every chip rather than on the untinted ones alone — the week's route card carries
 * it unconditionally, and "a route reads the same in both views" is the whole ask.
 * (`VisitMonthChipContent` draws its mark for one state only because a *visit's*
 * unrouted fill is deliberately untinted while every other visit state has a fill;
 * a shift has three states with no fill, so a state-dependent rule here would be a
 * second predicate to keep in step for no gain.)
 *
 * `aria-hidden`, and with no tooltip of its own: the event's own `aria-label`
 * (`buildEventAccessibleName`) already speaks the resolved status, and the footer
 * legend names the glyphs for sighted readers (D28). A hover target on a 14px mark
 * inside a chip that is already one of three in a cell buys nothing the legend and
 * the drawer do not already give.
 */
/**
 * The route's display name, exported because two things need it and they must agree.
 *
 * `runsheetName` first, `name` second — the same order `PatrolCardBody` uses. On a mapped
 * grid card the two are usually both filled (`mapShiftToCalendarEvent` falls the route back
 * to the row's own title), and the route is the subject here while `name` is the run's
 * window label.
 *
 * The chip prints it and the chip's tooltip leads with it. Recomputing it at the call site
 * would be a second definition of "what is this route called", free to drift from this one.
 */
export const routeNameOf = (shift) => shift?.runsheetName || shift?.name || '';

const RouteMonthChipContent = memo(({ classes, shift, statusIcon, visitCount = null }) => {
  const routeName = routeNameOf(shift);

  /* `!= null` and not a truthiness test: `0` is a count this window can honestly
       report — a run with nothing on it — and it is a reading a planner wants. Only
       "no visit list for this window" hides the number. */
  const hasVisitCount = visitCount != null;

  return (
    <>
      <Typography component="span" className={classes.routeMonthChipName}>
        {routeName}
      </Typography>
      <Box component="span" className={classes.routeMonthChipMeta}>
        {hasVisitCount ? (
          <Box className={classes.patrolVisitCount}>
            <Box className={classes.patrolVisitCountIcon}>
              <RunsheetHitsIcon />
            </Box>
            <Typography component="span" className={classes.patrolVisitCountValue}>
              {visitCount}
            </Typography>
          </Box>
        ) : null}
        {statusIcon ? (
          <Box component="span" className={classes.visitStatusIcon} aria-hidden="true">
            {statusIcon}
          </Box>
        ) : null}
      </Box>
    </>
  );
});

RouteMonthChipContent.displayName = 'RouteMonthChipContent';
RouteMonthChipContent.propTypes = {
  /** The `useStyles` sheet from the call site — the shell owns the stylesheet. */
  classes: PropTypes.object.isRequired,
  shift: PropTypes.object,
  /** The resolved status badge, from the caller's `getValuesWrtStatuses`. */
  statusIcon: PropTypes.node,
  /**
   * Visits on this run. `null` means the window has no count to give, not zero —
   * `buildRouteVisitCounts` decides that once, above every chip.
   */
  visitCount: PropTypes.number,
};

export default RouteMonthChipContent;
