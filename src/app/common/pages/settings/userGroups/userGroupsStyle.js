import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  mainWrapper: {
    display: 'flex',
    flexDirection: 'column',
    flex: '1',
    overflow: 'auto',
    gap: '16px',
  },
  topWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: '16px',
  },
  topWrapperHO: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '16px',
  },
  topButtons: {
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: '8px',
  },
  buttonsBarWrapper: {
    display: 'flex',
    justifyContent: 'flex-start',
    gap: '12px',
    alignItems: 'center',
  },
  buttonsBar: {
    display: 'flex',
    gap: '12px',
  },
  tableWrapper: {
    display: 'flex',
    flexDirection: 'column',
    flex: '1',
    overflow: 'auto',
  },
  statesButtons: {
    display: 'flex',
    height: '36px',
    padding: '2px',
    justifyContent: 'center',
    alignItems: 'flex-start',
    gap: '0px',
    borderRadius: '8px',
    backgroundColor: theme.palette.surfaceWhite,
    border: `1px solid ${theme.palette.borderSubtle1}`,
    '& button.MuiButtonBase-root': {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      alignSelf: 'stretch',
      borderRadius: '6px',
      border: 'none',
      padding: '4px 16px',
      fontWeight: '500',
      fontSize: '14px',
      lineHeight: '20px',
      position: 'relative',
      color: `${theme.palette.textPlaceholder}`,
      '&.Mui-selected': {
        color: `${theme.palette.textOnColor}`,
        backgroundColor: `${theme.palette.surfaceBrand}`,
      },
    },
  },
}));
