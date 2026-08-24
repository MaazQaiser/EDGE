import { Box, Checkbox, Typography } from '@mui/material';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { siteById } from '../model/fixtures';

/**
 * ① — the visits themselves, one row each, with a box you can clear.
 *
 * ## What this adds to ①, and why it belongs there
 *
 * ① already stated the run's *shape* — three figures over the range. What it never showed
 * was the **work**: fifteen visits summed into the word `15` and nothing else. So the one
 * question a planner routinely arrives with ("not that site, not this week") had no answer
 * anywhere in the flow: they could change the range, or they could harmonize all fifteen
 * and unpick the result in ③ by setting visits aside one at a time, after the engine had
 * already spent them.
 *
 * Since the Day/Zone/Shift table came off ① (see `ScopeState`), this is also the only list
 * on the screen, which is why it carries a column header of its own.
 *
 * This is that question asked at the only point where it is cheap. Every visit is in by
 * default — the run is *the week's work* until somebody says otherwise, and a screen that
 * opened with nothing ticked would make scoping a chore before it was a choice.
 *
 * ## Excluding is not setting aside
 *
 * The two look alike and mean different things; `useHarmonizeFlow`'s `excluded` note has
 * the long version. Short version: a visit cleared here is **not in the run**, so it does
 * not appear in the tray, in the unplaced count, or in `12 of 15 visits`. A visit set
 * aside in ③ *is* in the run and deliberately unplaced, which is why the tray can offer to
 * put it back. Clearing a box here is a statement about scope; setting aside is a decision
 * about a plan.
 *
 * ## The row
 *
 * `[box] site name / company` on the left, a bare filter count on the right. The site is
 * the **target** — what a planner recognises and what the routes in ③ are named after —
 * and the filter count is on the right because it is the number the hours are made of
 * (`10 + 20 × filters`), so it is the one figure worth scanning down the column.
 *
 * **The zone came off the meta line** and the word `filters` came off every figure, both on
 * instruction and for the same reason: fifteen rows repeating a constant is fifteen chances
 * to read nothing. The count's label is a column header now; the zone is simply gone, since
 * it described Config A rather than the visit.
 *
 * A cleared row **dims but does not strike through or reorder**. Sorting the excluded to
 * the bottom would move rows out from under the pointer mid-decision, and a strike-through
 * reads as deleted rather than deselected. It is still a visit; it is just not in this run.
 *
 * ## There is no bulk select
 *
 * Three attempts at one have been removed in turn — see the header row's own note. Clearing
 * a visit is a per-row decision now, and nothing on the panel operates on all fifteen.
 */
const VisitScopeList = ({ classes, visits, excluded, onToggle }) => {
  const { t } = useTranslation();
  const tt = (key, options) => t(`obx.runsheet.harmonizeFlow.${key}`, options);

  const excludedSet = new Set(excluded);
  /* Still needed, for the "nothing selected" hint under the list — the footer's button is
     closed in that state and a disabled button explains nothing. */
  const selectedCount = visits.filter((v) => !excludedSet.has(v.id)).length;

  return (
    <Box className={classes.section}>
      {/**
       * The heading and the one column label, **on the same row.**
       *
       * `Filters` had a row of its own — a 27px band holding a single 12px label hard right
       * with nothing to its left, immediately under a 16px heading with nothing to its
       * right. Two half-empty rows stacked, and the label read as floating rather than as
       * belonging to the column under it. Measured: the heading ended at y=347 and the
       * label's row began there, so the *gap* was never the fault; the fault was that
       * neither row had a second element.
       *
       * `sectionHead` is already `space-between` on a shared baseline, so the pair sits on
       * one line with the label's right edge on the content edge — which is exactly where
       * the numerals below it are right-aligned to. Verified before the change that
       * `Filters` and the first `3` already shared a right edge at 780px, so this keeps an
       * alignment that was correct rather than introducing one.
       *
       * The rule under it belongs to this row now (`visitsHead`), which is what makes the
       * heading and the label read as a table header instead of as two orphans.
       */}
      <Box className={classNames(classes.sectionHead, classes.visitsHead)}>
        <Typography component="h3" className={classes.sectionHeading}>
          {tt('visitsHeading')}
        </Typography>
        <Typography className={classes.visitHeadNum} role="columnheader">
          {tt('colFilters')}
        </Typography>
      </Box>

      {/* **The standalone header row is gone** — its single `Filters` label moved onto the
          heading above. What has been removed from this block, in order: `Select all` /
          `Deselect all`; their replacement, a master checkbox with an `indeterminate` state;
          the `Visit` column label; the `15 of 15 selected` count; and finally the row itself.
          All on instruction.

          `Visit` in particular sat directly under a heading reading **Visits** — the same
          word twice over rows whose subject is obvious from the names in them. `Filters`
          survives because the rows carry **bare numerals**, and a column of `3 2 1 4 6`
          names nothing without it.

          **There is no bulk select any more.** Fifteen boxes is fifteen clicks; that is the
          accepted cost, and a master checkbox is the control to bring back if it bites. */}
      <Box className={classes.visitList}>
        {visits.map((visit) => {
          const site = siteById(visit.siteId);
          const isIn = !excludedSet.has(visit.id);
          const name = site?.name || visit.siteId;

          return (
            <Box
              key={visit.id}
              className={classes.visitRow}
              /* The row is the label. A `FormControlLabel` would wrap the whole thing in
                 its own flex box and fight the grid, and `aria-labelledby` on the box
                 pointing at the name alone would read out "Fenchurch Chambers" with no
                 hint of which of fifteen identical-sounding controls it is — so the
                 checkbox carries a written label naming the site instead. */
              data-excluded={!isIn || undefined}
            >
              <Checkbox
                size="small"
                checked={isIn}
                onChange={() => onToggle(visit.id)}
                className={classes.visitCheckbox}
                inputProps={{ 'aria-label': tt('excludeVisit', { site: name }) }}
              />
              <Box className={classes.visitText}>
                <Typography className={classes.visitName}>{name}</Typography>
                {/* The company, and **not the zone**. `· Zone North` was here so an
                    unplaceable row could explain itself, but it repeated on all fifteen to
                    serve the two or three it mattered to, and the zone is Config A's
                    business rather than a fact about the visit a planner is deciding to
                    include. Removed on instruction. */}
                <Typography className={classes.visitMeta}>{site?.company || '—'}</Typography>
              </Box>
              {/* Bare numeral — the word is in the column header now. */}
              <Typography className={classes.visitFilters}>{visit.filterCount}</Typography>
            </Box>
          );
        })}
      </Box>

      {/* The footer's `Harmonize` is closed in this state, and a disabled button explains
          nothing. This is the sentence that does — under the list, because the list is
          where the fix is. Same `hint` class the `noWorkedDays` message uses, since it is
          the same kind of statement: nothing to run, and here is why. */}
      {selectedCount ? null : (
        <Typography className={classes.hint}>{tt('noVisitsSelected')}</Typography>
      )}
    </Box>
  );
};

VisitScopeList.propTypes = {
  classes: PropTypes.object.isRequired,
  /** The whole pool, selected or not — this list is the place both states are visible. */
  visits: PropTypes.array.isRequired,
  excluded: PropTypes.array.isRequired,
  onToggle: PropTypes.func.isRequired,
};

export default VisitScopeList;
