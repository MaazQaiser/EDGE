const MuiSelect = ({ _palette }) => ({
  styleOverrides: {
    root: {
      width: '100%',
      height: '100% ',
      maxHeight: 44,
      padding: '0',
      margin: '0',
      '& .MuiInputBase-input': {
        fontSize: 16,
        lineHeight: '24px',
        padding: '10px 14px !important',
        color: '#262527',
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
      '.Mui-error': {
        color: '#B32318',
        boxShadow: 'none',
        '&.MuiOutlinedInput-notchedOutline': {
          borderColor: '#f04438 ',
          borderWidth: '1px',
          boxShadow: 'none',
          '&:hover': {
            borderColor: '#f04438 ',
            borderWidth: '1px',
          },
          '&::first-letter': {
            textTransform: 'capitalize',
          },
        },
      },
      '.Mui-focused': {
        color: '#B32318',
        boxShadow: 'none',
        '&.MuiOutlinedInput-notchedOutline': {
          borderRadius: '8px',
          border: '1px solid #3f99ff',
          boxShadow: '0px 0px 0px 4px rgba(14, 165, 233, 0.1)',
          '&:hover': {
            borderRadius: '8px',
            border: '1px solid #3f99ff',
            boxShadow: '0px 0px 0px 4px rgba(14, 165, 233, 0.1)',
          },
          '&::first-letter': {
            textTransform: 'capitalize',
          },
        },
      },
    },
    icon: {
      '&.Mui-disabled': {
        '&svg': {
          '&path': {
            stroke: '#AEAEB2',
          },
        },
      },
      '&.MuiSelect-iconOpen': {
        transform: 'rotate(180deg) ',
        color: '#00000000',
      },
    },
  },
});

export default MuiSelect;
