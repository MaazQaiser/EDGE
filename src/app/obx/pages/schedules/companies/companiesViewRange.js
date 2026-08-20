import dayjs from 'dayjs';

/**
 * The four grains the Companies tab can be read at, and every piece of date
 * arithmetic that has to follow whichever one is active.
 *
 * The tab used to be year-only, so its window was a constant and its stepper had
 * exactly one unit to move in. With Day/Week/Month beside Year the window *is* the
 * view — a Week view showing a year is not a Week view — and four separate
 * questions have to be answered per grain: what window does it open on, what does
 * a step do, what does the pill say, and is that window the current one. Those
 * four answers have to agree with each other or the pill ends up naming a range
 * the arrows do not step through, so they live together here rather than as four
 * switch statements spread over the toolbar.
 *
 * Kept free of React and of MUI on purpose: this is the one part of the feature
 * that is pure arithmetic, and it is the part worth pinning with tests
 * (`companiesViewRange.test.js`) rather than driving through a rendered toolbar.
 *
 * `COMPANIES_VIEW` lives here rather than beside the toggle that draws it because
 * the enum is now what the *ranges* are keyed on — the switch is one of five
 * consumers, not the owner.
 */

export const COMPANIES_VIEW = {
  DAY: 'day',
  WEEK: 'week',
  MONTH: 'month',
  YEAR: 'year',
};

/**
 * Which of the four the planner can actually pick, **in the order offered**.
 *
 * This has now changed twice in the same sitting — Day/Week/Month/Year, then Day
 * and Week only, now Year alone — which is exactly the case this list exists to
 * make cheap: one array, edited in one place, rather than a decision re-litigated
 * separately in the switch's own options, its default, and its stored-value
 * validation every time the product changes its mind.
 *
 * The enum above keeps all four regardless of what this says: `rangeForView` /
 * `stepRange` / `formatRangeLabel` and `CompaniesPane`'s `VIEWS` map still know how
 * to draw Day, Week and Month, unchanged, so restoring any of them is a one-line
 * edit here rather than rebuilding the arithmetic or the component binding. This
 * list is the single place that says which grains are *reachable* —
 * `CompaniesViewSwitch` builds its options from exactly this set (see
 * `COMPANIES_VIEW_META` below), and `CompaniesPane.readStoredView` validates
 * against it, so a browser holding a stored value from before the latest change
 * degrades to the default instead of landing on a view with no way back to it.
 */
export const SELECTABLE_COMPANIES_VIEWS = [COMPANIES_VIEW.YEAR];

/**
 * The label and hint for every grain the tab *could* offer — kept for all four
 * regardless of which are currently selectable, so restoring one is never blocked
 * on reconstructing its copy. `CompaniesViewSwitch` looks each selectable value up
 * here rather than hand-listing `{value, labelKey, hintKey}` a second time; that
 * second list is what actually drifted before (the Companies tab's Timeline/Compact
 * labels sat on each other's views because two lists described one control), and a
 * lookup keyed on the same enum cannot drift from `SELECTABLE_COMPANIES_VIEWS` the
 * way a hand-maintained parallel array can.
 */
export const COMPANIES_VIEW_META = {
  [COMPANIES_VIEW.DAY]: { labelKey: 'day', hintKey: 'dayHint' },
  [COMPANIES_VIEW.WEEK]: { labelKey: 'week', hintKey: 'weekHint' },
  [COMPANIES_VIEW.MONTH]: { labelKey: 'month', hintKey: 'monthHint' },
  [COMPANIES_VIEW.YEAR]: { labelKey: 'year', hintKey: 'yearHint' },
};

/**
 * The tab opens on the year, which is once again the only question it can ask.
 *
 * Filters are replaced quarterly: "when is this customer next due" is a
 * twelve-month question, and with Day and Week no longer offered there is nothing
 * else for this tab to open on. Restoring either grain later means adding it back
 * to `SELECTABLE_COMPANIES_VIEWS` above; this default does not need to move again
 * unless Year itself stops being offered.
 *
 * This is also the value a retired or no-longer-selectable view falls back to —
 * `CompaniesPane`'s `readStoredView` validates against `SELECTABLE_COMPANIES_VIEWS`,
 * so a planner still holding a stored `'day'` or `'week'` from before this change
 * lands here rather than on a view with no way back to it.
 */
export const DEFAULT_COMPANIES_VIEW = COMPANIES_VIEW.YEAR;

/** A rolling year. Long enough that a 4-month cadence lands three times. */
export const MONTHS_ON_SHOW = 12;

