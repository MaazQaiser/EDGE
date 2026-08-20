/**
 * Turns a calendar selection into routable visits.
 *
 * The calendar hands over whatever the shift object carried; anything a route
 * needs but the demo data lacks — coordinates, service time, access windows —
 * is filled deterministically from a hash of the id, so the same selection
 * always produces the same plan and nothing flickers between renders.
 *
 * Visits at the same site share a siteId and therefore share coordinates, which
 * is what lets `groupVisitsIntoStops` collapse them into one stop that pays for
 * travel once.
 */

import dayjs from 'dayjs';
import { serviceMinutesForFilters } from 'src/utils/constants/serviceTime';

/** Everything is clustered around the franchise so the demo map is legible. */
const ANCHOR = { lat: 28.0587, lng: -82.4572 };

/**
 * The same anchor, exported, because the Harmonization settings screen needs a start
 * point to pre-fill and the demo tenant has nothing to give it: `franchiseInfo` is null
 * there and the browser's own position is usually a continent away from this data.
 *
 * Exported rather than copied so the two cannot drift. A start point that is not where
 * the visits are is worse than none at all — it makes every distance, every route and
 * every "outside the radius" verdict on the scheduler wrong in the same direction, which
 * looks like a broken optimizer rather than a bad default.
 *
 * Demo scaffolding: delete this with `demoVisits` once sites carry real coordinates.
 */
export const DEMO_ANCHOR = ANCHOR;

export const VISIT_BUCKET = { OVERDUE: 'overdue', TODAY: 'today', AHEAD: 'ahead' };

const hashOf = (value) => {
  let hash = 0;
  for (const character of String(value)) {
    hash = (hash * 31 + character.charCodeAt(0)) | 0;
  }
  return Math.abs(hash);
};

/** A stable pseudo-random in [0, 1) from a seed and a salt. */
const noise = (seed, salt) => (hashOf(`${seed}:${salt}`) % 1000) / 1000;

/** Sites land on a ring around the anchor — far enough apart that order matters. */
const coordsForSite = (siteId) => {
  const angle = noise(siteId, 'angle') * Math.PI * 2;
  const radiusKm = 3 + noise(siteId, 'radius') * 12;

  return {
    lat: ANCHOR.lat + (radiusKm / 111) * Math.sin(angle),
    lng: ANCHOR.lng + (radiusKm / (111 * Math.cos((ANCHOR.lat * Math.PI) / 180))) * Math.cos(angle),
  };
};

const bucketFor = (scheduledFor, today) => {
  if (scheduledFor.isBefore(today, 'day')) return VISIT_BUCKET.OVERDUE;
  if (scheduledFor.isSame(today, 'day')) return VISIT_BUCKET.TODAY;
  return VISIT_BUCKET.AHEAD;
};

/**
 * Real fields win; the hash only fills what is missing. That keeps this honest
 * once the selection starts carrying live site coordinates.
 */
