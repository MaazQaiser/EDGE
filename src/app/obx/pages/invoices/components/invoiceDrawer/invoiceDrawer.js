import { makeStyles } from '@mui/styles';
export const useStyles = makeStyles((theme) => ({
  drawerWrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    overflow: 'auto',
    flex: '1 1',
  },
  lineField: {
    '&.MuiFormControl-root.MuiFormControl-marginDense.MuiTextField-root': {
      margin: '8px 0px',
      height: '36px',
    },
  },
  colmDataInner: {
    width: '100%',
    '& .MuiInputBase-root.MuiOutlinedInput-root.MuiInputBase-colorPrimary.MuiInputBase-formControl':
      {
        height: '36px',
        width: '252px',
      },
  },
  name: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
    },
  },
  signalLogo: {
    '&.MuiSvgIcon-root': {
      width: '125px',
      height: '37px',
    },
  },

  footerArea: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    columnGap: '12px',
    padding: '8px 32px',

    width: '100%',
  },

  headerCol: {
    '& .MuiTypography-body2': {
      color: theme.palette.textSecondary1,
      LineHeight: '24px',
    },
  },

  headerArea: {
    padding: '40px 40px 0px 40px',
    width: '100%',
  },

  headerWrapper: {
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
    paddingBottom: '24px',
    marginTop: '24px',
    display: 'flex',
    justifyContent: 'space-between',
    gap: '12px',
  },

  dutyInformationDropdownOfficer: {
    height: '44px',
    '& div': {
      '&  div': {
        '&  .MuiTypography-root': {
          fontSize: '16px',
          fontWeight: '400',
        },
      },
    },
  },
  dropdownWrap: {
    height: '44px',
    '& div': {
      '&  div': {
        '&  .MuiTypography-root': {
          fontSize: '16px',
          fontWeight: '400',
        },
      },
    },
  },
  fieldColms: {
    display: 'flex',
    gap: '24px',
    paddingBottom: '24px',
    width: '100%',
  },
  colmData: {
    width: '100%',
  },

  colmDataDropdown: {
    width: '50%',
  },

  paymentDropdown: {
    minWidth: '252px',
    maxWidth: '252px',
    width: '100%',
    ' > div': {
      height: '36px',
    },
  },

  skeletonDropdown: {
    '&.MuiSkeleton-root': {
      height: '44px',
      transform: 'none',
      borderRadius: '8px !important',
    },
  },

  textFieldColms: {
    display: 'flex',
    gap: '8px',
    paddingBottom: '24px',
    width: '100%',
    flexDirection: 'column',
    marginRight: 'auto',
  },
  padBottom: {
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
    paddingBottom: '8px',
    marginBottom: '24px',
  },
  colmDatas: {
    width: '600px',
    display: 'flex',
    alignItems: 'center',
    '& h6.MuiTypography-root , & .MuiTypography-body2': {
      flex: '0 0 230px',
    },
  },
  colmDatasForm: {
    width: '483px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  contentArea: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    overflow: 'auto',
    flex: '1 1',
    padding: '24px 40px 0 40px',
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
  },
  notesCloseBtn: {
    '&.MuiButtonBase-root': {
      marginTop: '12px',
      padding: '0px',
      height: 'auto',
      width: 'auto',
      minWidth: 'auto',

      '& .MuiButton-icon': {
        margin: '4px',
        '& svg': {
          width: '16px',
          height: '16px',
        },
      },

      '&:disabled': {
        '& .MuiButton-icon': {
          '& svg': {
            '& path': {
              stroke: theme.palette.borderBrandDisabled,
            },
          },
        },
      },
    },
  },
  tableWrapper: {
    width: '100%',
    borderTop: `1px solid ${theme.palette.borderSubtle1}`,
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
    paddingBottom: '24px',
    paddingTop: '24px',

    '& table': {
      '& tr:hover': {
        background: 'transparent !important',
      },
    },
  },

  inlineTD: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '334px',
    paddingBottom: '6px',
    paddingTop: '6px',
    '&:not(:last-child)': {
      borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
    },
  },
  footerColms: {
    marginTop: '24px',
    width: '100%',
    marginLeft: 'auto',
    marginBottom: '24px',
    display: 'flex',
    flexDirection: 'row',
    gap: '16px',
    justifyContent: 'space-between',
  },

  descriptionBox: {
    flex: '0 0 50%',
  },

  invalidFeedback: {
    fontSize: '14px',
    lineHeight: '20px',
    fontWeight: '400',
    margin: 0,
    marginTop: '6px',
    color: theme.palette.textAlert,
    textShadow: '0px 0px 0px #F4EBFF, 0px 1px 2px rgba(16, 24, 40, 0.05)',
  },

  titleTop: {
    marginBottom: '4px',
  },

  textFlex: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },

  textSkeleton: {
    '&.MuiSkeleton-root': {
      height: '16px',
      width: '100px',
      transform: 'none',
      borderRadius: '8px !important',
    },
  },
  inlineTDTotal: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '334px',
    // paddingBottom: '6px',
    paddingTop: '6px',
  },
  inlineTDError: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '334px',
    paddingTop: '6px',
  },
}));