/** The scope's own wire format. Every range in this file is a pair of these. */
const DATE = 'YYYY-MM-DD';

/**
 * The window of `view`'s grain that contains `anchor`.
 *
 * Both ends are inclusive whole days, matching the `from`/`to` the endpoint takes
 * and the `visit.date` keys the payload comes back with — which is what lets the
 * client-side trim in `companyVisitFilters` compare them as plain strings.
 *
 * Week starts on Sunday, which is dayjs's default and also FullCalendar's: the
 * scheduler tab next door sets no `firstDay`, so the two tabs cut a week the same
 * way without either of them stating it. If that ever becomes configurable it has
 * to become configurable in both places at once.
 *
 * Year is the odd one: it is *not* a calendar year but the rolling twelve months
 * from the anchor's own month, month-aligned at both ends. That alignment is not
 * cosmetic — the Year view draws a column per month, and a window running the 17th
 * to the 17th spans thirteen calendar months and gives the matrix a thirteenth
 * column holding one usable week.
 */
export const rangeForView = (view, anchor = dayjs()) => {
  const at = dayjs(anchor);

  switch (view) {
    case COMPANIES_VIEW.DAY:
      return { from: at.format(DATE), to: at.format(DATE) };

    case COMPANIES_VIEW.WEEK:
      return { from: at.startOf('week').format(DATE), to: at.endOf('week').format(DATE) };

    case COMPANIES_VIEW.MONTH:
      return { from: at.startOf('month').format(DATE), to: at.endOf('month').format(DATE) };

    case COMPANIES_VIEW.YEAR:
    default:
      return {
        from: at.startOf('month').format(DATE),
        to: at
          .startOf('month')
          .add(MONTHS_ON_SHOW - 1, 'month')
          .endOf('month')
          .format(DATE),
      };
  }
};

/**
 * One press of the prev/next arrows, in the grain the planner is reading.
 *
 * Day/Week/Month re-derive the whole window from the stepped anchor rather than
 * adding to both ends, so the window can never drift off its own grain: adding a
 * month to 31 January lands on 28 February, and a second press would then step
 * from the 28th. Re-snapping makes the arrows idempotent — n presses forward and n
 * back returns the exact window you started on, whatever the month lengths were.
 *
 * **Year still steps by a month**, which is the behaviour this tab already had and
 * is deliberately not "a year at a time". Two reasons: the view draws a column per
 * month, so a month is the grain a reader can see a step in; and the Year window
 * is the one grain the date picker can leave ragged (see `snapsToGrain`), so both
 * ends are shifted together to preserve whatever span the planner chose instead of
 * re-snapping it back to twelve months.
 */
export const stepRange = (view, scope = {}, direction = 1) => {
  if (view === COMPANIES_VIEW.YEAR) {
    return {
      from: dayjs(scope.from).add(direction, 'month').format(DATE),
      to: dayjs(scope.to).add(direction, 'month').format(DATE),
    };
  }

  const unit =
    view === COMPANIES_VIEW.DAY ? 'day' : view === COMPANIES_VIEW.WEEK ? 'week' : 'month';
  return rangeForView(view, dayjs(scope.from).add(direction, unit));
};

/**
 * The day a view change should re-range around: today when today is on screen,
 * and the start of the window otherwise.
 *
 * Switching grain has to keep the planner's place, and "their place" is not
 * always the window's start. A planner on the year window is looking at a range
 * that begins this month and runs forward; dropping them on `from` would be
 * right. A planner who stepped back to March is looking at March, and today is
 * nowhere in it — dropping them on today would silently undo the navigation they
 * just did. Testing containment answers both with one rule.
 */
export const anchorForRange = (scope = {}) => {
  const today = dayjs();
  const from = dayjs(scope.from);
  const to = dayjs(scope.to);
  if (!from.isValid() || !to.isValid()) return today;

  const holdsToday = !today.isBefore(from, 'day') && !today.isAfter(to, 'day');
  return holdsToday ? today : from;
};

/**
 * Is the window already the one this grain opens on — the "Today" button's
 * disabled state.
 *
 * Asked as an equality against `rangeForView`, not as "does the window contain
 * today": on Year a window *containing* today can still be eleven months away
 * from the one Today would take you to, and the button would read as disabled
 * while still having somewhere to go.
 */
export const isViewingCurrentPeriod = (view, scope = {}) => {
  const current = rangeForView(view, dayjs());
  return scope.from === current.from && scope.to === current.to;
};

