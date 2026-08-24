import {
  Box,
  Button,
  Checkbox,
  IconButton,
  InputAdornment,
  MenuItem,
  Select,
  Slider,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import dayjs from 'dayjs';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import RequiredAsterik from 'src/app/components/common/requiredAsterik';
/* Reached across from the workspace rather than reimplemented here, and the direction of
   the dependency is the uncomfortable part: Settings should not need a component out of a
   Schedules page. The alternative was a second keyless geocoder and a second address
   typeahead, which is the kind of duplication that drifts — one of them gets the debounce
   fix and the other does not. Both belong in `components/common` and neither is moving
   today. */
import AddressSearchField from 'src/app/obx/pages/schedules/components/harmonize/components/AddressSearchField';
import { DEMO_ANCHOR } from 'src/app/obx/pages/schedules/components/harmonize/demoVisits';
import { useStartPoint } from 'src/app/obx/pages/schedules/components/harmonize/useStartPoint';
/**
 * The zone card's two actions, as glyphs.
 *
 * `edit-icon.svg` and `trash-2.svg`, which are the two the app already uses for these verbs —
 * the pencil in four places, the bin in fifteen. Neither ships `currentColor`: the pencil
 * hardcodes a `#6A6A70` stroke and the bin a `#E43F32` one, at 16 and 20 respectively, so
 * dropped in unstyled they would arrive as one grey icon and one red icon of different sizes.
 * `zoneIconButton` forces both to the button's own colour and size, which is what makes them
 * read as a pair rather than as two borrowed assets.
 */
import { ReactComponent as EditIcon } from 'src/assets/svg/edit-icon.svg?react';
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
import { ReactComponent as TrashIcon } from 'src/assets/svg/trash-2.svg?react';
import { toastSettings } from 'src/utils/constants';
import { toaster } from 'src/utils/toast';

import { useStyles } from './harmonization.styles';
import {
  clampNeedBy,
  clampShiftHours,
  clearDraft,
  NEED_BY_MAX,
  NEED_BY_MIN,
  normaliseSettings,
  readDraft,
  readHarmonizationSettings,
  saveHarmonizationSettings,
  SHIFT_HOURS_DEFAULT,
  writeDraft,
  ZONE_SHAPE,
  zoneCoverage,
} from './harmonizationSettings';
import LocationPickerDialog from './LocationPickerDialog';
import ZoneEditorPanel from './ZoneEditorPanel';
import { BoundaryIcon, RadiusIcon } from './ZoneGlyphs';
import { siteById, ZONE_SITES } from './zoneSites';

/**
 * A readable id for a new zone, derived from its name.
 *
 * A timestamp would also be unique and would make the stored rule unreadable — `zone-north`
 * says what it is when somebody opens localStorage or a future payload, and a suffix only
 * appears when a planner genuinely has two zones with one name.
 */
const zoneIdFor = (name, existing = []) => {
  const base =
    String(name)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'zone';

  let id = base;
  let suffix = 2;
  while (existing.some((zone) => zone.id === id)) {
    id = `${base}-${suffix}`;
    suffix += 1;
  }
  return id;
};

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

/* `describedBy` lived here — it joined a field's description id to its range id for
   `aria-describedby`. Both ranges are gone from the screen (the need-by bounds are shown by
   the stepper going dead, the shift column's `1–16 hrs` was removed), so it had one caller
   and half of what it composed no longer renders. The two remaining controls name their
   description id directly. */

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
  /* Normalised once and used twice. `isDirty` needs it to compare against the stored rule,
     and `zoneCoverage` needs it because `zoneOfSite` reads sanitised overrides — a dangling
     zone id in the raw form would otherwise report a site as assigned to a zone that is not
     there any more. */
  const normalised = useMemo(() => normaliseSettings(form), [form]);

  const isDirty = useMemo(
    () => JSON.stringify(normalised) !== JSON.stringify(saved),
    [normalised, saved],
  );

  /**
   * What this configuration cannot do, recomputed as the planner edits it.
   *
   * In Settings rather than at run time, because none of it needs the engine: zone
   * membership and each day's zone are both static, so a stranded zone is a set
   * difference. §14.5 of `HARMONIZE-CONTEXT.md` asks the run's scope step to predict
   * rather than describe; this is the same finding one screen earlier, where the fix is.
   */
  const coverage = useMemo(
    () => zoneCoverage({ settings: normalised, sites: ZONE_SITES }),
    [normalised],
  );

  /* `null` is closed; `{ zoneId }` edits that zone; `{ zoneId: null }` creates one. */
  const [zoneEditor, setZoneEditor] = useState(null);

  /**
   * Which of the two solutions the Zones section is showing.
   *
   * A view preference, not part of the rule — it decides what the list shows and what the
   * add button opens, and nothing about it is worth saving. It opens on boundaries because
   * that is the one that needs a map to understand.
   */
  const [solution, setSolution] = useState(ZONE_SHAPE.BOUNDARY);
  const isRadiusSolution = solution === ZONE_SHAPE.RADIUS;

  /* `null` when not adding; a string — including `''` — while the inline row is open. */
  const [inlineName, setInlineName] = useState(null);

  /**
   * The zones this solution shows: its own, plus every zone that is not defined yet.
   *
   * Undefined zones appear under both because they have not chosen — and because a zone
   * added inline would otherwise disappear the instant the planner flipped the switch,
   * which reads as having lost it.
   */
  const visibleZones = useMemo(
    () => form.zones.filter((zone) => !zone.shape || zone.shape.kind === solution),
    [form.zones, solution],
  );

  /* Cleared when the form matches what is stored, not only written when it does not:
     an edit typed and then undone by hand would otherwise leave a stale draft behind
     that comes back marked "unsaved" on the next visit. */
  useEffect(() => {
    if (isDirty) writeDraft(form);
    else clearDraft();
  }, [form, isDirty]);

  /**
   * "1 site", not "1 sites".
   *
   * Two independent counts cannot be pluralised inside one string — i18next resolves one
   * `count` per key — so the two halves are pluralised separately and composed. Doing it
   * with a ternary in the JSX instead would put English grammar in a component and leave
   * every other locale with the English plural rule.
   */
  const sitesLabel = (value) => tt('zoneSiteCount', { count: value });
  const filtersLabel = (value) => tt('zoneFilterCount', { count: value });

  /** The record for a weekday, or `undefined` when it is not an installation day. */
  const dayFor = (weekday) => form.routeDays.find((day) => day.weekday === weekday);

  /* Read off the form rather than the coverage buckets: a `Select` renders from the form,
     and a zone renamed but not yet saved should show its new name in the control that
     names it. */
  const zoneNameOf = (zoneId) =>
    form.zones.find((zone) => zone.id === zoneId)?.name || tt('zoneNonePlaceholder');

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
        : [
            ...previous.routeDays,
            /* `zoneId: null` rather than guessing one. A day switched on has not been told
               which zone it covers, and picking the first zone in the list on the planner's
               behalf would silently commit them to a territory. The select marks itself
               required until it has one. */
            { weekday, shiftHours: SHIFT_HOURS_DEFAULT, officers: [], zoneId: null },
          ].sort((a, b) => a.weekday - b.weekday);

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

  /**
   * The need-by window, and there is only one way to set it now.
   *
   * A slider cannot emit an illegal value, so the whole clamp-on-blur apparatus this row used
   * to need is gone with the field: `changeNeedBy`, `blurNeedBy` and the `digitsOnly` guard on
   * this value all existed to catch a typed `20` and pull it back to 14 "in front of the
   * planner". There is nothing to catch. `clampNeedBy` stays in the model, because a *stored*
   * rule can still hold anything.
   *
   * `Number` on the way in because MUI hands back a number already, but `onChange` also fires
   * for a keyboard arrow and this keeps the stored shape a number either way — `isDirty`
   * compares serialised forms, and a `7` that arrives as a string reads as an edit.
   */
  const changeNeedBy = (value) => {
    setForm((previous) => ({ ...previous, needByDays: clampNeedBy(Number(value)) }));
  };

  /* The value the row draws from. A stored rule is sanitised on read, so this is always a
     legal integer — unlike the old field, which could hold `''` mid-retype and needed a
     `null` case in every consumer. */
  const needByDays = clampNeedBy(form.needByDays);

  /**
   * Where the value sits in its own range, in a word.
   *
   * **This is the part that makes the row worth reading**, and it is the answer to the
   * question the number alone cannot settle: 7 is not tight or loose until you know 3 and 14
   * are the ends. The thumb's position says it visually; this says it in a word, for anyone
   * reading the sentence rather than the track — and for a screen reader, which gets no
   * position at all.
   *
   * **Thirds of the legal range, derived rather than hardcoded.** Written as `<= 5` / `<= 9`
   * first, which was three numbers with no reason behind them that would have quietly become
   * wrong the moment `NEED_BY_MAX` moved. It is a description of *where in the range* the
   * value is, not a recommendation — nothing here says which one to pick.
   */
  const needByPosture = () => {
    const third = (NEED_BY_MAX - NEED_BY_MIN) / 3;
    if (needByDays <= NEED_BY_MIN + third) return tt('needByTight');
    if (needByDays <= NEED_BY_MIN + third * 2) return tt('needByBalanced');
    return tt('needByFlexible');
  };

  const changeDayZone = (weekday, zoneId) => {
    setForm((previous) => ({
      ...previous,
      routeDays: previous.routeDays.map((day) =>
        day.weekday === weekday ? { ...day, zoneId: zoneId || null } : day,
      ),
    }));
  };

  /**
   * A zone created from the list, with a name and nothing else.
   *
   * Legal by construction: `shape: null` is a zone somebody will define later, and
   * `zoneOfSite` already resolves membership without one. The day table can point at it
   * immediately, which is the whole reason to allow it — naming the week's zones is a
   * different job from drawing them, and it should not need a map.
   */
  const commitInlineZone = () => {
    const trimmed = (inlineName || '').trim();
    if (!trimmed) return;

    setForm((previous) => ({
      ...previous,
      zones: [
        ...previous.zones,
        { id: zoneIdFor(trimmed, previous.zones), name: trimmed, shape: null },
      ],
    }));
    setInlineName(null);
  };

  /**
   * Saving a shape rewrites the zone's membership.
   *
   * Both halves, and the second is the destructive one: every site the shape caught is
   * assigned to this zone, and every site that *was* in it and is no longer inside ends up
   * in no zone. That is what "redraw the boundary" has to mean — a boundary whose sites did
   * not follow it would be a picture rather than a setting — and it is why the dialog names
   * the departing sites before this runs rather than leaving the planner to notice them
   * missing from a Covers count later.
   */
  const saveZone = ({ name, shape, siteIds, releasing }) => {
    setForm((previous) => {
      const editingId = zoneEditor?.zoneId || null;
      const id = editingId || zoneIdFor(name, previous.zones);

      const zones = editingId
        ? previous.zones.map((zone) => (zone.id === editingId ? { ...zone, name, shape } : zone))
        : [...previous.zones, { id, name, shape }];

      const siteZones = { ...previous.siteZones };
      siteIds.forEach((siteId) => {
        siteZones[siteId] = id;
      });
      /* Explicit `null`, not a deleted key: a missing key falls back to the site book's own
         default, which would put the site straight back into the zone it just left. */
      (releasing || []).forEach((siteId) => {
        siteZones[siteId] = null;
      });

      return { ...previous, zones, siteZones };
    });

    setZoneEditor(null);
  };

  /**
   * Deleting a zone leaves its sites in no zone, and the Covers counts are where that shows.
   *
   * The days that used it are cleared here rather than left to `sanitise`. Both would end
   * up storing `null`, but the form is what the `Select` renders from, and a control whose
   * value is not in its option list is a React warning and an empty box.
   */
  const deleteZone = (zoneId) => {
    setForm((previous) => ({
      ...previous,
      zones: previous.zones.filter((zone) => zone.id !== zoneId),
      routeDays: previous.routeDays.map((day) =>
        day.zoneId === zoneId ? { ...day, zoneId: null } : day,
      ),
      siteZones: Object.fromEntries(
        Object.entries(previous.siteZones).filter(([, value]) => value !== zoneId),
      ),
    }));
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
    <Box className={`${classes.wrapper} ${zoneEditor ? classes.wrapperShifted : ''}`}>
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

        {/**
         * **Need by Date, as a scale. Third design for this row, and the reasoning matters
         * more than the control, so it is written down.**
         *
         * What the setting actually is: every site carries a contractual need-by date, and
         * this is how far off it the harmonizer may place a visit in order to build a route
         * that works. So the value is a **tolerance** — how much contract fidelity a planner
         * will trade for route efficiency. It is not a count of anything.
         *
         * **Why the two previous designs were wrong in the same way.** A `freeSolo` combobox
         * with a `±` adornment, and then a `[−] [ 7 ] [+]` stepper, both presented the value as
         * *a number to be entered*. Both are honest about the arithmetic and useless about the
         * decision: faced with `7`, a planner cannot tell whether 7 is careful or reckless
         * without already knowing the answer. A stepper says "count"; the question says "how
         * much". The control's shape should match the question's shape, and that is the whole
         * argument for the change.
         *
         * **Why a track.** Four reasons, in order of weight:
         *
         * 1. **It shows the bounds before you touch it.** 3 and 14 are the interesting facts
         *    about this value and neither previous design carried them — the combobox stated
         *    `3–14` in the palest 12px on the screen, and the stepper made you press a button
         *    until it died. On a scale, where you are *between* the ends is legible at a glance,
         *    which is exactly the judgment the digit cannot give.
         * 2. **One control, one value.** This screen has already tried and deleted the obvious
         *    alternative: the Harmonization Window row was a number field with `1 Week / 2
         *    Weeks / 4 Weeks` presets beside it, and the note left where it stood calls that
         *    "two controls for one number, which is the arrangement that eventually disagrees
         *    with itself". A preset row plus a field would be reintroducing the pattern this
         *    screen removed.
         * 3. **It can hold every stored value.** `needByDays` is any integer 3–14, and a saved
         *    rule may well hold 9. A posture-only chooser — Tight / Balanced / Flexible as three
         *    buttons, which is the tempting simple answer — cannot render 9 without growing a
         *    fourth "Custom" segment, which is failure 2 again.
         * 4. **It is the app's own vocabulary**, not an invention: `runSheets` already ships a
         *    styled `MuiSlider`, and `needBySlider` restates its exact rail, thumb and fill.
         *
         * **What was deliberately not built, because "just right" is mostly a list of refusals.**
         * No dual-handle range (the model is one symmetric number; splitting it into
         * before/after invents a second field and changes the stored shape). No calendar strip
         * with a shaded band around a sample date (pretty, and it illustrates a mechanic the
         * sentence already states, using a date that is fiction). And **no live "this would make
         * N more visits placeable" figure** — which is genuinely the most useful thing that
         * could sit here, and is not available: it needs the fitter run against the site book
         * from Settings, and this screen's model is static by design. That is an architecture
         * change, not a refinement, and pretending otherwise with an estimate would be worse
         * than saying nothing.
         *
         * **What carries the meaning, so the row is not merely a prettier number.** The
         * description column is a live readout in three parts: the **posture** (`Balanced` —
         * where in the range this sits, the thing the number cannot say), the **mechanic**
         * (`up to 7 days either side`), and the **span** (`a 15-day window`) — because `2n+1`
         * is the number a scheduler actually recognises, and it is what explains why 7 feels
         * larger than it looks. All three derive from the one value, so there is nothing that
         * can disagree.
         *
         * Typing is gone, and that is a real loss accepted on purpose: twelve values on a track
         * are reachable by drag and by arrow key, and the only reason free text was needed was
         * that the range used to be invisible.
         */}
        <Box className={classes.prefRow}>
          <Box className={classes.prefLabelGroup}>
            {/* Bound to the slider by `htmlFor`, which is why the `Slider` carries an `id` on
                its input: a `label` pointing at nothing focuses nothing, and this row's label
                was already the one on the screen that was not a real label. */}
            <Typography
              variant="subtitle2"
              component="label"
              htmlFor="harmonization-needBy"
              className={classes.prefLabel}
            >
              {tt('needBy')}
            </Typography>
            {/* **No `describeChild`.** It clones `title` onto the child, so hovering produced
                MUI's tip and then the OS one a second later saying the same sentence — verified
                in the browser, the button was carrying a `title` attribute. The tip becomes the
                button's `aria-label`, which is what the app's own `FieldLabel` does. */}
            <Tooltip arrow placement="top" title={tt('needByTooltip')} enterTouchDelay={0}>
              <Box
                component="button"
                type="button"
                className={classes.infoButton}
                aria-label={tt('needByTooltip')}
              >
                <InfoIcon aria-hidden="true" />
              </Box>
            </Tooltip>
          </Box>
          <Typography variant="body2" className={classes.prefText} id={hintIds('needBy').desc}>
            {tt('needByReadout', {
              posture: needByPosture(),
              days: needByDays,
              /* The window is `2n + 1` days: n either side, plus the need-by date itself. */
              span: needByDays * 2 + 1,
            })}
          </Typography>
          <Box className={classes.needByCell}>
            <Typography variant="body3" className={classes.needByBound} aria-hidden="true">
              {NEED_BY_MIN}
            </Typography>
            <Slider
              className={classes.needBySlider}
              value={needByDays}
              onChange={(event, value) => changeNeedBy(value)}
              min={NEED_BY_MIN}
              max={NEED_BY_MAX}
              step={1}
              /* No `marks`. Twelve ticks under a 120px rail is a texture, not a scale, and the
                 two ends are already labelled — which is the only part a planner reads. */
              size="small"
              slotProps={{
                input: { id: 'harmonization-needBy' },
              }}
              aria-label={tt('needBySliderAria')}
              aria-describedby={hintIds('needBy').desc}
              /* "9 days either side", not a bare "9". A screen reader gets no thumb position,
                 so the unit and the direction have to be in the value itself. */
              getAriaValueText={(value) => tt('needByValueText', { days: value })}
            />
            {/* The bounds are `aria-hidden`: the slider announces its own min and max, so a
                screen reader would otherwise hear "3" and "14" twice each. They are here for
                the eye, which gets no such announcement. */}
            <Typography variant="body3" className={classes.needByBound} aria-hidden="true">
              {NEED_BY_MAX}
            </Typography>
            <Typography variant="subtitle2" className={classes.needByValue} aria-hidden="true">
              {tt('needByWindowValue', { days: needByDays })}
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

      {/* ZONES ------------------------------------------------------------- */}
      {/**
       * The zones a day can be given, **one solution at a time.**
       *
       * Drawing a boundary and measuring a distance from a site are two different answers to
       * "which sites belong together", so the section shows one or the other rather than a
       * mixed list under a paragraph that describes both. The switch picks; the description
       * follows it.
       *
       * Zones that have not been defined yet appear under **either** solution, because they
       * have not committed to one — a zone added inline is still a candidate for a boundary
       * or a radius, and hiding it behind the switch would make it vanish the moment a
       * planner flipped the toggle after creating it.
       *
       * **No day column.** Which days use a zone is set in Installation Days and cannot be
       * changed from here, so a column showing it was read-only information in the one place
       * a planner could do nothing about it — and it crowded out the thing they can act on,
       * which is whether the zone is defined at all.
       */}
      <Box className={classes.section}>
        <Box className={classes.zoneSectionHead}>
          <Box className={classes.zoneSectionHeadText}>
            <Typography variant="h4" className={classes.sectionTitle}>
              {tt('zones')}
            </Typography>
            <Typography variant="body2" className={classes.sectionText}>
              {tt(isRadiusSolution ? 'zonesTextRadius' : 'zonesTextBoundary')}
            </Typography>
          </Box>

          <Box className={classes.solutionSwitch} role="group" aria-label={tt('zoneSolution')}>
            <Button
              className={`${classes.solutionOption} ${
                isRadiusSolution ? '' : classes.solutionOptionOn
              }`}
              onClick={() => setSolution(ZONE_SHAPE.BOUNDARY)}
              aria-pressed={!isRadiusSolution}
            >
              <BoundaryIcon />
              {tt('zoneMethodBoundary')}
            </Button>
            <Button
              className={`${classes.solutionOption} ${
                isRadiusSolution ? classes.solutionOptionOn : ''
              }`}
              onClick={() => setSolution(ZONE_SHAPE.RADIUS)}
              aria-pressed={isRadiusSolution}
            >
              <RadiusIcon />
              {tt('zoneMethodRadius')}
            </Button>
          </Box>
        </Box>

        {visibleZones.length || inlineName !== null ? (
          /**
           * **A stack of horizontal cards, not a table.** The column headings went with the
           * table: a card names itself, and `Zone` over a zone's own name was a label for a
           * label. See `zoneCards` in the sheet for why a zone is the one thing on this screen
           * that is an object rather than a setting, and what leaving the shared grid costs.
           */
          <Box className={classes.zoneCards}>
            {visibleZones.map((zone) => {
              const entry = coverage.byZone.find((candidate) => candidate.zone.id === zone.id);
              const siteCount = entry?.sites.length || 0;
              const filterCount = entry?.filters || 0;

              const shapeKind = zone.shape?.kind || null;
              /* A radius names the site it is centred on. The live book wins over the
                 denormalised `anchor.address` so a renamed site reads correctly. */
              const centreName =
                (zone.shape?.siteId ? siteById(zone.shape.siteId)?.name : null) ||
                zone.shape?.anchor?.address ||
                null;
              const definition =
                shapeKind === ZONE_SHAPE.RADIUS
                  ? centreName
                    ? tt('zoneDefRadius', { miles: zone.shape.radiusMiles, place: centreName })
                    : tt('zoneDefRadiusUnnamed', { miles: zone.shape.radiusMiles })
                  : shapeKind === ZONE_SHAPE.BOUNDARY
                    ? tt('zoneDefBoundary', { points: zone.shape.points.length })
                    : null;

              /* `zoneSitesFilters`, the key the table cell already used — the card needed the
                 same `{{sites}} · {{filters}}` string and briefly got a second one under its
                 own name, which is two keys to keep in step for one sentence. */
              const counts = tt('zoneSitesFilters', {
                sites: sitesLabel(siteCount),
                filters: filtersLabel(filterCount),
              });

              return (
                <Box key={zone.id} className={classes.zoneCard}>
                  {/**
                   * **The name and what it covers are one block, on one meta line.**
                   *
                   * They were two grid cells with the area stacked over the counts, which is
                   * the shape a column forces: the cell was narrow, so the answer wrapped. In
                   * a card the meta line has the whole width of the card minus two buttons, so
                   * `Drawn boundary · 8 points · 4 sites · 10 filters` reads as one sentence
                   * about coverage rather than two facts in a stack.
                   *
                   * A zone with no shape starts at the counts and says nothing about an area
                   * it has not got — the same reason "Not defined yet" came out. Membership is
                   * a field on the site, so an undrawn zone still covers whatever points at
                   * it, and the counts are true either way.
                   */}
                  <Box className={classes.zoneCardText}>
                    <Typography variant="subtitle2" className={classes.zoneNameText}>
                      {zone.name}
                    </Typography>
                    <Typography variant="body3" className={classes.zoneCovers}>
                      {definition ? `${definition} · ${counts}` : counts}
                    </Typography>
                  </Box>

                  {/**
                   * **Icons, and therefore tooltips — an icon-only control has to say its own
                   * name twice over.** `aria-label` names it for a screen reader and the
                   * `Tooltip` names it for anyone who cannot read a pencil, and both name the
                   * *zone* as well as the verb, because four identical pairs down a stack are
                   * otherwise four buttons called "Edit".
                   *
                   * **The box around each glyph came off.** They were bordered
                   * `variant="secondaryGrey"` `Button`s, and an outline is a promise that
                   * something inside is enterable — a field to fill, a menu to open. These are
                   * single-press actions on the card they already sit in, and two of them per
                   * card meant eight outlined boxes down a list of four zones, which read as a
                   * grid of controls beside the names they belong to rather than as two things
                   * a zone can do. `IconButton` is the app's own control for that: the glyph
                   * carries the meaning, and the hover ground carries the affordance the border
                   * used to.
                   *
                   * No `describeChild`, for the reason recorded on this screen's info buttons.
                   */}
                  <Box className={classes.zoneCardActions}>
                    <Tooltip arrow placement="top" title={tt('zoneEdit')} enterTouchDelay={0}>
                      <IconButton
                        className={classes.zoneIconButton}
                        aria-label={tt('zoneEditAria', { zone: zone.name })}
                        onClick={() =>
                          setZoneEditor({
                            zoneId: zone.id,
                            mode: shapeKind || solution,
                          })
                        }
                      >
                        <EditIcon aria-hidden="true" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip arrow placement="top" title={tt('zoneRemove')} enterTouchDelay={0}>
                      <IconButton
                        className={`${classes.zoneIconButton} ${classes.zoneIconButtonDanger}`}
                        aria-label={tt('zoneRemoveAria', { zone: zone.name })}
                        onClick={() => deleteZone(zone.id)}
                      >
                        <TrashIcon aria-hidden="true" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
              );
            })}

            {/* Adding, as a card in the same stack: a name is all a zone needs to exist and be
                pickable in the day table, and the shape comes later from its own Edit button.
                Dashed, because it is not a zone yet. */}
            {inlineName !== null ? (
              <Box className={classes.zoneInlineRow}>
                <TextField
                  className={classes.zoneInlineField}
                  value={inlineName}
                  autoFocus
                  onChange={(event) => setInlineName(event.target.value.slice(0, 40))}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') commitInlineZone();
                    if (event.key === 'Escape') setInlineName(null);
                  }}
                  placeholder={tt('zoneNamePlaceholder')}
                />
                <Box className={classes.zoneInlineActions}>
                  <Button variant="tertiaryGrey" onClick={() => setInlineName(null)}>
                    {tt('cancel')}
                  </Button>
                  <Button
                    variant="primary"
                    onClick={commitInlineZone}
                    disabled={!inlineName.trim()}
                  >
                    {tt('zoneInlineAdd')}
                  </Button>
                </Box>
              </Box>
            ) : null}
          </Box>
        ) : (
          <Box className={classes.zoneEmpty}>
            <Box className={classes.zoneEmptyText}>
              <Typography variant="subtitle2" className={classes.coverageTitle}>
                {tt(isRadiusSolution ? 'zoneEmptyTitleRadius' : 'zoneEmptyTitleBoundary')}
              </Typography>
              <Typography variant="body2" className={classes.sectionText}>
                {tt('zoneEmptyText')}
              </Typography>
            </Box>
          </Box>
        )}

        <Box className={classes.zoneAddRow}>
          {/**
           * **One way in.** There was a second button here that opened the map on a nameless
           * zone, which made two paths to one outcome and left the panel having to invent a
           * name for a zone that did not exist yet. Adding is naming; drawing is the row's
           * own Edit button. Each step now has exactly one place it happens.
           */}
          <Button
            variant="secondaryGrey"
            onClick={() => setInlineName('')}
            disabled={inlineName !== null}
          >
            {tt('zoneInlineAddOpen')}
          </Button>
        </Box>
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

        {/**
         * **The coverage bands are gone from this section.** There were three, in amber, above
         * the table: no installation days set, a zone no day covers, sites in no zone.
         *
         * Removed on request, and the reason they were removable is that every one of them was
         * a paragraph about a control a few pixels below it. "No installation days are set" is
         * seven unticked checkboxes. "Give a day the West zone" is the Zone column of seven
         * rows. The one finding with no control to point at — sites belonging to no zone — is
         * a fact about the site book, not about this rule, and it was reporting it from the one
         * screen that cannot change it.
         *
         * They also cost the screen its opening: a first visit has nothing switched on, so the
         * band fired every time and the first thing this configuration said about itself was
         * that it did not work yet.
         *
         * `zoneCoverage` still computes all three — `coverage.byZone` is what the Covers column
         * reads — so this is the display coming out, not the model. What survives is on the
         * controls: a worked day with no zone marks its own select.
         */}

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
              {/* Every worked day needs one, exactly as it needs a zone — stated on the column,
                  not discovered per row. The field is seeded with the default the moment a day
                  is switched on, so this marks a field that cannot be *cleared* rather than one
                  that starts empty. */}
              <RequiredAsterik />
              {/* On the column heading rather than in each of the seven cells: it is one fact
                  about the column, and seven copies would be seven tooltips saying the same
                  sentence.

                  **No `describeChild`** — see the Need by Date row. It clones `title` onto the
                  child, so the OS tooltip fired behind MUI's own saying the same sentence. The
                  tip is the button's `aria-label` now, matching the app's `FieldLabel`.

                  The `1–16 hrs` note that used to close this group is gone, on request, and with
                  it `shiftRange`. The field still clamps to those bounds on blur. */}
              <Tooltip arrow placement="top" title={tt('shiftTooltip')} enterTouchDelay={0}>
                <Box
                  component="button"
                  type="button"
                  className={classes.infoButton}
                  aria-label={tt('shiftTooltip')}
                >
                  <InfoIcon aria-hidden="true" />
                </Box>
              </Tooltip>
            </Box>
            {/* The third column, and the reason the whole table could move onto the form's
                grid — there was nothing to put here before. See `FORM_COLUMNS`. */}
            <Box className={classes.columnLabelRequired}>
              <Typography variant="subtitle3" className={classes.columnLabel}>
                {tt('columnZone')}
              </Typography>
              {/* Every worked day needs one, so the requirement is a standing fact about the
                  column rather than something each row discovers for itself. */}
              <RequiredAsterik />
            </Box>
          </Box>

          {WEEKDAYS.map(({ weekday, label }) => {
            const day = dayFor(weekday);

            return (
              <Box key={weekday} className={classes.dayRow}>
                {/**
                 * The tick and the weekday, together in the label column.
                 *
                 * They were columns 1 and 2 of the table's own four-column template, which is
                 * what put every weekday name 60px right of every label in the sections above.
                 * A selection control belongs with the thing it selects, and pairing them is
                 * what freed the row to use the form's grid.
                 *
                 * Tab order is unchanged — the checkbox is still first in the DOM, so the eye
                 * and the keyboard both meet the control before the name it applies to.
                 */}
                <Box className={classes.dayCell}>
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
                </Box>

                <Box className={classes.shiftCell}>
                  {day ? (
                    <>
                      {/**
                       * Mandatory, like the zone beside it — and the mark on the column
                       * heading is the whole of it, with **no red outline on the field.**
                       *
                       * One was written and then taken out, because it cannot be reached.
                       * The only way this field is empty is mid-retype, and blur clamps it
                       * straight back to a legal number; while it is focused the brand focus
                       * ring beats the alert border anyway, and rightly — a field you are
                       * typing in should look focused. Verified in the browser: cleared, the
                       * field showed the focus ring, and blurring restored `8` rather than
                       * revealing a required state. So there is no state to draw, and the
                       * asterisk is a statement about the column rather than a validator
                       * waiting for a failure that the clamp makes impossible.
                       *
                       * The zone select is the opposite case and keeps its outline: `null` is
                       * a value it can hold and be left holding.
                       */}
                      <TextField
                        className={classes.numberField}
                        value={day.shiftHours}
                        onChange={(event) => changeShiftHours(weekday, event.target.value)}
                        onBlur={() => blurShiftHours(weekday)}
                        inputProps={{
                          inputMode: 'numeric',
                          'aria-label': tt('shiftAria', { day: label }),
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

                {/**
                 * The one zone this day covers (D15 — a day and a runsheet are 1:1).
                 *
                 * `displayEmpty` with a placeholder rather than a disabled control or an
                 * error state: a worked day with no zone is legal and means exactly what it
                 * says — the crew works, and nothing can legally land on them. Refusing to
                 * store the day until it had a zone would make switching a day on a two-step
                 * commit. The control marks itself instead, which is all that is left of the
                 * band that used to report this from above the table.
                 */}
                {day ? (
                  <Box className={classes.zoneCell}>
                    <Select
                      value={day.zoneId || ''}
                      onChange={(event) => changeDayZone(weekday, event.target.value)}
                      displayEmpty
                      className={`${classes.zoneSelect} ${
                        day.zoneId ? '' : `${classes.zoneSelectEmpty} ${classes.fieldRequired}`
                      }`}
                      inputProps={{ 'aria-label': tt('zoneAria', { day: label }) }}
                      renderValue={(value) => {
                        if (!value) return tt('zoneNonePlaceholder');
                        return zoneNameOf(value);
                      }}
                    >
                      <MenuItem value="">{tt('zoneNone')}</MenuItem>
                      {form.zones.map((zone) => (
                        <MenuItem key={zone.id} value={zone.id}>
                          {zone.name}
                        </MenuItem>
                      ))}
                    </Select>
                    {/* On the field, in the row it belongs to. A worked day with no zone can
                        take no work — a fact about this select, which the band two hundred
                        pixels above it was reporting from a distance. */}
                    {day.zoneId ? null : (
                      <Typography variant="body3" className={classes.zoneRequiredNote}>
                        {tt('zoneRequired')}
                      </Typography>
                    )}
                  </Box>
                ) : (
                  /* The cell keeps its height whichever child it holds, so switching a day
                     on cannot shift the rows under it. */
                  <Typography variant="body2" className={classes.shiftPlaceholder}>
                    &mdash;
                  </Typography>
                )}
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
      {/**
       * The zone editor, as a right-hand panel over the list it is adding to.
       *
       * `otherZones` is what makes adding a second zone possible rather than guesswork: the
       * shapes already drawn are handed over so the panel can show them, greyed and inert,
       * under the one being edited. Only the active zone answers a click — the others have
       * no handler to reach, so "you cannot edit them here" is structural rather than a
       * flag somebody could forget to check.
       *
       * `currentSiteIds` lets the panel warn before it takes sites *out* of a zone: saving
       * a shape replaces membership, so redrawing North to add one site would otherwise
       * drop two others off the far edge silently.
       */}
      <ZoneEditorPanel
        open={Boolean(zoneEditor)}
        zone={zoneEditor?.zoneId ? form.zones.find((z) => z.id === zoneEditor.zoneId) : null}
        initialMethod={zoneEditor?.mode || ZONE_SHAPE.BOUNDARY}
        sites={ZONE_SITES}
        basePoint={anchorFor('startLocation')}
        otherZones={form.zones
          .filter((zone) => zone.id !== zoneEditor?.zoneId && zone.shape)
          .map((zone) => ({
            id: zone.id,
            name: zone.name,
            kind: zone.shape.kind,
            points: zone.shape.points || [],
            anchor: zone.shape.anchor || null,
            radiusMiles: zone.shape.radiusMiles,
          }))}
        currentSiteIds={
          zoneEditor?.zoneId
            ? (
                coverage.byZone.find((entry) => entry.zone.id === zoneEditor.zoneId)?.sites || []
              ).map((site) => site.id)
            : []
        }
        onCancel={() => setZoneEditor(null)}
        onSave={saveZone}
      />

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
