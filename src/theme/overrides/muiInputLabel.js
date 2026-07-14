const MuiInputLabel = ({ _palette }) => ({
  styleOverrides: {
    root: {
      color: '#86868B', // Customize the color of the InputLabel
      fontSize: 14,
      fontWeight: 500,
      lineHeight: '20px',
      marginBottom: '6px',
      display: 'flex',
      gap: '2px',
      '&.Mui-disabled': {
        color: '#AEAEB2',
      },
    },
    focused: {
      // Customize the styles when the InputLabel is focused
      //   color: 'green', // Customize the color when focused
    },
  },
});

export default MuiInputLabel;
