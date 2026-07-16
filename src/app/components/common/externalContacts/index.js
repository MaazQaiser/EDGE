import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },

  card: {
    background: theme.palette.surfaceGreySubtle,
    border: `1px solid ${theme.palette.borderSubtle1}`,
    borderRadius: '12px',
    overflow: 'hidden',
  },

  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
    padding: '14px 20px',
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
    background: 'transparent',
  },

  cardHeaderLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    minWidth: 0,
  },

  avatar: {
    flexShrink: 0,
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '13px',
    fontWeight: 600,
    color: theme.palette.textBrand,
    background: theme.palette.surfaceBrandSubtle || 'rgba(20,109,255,0.1)',
    textTransform: 'uppercase',
  },

  headerText: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
  },

  contactName: {
    fontSize: '14px',
    fontWeight: 600,
    color: theme.palette.textPrimary,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },

  removeBtn: {
    '&.MuiButtonBase-root': {
      flexShrink: 0,
      padding: 0,
      minWidth: 'auto',
      background: 'transparent',
      border: 0,
      fontSize: '14px',
      height: 'auto',
      boxShadow: 'none',
      '&:hover': { border: 0, background: 'transparent' },
      '& .MuiButton-startIcon': {
        marginRight: '4px',
        '& svg': { width: '16px', height: '16px' },
      },
    },
  },

  cardBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    padding: '16px 20px',
  },

  readOnlyRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    columnGap: '40px',
    rowGap: '16px',
    [theme.breakpoints.down('sm')]: {
      gridTemplateColumns: '1fr',
    },
  },

  readOnlyItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    minWidth: 0,
  },

  readOnlyLabel: {
    fontSize: '12px',
    fontWeight: 400,
    color: theme.palette.textSecondary2,
  },

  readOnlyValue: {
    fontSize: '14px',
    fontWeight: 500,
    color: theme.palette.textPrimary,
    wordBreak: 'break-word',
  },

  editableSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    paddingTop: '16px',
    borderTop: `1px dashed ${theme.palette.borderSubtle1}`,
  },

  editableTitle: {
    fontSize: '11px',
    fontWeight: 600,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
    color: theme.palette.textSecondary2,
  },

  editableRow: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: '24px',
    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column',
      alignItems: 'stretch',
      gap: '16px',
    },
  },

  editableControl: {
    flex: 1,
    minWidth: 0,
  },

  editableInput: {
    '& .MuiInputBase-root': {
      background: theme.palette.surfaceWhite,
    },
  },

  emergencyCheckbox: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flex: 1,
    paddingBottom: '10px',
    '& .MuiFormLabel-root': {
      marginBottom: 0,
      fontWeight: 400,
      color: theme.palette.textPrimary,
    },
  },

  checkBoxCustom: {
    '&.MuiCheckbox-root': { padding: 0 },
    '& svg': { width: '16px', height: '16px' },
  },

  picker: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },

  pickerHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: theme.palette.textPrimary,
    fontSize: '14px',
    fontWeight: 600,
    '& svg': { width: '18px', height: '18px' },
  },

  autocomplete: {
    '& .MuiOutlinedInput-root': {
      background: theme.palette.surfaceWhite,
    },
  },

  optionRow: {
    display: 'flex',
    flexDirection: 'column',
  },

  optionName: {
    fontSize: '14px',
    fontWeight: 500,
    color: theme.palette.textPrimary,
  },

  optionMeta: {
    fontSize: '12px',
    color: theme.palette.textSecondary2,
  },

  pickerHint: {
    fontSize: '12px',
    color: theme.palette.textSecondary2,
  },
}));
