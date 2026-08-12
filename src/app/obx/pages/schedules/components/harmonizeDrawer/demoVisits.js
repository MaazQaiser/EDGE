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

/** Everything is clustered around the franchise so the demo map is legible. */
const ANCHOR = { lat: 28.0587, lng: -82.4572 };

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

    return {
      id: shift.id,
      siteId,
      siteName,
      unit: shift.detail || siteName,
      address: shift.address || `${siteName}, Tampa, FL`,
      lat: Number(shift.lat) || fallbackCoords.lat,
      lng: Number(shift.lng) || fallbackCoords.lng,
      serviceMinutes: Number(shift.serviceMinutes) || 25 + (hashOf(shift.id) % 40),
      scheduledFor,
      day: shift.day || scheduledFor.format('ddd'),
      bucket: bucketFor(scheduledFor, today),
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
      const serviceMinutes = 30 + (hashOf(stopId) % 45);

      return {
        siteId: stopId,
        siteName: `${['Riverside', 'Oakfield', 'Bayview', 'Kingsway', 'Elm Court'][stopIndex % 5]} Depot`,
        address: 'Tampa, FL',
        ...coords,
        serviceMinutes,
        visits: [{ id: stopId, serviceMinutes, bucket: VISIT_BUCKET.TODAY }],
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
