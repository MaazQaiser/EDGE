import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  inlineDropdwon: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'relative',
    height: '36px',
  },
  blueLabel: {
    '&.MuiFormLabel-root': {
      color: theme.palette.textBrand,
      marginBottom: '0px',
      fontWeight: '400',
    },
  },
  btnColor: {
    '&.MuiButtonBase-root': {
      color: theme.palette.textPrimary,
      paddingRight: '5px ',
      paddingLeft: '5px ',
      fontWeight: '400',
      textTransform: 'capitalize',
      '&:hover': {
        color: theme.palette.textPrimary,
        background: theme.palette.surfaceGreySubtle,
      },
    },
  },
  borderLessDrop: {
    position: 'static !important',
    color: theme.palette.textPrimary,
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
    '& .MuiTypography-root': {
      color: theme.palette.textPrimary,
      fontWeight: '400',
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
      marginRight: '5px',
    },
  },
  linkFranchise: {
    '&.MuiTypography-root': {
      color: theme.palette.textBrand,
      fontWeight: '400',
      textDecoration: 'underline',
    },
  },
  holderColor: {
    '&.MuiTypography-root': {
      color: '#6A6A70 !important',
      fontWeight: '400',
    },
  },
  dropinnerWrap: {
    '& > .MuiBox-root': {
      '&:not(:first-child)': {
        marginTop: '5px',
      },
    },
  },
  empthyUser: {
    '&.MuiButtonBase-root': {
      color: theme.palette.textBrand,
      textDecoration: 'underline',
      paddingRight: '5px ',
      paddingLeft: '5px ',
      fontWeight: '400',
      '&:hover': {
        color: theme.palette.textBrand,
        background: theme.palette.surfaceGreySubtle,
      },
    },
  },
  title: {
    marginRight: '5px',
    '&.MuiTypography-root': {
      color: '#262527',
      fontWeight: '400',
    },
  },
}));
