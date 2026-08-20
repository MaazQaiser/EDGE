import { makeStyles } from '@mui/styles';

/** Row geometry, shared by the stop rows, the anchors and the leg lines. */
const GRIP_WIDTH = 16;
const INDEX_SIZE = 24;
const ROW_GAP = 12;

/**
 * The amber the spill is written in, named once.
 *
 * The palette's warning family cannot do this job on its own and it is worth
 * saying why rather than rediscovering it: `surfaceWarningSubtle` (`#FEF0C7`) is
 * heavier than the wash this drawer settled on — a saturated fill across a box
 * four lines tall shouts louder than the route it is a footnote to, which is
 * exactly the mistake the seventh UI pass corrected — and `textWarning`
 * (`#f19f02`) is an amber-500 that fails contrast as body copy on any light
 * ground, so it can mark a bar or a border but never carry a sentence.
 *
 * So: a barely-there wash, a hairline, and an amber dark enough to read. These
 * three appear wherever the drawer says *this part did not fit* — the spill
 * ribbon on an overflow route, the box for work no day could take, and the
 * footer's caveat — and naming them is what keeps those three saying it in the
 * same voice. Three hexes in one place beats the same three scattered across
 * nine rules.
 */
const SPILL_WASH = '#FFFAEB';
const SPILL_LINE = '#FEDF89';
const SPILL_INK = '#B54708';

/**
 * Stop-row geometry, from the supplied spec.
 *
 * Every number here is measured rather than chosen, which is why they are named:
 * the dashed connector has to land on the pin's centre axis, and that only holds
 * while `GRIP + PIN_GAP + PIN/2` and `GRIP + CONNECTOR_GAP` are the same value.
 * They are — 20 + 4 + 10 and 20 + 14 both give 34 — and a stray edit to one of
 * them silently bends the timeline, so they are stated together.
 */
/**
 * ~~The one inset for everything inside a route card.~~ **The card owns it now.**
 *
 * This existed because three different blocks inside a card each had their own
 * horizontal padding, and one number replaced three. `proposedCard` then took the
 * inset for itself — 16px on the card, which is what puts the title and the bar where
 * the design draws them — and the blocks inside kept theirs as well, so the meter and
 * the stop rows sat 28px in while the head they belong to sat at 16.
 *
 * Two insets is the same fault this constant was introduced to fix, one level up. So
 * the blocks inside a card now carry **vertical padding only** and the card is the
 * single horizontal inset. That also fixes the dividers between blocks, which were
 * stopping 16px short of the card's edges on both sides and reading as underlines
 * rather than rules.
 */

/**
 * The scrollbar's width, from `global.scss`'s `::-webkit-scrollbar { width: 8px }`.
 *
 * Named because the footer has to account for it. The drawer body scrolls and the
 * footer does not, so the body loses 8px to its scrollbar and the footer keeps them —
 * which put the Apply button's right edge at 2055 against a route card's 2047, 8px
 * out from every card it sits under. Restated: **fixed chrome beside a scrolling
 * region does not share that region's usable width**, and the two only line up if one
 * of them says so.
 */
const SCROLLBAR_W = 8;

/**
 * The row's three fixed columns, and the design measures all of them at 16.
 *
 * They were 20, from a pass that sized the grip and the pin off the row's own 36px
 * height rather than off the spec. 16 is what the design asks and it is the better
 * number besides: the row's text is a 20px line, so a 20px pin was the tallest thing
 * on it and the eye read the pins as the content and the site names as captions to
 * them. At 16 the pin sits inside the line and the name leads again.
 *
 * `CONNECTOR_GAP` moves with them — it is what puts the dashed rule on the pin's
 * centre, so grip + gap has to equal the pin's own midpoint or the track and the
 * markers it joins stop lining up. See `stopConnector`.
 */
const STOP_GRIP = 16;
const STOP_PIN = 16;
const STOP_PIN_GAP = 4;

/**
 * The same teardrop, on a collapsed route card.
 *
 * 16 rather than the list's 20, and the four pixels are the whole reason the strip fits at
 * all: a collapsed card grows by the pin plus the header's own 9px rhythm, so 20 would have
 * cost 29px against a header of about 90 and read as a second row of content rather than as
 * a caption to the one above it. 16 is the floor for the digit inside — the numeral is set
 * in the `viewBox`, so it scales with the box, and at 16 a two-digit stop renders at about
 * 7px inside a 13px bowl. Below that the numbers stop being numbers and the strip becomes
 * texture, which is a different thing to show and not the thing that was asked for.
 *
 * The gap is 3 rather than the list's 4 because these sit shoulder to shoulder with nothing
 * between them, where the list's pins are one per row and the gap there is to a pill.
 */
const PIN_STRIP_SIZE = 16;
const PIN_STRIP_GAP = 3;
const STOP_ROW_H = 36;
const CONNECTOR_GAP = 16;
const CONNECTOR_H = 22;

/**
 * The pin and its connector, by what the stop *is*.
 *
 * Four of these six are not in the palette — Blue/400, Blue/600, Success/500 and
 * the pin's dark green rim — and they come straight from the spec. They live here
 * with the reason rather than inline: a marker's fill and its rim have to move
 * together, and the dashed connector under it has to agree with both, so three
 * values that must match are one object.
 *
 * Colour carries state and nothing else. Green is work already done, blue is work
 * this route will do, grey is a stop that is on the list but not in this day.
 */
export const STOP_TONES = {
  done: { fill: '#5CB85C', rim: '#047857', line: '#2E964B' },
  planned: { fill: '#3F99FF', rim: '#0058FF', line: '#146DFF' },
  idle: { fill: '#86868B', rim: '#5B5B5F', line: '#86868B' },
  /**
   * Work that did not make the plan — the amber pin in the exclusions panel.
   *
   * `line` is `SPILL_LINE`, so the dashed track between excluded stops is the same
   * amber as the panel's own border rather than a fourth approximation of it. The fill
   * is a step darker than the wash so a 20px pin still reads on top of it.
   */
  excluded: { fill: '#F57C00', rim: '#F57C00', line: '#F57C00' },
};

/**
 * The dashed track *between* planned stops.
 *
 * Violet rather than the pin's own blue, and that is the point: the pins mark places
 * and the track marks driving, so colouring the track in the pins' colour made a route
 * read as one continuous object when it is a sequence of stops with journeys between
 * them. The leading run — origin to first stop — stays grey, because the origin is not
 * a stop the planner chose and its leg is not one they can reorder.
 */
export const LEG_LINE = '#6C0AC2';

/**
 * The drawer reads top to bottom as one argument: the levers, the geography,
 * the answer, then the consequence. Sections are separated by hairlines rather
 * than cards so the eye runs straight down instead of hopping between boxes.
 */
