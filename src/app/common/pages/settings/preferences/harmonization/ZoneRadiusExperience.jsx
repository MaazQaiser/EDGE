import { Box, Button, TextField, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import React from 'react';
import { useTranslation } from 'react-i18next';
/* The same keyless geocoding field the Start & End Location row uses. Reached across from
   the workspace for the reason recorded at that import: the alternative is a second address
   typeahead that drifts from this one. */
import AddressSearchField from 'src/app/obx/pages/schedules/components/harmonize/components/AddressSearchField';

import { useStyles } from './harmonization.styles';
import { clampRadiusMiles, RADIUS_MAX_MILES, RADIUS_MIN_MILES } from './harmonizationSettings';
import ZoneMap from './ZoneMap';

/**
 * Setting a zone as a distance around a point the planner drops on the map.
 *
 * The other experience behind the switcher, and genuinely different rather than the lasso
 * with its controls swapped. Two decisions shape it:
 *
 * **The centre is a dropped pin, not a site — a reversal.** It used to be chosen from the
 * site book, in a dropdown or by clicking a pin, on the argument that "ten miles around
 * Kelvin Court Offices" is a sentence a planner can check while "12 mi around a dropped pin"
 * is not. Reversed at the user's direction, and the reason it loses is that a territory's
 * centre is usually *not* a site: it is a depot, a junction, the middle of a city. Snapping
 * to the nearest site meant the shape a planner wanted was one the control refused to make.
 * The dropdown is gone with it — there is nothing to pick from a list any more, and the map
 * is now the only input, which is the same shape the lasso experience already has.
 *
 * **The distance from where runsheets start is shown, because the map hides it.** A zone
 * centred forty miles from the depot spends eighty miles of the day before a filter is
 * changed, and at a metro-wide zoom that is invisible. It survives the change to a pin
 * unaltered — it was never a fact about the *site*, only about the point.
 */

const ZoneRadiusExperience = ({
  sites,
  anchor,
  radiusMiles,
  distanceFromBase,
  capturedIds,
  labelIds,
  basePoint,
  otherZones,
  activeZoneName,
  activeZoneId,
  invalid,
  switcher,
  fitToken,
  onDropPin,
  onClearPin,
  onRadiusChange,
  onRadiusBlur,
  onStep,
  onRadiusDragged,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const tt = (key, options) =>
    t(`obx.settings.preferences.harmonization.${key}`, {
      ...options,
      interpolation: { escapeValue: false },
    });

  const radiusNumber = Number(radiusMiles);
  const hasCentre = Boolean(anchor);
  const hasRadius = hasCentre && Number.isFinite(radiusNumber) && radiusNumber > 0;
  /* Named once each: the button needs the answer for `disabled` and again for the spent
     styling that travels inline beside it. */
  const atRadiusMin = !hasCentre || radiusNumber <= RADIUS_MIN_MILES;
  const atRadiusMax = !hasCentre || radiusNumber >= RADIUS_MAX_MILES;

  return (
    <>
      {/**
       * **Two ways into the same point: search for it, or click the map.**
       *
       * The centre was briefly a readout with no control at all — the map was the only input
       * — which is right about where a pin gets *placed* and wrong about how a planner finds
       * the place to put it. A territory is usually described by an address before it is
       * described by a position on a tile, and panning a metro-scale map to a street you
       * could have typed is the slow way round.
       *
       * So this is the same `AddressSearchField` the Start & End Location row uses: keyless
       * Photon geocoding over the same OpenStreetMap data the tiles come from, so a searched
       * address lands where the map draws it. Selecting a result drops the pin; clicking the
       * map still moves it, and the field re-seeds from whatever the pin currently is.
       *
       * `key` on the resolved address for the reason the settings row already records — the
       * field is uncontrolled, so writing a value has to remount it for the box to show it.
       */}
      <Box className={classes.zoneRadiusInputs}>
        <Box className={classes.zoneField}>
          <Box className={classes.zoneFieldLabel}>
            <Typography variant="subtitle2" className={classes.zoneFieldLabelText}>
              {tt('zoneCentreLabel')}
            </Typography>
          </Box>
          <AddressSearchField
            key={anchor?.address || (hasCentre ? `${anchor.lat},${anchor.lng}` : 'empty')}
            id="zone-centre"
            placeholder={tt('zoneCentrePlaceholder')}
            defaultValue={anchor?.address || ''}
            onSelect={(location) => onDropPin(location)}
            showValueTitle
          />
          {hasCentre ? (
            <Box className={classes.centrePlaced}>
              <Typography variant="body2" className={classes.centrePlacedText}>
                {distanceFromBase !== null
                  ? tt('zoneCentreDistance', { miles: distanceFromBase.toFixed(1) })
                  : tt('zoneCentreDropped')}
              </Typography>
              {/* Clearing is the only verb a placed pin needs — moving it is another click on
                  the map or another search, the same way redrawing a boundary replaces it
                  rather than editing it. Matches `zoneClear` in the lasso experience. */}
              <Button variant="tertiaryGrey" onClick={onClearPin}>
                {tt('zoneClear')}
              </Button>
            </Box>
          ) : (
            <Typography variant="body3" className={classes.rangeText}>
              {tt('zoneCentreHint')}
            </Typography>
          )}
        </Box>

        <Box className={classes.zoneField}>
          <Box className={classes.zoneFieldLabel}>
            <Typography
              variant="subtitle2"
              component="label"
              htmlFor="zone-radius"
              className={classes.zoneFieldLabelText}
            >
              {tt('zoneRadiusLabel')}
            </Typography>
          </Box>
          <Box className={classes.zoneRadiusRow}>
            <Button
              className={classes.zoneStepButton}
              onClick={() => onStep(-1)}
              disabled={atRadiusMin}
              aria-label={tt('zoneRadiusDown')}
            >
              &minus;
            </Button>
            <TextField
              id="zone-radius"
              className={classes.numberField}
              value={radiusMiles}
              onChange={(event) => onRadiusChange(event.target.value)}
              onBlur={onRadiusBlur}
              inputProps={{ inputMode: 'numeric' }}
              disabled={!hasCentre}
            />
            <Button
              className={classes.zoneStepButton}
              onClick={() => onStep(1)}
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
        sites={sites}
        capturedIds={capturedIds}
        labelIds={labelIds}
        basePoint={basePoint}
        anchor={anchor}
        radiusMiles={hasRadius ? clampRadiusMiles(radiusNumber) : null}
        otherZones={otherZones}
        /* The id travels beside the name because the map colours a zone by **id**, not by what
           it is called — see `zonePalette`. Forwarded explicitly rather than by spreading
           `shared`: these components destructure a fixed prop list, which is what silently
           swallowed `activeZoneId` the first time it was added at the panel and made a
           *renamed* zone fall to the palette's grey fallback while the zone was unchanged. */
        activeZoneName={activeZoneName}
        activeZoneId={activeZoneId}
        invalid={invalid}
        interaction="select"
        hint={tt(hasCentre ? 'zoneHintCentreSet' : 'zoneHintCentre')}
        switcher={switcher}
        fitToken={fitToken}
        onDropPin={onDropPin}
        onRadiusDragged={hasCentre ? onRadiusDragged : undefined}
      />
    </>
  );
};

ZoneRadiusExperience.propTypes = {
  sites: PropTypes.array.isRequired,
  anchor: PropTypes.object,
  radiusMiles: PropTypes.string.isRequired,
  distanceFromBase: PropTypes.number,
  capturedIds: PropTypes.object,
  labelIds: PropTypes.object,
  basePoint: PropTypes.object,
  otherZones: PropTypes.array,
  activeZoneName: PropTypes.string,
  activeZoneId: PropTypes.string,
  invalid: PropTypes.bool,
  switcher: PropTypes.node,
  fitToken: PropTypes.any,
  onDropPin: PropTypes.func.isRequired,
  onClearPin: PropTypes.func.isRequired,
  onRadiusChange: PropTypes.func.isRequired,
  onRadiusBlur: PropTypes.func.isRequired,
  onStep: PropTypes.func.isRequired,
  onRadiusDragged: PropTypes.func.isRequired,
};

export default ZoneRadiusExperience;
