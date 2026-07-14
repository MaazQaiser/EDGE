import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  hourFiled: {
    textAlign: 'center',
    '& .MuiInputBase-root.MuiOutlinedInput-root': {
      width: '85px',
      color: theme.palette.textSecondary3,
      minWidth: '70px',
      height: '32px',
      fontSize: '14px',
      padding: '8px 14px',
      '& .MuiInputBase-input': {
        textAlign: 'center',
        fontSize: '14px',
        color: theme.palette.textSecondary3,
      },
    },
  },
  startEndHoursFiled: {
    textAlign: 'center',
    '& .MuiInputBase-root.MuiOutlinedInput-root': {
      width: '85px',
      color: theme.palette.textSecondary3,
      minWidth: '170px',
      height: '32px',
      fontSize: '14px',
      padding: '8px 14px',
      '& .MuiInputBase-input': {
        textAlign: 'center',
        fontSize: '14px',
        color: theme.palette.textSecondary3,
      },
    },
  },

  singlePopoverBoxSpace: {
    display: 'flex',
    width: '100%',
    gap: '8px',
    '& .MuiBox-root ': {
      margin: '0',
      '& .MuiBox-root ': {
        '& .MuiStack-root': {
          '& .MuiInputBase-root': {
            minWidth: '165px',
          },
        },
      },
    },
  },
  singlePopoverWrapper: {
    '& .MuiPopover-paper': {
      width: '390px',
      borderRadius: '8px',
    },
  },
  centerBox: {
    textAlign: 'center',
  },
  popverWrapper: {
    '& .MuiPopover-paper': {
      width: '282px',
      BorderRight: '8px',
    },
  },
  popContent: {
    padding: '16px 16px 0px 16px',
  },
  boxSpace: {
    margin: '10px 0px',
  },
  popFooter: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: '10px',
    paddingTop: '10px',
    margin: '0px 16px 16px 16px',
    borderTop: `1px solid ${theme.palette.borderSubtle1}`,
  },
  checkbox: {
    marginTop: '10px',
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  title: {
    marginBottom: '10px',
  },
}));
