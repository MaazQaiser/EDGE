import { Box, Collapse, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useStyles } from './harmonization.styles';
import { ChevronIcon } from './ZoneGlyphs';

/**
 * What this zone caught: a count, and the list behind it.
 *
 * **It sits under the name field**, because it is an answer and the name is a question. A
 * planner types the name first and then draws; what the drawing captured cannot be read
 * before the thing that produced it without the panel appearing to state a fact about
 * nothing. The two-column in/out readout this descends from was worse still — it gave equal
 * permanent room to what was in and what was out, so the glance ("does that look like the
 * right number?") cost as much screen as the detail checked once.
 *
 * **Three ranks on one line, and only one of them is loud.** The whole job of this block is
 * to answer "did my shape catch the right sites?", which is a number the planner compares
 * against the pins they can see. So the site count is the headline — `h5`, the only bold
 * thing here — with the label and the work it implies kept at `body3` on either side of it.
 * Hierarchy comes from weight and colour rather than size, so the block stays one 28px line
 * and never competes with the name field above it or the map below it.
 *
 * **Sites lead, visits and filters follow.** Sites are what the map draws and what the
 * planner is counting; visits and filters are what that catch will cost a day, which is the
 * detail rather than the check. Reporting the load alone — as this did — left the headline
 * as a number with no counterpart anywhere on screen. Reporting sites alone would be the
 * mistake §14.4 of the context doc catches the run flow making: an 8-filter site and a
 * 1-filter site are not one thing twice. Both, ranked.
 *
 * Kept as one component rather than one per experience so a boundary and a radius cannot
 * end up describing the same result two different ways.
 */

const ZoneIncluded = ({ captured, hasShape }) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const tt = (key, options) =>
    t(`obx.settings.preferences.harmonization.${key}`, {
      ...options,
      interpolation: { escapeValue: false },
    });

  const [open, setOpen] = useState(false);

  const visits = captured.reduce((total, site) => total + (Number(site.visits) || 0), 0);
  const filters = captured.reduce((total, site) => total + (Number(site.filters) || 0), 0);
  const canExpand = captured.length > 0;

  return (
    <Box className={classes.includedBar}>
      {/* The sentence is the toggle, chevron included — the chevron follows the text rather
          than sitting at a far edge, because there is no longer a box for it to sit against.
          Rendered as a button only when there is something behind it, so a zone that caught
          nothing has nothing to press. */}
      <Box
        component={canExpand ? 'button' : 'div'}
        type={canExpand ? 'button' : undefined}
        className={`${classes.includedSummary} ${canExpand ? classes.includedSummaryLive : ''}`}
        onClick={canExpand ? () => setOpen((previous) => !previous) : undefined}
        aria-expanded={canExpand ? open : undefined}
      >
        <Typography variant="body3" className={classes.includedLabel}>
          {tt('zoneIncluded')}
        </Typography>

        {hasShape ? (
          <>
            <Typography variant="h5" className={classes.includedCount}>
              {tt('zoneSiteCount', { count: captured.length })}
            </Typography>
            <Typography variant="body3" className={classes.includedDetail}>
              {tt('zoneIncludedCount', {
                visits: tt('zoneVisitCount', { count: visits }),
                filters: tt('zoneFilterCount', { count: filters }),
              })}
            </Typography>
          </>
        ) : (
          /* No headline before there is a shape: with nothing caught there is nothing to
             glance at, so the whole line stays at the quiet rank rather than printing a
             bold zero the planner has to read and discard. */
          <Typography variant="body3" className={classes.includedEmpty}>
            {tt('zoneIncludedNoShape')}
          </Typography>
        )}

        {canExpand ? (
          <Box className={`${classes.includedChevron} ${open ? classes.includedChevronOpen : ''}`}>
            <ChevronIcon />
          </Box>
        ) : null}
      </Box>

      <Collapse in={open && canExpand} unmountOnExit>
        <Box className={classes.includedList}>
          {captured.map((site) => (
            <Box key={site.id} className={classes.includedRow}>
              <Box className={classes.includedRowMain}>
                <Typography variant="body2" className={classes.includedSiteName}>
                  {site.name}
                </Typography>
                <Typography variant="body3" className={classes.includedCompany}>
                  {site.company}
                </Typography>
              </Box>
              <Typography variant="body3" className={classes.includedRowMeta}>
                {tt('zoneIncludedRowMeta', {
                  visits: tt('zoneVisitCount', { count: site.visits }),
                  filters: tt('zoneFilterCount', { count: site.filters }),
                })}
              </Typography>
            </Box>
          ))}
        </Box>
      </Collapse>
    </Box>
  );
};

ZoneIncluded.propTypes = {
  captured: PropTypes.array.isRequired,
  hasShape: PropTypes.bool,
};

export default ZoneIncluded;
