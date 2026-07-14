import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  daysOuterDiv: {
    '&.MuiFormControl-root ': {
      display: 'flex',
      flexDirection: 'row',
      gap: '16px',
    },
  },

  dayOuterLayer: {
    border: `1px solid ${theme.palette.borderSubtle2} `,
    fontSize: '16px',
    fontWeight: '400',
    lineHeight: '24px',
    color: theme.palette.textSecondary1,
    borderRadius: '50%',
    height: '44px',
    width: '44px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },

  daySelected: {
    border: `1px solid ${theme.palette.borderBrand} !important`,
    color: `${theme.palette.textOnColor} !important`,
    backgroundColor: `${theme.palette.surfaceBrand} !important`,
  },

  daySelectedDisabled: {
    color: `${theme.palette.textDisabled} !important`,
    backgroundColor: `${theme.palette.surfaceWhite} !important`,
    pointerEvents: 'none',
    cursor: 'not-allowed !important',
    border: `1px solid ${theme.palette.borderSubtle2} `,
  },
}));
