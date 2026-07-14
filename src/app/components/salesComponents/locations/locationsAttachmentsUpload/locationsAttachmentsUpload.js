import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  dragText: {
    '&.MuiTypography-root': {
      color: `${theme.palette.textPlaceholder} !important`,
    },
  },

  dragTextBelow: {
    '&.MuiTypography-body3': {
      display: 'block',
      color: `${theme.palette.textPlaceholder} !important`,
      marginTop: '4px',
      fontSize: '12px !important',
    },
  },

  boldText: {
    '&.MuiTypography-subtitle2': {
      color: `${theme.palette.textPrimary} !important`,
      fontWeight: '500 !important',
    },
  },

  formBoxImage: {
    display: 'flex',
    flexDirection: 'row',
    gap: '20px',
  },

  paperWrapper: {
    flex: '1',
    width: '100%',
    padding: '16px 24px',
    textAlign: 'center',
    cursor: 'pointer',
    border: `1px solid ${theme.palette.borderSubtle1} !important`,
    boxShadow: 'none !important',
    borderRadius: '8px !important',
  },

  inputFileWrapper: {
    position: 'relative',
    padding: '0 !important',
    height: 'unset !important',
  },

  uploadBtn: {
    display: 'flex',
    gap: '6px',
    justifyContent: 'center',
    marginTop: '12px',
  },

  customFileInput: {
    position: 'absolute',
    top: '0',
    left: '0',
    height: '100%',
    width: '100%',
    opacity: '0',
    padding: '0 !important',
    cursor: 'pointer',
  },
}));
