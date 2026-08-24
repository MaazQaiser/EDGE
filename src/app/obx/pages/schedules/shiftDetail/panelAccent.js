/**
 * The accent these two side panels are drawn with.
 *
 * The reference designs use the app's brand blue for the active tab, its indicator, the
 * tour-count link and the auto-clockout switch. Asked for directly: build them exactly as
 * drawn, **except** that the accent is this product's green.
 *
 * `#2E964B` is the palette's own `borderSuccess`/`textSuccess`, taken as a literal here for
 * one reason: it is *not* being used as a success signal. A component reading
 * `palette.textSuccess` for an accent is a component that will follow the success colour if
 * it ever moves for a semantic reason, and this accent must not. `surfaceSuccessStrong`
 * (`#31A150`) is the lighter sibling, kept for the switch's track where the darker green
 * reads as almost black at 20px.
 *
 * **The map is not in scope.** Its blue means *planned route* and its green means *covered*
 * — those are data, named in the legend, and recolouring either changes what the map says.
 */
export const PANEL_ACCENT = '#2E964B';

export const PANEL_ACCENT_LIGHT = '#31A150';
