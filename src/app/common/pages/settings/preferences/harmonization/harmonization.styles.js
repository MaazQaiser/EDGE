import { makeStyles } from '@mui/styles';

/**
 * Geometry that must not drift is named here rather than chosen per rule.
 *
 * **44, and every control on the screen is that tall.** It was 36 for the numeric fields
 * and the segmented group, which was fine while those were the only controls here. The
 * address fields are `AddressSearchField`, whose own rule is `height: 44`, and three
 * heights down one column reads as three unrelated forms stacked. 44 is the one they can
 * all agree on without the address field having to be overridden from outside its own
 * stylesheet, and it clears the 44px pointer-target floor that a 32px segment did not.
 *
 * `ROW_HEIGHT` follows it: 60 keeps the same 8px of air above and below a control that 52
 * gave a 36px one, so the rhythm is unchanged even though every row is taller.
 */
const ROW_HEIGHT = 60;
const CONTROL_HEIGHT = 44;

/**
 * The columns, named once because two stacked tables have to agree on them.
 *
 * They used to be written out per rule — `180px 80px 220px` on the weekday rows,
 * `180px 1fr 220px` on the timing rows — which meant the two control columns lined
 * up at exactly one viewport width and nowhere else: 220px apart at 1440, 600px
 * apart in the wrong direction, 171px at 1024. Two tables one above the other that
 * put their controls in different places read as two unrelated screens.
 *
 * `COLUMN_MIDDLE` is a fixed width rather than `1fr` for the same reason. `1fr`
 * hands the control's x position to the viewport, and on a wide settings panel it
 * also throws the control to the far right with a half-metre of empty row in front
 * of it, when what this form wants is to stay compactly left-packed. 288px is sized
 * to the longest description either table has to hold ("How far ahead a single run
 * can schedule work."); a description that needs a second line still costs 40px,
 * which is under `ROW_HEIGHT`, so wrapping cannot disturb the row grid.
 */
/**
 * `COLUMN_CONTROL` is 352, and it is now wider than anything in it needs.
 *
 * It went 220 → 320 for the address field, since the widest control stopped being a 96px
 * number and became a formatted address, and "1 High Street, Tampa, FL" in 220px is a
 * truncation. Then 320 → 352 so the harmonization window's three shortcut segments could
 * carry whole words rather than `1 wk / 2 wks / 4 wks`.
 *
 * That window control has since been removed from the screen entirely, so the widest cell is
 * the address again and 352 is more than it strictly requires. It stays, because the address
 * still overflows its field at this width and every pixel goes to showing more of it. If the
 * column is ever narrowed, the address is the thing to measure against, not the numbers.
 *
 * `COLUMN_MIDDLE` is 280, up from 264, because the descriptions got longer: "The window
 * around the need by date within which a visit must be performed." is 71 characters. Two
 * lines is 40px and fits inside `ROW_HEIGHT`.
 *
 * The cost is real: the row's fixed cost is `180 + 64 + 352 + 48 = 644px`, which is the width
 * below which the middle column would have collapsed to nothing before `STACK_BREAKPOINT`
 * existed. It is why that breakpoint exists.
 */
const COLUMN_LABEL = 180;
const COLUMN_MIDDLE = 280;
const COLUMN_CONTROL = 352;
const COLUMN_GAP = 32;

/* The single horizontal inset shared by every header, row and note on the screen.
   The rows had it and the section headers did not, so "Route Days" sat 24px to the
   left of the "Day" column heading immediately beneath it. */
const ROW_INSET = 24;

/**
 * The short number fields — radius, need-by, harmonization window — are one size.
 *
 * 96 survived the `±` moving inside the need-by field and the `days` moving inside the
 * window field, which was the thing most likely to force a change: measured, the widest
 * case is three typed digits (`digitsOnly` allows no more) beside a 14px unit inside a
 * 96px shell, and it does not clip. Growing one of them was the alternative and it costs
 * more than it buys — four fields in one column that start at the same x and end at four
 * different ones read as four unrelated controls.
 *
 * `FIELD_INSET` is the horizontal padding every field on the screen already had from the
 * theme (`10px 14px`). It is named here only because the need-by field has to restate it,
 * for the reason written on `needByField`.
 */
const FIELD_WIDTH = 96;
const FIELD_INSET = 14;

/* Spread into all three row rules so there is one template, not three that have to
   be kept in step by hand. */
/* `minmax(0, …)` on the middle column, not a bare width. The settings shell gives
   this panel whatever the vertical tab list leaves it — 763px at a 1024 viewport —
   and three fixed columns give the row an 800px min-content that cannot shrink into
   it, which put a horizontal scrollbar in the settings pane. Letting the middle
   column compress keeps the row inside the panel, and because all three rules share
   this one template they compress together, so the control column stays aligned
   between the two tables at every width. */
/**
 * Where the three-column row gives up and becomes two lines.
 *
 * `minmax(0, …)` on the middle column lets it compress to **nothing**, which was
 * deliberate — three fixed columns gave the row an 800px min-content that put a horizontal
 * scrollbar in the settings pane — but the failure it traded for is worse than the one it
 * fixed. The row's fixed cost is `180 + 64 + 352 + 48 = 644px`, so the description gets
 * `panelWidth − 644` and floors at zero: every explanation on the screen silently
 * disappears, and the text does not truncate, it wraps to one word per line and spills over
 * the control. No scrollbar appears to say anything is missing.
 *
 * That is WCAG 1.4.4 (Resize Text, AA), because 200% zoom on a 1440px screen is a 720px
 * viewport and the panel tracks the shell at roughly `viewport − 148`, so the middle column
 * is gone below about a 792px viewport.
 *
 * 1000px, not 800: measured, the middle column is already down to 232px at a 1024 viewport
 * and the longest description is on three lines there. Stacking before it gets narrower is
 * the point — waiting until it collapses means shipping the unreadable interval in between.
 */
