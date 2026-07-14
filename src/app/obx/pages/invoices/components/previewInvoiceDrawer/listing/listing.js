import { makeStyles } from '@mui/styles';
export const useStyles = makeStyles((theme) => ({
  notesCloseBtn: {
    '&.MuiButtonBase-root': {
      padding: '0px',
      height: 'auto',
      width: 'auto',
      minWidth: 'auto',
      margin: '0 auto',
    },
    '& .MuiButton-icon': {
      margin: '0px',
    },
    '& svg': {
      height: '12px',
      width: '13px',
    },
  },
  locationListing: {
    display: 'flex',
    flexDirection: 'column',
    flex: '1 1',
    overflow: 'auto',
    '& td.MuiTableCell-root , & th.MuiTableCell-root': {
      height: '40px !important',
      '&:not(:first-child)': {
        textAlign: 'center',
      },
    },
    '& th.MuiTableCell-root': {
      backgroundColor: `${theme.palette.surfaceGreyLight} !important`,
    },
  },
  scoutingWrapper: {
    display: 'flex',
    flexDirection: 'column',
    flex: '1 1',
    overflow: 'auto',
  },
}));
