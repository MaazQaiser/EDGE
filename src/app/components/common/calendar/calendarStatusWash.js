import { calendarShiftStatusEnum } from 'src/utils/constants/schedules';

/**
 * **In progress is blue, on every tenant.**
 *
 * The one value, stated once, for the three places that draw an in-progress card:
 * the shift/V2 card's wash (`statusFillInProgress` in `calendar.styles.js`, reached
 * through `EVENT_BG_COLOR_CLASSES` below), the visit card's wash
 * (`visitFillInProgress` in the same sheet), and the Companies views
 * (`visitCardFills` in `helper/visitCardInk.js`). All three carried this hex
 * independently and were kept in step by hand; they now read it from here, so the
 * next change cannot move one and leave two behind.
 *
 * It is a literal and not `theme.palette.surfaceBrandSubtle` for the reason
 * `calendar.styles.js` states at length and `visitCardInk.js` repeats: the brand
 * token is `#E5F6FF` (blue) on Signal and `#E8F7ED` (pale **green**) on Filter Go, so
 * a wash borrowed from the brand told a Filter Go planner that a live route was
 * finished. This wash means a state, not a company, so it does not follow branding.
 */
export const IN_PROGRESS_WASH = '#EFF8FF';

/**
 * **The card's left accent, blue on every tenant.**
 *
 * `dutyBlue` — the accent a patrol shift and a visit card carry — was
 * `theme.palette.borderBrand`, and that token is `#146DFF` on Signal and a **green** on
 * Filter Go. So the one line on the card that is supposed to say *what kind of work this
 * is* said something different per tenant, and on Filter Go it said green: the colour this
 * product uses for a completed dedicated shift. Asked for directly, against the route and
 * visit views: make that line brand blue.
 *
 * Same argument as the wash above, one field over: an accent that names a *duty type* is
 * not branding, so it does not follow the brand. `dutyGreen` and the rest are already
 * literals-by-semantics (success, alert, warning) and are left alone — green there means
 * dedicated, and it means it on both tenants.
 */
export const DUTY_ACCENT_BLUE = '#146DFF';

/**
 * The declaration itself, exported so the emitted rule can be asserted on.
 *
 * `calendar.styles.js` cannot be imported from a test — it reaches FullCalendar's
 * protected styles, which jest's transform will not parse — so a rule defined inline
 * there is unprovable. Defined here it is the *same object* production uses, and a
 * test can run it through `ServerStyleSheets` and read the CSS that comes out. See
 * `calendarStatusWash.emittedCss.test.js`.
 *
 * `backgroundColor` and `!important` mirror the `duty*Bg` classes this replaces for
 * in-progress: the card shell sets a background unconditionally, so a status wash
 * that does not shout is simply not applied.
 */
export const statusFillInProgressRule = {
  backgroundColor: `${IN_PROGRESS_WASH} !important`,
};

/**
 * The visit card's own in-progress fill — same wash, and additionally suppressing
 * the duty accent, because on a visit card the wash is the whole state signal and
 * the left border was retired with the badge.
 */
export const visitFillInProgressRule = {
  background: `${IN_PROGRESS_WASH} !important`,
  borderLeft: 'none !important',
};

/**
 * A shift card's wash, by status — the site scheduler's palette, which the V2 visit
 * card deliberately shares (see `getVisitLegacyBgClass`).
 *
 * In progress used to map to `dutyBlueBg`, and that is the bug this fixes: the class
 * is named for a colour but defined as `surfaceBrandSubtle`, so on Filter Go an
 * in-progress card rendered pale green while the status *badge* on the same card
 * rendered semantic blue — one card saying one state in two colours. Only three
 * statuses take a wash; the rest fall through to the shell's plain grey and are told
 * apart by that badge.
 *
 * Lives here rather than in `ScheduleCalendarGrid.jsx` so the mapping can be
 * asserted: that file imports FullCalendar and nothing inside it is reachable from a
 * test.
 */
export const EVENT_BG_COLOR_CLASSES = {
  [calendarShiftStatusEnum.NOT_STARTED]: 'dutyYellowBg',
  [calendarShiftStatusEnum.IN_PROGRESS]: 'statusFillInProgress',
  [calendarShiftStatusEnum.COMPLETED]: 'dutyGreenBg',
};

/**
 * The wash a **visit** card takes — `EVENT_BG_COLOR_CLASSES`, with one date rule.
 *
 * **Yellow only on the day the visit is due.** `NOT_STARTED` used to take the yellow
 * wash on every date, so a week grid showed Friday's ordinary future work in the
 * colour that means *this is live now*, and a twelve-month view showed almost nothing
 * else. A colour that marks everything marks nothing. On any other day a not-started
 * visit falls through to no wash at all, which is not a new treatment: only three
 * statuses take a wash here, so missed, unassigned and cancelled already render as the
 * shell's plain grey and are told apart by their badge. Not-started-elsewhere simply
 * joins them.
 *
 * The same rule already governs the Companies views
 * (`schedules/companies/visitCardClass.js`), so the two surfaces agree about what
 * "scheduled, but not today" looks like — that file's `visitCardUpcoming` grey is this
 * shell's grey.
 *
 * Takes `isToday` as a **boolean** rather than a date, deliberately: "today" has to be
 * the grid's own notion — its day columns are placed with the franchise offset, and a
 * card sitting in the highlighted today column must not be told it is not today by a
 * second clock. The caller owns that comparison (it is the module that already has the
 * offset helper); this stays pure and therefore testable.
 *
 * Only the visit path calls this. Shift cards on the dedicated and patrol tabs keep
 * reading `EVENT_BG_COLOR_CLASSES` directly — a shift is not a visit, and nobody has
 * asked for that rule there.
 */
export const visitWashClassFor = (status, isToday) => {
  if (status === calendarShiftStatusEnum.NOT_STARTED && !isToday) return undefined;
  return EVENT_BG_COLOR_CLASSES[status];
};