const STACK_BREAKPOINT = 1000;

/**
 * How far a focused control has to clear the bottom of the scrollport.
 *
 * The footer is sticky and 69px tall, and the shell pads its scrollport by 12px, so the
 * bottom 81px of the visible area is behind an opaque bar. Chrome will not scroll a focused
 * element out from under it, because as far as the scroll container is concerned the element
 * is already inside the visible box — so tabbing from Radius used to land on the info button
 * and then the need-by field with both of them invisible. `scroll-margin-bottom` is what
 * tells the browser those elements are taller than they look, which makes focus scroll them
 * clear. WCAG 2.4.11 Focus Not Obscured.
 */
const FOOTER_CLEARANCE = 81;

/**
 * The media query as a single named string, and **the only place it is written.**
 *
 * It was written twice for about ten minutes — once inside `gridRow` and once again in
 * `prefRow` to release the row height — and because `prefRow` spreads `gridRow` and then
 * declares its own key of the same name, plain object semantics threw the first one away.
 * The stack silently never applied: at a 720px viewport the grid still computed
 * `180px 0px 352px` with descriptions 0px wide and text spilling over the controls, which
 * is exactly the bug this was written to fix. Everything the stacked row needs now lives in
 * one object so there is nothing to duplicate.
 */
const STACK_QUERY = `@media (max-width: ${STACK_BREAKPOINT}px)`;

/* Two lines instead of three columns. The label and its description keep the first line,
   the control takes the second across the full width — so the description keeps a readable
   measure instead of being compressed out of existence, and the control stops being what
   decides how much room is left for prose. `minHeight` goes with it: the 60px floor was
   measured for a single line and cannot hold two. */
const stackedRow = {
  gridTemplateColumns: `${COLUMN_LABEL}px minmax(0, 1fr)`,
  rowGap: '10px',
  alignItems: 'start',
  paddingTop: '12px',
  paddingBottom: '12px',
  minHeight: 0,
  '& > *:nth-child(3)': {
    gridColumn: '1 / -1',
  },
};

/**
 * The weekday table has **four** columns now, and its own template.
 *
 * Day, On, Officers, Max Shift Hours. It shared `gridRow`'s three columns while it had three
 * things in it, which kept the shift field on the same x as the radius and need-by fields
 * above — worth having, and no longer possible: a fourth column cannot line up with a
 * three-column row, and squeezing officers into the middle column beside the checkbox would
 * make the checkbox the thing that decides how many avatars fit.
 *
 * So the table is a table. `On` is 56 because it holds a 36px hit area and nothing else.
 * `Officers` takes the slack as `1fr`, because the number of avatars is the one thing here
 * that varies with the data. `Max Shift Hours` is 200: the 96px field, its `hrs`, and the
 * `1–16 hrs` note beside the heading all fit, measured.
 *
 * It **never stacks**, for the same reason as before: there is no prose in any of these cells
 * to lose, and stacking seven rows into two lines each turns a compact table into a screenful.
 */
/**
 * **Compact and left-packed: `On`, `Day`, `Max Shift Hours`, then slack.**
 *
 * These were four equal quarters, which gave the header a regular beat and cost more than it
 * bought: at 195px a column, the checkbox sat 195px from the day it belonged to and the shift
 * field another 195 beyond that, so reading one row meant three saccades across 600px of mostly
 * empty space. Seven rows of that is a lot of eye travel to set two values.
 *
 * So the three real columns are sized to their contents and packed together, and a trailing
 * `1fr` absorbs the rest. That last track is deliberately empty: it keeps the row spanning the
 * full panel, so the hairlines under these rows line up with the two rows above them instead of
 * stopping short at 480px.
 *
 * `On` first, at 40px: the checkbox's hit area is 36, so the track is that plus a hair rather
 * than the 56 it started at. Measured, 56 left 46px between the checkbox and the day it belongs
 * to — track slack plus the gap — which is the exact distance this layout is trying to remove.
 * `Day` at 132, which holds `Wednesday` at 14px with room. `Max Shift Hours` at 210, sized to its
 * *heading* rather than its field: the label, its tooltip button and the `1–16 hrs` note together
 * are wider than the 96px input beneath them.
 */
const DAY_TABLE_COLUMNS = '40px 132px 210px minmax(0, 1fr)';

/**
 * A tighter gap than the rest of the screen's 32px.
 *
 * The preference rows above are label / description / control, where 32px is what keeps three
 * different kinds of thing from reading as one run-on line. A table row is one kind of thing
 * three times over, so the gap's job is only to separate cells, and 20px does that while keeping
 * the row scannable in a single glance.
 */
const DAY_TABLE_GAP = 20;

/**
 * What the three real columns plus their gaps and the row inset come to:
 * `40 + 20 + 132 + 20 + 210 + 48 = 470`.
 *
 * Below that the table scrolls sideways in its own box rather than compressing a cell — the same
 * contract as before, at a much lower threshold now that the columns are content-sized. It is
 * comfortably under the panel at any width this screen is used at, so in practice the scrollport
 * never engages; it is there so that when it does, nothing collapses.
 */
const DAY_TABLE_MIN_WIDTH = 470;

