import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { distanceKm } from 'src/app/obx/pages/runSheets/buildRoute/helper';
/* The same keyless geocoding field the Start & End Location row uses — see the note at that
   import for why this reaches across into the workspace rather than growing a second one. */
import AddressSearchField from 'src/app/obx/pages/schedules/components/harmonize/components/AddressSearchField';

import { useStyles } from './harmonization.styles';
import {
  clampRadiusMiles,
  kmToMiles,
  RADIUS_DEFAULT_MILES,
  RADIUS_MAX_MILES,
  RADIUS_MIN_MILES,
} from './harmonizationSettings';
import ZoneIncluded from './ZoneIncluded';
import ZoneMap from './ZoneMap';

/**
 * One installation day's radius, edited over the page rather than beside it.
 *
 * **An overlay, not the side panel — and that is a deliberate split from Boundary.** The
 * boundary editor is a flat panel pinned to the right edge with the screen shifted over to
 * make room, argued for on the grounds that a zone is drawn *against* the zones that already
 * exist, so hiding them hides the context. A day's radius is not defined against a list: it
 * belongs to one row of one table and there is no list of radii to compare it with any more.
 * So it opens over the page, which is also what a control launched from inside a table cell
 * should do — a side panel launched from a table row leaves the row it belongs to off-screen.
 *
 * **Everything the panel's radius experience had, minus the parts that were about zones.**
 * No name field: a day's radius is identified by its day. No zone switcher: the solution is
 * already chosen upstream. What survives is the pair that actually defines the circle — a
 * centre and a reach — plus the readout of what it caught.
 *
 * Draft state, committed on Confirm. Escape and the backdrop are Cancel, the same reading
 * `LocationPickerDialog` takes: a half-placed circle should not be written by backing out.
 */

