import { Box, Tooltip, Typography } from '@mui/material';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { formatMiles, formatMinutesLong } from '../durations';
import { STOP_TONES, useStyles } from '../harmonize.styles';
import { WarningDisc } from './Glyphs';
import { StopPinIcon } from './StopPinIcon';
import { DragHandle, StopFigure, StopRow } from './StopRowParts';

/**
 * One visit the plan left out, drawn as the stop it would have been.
 *
 * **The row is a route row in amber.** It was a 7px hollow ring and a name; it is now
 * the grip, the pin, the name and the `12 mi · 1 hr 29 min` figure that the planned
 * stops above it carry — the same `StopFigure` and the same `StopRow`, not a
 * lookalike — with the amber tone in place of the blue. That is the point of the restyle
 * rather than a side effect of it: these visits are being weighed *against* the routes,
 * and a footnote drawn in a different vocabulary from the thing it is a footnote to makes
 * the reader translate before they can compare.
 *
 * **The name keeps its tooltip and the chevron opens something else.** The two answer
 * different questions — the tip says *why this is out* (`due Fri 28 Aug · 4 days out`),
 * the chevron says *how much work it is* — so neither is the other's duplicate, and the
 * tip's original defence still holds unchanged: the name is ellipsis-truncated, so the
 * row wanted a tip to recover a clipped site name whatever else it carried, and the
 * detail is repeated as visually hidden text because MUI only mounts tooltip content
 * while the popper is open and a screen reader moving down this list would otherwise
 * hear names with no reasons.
 *
 * The grip is **decorative, and deliberately not a control**: a `div` rather than a
 * `button`, `aria-hidden`, no drag payload, no focus stop. The mockup draws a handle on
 * these rows and the intent is clear enough — drag an excluded visit onto a route — but
 * nothing on this screen accepts that drop yet (`dropSpillRoute` is a button on the
 * spill ribbon, not a drop target), and a `button` with a `grab` cursor that swallows a
 * gesture and does nothing is the "control that is rendered and then refuses" this
 * feature's own stop list argues against. Drawn, so the row is the shape it will be;
 * inert, so it makes no promise.
 */
const ExcludedRow = ({ visit, classes, tt, open, onToggle, showTrack }) => {
  const name = visit.siteName || visit.site;
  const key = visit.id || visit.siteId;

  const anchor = (
    /* `tabIndex` only when there is something to open. A focus stop that shows nothing is
       worse than no focus stop — it is a promise the row does not keep. */
    <Box className={classes.outsideAnchor} tabIndex={visit.detail ? 0 : undefined}>
      <Typography className={classes.outsideName}>{name}</Typography>
      {visit.detail ? (
        <Box component="span" className={classes.srOnly}>
          {visit.detail}
        </Box>
      ) : null}
    </Box>
  );

  return (
    /**
     * **The same `StopRow` a planned stop is built from, in amber.**
     *
     * That is the point of the shared component rather than a side effect of it: these visits
     * are being weighed *against* the routes above them, and a footnote drawn in a different
     * vocabulary from the thing it annotates makes the reader translate before they can
     * compare. It also switches the separators off — `outsideRow` drew a hairline on top of
     * every row but its first, which was right when these were a plain list; with a dashed
     * track between them a hairline as well is two dividers for one gap, and every row is now
     * its own `:first-child`.
     */
    <Box
      /* Keyed on the visit's own `reason`, not on being inside this panel. Every group
         `triageGroups` builds sets one — the capacity group is spread with `EXCLUDED.CAPACITY`
         for this rule specifically — so a row that arrives here *without* a reason is telling
         us it is not excluded, and renders at full strength. */
      className={classNames(classes.outsideRow, visit.reason && classes.outsideRowExcluded)}
    >
      <StopRow
        classes={classes}
        /* Amber, from the pin's own tone, so the track and the marks it joins are one object.
           `showTrack` is false on the last row of the whole panel and nowhere else — it runs
           *through* the group headings, which is what makes several groups read as the single
           list the design draws. */
        lineColor={showTrack ? STOP_TONES.excluded.line : 'transparent'}
        /* One pair, because the other two a planned stop shows cannot honestly be drawn here:
           there is no travel time to a visit that is on no route, and no arrival clock. */
        details={
          open
            ? [
                {
                  key: 'filters',
                  label: tt('rowFilterInstall', { count: visit.filterCount }),
                  value: formatMinutesLong(visit.serviceMinutes),
                },
              ]
            : []
        }
        grip={
          /* **Decorative, and deliberately not a control**: a `div` rather than a `button`,
             `aria-hidden`, no drag payload, no focus stop. The design draws a handle on these
             rows and the intent is clear enough — drag an excluded visit onto a route — but
             nothing here accepts that drop yet (`dropSpillRoute` is a button on the spill
             ribbon, not a drop target), and a `button` with a `grab` cursor that swallows a
             gesture and does nothing is the "control that is rendered and then refuses" the
             stop list's own notes argue against. Drawn, so the row is the shape it will be;
             inert, so it makes no promise. */
          <Box className={classes.stopGrip} aria-hidden="true">
            <DragHandle className={classes.stopGripIcon} />
          </Box>
        }
        pin={
          /* No number in it. A planned stop's digit is its place in a sequence and these
             visits are in no sequence — a numeral here would invite the planner to look for
             stop 1 on the map. `maskId` is prefixed for this surface because three cards and
             this panel render pins together and a repeated id resolves to whichever mask the
             document defined last.

             `blank`, so this stays the plain outline it always was: the fallback dot a
             numberless pin now draws elsewhere is a newer surface's own decision, and this
             panel's own pin is not the place for it to arrive uninvited. */
          <StopPinIcon
            blank
            tone={STOP_TONES.excluded}
            className={classes.stopMarker}
            maskId={`excludedPinRim-${key}`}
          />
        }
        title={
          visit.detail ? (
            <Tooltip
              arrow
              placement="top"
              /* Touch has no hover, and this is the only place the reason lives. */
              enterTouchDelay={0}
              title={
                <Box className={classes.timeTooltip}>
                  <Typography className={classes.timeTooltipTitle}>{name}</Typography>
                  <Typography className={classes.timeTooltipRow}>{visit.detail}</Typography>
                </Box>
              }
            >
              {anchor}
            </Tooltip>
          ) : (
            anchor
          )
        }
        figure={
          /* **Distance first, then the work**, and the miles are absent rather than zeroed
             when there is no origin to measure from: `assessVisit` leaves `distanceKm` null in
             that case, and `0 mi` would report a visit as being on the doorstep of a point
             that does not exist. */
          <Box className={classes.stopFigureRow}>
            <StopFigure
              classes={classes}
              distance={Number.isFinite(visit.distanceKm) ? formatMiles(visit.distanceKm) : ''}
              duration={formatMinutesLong(visit.serviceMinutes)}
              open={open}
              onToggle={onToggle}
              toggleLabel={tt('stopDetailToggle', { site: name })}
            />
          </Box>
        }
      />
    </Box>
  );
};

