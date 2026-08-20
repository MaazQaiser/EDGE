/**
 * Where the route begins and ends.
 *
 * One place, not two: the round trip returns to where it left from, so an
 * "end" control could only ever restate the start.
 *
 * The planner types an address. Everything else this hook does is work out what
 * to put in the box before they touch it — the device's own position, otherwise
 * the franchise. Typing always wins, and a failed location lookup never blocks
 * anything; it just leaves the box empty.
 *
 * **Reversal: the device position is no longer gated on the target day.** The
 * original rule only asked for a fix when the route was for today, reasoning
 * that the planner sits in the office while the technician drives the round, so
 * the browser's location is the wrong origin for next Thursday. That reasoning
 * still holds for the *route*, but it made the ladder unreachable in practice:
 * on a tenant with no franchise lat/lng — which is the demo, and `franchiseInfo`
 * is null there — no rung resolved, so no start point existed, so there was no
 * plan, no stop list, no route on the map and no meter. A drawer that shows
 * nothing is worse than one pre-filled with the office.
 *
 * What keeps it honest: this is a *pre-fill*, it is labelled `Current position`
 * so it can be recognised and changed, and typing beats it. The cost is that the
 * permission prompt is now asked for on every open rather than only for today's
 * routes.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';

export const GEO_STATE = {
  IDLE: 'idle',
  LOCATING: 'locating',
  READY: 'ready',
  DENIED: 'denied',
  UNAVAILABLE: 'unavailable',
};

const GEO_OPTIONS = { enableHighAccuracy: false, timeout: 8000, maximumAge: 5 * 60 * 1000 };

/**
 * What is at this coordinate, in words.
 *
 * Photon (OSM), the same keyless geocoder `AddressSearchField` searches through, so
 * the address in the field comes from the same source whether it was found by
 * typing or by asking the browser where we are. Best-effort by design: a failed
 * lookup leaves the coordinate in place and the route unaffected, because the plan
 * needs the *point* and only the planner needs the words.
 */
const REVERSE_TIMEOUT_MS = 4000;

/* Exported so the settings screen's map picker names a clicked point through the same
   geocoder this hook names a resolved one through. A second implementation was the
   alternative and it is the kind of duplication that drifts: one of the two gets the
   abort timeout below and the other hangs forever. */
export const reverseGeocode = async ({ lat, lng }) => {
  /**
   * **Bounded, because a public geocoder's failure mode is not an error — it is
   * silence.** Photon throttles, and a throttled request can simply never settle.
   * Without this the promise stays pending forever, `isResolving` stays true, and
   * the field and the route's start anchor sit on "Finding the address…" for the
   * rest of the session. A rejected fetch already falls through to coordinates; a
   * hanging one has to be *made* to fail before it can.
   */
  const abort = new AbortController();
  const timer = setTimeout(() => abort.abort(), REVERSE_TIMEOUT_MS);

  try {
    const response = await fetch(`https://photon.komoot.io/reverse?lat=${lat}&lon=${lng}&limit=1`, {
      signal: abort.signal,
    });
    if (!response.ok) return '';
    const data = await response.json();
    const props = data?.features?.[0]?.properties;
    if (!props) return '';

    /* House number and street when there is one, otherwise the most specific named
       thing Photon returned — a district reads better than a country. */
    const street = [props.housenumber, props.street].filter(Boolean).join(' ');
    return (
      [street || props.name, props.city || props.district, props.state]
        .filter(Boolean)
        .join(', ') || ''
    );
  } catch {
    /* Aborted, offline, or CORS — all the same answer here: we cannot name the
       point, so the caller falls back to its coordinates. */
    return '';
  } finally {
    clearTimeout(timer);
  }
};

/**
 * How far the planner's own position may be from the work and still be treated as
 * the origin.
 *
 * A day is eight hours, so at the 38km/h the solver assumes, everything reachable
 * and returnable sits inside ~150km. 400km is loose enough that a planner covering a
 * genuinely large territory is never second-guessed, and tight enough to catch the
 * case this exists for: a browser in another country.
 */
const DEVICE_MAX_KM = 400;

/** Great-circle kilometres. Local rather than imported to keep the hook standalone. */
const kmBetween = (a, b) => {
  if (!a || !b) return Infinity;
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(Number(b.lat) - Number(a.lat));
  const dLng = toRad(Number(b.lng) - Number(a.lng));
  const lat1 = toRad(Number(a.lat));
  const lat2 = toRad(Number(b.lat));
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.min(1, Math.sqrt(h)));
};

/* No longer takes the target day: it was only ever used to decide whether to ask
   for a device fix, and that gate is gone (see the reversal note above).
   `fallbackPoint` is the last rung — see `source` below. */
