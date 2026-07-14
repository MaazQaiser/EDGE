import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  modalWrapper: {
    width: '343px',
    backgroundColor: `${theme.palette.surfaceWhite}`,
    boxShadow: '0px 8px 8px -4px rgba(16, 24, 40, 0.04), 0px 20px 24px -4px rgba(16, 24, 40, 0.10)',
    padding: '2px',
    display: 'flex',
    flexDirection: 'column',
    borderRadius: '8px',
    '& .MuiSvgIcon-root': {
      width: '60px',
      height: '60px',
      marginLeft: '-5px',
    },
  },

  textWrap: {
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
    paddingBottom: '12px',
    marginBottom: '12px',
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
  payrollTabButtonTop: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative',
    '&::before': {
      content: '""',
      position: 'absolute',
      left: 0,
      bottom: '0',
      width: '75%',
      height: '1px',
      borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
    },
  },
  offierLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  inlineValue: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    '& .MuiTypography-root': {
      color: theme.palette.textSecondary1,
    },
    '& .MuiAvatar-root': {
      width: '16px',
      height: '16px',
    },
  },
  chipAndText: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '4px',
  },
  jobGrayBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px',
    background: theme.palette.surfaceGreySubtle,
    borderRadius: '4px',
    marginBottom: '8px',
  },
  jobCheckbox: {
    '& .MuiTypography-root': {
      fontSize: '14px',
    },
    '& label.MuiFormControlLabel-root': {
      margin: '0px',
    },
  },
  offierImage: {
    flex: '0 0 40px',
  },
  jobDetails: {
    flex: '1 1 auto',
  },
  progressBar: {
    margin: '16px 0px 12px 0px',
  },
  progressBarBottom: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconText: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
}));
