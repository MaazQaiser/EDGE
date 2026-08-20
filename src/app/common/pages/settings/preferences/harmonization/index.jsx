import {
  Autocomplete,
  Box,
  Button,
  Checkbox,
  InputAdornment,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import dayjs from 'dayjs';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
/* Reached across from the workspace rather than reimplemented here, and the direction of
   the dependency is the uncomfortable part: Settings should not need a component out of a
   Schedules page. The alternative was a second keyless geocoder and a second address
   typeahead, which is the kind of duplication that drifts — one of them gets the debounce
   fix and the other does not. Both belong in `components/common` and neither is moving
   today. */
import AddressSearchField from 'src/app/obx/pages/schedules/components/harmonize/components/AddressSearchField';
import { DEMO_ANCHOR } from 'src/app/obx/pages/schedules/components/harmonize/demoVisits';
import { useStartPoint } from 'src/app/obx/pages/schedules/components/harmonize/useStartPoint';
import { ReactComponent as InfoIcon } from 'src/assets/svg/greyInfoIcon.svg?react';
/* The two-arrow cycle rather than an `X`. An X clears a field; this restores a value the
   screen worked out for itself, and those are different promises. The word that used to
   carry it is gone, so the tooltip carries it instead — see `resetTargetHint`. */
import { ReactComponent as ResetIcon } from 'src/assets/svg/refresh.svg?react';
/**
 * A folded map, and the third glyph this button has worn.
 *
 * It was `locationMap.svg`, a teardrop pin, argued for on the grounds that the thing behind the
 * button is a *point*. Wrong emphasis: the button does not mark a point, it opens a map to pick
 * one. Then `mapIcon.svg`, which is a globe — the right idea and the wrong scale, since nothing
 * about choosing a street address is planetary.
 *
 * `roadmapIcon.svg` is the three-panel folded map, which is what a control that opens a map
 * should look like. It also already ships `fill="currentColor"`, so unlike the other two it needs
 * no recolouring rule and cannot silently render white-on-white after a palette change.
 */
import { ReactComponent as MapIcon } from 'src/assets/svg/roadmapIcon.svg?react';
import { toastSettings } from 'src/utils/constants';
import { toaster } from 'src/utils/toast';

import { useStyles } from './harmonization.styles';
import {
  clampNeedBy,
  clampShiftHours,
  clearDraft,
  NEED_BY_MAX,
  NEED_BY_MIN,
  NEED_BY_OPTIONS,
  normaliseSettings,
  readDraft,
  readHarmonizationSettings,
  saveHarmonizationSettings,
  SHIFT_HOURS_DEFAULT,
  SHIFT_HOURS_MAX,
  SHIFT_HOURS_MIN,
  writeDraft,
} from './harmonizationSettings';
import LocationPickerDialog from './LocationPickerDialog';

/** ISO weekdays, named by the locale rather than a hardcoded English list. */
const WEEKDAYS = Array.from({ length: 7 }, (_, index) => ({
  weekday: index + 1,
  label: dayjs()
    .day(index + 1)
    .format('dddd'),
  /* The short form is what the chips show: seven full names do not fit the control, and
     `Mon Tue Wed` is read as a set at a glance in a way a wrapped list of full words is
     not. Same source as the long name, so both translate together. */
  short: dayjs()
    .day(index + 1)
    .format('ddd'),
}));

/** Digits only, and never longer than the maximum's width. */
/**
 * The ids that tie a control to the prose beside it.
 *
 * Every description and range footnote on this screen was visual-only: `aria-describedby`
 * was null on all seven controls, so a screen-reader user tabbing to Radius heard "Radius,
 * edit text, 10" and never heard what it does or that it stops at 125.
 *
 * That gap matters more here than it usually would, because this screen's whole approach to
 * validation is to accept any keystroke and correct it on blur "in front of the planner" —
 * and for someone who cannot see the field there is no in front of the planner. The limit
 * was stated nowhere before the keystroke and the correction nowhere after it. Naming the
 * two nodes that already carry both is the entire fix; no new copy is needed.
 *
 * Derived from the field name rather than hand-written, so a row cannot end up pointing at
 * an id that does not exist.
 */
const hintIds = (field) => ({
  desc: `harmonization-${field}-desc`,
  range: `harmonization-${field}-range`,
});

/** Both ids when there is a range to name, just the description when there is not. */
const describedBy = (field, hasRange = true) => {
  const { desc, range } = hintIds(field);
  return hasRange ? `${desc} ${range}` : desc;
};

const digitsOnly = /^\d{0,3}$/;

const Harmonization = () => {
  const classes = useStyles();
  const { t } = useTranslation();
  /**
   * **`escapeValue: false`, and this is a bug fix rather than a preference.**
   *
   * i18next escapes interpolated values by default, and the app's `i18n.init` sets no
   * `interpolation` config, so the default is on. React then escapes the output a second time,
   * which is how the map overlay's heading came out reading literally
   * `Choose Start &amp; End Location`: the `&` in the interpolated label became `&amp;` in the
   * string, and React rendered those five characters.
   *
   * Scoped to this screen on purpose. The real fix is `interpolation: { escapeValue: false }` in
   * `utils/i18next/config.js` — the standard React setup, since React escapes for you — but there
   * are 15 `dangerouslySetInnerHTML` call sites in this app, and turning escaping off globally
   * without checking whether any of them injects an interpolated translation would be trading a
   * cosmetic bug for a possible injection. Every value interpolated on this screen is a number, a
   * weekday name from dayjs, or a label out of this same locale file, so none of it is untrusted.
   */
  const tt = (key, options) =>
    t(`obx.settings.preferences.harmonization.${key}`, {
      ...options,
      interpolation: { escapeValue: false },
    });

  const [saved, setSaved] = useState(() => readHarmonizationSettings());

  /* The draft wins over the stored rule on mount, because the only way one exists is
     that the planner was mid-edit when this component was unmounted. The settings
     shell's `TabPanel` unmounts it on every click in the list beside it, so turning
     Friday on and glancing at Roles & Permissions used to throw the edit away with no
     warning at all. A router-level "you have unsaved changes" guard was the other
     option and is the worse one: it interrupts a planner who may well be coming
     straight back, and it cannot even fire here, since a sub-tab switch is not a
     navigation. Restoring the edit is quieter and covers the case the dialog misses.

     The plan window is a single number in `form` and nothing else — no mode flag, no
     second field — so a half-typed window survives that round trip like every other
     field, without the draft cache having to learn anything about it. */
  const [form, setForm] = useState(() => readDraft() ?? saved);

  /**
   * The location the two address fields fall back to, and the reason neither of them is
   * seeded into `form`.
   *
   * `null` means "not set", and not-set resolves at read time to the planner's own
   * position, then the franchise. Writing the resolved point into the form on mount was
   * the other option and it is worse in two ways: it marks the form unsaved before the
   * planner has touched anything, and it freezes today's answer into a stored value, so a
   * franchise that moves office keeps routing from the old one until somebody notices.
   *
   * Asked for only while there is something to fall back *to*. With both locations
   * explicitly set there is no default to resolve, and the geolocation prompt would be a
   * permission request in service of a value nothing reads.
   */

  /* `!form.endLocation` was still in this condition after the end field was folded into the
     start, and since the key no longer exists it was always true — so the geolocation prompt
     fired on every open even when the planner had set an explicit address. One field now, one
     question: is there a default still to resolve. */
  const needsDefault = !form.startLocation;
  const {
    point: defaultPoint,
    source: defaultSource,
    isLocating,
  } = useStartPoint({
    enabled: needsDefault,
    /* The last rung, and without it the two fields sit empty on the tenant most likely to
       be looking at them. The ladder is device position, then the franchise, then this:
       the demo has no `franchiseInfo` and a reviewer's browser is usually a continent from
       the data, so both rungs above fail and there is nothing in the box.

       It is the scheduler's own anchor, imported rather than typed out here, so the
       pre-filled origin sits in the middle of the visits the planner will actually
       harmonize. `source` reports `assumed` for it, and the section says so in words:
       a fallback that presents itself as the planner's location is the version of this
       that does real damage. */
    fallbackPoint: { label: 'Scheduled visits', address: '', ...DEMO_ANCHOR },
  });

  /**
   * Dirty means **saving would change something**, not "the form object differs".
   *
   * The two come apart while a field is empty mid-retype. Comparing raw forms, a cleared
   * radius holds `''`, which differs from the stored `10`, so the form read as dirty and
   * Save enabled — and then `mousedown` blurred the field, the clamp put `10` back,
   * `isDirty` went false, and the button disabled *before the click dispatched*. The press
   * reached nothing: no save, no toast, no error, and the marker vanished as if the edit
   * had never happened. Normalising both sides closes it at the root instead of papering
   * over it at the button: a value that clamps back to what is stored was never a change,
   * so Save never offers itself and there is nothing to swallow.
   */
  const isDirty = useMemo(
    () => JSON.stringify(normaliseSettings(form)) !== JSON.stringify(saved),
    [form, saved],
  );

  /* Cleared when the form matches what is stored, not only written when it does not:
     an edit typed and then undone by hand would otherwise leave a stale draft behind
     that comes back marked "unsaved" on the next visit. */
  useEffect(() => {
    if (isDirty) writeDraft(form);
    else clearDraft();
  }, [form, isDirty]);

  /** The record for a weekday, or `undefined` when it is not an installation day. */
  const dayFor = (weekday) => form.routeDays.find((day) => day.weekday === weekday);

  /**
   * Switching a day on and off.
   *
   * A day carries its own shift length now, so this is a per-row toggle again rather than a
   * multi-select handing back its whole selection. A day switched on starts at the default
   * shift, and the list stays in weekday order so the stored rule reads the way the table
   * does.
   *
   * Switching a day off **forgets its shift hours.** Keeping them for a day that is not in the
   * rule would mean the stored value and the screen disagreeing about whether Saturday has a
   * six-hour shift, and the one place that ambiguity would surface is the planner.
   *
   * A day switched on still gets `officers: []`. The column that set them is gone from this
   * screen, but the field is still in the stored shape and `harmonizeRule` still reads it through
   * `officersFor`, so writing the empty list keeps every weekday record the same shape rather
   * than leaving the key absent on newly-added days and present on migrated ones.
   */
  const toggleDay = (weekday) => {
    setForm((previous) => {
      const isOn = previous.routeDays.some((day) => day.weekday === weekday);
      const routeDays = isOn
        ? previous.routeDays.filter((day) => day.weekday !== weekday)
        : [...previous.routeDays, { weekday, shiftHours: SHIFT_HOURS_DEFAULT, officers: [] }].sort(
            (a, b) => a.weekday - b.weekday,
          );

      return { ...previous, routeDays };
    });
  };

  /* Typed freely and clamped on blur, exactly like the radius: seven fields that each refuse
     the fourth digit but explain their range up front. */
  const changeShiftHours = (weekday, value) => {
    if (!digitsOnly.test(value)) return;
    setForm((previous) => ({
      ...previous,
      routeDays: previous.routeDays.map((day) =>
        day.weekday === weekday ? { ...day, shiftHours: value === '' ? '' : Number(value) } : day,
      ),
    }));
  };

  const blurShiftHours = (weekday) => {
    setForm((previous) => ({
      ...previous,
      routeDays: previous.routeDays.map((day) =>
        day.weekday === weekday ? { ...day, shiftHours: clampShiftHours(day.shiftHours) } : day,
      ),
    }));
  };

  /* The two address fields write the same shape, so they share one setter. The key order
     matches `sanitiseLocation`'s, which is not cosmetic: `isDirty` compares serialised
     forms, and a location built here with its keys in another order would read as an edit
     the moment it was set. */
  const changeLocation = (field, location) => {
    setForm((previous) => ({
      ...previous,
      [field]: location
        ? { address: location.address || location.name || '', lat: location.lat, lng: location.lng }
        : null,
    }));
  };

  /* The same two handlers do for the combobox what they did for the bare field, which
     is the reason the control could change at all without the clamp being rewritten:
     `onInputChange` fires for a keystroke and for a click in the list alike, so both
     routes into the value land in one place, and blur is still the only thing that
     corrects it. Picking `5` from the list arrives here as the string `'5'` exactly as
     typing it would. */
  const changeNeedBy = (value) => {
    if (!digitsOnly.test(value)) return;
    setForm((previous) => ({ ...previous, needByDays: value === '' ? '' : Number(value) }));
  };

  const blurNeedBy = () => {
    setForm((previous) => ({ ...previous, needByDays: clampNeedBy(previous.needByDays) }));
  };

  const handleSave = () => {
    const { settings, persisted } = saveHarmonizationSettings(form);

    /* There is no endpoint behind this yet, so the write can genuinely fail — private
       browsing and locked-down profiles both throw on `localStorage.setItem`. The screen
       used to show its saved toast unconditionally and then lose the rule on reload, which
       is the one outcome worse than not saving.
       `saved` is deliberately left alone on failure: the form stays dirty, the unsaved
       marker stays up and the draft stays alive, because it is now the only copy of the
       planner's edit that exists. */
    if (!persisted) {
      toaster.error({
        text: tt('saveFailed'),
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
      return;
    }

    setSaved(settings);
    setForm(settings);

    /* Nothing to re-seed. A typed 7 lights the `1 Week` shortcut the moment it is typed,
       let alone after saving, because `presetWindow` is read off `planWindowDays` rather
       than tracked alongside it — two controls claiming different things about one number
       is not a bug this has to avoid, it is a state it cannot reach. */

    toaster.success({
      text: tt('savedToast'),
      position: 'top-right',
      autoClose: toastSettings.AUTO_CLOSE,
    });
  };

  /**
   * What the address field says when the planner has set nothing.
   *
   * Which rung answered is the whole message, not decoration: "Using your current
   * location" and "Using the franchise address" are different promises about where a van
   * leaves from, and a field that showed an address without saying which one it was
   * would be asking to be trusted for the wrong reason.
   */
  const defaultLocationHint = () => {
    if (isLocating) return tt('locationLocating');
    if (defaultSource === 'device') return tt('locationFromDevice');
    if (defaultSource === 'franchise') return tt('locationFromFranchise');
    if (defaultSource === 'assumed') return tt('locationFromVisits');
    return tt('locationUnset');
  };

  /**
   * What the reset control promises, and it names the rung it will actually land on.
   *
   * "Reset to your current location" over a control that returns the franchise address —
   * or, on this tenant, the centre of the demo's own visits — is the kind of wrong label
   * that gets believed, because a resolved address looks equally plausible whichever rung
   * produced it. `defaultSource` already knows which one answered; this is the same fact
   * the section description states, worded for a button rather than a paragraph, so the
   * two cannot disagree.
   *
   * Generic while the device fix is still outstanding, matching `defaultLocationHint`: the
   * ladder has not finished resolving, so any specific promise is a guess.
   */
  const resetTargetHint = () => {
    if (isLocating) return tt('locationResetToDefault');
    if (defaultSource === 'device') return tt('locationResetToDevice');
    if (defaultSource === 'franchise') return tt('locationResetToFranchise');
    if (defaultSource === 'assumed') return tt('locationResetToVisits');
    return tt('locationResetToDefault');
  };

  /**
   * Which field's map is open, carrying its own label rather than deriving one.
   *
   * The label happens to equal the field name for both rows today, and relying on that
   * would be a coincidence load-bearing for the dialog's accessible name.
   */
  const [mapPicker, setMapPicker] = useState(null);

  const mapButtonRefs = useRef({});

  /**
   * Where focus goes after either control has written a location, and it has to be done
   * by hand for a reason neither obvious nor optional.
   *
   * `AddressSearchField` is uncontrolled and mounted under a `key` built from its own
   * value, so **writing a location remounts it**, and that takes both of these buttons
   * with it. Activating the reset therefore unmounts the very thing that was focused, and
   * confirming a point unmounts the button the dialog was holding to restore focus to.
   * Either way focus lands on `body`, which strands a keyboard planner at the top of the
   * document with the screen looking unchanged.
   *
   * The map button is the target for every path, because it is the one control in this
   * field that exists in every state, and the dialog's own restore is switched off so
   * there is exactly one thing deciding where focus goes (see `disableRestoreFocus`).
   *
   * **Deferred through state and an effect, not through `requestAnimationFrame`.** The
   * replacement button does not exist until React has committed the remount, so the focus
   * call has to happen after it — but rAF is the wrong way to wait: a background tab does
   * not run animation frames at all, so the focus simply never happened. An effect runs
   * after every commit regardless, and the ref callback has handed over the new node by
   * the time it does. Cleared as it fires so the same field can ask twice.
   */
  const [focusRequest, setFocusRequest] = useState(null);

  useEffect(() => {
    if (!focusRequest) return;
    mapButtonRefs.current[focusRequest]?.focus();
    setFocusRequest(null);
  }, [focusRequest]);

  const focusMapButton = (field) => setFocusRequest(field);

  const resetLocation = (field) => {
    changeLocation(field, null);
    focusMapButton(field);
  };

  /* What a map opens on for a field: the planner's own point when there is one, otherwise
     whatever the ladder resolved. `null` only while no rung has answered at all, and that
     is what disables the button — a map with no centre to draw is a grey square.
     One function rather than the expression written twice, because the row decides whether
     the button is live and the dialog decides where the pin lands, and those two answers
     disagreeing is a dialog that opens somewhere the button did not promise. */
  const anchorFor = (field) =>
    form[field] ||
    (defaultPoint && Number.isFinite(Number(defaultPoint.lat))
      ? { address: defaultPoint.address || '', lat: defaultPoint.lat, lng: defaultPoint.lng }
      : null);

  const locationRow = (field, labelKey, textKey) => {
    const explicit = form[field];
    const anchor = anchorFor(field);

    return (
      <Box className={classes.prefRow}>
        {/* A real `label`, bound to the field by `htmlFor`, and it is the only row here
            whose label is one. Two reasons, both concrete. `AddressSearchField` takes a
            `placeholder` and no label, so these two inputs reached the accessibility tree
            with no name at all — a screen reader announced "edit text" twice, with nothing
            to say which was the start and which the end. And `variant="subtitle2"` renders
            an `h6`, so the alternative fix — a visually hidden label — would have left a
            fake heading standing beside it. Rendering the visible text *as* the label
            solves both, with no second copy of the string to keep in step, and clicking
            the words now focuses the field. */}
        <Typography
          variant="subtitle2"
          component="label"
          htmlFor={`harmonization-${field}`}
          className={classes.prefLabel}
        >
          {tt(labelKey)}
        </Typography>
        {/* The row carries the source sentence now, because the section description that
            used to hold it is gone with its heading. Which rung answered is the message and
            not decoration: "your current location" and "the franchise address" are different
            promises about where a van leaves from.

            One sentence either way, not both concatenated. Joined, the two ran to three lines
            and made this the only row on the screen taller than 60px; separately, each says
            the thing that actually matters in its own state. On the default, which rung
            answered is the fact worth having. Once an address is set, what the default *would*
            have been is no longer a fact about this field — the reset button's tooltip names
            it, which is where it belongs — so the row explains the field's role instead. The
            label already says it is both ends of the trip. */}
        <Typography variant="body2" className={classes.prefText}>
          {explicit ? tt(textKey) : defaultLocationHint()}
        </Typography>
        {/* The line that said where the default came from used to sit here, under each
            field, which printed the same sentence twice in adjacent rows and pushed both
            rows 22px taller than every other row on the screen. It is one fact about both
            fields, so it is stated once in the section description instead — and the rows
            go back to the shared height, which is what makes the column read as one table
            rather than two. */}
        <Box className={classes.locationCell}>
          {/* Keyed on what it is being handed, because the field keeps its own query
              state and is uncontrolled by design: a default that arrives late — a GPS
              fix, or an address the geocoder took a second to name — would otherwise
              never reach the box it was resolved for. */}
          <AddressSearchField
            key={`${field}-${explicit?.address || defaultPoint?.address || ''}`}
            id={`harmonization-${field}`}
            placeholder={tt('locationPlaceholder')}
            defaultValue={explicit?.address || defaultPoint?.address || ''}
            onSelect={(location) => changeLocation(field, location)}
            /* A formatted address needs ~350px and the column is 320 before either of
               these buttons takes its 28. Ellipsis says the value is cut, the native
               title hands back the whole of it, and the map dialog prints it in full
               beside the point it belongs to — three answers because the field itself
               cannot be widened without the control column leaving the table. */
            showValueTitle
            endAdornment={
              <InputAdornment position="end" className={classes.fieldActions}>
                {/**
                 * **The reset moved inside the field, and that was forced rather than
                 * chosen.**
                 *
                 * It was a text link under the box reading "Use the default instead", and
                 * two things were wrong with it. The comment above it claimed absolute
                 * positioning kept it out of the row's height; measured, it did not — the
                 * cell is a column, so an explicit address grew this row to 67px against
                 * every other row's 60, and the uniform height is the only thing making
                 * the control column read as one table. And it was `textBrand` at 12px,
                 * which is 3.18:1 on white: the least visible text on the screen was the
                 * control the planner was said not to be finding.
                 *
                 * Inside a 44px field the appearing and disappearing is free, and the
                 * control sits where the value it undoes is. The cost is the word: an
                 * icon cannot say "instead of the one you set", so the tooltip does, and
                 * it names the rung it will actually return to.
                 *
                 * First in the DOM and therefore first in the tab order, because the map
                 * button is the one that must not move: anchoring the always-present
                 * control to the field's edge and letting the conditional one appear
                 * inward of it means nothing shifts under the pointer.
                 */}
                {explicit && (
                  <Tooltip arrow placement="top" title={resetTargetHint()} describeChild>
                    <Box
                      component="button"
                      type="button"
                      className={classes.fieldAction}
                      aria-label={tt('locationResetAria', { label: tt(labelKey) })}
                      onClick={() => resetLocation(field)}
                    >
                      <ResetIcon className={classes.glyphStroked} />
                    </Box>
                  </Tooltip>
                )}
                {/* A real `button`, not the `Box component="span" role="img"` the invoice
                    stat hints use: that pattern is unreachable from the keyboard, so the
                    map would be there for anyone with a mouse and missing for everyone
                    else. `describeChild` keeps the two strings in their proper places —
                    the name says which field this opens a map for, the tip says what
                    happens — instead of one of them being read out as the other. */}
                <Tooltip arrow placement="top" title={tt('locationMapTip')} describeChild>
                  <Box
                    component="button"
                    type="button"
                    ref={(node) => {
                      mapButtonRefs.current[field] = node;
                    }}
                    className={classes.fieldAction}
                    aria-label={tt('locationMapAria', { label: tt(labelKey) })}
                    /**
                     * **No `disabled` state, and that was measured rather than assumed.**
                     *
                     * The obvious guard is "there is no point to centre a map on yet", and
                     * on this screen that state does not exist: `useStartPoint` is handed a
                     * `fallbackPoint` unconditionally, so the ladder's last rung always
                     * answers and `anchorFor` always returns a point. A `disabled` prop and
                     * a `:disabled` rule would have been a state neither could ever reach,
                     * which is the same dead CSS `windowPresets` refuses to carry.
                     *
                     * `anchor` is still guarded below, because the *dialog* must not open
                     * onto a map with no centre if that fallback ever goes away — and if it
                     * does, this is where the disabled state becomes real.
                     */
                    onClick={() => anchor && setMapPicker({ field, label: tt(labelKey) })}
                  >
                    <MapIcon />
                  </Box>
                </Tooltip>
              </InputAdornment>
            }
          />
        </Box>
      </Box>
    );
  };

  return (
    <Box className={classes.wrapper}>
      {/* The heading is back, and the reason it briefly went is worth keeping: while
          this was a top-level tab, the tab itself said "Harmonization" and an `h4`
          repeating it was pure restatement. Its label is now an item in the vertical
          list beside Roles & Permissions — a different region of the screen, and every
          other sub-screen in this shell (Threshold Values, System Defaults) carries its
          own heading. Matching the shell beats the general rule here. */}
      {/* The heading alone. A three-sentence intro sat under it explaining what
          harmonization is, that every run starts from these values, and that saving does not
          re-plan applied routes. All three were true and none of them was what a planner
          opening a settings screen needs first: the rows below say what each value does, and
          the paragraph was the largest block of prose on the page, read once and then
          skipped forever. */}
      <Box className={classes.header}>
        <Typography variant="h3" className={classes.headerTitle}>
          {tt('title')}
        </Typography>
      </Box>

      {/* **Two rows and no section heading between them.**
          They sat under "Route Area" and "Timing", each with a heading and a one-line
          description above a single row — three layers of text to introduce one field. With
          the radius gone there is nothing left for either group to group, and a heading over
          one row is a label for a label. The rows carry their own, which is enough.

          The radius went with them. `radiusMiles` stays in the stored rule and still feeds
          `resolveHarmonizeRule`, for the same reason `planWindowDays` does: deleting the field
          would have changed how far every run reaches as a side effect of removing a control.
          The workspace's own radius knob is where it was actually being adjusted. */}
      <Box className={`${classes.section} ${classes.sectionFirst}`}>
        {/* **One location, not two.** There were two fields, Start and End, and `endLocation`
            was stored and never read by anything that plans a route: the run is a round trip,
            so the end could only ever restate the start. `useStartPoint` said so first —
            "One place, not two" — and the second field was added over that objection. It is
            gone, and the one that remains is labelled for both jobs it does. */}
        {locationRow('startLocation', 'startLocation', 'startLocationText')}

        <Box className={classes.prefRow}>
          {/* The label carries the explanation of "need by date" rather than the
              description beside it: the description has to say what the *setting* does,
              and defining its central term in the same sentence made one row answer two
              questions at once.

              A `button`, not the `Box component="span" role="img"` the invoice stat hints
              use — that pattern cannot be reached from the keyboard, so the definition is
              there for anyone with a mouse and missing for everyone else. `describeChild`
              is what keeps the two strings in their proper places: the button's
              accessible *name* stays the short question, and the sentence becomes its
              description, instead of a one-line definition being read out as the name of
              a control. */}
          <Box className={classes.prefLabelGroup}>
            <Typography variant="subtitle2" component="span" className={classes.prefLabel}>
              {tt('needBy')}
            </Typography>
            <Tooltip arrow placement="top" title={tt('needByTooltip')} describeChild>
              <Box
                component="button"
                type="button"
                className={classes.infoButton}
                aria-label={tt('needByTooltipAria')}
              >
                <InfoIcon />
              </Box>
            </Tooltip>
          </Box>
          <Typography variant="body2" className={classes.prefText} id={hintIds('needBy').desc}>
            {tt('needByText')}
          </Typography>
          <Box className={classes.unitCell}>
            {/**
             * **An editable combobox — MUI `Autocomplete` with `freeSolo` — and not
             * `commonComponents/customDropDown`.**
             *
             * The requirement is that the planner may type *or* pick, and
             * `customDropDown` cannot do the first half: its `searchable` mode filters a
             * list inside the popper, it does not accept the typed text as the value, so
             * `4` reaches the form only via a click. Getting typing back would mean a
             * text field *and* that dropdown side by side, two controls for one number,
             * which is the arrangement that eventually disagrees with itself.
             *
             * `freeSolo` is also what preserves the clamp. A closed `<Select>` — the
             * other obvious answer for five values — cannot hold `10` even for the
             * keystroke it takes to type it, so there is nothing to correct on blur and
             * the range stops being explained by the screen and starts being enforced by
             * a control that refuses. Typing `10` here leaves `10` visible, and blur
             * pulls it to 7 in front of the planner, before Save rather than inside it.
             *
             * `forcePopupIcon` is required rather than decorative: with `freeSolo`, MUI
             * hides the chevron by default, and a combobox with no affordance is just a
             * text field with a secret.
             *
             * **`inputValue` is controlled and `value` is deliberately left alone**, which
             * is load-bearing and not obvious. `useAutocomplete` resets its input from its
             * value whenever the two disagree, and on mount that value is `null` — but the
             * reset bails out first on `!isOptionSelected && !clearOnBlur`, and `freeSolo`
             * defaults `clearOnBlur` to false. Controlling `value` as well, or switching
             * `clearOnBlur` on, re-opens that path and the field arrives on screen empty
             * with `needByDays` set to `''` and the form already marked unsaved.
             */}
            <Autocomplete
              className={classes.needByField}
              freeSolo
              forcePopupIcon
              disableClearable
              options={NEED_BY_OPTIONS}
              getOptionLabel={(option) => String(option)}
              /* All five, always. The default filter narrows the list to whatever has
                 been typed, which for a closed set of five single digits hides the range
                 at the exact moment the planner is deciding within it. */
              filterOptions={(options) => options}
              inputValue={String(form.needByDays)}
              onInputChange={(event, next) => changeNeedBy(next)}
              slotProps={{ paper: { className: classes.needByMenu } }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  onBlur={blurNeedBy}
                  /**
                   * **The `±` is inside the field now, as a start adornment.**
                   *
                   * It was a `Typography` sitting to the left of the box, which put the
                   * sign outside the control it modifies: the field read `3` and the row
                   * read `± 3`, so the value you could select, copy or hear announced was
                   * not the value on screen. Inside, the digit and its sign are one thing,
                   * and the field's left edge lines up with the radius field's a section
                   * above instead of being pushed 17px right by a floating glyph.
                   *
                   * `params.InputProps` has to be spread back in by hand. `{...params}`
                   * already passed it, and naming `InputProps` here replaces it wholesale
                   * — dropping the ref MUI anchors the popper to and the chevron itself,
                   * which is a combobox that silently stops opening.
                   */
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <InputAdornment
                        position="start"
                        disableTypography
                        className={classes.fieldUnit}
                      >
                        &plusmn;
                      </InputAdornment>
                    ),
                  }}
                  inputProps={{
                    ...params.inputProps,
                    inputMode: 'numeric',
                    'aria-label': tt('needBy'),
                    'aria-describedby': describedBy('needBy'),
                  }}
                />
              )}
            />
            <Typography variant="body2" className={classes.unit}>
              {tt('days')}
            </Typography>
            <Typography variant="body3" className={classes.rangeText} id={hintIds('needBy').range}>
              {tt('needByRange', { min: NEED_BY_MIN, max: NEED_BY_MAX })}
            </Typography>
          </Box>
        </Box>

        {/* **The Harmonization Window row was removed from this screen.**
            It was a number field with `1 Week / 2 Weeks / 4 Weeks` shortcuts beside it,
            setting how far ahead a single run could reach for work. `planWindowDays` still
            exists in the stored rule and still feeds `resolveHarmonizeRule`, because deleting
            the field would have changed how far ahead every run looks as a side effect of
            tidying a settings screen. It sits at its default and nothing here can move it.
            The workspace still offers the same choice per run, which is where it was being
            used in practice: a plan window is a decision about one run, not a standing policy
            about all of them. */}
      </Box>

      {/* INSTALLATION DAYS ------------------------------------------------ */}
      {/**
       * Back to a seven-row table, and back for a reason rather than by reversal.
       *
       * The multi-select was right while a day carried nothing but a tick. A day now carries
       * its own **maximum shift hours**, so there are seven values to set and seven to read
       * back at a glance — which a dropdown cannot show and a chip cannot hold. The row that
       * replaced the table also had four layers of text stacked on it (section heading,
       * section description, row label, row description) to say one thing; the table needs
       * one heading and one line, because each row names itself.
       */}
      <Box className={`${classes.section} ${classes.sectionLast}`}>
        <Box className={classes.sectionHeader}>
          <Typography variant="h4" className={classes.sectionTitle}>
            {tt('installationDays')}
          </Typography>
          <Typography variant="body2" className={classes.sectionText} id={hintIds('days').desc}>
            {tt('installationDaysText')}
          </Typography>
        </Box>

        {/* The table gets its own box so it can scroll sideways below the breakpoint rather
            than have a column collapse — see `DAY_TABLE_MIN_WIDTH`. */}
        <Box className={classes.dayTable}>
          <Box className={classes.dayHeader}>
            {/* **One label, not two.** There was an `On` over the checkbox and a `Day` over the
                names, which is two headings for one idea: the tick and the weekday beside it are
                the same answer to the same question. A selection column carries no header in any
                table that has one, and the checkbox is not left unnamed by dropping it — each one
                says "Install on Monday" to a screen reader through `dayAria`, which is a better
                name than a shared `On` could ever be.

                Placed in column 2 explicitly rather than after an empty placeholder cell, so
                `Day` sits over the weekday names it labels instead of over the checkbox. */}
            <Typography variant="subtitle3" className={classes.columnLabelDay}>
              {tt('columnDay')}
            </Typography>
            <Box className={classes.columnHeadGroup}>
              <Typography variant="subtitle3" className={classes.columnLabel}>
                {tt('columnShift')}
              </Typography>
              {/* On the column heading rather than in each of the seven cells: it is one fact
                  about the column, and seven copies would be seven tooltips saying the same
                  sentence. `describeChild` keeps the button's accessible *name* a short question
                  and makes the sentence its description, as on the Need by Date row. */}
              <Tooltip arrow placement="top" title={tt('shiftTooltip')} describeChild>
                <Box
                  component="button"
                  type="button"
                  className={classes.infoButton}
                  aria-label={tt('shiftTooltipAria')}
                >
                  <InfoIcon />
                </Box>
              </Tooltip>
              <Typography variant="body3" className={classes.rangeText} id={hintIds('shift').range}>
                {tt('shiftRange', { min: SHIFT_HOURS_MIN, max: SHIFT_HOURS_MAX })}
              </Typography>
            </Box>
          </Box>

          {WEEKDAYS.map(({ weekday, label }) => {
            const day = dayFor(weekday);

            return (
              <Box key={weekday} className={classes.dayRow}>
                {/* First in the row and first in the tab order, matching the heading above it.
                    It sat third, behind the day name, so the eye had to reach past the label to
                    find the control and back again to read which day it belonged to. */}
                <Checkbox
                  className={classes.dayCheckbox}
                  checked={!!day}
                  onChange={() => toggleDay(weekday)}
                  inputProps={{ 'aria-label': tt('dayAria', { day: label }) }}
                />

                {/* The checkbox names the day rather than the row it is in, because a screen
                    reader hears these controls as a flat list with no table around them: seven
                    boxes all called "On" would be unusable and silent about what they do. */}
                <Typography
                  variant="subtitle2"
                  component="span"
                  className={day ? classes.dayName : classes.dayNameOff}
                >
                  {label}
                </Typography>

                <Box className={classes.shiftCell}>
                  {day ? (
                    <>
                      <TextField
                        className={classes.numberField}
                        value={day.shiftHours}
                        onChange={(event) => changeShiftHours(weekday, event.target.value)}
                        onBlur={() => blurShiftHours(weekday)}
                        inputProps={{
                          inputMode: 'numeric',
                          'aria-label': tt('shiftAria', { day: label }),
                          'aria-describedby': hintIds('shift').range,
                        }}
                      />
                      <Typography variant="body2" className={classes.unit}>
                        {tt('hrs')}
                      </Typography>
                    </>
                  ) : (
                    /* The cell keeps its height whichever child it holds, so switching a day on
                       cannot shift the rows under it. */
                    <Typography variant="body2" className={classes.shiftPlaceholder}>
                      &mdash;
                    </Typography>
                  )}
                </Box>
              </Box>
            );
          })}
        </Box>
      </Box>

      <Box className={classes.footer}>
        {/* Beside Save rather than at the top of the screen, because that is where a
            planner looks when deciding whether they are done — and it answers the
            question the disabled/enabled button alone leaves open, which is whether
            the edit was registered at all.

            `aria-live` because the marker appearing is the screen's answer to "did that
            register?", and a planner who cannot see it got no answer at all. `polite`
            so it waits for a gap rather than interrupting the field being typed in. */}
        <Typography
          variant="body3"
          className={classes.unsavedText}
          aria-live="polite"
          role="status"
        >
          {isDirty ? tt('unsaved') : ''}
        </Typography>
        <Button variant="primary" disabled={!isDirty} onClick={handleSave}>
          {tt('save')}
        </Button>
      </Box>

      {/**
       * One dialog for both rows, and it stays mounted while closed on purpose.
       *
       * Unmounting it on close was the other option and it costs the thing that makes the
       * overlay usable from a keyboard: MUI's focus trap restores focus to whatever opened
       * it when the modal *closes*, and tearing the component out from under that skips the
       * restore, so Escape would leave a planner's focus on `body`.
       *
       * `open` is derived from `mapPicker` rather than held beside it, so there is no way
       * to be open with no field to write to. Confirm goes through `changeLocation`, which
       * is the same setter the address typeahead uses — including its key order, which
       * `isDirty` compares serialised and would otherwise read as an edit the instant a
       * point was set.
       */}
      <LocationPickerDialog
        open={Boolean(mapPicker)}
        titleId="harmonization-location-dialog-title"
        title={tt('locationDialogTitle', { label: mapPicker?.label || '' })}
        anchor={mapPicker ? anchorFor(mapPicker.field) : null}
        onCancel={() => {
          if (!mapPicker) return;
          const { field } = mapPicker;
          setMapPicker(null);
          focusMapButton(field);
        }}
        onConfirm={(location) => {
          const { field } = mapPicker;
          changeLocation(field, location);
          setMapPicker(null);
          focusMapButton(field);
        }}
      />
    </Box>
  );
};

export default Harmonization;
