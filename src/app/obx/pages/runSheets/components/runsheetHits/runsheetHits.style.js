import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  HitStats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3 , 1fr)',
    gap: '16px',
    paddingBottom: '16px',
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
  },
  hitItemTitle: {
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary2,
      textTransform: 'capitalize',
    },
  },
  hitItemSubTitle: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
      textTransform: 'capitalize',
    },
  },
  title: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
      textTransform: 'capitalize',
      marginBottom: '8px',
    },
  },
  hitCardWrapper: {
    padding: '20px 24px',
  },
  checkPointsWrapper: {
    padding: '16px 0',
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
  },
  ListItem: {
    '&.MuiListItem-root': {
      display: 'flex',
      justifyContent: 'space-between',
      paddingLeft: '0px',
      paddingRight: '0px',
      '&:last-child': {
        paddingBottom: '0px',
      },
      '&:first-child': {
        paddingTop: '0px',
      },
    },
  },
  LeftListItem: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(2),
  },
  BlueNumerICon: {
    '&.MuiTypography-root ': {
      padding: '8px',
      backgroundColor: theme.palette.surfaceBrand,
      display: 'flex',
      width: '20px',
      height: '20px',
      borderRadius: '50%',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 'var(--8, 8px)',
      color: theme.palette.textOnColor,
      fontSize: '12px',
    },
  },

  instructionWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    padding: '16px 0',
    '&:last-child': {
      paddingBottom: '0px',
    },
  },

  instructionHeading: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },

  /* Matched to the exported spec directly: Headline/H4, 700/16/24, `text/primary`.
     The `&.MuiTypography-root` selector is load-bearing — a bare `fontSize` here
     loses to the variant's own `.MuiTypography-root` rule and silently renders at
     the browser default instead. */
  instructionTitle: {
    '&.MuiTypography-root': {
      fontFamily: 'Inter',
      fontWeight: 700,
      fontSize: '16px',
      lineHeight: '24px',
      color: theme.palette.textPrimary,
    },
  },

  instructionDivider: {
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
  },

  /* Instructions sat 24px in from their own heading, and from every other
     section in the drawer, with nothing in the gap to justify the step. The
     injected HTML also brings its own paragraph margins.

     It also inherited the document's 16px body size, which made the site note the
     largest text in the drawer — larger than the runsheet, the technician and the
     visit type above it. Instructions are supporting detail, so they sit at the
     same 14px as every other value here.

     Two text roles per the exported spec, not one: a label line (`strong`/`b` —
     "Contract:", "Filter Size:") reads at Subtitle/Medium against `text/primary`,
     everything else at regular weight against `text/secondary-02`, so the label
     leads and the value it describes recedes. */
  instructionTextStyle: {
    padding: 0,
    fontFamily: 'Inter',
    fontSize: '14px',
    fontWeight: 400,
    lineHeight: '20px',
    color: theme.palette.textSecondary2,
    '& strong, & b': {
      fontWeight: 500,
      color: theme.palette.textPrimary,
    },
    '& p': {
      margin: 0,
    },
    '& p + p': {
      marginTop: '12px',
    },
  },
  accessText: {
    '&.MuiTypography-root ': {
      color: theme.palette.textAlert,
      textTransform: 'capitalize',
    },
  },
  patrolSetupText: {
    color: ' #5B5B5F',
    textTransform: 'capitalize',
    maxWidth: '390px',
    textAlign: 'center',
  },
  patrolSetupWrapper: {
    padding: '16px 0',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
    gap: '16px',
  },
  hitSkeleton: {
    marginBottom: '16px',
    '& .MuiSkeleton-root': {
      height: '60px',
      transformOrigin: 0,
      transform: 'none',
      borderRadius: '8px !important',
    },
    '&:last-child': {
      marginBottom: '0',
    },
  },
}));
