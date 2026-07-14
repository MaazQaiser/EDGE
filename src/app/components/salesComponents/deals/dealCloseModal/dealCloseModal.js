import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  modalWrapper: {
    maxWidth: '796px',
    width: '100%',
    backgroundColor: `${theme.palette.surfaceWhite}`,
    boxShadow: '0px 8px 8px -4px rgba(16, 24, 40, 0.04), 0px 20px 24px -4px rgba(16, 24, 40, 0.10)',
    position: 'absolute',
    left: '50%',
    top: '50%',
    padding: '24px 32px',
    borderRadius: '12px',
    transform: 'translate(-50%,-50%)',
    '& .MuiSvgIcon-root': {
      width: '60px',
      height: '60px',
      marginLeft: '-5px',
    },
  },
  stageDropdwon: {
    marginTop: '10px',
  },
  spaceBelow: {
    '&.MuiTypography-root': {
      marginBottom: '8px',
    },
  },
  inlineButtons: {
    display: 'flex',
    gap: '12px',
    marginTop: '28px',
    '& .MuiButtonBase-root': {
      width: '100%',
      height: '40px',
    },
  },
  closetext: {
    '&.MuiTypography-root': {
      color: `${theme.palette.textPlaceholder}`,
    },
  },
  radioOption: {
    '&.MuiFormControl-root': {
      width: '100%',
    },
    '& .MuiSvgIcon-root': {
      width: '16px',
      height: '16px',
      marginLeft: '0px',
    },
    '& .MuiFormControlLabel-root': {
      marginRight: '30%',
    },
  },
  sidefooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '20px',
    borderTop: `1px solid ${theme.palette.borderSubtle1}`,
    marginTop: '20px',
  },
  footerText: {
    display: 'flex',
    alignItems: 'center',
  },
  footerTextBelow: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '5px',
  },
  footerButtons: {
    display: 'flex',
    gap: '12px',
  },
  alterIcon: {
    width: '16px',
    height: '16px',
    marginRight: '5px',
  },
  alterIconRed: {
    paddingTop: '4px',
  },
  bulkSubHeading: {
    '&.MuiTypography-root': {
      color: '#6a6a70',
      fontSize: '14px',
      fontStyle: 'normal',
      fontWeight: '400',
      lineHeight: '20px',
    },
  },
  closeLost: {
    '& path': {
      stroke: `${theme.palette.textAlert}`,
    },
    '& .MuiTypography-root': {
      color: `${theme.palette.textAlert}`,
      maxWidth: '75%',
    },
  },
}));
