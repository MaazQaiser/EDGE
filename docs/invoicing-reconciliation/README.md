# Invoicing — reconciliation & outstanding

**Status:** first draft built, frontend only · **Written:** 2026-08-11 · **Branch:** `feature/scheduler-ui-refresh`
**Nothing is committed.** All work is in the working tree.

The presentable version of this record is **`01-discovery.html`** — open it in a browser for the
client meeting. This file is the text record: the same decisions and open questions, plus the
implementation notes that don't belong in a client deck.

---

## 1. What the feature is

Insight into payments, and the discrepancies. Three questions:

1. What have we billed?
2. What actually came in?
3. Where do those two disagree?

Delivered as **two views over the same ledger**:

- **Outstanding tab** — where the money stands _today_. One number (what you're owed), an aging rail
  that filters, an exception row that filters, then a customer work queue that expands to invoices.
- **Reconciliation drawer** — what happened _in a period you pick_. Opens from the All Invoices
  toolbar (and from the Outstanding tab). Billed / received / still open for the range, receipts split
  by which period's invoices they settle, discrepancies in the window, every receipt listed, CSV out.

Plus a payments ledger drawer per invoice, and payment state surfaced on the existing invoice list.

## 2. Decisions (D1–D19)

Each is reversible. The reasoning matters more than the choice — argue with the reasoning.

| #       | Decision                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | Because                                                                                                                                                                                                                                                                                                                                                                                                    |
| ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **D1**  | Reconciliation = payment insight + discrepancy detection. Not statement matching, not a Sage/QuickBooks audit.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | Matching needs a ledger to match against. A drift audit depends on Q1.                                                                                                                                                                                                                                                                                                                                     |
| **D2**  | Outstanding is a tab inside Invoices, not a new top-level page.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | Same records, two readings. Reuses the existing filter bar and table; avoids splitting invoice work across destinations.                                                                                                                                                                                                                                                                                   |
| **D3**  | Payments are first-class records with a **nullable** `invoiceId`, not fields on the invoice.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | A receipt can match no invoice, the wrong invoice, or arrive twice. Balance/paid/flags are all derived, never stored twice.                                                                                                                                                                                                                                                                                |
| **D4**  | Payment state is its own column adjacent to sync Status; discrepancy chips share the payment-state cell.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | The pair tells the reader whether an unpaid invoice is the customer's problem or ours. Chips qualify the state ("paid, but late"), so they belong beside it.                                                                                                                                                                                                                                               |
| **D5**  | Aging is measured from **due date**: not-yet-due / 1–30 / 31–60 / 61–90 / 90+.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | The question is how late the money is, not how old the paperwork is.                                                                                                                                                                                                                                                                                                                                       |
| **D6**  | One "Payments" action on every issued invoice, replacing the QuickBooks-only "Pay Now" popover. Disabled until the invoice is issued.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | Recording what a customer sent is bookkeeping every franchise does. Money cannot arrive against an invoice the customer has never seen. **Real behaviour change — confirm via Q3/Q10.**                                                                                                                                                                                                                    |
| **D7**  | Amount is editable, pre-filled with the outstanding balance; overpayment warns but is allowed.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | Pre-filling keeps the common case one click and makes a part payment a deliberate edit. Blocking overpayment pushes the discrepancy off-system.                                                                                                                                                                                                                                                            |
| **D8**  | Mis-keyed receipts are **reversed**, not edited.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | A ledger that can be quietly rewritten can't be trusted.                                                                                                                                                                                                                                                                                                                                                   |
| **D9**  | Credit notes get their own payment state ("Credit note"), and only a genuine surplus counts as an overpayment discrepancy.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | A credit note's negative balance is money we owe them — different from a customer sending too much.                                                                                                                                                                                                                                                                                                        |
| **D10** | Aging/discrepancy filters narrow the customer queue but never change the headline totals.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | Otherwise the reader loses the number they were reasoning about the moment they drill in.                                                                                                                                                                                                                                                                                                                  |
| **D11** | Frontend only — the module runs entirely on a local mock domain.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | No backend exists in this repo; see §5.                                                                                                                                                                                                                                                                                                                                                                    |
| **D12** | **Two surfaces, two questions.** All Invoices is always scoped to a **period** (default: this month) and answers "what happened"; Outstanding is unscoped and answers "where do we stand today".                                                                                                                                                                                                                                                                                                                                                                                                                                    | They are different reads of the same records. Scoping the listing to a stated window also makes the numbers above it mean something — an unscoped "billed" total is just a lifetime figure nobody asks for.                                                                                                                                                                                                |
| **D13** | **The period overview is a permanent widget on All Invoices, not a drawer.** Stat strip (billed / received / still open / collected), period presets + range, then filter pills. The drawer that used to hold this was deleted.                                                                                                                                                                                                                                                                                                                                                                                                     | The numbers describe the very rows on screen, so putting them behind a button meant the table's own totals were only visible somewhere else. Always-on also makes the scoping honest: the table is always filtered to a window, and now the window is stated.                                                                                                                                              |
| **D14** | Aging and exceptions are **controls, not readouts**: a 6px proportion bar for shape, a row of buttons to filter by.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | They were always filters wearing the costume of a readout, which is most of why the page felt like a dashboard.                                                                                                                                                                                                                                                                                            |
| **D15** | The "unpaid, overdue" chip is **not shown in the Outstanding tab** — aging says _when_, the Unpaid state says _whether_. It **is** shown as a pill in the period overview, which has no aging rail.                                                                                                                                                                                                                                                                                                                                                                                                                                 | Same information three times is noise. The deliberate inconsistency is justified by context: in the drawer it is the only thing marking those invoices as late.                                                                                                                                                                                                                                            |
| **D16** | The mislabelled "Invoice Reconciliation" toolbar button is **gone** — the always-on period overview replaces it.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | The label finally describes what happens. The old payroll-CSV modal is unwired (file kept — its stylesheet is shared with the export modal).                                                                                                                                                                                                                                                               |
| **D17** | In the period view, **invoices count by the date they were raised, receipts by the date the money arrived**, and receipts are split into "settling this period" vs "settling earlier invoices".                                                                                                                                                                                                                                                                                                                                                                                                                                     | Those two sets never line up, and the gap _is_ the reconciliation. Summing them into one figure would hide the only insight the view has.                                                                                                                                                                                                                                                                  |
| **D18** | Credit notes are reported as their own figure in the period view, not netted into "billed".                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | Netting made "still open" exceed "billed", which reads as a bug even when the arithmetic is right.                                                                                                                                                                                                                                                                                                         |
| **D19** | **The app's existing idioms, not new ones.** Three were copied rather than invented: the **divided stat strip** (dot + label + value, hairline dividers, no cards) from the OBX dashboard; **inline filterable counts** (marker + bold value + label, 6px hover, inset brand ring when active) from `schedules/components/scheduleStatsFooter`; and **the shared `TableComponent` left alone** — it already sets 48px rows, 24px cell padding, a sticky first column and the hover tint, so cells hold one field on one line and the expansion is a nested table like payroll's. Column labels are Title Case, matching the module. | Token-level compliance is not the same as looking like the product. An earlier pass used correct Typography variants and Button variants and still looked foreign, because the _compositions_ were invented: KPI cards where the app uses a divided strip, bordered filter buttons and chips where the app uses inline counts, and two-line table cells where every other table in the app is single-line. |

### D20–D24 — the All Invoices rebuild (2026-08-12)

Added after the audit in `02-all-invoices-audit.md`; the reasoning is in
`03-all-invoices-proposal.md`. These are **additive**. The only one that revises anything
earlier is D21, and it relocates D17's presentation rather than reversing its reasoning.

| #       | Decision                                                                                                                                                                                                                                                                                                                                                                         | Because                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **D20** | **The summary describes exactly the rows in the table.** It is fetched with the listing's own query (`scopeQuery`), so period, site, sync status, type and search all move both. State and discrepancy pills narrow only the rows, because their counts _are_ the decomposition of the summary; a counted line says which is happening. **Search escapes the period.**           | D13's own justification, enforced structurally instead of asserted. Two scopes is how you get totals for nine invoices above an empty table — and the period silently ANDed onto search made 26 of 34 invoices unfindable from the default view. Keeps D10 intact by giving it a rule rather than an exception.                                                                                                                                           |
| **D21** | **One clock.** Billed, Received and Still open all describe the same invoices as of today, so `billed − received = stillOpen` closes on screen. `Received` is money paid **against these invoices**, whenever it arrived. `Still open` splits into not-yet-due / overdue. `Credited` and any held surplus are reported separately. **`Collected %` is deleted.**                 | Four figures on one rail assert they are one family; three were as-of-today and one was cash-in-window, so the reader could not reconcile them and the useful number appeared nowhere. Not-yet-due vs overdue is the first split every accounting product leads with. `Collected %` divided by billing that is mostly not yet due, so mid-month it always alarmed.                                                                                        |
| **D22** | **A default column set plus a column picker.** Ten data columns ordered money-first (identifier, customer, site, due, balance, payment, sync status, total); the document subtotals move behind `Columns`, persisted per user. Money is right-aligned with grouped thousands, negatives in parentheses, and the currency stated once on the summary rather than in every header. | Seventeen columns put the two columns this feature exists for 300px past the right edge. Dropping them outright would take fields somebody depends on, so the lean default is what an AR reader decides from and the rest is one click away — the same answer Stripe, Xero and QuickBooks reached.                                                                                                                                                        |
| **D23** | **One filter bar, on the card with the numbers it moves**, plus a counted line (`Showing 4 of 10 invoices in this period · 1 filter applied · Clear all`). Applied pills are **filled**, not ringed. Rows are height-reserved so filtering never moves the table.                                                                                                                | A filter bar somewhere else is a second scope (see D20). A 0.02-alpha background shift plus a hairline ring was indistinguishable from hover, so "is this filtered?" could not be answered by looking. The counted line is the whole fix for the empty-table-under-a-full-summary class of bug.                                                                                                                                                           |
| **D24** | **The app shell declares a page background (white) and `color-scheme: light`, and the cards sitting on it carry a hairline border.**                                                                                                                                                                                                                                             | Nothing set one, so the page inherited the browser canvas: on a machine in dark mode that is black, and the app's near-black text tokens rendered the three filter labels at 1.4:1. It also means §5's "the page shell is dark" was a browser artefact, not a design constraint. White is what a light-scheme browser was already painting, so the look is unchanged — but a white card on a white page is not a card, which is what the hairline is for. |

Row actions now cap at two inline (view, payments) with the rest behind `⋯`, which is
both the convention and the fix for a fourth icon rendering outside the card.

**D25 — the layout the client asked for (2026-08-12, after review).** Five corrections to D22–D24,
all of them about how the surface reads rather than what it says:

| Change                                                                                                                                                        | Because                                                                                                                                                                                                                                   |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **The page background is white**, not a grey page surface, and the cards' hairline borders came off with it                                                   | White is what a light-scheme browser was already painting; a grey surface was a redesign smuggled in behind a bug fix. Declaring white keeps D24's fix (dark-mode canvas) without changing the look.                                      |
| **Unselected period presets are neutral grey**, selected stays brand-filled                                                                                   | Five brand-coloured buttons in a row all read as chosen, leaving the one that is with nothing to distinguish it.                                                                                                                          |
| **One controls row: scope filters left, period right.** The always-visible range input became a fifth preset, `Custom`, that swaps into the presets' own slot | Two rows cost 53px for no gain, and presets plus a 236px range field wrapped the row at 1512 — which would move the table every time someone reached for a custom period. Presets-plus-Custom is also what every accounting product does. |
| **The breakdown pills and the count of what they leave share one bar**, with `Columns` joining them on the right                                              | They are the same subject — what is in the table right now — and two bars said so twice.                                                                                                                                                  |
| **Equal thirds in the metric strip** (`Still open` no longer gets 1.6×)                                                                                       | The extra room made it read as one headline and two subordinate figures. All three describe the same invoices and are compared left to right.                                                                                             |
| **The table is open, not contained** — no outer border, no radius, matching the dashboard and the other main listings                                         | The app separates regions with hairlines rather than cards and shadows (D19). A bordered card here was the odd one out.                                                                                                                   |

Net effect: the summary and filter chrome went from **281px to 194px** at 1512 while gaining a
control, and the table gained a row and a half.

### D26 — one shape per idea (2026-08-12, second review)

The client's note: _"In All Invoices the user should be able to filter unpaid invoices. Remove
the Columns button, remove the '8 invoices in this period' text, refine the stats. In
Outstanding the UI is all over the place — balance it, remove 'Never issued' and 'Short paid',
make the rest coherent. Nothing is AI slop."_ Six changes; the last two revise D15, D20 and D22.

| Change                                                                                                                                                                                                                        | Because                                                                                                                                                                                                                                                                                        |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Payment state is a dropdown in the filter row** (All Payments / Unpaid / Part paid / Paid / Overpaid / Credit note), and the summary follows it like every other filter                                                       | "Show me what is unpaid" is the most common request this table gets. As counted pills it was a second row of controls that filtered rows _without_ moving the figures above them, which needed a line of prose to explain itself. **This reverses the removal of the dropdown noted under D25.** |
| **The exception pills are gone**, and with them the counted line and the `State` / `Exceptions` labels                                                                                                                         | Four of the five classes restate an adjacent column: `shortPaid` ⇔ the Part paid chip, `overpaid` ⇔ the Overpaid chip, `unpaidOverdue` ⇔ Unpaid + the Due column, `notIssued` ⇔ Sync Status. Only `paidLate` is independent, and it stays as a chip in the Payment column. **Revises D15.**       |
| **The metric strip is four equal cells — Billed / Received / Not Yet Due / Overdue** — each the same three lines: marker and label, the figure, one qualifying line                                                             | `billed − received = notYetDue + overdue` still closes on screen, and the two things a reader acts on — waiting and chasing — get a cell each instead of sharing one under a progress bar with two inline counts in it. **Replaces D25's "equal thirds".**                                       |
| **The last two cells are the aging filter.** They are the only control that narrows the table without moving the figures, because the reader clicked one of those figures to get there; the pressed cell says so without prose | This is what `ignoreAgingSplit` in the mock now means — it used to be `ignoreStateFilters` and covered payment state and discrepancies too. **Revises D20:** every control in the filter row moves the summary, no exceptions.                                                                   |
| **The column picker is gone.** The ten money-first defaults are simply the columns                                                                                                                                             | A picker over 18 columns is a preference surface for a decision D22 already made well. The eight it hid are document subtotals, which the invoice drawer shows per invoice. **Revises D22.**                                                                                                    |
| **Outstanding: two strips of equal cells, and no exception legend.** Position (owed / overdue / credits held) on top; the same balance by age below it, five bands that _are_ the filter                                        | The legend it replaces filtered to nothing for `paidLate` (settled invoices are not in this queue, so a legend reading "2 Paid late" emptied the table), and duplicated Credits Held for `overpaid`. See the queue-column note below.                                                            |

**D26a — nothing above the table may change height (2026-08-12, same review).** Two things did:

- The **credited / surplus band** appeared only in periods that had a credit note or a held
  overpayment, so switching from This month to Last month pushed the table down 33px. Both facts
  now ride on the hint line of the figure they qualify — `9 invoices · $1,296.00 credited` under
  Billed, `from 3 invoices · $258.00 overpaid` under Received. The line is always there and
  sometimes says more, which cannot move anything. Verified: strip 93px and table top 295px in
  both periods.
- The **selection bar** opened a band of its own the moment a checkbox was ticked. Selection now
  takes the slot the period presets occupy, inside the existing row — the period is not what
  anyone is thinking about with four invoices ticked and an approval to push. Verified: table top
  295px with and without a selection.

That slot now holds four things that take turns: the presets, the custom range, the
"searching all invoices" note, and the selection's actions.

**Defect worth remembering:** the metric strip lost the divider between `Not yet due` and
`Overdue` because `stat` cleared its right border with `:last-of-type`. An aging cell with
matches renders as `<button>` and the plain cells as `<div>`, so `:last-of-type` matched the last
of *each* type. It is `:last-child` now. Any strip whose cells can change element type has this
bug waiting in it.

The Outstanding queue also changed shape: `Customer · Customer ID · Open Invoices · Balance Due ·
Overdue · Oldest Overdue`. Three of the old seven columns named the same party (customer,
customer ID, site) while nothing said how many invoices were behind the balance or how much of
it was late. Site came off because a customer can be billed for several sites and the row is a
customer — printing the first one read as fact. Row figures describe the invoices _visible_
under them, so with a band applied the rows and the counted line agree.

### Where each filter lives

One home per concept — an earlier version asked for the same thing twice (two date ranges,
and later a payment-state dropdown _and_ payment-state pills):

| Concept                                                                                  | Control                                                                          | Why there                                                                                                                                                  |
| ---------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **When** — the period                                                                    | Overview: presets (This month / Last month / Last 3 months / YTD) + range picker | Governs both the strip and the table, so it belongs with the numbers it explains. The separate toolbar date range was removed.                             |
| **Money state** — paid / part paid / unpaid / overpaid / credit note                      | Overview: the `All Payments` dropdown, beside the other scope filters                | It reads as a filter because it is one, and the strip above moves with it like it does for every other filter in that row (D26). |
| **How late** — not yet due vs overdue                                                    | Overview: the last two metric cells, which are buttons                               | The reader is already looking at the figure they want to narrow to. The only filter that leaves the strip alone (D26).           |
| **Document state** — sync status, type                                                   | Toolbar dropdowns                                                                | Unrelated to money; these are about the invoice as a document.                                                                                             |
| **Who / which** — search, site                                                           | Toolbar search + dropdown                                                        | Standard listing filters, unchanged.                                                                                                                       |

The aging split resets when the period changes: a band with matches in August may have none in
July, and carrying one across a period change applied a filter that was about to disappear —
which showed as an empty table under a strip claiming nine invoices. A reactive guard in
`periodOverview` steps out of a band that empties for any other reason.

### Discrepancy taxonomy

Built (derivable from one invoice + its ledger):

1. **Short paid** — money arrived, less than invoiced
2. **Overpaid** — more arrived than invoiced
3. **Unpaid & overdue** — nothing arrived, past due
4. **Paid late** — settled in full, after the due date
5. **Never issued** — raised but never pushed to accounting, so it can never be paid; our fault, not the customer's

Of those five, only **Paid late** still has a UI, as a chip in the All Invoices Payment column.
The other four are each already stated by a column beside them, which is why D26 removed the
pills and the legend that showed them. They stay in the model — `getInvoiceFlags` is unchanged —
because the taxonomy is what a real reconciliation feature would grow from, and because
`discrepancy` is still a query the mock honours.

Deferred (need cross-invoice reasoning; **the model supports them, no screens exist**):

6. **Unidentified receipt** — money matching no invoice
7. **Duplicate payment** — same reference applied twice
8. **Unapplied credit** — open credit note against a customer who owes

## 3. Open questions

**Blocking — these change the model or the permissions:**

- **Q1** Who owns payment truth: Filter Go, or Sage/QuickBooks? If the accounting system does, this
  becomes a read-only mirror + drift check and recording payments here is the wrong affordance.
- **Q2** What does an incoming payment physically look like to the back office (remittance advice,
  bank statement, cheque, portal)? Decides whether discrepancies 6–8 are real, and whether statement
  import is a later phase or never.
- **Q3** Should recording/reversing a payment be a separate permission from editing an invoice? Today
  anyone with `ACL_OBX_INVOICES_UPDATE` can declare money arrived. Does reversal need an audit trail?
- **Q4** Are 30/60/90 bands right for terms that run 7–30 days, and is due-date aging your convention?

**Soon — these change screens:**

- **Q5** Should credits be applicable to open invoices in-app? (Related defect: the invoice list shows
  credit notes as `$0.00` because `calculateGrandAmount` clamps negatives, while Outstanding shows the
  true signed figure. The two surfaces disagree until this is settled.)
- **Q6** Overpayment policy: hold as credit, refund, or refuse?
- **Q7** On a part payment, capture promised amount and date?
- **Q8** Who chases? Owner / chase status / last-contacted — report vs workflow.
- **Q9** Statement of account per customer?
- **Q10** German franchises hide push-to-accounting entirely. Do they get Outstanding, can they record
  payments, and should "never issued" be suppressed for them?
- ~~**Q11** The invoice list is now 17 columns. Drop tax + line-item subtotals, or add a column picker?~~
  **Settled by D22** — lean default plus a picker, both.
- ~~**Q12** Should the period overview also respect the site filter, or is franchise-wide
  the right scope for a period close?~~ **Settled by D20** — it respects every scope filter,
  including site. Say so if the client wants franchise-wide totals instead; it is one flag.
- **Q13** Are the four presets (this month / last month / last 3 months / year to date) the right ones,
  and does your billing period run to calendar months?

**Raised by the audit (2026-08-12):**

- **Q19** `Collected %` is gone from All Invoices (D21). Does a collection-rate KPI belong in
  Outstanding instead, and should it be CEI (collectible-only) rather than billed-based?
- **Q20** A period runs to the last instant of its closing day — both endpoints now agree on
  that (see the defect table). Confirm that matches how the franchises close a month.
- **Q21** Export now exports the current view rather than asking for two dates. Is "the view"
  always what they want, or is there a case for a separate date-range extract?
- **Q22** The invoice `Total` column shows the true signed figure, so a credit note reads
  `(1,296.00)` rather than `0.00`. `calculateGrandAmount` still clamps elsewhere in the app —
  see Q5; this made the listing consistent with Outstanding, it did not settle the clamp.

**Later:**

- **Q14** Automated dunning/reminders, or always a human decision?
- **Q15** Write-offs — who approves, what's left behind? Without it, ancient debt poisons every total.
- **Q16** Multi-currency per franchise?
- **Q17** Is "customer disputes this" a state to record?
- **Q18** Per-customer outstanding inside Site → Billing? (An orphaned per-site invoices tab already
  exists in the codebase — `sites/detail/components/invoices`, imported nowhere.)

## 4. Defects found and fixed

| Defect                                                                                                                              | Impact                                                                                                                                                            | Status                                                                                   |
| ----------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `invoiceDrawer/index.jsx` destructured `state.auth.franchiseInfo` unguarded; it is `null` until a franchise is picked in the header | **White-screened the entire app** on opening any invoice. Every other consumer in the codebase guards it                                                          | fixed                                                                                    |
| `/sites/sites_dropdown` was swallowed by the `/sites/:id` mock matcher                                                              | Site filter permanently empty                                                                                                                                     | fixed                                                                                    |
| "Invoice Reconciliation" toolbar button called the **payroll** CSV endpoint                                                         | Downloaded a file containing `undefined`; and it owned the word "reconciliation" while doing none. **Button removed** — the always-on period overview replaces it | resolved — button removed (D16)                                                          |
| `console.log` inside `calculateGrandAmount`                                                                                         | Fired on every table row render                                                                                                                                   | removed                                                                                  |
| `calculateGrandAmount` clamps negatives to `0`                                                                                      | Credit notes read as `$0.00` in the list                                                                                                                          | listing no longer uses it — renders `(1,296.00)`. The clamp itself is still **open, Q5** |
| **The listing read `periodEnd` as midnight while the summary read it as end-of-day**                                                | Every invoice raised on a period's closing day was missing from the table while counted in the totals above it — $7,171.20 on the July preset                     | fixed — one `periodWindow()`, used by both (D20)                                         |
| Four persistent row-action icons needed 152px in a 95px cell                                                                        | The fourth rendered outside the white card, on the page background                                                                                                | fixed — two inline, the rest behind `⋯`                                                  |
| `pay-now-disabled.svg` bakes in `opacity="0.5"` and the button adds another                                                         | The feature's main affordance rendered at 25% opacity when disabled, twice as faded as any other disabled control                                                 | fixed — one asset, the button's own disabled state                                       |
| The invoice-number column reserved 32px for a hover-only chevron                                                                    | `INV-2026-08032` truncated to `INV-2026-0…` — the identifier the search box searches                                                                              | fixed — chevron absolutely positioned                                                    |
| Row hover painted three colours across one row                                                                                      | `#f2f2f2` on the sticky cells, brand tint in the middle, white in the sticky action cell                                                                          | fixed — hover left to the shared table                                                   |
| The empty state centred on the table's scroll width                                                                                 | "No Record Found" rendered off to the right of the viewport                                                                                                       | fixed — pinned to the scroll viewport                                                    |
| No page background anywhere in the app shell                                                                                        | In a dark-scheme browser the canvas is black and three filter labels rendered at 1.38:1                                                                           | fixed — D24, white + `color-scheme: light`                                               |
| The theme gives `MuiChip-outlinedError` a filled background and a border of the same colour                                         | Exception chips rendered filled, so a payment state and a caveat on it looked like two states                                                                     | fixed locally in both tabs; the theme override is untouched                              |
| Sticky cells paint their own background                                                                                             | A hovered row tinted in the middle and stayed white at both ends                                                                                                  | fixed — sticky cells follow the row's hover state                                        |
| Every value in the Sync Status column began with the column's own name                                                              | "Sync Approved" under a header reading "Sync Status", truncating to "Sync Appro…"                                                                                 | fixed — Pending / In Progress / Approved / Failed                                        |
| Pills' accessible names came from their tooltips; row actions had none                                                              | "8 All" announced as "Every invoice raised in this period"; Payments and Delete announced as "button"                                                             | fixed — `aria-describedby` for hints, real `aria-label`s on actions                      |
| The horizontal scroll region was not keyboard-operable                                                                              | `Payment` and `Balance Due` were unreachable without a mouse                                                                                                      | fixed — `role="region"` + `tabIndex` on the shared table, opt-in                         |
| Date pickers show ISO dates against `MM/DD/YYYY` placeholders                                                                       | `useDateTime` falls back to `YYYY-MM-DD` when `countryConfiguration.dateFormat` is unset, which it is until a franchise is selected                               | mock data now carries `dateFormat`; takes effect once a franchise is chosen              |

Dead code noted, not removed: `sites/detail/components/invoices` (orphaned), `previewInvoiceDrawer`
(rendered with `isOpen={false}`), `components/payInvoice` (superseded by the payments drawer, kept
pending Q3/Q10).

## 5. Implementation notes

The app has **no backend**: every HTTP call funnels through `helper/axios` →
`helper/mockData/urlRouter`. Invoicing was previously wired to a three-line stub returning one fake
row in the wrong shape, so the module was broken rather than connected.

**`src/stubbedData/mocks/invoice.mock.js`** is now the invoicing module's system of record:

- 31 invoices across 5 customers, dated relative to load time, hand-tuned so every payment state,
  aging band and discrepancy class appears on screen. See the `SEED` table's comments for what each
  row is there to demonstrate — **keep the mix** when editing.
- A mutable payment ledger. Recording, reversing, approving, editing and deleting all persist for the
  session, so the flows demo rather than just describe.
- Derived state (`paymentState`, `balanceDue`, `flags`, `agingBucket`) is computed in one place,
  `applyPaymentRollup` + `getInvoiceFlags`, and rides along on every listing row so the two tabs and
  the drawer never disagree.
- Also builds the CSV export and a real single-page PDF (correct xref table) so the preview drawer
  renders actual bytes.

Endpoints added to `urlRouter.js`: `/invoices/outstanding`, `/invoices/:id/payments`,
`/payments/:id` (DELETE), plus proper handlers for list/detail/create/update/delete, bulk approve,
mark-as-paid, line-item refetch, export, PDF, sites dropdown, site contracts, merged/mergeable
contract sets and billing contacts.

New UI:

- `obx/pages/invoices/outstanding/` — the Outstanding tab
- `obx/pages/invoices/components/paymentsDrawer/` — the ledger + record/reverse form
- `obx/pages/invoices/components/reconciliationDrawer/` — the period view
- `obx/pages/invoices/reconciliation.constants.js` — shared vocabulary (payment states, discrepancy
  labels and their tooltips, aging labels, money formatter)

Two layout gotchas worth knowing before editing the Outstanding tab: the page shell behind it is
**dark**, so its content sits on a single white card (one card, not the three panels it replaced) —
transparent sections render near-black-on-near-black; and the page container is a scrolling flex
column, so the card needs `flexShrink: 0` or the queue gets clipped mid-row.

Three component quirks the feature had to work around, worth knowing before extending it:

- `DateRangePicker` keeps its own internal state, so the period overview's presets need
  `syncSelectedDatesOnStateChange` or the input stays blank while the query changes underneath it.
  It also fires its change callback **on mount**, so "which preset is selected" is derived by
  comparing the range to each preset (`presetForRange`) rather than set from the callback — otherwise
  the default preset deselected itself the instant the drawer opened.
- The theme renders `Chip` outlined-warning and filled-warning with near-identical backgrounds, so
  variant alone cannot show a chip's selected state. The exception filters add an explicit
  `textPrimary` border when active, matching the aging buttons' pressed state.
- Long labels clip inside a `Button`: the aging bands stack label over amount in a column rather than
  running on one line.

Ordering gotcha: mock routes are matched narrowest-first by string containment, so
`/invoices/outstanding` must precede `/invoices/:id` and `/shiftActivityLog/payrollCSV` must precede
the generic `/shiftActivityLog` handler. Comments in `urlRouter.js` say so at each site.

i18n keys live under `obx.invoice.{tabs,paymentStates,aging,discrepancies,outstanding,payments}` in
`src/utils/i18next/locales/en/obx.json` (English only so far). Plurals use i18next v4 suffixes
(`_one` / `_other`).

### Locale keys were lost, then rewritten (2026-08-24)

Every one of the ~120 `obx.invoice.*` keys this module added was **never committed**. The JSX
landed in `855bd52`, `obx.json` did not — no commit in the repo's history has
`invoice.{tabs,outstanding,payments,reconciliation,aging,discrepancies}` in it, and the built
bundle under `build/` was made from the same broken tree. So both surfaces rendered raw key
paths (`obx.invoice.tabs.invoices` as a tab label), and because the keys are far longer than the
copy, table cells overlapped and the filter row wrapped.

The copy was **rewritten from this record and the call sites**, not recovered. Anywhere the
strings read differently from the originals, this file and §D26/§D26a were the source. Two
things were decided in the rewrite:

- **The word "Sync" appears once, on the control that names the axis.** The chip labels are
  `Pending / In Progress / Approved / Failed` and the dropdown is `All Statuses`, not
  `Sync Approved` under a column already headed `Sync Status`. `Sync Approved` also overflowed
  its chip — 87px of text in a 70px box — so the redundancy was costing a truncation.
- **The filter row's width budget now includes `Clear all`.** It is a sixth member of the left
  group that appears only when a filter is applied, it was never in the 1324px budget, and it
  pushed the presets onto a second line — moving the table down 44px on every filter, the exact
  defect D26a exists to prevent. Paid for out of the search box (184→160px, the placeholder
  clips at either width), the group gap (8→6px) and the button's padding (6→4px). Verified:
  table top 295px unfiltered, filtered, with a selection, and with the custom range open. The
  17px of slack left is the whole margin — a longer label in this row has to be paid for out of
  another one.

Still English-only. `de/fr/es` fall back per-key to English, so the surfaces are legible in
every language but translated in none.
