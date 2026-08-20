import CancelIcon from '@mui/icons-material/Cancel';
import { Autocomplete, Box, Chip, InputAdornment, TextField } from '@mui/material';
import { makeStyles } from '@mui/styles';
import PropTypes from 'prop-types';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
/* The app's own glyph rather than `@mui/icons-material/Search`: the spec asks for a
   20px stroked mark at 1.66667px, and a Material icon is a filled path — there is
   no stroke on it to set a width on. This is the same drawing the rest of the
   product's search fields use. */
import { Search as SearchIcon } from 'src/assets/svg/index';

/**
 * One search box for both visit surfaces: **company first, then its locations**.
 *
 * The two tabs asked the same question of their data — "where is Walmart" — and
 * answered it two different ways: the week grid filtered rows on raw text with no
 * feedback, and the Companies tab had a pair of dropdowns you had to know the
 * parent to use. This is the single control both now render: type any part of a
 * company or a location, get one row per answer naming the company and the building
 * together, and the letters you have typed marked in whichever of the two matched.
 *
 * Focusing it before typing anything shows the last few things this planner picked,
 * on either tab — the question "where is Walmart" does not change when the surface
 * does.
 *
 * It is deliberately *not* a filter dropdown. A filter states a set; this states a
 * destination — the planner is looking for one customer or one building, and the
 * grid narrows to it.
 */
