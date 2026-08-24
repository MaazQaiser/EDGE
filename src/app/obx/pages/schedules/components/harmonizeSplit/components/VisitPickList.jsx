import { Box, Checkbox, Typography } from '@mui/material';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { StopRow } from '../../harmonize/components/StopRowParts';
import { useStyles as useRouteStyles } from '../../harmonize/harmonize.styles';
import { formatCompact, onSiteMinsFor } from '../../harmonizeFlow/model/durations';
import { siteById } from '../../harmonizeFlow/model/fixtures';

/**
 * ① — **every visit in the range, as the rows a finished route is made of.**
 *
 * ## What this replaces, and the reversal it carries
 *
 * ① used to show the *route header* before there was a route: `RoutePreview` drew the title,
 * the zone, an empty figure slot and a trough, and the day tabs sat above it, all so that
 * pressing Harmonize changed a layout's **contents** rather than conjuring the layout — drift
 * across the press was measured at 0px and that was the point of building it.
 *
 * That whole arrangement is gone from ①, on instruction: *"when the user comes to this screen,
 * show all the listings of the visits… he can select the visits that he wants to be part of
 * this run. Once the user confirms those, start the harmonization, and then the tabs will
 * appear."* So the flow is now a genuine two-act structure — **a question, then an answer** —
 * and the 0px-drift guarantee is deliberately spent. A planner arriving at this screen is
 * choosing what the run is *about*; a route header with nothing in it was answering a question
 * nobody had asked yet.
 *
 * The day tabs go with it. They exist to index three solved days, and before the press there
 * are none.
 *
 * ## Why it is the route's row and not the drawer's checkbox list
 *
 * The drawer's `VisitScopeList` draws this same question as a compact `[box] name / company …
 * 5` list. This shell asks for the row a *route* uses — asked for directly, and it earns it
 * here in a way it would not in a 475px drawer: the pick list and the route list occupy the
 * **same region of the same column**, one after the other, so a planner watches the rows they
 * ticked become the rows the engine ordered. Two different row designs across that transition
 * would read as two different lists about two different things.
 *
 * So this imports `StopRow`, `StopPinIcon` and the workspace's whole `stop*` sheet, exactly as
 * `DayPane` does at ③, and overrides the same keys by name. **`stopMarker`, `stopDetailLabel`,
 * `stopPillName` and `stopFigure` are taken from the drawer's own overrides** rather than
 * re-tuned here, so the name, the meta line, the pin and the figure are the same size in ① as
 * in ③ — which is the whole of what "the same design component" has to mean to be worth doing.
 *
 * ## Three things this row does differently, each for a reason about sequence
 *
 * - **No dashed track.** The connector is what says *these are in this order*, and at ① no
 *   order exists — the engine has not run. A dashed rule down a list of unordered visits would
 *   be the screen promising a sequence it does not have, on the one screen whose job is to
 *   decide what goes *into* the sequencing. `stopTrackLine` is overridden to `display: none`
 *   rather than given a transparent colour, so it takes no height either.
 * - **The pin is blank, never numbered.** `StopPinIcon`'s `blank` draws the plain circle it
 *   already uses for a numberless visit. A numeral here would be an order; the teardrop alone
 *   is *a site*, which is exactly the claim being made.
 * - **The pitch is tight.** `stopLine`'s 28px bottom margin and `stopTrackColumn`'s matching
 *   `-28` exist to run the dash across the gap between two rows. With no dash there is nothing
 *   to run, and 15 visits at a 60px pitch is 900px of scrolling for a list a planner reads
 *   top to bottom before deciding anything. Both are overridden together — they are one
 *   mechanism and moving one alone leaves a dash stopping short of the next pin.
 *
 * ## The figure is time on site, and only that
 *
 * ③'s row prints `10.0 mi · 1h 50m` — a distance and a duration. **The distance cannot exist
 * yet**: it is miles from the *previous stop*, which is a property of a sequence, and there is
 * no sequence to be the previous stop of. So the slot holds the half that is knowable —
 * `10 + 20 × filters` (D10), which is the same figure the route will later charge for this
 * stop, so the number does not change when the row becomes a stop.
 *
 * It briefly held `3 · 1h 10m`, pairing the filter count with the duration to keep ③'s
 * two-part shape. That was wrong for a reason worth recording: the pair is right-aligned as a
 * unit, so the count sat *left* of the duration and read as the first of two costs rather than
 * as a property of the visit — and it duplicated a number that belongs on the meta line, where
 * ③ already puts it.
 *
 * The chevron is **drawn and hidden**, the trick `DayPane`'s own anchors use: it reserves the
 * width ③'s disclosure occupies, so the figures in the two lists share a right edge and the
 * transition across the press does not shift them. There is nothing to disclose here, so an
 * enabled chevron would be a control that does nothing.
 *
 * ## Everything is in until it is taken out
 *
 * Every box starts ticked. The run is *the week's work* until somebody says otherwise, and a
 * screen that opened with nothing selected would make scoping a chore before it was a choice.
 * A cleared row **dims and stays where it is** — sorting the excluded to the bottom would move
 * rows out from under the pointer mid-decision, and a strike-through reads as deleted rather
 * than as not-in-this-run. The dim is an inline opacity for a measured reason; see the row.
 *
 * Excluding here is not the same as setting aside in ③; `useHarmonizeFlow`'s `excluded` note
 * has the long version. A visit cleared here never reaches the engine, so it appears in no
 * tray and in no `12 of 15` count.
 */
