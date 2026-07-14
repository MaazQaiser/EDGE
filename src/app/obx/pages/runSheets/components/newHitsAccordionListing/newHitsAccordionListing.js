import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  removeLeftBorder: {
    '& .MuiPaper-root.MuiAccordion-root': {
      '&:before': {
        borderLeft: `0px dashed ${theme.palette.borderBrand} !important`,
      },
    },
  },
  hitAccordionWrapperWithPils: {
    marginBottom: '24px !important',
    '& .MuiPaper-root.MuiAccordion-root': {
      '&:before': {
        backgroundColor: 'transparent',
      },
    },
    '&:not(:last-child)': {
      '& .MuiPaper-root.MuiAccordion-root': {
        '&:before': {
          content: '""',
          display: 'block',
          backgroundColor: 'transparent',
          borderLeft: `1px dashed ${theme.palette.borderBrand}`,
          width: '2px',
          height: '100%',
          left: '-21px',
          top: '34px',
          opacity: '1',
        },
      },
    },

    '&:last-child': {
      '& .MuiPaper-root.MuiAccordion-root': {
        '&:before': {
          content: '""',
          display: 'block',
          backgroundColor: 'transparent',
          borderLeft: `0px dashed ${theme.palette.borderBrand}`,
          width: '2px',
          height: '100%',
          left: '-21px',
          top: '35px',
          opacity: '1',
        },
      },
      '& .MuiPaper-root.MuiPaper-elevation.MuiAccordion-root.MuiAccordion-rounded.Mui-expanded': {
        '&:before': {
          content: '""',
          display: 'block',
          backgroundColor: 'transparent',
          borderLeft: `2px dashed ${theme.palette.borderBrand}`,
          width: '2px',
          height: 'calc(100% - 35px)',
          left: '-21px',
          top: '35px',
          opacity: '1',
        },
      },
    },
  },
  missedHitAccordionWrapperWithPils: {
    marginBottom: '24px !important',
    '& .MuiPaper-root.MuiAccordion-root': {
      '&:before': {
        backgroundColor: 'transparent',
      },
    },
    '&:not(:last-child)': {
      '& .MuiPaper-root.MuiAccordion-root': {
        '&:before': {
          content: '""',
          display: 'block',
          backgroundColor: 'transparent',
          borderLeft: `1px dashed red`,
          width: '2px',
          height: '100%',
          left: '-21px',
          top: '34px',
          opacity: '1',
        },
      },
    },

    '&:last-child': {
      '& .MuiPaper-root.MuiAccordion-root': {
        '&:before': {
          content: '""',
          display: 'block',
          backgroundColor: 'transparent',
          borderLeft: `0px dashed red`,
          width: '2px',
          height: '100%',
          left: '-21px',
          top: '35px',
          opacity: '1',
        },
      },
      '& .MuiPaper-root.MuiPaper-elevation.MuiAccordion-root.MuiAccordion-rounded.Mui-expanded': {
        '&:before': {
          content: '""',
          display: 'block',
          backgroundColor: 'transparent',
          borderLeft: `2px dashed red`,
          width: '2px',
          height: 'calc(100% - 35px)',
          left: '-21px',
          top: '35px',
          opacity: '1',
        },
      },
    },
  },
  dispatchedHitAccordionWrapperWithPils: {
    marginBottom: '24px !important',
    '& .MuiPaper-root.MuiAccordion-root': {
      '&:before': {
        backgroundColor: 'transparent',
      },
    },
    '&:not(:last-child)': {
      '& .MuiPaper-root.MuiAccordion-root': {
        '&:before': {
          content: '""',
          display: 'block',
          backgroundColor: 'transparent',
          borderLeft: `1px dashed purple`,
          width: '2px',
          height: '100%',
          left: '-23px',
          top: '34px',
          opacity: '1',
        },
      },
    },

    '&:last-child': {
      '& .MuiPaper-root.MuiAccordion-root': {
        '&:before': {
          content: '""',
          display: 'block',
          backgroundColor: 'transparent',
          borderLeft: `0px dashed purple`,
          width: '2px',
          height: '100%',
          left: '-23px',
          top: '35px',
          opacity: '1',
        },
      },
      '& .MuiPaper-root.MuiPaper-elevation.MuiAccordion-root.MuiAccordion-rounded.Mui-expanded': {
        '&:before': {
          content: '""',
          display: 'block',
          backgroundColor: 'transparent',
          borderLeft: `2px dashed purple`,
          width: '2px',
          height: 'calc(100% - 35px)',
          left: '-23px',
          top: '35px',
          opacity: '1',
        },
      },
    },
  },
  visitedHitAccordionWrapperWithPils: {
    marginBottom: '24px !important',
    '& .MuiPaper-root.MuiAccordion-root': {
      '&:before': {
        backgroundColor: 'transparent',
      },
    },
    '&:not(:last-child)': {
      '& .MuiPaper-root.MuiAccordion-root': {
        '&:before': {
          content: '""',
          display: 'block',
          backgroundColor: 'transparent',
          borderLeft: `1px dashed green`,
          width: '2px',
          height: '100%',
          left: '-21px',
          top: '34px',
          opacity: '1',
        },
      },
    },

    '&:last-child': {
      '& .MuiPaper-root.MuiAccordion-root': {
        '&:before': {
          content: '""',
          display: 'block',
          backgroundColor: 'transparent',
          borderLeft: `0px dashed green`,
          width: '2px',
          height: '100%',
          left: '-21px',
          top: '35px',
          opacity: '1',
        },
      },
      '& .MuiPaper-root.MuiPaper-elevation.MuiAccordion-root.MuiAccordion-rounded.Mui-expanded': {
        '&:before': {
          content: '""',
          display: 'block',
          backgroundColor: 'transparent',
          borderLeft: `2px dashed green`,
          width: '2px',
          height: 'calc(100% - 35px)',
          left: '-21px',
          top: '35px',
          opacity: '1',
        },
      },
    },
  },
  reAssignedHitAccordionWrapperWithPils: {
    marginBottom: '24px !important',
    '& .MuiPaper-root.MuiAccordion-root': {
      '&:before': {
        backgroundColor: 'transparent',
      },
    },
    '&:not(:last-child)': {
      '& .MuiPaper-root.MuiAccordion-root': {
        '&:before': {
          content: '""',
          display: 'block',
          backgroundColor: 'transparent',
          borderLeft: `1px dashed orange`,
          width: '2px',
          height: '100%',
          left: '-21px',
          top: '34px',
          opacity: '1',
        },
      },
    },

    '&:last-child': {
      '& .MuiPaper-root.MuiAccordion-root': {
        '&:before': {
          content: '""',
          display: 'block',
          backgroundColor: 'transparent',
          borderLeft: `0px dashed orange`,
          width: '2px',
          height: '100%',
          left: '-21px',
          top: '35px',
          opacity: '1',
        },
      },
      '& .MuiPaper-root.MuiPaper-elevation.MuiAccordion-root.MuiAccordion-rounded.Mui-expanded': {
        '&:before': {
          content: '""',
          display: 'block',
          backgroundColor: 'transparent',
          borderLeft: `2px dashed orange`,
          width: '2px',
          height: 'calc(100% - 35px)',
          left: '-21px',
          top: '35px',
          opacity: '1',
        },
      },
    },
  },
  cancelledHitAccordionWrapperWithPils: {
    marginBottom: '24px !important',
    '& .MuiPaper-root.MuiAccordion-root': {
      '&:before': {
        backgroundColor: 'transparent',
      },
    },
    '&:not(:last-child)': {
      '& .MuiPaper-root.MuiAccordion-root': {
        '&:before': {
          content: '""',
          display: 'block',
          backgroundColor: 'transparent',
          borderLeft: `1px dashed #a5a5a5`,
          width: '2px',
          height: '100%',
          left: '-21px',
          top: '34px',
          opacity: '1',
        },
      },
    },

    '&:last-child': {
      '& .MuiPaper-root.MuiAccordion-root': {
        '&:before': {
          content: '""',
          display: 'block',
          backgroundColor: 'transparent',
          borderLeft: `0px dashed #a5a5a5`,
          width: '2px',
          height: '100%',
          left: '-21px',
          top: '35px',
          opacity: '1',
        },
      },
      '& .MuiPaper-root.MuiPaper-elevation.MuiAccordion-root.MuiAccordion-rounded.Mui-expanded': {
        '&:before': {
          content: '""',
          display: 'block',
          backgroundColor: 'transparent',
          borderLeft: `2px dashed #a5a5a5`,
          width: '2px',
          height: 'calc(100% - 35px)',
          left: '-21px',
          top: '35px',
          opacity: '1',
        },
      },
    },
  },
  reportNotSubmittedHitAccordionWrapperWithPils: {
    marginBottom: '24px !important',
    '& .MuiPaper-root.MuiAccordion-root': {
      '&:before': {
        backgroundColor: 'transparent',
      },
    },
    '&:not(:last-child)': {
      '& .MuiPaper-root.MuiAccordion-root': {
        '&:before': {
          content: '""',
          display: 'block',
          backgroundColor: 'transparent',
          borderLeft: `1px dashed #FF8C00`,
          width: '2px',
          height: '100%',
          left: '-21px',
          top: '34px',
          opacity: '1',
        },
      },
    },

    '&:last-child': {
      '& .MuiPaper-root.MuiAccordion-root': {
        '&:before': {
          content: '""',
          display: 'block',
          backgroundColor: 'transparent',
          borderLeft: `0px dashed #FF8C00`,
          width: '2px',
          height: '100%',
          left: '-21px',
          top: '35px',
          opacity: '1',
        },
      },
      '& .MuiPaper-root.MuiPaper-elevation.MuiAccordion-root.MuiAccordion-rounded.Mui-expanded': {
        '&:before': {
          content: '""',
          display: 'block',
          backgroundColor: 'transparent',
          borderLeft: `2px dashed #FF8C00`,
          width: '2px',
          height: 'calc(100% - 35px)',
          left: '-21px',
          top: '35px',
          opacity: '1',
        },
      },
    },
  },
  accordianFlex: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  hitAccordionWrapper: {
    display: 'flex',
    alignItems: 'flex-start',
    marginTop: '16px',

    '& .MuiPaper-root.MuiAccordion-root': {
      backgroundColor: theme.palette.surfaceGreySubtle,
      borderRadius: '4px',
      border: `1px solid ${theme.palette.borderSubtle1}`,
      margin: '0 auto',
      width: '100%',
      '& .MuiAccordionSummary-root': {
        minHeight: '36px',
        paddingLeft: '12px',
        paddingRight: '12px',
        '& .MuiAccordionSummary-content': {
          margin: '5px 0px',
        },
      },
      '&.Mui-expanded:': {
        '&:before': {
          backgroundRepeat: 'repeat !important',
        },
      },
    },
  },
  checkBoxCustom: {
    '&.MuiCheckbox-root': {
      padding: '0',
    },

    '& svg': {
      width: '16px',
      height: '16px',
    },
  },
  iconButton: {
    '&.MuiButtonBase-root': {
      minWidth: 'auto',
      height: 'auto',
      padding: '0px',
    },
  },
  dragButton: {
    '&.MuiButtonBase-root': {
      marginRight: '10px',
      marginTop: '8px',
    },
  },
  dragBox: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
    width: '100%',
    '& .MuiAccordionDetails-root': {
      padding: '20px 24px',
    },
  },
  summeryAndChip: {
    display: 'flex',
    // alignItems: 'center',
    flex: '1 1',
    gap: '16px',
    rowGap: '0px',
    flexDirection: 'column',
  },
  summeryText: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    '& span.MuiButtonBase-root.MuiCheckbox-root.Mui-disabled': {
      '& rect': {
        stroke: '#7f7f7f17 !important',
      },
    },
  },
  summeryEditButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  editButton: {
    '&.MuiButtonBase-root': {
      marginRight: '15px',
      height: '32px',
    },
  },
  grayColor: {
    '&.MuiTypography-root': {
      color: theme.palette.textPlaceholder,
    },
  },
  pinDropBox: {
    position: 'relative',
    marginTop: '12px',
    '& .MuiTypography-root': {
      position: 'absolute',
      left: '50%',
      top: '34%',
      transform: 'translate(-50%, -50%)',
      fontWeight: 'bold',
      color: theme.palette.textOnColor,
      fontSize: 9,
    },
  },
  noFound: {
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'center',
  },
  dateOverLine: {
    '&.MuiTypography-root': {
      display: 'block',
    },
  },
  checkedBoxPadding: {
    '&.MuiTypography-root': {
      paddingLeft: '23px',
    },
  },
  noRecordFoundFromSearch: {
    display: 'flex',
    justifyContent: 'center',
    flexDirection: 'column',
    flex: '1',
    alignItems: 'center',
    overflow: 'auto',
  },
  newHitMain: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    overflow: 'auto',
  },
  newSiteHitWrap: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    // padding: '20px 32px',
    // overflow: 'auto',
    '& > .MuiPaper-root': {
      boxShadow: 'none',
      padding: '0',
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
        borderBottom: 'none',
        margin: '0',
      },

      '& .MuiCollapse-root': {
        '& .MuiAccordionDetails-root': {
          padding: '0',
        },
      },

      '& > .MuiAccordionSummary-root': {
        flexDirection: 'row-reverse',
        gap: '10px',
        minHeight: 'auto',
        padding: '8px 12px',
        width: '100%',
        borderBottom: `1px solid ${theme.palette.borderSubtle1}`,

        '&:hover': {
          backgroundColor: theme.palette.surfaceGreySubtle,
        },

        '& > .MuiAccordionSummary-expandIconWrapper': {
          width: '24px',
          height: '24px',
          borderRadius: '50%',
          backgroundColor: theme.palette.surfaceGreySubtle,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transform: 'rotate(180deg)',

          '&.Mui-expanded': {
            transform: 'rotate(0deg)',
          },
        },

        '& > .MuiAccordionSummary-content': {
          justifyContent: 'space-between',
          gap: '10px',
          margin: 0,
          alignItems: 'center',
          flex: '1',
        },
      },
    },

    // '& .MuiTableCell-root': {
    //   borderBottom: 0,
    // },
  },
}));
