import { makeStyles } from '@mui/styles';

export const FUEL_SURCHARGE_LAYOUT_FLAT_RATE = 'flatRate';

export const useStyles = makeStyles((theme) => ({
  wrapper: {
    display: 'flex',
    alignItems: 'baseline',
    width: '100%',
    padding: '12px 0',
    gap: '12px',
  },
  /** Create site: apply flat rate — space-between row, control on the right */
  wrapperFlatRate: {
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 0,
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    width: '367px',
  },
  rowFlatRate: {
    maxWidth: '100%',
    marginLeft: 'auto',
    width: '367px',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    whiteSpace: 'nowrap',
    cursor: 'pointer',
  },
  checkboxLabelFlatRate: {
    flexShrink: 0,
  },
  checkbox: {
    '&.MuiCheckbox-root': {
      padding: '0',
    },
    '& svg': {
      width: '16px',
      height: '16px',
    },
  },
  labelText: {
    '&.MuiTypography-root': {
      fontSize: '14px',
      fontWeight: 500,
      lineHeight: '20px',
      color: theme.palette.textPrimary,
    },
  },
  fuelSurchargeRow: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
  },
  fuelSurchargeRowFlatRate: {
    flex: 1,
    minWidth: 0,
    alignItems: 'stretch',
  },
  combinedInput: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    border: `1px solid ${theme.palette.borderSubtle2}`,
    borderRadius: '8px',
    backgroundColor: theme.palette.surfaceWhite,
    overflow: 'hidden',
    position: 'relative',
    '&:hover': {
      borderColor: theme.palette.borderStrong1,
    },
    '&:focus-within': {
      borderColor: theme.palette.borderBrand,
    },
  },
  combinedInputError: {
    borderColor: '#b32318 !important',
    '&:hover': {
      borderColor: '#b32318 !important',
    },
    '&:focus-within': {
      borderColor: '#b32318 !important',
    },
  },
  inputField: {
    flex: '1 1 10%',
    '& .MuiOutlinedInput-root': {
      borderRadius: 0,
      border: 'none',
      boxShadow: 'none',
      minWidth: 'unset',
      [theme.breakpoints.down('lg')]: {
        width: '100%',
      },
      '& fieldset': {
        border: 'none',
      },
      '&:hover fieldset': {
        border: 'none',
      },
      '&.Mui-focused': {
        boxShadow: 'none',
        '& fieldset': {
          border: 'none',
        },
      },
    },
    '& .MuiInputBase-input': {
      padding: '10px 14px',
      fontSize: '16px',
      lineHeight: '24px',
      '&::placeholder': {
        color: theme.palette.textPlaceholderField,
        opacity: 1,
      },
      '&:focus': {
        outline: 'none',
      },
    },
  },
  separator: {
    width: '1px',
    height: '24px',
    backgroundColor: theme.palette.borderSubtle1,
    flexShrink: 0,
  },
  dropdownSection: {
    flex: '0 0 auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 14px',
    cursor: 'pointer',
    backgroundColor: theme.palette.surfaceWhite,
    whiteSpace: 'nowrap',
    '&:hover': {
      backgroundColor: theme.palette.surfaceGreyLight,
    },
  },
  /** Flat rate: label + chevron grouped at start (no space-between on label row) */
  dropdownSectionFlatRate: {
    justifyContent: 'flex-start',
    gap: '8px',
  },
  dropdownText: {
    fontSize: '16px',
    fontWeight: 400,
    lineHeight: '24px',
    color: theme.palette.textPrimary,
    whiteSpace: 'nowrap',
  },
  chevronIcon: {
    width: '16px',
    height: '16px',
    marginLeft: '8px',
    transition: 'transform 0.2s',
  },
  chevronIconOpen: {
    transform: 'rotate(180deg)',
  },
  chevronFlatRate: {
    marginLeft: 0,
    flexShrink: 0,
  },
  dropdownMenu: {
    marginTop: '4px',
    borderRadius: '8px',
    border: `1px solid ${theme.palette.borderSubtle2}`,
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
  },
  menuItem: {
    padding: '10px 14px',
    fontSize: '16px',
    lineHeight: '24px',
    color: theme.palette.textPrimary,
    '&:hover': {
      backgroundColor: theme.palette.surfaceGreyLight,
    },
  },
  errorText: {
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
  errorTextFlatRate: {
    alignSelf: 'stretch',
    maxWidth: '367px',
    width: '100%',
    marginLeft: 'auto',
  },
}));
