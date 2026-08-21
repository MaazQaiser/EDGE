import { makeStyles } from '@mui/styles';

/**
 * The amber that warning **text** is written in.
 *
 * `textWarning` (`#f19f02`) is an amber-500: about 2.2:1 on white, fine for a bar or a
 * border and nowhere near enough for a sentence. The sibling feature found the same and
 * named `SPILL_INK` for it; the same value is used here so the two say *this did not fit*
 * in one voice.
 */
const WARNING_INK = '#B54708';

/**
 * The numbered stop pin — **blue, and deliberately not the brand colour**.
 *
 * Copied by value from `STOP_TONES.planned` in `harmonize.styles.js`, so the two shells
 * draw the same mark: a stop pin is *map* semantics, not brand semantics, and the
 * workspace keeps it blue on the green FilterGo tenant for exactly that reason. Copied
 * rather than imported, on the same argument the tab geometry uses — these two features
 * are a comparison, and a shared constant one could edit is a way for one of them to
 * restyle the other.
 *
 * **The rim value, used as the fill.** The workspace pairs a light `#3F99FF` face with a
 * `#0058FF` rim because it sits on a map, where a pale pin needs an outline to survive a
 * busy ground. In a 24px disc in a list the rim buys nothing and the pale face fails
 * contrast under its own numeral (~2.9:1). Taking the darker of the pair keeps the mark
 * in the same family and puts white on it at ~6.3:1.
 */
const PIN_FILL = '#0058FF';

/**
 * The dashed connector between two pins — `STOP_TONES.planned.line`.
 *
 * The tone set has three values for three jobs and the track has its own: taking the
 * pin's fill for the line was borrowing the wrong one. Copied by value alongside
 * `PIN_FILL`, from the same source and for the same reason.
 */
const TRACK_LINE = '#146DFF';

/** `textPrimary` at 6%. Named because it is otherwise the only literal in the sheet. */
const EDGE_SHADOW = 'rgba(38, 37, 39, 0.06)';

/** Stop-rail geometry, shared by the anchors, the pins and the dashed track. */
const GRIP_WIDTH = 16;
const PIN_SIZE = 24;
const RAIL_GAP = 10;

