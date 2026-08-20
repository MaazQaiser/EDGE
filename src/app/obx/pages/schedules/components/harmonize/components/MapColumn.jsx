import PropTypes from 'prop-types';
import React, { useMemo } from 'react';

import { EXCLUDED } from '../harmonizeRule';
import { MAP_STEP, REMOVED_BY_HAND } from '../useHarmonizeRun';
import RouteMap from './RouteMap';

/**
 * Half the screen, and while the optimizer is composing it is still the *illustration*.
 *
 * The narration is a funnel — fourteen visits read, ten inside the need-by window, seven
 * inside the radius, six that fit — and every step of it is a change to this picture: the
 * pins that fall out of the window go grey on the line that says so, the ring arrives on
 * the line that names the radius, the route draws on the line that announces the sequence.
 *
 * **The words are no longer here, and the pictures still are.** The line used to be
 * captioned over the map on the argument that a claim and its picture should not be in two
 * regions. What that missed is that the *subject* of the whole exercise is the list of
 * routes, and putting the thinking in the column that will hold them lets the planner watch
 * one region think and then fill. So the orb speaks in the middle column and this one
 * illustrates what it says, on the same `mapStep` clock — which is the thing that actually
 * keeps them from drifting, rather than physical adjacency.
 *
 * Once the plan is up, the map is the selected route's view and one of the two places the
 * plan can be edited: clicking a stop offers to take it out of the day, clicking a grey pin
 * the planner removed offers to put it back. Both go through the routes column's own
 * handlers, so the map and the list cannot end up describing different plans.
 */
const MapColumn = ({
  run,
  mapsReady,
  startPoint,
  path,
  pending,
  mapStep,
  ready,
  planning,
  radiusKm,
  onPickStart,
  highlightedSiteId,
  onHighlight,
}) => {
  const { activeRoute, activeVisits, mapExclusions, selectedRoute, dropStop, bringBack } = run;

  /**
   * The two halves of the set, at this step. Their union is always every visit in play,
   * which is what stops the viewport re-fitting as the funnel narrows: a pin goes grey
   * where it stands rather than the map redrawing around a smaller set.
   *
   * Each kind goes out on the line that rules it out, and not before — except the
   * planner's own removals, which were true before the narration started and are grey
   * from the first frame. Work with no room left is the case worth being careful about:
   * it is not refused by the *rule* at all, it is refused by the eight hours, so it
   * cannot grey out until the route has actually been sequenced.
   */
  const ruledOut = useMemo(() => {
    const byHand = mapExclusions.filter((visit) => visit.reason === REMOVED_BY_HAND);
    if (mapStep < MAP_STEP.NEED_BY) return byHand;

    const upTo = (reasons) =>
      mapExclusions.filter(
        (visit) => visit.reason === REMOVED_BY_HAND || reasons.includes(visit.reason),
      );

    if (mapStep < MAP_STEP.RADIUS) return upTo([EXCLUDED.NEED_BY]);
    if (mapStep < MAP_STEP.SEQUENCE) return upTo([EXCLUDED.NEED_BY, EXCLUDED.RADIUS]);
    return mapExclusions;
  }, [mapStep, mapExclusions]);

  const stillIn = useMemo(() => {
    const out = new Set(ruledOut.map((visit) => visit.siteId));
    return activeVisits.filter((visit) => !out.has(visit.siteId));
  }, [activeVisits, ruledOut]);

  return (
    <RouteMap
      fill
      isLoaded={mapsReady}
      /**
       * **The ring is on before the press and off after it, and both halves of that are
       * deliberate.**
       *
       * The twenty-first pass took the radius ring off the map entirely, and its reasoning
       * holds for the state it was reasoning about: once a route is drawn, the map's subject
       * is that route, the fit has to frame the *work* rather than a circle wider than it,
       * and a ring around a solved sequence explains nothing the sequence does not already
       * say. None of that is true of the planning state. There, the circle **is** the
       * subject — it is the rule the planner is setting, the grey pins outside it are grey
       * *because* of it, and the radius slider in the left column has no visible consequence
       * without it.
       *
       * So it is `planning` and not a new setting: one control, two states, and the pass
       * that removed it is not reversed so much as scoped.
       */
      radiusKm={planning ? radiusKm : null}
      /* Clicking the ground sets the origin, and only while planning. Once a plan is up the
         map spends its clicks on the pins — a bubble that takes a visit in or out of the day
         — and a second meaning for the same gesture on the same surface is how a planner
         moves the start point by trying to open a stop. */
      onPickPoint={planning ? onPickStart : undefined}
      startPoint={startPoint.point}
      /* **Only a device fix that is near the work.** The map fits its viewport to
         everything it draws, so a "you are here" ring 12,000km away zooms the panel out
         to a continental view with the route as an unreadable speck. */
      devicePoint={startPoint.canUseDevice ? startPoint.devicePoint : null}
      /* A sequence only once there is one to state. Before the sequencing line these
         same visits are drawn unnumbered by `scatteredPoints` — a set, not an order. */
      stops={mapStep >= MAP_STEP.SEQUENCE ? activeRoute?.plan?.stops || [] : []}
      /* Everything on the map that is not in the open route, each carrying the sentence
         that says why. All four kinds of "not in this day" share one grey mark and
         differ only in what their bubble says, because it is one idea and four separate
         marks would make it four.

         An action only where the planner's own hand caused it: a stop they took out can
         go back, and that is the one bubble with a button. Work the eight hours refused
         cannot be clicked into existence, and work the rule refused must not be. */
      overflowStops={ruledOut}
      /* Every visit still in play at this step. Together with `overflowStops` this is
         always the whole set, which is what keeps the viewport still. */
      scatteredPoints={stillIn}
      path={mapStep >= MAP_STEP.SEQUENCE ? path : []}
      highlightedSiteId={highlightedSiteId}
      onHighlight={onHighlight}
      /* Not editable while it is being explained. A bubble opening mid-reveal would
         offer an action against a plan the screen has not finished stating. */
      onMoveToOverflow={ready ? (siteId) => dropStop(selectedRoute, siteId) : undefined}
      onBringBack={ready ? bringBack : undefined}
      pending={pending}
    />
  );
};

MapColumn.propTypes = {
  run: PropTypes.object.isRequired,
  mapsReady: PropTypes.bool,
  startPoint: PropTypes.object.isRequired,
  /** The road-following path for the selected route, once Directions answers. */
  path: PropTypes.array,
  pending: PropTypes.bool,
  /** How far through its own explanation the map is — an index into `facts.lines`. */
  mapStep: PropTypes.number,
  ready: PropTypes.bool,
  /** Before the press: the map is the control, so it draws the ring and takes clicks. */
  planning: PropTypes.bool,
  /** The run's travelling distance, drawn as a ring while planning. Kilometres. */
  radiusKm: PropTypes.number,
  /** Called with a `{ label, address, lat, lng }` origin when the planner clicks the map. */
  onPickStart: PropTypes.func,
  highlightedSiteId: PropTypes.string,
  onHighlight: PropTypes.func,
};

export default MapColumn;
