import { makeStyles } from '@mui/styles';
export const useStyles = makeStyles((theme) => ({
  // The invoice-number cell: pointer, row tint, and the chevron revealed on hover.
  // The tint is left to the shared table so a hovered row is one colour — this used
  // to force `#f2f2f2` on the first two cells while the rest of the row took the
  // brand tint and the sticky action cell stayed white, giving a three-tone row.
  ZonesTD: {
    cursor: 'pointer',
    '&:hover': {
      '& .MuiBox-root': {
        '& > :nth-child(2)': {
          '& svg': {
            visibility: 'visible !important',
          },
        },
      },
    },
  },

  qbPopover: {
    '& .MuiPaper-root': {
      borderRadius: '8px',
      border: `1px solid ${theme.palette.borderSubtle1}`,
      boxShadow:
        '0px 12px 16px -4px rgba(16, 24, 40, 0.08), 0px 4px 6px -2px rgba(16, 24, 40, 0.03)',
      minWidth: '180px',
    },
  },

  qbPopoverOption: {
    padding: '12px 16px',
    cursor: 'pointer',
    color: theme.palette.textPrimary,
    fontSize: '14px',
    lineHeight: '20px',
    '&:hover': {
      backgroundColor: theme.palette.surfaceHover || '#f9fafb',
    },
  },

  // The chevron is a hover affordance, so it is taken out of flow. Reserving 32px
  // for a permanently invisible icon is what truncated `INV-2026-08032` to
  // `INV-2026-0…`: the identifier needed 116px and had 100px.
  franchiseNameIcon: {
    position: 'absolute',
    right: 0,
    top: '50%',
    transform: 'translateY(-50%)',
    width: '20px',
    height: '20px',
    display: 'flex',
    alignItems: 'center',
    pointerEvents: 'none',
    '& svg': {
      visibility: 'hidden',
      width: '20px',
      height: '20px',
      '& path': {
        stroke: '#b3b3b3',
      },
    },
  },

  franchiseNameText: {
    '&.MuiBox-root': {
      color: theme.palette.textSecondary1,
      fontWeight: 500,
      minWidth: 0,
      overflow: 'hidden',
      whiteSpace: 'nowrap',
      textOverflow: 'ellipsis',
    },
  },

  franchiseName: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    paddingRight: '4px',
  },

  sitesListingContainer: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    overflow: 'auto',
    padding: '24px 32px 32px',

    [theme.breakpoints.down('lg')]: {
      padding: '16px 24px 24px',
    },
  },

  tabsBar: {
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: '16px',
    flexWrap: 'wrap',
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
    marginBottom: '16px',
  },

  // Page-level actions live with the tabs. They used to sit in the filter row and
  // be *replaced* by the bulk-approve button whenever a row was selected, so
  // selecting a row hid Export and Create Invoice.
  tabsActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    paddingBottom: '8px',
  },

  // One chip per cell, one line, so rows stay 48px. The second chip here was what
  // pushed five of eight rows to 61px.
  paymentStateCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    minWidth: 0,
    '& .MuiChip-root': { maxWidth: '100%', height: '24px' },
    '& .MuiChip-label': {
      textTransform: 'none',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
    // The exception chip: white ground, its own colour as a real border. The theme
    // draws outlined-warning and filled-warning with near-identical fills, so
    // `variant="outlined"` alone left "Part paid" and "Short paid" looking like two
    // payment states rather than a state and a caveat on it.
    //
    // Three classes deep on purpose: the theme's own `.MuiChip-root.MuiChip-colorWarning`
    // fill matches a two-class selector, so a shorter one here loses on source order.
    '& .MuiChip-root.MuiChip-outlined': {
      background: `${theme.palette.surfaceWhite} !important`,
      borderWidth: '1px',
      borderStyle: 'solid',
      borderColor: 'currentColor',
    },
  },

  // Money: right-aligned so decimals line up down the column, and tabular figures
  // so digits do not shift width between rows.
  numericCell: {
    fontVariantNumeric: 'tabular-nums',
    fontFeatureSettings: '"tnum"',
    whiteSpace: 'nowrap',
  },

  amountOverdue: {
    color: theme.palette.textAlert,
    fontWeight: 600,
  },

  amountOpen: {
    color: theme.palette.textPrimary,
    fontWeight: 600,
  },

  amountSettled: {
    color: theme.palette.textSecondary3,
  },

  dueLate: { color: theme.palette.textAlert, fontWeight: 600, whiteSpace: 'nowrap' },
  dueToday: { color: theme.palette.textWarning, fontWeight: 600, whiteSpace: 'nowrap' },
  dueUpcoming: { color: theme.palette.textSecondary1, whiteSpace: 'nowrap' },
  dueSettled: { color: theme.palette.textSecondary3 },

  // The selection column is 56px, so the checkbox cannot carry MUI's default 9px
  // ripple padding on top of the cell's own.
  checkBoxCustom: {
    '&.MuiButtonBase-root': { padding: '2px' },
  },

  leftSide: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },

  rightBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },

  sideDrawerHeight: {
    '& .MuiDrawer-paper': {
      '& > .MuiBox-root': {
        height: '100%',
      },
    },
  },

  // Long customer and site names truncate with a tooltip rather than wrapping. A
  // wrapped cell takes the row past 48px and breaks the rhythm of the whole table.
  truncateCell: {
    '&.MuiTableCell-root': {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
  },

  tableWrapper: {
    display: 'flex',
    flexDirection: 'column',
    flex: '1',
    overflow: 'auto',
    // Open table, not a contained one — the same treatment as the dashboard and the
    // other main listings. The shared table's own header hairlines do the separating,
    // so no outer border and no radius here.
    // 16px rather than the shared table's 24px. Eleven columns of 48px gutters spent
    // 528px on whitespace, which is most of why the money columns were off-screen.
    // Still reads as the same table — the row height, hover and header are untouched.
    '& table': {
      // `!important` because the shared table sets this five classes deep
      // (`.MuiTable-root .MuiTableBody-root .MuiTableRow-root .MuiTableCell-root`), and
      // matching that selector here would leave the winner decided by injection order.
      '& th, & td': { padding: '0 16px !important' },
      // A sticky column that reads as a layer, not as clipped data. Without the
      // shadow, the opaque action column looked like it had cut the date in half.
      '& th:nth-last-child(1), & td:nth-last-child(1)': {
        boxShadow: '-8px 0 8px -8px rgba(16, 24, 40, 0.18)',
      },
    },

    // Sticky cells paint their own background, so they have to follow the row's hover
    // state explicitly or a hovered row is white at both ends and tinted in the middle.
    '& tbody tr:hover': {
      '& td:nth-child(1), & td:nth-child(2), & td:last-child': {
        background: theme.palette.surfaceBrandSubtle,
      },
    },
    // The empty state is rendered in a cell spanning the whole table, so it used to
    // centre on the table's scroll width and land off to the right of the viewport.
    '& td[colspan] > *': {
      position: 'sticky',
      left: 0,
      width: 'auto',
    },
  },

  // Widths live in the column definitions; only the sticky offsets are positional, and
  // they depend on the first two columns being locked. `left` has to match the
  // selection column's declared width — two sources of truth for one number is how
  // a header and its body cells ended up 40px apart before.
  tableWrapperUS: {
    '& table': {
      '& th:nth-child(2)': {
        position: 'sticky',
        left: '52px',
        background: theme.palette.surfaceWhite,
        zIndex: '21',
        boxShadow: '8px 0 8px -8px rgba(16, 24, 40, 0.18)',
      },

      '& td:nth-child(2)': {
        position: 'sticky',
        left: '52px',
        background: theme.palette.surfaceWhite,
        zIndex: '20',
        boxShadow: '8px 0 8px -8px rgba(16, 24, 40, 0.18)',
      },
      '& th:last-child': {
        position: 'sticky',
        right: '0',
        background: theme.palette.surfaceWhite,
        zIndex: '22',
      },
      '& td:last-child': {
        position: 'sticky',
        right: '0',
        background: theme.palette.surfaceWhite,
        zIndex: '20',
      },
    },
  },

  // German franchises hide push-to-accounting, so there is no selection checkbox and
  // the identifier is the first column.
  tableWrapperGermany: {
    '& table': {
      '& th:nth-child(1)': {
        position: 'sticky',
        left: '0',
        background: theme.palette.surfaceWhite,
        zIndex: '22',
        boxShadow: '8px 0 8px -8px rgba(16, 24, 40, 0.18)',
      },

      '& td:nth-child(1)': {
        position: 'sticky',
        left: '0',
        zIndex: '21',
        boxShadow: '8px 0 8px -8px rgba(16, 24, 40, 0.18)',
      },
      '& th:last-child': {
        position: 'sticky',
        right: '0',
        background: theme.palette.surfaceWhite,
        zIndex: '22',
      },
      '& td:last-child': {
        position: 'sticky',
        right: '0',
        background: theme.palette.surfaceWhite,
        zIndex: '20',
      },
    },
  },

  reportsDrawerActions: {
    borderTop: `1px solid ${theme.palette.borderSubtle1}`,
    padding: '16px 24px',
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: '12px',
  },
  contractName: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    '& .MuiChip-root.MuiChip-filled': {
      border: `1px solid ${theme.palette.borderSubtle1}`,
      background: theme.palette.surfaceGreySubtle,
      color: theme.palette.textSecondary3,
      fontSize: '12px',
    },
    '& span.MuiTypography-root': {
      color: theme.palette.textPlaceholder,
    },
  },
  associatedSites: {
    display: 'flex',
    alignItems: 'center',
    columnGap: '8px',
    minWidth: 0,
  },
  associatedSitesItem: {
    padding: '2px 8px',
    borderRadius: '24px',
    lineHeight: '18px',
    border: `1px solid ${theme.palette.borderSubtle1}`,
    background: theme.palette.surfaceGreySubtle,
    color: theme.palette.textSecondary3,
    fontSize: '12px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  associatedSitesNo: {
    color: theme.palette.textSecondary3,
    fontSize: '12px',
    lineHeight: '18px',
    whiteSpace: 'nowrap',
  },
  exportButton: {
    '& svg': {
      width: '17px',
      height: '17px',
    },
  },
}));
