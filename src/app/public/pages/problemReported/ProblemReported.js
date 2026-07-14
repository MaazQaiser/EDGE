import { makeStyles } from '@mui/styles';
export const useStyles = makeStyles((theme) => ({
  pageWidth: {
    maxWidth: '1280px',
    margin: '0 auto',
    width: '100%',
    paddingLeft: '24px',
    paddingRight: '24px',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'auto',
    flex: 1,
  },
  userName: {
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary1,
      textTransform: 'capitalize',
    },
  },
  BannerWidth: {
    maxWidth: '899px',
    width: '100%',
    margin: '0 auto',
  },
  ProblemBanner: {
    padding: '32px 24px',
    background: theme.palette.surfaceBrandSubtle,
  },
  primaryColor: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
    },
  },
  subHeading: {
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary1,
      marginTop: '4px',
    },
  },
  flexContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  filterBar: {
    padding: '16px 0',
  },
  DateRangePickerClass: {
    '& .MuiInputBase-root': {
      height: '36px',
      minWidth: '260px',
    },
    '& .MuiInputBase-input': {
      fontSize: '14px',
      lineHeight: '20px',
    },
  },
  locationTD: {
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: `${theme.palette.surfaceGreySubtle} !important`,
      '& .MuiBox-root': {
        '& > :nth-child(2)': {
          '& svg': {
            visibility: 'visible !important',
          },
        },
      },
    },
  },
  locationName: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  locationNameIcon: {
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
  inlineFlex: {
    display: 'flex',
    flexDirection: 'column',
  },
  headText: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
    },
  },
  subText: {
    '&.MuiTypography-root': {
      color: theme.palette.textPlaceholder,
    },
  },
  orangeColor: {
    color: '#DC6803',
    background: '#FEF0C7',
  },
  greenColor: {
    background: '#EFF8EF',
    color: '#027A48',
  },
  alertColor: {
    color: theme.palette.surfaceAlertHover,
    background: theme.palette.surfaceAlertSubtle,
  },
  brandColor: {
    color: theme.palette.textBrand,
    background: theme.palette.surfaceBrandSubtle,
  },
  nurturingColor: {
    color: '#a142f5',
    background: '#f6ecfe',
  },
  otherStageColor: {
    background: '#fafafa',
  },
  commonStatusColor: {
    textAlign: 'center',
    fontSize: '12px',
    fontStyle: 'normal',
    fontWeight: '500',
    lineHeight: '18px',
    borderRadius: '16px',
    display: 'inline-flex',
    justifyContent: 'flex-start',
    width: 'fit-content',
    padding: '4px 12px',
  },

  disbaleEmail: {
    display: 'flex',
    color: theme.palette.textSecondary3,
    alignItems: 'center',
    gap: '4px',
    fontSize: '14px',
    fontWeight: '500',

    '& svg': {
      width: '16px',
      height: '16px',
    },
  },

  sendEmail: {
    '&.MuiButtonBase-root': {
      padding: '0px',

      '& .MuiButton-startIcon': {
        marginLeft: 0,
        marginRight: '4px',
        '& svg': {
          width: '16px',
          height: '16px',
        },
      },
    },
  },

  sendEmailDisabled: {
    '&.MuiButtonBase-root': {
      padding: '0px',
      color: theme.palette.textBrandDisabled,
      pointerEvents: 'none',
      cursor: 'not-allowed',
      '&:hover': {
        color: theme.palette.textBrandDisabled,
      },
      '& .MuiButton-startIcon': {
        '& svg': {
          '& path': {
            stroke: theme.palette.textBrandDisabled,
          },
        },
      },
    },
  },

  leftContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },

  reportProblem: {
    height: '100dvh',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'auto',
  },

  mainWrapper: {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'auto',
    flex: 1,
  },

  faqImage: {
    display: 'block',
    width: '200px',
    height: '130px',
    filter: 'drop-shadow(0px 4px 14px rgba(0, 0, 0, 0.10))',
  },

  tableWrapper: {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'auto',
    flex: 1,
  },
}));
