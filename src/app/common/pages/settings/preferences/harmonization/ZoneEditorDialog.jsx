import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from '@mui/material';
import PropTypes from 'prop-types';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { distanceKm } from 'src/app/obx/pages/runSheets/buildRoute/helper';
import { pointInRing } from 'src/app/obx/pages/schedules/components/harmonize/tileProjection';

import { useStyles } from './harmonization.styles';
import {
  clampRadiusMiles,
  kmToMiles,
  RADIUS_MAX_MILES,
  RADIUS_MIN_MILES,
  ZONE_SHAPE,
} from './harmonizationSettings';
import { BoundaryIcon, RadiusIcon } from './ZoneGlyphs';
import ZoneMap from './ZoneMap';

/**
 * Where a zone gets its sites.
 *
 * **One dialog, two methods**, because they are two ways of answering one question. A
 * planner who drew a boundary and then wants to try a distance instead should not have to
 * cancel, hunt for a different button and retype the name — switching method keeps both,
 * and seeds the radius at the boundary's own centre so the map does not jump.
 *
 * **What is actually being edited is site membership, not the shape.** The shape is stored
 * so the zone can be reopened and redrawn, but the thing that changes the plan is which
 * sites come out the other side (see `zoneOfSite`). That is why the readout is half the
 * dialog rather than a status line: a boundary is a *guess* until it says what it caught,
 * and "Fairmont Office Tower is 1.3 miles outside" is an argument for moving the edge
 * where "3 sites" is an argument for nothing.
 *
 * **Saving replaces the zone's membership**, so sites that were in it and are no longer
 * inside the shape end up in no zone at all. That is the honest reading of "redraw the
 * boundary" and it is destructive, so it is stated in the dialog before Save rather than
 * discovered in the coverage panel afterwards.
 */

const MILES_PER_DEGREE_LAT = 69.0;
const READOUT_LIMIT = 6;

/**
 * How many *excluded* sites get a name on the map.
 *
 * The captured ones are always named — they are the answer. Beyond them only the nearest
 * few matter, because those are the sites the next nudge of the shape would take, and they
 * are the ones the readout's second column already lists. Labelling the rest turned a
 * clustered metro into a grey smear.
 */
const LABELLED_OUTSIDE = 4;

/**
 * How far outside the shape a site is, in miles.
 *
 * For a radius that is just the distance to the anchor less the radius. For a boundary it
 * is the distance to the nearest *edge* — not to the nearest vertex, which is the mistake
 * that reports a site as far away when it is a hair outside the middle of a long side, and
 * not to the centroid, which is meaningless for anything concave.
 *
 * Done on a flat projection about the point itself: the fixture's own geography is a flat
 * grid in miles, so anything more precise would be claiming an accuracy the underlying
 * coordinates do not have.
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
    /* A degenerate edge — two points dropped on the same spot — collapses to its own
       endpoint rather than dividing by zero. */
    const t = lengthSquared
      ? Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / lengthSquared))
      : 0;
    const distance = Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
    if (distance < best) best = distance;
  }

  return Number.isFinite(best) ? best : null;
};

const centroidOf = (points) => {
  if (!points.length) return null;
  return {
    lat: points.reduce((total, point) => total + Number(point.lat), 0) / points.length,
    lng: points.reduce((total, point) => total + Number(point.lng), 0) / points.length,
  };
};