const DayRadiusDialog = ({
  open,
  dayLabel,
  radius,
  sites,
  basePoint,
  otherRadii,
  onCancel,
  onConfirm,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const tt = (key, options) =>
    t(`obx.settings.preferences.harmonization.${key}`, {
      ...options,
      interpolation: { escapeValue: false },
    });

  const [anchor, setAnchor] = useState(null);
  const [radiusMiles, setRadiusMiles] = useState(String(RADIUS_DEFAULT_MILES));
  const [attempted, setAttempted] = useState(false);
  /* Bumped by the seeding effect, not derived from the day — see the same note in
     `ZoneEditorPanel`: a token computed during render changes one commit before `anchor` is
     seeded, so the map would refit to the previous day's circle. */
  const [fitToken, setFitToken] = useState(0);

  /* Seeded on open rather than on mount: the dialog stays mounted between rows, so without
     this Tuesday would open holding Monday's circle. Same reasoning as `ZoneEditorPanel`. */
  useEffect(() => {
    if (!open) return;
    setAnchor(radius?.anchor || null);
    setRadiusMiles(String(radius?.radiusMiles ?? RADIUS_DEFAULT_MILES));
    setAttempted(false);
    setFitToken((previous) => previous + 1);
  }, [open, radius]);

  const radiusNumber = Number(radiusMiles);
  const hasCentre = Boolean(anchor);
  const hasRadius = hasCentre && Number.isFinite(radiusNumber) && radiusNumber > 0;
  const atRadiusMin = !hasCentre || radiusNumber <= RADIUS_MIN_MILES;
  const atRadiusMax = !hasCentre || radiusNumber >= RADIUS_MAX_MILES;

  /* One containment answer for both the pins and the readout, so the two cannot disagree —
     the same guarantee `ZoneEditorPanel` makes for the boundary editor. */
  const measured = useMemo(() => {
    return sites
      .map((site) => {
        if (!hasRadius) return { ...site, inside: false, outside: null };
        const miles = kmToMiles(distanceKm(anchor, site));
        return { ...site, inside: miles <= radiusNumber, outside: miles - radiusNumber };
      })
      .sort((a, b) => (a.outside ?? Infinity) - (b.outside ?? Infinity));
  }, [sites, anchor, radiusNumber, hasRadius]);

  const captured = measured.filter((site) => site.inside);
  const excluded = measured.filter((site) => !site.inside);
  const capturedIds = useMemo(() => new Set(captured.map((site) => site.id)), [captured]);
  const labelIds = useMemo(
    () => new Set([...captured.map((s) => s.id), ...excluded.slice(0, 4).map((s) => s.id)]),
    [captured, excluded],
  );

  /* The number the map cannot show: at a metro-wide zoom a centre forty miles out and one
     ten miles out look much the same, and the difference is an hour of the day. */
  const distanceFromBase = useMemo(() => {
    if (!anchor || !basePoint) return null;
    return kmToMiles(distanceKm(basePoint, anchor));
  }, [anchor, basePoint]);

  const submit = () => {
    setAttempted(true);
    if (!hasRadius) return;
    onConfirm({
      anchor: { address: anchor.address || '', lat: anchor.lat, lng: anchor.lng },
      radiusMiles: clampRadiusMiles(radiusNumber),
    });
  };

  const titleId = 'harmonization-day-radius-title';

  return (
    <Dialog
      open={open}
      onClose={onCancel}
      maxWidth="md"
      fullWidth
      aria-labelledby={titleId}
      PaperProps={{ 'aria-modal': 'true' }}
      classes={{ paper: classes.mapDialog }}
    >
      <DialogTitle id={titleId} className={classes.dayRadiusDialogTitle}>
        {tt('dayRadiusTitle', { day: dayLabel })}
      </DialogTitle>

      <DialogContent className={classes.dayRadiusDialogContent}>
        <Box className={classes.zoneRadiusInputs}>
          <Box className={`${classes.zoneField} ${classes.zoneFieldAnchored}`}>
            <Box className={classes.zoneFieldLabel}>
              <Typography variant="subtitle2" className={classes.zoneFieldLabelText}>
                {tt('zoneCentreLabel')}
              </Typography>
            </Box>
            {/* Keyed on the resolved value: the field is uncontrolled, so a centre written
                by clicking the map only reaches the box through a remount. */}
            <AddressSearchField
              key={anchor?.address || (hasCentre ? `${anchor.lat},${anchor.lng}` : 'empty')}
              id="day-radius-centre"
              placeholder={tt('zoneCentrePlaceholder')}
              defaultValue={anchor?.address || ''}
              onSelect={(location) => setAnchor(location)}
              showValueTitle
            />
            {/* **The instruction line is gone; only the consequence remains.** "Search an
                address above, or click the map" restated the field's own placeholder one line
                lower, so the field carried the same sentence twice. What is left populates
                once there is a centre — the distance from the depot, which is the fact the
                map cannot show. The slot keeps its height either way so placing a pin does
                not shove the map down. */}
            <Box className={classes.centreDistanceSlot}>
              {hasCentre && distanceFromBase !== null ? (
                <Typography variant="body3" className={classes.centrePlacedText}>
                  {tt('zoneCentreDistance', { miles: distanceFromBase.toFixed(1) })}
                </Typography>
              ) : null}
            </Box>
          </Box>

          <Box className={classes.zoneField}>
            <Box className={classes.zoneFieldLabel}>
              <Typography
                variant="subtitle2"
                component="label"
                htmlFor="day-radius-reach"
                className={classes.zoneFieldLabelText}
              >
                {tt('zoneRadiusLabel')}
              </Typography>
            </Box>
            <Box className={classes.zoneRadiusRow}>
              <Button
                className={classes.zoneStepButton}
                onClick={() =>
                  setRadiusMiles(
                    String(
                      clampRadiusMiles(
                        (Number.isFinite(radiusNumber) ? radiusNumber : RADIUS_DEFAULT_MILES) - 1,
                      ),
                    ),
                  )
                }
                disabled={atRadiusMin}
                aria-label={tt('zoneRadiusDown')}
              >
                &minus;
              </Button>
              <TextField
                id="day-radius-reach"
                className={classes.numberField}
                value={radiusMiles}
                onChange={(event) =>
                  setRadiusMiles(event.target.value.replace(/[^\d]/g, '').slice(0, 3))
                }
                onBlur={() => setRadiusMiles(String(clampRadiusMiles(radiusMiles)))}
                inputProps={{ inputMode: 'numeric' }}
                disabled={!hasCentre}
              />
              <Button
                className={classes.zoneStepButton}
                onClick={() =>
                  setRadiusMiles(
                    String(
                      clampRadiusMiles(
                        (Number.isFinite(radiusNumber) ? radiusNumber : RADIUS_DEFAULT_MILES) + 1,
                      ),
                    ),
                  )
                }
                disabled={atRadiusMax}
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
        </Box>

        <ZoneMap
          className={classes.dayRadiusMap}
          /* Each day's circle is a different thing to look at, so each open refits. */
          fitToken={fitToken}
          sites={sites}
          capturedIds={capturedIds}
          labelIds={labelIds}
          basePoint={basePoint}
          anchor={anchor}
          radiusMiles={hasRadius ? clampRadiusMiles(radiusNumber) : null}
          /* The other days' circles, so a planner placing Tuesday can see what Monday
             already covers — the same context the boundary editor gets from `otherZones`. */
          otherZones={otherRadii}
          activeZoneName={dayLabel}
          invalid={attempted && !hasRadius}
          interaction="select"
          hint={tt(hasCentre ? 'zoneHintCentreSet' : 'zoneHintCentre')}
          onDropPin={setAnchor}
          onRadiusDragged={
            hasCentre
              ? (miles) => setRadiusMiles(String(clampRadiusMiles(Math.round(miles))))
              : undefined
          }
        />

        {/* Under the map, not above it, and open rather than behind a chevron: this is the
            list a planner reads *against* the pins, so it belongs next to them and should not
            cost a click to see. */}
        <ZoneIncluded
          captured={captured}
          hasShape={hasRadius}

          title={tt('visitsInRadius')}
          emptyText={tt('visitsInRadiusEmpty')}
        />
      </DialogContent>

      <DialogActions className={classes.mapDialogActions}>
        {attempted && !hasRadius ? (
          <Typography variant="body3" className={classes.zoneMissingText}>
            {tt('zoneCentreMissing')}
          </Typography>
        ) : null}
        <Box className={classes.zonePanelFooterActions}>
          <Button variant="secondaryGrey" onClick={onCancel}>
            {tt('cancel')}
          </Button>
          {/* Live rather than disabled: this press is what makes the missing-centre message
              appear, so a button that never fires is one whose error never arrives. */}
          <Button variant="primary" onClick={submit}>
            {tt('dayRadiusConfirm')}
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

DayRadiusDialog.propTypes = {
  open: PropTypes.bool,
  dayLabel: PropTypes.string,
  radius: PropTypes.object,
  sites: PropTypes.array.isRequired,
  basePoint: PropTypes.object,
  otherRadii: PropTypes.array,
  onCancel: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
};

export default DayRadiusDialog;
