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
 * The two preference rows are taller than a table row, and deliberately so.
 *
 * `ROW_HEIGHT` is a table's rhythm: seven weekday rows and four zone rows are a list, and
 * a list wants to be scanned down, which means tight. The first group is not a list. It is
 * two settings — one address, one window — with no header above them and nothing repeating,
 * so the 8px of air `ROW_HEIGHT` leaves around a 44px control read as two fields crammed
 * under the page title rather than as the screen's opening statement.
 *
 * 76 gives them 16px above and below. The tables keep 60: matching them was tried and the
 * whole screen went loose, because the same figure that opens a two-row group is slack
 * repeated eleven times. They are separated by a 56px section gap and a heading, so nothing
 * reads down from one to the other and the two heights never meet.
 */
const PREF_ROW_HEIGHT = 76;

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
 * 96 survived the `±` moving inside the need-by field and then the `±` leaving again with
 * the combobox it was an adornment on: measured, the widest case is three typed digits
 * (`digitsOnly` allows no more) inside a 96px shell, and it does not clip. Growing one of
 * them was the alternative and it costs more than it buys — fields in one column that start
 * at the same x and end at different ones read as unrelated controls.
 *
 * `FIELD_INSET` is the horizontal padding every field on the screen already had from the
 * theme (`10px 14px`). It is named here because the two `Select`s have to restate it: their
 * inset comes from an emotion `styleOverrides` rule injected after this file's JSS, so a
 * plain declaration loses whatever its specificity and the value has to be forced.
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
 * The zone panel's width, and the amount the screen moves over to make room for it.
 *
 * Wide enough for a 400px map to still be a map, narrow enough that the list it was opened
 * from stays legible beside it — which is the reason this is a push panel and not an
 * overlay. At 620 the content column keeps its label and control columns down to a 1280px
 * viewport and only starts scrolling its tables below that.
 */
const PANEL_WIDTH = 620;

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
 * range note that used to sit beside the heading all fit, measured. (That note has since
 * been removed from the column — see the `Max Shift Hours` heading in `index.jsx`.)
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
 * *heading* rather than its field: the label, its tooltip button and the range note it carried at
 * the time together are wider than the 96px input beneath them.
 */
/**
 * **One template for the whole screen, and the day table finally uses it.**
 *
 * The comments here used to claim the weekday table shared "the same three columns" as the
 * preference rows. It did not. It ran `40px 132px 210px minmax(0, 1fr)` on a 20px gap, which
 * put its column starts at **24 / 84 / 236 / 466** against the form's **24 / 236 / 548**. Two
 * consequences, both visible once you look for them: every weekday name sat 60px to the right
 * of every label above it, giving the screen a ragged left edge down the middle of one panel;
 * and the table's last column stopped 82px short of the column every other control on the
 * screen lives in.
 *
 * What made it fixable was having a third thing to put in a row. The old fourth column was
 * empty — a leftover from the officers column — so there was nothing to align *to*, and
 * content-sizing three cells was a reasonable answer to a table with a hole in it. A zone
 * select is a real control that belongs in the control column, so the day row becomes
 * label / middle / control like everything else and the two grids collapse into one.
 *
 * **Shift hours do not move.** They already began at 236 under the old template and they begin
 * at 236 under this one — the middle column. That is worth stating because "shift hours share
 * an x with the description column above" reads like a defect and is not one: 56px of section
 * padding and a heading sit between the two, and the column heading over it says what it is.
 * The change only moves what was actually adrift.
 */
const FORM_COLUMNS = `${COLUMN_LABEL}px minmax(0, ${COLUMN_MIDDLE}px) ${COLUMN_CONTROL}px`;

const rowBase = {
  display: 'grid',
  gridTemplateColumns: FORM_COLUMNS,
  gap: `${COLUMN_GAP}px`,
  alignItems: 'center',
  boxSizing: 'border-box',

  /* On the row and on everything focusable inside it, because Chrome scrolls the *focused
     element* into view and reads that element's own scroll-margin, not its ancestor's. */
  scrollMarginBottom: `${FOOTER_CLEARANCE}px`,
  '& input, & button, & [role="combobox"]': {
    scrollMarginBottom: `${FOOTER_CLEARANCE}px`,
  },
};

const gridRow = { ...rowBase, [STACK_QUERY]: stackedRow };

/**
 * The same row, minus the stacked variant: **the day table scrolls rather than stacks.**
 *
 * `gridRow`'s stack exists because a label/description/control row loses its prose when the
 * middle column is squeezed. A table row has no prose to lose, and stacking seven of them
 * would turn a compact table into a wall — so below the breakpoint the table keeps its
 * columns and its own box scrolls sideways instead. That was the previous behaviour and it
 * survives the regrid unchanged; only the width at which it engages moves.
 *
 * Built by spreading a shared base rather than by deleting a key off `gridRow`, which is what
 * this did before. Spreading `gridRow` and re-declaring `[STACK_QUERY]` would *replace* the
 * stack rather than layer on it — the object-key collision that made the stack silently fail
 * once already — and the old workaround was to destructure the key back out again. With the
 * base extracted there is no key to collide with and nothing to remember.
 */
const gridRowFixed = rowBase;

/* What the columns actually add up to, and therefore how wide this screen is
   allowed to be: the section hairlines were spanning the whole panel and running a
   few hundred pixels past the last column they belonged to. */
const TABLE_WIDTH = COLUMN_LABEL + COLUMN_MIDDLE + COLUMN_CONTROL + COLUMN_GAP * 2 + ROW_INSET * 2;

/**
 * The width below which the table scrolls sideways rather than compressing a cell.
 *
 * **A floor, not the row's natural width — and getting that wrong reintroduced the exact
 * misalignment this regrid removed.** Setting it to `TABLE_WIDTH` looked right and was a
 * regression: the panel is not 924px wide in practice. At a 1040px viewport the tab area
 * gives the wrapper 892, so the form rows' `minmax(0, 280px)` middle column shrinks to
 * 248 — while a table row pinned to a 924px minimum kept its 280 and refused to. The two
 * grids ended up 32px apart in the control column, which is the defect with a smaller
 * number on it.
 *
 * So the floor is where the columns stop being usable, not where they are comfortable:
 * the 180px label, enough middle for the 96px shift field and its unit, the 352px control,
 * and the gaps. Above it every row shrinks in step and the alignment holds at any width;
 * below it the box scrolls and nothing collapses.
 */
const DAY_TABLE_MIN_WIDTH = COLUMN_LABEL + 132 + COLUMN_CONTROL + COLUMN_GAP * 2 + ROW_INSET * 2;

/**
 * A stepper button, at whichever size the control beside it is.
 *
 * Two callers at two sizes — the zone panel's reach field is 36, the need-by field is 44 —
 * and they were about to be two copies of the same nine declarations. A square button whose
 * only variable is its edge is exactly the thing to write once: the pair drifting apart is
 * how one of them ends up with a different border or a different disabled colour than the
 * field it is attached to.
 */
const stepButton = (theme, size) => ({
  minWidth: `${size}px`,
  width: `${size}px`,
  height: `${size}px`,
  padding: 0,
  borderRadius: '8px',
  border: `1px solid ${theme.palette.borderStrong1}`,
  backgroundColor: theme.palette.surfaceWhite,
  color: theme.palette.textSecondary1,
  fontSize: '16px',
  lineHeight: 1,
  '&:hover': { backgroundColor: theme.palette.surfaceGreySubtle },
  /**
   * Spent, at the bound the button cannot cross.
   *
   * **The border greys with the glyph**, not just the glyph. A dead button that keeps a
   * `borderStrong1` edge and loses only its symbol reads as a button whose label failed to
   * render. Both ends of the pair going quiet is what says "this is as far as the value
   * goes" — which is the whole reason the `3–14` footnote could be dropped from the row.
   *
   * A note for the next person measuring this: `getComputedStyle` in a Claude Code browser
   * pane reported the *enabled* colour on the disabled button while its own inline
   * `style` attribute plainly said otherwise, so the value it returns for these buttons
   * cannot be trusted. This rule was confirmed by looking at a screenshot at the minimum,
   * which is the check to repeat rather than another probe.
   */
  '&.Mui-disabled': {
    color: theme.palette.textDisabled,
    borderColor: theme.palette.borderSubtle2,
  },
});