const ZoneEditorDialog = ({
  open,
  zone,
  initialMode,
  sites,
  basePoint,
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

  const [mode, setMode] = useState(initialMode);
  const [name, setName] = useState('');
  const [points, setPoints] = useState([]);
  const [anchor, setAnchor] = useState(null);
  const [radiusMiles, setRadiusMiles] = useState(String(RADIUS_MIN_MILES));

  /**
   * Reset on open rather than on mount.
   *
   * The dialog stays mounted between openings, so without this a planner who edited North,
   * cancelled, then opened East would be shown North's boundary under East's name.
   */
  useEffect(() => {
    if (!open) return;

    setMode(initialMode);
    setName(zone?.name || '');

    const shape = zone?.shape || null;
    if (shape?.kind === ZONE_SHAPE.BOUNDARY) {
      setPoints(shape.points);
      setAnchor(null);
      setRadiusMiles('10');
      return;
    }
    if (shape?.kind === ZONE_SHAPE.RADIUS) {
      setPoints([]);
      setAnchor(shape.anchor);
      setRadiusMiles(String(shape.radiusMiles));
      return;
    }

    setPoints([]);
    setAnchor(null);
    setRadiusMiles('10');
  }, [open, zone, initialMode]);

  const radiusNumber = Number(radiusMiles);
  const hasRadius = anchor && Number.isFinite(radiusNumber) && radiusNumber > 0;
  const hasBoundary = points.length >= 3;

  /**
   * One containment answer, used by the map and the readout both.
   *
   * Computed here rather than in `ZoneMap` so the pins and the list cannot end up
   * disagreeing about whether a site is in — which is the class of bug where a planner
   * saves a zone that looks right on the map and holds something else.
   */
  const measured = useMemo(() => {
    return sites
      .map((site) => {
        if (mode === ZONE_SHAPE.RADIUS) {
          if (!hasRadius) return { ...site, inside: false, outside: null };
          const miles = kmToMiles(distanceKm(anchor, site));
          return {
            ...site,
            inside: miles <= radiusNumber,
            outside: miles - radiusNumber,
            distance: miles,
          };
        }

        if (!hasBoundary) return { ...site, inside: false, outside: null };
        const inside = pointInRing(site, points);
        return {
          ...site,
          inside,
          outside: inside ? 0 : milesOutsideRing(site, points),
        };
      })
      .sort((a, b) => (a.outside ?? Infinity) - (b.outside ?? Infinity));
  }, [sites, mode, points, anchor, radiusNumber, hasRadius, hasBoundary]);

  const captured = measured.filter((site) => site.inside);
  const excluded = measured.filter((site) => !site.inside);
  const capturedIds = useMemo(() => new Set(captured.map((site) => site.id)), [captured]);

  /* Captured, plus the nearest few outside — the same set, in the same order, that the
     readout lists. `measured` is already sorted nearest-first. */
  const labelIds = useMemo(
    () =>
      new Set([
        ...captured.map((site) => site.id),
        ...excluded.slice(0, LABELLED_OUTSIDE).map((site) => site.id),
      ]),
    [captured, excluded],
  );
  const capturedFilters = captured.reduce((total, site) => total + (Number(site.filters) || 0), 0);

  /**
   * Sites this zone holds today that the shape does not catch.
   *
   * The destructive half of Save, named before it happens. A planner redrawing North to
   * add one site should not silently lose two others off the far edge.
   */
  const leaving = (currentSiteIds || []).filter((id) => !capturedIds.has(id));
  const leavingNames = leaving
    .map((id) => sites.find((site) => site.id === id)?.name)
    .filter(Boolean);

  const hasShape = mode === ZONE_SHAPE.RADIUS ? hasRadius : hasBoundary;
  const canSave = Boolean(name.trim()) && hasShape;

  const pickPoint = (latLng) => {
    if (mode === ZONE_SHAPE.RADIUS) {
      /* **An empty address, not a placeholder sentence.** Writing the words "a dropped pin"
         into `address` stores display copy in a data field: it would be saved in whatever
         language the planner happened to be using, and every reader downstream would have
         to know that one particular string is not an address. Empty means "no address
         known", and the row that displays it supplies the wording. */
      setAnchor({ address: '', lat: latLng.lat, lng: latLng.lng });
      return;
    }
    setPoints((previous) => [...previous, { lat: latLng.lat, lng: latLng.lng }]);
  };

  const switchMode = (next) => {
    if (next === mode) return;
    /* Carry the geography across rather than starting from nothing: a radius seeded at the
       boundary's own centre lands where the planner was already looking. */
    if (next === ZONE_SHAPE.RADIUS && !anchor) {
      const centre = centroidOf(points) || basePoint;
      if (centre) setAnchor({ address: '', lat: centre.lat, lng: centre.lng });
    }
    setMode(next);
  };

  const stepRadius = (delta) =>
    setRadiusMiles(
      String(clampRadiusMiles((Number.isFinite(radiusNumber) ? radiusNumber : 10) + delta)),
    );

  const hint =
    mode === ZONE_SHAPE.RADIUS
      ? tt(anchor ? 'zoneHintAnchorSet' : 'zoneHintAnchor')
      : tt(hasBoundary ? 'zoneHintBoundaryMore' : 'zoneHintBoundary', { points: points.length });

  const submit = () => {
    const shape =
      mode === ZONE_SHAPE.RADIUS
        ? { kind: ZONE_SHAPE.RADIUS, anchor, radiusMiles: clampRadiusMiles(radiusNumber) }
        : { kind: ZONE_SHAPE.BOUNDARY, points };

    onSave({
      name: name.trim(),
      shape,
      siteIds: captured.map((site) => site.id),
      releasing: leaving,
    });
  };

  const readoutRow = (site, meta) => (
    <Box key={site.id} className={classes.zoneReadoutRow}>
      <Typography variant="body2" className={classes.zoneReadoutName}>
        {site.name}
      </Typography>
      <Typography variant="body3" className={classes.zoneReadoutMeta}>
        {meta}
      </Typography>
    </Box>
  );

  return (
    <Dialog
      open={open}
      onClose={onCancel}
      maxWidth="md"
      fullWidth
      aria-labelledby="zone-editor-title"
      PaperProps={{ 'aria-modal': 'true' }}
      classes={{ paper: classes.mapDialog }}
    >
      <DialogTitle id="zone-editor-title" className={classes.mapDialogTitle}>
        {zone ? tt('zoneEditTitle', { name: zone.name }) : tt('zoneNewTitle')}
      </DialogTitle>

      <DialogContent className={classes.zoneDialogContent}>
        <Typography variant="body2" className={classes.mapDialogText}>
          {tt('zoneEditorText')}
        </Typography>

        <Box className={classes.zoneModeGroup} role="group" aria-label={tt('zoneMethod')}>
          <Button
            className={`${classes.zoneModeButton} ${
              mode === ZONE_SHAPE.BOUNDARY ? classes.zoneModeButtonOn : ''
            }`}
            onClick={() => switchMode(ZONE_SHAPE.BOUNDARY)}
            aria-pressed={mode === ZONE_SHAPE.BOUNDARY}
          >
            <BoundaryIcon />
            {tt('zoneMethodBoundary')}
          </Button>
          <Button
            className={`${classes.zoneModeButton} ${
              mode === ZONE_SHAPE.RADIUS ? classes.zoneModeButtonOn : ''
            }`}
            onClick={() => switchMode(ZONE_SHAPE.RADIUS)}
            aria-pressed={mode === ZONE_SHAPE.RADIUS}
          >
            <RadiusIcon />
            {tt('zoneMethodRadius')}
          </Button>
        </Box>

        <Box className={classes.zoneEditorTools}>
          <Box className={classes.zoneEditorField}>
            <Typography
              variant="subtitle2"
              component="label"
              htmlFor="zone-name"
              className={classes.zoneEditorLabel}
            >
              {tt('zoneNameLabel')}
            </Typography>
            <TextField
              id="zone-name"
              className={classes.zoneNameField}
              value={name}
              onChange={(event) => setName(event.target.value.slice(0, 40))}
              placeholder={tt('zoneNamePlaceholder')}
            />
          </Box>

          {mode === ZONE_SHAPE.RADIUS ? (
            <Box className={classes.zoneEditorField}>
              <Typography
                variant="subtitle2"
                component="label"
                htmlFor="zone-radius"
                className={classes.zoneEditorLabel}
              >
                {tt('zoneRadiusLabel')}
              </Typography>
              <Box className={classes.zoneRadiusRow}>
                <Button
                  className={classes.zoneStepButton}
                  onClick={() => stepRadius(-1)}
                  disabled={radiusNumber <= RADIUS_MIN_MILES}
                  aria-label={tt('zoneRadiusDown')}
                >
                  &minus;
                </Button>
                <TextField
                  id="zone-radius"
                  className={classes.numberField}
                  value={radiusMiles}
                  onChange={(event) => {
                    const digits = event.target.value.replace(/[^\d]/g, '').slice(0, 3);
                    setRadiusMiles(digits);
                  }}
                  onBlur={() => setRadiusMiles(String(clampRadiusMiles(radiusMiles)))}
                  inputProps={{ inputMode: 'numeric' }}
                />
                <Button
                  className={classes.zoneStepButton}
                  onClick={() => stepRadius(1)}
                  disabled={radiusNumber >= RADIUS_MAX_MILES}
                  aria-label={tt('zoneRadiusUp')}
                >
                  +
                </Button>
                <Typography variant="body2" className={classes.unit}>
                  {tt('miles')}
                </Typography>
                <Typography variant="body3" className={classes.rangeText}>
                  {tt('radiusRange', { min: RADIUS_MIN_MILES, max: RADIUS_MAX_MILES })}
                </Typography>
              </Box>
            </Box>
          ) : (
            <Box className={classes.zoneRadiusRow}>
              <Button
                variant="secondaryGrey"
                onClick={() => setPoints((previous) => previous.slice(0, -1))}
                disabled={!points.length}
              >
                {tt('zoneUndoPoint')}
              </Button>
              <Button
                variant="tertiaryGrey"
                onClick={() => setPoints([])}
                disabled={!points.length}
              >
                {tt('zoneClear')}
              </Button>
            </Box>
          )}
        </Box>

        <ZoneMap
          sites={sites}
          capturedIds={capturedIds}
          labelIds={labelIds}
          basePoint={basePoint}
          points={mode === ZONE_SHAPE.BOUNDARY ? points : []}
          anchor={mode === ZONE_SHAPE.RADIUS ? anchor : null}
          radiusMiles={mode === ZONE_SHAPE.RADIUS ? radiusNumber : null}
          hint={hint}
          onPick={pickPoint}
        />

        <Box className={classes.zoneReadout}>
          <Box className={classes.zoneReadoutColumn}>
            <Box className={classes.zoneReadoutHead}>
              <Typography variant="subtitle3" className={classes.zoneReadoutHeadLabel}>
                {tt('zoneCaptured')}
              </Typography>
              <Typography variant="subtitle2" className={classes.zoneReadoutCount}>
                {tt('zoneCapturedCount', { sites: captured.length, filters: capturedFilters })}
              </Typography>
            </Box>
            {captured.length ? (
              <Box className={classes.zoneReadoutList}>
                {captured.map((site) =>
                  readoutRow(
                    site,
                    tt('zoneSiteMeta', { company: site.company, filters: site.filters }),
                  ),
                )}
              </Box>
            ) : (
              <Typography variant="body2" className={classes.zoneReadoutEmpty}>
                {tt(hasShape ? 'zoneCapturedNone' : 'zoneCapturedNoShape')}
              </Typography>
            )}
          </Box>

          <Box className={classes.zoneReadoutColumn}>
            <Box className={classes.zoneReadoutHead}>
              <Typography variant="subtitle3" className={classes.zoneReadoutHeadLabel}>
                {tt('zoneNearest')}
              </Typography>
            </Box>
            {excluded.length ? (
              <Box className={classes.zoneReadoutList}>
                {excluded
                  .slice(0, READOUT_LIMIT)
                  .map((site) =>
                    readoutRow(
                      site,
                      site.outside === null
                        ? site.company
                        : tt('zoneOutsideBy', { miles: site.outside.toFixed(1) }),
                    ),
                  )}
              </Box>
            ) : (
              <Typography variant="body2" className={classes.zoneReadoutEmpty}>
                {tt('zoneNearestNone')}
              </Typography>
            )}
          </Box>
        </Box>

        {leavingNames.length ? (
          <Box className={classes.coverageBand}>
            <Box className={classes.coverageText}>
              <Typography variant="subtitle2" className={classes.coverageTitle}>
                {tt('zoneLeavingTitle', { sites: leavingNames.length })}
              </Typography>
              <Typography variant="body2" className={classes.coverageBody}>
                {tt('zoneLeavingText', { names: leavingNames.join(', ') })}
              </Typography>
            </Box>
          </Box>
        ) : null}
      </DialogContent>

      <DialogActions className={classes.zoneEditorActions}>
        <Button variant="secondaryGrey" onClick={onCancel}>
          {tt('cancel')}
        </Button>
        <Button variant="primary" onClick={submit} disabled={!canSave}>
          {tt('zoneSave')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

ZoneEditorDialog.propTypes = {
  open: PropTypes.bool,
  zone: PropTypes.object,
  initialMode: PropTypes.string,
  sites: PropTypes.array.isRequired,
  basePoint: PropTypes.object,
  currentSiteIds: PropTypes.array,
  onCancel: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};

export default ZoneEditorDialog;
