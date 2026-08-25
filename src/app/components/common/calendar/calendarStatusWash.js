import { calendarShiftStatusEnum } from 'src/utils/constants/schedules';

/**
 * **In progress is amber, on every tenant.**
 *
 * ## It was blue, and the swap is the design's, not a drift
 *
 * The paragraph this replaces argued that in-progress must be `#EFF8FF` blue and never
 * `surfaceBrandSubtle`, because that token is `#E5F6FF` on Signal and pale **green** on
 * Filter Go — so a live route rendered in the colour this product uses for a finished one.
 * **That argument is untouched.** It is an argument against washing a *status* with a
 * *brand* token, and `#FFF7E1` is a literal, so nothing about it follows branding.
 *
 * What changed is which literal, and it came with a card spec that moves the amber one slot:
 * not-started goes to plain grey, in-progress takes the amber, completed keeps its green.
 * That is a progression a planner can read without a key — nothing yet, under way, done —
 * where blue-for-live sat outside the sequence and had to be learned. Amber for *in flight*
 * is also what the status icon on the same card has always been (`#F4780B`), so the wash and
 * the badge now agree instead of the card carrying two colours for one state.
 *
 * ## Still one value for three surfaces
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
export const IN_PROGRESS_WASH = '#FFF7E1';

/**
 * **Nothing has happened here yet.**
 *
 * Plain grey, and it is the fill this shell already falls through to for the statuses that
 * take no wash at all (missed, unassigned, cancelled) — which is the right company for it:
 * a not-started shift has the same amount to report as they do. It held the amber until the
 * card spec moved that to in-progress, and amber was always overstating it, because a card
 * the colour of a warning is a card asking to be looked at.
 */
export const NOT_STARTED_WASH = '#F5F5F6';

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

/** The same shape for not-started — see `NOT_STARTED_WASH`. */
export const statusFillNotStartedRule = {
  backgroundColor: `${NOT_STARTED_WASH} !important`,
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
/**
 * **The three washes, as a progression: grey, amber, green.**
 *
 * `NOT_STARTED` used to take `dutyYellowBg` (the amber) and `IN_PROGRESS` a blue. Both moved
 * with the card spec — see `IN_PROGRESS_WASH`. The two `statusFill*` classes are named for
 * the state rather than the colour, which is what the `duty*Bg` names got wrong: `dutyYellowBg`
 * is still a perfectly good amber and is still referenced, but a *status* pointing at a class
 * called "yellow" is how a palette rename silently becomes a semantics change.
 */
export const EVENT_BG_COLOR_CLASSES = {
  [calendarShiftStatusEnum.NOT_STARTED]: 'statusFillNotStarted',
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
