import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material';
import { useJsApiLoader } from '@react-google-maps/api';
import PropTypes from 'prop-types';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import GoogleMapViewComponent from 'src/app/components/common/googleMap/googleMapView';
import TileRouteMap from 'src/app/obx/pages/schedules/components/harmonize/components/TileRouteMap';
import { reverseGeocode } from 'src/app/obx/pages/schedules/components/harmonize/useStartPoint';
import { GOOGLE_MAPS_API_VERSION, GOOGLE_MAPS_LIBRARIES } from 'src/utils/constants';

import { useStyles } from './harmonization.styles';

/**
 * Where a run starts or finishes, chosen on a map.
 *
 * **Neither map is written here.** The screen already has two renderers and a documented
 * rule for which one runs — `AddressSearchField` states it for the geocoder and `RouteMap`
 * for the map itself: the Google SDK is the product standard whenever a key is present,
 * and the keyless tile renderer is what draws when there is not one, which in the demo is
 * always. This dialog is the same split, one level up, so a key upgrades the renderer
 * rather than enabling the feature.
 *
 * The Google branch is `common/googleMap/googleMapView`, which is the app's own location
 * *picker* rather than a route drawer: it already owns click-to-place, a draggable marker
 * and the reverse lookup, and four other screens open it the same way.
 *
 * **The one thing that had to be added is on the keyless side**, because the tile
 * renderer was built to *show* a route and had no ground-click handler at all. It is an
 * optional prop there (`onPickPoint`), so the harmonize workspace's own map is untouched.
 *
 * A single `draft` is the source of truth for both branches, which is why the Google
 * setters below are deliberately inert: two copies of "the point being chosen" is how a
 * marker ends up somewhere the Confirm button does not agree with.
 */

/* Read once, at module scope, so the branch is decided before any hook runs. `useJsApiLoader`
   cannot be called conditionally, and calling it without a key is not free: Google draws its
   own "this page can't load Google Maps" modal over the screen and logs to the console
   (§7.21). So the whole Google branch lives in a component that is never mounted keyless. */
const MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
const HAS_MAPS_KEY = Boolean(MAPS_API_KEY);

const GOOGLE_CONTAINER = { width: '100%', height: '100%' };

/** Four decimals is ~11m; five is ~1m, which is the resolution of a click on a street. */
const showCoords = (point) => `${Number(point.lat).toFixed(5)}, ${Number(point.lng).toFixed(5)}`;

/** The keyless renderer, given one point and asked for a click. */
const TilePointPicker = ({ point, onPick }) => (
  <TileRouteMap
    startPoint={{ label: point.address, address: point.address, lat: point.lat, lng: point.lng }}
    /* The point moving *is* the planner's own click, so refitting on it would snap the
       view to their cursor and undo the zoom they aimed with. */
    lockView
    onPickPoint={({ lat, lng }) => onPick({ address: '', lat, lng })}
  />
);

TilePointPicker.propTypes = {
  point: PropTypes.object.isRequired,
  onPick: PropTypes.func.isRequired,
};

/**
 * The Google branch. Falls through to the tiles while the SDK is still loading, which is
 * the same thing `RouteMap` does and for the same reason: a half-loaded map is a blank
 * panel, and there is a real one available in the meantime.
 */
const GooglePointPicker = ({ point, onPick }) => {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: MAPS_API_KEY,
    version: GOOGLE_MAPS_API_VERSION,
    libraries: GOOGLE_MAPS_LIBRARIES,
  });

  const [center, setCenter] = useState({ lat: Number(point.lat), lng: Number(point.lng) });
  const [activeMarker, setActiveMarker] = useState(null);

  if (!isLoaded) return <TilePointPicker point={point} onPick={onPick} />;

  return (
    <GoogleMapViewComponent
      isLoaded
      mapContainerStyle={GOOGLE_CONTAINER}
      center={center}
      setCenter={setCenter}
      /* Derived from the draft rather than held beside it, so the marker cannot end up
         on a point the read-out and the Confirm button disagree with. */
      selectedLocation={{
        id: 'harmonization-location',
        name: point.address,
        position: { lat: Number(point.lat), lng: Number(point.lng) },
      }}
      /* Inert on purpose, for that same reason: the component offers to keep its own
         copy and the draft above is the only one anything reads. `updateMapValue` is the
         hook that carries the new point, and it fires for a click and for a marker drag
         alike, so one handler covers both routes in. */
      setSelectedLocation={() => {}}
      setAddress={() => {}}
      activeMarker={activeMarker}
      setActiveMarker={setActiveMarker}
      formKey="location"
      updateMapValue={(key, next) =>
        onPick({
          address: next?.name || '',
          lat: next?.position?.lat,
          lng: next?.position?.lng,
        })
      }
    />
  );
};

GooglePointPicker.propTypes = {
  point: PropTypes.object.isRequired,
  onPick: PropTypes.func.isRequired,
};

