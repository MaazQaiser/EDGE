/**
 * Route building maths for the visit clubbing screen.
 *
 * The man-day is the governing constraint (D4) and it includes driving (D9),
 * so every helper here works in minutes and treats travel and service the same.
 */

/** A worker's day. Service time + driving must fit inside this. */
export const MAN_DAY_MINUTES = 8 * 60;

/** Average urban speed used to turn straight-line distance into drive time. */
const AVG_SPEED_KMH = 38;

const EARTH_RADIUS_KM = 6371;
const toRadians = (degrees) => (degrees * Math.PI) / 180;

export const distanceKm = (from, to) => {
  if (!from || !to) return 0;

  const deltaLat = toRadians(to.lat - from.lat);
  const deltaLng = toRadians(to.lng - from.lng);
  const a =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(toRadians(from.lat)) * Math.cos(toRadians(to.lat)) * Math.sin(deltaLng / 2) ** 2;

  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

export const travelMinutes = (from, to) => Math.round((distanceKm(from, to) / AVG_SPEED_KMH) * 60);

/**
 * Two visits at the same site become one stop with several jobs (D16) — travel
 * is paid once, service time per visit.
 */
export const groupVisitsIntoStops = (visits = []) => {
  const stopsBySite = new Map();

  visits.forEach((visit) => {
    const existing = stopsBySite.get(visit.siteId);

    if (existing) {
      existing.visits.push(visit);
      existing.serviceMinutes += visit.serviceMinutes;
      return;
    }

    stopsBySite.set(visit.siteId, {
      siteId: visit.siteId,
      siteName: visit.siteName,
      address: visit.address,
      lat: visit.lat,
      lng: visit.lng,
      serviceMinutes: visit.serviceMinutes,
      visits: [visit],
    });
  });

  return [...stopsBySite.values()];
};

/**
 * Nearest-neighbour ordering from the chosen start point. Deliberately simple —
 * the real solver has to honour site access windows (D13), which this does not.
 */
export const orderStopsByProximity = (startPoint, stops = []) => {
  const remaining = [...stops];
  const ordered = [];
  let cursor = startPoint;

  while (remaining.length) {
    let nearestIndex = 0;
    let nearestMinutes = travelMinutes(cursor, remaining[0]);

    remaining.forEach((stop, index) => {
      const minutes = travelMinutes(cursor, stop);
      if (minutes < nearestMinutes) {
        nearestMinutes = minutes;
        nearestIndex = index;
      }
    });

    const [next] = remaining.splice(nearestIndex, 1);
    ordered.push({ ...next, travelFromPrevious: nearestMinutes });
    cursor = next;
  }

  return ordered;
};

/**
 * Walks the ordered route accumulating time, so each stop knows when it is
 * reached and whether it already falls outside the man-day.
 */
export const buildRoutePlan = ({
  startPoint,
  visits = [],
  returnToStart = true,
  dayStartMinutes = 8 * 60,
}) => {
  const stops = orderStopsByProximity(startPoint, groupVisitsIntoStops(visits));

  let elapsed = 0;
  let serviceTotal = 0;
  let travelTotal = 0;

  const plannedStops = stops.map((stop, index) => {
    elapsed += stop.travelFromPrevious;
    travelTotal += stop.travelFromPrevious;

    const arrivalMinutes = dayStartMinutes + elapsed;

    elapsed += stop.serviceMinutes;
    serviceTotal += stop.serviceMinutes;

    return {
      ...stop,
      order: index + 1,
      arrivalMinutes,
      departureMinutes: dayStartMinutes + elapsed,
      /** True once this stop can no longer be reached inside the man-day. */
      isOverBudget: elapsed > MAN_DAY_MINUTES,
    };
  });

  const returnLegMinutes =
    returnToStart && stops.length ? travelMinutes(stops[stops.length - 1], startPoint) : 0;

  travelTotal += returnLegMinutes;
  const totalMinutes = serviceTotal + travelTotal;

  return {
    stops: plannedStops,
    serviceMinutes: serviceTotal,
    travelMinutes: travelTotal,
    returnLegMinutes,
    totalMinutes,
    remainingMinutes: Math.max(0, MAN_DAY_MINUTES - totalMinutes),
    overflowMinutes: Math.max(0, totalMinutes - MAN_DAY_MINUTES),
    overBudgetStopCount: plannedStops.filter((stop) => stop.isOverBudget).length,
    finishMinutes: dayStartMinutes + elapsed + returnLegMinutes,
  };
};

/** Rolls the selection up into the filters the van has to be carrying (D14). */
export const buildVanLoad = (visits = []) => {
  const totals = new Map();

  visits.forEach((visit) => {
    (visit.filters || []).forEach(({ name, quantity }) => {
      totals.set(name, (totals.get(name) || 0) + quantity);
    });
  });

  return [...totals.entries()]
    .map(([name, quantity]) => ({ name, quantity }))
    .sort((a, b) => b.quantity - a.quantity);
};

export const formatMinutesAsDuration = (minutes = 0) => {
  const safe = Math.max(0, Math.round(minutes));
  const hours = Math.floor(safe / 60);
  const mins = safe % 60;

  if (!hours) return `${mins}m`;
  if (!mins) return `${hours}h`;
  return `${hours}h ${mins}m`;
};

export const formatMinutesAsClock = (minutesFromMidnight = 0) => {
  const total = Math.round(minutesFromMidnight) % (24 * 60);
  const hours = `${Math.floor(total / 60)}`.padStart(2, '0');
  const mins = `${total % 60}`.padStart(2, '0');
  return `${hours}:${mins}`;
};
