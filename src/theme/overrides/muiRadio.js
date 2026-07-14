const MuiRadio = ({ palette }) => ({
  styleOverrides: {
    root: {
      color: '#6A6A70',

      '&.Mui-checked': {
        color: palette.surfaceBrand,
        '&:hover': {
          // backgroundColor: 'lightgreen', // Customize the background color on hover when checked
        },
      },

      '&.Mui-disabled': {
        color: '#AEAEB2', // Customize the color when the Checkbox is checked
        '&:hover': {
          // backgroundColor: 'blue', // Customize the background color on hover when checked
        },
      },
    },
  },
});

export default MuiRadio;
