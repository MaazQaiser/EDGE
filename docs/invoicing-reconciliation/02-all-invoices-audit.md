# Audit — the All Invoices tab

> **Status: acted on.** The rebuild landed the same day — see `03-all-invoices-proposal.md` for the
> reasoning and README §2 for D20–D24. Fixed: P0-1, P0-2, P0-3 (in this listing), P0-4, P0-5, P0-6,
> P1-1, P1-2, P1-3, P1-4, P1-5, P1-6, P1-7, P1-8, P2-1 … P2-12, P3-1 … P3-7. **Still open:**
> Q5 (the `calculateGrandAmount` clamp elsewhere in the app), the receipts/cash view that D17's
> split was relocated to, and `de/fr/es` locales for the new keys. Measured before/after figures
> are in the session notes; the headline is 1,604px of hidden table → 82px, 61px rows → 48px,
> and a summary that now reconciles with the rows beneath it to the cent.

**Written:** 2026-08-12 · **Branch:** `feature/scheduler-ui-refresh` · **Audited in the running app**
(FilterGo tenant, no franchise selected, 1512×950 and 1280×800, light and dark browser schemes).

Read first: `HANDOFF.md`, then `README.md` (D1–D19, Q1–Q18). This file does not re-litigate any of
them — it tests what was built against them, and against how this class of interface is designed
elsewhere. Every number below came off the running app or out of the source; the file/line
references are the proof.

---

## 1. What this view is being judged against

Three sources of truth, in order:

1. **The feature's own decisions.** D12 (All Invoices = activity in a period), D13 (permanent
   overview, not a drawer), D17 (invoices by date raised, receipts by date received), D18 (credit
   notes reported separately), D19 (the app's existing idioms, 48px single-line table rows).
2. **The domain.** What an accounts-receivable surface is _for_, and the conventions finance
   users already have in their hands from Xero, QuickBooks, Sage and Stripe.
3. **Table craft.** NN/g's four data-table tasks, and the enterprise-table pattern literature.

---

## 2. How this class of interface is designed elsewhere

Six patterns are near-universal in AR/invoicing surfaces. They are the standard this audit
applies, and five of the six are relevant to a specific finding below.

| Pattern                                                                                                                                                                                                     | Where it comes from                                                       | What it means here                                                                                                                                                                          |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Open money is split into "not due yet" and "overdue" before anything else.** QuickBooks' money bar splits unpaid into _Overdue_ / _Not Due Yet_ and paid into _Not Deposited_ / _Deposited_.              | QuickBooks Online invoices page                                           | "Still open" is one number, and every open balance in the table is painted alert-red — including invoices raised yesterday on NET30 terms. The split is the primary read and it is missing. |
| **Collection is measured against what was _collectible_, not what was billed.** CEI's defining property is that it "strips out balances that are not yet due".                                              | Collection Effectiveness Index, the standard AR performance metric        | "Collected 5% of this period's billing" divides by billing that is mostly not yet due. Mid-month it always reads as a crisis.                                                               |
| **One status badge, with sub-badges that qualify it.** Stripe shows `open`, and qualifies it with `Past due` / `Retrying` / `Pending` on the same badge; column overload is answered with **Edit columns**. | Stripe Dashboard invoices                                                 | This view has two adjacent status columns (`Status`, `Payment`) rendering visually identical chips, and no column control. Stripe's answer to Q11 already exists as a convention.           |
| **Filter by tabs + chips, and show what is applied.**                                                                                                                                                       | Stripe; NN/g "make filters discoverable and indicate when they're active" | The pills are the right idea. The applied state is a 2%-alpha background change plus a 1px ring on a 20px control.                                                                          |
| **Freeze the leftmost column; make the first column a human-readable identifier; right-align numerals.**                                                                                                    | NN/g, _Data Tables: Four Major User Tasks_ and _Mobile Tables_            | First two are done. Numerals are left-aligned, and the human-readable identifier is truncated.                                                                                              |
| **Row density 40/48/56px, actions surfaced on hover not persistently, sticky footer for totals, explicit add/remove-column control.**                                                                       | Pencil & Paper, _UX pattern analysis: enterprise data tables_             | Rows are 61px on 5 of 8 rows; four persistent icon buttons per row overflow their cell.                                                                                                     |

Sources: [NN/g — Data Tables: Four Major User Tasks](https://www.nngroup.com/articles/data-tables/) ·
[NN/g — Mobile Tables](https://www.nngroup.com/articles/mobile-tables/) ·
[Pencil & Paper — enterprise data tables](https://www.pencilandpaper.io/articles/ux-pattern-analysis-enterprise-data-tables) ·
[Stripe — Invoicing dashboard](https://docs.stripe.com/invoicing/dashboard) ·
[QuickBooks — invoice status/money bar](https://www.dummies.com/article/technology/software/money-management-software/quickbooks/managing-invoice-status-quickbooks-online-252445/) ·
[Paystand — Collection Effectiveness Index](https://www.paystand.com/blog/collection-effectiveness-index) ·
[Vertaccount — AR dashboard KPIs](https://www.vertaccount.com/blog/best-accounts-receivable-dashboard-examples-templates-for-2026/)

---

## 3. Findings

Ordered by severity. **P0** = the view states something untrue. **P1** = the feature's own point
is not reachable. **P2** = craft. **P3** = accessibility and platform. Anything pre-existing or
app-wide is marked as such.

### P0-1 · The strip and the table cover different invoices — the last day of every period is missing from the table

Set the period to **Last month** (2026-07-01 – 2026-07-31):

|             | Value                                                              |
| ----------- | ------------------------------------------------------------------ |
| Strip says  | Billed **$53,946.00**, 9 invoices                                  |
| Table shows | 9 rows (8 invoices + 1 credit note), Σ Grand Total **$46,774.80**  |
| Missing     | `INV-2026-07020`, raised **2026-07-31**, Grand Total **$7,171.20** |
| Check       | 46,774.80 + 7,171.20 = **53,946.00** exactly                       |

Cause — the two endpoints parse the same period differently:

- Listing: `to = new Date(periodEnd).getTime()` → `new Date('07/31/2026')` is **31 Jul 00:00:00**,
  then `if (raised > to) return false` (`invoice.mock.js:790`, `:819`). Invoice timestamps carry a
  time of day, so anything raised on the closing day is dropped.
- Overview: `to = new Date(toRaw).setHours(23, 59, 59, 999)` (`invoice.mock.js:881`). It is included.

This is not a Last-month curiosity. The default period is **this month, ending today**, so any
invoice raised today is counted in the headline and absent from the table beneath it. The whole
premise of D13 — "the numbers describe the very rows on screen" — fails on the last day of every
period. One line fixes it: normalise both ends in the listing filter.

### P0-2 · The toolbar filters narrow the table and are invisible to the strip

Type a search that matches nothing:

- Table: **No Record Found**, pagination **0–0 of 0**
- Strip, unchanged: **Billed $32,896.80 · 8 invoices · Still open $31,147.20**

Same for Site Name, All Statuses, All Types. The pills deliberately don't move the strip (D10, and
correct), but the pills _are_ in the same widget as the numbers, so the reader has a mental model
of "these controls narrow the rows, the numbers stay". The toolbar sits below the widget and does
the same thing to the rows — with nothing anywhere saying the numbers no longer describe them.
This is the exact failure gotcha §5.8 was written about, arriving through the toolbar instead of
the pills. Q12 asks only about the site filter; the hole is wider than that.

Either the strip respects the toolbar filters, or it states its scope explicitly
("franchise-wide, all sites") and the table shows a filter summary.

### P0-3 · One row contradicts itself on credit notes

`CRN-2026-07033`, visible in the default Last month view, reads across four adjacent cells:

| Line Item Total | Tax Amount | Grand Total | Balance Due        |
| --------------- | ---------- | ----------- | ------------------ |
| −1200.00        | −96.00     | **0.00**    | **1296.00 credit** |

`calculateGrandAmount` clamps at zero (`helper/utilityFunctions.js:2001–2006`). This is logged as
Q5 and as "two surfaces disagree", but it is stronger than that: the arithmetic visibly fails
inside a single row, on screen, by default. It should be decided before this goes to a client.

### P0-4 · "Collected" and "Received" run on two different clocks, and the collected denominator is wrong

For July the strip reads: Billed $53,946.00 · Received $19,542.60 (*includes $18,851.40 for earlier
invoices*) · Still open $41,746.32 · Collected 23%.

- Billed − Still open = **$12,199.68** settled against July invoices.
- Received against July invoices = 19,542.60 − 18,851.40 = **$691.20**.
- Collected 23% is computed as Σ `amountPaid` of invoices raised in the window ÷ billed
  (`invoice.mock.js:966–967`) — an **as-of-today** figure.

All three are individually correct and cannot be reconciled by the reader. Three of the four stats
are "as of today, for invoices raised in this window"; **Received** alone is "cash that landed in
this window, for any invoice". They sit in one strip, on one hairline-divided rail, in one
typographic treatment, which asserts they are one family. The number a reader actually wants —
$691.20 of July's billing came in during July — is on no screen.

Separately, the denominator ignores terms. On the default period (12 days into the month, NET30),
almost nothing billed is collectible yet, and the headline is **5%**. CEI exists precisely to strip
not-yet-due balances out of that denominator. Either label it honestly ("23% settled to date") or
compute it against what was due.

### P0-5 · Export throws the view away

`ExportInvoiceModel` opens with **empty** start and end dates and sends only `periodStart` /
`periodEnd` (`components/exportInvoiceModel/index.jsx`). It does not seed from the active period,
and it carries none of the active pill, search, site, status or type. A user who has narrowed the
table to "5 Never issued in August" is asked to retype dates, and receives an unfiltered dump.
An export button beneath a filtered table is a promise about what it exports.

### P0-6 · D18 is decided but not built

`buildPeriodReconciliation` returns a `credited` figure (`invoice.mock.js:949–952`) and
`obx.json` carries `reconciliation.credited` — **neither is rendered anywhere**. July's credit
note appears as a table row and as a pill, but in none of the four numbers above it: `billed`
excludes negative totals by design, and the separate figure D18 promised was never added.

---

### P1-1 · The two columns this feature exists for are off-screen at every scroll position

| Viewport   | Table width | Visible | Hidden           | Where `Payment` starts                                           |
| ---------- | ----------- | ------- | ---------------- | ---------------------------------------------------------------- |
| 1512 × 950 | 2968px      | 1364px  | **1604px (54%)** | x = 1672 → **308px past the right edge**                         |
| 1280 × 800 | 2342px      | 1132px  | **1210px (52%)** | also past the edge, along with Invoice Date, Due Date and Status |

At rest, `Payment` and `Balance Due` are past the right edge. Scrolled fully right, both sit behind
the 262px sticky left block (checkbox + Invoice Number). There is a narrow band of scroll offsets
where they are readable (≈620px), and neither the default nor either extreme is in it. The feature's
own columns are the hardest two in the table to see.

### P1-2 · 17 columns, and the five least useful are the ones with permanent seats

The table carries `Invoice Duration`, `Line Item Total`, `Tax Amount`, `Grand Total` and
`Report Distributed At` — 918px of width for document subtotals. Meanwhile **every listing row
already carries `daysOverdue` and `agingBucket`** (`invoice.mock.js:847–855`) and neither is
rendered. The single most decision-relevant fact about an open balance — how late it is — is on
the wire and thrown away, while tax subtotals hold the space.

Q11 offers "drop the subtotals, or add a column picker". Stripe does both: a lean default plus
**Edit columns**. Recommended default set: Invoice Number · Customer · Site · Invoice Date · Due
Date · Days Overdue · Status · Payment · Balance Due · Grand Total · actions.

### P1-3 · Every open balance is red, including invoices that aren't late

`balanceDueOpen` applies `textAlert` to any balance > 0 (`invoiceStyles.js:133–136`). On the default
period, 7 of 8 rows are red — including `INV-2026-08032`, raised 11 Aug and due 10 Sep. A month
where nothing is wrong reads as an emergency, and once everything is red, nothing is. The
`agingBucket` needed to colour this correctly is already on the row.

### P1-4 · "Status" and "Payment" sit adjacent and render identical chips

D4 makes the adjacency deliberate, and the reasoning holds. The execution does not:

- `In Progress` chip: bg `rgb(245,245,246)`, fg `rgb(91,91,95)`
- `Unpaid` chip: bg `rgb(245,245,246)`, fg `rgb(91,91,95)`

Pixel-identical, in adjacent columns, meaning entirely different things — one is accounting-sync
state, one is money. Two columns both called something-status, neither label saying which.
Rename to **Sync Status** and **Payment Status**, and give the two axes different chip shapes.

### P1-5 · "Never issued" restates the Status column on every row that has it

The flag is `status !== sentToSage && balanceDue > 0` (`invoice.mock.js:563`) — fully derivable from
the cell immediately to its left. All five instances in the default view sit beside `Pending`,
`In Progress` or `Sync Failed`. This is precisely the redundancy D15 removed for `unpaidOverdue`,
and the same reasoning applies: it earns its place as a **pill** (a count worth filtering by) and
in Outstanding (no Status column there), but not as a per-row chip here. Removing it also removes
the second chip that is forcing the row height (P2-2).

### P1-6 · The pill row mixes a partition with an overlay in identical styling

`8 All · 7 Unpaid · 1 Paid | 5 Never issued`. Payment states partition the period (7 + 1 = 8).
Discrepancies overlay it (the 5 Never issued are 5 of the 7 Unpaid). A reader can sum 7 + 1 + 5 = 13
against an "All" of 8. The only thing distinguishing the two kinds is a 1px divider that nothing
explains. Label the groups ("State" / "Exceptions"), as the Outstanding tab already does with its
two legends.

### P1-7 · The tab is called "All Invoices" and shows 8 of 34

`tabs.invoices: "All Invoices"` against D12, which makes this view always period-scoped. The label
was accurate before the feature and is now the opposite of what the tab does. **Invoices** or
**Activity** would be honest, or the period could move into the tab label.

### P1-8 · "Report Distributed At" is not invoice vocabulary

`deliveredAt: "Report Distributed At"`. It is the date the invoice was delivered. Pre-existing
label, but it is one of the 17 columns competing for space with Balance Due.

---

### P2-1 · The invoice number — the identifier the search box searches — is truncated

`INV-2026-08032` renders as `INV-2026-0…`. Measured: the text needs **116px** and has **100px**.

The 180px sticky column spends 80px on chrome: 48px cell padding + a 20px chevron + a 12px gap.
The chevron is `visibility: hidden` until row hover (`invoiceStyles.js:60–72`) but **reserves its
space permanently**, so an icon that is invisible 99% of the time is what clips the primary key.
Two independent fixes, either sufficient: absolutely position the chevron, or widen the column.

`tableWrapperUS` also sets `th:nth-child(2)` to 180px and `td:nth-child(2)` to 140px
(`invoiceStyles.js:253–268`) — the header and body disagree about the same column.

### P2-2 · Row heights are ragged: 61px where the Payment cell holds two chips, 48px where it holds one

5 of 8 rows at 61px, 3 at 48px, in one table. The shared table sets `height: 48px`
(`table.styles.js:45`, `:61`); D19 states one field per cell, one line, 48px rows. `paymentStateCell`
sets `flexWrap: 'wrap'` in a 141px column, so a state chip plus a discrepancy chip cannot sit on one
line. The feature broke its own stated rule in the one component it added to the table. Fixing
P1-5 fixes most of this for free.

### P2-3 · The fourth row action renders outside the card

The action cell is 143px with 24px padding → **95px** of content box. Rows with four buttons need
**152px** (4 × 32 + 3 × 8), `overflow: visible`. 5 of 8 rows are four-button rows, and the red
delete icon lands on the page background beyond the white card's right edge. Screenshot-verifiable
at 1512px. This is the "labelled button won't fit" gotcha (§5.9) recurring as "four icons won't fit".
Either an overflow menu past three actions, or surface actions on hover as the pattern literature
recommends.

### P2-4 · The sticky action column overlays the column beneath it

143px, `position: sticky; right: 0`, opaque white (`invoiceStyles.js:269–285`). At 1512px it clips
`Invoice Date` to `2026-08-`; at 1280px it slices the Contract chips. A sticky column needs a
reserved gutter or a fade, not an opaque overlay on live data.

### P2-5 · Row hover paints three different colours

Hovering a row produces, left to right: `#f2f2f2` on the checkbox + invoice-number cells (hard-coded
hex, not a token — `invoiceStyles.js:6`), `surfaceBrandSubtle` across the middle
(`table.styles.js:281–283`), and **pure white** in the sticky action cell, which carries its own
`background: surfaceWhite`. One row, three tones, clearly visible.

### P2-6 · An applied filter looks almost exactly like a hovered one

| State  | Background            | Extra                |
| ------ | --------------------- | -------------------- |
| Hover  | `rgba(16,24,40,0.06)` | —                    |
| Active | `rgba(16,24,40,0.08)` | 1px inset brand ring |

A 0.02 alpha difference plus a hairline ring on a 20px-tall control. It read as "applied" to me
twice in this session while I was specifically looking for it, and both times it was hover.
An applied filter is state, not decoration — it should be as loud as a selected tab.

Two related notes: the ring is **brand green**, the same green that means paid/collected everywhere
else in this view; and `Clear filters` is a third way to do what clicking the active pill and
clicking `All` already do.

### P2-7 · Applying a filter pushes the table down 16px

The pill row grows **43px → 59px** when `Clear filters` appears, because a full-height MUI Button
joins a row of 20px pills. Measured: table top 444 → 460. Every filter click jolts the rows you
were reading. Reserve the row height, or make Clear a 20px control.

### P2-8 · Money is left-aligned, unseparated, and unsigned

`10659.60`, `1296.00 credit` — left-aligned, no thousands separators, currency in the header
(`Balance Due ($)`) rather than the cell, and the sign of a credit carried by an appended word.
The strip 200px above uses `$32,896.80`. Two money formats in one view, and the table's is the one
NN/g explicitly warns against: numerals are only comparable when right-aligned on the decimal.

### P2-9 · The empty state renders off to the right

`No Record Found` centres on the **table's** 2968px width, so at a 1364px viewport it lands well
right of centre — mostly outside the visible area. It should centre on the scroll viewport.

### P2-10 · The Payments affordance is the quietest control in the row

- **Enabled:** the only grey glyph (`#6A6A70`) among blue and green ones — it reads as disabled.
- **Disabled:** effective **25% opacity**. `classes.buttonDisable` applies `opacity: 0.5`, and
  `pay-now-disabled.svg` is `pay-now.svg` wrapped in `<g opacity="0.5">`. The fades compound. Every
  other disabled control in the row sits at 0.5.

This is the primary new affordance of the whole feature (D6). Delete the `-disabled` asset and let
the button's own disabled state do the work.

### P2-11 · Chip details

- Filled chips are 26px, outlined chips 28px — both in the same cell, so the two chips in a
  Payment cell don't share a baseline.
- The `Never issued` outlined chip has `borderColor` === `backgroundColor`
  (`rgb(251,238,237)`), so its outline is invisible and it renders as a filled chip. The intended
  filled-state / outlined-discrepancy distinction does not exist on screen. Same family as the
  warning-chip problem already noted in README §5.
- `invoiceButtonClass` uses the literal CSS keyword `green` (`invoiceStyles.js:393–395`) — the only
  non-token colour in the module.

### P2-12 · The overview takes more vertical space than the table it describes

At 1280×800: widget **199px**, table scroll viewport **260px**. 3.5 of 8 rows visible; the fourth is
sliced through the middle with no fade or affordance. The widget is right to be permanent (D13),
but at laptop size it is 77% of the height of the thing it annotates. The stat strip is 97px of it
— a two-line strip would buy back a row and a half.

---

### P3-1 · Payment and Balance Due are unreachable by keyboard

The horizontal scroll container has no `tabindex`, no `role`, and no label. The cells it hides
contain no focusable elements, so there is nothing to Tab to that would scroll them into view.
A keyboard-only user cannot read the two columns this feature added. WCAG 2.1.1.

### P3-2 · The pills' accessible names are wrong or missing

MUI `Tooltip` promotes its title to the accessible name, so the pill labelled **"8 All"** announces
as _"Every invoice raised in this period"_ — the visible label is not in the accessible name
(WCAG 2.5.3, Label in Name). The two pills with no tooltip (`Unpaid`, `Paid`) surface with **no
accessible name at all**. Move the explanation to `aria-describedby` and keep the visible text as
the name.

### P3-3 · Several row-action buttons are unnamed

The Payments and Delete buttons announce as bare `button`. `Tooltip` wraps a `<span>` for the
disabled case, so the label lands on the span and the button inside it inherits nothing. Sync and
retry actions are named; the two that move money and data are not.

### P3-4 · Pill hit targets are 20px tall

20px high, ~9px apart. A 24px target circle intersects its neighbour, so the WCAG 2.5.8 spacing
exception doesn't apply either.

### P3-5 · The hint line carries the most important caveat at 3.62:1

`rgb(134,134,139)` on white at 12px = **3.62:1**, below AA. That line is where
_"includes $8,745.41 for earlier invoices"_ lives — the single sentence that stops the strip from
being misread (P0-4). The most load-bearing text in the widget is its least legible element.

### P3-6 · The app never sets a page background — and that invalidates one of the design record's premises

_Pre-existing, app-wide, not caused by this feature._

No background colour is set on `html`, `body`, `#root`, or the layout containers
(`appMain.module.scss`). The page inherits the browser canvas. So:

- **Light-scheme browser:** the view renders as intended. Everything is legible.
- **Dark-scheme browser:** the canvas is black, and the three toolbar filter labels — `Site Name`,
  `All Statuses`, `All Types` — render `#262527` on black at **1.38:1**. They are effectively
  invisible. Verified by toggling only the browser colour scheme, same URL, same state.

The consequence for this feature: README §5 records "the page shell behind it is **dark**, so its
content sits on a single white card … transparent sections render near-black-on-near-black". That
is not a design constraint — it is a browser artefact. The single-white-card treatment on both the
period overview and the Outstanding tab was designed around a phantom. Setting one page background
token fixes three unreadable filters _and_ reopens the card decision.

### P3-7 · Dead code

`showHandCursor` compares against `columnIdsEnum.name`, which does not exist, so it is always `''`
(`invoices/index.jsx:658`). The pointer cursor works by accident, via `ZonesTD`. Unused i18n:
`reconciliation.ofBilled`, `paymentStates.dropdownLabel`, `paymentStates.all` (left from the removed
dropdown), `reconciliation.credited` (see P0-6).

---

## 4. What is right, and should not be touched

Stated plainly so the list above isn't read as a verdict on the whole thing.

- **D13 was the correct call, and the prior art agrees.** A permanent, period-scoped summary
  directly above the rows it describes is what QuickBooks and Stripe both do. Putting it in a
  drawer was the mistake; taking it out was right.
- **Counts on the pills before you click them.** Filters that say what they'd leave behind are
  better than filters that make you find out. This is genuinely good.
- **The pill reset on period change works.** Verified: an active `Unpaid` pill was correctly
  dropped on switching to Last month, and the table returned to 9 of 9.
- **Sticky first column, human-readable identifier first.** Both NN/g recommendations, both done.
- **The divided stat strip really does match the OBX dashboard.** Side by side, the idiom is the
  app's own. D19 was learned properly.
- **`againstEarlier` is the right concept.** Splitting receipts by which period's invoices they
  settle is the actual insight in this view. It is the presentation that fails it, not the model.
- **Every column declared sortable renders a sort control**, including Balance Due. Checked
  because it was a plausible miss; it isn't one.

---

## 5. Suggested order

1. **P0-1** (the boundary bug) before anything else — the view currently misstates a total.
   Then **P0-2** and **P0-5**: make the strip's scope true, and make Export carry the view.
2. **P0-3 / P0-4**: decide the credit-note clamp (Q5) and either relabel or recompute `Collected`.
   Both are decisions, not code.
3. **P1-1 / P1-2** together: cut the five subtotal columns (or add Stripe-style _Edit columns_),
   pull `Payment`, `Balance Due` and days-overdue into the default view, and split `Still open`
   into not-yet-due / overdue on the QuickBooks pattern. This is the change that makes the feature
   visible at all.
4. **P1-4 / P1-5 / P2-2** as one pass: rename the two status columns, drop the redundant
   `Never issued` chip, and the 61px rows resolve themselves.
5. **P2-1, P2-3, P2-4, P2-5, P2-8** — the craft pass. Small, visible, cheap.
6. **P3-6** first among the accessibility items: one background token, three filters recovered,
   and the card premise reopened. Then P3-1 through P3-5.

## 6. Questions this audit raises that D1–D19 don't cover

Numbered on from the README's list.

- **Q19** Should the period overview reflect the toolbar filters, or declare itself franchise-wide?
  (Q12 asks this of the site filter only; P0-2 shows it applies to search, status and type too.)
- **Q20** Should `Collected` be a settlement-to-date figure or a CEI-style collectible-only figure?
  They answer different questions and only one belongs in a four-stat strip.
- **Q21** Does a period close run to the last _instant_ of the closing day, or to its start? P0-1 is
  a bug either way, but the answer decides which end to normalise to.
- **Q22** Does Export mean "the current view" or "a date range"? If the former, the modal should go
  and the button should just export what is on screen.
