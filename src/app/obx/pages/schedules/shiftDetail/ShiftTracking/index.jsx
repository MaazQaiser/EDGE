import { Box, Skeleton, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import PropTypes from 'prop-types';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useTenantLabel } from 'src/helper/utilityHooks';

import { dayjsWithStandardOffset } from '../../helper';

/**
 * Where the shift went, in order.
 *
 * ## Why this tab exists and what it can honestly show
 *
 * The drawer's design carries five tabs; four of them were already built. This is the fifth,
 * and it has **no endpoint of its own** — there is no tracking service in this codebase. What
 * it does have is the tracking the runsheet detail already loads for its map: `pathData`, the
 * leg-by-leg trail with a distance and a duration per leg, and `visitSet`, the stops with the
 * time each was reached. The map draws those as a line; this reads them out as a list, which
 * answers the question a line cannot — *when* was the officer there, and how far apart were
 * the stops.
 *
 * So the tab is a **reading of data the drawer already has**, not a new capability with a
 * stubbed backend. Where that data is absent — every shift that is not a runsheet, and any
 * runsheet nobody has walked yet — it says so plainly rather than drawing an empty timeline
 * that reads as a failed request.
 *
 * ## The states, all three of them
 *
 * - **Upcoming**: nothing has happened, and the copy says exactly that rather than "no data".
 *   A dispatcher opening tomorrow's round should not have to wonder whether tracking broke.
 * - **Tracked**: the legs, in order, each with the point reached, the clock time, and the
 *   distance and travel time from the leg before it.
 * - **Not tracked**: a shift type that carries no trail at all. One sentence.
 */
const useStyles = makeStyles((theme) => ({
  wrapper: { display: 'flex', flexDirection: 'column', gap: '4px' },
  leg: {
    display: 'flex',
    gap: '12px',
    padding: '12px 0',
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
    '&:last-child': { borderBottom: 'none' },
  },
  /* The rail: a numbered disc with the line to the next leg drawn under it, which is the
     same vocabulary the runsheet's own stop list uses for the same idea. */
  rail: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' },
  disc: {
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    display: 'grid',
    placeItems: 'center',
    flex: '0 0 auto',
    backgroundColor: theme.palette.surfaceSuccessSubtle,
    color: theme.palette.textSuccess,
  },
  discText: { '&.MuiTypography-root': { color: 'inherit' } },
  thread: { flex: '1 1 auto', width: '1px', backgroundColor: theme.palette.borderSubtle1 },
  body: { display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 },
  name: { '&.MuiTypography-root': { color: theme.palette.textPrimary } },
  meta: { '&.MuiTypography-root': { color: theme.palette.textSecondary2 } },
  emptyTitle: { '&.MuiTypography-root': { color: theme.palette.textPrimary } },
  emptyText: { '&.MuiTypography-root': { color: theme.palette.textSecondary2, paddingTop: '4px' } },
  empty: { padding: '8px 0' },
}));

const clock = (value) => {
  if (!value) return null;
  const stamp = dayjsWithStandardOffset(value);
  if (!stamp?.isValid?.()) return null;
  const suffix = stamp.hour() < 12 ? 'a' : 'p';
  return stamp.minute() ? `${stamp.format('h:mm')}${suffix}` : `${stamp.format('h')}${suffix}`;
};

const ShiftTracking = ({ shiftData, loading }) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const { getLabel } = useTenantLabel();

  /**
   * One list from two sources.
   *
   * `visitSet` names the stops and carries the time each was reached; `pathData` carries the
   * leg that got there. They are the same sequence in the payload the map is drawn from, so
   * they are zipped by position — which is also how `RunsheetDetail` reads them.
   */
  const legs = useMemo(() => {
    const details = shiftData?.runsheetDetails || {};
    const points = details.visitSet || shiftData?.visitSet || [];
    const path = details.pathData || shiftData?.pathData || [];

    return points
      .map((point, index) => ({
        key: point?.id ?? `leg-${index}`,
        name: point?.name || point?.siteName || point?.address || null,
        at: clock(point?.visitedAt || point?.reachedAt || point?.startsAt),
        distance: path?.[index]?.distance?.text || null,
        duration: path?.[index]?.duration?.text || null,
      }))
      .filter((leg) => leg.name);
  }, [shiftData]);

  if (loading) {
    return (
      <Box className={classes.wrapper}>
        <Skeleton variant="rectangular" height={44} />
        <Skeleton variant="rectangular" height={44} />
        <Skeleton variant="rectangular" height={44} />
      </Box>
    );
  }

  if (!legs.length) {
    return (
      <Box className={classes.empty}>
        <Typography variant="subtitle1" className={classes.emptyTitle}>
          {t('obx.schedules.dutyDetail.shiftTracking.emptyTitle')}
        </Typography>
        <Typography variant="body2" className={classes.emptyText}>
          {t('obx.schedules.dutyDetail.shiftTracking.emptyText', {
            officer: getLabel('terms', 'officer', t) || 'Officer',
          })}
        </Typography>
      </Box>
    );
  }

  return (
    <Box className={classes.wrapper}>
      {legs.map((leg, index) => (
        <Box key={leg.key} className={classes.leg}>
          <Box className={classes.rail}>
            <Box className={classes.disc}>
              <Typography variant="subtitle4" className={classes.discText}>
                {index + 1}
              </Typography>
            </Box>
            {index < legs.length - 1 ? <Box className={classes.thread} /> : null}
          </Box>
          <Box className={classes.body}>
            <Typography variant="subtitle2" className={classes.name}>
              {leg.name}
            </Typography>
            <Typography variant="body3" className={classes.meta}>
              {[leg.at, leg.distance, leg.duration].filter(Boolean).join(' · ') ||
                t('obx.schedules.dutyDetail.shiftTracking.notReached')}
            </Typography>
          </Box>
        </Box>
      ))}
    </Box>
  );
};

ShiftTracking.propTypes = {
  shiftData: PropTypes.object,
  loading: PropTypes.bool,
};

export default ShiftTracking;
