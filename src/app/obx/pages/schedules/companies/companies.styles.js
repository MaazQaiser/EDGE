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

/**
 * A pill's width, expanded: it fills its month cell — `MONTH_WIDTH` less that cell's
 * `4px 8px` padding. Derived rather than written as `132`, so it cannot drift the day
 * a column resizes.
 */
const PILL_WIDTH = MONTH_WIDTH - 16;

/**
 * A pill's width, **collapsed: 30% narrower**.
 *
 * The two readings were briefly the same width, which is where this started — a
 * collapsed pill used to hug its own text (~72px including padding) so the same visit
 * was two sizes depending on the reading you were in. Matching the expanded 132px
 * fixed that and immediately cost something else: uniform pills at nearly twice their
 * content width, plus the 8px gap, pushed a monthly-cadence row onto several lines in
 * a strip whose whole purpose is to be shorter than the grid it replaces.
 *
 * So the pills stay uniform — that is what makes the strip read as a series and what
 * lets the gap breathe — but at 70% of the column width rather than all of it. Asked
 * for as "reduce by 30%", and expressed as that arithmetic on `PILL_WIDTH` rather than
 * as the literal `92`, so the relationship survives a change to either number.
 *
 * Still comfortably wider than the content: a `19 Aug '26` chip measured 72px including
 * its padding, so 92px keeps every date on one line with room to spare, and no chip
 * clips or wraps.
 */
