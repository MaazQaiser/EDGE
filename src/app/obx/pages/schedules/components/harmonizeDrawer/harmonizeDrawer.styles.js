import { makeStyles } from '@mui/styles';

/** Row geometry, shared by the stop rows, the anchors and the leg lines. */
const GRIP_WIDTH = 16;
const INDEX_SIZE = 24;
const ROW_GAP = 12;

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
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    minWidth: 0,
    flex: 1,
    '& .MuiInputLabel-root': {
      fontSize: 12,
      fontWeight: 500,
      color: theme.palette.textSecondary2,
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
  mapSurface: {
    position: 'relative',
    height: 240,
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
    '& .MuiInputBase-input': { fontSize: 14 },
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
  meter: { display: 'flex', flexDirection: 'column', gap: 8 },
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
  estimatedPill: {
    fontSize: 10,
    fontWeight: 600,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
    padding: '2px 6px',
    borderRadius: 4,
    color: theme.palette.textWarning,
    background: theme.palette.surfaceWarningSubtle,
  },
  /* Plain flex segments, and deliberately not animated. Width is a layout
     property, so transitioning it thrashes; the transform-based alternative
     needs compositor layers that never settle here. A readout that snaps to its
     new value is the honest option, and nobody misses the tween. */
  meterTrack: {
    display: 'flex',
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
    background: theme.palette.surfaceGreyLight,
  },
  meterSegment: { minWidth: 0 },
  meterExisting: { background: theme.palette.borderSubtle2 },
  meterService: { background: theme.palette.surfaceBrand },
  meterTravel: { background: theme.palette.surfaceBrandSubtle },
  meterOverflow: { background: theme.palette.surfaceWarningStrong },
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
  swatchTravel: { background: theme.palette.surfaceBrandSubtle },
  legendText: {
    '&.MuiTypography-root': { fontSize: 12, color: theme.palette.textSecondary3 },
  },
  landsOnStatic: {
    '&.MuiTypography-root': { fontSize: 12, color: theme.palette.textSecondary3 },
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
  },

  sectionLabel: {
    '&.MuiTypography-root': {
      fontSize: 11,
      fontWeight: 600,
      letterSpacing: '0.06em',
      textTransform: 'uppercase',
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
  stopList: { padding: '10px 24px 4px' },
  stopListHeader: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 },
  manualPill: {
    fontSize: 10,
    fontWeight: 600,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
    padding: '2px 6px',
    borderRadius: 4,
    color: theme.palette.textBrand,
    background: theme.palette.surfaceBrandSubtle,
  },
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
  },
  stopRowLocked: { opacity: 0.62 },
  stopRowDragging: { opacity: 0.4 },
  stopRowOver: { boxShadow: `inset 0 2px 0 ${theme.palette.surfaceBrand}` },
  stopRowHighlighted: { background: theme.palette.surfaceBrandSubtle },
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
  stopTopLine: { display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 },
  stopName: {
    '&.MuiTypography-root': {
      fontSize: 14,
      fontWeight: 500,
      color: theme.palette.textPrimary,
      minWidth: 0,
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

  /* ---------- selection list ----------
     The pre-plan view of the same visits. It borrows `stopRow` / `stopBody` /
     `stopName` so the two lists are recognisably the same object, and adds only
     what differs: a dot where the index goes, and the visit's current day where
     the arrival time goes. Nothing here implies an order. */
  selectionRow: { paddingLeft: 2, alignItems: 'flex-start' },
  selectionMark: {
    width: 8,
    height: 8,
    marginTop: 6,
    marginRight: ROW_GAP - 2,
    flexShrink: 0,
    borderRadius: '50%',
    background: theme.palette.surfaceBrand,
  },
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
      borderTop: `1px solid ${theme.palette.borderSubtle}`,
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
  overflow: {
    margin: '12px 24px 4px',
    padding: '14px 16px',
    borderRadius: 10,
    background: '#FFFDF7',
    border: '1px solid #F0E4CC',
  },
  overflowTitle: {
    '&.MuiTypography-root': {
      fontSize: 14,
      fontWeight: 600,
      lineHeight: '20px',
      color: '#B54708',
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
      marginTop: 10,
      paddingTop: 10,
      borderTop: '1px solid #F0E4CC',
    },
  },

  /* ---------- footer ---------- */
  footer: {
    borderTop: `1px solid ${theme.palette.borderSubtle1}`,
    padding: '16px 24px',
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    background: theme.palette.surfaceWhite,
    flexShrink: 0,
  },
  footerSummary: { minWidth: 0 },
  footerLine: {
    '&.MuiTypography-root': {
      fontSize: 14,
      fontWeight: 600,
      color: theme.palette.textPrimary,
    },
  },
  footerSubline: {
    '&.MuiTypography-root': { fontSize: 12, color: theme.palette.textSecondary3, marginTop: 1 },
  },
  footerActions: {
    display: 'flex',
    gap: 12,
    '& .MuiButtonBase-root': { flex: 1, whiteSpace: 'nowrap' },
  },
  busy: { opacity: 0.75 },

  empty: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 },
  emptyText: {
    '&.MuiTypography-root': { fontSize: 14, color: theme.palette.textSecondary3 },
  },
}));
