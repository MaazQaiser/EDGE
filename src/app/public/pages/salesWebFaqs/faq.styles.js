import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  faqHeader: {
    maxWidth: '1280px',
    width: '100%',
    padding: '16px 24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '12px',
    margin: '0 auto',

    [theme.breakpoints.down('sm')]: {
      display: 'none',
    },
  },

  faqHero: {
    background: theme.palette.surfaceBrandSubtle,
  },

  faqHeroContent: {
    maxWidth: '899px',
    width: '100%',
    margin: '0 auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
    padding: '32px 24px',
    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column',
      padding: '24px 16px',
    },
  },

  faqDesc: {
    [theme.breakpoints.down('sm')]: {
      order: '2',
    },
  },

  faqImage: {
    display: 'block',
    width: '200px',
    height: '130px',
  },

  faq: {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'auto',
    height: '100dvh',
  },

  faqContentWrapper: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    overflow: 'auto',
  },

  tabPanelBox: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    overflow: 'auto',
    scrollbarGutter: 'stable both-edges',

    '&::-webkit-scrollbar': {
      width: '8px',
      height: '8px',
    },

    '&::-webkit-scrollbar-track': {
      boxShadow: 'none',
    },

    '&::-webkit-scrollbar-thumb': {
      backgroundColor: 'rgba(128, 128, 128, 0.4)',
      borderRadius: '10px',
    },

    '&:hover': {
      '&::-webkit-scrollbar-track': {
        boxShadow: 'inset 0 0 6px rgba(0, 0, 0, 0.3)',
      },

      '&::-webkit-scrollbar-thumb': {
        backgroundColor: 'grey',
      },
    },
  },

  faqTabPanel: {},

  faqContent: {
    maxWidth: '899px',
    width: '100%',
    padding: '16px 24px 24px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    overflow: 'auto',
    [theme.breakpoints.down('sm')]: {
      padding: '0 16px 24px',
    },
  },

  faqTitle: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
    },
    [theme.breakpoints.down('sm')]: {
      '&.MuiTypography-root': {
        textAlign: 'center',
        fontSize: '20px',
      },
    },
  },

  faqText: {
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary1,
      marginTop: '4px',
    },
    [theme.breakpoints.down('sm')]: {
      '&.MuiTypography-root': {
        textAlign: 'center',
      },
    },
  },

  faqAccordionTitle: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
    },
  },

  faqAccordionAnswerText: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
      display: 'flex',
      gap: '4px',
      marginBottom: '16px',
    },
  },

  underLineText: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
      textDecoration: 'underline',
    },
  },

  faqAccordionAnswerIndent: {
    '&.MuiTypography-root': {
      marginLeft: '10px',
    },
  },

  functionalDiv: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '16px',
    paddingTop: '8px',

    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
    '& [class*="MuiTab-root"]': {
      padding: '4px 6px !important',
      minWidth: 'unset',
      maxWidth: 'unset',
      fontWeight: 400,
      color: theme.palette.textPlaceholder,
      '&.Mui-selected': {
        color: theme.palette.textBrand,
        fontWeight: 500,
      },
    },
    '& .MuiTabs-indicator': {
      backgroundColor: theme.palette.surfaceBrand,
    },
  },

  tabContainer: {
    '& .MuiTabs-scroller': {
      '& .MuiTabs-flexContainer ': {
        gap: '16px',
      },
    },
    '& .MuiTabs-scrollButtons': {
      width: '32px',
      height: '32px',
      minWidth: '32px',
      borderRadius: '50%',
      padding: '0',
      margin: '0 8px',
      marginTop: '6.5px',
      '& svg': {
        width: '20px',
        height: '20px',
        '& path': {
          stroke: theme.palette.textPlaceholder,
        },
      },
    },
  },

  faqAccordion: {
    '& .MuiPaper-root': {
      boxShadow: 'none',
      padding: '0',
      borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
      margin: '0 !important',

      '&:last-child': {
        borderBottom: 0,
      },

      '&::before': {
        height: 0,
      },

      // '& .MuiButtonBase-root ': {
      //   padding: '0 !important',
      //   display: 'flex',
      //   flexDirection: 'row-reverse',
      //   gap: '8px',
      // },

      '&.MuiAccordion-rounded': {
        borderRadius: '0',
      },

      '&.Mui-expanded': {
        // borderBottom: 'none',
        margin: '0',
      },

      '& .MuiCollapse-root': {
        '& .MuiAccordionDetails-root': {
          padding: '0',
        },
      },

      '& .MuiAccordionSummary-root': {
        gap: '10px',
        minHeight: 'auto',
        padding: '16px 8px 16px 0',
        alignItems: 'baseline',

        '& .MuiAccordionSummary-expandIconWrapper': {
          width: '24px',
          height: '24px',
          borderRadius: '50%',
          backgroundColor: theme.palette.surfaceGreySubtle,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer !important',
          top: '2px',
          position: 'relative',
          transform: 'rotate(180deg)',

          '&.Mui-expanded': {
            transform: 'rotate(0deg)',
            backgroundColor: theme.palette.surfaceBrand,

            '& svg ': {
              '& g': {
                '& path': {
                  stroke: theme.palette.textOnColor,
                },
              },
            },
          },
        },

        '& .MuiAccordionSummary-content': {
          margin: 0,
          flexDirection: 'column',
          flex: '1',
        },
      },
    },
  },

  faqAccordionAnswer: {
    paddingRight: '16px',
    display: 'flex',
    flexDirection: 'column',
  },

  faqAccordionAnswerImage: {
    display: 'block',
    width: '80%',
    boxShadow: 'rgba(0, 0, 0, 0.16) 0px 1px 4px',
    borderRadius: '8px',
    [theme.breakpoints.down('sm')]: {
      width: '95%',
    },
  },

  listStyle: {
    listStyleType: 'lower-alpha',
    marginLeft: '60px',
    marginBottom: '16px',
    fontSize: '16px',
    fontWeight: '500',
    color: theme.palette.textPrimary,
    lineHeight: '20px',
    '& li': {
      marginBottom: '4px',
    },
  },

  numberList: {
    listStyleType: 'number',
    marginLeft: '40px',
    fontSize: '16px',
    fontWeight: '500',
    color: theme.palette.textPrimary,
    lineHeight: '20px',
    marginBottom: '16px',
    '& li': {
      marginBottom: '4px',
    },
  },

  doubleList: {
    marginTop: '16px',
    marginBottom: 0,
  },

  listImage: {
    marginTop: '16px',
  },

  faqMb: {
    marginBottom: '16px',
  },

  faqMt: {
    marginTop: '16px',
  },
}));