export const useStartPoint = ({ enabled = true, fallbackPoint = null }) => {
  const franchise = useSelector((state) => {
    const info = state?.auth?.franchiseInfo;
    const lat = parseFloat(info?.lat);
    const lng = parseFloat(info?.lng);

    if (Number.isNaN(lat) || Number.isNaN(lng)) return null;

    return {
      label: info?.name || 'Franchise',
      address: info?.address || info?.name || '',
      lat,
      lng,
    };
  });

  const [geoState, setGeoState] = useState(GEO_STATE.IDLE);
  const [devicePoint, setDevicePoint] = useState(null);
  const [typedPoint, setTypedPoint] = useState(null);

  /**
   * Addresses looked up for coordinates that arrived without one, keyed by
   * `lat,lng`.
   *
   * The device fix was the only rung that got reverse-geocoded, which left the
   * last rung — the centre of the week's own visits — sitting in the field as the
   * words *"Centre of this week's visits"*. That is a description of a method, not
   * a place: a planner cannot check a route against it, cannot tell whether it is
   * five minutes or fifty from the first stop, and cannot recognise it as wrong.
   * Every point in the box now resolves to a street address through the same
   * geocoder, whichever rung produced it.
   *
   * A map rather than a single value because the fallback coordinate changes as
   * the plan changes — dropping a visit moves the centroid — and re-asking for an
   * address already known would flicker the field back to blank each time.
   */
  const [addresses, setAddresses] = useState({});

  /* Asked for on every open now, not only for today's routes — see the reversal
     note above. Without it the demo tenant has no resolvable start point at all. */
  useEffect(() => {
    if (!enabled) return undefined;
    if (!navigator?.geolocation) {
      setGeoState(GEO_STATE.UNAVAILABLE);
      return undefined;
    }

    let cancelled = false;
    setGeoState(GEO_STATE.LOCATING);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (cancelled) return;
        const point = {
          label: 'Current position',
          address: '',
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setDevicePoint(point);
        setGeoState(GEO_STATE.READY);
      },
      (error) => {
        if (cancelled) return;
        /* Not an error the planner needs told about — the box simply falls back
           to the franchise, or stays empty for them to fill. */
        setGeoState(
          error?.code === error?.PERMISSION_DENIED ? GEO_STATE.DENIED : GEO_STATE.UNAVAILABLE,
        );
      },
      GEO_OPTIONS,
    );

    return () => {
      cancelled = true;
    };
  }, [enabled]);

  /* What the field is pre-filled with before anyone types. The device wins over
     the franchise: it is the more specific answer, and on a tenant carrying no
     franchise coordinates it is the only one there is.
`fallbackPoint` is the last rung, and it exists because of what happens when
     every rung above it fails — permission denied, no franchise coordinates, which
     is the demo's default state. Without it there is no origin, so no sequence, no
     times and no meter: the optimizer has nothing to say (§7.45). With it the
     planner gets a real plan built on a **stated assumption** they can overrule in
     one click, which is a better answer than an empty drawer. `source` is what
     makes that honest — the caller must label which rung answered. */
  /**
   * **A device fix only joins the ladder if it is anywhere near the work.**
   *
   * The reversal above made the browser's position the first rung, and that is right
   * for a planner sitting in the office a few miles from the round. It is wrong — and
   * silently catastrophic — when the browser is on another continent: the demo's
   * visits sit around Tampa, a reviewer opened the drawer from Lahore, and the origin
   * became a point 12,941km away. Every downstream consequence followed from that one
   * value. No route could be built, so the drawer opened on `0 routes · 0 visits
   * scheduled · 4 left over`, the map zoomed out to fit two continents, and the panel
   * offered to widen the plan window — a remedy for a problem the planner did not
   * have.
   *
   * The far-origin *guard* already existed and this is the difference between
   * detecting and handling: it correctly reported the distance and then went ahead
   * and used the point anyway. Now the rung is skipped and the ladder falls through
   * to the franchise, or to the centre of the week's own work.
   *
   * `devicePoint` is still returned unchanged, because the map draws "you are here"
   * from it and knowing where you are relative to the work is useful precisely when
   * the answer is "a long way".
   */
  const deviceIsNearWork =
    Boolean(devicePoint) && kmBetween(devicePoint, franchise || fallbackPoint) <= DEVICE_MAX_KM;

  const fallback = (deviceIsNearWork ? devicePoint : null) || franchise || fallbackPoint || null;

  const resolved = typedPoint || fallback;
  const key = resolved ? `${resolved.lat},${resolved.lng}` : '';

  /* Ask what is at whichever coordinate ended up in the box, unless it already
     said. A typed address always has one, the franchise usually does, the device
     and the centroid never do. Best-effort: a failed lookup leaves the coordinate
     in place and the route unaffected, because the plan needs the *point* and only
     the planner needs the words. */
  useEffect(() => {
    if (!enabled || !resolved || !key) return undefined;
    if (resolved.address?.trim() || addresses[key] !== undefined) return undefined;

    let cancelled = false;
    reverseGeocode(resolved).then((address) => {
      if (cancelled) return;
      setAddresses((previous) => ({ ...previous, [key]: address || '' }));
    });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line
  }, [enabled, key]);

  /**
   * The point, always described as a *place*.
   *
   * The address wins over the label, and when there is no address the coordinate
   * wins over it too. That second half matters more than it looks: a label names
   * the rung that answered — "Current position", "Centre of this week's visits" —
   * and those strings were leaking into the route's start anchor and the field for
   * the second or so the geocoder takes, then being replaced under the reader. A
   * value that changes after you have read it is worse than one that was never
   * there, and if Photon is unreachable the method name is *all* the planner ever
   * gets.
   *
   * So the ladder ends in coordinates. Four decimal places is about 11 metres,
   * which is a place: it can be checked against the pins on the map directly above,
   * and it cannot be mistaken for a street it is not.
   */
  const point = useMemo(() => {
    if (!resolved) return null;
    const looked = addresses[key];
    const address = resolved.address?.trim() || looked || '';
    if (address) return { ...resolved, address, label: address };

    /* `undefined` means the lookup has not come back; `''` means it came back with
       nothing. Only the second is final, and only the second falls through to
       coordinates — otherwise the field would show a lat/lng and then swap to a
       street name, which is the flicker this is here to prevent. */
    if (looked === undefined) return { ...resolved, address: '', label: '' };

    const coords = `${Number(resolved.lat).toFixed(4)}, ${Number(resolved.lng).toFixed(4)}`;
    return { ...resolved, address: coords, label: coords };
    // eslint-disable-next-line
  }, [resolved, addresses[key], key]);

  /** True while the geocoder is still deciding what to call the current point. */
  const isResolving =
    Boolean(resolved) && !resolved.address?.trim() && addresses[key] === undefined;

  /* Which rung actually answered — `deviceIsNearWork`, not `devicePoint`, or a
     rejected fix would report itself as the origin it was refused for being. */
  const source = typedPoint
    ? 'typed'
    : deviceIsNearWork
      ? 'device'
      : franchise
        ? 'franchise'
        : fallbackPoint
          ? 'assumed'
          : 'none';

  const setAddress = useCallback((location) => {
    /* **`Number.isFinite`, not truthiness.** This read `!location?.lat || !location?.lng`,
       which refuses a perfectly good origin on the equator or the prime meridian — `0` is
       falsy and a coordinate. Academic for a Tampa franchise and not academic for the
       control that now feeds this: a click on the map hands over whatever the planner
       pointed at, and silently ignoring a click is the worst failure a map can have. */
    if (!Number.isFinite(Number(location?.lat)) || !Number.isFinite(Number(location?.lng))) return;
    setTypedPoint({
      label: location.name || location.address || 'Typed address',
      address: location.address || location.name || '',
      lat: Number(location.lat),
      lng: Number(location.lng),
    });
  }, []);

  const clearAddress = useCallback(() => setTypedPoint(null), []);

  return {
    point,
    /** Which rung answered: typed · device · franchise · assumed · none. */
    source,
    /* Exposed separately so the map can draw "you are here" even when the
       planner has typed a different origin over the top of it. Knowing where you
       are relative to the work is useful whether or not the route leaves from
       there — and most useful when the answer is "a long way". */
    devicePoint,
    /* Whether a device fix could be the origin at all. `devicePoint` existing is not
       the same question: a fix in another country is drawn on the map and refused as
       an origin, so any control offering to *use* it has to read this instead or it
       is a button that does nothing. */
    canUseDevice: deviceIsNearWork,
    geoState,
    isLocating: geoState === GEO_STATE.LOCATING,
    /* Naming the point is a second, separate wait after finding it — and the field
       has to say which one it is in, because "Locating…" over a box that already
       holds coordinates would be describing the wrong step. */
    isResolving,
    setAddress,
    clearAddress,
    /* Remounts the uncontrolled field when the pre-filled default changes, so a
       franchise or GPS fix — or an address that reverse-geocodes late — still lands
       in the box. The resolved address is part of the key for exactly that reason:
       without it the field keeps whatever placeholder it mounted with. */
    defaultKey: `${fallback?.lat ?? 'none'},${fallback?.lng ?? 'none'},${
      point?.address?.trim() || ''
    }`,
  };
};