export const useStyles = makeStyles((theme) => ({
  wrapper: {
    display: 'flex',
    /* Paired with `wrapperShifted`. `margin-right` is what moves the column: `marginLeft`
       stays `auto`, so it re-centres in whatever space is left rather than being dragged
       off the left edge. */
    transition: 'margin-right 240ms cubic-bezier(0.4, 0, 0.2, 1)',
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

  /**
   * The screen, with the zone panel open.
   *
   * A push rather than an overlay, and that is the point: a zone is defined *against* the
   * zones that already exist, so covering the list with a scrim hides the only context the
   * new one has. The content moves over and stays readable.
   *
   * `!important` on the margin because `wrapper` sets the `margin` **shorthand** (`0 auto`),
   * and a shorthand beats a longhand at equal specificity whichever order they are injected
   * in — the same collision that made the shift silently do nothing the first time.
   */
  wrapperShifted: {
    marginRight: `${PANEL_WIDTH}px !important`,
    [`@media (max-width: ${PANEL_WIDTH + 560}px)`]: {
      /* Below this the remaining column is too narrow to be worth keeping, so the panel
         takes the screen rather than squeezing the content to a sliver. */
      marginRight: '0 !important',
    },
  },

  /* No rule under the intro, and none under either section heading — see the note above
     `section`. Whitespace does the separating; the tables draw the only lines. */
  /**
   * The page title's own band.
   *
   * **32px above it, up from nothing.** The title sat almost against the tab strip — the
   * shell contributes no gap of its own — so the screen opened with its heading crowded into
   * the chrome above it and a 32px void below, which reads as the title belonging to the tabs
   * rather than to the page. 32/24 puts more air above the heading than the 24 between it and
   * the first rule, so the block reads top-down, and it matches the `section` rhythm the rest
   * of the page is set on.
   */
  header: {
    padding: `32px ${ROW_INSET}px 24px`,
  },

  headerTitle: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
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
   * Four levels, and **the lightest one does not pass** — which this block used to deny,
   * so it is spelled out rather than left to be measured:
   *   `textSecondary1`  9.72:1  labels, day names, warning copy
   *   `textSecondary2`  6.76:1  units, column headings, zone definitions
   *   `textPlaceholder` 5.37:1  range footnotes, site/filter counts, an empty select
   *   `textSecondary3`  3.62:1  **fails AA for text at these sizes** — see below
   *
   * `textSecondary3` was reinstated for descriptions by explicit request after this list
   * was written, and the list was not updated to match. It claimed the grey was
   * "deliberately not used for text anywhere below" while four rules underneath it used
   * exactly that: `sectionText`, `prefText`, `dayNameOff` and `shiftPlaceholder`. A stale
   * policy is worse than none — the next reader takes 6.76:1 from the comment and ships
   * against a screen that renders 3.62:1 — so the exception is recorded here and not only
   * at the two rules carrying the note.
   *
   * The two worth revisiting are not the descriptions. `dayNameOff` is a weekday **name**
   * and `shiftPlaceholder` is a cell's only content, so both are the screen's own words
   * rather than commentary on them, and neither was part of the request that reinstated
   * the grey.
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
    /* 32, up from 24. The rows below grew their own air (see `PREF_ROW_HEIGHT`) and at 24
       the title sat closer to the first field than the field sat to the second one, which
       reads as the title belonging to that one row rather than to the group. */
    paddingTop: '32px',
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
   * `mi`, `days`, and `hrs` — the words that annotate a number.
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
  /* No explicit `gridColumn` any more. It was 2 because column 1 held the checkbox and
     `Day` had to skip over it; the checkbox now sits beside the weekday name inside column
     1, so document order puts every heading over the cells it names. */
  columnLabelDay: {
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
    minHeight: `${PREF_ROW_HEIGHT}px`,
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
  },

  /* `needByRow`/`needByLabelStack` lived here: a two-block variant that stacked the
     description under the label to give the track more rail. Reverted — it made this the one
     row whose label did not share a line with its sentence, and consistency down the left
     edge is worth more than the extra width. Need by Date is back on `prefRow`. */

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

  /**
   * The need-by cell: **`±3 ──●────── ±14   ±7 days`.**
   *
   * A track, its two bounds, and the value beside it. The setting is a *tolerance*, so the
   * control is a quantity you position rather than a number you count; the long argument for
   * the track is at the call site in `index.jsx`.
   *
   * **Two fixes from an audit of what made the row confusing**, both about the fact that
   * three numbers sat on one line saying things in two different ways:
   *
   * 1. **The bounds carry `±` now.** They were bare `3` and `14` beside a value reading
   *    `±7 days`, so the scale said "three to fourteen" while the answer said "plus or minus
   *    seven" — the same axis in two framings, and the reader had to work out they were the
   *    same quantity. One unit across all three numbers, and the answer is visibly between
   *    its own ends.
   * 2. **The value follows the thumb while dragging** (`valueLabelDisplay="auto"`). The
   *    readout is up to 250px from the handle at the minimum end, so the old row was
   *    manipulated on the left and read on the right. The floating label costs nothing at
   *    rest — it only appears on hover, focus and drag, which is exactly when the distance
   *    matters — so the row keeps its one-line height either way.
   *
   * One line, inside `CONTROL_HEIGHT`, which is what keeps the row at `PREF_ROW_HEIGHT` and
   * the two top rows the same height.
   */
  needByCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    height: `${CONTROL_HEIGHT}px`,
  },

  /**
   * The bounds, at the ends of the track.
   *
   * `rangeText`'s grey, and here it finally has an honest job. As a `3–14` footnote beside a
   * field it was a limit stated in prose, in the palest type on the screen, describing a rule
   * the control did not enforce until you hit it. Labelling the two ends of the scale it is a
   * bound *of* is what a scale label is for.
   */
  needByBound: {
    '&.MuiTypography-root': {
      color: theme.palette.textPlaceholder,
      whiteSpace: 'nowrap',
      /* Both ends reserve the wider label's width, so the track's ends do not shift between
         a one- and a two-digit bound. 26, up from 15, for the `±` the bounds now carry. */
      minWidth: '26px',
      textAlign: 'center',
    },
  },

  /**
   * The track, on the app's own slider spec.
   *
   * Taken from `runSheets/assignHits`, which is where this app already styles `MuiSlider`:
   * 5px rail in `surfaceGreySubtle`, brand fill, a 16px white thumb with a 2px brand border.
   * Restated rather than imported, because that sheet belongs to a page and not to a control
   * — but the numbers are theirs, so the two read as one product.
   *
   * `padding: 0`, unlike theirs, and that is the one real deviation: MUI pads a slider 13px
   * vertically for touch, which inside a 44px flex row puts the rail off centre. The 16px
   * thumb's own `::after` is what carries the 24px pointer target, so the target survives the
   * padding coming off.
   */
  needBySlider: {
    '&.MuiSlider-root': {
      flex: 1,
      /* Enough track for twelve steps to read as a scale. The cell is 352 wide and the bounds
         and the value take ~110 of it. */
      minWidth: '120px',
      height: '5px',
      padding: 0,
      /**
       * **8px each side, and it is a collision fix rather than spacing.**
       *
       * A slider thumb is centred on its own value, so at the minimum half of it — 8 of its
       * 16px — hangs off the left end of the rail. Measured at `3`: the thumb spanned x
       * 489–505 and the `3` label 485–492, so the glyph sat on top of the number labelling
       * the end it had reached. The cell's 10px `gap` cannot fix this, because the gap is
       * between the *rail* and the label and the thumb is outside the rail.
       */
      marginLeft: '8px',
      marginRight: '8px',
      color: theme.palette.surfaceBrand,
      borderRadius: '4px',
    },
    '& .MuiSlider-rail': {
      opacity: 1,
      backgroundColor: theme.palette.surfaceGreySubtle,
    },
    '& .MuiSlider-thumb': {
      width: '16px',
      height: '16px',
      backgroundColor: theme.palette.surfaceWhite,
      border: `2px solid ${theme.palette.borderBrand}`,
      '&:hover, &.Mui-focusVisible': {
        boxShadow: `0px 0px 0px 6px ${theme.palette.surfaceBrandSubtle}`,
      },
      '&.Mui-active': {
        boxShadow: `0px 0px 0px 8px ${theme.palette.surfaceBrandSubtle}`,
      },
    },
    /**
     * The value that rides the thumb while it is being moved.
     *
     * Only on hover, focus and drag — the trailing readout is still the resting answer, and
     * two permanent copies of one number would be worse than the distance this fixes. Dark
     * ink rather than brand: it is a tooltip over a raster-free white row, and the brand fill
     * MUI defaults to would put a green blob over the rail it is pointing at.
     */
    '& .MuiSlider-valueLabel': {
      ...theme.typography.body3,
      backgroundColor: theme.palette.textPrimary,
      color: theme.palette.textOnColor,
      padding: '2px 6px',
      borderRadius: '6px',
      /* MUI's default sits ~2.4em up to clear a 20px thumb. This one is 16px in a 44px cell,
         so it is pulled in to keep the label inside the row. */
      top: '-6px',
    },
  },

  /**
   * The live value, after the track.
   *
   * **The `±` is carrying something.** Inside the old field it was a glyph floating in front
   * of a digit: the row read `± 3` while the value you could select, copy or hear announced
   * was `3`. Here it names the *kind* of quantity — seven either way, not seven out of
   * fourteen — and since the audit it is the framing the two bounds use as well, so all three
   * numbers in the cell speak one unit.
   *
   * `subtitle2` weight in `textPrimary`, so it is unambiguously the heaviest thing in the
   * cell: the two bounds are placeholder-grey scale captions and this is the answer. It read
   * `textSecondary1` before, which put it only one step above its own axis labels.
   */
  needByValue: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
      whiteSpace: 'nowrap',
      /* Reserves the two-digit width, so the track does not shorten as the value grows. */
      minWidth: '58px',
      textAlign: 'right',
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
     * No specificity fight to win here, unlike the two `Select`s: the theme's `MuiTextField`
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
       field's inset. `!important` because this padding comes from an emotion
       `styleOverrides` rule injected after this file's JSS, so a plain declaration here
       loses whatever its specificity. */
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
    /**
     * **The borderless-until-hovered treatment is gone, because it never happened.**
     *
     * This set `borderColor: transparent` at rest and revealed `borderSubtle1` on hover.
     * Measured in the browser, the notched outline paints `#D0CFD2` at rest: the theme's
     * `MuiTextField` override sets the *shorthand* `border: 1px solid #D0CFD2`, emotion
     * `styleOverrides` are injected after this file's JSS, and a shorthand beats a longhand
     * `borderColor` at equal specificity. The rule lost every time, so the seven shift
     * fields have always looked like every other field on the screen.
     *
     * Left that way rather than won back with `!important`. Seven bordered 96px fields in a
     * table column read as seven editable fields, which is what they are; the quiet version
     * was a nicer idea that also made them read as static text.
     *
     * The focus rule stays and does need to beat the theme — the brand ring is how a
     * keyboard reaches these.
     */
    '& .MuiInputBase-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: `${theme.palette.borderBrand} !important`,
    },
    /* Left, not right. Right-alignment paired the digits with a unit that sat outside the box;
       inside a quiet cell the number should start where the column starts. */
    '& input': {
      textAlign: 'left',
    },
  },

  /* `fieldUnit` lived here: the 14px grey for a unit drawn *inside* a field — the `±` in front
     of the need-by value and the `days` after the harmonization window's. Both fields are gone
     (the window from the screen, the `±` with the combobox the stepper replaced), so nothing on
     this screen puts a word inside an input any more. `unit` is the rule for the ones that sit
     beside a field. */

  /**
   * The need-by field, and it is **44 tall while the seven shift fields stay 36.**
   *
   * `numberField` is the 36px rule, shared by the shift column and the zone panel's reach —
   * both of which sit in a tight repeating row where 36 is right. This one sits *directly
   * under the address field*, in the same column of the same two-row group, and 36 against
   * that field's 44 was the one height mismatch on the screen the eye actually reads: two
   * adjacent controls, same x, two different sizes. `CONTROL_HEIGHT`'s own note says every
   * control on the screen is 44 and `numberField` has quietly contradicted it since the
   * shift column arrived; this is the half of that where it shows.
   *
   * Otherwise `numberField`: 96 wide with `minWidth` restated, because the theme's blanket
   * `MuiTextField` override sets `minWidth: 220` on every `.MuiInputBase-root` and a narrow
   * field silently renders 220 and overflows the two buttons beside it. The brand focus ring
   * has to beat the theme's own outline rule, so it keeps its `!important`.
   *
   * The `±` start adornment and MUI's 39px chevron reservation are both gone with the
   * Autocomplete — the field is a plain `TextField` between two buttons now, so it takes the
   * theme's own inset like every other field here.
   */
  needByField: {
    width: `${FIELD_WIDTH}px`,
    '& .MuiInputBase-root': {
      minWidth: `${FIELD_WIDTH}px`,
      height: `${CONTROL_HEIGHT}px`,
      maxHeight: `${CONTROL_HEIGHT}px`,
      borderRadius: '8px',
    },
    '& .MuiInputBase-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: `${theme.palette.borderBrand} !important`,
    },
    /* Left, so the digit starts where the column starts and sits against the `days` that
       follows the `+` button. */
    '& input': { textAlign: 'left' },
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

  /* ------------------------------------ One day's radius, in its own overlay */

  /**
   * The day-radius dialog's title, which needs more room under it than the location picker's.
   *
   * That one is followed by a line of instruction; this is followed straight by a labelled
   * field, so at the shared 12px the heading and the word `Center point` read as a
   * two-line stack rather than a title over a form. 28px is the same step `sectionHeader`
   * puts between a group heading and its first control.
   */
  dayRadiusDialogTitle: {
    '&.MuiDialogTitle-root': {
      padding: '24px 24px 0',
      fontSize: '18px',
      lineHeight: '26px',
      fontWeight: 600,
      color: theme.palette.textPrimary,
    },
  },

  /**
   * `&&`, not `&`, and it is load-bearing.
   *
   * MUI ships `.MuiDialogTitle-root + .MuiDialogContent-root { padding-top: 0 }` to close the
   * gap under a title, at 0-2-0 — the same specificity a plain `&.MuiDialogContent-root`
   * gives, and emotion injects after JSS, so MUI won and the 28px measured as 0. The title
   * and the first field label were touching. Doubling the ampersand takes this to 0-3-0.
   */
  dayRadiusDialogContent: {
    '&&.MuiDialogContent-root': {
      display: 'flex',
      flexDirection: 'column',
      /* 24, up from 20. The two field blocks and the map are three separate things, and at 20
         the gap between the reach stepper and the map read the same as the gap *inside* the
         field block (label to control, plus its own distance line) — so the map looked
         attached to the fields rather than sitting under them. */
      gap: '24px',
      padding: '28px 24px 4px',
      /**
       * **It scrolls, unlike the location picker's content, and that is safe here.**
       *
       * That dialog refuses a scrollport on the grounds that one around a map turns the
       * map's own drag and wheel into page scroll at the edges. Both are handled here:
       * `ZoneMap` calls `preventDefault` on `wheel` (it owns zoom) and captures the pointer
       * for a drag, so neither gesture reaches this container. What a scrollport *does* fix
       * is real — with the Includes list expanded the content is taller than the viewport,
       * and at `overflow: visible` the map and the Confirm button were simply clipped off
       * the bottom of the paper with no way to reach them.
       */
      overflowY: 'auto',
    },
  },

  /**
   * The map, taller than the panel's own.
   *
   * The panel gives its map whatever the drawer has spare; a dialog has no such slack, so
   * this states the height. 440px against the paper's ~900 is close to 2:1, which is the
   * aspect a street map wants — the fields above it are two short rows, so the height spent
   * here is the height that makes the circle and the pins it catches legible at metro zoom.
   *
   * `&&` again, for a different collision: `zoneMapRoot` carries `minHeight: 320` and is
   * declared **later in this same sheet**, so at equal specificity it wins on source order
   * and the map came out at 320 regardless of what this said.
   */
  dayRadiusMap: {
    '&&': { minHeight: '440px' },
  },

  /* A marker, not an alarm: the draft is already safe by the time this appears, so
     it only has to answer "did my edit register?". Amber or an icon here would
     promise a problem that does not exist. */
  /**
   * **Zones are horizontal cards now, not table rows.**
   *
   * A deliberate break with the rest of the screen, so the reason has to be good enough to
   * carry it: **a zone is a thing, and the other two groups are lists of settings.** The
   * weekday table is seven rows of the same shape answering one question per column, which is
   * what a table is for. A zone is an *object* a planner made — it has a name they chose, an
   * area they drew, a count that followed from it, and two things they can do to it. Rows
   * forced that into three columns and a shared grid, which meant the widest cell (a boundary
   * description) set the column for the narrowest (a two-word name), and the actions sat out
   * at a column edge 300px from the zone they act on.
   *
   * What the card buys, concretely: the name and its meta line are a **block** rather than two
   * cells, so they stay together and the meta can be as long as it needs; the actions sit at
   * the card's own right edge, which travels with the card; and there is no header row, since
   * a card names itself.
   *
   * What it costs, stated because the sheet argues the opposite elsewhere: the zones section
   * no longer shares `FORM_COLUMNS` with the day table, so nothing lines up between the two
   * groups. That alignment was worth having between two *tables*. This is not one.
   */
  zoneCards: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    padding: `0 ${ROW_INSET}px`,
  },

  /**
   * The card. **Bordered, not filled** — the page surface is white, and greying a card to
   * separate it from a white page makes the content look disabled rather than grouped.
   *
   * **Compact: 52px, down from 72.** The first pass stacked the name over its meta line, which
   * needed two text lines plus 14px of padding either side and made four zones 288px of screen
   * to say four names. With the meta beside the name the card holds one line, so its height is
   * a line of text plus air — and the whole list is legible without scrolling, which is what a
   * list of four things should be.
   *
   * `minHeight` rather than `height`, so a wrapped meta on a narrow panel grows the card
   * instead of overflowing it; it is what keeps a drawn and an undrawn zone the same size at
   * any normal width, so the stack does not ripple as boundaries get added.
   *
   * The right pad is 8 against the left's 14: the actions are borderless now, so their own
   * padding is what holds them off the card edge, and repeating 14 there would push them a
   * visible 6px further in than the text is.
   */
  zoneCard: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
    minHeight: '52px',
    padding: '6px 8px 6px 14px',
    border: `1px solid ${theme.palette.borderSubtle1}`,
    borderRadius: '10px',
    backgroundColor: theme.palette.surfaceWhite,
    /* The whole card is the hover target for its own actions, so the border answering the
       pointer is what says "this card, not the one above it". No shadow: nothing here is
       lifting off the page, and four shadowed cards on a settings screen read as a dashboard. */
    transition: 'border-color 140ms ease',
    '&:hover': { borderColor: theme.palette.borderSubtle2 },
  },

  /**
   * **Name and meta on one line**, which is what makes the card horizontal rather than a
   * two-line block that happens to be wide.
   *
   * `baseline`, not `center`: the two are different sizes — 14px name, 12px meta — and centring
   * them leaves the smaller text floating half a pixel high against the larger. Sitting them on
   * one baseline is what makes the pair read as a single line of text.
   *
   * **No separator glyph between them.** A `·` was the obvious thing and it competes with the
   * `·` the meta already uses to join its own three facts, so the card would have had two
   * levels of the same mark. The weight and colour step — `subtitle2`/`textSecondary1` against
   * `body3`/`textPlaceholder` — already says which is the name, and the 10px gap is the join.
   */
  zoneCardText: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '10px',
    minWidth: 0,
  },

  /* Tight, because the buttons have no borders to space apart any more — 8px between two
     bordered boxes reads as two controls, 8px between two bare glyphs reads as a gap. */
  zoneCardActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '2px',
    flexShrink: 0,
  },

  /**
   * The two actions, as **bare glyphs on an `IconButton`** — no box around them.
   *
   * They were `variant="secondaryGrey"` `Button`s, which drew a bordered 36px square each. Two
   * boxes on every card meant eight outlined controls down a list of four zones, and an
   * outline is a promise that something inside is enterable; these are single-press actions on
   * the card they sit in. Taking the container off leaves the glyph, which is the whole
   * message, and lets the card breathe at 52px.
   *
   * `IconButton` rather than a `Button` stripped of its border: it is the app's own control for
   * this (23 call sites), it is round, and it already carries the hit area — 18px of glyph in
   * 6px of pad is a 30px target, and MUI's ripple and focus behaviour come with it. The shape
   * of the rule follows `releaseInfo/roadmap`'s own edit button: small pad, sized glyph,
   * hover handled here rather than left to MUI's default.
   *
   * **The hover ground is what replaces the border.** With no box at rest, a bare glyph gives
   * no feedback that it is a control until it moves; a grey disc on hover and on focus is the
   * cheapest honest affordance, and it appears exactly when the pointer or the keyboard
   * arrives.
   *
   * **Both glyphs are recoloured to `currentColor`.** `edit-icon.svg` ships a `#6A6A70` stroke
   * and `trash-2.svg` a `#E43F32` one, at 16 and 20 respectively, so left alone the pair would
   * arrive as one grey and one red icon of different sizes. Forcing both to the button's own
   * colour and size is what makes them a pair rather than two borrowed assets.
   *
   * **`textSecondary3` at rest, not `textSecondary2`.** Two of these sat at the end of every
   * row down a list of four zones — eight mid-grey marks that read as loud as the zone names
   * beside them, on a screen whose actual subject is coverage rather than the ability to edit
   * it. Quieter at rest and a full step to `textPrimary` on hover and focus: the darkening
   * *is* the affordance now, doing the job the hover ground alone used to carry on its own.
   */
  zoneIconButton: {
    '&.MuiIconButton-root': {
      padding: '6px',
      color: theme.palette.textSecondary3,
      '& svg': { width: '18px', height: '18px', display: 'block' },
      '& svg path': { stroke: 'currentColor' },
      '&:hover': {
        color: theme.palette.textPrimary,
        backgroundColor: theme.palette.surfaceGreySubtle,
      },
      '&.Mui-focusVisible': {
        color: theme.palette.textPrimary,
        backgroundColor: theme.palette.surfaceGreySubtle,
        outline: `2px solid ${theme.palette.borderBrand}`,
        outlineOffset: '-2px',
      },
    },
  },

  /**
   * Remove, which is the same glyph until you are about to press it.
   *
   * **Not red at rest.** Four cards would put four red marks down a settings page, which makes
   * destruction the loudest thing on a screen whose subject is coverage — and the app's own
   * trash glyph ships red precisely because it is usually used inside a confirmation, not in a
   * list. It turns red on hover and on focus, so the warning arrives exactly when the pointer
   * or the keyboard is on it and not before. That matters more without a border: the colour
   * change is now the only thing marking which of the two is destructive.
   */
  zoneIconButtonDanger: {
    '&.MuiIconButton-root:hover, &.MuiIconButton-root.Mui-focusVisible': {
      color: theme.palette.textAlert,
      backgroundColor: theme.palette.surfaceAlertSubtle,
    },
  },

  /* `zoneDays`, `zonePill` and `zonePillIdle` lived here: the weekday chips and the amber
     "Not used" marker in the Zones table's day column. The column is gone — which days use a
     zone is set in Installation Days and could not be changed from that table, so it was
     read-only information in the one place a planner could do nothing with it. The rules went
     with it rather than staying as classes nothing applies. */

  /* ---------------------------------------- Zones: one solution at a time */

  /**
   * The section heading, on its own line now.
   *
   * The solution switch used to share this row, on the right — it moved to a floating
   * `ZoneMethodMenu` at the section's bottom-right (`zoneSolutionFloat`) so a third method
   * did not have to fight the title for width, the same move the map's own switcher made.
   * Drawing a boundary, measuring a distance and naming zip codes are still one at a time:
   * the switch is what picks; the description under it changes with it.
   */
  zoneSectionHead: {
    padding: `0 ${ROW_INSET}px 16px`,
  },

  zoneSectionHeadText: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
  },

  /* `solutionSwitch`/`solutionOption`/`solutionOptionOn` lived here: the two-segment pill
     the heading row carried before the switch became a floating `ZoneMethodMenu`. */

  /* `zoneUndefined` lived here: the grey "Not defined yet" that stood in the Covers cell
     when a zone had no shape. Removed on request — the cell reports what a zone covers, and
     a zone with no shape still covers whatever sites point at it, so the counts on the line
     below were the answer all along. */

  /**
   * Adding a zone without opening the map.
   *
   * A zone is a name plus, eventually, a shape — and the name is the part the day table
   * needs. So a planner can create one here, in the list, and define it later; sending them
   * to a full-screen map to type six characters was making the cheap half of the job as
   * expensive as the other one.
   */
  /* The add-a-zone row, shaped as a card so it lands in the same stack as the zones it is
     adding to — a dashed edge because it is not a zone yet, and no fill: the grey ground it
     used to carry was there to separate it from the table rows above, and there are none. */
  zoneInlineRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    /* Taller than a zone card, because it holds a 40px field rather than a line of text — and
       matching the card's 52 would have left the field 6px of air in a 52px box. It is a
       different kind of row and does not have to pretend otherwise; it is also only ever on
       screen one at a time, so nothing reads down a column of them. */
    minHeight: '60px',
    padding: '8px 8px 8px 14px',
    border: `1px dashed ${theme.palette.borderSubtle2}`,
    borderRadius: '12px',
    backgroundColor: theme.palette.surfaceWhite,
  },

  zoneInlineField: {
    width: '320px',
    maxWidth: '100%',
    '& .MuiInputBase-root': {
      height: '40px',
      maxHeight: '40px',
      borderRadius: '8px',
      backgroundColor: theme.palette.surfaceWhite,
    },
  },

  zoneInlineActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginLeft: 'auto',
  },

  /* ------------------------------------------------------------------ Zones */

  /* `zoneName`, `zoneDefinition` and `zoneUse` lived here — the three grid cells of a zone
     table row. The card has two blocks instead (`zoneCardText`, `zoneCardActions`), because
     the name and what it covers are one statement about the zone and were only separated by
     a column boundary. `zoneNameText` and `zoneCovers` survive: the type is unchanged. */

  /* `zoneGlyph` lived here: a 14px polygon / dashed ring / dotted ring at the head of the
     row, saying how the zone was defined. Removed on request. The argument for it was that
     "how was this made" is the one thing a name cannot carry — but the Covers cell right
     beside it already spells the same fact out in words (`Drawn boundary · 8 points`,
     `12 mi around Fairmont`), so the glyph was a picture of the sentence next to it, and
     four of them down the column read as bullets on a list that is not one. */

  /* `flexShrink: 0` now that the meta sits beside it: with both able to shrink, a long
     boundary description would eat into the zone's own name, and the name is the one thing on
     the card that cannot be inferred from anything else. The meta gives way first. */
  zoneNameText: {
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary1,
      flexShrink: 0,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
  },

  /* What the zone covers, beside its name rather than under it. It is the part that gives way
     when the card runs out of room — hence the ellipsis and the `minWidth: 0`, which a flex
     child needs before `overflow` does anything at all. */
  zoneCovers: {
    '&.MuiTypography-root': {
      color: theme.palette.textPlaceholder,
      minWidth: 0,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
  },

  zoneAddRow: {
    display: 'flex',
    gap: '12px',
    padding: `16px ${ROW_INSET}px 0`,
    flexWrap: 'wrap',
  },

  /**
   * No zones at all, which is a state a planner can reach by deleting the last one.
   *
   * Bordered rather than filled: the page surface is white and greying a block to say
   * "empty" makes the empty state heavier than the populated one it replaces.
   */
  zoneEmpty: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    margin: `0 ${ROW_INSET}px`,
    padding: '32px',
    border: `1px solid ${theme.palette.borderSubtle1}`,
    borderRadius: '12px',
    textAlign: 'center',
  },

  zoneEmptyText: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    maxWidth: '52ch',
  },

  /* The coverage bands are gone from Installation Days — `coverageBand`, `coverageBandWrap`,
     `coverageIcon`, `coverageText` and `coverageBody` with them. They were three amber panels
     reporting, from above the table, what the table's own controls already say: a day with no
     zone is a required select that marks itself, and a zone no day covers is legible from the
     Zone column of seven rows. `zoneCoverage` still computes all of it — the Covers column
     reads `byZone` — so nothing was removed from the model, only the paragraphs about it.
     `coverageTitle` survives: the zones empty state uses it. */

  coverageTitle: {
    '&.MuiTypography-root': { color: theme.palette.textPrimary },
  },

  /* --------------------------------------------------- The zone cell on a day row */

  /**
   * The checkbox and the weekday name, together in the label column.
   *
   * They were columns 1 and 2 of a four-column template, which is what put every weekday
   * name 60px right of every label above it. A selection control belongs *with* the thing
   * it selects, and pairing them is what let the whole table move onto the form's grid —
   * see `FORM_COLUMNS`. Tab order is unchanged: the checkbox is still first in the DOM.
   */
  dayCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    minWidth: 0,
  },

  /**
   * The zone select, at the control column's full 352px.
   *
   * Same width as the address field two sections up, which is the alignment the regrid
   * bought: the screen's two widest controls now start and end at the same x.
   */
  zoneSelect: {
    width: '100%',
    maxWidth: `${COLUMN_CONTROL}px`,
    '& .MuiInputBase-root': {
      height: `${CONTROL_HEIGHT}px`,
      maxHeight: `${CONTROL_HEIGHT}px`,
      borderRadius: '8px',
    },
    '& .MuiSelect-select': {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '14px',
      lineHeight: '20px',
      padding: `0 32px 0 ${FIELD_INSET}px !important`,
    },
    '& .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.borderSubtle2 },
    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.borderStrong1 },
    /* `&.Mui-focused`, not `& .Mui-focused`. MUI puts the class on the input base root,
       which is the element carrying this class — so the descendant form matched nothing and
       the visible green focus border was coming from the theme's own override rather than
       from here. Corrected so the rule says what actually happens instead of relying on a
       cascade it did not know about. */
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: theme.palette.borderBrand,
    },
  },

  /**
   * A worked day with no zone yet.
   *
   * A placeholder rather than a disabled control: the day is legal like this, it simply
   * cannot receive work. Refusing to store the day until it had a zone would turn switching a
   * day on into a two-step commit. What it *is* is an unfilled required field, so it carries
   * `fieldRequired` and a `Required` note — which is where the coverage band above the table
   * used to say the same thing from a distance.
   */
  /* The heading and its required mark share a baseline. */
  columnLabelRequired: {
    display: 'flex',
    alignItems: 'center',
    gap: '2px',
  },

  /**
   * The select, and the `Required` note that hangs beneath it.
   *
   * **The note is out of the flow**, which is the fix for a row that used to grow by the
   * note's own height the moment it appeared: the cell was a flex column holding both, so a
   * day going red pushed its row ~20px taller, shunted the six rows below it, and knocked the
   * select out of vertical centre against the checkbox and shift field on the same line.
   * Anchored instead, the row holds `ROW_HEIGHT` whatever the field is saying.
   *
   * It overhangs the row's bottom edge by design — `ROW_HEIGHT` has no room for a second line
   * — and that is safe because it is the last thing in a row whose neighbour below is a 1px
   * rule and 12px of the next row's own padding. `pointerEvents: none` so a note sitting over
   * that boundary cannot eat a click meant for the row underneath.
   */
  zoneCell: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    minHeight: `${CONTROL_HEIGHT}px`,
  },

  /**
   * A mandatory field on a worked day, left empty — the zone select and the shift field
   * both, which is why this is no longer named for the select.
   *
   * The app's error tokens rather than an amber advisory, and the distinction is real: amber
   * was "this configuration has a gap you should know about", red is "this field is not
   * filled in". Both cases here are the second one — there is a specific empty control, and
   * it is right there in the row. It is also the whole of what is left of the coverage panel
   * that used to say the same thing from above the table.
   */
  fieldRequired: {
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: `${theme.palette.borderAlert} !important`,
    },
  },

  zoneRequiredNote: {
    '&.MuiTypography-root': {
      position: 'absolute',
      top: '100%',
      left: 0,
      marginTop: '2px',
      color: theme.palette.textAlert,
      fontWeight: 500,
      lineHeight: '16px',
      whiteSpace: 'nowrap',
      pointerEvents: 'none',
    },
  },

  zoneSelectEmpty: {
    '& .MuiSelect-select': { color: theme.palette.textPlaceholder },
  },

  /**
   * The Radius column's cell: the reach, and the two things you can do to it.
   *
   * Not a field, because there is nothing to type here and nothing to pick from — a day owns
   * its circle and the map overlay is where it gets set. So the resting state is a value and
   * two glyph buttons, which is the same shape the zone cards use for the same pair of verbs,
   * and an empty day is a single button that opens the map.
   */
  /**
   * The Radius column's cell: the reach, and the two things you can do to it.
   *
   * **The actions sit against the value, not at the far edge of the column** — and they are
   * hidden until the row is hovered. Pushed apart by `space-between` they were ~200px from
   * the number they act on, which is a long way to travel to edit a two-word value and reads
   * as two unrelated cells; and seven rows of two permanently-visible glyphs put fourteen
   * marks down a column whose actual content is a distance. `flex-start` with an 8px gap
   * groups them with what they belong to, and revealing them on hover leaves the resting
   * table showing seven distances and nothing else.
   *
   * Keyboard focus reveals them too (`:focus-within`), which is the part a hover-only control
   * usually forgets: without it the buttons are reachable by Tab and invisible while focused.
   */
  dayRadiusCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    width: '100%',
    maxWidth: `${COLUMN_CONTROL}px`,
    minHeight: `${CONTROL_HEIGHT}px`,
  },

  dayRadiusValue: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
      fontVariantNumeric: 'tabular-nums',
      whiteSpace: 'nowrap',
    },
  },

  /* `visibility` rather than `display`, so the buttons keep their footprint and the value
     beside them does not shift sideways as the pointer arrives. */
  dayRadiusActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '2px',
    flexShrink: 0,
    visibility: 'hidden',
    '$dayRow:hover &, &:focus-within': { visibility: 'visible' },
  },

  /* The empty day's button, once Save has asked for it. A red outline rather than a red fill:
     the button is still the way forward, not the thing that went wrong. */
  dayRadiusAddMissing: {
    '&.MuiButton-root': {
      borderColor: theme.palette.borderAlert,
      color: theme.palette.textAlert,
    },
  },

  /* ------------------------------------------------- The zone editor's map */

  /**
   * A real street map, because a boundary that is not over streets is not a boundary.
   *
   * Same renderer contract as the workspace's route map — CARTO raster tiles, no API key,
   * `tileProjection` doing the Mercator for both so the two cannot disagree about where a
   * coordinate is. `touchAction: none` because the pan is a pointer gesture and the
   * browser would otherwise scroll the dialog out from under it on a trackpad.
   */
  zoneMapRoot: {
    position: 'relative',
    /**
     * **The map takes whatever height the panel has spare, and never gives up its last 320px.**
     *
     * `flex: 1` rather than the fixed 400px this used to be. The panel is pinned top to
     * bottom of the viewport, so a fixed height made the drawer's largest single element the
     * empty part of it: on a 1200px-tall screen the boundary experience has 853px of room
     * below its label, so 453px of that was white space between the map and the footer.
     * Growing means 853px of map there and 769px in the radius experience, the difference
     * being the centre field and the reach row it carries above the map.
     *
     * `minHeight` is the floor that the old `flexShrink: 0` was really defending, and the
     * reason it cannot simply be dropped now that the map grows: a flex item shrinks below
     * its own size by default, so the moment the content above got taller the 400px surface
     * was quietly squashed to 234. That is bad on its own and worse downstream — `fitView`
     * picks a zoom from the height it is handed, so a shorter map silently zoomed out until a
     * forty-mile territory was rendered across half of Florida.
     *
     * So on a short panel the body scrolls rather than the map giving way, which is the same
     * judgement as before at a lower number: 320 rather than 400, because 400 was chosen when
     * this was a fixed height in a dialog and a floor only has to be the point below which
     * the fit stops being readable. Measured at 1280x700 — boundary keeps 353px and nothing
     * scrolls; radius sits on the floor and the body scrolls 51px, which puts the last 27px
     * of the map and part of the switcher under the fold. That scroll has to be started off
     * the map: a wheel over the surface zooms, because `ZoneMap` takes the gesture.
     */
    flex: 1,
    minHeight: '320px',
    borderRadius: '8px',
    overflow: 'hidden',
    border: `1px solid ${theme.palette.borderSubtle1}`,
    backgroundColor: theme.palette.surfaceGreySubtle,
    /* The cursor is set per interaction by the component — a drag that draws and a click
       that picks are not the same invitation. */
    touchAction: 'none',
    userSelect: 'none',
  },

  zoneMapTile: {
    position: 'absolute',
    width: '256px',
    height: '256px',
    pointerEvents: 'none',
    userSelect: 'none',
  },

  /**
   * Everything drawn on the map, and none of it clickable.
   *
   * A click anywhere means "put a point here" / "move the anchor here", so a pin that
   * swallowed the click would leave a dead spot exactly where the planner is aiming. The
   * overlay is `pointerEvents: none` and the chrome opts back in by hand.
   */
  zoneMapOverlay: {
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
  },

  zoneMapZoom: {
    position: 'absolute',
    right: '12px',
    top: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },

  zoneMapZoomButton: {
    '&.MuiButton-root': {
      minWidth: '32px',
      width: '32px',
      height: '32px',
      padding: 0,
      borderRadius: '6px',
      border: `1px solid ${theme.palette.borderSubtle2}`,
      backgroundColor: theme.palette.surfaceWhite,
      color: theme.palette.textSecondary1,
      fontSize: '16px',
      lineHeight: 1,
      boxShadow: '0 1px 2px rgba(16, 24, 40, 0.06)',
      '&:hover': { backgroundColor: theme.palette.surfaceGreySubtle },
    },
  },

  /** Attribution is a condition of using the tiles, so it is not optional chrome. */
  /* Bottom-*left* now: the switcher took the right corner, and attribution that a control
     sits on top of is attribution nobody can read. */
  zoneMapAttribution: {
    '&.MuiTypography-root': {
      position: 'absolute',
      left: '8px',
      bottom: '6px',
      padding: '2px 6px',
      borderRadius: '4px',
      backgroundColor: 'rgba(255, 255, 255, 0.86)',
      color: theme.palette.textSecondary2,
      fontSize: '10px',
      lineHeight: '14px',
    },
  },

  /**
   * The active zone's name, on the map.
   *
   * Not decoration and not a duplicate of the panel title: the locked zones each carry
   * their own grey label, so without this the one shape a planner can actually edit is the
   * only unnamed thing on screen. The brand dot is the tie — it is the same colour as the
   * one dashed shape that answers a click.
   */
  zoneMapBadge: {
    position: 'absolute',
    left: '12px',
    top: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '5px 10px',
    borderRadius: '6px',
    border: `1px solid ${theme.palette.borderSubtle1}`,
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    boxShadow: '0 1px 2px rgba(16, 24, 40, 0.06)',
    maxWidth: 'calc(100% - 88px)',
  },

  zoneMapBadgeDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    flexShrink: 0,
    backgroundColor: theme.palette.surfaceBrand,
  },

  zoneMapBadgeText: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
  },

  /* Top edge, beside the badge: the bottom of the map now carries the switcher and the
     attribution, and a third floating thing down there is a cluttered corner. */
  zoneMapHint: {
    '&.MuiTypography-root': {
      position: 'absolute',
      left: '12px',
      top: '48px',
      padding: '4px 8px',
      borderRadius: '6px',
      border: `1px solid ${theme.palette.borderSubtle1}`,
      backgroundColor: 'rgba(255, 255, 255, 0.92)',
      color: theme.palette.textSecondary1,
    },
  },

  /* ------------------------------------------------- The zone editor's panel */

  /**
   * A flat panel on the same screen, not a drawer over it.
   *
   * `SideDrawer` was the first attempt and it was a modal: a scrim, a floating paper, and
   * the zone list — the only context a new zone has — hidden behind it. This is fixed to the
   * right edge, full height, with a hairline instead of a shadow, and the screen moves over
   * (`wrapperShifted`). Nothing is dimmed, because nothing here is meant to stop being
   * usable.
   *
   * `zIndex` sits above the app chrome but below MUI's own modals (1300), so a confirm
   * dialog opened from inside the panel still lands on top of it.
   */
  panelSurface: {
    position: 'fixed',
    top: 0,
    right: 0,
    bottom: 0,
    width: `${PANEL_WIDTH}px`,
    maxWidth: '100vw',
    zIndex: 1200,
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: theme.palette.surfaceWhite,
    borderLeft: `1px solid ${theme.palette.borderSubtle1}`,
    transform: 'translateX(0)',
    transition: 'transform 240ms cubic-bezier(0.4, 0, 0.2, 1)',
  },

  panelSurfaceClosed: {
    transform: `translateX(${PANEL_WIDTH}px)`,
    /* Off-screen *and* out of the tab order, so a closed panel cannot be reached by
       keyboard — a transform alone leaves every control in it focusable. */
    visibility: 'hidden',
  },

  /* Just the heading and its close button. `zonePanelHeader` lived here with a bottom
     border and a subtitle; both went — see the note in `ZoneEditorPanel`. */
  zonePanelHeading: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
  },

  zonePanelTitle: {
    '&.MuiTypography-root': {
      fontWeight: 600,
      color: theme.palette.textPrimary,
    },
  },

  zonePanelClose: {
    '&.MuiIconButton-root': {
      marginRight: '-8px',
      color: theme.palette.textSecondary2,
      '&:hover': { backgroundColor: theme.palette.surfaceGreySubtle },
    },
  },

  zonePanelBody: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    /* The heading lives in here now, so the body owns the top padding the header used to. */
    padding: '20px 24px 24px',
    overflow: 'auto',
  },

  zonePanelFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '12px',
    padding: '16px 24px',
    borderTop: `1px solid ${theme.palette.borderSubtle1}`,
    backgroundColor: theme.palette.surfaceWhite,
  },

  zonePanelFooterActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginLeft: 'auto',
  },

  /**
   * **The switcher, and why it is a switcher rather than a mode flag.**
   *
   * Drawing a boundary, setting a distance and naming zip codes are three different answers
   * to "which sites", not three settings on one control: each is a genuinely different
   * interface — different inputs, different guidance, different map affordances — and this
   * only chooses between them.
   *
   * **A trigger that opens a menu, not a row of segments.** Two segments read fine side by
   * side; a third either crowds three labels into the same width or grows the control until
   * it competes with the map it floats over. `ZoneMethodMenu` names the live choice and opens
   * the other two on demand instead, which is the same move the scheduler's own
   * `ReviewOptionsMenu` made when a third segmented pill made that row read as three unrelated
   * dials rather than one control.
   */
  /**
   * The switcher's trigger, floating at the map's bottom-right.
   *
   * It moved out of the panel header because of what it actually does: it changes how you
   * *interact with the map*, so it belongs on the map, near the hand. In the header it read
   * as a form field — a property of the zone — which it is not; the zone does not care how
   * its sites were chosen.
   *
   * Bottom-right rather than top, so it never sits over the active-zone badge or the zoom
   * controls, and so it is furthest from the part of a boundary a right-handed drag tends to
   * finish on. Positioning only — the pill's own chrome (border, fill, shadow) lives on
   * `zoneMethodTrigger` now that there is one button here instead of a segmented pair, so the
   * same wrapper works unchanged wherever `ZoneMethodMenu` is dropped.
   */
  mapSwitcher: {
    position: 'absolute',
    right: '12px',
    bottom: '12px',
  },

  /**
   * `ZoneMethodMenu`'s trigger button — the pill itself, wherever it is anchored.
   *
   * Carries the border, fill and shadow the old `mapSwitcher` container used to, because a
   * single button standing alone (rather than two segments inside a shared track) has to
   * read as pressable chrome on its own.
   */
  zoneMethodTrigger: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    height: '32px',
    padding: '0 10px 0 12px',
    border: `1px solid ${theme.palette.borderSubtle2}`,
    borderRadius: '10px',
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    boxShadow: '0 2px 8px rgba(16, 24, 40, 0.12)',
    color: theme.palette.textPrimary,
    cursor: 'pointer',
    transition: 'background-color 120ms ease',
    '& svg': { width: '14px', height: '14px', display: 'block', flexShrink: 0 },
    '&:hover': { backgroundColor: theme.palette.surfaceGreySubtle },
    '&:focus-visible': { outline: `2px solid ${theme.palette.borderBrand}`, outlineOffset: 2 },
  },

  /* Held open-looking for as long as its menu is, so the pill and the panel read as one
     object rather than a panel floating over an idle button — the same reasoning
     `ReviewOptionsMenu`'s `triggerOpen` gives. */
  zoneMethodTriggerOpen: {
    backgroundColor: theme.palette.surfaceGreySubtle,
  },

  zoneMethodTriggerLabel: {
    ...theme.typography.subtitle2,
    color: 'inherit',
    whiteSpace: 'nowrap',
  },

  zoneMethodCaret: {
    display: 'flex',
    flexShrink: 0,
    width: '11px',
    height: '11px',
    color: theme.palette.textSecondary3,
    transition: 'transform 140ms ease',
    /* Closed: points up, at the menu that will appear above. */
    transform: 'rotate(180deg)',
    '& svg': { width: '11px', height: '11px', display: 'block' },
  },

  zoneMethodCaretOpen: {
    /* Open: points down, back at the trigger the next click collapses. */
    transform: 'rotate(0deg)',
  },

  /** One fixed width, so the paper does not resize itself around whichever label is longest. */
  zoneMethodMenuPaper: {
    '&.MuiPaper-root': {
      width: 200,
      marginBottom: '8px',
      borderRadius: 10,
      border: `1px solid ${theme.palette.borderSubtle1}`,
      overflow: 'hidden',
      boxShadow: '0px 4px 16px rgba(16, 24, 40, 0.12)',
    },
  },

  zoneMethodMenuList: {
    '&.MuiList-root': { padding: '4px 0' },
  },

  zoneMethodMenuItem: {
    '&&': {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      minHeight: '36px',
      padding: '6px 12px',
      '& > svg': { flexShrink: 0 },
      '&:hover': { background: theme.palette.surfaceGreySubtle },
      '&.Mui-selected': { background: 'transparent' },
      '&.Mui-selected:hover, &.Mui-selected:focus': {
        background: theme.palette.surfaceGreySubtle,
      },
    },
  },

  zoneMethodMenuItemLabel: {
    '&&': {
      ...theme.typography.subtitle2,
      color: theme.palette.textPrimary,
      flex: '1 1 auto',
      minWidth: 0,
    },
  },

  zoneMethodMenuItemLabelOn: {
    '&&': { color: theme.palette.textBrand },
  },

  zoneMethodMenuCheck: {
    width: 14,
    height: 14,
    flex: '0 0 auto',
    display: 'grid',
    placeItems: 'center',
    color: theme.palette.textBrand,
    '& svg': { width: '14px', height: '14px', display: 'block' },
  },

  /**
   * Where the solution menu floats: fixed to the screen's bottom-right corner, the same
   * way the scheduler's own review menu is pinned over its grid — not to the Zones
   * section's box, which scrolls the trigger away with the rest of the card stack the
   * moment a planner scrolls past it. `zIndex` clears the sticky Save bar so the two
   * cannot paint over each other, and `bottom` sits above that bar's own height (69px,
   * measured) with the same 24px gutter the scheduler's floating shell uses.
   */
  zoneSolutionFloat: {
    position: 'fixed',
    right: '24px',
    bottom: '93px',
    zIndex: 2,
  },

  /* ------------------------- What the shape caught, under the name that owns it */

  /**
   * **Not a card any more, and no longer above the name field.**
   *
   * It sat between a bordered field and a bordered map: three outlined blocks stacked on a
   * white surface, the least important of them framed exactly as strongly as the other two.
   * A border around one line of text is the definition of chrome doing nothing, so the box
   * is gone — the field and the map are the only framed things in the panel now, which is
   * the right count. Measured, the block went from 50px to 28px collapsed, and the 22px
   * goes to the map.
   *
   * The alternative was keeping the box and lightening it — a `surfaceGreySubtle` fill with
   * no border. Rejected: the page surface here is white, a grey panel inside it reads as a
   * disabled region, and it would still be a block competing with the map for the eye.
   */
  includedBar: {
    display: 'flex',
    flexDirection: 'column',
    /**
     * **Cannot shrink, for the same reason as before the box came off.**
     *
     * The expanded list below is a scroll container, so there is no automatic content
     * minimum protecting this subtree, and the map's 320px floor takes the remaining room
     * first: on a 700px-tall panel with the radius experience mounted this was measured at
     * 2px, a summary line sized to nothing. The body scrolls instead, which is what the
     * fields above it already force it to do at that height.
     */
    flexShrink: 0,
  },

  /**
   * The glance: a quiet key, the count in bold, the load in grey, then the disclosure.
   *
   * `alignSelf: flex-start` rather than a full-width row. With the card gone there is no
   * right edge for a chevron to sit against, so the chevron follows the text it opens and
   * the hover surface is the width of the sentence instead of the width of the panel. The
   * target is still about 200×28px — the full-width rule existed to beat aiming at a 16px
   * chevron, and that is beaten here by two orders of magnitude of area.
   */
  includedSummary: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    alignSelf: 'flex-start',
    maxWidth: '100%',
    minHeight: '28px',
    /* Pulled back by its own inset, so the hover surface has breathing room without
       "Included" losing its alignment with the name field's left edge above. */
    margin: '0 -8px',
    padding: '0 8px',
    borderRadius: '6px',
    border: 0,
    background: 'none',
    textAlign: 'left',
    font: 'inherit',
    color: 'inherit',
  },

  includedSummaryLive: {
    cursor: 'pointer',
    '&:hover': { backgroundColor: theme.palette.surfaceGreySubtle },
    '&:focus-visible': {
      outline: `2px solid ${theme.palette.textPrimary}`,
      outlineOffset: '-2px',
    },
  },

  /**
   * **One font style across the whole block**, which is a reversal.
   *
   * The line used to run three sizes — `body3` label, `h5` count, `body3` detail — on the
   * argument that the site count is the one thing worth reading at a glance and should
   * therefore be the only bold thing in the panel. Asked to stop: four type sizes inside one
   * 28px sentence (and two more in the list behind it) made a summary read as a headline with
   * annotations. Everything is `body2` now, in the panel's own body size, and the only thing
   * still separating the three parts is colour — label and detail grey, the count in ink.
   */
  includedLabel: {
    '&.MuiTypography-root': { color: theme.palette.textSecondary3 },
  },

  /* ---------------- The always-open variant, under the radius dialog's map */

  includedStatic: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },

  /**
   * Heading left, counts right, and a rule underneath.
   *
   * The rule is the only line in the whole block. It does two jobs a border box was doing
   * badly: it separates the summary from the rows it summarises, and it gives a scrolling
   * list a top edge to run under — without drawing a container around content that is not a
   * table and should not read as one.
   */
  includedStaticHead: {
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: '12px',
    paddingBottom: '8px',
    borderBottom: `1px solid ${theme.palette.borderSubtle2}`,
  },

  /**
   * Nothing caught yet, in the box the list will occupy.
   *
   * Bordered and roughly two rows tall, so the panel does not jump by 100px the first time a
   * centre is placed — and so the section reads as *waiting* rather than missing. Dashed,
   * which is this screen's own mark for a container holding something not made yet (see
   * `zoneInlineRow`).
   */
  includedEmptyState: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '76px',
    padding: '12px 16px',
    border: `1px dashed ${theme.palette.borderSubtle2}`,
    borderRadius: '8px',
    textAlign: 'center',
  },

  /* Tabular figures because a planner redraws and compares — proportional digits make the
     number jump sideways between two drags that caught 8 and 11 sites. */
  includedCount: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
      fontVariantNumeric: 'tabular-nums',
    },
  },

  includedDetail: {
    '&.MuiTypography-root': {
      color: theme.palette.textPlaceholder,
      fontVariantNumeric: 'tabular-nums',
      minWidth: 0,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
  },

  includedEmpty: {
    '&.MuiTypography-root': { color: theme.palette.textPlaceholder },
  },

  includedChevron: {
    display: 'flex',
    flexShrink: 0,
    color: theme.palette.textSecondary3,
    transition: 'transform 160ms ease',
  },

  includedChevronOpen: {
    transform: 'rotate(180deg)',
  },

  /**
   * Which sites, on demand — hung off a left rule instead of boxed.
   *
   * The rule is the only thing tying these rows to the line that opened them now that the
   * card is gone, and it has to be `borderSubtle2`: a 1px `borderSubtle1` hairline on white
   * measures about 1.08:1 and is simply not visible. The row separators went for that same
   * reason — eight invisible lines are eight rows of noise that never resolve into a table —
   * and each row is already a two-line block, which separates them on its own.
   *
   * `paddingTop`, not `marginTop`: this is the child of a `Collapse`, which sizes the
   * animation from the wrapper's `offsetHeight`, and a top margin is not in that number, so
   * the last row would be clipped by exactly the gap.
   */
  /**
   * **A bordered panel now, not a list hanging off a left rule.**
   *
   * The rule was the cheapest thing that tied the rows to the line that opened them, and at
   * four tight rows with a scrollbar running down the middle of the dialog it read as text
   * that had come loose rather than as a disclosed list. A bordered box says "this belongs to
   * the control above it" without a fill — the page surface here is white, and greying a
   * block on white reads as disabled.
   *
   * Full width of its container rather than the old 420px cap: that number was measured for
   * the 571px editor panel and leaves a 900px dialog with a narrow column of text and a
   * scrollbar floating in the middle of it. The row's own `space-between` is what keeps the
   * name and its count apart, and 640px is the point past which that gap stops reading as a
   * pair.
   *
   * `paddingTop` on the wrapper rather than `marginTop`: this is a `Collapse` child, and the
   * animation is sized from `offsetHeight`, which a top margin is not part of.
   */
  includedList: {
    /* No border, no radius, no fill — the header's rule is the edge. A box here nested a
       table inside a dialog that already has one frame too many. */
    width: '100%',
    /* About four rows before it scrolls: enough to answer "did it catch the right ones"
       without the list pushing the dialog's own actions off the bottom. */
    maxHeight: '212px',
    overflowY: 'auto',
    /* A thin, quiet scrollbar. The default 15px channel is wider than the gap it sits in and
       draws more than the rows it scrolls. */
    scrollbarWidth: 'thin',
    scrollbarColor: `${theme.palette.borderStrong1} transparent`,
    '&::-webkit-scrollbar': { width: '6px' },
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: theme.palette.borderSubtle2,
      borderRadius: '3px',
    },
    '&::-webkit-scrollbar-track': { backgroundColor: 'transparent' },
  },

  /* Rows held apart by air rather than by rules — the name/company pair is already a visual
     block, so a line between blocks is a third signal doing the second one's job. */
  includedRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '16px',
    padding: '10px 0',
  },

  /* 2px, not the 4 a stack would normally take: the company is a qualifier on the name
     above it, and the pair has to read as one row against the 20px between rows. */
  includedRowMain: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    minWidth: 0,
  },

  includedSiteName: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
  },

  includedCompany: {
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary3,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
  },

  /* Right-aligned and tabular, so seven of these read as a column of numbers rather than
     seven independent labels. */
  includedRowMeta: {
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary1,
      whiteSpace: 'nowrap',
      fontVariantNumeric: 'tabular-nums',
      flexShrink: 0,
    },
  },

  /* ------------------------------------------- The radius centre, and its site */

  /* `centreSelect`/`centreSelectEmpty`/`centreDistance`/`centreDistanceValue` lived here:
     the site dropdown that used to pick a radius centre, and the distance line beneath it.
     The centre is a dropped pin now — there is no list to choose from — so the field is a
     readout (`centrePlaced`) rather than a control. */

  /**
   * The placed pin: what it is, and the one verb it has.
   *
   * It reports the distance from the start point rather than coordinates, because that is
   * the fact the map cannot show — a centre forty miles from the depot costs eighty miles of
   * the day before a filter is changed, and at this zoom that is invisible. Coordinates would
   * be precise and useless: nobody checks a zone by reading latitude.
   *
   * Sized to `CONTROL_HEIGHT` so the row keeps the height it had when a select sat here and
   * the reach stepper beside it stays on the same baseline.
   */
  centrePlaced: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
    minHeight: `${CONTROL_HEIGHT}px`,
  },

  centrePlacedText: {
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary1,
      fontVariantNumeric: 'tabular-nums',
    },
  },

  /* The distance's reserved line. Height held whether or not there is a centre, so placing
     the first pin fills this slot rather than pushing the map down by a line of text. */
  centreDistanceSlot: {
    display: 'flex',
    alignItems: 'center',
    minHeight: '18px',
  },

  centreEmptyText: {
    '&.MuiTypography-root': {
      display: 'flex',
      alignItems: 'center',
      minHeight: `${CONTROL_HEIGHT}px`,
      color: theme.palette.textPlaceholder,
    },
  },

  /* -------------------------------------------------- Required, and missing */

  /**
   * A field's label, its required mark, and the tooltip that says why.
   *
   * `RequiredAsterik` is the app's own mark and the info button is this screen's own
   * pattern (it labels Need by Date and Max Shift Hours already). Pairing them means the
   * asterisk does not have to carry the explanation on its own — a red star tells a planner
   * *that* something is required and never *what counts as* filled in, which for a shape
   * drawn on a map is the whole question.
   */
  zoneFieldLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    minHeight: '20px',
  },

  zoneFieldLabelText: {
    '&.MuiTypography-root': { color: theme.palette.textPrimary },
  },

  /* 8px between a label and its control, up from 6. At 6 the label sat close enough to the
     field to read as part of its border rather than as a heading over it — the same step the
     settings rows use between a label and the thing it names. */
  zoneField: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },

  /**
   * The boundary experience's field, whose control happens to be the map.
   *
   * It exists because the map there is two levels below the scrolling body — the body's flex
   * column, then this label-plus-control wrapper — and `flex: 1` on the map alone stops at
   * this wrapper's own content height, which is the label plus a 320px floor. So the wrapper
   * grows as well and hands the room on.
   *
   * **No `minHeight: 0` here**, deliberately: that would let the wrapper shrink under the
   * map's floor, and since nothing clips it the map would then overhang a scroll container
   * whose `scrollHeight` had not counted it — the bottom of the map unreachable rather than
   * scrolled to. Leaving the automatic content-based minimum means the wrapper cannot get
   * shorter than the floor, so the body scrolls at the point the map stops growing. The
   * radius experience needs no equivalent: its map is a direct child of the body.
   */
  zoneFieldMap: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    flex: 1,
  },

  zoneMissingText: {
    '&.MuiTypography-root': { color: theme.palette.textAlert },
  },

  /** The map surface, outlined red while the shape it should hold is missing. */
  zoneMapRootInvalid: {
    borderColor: theme.palette.borderAlert,
  },

  /* ------------------------------------------------ The zone editor's dialog */

  /**
   * The panel's primary input, spanning the panel's content column.
   *
   * It was `COLUMN_CONTROL` (352px) — the settings form's control width, borrowed. That
   * width means something in the three-column rows on the page behind and nothing in a
   * 620px panel: it left 219px of empty white to the right of the field, and it made the
   * name read as a short-answer cell rather than the thing the whole panel is naming. The
   * Included line, the map and the footer all span the full 571px, so the field stopping
   * short of them was the one thing breaking the panel's right edge.
   */
  zoneNameField: {
    width: '100%',
    '& .MuiInputBase-root': {
      height: `${CONTROL_HEIGHT}px`,
      maxHeight: `${CONTROL_HEIGHT}px`,
      borderRadius: '8px',
    },
  },

  /* Centre and reach side by side: they read as one sentence — "12 miles around Packages
     Mall" — which is exactly what the zone row will say once this is confirmed. */
  zoneRadiusInputs: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) auto',
    gap: '16px 32px',
    alignItems: 'start',
    [STACK_QUERY]: { gridTemplateColumns: 'minmax(0, 1fr)' },
  },

  zoneRadiusRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },

  /**
   * A stepper beside the field, matching the counters in the harmonize workspace.
   *
   * The number is the setting and stays typeable — a planner who wants 40 miles types 40
   * rather than clicking thirty times — but nudging by one is the common edit when the
   * question is "does this catch Fairmont or not", and that deserves a button.
   */
  zoneStepButton: {
    '&.MuiButton-root': stepButton(theme, 36),
  },

  /* The need-by stepper's buttons, square to its 44px field. Same rule, one argument
     different — see `stepButton`. */
  stepButtonTall: {
    '&.MuiButton-root': stepButton(theme, CONTROL_HEIGHT),
  },

  /* Removed with the pieces they styled, rather than left as classes nothing applies:
     `zonePanel`/`zoneDialogContent`/`zoneEditor*` (the modal dialog the flat panel replaced),
     `zoneSwitcher*`/`zoneMode*` (the in-header switcher, now floating on the map),
     `zoneReadout*` (the two-column in/out table, now the one-line `included*` bar),
     `zoneMissing`/`zoneMissingIcon` (the red banners — the state is inline now),
     `zoneCount` and `coverageActions` (the old zone row and warning-band buttons),
     `zoneCentrePinned` (a dropped pin's coordinates, gone with pin-anywhere centres),
     `zoneOption*` (the day table's zone-select option rows, which never got built out).
     `zoneMissingText` and `zoneMapRootInvalid` survive — the footer line and the map's own
     red outline are what say "not finished" now. */

  unsavedText: {
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary2,
    },
  },

  /* ------------------------------------------- The zip-codes experience */

  /** The field and the Add button, on one row like the radius experience's centre/reach pair. */
  zoneZipInputRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '8px',
  },

  zoneZipField: {
    width: '140px',
    '& .MuiInputBase-root': {
      height: `${CONTROL_HEIGHT}px`,
      maxHeight: `${CONTROL_HEIGHT}px`,
      borderRadius: '8px',
    },
  },

  zoneZipAddButton: {
    '&.MuiButton-root': {
      height: `${CONTROL_HEIGHT}px`,
    },
  },

  /** One line, so a bad entry is read against the field that produced it rather than
      floating free somewhere else on the panel. */
  zoneZipError: {
    '&.MuiTypography-root': { color: theme.palette.textAlert },
  },

  /**
   * The entered codes, as chips rather than a bare comma list — each one needs its own
   * remove control, and a list of text has nowhere to hang one.
   */
  zoneZipChips: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    marginTop: '4px',
  },

  zoneZipChip: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    height: '28px',
    padding: '0 6px 0 10px',
    borderRadius: '7px',
    border: `1px solid ${theme.palette.borderSubtle2}`,
    backgroundColor: theme.palette.surfaceGreySubtle,
    color: theme.palette.textPrimary,
    fontSize: '13px',
    fontWeight: 500,
    lineHeight: '18px',
  },

  zoneZipChipRemove: {
    '&.MuiIconButton-root': {
      width: '18px',
      height: '18px',
      padding: 0,
      color: theme.palette.textSecondary3,
      '&:hover': { color: theme.palette.textAlert, backgroundColor: 'transparent' },
      '& svg': { width: '10px', height: '10px', display: 'block' },
    },
  },
}));
