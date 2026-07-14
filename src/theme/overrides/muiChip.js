const MuiChip = ({ palette }) => ({
  styleOverrides: {
    root: {
      padding: '4px 8px',
      gap: '4px',
      height: 'unset',
      textTransform: 'capitalize',
      '& .MuiSvgIcon-root': {
        fontSize: '12px',
        fontWeight: 500,
        lineHeight: '18px',
        margin: '0',
      },
      '&.MuiChip-outlinedError': {
        backgroundColor: '#FBEEED',
        color: '#B32318',
        borderColor: '#FBEEED',
      },
      '& .MuiChip-label': {
        fontSize: '12px',
        fontWeight: 500,
        lineHeight: '18px',
        padding: '0px',
        margin: '0',
      },
      '&.MuiChip-colorSuccess': {
        background: '#EFF8EF',
        color: '#027A48',
      },
      '&.MuiChip-colorWarning': {
        background: '#FEF0C7',
        color: '#DC6803',
      },
      '&.MuiChip-colorError': {
        backgroundColor: '#FBEEED',
        color: '#B32318',
      },
      '&.MuiChip-colorPrimary': {
        backgroundColor: palette.surfaceBrandSubtle,
        color: palette.textBrand,
        '&.MuiChip-filled-primary': {
          backgroundColor: palette.surfaceBrand,
          color: '#FFFFFF',
        },
      },
      '&.MuiChip-filledError': {
        backgroundColor: '#FBEEED',
        color: '#B32318',
      },
      '&.MuiChip-colorInfo': {
        backgroundColor: '#F5F5F6',
        color: '#5B5B5F',
      },
      '&.MuiChip-colorDefault': {
        backgroundColor: '#F5F5F6',
        color: '#5B5B5F',
      },
      '& .MuiChip-icon': { marginRight: '0', marginLeft: '0' },
    },
  },
});

export default MuiChip;
