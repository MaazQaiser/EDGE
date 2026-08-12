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

import { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

export const GEO_STATE = {
  IDLE: 'idle',
  LOCATING: 'locating',
  READY: 'ready',
  DENIED: 'denied',
  UNAVAILABLE: 'unavailable',
};

const GEO_OPTIONS = { enableHighAccuracy: false, timeout: 8000, maximumAge: 5 * 60 * 1000 };

/* No longer takes the target day: it was only ever used to decide whether to ask
   for a device fix, and that gate is gone (see the reversal note above). */
export const useStartPoint = ({ enabled = true }) => {
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
        setDevicePoint({
          label: 'Current position',
          address: 'Current position',
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
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
     franchise coordinates it is the only one there is. */
  const fallback = devicePoint || franchise || null;

  const point = typedPoint || fallback;

  const setAddress = useCallback((location) => {
    if (!location?.lat || !location?.lng) return;
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
    /* Exposed separately so the map can draw "you are here" even when the
       planner has typed a different origin over the top of it. Knowing where you
       are relative to the work is useful whether or not the route leaves from
       there. */
    devicePoint,
    geoState,
    isLocating: geoState === GEO_STATE.LOCATING,
    setAddress,
    clearAddress,
    /* Remounts the uncontrolled field when the pre-filled default changes, so a
       franchise or GPS fix that resolves late still lands in the box. */
    defaultKey: `${fallback?.lat ?? 'none'},${fallback?.lng ?? 'none'}`,
  };
};
