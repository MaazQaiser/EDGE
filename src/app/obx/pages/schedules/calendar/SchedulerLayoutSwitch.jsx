import { ToggleButton, ToggleButtonGroup, Tooltip } from '@mui/material';
import { makeStyles } from '@mui/styles';
import PropTypes from 'prop-types';

import { SCHEDULER_LAYOUT, SCHEDULER_LAYOUT_LABELS } from '../config/schedulerLayout';

/**
 * Labelled **"Var 1" / "Var 2"**, for the same reason `VisitVariantSwitch` is
 * labelled V1/V2 — see the note there. These name two *candidate layouts* of the
 * same schedule, live at the same time only so someone can choose one, and those are
 * the words the choice is being discussed in. The tooltips carry the description the
 * labels don't.
 *
 * The two differ in exactly one thing: whether Companies is a schedule **tab** with
 * its own views, or a third segment on the grid's grouping toggle. Everything
 * downstream of that — whether the tab row lists it, which way round the calendar
 * toolbar reads, and where a company drill-through lands — follows from it.
 *
 * When the decision lands, this component and the losing layout go together.
 */
const LAYOUT_ORDER = [
  {
    value: SCHEDULER_LAYOUT.TABBED_COMPANIES,
    label: SCHEDULER_LAYOUT_LABELS[SCHEDULER_LAYOUT.TABBED_COMPANIES],
    hint: 'Companies stays a tab, with its own day, week, month and year views',
  },
  {
    value: SCHEDULER_LAYOUT.UNIFIED_TOGGLE,
    label: SCHEDULER_LAYOUT_LABELS[SCHEDULER_LAYOUT.UNIFIED_TOGGLE],
    hint: 'No companies tab — company timeline joins routes and visits on the grid toggle',
  },
];

const useStyles = makeStyles((theme) => ({
  /**
   * Geometry copied by value from `VisitVariantSwitch`'s `group`/`button`, which
   * copied it in turn from `calendarHeaderToolbarToggle` in
   * `calendar/calendar.styles.js` — the segmented pill every text-labelled toggle
   * in this app shares: flat grey track, no border, 4px between individually
   * rounded segments, selected segment lifted off the track as its own white pill.
   *
   * By value and not by import on purpose, exactly as the switch it sits beside:
   * this control is temporary, and a shared class it could edit would be a way for
   * the comparison to change the toolbar it is being compared in.
   */
  group: {
    gap: '4px',
    '&.MuiToggleButtonGroup-root': {
      height: '32px',
      display: 'flex',
      alignItems: 'stretch',
      justifyContent: 'center',
      padding: 0,
      borderRadius: '8px',
      background: theme.palette.surfaceGreySubtle,
      // Must keep its own width beside the other toolbar pills, not be squeezed
      // by the row's wrap.
      flex: '0 0 auto',
    },
  },

  button: {
    '&.MuiToggleButton-root': {
      height: 'auto',
      alignSelf: 'stretch',
      // Narrower than the reference control's 16px: a short label in a 16px-padded
      // segment is mostly padding, and this pill shares a floating shell with
      // another two-segment toggle.
      padding: '4px 12px',
      border: '1px solid transparent',
      borderRadius: '7px !important',
      fontSize: '14px',
      fontWeight: 500,
      lineHeight: '20px',
      letterSpacing: 'normal',
      textTransform: 'none',
      whiteSpace: 'nowrap',
      color: theme.palette.textPlaceholder,
      '&:hover': { backgroundColor: theme.palette.borderSubtle2 },
      /* Selected and unselected share one font weight — the white fill and its
         shadow are the whole "active" signal, and a heavier weight on top reads as
         a second, competing one. Confirmed twice on the reference control. */
      '&&.Mui-selected': {
        backgroundColor: theme.palette.surfaceWhite,
        color: theme.palette.textPrimary,
        boxShadow: '0px 1px 2px 0px rgba(16, 24, 40, 0.10)',
        '&:hover': { backgroundColor: theme.palette.surfaceWhite },
      },
    },
  },
}));

/**
 * Which of the two candidate scheduler layouts the page draws.
 *
 * Both layouts reach the same three readings of the same data — this chooses how
 * they are *arranged*, nothing about scope — which is why it is a segmented control
 * rather than a filter. `exclusive` plus the null guard: clicking the active segment
 * must be a no-op, or the page would be asked to draw neither layout.
 *
 * Strings are literal rather than translated, as on the card-variant switch beside
 * it: adding i18n keys is out of scope for a control that exists to be deleted, and
 * they describe an internal comparison no tenant sees.
 *
 * The `Tooltip` wraps the *button* and not the label, so the hint reaches the same
 * element the pointer and focus land on.
 */
const SchedulerLayoutSwitch = ({ value, onChange }) => {
  const classes = useStyles();

  return (
    <ToggleButtonGroup
      className={classes.group}
      exclusive
      size="small"
      value={value}
      onChange={(_event, next) => next && onChange(next)}
      aria-label="Scheduler layout variation"
    >
      {LAYOUT_ORDER.map((layout) => (
        <Tooltip key={layout.value} title={layout.hint} placement="top" arrow>
          <ToggleButton className={classes.button} value={layout.value} disableRipple>
            {layout.label}
          </ToggleButton>
        </Tooltip>
      ))}
    </ToggleButtonGroup>
  );
};

SchedulerLayoutSwitch.propTypes = {
  value: PropTypes.oneOf(Object.values(SCHEDULER_LAYOUT)).isRequired,
  onChange: PropTypes.func.isRequired,
};

export default SchedulerLayoutSwitch;
