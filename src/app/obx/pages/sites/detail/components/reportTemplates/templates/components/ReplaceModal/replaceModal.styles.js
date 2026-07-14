import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  cloneModal: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: ' 600px',
    backgroundColor: theme.palette.surfaceWhite,
    boxShadow: '0px 8px 8px -4px rgba(16, 24, 40, 0.04), 0px 20px 24px -4px rgba(16, 24, 40, 0.1)',
    borderRadius: '12px',
    padding: '24px',
  },

  center: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  cloneModalContent: {
    marginTop: '20px',
  },

  cloneModalTitle: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
    },
  },

  cloneModalText: {
    '&.MuiTypography-root': {
      color: theme.palette.textPlaceholder,
      marginTop: '8px',
    },

    '& span': {
      fontWeight: '700',
    },
  },

  cloneModalFields: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    marginTop: '20px',
  },

  cloneModalFieldsReplace: {
    display: 'flex',
    flexDirection: 'column',
    marginTop: '20px',
  },

  replaceModalDropdown: {
    height: '44px',

    '& div': {
      '& div': {
        '& .MuiTypography-root': {
          fontSize: '16px',
          fontWeight: '400',
        },
      },
    },
  },

  loaderWrapper: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: '20px',
  },

  cloneFieldMargin: {
    marginTop: '20px',
  },

  loadingState: {
    width: '24px',
    height: '24px',
    border: '3px dotted #146dff',
    borderStyle: 'solid solid dotted dotted',
    borderRadius: '50%',
    display: 'inline-block',
    position: 'relative',
    boxSizing: 'border-box',
    animation: '$rotation 2s linear infinite',
    '&:after': {
      content: '""',
      boxSizing: 'border-box',
      position: 'absolute',
      left: '0',
      right: '0',
      top: '0',
      bottom: '0',
      margin: 'auto',
      border: '3px dotted #146dff',
      borderStyle: 'solid solid dotted',
      width: '12px',
      height: '12px',
      borderRadius: '50%',
      animation: '$rotationBack 1s linear infinite',
      transformOrigin: 'center center',
    },
  },
  '@keyframes rotation': {
    '0%': {
      transform: 'rotate(0deg)',
    },
    '100%': {
      transform: 'rotate(360deg)',
    },
  },
  '@keyframes rotationBack': {
    '0%': {
      transform: 'rotate(0deg)',
    },
    '100% ': {
      transform: 'rotate(-360deg)',
    },
  },

  cloneModalActions: {
    marginTop: '32px',
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    columnGap: '12px',
  },

  invalidFeedback: {
    fontSize: 14,
    lineHeight: '20px',
    fontWeight: 400,
    margin: 0,
    marginTop: '6px',
    color: theme.palette.textAlert,
    textShadow: '0px 0px 0px #F4EBFF, 0px 1px 2px rgba(16, 24, 40, 0.05)',
    '&::first-letter ': {
      textTransform: 'capitalize',
    },
  },
}));