const VisitPickList = ({ classes, flowClasses, visits, excluded, onToggle }) => {
  const workspace = useRouteStyles();
  const { t } = useTranslation();
  /* The drawer's namespace, not Split's: `visitsHeading`, `colFilters`, `excludeVisit` and
     `noVisitsSelected` are already written there for the same question, and a second copy of
     four strings under a second key is how the two lists start saying different words. */
  const tt = (key, options) => t(`obx.runsheet.harmonizeFlow.${key}`, options);

  /**
   * The workspace's sheet with this list's overrides swapped in **by key**.
   *
   * The same mechanism `DayPane` uses and for the same reason: `StopRow` reads every class off
   * the object it is handed, so an override is a one-line substitution rather than a fork —
   * and it cannot reach the workspace's own route list, which is the one thing these two
   * features must not do to each other.
   */
  const route = {
    ...workspace,
    stopMarker: flowClasses.flowMarker,
    stopDetailLabel: flowClasses.flowDetailLabel,
    stopPillName: flowClasses.flowStopName,
    stopFigure: flowClasses.flowFigure,
    stopChevronIcon: flowClasses.flowChevronIcon,
    stopLine: classes.pickStopLine,
    stopTrackColumn: classes.pickTrackColumn,
    stopTrackLine: classes.pickTrackHidden,
  };

  const excludedSet = new Set(excluded);
  const selectedCount = visits.filter((visit) => !excludedSet.has(visit.id)).length;

  return (
    <Box className={classes.pickSection}>
      {/**
       * The heading, and **no column label beside it.**
       *
       * There was a right-aligned `Filters` here, borrowed from the drawer's list where the
       * rows print a bare numeral and a column of `3 2 1 4 6` names nothing without it. It was
       * wrong twice over on this row. The figure slot holds a *pair* right-aligned as a unit,
       * so a label on the row's right edge sat over the **duration** and named the wrong
       * column — and once the filter count moved into the meta line (below), there was no bare
       * numeral left for it to name at all.
       *
       * ③'s route list carries no column headers either, which is the other half of the
       * argument: this list and that one are the same rows, so one of them growing a table
       * header would be the pair drifting.
       */}
      <Box className={classes.pickHead}>
        <Typography component="h3" className={classes.pickHeading}>
          {tt('visitsHeading')}
        </Typography>
      </Box>

      <Box className={classes.pickList} role="list">
        {visits.map((visit) => {
          const site = siteById(visit.siteId);
          const isIn = !excludedSet.has(visit.id);
          const name = site?.name || visit.siteId;

          return (
            <Box
              key={visit.id}
              role="listitem"
              className={classes.pickRow}
              /**
               * **The dim is an inline value, not a modifier class — and that is forced.**
               *
               * `pickRowOut` was a one-declaration rule, `opacity: 0.45`, and it did not apply.
               * Verified in the browser rather than guessed at: the rule was present in a live
               * `data-meta="makeStyles"` sheet (not disabled, no media query, attached to
               * `<head>`), `element.matches('.makeStyles-pickRowOut-…')` returned **true**, it
               * was the *only* rule matching the element that set `opacity` at all, the element
               * carried no inline opacity — and `getComputedStyle` returned **1**.
               *
               * This is the **second time** this exact pathology has been hit in this feature.
               * `planRegion`'s green wash was a modifier class with correct rules, correct
               * source order, equal specificity and a passing `matches()`, and its
               * pseudo-element still computed `0`; it is driven by an inline `--plan-wash`
               * custom property for that reason and says so. `--zone` and `--apply-delay` are
               * inline here for the same reason.
               *
               * So rather than spend another session on the mechanism, this follows the
               * precedent the surface already set. The transition stays in the class, where a
               * class works fine — it is only the *toggled* declaration that goes inline.
               */
              style={{ opacity: isIn ? 1 : 0.45 }}
            >
              <StopRow
                classes={route}
                /* The checkbox stands where ③'s drag handle stands. Both are the row's
                   one control and both are 16px, so the name starts at the same x in
                   both lists — which is what makes the two read as one list changing
                   state rather than as two lists. */
                grip={
                  <Checkbox
                    size="small"
                    checked={isIn}
                    onChange={() => onToggle(visit.id)}
                    className={classes.pickCheckbox}
                    /* The box carries a written label naming the site. `aria-labelledby`
                       pointing at the name alone reads out "Fenchurch Chambers" with no
                       hint of which of fifteen near-identical controls it is. */
                    inputProps={{ 'aria-label': tt('excludeVisit', { site: name }) }}
                  />
                }
                /* **No pin.** Removed on instruction. It was the product's teardrop, blue for
                   in and grey for out, tying a row here to the same row at ③ — and at ① it
                   was a mark for a *place on a route* on a list that is not a route yet. With
                   it gone `pickTrackColumn` collapses too, so the checkbox is the row's only
                   leading element and the site name starts 24px further left. */
                title={
                  <Box className={route.stopTitleRow}>
                    <Typography className={route.stopPillName}>{name}</Typography>
                  </Box>
                }
                figure={
                  /* `stopFigureRow`, as every caller wraps a figure: `stopValues` is a
                     *column* of value rows, so a bare fragment of siblings stacks one per
                     line instead of reading across. */
                  <Box className={route.stopFigureRow}>
                    <Typography className={route.stopFigure}>
                      {formatCompact(onSiteMinsFor(visit.filterCount))}
                    </Typography>
                    {/* Drawn and hidden — see the note above on the reserved chevron. */}
                    <Box className={classNames(route.stopChevronIcon, route.stopChevronGhost)} />
                  </Box>
                }
              >
                {/* `Downtown Holdings · 3 filters` — **the same slot and the same sentence
                    ③ prints**, built from the same `stopMeta` key, so a row does not
                    reword itself across the press. The company matters because a site name
                    alone is ambiguous to anyone working by account (Downtown Holdings owns
                    two sites in North), and the filter count belongs here rather than in the
                    figure: it is a fact *about the visit*, where the figure column holds what
                    the visit will cost. Not the zone — that is Config A's business rather
                    than a fact about the work being chosen, and it repeats on all fifteen
                    rows to serve the two it matters to. */}
                <Typography className={route.stopDetailLabel}>
                  {tt('stopMeta', {
                    company: site?.company || '—',
                    filters: tt('count.filter', { count: visit.filterCount }),
                  })}
                </Typography>
              </StopRow>
            </Box>
          );
        })}
      </Box>

      {/* The footer's `Harmonize` is closed with nothing selected, and a disabled button
          explains nothing. This is the sentence that does, under the list, because the list
          is where the fix is. */}
      {selectedCount ? null : (
        <Typography className={classes.pickHint}>{tt('noVisitsSelected')}</Typography>
      )}
    </Box>
  );
};

VisitPickList.propTypes = {
  /** Split's own sheet — the section, the rows' frame and the checkbox. */
  classes: PropTypes.object.isRequired,
  /** `harmonizeFlow.styles.js`, for the four `flow*` overrides ③'s rows already wear. */
  flowClasses: PropTypes.object.isRequired,
  /** The whole pool, selected or not — this list is the place both states are visible. */
  visits: PropTypes.array.isRequired,
  excluded: PropTypes.array.isRequired,
  onToggle: PropTypes.func.isRequired,
};

export default VisitPickList;
