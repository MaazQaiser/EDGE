import fcClass from '@fullcalendar/react/protected-styles';
import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  calendarHeaderToolbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
    gap: '12px',
  },
  calendarHeaderToolbarWithFilters: {
    minHeight: '64px',
    marginBottom: 0,
    padding: '8px 0 12px',
    flexWrap: 'wrap',
  },
  calendarHeaderToolbarFilters: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    minWidth: 0,
    flex: 1,
  },
  warnWrapper: {
    background: '#FEF0C7',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    borderRadius: '4px',
    padding: '2px 4px',
    width: 'fit-content',
  },
  calendarHeaderToolbarLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    border: `1px solid ${theme.palette.borderSubtle1}`,
    borderRadius: '8px',
    height: '32px',
    background: theme.palette.surfaceWhite,
  },

  calendarHeaderToolbarLeftText: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
      minWidth: '132px',
      textAlign: 'center',
      whiteSpace: 'nowrap',
    },
  },

  calendarHeaderToolbarLeftAction: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',

    '&.MuiButtonBase-root': {
      width: '24px',
      height: '24px',
      minWidth: '24px',
      padding: '0',
      borderRadius: '4px',
    },
    '& svg': {
      width: '8px',
      height: '14px',
    },
  },

  calendarHeaderToolbarToday: {
    '&.MuiButtonBase-root': {
      height: '24px',
      minWidth: 'auto',
      padding: '0 10px',
      marginRight: '4px',
      borderRadius: '4px',
      borderLeft: `1px solid ${theme.palette.borderSubtle1}`,
      borderTopLeftRadius: 0,
      borderBottomLeftRadius: 0,
      fontSize: '12px',
      fontWeight: 500,
      lineHeight: '16px',
      whiteSpace: 'nowrap',
    },
    '&.Mui-disabled': {
      opacity: 0.45,
    },
  },

  calendarHeaderToolbarRight: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: '8px',
    flexWrap: 'wrap',
  },
  loaderBox: {
    '&.MuiSkeleton-root': {
      height: '26px',
      transformOrigin: 0,
      transform: 'none',
      borderRadius: '60px ',
      width: '124px',
    },
  },
  resourceLabelText: {
    '&.MuiTypography-root, &': {
      color: theme.palette.textPrimary,
      fontSize: '14px',
      fontWeight: 500,
      lineHeight: '20px',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      minWidth: 0,
      maxWidth: '100%',
      width: '100%',
      marginBottom: '2px',
      textTransform: 'capitalize',
    },
  },
  resourceLabelContent: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: '4px',
    minHeight: '56px',
    // Match v6 datagrid cushion padding (classic theme no longer provides it).
    padding: '8px',
    width: '100%',
    minWidth: 0,
    maxWidth: '100%',
    overflow: 'hidden',
    // content-box so minHeight is content area (v6 cushion behavior), not padding-box.
    boxSizing: 'content-box',
  },
  // Default resource cell (runsheet / location titles) — keep label inside resized column width.
  resourceAreaLabel: {
    overflow: 'hidden !important',
    minWidth: 0,
    '& > *': {
      overflow: 'hidden',
      maxWidth: '100%',
      width: '100%',
      minWidth: 0,
      boxSizing: 'border-box',
    },
  },
  officerResourceLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    width: '100%',
    height: '100%',
    minHeight: '56px',
    minWidth: 0,
    maxWidth: '100%',
    overflow: 'hidden',
    padding: '8px',
    boxSizing: 'content-box',
  },
  officerResourceAvatar: {
    width: '34px',
    height: '34px',
    flexShrink: 0,
    borderRadius: '50%',
    overflow: 'hidden',
    border: `1px solid ${theme.palette.borderSubtle1}`,
  },
  officerResourceText: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: '2px',
    minWidth: 0,
    flex: 1,
    overflow: 'hidden',
  },
  // Applied to the Officer resource cell (FC7 div gridcell — no datagrid frames).
  officerResourceAreaLabel: {
    display: 'flex !important',
    alignItems: 'center',
    '& > *': {
      display: 'flex',
      alignItems: 'center',
      width: '100%',
      minWidth: 0,
      boxSizing: 'border-box',
    },
  },
  /* --- visits view: the pinned unassigned-demand band ------------------- */
  unassignedVisitsLabel: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'center',
    gap: '2px',
    minHeight: '56px',
    padding: '8px',
    width: '100%',
    minWidth: 0,
    boxSizing: 'border-box',
  },
  unassignedVisitsTitleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    minWidth: 0,
    maxWidth: '100%',
    '& svg': {
      width: '18px',
      height: '18px',
      flexShrink: 0,
    },
  },
  unassignedVisitsTitle: {
    '&.MuiTypography-root': {
      color: theme.palette.textError || '#B42318',
      fontSize: '14px',
      fontWeight: 600,
      lineHeight: '20px',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
  },
  unassignedVisitsSubtitle: {
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary1,
      fontSize: '12px',
      lineHeight: '16px',
    },
  },
  visitSiteName: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
      fontSize: '12px',
      fontWeight: 600,
      lineHeight: '16px',
      // The card is only as wide as one day column, so this is the line that
      // gives way — the time above it must always stay readable.
      minWidth: 0,
      flex: '1 1 auto',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
  },
  /* Time is the one thing a visit card can never usefully truncate. */
  visitTime: {
    '&.MuiTypography-root': {
      whiteSpace: 'nowrap',
      flex: '0 0 auto',
    },
  },
  /* The card's third line: which route is coming for this visit. Quieter than the
     site name above it, and it ellipsizes — unlike the state label it replaced,
     which wrapped, because a truncated *state* reads as a different state whereas
     a truncated route name is still recognisably that route, and the full name is
     one hover (or one click into the drawer) away. */
  visitRouteName: {
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary1,
      fontSize: '11px',
      fontWeight: 500,
      lineHeight: '16px',
      minWidth: 0,
      flex: '1 1 auto',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
  },
  /* Same line, when nothing is coming. Doubled so it beats `visitRouteName`'s
     colour at equal specificity whichever order JSS emits them in. */
  visitUnassignedText: {
    '&&.MuiTypography-root': {
      color: theme.palette.textError || '#B42318',
      fontSize: '11px',
      fontWeight: 600,
      lineHeight: '16px',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
  },

  /* ------------------------------------------------------------------ *
   * Visit states — see helper/visitState.js for the encoding.
   *
   *   border style  dashed = not on a route · solid = routed
   *   colour        red needs attention · amber blocked · blue live ·
   *                 green done · grey void
   *
   * Every state also carries an icon and a text label on the card, so none
   * of this is load-bearing on its own. Read in greyscale it still works.
   * ------------------------------------------------------------------ */

  /* NOTE ON PROPERTY ORDER. `borderColor` must come *before* `borderLeftColor`.
     Declaring the `borderLeft` shorthand and then `borderColor` silently resets
     the left edge to the all-sides colour — which is how the "solid blue" live
     accent ended up rendering as pale blue. Longhand, ordered, no shorthand. */

  /* The baseline: routed, not started. Deliberately the plainest card on the
     grid — its runsheet name already says everything, and a neutral card is what
     lets the seven states that need attention actually read as exceptions.

     "Plainest" is not "absent", and it was reading as absent: a white fill on a
     white lane left the card with nothing but a left tick, while the same card on
     the runsheet schedule sits on `surfaceGreySubtle`. The baseline visit now
     takes that same grey, so a routed visit is recognisably the same object on
     both surfaces. The accent stays slate rather than the runsheet card's brand
     colour — brand is green on Filter Go and blue on Signal, which are exactly
     the completed and in-progress accents, so borrowing it here would collide
     with two states (§D9). */
  visitStateScheduled: {
    background: `${theme.palette.surfaceGreySubtle} !important`,
    borderLeftWidth: '3px !important',
    borderLeftStyle: 'solid !important',
    borderLeftColor: '#98A2B3 !important',
  },

  /* Unassigned visits read as demand, not as a booked job.
     The width is explicit: `borderStyle` alone leaves it on the initial `medium`,
     which is the browser's value to pick, not ours. */
  visitStateUnassigned: {
    background: '#FEF3F2 !important',
    borderColor: `${theme.palette.textError || '#B42318'} !important`,
    borderWidth: '1px !important',
    borderStyle: 'dashed !important',
  },

  /* Blocked is dashed like unassigned — it is not on a route either — but amber,
     because the fix is different: give it a tour, then it can be routed. */
  visitStateBlocked: {
    background: '#FFFAEB !important',
    borderColor: '#DC6803 !important',
    borderWidth: '1px !important',
    borderStyle: 'dashed !important',
  },

  /* A live route: solid, blue, with a heavier left edge so an in-flight lane is
     scannable down a column without reading a single word. */
  visitStateInProgress: {
    background: '#EFF8FF !important',
    borderColor: '#B2DDFF !important',
    borderLeftWidth: '4px !important',
    borderLeftStyle: 'solid !important',
    borderLeftColor: '#1570EF !important',
  },

  /* Inserted mid-route: same blue family (it *is* on a live route) but the left
     edge is broken, because the driver did not leave with this stop. */
  visitStateInserted: {
    background: '#EFF8FF !important',
    borderColor: '#B2DDFF !important',
    borderLeftWidth: '4px !important',
    borderLeftStyle: 'dashed !important',
    borderLeftColor: '#1570EF !important',
  },

  /* Done is deliberately the quietest state on the grid. It needs no action, so
     it should not compete with the states that do. */
  visitStateCompleted: {
    background: '#F6FEF9 !important',
    borderColor: '#ABEFC6 !important',
    borderLeftWidth: '3px !important',
    borderLeftStyle: 'solid !important',
    borderLeftColor: '#12B76A !important',
    '& .MuiTypography-root': {
      color: `${theme.palette.textSecondary1} !important`,
    },
  },

  /* Missed is the loudest, and solid rather than dashed: the visit *was* planned
     and did not happen. It is also the only state that stays actionable after
     its date, so it has to survive a scan of a past week. */
  visitStateMissed: {
    background: '#FEF3F2 !important',
    borderColor: '#FDA29B !important',
    borderLeftWidth: '4px !important',
    borderLeftStyle: 'solid !important',
    borderLeftColor: '#B42318 !important',
  },

  /* Void, not absent — a cancelled visit stays on the grid so the gap in a site's
     service history is visible, but nothing about it invites action. */
  visitStateCancelled: {
    background:
      'repeating-linear-gradient(135deg, #ffffff 0px, #ffffff 16px, #f6f7f9 16px, #f6f7f9 32px) !important',
    borderColor: '#D0D5DD !important',
    borderLeftWidth: '4px !important',
    borderLeftStyle: 'solid !important',
    borderLeftColor: `${theme.palette.textPlaceholder} !important`,
    '& .MuiTypography-root': {
      textDecoration: 'line-through',
      color: `${theme.palette.textSecondary3} !important`,
    },
  },

  /* The state's name, in the state's colour. Present on every card.

     This line wraps rather than ellipsizing. A card is one day column wide, and
     a truncated state reads as a different state — "Needs a…" and "Added mid-…"
     tell you nothing. Height is cheaper than ambiguity here, and this is the last
     line of the card so growing it costs nothing above. */
  visitStateLabel: {
    '&.MuiTypography-root': {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '4px',
      fontSize: '11px',
      fontWeight: 500,
      lineHeight: '14px',
      // Wrap between words, and only split a word when it genuinely cannot fit.
      // `anywhere` broke "Runsheet" into "Runsh / eet" at narrow column widths.
      overflowWrap: 'break-word',
      wordBreak: 'normal',
    },
    '& svg': {
      flex: '0 0 auto',
      width: '12px',
      height: '12px',
      marginTop: '1px',
    },
  },
  visitStateLabelAttention: {
    '&.MuiTypography-root': { color: theme.palette.textError || '#B42318' },
  },
  visitStateLabelBlocked: {
    '&.MuiTypography-root': { color: '#B54708' },
  },
  visitStateLabelLive: {
    '&.MuiTypography-root': { color: '#175CD3' },
  },
  visitStateLabelDone: {
    '&.MuiTypography-root': { color: theme.palette.textSecondary1 },
  },
  visitStateLabelVoid: {
    '&.MuiTypography-root': { color: theme.palette.textSecondary3 },
  },

  /* A quiet site — nothing due in the visible week. It stays legible, because a
     planner scans this column for a site they expect to see, but it recedes so
     the handful of rows with actual work dominate the page. */
  visitsQuietRowLabel: {
    /* A quiet row holds two short lines and no cards, so it is given back the
       padding a card-bearing row needs. 40px would clip the second line — the
       saving comes from the cushion, not from squeezing the text. Across dozens
       of sites this is most of the scroll distance on the screen. */
    '&.MuiBox-root': {
      minHeight: '30px',
      padding: '5px 8px',
      gap: '1px',
    },
    '& .MuiTypography-root': {
      color: theme.palette.textSecondary1,
      lineHeight: '15px',
    },
  },
  /* Supporting detail on a quiet row, so the site names scan first down the
     column. Doubled for the same reason as `visitsRowNotScheduled`. */
  visitsQuietRowNextDue: {
    '&&.MuiTypography-root': {
      color: '#8A8A90',
    },
  },
  /* Month rows sized to their contents rather than to the viewport.
     FullCalendar v7 lays the month out in JavaScript: it divides the scrollport by
     the number of week rows and writes an inline `flex-basis` on each row, so five
     rows in a 751px port become 150px each whatever is in them — and a visits month
     cell holds one line ("2 Visits"), so 120px of every cell was white. CSS on the
     cell cannot beat an inline style on the row, so the row is what gets overridden.

     Note this cannot be done with the `.fc-dayGridMonth-view` selectors already in
     this file: v7 hashes its class names per build, so that whole block is dead.
     Attributes are the stable hooks. */
  monthGridCompact: {
    /* Rows no longer stretch, so the scrollport keeps its full height with a much
       shorter table in it. Without this the space below the last week fell through
       to the page backdrop and read as a hole punched in the calendar. Scoped to
       the grid itself — on the wrapper it also repainted the filter toolbar, which
       sits on the page surface in every other view. */
    '& .fc': {
      background: theme.palette.surfaceWhite,
    },

    '& [role="row"]': {
      flexBasis: 'auto !important',
      flexGrow: '0 !important',
    },
    '& [role="gridcell"][data-date]': {
      minHeight: '78px',
    },
  },

  /* ------------------------------------------------------------------ *
   * Visits month cell — count first, service name dropped.
   * ------------------------------------------------------------------ */
  visitsMonthCell: {
    display: 'flex',
    alignItems: 'center',
    // Left-grouped, not space-between: the unassigned badge qualifies the count
    // next to it. Pushed to the far edge of the cell it read as a separate fact.
    justifyContent: 'flex-start',
    gap: '8px',
    width: '100%',
    minWidth: 0,
    padding: '2px 6px',
    cursor: 'pointer',
  },
  visitsMonthTotal: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '4px',
    minWidth: 0,
  },
  visitsMonthCount: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
      fontSize: '15px',
      fontWeight: 700,
      lineHeight: '18px',
      flex: '0 0 auto',
      fontVariantNumeric: 'tabular-nums',
    },
  },
  visitsMonthTerm: {
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary1,
      fontSize: '11px',
      fontWeight: 500,
      lineHeight: '16px',
      minWidth: 0,
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
  },
  /* The count of what needs a route, not a bare "!". Same red as the unassigned
     band and the unrouted card, so the three read as one thing. */
  visitsMonthUnassigned: {
    display: 'flex',
    alignItems: 'center',
    gap: '3px',
    flex: '0 0 auto',
    padding: '1px 5px 1px 4px',
    borderRadius: '10px',
    background: '#FEF3F2',
    border: '1px solid #FDA29B',
    '& svg': { width: '11px', height: '11px' },
  },
  visitsMonthUnassignedCount: {
    '&.MuiTypography-root': {
      color: '#B42318',
      fontSize: '11px',
      fontWeight: 600,
      lineHeight: '14px',
      fontVariantNumeric: 'tabular-nums',
    },
  },

  /* Where this week's work stops and the rest of the book begins. */
  visitsQuietGroupStart: {
    '&.MuiBox-root': {
      borderTop: `2px solid ${theme.palette.borderSubtle1 || '#EAECF0'}`,
    },
  },
  /* No future visit at all. Different in kind from "quiet": the site has dropped
     off the schedule, and nothing else on this screen would tell you.

     Doubled selector on purpose — the quiet-row rule above colours every
     descendant, and at equal specificity it would swallow this one. */
  visitsRowNotScheduled: {
    '&&.MuiTypography-root': {
      color: '#B54708',
      fontWeight: 500,
    },
  },

  unassignedLocationLabel: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'center',
    gap: '2px',
    minHeight: '56px',
    padding: '8px',
    minWidth: 0,
    maxWidth: '100%',
    width: '100%',
    boxSizing: 'content-box',
  },
  unassignedLocationTitleRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: '8px',
    minWidth: 0,
    maxWidth: '100%',
  },
  unassignedLocationTitle: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
      fontSize: '14px',
      fontWeight: 500,
      lineHeight: '20px',
      minWidth: 0,
      flex: '1 1 auto',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
  },
  unassignedLocationIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    width: '18px',
    height: '18px',
    '& svg': {
      width: '18px',
      height: '18px',
      display: 'block',
    },
  },

  resourceLabelSubtitle: {
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary1,
      fontSize: '12px',
      fontWeight: 500,
      lineHeight: '16px',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      minWidth: 0,
      paddingBottom: '2px',
      // Avoid marginBottom — FC7 cells use overflow:hidden and clip trailing margins.
      maxWidth: 'fit-content',
      borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
    },
  },
  resourceLabelSubtitleDedicated: {
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary1,
      fontSize: '12px',
      fontWeight: 500,
      lineHeight: '16px',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      minWidth: 0,
      maxWidth: '100%',
      paddingBottom: '2px',
    },
  },
  resourceLabelSubtitleCount: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
      fontSize: '12px',
      fontWeight: 500,
      lineHeight: '16px',
    },
  },
  resourceLabelSubtitleMuted: {
    color: theme.palette.textPlaceholder,
    fontSize: '12px',
    fontWeight: 400,
    lineHeight: '16px',
  },
  resourceLabelSubtitleWrite: {
    color: '#6A6A70',
    fontFamily: 'Inter',
    fontSize: '12px',
    fontStyle: 'normal',
    fontWeight: 400,
    lineHeight: 'normal',
    letterSpacing: '0.064px',
    marginLeft: '2px',
  },
  officerOvertimeRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    minWidth: 0,
    maxWidth: '100%',
  },
  officerOvertimeIcon: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    width: '14px',
    height: '14px',
    borderRadius: '50%',
    background: '#FEF0C7',
    color: '#F79009',
    '& svg': {
      width: '10px',
      height: '10px',
    },
  },
  officerOvertimeText: {
    '&.MuiTypography-root': {
      color: '#FE7711',
      fontSize: '10px',
      fontWeight: 500,
      lineHeight: '16px',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      minWidth: 0,
    },
  },
  dedicatedSiteBandResourceLabel: {
    background: '#E6F6FD !important',
    borderBottom: `1px solid ${theme.palette.borderSubtle1} !important`,
    borderTop: `1px solid ${theme.palette.borderSubtle1} !important`,
    borderRight: 'none !important',
    position: 'relative',
    overflow: 'hidden !important',
    minHeight: '36px !important',
    maxHeight: '240px',
    height: 'auto !important',
    display: 'flex !important',
    alignItems: 'center',
    padding: '0 !important',
    boxSizing: 'border-box',
    '& > *': {
      overflow: 'hidden',
      maxWidth: '100%',
      width: '100%',
      minWidth: 0,
    },
  },
  dedicatedSiteBandResourceLane: {
    background: '#E6F6FD !important',
    borderBottom: `1px solid ${theme.palette.borderSubtle1} !important`,
    borderTop: `1px solid ${theme.palette.borderSubtle1} !important`,
    borderLeft: 'none !important',
    // Clip the lane cover — with virtualization off, a mis-measured band height used to
    // let this absolute fill paint over neighboring shift rows (z-index escaped the lane).
    overflow: 'hidden !important',
    position: 'relative',
    // Contain cover z-index so it cannot stack above sibling resource lanes.
    zIndex: 0,
    minHeight: '36px !important',
    maxHeight: '240px',
    boxSizing: 'border-box',
  },
  dedicatedSiteBandLaneCover: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '-2px',
    right: 0,
    background: '#E6F6FD',
    zIndex: 0,
    pointerEvents: 'none',
  },
  dedicatedSiteBandDividerCover: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: '-2px',
    width: '3px',
    background: '#E6F6FD',
    zIndex: 3,
    pointerEvents: 'none',
  },
  dedicatedSiteBandLabel: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: '2px',
    width: '100%',
    minWidth: 0,
    maxWidth: '100%',
    minHeight: '36px',
    padding: '6px 12px',
    boxSizing: 'border-box',
    overflow: 'hidden',
    background: '#E6F6FD',
  },
  dedicatedSiteBandTitle: {
    '&.MuiTypography-root, &': {
      margin: 0,
      color: theme.palette.textPrimary,
      fontSize: '14px',
      fontWeight: 700,
      lineHeight: '18px',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      minWidth: 0,
      maxWidth: '100%',
    },
  },
  dedicatedSiteBandSubtitle: {
    '&.MuiTypography-root, &': {
      margin: 0,
      color: theme.palette.textPlaceholder,
      fontSize: '11px',
      fontWeight: 400,
      lineHeight: '14px',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      minWidth: 0,
      maxWidth: '100%',
    },
  },
  overviewAccordionResourceLabel: {
    background: `${theme.palette.surfaceGreySubtle} !important`,
    borderBottom: `1px solid ${theme.palette.borderSubtle1} !important`,
    borderTop: `1px solid ${theme.palette.borderSubtle1} !important`,
    borderRight: 'none !important',
    position: 'relative',
    overflow: 'visible !important',
    minHeight: '36px !important',
    height: '36px !important',
    maxHeight: '36px !important',
    display: 'flex !important',
    alignItems: 'center',
    padding: '0 !important',
    '& > *': {
      width: '100%',
    },
  },
  overviewAccordionResourceLane: {
    background: `${theme.palette.surfaceGreySubtle} !important`,
    borderBottom: `1px solid ${theme.palette.borderSubtle1} !important`,
    borderTop: `1px solid ${theme.palette.borderSubtle1} !important`,
    borderLeft: 'none !important',
    overflow: 'visible !important',
    position: 'relative',
    minHeight: '36px !important',
    height: '36px !important',
    maxHeight: '36px !important',
  },
  overviewAccordionLaneCover: {
    position: 'absolute',
    inset: 0,
    background: theme.palette.surfaceGreySubtle,
    zIndex: 1,
    pointerEvents: 'none',
  },
  overviewSectionEmptyResourceLabel: {
    background: `${theme.palette.surfaceWhite} !important`,
    borderBottom: `1px solid ${theme.palette.borderSubtle1} !important`,
    borderRight: 'none !important',
    position: 'relative',
    overflow: 'hidden !important',
    minHeight: `${280}px !important`,
    height: `${280}px !important`,
    maxHeight: `${280}px !important`,
    display: 'flex !important',
    alignItems: 'stretch',
    padding: '0 !important',
    zIndex: 2,
    '& > *': {
      width: '100%',
    },
  },
  overviewSectionEmptyLabelSpacer: {
    width: '100%',
    height: '280px',
    minHeight: '280px',
  },
  overviewSectionEmptyResourceLane: {
    background: `${theme.palette.surfaceWhite} !important`,
    borderBottom: `1px solid ${theme.palette.borderSubtle1} !important`,
    borderLeft: 'none !important',
    overflow: 'hidden !important',
    position: 'relative',
    minHeight: `${280}px !important`,
    height: `${280}px !important`,
    maxHeight: `${280}px !important`,
  },
  overviewSectionEmptyLaneCover: {
    position: 'absolute',
    // Pull left over the resource label so the empty state centers on the full row.
    left: '-220px',
    right: 0,
    top: 0,
    bottom: 0,
    background: `${theme.palette.surfaceWhite} !important`,
    zIndex: 5,
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    boxSizing: 'border-box',
    padding: '16px 24px',
  },
  overviewSectionEmptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    boxSizing: 'border-box',
    width: '100%',
    maxWidth: '420px',
  },
  overviewSectionEmptyIcon: {
    width: '120px',
    height: 'auto',
    maxHeight: '120px',
    flexShrink: 0,
  },
  overviewSectionEmptyTitle: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
      marginTop: '16px',
      textAlign: 'center',
      fontSize: '22px',
      fontWeight: 700,
      lineHeight: '30px',
      letterSpacing: 'normal',
    },
  },
  overviewSectionEmptyText: {
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary3,
      marginTop: '8px',
      textAlign: 'center',
      fontSize: '14px',
      fontWeight: 400,
      lineHeight: '20px',
      letterSpacing: 'normal',
    },
  },
  // When Overview only has accordion headers + empty rows, hide leftover day-grid chrome.
  // Use && so these beat `.calendar .fc { --fc-classic-border: ... }` (same file, later rule).
  overviewCalendarSectionsEmpty: {
    // FC7 classic day-columns use hashed utility classes + --fc-classic-border
    // (not .fc-timeline-slot). Clear the var so full-height column borders disappear.
    '&& .fc': {
      '--fc-classic-border': 'transparent',
      '--fc-classic-strong-border': 'transparent',
    },
    // Belt-and-suspenders: kill left/inline-start borders on tall day columns.
    '&& .fc div[class*="fc-classic-"]': {
      borderLeftColor: 'transparent !important',
      borderInlineStartColor: 'transparent !important',
    },
    // Collapse FullCalendar liquid filler under the last empty row.
    '&& .fc .fc-scrollgrid-section-liquid': {
      display: 'none !important',
      height: '0 !important',
      minHeight: '0 !important',
      maxHeight: '0 !important',
      overflow: 'hidden !important',
      border: 'none !important',
      backgroundColor: `${theme.palette.surfaceWhite} !important`,
    },
    '& $overviewSectionEmptyResourceLane, & $overviewSectionEmptyResourceLane *': {
      borderColor: 'transparent !important',
      borderLeftColor: 'transparent !important',
      borderRightColor: 'transparent !important',
      borderTopColor: 'transparent !important',
      borderBottomColor: 'transparent !important',
      borderInlineStartColor: 'transparent !important',
      boxShadow: 'none !important',
    },
    '& $overviewSectionEmptyResourceLabel': {
      borderColor: 'transparent !important',
      borderBottomColor: 'transparent !important',
      borderTopColor: 'transparent !important',
      boxShadow: 'none !important',
    },
    '& $overviewSectionEmptyResourceLane': {
      background: `${theme.palette.surfaceWhite} !important`,
      borderBottomColor: 'transparent !important',
      borderTopColor: 'transparent !important',
    },
    '& $overviewSectionEmptyLaneCover': {
      background: `${theme.palette.surfaceWhite} !important`,
    },
    // Accordion headers keep their band fill; drop bottom rule that draws through empty area.
    '& $overviewAccordionResourceLabel, & $overviewAccordionResourceLane': {
      borderBottomColor: 'transparent !important',
    },
  },
  overviewAccordionButton: {
    '&.MuiButtonBase-root': {
      width: '100%',
      minWidth: 0,
      height: '36px !important',
      minHeight: '36px !important',
      maxHeight: '36px !important',
      padding: '0 12px',
      justifyContent: 'flex-start',
      gap: '8px',
      borderRadius: 0,
      color: theme.palette.textPrimary,
      fontSize: '14px',
      fontWeight: 700,
      lineHeight: '20px',
      textTransform: 'none',
      background: 'transparent',
      boxSizing: 'border-box',
      '&:hover, &:active, &.Mui-focusVisible, &:focus': {
        background: 'transparent',
      },
    },
  },
  overviewAccordionIcon: {
    '&.MuiSvgIcon-root': {
      width: '18px',
      height: '18px',
      color: theme.palette.textSecondary1,
      transform: 'rotate(-90deg)',
      transition: 'transform 120ms ease',
    },
  },
  overviewAccordionIconOpen: {
    '&.MuiSvgIcon-root': {
      transform: 'rotate(0deg)',
    },
  },
  calendarHeaderToolbarSwitch: {
    gap: '4px',
    '&.MuiToggleButtonGroup-root': {
      borderRadius: '8px',
      border: `1px solid ${theme.palette.borderSubtle1}`,
      background: `${theme.palette.surfaceWhite}`,
      height: '32px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '0 2px',

      '& .MuiToggleButtonGroup-grouped': {
        display: 'flex',
        border: '0 ',
        height: '28px',
        borderRadius: '6px !important',
      },
    },
  },

  calendarHeaderToolbarSwitchBtn: {
    '&.MuiButtonBase-root': {
      color: `${theme.palette.textPlaceholder}`,
      border: '1px solid transparent',
      width: '28px',
      height: '28px',
      padding: '0',
      borderRadius: '6px',
      '&:hover': {
        backgroundColor: `${theme.palette.surfaceGreySubtle}`,
      },

      '&:disabled': {
        color: `${theme.palette.surfaceWhite}`,
        backgroundColor: `${theme.palette.surfaceBrandDisabled}`,
        border: `1px solid #A9DEFF`,
      },

      '&.Mui-selected': {
        backgroundColor: `${theme.palette.surfaceBrand}`,
        color: `${theme.palette.textOnColor}`,
        '&:hover': {
          backgroundColor: `${theme.palette.surfaceBrandHover}`,
        },
      },

      '& svg': {
        display: 'block',
        width: '16px',
        height: '16px',

        '& path': {
          stroke: 'currentColor',
        },
      },
    },
  },

  calendarHeaderToolbarToggle: {
    gap: '4px',
    '&.MuiToggleButtonGroup-root': {
      borderRadius: '8px',
      border: `1px solid ${theme.palette.borderSubtle1}`,
      background: `${theme.palette.surfaceWhite}`,
      height: '32px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '0 2px',

      '& .MuiToggleButtonGroup-grouped': {
        padding: '4px 16px',
        border: '0 ',
        height: '28px',
        borderRadius: '6px !important',
      },
    },
  },

  calendarHeaderToolbarToggleBtn: {
    '&.MuiButtonBase-root': {
      color: `${theme.palette.textPlaceholder}`,
      border: '1px solid transparent',
      '&:hover': {
        backgroundColor: `${theme.palette.surfaceGreySubtle}`,
      },

      '&:disabled': {
        color: `${theme.palette.surfaceWhite}`,
        backgroundColor: `${theme.palette.surfaceBrandDisabled}`,
        border: `1px solid #A9DEFF`,
      },

      '&.Mui-selected': {
        backgroundColor: `${theme.palette.surfaceBrand}`,
        color: `${theme.palette.textOnColor}`,
        '&:hover': {
          backgroundColor: `${theme.palette.surfaceBrandHover}`,
        },
      },
    },
  },
  carIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '16px',
    height: '16px',
    borderRadius: '50%',
    backgroundColor: theme.palette.surfaceWhite,
    border: `1px solid ${theme.palette.borderSubtle1}`,
    '& svg': {
      width: '14px !important',
      height: '14px !important',
    },
  },
  //Calendar
  calendar: {
    width: '100%',
    height: '100%',
    minWidth: 0,
    minHeight: 0,
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',

    '& ::-webkit-scrollbar': {
      display: 'none',
      width: 0,
    },

    '& ::-webkit-scrollbar-thumb': {
      width: 0,
    },

    '& .fc *': {
      msOverflowStyle: 'none',
      scrollbarWidth: 'none',
    },

    '& .fc-theme-standard td': {
      borderColor: theme.palette.borderSubtle1,
      // borderWidth: 0,
    },

    '& .fc-theme-standard th': {
      borderColor: theme.palette.borderSubtle1,
    },

    '& .fc .fc-timegrid-slot-minor': {
      borderTopStyle: 'solid',
      borderTopColor: `${theme.palette.surfaceGreyLight} !important`,
    },

    '& .fc-theme-standard .fc-list': {
      border: `1px solid ${theme.palette.borderSubtle1}`,
      borderRadius: '8px',
      overflow: 'hidden',
    },

    '& .fc-listMonth-view table th': {
      position: 'static !important',
    },

    '& .fc-list-event': {
      display: 'none',
    },

    '& .fc-theme-standard .fc-list-day-cushion': {
      backgroundColor: theme.palette.surfaceWhite,
      textAlign: 'left',
    },

    '& .fc-list-empty': {
      backgroundColor: theme.palette.surfaceWhite,
    },

    '& .fc .fc-list-day-cushion': {
      padding: '16px',
    },

    '& .fc': {
      '--fc-page-bg-color': theme.palette.surfaceWhite,
      // Keep classic theme colors aligned with Signal v6 look.
      '--fc-classic-background': theme.palette.surfaceWhite,
      '--fc-classic-border': theme.palette.borderSubtle1,
      '--fc-classic-strong-border': theme.palette.borderSubtle1,
      '--fc-classic-foreground': theme.palette.textPrimary,
      '--fc-classic-muted-foreground': theme.palette.textSecondary3,
      '--fc-classic-faint-foreground': theme.palette.textPlaceholder,
      '--fc-classic-today': 'rgba(245, 245, 246, 0.30)',
      '--fc-classic-primary': theme.palette.surfaceBrand,
      '--fc-classic-event': theme.palette.surfaceBrand,
      // Avoid classic muted grey wash on the resource/timeline divider.
      '--fc-classic-muted': 'transparent',
      fontFamily: 'inherit',
      fontSize: '14px',
    },

    // Week/month: FC owns body scroll (fixed height on the grid). Do NOT force
    // overflow:visible on FC scrollers — that puts the date header inside the
    // outer scrollport and sticky headers stretch/jitter while scrolling.
    // Header chrome (background/borders) is shared below for virtualized + not.
    '& .fc .fc-scrollgrid': {
      borderLeft: 0,
      borderRight: 0,
      borderTopColor: 'transparent',
      borderRadius: 0,
    },

    [`& .${fcClass.tableHeaderSticky}`]: {
      backgroundColor: `${theme.palette.surfaceWhite} !important`,
      borderTop: `1px solid ${theme.palette.borderSubtle1} !important`,
      boxShadow: `inset 0 -1px 0 ${theme.palette.borderSubtle1}`,
      zIndex: 6,
    },

    // FC7 resource-timeline: hide coarser header tiers (week/month); keep day row only.
    // Non-last header rows get borderOnlyB from FullCalendar.
    [`& .${fcClass.tableHeaderSticky} .${fcClass.flexRow}.${fcClass.borderOnlyB}`]: {
      display: 'none',
    },

    // Week timeline day slot headers — match v6 36px chrome.
    // FC7 classic no longer emits `.fc-resourceTimelineWeek-view`; scope via
    // tableHeaderSticky + internalTimelineSlot (dayGridDay uses columnheaders instead).
    [`& .${fcClass.tableHeaderSticky} .${fcClass.internalTimelineSlot}`]: {
      height: '36px !important',
      minHeight: '36px !important',
      maxHeight: '36px !important',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '0 !important',
      boxSizing: 'border-box',
      overflow: 'hidden',
    },

    [`& .${fcClass.tableHeaderSticky} .${fcClass.internalTimelineSlot} > *`]: {
      width: '100%',
      height: '100%',
      padding: 0,
    },

    // Clear FC system-today only when this slot is not franchise-today.
    [`& .${fcClass.tableHeaderSticky} .${fcClass.internalTimelineSlot}[aria-current='date']:not(:has([data-schedule-header-today]))`]:
      {
        backgroundColor: 'transparent !important',
      },

    // Franchise today: paint the full timeline slot (marker on header content).
    [`& .${fcClass.tableHeaderSticky} .${fcClass.internalTimelineSlot}:has([data-schedule-header-today])`]:
      {
        backgroundColor: `${theme.palette.surfaceBrand} !important`,
      },

    // Resource column label typography (replaces .fc-datagrid-cell-main).
    '& .fc [role="rowheader"]': {
      backgroundColor: theme.palette.surfaceWhite,
      fontSize: '14px',
      color: theme.palette.textPrimary,
      fontWeight: 500,
      whiteSpace: 'normal',
      overflow: 'hidden',
      minWidth: 0,
      maxWidth: '100%',
    },

    // Resource timeline column header height (Locations / day slots).
    [`& .${fcClass.tableHeaderSticky} [role="columnheader"]`]: {
      height: '36px !important',
      minHeight: '36px !important',
      maxHeight: '36px !important',
      display: 'flex',
      alignItems: 'center',
    },

    // Day view: location/shift cards live in dayHeaderContent. Size the header to
    // content and keep the unused day-grid body collapsed — do NOT display:none the
    // body (that makes the header liquid-fill the viewport and centers WED/date).
    // Force full width: FC7 classic can shrink-wrap the day header when the body
    // is collapsed, leaving large side gaps vs the toolbar (portal fills width).
    '& .fc-dayGridDay-view': {
      width: '100% !important',
    },

    '& .fc-dayGridDay-view .fc-view-harness, & .fc-dayGridDay-view .fc-view-harness-active, & .fc-dayGridDay-view .fc-view-harness-passive':
      {
        height: 'auto !important',
        width: '100% !important',
      },

    '& .fc-dayGridDay-view .fc-scrollgrid, & .fc-dayGridDay-view table': {
      height: 'auto !important',
      width: '100% !important',
      minWidth: '100% !important',
      tableLayout: 'fixed',
    },

    '& .fc-dayGridDay-view .fc-scrollgrid-section-header, & .fc-dayGridDay-view .fc-scrollgrid-section-header > *':
      {
        height: 'auto !important',
        width: '100% !important',
        position: 'relative !important',
        top: 'auto !important',
      },

    '& .fc-dayGridDay-view .fc-col-header, & .fc-dayGridDay-view .fc-col-header-cell, & .fc-dayGridDay-view [role="columnheader"]':
      {
        height: 'auto !important',
        minHeight: '0 !important',
        maxHeight: 'none !important',
        width: '100% !important',
        overflow: 'visible !important',
        verticalAlign: 'top',
      },

    '& .fc-dayGridDay-view .fc-col-header-cell-cushion, & .fc-dayGridDay-view [role="columnheader"] > *':
      {
        display: 'block',
        width: '100% !important',
        maxWidth: '100%',
        height: 'auto !important',
        maxHeight: 'none !important',
        overflow: 'visible !important',
        whiteSpace: 'normal',
        boxSizing: 'border-box',
        padding: '0',
        margin: '0 !important',
      },

    // FC wraps dayHeaderContent in flexCol + nowrap + noShrink, then classic theme
    // centers it. Force those wrappers to stretch so the day card grid is full width.
    [`& .fc-dayGridDay-view [role="columnheader"].${fcClass.alignCenter}`]: {
      alignItems: 'stretch !important',
    },

    [`& .fc-dayGridDay-view [role="columnheader"] .${fcClass.whiteSpaceNoWrap}`]: {
      whiteSpace: 'normal !important',
      width: '100% !important',
      maxWidth: '100% !important',
      alignSelf: 'stretch !important',
      left: '0 !important',
      right: '0 !important',
    },

    [`& .fc-dayGridDay-view [role="columnheader"] .${fcClass.noShrink}`]: {
      width: '100% !important',
      maxWidth: '100% !important',
      flexShrink: '1 !important',
    },

    '& .fc-dayGridDay-view [role="columnheader"] .fc-classic-E9P': {
      justifyContent: 'flex-start !important',
      alignItems: 'stretch !important',
      width: '100% !important',
    },

    '& .fc-dayGridDay-view .fc-daygrid-body, & .fc-dayGridDay-view .fc-daygrid-day-frame, & .fc-dayGridDay-view .fc-daygrid-day':
      {
        minHeight: '0 !important',
        height: '0 !important',
        maxHeight: '0 !important',
        padding: '0 !important',
        border: '0 !important',
        overflow: 'hidden',
        lineHeight: 0,
      },

    '& .fc-dayGridDay-view .fc-scrollgrid-section-body, & .fc-dayGridDay-view .fc-scrollgrid-section-liquid':
      {
        height: '0 !important',
        minHeight: '0 !important',
        maxHeight: '0 !important',
        overflow: 'hidden !important',
        lineHeight: 0,
        border: '0 !important',
      },

    // Strip default FC event chrome — Signal cards paint themselves via eventContent.
    [`& .${fcClass.internalEvent}`]: {
      border: '0 !important',
      backgroundColor: 'transparent !important',
      boxShadow: 'none !important',
      margin: '0 !important',
      padding: '0 !important',

      '&:focus, &:focus-visible': {
        outline: 'none',
        boxShadow: 'none',
      },

      // Classic timeline rowEventInnerClass adds padding-block 2px/6px — remove for v6 card spacing.
      '& > *': {
        padding: '0 !important',
        margin: '0 !important',
      },
    },

    '& .fc-direction-ltr .fc-timegrid-col-events': {
      margin: 0,
    },

    // Legacy v6 event selector kept for day/month views that still emit .fc-event.
    '& .fc-event': {
      border: 0,
      backgroundColor: 'transparent',
      width: '90%',

      '&:focus': {
        boxShadow: 'none',

        '&:focus::after': {
          backgroundColor: 'inherit',
        },
      },

      '&:focus-visible': {
        outline: 'none',
      },
    },

    '& .fc-direction-ltr .fc-daygrid-event.fc-event-end': {
      margin: 'unset',
    },

    '& .fc-direction-ltr .fc-daygrid-event.fc-event-start': {
      margin: 'unset',
    },

    // FC7 classic today cells (day/month/timegrid) — replaces .fc-day-today.
    '& .fc-classic-hbn': {
      backgroundColor: 'rgba(245, 245, 246, 0.30) !important',
    },

    '& .fc .fc-daygrid-day.fc-day-today': {
      backgroundColor: 'rgba(245, 245, 246, 0.30)',
    },

    '& .fc-col-header-cell.fc-day.fc-day-today': {
      backgroundColor: 'rgba(245, 245, 246, 0.30)',
    },

    '& .fc .fc-timegrid-col.fc-day-today': {
      backgroundColor: 'rgba(245, 245, 246, 0.30)',
    },

    '& .fc .fc-col-header-cell-cushion': {
      display: 'block',
      padding: '0 12px',
    },

    '& table': {
      borderRadius: '8px',
      width: '100% !important',

      '& .fc-timegrid-body': {
        width: '100%',
      },

      '& .fc-timegrid-slot-label-cushion': {
        padding: 0,
      },
    },

    '& .fc-v-event .fc-event-title-container': {
      flexGrow: 0,
      flexShrink: 0,
    },

    '& .fc-timegrid-event-harness-inset .fc-timegrid-event': {
      boxShadow: 'none',
      marginBottom: '5px',
    },

    '& .fc-timegrid-event.fc-event-mirror': {
      boxShadow: 'none',
    },

    '& .fc-timegrid-more-link': {
      boxShadow: 'none',
    },

    '& .fc-daygrid-event-harness::before': {
      display: 'none',
    },

    '& .fc-daygrid-event-harness::after': {
      display: 'none',
    },

    '& .fc-timegrid-event .fc-event-main': {
      padding: 0,
      // height: 'auto',
    },

    '& .fc-timegrid-body .fc-timegrid-slots': {
      zIndex: 2,
    },

    '& .fc-timegrid-body .fc-timegrid-slots .fc-timegrid-slot': {
      height: '36px',
    },

    '& .fc-time-grid .fc-slats td': {
      height: '36px',
    },

    '& .fc-daygrid-dot-event': {
      padding: 0,
    },

    '& .fc-timegrid-body': {
      width: '100% !important',
    },

    '& .fc-daygrid-body': {
      width: '100% !important',
    },

    '& .fc .fc-daygrid-day-frame': {
      minHeight: '140px',
      padding: '6px',
      display: 'flex',
      flexDirection: 'column',
      flex: '1',
      height: '100%',
    },

    '& .fc-direction-ltr .fc-timegrid-slot-label-frame': {
      textAlign: 'left',
    },

    '& .fc-list-day.fc-day-today': {
      '& th > .fc-list-day-cushion ': {
        backgroundColor: 'rgba(245, 245, 246, 0.30)',
      },
    },

    '& .fc-dayGridMonth-view': {
      '& .fc-daygrid-day-top': {
        fontSize: '16px',
        fontStyle: 'normal',
        fontWeight: 500,
        lineHeight: '24px',
        color: theme.palette.textPrimary,
        flexDirection: 'row',
        opacity: 1,

        '& .fc-daygrid-day-number': {
          padding: 0,
        },
      },

      '& .fc-daygrid-day-events': {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        marginTop: 'auto',

        '&::before': {
          display: 'none',
        },

        '&::after': {
          display: 'none',
        },

        '& .fc-daygrid-event-harness': {
          marginTop: 'auto !important',
        },
      },

      '& .fc-daygrid-day-frame': {
        minHeight: '140px',
        padding: '12px',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      },

      '& .fc-daygrid-day-bottom': {
        display: 'none',
      },

      '& .fc-event': {
        width: '100%',
      },

      '& .fc-day-today': {
        background: `backgroundColor: 'rgba(245, 245, 246, 0.30)' !important`,

        '& .fc-daygrid-day-top': {
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: '38px',
          height: '38px',
          borderRadius: '19px',
          backgroundColor: theme.palette.surfaceBrand,
          color: theme.palette.textOnColor,
        },
      },
    },
  },

  // Virtualized schedule: FC owns vertical scroll so Locations + day grid stay
  // natively synced, and only near-viewport rows mount.
  // Do NOT put the chrome vh-calc here — that value is sized for the grid alone
  // (toolbar sits above it). Applying it to toolbar+grid made the grid ~64px short.
  calendarVirtualized: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,

    '& $calendarBody': {
      display: 'flex',
      flexDirection: 'column',
      minHeight: 0,
      overflow: 'hidden',
    },

    '& .fc': {
      height: '100%',
    },

    '& .fc .fc-view-harness, & .fc .fc-view-harness-active, & .fc .fc-view-harness-passive': {
      height: '100% !important',
    },

    '& [role="rowheader"], & [role="columnheader"]': {
      backgroundColor: theme.palette.surfaceWhite,
    },

    // Franchise-today slot must win over the columnheader white fill above.
    [`& .${fcClass.tableHeaderSticky} .${fcClass.internalTimelineSlot}:has([data-schedule-header-today])`]:
      {
        backgroundColor: `${theme.palette.surfaceBrand} !important`,
      },
  },

  // Covers the blank FC body while virtualization remounts rows after a fast scroll.
  // pointer-events:none so wheel/scroll keep reaching FC underneath.
  calendarVirtualScrollOverlay: {
    position: 'absolute',
    inset: 0,
    zIndex: 5,
    backgroundColor: theme.palette.surfaceWhite,
    pointerEvents: 'none',
    overflow: 'hidden',

    '& > *': {
      height: '100% !important',
      maxHeight: '100%',
    },
  },

  calendarBody: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    minHeight: 0,
    minWidth: 0,
    width: '100%',
  },

  // Restores v6 1px resource↔timeline divider (FC7 classic uses a muted padded strip).
  resourceTimelineDivider: {
    width: '1px !important',
    minWidth: '1px !important',
    maxWidth: '1px !important',
    padding: '0 !important',
    backgroundColor: `${theme.palette.borderSubtle1} !important`,
    border: 'none !important',
    boxSizing: 'border-box',
  },

  // Clears classic `margin: 8px` on resource cell inners so Signal padding owns spacing.
  resourceCellInnerReset: {
    margin: '0 !important',
    width: '100%',
    minWidth: 0,
    boxSizing: 'border-box',
    // Let multi-line labels (site bands / unassigned) contribute to FC row height.
    whiteSpace: 'normal !important',
  },

  // Clears classic slot-header inline margins so today fill is edge-to-edge like v6.
  slotHeaderInnerReset: {
    margin: '0 !important',
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxSizing: 'border-box',
  },

  resourceColumnHeaderInner: {
    margin: '0 !important',
    padding: '0 8px',
    width: '100%',
    fontSize: '14px',
    fontWeight: 500,
    color: theme.palette.textPrimary,
    boxSizing: 'border-box',
  },

  // Clears classic timeline rowEventInner padding so eventContent margins match v6.
  rowEventInnerReset: {
    padding: '0 !important',
    margin: '0 !important',
  },

  // Absolute overlay over a full-size (opacity:0) FC grid so layout can settle
  // without remounting from a 1×1 host. Child 100% sizing keeps the skeleton
  // fitting at any zoom.
  calendarLoadingPlaceholder: {
    position: 'absolute',
    inset: 0,
    zIndex: 5,
    overflow: 'hidden',
    backgroundColor: theme.palette.surfaceWhite,
    pointerEvents: 'none',

    '& > *': {
      width: '100%',
      height: '100%',
      minWidth: 0,
      minHeight: 0,
      maxWidth: '100%',
      maxHeight: '100%',
      boxSizing: 'border-box',
    },
  },

  calendarEmptyPlaceholder: {
    position: 'absolute',
    // Leave the date/slot header (36px) visible above the empty state.
    // Week, day, and month empty headers are forced to 36px in calendarGridEmpty.
    top: 36,
    left: 0,
    right: 0,
    bottom: 0,
    // Above the FC grid + sticky header (zIndex 6) so this borderTop is not covered
    // by the header’s bottom edge when no rows are present.
    zIndex: 7,
    overflow: 'hidden',
    backgroundColor: theme.palette.surfaceWhite,
    // Separator under the date header — empty overlay would otherwise cover FC's
    // inset header bottom border when the resource body is hidden.
    borderTop: `1px solid ${theme.palette.borderSubtle1}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Hide empty resource/day-grid body chrome while keeping the date header painted.
  // Applies to week (resource timeline), day, and month — same 36px header chrome so
  // calendarEmptyPlaceholder (top: 36) + bottom border line up in every view.
  calendarGridEmpty: {
    '& .fc .fc-scrollgrid-section-body, & .fc .fc-scrollgrid-section-liquid': {
      visibility: 'hidden',
    },

    // Week / shared scrollgrid header bottom edge.
    '& .fc .fc-scrollgrid-section-header': {
      boxShadow: `0 1px 0 0 ${theme.palette.borderSubtle1}`,
    },
    [`& .${fcClass.tableHeaderSticky}`]: {
      borderBottom: `1px solid ${theme.palette.borderSubtle1} !important`,
      boxShadow: `inset 0 -1px 0 ${theme.palette.borderSubtle1}`,
    },
    '& .fc .fc-scrollgrid-section-header > *': {
      borderBottom: `1px solid ${theme.palette.borderSubtle1} !important`,
      boxShadow: `inset 0 -1px 0 ${theme.palette.borderSubtle1}`,
    },

    // Day view: beat the auto-height header rules so the date chip stays 36px with a
    // visible bottom border above the empty state.
    '& .fc-dayGridDay-view .fc-scrollgrid-section-header, & .fc-dayGridDay-view .fc-scrollgrid-section-header > *, & .fc-dayGridDay-view .fc-col-header-cell, & .fc-dayGridDay-view [role="columnheader"]':
      {
        height: '36px !important',
        minHeight: '36px !important',
        maxHeight: '36px !important',
        borderBottom: `1px solid ${theme.palette.borderSubtle1} !important`,
        boxShadow: `inset 0 -1px 0 ${theme.palette.borderSubtle1}`,
      },

    // Month view: same 36px header + bottom border (month cells otherwise pad taller).
    '& .fc-dayGridMonth-view .fc-scrollgrid-section-header, & .fc-dayGridMonth-view .fc-scrollgrid-section-header > *, & .fc-dayGridMonth-view .fc-col-header, & .fc-dayGridMonth-view .fc-col-header-cell, & .fc-dayGridMonth-view [role="columnheader"]':
      {
        height: '36px !important',
        minHeight: '36px !important',
        maxHeight: '36px !important',
        borderBottom: `1px solid ${theme.palette.borderSubtle1} !important`,
        boxShadow: `inset 0 -1px 0 ${theme.palette.borderSubtle1}`,
      },
    '& .fc-dayGridMonth-view [role="columnheader"] > *': {
      height: '36px !important',
      minHeight: '36px !important',
      maxHeight: '36px !important',
      paddingTop: '0 !important',
      paddingBottom: '0 !important',
      boxSizing: 'border-box',
    },
  },

  // Keep FC at full size under the loading skeleton (pre-revamp). Block interaction
  // and hide the grid so a mid-layout paint cannot flash misaligned cards.
  calendarGridLoading: {
    pointerEvents: 'none',
    opacity: 0,
  },

  calendarGridHidden: {
    position: 'absolute',
    width: 1,
    height: 1,
    overflow: 'hidden',
    opacity: 0,
    pointerEvents: 'none',
    visibility: 'hidden',
  },

  calendarGridVisible: {
    flex: 1,
    minHeight: 0,
    height: 'calc(100vh - var(--schedule-calendar-chrome, 231px))',
    // FC body scrollers own vertical scroll — date header stays outside the scrollport.
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',

    // Only the FC root fills height — day view may also render belowGridContent here.
    '& > .fc': {
      flex: 1,
      minHeight: 0,
      height: '100%',
    },

    '& .fc .fc-view-harness, & .fc .fc-view-harness-active, & .fc .fc-view-harness-passive': {
      height: '100% !important',
    },
  },

  // Day view: FC only paints the date chip; cards render as a sibling under the grid
  // so they are not shrink-wrapped/centered by classic dayHeaderAlign.
  // Cap FC height — otherwise the unused day-grid body/harness still fills the
  // chrome-sized scrollport and leaves a large blank gap above the cards.
  calendarGridWithBelowContent: {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'auto',
    overscrollBehavior: 'contain',

    '& > .fc': {
      flex: '0 0 auto',
      height: 'auto !important',
      maxHeight: '48px',
      width: '100%',
      overflow: 'hidden',
    },

    '& .fc .fc-view-harness, & .fc .fc-view-harness-active, & .fc .fc-view-harness-passive': {
      height: 'auto !important',
      minHeight: '0 !important',
      maxHeight: '48px !important',
    },

    '& .fc .fc-scrollgrid, & .fc-dayGridDay-view .fc-scrollgrid': {
      height: 'auto !important',
      borderLeft: 'none !important',
      borderRight: 'none !important',
      borderRadius: 0,
    },

    // Safe now that cards are outside dayHeaderContent (display:none used to
    // liquid-fill the header when it contained the whole day schedule).
    '& .fc-dayGridDay-view .fc-scrollgrid-section-body, & .fc-dayGridDay-view .fc-scrollgrid-section-liquid, & .fc-dayGridDay-view .fc-daygrid-body':
      {
        display: 'none !important',
      },

    '& .fc-dayGridDay-view .fc-scrollgrid-section-header, & .fc-dayGridDay-view .fc-col-header-cell, & .fc-dayGridDay-view [role="columnheader"]':
      {
        height: '36px !important',
        minHeight: '36px !important',
        maxHeight: '36px !important',
        borderLeft: 'none !important',
        borderRight: 'none !important',
      },

    [`& .fc-dayGridDay-view .${fcClass.borderOnlyS}, & .fc-dayGridDay-view .${fcClass.borderOnlyE}, & .fc-dayGridDay-view .${fcClass.fakeBorderS}`]:
      {
        borderLeft: 'none !important',
        borderRight: 'none !important',
        backgroundImage: 'none !important',
        boxShadow: 'none !important',
      },
  },

  // Virtualization extras on top of calendarGridVisible (same chrome height /
  // FC-owned body scroll). flex:none so we don't collapse when the virtualized
  // parent has no definite height.
  calendarGridVirtualized: {
    flex: '0 0 auto',
  },

  calendarTimeSlot: {
    textTransform: 'uppercase',
    padding: '0 8px',
    textAlign: 'left',
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary3,
    },
  },

  dutyRedMonth: {
    '& > div > div': {
      background: theme.palette.surfaceAlertStrong,
    },
  },

  dutyGreenMonth: {
    '& > div > div': {
      background: theme.palette.surfaceSuccessStrong,
    },
  },

  dutyBlueMonth: {
    '& > div > div': {
      background: theme.palette.surfaceBrand,
    },
  },

  dutyYellowMonth: {
    '& > div > div': {
      background: theme.palette.surfaceWarningStrong,
    },
  },

  eventContentMonthAlert: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer',
    // A month cell is one seventh of the grid, and tenant duty terms can be
    // long ("Filter Replacement Service"). Without these the label overran the
    // cell and collided with the neighbouring day and the attention icon.
    minWidth: 0,
    maxWidth: '100%',
    overflow: 'hidden',
    '& > *': {
      minWidth: 0,
    },
    '& p, & span': {
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
    '& svg': {
      flex: '0 0 auto',
    },
  },

  eventContent: {
    backgroundColor: theme.palette.surfaceGreySubtle,
    padding: '6px 8px',
    overflow: 'hidden',
    borderRadius: '4px',
    cursor: 'pointer',
    display: 'flex',
    width: '98%',
    gap: '4px',
    marginLeft: '8px',
    marginTop: '8px',
    marginRight: '8px',
    // marginBottom: '5px',
  },
  eventContentWeek: {
    flexDirection: 'column',
    gap: '4px',
    minWidth: 0,
  },

  eventContentView: {
    backgroundColor: theme.palette.surfaceWhite,
    padding: '2px',
    borderRadius: '6px',
    overflow: 'hidden',
    height: '100%',
  },

  eventDetailHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: '4px',
    minWidth: 0,
  },
  eventDetailHeaderWrapper: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '4px',
    width: '100%',
  },
  splitShiftIconWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    flexShrink: 0,
    marginLeft: 'auto',
    height: '100%',
    '& svg': {
      maxWidth: '24px',
      maxHeight: '24px',
    },
  },

  eventContentFlex: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    height: '100%',
    borderRadius: '4px',
    padding: '6px 6px 6px 8px',
    margin: 0,
  },
  dutyYellowBg: {
    backgroundColor: '#FFF7E1 !important',
  },
  dutyGreenBg: {
    backgroundColor: `${theme.palette.surfaceSuccessSubtle} !important`,
  },
  dutyBlueBg: {
    backgroundColor: `${theme.palette.surfaceBrandSubtle} !important`,
  },

  dutyRedBg: {
    backgroundColor: `${theme.palette.surfaceAlertSubtle} !important`,
  },
  cancelledDedicatedCard: {
    background:
      'repeating-linear-gradient(135deg, #ffffff 0px, #ffffff 16px, #f6f7f9 16px, #f6f7f9 32px) !important',
    borderLeft: `4px solid ${theme.palette.textPlaceholder} !important`,
    borderColor: `${theme.palette.textPlaceholder} !important`,
    '& .MuiTypography-root': {
      textDecoration: 'line-through',
      color: `${theme.palette.textSecondary3} !important`,
    },
    '& .MuiAvatar-root': {
      opacity: 0.85,
      filter: 'grayscale(100%)',
    },
  },

  dutyGreen: {
    borderLeft: `3px solid ${theme.palette.surfaceSuccessStrong}`,
    borderColor: theme.palette.surfaceSuccessStrong,
  },
  dutyRed: {
    borderLeft: `3px solid ${theme.palette.borderAlert}`,
    borderColor: theme.palette.borderAlert,
  },
  dutyBlue: {
    borderLeft: `3px solid ${theme.palette.borderBrand}`,
    borderColor: theme.palette.borderBrand,
  },
  dutyPurple: {
    borderLeft: `3px solid ${theme.palette.borderPurple}`,
    borderColor: theme.palette.borderPurple,
  },

  dutyYellow: {
    borderLeft: `3px solid ${theme.palette.borderWarning}`,
    borderColor: theme.palette.borderWarning,
  },

  eventDetail: {
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },

  eventSiteName: {
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    display: 'block',
    '&.MuiTypography-root': {
      color: theme.palette.textPlaceholder,
    },
  },

  reassignedName: {
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    textTransform: 'capitalize',
    display: 'block',
    minWidth: 0,
    '&.MuiTypography-root': {
      color: theme.palette.textPlaceholder,
    },
  },

  patrolCardBody: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '4px',
    minWidth: 0,
    width: '100%',
  },

  patrolOfficerInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    minWidth: 0,
    flex: 1,
    overflow: 'hidden',
  },

  patrolOfficerText: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
    overflow: 'hidden',
    gap: '0px',
  },

  patrolOfficerName: {
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    textTransform: 'capitalize',
    display: 'block',
    minWidth: 0,
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
      fontSize: '11px',
      lineHeight: '14px',
      fontWeight: 500,
    },
  },

  patrolVehicleName: {
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    display: 'block',
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary3,
      fontSize: '10px',
      lineHeight: '12px',
    },
  },

  patrolCardStatusIcons: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    flexShrink: 0,
  },

  missedHitsChip: {
    '&.MuiChip-root': {
      height: '16px',
      borderRadius: '60px',
      flexShrink: 0,
      '& .MuiChip-label': {
        padding: '0 6px',
        fontSize: '10px',
        fontWeight: 500,
        lineHeight: '14px',
      },
    },
  },

  dedicatedCardBody: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '4px',
    minWidth: 0,
    width: '100%',
  },

  dedicatedOfficerInfoWithReassign: {
    display: 'flex',
    alignItems: 'center',
    minWidth: 0,
    flex: 1,
    overflow: 'hidden',
  },

  dedicatedShiftLabel: {
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    display: 'block',
    minWidth: 0,
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary3,
    },
  },

  dedicatedOfficerName: {
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    textTransform: 'capitalize',
    display: 'block',
    minWidth: 0,
    '&.MuiTypography-root': {
      color: theme.palette.textPlaceholder,
    },
  },

  eventSiteNameColor: {
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    display: 'block',
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
    },
  },

  eventAvatar: {
    '&.MuiAvatar-root': {
      width: '16px',
      height: '16px',
      border: `1px solid ${theme.palette.borderSubtle1}`,
    },
  },

  eventAvatarReassignedOfficer: {
    position: 'relative',
    right: '7px',
    zIndex: '2',
    '&.MuiAvatar-root': {
      width: '16px',
      height: '16px',
      border: `1px solid ${theme.palette.borderSubtle1}`,
    },
  },

  reassignedFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '4px',
    height: '16px',
    minWidth: 0,
    '& $reassignedFooterFlex, & $reassignedFooterFlexGap': {
      flex: 1,
      minWidth: 0,
      overflow: 'hidden',
    },
    '& $reassignedFooterFlex $reassignedName, & $reassignedFooterFlexGap $reassignedName': {
      flex: 1,
      minWidth: 0,
    },
  },

  reassignedFooterFlex: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },

  officerAssignTrigger: {
    cursor: 'pointer',
    borderRadius: '4px',
    '&:hover': {
      backgroundColor: 'rgba(0, 0, 0, 0.04)',
    },
  },

  reassignedFooterFlexGap: {
    display: 'flex',
    alignItems: 'center',
  },

  reassignedOfficerFlex: {
    display: 'flex',
    flexShrink: 0,
    '& svg': {
      width: '10px',
      height: '10px',
    },
  },

  calendarHeaderCell: {
    textAlign: 'center',
    // Week timeline sticky headers fill their 36px slot via height:100%.
    // Day view overrides this with calendarDayViewDateHeader (fixed 36px) so the
    // date row does not expand and vertically center inside a tall header cell.
    height: '100%',
    minHeight: '36px',
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
    gap: '6px',
    boxSizing: 'border-box',
  },

  calendarDayViewRoot: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    width: '100%',
    height: 'auto',
  },

  calendarDayViewDateHeader: {
    height: '36px !important',
    minHeight: '36px !important',
    maxHeight: '36px !important',
    flex: '0 0 36px',
  },

  calendarHeaderCellToday: {
    backgroundColor: theme.palette.surfaceBrand,
    '& .MuiTypography-root': {
      color: `${theme.palette.textOnColor} !important`,
    },
  },

  scheduleBoxIcons: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },

  calendarHeaderCellDay: {
    textTransform: 'uppercase',
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary3,
      fontSize: '12px',
      fontWeight: 500,
      lineHeight: '18px',
    },
  },

  calendarHeaderCellDate: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
      fontSize: '12px',
      fontWeight: 500,
      lineHeight: '18px',
    },
  },

  calendarHeaderMonthCell: {
    width: 'fit-content',
    textAlign: 'center',
    height: '32px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-start',
    padding: '12px 0',
  },

  calendarHeaderMonthCellDate: {
    textTransform: 'uppercase',
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary3,
    },
  },

  calendarListView: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '45px',
  },

  calendarListViewTime: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    width: '135px',
  },

  calendarListViewDate: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
    },
  },

  calendarListViewDay: {
    '&.MuiTypography-root': {
      color: theme.palette.textPlaceholder,
      textTransform: 'uppercase',
    },
  },

  calendarListViewRight: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-start',
    gap: '16px',
    width: '100%',
  },

  calendarListViewEvent: {
    display: 'flex',
    alignItems: 'center',
    gap: '35px',
    cursor: 'pointer',
  },

  calendarListViewEventBody: {
    display: 'flex',
    alignItems: 'center',
    gap: '35px',
  },

  calendarListViewDutyName: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
    },
    minWidth: '175px',
  },

  calendarListViewDutyTime: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
    },
    minWidth: '175px',
  },

  calendarListViewtooltip: {
    display: 'flex',
    alignItems: 'center',
    columnGap: '4px',
  },

  calendarListEmpty: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
  },

  calendarListViewNoShiftTitle: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
      marginTop: '24px',
      textAlign: 'center',
    },
  },

  calendarListViewNoShiftText: {
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary3,
      marginTop: '16px',
      textAlign: 'center',
    },
  },

  highlightCurrentDate: {
    width: '28px',
    height: '28px',
    borderRadius: '14px',
    backgroundColor: theme.palette.surfaceBrand,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    '&.MuiTypography-root': {
      color: theme.palette.textOnColor,
    },
  },

  highlightCurrentDay: {
    '&.MuiTypography-root': {
      color: theme.palette.textBrand,
    },
  },
  dayViewWrapper: {
    display: 'grid',
    // Seven fixed columns is a week-grid shape; a day has no seven of anything,
    // and it squeezed every card to a seventh of the width whether there was
    // one card or twelve. Size to content and wrap instead.
    gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))',
    gap: '8px',
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
    paddingBottom: '8px',

    '&:last-child': {
      borderBottom: 0,
    },
  },
  dayEventContent: {
    padding: '6px 8px',
    overflow: 'hidden',
    borderRadius: '4px',
    cursor: 'pointer',
    display: 'flex',
    width: '100%',
    gap: '4px',
    alignItems: 'flex-start',
    background: theme.palette.surfaceGreySubtle,
  },

  calendarDayCustom: {
    width: '100%',
    flex: '1 1 auto',
    minHeight: 0,
    // The day body used to inherit the page shell, leaving dark-on-dark section
    // headings floating above light cards. It is a grid surface like the week
    // view, so it gets the same one.
    background: theme.palette.surfaceWhite,
    padding: '4px 16px 16px',
    overflowY: 'auto',
  },

  dayLocationName: {
    padding: '8px 0',
    alignItems: 'flex-start',
    display: 'flex',
    justifyContent: 'flex-start',
    // textTransform: 'capitalize',
    color: theme.palette.textPrimary,
  },

  /* --- day view: a titled section per site, with its own count and empty state */
  dayLocationHeader: {
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: '12px',
    padding: '0 4px',
  },
  dayLocationNameUnassigned: {
    '&.MuiTypography-root': {
      color: theme.palette.textError || '#B42318',
      fontWeight: 600,
    },
  },
  dayLocationCount: {
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary1,
      fontSize: '12px',
      lineHeight: '16px',
      whiteSpace: 'nowrap',
    },
  },
  dayLocationEmpty: {
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary1,
      fontSize: '13px',
      lineHeight: '18px',
      padding: '0 4px 12px',
    },
  },
  dayViewUnassignedSection: {
    background: '#FEF3F2',
    borderRadius: '8px',
    padding: '4px 8px 0',
    marginBottom: '8px',
    border: '1px dashed #F04438',
  },

  borderBottom: {
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
  },

  dayViewBorder: {
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
    '&:last-child': {
      borderBottom: 0,
    },
  },
  missedHitsButton: {
    '&.MuiButtonBase-root': {
      minWidth: 'auto',
      height: 'auto',
      padding: '2px 16px',
      borderRadius: '60px',
      background: theme.palette.surfaceAlertSubtle,
      borderColor: theme.palette.surfaceAlertSubtle,
      fontSize: '12px',
      fontWeight: '500',

      '& .MuiButton-icon': {
        '& svg': {
          width: '10px',
          height: '10px',
          '& path': {
            stroke: theme.palette.textAlert,
          },
        },
      },
    },
  },

  newReassignedFooter: {
    '& .MuiTypography-root': {
      maxWidth: '100%',
    },
  },
  notesIconDiv: {
    display: 'flex',
    gap: '0px',
    alignItems: 'center',
    flexShrink: 0,
  },
  splitShiftIconWrapperInView: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    flexShrink: 0,
    marginLeft: 'auto',
    height: '100%',
    '& svg': {
      maxWidth: '20px',
      maxHeight: '20px',
    },
  },
}));
