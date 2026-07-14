import { makeStyles } from '@mui/styles';
export const useStyles = makeStyles((theme) => ({
  sitesListingCommonContainer: {
    display: 'flex',
    flexDirection: 'column',
    flex: '1',
    overflow: 'auto',
    padding: '0 32px',
    paddingBottom: '0',
    paddingTop: '24px',
    [theme.breakpoints.down('lg')]: {
      paddingLeft: '24px',
      paddingRight: '24px',
    },
  },

  searchSectionDashboard: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0',
    marginBottom: '24px',
  },

  searchSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    columnGap: '12px',
  },
  tableWrapper: {
    display: 'flex',
    flexDirection: 'column',
    flex: '1',
    overflow: 'auto',
  },
  tableavatar: {
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
  },

  reportsListingsHeaderRightDate: {
    width: '265px',
    '& .MuiBox-root ': {
      '& .MuiStack-root ': {
        '& .MuiFormControl-root ': {
          '& .MuiInputBase-root ': {
            minWidth: '265px',
            height: '36px',
          },
        },
      },
    },
  },
  shiftBoxes: {
    display: 'flex',
    gap: '12px',
    marginBottom: '20px',
    justifyContent: 'space-between',
  },
  innerShiftBox: {
    borderRadius: '8px',
    flex: '0 0 32.1%',
    background: theme.palette.surfaceGreySubtle,
    padding: '8px 12px',
  },
  shiftName: {
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary3,
    },
  },
  shiftValue: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
    },
  },
}));
