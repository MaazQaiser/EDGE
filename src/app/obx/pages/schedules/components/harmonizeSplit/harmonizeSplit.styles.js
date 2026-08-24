import { makeStyles } from '@mui/styles';

/**
 * The Split shell: two columns, and the parts that are new to it.
 *
 * **What is deliberately *not* here.** Everything inside ③ — the day tabs, the route card,
 * the stop rows, the decision box, the issues tray — is drawn by the drawer's own
 * components against `harmonizeFlow.styles.js`, imported and handed straight through. That
 * is the point of the comparison: Drawer↔Split has to be a question about the *shell*, and
 * a second copy of the route card would make it a question about two route cards that
 * drifted. This sheet owns the frame, the scope panel, the day pills, the empty state and
 * the map's chrome, and nothing that already exists next door.
 *
 * The one exception is the handful of `flow*` overrides at the bottom, which exist because
 * a component built for a drawer is being asked to sit in a column inside a full-screen
 * surface — see their own note.
 */

/** `textPrimary` at 6%, the same lift the drawer's own bands use. */
const EDGE_SHADOW = 'rgba(38, 37, 39, 0.06)';

/* `WARNING_INK` and `SPILL_LINE` are **gone with the figures they inked.** The amber stat
   value and the amber-when-over capacity bar both moved out of this sheet: the summary box is
   the drawer's component now (see the forecast note below), so the amber ink that says *this
   does not fit* is the drawer's `WARNING_INK` and there is one of it again rather than two
   copies agreeing by hand. */

/**
 * The left column's width, and why it is a clamp rather than a percentage.
 *
 * The Workspace's columns are proportional — 25/25/50 — because all three of its regions
 * are its own and scale together. This column is mostly **borrowed**: `DayPane`,
 * `SpillTray` and `ExitPanel` were composed against the drawer's 475px of gutter, and
 * their internal arithmetic (the gauge, the stop rail, the three-column disclosure rows)
 * is tuned to about that. A percentage would hand them 320px on a laptop and 700px on a
 * studio display, and both ends look like a different component.
 *
 * So the column is held near the width they were drawn for, and the map — which genuinely
 * does scale — takes whatever is left.
 *
 * **44%, up from 32%.** The first pass sized this to the drawer's 475px on the argument
 * that its borrowed parts are tuned to about that. True, and it treated the drawer's
 * gutter as a ceiling when it is a floor: 475px is what a *drawer over a grid* can afford,
 * not what the route card wants. At 32% the runsheet showed its gauge and one stop before
 * the issues tray cut it off, and the map — which at this zoom is a forty-mile box with
 * four shapes in it — had room it was not using. The column is the interface; the map is
 * the reference beside it. The floor rises with it, so the borrowed parts never get less
 * than they were drawn for.
 */
const FLOW_COLUMN = 'clamp(480px, 44%, 660px)';

/**
 * The surface's gutter — **one number, and everything in the left column is on it.**
 *
 * It was two. The top bar sat on 32px, copied from `navBar.jsx` on the argument that the
 * surface's first band should line up with the page band it replaces; the column under it
 * sat on 20px. Nothing lines up with a page band that is covered by this surface, and what
 * a reader can actually see is the title starting twelve pixels to the right of the `Range`
 * field directly beneath it. A header that does not begin where its content begins is the
 * whole of "the heading looks out of place".
 *
 * **24 rather than 20**, because it is also what the borrowed parts want: `DayPane`,
 * `SpillTray` and `ExitPanel` were composed against the drawer's own 24px gutter, and this
 * column had been giving them 20.
 */
const GUTTER = 24;

/* `MAP_INSET` is gone. The map panel carried 16px of padding, copied from the Workspace's
   `mapPane`, and on this shell it was 16px of white framing a raster basemap that has its own
   edges — so the map read as a picture hung inside the column rather than as the column's
   other half. Removed on instruction; the column border on the left is the only division the
   two panes need. */

/**
 * The overlay sits *beside* the sidebar, not over it, and reads its width from the same
 * variable the Workspace does — see `harmonizeWorkspace.styles.js`, which argues the case
 * at length. Copied by value rather than imported: this is a comparison shell and a shared
 * constant it could edit would be a way for an experiment to move the shipped screen.
 */
const SIDEBAR_INSET_VAR = '--app-sidebar-inset';
const SIDEBAR_Z_INDEX = 998;

