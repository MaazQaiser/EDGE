import { ToggleButton, ToggleButtonGroup, Tooltip } from '@mui/material';
import { makeStyles } from '@mui/styles';
import PropTypes from 'prop-types';

import { VISIT_VIEW_VARIANT } from '../config/visitViewVariant';

/**
 * Labelled **"V1" / "V2"**, against the prior decision — and only here.
 *
 * `companies/CompaniesViewSwitch.jsx` deliberately renamed its options *away* from
 * V1/V2 to *Timeline* / *Compact*, because a planner reading "V1" learned nothing
 * about the view until they had already tried both. That reasoning holds and is not
 * being reversed: it applies to a control that ships, naming two permanent views a
 * planner picks between every day.
 *
 * This control is the opposite thing. It names two *candidate designs* of the same
 * card, live at the same time only so someone can choose one — and "V1" and "V2"
 * are the words that choice is being discussed in. Renaming them to something
 * descriptive would leave the switch and the conversation about it using different
 * names for the same two cards, which is the real cost here. The tooltips carry the
 * description the labels don't, exactly as the reference control's do.
 *
 * When the decision lands, this component and the losing card go together.
 */
const VARIANT_ORDER = [
  {
    value: VISIT_VIEW_VARIANT.V1,
    label: 'V1',
    hint: 'Current card: time and status, then site and filter count',
  },
  {
    value: VISIT_VIEW_VARIANT.V2,
    label: 'V2',
    hint: 'Site scheduler card: time and visit, then tour, then runsheet and status',
  },
];

const useStyles = makeStyles((theme) => ({
  /**
   * Geometry copied by value from `CompaniesViewSwitch`'s `group`/`button`, which
   * copied it in turn from `calendarHeaderToolbarToggle` in
   * `calendar/calendar.styles.js` — the segmented pill every text-labelled toggle
   * in this app shares: flat grey track, no border, 4px between individually
   * rounded segments, selected segment lifted off the track as its own white pill.
   *
   * By value and not by import on purpose. This switch is temporary, and the point
   * of it is that the *cards* differ and nothing else does; a shared class it could
   * edit would be a way for the experiment to change the toolbar it sits in.
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
      // Narrower than the reference control's 16px: a two-character label in a
      // 16px-padded segment is mostly padding, and this pill shares a toolbar row
      // with controls that have real words in them.
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
 * Which of the two candidate visit cards the grid draws.
 *
 * Both variants show the same visits in the same cells — this chooses the card's
 * shape, nothing about scope — which is why it is a segmented control rather than a
 * filter. `exclusive` plus the null guard: clicking the active segment must be a
 * no-op, or the grid would be asked to draw neither card.
 *
 * Strings are literal rather than translated. Adding i18n keys is out of scope for
 * a control that exists to be deleted, and "V1"/"V2" would not be translated
 * anyway; the tooltips and the accessible name are the two that would, and they
 * describe an internal comparison no tenant sees.
 *
 * `aria-pressed` is not set by hand: MUI's `ToggleButton` renders it from its own
 * selected state, which is why the reference control does not set it either. The
 * `Tooltip` wraps the *button* and not the label, so the hint reaches the same
 * element the pointer and focus land on.
 */
const VisitVariantSwitch = ({ value, onChange }) => {
  const classes = useStyles();

  return (
    <ToggleButtonGroup
      className={classes.group}
      exclusive
      size="small"
      value={value}
      onChange={(_event, next) => next && onChange(next)}
      aria-label="Visit card design"
    >
      {VARIANT_ORDER.map((variant) => (
        <Tooltip key={variant.value} title={variant.hint} placement="top" arrow>
          <ToggleButton className={classes.button} value={variant.value} disableRipple>
            {variant.label}
          </ToggleButton>
        </Tooltip>
      ))}
    </ToggleButtonGroup>
  );
};

VisitVariantSwitch.propTypes = {
  value: PropTypes.oneOf(Object.values(VISIT_VIEW_VARIANT)).isRequired,
  onChange: PropTypes.func.isRequired,
};

export default VisitVariantSwitch;
