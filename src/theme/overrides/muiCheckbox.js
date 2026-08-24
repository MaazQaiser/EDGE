import CheckBoxOutlineBlankRounded from '@mui/icons-material/CheckBoxOutlineBlankRounded';
import CheckBoxRounded from '@mui/icons-material/CheckBoxRounded';
import IndeterminateCheckBoxRounded from '@mui/icons-material/IndeterminateCheckBoxRounded';
import { createElement } from 'react';

const MuiCheckbox = ({ palette }) => ({
  // The corner radius has to come from the icon, not from CSS. A Checkbox draws an SVG
  // path, so `border-radius` on the root element rounds the hover halo and leaves the box
  // itself square — an earlier `borderRadius: '4px !Important'` sat here doing exactly
  // nothing, so please do not put it back. MUI's own Rounded icon set is the cheap
  // honest fix: same 24px geometry as the default set, but the stroke's inner corners are
  // drawn at r=1 instead of mitred square, which is what reads as "rounded". A custom
  // span icon would give an exact radius, but it would also mean re-deriving the tick and
  // dash glyphs and the small/medium sizes by hand, so it was not worth it.
  defaultProps: {
    icon: createElement(CheckBoxOutlineBlankRounded),
    checkedIcon: createElement(CheckBoxRounded),
    // The indeterminate icon is rounded too, otherwise a partially-selected header
    // checkbox would be the one square box in a column of rounded ones.
    indeterminateIcon: createElement(IndeterminateCheckBoxRounded),
  },
  styleOverrides: {
    root: {
      // Was textPlaceholder (#6A6A70), which is 5.4:1 on white and read as a hard outline
      // rather than a resting control. borderStrong1 is 2.2:1 and borderSubtle2 is 1.6:1;
      // borderSubtle2 is too faint to find in a seven-row table of them, so borderStrong1
      // is the quietest tone that still locates the box. Both sit under the 3:1 that WCAG
      // 1.4.11 wants for a non-text control, which is a knowing trade for "subtle" — the
      // checked state stays on surfaceBrand precisely because that is the state that has
      // to carry the meaning.
      color: palette.borderStrong1,

      '&.Mui-checked': {
        color: palette.surfaceBrand,
      },

      '&.Mui-disabled': {
        color: palette.borderSubtle2,
      },
    },
  },
});

export default MuiCheckbox;
