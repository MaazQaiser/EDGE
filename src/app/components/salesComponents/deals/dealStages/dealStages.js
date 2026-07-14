import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  defaultStage: {
    '&.MuiButtonBase-root': {
      background: '#F5F5F6',
      color: '#6A6A70',
      fontSize: '14px',
      fontStyle: 'normal',
      fontWeight: '400',
      lineHeight: '20px',
      borderRadius: '0',
      clipPath: 'polygon(94% 0%, 100% 50%, 94% 100%, 0% 100%, 6% 50%, 0% 0%)',
      padding: '10px 0px',
      flex: '1 1 25%',
      width: '100%',
      '&:hover': {
        background: '#E5F6FF',
        color: '#444446',
      },
      '&:active': {
        background: '#146DFF',
        color: 'white',
      },
    },
  },
  checked: {
    '&.MuiButtonBase-root': {
      background: '#31A150',
      color: 'white !important',

      display: 'flex',
      alignItems: 'center',
      '&:hover': {
        background: '#31A150',
        color: 'white',
      },
    },
    '& svg': {
      marginRight: '10px',
      marginBottom: '2px',
    },
  },
  current: {
    '&.MuiButtonBase-root': {
      background: '#146DFF !important',
      color: 'white !important',
      fontWeight: '700 !important',
    },
  },
  stageWraperr: {
    display: 'flex',
    height: '36px',
    '& .MuiButtonBase-root:first-child': {
      clipPath: 'polygon(94% 0%, 100% 50%, 94% 100%, 0% 100%, 0% 50%, 0% 0%)',
      borderTopLeftRadius: '20px',
      borderBottomLeftRadius: '20px',
    },
    '& .MuiButtonBase-root:last-child': {
      clipPath: 'polygon(100% 0%, 100% 50%, 100% 100%, 0% 100%, 6% 50%, 0% 0%)',
      borderTopRightRadius: '20px',
      borderBottomRightRadius: '20px',
    },
  },
  stagesheader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    '& span.MuiButton-startIcon': {
      '& path': {
        stroke: '#146DFF',
      },
    },
  },
  stagesHeading: {
    '&.MuiTypography-root': {
      color: `${theme.palette.textPrimary}`,
      marginBottom: '0px',
    },
  },
  noPadding: {
    '&.MuiButtonBase-root': {
      padding: '0',
    },
  },
  stageModal: {
    borderRadius: '8px',
    maxWidth: '400px',
    margin: '0 auto',
    width: '100%',
    '& .MuiPaper-root.MuiPaper-elevation': {
      overflow: 'visible',
      minWidth: '500px',
    },
  },
  modalTopArea: {
    padding: '16px',
    borderBottom: '1px solid #E6E6E7',
  },
  modalHeading: {
    '&.MuiTypography-root': {
      color: `${theme.palette.textPrimary}`,
      fontSize: '20px',
      fontStyle: 'normal',
      fontWeight: '700',
      lineHeight: '20px',
    },
  },
  modalTextBody: {
    marginTop: '12px',
    marginBottom: '16px',
  },
  modalText: {
    '&.MuiTypography-root': {
      color: '#5B5B5F',
      fontSize: '12px',
      fontStyle: 'normal',
      fontWeight: '400',
      lineHeight: '18px',
    },
  },
  modalTextUpper: {
    '&.MuiTypography-root': {
      color: '#262527',
      fontSize: '12px',
      fontStyle: 'normal',
      fontWeight: '400',
      lineHeight: '18px',

      marginRight: '2px',
    },
  },
  modalTypoBox: {
    marginTop: '12px',
    marginBottom: '16px',
    display: 'flex',
    gap: '4px',
  },
  modalTextBlue: {
    '&.MuiTypography-root': {
      color: `${theme.palette.textBrand}`,
      fontSize: '14px',
      fontStyle: 'normal',
      fontWeight: '400',
      lineHeight: '18px',
      paddingLeft: '10px',
    },
  },
  inlineBoxIcons: {
    display: 'flex',
  },
  arrowIcons: {
    margin: '0px 12px',
    '& path': {
      stroke: '#000000',
    },
  },
  modalBottomArea: {
    padding: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: '12px',
    '& button.MuiButtonBase-root': {
      maxWidth: '112px',
      width: '100%',
    },
  },
  stageDropdwon: {
    marginTop: '16px',
  },
  spaceBelow: {
    '&.MuiTypography-root': {
      marginBottom: '8px',
    },
  },
  stagesStepperSkeletonWrapper: {
    display: 'flex',
    gap: 10,
    width: '100%',
  },
  barSkeleton: {
    '&.MuiSkeleton-root': {
      borderRadius: '8px !important',
    },
  },
}));
