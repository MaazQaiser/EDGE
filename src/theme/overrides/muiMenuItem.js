const MuiMenuItem = ({ _palette }) => ({
  styleOverrides: {
    root: {
      color: '#5b5b5f', // Customize the color of the InputLabel
      fontSize: 14,
      fontWeight: 400,
      lineHeight: '20px',
      padding: '10px 14px',
      '&:hover': {
        backgroundColor: 'transparent',
      },
      '&:focus-visible': {
        backgroundColor: 'transparent',
      },
      '&.Mui-selected': {
        // backgroundColor: '#ebf6fd',

        backgroundColor: 'transparent',
        '&:hover': {
          // backgroundColor: '#ebf6fd',

          backgroundColor: 'transparent',
        },
        '&:focus-visible': {
          backgroundColor: 'transparent',
        },
      },
    },
  },
});

export default MuiMenuItem;
