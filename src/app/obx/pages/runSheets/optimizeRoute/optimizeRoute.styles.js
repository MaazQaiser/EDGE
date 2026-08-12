import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  page: {
    display: 'flex',
    flexDirection: 'column',
    flex: '1 1',
    minHeight: 0,
    background: theme.palette.surfaceWhite,
  },

  /* ---------- header ---------- */
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    padding: '20px 32px 0',
    [theme.breakpoints.down('lg')]: { padding: '20px 16px 0' },
  },
  headerTitle: {
    '&.MuiTypography-root': {
      fontSize: 20,
      fontWeight: 600,
      color: theme.palette.textPrimary,
    },
  },
  backButton: {
    '&.MuiButtonBase-root': { padding: 0, minWidth: 'auto', height: 'auto' },
  },
  modeChip: {
    '&.MuiChip-root': {
      height: 22,
      borderRadius: 11,
      background: theme.palette.surfaceBrandSubtle,
      color: theme.palette.textBrand,
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: '0.04em',
      marginLeft: theme.spacing(1),
    },
  },
  headerSpacer: { flex: '1 1' },
  headerMeta: {
    '&.MuiTypography-root': {
      fontSize: 11.5,
      color: theme.palette.textSecondary3,
      fontVariantNumeric: 'tabular-nums',
    },
  },
  subtitleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    padding: '4px 32px 0',
    [theme.breakpoints.down('lg')]: { padding: '4px 16px 0' },
  },
  headerSubtitle: {
    '&.MuiTypography-root': {
      fontSize: 13,
      color: theme.palette.textSecondary3,
    },
  },

  /* ---------- demo state switcher ---------- */
  demoBar: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    margin: '12px 32px 0',
    padding: '8px 12px',
    borderRadius: 6,
    border: `1px dashed ${theme.palette.borderSubtle2}`,
    background: theme.palette.surfaceGreySubtle,
    [theme.breakpoints.down('lg')]: { margin: '12px 16px 0' },
  },
  demoLabel: {
    '&.MuiTypography-root': {
      fontSize: 10,
      fontWeight: 700,
      letterSpacing: '0.1em',
      textTransform: 'uppercase',
      color: theme.palette.textSecondary3,
      marginRight: theme.spacing(1),
    },
  },
  demoButton: {
    appearance: 'none',
    cursor: 'pointer',
    border: `1px solid ${theme.palette.borderSubtle1}`,
    background: theme.palette.surfaceWhite,
    color: theme.palette.textSecondary2,
    borderRadius: 4,
    padding: '3px 9px',
    fontSize: 11,
    fontWeight: 600,
    fontFamily: 'inherit',
    '&:hover': { background: theme.palette.surfaceGreyLight },
    '&:focus-visible': {
      outline: `2px solid ${theme.palette.surfaceBrand}`,
      outlineOffset: 2,
    },
  },
  demoButtonActive: {
    background: theme.palette.surfaceBrand,
    borderColor: theme.palette.surfaceBrand,
    color: theme.palette.textOnColor,
    '&:hover': { background: theme.palette.surfaceBrand },
  },

  demoDivider: {
    width: 1,
    alignSelf: 'stretch',
    background: theme.palette.borderSubtle2,
    margin: '0 6px',
  },

  /* ---------- summary strip ---------- */
  summaryStrip: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'stretch',
    gap: 0,
    margin: '16px 32px 0',
    borderRadius: 6,
    border: `1px solid ${theme.palette.surfaceBrand}`,
    background: theme.palette.surfaceBrandSubtle,
    overflow: 'hidden',
    [theme.breakpoints.down('lg')]: { margin: '16px 16px 0' },
  },
  summaryCell: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    padding: '12px 20px',
    minWidth: 140,
    borderRight: `1px solid ${theme.palette.borderSubtle1}`,
    '&:last-child': { borderRight: 'none' },
  },
  summaryValue: {
    '&.MuiTypography-root': {
      fontSize: 20,
      fontWeight: 700,
      lineHeight: 1.1,
      color: theme.palette.textPrimary,
      fontVariantNumeric: 'tabular-nums',
    },
  },
  summaryValueGain: { '&.MuiTypography-root': { color: theme.palette.textSuccess } },
  summaryValueCost: { '&.MuiTypography-root': { color: theme.palette.textAlert } },
  summaryLabel: {
    '&.MuiTypography-root': {
      fontSize: 11.5,
      color: theme.palette.textSecondary3,
    },
  },

  /* ---------- body split ---------- */
  body: {
    display: 'flex',
    flex: '1 1',
    minHeight: 0,
    padding: '16px 32px 0',
    gap: theme.spacing(2),
    [theme.breakpoints.down('lg')]: { padding: '16px 16px 0' },
    [theme.breakpoints.down('md')]: { flexDirection: 'column', overflowY: 'auto' },
  },
  changesPane: {
    flex: '1 1 60%',
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
    border: `1px solid ${theme.palette.borderSubtle1}`,
    borderRadius: 6,
    overflow: 'hidden',
  },
  weekPane: {
    flex: '1 1 40%',
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
    border: `1px solid ${theme.palette.borderSubtle1}`,
    borderRadius: 6,
    overflow: 'hidden',
  },
  paneHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing(1),
    padding: '10px 16px',
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
    background: theme.palette.surfaceGreySubtle,
  },
  paneScroll: { flex: '1 1', overflowY: 'auto', minHeight: 0 },
  sectionLabel: {
    '&.MuiTypography-root': {
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
      color: theme.palette.textSecondary3,
    },
  },
  hintText: {
    '&.MuiTypography-root': { fontSize: 11.5, color: theme.palette.textSecondary3 },
  },

  /* ---------- change list ---------- */
  groupHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing(1),
    padding: '7px 16px',
    background: theme.palette.surfaceGreyLight,
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
    position: 'sticky',
    top: 0,
    zIndex: 1,
  },
  groupTitle: {
    '&.MuiTypography-root': {
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: '0.07em',
      textTransform: 'uppercase',
      color: theme.palette.textSecondary2,
    },
  },
  groupAction: {
    appearance: 'none',
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    padding: '2px 4px',
    fontSize: 11,
    fontWeight: 600,
    fontFamily: 'inherit',
    color: theme.palette.textBrand,
    '&:focus-visible': {
      outline: `2px solid ${theme.palette.surfaceBrand}`,
      outlineOffset: 1,
      borderRadius: 3,
    },
  },

  changeRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: theme.spacing(1.5),
    padding: '12px 16px',
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
    cursor: 'pointer',
    '&:hover': { background: theme.palette.surfaceGreySubtle },
    '&:focus-visible': {
      outline: `2px solid ${theme.palette.surfaceBrand}`,
      outlineOffset: -2,
      background: theme.palette.surfaceGreySubtle,
    },
  },
  changeRowHeld: {
    cursor: 'default',
    background: theme.palette.surfaceGreySubtle,
    '&:hover': { background: theme.palette.surfaceGreySubtle },
  },
  changeRowDeclined: { opacity: 0.55 },
  changeRowDerived: {
    cursor: 'default',
    '&:hover': { background: 'transparent' },
  },

  typeMark: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    minWidth: 78,
    paddingTop: 1,
  },
  typeGlyph: { fontSize: 13, lineHeight: 1 },
  typeWord: {
    '&.MuiTypography-root': {
      fontSize: 10,
      fontWeight: 700,
      letterSpacing: '0.06em',
      textTransform: 'uppercase',
    },
  },
  toneWarn: { color: theme.palette.textWarning },
  toneBrand: { color: theme.palette.textBrand },
  toneAlert: { color: theme.palette.textAlert },
  toneNeutral: { color: theme.palette.textSecondary3 },

  changeBody: { flex: '1 1', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 3 },
  changeTitle: {
    '&.MuiTypography-root': {
      fontSize: 13.5,
      fontWeight: 600,
      color: theme.palette.textPrimary,
    },
  },
  changeUnit: {
    '&.MuiTypography-root': {
      fontSize: 13.5,
      fontWeight: 400,
      color: theme.palette.textSecondary3,
    },
  },
  changeMove: {
    '&.MuiTypography-root': {
      fontSize: 12,
      color: theme.palette.textSecondary2,
      fontVariantNumeric: 'tabular-nums',
    },
  },
  changeReason: {
    '&.MuiTypography-root': { fontSize: 12, color: theme.palette.textSecondary3 },
  },
  changeRegression: {
    '&.MuiTypography-root': { fontSize: 12, color: theme.palette.textAlert, fontWeight: 500 },
  },

  changeDelta: {
    '&.MuiTypography-root': {
      fontSize: 13,
      fontWeight: 600,
      minWidth: 62,
      textAlign: 'right',
      fontVariantNumeric: 'tabular-nums',
      color: theme.palette.textSuccess,
    },
  },
  changeDeltaCost: { '&.MuiTypography-root': { color: theme.palette.textAlert } },
  changeDeltaNone: { '&.MuiTypography-root': { color: theme.palette.textSecondary3 } },

  rowControls: { display: 'flex', alignItems: 'center', gap: 6, paddingTop: 1 },
  lockButton: {
    appearance: 'none',
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    padding: 2,
    fontSize: 13,
    lineHeight: 1,
    borderRadius: 3,
    opacity: 0.32,
    '&:hover': { opacity: 0.8 },
    '&:focus-visible': {
      outline: `2px solid ${theme.palette.surfaceBrand}`,
      outlineOffset: 1,
      opacity: 0.8,
    },
  },
  lockButtonOn: { opacity: 1, color: theme.palette.textWarning },
  checkbox: {
    width: 16,
    height: 16,
    margin: 0,
    cursor: 'pointer',
    accentColor: theme.palette.surfaceBrand,
  },

  /* ---------- notification + notes ---------- */
  notifyPill: {
    display: 'inline-flex',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    padding: '1px 7px',
    borderRadius: 9,
    fontSize: 10.5,
    fontWeight: 600,
    background: theme.palette.surfaceWarningSubtle,
    color: theme.palette.textPrimary,
  },
  heldMeta: {
    '&.MuiTypography-root': { fontSize: 12, color: theme.palette.textSecondary3 },
  },

  /* ---------- week bars ---------- */
  weekList: { display: 'flex', flexDirection: 'column', padding: '6px 16px 16px' },
  dayRow: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1.5),
    padding: '9px 0',
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
    '&:last-child': { borderBottom: 'none' },
  },
  dayLabel: { minWidth: 62 },
  dayName: {
    '&.MuiTypography-root': { fontSize: 12.5, fontWeight: 600, color: theme.palette.textPrimary },
  },
  dayDate: {
    '&.MuiTypography-root': { fontSize: 10.5, color: theme.palette.textSecondary3 },
  },
  barStack: { flex: '1 1', display: 'flex', flexDirection: 'column', gap: 3, position: 'relative' },
  /* Ghost above, proposal below — the plan as it stands and the plan as offered,
     on the same row, so the cost is never a click away from the benefit. */
  barTrack: { position: 'relative', height: 16, borderRadius: 3, background: 'transparent' },
  barGhost: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: 5,
    borderRadius: 3,
    background: theme.palette.borderSubtle2,
  },
  barAfter: {
    position: 'absolute',
    left: 0,
    top: 7,
    height: 9,
    borderRadius: 3,
    background: theme.palette.surfaceBrand,
  },
  barOverflow: {
    position: 'absolute',
    top: 7,
    height: 9,
    borderRadius: 3,
    background: theme.palette.surfaceWarningStrong,
  },
  budgetMark: {
    position: 'absolute',
    top: -2,
    bottom: -2,
    width: 1,
    background: theme.palette.textSecondary3,
    opacity: 0.5,
  },
  dayFigure: { minWidth: 96, textAlign: 'right' },
  dayMinutes: {
    '&.MuiTypography-root': {
      fontSize: 12.5,
      fontWeight: 600,
      color: theme.palette.textPrimary,
      fontVariantNumeric: 'tabular-nums',
    },
  },
  dayMinutesOver: { '&.MuiTypography-root': { color: theme.palette.textWarning } },
  dayDelta: {
    '&.MuiTypography-root': {
      fontSize: 11,
      color: theme.palette.textSecondary3,
      fontVariantNumeric: 'tabular-nums',
    },
  },
  weekFootnote: {
    '&.MuiTypography-root': {
      fontSize: 11.5,
      lineHeight: 1.5,
      color: theme.palette.textSecondary3,
      padding: '10px 16px 0',
      borderTop: `1px solid ${theme.palette.borderSubtle1}`,
    },
  },

  /* ---------- sequence diff ---------- */
  seqPane: {
    display: 'flex',
    flexDirection: 'column',
    flex: '1 1',
    minHeight: 0,
    margin: '16px 32px 0',
    border: `1px solid ${theme.palette.borderSubtle1}`,
    borderRadius: 6,
    overflow: 'hidden',
    [theme.breakpoints.down('lg')]: { margin: '16px 16px 0' },
  },
  seqHeaderLeft: { display: 'flex', alignItems: 'center', gap: theme.spacing(1) },
  liveChip: {
    '&.MuiChip-root': {
      height: 20,
      borderRadius: 10,
      background: theme.palette.surfaceBrandSubtle,
      color: theme.palette.textBrand,
      fontSize: 10,
      fontWeight: 700,
      letterSpacing: '0.06em',
    },
  },
  seqColumns: {
    display: 'grid',
    /* The order label sits over the badge and the name together, so it has room
       to stay on one line. */
    gridTemplateColumns: '56px 1fr 76px 76px',
    gap: theme.spacing(1.5),
    padding: '8px 16px',
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
  },
  seqColLabel: {
    '&.MuiTypography-root': {
      fontSize: 10,
      fontWeight: 700,
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
      color: theme.palette.textSecondary3,
    },
  },
  seqColRight: { '&.MuiTypography-root': { textAlign: 'right' } },
  seqRow: {
    display: 'grid',
    gridTemplateColumns: '56px 44px 1fr 76px 76px',
    gap: theme.spacing(1.5),
    alignItems: 'center',
    padding: '11px 16px',
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
    background: theme.palette.surfaceWhite,
  },
  seqRowFrozen: { background: theme.palette.surfaceGreySubtle },
  seqWas: { display: 'flex', alignItems: 'center', gap: 4 },
  seqWasNumber: {
    '&.MuiTypography-root': {
      fontSize: 12,
      color: theme.palette.textSecondary3,
      opacity: 0.55,
      fontVariantNumeric: 'tabular-nums',
    },
  },
  seqWasMoved: {
    '&.MuiTypography-root': { color: theme.palette.textWarning, opacity: 1, fontWeight: 600 },
  },
  seqWasArrow: { fontSize: 12, color: theme.palette.textWarning },
  seqBadgeCell: { display: 'flex', justifyContent: 'center' },
  seqBadge: {
    width: 26,
    height: 26,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 11.5,
    fontWeight: 700,
    border: `1.5px solid ${theme.palette.surfaceBrand}`,
    color: theme.palette.textBrand,
    fontVariantNumeric: 'tabular-nums',
  },
  seqBadgeMoved: {
    background: theme.palette.surfaceBrand,
    color: theme.palette.textOnColor,
    borderColor: theme.palette.surfaceBrand,
  },
  seqBadgeLocked: {
    borderColor: theme.palette.surfaceWarningStrong,
    color: theme.palette.textWarning,
  },
  seqBadgeFrozen: {
    borderColor: theme.palette.borderSubtle2,
    color: theme.palette.textSecondary3,
  },
  seqBadgeLive: {
    borderColor: theme.palette.surfaceBrand,
    color: theme.palette.textBrand,
  },
  seqBody: { display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 },
  seqArrival: {
    '&.MuiTypography-root': {
      fontSize: 12.5,
      textAlign: 'right',
      color: theme.palette.textSecondary2,
      fontVariantNumeric: 'tabular-nums',
    },
  },
  seqLockNote: {
    '&.MuiTypography-root': { fontSize: 12, color: theme.palette.textWarning },
  },
  seqTailNote: {
    '&.MuiTypography-root': {
      fontSize: 11.5,
      color: theme.palette.textSecondary3,
      padding: '8px 16px 6px',
      borderBottom: `1px dashed ${theme.palette.borderSubtle2}`,
    },
  },

  /* ---------- commit bar ---------- */
  commitBar: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(2),
    margin: '16px 32px',
    padding: '12px 20px',
    borderRadius: 6,
    border: `1px solid ${theme.palette.surfaceBrand}`,
    background: theme.palette.surfaceBrandSubtle,
    [theme.breakpoints.down('lg')]: { margin: '16px' },
    [theme.breakpoints.down('sm')]: { flexDirection: 'column', alignItems: 'stretch' },
  },
  commitSummary: { flex: '1 1', display: 'flex', flexDirection: 'column', gap: 2 },
  commitLine: {
    '&.MuiTypography-root': {
      fontSize: 13,
      fontWeight: 600,
      color: theme.palette.textPrimary,
      fontVariantNumeric: 'tabular-nums',
    },
  },
  commitSubline: {
    '&.MuiTypography-root': { fontSize: 12, color: theme.palette.textSecondary3 },
  },
  commitActions: { display: 'flex', alignItems: 'center', gap: theme.spacing(1) },

  /* ---------- selection picker ---------- */
  pickPane: {
    display: 'flex',
    flexDirection: 'column',
    flex: '1 1',
    minHeight: 0,
    margin: '16px 32px 0',
    border: `1px solid ${theme.palette.borderSubtle1}`,
    borderRadius: 6,
    overflow: 'hidden',
    [theme.breakpoints.down('lg')]: { margin: '16px 16px 0' },
  },
  pickTitle: {
    '&.MuiTypography-root': { fontSize: 14, fontWeight: 600, color: theme.palette.textPrimary },
  },
  pickBody: {
    '&.MuiTypography-root': {
      fontSize: 12.5,
      color: theme.palette.textSecondary3,
      maxWidth: '72ch',
      marginTop: 2,
    },
  },
  pickRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: theme.spacing(1.5),
    padding: '11px 16px',
    cursor: 'pointer',
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
    '&:hover': { background: theme.palette.surfaceGreySubtle },
    '&:focus-within': { background: theme.palette.surfaceGreySubtle },
  },
  pickBodyCell: { display: 'flex', flexDirection: 'column', gap: 2 },

  /* ---------- notify dialog ---------- */
  notifyDialog: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
    padding: '22px 24px 18px',
  },
  notifyTitle: {
    '&.MuiTypography-root': { fontSize: 17, fontWeight: 600, color: theme.palette.textPrimary },
  },
  notifySubtitle: {
    '&.MuiTypography-root': {
      fontSize: 13,
      color: theme.palette.textSecondary3,
      marginTop: 3,
      maxWidth: '58ch',
    },
  },
  notifyList: {
    display: 'flex',
    flexDirection: 'column',
    border: `1px solid ${theme.palette.borderSubtle1}`,
    borderRadius: 6,
    overflow: 'hidden',
  },
  notifyRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: theme.spacing(1.5),
    padding: '12px 16px',
    cursor: 'pointer',
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
    '&:last-child': { borderBottom: 'none' },
    '&:hover': { background: theme.palette.surfaceGreySubtle },
    '&:focus-within': { background: theme.palette.surfaceGreySubtle },
  },
  notifyBody: { display: 'flex', flexDirection: 'column', gap: 2 },
  notifyContact: {
    '&.MuiTypography-root': { fontSize: 13.5, fontWeight: 600, color: theme.palette.textPrimary },
  },
  notifyReason: {
    '&.MuiTypography-root': { fontSize: 12.5, color: theme.palette.textSecondary3 },
  },
  notifyWarning: {
    padding: '10px 14px',
    borderRadius: 5,
    background: theme.palette.surfaceWarningSubtle,
    fontSize: 12.5,
    color: theme.palette.textPrimary,
  },
  notifyFooter: { display: 'flex', justifyContent: 'flex-end' },

  /* summary cells that open something are buttons, and look it */
  summaryCellButton: {
    appearance: 'none',
    border: 'none',
    borderRight: `1px solid ${theme.palette.borderSubtle1}`,
    font: 'inherit',
    textAlign: 'left',
    cursor: 'pointer',
    background: 'transparent',
    '&:hover': { background: theme.palette.surfaceWhite },
    '&:focus-visible': {
      outline: `2px solid ${theme.palette.surfaceBrand}`,
      outlineOffset: -2,
    },
  },
  summaryCellLink: {
    '&.MuiTypography-root': {
      color: theme.palette.textBrand,
      textDecoration: 'underline',
      textUnderlineOffset: 2,
    },
  },

  /* ---------- result states ---------- */
  stateCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: theme.spacing(1),
    margin: '24px 32px',
    padding: '22px 24px',
    borderRadius: 6,
    border: `1px solid ${theme.palette.borderSubtle1}`,
    borderLeft: `3px solid ${theme.palette.borderSubtle2}`,
    background: theme.palette.surfaceWhite,
    maxWidth: 720,
    [theme.breakpoints.down('lg')]: { margin: '24px 16px' },
  },
  stateCardGood: {
    borderLeftColor: theme.palette.surfaceBrand,
    background: theme.palette.surfaceSuccessSubtle,
  },
  stateCardWarn: {
    borderLeftColor: theme.palette.surfaceWarningStrong,
    background: theme.palette.surfaceWarningSubtle,
  },
  stateCardAlert: {
    borderLeftColor: theme.palette.surfaceAlertStrong,
    background: theme.palette.surfaceAlertSubtle,
  },
  stateTitle: {
    '&.MuiTypography-root': {
      fontSize: 16,
      fontWeight: 600,
      color: theme.palette.textPrimary,
    },
  },
  stateBody: {
    '&.MuiTypography-root': {
      fontSize: 13.5,
      lineHeight: 1.6,
      color: theme.palette.textSecondary2,
      maxWidth: '62ch',
    },
  },
  stateActions: { display: 'flex', gap: theme.spacing(1), marginTop: theme.spacing(1) },

  /* ---------- solving ---------- */
  solvingStrip: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1.5),
    margin: '16px 32px',
    padding: '12px 18px',
    borderRadius: 6,
    border: `1px solid ${theme.palette.borderSubtle1}`,
    background: theme.palette.surfaceGreySubtle,
    [theme.breakpoints.down('lg')]: { margin: '16px' },
  },
  solvingDot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    background: theme.palette.surfaceBrand,
    animation: '$pulse 1.1s ease-in-out infinite',
    '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
  },
  '@keyframes pulse': {
    '0%, 100%': { opacity: 0.35 },
    '50%': { opacity: 1 },
  },
  solvingText: {
    '&.MuiTypography-root': { flex: '1 1', fontSize: 13, color: theme.palette.textSecondary2 },
  },

  /* ---------- popover ---------- */
  popover: {
    width: 344,
    padding: '16px 18px 14px',
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1.5),
  },
  popTitle: {
    '&.MuiTypography-root': { fontSize: 14, fontWeight: 600, color: theme.palette.textPrimary },
  },
  popTarget: {
    '&.MuiTypography-root': { fontSize: 12, color: theme.palette.textSecondary3 },
  },
  popDivider: { height: 1, background: theme.palette.borderSubtle1 },
  modeOption: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: theme.spacing(1),
    padding: '7px 8px',
    borderRadius: 5,
    cursor: 'pointer',
    '&:hover': { background: theme.palette.surfaceGreySubtle },
    '&:focus-within': { background: theme.palette.surfaceGreySubtle },
  },
  modeRadio: { marginTop: 2, accentColor: theme.palette.surfaceBrand, cursor: 'pointer' },
  modeLabel: {
    '&.MuiTypography-root': { fontSize: 13, fontWeight: 600, color: theme.palette.textPrimary },
  },
  modeHint: {
    '&.MuiTypography-root': { fontSize: 11.5, color: theme.palette.textSecondary3 },
  },
  popLocks: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '8px 10px',
    borderRadius: 5,
    background: theme.palette.surfaceWarningSubtle,
    fontSize: 11.5,
    color: theme.palette.textPrimary,
  },
  popFooter: { display: 'flex', justifyContent: 'flex-end', gap: theme.spacing(1) },

  /* ---------- misc ---------- */
  srOnly: {
    position: 'absolute',
    width: 1,
    height: 1,
    padding: 0,
    margin: -1,
    overflow: 'hidden',
    clip: 'rect(0 0 0 0)',
    whiteSpace: 'nowrap',
    border: 0,
  },
  tableReset: {
    width: '100%',
    borderCollapse: 'collapse',
  },
}));
