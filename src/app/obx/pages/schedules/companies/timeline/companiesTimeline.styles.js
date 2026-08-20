import { makeStyles } from '@mui/styles';
import { calendarShiftStatusEnum } from 'src/utils/constants/schedules';

import { visitCardFills } from '../../helper/visitCardInk';

/**
 * V1 is a **list**, not a scheduler.
 *
 * It used to be a CSS grid with a column per month — the week grid's shape with a
 * different unit — which meant most of every row was empty: a location serviced
 * quarterly fills three cells in twelve and the other nine are ruled whitespace.
 * A month axis only earns its width when the reader needs to compare positions
 * across it, and on this tab the question is "what is coming for this customer",
 * which is a sequence, not a coordinate.
 *
 * So a location row is now its visits, stacked left to right in date order and
 * wrapping. The date moved onto the card, which is what makes dropping the axis
 * free rather than lossy.
 */
const LOCATION_WIDTH = 236;

export const TIMELINE_COLUMNS = { LOCATION_WIDTH };

/**
 * The card's status treatments are **not** declared here any more.
 *
 * This view and the matrix each kept a private approximation of the week grid's
 * `visitFill*` set, and the three drifted: a missed visit was hatched red on the
 * scheduler and flat pink here. They now come from `helper/visitCardInk`, which
 * follows the grid — see the note there. Only the card's *geometry* is local, because
 * a 212px card in a wide row and a 150px card in a day column should not have to
 * pretend to be each other.
 */
/** The band behind a company header — the overview grid's accordion grey. */
const GROUP_BG = '#F5F5F6';

