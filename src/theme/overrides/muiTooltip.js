const MuiTooltip = ({ _palette }) => ({
  styleOverrides: {
    tooltip: {
      borderRadius: 8,
      padding: '8px 12px',
      lineHeight: '18px',
      fontWeight: 500,
      backgroundColor: '#000', // Customize the background color
      color: '#fff', // Customize the text color
      fontSize: '12px', // Customize the font size
      margin: '20px', // Adjust this value to increase the distance
    },
    arrow: {
      color: '#000', // Change the color of arrow
    },
    popper: {
      padding: '10px',
    },
  },
});

export default MuiTooltip;
