import { Box, Menu, MenuItem, Tooltip, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import {
  ChevronDown,
  SlidersIcon,
} from 'src/app/obx/pages/schedules/components/harmonize/components/Glyphs';

import { HARMONIZE_SHELL, HARMONIZE_SHELL_LABELS } from '../config/harmonizeShell';
import { SCHEDULER_LAYOUT } from '../config/schedulerLayout';
import { VISIT_VIEW_VARIANT } from '../config/visitViewVariant';

/**
 * Every review switch on this page, in **one** menu.
 *
 * ## What this replaces, and why three pills became one control
 *
 * There were three segmented pills stacked in the same floating shell —
 * `HarmonizeShellSwitch` (Workspace / Drawer / Split), `VisitVariantSwitch` (V1 / V2) and
 * `SchedulerLayoutSwitch` (Var 1 / Var 2). Six of those eight segments were labelled with
 * an index rather than a name, so the row read as three unrelated dials and the only way
 * to find out what any of them did was to hover for a tooltip or press it and watch. Asked
 * to fix exactly that: *"it's confusing to navigate through versions … plug them into a
 * single menu and give them one or two descriptive names so that I know what I am
 * clicking and what I'm trying to view."*
 *
 * So the presentation collapses and **the three config modules do not**. Each still owns
 * its enum, its default, its storage key and its validating read/write pair; this component
 * only asks the three questions in one place. That matters because they retire separately —
 * when a decision lands, its group is deleted from `OPTION_GROUPS` and its module goes with
 * it, and the menu keeps working with two groups or one.
 *
 * ## Four levels, in descending weight
 *
 * The first cut had the group heading in the *lightest* grey on the panel, under option
 * names that were darker and larger — so the question read as a caption on the answers
 * rather than as the thing that governed them. The ramp now runs the way the structure
 * does:
 *
 * | | | |
 * |---|---|---|
 * | note strip | 12px `textSecondary3` on grey | what this whole panel is |
 * | group heading | 12px/500 `textSecondary1`, with a mark | the question |
 * | option name | 14px/500 `textPrimary`, brand when live | the answer |
 * | hint | 12px `textSecondary3` | what that answer does |
 *
 * Options also **indent to their heading's text**, so the group reads as a parent with
 * children rather than as four sibling lines that happen to be adjacent, and the mark in
 * the heading's icon column gives each question a shape you can aim at on the second visit
 * instead of re-reading all three.
 *
 * ## The heading is the start of the sentence
 *
 * "Harmonize opens · Workspace", "Each visit shows · The site scheduler card",
 * "Companies live · On the grid toggle". Every group heading is a subject and verb that its
 * options complete, which is what makes an option legible *without* its hint — the hint
 * then only has to say what the choice produces. It also settles what the earlier headings
 * left open: "Visit card" and "Companies" were bare nouns, and a bare noun beside a list
 * does not say whether you are choosing a thing or choosing what happens to it.
 *
 * ## The labels are names now, not indices
 *
 * `V1`/`V2` and `Var 1`/`Var 2` were each argued for on the grounds that they are the words
 * the *conversation* uses, and that a descriptive label here would leave the control and the
 * discussion about it using different words. That argument holds for a pill with two
 * segments and one line of room. It does not survive a menu, which has room for the name
 * *and* the description on separate lines — so the index goes alongside where anyone who
 * thinks in V1/V2 can still find it, and the name leads.
 *
 * ## Why the first cut was ~700px tall, and what fixed it
 *
 * Every `Typography` in here asked for 12–14px through a `makeStyles` spread and got
 * **16px/400**: JSS injects before emotion in this app, so `.MuiTypography-root` outranks a
 * `makeStyles` class of equal specificity. Nothing errored — the menu just rendered at body
 * size, every hint wrapped onto a second and third line, and the panel grew until it filled
 * most of the viewport. Every rule below is wrapped in `'&&'` (0-2-0) for that reason, and
 * every typography spread comes **before** its colour, because the tokens in
 * `src/theme/typography.js` all carry `color: '#000'`.
 *
 * With the type at its intended size the rest is arithmetic: a fixed 316px paper, hints
 * written short enough to hold **one** line inside it, and the row that can still overflow
 * clipped to an ellipsis with the full sentence on `title` rather than allowed to wrap. A
 * row is 40px and cannot become 60px because someone lengthened a sentence.
 *
 * ## Shape
 *
 * A menu rather than three pills also fixes the thing that made the pills expensive: they
 * were permanently on screen, in the corner of every screenshot of the grid. This is one
 * 32px pill that opens on demand, and it opens *upward* — it is anchored above the footer
 * at the bottom of the viewport, and a downward menu would fall off the screen.
 */

/**
 * A group's mark: 13px, one path, drawn in this file for the reason `CheckGlyph` gives.
 *
 * They are diagrams of the thing being chosen — a split pane, a card, a building — not
 * decoration. A shape is what makes a section findable on the second visit; three headings
 * in the same grey are not.
 */
const ShellMark = ({ className }) => (
  <svg className={className} viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <rect
      x="2.25"
      y="3.25"
      width="11.5"
      height="9.5"
      rx="1.5"
      stroke="currentColor"
      strokeWidth="1.3"
    />
    <path d="M6.75 3.5v9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
  </svg>
);

const CardMark = ({ className }) => (
  <svg className={className} viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <rect
      x="2.25"
      y="3.75"
      width="11.5"
      height="8.5"
      rx="1.5"
      stroke="currentColor"
      strokeWidth="1.3"
    />
    <path
      d="M4.75 6.75h4.5M4.75 9.5h3"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
    />
  </svg>
);

const CompanyMark = ({ className }) => (
  <svg className={className} viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path
      d="M3 13V3.8c0-.44.36-.8.8-.8h3.9c.44 0 .8.36.8.8V13M8.5 13V7h3.7c.44 0 .8.36.8.8V13M2 13.2h12M5.25 5.75h1M5.25 8.25h1M10.5 9.5h1"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const markPropTypes = { className: PropTypes.string };
const markDefaults = { className: undefined };
ShellMark.propTypes = markPropTypes;
ShellMark.defaultProps = markDefaults;
CardMark.propTypes = markPropTypes;
CardMark.defaultProps = markDefaults;
CompanyMark.propTypes = markPropTypes;
CompanyMark.defaultProps = markDefaults;

/**
 * The questions, in the order a reviewer meets them.
 *
 * `hint` is the one-line version that renders; `detail` is the retired pill's own tooltip
 * sentence, kept on `title` so the longer wording is still a hover away. `index` is that
 * pill's own label.
 */
const OPTION_GROUPS = [
  {
    key: 'harmonizeShell',
    /* Named for what the choice *does* rather than for the thing being chosen. "Harmonize
       shell" is the internal word and means nothing until you already know the answer. */
    heading: 'Harmonize opens',
    Mark: ShellMark,
    options: [
      {
        value: HARMONIZE_SHELL.WORKSPACE,
        label: HARMONIZE_SHELL_LABELS[HARMONIZE_SHELL.WORKSPACE],
        hint: 'Full screen · one route day',
        detail: 'Full screen · one route day · radius from the start point',
      },
      {
        value: HARMONIZE_SHELL.DRAWER,
        label: HARMONIZE_SHELL_LABELS[HARMONIZE_SHELL.DRAWER],
        hint: 'Over the grid · one zone a day',
        detail: 'Side drawer over the grid · one zone per worked day',
      },
      {
        value: HARMONIZE_SHELL.SPLIT,
        label: HARMONIZE_SHELL_LABELS[HARMONIZE_SHELL.SPLIT],
        hint: 'Two columns · map of every zone',
        detail: 'Two columns · the drawer’s flow beside a map of every zone',
      },
    ],
  },
  {
    key: 'visitCard',
    heading: 'Each visit shows',
    Mark: CardMark,
    options: [
      {
        value: VISIT_VIEW_VARIANT.V1,
        label: 'The current card',
        index: 'V1',
        hint: 'Time and status, then the site',
        detail: 'Time and status, then site and filter count',
      },
      {
        value: VISIT_VIEW_VARIANT.V2,
        label: 'The site scheduler card',
        index: 'V2',
        hint: 'Time and visit, tour, runsheet',
        detail: 'Time and visit, then tour, then runsheet and status',
      },
    ],
  },
  {
    key: 'schedulerLayout',
    heading: 'Companies live',
    Mark: CompanyMark,
    options: [
      {
        value: SCHEDULER_LAYOUT.TABBED_COMPANIES,
        label: 'In their own tab',
        index: 'Var 1',
        hint: 'A schedule tab, day to year',
        detail: 'Companies stays a schedule tab with day, week, month and year views',
      },
      {
        value: SCHEDULER_LAYOUT.UNIFIED_TOGGLE,
        label: 'On the grid toggle',
        index: 'Var 2',
        hint: 'Joins routes and visits',
        detail: 'No companies tab — the company timeline joins routes and visits',
      },
    ],
  },
];

/* Rows start where their heading's text starts: 12px of paper, a 13px mark, 6px of gap. */
const ROW_INDENT = 31;

const useStyles = makeStyles((theme) => ({
  /**
   * The trigger, wearing the retired pills' own geometry.
   *
   * 32px tall, `surfaceGreySubtle` track, 8px radius — the same segmented-pill dimensions
   * `HarmonizeShellSwitch` and its two neighbours shared, so replacing three of them with
   * this changes what the corner *says* and not how it sits. Copied by value for the reason
   * that whole chain gives: these are temporary review controls and a shared class they
   * could edit would be a route for an experiment to restyle the toolbar around it.
   */
  trigger: {
    '&&': {
      height: '32px',
      display: 'flex',
      alignItems: 'center',
      gap: '7px',
      padding: '0 10px 0 12px',
      border: 'none',
      borderRadius: '8px',
      background: theme.palette.surfaceGreySubtle,
      color: theme.palette.textSecondary1,
      cursor: 'pointer',
      flex: '0 0 auto',
      transition: 'background 120ms ease, color 120ms ease',
      '&:hover': { background: theme.palette.borderSubtle2, color: theme.palette.textPrimary },
      '&:focus-visible': { outline: `2px solid ${theme.palette.borderBrand}`, outlineOffset: 2 },
    },
  },
  /* Held in its hover state for as long as its menu is open, so the pill and the panel read
     as one object rather than as a panel floating over an idle button. */
  triggerOpen: {
    '&&': { background: theme.palette.borderSubtle2, color: theme.palette.textPrimary },
  },
  /* Sized down from the icon set's own 20px so it rides the 14px label's line rather than
     overshooting it — the adjustment `sectionActionIcon` makes next door, for the same reason. */
  triggerIcon: { '&&': { width: 15, height: 15, flex: '0 0 auto', display: 'block' } },
  triggerLabel: {
    '&&': { ...theme.typography.subtitle2, color: 'inherit', whiteSpace: 'nowrap' },
  },
  /**
   * The caret, which points at where the panel will be.
   *
   * Up while closed — this menu opens upward — and it turns down as the panel appears, so
   * the arrow always points at the direction the next press moves things.
   */
  triggerCaret: {
    '&&': {
      width: 11,
      height: 11,
      flex: '0 0 auto',
      display: 'block',
      transform: 'rotate(180deg)',
      transition: 'transform 140ms ease',
    },
  },
  triggerCaretOpen: { '&&': { transform: 'rotate(0deg)' } },

  /**
   * One fixed width, not a min/max range.
   *
   * 316px is the width the longest hint was written to fit on a single line. A range would
   * let the paper size itself off whichever group happens to be visible, and the same option
   * would sit at a different width depending on which decisions had already retired.
   */
  paper: {
    '&.MuiPaper-root': {
      width: 316,
      marginBottom: '8px',
      borderRadius: 10,
      border: `1px solid ${theme.palette.borderSubtle1}`,
      overflow: 'hidden',
      /* The app's own menu lift. Not a second shadow language for a control that opens over
         the same grid every other menu on this page opens over. */
      boxShadow: '0px 4px 16px rgba(16, 24, 40, 0.12)',
    },
  },
  list: { '&.MuiList-root': { padding: '4px 0' } },

  /**
   * What the panel is, said on the panel.
   *
   * The trigger carries a tooltip with this sentence, but a tooltip only answers the
   * question before you commit — once the menu is open the hover is gone and eight
   * unfamiliar option names are the only thing on screen. A 26px strip is the cheapest
   * place to say "none of this ships" and it is why the groups below need no such warning
   * each. It does not repeat the trigger's own words: the button says what it opens, this
   * says who it is for.
   */
  note: {
    '&&': {
      ...theme.typography.body3,
      color: theme.palette.textSecondary3,
      lineHeight: '16px',
      display: 'block',
      padding: '6px 12px',
      background: theme.palette.surfaceGreySubtle,
      borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
    },
  },

  /**
   * A group's question — a heading, not a small-caps label.
   *
   * `subtitle3` in `textSecondary1`, sentence case, with its mark in the column the options
   * indent past. The 10px uppercase letterspaced treatment is a convention this product does
   * not use, and the drawer's own `sectionHeading` note records rejecting it for exactly this
   * job: the most structural text on a panel should not also be the smallest.
   */
  heading: {
    '&&': {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      padding: '7px 12px 4px',
    },
  },
  headingMark: {
    '&&': {
      width: 13,
      height: 13,
      flex: '0 0 auto',
      display: 'block',
      color: theme.palette.textSecondary3,
    },
  },
  headingText: {
    '&&': {
      ...theme.typography.subtitle3,
      color: theme.palette.textSecondary1,
      lineHeight: '16px',
    },
  },
  /* Between groups only, never above the first — a rule under the note's own edge would
     read as chrome rather than as a divider. */
  headingDivided: {
    '&&': {
      marginTop: 4,
      paddingTop: 9,
      borderTop: `1px solid ${theme.palette.borderSubtle1}`,
    },
  },

  /**
   * A 40px row: an 18px name over a 16px hint, 3px of air above and below.
   *
   * The two lines are one block with no gap between them — a name and its own description
   * are a single object, and spacing them apart makes seven rows read as fourteen. The left
   * padding is the heading's text position, so the answers sit under the question.
   */
  item: {
    '&&': {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      padding: `3px 10px 3px ${ROW_INDENT}px`,
      whiteSpace: 'normal',
      /* Hover owns the only fill in the list. The live option is already saying so twice —
         a brand-blue name and a tick — and a third signal, a wash on three of seven rows,
         banded the panel without telling anyone anything new. Selected is therefore pinned
         back to transparent against MUI's own `Mui-selected` grey, which would otherwise
         read as a permanent hover. */
      '&:hover': { background: theme.palette.surfaceGreySubtle },
      '&.Mui-selected': { background: 'transparent' },
      '&.Mui-selected:hover, &.Mui-selected:focus': {
        background: theme.palette.surfaceGreySubtle,
      },
    },
  },
  itemText: { '&&': { minWidth: 0, flex: '1 1 auto' } },
  itemLabelRow: { '&&': { display: 'flex', alignItems: 'baseline', gap: 6, minWidth: 0 } },
  itemLabel: {
    '&&': {
      ...theme.typography.subtitle2,
      color: theme.palette.textPrimary,
      lineHeight: '18px',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
  },
  itemLabelOn: { '&&': { color: theme.palette.textBrand } },
  /* The retired pill's own label, kept for anyone who thinks in V1/V2 — quiet, because the
     name beside it is now the thing being read. */
  itemIndex: {
    '&&': {
      ...theme.typography.body3,
      color: theme.palette.textSecondary3,
      lineHeight: '18px',
      fontVariantNumeric: 'tabular-nums',
      flex: '0 0 auto',
    },
  },
  /**
   * Clipped, never wrapped.
   *
   * The full sentence is on the row's `title`, so an over-long hint costs a hover rather
   * than a second line — which is the failure that made this panel fill the viewport.
   */
  itemHint: {
    '&&': {
      ...theme.typography.body3,
      color: theme.palette.textSecondary3,
      lineHeight: '16px',
      display: 'block',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
  },
  /**
   * The check column, which is always present.
   *
   * A 16px box reserved on every row whether or not it holds a mark, so selecting a
   * different option cannot shift the text by the width of a tick. It sits on the right:
   * on the left it pushed every label in by 25px and cost the hints the line they now fit on.
   */
  check: {
    '&&': {
      width: 16,
      height: 16,
      flex: '0 0 auto',
      display: 'grid',
      placeItems: 'center',
      color: theme.palette.textBrand,
    },
  },
  checkGlyph: { '&&': { width: 13, height: 13, display: 'block' } },
}));

/** The tick, inline rather than from the icon set: one 13px path against six imports. */
const CheckGlyph = ({ className }) => (
  <svg className={className} viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path
      d="M13.5 4.5 6.5 11.5 2.5 7.5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

CheckGlyph.propTypes = { className: PropTypes.string };
CheckGlyph.defaultProps = { className: undefined };

const ReviewOptionsMenu = ({ values, onChange, hiddenGroups }) => {
  const classes = useStyles();
  const [anchor, setAnchor] = useState(null);
  const open = Boolean(anchor);

  /* A group whose choice cannot mean anything here is dropped rather than disabled: the
     visit-card variant only says something over a grid of visit cards, and a greyed-out row
     invites the click it is going to refuse. */
  const groups = OPTION_GROUPS.filter((group) => !hiddenGroups.includes(group.key));
  if (!groups.length) return null;

  return (
    <>
      <Tooltip title="Reviewer options — not shown to tenants" placement="top" arrow>
        <Box
          component="button"
          type="button"
          className={`${classes.trigger} ${open ? classes.triggerOpen : ''}`}
          onClick={(event) => setAnchor(event.currentTarget)}
          aria-haspopup="true"
          aria-expanded={open}
        >
          <SlidersIcon className={classes.triggerIcon} />
          <Typography component="span" className={classes.triggerLabel}>
            Review options
          </Typography>
          <ChevronDown
            className={`${classes.triggerCaret} ${open ? classes.triggerCaretOpen : ''}`}
          />
        </Box>
      </Tooltip>

      <Menu
        open={open}
        anchorEl={anchor}
        onClose={() => setAnchor(null)}
        /* Opens upward. The trigger is pinned just above the grid's footer at the bottom of
           the viewport, so a menu growing downward would open off the bottom of the screen. */
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        transformOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        slotProps={{ paper: { className: classes.paper } }}
        MenuListProps={{ className: classes.list, dense: true, 'aria-label': 'Review options' }}
      >
        <Typography component="span" className={classes.note}>
          Reviewer options — not shown to tenants
        </Typography>

        {groups.map((group, groupIndex) => [
          <Box
            key={`${group.key}-heading`}
            className={`${classes.heading} ${groupIndex ? classes.headingDivided : ''}`}
          >
            <group.Mark className={classes.headingMark} />
            <Typography component="span" className={classes.headingText}>
              {group.heading}
            </Typography>
          </Box>,

          ...group.options.map((option) => {
            const selected = values[group.key] === option.value;
            return (
              <MenuItem
                key={`${group.key}-${option.value}`}
                className={classes.item}
                /* A radio, because that is what the group is: one answer, always exactly one.
                   `selected` alone announces "selected" without saying what it is one of. */
                role="menuitemradio"
                aria-checked={selected}
                selected={selected}
                title={option.detail}
                disableRipple
                onClick={() => {
                  /* Choosing the option already chosen is a no-op rather than a write. The
                     retired pills each carried a null guard for the same reason — clicking
                     the live segment must not be able to leave the value unset. */
                  if (!selected) onChange(group.key, option.value);
                  setAnchor(null);
                }}
              >
                <Box className={classes.itemText}>
                  <Box className={classes.itemLabelRow}>
                    <Typography
                      component="span"
                      className={`${classes.itemLabel} ${selected ? classes.itemLabelOn : ''}`}
                    >
                      {option.label}
                    </Typography>
                    {option.index ? (
                      <Typography component="span" className={classes.itemIndex}>
                        {option.index}
                      </Typography>
                    ) : null}
                  </Box>
                  <Typography component="span" className={classes.itemHint}>
                    {option.hint}
                  </Typography>
                </Box>
                <Box className={classes.check} aria-hidden="true">
                  {selected ? <CheckGlyph className={classes.checkGlyph} /> : null}
                </Box>
              </MenuItem>
            );
          }),
        ])}
      </Menu>
    </>
  );
};

ReviewOptionsMenu.propTypes = {
  /** Keyed by group: `{ harmonizeShell, visitCard, schedulerLayout }`. */
  values: PropTypes.object.isRequired,
  /** `(groupKey, value)` — the page owns the writes, as it did with the three pills. */
  onChange: PropTypes.func.isRequired,
  /** Group keys that cannot mean anything on the current surface. */
  hiddenGroups: PropTypes.arrayOf(PropTypes.string),
};

ReviewOptionsMenu.defaultProps = { hiddenGroups: [] };

export default ReviewOptionsMenu;
