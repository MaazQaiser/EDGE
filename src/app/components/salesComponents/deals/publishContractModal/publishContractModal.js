import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  errorMessage: {
    '&.MuiTypography-root': {
      color: theme.palette.textAlert,
      boxShadow: 'none',
      fontSize: '14px',
      lineHeight: '20px',
      fontWeight: '400',
      margin: '0',
      marginTop: '6px',
      textShadow: '0px 0px 0px #f4ebff, 0px 1px 2px rgba(16, 24, 40, 0.05)',
    },
  },
  boxHeader: {
    margin: '0px 0px 16px 0px',
    '& .MuiSvgIcon-root': {
      width: '50px',
      height: '50px',
      marginBottom: '8px',
    },
  },
  titlehead: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sidetitle: {
    textAlign: 'left',
    color: '#102818',
    marginBottom: '0',
  },
  bulkSubHeading: {
    '&.MuiTypography-root': {
      color: theme.palette.textPlaceholder,
    },
  },
  sidefooter: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: '12px',
    marginTop: '36px',
  },
  footerText: {
    display: 'flex',
    alignItems: 'center',
  },

  alterIcon: {
    width: '16px',
    height: '16px',
    marginRight: '5px',
  },

  sideBySideCol: {
    marginTop: '8px',
  },
  dateWrapper: {
    marginTop: '16px',
  },
  duelTime: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
    '& .MuiInputBase-root': {
      minWidth: '100%',
    },
    '& .MuiBox-root': {
      '& .MuiStack-root': {
        '& .MuiFormControl-root': {
          '& .MuiInputBase-root': {
            height: '36px',
            '& .MuiOutlinedInput-notchedOutline': {
              // backgroundColor: theme.palette.surfaceWhite,
            },
          },
        },
      },
    },
  },
  plusBtn: {
    fontSize: '30px',
    marginRight: '10px',
  },
  attachSuccess: {
    marginTop: '8px',
    borderRadius: '8px',
    border: `1px solid ${theme.palette.surfaceGreySubtle}`,
    background: theme.palette.surfaceWhite,
    boxShadow: '0px 1px 2px 0px rgba(16, 24, 40, 0.06), 0px 1px 3px 0px rgba(16, 24, 40, 0.10)',
    padding: '10px 14px',
    display: 'flex',
    maxWidth: '100%',
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  attachSuccessInner: {
    display: 'flex',
    '& svg': {
      flex: '0 0 36px',
    },
  },
  deleIcons: {
    '& svg': {
      cursor: 'pointer',
      '& path': {
        stroke: '#db0808',
      },
    },
  },
  attachName: {
    '&.MuiTypography-root': {
      fontSize: '14px',
      color: theme.palette.textSecondary1,
      lineHeight: '20px',
    },
  },
  attachSize: {
    '&.MuiTypography-root': {
      fontSize: '14px',
      color: theme.palette.textSecondary3,
      lineHeight: '20px',
    },
  },
  attachNameWrap: {
    marginLeft: '10px',
  },
  uploadBtnImg: {
    cursor: 'pointer',
    position: 'relative',
    maxWidth: '100%',
    '& span.MuiButtonBase-root': {
      marginTop: '10px',
      height: '126px',
      padding: '0px',
      justifyContent: 'flex-start',
    },
  },
  fileUpload: {
    position: 'absolute',
    zIndex: '1',
    width: '100%',
    height: '100%',
    opacity: '0',
    cursor: 'pointer',
  },
  FileUploader: {
    margin: '16px 0',
  },
  converInner: {
    '& .MuiTypography-subtitle2': {
      fontWeight: '600',
    },
  },
  attchBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    '& .MuiButtonBase-root.MuiButton-root.MuiButton-onlyText.MuiButton-onlyTextPrimary.MuiButton-sizeMedium':
      {
        padding: '0px',
        '& svg': {
          width: '81px',
          height: '20px',
          background: '#007aff00',
          borderColor: '#007aff00',
          '& path': {
            fill: '#007aff',
          },
        },
      },
  },
  attachAccordian: {
    '& .MuiAccordionSummary-content': {
      justifyContent: 'space-between',
      width: '100%',
    },
  },
}));
