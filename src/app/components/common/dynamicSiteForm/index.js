import { makeStyles } from '@mui/styles';
export const useStyles = makeStyles((theme) => ({
  chartHeading: {
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary1,
      marginBottom: '8px',
    },
  },
  siteWrapper: {
    padding: '24px 0px 0px 0px',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'auto',
    flex: '1 1',
    '& h3.MuiTypography-root , & h6.MuiTypography-root': {
      color: theme.palette.textPrimary,
    },
  },

  upperWrap: {
    padding: '0px 32px 0px 32px',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'auto',
    flex: '1 1',
  },
  lowerWrap: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    padding: '7px 32px',
    borderTop: `1px solid ${theme.palette.borderSubtle1}`,
  },
  siteDetaisFields: {
    display: 'flex',
    gap: '20px',
    margin: '16px 0px',
  },
  fieldWrapper: {
    flex: '1 1 25%',
    '& label.MuiFormLabel-root': {
      alignItems: 'center',
    },
  },

  fieldWrapperHalf: {
    flex: '0 0 32.222%',
    '& label.MuiFormLabel-root': {
      alignItems: 'center',
    },
  },

  onecols: {
    flex: '0 0 25%',
  },

  skeletonDropdown: {
    '&.MuiSkeleton-root': {
      width: '100%',
      height: '44px',
      transform: 'none',
      borderRadius: '8px !important',
    },
  },

  invalidFeedback: {
    display: 'block',
    color: '#b32318',
    fontSize: '14px',
    fontWeight: '400',
    lineHeight: '20px',
    textAlign: 'left',
    marginTop: '6px',
    textTransform: 'lowercase',
    '&::first-letter': {
      textTransform: 'capitalize',
    },
  },

  siteDetais: {
    border: `1px solid ${theme.palette.borderSubtle1}`,
    padding: '16px',
    borderRadius: '8px',
    margin: '16px 0px',
  },
  dropdownWrap: {
    height: '44px !important',
  },
  internalMapBox: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
    marginTop: '12px',
  },
  chekBoxMap: {
    padding: '0 !important',
  },
  mb0: {
    marginBottom: '0',
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
  noMarginBottom: {
    marginBottom: '0px',
  },
  placeHolderColor: {
    color: `${theme.palette.textPlaceholderField} !important`,

    fontSize: '16px !important',
    fontWeight: '400 !important',
  },
  grayBox: {
    margin: '16px 0px 0px 0px',
    border: `1px solid ${theme.palette.borderSubtle1}`,
    background: theme.palette.surfaceGreyLight,
    borderRadius: '8px',
    padding: '16px',
    textAlign: 'center',
    '& p.MuiTypography-root': {
      margin: '4px 0px 16px 0px',
    },
    '& button.MuiButtonBase-root': {
      margin: '0 auto',
    },
  },
  inlineBtnsCols: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  inlinbtns: {
    display: 'flex',
    gap: '12px',
  },

  notesCloseBtn: {
    '&.MuiButtonBase-root': {
      padding: '0',
      height: 'auto',
      minWidth: 'auto',

      '& .MuiButton-startIcon': {
        marginRight: 0,
        marginLeft: 0,
      },
    },
  },
  DaysTopWrap: {
    display: 'flex',
    gap: '24px',
    padding: '16px 0px',
    borderTop: `1px solid ${theme.palette.borderSubtle1}`,
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
  },
  selectedDaysBtns: {
    width: '56px',
    height: '28px',
    borderRadius: '40px',
    padding: ' 4px 12px',
    fontSize: '14px',
    lineHeight: '20px',
    fontWeight: '500',
    textTransform: 'capitalize',
    color: theme.palette.textPrimary,
    border: `1px solid ${theme.palette.borderSubtle1}`,
    cursor: 'pointer',
    textAlign: 'center',
  },
  DaysWrap: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
    maxWidth: '98%',
    '& div': {
      // width: '56px',
      height: '28px',
      borderRadius: '40px',
      fontSize: '14px',
      fontWeight: '500',
      lineHeight: '20px',
      '&:hover': {
        border: `1px black ${theme.palette.borderBrand}`,
        color: theme.palette.textOnColor,
        backgroundColor: theme.palette.surfaceBrand,
      },
    },
  },
  dutyDays: {
    textTransform: 'capitalize',
    border: `1px solid ${theme.palette.borderSubtle2} `,
    fontSize: '16px',
    fontWeight: '400',
    lineHeight: '24px',
    color: theme.palette.textSecondary1,
    borderRadius: '50%',
    height: '44px',
    width: '44px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
  inlineCheckBox: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '16px',
  },
  addServises: {
    display: 'flex',
    alignItems: 'center',
    padding: '16px 0px',
    gap: '24px',
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
    marginBottom: '16px',
  },
  fuelSurchargeRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '16px 0px',
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
  },
  fuelSurchargeCheckbox: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    whiteSpace: 'nowrap',
  },
  descriptionTextArea: {
    '& .ck.ck-content.ck-editor__editable.ck-rounded-corners.ck-editor__editable_inline': {
      height: '100px',
    },
  },
  placeHolderColors: {
    color: theme.palette.textPlaceholderField,
    fontSize: '16px !important',
    fontWeight: '400 !important',
  },
  dropdownWraps: {
    height: '44px',
    fontSize: '16px',
    fontWeight: '400',
  },
  marginBottom: {
    paddingBottom: '8px',
  },

  petrolArea: {
    margin: '16px 0',
  },

  petrolAreaTitle: {
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary1,
      marginBottom: '16px',
    },
  },

  visitAreaTitle: {
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary1,
    },
  },

  deleteBtn: {
    cursor: 'pointer',
    '& .MuiSvgIcon-root': {
      width: '16px',
      height: '16px',
    },
  },

  petrolAreaBlue: {
    padding: '12px 16px',
    borderRadius: '6px',
    background: theme.palette.surfaceBrandSubtle,
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },

  visitBox: {
    flex: ' 1 1 500px',
  },

  petrolAreaBlueTitle: {
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary1,
    },
  },

  fullFields: {
    marginBottom: '16px',
  },

  visitAreaBox: {
    // background: 'red',
    marginBottom: '16px',
    padding: '16px',
    border: `1px solid ${theme.palette.borderSubtle1}`,
    borderRadius: '8px',
    display: 'flex',
    justifyContent: 'space-between',
    gap: '24px',
    flexWrap: 'wrap',
  },

  petrolAreaBlueText: {
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary1,
    },
  },

  petrolAreaHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
    paddingBottom: '12px',
    marginBottom: '12px',
  },

  timePickerField: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '12px',
    marginTop: '12px',
  },

  singleTime: {
    marginTop: '12px',
  },

  dayPicker: {
    marginTop: '12px',
  },

  serviceTypeField: {
    width: '49%',
    '& label.MuiFormLabel-root': {
      alignItems: 'center',
    },
  },
  radioWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    '& .MuiSvgIcon-root': {
      width: '16px',
      height: '16px',
      marginLeft: '0px',
    },
    '& .MuiFormControlLabel-root': {
      marginLeft: '0px',
      padding: '0',
    },
    '& .MuiFormControlLabel-label': {
      fontSize: '14px',
      marginBottom: '0px',
      whiteSpace: 'nowrap',
    },
    '& .MuiButtonBase-root': {
      padding: '0',
      marginRight: 8,
    },
    '& .MuiFormLabel-root': {
      marginBottom: '0px',
    },
  },
  addFuelSurchargeBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  fuelSurchargeAndBillableWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
}));
