import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  mainBoxForm: {
    maxWidth: '974px',
    width: '100%',
    margin: '0 auto',
    padding: '0 32px',
    paddingBottom: '24px',
    [theme.breakpoints.down('lg')]: {
      paddingLeft: '24px',
      paddingRight: '24px',
    },
  },

  buttonGroupUpper: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'space-between',
    paddingTop: '24px',
    paddingBottom: '16px',
  },

  buttonGroup: {
    display: 'flex',
    gap: '12px',
  },

  flexControl: {
    flex: '1',
  },

  flexControlSecond: {
    flex: '2',
  },

  mainFlexControl: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '24px',
  },

  buttonGroupLast: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end',
    paddingTop: '16px',
    paddingBottom: '24px',
  },

  zoneNameTitle: {
    paddingTop: '24px',
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
    },
  },

  zoneCustomText: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
    },
  },

  formBox: {
    display: 'flex',
    gap: '24px',
    padding: '20px 0',
  },

  formBoxGrid: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: '24px',
    paddingTop: '20px',
  },

  zoneDetailText: {
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary3,
    },
  },

  zonesDivider: {
    '&.MuiDivider-root': {
      borderColor: theme.palette.borderSubtle1,
    },
  },

  zonesCheckbox: {
    display: 'flex',
    alignItems: 'center',
    marginTop: '20px',
    gap: '8px',
    '&.MuiCheckbox-root': {
      padding: '0',
    },
  },

  checkboxLabelText: {
    cursor: 'pointer',
    '&.MuiFormLabel-root': {
      color: theme.palette.textPlaceholder,
      fontSize: '14px',
      marginBottom: '0px',
      fontWeight: '400',
      lineHeight: '20px',
    },
  },

  assignedSitesZones: {
    padding: '12px',
    border: `1px solid ${theme.palette.borderSubtle1}`,
    borderRadius: '8px',
  },

  assignedSiteZones: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '12px',
    padding: '16px 0',
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,

    '&:first-child': {
      paddingTop: 0,
    },

    '&:last-child': {
      borderBottom: 0,
      paddingBottom: 0,
    },
  },

  assignedSiteZonesLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flex: 1,
  },

  assignedSiteZonesLeftFlex: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },

  assignedSiteZoneName: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
    },
  },

  assignedSiteZoneNameType: {
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary3,
    },
  },

  assignedSitesZonesLabel: {
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary1,
      marginBottom: '12px',
    },
  },

  assignedSiteZonesImage: {
    display: 'block',
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    objectFit: 'cover',
  },

  zoneSitesDropDown: {
    height: '44px',
    '& .MuiTypography-root': {
      fontSize: '16px',
      fontWeight: '400',
    },
  },

  sitesSearch: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },

  invalidFeedback: {
    fontSize: 14,
    lineHeight: '20px',
    fontWeight: 400,
    margin: 0,
    marginTop: '6px',
    color: '#B32318',
    textShadow: '0px 0px 0px #F4EBFF, 0px 1px 2px rgba(16, 24, 40, 0.05)',
    '&::first-letter ': {
      textTransform: 'capitalize',
    },
  },

  questionBankAction: {
    '& .MuiButtonBase-root': {
      padding: '10px',
    },
  },

  unAssignedSitesZones: {
    marginTop: '12px',
  },

  questionBankActions: {
    '& .MuiPaper-root': {
      width: '162px',
      backgroundColor: theme.palette.surfaceWhite,
      padding: '4px 0',
      border: `1px solid ${theme.palette.borderSubtle1}`,
      borderRadius: '8px',
      boxShadow: `0px 4px 6px -2px rgba(16, 24, 40, 0.05), 0px 12px 16px -4px rgba(16, 24, 40, 0.10)`,
    },
  },

  questionBankActionsMenu: {
    display: 'flex',
    flexDirection: 'column',
  },

  questionBankActionsDelete: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 14px',
    cursor: 'pointer',

    '&:hover': {
      backgroundColor: theme.palette.surfaceAlertStrong,

      '& .MuiTypography-root': {
        color: theme.palette.textOnColor,
      },

      '& .MuiSvgIcon-root': {
        '& path': {
          stroke: theme.palette.textOnColor,
        },
      },
    },
  },

  questionBankActionsTextDelete: {
    '&.MuiTypography-root': {
      color: '#DF372B',
    },
  },

  questionBankActionsIconDelete: {
    '&.MuiSvgIcon-root': {
      width: '16px',
      height: '16px',
      '& path': {
        stroke: '#DF372B',
      },
    },
  },

  questionBankActionsRegular: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 14px',
    cursor: 'pointer',

    '&:hover': {
      backgroundColor: theme.palette.surfaceGreySubtle,
    },
  },

  questionBankActionsTextRegular: {
    '&.MuiTypography-root': {
      color: theme.palette.textPlaceholder,
    },
  },

  questionBankActionsIconRegular: {
    '&.MuiSvgIcon-root': {
      width: '20px',
      height: '20px',
      '& path': {
        stroke: theme.palette.textPlaceholder,
      },
    },
  },

  banModalBody: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%,-50%)',
    width: '600px',
    padding: '24px',
    borderRadius: '8px',
    backgroundColor: theme.palette.surfaceWhite,
  },

  banModalBodyTitle: {
    '&.MuiTypography-root': {
      marginTop: '20px',
      color: theme.palette.textPrimary,
    },
  },

  banModalBodyText: {
    '&.MuiTypography-root': {
      marginTop: '8px',
      color: theme.palette.textPlaceholder,
    },
  },

  banModalBodyField: {
    marginTop: '20px',
  },

  banModalBodyActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: '12px',
    marginTop: '32px',
  },

  closeBtn: {
    '&.MuiButtonBase-root': {
      minWidth: 'fit-content',
      padding: '10px',

      '&:hover': {
        background: 'transparent',
      },
    },
  },
}));
