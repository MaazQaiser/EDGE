import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  activityDrawer: {
    display: 'flex',
    flexDirection: 'column',
    flex: '1',
    overflow: 'auto',
  },

  drawerHeader: {
    padding: '24px 24px 16px 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  cancelIcon: {
    '&.MuiButtonBase-root': {
      padding: '0px',
      height: 'auto',
      minWidth: 'auto',
    },
  },

  datePicker: {
    padding: '0px 24px 0 24px',
    '& .MuiFormControl-root': {
      width: '100%',
    },
  },

  drawerInner: {
    padding: '0px 24px 16px 24px',
    display: 'flex',
    flexDirection: 'column',
    flex: '1',
    overflow: 'auto',
    gap: '8px',
  },

  labelClass: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
    },
  },

  missedBox: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '8px 12px',
    borderRadius: '4px',
    width: 'calc(100% - 20px)',
    border: `1px solid ${theme.palette.borderSubtle1}`,
    background: theme.palette.surfaceGreySubtle,
    '& .MuiTypography-root.MuiTypography-h5': {
      color: theme.palette.textPrimary,
      marginBottom: '4px',
    },
    '& .MuiTypography-root.MuiTypography-subtitle3': {
      color: theme.palette.textPrimary,
    },
    '& .MuiTypography-root.MuiTypography-body3': {
      display: 'block',
      color: theme.palette.textSecondary2,
    },
  },

  missedButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',

    '& .MuiButtonBase-root': {
      padding: '0px',
      height: '32px',
      minWidth: '32px',
    },
  },

  drawerHeaderNew: {
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
    padding: '24px 24px 16px 24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },

  drawerHeaderTop: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    justifyContent: 'space-between',
    width: '100%',
  },

  drawerInnerMissed: {
    margin: '0 24px',
  },

  drawerHeaderLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },

  drawerHeaderTitle: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
    },
  },

  drawerHeaderBottom: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },

  dot: {
    width: '3px',
    height: '3px',
  },

  drawerHeaderText: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
    },
  },

  drawerBodyTitle: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
    },
  },

  drawerDateRange: {
    '& .MuiFormControl-root': {
      minWidth: '100%',
      '& .MuiInputBase-root': {
        minWidth: '100%',
      },
    },
  },

  drawerFilters: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },

  /**
   * A route row — **a real button, and selectable.**
   *
   * It was a `Box` with an `onClick`: no keyboard focus, no pressed state, and nothing to say a
   * row had been chosen because choosing one used to open a modal immediately. Now the row holds
   * the selection, so it needs both a focus ring and a selected treatment.
   *
   * `text-align: left` and the reset are what a `<button>` costs — without them the row centres
   * its own contents and inherits the browser's button chrome.
   */
  reassignHit: {
    borderRadius: '8px',
    backgroundColor: theme.palette.surfaceGreySubtle,
    display: 'flex',
    alignItems: 'center',
    /* One line, ~46px. Two lines was ~70px, which fit seven routes in the pane; this fits about
       thirteen. The row's own padding does the separating now that there is no second line to
       hold the meta. */
    padding: '11px 12px',
    width: 'calc(100% - 20px)',
    cursor: 'pointer',
    textAlign: 'left',
    font: 'inherit',
    border: '1px solid transparent',
    transition: 'background 120ms ease, border-color 120ms ease',
    '&:hover': {
      backgroundColor: theme.palette.surfaceGreyHover || theme.palette.surfaceGreySubtle,
    },
    '&:focus-visible': {
      outline: `2px solid ${theme.palette.borderBrand}`,
      outlineOffset: '2px',
    },
  },

  /* The chosen route. Brand-subtle ground plus a brand edge — the same pairing the product uses
     for a selected option elsewhere — so the footer's sentence has a visible referent in the
     list rather than being the only sign anything was picked. */
  reassignHitSelected: {
    backgroundColor: theme.palette.surfaceBrandSubtle,
    borderColor: theme.palette.borderBrand,
    '&:hover': { backgroundColor: theme.palette.surfaceBrandSubtle },
  },

  reassignHitHead: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    width: '100%',
    minWidth: 0,
  },

  /* Pushed to the row's right edge, so a column of routes has its names on one axis and its
     figures on another — which is what makes a dense list scannable rather than merely short.
     `flex-shrink: 0` because the name is the part that should ellipsis, never the facts. */
  reassignHitMeta: {
    marginLeft: 'auto',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    flexShrink: 0,
  },

  /* "Same day" — the one badge on the row, so it has to mean something a planner acts on. It
     marks the route falling on the date the work was originally due, which is the answer they
     are usually looking for and previously had to derive by reading every row's date. */
  reassignHitSameDay: {
    '&.MuiChip-root': {
      height: '20px',
      backgroundColor: theme.palette.surfaceBrandSubtle,
      color: theme.palette.textBrand,
      '& .MuiChip-label': { padding: '0 8px', fontSize: '11px', fontWeight: 500 },
    },
  },

  /* The page boundary. Quiet — it is a caveat on a list that works, not a failure. */
  routeTruncated: {
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary2,
      padding: '0 0 4px',
    },
  },

  /* No match for the query, which is a different miss from no routes in the window. */
  routeEmptySearch: {
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary2,
      padding: '16px 0',
    },
  },

  /**
   * The commit bar — what replaced the confirmation modal.
   *
   * Sticky to the drawer's foot and only mounted once a route is chosen, so the list keeps its
   * full height while the planner is still deciding. The top hairline is load-bearing: without
   * it the bar floats over a scrolling list with nothing to say it is a separate region.
   */
  assignFooter: {
    flex: '0 0 auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    padding: '14px 24px',
    borderTop: `1px solid ${theme.palette.borderSubtle1}`,
    backgroundColor: theme.palette.surfaceWhite,
  },
  assignFooterText: {
    '&.MuiTypography-root': { color: theme.palette.textSecondary1 },
  },
  assignFooterActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '8px',
  },

  drawerBodyInner: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    overflow: 'auto',
    gap: '8px',
  },

  reassignHitTitle: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
      minWidth: 0,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
  },

  searchComponent: {
    flex: 0,
    width: 'auto',
  },

  drawerBody: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    overflow: 'auto',
    margin: '24px',
    marginRight: 0,
    gap: '8px',
  },

  reassignHitBody: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },

  reassignHitText: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary1,
    },
  },

  reassignHitUser: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',

    '& .MuiAvatar-root': {
      width: '16px',
      height: '16px',
    },

    '& .MuiTypography-root': {
      color: theme.palette.textSecondary1,
    },
  },

  drawerBodyTop: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    padding: '0 24px',
  },

  drawerInnerNew: {
    padding: '16px 0',
    display: 'flex',
    flexDirection: 'column',
    flex: '1',
    overflow: 'auto',
  },

  /* The skeleton stands in for the rows it precedes, so it tracks their height — one line in
     11px of padding, ~46px. It was 44px against 70px rows, then 70px, and is now 46 with the
     row: a placeholder that is not its content's height makes the list jump when the real rows
     land, which reads as a second load rather than as the first one finishing. */
  loaderBox: {
    padding: '4px 0px',
    width: 'calc(100% - 20px)',
    '& .MuiSkeleton-root': {
      height: '46px',
      transformOrigin: 0,
      transform: 'none',
      borderRadius: '8px !important',
      marginBottom: '8px',
    },
  },
}));
