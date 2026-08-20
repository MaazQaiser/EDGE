import { makeStyles } from '@mui/styles';

/* The rail's two widths and the header's height, taken from the app shell rather than
   re-chosen: `sideBar.js` pins the collapsed rail to 76 and the expanded one to 240,
   and `navBar.jsx` pins the header to 60. A replica that guesses these is a replica
   that reads as a different product at the first side-by-side. */
const RAIL_COLLAPSED = 76;
const RAIL_EXPANDED = 240;
const HEADER_HEIGHT = 60;

/* The rail's own charcoal, which is not a palette token in the real sidebar either. */
const RAIL_INK = '#262527';

/* One gutter for the header and the panel beneath it, so the breadcrumb and the tab
   strip start on the same x. The settings shell already insets its content by 32. */
const GUTTER = 32;

export const useStyles = makeStyles((theme) => ({
  /* `fixed`, not a page-flow container: `html` and `body` carry no background of their
     own here, so anything this page does not paint shows the browser's dark canvas
     through it. */
  shell: {
    position: 'fixed',
    inset: 0,
    display: 'flex',
    overflow: 'hidden',
    colorScheme: 'light',
    backgroundColor: theme.palette.surfaceWhite,
  },

  rail: {
    position: 'relative',
    flex: '0 0 auto',
    width: RAIL_COLLAPSED,
    transition: 'width 0.35s',
  },

  railExpanded: {
    width: RAIL_EXPANDED,
  },

  railBody: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    padding: theme.spacing(2, 1),
    backgroundColor: RAIL_INK,
    overflow: 'hidden',
  },

  logoBox: {
    minHeight: 54,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flex: '0 0 auto',
  },

  logoBoxExpanded: {
    justifyContent: 'flex-start',
    paddingLeft: theme.spacing(1.5),
  },

  /* Bounded rather than sized: the wordmark is the only mark Filter Go has — there is
     no monogram to fall back to in the 52px the collapsed rail leaves for it. */
  logo: {
    width: 'auto',
    height: 'auto',
    maxWidth: 52,
    maxHeight: 24,
  },

  logoExpanded: {
    height: 24,
    maxHeight: 24,
  },

  navList: {
    marginTop: theme.spacing(3),
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    overflowX: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    /* The rail is decorative on this page, so its scrollbar would be the only thing on
       screen advertising a region nobody is meant to work in. */
    scrollbarWidth: 'none',
    '&::-webkit-scrollbar': {
      display: 'none',
    },
  },

  navListCollapsed: {
    alignItems: 'center',
  },

  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    height: 44,
    borderRadius: 10,
    color: theme.palette.textOnColor,
    flex: '0 0 auto',
    '& svg': {
      width: 20,
      height: 20,
      minWidth: 20,
      minHeight: 20,
    },
  },

  navItemCollapsed: {
    width: 44,
    justifyContent: 'center',
  },

  navItemExpanded: {
    width: '100%',
    padding: theme.spacing(0, 1.5),
  },

  /* Brand, not the sidebar's literal `#007aff`. The real rail hardcodes Signal's blue
     for its active item, which on a green tenant is the one element on screen still
     speaking the other brand. */
  navItemActive: {
    backgroundColor: theme.palette.surfaceBrand,
  },

  navLabel: {
    '&.MuiTypography-root': {
      fontSize: 14,
      fontWeight: 500,
      lineHeight: '20px',
      color: theme.palette.textOnColor,
      whiteSpace: 'nowrap',
    },
  },

  railToggle: {
    position: 'absolute',
    top: '50%',
    left: '100%',
    transform: 'translate(-50%, -50%)',
    display: 'flex',
    border: 0,
    padding: 0,
    background: 'none',
    cursor: 'pointer',
    zIndex: 2,
  },

  railToggleFlipped: {
    transform: 'translate(-50%, -50%) rotate(180deg)',
  },

  main: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },

  /* The only horizontal rule the chrome draws. Everything below it belongs to the
     settings screen and brings its own. */
  header: {
    flex: '0 0 auto',
    height: HEADER_HEIGHT,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 20,
    padding: `0 ${GUTTER}px`,
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
  },

  crumb: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    minWidth: 0,
  },

  crumbIcon: {
    display: 'flex',
    width: 20,
    height: 20,
    color: theme.palette.textPlaceholder,
    '& svg': {
      fontSize: 20,
      fill: 'transparent',
    },
  },

  crumbText: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
      fontWeight: 600,
      whiteSpace: 'nowrap',
    },
  },

  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: 20,
    minWidth: 0,
  },

  /* The franchise picker, drawn rather than mounted: the real one fetches its list on
     mount and this page has no session to fetch it with. It is a control a planner
     reads, not one this screen is demonstrating, so it is deliberately inert. */
  franchise: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    maxWidth: 220,
    height: 36,
    padding: '0 12px',
    borderRadius: 8,
    border: `1px solid ${theme.palette.borderSubtle1}`,
  },

  franchiseText: {
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary1,
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
  },

  chevron: {
    flex: '0 0 auto',
    display: 'flex',
    color: theme.palette.textPlaceholder,
    '& svg': {
      width: 16,
      height: 16,
    },
  },

  bell: {
    display: 'flex',
    color: theme.palette.textSecondary1,
    '& svg': {
      width: 20,
      height: 20,
    },
  },

  account: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },

  avatar: {
    '&.MuiAvatar-root': {
      width: 32,
      height: 32,
      fontSize: 13,
      fontWeight: 600,
      backgroundColor: theme.palette.surfaceBrandSubtle,
      color: theme.palette.textBrand,
    },
  },

  accountName: {
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary1,
      whiteSpace: 'nowrap',
    },
  },

  accountRole: {
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary3,
      whiteSpace: 'nowrap',
    },
  },

  /* The settings shell asks for `100dvh` because in the app it is the whole scrollport
     under a sticky header. Here it sits inside one, so the height is handed back to
     this box and the page keeps a single scrollbar instead of two. */
  content: {
    flex: 1,
    minHeight: 0,
    display: 'flex',
    '& > *': {
      flex: 1,
      minWidth: 0,
      height: '100%',
    },
  },
}));
