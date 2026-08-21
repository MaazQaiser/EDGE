# Proposal — All Invoices

**Written:** 2026-08-12 · Companion to `02-all-invoices-audit.md`, which is the evidence for
everything asserted here. Reads as a set of decisions, in the style of README §2, so accepted items
can move straight into that file as D20 onward.

---

## 1. The one problem underneath most of the findings

The tab is doing two jobs at once and has never been told which one it is.

| Job                                                                       | What it needs                                                      | Who asks for it        |
| ------------------------------------------------------------------------- | ------------------------------------------------------------------ | ---------------------- |
| **The register** — find an invoice, check it, act on it                   | every document field, search that always works, no scope surprises | back office, daily     |
| **The period report** — what did we bill, what came in, what's still open | three money figures, few columns, a stated window                  | owner/finance, monthly |

The reconciliation feature layered the report on top of the register without separating them, and
almost every serious finding in the audit is a symptom of that, not an independent bug:

- The strip and the toolbar disagree about scope (P0-2) — a report and a register with two scopes.
- 17 columns, and the three money ones are off-screen (P1-1, P1-2) — the register's document fields
  crowding out the report's figures.
- The tab is called "All Invoices" and shows 8 of 34 (P1-7) — register name, report behaviour.
- **Searching `07016` in the default view returns "No Record Found"** even though `INV-2026-07016`
  exists — the report's window silently ANDs itself onto the register's lookup. 26 of 34 invoices
  are unfindable by number from the default view. _(Verified in the app.)_
- Export asks for dates instead of exporting the view (P0-5) — nobody decided which job it serves.

Thirty patches would leave the contradiction in place. One rule removes it.

---

## 2. D20 — the invariant

> **The summary always describes exactly the rows in the table. No exceptions.**

This is not a new decision; it is D13's own justification ("the numbers describe the very rows on
screen") enforced instead of asserted. Everything else below follows from it.

Consequences, in order of how much they buy:

1. **The period becomes a filter, not a frame.** It stays the default and stays the most prominent
   control — but it sits in the same system as site, status and search, and every one of them moves
   the numbers. P0-2 dissolves: there is no second scope to disagree with.
2. **Search escapes the period.** Typing an invoice number searches every invoice, and the summary
   follows it ("1 invoice · $8,013.60 · still open"). The register's core action stops being broken
   by the report's window. Show it plainly — _Searching all invoices · [Back to This month]_ — so
   the scope change is visible rather than magic.
3. **State and exception pills still don't move the numbers**, and now for a principled reason
   rather than an exception: their counts _are_ the decomposition of the summary. A pill labelled
   "5 Never issued" is only meaningful against a total of 8. This keeps D10 intact and gives it a
   rule instead of a special case.
4. **One honest line closes the gap** between "these pills narrow the rows" and "these filters
   narrow everything": `8 invoices in this period · 2 filters applied · Clear all`. It is the whole
   fix for the "empty table under a strip claiming nine invoices" class of bug — including the
   version that gotcha §5.8 could not prevent.
5. **Export means "export what I am looking at."** The date modal goes; the button exports the
   current row set with the current columns.

Cheapest change with the widest reach. If only one thing from this document ships, ship this.

---

## 3. D21 — one clock in the strip, and the second clock gets its own surface

The strip today mixes two time semantics in four stats (P0-4): _Billed_, _Still open_ and
_Collected_ are as-of-today for invoices raised in the window; _Received_ is cash that landed in the
window, for any invoice. Correct individually, unreconcilable together, and the number a reader
actually wants — how much of this period's billing came in — appears nowhere.

