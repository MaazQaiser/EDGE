import { makeStyles } from '@mui/styles';
export const useStyles = makeStyles((theme) => ({
  upperWrap: {
    padding: '14px',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'auto',
    marginTop: '8px',
    borderRadius: '8px',
    flex: '1 1',
    background: theme.palette.surfaceGreySubtle,
  },
  ChipsWrap: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
    flexWrap: 'wrap',

    '& .MuiChip-root.MuiChip-filled': {
      background: '#e4e4e6',
    },
  },
  dot: {
    width: '5px',
    height: '5px',
    color: theme.palette.textPlaceholder,
  },
  sideTitle: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
      marginBottom: '0',
    },
  },

  mainHeading: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '6px',
    gap: '10px',
    '& .MuiTypography-root': {
      color: theme.palette.textPrimary,
    },
  },
  fieldWrapper: {
    flex: '0 1 31.9%',
    '& label.MuiFormLabel-root': {
      color: theme.palette.textPrimary,
      marginBottom: '0px',
    },
    '& .MuiTypography-root': {
      color: theme.palette.textPlaceholder,
    },
  },

  fieldWrapperTwin: {
    display: 'flex',
    gap: '16px',
    flexWrap: 'wrap',
  },

  placeHolderColors: {
    color: theme.palette.textPlaceholderField,
    fontSize: '16px !important',
    fontWeight: '400 !important',
  },

  emailChips: {
    gap: '8px',
    display: 'flex',
    marginTop: '15px',
    '& .MuiButtonBase-root.MuiChip-root.MuiChip-filled': {
      gap: '15px',
    },
  },
  inlineFields: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },

  autoCheckout: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    '& span.MuiSwitch-root': {
      background: theme.palette.surfaceGreyLight,
      borderRadius: '20px',
    },
    '& label.MuiFormLabel-root': {
      marginBottom: '0px',
    },
  },
}));