ExcludedRow.propTypes = {
  visit: PropTypes.object.isRequired,
  classes: PropTypes.object.isRequired,
  tt: PropTypes.func.isRequired,
  open: PropTypes.bool,
  onToggle: PropTypes.func,
  /** False on the last row in the panel, so the dashed track stops at the final pin. */
  showTrack: PropTypes.bool,
};

/**
 * What the plan leaves out, why, and what would change it.
 *
 * **This was a summary, then an exception report, then a triage, and is now the
 * mockup's amber panel.** The triage is intact and it is what the panel is for: with
 * the harmonization rule in force there are three quite different ways to be left out,
 * and they have three different remedies —
 *
 *   **need by** — the visit cannot legally be done on this day. Widen the window,
 *                 or leave it alone. No amount of driving fixes it.
 *   **radius**  — it is outside the distance the van will travel today.
 *   **no room** — it qualifies, and the eight hours ran out. Run another day.
 *
 * A single flat list of names would flatten those into one apparent problem and the
 * planner's first move would be the wrong one, so each cause is still its own group
 * with its own count and **the one action that would take it** — the number computed
 * rather than gestured at: *Allow ± 5 days*, not *widen the window*. A remedy that
 * leaves arithmetic to the reader is a remedy they will get wrong.
 *
 * **The compromise the mockup forced, stated plainly.** The mockup draws one flat list
 * under one heading; the code has to keep the grouping, because the grouping is what
 * lets each cause carry its own remedy. So the *structure* stays and the *visual*
 * flattens: one amber container, one headline with the total, one help sentence, and
 * then a single dashed track that runs unbroken from the first pin to the last —
 * straight through the group headings, which sit on it as 12px captions rather than as
 * three sub-panels with their own boxes. Read down, it is the mockup's list; read
 * carefully, each segment of it is captioned with why those visits are in it and what
 * to press.
 *
 * **The headline counts the rows, not the run.** It used to be handed `notInPlanCount`
 * from `useHarmonizeRun`, which is `unplaced + excluded` — and the capacity group is
 * only built when there is a plan, so on the no-plan path the panel could announce four
 * visits and list two. A count derived from the rows underneath it cannot disagree with
 * them.
 *
 * **The avatar and the second "Show working" are gone.** The old panel was the
 * optimizer *talking* — an avatar, a conclusion, and the reasoning folded behind a
 * disclosure — and every part of that has moved somewhere better: `ThinkingStage` owns
 * the working state and the orb, and the reasoning is now `Reasoning` at the top of the
 * routes column, above the cards it explains. The steps were rendered in both places at
 * once. This panel is not a speaker any more; it is the exception report at the foot of
 * the answer, and the warning glyph is the whole of the voice it needs.
 */