const LocationPickerDialog = ({ open, titleId, title, anchor, onCancel, onConfirm }) => {
  const classes = useStyles();
  const { t } = useTranslation();
  /* `escapeValue: false` for the reason written on the same helper in `index.jsx`: i18next
     escapes interpolated values, React escapes them again, and an `&` in a label arrives on
     screen as `&amp;`. */
  const tt = (key, options) =>
    t(`obx.settings.preferences.harmonization.${key}`, {
      ...options,
      interpolation: { escapeValue: false },
    });

  const [draft, setDraft] = useState(anchor);
  /* True while the geocoder is deciding what to call a freshly clicked point. The
     read-out says which of the two waits it is in rather than going blank, because a
     panel that empties under the reader looks like the click was lost. */
  const [naming, setNaming] = useState(false);
  /* Only the newest click may write the address. Photon answers out of order often
     enough — a slow lookup for the first click landing after a fast one for the second
     leaves the field naming a place the map is no longer pointing at. */
  const pickSeq = useRef(0);

  /**
   * Seeded when the dialog opens rather than kept in step with `anchor`.
   *
   * A snapshot is the whole contract of Cancel: the screen's own value must not move
   * while a point is being chosen, and re-seeding from a prop that resolves late — the
   * default address arrives from the geocoder a second after mount — would wipe out a
   * pick the planner had already made.
   */
  useEffect(() => {
    if (!open) return;
    pickSeq.current += 1;
    setDraft(anchor);
    setNaming(false);
    // Deliberately keyed on `open` alone: this is a snapshot, not a subscription.
    // eslint-disable-next-line
  }, [open]);

  const pick = ({ address, lat, lng }) => {
    if (!Number.isFinite(Number(lat)) || !Number.isFinite(Number(lng))) return;

    const point = { address: address || '', lat: Number(lat), lng: Number(lng) };
    setDraft(point);

    /* The Google branch already reverse-geocoded through the app's own service, so a
       second lookup would be a paid call for an answer we have. Only the keyless branch
       arrives with bare coordinates. */
    if (point.address) return;

    const seq = pickSeq.current + 1;
    pickSeq.current = seq;
    setNaming(true);

    reverseGeocode(point).then((found) => {
      if (pickSeq.current !== seq) return;
      setNaming(false);
      /* Coordinates when the geocoder has nothing, and never a bare empty string: the
         stored value is a *place* and a location with no words is one the planner cannot
         check against the field later. Same ladder `useStartPoint` ends on. */
      setDraft({ ...point, address: found || showCoords(point) });
    });
  };

  /* Nothing to guard: `anchor` is required to open the dialog at all, and every pick
     replaces the point rather than clearing it, so there is no state in which this
     button has no answer to give. Hence no disabled rule on it. */
  const confirm = () => onConfirm(draft);

  return (
    <Dialog
      open={open}
      /* One handler for Escape and for the backdrop, and it is Cancel: both are the
         planner backing out, and a map picker that kept a half-chosen point on the way
         out would be writing a value nobody confirmed. MUI's own focus trap and its
         restore-to-opener come with this. */
      onClose={onCancel}
      /**
       * **Focus restoration is the caller's job here, and that is a correction rather than
       * a preference.**
       *
       * MUI stores the element that opened the dialog and focuses it again once the close
       * transition has finished. On the confirm path that element is gone: writing a
       * location changes the `key` the address field is mounted under, so the button MUI is
       * holding was unmounted, and its restore — which lands *after* the transition, and
       * therefore after anything the caller does in the click handler — silently dropped
       * focus to `body`. Leaving MUI's restore on and also restoring in the caller is the
       * worst of the two, because MUI's runs last and wins.
       *
       * So every exit — Confirm, Cancel, Escape, backdrop — hands focus back through
       * `onCancel`/`onConfirm`, and both of those go to the same always-mounted control.
       */
      disableRestoreFocus
      /* `md`, not `sm`. At `sm` the paper caps at 600px and the map surface came out about
         552px wide against 340 tall — an almost-square viewport for choosing a point on a
         street map, where the useful axis is horizontal because roads and the addresses along
         them run across it. `md` gives 900px, and the surface grew with it. */
      maxWidth="md"
      fullWidth
      aria-labelledby={titleId}
      /* MUI 5.18's `Dialog` has no `aria-modal` prop and does not set the attribute, and
         its own `...other` spread lands on the modal root rather than on the element that
         carries `role="dialog"`. `PaperProps` is the one that does. The focus trap and the
         `aria-hidden` MUI puts on `#root` already isolate this overlay; the attribute is
         what says so to assistive tech that reads the role instead of the tree. */
      PaperProps={{ 'aria-modal': 'true' }}
      classes={{ paper: classes.mapDialog }}
    >
      <DialogTitle id={titleId} className={classes.mapDialogTitle}>
        {title}
      </DialogTitle>
      <DialogContent className={classes.mapDialogContent}>
        <Typography variant="body2" className={classes.mapDialogText}>
          {tt('locationDialogText')}
        </Typography>
        {/* The renderers position themselves against this box — the tile map is
            `inset: 0` and Google's container is 100% of its parent — so the height the
            dialog wants to give the map is stated here and nowhere inside them. */}
        <Box className={classes.mapDialogSurface}>
          {open && draft ? (
            HAS_MAPS_KEY ? (
              <GooglePointPicker point={draft} onPick={pick} />
            ) : (
              <TilePointPicker point={draft} onPick={pick} />
            )
          ) : null}
        </Box>
        {/* What Confirm will write, in words, above the button that writes it. The map
            says where; only this says what it will be called, and the address is the
            part the field shows afterwards. */}
        <Box className={classes.mapDialogReadout}>
          <Typography variant="body2" className={classes.mapDialogAddress}>
            {naming ? tt('locationDialogNaming') : draft?.address || ''}
          </Typography>
          <Typography variant="body3" className={classes.mapDialogCoords}>
            {draft ? showCoords(draft) : ''}
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions className={classes.mapDialogActions}>
        <Button variant="secondaryGrey" onClick={onCancel}>
          {tt('cancel')}
        </Button>
        <Button variant="primary" onClick={confirm}>
          {tt('locationDialogConfirm')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

LocationPickerDialog.propTypes = {
  open: PropTypes.bool,
  /** The id the `DialogTitle` carries, so the dialog has an accessible name. */
  titleId: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  /** `{ address, lat, lng }` the map opens on. Snapshotted, never subscribed to. */
  anchor: PropTypes.object,
  onCancel: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
};

export default LocationPickerDialog;