export const useStyles = makeStyles((theme) => {
  /* JSS injects before emotion, so a plain rule loses to `.MuiTypography-root`. The
     drawer's sheet explains this at length; the same helper, for the same reason. */
  const w = (styles) => ({ '&&': styles });

  return {
    /* ── The surface ──────────────────────────────────────────────────────────── */
    overlay: w({
      position: 'fixed',
      top: 0,
      right: 0,
      bottom: 0,
      left: `var(${SIDEBAR_INSET_VAR}, 0px)`,
      zIndex: SIDEBAR_Z_INDEX - 1,
      display: 'flex',
      flexDirection: 'column',
      background: theme.palette.surfaceWhite,
      animation: '$overlayIn 380ms cubic-bezier(0.16, 1, 0.3, 1) both',
    }),
    '@keyframes overlayIn': {
      from: { opacity: 0, transform: 'translateY(4px)' },
      to: { opacity: 1, transform: 'translateY(0)' },
    },
    /* ── Leaving, two ways ─────────────────────────────────────────────────────
       **The exit used to be one 220ms fade for both reasons**, so abandoning a proposal
       and committing one looked identical — and the commit, which is the only moment in
       this feature where something is actually written, was the blandest transition on the
       surface. A plain fade also left a dead beat: the overlay finished, *then* the grid
       started animating, so the plan appeared to vanish and something unrelated appeared to
       happen next.

       Two exits now, and they say different things. */

    /* Cancel, Escape, the close button: nothing was written, so nothing is handed over.
       Quick and unremarkable is the correct treatment — it is a panel closing. */
    overlayLeaving: w({ animation: '$overlayOut 200ms ease both' }),
    '@keyframes overlayOut': {
      from: { opacity: 1, transform: 'none' },
      to: { opacity: 0, transform: 'translateY(4px)' },
    },

    /**
     * Apply: **the surface hands its plan to the grid behind it.**
     *
     * Three things carry that, and none of them is a new element — the whole gesture is
     * this rule plus one timing change in `index.jsx`:
     *
     * 1. **It recedes rather than drops.** `scale(1 → 0.965)` with the opacity, where the
     *    plain close nudges *down* 4px. Down reads as dismissal; scaling back into the page
     *    reads as going into what is behind it, which is literally what is happening —
     *    the grid is directly under this overlay.
     *
     * 2. **The columns leave in the order their jobs end.** The map is reference material
     *    and its job ended when the planner decided, so it releases first and fastest. The
     *    plan column holds 90ms longer, so the last thing on screen before the grid is the
     *    thing being handed over. Both drift *up* 6px against the surface's own scale-down,
     *    which is what stops the exit reading as a single flat dissolve.
     *
     * 3. **It overlaps the grid's own motion.** `index.jsx` starts the calendar's apply
     *    sequence at 300ms of this 460ms exit, so the grid's sweep is already crossing the
     *    week while this surface still has ~35% opacity left to give up. The two beats
     *    become one movement seen through a dissolving pane, instead of a fade followed by
     *    a pause followed by something else. That overlap is the whole of "the wizard going
     *    into the routes" — no flying cards, no FLIP against FullCalendar's own nodes.
     *
     * Selected by `data-column`, **not** by a `$flowColumn` rule reference: JSS rule refs do
     * not resolve inside this sheet's `'&&'` wrapper, and the failure is silent and swallows
     * every rule declared after it. `harmonizeFlow.styles.js` records paying for that once
     * on `stopHoverRow`; an attribute selector cannot fail that way.
     */
    overlayCommitting: w({
      animation: '$overlayCommit 460ms cubic-bezier(0.4, 0, 0.2, 1) both',
      '& [data-column="map"]': { animation: '$columnRelease 220ms ease both' },
      '& [data-column="flow"]': { animation: '$columnRelease 300ms ease 90ms both' },
      /* The relocation is the information; this choreography is the telling of it. Reduced
         motion gets the plain close, which is the same call `useApplyMotion` makes about
         the two beats on the grid. */
      '@media (prefers-reduced-motion: reduce)': {
        animation: '$overlayOut 200ms ease both',
        '& [data-column="map"]': { animation: 'none' },
        '& [data-column="flow"]': { animation: 'none' },
      },
    }),
    '@keyframes overlayCommit': {
      from: { opacity: 1, transform: 'scale(1)' },
      /* Holds most of its opacity through the first half so the columns' own exits are
         visible against it, then gives the rest up quickly as the grid takes over. */
      '55%': { opacity: 0.7, transform: 'scale(0.988)' },
      to: { opacity: 0, transform: 'scale(0.965)' },
    },
    '@keyframes columnRelease': {
      from: { opacity: 1, transform: 'none' },
      to: { opacity: 0, transform: 'translateY(-6px)' },
    },

    /* ── Top bar ──────────────────────────────────────────────────────────────── */
    topBar: w({
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      /* `12px` vertical is the Workspace's own, and with the title back at 16px there is
         no longer a 20px cap-height to clear — the 16px band this replaced was propping up
         a heading a size too large. Horizontal is `GUTTER`; see its note. */
      padding: `12px ${GUTTER}px`,
      borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
      flex: '0 0 auto',
      /* Above the ② wash, which is a child of the surface and paints to its edges. */
      position: 'relative',
      background: theme.palette.surfaceWhite,
    }),

    /**
     * The title and its summary, as one group.
     *
     * `baseline`, not `center`: the pair is a 20px `h3` against a 14px `body2`, and centring
     * a gap that wide tilts the row instead of aligning it — the two read as two stacked
     * things on one line. On a shared baseline they read as one line of text at two weights.
     *
     * `minWidth: 0` so the summary can ellipsis rather than push the close button off the
     * right edge on a narrow viewport; the gap is 14 to match the bar's own rhythm.
     */
    titleGroup: w({
      display: 'flex',
      alignItems: 'baseline',
      gap: 14,
      minWidth: 0,
      flex: '0 1 auto',
    }),
    /**
     * **16/600 — the Workspace's own title, copied by value.**
     *
     * This has now been `h6` (12px, far too small — it lost an emphasis contest to the
     * summary beside it) and `h3` (20/700, which overshot). The right answer was already
     * written down one folder over: the *other* full-screen surface in this feature states
     * its title at 16/600/22, and two full-screen shells of the same feature naming
     * themselves at different sizes is the kind of difference a reviewer reads as a mistake
     * rather than as a variation.
     *
     * Not `subtitle1` (16/500/24) even though it is nearly this: the sibling's 600 and 22
     * are what is on screen next door, and matching it exactly is the whole point.
     */
    title: w({
      fontSize: 16,
      fontWeight: 600,
      lineHeight: '22px',
      color: theme.palette.textPrimary,
      flex: '0 0 auto',
    }),
    grow: w({ flex: 1 }),
    /**
     * The run's summary, beside the title.
     *
     * **`body2` (14/400), up from `body3` (12/400)** — and the earlier argument for 12 is
     * what changed rather than being wrong. It was written when this sat alone at the far
     * right of the bar, where "a step under the title" was the only relationship available
     * to express; at 737px from the title, small was the only thing saying *subordinate*.
     * Adjacent to a 20/700 title, the size and weight difference already says it, and 12px
     * next to 20px looked undersized rather than quiet. It stays `textSecondary2`, which is
     * where the subordination now lives.
     *
     * Ellipsis rather than wrap: this is a one-line bar, and at ③ the string grows from a
     * date range to an outturn (`20h17m of 32h · 12 of 15 visits placed`). A wrap would
     * change the bar's height at the moment of the press, which is the drift `RoutePreview`
     * exists to prevent one region down.
     */
    scopeChip: w({
      ...theme.typography.body2,
      color: theme.palette.textSecondary2,
      fontVariantNumeric: 'tabular-nums',
      minWidth: 0,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    }),
    /**
     * The close, and **the reason it looked as heavy as the title.**
     *
     * `close.svg` hard-codes `fill="#323232"` on its path. So every colour rule this button
     * had was inert: `textSecondary3` never applied, the hover never darkened anything, and
     * what actually rendered was a near-black cross at the asset's own 24px — the same
     * visual weight as the 20px bold heading at the other end of the bar, on a control that
     * is supposed to be the quietest thing in it.
     *
     * Overriding the path to `currentColor` is what hands the button back its own states.
     * 16px is the Workspace's own glyph size for the same icon in the same position — it
     * sizes the svg down for exactly this reason and never had to fight the fill, because
     * at 16px near-black reads as a control rather than as a second heading.
     *
     * Done here rather than by editing the asset, which a dozen other screens draw at its
     * intended weight.
     */
    closeButton: w({
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 32,
      height: 32,
      minWidth: 32,
      flex: '0 0 auto',
      padding: 0,
      borderRadius: 6,
      background: 'transparent',
      color: theme.palette.textSecondary3,
      cursor: 'pointer',
      border: 'none',
      transition: 'background 120ms ease, color 120ms ease',
      '& svg': { width: 16, height: 16, display: 'block' },
      '& svg path': { fill: 'currentColor' },
      '&:hover': {
        background: theme.palette.surfaceGreySubtle,
        color: theme.palette.textPrimary,
      },
      '&:focus-visible': {
        outline: `2px solid ${theme.palette.borderBrand}`,
        outlineOffset: 1,
      },
    }),
    /* `configLink` and `configLinkIcon` are **gone with the `Configuration` button they
       dressed** — removed from ① on instruction. `ScopePanel` carries the note. */

    /* ── The two columns ──────────────────────────────────────────────────────── */
    body: w({
      flex: 1,
      display: 'flex',
      minHeight: 0,
      /* Each column scrolls on its own, so the row never does. */
      overflow: 'hidden',
      position: 'relative',
    }),

    /**
     * The left column, and the reason it is `position: relative`.
     *
     * The ② wash is anchored above its own top edge and falls inward — the shape only
     * exists if that edge is the paper's. The drawer learned this the hard way: drawn from
     * inside a scrolling body the aurora was sliced flat at the heading's bottom, and no
     * negative margin reaches a sibling's band. Here the wash is a child of *this* column
     * (② happens in this column, not across the screen), so this is what clips it and
     * everything inside has to paint above it.
     */
    flowColumn: w({
      flex: `0 0 ${FLOW_COLUMN}`,
      minWidth: 0,
      minHeight: 0,
      display: 'flex',
      flexDirection: 'column',
      borderRight: `1px solid ${theme.palette.borderSubtle1}`,
      position: 'relative',
      overflow: 'hidden',
      background: theme.palette.surfaceWhite,
    }),

    /* ── ① Scope, which never leaves ──────────────────────────────────────────
       In the drawer, ① is *replaced* by ③ — one pane, one state at a time. A column
       twice the height has no such constraint, and keeping the range on screen is
       what makes re-harmonizing a thought rather than a trip backwards: change the
       dates, watch the pills change, press the button again. It is also why this
       shell's footer carries only Apply. There is nothing to go back to. */
    scopeSection: w({
      flex: '0 0 auto',
      position: 'relative',
      padding: `16px ${GUTTER}px 0`,
      background: theme.palette.surfaceWhite,
    }),
    /**
     * ① once a plan exists.
     *
     * **It dims nothing, and that is a reversal.** The first pass took it to 72% opacity on
     * the argument that ① is context rather than the subject at ③ — which is true of the
     * *figures* and false of everything else in the band: the pills are the map's control
     * and the range picker is the thing a planner reaches for when the answer is wrong.
     * Greying a row that is still meant to be used is a worse signal than leaving it alone,
     * and it made the pill for the open day look disabled.
     *
     * Folding is what says "subordinate" here — the figures go, the controls stay at full
     * strength — so this is left with only the tightening the fold makes possible.
     */
    scopeSectionQuiet: w({ paddingTop: 12, paddingBottom: 0 }),
    /* ── Type comes from the scale, not from numbers ──────────────────────────
       Every rule below that carries text spreads a `theme.typography.*` role. The
       first pass wrote raw sizes — 18/600 figures, 13/600 pill days, an 11px
       uppercase stat label — which put four sizes on this column that exist nowhere
       else in the product. The roles are the same ones `harmonizeFlow.styles.js`
       reaches for, so the two shells read as siblings rather than as two people's
       idea of a settings panel. */
    fieldLabel: w({
      ...theme.typography.subtitle2,
      color: theme.palette.textSecondary2,
      display: 'block',
      marginBottom: 8,
    }),
    /**
     * The range field's row.
     *
     * **The hairline under it is gone.** It was there to stop `Scope` reading as a label
     * belonging to the picker above it — a real problem when the two blocks differed only
     * by a gap. `Scope` now sits inside its own grey container, which separates the two far
     * more plainly than a rule can, so a rule 16px above that container's top edge is a
     * second separator doing the first one's job. Two separators that close together are
     * texture rather than structure — the correction `harmonization-settings.md` §5 records
     * making across a whole screen.
     *
     * The spacing stays. It was never the rule that was carrying the separation here.
     */
    /* 8, not 14. The drawer's `statRow` brings its own `marginTop: 12`, so 14 here stacked to
       26px above the figures against 18px below them — the block read as hanging off the field
       rather than sitting between it and the list. 8 + 12 = 20 above, 18 below. */
    rangeRow: w({ paddingBottom: 4, marginBottom: 8 }),
    rangePicker: w({ width: '100%' }),

    /**
     * ① Scope — **loose on the paper, not in a container.**
     *
     * It was a grey box, asked for at the time (*"Scope should be grey container/box. This
     * gray is going to be subtle and light"*) and argued for on the grounds that Scope is the
     * one region of this column **quoted rather than authored** — a read-only mirror of Config
     * A sitting directly under a field the planner does edit.
     *
     * **The grey is now gone**, on instruction. It was `surfaceGreySubtle` at radius 10, argued
     * for because Scope is the one region of the column *quoted* from Config A rather than
     * authored, sitting directly under a field the planner edits — so a container marked it as
     * a reading rather than a decision.
     *
     * That argument was answered by the screen changing under it. ① is a **list** now, and the
     * list's own rows carry a hover ground and a hairline header: a filled panel above them
     * made two competing surfaces in a column that had none, and the figures — which are the
     * denominator for everything below — read as a boxed aside rather than as the column's
     * opening statement.
     *
     * So no fill, no border, and no radius. What separates it from the list is the list's own
     * header rule plus the space above it, which is one separator doing one job.
     */
    /* 6, not 18. `statRow`'s own `marginBottom: 12` is already below the figures, so 18 here
       stacked to 30 and opened a gap wider than the one between the field and the figures. */
    scopeBox: w({ paddingBottom: 6 }),

    /* `sectionHead` and `sectionHeading` are **gone**, and with them the `Scope` word and
       the `Configuration` link that sat opposite it. Both removed on instruction; the
       argument for each is in `ScopePanel`. The box below them keeps its own padding, so
       nothing had to move to close the gap. */

    /* ── ① folded ──────────────────────────────────────────────────────────────
       **Gone.** Six rules (`foldedRow`, `foldedSpacer`, `foldedChip`, `foldedChipText`,
       `foldedChevron`, `foldButton`) dressed a `15 Aug – 21 Aug ▾` chip and the `Hide`
       button that collapsed to it. The control was removed on instruction and the rules
       went with it rather than being left for a reader to wonder about — `ScopePanel`
       carries the argument, including why an *automatic* fold was reversed before the
       manual one was cut. */

    /* ── The day tabs ──────────────────────────────────────────────────────────
       **A segmented control, not an underlined tab strip — and this is a replacement of the
       drawer's chrome rather than a composition onto it.**

       Everything came from `harmonizeFlow.styles.js` before: 14/500 in `textPlaceholder`,
       `4px 4px 12px`, a 2px `borderBrand` rule under the selected one and a `borderSubtle1`
       hairline under the row. The argument for taking it was that a private tab treatment
       inside this feature would read as a different application from the schedule page behind
       it, and `splitTab` added a grand total of 2px of left padding on top.

       That treatment is what has now been replaced, on instruction — *"the tabs are not
       clearly visible at the moment"* — and the diagnosis is right for a reason specific to
       this shell rather than to the underline pattern. A 2px rule under a label is enough when
       a tab strip is the loudest thing in its band. Here the row sits between a filled
       forecast box above it and a route card with a tinted region and a gauge below it, and a
       hairline-plus-underline is the quietest chrome on the screen at the exact moment it is
       the control the planner is meant to press. So each day becomes a **box you can see**: a
       bordered container at rest, a filled brand container when selected.

       **The drawer keeps the underline.** These are handed to `DayTabRow` through
       `drawerClasses`, which overrides `tab`/`tabSelected`/`tabRow` by key, so the drawer's
       own sheet is untouched and its strip is unchanged. That is deliberate: Drawer↔Split is a
       comparison, and this is a difference in the shell, which is what the comparison is
       about. The two rows still share every *behaviour* — `DayTabRow` is one component — and
       differ only in the classes it is handed.

       Not composed with the drawer's rules, either. `w()` compiles each key to a doubled
       selector of equal specificity, so a Split rule layered over a drawer rule would be
       decided by whichever sheet the injector happened to emit first — and these two live in
       different files. Replacing the class is the only version of this that cannot silently
       lose. */
    splitTabRow: w({
      display: 'flex',
      alignItems: 'center',
      /* 8px, where the underlined row used 20. An underlined tab needs air around its label
         because the label *is* the tab and nothing else bounds it; a bordered box carries its
         own edge, so the gap only has to separate two boxes. 20px between containers reads as
         three unrelated buttons rather than as one control with three positions.

         It stays 8 as the boxes grow. A gap that scaled with the tabs would separate them
         further at the moment they became more clearly one control — the ratio of gap to box
         is what makes a row of boxes read as a segmented control rather than as three
         buttons, and growing the boxes alone tightens that ratio in the right direction. */
      gap: 8,
      marginTop: 14,
      /* **No hairline under the row.** It was the underline pattern's baseline — the thing the
         selected tab's 2px rule sat on and interrupted. With boxes there is nothing to
         interrupt it, so it would just be a rule under some buttons, and it was one of the two
         indistinguishable `borderSubtle1` lines 90px apart the deleted `RoutePreview` recorded
         fighting with. */
      overflowX: 'auto',
      /* 2px of vertical room for the focus ring, which a box tab draws outside its own edge
         where an underlined one had 12px of padding to draw inside. */
      padding: '2px 0',
      scrollbarWidth: 'none',
      '&::-webkit-scrollbar': { display: 'none' },
    }),

    /**
     * **Bigger, on instruction** — *"make them a little bigger and make them more prominent."*
     *
     * Three changes, and only one of them is size:
     *
     * - **`subtitle1` (16/500) over `subtitle2` (14/500).** One step up the scale the product
     *   already has, not an invented figure. 16px is the size the route title below it uses, so
     *   the tab row now reads at the same weight as the thing it selects rather than as chrome
     *   above it.
     * - **`10px 15px` of padding over `6px 12px`**, which takes the box from 34px tall to 42px.
     *   The vertical growth is the larger share deliberately: a tab is hit with a pointer along
     *   its whole width already, and it was the *height* that made the row read as a strip of
     *   labels rather than as a set of buttons.
     * - **Radius 10 over 8**, tracking `scopeBox`'s own 10 now the box is the same order of
     *   size as it.
     *
     * They earn the room because the row is no longer competing for it. It used to sit at ①
     * above a route header and an empty state; ① is the visit list now and the tabs only exist
     * once there is a plan, so at ③ this is the first thing under the summary box and the
     * control the planner reaches for first.
     */
    /**
     * **A compact card: the day, then what is on it.**
     *
     * The shape comes from a supplied reference — a rounded card with the weekday over the
     * date over an `N Visits` line, the selected one filled solid. The instruction with it was
     * *"use somewhat this design… These are too big. reduce them a little bit"*, so the
     * structure is taken and the scale is not:
     *
     * - **Weekday and date share one line.** The reference stacks them, which is most of what
     *   makes its card tall; `Mon 17` on one line loses nothing a planner reads.
     * - **13.5/600 and 11.5/400**, against the reference's ~20px and ~15px.
     * - **`8px 13px` of padding** and a 3px gap, giving a card about 88×54 rather than the
     *   reference's ~250×340 at its own zoom.
     *
     * This is the third size this row has been: a 14px underlined label, then a 16px box at
     * `10px 15px` (42px tall, one line), now a two-line card at 54px. The middle one grew on
     * the instruction to make the tabs prominent and was overshot; what actually reads as
     * prominent here is the **filled card**, not the type size.
     */
    splitTab: w({
      display: 'flex',
      flexDirection: 'column',
      /* Centred, as the reference has it — a card's content sits in the card rather than
         hanging off its left edge, and centring is what stops a two-line block from reading as
         a list item with an indent. */
      alignItems: 'center',
      justifyContent: 'center',
      gap: 2,
      flex: '0 0 auto',
      minWidth: 84,
      whiteSpace: 'nowrap',
      cursor: 'pointer',
      borderRadius: 10,
      /* 6px, down from 8: `subtitle2`/`subtitle3` bring 20px and 18px line boxes where the
         off-scale pair brought 18 and 15, so the padding gives back the 5px the correct roles
         cost and the card stays at the 54px it was measured at. */
      padding: '6px 13px',
      /**
       * **`borderSubtle2` on a transparent ground, and both halves of that were measured.**
       *
       * This first shipped as `borderSubtle1` on `theme.palette.surface`, and neither did what
       * it says. **There is no `surface` token** — the white in this palette is `surfaceWhite`
       * — so the declaration resolved to the tenant theme's own fallback and painted the
       * resting tabs a grey slab. Worse, `borderSubtle1` (`#e6e6e7`) against that grey measured
       * **1.08:1**: the bordered container had no visible border at all.
       *
       * Transparent is also right rather than merely correct — *unfilled* is what an unselected
       * segment should be, and at ③ it lets the plan region's own wash through, so the row
       * belongs to the band it sits in.
       */
      border: `1px solid ${theme.palette.borderSubtle2}`,
      background: 'transparent',
      color: theme.palette.textSecondary1,
      transition: 'background 140ms ease, border-color 140ms ease, color 140ms ease',
      /* Scoped away from the drag verdicts for the reason the drawer's own `tab` records: the
         doubled hover selector outranks a single-class modifier, so without this, resting the
         pointer on a refused tab repaints it as an ordinary hover. */
      '&:hover:not($splitTabSelected):not($splitTabDropLegal):not($splitTabDropRefused)': {
        borderColor: theme.palette.borderStrong1,
        color: theme.palette.textPrimary,
      },
      '&:focus-visible': { outline: `2px solid ${theme.palette.borderBrand}`, outlineOffset: 2 },
    }),

    /* Line one. 600 rather than 700: the card is doing the emphasis. */
    /**
     * Line one — **`subtitle2` exactly, no px overrides.**
     *
     * It shipped as `fontSize: 13.5, fontWeight: 600`, and a type census of this column caught
     * it: 13.5/600 and 11.5/400 existed **nowhere else on the screen**, which are the only two
     * off-scale sizes in it. That is the same fault this surface has already been corrected for
     * once — an earlier pass wrote 18/600 figures, 13/600 pill days and an 11px uppercase stat
     * label, and the rule that came out of it is that type comes from `theme.typography` roles
     * and never from raw px.
     *
     * `subtitle2` is 14/500/20, which is already in this column twice (`Range`, the footer's
     * button). 500 also happens to be the lighter weight that was asked for.
     */
    splitTabDay: w({ ...theme.typography.subtitle2, color: 'inherit' }),

    /* Line two, and the overrun dot rides with it rather than beside the date. */
    splitTabCountRow: w({ display: 'flex', alignItems: 'center', gap: 5 }),

    /**
     * The count — **`3 visits`, spelled out, and no longer a pill.**
     *
     * It was a grey `surfaceGreySubtle` pill beside the date. A pill inside a bordered card is
     * a box in a box, and on the filled selected card its grey ground fought the brand. Plain
     * inheriting text on its own line is what the reference does and it costs nothing.
     *
     * `opacity` rather than a colour, so one value works on both cards: white ink over the
     * brand fill and grey ink over white are the *same relationship* — a count subordinate to
     * the date above it — and a second colour token would have to be picked twice.
     */
    /**
     * Line two — **`subtitle3`, and at full strength on the filled card.**
     *
     * `subtitle3` is 12/500/18, the size the route caption under this row already uses, so the
     * card's two lines are two roles this column already speaks rather than two invented sizes.
     *
     * **The 0.72 opacity is gone, and that is a contrast fix rather than a style change.**
     * Measured on the selected card: white at 0.72 over `#2DA551` composites to about
     * `#C4E6CE`, which is **2.35:1** against the fill it sits on — well under any threshold, and
     * materially worse than the day line above it. At full white it is 3.18:1, the same as the
     * day line and the same as every primary button in this product (`primary.contrastText` is
     * hardcoded `#ffffff`).
     *
     * **That 3.18:1 is a real debt and it is the product's, not this row's.** White on
     * `surfaceBrand` clears 4.5:1 on the Signal tenant (4.55) and fails on Filter Go's green
     * (3.18); dark ink inverts it exactly — 4.75 on the green, 3.30 on the blue — so no single
     * ink is safe for both while the fill is the brand colour at full saturation. Nothing in
     * the palette fixes it either: `brandHover` is 4.18 and `brandSecondary` is a *different
     * hue* per tenant (orange on Signal), so neither is a darker-brand token. Clearing this
     * needs a `brandStrong` token that is dark enough for white in every tenant — which is a
     * palette change, not a tab change. This row is deliberately no worse than the button in
     * its own footer.
     *
     * Hierarchy therefore comes from size and weight alone, which is enough: 12/500 under
     * 14/500 reads as subordinate without help from opacity.
     */
    splitTabCount: w({
      ...theme.typography.subtitle3,
      color: 'inherit',
      fontVariantNumeric: 'tabular-nums',
    }),

    /**
     * The selected day — **a solid brand card.**
     *
     * Asked for directly: *"give the selected one primary green fill."* It reverses an earlier
     * subtle-fill pass, whose argument was that a second solid green block above the footer's
     * primary button would make the row look like it held the primary action. That argument is
     * weaker at ③, where the footer reads `Apply 3 routes` and this row is the first thing under
     * the figures — and a segmented control whose selected segment is *filled* is the plainest
     * statement of "this one" there is.
     *
     * The white ink settles a contrast problem the subtle fill had as a side effect:
     * brand-on-brand-subtle measured **2.87:1** on this tenant and had to borrow `textPrimary`
     * to be readable at all. White on `surfaceBrand` is a standard button pairing.
     *
     * **This rule was accidentally deleted once** — swallowed by an edit that replaced the block
     * from `splitTab` up to the count's comment — and the symptom was quiet: the selected card
     * rendered identical to the unselected ones, with no error, because `DayTabRow` composes
     * `classes.tabSelected` and an undefined class is simply absent. `splitTab`'s own
     * `:hover:not($splitTabSelected)` also silently loses its guard. If the selected tab ever
     * looks unstyled again, check that this key still exists before anything else.
     */
    splitTabSelected: w({
      background: theme.palette.surfaceBrand,
      borderColor: theme.palette.surfaceBrand,
      color: theme.palette.surfaceWhite,
    }),

    /* The `+` tab: the same box, dashed and unlabelled. Dashed because it does not *select* a
       panel, it makes a new one — the one thing in this row that is not a position of the
       control. Square, since there is no label to set its width. */
    splitTabAdd: w({
      flex: '0 0 auto',
      display: 'grid',
      placeItems: 'center',
      /* Square at the tabs' own height, so the row has one baseline and one cap line. This
         tracks `splitTab`'s box: 16px line box + 2×10 padding + 2×1 border = 42. */
      width: 42,
      height: 42,
      borderRadius: 10,
      border: `1px dashed ${theme.palette.borderStrong1}`,
      background: 'transparent',
      color: theme.palette.textSecondary3,
      cursor: 'pointer',
      transition: 'color 140ms ease, border-color 140ms ease',
      '&:hover': { color: theme.palette.textBrand, borderColor: theme.palette.borderBrand },
      '&:focus-visible': { outline: `2px solid ${theme.palette.borderBrand}`, outlineOffset: 2 },
    }),

    /* ── ④ drag verdicts, on a box tab ────────────────────────────────────────
       The drawer's own verdicts are a dashed *bottom border* plus a ground, with the top two
       corners rounded — a treatment built for a tab that has only its underside to draw on. A
       box has all four sides, so the verdict is the whole border: dashed the full way round,
       which reads as "a target" in a row whose resting state is a solid edge. The grounds and
       inks are the drawer's own values, including its note that the legal verdict takes
       `textPrimary` rather than `textBrand` because brand-on-brand-subtle is 2.87:1 on the
       FilterGo tenant — which would have made the *legal* verdict harder to read than the
       refusal beside it. */
    splitTabDropLegal: w({
      background: theme.palette.surfaceBrandSubtle,
      borderColor: theme.palette.borderBrand,
      borderStyle: 'dashed',
      color: theme.palette.textPrimary,
    }),
    splitTabDropRefused: w({
      background: theme.palette.surfaceAlertSubtle,
      borderColor: theme.palette.borderAlert,
      borderStyle: 'dashed',
      color: theme.palette.textAlert,
    }),

    /* ── The forecast ──────────────────────────────────────────────────────────
       **Not here any more — it is the drawer's.** `statRow`, `stat`, `statValue`,
       `statValueWarn` and `statLabel` are handed to `ScopePanel` off
       `harmonizeFlow.styles.js` by `index.jsx`, so the summary box is literally the drawer's
       component rather than a copy that resembles it. Asked for directly.

       What went with that: `statLines`, `statCounts`, `statCount`, `statCapacity`,
       `statCapacityRow`, `statUnit`, `statBar`, `statBarFill` and `statBarOver` — the whole
       two-counts-and-a-meter pass, including the 4px hours bar. `ScopePanel` carries the
       argument that was overruled. `scopeBox`, the grey container around them, is still
       Split's own; the drawer has no equivalent. */

    /* ── ① — the visit pick list ────────────────────────────────────────────────
       The rows are the *route's* rows, imported — see `VisitPickList`, which owns the
       reasoning. What lives here is the section around them and the three `stop*` keys that
       had to be overridden because this list has no sequence in it. */
    pickSection: w({ paddingTop: 0 }),

    /* ② — the orb's own slot, now that it no longer runs inside a route card. Centred in
       whatever height the body has. */
    /**
     * ② — the orb's slot, **filling the body so it centres in it.**
     *
     * `minHeight: 260` with `justify-content: center` centred the orb in 260px at the *top* of
     * a 480px body, which put it about a third of the way down and left a field of green
     * beneath it. Asked for directly: *"fix the mascot's positioning. Place it in the middle."*
     *
     * `position: absolute; inset: 0` rather than a height percentage: `planBody` is a
     * `overflowY: auto` block, so a `height: 100%` child resolves against a container whose
     * height is content-derived and the centring goes back to being relative to nothing.
     * `planBody` already carries `position: relative`, so filling it is exact — and while ②
     * runs there is nothing else in that box to overlap.
     */
    computingSlot: w({
      position: 'absolute',
      inset: 0,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
    }),

    /* Heading left, the one column label right, on a shared baseline. `space-between` on a
       baseline rather than two stacked rows: a 12px label alone on a line reads as floating
       rather than as belonging to the numerals under it. */
    pickHead: w({
      display: 'flex',
      alignItems: 'baseline',
      justifyContent: 'space-between',
      gap: 8,
      paddingBottom: 8,
      marginBottom: 4,
      borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
    }),
    pickHeading: w({
      ...theme.typography.h4,
      /* `h4` is 700, a step heavier than a heading earns beside a 12px column label. The
         drawer's own `sectionHeading` makes the same adjustment. */
      fontWeight: 500,
      color: theme.palette.textPrimary,
    }),
    /* `pickHeadNum` is **gone with the `Filters` column label** — it named the wrong column
       (the figure pair is right-aligned as a unit, so a label on that edge sat over the
       duration) and there is no bare numeral left to name now that the count is in the meta
       line. `VisitPickList` carries the argument. */

    pickList: w({ display: 'flex', flexDirection: 'column' }),

    /**
     * The row's frame — **and the pitch is the point of it.**
     *
     * The workspace's `stopLine` carries `marginBottom: 28` against `stopTrackColumn`'s
     * `-28`, one mechanism whose only job is to let the dashed connector run out of the
     * painted box and across the gap to the next pin. This list has no connector, so the 28px
     * is dead air — and fifteen visits at that pitch is about 900px of scrolling through a
     * list whose whole purpose is to be read before anything is decided.
     *
     * `pickTrackColumn` drops the negative twin in the same breath. They move together or the
     * dash stops short of the next pin; here neither exists, and leaving one behind would be a
     * row whose box and whose column disagree about where it ends.
     *
     * Everything else is the workspace's: `stretch`, the 8px column gap, the 6/8 padding and
     * the hover ground, so the row a planner ticks at ① is the row they read at ③.
     */
    pickStopLine: w({
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'stretch',
      gap: 8,
      padding: '7px 8px',
      marginBottom: 2,
      borderRadius: 8,
      cursor: 'default',
      transition: 'background 120ms ease',
      '&:hover': { background: theme.palette.surfaceGreySubtle },
    }),
    /* The pin's column, without the connector's overhang. `center`, because with the dash
       hidden the pin is the column's only child and would otherwise hang from the top of a
       two-line row instead of sitting on the name's own centre line. */
    /* `display: none` — the pin came off the row on instruction, so the 16px column that held
       it would be 16px of nothing plus the row's 8px gap. */
    pickTrackColumn: w({ display: 'none' }),
    /* `display: none`, not a transparent colour — a hidden-but-present rule is a `flex: 1`
       child that still claims height in a stretch row. */
    pickTrackHidden: w({ display: 'none' }),

    /* A cleared row dims. It does not strike through, reorder, or lose its figures — it is
       still a visit, and every fact about it is still true; it is simply not in this run.

       **`pickRowOut` is gone and the opacity is set inline**, because the class version
       measurably did not apply — live sheet, matching selector, only opacity rule on the
       element, and `getComputedStyle` still returned 1. Second instance of the pathology
       `planRegion`'s `--plan-wash` records; `VisitPickList` carries the evidence. Only the
       toggled declaration moved — the transition works fine as a class. */
    pickRow: w({ transition: 'opacity 160ms ease' }),

    /* 16px, matching the drag handle it stands in for, so the site name starts at the same x
       in this list as in the route's. MUI's own `size="small"` root carries 9px of padding
       and a 20px glyph, both of which have to go for that to hold. */
    pickCheckbox: w({
      '&.MuiCheckbox-root': {
        width: 16,
        height: 16,
        padding: 0,
        flexShrink: 0,
        marginTop: 3,
        alignSelf: 'flex-start',
      },
      '& svg': { fontSize: 18 },
    }),

    pickHint: w({
      ...theme.typography.body2,
      color: theme.palette.textSecondary2,
      marginTop: 10,
    }),

    /* Skeletons, while ① recomputes its forecast. Same 420ms hold as the drawer. */
    skeletonBar: w({
      borderRadius: 4,
      background: theme.palette.surfaceGreySubtle,
      animation: '$pulse 1200ms ease-in-out infinite',
    }),
    '@keyframes pulse': {
      '0%, 100%': { opacity: 1 },
      '50%': { opacity: 0.45 },
    },
    /* Skeleton shapes that match the forecast's own layout rather than a generic pair of
       bars: two count phrases on one line, then a figure and a full-width track. A skeleton
       whose silhouette differs from what replaces it is a second layout shift 420ms after
       the first. */
    skeletonStatValue: w({ width: 78, height: 20 }),
    skeletonStatBar: w({ width: '100%', height: 4, borderRadius: 24 }),

    /* ── The plan region ──────────────────────────────────────────────────────── */
    /**
     * The optimizer's half of the column, and it is tinted.
     *
     * **A soft brand wash instead of the flat grey it had.** Grey said "inactive area";
     * what this region actually is, is the part of the screen the machine wrote. The
     * Workspace makes the same claim with a pulsing glow over its routes pane and the
     * drawer with an aurora behind ② — this is the quiet, static member of that family:
     * a single gradient falling from the top edge, present whether or not a run has
     * happened, because the region belongs to the optimizer either way.
     *
     * `color-mix` against `surfaceBrand` rather than a literal, so a tenant whose brand is
     * not this green gets their own wash rather than somebody else's. Kept under 8% at the
     * strongest: past that it stops being a tint and starts competing with the amber a
     * gauge uses to say a day is over.
     */
    /**
     * The optimizer's half of the column.
     *
     * ## The wash now says *thinking*, not *whose region this is*
     *
     * It was a static brand gradient, on at full strength in every state, and the argument
     * for that was ownership: this is the part of the screen the machine wrote, so it is
     * marked, the same claim the Workspace makes with a pulsing glow over its routes pane.
     * That argument is sound and it is not what a colour this prominent is read as. Asked
     * to change it: *"the green colour will only come when the AI is thinking, and it will
     * fade into a subtle colour once the AI is done thinking."*
     *
     * Which is a better use of the same ink. A tint that is always on is scenery — it says
     * nothing, because it never changes. Tied to ②, it becomes the region's own account of
     * its state, and it lines up with the aurora that already runs behind the orb: the
     * whole column warms while the engine is working and cools when it hands over. Three
     * states, and the copy names all three:
     *
     * | State | Wash |
     * | --- | --- |
     * | ① nothing has run | **none** — an empty region has nothing to claim |
     * | ② thinking | **full** — 9%/4%, a step up from the old always-on 7%/3% |
     * | ③ answered | **subtle** — the same gradient at 30%, so ~2.7% at the top edge |
     *
     * ## Why the gradient is on a pseudo-element, and the level on a custom property
     *
     * The gradient is on `::before` because it has to *fade*, and `background-image` is not
     * an animatable property — a gradient swapped for another gradient cuts, however long a
     * `transition` is declared on it. So one gradient is painted once and only its
     * `opacity` moves, which is animatable and compositor-cheap.
     *
     * The **level** is a custom property set inline rather than two modifier classes, and
     * that is a correction rather than a preference. The first build had
     * `planRegionThinking`/`planRegionSettled` each re-declaring `&::before { opacity }`.
     * Every part of that looked right — same sheet, modifiers after the base rule, equal
     * specificity so source order decides, and `element.matches()` confirmed live that the
     * modifier applied — and the pseudo-element still computed `0` in all three states. A
     * detached probe carrying the identical pair of classes computed `0.3` correctly, so
     * the rules were fine and something about resolving them against *this* element, with a
     * transition declared on the same property, was not.
     *
     * Rather than keep guessing at that, the level is now a value instead of a cascade
     * question. `--plan-wash` is set on the element and read by the pseudo-element, which
     * works because custom properties inherit into generated content — the same mechanism
     * `--zone` uses for the day tabs' colour dot and `--apply-delay` for the grid's sweep
     * wave, both already load-bearing in this feature. One declaration, no modifier
     * classes, and the state is legible in the JSX rather than spread across three rules.
     *
     * `700ms ease` both ways: slow enough to read as light changing rather than a class
     * swapping, short enough to be over before a planner has finished the first stop row.
     * Under `prefers-reduced-motion` the transition goes and the three levels stay — the
     * state is information, the fade is the telling of it, the same split `useApplyMotion`
     * makes.
     *
     * The layer is `inset: 0` on a `position: relative` parent and comes first in tree
     * order, so every positioned child — the tab band, the body, the trail, the tray, the
     * footer — paints above it without needing a `z-index`.
     */
    planRegion: w({
      flex: 1,
      minHeight: 0,
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      background: theme.palette.surfaceWhite,
      /**
       * **There is no rule under the Scope box, and that is the audit's answer rather than
       * a preference.**
       *
       * It began as a full-width `borderTop` on this region, was inset to the column gutter to
       * stop it disagreeing with the day tabs' underline, and measuring it then showed the
       * inset was fixing the wrong thing. Two numbers settled it: the hairline sat **0px**
       * from the Scope box's own bottom edge — the same pixel row — and the next hairline,
       * the tab row's underline, was **54px** below it in the identical `borderSubtle1`. So
       * it was not separating the question from the answer; it was thickening the bottom edge
       * of a filled box, and duplicating a rule just below it.
       *
       * The boundary was never missing. The grey box's own fill edge ends the scope region,
       * `planRegion`'s wash marks the machine's half whenever a run is on, and the tab
       * underline draws the line 54px down. This is the same correction the range field got
       * earlier in the same pass, and the one `harmonization-settings.md` §5 records making
       * across a whole screen: a rule that close to another rule separates nothing, it is
       * texture.
       *
       * The 16px of air between the box and the tabs is `tabRow`'s own `marginTop`, so
       * nothing had to be added to replace the rule.
       */
      '&::before': {
        content: '""',
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        /* Defaults to nothing, so a state that forgets to set the property is off rather
           than permanently green. */
        opacity: 'var(--plan-wash, 0)',
        transition: 'opacity 700ms ease',
        /* `color-mix` against `surfaceBrand` rather than a literal, so a tenant whose brand
           is not this green gets their own wash rather than somebody else's. */
        backgroundImage: `linear-gradient(
          180deg,
          color-mix(in srgb, ${theme.palette.surfaceBrand} 9%, ${theme.palette.surfaceWhite}) 0%,
          color-mix(in srgb, ${theme.palette.surfaceBrand} 4%, ${theme.palette.surfaceWhite}) 42%,
          ${theme.palette.surfaceWhite} 100%
        )`,
        '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
      },
    }),
    /* The tabs pin to the top of the region while the runsheet under them scrolls — they
       are ④'s drop targets, and a target that scrolls away from the pointer carrying
       something towards it is not a target. Transparent, so the wash runs behind them rather than starting under them —
       rather than starting under them: the tabs are part of the generated region, not a
       lid on it. */
    /* The band's own top and bottom, where it had none and inherited whatever the region's
       edge and the route header happened to leave. 14 above sits the row off the wash's edge;
       10 below is deliberately tighter than that, so the row reads as belonging to the route
       under it rather than floating between two things. */
    planTabBand: w({
      flex: '0 0 auto',
      padding: `14px ${GUTTER}px 10px`,
      position: 'relative',
    }),
    planBody: w({
      flex: '1 1 auto',
      minHeight: 0,
      overflowY: 'auto',
      overflowX: 'hidden',
      padding: `0 ${GUTTER}px`,
      position: 'relative',
      /**
       * **The scrollbar is taken out of layout, so a row's fill never depends on it.**
       *
       * A classic scrollbar narrows its scroll container's *content box*, so every visit row
       * inside this panel measured 8–16px narrower than the identical row in the issues
       * accordion — whose scrollbar is already hidden — and the hover fill's right edge moved
       * depending on whether the list happened to overflow. The row's padding is a constant
       * 12px either way; what shifted was the box that padding sits in, which is the same
       * thing to a reader and worse for being conditional.
       *
       * Hiding it is the only option that makes the row genuinely scrollbar-independent:
       * reserving a gutter still costs the width (and its size is browser-dependent), and
       * showing one everywhere re-breaks the accordion's total-vs-figure alignment, whose
       * bar sits outside the scroll box. Scrolling itself is untouched — wheel, trackpad,
       * keyboard and programmatic scrolling all still work; only the painted bar is gone,
       * exactly as `tabRow` and `spillBody` in the drawer's sheet already do it.
       *
       * The cue for "there is more" is the row cut off at the fold. If that proves too
       * quiet, add `tabRowScrollable`'s fade turned vertical — never the scrollbar back,
       * or this drifts again.
       */
      scrollbarWidth: 'none',
      '&::-webkit-scrollbar': { display: 'none' },
    }),

    /* ── The route card before there is a route ────────────────────────────────
       See `RoutePreview` for why the header exists this early. These are the only two
       rules it needs that the drawer's sheet does not already supply. */

    /* ── The column's footer: the write, and what it costs ────────────────────── */
    footerBand: w({
      flex: '0 0 auto',
      position: 'relative',
      /* Even top and bottom now that the note above the buttons is gone — it was carrying
         the extra 4px the note's own descender needed. */
      padding: `16px ${GUTTER}px`,
      borderTop: `1px solid ${theme.palette.borderSubtle1}`,
      background: theme.palette.surfaceWhite,
      boxShadow: `0 -6px 16px ${EDGE_SHADOW}`,
    }),
    footer: w({ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 10 }),
    /* `footerRerun` is gone with the `Harmonize again` button it left-aligned — see the
       footer note in `index.jsx` for why that control was redundant rather than misplaced,
       and what replaced it. The footer is a single primary now, so nothing needs pushing to
       the left. */

    /* ── The map column ───────────────────────────────────────────────────────── */
    mapColumn: w({
      flex: 1,
      minWidth: 0,
      minHeight: 0,
      display: 'flex',
      flexDirection: 'column',
      background: theme.palette.surfaceWhite,
    }),

    srOnly: w({
      position: 'absolute',
      width: 1,
      height: 1,
      padding: 0,
      margin: -1,
      overflow: 'hidden',
      clip: 'rect(0 0 0 0)',
      whiteSpace: 'nowrap',
      border: 0,
    }),

    /**
     * `routeBody`, with this column's own padding.
     *
     * `minHeight: '100%'` was here for `RoutePreview`'s empty state — it made that card's
     * `flex: 1` body mean something so the note and the orb could centre in the scrollport.
     * That card is deleted and ② centres itself now (`computingSlot`), so this is doing
     * nothing but claiming the scrollport's height for the solved card, which is taller than it
     * anyway. Kept because `min-height` cannot shrink the card and removing it is a change with
     * no observable effect either way; it is the padding that earns this key.
     */
    flowRouteBody: w({
      paddingTop: 12,
      paddingBottom: 12,
      minHeight: '100%',
      boxSizing: 'border-box',
    }),
  };
});
