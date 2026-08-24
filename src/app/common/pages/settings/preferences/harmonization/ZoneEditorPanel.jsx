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
import ZoneIncluded from './ZoneIncluded';
import ZoneLassoExperience from './ZoneLassoExperience';
import ZoneMethodMenu from './ZoneMethodMenu';
import ZoneRadiusExperience from './ZoneRadiusExperience';

/**
 * Where a zone gets its sites — a flat panel beside the list it is joining.
 *
 * **Not a drawer.** It is fixed to the right edge, full height, and the screen moves over to
 * make room (`wrapperShifted`) instead of being dimmed behind a scrim. A zone is defined
 * *against* the zones that already exist, so hiding them was hiding the context.
 *
 * **The panel owns the name, the gate, and the containment maths.** How an area is chosen —
 * dragged as a boundary, or measured out from a dropped pin — belongs to the two experiences,
 * which are separate interfaces rather than modes of one: one has no notion of a centre, the
 * other no notion of a ring of points. The switcher between them floats on the map, because
 * what it changes is how the map behaves.
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
  /* The dropped pin, as `{ lat, lng }` — not a site id. See `sanitiseZoneShape`'s note on
     why the centre stopped having to be a site. */
  const [anchor, setAnchor] = useState(null);
  const [radiusMiles, setRadiusMiles] = useState(String(RADIUS_DEFAULT_MILES));
  /* Nothing is marked missing until a confirm has been attempted: a panel that opens
     already showing errors reads as broken rather than as empty. */
  const [attempted, setAttempted] = useState(false);
  /**
   * Bumped by the seeding effect below, and the *only* thing that refits the map.
   *
   * Not derived from `zone.id`, and that ordering is the whole point. React runs child
   * effects before the parent's, so a token computed during render changes on the same pass
   * the zone does — one render *before* this effect has seeded `points`. The map would refit,
   * correctly, to the shape it was still holding: the previous zone's. Bumping it here means
   * the token and the new shape land in the same commit.
   */
  const [fitToken, setFitToken] = useState(0);

  /**
   * Reset on open, not on mount — the panel stays mounted, so without this a planner who
   * edited North, cancelled, then opened East would find North's boundary under East's name.
   */
  useEffect(() => {
    if (!open) return;

    setMethod(initialMethod);
    setName(zone?.name || '');
    setAttempted(false);

    /* Every field resets to its own empty state first, rather than each branch clearing the
       others: branching off a `return` the way this once did leaves the untouched kind's
       leftovers in place the moment a third shape is added back. */
    setPoints([]);
    setAnchor(null);
    setRadiusMiles(String(RADIUS_DEFAULT_MILES));

    const shape = zone?.shape || null;
    if (shape?.kind === ZONE_SHAPE.BOUNDARY) {
      setPoints(shape.points);
    } else if (shape?.kind === ZONE_SHAPE.RADIUS) {
      /* `anchor` is the whole answer now. A rule saved under the site-centred model still
         carries the coordinates of whatever site it was centred on, so its circle reopens
         exactly where it was — the `siteId` beside it is simply not read. */
      setAnchor(shape.anchor || null);
      setRadiusMiles(String(shape.radiusMiles));
    }

    setFitToken((previous) => previous + 1);
  }, [open, zone, initialMethod]);

  const isBoundary = method === ZONE_SHAPE.BOUNDARY;
  const radiusNumber = Number(radiusMiles);
  const hasBoundary = points.length >= 3;
  const hasRadius = Boolean(anchor) && Number.isFinite(radiusNumber) && radiusNumber > 0;
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
          const miles = kmToMiles(distanceKm(anchor, site));
          return { ...site, inside: miles <= radiusNumber, outside: miles - radiusNumber };
        }
        if (!hasBoundary) return { ...site, inside: false, outside: null };
        const inside = pointInRing(site, points);
        return { ...site, inside, outside: inside ? 0 : milesOutsideRing(site, points) };
      })
      .sort((a, b) => (a.outside ?? Infinity) - (b.outside ?? Infinity));
  }, [sites, isBoundary, points, anchor, radiusNumber, hasRadius, hasBoundary]);

  const captured = measured.filter((site) => site.inside);
  const excluded = measured.filter((site) => !site.inside);
  const capturedIds = useMemo(() => new Set(captured.map((site) => site.id)), [captured]);

  /* Captured, plus the nearest few outside — the sites worth naming on the map. */
  const labelIds = useMemo(
    () => new Set([...captured.map((s) => s.id), ...excluded.slice(0, 4).map((s) => s.id)]),
    [captured, excluded],
  );

  /**
   * How far the dropped pin is from where every runsheet starts.
   *
   * The number the map cannot show: at a metro-wide zoom, a centre forty miles from the depot
   * and one ten miles away look much the same, and the difference is an hour of the day.
   */
  const distanceFromBase = useMemo(() => {
    if (!anchor || !basePoint) return null;
    return kmToMiles(distanceKm(basePoint, anchor));
  }, [anchor, basePoint]);

  const leaving = (currentSiteIds || []).filter((id) => !capturedIds.has(id));

  const switchMethod = (next) => {
    if (next === method) return;
    /* The shape is abandoned rather than converted: a dragged ring of points is not a centre
       and a distance, and guessing one from the other would give a zone a territory the
       planner never chose. The name survives, because that is the part they typed. */
    setPoints([]);
    setAnchor(null);
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
          /* No `address`: nothing reverse-geocodes a dropped pin on this screen, and writing
             an empty string would be a field that looks populated and is not. `sanitiseLocation`
             defaults it, so the stored shape stays the same shape either way. */
          anchor: { lat: anchor.lat, lng: anchor.lng },
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
    <ZoneMethodMenu value={method} onChange={switchMethod} ariaLabel={tt('zoneMethod')} />
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
    /* Refits the map each time the panel opens on a different zone. Without it the view is
       whatever the last pan left it, and a zone whose boundary sits outside that view opens
       looking undrawn — see `fitToken` in `ZoneMap`. */
    fitToken,
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
            anchor={anchor}
            radiusMiles={radiusMiles}
            distanceFromBase={distanceFromBase}
            onDropPin={setAnchor}
            onClearPin={() => setAnchor(null)}
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

        {/**
         * What the shape caught — **under the map now, and no longer a disclosure.**
         *
         * It sat between the name field and the map, collapsed behind a chevron. Two things
         * were wrong with that once the radius dialog settled the pattern: a result printed
         * *above* the control that produces it is read before the question is asked, and the
         * list is what a planner checks against the pins, so a click between the two is a
         * click between a question and its own answer. Same component, same props the dialog
         * passes — one shape for "what did this catch" wherever it is asked.
         */}
        <ZoneIncluded
          captured={captured}
          hasShape={hasShape}

          title={tt(isBoundary ? 'visitsInBoundary' : 'visitsInRadius')}
          emptyText={tt(isBoundary ? 'visitsInBoundaryEmpty' : 'visitsInRadiusEmpty')}
        />
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
