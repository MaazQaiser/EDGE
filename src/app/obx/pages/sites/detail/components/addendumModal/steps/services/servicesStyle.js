import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  header: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    position: 'sticky',
    top: 0,
    zIndex: 10,
    backgroundColor: theme.palette.surfaceWhite,
    padding: '20px 24px',
  },
  servicesContent: {
    padding: '0px 24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    '& .MuiAccordionDetails-root ': {
      padding: '0',
      gap: '0',
    },
  },
  servicesCommonWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    width: '100%',
    padding: '0px 24px',
  },
  titleContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  title: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
    },
  },
  subTitle: {
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary,
    },
  },
  servicesContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    paddingBottom: '24px',
  },
  serviceHeader: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    width: '100%',
  },
  serviceHeaderTitle: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
    },
  },
  serviceShiftLabel: {
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary3,
    },
  },
  serviceShiftCount: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
    },
  },
  serviceHeaderTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  serviceHeaderRight: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
  },
  serviceShiftContainer: {
    display: 'flex',
    height: '20px',
    alignItems: 'center',
    gap: '12px',
  },
  serviceShift: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  serviceContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    width: '100%',
  },
  serviceItem: {
    display: 'flex',
    padding: '12px',
    alignItems: 'start',
    justifyContent: 'space-between',
    gap: '16px',
    alignSelf: 'stretch',
    borderRadius: '8px',
    background: theme.palette.surfaceGreySubtle,
    width: '100%',
  },
  serviceItemLeft: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    flex: 1,
    '&:not(:last-child)': {
      marginBottom: '12px',
      paddingBottom: '12px',
      borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
    },
  },
  serviceItemShiftName: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
    },
  },
  serviceItemUserDetailWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  serviceItemUser: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  serviceItemUserAvatar: {
    width: '16px',
    height: '16px',
    borderRadius: '50%',
    overflow: 'hidden',
  },
  serviceItemUserDetail: {
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary1,
    },
  },
  serviceItemLeftWrapper: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
  },
  serviceBody: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    padding: '12px',
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
  },

  // addendum service charges
  addendumServiceChargesWrapper: {
    borderRadius: '12px',
    background: '#FAFAFA',
    padding: '16px',
    height: '421px',
    overflow: 'auto',
  },
  serviceTagline: {
    paddingBottom: '16px',
    borderBottom: '1px solid #E6E6E7',
    '&.MuiTypography-root': {
      color: theme.palette.textPlaceholder,
    },
  },
  serviceTitle: {
    marginBottom: '16px',
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
    },
  },
  servicesubTitle: {
    '&.MuiTypography-root': {
      color: '#3C3C3D',
      fontWeight: '500 !important',
    },
  },

  serviceName: {
    width: '84px',
    '&.MuiTypography-root': {
      color: '#3C3C3D',
      fontWeight: '400 !important',
    },
  },
  serviceNamePayment: {
    width: '145px',
    '&.MuiTypography-root': {
      color: '#3C3C3D',
      fontWeight: '400 !important',
    },
  },
  serviceListItem: {
    display: 'grid',
    gridTemplateColumns: '150px 1fr',
    gap: '8px',
  },
  valueBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  minValue: {
    '&.MuiTypography-root': {
      color: '#3C3C3D',
      borderRadius: '2px',
      background: '  #FFEED4',
      textTransform: 'capitalize',
      padding: '2px 12px',
    },
  },
  minValueLine: {
    '&.MuiTypography-root': {
      textDecoration: 'line-through',
    },
  },
  maxValue: {
    '&.MuiTypography-root': {
      textTransform: 'capitalize',
      color: '#3C3C3D',
      borderRadius: '2px',
      background: '  #E5F6FF',
      padding: '2px 12px',
    },
  },
  serviceContentWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    padding: '12px',
    borderRadius: '8px',
    background: theme.palette.surfaceGreySubtle,
  },
  serviceAddItemTitleWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  serviceAddItemTitle: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
    },
  },
  serviceAddItemContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  serviceAddItemContentTitle: {
    '&.MuiTypography-root': {
      color: theme.palette.textPlaceholder,
    },
  },
  dedicatedServiceWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  dedicatedServiceInstructions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    '& svg': {
      minWidth: '16px',
      minHeight: '16px',
      alignSelf: 'flex-start',
    },
  },
  serviceListItemLabel: {
    '&.MuiTypography-root': {
      color: theme.palette.textPlaceholder,
    },
  },
  serviceInstructionsContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    gridColumn: 'span 3 / span 3',
  },

  twoBox: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: '5px',
  },

  invalidFeedback: {
    fontSize: 14,
    lineHeight: '20px',
    fontWeight: 400,
    margin: 0,
    color: '#B32318',
    textShadow: '0px 0px 0px #F4EBFF, 0px 1px 2px rgba(16, 24, 40, 0.05)',
    '&::first-letter ': {
      textTransform: 'capitalize',
    },
  },
  bg: {
    padding: '12px',
    borderRadius: '8px',
    background: '#fff',
  },
  services: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  servicesName: {
    '&.MuiTypography-root': {
      paddingBottom: '8px',
      marginBottom: '12px',
      borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
    },
  },
  column: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' },
}));