/**
 * The weekday table's own template: the same three columns, and it **never stacks**.
 *
 * `gridRow`'s stacked variant exists because a label/description/control row loses its prose
 * when the middle column is squeezed. The day rows have no prose there — the middle column
 * holds a 24px checkbox under the "On" heading — so stacking them would put the shift field
 * on its own line and turn a compact seven-row table into 800px of scrolling for nothing.
 *
 * Written by removing the stack key rather than by overriding it inside the rules, because
 * spreading `gridRow` and then re-declaring `[STACK_QUERY]` would silently *replace* the
 * stack instead of layering on it — same object-key collision that made the stack fail to
 * apply at all the first time. Removing it here means there is nothing to collide with.
 *
 * The middle column keeps a floor of 48px rather than `minmax(0, …)`: at zero the checkbox
 * has no track to sit in and overflows it. 48 is room for a 36px hit area and no more.
 */
const { [STACK_QUERY]: _stackedVariant, ...gridRowFixed } = {
  display: 'grid',
  gridTemplateColumns: DAY_TABLE_COLUMNS,
  gap: `${DAY_TABLE_GAP}px`,
  alignItems: 'center',
  boxSizing: 'border-box',
  scrollMarginBottom: `${FOOTER_CLEARANCE}px`,
  '& input, & button, & [role="combobox"]': {
    scrollMarginBottom: `${FOOTER_CLEARANCE}px`,
  },
  [STACK_QUERY]: stackedRow,
};

const gridRow = {
  display: 'grid',
  gridTemplateColumns: `${COLUMN_LABEL}px minmax(0, ${COLUMN_MIDDLE}px) ${COLUMN_CONTROL}px`,
  gap: `${COLUMN_GAP}px`,
  alignItems: 'center',
  boxSizing: 'border-box',

  /* On the row and on everything focusable inside it, because Chrome scrolls the *focused
     element* into view and reads that element's own scroll-margin, not its ancestor's. */
  scrollMarginBottom: `${FOOTER_CLEARANCE}px`,
  '& input, & button, & [role="combobox"]': {
    scrollMarginBottom: `${FOOTER_CLEARANCE}px`,
  },

  [STACK_QUERY]: stackedRow,
};

/* What the columns actually add up to, and therefore how wide this screen is
   allowed to be: the section hairlines were spanning the whole panel and running a
   few hundred pixels past the last column they belonged to. */
const TABLE_WIDTH = COLUMN_LABEL + COLUMN_MIDDLE + COLUMN_CONTROL + COLUMN_GAP * 2 + ROW_INSET * 2;

