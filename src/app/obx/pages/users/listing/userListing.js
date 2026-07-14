import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  vehicleListingContainer: {
    display: 'flex',
    flexDirection: 'column;',
    flex: '1',
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

  searchSectionDashboard: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    margin: '24px 0',
    height: '36px',
  },

  searchSection: {
    display: 'flex',
    alignItems: 'center',
    height: '100%',
  },

  userSection: {
    display: 'flex',
    gap: '20px',
    height: '100%',
  },

  exportBtn: {
    display: 'flex',
  },

  filterBtnSection: {
    display: 'flex',
    alignItems: 'center',
    borderRadius: '8px',
    border: `1px solid ${theme.palette.borderSubtle1}`,
    background: theme.palette.textOnColor,
    padding: '8px 14px 8px 14px',
    boxSizing: 'border-box',
  },

  tableWrapper: {
    display: 'flex',
    flexDirection: 'column',
    flex: '1',
    overflow: 'auto',
  },

  ZonesTD: {
    '&td': {
      cursor: 'pointer',
    },
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
        stroke: theme.palette.textPlaceholder,
      },
    },
  },

  franchiseName: {
    display: 'flex !important',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  statesButtons: {
    marginRight: '14px',
    height: '37px',
    borderRadius: '8px !important',
    padding: '1px',
    border: `1px solid ${theme.palette.borderSubtle1}`,
    '& button.MuiButtonBase-root': {
      border: '0px !important',
      padding: '4px 16px !important',
      minWidth: '112px',
    },
    '& .Mui-selected': {
      borderRadius: '6px !important',
      backgroundColor: `${theme.palette.textBrand} !important`,
      color: 'white !important',
      '& .MuiBox-root': {
        borderRadius: '6px',

        background: `${theme.palette.surfaceBrandSubtle} !important`,
        color: `${theme.palette.textBrand} !important`,
      },
    },
  },

  mainWrapper: {
    display: 'flex',
    justifyContent: 'space-between',
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
    position: 'relative',
    maxHeight: '284px',
  },
}));
