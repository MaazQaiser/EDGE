import { Box, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import { memo } from 'react';
import {
  resolveVisitState,
  VISIT_STATE_STATUS,
} from 'src/app/obx/pages/schedules/helper/visitState';
import { calendarShiftStatusEnum } from 'src/utils/constants/schedules';

/**
 * The contents of one month-grid chip: `Company · Site`, plus the unassigned mark
 * when nothing has routed the visit.
 *
 * Only the *contents*, following the same division this feature's other cards keep
 * (`VisitCardContent`, `VisitCardContentV2`, `LegacyCalendarCardContent`): the shell
 * `<Box>`, its status wash and the tooltip that wraps it belong to the call site in
 * `ScheduleCalendarGrid.jsx`. The shell is also the element MUI's `Tooltip` clones a
 * ref onto, so it has to stay a `Box` there rather than move in here.
 *
 * Extracted from that call site so this mark is *renderable* — `ScheduleCalendarGrid`
 * imports FullCalendar, which jest cannot parse, so nothing inside it can be asserted
 * on. See `visitMonthChip.render.test.js`.
 *
 * ── Company · site ──
 *
 * This is the company grouping, and the month is its only view with **no company
 * row** — so the customer is the one fact the grid would otherwise never state, and
 * with several customers' chips sharing a cell it is also what tells two chips apart
 * (D27). Company leads in the subject's dark ink, the site qualifies it in the
 * quieter grey the week card's route line takes, and the dot is its own element so a
 * visit whose company did not resolve draws no leading separator. Both truncate; the
 * hover card carries them in full.
 *
 * ── The unassigned mark ──
 *
 * A chip's fill is the whole state signal here — except for the one state that has
 * no fill. `visitFillUnrouted` is `surfaceGreySubtle`, deliberately untinted
 * (*"unassigned is not a status the schedule tints"*), so on the month grid a visit
 * nobody has routed is a plain grey chip: indistinguishable from a chip whose status
 * simply has no wash. The week grid does not have that problem, because its card
 * carries the status badge as well. So the month chip takes the badge too, for that
 * state alone.
 *
 * **The same icon, and the same test for it, as every other surface.** The glyph is
 * whatever `calendarIndicatorIcons` gives the resolved status — passed in as
 * `statusIcon` by the caller's `getVisitStatusValues`, which is the single resolver
 * the week card, the day card and this chip's own tooltip all read their badge from.
 * The test below it is the same resolution: status `UNASSIGNED`, out of
 * `VISIT_STATE_STATUS[resolveVisitState(shift)]`. So the mark drawn here is the
 * unassigned badge exactly when the week card's badge is the unassigned badge, and
 * there is no second glyph and no second predicate to drift.
 *
 * That resolution — rather than a bare `!runsheetName` — is also what makes this
 * agree with the rest of the feature about what "not on a route" *means*:
 * `BLOCKED_NO_TOUR` is unrouted too (a visit with no tour has no defined work, so no
 * route can take it — it sits in the same pinned band, and D6 counts it there), and a
 * past unrouted visit stays unrouted rather than becoming missed (D11). Both fall out
 * of asking `resolveVisitState` instead of asking the record.
 *
 * `aria-hidden`, because it is not new information to a screen reader: the event's
 * own `aria-label` already speaks the resolved state
 * (`buildEventAccessibleName`) — and that is now the *only* place the state is put
 * into words on this grid, since the hover card's status row has been removed for
 * restating the card it covers. Sighted readers get the glyph and the footer legend
 * that names it (D28). Nothing here should acquire a `title` of its own: the chip is
 * already inside a `Tooltip`, and a second one on a 14px mark inside it is a
 * hover-card fight, not a label.
 */
const VisitMonthChipContent = memo(({ classes, shift, company, site, statusIcon }) => {
  const isUnrouted =
    VISIT_STATE_STATUS[resolveVisitState(shift)] === calendarShiftStatusEnum.UNASSIGNED;

  return (
    <>
      {company ? (
        <Typography component="span" className={classes.visitMonthChipCompany}>
          {company}
        </Typography>
      ) : null}
      {/* Only when there is something on both sides of it — a visit whose company
          did not resolve must not draw a leading dot. */}
      {company && site ? (
        <Typography component="span" className={classes.visitMonthChipSeparator} aria-hidden="true">
          ·
        </Typography>
      ) : null}
      {site ? (
        <Typography component="span" className={classes.visitMonthChipSite}>
          {site}
        </Typography>
      ) : null}
      {isUnrouted && statusIcon ? (
        <Box component="span" className={classes.visitStatusIcon} aria-hidden="true">
          {statusIcon}
        </Box>
      ) : null}
    </>
  );
});

VisitMonthChipContent.displayName = 'VisitMonthChipContent';
VisitMonthChipContent.propTypes = {
  /** The `useStyles` sheet from the call site — the shell owns the stylesheet. */
  classes: PropTypes.object.isRequired,
  shift: PropTypes.object,
  company: PropTypes.string,
  site: PropTypes.string,
  /** The resolved status badge, from the caller's `getVisitStatusValues`. */
  statusIcon: PropTypes.node,
};

export default VisitMonthChipContent;