export const buildVisits = (selectedShifts = [], today = dayjs()) =>
  selectedShifts.map((shift) => {
    const siteName = shift.site || 'Unnamed site';
    const siteId = shift.siteId || `site-${siteName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
    const fallbackCoords = coordsForSite(siteId);
    /* A truthy but unparseable `startsAt` used to become an invalid dayjs and
       travel all the way to the UI — the target day resolved to `Invalid Date`,
       which then printed into the merge-target label and the Apply button. Parse,
       then check; a date that cannot be read is the same as one that is missing. */
    const parsed = shift.startsAt ? dayjs(shift.startsAt) : null;
    const scheduledFor = parsed?.isValid() ? parsed : today;

    /* Time on site is filters × 20 (`serviceTime.js`), so the filter count is the
       fact and the duration is derived from it — never the other way round. A
       visit that arrives without a count gets a plausible one from its id rather
       than a bare duration, because the tooltip has to be able to show the
       arithmetic and "83 minutes" cannot be decomposed into filters. */
    const filterCount = Number(shift.filterCount) || 1 + (hashOf(`${shift.id}:filters`) % 8);

    /**
     * The date the contract says the filter is due.
     *
     * Not the day the visit currently sits on. It comes from the site's contract and
     * the date the filter was first fitted — interval added to that anniversary —
     * which is why it is a *fact about the visit* and not a property of the
     * schedule. Whoever built the route chose the day; the contract chose this.
     *
     * The demo has no contract data, so it is synthesised as a small deterministic
     * drift either side of the scheduled day: mostly the same date, sometimes a day
     * or two out, at most three.
     *
     * **The drift used to reach four days, and the change is deliberate — read this
     * before widening it back.** The old range was chosen "to exercise the rule rather
     * than to flatter it": at the default ± 3 a four-day drift is exactly the visit that
     * cannot legally be pulled onto the route day, so the triage panel always had
     * something to report. That was the right call while the workspace opened on a solved
     * plan and the triage was part of the first impression.
     *
     * It is the wrong call now. The screen opens empty and the planner presses Harmonize
     * to get an answer, so the answer that press produces is the whole demonstration — and
     * an answer that leaves a third of the week out, at settings nobody has touched, reads
     * as the optimizer failing rather than as the rule working.
     *
     * **Capped at one day, and the number is forced rather than chosen.** The drift does not
     * act alone: it compounds with how wide the week itself is. A week spans seven days, the
     * single install day sits up to four days from one end of it, and the drift is applied
     * *on top of* that offset — so at ± 3 of drift a visit's due date can land seven days
     * from the route day and no default window short of ± 7 would reach it. One day of
     * drift keeps the widest case at five, which is exactly what `NEED_BY_DEFAULT` now
     * allows, so the opening state routes the whole week with nothing left over.
     *
     * The triage still appears the moment a planner narrows the window to ± 3 or tightens
     * the radius. The unhappy path is a state the data can still reach; it is no longer the
     * state it starts in.
     */
    const driftDays = [0, 0, 0, 1, -1, 1, -1, 0, 0][hashOf(`${shift.id}:needby`) % 9];
    const needByDate = shift.needByDate
      ? dayjs(shift.needByDate)
      : scheduledFor.add(driftDays, 'day');

    return {
      id: shift.id,
      siteId,
      siteName,
      unit: shift.detail || siteName,
      address: shift.address || `${siteName}, Tampa, FL`,
      lat: Number(shift.lat) || fallbackCoords.lat,
      lng: Number(shift.lng) || fallbackCoords.lng,
      filterCount,
      serviceMinutes: Number(shift.serviceMinutes) || serviceMinutesForFilters(filterCount),
      scheduledFor,
      needByDate,
      /**
       * A contract that allows less slack than the franchise's own setting.
       *
       * **Synthesised for roughly one site in six, and no longer synthesised at all.** The
       * argument for inventing it was sound and is worth keeping on the record: the need-by
       * window is two constraints wearing one name — the planner sets a default for the
       * run, and a particular contract may be tighter than it — and the one visit a planner
       * cannot include by widening *anything* is the one they most need to be told about.
       *
       * The cost is what retires it. A synthetic tight contract is permanently unreachable
       * by construction, so the demo could never show a run that covered the whole week: no
       * pill, no radius, no crew size would ever clear the panel. That made the exception
       * report a fixture of the screen rather than a response to the planner's settings.
       * Real payloads still carry `needByWindowDays` and the rule still honours it wherever
       * it arrives — only the invention is gone, and this module's own rule is that it
       * invents missing geometry, never missing facts. A contract term is a fact.
       */
      needByWindowDays: Number(shift.needByWindowDays) || null,
      day: shift.day || scheduledFor.format('ddd'),
      bucket: bucketFor(scheduledFor, today),
      /* Resolved on the calendar, where the whole event payload was still in hand.
         Passed straight through — this module invents missing geometry, never
         missing facts, and a visit's state is a fact. */
      visitState: shift.visitState || null,
      runsheetName: shift.runsheetName || null,
      /* A hard access window can invalidate a sequence the meter thinks fits.
         v1 does not solve for these — it refuses to claim they fit. */
      hasAccessWindow: noise(shift.id, 'window') > 0.85,
    };
  });

/**
 * The day the planner most likely meant: whichever already holds the most of
 * the selection. Fewest moves means fewest clients to tell.
 *
 * **A day that has passed is never that day.** Work cannot be scheduled into
 * yesterday, and this used to offer to: it counted every selected date and broke
 * ties towards the *earlier* one, so a selection containing anything historical
 * would land there and the Apply button would read `Apply → Mon 10 Aug` two days
 * after Mon 10 Aug. That is not a rare shape either — D5 makes a **missed** visit
 * the one thing still actionable in a past week, so selections full of past dates
 * are exactly what harmonize is for. Past days are excluded from the count; if
 * every selected day has gone, the answer is today.
 */
export const defaultTargetDay = (visits = [], today = dayjs()) => {
  const startOfToday = dayjs(today).startOf('day');
  if (!visits.length) return startOfToday;

  const counts = new Map();
  visits.forEach((visit) => {
    // One unreadable date must not decide the day for the whole selection: an
    // "Invalid Date" key sorts first on a tie and poisons everything downstream.
    if (!visit.scheduledFor?.isValid?.()) return;
    if (visit.scheduledFor.isBefore(startOfToday, 'day')) return;
    const key = visit.scheduledFor.format('YYYY-MM-DD');
    counts.set(key, (counts.get(key) || 0) + 1);
  });

  const [best] = [...counts.entries()].sort(
    (a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1), // ties break to the earlier day
  );

  if (!best) return startOfToday;

  const day = dayjs(best[0]);
  return day.isValid() ? day : startOfToday;
};

/**
 * Runsheets already sitting on a given day, as merge targets.
 *
 * Derived from the date so the demo is stable: some days are busy, some are
 * empty, and the empty ones exercise the "no merge control at all" path.
 */
export const runsheetsOnDay = (day) => {
  const seed = hashOf(day.format('YYYY-MM-DD'));
  const count = seed % 4; // 0–3, so the empty case shows up naturally

  return Array.from({ length: count }, (_, index) => {
    const id = `rs-${day.format('MMDD')}-${index}`;
    const isLive = index === 0 && seed % 3 === 0;
    const stopCount = 2 + (hashOf(id) % 4);
    const completedStops = isLive ? 1 + (hashOf(id) % 2) : 0;

    /* Real stops rather than a count: merging has to re-solve against them, and
       a number cannot be put in an order. */
    const existingStops = Array.from({ length: stopCount }, (_, stopIndex) => {
      const stopId = `${id}-stop-${stopIndex}`;
      const coords = coordsForSite(stopId);
      /* Work already on a route is measured the same way as work being added to
         it — filters × 20. A stop whose duration came from a different model
         would make the meter's two segments incomparable. */
      const filterCount = 1 + (hashOf(stopId) % 6);
      const serviceMinutes = serviceMinutesForFilters(filterCount);

      return {
        siteId: stopId,
        siteName: `${['Riverside', 'Oakfield', 'Bayview', 'Kingsway', 'Elm Court'][stopIndex % 5]} Depot`,
        address: 'Tampa, FL',
        ...coords,
        filterCount,
        serviceMinutes,
        visits: [{ id: stopId, filterCount, serviceMinutes, bucket: VISIT_BUCKET.TODAY }],
        /* Everything before the technician's current position is done and
           cannot be re-ordered around. */
        completed: stopIndex < completedStops,
      };
    });

    return {
      id,
      name: `${day.format('ddd')} ${['North', 'South', 'Overflow'][index] || 'Extra'}`,
      worker: index === 2 ? null : ['Alex Green', 'Priya Nair', 'Sam Okafor'][index % 3],
      stops: stopCount,
      completedStops,
      existingStops,
      loadMinutes: existingStops.reduce((total, stop) => total + stop.serviceMinutes, 0),
      status: isLive ? 'live' : 'notStarted',
      startMinutes: 8 * 60 + (hashOf(id) % 2) * 60,
    };
  });
};
