import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    overflow: 'auto',
    padding: '24px',
  },
  headerRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '24px',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    justifyContent: 'flex-end',
    '& .MuiInputBase-root': {
      maxHeight: '36px',
      height: '36px',
      width: '277px !important',
    },
  },

  stickyFirstCol: {
    '& table': {
      tableLayout: 'fixed',
    },
    '& table thead th, & table tbody td': {
      padding: '10px 24px !important',
    },
    '& table thead th:nth-of-type(1), & table tbody td:nth-of-type(1)': {
      position: 'sticky',
      left: 0,
      zIndex: 1,
      borderRight: `1px solid ${theme.palette.borderSubtle1}`,
      backgroundColor: theme.palette.background.paper,
      width: '60%',
    },
    '& table thead th:nth-of-type(2), & table tbody td:nth-of-type(2)': {
      width: '10%',
    },
    '& table thead th:nth-of-type(3), & table tbody td:nth-of-type(3)': {
      width: '15%',
    },
    '& table thead th:nth-of-type(4), & table tbody td:nth-of-type(4)': {
      width: '10%',
    },
    '& table thead th:nth-of-type(5), & table tbody td:nth-of-type(5)': {
      width: '5%',
    },
  },
  tableWrapper: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    overflow: 'auto',
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
  titleMessageCell: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    overflow: 'hidden',
  },
  titleText: {
    '&.MuiTypography-root': {
      fontWeight: 600,
      color: theme.palette.textPrimary,
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
  },
  messageText: {
    '&.MuiTypography-root': {
      color: theme.palette.textPlaceholder,
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
  },
  statusChip: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    '& span': {
      lineHeight: 1,
      '& svg': {
        lineHeight: 1,
      },
    },
  },
  createdByCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  createdByAvatar: {
    '&.MuiAvatar-root': {
      width: 24,
      height: 24,
      fontSize: 12,
    },
  },
  actionMenu: {
    '& .MuiPaper-root': {
      width: '160px',
      backgroundColor: theme.palette.surfaceWhite,
      padding: 0,
      border: `1px solid ${theme.palette.borderSubtle1}`,
      borderRadius: '8px',
    },
  },
  actionMenuItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 14px',
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: theme.palette.surfaceGreySubtle,
    },
    '& .MuiTypography-root': {
      color: theme.palette.textPlaceholder,
    },
  },
  actionMenuIcon: {
    '&.MuiSvgIcon-root': {
      width: '16px',
      height: '16px',
      '& path': {
        stroke: theme.palette.textPlaceholder,
      },
    },
  },
  actionMenuItemDelete: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 14px',
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: theme.palette.surfaceGreySubtle,
    },
    '& .MuiTypography-root': {
      color: '#DF372B',
    },
  },
  actionMenuIconDelete: {
    '&.MuiSvgIcon-root': {
      width: '16px',
      height: '16px',
      '& path': {
        stroke: '#DF372B',
      },
    },
  },
  sendIcon: {
    color: theme.palette.textBrand,
    '& .MuiTypography-root': {
      color: theme.palette.textBrand,
    },
  },
  sweetAlertConfirmBlueButton: {
    '&.swal2-confirm': {
      padding: '10px 16px !important',
      borderRadius: '8px !important',
      backgroundColor: `${theme.palette.primary.main} !important`,
      color: `${theme.palette.surfaceWhite} !important`,
      '&:hover': {
        backgroundColor: `${theme.palette.primary.dark} !important`,
      },
    },
  },
  deleteSweetAlertConfirmButton: {
    '&.swal2-confirm': {
      padding: '10px 16px !important',
      borderRadius: '8px !important',
      backgroundColor: `${theme.palette.error.main} !important`,
      color: `${theme.palette.surfaceWhite} !important`,
      '&:hover': {
        backgroundColor: `${theme.palette.error.dark} !important`,
      },
    },
  },
}));
