const MuiCheckbox = ({ palette }) => ({
  styleOverrides: {
    root: {
      color: '#6A6A70',
      borderRadius: '4px !Important',
      '&.Mui-checked': {
        color: palette.surfaceBrand,
        '&:hover': {
          // backgroundColor: 'lightgreen', // Customize the background color on hover when checked
        },
      },

      '&.Mui-disabled': {
        color: '#D0CFD2', // Customize the color when the Checkbox is checked
        '&:hover': {
          // backgroundColor: 'blue', // Customize the background color on hover when checked
        },
      },
    },
  },
});

export default MuiCheckbox;