**Pick the invoice clock, because this is a table of invoices.**

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ ● Billed            ● Received           ● Still open                        │
│   $53,946.00          $12,199.68           $41,746.32                        │
│   9 invoices          against these        ▓▓▓▓▓▓▓░░░░░░  not yet due 8,013  │
│                       invoices             ▓▓▓▓▓▓▓        overdue    33,733  │
│                     ● Credited $1,296.00 · 1 credit note                     │
└──────────────────────────────────────────────────────────────────────────────┘
```

Four changes, each fixing a named finding:

- **`Received` becomes "paid against these invoices", any date.** Now `Billed − Received =
Still open` closes on screen, and a reader can check the arithmetic. This is the only way four
  numbers on one rail can be read as one family.
- **`Still open` splits into not-yet-due / overdue** — the first thing every AR surface does
  (QuickBooks' money bar), using the 6px proportion bar D14 already established. This also fixes
  P1-3 at source: once the split is the headline, painting every open balance red is redundant, and
  Balance Due can be coloured from `agingBucket`, which is already on every row.
- **`Credited` finally renders** (P0-6). D18 decided it; the endpoint computes it; only the markup
  was missing. Shown only when non-zero.
- **`Collected %` is deleted.** It is a KPI, this is an activity report, and its denominator is
  wrong by construction — mid-month on NET30 terms almost nothing billed is collectible yet, which
  is why the default view reads **5%**. Its correct form is CEI (collectible-only) and its correct
  home is Outstanding, which is a position as of today.

**Where the cash clock goes.** D17's insight — receipts counted by the date money arrived, split
into "settles this period" vs "settles earlier invoices" — is real and should not be lost. It
cannot live as a grey footnote under a table of invoices, because no table of invoices can carry
it (which is why the drawer's receipt list was dropped). It belongs in the **receipts/cash view**
the handoff already names as the natural third surface (§7.4), where receipts are the rows.

**This is the one item that needs the client's confirmation**, because it changes what "Received"
means on this screen. It does not discard D17 — it relocates it to a surface that can hold it.

---

## 4. D22 — a default column set, and a column picker for the rest

17 columns, 2968px wide, 54% off-screen. The five subtotal columns hold 918px of permanent seats
while `daysOverdue` and `agingBucket` ride along on every row unrendered.

**Default (11):**

| #   | Column            | Note                                                                                     |
| --- | ----------------- | ---------------------------------------------------------------------------------------- |
| 1   | Invoice Number    | sticky; widen to 200px, chevron absolutely positioned so it stops clipping the ID (P2-1) |
| 2   | Customer          |                                                                                          |
| 3   | Site              |                                                                                          |
| 4   | Invoice Date      |                                                                                          |
| 5   | Due Date          |                                                                                          |
| 6   | **Due / Overdue** | **new** — "in 29 days" / "12 days late". From `daysOverdue`, already on the row          |
| 7   | Sync Status       | renamed from `Status` (P1-4)                                                             |
| 8   | Payment           | chips: state, plus only the discrepancies that are _not_ derivable from another column   |
| 9   | Balance Due       | right-aligned, coloured by aging bucket                                                  |
| 10  | Grand Total       | right-aligned                                                                            |
| 11  | actions           | 3 max, then overflow                                                                     |

**Behind `Edit columns`:** Contract, Type, Invoice Duration, Line Item Total, Tax Amount, Invoice
Delivered At (renamed from "Report Distributed At"), Customer ID. Stripe's answer to Q11, and it
lets power users keep what they need without taxing everyone else.

Two column-level rules that come with it:

- **Right-align money, tabular numerals, thousands separators, currency in the header only.**
  `10659.60` becomes `10,659.60`. Negatives get a minus or parentheses, never the word "credit"
  (P2-8).
- **Drop the `Never issued` chip from the row.** It is `status !== sentToSage && balanceDue > 0` —
  the cell immediately to its left already says it (P1-5). It keeps its pill, where the count is the
  point, and it keeps its chip in Outstanding, which has no sync column. Same reasoning D15 used.
  This also removes the second chip that is forcing 61px rows, so D19's 48px single-line rule comes
  back for free (P2-2).

---

## 5. D23 — the filter bar is one system

Today: presets and pills inside the white widget, search and three dropdowns outside it on the page
background, and no statement anywhere of what is applied.

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ [ ● Billed  … the strip … ]                                                  │
├──────────────────────────────────────────────────────────────────────────────┤
│ This month · Last month · Last 3 months · YTD   [2026-08-01 – 2026-08-12]    │
│ 🔍 Search invoices     Site ▾   Sync status ▾   Type ▾            [Export]   │
├──────────────────────────────────────────────────────────────────────────────┤
│ State      8 All · 7 Unpaid · 1 Paid                                         │
│ Exceptions 5 Never issued · 1 Short paid                                     │
│ 8 invoices in this period · 1 filter applied · Clear all                     │
└──────────────────────────────────────────────────────────────────────────────┘
```

