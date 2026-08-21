import { makeStyles } from '@mui/styles';

/**
 * Built to the app's existing idioms rather than new ones:
 *
 * 1. **Divided strips** — equal cells separated by hairlines, marker + label +
 *    figure, no cards and no shadows. Same as the OBX dashboard's
 *    "Functional Sites / Dedicated Shifts / …" strip. This tab uses two: the
 *    position, then the same balance by age. Both cells share one shape, so the
 *    second strip reads as a breakdown of the first rather than as a new device.
 * 2. **The shared table, untouched** — `table.styles` already sets 48px rows,
 *    24px cell padding, a sticky first column and the hover tint. This file adds
 *    no cell padding, no row borders and no header tint; cells hold one line each.
 *
 * Type comes from Typography variants, colour from `theme.palette`.
 */
export const useStyles = makeStyles((theme) => ({
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    background: theme.palette.surfaceWhite,
    borderRadius: '8px',
    overflow: 'hidden',
    marginBottom: '32px',
    // The page container is a scrolling flex column; without this the card is
    // squeezed to the viewport and the queue gets clipped mid-row.
    flexShrink: 0,
  },

  /* --------------------------------------------------------- stat strip */

  statStrip: {
    display: 'flex',
    alignItems: 'stretch',
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
  },

  stat: {
    flex: '1 1 0',
    minWidth: 0,
    padding: '12px 24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '1px',
    borderRight: `1px solid ${theme.palette.borderSubtle1}`,
    // Without this the last cell draws a hairline exactly on the card's own right
    // edge, which reads as a stray rule.
    '&:last-child': { borderRight: 'none' },
  },

  statHead: { display: 'flex', alignItems: 'center', gap: '8px' },

  // The app's own stat-label idiom (dashboard: "Total Contracts (i)"). Only
  // "Credits Held" carries one — it is the single figure in this strip that isn't
  // self-describing, because it is money owed *back*, not money owed.
  statInfo: {
    display: 'flex',
    alignItems: 'center',
    '& svg': { width: '14px', height: '14px', display: 'block' },
  },

  statDot: { width: '10px', height: '10px', borderRadius: '50%', flexShrink: 0 },

  dotBrand: { background: theme.palette.surfaceBrand },
  dotAlert: { background: theme.palette.surfaceAlertStrong },
  dotWarning: { background: theme.palette.surfaceWarningStrong },

  statLabel: { '&.MuiTypography-root': { color: theme.palette.textPrimary } },

  statValue: { '&.MuiTypography-root': { color: theme.palette.textSecondary1 } },

  statValueAlert: { '&.MuiTypography-root': { color: theme.palette.textAlert } },

  // This line carries the qualifier that stops the figure above it being misread,
  // so it has to be legible: textSecondary3 measures 3.6:1 on white, under the AA
  // floor, and textSecondary1 measures 9.7:1.
  statHint: { '&.MuiTypography-root': { color: theme.palette.textSecondary1 } },

  /* --------------------------------------------------- aging bands */

  bandStrip: {
    display: 'flex',
    alignItems: 'stretch',
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
    background: theme.palette.surfaceGreySubtle,
  },

  // Same three lines as a stat cell, one step quieter, and a real button: the
  // bands are the tab's filter, so the figures themselves are the controls.
  band: {
    flex: '1 1 0',
    minWidth: 0,
    padding: '10px 24px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '1px',
    textAlign: 'left',
    font: 'inherit',
    cursor: 'pointer',
    border: 'none',
    borderRight: `1px solid ${theme.palette.borderSubtle1}`,
    background: 'transparent',
    '&:last-child': { borderRight: 'none' },
    '&:hover': { background: theme.palette.surfaceWhite },
    '&:focus-visible': {
      outline: `2px solid ${theme.palette.borderBrand}`,
      outlineOffset: '-2px',
    },
  },

  bandActive: {
    background: theme.palette.surfaceWhite,
    '&:hover': { background: theme.palette.surfaceWhite },
    // Inset rather than a border, so switching a band on cannot move the figures
    // inside it by a pixel.
    boxShadow: `inset 3px 0 0 0 ${theme.palette.surfaceBrand}`,
  },

  // An empty band is dimmed *and* disabled. Dimming alone left it clickable, so
  // clicking a band that visibly reads 0 produced the "nothing matches" empty
  // state — a dead end the reader could see was empty before clicking.
  bandEmpty: {
    opacity: 0.5,
    cursor: 'default',
    '&:hover': { background: 'transparent' },
  },

  bandHead: { display: 'flex', alignItems: 'center', gap: '8px' },

  bandMarker: { width: '2px', height: '14px', borderRadius: '2px', flexShrink: 0 },

  markerWarning: { background: theme.palette.surfaceWarningStrong },
  markerAlert: { background: theme.palette.surfaceAlertStrong },
  markerNeutral: { background: theme.palette.borderStrong1 },

  bandLabel: { '&.MuiTypography-root': { color: theme.palette.textSecondary1 } },

  bandValue: { '&.MuiTypography-root': { color: theme.palette.textPrimary } },

  bandCount: { '&.MuiTypography-root': { color: theme.palette.textSecondary1 } },

  /* --------------------------------------------------------- work queue */

  // Rows stay clickable but keep the shared table's own hover tint.
  customerRow: { cursor: 'pointer' },

  numericCell: { '&.MuiTableCell-root': { textAlign: 'right' } },

  strongText: { '&.MuiTypography-root': { color: theme.palette.textPrimary } },

  alertText: { '&.MuiTypography-root': { color: theme.palette.textAlert, fontWeight: 500 } },

  mutedText: { '&.MuiTypography-root': { color: theme.palette.textSecondary1 } },

  /* ------------------------------------------------------- counted line */

  countRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '8px 16px',
    flexWrap: 'wrap',
    padding: '8px 24px',
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
  },

  countText: { '&.MuiTypography-root': { color: theme.palette.textSecondary1 } },

  countStrong: { fontWeight: 600, color: theme.palette.textPrimary },

  // Expansion is a real button, not a decorated cell: the row's onClick is a
  // convenience for pointers, and this is what keyboard and screen-reader users
  // actually operate. 32px square clears WCAG 2.5.8; the chevron inside stays
  // 24px so the rendered mark is unchanged.
  expandButton: {
    '&.MuiButtonBase-root': {
      minWidth: '32px',
      width: '32px',
      height: '32px',
      padding: 0,
      borderRadius: '6px',
      color: theme.palette.textSecondary3,
      '&:hover': { background: 'rgba(16, 24, 40, 0.06)' },
      '&:focus-visible': {
        outline: `2px solid ${theme.palette.borderBrand}`,
        outlineOffset: '1px',
      },
    },
  },

  chevron: {
    display: 'flex',
    alignItems: 'center',
    transition: 'transform 120ms ease',
    '& path': { stroke: theme.palette.textSecondary3 },
  },

  chevronOpen: { transform: 'rotate(90deg)' },

  /* --------------------------------------------- nested invoice table */

  // Same shape as payroll's inner table: a nested table inside a full-width cell.
  // Padding stays at zero — the nested table is 100% wide, so padding here pushed
  // it past the right edge and clipped the action column. The indent lives on the
  // inner table's first cell instead.
  expansionCell: {
    '&.MuiTableCell-root': {
      padding: 0,
      background: theme.palette.surfaceGreySubtle,
      height: 'auto',
      whiteSpace: 'normal',
    },
  },

  innerTable: {
    '& .MuiTableRow-root': { background: 'transparent' },
    '& .MuiTableCell-root': {
      paddingLeft: '16px',
      paddingRight: '16px',
      '&:first-child': { paddingLeft: '40px', background: 'transparent' },
      '&:last-child': { paddingRight: '24px' },
      // Chip labels are title-cased by the theme; these read as sentences.
      '& .MuiChip-label': { textTransform: 'none' },
    },
    '& .MuiTableCell-head': { background: 'transparent' },
  },

  // Row actions are icon buttons in this module (see the All Invoices action
  // column). A text button also could not fit: eight nowrap columns plus a
  // labelled button overflowed the nested table past the card edge.
  iconAction: {
    '&.MuiButtonBase-root': {
      minWidth: 'auto',
      padding: '4px',
      '& .MuiButton-startIcon': { margin: 0 },
    },
  },

  invoiceLink: {
    '&.MuiButtonBase-root': {
      padding: 0,
      minWidth: 'auto',
      justifyContent: 'flex-start',
    },
  },

  /* -------------------------------------------------------------- states */

  emptyState: {
    padding: '48px 24px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '6px',
    whiteSpace: 'normal',
  },

  emptyBody: { '&.MuiTypography-root': { color: theme.palette.textSecondary3, maxWidth: '46ch' } },

  skeletonStack: { display: 'flex', flexDirection: 'column', gap: '12px', padding: '20px 24px' },
}));
