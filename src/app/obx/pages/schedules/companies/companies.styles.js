import { makeStyles } from '@mui/styles';
import { calendarShiftStatusEnum } from 'src/utils/constants/schedules';

import { visitCardFills } from '../helper/visitCardInk';

/**
 * Column widths, declared once because the frozen pane's `left` offsets are
 * derived from them — a sticky column has to know what sits to its left.
 */
const COMPANY_WIDTH = 208;
const LOCATION_WIDTH = 248;
const MONTH_WIDTH = 148;

export const COMPANIES_COLUMNS = {
  COMPANY_WIDTH,
  LOCATION_WIDTH,
  MONTH_WIDTH,
  FROZEN_WIDTH: COMPANY_WIDTH + LOCATION_WIDTH,
};

/**
 * The card's status treatments come from `helper/visitCardInk`, not from a private
 * palette here — this view and V1 each kept their own and the two drifted from the
 * week grid they were both copied from. The note in that file has the reasoning,
 * including why these values stay literals rather than brand theme slots.
 */
export const useStyles = makeStyles((theme) => {
  const FILLS = visitCardFills(theme);

  return {
    companiesPane: {
      display: 'flex',
      flexDirection: 'column',
      flex: 1,
      minHeight: 0,
      /* No bespoke rhythm here: the filter bar carries the same `8px 0 12px` the
       scheduler's own toolbar uses, so the two tabs hand over from the tab row at
       exactly the same offset. A `gap` plus a `paddingTop` was 44px of air on a tab
       whose neighbour spends 20px. */
      paddingBottom: '12px',
    },

    /* No `companiesToolbar` of its own any more: the shared `CompaniesFilters` owns
     the row in both states, loading included, so a local copy of its layout could
     only ever drift from it. */
    companiesToolbarSpacer: { flex: 1 },

    /**
     * An open table, not a card. The other listings in this app are not closed
     * containers — they rule rows horizontally and let the page supply the edges.
     */
    companiesTableScroller: {
      flex: 1,
      minHeight: 0,
      overflow: 'auto',
      borderTop: `1px solid ${theme.palette.borderSubtle1}`,
    },

    companiesTable: {
      borderCollapse: 'separate',
      borderSpacing: 0,
      tableLayout: 'fixed',
      width: '100%',
      minWidth: `${COMPANIES_COLUMNS.FROZEN_WIDTH + MONTH_WIDTH * 12}px`,
    },

    /* --- Head --- */
    headCell: {
      '&.MuiTableCell-root': {
        position: 'sticky',
        top: 0,
        zIndex: 3,
        height: '52px',
        padding: '0 20px',
        background: theme.palette.surfaceWhite,
        borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
        borderTop: 0,
        fontSize: '12px',
        fontWeight: 500,
        lineHeight: '18px',
        color: theme.palette.textSecondary2,
        whiteSpace: 'nowrap',
        textAlign: 'left',
      },
    },

    headCellMonth: {
      '&.MuiTableCell-root': {
        width: `${MONTH_WIDTH}px`,
        padding: '0 12px',
        textAlign: 'left',
      },
    },

    /* The first month column lands directly against the frozen pane's own seam
     (`stickyLocation`'s right border), and every header up to that seam runs
     20px of padding — so this one column dropping straight to 12px read as a
     pinch exactly where the eye is comparing the two halves. Left only: the
     right edge keeps the normal 12px rhythm every later month-to-month gap
     uses, so only the seam is rebalanced. */
    headCellMonthFirst: {
      '&.MuiTableCell-root': {
        paddingLeft: '20px',
      },
    },

    headCellCurrent: {
      '&.MuiTableCell-root': { color: theme.palette.textPrimary, fontWeight: 600 },
    },

    /* --- Frozen pane --- */
    stickyCompany: {
      '&.MuiTableCell-root': {
        position: 'sticky',
        left: 0,
        zIndex: 4,
        width: `${COMPANY_WIDTH}px`,
        background: theme.palette.surfaceWhite,
      },
    },

    stickyLocation: {
      '&.MuiTableCell-root': {
        position: 'sticky',
        left: `${COMPANY_WIDTH}px`,
        zIndex: 4,
        width: `${LOCATION_WIDTH}px`,
        background: theme.palette.surfaceWhite,
        /* The seam between what is frozen and what scrolls. */
        borderRight: `1px solid ${theme.palette.borderSubtle2}`,
      },
    },

    /* --- Body --- */
    /**
     * Doubled selector on purpose. `bodyRow` sets `verticalAlign: middle` on every
     * cell it contains, at the same specificity as this rule and earlier in the
     * sheet, so a single `&.MuiTableCell-root` lost and the company name floated to
     * the middle of its group instead of starting it (§7.28).
     */
    companyCell: {
      '&&.MuiTableCell-root': {
        verticalAlign: 'top',
        paddingTop: '12px',
        borderBottom: `1px solid ${theme.palette.borderSubtle2}`,
      },
    },

    /* Compact rows. 80px was sized for a two-line location cell and a two-line card;
     both are one line now, so the height was pure air — and on a book of 46
     locations that air is what forced the whole year off-screen. */
    bodyRow: {
      '& .MuiTableCell-root': {
        height: '44px',
        padding: '4px 12px',
        background: theme.palette.surfaceWhite,
        borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
        verticalAlign: 'middle',
      },
      /* Hover is a row affordance, and the company cell is not part of one row —
       it spans the whole group, so highlighting it implied the pointer was over
       every location under it. */
      '&:hover .MuiTableCell-root:not($companyCell)': {
        background: theme.palette.surfaceGreySubtle,
      },
    },

    groupEndRow: {
      '& .MuiTableCell-root': { borderBottom: `1px solid ${theme.palette.borderSubtle2}` },
    },

    companyName: {
      '&.MuiTypography-root': {
        fontSize: '13px',
        fontWeight: 600,
        lineHeight: '20px',
        color: theme.palette.textPrimary,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      },
    },

    locationName: {
      '&.MuiTypography-root': {
        fontSize: '12px',
        fontWeight: 500,
        lineHeight: '20px',
        color: theme.palette.textSecondary1,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      },
    },

    monthCell: {
      '&.MuiTableCell-root': {
        width: `${MONTH_WIDTH}px`,
        padding: '4px 8px',
        textAlign: 'left',
      },
    },

    /* Same seam as `headCellMonthFirst`, at body-row scale: `bodyRow` runs 12px
     of padding on the Location cell right up to the seam, and this column's
     own 8px picked up immediately after it — the first card in the book sat
     4px closer to the divider than the location name sitting across it. Left
     only, so the month-to-month rhythm after this one column is unaffected. */
    monthCellFirst: {
      '&.MuiTableCell-root': {
        paddingLeft: '12px',
      },
    },

    /* ----------------------------------------------------------------------- *
     * The visit card.
     *
     * Built to the shift card on the service tab — a light fill, one line of type,
     * no left accent (see the fill note below). What differs is what a card on
     * this surface has to say: the column is a whole month wide, so the card
     * leads with its own date and gives the window second billing.
     *
     * It carried the technician as a 16px avatar until review: at that size the mark
     * could say "somebody is on it" and nothing more, which is not a fact worth a
     * fifth of a 148px column when the visit drawer states it in full.
     * ----------------------------------------------------------------------- */
    visitCard: {
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      width: '100%',
      boxSizing: 'border-box',
      padding: '3px 8px',
      borderRadius: '4px',
      /* No left accent: this card used to carry one for the duty type (see the
         note in `helper/visitCardInk`), the same one the week grid's card carried
         before `calendar.styles.js`'s `visitFill*` classes dropped it in favour of
         a single wash. This view had fallen out of step with that; matching it now
         rather than stating a border the grid's own card no longer draws. */
      background: theme.palette.surfaceGreySubtle,
    },

    /* 12px/500 — the grid's own combined date+time line (`eventSiteNameColor` +
     `visitTime`), size and weight exactly. Colour is split now, though: the date
     is the fact a planner scans this cell for, so it keeps the dark headline
     treatment the line used to give both halves; the time is the follow-up
     question asked once the date has answered, so `visitCardTimeText` below takes
     the lighter grey a supporting fact gets elsewhere on this card family.
     `visitCardTime` stays the *wrapping* element — its layout rules (flex,
     ellipsis) still apply to the line as a whole. */
    visitCardTime: {
      '&.MuiTypography-root': {
        flex: 1,
        minWidth: 0,
        fontSize: '12px',
        fontWeight: 500,
        lineHeight: '16px',
        color: theme.palette.textPrimary,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      },
    },

    /* The lighter grey asked for. `textSecondary3` — the palette's lightest named
       grey, several steps up from `textPrimary` above — rather than `textPlaceholder`
       or `textSecondary1`, both of which read as only marginally lighter than the
       date beside them. No font-size/weight rule of its own: it inherits both from
       `visitCardTime`, the wrapping element, and differs only in colour. */
    visitCardTimeText: {
      color: theme.palette.textSecondary3,
    },

    visitCardDot: { color: theme.palette.borderStrong1, margin: '0 2px' },

    /* --- Status treatments --------------------------------------------------
     From `helper/visitCardInk`, the same set V1 and the week grid draw from, so a
     state cannot mean one thing on this view and another on the next. The wash is
     the whole encoding now — no accent — and the fills tint their own text where
     the state calls for it, so nothing is restated per class here. */
    visitCardCompleted: FILLS[calendarShiftStatusEnum.COMPLETED],
    visitCardLive: FILLS[calendarShiftStatusEnum.IN_PROGRESS],
    visitCardMissed: FILLS[calendarShiftStatusEnum.MISSED],
    visitCardCancelled: FILLS[calendarShiftStatusEnum.CANCELLED],
    visitCardUnassigned: FILLS[calendarShiftStatusEnum.UNASSIGNED],
    visitCardScheduled: FILLS[calendarShiftStatusEnum.NOT_STARTED],

    visitCardClickable: {
      cursor: 'pointer',
      '&:hover': { filter: 'brightness(0.97)' },
    },

    /* Grey, not amber. A location with no recurring service is a fact about the book,
       not a fault, and amber running the full width of a row made it the loudest thing
       on a screen whose signal is the cards — on a book of 46 locations the warning
       colour appeared more often than any status it was competing with. Inert grey
       still reads as "no cadence here" against the white cells either side of it.
       Lighter than the row's own `:hover` fill (`surfaceGreySubtle`, #F5F5F6) on
       purpose: a hover is a pointer affordance and has to read as "something is
       under the cursor"; this cell has to read as quieter than that, not the same. */
    notScheduledCell: {
      '&.MuiTableCell-root': {
        background: '#FAFAFA',
      },
    },

    companiesFooter: {
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: '8px 20px',
      flex: '0 0 auto',
    },

    companiesFooterCount: {
      '&.MuiTypography-root': {
        fontSize: '12px',
        fontWeight: 500,
        lineHeight: '18px',
        color: theme.palette.textSecondary2,
      },
    },

    legendItem: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '12px',
      fontWeight: 400,
      lineHeight: '18px',
      color: theme.palette.textSecondary3,
    },

    /* Fill supplied per item from `visitCardLegend`; only the frame lives here, so the
     legend cannot describe a colour the cards no longer draw. */
    legendSwatch: {
      width: '12px',
      height: '12px',
      borderRadius: '3px',
      border: `1px solid ${theme.palette.borderSubtle1}`,
      flex: 'none',
    },

    companiesEmpty: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      padding: '72px 24px',
    },

    companiesEmptyTitle: {
      '&.MuiTypography-root': {
        fontSize: '14px',
        fontWeight: 600,
        lineHeight: '20px',
        color: theme.palette.textSecondary1,
      },
    },

    companiesEmptyBody: {
      '&.MuiTypography-root': {
        fontSize: '12px',
        fontWeight: 400,
        lineHeight: '18px',
        color: theme.palette.textSecondary3,
        textAlign: 'center',
      },
    },

    skeletonRow: {
      display: 'flex',
      alignItems: 'center',
      gap: '20px',
      padding: '0 20px',
      height: '80px',
      borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
    },
  };
});
