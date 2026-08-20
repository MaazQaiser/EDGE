import { Box, Checkbox, Chip, ListItemText, MenuItem, Select, Typography } from '@mui/material';
import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  NEED_BY_MAX,
  RADIUS_MIN_MILES,
} from 'src/app/common/pages/settings/preferences/harmonization/harmonizationSettings';
import GoogleMapSearchAddressComponent from 'src/app/components/common/googleMap/searchAddress';
import DateRangePicker from 'src/app/components/common/RangeDatepicker';

import { useStyles } from '../harmonize.styles';
import { useStyles as useWorkspaceStyles } from '../harmonizeWorkspace.styles';
import { RANGE_MAX_DAYS } from '../useHarmonizeRun';
import AddressSearchField from './AddressSearchField';
import FieldLabel from './FieldLabel';
import { MinusIcon, PlusIcon } from './Glyphs';

/**
 * ISO weekdays, named by dayjs rather than by seven i18n keys.
 *
 * There are deliberately no locale keys for the day names: taking them from dayjs is
 * what makes the field follow the app's own locale instead of a hardcoded English list
 * that would have to be translated a second time. `weekday % 7` because dayjs counts
 * Sunday as `0` while ISO counts it as `7`, so `day(7)` would ask for next week's
 * Sunday — the same name, but a date a week out, which is a trap the moment anyone
 * reaches for the `dayjs` object here for anything but its format.
 *
 * The long name is the menu row, because a menu has room for it and `Wednesday` is
 * unambiguous where `Wed` needs a beat to parse. The short name is the chip, because
 * seven full words do not fit a 300px field and `Mon Tue Thu` is read as a *set* at a
 * glance in a way a wrapped list of full words is not.
 */
const WEEKDAYS = Array.from({ length: 7 }, (_, index) => {
  const weekday = index + 1;
  return {
    weekday,
    label: dayjs()
      .day(weekday % 7)
      .format('dddd'),
    short: dayjs()
      .day(weekday % 7)
      .format('ddd'),
  };
});

/** The install-days label names its own `Select` for a screen reader — see `FieldLabel`. */
const INSTALL_DAYS_LABEL_ID = 'harmonize-install-days-label';

/**
 * A number, drawn to the supplied design: name and consequence left, value between two discs.
 *
 * **Local to this file rather than a component of its own**, because two fields draw it and
 * both are here. Lifting it to `components/` would be the third home a numeric control in
 * this column has had in four passes, and the last two — `OptionPills`, and the boxed stepper
 * before it — each ended up deleted with the pass that introduced them. It moves out when a
 * third caller appears.
 *
 * `classes` is a prop rather than a `useStyles()` call, matching `StopRowParts`: the sheet is
 * one JSS sheet and the caller already holds it.
 *
 * **The discs do not take focus on press.** A stepper end that steals focus from the value it
 * changes leaves a screen reader announcing a button instead of a number, which is why the
 * live region below the pair exists — the same arrangement the deleted stepper used, kept
 * because the reason for it did not change with the shape.
 */
const CounterField = ({
  classes,
  label,
  tip,
  hint,
  value,
  decreaseLabel,
  increaseLabel,
  canDecrease = true,
  canIncrease = true,
  onDecrease,
  onIncrease,
}) => (
  <Box className={classes.field}>
    <Box className={classes.counterField}>
      <Box className={classes.counterText}>
        <FieldLabel text={label} tip={tip} className={classes.counterLabel} />
        {hint ? <Typography className={classes.counterHint}>{hint}</Typography> : null}
      </Box>

      <Box className={classes.counterControl}>
        <button
          type="button"
          className={classes.counterButton}
          disabled={!canDecrease}
          aria-label={decreaseLabel}
          onMouseDown={(event) => event.preventDefault()}
          onClick={onDecrease}
        >
          <MinusIcon className={classes.counterButtonIcon} />
        </button>

        <Typography className={classes.counterValue}>{value}</Typography>

        <button
          type="button"
          className={classes.counterButton}
          disabled={!canIncrease}
          aria-label={increaseLabel}
          onMouseDown={(event) => event.preventDefault()}
          onClick={onIncrease}
        >
          <PlusIcon className={classes.counterButtonIcon} />
        </button>
      </Box>
    </Box>

    {/* The value, for a screen reader parked on a disc that deliberately does not take
        focus — see the docstring, and `srOnly`. */}
    <Box className={classes.srOnly} aria-live="polite">
      {value}
    </Box>
  </Box>
);

