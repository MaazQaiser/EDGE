import { makeStyles } from '@mui/styles';
import { SIDEBAR_INSET_VAR, SIDEBAR_Z_INDEX } from 'src/app/layout/sideBar/sidebarChrome';

/**
 * The workspace: three columns, one run.
 *
 * **Why this is not the drawer's stylesheet.** `harmonize.styles.js` dresses the
 * *parts* — a stop row, a capacity meter, a route card, a map bubble — and every one of
 * those is unchanged by where they are rendered. What changed is the container: a 680px
 * column that scrolled top-to-bottom became a surface with three regions that scroll
 * independently. That is a different problem, so it is a different file, and the parts kept
 * working without being touched.
 *
 * **The proportions are the brief, and they are load-bearing.** Setup asks the question,
 * routes shows the answer, the map draws it — and the answer earns a little more room than
 * the question does: routes runs 20% wider than setup (30% against 25%), because it is
 * carrying two side-by-side steppers, a run of route cards and the triage panel, where
 * setup is mostly single-column fields. The map takes whatever the other two leave, which
 * degrades gracefully being a picture. Reading left to right is reading the causal chain —
 * these settings produced these routes which look like this on the ground — and it is the
 * whole reason to leave a drawer. In a drawer those three were stacked, so the planner
 * changed a radius at the top, scrolled 400px to see whether the route improved, and
 * scrolled back. Here nothing moves except the numbers.
 *
 * **"The surface", not "the screen".** This takes the viewport *beside* the left nav rather
 * than all of it, so those three shares are of what the sidebar leaves and are recomputed
 * as the rail collapses — see `overlay`, which owns that arrangement and the reason for it.
 */

/** The column split, once. Routes runs 20% wider than setup. */
const SETUP_W = '25%';
const ROUTES_W = '30%';

/**
 * The routes pane's width, expressed against the region that now contains it.
 *
 * **The same 30% of the screen it has always been, restated.** The routes pane used to be
 * a direct child of the body and could take `ROUTES_W` literally; it is now a child of the
 * AI region, which is itself whatever the setup column leaves. So 30% of the screen is 40%
 * of the region, and writing it as a bare `30%` would have quietly narrowed the pane to
 * 22.5% of the screen while claiming not to have moved it.
 *
 * **Derived rather than written as `40%`, so the two columns cannot drift apart.** The
 * conversion depends on `SETUP_W`, which means a future pass that widens the setup column
 * would silently move the routes pane off its stated share if this were a literal — the
 * one class of bug a comment cannot prevent and arithmetic can.
 */
const pctOf = (value) => Number(String(value).replace('%', ''));
/**
 * **`REGION_HEADER_H` and `REGION_FOOTER_H` are gone, with the compensation they served.**
 *
 * They measured the region's two bands — the 44px heading strip and the 61px action bar — so
 * the map's top inset could be a *difference* between them: first the whole 17px, then half
 * of it. Both are dead now that the inset is symmetric (see `mapPane` for why), and a pair of
 * measured constants that nothing reads is a pair of constants which quietly stops being
 * true. `columnTitle` still declares its own `lineHeight` — that reason is recorded there and
 * did not depend on this arithmetic.
 */
/** The map panel's inset from its pane. One number, four sides — see `mapPane`. */
const MAP_INSET = 16;

const ROUTES_W_IN_REGION = `${(pctOf(ROUTES_W) / (100 - pctOf(SETUP_W))) * 100}%`;

/**
 * Floors for the two narrow columns.
 *
 * A percentage on its own would let the setup column reach 240px on a 13" laptop, where
 * a date-range field with two dates in it wraps to three lines. These are the widths
 * below which the columns stop being usable rather than merely tight, and past them the
 * map — which degrades gracefully, being a picture — gives up its share first. Routes'
 * own floor keeps the same 20% margin over setup's.
 */
const SETUP_MIN = 300;
const ROUTES_MIN = 360;

