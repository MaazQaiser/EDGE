const MuiLinearProgress = ({ palette }) => ({
  styleOverrides: {
    root: {
      height: 8,
      borderRadius: 10,
      backgroundColor: '#F5F5F6',
      '& .MuiLinearProgress-bar': {
        borderRadius: 10,
        '&.MuiLinearProgress-barColorPrimary': {
          backgroundColor: palette.surfaceBrand,
        },
        '&.MuiLinearProgress-barColorSecondary': {
          backgroundColor: palette.brandSecondaryLight || palette.surfaceBrandDisabled,
        },
        '&.MuiLinearProgress-barColorWarning': {
          backgroundColor: '#F4780B',
        },
      },
    },
  },
});

export default MuiLinearProgress;
