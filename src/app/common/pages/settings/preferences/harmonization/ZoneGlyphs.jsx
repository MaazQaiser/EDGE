import React from 'react';

/**
 * The two marks that say how a zone was defined.
 *
 * They earn their place because "how was this zone made" is the one thing about a zone a
 * planner cannot infer from its name, and it decides which editor opens. Spelling it out
 * in the middle column as well would be saying it twice.
 *
 * Drawn rather than imported: both are a dozen path commands, and the SVG files in
 * `assets` are sized and coloured for other contexts. `currentColor` throughout so the
 * row, the select option and the segmented control can each tint them without a second
 * copy — the same reason `MapPins` lifts geometry instead of files.
 */

export const BoundaryIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
    <path
      d="M7 1.9 12.3 5.3 10.5 11.7 3.4 12.1 1.7 5.7Z"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinejoin="round"
    />
  </svg>
);

export const RadiusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
    <circle
      cx="7"
      cy="7"
      r="5.3"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeDasharray="2.4 1.8"
    />
    <circle cx="7" cy="7" r="1.5" fill="currentColor" />
  </svg>
);

/** The disclosure chevron, rotated by CSS when the list is open. */
export const ChevronIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path
      d="M4 6.5 8 10.5l4-4"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/* `NoShapeIcon` and `AlertIcon` lived here.

   `NoShapeIcon` was the dotted ring on a zone with no shape; the whole glyph column came out
   of the zone row, so all three marks lost that call site and only the two the solution
   switch draws survive.

   `AlertIcon` was the coverage panel's warning triangle, in an amber tone and a red one. The
   panel is gone from Installation Days — the empty controls mark themselves now — and it was
   this file's only caller, so `prop-types` came off the imports with it. */
