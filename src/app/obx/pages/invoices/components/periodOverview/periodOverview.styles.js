import { makeStyles } from '@mui/styles';

/**
 * Same idioms as `outstanding/outstanding.styles` — a divided strip of equal cells
 * from the OBX dashboard, hairline-divided bands, no cards and no shadows — so the
 * two tabs read as one feature rather than two authors.
 *
 * The card holds the filters as well as the figures. Every row is the same
 * hairline-divided band, so the summary, the scope and the selection read as one
 * object rather than a widget with a toolbar loose underneath it.
 */
export const useStyles = makeStyles((theme) => ({
  // Open, not contained: the app separates regions with hairlines rather than cards
  // and shadows (the OBX dashboard's strip is the reference). So there is no outer
  // border and no radius — the bands inside do the structuring, and the table below
  // continues the same open treatment.
  widget: {
    background: theme.palette.surfaceWhite,
    flexShrink: 0,
  },

  /* --------------------------------------------------------- stat strip */

  statStrip: {
    display: 'flex',
    alignItems: 'stretch',
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
  },

  // Equal quarters, and every cell is the same three lines: marker and label, the
  // figure, one qualifying line. An earlier pass gave the open balance a double
  // cell with a bar and two inline counts inside it, which made one figure look
  // like a headline and the others like footnotes — they are peers, and a reader
  // compares them left to right.
  stat: {
    flex: '1 1 0',
    minWidth: 0,
    padding: '12px 24px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '1px',
    textAlign: 'left',
    borderRight: `1px solid ${theme.palette.borderSubtle1}`,
    // `:last-child`, not `:last-of-type`. An aging cell with matches renders as a
    // `<button>` and the plain cells render as `<div>`, so `:last-of-type` matched
    // the last of *each* — which stripped the divider between Not yet due and
    // Overdue whenever only the first of the pair was interactive.
    '&:last-child': { borderRight: 'none' },
  },

  // The two aging cells are also the aging filter. Same cell, plus the affordances
  // that say a figure can be pressed: a hover tint, a focus ring, and a brand
  // hairline down the left edge when it is on.
  statButton: {
    border: 'none',
    borderRight: `1px solid ${theme.palette.borderSubtle1}`,
    background: 'transparent',
    font: 'inherit',
    cursor: 'pointer',
    position: 'relative',
    '&:hover': { background: theme.palette.surfaceGreySubtle },
    '&:focus-visible': {
      outline: `2px solid ${theme.palette.borderBrand}`,
      outlineOffset: '-2px',
    },
  },

  statActive: {
    background: theme.palette.surfaceGreySubtle,
    '&:hover': { background: theme.palette.surfaceGreySubtle },
    // Inset rather than a border, so switching the filter on cannot move the
    // figures inside the cell by a pixel.
    boxShadow: `inset 3px 0 0 0 ${theme.palette.surfaceBrand}`,
  },

  statHead: { display: 'flex', alignItems: 'center', gap: '8px' },

  statDot: { width: '10px', height: '10px', borderRadius: '50%', flexShrink: 0 },

  dotBrand: { background: theme.palette.surfaceBrand },
  dotSuccess: { background: theme.palette.surfaceSuccessStrong },
  dotAlert: { background: theme.palette.surfaceAlertStrong },
  dotNeutral: { background: theme.palette.borderStrong1 },

  statLabel: { '&.MuiTypography-root': { color: theme.palette.textPrimary } },

  statValue: { '&.MuiTypography-root': { color: theme.palette.textSecondary1 } },

  statValueAlert: { '&.MuiTypography-root': { color: theme.palette.textAlert } },

  // textSecondary3 on white is 3.6:1, and this line carries the qualifier that
  // stops the figure above it being misread. It needs to be legible.
  //
  // It is also where credit notes and held surplus are reported. They used to get a
  // band of their own below the strip, which appeared and disappeared with the
  // period — so changing the month moved the whole table down 33px. A line that is
  // always there and sometimes says more cannot do that.
  statHint: {
    '&.MuiTypography-root': { color: theme.palette.textSecondary1, whiteSpace: 'nowrap' },
  },

  /* ------------------------------------------------------- filter row */

  controlsRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    // Five filters and five period buttons have to share 1324px at 1512 — six,
    // once a filter is applied and "Clear all" joins them. The row still wraps
    // gracefully below that, but at the width this module is measured at it stays
    // one line — a wrapped filter row moves the table by 44px, which is exactly
    // what applying a filter used to do. Budget with the button present: left
    // group 756px + 12px + presets 539px against 1324px. The 17px of slack is
    // the whole margin, so any label in this row that grows has to be paid for
    // out of another one.
    gap: '8px 12px',
    padding: '8px 24px',
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
    // Reserved so swapping the presets for the custom range, or a note taking their
    // place, cannot move the table under the reader.
    minHeight: '52px',
  },

  controlsLeft: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    // 6px, not 8px: the optional "Clear all" is a sixth member of this group and
    // the row has no spare width for it at 1512 (see `controlsRow`).
    gap: '8px 6px',
    minWidth: 0,
  },

  controlsRight: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '8px 12px',
    marginLeft: 'auto',
  },

  // MUI's outlined input carries a ~220px intrinsic minimum, so a narrower wrapper
  // does not contain it — the fieldset rendered 30px past its box and sat on top of
  // the next dropdown. Clamp the control to the wrapper rather than trusting it.
  searchBox: {
    // 160px, not 184px: the placeholder is clipped at either width, and the 24px
    // buys the width "Clear all" needs to stay on this line.
    width: '160px',
    flexShrink: 0,
    '& .MuiFormControl-root, & .MuiInputBase-root': { width: '100%', minWidth: 0 },
  },

  clearAction: {
    '&.MuiButtonBase-root': {
      minWidth: 'auto',
      padding: '0 4px',
      height: '28px',
      minHeight: '28px',
    },
  },

  searchNote: { '&.MuiTypography-root': { color: theme.palette.textAlert, fontWeight: 500 } },

  // The app's segmented-control look (Day/Week/Month on the scheduler, and
  // Dedicated/Patrol on the dashboard): quiet until selected, brand fill when it is.
  preset: {
    '&.MuiButtonBase-root': {
      minWidth: 'auto',
      padding: '5px 10px',
      borderRadius: '6px',
      whiteSpace: 'nowrap',
    },
  },

  presetIdle: {
    '&.MuiButtonBase-root': {
      color: theme.palette.textSecondary1,
      '&:hover': {
        color: theme.palette.textPrimary,
        background: theme.palette.surfaceGreySubtle,
      },
    },
  },

  presetGroup: { display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' },

  rangePicker: {
    width: '236px',
    '& .MuiStack-root': { padding: 0, overflow: 'unset' },
    '& .MuiFormControl-root': { width: '100%' },
    '& .MuiInputBase-root': { height: '36px' },
    // The picker's input defaults to 16px while every other control in this row is
    // 14px, which both looked wrong and clipped the range text by 11px. The theme sets
    // it from `MuiTextField`'s `root` block, so this needs the same weight to win.
    '& .MuiInputBase-root .MuiInputBase-input': {
      fontSize: '14px !important',
    },
  },

  /* ---------------------------------------------------------- selection */

  // Selecting rows swaps the period presets for the selection's actions inside the
  // same row, rather than opening a band of its own. A band would push the table
  // down the moment a checkbox is ticked — the same jerk the credited line used to
  // cause, and on an action people take mid-scan.
  selection: { display: 'flex', alignItems: 'center', gap: '10px' },

  selectionText: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
      fontWeight: 600,
      whiteSpace: 'nowrap',
    },
  },

  skeletonStrip: { display: 'flex', flexDirection: 'column', gap: '10px', padding: '12px 24px' },
}));
