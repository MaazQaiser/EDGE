import { SCHEDULE_STATS_FOOTER_VARIANTS } from 'src/app/obx/pages/schedules/components/scheduleStatsFooter';
import { mapFooterStatsToScheduleStatsFooter } from 'src/app/obx/pages/schedules/helper/scheduleResponseAdapter';

/**
 * How many **visits** the window holds — **read off the footer the page is already
 * showing**, not counted a second time.
 *
 * ── Visits only, by contract ──
 *
 * This used to answer for any footer, which on the routes reading meant a header
 * that said `12 Routes` over twelve route cards. Asked for directly: that total is
 * gone. It was the weakest number on the screen — a count of the cards a planner can
 * already see, in a unit nobody plans in — and the per-card visit counts now say the
 * useful half of it (`routeVisitCount.js`), per run, where the work is.
 *
 * So the gate is the footer's **subject**, not the surface: only a footer whose cards
 * are visits (`SCHEDULE_STATS_FOOTER_VARIANTS.VISITS`, which `resolveScheduleFooterVariant`
 * returns for the visits tab and the company grouping alike) has a total. Every other
 * variant answers `null` and the header draws nothing. Stated here rather than as a
 * condition at the call site so there is no window where a total is computed and then
 * hidden — and so the two readings of one tab cannot drift apart by someone editing
 * only the render.
 *
 * The grid draws cards from `allDuties`, the footer draws its status marks from
 * `footerStats`, and a header total counted from the array would be a third
 * opinion about one fact. Two counts of one thing drift: this feature has already
 * shipped a missed-visits pill that said 3 over a grid that drew 2. So the total
 * sums *the footer's own mapped entries* — whatever the footer says is on screen,
 * this says how many. It cannot disagree with the row of numbers directly beneath
 * it, because it is that row added up.
 *
 * **Cancelled is excluded, for free.** A cancelled record is not drawn unless the
 * status filter asks for it (`dropCancelledEvents`), and the footer's status list
 * carries no `cancelled` entry for exactly that reason — the payload still holds
 * `statuses.cancelled` and nothing reads it. Summing the mapped entries therefore
 * inherits the decision rather than repeating it; there is nothing here to
 * compensate for, and adding a compensation term would re-open the gap it closed.
 *
 * Returns `null` — not `0` — when there is nothing to add up, so a loading window
 * and an empty one can be told apart at the call site.
 *
 * @param {object|null} footerStats Raw `footerStats` from the schedule payload.
 * @param {string} variant A `SCHEDULE_STATS_FOOTER_VARIANTS` value — the footer
 *   variant *as the surface is currently grouped* (`resolveScheduleFooterVariant`),
 *   since the routes and company readings of one tab report different subjects.
 * @returns {number|null}
 */
export const sumScheduleWindowTotal = (footerStats, variant) => {
  /* `VISITS` and nothing else. The embedded site and user schedules report `null`
     here and draw no footer at all, so there is no row of numbers for a total to be
     the sum of; `NONE` — the timeline pane — says the same thing deliberately; and
     every shift-subject variant (`OVERVIEW`, `PATROL`, `DEDICATED`) is a footer whose
     cards are not visits, which is the case this total was asked to stop answering.
     None of them may fall back to another variant's answer. */
  if (!footerStats || variant !== SCHEDULE_STATS_FOOTER_VARIANTS.VISITS) return null;

  const mapped = mapFooterStatsToScheduleStatsFooter(footerStats, variant);
  if (!mapped?.statusStats?.length) return null;

  return mapped.statusStats.reduce((total, stat) => total + (Number(stat.value) || 0), 0);
};

/**
 * What to call a count of visits — the tenant's own word, never a hardcoded noun.
 *
 * **One word, now.** This used to choose between the visits term and the runsheets
 * term, because the total labelled route cards on one reading and visit cards on the
 * other. With the routes total gone (see above) every count that reaches this
 * function is a count of visits, so a `showsVisits` argument would be a parameter
 * with one legal value — and the shape that most invites a caller to pass `false`
 * and get a wrong label from a function that no longer has a right one.
 *
 * Two readers, deliberately: the header total, and the tooltip on a route card's own
 * visit count. They are the two places this app writes a number of visits in the
 * schedule chrome, and reading the noun from one resolution is what stops one of them
 * saying "Visits" while the other says "Hits" on a tenant that renamed them.
 *
 * Singular and plural are two tenant terms (`hit`/`hits`), matching how the visits
 * month cell already picks between them.
 */
export const resolveScheduleWindowTerm = ({ count, getLabel, t }) => {
  const isSingular = count === 1;

  return (
    (isSingular ? getLabel?.('terms', 'hit', t) : getLabel?.('terms', 'hits', t)) ||
    (isSingular ? 'Visit' : 'Visits')
  );
};
