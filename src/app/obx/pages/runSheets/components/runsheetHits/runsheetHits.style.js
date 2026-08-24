import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  /* **Row gap is deliberately larger than the column gap.** Both were 16px, so
     a second row of fields sat exactly as far from the row above it as it did
     from its own neighbour across the gutter — five fields reading as one
     jumble instead of two rows. The column gutter separates fields; the row gap
     separates *lines of fields*, which is the bigger break of the two. */
  HitStats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3 , 1fr)',
    columnGap: '16px',
    rowGap: '20px',
    paddingBottom: '20px',
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
  },
  /* Was referenced by all five fields and **never defined** — so every label
     and value pair rendered as a bare div with no rules at all, taking whatever
     margins the two Typography variants happened to bring. That is most of why
     the block read as cramped. A label belongs to its value, so 2px: tighter
     than anything else in the panel, which is what makes them read as one unit. */
  hitItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '2px',
    minWidth: 0,
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
  /* Matched to `instructionTitle`'s spec rather than left on the bare `h6`
     variant: the theme's own `typography.h6` is 700/12/18, sized for a dense
     UI label, not a section heading — every other heading in this panel
     ("Instructions:") was already built to Headline/H4 (700/16/24), so a
     `variant="h6"` title here rendered visibly smaller than its neighbours.
     `textTransform: capitalize` also came off: "Filters to Replace" doesn't
     want its "to" capitalized, and the other titles are already correctly
     cased in their own strings. */
  title: {
    '&.MuiTypography-root': {
      fontFamily: 'Inter',
      /* Semibold, not bold — asked for directly. Kept in step with
         `instructionTitle` below, which is the same section-heading role: the two
         drifting apart is exactly what made these labels read as inconsistent
         before. */
      fontWeight: 600,
      fontSize: '16px',
      lineHeight: '24px',
      color: theme.palette.textPrimary,
      /* 12px, and it has to stay smaller than the 20px a section takes above
         it: a heading 8px from its own content but 16px from the section
         boundary was reading as almost equally attached to both. */
      marginBottom: '12px',
    },
  },
  hitCardWrapper: {
    padding: '20px 24px',
  },
  checkPointsWrapper: {
    padding: '20px 0',
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

  /* `gap` stays at the exported spec's 16px — the heading block here ends in a
     divider, so it earns a wider step than a bare heading's 12px. Only the
     section padding moves, to sit on the same 20px rhythm as every other
     section boundary in the panel. */
  instructionWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    padding: '20px 0',
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
      /* 600, tracking `title` above — see the note there. This departs from the
         exported spec's `700` on purpose, because a single heading a step heavier
         than its three neighbours is the inconsistency, not the fix. */
      fontWeight: 600,
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
  filtersWrapper: {
    padding: '20px 0',
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
  },
  /* One row per size — no header row, no column rule, no divided rows. A
     table was the wrong register for five words of information; this is the
     same fact a submitted report already prints ("Filter Size: 100*100*2 *
     Quantity: 1"), stacked as one line per size instead. */
  filtersList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  /* 10px between rows against 8px inside one, so a chip stays visibly closer to
     its own count than to the row below it. At an equal 8px the column read as
     an alternating strip of chips and numbers rather than as paired lines. */
  filterRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  /* Grey, not this panel's own green — the chip names a product code, not a
     state, and giving it the panel's accent read as one more status colour
     competing with the ones that actually mean something (the status chip,
     the report icon). Neutral fill, the same `surfaceGreySubtle` the app
     already uses for a settled tag elsewhere.
     The count sits outside the chip on purpose: it is a quantity, not part of
     the product code the chip names, and folding it in made every chip a
     different width for a reason that had nothing to do with the size it
     named. */
  filterChip: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '4px 10px',
    borderRadius: '6px',
    backgroundColor: theme.palette.surfaceGreySubtle,
    width: 'fit-content',
  },
  filterChipDimension: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
      fontSize: '13px',
      fontWeight: 500,
      lineHeight: '18px',
    },
  },
  filterQty: {
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary2,
      fontSize: '13px',
      fontWeight: 600,
      lineHeight: '18px',
    },
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