const useStyles = makeStyles((theme) => ({
  root: {
    /* 196px, down from 248px. The width lives on the Autocomplete root and not on
       the field inside it so that a consumer overriding it through `className` still
       moves the whole control — the Companies tab does exactly that. */
    '&.MuiAutocomplete-root': {
      width: '196px',
      flex: '0 0 auto',
    },
    '& .MuiFormControl-root': { margin: 0 },

    /**
     * Tripled selector, stated once here for everything that shapes the field.
     *
     * Two other sheets already claim these exact properties at up to 0-3-0: the app
     * registers its TextField overrides under `MuiOutlinedInput` (so `min-width:
     * 220px`, `padding: 10px 14px` and a 16px/24px input are themed defaults on this
     * element), and MUI's own Autocomplete sheet pins `padding: 6px` for
     * `size="small"`. Emotion injects both *after* this JSS sheet, so a rule that
     * merely ties loses on order alone — the trap the Companies tab's date range
     * documents, one specificity step further along.
     */
    '&&& .MuiInputBase-root': {
      boxSizing: 'border-box',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      height: '36px',
      /* 8px rather than the spec's 10px. 10 + a 20px line + 10 is 40px and the spec
         states 36px in the same breath; the height is the number the toolbar row has
         to live with, so it is the one kept — and with `border-box` a 10px pad would
         have been squeezed back to this anyway. */
      padding: '8px 14px',
      /* The themed 220px floor was slack at 248px and would shove the field straight
         out of its own root at 196px. */
      minWidth: 0,
      borderRadius: '8px',
      background: theme.palette.surfaceWhite,
      fontSize: '14px',
      fontWeight: 500,
      lineHeight: '20px',
    },
    /* Room for the clear button, and only while there is text to clear: it is
       positioned rather than laid out, so it takes no part in the row's `gap` and
       would otherwise sit on top of a long query. The resting field — the one the
       spec draws — keeps its symmetric 14px. */
    '&&&.MuiAutocomplete-hasClearIcon .MuiInputBase-root': { paddingRight: '30px' },
    '&&& .MuiInputBase-input': {
      padding: 0,
      /* Restated rather than inherited because the theme states 16px/24px on the
         input element itself, which beats anything set on the row above it. */
      fontSize: '14px',
      fontWeight: 500,
      lineHeight: '20px',
      '&::placeholder': {
        color: theme.palette.textPlaceholderField,
        fontSize: '14px',
        fontWeight: 500,
        lineHeight: '20px',
        opacity: 1,
      },
    },
    /* Doubled for the same reason as the block above, and this one was already
       losing: the themed outline states `1px solid #D0CFD2` at exactly the weight an
       undoubled rule here carries, so the field has been drawing the theme's grey
       rather than the spec's ever since it was written. Only the colour is claimed —
       the width, and the darker outline the whole app draws on hover, are left to the
       theme. */
    '&& .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.borderSubtle1 },
    '& .MuiAutocomplete-endAdornment svg': { width: '14px', height: '14px' },
  },

  /* The committed pick, worn as the field's value. Capped rather than sized to its
     text: a long "Fairmont Office Tower" must not be the reason the caret has
     nowhere left to sit, so the label ellipsises and the full name is the title. */
  selectionChip: {
    '&.MuiChip-root': {
      height: '24px',
      /* 168px of content, less the 20px icon, two 8px gaps and the 30px minimum MUI
         insists the input keeps, leaves 102px. Anything wider and the caret is the
         thing that gets squeezed out of the field. */
      maxWidth: '96px',
      borderRadius: '60px',
      background: theme.palette.surfaceBrandSubtle1 || 'rgba(20, 109, 255, 0.08)',
      /* Grown with the field: 11px inside a 36px box read as a leftover from the
         28px one it replaced. */
      '& .MuiChip-label': {
        padding: '0 4px 0 8px',
        fontSize: '12px',
        fontWeight: 600,
        lineHeight: '18px',
        color: theme.palette.textBrand,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      },
      '& .MuiChip-deleteIcon': {
        width: '13px',
        height: '13px',
        margin: '0 4px 0 0',
        color: theme.palette.textBrand,
        '&:hover': { color: theme.palette.textBrand },
      },
    },
  },

  /* No margin of its own — the field's 8px `gap` is what spaces the row now, and an
     adornment margin on top of it made 14px. */
  startIcon: {
    '&.MuiInputAdornment-root': { height: '20px', margin: 0 },
    '& svg': { width: '20px', height: '20px', display: 'block' },
    /* The asset ships the spec's grey baked into its `stroke`; restating it as the
       token is what stops a palette change from leaving this one glyph behind. */
    '& svg path': { stroke: theme.palette.surfaceGreyStrong1 },
  },

  popper: {
    /* The panel is wider than the field it hangs off (304 against 196), which is why
       `slotProps.popper` has to opt out of MUI's anchor-width default — see the note
       on it. The paper then fills the popper rather than sizing itself, so the 304px
       is stated in exactly one place. */
    '& .MuiAutocomplete-paper': {
      boxSizing: 'border-box',
      width: '100%',
      marginTop: '4px',
      borderRadius: '8px',
      border: `1px solid ${theme.palette.borderSubtle1}`,
      /* `CustomDropDown`'s own popper shadow, to the value — this is the one
         shadow the app's dropdowns use. */
      boxShadow:
        '0px 4px 6px -2px rgba(16, 24, 40, 0.05), 0px 12px 16px -4px rgba(16, 24, 40, 0.1)',
    },
    '& .MuiAutocomplete-listbox': {
      maxHeight: '320px',
      padding: '4px 0',
    },
  },

  /* One heading survives, and it is over recents. The company headings are gone
     because every row now names its own company (see `renderOption`) — a heading
     that restated the rows underneath it was two answers to one question. What is
     left has a job no row does: it says this list is the planner's own history
     rather than a match on what they typed. */
  group: { listStyle: 'none' },

  groupHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    /* 14px, so the heading and the rows share a left edge. */
    padding: '8px 14px 2px',
    fontSize: '11px',
    fontWeight: 700,
    lineHeight: '16px',
    letterSpacing: '0.4px',
    textTransform: 'uppercase',
    color: theme.palette.textSecondary1,
  },

  groupOptions: { padding: 0, margin: 0, listStyle: 'none' },

  /* Doubled: MUI states the option's own `min-height: 48px; padding: 6px 16px` from
     inside the listbox, which is two classes deep and so exactly as heavy as a single
     `&` here — and its sheet is injected later. Every row in this list was quietly
     being drawn by MUI rather than by the rules below it. */
  option: {
    '&&.MuiAutocomplete-option': {
      boxSizing: 'border-box',
      display: 'flex',
      alignItems: 'center',
      /* The spec's 304px is the panel's width; an item states it as `stretch`
         instead, because the panel spends 1px a side on its border and a row pinned
         to 304 would have been the one thing in there that overflowed. */
      alignSelf: 'stretch',
      gap: '8px',
      minHeight: '40px',
      padding: '10px 14px',
      fontSize: '14px',
      fontWeight: 500,
      lineHeight: '20px',
      color: theme.palette.textSecondary2,
      '&:hover': { backgroundColor: theme.palette.surfaceGreySubtle },
    },
  },

  /* Company and building on one line, in that order, and the company is the half
     that gives way. Consecutive rows repeat it, so a clipped "Fairmont Hospitalit…"
     is still recognisable — whereas clipping the building name, the half that tells
     two rows of the same company apart, would leave a list nobody can pick from.
     Weighted shrink rather than a hard `nowrap` on one side: the building name only
     starts to ellipsise once the company has already given up everything it can. */
  optionCompany: {
    flex: '0 100 auto',
    minWidth: '6ch',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    /* Context, not the answer — the pair has to be ranked or it reads as one very
       long name. This is the one place the row departs from the spec's single ink,
       which describes a single-part row. */
    color: theme.palette.textSecondary3,
  },

  /* The middot is CSS rather than a translated string. The row is assembled from two
     independently highlighted halves, so a `t()` pattern with the separator baked
     into it would have to be split back apart on its own interpolations before
     either half could be styled — and a divider is not something a translator
     restates. */
  optionSeparator: {
    flex: '0 0 auto',
    color: theme.palette.textSecondary3,
    '&::before': { content: '"\\00B7"' },
  },

  optionDetail: {
    flex: '0 1 auto',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  /* The typed letters, in the brand ink. `<mark>`'s own yellow wash is the wrong
     answer inside a 40px row — it reads as a highlighter pen dragged across the whole
     list once every row matches. Applied to either half of the row, so a match on the
     company and a match on the building are marked the same way. */
  match: {
    color: theme.palette.textBrand,
    fontWeight: 700,
    background: 'none',
  },

  /* The same two-tier row language `CustomDropDown` uses everywhere else on this
     screen: a plain grey wash under the pointer, a brand wash on the row the
     keyboard has moved to. They are mutually exclusive by construction — `reason`
     from `onHighlightChange` tells mouse and keyboard apart — rather than by
     relying on which CSS rule happens to win, which is what left this row with no
     visible highlight of either kind before (MUI's own built-in one never engaged
     against this component's custom `renderGroup`/`renderOption`).

     Tripled, one step past the row itself: MUI puts its own grey on `.Mui-focused`,
     which it sets on precisely the row this class is for, and at three classes deep
     that rule outweighed the brand wash meant to replace it. */
  optionActive: {
    '&&&.MuiAutocomplete-option': {
      backgroundColor: theme.palette.surfaceBrandSubtle,
    },
  },
}));

