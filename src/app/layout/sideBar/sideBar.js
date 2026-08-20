import { makeStyles } from '@mui/styles';

import { SIDEBAR_TRANSITION_MS, SIDEBAR_Z_INDEX } from './sidebarChrome';

/** iPad / tablet landscape-portrait (not phone ≤786, not large desktop) */
const tabletMediaQuery = '@media (min-width: 787px) and (max-width: 1024px)';

export const useStyles = makeStyles((theme) => ({
  sidebarOverlay: {
    width: '240px',
    height: '100vh',
    position: 'fixed',
    left: 0,
    top: 0,
    zIndex: SIDEBAR_Z_INDEX,
    /* Same 0.35s as before, said once: surfaces that have to move with this edge follow it
       by sampling frames, and they size their sampling window from the same number. */
    transition: `all ${SIDEBAR_TRANSITION_MS}ms`,
    [theme.breakpoints.down(786)]: {
      transform: 'translateX(-100%)',
    },
  },
  sidebarOverlayMobileOpen: {
    [theme.breakpoints.down(786)]: {
      transform: 'translateX(0) !important',
    },
  },
  backdropOverlay: {
    position: 'fixed',
    height: '100vh',
    width: '100%',
    top: 0,
    left: 0,
    background: 'rgba(0, 0, 0, 0.5)',
    zIndex: 998,
    [theme.breakpoints.up(786)]: {
      display: 'none',
    },
  },
  compressBar: {
    width: 76,
    [theme.breakpoints.down(786)]: {
      width: '240px',
    },
  },
  toggleSidebarButton: {
    position: 'absolute',
    top: '50%',
    left: '100%',
    transition: 'all 0.35s',
    cursor: 'pointer',
    transform: 'translate(-50%, -50%)',
    [theme.breakpoints.down(786)]: {
      top: '32px',
      left: '209px',
    },
  },
  toggleBtnRotated: {
    transform: 'translate(-50%, -50%) rotate(180deg)',
  },

  /**
   * The nav column, and the one element in the sidebar that actually scrolls.
   *
   * **Its scrollbar is hidden, not its overflow.** `overflowY: auto` stays — the nav
   * still scrolls, by wheel, trackpad, touch and keyboard — and only the bar itself
   * is taken off the paint. That distinction matters: `overflow: hidden` here would
   * strand every item below the fold on a short viewport, which is the failure mode
   * this rule is one keystroke away from.
   *
   * Three declarations because no single one covers the field: `::-webkit-scrollbar`
   * for Chrome, Edge and Safari, `scrollbarWidth` for Firefox, and
   * `msOverflowStyle` for the legacy Edge/IE engines. Any one alone leaves the bar
   * showing on some viewer's browser.
   *
   * It has to be stated here at all because `global.scss` paints one: its `*` block
   * gives every scrollable descendant an 8px track with a grey thumb, and against
   * this column's near-black `#262527` that thumb is the brightest thing in the
   * sidebar. A class beats that global's specificity, so this overrides it without
   * `!important`.
   *
   * (`global.scss` also carries two copies of a `.sidebarsection` rule that hides a
   * scrollbar — dead: nothing in the app uses that class, and both copies put
   * `scrollbar-width`/`-ms-overflow-style` *inside* the `::-webkit-scrollbar` block,
   * where neither does anything. Left alone rather than trusted.)
   */
  sidebarWrapper: {
    backgroundColor: '#262527',
    overflowX: 'hidden',
    overflowY: 'auto',
    scrollbarWidth: 'none',
    msOverflowStyle: 'none',
    '&::-webkit-scrollbar': {
      display: 'none',
      width: 0,
      height: 0,
    },
    WebkitOverflowScrolling: 'touch',
    maxHeight: '100vh',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    padding: theme.spacing(2, 1),

    '& .active ': {
      background: '#007aff',
    },
  },
  sidebarWapperCollapsed: {
    padding: theme.spacing(4, 3),
  },
  listItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  linksWrapperCollapsed: {
    marginTop: theme.spacing(2),
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  linksWrapperExpended: {
    marginTop: theme.spacing(3.75),
  },
  linksWrapper: {
    flex: 1,
    minHeight: 0,
    alignItems: 'center',
    overflow: 'auto',
    display: 'flex',
    flexDirection: 'column',
    [tabletMediaQuery]: {
      paddingBottom: theme.spacing(10),
    },
  },
  sidebarFooter: {
    marginTop: 'auto',
    padding: '0 4px 8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    width: '100%',
    maxWidth: '100%',
    boxSizing: 'border-box',
    position: 'relative',
    zIndex: 2,
    [tabletMediaQuery]: {
      position: 'sticky',
      bottom: 0,
      marginTop: theme.spacing(1),
      paddingTop: theme.spacing(1.5),
      paddingBottom: `max(${theme.spacing(2)}px, env(safe-area-inset-bottom, 0px))`,
      backgroundColor: '#262527',
      boxShadow: '0 -6px 14px rgba(0, 0, 0, 0.35)',
      zIndex: 4,
    },
    '& .MuiButton-root': {
      width: 'fit-content',
      minWidth: 'unset',
      height: 'unset',
      padding: '12px',
    },
  },
  sidebarFooterExpanded: {
    justifyContent: 'flex-start',
  },
  /** Demo builds only: pin the footer so the tenant switcher stays reachable
   *  without scrolling past the full nav list. */
  sidebarFooterSticky: {
    position: 'sticky',
    bottom: 0,
    paddingTop: theme.spacing(1.5),
    paddingBottom: `max(${theme.spacing(1)}px, env(safe-area-inset-bottom, 0px))`,
    backgroundColor: '#262527',
    boxShadow: '0 -6px 14px rgba(0, 0, 0, 0.35)',
    zIndex: 4,
  },
  /** Keeps release + badge inside narrow / tablet sidebars (avoids iPad clip from overflow) */
  sidebarFooterRelease: {
    overflow: 'visible',
    flexDirection: 'column',
    gap: theme.spacing(1),
    '& .MuiBadge-root': {
      display: 'inline-flex',
      maxWidth: '100%',
      justifyContent: 'center',
    },
  },
  demoTenantSwitcher: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(0.75),
    width: '100%',
    padding: theme.spacing(0, 0.5),
    '& .MuiButton-root': {
      width: '100%',
      padding: '6px 8px',
      fontSize: 11,
      lineHeight: '14px',
      textTransform: 'none',
    },
  },
  /** Collapsed rail: shrink switcher to small square initial-buttons.
   *  Doubled class beats the later sidebarFooterCompressed button override. */
  demoTenantSwitcherCompact: {
    alignItems: 'center',
    padding: 0,
    '& .MuiButton-root.MuiButton-root': {
      width: 36,
      minWidth: 36,
      maxWidth: 36,
      height: 28,
      padding: '4px 0',
      fontSize: 10,
      fontWeight: 700,
      lineHeight: '12px',
      textTransform: 'none',
    },
  },
  linksListCompressed: {
    '&.MuiList-root': {
      listStyle: 'none',
      margin: 0,
      padding: 0,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      width: 'max-content',
    },
  },
  linksListExpended: {
    '&.MuiList-root': {
      listStyle: 'none',
      margin: 0,
      padding: 0,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'flex-start',
      width: '100%',
    },
  },
  linkListItemExpended: {
    '&.MuiListItem-root': {
      cursor: 'pointer',
      borderRadius: '10px',
      display: 'flex',
      alignItems: 'center',
      padding: 0,
    },
  },
  ml30: {
    marginLeft: '30px',
  },
  linkListItemCollapsed: {
    '&.MuiListItem-root': {
      cursor: 'pointer',
      borderRadius: '10px',
      justifyContent: 'center',
      display: 'flex',
      alignItems: 'center',
      padding: 0,
    },
  },
  listLinkCollapsed: {
    height: 44,
    width: 44,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    textDecoration: 'none',
    color: theme.palette.textOnColor,
    '& svg': {
      minHeight: 20,
      minWidth: 20,
      maxHeight: 20,
      maxWidth: 20,
      height: 20,
      width: 20,
    },
    '& img': {
      minHeight: 20,
      minWidth: 20,
      maxHeight: 20,
      maxWidth: 20,
      height: 20,
      width: 20,
    },
  },
  listLinkExpanded: {
    padding: theme.spacing(1.5),
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    flex: 1,
    color: theme.palette.textOnColor,
    '& svg': {
      minHeight: 20,
      minWidth: 20,
      maxHeight: 20,
      maxWidth: 20,
      height: 20,
      width: 20,
    },
    '& img': {
      minHeight: 20,
      minWidth: 20,
      maxHeight: 20,
      maxWidth: 20,
      height: 20,
      width: 20,
    },
  },
  linkText: {
    '&.MuiTypography-root': {
      fontSize: 14,
      fontWeight: 500,
      lineHeight: '20px',
      color: '#ffffff',
    },
  },

  toggleBtnMain: {
    marginTop: theme.spacing(2),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  signalLogoShortIconWrapper: {
    minHeight: 54,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  signalLogoWithTextIconWrapper: {
    display: 'flex',
    height: 24,
  },
  signalLogoWithTextIcon: {
    height: 24,
    maxHeight: 24,
    minHeight: 24,
  },
  /* Sized by bounds, not by a fixed width: the collapsed rail has to hold either a
     square glyph (Signal, 42×24) or a wordmark (Filter Go, 119×36, which has no icon
     form). 52 is the rail's full content width — 76 less its 8px side padding. */
  signalLogoShortIcon: {
    width: 'auto',
    height: 'auto',
    maxWidth: 52,
    maxHeight: 24,
  },
  tabsSidebar: {
    '&.MuiTabs-root': {
      marginTop: theme.spacing(3),
      minHeight: 20,
    },

    '& .MuiTabs-indicator': {
      display: 'none',
    },
  },
  tabStandAlone: {
    '&.MuiButtonBase-root ': {
      backgroundColor: '#45474b',
      color: '#ffffff',
      fontSize: 12,
      lineHeight: '16px',
      fontWeight: 400,
      overflow: 'hidden',
      padding: '7px 14px !important',
      width: '50%',
      textTransform: 'capitalize',
      '& span': {
        borderBottom: 'none !important',
      },
    },
    '&.MuiButtonBase-root': {
      minHeight: 32,
      fontSize: 12,
      fontWeight: 400,
      lineHeight: '18px',
    },
    '&.Mui-selected': {
      backgroundColor: '#ffffff',
      color: '#242628 !important',
    },
  },
  badge: {
    '& .MuiBadge-badge': {
      background: '#FF9332',
      borderRadius: '2px !important',
      padding: '4px',
      color: '#FFFFFF',
      fontSize: '10px',
      height: 'unset',
      transform: 'scale(1) translate(18%, -66%)',
      [theme.breakpoints.down(1024)]: {
        transform: 'scale(1) translate(0%, -55%)',
        right: 2,
        top: 2,
      },
      [theme.breakpoints.down(786)]: {
        transform: 'scale(1) translate(0%, -45%)',
        fontSize: '9px',
        padding: '2px 4px',
      },
    },
  },
  /** After `.badge` so these overrides win. Narrow rail ~76px. */
  sidebarFooterCompressed: {
    padding: '0 2px 10px',
    '& .MuiBadge-badge': {
      transform: 'scale(0.85) translate(0%, -35%) !important',
      padding: '2px 3px',
      fontSize: '10px',
    },
    '& .MuiButton-root': {
      padding: '8px',
    },
  },
}));
