import { makeStyles } from '@mui/styles';
export const useStyles = makeStyles((theme) => ({
  mainWrapper: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    maxWidth: '640px',
    margin: '24px auto',
    gap: '16px',
    marginBottom: '84px',
  },
  invalidFeedback: {
    color: '#b32318',
    fontSize: '14px',
    fontWeight: '400',
    lineHeight: '20px',
    textAlign: 'left',
    marginTop: '6px',
    textTransform: 'lowercase',
    '&::first-letter': {
      textTransform: 'capitalize',
    },
  },
  footerWrapper: {
    position: 'fixed',
    height: '60px',
    bottom: '0',
    left: '0',
    right: '0',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '16px',
    width: '100%',
    padding: '12px 32px',
    borderTop: `1px solid ${theme.palette.borderSubtle1}`,
    background: theme.palette.surfaceWhite,
    zIndex: '10',
  },
  selectWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    alignSelf: 'stretch',
    width: '100%',
  },
  label: {
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary3,
    },
  },
  SelectGroup: {
    borderRadius: '8px',
    border: `1px solid ${theme.palette.borderSubtle1}`,
    background: theme.palette.surfaceWhite,
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flex: '1 0 0',
    height: 'unset',
  },
  chipsWrapper: {
    display: 'flex',
    flexDirection: 'row',
    gap: '8px',
    alignItems: 'center',
    justifyContent: 'flex-start',
    flexWrap: 'wrap',
    '& .MuiChip-root': {
      '& .MuiChip-deleteIcon': {
        margin: '0px',
      },
    },
  },
}));