/**
 * What the date pill says, in the shortest form that is still unambiguous.
 *
 * Each grain names only the parts the reader cannot infer. A week inside one
 * month is `17 – 23 Aug 2026`; one that straddles a month repeats the month;
 * one that straddles a year repeats both. Printing every part every time gave
 * `17 Aug 2026 – 23 Aug 2026`, which is two thirds redundant and still has to fit
 * a 148px pill.
 *
 * Year prints its years **in full**, and that is the one rule worth stating here:
 * *a two-digit year is only safe next to a day.*
 *
 * It used to read `Aug '26 – Jul '27`, matching its own column headers. Reported as a
 * data bug — "the filter is after Aug 26, why do I see visits from the 22nd and the
 * 17th" — because with no day in the label, `'26` sits exactly where a day-of-month
 * would and reads as *August 26th* rather than *August 2026*. The window was correct
 * the whole time; the label was describing it in a form that cannot be read only one
 * way. An apostrophe is not enough signal to carry that distinction on a control
 * whose neighbours are a date picker and a pair of day-stepping arrows.
 *
 * The visit cards keep `D MMM 'YY` — they lead with a day, so the slot is already
 * taken and `'26` can only be a year. Same reasoning, opposite conclusion: it is the
 * *absence* of the day that makes the short form ambiguous, not the short form
 * itself. The column headers, which also print no day, changed with this.
 */
export const formatRangeLabel = (view, scope = {}) => {
  const from = dayjs(scope.from);
  const to = dayjs(scope.to);

  switch (view) {
    /* No weekday. It was the one part of this label the grid below already states —
       and on a single-day view the column *is* the day — so it spent width restating
       the heading it sits above. Asked for directly. */
    case COMPANIES_VIEW.DAY:
      return from.format('D MMM YYYY');

    case COMPANIES_VIEW.WEEK:
      if (!from.isSame(to, 'year')) {
        return `${from.format('D MMM YYYY')} – ${to.format('D MMM YYYY')}`;
      }
      if (!from.isSame(to, 'month')) return `${from.format('D MMM')} – ${to.format('D MMM YYYY')}`;
      return `${from.format('D')} – ${to.format('D MMM YYYY')}`;

    case COMPANIES_VIEW.MONTH:
      return from.format('MMMM YYYY');

    case COMPANIES_VIEW.YEAR:
    default:
      return `${from.format('MMM YYYY')} – ${to.format('MMM YYYY')}`;
  }
};

/**
 * The window actually asked of the endpoint: the visible one, widened to whole
 * calendar months.
 *
 * The payload is a **month-bucket matrix** — `site.months` is one array per
 * calendar month the request spans — so a request is only ever answered in whole
 * months anyway. Asking for `19 Aug – 19 Aug` returns an August bucket with one
 * day's visits in it; asking for all of August returns the same bucket full. The
 * second costs no extra round trip and is the shape every view already reads, so
 * the day/week trim is done on arrival (`companyVisitFilters.narrowCompanies`)
 * against a payload whose buckets always mean "this whole month".
 *
 * It is still a **narrowed** request, which is the point: Day and Week fetch one
 * month (two when the week straddles a boundary) and Month fetches one, against
 * the twelve every view used to fetch whatever it was showing.
 *
 * Year is untouched by this: its window is month-aligned at both ends by
 * construction, so the envelope *is* the window and the request is byte-for-byte
 * the one the tab already sent.
 */
export const fetchWindowFor = ({ from, to } = {}) => ({
  from: dayjs(from).startOf('month').format(DATE),
  to: dayjs(to).endOf('month').format(DATE),
});

/**
 * Does picking a date in this grain snap to that grain's whole window?
 *
 * Day, Week and Month are *positions* — there is exactly one window per position,
 * so a picked date names it and a range picker's second click has nothing left to
 * decide. Year is the one grain whose span is the planner's to choose: it opens on
 * twelve months but a two-ended pick is allowed to make it three, or thirty.
 */
export const snapsToGrain = (view) => view !== COMPANIES_VIEW.YEAR;

/**
 * Grains where a location with nothing due is noise rather than information.
 *
 * Straight from the precedent the scheduler's own day view already set: *"a quiet
 * row earns its place on a planning surface — it says 'this site exists and is next
 * due on the 12th'. On an execution surface it says nothing the week grid did not
 * already say, and twenty empty sections would bury the three that matter."* A day
 * and a week are execution; a month and a year are planning, and there the empty
 * row is exactly the answer — this location is on the books and due nothing.
 */
export const isExecutionGrain = (view) =>
  view === COMPANIES_VIEW.DAY || view === COMPANIES_VIEW.WEEK;