CounterField.propTypes = {
  classes: PropTypes.object.isRequired,
  label: PropTypes.string.isRequired,
  tip: PropTypes.string,
  /** The fact under the name: what this setting currently reaches, or why it is capped. */
  hint: PropTypes.node,
  /** Drawn with its unit — `15 mi`, `± 7` — so the row states what the number counts. */
  value: PropTypes.node.isRequired,
  decreaseLabel: PropTypes.string,
  increaseLabel: PropTypes.string,
  canDecrease: PropTypes.bool,
  canIncrease: PropTypes.bool,
  onDecrease: PropTypes.func,
  onIncrease: PropTypes.func,
};

/**
 * The question, in the order the optimizer asks it.
 *
 * **Broad to specific, top to bottom.** *When* — the window a single run may reach for a
 * route day, then which weekdays inside it it may land on. *Where from* — the point the
 * van leaves and returns to. *Who is in* — the need-by window that decides which visits
 * the solver ever sees, and the crew that decides how much of them fit.
 *
 * **This column is now the whole of the asking, and that is the layout's organising
 * idea.** The right-hand side of the screen belongs to the optimizer: it is empty until
 * the planner presses Harmonize at the foot of this column, and from then on it is the
 * answer being drawn. So nothing on this side is a filter over a finished result and
 * nothing on that side is a control — the screen has a question half and an answer half,
 * and the press is the seam between them.
 *
 * Every value is seeded from the franchise's harmonization settings and none of them
 * write back. Turning a knob here changes this run only, and the column says so once
 * rather than on each field. After the first press the knobs stay live: an edit re-solves
 * and the answer settles into its new shape rather than replaying the whole narration.
 */
