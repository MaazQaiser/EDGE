import { makeStyles } from '@mui/styles';
export const useStyles = makeStyles((theme) => ({
  vehicleListingContainer: {
    padding: '24px 32px',
    display: 'flex',
    flexDirection: 'column',
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
    gap: '12px',
    marginBottom: '24px',
  },

  vehicleAvatarDefault: {
    '&.MuiAvatar-root': {
      '& .MuiAvatar-img': {
        objectFit: 'contain',
      },
    },
  },

  vehiclesCars: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    '& .MuiBox-root': {
      '& .MuiAvatarGroup-root': {
        justifyContent: 'center',
      },
    },
  },

  vehiclesHeader: {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'auto',
  },

  vehicleSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },

  addVehicle: {
    borderRadius: '8px',
    border: `1px solid ${theme.palette.borderBrand}`,
    backgroundColor: theme.palette.textBrand,
    padding: '8px 14px',
    textAlign: 'center',
    alignItems: 'center',
    display: 'flex',
    color: theme.palette.textOnColor,
    fontSize: '14px',
    fontWeight: '500',
    lineHeight: '20px',
    textDecoration: 'none',
    height: '36px',
    transition:
      'background-color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,box-shadow 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,border-color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',

    '&:hover': {
      backgroundColor: theme.palette.surfaceBrandHover,
      border: `1px solid ${theme.palette.borderBrandHover}`,
    },

    '&:active': {
      backgroundColor: theme.palette.surfaceBrand,
      border: `1px solid ${theme.palette.borderBrand}`,
      boxShadow: `0px 0px 0px 4px #E5F6FF, 0px 1px 2px 0px rgba(16, 24, 40, 0.05) `,
    },
  },

  tableWrapper: {
    display: 'flex',
    flexDirection: 'column',
    flex: '1',
    overflow: 'auto',
  },

  VehiclesTD: {
    cursor: 'pointer',
    boxShadow: '1px 0px 2px -1px rgba(0, 0, 0, 0.12)',
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
