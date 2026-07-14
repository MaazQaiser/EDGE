import { makeStyles } from '@mui/styles';
export const useStyles = makeStyles((theme) => ({
  dashboardsales: {
    flex: '1 1',
    display: 'flex',
    overflow: 'auto',
    flexDirection: 'column',
    '& .MuiGrid-root.MuiGrid-container': {
      display: 'flex',
      flex: '1 1',
      overflow: 'auto',
      flexDirection: 'row',
    },
  },
  dashboarMian: {
    display: 'flex',
    flex: '1 1',
    overflow: 'auto',
  },
  leftSec: {
    flex: '1 1 75%',
    overflow: 'auto',
  },
  mainclass: {
    display: 'flex',
    flex: '1 1',
    overflow: 'auto',
    flexDirection: 'column',
  },
  rightSec: {
    display: 'flex',

    overflow: 'auto',
    flexDirection: 'column',
    flex: '1 1 25%',

    backgroundColor: 'rgba(246, 246, 246, 0.60);',
    borderLeft: `1px solid ${theme.palette.borderSubtle1}`,
  },
  saleDashHeader: {
    margin: '24px 32px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    [theme.breakpoints.down('lg')]: {
      marginLeft: '24px',
      marginRight: '24px',
    },
  },
  lastSevenDays: {
    color: 'var(--Text-secondary-03, #86868B)',
    fontFamily: 'Inter',
    fontSize: '12px',
    fontStyle: 'normal',
    fontWeight: 500,
    lineHeight: '18px',
  },

  activeStatus: {
    color: '#2E964B',
    fontFamily: 'Inter',
    fontSize: ' 12px !important',
    fontStyle: 'normal',
    fontWeight: 400,
    lineHeight: '18px',
  },
  chartWrapper: {
    width: '100%',
    // height: '208px',
  },
  jobDetails: {
    display: 'flex',
    gap: '4px',
    alignItems: 'center',
  },
  timeIcon: {
    background: '#E6E6E7',
    borderRadius: '50%',
    height: '24px',
    width: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerWrapper: {
    display: 'flex',
    alignItems: 'flex-start',
    marginBottom: '27px',
    flexDirection: 'column',
  },
  headerBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  subTitle: {
    '&.MuiTypography-root': {
      marginTop: '3px',
      color: '#000',
      fontSize: '22px',
      fontStyle: 'normal',
      fontWeight: '700',
      lineHeight: '30px',
    },
  },

  chartFooters: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: '0 32px 32px 0px',
    [theme.breakpoints.down('lg')]: {
      padding: '0 24px 24px 24px',
    },
  },
  charLink: {
    bottom: '32px',
    right: '32px',
    zIndex: '999',
    alignItems: 'center',
    gap: '4px',
    display: 'flex',
    '&.MuiTypography-root': {
      fontFamily: 'Inter',
      fontSize: '14px',
      fontStyle: 'normal',
      fontWeight: 500,
      lineHeight: '20px',
      color: '#146DFF',
    },
  },
  tableLink: {
    '&.MuiTypography-root': {
      color: '#146DFF',
      display: 'flex',
      justifyContent: 'flex-end',
      alignItems: 'center',
      gap: '4px',
    },
  },
  borderTop: {
    borderTop: '1px solid #E6E6E7',
  },
  // mainWrapper: {
  //   display: 'flex',
  //   // alignItems: 'center',
  //   justifyContent: 'space-between',
  //   borderBottom: '1px solid #E6E6E7',
  //   borderTop: '1px solid #E6E6E7',
  // },
  // girdSection: {
  //   flex: '1 1',
  //   borderRight: '1px solid #E6E6E7',
  //   padding: '20px 15px 15px 15px',
  //   display: 'flex',
  //   flexDirection: 'column',
  //   justifyContent: 'space-between',
  //   alignSelf: 'stretch',
  // },
  // girdSectionIn: {
  //   justifyContent: 'start',
  // },

  // maxWidCol: {
  //   flexBasis: '20%',
  // },
  chartFooter: {
    '& a': {
      pointerEvents: 'none',
    },
  },
  skeletonLoaderWrapper: {
    padding: '16px',
    display: 'flex',
    flex: 1,
  },
  skeletonWrapperGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 40,
    marginTop: 16,
  },

  listLive: {
    display: 'flex',
    flexDirection: 'column',
    gap: '32px',
    justifyContent: 'space-between',
    flexShrink: '0',
  },
  metricListLive: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '32px',
    justifyContent: 'space-between',
  },
  gridBox: {
    display: 'flex',
    flex: '1 1',
    overflow: 'auto',
    flexDirection: 'column',
    padding: '24px ',
    [theme.breakpoints.down('lg')]: {
      padding: '24px',
    },
  },
  gridBoxs: {
    display: 'flex',
    flex: '1 1',
    overflow: 'auto',
    flexDirection: 'column',
    padding: '24px 0px',
    [theme.breakpoints.down('lg')]: {
      padding: '24px 0px',
    },
  },
  uperMian: {
    display: 'flex',
    flex: '1 1',
    overflow: 'auto',
    flexDirection: 'column',
    padding: '24px 24px 0px 24px',
    [theme.breakpoints.down('lg')]: {
      padding: '24px 24px 0px 24px',
    },
  },
  metricList: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '32px',
    justifyContent: 'space-between',
  },
  inventoryList: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    justifyContent: 'space-between',
    width: '100%',
    padding: '20px',
    borderBottom: '1px solid #E6E6E7',
  },
  leftListSide: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  rightListSide: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },

  topImageWrapper: {
    height: '32px',
    width: '32px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid #e6e6e7',
  },
  iconPadding: {
    padding: ' 0 8px',
  },
  officeImage: {
    width: '24px',
    height: '24px',
    objectFit: 'cover',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '2px solid #E6E6E7',
  },
  topImage: {
    width: '100%',
    height: '100%',
    borderRadius: '50%',
  },
  inventoryName: {
    '&.MuiTypography-root': {
      color: '#262527',
      whiteSpace: 'nowrap',
    },
  },
  inventoryTotal: {
    '&.MuiTypography-root': {
      color: '#86868B',
      whiteSpace: 'nowrap',
    },
  },
  ListItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  labelStyles: {
    '&.MuiTypography-root': {
      color: '#86868B',
      whiteSpace: 'nowrap',
      width: '230px',
      textTransform: 'capitalize',
      [theme.breakpoints.down('lg')]: {
        width: '170px',
      },
    },
  },

  valueStyles: {
    gap: '14px',
    display: 'flex',
    alignItems: 'flex-start',
    // whiteSpace: 'nowrap',
    '& .MuiTypography-root': {
      color: '#262527',
    },
  },
  salesFunnelChart: {
    padding: '32px 32px 0 32px',
    position: 'relative',
    [theme.breakpoints.down('lg')]: {
      padding: '24px 24px 0 24px',
    },
  },
  legendsLineChart: {
    display: 'flex',
    alignItems: 'center',
    gap: '32px',
    [theme.breakpoints.down('lg')]: {
      alignSelf: 'flex-end',
    },
  },

  legendLineChart: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },

  legendLineChartIndicator: {
    width: '10px',
    height: '10px',
    borderRadius: '2px',
  },

  legendPrimary: {
    backgroundColor: theme.palette.surfaceBrand,
  },
  legendWarning: {
    backgroundColor: '#F4780B',
  },

  legendLineChartText: {
    '&.MuiTypography-root': {
      fontSize: '12px',
      fontWeight: 500,
      lineHeight: '14px',
      color: theme.palette.textSecondary3,
    },
  },
  borderTopBottom: {
    borderTop: '1px solid #E6E6E7',
    borderBottom: '1px solid #E6E6E7',
  },
  borderRight: {
    borderRight: '1px solid #E6E6E7',
  },
  border: {
    borderRight: '1px solid #E6E6E7',
    borderBottom: '1px solid #E6E6E7',
    borderTop: '1px solid #E6E6E7',
    flex: '1 1 33%',
  },
  fullwidth: {
    flex: '1 1 100%',
    borderBottom: '1px solid #E6E6E7',
  },
  borderBottom: {
    borderBottom: '1px solid #E6E6E7',
    display: 'flex',
    flex: '1 1',
    overflow: 'auto',
  },
  borderBottoms: {
    borderBottom: '1px solid #E6E6E7',
    padding: '0px 24px 24px 24px',
  },
  hell: {
    display: 'flex',
    flexDirection: 'column',
    gap: '37px',
  },
  inventoaryListWrapper: {
    display: 'flex',
    flexDirection: 'column',
  },
  wonStatus: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '32px 32px 0px 32px',
    [theme.breakpoints.down('lg')]: {
      padding: '24px 24px 0 24px',
    },
  },
  popWrap: {
    '& .MuiPaper-root.MuiPaper-elevation.MuiPaper-rounded.MuiPopover-paper': {
      borderRadius: '8px',
    },
  },
  popButton: {
    '&.MuiButtonBase-root': {
      color: theme.palette.textSecondary2,
      '&:hover': {
        color: theme.palette.textSecondary2,
      },
    },
  },
  LiveOperationsTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    '&.MuiTypography-root': {
      fontFamily: 'Inter',
      fontSize: '14px',
      fontStyle: 'normal',
      fontWeight: 700,
      lineHeight: '20px' /* 142.857% */,
      color: '#262527' /* Converted color */,
    },
    paddingLeft: '16px',
    position: 'relative',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: '50%',
      left: 0,
      transform: 'translateY(-50%)',
      height: '6px',
      width: '6px',
      backgroundColor: '#E43F32',
      borderRadius: '50%',
    },
  },
  mainTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    '&.MuiTypography-root': {
      fontFamily: 'Inter',
      fontSize: '14px',
      fontStyle: 'normal',
      fontWeight: 700,
      lineHeight: '20px' /* 142.857% */,
      color: '#262527' /* Converted color */,
    },
  },
  textSmall: {
    '&.MuiTypography-root': {
      fontFamily: 'Inter',
      fontSize: '10px',
      fontStyle: 'normal',
      fontWeight: 500,
      lineHeight: '14px',
      color: '#5B5B5F',
    },
    position: 'absolute',
    top: '75px',
  },
  visitChartInfo: {
    position: 'relative',
  },
  chartSalesWrapper: {
    position: 'relative',
  },
  salesPersons: {
    '&.MuiTypography-root': {
      fontFamily: 'Inter',
      fontSize: '12px',
      fontStyle: 'normal',
      fontWeight: 500,
      lineHeight: '16px',
      color: '#262527',
    },
    position: 'absolute',
    top: '50%',
    transform: 'translate(50%, 50%) rotate(270deg)',
    left: '-60px',
  },
  dateInGreen: {
    '&.MuiTypography-root': {
      color: '#5CB85C',
      fontSize: '12px',
      fontStyle: 'normal',
      fontWeight: '400',
      lineHeight: '16px',
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
    },
    '& svg': {
      width: '16px',
      height: '16px',

      '& path': {
        stroke: '#5CB85C',
      },
    },
  },
  mapImg: {
    width: '100%',
    height: '250px',
  },
  chipWrapper: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '8px',
    marginBottom: '24px',
    justifyContent: 'space-between',
  },
  singleLinkWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    justifyContent: 'flex-end',
  },
  linkWrapper: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '8px',
    justifyContent: 'space-between',
    marginBottom: '8px',
  },
  salesCustomDropdown: {
    width: '265px',
    '& .MuiBox-root ': {
      '& .MuiStack-root ': {
        '& .MuiFormControl-root ': {
          '& .MuiInputBase-root ': {
            height: '36px',
            minWidth: '265px',
          },
        },
      },
    },
  },
  //job efficiency
  ProgressWrapper: {
    display: 'flex',
    // gap: '10px',
    flexDirection: 'column',
    marginBottom: '24px',
  },
  jobEfficiencyWrapper: {
    marginTop: '27px',
  },
  jobEfficiency: {
    display: 'flex',
    gap: '2px',
    alignItems: 'center',
    marginBottom: '10px',
  },
  pTitle: {
    '&.MuiTypography-root': {
      color: '#262527',
      textTransform: 'capitalize',
    },
  },
  jobCompletation: {
    '&.MuiTypography-root': {
      color: '#86868B',
      fontWeight: '500',
      fontSize: '14px',
      textTransform: 'capitalize',
    },
  },
  tours: {
    '&.MuiTypography-root': {
      color: '#146DFF',
      textTransform: 'capitalize',
    },
  },
  tooltipStyle: {
    '&.MuiTypography-root': {
      color: '#FFF',
      textTransform: 'capitalize',
    },
  },
  tootlipWrapper: {
    display: 'flex',
    flexDirection: 'column',
    '& .MuiTypography-root': {
      textTransform: 'unset',
    },
  },
  officerStatus: {
    display: 'block',
    '&.MuiTypography-root': {
      color: '#262527',
      textTransform: 'capitalize',
    },
    position: 'relative',
  },
  officerType: {
    display: 'flex',
    '&.MuiTypography-root': {
      color: '#444446',
      textTransform: 'capitalize',
    },
    position: 'relative',
  },
  jobPercent: {
    '&.MuiTypography-root': {
      color: '#5B5B5F',
      textTransform: 'capitalize',
    },
  },

  statesButtons: {
    height: '37px',
    borderRadius: '8px !important',
    padding: '1px',
    border: `1px solid ${theme.palette.borderSubtle1}`,
    '& button.MuiButtonBase-root': {
      border: '0px !important',
      padding: '4px 16px !important',
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
  dateTime: {
    '&.MuiTypography-root': {
      color: '#262527',
      textTransform: 'capitalize',
    },
  },
  //officers on duty
  officersScedule: {
    display: 'flex',
    gap: '2px',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  onDutyOfficer: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  profileContainer: {
    display: 'flex',
    gap: '8px',
    flexDirection: 'column',

    padding: '16px 0',
    borderBottom: '1px solid #E6E6E7',
  },
  box: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  linkStyle: {
    display: 'flex',
    alignItems: 'center',
    gap: '2px',
    cursor: 'pointer',
    fontWeight: '700',
  },
  //barchart legend
  statBox: {
    padding: '19px 24px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    '& h6.MuiTypography-root': {
      color: theme.palette.textSecondary3,
      textTransform: 'capitalize',
    },
    '& h5.MuiTypography-root': {
      color: theme.palette.textPrimary,
    },
  },
  headText: {
    '& span.MuiTypography-root': {
      color: theme.palette.textSecondary2,
    },
    '& h2.MuiTypography-root': {
      color: theme.palette.textPrimary,
    },
  },
}));
