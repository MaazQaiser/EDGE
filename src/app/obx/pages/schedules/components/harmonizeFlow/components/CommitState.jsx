import { Box, Typography } from '@mui/material';
import classNames from 'classnames';
import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { formatCompact } from '../model/durations';
import { zoneName } from '../model/fixtures';
import { UNPLACED_REASON } from '../model/reasons';

/**
 * ⑤ — what applying does: **what moves · what gets a new time · what stays broken ·
 * what stays empty**, in that order.
 *
 * The order is the design. It runs from the change the operator asked for to the
 * things they did not — so the list ends on the two facts that are easiest to skip and
 * most expensive to discover afterwards: work that will not happen, and capacity that
 * cannot be filled. A summary sorted by magnitude would bury both.
 *
 * Two sentences here are uncomfortable and both are deliberate:
 *
 * - **"Created unassigned"** (D14). Harmonize is installer-blind, so the runsheets
 *   arrive with nobody on them. Saying it at the commit step makes the hand-off an
 *   expectation rather than a surprise discovered in ⑥.
 * - **"N customers were told a different time"** (D1). Placeholder times are discarded
 *   and rewritten. Nothing is sent to anyone by applying, so this is not a warning
 *   about an action — it is the one consequence an Undo cannot reach, which is exactly
 *   why it is boxed rather than run into the list.
 */
const CommitState = ({ classes, plan, accepted, movedCount }) => {
  const { t } = useTranslation();
  const tt = (key, options) => t(`obx.runsheet.harmonizeFlow.${key}`, options);

  const { runsheets, totals, unplaced } = plan;
  const overDays = runsheets.filter((r) => r.overrunMins > 0);
  const idle = runsheets
    .map((r) => ({ r, spare: r.shiftMins - r.durationMins }))
    .filter((x) => x.spare > 0)
    .sort((a, b) => b.spare - a.spare)[0];
  const aside = unplaced.filter((u) => u.reason === UNPLACED_REASON.SET_ASIDE);
  const stranded = unplaced.filter((u) => u.reason !== UNPLACED_REASON.SET_ASIDE);

  const row = (figure, headline, detail, quiet) => (
    <Box className={classes.commitRow} key={headline}>
      <Typography className={classNames(classes.commitFigure, quiet && classes.commitFigureQuiet)}>
        {figure}
      </Typography>
      <Box>
        <Typography className={classes.commitHeadline}>{headline}</Typography>
        <Typography className={classes.commitDetail}>{detail}</Typography>
      </Box>
    </Box>
  );

  return (
    <Box>
      <Typography className={classes.commitIntro}>{tt('commitIntro')}</Typography>

      {/* D14, in the app's warning ink rather than as grey detail: the runsheets arrive
          with nobody on them, and the hand-off should be expected at the commit step
          rather than discovered on the assignment queue. */}
      <Box className={classes.commitRow}>
        <Typography className={classes.commitFigure}>{runsheets.length}</Typography>
        <Box>
          <Typography className={classes.commitHeadline}>
            {tt('commitCreated', {
              count: runsheets.length,
              days: runsheets.map((r) => dayjs(r.date).format('ddd D')).join(', '),
            })}
          </Typography>
          <Typography className={classes.noInstaller}>{tt('commitUnassigned')}</Typography>
        </Box>
      </Box>

      {row(
        totals.placedCount,
        tt('commitNewTimes', { count: totals.placedCount }),
        tt('commitNewTimesDetail'),
      )}

      {movedCount
        ? row(movedCount, tt('commitMovedDay', { count: movedCount }), tt('commitMovedDayDetail'))
        : null}

      {overDays.length
        ? row(
            overDays.length,
            tt('commitOverrun', { count: overDays.length }),
            overDays
              .map((r) =>
                tt(
                  accepted.includes(r.date) ? 'commitOverrunAccepted' : 'commitOverrunUnaccepted',
                  {
                    day: dayjs(r.date).format('ddd D'),
                    duration: formatCompact(r.durationMins),
                    shift: formatCompact(r.shiftMins),
                  },
                ),
              )
              .join(' '),
          )
        : null}

      {stranded.length
        ? row(
            stranded.length,
            tt('commitUnplanned', { count: stranded.length }),
            tt('commitUnplannedDetail', {
              sites: stranded.map((u) => u.site?.name).join(', '),
              zones: (() => {
                const zones = [...new Set(stranded.map((u) => zoneName(u.site?.zoneId)))];
                return tt('zoneList', { count: zones.length, zones: zones.join(', ') });
              })(),
              work: formatCompact(
                stranded.reduce((sum, u) => sum + (10 + u.visit.filterCount * 20), 0),
              ),
            }),
            true,
          )
        : null}

      {aside.length
        ? row(
            aside.length,
            tt('commitSetAside', { count: aside.length }),
            tt('commitSetAsideDetail', { sites: aside.map((u) => u.site?.name).join(', ') }),
            true,
          )
        : null}

      {/* E4 — spare capacity nothing in the range can legally reach. The only lever
          left once auto-pull is off the table (D17), so it is stated rather than left
          for the operator to notice from a bar. */}
      {idle
        ? row(
            formatCompact(idle.spare),
            tt('commitIdle', { day: dayjs(idle.r.date).format('ddd D') }),
            tt('commitIdleDetail'),
            true,
          )
        : null}

      <Box className={classes.commitCaveat}>
        <Typography className={classes.commitCaveatTitle}>{tt('commitToldTitle')}</Typography>
        <Typography className={classes.commitDetail}>
          {tt('commitToldBody', {
            visits: tt('count.visit', { count: totals.placedCount }),
          })}
        </Typography>
      </Box>

      {/**
       * §14.7 — the undo promise, scoped down.
       *
       * "Undoable for the rest of the day" is what the boards said and it is more than
       * the model can keep: after Apply a runsheet can be assigned and an installer can
       * start a visit, at which point D5/H5 make the original state unrecoverable. Until
       * Q24 settles the real window, the copy promises only what is certainly true —
       * undo is available *until work starts on one of these runsheets* — rather than
       * naming a duration nothing enforces.
       */}
      <Typography className={classes.commitFootnote}>{tt('undoScope')}</Typography>
    </Box>
  );
};

CommitState.propTypes = {
  classes: PropTypes.object.isRequired,
  plan: PropTypes.object.isRequired,
  accepted: PropTypes.array.isRequired,
  movedCount: PropTypes.number,
};

export default CommitState;
