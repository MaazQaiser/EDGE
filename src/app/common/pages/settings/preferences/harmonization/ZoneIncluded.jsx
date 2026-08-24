import { Box, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { useStyles } from './harmonization.styles';

/**
 * What the shape caught: a count, and the sites behind it.
 *
 * **A plain list under the map, not a disclosure above it.** Two reversals are folded in
 * here, both recorded because the reasoning that produced the old shape was written down and
 * would otherwise be re-derived:
 *
 * - It used to sit between the name field and the map, collapsed behind a chevron, argued
 *   for on the grounds that the detail is checked once and the count is the answer. That
 *   holds when the list is a footnote. It is not: this is what a planner reads *against* the
 *   pins on the map, so it belongs beside them, and a click between the two puts a door in
 *   front of the answer.
 * - The count was `h5` against `body3` labels — a headline with annotations inside one 28px
 *   line. The summary is one type size now.
 *
 * **Hierarchy and proximity carry the rows, not rules.** A row is a site name with its
 * company tucked 2px under it — one block, read as one thing — and the filter count out on
 * the right where the eye can run down a column of them. The name is ink, the company and
 * the count are grey, and nothing is boxed: the header's own rule is the only line, so the
 * list reads as content rather than as a table nested inside a dialog.
 *
 * One component for both editors, so a boundary and a radius cannot end up describing the
 * same result two different ways — only the title and the empty sentence differ.
 */

const ZoneIncluded = ({ captured, hasShape, title, emptyText }) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const tt = (key, options) =>
    t(`obx.settings.preferences.harmonization.${key}`, {
      ...options,
      interpolation: { escapeValue: false },
    });

  const filters = captured.reduce((total, site) => total + (Number(site.filters) || 0), 0);
  const hasRows = hasShape && captured.length > 0;

  return (
    <Box className={classes.includedStatic}>
      <Box className={classes.includedStaticHead}>
        <Typography variant="body2" className={classes.includedLabel}>
          {title || tt('zoneIncluded')}
        </Typography>
        {hasShape ? (
          <Typography variant="body2" className={classes.includedCount}>
            {tt('zoneSitesFilters', {
              sites: tt('zoneSiteCount', { count: captured.length }),
              filters: tt('zoneFilterCount', { count: filters }),
            })}
          </Typography>
        ) : null}
      </Box>

      {hasRows ? (
        <Box className={classes.includedList}>
          {captured.map((site) => (
            <Box key={site.id} className={classes.includedRow}>
              {/* Name over company, 2px apart: proximity is what makes the pair one row
                  rather than two lines that happen to be adjacent. */}
              <Box className={classes.includedRowMain}>
                <Typography variant="body2" className={classes.includedSiteName}>
                  {site.name}
                </Typography>
                <Typography variant="body3" className={classes.includedCompany}>
                  {site.company}
                </Typography>
              </Box>
              <Typography variant="body2" className={classes.includedRowMeta}>
                {tt('zoneFilterCount', { count: site.filters })}
              </Typography>
            </Box>
          ))}
        </Box>
      ) : (
        /* The empty state matters more than an absent list: nothing there reads as broken,
           and one sentence says the section is waiting on the planner. */
        <Box className={classes.includedEmptyState}>
          <Typography variant="body2" className={classes.includedEmpty}>
            {emptyText || tt('zoneIncludedNoShape')}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

ZoneIncluded.propTypes = {
  captured: PropTypes.array.isRequired,
  hasShape: PropTypes.bool,
  /** Names what the list holds — `Visits in radius`, `Visits in boundary`. */
  title: PropTypes.string,
  emptyText: PropTypes.string,
};

export default ZoneIncluded;
