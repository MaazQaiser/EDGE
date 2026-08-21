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

/** No shape yet — a zone somebody assigned site by site, which is a legal way to have one. */
export const NoShapeIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
    <circle
      cx="7"
      cy="7"
      r="5.3"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeDasharray="1.6 2"
      opacity="0.7"
    />
  </svg>
);

/**
 * The warning mark on the coverage panel.
 *
 * A stroked triangle rather than a filled one: the band it sits in is already
 * `surfaceWarningSubtle`, and a solid amber glyph on amber ground is a shape you cannot
 * read. The stroke is dark enough to clear 3:1 against that ground on its own.
 */
export const AlertIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M8 2.3 14.5 13.3H1.5Z" stroke="#7A5200" strokeWidth="1.3" strokeLinejoin="round" />
    <path d="M8 6.5v3.1M8 11.2v.7" stroke="#7A5200" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);
