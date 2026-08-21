import { makeStyles } from '@mui/styles';

/**
 * Layout only — type comes from the theme's Typography variants and colour from
 * `theme.palette`. Matches the drawer conventions used elsewhere in the module:
 * bordered header, scrolling body, bordered footer holding the actions.
 */
export const useStyles = makeStyles((theme) => ({
  drawerWrapper: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    overflow: 'hidden',
  },

  drawerHeader: {
    padding: '24px 24px 16px 24px',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
  },

  headerTitle: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
      marginBottom: '4px',
    },
  },

  headerMeta: {
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary3,
    },
  },

  closeBtn: {
    '&.MuiButtonBase-root': {
      padding: '0px',
      height: 'auto',
      minWidth: 'auto',
    },
  },

  drawerBody: {
    padding: '20px 24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    flex: '1',
    overflow: 'auto',
  },

  moneyRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: '12px',
  },

  moneyTile: {
    border: `1px solid ${theme.palette.borderSubtle1}`,
    borderRadius: '8px',
    padding: '12px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },

  moneyTileLabel: {
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary3,
      textTransform: 'uppercase',
      letterSpacing: '0.04em',
    },
  },

  moneyTileValue: {
    '&.MuiTypography-root': { color: theme.palette.textPrimary },
  },

  moneyTileValueDue: {
    '&.MuiTypography-root': {
      color: theme.palette.textAlert,
    },
  },

  moneyTileValueCredit: {
    '&.MuiTypography-root': {
      color: theme.palette.textWarning,
    },
  },

  sectionTitle: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
      marginBottom: '12px',
    },
  },

  ledger: {
    display: 'flex',
    flexDirection: 'column',
    border: `1px solid ${theme.palette.borderSubtle1}`,
    borderRadius: '8px',
    overflow: 'hidden',
  },

  ledgerRow: {
    display: 'grid',
    gridTemplateColumns: '110px 1fr 120px 40px',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
    '&:last-child': {
      borderBottom: 'none',
    },
  },

  ledgerDate: {
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary2,
    },
  },

  ledgerMethod: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
      textTransform: 'capitalize',
    },
  },

  ledgerReference: {
    '&.MuiTypography-root': { color: theme.palette.textSecondary3 },
  },

  ledgerAmount: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
      fontWeight: 600,
      textAlign: 'right',
    },
  },

  emptyLedger: {
    border: `1px dashed ${theme.palette.borderSubtle2}`,
    borderRadius: '8px',
    padding: '24px',
    textAlign: 'center',
    color: theme.palette.textSecondary3,
  },

  form: {
    border: `1px solid ${theme.palette.borderSubtle1}`,
    borderRadius: '8px',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    background: theme.palette.surfaceGreySubtle,
  },

  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: '16px',
  },

  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },

  helperText: {
    '&.MuiTypography-root': { color: theme.palette.textSecondary3 },
  },

  warningText: {
    '&.MuiTypography-root': { color: theme.palette.textWarning },
  },

  // Chip labels are title-cased by the theme; these read as sentences.
  flagRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    '& .MuiChip-label': {
      textTransform: 'none',
    },
  },

  drawerFooter: {
    padding: '16px 24px',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    borderTop: `1px solid ${theme.palette.borderSubtle1}`,
  },
}));
