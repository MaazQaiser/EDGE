const MuiButton = ({ _palette }) => ({
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

        color: '#ffffff',
        backgroundColor: '#146DFF',
        border: `1px solid #146DFF`,

        '&:hover': {
          backgroundColor: '#0059FF',
          border: `1px solid #0059FF`,
        },

        '&:active': {
          backgroundColor: '#146DFF',
          border: `1px solid #146DFF`,
          boxShadow: `0px 0px 0px 4px #E5F6FF, 0px 1px 2px 0px rgba(16, 24, 40, 0.05)`,
        },

        '&:disabled': {
          color: '#ffffff',
          backgroundColor: '#75C4FF',
          border: `1px solid #75C4FF`,
        },
        '@media (hover:none)': {
          backgroundColor: '#146DFF',
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

        color: '#4D4D51',
        backgroundColor: 'transparent',
        border: `1px solid #AEAEB2`,

        '&:hover': {
          color: '#3C3C3D',
          backgroundColor: '#F9FBFB',
          border: `1px solid #AEAEB2`,
        },

        '&:active': {
          color: '#4D4D51',
          backgroundColor: 'transparent',
          border: `1px solid #AEAEB2`,
          boxShadow: `0px 0px 0px 4px #F2F4F7, 0px 1px 2px 0px rgba(16, 24, 40, 0.05)`,
        },

        '&:disabled': {
          color: '#AEAEB2',
          backgroundColor: 'transparent',
          border: `1px solid #D0CFD2`,
        },
        '@media (hover:none)': {
          backgroundColor: 'transparent',
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

        color: '#6A6A70',
        backgroundColor: 'transparent',

        '&:hover': {
          color: '#5B5B5F',
          backgroundColor: '#F9FBFB',
        },

        '&:active': {
          color: '#6A6A70',
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
        lineHeight: '20px',
        fontFamily: 'Inter',
        textTransform: 'none',
        cursor: 'pointer',
        letterSpacing: 'normal',

        color: '#6A6A70',
        backgroundColor: 'transparent',

        '&:hover': {
          color: '#5B5B5F',
          backgroundColor: 'transparent',
        },

        '&:active': {
          color: '#6A6A70',
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

        color: '#ffffff',
        backgroundColor: '#D92D20',
        border: `1px solid #D92D20`,

        '&:hover': {
          backgroundColor: '#B42318',
          border: `1px solid #B42318`,
        },

        '&:active': {
          backgroundColor: '#D92D20',
          border: `1px solid #D92D20`,
          boxShadow: ` 0px 0px 0px 4px #FEE4E2, 0px 1px 2px 0px rgba(16, 24, 40, 0.05)`,
        },

        '&:disabled': {
          color: '#ffffff',
          backgroundColor: '#FECDCA',
          border: `1px solid #FECDCA`,
          boxShadow: `0px 1px 2px 0px rgba(16, 24, 40, 0.05)`,
        },
        '@media (hover:none)': {
          backgroundColor: '#D92D20',
        },
      },
    },
  ],
});

export default MuiButton;
