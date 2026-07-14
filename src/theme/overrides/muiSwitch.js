const MuiSwitch = ({ palette }) => ({
  styleOverrides: {
    root: {
      width: 36, // Customize the width of the Switch
      height: 20, // Customize the height of the Switch
      padding: 0, // Remove padding

      '& .MuiSwitch-track': {
        borderRadius: 100,
        padding: 0,
        opacity: 0,
        backgroundColor: '#F5F5F6', // switch track color when it is not checked
      },
      '& .MuiButtonBase-root': {
        padding: 2,
        '&:hover': {
          boxShadow: 'none',
          filter: 'none',
          backgroundColor: 'transparent',
        },
      },

      '.Mui-disabled + .MuiSwitch-track': {
        // Change the colors and opacity when switch is not checked and disabled
        backgroundColor: '#000',
        opacity: '0.4 !important',
      },
    },

    switchBase: {
      '&.Mui-checked': {
        transform: 'translateX(16px)', // Customize the position when checked
        filter:
          'drop-shadow(0px 1px 2px rgba(16, 24, 40, 0.06)) drop-shadow(0px 1px 3px rgba(16, 24, 40, 0.10))',
      },

      '&.Mui-disabled.Mui-checked + .MuiSwitch-track': {
        // Change the colors and opacity when switch is checked and disabled
        opacity: 0.4,
        backgroundColor: palette.surfaceBrand,
      },
      '&.Mui-checked + .MuiSwitch-track': {
        opacity: 1,
        backgroundColor: `${palette.surfaceBrand} !important`,
      },
    },
    thumb: {
      width: 16, // Customize the thumb (circle) width
      height: 16, // Customize the thumb (circle) height
      backgroundColor: '#fff',
      padding: 0,
      boxShadow: 'none',
      filter:
        'drop-shadow(0px 1px 2px rgba(16, 24, 40, 0.06)) drop-shadow(0px 1px 3px rgba(16, 24, 40, 0.10))',
    },
  },
});

export default MuiSwitch;
