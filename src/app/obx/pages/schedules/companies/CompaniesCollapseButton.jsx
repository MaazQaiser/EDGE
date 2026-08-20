import UnfoldLessIcon from '@mui/icons-material/UnfoldLess';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import { Button, Tooltip } from '@mui/material';
import { makeStyles } from '@mui/styles';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';

import { MATRIX_DENSITY } from './matrixDensity';

/**
 * Collapse or expand the year matrix — **one button, not a two-segment toggle.**
 *
 * The toggle it replaces named the two states and lit the active one, which is the
 * right shape for a control whose options are both worth showing (the grain switch
 * next door, where Day and Year are equally reasonable places to be). This is not
 * that: one of the two states is always the one you are in, and the screen behind
 * the button already says which — the month headings are either there or they are
 * not. So the toggle spent two segments restating what the table underneath it
 * showed, and the button spends one saying the only thing a reader does not already
 * know: what pressing it will do.
 *
 * Which is why it is labelled with the **action, not the state** — "Collapse" while
 * expanded, "Expand" while collapsed. The tooltip carries what the label cannot,
 * since "Collapse" does not say *what* collapses.
 *
 * Styled as the toolbar's own tertiary button at 28px, which is what the controls
 * beside it run at — the three filter dropdowns, Clear all, and the arrows and Today
 * inside the date navigator. Not the 32px the app's segmented pills stand at: none of
 * those is in this row, and matching them made this button and its separator the two
 * tallest marks in a row of 28s.
 */
const useStyles = makeStyles(() => ({
  button: {
    '&.MuiButton-root': {
      /* 28px — `clearButton`'s height exactly, which is the control immediately to
         its left, and the dropdowns' height before that. The `tertiaryGrey` variant's
         own default is 36. */
      height: '28px',
      minWidth: 'auto',
      padding: '0 10px',
      gap: '6px',
      borderRadius: '8px',
      fontSize: '12px',
      fontWeight: 500,
      lineHeight: '16px',
      whiteSpace: 'nowrap',
      /* Colour, hover and the transparent fill come from the `tertiaryGrey` variant,
         not from here — this is the same button family as `Today` in the date
         navigator, and the two should be indistinguishable apart from the size rules
         above. Restating the greys locally is how the two drift. */
    },
    /**
     * The fold marks, upright — `UnfoldLess`/`UnfoldMore` as drawn, chevrons meeting
     * above and below a line.
     *
     * They were turned a quarter turn first, reasoning that what folds here is
     * *horizontal*: twelve month columns closing into one strip. Asked for upright
     * instead, and the ask is the better read — rotated, the glyph stops being the
     * fold mark every reader already knows and becomes an unfamiliar pair of
     * arrowheads that has to be worked out. A recognised icon pointing the "wrong"
     * way costs less than a literal one nobody recognises.
     */
    '& .MuiSvgIcon-root': {
      width: '16px',
      height: '16px',
    },
  },
}));

const CompaniesCollapseButton = ({ value, onChange }) => {
  const classes = useStyles();
  const { t } = useTranslation();

  const collapsed = value === MATRIX_DENSITY.COLLAPSED;
  /* The state it moves to, which is also the state the label names. */
  const next = collapsed ? MATRIX_DENSITY.EXPANDED : MATRIX_DENSITY.COLLAPSED;
  const key = collapsed ? 'expand' : 'collapse';
  const Glyph = collapsed ? UnfoldMoreIcon : UnfoldLessIcon;

  return (
    <Tooltip title={t(`obx.schedules.calendar.companies.density.${key}Hint`)} placement="top" arrow>
      <Button variant="tertiaryGrey" className={classes.button} onClick={() => onChange(next)}>
        <Glyph />
        {t(`obx.schedules.calendar.companies.density.${key}`)}
      </Button>
    </Tooltip>
  );
};

CompaniesCollapseButton.propTypes = {
  /** The density now — decides both the label and what the press moves to. */
  value: PropTypes.oneOf(Object.values(MATRIX_DENSITY)).isRequired,
  onChange: PropTypes.func.isRequired,
};

export default CompaniesCollapseButton;