- **Group labels on the pills** (P1-6). States partition the total (7+1=8); exceptions overlay it
  (5 Never issued ⊂ 7 Unpaid). A 1px divider cannot carry that distinction — two labelled lines can,
  and it matches the two legends Outstanding already uses.
- **Active pill = filled chip**, brand-tinted, not a 0.02-alpha background shift with a hairline
  ring (P2-6). Applied filter state is state, and should be as loud as a selected tab. Move it off
  brand green while you're there — green means _paid_ everywhere else in this view.
- **Hit targets to 28px, and reserve the row height** so applying a filter stops shoving the table
  down 16px (P2-7, P3-4).
- **The counted line at the bottom** is the D20 invariant made visible.
- Everything sits on the card, so the three dropdowns stop being invisible in dark mode.

Vertical budget: strip 76 + period 44 + filters 44 + pills 2×24 + counted line 24 ≈ **164px**,
against 199px today, with three more controls in it. At 1280×800 that returns a row and a half to
the table (P2-12).

---

## 6. D24 — one background token

Set a page background on the app shell. Three unreadable filter labels at 1.38:1 become legible in
dark-scheme browsers, and README §5's premise — "the page shell behind it is dark" — stops being
true, which reopens the single-white-card treatment on both this tab and Outstanding as a real
choice rather than a workaround (P3-6). App-wide, pre-existing, one line.

---

## 7. Correctness work that is not a design question

Ship regardless of anything above.

1. **Normalise the period boundary in the listing filter** so the closing day of every period stops
   vanishing from the table (P0-1). `invoice.mock.js:790`. Q21 decides which end.
2. **Decide the credit-note clamp** (Q5). `calculateGrandAmount` clamps at 0, so one row currently
   reads −1200.00 / −96.00 / **0.00** / **1296.00 credit** (P0-3).
3. **Actions:** cap at three, overflow the rest, and give Payments primary weight. Today the fourth
   icon renders outside the card (P2-3) and the disabled Payments icon lands at 25% opacity because
   two 0.5 fades compound (P2-10).
4. **Accessibility:** make the scroll region keyboard-operable (P3-1 — Payment and Balance Due are
   currently unreachable), fix the tooltip-as-accessible-name on pills and row actions (P3-2, P3-3),
   and raise the hint line above 4.5:1 (P3-5 — it carries the strip's load-bearing caveat).

---

## 8. Order

| Step | Work                                                            | Why here                                                                      |
| ---- | --------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| 1    | **D20** + the boundary fix + Export-the-view                    | The view stops misstating totals and search starts working. Cheapest, widest. |
| 2    | **D21** strip rewrite (needs the client's nod on `Received`)    | The four numbers become checkable arithmetic.                                 |
| 3    | **D22** columns + right-aligned money + drop the redundant chip | The feature becomes visible without scrolling; 48px rows return.              |
| 4    | **D23** filter bar + **D24** background                         | The controls become findable, loud, and legible in both schemes.              |
| 5    | §7.3–7.4 craft and accessibility                                | Small, visible, cheap.                                                        |

Steps 1 and 3 together account for most of the audit. Step 2 is the only one that needs a decision
from outside the team.

---

## 9. What this proposal deliberately does not do

- **It does not add a third tab for the period report.** D2's reasoning holds — splitting invoice
  work across destinations costs more than it buys. The report and the register coexist under one
  invariant instead.
- **It does not touch the Outstanding tab.** Different question, different clock, audited separately
  if wanted.
- **It does not build the receipts/cash view.** It only names it as where D17's split belongs, so
  the strip can stop carrying it badly.
- **It does not reopen D1–D19.** D20–D24 are additive; the only one that revises anything is D21,
  and it relocates D17's presentation rather than reversing its reasoning.
