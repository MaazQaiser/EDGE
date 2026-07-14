import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  zonesListingContainer: {
    display: 'flex',
    flexDirection: 'column',
    flex: '1',
    overflow: 'auto',
    paddingTop: '24px',
    paddingLeft: '32px',
    paddingRight: '32px',
    [theme.breakpoints.down('lg')]: {
      paddingLeft: '24px',
      paddingRight: '24px',
    },
    '& table': {
      '& th:nth-child(1), & td:nth-child(1)': {
        boxShadow: '1px 0px 2px -1px rgba(0, 0, 0, 0.12)',
      },
    },
  },

  searchSectionDashboard: {
    padding: '0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '24px',
    height: '36px',
  },

  searchSection: {
    display: 'flex',
    alignItems: 'center',
    height: '100%',
  },

  vehicleSection: {
    display: 'flex',
    gap: '12px',
    height: '100%',
  },

  addVehicle: {
    borderRadius: '8px',
    border: '1px solid #146dff',
    background: '#146dff',
    padding: '8px 14px',
    textAlign: 'center',
    alignItems: 'center',
    display: 'flex',
    color: 'white',
    fontSize: '14px',
    fontWeight: '500',
    lineHeight: '20px',
    textDecoration: 'none',
    textTransform: 'capitalize',
  },

  addIcon: {
    marginRight: '8px',
  },

  tableWrapper: {
    display: 'flex',
    flexDirection: 'column',
    flex: '1',
    overflow: 'auto',
  },

  supervisorColumnWrapper: {
    display: 'flex',
    flex: '1',
    alignItems: 'center',
  },

  tableImage: {
    marginRight: '8px',
  },

  ZonesTD: {
    cursor: 'pointer',
    '&:hover': {
      '& .MuiBox-root': {
        '& > :nth-child(2)': {
          '& svg': {
            visibility: 'visible !important',
          },
        },
      },
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

  franchiseName: {
    display: 'flex !important',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
}));
