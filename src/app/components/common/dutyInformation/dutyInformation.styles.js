import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  invalidFeedback: {
    fontSize: '14px',
    lineHeight: '20px',
    fontWeight: '400',
    margin: 0,
    marginTop: '6px',
    color: theme.palette.textAlert,
    textShadow: '0px 0px 0px #F4EBFF, 0px 1px 2px rgba(16, 24, 40, 0.05)',
  },

  dutyInformation: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  dutyInformationGrid: {
    display: 'flex',
    gap: '16px',
    flexWrap: 'wrap',
    marginBottom: '24px',
  },
  dutyInformationContent: {
    // display: 'flex',
    // gap: '16px',
    // flexWrap: 'wrap',

    border: `1px solid ${theme.palette.borderSubtle1}`,
    borderRadius: '8px',
    padding: '24px',
    rowGap: '16px',
  },
  dutyInformationRemoveBtnWrapper: {
    marginTop: '26px',
  },

  dutyInformationDateRange: {
    '& .MuiInputBase-root': {
      width: '300px',
      minWidth: '300px',
    },
  },

  dutyInformationDropdown: {
    width: '200px',
  },

  dutyInformationDropdownCustom: {
    width: '220px',
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

  dutyInformationDropdownLabel: {
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    width: '150px',
  },

  dutyInformationField: {
    width: '200px',
    '& .MuiFormControl-root': {
      '& .MuiInputBase-root ': {
        width: '200px',
        minWidth: '200px',
      },
    },
  },

  dutyInformationRemoveBtn: {
    '&.MuiButtonBase-root': {
      width: '44px',
      minWidth: '44px',
      height: '44px',
      padding: 0,
      // position: 'relative',
      // top: '-10px',
    },
  },

  dutyInformationIcon: {
    width: '20px',
    height: '20px',
    '& path': {
      fill: theme.palette.textPrimary,
    },
  },

  dutyInformationAddIcon: {
    width: '20px',
    height: '20px',
    '& path': {
      stroke: theme.palette.textPrimary,
    },
  },

  dutyInformationFree: {
    height: '26px',
  },

  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    columnGap: '8px',
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

  checkboxLabelText: {
    '&.MuiFormLabel-root': {
      color: theme.palette.textPrimary,
      marginBottom: 0,
      fontWeight: '400',
    },
  },

  selectedDaysWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
    marginBottom: '24px',
  },

  dutySelectFlex: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
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

  invalidData: {
    display: 'flex',
    padding: '6px 12px',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '4px',
    borderRadius: '8px',
    background: '#FBEEED',
    fontSize: '14px',
    fontWeight: '500',
    color: theme.palette.textAlert,
    width: 'fit-content',
  },

  dutyInformationFreePlus: {
    height: 0,
  },

  inlineCheckBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },

  addServises: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '24px',
  },
}));
