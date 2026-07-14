import { makeStyles } from '@mui/styles';
export const useStyles = makeStyles((theme) => ({
  ZonesTD: {
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: '#f2f2f2 !important',
      '& .MuiBox-root': {
        '& > :nth-child(2)': {
          '& svg': {
            visibility: 'visible !important',
          },
        },
      },
    },
  },
  sitesListingContainer: {
    padding: '24px 32px 0px 32px',
  },
  actionBtns: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    justifyContent: 'flex-end',
  },
  notesCloseBtn: {
    '&.MuiButtonBase-root': {
      padding: '0px',
      height: 'auto',
      width: 'auto',
      minWidth: 'auto',
    },
    '& .MuiButton-icon': {
      margin: '0px',
    },
    '& svg': {
      height: '32px',
      width: '32px',
    },
  },
  btnAction: {
    '&.MuiButtonBase-root': {
      padding: '0px',
      height: '31px',
      width: '31px',
      minWidth: '31px',
    },
    '& .MuiButton-icon': {
      margin: '0px',
    },
    '& svg': {
      height: '16px',
      width: '16px',
    },
  },

  franchiseNameIcon: {
    width: '20px',
    height: '20px',
    '& svg': {
      visibility: 'hidden',
      width: '20px',
      height: '20px',
      '& path': {
        stroke: '#b3b3b3',
      },
    },
  },

  franchiseNameText: {
    '&.MuiBox-root': {
      color: theme.palette.textSecondary1,
      fontWeight: 500,
    },
  },

  franchiseName: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    justifyContent: 'space-between',
  },

  tableWrapper: {
    display: 'flex',
    flexDirection: 'column',
    flex: '1',
    overflow: 'auto',
  },
}));
