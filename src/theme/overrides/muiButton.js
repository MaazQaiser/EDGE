const MuiButton = ({ palette }) => ({
  variants: [
    // Primary
    {
      props: { variant: 'primary' },
      style: {
        padding: '8px 14px',
        height: 36,
        borderRadius: 8,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: 14,
        fontWeight: 500,
        lineHeight: '20px',
        fontFamily: 'Inter',
        textTransform: 'none',
        cursor: 'pointer',
        letterSpacing: 'normal',
        boxShadow: 'none',
        whiteSpace: 'nowrap',
        color: '#ffffff',
        backgroundColor: palette.surfaceBrand,
        border: `1px solid ${palette.borderBrand}`,

        '&:hover': {
          backgroundColor: palette.surfaceBrandHover,
          border: `1px solid ${palette.borderBrand}`,
        },

        '&:active': {
          backgroundColor: palette.surfaceBrand,
          border: `1px solid ${palette.borderBrand}`,
          boxShadow: `0px 0px 0px 4px ${palette.surfaceBrandSubtle}, 0px 1px 2px 0px rgba(16, 24, 40, 0.05)`,
        },

        '&:disabled': {
          color: '#ffffff',
          backgroundColor: palette.surfaceBrandDisabled,
          border: `1px solid ${palette.surfaceBrandDisabled}`,
        },
        '@media (hover:none)': {
          backgroundColor: palette.surfaceBrand,
          border: `1px solid ${palette.borderBrand}`,
        },
      },
    },

    // Secondary-Gray
    {
      props: { variant: 'secondaryGrey' },
      style: {
        padding: '8px 14px',
        height: 36,
        borderRadius: 8,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: 14,
        fontWeight: 500,
        lineHeight: '20px',
        fontFamily: 'Inter',
        textTransform: 'none',
        cursor: 'pointer',
        letterSpacing: 'normal',
        boxShadow: 'none',
        whiteSpace: 'nowrap',
        color: '#444446',
        backgroundColor: 'white',
        border: `1px solid #AEAEB2`,

        '&:hover': {
          color: '#262527',
          backgroundColor: '#F5F5F6',
          border: `1px solid #AEAEB2`,
        },

        '&:active': {
          color: '#444446',
          backgroundColor: 'white',
          border: `1px solid #AEAEB2`,
          boxShadow: `0px 0px 0px 4px #F2F4F7, 0px 1px 2px 0px rgba(16, 24, 40, 0.05)`,
        },

        '&:disabled': {
          color: '#AEAEB2',
          backgroundColor: 'white',
          border: `1px solid #D0CFD2`,
          '& span': {
            '& svg': {
              '& g': {
                '& path': {
                  stroke: '#AEAEB2',
                },
              },
            },
          },
        },
        '@media (hover:none)': {
          backgroundColor: 'white',
          border: `1px solid #AEAEB2`,
        },
      },
    },

    // Tertiary-Grey
    {
      props: { variant: 'tertiaryGrey' },
      style: {
        padding: '8px 14px',
        height: 36,
        borderRadius: 8,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: 14,
        fontWeight: 500,
        lineHeight: '20px',
        fontFamily: 'Inter',
        textTransform: 'none',
        cursor: 'pointer',
        letterSpacing: 'normal',
        boxShadow: 'none',

        color: '#5B5B5F',
        whiteSpace: 'nowrap',
        backgroundColor: 'transparent',

        '&:hover': {
          color: '#5B5B5F',
          backgroundColor: '#F5F5F6',
        },

        '&:active': {
          color: '#5B5B5F',
          backgroundColor: 'transparent',
          boxShadow: `none`,
        },

        '&:disabled': {
          color: '#AEAEB2',
          backgroundColor: 'transparent',
        },
        '@media (hover:none)': {
          backgroundColor: 'transparent',
        },
      },
    },

    // onlyText
    {
      props: { variant: 'onlyText' },
      style: {
        padding: '8px 14px',
        height: 36,
        borderRadius: 8,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: 14,
        fontWeight: 500,
        whiteSpace: 'nowrap',
        lineHeight: '20px',
        fontFamily: 'Inter',
        textTransform: 'none',
        cursor: 'pointer',
        letterSpacing: 'normal',

        color: palette.textBrand,
        backgroundColor: 'transparent',

        '&:hover': {
          color: palette.textBrandHover,
          backgroundColor: 'transparent',
        },

        '&:active': {
          color: palette.textBrand,
          backgroundColor: 'transparent',
          boxShadow: `none`,
        },

        '&:disabled': {
          color: palette.textBrandDisabled,
          backgroundColor: 'transparent',
        },
        '@media (hover:none)': {
          backgroundColor: 'transparent',
        },
      },
    },

    // Destructive
    {
      props: { variant: 'destructive' },
      style: {
        padding: '8px 14px',
        height: 36,
        borderRadius: 8,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: 14,
        fontWeight: 500,
        lineHeight: '20px',
        fontFamily: 'Inter',
        textTransform: 'none',
        cursor: 'pointer',
        letterSpacing: 'normal',
        boxShadow: `0px 1px 2px 0px rgba(16, 24, 40, 0.05)`,
        whiteSpace: 'nowrap',
        color: '#ffffff',
        backgroundColor: '#E43F32',
        border: `1px solid #E43F32`,

        '&:hover': {
          backgroundColor: '#B32318',
          border: `1px solid #B32318`,
        },

        '&:active': {
          backgroundColor: '#E43F32',
          border: `1px solid #E43F32`,
          boxShadow: ` 0px 0px 0px 4px #FEE4E2, 0px 1px 2px 0px rgba(16, 24, 40, 0.05)`,
        },

        '&:disabled': {
          color: '#ffffff',
          backgroundColor: '#FECDCA',
          border: `1px solid #FECDCA`,
          boxShadow: `0px 1px 2px 0px rgba(16, 24, 40, 0.05)`,
        },
        '@media (hover:none)': {
          backgroundColor: '#E43F32',
          border: `1px solid #D92D20`,
        },
      },
    },

    // Destructive-Secondary
    {
      props: { variant: 'destructiveSecondary' },
      style: {
        padding: '8px 14px',
        height: 36,
        borderRadius: 8,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: 14,
        fontWeight: 500,
        lineHeight: '20px',
        fontFamily: 'Inter',
        textTransform: 'none',
        cursor: 'pointer',
        letterSpacing: 'normal',
        boxShadow: `0px 1px 2px 0px rgba(16, 24, 40, 0.05)`,
        whiteSpace: 'nowrap',
        color: '#B32318',
        backgroundColor: '#ffffff',
        border: `1px solid #DF372B`,

        '&:hover': {
          backgroundColor: '#FBEEED',
          border: `1px solid #DF372B`,
        },

        '&:active': {
          backgroundColor: '#ffffff',
          border: `1px solid #DF372B`,
          boxShadow: ` 0px 0px 0px 4px #FEE4E2, 0px 1px 2px 0px rgba(16, 24, 40, 0.05)`,
        },

        '&:disabled': {
          color: '#FECDCA',
          backgroundColor: '#ffffff',
          border: `1px solid #FECDCA`,
        },
        '@media (hover:none)': {
          backgroundColor: '#ffffff',
          border: `1px solid #DF372B`,
        },
      },
    },

    // Secondary-Blue
    {
      props: { variant: 'secondaryBlue' },
      style: {
        padding: '8px 14px',
        height: 36,
        borderRadius: 8,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: 14,
        fontWeight: 500,
        lineHeight: '20px',
        fontFamily: 'Inter',
        textTransform: 'none',
        cursor: 'pointer',
        letterSpacing: 'normal',
        boxShadow: 'none',

        color: palette.textBrand,
        backgroundColor: '#ffffff',
        border: `1px solid ${palette.borderBrand}`,

        '&:hover': {
          color: palette.textBrand,
          backgroundColor: '#ffffff',
          border: `1px solid ${palette.borderBrand}`,
        },

        '&:active': {
          color: palette.textBrand,
          backgroundColor: 'transparent',
          border: `1px solid ${palette.borderBrand}`,
          boxShadow: `0px 0px 0px 4px ${palette.surfaceBrandSubtle}`,
        },

        '&:disabled': {
          color: palette.textBrandDisabled,
          backgroundColor: 'transparent',
          border: `1px solid ${palette.borderBrandDisabled}`,
        },
        '@media (hover:none)': {
          backgroundColor: 'transparent',
          border: `1px solid ${palette.borderBrand}`,
        },
      },
    },
  ],
});

export default MuiButton;
