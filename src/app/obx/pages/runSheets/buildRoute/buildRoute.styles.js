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
    [theme.breakpoints.down('lg')]: {
      padding: '20px 16px 0',
    },
  },
  headerTitle: {
    '&.MuiTypography-root': {
      fontSize: 20,
      fontWeight: 600,
      color: theme.palette.textPrimary,
    },
  },
  backButton: {
    '&.MuiButtonBase-root': {
      padding: 0,
      minWidth: 'auto',
      height: 'auto',
    },
  },
  headerSubtitle: {
    '&.MuiTypography-root': {
      padding: '2px 32px 0',
      fontSize: 13,
      color: theme.palette.textSecondary3,
      [theme.breakpoints.down('lg')]: {
        padding: '2px 16px 0',
      },
    },
  },

  /* ---------- trip controls ---------- */
  controls: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'flex-end',
    gap: theme.spacing(2),
    padding: '16px 32px',
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
    [theme.breakpoints.down('lg')]: {
      padding: '16px',
    },
  },
  control: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    minWidth: 190,
  },
  controlLabel: {
    '&.MuiTypography-root': {
      fontSize: 11,
      fontWeight: 600,
      letterSpacing: '0.06em',
      textTransform: 'uppercase',
      color: theme.palette.textSecondary3,
    },
  },
  liveChip: {
    '&.MuiChip-root': {
      height: 22,
      borderRadius: 11,
      background: theme.palette.surfaceBrandSubtle,
      color: theme.palette.textBrand,
      fontSize: 11,
      fontWeight: 600,
      marginLeft: theme.spacing(1),
    },
  },

  /* ---------- body split ---------- */
  body: {
    display: 'flex',
    flex: '1 1',
    minHeight: 0,
    [theme.breakpoints.down('md')]: {
      flexDirection: 'column',
    },
  },
  pool: {
    width: '42%',
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
    borderRight: `1px solid ${theme.palette.borderSubtle1}`,
    [theme.breakpoints.down('md')]: {
      width: '100%',
      borderRight: 'none',
      borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
    },
  },
  poolHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing(1),
    padding: '12px 24px',
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
    [theme.breakpoints.down('lg')]: {
      padding: '12px 16px',
    },
  },
  poolScroll: {
    flex: '1 1',
    overflowY: 'auto',
    minHeight: 0,
  },
  sectionLabel: {
    '&.MuiTypography-root': {
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
      color: theme.palette.textSecondary3,
    },
  },

  /* ---------- candidate groups ---------- */
  groupHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    padding: '8px 24px',
    position: 'sticky',
    top: 0,
    zIndex: 2,
    background: theme.palette.surfaceGreySubtle,
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
    [theme.breakpoints.down('lg')]: {
      padding: '8px 16px',
    },
  },
  groupHeaderOverdue: {
    background: theme.palette.surfaceAlertSubtle,
  },
  groupHeaderToday: {
    background: theme.palette.surfaceBrandSubtle,
  },
  groupTitle: {
    '&.MuiTypography-root': {
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
    },
  },
  groupTitleOverdue: { color: theme.palette.textAlert },
  groupTitleToday: { color: theme.palette.textBrand },
  groupTitleAhead: { color: theme.palette.textSecondary2 },
  groupMeta: {
    '&.MuiTypography-root': {
      marginLeft: 'auto',
      fontSize: 11,
      color: theme.palette.textSecondary3,
    },
  },
  selectAllButton: {
    '&.MuiButtonBase-root': {
      padding: '0 4px',
      minWidth: 'auto',
      height: 'auto',
      fontSize: 11,
      fontWeight: 600,
      textTransform: 'none',
    },
  },

  /* ---------- candidate row ---------- */
  candidate: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: theme.spacing(1.25),
    padding: '10px 24px',
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
    cursor: 'pointer',
    transition: 'background 0.15s',
    '&:hover': {
      background: theme.palette.surfaceGreyLight,
    },
    [theme.breakpoints.down('lg')]: {
      padding: '10px 16px',
    },
  },
  candidateSelected: {
    background: theme.palette.surfaceBrandSubtle,
    '&:hover': {
      background: theme.palette.surfaceBrandSubtle,
    },
  },
  candidateCheckbox: {
    '&.MuiCheckbox-root': {
      padding: 0,
      marginTop: 2,
    },
  },
  candidateBody: {
    flex: '1 1',
    minWidth: 0,
  },
  candidateTopLine: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.75),
    flexWrap: 'wrap',
  },
  candidateName: {
    '&.MuiTypography-root': {
      fontSize: 13,
      fontWeight: 600,
      color: theme.palette.textPrimary,
    },
  },
  candidateUnit: {
    '&.MuiTypography-root': {
      fontSize: 12,
      color: theme.palette.textSecondary3,
    },
  },
  candidateSubLine: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.75),
    flexWrap: 'wrap',
    marginTop: 2,
  },
  candidateMeta: {
    '&.MuiTypography-root': {
      fontSize: 11.5,
      color: theme.palette.textSecondary3,
    },
  },
  candidateService: {
    '&.MuiTypography-root': {
      fontSize: 12,
      fontWeight: 600,
      color: theme.palette.textSecondary2,
      whiteSpace: 'nowrap',
      marginTop: 1,
    },
  },

  /* ---------- small pills ---------- */
  pill: {
    display: 'inline-flex',
    alignItems: 'center',
    height: 18,
    padding: '0 7px',
    borderRadius: 9,
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
    whiteSpace: 'nowrap',
  },
  pillOverdue: {
    background: theme.palette.surfaceAlertSubtle,
    color: theme.palette.textAlert,
  },
  pillMoved: {
    background: theme.palette.surfaceWarningSubtle,
    color: '#8A5C0E',
  },
  pillRunsheet: {
    background: theme.palette.surfaceGreySubtle,
    color: theme.palette.textSecondary2,
  },
  pillWindow: {
    background: theme.palette.surfaceWarningSubtle,
    color: '#8A5C0E',
    textTransform: 'none',
    letterSpacing: 0,
    fontWeight: 600,
  },

  /* ---------- right pane ---------- */
  plan: {
    flex: '1 1',
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
    background: theme.palette.surfaceGreyLight,
  },
  planScroll: {
    flex: '1 1',
    overflowY: 'auto',
    minHeight: 0,
    padding: '16px 24px',
    [theme.breakpoints.down('lg')]: {
      padding: '16px',
    },
  },
  planCard: {
    background: theme.palette.surfaceWhite,
    border: `1px solid ${theme.palette.borderSubtle1}`,
    borderRadius: 8,
    marginBottom: theme.spacing(1.5),
    overflow: 'hidden',
  },
  planCardHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing(1),
    padding: '11px 16px',
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
  },
  planCardBody: {
    padding: '12px 16px',
  },

  /* ---------- route timeline ---------- */
  timeline: {
    position: 'relative',
    paddingLeft: 4,
  },
  legRow: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    padding: '2px 0 2px 34px',
    position: 'relative',
    minHeight: 22,
    '&::before': {
      content: '""',
      position: 'absolute',
      left: 15,
      top: 0,
      bottom: 0,
      width: 2,
      background: theme.palette.borderSubtle2,
    },
  },
  legText: {
    '&.MuiTypography-root': {
      fontSize: 11,
      color: theme.palette.textSecondary3,
    },
  },
  stopRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: theme.spacing(1.25),
    padding: '7px 0',
    position: 'relative',
  },
  stopIndex: {
    width: 26,
    height: 26,
    borderRadius: '50%',
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 11,
    fontWeight: 700,
    background: theme.palette.surfaceBrand,
    color: theme.palette.textOnColor,
  },
  stopIndexOver: {
    background: theme.palette.surfaceWarningStrong,
  },
  stopIndexDone: {
    background: theme.palette.surfaceWhite,
    color: theme.palette.textSecondary3,
    border: `1.5px solid ${theme.palette.borderSubtle2}`,
  },
  stopBody: {
    flex: '1 1',
    minWidth: 0,
  },
  stopName: {
    '&.MuiTypography-root': {
      fontSize: 13,
      fontWeight: 600,
      color: theme.palette.textPrimary,
    },
  },
  stopMeta: {
    '&.MuiTypography-root': {
      fontSize: 11.5,
      color: theme.palette.textSecondary3,
    },
  },
  stopArrival: {
    '&.MuiTypography-root': {
      fontSize: 12,
      fontWeight: 600,
      color: theme.palette.textSecondary2,
      whiteSpace: 'nowrap',
      marginTop: 4,
    },
  },
  stopArrivalOver: {
    '&.MuiTypography-root': {
      color: '#8A5C0E',
    },
  },
  jobsBadge: {
    '&.MuiChip-root': {
      height: 17,
      fontSize: 10,
      fontWeight: 700,
      borderRadius: 9,
      background: theme.palette.surfaceBrandSubtle,
      color: theme.palette.textBrand,
    },
  },

  /* ---------- van load ---------- */
  loadGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: theme.spacing(1),
  },
  loadItem: {
    border: `1px solid ${theme.palette.borderSubtle1}`,
    borderRadius: 6,
    padding: '7px 11px',
    minWidth: 96,
  },
  loadName: {
    '&.MuiTypography-root': {
      fontSize: 11,
      color: theme.palette.textSecondary3,
    },
  },
  loadQty: {
    '&.MuiTypography-root': {
      fontSize: 17,
      fontWeight: 700,
      color: theme.palette.textPrimary,
      lineHeight: 1.2,
    },
  },

  /* ---------- capacity meter ---------- */
  meterBar: {
    borderTop: `1px solid ${theme.palette.borderSubtle1}`,
    background: theme.palette.surfaceWhite,
    padding: '12px 32px 14px',
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(3),
    flexWrap: 'wrap',
    [theme.breakpoints.down('lg')]: {
      padding: '12px 16px 14px',
    },
  },
  meterMain: {
    flex: '1 1 340px',
    minWidth: 260,
  },
  meterTopLine: {
    display: 'flex',
    alignItems: 'baseline',
    gap: theme.spacing(1),
    marginBottom: 6,
  },
  meterTitle: {
    '&.MuiTypography-root': {
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
      color: theme.palette.textSecondary3,
    },
  },
  meterTotal: {
    '&.MuiTypography-root': {
      fontSize: 14,
      fontWeight: 700,
      color: theme.palette.textPrimary,
    },
  },
  meterRemaining: {
    '&.MuiTypography-root': {
      marginLeft: 'auto',
      fontSize: 11.5,
      color: theme.palette.textSecondary3,
    },
  },
  meterRemainingOver: {
    '&.MuiTypography-root': {
      color: '#8A5C0E',
      fontWeight: 600,
    },
  },
  meterTrack: {
    position: 'relative',
    height: 14,
    borderRadius: 3,
    background: theme.palette.surfaceGreySubtle,
    overflow: 'hidden',
    display: 'flex',
  },
  meterService: {
    background: theme.palette.surfaceBrand,
    height: '100%',
  },
  meterTravel: {
    background: theme.palette.surfaceBrandDisabled,
    height: '100%',
  },
  meterOverflow: {
    background: theme.palette.surfaceWarningStrong,
    height: '100%',
  },
  meterLegend: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1.5),
    marginTop: 6,
    flexWrap: 'wrap',
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 5,
  },
  legendSwatch: {
    width: 9,
    height: 9,
    borderRadius: 2,
    flexShrink: 0,
  },
  legendSwatchService: { background: theme.palette.surfaceBrand },
  legendSwatchTravel: { background: theme.palette.surfaceBrandDisabled },
  legendSwatchOverflow: { background: theme.palette.surfaceWarningStrong },
  legendText: {
    '&.MuiTypography-root': {
      fontSize: 11,
      color: theme.palette.textSecondary3,
    },
  },
  meterActions: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    marginLeft: 'auto',
  },

  /* ---------- empty state ---------- */
  emptyPlan: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing(0.5),
    padding: '48px 24px',
    textAlign: 'center',
  },
  emptyTitle: {
    '&.MuiTypography-root': {
      fontSize: 14,
      fontWeight: 600,
      color: theme.palette.textSecondary2,
    },
  },
  emptyText: {
    '&.MuiTypography-root': {
      fontSize: 12.5,
      color: theme.palette.textSecondary3,
      maxWidth: 320,
    },
  },
}));
