# Harmonize — routes column, supplied design

Transcribed 2026-08-21 from a design image the user supplied in-session for the **middle
column of the Harmonize workspace** (`src/app/obx/pages/schedules/components/harmonize/`).

**The image is the authority.** This file is a written transcription of it, made so the spec
survives the session and can be handed to another agent — where the two disagree, the image
wins and the user is the tiebreak. Nothing here is a decision that overrides the design
record in `docs/harmonize-drawer.md`; conflicts with it are called out at the bottom rather
than silently resolved.

## What the image shows, top to bottom

### 1. Column header

- A route/branch glyph, then **`Proposed route`** — sentence case, bold, dark ink. It reads
  heavier and larger than a field label.
- Hard right on the same line: **`Mon & Tue`** in a muted slate/grey-blue — the days this
  column's cards cover, named in the header.

### 2. Reasoning disclosure

- **`Reasoning`** with a chevron-down beside it, muted grey, left aligned, on its own line
  under the header. Shut in the image.

### 3. One card per route day

White, ~8px radius, thin light-grey hairline border, generous internal padding. The image
shows **two** cards stacked — `Route for Monday` and `Route for Tuesday`.

Each card, in order:

1. **Title row** — `Route for Monday` bold dark on the left; `2 hr / 8 hr` hard right,
   regular weight, dark ink.
2. **Progress bar** — full width, fully rounded, pale-blue trough with a blue fill
   (~21% on Monday, ~28% on Tuesday).
3. **The stop list.** The pin column is inset from the card's text edge; the drag grips sit
   further left again, in the gutter outside the pin column.

#### Row grammar

Every row is: `[grip] [pin] [name] ............ [figures] [chevron]`

- **Grip** — a 6-dot handle, grey. **Only on draggable stops.** The start and end anchors
  have no grip, but the column is still held open so every pin sits on one axis.
- **Pin** — a teardrop marker with a number inside it:
  - **grey** for the start and end anchors,
  - **blue** for stops in the plan,
  - **orange** for stops in the not-included panel.
  - The numbers in the image are placeholder data (`1`, `2`, `2`, then `1`, `1`) — do not
    read sequence semantics into them.
- **Name** — medium weight, dark ink, larger than the figures beside it.
  `Start Location Here` / `End Location Here` on the anchors.
- **Figures** — `12 mi · 1 hr 29 min`: distance, a middot, duration. **On every row,
  including both anchors.**
- **Chevron** — a disclosure caret on every row, anchors included. Down when shut, up when
  open.

#### Connectors

A dashed vertical line in the gutter between consecutive rows, and **the dash colour
carries meaning**:

- **grey dashed** between the start anchor and the first stop,
- **purple/violet dashed** between stops inside the plan,
- **orange dashed** between rows in the not-included panel.

There is **no caption text on the connector**. The leg's time lives in the row's own
right-hand figures.

#### The open row

The third row in the Monday card is expanded. Underneath its own line, indented to the name
column and with the purple dashed connector continuing down the gutter past it:

| label (grey, left)        | value (dark, right) |
| ------------------------- | ------------------- |
| `Travel time:`            | `13 min`            |
| `Filter Installation (5):`| `1hr 40 min`        |

### 4. The not-included panel

A **peach / pale-orange filled card**, same radius as the route cards, with no visible
border — the fill is what separates it.

- **Header** — a filled orange disc with `!` in it, then **`2 Visits not included`** in
  orange, bold. Hard right on the same line: `2 hr 30 min`.
- **Body** — one sentence, dark grey, wrapping to two lines:
  `Create new route or pick up in next week or try to adjust in current routes.`
- **Rows** — the same row grammar as a route card, with orange pins, orange dashed
  connectors, grips present, figures and chevrons on every row.

## Where the current build differs

Verify each of these against the running app before acting on it — this list was written
from one reading of one state and is a starting point, not an audit.

1. **Header.** `columnTitle` renders `Proposed Route` at 13px/600 in `textSecondary2`, with
   no right-hand note. The design wants heavier, darker, sentence-case, plus the days.
2. **Anchors.** They render `Route starts here` / `Route ends here · 15:32` and a **dashed
   grey circle** (`stopAnchorMark`), where the design draws a **numbered grey teardrop** and
   the same `mi · time` figures and chevron every other row gets.
3. **Connectors.** One neutral line carrying a `Drive 7 min` caption beside it, where the
   design has a coloured dashed line and no caption.
4. **Card title weight.** `proposedName` is 14px/600 and `proposedTime` 12px/300; the design
   reads heavier for both.
5. **The not-included panel** is `AiPanel` — check its ground, its header and its row
   grammar against the peach card above.

## Conflicts to raise, not resolve

- **`Mon & Tue` in this header contradicts a recorded decision.** The 2026-08-19 pass
  deliberately deleted the map column's own `Route 1 · Mon 24 Aug` note so that the top
  bar's scope chip would be *the only* place this screen states dates and counts. The design
  puts days back into the routes header. Both cannot be true; ask which the user wants.
- **Purple.** No other element in this workspace uses violet. Check it against the theme
  palette before hardcoding a hex, and check it does not collide with the calendar's status
  washes or the map's pin colours.

## The route card, from the exported CSS (2026-08-21)

The user supplied the design tool's own CSS for the card. These are measured values, not
readings of an image, so they outrank the transcription above wherever the two differ.

| Element                   | Spec                                                        |
| ------------------------- | ----------------------------------------------------------- |
| Card frame                | `padding: 16px`, `gap: 12px`, `1px solid #E6E6E7`, radius 8 |
| Card width                | 382 — inner content 348 (382 − 32 − 2 border)               |
| Head row                  | row, space-between, `gap: 12`, height 20                     |
| Route name                | Inter **600** 14px/20px `#262527`                            |
| `2 hr / 8 hr`             | Inter **300** 12px/16px `#262527`                            |
| Progress trough / fill    | height 4, radius 24, `#EEF5FF` / `#146DFF`                   |
| Stops frame               | `padding: 8px 0 0`, `overflow-y: scroll`                      |
| List frame                | `padding: 0`                                                 |
| **Stop row unit**         | line **20** + connector **32** + padding **8** = **60px**    |
| Connector                 | `padding: 5px 0` around a **22px** dash                       |
| Dash                      | `1.3px dashed` — `#AEAEB2` off an anchor, `#6C0AC2` between stops |
| Last row (end anchor)     | 20 + 8 = **28px**, no connector                              |
| Open row                  | 88px line + 8 padding = 96; dash 64px, `flex-grow: 1`        |
| Pin                       | 16×16 teardrop, `#AEAEB2` anchor / `#146DFF` stop, white numeral 7.2px/600 |
| Grip                      | 16×16, `opacity: 0` on the anchors                            |
| Stop name                 | Inter 500 14px/20px `#262527`                                |
| Figures                   | Inter 300 12px/16px `#262527`, `gap: 6`, 2×2 dot `#7C92A1`   |
| Chevron                   | 7×3.5, `1px solid #7C92A1`                                    |
| Breakdown label / value   | Inter 300 12px/16px — `#6A6A70` / `#262527`, `gap: 8`        |

### Two values in the export that were deliberately not applied

- **`overflow-y: scroll` with a fixed 252px stops frame.** The card in this build lets every
  stop stay visible and gives the scrolling to the pane — a recorded decision, and the
  opposite of a card that scrolls inside a column that also scrolls. Raise it before changing.
- **`padding: 0 0 24px` on the open row's values column.** A Figma auto-layout artifact that
  exists only to make that column 88px like its sibling. Our stacks are flex-driven, so it
  has no visual effect.