export const useStyles = makeStyles((theme) => ({
  drawer: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    width: '100%',
    minWidth: 0,
    overflowX: 'hidden',
    background: theme.palette.surfaceWhite,
  },
  grow: { flex: 1 },

  /* ---------- header ---------- */
  header: {
    flexShrink: 0,
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: theme.spacing(2),
    padding: '24px 24px 16px 24px',
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
  },
  title: {
    '&.MuiTypography-root': { fontSize: 18, fontWeight: 600, color: theme.palette.textPrimary },
  },
  subtitle: {
    '&.MuiTypography-root': {
      fontSize: 12,
      color: theme.palette.textSecondary3,
      marginTop: 2,
    },
  },
  closeButton: { '&.MuiButtonBase-root': { padding: 4, minWidth: 'auto' } },

  /* ---------- controls ----------
     Start and end sit directly above the meter, so switching to an open route
     shortens the bar in the same glance. */
  controls: {
    padding: '16px 24px',
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  /* Label above control, as every other form in the product does it. */
  /**
   * ---------- a field, to the system's own spec ----------
   *
   * `label · 6px · 44px input`, which is the `Frame 1000007439` group the rest of the
   * product is built from. The 6px is the *only* gap: it used to be 4 here plus a 4px
   * `marginBottom` on the label, which is the kind of pair that drifts because neither
   * half looks wrong on its own.
   *
   * **Almost all of the spec was already in the theme** — `muiTextField.js` sets the
   * `10px 14px` padding, the 44px cap, the `8px` radius, the `1px solid #D0CFD2`
   * outline and `16px/24px #262527` input text. This drawer had *opted out* of the last
   * of those in two places, dropping its inputs to 14px, so the fields here read a size
   * smaller than the same fields everywhere else in the app. Both overrides are gone.
   * Nothing below re-states a value the theme already gets right: a local copy of a
   * system value is a value that will be wrong after the system changes.
   */
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    minWidth: 0,
    flex: 1,
    /* Shared controls that render their own label rather than taking ours. */
    '& .MuiInputLabel-root': {
      fontFamily: 'Inter',
      fontSize: 14,
      fontWeight: 500,
      lineHeight: '20px',
      color: theme.palette.textSecondary3,
      whiteSpace: 'normal',
      display: 'flex',
      alignItems: 'center',
      gap: 6,
    },
  },
  /* The product's drawer forms run their dropdowns at 44px with 16px text; the
     component's own default is a denser 36px meant for toolbars. */
  dropdown: {
    height: '44px',
    '& div': {
      '& div': {
        '& .MuiTypography-root': {
          fontSize: '16px',
          fontWeight: '400',
        },
      },
    },
  },
  /* Matches the dropdowns beside it — the product runs drawer form controls at
     44px with 16px text. */
  addressField: {
    '& .MuiOutlinedInput-root': { height: 44 },
    '& .MuiOutlinedInput-input': { fontSize: 16, fontWeight: 400 },
  },
  labelHint: {
    fontSize: 12,
    fontWeight: 400,
    color: theme.palette.textSecondary3,
  },
  /* Two fields on one line. The day and the window it sits inside are one decision
     read left to right, and stacking them cost 60px of a drawer whose first screen
     has to reach the plan. */
  controlRow: { display: 'flex', alignItems: 'flex-start', gap: 12, minWidth: 0 },

  /* ---------- a label and its tip ----------
     The explanation moved off the screen and onto hover. Four controls each carrying a
     helper line put four sentences of prose in the first 300px of a panel whose job is
     to show a plan, and three of those sentences were explaining where a value came
     from. What stays under a field is a fact about *this run*; the mechanism is in the
     tip. See `FieldLabel`. */
  labelRow: { display: 'flex', alignItems: 'center', gap: 5, minWidth: 0 },
  /**
   * A 14px `ⓘ`, and it is a button.
   *
   * Deliberately quiet — `textSecondary3` on a hairline ring, brightening on hover and
   * focus. It sits beside a 12px label and must not out-weigh it: this is an *offer* of
   * detail, and an accent-coloured badge next to every label would read as four
   * warnings. Sized to the label's own line so the row height does not move.
   */
  /**
   * The same info mark and hit-box the harmonization settings screen uses for its own
   * field tooltips (`infoButton` there, `greyInfoIcon.svg`) — one drawn circle-i glyph
   * for the app rather than this drawer's own hand-drawn ring-and-letter version.
   * 24px of target around a 14px glyph, transparent, with negative margins so the extra
   * reach costs nothing in the row it sits in.
   */
  labelTip: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 24,
    height: 24,
    flexShrink: 0,
    margin: -5,
    padding: 0,
    border: 0,
    background: 'none',
    cursor: 'pointer',
    '& svg': { width: 14, height: 14, display: 'block' },
    '&:focus-visible': {
      outline: `2px solid ${theme.palette.textBrand}`,
      outlineOffset: -1,
    },
  },

  /**
   * ---------- the proposed route, as the mockup draws it ----------
   *
   * A restyle of the route card, the stop rows and the exclusions panel onto one
   * agreed design. Written here in one pass, before the three components that use
   * them, so the card's border radius, the connector's violet and the panel's amber
   * are decided once rather than three times — the previous arrangement had each
   * component reaching for its own approximation of the same wash.
   *
   * **The names are the contract.** Three files consume this block, and the reason
   * they can be built independently is that none of them gets to invent a key.
   */

  /* The card, to spec: 16px padding, 12px between its three children, an 8px radius
     and a `Grey/100` hairline. Three children and no more — the head, the bar, and the
     scrolling list of stops. */
  proposedCard: {
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    padding: 16,
    gap: 12,
    background: theme.palette.surfaceWhite,
    border: '1px solid #E6E6E7',
    borderRadius: 8,
    marginBottom: 12,
  },
  /* Name left, the figure and the two buttons hard right. `center`, not `baseline`:
     the spec runs the title at 14px and the figure at 12px inside one 20px row, and
     baseline alignment on a 2px type difference just tilts the row. */
  proposedHead: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    alignSelf: 'stretch',
    minWidth: 0,
  },
  /**
   * The route's name — an input that does not look like one until touched.
   *
   * **14px semibold, not 18.** It was the largest thing on the card; the spec makes it
   * the same 14px as a stop's own name, one weight above. That is the better reading:
   * a route's name is a label for the list beneath it, not a page heading, and at 18px
   * three stacked cards read as three headings competing with the column's own.
   */
  proposedName: {
    '&.MuiInputBase-root': {
      flex: 1,
      minWidth: 0,
      fontFamily: 'Inter',
      fontSize: 14,
      fontWeight: 600,
      lineHeight: '20px',
      color: '#262527',
      padding: '0 4px',
      marginLeft: -4,
      borderRadius: 4,
      border: '1px solid transparent',
      transition: 'background 120ms ease, border-color 120ms ease',
    },
    '&.MuiInputBase-root:hover': {
      background: theme.palette.surfaceGreySubtle,
      borderColor: '#E6E6E7',
    },
    '&.MuiInputBase-root.Mui-focused': {
      background: theme.palette.surfaceWhite,
      borderColor: theme.palette.borderBrand,
      boxShadow: '0px 0px 0px 3px rgba(14, 109, 255, 0.12)',
    },
    '& .MuiInputBase-input': {
      padding: 0,
      fontSize: 14,
      fontWeight: 600,
      lineHeight: '20px',
      height: 'auto',
    },
    '&.Mui-error': { borderColor: '#DF372B' },
  },
  /* The static form, for a route whose name belongs to the route being merged into.
     Same ramp as the field so the head does not change height between the two. */
  proposedNameStatic: {
    '&.MuiTypography-root': {
      flex: 1,
      minWidth: 0,
      fontFamily: 'Inter',
      fontSize: 14,
      fontWeight: 600,
      lineHeight: '20px',
      color: '#262527',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
  },
  /* `2 hr / 8 hr` — Light 12px, the spec's quietest tier. It is a fact about the card,
     not its headline; the bar underneath is the same fact drawn. */
  proposedTime: {
    '&.MuiTypography-root': {
      flexShrink: 0,
      fontFamily: 'Inter',
      fontSize: 12,
      fontWeight: 300,
      lineHeight: '16px',
      color: '#262527',
      fontVariantNumeric: 'tabular-nums',
      whiteSpace: 'nowrap',
    },
  },
  proposedTimeOver: { '&.MuiTypography-root': { color: SPILL_INK, fontWeight: 500 } },
  proposedSteps: { display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 4 },
  /**
   * The −/+ : 18px discs, `surface/grey-subtle` on a `Border/subtle-01` ring.
   *
   * Small — 18px against the 24px minimum a touch target wants — so the ring is doing
   * the work of saying *button* that size alone cannot.
   *
   * **The reach is bought with a pseudo-element, not a negative margin.** `margin: -5`
   * was the first attempt and it was plainly wrong once rendered: a negative margin
   * shrinks the box in *layout*, so two 18px discs with a 4px gap collapsed into 20px of
   * shared space and overlapped into a single pill. An absolutely positioned `::after`
   * takes no part in layout at all, so the pair keeps its 40px and each disc still
   * answers a 28px target.
   */
  proposedStep: {
    '&.MuiIconButton-root': {
      boxSizing: 'border-box',
      position: 'relative',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      width: 18,
      height: 18,
      padding: 0,
      flexShrink: 0,
      /* 28px of target around an 18px disc, costing nothing in the row. */
      '&::after': { content: '""', position: 'absolute', inset: -5 },
      background: '#F5F5F6',
      border: '1px solid #E6E6E7',
      borderRadius: 100,
      color: '#444446',
      transition: 'background 140ms ease, border-color 140ms ease',
    },
    '& svg': { fontSize: 10, width: 10, height: 10 },
    '&.MuiIconButton-root:hover': { background: '#E6E6E7', borderColor: '#AEAEB2' },
    '&.Mui-disabled': {
      background: '#F5F5F6 !important',
      borderColor: '#E6E6E7 !important',
      color: `${theme.palette.textDisabled} !important`,
    },
    '&.Mui-focusVisible': {
      outline: `2px solid ${theme.palette.borderBrand}`,
      outlineOffset: 1,
    },
  },
  /* 4px, fully rounded, on the spec's own pale-blue trough rather than a grey one —
     `#EEF5FF` is the brand blue's own tint, so the filled and unfilled halves are one
     colour at two strengths instead of blue-on-grey. */
  proposedBar: {
    position: 'relative',
    display: 'flex',
    alignSelf: 'stretch',
    height: 4,
    background: '#EEF5FF',
    borderRadius: 24,
    overflow: 'hidden',
  },
  proposedBarFill: {
    position: 'absolute',
    inset: 0,
    background: '#146DFF',
    borderRadius: 24,
    transformOrigin: 'left center',
    transition: 'transform 260ms ease',
  },
  proposedBarOver: { background: SPILL_LINE },
  /**
   * The stops, in a box that scrolls.
   *
   * **This is what stops a run of routes from becoming a page-long scroll.** Three
   * cards each listing eight stops is 24 rows in a quarter-width column, and the
   * planner's actual question — how do these routes compare — needs the *cards*
   * visible at once, not every row of every card. So each card's list gets its own
   * bounded, scrolling region and the column scrolls cards rather than rows.
   */
  proposedScroll: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    alignSelf: 'stretch',
    width: '100%',
    padding: '8px 0 0',
    maxHeight: 252,
    overflowY: 'auto',
    /* **And explicitly not sideways.** A bounded box with only `overflow-y` set still
       scrolls horizontally when its content will not fit, and the rows inside would not
       fit: the vertical scrollbar takes 8px off the width, and a flex row that has not
       been told it may shrink pushes its own figures out of view rather than giving them
       up. So the box refuses the axis and the rows below are taught to shrink — a row
       whose duration has scrolled off the right edge is a row with no figure at all. */
    overflowX: 'hidden',
    minWidth: 0,
  },
  /**
   * The route card's stop list: the same box, without the height cap.
   *
   * A separate key rather than an edit to `proposedScroll`, because that class is also worn
   * by the triage panel, where the cap is the point — an exception report that can grow
   * taller than the routes it is a footnote to is a footnote that has taken over. The card
   * wants the opposite: every stop visible, with the pane doing the scrolling. `overflowX`
   * and `minWidth` stay, since those guard flex rows pushing their figures out of view and
   * have nothing to do with height.
   */
  proposedBody: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    alignSelf: 'stretch',
    width: '100%',
    padding: '8px 0 0',
    overflowX: 'hidden',
    minWidth: 0,
  },

  /* `12 mi` and `1 hr 29 min` — the spec's Light 12px, primary ink. Two of these with
     a dot between them make the row's right-hand figure. */
  stopFigure: {
    '&.MuiTypography-root': {
      flexShrink: 0,
      fontFamily: 'Inter',
      fontSize: 12,
      fontWeight: 300,
      lineHeight: '16px',
      color: '#262527',
      fontVariantNumeric: 'tabular-nums',
      whiteSpace: 'nowrap',
    },
  },
  /* The 2px separator between them. `#7C92A1` — a blue-grey, not the text colour, so
     it divides without reading as punctuation someone typed. */
  stopMetaDot: {
    width: 2,
    height: 2,
    flexShrink: 0,
    borderRadius: '50%',
    background: '#7C92A1',
  },
  /* Kept in the layout at zero opacity, so the values in an open row line up under the
     collapsed row's figure instead of sliding 7px right. The spec does this too. */
  stopChevronGhost: { visibility: 'hidden' },

  /* An open row: labels left in `Grey/500`, values right-aligned in a column. */
  stopDetailLabel: {
    '&.MuiTypography-root': {
      fontFamily: 'Inter',
      fontSize: 12,
      fontWeight: 300,
      lineHeight: '16px',
      color: '#6A6A70',
    },
  },
  /* **`stopDetailLabels` is gone: the label column is `stopLabels` now.** It existed while the
     disclosure was a box of its own beneath the row, and had to restate the row's gap so the
     two would agree — the pairing hazard its own comment described. One row means one label
     column, holding the name and the breakdown labels together, so there is nothing left to
     keep in step. `stopDetailValues` below is likewise `stopValues`' business now, and stays
     only because the value *rows* inside it still need their own alignment. */

  stopDetailValues: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 16,
    flexShrink: 0,
  },
  stopDetailRow: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 6,
  },
  stopDetailValue: {
    '&.MuiTypography-root': {
      fontFamily: 'Inter',
      fontSize: 12,
      fontWeight: 300,
      lineHeight: '16px',
      color: '#262527',
      fontVariantNumeric: 'tabular-nums',
      whiteSpace: 'nowrap',
    },
  },

  /**
   * ---------- what did not fit ----------
   *
   * The amber wash, the hairline and the ink are `SPILL_WASH` / `SPILL_LINE` /
   * `SPILL_INK` — the same three this file already names for the spill ribbon and the
   * unplaced box. A fourth amber for the same meaning is how a palette stops meaning
   * anything.
   */
  notIncluded: {
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    padding: 16,
    gap: 12,
    /* The spec's own pair, and warmer than this file's `SPILL_*` trio: `#FEF1E8` on
       `#FFE8C7` is an orange wash where the spill ribbon's is a yellow one. Kept
       separate rather than folded into `SPILL_WASH`, because the ribbon marks *this
       route overran* and this marks *these visits have no route at all* — the second is
       the louder fact and the spec gives it the louder ground. */
    background: '#FEF1E8',
    border: '1px solid #FFE8C7',
    borderRadius: 8,
    marginBottom: 12,
  },
  notIncludedHead: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    alignSelf: 'stretch',
    minWidth: 0,
  },
  notIncludedHeadLeft: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minWidth: 0,
  },
  notIncludedIcon: { width: 12, height: 12, flexShrink: 0, color: '#F57C00', display: 'block' },
  notIncludedTitle: {
    '&.MuiTypography-root': {
      minWidth: 0,
      fontFamily: 'Inter',
      fontSize: 14,
      fontWeight: 600,
      lineHeight: '20px',
      /* `Orange/700`. Darker than the pin and the rule so it carries a sentence — the
         `#F57C00` those use fails contrast as body copy on this wash. */
      color: '#C64308',
    },
  },
  /* The cost of the exclusion, in the same register as a route's own figure — this is
     the work that has to go somewhere, and its size is the decision. */
  notIncludedTotal: {
    '&.MuiTypography-root': {
      flexShrink: 0,
      fontFamily: 'Inter',
      fontSize: 12,
      fontWeight: 300,
      lineHeight: '16px',
      color: '#262527',
      fontVariantNumeric: 'tabular-nums',
      whiteSpace: 'nowrap',
    },
  },
  /* The remedies, as a sentence. Ink rather than the title's weight: it is the
     instruction, not the headline. */
  notIncludedHelp: {
    '&.MuiTypography-root': {
      alignSelf: 'stretch',
      margin: 0,
      fontFamily: 'Inter',
      fontSize: 12,
      fontWeight: 300,
      lineHeight: '16px',
      color: '#262527',
    },
  },

  /* ---------- the rule ----------
     The need-by window and the radius are each a `field` now, same as the four controls
     above them — a label, a stepper, a hint — rather than a strip of their own. See
     `RuleStrip`. */

  /* **`optionPills` / `optionPill` are gone with `OptionPills` itself.** The segmented
     control drew the need-by window as four fixed choices — a long weekend, a working week,
     a week either side, a fortnight — on the argument that a planner picks one of a closed
     set. The supplied design makes both numeric fields a stepper, which reopens the set: the
     window is any number of days between `NEED_BY_MIN` and `NEED_BY_MAX` again, and the
     remedy link can now set the exact figure it names instead of snapping up to the next
     pill. Nothing else in the app used either key. */

  /**
   * ---------- a number, as a label and two discs ----------
   *
   * **One control for both numeric knobs, from the supplied design.** The radius and the
   * need-by window have each worn three shapes in three passes — a boxed stepper, a
   * segmented set of pills, a slider — and the churn was the symptom of treating them as
   * different questions. They are the same question twice: a quantity with a floor, a
   * sensible default, and a live consequence somewhere else on the screen. So they get one
   * row shape, and a planner learns it once.
   *
   * The row is **name and consequence on the left, value between two discs on the right**.
   * That inverts the column's other fields, where the label sits *above* its control, and it
   * earns the exception by being half the height: a stepper needs no width, so putting it
   * beside the label rather than under it saves a 44px line per field — 88px in a column
   * that has to hold six of them plus a footer.
   *
   * **The sub-label is where the coverage count went**, and that is the reason this shape is
   * worth the exception. `Covers 5 of 10 visits` under `Radius` is the answer to the question
   * the disc on the right is being pressed to change; as a separate hint line below a boxed
   * field it was the same words three rows away from the control.
   */
  counterField: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    minWidth: 0,
  },
  /* The label stack takes the slack, so the discs sit hard right whatever the label says
     and the two fields' controls line up with each other. */
  counterText: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  counterLabel: {
    '&.MuiTypography-root': {
      fontFamily: 'Inter',
      fontSize: 14,
      fontWeight: 500,
      lineHeight: '20px',
      color: theme.palette.textPrimary,
    },
  },
  counterHint: {
    '&.MuiTypography-root': {
      fontFamily: 'Inter',
      fontSize: 12,
      fontWeight: 300,
      lineHeight: '16px',
      color: '#6A6A70',
    },
  },
  counterControl: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    flexShrink: 0,
  },
  /**
   * The disc.
   *
   * A filled circle with no border, which is what the design draws and is also the honest
   * shape for this: a bordered rectangle says *type into me*, and neither of these values is
   * typed any more. 32px gives a 32×32 target — past the 24px minimum, and small enough that
   * two of them plus a value fit the right-hand third of a 300px column.
   */
  counterButton: {
    width: 32,
    height: 32,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
    border: 0,
    borderRadius: '50%',
    background: theme.palette.surfaceGreySubtle,
    color: theme.palette.textSecondary1,
    cursor: 'pointer',
    transition: 'background 140ms ease, color 140ms ease',
    '&:hover': {
      background: theme.palette.borderSubtle1,
      color: theme.palette.textPrimary,
    },
    '&:active': { background: theme.palette.borderSubtle2 },
    /* At an end of the range the press would do nothing, so it says so rather than accepting
       the click and ignoring it. The disc keeps its ground and loses its ink: greying the
       fill as well would make the pair look like two different controls. */
    '&:disabled': {
      color: theme.palette.textDisabled,
      cursor: 'default',
      background: theme.palette.surfaceGreySubtle,
    },
    '&:focus-visible': {
      outline: `2px solid ${theme.palette.borderBrand}`,
      outlineOffset: 2,
    },
  },
  counterButtonIcon: { width: 12, height: 12, display: 'block' },
  /**
   * The value between them.
   *
   * A fixed minimum width and `tabular-nums`, so the two discs do not walk apart as the
   * figure crosses `9 → 10` or the unit appears. 44px holds `± 14` and `125 mi`; past that
   * the cell grows and the discs move once rather than on every press.
   */
  counterValue: {
    '&.MuiTypography-root': {
      minWidth: 44,
      textAlign: 'center',
      fontFamily: 'Inter',
      fontSize: 14,
      fontWeight: 600,
      lineHeight: '20px',
      color: theme.palette.textPrimary,
      fontVariantNumeric: 'tabular-nums',
      whiteSpace: 'nowrap',
    },
  },

  /**
   * Visually hidden, and load-bearing rather than decorative.
   *
   * The −/+ buttons deliberately do not move focus when pressed — the same choice the
   * hand-rolled pill made — so a screen reader sitting on one of them never lands on the
   * field whose value the press just changed. This carries the same text a sighted
   * planner reads in the field, `aria-live="polite"`, so that value is announced anyway.
   */
  srOnly: {
    position: 'absolute',
    width: 1,
    height: 1,
    padding: 0,
    margin: -1,
    overflow: 'hidden',
    clip: 'rect(0 0 0 0)',
    whiteSpace: 'nowrap',
  },
  /* `ruleOutcome`, `ruleDots`, `ruleDot`, `ruleDotIn`, `ruleDotOut`, `ruleCount` and
     `ruleCountMuted` were all here and are all gone. They drew `7 of 14 visits qualify`
     with a mark per visit, which on the screen that matters — the one where the rule
     refuses everything — was `0 of 5` over five hollow circles: a scoreboard reporting a
     loss in the one region that cannot act on it. The footer counts what is not included,
     beside the button it affects, and the triage names the reasons and the remedies. */

  /* ---------- map ----------
     A card, not a full-bleed band. It used to run edge to edge while every other
     block in the drawer sat on a 24px inset, so the one element that is a *figure*
     was the one element with no margin around it — it read as a seam across the
     panel rather than as a thing you can look at and touch.

     Structured for what comes next: `mapCard` owns the inset and the rhythm,
     `mapSurface` owns the rounded clip and is the positioned stacking context that
     overlays (hover cards, a moving vehicle, a drawn route, a re-fit control) hang
     off, and `mapLegend` is a separate strip so adding a key for a new mark never
     touches the map itself. */
  mapCard: {
    flexShrink: 0,
    padding: '16px 24px',
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
  },
  /* **The map is mounted late, and that is the point.** It does not exist while the
     optimizer composes, so the first frame the planner ever sees of it already has
     the answer on it: the line drawing itself from the start point outward, pins
     landing as it reaches them. A map that had been sitting there empty for two
     seconds and then sprouted a line would be a diagram updating; this is a route
     being made.

     Mounting late is also the only way `fitBounds` is correct — a map measured
     inside a hidden or zero-height container fits to nothing and throws the
     viewport away, which §7.62 records as the animation-killer on this screen.

     The entrance is a rise and a fade, no scale: a map that zooms on arrival
     implies the *geography* moved. Deliberately shorter than the line's own draw
     so the card has settled before the route finishes drawing on it. */
  mapCardEnter: {
    animation: '$mapCardIn 300ms cubic-bezier(0.2, 0.8, 0.2, 1) both',
  },
  '@keyframes mapCardIn': {
    from: { opacity: 0, transform: 'translateY(10px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
  },
  /**
   * 288px, up from 240.
   *
   * The panel now carries a 10km ring as well as the route, and the fit is decided by
   * the *shorter* axis — so at 240px a 680px-wide drawer was choosing a zoom two steps
   * out from what the width could have shown, and the whole plan arrived as a knot of
   * overlapping pins in the middle third of the map. 48px of height buys back a zoom
   * level, which is the difference between a cluster and a route.
   */
  mapSurface: {
    position: 'relative',
    height: 288,
    borderRadius: 12,
    overflow: 'hidden',
    border: `1px solid ${theme.palette.borderSubtle1}`,
    background: theme.palette.surfaceGreySubtle,
    [theme.breakpoints.down('sm')]: { height: 180 },
  },
  /* Sits over the map rather than replacing it, so a route being recalculated
     does not tear the geography down and rebuild it. */
  mapPending: {
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
    background: `linear-gradient(90deg, transparent, ${theme.palette.surfaceWhite}33, transparent)`,
  },
  mapPlaceholder: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: theme.palette.surfaceGreySubtle,
  },
  mapPlaceholderText: {
    '&.MuiTypography-root': { fontSize: 12, color: theme.palette.textSecondary3 },
  },
  /* Horizontally scrollable so a longer key never wraps into a second row and
     shoves the map up — the drawer is a fixed width and the legend is the part
     that should give. */
  mapLegend: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    overflowX: 'auto',
    scrollbarWidth: 'none',
    '&::-webkit-scrollbar': { display: 'none' },
  },

  /* ---------- the map as a region rather than a card ----------
     The three-column workspace hands the map half the screen and all of its height, so
     there is nothing to inset and nothing to stack: `mapPane` is the region, its surface
     fills it, and the legend floats over the bottom of it. A fixed-height card inside a
     900px column would have left most of that height empty, and the legend as a strip
     underneath would have cost the map 40px of the one axis this layout is generous
     with. */
  mapPane: {
    flex: 1,
    minHeight: 0,
    position: 'relative',
    display: 'flex',
  },
  mapPaneSurface: {
    /* 8px, and `overflow: hidden` is what makes it apply to the tiles and the SVG inside
       rather than only to the box. The square corners this replaces were justified by the
       map running to the edge of the screen; it no longer does — see `mapPane`. */
    borderRadius: 8,
    position: 'relative',
    flex: 1,
    minWidth: 0,
    minHeight: 0,
    /* Square corners and no border: it runs to the edges of the screen, where the
       viewport is its frame. */
    overflow: 'hidden',
    background: theme.palette.surfaceGreySubtle,
  },
  /* **No hint plate on the map.** *Click the map to set the start point* sat top-left on the
     legend's own plate, and it was the second thing on this screen explaining a control that
     is already explained: the field it moves is directly to the left, labelled, with the
     address in it. On a map whose whole left edge is a column of instructions, an overlay
     repeating one of them is chrome — and it covered the top-left corner of the geography,
     which on a north-west-heavy round is where the work is. The gesture still works. */

  /* Over the map, bottom-left, on a plate — the keys have to stay legible against
     whatever street detail happens to be under them. Left of centre so it never lands
     on the tile renderer's own attribution, which sits bottom-right and is a condition
     of using the tiles. */
  mapLegendOverlay: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    zIndex: 2,
    maxWidth: 'calc(100% - 140px)',
    padding: '8px 12px',
    borderRadius: 10,
    background: 'rgba(255, 255, 255, 0.94)',
    border: `1px solid ${theme.palette.borderSubtle1}`,
    boxShadow: '0 4px 16px rgba(16, 24, 40, 0.08)',
  },
  mapLegendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    flexShrink: 0,
  },
  mapLegendText: {
    '&.MuiTypography-root': {
      fontSize: 11,
      lineHeight: '16px',
      color: theme.palette.textSecondary1,
      whiteSpace: 'nowrap',
    },
  },
  mapLegendDot: {
    width: 10,
    height: 10,
    borderRadius: '50%',
    flexShrink: 0,
    border: `2px solid ${theme.palette.surfaceWhite}`,
    boxSizing: 'content-box',
  },
  /* A ring, for the mark that is a *position* rather than a stop — the key has to
     distinguish the two by shape, not only by colour, because the device mark and
     the visit pins are both drawn in the brand colour. */
  mapLegendRing: {
    width: 10,
    height: 10,
    borderRadius: '50%',
    flexShrink: 0,
    border: '3px solid',
    boxSizing: 'border-box',
  },
  /* ---------- keyless tile map ----------
     Fills the surface exactly as the Google map does, so which renderer is in use
     changes what is drawn and nothing about the layout. */
  tileMapRoot: {
    position: 'absolute',
    inset: 0,
    overflow: 'hidden',
    cursor: 'grab',
    touchAction: 'none',
    background: theme.palette.surfaceGreySubtle,
    '&:active': { cursor: 'grabbing' },
  },
  tileMapTile: {
    position: 'absolute',
    width: 256,
    height: 256,
    userSelect: 'none',
    pointerEvents: 'none',
  },
  /* A stop pin scales about its own centre when it lands. Without `fill-box` an SVG
     transform-origin resolves against the whole viewBox, so the pin would arrive from
     the map's top-left corner instead of growing in place. */
  /**
   * The animated wrapper, scaling about the point the pin names.
   *
   * `bottom center` rather than `center`, and that changed with the artwork: a disc scales
   * about its middle, and a teardrop has to scale about its **tip**, because the tip is the
   * coordinate. About the middle, a pin swelling to claim its stop slides visibly north of
   * the site — at a 10km zoom, a street or two away from the place it is naming.
   */
  tileMapPin: {
    transformBox: 'fill-box',
    transformOrigin: 'bottom center',
    /* The paint transitions live here rather than on the shapes, because the shapes are
       `MapPins`' business now and a marker component should not have to know that this map
       animates elimination. */
    '& path': { transition: 'fill 420ms ease, stroke 420ms ease' },
    '& text': { transition: 'opacity 320ms ease 120ms' },
  },
  /**
   * The state wrapper: sequenced, candidate, or ruled out, as a size.
   *
   * Transitioned rather than snapped for the same reason the fill is — the reveal's subject
   * is *elimination*, and a viewer has to be able to see which pins went out and follow
   * them going. Separate from the wrapper above so the state and the motion compose
   * instead of overwriting one another; see the note in `MapPins`.
   */
  tileMapPinState: {
    transformBox: 'fill-box',
    transformOrigin: 'bottom center',
    transition: 'transform 420ms cubic-bezier(0.2, 0.8, 0.2, 1)',
    '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
  },
  /**
   * A place changing state, rather than one place being replaced by another.
   *
   * `fill`, `r` and `stroke-width` are all animatable geometry/paint properties, and they
   * are transitioned rather than snapped for one reason: the reveal's subject is
   * *elimination*, and a viewer has to be able to see which pins went out and follow them
   * going. 420ms is long enough to track a colour across a 288px panel and short enough
   * that four of them going at once still reads as one event.
   *
   * This only works because both states are the same keyed element — see `marks` in
   * `TileRouteMap`. Two arrays would unmount one and mount the other, and there is
   * nothing to transition between a node that has gone and a node that has arrived.
   */
  tileMapPinBody: {
    transition: 'fill 420ms ease, stroke 420ms ease',
  },
  /* The number fades up as the sequence claims the stop. Rendered at `opacity: 0` from
     the start so there is something to transition from. */
  tileMapPinNumber: {
    transition: 'opacity 320ms ease 120ms',
  },
  /**
   * The radius, arriving on the line that names it.
   *
   * A CSS `transform` rather than an animation on `r`, because `r` is computed from the
   * zoom on every render and a keyframe would fight the pan. The scale is small — 0.88 to
   * 1 — since this is a boundary settling into place, not a shockwave.
   */
  tileMapRing: {
    animation: '$ringIn 820ms cubic-bezier(0.22, 0.61, 0.36, 1) both',
    '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
  },
  '@keyframes ringIn': {
    from: { opacity: 0, transform: 'scale(0.88)' },
    to: { opacity: 1, transform: 'scale(1)' },
  },
  /* Marks sit above the tiles but must not swallow the pan gesture — only the
     shapes themselves take pointer events. */
  tileMapOverlay: {
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
    '& circle, & g, & text': { pointerEvents: 'auto' },
  },
  /* Anchored to the pin and lifted clear of it, translated so the tip sits on the
     marker rather than the corner. */
  tileMapBubble: {
    position: 'absolute',
    transform: 'translate(-50%, -100%)',
    zIndex: 4,
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    minWidth: 150,
    maxWidth: 220,
    padding: '10px 12px',
    borderRadius: 8,
    background: theme.palette.surfaceWhite,
    border: `1px solid ${theme.palette.borderSubtle1}`,
    boxShadow: '0 6px 16px rgba(16, 24, 40, 0.14)',
  },
  tileMapZoom: {
    position: 'absolute',
    right: 8,
    top: 8,
    zIndex: 3,
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  tileMapZoomButton: {
    '&.MuiButtonBase-root': {
      minWidth: 26,
      width: 26,
      height: 26,
      padding: 0,
      fontSize: 16,
      lineHeight: 1,
      borderRadius: 6,
      background: theme.palette.surfaceWhite,
      border: `1px solid ${theme.palette.borderSubtle2}`,
      color: theme.palette.textPrimary,
      '&:hover': { background: theme.palette.surfaceGreySubtle },
    },
  },
  tileMapAttribution: {
    position: 'absolute',
    right: 6,
    bottom: 4,
    zIndex: 3,
    padding: '1px 5px',
    borderRadius: 4,
    background: `${theme.palette.surfaceWhite}CC`,
    '&.MuiTypography-root': {
      fontSize: 9,
      lineHeight: '13px',
      color: theme.palette.textSecondary1,
    },
  },

  /* The Places field. Its own component ships styles sized for the site form's
     in-map search bar, so this normalises it to this drawer's 44px form rhythm and
     puts the suggestion list above everything below it — the list is absolutely
     positioned, and without a stacking context it opened *behind* the map card. */
  addressSearch: {
    position: 'relative',
    zIndex: 3,
    '& .MuiTextField-root': { width: '100%' },
    '& .MuiInputBase-root': { height: 44 },
    /* No `fontSize` here. The theme's 16px/24px is the spec, and this line used to
       override it to 14 — see the note on `field`. */
  },
  addressSuggestions: {
    '&.MuiList-root': {
      position: 'absolute',
      top: 'calc(100% + 4px)',
      left: 0,
      right: 0,
      zIndex: 5,
      maxHeight: 220,
      overflowY: 'auto',
      padding: '4px 0',
      background: theme.palette.surfaceWhite,
      border: `1px solid ${theme.palette.borderSubtle1}`,
      borderRadius: 8,
      boxShadow: '0 8px 20px rgba(16, 24, 40, 0.14)',
    },
  },
  addressSuggestion: {
    '&.MuiListItem-root': {
      cursor: 'pointer',
      padding: '6px 12px',
      '&:hover': { background: theme.palette.surfaceGreySubtle },
    },
    '& .MuiTypography-root': {
      fontSize: 13,
      lineHeight: '18px',
      color: theme.palette.textPrimary,
    },
  },

  /* InfoWindow content. Google owns the bubble's frame, so this only styles what
     goes inside it — and keeps it narrow, because a bubble wider than the pin
     cluster covers the route it is describing. */
  mapBubble: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    minWidth: 150,
    maxWidth: 220,
    padding: '2px 2px 4px',
  },
  mapBubbleTitle: {
    '&.MuiTypography-root': {
      fontSize: 13,
      fontWeight: 600,
      lineHeight: '18px',
      color: theme.palette.textPrimary,
    },
  },
  /* Why the pin is grey, inside the bubble. Sized under the site name and allowed to
     wrap to two lines — the sentence carries a date or a distance, and truncating the
     number is truncating the whole point of it. */
  mapBubbleReason: {
    '&.MuiTypography-root': {
      fontSize: 11,
      fontWeight: 400,
      lineHeight: '15px',
      color: theme.palette.textSecondary2,
      maxWidth: 190,
    },
  },
  mapBubbleAction: {
    '&.MuiButtonBase-root': {
      height: 30,
      minWidth: 'auto',
      padding: '0 12px',
      fontSize: 12,
      textTransform: 'none',
      alignSelf: 'flex-start',
    },
  },

  /* States what the drawer is filling in on the planner's behalf, so a form with
     one field does not read as a form that forgot the rest. */
  derivedNote: {
    '&.MuiTypography-root': {
      fontSize: 11,
      lineHeight: '16px',
      color: theme.palette.textSecondary1,
      marginTop: 2,
    },
  },
  mapLegendLine: {
    width: 16,
    height: 3,
    borderRadius: 2,
    flexShrink: 0,
  },

  /* ---------- meter ----------
     The answer. Work already on the runsheet is its own segment so "no room"
     always shows what is taking the room. */
  meterBlock: {
    padding: '16px 24px',
    borderTop: `1px solid ${theme.palette.borderSubtle1}`,
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    position: 'sticky',
    top: 0,
    zIndex: 2,
    background: theme.palette.surfaceWhite,
  },
  /**
   * The meter carries the route card's own inset, because it had none.
   *
   * Measured inside one open card: the meter's rows ran **744 → 1366**, the fields
   * above them **756 → 1354**, and the stop track **768 → 1342** — three different
   * left edges and three different right ones inside a single card. The meter was the
   * flush one, so its bar ran border to border and `4h 18m left` ended at 1366
   * against a card edge at 1367, which reads as clipped text rather than as a value
   * sitting at the margin.
   *
   * The card's own padding is now the one horizontal inset, and the
   * two blocks that had their own — this and the stop list — read it.
   */
  /* **First in the card body now, not last.** §3's own layout puts the meter above
     the merge control, and `DayMeter`'s docstring says why — switching the target back
     to a new runsheet empties the "already on route" segment *in front of the
     planner*, which only works if the control is directly underneath. The build had
     it the other way round: fields, then the list, then the meter at the bottom of a
     card whose list can be 500px tall. The answer was the last thing in the payoff
     region. Padding is symmetrical because it now has a hairline under it rather than
     a card edge. */
  meter: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    padding: '12px 0 14px',
  },
  meterTopLine: { display: 'flex', alignItems: 'baseline', gap: 6 },
  meterTotal: {
    '&.MuiTypography-root': {
      fontSize: 22,
      fontWeight: 700,
      letterSpacing: '-0.02em',
      color: theme.palette.textPrimary,
      fontVariantNumeric: 'tabular-nums',
    },
  },
  meterOf: {
    '&.MuiTypography-root': { fontSize: 12, color: theme.palette.textSecondary3 },
  },
  meterRemaining: {
    '&.MuiTypography-root': {
      fontSize: 12,
      fontWeight: 600,
      color: theme.palette.textSecondary2,
      fontVariantNumeric: 'tabular-nums',
    },
  },
  meterRemainingOver: { '&.MuiTypography-root': { color: theme.palette.textAlert } },
  /* Neutral, not amber. "Estimated" is a statement about precision, not a warning:
     the figure is straight-line rather than road distance because there is no
     Directions answer. Amber made a routine fallback look like a problem, and it
     competed with the over-budget figure on the same row — which *is* a warning. */
  estimatedPill: {
    fontSize: 10,
    fontWeight: 600,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
    padding: '2px 6px',
    borderRadius: 4,
    color: theme.palette.textSecondary2,
    background: theme.palette.surfaceGreyLight,
  },
  /* Plain flex segments, and deliberately not animated. Width is a layout
     property, so transitioning it thrashes; the transform-based alternative
     needs compositor layers that never settle here. A readout that snaps to its
     new value is the honest option, and nobody misses the tween. */
  /**
   * The trough, dark enough to be a trough.
   *
   * It was `surfaceGreyLight` (`#f6f6f6`) on a white card, which is a 1% step — so the
   * bar had no visible extent and simply appeared to stop wherever the fill ended.
   * `borderSubtle1` is the hairline weight used everywhere else in this drawer, and a
   * bar that shows its own length is the only way `3h 42m of 8h` has a picture.
   */
  meterTrack: {
    position: 'relative',
    display: 'flex',
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
    background: theme.palette.borderSubtle1,
  },
  /* **`flexShrink: 0`, and it is a correctness fix, not a tidy-up.** The three
     segments are sized against the same scale and therefore sum to exactly 100% of
     the track. They used to sum to *more*, because an over-budget day drew a fourth
     amber segment for the excess on top of a travel segment that already contained
     it — 120% of the track, which flex then quietly shrank by 1/1.2, so every
     segment under-reported and the amber read as 16.7% of a bar where the excess was
     20% of the scale. Nothing on screen looked broken; the numbers were simply all
     wrong together. The excess is a *band drawn over* the segments now — see
     `meterOverBand` — because "past eight hours" is a mark on the scale, not a
     quantity of work. */
  meterSegment: { minWidth: 0, flexShrink: 0 },
  meterExisting: { background: theme.palette.borderSubtle2 },
  meterService: { background: theme.palette.surfaceBrand },
  /**
   * **Driving is a mid-tone of the brand, not the subtle wash.**
   *
   * `surfaceBrandSubtle` resolves to `#E8F7ED` on this tenant — a near-white pale
   * green — and it was sitting next to a near-white trough. The result was a bar whose
   * second segment could not be told from its empty remainder, and a legend swatch
   * that looked like a blank square. It was the one number in the meter that the
   * picture failed to show.
   *
   * Derived from `surfaceBrand` by opacity rather than picked as a literal, so it
   * stays a shade of whatever brand the tenant actually has — the wash and the strong
   * tone are separate tokens and can be recoloured independently, which is how the two
   * drifted into being the same value here.
   */
  meterTravel: { background: theme.palette.surfaceBrand, opacity: 0.4 },
  /**
   * Where the eight hours ran out, drawn on the bar.
   *
   * The bar's scale stretches past the man-day when the day overruns, and until now
   * nothing on it marked where the man-day actually was — so `9h 12m of 8h` had a
   * full bar and no picture of the 1h 12m. This is a wash and a hairline laid over
   * the segments from the budget mark to the end: the work keeps its own colours
   * (that is what is taking the room) and the band says which part of it is past the
   * day. Amber from the spill family, because "did not fit" is the same idea the
   * ribbon and the footer caveat are written in.
   *
   * `pointerEvents: none` so it never eats a hover from anything underneath.
   */
  meterOverBand: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    pointerEvents: 'none',
    background: `${SPILL_LINE}99`,
    borderLeft: `1px solid ${SPILL_INK}`,
  },
  /* Travel is the only unknown while directions are in flight, so it is the
     only thing that pulses. */
  meterPending: {
    animation: '$pulse 1.1s ease-in-out infinite',
    background: theme.palette.borderSubtle2,
  },
  '@keyframes pulse': {
    '0%, 100%': { opacity: 0.45 },
    '50%': { opacity: 0.85 },
  },
  meterLegend: { display: 'flex', flexWrap: 'wrap', gap: 14 },
  legendItem: { display: 'flex', alignItems: 'center', gap: 6 },
  swatch: { width: 8, height: 8, borderRadius: 2 },
  swatchExisting: { background: theme.palette.borderSubtle2 },
  swatchService: { background: theme.palette.surfaceBrand },
  /* Same 40% brand as the segment it keys. A legend whose swatch is a different value
     from its bar is a legend that has to be taken on trust. */
  swatchTravel: { background: theme.palette.surfaceBrand, opacity: 0.4 },
  legendText: {
    '&.MuiTypography-root': { fontSize: 12, color: theme.palette.textSecondary3 },
  },

  /* ---------- the day, itemised ----------
     A disclosure under the legend, shut by default. The bar and the legend say how full
     the day is and which three things fill it; these rows say where the on-site half
     comes from, which is the figure the whole feature's argument turns on. Shut, because
     the total they add up to is already printed at 22px eighty pixels above them — see
     `DayMeter`'s docstring for why it lives above the merge control and not below. */
  breakdown: { display: 'flex', flexDirection: 'column' },
  /* The routes column's `workingToggle`, brought into this file for the card's own
     disclosure: chevron, 12px label, no border and no fill. `alignSelf` because `meter`
     is a stretching flex column and a button that spans the card is a hit area that
     reaches 200px past the words it belongs to. */
  breakdownToggle: {
    alignSelf: 'flex-start',
    appearance: 'none',
    border: 'none',
    background: 'none',
    padding: '2px 0',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    font: 'inherit',
    fontSize: 12,
    fontWeight: 500,
    color: theme.palette.textSecondary3,
    '&:hover': { color: theme.palette.textSecondary2 },
    '&:focus-visible': {
      outline: `2px solid ${theme.palette.surfaceBrand}`,
      outlineOffset: 2,
      borderRadius: 3,
    },
  },
  /* Points down shut and up open — the chevron is the affordance, so it is the thing
     that has to move rather than the label changing under a static arrow. */
  breakdownChevron: { width: 12, height: 12, flexShrink: 0, transition: 'transform 200ms ease' },
  breakdownChevronOpen: { transform: 'rotate(180deg)' },
  /* `paddingTop`, not a margin: `Collapse` measures the height of its own wrapper and a
     top margin on the child escapes that measurement, so the panel animates to a height
     eight pixels short of the one it settles at. */
  breakdownRows: { paddingTop: 8, display: 'flex', flexDirection: 'column', gap: 2 },
  breakdownRow: { display: 'flex', alignItems: 'center', gap: 8, minHeight: 17 },
  /* The hairline is the sum rule. Two pixels of margin above it and six below keep the
     total attached to the rows it closes rather than floating between them and the
     merge control underneath. */
  breakdownRowTotal: {
    marginTop: 4,
    paddingTop: 6,
    borderTop: `1px solid ${theme.palette.borderSubtle1}`,
  },
  breakdownLabel: {
    '&.MuiTypography-root': {
      fontSize: 12,
      lineHeight: '17px',
      color: theme.palette.textSecondary2,
    },
  },
  breakdownLabelTotal: {
    '&.MuiTypography-root': { fontWeight: 600, color: theme.palette.textPrimary },
  },
  /* 11px and `textSecondary3`, a step under its own row's label — this is the working,
     not the answer, and at label weight four of them read as a second column of facts
     competing with the figures on the right. Truncates rather than wrapping: a row that
     grows to two lines to finish saying `× 20 min` has cost more than the phrase is
     worth, and the tip beside the label carries the same mechanism in full. */
  breakdownDetail: {
    '&.MuiTypography-root': {
      minWidth: 0,
      fontSize: 11,
      lineHeight: '17px',
      color: theme.palette.textSecondary3,
      fontVariantNumeric: 'tabular-nums',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
  },
  /* Right-aligned in a fixed column, `tabular-nums`, so the four figures and their total
     stack into one column of digits. That is the entire point of an itemised day: a
     breakdown whose numbers do not line up cannot be added up by looking, which is the
     only way anybody was ever going to check it. */
  breakdownValue: {
    '&.MuiTypography-root': {
      flexShrink: 0,
      minWidth: 52,
      textAlign: 'right',
      fontSize: 12,
      lineHeight: '17px',
      fontWeight: 500,
      color: theme.palette.textSecondary1,
      fontVariantNumeric: 'tabular-nums',
    },
  },
  breakdownValueTotal: {
    '&.MuiTypography-root': { fontWeight: 700, color: theme.palette.textPrimary },
  },

  /* ---------- scrolling body ----------
     Only the header and the commit bar are fixed. Everything else scrolls,
     because a 240px map plus the controls plus the meter can add up to more
     than a short viewport has, and the list is what must never be squeezed to
     nothing. `minHeight: 0` is what actually lets a flex child scroll. */
  scroll: {
    flex: '1 1 auto',
    minHeight: 0,
    overflowY: 'auto',
    overflowX: 'hidden',
    /* Reserve the gutter whether or not the content currently overflows, so the
       footer's matching `SCROLLBAR_W` correction is right in both cases rather than
       only while a scrollbar happens to be present. */
    scrollbarGutter: 'stable',
  },
  /**
   * **Retired, and kept only as the record of why.**
   *
   * While the optimizer composed there used to be nothing below the fold, so the body
   * became a column, the stage took whatever the controls left over, and the overflow
   * was hidden — a scrollbar that appears for two seconds and then leaves being the most
   * movement on a screen that is trying to explain something.
   *
   * The map is now mounted for that whole span, because the map is where the explaining
   * happens. Controls plus stage plus a 288px map is taller than the drawer, so hiding
   * the overflow cropped the map's own legend and refused to let anyone scroll to it.
   * Nothing sets this class; it is left here because the next person to see a scrollbar
   * flicker during the reveal will reach for exactly this, and the reason it went is
   * worth more than the four lines it costs.
   *
   * Note the body is a single scroll container, not fixed chrome. Pinning the controls
   * outside it is what produced the `height: 0` scroll area recorded in §10 — the fixed
   * header and footer already spend the drawer's budget.
   */
  scrollComposing: {
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'hidden',
  },

  /**
   * A section's name inside a card — *Stops, in order*.
   *
   * Sentence case, following the column headings. It was 11px uppercase with tracking, and
   * once the three column headings stopped shouting this was the only label left doing it:
   * one caps run among five sentence-case ones reads as an inconsistency rather than as a
   * hierarchy. The 12px and the grey are what place it below the card's own title; it does
   * not need capitals as well to be understood as a sub-heading.
   */
  sectionLabel: {
    '&.MuiTypography-root': {
      fontSize: 12,
      fontWeight: 600,
      color: theme.palette.textSecondary3,
    },
  },
  linkButton: {
    border: 0,
    background: 'none',
    padding: 0,
    cursor: 'pointer',
    font: 'inherit',
    fontSize: 12,
    fontWeight: 600,
    color: theme.palette.textBrand,
    '&:hover': { textDecoration: 'underline' },
  },

  /* ---------- route options ---------- */
  options: {
    padding: '14px 24px 4px',
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  optionMetaText: {
    '&.MuiTypography-root': {
      fontSize: 12,
      color: theme.palette.textSecondary2,
      fontVariantNumeric: 'tabular-nums',
    },
  },
  optionRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '7px 10px',
    borderRadius: 8,
    cursor: 'pointer',
    border: '1px solid transparent',
    '&:hover': { background: theme.palette.surfaceGreySubtle },
  },
  optionRowActive: {
    background: theme.palette.surfaceBrandSubtle,
    borderColor: theme.palette.surfaceBrand,
    '&:hover': { background: theme.palette.surfaceBrandSubtle },
  },
  radio: {
    '&.MuiRadio-root': {
      padding: 0,
      color: theme.palette.borderSubtle2,
      '&.Mui-checked': { color: theme.palette.surfaceBrand },
    },
  },
  optionName: {
    '&.MuiTypography-root': {
      fontSize: 14,
      color: theme.palette.textPrimary,
      flex: 1,
      minWidth: 0,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
  },
  optionTime: {
    '&.MuiTypography-root': {
      fontSize: 14,
      fontWeight: 600,
      color: theme.palette.textPrimary,
      fontVariantNumeric: 'tabular-nums',
      flexShrink: 0,
      textAlign: 'right',
    },
  },
  optionFit: {
    '&.MuiTypography-root': {
      fontSize: 12,
      color: theme.palette.textSuccess,
      flexShrink: 0,
      textAlign: 'right',
      minWidth: 66,
    },
  },
  optionFitPartial: { '&.MuiTypography-root': { color: theme.palette.textWarning } },

  /* ---------- stop list ----------
     The rows are a fixed three-column grid: grip, index, body. Every other
     element in the timeline — the start/end anchors, the drive-time lines —
     indents to the same two constants, so a change here moves the whole
     column rather than knocking one row out of line. */
  /* The **drawer-level** list — the unordered set of visits shown before a route
     solves. It sits directly in the scroll body, so it carries the drawer's own 24px
     inset like every other block there. */
  stopList: { padding: '10px 24px 4px' },
  /* The **in-card** list. Same component, different container: this one is inside a
     route card, which has its own narrower inset, and inheriting the drawer's 24 was
     what put the stop track 24px right of the card's fields and 24px right of its
     meter. */
  /* The hairline is new: the card body is three blocks now — meter, destination
     fields, sequence — and hairlines are how this drawer separates blocks. Cards
     inside cards was the alternative and §"the run of routes" rules it out. */
  /* **No hairline above the stops any more.** It sat immediately under the route's own
     progress bar, so the card had two horizontal rules 12px apart — the bar, which is
     data, and a divider, which is chrome — and the divider made the stop list read as a
     separate panel bolted under the head rather than as the head's own detail. The 12px
     of space says the same thing without drawing anything. */
  routeStops: {
    padding: '12px 0 8px',
  },
  stopListHeader: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 },
  /**
   * *This is your order, not the optimizer's* — inside the card, above the stops it is about.
   *
   * **It replaces a two-word pill and a link.** `Your order` in 10px uppercase beside a
   * `Re-optimize` link was accurate and said nothing: it named the state without naming the
   * consequence, which is that the route is no longer the shortest round the solver found
   * and will not be re-solved as the planner keeps working. A planner who drags one stop to
   * group two sites together has traded driving time for something they wanted, and they
   * are entitled to know they made the trade.
   *
   * **Amber, not red, and not a modal.** Nothing is broken and nothing is at risk — the
   * plan is valid, it is simply theirs now. It is also not a question: asking *are you
   * sure?* on a drag would make the primary editing gesture of this screen cost two
   * actions, and the answer is always yes, because they just did it deliberately. So it
   * states the consequence and keeps the one control that undoes it.
   *
   * The same amber family as the spill ribbon — `SPILL_INK` on a tinted ground with a
   * hairline — because both are the card saying *here is something the optimizer did or
   * did not do that you should know about*, and a second warning vocabulary inside one card
   * would read as two severities.
   */
  manualNotice: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    marginBottom: 10,
    padding: '8px 10px',
    borderRadius: 6,
    background: 'rgba(181, 71, 8, 0.06)',
    border: '1px solid rgba(181, 71, 8, 0.18)',
  },
  manualNoticeTitle: {
    '&.MuiTypography-root': {
      fontSize: 12,
      fontWeight: 600,
      lineHeight: '17px',
      color: SPILL_INK,
    },
  },
  manualNoticeText: {
    '&.MuiTypography-root': {
      fontSize: 12,
      fontWeight: 300,
      lineHeight: '17px',
      color: SPILL_INK,
    },
  },
  /* The undo, on its own line under the sentence rather than floated right of it: the
     sentence wraps to three lines in a 400px column, and a link vertically centred against
     wrapped text sits against nothing. */
  manualNoticeActions: { display: 'flex', alignItems: 'center', gap: 12, marginTop: 4 },
  timeline: { display: 'flex', flexDirection: 'column' },
  anchorRow: { display: 'flex', alignItems: 'center', gap: ROW_GAP, padding: '6px 0' },
  legRow: { paddingLeft: GRIP_WIDTH + ROW_GAP + INDEX_SIZE + ROW_GAP },
  legText: {
    '&.MuiTypography-root': { fontSize: 12, color: theme.palette.textSecondary3 },
  },
  stopRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: ROW_GAP,
    padding: '8px 8px 8px 0',
    borderRadius: 8,
    transition: 'background 140ms ease',
    /* Without this the row is a flex container at its content's intrinsic width, which
       inside a bounded card means the right-hand figures leave the box entirely. The
       whole row is now allowed to shrink and the name is what gives way. */
    minWidth: 0,
  },
  /* A stop taking its place, animated on mount rather than from a timer, because
     the row now mounts at exactly the moment it should appear (`revealCount`). One
     less clock to keep in sync with the map's. */
  /* 300ms, up from 240. The rows land one per reveal tick and this is the region a
     viewer is watching while the drawer explains itself, so the arrival wants to be
     legible rather than brisk. Still shorter than the tick, so a row is settled before
     the next one starts. */
  stopRowEnter: {
    animation: '$stopRowIn 300ms cubic-bezier(0.2, 0.8, 0.2, 1) both',
  },
  '@keyframes stopRowIn': {
    from: { opacity: 0, transform: 'translateY(6px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
  },
  stopRowLocked: { opacity: 0.62 },
  stopRowDragging: { opacity: 0.4 },
  stopRowOver: { boxShadow: `inset 0 2px 0 ${theme.palette.surfaceBrand}` },
  /**
   * Highlighted from the *map*, which is not the same event as being hovered.
   *
   * One `highlightedSiteId` serves both directions — hover a row and its pin lights, hover
   * a pin and its row lights — so a single class is applied in both cases and it cannot
   * tell them apart. `&:hover` can: if the pointer is on this row, the highlight came from
   * this row, and the subtle grey is the right answer. If it is not, the highlight came
   * from the map, the planner is looking for this row in a list of twelve, and the brand
   * tint is what finds it.
   *
   * Nested inside the same class rather than relying on `stopUnitRow:hover` to outrank it —
   * two single-class selectors are decided by sheet order, which is the fault this file has
   * paid for more than once.
   */
  stopRowHighlighted: {
    background: theme.palette.surfaceBrandSubtle,
    '&:hover': { background: theme.palette.surfaceGreySubtle },
  },
  /* The affordance the re-order was missing. Quiet until the row is hovered or
     the handle is focused — visible enough to find, faint enough not to shout. */
  grip: {
    width: GRIP_WIDTH,
    height: INDEX_SIZE,
    flexShrink: 0,
    alignSelf: 'flex-start',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: 0,
    background: 'none',
    padding: 0,
    cursor: 'grab',
    fontSize: 14,
    lineHeight: 1,
    color: theme.palette.textSecondary3,
    opacity: 0.45,
    transition: 'opacity 120ms ease',
    '&:active': { cursor: 'grabbing' },
    '&:hover': { opacity: 1, color: theme.palette.textPrimary },
    '&:focus-visible': {
      opacity: 1,
      outline: `2px solid ${theme.palette.surfaceBrand}`,
      outlineOffset: 2,
      borderRadius: 3,
    },
  },
  /* Keeps completed stops aligned with the ones that have a grip. */
  gripSpacer: { width: GRIP_WIDTH, flexShrink: 0 },
  /* The teardrop occupies the same column the old circle did, so the leg lines and
     the anchors still align — 24 wide by 30 tall, sat 1px high so its point lands
     on the row's centre line rather than below it. */
  stopPin: {
    width: INDEX_SIZE,
    height: 30,
    flexShrink: 0,
    display: 'block',
    marginTop: -2,
    overflow: 'visible',
  },
  /* A hint must not outweigh the label it sits beside, so it drops below the
     12px secondary tier onto the same 11px step as the section labels. */
  hintText: {
    '&.MuiTypography-root': { fontSize: 11, color: theme.palette.textSecondary3 },
  },
  stopIndex: {
    width: INDEX_SIZE,
    height: INDEX_SIZE,
    flexShrink: 0,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 11,
    fontWeight: 600,
    color: theme.palette.textOnColor,
    background: theme.palette.surfaceBrand,
  },
  stopIndexAnchor: {
    background: 'transparent',
    color: theme.palette.textSecondary3,
    border: `1px dashed ${theme.palette.borderSubtle2}`,
  },
  stopIndexDone: { background: theme.palette.borderSubtle2, color: theme.palette.textSecondary2 },
  stopIndexWarn: { background: theme.palette.surfaceWarningStrong },
  stopBody: { flex: 1, minWidth: 0, overflow: 'hidden' },
  /* The estimate line: a hoverable duration, plus whatever qualifies it. */
  stopMetaRow: { display: 'flex', alignItems: 'center', gap: 5, minWidth: 0, marginTop: 1 },
  stopTopLine: { display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 },
  stopName: {
    '&.MuiTypography-root': {
      minWidth: 0,
      fontSize: 14,
      fontWeight: 500,
      color: theme.palette.textPrimary,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
  },
  stopMeta: {
    '&.MuiTypography-root': { fontSize: 12, color: theme.palette.textSecondary3, marginTop: 1 },
  },
  jobsBadge: {
    fontSize: 10,
    fontWeight: 600,
    padding: '1px 5px',
    borderRadius: 4,
    color: theme.palette.textSecondary2,
    background: theme.palette.surfaceGreyLight,
  },
  newBadge: {
    fontSize: 10,
    fontWeight: 600,
    letterSpacing: '0.04em',
    padding: '1px 5px',
    borderRadius: 4,
    color: theme.palette.textOnColor,
    background: theme.palette.surfaceBrand,
  },
  windowWarning: {
    '&.MuiTypography-root': { fontSize: 12, color: theme.palette.textWarning, marginTop: 2 },
  },
  stopArrival: {
    '&.MuiTypography-root': {
      fontSize: 12,
      color: theme.palette.textSecondary2,
      fontVariantNumeric: 'tabular-nums',
      flexShrink: 0,
      paddingTop: 1,
    },
  },
  rowAction: {
    border: 0,
    background: 'none',
    cursor: 'pointer',
    padding: '0 2px',
    color: theme.palette.textSecondary3,
    fontSize: 16,
    lineHeight: 1,
    '&:hover': { color: theme.palette.textPrimary },
  },

  /* ---------- the route's stops, to the supplied spec ----------
     A stack of 68px units, each one a 36px row over a 32px connector: grip,
     numbered teardrop, then a grey-subtle pill carrying the name, two meta facts,
     an optional badge and a chevron. The dashed connector below picks up the pin's
     colour and runs down to the next one, which is what makes the column read as a
     sequence rather than as a list.

     **These are new keys, not edits to `stopRow`.** The unordered selection list
     borrows `stopRow` / `stopBody` / `stopName` deliberately — before a route
     solves the visits are a *set*, with no pins, no numbers and no connectors —
     and rebuilding the shared keys under this spec would have silently pulled a
     timeline's worth of geometry into a list that must not imply one.

     The list is the last thing in the card and it is not capped — see below. */
  /**
   * **The 340px cap and its mask are gone, and the reason is the card's new order.**
   *
   * The cap was right for the layout that had it. The meter sat *under* the stop list,
   * so a six-stop route pushed the answer off the fold and the list had to be
   * contained to protect it; the sixteenth pass then added a mask because the cap
   * landed mid-row. Both were fixes for a consequence of the ordering.
   *
   * The meter is now the first thing in the card body and the list is the last, so
   * there is nothing below the list to protect. What the cap cost is worse than what
   * it bought: a scroll region nested inside the drawer's own scroll region, where the
   * wheel stops the page at a boundary the planner cannot see, a drag-to-reorder
   * gesture has to auto-scroll a 340px window to reach stop nine, and the mask fades
   * the very row being dragged. Only one card is expanded at a time, so at most one
   * list is ever tall, and the drawer body already scrolls perfectly well.
   *
   * The list therefore takes its natural height and the drawer scrolls. `flexShrink`
   * stays off the units so nothing compresses.
   */
  stopTrack: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  stopUnit: { display: 'flex', flexDirection: 'column', alignItems: 'stretch', flexShrink: 0 },
  /**
   * The two halves of a drag, which had neither.
   *
   * Native drag-and-drop draws a ghost of the handle and nothing else, so the gesture
   * was: press a 20px grip, watch a 20px grip follow the cursor, release somewhere,
   * and find out afterwards what happened. `stopRowDragging` and `stopRowOver` existed
   * in this file for the old row and were never wired to the rebuilt one — the styles
   * were written and then orphaned by the rebuild.
   *
   * `stopUnitDragging` fades the row being moved so the list reads as having a hole in
   * it; `stopUnitOver` puts a 2px brand rule on the row the drop will land above. Both
   * are paint-only, and both are on the unit rather than the pill so the connector
   * travels with them.
   */
  /**
   * The row being carried.
   *
   * **0.4 was the whole of it, and the row still had a full-strength drag image over the
   * top of it.** Native drag paints a snapshot of whatever `setDragImage` was given — the
   * grip, until this pass gave it the row — so the list showed the row twice at once, once
   * faint in place and once solid under the cursor. Faint-in-place is the correct half: it
   * is the hole the row came out of, and the eye needs it to judge where the row is going
   * back. Dashed, so the hole reads as *reserved* rather than as a row that has gone
   * translucent for no reason.
   */
  stopUnitDragging: {
    opacity: 0.35,
    '& $stopUnitRow': {
      borderRadius: 6,
      border: `1px dashed ${theme.palette.borderSubtle2}`,
      background: theme.palette.surfaceGreySubtle,
    },
  },
  /**
   * Where the drop will land: a 2px brand rule on the edge the pointer is nearest.
   *
   * **Two classes, because "above" was the only answer the old one could give.** The drop
   * always landed before the row under the cursor, marked with `inset 0 2px 0` on its top
   * edge — which makes the last position in a route unreachable by mouse (there is no row
   * below the last one to be *above* of) and makes every drop in the bottom half of a row
   * land one place higher than the planner aimed. The edge is chosen from the pointer's
   * position within the row now, and the rule is drawn on that edge.
   *
   * `inset` box-shadow rather than a border, so the mark costs no layout: a 2px border
   * appearing on a row inside a fixed-height unit would push every row below it down by
   * two pixels as the pointer crossed it, and a list that twitches under a drag is a list
   * you cannot aim in.
   */
  stopUnitOverAbove: { boxShadow: `inset 0 2px 0 ${theme.palette.surfaceBrand}` },
  stopUnitOverBelow: { boxShadow: `inset 0 -2px 0 ${theme.palette.surfaceBrand}` },
  /* `grabbing` for the whole track while a row is in flight, not just for the grip the
     gesture started on — the pointer spends the drag over other rows, and a cursor that
     reverts to `default` the moment it leaves the handle says the drag has ended. */
  stopTrackDragging: { cursor: 'grabbing' },
  /* **Fixed height, not `minHeight`.** The spec's unit is 68px — a 36px row over a
     32px connector — and `minHeight` gave 72: the pill's 20px line plus 16px of
     padding plus its 1px borders is 38, which grows the row by 2 and the unit by 4.
     Four pixels compounds down a twelve-stop list into half a row of drift, and the
     connector lengths stop matching the gaps they are meant to bridge. So both the
     row and the pill are pinned, and `border-box` is what lets the border sit inside
     the 36 rather than on top of it. */
  stopUnitRow: {
    display: 'flex',
    alignItems: 'center',
    gap: STOP_PIN_GAP,
    height: STOP_ROW_H,
    flexShrink: 0,
    /* Negative on the right only: the ground has to reach past the chevron to the pane's
       own padding, or a hovered row looks clipped 8px short of its own figure. The left is
       the grip column, which is already the track's axis. */
    marginRight: -8,
    paddingRight: 8,
    borderRadius: 6,
    transition: 'background 120ms ease',
    /**
     * **Grey, not brand — the hover was asked to be subtle and it was a green wash.**
     *
     * Hovering a row also lights its pin on the map, which is the useful half of the
     * gesture and is staying. What it should not do is tint the row in the brand colour:
     * twelve rows in a scrolling column, each flashing green as the pointer travels down
     * them, makes a *pointer position* look like a *state*. The map's pin is where the
     * feedback belongs, because that is the thing the planner is looking for.
     */
    '&:hover': { background: theme.palette.surfaceGreySubtle },
  },

  /* Visible on a movable stop, an invisible spacer on one that cannot move. Kept in
     the layout either way so every pin in the column sits on one axis — the spec's
     own `opacity: 0` on the completed rows says the same thing. */
  stopGrip: {
    width: STOP_GRIP,
    height: STOP_GRIP,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: 0,
    background: 'none',
    padding: 0,
    borderRadius: 4,
    cursor: 'grab',
    /* Grey/400, and `color` rather than a fill on the asset — the handle darkens on
       hover and focus, which is the whole reason it is inline rather than one of the
       two drag SVGs in `assets` that hard-code their own. */
    color: theme.palette.textSecondary3,
    transition: 'color 120ms ease, background 120ms ease',
    '&:active': { cursor: 'grabbing' },
    '&:hover': { color: theme.palette.textPrimary, background: theme.palette.borderSubtle1 },
    '&:focus-visible': {
      outline: `2px solid ${theme.palette.surfaceBrand}`,
      outlineOffset: 1,
    },
  },
  stopGripIcon: { width: STOP_GRIP, height: STOP_GRIP, display: 'block' },
  stopGripHidden: { visibility: 'hidden', pointerEvents: 'none' },

  stopMarker: {
    width: STOP_PIN,
    height: STOP_PIN,
    flexShrink: 0,
    display: 'block',
    overflow: 'visible',
  },

  /* The pill. Grey-subtle on white with a hairline, which is what makes the pin
     beside it read as the marker *for* it rather than as a bullet in a list. */
  stopPill: {
    flex: 1,
    minWidth: 0,
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    padding: '0 12px',
    height: STOP_ROW_H,
    background: theme.palette.surfaceGreySubtle,
    border: `1px solid ${theme.palette.borderSubtle1}`,
    borderRadius: 4,
    transition: 'border-color 140ms ease, background 140ms ease',
  },
  stopPillHighlighted: {
    borderColor: theme.palette.surfaceBrand,
    background: theme.palette.surfaceBrandSubtle,
  },
  /**
   * The row's own line: name, badge, the dot, the duration.
   *
   * **It wraps now, and that is a consequence of the column.** These rows were laid out in
   * a 656px drawer where all four fitted on one line. In a 400px column they do not, and
   * because the name was the only shrinkable child it absorbed the entire deficit — a stop
   * carrying a `Window` badge rendered as *"Window · 2h 20m on site"* with no site name in
   * it at all. Wrapping puts the overflow on the axis that has room (the row grows by a
   * line) rather than on the one thing the row exists to say.
   */
  stopPillMain: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    minWidth: 0,
    flex: 1,
  },
  stopPillName: {
    '&.MuiTypography-root': {
      fontSize: 14,
      /* 500, from the spec. It was 700 — a full step heavier than the design asks, which
         at 14px made every stop name read as a heading of its own inside a card whose
         actual title is the same size. */
      fontWeight: 500,
      lineHeight: '20px',
      color: theme.palette.textPrimary,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      /* A floor rather than 0: about eight characters and an ellipsis, which is enough to
         tell two sites apart when the map beside them carries the same number. Below this
         the name would rather take a line of its own — see `stopPillMain`. */
      minWidth: 80,
      flex: '1 1 auto',
    },
  },
  /* A 4px dot, not a middot glyph. A typographic separator inherits the font's own
     vertical centring and drifts against a 20px line; a drawn circle does not. */
  stopPillDot: {
    width: 4,
    height: 4,
    borderRadius: '50%',
    flexShrink: 0,
    background: theme.palette.surfaceGreyStrong1,
  },
  stopPillMeta: {
    '&.MuiTypography-root': {
      fontSize: 14,
      lineHeight: '20px',
      color: theme.palette.textPlaceholder,
      whiteSpace: 'nowrap',
      flexShrink: 0,
      fontVariantNumeric: 'tabular-nums',
    },
  },
  /**
   * The arrival time, in a column of its own.
   *
   * It used to sit inline after `45m on site`, which meant that down a six-stop list
   * the times started at six different x positions — behind six site names of six
   * different lengths — and the one thing a planner reads a sequence *for*, when the
   * technician gets where, could not be scanned. Right-aligned against the chevron
   * with tabular figures, the times form a column. Slightly darker than the inline
   * meta because it is now a data column rather than an aside.
   */
  stopPillTime: {
    '&.MuiTypography-root': {
      fontSize: 14,
      lineHeight: '20px',
      color: theme.palette.textSecondary2,
      whiteSpace: 'nowrap',
      flexShrink: 0,
      textAlign: 'right',
      minWidth: 44,
      fontVariantNumeric: 'tabular-nums',
    },
  },
  stopBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2px 8px',
    borderRadius: 16,
    fontSize: 12,
    fontWeight: 500,
    lineHeight: '18px',
    whiteSpace: 'nowrap',
    /* Never clipped. A rounded pill with its right edge sliced off reads as a rendering
       fault rather than as a squeeze — when the row runs out of room it is the row that
       wraps, not the badge that gets shaved. */
    flexShrink: 0,
  },
  stopBadgeSuccess: {
    background: theme.palette.surfaceSuccessSubtle,
    color: theme.palette.textSuccess,
  },
  stopBadgeMuted: {
    background: theme.palette.borderSubtle1,
    color: theme.palette.textPlaceholder,
  },
  stopBadgeWarn: { background: SPILL_WASH, color: SPILL_INK },
  /**
   * **`New`, and only on a merge.**
   *
   * The badge was removed from planned rows for a good reason — every stop in a
   * *fresh* route was added by this plan, so a badge saying so distinguished nothing.
   * On a merge that reasoning inverts: the list interleaves this run's work with stops
   * that already belonged to somebody's runsheet, and the two were rendered
   * identically. §2 decision 17 says a re-solve must be disclosed, and the footer
   * counting the re-ordered stops is not the same as being able to see, in the
   * sequence, which three of the eight are ours. So the badge comes back on the new
   * work and only when there is existing work to tell it from.
   */
  stopBadgeNew: {
    background: theme.palette.surfaceBrandSubtle,
    color: theme.palette.textBrand,
  },

  /* The chevron opens the row's own arithmetic. It replaces the `⋮` and the hover
     tooltip that used to carry it: a tooltip cannot be reached by keyboard, and it
     put the working-out somewhere the planner had to discover by accident. */
  /**
   * The disclosure mark: a bare 7px chevron, no disc.
   *
   * **The disc is gone and it was mine, not the spec's.** It was a 20px
   * `surface/grey-subtle` circle, argued for on the grounds that it made the hit area
   * findable — and the argument undercut itself, because the fill it used is the same
   * fill as the pill the row sits on, so at rest it drew nothing and on hover it drew a
   * second shape on every row. The spec draws a stroked V in `#7C92A1` and nothing else.
   *
   * So: no background, no ring, and the hit box is bought with a negative margin
   * instead — 23px of target around a 7px mark, costing nothing in a 16px row. Hover
   * darkens the mark rather than filling a shape behind it.
   */
  stopChevron: {
    width: 7,
    height: 7,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: 0,
    padding: 8,
    margin: -8,
    cursor: 'pointer',
    borderRadius: 4,
    background: 'none',
    color: '#7C92A1',
    lineHeight: 1,
    transition: 'transform 200ms cubic-bezier(0.2, 0.8, 0.2, 1), color 140ms ease',
    '&:hover': { color: theme.palette.textSecondary1 },
    '&:focus-visible': { outline: `2px solid ${theme.palette.borderBrand}`, outlineOffset: 2 },
  },
  stopChevronOpen: { transform: 'rotate(180deg)' },
  /* Drawn, not typed. The chevron was a `⌄` (U+02C7-ish "modifier letter" family),
     which is the same class of mistake the fourteenth pass fixed on the drag handle:
     a glyph renders at whatever size, weight and baseline the body font decides, and
     on this row it sat a pixel high and a shade too light. Same reasoning, same fix —
     an inline path in `currentColor`, so hover still darkens it. */
  /* 7 wide, per the spec's `Vector 436`. The path is a chevron so its drawn height is
     about half its width, which is the 7 × 3.5 the spec measures. */
  stopChevronIcon: { width: 7, height: 7, display: 'block' },

  /* 34px so the dashed line lands on the pin's centre: grip + gap. Height and
     padding come from the spec, and the line is `border-left` on a zero-width box
     rather than a `border` on a 1px one, so it cannot pick up a second edge. */
  /* **`minWidth`, not `width`.** The connector carries the drive leg again, and a hard
     34 is narrower than `Drive 12m` — the text was clipped at the pin's axis. 34 is
     still the floor, because that is the number the dashed line's position depends on;
     what changes is only that the box may be wider than the line it draws. */
  stopConnector: {
    display: 'flex',
    alignItems: 'stretch',
    gap: CONNECTOR_GAP,
    minWidth: STOP_GRIP + CONNECTOR_GAP,
    padding: '5px 0',
    flexShrink: 0,
  },
  /**
   * ---------- the stop, as one row ----------
   *
   * Measured off the supplied design, and the numbers are stated because they are load-bearing
   * rather than chosen. The design's own frame is 348 × 96: a 348 × 88 row plus 8px of bottom
   * padding, holding a 16px grip, an 8px gap, a 16px column carrying the pin over the track, an
   * 8px gap, a label stack, a 6px gap, and a 119px value stack.
   *
   * **The row has no fixed height, which is the point of the rewrite.** It was 36px, measured
   * for a closed stop, so an open one could not put its breakdown beside the figures it adds up
   * to — it went underneath, in a box of its own, and the dashed rule had to be redrawn there
   * with the grip column's offsets restated. Here the row is as tall as its tallest column and
   * the track fills it: 20px of name when shut, 68px of name-plus-two-labels when open, and the
   * dashed line is `flex: 1` either way.
   *
   * **`stopLine`, not `stopRow`.** `stopRow` is taken, by `SelectionList` — the pre-plan list of
   * the same visits, which draws its own row and has no track, no breakdown and no drag. Two
   * different rows in one sheet under one name is how a change to one silently restyles the
   * other, which this file has paid for before.
   */
  stopLine: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: STOP_PIN_GAP + 4,
    paddingBottom: 8,
    minWidth: 0,
    /* Reaches past the chevron to the pane's own padding, so a hovered or highlighted row is
       not clipped 8px short of its own figure. */
    marginRight: -8,
    paddingRight: 8,
    borderRadius: 6,
    transition: 'background 120ms ease',
    /* Grey, and deliberately not the brand tint — see `stopRowHighlighted`. Twelve rows each
       flashing green as the pointer travels down them makes a pointer position look like a
       state; the map's own pin is where that feedback belongs. */
    '&:hover': { background: theme.palette.surfaceGreySubtle },
  },
  /**
   * The 16px column: the pin, and the track under it.
   *
   * `align-items: center` so the 16px pin and the 1.3px rule share one axis — which is the
   * axis every other pin in the list sits on, and the reason the design gives this column a
   * fixed width rather than letting the pin define it.
   */
  stopTrackColumn: {
    width: STOP_PIN,
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
  },
  /**
   * The dashed track, growing to whatever the row turns out to be.
   *
   * `1.3px dashed` at `LEG_LINE` — `#6C0AC2`, from the design. `currentColor` so the caller can
   * set the tone inline: violet between stops, grey into an anchor, amber in the exclusions
   * panel. `minHeight: 0` because a `flex: 1` child of a stretch row will otherwise refuse to
   * shrink below its content, and this has no content.
   */
  stopTrackLine: {
    flex: 1,
    width: 0,
    minHeight: 0,
    borderLeft: '1.3px dashed currentColor',
  },
  /**
   * Labels down the left, centred in the row.
   *
   * The design centres the 68px label stack inside the 88px row, which is what puts a *closed*
   * stop's name on the pin's own centre line — top-aligning it would sit the name 2px above
   * the pin it names, at every row, all the way down the list.
   */
  stopLabels: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: 8,
    overflow: 'hidden',
  },
  /**
   * Values down the right, top-aligned.
   *
   * **Not centred, unlike the labels, and the asymmetry is deliberate.** The figure has to sit
   * on the site name's line — they are the two halves of the row's top line — and the breakdown
   * hangs beneath it. Centring both stacks would drift the figure off the name by half the
   * difference between the two stacks' heights, which on a two-row disclosure is 4px of
   * misalignment on the one pairing a reader actually checks.
   */
  stopValues: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 8,
    flexShrink: 0,
    paddingTop: 2,
  },
  /* The grip's own width, held open where there is no grip to draw: the placeholder row, and
     the two anchors. Every pin in the list has to sit on one axis, and reserving the column is
     what keeps them there — the design does the same thing with `opacity: 0` on a handle it
     still lays out. */
  stopGripSpacer: { width: STOP_GRIP, flexShrink: 0 },
  /**
   * The row's top line on the left: the site name, and any badge riding with it.
   *
   * `flexWrap` because these rows are 400px at most and a name plus a `New` badge does not
   * always fit. The name is the only shrinkable child, so without wrapping it absorbs the
   * whole deficit — a stop carrying a badge once rendered as `New` with no site name in it
   * at all. Wrapping puts the overflow on the axis that has room.
   */
  stopTitleRow: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    minWidth: 0,
  },
  /**
   * The row's top line on the right: `18 mi · 2 hr 12 min ⌃`.
   *
   * `StopFigure` returns its four children loose rather than boxed — the design puts the
   * distance, the dot, the duration and the chevron directly in one flex line at `gap: 6` —
   * so this is that line, and it exists because the value *stack* is a column and they need a
   * row of their own inside it.
   */
  stopFigureRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 6,
  },
  stopConnectorSpacer: { width: STOP_GRIP, flexShrink: 0 },
  /* **`stopConnectorDetail` is gone with the box it padded.** It gave the open disclosure more
     vertical air than the connectors between rows, because it was a *separate* connector drawn
     under the row. The row's own `stopLabels` gap does that job now, once, for the name and
     both breakdown labels — which is also why they finally sit on an even pitch. */
  stopConnectorLine: {
    width: 0,
    minHeight: CONNECTOR_H,
    borderLeft: '1.3px dashed currentColor',
    flexShrink: 0,
  },
  /**
   * `Drive 12m`, on the connector.
   *
   * **Beside the dashed line, not above or below it.** The unit is a measured 36 + 32
   * and the docs pin those numbers; stacking the leg over the line would have to grow
   * the connector, and a taller connector under twelve stops is the same compounding
   * drift the fixed row height exists to prevent. Set against the line, the leg costs
   * no vertical space at all — and the flex `gap` puts it at 34 + 14 = 48, which is
   * exactly where the pill's site name starts, so the legs and the names share an edge.
   *
   * Typography is `legRow`/`legText` from `buildRoute`'s route timeline, deliberately:
   * that timeline is where a planner has always read `Drive Xm`, and this list is the
   * same object in a smaller frame. Copied rather than imported — the two sheets were
   * kept separate on purpose, and this is four declarations, not a component.
   *
   * `color` is explicit because the connector sets `color` inline to the stop's tone so
   * the dashed line can be `currentColor`. Inheriting it would paint the leg green,
   * blue or grey by state, and the leg is not a state — it is a duration.
   *
   * Tabular figures for the same reason `stopPillTime` has them: read down the column
   * these are a shape, and proportional digits make `1h 5m` and `1h 15m` different
   * widths for no information.
   */
  stopConnectorLeg: {
    alignSelf: 'center',
    '&.MuiTypography-root': {
      fontSize: 12,
      lineHeight: '17px',
      color: theme.palette.textSecondary3,
      fontVariantNumeric: 'tabular-nums',
      whiteSpace: 'nowrap',
    },
  },

  /* The arithmetic, opened. One number on the row, the working one click away — the
     row shows `1h 40m` and this says where it came from. */
  stopDetail: {
    marginLeft: STOP_GRIP + STOP_PIN_GAP + STOP_PIN + STOP_PIN_GAP,
    marginBottom: 6,
    padding: '8px 12px',
    borderRadius: 4,
    background: theme.palette.surfaceWhite,
    border: `1px solid ${theme.palette.borderSubtle1}`,
    display: 'flex',
    flexDirection: 'column',
    gap: 3,
  },
  stopDetailLine: {
    '&.MuiTypography-root': {
      fontSize: 12,
      lineHeight: '17px',
      color: theme.palette.textSecondary2,
      fontVariantNumeric: 'tabular-nums',
    },
  },
  stopDetailActions: { display: 'flex', alignItems: 'center', gap: 12, marginTop: 4 },

  /* Start and end, on the same axis as the pins. They are not stops — no number, no
     badge, nothing to open — so they are a marker and a label and nothing else. */
  stopAnchor: {
    display: 'flex',
    alignItems: 'center',
    gap: STOP_PIN_GAP,
    minHeight: 28,
    paddingLeft: STOP_GRIP + STOP_PIN_GAP,
  },
  stopAnchorMark: {
    width: STOP_PIN,
    height: STOP_PIN,
    flexShrink: 0,
    borderRadius: '50%',
    border: `1.5px dashed ${theme.palette.borderStrong2}`,
    boxSizing: 'border-box',
  },
  stopAnchorText: { display: 'flex', alignItems: 'center', gap: 6, minWidth: 0, flex: 1 },
  stopAnchorName: {
    '&.MuiTypography-root': {
      fontSize: 13,
      fontWeight: 500,
      lineHeight: '18px',
      color: theme.palette.textSecondary1,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      minWidth: 0,
    },
  },

  /* ---------- selection list ----------
     The pre-plan view of the same visits. It borrows `stopRow` / `stopBody` /
     `stopName` so the two lists are recognisably the same object, and adds only
     what differs: a dot where the index goes, and the visit's current day where
     the arrival time goes. Nothing here implies an order. */
  selectionRow: { paddingLeft: 2, alignItems: 'flex-start' },
  /* The state pin — a teardrop, matching the runsheet stop list's own marker so a
     list of places reads the same way across the product. Colour and fill are set
     on the SVG from `VISIT_STATE_STYLE`, because an SVG fill cannot read a class;
     this rule owns only the geometry. Sized so its point lands on the site name's
     baseline rather than floating beside the cap height. */
  selectionMark: {
    width: 15,
    height: 15,
    marginTop: 2,
    marginRight: ROW_GAP - 5,
    flexShrink: 0,
    display: 'block',
    overflow: 'visible',
  },
  selectionState: { fontWeight: 600 },
  selectionDay: {
    '&.MuiTypography-root': {
      fontSize: 12,
      color: theme.palette.textSecondary2,
      fontVariantNumeric: 'tabular-nums',
      flexShrink: 0,
      paddingTop: 2,
      whiteSpace: 'nowrap',
    },
  },
  selectionHint: {
    '&.MuiTypography-root': {
      fontSize: 12,
      color: theme.palette.textSecondary3,
      marginTop: 8,
      paddingTop: 10,
      borderTop: `1px solid ${theme.palette.borderSubtle1}`,
    },
  },

  /* `noFit` / `noFitText` lived here for the standalone "set a starting point"
     panel. That message is now the selection list's own hint, so the panel — and
     its two classes — are gone rather than left matching nothing. */

  /* ---------- overflow ----------
     A bucket, not a plan: a list, a day to move them to, and the consequence.

     NOTE ON THE TONE, because it has been wrong in both directions. It began neutral
     grey on a grey fill, which in this product means *inert* — settled, nothing to do
     — over the only actionable thing on the screen. Full amber fixed the meaning and
     overshot: a saturated wash across a box this tall shouts louder than the route
     above it, which is the actual subject.

     So the signal now lives in the heading alone. The fill is a barely-there wash and
     the border a hairline, enough to bound the group and tint it warm; everything
     else is ordinary body text. The rule: **the smallest element carries the colour**,
     because a 4-line box in full attention colour competes with the thing it is a
     footnote to. */
  /* A section, not a box. The tinted container framed a capacity outcome as an
     interruption — and when nothing fit it wrapped the planner's whole selection,
     so their own list read as a rejection pile. Now it sits on the same 24px inset
     and hairline rhythm as every other block, and the heading is the only thing
     carrying colour. */
  overflow: {
    margin: 0,
    padding: '14px 24px 4px',
    borderTop: `1px solid ${theme.palette.borderSubtle1}`,
  },
  overflowTitle: {
    '&.MuiTypography-root': {
      fontSize: 14,
      fontWeight: 600,
      lineHeight: '20px',
      color: SPILL_INK,
    },
  },
  overflowMove: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    flexWrap: 'wrap',
  },
  overflowMoveLabel: {
    '&.MuiTypography-root': {
      fontSize: 13,
      color: theme.palette.textPrimary,
      flexShrink: 0,
    },
  },
  overflowDay: { minWidth: 0, flex: '0 1 168px' },
  overflowList: { marginTop: 10, display: 'flex', flexDirection: 'column', gap: 4 },
  overflowRow: { display: 'flex', alignItems: 'center', gap: 6 },
  overflowSite: {
    '&.MuiTypography-root': {
      fontSize: 14,
      color: theme.palette.textPrimary,
      minWidth: 0,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
  },
  overflowFooter: {
    '&.MuiTypography-root': {
      fontSize: 12,
      lineHeight: '17px',
      color: theme.palette.textSecondary1,
      marginTop: 10,
    },
  },
  /* The explanation, set off by a hairline so it reads as the answer to "why"
     rather than as another instruction. Warm rule, not another block of colour. */
  overflowReason: {
    '&.MuiTypography-root': {
      fontSize: 12,
      lineHeight: '17px',
      color: theme.palette.textSecondary1,
      /* Directly under the heading now, not fenced off below the list. It is the
         same subject — what did not fit, and why — so it reads as one thought. */
      marginTop: 4,
    },
  },

  /* ---------- the optimizer, working, with the body to itself ----------
     For the first two seconds the drawer is a question and a machine answering
     it. The controls sit above; everything else is deliberately absent, so the
     one line under the avatar has nothing to compete with. `flex: 1` is what
     centres it — the stage takes whatever height the controls left over, which
     means it is centred in the *remaining* body rather than at a guessed offset.

     No `overflow` and no scroll here on purpose: while composing there is nothing
     below the fold, so a scrollbar appearing and then vanishing would be the most
     movement on screen. */
  aiStage: {
    flex: '1 1 auto',
    minHeight: 230,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
    padding: '32px 32px 40px',
    textAlign: 'center',
  },
  /**
   * The stage with the map underneath it.
   *
   * `flex: 0 0 auto` is the load-bearing part: the tall variant claims all the leftover
   * height of the drawer body, which is right when it is the only thing there and would
   * squeeze the map to nothing now. Height is what it needs and no more, and the caption
   * keeps a fixed one so the map below it does not shift as lines swap.
   */
  aiStageCompact: {
    flex: '0 0 auto',
    minHeight: 0,
    gap: 8,
    padding: '18px 32px 14px',
    '& $aiStageLineWrap': { minHeight: 32 },
  },
  /* A fixed height for two lines of the longest status. The line is replaced
     rather than appended, so without this the block resizes under the reader
     every time a shorter one lands — and a container that changes height is the
     one kind of motion this reveal cannot afford, because the ticks below it
     would move too. */
  aiStageLineWrap: {
    minHeight: 40,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: 380,
  },
  aiStageLine: {
    '&.MuiTypography-root': {
      fontSize: 14,
      fontWeight: 500,
      lineHeight: '20px',
      color: theme.palette.textPrimary,
      fontVariantNumeric: 'tabular-nums',
      animation: '$aiLineIn 300ms cubic-bezier(0.2, 0.8, 0.2, 1) both',
    },
  },
  /* Up from below and slightly blurred, which is what makes it read as the *next*
     line arriving rather than as the same line changing its mind. */
  '@keyframes aiLineIn': {
    from: { opacity: 0, transform: 'translateY(7px)', filter: 'blur(2px)' },
    to: { opacity: 1, transform: 'translateY(0)', filter: 'blur(0)' },
  },

  /* Position in the *explanation* — four named stages, this is the second — and
     not progress through the computation, which is synchronous and has none to
     report. Four discrete marks rather than a bar, because a bar would claim a
     percentage nobody measured. */
  aiStageTicks: { display: 'flex', alignItems: 'center', gap: 5 },
  aiStageTick: {
    width: 16,
    height: 3,
    borderRadius: 2,
    background: theme.palette.surfaceBrand,
    opacity: 0.18,
    transition: 'opacity 260ms ease, transform 260ms ease',
    '&[data-state="done"]': { opacity: 0.55 },
    '&[data-state="current"]': { opacity: 1, transform: 'scaleX(1.18)' },
  },

  /* ---------- the optimizer's panel, docked ----------
     Where the avatar ends up: a strip above the map holding the conclusion, with
     the working-out folded behind a disclosure. Tinted, unlike every other block
     in this drawer, because it is the one thing on screen that is *not* an
     editable field — it is the machine talking. One tint, brand-subtle, so it
     reads as a system voice rather than as a status (which is what an amber or
     green panel would say).

     It enters rather than appearing: the stage it replaces was 230px tall and
     centred, so without a rise the eye loses track of the mark it was watching. */
  /* **A hairline above, not below.** The panel used to dock under the controls with a
     rule beneath it; it now sits at the *end* of the drawer body, under the routes, so
     the line that separates it from what it is a footnote to belongs on top of it. A
     bottom border there drew a rule against the footer's own. */
  aiPanel: {
    padding: '14px 24px 16px',
    background: theme.palette.surfaceBrandSubtle,
    borderTop: `1px solid ${theme.palette.borderSubtle1}`,
    animation: '$aiDockIn 320ms cubic-bezier(0.2, 0.8, 0.2, 1) both',
  },
  /* Rising from below, because that is the direction it now arrives from. */
  '@keyframes aiDockIn': {
    from: { opacity: 0, transform: 'translateY(8px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
  },
  /* The one case where the machine's line is a problem rather than a plan —
     nothing fits, or the origin is wrong. The tint changes because the *kind* of
     message changed, which is the one thing colour should be doing here. */
  /**
   * The finished state — a mark, not a wash.
   *
   * **A solid amber fill was the wrong amount of colour for four names and a
   * count.** It painted the whole panel the same tint the spill ribbon uses for one
   * urgent line on a shut card, and did it for the routine case: some visit, most
   * runs, sits outside the window or the radius. So the tint is gone. What is left
   * is the avatar (already the one thing this panel is allowed to colour, per its
   * own note above) and a hairline accent on the leading edge — the amount of amber
   * a paragraph earns, not the amount a warning banner would take.
   */
  aiPanelWarn: {
    background: 'transparent',
    borderTopColor: theme.palette.borderSubtle1,
    position: 'relative',
    '&::before': {
      content: '""',
      position: 'absolute',
      left: 0,
      top: 14,
      bottom: 16,
      width: 2,
      borderRadius: 1,
      background: SPILL_LINE,
    },
    '& $aiAvatar': { color: SPILL_INK },
    '& $aiConclusion': { '&.MuiTypography-root': { color: theme.palette.textPrimary } },
    '& $aiNote': { '&.MuiTypography-root': { color: theme.palette.textSecondary2 } },
    '& $aiWorkingToggle': { color: theme.palette.textSecondary3 },
  },

  /**
   * Named, not counted.
   *
   * "3 visits could not be placed" is a number a planner can do nothing with; three site
   * names are three decisions. Indented to the avatar's text column so the list reads as
   * the sentence's continuation rather than as a new block.
   *
   * **The second column is gone.** It used to carry each visit's `detail` — *due Fri 28
   * Aug · 4 days out* — beside the name, and the argument for it was that the service
   * time said which to move first. That argument did not survive the remedies: the group
   * heading already states the cause with its count and the remedy already computes the
   * one value that clears the whole group, so a per-visit magnitude is corroboration for
   * one row rather than a figure anybody sums. Eight rows of it was texture. It moved
   * into the row's tooltip, which is also where a clipped site name is recoverable, so
   * the row needed a tooltip either way.
   */
  outsideList: {
    marginTop: 6,
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    /* Four rows before it scrolls. Past that this footnote starts pushing the map and
       the routes — the things the planner came for — down the page. 27 rather than the
       row's 24, because a row is its 24 plus the separator above it and the 2px gap —
       at 4 × 24 the fourth row was cut in half, which reads as a clipped list rather
       than as a scrollable one. */
    maxHeight: 4 * 27,
    overflowY: 'auto',
  },

  /* ---------- the triage ----------
     One block per cause. The 44px inset that used to live on the list itself moved up
     to the group, so a group's heading, its remedy and its names all share the avatar's
     text column and read as one thing. */
  aiGroups: { marginTop: 8, paddingLeft: 44, display: 'flex', flexDirection: 'column', gap: 12 },
  aiGroup: { minWidth: 0 },
  /* Centred, not baseline-aligned. The remedy stopped being text on this line and became
     a 24px control, and a bordered box sitting on a text baseline hangs low by its own
     descender space. */
  aiGroupHead: { display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 },
  /* The cause, stated with its count. Semibold rather than a size step: three of these
     on one panel at 14px would each be competing with the headline above them. */
  aiGroupTitle: {
    '&.MuiTypography-root': {
      fontSize: 12,
      fontWeight: 600,
      lineHeight: '18px',
      color: theme.palette.textPrimary,
      minWidth: 0,
    },
  },
  /**
   * The remedy, and it names the value it will set.
   *
   * Right-aligned against its own group's heading so the eye can run down the causes
   * and their fixes as two columns. Now that all three causes have one, that column is
   * the panel's spine and every entry in it has to be findable from across the screen.
   *
   * **An outlined control, where this was a text link.** It was `linkButton`'s styling —
   * 12px semibold brand ink, underline on hover — set beside a 12px semibold heading,
   * and at that distance the only thing separating the fix from the count was hue.
   * Three groups deep the panel read as three headings each with a coloured tail: a
   * caption, not an action. The old note here defended the link on the grounds that the
   * press "changes a field two hundred pixels above rather than committing anything",
   * which was true of `remedyNeedBy` and `remedyRadius` and is the wrong test anyway —
   * every one of these re-runs the plan and redraws the routes and the map, which is the
   * largest thing on this screen that is not Apply. A control that consequential earns a
   * border and a hit area.
   *
   * Outlined rather than filled. Filled brand is Apply's, and three filled buttons in a
   * footnote would each look like the way forward when they are three alternatives, only
   * one of which the planner should take.
   */
  aiGroupAction: {
    flexShrink: 0,
    display: 'inline-flex',
    alignItems: 'center',
    height: 24,
    padding: '0 10px',
    borderRadius: 6,
    border: `1px solid ${theme.palette.borderBrand}`,
    background: theme.palette.surfaceWhite,
    cursor: 'pointer',
    fontFamily: 'inherit',
    fontSize: 12,
    fontWeight: 600,
    lineHeight: 1,
    whiteSpace: 'nowrap',
    color: theme.palette.textBrand,
    transition: 'background 140ms ease, border-color 140ms ease, color 140ms ease',
    '&:hover': {
      background: theme.palette.surfaceBrandSubtle,
      borderColor: theme.palette.textBrandHover,
      color: theme.palette.textBrandHover,
    },
    '&:focus-visible': { outline: `2px solid ${theme.palette.borderBrand}`, outlineOffset: 2 },
  },
  /* The disclosure gets its own row rather than sitting inside the header text, so it
     lines up with the list above it instead of hanging off the conclusion. */
  aiWorkingRow: { paddingLeft: 44, marginTop: 6 },
  outsideRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    minWidth: 0,
    padding: '3px 8px 3px 0',
    borderRadius: 4,
    borderTop: `1px solid ${theme.palette.borderSubtle1}`,
    '&:first-child': { borderTop: 0 },
    /* The tooltip's only advertisement. A row that reacts to the pointer is a row people
       try hovering; one that does not is a row they read past, and the reason a visit is
       out would then be information nobody ever finds. */
    '&:hover': { background: theme.palette.surfaceGreySubtle },
  },
  /**
   * The mark that says *a place, and nobody planned it*.
   *
   * Hollow, following the rule `SelectionList` set for its own pins — filled means
   * somebody planned this, hollow means nobody has — so the same idea is the same shape
   * on both of this feature's lists. A ring rather than a teardrop because at 7px a
   * teardrop is a smudge, and because these rows are already inside a block that names
   * them as locations.
   *
   * `textSecondary3` is 3.6:1 on the column's white, which clears the 3:1 floor for a
   * non-text mark. It is decorative regardless — `aria-hidden`, and redundant with the
   * group heading above it — so it is not carrying the exclusion on its own.
   */
  outsideMark: {
    flexShrink: 0,
    width: 7,
    height: 7,
    borderRadius: '50%',
    border: `1.5px solid ${theme.palette.textSecondary3}`,
  },
  /**
   * What the tooltip hangs off, and the row's one tab stop.
   *
   * A `div` rather than a `span`: `outsideName` is a `Typography`, so it renders a `<p>`,
   * and a paragraph inside a span is invalid markup that browsers silently reflow.
   *
   * Focusable, because MUI's `Tooltip` opens on focus as well as hover and a reason only
   * a mouse can reach is a reason half the planners who need it cannot read — the same
   * argument `FieldLabel` makes for its own tip. It costs one stop per excluded visit,
   * which is the honest price of the detail being reachable at all.
   */
  outsideAnchor: {
    flex: 1,
    minWidth: 0,
    borderRadius: 4,
    '&:focus-visible': { outline: `2px solid ${theme.palette.borderBrand}`, outlineOffset: 2 },
  },
  outsideName: {
    '&.MuiTypography-root': {
      fontSize: 13,
      fontWeight: 500,
      lineHeight: '18px',
      color: theme.palette.textPrimary,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      minWidth: 0,
    },
  },
  /**
   * Out of the plan, and still readable.
   *
   * "Slightly disabled" is the requirement and *slightly* is the load-bearing word: these
   * names are how the planner decides whether to press the remedy, so dimming them until
   * they are hard to read defeats the thing the dimming is for. So the row steps the name
   * down one tone and changes nothing else — no opacity on the row (which would take the
   * separators and the mark with it and produce a washed-out band rather than a quiet
   * one), no strikethrough (these visits are not cancelled, they are unplaced).
   *
   * **The tone was chosen against measured contrast on the column's white ground, and
   * the two obvious candidates both failed.** `textDisabled` (`#AEAEB2`) is 2.3:1 — the
   * palette's disabled ink is for controls nobody may press, not for 13px copy anybody
   * has to read. `textSecondary3` (`#86868B`) is 3.6:1, which clears the 3:1 non-text
   * floor the mark above answers to but not the 4.5:1 one for body text at this size. So
   * this is `textSecondary2` (`#5B5B5F`) at 6.8:1 — the next step up, comfortably inside
   * AA, and still a visible drop from `textPrimary`'s 15:1.
   *
   * Keyed on the visit's `reason` rather than on being in this panel, which is why it is
   * a row modifier and not simply the base tone: `triageGroups` sets a reason on every
   * visit it hands over (including the capacity group, which had to be given one for
   * exactly this rule to reach it), and a future group of rows that are *not* excluded
   * should render at full strength without anyone having to remember to undo this.
   */
  outsideRowExcluded: {
    '& $outsideName': {
      '&.MuiTypography-root': { color: theme.palette.textSecondary2 },
    },
  },
  aiHeader: { display: 'flex', alignItems: 'flex-start', gap: 10 },

  /* ---------- the avatar ----------
     All motion in this drawer lives here. That is deliberate: one moving thing
     reads as *something working*, several moving things read as an unstable
     screen, and the steps beside it must hold still to be read. Every animation
     below is transform or opacity only — no layout properties, per §7.22. */
  aiAvatar: {
    position: 'relative',
    flexShrink: 0,
    color: theme.palette.textBrand,
    /* At rest the mark sits still with a soft halo. The halo is what remains of
       the motion — it says "this was generated" without continuing to move. */
    borderRadius: '50%',
    transition: 'box-shadow 320ms ease',
    boxShadow: `0 0 0 0 ${theme.palette.surfaceBrand}00`,
  },
  aiAvatarSvg: { width: '100%', height: '100%', display: 'block', overflow: 'visible' },

  aiAvatarTrack: {
    fill: 'none',
    stroke: 'currentColor',
    strokeOpacity: 0.16,
    strokeWidth: 2,
  },
  /* The sweep is invisible at rest — the track alone is the resting shape, so
     stopping does not change the silhouette, only the movement. */
  aiAvatarSweep: {
    fill: 'none',
    strokeWidth: 2,
    strokeLinecap: 'round',
    strokeDasharray: '46 54',
    transformOrigin: '20px 20px',
    opacity: 0,
    transition: 'opacity 260ms ease',
  },
  aiAvatarOrbits: {
    fill: 'currentColor',
    transformOrigin: '20px 20px',
    /* Folded into the core at rest; they exist only while it is working. */
    opacity: 0,
    transform: 'scale(0.4)',
    transition: 'opacity 240ms ease, transform 320ms cubic-bezier(0.2, 0.8, 0.2, 1)',
  },
  aiAvatarSatelliteA: { transformOrigin: '20px 20px' },
  aiAvatarSatelliteB: { transformOrigin: '20px 20px', opacity: 0.7 },
  aiAvatarSatelliteC: { transformOrigin: '20px 20px', opacity: 0.5 },
  aiAvatarCore: {
    fill: 'currentColor',
    transformOrigin: '20px 20px',
    transition: 'transform 320ms cubic-bezier(0.2, 0.8, 0.2, 1)',
  },

  aiAvatarWorking: {
    '& $aiAvatarSweep': {
      opacity: 1,
      animation: '$aiSweep 1200ms linear infinite',
    },
    '& $aiAvatarOrbits': { opacity: 1, transform: 'scale(1)' },
    '& $aiAvatarSatelliteA': { animation: '$aiOrbit 2600ms linear infinite' },
    '& $aiAvatarSatelliteB': { animation: '$aiOrbitReverse 3400ms linear infinite' },
    '& $aiAvatarSatelliteC': { animation: '$aiOrbit 4200ms linear infinite' },
    /* The core breathes rather than pulsing in opacity: a mark that fades looks
       like it is failing to load, one that swells looks like it is thinking. */
    '& $aiAvatarCore': { animation: '$aiBreathe 1600ms ease-in-out infinite' },
  },

  '@keyframes aiSweep': {
    '0%': { transform: 'rotate(0deg)' },
    '100%': { transform: 'rotate(360deg)' },
  },
  '@keyframes aiOrbit': {
    '0%': { transform: 'rotate(0deg)' },
    '100%': { transform: 'rotate(360deg)' },
  },
  '@keyframes aiOrbitReverse': {
    '0%': { transform: 'rotate(360deg)' },
    '100%': { transform: 'rotate(0deg)' },
  },
  '@keyframes aiBreathe': {
    '0%, 100%': { transform: 'scale(0.92)' },
    '50%': { transform: 'scale(1.06)' },
  },

  /* Someone who asked for less movement gets the resting mark and the full list —
     the whole explanation, minus the theatre. **One block, not two:** a duplicate
     key here is not a merge, it is a silent overwrite, so a second
     `prefers-reduced-motion` rule further down would have thrown this one away. */
  '@media (prefers-reduced-motion: reduce)': {
    aiAvatarWorking: {
      '& $aiAvatarSweep': { animation: 'none', opacity: 0.5 },
      '& $aiAvatarSatelliteA': { animation: 'none' },
      '& $aiAvatarSatelliteB': { animation: 'none' },
      '& $aiAvatarSatelliteC': { animation: 'none' },
      '& $aiAvatarCore': { animation: 'none' },
    },
    aiConclusionWorking: {
      '&.MuiTypography-root': {
        animation: 'none',
        WebkitTextFillColor: theme.palette.textPrimary,
      },
    },
    aiStepEnter: { animation: 'none' },
    /* The reveal is skipped outright for these readers — `useHarmonizeReveal` goes
       straight to `ready`, so the stage never speaks and the plan is simply there.
       These rules are the belt to that braces: an entry animation that still fired
       would be the only movement on an otherwise still screen, which is worse than
       the sequence it came from. */
    aiStageLine: { '&.MuiTypography-root': { animation: 'none' } },
    aiStageTick: { transition: 'none' },
    aiPanel: { animation: 'none' },
    mapCardEnter: { animation: 'none' },
    routeCardEnter: { animation: 'none' },
    spillRibbon: { animation: 'none' },
    skeletonBar: { animation: 'none' },
  },
  /* While it works the panel itself lifts very slightly — a shadow, not a colour
     change, so the state reads as "active" rather than as a different kind of
     message. */
  aiPanelWorking: {
    boxShadow: `inset 0 0 0 1px ${theme.palette.surfaceBrand}22`,
  },
  aiHeaderText: { minWidth: 0, flex: 1 },
  aiConclusion: {
    '&.MuiTypography-root': {
      fontSize: 14,
      fontWeight: 600,
      lineHeight: '20px',
      color: theme.palette.textPrimary,
    },
  },
  /* The heading is the one piece of text that moves, and only while working: a
     slow sheen travelling across it, which is what "being written" looks like.
     Clipped to the glyphs so it cannot be mistaken for a progress bar. */
  aiConclusionWorking: {
    '&.MuiTypography-root': {
      background: `linear-gradient(90deg, ${theme.palette.textSecondary2} 0%, ${theme.palette.textPrimary} 18%, ${theme.palette.textSecondary2} 36%)`,
      backgroundSize: '280% 100%',
      WebkitBackgroundClip: 'text',
      backgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      animation: '$aiSheen 1800ms linear infinite',
    },
  },
  '@keyframes aiSheen': {
    '0%': { backgroundPosition: '120% 0' },
    '100%': { backgroundPosition: '-120% 0' },
  },
  aiNote: {
    '&.MuiTypography-root': {
      fontSize: 12,
      lineHeight: '17px',
      color: theme.palette.textSecondary1,
      marginTop: 3,
    },
  },
  /* The disclosure. Quiet — 11px, no underline at rest — because it is a way back
     to the reasoning and not a call to action; the planner's next move is the
     route below, not this. */
  aiWorkingToggle: {
    border: 0,
    background: 'none',
    padding: 0,
    cursor: 'pointer',
    font: 'inherit',
    fontSize: 11,
    fontWeight: 600,
    color: theme.palette.textBrand,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 3,
    '&:hover': { textDecoration: 'underline' },
  },
  aiWorkingChevron: {
    fontSize: 12,
    lineHeight: 1,
    transition: 'transform 200ms ease',
  },
  aiWorkingChevronOpen: { transform: 'rotate(180deg)' },

  aiSteps: {
    marginTop: 8,
    paddingLeft: 44,
    display: 'flex',
    flexDirection: 'column',
    gap: 3,
  },
  aiStep: { display: 'flex', alignItems: 'flex-start', gap: 7, minWidth: 0 },
  /* Each step arrives from below as it lands. 200ms, once, on entry only — the
     list must be still by the time it is being read. */
  aiStepEnter: {
    animation: '$aiStepIn 220ms cubic-bezier(0.2, 0.8, 0.2, 1) both',
  },
  '@keyframes aiStepIn': {
    from: { opacity: 0, transform: 'translateY(4px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
  },
  aiStepMark: {
    fontSize: 10,
    lineHeight: '16px',
    color: theme.palette.textBrand,
    flexShrink: 0,
    width: 10,
    textAlign: 'center',
  },
  aiStepText: {
    '&.MuiTypography-root': {
      fontSize: 12,
      lineHeight: '16px',
      color: theme.palette.textSecondary2,
      fontVariantNumeric: 'tabular-nums',
    },
  },

  /* ---------- a stop that has not landed yet ----------
     The rows exist from the moment the map appears, because the *count* is known —
     it is the route the line is drawing. What is withheld is each row's content,
     until the line reaches its pin. So a skeleton here is not "we are waiting on
     data"; it is "this stop is next", which is why the list has its real length
     from the first frame and never grows under the reader.

     Geometry is inherited from `stopRow` so a skeleton and the row that replaces
     it occupy exactly the same box. Anything else and the list shuffles twelve
     times on the way in. */
  stopRowPending: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: ROW_GAP,
    /* Mirrors `stopRow` exactly, including the empty grip column, so the skeleton
       and the row that replaces it occupy the same box to the pixel. Anything else
       and the list shuffles once per stop on the way in. */
    padding: '8px 8px 8px 0',
    paddingLeft: GRIP_WIDTH + ROW_GAP,
    borderRadius: 8,
  },
  /* Teardrop-ish: round at the top, pointed at the bottom, so the placeholder is
     recognisably the same object as the pin that lands in it.

     **Sized to the pin, which it was not.** It was `INDEX_SIZE` × 30 — the geometry of
     the *old* row's 24px index disc — while the pin that replaces it is 20 × 20. So
     every pill on a skeleton row started 4px right of where it would end up, and the
     whole list stepped sideways once per stop as the reveal landed. The one thing this
     placeholder exists to prevent.

     **And it carries its own shimmer rather than composing `skeletonBar`.** It was
     rendered as `classNames(stopPinPending, skeletonBar)`, and in a JSS sheet the
     *later* rule wins regardless of the order the class names are written in —
     `skeletonBar` is declared below this one, so its `height: 10` and `borderRadius: 5`
     overrode both, and the "teardrop" this comment described has never rendered as
     anything but a 10px bar. Two rules that disagree about geometry is a bug waiting on
     a re-order of the file, so this one owns its geometry *and* its paint. */
  stopPinPending: {
    width: STOP_PIN,
    height: STOP_PIN,
    flexShrink: 0,
    borderRadius: '50% 50% 50% 50% / 38% 38% 62% 62%',
    background: theme.palette.surfaceGreySubtle,
    backgroundImage: `linear-gradient(90deg, ${theme.palette.surfaceGreySubtle} 0%, ${theme.palette.surfaceWhite} 40%, ${theme.palette.surfaceGreySubtle} 80%)`,
    backgroundSize: '220% 100%',
    animation: '$aiSheen 1500ms linear infinite',
  },
  stopBodyPending: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 7,
    paddingTop: 4,
  },
  /* The sheen runs across the whole list rather than per row, so the rows read as
     one thing being filled in instead of twelve things loading separately. */
  skeletonBar: {
    height: 10,
    borderRadius: 5,
    background: theme.palette.surfaceGreySubtle,
    backgroundImage: `linear-gradient(90deg, ${theme.palette.surfaceGreySubtle} 0%, ${theme.palette.surfaceWhite} 40%, ${theme.palette.surfaceGreySubtle} 80%)`,
    backgroundSize: '220% 100%',
    animation: '$aiSheen 1500ms linear infinite',
  },
  skeletonBarThin: { height: 8, opacity: 0.72 },

  /* ---------- where the day starts ----------
     A statement with an edit affordance, not a field. The planner's own position
     is the answer nine times in ten, and an empty search box asks them to supply
     something the browser already knows. */
  startRow: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: 12,
    padding: '4px 24px 0',
  },
  startRowText: { flex: 1, minWidth: 0 },
  startValue: {
    '&.MuiTypography-root': {
      fontSize: 14,
      lineHeight: '20px',
      color: theme.palette.textPrimary,
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      minWidth: 0,
    },
  },
  /* `startBadge` is gone. It labelled *which rung* filled the field — CURRENT,
     ASSUMED — which is how the drawer guessed and not what the planner asked. It
     also put a badge on the most accurate origin available while leaving a typed
     one bare, so the honest case looked like the doubtful one. The address itself
     is the answer; `useStartPoint` reverse-geocodes every rung so there is always
     one. */
  startEditor: {
    padding: '8px 24px 0',
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  noRouteYet: { padding: '12px 24px 4px' },
  rangePicker: { width: '100%' },

  /* ---------- the time estimate and its arithmetic ---------- */
  timeChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 3,
    flexShrink: 0,
    cursor: 'help',
  },
  timeChipText: {
    '&.MuiTypography-root': {
      fontSize: 12,
      color: theme.palette.textSecondary2,
      fontVariantNumeric: 'tabular-nums',
    },
  },
  timeChipMark: {
    fontSize: 10,
    lineHeight: 1,
    color: theme.palette.textSecondary3,
  },
  timeTooltip: { display: 'flex', flexDirection: 'column', gap: 2, padding: '2px 0' },
  timeTooltipTitle: { '&.MuiTypography-root': { fontSize: 12, fontWeight: 600 } },
  timeTooltipRow: { '&.MuiTypography-root': { fontSize: 11, opacity: 0.85 } },

  /* ---------- the run of routes ----------
     Cards, and this is the one place in the drawer that earns them: three routes
     are three *objects* the planner compares and picks between, which is exactly
     what a card is for. Everything else here is one continuous argument and stays
     on hairlines. */
  routeList: { padding: '14px 24px 8px', display: 'flex', flexDirection: 'column', gap: 10 },
  routeListHeader: { display: 'flex', alignItems: 'center', gap: 8 },
  /* **What the map is showing, said next to the thing that changes it.** One map
     draws whichever card is open, which is the right call and was nowhere stated: with
     two routes, opening the second silently redraws the panel 300px above and the
     planner is left to infer the connection. Only rendered when there is more than one
     route, because with one there is nothing to infer. */
  routeListMapNote: {
    '&.MuiTypography-root': {
      fontSize: 11,
      color: theme.palette.textSecondary3,
      whiteSpace: 'nowrap',
      fontVariantNumeric: 'tabular-nums',
    },
  },

  /**
   * No card. `routeSlot` (in `harmonizeWorkspace.styles.js`) already draws the
   * selection ring around whichever of these is open, and this sits inside a column
   * that is itself now a distinct, tinted region — a bordered, white-filled box
   * around each route on top of both of those was a container inside a container
   * inside a container. What is left is spacing and hairlines, the same treatment
   * the rest of this drawer already uses everywhere it is not "three objects to
   * compare" (see `routeList`'s own note, which this reverses now that the column
   * itself does the framing three cards used to do).
   */
  routeCard: {},
  routeCardOpen: {},
  /* One card per route, arriving in order, with the delay set inline from the
     route's index. A run of three days should read as three days being decided —
     not as a block of cards appearing — and the order they arrive in is the order
     the solver filled them, which is information.

     **Slower on purpose: 440ms, and the stagger widened to 140.** This region is being
     presented from a live screen, and 280ms at 90ms apart reads as a flicker — three
     cards are done arriving before a viewer has finished looking at the first. The
     stagger is the whole point of the animation, so it has to be long enough to be
     perceived as sequence rather than as one event. */
  routeCardEnter: {
    animation: '$routeCardIn 440ms cubic-bezier(0.2, 0.8, 0.2, 1) both',
  },
  '@keyframes routeCardIn': {
    from: { opacity: 0, transform: 'translateY(10px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
  },

  /* ---------- the spill, disclosed on the route that absorbed it ----------
     Every route after the first exists because the one before it ran out of day.
     That is the single most consequential thing the optimizer did without being
     asked, and before this it was inferable only by noticing there were two cards.

     It is a ribbon on the route itself rather than a separate warning box, because
     the controls that answer it — which day, which route — are already in this
     card's body. A box beside the card would have had to either duplicate those
     controls or point at them, and §10 has the rule: one diagnosis, in one place.

     **The smallest element carries the colour.** The wash is barely there and the
     border is a hairline; the ink and the icon do the work. A four-line box in
     full attention amber shouts louder than the route it is a footnote to, which
     is the seventh pass's correction and it is easy to make twice. */
  spillRibbon: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 10,
    padding: '10px 12px',
    background: SPILL_WASH,
    /* `borderTop`, not bottom: the ribbon sits between the header and the body, and
       the body already draws its own top hairline. A bottom border here would
       double it the moment the card is opened. */
    borderTop: `1px solid ${SPILL_LINE}`,
    animation: '$spillRibbonIn 420ms cubic-bezier(0.2, 0.8, 0.2, 1) both',
  },
  '@keyframes spillRibbonIn': {
    from: { opacity: 0, transform: 'translateY(-6px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
  },
  /**
   * One line, and the ribbon is a row rather than a stack.
   *
   * It carried a second sentence — *"A new runsheet is proposed for them on the next
   * route day"* / *"They join Alex Green · Sun North"* — which is now the collapsed
   * header's own destination line, one element above it and in a legible tier. Three
   * lines of amber on a shut card made the exception louder than the route it is a
   * footnote to, which is the seventh pass's correction arriving for the third time.
   * What is left is the fact and the way out, side by side.
   */
  spillRibbonIcon: {
    width: 14,
    height: 14,
    flexShrink: 0,
    marginTop: 2,
    display: 'block',
    color: SPILL_INK,
  },
  spillRibbonText: { minWidth: 0, flex: 1 },
  spillRibbonTitle: {
    '&.MuiTypography-root': {
      fontSize: 13,
      fontWeight: 600,
      lineHeight: '18px',
      color: SPILL_INK,
    },
  },
  /* The way out, next to the disclosure that makes it necessary. It undoes the
     optimizer's unasked-for decision by taking that work out of the run entirely —
     the visits stay on the days they are already on, which is the one outcome the
     planner definitely did not need to be told about. */
  spillRibbonAction: {
    border: 0,
    background: 'none',
    padding: 0,
    flexShrink: 0,
    whiteSpace: 'nowrap',
    cursor: 'pointer',
    font: 'inherit',
    fontSize: 12,
    fontWeight: 600,
    color: SPILL_INK,
    textDecoration: 'underline',
    textUnderlineOffset: 2,
    borderRadius: 3,
    '&:hover': { opacity: 0.75 },
    '&:focus-visible': { outline: `2px solid ${SPILL_INK}`, outlineOffset: 2 },
  },
  /* Findable while shut. A collapsed card is a title and two numbers, so without
     this the planner has to open all three to discover which one is the exception. */
  routeCardSpill: {
    '& $routeCardIndex': { background: SPILL_INK },
  },
  /* The header is the button when the card is shut, so it is a real one — a div
     with an onClick is not reachable by keyboard and this is the only way into the
     card. Reset to look like the row it is.

     **A column now, not a row**, because the fullness bar spans the card's full inset
     width underneath the text rather than sitting as a 54px stub inside it. Three
     stacked cards then have three bars on one axis at one length, which is the only
     arrangement in which "how full is each day" is answered by looking rather than by
     reading. */
  routeCardHeader: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: 9,
    padding: '10px 12px 11px',
    border: 0,
    background: 'none',
    font: 'inherit',
    textAlign: 'left',
    cursor: 'pointer',
    '&:hover': { background: theme.palette.surfaceGreySubtle },
    '&:focus-visible': { outline: `2px solid ${theme.palette.surfaceBrand}`, outlineOffset: -2 },
  },
  routeCardHeadRow: { display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 },
  routeCardIndex: {
    width: 22,
    height: 22,
    borderRadius: '50%',
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 11,
    fontWeight: 600,
    color: theme.palette.textOnColor,
    background: theme.palette.surfaceBrand,
  },
  routeCardHeaderText: { flex: 1, minWidth: 0 },
  /* The day and the visit count, on one line and in that order. The collapsed header
     used to read `Route 2 · Tue 18 Aug` with the number said twice — once in the index
     disc and once in the words beside it — and the day, which is the fact a run of
     routes is *about*, arriving third. The disc carries the number; the title carries
     the day. */
  routeCardTitleRow: { display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 },
  routeCardTitle: {
    '&.MuiTypography-root': {
      fontSize: 14,
      fontWeight: 600,
      lineHeight: '20px',
      color: theme.palette.textPrimary,
      whiteSpace: 'nowrap',
      flexShrink: 0,
    },
  },
  routeCardCount: {
    '&.MuiTypography-root': {
      fontSize: 13,
      lineHeight: '20px',
      color: theme.palette.textSecondary1,
      fontVariantNumeric: 'tabular-nums',
      whiteSpace: 'nowrap',
      flexShrink: 0,
    },
  },
  /**
   * What Apply will write, on the shut card.
   *
   * This line used to be the tail of a four-fact meta string — `6 visits · 7h 12m of
   * 8h · Alex Green · Sun North` at 11px with `text-overflow: ellipsis` — so the
   * destination was both the least legible thing in the header and the first thing
   * truncated, while being the only *consequence* stated anywhere on a collapsed card.
   * It gets its own line. The counts moved up beside the day and the duration moved
   * out to the right-hand figure, which is what freed the width.
   */
  routeCardMeta: {
    '&.MuiTypography-root': {
      fontSize: 12,
      lineHeight: '17px',
      color: theme.palette.textSecondary2,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
  },
  /* The figure, right-aligned: how much of the day is used, over how much it is
     measured against. Two lines rather than one string so the used total can be the
     larger tier — a planner comparing cards reads the numbers as well as the bars, and
     `7h 12m of 8h` as one 11px run gives neither part any weight. */
  routeCardFigure: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    flexShrink: 0,
    minWidth: 62,
  },
  routeCardFigureValue: {
    '&.MuiTypography-root': {
      fontSize: 14,
      fontWeight: 600,
      lineHeight: '18px',
      color: theme.palette.textPrimary,
      fontVariantNumeric: 'tabular-nums',
      whiteSpace: 'nowrap',
    },
  },
  routeCardFigureUnit: {
    '&.MuiTypography-root': {
      fontSize: 11,
      lineHeight: '15px',
      color: theme.palette.textSecondary3,
      fontVariantNumeric: 'tabular-nums',
      whiteSpace: 'nowrap',
    },
  },
  routeCardFigureOver: { '&.MuiTypography-root': { color: theme.palette.textAlert } },
  /**
   * The route's shape, on the shut card: its stops as numbered teardrops, in sequence.
   *
   * **Full-bleed to the card's inset and above the gauge, which is where it belongs on both
   * counts.** Indented to align with the title it would have been a property of the text
   * block, and the strip is not about the day's name — it is the other half of what the bar
   * below it says. The bar gives the day's *magnitude*, the strip gives its *extent*, and
   * stacking them on one axis at one length is what lets three cards be compared by looking:
   * the same argument `routeCardGauge` makes about its own width, applied to the row above
   * it. Above rather than below because the gauge has to stay adjacent to the card body's
   * top edge — it is the element that expands into `DayMeter` when the card opens, and
   * putting a strip of pins between the bar and the meter it becomes breaks that.
   *
   * `overflow: hidden` is a backstop, not the truncation mechanism — `RouteCard` caps the
   * count and prints a tail, because a pin sliced in half by a clip is a rendering bug that
   * happens to be legible as one. This is here for the case the cap has not anticipated: a
   * merged route in a column dragged below its own floor.
   */
  routeCardPins: {
    display: 'flex',
    alignItems: 'center',
    gap: PIN_STRIP_GAP,
    minWidth: 0,
    overflow: 'hidden',
  },
  /* Sizing only. The pin's geometry is a `viewBox` in `StopPinIcon`, so this rule is the
     entire difference between a strip pin and the 20px one in the stop list —
     `overflow: visible` for the same reason `stopMarker` needs it: the masked rim strokes
     to the edge of the box and a clip shaves the teardrop's tip. */
  routeCardPin: {
    width: PIN_STRIP_SIZE,
    height: PIN_STRIP_SIZE,
    flexShrink: 0,
    display: 'block',
    overflow: 'visible',
  },
  /* `+4`, when the sequence is longer than the strip. Deliberately typographic rather than
     a grey pin with a `+` in it: a fourteenth teardrop would claim to be stop 14, and the
     one thing this tail must not do is look like a stop. Baseline-nudged down 1px because
     the teardrops' visual mass sits above their tips. */
  routeCardPinsMore: {
    '&.MuiTypography-root': {
      flexShrink: 0,
      marginLeft: 1,
      paddingBottom: 1,
      fontSize: 11,
      fontWeight: 600,
      lineHeight: `${PIN_STRIP_SIZE}px`,
      color: theme.palette.textSecondary3,
      fontVariantNumeric: 'tabular-nums',
      whiteSpace: 'nowrap',
    },
  },
  /**
   * How full the day is, as a bar — full card width, and on the same scale as the
   * meter inside.
   *
   * It was 54px wide and lived in the middle of the header row, which made it a
   * decoration: at that length the difference between 6h and 7h is four pixels, and
   * two cards' bars started at different x positions because the text beside them was
   * a different length. Full-bleed to the card's inset, three cards give three bars of
   * one length on one axis.
   *
   * The scale is `max(budget, used)`, exactly as `DayMeter` does it, so the collapsed
   * bar and the expanded meter cannot disagree about where the day ends —
   * `routeCardGaugeBudget` is the mark at eight hours, drawn only when the bar has run
   * past it.
   */
  routeCardGauge: {
    position: 'relative',
    width: '100%',
    height: 5,
    borderRadius: 3,
    overflow: 'hidden',
    background: theme.palette.borderSubtle1,
  },
  /* **`transform`, not `width`.** This file's own meter comment says width is a layout
     property and transitioning it thrashes, and then this rule transitioned width. A
     scaled bar composites, and `transformOrigin` is what keeps it growing from the
     left. Longer than the old 220ms for the same reason the card entrance is. */
  routeCardGaugeFill: {
    width: '100%',
    height: '100%',
    borderRadius: 3,
    background: theme.palette.surfaceBrand,
    transformOrigin: 'left center',
    transition: 'transform 380ms cubic-bezier(0.2, 0.8, 0.2, 1)',
  },
  routeCardGaugeOver: { background: theme.palette.surfaceWarningStrong },
  routeCardGaugeBudget: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    background: theme.palette.surfaceWhite,
  },
  routeCardChevron: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 16,
    height: 16,
    flexShrink: 0,
    color: theme.palette.textSecondary3,
    transition: 'transform 260ms cubic-bezier(0.2, 0.8, 0.2, 1)',
  },
  routeCardChevronOpen: { transform: 'rotate(180deg)' },
  /* Drawn rather than typed, for the same reason the stop row's is — see
     `stopChevronIcon`. */
  routeCardChevronIcon: { width: 12, height: 12, display: 'block' },
  routeCardBody: { borderTop: `1px solid ${theme.palette.borderSubtle1}`, paddingBottom: 4 },
  /* Second block in the body, directly under the meter — which is what `DayMeter`'s
     docstring has always claimed and the layout never did: switching the merge target
     back to a new runsheet empties the "already on route" segment, and that only reads
     as cause and effect if the control is under the bar it changes. */
  routeCardFields: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
    gap: 12,
    padding: '12px 0 14px',
    borderTop: `1px solid ${theme.palette.borderSubtle1}`,
    '@media (max-width: 560px)': { gridTemplateColumns: 'minmax(0, 1fr)' },
  },
  fieldWide: {
    gridColumn: '1 / -1',
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    minWidth: 0,
  },
  /* Subtitle/Medium on Text/secondary-03, which is what a field label is in this
     system. It was 12px on `textSecondary1` — a size and a weight of its own invention,
     and darker than the value it labels, so the label was out-shouting the answer. */
  fieldLabel: {
    '&.MuiTypography-root': {
      fontFamily: 'Inter',
      fontSize: 14,
      fontWeight: 500,
      lineHeight: '20px',
      color: theme.palette.textSecondary3,
      display: 'flex',
      alignItems: 'center',
      gap: 6,
    },
  },
  /* 12px under a 14px label. At 11px it was two steps below the label rather than one,
     which made the one fact worth keeping on screen look like fine print. */
  fieldHint: {
    '&.MuiTypography-root': {
      fontSize: 12,
      lineHeight: '16px',
      color: theme.palette.textSecondary3,
      marginTop: 0,
    },
  },
  /**
   * A hint with a one-press remedy on the end of it.
   *
   * The distinction this row exists to preserve: a count on its own is a scoreboard, a
   * count with the fix beside it is an offer. `RuleStrip`'s docstring records what
   * happened the last time this region reported an outcome without one — `0 of 5 visits
   * qualify` over five hollow circles — so the coverage counts under the two knobs are
   * only ever drawn in here, next to the link that acts on them.
   *
   * Wrapping rather than truncating, because the link is the half that must survive a
   * 300px column: `Covers 9, 5 out` and `Extend to 17 mi` on two lines is still an
   * offer, whereas an ellipsis through the link is a scoreboard again. `baseline`, not
   * `center`, so the 12px hint and the 12px link sit on one line of text rather than
   * being centred against each other's boxes.
   */
  hintRow: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'baseline',
    gap: 6,
    minWidth: 0,
  },
  /* The picker ships a 44px control and its own stack padding; the drawer's fields
     are the same height, so only the stack needs flattening. */
  datePicker: {
    width: '100%',
    '& .MuiInputBase-root': { height: 44 },
  },

  /**
   * ---------- the install-day multi-select ----------
   *
   * **Deliberately the same control as the harmonization settings screen's**, down to
   * the chips in the closed field and the ticked full names in the menu. Installation
   * days is one question and this screen seeds its answer from that one, so two
   * different shapes for it — a row of toggle chips here, a dropdown there — would make
   * a planner check whether they are the same setting. They are not the same setting
   * (this run only, never written back) but they are the same *question*, and the
   * control is what says so.
   *
   * A row of seven always-visible day chips was the alternative and it is the wrong one
   * twice over. It would be the only control in this column without the system's 44px
   * input shell, which is exactly the fault `RuleStrip`'s docstring records fixing on
   * the steppers — four fields with a bounding box and a fifth floating between them.
   * And at 300px the seven short names plus their touch targets wrap to two rows, so
   * the compactness it was reached for is not there.
   *
   * The rules below are a mirror of `harmonization.styles.js`'s `daysSelect`/`dayChip`/
   * `dayOption`, not an import of them: that sheet is a settings page's, full of
   * `section` and `prefRow`, and pulling its hook in here would make the drawer's
   * appearance hostage to a refactor of a screen it has no other reason to depend on.
   */
  daysSelect: {
    '&.MuiInputBase-root': { width: '100%', minWidth: '100%', minHeight: 44 },
    /* The chips set their own rhythm inside the field, so the input's own vertical
       padding would be doubled air. Horizontal padding stays, and the right side keeps
       enough room for the chevron. */
    '& .MuiSelect-select': {
      display: 'flex',
      alignItems: 'center',
      padding: '0 32px 0 12px !important',
      minHeight: '44px !important',
      boxSizing: 'border-box',
    },
  },
  /* Wrapping rather than scrolling, because a hidden seventh day is a rule the planner
     cannot check — and in a quarter-width column a full week does wrap. The field grows
     to hold it; the column is a stack, so there is nothing beside it to push. */
  dayChips: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 4,
    padding: '4px 0',
  },
  /**
   * The chips are the value of the field, so they are the last text here that should be
   * hard to read — the settings screen measured brand-on-brand-tint at 2.87:1 and gave
   * it up for exactly this pairing. Grey ground, body ink, and `!important` on the
   * colour because the theme's own `MuiChip` override is emotion and lands after JSS.
   */
  dayChip: {
    '&.MuiChip-root': {
      height: 24,
      borderRadius: 6,
      backgroundColor: theme.palette.surfaceGreySubtle,
      color: `${theme.palette.textSecondary1} !important`,
    },
    '& .MuiChip-label': { padding: '0 8px', fontSize: 12, fontWeight: 500 },
  },
  daysMenu: {
    '&.MuiPaper-root': {
      marginTop: 4,
      borderRadius: 8,
      border: `1px solid ${theme.palette.borderSubtle1}`,
      backgroundColor: theme.palette.surfaceWhite,
    },
  },
  dayOption: {
    '&.MuiMenuItem-root': { gap: 4, padding: '2px 12px 2px 8px', minHeight: 36 },
    /* The tick is the selected state. MUI also paints the row, which on a multi-select
       means up to seven highlighted rows and no legible "current" one. */
    '&.Mui-selected': { backgroundColor: 'transparent' },
    '&.Mui-selected:hover': { backgroundColor: theme.palette.surfaceGreySubtle },
    '& .MuiTypography-root': { fontSize: 14, color: theme.palette.textSecondary1 },
  },
  dayOptionCheckbox: {
    '&.MuiCheckbox-root': { padding: 6 },
  },
  routeNoTargets: {
    '&.MuiTypography-root': {
      fontSize: 13,
      lineHeight: '18px',
      color: theme.palette.textSecondary1,
      paddingTop: 12,
    },
  },

  /* Work no day in the window could take. Named rather than dropped — the window is
     the planner's own constraint and the honest response is to say it is too small. */
  unplaced: {
    padding: '10px 12px',
    borderRadius: 8,
    background: SPILL_WASH,
    border: `1px solid ${SPILL_LINE}`,
  },
  unplacedTitle: {
    '&.MuiTypography-root': {
      fontSize: 13,
      fontWeight: 600,
      lineHeight: '18px',
      color: SPILL_INK,
    },
  },
  unplacedHint: {
    '&.MuiTypography-root': { fontSize: 12, lineHeight: '17px', color: SPILL_INK, opacity: 0.85 },
  },

  /* ---------- footer ----------
     What Apply will do, as three figures rather than two sentences. It carried a
     summary line and a hint line, which restated the panel's diagnosis in a
     different register and read as a second, contradictory opinion — the footer's
     job is the action, so it holds the count of routes, the count of visits placed,
     and the exception when there is one. */
  footer: {
    borderTop: `1px solid ${theme.palette.borderSubtle1}`,
    /* The extra `SCROLLBAR_W` on the right is what puts the buttons on the same axis
       as the cards above them — see the constant for why they were 8px apart. The
       left inset needs no such correction: a scrollbar only takes from one side. */
    padding: `12px ${24 + SCROLLBAR_W}px 16px 24px`,
    display: 'flex',
    /* Top-aligned, because the left column's first line is the figures row — the
       thing the buttons are the answer to — and it can run to three lines below
       that. Centring would float them to the middle of the prose. */
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 16,
    flexWrap: 'wrap',
    background: theme.palette.surfaceWhite,
    flexShrink: 0,
  },
  /* **Centred when there are no figures.** With no plan the left column is a single
     12px amber sentence, and top-aligning 40px buttons against a 17px line leaves
     them towering over it with the whole footer looking snapped to the top. The
     alignment should follow what is actually in the column, not what usually is. */
  footerBalanced: { alignItems: 'center' },
  /* Figures, then the write, then the caveat — biggest type at the top, so the eye
     lands on the amount and reads down into the consequence. The previous version of
     this footer put two prose lines side by side with the buttons and had no such
     order, which is what made it read as scattered. */
  footerText: { display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0, flex: 1 },
  footerWrite: {
    '&.MuiTypography-root': {
      fontSize: 12,
      lineHeight: '17px',
      color: theme.palette.textSecondary1,
    },
  },
  footerCaveat: {
    '&.MuiTypography-root': {
      fontSize: 12,
      lineHeight: '17px',
      fontWeight: 500,
      color: SPILL_INK,
    },
  },
  footerFacts: { display: 'flex', alignItems: 'center', gap: 14, minWidth: 0 },
  footerFact: { display: 'flex', alignItems: 'baseline', gap: 5, minWidth: 0 },
  footerFigure: {
    '&.MuiTypography-root': {
      fontSize: 18,
      fontWeight: 700,
      lineHeight: '22px',
      color: theme.palette.textPrimary,
      fontVariantNumeric: 'tabular-nums',
    },
  },
  footerFigureWarn: { '&.MuiTypography-root': { color: SPILL_INK } },
  footerFactLabel: {
    '&.MuiTypography-root': {
      fontSize: 11,
      lineHeight: '16px',
      color: theme.palette.textSecondary1,
      whiteSpace: 'nowrap',
    },
  },
  footerDivider: { width: 1, height: 20, background: theme.palette.borderSubtle1, flexShrink: 0 },

  /* Why the button will not go, in the amber this drawer uses for *this part did not
     work*. Sits last in the left column, immediately left of the button it is about,
     so the reason and the control are read in one movement. */
  footerBlock: {
    '&.MuiTypography-root': {
      display: 'flex',
      alignItems: 'flex-start',
      gap: 5,
      fontSize: 12,
      lineHeight: '17px',
      fontWeight: 500,
      color: SPILL_INK,
    },
  },
  footerBlockIcon: { flexShrink: 0, lineHeight: '17px' },

  /* **`marginLeft: auto`, not `justify-content` on the parent.** The footer is
     `space-between`, which only pushes the buttons right while something else is in
     the row — and while the optimizer composes there are no figures, so the buttons
     slid to the left edge and then jumped right when the plan landed. The CTAs are
     the one thing on this screen that must not move. */
  footerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    flexShrink: 0,
    marginLeft: 'auto',
  },
  busy: { opacity: 0.75 },

  empty: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 },
  emptyText: {
    '&.MuiTypography-root': { fontSize: 14, color: theme.palette.textSecondary3 },
  },

  /* ==================== eighteenth pass — the route cards region ====================
     Keys added for the rework of everything below the map. Appended rather than
     interleaved so the diff against the seventeenth pass is one block. */

  /**
   * The re-solve, disclosed on the route it happened to.
   *
   * §2 decision 17 requires it — *"silently rewriting someone else's route destroys
   * trust"* — and `StopList` has always had a `summary` prop for exactly this and has
   * never been passed one, so the prop was dead and the disclosure existed only in the
   * footer, six hundred pixels below the sequence it describes. It sits in the stop
   * list's own header now, next to the order it is talking about.
   */
  stopSummary: {
    '&.MuiTypography-root': {
      fontSize: 11,
      color: SPILL_INK,
      whiteSpace: 'nowrap',
      fontVariantNumeric: 'tabular-nums',
    },
  },

  /**
   * The access-window caveat, in an amber that can carry a sentence.
   *
   * It was rendering with `windowWarning`, whose colour is `textWarning` — and the top
   * of this very file records that `textWarning` (`#f19f02`) *"fails contrast as body
   * copy on any light ground, so it can mark a bar or a border but never carry a
   * sentence"*. It was carrying a sentence. `SPILL_INK` is the drawer's readable amber
   * and it is already what every other "this did not fit" line is written in.
   * `windowWarning` is left alone for the drawer-body list that also uses it.
   */
  stopDetailWarn: {
    '&.MuiTypography-root': {
      display: 'flex',
      alignItems: 'flex-start',
      gap: 5,
      fontSize: 12,
      lineHeight: '17px',
      color: SPILL_INK,
      marginTop: 2,
    },
  },
  stopDetailWarnIcon: { width: 12, height: 12, flexShrink: 0, marginTop: 2, display: 'block' },

  /**
   * What the arrow keys just did, for a screen reader.
   *
   * The keyboard reorder path worked and said nothing: `↑` moved the row, the DOM
   * re-ordered, and a planner not looking at the screen got silence. Clipped rather
   * than `display: none`, because a hidden node is not announced.
   */
  stopReorderStatus: {
    position: 'absolute',
    width: 1,
    height: 1,
    margin: -1,
    padding: 0,
    overflow: 'hidden',
    clip: 'rect(0 0 0 0)',
    whiteSpace: 'nowrap',
    border: 0,
  },
}));
