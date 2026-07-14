import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  modalWrapper: {
    maxWidth: '303px',
    width: '100%',
    backgroundColor: `${theme.palette.surfaceWhite}`,
    boxShadow: '0px 8px 8px -4px rgba(16, 24, 40, 0.04), 0px 20px 24px -4px rgba(16, 24, 40, 0.10)',
    position: 'absolute',
    left: '80%',
    top: '50%',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',

    borderRadius: '8px',
    transform: 'translate(-50%,-50%)',
    '& .MuiSvgIcon-root': {
      width: '60px',
      height: '60px',
      marginLeft: '-5px',
    },
  },

  textWrap: {
    display: 'flex',
    justifyContent: 'space-between',
    '& svg': {
      cursor: 'pointer',
    },
  },
  textWrapInner: {
    display: 'flex',
    gap: '7px',
  },
  headText: {
    '&.MuiTypography-root': {
      color: `${theme.palette.textPrimary}`,
    },
  },
  secondText: {
    '&.MuiTypography-root': {
      color: `${theme.palette.textSecondary1}`,
    },
  },
  thirdText: {
    '&.MuiTypography-root': {
      fontWeight: '500',
      color: `${theme.palette.textPrimary}`,
    },
  },
}));