export const useStyles = makeStyles((theme) => ({
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    flex: '1',
    width: '100%',
    maxWidth: `${TABLE_WIDTH}px`,

    /* Below the breakpoint the columns no longer add up to `TABLE_WIDTH`, so the cap stops
       describing anything and only prevents the stacked rows from using the room they have. */
    [STACK_QUERY]: {
      maxWidth: '100%',
    },

    /* Centred in the panel. Without this the column sat hard against the left edge with a
       ~290px void beside it at 1440 — a `maxWidth` on a stretch-aligned box reads as
       left-packing, not as a centred column.

       `margin: 0 auto` is doing the work, with `alignSelf` kept beside it, and the pair is
       deliberate: the parent depends on which shape the tab was registered with. A tab
       declared with `component` renders inside `horizontalTabComponent`, which is
       `display: block` — where `alignSelf` is inert and auto margins centre. A tab declared
       with `components` renders inside a flex panel, where `alignSelf` is what applies.
       Harmonization is the former today and was the latter last week, so pinning the
       centring to one layout mode is how this silently reverts to left-packed.

       The cap and the shared `gridRow` template are untouched: the columns still line up
       between the two tables, it is the column of tables that moved. Content inside stays
       left-aligned, because a centred *form* is a form with no reading edge. */
    margin: '0 auto',
    alignSelf: 'center',

    /* Deliberately no `overflow`. It used to say `auto`, which never once fired —
       the scrollport is the settings shell's `rightSideArea` — but declaring it was
       enough to make this a scroll container, and that alone defeats the sticky
       footer below: the footer would pin to the bottom of a box that never scrolls,
       which is precisely where it already sat. */
  },

  /* No rule under the intro, and none under either section heading — see the note above
     `section`. Whitespace does the separating; the tables draw the only lines. */
  header: {
    padding: `0 ${ROW_INSET}px 8px`,
  },

  headerTitle: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
      marginBottom: '6px',
    },
  },

  /**
   * The greys on this screen, and why they are the ones they are.
   *
   * There were five doing four jobs, and the assignment was upside down: `textSecondary3`
   * measured 3.62:1 and carried ten of the twenty-eight text runs on the screen — both
   * section descriptions and all six row descriptions — while a 6.76:1 grey was spent on
   * the words `mi` and `days`. So the only value that failed AA was the one doing the most
   * reading.
   *
   * Three levels now, all of them passing on white:
   *   `textSecondary1` 9.72:1  labels, and the intro
   *   `textSecondary2` 6.76:1  every description, and the units
   *   `textPlaceholder` 5.37:1 the range footnotes and the empty select
   *
   * `textSecondary3` is deliberately not used for text anywhere below.
   */

  /**
   * One kind of line, doing one job: a table rule. Three others used to run across this
   * screen — under the intro, and under each of the two section headings — and each of
   * them landed within 30px of a rule that was already there. Under "Route Days" the
   * heading's rule and the column header's rule were stacked with a single row of
   * column labels between them; under "Timing" the heading's rule sat directly on top
   * of the first row's own. A rule that close to another rule is not separating
   * anything, it is just texture.
   *
   * So the regions are separated by this 32px instead, and the only horizontal lines
   * left belong to the two tables — plus the footer's, which closes the second of them.
   */
  section: {
    /**
     * 56, and this number is the main thing separating the three groups.
     *
     * It went 32 → 40 → 56. The first rise was for the larger headings; this one is
     * because 40px was still not enough to read the screen as three groups at a glance.
     * There is no rule under a section heading and the row hairlines are the same weight
     * throughout, so the *only* signal that one group has ended and another begun is this
     * gap. It has to be clearly bigger than anything inside a group: the largest internal
     * step is the 16px from a heading to its first row, so 56 is three and a half times
     * it, and the eye stops without being told to.
     */
    paddingTop: '56px',
  },

  /* `sectionFirst` and `sectionLast` are declared **after** `section` on purpose. They are
     modifiers applied alongside it on the same element, so with equal specificity the later
     rule in the stylesheet wins — and while they sat above it, `section`'s 56px `paddingTop`
     beat `sectionFirst`'s 24px and the change measured as no change at all. */
  /**
   * The first group, which has no heading of its own.
   *
   * `section`'s 56px exists to separate one titled group from the previous one's table. The
   * first group here is two bare rows under the page title, and at 56px the space between the
   * title and the first row measured **70px** — wider than the 56px between the groups
   * themselves, so the title read as detached from everything and the first row floated with
   * no edge above it.
   *
   * 24px puts the title in front of its rows rather than adrift from them, and the top rule
   * closes the group the way the day table's column header closes its own.
   */
  sectionFirst: {
    paddingTop: '24px',
    '& > *:first-child': {
      borderTop: `1px solid ${theme.palette.borderSubtle1}`,
    },
  },

  /* The last group closes the page, so its bottom rule would sit a few pixels above the
     footer's own. One of the two is enough. */
  sectionLast: {
    '& > *:last-child': {
      borderBottom: 'none',
    },
  },

  sectionHeader: {
    /* 16, so the heading block and its first row are closer to each other than the
       heading is to the table above it. That ordering is the whole grouping signal here,
       since there is no rule under a section heading to do it. */
    padding: `0 ${ROW_INSET}px 16px`,
  },

  sectionTitle: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
      /* No `textTransform: capitalize`. The locale strings are already written in the case
         they should render in, so the rule was doing nothing in English and waiting to
         Title Case Every Word Of A German Heading written in sentence case. */
    },
  },

  sectionText: {
    '&.MuiTypography-root': {
      /* `textSecondary3`, asked for explicitly. It measures 3.62:1 on white, under the
         4.5:1 WCAG AA wants for text this size. Recorded rather than argued: it was a
         deliberate call, and the next reader should know it was made on purpose and did
         not arrive by drift. `prefText` carries the same note. */
      color: theme.palette.textSecondary3,
      marginTop: '4px',
      maxWidth: '70ch',
    },
  },

  /**
   * `mi`, `days`, and the `±` in front of the need-by field.
   *
   * This rule went missing with the weekday table it used to sit beside, and the failure
   * was silent in the worst way: `classes.unit` became `undefined`, the class attribute
   * came out empty, and the labels fell through to the theme's own `body2` colour, which
   * is `#000`. So the three least important words on the screen were rendering as the
   * darkest text on it, blacker than the values they annotate.
   *
   * `textSecondary2` is the level: a unit is read as part of the number beside it, so it
   * should sit just behind the value rather than compete with it.
   */
  unit: {
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary2,
    },
  },

  /* The limits, stated where they are read before the first keystroke rather than
     announced by a correction afterwards. Grey and small: it is a footnote to the
     control, not a second label competing with it. */
  rangeText: {
    '&.MuiTypography-root': {
      color: theme.palette.textPlaceholder,
      whiteSpace: 'nowrap',
    },
  },

  /* Label / description / control, matching `SettingPreferencesRow`, and on the same
     column template as the weekday rows above so the two controls share an x. */

  /* The table's own scrollport. Only below the breakpoint, so at any normal width there is no
     scroll container here at all and nothing that could trap a wheel gesture. */
  dayTable: {
    [STACK_QUERY]: {
      overflowX: 'auto',
      /* Otherwise the sticky footer's shadow and the section rules stop at the scrollport's
         edge rather than the row's. */
      paddingBottom: '2px',
    },
  },

  /**
   * The weekday table, back after a spell as a multi-select, and back because the question
   * changed shape.
   *
   * The dropdown was right while a day carried nothing but a tick: seven checkbox rows whose
   * only other column was a radius, and the radius had become one value for the whole rule.
   * A day now carries its own **maximum shift hours**, so there are seven numbers to enter
   * and seven to read back. A dropdown cannot show them, and a chip cannot hold one.
   *
   * On the same three-column template as every other row, so the shift field lands in the
   * same control column as the radius and the need-by field below it — which is the only
   * alignment the eye actually reads down a column.
   */
  dayHeader: {
    ...gridRowFixed,
    minWidth: `${DAY_TABLE_MIN_WIDTH}px`,
    padding: `10px ${ROW_INSET}px`,
    minHeight: 0,
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
  },

  columnLabel: {
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary2,
    },
  },

  /* Column 2, named explicitly, because the header has one label for the first two columns and
     it belongs over the weekday names rather than over the checkbox. Explicit placement beats an
     empty placeholder cell: there is nothing to announce in the selection column, and a blank
     `div` in the header is a cell a screen reader still walks into. */
  columnLabelDay: {
    gridColumn: 2,
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary2,
    },
  },

  /* The range rides on the column heading rather than beside each of the seven fields: it is
     one rule for the whole column, and repeating it seven times is seven copies of the same
     sentence. */
  /* `center`, not `baseline`: the group holds a 12px label, a 24px tooltip button and a 12px
     note, and baseline alignment hung the button below the text it belongs to.
     Column 3 explicitly, since the label before it now claims column 2 rather than flowing. */
  columnHeadGroup: {
    gridColumn: 3,
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },

  dayRow: {
    ...gridRowFixed,
    minWidth: `${DAY_TABLE_MIN_WIDTH}px`,
    padding: `0 ${ROW_INSET}px`,
    minHeight: `${ROW_HEIGHT}px`,
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
    '&:last-of-type': { borderBottom: 'none' },
  },

  /**
   * The officers cell: the avatars **are** the control.
   *
   * A `Select multiple` whose value renders as an avatar group, rather than avatars beside a
   * separate picker. Clicking the faces is how the day gets staffed, which is the shortest
   * distance between what the planner sees and what they change — and it means the table shows
   * who works each day without anything having to be opened.
   *
   * Bordered like a field only on hover and focus. Seven of these outlined all the time would
   * put seven boxes down a column whose contents are usually three small circles, and the table
   * would read as a form rather than as a roster.
   */

  dayName: {
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary1,
    },
  },

  /* A day that is off is still readable — it is a row the planner is deciding about, not
     disabled furniture. `textSecondary3` is the same grey the descriptions use. */
  dayNameOff: {
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary3,
    },
  },

  /**
   * The checkbox sits at the **start** of its column, under the "On" heading.
   *
   * This is the bug the table shipped with last time and it is worth not repeating:
   * `MuiCheckbox-root` with `padding: 0` still stretches to fill its grid column, and
   * `ButtonBase` centres its child, so the 24px box floated 131px to the right of the
   * heading it answers to — and the 290px-wide hit area meant clicking empty description
   * space toggled the day. `width: fit-content` pins both.
   */
  dayCheckbox: {
    '&.MuiCheckbox-root': {
      width: 'fit-content',
      padding: '6px',
      marginLeft: '-6px',
    },
  },

  /* Fixed height whichever child it holds, so switching a day on cannot move the rows under
     it: the field and the placeholder dash occupy the same box. */
  shiftCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    height: `${CONTROL_HEIGHT}px`,
  },

  shiftPlaceholder: {
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary3,
    },
  },

  prefRow: {
    ...gridRow,
    padding: `0 ${ROW_INSET}px`,
    /* A floor, not a fixed height. Releasing it when the row stacks is handled inside
       `stackedRow`, deliberately not with a second `[STACK_QUERY]` key here — see the note
       on `STACK_QUERY` for what happened the first time it was written in two places. */
    minHeight: `${ROW_HEIGHT}px`,
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
  },

  /* `prefRowNested` lived here: the indent and the lighter label that made the revealed
     "Custom length" row read as a child of the window row rather than a second setting.
     The row it styled is gone — the window is one field with three shortcuts beside it now
     — so the rule went with it rather than staying as a class nothing applies. */

  prefLabel: {
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary1,
    },
  },

  /* The label and its tooltip trigger share the first column, on one baseline. This is
     the grid child now, so the label sizes to its text instead of to the 180px column
     and the icon sits against the end of the words rather than out at the column edge. */
  prefLabelGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },

  /* Reset to nothing, because it is a `button` for keyboard reasons and not for any
     visual one: the trigger should read as the icon alone.

     The `:focus-visible` ring is the only one on this screen, which is not a reason to
     leave it off. Nothing else here draws a focus state — the theme sets none and MUI's
     defaults are overridden away on the toggle segments — so a new control that can be
     tabbed to gets one rather than joining the gap. */
  infoButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    /* 24px of target around a 14px glyph, which is the 2.5.8 minimum rather than a
       preference: the icon at its own size is a 14px hit area. The box is transparent, so
       the extra 5px each way costs nothing visually, and the negative margins keep it from
       widening the row it sits in. */
    width: '24px',
    height: '24px',
    flexShrink: 0,
    margin: '-5px',
    padding: 0,
    border: 0,
    background: 'none',
    cursor: 'pointer',
    '& svg': { width: '14px', height: '14px', display: 'block' },
    '&:focus-visible': {
      outline: `2px solid ${theme.palette.textBrand}`,
      outlineOffset: '-1px',
      borderRadius: '50%',
    },
  },

  prefText: {
    '&.MuiTypography-root': {
      /* See `sectionText`. These two rules are the whole of this screen's descriptive
         copy, so this one choice decides how readable every explanation on it is. */
      color: theme.palette.textSecondary3,
    },
  },

  /* One cell shape for every row whose control is a short number followed by its unit
     and its range: the radius, the need-by window and the custom window. It was three
     copies of this rule under three names, which is how the three drifted apart. */
  unitCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    height: `${CONTROL_HEIGHT}px`,
  },

  /**
   * The address field and the line under it that says where the value came from.
   *
   * Column, not row, and not centred on the control: `AddressSearchField` opens its
   * suggestion list absolutely positioned against this box, so anything laid out beside
   * the field would be underneath the list the moment it opened.
   */
  /**
   * The address field's cell.
   *
   * `stretch`, so the field fills the control column rather than shrinking to the 220px
   * the global `MuiTextField` override gives it as a minimum.
   *
   * **It is one row tall in every state now, and that is the change.** It used to be a
   * column with the reset link underneath, which grew the row to 67px the moment a planner
   * set an explicit address — measured, not theorised; the comment that claimed absolute
   * positioning prevented it was simply wrong. Both controls are inside the field's own
   * 44px now, so appearing costs nothing and the row cannot leave `ROW_HEIGHT`.
   *
   * `CONTROL_HEIGHT` is stated rather than left to the field, so a future control added
   * here has to fit the row instead of the row growing to fit it.
   */
  /* Still a column with `alignItems: stretch`, and switching it to a row was a real bug
     for the twenty minutes it existed: with one flex child on the main axis the field
     shrink-wrapped to its content, so the row carrying a reset button came out 30px wider
     than the row without one and the two address fields no longer ended on the same x.
     A column keeps stretch doing the width and `justifyContent` doing the centring. */
  locationCell: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    justifyContent: 'center',
    width: '100%',
    height: `${CONTROL_HEIGHT}px`,

    /**
     * The value, clipped honestly.
     *
     * A formatted US address measures ~350px at the theme's 16px and the column is 320
     * before the two buttons take their share, so this field is *always* going to cut
     * something. `clip` was the default and it cuts mid-glyph, which reads as a rendering
     * fault rather than as "there is more"; the ellipsis is the only part of this that the
     * planner can interpret. The whole value is on the input's `title` and printed in full
     * in the map dialog.
     *
     * No specificity fight to win here, unlike `needByField`: the theme's `MuiTextField`
     * override says a great deal about `.MuiInputBase-input` but nothing about
     * `text-overflow`, so there is no competing declaration for emotion's later injection
     * to beat. Confirmed with `getComputedStyle` rather than assumed.
     */
    '& .MuiInputBase-input': {
      textOverflow: 'ellipsis',
    },

    /* 6px, not the theme's 14. The buttons are 28px each and the field is the one control
       on the screen already short of room; recovering 8px of address text costs nothing,
       because a button's own padding is what keeps it off the border rather than the
       field's inset. `!important` for the reason written on `needByField`: this padding
       comes from an emotion `styleOverrides` rule injected after this file's JSS, so a
       plain declaration here loses whatever its specificity. */
    '& .MuiInputBase-root': {
      paddingRight: '6px !important',
    },
  },

  /* The two buttons, as one adornment. 2px between them so they read as a pair belonging
     to this field rather than as two separate controls that happen to be adjacent, and
     6px off the value for the reason `fieldUnit` uses the same number: MUI's 8px is enough
     air to make an adornment look like a neighbour instead of part of the box. */
  fieldActions: {
    '&.MuiInputAdornment-root': {
      gap: '2px',
      marginLeft: '6px',
    },
  },

  /**
   * A control drawn inside a field: the map opener, and the reset beside it.
   *
   * **28×28 rather than the 24 `infoButton` settles for.** 2.5.8 asks for 24 and this row
   * has the room — `CONTROL_HEIGHT` is 44 — so the floor is not the target. The negative
   * vertical margins are what let it exceed the input's 22px content box without the
   * field, and therefore the row, growing to accommodate it.
   *
   * Quiet by default and not brand-coloured, which is deliberate twice over. An adornment
   * that out-weighs the value it sits beside reads as a warning about the field; and the
   * tenant's `textBrand` measures 3.18:1 on white, which is the pre-existing failure the
   * text reset this replaces was shipping. `textSecondary2` is 6.76:1, well past the 3:1 a
   * non-text control needs and past the text bar as well.
   *
   * `refresh.svg` ships hardcoded paint — Signal blue, which on this tenant is the *other*
   * brand — so it needs `color` here to reach it through `currentColor`; see `glyphStroked`.
   * `roadmapIcon.svg` already draws itself in `currentColor` and needs no such rule, which is
   * one of the reasons it is the map glyph.
   */
  fieldAction: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    width: '28px',
    height: '28px',
    margin: '-3px 0',
    padding: 0,
    border: 0,
    borderRadius: '6px',
    background: 'none',
    cursor: 'pointer',
    color: theme.palette.textSecondary2,
    transition: 'background-color 120ms ease, color 120ms ease',
    /* Both 20px sources drawn at 16, so the pair reads as one weight rather than as two icons
       out of two sets. */
    '& svg': {
      width: '16px',
      height: '16px',
      display: 'block',
    },
    '&:hover': {
      backgroundColor: theme.palette.surfaceGreySubtle,
      color: theme.palette.textPrimary,
    },
    '&:active': {
      backgroundColor: theme.palette.borderSubtle1,
    },
    /* `textPrimary` and not the brand green, for the reason the window presets' ring is
       the same colour: brand green is 3.18:1 on white, which clears 1.4.11 by a hair and
       is a poor thing to hang a focus indicator on. Near-black is 15.2:1.
       Inset by 1 so the ring stays inside the field's own border instead of crossing it. */
    '&:focus-visible': {
      outline: `2px solid ${theme.palette.textPrimary}`,
      outlineOffset: '-1px',
    },
    /* No `:disabled` rule, and it was written and then deleted. Neither of these buttons
       has a disabled state that exists: the reset is *absent* rather than disabled when
       there is nothing to undo, and the map opener always has a point to centre on because
       `useStartPoint` is given an unconditional last rung. A selector for a state the
       screen cannot reach is the dead CSS `windowPresets` is careful not to carry. */
  },

  /**
   * How the button's `color` reaches a glyph that ships its own paint.
   *
   * `refresh.svg` is an outline drawn in `stroke`, so that is the property to redirect. There
   * was a `glyphFilled` beside this for the map icon, which was a silhouette drawn in `fill`;
   * `roadmapIcon.svg` uses `currentColor` already, so the rule stopped matching anything and is
   * gone rather than left as CSS that describes an icon this screen no longer has.
   */
  glyphStroked: {
    '& path': { stroke: 'currentColor' },
  },

  /**
   * The shift field, edited **in place**.
   *
   * It is the only number field left on the screen, and it lives in a table cell, so it is
   * styled the way a table cell should be: the value reads as text until the planner reaches
   * for it, and the input's chrome appears on hover and focus. Seven permanently outlined boxes
   * down a column turned the table into a form, and a form is the wrong thing for seven rows of
   * one number.
   *
   * Deliberately still a real `input`, not a span that swaps to a field on click. A click-to-edit
   * cell has to solve focus on mount, escape-to-cancel, and what happens when the row re-renders
   * mid-edit; a permanently-live input styled quietly has none of those problems and stays
   * tabbable, which the swap version only is if you remember to make the span a button. The
   * clamp-on-blur behaviour is untouched.
   *
   * `minWidth` is not optional. The global `MuiTextField` override sets `minWidth: 220` on every
   * `.MuiInputBase-root`, so a narrow field silently renders 220px wide and overflows whatever
   * sits beside it.
   */
  numberField: {
    width: `${FIELD_WIDTH}px`,
    '& .MuiInputBase-root': {
      minWidth: `${FIELD_WIDTH}px`,
      height: '36px',
      maxHeight: '36px',
      borderRadius: '8px',
    },
    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'transparent' },
    '&:hover .MuiInputBase-root .MuiOutlinedInput-notchedOutline': {
      borderColor: theme.palette.borderSubtle1,
    },
    '& .MuiInputBase-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: theme.palette.textBrand,
    },
    /* Left, not right. Right-alignment paired the digits with a unit that sat outside the box;
       inside a quiet cell the number should start where the column starts. */
    '& input': {
      textAlign: 'left',
    },
  },

  /**
   * A unit that lives *inside* its field: the `±` in front of the need-by value, and the
   * `days` after the window value.
   *
   * Same 14px and same `textSecondary2` as the `unit` labels that still sit outside a
   * field, so the screen has one grey for units wherever they happen to be drawn. Against
   * white that measures 6.76:1, and against the value it annotates — `textPrimary`, which
   * is what the theme paints `.MuiInputBase-input` — it is plainly the lighter of the two,
   * which is the whole job: `± 3` has to read as a modified 3, not as a two-part value.
   *
   * `disableTypography` on the adornment is what lets this rule set the size and colour
   * directly. Wrapped in MUI's own `Typography`, the adornment inherits `body1` at 16px
   * and the theme's `.MuiInputBase-input` colour rule sits at a specificity this file
   * cannot reach from outside the input.
   *
   * The margins are 6 rather than MUI's 8: a sign or a unit belongs to the number it
   * touches, and 8px of air was enough to make `±` read as a separate label that happened
   * to be inside the box.
   */
  fieldUnit: {
    '&.MuiInputAdornment-root': {
      fontSize: '14px',
      lineHeight: '20px',
      color: theme.palette.textSecondary2,
    },
    '&.MuiInputAdornment-positionStart': { marginRight: '6px' },
    '&.MuiInputAdornment-positionEnd': { marginLeft: '6px' },
  },

  /**
   * The need-by combobox: a text field the planner can type into, with the five legal
   * values behind a chevron.
   *
   * **The padding needs `!important`, and the rule it replaces never once applied.**
   *
   * This used to read `padding: 0 30px 0 12px`, on the theory that MUI's own
   * `padding-right: 39px` was losing to the theme's blanket `10px 14px`. Measured, the
   * opposite was true and neither of those was in force: the field was running on MUI's
   * `9px 39px 9px 9px` the whole time, because Autocomplete writes its inset at
   * `.css-….MuiAutocomplete-inputRoot.MuiOutlinedInput-root` — three classes to this
   * rule's two, and emotion is injected after this file's JSS, so a tie would have lost
   * anyway. The screen looked right, which is exactly why it went unnoticed.
   *
   * So the numbers are restated as what they have to be, and forced. 39 on the right is
   * MUI's own reservation for the chevron and is kept unchanged; 14 on the left is the
   * inset every other field on this screen has, and it is what the `±` sits against, so
   * the sign starts on the same x as the radius field's first digit one section up.
   *
   * The digit is left-aligned, unlike the radius field, which is right-aligned so the
   * number sits against the `mi` that follows it. Here the `±` is inside the field
   * immediately to the digit's left; right-aligning would push the number away from the
   * sign it belongs to and into the chevron.
   */
  needByField: {
    width: `${FIELD_WIDTH}px`,
    '& .MuiInputBase-root': {
      minWidth: `${FIELD_WIDTH}px`,
      height: `${CONTROL_HEIGHT}px`,
      maxHeight: `${CONTROL_HEIGHT}px`,
      padding: `0 39px 0 ${FIELD_INSET}px !important`,
    },
    '& .MuiAutocomplete-endAdornment': {
      right: '6px',
    },
    '& .MuiAutocomplete-popupIndicator': {
      padding: '2px',
      color: theme.palette.textSecondary2,
    },
  },

  /* The five values, in a list the width of the field they drop from. Five one-character
     options do not need MUI's 16px option rows or its 48px minimum height, and at that
     size the list would be twice as tall as the row it hangs over. */
  needByMenu: {
    '&.MuiAutocomplete-paper': {
      marginTop: '4px',
      borderRadius: '8px',
      border: `1px solid ${theme.palette.borderSubtle1}`,
      backgroundColor: theme.palette.surfaceWhite,
    },
    '& .MuiAutocomplete-option': {
      minHeight: 'auto',
      padding: '6px 12px',
      fontSize: '14px',
      color: theme.palette.textSecondary1,
      /* Was `textBrand` on `surfaceBrandSubtle`, which measures **2.87:1** — the tenant's
         green on its own pale green is not a text pair. The tint stays, because it is what
         says "this is the current value"; the label goes to the body colour over it, the
         same correction the day chips and the window shortcuts already carry. */
      '&[aria-selected="true"]': {
        backgroundColor: `${theme.palette.surfaceBrandSubtle} !important`,
        color: `${theme.palette.textSecondary1} !important`,
        fontWeight: 500,
      },
    },
  },

  /* Sticky, because Save's top edge lands at y=914 in a 900px viewport. It is
     reachable — `rightSideArea` scrolls the 62px it needs — but the page-level
     scrollbar does not move, so nothing on screen says there is anywhere to scroll
     to, and a Save nobody believes in is a Save nobody presses.

     The fill is the page's own white rather than a card colour, since the surface
     behind it is white; the hairline is what keeps the last table row from looking
     like it slides under the button as it passes behind. */
  footer: {
    position: 'sticky',
    /* Not `0`. Sticky offsets are measured against the scrollport's padding box, and the
       settings shell pads its scrollport by 12px at the bottom — so `0` pinned the bar
       12px up and left a strip underneath it that rows scrolled through in full view.
       This is the shell's own number (`rightSideArea`, `customTabsWithPermissions.js`). */
    bottom: -12,
    /* Sticky alone does not win the paint. Every MUI input root is `position: relative`,
       which puts it in the same positioned layer as this bar at `z-index: auto`, and the
       Need By field sits exactly where the bar pins on a short viewport — so the number
       was drawn on top of Save. One step up is enough to settle it. */
    zIndex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: '12px',
    marginTop: '24px',
    padding: `16px ${ROW_INSET}px`,
    backgroundColor: theme.palette.surfaceWhite,
    borderTop: `1px solid ${theme.palette.borderSubtle1}`,

    /**
     * A focus ring on Save, which had none at all.
     *
     * Measured with a real key press: `:focus-visible` matched while `outline` was `none`
     * and `box-shadow` was `none`, so the last stop in the tab order — the one that commits
     * the change — told a keyboard user nothing. Every other control on this screen has a
     * ring; Save was the omission, because it comes from the theme's `variant="primary"`
     * rather than from this file.
     *
     * Scoped to `:focus-visible` on purpose. It adds nothing to the button's resting
     * appearance, so Save still looks the way it does on every other screen — which matters,
     * because a primary action that is styled differently in one place is the inconsistency
     * this codebase should not grow. The ring is `textPrimary`, not brand: it has to read
     * against the brand-green fill underneath it.
     *
     * What this deliberately does **not** fix is the fill. Enabled Save is white on brand
     * green at 3.18:1 and disabled is 1.53:1, both under AA, and both come from the theme.
     * Correcting them here would make this screen's Save the odd one out; they belong in
     * `variant="primary"` itself.
     */
    '& .MuiButton-root:focus-visible': {
      outline: `2px solid ${theme.palette.textPrimary}`,
      outlineOffset: '2px',
    },
  },

  /**
   * The map overlay.
   *
   * MUI `Dialog`, which is the house overlay — eight screens already use one, and the
   * shared `common/modal` wrapper is deliberately not one of them here: it hardcodes
   * `aria-labelledby="modal-modal-title"` against an id that exists nowhere in the
   * document, so the overlay would have had no accessible name and no way to be given one
   * from outside.
   *
   * Fixed `borderRadius` and the theme's own white rather than MUI's paper elevation, so
   * it matches the day menu and the address suggestion list this screen already opens.
   */
  mapDialog: {
    '&.MuiPaper-root': {
      borderRadius: '12px',
      backgroundColor: theme.palette.surfaceWhite,
    },
  },

  mapDialogTitle: {
    '&.MuiDialogTitle-root': {
      padding: '20px 24px 0',
      fontSize: '18px',
      lineHeight: '26px',
      fontWeight: 600,
      color: theme.palette.textPrimary,
    },
  },

  mapDialogContent: {
    '&.MuiDialogContent-root': {
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      /* MUI pads the content top by 20 to clear a title it assumes is heavier than this
         one, and the gap below the heading is then 20 + the title's own line-height. */
      padding: '12px 24px 0',
      /* No `overflowY: auto`. The panel is a fixed height and the read-out under it is two
         short lines, so a scroll container here could only ever clip the map's own drag
         gesture at its edges. */
      overflow: 'visible',
    },
  },

  mapDialogText: {
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary2,
    },
  },

  /**
   * The panel the map is drawn into, and the only place its size is stated.
   *
   * Both renderers position themselves against a parent rather than sizing themselves:
   * `tileMapRoot` is `position: absolute; inset: 0` and Google's container is 100% of what
   * it is given. So this box is `relative` and has a height, and neither renderer has to
   * learn anything about this dialog.
   *
   * 340px, which at `maxWidth="sm"` (600) is close to 16:9. Taller reads as a map screen
   * with a form attached; shorter and a click near an edge has no context around it.
   */
  /* Taller with the wider paper, so the map keeps a sane aspect rather than becoming a
     letterbox: 900px of width against 340px of height reads as a strip, not a map. 420 keeps
     it close to 2:1, which is what a street map wants. */
  mapDialogSurface: {
    position: 'relative',
    height: '420px',
    borderRadius: '8px',
    overflow: 'hidden',
    border: `1px solid ${theme.palette.borderSubtle1}`,
    backgroundColor: theme.palette.surfaceGreySubtle,
  },

  /* What Confirm will write, stated above the button that writes it. Fixed height for two
     lines so the dialog does not resize between "Finding the address…" and the answer —
     a panel that grows under the pointer moves the button being aimed at. */
  mapDialogReadout: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    minHeight: '40px',
  },

  mapDialogAddress: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
      fontWeight: 500,
    },
  },

  /* The coordinates, behind the address rather than beside it. They are the value the
     solver actually uses, so they are worth showing; they are also the part nobody reads
     unless the address looks wrong, so `textPlaceholder` at 5.37:1 is the level. */
  mapDialogCoords: {
    '&.MuiTypography-root': {
      color: theme.palette.textPlaceholder,
    },
  },

  mapDialogActions: {
    '&.MuiDialogActions-root': {
      gap: '12px',
      padding: '20px 24px 20px',
    },
  },

  /* A marker, not an alarm: the draft is already safe by the time this appears, so
     it only has to answer "did my edit register?". Amber or an icon here would
     promise a problem that does not exist. */
  unsavedText: {
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary2,
    },
  },
}));