const SetupColumn = ({ run, startPoint, startAddress, placesReady }) => {
  const classes = useStyles();
  const workspace = useWorkspaceStyles();
  const { t } = useTranslation();
  const tt = (key, options) => t(`obx.runsheet.harmonize.${key}`, options);

  /* The address field's own text, which is not the same thing as the start point: a
     planner half-way through typing has a query and still has the previous origin. */
  const [addressQuery, setAddressQuery] = useState('');

  const {
    rule,
    rangeDates,
    setPlanWindow,
    runDays,
    weekdays,
    weekdaysOverridden,
    setWeekdays,
    needByDays,
    needByCeiling,
    needByFloor,
    setNeedByDays,
    radiusMiles,
    setRadiusMiles,
    radiusReachMiles,
    /* The crew size is *not* destructured here. It still governs the day's budget and it is
       still seeded from the officers named against the install days — it simply has no
       control on this screen (see the note at the foot of this file), and binding values
       nothing renders left this module failing lint for two passes. `run.installers` is
       where they are, unchanged, for whoever puts the field back. */
    targetDayLabel,
    coversCount,
    radiusOutsideCount,
    needByOutsideCount,
    needByReachDays,
  } = run;

  /**
   * One line under the day chips, and every branch of it is a fact about this run.
   *
   * `runDays.length` is not `weekdays.length` and the difference is the whole reason the
   * line exists: ticking Saturday adds a weekday, and whether it adds a *route day*
   * depends on whether the plan window reaches one. Four days ticked over a three-day
   * window is two route days, and the field that says "4 chips" cannot say that.
   *
   * The provenance rides along only while the planner has not touched the ticks. It is
   * borderline for the "hints are facts, tips are mechanism" rule this column follows —
   * but "these are still your Installation Days" stops being true the moment a chip
   * moves, and a fact that expires belongs beside the control rather than in a tip that
   * reads the same forever.
   *
   * **`rule.fromSettings` as well as `weekdaysOverridden`, and the two are not the same
   * test.** `weekdaysOverridden` is false whenever the planner has not touched the ticks —
   * including on a tenant with no route days saved at all, where `resolveHarmonizeRule`
   * has assumed Monday so the drawer is not silently useless. Claiming *From your
   * Installation Days* over an assumption is the field asserting a setting that does not
   * exist, and a planner who then opened Settings to find the Monday would find nothing
   * there. That case has no line of its own here; the tip carries it, via the same
   * `tipFromDefault` sentence the two knobs below already use for it.
   */
  const installDaysHint = weekdays.length
    ? [
        tt('installDaysHint', { count: runDays.length }),
        !weekdaysOverridden && rule.fromSettings ? tt('installDaysFromSettings') : null,
      ]
        .filter(Boolean)
        .join(' · ')
    : tt('installDaysNone');

  /**
   * The funnel's three counts add back up to the total, so the total is derived.
   *
   * Moved here from `RuleStrip`, unchanged: `useHarmonizeRun` splits the run into what is
   * inside both gates, what the radius refused and what the need-by window refused, and
   * summing them is what stops a tip quoting a figure that disagrees with the counts it
   * is drawn from.
   */
  const totalCount = coversCount + radiusOutsideCount + needByOutsideCount;
  const needByCoversCount = totalCount - needByOutsideCount;

  /**
   * Whether the need-by field may report a count at all.
   *
   * Nothing in play is the empty workspace — `Reaches all 0` there is a boast about an
   * empty set. And a loss with no legal window that would recover it is an unactionable
   * scoreboard: those visits carry their own contract window, no setting here reaches
   * them, so the field says what it is measured against instead and the triage panel
   * names them.
   */
  const showNeedByCovers = totalCount > 0 && (needByOutsideCount === 0 || needByReachDays != null);

  const needByTip = [
    tt('tipNeedBy'),
    showNeedByCovers
      ? tt('tipNeedByCovers', {
          covers: needByCoversCount,
          total: totalCount,
          outside: needByOutsideCount,
        })
      : null,
    tt(rule.fromSettings ? 'tipFromSettings' : 'tipFromDefault'),
  ]
    .filter(Boolean)
    .join(' ');

  /**
   * How wide the Harmonize window is, and which need-by pills it puts out of reach.
   *
   * The ceiling itself is the hook's — `needByCeiling` — because the rule has to plan
   * against it and the plan's staleness has to notice it moving. What is computed here is
   * only the *presentation* of it: which segments are drawn disabled, and the sentence that
   * says why, which needs the window's own width in days rather than the ceiling it
   * produced.
   */
  const windowDays =
    rangeDates?.[0]?.isValid?.() && rangeDates?.[1]?.isValid?.()
      ? rangeDates[1].diff(rangeDates[0], 'day') + 1
      : null;
  const needByCapped = needByDays >= needByCeiling && needByCeiling < NEED_BY_MAX;

  return (
    <>
      <Box className={workspace.setupGroup}>
        <Box className={workspace.stackedFields}>
          <Box className={classes.field}>
            <FieldLabel text={tt('planWindow')} tip={tt('tipPlanWindow')} />
            <DateRangePicker
              selectedDates={rangeDates}
              setDates={([from, to]) => setPlanWindow(from, to)}
              /* **dayjs, not `Date`** — the component's propTypes ask for
                 `instanceOf(Date)` and its adapter cannot use one: these go straight
                 through to MUI's `DatePicker`, which is running `AdapterDayjs` and calls
                 `value.isUTC()` on them. Passing a `Date` throws `value.isUTC is not a
                 function` and takes the whole screen down. The propTypes are wrong, not
                 the adapter. */
              minDate={dayjs().startOf('day')}
              maxDate={dayjs().add(RANGE_MAX_DAYS, 'day').startOf('day')}
              /* US format regardless of the tenant's own date-format setting. This
                 screen states every other date the same way (`Mon 24 Aug`, `ddd D MMM`),
                 and the one editable field disagreeing with the eleven read-only ones
                 around it read as a different screen's control left behind. */
              format="MM/DD/YYYY"
              styleClass={classes.rangePicker}
              syncSelectedDatesOnStateChange
            />
            {/* **No hint here any more.** It was `planWindowHintDays` — *2 route days in
                here.* — and its own comment already conceded the shape of the problem: it
                hid itself at one day "because that is what the field below it already
                says". The field below says it at every count now, in the same words, 60px
                lower. One number stated twice in a 300px column is the kind of repetition
                this panel has spent passes deleting, and the install-days field is the
                better home for it: the route-day count is what the window and the ticked
                weekdays produce *together*, so it belongs under the second of the two
                controls rather than the first. */}
          </Box>

          <Box className={classes.field}>
            {/* **Weekdays, not a date.** This was a single `DatePickerField` holding route
                one's own day, hoisted out of the first card so a run-level decision did
                not sit inside a panel that is shut most of the time. A run plans as many
                routes as it has days with work for them, so the run-level question is no
                longer "which day" but "which weekdays may it use" — one route per day
                that earns one. The dates themselves are back where they belong, on the
                cards, and every card carries one now including the first. */}
            {/* **`tipFromDefault` only, and only on the branch that needs correcting.**
                `tipInstallDays` states flatly that the ticks start from the Installation
                Days in Settings, which is untrue on a tenant that has none:
                `resolveHarmonizeRule` assumes Monday so the workspace is not silently
                useless, and `tipFromDefault` is the sentence that says so. Its counterpart
                `tipFromSettings` is *not* appended on the other branch — it reads "Both
                come from Settings", written for the two knobs below, and there is one
                value here; `tipInstallDays` already names Settings and the this-run-only
                promise, so it is complete on its own. */}
            <FieldLabel
              id={INSTALL_DAYS_LABEL_ID}
              text={tt('installDays')}
              tip={
                rule.fromSettings
                  ? tt('tipInstallDays')
                  : `${tt('tipInstallDays')} ${tt('tipFromDefault')}`
              }
            />
            <Select
              multiple
              /* Kept so `renderValue` is still called with nothing ticked, which is a
                 real answer the planner can give: no days, therefore no run. The field
                 stays empty and the hint below carries the imperative — a placeholder
                 saying "choose a day" inside the box would be the same sentence twice,
                 16px apart. */
              displayEmpty
              labelId={INSTALL_DAYS_LABEL_ID}
              className={classes.daysSelect}
              value={weekdays}
              /* `Set` because MUI hands back whatever it was given plus the click, and
                 sorted because the ticks should read in the week's order however the
                 planner happened to tick them — the same normalising the settings screen
                 does before it stores the rule. */
              onChange={(event) =>
                setWeekdays([...new Set(event.target.value)].sort((a, b) => a - b))
              }
              MenuProps={{ classes: { paper: classes.daysMenu } }}
              renderValue={(selected) => (
                <Box className={classes.dayChips}>
                  {selected.map((weekday) => (
                    <Chip
                      key={weekday}
                      size="small"
                      className={classes.dayChip}
                      label={WEEKDAYS.find((day) => day.weekday === weekday)?.short}
                    />
                  ))}
                </Box>
              )}
            >
              {WEEKDAYS.map(({ weekday, label }) => (
                <MenuItem key={weekday} value={weekday} className={classes.dayOption}>
                  <Checkbox
                    className={classes.dayOptionCheckbox}
                    checked={weekdays.includes(weekday)}
                  />
                  <ListItemText primary={label} />
                </MenuItem>
              ))}
            </Select>
            <Typography className={classes.fieldHint}>{installDaysHint}</Typography>
          </Box>
        </Box>
      </Box>

      <Box className={workspace.setupGroup}>
        {/* A field with a street address in it. Whichever rung answered — the device, the
            franchise, or the centre of the week's own work — it is reverse-geocoded
            before it lands here, and it is not labelled with which one: the field asks
            where the day starts, and how we guessed is the screen's problem. */}
        <Box className={classes.field}>
          <Box className={classes.labelRow}>
            <FieldLabel text={tt('startEnd')} tip={tt('tipStartEnd')} />
            {/* Two different waits, named separately. Finding the coordinate and finding
                out what it is called are consecutive steps, and a single "Locating…" over
                a box that already holds a lat/lng describes the wrong one. */}
            {startPoint.isLocating ? (
              <Box component="span" className={classes.labelHint}>
                {tt('locating')}
              </Box>
            ) : startPoint.isResolving ? (
              <Box component="span" className={classes.labelHint}>
                {tt('resolvingAddress')}
              </Box>
            ) : null}
          </Box>

          {placesReady ? (
            <Box className={classes.addressSearch}>
              <GoogleMapSearchAddressComponent
                isLoaded={placesReady}
                isUsedInMap
                formKey="harmonize-address"
                placeHolder={tt('addressPlaceholder')}
                address={addressQuery || startAddress}
                setAddress={setAddressQuery}
                setActiveMarker={() => {}}
                setSelectedLocation={(location) => {
                  if (!location?.position) return;
                  startPoint.setAddress({
                    name: location.name,
                    address: location.name,
                    lat: location.position.lat,
                    lng: location.position.lng,
                  });
                }}
              />
            </Box>
          ) : (
            <AddressSearchField
              key={startPoint.defaultKey}
              defaultValue={startAddress}
              placeholder={tt('addressPlaceholder')}
              onSelect={(location) => startPoint.setAddress(location)}
            />
          )}

          {/* `canUseDevice`, not `devicePoint`. A fix the ladder has refused for being
              12,000km from the work is a fix this button cannot apply either —
              `clearAddress` would drop back to the same rejected rung and nothing would
              change. Offering it there is a button that silently does nothing. */}
          {startPoint.canUseDevice && startPoint.source !== 'device' ? (
            <button
              type="button"
              className={classes.linkButton}
              onClick={() => startPoint.clearAddress()}
            >
              {tt('startUseCurrent')}
            </button>
          ) : null}
        </Box>

        {/**
         * **The radius is back in the column, and it is in this group rather than beside the
         * need-by window.**
         *
         * The twentieth pass took it out for a good reason: on the happy path every visit is
         * inside the circle, so the control sat at whatever Settings gave it and was the only
         * field here whose job was to *exclude* work. What has changed is that the map is now
         * drawn from the first frame with this ring on it, so the field is no longer a knob
         * with an invisible consequence — it is one half of a two-part gesture where the other
         * half is watching the circle grow and the count under it move.
         *
         * It belongs under the origin because that is what it is measured from. §11 of
         * `harmonization-settings.md` keeps two origins for two questions; this feature
         * deliberately has one — the van leaves from here, returns here, and the circle is
         * drawn around the same point — so the address and the distance from it are one
         * question asked in two fields, and putting them 28px apart in separate groups said
         * they were two.
         */}
        {/**
         * **The radius, as the supplied design draws a number: a label, its consequence, and
         * two discs.**
         *
         * This field has worn four shapes in four passes — a boxed stepper, nothing at all, a
         * slider, a boxed stepper again — and the churn came from asking the wrong question
         * each time (*is this continuous? is it bounded? does it deserve a control at all?*).
         * The design settles it by answering a different one: what does the planner need
         * on screen at the moment they touch this? A name, the number, and **what it
         * currently costs them** — which is why the coverage count is the sub-label rather
         * than a hint three rows down.
         *
         * No maximum. `−` stops at `RADIUS_MIN_MILES` because a zero-mile radius is a run
         * that can reach nothing; `+` never stops, because nobody has yet decided what the
         * furthest a franchise will drive is, and a control that silently refuses is worse
         * than one that accepts an unusual answer.
         */}
        <CounterField
          classes={classes}
          label={tt('radiusLabel')}
          tip={tt('tipRadius')}
          hint={
            radiusOutsideCount
              ? tt('radiusCoversHint', {
                  covers: coversCount,
                  total: coversCount + radiusOutsideCount,
                })
              : tt('radiusCoversHintAll', { count: coversCount })
          }
          value={tt('radiusValue', { mi: radiusMiles })}
          decreaseLabel={tt('radiusDecrease')}
          increaseLabel={tt('radiusIncrease')}
          canDecrease={radiusMiles > RADIUS_MIN_MILES}
          onDecrease={() => setRadiusMiles(radiusMiles - 1)}
          onIncrease={() => setRadiusMiles(radiusMiles + 1)}
        />

        {/* The remedy, on its own line under the row. Present exactly when the circle refuses
            something *and* a legal radius reaches it — `radiusReachMiles` is the smallest that
            would, so the link names a number instead of telling the planner to widen
            something. Below rather than inside the row: the row's right-hand third belongs to
            the two discs, and a link squeezed beside them would be a third control in the
            space made for two. */}
        {radiusOutsideCount && radiusReachMiles != null ? (
          <Box className={classes.hintRow}>
            <button
              type="button"
              className={classes.linkButton}
              onClick={() => setRadiusMiles(radiusReachMiles)}
            >
              {tt('remedyRadius', { mi: radiusReachMiles })}
            </button>
          </Box>
        ) : null}
      </Box>

      <Box className={workspace.setupGroup}>
        {/* **One knob now, not two.** The radius stepper that used to sit beside this is
            gone from the panel: on the happy path every visit in the window is inside the
            circle, so the control spent its life at the value Settings gave it, and it was
            the only field here whose job was to *exclude* work rather than to describe the
            run. It has not lost its remedy — where the radius genuinely does refuse
            something, the triage panel under the plan says so and offers the exact mileage
            that would let it in, which is the moment the number is worth touching. A
            setting that only matters in one case belongs where that case is reported. */}
        {/**
         * **The need-by window, in the same row shape as the radius above it.**
         *
         * It was four pills — ± 3 / ± 5 / ± 7 / ± 14 — on the argument that a franchise works
         * to one of four windows and a planner should see the whole set. The design makes both
         * numbers a stepper, and what that costs is the visible set; what it buys is worth
         * more than the set was. Two controls that ask the same kind of question now look the
         * same, the ceiling is enforced by a `+` that stops rather than by segments greyed at
         * the end of a row, and **the remedy link sets the figure it names** — *Allow ± 8*
         * sets 8, where the pills made it print 8, set 14, and light a segment the sentence
         * had never mentioned.
         *
         * The sub-label carries the same fact the radius row's does: what this setting reaches,
         * or when the window is what is capping it, that it is capped and by what.
         */}
        <CounterField
          classes={classes}
          label={tt('needByLabel')}
          tip={needByTip}
          hint={
            needByCapped
              ? tt('needByCapped', { days: needByCeiling, window: windowDays })
              : showNeedByCovers
                ? needByOutsideCount
                  ? tt('needByCoversHint', {
                      covers: needByCoversCount,
                      outside: needByOutsideCount,
                    })
                  : tt('needByCoversHintAll', { count: totalCount })
                : /* What the window is measured *from*, which is what this line said before a
                     count earned the slot. */
                  targetDayLabel
                  ? tt('needByOf', { day: targetDayLabel })
                  : tt('needByOfDue')
          }
          value={tt('needByValue', { days: needByDays })}
          decreaseLabel={tt('needByDecrease')}
          increaseLabel={tt('needByIncrease')}
          canDecrease={needByDays > needByFloor}
          /* The ceiling is the narrower of the policy's own maximum and the width of the
             Harmonize window — see `needByCeiling`. A `+` that stops is the whole of how that
             limit is now expressed, which is why the sub-label above says so in words. */
          canIncrease={needByDays < needByCeiling}
          onDecrease={() => setNeedByDays(needByDays - 1)}
          onIncrease={() => setNeedByDays(needByDays + 1)}
        />

        {/* Present exactly when there is a loss and a window that recovers it. The press sets
            `needByReachDays` itself — the exact window that would reach the refused visits —
            so the offer, the press and the value on screen are one number. */}
        {showNeedByCovers && needByReachDays != null ? (
          <Box className={classes.hintRow}>
            <button
              type="button"
              className={classes.linkButton}
              onClick={() => setNeedByDays(needByReachDays)}
            >
              {tt('remedyNeedBy', { window: tt('dayCount', { count: needByReachDays }) })}
            </button>
          </Box>
        ) : null}

        {/**
         * **The installers field is hidden, not deleted.**
         *
         * The crew size still governs the day — `budgetFor` multiplies the weekday's shift
         * hours by it, the meter on the card reads `/ 16 hr` because of it, and it is still
         * seeded from the officers the franchise has named against these install days. What is
         * gone is the *control*: a planner does not choose how many people they employ from a
         * planning screen, and offering the choice here invited them to plan a day for a crew
         * they do not have. It follows Settings, silently, which is what a derived value should
         * do.
         *
         * Kept in place rather than removed because the value is real and the wiring is
         * correct — see `configuredInstallers`. If it should be adjustable per run, this block
         * is the whole of the change.
         */}
      </Box>
    </>
  );
};

SetupColumn.propTypes = {
  /** The whole run, from `useHarmonizeRun`. */
  run: PropTypes.object.isRequired,
  /** The origin ladder, from `useStartPoint`. */
  startPoint: PropTypes.object.isRequired,
  /** The origin as a street, however it was arrived at. */
  startAddress: PropTypes.string,
  /** Whether Google Places can back the address field. */
  placesReady: PropTypes.bool,
};

export default SetupColumn;
