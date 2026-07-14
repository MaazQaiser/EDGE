import { makeStyles } from '@mui/styles';
export const useStyles = makeStyles((theme) => ({
  customDropdownSelect: {
    position: 'relative',
    height: '36px',
    display: 'flex',
    alignItems: 'center',
  },
  bordered: {
    border: `1px solid ${theme.palette.borderSubtle2}`,
    borderRadius: '8px',
    '&:hover': {
      border: `1px solid ${theme.palette.borderStrong1}`,
    },
  },
  error: {
    border: `1px solid ${theme.palette.borderAlert}`,
    '&:hover': {
      border: `1px solid ${theme.palette.borderAlert}`,
    },
  },
  dropdownOpen: {
    border: `1px solid ${theme.palette.borderBrand}`,
    boxShadow: '0px 0px 0px 4px rgba(14, 165, 233, 0.1)',
    '&:hover': {
      border: `1px solid ${theme.palette.borderBrand}`,
      boxShadow: '0px 0px 0px 4px rgba(14, 165, 233, 0.1)',
    },
  },
  errorDropdownOpen: {
    border: `1px solid ${theme.palette.borderAlert}`,
    boxShadow: '0px 0px 0px 4px #fee4e2, 0px 1px 2px 0px rgba(16, 24, 40, 0.05)',
    '&:hover': {
      border: `1px solid ${theme.palette.borderAlert}`,
      boxShadow: '0px 0px 0px 4px #fee4e2, 0px 1px 2px 0px rgba(16, 24, 40, 0.05)',
    },
  },
  disabledBorderd: {
    border: `1px solid ${theme.palette.borderSubtle1}`,
    pointerEvents: 'none',
    '& .MuiBox-root': {
      '& .MuiBox-root': {
        '& .MuiTypography-root': {
          color: theme.palette.textDisabled,
        },
        '& svg': {
          '& path': {
            stroke: theme.palette.textDisabled,
          },
        },
      },
    },
  },
  disabled: {
    pointerEvents: 'none',
    '& .MuiBox-root': {
      '& .MuiBox-root': {
        '& .MuiTypography-root': {
          color: theme.palette.textDisabled,
        },
        '& svg': {
          '& path': {
            stroke: theme.palette.textDisabled,
          },
        },
      },
    },
  },
  colorChange: {
    '& .MuiTypography-root': {
      color: 'red !important',
    },
  },
  customDropdownSelectHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    columnGap: '4px',
    cursor: 'pointer',
    border: 'none',
    flex: 1,
    height: '100%',
    padding: '10px 14px',
  },
  customDropdownSelectedOptions: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    '& .MuiTypography-root': {
      textTransform: 'capitalize',
      color: theme.palette.textPrimary,
      whiteSpace: 'nowrap',
    },
  },
  customDropdownSelectedOptionsDisabled: {
    '& .MuiTypography-root': {
      textTransform: 'capitalize',
      color: theme.palette.textPrimary,
    },
    pointerEvents: 'none',
    cursor: 'not-allowed !important',
    backgroundColor: theme.palette.surfaceGreySubtle,
    opacity: '0.5',
  },
  customDropdownLabel: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
    },
  },
  customDropdownIcon: {
    lineHeight: 0,
    height: '20px',
    width: '20px',
  },
  open: {
    transform: 'rotate(180deg)',
  },
  placeHolderColor: {
    '& path': {
      stroke: theme.palette.textPrimary,
    },
  },
  customDropdownSelectedOption: {
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    '& .MuiTypography-root': {
      color: theme.palette.textPrimary,
      textTransform: 'capitalize',
      whiteSpace: 'nowrap',
    },
  },
  customDropdownAvatar: {
    display: 'block',
    height: '24px',
    width: '24px',
    borderRadius: '50%',
    objectFit: 'cover',
    objectPosition: 'center',
  },
  customDropdownOptionsList: {
    position: 'absolute',
    top: '100%',
    left: 0,
    backgroundColor: theme.palette.surfaceWhite,
    borderRadius: '8px',
    border: `1px solid ${theme.palette.borderSubtle1}`,
    boxShadow: '0px 4px 6px -2px rgba(16, 24, 40, 0.05), 0px 12px 16px -4px rgba(16, 24, 40, 0.1)',
    minWidth: '270px',
    width: '100%',
    maxHeight: '270px',
    overflowY: 'auto',
    zIndex: 9999,
    padding: '4px 0px',
    [theme.breakpoints.down(786)]: {
      width: '100%',
      margin: '0 12px !important',
    },
  },
  extraSpecificClass: {
    backgroundColor: 'red',
  },
  positionRight: {
    right: 0,
    left: 'unset',
  },
  customFranchiseList: {
    marginTop: '6px',
  },
  customDropdownOptionsSearch: {
    padding: '10px 14px',
    position: 'sticky',
    top: '-4px',
    background: theme.palette.surfaceWhite,
    zIndex: '10',
  },
  customDropdownSearchField: {
    height: '36px',
    '& .MuiInputBase-root': {
      '& .MuiInputBase-input': {
        fontSize: '14px',
        fontWeight: '400',
        lineHeight: '20px',
      },
    },
    '& input::placeholder': {
      textTransform: 'capitalize',
    },
  },
  customDropdownCheckbox: {
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
    marginLeft: 'auto',
  },
  customDropdownCheckboxIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '20px',
    height: '20px',
  },
  customDropdownOptionListText: {
    // overflow: 'hidden',
    // textOverflow: 'ellipsis',
    // whiteSpace: 'nowrap',
    // maxWidth: 'calc(90%)',
    '&.MuiTypography-root': {
      fontSize: '12px !important',
      color: theme.palette.textSecondary3,
    },
  },
  customDropdownLabelText: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    maxWidth: 'calc(90%)',
    textTransform: 'capitalize',
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary2,
    },
  },
  lowercaseCustomDropdownLabelText: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    maxWidth: 'calc(90%)',
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary2,
    },
  },
  customDropdownOption: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    cursor: 'pointer',
    padding: '10px 14px',
    transition: 'all 0.3s',
    '&:hover': {
      backgroundColor: theme.palette.surfaceGreySubtle,
    },
    '& img': {
      width: '24px',
      height: '24px',
    },
  },
  customDropdownSelected: {
    backgroundColor: theme.palette.surfaceBrandSubtle,
  },
  customDropdownOptionTitle: {
    padding: '16px 14px',
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
  },
  customDropdownPlaceHolder: {
    '&.MuiTypography-root': {
      color: theme.palette.textPlaceholderField,
    },
  },
  customDropdownSelectedTiles: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexWrap: 'wrap',
    padding: '12px 14px 12px 14px',
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
  },
  customDropdownSelectedTileText: {
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary2,
      textTransform: 'capitalize',
    },
  },
  customDropdownSelectedTile: {
    borderRadius: '100px',
    background: theme.palette.surfaceGreySubtle,
    padding: '4px 4px 4px 12px',
    display: 'flex',
    alignItems: 'center',
  },
  customDropdownTextBox: {
    flex: '1 1',
    overflow: 'hidden',
  },
  showEmailInLineClass: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownName: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
      textTransform: 'capitalize',
    },
  },
  dropdownEmailWrap: {
    flex: '50%',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    overflow: 'hidden',
  },
  showEmailInLineName: {
    flex: '50%',
    '&.MuiTypography-root': {
      textTransform: 'capitalize',
    },
  },
  loadingWrapper: {
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '10px 14px',
  },
  loadingState: {
    width: '24px',
    height: '24px',
    border: '3px dotted #146DFF',
    borderStyle: 'solid solid dotted dotted',
    borderRadius: '50%',
    display: 'inline-block',
    position: 'relative',
    boxSizing: 'border-box',
    animation: '$rotation 2s linear infinite',
    '&:after': {
      content: '""',
      boxSizing: 'border-box',
      position: 'absolute',
      left: '0',
      right: '0',
      top: '0',
      bottom: '0',
      margin: 'auto',
      border: '3px dotted #146DFF',
      borderStyle: 'solid solid dotted',
      width: '12px',
      height: '12px',
      borderRadius: '50%',
      animation: '$rotationBack 1s linear infinite',
      transformOrigin: 'center center',
    },
  },
  '@keyframes rotation': {
    '0%': {
      transform: 'rotate(0deg)',
    },
    '100%': {
      transform: 'rotate(360deg)',
    },
  },
  '@keyframes rotationBack': {
    '0%': {
      transform: 'rotate(0deg)',
    },
    '100% ': {
      transform: 'rotate(-360deg)',
    },
  },
  noRecordFoundTitle: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
      margin: '12px',
      textAlign: 'center',
    },
  },
}));
