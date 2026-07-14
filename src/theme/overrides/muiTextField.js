const MuiTextField = ({ palette }) => ({
  styleOverrides: {
    root: {
      width: '100%',
      height: '100%',
      maxHeight: 44,
      // minHeight: 44,
      minWidth: 220,
      padding: '10px 14px',
      '&.MuiInputBase-multiline': {
        maxHeight: 'unset',
      },
      '& .MuiInputBase-input': {
        fontSize: 16,
        lineHeight: '24px',
        padding: '0 !important',
        color: '#262527', // Change the color of input text
        zIndex: 1,
        height: 'auto',

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

        '&.Mui-disabled': {
          '-webkit-text-fill-color': '#AEAEB2 !important', // Change the color of text when input is disabled
        },

        '&::placeholder': {
          color: '#cccccc', // Placeholder Color
          fontSize: '16px',
          fontWeight: '400',
          lineHeight: '24px',
          opacity: 1,
        },
      },

      '& .MuiOutlinedInput-notchedOutline': {
        borderRadius: '8px',
        border: '1px solid #D0CFD2', // Border Color
        zIndex: 0,
      },

      '&:hover .MuiOutlinedInput-notchedOutline': {
        borderColor: '#AEAEB2', // Border Color when Hovered
        boxShadow: 'none',
      },
      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
        border: `1px solid ${palette.borderBrand}`,
        boxShadow: '0px 0px 0px 4px rgba(14, 165, 233, 0.1)',
      },
      '&.Mui-focused:hover .MuiOutlinedInput-notchedOutline': {
        boxShadow: '0px 0px 0px 4px rgba(14, 165, 233, 0.1)',
      },
      '&.Mui-error .MuiOutlinedInput-notchedOutline': {
        border: '1px solid #DF372B',
      },
      '&.Mui-error.Mui-focused .MuiOutlinedInput-notchedOutline': {
        border: ' 1px solid #DF372B', // Border when error and focused
        boxShadow: `0px 0px 0px 4px #fee4e2,
        0px 1px 2px 0px rgba(16, 24, 40, 0.05)`,
      },

      '&.Mui-disabled .MuiOutlinedInput-notchedOutline': {
        borderColor: '#D0CFD2', // When readOnly / Disabled input
      },

      '&.Mui-disabled:hover .MuiOutlinedInput-notchedOutline': {
        borderColor: '#D0CFD2', // When readOnly / Disabled input & hovered
      },
      '&.Mui-disabled': {
        '& .MuiInputAdornment-root': {
          '& svg': {
            '& path': {
              stroke: '#AEAEB2',
            },
          },
        },
      },
      '& + .MuiFormHelperText-root': {
        fontSize: 14,
        lineHeight: '20px',
        fontWeight: 400,
        margin: 0,
        marginTop: '6px',
        color: '#6A6A70',
        textShadow: '0px 0px 0px #F4EBFF, 0px 1px 2px rgba(16, 24, 40, 0.05)',
      },
      '& + .MuiFormHelperText-root.Mui-error': {
        color: '#B32318',
        boxShadow: 'none',

        '&::first-letter': {
          textTransform: 'capitalize',
        },
      },
    },
  },
});

export default MuiTextField;
