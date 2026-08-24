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

/** `textPrimary` at 6%. Named because it is otherwise the only literal in the sheet. */
const EDGE_SHADOW = 'rgba(38, 37, 39, 0.06)';

/**
 * Film grain, as an inline SVG turbulence rather than a bitmap.
 *
 * A large smooth gradient is where 8-bit colour banding shows worst — the wash across a
 * 475px drawer crosses enough steps to draw visible rings — and a little noise is the
 * standard cure: it dithers the boundaries away and gives the glow a physical surface
 * instead of a plastic one. Inline because it is ~300 bytes and a PNG would be a network
 * request for texture that must be there on the first frame of a four-second state.
 *
 * `%23` is a literal `#`, which cannot appear unescaped inside a `url()` data URI.
 */
const GRAIN =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='140' height='140'>" +
  "<filter id='g'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/>" +
  "<feColorMatrix type='saturate' values='0'/></filter>" +
  "<rect width='140' height='140' filter='url(%23g)' opacity='0.55'/></svg>\")";

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
      position: 'relative',
      /* The ② wash is a child of *this*, not of the body — see `washLayer`. It paints to
         the paper's own edges, so the shell is what has to clip it. */
      overflow: 'hidden',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      background: theme.palette.surfaceWhite,
    }),

    /* ── The three bands ───────────────────────────────────────────────────────
       All three are `position: relative` so they paint *above* the absolutely-positioned
       wash behind them. A positioned element outranks a static one whatever the DOM order,
       so without this the four wash layers would sit on top of the title, the orb and the
       footer button rather than behind them. With it, order decides — and all three come
       after the wash. */
    head: w({
      position: 'relative',
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
    /**
     * `assets/svg/close.svg` now, not a hand-drawn stroke path — the mark every other
     * drawer in the product closes with (`paymentsDrawer`, `shiftDetail`'s own header,
     * two dozen others). It is a filled shape (`fill="#323232"`, not `currentColor`), so
     * unlike the icon it replaced, its own colour cannot shift on hover — only the
     * button's background can, which is what `:hover` below is left doing.
     */
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
      cursor: 'pointer',
      transition: 'background 120ms ease',
      '& svg': { width: 16, height: 16 },
      '&:hover': { background: theme.palette.surfaceGreySubtle },
      '&:focus-visible': { outline: `2px solid ${theme.palette.borderBrand}`, outlineOffset: 1 },
    }),
    /* `textPlaceholder`, which is what `drawerHeader`'s `bulkSubHeading` uses for exactly
       this line in every other drawer — and a step darker than the grey this had.

       `subtitleRow` is gone with the `Configuration` button that was the only reason the
       subtitle needed a row of its own; the link lives on ①'s `Scope` heading now. */
    subtitle: w({
      ...theme.typography.body2,
      color: theme.palette.textPlaceholder,
      marginTop: 6,
    }),

    /**
     * ③'s reasoning trail — **a light disclosure, not an accordion.**
     *
     * `spillBar`'s own full-width-button, generous-padding treatment is right for a
     * queue of decisions a planner works through; this is read once, out of curiosity,
     * so the control itself is a plain inline text button — closer to `sectionAction`
     * (①'s `Configuration` link) than to the issues bar below the route.
     */
    reasoningTrail: w({ marginTop: 10 }),
    reasoningToggle: w({
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      padding: '4px 6px',
      margin: '-4px -6px',
      border: 'none',
      borderRadius: 6,
      background: 'transparent',
      cursor: 'pointer',
      transition: 'background 120ms ease',
      '&:hover': { background: theme.palette.surfaceGreySubtle },
      '&:focus-visible': { outline: `2px solid ${theme.palette.borderBrand}`, outlineOffset: 1 },
    }),
    reasoningIcon: w({ width: 14, height: 14, flex: '0 0 auto', color: theme.palette.textBrand }),
    /**
     * The disclosure's label — **grey, and a step quieter than it was.**
     *
     * It was `textSecondary1` (`#444446`) at weight 600, which is very nearly body-copy
     * weight in near-black: on screen it read as a small heading over the tray below it
     * rather than as a control you may ignore. Asked for it grey, and grey is right for
     * what this is — a footnote nobody opens on most visits, sitting between the route a
     * planner just read and the issues they have to act on. `textSecondary3` (`#86868B`)
     * is the same grey the chevron beside it already uses, so the label and its indicator
     * are finally one control rather than a dark word with a pale arrow after it.
     *
     * Weight 500 with it: 600 was carrying the emphasis that the colour has now given up,
     * and leaving it would have made the label bold *and* faint, which is neither.
     *
     * `subtitle3` still — the size is not the problem and shrinking a control that is
     * already the quietest thing in the region would make it a target nobody can hit.
     *
     * **This is the shared drawer sheet, so the Drawer shell changes too.** Deliberate:
     * `ReasoningTrail` is one component in both shells and two greys for the same
     * disclosure would be drift, not design. The same call was made when this control lost
     * its sparkle icon and its longer label.
     */
    reasoningToggleLabel: w({
      ...theme.typography.subtitle3,
      color: theme.palette.textSecondary3,
    }),
    /* Bounded, the same reasoning `spillBody` is: a run that narrated a long week should
       not be able to push the day tabs off the top of the drawer. */
    reasoningBody: w({
      maxHeight: '26vh',
      overflowY: 'auto',
      marginTop: 8,
      paddingLeft: 20,
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
    }),
    reasoningRow: w({ display: 'flex', gap: 8, alignItems: 'baseline' }),
    /* The tick's own successor — ② marked *how much of the telling was left* with a row
       of dots; here, with the whole trail visible at once, the plain ordinal does the
       same job of saying "this happened, in this order" without re-litigating progress
       that finished the moment ③ arrived. */
    reasoningIndex: w({
      ...theme.typography.subtitle3,
      flex: '0 0 auto',
      width: 14,
      color: theme.palette.textSecondary3,
      fontVariantNumeric: 'tabular-nums',
    }),
    reasoningLine: w({
      ...theme.typography.subtitle3,
      color: theme.palette.textSecondary2,
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

    /**
     * The ghost tab that adds a route — **a sibling of the tabs that is not one of them.**
     *
     * It borrows the row's own vertical rhythm (`4px 4px 12px`, `marginBottom: -1`) so the
     * cross sits on the tabs' baseline and the row does not grow a pixel to hold it, and
     * takes none of their state vocabulary: no count pill, no 2px underline, no selected
     * colour, because it does not select a panel. `textSecondary3` at rest — a step
     * quieter than an unselected tab's `textPlaceholder`, which is the whole of "ghost"
     * here — going brand on hover, the same move a real tab makes, since that much is
     * shared: both are things you click in this row.
     */
    tabAdd: w({
      flex: '0 0 auto',
      display: 'grid',
      placeItems: 'center',
      padding: '4px 4px 12px',
      marginBottom: -1,
      border: 'none',
      background: 'transparent',
      color: theme.palette.textSecondary3,
      cursor: 'pointer',
      transition: 'color 120ms ease',
      '&:hover': { color: theme.palette.textBrand },
      '&:focus-visible': { outline: `2px solid ${theme.palette.borderBrand}`, outlineOffset: 2 },
    }),

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
    body: w({
      position: 'relative',
      flex: '1 1 auto',
      minHeight: 0,
      overflowY: 'auto',
      padding: '20px 24px 24px',
    }),
    /**
     * The route row's wrapper — **and it paints nothing at all now.**
     *
     * ## Two failed attempts, and what was actually wrong
     *
     * This box used to carry the hover fill. It cannot, and the reason is `stopTrackColumn`'s
     * dashed rule: the rule reaches the next pin by way of a **28px bottom margin on
     * `stopLine`**, and that margin lives *inside* this wrapper. So a background painted here
     * was 101px tall for a 61px row — measured, not guessed — a grey slab running from the
     * site name down across the connector to the stop below. Padding it (attempt one) or
     * padding it symmetrically (attempt two) only moved that slab's edges; nothing about
     * either version could shrink it back to the row, because the extra 40px was a *child's
     * margin*, not this box's padding.
     *
     * The workspace's own `stopLine` already solved this — its comment says so in as many
     * words: *"painting through it made the ground 60px tall for a 20px line"*, which is why
     * the gap there is a margin outside the painted box and the paint sits on the row. The
     * correct fix was to stop overriding that and let the row paint itself; see
     * `flowStopLine`, which is now the only thing with a background, sized and padded to
     * match `spillRow` in the accordion exactly.
     *
     * What is left here is what a wrapper is for: the entrance animation, the dimmed
     * dragging state, the tipping edge, and — because it is the element a pointer is over
     * for the whole row — revealing the row's move button.
     */
    stopHoverRow: w({
      /* `data-move`, not a `$ruleRef`: JSS rule references do not resolve inside this
         sheet's `'&&'` wrapper, and the failure is silent and swallows every rule declared
         after it — see the note on `footerBand`. A plain attribute selector cannot fail
         that way. */
      '&:hover [data-move], & [data-move]:focus-visible': { opacity: 1 },
    }),
    /**
     * The row's move button — **revealed by the row, not by itself.**
     *
     * `opacity: 0` with the reveal living on `stopHoverRow:hover` above: hidden at rest so
     * a twelve-stop route is a route rather than a column of action icons, and revealed by
     * hovering *anywhere* on the row rather than by finding the icon first. `visibility` is
     * deliberately left alone — the button keeps its place in the title row's flex line at
     * all times, so revealing it cannot shift the site name beside it, and it stays
     * reachable by keyboard (its own `:focus-visible` is the second half of the reveal).
     */
    stopMoveButton: w({
      flex: '0 0 auto',
      display: 'grid',
      placeItems: 'center',
      width: 22,
      height: 22,
      padding: 0,
      border: 'none',
      borderRadius: 4,
      background: 'transparent',
      color: theme.palette.textSecondary3,
      cursor: 'pointer',
      opacity: 0,
      transition: 'opacity 120ms ease, background 120ms ease, color 120ms ease',
      '&:hover': { background: theme.palette.surfaceWhite, color: theme.palette.textBrand },
      '&:focus-visible': { outline: `2px solid ${theme.palette.borderBrand}`, outlineOffset: 1 },
    }),
    stopDragging: w({ opacity: 0.4 }),
    /* The stop the shift expires during. An edge, not a wash — filled, it merged with
       the amber panel below and the two read as one block. */
    stopTipping: w({
      boxShadow: `inset 3px 0 0 0 ${WARNING_INK}`,
      paddingLeft: 8,
      marginLeft: -8,
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
    /**
     * The reason, with the orb beside it — **this sentence is the optimizer talking.**
     *
     * Every other line on a tray row is a fact about the visit (its site, its company, its
     * filters, its hours). This one is the engine's own account of why it could not place
     * it, which is the same voice ② narrated in and the reasoning trail replays. The orb is
     * `ThinkingOrb` held `paused` — the mark the drawer already uses for "the optimizer",
     * frozen, because nothing is being worked out any more.
     */
    trayReasonRow: w({
      display: 'flex',
      alignItems: 'flex-start',
      gap: 7,
      marginTop: 6,
    }),
    /* A fixed box for the canvas so a row's text cannot reflow around it as it settles. */
    trayReasonOrb: w({
      flex: '0 0 auto',
      width: 20,
      height: 20,
      marginTop: -1,
    }),
    trayReason: w({
      ...theme.typography.subtitle3,
      color: theme.palette.textSecondary2,
    }),
    /**
     * What is left of the remedy line.
     *
     * **The gear button this dressed is gone** — see `SpillTray`, which carries the
     * argument. This class survives because a set-aside row still uses it for its own
     * one-line `Put it back` hint, which is a *label* on a draggable row rather than a
     * control, so it keeps the treatment and loses nothing by the button's removal.
     * `trayRemedyIcon` went with the gear.
     */
    trayRemedy: w({
      ...theme.typography.subtitle3,
      fontWeight: 600,
      color: theme.palette.textBrand,
      background: 'none',
      border: 'none',
      padding: 0,
      marginTop: 8,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: 5,
      textAlign: 'left',
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
    /**
     * A field's name, at the size this app writes field names: **14px / 500, sentence
     * case.**
     *
     * It was `overline` — 10px, uppercase, letter-spaced — which is a label style this
     * product does not use for form fields anywhere. `harmonize/components/FieldLabel`
     * is the convention and it is 14/500; matching it is the difference between a field
     * that looks like the rest of the app and one that looks like a spreadsheet header.
     */
    fieldLabel: w({
      ...theme.typography.subtitle2,
      color: theme.palette.textSecondary2,
      display: 'block',
      marginBottom: 8,
    }),

    /**
     * A section's name — a real heading, not a small caps label.
     *
     * `In scope` and `Working days` are the two things a planner scans this panel for, and
     * as 10px uppercase they were the smallest text on screen while being the most
     * structural. `h4` puts them one clear step under the drawer title and makes the two
     * sections weigh the same as each other, which is what makes the panel scannable.
     */
    sectionHeading: w({
      ...theme.typography.h4,
      /* `h4` is 700 — a full step heavier than this heading earns next to a 14/500 text
         button on the same row. 500 keeps the size and step-under-the-title relationship
         `h4` was chosen for, without reading louder than the action beside it. */
      fontWeight: 500,
      color: theme.palette.textPrimary,
    }),

    rangePicker: w({ width: '100%' }),
    /* Nothing sits under the field now — the count it carried is the `Visits` figure eight
       pixels below it, and `rangeCount` went with the duplication rather than being made
       quieter. */
    hint: w({ ...theme.typography.body2, color: theme.palette.textSecondary2, marginTop: 10 }),

    /**
     * A section heading and its action, on one line.
     *
     * `baseline`, not `center`: the heading is 16px and the text button 14px, and centring
     * a 2px type difference tilts the row rather than aligning it — the same call
     * `proposedHead` makes next door in the other direction, for a pair whose sizes differ
     * enough that a shared baseline would look dropped.
     */
    sectionHead: w({
      display: 'flex',
      alignItems: 'baseline',
      justifyContent: 'space-between',
      gap: 12,
      minWidth: 0,
    }),

    /* A section heading that carries its own action on the right, now with its gear. */
    sectionAction: w({
      '&.MuiButton-root': {
        /* `onlyText` is the theme's own link-button variant; the negative right margin
           pulls its padding back so the label sits flush with the gutter the section
           label starts from. */
        flex: '0 0 auto',
        minWidth: 0,
        height: 'auto',
        padding: '2px 6px',
        marginRight: -6,
        marginTop: -2,
        display: 'flex',
        alignItems: 'center',
        gap: 5,
      },
    }),
    /* The gear — recognisable before the label is read, and the same mark this action
       leads to in Settings. Sized down from the icon set's 20px default so it sits on
       the text button's own baseline rather than overshooting it. */
    sectionActionIcon: w({ width: 14, height: 14, flex: '0 0 auto' }),

    /**
     * Working days, as a small **table**.
     *
     * Each row carries three facts — the date, the zone it covers, the shift it runs —
     * and as a two-part row with the zone and hours crammed into one right-aligned string
     * ("Zone North · 4h") they had to be read apart every time. Columns with heads let the
     * eye go down *one* fact: which zones are covered, or which day is short.
     *
     * Hairlines rather than a filled panel: a grey box reads as an input group, and these
     * are read-only values quoted from Settings.
     */
    /**
     * The days, as a **three-column table**.
     *
     * ## Closing the gap without a fourth column
     *
     * At `1fr 84px 56px` the day column measured **311px for an 85px value** — about 226px
     * of white between a day and its own zone, on the single axis this table is read
     * across. An `Est. load` column was added to occupy that space and then taken back out:
     * it worked, and it worked by printing a second prediction of the very fact the forecast
     * note underneath already states in words.
     *
     * So the space is closed by proportion instead. `1.15fr 1fr 76px` puts a day within
     * about 90px of its own zone — **proportional** rather than a fixed day width, so a
     * longer locale's date cannot push the shift column off the right edge, and the numeric
     * column fixed and right-aligned so the hours form one column the eye runs down. What
     * ties the three values into a single record is the row's hover tint, which is the
     * conventional answer to exactly this and costs no duplicated figure.
     *
     * ## It opens with a rule
     *
     * `Visits · Filters · Est. work` sits directly above `Day · Zone · Shift` —
     * two rows of small grey text, similar size and colour, entirely different meanings, and
     * they read as one confused block. The `borderTop` makes the table visibly a second
     * object rather than a continuation of the stat labels; it is cheaper than a filled
     * header row, which a note further up this sheet rules out for reading as an input group.
     */
    dayTable: w({
      marginTop: 20,
      paddingTop: 4,
      borderTop: `1px solid ${theme.palette.borderSubtle1}`,
    }),
    dayHeadRow: w({
      display: 'grid',
      gridTemplateColumns: '1.15fr 1fr 76px',
      gap: 10,
      padding: '8px 0',
      borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
    }),
    dayHeadCell: w({
      ...theme.typography.subtitle3,
      color: theme.palette.textSecondary3,
    }),
    /* Right-aligned to sit over the figures it names. One key for both numeric heads —
       `dayHeadShift` was the same three declarations under a name that claimed only one of
       the two columns. */
    dayHeadNum: w({
      ...theme.typography.subtitle3,
      color: theme.palette.textSecondary3,
      textAlign: 'right',
    }),
    dayRow: w({
      display: 'grid',
      gridTemplateColumns: '1.15fr 1fr 76px',
      gap: 10,
      alignItems: 'baseline',
      padding: '11px 0',
      borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
      '&:last-child': { borderBottom: 'none' },
      /* The conventional aid for exactly the fault above: even with the gap closed, a row
         the pointer is on is a row whose four values are unambiguously one record. It runs
         to the content edge rather than bleeding into the 24px gutter — the hairlines above
         and below it stop there too, so a wider tint would read as a band laid over the
         table instead of as one of its rows. */
      transition: 'background 120ms ease',
      '&:hover': { background: theme.palette.surfaceGreySubtle },
    }),
    dayName: w({ ...theme.typography.subtitle1, color: theme.palette.textPrimary }),
    dayZone: w({ ...theme.typography.body2, color: theme.palette.textSecondary1 }),
    /**
     * The shift, **plainly quoted, with no grading.**
     *
     * A short day used to mark itself here in amber, with a matching dot — the same fact
     * the forecast notes stated in words two lines below. Both are gone now: this table is
     * a read-only mirror of Config A, and a mirror that colours one of its own rows is
     * making a judgement about a setting it did not ask to have an opinion on. Tabular so
     * the hours still form a column the eye can run down.
     */
    dayShift: w({
      ...theme.typography.body2,
      color: theme.palette.textSecondary1,
      fontVariantNumeric: 'tabular-nums',
      textAlign: 'right',
    }),

    /* ── ①'s loading skeleton ─────────────────────────────────────────────────
       `planRange` finishes in under a millisecond, so without this the panel that exists
       to *predict* a run never looks like it computed anything. Held for `SETTLE_MS` on
       open and on every range change — see `ScopeState`. */
    skeletonBar: w({
      height: 14,
      borderRadius: 4,
      background: theme.palette.surfaceGreySubtle,
      animation: '$skeletonPulse 1100ms ease-in-out infinite',
      '@media (prefers-reduced-motion: reduce)': { animation: 'none', opacity: 0.7 },
    }),
    '@keyframes skeletonPulse': {
      '0%, 100%': { opacity: 0.55 },
      '50%': { opacity: 1 },
    },
    skeletonStatValue: w({ width: 42, height: 22, marginBottom: 5 }),
    skeletonStatLabel: w({ width: 56, height: 12 }),
    skeletonDayName: w({ width: '70%', maxWidth: 120 }),
    skeletonDayZone: w({ width: '55%', maxWidth: 70 }),
    skeletonDayShift: w({ width: '100%', justifySelf: 'end' }),
    /* The real content's own entrance, run every time the skeleton hands off to it — on
       open, and again on every range change, so an updated week never just snaps into
       place under a planner's eye. */
    scopeReveal: w({
      animation: '$scopeRevealIn 260ms cubic-bezier(0.22, 0.61, 0.36, 1) both',
      '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
    }),
    '@keyframes scopeRevealIn': {
      from: { opacity: 0, transform: 'translateY(4px)' },
      to: { opacity: 1, transform: 'translateY(0)' },
    },
    /**
     * In scope, as three figures rather than a sentence.
     *
     * The prose version made a reader parse a line left to right to find any one number
     * in it. Figures over labels are read in one pass, and the three compare against each
     * other and against the next run without re-reading.
     */
    statRow: w({ display: 'flex', gap: 32, marginTop: 12, marginBottom: 12 }),
    stat: w({ display: 'flex', flexDirection: 'column', gap: 1 }),
    statValue: w({
      ...theme.typography.h3,
      color: theme.palette.textPrimary,
      fontVariantNumeric: 'tabular-nums',
      lineHeight: '28px',
    }),
    statLabel: w({ ...theme.typography.body2, color: theme.palette.textSecondary2 }),
    /* The pool already exceeds the shifts, before a mile is driven. Amber, not red: D3
       makes the cap soft and this is a forecast, not a refusal. */
    statValueWarn: w({ color: WARNING_INK }),

    section: w({ marginBottom: 28 }),
    /**
     * The range field's own section, with more air under it than a section gap.
     *
     * `Range` is a field label rather than a heading now, so the two blocks no longer differ
     * in type weight and the *space* has to do the separating on its own — 28px was enough
     * while `Scope` outranked it, and without that it reads as one continuous form. 40px puts
     * a clear break between *the thing you set* and *what setting it produced*.
     */
    rangeSection: w({ marginBottom: 40 }),

    /* ── ② Computing ───────────────────────────────────────────────────────────
       The workspace's own thinking stage, reproduced here: the orb, one shimmering line
       replaced as the run progresses, and a tick per line. Copied by value rather than
       imported — `harmonizeWorkspace.styles.js` belongs to the other shell and a shared
       class would be a way for one experiment to restyle the other. */
    /**
     * ## The wash behind the orb
     *
     * Four explicit layers rather than two pseudo-elements, because each one has to move
     * on its own schedule and `::before`/`::after` only give you two:
     *
     * 1. **`auroraTop`** — the glow on the drawer's top edge, drifting sideways.
     * 2. **`auroraSides`** — the two edge glows, breathing on a different, longer cycle.
     * 3. **`grain`** — noise, blended into the colour beneath rather than laid over the
     *    whole panel, so the wash has a surface instead of looking like flat plastic.
     * 4. **`eclipse`** — a white ellipse over the centre. The aurora is *occluded* rather
     *    than faded, which is what keeps the colour clean at the edges and the middle
     *    genuinely white.
     *
     * **Two cycles, deliberately out of step.** One layer breathing on one timer reads as
     * a static image with the brightness wobbling — which is exactly the "not animated"
     * it looked like. Two layers drifting at 13s and 19s never repeat the same
     * arrangement inside the four seconds anyone watches, so the wash reads as alive
     * without anything visibly sliding.
     *
     * **Much weaker than it was.** The previous pass pushed opacity to 0.55–0.85 and the
     * green sat on the panel like a filter. The colour is scenery behind a sentence, so
     * it belongs at the strength where you notice it only if you look for it.
     */
    /**
     * ②'s content box — **layout only now, and no longer the wash's container.**
     *
     * It kept `overflow: hidden` and a `-20px -24px -24px` margin to cancel the body's
     * padding and bleed the glow to three of the paper's four edges. The fourth was the
     * problem: the body begins *below* the head, so the top edge this box could bleed to
     * was the heading's bottom, and an aurora anchored above its own top edge to fall
     * inward from it got sliced off flat there. A negative margin cannot reach into a
     * sibling's band, and a box that scrolls has to clip, so the layers moved to `shell`
     * and this one went back to centring the orb.
     */
    thinkingStage: w({
      position: 'relative',
      minHeight: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '4px 4px 20px',
      textAlign: 'center',
    }),
    /**
     * One of ②'s four wash layers, **a child of `shell`**.
     *
     * Absolute against the paper itself, which is what puts the aurora's brightest band on
     * the drawer's own top edge and runs the light behind the title, the tabs' band and the
     * footer without a seam at any of them. `shell` clips it; `head`, `body` and `footer`
     * are `position: relative` so their content stays in front of it.
     */
    washLayer: w({
      position: 'absolute',
      inset: 0,
      pointerEvents: 'none',
      /* Decoration. Under reduced motion the layers hold a mid-position rather than
         freezing at whatever frame the animation happened to start on. */
      '@media (prefers-reduced-motion: reduce)': { animation: 'none !important' },
    }),
    /**
     * Dims the colour layers for every state but ②, **as a wrapping parent's opacity,
     * not a competing value on the layers themselves.**
     *
     * `auroraTop`/`auroraSides` already animate their own `opacity` in their keyframes
     * (0.2–0.38, 0.16–0.3) — a CSS animation owns its animated property outright while
     * it runs, so a second class setting `opacity` on the *same element* would simply
     * lose, whichever one is later in the sheet. A non-positioned wrapper carrying the
     * dimming instead multiplies with whatever the children are doing frame to frame,
     * because `opacity` compounds across parent and child regardless of which one is
     * animating. Not positioned, so it does not become the containing block the layers'
     * `inset: 0` resolves against — that stays `shell`.
     */
    /**
     * The colour layers' shared parent — **absolute, so it is not a flex item.**
     *
     * `shell` is a flex column, and this wrapper was a plain `Box` in it: a zero-height
     * flex line between the wash and the head that happened to cost nothing today and
     * would have been a real one-pixel gap the moment anything inside it stopped being
     * absolutely positioned. Positioning it also makes it the containing block its
     * children's `inset: 0` resolves against, which is what it looks like it should be.
     */
    washGroup: w({ position: 'absolute', inset: 0, pointerEvents: 'none' }),
    washQuiet: w({ opacity: 0.32 }),
    auroraTop: w({
      /* Anchored above the top edge so the brightest part lands *on* the border and falls
         inward — the shape in the reference, rather than a blob in the middle. */
      backgroundImage: `radial-gradient(120% 42% at 50% -8%, ${theme.palette.surfaceBrand} 0%, transparent 68%)`,
      opacity: 0.3,
      animation: '$auroraTopDrift 11s ease-in-out infinite',
    }),
    auroraSides: w({
      backgroundImage: `radial-gradient(34% 60% at -4% 26%, ${theme.palette.surfaceBrand} 0%, transparent 70%),
        radial-gradient(34% 60% at 104% 26%, ${theme.palette.surfaceBrand} 0%, transparent 70%)`,
      opacity: 0.24,
      animation: '$auroraSideDrift 15s ease-in-out infinite',
    }),
    grain: w({
      backgroundImage: GRAIN,
      mixBlendMode: 'overlay',
      opacity: 0.5,
    }),
    /**
     * The veil that keeps the aurora off the words — **broad, and no longer aimed.**
     *
     * It was `56% 42% at 50% 56%`: a white core sized and placed to sit exactly behind the
     * orb. That worked while this layer was a child of the stage box, which was the body's
     * height. Now the wash spans the whole paper (see `washLayer`), so `56%` of it lands
     * about 45px below the orb — the core drifted off the thing it was calibrated to, and
     * chasing it with a hand-tuned percentage would make the number depend on the head's
     * and footer's heights.
     *
     * So it stops aiming. A wide, soft veil holds the middle of the paper back without
     * claiming a centre, and the orb gets its own ground from `orbHalo` — which is a child
     * of the orb and therefore cannot drift from it.
     */
    eclipse: w({
      background: `radial-gradient(86% 60% at 50% 48%, ${theme.palette.surfaceWhite} 0%, ${theme.palette.surfaceWhite} 30%, transparent 78%)`,
    }),
    /**
     * ## Why these are closed loops with waypoints, and not two-point `alternate` pairs
     *
     * They were `13s`/`19s ease-in-out infinite alternate` between two states, and the
     * arithmetic is what was wrong with them: `alternate` makes 13s a *half* cycle, so the
     * full round trip was 26 and 38 seconds. ② is on screen for about four. A viewer
     * therefore saw roughly a sixth of one direction of one axis — a wash that was
     * technically animating and observably still, which is exactly the "not animated" it
     * was reported as twice.
     *
     * Three fixes, all aimed at *travel inside four seconds* rather than at more motion:
     *
     * 1. **Closed loops** (`0%` and `100%` identical) so `infinite` needs no `alternate` and
     *    the whole duration is one pass. 11s and 15s are now full cycles, not halves.
     * 2. **Waypoints**, so the light moves along a path instead of sliding up and down one
     *    diagonal. Any four-second window now contains a change of direction, which is what
     *    reads as *flowing* rather than as drifting.
     * 3. **Travel, not blinking.** The translation ranges roughly doubled while the opacity
     *    ranges stayed narrow (0.24–0.36, 0.16–0.30). Opacity is the one channel that reads
     *    as a *pulse* — a thing being switched — where position reads as light moving.
     *
     * Still deliberately quiet: peak opacity is unchanged, and the two cycles stay coprime
     * enough that they do not visibly resynchronise while anyone is watching.
     */
    '@keyframes auroraTopDrift': {
      '0%': { opacity: 0.24, transform: 'translate3d(-7%, -3%, 0) scale(1.04)' },
      '30%': { opacity: 0.34, transform: 'translate3d(4%, 2%, 0) scale(1.12)' },
      '58%': { opacity: 0.28, transform: 'translate3d(8%, -2%, 0) scale(1.07)' },
      '80%': { opacity: 0.32, transform: 'translate3d(-2%, 4%, 0) scale(1.1)' },
      '100%': { opacity: 0.24, transform: 'translate3d(-7%, -3%, 0) scale(1.04)' },
    },
    '@keyframes auroraSideDrift': {
      '0%': { opacity: 0.18, transform: 'translate3d(0, 5%, 0) scale(1)' },
      '26%': { opacity: 0.3, transform: 'translate3d(-3%, -2%, 0) scale(1.08)' },
      '55%': { opacity: 0.22, transform: 'translate3d(2%, -6%, 0) scale(1.03)' },
      '78%': { opacity: 0.28, transform: 'translate3d(3%, 1%, 0) scale(1.09)' },
      '100%': { opacity: 0.18, transform: 'translate3d(0, 5%, 0) scale(1)' },
    },

    /* Above both washes — a positioned `::after` otherwise paints over static content. */
    stageContent: w({
      position: 'relative',
      zIndex: 1,
      /* Full width, or the flex column shrink-wraps and the line slot inherits a column
         barely wider than the orb — which wrapped "Sequencing Wed 19 — 5 stops" onto
         three lines and made the fixed-height slot overflow. */
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 14,
    }),

    /**
     * The orb, **untinted**.
     *
     * The workspace lays a brand-coloured `mix-blend-mode: lighten` square over it,
     * because the package paints greyscale and takes no colour prop. That trick composites
     * against whatever is behind the orb, and behind it here is a gradient — so the result
     * ranged from correct to a flat green block depending on where the eclipse's white
     * core happened to fall that frame. A tint that changes with its own backdrop is not a
     * tint, and this stage already carries the brand in the aurora around it.
     *
     * Left as a positioned box so the canvas has a sized parent to fill.
     */
    /* Blended rather than filtered: the package paints greyscale and takes no colour
       prop. 64 is one of its two tuned sizes — separate designs, not a scale factor.
       `zIndex: 0` opens its own stacking context so `orbHalo`'s negative z-index stays
       scoped to this box instead of falling all the way back to the wash layers. */
    orbTint: w({ position: 'relative', width: 64, height: 64, zIndex: 0 }),
    /**
     * The orb's own ground — **referenced above, and, until now, never built.**
     *
     * The eclipse stopped aiming at the orb (see above) once the wash moved to `shell`,
     * because a percentage tuned for the body's centre drifts the moment the head or
     * footer changes height. This is the other half of that fix: a white ground sized
     * and centred against the orb itself, so it cannot drift from it — the eclipse only
     * has to hold the *middle of the paper* back now, not track the orb's exact position.
     *
     * `inset: -20` gives the canvas's 64px box a margin of clean ground on every side
     * before the gradient fades, and `zIndex: -1` (against `orbTint`'s own stacking
     * context) keeps it behind the canvas without reaching past `orbTint` to affect
     * anything else in the stage.
     */
    orbHalo: w({
      position: 'absolute',
      inset: -20,
      zIndex: -1,
      borderRadius: '50%',
      pointerEvents: 'none',
      background: `radial-gradient(circle, ${theme.palette.surfaceWhite} 0%, ${theme.palette.surfaceWhite} 52%, transparent 76%)`,
    }),
    /**
     * The line slot — **two lines live here at once**, and that is the whole effect.
     *
     * A single element that remounts can only ever cut: the old words vanish on the frame
     * the new ones appear, and with a shimmer travelling through them it reads as text
     * being typed in rather than a thought being replaced. So the outgoing line stays
     * mounted for its exit and both animate *upward together* — the old one rising away
     * and fading, the new one rising into its place from below. One motion, handed off.
     *
     * Both are absolutely positioned so they occupy the same space during the handover;
     * the slot's fixed height is what stops the orb hopping as lines of different lengths
     * swap through it.
     */
    thinkingLineSlot: w({
      position: 'relative',
      height: 44,
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }),
    /**
     * ②'s narration line, on review.
     *
     * **The rest colour was `textSecondary2` — a caption grey — for the whole sentence
     * except the 8% of the sweep passing through it.** A narration line is the one thing
     * on this screen a planner is meant to actually read, and it was permanently the same
     * washed-out grey as every caption around it, with brand green flickering through for
     * a fraction of its hold. Legible, but the least confident-looking sentence in the
     * drawer at the one moment it is supposed to be reassuring someone that work is
     * happening. `textPrimary` now sits at rest and the sweep still passes through in
     * brand green — the shimmer is a highlight *travelling over* solid text, not the only
     * thing giving the text a colour at all.
     */
    thinkingLineBase: w({
      position: 'absolute',
      left: 0,
      right: 0,
      margin: '0 auto',
      /* 320 → 380. Measured against the halo-and-progress-bar design, which this drawer no
         longer draws; against the plain 64px orb the stage has more width to spend before a
         seven-word line risks wrapping into the tick row underneath it. */
      maxWidth: 380,
      fontSize: 13,
      fontWeight: 500,
      lineHeight: '18px',
      /* Ink → brand → ink, travelling left to right. The shimmer is the *tense*: it says
         "still working" about a sentence written in the present tense, and it stops when
         the thinking stops. */
      backgroundImage: `linear-gradient(100deg, ${theme.palette.textPrimary} 28%, ${theme.palette.surfaceBrand} 46%, ${theme.palette.surfaceBrand} 54%, ${theme.palette.textPrimary} 72%)`,
      backgroundSize: '250% 100%',
      backgroundRepeat: 'no-repeat',
      WebkitBackgroundClip: 'text',
      backgroundClip: 'text',
      color: 'transparent',
      WebkitTextFillColor: 'transparent',
      animationTimingFunction: 'cubic-bezier(0.22, 0.61, 0.36, 1), linear',
      animationFillMode: 'both, none',
      /**
       * `!important` on the name alone, not the whole block.
       *
       * `thinkingLineIn`/`thinkingLineOut` set `animationName` unconditionally, as a
       * sibling class on the same element, at equal specificity (`w()` gives every rule
       * `&&`) — and they are declared *after* this one, so on a tie the later rule wins
       * regardless of which media query is active. Without `!important` here, reduced
       * motion never actually took: the fallback name lost the cascade to whichever
       * variant class happened to be on the element, and the sweep and the rise kept
       * running for a preference that exists specifically to stop them.
       */
      '@media (prefers-reduced-motion: reduce)': {
        animationName: '$lineFade !important',
        animationTimingFunction: 'ease',
        WebkitTextFillColor: theme.palette.textPrimary,
        color: theme.palette.textPrimary,
      },
    }),
    /* Rising into place from below. */
    thinkingLineIn: w({ animationName: '$lineRiseIn, $thinkingShimmer' }),
    /* Rising away. Same direction as the entrance, which is what makes the pair read as
       one continuous movement rather than two opposed ones. */
    thinkingLineOut: w({ animationName: '$lineRiseOut, $thinkingShimmer' }),
    '@keyframes lineRiseIn': {
      from: { opacity: 0, transform: 'translateY(14px)' },
      to: { opacity: 1, transform: 'none' },
    },
    '@keyframes lineRiseOut': {
      from: { opacity: 1, transform: 'none' },
      to: { opacity: 0, transform: 'translateY(-14px)' },
    },
    '@keyframes lineFade': {
      from: { opacity: 0 },
      to: { opacity: 1 },
    },
    /**
     * The shimmer sweep — **still broken after the last fix, from the same wrong model
     * of what a percentage `background-position` means.**
     *
     * A percentage here is not "shift the image left by that fraction of its own width."
     * Per spec it is `(container size − image size) × percentage`. The image is `250%`
     * of the box, so container−image is **negative** — which means the offset moves the
     * *opposite* way from what both this keyframe and the comment it replaced assumed,
     * and a range built on the wrong-direction assumption can look plausible on paper
     * while being wrong on screen.
     *
     * The previous bug (`160% → -60%`) never covered the box at all — provably, since
     * both endpoints put the image entirely outside it. This range, `0% → -150%`, covers
     * the box only at the single instant `0%`. Moving negative from there does not
     * continue the sweep; with a negative multiplier, negative percentages push the
     * offset *positive* — the image slides to the **right**, off the box's leading edge.
     * By `-66.7%` the image's left edge has passed the box's right edge and nothing is
     * left to clip against: the whole line goes transparent. In between, only the box's
     * *trailing* pixels still catch the image's own leading (flat-ink) band — which is
     * exactly the "last few characters, everything before them blank" that watching the
     * drawer shows, worst in the second half of every line's hold.
     *
     * `0% → 100%` is the range spec-correct for a `250%`-wide image: at `0%` the offset
     * is `0`, so the box shows the image's own first 40% (fractions `0–0.4` of the
     * gradient's stops); at `100%` the offset is `−150%` **of the box**, so the box shows
     * the image's last 40% (`0.6–1.0`). Both ends are fully inside the image — the box is
     * covered throughout — and the midpoint (`~50%`) lands the visible window on
     * `0.3–0.7`, which is where the brand band (`46%–54%`) actually lives. The bright
     * band still starts off the right and exits off the left; only the sign was wrong.
     *
     * The duration is the caller's, not a constant: one sweep per line, so the pass reads
     * as *this thought, now* rather than as a loop the words happen to sit in.
     */
    '@keyframes thinkingShimmer': {
      '0%': { backgroundPosition: '0% 0' },
      '100%': { backgroundPosition: '100% 0' },
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

    /* ── ③'s route, and the row parts it borrows ───────────────────────────────
       The rows are the workspace's own components dressed in the workspace's own sheet
       (see `DayPane`). What lives here is only what this shell overrides, and each
       override is passed into `StopRow` by key rather than by editing the sheet next
       door — the workspace's own list must keep rendering exactly as it does. */

    /**
     * The route, **with no container around it**.
     *
     * It was `proposedCard`: 16px of padding, a hairline and 8px corners. That is right in
     * the workspace, where three route cards stack in a quarter-width column and the border
     * is what separates one day from the next. Here there is **one** route on screen at a
     * time, inside a drawer that is already a bordered surface — so the card was a box drawn
     * inside a box, spending 32px of a 475px gutter to fence off content that had nothing to
     * be fenced from. The head, the gauge and the rail are enough structure on their own.
     */
    routeBody: w({
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'stretch',
      gap: 12,
    }),

    /**
     * The route header — **redrawn as three ranks, not one line and a caption.**
     *
     * It used to be the workspace's own `proposedHead` (title left, `3h48m / 4h` right, one
     * row) with a second paragraph underneath running zone, stops, filters, drive and the
     * spare/over verdict together as one sentence — five facts in one weight, one colour,
     * left to right, so reading it meant reading all of it. Nothing there was wrong on its
     * own; stacked, the head under-used the one thing a header is for, which is telling a
     * planner what to look at *first*.
     *
     * Three ranks now, each answering a different question:
     *
     *   **`flowRouteHeaderTop`** — *which day, which zone.* The day is the identity of the
     *   card; the zone is D15's hard constraint and used to be buried mid-sentence below,
     *   so it is a chip on the same row as the title it belongs to.
     *   **`flowRouteMetric`** — *how full.* The one number a planner compares card to card,
     *   given the size the comparison deserves rather than the workspace's 12px caption
     *   figure — and the gauge sits directly under it, so the number and the bar that
     *   proves it are one unit.
     *   **`flowRouteCaption`** — *the rest, and the verdict.* Stops, filters and drive stay
     *   a quiet caption; the spare/over phrase that used to trail off at the same weight is
     *   its own element now, right-aligned and coloured, because it is the one clause in
     *   the old sentence a planner actually needs to act on.
     */
    flowRouteHeader: w({
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
    }),
    flowRouteHeaderTop: w({
      display: 'flex',
      alignItems: 'baseline',
      justifyContent: 'space-between',
      gap: 10,
      minWidth: 0,
    }),
    /**
     * The day's title — **an `InputBase` now, not a `Typography`.**
     *
     * A planner can name a day's route, inline, the same gesture the workspace's own
     * `RouteCard` offers on a route being created (`proposedName`). No border and no
     * background until touched, so a field almost nobody edits does not look like a form
     * squatting on top of a heading — it reads as the same static title it always was
     * until a hover or a focus says otherwise. `subtitle1`'s size and weight are kept
     * exactly; only the interactive states are new.
     */
    flowRouteTitle: w({
      '&.MuiInputBase-root': {
        ...theme.typography.subtitle1,
        flex: '1 1 auto',
        minWidth: 0,
        color: theme.palette.textPrimary,
        padding: '0 4px',
        marginLeft: -4,
        borderRadius: 4,
        border: '1px solid transparent',
        transition: 'background 120ms ease, border-color 120ms ease',
      },
      '& .MuiInputBase-input': {
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      },
      '&.MuiInputBase-root:hover': {
        background: theme.palette.surfaceGreySubtle,
        borderColor: theme.palette.borderSubtle1,
      },
      '&.MuiInputBase-root.Mui-focused': {
        background: theme.palette.surfaceWhite,
        borderColor: theme.palette.borderBrand,
        boxShadow: '0px 0px 0px 3px rgba(14, 109, 255, 0.12)',
      },
    }),
    /**
     * The zone, as a chip rather than a word mid-sentence.
     *
     * D15 makes a day's zone a hard constraint — every stop on this card is here *because*
     * of it — which is more standing than a comma-separated clause gave it. Neutral grey
     * rather than the pin's blue or the brand green: the chip is naming a fact, not marking
     * a state, and this drawer already spends blue on the stop pins and amber on capacity.
     */
    /**
     * The zone, beside the route's title — **plain text, no longer a pill.**
     *
     * It was a grey rounded chip, `2px 9px` on `surfaceGreySubtle` with `nowrap`. That works
     * for `North`. It does not work for the names real deployments use: the fixture's
     * compass points are placeholders, and a live franchise names territories after
     * neighbourhoods — `DHA Phase 5 Extension` is four words, and as a nowrap pill it either
     * pushes the route title out of its own row or overflows the card.
     *
     * A pill also over-claims. A chip is the app's mark for something *set* — a status, a
     * selection, a filter you applied. The zone here is neither: it is a fact quoted from
     * Config A, read-only, and the route title next to it already carries the emphasis.
     *
     * So: `flex: 0 1 auto` with `minWidth: 0` and an ellipsis, which is what lets a long name
     * give way to the title instead of fighting it — the title is `1 1 auto`, so under
     * pressure both shrink and neither is pushed out of the row.
     */
    flowZoneChip: w({
      flex: '0 1 auto',
      minWidth: 0,
      ...theme.typography.subtitle3,
      color: theme.palette.textSecondary2,
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    }),

    /* ── Who is on the route, and deleting one ──────────────────────────────────
       Both ride `flowRouteHeaderTop`, which is `align-items: baseline` for the title
       and its chip — so both of these carry `alignSelf: center`, or a 22px circle
       hung off a text baseline would sit noticeably low against the 16px title. */
    routeAvatarButton: w({
      flex: '0 0 auto',
      alignSelf: 'center',
      display: 'grid',
      placeItems: 'center',
      width: 26,
      height: 26,
      padding: 0,
      border: 'none',
      borderRadius: '50%',
      background: 'transparent',
      cursor: 'pointer',
      transition: 'background 120ms ease',
      '&:hover': { background: theme.palette.surfaceGreySubtle },
      '&:focus-visible': { outline: `2px solid ${theme.palette.borderBrand}`, outlineOffset: 1 },
    }),
    routeAvatar: w({ width: 22, height: 22 }),
    /* Grey, not amber and not red: an unassigned route is the *normal* output of this
       flow (D14), not a fault — see the note on `AddPersonIcon`. */
    routeAvatarEmpty: w({
      width: 22,
      height: 22,
      display: 'block',
      color: theme.palette.textSecondary3,
    }),
    /* The picker's rows: a face, then a name. */
    installerItem: w({ display: 'flex', alignItems: 'center', gap: 10, minHeight: 36 }),
    installerName: w({ ...theme.typography.body2, color: theme.palette.textPrimary }),
    /**
     * Delete, **and it stays quiet until the pointer is on it.**
     *
     * `textSecondary3` at rest rather than `textAlert`: this control only exists on a
     * route the planner made seconds ago, so it is closer to undoing a step than to a
     * destructive action needing a warning colour to guard it — and a red mark parked
     * permanently on one of the three cards would read as *that route* being the problem.
     * It takes alert red on hover, where the intent is unambiguous.
     */
    routeDeleteButton: w({
      flex: '0 0 auto',
      alignSelf: 'center',
      display: 'grid',
      placeItems: 'center',
      width: 26,
      height: 26,
      padding: 0,
      border: 'none',
      borderRadius: 6,
      background: 'transparent',
      color: theme.palette.textSecondary3,
      cursor: 'pointer',
      transition: 'background 120ms ease, color 120ms ease',
      '&:hover': { background: theme.palette.surfaceAlertSubtle, color: theme.palette.textAlert },
      '&:focus-visible': { outline: `2px solid ${theme.palette.borderBrand}`, outlineOffset: 1 },
    }),
    /* The figure a planner compares card to card — big enough to be the thing the eye
       lands on first, which a 12px caption inside a sentence never was. */
    flowRouteMetric: w({
      display: 'flex',
      alignItems: 'baseline',
      gap: 6,
    }),
    flowRouteMetricValue: w({
      ...theme.typography.h3,
      color: theme.palette.textPrimary,
      fontVariantNumeric: 'tabular-nums',
    }),
    flowRouteMetricOf: w({
      ...theme.typography.body2,
      color: theme.palette.textSecondary2,
    }),
    /* Amber on the figure itself the moment the day runs past its shift — the workspace's
       own `proposedTimeOver` rule, restated for this size. */
    flowRouteMetricOver: w({ color: WARNING_INK }),
    /* Stops, filters, drive — quiet. The spare/over verdict that used to sit at the end of
       this line is gone: the big metric above it and the gauge under it already say
       whether the day is full, so the caption's own job is just the three counts. */
    flowRouteCaption: w({
      display: 'flex',
      alignItems: 'baseline',
      gap: 10,
    }),
    flowRouteCaptionText: w({
      ...theme.typography.subtitle3,
      color: theme.palette.textSecondary2,
      flex: '1 1 auto',
      minWidth: 0,
    }),

    /**
     * The stop pin, **larger than the workspace's**.
     *
     * `STOP_PIN` is 16px there, sized for a marker that has to agree with the same pin on a
     * map at map scale. In this list there is no map, and a 16px teardrop under a 14px site
     * name read as a bullet rather than as the numbered mark a planner cross-references —
     * the numeral inside it was the smallest legible thing on the row. 22px balances the
     * name and gives the digit room to be read.
     *
     * Overridden by key on the object handed to `StopRow`, not by editing `stopMarker`: that
     * class is worn by the workspace's own list and by its collapsed-card pin strip, and
     * both are sized against the map.
     */
    /**
     * `stopLine`, overridden by key — **the row's painted box, matched to `spillRow`.**
     *
     * The workspace's own `stopLine` is already the right *shape* of solution (paint on the
     * row, gap as a margin outside it — see the long note on `stopHoverRow` for the two
     * attempts that got this wrong). What it is not is the same size as the accordion's
     * rows, which is what was asked for: it pads `6px 8px` against `spillRow`'s `8px 10px`,
     * and rounds to 8 against its 6.
     *
     * So the numbers are the accordion's and the mechanism is the workspace's:
     *
     * - **`padding: '8px 10px'`** — real inner padding, so the fill has the same breathing
     *   room around the grip, the name and the figure that a tray row's does.
     * - **`margin: '0 -10px 28px'`** — the horizontal half cancels that padding against the
     *   body's own 24px gutter, so the row's *content* still lands at exactly the x the
     *   header and the tabs above it sit at while the *fill* reaches 10px wider on each
     *   side. Identical to `spillRow`'s `margin: '0 -10px'`.
     * - **`28px` bottom margin, untouched.** `stopTrackColumn`'s `marginBottom: -28` is
     *   calibrated to it; the two move together or the dash stops short of the next pin.
     *   It is *margin* rather than padding precisely so the fill does not grow into the gap.
     */
    flowStopLine: w({
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'stretch',
      gap: 8,
      padding: '8px 10px',
      margin: '0 -10px 28px',
      minWidth: 0,
      borderRadius: 6,
      transition: 'background 120ms ease',
      '&:hover': { background: theme.palette.surfaceGreySubtle },
    }),

    flowMarker: w({
      width: 22,
      height: 22,
      flexShrink: 0,
      display: 'block',
      overflow: 'visible',
    }),

    /**
     * The disclosure chevron — **bigger than the workspace's 7px.**
     *
     * `stopChevron`/`stopChevronIcon` are worn by the collapsed-card list too, where a
     * quarter-width column and a 20px pin ask for something that recedes. Beside a 22px
     * pin and a 15px name this drawer has room to spend, and at 7px the mark that opens
     * "how was this leg spent" was the smallest thing on the row it belongs to. 11px keeps
     * the same drawn proportions (the path is `viewBox="0 0 12 12"`, so the glyph itself
     * just scales) and stays inside the button's own `content-box` padding, which is
     * copied rather than shared for the reason `flowMarker` gives above it.
     */
    flowChevron: w({
      boxSizing: 'content-box',
      /* 11 → 13. The mark that opens a stop's arithmetic; at 11 it was still the smallest
         thing on the row it belongs to. The path is a `viewBox`, so the glyph just scales. */
      width: 13,
      height: 13,
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
    }),
    flowChevronIcon: w({ width: 13, height: 13, flexShrink: 0, display: 'block' }),

    /**
     * ③'s entrance — **the route rises in, one row after another.**
     *
     * Mounted fresh every time ② hands off to ③ (and again on every day-tab switch, since
     * each day is a new set of stops keyed by visit id) rather than triggered by a class
     * toggled from script: a plain CSS animation with `animation-fill-mode: both` plays
     * once on mount and needs nothing to clean up or to guard against re-firing.
     *
     * The stagger is `animationDelay`, set inline per row from the row's own position —
     * see `DayPane` — so this class carries only the motion every row shares.
     */
    '@keyframes flowRowRise': {
      from: { opacity: 0, transform: 'translateY(10px)' },
      to: { opacity: 1, transform: 'none' },
    },
    stopRowEnter: w({
      animation: '$flowRowRise 420ms cubic-bezier(0.22, 0.61, 0.36, 1) both',
      '@media (prefers-reduced-motion: reduce)': { animation: 'none !important' },
    }),

    /**
     * The disclosure's own type, one step clearer than the workspace's.
     *
     * Both halves were 12px/300 there — a thin weight at a small size, and the *label* and
     * the *value* were the same weight, so `Arrive` and `0:20` carried equal emphasis and
     * the pair read as undifferentiated grey. In a quarter-width column beside a map that is
     * a reasonable trade for density; in a drawer at reading width it is just faint.
     *
     * So the label stays quiet but gains a weight (400) and the value takes the emphasis
     * (500, primary ink, tabular). Same 12px — the fix is contrast between the two, not size
     * — on an 18px line so the two-column stack breathes instead of crowding.
     */
    /* 12 → 13px. Beside a 15px name and a 22px pin, the workspace's own 12px read as a
       full size smaller than everything around it rather than one deliberate step down —
       a caption should recede in weight and colour, which it already does here, not in
       legibility as well. */
    /* `lineHeight` matches `flowDetailValue`'s, not its own font size — `stopLabels` and
       `stopValues` stack label *n* against value *n* by list position by the same gap, so
       a label whose line box is shorter than its value's would let every row after the
       first drift out of step with its own value by the difference. */
    flowDetailLabel: w({
      fontFamily: 'Inter',
      /* 13 → 14. Worn by the company/filters caption under every site name *and* by the
         disclosure's labels, so one step here lifts both. `lineHeight` still matches
         `flowDetailValue`'s 20px — see below for why that pairing is load-bearing. */
      fontSize: 14,
      fontWeight: 400,
      lineHeight: '20px',
      color: theme.palette.textSecondary2,
    }),
    /**
     * The disclosure's value — **now the same voice as the figure it explains.**
     *
     * It was 13px/500/`textPrimary` against the collapsed row's `8.9 mi · 1h10m` at
     * 13px/400/`textSecondary1` — a step heavier and a shade darker for the identical kind
     * of number, so opening a stop changed how its own time was styled without changing
     * what the time meant. 14px now (the "little bit" bigger this side of the disclosure
     * asked for) but the weight and colour are `flowFigure`'s, copied rather than
     * reinvented — one figure treatment, read collapsed or open.
     */
    flowDetailValue: w({
      fontFamily: 'Inter',
      fontSize: 14,
      fontWeight: 400,
      lineHeight: '20px',
      color: theme.palette.textSecondary1,
      fontVariantNumeric: 'tabular-nums',
      whiteSpace: 'nowrap',
    }),
    /* The site name, a weight up from the workspace's 500 and now a size up too — 14 → 15.
       With a 22px pin beside it and no card border holding the row together, the name is
       what a reader lands on first. */
    flowStopName: w({
      fontSize: 15,
      fontWeight: 600,
      lineHeight: '21px',
      color: theme.palette.textPrimary,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      minWidth: 80,
      flex: '1 1 auto',
    }),
    /* `8.9 mi · 1h10m` — the row's right-hand figure. A step up from the workspace's 12/300
       for the same reason the disclosure is: this is the number the row is read for. */
    flowFigure: w({
      flexShrink: 0,
      fontFamily: 'Inter',
      /* 13 → 14, with the line box grown to match. Against a 15px semibold site name and a
         22px pin, the figure a planner actually reads off this row was sitting a full step
         below its own caption. Now one step under the name rather than two. */
      fontSize: 14,
      fontWeight: 400,
      lineHeight: '20px',
      color: theme.palette.textSecondary1,
      fontVariantNumeric: 'tabular-nums',
      whiteSpace: 'nowrap',
    }),
    /* `put back by you` — the mark on a stop the planner forced onto a day. It is the answer
       to "why is this day amber", written on the row that caused it. */
    forcedMark: w({ color: WARNING_INK }),

    /* ── The overspill tray ────────────────────────────────────────────────────
       Work with a legal day and no hours on it — see `model/overspill.js`.

       **A band of the shell, not a card in the body**, which is the whole point of it: the
       planner has to be able to change day tabs and scroll a route *while holding a visit
       from the tray*, and anything inside the scrolling body scrolls away from the tabs it
       is being dragged to. So it sits between the body and the footer, keeps its own
       position, and the drop targets stay on screen above it.

       It is an accordion because it is a queue of decisions rather than a report: shut, it
       is one line saying how much did not fit; open, it is the rows. Shut is the default —
       the proposal is the answer and this is the exception to it, the same rule the
       not-placed tab follows.

       Amber and not red. D3 makes the shift a soft cap, so work that exceeded it is
       *warned about*, not refused — red would say "you cannot", which is what D3 spent a
       decision denying. */
    spillTray: w({
      position: 'relative',
      flex: '0 0 auto',
      background: theme.palette.surfaceWhite,
      borderTop: `1px solid ${theme.palette.borderSubtle1}`,
      /* Lifted off the body rather than ruled away from it — the tray is in front of the
         route, and a shadow is what says so while a second hairline would just look like
         the footer's. */
      boxShadow: `0 -6px 16px ${EDGE_SHADOW}`,
    }),

    /* The shut state, and the accordion's control in both states. A full-width button so
       the whole line is the hit target, not just the chevron. */
    spillBar: w({
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '12px 24px',
      border: 'none',
      background: 'transparent',
      textAlign: 'left',
      cursor: 'pointer',
      '&:hover': { background: theme.palette.surfaceGreySubtle },
      '&:focus-visible': { outline: `2px solid ${theme.palette.borderBrand}`, outlineOffset: -2 },
    }),
    spillBarIcon: w({
      flex: '0 0 auto',
      width: 16,
      height: 16,
      color: theme.palette.surfaceWarningStrong,
    }),
    /* The hours lead, the count follows — §14.4. "2 visits" sounds like a rounding error;
       `2h50m` is the same fact in the unit the rest of the flow is written in. */
    spillBarTitle: w({
      ...theme.typography.subtitle1,
      color: WARNING_INK,
      flex: '1 1 auto',
      minWidth: 0,
    }),
    spillBarCount: w({
      ...theme.typography.body2,
      flex: '0 0 auto',
      color: theme.palette.textSecondary2,
      fontVariantNumeric: 'tabular-nums',
    }),
    /**
     * The bar's own trailing pair — **its own flex context, at the rows' gap.**
     *
     * The bar spaces its children by 10px; a stop row spaces its figure from its chevron by
     * `stopFigureRow`'s 6. Left as one flat row the bar's `6h10m` therefore sat 4px further
     * from its chevron than every row's duration sat from theirs, so the two columns could
     * not both be flush. Grouping the pair lets the bar keep 10px between the title and the
     * group while the group itself matches a row exactly.
     */
    spillBarTrailing: w({
      flex: '0 0 auto',
      display: 'flex',
      alignItems: 'center',
      gap: 6,
    }),
    spillBarChevron: w({
      flex: '0 0 auto',
      display: 'grid',
      placeItems: 'center',
      color: theme.palette.textSecondary3,
      transition: 'transform 200ms ease',
    }),
    spillBarChevronOpen: w({ transform: 'rotate(180deg)' }),

    /* Bounded, and it has to be: the tray is spending the route's own vertical space, and a
       week that spilled nine visits would push the open runsheet off the top of the drawer —
       leaving the planner dragging to tabs above a pane they can no longer read. */
    /**
     * **The scroll box, with the scrollbar hidden — which is what makes the figures line up.**
     *
     * A classic scrollbar reduces the *content box* of whatever scrolls, so every row inside
     * this box sat 18px left of the bar's own trailing figure the moment the tray had enough
     * rows to overflow. That is worse than a constant offset: the two columns agreed with
     * two rows and disagreed with three. Moving the padding to an inner element does not
     * help either — anything inside a scroll container is inside the narrowed box.
     *
     * So the scrollbar goes, exactly as `tabRow` above already does it and for the same
     * reason: it is a few pixels of chrome that costs a column its alignment. The height cap
     * stays (a badly-spilled week must not push the runsheet off the top of the drawer), and
     * the cue for "there is more" is the row cut off at the fold — the same cue the tab row
     * relies on. If that proves too quiet, the fix is `tabRowScrollable`'s trick turned
     * vertical: a measured overflow flag and a bottom fade mask, not the scrollbar back.
     */
    spillBody: w({
      maxHeight: '32vh',
      overflowY: 'auto',
      overflowX: 'hidden',
      padding: '0 24px 16px',
      scrollbarWidth: 'none',
      '&::-webkit-scrollbar': { display: 'none' },
    }),
    /**
     * The intro, **downgraded to a caption.**
     *
     * It was `body2` — 14px, the same weight as a stop's own name — directly above rows
     * whose names are now 15px/600. Two lines of near-equal weight in a row is the same
     * fault the day table's headers had against its own labels: the intro is context for
     * what follows, not a peer of it, and it should look like context.
     */
    /* Left-padded to the bar's own **title**, not its icon — `24px` (the bar's padding)
       `+ 16px` (the warning triangle) `+ 10px` (the bar's gap) = `50px`, so the sentence
       explaining the accordion starts under the words it explains rather than under the
       decorative mark beside them. */
    spillIntro: w({
      ...theme.typography.subtitle3,
      color: theme.palette.textSecondary3,
      paddingBottom: 8,
      paddingLeft: 26,
    }),
    /* The not-placed group's own intro, when the spilled group is on screen above it —
       a hairline and a little air, so the second remedy reads as its own paragraph
       rather than a continuation of the first. */
    spillIntroSecond: w({
      marginTop: 4,
      paddingTop: 12,
      borderTop: `1px solid ${theme.palette.borderSubtle1}`,
    }),

    /**
     * One spilled visit — **a row, not a card.**
     *
     * It was a bordered card with a 3px amber left edge, borrowed from the decision box's
     * *this needs a decision* device. Two things were wrong with that, and both are about
     * the drawer as a whole rather than about this row. The route above it lost its own card
     * in the same pass, so the tray became the only boxed object left on the screen — a
     * third visual language in a drawer that had just been reduced to one. And a spilled
     * visit is the *same object* as a stop: a site, a company, a filter count, a window, a
     * duration. Drawing it differently asks a planner to learn two ways of reading one
     * thing, in the two places they are most often compared — and a visit about to be
     * dragged into a route should look like what it is about to become.
     *
     * So the wrapper only carries what a row cannot: the drag, the focus ring, and the
     * dimmed state. `StopRow` inside it does the rest.
     */
    /**
     * A row's own inner padding, **the fix for a hover state with nothing to press against.**
     *
     * The card these rows replaced (§ above) carried 16px of its own padding, so the
     * hover/focus fill it wore had a card's edge to stop at. Losing the card lost that
     * edge too — the fill ran edge to edge with the text, and a highlight that hugs its
     * own label reads as a rendering glitch rather than an affordance.
     *
     * `10px` horizontal padding, cancelled by an equal negative margin: the row's own
     * *content* lands at exactly the x the drawer's 24px gutter always put it at, and the
     * hover/focus fill is the only thing that gets the extra 10px on each side. Vertical
     * padding is not cancelled — real breathing room between rows, which is the other half
     * of what a card's own padding used to buy for free. Asymmetric on purpose: `8` above
     * keeps the gap from the row before it, `4` below is enough to separate it from the
     * row after without the list reading looser than the drawer's other lists.
     */
    spillRow: w({
      display: 'block',
      /**
       * **No `width: '100%'`, and that one declaration was the whole misalignment.**
       *
       * It sat here harmlessly-looking beside `margin: '0 -10px'`, and the two contradict:
       * a percentage width resolves against the *parent's* content box, so the row measured
       * exactly the body's inner width and the negative margins then merely slid that box
       * 10px left instead of widening it 10px on each side. Net effect — every row's
       * trailing figure sat 20px inside the accordion bar's own, which is the column the
       * bar's total is supposed to head.
       *
       * A block element already fills its container, so `width: auto` is both the default
       * and the thing that lets the negative margins do what they are here for.
       */
      textAlign: 'left',
      borderRadius: 6,
      padding: '8px 10px 4px',
      margin: '0 -10px',
      cursor: 'grab',
      transition: 'background 120ms ease, opacity 140ms ease',
      '&:hover': { background: theme.palette.surfaceGreySubtle },
      '&:focus-visible': { outline: `2px solid ${theme.palette.borderBrand}`, outlineOffset: 1 },
    }),
    /* Half-opacity while it is in flight, so the row the planner is holding is visibly the
       one that has left the tray. */
    spillRowMoving: w({ opacity: 0.4 }),

    /**
     * `stopLine` for a **tray** row — the route's geometry minus the track it never draws.
     *
     * The accordion's rows were using the workspace's `stopLine` untouched, and it carries
     * `margin: '0 -8px 28px'`: twenty-eight pixels of bottom margin whose entire job is to
     * give `stopTrackColumn`'s dashed rule somewhere to reach the *next* pin. These rows
     * pass `lineColor="transparent"` and draw no rule at all, so every one of them was
     * paying for a connector that does not exist — measured at 127px for a three-line row,
     * and visible as a slab of dead space between each row and the next.
     *
     * Horizontal geometry is `flowStopLine`'s, so a tray row and a route row still line up
     * down the drawer; only the trailing 28 is gone. No `:hover` here — `spillRow` outside
     * it is this row's painted box (it also carries the drag cursor and focus ring), which
     * is the opposite of the route's arrangement and fine: a tray row has no track, so
     * there is no margin trapped inside the wrapper to make the fill overshoot.
     */
    flowLooseStopLine: w({
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'stretch',
      gap: 8,
      padding: '0 10px',
      margin: '0 -10px',
      minWidth: 0,
    }),
    /**
     * The pin column, for a row with **no track to stretch toward.**
     *
     * The workspace's own `stopTrackColumn` top-aligns the pin because the dashed rule
     * beneath it has to reach a row that may grow taller when it opens — but these rows
     * are single-line and draw no track (`lineColor="transparent"`), so nothing is left
     * for the pin to align *to* except its own row, and top-aligned it sat visibly above
     * the site name's centre rather than beside it. `justifyContent: center` with no
     * `marginBottom` pin the mark to the row it is actually in. Sized to `flowMarker`'s own
     * 22px rather than the workspace's 16px `STOP_PIN`, which this pin would otherwise
     * overflow.
     */
    flowLoosePinColumn: w({
      width: 22,
      flexShrink: 0,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
    }),
    /* The day it came off. Amber ink, because *why this is here* is the row's one piece of
       genuinely exceptional information — everything above it is the same as any stop. */
    /**
     * The reason this visit is here — the one amber fact on an otherwise plain row, and
     * now its own line rather than trailing straight off the company/filters caption.
     */
    spillOffRow: w({
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      marginTop: 2,
    }),
    /* The same amber dot `dayDot`/`tabDot` use for the same idea — one sign, meaning
       "this needs a decision", learned once. */
    spillOffDot: w({
      flex: '0 0 auto',
      width: 5,
      height: 5,
      borderRadius: '50%',
      background: theme.palette.surfaceWarningStrong,
    }),
    spillOff: w({
      fontFamily: 'Inter',
      fontSize: 12,
      fontWeight: 500,
      lineHeight: '16px',
      color: WARNING_INK,
    }),

    /**
     * The bottom band: the buttons — **one bordered box**, though there used to be a
     * note above them too (`footerNote`, removed on instruction — see `HarmonizeDrawer`).
     *
     * The rule lives here rather than on `footer`, and that is a correction rather than a
     * preference. The first attempt kept the border on `footer` and cancelled it with a
     * rule of the shape `'$footerNote + &': { borderTop: 'none' }`, back when a note sat
     * above the buttons. A JSS rule reference inside this sheet's `'&&'` wrapper does not
     * resolve, and the failure is **silent and not local**: the `footer` rule was dropped
     * along with *every rule declared after it*, so the footer lost `display: flex` and
     * `classes.spillTray` came back `undefined` — the overspill bar rendered as an
     * unstyled 150px box two hundred lines away from the mistake.
     *
     * One element owning the border needs no reference and cannot fail that way — kept
     * even with the note gone, since the border is still what separates this band from
     * the scrolling body above it.
     */
    footerBand: w({
      flex: '0 0 auto',
      position: 'relative',
      background: theme.palette.surfaceWhite,
      borderTop: `1px solid ${theme.palette.borderSubtle1}`,
    }),
    /**
     * ② has no footer band at all — **no rule, and no ground either.**
     *
     * The border earns its place in ① and ③, where the footer separates a scrolling body of
     * content from the buttons that act on it. ② has no content to be separated *from*: one
     * orb, one line, and a `Stop`. A rule there fenced off an empty panel, and the white
     * ground behind it cut the aurora dead in a horizontal band across the bottom of the
     * paper — the same seam moving the layers up to `shell` existed to remove, reintroduced
     * 24 pixels from the other end.
     *
     * So both go, and the wash runs to the bottom edge with the button floating on it.
     * `background: 'none'` rather than `'transparent'` for the shorthand's sake — this rule
     * has to beat `footerBand`'s own `background` and would otherwise leave its colour set.
     */
    footerBandBare: w({ background: 'none', borderTop: 'none' }),

    /* The button row. The border and the ground belong to `footerBand` above. */
    footer: w({
      position: 'relative',
      padding: '16px 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      gap: 12,
    }),
    /**
     * ③'s `Back`, pinned to the left edge instead of sitting beside `Apply`.
     *
     * `footer` stays `justify-content: flex-end` — ①'s `Cancel`/`Harmonize` pair still
     * wants to read as one group on the right. `margin-right: auto` on just this button
     * pushes it to the opposite edge without a second layout for a footer that otherwise
     * looks the same in every state.
     */
    footerBackButton: w({ marginRight: 'auto' }),
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
