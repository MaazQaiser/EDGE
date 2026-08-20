import { Box, InputAdornment, List, ListItem, ListItemText, TextField } from '@mui/material';
import PropTypes from 'prop-types';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Search } from 'src/assets/svg';

import { useStyles } from '../harmonize.styles';

/**
 * Address search with no API key.
 *
 * The Places field (`common/googleMap/searchAddress`) is used whenever the Maps SDK
 * is available and stays the product's standard. This is the keyless path, and it
 * exists because the alternative was worse than either: with no key the field fell
 * back to a plain text box whose commit handler assigned **one hard-coded lat/lng**
 * to whatever was typed, so every route in the demo left from the same place and the
 * map was drawing a fiction.
 *
 * Geocoding goes through Photon, which is OpenStreetMap data served for typeahead —
 * same source as the tiles underneath, so a searched address lands where the map says
 * it is rather than a few hundred metres off.
 */

const ENDPOINT = 'https://photon.komoot.io/api/';
const MIN_QUERY = 3;
const DEBOUNCE_MS = 300;

/** Photon returns address parts, not a formatted line. Build one, skipping gaps. */
const describe = (feature) => {
  const p = feature?.properties || {};
  const street = [p.housenumber, p.street || p.name].filter(Boolean).join(' ');
  return [street || p.name, p.city || p.district, p.state, p.postcode, p.country]
    .filter(Boolean)
    .join(', ');
};

const AddressSearchField = ({
  id,
  placeholder,
  defaultValue = '',
  onSelect,
  endAdornment = null,
  showValueTitle = false,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();

  const [query, setQuery] = useState(defaultValue);
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const abortRef = useRef(null);
  /* A selection writes the formatted address back into the box, which would
     otherwise look like fresh typing and immediately re-open the list.

     Seeded from `defaultValue` for the same reason: a value the field was *handed*
     is not a query. Once the start point pre-fills with `Current position`, mount
     would otherwise geocode that phrase, find nothing, and drop a `No records`
     list over the map before the planner had typed a character. The component is
     keyed on the resolved default upstream, so a late GPS or franchise fix
     remounts it and re-seeds this correctly. */
  const skipNextSearch = useRef(Boolean(defaultValue));

  useEffect(() => {
    if (skipNextSearch.current) {
      skipNextSearch.current = false;
      return undefined;
    }

    const term = query.trim();
    if (term.length < MIN_QUERY) {
      setResults([]);
      return undefined;
    }

    const timer = setTimeout(() => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      fetch(`${ENDPOINT}?limit=5&q=${encodeURIComponent(term)}`, { signal: controller.signal })
        .then((response) => response.json())
        .then((json) => {
          setResults(json?.features || []);
          /* A late response must not open a list over whatever the planner has
             moved on to. Only a focused field may show suggestions. */
          setOpen(document.activeElement?.id === id);
        })
        /* A failed lookup leaves the last good suggestions alone rather than
           clearing the list under the pointer. */
        .catch(() => {});
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [query]);

  const choose = (feature) => {
    const [lng, lat] = feature?.geometry?.coordinates || [];
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;

    const address = describe(feature);
    skipNextSearch.current = true;
    setQuery(address);
    setResults([]);
    setOpen(false);
    onSelect?.({ address, lat, lng });
  };

  return (
    <Box className={classes.addressSearch}>
      <TextField
        fullWidth
        id={id}
        className={classes.addressField}
        placeholder={placeholder}
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        onFocus={() => {
          setFocused(true);
          if (results.length) setOpen(true);
        }}
        /* Closing on blur has to lose the race with the click that picked a
           suggestion, so it is deferred rather than immediate. */
        onBlur={() => {
          setFocused(false);
          setTimeout(() => setOpen(false), 150);
        }}
        onKeyDown={(event) => {
          if (event.key === 'Enter' && results.length) {
            event.preventDefault();
            choose(results[0]);
          }
          if (event.key === 'Escape') setOpen(false);
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search />
            </InputAdornment>
          ),
          /* Spread rather than assigned, so a caller that passes nothing gets the exact
             node tree this field had before the prop existed. `endAdornment: null` is not
             the same thing: MUI still renders the adornment slot and its 8px margin, which
             would have narrowed the workspace's own field for a control it never asked
             for. */
          ...(endAdornment ? { endAdornment } : null),
        }}
        inputProps={{
          /* A formatted address is routinely wider than the box and there is no second
             line to put it on, so the full value is offered on hover.
             Opt-in because a native `title` is a *behaviour* change and not a visual one:
             switching it on for every caller would start popping a browser tip over the
             map the workspace's copy of this field sits beside, which nobody asked for.
             `undefined` rather than `''` so React omits the attribute entirely. */
          title: showValueTitle ? query || undefined : undefined,
        }}
      />

      {open && focused && results.length ? (
        <List className={classes.addressSuggestions}>
          {results.map((feature, index) => (
            <ListItem
              key={`${feature?.properties?.osm_id || 'result'}-${index}`}
              className={classes.addressSuggestion}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => choose(feature)}
            >
              <ListItemText primary={describe(feature)} />
            </ListItem>
          ))}
        </List>
      ) : null}

      {open && focused && !results.length && query.trim().length >= MIN_QUERY ? (
        <List className={classes.addressSuggestions}>
          <ListItem className={classes.addressSuggestion}>
            <ListItemText primary={t('sales.locations.noRecords')} />
          </ListItem>
        </List>
      ) : null}
    </Box>
  );
};

AddressSearchField.propTypes = {
  id: PropTypes.string,
  placeholder: PropTypes.string,
  defaultValue: PropTypes.string,
  onSelect: PropTypes.func,
  /** Controls drawn inside the field, at its end. Nothing by default. */
  endAdornment: PropTypes.node,
  /** Offer the full value as a native tooltip, for callers whose column clips it. */
  showValueTitle: PropTypes.bool,
};

export default AddressSearchField;