export const COMPANY_SITE_SEARCH_KIND = {
  /** Every location the company holds. */
  COMPANY: 'company',
  /** One building. */
  SITE: 'site',
};

const normalise = (value) => `${value ?? ''}`.trim().toLowerCase();

/** Same identity either side of a pick: what was chosen, and what the list is offering. */
const optionsMatch = (a, b) => {
  if (!a || !b) return false;
  return (
    a.kind === b.kind &&
    `${a.customerId}` === `${b.customerId}` &&
    `${a.siteId ?? ''}` === `${b.siteId ?? ''}`
  );
};

/**
 * Survives a tab round-trip and a reload — recency is exactly the thing a fresh
 * session has no memory of otherwise. Keyed on the control, deliberately not on the
 * surface: both tabs search one book of companies, and a planner who found the
 * Fairmont Office Tower on the Companies tab and then went to the scheduler to look
 * at its week is chasing the same building. Splitting the history in two would make
 * the second lookup start from nothing and store the same entry twice.
 */
const RECENTS_STORAGE_KEY = 'schedules.companySearch.recents';
const RECENTS_LIMIT = 5;

const recentKey = (entry) => `${entry.kind}-${entry.customerId}-${entry.siteId ?? 'all'}`;

const readStoredRecents = () => {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(RECENTS_STORAGE_KEY) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    // Private mode, corrupt entry, or storage disabled by policy — an empty list
    // is the safe fallback, not a thrown render.
    return [];
  }
};