export const useStyles = makeStyles((theme) => {
  /**
   * Every rule goes through this.
   *
   * `@mui/styles` (JSS) injects before emotion, so `.MuiTypography-root` — `font-size:
   * 1rem`, `font-weight: 400`, `margin: 0` — outranks a plain `makeStyles` class of equal
   * specificity, and every `...theme.typography.*` in this file would silently render at
   * 16px/400. Measured with `getComputedStyle`, not guessed. `'&&'` compiles to
   * `.rule.rule` (0-2-0) and wins.
   *
   * A helper rather than the nesting written out 120 times: the sheet stays readable, and
   * a rule added later cannot forget it.
   */
  const w = (styles) => ({ '&&': styles });

  /** The decision box's state edge plus its lift, so a modifier cannot drop one. */
  const edge = (colour) => `inset 3px 0 0 0 ${colour}, 0 -4px 12px ${EDGE_SHADOW}`;

  return {
    /* ── Shell ─────────────────────────────────────────────────────────────────
       The drawer itself is the app's shared `DetailDrawer`, so width, anchor and
       backdrop are its business. What is styled here is only the *inside*: a fixed
       head, a scrolling body and a fixed footer, on the 24px gutter every other
       drawer in this app uses. */
    shell: w({
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      background: theme.palette.surfaceWhite,
    }),

    head: w({
      flex: '0 0 auto',
      minHeight: 0,
      padding: '24px 24px 0',
    }),
    titleRow: w({
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: 12,
    }),
    title: w({ ...theme.typography.h3, color: theme.palette.textPrimary }),
    closeButton: w({
      flex: '0 0 auto',
      width: 28,
      height: 28,
      marginTop: -2,
      display: 'grid',
      placeItems: 'center',
      border: 'none',
      borderRadius: 6,
      background: 'transparent',
      color: theme.palette.textSecondary3,
      cursor: 'pointer',
      transition: 'background 120ms ease, color 120ms ease',
      '&:hover': { background: theme.palette.surfaceGreySubtle, color: theme.palette.textPrimary },
      '&:focus-visible': { outline: `2px solid ${theme.palette.borderBrand}`, outlineOffset: 1 },
    }),
    /* `textPlaceholder`, which is what `drawerHeader`'s `bulkSubHeading` uses for exactly
       this line in every other drawer — and a step darker than the grey this had. */
    subtitle: w({
      ...theme.typography.body2,
      color: theme.palette.textPlaceholder,
      marginTop: 4,
    }),

    /* ── The day tabs ──────────────────────────────────────────────────────────
       The app's own tab language, copied by value from `customTabsWithPermissions`:
       14px/500 in `textPlaceholder`, `4px 4px 12px`, and the selected tab takes
       `textBrand` with a 2px `borderBrand` rule under it. It is the same strip the
       schedule page behind this drawer already draws, which is the point — a private
       tab treatment inside a drawer over that page read as a different application.

       The capacity meter that used to live in these tabs has moved into the route
       card, where the route it measures is. What stays here is a **dot** on a day that
       runs over: comparison at a glance was the reason the strip existed, and a tab
       row cannot carry three bars, but it can carry three dots. */
    /**
     * Scrolls past five worked days, and says so.
     *
     * 475px of gutter holds five day tabs plus the tray; six is ~542px and Mon–Fri plus a
     * weekend is an ordinary answer from Settings. The scrollbar stays hidden — it is
     * 4px of chrome on a 36px row — but a hidden scrollbar with no other cue makes the
     * trailing tabs look absent rather than off-screen, so the right edge fades instead.
     * The mask is only painted when there is something to scroll to.
     */
    tabRow: w({
      display: 'flex',
      alignItems: 'center',
      gap: 20,
      marginTop: 16,
      borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
      overflowX: 'auto',
      scrollbarWidth: 'none',
      '&::-webkit-scrollbar': { display: 'none' },
    }),
    tabRowScrollable: w({
      maskImage: 'linear-gradient(to right, #000 calc(100% - 32px), transparent 100%)',
      WebkitMaskImage: 'linear-gradient(to right, #000 calc(100% - 32px), transparent 100%)',
    }),
    tab: w({
      ...theme.typography.subtitle2,
      color: theme.palette.textPlaceholder,
      cursor: 'pointer',
      background: 'transparent',
      padding: '4px 4px 12px',
      border: 'none',
      borderBottom: '2px solid transparent',
      marginBottom: -1,
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      whiteSpace: 'nowrap',
      flex: '0 0 auto',
      /* Scoped away from the drag verdicts. `w()` compiles this to `.tab.tab:hover`
         (0-3-0), which outranks `.tabDropRefused.tabDropRefused` (0-2-0) — so resting the
         pointer on a refused tab turned its label brand green over a pink ground. The
         `&&` scheme is right; its one cost is that base pseudo-classes need scoping
         against the modifiers that are supposed to beat them. */
      '&:hover:not($tabDropLegal):not($tabDropRefused)': { color: theme.palette.textBrand },
      '&:focus-visible': { outline: `2px solid ${theme.palette.borderBrand}`, outlineOffset: 2 },
    }),
    tabSelected: w({
      color: theme.palette.textBrand,
      borderBottom: `2px solid ${theme.palette.borderBrand}`,
    }),
    /* The count beside a tab label, as the app draws counts: a small grey pill. */
    tabCount: w({
      ...theme.typography.subtitle3,
      fontWeight: 600,
      color: theme.palette.textSecondary2,
      background: theme.palette.surfaceGreySubtle,
      borderRadius: 10,
      padding: '1px 6px',
      minWidth: 18,
      textAlign: 'center',
    }),
    /* One dot, one meaning: this day finishes past its shift. Amber, never red — D3
       makes the cap soft, and red would say "you cannot do this". */
    /**
     * `WARNING_INK`, not `surfaceWarningStrong`.
     *
     * A 6px dot is the *only* mark saying "this day runs over" in the whole tab row, and
     * `#FFAC0D` measures 1.90:1 on white — under the 3:1 WCAG asks of a non-text state
     * indicator, and in practice close to invisible at 6px. The fill amber survives in
     * `gaugeOverrun` because it sits against a grey track; alone on white it does not.
     */
    tabDot: w({
      width: 6,
      height: 6,
      borderRadius: '50%',
      background: WARNING_INK,
      flex: '0 0 auto',
    }),
    /* Settled, not gone — but `borderSubtle2` is 1.56:1, which is gone. */
    tabDotSettled: w({ background: theme.palette.borderStrong1 }),

    /* ── ④ drag verdicts, on the tabs ─────────────────────────────────────────
       A tab is a drop target while a move is in flight. The underline treatment has no
       room for a sentence, so the verdict is the tab's own colour plus a word beneath
       the row (see `dropHint`). */
    tabDropLegal: w({
      /* `textPrimary`, not `textBrand`: brand-on-brand-subtle is 2.87:1 on the FilterGo
         tenant, so the *legal* verdict was harder to read than the refused one beside it
         (alert-on-alert-subtle is 6.0:1). The dashed brand underline and the subtle
         ground still carry the signal. */
      color: theme.palette.textPrimary,
      borderBottom: `2px dashed ${theme.palette.borderBrand}`,
      background: theme.palette.surfaceBrandSubtle,
      borderRadius: '6px 6px 0 0',
    }),
    tabDropRefused: w({
      color: theme.palette.textAlert,
      borderBottom: `2px dashed ${theme.palette.borderAlert}`,
      background: theme.palette.surfaceAlertSubtle,
      borderRadius: '6px 6px 0 0',
    }),

    /* ── Body ──────────────────────────────────────────────────────────────────
       `minHeight: 0` is load-bearing: a flex child's default `min-height: auto` refuses
       to shrink below its content, so without it the body grows to fit every stop and
       pushes the footer off the bottom of the paper — `overflowY: auto` then never has
       an overflow to scroll. */
    body: w({ flex: '1 1 auto', minHeight: 0, overflowY: 'auto', padding: '20px 24px 24px' }),

    /* ── The route card ────────────────────────────────────────────────────────
       Mirrors the workspace's own route card, which is the shape this feature already
       uses to say *here is a day of work and here is how full it is*: a title line, the
       used-of-budget figure on the right, a gauge directly beneath, then the stops. The
       planner meets the same object in both shells. */
    routeCard: w({
      border: `1px solid ${theme.palette.borderSubtle1}`,
      borderRadius: 12,
      background: theme.palette.surfaceWhite,
      overflow: 'hidden',
    }),
    routeHead: w({ padding: '14px 16px 0' }),
    routeHeadRow: w({
      display: 'flex',
      alignItems: 'baseline',
      justifyContent: 'space-between',
      gap: 12,
    }),
    routeTitle: w({ ...theme.typography.h5, color: theme.palette.textPrimary }),
    routeBudget: w({
      ...theme.typography.subtitle3,
      color: theme.palette.textSecondary2,
      fontVariantNumeric: 'tabular-nums',
      whiteSpace: 'nowrap',
    }),
    routeMeta: w({
      ...theme.typography.subtitle3,
      color: theme.palette.textSecondary2,
      marginTop: 3,
    }),

    /**
     * The gauge, as the workspace draws it: a full-width rule under the head, filled to
     * the share of the day used.
     *
     * **The overrun still breaks the line.** N2's finding survives the move out of the
     * tab — at any size, a texture inside the bar loses to a block that is taller than
     * it, and an over day and a comfortable day must not share a silhouette. So the
     * gauge is 4px and the overrun segment is 8px.
     */
    gaugeTrack: w({
      position: 'relative',
      height: 8,
      marginTop: 12,
      display: 'flex',
      alignItems: 'flex-end',
    }),
    gaugeRule: w({
      position: 'relative',
      width: '100%',
      height: 4,
      background: theme.palette.surfaceGreySubtle,
      overflow: 'visible',
    }),
    gaugeFill: w({
      '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
      position: 'absolute',
      left: 0,
      bottom: 0,
      height: 4,
      background: theme.palette.surfaceBrand,
      transition: 'width 240ms ease',
    }),
    gaugeFillOver: w({ background: theme.palette.borderStrong1 }),
    gaugeOverrun: w({
      '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
      position: 'absolute',
      bottom: 0,
      height: 8,
      minWidth: 3,
      background: theme.palette.surfaceWarningStrong,
      transition: 'width 240ms ease, background 240ms ease',
    }),
    gaugeOverrunSettled: w({ background: theme.palette.borderSubtle2 }),

    /* ── The stop rail ─────────────────────────────────────────────────────────
       The workspace's anatomy, reproduced: a grip, a numbered pin on a dashed track,
       the site name, the `distance · duration` figure, and a chevron. Anchors at both
       ends carry a grey ring and no number, because the run always starts and ends at
       base (H1) and neither end is reorderable. */
    rail: w({ padding: '4px 16px 14px' }),
    railRow: w({
      display: 'flex',
      alignItems: 'flex-start',
      gap: RAIL_GAP,
      position: 'relative',
      borderRadius: 6,
      transition: 'background 120ms ease',
      /* The grip is a *sibling* of the draggable body, not a child of it, so both the
         reveal and the hover band belong to the row wrapper — and `focus-within` rather
         than a descendant focus selector, because CSS cannot reach backwards to a
         preceding sibling. */
      '&:hover $grip, &:focus-within $grip': { opacity: 1 },
      '&:hover': { background: theme.palette.surfaceGreySubtle },
    }),
    grip: w({
      width: GRIP_WIDTH,
      flex: '0 0 auto',
      marginTop: 4,
      color: theme.palette.borderStrong1,
      opacity: 0,
      transition: 'opacity 120ms ease, color 120ms ease',
    }),
    /* The grip appears on hover or focus, as the workspace's does — a column of grips
       down a list of stops is a lot of furniture for a gesture most planners never use. */
    gripVisible: w({ opacity: 1 }),

    pinColumn: w({
      width: PIN_SIZE,
      flex: '0 0 auto',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      alignSelf: 'stretch',
    }),
    /* A plain disc. The teardrop this replaced was a rotated square with a
       counter-rotated numeral inside it, and at 12px the glyph clipped out of its own
       box — measured, not guessed. Rotation buys a shape that only reads as a pin on a
       map; in a rail the number is the mark. */
    pin: w({
      width: PIN_SIZE,
      height: PIN_SIZE,
      flex: '0 0 auto',
      borderRadius: '50%',
      background: PIN_FILL,
      display: 'grid',
      placeItems: 'center',
    }),
    pinLabel: w({
      ...theme.typography.subtitle3,
      fontWeight: 700,
      color: theme.palette.textOnColor,
      lineHeight: 1,
    }),
    anchorDot: w({
      width: 11,
      height: 11,
      marginTop: 4,
      borderRadius: '50%',
      border: `2px solid ${theme.palette.borderStrong1}`,
      background: theme.palette.surfaceWhite,
      flex: '0 0 auto',
    }),
    /* Dashed, and it runs the height of the row rather than being its own row — the
       workspace draws the leg as a track between two pins with no caption on it, and the
       minutes live in the stop's own figure instead. */
    track: w({
      flex: '1 1 auto',
      width: 0,
      minHeight: 18,
      borderLeft: `1px dashed ${theme.palette.borderSubtle2}`,
      margin: '2px 0',
    }),
    trackBrand: w({ borderLeftColor: TRACK_LINE }),

    stopBody: w({
      flex: '1 1 auto',
      minWidth: 0,
      paddingBottom: 12,
      /* This is the draggable element, so this is where the gesture is advertised and
         where the focus ring has to land. */
      cursor: 'grab',
      borderRadius: 6,
      '&:focus-visible': { outline: `2px solid ${theme.palette.borderBrand}`, outlineOffset: 2 },
    }),
    stopName: w({
      ...theme.typography.subtitle2,
      color: theme.palette.textPrimary,
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    }),
    stopMeta: w({
      ...theme.typography.subtitle3,
      color: theme.palette.textSecondary2,
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    }),
    stopFigure: w({
      flex: '0 0 auto',
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      marginTop: 1,
    }),
    figureText: w({
      ...theme.typography.subtitle3,
      color: theme.palette.textSecondary2,
      fontVariantNumeric: 'tabular-nums',
      whiteSpace: 'nowrap',
    }),
    chevron: w({
      width: 16,
      height: 16,
      border: 'none',
      background: 'transparent',
      padding: 0,
      color: theme.palette.textSecondary3,
      cursor: 'pointer',
      transition: 'transform 120ms ease',
      '&:focus-visible': { outline: `2px solid ${theme.palette.borderBrand}`, outlineOffset: 2 },
    }),
    chevronOpen: w({ transform: 'rotate(180deg)' }),

    /* Hover is CSS, not React state. Driving the grip's opacity from a `useState` re-ran
       the whole day pane on every pointer enter and leave across every stop, and the
       `background` transition declared here had nothing to transition because no rule
       ever set a background. The sibling does both of these in the stylesheet. */
    stopRow: w({
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: 8,
      borderRadius: 6,
    }),
    stopDragging: w({ opacity: 0.4 }),
    /* The stop the shift expires during. An edge, not a wash — filled, it merged with
       the amber panel below and the two read as one block. */
    stopTipping: w({
      boxShadow: `inset 3px 0 0 0 ${WARNING_INK}`,
      paddingLeft: 8,
      marginLeft: -8,
    }),

    /* The stop's disclosure: the arithmetic behind its figure. */
    stopDetail: w({
      display: 'grid',
      gridTemplateColumns: 'auto auto',
      justifyContent: 'start',
      columnGap: 14,
      rowGap: 2,
      marginTop: 6,
      padding: '8px 10px',
      borderRadius: 8,
      background: theme.palette.surfaceGreySubtle,
    }),
    detailLabel: w({ ...theme.typography.subtitle3, color: theme.palette.textSecondary2 }),
    detailValue: w({
      ...theme.typography.subtitle3,
      color: theme.palette.textPrimary,
      fontVariantNumeric: 'tabular-nums',
    }),

    /**
     * The need-by window, as cells. The only thing on a stop that shows *slack*, which
     * is what makes a move legible and what S4 protects.
     */
    windowStrip: w({
      display: 'flex',
      alignItems: 'center',
      gap: 2,
      marginTop: 5,
      borderRadius: 3,
      /* Focusable so the tooltip explaining the window is reachable without a pointer —
         which means it has to be visibly focusable. */
      '&:focus-visible': { outline: `2px solid ${theme.palette.borderBrand}`, outlineOffset: 3 },
    }),
    windowCell: w({
      width: 6,
      height: 4,
      borderRadius: 1,
      background: theme.palette.borderSubtle1,
    }),
    windowCellLegal: w({ background: theme.palette.borderSubtle2 }),
    /* The pin's blue, not the brand green: on the FilterGo tenant a stop was saying
       "this visit is here" twice in two different colours — a green cell under a blue
       pin. One mark, one colour. */
    windowCellPlaced: w({ background: PIN_FILL }),
    windowCellDue: w({ background: theme.palette.textSecondary2 }),
    /* Not amber. Amber is spent on the overrun; "only day" is a true and useful property
       of a window, and in the canonical week every North stop carries it. */
    windowOnly: w({
      ...theme.typography.subtitle3,
      color: theme.palette.textSecondary2,
      fontWeight: 600,
      marginLeft: 6,
    }),

    /* ── Tray ──────────────────────────────────────────────────────────────────── */
    /* Its own class, not the tray's. An empty worked day is a real outcome (E4) and it
       reads as a statement about this route, centred in the card rather than left-aligned
       like a list intro. */
    emptyDay: w({
      ...theme.typography.body3,
      color: theme.palette.textSecondary2,
      textAlign: 'center',
      padding: '18px 8px 22px',
    }),
    trayIntro: w({
      ...theme.typography.body3,
      color: theme.palette.textSecondary2,
      marginBottom: 12,
    }),
    trayCard: w({
      padding: '12px 14px',
      borderRadius: 10,
      border: `1px solid ${theme.palette.borderSubtle1}`,
      background: theme.palette.surfaceWhite,
      marginBottom: 8,
      '&:focus-visible': { outline: `2px solid ${theme.palette.borderBrand}`, outlineOffset: 1 },
    }),
    trayCardDraggable: w({ cursor: 'grab' }),
    trayReason: w({
      ...theme.typography.subtitle3,
      color: theme.palette.textSecondary2,
      marginTop: 6,
    }),
    trayRemedy: w({
      ...theme.typography.subtitle3,
      fontWeight: 600,
      color: theme.palette.textBrand,
      background: 'none',
      border: 'none',
      padding: 0,
      marginTop: 8,
      cursor: 'pointer',
      '&:hover': { textDecoration: 'underline' },
      '&:focus-visible': { outline: `2px solid ${theme.palette.borderBrand}`, outlineOffset: 2 },
    }),

    /* ── The decision box (E1 exits, and ④'s move preview) ─────────────────────
       ## What changed, and why
       This was a filled amber card with four equal outlined buttons in a row — a lot of
       chrome for a thing that is, in the end, one sentence and a choice. The structure
       was right and is kept: **what happened · what it means · what you can do.** The
       treatment is now the app's quiet one.

       - **A rule, not a fill.** A 3px left edge in the state's colour and a white ground.
         The panel sits directly under a stop list that already has an amber-edged row in
         it; two amber fills touching read as one block, and the loudest thing on the
         screen should be the work, not the notice about it.
       - **One primary, the rest as text.** Of the four exits, exactly one is the likely
         answer at any moment. Four outlined buttons of equal weight make the planner
         read all four every time; a filled primary plus three text actions makes the
         common path obvious and costs the others nothing but a click they were going to
         make deliberately anyway.
       - **The reason sits with the action it disables**, not in a separate italic line
         under the row. */
    decision: w({
      position: 'sticky',
      /* Not `0`. Sticky resolves against the scrollport, so at `0` the card's own border
         sat directly on the footer's hairline — two rules 1px apart reading as one thick
         accidental one — and the body's bottom padding never appeared. The shadow is what
         makes content scrolling *underneath* it read as pinned rather than as a glitch. */
      bottom: 12,
      marginTop: 16,
      padding: '14px 16px',
      borderRadius: 10,
      background: theme.palette.surfaceWhite,
      border: `1px solid ${theme.palette.borderSubtle1}`,
      /**
       * Two shadows in one declaration: the **state edge** and the **lift**.
       *
       * The edge is this box's entire state system, so every colour in it has to clear
       * 3:1 on white — the fill amber is 1.9:1 and `borderSubtle2` is 1.56:1, and both
       * were states you could not see. The lift is what makes content scrolling
       * underneath a pinned white card read as pinned rather than as a paint bug.
       *
       * They share one property, so every modifier below has to restate the lift; a
       * modifier setting only the edge would silently drop it. Hence `edge()`.
       */
      boxShadow: edge(WARNING_INK),
    }),
    /* X2 — accepted. The decision is settled, so the edge goes quiet, not invisible. */
    decisionSettled: w({ boxShadow: edge(theme.palette.borderStrong2) }),
    /* X3 — resolved. */
    decisionResolved: w({ boxShadow: edge(theme.palette.surfaceSuccessStrong) }),
    /* A refused drop is the one genuinely impossible action in the flow. */
    decisionRefused: w({ boxShadow: edge(theme.palette.surfaceAlertStrong) }),
    decisionNeutral: w({ boxShadow: edge(theme.palette.surfaceBrand) }),

    decisionTitle: w({ ...theme.typography.h6, color: theme.palette.textPrimary, marginBottom: 4 }),
    decisionBody: w({ ...theme.typography.body3, color: theme.palette.textSecondary2 }),
    decisionNote: w({
      ...theme.typography.subtitle3,
      color: theme.palette.textSecondary2,
      marginTop: 8,
    }),
    decisionActions: w({
      display: 'flex',
      alignItems: 'center',
      flexWrap: 'wrap',
      /* 8, not 4: the primary is a 36px filled button and its neighbours are ~28px text
         actions, so at 4 the filled edge read as touching the next label. */
      gap: 8,
      marginTop: 12,
    }),
    /* The three that are not the likely answer: text, with a hit area. */
    textAction: w({
      ...theme.typography.subtitle3,
      fontWeight: 600,
      padding: '5px 8px',
      borderRadius: 6,
      border: 'none',
      background: 'transparent',
      color: theme.palette.textSecondary2,
      cursor: 'pointer',
      transition: 'background 120ms ease, color 120ms ease',
      '&:hover:not(:disabled)': {
        background: theme.palette.surfaceGreySubtle,
        color: theme.palette.textPrimary,
      },
      '&:disabled': { color: theme.palette.textDisabled, cursor: 'not-allowed' },
      '&:focus-visible': { outline: `2px solid ${theme.palette.borderBrand}`, outlineOffset: 1 },
    }),
    /* Sits with the control it explains, not in its own row. */
    actionReason: w({
      ...theme.typography.subtitle3,
      color: theme.palette.textSecondary2,
      flexBasis: '100%',
      marginTop: 2,
    }),
    /* ④'s live price, in the decision box rather than on a 100px tab. */
    dropHint: w({
      ...theme.typography.subtitle3,
      fontWeight: 600,
      color: theme.palette.textBrand,
      fontVariantNumeric: 'tabular-nums',
    }),

    /* ── ① Scope ────────────────────────────────────────────────────────────────
       One question: the range. Days, shift hours and zones are Config A and are asked
       for in Settings; asking again here would be a second place to answer them and a
       second place for the answer to be wrong. */
    fieldLabel: w({
      ...theme.typography.overline,
      textTransform: 'uppercase',
      letterSpacing: '0.04em',
      color: theme.palette.textSecondary2,
      marginBottom: 8,
      display: 'block',
    }),
    rangeRow: w({
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '10px 14px',
      borderRadius: 8,
      border: `1px solid ${theme.palette.borderSubtle1}`,
    }),
    rangeValue: w({ ...theme.typography.subtitle2, color: theme.palette.textPrimary }),
    /* Same control as `closeButton` — 28px, radius 6, transparent, grey on a grey hover
       ground — so it gets the same transition rather than snapping while its twin eases. */
    rangeStep: w({
      width: 28,
      height: 28,
      display: 'grid',
      placeItems: 'center',
      border: 'none',
      borderRadius: 6,
      background: 'transparent',
      color: theme.palette.textSecondary2,
      cursor: 'pointer',
      transition: 'background 120ms ease, color 120ms ease',
      '&:hover': { background: theme.palette.surfaceGreySubtle },
      '&:focus-visible': { outline: `2px solid ${theme.palette.borderBrand}`, outlineOffset: 1 },
    }),
    hint: w({ ...theme.typography.subtitle3, color: theme.palette.textSecondary2, marginTop: 8 }),
    section: w({ marginBottom: 24 }),

    /**
     * What Settings already decided, stated once and not editable here.
     *
     * A run whose worked days come from nowhere visible is a black box, so the days and
     * their zones are *shown* — but as a read-out with a route to the place they are
     * actually set, not as controls. That is the Config A / Config B line drawn in the
     * UI rather than only in a document.
     */
    fromSettings: w({
      padding: '12px 14px',
      borderRadius: 8,
      background: theme.palette.surfaceGreySubtle,
    }),
    fromSettingsRow: w({
      display: 'flex',
      alignItems: 'baseline',
      justifyContent: 'space-between',
      gap: 10,
      padding: '3px 0',
    }),
    fromSettingsDay: w({ ...theme.typography.subtitle3, color: theme.palette.textPrimary }),
    fromSettingsZone: w({
      ...theme.typography.subtitle3,
      color: theme.palette.textSecondary2,
      fontVariantNumeric: 'tabular-nums',
    }),
    settingsLink: w({
      ...theme.typography.subtitle3,
      fontWeight: 600,
      color: theme.palette.textBrand,
      background: 'none',
      border: 'none',
      padding: 0,
      marginTop: 10,
      cursor: 'pointer',
      '&:hover': { textDecoration: 'underline' },
      '&:focus-visible': { outline: `2px solid ${theme.palette.borderBrand}`, outlineOffset: 2 },
    }),

    /* §14.5 — ① predicts rather than only describing. Amber: same class of fact as an
       overrun, true and actionable and not a blocker. */
    forecast: w({
      marginTop: 12,
      padding: '12px 14px',
      borderRadius: 8,
      background: theme.palette.surfaceWhite,
      border: `1px solid ${theme.palette.borderSubtle1}`,
      boxShadow: `inset 3px 0 0 0 ${WARNING_INK}`,
    }),
    forecastOk: w({ boxShadow: `inset 3px 0 0 0 ${theme.palette.surfaceSuccessStrong}` }),
    forecastTitle: w({ ...theme.typography.h6, color: theme.palette.textPrimary, marginBottom: 3 }),
    forecastBody: w({ ...theme.typography.body3, color: theme.palette.textSecondary2 }),

    /* ── ② Computing ───────────────────────────────────────────────────────────
       The workspace's own thinking stage, reproduced here: the orb, one shimmering line
       replaced as the run progresses, and a tick per line. Copied by value rather than
       imported — `harmonizeWorkspace.styles.js` belongs to the other shell and a shared
       class would be a way for one experiment to restyle the other. */
    thinkingStage: w({
      /* `100%` of the body, not a pixel floor: the body is a flex item with a definite
         height, so the stage can fill it and centre the orb in the drawer rather than in
         the first 320px of it — which is where a `minHeight` left it, hanging near the
         top of a mostly empty panel. */
      minHeight: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 14,
      padding: '8px 4px 24px',
      textAlign: 'center',
    }),
    /* The package paints greyscale and takes no colour prop, so the brand is blended
       over it rather than filtered. */
    orbTint: w({
      position: 'relative',
      width: 64,
      height: 64,
      '&::after': {
        content: '""',
        position: 'absolute',
        inset: 0,
        background: theme.palette.surfaceBrand,
        mixBlendMode: 'lighten',
        pointerEvents: 'none',
      },
    }),
    /* Fixed height: remounting an auto-height element to replay its animation makes the
       orb hop by however tall the last line was. */
    thinkingLineSlot: w({
      height: 40,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
    }),
    /**
     * Two animations, two jobs: the fade in/hold/out timed to the line's own duration so
     * it cannot be cut off mid-word, and a grey-brand-grey shimmer travelling left to
     * right that says *still working* about a sentence written in the present tense.
     */
    thinkingLine: w({
      maxWidth: 320,
      fontSize: 13,
      fontWeight: 500,
      lineHeight: '18px',
      backgroundImage: `linear-gradient(100deg, ${theme.palette.textSecondary3} 28%, ${theme.palette.surfaceBrand} 46%, ${theme.palette.surfaceBrand} 54%, ${theme.palette.textSecondary3} 72%)`,
      backgroundSize: '250% 100%',
      backgroundRepeat: 'no-repeat',
      WebkitBackgroundClip: 'text',
      backgroundClip: 'text',
      color: 'transparent',
      WebkitTextFillColor: 'transparent',
      animationName: '$thinkingLineIn, $thinkingShimmer',
      animationTimingFunction: 'ease, linear',
      animationIterationCount: '1, infinite',
      animationFillMode: 'both, none',
      /* Drops the shimmer *and* the travel — the old rule kept `thinkingLineIn`, which
         still moved the line 8px. Under reduced motion the line simply fades. */
      '@media (prefers-reduced-motion: reduce)': {
        animationName: '$thinkingLineFade',
        WebkitTextFillColor: theme.palette.textSecondary2,
        color: theme.palette.textSecondary2,
      },
    }),
    '@keyframes thinkingLineIn': {
      '0%': { opacity: 0, transform: 'translateY(4px)' },
      '14%': { opacity: 1, transform: 'none' },
      '86%': { opacity: 1, transform: 'none' },
      '100%': { opacity: 0, transform: 'translateY(-4px)' },
    },
    '@keyframes thinkingLineFade': {
      '0%': { opacity: 0 },
      '14%': { opacity: 1 },
      '86%': { opacity: 1 },
      '100%': { opacity: 0 },
    },
    '@keyframes thinkingShimmer': {
      '0%': { backgroundPosition: '160% 0' },
      '100%': { backgroundPosition: '-60% 0' },
    },
    thinkingTicks: w({ display: 'flex', alignItems: 'center', gap: 5 }),
    thinkingTick: w({
      width: 5,
      height: 5,
      borderRadius: '50%',
      background: theme.palette.borderSubtle2,
      transition: 'background 260ms ease',
    }),
    thinkingTickDone: w({
      width: 5,
      height: 5,
      borderRadius: '50%',
      background: theme.palette.surfaceBrand,
      transition: 'background 260ms ease',
    }),

    /* ── ⑤ Commit ──────────────────────────────────────────────────────────────── */
    commitIntro: w({
      ...theme.typography.body3,
      color: theme.palette.textSecondary2,
      marginBottom: 16,
    }),
    commitRow: w({
      display: 'flex',
      gap: 12,
      padding: '12px 0',
      borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
      '&:last-of-type': { borderBottom: 'none' },
    }),
    commitFigure: w({
      flex: '0 0 auto',
      minWidth: 46,
      ...theme.typography.h4,
      color: theme.palette.textPrimary,
      fontVariantNumeric: 'tabular-nums',
      lineHeight: '22px',
    }),
    commitFigureQuiet: w({ color: theme.palette.textSecondary2 }),
    commitHeadline: w({ ...theme.typography.subtitle2, color: theme.palette.textPrimary }),
    commitDetail: w({
      ...theme.typography.body3,
      color: theme.palette.textSecondary2,
      marginTop: 2,
    }),
    /* The one consequence an Undo cannot reach (D1), so it is boxed rather than run into
       the list. */
    commitCaveat: w({
      marginTop: 16,
      padding: '12px 14px',
      borderRadius: 8,
      background: theme.palette.surfaceGreySubtle,
    }),
    commitCaveatTitle: w({
      ...theme.typography.h6,
      color: theme.palette.textPrimary,
      marginBottom: 3,
    }),
    commitFootnote: w({
      ...theme.typography.subtitle3,
      color: theme.palette.textSecondary2,
      marginTop: 12,
    }),
    noInstaller: w({ ...theme.typography.subtitle3, fontWeight: 600, color: WARNING_INK }),

    /* ── Footer ────────────────────────────────────────────────────────────────
       `flex-end`, 12px gap, secondary then primary, on a top hairline — the app's
       drawer footer, copied by value from `salesComponents/components/drawerFooter`. */
    footer: w({
      flex: '0 0 auto',
      padding: '16px 24px',
      borderTop: `1px solid ${theme.palette.borderSubtle1}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      gap: 12,
      background: theme.palette.surfaceWhite,
    }),
    footerNote: w({
      ...theme.typography.subtitle3,
      color: theme.palette.textSecondary2,
      marginRight: 'auto',
    }),

    /* ④ announces its pricing and refusals rather than only colouring them. */
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
  };
});
