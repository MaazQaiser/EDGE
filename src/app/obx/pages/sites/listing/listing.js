import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  sitesListingContainer: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    overflow: 'auto',
    padding: '0 32px',
    '& table': {
      '& th:nth-child(1), & td:nth-child(1)': {
        boxShadow: '1px 0px 2px -1px rgba(0, 0, 0, 0.12)',
      },
    },
    [theme.breakpoints.down('lg')]: {
      paddingLeft: '24px',
      paddingRight: '24px',
    },
  },

  tableComponent: {
    position: 'relative',
    '& th:nth-child(2), & td:nth-child(2)': {
      position: 'sticky',
      left: '150px',
      zIndex: 1,
      backgroundColor: theme.palette.surfaceWhite,
    },
  },
  searchSectionDashboard: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 0,
  },

  tableWrapper: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    overflow: 'auto',
  },

  searchSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    margin: '24px 0',
  },

  SitesTD: {
    paddingRight: '10px !important',
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
  franchiseNameText: {
    width: '250px',
    whiteSpace: 'nowrap',
    // overflow: 'hidden',
    // textOverflow: 'ellipsis',
  },
  sitesRangePicker: {
    '& .MuiStack-root': {
      '& .MuiFormControl-root': {
        '& .MuiInputBase-root ': {
          height: '36px',
          fontSize: '14px',
          lineHeight: '20px',
          '&::placeholder': {
            fontSize: '14px !important',
          },
          '& .MuiInputBase-input ': {
            fontSize: '14px',
            lineHeight: '20px',
          },
        },
      },
    },
  },
  graphHide: {
    display: 'flex',
    maxHeight: 0,
    overflow: 'hidden',
    transition: 'max-height 0.3s ease-in-out',
  },

  graphExpandBtn: {
    '&.MuiButtonBase-root': {
      position: 'fixed',
      left: '52%',
      transform: 'translateX(-50%) rotate(-180deg)',
      top: '46px',
      minWidth: '28px',
      width: '28px',
      height: '28px',
      borderRadius: '50%',
      zIndex: '100',
      padding: '0',
    },
  },

  graphCollapseBtn: {
    '&.MuiButtonBase-root': {
      position: 'absolute',
      left: '50%',
      transform: 'translateX(-50%)',
      bottom: '-14px',
      minWidth: '28px',
      width: '28px',
      height: '28px',
      borderRadius: '50%',
      padding: '0',
    },
  },

  mainWrapper: {
    display: 'flex',
    justifyContent: 'space-between',
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
    position: 'relative',
    maxHeight: '284px',
  },
  rightButtons: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  addVehicle: {
    cursor: 'pointer',
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
    gap: '4px',
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
}));
