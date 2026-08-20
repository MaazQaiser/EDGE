/**
 * Real drive times for a sequence the solver has already decided.
 *
 * Haversine at an average speed is good enough to *order* stops — it is not
 * good enough to decide what fits, because the number that decides is the one
 * the planner trusts. So ordering stays local and instant, and this layer
 * refines the times for the order that came out of it.
 *
 * One request for the whole route. Google returns per-leg durations and the
 * road geometry in a single call when the waypoints ride along, so there is no
 * reason to pay for a round-trip per leg.
 *
 * Failure is not fatal. If the service cannot be reached the caller keeps its
 * haversine figures and labels them as estimates — a slightly wrong number that
 * is marked as such beats a drawer that refuses to open.
 */

import { useEffect, useRef, useState } from 'react';

export const DIRECTIONS_STATE = {
  IDLE: 'idle',
  LOADING: 'loading',
  READY: 'ready',
  FAILED: 'failed',
};

const DEBOUNCE_MS = 400;

/** Google caps a single directions request; beyond this we stay on estimates. */
const MAX_WAYPOINTS = 23;

const toLatLng = (point) => ({ lat: Number(point.lat), lng: Number(point.lng) });

export const useDirections = ({ isLoaded, startPoint, stops = [], endPoint, enabled = true }) => {
  const [state, setState] = useState(DIRECTIONS_STATE.IDLE);
  const [result, setResult] = useState({ legMinutes: [], path: [], totalTravelMinutes: 0 });

  /* The signature is what actually changed — recomputing on object identity
     would fire a request on every render of the parent. */
  const signature = JSON.stringify([
    startPoint && toLatLng(startPoint),
    stops.map((stop) => stop.siteId),
    endPoint && toLatLng(endPoint),
  ]);

  const generationRef = useRef(0);

  useEffect(() => {
    if (!enabled || !isLoaded || !startPoint || !endPoint || !stops.length) {
      setState(DIRECTIONS_STATE.IDLE);
      return undefined;
    }

    if (stops.length > MAX_WAYPOINTS + 1) {
      setState(DIRECTIONS_STATE.FAILED);
      return undefined;
    }

    const generation = ++generationRef.current;
    setState(DIRECTIONS_STATE.LOADING);

    const timer = window.setTimeout(() => {
      const service = new window.google.maps.DirectionsService();

      service.route(
        {
          origin: toLatLng(startPoint),
          destination: toLatLng(endPoint),
          waypoints: stops.slice(0, -1).map((stop) => ({
            location: toLatLng(stop),
            stopover: true,
          })),
          travelMode: window.google.maps.TravelMode.DRIVING,
          /* Order is ours. Letting Google reorder would silently discard the
             option the planner picked. */
          optimizeWaypoints: false,
        },
        (response, status) => {
          if (generation !== generationRef.current) return;

          if (status !== 'OK' || !response?.routes?.length) {
            setState(DIRECTIONS_STATE.FAILED);
            return;
          }

          const [route] = response.routes;
          const legMinutes = route.legs.map((leg) => Math.round((leg.duration?.value || 0) / 60));

          setResult({
            legMinutes,
            path: route.overview_path || [],
            totalTravelMinutes: legMinutes.reduce((total, minutes) => total + minutes, 0),
          });
          setState(DIRECTIONS_STATE.READY);
        },
      );
    }, DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [signature, isLoaded, enabled]);

  return {
    state,
    isLoading: state === DIRECTIONS_STATE.LOADING,
    /* "Estimated" is a visible state, not a silent downgrade. */
    isEstimated: state === DIRECTIONS_STATE.FAILED || state === DIRECTIONS_STATE.IDLE,
    ...result,
  };
};
