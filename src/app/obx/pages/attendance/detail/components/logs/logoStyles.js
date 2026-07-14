import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  sitesListingCommonContainer: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    overflow: 'auto',
    paddingBottom: 0,
  },
  searchSectionDashboard: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 0,
    paddingBottom: '24px',
    gap: '8px',
  },
  searchSection: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    gap: theme.spacing(1),
    columnGap: theme.spacing(1),
    padding: 0,
  },
  tableWrapper: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    overflow: 'auto',
  },
  reportsListingsHeaderRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  reportsListingsHeaderRightDate: {
    width: '140px',
    '& .MuiBox-root ': {
      '& .MuiStack-root ': {
        '& .MuiFormControl-root ': {
          '& .MuiInputBase-root ': {
            height: '36px',
            minWidth: '140px',
            fontSize: '14px',
            lineHeight: '20px',
            fontWeight: '500',
            color: theme.palette.textSecondary1,
            '&::placeholder': {
              fontSize: '12px !important',
            },
            '& .MuiInputBase-input ': {
              fontSize: '12px',
              lineHeight: '20px',
              fontWeight: '500',
              color: theme.palette.textSecondary1,
            },
          },
        },
      },
    },
  },
}));
