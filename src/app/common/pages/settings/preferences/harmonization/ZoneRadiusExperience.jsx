import { Box, Button, MenuItem, Select, TextField, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { useStyles } from './harmonization.styles';
import { clampRadiusMiles, RADIUS_MAX_MILES, RADIUS_MIN_MILES } from './harmonizationSettings';
import ZoneMap from './ZoneMap';

/**
 * Setting a zone as a distance around one of the sites.
 *
 * The other experience behind the switcher, and genuinely different rather than the lasso
 * with its controls swapped. Two decisions shape it:
 *
 * **The centre is a site, not a point.** A radius zone is "ten miles around Kelvin Court
 * Offices" — a sentence a planner can check. Letting them drop a pin anywhere produced
 * "12 mi around a dropped pin", which is a zone nobody can verify and which no downstream
 * screen can name. So the centre is chosen from the book, either in the dropdown or by
 * clicking a pin on the map, and the two are the same act.
 *
 * **The distance from where runsheets start is shown, because the map hides it.** A zone
 * centred forty miles from the depot spends eighty miles of the day before a filter is
 * changed, and at a metro-wide zoom that is invisible.
 */

const ZoneRadiusExperience = ({
  sites,
  centreSite,
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
  onSelectSite,
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
  const hasCentre = Boolean(centreSite);
  const hasRadius = hasCentre && Number.isFinite(radiusNumber) && radiusNumber > 0;
  /* Named once each: the button needs the answer for `disabled` and again for the spent
     styling that travels inline beside it. */
  const atRadiusMin = !hasCentre || radiusNumber <= RADIUS_MIN_MILES;
  const atRadiusMax = !hasCentre || radiusNumber >= RADIUS_MAX_MILES;

  return (
    <>
      <Box className={classes.zoneRadiusInputs}>
        <Box className={classes.zoneField}>
          <Box className={classes.zoneFieldLabel}>
            <Typography variant="subtitle2" className={classes.zoneFieldLabelText}>
              {tt('zoneCentreLabel')}
            </Typography>
          </Box>
          <Select
            value={centreSite?.id || ''}
            onChange={(event) =>
              onSelectSite(sites.find((site) => site.id === event.target.value) || null)
            }
            displayEmpty
            className={`${classes.centreSelect} ${hasCentre ? '' : classes.centreSelectEmpty}`}
            inputProps={{ 'aria-label': tt('zoneCentreLabel') }}
            renderValue={(value) =>
              value
                ? sites.find((site) => site.id === value)?.name || value
                : tt('zoneCentrePlaceholder')
            }
          >
            {sites.map((site) => (
              <MenuItem key={site.id} value={site.id}>
                {site.name}
              </MenuItem>
            ))}
          </Select>

          {/* The consequence of the choice, not a restatement of it. */}
          {hasCentre && distanceFromBase !== null ? (
            <Box className={classes.centreDistance}>
              <Typography variant="body3" className={classes.centreDistanceValue}>
                {tt('zoneCentreDistance', { miles: distanceFromBase.toFixed(1) })}
              </Typography>
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
        anchor={centreSite}
        radiusMiles={hasRadius ? clampRadiusMiles(radiusNumber) : null}
        otherZones={otherZones}
  /* The id travels beside the name because the map colours a zone by **id**, not by what it
     is called — see `zonePalette`. Forwarded explicitly rather than by spreading `shared`:
     these two components destructure a fixed prop list, which is what silently swallowed
     `activeZoneId` the first time it was added at the panel and made a *renamed* zone fall to
     the palette's grey fallback while the zone itself was unchanged. */
        activeZoneName={activeZoneName}
        activeZoneId={activeZoneId}
        invalid={invalid}
        interaction="select"
        hint={tt(hasCentre ? 'zoneHintCentreSet' : 'zoneHintCentre')}
        switcher={switcher}
        onSelectSite={onSelectSite}
        onRadiusDragged={hasCentre ? onRadiusDragged : undefined}
      />
    </>
  );
};

ZoneRadiusExperience.propTypes = {
  sites: PropTypes.array.isRequired,
  centreSite: PropTypes.object,
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
  onSelectSite: PropTypes.func.isRequired,
  onRadiusChange: PropTypes.func.isRequired,
  onRadiusBlur: PropTypes.func.isRequired,
  onStep: PropTypes.func.isRequired,
  onRadiusDragged: PropTypes.func.isRequired,
};

export default ZoneRadiusExperience;
