import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  inlineDropdwon: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'relative',
  },
  blueLabel: {
    '&.MuiFormLabel-root': {
      color: theme.palette.textBrand,
      marginBottom: '0px',
      fontWeight: '400',
    },
    '&.MuiTypography-root': {
      color: theme.palette.textBrand,
      marginBottom: '0px',
    },
  },
  blackLabel: {
    padding: '8px',
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
    },
  },
  btnColor: {
    '&.MuiButtonBase-root': {
      fontWeight: '400',
      color: theme.palette.textPrimary,
      paddingRight: '5px ',
      paddingLeft: '5px ',
      textTransform: 'capitalize',
      '&:hover': {
        color: theme.palette.textPrimary,
        background: theme.palette.surfaceGreySubtle,
      },
    },
  },
  btnColorBlck: {
    '&.MuiButtonBase-root.Mui-disabled': {
      fontWeight: '400',
      color: theme.palette.textPrimary,
      paddingRight: '5px ',
      paddingLeft: '5px ',
      '&:hover': {
        color: theme.palette.textPrimary,
        background: theme.palette.surfaceGreySubtle,
      },
    },
  },

  borderLessDrop: {
    position: 'static !important',
    borderRadius: '5px',
    '&:hover': {
      borderRadius: '5px',

      background: theme.palette.surfaceGreySubtle,
    },
    '& > :nth-child(1)': {
      paddingRight: '2px ',
      paddingLeft: '5px ',
    },
    '& > :nth-child(2)': {
      width: '100%',
    },
  },
  dropIcon: {
    '& path': {
      stroke: theme.palette.surfaceGreyStrong1,
    },
  },
  assignAvatar: {
    '&.MuiAvatar-root': {
      width: '16px',
      height: '16px',
      marginRight: '4px',
    },
  },
}));
