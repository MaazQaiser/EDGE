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

/**
 * The amber warning **text** is written in.
 *
 * `textWarning` (`#f19f02`) is an amber-500 — about 2.2:1 on white, fine for a bar or a
 * border and nowhere near enough for a figure. The drawer names the same value for the
 * same reason; copied by value so the two shells say *this does not fit* in one voice.
 */
const WARNING_INK = '#B54708';

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
    /**
     * The way out to Config A — the theme's own `onlyText` button, not a hand-rolled link.
     *
     * It was an `<a>` with its own colour and its own hover underline, which is a fourth
     * link treatment in an app that already has one. `onlyText` is the link-button variant
     * (`textBrand`, 14/500, no underline, `textBrandHover` on hover) and the drawer's own
     * `sectionAction` already dresses it exactly this way; copied by value, including the
     * negative margin that pulls the button's padding back so its label sits flush with
     * the gutter the heading starts from.
     *
     * Still an anchor underneath (`component="a"`, `target="_blank"`) — this surface holds
     * unsaved work, so following it in place would discard a proposal to look at a setting.
     */
    configLink: w({
      '&.MuiButton-root': {
        flex: '0 0 auto',
        minWidth: 0,
        height: 'auto',
        padding: '2px 6px',
        marginRight: -6,
        display: 'flex',
        alignItems: 'center',
        gap: 5,
        textDecoration: 'none',
      },
    }),
    configLinkIcon: w({ fontSize: 14 }),

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
    rangeRow: w({ paddingBottom: 4, marginBottom: 14 }),
    rangePicker: w({ width: '100%' }),

    /**
     * ① Scope, in a **container** rather than loose on the paper.
     *
     * Asked for directly: *"Scope should be grey container/box. This gray is going to be
     * subtle and light."* And it earns the box, because Scope is the one region of this
     * column that is **quoted rather than authored** — the heading, the three figures and
     * the way out to Settings are all a read-only mirror of Config A, sitting directly under
     * a field the planner does edit. A container is how this product already distinguishes
     * *what you set* from *what setting it produced*.
     *
     * **Fill only, no border.** `surfaceGreySubtle` (`#F5F5F6`) against `surfaceWhite` is
     * about a 2% step, which is the "subtle and light" that was asked for; adding a
     * `borderSubtle1` hairline on top of a fill draws the same edge twice and makes a quiet
     * panel look like an input group. This is also why the row above gave up its rule.
     *
     * There is a note in the drawer's own sheet that a grey box "reads as an input group"
     * and that read-only values should use hairlines instead. That note is about a **table**
     * of quoted values inside a 475px drawer, where a filled panel would have to compete
     * with the table's own rules; this is three figures and a heading in a 600px column with
     * no rules of its own, and nothing inside it looks like a field.
     */
    scopeBox: w({
      background: theme.palette.surfaceGreySubtle,
      borderRadius: 10,
      padding: '12px 14px 14px',
    }),
    sectionHead: w({
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      marginBottom: 10,
      /* The heading takes the room, so the two actions after it sit together on the right
         rather than being pushed apart by `space-between` the moment a second one appears. */
      '& > h3': { marginRight: 'auto' },
    }),

    /* ── The day tabs ──────────────────────────────────────────────────────────
       Composed *onto* `harmonizeFlow.styles.js`'s own `tab`, so everything about the
       chrome — 14/500, the 2px selected rule, the hover, the drop verdicts — is the
       drawer's and cannot drift.

       **`splitTabDot` is gone**, and with it the only thing this shell was adding to the
       drawer's tab: a 7px dot in the day's zone colour. Removed on instruction — see
       `DayTabRow` for why the date/zone/map tie survives without it. `splitTab` survives
       on its own because the 2px of left padding it adds is what keeps the first tab's
       label off the band's edge now that no dot is standing in front of it. */
    splitTab: w({ paddingLeft: 2 }),

    /* ── ① folded ──────────────────────────────────────────────────────────────
       **Gone.** Six rules (`foldedRow`, `foldedSpacer`, `foldedChip`, `foldedChipText`,
       `foldedChevron`, `foldButton`) dressed a `15 Aug – 21 Aug ▾` chip and the `Hide`
       button that collapsed to it. The control was removed on instruction and the rules
       went with it rather than being left for a reader to wonder about — `ScopePanel`
       carries the argument, including why an *automatic* fold was reversed before the
       manual one was cut. */

    sectionHeading: w({
      ...theme.typography.h4,
      /* `h4` is 700 — a step heavier than this heading earns beside a 14/500 text button
         on the same row. The drawer's own `sectionHeading` makes the same adjustment for
         the same reason; copied by value so the two cannot drift apart. */
      fontWeight: 500,
      color: theme.palette.textPrimary,
    }),

    /* ── The three figures ─────────────────────────────────────────────────────
       Tighter than the drawer's own stat row: this column carries the same three
       numbers plus a pill per day plus, eventually, a whole runsheet, so the figures
       give up a type size rather than the pills giving up their second line. */
    /* `marginBottom` is gone and `marginTop` is trimmed: the container's own padding is
       what holds the figures off its edges now, and the old 14px bottom margin would have
       stacked with it. */
    statRow: w({ display: 'flex', gap: 32, marginTop: 10 }),
    stat: w({ display: 'flex', flexDirection: 'column', gap: 1 }),
    statValue: w({
      ...theme.typography.h3,
      color: theme.palette.textPrimary,
      fontVariantNumeric: 'tabular-nums',
      lineHeight: '28px',
    }),
    /* The pool exceeds the shifts before a mile is driven. Amber ink on the figure, once
       — the same treatment and the same argument as the drawer's own. */
    statValueWarn: w({ color: WARNING_INK }),
    /* Sentence case in `body2`, not 11px uppercase letterspaced. The uppercase micro-label
       is a convention from somewhere else — nothing in this product wears it, and beside a
       20px figure it read as a chart legend rather than as a caption. */
    statLabel: w({ ...theme.typography.body2, color: theme.palette.textSecondary2 }),

    hint: w({ ...theme.typography.body2, color: theme.palette.textSecondary2, marginTop: 10 }),

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
    skeletonStatValue: w({ width: 44, height: 20, marginBottom: 4 }),
    skeletonStatLabel: w({ width: 34, height: 10 }),
    skeletonPill: w({ width: 116, height: 44, borderRadius: 8 }),

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
    /* The reasoning footnote's own band, between the scrolling body and the issues tray.
       Fixed rather than scrolling: it is the last thing said about the answer, and a
       footnote that has to be scrolled to is one nobody finds. Its panel opens upward into
       the body's space, so nothing above it moves. */
    /**
     * ## The scrim, and the sliced stop row it exists to fix
     *
     * `planBody` clips at its own bottom edge, and a nine-stop route means that edge almost
     * always falls *through* a row rather than between two. Measured on the canonical week:
     * the last row inside the scrollport was cut at 15px of its 66, leaving a sliver of a
     * pin and half a site name with `Reasoning` sitting directly under it on a transparent
     * band. A row cut in half reads as a rendering fault, not as *there is more below* —
     * and the footnote, which is supposed to be pinned over the list, read as the list's
     * last item.
     *
     * A hairline was the obvious answer and is the wrong one twice over: it draws a border
     * across the middle of a region whose whole argument is that it is one surface the
     * machine wrote (see `planRegion`), and `flowSpillTray` already draws the hard rule
     * 38px below this — two rules that close together are texture, which is the correction
     * `harmonization-settings.md` §5 records making across a whole screen.
     *
     * So the sliver is faded out instead, which is the idiom this feature already uses for
     * exactly this problem one axis over: `tabRowScrollable` masks the right edge of the
     * day tabs because "a hidden scrollbar with no other cue makes the trailing tabs look
     * absent rather than off-screen". Same reasoning, vertical.
     *
     * **White rather than the region's own wash**, and that is arithmetic rather than
     * laziness: `planRegion`'s gradient reaches `surfaceWhite` at 100% and is past 74% of
     * its own height by the time it gets here, so the ground under this scrim is already
     * white to within about 1% of a brand tint. Mixing the tint back in would be a second
     * definition of the same colour, free to drift from the first.
     *
     * `pointer-events: none` because it overhangs the scrollport — without it the scrim
     * would eat the wheel and the drag over the last 22px of a list a planner is dragging
     * out of.
     */
    planTrail: w({
      flex: '0 0 auto',
      padding: `0 ${GUTTER}px 10px`,
      position: 'relative',
      '&::before': {
        content: '""',
        position: 'absolute',
        left: 0,
        right: 0,
        top: -22,
        height: 22,
        pointerEvents: 'none',
        backgroundImage: `linear-gradient(to top, ${theme.palette.surfaceWhite} 0%, transparent 100%)`,
      },
    }),
    /* The tabs pin to the top of the region while the runsheet under them scrolls — they
       are ④'s drop targets, and a target that scrolls away from the pointer carrying
       something towards it is not a target. Transparent, so the wash runs behind them rather than starting under them —
       rather than starting under them: the tabs are part of the generated region, not a
       lid on it. */
    planTabBand: w({ flex: '0 0 auto', padding: `0 ${GUTTER}px`, position: 'relative' }),
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

    /* The static twin of `flowRouteTitle`, which is an `InputBase` and therefore scoped
       to `.MuiInputBase-root`. Same role, same colour, and the same 4px inset and pull-back
       so the two titles start on exactly the same pixel — a heading that shifted sideways
       when the route arrived would undo the point of drawing it early. */
    /**
     * The duration's row before there is a duration — **a reserved height, not a value.**
     *
     * `previewMetricEmpty` used to live here: `h3` in `textDisabled`, holding an em dash at
     * the exact size and baseline the duration would arrive at. The dash is gone (see
     * `RoutePreview`), and what has to survive it is the *height* — that was always the
     * dash's real job. Without it the row is a lone `body2` line and its box is 20px
     * against the h3's 28, so the gauge, the caption and the whole stop list below would
     * rise 8px at the moment of the press. `RoutePreview` exists to make that number zero.
     *
     * So the height is stated directly instead of being implied by a glyph nobody needed.
     * `28px` is `h3`'s own line box — the same figure `flowRouteMetricValue` sets — and
     * `alignItems: center` keeps the shift's smaller line optically inside it rather than
     * hung off the taller box's baseline.
     */
    previewMetricRow: w({ minHeight: 28, alignItems: 'center' }),
    /**
     * The empty gauge — **reserved, and not drawn.**
     *
     * ## Why it was visible, and why it is not any more
     *
     * An earlier pass made this a neutral hairline grey. The argument was sound as far as
     * it went: `proposedBar`'s own trough is `#EEF5FF`, the brand blue at its palest, which
     * vanishes against this region's green wash — so an empty bar read as *no bar*.
     *
     * What that missed is that the tab row twelve pixels above ends in a `borderSubtle1`
     * hairline, and this resolved to **the same `#E6E6E7` at the same full width**. Two
     * indistinguishable rules ninety pixels apart, with two same-coloured grey captions
     * loose between them: the header stopped reading as a header and started reading as a
     * gap between two dividers. Making the empty bar *more* visible had made the region
     * less legible.
     *
     * It is transparent now, and that is also the more honest state: a trough is the frame
     * of a measurement, and asserting a scale before anything has been measured is the same
     * class of overclaim as printing the forecast here would be (see `RoutePreview`). The
     * bar appears with the number it belongs to.
     *
     * **The element still renders**, because its 4px is 4px everything below it would jump
     * by when the answer arrives — which is the whole reason `RoutePreview` exists. Space
     * reserved, ink withheld.
     */
    previewTrack: w({ background: 'transparent' }),
    previewTitle: w({
      ...theme.typography.subtitle1,
      flex: '1 1 auto',
      minWidth: 0,
      color: theme.palette.textPrimary,
      /* **`5px 4px`, not `0 4px`.** `flowRouteTitle` is a `MuiInputBase`, and an input
         carries its own `4px 0 5px` on top of the line box — so a bare heading at the same
         type size is 10px shorter, and the title dropped 10px at the moment the route
         arrived. Matching the box is the difference between "the header fills in" and "the
         header twitches". */
      padding: '5px 4px',
      marginLeft: -4,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    }),

    /**
     * Where the stop list will be — **and both of its placeholders are centred in it.**
     *
     * ## This reverses a top-aligned pass, on instruction
     *
     * The note was moved to the top of this space on the argument that the space *is* the
     * stop list, so its placeholder should begin where the first row will, and that a
     * centred block in a tall column sits in the middle of a void. The instruction is to
     * centre it, and taking the two together the instruction wins: a sentence about the
     * whole region is not a row, and a short block pinned to the top edge of a 300px gap
     * reads as content that failed to load rather than as a state. The same is true of the
     * orb, which is the region *working* and had no business being top-aligned either.
     *
     * ## One box, so the two cannot drift
     *
     * `previewBody` is the slot; `previewEmpty` is only the note's own icon-plus-text row.
     * The centring lives on the slot, so the note before the press and the orb during ②
     * land on exactly the same pixel — they are the same state of the same region a moment
     * apart, and centring them separately would be two chances to disagree.
     *
     * `flex: 1` needs a column with a height to resolve against, which is why
     * `flowRouteBody` below now claims one. Without that the slot collapses to its content
     * and "centred" silently means "directly under the header", which is where this
     * started.
     */
    previewBody: w({
      flex: '1 1 auto',
      minHeight: 0,
      display: 'flex',
      flexDirection: 'column',
      /**
       * **`stretch`, not `center`** — and this line is the whole of item 6.
       *
       * Centring the *items* shrink-wraps them, and `ComputingState`'s `thinkingStage` is
       * an item: at `center` it measured **93px wide** in a 559px column, so the orb sat
       * off-centre and `stageContent`'s `width: 100%` inherited 93px, which is what wrapped
       * a seven-word narration line onto three. The note got away with it because it is
       * text with a `max-width`; the orb did not.
       *
       * Stretched, each child gets the full column and centres its own contents — which
       * both of them already do, `previewEmpty` with `align-items: center` and the stage
       * with the centring it was drawn with in the drawer. `justify-content` stays here
       * because vertical centring is the slot's job in both cases.
       */
      alignItems: 'stretch',
      justifyContent: 'center',
      /* Air top and bottom so the centred block is never flush against the caption above
         it on a short viewport, where `flex: 1` has little to give. */
      padding: '20px 0',
    }),
    /* The note itself: the glyph above the sentence rather than beside it, because a
       centred row of icon-then-text has an optical centre that is neither of them. */
    previewEmpty: w({
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      /* 14, not 10: the illustration is eight times the height of the glyph it replaced, and
         at 10 the caption sat close enough to read as the drawing's label rather than as the
         state's own sentence. */
      gap: 14,
      textAlign: 'center',
    }),
    /**
     * The illustration above the note.
     *
     * **This replaces a 22px icon**, which was the right weight when the copy under it was
     * three lines of explanation and the wrong weight the moment that copy became six words:
     * a small glyph over a short line reads as a list item that lost its row, not as a
     * state. The slot is now ~168px wide, which is the size at which a drawing can carry
     * the region without becoming the subject of it.
     *
     * **No `color` is set, because the drawing no longer has an accent.** It used to be greys
     * plus one `currentColor` element, so a tenant's own brand reached the route without the
     * file knowing anything about tenants. The route is grey glass now, on instruction, so
     * the drawing is entirely greyscale and `currentColor` is unused — leaving the property
     * here would be a live-looking hook wired to nothing. `planRegion`'s wash still carries
     * the tenant's brand, via `color-mix` against `surfaceBrand`, so the region as a whole
     * has not lost its branding.
     *
     * Width rather than height, and `height: auto` from the `viewBox`, so the drawing's own
     * aspect ratio decides the box. Pinning both is how an illustration ends up subtly
     * stretched on one breakpoint and nobody notices for a month.
     */
    previewIllustration: w({
      width: 168,
      maxWidth: '60%',
      height: 'auto',
      flex: '0 0 auto',
      display: 'block',
    }),
    previewEmptyText: w({
      ...theme.typography.body2,
      color: theme.palette.textSecondary2,
      /* One short line now, so the measure is only a guard against a long translation
         setting it as an awkward two. */
      maxWidth: 330,
    }),

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

    /* ── Overrides on the borrowed drawer parts ───────────────────────────────
       `DayPane`, `SpillTray` and `ExitPanel` are imported whole and handed
       `harmonizeFlow`'s own class sheet with these keys swapped in. Two things
       differ between a 475px drawer and this column, and only two:

       - the tray is the **last** thing above a footer in the drawer, and here it is
         the last thing above a footer *that also carries the apply note*, so its
         upward shadow would stack with the footer's own.

       Everything else — the gauge, the rail, the pins, the decision box — is left
       exactly as the drawer draws it. That is the comparison. */
    flowSpillTray: w({
      position: 'relative',
      flex: '0 0 auto',
      background: theme.palette.surfaceWhite,
      borderTop: `1px solid ${theme.palette.borderSubtle1}`,
      /* No lift. The footer band directly below already casts one, and two shadows
         40px apart read as a seam rather than as a stack. */
      boxShadow: 'none',
    }),
    /**
     * `routeBody`, with this column's own padding — **and a full-height column.**
     *
     * `minHeight: '100%'` is what makes `previewBody`'s `flex: 1` mean anything: percentage
     * heights resolve against the parent's *content* box, and `planBody` is a scrollport
     * with a definite height, so this claims all of it. Without it the card is
     * content-height, `flex: 1` has nothing to distribute, and the centred slot collapses
     * back to sitting directly under the caption.
     *
     * It costs nothing at ③: the solved card is taller than the scrollport anyway, and
     * `min-height` cannot shrink it.
     */
    flowRouteBody: w({
      paddingTop: 12,
      paddingBottom: 12,
      minHeight: '100%',
      boxSizing: 'border-box',
    }),
  };
});
