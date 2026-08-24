import { Box, Button, IconButton, TextField, Tooltip, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import RequiredAsterik from 'src/app/components/common/requiredAsterik';
import { distanceKm } from 'src/app/obx/pages/runSheets/buildRoute/helper';
import { pointInRing } from 'src/app/obx/pages/schedules/components/harmonize/tileProjection';
import { ReactComponent as CloseIcon } from 'src/assets/svg/close.svg?react';
import { ReactComponent as InfoIcon } from 'src/assets/svg/greyInfoIcon.svg?react';

import { useStyles } from './harmonization.styles';
import {
  clampRadiusMiles,
  kmToMiles,
  RADIUS_DEFAULT_MILES,
  ZONE_SHAPE,
} from './harmonizationSettings';
import { BoundaryIcon, RadiusIcon } from './ZoneGlyphs';
import ZoneIncluded from './ZoneIncluded';
import ZoneLassoExperience from './ZoneLassoExperience';
import ZoneRadiusExperience from './ZoneRadiusExperience';

/**
 * Where a zone gets its sites — a flat panel beside the list it is joining.
 *
 * **Not a drawer.** It is fixed to the right edge, full height, and the screen moves over to
 * make room (`wrapperShifted`) instead of being dimmed behind a scrim. A zone is defined
 * *against* the zones that already exist, so hiding them was hiding the context.
 *
 * **The panel owns the name, the gate, and the containment maths.** How an area is chosen —
 * dragged as a boundary, or measured out from a site — belongs to the two experiences, which
 * are separate interfaces rather than modes: one has no notion of a centre, the other has no
 * notion of a point. The switcher between them floats on the map, because what it changes is
 * how the map behaves.
 *
 * **Nothing can be confirmed half-made**, and the way that is said is inline rather than in
 * a box: the name field goes red with its own message, and the map's own outline goes red.
 * The banners that used to say the same thing above the map are gone — they repeated what
 * the field already showed and pushed the map down a hundred pixels to do it.
 */

const MILES_PER_DEGREE_LAT = 69.0;

/**
 * How far outside a boundary a site is, in miles: the distance to the nearest **edge**.
 *
 * Not the nearest vertex, which reports a site as far away when it sits a hair outside the
 * middle of a long side, and not the centroid, which means nothing for a concave shape.
 */
const milesOutsideRing = (point, ring) => {
  const lngScale = MILES_PER_DEGREE_LAT * Math.cos((Number(point.lat) * Math.PI) / 180);
  const px = Number(point.lng) * lngScale;
  const py = Number(point.lat) * MILES_PER_DEGREE_LAT;

  let best = Infinity;
  for (let i = 0; i < ring.length; i += 1) {
    const a = ring[i];
    const b = ring[(i + 1) % ring.length];
    const ax = Number(a.lng) * lngScale;
    const ay = Number(a.lat) * MILES_PER_DEGREE_LAT;
    const bx = Number(b.lng) * lngScale;
    const by = Number(b.lat) * MILES_PER_DEGREE_LAT;
    const dx = bx - ax;
    const dy = by - ay;
    const lengthSquared = dx * dx + dy * dy;
    /* A degenerate edge collapses to its own endpoint rather than dividing by zero. */
    const t = lengthSquared
      ? Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / lengthSquared))
      : 0;
    const distance = Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
    if (distance < best) best = distance;
  }

  return Number.isFinite(best) ? best : null;
};

