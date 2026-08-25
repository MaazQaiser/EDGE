import fcClass from '@fullcalendar/react/protected-styles';
import { makeStyles } from '@mui/styles';
import {
  DUTY_ACCENT_BLUE,
  statusFillInProgressRule,
  statusFillNotStartedRule,
  visitFillInProgressRule,
} from 'src/app/components/common/calendar/calendarStatusWash';

/**
 * The wash behind today's column.
 *
 * A literal rather than `surfaceGreySubtle`, which is the palette's lightest grey at
 * `#F5F5F6` and still too present here: it is the fill this app uses for a *hovered*
 * or *inactive* surface, and spending it on a whole column made the current day look
 * disabled — a greyed-out lane running the height of the grid, competing with the
 * cards inside it. This is a hair above it, enough to locate the column against
 * white and not enough to read as a state. The green rule along its top is what
 * actually marks the day; this only has to carry it downward.
 *
 * Declared once because the header slot and the body lanes are styled by separate
 * rules in separate blocks, and a column whose head and body are two different greys
 * reads as a seam.
 */
const TODAY_COLUMN_WASH = '#FBFBFC';

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
  /* Fences the leading view control off from the filter run beside it. `stretch`
     rather than a fixed height so the rule matches whatever the row's tallest
     control turns out to be, and `flex: '0 0 auto'` so a wrapping row never
     collapses a 1px element to nothing. */
  calendarHeaderToolbarLeadingDivider: {
    width: '1px',
    alignSelf: 'stretch',
    flex: '0 0 auto',
    background: theme.palette.borderSubtle1,
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
  /* --- the date navigator -------------------------------------------------
     One control, built to the same recipe as the `Day | Week | Month` group it sits
     beside (`calendarHeaderToolbarToggle`): a 32px bordered shell, 2px of inset, and
     28px segments rounded to 6px inside it. It read as three loose ghost buttons and
     a floating date because the shell had an 8px gap and no padding — the chevrons
     touched the border, and the rule in front of `Today` sat 8px away from the
     control it was meant to divide. The parts have not changed; what they add up to
     has. */
  calendarHeaderToolbarLeft: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '2px',
    border: `1px solid ${theme.palette.borderSubtle1}`,
    borderRadius: '8px',
    height: '32px',
    padding: '0 2px',
    boxSizing: 'border-box',
    // Beside the filter row this must keep its width rather than be squeezed by it.
    flex: '0 0 auto',
    background: theme.palette.surfaceWhite,
  },

  calendarHeaderToolbarLeftText: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
      /* Wide enough for the longest label the three views produce — a week that
         straddles two months ("Sep 26 – Oct 2, 2026") is longer than either
         "August 15, 2026" or "September, 2026" — so switching view does not resize
         the control. It is a floor, not a clamp: the label is never truncated. */
      minWidth: '148px',
      padding: '0 4px',
      textAlign: 'center',
      whiteSpace: 'nowrap',
      /* Stepping a week changes the digits, and proportional digits change their
         width with them — the label and both chevrons shifted on every click. */
      fontVariantNumeric: 'tabular-nums',
    },
  },

  /* Wraps the date-range label so it can open the date-picker popover. Kept as a
     plain reset rather than a styled Button — the label's own look (color, width,
     tabular numerals) is set by `calendarHeaderToolbarLeftText` on the Typography
     inside and must not change; this only adds the hover/click affordance around
     it, the same hairline-free hover wash the toggle buttons use. */
  calendarHeaderToolbarLeftTextTrigger: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid transparent',
    borderRadius: '6px',
    padding: 0,
    background: 'none',
    cursor: 'pointer',
    font: 'inherit',
    '&:hover': {
      backgroundColor: theme.palette.surfaceGreySubtle,
    },
  },

  calendarHeaderToolbarDatePickerPopover: {
    '& .MuiPopover-paper': {
      marginTop: '4px',
      borderRadius: '8px',
      border: `1px solid ${theme.palette.borderSubtle1}`,
      boxShadow:
        '0px 4px 6px -2px rgba(16, 24, 40, 0.05), 0px 12px 16px -4px rgba(16, 24, 40, 0.10)',
      '& .MuiPickersDay-root.Mui-selected': {
        backgroundColor: theme.palette.surfaceBrand,
      },
    },
  },

  calendarHeaderToolbarLeftAction: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',

    '&.MuiButtonBase-root': {
      width: '28px',
      height: '28px',
      minWidth: '28px',
      padding: '0',
      borderRadius: '6px',
    },
    '& svg': {
      width: '8px',
      height: '14px',
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
  /* The row label sets the floor on row height — a lane holding one two-line card
     is shorter than this cushion, so 56px of label decided how tall every row was.
     36px still clears the two lines it holds (15px + 15px) and hands the saving to
     the rows themselves. */
  resourceLabelContent: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: '2px',
    minHeight: '36px',
    // Match v6 datagrid cushion padding (classic theme no longer provides it).
    padding: '6px 8px',
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
    // Floored by the 34px avatar rather than by a round number.
    minHeight: '38px',
    minWidth: 0,
    maxWidth: '100%',
    overflow: 'hidden',
    padding: '6px 8px',
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
    minHeight: '36px',
    padding: '6px 8px',
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
  /* --- visit card text ---------------------------------------------------
     One type size for the whole card, because that is what every other card on
     this calendar does: a shift card is three lines of `subtitle4` (10px/12px,
     weight 500) and it differentiates them with **colour and weight**, not with
     three font sizes. The visit card used to run 10 / 12 / 11px, which made it
     the loudest object on a grid where it is the smallest unit of work.

     What survives from the old scale is the *hierarchy* — time and site read as
     the subject, the route reads as supporting detail — now expressed the way
     the standard expresses it.

     Bumped one notch (10px/12px → 11px/14px) once the card dropped to two lines
     (icons and the runsheet line are gone): there is height to spare that used
     to belong to a third row, so it goes to legibility instead. Still scoped
     here rather than raised on the shared `subtitle4` variant, which the rest
     of the app's cards still rely on at its original size. */
  visitSiteName: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
      fontSize: '12px',
      // Weight, not size, separates the card's subject from its supporting line.
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
  /* Time is the one thing a visit card can never usefully truncate. Sized
     explicitly, rather than left to inherit `subtitle4`'s 10px default, so it
     grows in step with the rest of the card's text instead of reading small
     next to it. */
  visitTime: {
    '&.MuiTypography-root': {
      fontSize: '12px',
      lineHeight: '16px',
      whiteSpace: 'nowrap',
      flex: '0 0 auto',
    },
  },
  /* The card's third line: which route is coming for this visit. Same size and
     colour as the shift card's officer and vehicle lines (`reassignedName`), so
     the two cards read as one family. It ellipsizes — unlike the state label it
     replaced, which wrapped, because a truncated *state* reads as a different
     state whereas a truncated route name is still recognisably that route, and
     the full name is one hover (or one click into the drawer) away.

     No longer drawn on this card itself — the runsheet line was removed — but
     kept in step with its siblings' size for the other cards still reading it. */
  visitRouteName: {
    '&.MuiTypography-root': {
      color: theme.palette.textPlaceholder,
      fontSize: '12px',
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
     colour at equal specificity whichever order JSS emits them in.

     Relocated to the card's header (top-right, beside the time) now that the
     footer it used to sit in is gone — an assigned visit no longer draws a
     footer at all, so there is nowhere left for this to live but the header
     it now shares with the preferred-day mark. */
  visitUnassignedText: {
    '&&.MuiTypography-root': {
      color: theme.palette.textError || '#B42318',
      fontSize: '12px',
      fontWeight: 600,
      lineHeight: '16px',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
  },
  /* The filters-to-replace count, trailing the site name on the right and set
     off from it by a leading middle dot (`· 8`) — the same separator glyph
     used wherever this codebase pairs two short facts on one line. A bare
     number after the dot, so it stays set apart from the site name by colour
     and weight alone, never by appending a unit to the text itself. Does not
     shrink: the site name is the line's subject and gives way first. */
  visitFilterCount: {
    '&.MuiTypography-root': {
      color: theme.palette.textPlaceholder,
      fontSize: '12px',
      fontWeight: 600,
      lineHeight: '16px',
      flexShrink: 0,
      whiteSpace: 'nowrap',
    },
  },
  /* The site-name line's own row — no longer sharing `reassignedFooterFlex`
     with the shift cards' officer/route lines, so its gap can grow independent
     of theirs. A bit more air than the 4px those cards use, now that the line
     only ever holds two short facts (site name, filter count) rather than an
     icon plus a name. */
  visitSiteLine: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  /* The status mark, in the trailing corner where every other card on this
     calendar carries it. The icons are drawn at 20px intrinsic and the shift
     card's 16px footer row squeezes them to 14; a visit card had no such row, so
     the same icon rendered at 20px in the header and pushed the card 8px taller
     than its neighbours. The size is stated here rather than inherited.

     Its one caller is the **month chip**, which draws it for the unrouted state
     only (`VisitMonthChipContent`). 14px rather than the 11px the month's
     aggregate cell squeezes the same glyph to, because this is the *card's*
     status mark and the chip's whole aim is that a visit look like itself in the
     week and the month alike. It fits the chip's 16px line box, so nothing grows.
     `marginLeft` is not here — where the mark sits is the container's business,
     and `visitMonthChip` states it. */
  visitStatusIcon: {
    display: 'flex',
    alignItems: 'center',
    flexShrink: 0,
    '& svg': {
      width: '14px',
      height: '14px',
    },
  },
  /* The leading glyph on the tour and runsheet lines, in the same 10px slot the
     shift card gives its runsheet and vehicle icons.

     Two things are stated here that used to be left to the glyph.

     The **slot is a fixed 12px box** rather than shrink-wrapped around whatever is
     inside it. The site line sits directly above the route line, so their text has
     to start at the same x; a pin and a runsheet badge do not carry the same amount
     of ink, and letting each line size its own icon stepped the two apart.

     The **colour is declared**, because FullCalendar's classic theme puts
     `color: var(--fc-event-contrast-color)` — white — on the inner element that
     wraps every block event's content. The card's text survives that because each
     Typography here names its own colour, and the runsheet and unassigned marks
     survive it because they are inline SVGs with stroke and fill baked into the
     file. A MUI icon paints with `fill: currentColor`, so it inherited that white
     and disappeared on a white card. Nothing was overriding the size; the pin was
     being drawn, in the one colour the card is. */
  visitRouteIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    width: '12px',
    height: '12px',
    color: theme.palette.textPlaceholder,
    '& svg': {
      width: '10px',
      height: '10px',
      flexShrink: 0,
    },
  },
  /* The pin, on the site line of a company-grouped card. A MUI glyph inks about
     four fifths of its box where the runsheet badge fills its own edge to edge, so
     12px here is what reads the same size as the 10px badge on the line below.
     Doubled so it beats `visitRouteIcon`'s `& svg` at equal specificity whichever
     order JSS emits them in. */
  visitSiteIcon: {
    '&& svg': {
      width: '12px',
      height: '12px',
    },
  },
  /* What this card *is*, top-right of the header row: the hit's own name next to
     the vehicle glyph, exactly as a hit card carries it on the site schedule
     ("Hit 1", "Morning visit"). It yields before the time does — a clipped time
     is unreadable, a clipped name is still recognisable and the drawer has it in
     full. */
  visitTypeLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '3px',
    minWidth: 0,
    flex: '0 1 auto',
    overflow: 'hidden',
    '& svg': {
      width: '11px',
      height: '11px',
      flexShrink: 0,
    },
  },
  visitTypeLabelText: {
    '&.MuiTypography-root': {
      color: theme.palette.textPlaceholder,
      fontSize: '12px',
      fontWeight: 500,
      lineHeight: '16px',
      minWidth: 0,
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
  },
  /* The preferred day, when the visit is *not* on it. Same amber as a site that has
     fallen off the schedule (`visitsRowNotScheduled`), because both say the same kind
     of thing: the plan and the customer's expectation have come apart. Grey when the
     day is honoured — the line still confirms the constraint, quietly.
     Doubled selector so it beats `visitTypeLabelText` at equal specificity whichever
     order JSS emits them in. */
  visitOffPreferredDay: {
    '&&.MuiTypography-root': {
      color: '#B54708',
      fontWeight: 600,
    },
  },

  /* ------------------------------------------------------------------ *
   * Visit card fills — the status wash, and nothing else.
   *
   * A visit *is* a patrol hit, so its card used to also carry a left accent
   * (duty type) and a status badge; both are gone now — the wash alone
   * carries the state, so the card has no border and no bottom-right mark.
   * `helper/visitState.js` maps state → status → class.
   *
   * The hues are the calendar's legend, read off the shift cards: amber not
   * started · blue in progress · green completed · red missed · grey
   * cancelled (struck through) · plain grey when nothing has claimed the
   * visit yet. Missed and cancelled used to be hatched rather than flat; both
   * are flat fills now.
   *
   * **Why these are literal hexes and not the `duty*Bg` classes.** `dutyBlueBg`
   * resolves to `surfaceBrandSubtle` and `dutyBlue` to `borderBrand`, which is
   * *green* on Filter Go — so borrowing the in-progress wash from the theme
   * would paint a live visit the same colour as a completed one (§7.25). The
   * wash has to mean one thing on both tenants, so it is stated outright.
   *
   * `borderLeft: none !important` on every fill here beats `dutyBlue` (and
   * siblings) at the call site — those classes still carry a border-left for
   * every other card on this calendar, but the visit card no longer shows it.
   * ------------------------------------------------------------------ */

  /* Routed and not begun — the same amber a not-started shift takes
     (`dutyYellowBg`, whose value is this literal). Most of a planned week is
     this card, which is why it is a wash and not a colour. */
  visitFillNotStarted: {
    background: '#FFF7E1 !important',
    borderLeft: 'none !important',
  },

  /* On a route that has left. Semantic blue rather than `dutyBlueBg` — see the
     tenant note above. The declaration comes from `calendarStatusWash.js`, which is
     now the single statement of this wash: the shift/V2 card's
     `statusFillInProgress` below and the Companies views' `visitCardFills` read the
     same value, so the three surfaces cannot drift to three blues. */
  visitFillInProgress: visitFillInProgressRule,

  /* Done, and the quietest card on the grid: it needs no action, so it should
     not compete with the ones that do. `surfaceSuccessSubtle` is the same fill a
     completed shift takes, and it means success rather than brand, so it is safe
     on both tenants. */
  visitFillCompleted: {
    background: `${theme.palette.surfaceSuccessSubtle} !important`,
    borderLeft: 'none !important',
    '& .MuiTypography-root': {
      color: `${theme.palette.textSecondary1} !important`,
    },
  },

  /* Planned and did not happen. Flat red rather than hatched. */
  visitFillMissed: {
    background: '#FEE4E2 !important',
    borderLeft: 'none !important',
  },

  /* Void, not absent — a cancelled visit stays on the grid so the gap in a site's
     service history is visible, but nothing about it invites action. Flat grey
     with a strike-through, rather than the hatch a cancelled dedicated shift
     still gets (`cancelledDedicatedCard`). */
  visitFillCancelled: {
    background: '#F6F7F9 !important',
    borderLeft: 'none !important',
    '& .MuiTypography-root': {
      textDecoration: 'line-through',
      color: `${theme.palette.textSecondary3} !important`,
    },
  },

  /* Nothing has claimed it yet — no route, or no tour to route. The plain card
     fill, because *unassigned is not a status the schedule tints*: a shift with
     no officer gets no wash either. The red sits on the `Unassigned` line
     itself, and the grid pins these cards into their own red-ruled band besides. */
  visitFillUnrouted: {
    background: `${theme.palette.surfaceGreySubtle} !important`,
    borderLeft: 'none !important',
  },

  /* Inserted into a route that had already left. It is in progress like any
     other live stop, so it takes that wash. It used to also carry a dashed
     accent border to mark the insert, but the visit card has no border at all
     now, so there is nothing left for this class to override — kept as a
     documented no-op rather than removing the call site's reference to it. */
  visitAccentInserted: {},

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

    /* --- today ------------------------------------------------------------
       The month grid had no today at all. FullCalendar does mark its own — the
       classic theme's `fc-classic-hbn`, which this file paints at 30% of #F5F5F6
       further down — and at that strength against a white cell it is not a mark,
       it is a rounding error. Two things are wrong with leaving it as the answer:
       it cannot be seen, and it is computed in the *browser's* timezone, so for a
       planner working a franchise several hours away it is on the wrong square.

       So FC's own is cleared wherever the franchise disagrees, and the mark is
       hung off `data-schedule-today`, which `ScheduleCalendarGrid` stamps from
       `dayjsWithTimezone()` — the same marker-plus-`:not()` pairing the week
       header already uses for exactly this reason (see `tableHeaderSticky`).

       **Same grey as the week column, not a second green.** This used to paint
       a solid brand-green pill around the date number while leaving the cell
       itself white, reasoned from a fear a whole-cell wash would put a
       completed-visit colour behind a day's stack. Grey does not carry that
       risk the way brand green did — it is not one of this calendar's status
       hues, and the chips sit opaque on top of it regardless of whether a
       given chip is filled or outlined, so a wash behind them was never really
       the danger; a *green* wash specifically was. So today gets exactly what
       the week view already gives it — `TODAY_COLUMN_WASH`, the same faint
       grey, not a second brand treatment — and the date number takes the week
       header's own touch, bold and dark, nothing more (`calendarHeaderCellToday`
       states the identical rule). */
    '& [role="gridcell"][data-date][aria-current="date"]:not([data-schedule-today])': {
      background: 'transparent !important',
      boxShadow: 'none !important',
    },
    '& [role="gridcell"][data-schedule-today]': {
      background: `${TODAY_COLUMN_WASH} !important`,
      boxShadow: `inset 0 2px 0 ${theme.palette.brandSecondaryLight} !important`,
    },
    [`& [role="gridcell"][data-schedule-today] > .${fcClass.rel} > *`]: {
      color: `${theme.palette.textPrimary} !important`,
      fontWeight: 600,
    },
  },

  /**
   * The month of the company grouping, where a cell holds visits rather than a
   * tally of them.
   *
   * **And now the routes reading's month too**, which stacks route chips in the same
   * way for the same reason — see `isStackedMonthView` in `ScheduleCalendarGrid.jsx`.
   * Every rule below is about a cell holding *a stack of records* rather than a single
   * line, so none of it is specific to visits; the name is kept because renaming it
   * would be churn across this sheet's cross-references, not because it is accurate.
   *
   * `monthGridCompact` stops month rows stretching, and its reasoning holds for the
   * grid it was written against: a counting cell is one line, and a row stretched to
   * a fifth of the viewport left 120px of white under it. That reasoning does not
   * transfer to this grid. A cell here stacks up to three chips and a "+N more"
   * link, so it has four lines of content to hold, and a row sized to its contents
   * came out 62px tall — five of them ended the table a third of the way down the
   * page with the rest of the scrollport white below it, while the chips inside
   * them were packed edge to edge with nothing between them.
   *
   * So this grid is sized to the port and not to its contents, which is also where
   * the space between the chips comes from. Three rules do it:
   *
   * - **The port is filled.** The caller passes `monthFillsScrollport`, so the
   *   shell asks FullCalendar for a `100%` month rather than an `auto` one and
   *   there is finally height to divide.
   * - **Weeks are equal.** `flex: 1 1 0` — a zero basis, not the content basis
   *   `monthGridCompact` forces, so the port is divided evenly instead of being
   *   handed out on top of whatever each week happens to hold. A calendar whose
   *   rows change height by how busy they are is a calendar that moves under the
   *   planner as they page through it.
   * - **There is a floor.** Below about 116px a cell cannot hold the day number,
   *   three chips and the more-link, so past that point the grid scrolls instead
   *   of crushing. `!important` is not decoration here: FullCalendar's own
   *   `liquid` class is on every day cell and carries `min-height: 0 !important`,
   *   which is why the floor this replaces — 112px, no `!important` — had never
   *   once applied.
   *
   * **These rules beat `monthGridCompact` on source order, not on specificity** —
   * the two classes land on the same element with identical selectors, and this one
   * is declared second. Keep it below `monthGridCompact` in this object.
   */
  visitsMonthChipGrid: {
    '& [role="row"]': {
      flexGrow: '1 !important',
      flexBasis: '0 !important',
    },
    '& [role="gridcell"][data-date]': {
      minHeight: '116px !important',
      /* This padding insets the cell's own box — which is what the day number
         sits in directly, so it does move over 8px — but it is *not* what the
         chip stack sits in. FullCalendar absolutely-positions the whole event
         stack (`fakeBorderS`/`abs`, one layer up from each event's own harness)
         against the cell's raw column width, outside this element's padding
         box entirely; a cell's CSS padding was never going to reach something
         positioned relative to an ancestor above it. The chip's actual inset
         is the `margin` on `internalEvent` just below — read that comment
         before assuming this rule controls the chips too.

         `!important`, the same reason `minHeight` above needs it: FullCalendar's
         own `liquid` class sits on every day cell and ships its own padding
         alongside that `min-height: 0 !important` — a plain declaration here
         loses to it silently, which is exactly what happened to this rule's
         first pass (4px, no `!important`, never visibly applied). */
      padding: '8px !important',
    },

    /* The day number. Not sharing an edge with the chips below it any more by
       virtue of this padding alone — see the note above — but it lines up
       with them in practice because both this and `internalEvent`'s margin
       resolve to the same 8px. */
    [`& [role="gridcell"][data-date] > .${fcClass.rel}`]: {
      paddingTop: '4px',
      paddingBottom: '2px',
    },

    /* The chip's actual inset, and the gap between stacked chips.
       Both live here rather than on the chip itself because FullCalendar
       absolutely-positions this element — one per event, computing its own
       `top` by measuring the stack — against the cell's raw column width, a
       box the cell's own `padding` above never reaches (see that rule's
       comment). `margin` on a block box with a JS-driven `width: auto` shrinks
       what it actually occupies inside that column, which is what padding on
       an ancestor could not do here — this is the only rule capable of moving
       the chip in from the cell's edge at all, not merely the one that happens
       to state the number.

       The doubled class is what gets past the `margin: 0 !important` the
       shared `calendar` block puts on every FC event to strip its default
       chrome — same specificity, later in the sheet, so only a stronger
       selector wins. */
    [`& .${fcClass.internalEvent}.${fcClass.internalEvent}`]: {
      margin: '0 8px 4px !important',
    },

    /* The overflow link, which until now nobody had seen: no day in the demo month
       held more than three visits, so FullCalendar's own classic styling for it —
       16px, its own blue, its own hover — had never been on screen to disagree with
       anything. Drawn as what it is: the last line of a stack of chips, in the
       chips' type, indented to their text so the column of times still reads
       straight down past it. */
    [`& .${fcClass.internalMoreLink}`]: {
      alignItems: 'center',
      margin: '2px 0 0',
      padding: '2px 6px 2px 9px',
      borderRadius: '4px',
      color: theme.palette.textSecondary1,
      fontSize: '12px',
      fontWeight: 600,
      lineHeight: '16px',
      '&:hover': {
        background: theme.palette.surfaceGreySubtle,
        color: theme.palette.textPrimary,
      },
    },
  },

  /**
   * The day popover the "+N more" link opens.
   *
   * Global, and it has to be: FullCalendar portals this into `document.body`, so it
   * is not a descendant of the calendar and no nested rule in this sheet can reach
   * it. That also means it inherits none of the `--fc-classic-*` values this file
   * sets on `.fc`, and falls back to the shipped `:root` palette instead — a #ddd
   * hairline, 16px type and a stock shadow, which is the classic theme wearing none
   * of this app's clothes.
   *
   * The hooks are the popover's own `role`/`data-date` plus FullCalendar's internal
   * layout classes, read from `protected-styles` rather than typed out: v7 hashes
   * class names per build and the classic theme's own names change with it, so a
   * literal `.fc-classic-…` here would be a rule that silently stops matching.
   *
   * **Padding, and margin, not a shared border.** Being portalled to `document.body`
   * cuts both ways: it also means `visitsMonthChipGrid`'s own spacing rules — the
   * cell's padding, and the `margin` it puts on each `internalEvent` — never reach
   * in here, because both require a `.visitsMonthChipGrid` ancestor this popover
   * doesn't have. Nothing filled that gap, so the busiest day on the grid — the one
   * this popover exists for — opened onto its chips packed flush against each other
   * and against the popover's own edge.
   *
   * This rule's own first attempt at the fix assumed the row list was a flex column
   * and reached for `gap` on the body wrapper — it is not one. FullCalendar nests an
   * extra `display: block` wrapper between the body and the row list (confirmed by
   * walking the live DOM, not by reading the theme's source), so that `gap` had
   * nothing to space: it had exactly one flex child. Rows are still `display: block`
   * siblings that only ever respond to their own `margin`, which is why the fix
   * below restates the grid's own `internalEvent` margin instead of zeroing it. */
  '@global': {
    [`[role="dialog"][data-date].${fcClass.internalPopover}`]: {
      /* **260/360, up from 220/280.** A visit chip here is `Company · Site`, and at 280
         the chip measured 230px — enough to truncate *both* halves at once
         (`Downtown Hol… · Fairmont Office …`), which is the one width where the pattern
         stops working: a reader can identify a visit from either half alone, and neither
         survived. The popover floats free of the grid's column width, so nothing forced
         it to stay near a cell's size. 360 is still comfortably inside the narrowest
         viewport this grid supports. */
      minWidth: '260px',
      maxWidth: '360px',
      borderRadius: '10px',
      border: `1px solid ${theme.palette.borderSubtle1}`,
      background: theme.palette.surfaceWhite,
      boxShadow: '0 12px 24px -6px rgba(16, 24, 40, 0.14), 0 4px 8px -4px rgba(16, 24, 40, 0.08)',
      fontSize: '12px',
      overflow: 'hidden',

      /* The header — the date, and the close button classic positions absolutely
         inside it. Sized like the grid's own headers rather than like body copy;
         at the inherited 16px it was the largest text on the screen.

         **No grey band.** The classic theme's own `dayHeaderClass` only adds
         `background-color: var(--fc-classic-muted)` when `info.inPopover` is
         true — this wash is manufactured for this one spot, it is not something
         the grid's day headers carry too. `.fc` already neutralises
         `--fc-classic-muted` to `transparent` for exactly this reason (see the
         `calendar` block further down this file), but a variable set on `.fc`
         can no more reach this portal than the event colours below can, so the
         one place that wash still fires is the one place nothing here had yet
         cleared it. Cleared outright rather than chasing the variable, since
         this is the only rule that ever reads it.

         **No divider either, on request.** classic's own `borderOnlyB` class
         ships a `1px solid` bottom border on this element — the line this
         file used to restate in FilterGo's own hairline colour instead of
         classic's `#ddd`. Dropped to `none` outright now: the ask was to
         remove the seam between the date and the chip list, not recolour it.
         The header's own bottom padding drops from 10px to 8px to match the
         body wrapper's padding below it, so the header still reads as its own
         band of whitespace above the list rather than fusing into one block —
         verified live, not just by the numbers, since padding alone doesn't
         guarantee that reads right without the line there to confirm it. */
      [`& > .${fcClass.flexCol}.${fcClass.borderOnlyB}`]: {
        padding: '12px 12px 10px',
        backgroundColor: 'transparent',
        borderBottom: 'none',
        color: theme.palette.textPrimary,
        fontSize: '14px',
        fontWeight: 600,
        lineHeight: '18px',
      },

      /* ...and none of the four properties just above ever reach the date text
         itself. FullCalendar doesn't render a text node into this header — it
         calls back into `ScheduleCalendarGrid.jsx`'s own day-header generator
         (search that file for `info.inPopover`), which renders a MUI
         `Typography variant="subtitle2"` wrapped in a `Box`. That `<h6>` carries
         its own explicit font-size, font-weight and line-height from the
         subtitle2 variant, and its own explicit color from that component's
         `calendarHeaderMonthCellDate` class — all four properties set directly
         on the leaf, so none of them inherit this wrapper's values no matter
         what they're set to. Confirmed by walking the live computed-style chain
         from the `<h6>` up to this wrapper: this wrapper's own fontSize/color
         never survive past FullCalendar's title container one level down,
         which already carries an explicit 14px of its own — the 13px this file
         used to declare above was dead code the whole time it said 13.
         Pinned here instead, directly on the leaf, rather than left to whatever
         FullCalendar's title container happens to default to: 14px to match
         the day-of-month number rendered elsewhere in the grid (see this file's
         own `fcClass.rel` rule — 14px, regular weight, is FullCalendar's own
         classic default for that number, untouched by this app's CSS). Weight
         kept at 600 rather than dropped to that number's plain 400, though —
         tried live against 500 first, and rejected it once it was clear *why*
         500 read as flat: the chip rows below this title (`visitMonthChipSite`)
         are themselves 500, so a 500 title would match the body copy's weight
         exactly and lean on size and color alone to read as a header. 600
         gives it a weight step none of the rows underneath share, which
         matters more now than it used to: the divider above is gone (previous
         comment), so this is the one remaining cue that separates the date
         from being read as just the first row of the list below it. */
      [`& > .${fcClass.flexCol}.${fcClass.borderOnlyB} h6`]: {
        fontSize: '14px',
        fontWeight: 600,
      },

      /**
       * The date's own wrapper, whose padding does not belong to this popover.
       *
       * `calendarHeaderMonthCell` is this sheet's rule for a day header in the **grid's
       * column row**, where `12px 0` is what gives that row its height. The popover reuses
       * the same generator (`ScheduleCalendarGrid`'s `info.inPopover` branch), so it
       * inherits that padding into a context that has no such row to fill — measured live
       * at **54px of header band around a 20px line**, which is the dead space between the
       * date and the first chip.
       *
       * Zeroed here only. The grid's own header is untouched: this rule cannot match
       * outside `[role="dialog"][data-date]`.
       *
       * Matched on a *substring* of the generated class rather than a JSS `$ruleRef`,
       * because this block is inside `@global` where a rule reference does not resolve —
       * the same failure `harmonizeFlow.styles.js` records paying for. `makeStyles-…-N`
       * only varies in its numeric suffix, so the stem is stable in a way FullCalendar's
       * per-build hashed classes are not.
       */
      '& [class*="calendarHeaderMonthCell"]': {
        /* `height: 32px` as well as the padding. The rule sets both, and zeroing the padding
           alone left the band exactly as tall — measured, not assumed: the wrapper stayed 32px
           around a 20px line because the fixed height, not the padding, was holding it open.
           `auto` lets it collapse onto its own text. */
        height: 'auto',
        padding: 0,
      },

      /* The close button classic absolutely positions 2px off this header's own
         corner. Every other hook in this block is one of FullCalendar's own
         structural classes, read from `protected-styles` because those survive
         a version bump; this button has no such hook — `popoverCloseClass` is
         only ever the classic theme's own literal, unversioned `fc-classic-…`
         names, the exact kind of selector the comment above this whole block
         warns would silently stop matching. So it is found structurally
         instead: FullCalendar's popover header renders exactly two children,
         the day-header content div and this button, so `> button` picks it out
         without naming a single theme class. (Verified against the installed
         `@fullcalendar/react` package's own popover source, not assumed.)

         This is the other half of what the rejected design got wrong: a bare
         `<button>` with no author styling at all, so at rest it's invisible and
         focused it's the browser's own square. `outline-offset` is negative
         because the popover clips overflow two lines up — a ring drawn outward
         from a button sitting 2px off a 10px-radius corner would be cut by the
         corner it's next to. */
      [`& > .${fcClass.flexCol}.${fcClass.borderOnlyB} > button`]: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2px',
        borderRadius: '6px',
        transition: 'background-color 0.1s ease',
        '&:hover': {
          background: theme.palette.surfaceGreySubtle,
        },
        '&:focus': {
          outline: 'none',
        },
        '&:focus-visible': {
          outline: `2px solid ${theme.palette.borderBrand}`,
          outlineOffset: '-2px',
        },
      },

      /* The stack itself. Capped and scrolled because the whole point of this
         popover is the day nobody planned for — the one with eleven visits on it —
         and a list that runs off the bottom of the window is no more usable than
         the truncation it was opened to escape.

         **Background cleared for the same reason as the header.** This is
         classic's `dayCellClass`, and when the popover is open *for today* it
         carries `fc-classic-hbn` — `background-color: var(--fc-classic-today)`,
         a translucent yellow — tinting the whole chip stack. Confirmed live: on
         today's cell this wrapper measured `rgba(250, 204, 21, 0.15)` before this
         line was added. `.fc` already gives today its own, deliberate mark
         (`TODAY_COLUMN_WASH`, on the grid cell); the classic default is not that
         mark, it is what showed through here because nothing had cleared it. */
      [`& > .${fcClass.flexCol}.${fcClass.borderNone}`]: {
        maxHeight: '260px',
        padding: '8px',
        overflowY: 'auto',
        overflowX: 'hidden',
        backgroundColor: 'transparent',
      },

      /* Strip default FC event chrome here too — the same reset this file
         already applies to `.${fcClass.internalEvent}` under `.fc` (search
         "Strip default FC event chrome"), restated because that one can't
         reach a portal either. Without it the harness under every chip falls
         back to the classic theme's own event skin: `--fc-classic-event`,
         unset in this scope, resolves through `:root`'s stock palette to
         `#3788d8` — the flat blue pill this redesign exists to remove. The
         chip's own background is deliberately `transparent` now (`visitMonthChip`
         puts the state on a status fill, not this harness), so this reset is
         what was supposed to show through it and, in the popover, never did.
         With it cleared, a chip here is the same `eventContent` output as the
         grid's own cell, so the two render identically for free — margin
         *not* included this time, though: `visitsMonthChipGrid` puts `0 8px 4px`
         on this same class, but that 4px bottom is tuned for a fixed-height day
         cell with no room to spare. This popover floats free of that constraint,
         so its own stack gets more room between rows — 8px, restated below
         rather than left at the cell's tighter value. */
      [`& .${fcClass.internalEvent}.${fcClass.internalEvent}`]: {
        border: '0 !important',
        background: 'transparent !important',
        boxShadow: 'none !important',
        /* **`0 0 8px`, not `0 8px 8px`.** The 8px sides pushed every chip to x=1075 while
           the header's date sat at x=1067 — an 8px stagger between the popover's title and
           the list it heads, which is what read as unbalanced. The body wrapper's own 8px
           and its inner wrapper's 8px already inset the list; this was a third inset on top
           of them. The bottom 8px stays: that is the row rhythm, and it is the one part of
           this margin doing a job. */
        margin: '0 0 8px !important',
        padding: '0 !important',
        '&:focus, &:focus-visible': {
          outline: 'none',
          boxShadow: 'none',
        },
      },
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

  /**
   * Every company row the same height.
   *
   * FullCalendar sizes a timeline row to whichever of its two sides has more in it,
   * so a customer with a visit this week was 56px and a customer with none was 28px
   * — the column read as a ragged list where the ragging encoded nothing a planner
   * needs, since the same fact is already told by the cards being there or not. This
   * sets a floor rather than a clamp: a day cell holding two of a customer's
   * locations still grows, and clipping a visit to keep a rhythm would be the wrong
   * trade.
   *
   * Attribute selectors, because FC v7's class names are hashed per build (§7.36).
   *
   * **68px is measured, not chosen**: a card is 52px, its harness adds a 4px top
   * margin, and FullCalendar appends a 12px spacer below the event stack inside
   * every lane. Setting the floor to the height a one-card row actually takes is
   * what makes the two cases equal — the alternative was suppressing that spacer by
   * `:last-child`, which is a fight with an FC internal whose class name is hashed
   * and whose children differ between an empty lane and a full one.
   *
   * **Why the floor is on the label's own wrapper and not on the cells.** It was on
   * `[role="rowheader"], [role="gridcell"]` and did nothing a planner could see,
   * because a timeline row's height is not decided by its cells: FullCalendar
   * measures the *inner* element of each resource cell and each lane, takes the
   * larger of the two, and writes that as an inline `height` on the row. A cell can
   * be told it is 68px tall and the row it lives in will still be 40 — the cell just
   * overflows it. That overflow is also what was eating the separators: the rule
   * between two rows belongs to the row, the resource cell inside it is painted
   * `surfaceWhite`, and a cell 28px taller than its row covered its own row's bottom
   * border. Only the rows that already reached 68px — the ones holding a card — kept
   * a visible line, which is exactly the pattern that was on screen.
   *
   * `[role="rowheader"] > *` is the element FullCalendar watches, so flooring it
   * feeds the measurement instead of fighting it: every row is at least 68px, and a
   * day cell holding two cards still measures taller and wins. The wrapper is
   * `flexRow`, so `alignItems` is what keeps the company name optically centred once
   * the row is taller than the name is.
   *
   * **And the lane needs its rule stated where the label column does not.** The
   * separator down the left comes from the row element, which the classic theme
   * gives a 1px `--fc-classic-border` (pointed at `borderSubtle1` further down this
   * file) and which nothing here overrides. The lane's comes from
   * `resourceLaneClass` — an option the schedule *does* override, to class the
   * dedicated and overview bands, and a supplied value replaces the theme's default
   * rather than joining it, so the lanes lost their border width and colour
   * altogether. That is why those two bands re-declare `borderTop`/`borderBottom`
   * by hand. Company rows now do the same, at the height FullCalendar puts the
   * label column's rule, so the line reads straight across the divider. The last row
   * carries `border: 0 !important` on both sides, so it stays open-ended on both.
   */
  companyRowsUniform: {
    '& [role="rowheader"] > *': {
      minHeight: '56px',
      alignItems: 'center',
    },
    '& [role="gridcell"]': {
      borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
    },
  },

  /* A company row's name is a drill-through to that company's year, so it reads as
     a link rather than as a label — but only on hover, because forty-six blue rows
     would turn the column into a menu and compete with the cards. It is a real
     `<button>`, so the row is keyboard-reachable; the reset is because a button
     inherits none of the label's type. */
  companyRowLink: {
    '&&': {
      appearance: 'none',
      background: 'none',
      border: 0,
      padding: 0,
      margin: 0,
      font: 'inherit',
      textAlign: 'left',
      cursor: 'pointer',
      display: 'block',
      '&:hover, &:focus-visible': {
        color: theme.palette.textBrand,
        textDecoration: 'underline',
      },
    },
  },

  /* --- month cell, company grouping: one chip per visit -------------------
     Back to a full status wash — `visitFillNotStarted` etc, the same fill the
     week card carries, applied here exactly as it is there — rather than the
     thin left-line-only treatment this chip carried for a while. A line reads
     at the scale of one card read in isolation; scanned down a column of many
     it took a second look to register as "amber" at all, where a filled block
     of colour reads at a glance without one. The *leading* status glyph went with
     that change — the fill carries the signal for every state that has one, so
     this chip has no `visitMonthChipStatus`/`visitMonthChipNoPlan` machinery left
     (that pair still exists on the week card, which has the width to show a glyph
     *and* a wash without one competing with the other).

     **One state has no fill, and it is the one that most needs reading.**
     `visitFillUnrouted` is `surfaceGreySubtle` and deliberately untinted, so a
     visit nobody has routed is a plain grey chip — the same plain grey as a status
     with no wash at all. For that state only, the chip takes the card's own status
     mark (`visitStatusIcon`) at its trailing edge; `marginLeft: auto` puts it
     there rather than immediately after a short site name, so a column of chips
     has the mark in one place to scan down. The predicate lives with the mark, in
     `VisitMonthChipContent`.

     No duty-coloured accent either, and for the same underlying reason `dutyBlue`
     was already dropped at the call site: every chip in this cell is a HIT, so a
     duty accent would only ever be the same colour, and this chip has nothing
     left to spend it on.

     Content is `company · site` — not the time window, which used to sit here,
     and no longer the filter count either. The window is still one hover away in
     the tooltip; a cell that regularly stacks three or four of these did not have
     room to answer "where" and "how much work" and "when" all in one line, and
     of the three, the clock is the one a planner is least often scanning the
     grid for.

     The count went the same way, and for a sharper reason: this is the *company*
     grouping, and the month is its only view with no company row to inherit the
     name from (see the hover card's note below). So the one fact the cell could
     not supply was whose building this is — and with several companies' chips
     sharing a cell, the customer is also what tells two chips apart at a glance,
     where the filter count told them apart not at all. Company leads as the
     subject, the site qualifies it, and how much work is there is a hover away
     with the clock. */
  /* `6px` of side padding, not 12: the chip is one seventh of the grid wide — 147px
     measured — and 24px of horizontal padding was a fifth of it, spent on empty
     space while both names ellipsized. Two proper nouns in that width will always
     clip (the hover card is what carries them in full), but the padding was the one
     part of the squeeze that bought nothing. */
  visitMonthChip: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    width: '100%',
    minWidth: 0,
    padding: '3px 6px',
    borderRadius: '4px',
    cursor: 'pointer',
    overflow: 'hidden',
    /* Both names are `flex: '0 1 auto'` — they shrink but never grow — so without
       this the mark would sit tucked against a short site name instead of at the
       chip's edge. Stated on the container, so `visitStatusIcon` keeps stating
       only the mark's own size and nothing about where it is used. */
    '& $visitStatusIcon': {
      marginLeft: 'auto',
    },
  },
  /* The chip's subject: whose site this is. Dark and legible like the week card's
     own site line, but `fontWeight: 500` rather than that card's 600 — prominent
     without being the loudest thing in a column of these.

     `flex: '0 1 auto'`, not `'1 1 auto'` — it may shrink to let the site keep
     some width, but it must not *grow* to fill the row: a flex item that grows
     past its own text still occupies that width, which would shove the site to
     the chip's far edge instead of leaving it sitting right after the dot the way
     "company · site" reads as one phrase. */
  visitMonthChipCompany: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
      fontSize: '12px',
      fontWeight: 500,
      lineHeight: '16px',
      minWidth: 0,
      flex: '0 1 auto',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
  },
  /* The dot, as its own element rather than baked into either string: both
     neighbours can be missing (a visit with no company resolved, a site with no
     name) and a separator that is part of one of them would then draw with
     nothing on one side. `flex: '0 0 auto'` — one character, never worth
     shrinking. */
  visitMonthChipSeparator: {
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary1,
      fontSize: '12px',
      fontWeight: 500,
      lineHeight: '16px',
      flex: '0 0 auto',
    },
  },
  /* The qualifier: which of the customer's buildings. Quiet grey — the same
     `textSecondary1` the week card's route line takes for the same supporting
     role — so a column of chips scans by customer first.

     Also `0 1 auto` with its own `minWidth: 0`, so a long company and a long
     site each give way rather than one clipping the other out of existence. Both
     names are carried in full by the hover card, which is why clipping here is
     cheap. */
  visitMonthChipSite: {
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary1,
      fontSize: '12px',
      fontWeight: 500,
      lineHeight: '16px',
      minWidth: 0,
      flex: '0 1 auto',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
  },

  /* ------------------------------------------------------------------ *
   * The month chip of the **routes** reading: a route, and its run's count.
   *
   * Same box as `visitMonthChip` above and deliberately so — one seventh of the grid
   * is one seventh of the grid whichever reading is on it, so the two month grids
   * share a chip geometry (3px/6px, 4px radius, `overflow: hidden`) and only their
   * contents differ. It is restated rather than shared through a `composes` because
   * the two differ in one rule: the visits chip pins its status mark with a nested
   * `& $visitStatusIcon` selector, and this chip pins mark *and* count together in
   * `routeMonthChipMeta` below.
   *
   * **The chip states no duty accent of its own.** The week's route card puts
   * `DUTY_COLOR_CLASS`'s left border on its shell as well, which separates patrol from
   * dedicated from dispatch on a grid that holds all three; this reading is a
   * single-service patrol tenant's own tab (`canGroupMainViewByCompany`), so every
   * chip in every cell would take the same stripe — 3px of a 147px cell spent
   * distinguishing nothing. The status wash is the whole colour signal here, exactly as
   * on the visits month chip. (`eventMounted` still stamps the duty class on
   * FullCalendar's event *harness* for every event in every view — that is the shared
   * grid's business, not this chip's, and it is untouched here.)
   * ------------------------------------------------------------------ */
  routeMonthChip: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    width: '100%',
    minWidth: 0,
    padding: '3px 6px',
    borderRadius: '4px',
    cursor: 'pointer',
    overflow: 'hidden',
  },
  /* The chip's subject: which route this is. The week grid carries this as the row
     label and the month has no rows, so here it leads the chip in the same dark ink
     and the same `fontWeight: 500` the visit chip's company takes — prominent without
     being the loudest thing in a column of these.

     `flex: '1 1 auto'`, unlike either half of `Company · Site`: there is only one
     name on this chip, so it may take every pixel the count and the mark do not,
     and it is the only thing here worth clipping. The full name is in the drawer the
     chip opens. */
  routeMonthChipName: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
      fontSize: '12px',
      fontWeight: 500,
      lineHeight: '16px',
      minWidth: 0,
      flex: '1 1 auto',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
  },
  /* The count and the status mark, pinned to the chip's trailing edge as one group.
     Grouped rather than pinned individually so the gap between them stays 4px while
     the pair as a whole sits at the edge — `marginLeft: auto` on each in turn would
     push the mark to the edge and leave the count floating in the middle of whatever
     width the route name gave up.

     `flexShrink: 0`: two glyph-widths and a digit or two, nothing worth clipping —
     the same call `patrolVisitCount` makes on the week card for the same reason. */
  routeMonthChipMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    flexShrink: 0,
    marginLeft: 'auto',
  },

  /* ------------------------------------------------------------------ *
   * The month chip's hover card.
   *
   * A chip is one line of a cell one seventh of the grid wide, so it can only
   * ever carry the pair that identifies a visit — when, and where. Everything
   * else the planner might be hovering to find out lives here, and the customer
   * leads it: the whole point of this grouping is *visits by company*, and the
   * month is the one view in it with no company row to inherit the name from.
   *
   * This replaces a `title` attribute that had carried the same five facts for
   * some time. Nobody had read them. A native tooltip waits a second, then draws
   * unstyled OS text somewhere near the pointer — on a grid where the answer is
   * one hover away from fifty chips, that is slow enough to not be worth trying
   * twice.
   * ------------------------------------------------------------------ */
  visitMonthChipTip: {
    display: 'flex',
    flexDirection: 'column',
    // One uniform 4px between every row — lead, site, route, officer — rather
    // than the 2px gap plus a second, selective 2px `marginTop` on just the last
    // two rows this started as. Both read the same on screen, but one rule is
    // easier to trust than two that have to agree, and the row count has both
    // grown and shrunk since that pairing was written for three (the status row
    // has since gone, for restating the card it hovers over).
    gap: '4px',
    padding: '1px 0',
  },
  /* Never had a colour of its own — every other line in this tooltip states one
     (`visitMonthChipTipLine` at 72% white, `visitMonthChipTipOfficerName` at
     92%), but this one relied on inheriting from somewhere, and what it actually
     inherited was the typography theme's default body colour: `#000`. Black
     text on this tooltip's black background is invisible, not merely quiet —
     the lead line was rendering, every time, as a blank line the exact height
     of the text that should have been there. Full white, brighter than every
     other line here, since this is the one meant to read as the most
     prominent. */
  visitMonthChipTipLead: {
    '&.MuiTypography-root': {
      color: '#fff',
      fontSize: '12px',
      fontWeight: 600,
      lineHeight: '16px',
    },
  },
  visitMonthChipTipLine: {
    '&.MuiTypography-root': {
      // The tooltip is black; its supporting lines step back rather than change hue.
      color: 'rgba(255, 255, 255, 0.72)',
      fontSize: '11px',
      fontWeight: 500,
      lineHeight: '16px',
    },
  },
  /* `visitMonthChipTipStatus` was here, for a `Missed` / `Completed` row that
     closed the hover card. Removed with the row rather than left behind: the card
     it hovers over already carries the status as its fill and its badge, and the
     footer legend names every mark, so the line restated the surface it was
     covering. The state is still spoken in the event's `aria-label`. */
  visitMonthChipTipOfficer: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
  },
  visitMonthChipTipAvatar: {
    '&.MuiAvatar-root': {
      // Compact to match the tip's own type scale — the week card's avatar
      // (24-32px) is sized for a card, not a line inside a hover tooltip.
      width: '16px',
      height: '16px',
      flexShrink: 0,
    },
  },
  /* Who is coming is as load-bearing a fact as where and when, so this does not
     take the same 72%-white step-back every other supporting line here takes —
     it stays close to full white, the tip's only other line at that weight
     besides the lead. Same size/weight as `visitMonthChipTipLine` otherwise, so
     it is a difference of emphasis, not of scale. */
  visitMonthChipTipOfficerName: {
    '&.MuiTypography-root': {
      color: 'rgba(255, 255, 255, 0.92)',
      fontSize: '11px',
      fontWeight: 500,
      lineHeight: '16px',
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
    minHeight: '36px',
    padding: '6px 8px',
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
  /* Supporting detail, so it is coloured like supporting detail. This was
     `textSecondary1` (#444446) against a #262527 title — a shade apart, which made
     "1 this week" read as a second heading and put two dark lines in every row of a
     column the eye is meant to scan for names. `textPlaceholder` is the same grey the
     card's own route line uses, and it keeps the column's three tiers distinct:
     title, then this, then the quiet row's next-due at #8A8A90. */
  resourceLabelSubtitleDedicated: {
    '&.MuiTypography-root': {
      color: theme.palette.textPlaceholder,
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
  /* The resource lane is FullCalendar's own flex column (see `ResourceLane` in
     the scheduler package) sized to the row's shared height, but its events
     wrapper only ever grows to fit the events it holds — a single ~50-70px
     card in a taller row was left pinned to the top with the leftover space
     stranded below it. `justifyContent: 'center'` centers that events block
     (and any top/bottom lane content, which is empty here) within the row.
     Scoped to visit-card rows only (`isVisitsWeekView`, both the standalone
     Visits tab and the Overview tab's company grouping) — Dedicated/Officer/
     Patrol rows and Overview's own accordion/site-band lanes keep their
     existing top-aligned stacking, handled by the other branches above. */
  /* Centers a day's stack of cards within the row's height. The lane is a
     row-direction flex container (FullCalendar's default), so the cross axis
     — the one that runs vertically here — is `align-items`, not
     `justify-content`; `justify-content` centers along the row's own
     horizontal main axis instead, which does nothing for a lane only one
     column wide. That mismatch was why cards still hugged the top of a row
     taller than their content despite this class already being wired up. */
  /* Centers a day's stack of cards within the row's height — but the row
     track here is a `flex-direction: column` container (FullCalendar's own
     markup), so the axis that runs vertically is the **main** axis, not the
     cross axis. `justify-content` is what centers along the main axis;
     `align-items` governs the cross axis, which in a column container is
     *horizontal*.

     That distinction is load-bearing, not academic: the lane this wraps has
     no normal-flow content of its own (every card inside it is absolutely
     positioned for FullCalendar's day-offset math), so its intrinsic width
     collapses to 0. `align-items: center` centers that zero-width box
     horizontally in the middle of the *entire week*, which becomes the
     coordinate origin every card's `insetInlineStart` is measured from —
     every card in the row renders shifted toward the row's horizontal
     center, off whatever day it actually belongs to. `align-items: stretch`
     keeps the lane at full row width (i.e. the correct origin at the row's
     left edge), and `justify-content: center` is what actually centers the
     content vertically. */
  visitResourceLane: {
    justifyContent: 'center',
    alignItems: 'stretch',
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

  /* --- the Day / Week / Month switch -------------------------------------
     Notion-style segmented pill: a flat grey track with the selected segment
     drawn as its own lifted white pill on top (see the `&&.Mui-selected` block
     on `calendarHeaderToolbarToggleBtn` below for that half). Replaces the
     earlier solid-grey-fill-with-white-text treatment outright, not a tweak of
     it. The track no longer carries a border — it was only ever there to
     anchor a *white* shell against a *white* page, and a flat grey fill does
     that job on its own against the page's white background. */
  calendarHeaderToolbarToggle: {
    gap: '4px',
    '&.MuiToggleButtonGroup-root': {
      borderRadius: '8px',
      background: theme.palette.surfaceGreySubtle,
      height: '32px',
      display: 'flex',
      alignItems: 'stretch',
      justifyContent: 'center',
      /* No inset. The 2px cushion is what put a visible gap between this shell's
         border and the selected segment's own, so the pair read as two concentric
         rounded rectangles. With the segment flush to the shell the two edges meet
         and the control has one outline again. */
      padding: 0,

      '& .MuiToggleButtonGroup-grouped': {
        /* Sized for the single letters this control now shows. 16px of side padding
           was proportionate to "Month"; against "M" it was almost all padding, and
           the row it sits in has since gained a labelled grouping toggle and two page
           actions to make room for. `minWidth` keeps the three segments equal — D, W
           and M are not the same width — so the control does not jog as the selection
           moves. */
        padding: '4px 8px',
        minWidth: '32px',
        border: '0 ',
        /* Fills the shell rather than floating 2px inside it — `stretch` above plus
           an inner radius one step down from the shell's 8px, so the corners nest
           instead of cutting across each other. */
        height: 'auto',
        alignSelf: 'stretch',
        borderRadius: '7px !important',
      },
    },
  },

  calendarHeaderToolbarToggleBtn: {
    '&.MuiButtonBase-root': {
      color: `${theme.palette.textPlaceholder}`,
      border: '1px solid transparent',
      /* Hover needs its own step now the track is grey rather than white —
         `surfaceGreySubtle` is the track colour itself, so painting the same
         token on hover used to work only because the shell behind it was
         white. `borderSubtle2` is the next grey down this app already uses as
         a wash on light-grey surfaces (see e.g. `optimizeRoute.styles.js`),
         visibly darker than the track without approaching the selected
         segment's white. */
      '&:hover': {
        backgroundColor: theme.palette.borderSubtle2,
      },

      '&:disabled': {
        color: `${theme.palette.surfaceWhite}`,
        backgroundColor: `${theme.palette.surfaceBrandDisabled}`,
        border: `1px solid #A9DEFF`,
      },

      /* The selected segment, drawn as its own white pill lifted off the grey
         track — the Notion pattern (12h/24h, Table/Board/Chart, etc.) this
         control now follows in place of the solid-grey-fill-with-white-text
         treatment it carried before. That treatment is retired outright, not
         tuned further.

         A soft, small-scale shadow does the lifting instead of a border or a
         colour change alone. `0px 1px 2px 0px rgba(16, 24, 40, 0.10)` reuses
         this file's own shadow colour family — `calendarHeaderToolbarDatePickerPopover`
         is built from the same `rgba(16, 24, 40, …)` — just turned down from
         popover scale to something proportionate for a 28px pill; the
         popover's two-layer shadow would be far too heavy here.

         Confirmed product decision, asked for twice: the selected segment's text
         weight matches the unselected segments'. Do not reintroduce a heavier
         weight here — `textPrimary` plus the white fill and its lift shadow is
         the whole signal for "this one is active"; a weight bump on top of that
         reads as a second, competing signal and was asked to be removed.

         Border is left unset here so it falls through to the base rule's
         `1px solid transparent` — giving the pill a shadow without a border
         keeps its box size identical to the unselected state, so nothing
         shifts by a pixel on selection. */
      '&&.Mui-selected': {
        backgroundColor: theme.palette.surfaceWhite,
        color: theme.palette.textPrimary,
        boxShadow: '0px 1px 2px 0px rgba(16, 24, 40, 0.10)',
        '&:hover': {
          backgroundColor: theme.palette.surfaceWhite,
        },
      },
    },
  },
  /* Matched to `eventAvatar` — the two alternate in the same slot on the vehicle row, so a
     size difference between them shows as the row twitching when a van is assigned. */
  carIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '14px',
    height: '14px',
    borderRadius: '50%',
    backgroundColor: theme.palette.surfaceWhite,
    border: `1px solid ${theme.palette.borderSubtle1}`,
    '& svg': {
      width: '12px !important',
      height: '12px !important',
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
        backgroundColor: `${TODAY_COLUMN_WASH} !important`,
        borderTop: `2px solid ${theme.palette.brandSecondaryLight} !important`,
      },

    /* Today, down the whole column. The header rule above marks where the day
       starts; this is the faint grey that carries it through the lanes so the eye
       can follow the column without a saturated fill shouting over the cards in it.
       `data-schedule-today` is stamped by `ScheduleCalendarGrid` from the *franchise*
       clock — FullCalendar's own `aria-current` is the browser's, which puts the mark
       on the wrong column for anyone working a franchise a few timezones away. */
    '& [data-date][data-schedule-today]': {
      backgroundColor: TODAY_COLUMN_WASH,
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

    /* Resource timeline column header height (Locations / Company / Routes …).
       In practice this is the *only* column header this rule can move: FullCalendar
       gives every other one — the day headers, the timeline slot headers, the
       datagrid's super-header — an `align*` class carrying `align-items: … !important`
       (`dayHeaderAlign`/`slotHeaderAlign`, both `start` here), and the skeleton's
       `!important` beats anything declared below. The datagrid's own header cell is
       the one FullCalendar renders with no align class at all, so it inherits
       whatever this says.

       `align-items` is the **horizontal** axis here, not the vertical one. FC7 puts
       `flexCol` on the header cell (`flex-direction: column !important`), so this
       property sizes the cross axis: `center` was centring the label *across the
       column*, which read as the header disagreeing with the names under it — the
       resource cells carry `alignStart` from FullCalendar itself and cannot be
       centred. `flex-start` is what puts the two on one left edge; the 8px that
       finishes the alignment is `resourceColumnHeaderInner`'s own padding, matching
       the label cushions (`resourceLabelContent`, `officerResourceLabel`).

       Vertical centring in the 36px cell is untouched by this — that comes from the
       classic theme's own `justify-content: center` on the same element, which is the
       main axis while the direction stays `column`. */
    [`& .${fcClass.tableHeaderSticky} [role="columnheader"]`]: {
      height: '36px !important',
      minHeight: '36px !important',
      maxHeight: '36px !important',
      display: 'flex',
      alignItems: 'flex-start',
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
        backgroundColor: `${TODAY_COLUMN_WASH} !important`,
        borderTop: `2px solid ${theme.palette.brandSecondaryLight} !important`,
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

  /* The resource column's header label ("Company", "Routes", "Locations", …).
     `margin: 0` clears the classic theme's own 8px on this element — theme and
     option class names are *joined*, not swapped, so its margin is still on the
     node — and the 8px comes back as padding instead, which is the number every
     label cushion in the column below uses (`resourceLabelContent`,
     `officerResourceLabel`, `unassignedVisitsLabel`). Same 8px on both is what
     puts the header's text and the resource names on one left edge; the header
     cell rule in the `calendar` block is what stops it being centred away from
     them. */
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

  /* The card, as tight as its type allows.
     Cushion and gutter were 8px on every side, which on a two-line card spent
     more height on air than on text and cost ~4px of the day column's width to
     each gutter — the column where the route name was truncating. 4px keeps cards
     visibly separate from the cell edge and from each other without the card
     reading as padding with words in it. Nothing here changes the type scale: the
     lines are the same size, there is just less nothing around them. */
  eventContent: {
    backgroundColor: theme.palette.surfaceGreySubtle,
    padding: '4px 6px',
    overflow: 'hidden',
    borderRadius: '4px',
    cursor: 'pointer',
    display: 'flex',
    width: '98%',
    gap: '2px',
    marginLeft: '4px',
    marginTop: '4px',
    marginRight: '4px',
    // marginBottom: '5px',
  },
  eventContentWeek: {
    flexDirection: 'column',
    gap: '2px',
    minWidth: 0,
  },
  /* Visit-card-only breathing room, layered over `eventContent`/`eventContentWeek`
     — the shell every duty card on this calendar shares — via `!important`,
     since those two set `padding`/`gap` unconditionally and this only applies
     at the call sites that draw a visit. A bit more air now that the card's
     text has grown a step, on a card that is down to two lines at most. */
  /* Horizontal padding reads wider than the 6px top/bottom suggests once the
     row is taller than the card: the card is also centered *within* the row
     (see `centerVisitDayLanes`), so the actual top/bottom whitespace a viewer
     sees is that 6px plus however much the row exceeds the card's own
     height — routinely another 6-7px on top. There's no equivalent
     horizontal centering (the card fills its day column edge to edge), so
     8px read as noticeably tighter side-to-side than the combined vertical
     gap. 12px closes that gap without the box itself feeling loose. */
  visitCardShell: {
    padding: '6px 12px !important',
    gap: '4px !important',
  },

  /* The route card's own shell, on the routes reading of the main service tab.
     Layered over `eventContent`/`eventContentWeek` with `!important` for the reason
     `visitCardShell` needs it: those two set `padding` and `gap` unconditionally for
     every duty card on this calendar, and this applies to one reading's cards only.

     **Asked for: more height.** The card had been compressed the other way — three
     lines to two — when the vehicle came off. It is three again (time, officer,
     count + marks), and the two lines added to the shell here are what stops the
     third row reading as a crowded afterthought: 6px of vertical padding instead of
     4, and a 4px gap between rows instead of 2, the same air the visit card was given
     when its text grew. Horizontal padding is left at 6px — a route card's officer
     name is the longest string on this grid and the day column is narrow, so the
     visit card's 12px would buy whitespace at the cost of the one line that needs
     the width. */
  patrolRouteCardShell: {
    padding: '6px !important',
    gap: '4px !important',
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
  /**
   * **Nothing maps here any more, deliberately.**
   *
   * `dutyBlueBg` is named for a colour and defined as the tenant brand, and those
   * two disagree: `surfaceBrandSubtle` is `#E5F6FF` (blue) on Signal and `#E8F7ED`
   * (pale green) on Filter Go. It was the in-progress wash, which is how a live
   * route came to render green there while the status badge on the same card
   * rendered blue. In progress now takes `statusFillInProgress` below.
   *
   * Kept rather than deleted only because it is a *named colour* in a palette whose
   * siblings are still in use (`dutyYellowBg`, `dutyGreenBg`; `dutyRedBg` is
   * likewise unreferenced). If you reach for it, reach for `surfaceBrandSubtle`
   * instead and mean the brand — a status must never be washed with it.
   */
  dutyBlueBg: {
    backgroundColor: `${theme.palette.surfaceBrandSubtle} !important`,
  },

  /* The two state fills the card spec names, both defined in `calendarStatusWash.js` so
     the schedule card, the visit card and the Companies views cannot drift apart. Amber is
     *in progress* now and grey is *not started* — see that file for why the amber moved. */
  statusFillInProgress: statusFillInProgressRule,
  statusFillNotStarted: statusFillNotStartedRule,

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

  /* ── The duty accent ───────────────────────────────────────────────────────
     **2px, down from 3.** The card spec states `border-left: 2px solid` for all three
     states, and at 3px against a 4px radius the accent was reading as a coloured edge on
     the card rather than as a rule beside it — the corner had to bend the full stroke
     round. The colour still names the *duty type* and the fill still names the *status*;
     only the weight moved. */
  dutyGreen: {
    borderLeft: `2px solid ${theme.palette.surfaceSuccessStrong}`,
    borderColor: theme.palette.surfaceSuccessStrong,
  },
  dutyRed: {
    borderLeft: `2px solid ${theme.palette.borderAlert}`,
    borderColor: theme.palette.borderAlert,
  },
  dutyBlue: {
    /* The literal, not `palette.borderBrand` — that token is green on Filter Go, so this
       accent used to change what it meant per tenant. See `DUTY_ACCENT_BLUE`. */
    borderLeft: `2px solid ${DUTY_ACCENT_BLUE}`,
    borderColor: DUTY_ACCENT_BLUE,
  },
  dutyPurple: {
    borderLeft: `2px solid ${theme.palette.borderPurple}`,
    borderColor: theme.palette.borderPurple,
  },

  dutyYellow: {
    borderLeft: `2px solid ${theme.palette.borderWarning}`,
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
      /* **400, where `subtitle4` is 500.** The spec puts the time at 10/500 and the two
         name rows under it at 10/400, which is the only thing separating them — same size,
         same-ish colour, so weight is carrying the whole hierarchy. At 500 all three rows
         read as headings and the card had no quiet part. */
      fontWeight: 400,
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

  /* 14px, the spec's figure for both the installer avatar and the vehicle mark. It was 16,
     which on a 10px text row made the glyph the tallest thing in the line and pushed the
     two body rows apart — at 14 the mark and its label share a 14px box. */
  eventAvatar: {
    '&.MuiAvatar-root': {
      width: '14px',
      height: '14px',
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

  /* An unassigned officer slot draws `unassigned-officer.svg` in place of the
     avatar, sized to the avatar's own 16px footprint rather than the 10px
     `reassignedOfficerFlex` gives every other status glyph it holds
     (`UnAssignHit`, `RunsheetIcon`, `DispatchIndicator`) — this is an SVG
     standing in for an `Avatar`, not a small inline icon, so it needs the
     bigger size back. `!important` is required, not decorative: both rules
     match the same element at equal specificity (`.reassignedOfficerFlex
     svg` vs. this class), and only an `!important` declaration can win that
     tie regardless of source order — the same reason `carIcon` below needs
     it for the vehicle slot. */
  unassignedOfficerIcon: {
    width: '16px !important',
    height: '16px !important',
    flexShrink: 0,
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

  /**
   * Today's column header — a **rule**, not a fill.
   *
   * This was solid brand with white type, which made the current day the loudest
   * object on the grid: louder than the unrouted-demand pills and as loud as the
   * Harmonize CTA, for a fact that is context rather than something to act on. The
   * column now carries a light-green rule along its top and a faint grey wash down
   * its whole length (see the slot and lane rules keyed on `data-schedule-today`),
   * which locates the day without competing with the work in it.
   *
   * The type goes back to the page's own colour, weighted rather than inverted, so
   * the header still reads as the one that matters.
   */
  calendarHeaderCellToday: {
    '& .MuiTypography-root': {
      color: `${theme.palette.textPrimary} !important`,
      fontWeight: 600,
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
    padding: '4px 6px',
    overflow: 'hidden',
    borderRadius: '4px',
    cursor: 'pointer',
    display: 'flex',
    width: '100%',
    gap: '2px',
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

  /* How many visits a route card is carrying — the mark, then the figure, in the
     slot the vehicle line used to hold. See `PatrolCardBody` for the card's shapes.

     **A glyph and a number, no noun.** The word was asked to come off, so legibility
     rests on the mark: `hits-runsheet.svg`, the same one the Runsheets listing puts
     beside `N Hits`, whose own `#6A6A70` is already the muted grey this wants — no
     recolouring, and nothing here competes with the one red count D29 allows the
     schedule chrome. The figure keeps the tabular treatment both totals above use, so
     a column of counts stays in line.

     `flexShrink: 0` because there is nothing here worth clipping: two glyph-widths
     and a digit or two. */
  patrolVisitCount: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    flexShrink: 0,
    minWidth: 0,
  },
  /**
   * The icon slot beside a visit count — **the month chip's only, now.**
   *
   * It was shared with the week card's top-right corner until the mark came off there (see
   * `patrolVisitCountValue` below). `RouteMonthChipContent` still draws `hits-runsheet.svg`
   * and still needs it sized: a month chip is a single line with no room for a time beside
   * the figure, so the glyph is what says *visits* there, where on the week card the time
   * to its left already does.
   *
   * 12px, down from the asset's native 14 — it sits beside 10px text.
   */
  patrolVisitCountIcon: {
    display: 'flex',
    alignItems: 'center',
    flexShrink: 0,
    '& svg': {
      width: '12px !important',
      height: '12px !important',
    },
  },

  /**
   * The visit count, in the card's top-right corner.
   *
   * **A figure and nothing else.** This was a wrapper (`patrolVisitCountCorner`) holding the
   * icon slot above and this value; the wrapper is gone with the mark — see the call site in
   * `ScheduleCalendarGrid`. So the value *is* the corner now, which is why
   * it carries the `marginLeft: auto` that pins it right: `eventDetailHeaderWrapper` is a
   * `space-between` row and the time is the only thing to its left.
   *
   * `flexShrink: 0` keeps the figure whole on a narrow day column — the time truncates
   * first, because a clipped digit is a wrong number where a clipped time is still a time.
   */
  patrolVisitCountValue: {
    flexShrink: 0,
    marginLeft: 'auto',
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
      /* 10/500, the spec's own treatment for the time this sits opposite — the pair reads
         as one row rather than as a label and a badge. It was 11/700, which without the
         icon beside it was the loudest thing on the card. */
      fontSize: '10px',
      fontWeight: 500,
      lineHeight: '12px',
      fontVariantNumeric: 'tabular-nums',
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