const COLLAPSED_PILL_WIDTH = Math.round(PILL_WIDTH * 0.7);

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

    /**
     * Collapsed: **the twelve-column floor comes off.**
     *
     * `minWidth` above is what guarantees every month a readable 148px, and it is
     * also what makes the expanded table 2.2k wide and horizontally scrolled on any
     * normal window. With no month columns left there is nothing to guarantee — the
     * two frozen columns plus one strip of packed cards fit the pane, so the table
     * is allowed to be exactly as wide as the pane and the horizontal scrollbar
     * goes away with the axis. That is half of what "collapsed" buys.
     *
     * `tableLayout` stays **fixed**. Switching it to `auto` was the obvious-looking
     * move — let the strip take what it needs — and it was wrong twice over: `auto`
     * treats the `colgroup` widths as suggestions, so the two frozen columns
     * compressed to fit their text (208px of company became ~145px), and
     * `stickyLocation` positions itself at a hard `left: 208px` derived from the
     * width the column no longer had. Fixed layout gives the one unsized column the
     * remainder by definition, which is exactly the ask, and keeps the frozen pane
     * the width its offsets assume.
     */
    companiesTableCollapsed: {
      minWidth: 0,
    },

    /* --- Head --- */
    /**
     * **The scheduler's own column header, matched.**
     *
     * Every other reading on this page — Routes, Visits, the per-service tabs — heads
     * its resource column through two rules in `calendar.styles.js`: the cell is
     * `[role="columnheader"]` at a hard **36px**, and the label inside it is
     * `resourceColumnHeaderInner` at **14px / 500 / `textPrimary`**. This header was
     * 52px of 12px `textSecondary2`, so switching to Companies dropped the heading a
     * size and two shades lighter and grew the row 16px taller in the same click.
     * Reported directly, against all three toggle positions side by side.
     *
     * Copied in values rather than imported, for the reason this whole sheet already
     * gives: the scheduler's version is bound to FullCalendar's own header skeleton and
     * to the `classes` object the calendar threads down, neither of which exists for a
     * plain `<table>`. Keep them in step by hand — the two are meant to read as one
     * screen, not as two headers that happen to match today.
     *
     * **Horizontal padding is the one value that does not copy.** The reference runs
     * 8px, matching the label cushions in its own rows; this table's body cells run
     * 12px (`bodyRow`), and a header has to line up with the column under it before it
     * lines up with another view. It was 20px, which lined up with neither — the
     * heading sat 8px right of every name beneath it.
     */
    headCell: {
      '&.MuiTableCell-root': {
        position: 'sticky',
        top: 0,
        zIndex: 3,
        height: '36px',
        padding: '0 12px',
        background: theme.palette.surfaceWhite,
        borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
        borderTop: 0,
        fontSize: '14px',
        fontWeight: 500,
        lineHeight: '20px',
        color: theme.palette.textPrimary,
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

    /**
     * **A no-op now, and left in place deliberately.**
     *
     * It added 20px of left padding to the first month column, to stop it reading as a
     * pinch against the frozen pane's seam — which was a fault of `headCell` running
     * 20px while `headCellMonth` ran 12px. `headCell` is 12px now, so the whole row
     * shares one inset and there is no seam to rebalance.
     *
     * Kept rather than deleted because the only branch that applies it is the expanded
     * month axis, which no reading currently reaches (see `collapsed` in `./index`).
     * Deleting it would mean editing a `months.map` nobody can see to prove a style
     * nobody can see; restating it as 12px would be the same value twice. If the axis
     * comes back, take this and its `className` with it.
     */
    headCellMonthFirst: {},

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

    /**
     * The collapsed row's single cell, and the strip of cards inside it.
     *
     * `flexWrap` rather than a nowrap run with its own scroller: a location on a
     * monthly cadence has twelve cards, and twelve of these do not fit beside two
     * frozen columns on a laptop. Wrapping lets that one row grow to two lines while
     * every quarterly row beside it stays on one — which is the whole point of
     * dropping the axis, since a fixed grid has to be as wide as its worst row.
     *
     * 4px between cards, against the expanded reading's 8px cell padding. Cards in
     * the grid are separated by a column boundary and can afford to sit loose in it;
     * here adjacency is the only thing telling the reader these belong to one row,
     * so they close up. `alignItems: center` keeps a wrapped second line hanging off
     * the same baseline rhythm as the location name across from it.
     */
    collapsedCell: {
      '&.MuiTableCell-root': {
        padding: '4px 12px',
        textAlign: 'left',
      },
    },

    collapsedStrip: {
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      /* 8px, which is `monthCell`'s own horizontal padding — the step a reader already
         sees between chips in adjacent month columns, so the two readings space their
         pills alike. It was 4px on the reasoning that tight spacing was what grouped a
         run of variable-width pills into one row; with every pill now the same width
         that rhythm does the grouping, so the gap can breathe. */
      gap: '8px',
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
     * no left accent (see the fill note below). What differs is what a card on this
     * surface has to say: one date, in `D MMM 'YY`, and nothing else. It said the
     * clock window too until review, and carried the technician as a 16px avatar
     * before that; both were facts the visit drawer states in full, spending width
     * on a card whose whole job is to be scanned twelve-to-a-row.
     *
     * `width: 100%` is why the collapsed reading has to override it — a card in a
     * month cell *is* that month, and stretching to fill it is what makes the grid
     * read as a grid. See `visitCardPacked`.
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

    /* 12px/500 — the grid's own date line (`eventSiteNameColor` + `visitTime`), size
     and weight exactly, in the dark headline treatment: the date is now the only
     thing on the card, and it is the fact a planner scans this cell for.
     It was a two-colour line while the clock window followed the date — the split
     went when the window did, along with `visitCardTimeText` and the dot between
     them. Name kept: it is still the class every consumer of this card family
     names, and renaming it buys nothing a reader of one file can see. */
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

    /* --- Status treatments --------------------------------------------------
     From `helper/visitCardInk`, the same set V1 and the week grid draw from, so a
     state cannot mean one thing on this view and another on the next. The wash is
     the whole encoding now — no accent — and the fills tint their own text where
     the state calls for it, so nothing is restated per class here. */

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

    /* ----------------------------------------------------------------------- *
     * The card's tooltip.
     *
     * Four short lines rather than one run-on string, because they answer four
     * separate questions and a reader is looking for one of them. MUI's tooltip has
     * no opinion about multi-line content beyond its own padding, so the stack and
     * the type steps are stated here.
     *
     * Type is a step *down* from the card (11px against 12px) and the date line is
     * the only bold thing in it — a tooltip that shouts competes with the grid it is
     * floating over.
     * ----------------------------------------------------------------------- */
    visitTooltip: {
      display: 'flex',
      flexDirection: 'column',
      gap: '2px',
    },

    /**
     * `color: inherit` is **load-bearing**, on both of these.
     *
     * These lines are `Typography`, and Typography does not inherit its colour — it
     * applies the theme's own `text.primary`, which is near-black for the white page
     * this app is built on. Inside MUI's tooltip, which paints itself a dark grey and
     * sets white on its own root, that produced a **solid black box with no readable
     * text in it**: four lines of dark type on a dark surface. Every one of these
     * tooltips was affected, so it read as the tooltip being broken rather than as a
     * colour bug.
     *
     * Inheriting hands the job back to `.MuiTooltip-tooltip`, which is the only thing
     * that knows what it painted behind this text. Do not name a colour token here —
     * any token chosen for the page surface is wrong on the tooltip surface, which is
     * exactly how this broke.
     */
    visitTooltipDate: {
      '&.MuiTypography-root': {
        fontSize: '12px',
        fontWeight: 600,
        lineHeight: '16px',
        color: 'inherit',
        whiteSpace: 'nowrap',
      },
    },

    /* Same inherit, and `opacity` rather than a second colour for the step down —
       one less thing that can be wrong against a surface this sheet does not own. */
    visitTooltipLine: {
      '&.MuiTypography-root': {
        fontSize: '11px',
        fontWeight: 400,
        lineHeight: '16px',
        color: 'inherit',
        opacity: 0.85,
        whiteSpace: 'nowrap',
      },
    },

    visitCardClickable: {
      cursor: 'pointer',
      '&:hover': { filter: 'brightness(0.97)' },
    },

    /**
     * Same card, sized by its own content instead of by its column.
     *
     * `visitCard` takes `width: 100%` because a card in a month cell *is* that
     * month — stretching to fill it is what makes the grid read as a grid. In the
     * strip that rule gives every card the full row and the flex row wraps each onto
     * its own line, which is a vertical list wearing a horizontal layout's clothes.
     *
     * **Declared after `visitCard`, deliberately.** Both rules are one class deep on
     * the same element, so specificity is a tie and JSS resolves it by source order:
     * written above `visitCard` — where it first went, beside the cell classes it
     * belongs with conceptually — the `width: 100%` won and the strip stacked. Do not
     * move this block up the sheet.
     */
    visitCardPacked: {
      width: `${COLLAPSED_PILL_WIDTH}px`,
      flex: '0 0 auto',
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
