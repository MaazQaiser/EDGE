const MuiSkeleton = ({ _palette }) => ({
  styleOverrides: {
    // For Future use if need
    // circular: {
    //   //   borderRadius: '50%', // Customize the border-radius for circular variant
    //   //   width: '40px', // Customize the width for circular variant
    //   //   height: '40px', // Customize the height for circular variant
    //   // },
    //   // rectangular: {
    //   //   borderRadius: '8px', // Customize the border-radius for rectangular variant
    //   //   width: '100%', // Customize the width for rectangular variant
    //   //   height: '20px', // Customize the height for rectangular variant
    //   // },
    rounded: {
      borderRadius: '1000px !important',
    },
    text: {
      borderRadius: '16px !important',
    },
    rectangular: {
      borderRadius: '1000px !important',
    },
  },
});

export default MuiSkeleton;
