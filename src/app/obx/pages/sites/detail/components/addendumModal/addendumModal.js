import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  modalWrapper: {
    maxWidth: '992px',
    width: '100%',
    backgroundColor: theme.palette.surfaceGreySubtle,
    boxShadow: '0px 8px 8px -4px rgba(16, 24, 40, 0.04), 0px 20px 24px -4px rgba(16, 24, 40, 0.10)',
    position: 'absolute',
    left: '50%',
    top: '50%',
    padding: '0px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    borderRadius: '12px',
    overflow: 'hidden',
    transform: 'translate(-50%,-50%)',
    maxHeight: '90vh',
  },

  inlineButtons: {
    position: 'sticky',
    bottom: '0px',
    zIndex: 10,
    marginTop: 'auto',
    backgroundColor: theme.palette.surfaceWhite,
    width: '100%',
    display: 'flex',
    gap: '12px',
    padding: '16px 24px',
    borderTop: `1px solid ${theme.palette.borderSubtle1}`,
    justifyContent: 'flex-end',
    '& .MuiButtonBase-root': {
      height: '36px',
    },
  },
  closetext: {
    '&.MuiTypography-root': {
      marginTop: '4px',
      color: `${theme.palette.textSecondary3}`,
    },
  },
  headText: {
    '&.MuiTypography-root': {
      color: `${theme.palette.textPrimary}`,
    },
  },

  stepperWrapper: {
    display: 'grid',
    gridTemplateColumns: '292px 1fr',
  },
  stepperLeft: {
    borderRight: `1px solid ${theme.palette.divider}`,
    backgroundColor: theme.palette.surfaceGreySubtle,
    padding: '20px',
  },
  stepperHeader: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '2px',
    alignSelf: 'stretch',
    marginBottom: '32px',
  },
  stepperHeaderText: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
    },
  },
  stepperSubtext: {
    '&.MuiTypography-root': {
      color: theme.palette.textPlaceholder,
    },
  },
  stepperItem: {
    '&.MuiStep-root': {
      padding: '0px',
      '& .MuiStepLabel-root': {
        gap: '12px',
        alignItems: 'center',
        padding: '0px',
      },
    },
  },
  stepperLabel: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '4px',
  },
  stepperLabelText: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
    },
  },
  stepSubtext: {
    '&.MuiTypography-root': {
      color: theme.palette.textPlaceholder,
    },
  },
  stepIcon: {
    display: 'flex',
    width: '32px',
    height: '32px',
    padding: '8px',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: '100px',
    background: theme.palette.surfaceWhite,
    border: `1px solid ${theme.palette.surfaceBrand}`,
    '& svg': {
      minWidth: '16px',
      minHeight: '16px',
    },
    '&.completed': {
      // backgroundColor: theme.palette.success.main,
      // color: theme.palette.common.white,
      background: theme.palette.surfaceSuccessSubtle,
      border: `1px solid ${theme.palette.surfaceSuccessStrong}`,
    },
    '&.active': {
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.common.white,
      '& svg': {
        '& path': {
          stroke: theme.palette.surfaceWhite,
        },
      },
    },
  },

  stepperRight: {
    flex: 1,
    // padding: '20px 24px',
    backgroundColor: theme.palette.surfaceWhite,
    position: 'relative',
    maxHeight: '80vh',
    height: '80vh',
    overflow: 'auto',
    display: 'flex',
    flexDirection: 'column',
  },
  stepper: {
    '& .MuiStepConnector-line': {
      minHeight: '20px',
      borderLeft: `1px dashed ${theme.palette.borderStrong1}`,
    },
  },
}));