const ZoneEditorPanel = ({
  open,
  zone,
  initialMethod,
  sites,
  basePoint,
  otherZones,
  currentSiteIds,
  onCancel,
  onSave,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const tt = (key, options) =>
    t(`obx.settings.preferences.harmonization.${key}`, {
      ...options,
      interpolation: { escapeValue: false },
    });

  const [method, setMethod] = useState(initialMethod);
  const [name, setName] = useState('');
  const [points, setPoints] = useState([]);
  const [centreSiteId, setCentreSiteId] = useState(null);
  const [radiusMiles, setRadiusMiles] = useState(String(RADIUS_DEFAULT_MILES));
  /* Nothing is marked missing until a confirm has been attempted: a panel that opens
     already showing errors reads as broken rather than as empty. */
  const [attempted, setAttempted] = useState(false);

  /**
   * Reset on open, not on mount — the panel stays mounted, so without this a planner who
   * edited North, cancelled, then opened East would find North's boundary under East's name.
   */
  useEffect(() => {
    if (!open) return;

    setMethod(initialMethod);
    setName(zone?.name || '');
    setAttempted(false);

    const shape = zone?.shape || null;
    if (shape?.kind === ZONE_SHAPE.BOUNDARY) {
      setPoints(shape.points);
      setCentreSiteId(null);
      setRadiusMiles(String(RADIUS_DEFAULT_MILES));
      return;
    }
    if (shape?.kind === ZONE_SHAPE.RADIUS) {
      setPoints([]);
      setCentreSiteId(shape.siteId || null);
      setRadiusMiles(String(shape.radiusMiles));
      return;
    }

    setPoints([]);
    setCentreSiteId(null);
    setRadiusMiles(String(RADIUS_DEFAULT_MILES));
  }, [open, zone, initialMethod]);

  const isBoundary = method === ZONE_SHAPE.BOUNDARY;
  const centreSite = centreSiteId ? sites.find((site) => site.id === centreSiteId) || null : null;
  const radiusNumber = Number(radiusMiles);
  const hasBoundary = points.length >= 3;
  const hasRadius = Boolean(centreSite) && Number.isFinite(radiusNumber) && radiusNumber > 0;
  const hasShape = isBoundary ? hasBoundary : hasRadius;
  const hasName = Boolean(name.trim());

  /**
   * One containment answer, handed to both the map and the summary — so the pins and the
   * count cannot disagree about whether a site is in.
   */
  const measured = useMemo(() => {
    return sites
      .map((site) => {
        if (!isBoundary) {
          if (!hasRadius) return { ...site, inside: false, outside: null };
          const miles = kmToMiles(distanceKm(centreSite, site));
          return { ...site, inside: miles <= radiusNumber, outside: miles - radiusNumber };
        }
        if (!hasBoundary) return { ...site, inside: false, outside: null };
        const inside = pointInRing(site, points);
        return { ...site, inside, outside: inside ? 0 : milesOutsideRing(site, points) };
      })
      .sort((a, b) => (a.outside ?? Infinity) - (b.outside ?? Infinity));
  }, [sites, isBoundary, points, centreSite, radiusNumber, hasRadius, hasBoundary]);

  const captured = measured.filter((site) => site.inside);
  const excluded = measured.filter((site) => !site.inside);
  const capturedIds = useMemo(() => new Set(captured.map((site) => site.id)), [captured]);

  /* Captured, plus the nearest few outside — the sites worth naming on the map. */
  const labelIds = useMemo(
    () => new Set([...captured.map((s) => s.id), ...excluded.slice(0, 4).map((s) => s.id)]),
    [captured, excluded],
  );

  /**
   * How far the chosen centre is from where every runsheet starts.
   *
   * The number the map cannot show: at a metro-wide zoom, a site forty miles from the depot
   * and one ten miles away look much the same, and the difference is an hour of the day.
   */
  const distanceFromBase = useMemo(() => {
    if (!centreSite || !basePoint) return null;
    return kmToMiles(distanceKm(basePoint, centreSite));
  }, [centreSite, basePoint]);

  const leaving = (currentSiteIds || []).filter((id) => !capturedIds.has(id));

  const switchMethod = (next) => {
    if (next === method) return;
    /* The shape is abandoned rather than converted: a dragged ring of points is not a site
       and a distance, and guessing one from the other would centre a zone somewhere the
       planner never chose. The name survives, because that is the part they typed. */
    setPoints([]);
    setCentreSiteId(null);
    setRadiusMiles(String(RADIUS_DEFAULT_MILES));
    setAttempted(false);
    setMethod(next);
  };

  const submit = () => {
    setAttempted(true);
    if (!hasName || !hasShape) return;

    const shape = isBoundary
      ? { kind: ZONE_SHAPE.BOUNDARY, points }
      : {
          kind: ZONE_SHAPE.RADIUS,
          siteId: centreSite.id,
          anchor: { address: centreSite.name, lat: centreSite.lat, lng: centreSite.lng },
          radiusMiles: clampRadiusMiles(radiusNumber),
        };

    onSave({
      name: name.trim(),
      shape,
      siteIds: captured.map((site) => site.id),
      releasing: leaving,
    });
  };

  const nameError = attempted && !hasName;
  const shapeMissing = attempted && !hasShape;

  /* Rendered by the map, in its bottom-right corner. */
  const switcher = (
    <>
      <Button
        className={`${classes.mapSwitcherOption} ${isBoundary ? classes.mapSwitcherOptionOn : ''}`}
        onClick={() => switchMethod(ZONE_SHAPE.BOUNDARY)}
        aria-pressed={isBoundary}
      >
        <BoundaryIcon />
        {tt('zoneMethodBoundary')}
      </Button>
      <Button
        className={`${classes.mapSwitcherOption} ${!isBoundary ? classes.mapSwitcherOptionOn : ''}`}
        onClick={() => switchMethod(ZONE_SHAPE.RADIUS)}
        aria-pressed={!isBoundary}
      >
        <RadiusIcon />
        {tt('zoneMethodRadius')}
      </Button>
    </>
  );

  const shared = {
    sites,
    capturedIds,
    labelIds,
    basePoint,
    otherZones,
    activeZoneName: name.trim() || tt('zoneUnnamed'),
    /**
     * The id as well as the name, because the map now colours this zone by **id**.
     *
     * The name is here for the caption and cannot do both jobs. `zoneColor` keys off the id
     * so that North is the same blue here as on the Harmonize map (see
     * `components/common/zonePalette`), and without the id the map has to infer the hue from
     * the typed name — which is exact for the four defaults and falls to the grey "no palette
     * slot" fallback the moment somebody *renames* a zone. Renaming North would have quietly
     * turned its territory grey while the zone itself was unchanged.
     *
     * `zone?.id` rather than a derived slug: a zone being created has no id yet, and `undefined`
     * is the honest answer there — the fallback grey is correct for a zone that does not exist
     * in the palette's table yet.
     */
    activeZoneId: zone?.id,
    invalid: shapeMissing,
    switcher,
  };

  return (
    <Box
      className={`${classes.panelSurface} ${open ? '' : classes.panelSurfaceClosed}`}
      role="region"
      aria-label={zone ? tt('zoneEditTitle', { name: zone.name }) : tt('zoneNewTitle')}
      aria-hidden={!open}
    >
      {/**
       * A heading, and then the content. No bordered header bar, no subtitle, no separator.
       *
       * The bar was chrome doing very little: a rule under a title, above a panel whose left
       * edge is already a border, and a line of prose repeating what the switcher and the map
       * hint say in context. Dropping it gives the map back about seventy pixels, which on a
       * fixed 400px surface is the difference between seeing a metro and seeing a county.
       *
       * The close control stays — it moves onto the heading's own row. The footer's Cancel
       * does the same thing, but a panel whose only exit is at the bottom of a scrolling body
       * is a panel a planner has to hunt their way out of.
       */}
      <Box className={classes.zonePanelBody}>
        <Box className={classes.zonePanelHeading}>
          <Typography variant="h4" className={classes.zonePanelTitle}>
            {zone ? tt('zoneEditTitle', { name: zone.name }) : tt('zoneNewTitle')}
          </Typography>
          <IconButton
            className={classes.zonePanelClose}
            onClick={onCancel}
            aria-label={tt('close')}
          >
            <CloseIcon />
          </IconButton>
        </Box>

        <Box className={classes.zoneField}>
          <Box className={classes.zoneFieldLabel}>
            <Typography
              variant="subtitle2"
              component="label"
              htmlFor="zone-name"
              className={classes.zoneFieldLabelText}
            >
              {tt('zoneNameLabel')}
            </Typography>
            <RequiredAsterik />
            {/* The asterisk says *that* it is required; the tooltip says why, which for a
                zone is not obvious — this is the name the day table's Zone column shows.

                **No `describeChild`**, the same correction the settings screen's two info
                buttons took: it clones `title` onto the child, so the OS tooltip fired behind
                MUI's own saying the same sentence. Verified — the button was carrying a `title`
                attribute. The tip is the button's `aria-label` now, matching `FieldLabel`. */}
            <Tooltip arrow placement="top" title={tt('zoneNameTip')} enterTouchDelay={0}>
              <Box
                component="button"
                type="button"
                className={classes.infoButton}
                aria-label={tt('zoneNameTip')}
              >
                <InfoIcon aria-hidden="true" />
              </Box>
            </Tooltip>
          </Box>
          <TextField
            id="zone-name"
            className={classes.zoneNameField}
            value={name}
            onChange={(event) => setName(event.target.value.slice(0, 40))}
            placeholder={tt('zoneNamePlaceholder')}
            error={nameError}
            helperText={nameError ? tt('zoneNameMissing') : null}
          />
        </Box>

        {/**
         * What the shape caught, directly under the name and above the map that produces it.
         *
         * It used to sit above the name field, which put a result before its own input: the
         * name is what a planner supplies, and Included is an answer to the drawing they do
         * afterwards, so reading it first is reading the answer to a question not yet asked.
         * Below the name it is also adjacent to the map, which is where the number changes —
         * a count that moves as you drag belongs next to the thing you are dragging, not
         * three controls away at the top of the panel.
         */}
        <ZoneIncluded captured={captured} hasShape={hasShape} />

        {isBoundary ? (
          <ZoneLassoExperience
            {...shared}
            points={points}
            onShapeDrawn={setPoints}
            onClear={() => setPoints([])}
          />
        ) : (
          <ZoneRadiusExperience
            {...shared}
            centreSite={centreSite}
            radiusMiles={radiusMiles}
            distanceFromBase={distanceFromBase}
            onSelectSite={(site) => setCentreSiteId(site?.id || null)}
            onRadiusChange={(value) => setRadiusMiles(value.replace(/[^\d]/g, '').slice(0, 3))}
            onRadiusBlur={() => setRadiusMiles(String(clampRadiusMiles(radiusMiles)))}
            onStep={(delta) =>
              setRadiusMiles(
                String(
                  clampRadiusMiles(
                    (Number.isFinite(radiusNumber) ? radiusNumber : RADIUS_DEFAULT_MILES) + delta,
                  ),
                ),
              )
            }
            /* Dragging the ring writes whole miles: the stored value is an integer, so a
               handle that reported 12.4 would snap on release and appear to jump. */
            onRadiusDragged={(miles) => setRadiusMiles(String(clampRadiusMiles(Math.round(miles))))}
          />
        )}
      </Box>

      <Box className={classes.zonePanelFooter}>
        {shapeMissing ? (
          <Typography variant="body3" className={classes.zoneMissingText}>
            {tt(isBoundary ? 'zoneBoundaryMissing' : 'zoneCentreMissing')}
          </Typography>
        ) : null}
        <Box className={classes.zonePanelFooterActions}>
          <Button variant="secondaryGrey" onClick={onCancel}>
            {tt('cancel')}
          </Button>
          {/* Live, not disabled: `submit` is what sets `attempted`, so a button that never
              fires is a button whose error messages never appear — and a greyed Confirm
              tells a planner no without telling them why. It returns early unless both
              answers are in, which is the guarantee the disabled state was giving. */}
          <Button variant="primary" onClick={submit}>
            {tt('zoneConfirm')}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

ZoneEditorPanel.propTypes = {
  open: PropTypes.bool,
  zone: PropTypes.object,
  initialMethod: PropTypes.string,
  sites: PropTypes.array.isRequired,
  basePoint: PropTypes.object,
  otherZones: PropTypes.array,
  currentSiteIds: PropTypes.array,
  onCancel: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};

export default ZoneEditorPanel;