export const useStyles = makeStyles((theme) => ({
  /**
   * Over everything except the navigation.
   *
   * Harmonizing is a mode, not a page: it takes the screen for as long as it lasts and
   * gives it straight back. Rendered as a fixed overlay rather than a route so the
   * calendar underneath keeps its state — the scroll position, the week, the filters —
   * and so the apply animation has a grid to play on when this closes.
   *
   * **It starts where the sidebar ends, rather than at `inset: 0`.** Covering the left
   * nav made the mode a room with one door: a planner who opened the optimizer to check
   * something could not go to Runsheets, or Sites, or anywhere else without first
   * abandoning the plan on screen — a strange price to charge for looking. The inset is
   * the sidebar's *live* right edge, published by `sidebarChrome`, so this follows the
   * rail's 350ms collapse and expand instead of committing to 76 or 240 and being wrong
   * for a third of a second either way — and wrong outright on a phone, where the sidebar
   * is off-canvas and the answer is zero. Everything inside still divides the region it is
   * given, so the columns stay a quarter, a quarter and a half *of what is left*, which is
   * what the brief means by half the screen for the map.
   *
   * **Under the nav in the stack, not at modal height.** The sidebar's collapse toggle is
   * a 28px disc centred *on* the sidebar's right edge, so half of it stands inside this
   * surface's frame; at `zIndex.modal` that half was painted over and the button could no
   * longer be clicked where it appears to be, which is a strange thing to do to the
   * control that resizes the region you are working in. One below the sidebar puts the
   * whole disc back. Nothing here needs to outrank the modal layer: this is not a dialog
   * competing with other dialogs, and the menus, pickers and toasts the columns open are
   * portalled to `body` in their own right and still land on top. What it does assume is
   * that the page behind pins nothing above 998 — true of every tab that offers Harmonize,
   * and worth re-checking if a floating control is ever added to one of them.
   */
  overlay: {
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
  },
  /**
   * **380ms and mostly opacity, where it was 220ms and mostly movement.**
   *
   * The old entrance rose 8px in 220ms, which at this size is not an arrival — it is a cut
   * with a twitch on the end. A surface covering the whole working area is a change of
   * *place*, and the eye needs long enough to accept that the calendar became this rather
   * than being replaced by it. So the opacity ramp is what carries it, the movement is
   * halved to 4px so nothing appears to slide, and the curve is a decelerating ease that
   * spends most of its time near the end state.
   */
  '@keyframes overlayIn': {
    from: { opacity: 0, transform: 'translateY(4px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
  },
  /**
   * Leaving, which used to happen between two frames.
   *
   * Closing unmounted the whole surface instantly and the calendar was simply *there*
   * again — the abruptness was worse on the way out than on the way in, because the planner
   * has been reading this screen for a minute and it vanishes mid-glance. Shorter than the
   * entrance, because an exit that lingers is a screen arguing about being dismissed.
   */
  overlayLeaving: {
    animation: '$overlayOut 220ms cubic-bezier(0.4, 0, 1, 1) both',
    /* Nothing is clickable on the way out — a button pressed during the fade would act on
       a screen the planner has already dismissed. */
    pointerEvents: 'none',
  },
  '@keyframes overlayOut': {
    from: { opacity: 1, transform: 'translateY(0)' },
    to: { opacity: 0, transform: 'translateY(4px)' },
  },

  /* ---------- top bar ----------
     Identity and scope only. Every *action* is in the bar at the bottom, next to the
     sentence saying what it will do — a primary button up here would be a commit
     control eight inches from the consequence it commits. */
  topBar: {
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    /* 16px — matching `columnHeader`'s own left inset, not `navBar`'s 32px. The close
       button leads this bar and `columnHeader`'s icon leads the column directly under
       it; a wider inset up here put the two out of line with each other, which reads
       worse than being out of line with the header on a page this surface replaces. */
    padding: '12px 16px',
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
  },
  /* Leading the bar, and small — a compact way out rather than a headline-sized
     control competing with the title next to it. The icon itself is a fixed 24px
     SVG with no size prop, so it is scaled down in CSS rather than left to dictate
     the button's footprint.

     `marginLeft: -4` is what actually lines the X up with the column icon a row
     below it: both glyphs are 16px, but this one sits inside a 24px hit target and
     `columnIcon` does not, so centring alone left the X 4px to the right of
     `columnIcon`'s own left edge at the same 16px page inset. The negative margin
     shifts the button, hit target and all, so the two glyphs share one left edge. */
  backButton: {
    '&.MuiButtonBase-root': {
      minWidth: 'auto',
      width: 24,
      height: 24,
      marginLeft: -4,
      padding: 4,
      borderRadius: 6,
      color: theme.palette.textSecondary3,
      '&:hover': { background: theme.palette.surfaceGreySubtle },
      '& svg': { width: 16, height: 16 },
    },
  },
  topBarTitles: { display: 'flex', flexDirection: 'column', minWidth: 0 },
  title: {
    '&.MuiTypography-root': {
      fontSize: 16,
      fontWeight: 600,
      lineHeight: '22px',
      color: theme.palette.textPrimary,
    },
  },
  grow: { flex: 1 },

  /**
   * The scope, as a chip in the bar.
   *
   * What is being harmonized — how many visits, over which dates — is the one fact that
   * makes every number below it meaningful, and it belongs beside the title rather than
   * inside a column: it is true of the whole screen.
   */
  scopeChip: {
    '&.MuiTypography-root': {
      flexShrink: 0,
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      height: 26,
      padding: '0 10px',
      borderRadius: 13,
      border: `1px solid ${theme.palette.borderSubtle1}`,
      background: theme.palette.surfaceGreySubtle,
      fontSize: 12,
      fontWeight: 500,
      color: theme.palette.textSecondary2,
      whiteSpace: 'nowrap',
    },
  },

  /**
   * What the run amounts to, beside what it is a run *of*.
   *
   * **A chip and not a scoreboard tile, and that is a deliberate demotion.** The footer
   * already carries this screen's figures at 22px — routes, visits placed, visits left
   * out — and those are the numbers a planner compares two runs on. A second set of
   * large figures up here would be a second scoreboard, in the corner furthest from the
   * button they inform, and the two would race to be the summary.
   *
   * So this is the same 26px chip the scope is written in, reading left to right as
   * *label then value*: what is being harmonized, then what harmonizing it costs. The
   * value is the only emphasised thing in the bar apart from the title.
   *
   * **There is deliberately no "total time saved" beside it.** A saving is a claim
   * against a baseline, no baseline exists in the code or the docs, and
   * `docs/harmonize-drawer.md` explicitly retires the minutes-saved headline as a
   * rejected model. An invented denominator in the largest type on the screen is worse
   * than a missing figure, so the figure is missing until somebody decides what it is
   * measured against. This comment is the placeholder; the UI has none, because an empty
   * slot labelled "saved" is a promise.
   */
  totalChip: {
    '&.MuiTypography-root': {
      flexShrink: 0,
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      height: 26,
      padding: '0 10px',
      borderRadius: 13,
      border: `1px solid ${theme.palette.borderSubtle1}`,
      background: theme.palette.surfaceWhite,
      fontSize: 12,
      fontWeight: 500,
      color: theme.palette.textSecondary3,
      whiteSpace: 'nowrap',
      /* A tip hangs off this, so the cursor has to say the chip is worth pointing at. */
      cursor: 'default',
    },
  },
  /* The figure itself: one step up in weight and colour, tabular so it does not shuffle
     as the run re-solves and the total crosses an hour boundary. */
  totalChipValue: {
    fontWeight: 600,
    color: theme.palette.textPrimary,
    fontVariantNumeric: 'tabular-nums',
  },

  /* ---------- the three columns ---------- */
  body: {
    flex: 1,
    display: 'flex',
    minHeight: 0,
    /* Each column scrolls on its own, so the row itself never does. A horizontal
       scrollbar here would mean one of the columns had escaped its share. */
    overflow: 'hidden',
  },

  /**
   * A column: a fixed header strip, then a scrolling body.
   *
   * The strip does not scroll away, because it is what says which of three regions you
   * are looking at — and at these widths the columns are narrow enough to be mistaken
   * for one another once their headings have gone.
   */
  column: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
    minHeight: 0,
    borderRight: `1px solid ${theme.palette.borderSubtle1}`,
  },
  setupColumn: {
    flex: `0 1 ${SETUP_W}`,
    minWidth: SETUP_MIN,
  },
  /**
   * ---------- the optimizer's region ----------
   *
   * One surface holding the route list and the map, where there were two columns with a
   * hairline between them. See the region's own comment in `index.jsx` for why: the two
   * are one answer expressed twice, and the rule down the middle claimed they were two
   * subjects. What is deliberately *not* merged is their widths or their content — the
   * routes pane is still the same 30% of the screen and still scrolls on its own.
   *
   * `overflow: hidden` clips the glow to the region; `position: relative` is what the glow
   * is absolute against, and what keeps the header and panes painting above it.
   */
  aiRegion: {
    flex: 1,
    minWidth: 0,
    minHeight: 0,
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    overflow: 'hidden',
    /* White under the glow so the wash has something to fade into rather than compounding
       with another tint. No `borderRight`: this region runs to the edge of the surface. */
    background: theme.palette.surfaceWhite,
  },

  /**
   * The AI-working wash.
   *
   * **One glow, on the left border, travelling right — where there were two anchored at the
   * top corners.** Those pooled colour along the top edge and met in the middle of it, so on
   * a wide region the strongest tint sat over the middle of the route list: the wash read as
   * a *background* the content was floating on rather than as an edge lighting up. It also
   * fought the one axis this layout is built around — the planner asks on the left and the
   * answer arrives on the right, and a glow that arrives from above says nothing about that.
   *
   * `ellipse 24% 100% at 0% 50%` is the whole of the geometry, and the two numbers are doing
   * different jobs. The **100% vertical** radius reaches the top and bottom edges, so the
   * colour runs the full height of the left border and tapers along the top and bottom edges
   * as it goes — brightest at the border's midpoint, present at the corners, which is the
   * "left border plus half of the top and bottom" the design asks for. The **24% horizontal**
   * radius is what keeps it off the middle: colour is gone by roughly a fifth of the way
   * across, so it never reaches the route cards, let alone the map.
   *
   * **It spans both panes, and that is why it is on the region.** Anchored to the routes
   * column the wash stopped dead at the seam — the left pane pulsed while the map sat inert
   * beside it, which said the *list* was thinking and the map was a bystander.
   */
  aiGlow: {
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
    backgroundImage: `radial-gradient(ellipse 24% 100% at 0% 50%, ${theme.palette.surfaceBrand}30 0%, ${theme.palette.surfaceBrand}12 55%, transparent 100%)`,
    opacity: 0.35,
    transition: 'opacity 700ms ease',
  },
  /* While the optimizer composes. Slow and low-amplitude on purpose — the avatar is
     already the thing in this screen that is allowed to move quickly; this is the room
     around it breathing, not a second attention-getter. */
  aiGlowWorking: {
    opacity: 0.85,
    animation: '$routesGlowPulse 3400ms ease-in-out infinite',
  },
  /* **Opacity only — the `scale(1.08)` is gone.** Scaling a layer whose gradient is anchored
     at `0% 50%` grows it rightward from the left border, so the pulse walked the colour into
     the middle of the region on every breath: the exact thing the new geometry exists to
     prevent, animated. Brightness alone reads as the same "still working" and cannot drift. */
  '@keyframes routesGlowPulse': {
    '0%, 100%': { opacity: 0.55 },
    '50%': { opacity: 1 },
  },
  '@media (prefers-reduced-motion: reduce)': {
    aiGlowWorking: { animation: 'none', opacity: 0.65 },
  },

  /**
   * The optimizer working, with the whole region to do it in.
   *
   * The orb and its narration used to sit in the routes pane at 30% of the surface, beside a
   * map already holding candidate pins. Centred in the region instead: while there is no
   * answer there are no panes to divide, and the map's arrival is worth more than its
   * presence. Same centring as `awaiting`, because they are the same kind of state — the
   * region with nothing to show yet — and they should not drift apart.
   */
  aiWorking: {
    position: 'relative',
    flex: 1,
    minHeight: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px 32px',
  },

  /* The two panes, under one header. No divider: the tone step where the map's own grey
     surface begins is the only edge, and it is a soft one. */
  aiPanes: {
    position: 'relative',
    flex: 1,
    minHeight: 0,
    display: 'flex',
    overflow: 'hidden',
  },
  /* The width only. The padding and the scrolling belong to the `columnBody` inside it —
     see the note at the call site for why those cannot share one element. */
  routesPane: {
    flex: `0 1 ${ROUTES_W_IN_REGION}`,
    minWidth: ROUTES_MIN,
    minHeight: 0,
    display: 'flex',
    flexDirection: 'column',
  },
  /**
   * The map's pane, and the inset is the point of it.
   *
   * **The map used to run to the edges of the screen** on the argument that the viewport was
   * its frame — true while it was a column of its own with a hairline down its left side.
   * Inside a shared region that argument inverts: a full-bleed rectangle butting straight
   * against the route list is the one element that looks like it belongs to a different
   * screen. The inset and the 8px radius on the surface make it a *panel within* the region
   * rather than a second region, which is what "the map should feel part of the whole" asks
   * for.
   *
   * **The padding is equal on all four sides, and that is now a decision rather than a
   * default.**
   *
   * This inset has been argued three ways. It was 16 all round; then it carried the whole 17px
   * difference between the 44px heading strip and the 61px action bar, on the theory that what
   * the eye judges is *heading-to-map* against *map-to-bar*; then half of that difference, once
   * the full compensation read as loose on screen.
   *
   * **It is symmetric because the user asked for it twice, looking at it.** The theory the
   * compensation rested on — that both strips read as air, so the map should hang lower to
   * balance them — kept losing to what the screen actually looked like, and the theory has a
   * hole in it: the heading strip is *not* air. It is a 44px band with a label in it, so the eye
   * reads the map as inset from that band's lower edge rather than from the top of the region,
   * and every pixel the compensation added was a pixel of visibly empty white above a panel
   * that already had its gap.
   *
   * So: 16px, four sides, no arithmetic. What is above the map equals what is below it. The
   * next person tempted to reintroduce a compensation should read this paragraph and then go
   * and look at the screen.
   *
   * **The bottom gap still grows when the footer does** — a stale-plan note or a re-order
   * warning adds ~17px each and the bar takes it from the map. That is the right behaviour, and
   * it is no longer an exception to anything: the map's own inset is a constant, so what moves
   * is the bar's height, which is the element that needs the room.
   */
  mapPane: {
    position: 'relative',
    flex: 1,
    minWidth: 0,
    minHeight: 0,
    display: 'flex',
    flexDirection: 'column',
    padding: MAP_INSET,
  },

  /**
   * Before the press: **an empty state that answers "what do I do?" and "is my radius right?"**
   *
   * Two passes ago this was `awaiting` — a centred *No route proposed yet* over white — and
   * last pass it became a top-aligned readout with a coverage figure in it. Neither was the
   * thing this pane owes the planner at this moment, which is both halves at once: the
   * instruction, because a screen with a map, six fields and no result does not say which
   * order to use them in; and the count, because the radius they are setting has no other
   * visible consequence in this column.
   *
   * **Centred, and that is what makes it an empty state rather than a panel.** The readout
   * version sat at the top of the pane on the argument that the press should replace text
   * with cards without moving the eye. What it actually produced was a block of prose in the
   * position a card goes, which reads as content — as though the optimizer had already
   * returned something. Vertically centred in an otherwise empty pane reads as absence, and
   * absence is the honest description: there is no plan.
   *
   * `justifyContent: center` on a `flex: 1` column, not `margin: auto`, so a long
   * instruction at a narrow width grows downward from the middle instead of pushing its own
   * top edge off the pane.
   */
  emptyState: {
    position: 'relative',
    flex: 1,
    minHeight: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: '24px 24px 32px',
    textAlign: 'center',
  },
  emptyStateIcon: {
    width: 26,
    height: 26,
    color: theme.palette.textPlaceholder,
    marginBottom: 2,
  },
  emptyStateTitle: {
    '&.MuiTypography-root': {
      fontSize: 15,
      fontWeight: 600,
      lineHeight: '20px',
      color: theme.palette.textSecondary2,
    },
  },
  emptyStateText: {
    '&.MuiTypography-root': {
      maxWidth: 300,
      fontSize: 13,
      fontWeight: 300,
      lineHeight: '19px',
      color: theme.palette.textSecondary3,
    },
  },
  /**
   * The coverage figure, below the instruction and separated by a rule.
   *
   * **Below rather than above, which reverses last pass.** The figure led, at 20px, and it
   * was the first thing read in a state whose first job is to say what to do — a large
   * number with no plan behind it invites the reader to treat it as the result. Under the
   * instruction, divided from it, it reads as what it is: a fact about the settings, offered
   * while they are being set.
   *
   * The rule is 1px and 120px wide rather than full width: it separates two registers inside
   * one centred block, and a full-width divider in a 400px pane would cut the empty state in
   * half and make two panels of it.
   */
  emptyStateCoverage: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 2,
    marginTop: 14,
    paddingTop: 14,
    borderTop: `1px solid ${theme.palette.borderSubtle1}`,
    width: 120,
  },
  emptyStateFigure: {
    '&.MuiTypography-root': {
      fontSize: 20,
      fontWeight: 600,
      lineHeight: '26px',
      color: theme.palette.textPrimary,
      fontVariantNumeric: 'tabular-nums',
    },
  },
  emptyStateCoverageLabel: {
    '&.MuiTypography-root': {
      fontSize: 12,
      fontWeight: 300,
      lineHeight: '17px',
      color: theme.palette.textSecondary3,
    },
  },

  /**
   * The region before the press.
   *
   * **Retained and no longer rendered.** The pre-press region is `preview` above, which has
   * a figure and an instruction in it; this was the centred *No route proposed yet* card
   * that stood in the same place while the map was withheld. Kept because the empty-week
   * case (`isEmpty`) is a genuinely contentless state and this is the shape it would want if
   * anyone gives it one — it currently gets `classes.empty`, one line, centred.
   */
  awaiting: {
    position: 'relative',
    flex: 1,
    minHeight: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: '24px 32px',
    textAlign: 'center',
  },
  awaitingIcon: {
    width: 28,
    height: 28,
    color: theme.palette.textPlaceholder,
    marginBottom: 4,
  },
  awaitingTitle: {
    '&.MuiTypography-root': {
      fontSize: 15,
      fontWeight: 600,
      lineHeight: '20px',
      color: theme.palette.textSecondary2,
    },
  },
  awaitingText: {
    '&.MuiTypography-root': {
      maxWidth: 320,
      fontSize: 13,
      fontWeight: 300,
      lineHeight: '18px',
      color: theme.palette.textSecondary3,
    },
  },

  /**
   * A region heading: a fixed strip that does not scroll away.
   *
   * There are two of these now rather than three — the setup column's, and the one the AI
   * region carries for both of its panes. `position: relative` is what keeps the header
   * (and the body below it) painting above `aiGlow` rather than under it.
   */
  columnHeader: {
    position: 'relative',
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    minHeight: 40,
    padding: '10px 16px',
  },
  /**
   * The mark beside each heading. Sized to the 13px title's own cap-height rather than to a
   * round number, so it sits on the same optical line as the text next to it.
   *
   * **The two headings wore the same class and rendered at different sizes — 15px and
   * 24px.** One is a local SVG and takes these values; the other is a MUI icon, and
   * `.MuiSvgIcon-root` sets `font-size: 1.5rem` with `width/height: 1em` from emotion, which
   * is injected after makeStyles and therefore wins at equal specificity. A bare `width`
   * here could never have held it. The scoped rule below matches MUI's own class so it is no
   * longer a specificity contest, and `fontSize` is set as well as the box, because for an
   * `em`-sized icon the font size *is* the size. Same family as the avatar trap in §7.28.
   */
  /* 16px in `textSecondary1`, tracking the title's own step up: at 15px in `textSecondary3` the
     glyph was two tiers lighter than the word it introduces, which on a 14px dark heading reads
     as a mark left over from the previous design rather than as part of the heading. One tier
     below the ink rather than level with it, so the word still leads. */
  columnIcon: {
    width: 16,
    height: 16,
    flexShrink: 0,
    color: theme.palette.textSecondary1,
    '&.MuiSvgIcon-root': { width: 16, height: 16, fontSize: 16 },
  },
  /**
   * The region's name, in sentence case.
   *
   * It was 11px uppercase with tracking — the house style for a *field* label, borrowed for
   * headings that are not labels: they name the halves of the screen, they are the first
   * thing read in each, and set in caps they were shouting the least surprising information
   * on the page.
   *
   * **14px/600 in primary ink, up from 13px/600 in `textSecondary2`.** The supplied design
   * reads this heading as bold dark ink, distinctly heavier and larger than a field label —
   * and at 13px in a grey two steps down the ramp it *was* a field label, the same size and
   * the same colour as `FieldLabel`'s own text one region to the left. A heading that is
   * indistinguishable from the labels below it is not naming the region, it is joining the
   * list. One step of size and the darkest ink separates them, and the icon beside it moves
   * with it for the same reason.
   *
   * Both region headings wear this class, and deliberately: the design only pictures the
   * routes column, but the two headings name the two halves of one screen and a screen whose
   * halves are titled in two different ramps has a reason to be, which this does not.
   */
  columnTitle: {
    '&.MuiTypography-root': {
      fontSize: 14,
      fontWeight: 600,
      /**
       * **Stated, so the strip's height is declared rather than inherited.**
       *
       * Left alone this is whatever `body1`'s ratio makes of 14px — a number nothing in the
       * file names and any change to the font size moves. Pinned at 24, the heading strip is
       * 44px (10 + 24 + 10) because it is declared to be.
       *
       * It used to matter more than it does: the map's top inset was a *difference* against a
       * measured `REGION_HEADER_H`, so a line box that grew two pixels slid the map two pixels
       * without anything named changing. That inset is symmetric now and reads no constants,
       * so this is no longer load-bearing — but a declared line height is still the honest way
       * to own a strip's height, and `columnHeader`'s own `minHeight: 40` is only a floor.
       */
      lineHeight: '24px',
      color: theme.palette.textPrimary,
    },
  },
  /**
   * The link out to the franchise's own settings, in the setup column's heading.
   *
   * Quiet on purpose: it is a *reference*, not a step in the flow, and the one press this
   * column exists to lead to is the green button at its foot. A filled or accent-coloured
   * control here would compete with that from the opposite corner of the same column.
   *
   * The icon is scoped through `.MuiSvgIcon-root` for the reason `columnIcon` records — emotion
   * sets `font-size: 1.5rem` and `width/height: 1em` on MUI icons and is injected after
   * makeStyles, so a bare `width` here loses the specificity contest and renders at 24px.
   */
  configLink: {
    flexShrink: 0,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    padding: '3px 6px',
    marginRight: -6,
    borderRadius: 6,
    textDecoration: 'none',
    color: theme.palette.textSecondary3,
    transition: 'background 140ms ease, color 140ms ease',
    '&:hover': {
      background: theme.palette.surfaceGreySubtle,
      color: theme.palette.textPrimary,
    },
    '&:focus-visible': {
      outline: `2px solid ${theme.palette.borderBrand}`,
      outlineOffset: 1,
    },
  },
  configLinkText: {
    '&.MuiTypography-root': {
      fontSize: 12,
      fontWeight: 500,
      lineHeight: '16px',
      color: 'inherit',
      whiteSpace: 'nowrap',
    },
  },
  configLinkIcon: {
    width: 13,
    height: 13,
    flexShrink: 0,
    color: 'inherit',
    '&.MuiSvgIcon-root': { width: 13, height: 13, fontSize: 13 },
  },
  columnNote: {
    '&.MuiTypography-root': {
      fontSize: 12,
      color: theme.palette.textSecondary3,
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
  },
  columnBody: {
    position: 'relative',
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    overflowX: 'hidden',
    padding: 16,
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
  },

  /**
   * The setup column's footer: the press, pinned.
   *
   * Outside the scrolling body for the reason given at its call site — a CTA that scrolls
   * off the bottom of the only half of the screen with controls in it is a CTA the planner
   * has to hunt for. The hairline is on top rather than a shadow, matching the action bar
   * that appears along the bottom of the screen once this button has been used.
   */
  columnFooter: {
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    /**
     * **`flex-end`: the press sits bottom-right of its own column.**
     *
     * `stretch` is the default and it is what made a full-width bar out of a button that
     * asks for `width: auto`; `flex-start` was the first correction and put it under the
     * left edge of the fields, where the eye lands having read down them. Right is where it
     * belongs, for one reason that outranks the reading order: the screen's *other* action —
     * Create Route, in the answer half's footer — is bottom-right of its own half, so on the
     * right these two are a pair of footers with their action in the same corner of each. On
     * the left, the first step was in the opposite corner from the second and the eye
     * crossed the whole screen between them.
     */
    alignItems: 'flex-end',
    gap: 8,
    /**
     * **`12px 16px`, so this footer and `aiFooter` are one line across the surface.**
     *
     * It was a flat `16`, which made this bar 69px against the region footer's 61px — two
     * footers 8px out of step, each with its own hairline, meeting at the seam between the
     * columns. The whole argument for two footers is that they are a *pair* with their action
     * in the same corner of each half; a pair whose top edges do not line up reads as one bar
     * that failed to render rather than as two that belong to two halves.
     *
     * The vertical 12 is `aiFooter`'s own, so both come to 12 + 36 + 12 + 1 = 61 at rest and
     * both grow the same way when a block line appears above the button. The horizontal 16
     * stays this column's — it is `columnBody`'s inset and `columnHeader`'s, so the button's
     * right edge lands under the fields it acts on. Matching `aiFooter`'s 20 here would have
     * aligned the two footers with each other and knocked the button 4px off the column.
     */
    padding: '12px 16px',
    borderTop: `1px solid ${theme.palette.borderSubtle1}`,
    background: theme.palette.surfaceWhite,
  },
  /**
   * The press, at the size of the thing it does.
   *
   * **It was full width and 44px tall, which is a page's primary action.** This is a
   * column's action: it acts on the six fields above it, and the *other* footer on this
   * screen holds the button that writes something. A 300px-wide filled green bar at the foot
   * of the quiet half of the screen was the loudest element in the workspace, and it was
   * loudest before it had done anything — opposite an empty region, which made it read as
   * the point of the screen rather than as the step between the question and the answer.
   *
   * 36px and hugged to its label, left-aligned under the fields, which is where the eye
   * already is having read down them. It stays `variant="primary"` — it is still the
   * affirmative action on this side, and demoting it to a ghost would put it in the same
   * register as the two link buttons in the field hints above it.
   */
  harmonizeButton: {
    '&.MuiButtonBase-root': {
      width: 'auto',
      minWidth: 0,
      flexShrink: 0,
      height: 36,
      padding: '0 16px',
      fontSize: 13,
      lineHeight: '18px',
    },
  },
  /* The refusal, above the button that is refusing. Amber, and the same shape the action
     bar's own block line uses, so the two read as one voice. */
  setupBlockLine: {
    '&.MuiTypography-root': {
      display: 'flex',
      alignItems: 'flex-start',
      gap: 6,
      fontSize: 12,
      lineHeight: '17px',
      color: '#B54708',
    },
  },

  /* ---------- setup column ---------- */
  /* Groups within the column, separated by hairlines rather than cards: the eye should
     run straight down one list of questions, not hop between three boxes. */
  /**
   * A group of related fields, separated by space rather than by a heading.
   *
   * **The three headings — *When*, *Where from*, *Which visits go in* — are gone, and the
   * space they occupied does the work instead.** They were a second level of hierarchy over
   * six fields that already carry their own labels: *Harmonized window* under *When* is the
   * same fact said twice, at two weights, 20px apart. With the column reduced to one press
   * and six inputs, the headings were the noisiest thing on the quietest half of the screen.
   *
   * What they were genuinely doing — saying which fields belong together — is a proximity
   * job, and proximity does it without words. Fields inside a group sit 12px apart; groups
   * sit 28px apart, which is more than twice the internal gap and therefore reads as a
   * break. The hairline came off with the headings for the same reason: with a gap this
   * size a rule is a third cue for a distinction two are already making.
   */
  setupGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    paddingBottom: 16,
    '&:last-child': { paddingBottom: 0 },
  },
  /* Stacked, not side by side. The drawer put the window and the day on one 656px row;
     at 300px they are one per line, which is also the order the narration reads them
     in. */
  stackedFields: { display: 'flex', flexDirection: 'column', gap: 12, minWidth: 0 },

  /* ---------- the working, disclosed at the top of the routes column ----------
     It sits above the cards because it is about *how these cards came to be*, and a
     footnote to an answer belongs where the answer is rather than in the column holding the
     question. Grey and quiet: it is a disclosure, not a control, and the planner who trusts
     the numbers should be able to ignore it without it competing with them. */
  workingBlock: {
    display: 'flex',
    flexDirection: 'column',
    /* Flush against the cards below rather than a card of its own, so it reads as a line of
       small print at the top of the column and not as a fourth panel. */
    marginBottom: -4,
  },
  workingToggle: {
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
  },
  /* Points down when closed and up when open — the chevron is the affordance, so it has to
     be the thing that moves rather than the label changing beneath a static arrow. */
  workingChevron: {
    width: 14,
    height: 14,
    flexShrink: 0,
    transition: 'transform 200ms ease',
    '& path': { stroke: 'currentColor' },
  },
  workingChevronOpen: { transform: 'rotate(180deg)' },

  /**
   * The working, as a timeline.
   *
   * **Unnumbered, deliberately.** It was an ordered list with a counter disc per step, and
   * the numbers were the problem: this column is full of numbers that *mean* something — a
   * stop's position in the sequence, on its pin, matched to the same digit on the map — and
   * a second numbering running down the same column, counting something entirely different,
   * invites exactly one misreading. A rail with a dot per step says "these happened in this
   * order" without claiming any of them is stop three.
   *
   * The rail is drawn on the list rather than per row, so it is one continuous line behind
   * the dots instead of six segments that have to be made to meet.
   */
  /**
   * The reasoning steps, on a rail.
   *
   * **A vertical line down the left of the list, because these steps are a sequence and the
   * list was not drawing one.** Read without it, the disclosure was five sentences at equal
   * weight with no indication that step two follows from step one — which is the whole content
   * of a *reasoning* panel. The rail is the same device the stop list uses for the route it
   * describes, so the two read as one grammar: a track, and things on it.
   *
   * Drawn as a border on the list rather than as a pseudo-element per step, so it is one
   * continuous line from the first step to the last instead of eleven segments with gaps at
   * every 10px `gap`.
   */
  workingTimeline: {
    margin: '10px 0 4px',
    /* The 10px is the gutter the rail sits in; the 2px it replaces was just optical inset. */
    padding: '0 0 0 10px',
    listStyle: 'none',
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    position: 'relative',
    borderLeft: `1px solid ${theme.palette.borderSubtle1}`,
  },
  workingStep: {
    position: 'relative',
    paddingLeft: 18,
    fontSize: 12,
    lineHeight: '17px',
    color: theme.palette.textSecondary2,
    /* The dot, on the rail. */
    '&::before': {
      content: '""',
      position: 'absolute',
      left: 0,
      top: 5,
      width: 7,
      height: 7,
      borderRadius: '50%',
      background: theme.palette.surfaceBrand,
      zIndex: 1,
    },
    /* The rail, from this dot to the next one. Absent on the last step, so the line stops
       at the final dot rather than trailing off under nothing. */
    '&:not(:last-child)::after': {
      content: '""',
      position: 'absolute',
      left: 3,
      top: 10,
      width: 1,
      bottom: -12,
      background: theme.palette.borderSubtle2,
    },
  },

  /* ---------- routes column ---------- */
  /**
   * A route's shell, in the list.
   *
   * **The selection accent is gone, and it was the green bar.** One route is open and
   * the map is drawing it, and a 2px `surfaceBrand` rule down the leading edge said
   * which — reasonable in the abstract, and wrong in two ways here. It rendered green
   * under Filter Go's branding, so the one accent on a screen whose pins mean
   * *green = already done* was a green mark meaning *selected*; and the design has the
   * cards flush to the column with nothing in the gutter, so the 10px of `paddingLeft`
   * this needed was insetting every card to make room for a mark that miscoloured
   * itself.
   *
   * Selection is not unmarked as a result — the open card is the one showing its stops,
   * which is a whole card's worth of difference rather than two pixels of colour.
   */
  routeSlot: {
    position: 'relative',
    animation: '$routeIn 420ms cubic-bezier(0.2, 0.8, 0.2, 1) both',
  },

  /**
   * **A fade, and only a fade.**
   *
   * The cards used to rise 8px as they arrived, which was right when they were replacing
   * skeletons of their own shape — the movement read as the placeholder resolving. What
   * they replace now is the orb that was thinking about them, standing in the middle of
   * this column, and a card that slides in from below reads as a *different* thing being
   * pushed into the space rather than as the answer resolving where the question stood.
   * They arrive in place, in the order the solver filled them.
   */
  '@keyframes routeIn': {
    from: { opacity: 0 },
    to: { opacity: 1 },
  },

  /* ---------- the optimizer, thinking ----------
     Centred in the column its answer will fill, so the planner watches one region think and
     then fill rather than reading a caption on one side and finding the result on the
     other. Vertically centred by the flex column it sits in — `flex: 1` claims the height
     the routes will later take, which is what stops the orb from jumping as they land. */
  /**
   * The orb, in the brand colour.
   *
   * **The package paints greyscale, on purpose and with no colour prop.** Every dot is
   * `rgba(M,M,M,a)` where `M` is the dot's *depth* — nearer dots darker, farther dots
   * lighter — so lightness is load-bearing information and not a style choice. That rules
   * out the usual recolouring tricks: `hue-rotate` does nothing to a grey (no saturation to
   * rotate), and the `brightness(0) sepia(1) saturate(…) hue-rotate(…)` chain flattens every
   * dot to one value first, which lands a flat green disc where the sphere used to be.
   *
   * So it is blended instead. A brand-coloured layer over the canvas in `lighten` takes the
   * per-channel maximum of the two: over a near-black dot the result is the brand colour, and
   * over the transparent gaps it is whatever is actually behind this box — the far dots,
   * being lighter greys, come out as washed-out brand, which is exactly the depth cue the
   * greyscale was carrying. Nothing is flattened.
   *
   * **No `isolation` and no `background` of its own, on purpose.** An isolated group with a
   * flat fill was a *near-match* for the column's ground, which read as a faint white square
   * behind the orb the moment that ground stopped being flat (`aiGlow`'s wash
   * moves; a single matched colour cannot). Without isolation the blend reaches through to
   * whatever is genuinely painted behind this box, so the gaps are the real backdrop —
   * exactly the wash the rest of the column is sitting on, not an approximation of it.
   *
   * Tenant-agnostic as a result: it takes `surfaceBrand`, so Filter Go's green and Signal's
   * blue both come out right with no per-tenant hex anywhere.
   */
  orbTint: {
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
  },
  thinkingStage: {
    flex: 1,
    minHeight: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
    padding: '8px 4px 24px',
    textAlign: 'center',
  },
  /**
   * The line's slot, at a fixed height.
   *
   * Two lines' worth, because the narration's sentences are not all one line wide at 400px
   * and the element inside is remounted on every line — an auto-height slot would make the
   * orb above it hop by however tall the outgoing line happened to be.
   */
  thinkingLineSlot: {
    height: 40,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  /**
   * The thinking, shimmering.
   *
   * Two animations on one element, and they are doing different jobs: `thinkingLineIn` is
   * the **fade** — up, hold, and back out as the next line arrives, its duration set inline
   * from the reveal's own `LINE_MS` so it cannot be cut off mid-word — and `thinkingShimmer`
   * is the **tense**, a grey-green-grey gradient travelling left to right that says *still
   * working* about a sentence written in the present tense.
   *
   * The shimmer is a gradient clipped to the glyphs, so `color` has to go: with
   * `backgroundClip: text` the fill is what shows through, and any inherited colour would
   * paint straight over the gradient. `WebkitTextFillColor` is the one that actually does it
   * in Chrome and Safari, and it is camel-cased deliberately — JSS does not accept the
   * kebab-case form and warns about exactly this property.
   */
  thinkingLine: {
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
    /* Someone who asked for less movement did not ask for less explanation: the line still
       arrives and still says the same thing, it just stops travelling. */
    '@media (prefers-reduced-motion: reduce)': {
      animationName: 'none',
      color: theme.palette.textSecondary2,
      WebkitTextFillColor: theme.palette.textSecondary2,
    },
  },
  /* Percentages rather than milliseconds, because the duration is set per line from
     `LINE_MS`: in and out are shares of however long this line is held. */
  '@keyframes thinkingLineIn': {
    '0%': { opacity: 0, transform: 'translateY(4px)' },
    '18%': { opacity: 1, transform: 'translateY(0)' },
    '82%': { opacity: 1, transform: 'translateY(0)' },
    '100%': { opacity: 0, transform: 'translateY(-4px)' },
  },
  /**
   * **Inside 0%–100%, and that is the whole correctness condition.**
   *
   * With `background-repeat: no-repeat`, a percentage background position is measured
   * against `element width − image width` — which is *negative* here, because the image is
   * 250% of the element. So 0% and 100% are the two extremes at which the oversized image
   * still fully covers the box, and anything outside that range slides it off the element
   * entirely. This animation ran 150% → −50%, which put the gradient almost completely
   * outside the box; with `background-clip: text` the glyphs then had no paint at all and
   * **the line rendered invisible** — a sentence on screen, in the DOM, reading as blank.
   *
   * The loop is seamless because at both extremes the green band sits outside the box and
   * the element shows only the grey ends, so there is nothing to snap. 100% → 0% carries the
   * green left to right, which is the direction the sentence is read in.
   */
  '@keyframes thinkingShimmer': {
    from: { backgroundPosition: '100% 0' },
    to: { backgroundPosition: '0% 0' },
  },
  /* How far through the chain it is. Six lines is about five seconds, long enough that "is
     this stuck?" is a fair question, and ticks answer it without asking to be read. */
  thinkingTicks: { display: 'flex', alignItems: 'center', gap: 5 },
  thinkingTick: {
    width: 5,
    height: 5,
    borderRadius: '50%',
    background: theme.palette.borderSubtle2,
    transition: 'background 260ms ease',
  },
  thinkingTickDone: {
    width: 5,
    height: 5,
    borderRadius: '50%',
    background: theme.palette.surfaceBrand,
    transition: 'background 260ms ease',
  },

  /* Placeholders while the run is being composed. Sized to a collapsed route card, so
     the column does not resize under the planner when the real ones land. */
  skeleton: {
    height: 76,
    borderRadius: 12,
    background: theme.palette.surfaceWhite,
    border: `1px solid ${theme.palette.borderSubtle1}`,
    animation: '$pulse 1200ms ease-in-out infinite',
  },
  '@keyframes pulse': {
    '0%, 100%': { opacity: 1 },
    '50%': { opacity: 0.55 },
  },

  /* ---------- map column ---------- */
  /**
   * The narration, over the map rather than beside it.
   *
   * While the optimizer composes, the map is the working-out: pins go grey on the line
   * that rules them out, the ring appears on the line that names the radius, the route
   * draws on the line that announces the sequence. So the line belongs *on* the map, as
   * a caption to what is happening in the frame — in the drawer it was a separate block
   * above, and a claim and its picture in two regions read as two things.
   */
  mapStatus: {
    position: 'absolute',
    top: 12,
    left: 12,
    /* Clear of the map's own zoom column, which is top-right. At `right: 12` the Skip
       button sat underneath the `+` and `−` — a way out of the animation that could not be
       clicked is worse than not offering one. */
    right: 56,
    zIndex: 2,
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '10px 12px',
    borderRadius: 10,
    background: 'rgba(255, 255, 255, 0.94)',
    border: `1px solid ${theme.palette.borderSubtle1}`,
    boxShadow: '0 4px 16px rgba(16, 24, 40, 0.08)',
    backdropFilter: 'blur(4px)',
  },
  mapStatusLine: {
    '&.MuiTypography-root': {
      flex: 1,
      minWidth: 0,
      fontSize: 13,
      fontWeight: 500,
      color: theme.palette.textPrimary,
    },
  },
  /**
   * A way out of the animation.
   *
   * Six narrated lines is five and a half seconds, and the plan is solved before the
   * first of them is spoken — so anyone who has watched this once is waiting on a
   * result that already exists. That is the one thing a reveal must never do, and a
   * skip is cheaper than shortening it for everybody: presenting the feature and using
   * it twenty times a day are both served.
   */
  skipButton: {
    '&.MuiButtonBase-root': {
      flexShrink: 0,
      minWidth: 'auto',
      height: 26,
      padding: '0 10px',
      fontSize: 12,
      fontWeight: 600,
    },
  },

  /* ---------- bottom bar ---------- */
  /**
   * The commit bar: what the plan amounts to, what Apply will write, and Apply.
   *
   * **Under the AI region rather than across the whole screen.** It was full width, on the
   * argument that it is about the run and not about any single region of it — but the run's
   * *answer* is what it reports and what its button writes, and the answer lives on the right.
   * Full width also meant its one action shared a corner with the Harmonize press, which read
   * as a single control that kept renaming itself. Sitting under the region, it is the plan's
   * own footer and the setup column keeps its own.
   *
   * The sentence naming whose routes get re-ordered still has room: the region is three
   * quarters of the surface.
   */
  aiFooter: {
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    gap: 20,
    padding: '12px 20px',
    borderTop: `1px solid ${theme.palette.borderSubtle1}`,
    background: theme.palette.surfaceWhite,
  },
  barText: { flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 3 },

  /* The scoreboard. Figures large enough to read at a glance and comparable between
     runs, with their labels beside them rather than under — a full-width bar has the
     horizontal room a drawer footer did not. */
  facts: { display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' },
  fact: { display: 'flex', alignItems: 'baseline', gap: 5 },
  figure: {
    '&.MuiTypography-root': {
      fontSize: 18,
      fontWeight: 600,
      lineHeight: '22px',
      color: theme.palette.textPrimary,
    },
  },
  figureWarn: { '&.MuiTypography-root': { color: '#B54708' } },
  factLabel: {
    '&.MuiTypography-root': { fontSize: 12, color: theme.palette.textSecondary3 },
  },
  factDivider: { width: 1, height: 16, background: theme.palette.borderSubtle1 },

  writeLine: {
    '&.MuiTypography-root': {
      fontSize: 12,
      lineHeight: '17px',
      color: theme.palette.textSecondary2,
    },
  },
  /* The one line here that is a warning rather than a description: re-solving a route
     the planner never picked rewrites somebody's day. */
  caveatLine: {
    '&.MuiTypography-root': { fontSize: 12, lineHeight: '17px', color: '#B54708' },
  },
  /* Why the button will not go, next to the button. A control that refuses without
     saying why reads as broken, and the planner's next move is to press it again. */
  blockLine: {
    '&.MuiTypography-root': {
      display: 'flex',
      alignItems: 'flex-start',
      gap: 6,
      fontSize: 12,
      lineHeight: '17px',
      fontWeight: 500,
      color: '#B54708',
    },
  },
  blockIcon: { flexShrink: 0, fontSize: 13, lineHeight: '17px' },

  actions: { flexShrink: 0, display: 'flex', alignItems: 'center', gap: 10 },

  /* ---------- empty ---------- */
  empty: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyText: {
    '&.MuiTypography-root': {
      fontSize: 14,
      color: theme.palette.textSecondary3,
      textAlign: 'center',
    },
  },
}));
