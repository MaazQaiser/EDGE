import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  vehicleListingContainer: {
    display: 'flex',
    flexDirection: 'column;',
    flex: '1',
    overflow: 'auto',

    [theme.breakpoints.down('lg')]: {
      paddingLeft: '24px',
      paddingRight: '24px',
    },
  },

  searchSectionDashboard: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    margin: '20px 0',
    height: '36px',
  },
  daysColumn: {
    whiteSpace: 'pre-line',
    textAlign: 'center !important',
  },
  tableWrapper: {
    display: 'flex',
    flexDirection: 'column',
    flex: '1',
    overflow: 'auto',
    '& td.MuiTableCell-root , th.MuiTableCell-root': {
      textAlign: 'center',
      '&:not(:last-child)': {
        borderRight: `1px solid ${theme.palette.borderSubtle1}`,
      },
    },
    '& table': {
      position: 'relative', // Ensure table has relative positioning for sticky context

      '& th, & td': {
        background: theme.palette.background.paper, // Optional: Prevent content from overlapping under sticky columns
      },
      '& th:nth-last-child(1), & td:nth-last-child(1)': {
        position: 'sticky',
        right: 0,
        maxWidth: '130px',
        minWidth: '130px',
        zIndex: 22,
        background: theme.palette.background.paper,
        fontWeight: '700 !important',
        color: `${theme.palette.textSecondary1} !important`,
        whiteSpace: 'break-spaces',
        boxShadow: '-2px 0 4px rgba(0, 0, 0, 0.05)',
      },
      '& th:nth-last-child(2), & td:nth-last-child(2)': {
        position: 'sticky',
        maxWidth: '130px',
        minWidth: '130px',
        right: '130px', // Adjust to match column width
        zIndex: 21,
        background: theme.palette.background.paper,
        fontWeight: '700 !important',
        color: `${theme.palette.textSecondary1} !important`,
        whiteSpace: 'break-spaces',

        boxShadow: '-2px 0 4px rgba(0, 0, 0, 0.05)',
      },
      '& th:nth-last-child(3), & td:nth-last-child(3)': {
        position: 'sticky !important',
        minWidth: '130px',
        maxWidth: '130px',
        right: '260px', // Adjust to match column width
        zIndex: 20,
        background: theme.palette.background.paper,
        fontWeight: '700 !important',
        color: `${theme.palette.textSecondary1} !important`,
        whiteSpace: 'normal',

        boxShadow: '-2px 0 4px rgba(0, 0, 0, 0.05)',
      },
      '& th': {
        ' &:nth-last-child(1)': {
          textAlign: 'left !important',
          position: 'sticky',
          right: 0,
          zIndex: 40,
        },
        ' &:nth-last-child(2)': {
          textAlign: 'left !important',
          position: 'sticky',
          right: '130px',
          zIndex: 40,
        },
        ' &:nth-last-child(3)': {
          textAlign: 'left !important',
          position: 'sticky',
          right: '260px',
          zIndex: 40,
        },
        '&:nth-last-child(1)': {
          minWidth: '130px',
          maxWidth: '130px',
          fontWeight: '700!important',
          textAlign: 'left',
          color: `${theme.palette.textSecondary1}!important`,
          boxShadow: 'none',
        },

        '&:nth-child(1)': {
          minWidth: '300px',
          maxWidth: '300px',
          fontWeight: '700 !important',
          textAlign: 'left',
          color: `${theme.palette.textSecondary1} !important`,
          boxShadow: 'none',
        },
      },

      '& td:nth-child(1)': {
        minWidth: '300px',
        maxWidth: '300px',
        boxShadow: 'none',
        fontWeight: '500 !important',
      },

      '& tr:nth-child(1) td': {
        whiteSpace: 'normal',
        wordBreak: 'break-word',
      },

      '& tr:not(:first-child) td': {
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      },

      '& tr:last-child': {
        '& td': {
          '&:nth-last-child(1)': {
            backgroundColor: '#ffffff !important',
          },
          '&:nth-last-child(2)': {
            backgroundColor: '#ffffff !important',
          },
          '&:nth-last-child(3)': {
            backgroundColor: '#ffffff !important',
          },
          fontWeight: '700 !important',
          color: `${theme.palette.textSecondary1} !important`,
        },
      },
      '& tr:nth-child(odd)': {
        '& td': {
          backgroundColor: `${theme.palette.surfaceGreySubtle} !important`,
        },
      },
      '& th:nth-child(odd)': {
        '& td': {
          backgroundColor: `${theme.palette.surfaceGreySubtle} !important`,
        },
      },
    },
  },

  userName: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    '& .MuiAvatar-root': {
      width: '24px',
      height: '24px',
    },
  },
}));
