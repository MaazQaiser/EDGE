import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  siderBarBox: {
    display: 'flex',
    flexDirection: 'column',
    flex: '1',
    overflow: 'auto',
  },

  textFiledFil: {
    height: '44px',
  },

  textFiledFilter: {
    height: '44px',
  },

  moreFilterHeader: {
    marginBottom: '16px !important',
  },

  sideHeader: {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'auto',
    padding: '24px 24px 10px',
  },

  moreFilterForm: {
    display: 'flex',
    flexDirection: 'column',
    flex: '1',
    overflow: 'auto',
    padding: '6px 24px 24px 24px',
  },

  fieldWrapper: {
    marginBottom: '16px',
    '&  dropdownWrap': {
      height: '44px',
    },

    '&:last-child': {
      marginBottom: 0,
    },
  },

  moreFilterFooter: {
    padding: '24px 0px 24px 0px',
    marginLeft: '24px',
    marginRight: '24px',
  },

  moreFilter: {
    '&.MuiButtonBase-root': {
      fontSize: '14px',
      fontWeight: '500',
      lineHeight: '20px',
      letterSpacing: '0px',
      color: theme.palette.textPrimary,
      textTransform: 'capitalize',
      width: 'fit-content',
      height: 'auto',
      padding: '0',
      '&:hover': {
        background: 'transparent',
      },

      '&.Mui-disabled': {
        '& svg': {
          '& path': {
            fill: theme.palette.textDisabled,
          },
        },
      },
    },
    '& svg': {
      width: '14px',
      height: '14px',
    },
  },

  placeHolderColor: {
    color: theme.palette.textPlaceholderField,
    fontSize: '16px !important',
    fontWeight: '400 !important',
  },
  dropdownWrap: {
    height: '44px',
    fontSize: '16px',
    fontWeight: '400',
  },

  autoCompleteField: {
    minHeight: '44px',
    '& .MuiFormControl-root': {
      '& .MuiInputBase-root': {
        fontSize: 16,
        lineHeight: '24px',
        color: '#262527', // Change the color of input text
        zIndex: 1,
        padding: '10px 14px',
        background: 'transparent',
        gap: '4px',
        borderRadius: '8px',
        border: `1px solid ${theme.palette.borderSubtle2}`,

        '& .MuiChip-root': {
          margin: 0,
        },

        '&:hover': {
          borderColor: theme.palette.borderStrong1, // Border Color when Hovered
          boxShadow: 'none',
        },

        '&::after': {
          display: 'none',
        },
        '&::before': {
          display: 'none',
        },
        '& .MuiInputBase-input': {
          padding: 0,

          '&::placeholder': {
            color: theme.palette.textPlaceholderField, // Placeholder Color
            fontSize: '16px',
            fontWeight: '400',
            lineHeight: '24px',
            opacity: 1,
          },
        },
      },
    },
  },
  popButton: {
    '&.MuiButtonBase-root': {
      display: 'flex',
      justifyContent: 'space-between',
      color: theme.palette.textPlaceholderField,
      fontSize: '16px',
      fontWeight: '400',
      lineHeight: '24px',
      padding: '10px 21px 10px 14px',
      border: `1px solid ${theme.palette.borderSubtle2}`,
      height: '44px',
      width: '100%',
      '&:hover': {
        color: theme.palette.textPlaceholderField,
      },
      '&:active': {
        color: theme.palette.textPlaceholderField,
      },
    },
  },
  InlineRangeField: {
    maxHeight: 0,
    opacity: 0,
    overflow: 'hidden',
    transition: 'max-height 0.3s ease, opacity 0.3s ease',
    position: 'absolute', // Position absolutely within the container
    top: '100%', // Position it right below the button
    left: 0,
    right: 0,
    backgroundColor: '#fff', // Match your design

    zIndex: 1, // Ensure it appears above other content
  },

  visible: {
    maxHeight: '100px', // Adjust based on your content's height
    height: '92px', // Adjust based on your content's height
    opacity: 1,
  },
  iconRotated: {
    transform: 'rotate(180deg)', // Rotate icon by 180 degrees
    transition: 'transform 0.3s ease', // Smooth transition for rotation
  },
  customBtns: {
    position: 'relative',

    '& label.MuiFormLabel-root': {
      gap: '5px',
      alignItems: 'center',
      '& path': {
        stroke: theme.palette.textBrand,
      },
    },
  },
  inBox: {
    display: 'flex', // To make the InlineRangeField visible
    boxShadow: 'rgba(149, 157, 165, 0.2) 0px 8px 24px',
    padding: '14px',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '8px',
    borderRadius: '8px',
    marginTop: '1px',
    '& .MuiOutlinedInput-root': {
      minWidth: '150px',
      maxWidth: '150px',
    },
  },
  PlaceHolderClass: {
    '&.MuiButtonBase-root': {
      display: 'flex',
      justifyContent: 'space-between',
      color: theme.palette.textPrimary,
      fontSize: '16px',
      fontWeight: '400',
      lineHeight: '24px',
      padding: '10px 21px 10px 14px',
      border: `1px solid ${theme.palette.borderSubtle2}`,
      height: '44px',
      width: '100%',
      '&:hover': {
        color: theme.palette.textPrimary,
      },
      '&:active': {
        color: theme.palette.textPrimary,
      },
    },
  },
}));
