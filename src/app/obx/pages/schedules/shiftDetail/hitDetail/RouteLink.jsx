import { Box, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { ReactComponent as ChevronRightIcon } from 'assets/svg/chevron-right.svg';
import PropTypes from 'prop-types';
import React from 'react';
import ShiftVisitsStatus, {
  DisplayDateTimeRange,
} from 'src/app/components/obxComponents/ShiftVisitsStatus';
import { PANEL_ACCENT } from 'src/app/obx/pages/schedules/shiftDetail/panelAccent';
import { ReactComponent as RunsheetIcon } from 'src/assets/svg/runsheetHit.svg';

const useStyles = makeStyles((theme) => ({
  /* One card, not two. `ShiftVisitsStatus` already draws a bordered, rounded,
     padded box — nesting this wrapper's own border around it doubled the frame
     for no reason. This is the only border; `ShiftVisitsStatus` renders here
     with its own stripped via `bordered={false}`, so the route name sits in the
     same box as the progress it belongs to instead of floating above a second
     one. */
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    margin: '16px 0 0',
    padding: '10px 12px',
    border: `1px solid ${theme.palette.borderSubtle1}`,
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'border-color 120ms ease-out',
    '&:hover, &:focus-visible': {
      borderColor: PANEL_ACCENT,
    },
    '&:focus-visible': {
      outline: 'none',
      boxShadow: `0 0 0 3px ${PANEL_ACCENT}29`,
    },
    '&:hover $chevron, &:focus-visible $chevron': {
      color: PANEL_ACCENT,
      transform: 'translateX(2px)',
    },
  },
  /* The route name and its time window share one line — `ShiftVisitsStatus`
     normally gives the window a row of its own, but that row is this widget's
     whole reason for being "too tall": a name-only header, a clock line, a bar
     and a footer is four rows for three facts. Folded to one header line plus
     the bar and its footer, it is a compact card rather than a stat panel. */
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    '& svg': { flexShrink: 0 },
  },
  name: {
    '&.MuiTypography-root': {
      flex: 1,
      minWidth: 0,
      color: theme.palette.textPrimary,
      fontWeight: 600,
      fontSize: '13px',
      lineHeight: '18px',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
  },
  window: {
    '&.MuiTypography-root': {
      flexShrink: 0,
      color: theme.palette.textSecondary2,
      fontSize: '12px',
      lineHeight: '16px',
    },
  },
  /* `stroke`, not `fill` — the source svg colours itself with a stroke, so
     `currentColor` only reaches it through `& path`. Transform lives here too,
     rather than as a Box wrapper, so the chevron itself is what nudges right. */
  chevron: {
    flexShrink: 0,
    display: 'flex',
    color: theme.palette.textSecondary2,
    transition: 'transform 120ms ease-out, color 120ms ease-out',
    '& svg': { width: '14px', height: '14px', display: 'block' },
    '& path': { stroke: 'currentColor' },
  },
}));

/**
 * Names the route a visit is on and doubles as the way back to it — the visit's
 * own drawer used to answer "is this on a route" with a full assignment callout
 * (`VisitAssignment`); this is the same question asked in one compact line above
 * the same progress bar `ShiftVisitsStatus` already draws elsewhere in these
 * panels, made clickable so the route is one tap out rather than the landing
 * page. The accent on hover is `PANEL_ACCENT` — this panel's green, not the
 * map's blue, for the same reason nothing else in it borrows that blue (see
 * `panelAccent`).
 *
 * Renders nothing for an unrouted visit — there is no route to name or open.
 */
const RouteLink = ({ shiftData, loading, onOpenRoute }) => {
  const classes = useStyles();

  if (loading || !shiftData?.runsheetName) return null;

  const handleKeyDown = (event) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    onOpenRoute?.();
  };

  return (
    <Box
      className={classes.wrapper}
      role="button"
      tabIndex={0}
      aria-label={`${shiftData.runsheetName}, view route`}
      onClick={onOpenRoute}
      onKeyDown={handleKeyDown}
    >
      <Box className={classes.header}>
        <RunsheetIcon />
        <Typography variant="subtitle2" className={classes.name} title={shiftData.runsheetName}>
          {shiftData.runsheetName}
        </Typography>
        {shiftData?.startsAt && shiftData?.endsAt && (
          <Typography variant="body3" className={classes.window}>
            <DisplayDateTimeRange startsAt={shiftData.startsAt} endsAt={shiftData.endsAt} />
          </Typography>
        )}
        <Box className={classes.chevron}>
          <ChevronRightIcon />
        </Box>
      </Box>
      <ShiftVisitsStatus
        status={shiftData?.tourShiftStatus}
        completedTours={shiftData?.completedTours}
        totalTours={shiftData?.totalTours}
        isVisit
        bordered={false}
      />
    </Box>
  );
};

RouteLink.propTypes = {
  shiftData: PropTypes.object,
  loading: PropTypes.bool,
  onOpenRoute: PropTypes.func,
};

export default RouteLink;
