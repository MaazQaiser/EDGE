import { Box } from '@mui/material';
import PropTypes from 'prop-types';
import React from 'react';

/**
 * The two marks this shell draws that neither neighbour already has.
 *
 * Everything else it needs — the close cross, the gear, the warning triangle, the chevron —
 * comes from `harmonizeFlow/components/Glyphs` or the shared asset set, imported rather
 * than redrawn. A private copy of an icon the app already ships is how two surfaces end up
 * with two slightly different chevrons.
 */

/**
 * Four zones, as a mark.
 *
 * Used on the map column's heading. A globe or a pin would say "map"; what this column
 * actually shows is a territory divided, which is the fact that distinguishes it from the
 * Workspace's own map.
 */
export const ZonesGlyph = ({ className }) => (
  <Box
    component="svg"
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    aria-hidden="true"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 3.4 19.6 7v10L12 20.6 4.4 17V7L12 3.4Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    <path d="M12 3.4v17.2M4.4 7l15.2 10M19.6 7 4.4 17" stroke="currentColor" strokeWidth="1.2" />
  </Box>
);

ZonesGlyph.propTypes = { className: PropTypes.string };
