import { makeStyles } from '@mui/styles';

/* The toolbar's *filter chips* — the unrouted-demand count and the visits quick
   filter. Shape shared so the two cannot drift apart; only the palette differs,
   because that is the one thing they should not share.

   Actions are not chips and must not borrow this: `Select visits`, `Cancel` and
   `Harmonize` are page CTAs and use the design system's own button at its own
   size, as the sites module does. */
const TOOLBAR_PILL = {
  minWidth: 'auto',
  height: '28px',
  padding: '0 12px',
  borderRadius: '60px',
  fontSize: '12px',
  fontWeight: 500,
  lineHeight: '18px',
  textTransform: 'none',
  whiteSpace: 'nowrap',
  '& .MuiButton-startIcon': {
    marginLeft: 0,
    marginRight: '6px',
    '& svg': {
      width: '16px',
      height: '16px',
    },
  },
};

export const useStyles = makeStyles((theme) => ({
  scheduleCalendar: {
    padding: '0 32px 0',
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    minHeight: 0,
    overflow: 'hidden',
    position: 'relative',
    [theme.breakpoints.down('lg')]: {
      padding: '0 24px 0',
    },
  },

  scheduleCalendarTabsRow: {
    minHeight: '48px',
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    gap: '16px',
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
  },

  scheduleCalendarTabs: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    flex: '0 0 auto',
    gap: '24px',
  },

  scheduleCalendarTab: {
    '&.MuiButton-root': {
      padding: '0 4px',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      flex: '0 0 auto',
      height: '100%',
      minHeight: '48px',
      margin: 0,
      border: 0,
      borderBottom: '2px solid transparent',
      marginBottom: '-1px',
      borderRadius: 0,
      background: 'transparent',
      boxShadow: 'none',
      cursor: 'pointer',
      userSelect: 'none',
      color: theme.palette.textSecondary1,
      fontSize: '12px',
      fontWeight: 400,
      lineHeight: '18px',
      fontFamily: 'inherit',
      textAlign: 'left',
      textTransform: 'none',
      whiteSpace: 'nowrap',
      '&:hover': {
        background: 'transparent',
        color: theme.palette.textPrimary,
      },
      '&:focus': {
        outline: 'none',
      },
    },
  },

  scheduleCalendarTabActive: {
    '&.MuiButton-root': {
      color: theme.palette.textBrand,
      borderBottomColor: theme.palette.borderBrand,
      fontWeight: 500,
      '&:hover': {
        color: theme.palette.textBrand,
        background: 'transparent',
      },
    },
  },

  scheduleCalendarHeaderRight: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: '12px',
    marginLeft: 'auto',
    flexShrink: 0,
  },
  scheduleCalendarHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '24px',
  },

  scheduleCalendarHeaderLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },

  scheduleCalendarHeaderFilters: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    minWidth: 0,
    flexWrap: 'wrap',
  },

  scheduleCalendarFilterDropdown: {
    '&.MuiBox-root': {
      height: '28px',
      minWidth: 'auto',
      border: 'none !important',
      boxShadow: 'none !important',
      borderRadius: 0,
      background: 'transparent',
    },
    '& > .MuiBox-root': {
      height: '28px',
      alignItems: 'center',
      padding: '0 !important',
      columnGap: '4px',
    },
    '& > .MuiBox-root > .MuiBox-root:last-child': {
      width: '16px',
      height: '16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      lineHeight: 0,
      flexShrink: 0,
      transformOrigin: 'center center',
    },
    '& .MuiTypography-root': {
      fontSize: '12px',
      fontWeight: 400,
      lineHeight: '18px',
      color: `${theme.palette.textPrimary} !important`,
      textTransform: 'none !important',
    },
    '& svg': {
      width: '16px',
      height: '16px',
      display: 'block',
    },
    '& svg path': {
      stroke: `${theme.palette.textSecondary1} !important`,
    },
  },

  scheduleCalendarFilterSearchDivider: {
    width: '100%',
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
  },

  scheduleCalendarAlert: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '6px 12px',
    borderRadius: '8px',
    border: `1px solid ${theme.palette.borderAlert}`,
    background: theme.palette.surfaceAlertSubtle,
    '&.MuiTypography-root': {
      color: theme.palette.textAlert,
    },
    '& .MuiSvgIcon-root': {
      width: '18px',
      height: '18px',
    },
  },

  scheduleCalendarFull: {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    flex: 1,
    minHeight: 0,
    marginTop: 0,
  },

  /* A pane in the grid's place. The column and `minHeight: 0` are what let the pane
     keep owning its own scroll — without them its last row is pushed out of view. */
  scheduleOwnPane: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    minHeight: 0,
  },

  /* No `scheduleOwnPaneToolbar`. The grouping switch used to get a bare row of its
     own here, above the pane; it now leads the pane's own filter row instead
     (`CompaniesFilters`'s `leadingSwitch`), which is the one row the other layouts
     spend on the same pair of clusters. */

  /* --- the Routes / Visits / Companies switch ------------------------------
     Geometry mirrored from `calendarHeaderToolbarToggle` in
     `calendar/calendar.styles.js`, because the two sit in the same row and any
     difference in shell height, radius or segment inset reads as one of them being
     misaligned rather than as two controls. Only the segment's own padding differs
     below, where a glyph-plus-word has to fit what a single letter did. */
  scheduleGroupingToggle: {
    gap: '4px',
    '&.MuiToggleButtonGroup-root': {
      borderRadius: '8px',
      background: theme.palette.surfaceGreySubtle,
      height: '32px',
      /**
       * **Grid, so the three segments are equal.**
       *
       * They used to be `flex` and content-sized, which meant each segment was as wide
       * as its own word: `Routes` and `Visits` are six characters and `Plan` is four, so
       * the selected pill changed size as you moved along the control and the run read
       * as three unrelated buttons rather than one switch with three positions.
       *
       * `gridAutoColumns: 1fr` is what equalises. Flex cannot: `flex: 1` distributes the
       * *free* space, and an auto-width container has none — its intrinsic size is the
       * sum of the children, so a `flex-basis: 0` child ends up with `sum / 3`, which is
       * less than the widest word needs and clips it. A `1fr` track set instead reports
       * `3 × the widest column` as its own max-content, so the pill grows to fit the
       * longest label and every segment gets that width. About 12px wider overall.
       *
       * `gridAutoFlow: column` rather than a fixed `gridTemplateColumns`, because the
       * count is not fixed — Var 1 draws two segments and Var 2 draws three, and the
       * rule has to equalise whichever it gets without being told how many.
       */
      display: 'grid',
      gridAutoFlow: 'column',
      gridAutoColumns: '1fr',
      alignItems: 'stretch',
      padding: 0,
      // Must keep its own width at the head of the row, not be squeezed by the
      // filter run that follows it.
      flex: '0 0 auto',

      '& .MuiToggleButtonGroup-grouped': {
        border: 0,
        /* `100%` of the track, not `auto`. A grid item stretches by default, but MUI's
           own `grouped` rule sets an explicit width and this has to win it. `minWidth`
           stays as the floor for a two-segment Var 1 pill. */
        width: '100%',
        minWidth: '32px',
        height: 'auto',
        /* MUI collapses grouped buttons with `marginLeft: -1px`, which is why the 4px
           `gap` above has always drawn as 3. Harmless while the segments were ragged
           anyway; under equal columns it offsets two of the three by a pixel against
           their own track, which is exactly the kind of thing this change is meant to
           remove. */
        marginLeft: '0 !important',
        alignSelf: 'stretch',
        borderRadius: '7px !important',
      },
    },
  },

  scheduleGroupingToggleBtn: {
    '&.MuiButtonBase-root': {
      display: 'inline-flex',
      alignItems: 'center',
      /* Explicit, now that the segment is wider than its content: the glyph and the
         word centre in the track together, so the three labels sit on one rhythm
         instead of each hugging its own left edge. */
      justifyContent: 'center',
      gap: '6px',
      padding: '0 10px',
      fontSize: '12px',
      fontWeight: 500,
      textTransform: 'none',
      whiteSpace: 'nowrap',
      color: theme.palette.textPlaceholder,
      border: '1px solid transparent',
      /* The glyphs are drawn from a mix of stroked and filled paths, so both are
         re-pointed at `currentColor` — otherwise a segment's icon keeps its
         exported colour while its label follows the selected state. */
      '& svg': {
        width: '16px',
        height: '16px',
      },
      '& svg path[stroke]': {
        stroke: 'currentColor',
      },
      '& svg path[fill]': {
        fill: 'currentColor',
      },
      '&:hover': {
        backgroundColor: theme.palette.borderSubtle2,
      },
      /* The selected segment as its own white pill lifted off the grey track — the
         same treatment the view toggle uses, and the whole "active" signal, which is
         why the weight does not change with it. */
      '&&.Mui-selected': {
        backgroundColor: theme.palette.surfaceWhite,
        color: theme.palette.textPrimary,
        border: `1px solid ${theme.palette.borderSubtle1}`,
        boxShadow: '0px 1px 2px 0px rgba(16, 24, 40, 0.10)',
        '&:hover': {
          backgroundColor: theme.palette.surfaceWhite,
        },
      },
    },
  },

  scheduleCreateButton: {
    '&.MuiButtonBase-root': {
      minWidth: 'auto',
      height: '32px',
      padding: '0 10px',
      borderRadius: '8px',
      color: theme.palette.textBrand,
      fontSize: '12px',
      fontWeight: 600,
      lineHeight: '18px',
      textTransform: 'none',
      '&:hover': {
        background: theme.palette.surfaceBrand,
        color: theme.palette.textOnColor,
        boxShadow: 'none',
      },
      '&:hover svg path': {
        stroke: `${theme.palette.textOnColor} !important`,
      },
      '& .MuiButton-startIcon': {
        marginLeft: 0,
        marginRight: '6px',
        '& svg': {
          width: '10px',
          height: '10px',
        },
      },
      '& .MuiButton-endIcon': {
        marginLeft: '4px',
        marginRight: 0,
        '& svg': {
          width: '18px',
          height: '18px',
        },
      },
    },
  },

  /* Unrouted demand. This one is *meant* to be alert-coloured — it counts work
     nobody is coming for. */
  scheduleAssignmentActionButton: {
    '&.MuiButtonBase-root': {
      ...TOOLBAR_PILL,
      background: theme.palette.surfaceAlertSubtle,
      borderColor: theme.palette.surfaceAlertSubtle,
      color: theme.palette.textAlert,
      '&:hover': {
        background: theme.palette.surfaceAlertSubtle,
        borderColor: theme.palette.surfaceAlertSubtle,
      },
    },
  },

  /* No `scheduleQuickFilterButton` any more — the Companies-with-Visits toggle it
     shaped is gone, because that filter is now the reading rather than an option.
     See the note on `showOnlyScheduledSites` in `calendar/index.jsx`. */

  /* The committed pick used to be a chip *beside* the field, and this row has no
     room for one: its children sum to its full width, so the sibling wrapped the
     filters onto a second line and pushed the grid down 28px. `CompanySiteSearch`
     now states the selection inside the field, which costs no width — so the pair
     needs no wrapper here and no styles of its own. */

  /* Keeps the design system's primary variant — colour, radius, type and hover are
     all the theme's, because this is still the page's one green CTA and it should
     not become a bespoke button just because it changed rows.

     Height is the one override. The primary variant is 36px, and this button now
     stands in the grid's toolbar between the date navigator and the Day/Week/Month
     toggle, a row built on 32px controls — at 36px it was the tallest thing in the
     row and set the row's height on its own, so the toggles either side of it sat
     visibly short of its edges. 32px matches the two segmented groups it neighbours
     rather than the header row it came from. */
  /* Ghost, and deliberately the *same* ghost as `forecastingButton` beside it: no
     fill, no border, no shadow, `textSecondary1`, and the same faint brand wash on
     hover. The two are the header row's pair of actions, so matching them is the
     point — the row's only colour belongs to the assignment pill, which is the one
     thing there reporting a problem. */
  scheduleHarmonizeButton: {
    '&.MuiButton-root': {
      height: '32px',
      borderRadius: '8px',
      fontSize: '12px',
      boxShadow: 'none',
      border: 'none',
      textTransform: 'none',
      color: theme.palette.textSecondary1,
      whiteSpace: 'nowrap',
      '&:hover': {
        boxShadow: 'none',
        border: 'none',
        backgroundColor: '#146dff0a',
      },
      /* Disabled still has to read as disabled without a fill to dim — the label and
         glyph drop to the placeholder grey together. */
      '&.Mui-disabled': {
        color: theme.palette.textPlaceholder,
        opacity: 0.6,
      },
      '& .MuiButton-startIcon': {
        marginRight: '8px',
      },
      '& .MuiButton-startIcon svg': {
        width: '16px',
        height: '16px',
      },
    },
  },

  scheduleAssignmentActionSkeleton: {
    '&.MuiSkeleton-root': {
      width: '172px',
      height: '28px',
      borderRadius: '60px !important',
      transformOrigin: 'none',
      transform: 'none',
    },
  },

  forecastingButton: {
    '&.MuiButton-root': {
      width: '110px',
      maxWidth: '110px',
      height: '32px',
      borderRadius: '8px',
      fontSize: '12px',
      boxShadow: 'none',
      border: 'none',
      textTransform: 'none',
      color: theme.palette.textSecondary1,
      whiteSpace: 'nowrap',
      '&:hover': {
        boxShadow: 'none',
        border: 'none',
        backgroundColor: '#146dff0a',
      },
      '& .MuiButton-startIcon': {
        marginRight: '8px',
        '& .MuiSvgIcon-root': {
          fontSize: '18px',
        },
      },
    },
  },

  scheduleCalendarAlertSkeleton: {
    '&.MuiSkeleton-root': {
      width: '230px',
      height: '26px',
      borderRadius: '20px !important',
      transformOrigin: 'none',
      transform: 'none',
    },
  },

  /* ---------- selection mode ----------
     Painted from data attributes stamped at mount, because FullCalendar caches
     event content and will not re-render it for a prop change. Global so the
     rules reach the event harness FullCalendar owns.

     The state lives on the harness; the *drawing* has to happen on the card. The
     harness is the full 142x80 grid slot and the card sits 8px inside it, so the
     previous rules — a checkbox at `top: 5px, left: 4px` of the harness and an
     `outline` on the harness — put the tick 4px above and left of the card, close
     enough to the row divider to read as belonging to the row above, and ringed
     8px of empty margin instead of the card. The companion rule meant to make room
     for the tick (`& > * { padding-left: 20px }`) targeted FullCalendar's own inner
     wrapper, which resets its padding, so it never applied and the tick had nothing
     to sit in. Both now hang off `[data-visit-card]`. */
  '@global': {
    '[data-selectable="true"][data-selecting="true"]': {
      cursor: 'pointer',
      '& [data-visit-card]': {
        position: 'relative',
        /* 8px gutter + 14px control + 8px breathing room. The card's own 8px left
           padding is inside this, so content clears the tick without touching it. */
        paddingLeft: '30px !important',
      },
      '& [data-visit-card]::before': {
        content: '""',
        position: 'absolute',
        /* Centred on the card's first line — 6px of padding plus a 12px line
           leaves a 14px control sitting at 5px. It was 7px against a header row
           the 20px status icon had inflated to 20px; that row is 12px now. */
        top: 5,
        left: 8,
        width: 14,
        height: 14,
        boxSizing: 'border-box',
        borderRadius: 3,
        border: `1.5px solid ${theme.palette.borderSubtle2}`,
        background: theme.palette.surfaceWhite,
        zIndex: 5,
      },
    },
    /* Not selectable, and it has to look it. Harmonize moves work, so a completed
       or cancelled visit is not a candidate — without this it looked identical to
       a pickable card and simply ignored the click. Recessive rather than hidden:
       the visit is still part of the week being planned around, and clicking it
       still opens its drawer. */
    '[data-selecting="true"][data-selectable="false"] [data-visit-card]': {
      opacity: 0.45,
      filter: 'grayscale(35%)',
    },

    '[data-selectable="true"][data-selecting="true"][data-selected="true"]': {
      '& [data-visit-card]': {
        outline: `2px solid ${theme.palette.surfaceBrand}`,
        outlineOffset: 1,
      },
      '& [data-visit-card]::before': {
        background: theme.palette.surfaceBrand,
        borderColor: theme.palette.surfaceBrand,
      },
      '& [data-visit-card]::after': {
        content: '""',
        position: 'absolute',
        top: 8.5,
        left: 11,
        width: 7,
        height: 3.5,
        borderLeft: `2px solid ${theme.palette.surfaceWhite}`,
        borderBottom: `2px solid ${theme.palette.surfaceWhite}`,
        transform: 'rotate(-45deg)',
        zIndex: 6,
      },
    },

    /* Month grid's today marker lives in `calendar.styles.js` now (search
       `data-schedule-today` there), franchise-timezone-aware via a marker
       `ScheduleCalendarGrid` stamps from `dayjsWithTimezone()`. This file used
       to carry its own unconditional green wash on FC's browser-local
       `aria-current="date"]`, painted regardless of whether the franchise
       agreed it was today — which both fought the franchise-aware rule on the
       rare day they disagreed, and, on every ordinary day they didn't, stacked
       a second green treatment under the other file's marker. One system, one
       file. */

    /* Harmonize preview. The drawer proposes; the calendar shows it happening
       before anything is written. Visits changing day fade where they sit, the
       ones that spilled grey out, and the destination columns are tinted — so
       Apply confirms a picture the planner has already been watching. */
    '[data-visit-id][data-harmonizing="leaving"]': {
      opacity: 0.4,
      outline: `1.5px dashed ${theme.palette.surfaceBrand}`,
      outlineOffset: -1,
      borderRadius: 4,
      transition: 'opacity 180ms ease',
    },
    '[data-visit-id][data-harmonizing="spilling"]': {
      opacity: 0.32,
      filter: 'grayscale(1)',
      transition: 'opacity 180ms ease',
    },
    '[data-date][data-harmonize-target="landing"]': {
      background: `${theme.palette.surfaceBrandSubtle} !important`,
      boxShadow: `inset 0 2px 0 ${theme.palette.surfaceBrand}`,
    },
    '[data-date][data-harmonize-target="overflow"]': {
      background: `${theme.palette.surfaceGreySubtle} !important`,
    },
  },

  /* ---------- Apply, on the grid ----------
     The drawer closes and this is where the plan arrives. Two beats, driven by
     `useApplyMotion` and switched by one `data-applying` attribute per card.

     **settling** — every visit card, not just the movers. The schedule is being
     recomputed; marking only the movers would assert the outcome before showing it,
     and it would send the eye hunting for which cards are about to change instead
     of watching them change. Dimmed and desaturated with a slow pulse: still
     legible, just not current.

     **landing** — the moved cards are on their new days and rise into place, each
     delayed by its position in its route (set inline, because twelve stagger
     classes to express one multiplication is not a stylesheet), so a day fills top
     to bottom rather than appearing all at once. Cards that did not move come out
     of the pulse with no animation at all, because nothing happened to them.

     **These rules are a scoped class, not `@global`,** even though the cards they
     target are FullCalendar's and are reached by descendant selector. `$applySettle`
     only resolves to the generated keyframes name in a normal rule — inside
     `@global` it is passed through as a literal, and the animation silently never
     runs. The wrapper carrying this class is `scheduleCalendarFull`, added only
     while the sequence is running, which also means these selectors cost nothing
     the rest of the time.

     Opacity, transform and filter only. A grid full of cards animating width or
     height is the one thing that would make this janky rather than impressive. */
  applyingGrid: {
    '& [data-visit-id][data-applying="settling"]': {
      opacity: 0.55,
      filter: 'grayscale(0.85)',
      animation: '$applySettle 1100ms ease-in-out infinite',
    },
    '& [data-visit-id][data-applying="landing"]': {
      animation: '$applyLand 380ms cubic-bezier(0.2, 0.8, 0.2, 1) both',
    },
  },
  '@keyframes applySettle': {
    '0%, 100%': { opacity: 0.42 },
    '50%': { opacity: 0.68 },
  },
  /* Up and in, with a touch of scale — a card arriving on this day is a different
     event from a card that was already here being redrawn. */
  '@keyframes applyLand': {
    from: { opacity: 0, transform: 'translateY(10px) scale(0.96)' },
    to: { opacity: 1, transform: 'translateY(0) scale(1)' },
  },

  /* The relocation is the information; the pulse and the stagger are the telling of
     it. `useApplyMotion` skips both beats for these readers and simply moves the
     visits — this is the belt to that braces. */
  '@media (prefers-reduced-motion: reduce)': {
    applyingGrid: {
      '& [data-visit-id][data-applying="settling"]': { animation: 'none', opacity: 0.6 },
      '& [data-visit-id][data-applying="landing"]': { animation: 'none' },
    },
  },
}));