const writeStoredRecents = (entries) => {
  try {
    window.localStorage.setItem(RECENTS_STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // Remembering picks is a convenience; losing it must not break a selection.
  }
};

/**
 * The label with the typed run marked, wherever it falls.
 *
 * Every occurrence, not just the first: a planner who types "park" against
 * "Parkway Retail Park" is told about both, and marking one of two identical runs
 * reads as a rendering bug.
 */
const Highlighted = ({ text, query, className }) => {
  const needle = normalise(query);
  const value = `${text ?? ''}`;
  if (!needle) return value;

  const haystack = value.toLowerCase();
  const parts = [];
  let cursor = 0;

  for (;;) {
    const at = haystack.indexOf(needle, cursor);
    if (at === -1) break;
    if (at > cursor) parts.push({ text: value.slice(cursor, at), match: false });
    parts.push({ text: value.slice(at, at + needle.length), match: true });
    cursor = at + needle.length;
  }

  if (!parts.length) return value;
  if (cursor < value.length) parts.push({ text: value.slice(cursor), match: false });

  return parts.map((part, index) =>
    part.match ? (
      <span key={index} className={className}>
        {part.text}
      </span>
    ) : (
      part.text
    ),
  );
};

Highlighted.propTypes = {
  text: PropTypes.string,
  query: PropTypes.string,
  className: PropTypes.string,
};

/**
 * `companies` is the whole book, unnarrowed — the point of the control is to reach
 * something that is not currently on screen.
 *
 * Free text and a picked option are both kept: `value` is what the consumer
 * filters on per keystroke, and `onSelect` fires only when the planner commits to
 * one company or one building. A consumer that only wants the text can ignore it.
 */
const CompanySiteSearch = ({
  value = '',
  onChange,
  onSelect,
  selection = null,
  onClearSelection,
  companies = [],
  placeholder,
  className,
  siteTerm,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();

  const options = useMemo(() => {
    const flat = [];

    companies.forEach((company) => {
      const companyName = company.name || '';
      const sites = company.sites || [];

      flat.push({
        kind: COMPANY_SITE_SEARCH_KIND.COMPANY,
        customerId: company.customerId ?? company.id ?? null,
        companyName,
        siteCount: sites.length,
        label: companyName,
      });

      sites.forEach((site) => {
        flat.push({
          kind: COMPANY_SITE_SEARCH_KIND.SITE,
          customerId: company.customerId ?? company.id ?? null,
          companyName,
          siteId: site.id ?? site.siteId ?? null,
          label: site.name || '',
        });
      });
    });

    return flat;
  }, [companies]);

  const [recentPicks, setRecentPicks] = useState(readStoredRecents);
  /* Mouse and keyboard are tracked as one state rather than two, and kept apart by
     `reason` (see the note on `optionActive`) — the same row can't be highlighted
     both ways at once, so one slot is enough. */
  const [highlighted, setHighlighted] = useState({ option: null, reason: null });
  /**
   * Whether the planner has asked for the panel — not whether it is showing.
   *
   * `open` has to be ours because the panel must be able to *not* appear: `freeSolo`
   * suppresses MUI's own "no options" node outright, so an empty result set rendered
   * a bordered 304px box with nothing whatsoever inside it. That was already true of
   * a query matching nothing, and turning recents on made it the first thing a new
   * planner saw. Opening only when there are rows is the honest version.
   */
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const isRecentsMode = !normalise(value);

  /* Re-resolved against the live book on every render rather than trusted from
     storage: a renamed company or a demolished site should not survive as a
     recent, and the stored entry is only ever an id — this is where it gets its
     current label back, or is quietly dropped if it no longer exists. */
  const recentOptions = useMemo(() => {
    const bySiteKey = new Map(options.map((option) => [recentKey(option), option]));
    return (
      recentPicks
        .map((entry) => bySiteKey.get(recentKey(entry)))
        /* Never the pick that is already committed. The chip in the field is stating
           it, so offering it again is a row that cannot change anything. */
        .filter((option) => option && !optionsMatch(option, selection))
    );
  }, [recentPicks, options, selection]);

  const rememberSelection = (picked) => {
    setRecentPicks((previous) => {
      const withoutDuplicate = previous.filter((entry) => recentKey(entry) !== recentKey(picked));
      const next = [
        { kind: picked.kind, customerId: picked.customerId, siteId: picked.siteId ?? null },
        ...withoutDuplicate,
      ].slice(0, RECENTS_LIMIT);
      writeStoredRecents(next);
      return next;
    });
  };

  /**
   * Everything the panel would show right now.
   *
   * A company matches by its own name **or** through any of its locations, and a
   * matching company brings all of them — "walmart" has to list the ten stores,
   * not just the ones with "walmart" in the building name.
   *
   * An empty query is not "no matches" — it is the moment before typing, and the
   * answer to it is recents rather than an empty list.
   *
   * Resolved here rather than inside `filterOptions` because two things need it: the
   * list itself, and the decision about whether to open at all. MUI only computes its
   * own filtered list once the panel is already open, which is too late to be what
   * opens it.
   */
  const visibleOptions = useMemo(() => {
    const needle = normalise(value);
    if (!needle) return recentOptions;

    const matchedCompanies = new Set(
      options
        .filter(
          (option) =>
            normalise(option.companyName).includes(needle) ||
            normalise(option.label).includes(needle),
        )
        .map((option) => `${option.customerId}`),
    );

    return options.filter((option) => {
      if (!matchedCompanies.has(`${option.customerId}`)) return false;
      if (option.kind === COMPANY_SITE_SEARCH_KIND.COMPANY) return true;
      // A company matched by name lists everything it holds; one matched only
      // through a building lists the buildings that matched.
      return (
        normalise(option.companyName).includes(needle) || normalise(option.label).includes(needle)
      );
    });
  }, [value, options, recentOptions]);

  return (
    <Autocomplete
      className={`${classes.root} ${className || ''}`}
      classes={{ popper: classes.popper }}
      /**
       * The panel is 304px against a 196px field, and MUI's Autocomplete hands its
       * popper the anchor's measured width — so the only way to a wider panel is to
       * state a width of our own here, where it is spread over MUI's.
       *
       * `preventOverflow` is restated with a padding rather than left to Popper's
       * default of zero because the panel now overhangs its anchor by 108px: wherever
       * the filter row puts this control near the right of the window, a panel flush
       * against the edge would put the far half of every building's name where it
       * cannot be read. The boundary is left alone on purpose — pointing it at the
       * anchor's clipping ancestors instead would let a scrolling toolbar squeeze the
       * panel back down to the field's own width.
       */
      slotProps={{
        popper: {
          style: { width: '304px' },
          modifiers: [{ name: 'preventOverflow', options: { padding: 8 } }],
        },
      }}
      freeSolo
      /* On, now that focusing has something to show: recents when the field is
         empty, the usual matches once there is a query. */
      openOnFocus
      open={isPanelOpen && visibleOptions.length > 0}
      onOpen={() => setIsPanelOpen(true)}
      onClose={() => setIsPanelOpen(false)}
      /* Leaving the field forgets the request to open. MUI's own close never fires
         while the panel is held shut for having nothing to show, so without this a
         planner who focused an empty field before the book had loaded would have the
         panel spring open, unfocused, the moment it arrived. */
      onBlur={() => setIsPanelOpen(false)}
      selectOnFocus={false}
      clearOnBlur={false}
      handleHomeEndKeys={false}
      forcePopupIcon={false}
      size="small"
      inputValue={value}
      options={options}
      filterOptions={() => visibleOptions}
      /* Only recents are grouped, and the heading is the reason the company headings
         are gone — see the note on `groupHeader`. Undefined for a query, which is what
         puts the matches in one flat list. */
      groupBy={isRecentsMode ? () => t('obx.schedules.calendar.grouping.searchRecent') : undefined}
      getOptionLabel={(option) => (typeof option === 'string' ? option : option.label || '')}
      isOptionEqualToValue={optionsMatch}
      onHighlightChange={(_event, option, reason) =>
        setHighlighted({ option: option || null, reason })
      }
      onInputChange={(_event, next, reason) => {
        // `reset` fires when a pick writes the option's label back into the field;
        // forwarding it would restate the selection as a free-text query.
        if (reason === 'reset') return;
        onChange?.(next);
      }}
      onChange={(_event, picked) => {
        if (!picked || typeof picked === 'string') return;
        rememberSelection(picked);
        onSelect?.(picked);
      }}
      /* The heading is a `div`, not a `ListSubheader`. The listbox is a `<ul>` and
         this group is one of its `<li>`s, so a subheader — which renders an `<li>`
         of its own — put a list item inside a list item and React logged the
         invalid nesting on every keystroke. */
      renderGroup={(group) => (
        <Box key={group.key} component="li" className={classes.group}>
          {/* Stated plainly, not highlighted: this heading only ever renders with the
              field empty, so there is nothing typed for it to mark. */}
          <Box className={classes.groupHeader}>{group.group}</Box>
          <Box component="ul" className={classes.groupOptions}>
            {group.children}
          </Box>
        </Box>
      )}
      renderOption={(props, option) => {
        const isKeyboardActive =
          highlighted.reason !== 'mouse' && optionsMatch(option, highlighted.option);
        const sitesTerm = siteTerm || t('obx.schedules.filters.locations.fieldLabel');
        const isCompanyRow = option.kind === COMPANY_SITE_SEARCH_KIND.COMPANY;
        /* The company row's own half is a statement of what picking it does, not a
           name — so it is the one thing in the list that is never marked up, or
           typing "loc" would light up the word "location" under every company the
           panel offered. */
        const detail = isCompanyRow
          ? t('obx.schedules.calendar.grouping.searchAllLocations', {
              count: option.siteCount,
              sites: sitesTerm,
            })
          : option.label;

        return (
          <Box
            component="li"
            {...props}
            key={`${option.kind}-${option.customerId}-${option.siteId ?? 'all'}`}
            className={`${props.className} ${classes.option} ${
              isKeyboardActive ? classes.optionActive : ''
            }`}
            /* Both halves in full, for the row where one of them had to give way. */
            title={t('obx.schedules.calendar.grouping.searchOptionTitle', {
              company: option.companyName,
              detail,
            })}
          >
            {/* Every row names its company, rather than borrowing it from a heading
                above. Recents mixes several companies into one list, so the heading
                could not have carried it there at all — and once each row says it, the
                company heading the matches used to sit under was saying it twice. */}
            {option.companyName ? (
              <>
                <Box component="span" className={classes.optionCompany}>
                  <Highlighted text={option.companyName} query={value} className={classes.match} />
                </Box>
                <Box component="span" className={classes.optionSeparator} />
              </>
            ) : null}
            <Box component="span" className={classes.optionDetail}>
              {isCompanyRow ? (
                detail
              ) : (
                <Highlighted text={detail} query={value} className={classes.match} />
              )}
            </Box>
          </Box>
        );
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          placeholder={
            selection ? '' : placeholder || t('obx.schedules.calendar.grouping.searchCompanyOrSite')
          }
          InputProps={{
            ...params.InputProps,
            startAdornment: (
              <>
                <InputAdornment className={classes.startIcon} position="start">
                  <SearchIcon />
                </InputAdornment>
                {/* **Inside** the field, not beside it. The toolbar this sits in is
                    exactly at capacity — measured, with the row's children summing
                    to its full width — so a sibling chip wrapped the filters onto a
                    second line and shifted the whole grid down 28px the moment a
                    planner picked anything. Stated as the field's value it costs no
                    width at all, and reads the way every other filter on the row
                    does: a control with something in it. */}
                {selection ? (
                  <Chip
                    size="small"
                    className={classes.selectionChip}
                    label={selection.label || selection.companyName}
                    title={
                      selection.kind === COMPANY_SITE_SEARCH_KIND.SITE
                        ? t('obx.schedules.calendar.grouping.searchSelectedSite', {
                            company: selection.companyName,
                            site: selection.label,
                          })
                        : selection.companyName || selection.label
                    }
                    deleteIcon={
                      <CancelIcon
                        aria-label={t('obx.schedules.calendar.grouping.searchClearSelection')}
                      />
                    }
                    onDelete={onClearSelection}
                  />
                ) : null}
              </>
            ),
          }}
        />
      )}
    />
  );
};

CompanySiteSearch.propTypes = {
  /** The raw query text. Controlled — the consumer filters on this per keystroke. */
  value: PropTypes.string,
  onChange: PropTypes.func,
  /** Fires with `{ kind, customerId, companyName, siteId, label }` on a pick. */
  onSelect: PropTypes.func,
  /** The committed pick, stated back inside the field. Same shape as `onSelect`. */
  selection: PropTypes.object,
  onClearSelection: PropTypes.func,
  /** `[{ customerId, name, sites: [{ id, name }] }]` — the whole book. */
  companies: PropTypes.array,
  placeholder: PropTypes.string,
  className: PropTypes.string,
  /** Tenant noun for a building, plural. Used by the "every location" row. */
  siteTerm: PropTypes.string,
};

export default CompanySiteSearch;
