import { Box, Button, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { useStyles } from './harmonization.styles';
import ZoneMap from './ZoneMap';

/**
 * Drawing a zone by hand: press, drag around the sites, release.
 *
 * One of the two experiences behind the map's switcher, and deliberately **not** a mode of a
 * shared one. Everything here is about an area you enclose — the map is the input, the only
 * control is Clear, and there is no notion of a centre or a distance anywhere in the
 * interface. The radius experience is the same statement in reverse.
 *
 * **A drag draws rather than pans**, which is what "select an area on the map" has to mean;
 * the app's own `DrawingManager` behaves the same way while a polygon tool is armed. Zoom
 * stays on the wheel and the buttons, which reaches anywhere a pan would.
 */

const ZoneLassoExperience = ({
  sites,
  points,
  capturedIds,
  labelIds,
  basePoint,
  otherZones,
  activeZoneName,
  activeZoneId,
  invalid,
  switcher,
  onShapeDrawn,
  onClear,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const tt = (key, options) =>
    t(`obx.settings.preferences.harmonization.${key}`, {
      ...options,
      interpolation: { escapeValue: false },
    });

  const drawn = points.length >= 3;

  /* The wrapper is `zoneFieldMap` rather than `zoneField`: the map fills the panel's
     remaining height, and a wrapper that sized to its content would be where that stopped. */
  return (
    <Box className={classes.zoneFieldMap}>
      <Box className={classes.zoneFieldLabel}>
        <Typography variant="subtitle2" className={classes.zoneFieldLabelText}>
          {tt('zoneBoundaryLabel')}
        </Typography>
        {/* No "Undo point" any more: a freehand trail has no points to undo — it is one
            gesture. Drawing again replaces the shape, so Clear is the only other verb. */}
        {drawn ? (
          <Box sx={{ marginLeft: 'auto' }}>
            <Button variant="tertiaryGrey" onClick={onClear}>
              {tt('zoneClear')}
            </Button>
          </Box>
        ) : null}
      </Box>

      <ZoneMap
        sites={sites}
        capturedIds={capturedIds}
        labelIds={labelIds}
        basePoint={basePoint}
        points={points}
        otherZones={otherZones}
  /* The id travels beside the name because the map colours a zone by **id**, not by what it
     is called — see `zonePalette`. Forwarded explicitly rather than by spreading `shared`:
     these two components destructure a fixed prop list, which is what silently swallowed
     `activeZoneId` the first time it was added at the panel and made a *renamed* zone fall to
     the palette's grey fallback while the zone itself was unchanged. */
        activeZoneName={activeZoneName}
        activeZoneId={activeZoneId}
        invalid={invalid}
        interaction="draw"
        hint={tt(drawn ? 'zoneHintRedraw' : 'zoneHintDraw')}
        switcher={switcher}
        onShapeDrawn={onShapeDrawn}
      />
    </Box>
  );
};

ZoneLassoExperience.propTypes = {
  sites: PropTypes.array.isRequired,
  points: PropTypes.array.isRequired,
  capturedIds: PropTypes.object,
  labelIds: PropTypes.object,
  basePoint: PropTypes.object,
  otherZones: PropTypes.array,
  activeZoneName: PropTypes.string,
  activeZoneId: PropTypes.string,
  invalid: PropTypes.bool,
  switcher: PropTypes.node,
  onShapeDrawn: PropTypes.func.isRequired,
  onClear: PropTypes.func.isRequired,
};

export default ZoneLassoExperience;