export const useStyles = makeStyles((theme) => {
  const FILLS = visitCardFills(theme);

  return {
    timelinePane: {
      display: 'flex',
      flexDirection: 'column',
      flex: 1,
      minHeight: 0,
    },

    scroller: {
      flex: 1,
      minHeight: 0,
      overflow: 'auto',
      borderTop: `1px solid ${theme.palette.borderSubtle1}`,
    },

    /* --- Company group header ---------------------------------------------- */
    groupRow: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      minHeight: '36px',
      padding: '0 12px',
      background: GROUP_BG,
      borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
    },

    groupToggle: {
      '&.MuiButtonBase-root': {
        padding: '2px',
        color: theme.palette.textSecondary2,
      },
    },

    groupToggleIcon: {
      fontSize: '18px',
      transition: 'transform 160ms ease',
      transform: 'rotate(-90deg)',
    },

    groupToggleIconOpen: { transform: 'rotate(0deg)' },

    groupName: {
      '&.MuiTypography-root': {
        fontSize: '13px',
        fontWeight: 600,
        lineHeight: '18px',
        color: theme.palette.textPrimary,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      },
    },

    groupMeta: {
      '&.MuiTypography-root': {
        fontSize: '12px',
        fontWeight: 400,
        lineHeight: '18px',
        color: theme.palette.textSecondary3,
        whiteSpace: 'nowrap',
      },
    },

    groupMetaAlert: {
      '&.MuiTypography-root': { color: theme.palette.textWarning, fontWeight: 500 },
    },

    /* --- Location rows ------------------------------------------------------
     Two columns and no third: the location, then everything it is due. The row is
     as tall as its cards need and no taller, which on a quarterly cadence is one
     row of two-line cards. */
    locationRow: {
      display: 'flex',
      alignItems: 'stretch',
      borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
      '&:hover': { background: '#FCFCFD' },
    },

    locationCell: {
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      flex: '0 0 auto',
      width: `${LOCATION_WIDTH}px`,
      padding: '8px 12px',
      boxSizing: 'border-box',
      borderRight: `1px solid ${theme.palette.borderSubtle1}`,
      minWidth: 0,
    },

    locationName: {
      '&.MuiTypography-root': {
        fontSize: '12px',
        fontWeight: 600,
        lineHeight: '18px',
        color: theme.palette.textPrimary,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        minWidth: 0,
      },
    },

    /**
     * The cadence lives in a tooltip, and this glyph is the only sign of it.
     *
     * It replaced a dotted underline on the name. Any rule under a word in a column
     * of words reads as a link — dotted included — and with one on almost every row
     * the column read as a menu rather than as labels. A mark *beside* the name is
     * the thing you hover, so it can afford to be quiet: 12px, placeholder grey, and
     * it only inks up on hover. `flex: none` so it never gives up its space to the
     * name's ellipsis — an affordance that disappears when the label is long is worse
     * than none.
     */
    locationHint: {
      display: 'flex',
      alignItems: 'center',
      flex: 'none',
      cursor: 'help',
      color: theme.palette.textPlaceholder,
      '&:hover': { color: theme.palette.textSecondary1 },
      '& svg': { width: '12px', height: '12px' },
    },

    visitsCell: {
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      /* 10px, not 6px. At 6px the cards' own fills merged into one band across the
       row and the gap read as a seam inside a single block rather than as the space
       between two visits. */
      gap: '10px',
      flex: 1,
      minWidth: 0,
      padding: '8px 12px',
    },

    visitsCellEmpty: {
      '&.MuiTypography-root': {
        fontSize: '12px',
        lineHeight: '18px',
        color: theme.palette.textPlaceholder,
      },
    },

    /* Grey, not amber, and no copy — matches the matrix view's cell (see the note
       there). The fill is the whole message; a sentence restating "empty row" on
       every unscheduled location was the one thing this view said that the row
       itself, having nothing in it, already said louder. */
    notScheduledCell: {
      flex: 1,
      background: '#FAFAFA',
    },

    /* --- Visit card --------------------------------------------------------
     **Two rows**: when on top, whose round beneath. All four facts used to sit on
     one 26px line, and a wrapped row of them was indistinguishable from a single
     ruled band — the eye had nothing to catch on.

     `flex: 0 1 212px` rather than a fixed width: cards line up like a row when
     there is space and tighten to `minWidth` rather than dropping one card and
     leaving half a row of white when there is not. No `gap` on the card itself
     any more, either: it used to space the body from a status icon pinned
     top-right, and with that icon gone the body is the card's only child —
     nothing left for a gap to separate it from. */
    visitCard: {
      display: 'flex',
      alignItems: 'flex-start',
      flex: '0 1 212px',
      minWidth: '176px',
      maxWidth: '236px',
      padding: '8px 10px',
      borderRadius: '4px',
      boxSizing: 'border-box',
      background: theme.palette.surfaceGreySubtle,
      /* No left accent: this card used to carry one for the duty type (§7.26 was
       about getting its border-shorthand ordering right), the same one the week
       grid's card carried before `calendar.styles.js`'s `visitFill*` classes
       dropped it for a single wash. This view had fallen out of step with that;
       matching it now rather than stating a border the grid's own card no longer
       draws. */
    },

    visitCardClickable: {
      cursor: 'pointer',
      '&:hover': { filter: 'brightness(0.97)' },
    },

    visitCardBody: {
      display: 'flex',
      flexDirection: 'column',
      gap: '4px',
      flex: '1 1 auto',
      minWidth: 0,
    },

    /* The date leads and the window follows it, because the planner scans for a day
     and only then asks what time on it. */
    visitWhen: {
      display: 'flex',
      alignItems: 'baseline',
      gap: '6px',
      minWidth: 0,
    },

    visitDate: {
      '&.MuiTypography-root': {
        flex: '0 0 auto',
        fontSize: '12px',
        fontWeight: 600,
        lineHeight: '16px',
        color: theme.palette.textPrimary,
        whiteSpace: 'nowrap',
        fontVariantNumeric: 'tabular-nums',
      },
    },

    /* 12px, not 11 — the grid's own card runs every line of this card's type at
     one size (`visitSiteName`/`visitTime`/`visitRouteName` are all 12px/16px);
     this was the one line here still a point smaller, from before this card's
     type scale was reconciled against the grid's. Weight and colour are what
     still tell it apart from the bold, dark date beside it — size no longer
     has to do that job too. */
    visitTime: {
      '&.MuiTypography-root': {
        flex: '0 0 auto',
        fontSize: '12px',
        fontWeight: 400,
        lineHeight: '16px',
        color: theme.palette.textSecondary2,
        whiteSpace: 'nowrap',
      },
    },

    /* Row two, and the whole of it — so the route name gets the card's full width
     before it has to clip, which on this book is the difference between "Tuesday
     North" and "Tues…". No `gap` here any more either: it used to separate the
     route icon from the name, and with the icon gone the name sits flush at the
     row's start — level with the date above it rather than indented under it. */
    visitRoute: {
      display: 'flex',
      alignItems: 'center',
      minWidth: 0,
    },

    /* 12px/500/`textPlaceholder` — the grid's own `visitRouteName`, exactly.
     This was 11px/400/`textSecondary2` — a point smaller, a weight lighter, and
     a shade darker than the grid's line for the same fact. `visitRouteUnassigned`
     below inherits this fontSize, so fixing it here is also what brings the
     unassigned state back to the 12px the grid's `visitUnassignedText` uses. */
    visitRouteName: {
      '&.MuiTypography-root': {
        fontSize: '12px',
        fontWeight: 500,
        lineHeight: '16px',
        color: theme.palette.textPlaceholder,
        minWidth: 0,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      },
    },

    /* Same red the grid's card puts on this line (`visitUnassignedText`), and the same
     weight — this is the one line on either card that is a *state* rather than a
     name, so the two must not differ. */
    visitRouteUnassigned: {
      '&.MuiTypography-root': { color: theme.palette.textError || '#B42318', fontWeight: 600 },
    },

    /* --- Status treatments --------------------------------------------------
     Straight from `helper/visitCardInk`, so a state means on this card exactly what
     it means on the week grid's. `visitCardScheduled` carries no fill of its own —
     the amber comes from the shared `notStarted` treatment applied alongside it. */

    /**
     * **Upcoming: no wash at all.** Scheduled, not today, nothing to flag.
     *
     * This is where the great majority of a twelve-month view's cards now land, and
     * that is the point — yellow used to cover them all and so marked nothing (see
     * `visitCardClassFor`). A state worth noticing gets a colour; ordinary future work
     * gets the absence of one, which is what makes the coloured cards legible again.
     *
     * White rather than the card's base `surfaceGreySubtle`, because that grey is
     * already spoken for: it is `UNASSIGNED`'s fill, and an unfilled upcoming chip
     * sharing it would make "no route" and "nothing to report" the same mark.
     *
     * The hairline is an **inset shadow, not a border**. Two reasons. A white chip on
     * a white row has no edge without one, and it needs an edge — it is still a chip,
     * and a strip of packed dates has to read as separate cards. And every filled
     * treatment here carries no border, so a real border on this one variant would
     * spend a pixel of the shared `padding: 3px 8px` and sit a hair smaller than its
     * neighbours; an inset shadow paints inside the box and costs no layout. The
     * ink file's "no border of any style" rule is about *duty accents on filled
     * cards* — this is the unfilled case it never had to describe.
     */
    visitCardUpcoming: {
      background: theme.palette.surfaceGreySubtle,
    },

    visitCardCompleted: FILLS[calendarShiftStatusEnum.COMPLETED],
    visitCardLive: FILLS[calendarShiftStatusEnum.IN_PROGRESS],
    visitCardMissed: FILLS[calendarShiftStatusEnum.MISSED],
    visitCardCancelled: FILLS[calendarShiftStatusEnum.CANCELLED],
    visitCardUnassigned: FILLS[calendarShiftStatusEnum.UNASSIGNED],
    visitCardScheduled: FILLS[calendarShiftStatusEnum.NOT_STARTED],

    /* --- Empty, skeleton, footer -------------------------------------------- */
    empty: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '6px',
      padding: '64px 24px',
      textAlign: 'center',
    },

    emptyTitle: {
      '&.MuiTypography-root': {
        fontSize: '14px',
        fontWeight: 600,
        lineHeight: '20px',
        color: theme.palette.textPrimary,
      },
    },

    emptyBody: {
      '&.MuiTypography-root': {
        fontSize: '12px',
        lineHeight: '18px',
        color: theme.palette.textSecondary3,
        maxWidth: '320px',
      },
    },

    skeletonRow: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      padding: '10px 12px',
      borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
    },

    footer: {
      display: 'flex',
      alignItems: 'center',
      gap: '14px',
      flexWrap: 'wrap',
      flex: '0 0 auto',
      minHeight: '32px',
      padding: '6px 0',
      borderTop: `1px solid ${theme.palette.borderSubtle1}`,
    },

    footerSpacer: { flex: 1 },

    footerCount: {
      '&.MuiTypography-root': {
        fontSize: '12px',
        fontWeight: 500,
        lineHeight: '18px',
        color: theme.palette.textSecondary2,
      },
    },

    /* --- Legend ------------------------------------------------------------- */
    legendItem: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      fontSize: '11px',
      lineHeight: '16px',
      color: theme.palette.textSecondary3,
      whiteSpace: 'nowrap',
    },

    /* The swatch's fill is supplied per item from `visitCardLegend`, so a legend can
     no longer name a colour the cards stopped drawing. Only the frame is here. */
    legendSwatch: {
      width: '10px',
      height: '10px',
      borderRadius: '2px',
      border: `1px solid ${theme.palette.borderSubtle1}`,
      flex: 'none',
    },
  };
});
