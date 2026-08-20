import { ToggleButton, ToggleButtonGroup, Tooltip } from '@mui/material';
import { makeStyles } from '@mui/styles';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';

import { COMPANIES_VIEW_META, SELECTABLE_COMPANIES_VIEWS } from './companiesViewRange';

/**
 * Whichever grains are currently offered, built from the one list that says so.
 *
 * **This control used to switch density, then switched range across four grains,
 * then two, and now names the reachable set as it changes** — three different
 * option sets in one sitting. Hand-listing `{value, labelKey, hintKey}` here a
 * second time is exactly what let the Companies tab's Timeline/Compact labels sit
 * on each other's views: two lists describing one control drift, one list read
 * twice cannot. So this maps `SELECTABLE_COMPANIES_VIEWS` through
 * `COMPANIES_VIEW_META` rather than keeping its own copy — restoring or retiring a
 * grain is now a one-line edit in `companiesViewRange.js` alone.
 *
 * Labels come from the scheduler's own `calendar.view` vocabulary, so the two tabs
 * do not spell Day/Week/Month/Year two different ways — this control is the one on
 * the Companies tab that most wants to read as the same control.
 */
const VIEW_ORDER = SELECTABLE_COMPANIES_VIEWS.map((value) => ({
  value,
  ...COMPANIES_VIEW_META[value],
}));

const useStyles = makeStyles((theme) => ({
  /**
   * Inline now, not floating.
   *
   * This used to be fixed to the bottom-right corner because it floated free of
   * both views it switches between. It now renders inside `CompaniesFilters`'s
   * own toolbar row, threaded in through that component's `viewSwitch` slot — so
   * it needs no position of its own at all, just to behave as an ordinary flex
   * child at the end of that row.
   *
   * Geometry copied by value, not by class import, from `calendarHeaderToolbarToggle`
   * / `calendarHeaderToolbarToggleBtn` (the Day/Week/Month switch in
   * `calendar/calendar.styles.js`) — the "Notion-style segmented pill" every
   * text-labelled toggle in this app now shares: flat grey track, no border, a 4px
   * gap between individually-rounded segments, and the selected segment lifted off
   * the track as its own white pill. Kept in step with that class by hand; a future
   * editor changing one should carry the change to the other. With four segments
   * naming the same units that control names, the resemblance is now literal.
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
      // Beside the date-range pill this must keep its own width, not be squeezed
      // by the toolbar's wrap.
      flex: '0 0 auto',
    },
  },

  button: {
    '&.MuiToggleButton-root': {
      height: 'auto',
      // Fills the shell's full 32px rather than floating inside it — same
      // `stretch` the reference control uses so its inner radius nests against
      // the shell's instead of leaving a visible gap of track around it.
      alignSelf: 'stretch',
      // 12px of side padding — comfortable at two segments; kept rather than
      // widened back to the reference control's spacing so this doesn't drift
      // from it while both are read side by side.
      padding: '4px 12px',
      border: '1px solid transparent',
      borderRadius: '7px !important',
      // 14px/500/none-transform is this app's `typography.button` default, which
      // is also what the reference control renders at — it sets no font rule of
      // its own and relies on that same default. Stated explicitly here instead
      // of left implicit, since this file already states its own type elsewhere.
      fontSize: '14px',
      fontWeight: 500,
      lineHeight: '20px',
      letterSpacing: 'normal',
      textTransform: 'none',
      whiteSpace: 'nowrap',
      color: theme.palette.textPlaceholder,
      '&:hover': { backgroundColor: theme.palette.borderSubtle2 },
      /**
       * The selected segment, drawn as its own lifted white pill — same shadow
       * value as `calendarHeaderToolbarToggleBtn`'s identical rule.
       *
       * Confirmed product decision on that control, asked for twice, and carried
       * here for the same reason: selected and unselected segments share one font
       * weight. Do not bump the weight on `.Mui-selected` — the white fill and its
       * shadow are the whole signal for "active", and a heavier weight on top of
       * that reads as a second, competing one.
       */
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
 * How much of the book the Companies tab is showing.
 *
 * A segmented control rather than a filter, because these are readings of one
 * subject and exactly one of them is true at a time. `exclusive` with the null
 * guard: clicking the active segment must be a no-op, or the pane would be asked
 * to render no view at all.
 *
 * Changing this moves the date range with it — see `CompaniesPane.handleChange`.
 * That is the whole reason it is not a filter: a filter narrows what you are
 * looking at, and this decides what "the period" even means.
 *
 * **Renders nothing when only one grain is offered.** With
 * `SELECTABLE_COMPANIES_VIEWS` currently down to Year alone, a one-segment toggle
 * has nothing to switch between — it would be a button-shaped label, permanently
 * "selected", that a planner could click without anything happening. That is a
 * worse signal than no control at all, and it is a real state now rather than a
 * hypothetical: this list has changed three times in one sitting.
 */
const CompaniesViewSwitch = ({ value, onChange }) => {
  const classes = useStyles();
  const { t } = useTranslation();

  if (VIEW_ORDER.length < 2) return null;

  return (
    <ToggleButtonGroup
      className={classes.group}
      exclusive
      size="small"
      value={value}
      onChange={(_event, next) => next && onChange(next)}
      aria-label={t('obx.schedules.calendar.companies.viewSwitch.label')}
    >
      {VIEW_ORDER.map((view) => (
        <Tooltip
          key={view.value}
          title={t(`obx.schedules.calendar.companies.viewSwitch.${view.hintKey}`)}
          placement="top"
          arrow
        >
          <ToggleButton className={classes.button} value={view.value} disableRipple>
            {t(`obx.schedules.calendar.view.${view.labelKey}`)}
          </ToggleButton>
        </Tooltip>
      ))}
    </ToggleButtonGroup>
  );
};

CompaniesViewSwitch.propTypes = {
  value: PropTypes.oneOf(SELECTABLE_COMPANIES_VIEWS).isRequired,
  onChange: PropTypes.func.isRequired,
};

export default CompaniesViewSwitch;
