/**
 * How long work on site takes, and the only place that is decided.
 *
 * Time on site is **a fixed call-out plus filters × 20 minutes**: arriving,
 * parking, finding the units and signing in costs the same 10 minutes whether
 * there is one filter to change or six, and then each filter is 20. A site with
 * five filters is 10 + 100 = 110 minutes. Travel is added on top by the router,
 * never folded in here.
 *
 * **The call-out was not always here, and it is worth saying why it arrived.** This
 * module used to model on-site time as filters × 20 and nothing else, on the
 * argument that a second factor turns an estimate a planner can check by counting
 * filters into one they have to take on trust. That argument was half right: what
 * it protected was *checkability*, and checkability survives a second factor as
 * long as the second factor is a constant the planner can see. What the
 * single-factor model could not express is the thing harmonizing is actually
 * about — that **six filters at one site is cheaper than six filters at six
 * sites**, because five of those call-outs are the saving. With one factor, a
 * route's on-site total was linear in filters and consolidating changed nothing,
 * so the screen could not show its own value.
 *
 * The cost of adding it is real and was accepted deliberately: every duration in
 * the app grew by the call-out, which means fewer visits fit an eight-hour day and
 * work that used to fit now spills. `packStops` budgets on `stop.serviceMinutes`,
 * so this constant moves which visits make the cut — not just what the screen
 * says about them.
 *
 * This lives in its own dependency-free module because two layers need it: the
 * route maths in `buildRoute/helper.js` and the demo data in
 * `stubbedData/mocks/schedule.mock.js`. Anything that shows a duration for a
 * visit reads it from here, so the card, the workspace and the planned route
 * cannot disagree about the same visit.
 */

/** Per filter, once on site. */
export const FILTER_MINUTES = 20;

/**
 * Per *stop*, however many filters are on it.
 *
 * Arrive, park, find the units, sign in, sign out. Charged once per site rather
 * than once per visit, because `groupVisitsIntoStops` collapses every visit at an
 * address into one stop and the van only arrives once.
 */
export const SITE_MINUTES = 10;

/** Time on site for a visit with this many filters to replace. */
export const serviceMinutesForFilters = (filterCount) =>
  SITE_MINUTES + Math.max(1, Number(filterCount) || 1) * FILTER_MINUTES;

/**
 * The breakdown behind a duration, for the tooltip that explains it.
 *
 * The estimate on a card is one number because a stop list of arithmetic is
 * unreadable; the arithmetic still has to be *available*, because the first
 * question a planner asks a suspicious estimate is "made of what".
 *
 * `siteMinutes` and `filterMinutes` are returned separately rather than as one
 * total, because the route card's breakdown states them as two lines and a
 * consumer that has to re-derive one of them from the other is a consumer that
 * will eventually derive it differently.
 */
export const serviceTimeBreakdown = (filterCount) => {
  const filters = Math.max(1, Number(filterCount) || 1);
  const filterMinutes = filters * FILTER_MINUTES;
  return {
    filters,
    minutesPerFilter: FILTER_MINUTES,
    siteMinutes: SITE_MINUTES,
    filterMinutes,
    totalMinutes: SITE_MINUTES + filterMinutes,
  };
};
