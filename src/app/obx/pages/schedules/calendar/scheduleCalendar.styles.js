import { makeStyles } from '@mui/styles';

/* The toolbar's *filter chips* — the unrouted-demand count and the visits quick
   filter. Shape shared so the two cannot drift apart; only the palette differs,
   because that is the one thing they should not share.

   Actions are not chips and must not borrow this: `Select visits`, `Cancel` and
   `Harmonize` are page CTAs and use the design system's own button at its own
   size, as the sites module does. */
const TOOLBAR_PILL = {
  minWidth: 'auto',
  height: '28px',
  padding: '0 12px',
  borderRadius: '60px',
  fontSize: '12px',
  fontWeight: 500,
  lineHeight: '18px',
  textTransform: 'none',
  whiteSpace: 'nowrap',
  '& .MuiButton-startIcon': {
    marginLeft: 0,
    marginRight: '6px',
    '& svg': {
      width: '16px',
      height: '16px',
    },
  },
};

export const useStyles = makeStyles((theme) => ({
  scheduleCalendar: {
    padding: '0 32px 0',
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    minHeight: 0,
    overflow: 'hidden',
    position: 'relative',
    [theme.breakpoints.down('lg')]: {
      padding: '0 24px 0',
    },
  },

  scheduleCalendarTabsRow: {
    minHeight: '48px',
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    gap: '16px',
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
  },

  scheduleCalendarTabs: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    flex: '0 0 auto',
    gap: '24px',
  },

  scheduleCalendarTab: {
    '&.MuiButton-root': {
      padding: '0 4px',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      flex: '0 0 auto',
      height: '100%',
      minHeight: '48px',
      margin: 0,
      border: 0,
      borderBottom: '2px solid transparent',
      marginBottom: '-1px',
      borderRadius: 0,
      background: 'transparent',
      boxShadow: 'none',
      cursor: 'pointer',
      userSelect: 'none',
      color: theme.palette.textSecondary1,
      fontSize: '12px',
      fontWeight: 400,
      lineHeight: '18px',
      fontFamily: 'inherit',
      textAlign: 'left',
      textTransform: 'none',
      whiteSpace: 'nowrap',
      '&:hover': {
        background: 'transparent',
        color: theme.palette.textPrimary,
      },
      '&:focus': {
        outline: 'none',
      },
    },
  },

  scheduleCalendarTabActive: {
    '&.MuiButton-root': {
      color: theme.palette.textBrand,
      borderBottomColor: theme.palette.borderBrand,
      fontWeight: 500,
      '&:hover': {
        color: theme.palette.textBrand,
        background: 'transparent',
      },
    },
  },

  scheduleCalendarHeaderRight: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: '12px',
    marginLeft: 'auto',
    flexShrink: 0,
  },
  scheduleCalendarHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '24px',
  },

  scheduleCalendarHeaderLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },

  scheduleCalendarHeaderFilters: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    minWidth: 0,
    flexWrap: 'wrap',
  },

  scheduleCalendarFilterDropdown: {
    '&.MuiBox-root': {
      height: '28px',
      minWidth: 'auto',
      border: 'none !important',
      boxShadow: 'none !important',
      borderRadius: 0,
      background: 'transparent',
    },
    '& > .MuiBox-root': {
      height: '28px',
      alignItems: 'center',
      padding: '0 !important',
      columnGap: '4px',
    },
    '& > .MuiBox-root > .MuiBox-root:last-child': {
      width: '16px',
      height: '16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      lineHeight: 0,
      flexShrink: 0,
      transformOrigin: 'center center',
    },
    '& .MuiTypography-root': {
      fontSize: '12px',
      fontWeight: 400,
      lineHeight: '18px',
      color: `${theme.palette.textPrimary} !important`,
      textTransform: 'none !important',
    },
    '& svg': {
      width: '16px',
      height: '16px',
      display: 'block',
    },
    '& svg path': {
      stroke: `${theme.palette.textSecondary1} !important`,
    },
  },

  scheduleCalendarFilterSearchDivider: {
    width: '100%',
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
  },

  scheduleCalendarAlert: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '6px 12px',
    borderRadius: '8px',
    border: `1px solid ${theme.palette.borderAlert}`,
    background: theme.palette.surfaceAlertSubtle,
    '&.MuiTypography-root': {
      color: theme.palette.textAlert,
    },
    '& .MuiSvgIcon-root': {
      width: '18px',
      height: '18px',
    },
  },

  scheduleCalendarFull: {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    flex: 1,
    minHeight: 0,
    marginTop: 0,
  },

  scheduleCreateButton: {
    '&.MuiButtonBase-root': {
      minWidth: 'auto',
      height: '32px',
      padding: '0 10px',
      borderRadius: '8px',
      color: theme.palette.textBrand,
      fontSize: '12px',
      fontWeight: 600,
      lineHeight: '18px',
      textTransform: 'none',
      '&:hover': {
        background: theme.palette.surfaceBrand,
        color: theme.palette.textOnColor,
        boxShadow: 'none',
      },
      '&:hover svg path': {
        stroke: `${theme.palette.textOnColor} !important`,
      },
      '& .MuiButton-startIcon': {
        marginLeft: 0,
        marginRight: '6px',
        '& svg': {
          width: '10px',
          height: '10px',
        },
      },
      '& .MuiButton-endIcon': {
        marginLeft: '4px',
        marginRight: 0,
        '& svg': {
          width: '18px',
          height: '18px',
        },
      },
    },
  },

  /* Unrouted demand. This one is *meant* to be alert-coloured — it counts work
     nobody is coming for. */
  scheduleAssignmentActionButton: {
    '&.MuiButtonBase-root': {
      ...TOOLBAR_PILL,
      background: theme.palette.surfaceAlertSubtle,
      borderColor: theme.palette.surfaceAlertSubtle,
      color: theme.palette.textAlert,
      '&:hover': {
        background: theme.palette.surfaceAlertSubtle,
        borderColor: theme.palette.surfaceAlertSubtle,
      },
    },
  },

  /* The quick filter shared the class above, which meant two things went wrong at
     once. It was painted in the alert palette — a neutral "show me fewer rows"
     control dressed as a warning, sitting next to a real one and indistinguishable
     from it. And because that class pins `background` and `color` at
     `&.MuiButtonBase-root`, it beat the `primary`/`secondaryGrey` variant the
     button switches on when active: pressing it changed `aria-pressed` and nothing
     else, so the control looked inert whether the filter was on or off. Its own
     class now, with a pressed state that is visible. */
  /* GEOMETRY ONLY — deliberately no palette. The quick filter has a real pressed
     state, and the theme's own `primary` / `secondaryGrey` variants are what draw
     it: filled-brand when the filter is on, white-bordered when it is off.

     It never worked before because this button borrowed the unrouted-demand pill's
     class, and that class pins `background` and `color`, so the variant swap was
     invisible — pressing it changed `aria-pressed` and nothing a user could see.
     Declaring a palette here at all is what caused that, and every attempt to
     out-specify the variant from makeStyles lost: a doubled selector at four
     classes, an `sx` at the call site, and finally two `!important` classes that
     only fought each other. So the layering is now the plain one — the theme owns
     colour, this class owns shape. Do not put colours back in here. */
  scheduleQuickFilterButton: {
    '&.MuiButtonBase-root': TOOLBAR_PILL,
  },

  scheduleAssignmentActionSkeleton: {
    '&.MuiSkeleton-root': {
      width: '172px',
      height: '28px',
      borderRadius: '60px !important',
      transformOrigin: 'none',
      transform: 'none',
    },
  },

  forecastingButton: {
    '&.MuiButton-root': {
      width: '110px',
      maxWidth: '110px',
      height: '32px',
      borderRadius: '8px',
      fontSize: '12px',
      boxShadow: 'none',
      border: 'none',
      textTransform: 'none',
      color: theme.palette.textSecondary1,
      whiteSpace: 'nowrap',
      '&:hover': {
        boxShadow: 'none',
        border: 'none',
        backgroundColor: '#146dff0a',
      },
      '& .MuiButton-startIcon': {
        marginRight: '8px',
        '& .MuiSvgIcon-root': {
          fontSize: '18px',
        },
      },
    },
  },

  scheduleCalendarAlertSkeleton: {
    '&.MuiSkeleton-root': {
      width: '230px',
      height: '26px',
      borderRadius: '20px !important',
      transformOrigin: 'none',
      transform: 'none',
    },
  },

  /* ---------- selection mode ----------
     Painted from data attributes stamped at mount, because FullCalendar caches
     event content and will not re-render it for a prop change. Global so the
     rules reach the event harness FullCalendar owns.

     The state lives on the harness; the *drawing* has to happen on the card. The
     harness is the full 142x80 grid slot and the card sits 8px inside it, so the
     previous rules — a checkbox at `top: 5px, left: 4px` of the harness and an
     `outline` on the harness — put the tick 4px above and left of the card, close
     enough to the row divider to read as belonging to the row above, and ringed
     8px of empty margin instead of the card. The companion rule meant to make room
     for the tick (`& > * { padding-left: 20px }`) targeted FullCalendar's own inner
     wrapper, which resets its padding, so it never applied and the tick had nothing
     to sit in. Both now hang off `[data-visit-card]`. */
  '@global': {
    '[data-selectable="true"][data-selecting="true"]': {
      cursor: 'pointer',
      '& [data-visit-card]': {
        position: 'relative',
        /* 8px gutter + 14px control + 8px breathing room. The card's own 8px left
           padding is inside this, so content clears the tick without touching it. */
        paddingLeft: '30px !important',
      },
      '& [data-visit-card]::before': {
        content: '""',
        position: 'absolute',
        top: 7,
        left: 8,
        width: 14,
        height: 14,
        boxSizing: 'border-box',
        borderRadius: 3,
        border: `1.5px solid ${theme.palette.borderSubtle2}`,
        background: theme.palette.surfaceWhite,
        zIndex: 5,
      },
    },
    /* Not selectable, and it has to look it. Harmonize moves work, so a completed
       or cancelled visit is not a candidate — without this it looked identical to
       a pickable card and simply ignored the click. Recessive rather than hidden:
       the visit is still part of the week being planned around, and clicking it
       still opens its drawer. */
    '[data-selecting="true"][data-selectable="false"] [data-visit-card]': {
      opacity: 0.45,
      filter: 'grayscale(35%)',
    },

    '[data-selectable="true"][data-selecting="true"][data-selected="true"]': {
      '& [data-visit-card]': {
        outline: `2px solid ${theme.palette.surfaceBrand}`,
        outlineOffset: 1,
      },
      '& [data-visit-card]::before': {
        background: theme.palette.surfaceBrand,
        borderColor: theme.palette.surfaceBrand,
      },
      '& [data-visit-card]::after': {
        content: '""',
        position: 'absolute',
        top: 10.5,
        left: 11,
        width: 7,
        height: 3.5,
        borderLeft: `2px solid ${theme.palette.surfaceWhite}`,
        borderBottom: `2px solid ${theme.palette.surfaceWhite}`,
        transform: 'rotate(-45deg)',
        zIndex: 6,
      },
    },

    /* ---------- month grid: today ----------
       The month view had no today marker at all. `calendar.styles.js` carries a
       `.fc-dayGridMonth-view .fc-day-today` block that paints the date in a 38px
       brand circle, and none of it applies: this is FullCalendar v7, whose class
       names are hashed per build (`fc-classic-wsy`…), so every v6 selector in that
       block is dead — including a `background` whose value is the string
       "backgroundColor: 'rgba(...)' !important", which was never valid CSS in any
       version. Attributes are the only stable hooks, and they are what the
       harmonize rules below already use. `role="gridcell"` scopes this to the month
       grid; the week view's date nodes are lane headers, not cells. */
    '[role="gridcell"][data-date][aria-current="date"]': {
      background: theme.palette.surfaceBrandSubtle,
      boxShadow: `inset 0 2px 0 ${theme.palette.surfaceBrand}`,
    },

    /* Harmonize preview. The drawer proposes; the calendar shows it happening
       before anything is written. Visits changing day fade where they sit, the
       ones that spilled grey out, and the destination columns are tinted — so
       Apply confirms a picture the planner has already been watching. */
    '[data-visit-id][data-harmonizing="leaving"]': {
      opacity: 0.4,
      outline: `1.5px dashed ${theme.palette.surfaceBrand}`,
      outlineOffset: -1,
      borderRadius: 4,
      transition: 'opacity 180ms ease',
    },
    '[data-visit-id][data-harmonizing="spilling"]': {
      opacity: 0.32,
      filter: 'grayscale(1)',
      transition: 'opacity 180ms ease',
    },
    '[data-date][data-harmonize-target="landing"]': {
      background: `${theme.palette.surfaceBrandSubtle} !important`,
      boxShadow: `inset 0 2px 0 ${theme.palette.surfaceBrand}`,
    },
    '[data-date][data-harmonize-target="overflow"]': {
      background: `${theme.palette.surfaceGreySubtle} !important`,
    },
  },
}));