const AiPanel = ({ groups = [] }) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const tt = (key, options) => t(`obx.runsheet.harmonize.${key}`, options);

  /* One row open at a time, as the stop list does it. Several open panels turn a
     footnote into the tallest thing in the column. */
  const [openKey, setOpenKey] = useState(null);

  /* The rows as the reader meets them, in group order — the flat sequence is what the
     headline counts, what the total sums, and what decides which pin the dashed track
     stops at. */
  const rows = groups.flatMap((group) => group.visits || []);
  const keyOf = (visit) => visit.id || visit.siteId;
  const lastKey = rows.length ? keyOf(rows[rows.length - 1]) : null;

  /**
   * The cost of the exclusion: the work that still has to go somewhere.
   *
   * Service time only, and it is the one honest total available — travel is a property
   * of a route and none of these visits is on one, so any figure including driving would
   * be an estimate of a journey nobody has planned. Suppressed rather than printed as
   * `0 min` when the visits carry no service time at all: a zero here would read as
   * *this costs nothing*, which is the opposite of what an empty field means.
   */
  const totalMinutes = rows.reduce(
    (total, visit) => total + (Number(visit.serviceMinutes) || 0),
    0,
  );

  return (
    <Box className={classes.notIncluded}>
      {/* **The mark and the headline are one group now, and the total is the other.**
          All three were siblings of a `space-between` row, which put the icon hard left,
          the total hard right and the *headline drifting in the middle* — at three visits
          it sat one place and at eleven it sat another, so the one line the panel is read
          for moved as the data changed. Grouped, the icon and its sentence stay welded to
          the left edge and only the total answers to the right one. */}
      <Box className={classes.notIncludedHead}>
        <Box className={classes.notIncludedHeadLeft}>
          {/* **A filled disc, where this was the spill ribbon's outline triangle.** The
              supplied design draws a solid orange mark at the head of this panel, and the
              reason to follow it is that the two marks are saying different-sized things: the
              ribbon's triangle is a footnote on one route's card, this is the header of the
              one block in the column that reports work with nowhere to go. See `WarningDisc`
              for why the `!` is punched in the panel's own peach rather than in white. */}
          <WarningDisc className={classes.notIncludedIcon} />
          {/* `aria-live` here and nowhere else in the panel. The rows below are detail; a
              reader hearing every site name announced would be talked over on the way to
              the count. */}
          <Typography className={classes.notIncludedTitle} aria-live="polite">
            {tt('notIncludedTitle', { count: rows.length })}
          </Typography>
        </Box>
        {totalMinutes ? (
          <Typography className={classes.notIncludedTotal}>
            {formatMinutesLong(totalMinutes)}
          </Typography>
        ) : null}
      </Box>

      {/**
       * **The help sentence is gone.** It read *Create new route or pick up in next week
       * or try to adjust in current routes* — three moves in the abstract, directly above
       * the same three moves as pressable actions naming exact values. The old note
       * defending it argued that the sentence says what *can* be done while a button does
       * it to a named value, and that neither is the other's caption. Read on the built
       * screen that was a distinction without a difference: a planner who has *Extend to
       * 17 mi* in front of them does not first need telling that adjusting the current
       * route is an option. It was the longest line in the panel and the only one that
       * named no number.
       */}
      {/* **The rows scroll, in the same bounded box a route card's stops scroll in.** They
          did not, and the note that removed the old `outsideList` cap was arguing against
          the wrong number rather than against the idea: `outsideList` clipped at four 24px
          rows, and once a row became a pin, a figure and a 32px track underneath it that
          cap showed one and a half of them, which reads as a rendering fault. `proposedScroll`
          is sized for these rows — it is the box the stop lists use — so the panel stops
          being able to grow taller than the routes it is a footnote to, and the reader can
          still reach every name.

          **The group heads and their remedies are inside the scroll, on the track.** The
          alternative was a strip of all three buttons under the help sentence, above the
          scroll, where none of them can be scrolled past — and it severs each fix from the
          cause it fixes, which is the whole argument `aiGroupAction` is written on: *Allow
          ± 5 days* means something under "3 visits are due before this day" and is a
          floating number anywhere else. So the cost is accepted and mitigated by order:
          every group's head precedes its own names, so the reader meets the button on the
          way to the rows it applies to rather than after them. */}
      <Box className={classes.proposedScroll}>
        {groups.map((group) => (
          /* `alignSelf` inline because `proposedScroll` sets `align-items: flex-start`,
             which shrink-wraps every child to its content: the group heads would lose the
             free space `grow` needs to push each remedy to the right edge, and three
             groups of three different widths would each right-align to a different x. The
             spec's own scrolling list is `align-self: stretch` on both the box and its
             rows — see the report note asking for that on `proposedScroll` itself, at
             which point this comes off. */
          <Box key={group.reason} className={classes.aiGroup} style={{ alignSelf: 'stretch' }}>
            <Box className={classes.aiGroupHead}>
              <Typography className={classes.aiGroupTitle}>{group.title}</Typography>
              <Box className={classes.grow} />
              {/* One action per cause, in the same place in every group, and it names the
                  value it will set. **A button, not a link** — see `aiGroupAction`: it
                  re-runs the plan and redraws the routes and the map, and while it was
                  styled as a link it read as a caption on the count rather than as the
                  thing to press. Above its own names rather than below them, so a reader
                  working down the list meets the fix before the rows it applies to. */}
              {/**
               * **A link, where this was a bordered chip — and it is now the only way to
               * widen the radius.** The radius stepper came off the setup column this
               * pass, on the reasoning that a control which matters in one case belongs
               * where that case is reported. This is that place: *Extend to 17 mi*, next
               * to the count of what is outside it, computed rather than gestured at.
               *
               * The chip it replaces was argued for on the grounds that this re-solves
               * the plan and redraws the map, so it should not look like a caption. True,
               * but the panel had three of them stacked down its right edge, each with a
               * brand-coloured border, against a group heading and a note — and the
               * borders were most of what made this panel read as heavy. A link in brand
               * ink is still unmistakably pressable, and it is the same `linkButton` the
               * setup column uses for its own remedy, so the two read as one gesture.
               */}
              {group.remedy ? (
                <button type="button" className={classes.linkButton} onClick={group.remedy.onApply}>
                  {group.remedy.label}
                </button>
              ) : null}
            </Box>

            {/* **Where the remedy would have been, not after the names.** The note is the
                fallback when there is no remedy — a contract tighter than the franchise's
                own setting, a week with no spare day — and a reader who finds no button
                there and no explanation either concludes the panel is reporting a problem
                nothing can touch, then meets the reason eight rows later. It also appears
                *beside* a remedy (`noteContractWindow`: some of these are beyond the knob),
                and in that case it qualifies the button directly above it, which is a
                sentence that has to sit next to what it qualifies to mean anything. Both
                readings want the same position. */}
            {/* **Only when there is no press to pair it with.** The note is prose
                qualifying the group — *some of these have tighter contract windows*, *the
                day is full, add a route day* — and beside a remedy that already names the
                value it will set, it was a second sentence explaining the first. Where
                there is no remedy it is the only thing standing between the reader and a
                list of names with no stated cause, so it stays: a group that cannot be
                fixed from here has to say so, or the panel looks broken rather than
                honest. */}
            {group.note && !group.remedy ? (
              <Typography className={classes.aiNote}>{group.note}</Typography>
            ) : null}

            {/* Named, not counted. "3 visits could not be placed" is a number a planner can
                do nothing with; three site names are three decisions they can make. Dimmed,
                because none of these is in the plan — and only dimmed, because the names are
                what the decision is made on. */}
            {(group.visits || []).map((visit) => {
              const key = keyOf(visit);
              return (
                <ExcludedRow
                  key={key}
                  visit={visit}
                  classes={classes}
                  tt={tt}
                  open={openKey === key}
                  onToggle={() => setOpenKey(openKey === key ? null : key)}
                  showTrack={key !== lastKey}
                />
              );
            })}
          </Box>
        ))}
      </Box>
    </Box>
  );
};

AiPanel.propTypes = {
  /**
   * One entry per cause, in the order the planner would address them.
   * `{ reason, title, note, remedy: { label, onApply }, visits: [...] }`
   *
   * A visit is `{ id, siteName, filterCount, serviceMinutes, distanceKm, detail, reason }`.
   * `detail` is the terse magnitude that becomes the row's tooltip, `serviceMinutes` is
   * what the panel's total sums, and **`reason` is what dims the row** — `triageGroups`
   * sets one on every visit in every group, so a row arriving without one is asserting
   * that it is still in the plan.
   */
  groups: PropTypes.arrayOf(
    PropTypes.shape({
      reason: PropTypes.string.isRequired,
      title: PropTypes.string,
      note: PropTypes.string,
      remedy: PropTypes.shape({ label: PropTypes.string, onApply: PropTypes.func }),
      visits: PropTypes.array,
    }),
  ),
};

export default AiPanel;
