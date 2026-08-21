/**
 * Demo data for the invoicing module.
 *
 * The app ships with no backend — every HTTP call funnels through
 * `helper/axios` → `helper/mockData/urlRouter` — so this file *is* the
 * invoicing module's system of record. The listing, the invoice drawer, line
 * items, the CSV export and the invoice PDF are all derived from `invoices`
 * below.
 *
 * Unlike the other files in this folder, this one holds **mutable** state: the
 * module approves, edits, deletes and pays invoices, and those actions have to
 * survive the refetch that follows them or the screens read as broken. Same
 * role `mockData/mockStores` plays for sites, kept local because the invoice
 * shapes (detail vs listing vs line items) are only meaningful here.
 *
 * Dates are generated relative to load time so the demo never looks stale, and
 * the seed is hand-tuned rather than random — see `SEED` for what each row is
 * there to demonstrate.
 */

const DAY_MS = 24 * 60 * 60 * 1000;
const today = new Date();

const clone = (value) => JSON.parse(JSON.stringify(value));
const round2 = (n) => Math.round((Number(n) || 0) * 100) / 100;
const pad = (n) => String(n).padStart(2, '0');

const shiftDays = (days) => new Date(today.getTime() + days * DAY_MS);
const iso = (date) => date.toISOString();
const usDate = (date) => `${pad(date.getMonth() + 1)}/${pad(date.getDate())}/${date.getFullYear()}`;

/** Sites mirror `mockData/mockStores` so cross-links (site detail → billing) line up. */
const SITES = {
  edge: {
    id: 1,
    name: 'EDGE Sync Test Site',
    customerId: 'CUST-4265',
    client: 'EDGE Sync',
    billTo: {
      name: 'EDGE Sync',
      address: '123 Test Street, New York, NY 10007',
      contactPerson: 'Aleena Javed',
      phone: '+1 555 014 4265',
      email: 'ap@edgesync.com',
    },
    contracts: ['Filter Replacement — Core Floors'],
  },
  downtown: {
    id: 2,
    name: 'Downtown Plaza',
    customerId: 'CUST-1002',
    client: 'Downtown Holdings',
    billTo: {
      name: 'Downtown Holdings',
      address: '89 Main Ave, Floor 3, New York, NY 10036',
      contactPerson: 'Laura Bennett',
      phone: '+1 555 386 2210',
      email: 'accounts.payable@downtownholdings.com',
    },
    contracts: ['Quarterly Filter Service', 'Rooftop AHU Service', 'Emergency Call-outs'],
  },
  harborview: {
    id: 3,
    name: 'Harborview Logistics Hub',
    customerId: 'CUST-1003',
    client: 'Harborview Logistics',
    billTo: {
      name: 'Harborview Logistics',
      address: '210 Pier Street, Building C, New York, NY 10004',
      contactPerson: 'Robert Hayes',
      phone: '+1 555 499 1000',
      email: 'finance@harborviewlogistics.com',
    },
    contracts: ['Warehouse Filter Programme', 'Dock Air Quality Add-on'],
  },
  meridian: {
    id: 4,
    name: 'Meridian Medical Center',
    customerId: 'CUST-1004',
    client: 'Meridian Health Group',
    billTo: {
      name: 'Meridian Health Group',
      address: '4 Charter Way, Newark, NJ 07102',
      contactPerson: 'Dana Whitfield',
      phone: '+1 555 771 0180',
      email: 'ap@meridianhealth.org',
    },
    contracts: ['HEPA Programme — Wards', 'Theatre Suite Filters'],
  },
  lakeside: {
    id: 5,
    name: 'Lakeside Retail Park',
    customerId: 'CUST-1005',
    client: 'Lakeside Estates',
    billTo: {
      name: 'Lakeside Estates',
      address: '77 Shoreline Blvd, Jersey City, NJ 07305',
      contactPerson: 'Marcus Feld',
      phone: '+1 555 204 7781',
      email: 'marcus.feld@lakesideestates.com',
    },
    contracts: ['Mall Common Areas'],
  },
};

/** Matches `statusesEnum` in `obx/pages/invoices/index.jsx` — sync state, not payment state. */
export const INVOICE_SYNC_STATUS = {
  syncApprove: 0,
  inProgress: 1,
  sentToSage: 2,
  failed: 3,
};

export const INVOICE_TYPE = {
  scheduled: 'scheduled',
  adHoc: 'ad_hoc',
};

export const PAYMENT_METHOD = {
  cash: 'cash',
  check: 'check',
  bankTransfer: 'bank_transfer',
  card: 'card',
};

const LINE_ITEM_CATALOG = [
  { id: 1, name: 'General Security Services', sageItemId: '1', unit: 'visit' },
  { id: 2, name: 'Patrol Services', sageItemId: '2', unit: 'visit' },
  { id: 3, name: 'Dispatch Services', sageItemId: '3', unit: 'call-out' },
];

/**
 * Each row exists to put one situation on screen. `age` is days since the
 * invoice was raised, `term` the payment term in days, `paid` the fraction of
 * the grand total received. Keep the mix — it is what makes the paid/unpaid and
 * outstanding surfaces worth looking at.
 */
const SEED = [
  // Settled, on time — the boring majority.
  {
    site: 'downtown',
    age: 128,
    term: 30,
    total: 4820,
    tax: 385.6,
    paid: 1,
    method: 'bank_transfer',
  },
  { site: 'harborview', age: 121, term: 30, total: 7150, tax: 572, paid: 1, method: 'check' },
  {
    site: 'meridian',
    age: 118,
    term: 14,
    total: 12400,
    tax: 992,
    paid: 1,
    method: 'bank_transfer',
  },
  { site: 'edge', age: 96, term: 30, total: 1980, tax: 158.4, paid: 1, method: 'cash' },
  { site: 'lakeside', age: 94, term: 30, total: 3260, tax: 260.8, paid: 1, method: 'card' },

  // Settled late — the reason anyone wants an aging view.
  {
    site: 'downtown',
    age: 88,
    term: 14,
    total: 5140,
    tax: 411.2,
    paid: 1,
    method: 'check',
    settledAfter: 61,
  },
  {
    site: 'harborview',
    age: 76,
    term: 30,
    total: 6890,
    tax: 551.2,
    paid: 1,
    method: 'bank_transfer',
    settledAfter: 52,
  },

  // Part-paid. No screen in the module can express these today.
  {
    site: 'meridian',
    age: 72,
    term: 30,
    total: 15600,
    tax: 1248,
    paid: 0.4,
    method: 'bank_transfer',
  },
  { site: 'downtown', age: 63, term: 30, total: 4980, tax: 398.4, paid: 0.75, method: 'check' },
  { site: 'lakeside', age: 47, term: 14, total: 2870, tax: 229.6, paid: 0.5, method: 'card' },

  // Unpaid, well past due. Ages are set against the payment term so each row
  // lands in a distinct aging band — 104 days on NET14 is 90 days overdue, which
  // sits on the 61–90 boundary, so the worst band gets its own deliberately
  // ancient row rather than being left empty.
  { site: 'harborview', age: 148, term: 14, total: 8240, tax: 659.2, paid: 0 },
  { site: 'edge', age: 122, term: 30, total: 2410, tax: 192.8, paid: 0 },
  { site: 'downtown', age: 78, term: 14, total: 3990, tax: 319.2, paid: 0 },

  // Unpaid, 31–60 past due.
  { site: 'meridian', age: 58, term: 14, total: 11250, tax: 900, paid: 0 },
  { site: 'lakeside', age: 52, term: 14, total: 1740, tax: 139.2, paid: 0 },

  // Unpaid, 1–30 past due.
  { site: 'harborview', age: 41, term: 30, total: 7420, tax: 593.6, paid: 0 },
  { site: 'downtown', age: 38, term: 30, total: 5310, tax: 424.8, paid: 0 },
  { site: 'edge', age: 34, term: 14, total: 2260, tax: 180.8, paid: 0 },

  // Current — issued, not yet due. Must not read as a problem anywhere.
  { site: 'meridian', age: 18, term: 30, total: 13100, tax: 1048, paid: 0 },
  { site: 'harborview', age: 12, term: 30, total: 6640, tax: 531.2, paid: 0 },
  { site: 'lakeside', age: 9, term: 30, total: 3080, tax: 246.4, paid: 0 },

  // Settled *within the current month*, so the period overview's default window
  // ("this month") has receipts to show. Without these the default view opens on
  // "Received $0.00", which reads as a broken screen rather than a quiet month.
  // `settledAfter` is measured from the invoice date, so age - settledAfter is how
  // many days ago the money arrived — keep both small.
  {
    site: 'downtown',
    age: 16,
    term: 30,
    total: 4260,
    tax: 340.8,
    paid: 1,
    method: 'bank_transfer',
    settledAfter: 11,
  },
  {
    site: 'meridian',
    age: 13,
    term: 14,
    total: 9840,
    tax: 787.2,
    paid: 0.65,
    method: 'bank_transfer',
    settledAfter: 8,
  },
  {
    site: 'edge',
    age: 7,
    term: 14,
    total: 1620,
    tax: 129.6,
    paid: 1,
    method: 'check',
    settledAfter: 4,
  },

  // Ad-hoc call-outs, small and fast.
  {
    site: 'downtown',
    age: 26,
    term: 7,
    total: 640,
    tax: 51.2,
    paid: 1,
    method: 'card',
    type: 'ad_hoc',
  },
  { site: 'edge', age: 21, term: 7, total: 480, tax: 38.4, paid: 0, type: 'ad_hoc' },
  { site: 'meridian', age: 5, term: 7, total: 1290, tax: 103.2, paid: 0, type: 'ad_hoc' },

  // Not yet pushed to the accounting system, so it has no payment state at all.
  { site: 'lakeside', age: 4, term: 30, total: 2540, tax: 203.2, paid: 0, sync: 'syncApprove' },
  { site: 'harborview', age: 3, term: 30, total: 5980, tax: 478.4, paid: 0, sync: 'syncApprove' },
  // Blocked: billing/contact info incomplete. Exercises the disabled approve tooltip.
  {
    site: 'edge',
    age: 2,
    term: 30,
    total: 1620,
    tax: 129.6,
    paid: 0,
    sync: 'syncApprove',
    pushBlocked: true,
  },
  // Mid-flight and failed pushes.
  { site: 'downtown', age: 2, term: 30, total: 4460, tax: 356.8, paid: 0, sync: 'inProgress' },
  { site: 'meridian', age: 1, term: 30, total: 9870, tax: 789.6, paid: 0, sync: 'failed' },

  // Credit note against an earlier invoice — negative money in the ledger.
  {
    site: 'downtown',
    age: 30,
    term: 30,
    total: -1200,
    tax: -96,
    paid: 0,
    isRefund: true,
    correctsSeedIndex: 8,
  },
  // Overpaid: the customer sent more than the invoice. Nothing models this today.
  {
    site: 'lakeside',
    age: 68,
    term: 30,
    total: 2200,
    tax: 176,
    paid: 1.15,
    method: 'bank_transfer',
  },
];

let invoiceSequence = 1000;
let paymentSequence = 5000;

function grandTotal({ lineItemsTotal, discount, taxAmount }) {
  return round2((lineItemsTotal || 0) - (discount || 0) + (taxAmount || 0));
}

function buildLineItems(seedRow, invoiceId) {
  const isAdHoc = seedRow.type === INVOICE_TYPE.adHoc;
  const catalog = isAdHoc ? [LINE_ITEM_CATALOG[2]] : LINE_ITEM_CATALOG.slice(0, 2);
  const share = seedRow.total / catalog.length;

  return catalog.map((item, index) => {
    const quantity = isAdHoc ? 1 : index === 0 ? 4 : 2;
    const price = round2(share / quantity);
    const total = round2(quantity * price);
    return {
      id: invoiceId * 100 + index,
      index,
      sageItem: { label: item.name, value: item.sageItemId },
      sage_item_id: item.sageItemId,
      name: item.name,
      description: `${item.name} — ${quantity} ${item.unit}${quantity > 1 ? 's' : ''}`,
      quantity,
      price,
      total,
      total_price: total,
      _destroy: false,
    };
  });
}

/**
 * The payment ledger. Payments are records in their own right, not fields on an
 * invoice: a receipt can arrive that matches no invoice, match the wrong one, or
 * arrive twice, and none of those are expressible if payment lives inside the
 * invoice. `invoiceId` is nullable for exactly that reason — an unidentified
 * receipt is a payment with a customer and no invoice.
 */
const payments = [];

export function getPayments() {
  return payments;
}

export function paymentsForInvoice(invoiceId) {
  return payments
    .filter((payment) => String(payment.invoiceId) === String(invoiceId))
    .sort((a, b) => new Date(a.receivedOn).getTime() - new Date(b.receivedOn).getTime());
}

export function paymentsForCustomer(customerId) {
  return payments.filter((payment) => payment.customerId === customerId);
}

function addPayment(record) {
  const payment = { id: (paymentSequence += 1), ...record };
  payments.push(payment);
  return payment;
}

function buildPayments(seedRow, invoice) {
  if (!seedRow.paid) return [];

  const total = grandTotal(invoice);
  const settledOn = shiftDays(
    -seedRow.age +
      (seedRow.settledAfter != null ? seedRow.settledAfter : Math.min(seedRow.term, 9)),
  );
  const received = round2(total * seedRow.paid);

  const base = {
    invoiceId: invoice.id,
    siteId: invoice.siteId,
    customerId: invoice.customerId,
    method: seedRow.method || PAYMENT_METHOD.bankTransfer,
  };

  // Part-payments arrive in instalments; that is the whole point of tracking them.
  if (seedRow.paid < 1) {
    const first = round2(received * 0.6);
    return [
      addPayment({
        ...base,
        amount: first,
        reference: `REM-${invoice.invoiceNumber.slice(-4)}-1`,
        receivedOn: iso(settledOn),
        note: 'Part payment on account',
      }),
      addPayment({
        ...base,
        amount: round2(received - first),
        reference: `REM-${invoice.invoiceNumber.slice(-4)}-2`,
        receivedOn: iso(shiftDays(-seedRow.age + seedRow.term + 12)),
        note: 'Part payment on account',
      }),
    ];
  }

  return [
    addPayment({
      ...base,
      amount: received,
      reference:
        seedRow.method === PAYMENT_METHOD.check
          ? `CHK-${100000 + invoice.id}`
          : `REM-${invoice.invoiceNumber.slice(-4)}`,
      receivedOn: iso(settledOn),
      note: seedRow.paid > 1 ? 'Overpayment — credit on account' : '',
    }),
  ];
}

function buildInvoice(seedRow, seedIndex) {
  const site = SITES[seedRow.site];
  const id = (invoiceSequence += 1);
  const invoiceDate = shiftDays(-seedRow.age);
  const dueDate = shiftDays(-seedRow.age + seedRow.term);
  const periodStart = shiftDays(-seedRow.age - 30);
  const periodEnd = shiftDays(-seedRow.age - 1);
  const sync = INVOICE_SYNC_STATUS[seedRow.sync || 'sentToSage'];
  const delivered = sync === INVOICE_SYNC_STATUS.sentToSage;

  const invoice = {
    id,
    invoiceNumber: `${seedRow.isRefund ? 'CRN' : 'INV'}-${invoiceDate.getFullYear()}-${pad(
      invoiceDate.getMonth() + 1,
    )}${String(id).slice(-3)}`,
    customerId: site.customerId,
    siteId: site.id,
    siteName: site.name,
    clientName: site.client,
    invoiceType: seedRow.type || INVOICE_TYPE.scheduled,
    contracts:
      seedRow.type === INVOICE_TYPE.adHoc ? [site.contracts[0]] : site.contracts.slice(0, 2),
    invoiceGenerated: iso(invoiceDate),
    createDate: iso(invoiceDate),
    dueDate: iso(dueDate),
    paymentTerm: seedRow.term === 7 ? 'NET07' : seedRow.term === 14 ? 'NET14' : 'NET30',
    status: sync,
    invoiceDuration: `${usDate(periodStart)} - ${usDate(periodEnd)}`,
    periodStart: iso(periodStart),
    periodEnd: iso(periodEnd),
    lineItemsTotal: round2(seedRow.total),
    taxAmount: round2(seedRow.tax),
    discount: round2(seedRow.discount || 0),
    delivered,
    deliveredAt: delivered ? iso(shiftDays(-seedRow.age + 1)) : null,
    pushToSage: !seedRow.pushBlocked,
    poNumber: `PO-${4000 + seedIndex}`,
    invoiceMemo: seedRow.isRefund
      ? 'Credit note — over-billed filter count on the referenced invoice.'
      : '',
    isRefund: !!seedRow.isRefund,
    originalInvoiceNumber: null,
    originalInvoiceCreateDate: null,
    _seedIndex: seedIndex,
    _correctsSeedIndex: seedRow.correctsSeedIndex ?? null,
  };

  invoice.lineItems = buildLineItems(seedRow, id);
  buildPayments(seedRow, invoice);
  applyPaymentRollup(invoice);

  return invoice;
}

/**
 * Payment state is derived from the ledger, never stored twice. `paid` stays a
 * boolean because the existing listing reads it; `amountPaid` / `balanceDue` /
 * `paymentState` are what the outstanding and discrepancy views need.
 */
export function applyPaymentRollup(invoice) {
  const total = grandTotal(invoice);
  const applied = paymentsForInvoice(invoice.id);
  const amountPaid = round2(applied.reduce((sum, p) => sum + (p.amount || 0), 0));
  const last = applied[applied.length - 1];

  invoice.grandTotal = total;
  invoice.amountPaid = amountPaid;
  invoice.balanceDue = round2(total - amountPaid);
  invoice.paymentCount = applied.length;
  invoice.paid = amountPaid > 0 && invoice.balanceDue <= 0;
  invoice.paidAt = invoice.paid && last ? last.receivedOn : null;
  invoice.paymentMethod = last?.method || null;
  invoice.checkNumber = last?.method === PAYMENT_METHOD.check ? last.reference : null;
  invoice.paymentState = derivePaymentState(invoice);

  return invoice;
}

export const PAYMENT_STATE = {
  unpaid: 'unpaid',
  partial: 'partial',
  paid: 'paid',
  overpaid: 'overpaid',
  credit: 'credit',
};

function derivePaymentState(invoice) {
  // A credit note is money owed *to* the customer, not an unpaid invoice and not
  // an overpayment. Its negative balance means something different from every
  // other row, so it gets its own state rather than borrowing "overpaid".
  if (invoice.grandTotal < -0.005) return PAYMENT_STATE.credit;
  if (invoice.balanceDue < -0.005) return PAYMENT_STATE.overpaid;
  if (invoice.amountPaid <= 0.005) return PAYMENT_STATE.unpaid;
  if (invoice.balanceDue > 0.005) return PAYMENT_STATE.partial;
  return PAYMENT_STATE.paid;
}

/* --------------------------------------------------------- discrepancies */

/**
 * The five discrepancy classes the first draft covers. Each is derivable from a
 * single invoice plus its ledger entries. Three more — unidentified receipts,
 * duplicate payments and unapplied credits — need cross-invoice reasoning and
 * are deliberately out of the draft; see docs/invoicing-reconciliation.
 */
export const DISCREPANCY = {
  shortPaid: 'shortPaid',
  overpaid: 'overpaid',
  unpaidOverdue: 'unpaidOverdue',
  paidLate: 'paidLate',
  notIssued: 'notIssued',
};

const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();

export function daysOverdue(invoice) {
  const due = new Date(invoice.dueDate);
  const dueStart = new Date(due.getFullYear(), due.getMonth(), due.getDate()).getTime();
  return Math.floor((startOfToday - dueStart) / DAY_MS);
}

export function getInvoiceFlags(invoice) {
  const flags = [];
  const overdue = daysOverdue(invoice);

  if (invoice.paymentState === PAYMENT_STATE.partial) flags.push(DISCREPANCY.shortPaid);
  // Only a genuine surplus counts: a credit note's negative balance is expected,
  // not a discrepancy. Applying that credit to an open invoice is a separate
  // problem the draft does not cover.
  if (invoice.paymentState === PAYMENT_STATE.overpaid && invoice.amountPaid > 0.005) {
    flags.push(DISCREPANCY.overpaid);
  }
  if (invoice.paymentState === PAYMENT_STATE.unpaid && overdue > 0 && invoice.grandTotal > 0) {
    flags.push(DISCREPANCY.unpaidOverdue);
  }
  if (invoice.paid && invoice.paidAt && new Date(invoice.paidAt) > new Date(invoice.dueDate)) {
    flags.push(DISCREPANCY.paidLate);
  }
  // Raised but never pushed to the accounting system: the customer has never
  // seen it, so an unpaid balance here is our problem, not theirs.
  if (invoice.status !== INVOICE_SYNC_STATUS.sentToSage && invoice.balanceDue > 0.005) {
    flags.push(DISCREPANCY.notIssued);
  }

  return flags;
}

const AGING_BUCKETS = [
  { key: 'current', label: 'Not yet due', min: -Infinity, max: 0 },
  { key: 'd1_30', label: '1–30 days', min: 1, max: 30 },
  { key: 'd31_60', label: '31–60 days', min: 31, max: 60 },
  { key: 'd61_90', label: '61–90 days', min: 61, max: 90 },
  { key: 'd90_plus', label: '90+ days', min: 91, max: Infinity },
];

export function agingBucketFor(invoice) {
  const overdue = daysOverdue(invoice);
  return (
    AGING_BUCKETS.find((bucket) => overdue >= bucket.min && overdue <= bucket.max)?.key || 'current'
  );
}

/**
 * Everything the Outstanding tab renders, computed in one pass: headline totals,
 * the aging ladder, discrepancy counts, and customer rows that each carry their
 * own invoices for the expandable detail.
 *
 * Aging is driven by **due date**, not invoice date — the question being asked is
 * "how late is this money", not "how old is this paperwork".
 */
export function buildOutstandingSummary(query = {}) {
  const scoped = filterInvoices(query);
  const open = scoped.filter((invoice) => Math.abs(invoice.balanceDue) > 0.005);

  const aging = AGING_BUCKETS.map((bucket) => ({
    key: bucket.key,
    label: bucket.label,
    amount: 0,
    count: 0,
  }));
  const discrepancyTotals = Object.values(DISCREPANCY).reduce((acc, key) => {
    acc[key] = { key, count: 0, amount: 0 };
    return acc;
  }, {});

  const byCustomer = new Map();
  let billed = 0;
  let received = 0;
  let outstanding = 0;
  let overdueOutstanding = 0;
  let creditsOnAccount = 0;

  // Discrepancy counts consider every scoped invoice, not just open ones —
  // "paid late" is a settled invoice, and it is still a discrepancy.
  scoped.forEach((invoice) => {
    getInvoiceFlags(invoice).forEach((flag) => {
      discrepancyTotals[flag].count += 1;
      discrepancyTotals[flag].amount = round2(
        discrepancyTotals[flag].amount + Math.abs(invoice.balanceDue || 0),
      );
    });
    billed = round2(billed + invoice.grandTotal);
    received = round2(received + invoice.amountPaid);
  });

  open.forEach((invoice) => {
    const flags = getInvoiceFlags(invoice);
    const overdue = daysOverdue(invoice);
    const bucketKey = agingBucketFor(invoice);
    const bucket = aging.find((entry) => entry.key === bucketKey);

    if (invoice.balanceDue > 0) {
      bucket.amount = round2(bucket.amount + invoice.balanceDue);
      bucket.count += 1;
      outstanding = round2(outstanding + invoice.balanceDue);
      if (overdue > 0) overdueOutstanding = round2(overdueOutstanding + invoice.balanceDue);
    } else {
      // Negative balance = money we hold that isn't ours: overpayments and
      // unapplied credit notes both land here.
      creditsOnAccount = round2(creditsOnAccount + Math.abs(invoice.balanceDue));
    }

    const key = invoice.customerId;
    if (!byCustomer.has(key)) {
      byCustomer.set(key, {
        customerId: invoice.customerId,
        siteId: invoice.siteId,
        siteName: invoice.siteName,
        clientName: invoice.clientName,
        billed: 0,
        received: 0,
        outstanding: 0,
        credits: 0,
        oldestDaysOverdue: 0,
        buckets: AGING_BUCKETS.reduce((acc, b) => ({ ...acc, [b.key]: 0 }), {}),
        flags: [],
        invoices: [],
      });
    }

    const row = byCustomer.get(key);
    row.billed = round2(row.billed + invoice.grandTotal);
    row.received = round2(row.received + invoice.amountPaid);
    if (invoice.balanceDue > 0) {
      row.outstanding = round2(row.outstanding + invoice.balanceDue);
      row.buckets[bucketKey] = round2(row.buckets[bucketKey] + invoice.balanceDue);
      row.oldestDaysOverdue = Math.max(row.oldestDaysOverdue, overdue);
    } else {
      row.credits = round2(row.credits + Math.abs(invoice.balanceDue));
    }
    flags.forEach((flag) => {
      if (!row.flags.includes(flag)) row.flags.push(flag);
    });
    row.invoices.push({
      id: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      invoiceGenerated: invoice.invoiceGenerated,
      dueDate: invoice.dueDate,
      paymentTerm: invoice.paymentTerm,
      status: invoice.status,
      grandTotal: invoice.grandTotal,
      amountPaid: invoice.amountPaid,
      balanceDue: invoice.balanceDue,
      paymentState: invoice.paymentState,
      paymentCount: invoice.paymentCount,
      daysOverdue: overdue,
      agingBucket: bucketKey,
      isRefund: invoice.isRefund,
      flags,
    });
  });

  const customers = [...byCustomer.values()]
    .map((row) => ({
      ...row,
      invoices: row.invoices.sort((a, b) => b.daysOverdue - a.daysOverdue),
    }))
    .sort((a, b) => b.outstanding - a.outstanding);

  return {
    totals: {
      billed,
      received,
      outstanding,
      overdueOutstanding,
      creditsOnAccount,
      openInvoiceCount: open.filter((invoice) => invoice.balanceDue > 0).length,
      customerCount: customers.length,
      collectionRate: billed > 0 ? Math.round((received / billed) * 100) : 0,
    },
    aging,
    discrepancies: Object.values(discrepancyTotals),
    customers,
  };
}

/** Mutable demo state. Mutated by the router's POST/PUT/PATCH/DELETE handlers. */
const invoices = SEED.map(buildInvoice);

// Wire the credit notes to the invoices they correct, now that numbers exist.
invoices.forEach((invoice) => {
  if (invoice._correctsSeedIndex == null) return;
  const original = invoices.find((row) => row._seedIndex === invoice._correctsSeedIndex);
  if (!original) return;
  invoice.originalInvoiceNumber = original.invoiceNumber;
  invoice.originalInvoiceCreateDate = original.invoiceGenerated;
});

export function getInvoices() {
  return invoices;
}

export function findInvoice(id) {
  return invoices.find((row) => String(row.id) === String(id)) || null;
}

/* ------------------------------------------------------------------ listing */

const SORT_ACCESSORS = {
  invoiceNumber: (row) => row.invoiceNumber,
  customerId: (row) => row.customerId,
  siteName: (row) => row.siteName,
  contractName: (row) => row.contracts?.[0] || '',
  contracts: (row) => row.contracts?.[0] || '',
  createDate: (row) => new Date(row.invoiceGenerated).getTime(),
  invoiceGenerated: (row) => new Date(row.invoiceGenerated).getTime(),
  dueDate: (row) => new Date(row.dueDate).getTime(),
  deliveredAt: (row) => (row.deliveredAt ? new Date(row.deliveredAt).getTime() : 0),
  lineItemsTotal: (row) => row.lineItemsTotal,
  taxAmount: (row) => row.taxAmount,
  grandTotal: (row) => row.grandTotal,
  balanceDue: (row) => row.balanceDue,
};

const asArray = (value) => {
  if (value == null || value === '') return [];
  return Array.isArray(value) ? value : [value];
};

/**
 * `query` arrives from `queryString.stringify(..., { arrayFormat: 'index' })`,
 * so repeated params land as `siteName[0]`, `siteName[1]`. `getQueryParams`
 * flattens them into distinct keys — collect them back here.
 */
function collectIndexed(query, key) {
  const direct = asArray(query[key]);
  const indexed = Object.keys(query)
    .filter((k) => k.startsWith(`${key}[`))
    .sort()
    .map((k) => query[k]);
  return [...direct, ...indexed].filter((v) => v !== '' && v != null);
}

/**
 * A period runs to the **last instant** of its closing day. Reading `07/31/2026`
 * as midnight silently dropped every invoice raised on the closing day, so the
 * listing and the summary disagreed about the same stated window — the totals
 * above the table described a set the table did not contain. Both ends are
 * normalised here and in `buildPeriodReconciliation`, and nowhere else.
 */
export const periodWindow = (query = {}) => {
  const startRaw = query.periodStart || query.windowStart || query.from;
  const endRaw = query.periodEnd || query.windowEnd || query.to;
  return {
    from: startRaw ? new Date(startRaw).setHours(0, 0, 0, 0) : null,
    to: endRaw ? new Date(endRaw).setHours(23, 59, 59, 999) : null,
  };
};

/**
 * The row set both the listing and the period summary are built from.
 *
 * Two rules the whole feature rests on:
 *
 * - **`ignoreAgingSplit`** separates *scope* from *the split of that scope*. Every
 *   filter the reader sets in the controls row — period, site, payment state, sync
 *   status, type, search — narrows what they are looking at, so the summary follows
 *   all of them and its figures always describe the rows on screen. The one
 *   exception is the aging split: the reader reaches it by clicking *inside* the
 *   summary itself, so those figures have to stay put while the table narrows, or
 *   the reference point they clicked disappears under them. The summary passes this
 *   flag; the listing does not.
 * - **A search escapes the period.** Looking up an invoice by number is a lookup,
 *   not a report: ANDing the window onto it made 26 of 34 invoices unfindable from
 *   the default view. When a search term is present the window is ignored, and the
 *   UI says so.
 */
export function filterInvoices(query = {}, { ignoreAgingSplit = false } = {}) {
  const search = String(query.invoiceNumber || query.search || '')
    .trim()
    .toLowerCase();
  const siteNames = collectIndexed(query, 'siteName').map((v) => String(v).toLowerCase());
  const siteIds = collectIndexed(query, 'siteId').map(String);
  const types = collectIndexed(query, 'type').map(String);
  const statuses = collectIndexed(query, 'status').map(String);
  const paymentStates = collectIndexed(query, 'paymentStatus').map(String);
  const discrepancies = collectIndexed(query, 'discrepancy').map(String);
  const agingBuckets = ignoreAgingSplit ? [] : collectIndexed(query, 'agingBucket').map(String);

  const { from, to } = search ? { from: null, to: null } : periodWindow(query);

  let rows = invoices.filter((row) => {
    if (search) {
      const haystack = [row.invoiceNumber, row.siteName, row.customerId, row.clientName]
        .join(' ')
        .toLowerCase();
      if (!haystack.includes(search)) return false;
    }
    if (siteNames.length && !siteNames.includes(String(row.siteName).toLowerCase())) return false;
    if (siteIds.length && !siteIds.includes(String(row.siteId))) return false;
    if (types.length) {
      // The filter sends 0 (ad hoc) / 1 (scheduled); the record stores the slug.
      const wanted = types.map((v) =>
        v === '0' || v === INVOICE_TYPE.adHoc ? INVOICE_TYPE.adHoc : INVOICE_TYPE.scheduled,
      );
      if (!wanted.includes(row.invoiceType)) return false;
    }
    if (statuses.length && !statuses.includes(String(row.status))) return false;
    if (paymentStates.length && !paymentStates.includes(row.paymentState)) return false;
    if (discrepancies.length) {
      const flags = getInvoiceFlags(row);
      if (!discrepancies.some((flag) => flags.includes(flag))) return false;
    }
    // Aging is the age of an *outstanding balance*, so a settled invoice — or a
    // credit note, whose balance is money we owe them — falls in no band. Without
    // this the "Overdue" split filtered to five rows while the summary beside it
    // said four.
    if (agingBuckets.length) {
      if (!(row.balanceDue > 0.005)) return false;
      if (!agingBuckets.includes(agingBucketFor(row))) return false;
    }
    if (from != null || to != null) {
      const raised = new Date(row.invoiceGenerated).getTime();
      if (from != null && raised < from) return false;
      if (to != null && raised > to) return false;
    }
    return true;
  });

  const accessor = SORT_ACCESSORS[query.sortBy];
  if (accessor) {
    const direction = String(query.orderBy || 'asc').toLowerCase() === 'desc' ? -1 : 1;
    rows = [...rows].sort((a, b) => {
      const left = accessor(a);
      const right = accessor(b);
      if (left === right) return 0;
      return (left > right ? 1 : -1) * direction;
    });
  } else {
    rows = [...rows].sort(
      (a, b) => new Date(b.invoiceGenerated).getTime() - new Date(a.invoiceGenerated).getTime(),
    );
  }

  return rows;
}

/**
 * Listing rows: the grid never needs line items, and they are bulky. Aging and
 * discrepancy flags ride along so both tabs and the payments drawer read the
 * same derived state instead of each recomputing it.
 */
export function toListingRow(invoice) {
  const { lineItems: _lineItems, _seedIndex, _correctsSeedIndex, ...rest } = invoice;
  return clone({
    ...rest,
    daysOverdue: daysOverdue(invoice),
    agingBucket: agingBucketFor(invoice),
    flags: getInvoiceFlags(invoice),
  });
}

/* ------------------------------------------------- period reconciliation */

const inWindow = (dateish, from, to) => {
  const t = new Date(dateish).getTime();
  if (from != null && t < from) return false;
  if (to != null && t > to) return false;
  return true;
};

/**
 * The summary that sits above the listing.
 *
 * **It describes exactly the rows the table is showing** — the single invariant the
 * whole surface rests on. It therefore takes the same query as the listing and runs
 * the same filter, with `ignoreAgingSplit` so that the one control living *inside*
 * this summary — the not-yet-due / overdue split — narrows the rows without moving
 * the figure the reader just clicked.
 *
 * **One clock.** Every figure describes the same set of invoices as of today, so
 * `billed − received = stillOpen` closes on screen and a reader can check it.
 * `received` is therefore money paid *against these invoices*, whenever it arrived
 * — not cash that happened to land inside the window. Cash-by-date-received, split
 * by which period's invoices it settles, is a genuinely different question and
 * needs receipts as its rows; it belongs in a receipts view, not in a footnote
 * under a table of invoices. `receipts` is still returned here for that view.
 *
 * **Open money is split before anything else.** Not-yet-due and overdue are
 * different problems — one is waiting, one is chasing — and every accounting
 * product leads with that split.
 */
export function buildPeriodReconciliation(query = {}) {
  const { from, to } = periodWindow(query);
  const searching = !!String(query.invoiceNumber || query.search || '').trim();

  const raised = filterInvoices(query, { ignoreAgingSplit: true });
  const raisedIds = new Set(raised.map((invoice) => String(invoice.id)));

  const receipts = payments
    .filter((payment) => inWindow(payment.receivedOn, from, to))
    .sort((a, b) => new Date(b.receivedOn).getTime() - new Date(a.receivedOn).getTime())
    .map((payment) => {
      const invoice = findInvoice(payment.invoiceId);
      return {
        ...payment,
        invoiceNumber: invoice?.invoiceNumber || null,
        siteName: invoice?.siteName || null,
        clientName: invoice?.clientName || null,
        invoiceGenerated: invoice?.invoiceGenerated || null,
        settlesEarlierInvoice: !raisedIds.has(String(payment.invoiceId)),
      };
    });

  const sum = (rows, pick) => round2(rows.reduce((total, row) => total + (pick(row) || 0), 0));

  // Credit notes are reported separately rather than netted into "billed".
  // Netting them made "still open" look larger than "billed", which reads as a
  // bug even though the arithmetic was right.
  const invoiced = raised.filter((invoice) => invoice.grandTotal >= 0);
  const credited = raised.filter((invoice) => invoice.grandTotal < 0);
  const billed = sum(invoiced, (invoice) => invoice.grandTotal);
  // Paid against the invoices in scope, whenever the money arrived.
  const received = sum(invoiced, (invoice) => invoice.amountPaid);
  const againstEarlier = sum(
    receipts.filter((payment) => payment.settlesEarlierInvoice),
    (payment) => payment.amount,
  );
  const stillOpenRows = raised.filter((invoice) => invoice.balanceDue > 0.005);
  // A surplus on a positive invoice is money we are holding, not money outstanding,
  // so it is reported on its own rather than allowed to net "still open" down. This
  // is what keeps billed − received = stillOpen − surplus true, and the strip
  // checkable, when someone overpays.
  const surplusRows = invoiced.filter((invoice) => invoice.balanceDue < -0.005);
  // Aging is measured from the due date (D5), so "not yet due" is the whole of the
  // `current` bucket and everything else is late by definition.
  const notYetDueRows = stillOpenRows.filter(
    (invoice) => agingBucketFor(invoice) === AGING_BUCKETS[0].key,
  );
  const overdueRows = stillOpenRows.filter(
    (invoice) => agingBucketFor(invoice) !== AGING_BUCKETS[0].key,
  );

  const discrepancyTotals = Object.values(DISCREPANCY).reduce((acc, key) => {
    acc[key] = { key, count: 0, amount: 0 };
    return acc;
  }, {});
  // Payment-state counts for the same set, so the overview's filter pills can
  // show how many rows each one would leave behind before it is clicked.
  const stateTotals = Object.values(PAYMENT_STATE).reduce((acc, key) => {
    acc[key] = { key, count: 0, amount: 0 };
    return acc;
  }, {});

  raised.forEach((invoice) => {
    getInvoiceFlags(invoice).forEach((flag) => {
      discrepancyTotals[flag].count += 1;
      discrepancyTotals[flag].amount = round2(
        discrepancyTotals[flag].amount + Math.abs(invoice.balanceDue || 0),
      );
    });
    const state = stateTotals[invoice.paymentState];
    if (state) {
      state.count += 1;
      state.amount = round2(state.amount + Math.abs(invoice.balanceDue || 0));
    }
  });

  return {
    period: {
      from: from != null ? iso(new Date(from)) : null,
      to: to != null ? iso(new Date(to)) : null,
      // True when a search has taken the reader outside the stated window, so the
      // widget can say so rather than quietly showing numbers for another scope.
      ignored: searching,
    },
    // Every row in scope, credit notes included. `billed.count` deliberately is not
    // this — it counts what was invoiced — so anything that wants "how many rows are
    // in scope" needs its own figure or it contradicts the table beside it.
    scopeCount: raised.length,
    billed: { amount: billed, count: invoiced.length },
    credited: {
      amount: Math.abs(sum(credited, (invoice) => invoice.grandTotal)),
      count: credited.length,
    },
    received: { amount: received, count: invoiced.filter((i) => i.amountPaid > 0.005).length },
    surplus: {
      amount: Math.abs(sum(surplusRows, (invoice) => invoice.balanceDue)),
      count: surplusRows.length,
    },
    stillOpen: {
      amount: sum(stillOpenRows, (invoice) => invoice.balanceDue),
      count: stillOpenRows.length,
      notYetDue: {
        amount: sum(notYetDueRows, (invoice) => invoice.balanceDue),
        count: notYetDueRows.length,
      },
      overdue: {
        amount: sum(overdueRows, (invoice) => invoice.balanceDue),
        count: overdueRows.length,
        // The worst case in the band. "4 invoices overdue" and "4 invoices, the
        // oldest 61 days late" are answers to different questions, and it is the
        // second one that decides whether anybody picks up the phone today.
        oldestDaysOverdue: overdueRows.reduce(
          (worst, invoice) => Math.max(worst, daysOverdue(invoice)),
          0,
        ),
      },
    },
    discrepancies: Object.values(discrepancyTotals).filter((entry) => entry.count > 0),
    paymentStates: Object.values(stateTotals).filter((entry) => entry.count > 0),
    // For the receipts view: cash by date received, split by which period's
    // invoices it settles. Not rendered by the listing's summary — see the header.
    receipts,
    receivedInWindow: {
      amount: sum(receipts, (payment) => payment.amount),
      count: receipts.length,
      againstEarlier,
      againstPeriod: round2(sum(receipts, (payment) => payment.amount) - againstEarlier),
    },
    invoices: raised.map(toListingRow),
  };
}

const RECONCILIATION_CSV_COLUMNS = [
  ['Received on', (row) => usDate(new Date(row.receivedOn))],
  ['Invoice #', (row) => row.invoiceNumber || '—'],
  ['Site', (row) => row.siteName || '—'],
  ['Customer', (row) => row.clientName || '—'],
  ['Method', (row) => String(row.method || '').replace('_', ' ')],
  ['Reference', (row) => row.reference || ''],
  ['Amount', (row) => Number(row.amount).toFixed(2)],
  ['Settles earlier invoice', (row) => (row.settlesEarlierInvoice ? 'Yes' : 'No')],
];

export function buildPeriodReconciliationCsv(query = {}) {
  const { receipts } = buildPeriodReconciliation(query);
  const lines = [RECONCILIATION_CSV_COLUMNS.map(([header]) => header).join(',')];
  receipts.forEach((row) => {
    lines.push(RECONCILIATION_CSV_COLUMNS.map(([, accessor]) => csvCell(accessor(row))).join(','));
  });
  return `${lines.join('\r\n')}\r\n`;
}

/* ------------------------------------------------------------------- detail */

export function buildInvoiceDetail(id) {
  const invoice = findInvoice(id) || invoices[0];
  const site = Object.values(SITES).find((s) => s.id === invoice.siteId) || SITES.downtown;

  return {
    invoice: clone({
      ...invoice,
      billTo: site.billTo,
      contractDetails: {
        siteName: invoice.siteName,
        contract: invoice.contracts,
      },
      billingDetails: {
        invoiceGenerated: invoice.invoiceGenerated,
        invoiceDurationStart: invoice.periodStart,
        invoiceDurationEnd: invoice.periodEnd,
        paymentTerm: invoice.paymentTerm,
        dueDate: invoice.dueDate,
      },
    }),
  };
}

/**
 * `fetch_line_items` re-derives line items from a payroll window — the drawer
 * calls it when the user changes the invoice duration. Quantities scale with
 * the window so the number visibly responds to the date range.
 */
export function buildInvoiceLineItems(id, query = {}) {
  const invoice = findInvoice(id) || invoices[0];
  const start = query.startTime ? new Date(query.startTime) : new Date(invoice.periodStart);
  const end = query.endTime ? new Date(query.endTime) : new Date(invoice.periodEnd);
  const days = Math.max(1, Math.round((end.getTime() - start.getTime()) / DAY_MS));
  const visits = Math.max(1, Math.round(days / 7));

  return {
    lineItems: LINE_ITEM_CATALOG.slice(0, 2).map((item, index) => {
      const quantity = index === 0 ? visits * 2 : visits;
      const price = index === 0 ? 145 : 320;
      return {
        id: null,
        name: item.name,
        sage_item_id: item.sageItemId,
        description: `${item.name} — ${usDate(start)} to ${usDate(end)}`,
        quantity,
        price,
        total_price: round2(quantity * price),
      };
    }),
  };
}

/* ---------------------------------------------------------------- mutations */

export function createInvoice(body = {}) {
  const site =
    Object.values(SITES).find((s) => String(s.id) === String(body.siteId)) || SITES.downtown;
  const id = (invoiceSequence += 1);
  const invoiceDate = body.invoiceDate ? new Date(body.invoiceDate) : today;
  const lineItems = (body.lineItems || [])
    .filter((item) => !item._destroy)
    .map((item, index) => ({
      ...item,
      id: item.id || id * 100 + index,
      index,
      total: round2((Number(item.quantity) || 0) * (Number(item.price) || 0)),
      total_price: round2((Number(item.quantity) || 0) * (Number(item.price) || 0)),
    }));
  const lineItemsTotal = round2(lineItems.reduce((sum, item) => sum + item.total, 0));

  const invoice = {
    id,
    invoiceNumber: `${body.isRefund ? 'CRN' : 'INV'}-${invoiceDate.getFullYear()}-${pad(
      invoiceDate.getMonth() + 1,
    )}${String(id).slice(-3)}`,
    customerId: site.customerId,
    siteId: site.id,
    siteName: site.name,
    clientName: site.client,
    invoiceType: INVOICE_TYPE.scheduled,
    contracts: site.contracts.slice(0, 1),
    invoiceGenerated: iso(invoiceDate),
    createDate: iso(invoiceDate),
    dueDate: body.dueDate ? iso(new Date(body.dueDate)) : iso(shiftDays(30)),
    paymentTerm: body.paymentTerm || 'NET30',
    status: INVOICE_SYNC_STATUS.syncApprove,
    invoiceDuration: `${usDate(new Date(body.periodStart || invoiceDate))} - ${usDate(
      new Date(body.periodEnd || invoiceDate),
    )}`,
    periodStart: iso(new Date(body.periodStart || invoiceDate)),
    periodEnd: iso(new Date(body.periodEnd || invoiceDate)),
    lineItemsTotal,
    taxAmount: round2(lineItemsTotal * 0.08),
    discount: 0,
    delivered: false,
    deliveredAt: null,
    pushToSage: true,
    poNumber: body.poNumber || '',
    invoiceMemo: body.invoiceMemo || '',
    isRefund: !!body.isRefund,
    originalInvoiceNumber: body.originalInvoiceNumber || null,
    originalInvoiceCreateDate: body.originalInvoiceCreateDate || null,
    lineItems,
    _seedIndex: null,
    _correctsSeedIndex: null,
  };

  applyPaymentRollup(invoice);
  invoices.unshift(invoice);
  return invoice;
}

export function updateInvoice(id, body = {}) {
  const invoice = findInvoice(id);
  if (!invoice) return null;

  if (Array.isArray(body.lineItems)) {
    const kept = body.lineItems
      .filter((item) => !item._destroy)
      .map((item, index) => ({
        ...item,
        index,
        total: round2((Number(item.quantity) || 0) * (Number(item.price) || 0)),
        total_price: round2((Number(item.quantity) || 0) * (Number(item.price) || 0)),
      }));
    invoice.lineItems = kept;
    invoice.lineItemsTotal = round2(kept.reduce((sum, item) => sum + item.total, 0));
  }

  if (body.invoiceDate) {
    invoice.invoiceGenerated = iso(new Date(body.invoiceDate));
    invoice.createDate = invoice.invoiceGenerated;
  }
  if (body.dueDate) invoice.dueDate = iso(new Date(body.dueDate));
  if (body.periodStart) invoice.periodStart = iso(new Date(body.periodStart));
  if (body.periodEnd) invoice.periodEnd = iso(new Date(body.periodEnd));
  if (body.periodStart || body.periodEnd) {
    invoice.invoiceDuration = `${usDate(new Date(invoice.periodStart))} - ${usDate(
      new Date(invoice.periodEnd),
    )}`;
  }
  if (body.paymentTerm) invoice.paymentTerm = body.paymentTerm;
  if (body.poNumber !== undefined) invoice.poNumber = body.poNumber;
  if (body.invoiceMemo !== undefined) invoice.invoiceMemo = body.invoiceMemo;

  applyPaymentRollup(invoice);
  return invoice;
}

export function deleteInvoice(id) {
  const index = invoices.findIndex((row) => String(row.id) === String(id));
  if (index === -1) return false;
  invoices.splice(index, 1);
  return true;
}

/**
 * The bulk "approve & push" action. Real pushes are asynchronous, so the demo
 * lands on `sentToSage` directly — `inProgress` is already represented in the
 * seed for anyone who needs to see that state.
 */
export function bulkUpdateStatus(ids = []) {
  const wanted = ids.map(String);
  const updated = invoices.filter((row) => wanted.includes(String(row.id)));
  updated.forEach((row) => {
    if (!row.pushToSage) return;
    row.status = INVOICE_SYNC_STATUS.sentToSage;
    row.delivered = true;
    row.deliveredAt = iso(today);
  });
  return updated.length;
}

/**
 * Records a receipt against an invoice. An omitted amount settles the remaining
 * balance, which is what the old mark-as-paid action did; an explicit amount
 * makes part payments and overpayments possible.
 */
export function markInvoiceAsPaid(id, body = {}) {
  const invoice = findInvoice(id);
  if (!invoice) return null;

  const amount =
    body.amount != null && Number(body.amount) !== 0
      ? round2(Number(body.amount))
      : invoice.balanceDue;

  addPayment({
    invoiceId: invoice.id,
    siteId: invoice.siteId,
    customerId: invoice.customerId,
    amount,
    method: body.paymentMethod || PAYMENT_METHOD.cash,
    reference: body.checkNumber ? `CHK-${body.checkNumber}` : body.reference || '',
    receivedOn: body.paymentDate ? iso(new Date(body.paymentDate)) : iso(today),
    note: body.note || '',
  });

  return applyPaymentRollup(invoice);
}

/** Reversal — a mis-keyed receipt has to be removable, or the ledger lies. */
export function deletePayment(paymentId) {
  const index = payments.findIndex((payment) => String(payment.id) === String(paymentId));
  if (index === -1) return null;
  const [removed] = payments.splice(index, 1);
  const invoice = findInvoice(removed.invoiceId);
  if (invoice) applyPaymentRollup(invoice);
  return removed;
}

export function refreshInvoice(id) {
  const invoice = findInvoice(id);
  if (!invoice) return null;
  // Re-syncing with payroll nudges the line items; enough to prove the action ran.
  invoice.lineItems = invoice.lineItems.map((item) => ({
    ...item,
    quantity: item.quantity,
    total: round2(item.quantity * item.price),
    total_price: round2(item.quantity * item.price),
  }));
  invoice.lineItemsTotal = round2(invoice.lineItems.reduce((sum, item) => sum + item.total, 0));
  applyPaymentRollup(invoice);
  return invoice;
}

/* ------------------------------------------------------- dropdowns / lookups */

export function getSitesDropdown(query = {}) {
  const search = String(query.name || query.search || '')
    .trim()
    .toLowerCase();
  return Object.values(SITES)
    .filter((site) => !search || site.name.toLowerCase().includes(search))
    .map((site) => ({ id: site.id, name: site.name, customerId: site.customerId }));
}

export function getSiteContracts(siteId) {
  const site = Object.values(SITES).find((s) => String(s.id) === String(siteId)) || SITES.downtown;
  return {
    billTo: site.billTo,
    contracts: site.contracts.map((name, index) => ({
      id: site.id * 10 + index,
      name,
      paymentTerms: index === 0 ? 'NET30' : 'NET14',
    })),
  };
}

export function getBillingContacts() {
  const sageContacts = Object.values(SITES).map((site, index) => ({
    id: index + 1,
    name: site.billTo.contactPerson,
    email: site.billTo.email,
    phone: site.billTo.phone,
    contact: site.billTo.phone,
    companyName: site.client,
    isPrimary: index === 0,
  }));

  return {
    sageContacts,
    pagination: {
      currentPage: 1,
      nextPage: null,
      prevPage: null,
      totalPages: 1,
      totalCount: sageContacts.length,
    },
  };
}

/** Rows for the site billing "Merged Invoices" table, which reads `contractNames`. */
export function getMergedContractSets(siteId) {
  const site = Object.values(SITES).find((s) => String(s.id) === String(siteId)) || SITES.downtown;
  if (site.contracts.length < 2) return { contractSets: [] };
  return {
    contractSets: [
      {
        id: site.id * 100 + 1,
        contractNames: site.contracts.slice(0, 2),
        billingFrequency: 'monthly',
        cycleReferenceDate: iso(shiftDays(-45)),
        createdAt: usDate(shiftDays(-45)),
      },
    ],
  };
}

/**
 * Candidate sets for the merge modal, which groups by set and renders each
 * contract's `name` + `duration` ("DD-MM-YYYY - DD-MM-YYYY").
 */
export function getMergeableContractSets(siteId) {
  const site = Object.values(SITES).find((s) => String(s.id) === String(siteId)) || SITES.downtown;
  const euDate = (date) =>
    `${pad(date.getDate())}-${pad(date.getMonth() + 1)}-${date.getFullYear()}`;
  const duration = `${euDate(shiftDays(-365))} - ${euDate(shiftDays(365))}`;

  if (site.contracts.length < 2) return { contractSets: [] };

  return {
    contractSets: [
      {
        cycleReferenceDate: iso(shiftDays(-30)),
        billingFrequency: 'monthly',
        contracts: site.contracts.map((name, index) => ({
          id: site.id * 10 + index,
          name,
          duration,
        })),
      },
    ],
  };
}

/* ----------------------------------------------------------- files (CSV/PDF) */

const CSV_COLUMNS = [
  ['Invoice #', (row) => row.invoiceNumber],
  ['Customer ID', (row) => row.customerId],
  ['Site', (row) => row.siteName],
  ['Type', (row) => (row.invoiceType === INVOICE_TYPE.adHoc ? 'Ad hoc' : 'Scheduled')],
  ['Invoice date', (row) => usDate(new Date(row.invoiceGenerated))],
  ['Due date', (row) => usDate(new Date(row.dueDate))],
  ['Line items', (row) => row.lineItemsTotal.toFixed(2)],
  ['Tax', (row) => row.taxAmount.toFixed(2)],
  ['Grand total', (row) => row.grandTotal.toFixed(2)],
  ['Amount paid', (row) => row.amountPaid.toFixed(2)],
  ['Balance due', (row) => row.balanceDue.toFixed(2)],
  ['Payment state', (row) => PAYMENT_STATE_LABELS[row.paymentState] || 'Unpaid'],
  ['Days overdue', (row) => (daysOverdue(row) > 0 ? daysOverdue(row) : 0)],
  [
    'Discrepancies',
    (row) =>
      getInvoiceFlags(row)
        .map((f) => DISCREPANCY_LABELS[f])
        .join('; '),
  ],
];

const PAYMENT_STATE_LABELS = {
  [PAYMENT_STATE.unpaid]: 'Unpaid',
  [PAYMENT_STATE.partial]: 'Part paid',
  [PAYMENT_STATE.paid]: 'Paid',
  [PAYMENT_STATE.overpaid]: 'Overpaid',
};

const DISCREPANCY_LABELS = {
  [DISCREPANCY.shortPaid]: 'Short paid',
  [DISCREPANCY.overpaid]: 'Overpaid',
  [DISCREPANCY.unpaidOverdue]: 'Unpaid, overdue',
  [DISCREPANCY.paidLate]: 'Paid late',
  [DISCREPANCY.notIssued]: 'Never issued',
};

const csvCell = (value) => {
  const text = String(value ?? '');
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

export function buildInvoiceExportCsv(query = {}) {
  const rows = filterInvoices(query);
  const lines = [CSV_COLUMNS.map(([header]) => header).join(',')];
  rows.forEach((row) => {
    lines.push(CSV_COLUMNS.map(([, accessor]) => csvCell(accessor(row))).join(','));
  });
  return `${lines.join('\r\n')}\r\n`;
}

/**
 * The existing "Invoice Reconciliation" modal expects `data` as an array of
 * rows it joins itself (see `invoiceReconciliationModel`), not a CSV string.
 * That modal currently exports *payroll*, which is a separate problem — this
 * keeps it from downloading a file that says "undefined".
 */
export function buildReconciliationRows(query = {}) {
  const rows = filterInvoices(query);
  return [
    CSV_COLUMNS.map(([header]) => header),
    ...rows.map((row) => CSV_COLUMNS.map(([, accessor]) => String(accessor(row)))),
  ];
}

/* --------------------------------------------------------------------- PDF */

const PDF_FONT = 'Helvetica';

function pdfEscape(text) {
  return String(text)
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
    .replace(/[^\x20-\x7E]/g, ' ');
}

/**
 * Assembles a single-page PDF with a correct cross-reference table. react-pdf
 * (pdf.js) renders the invoice preview drawer, and it needs real bytes — a
 * mock object stringified into a Blob shows up as a failed document.
 */
function buildSimplePdf(lines) {
  let cursorY = 760;
  const content = ['BT', `/F1 18 Tf`, `1 0 0 1 56 ${cursorY} Tm`, `(${pdfEscape(lines[0])}) Tj`];
  cursorY -= 34;
  content.push('ET');

  lines.slice(1).forEach((line) => {
    const size = line.startsWith('##') ? 13 : 10.5;
    const text = line.replace(/^##\s*/, '');
    content.push(
      'BT',
      `/F1 ${size} Tf`,
      `1 0 0 1 56 ${cursorY} Tm`,
      `(${pdfEscape(text)}) Tj`,
      'ET',
    );
    cursorY -= line.startsWith('##') ? 24 : 16;
  });

  const stream = content.join('\n');
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] ' +
      '/Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>',
    `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
    `<< /Type /Font /Subtype /Type1 /BaseFont /${PDF_FONT} >>`,
  ];

  let pdf = '%PDF-1.4\n';
  const offsets = [];
  objects.forEach((body, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${body}\nendobj\n`;
  });

  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.forEach((offset) => {
    pdf += `${String(offset).padStart(10, '0')} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  const bytes = new Uint8Array(pdf.length);
  for (let i = 0; i < pdf.length; i += 1) bytes[i] = pdf.charCodeAt(i) & 0xff;
  return bytes;
}

export function buildInvoicePdf(id) {
  const invoice = findInvoice(id) || invoices[0];
  const site = Object.values(SITES).find((s) => s.id === invoice.siteId) || SITES.downtown;
  const money = (value) => `$${Number(value).toFixed(2)}`;

  const lines = [
    `Invoice ${invoice.invoiceNumber}`,
    `## Bill to`,
    site.billTo.name,
    site.billTo.address,
    `${site.billTo.contactPerson} — ${site.billTo.email}`,
    '',
    `## Invoice details`,
    `Site: ${invoice.siteName}`,
    `Customer ID: ${invoice.customerId}`,
    `Invoice date: ${usDate(new Date(invoice.invoiceGenerated))}`,
    `Due date: ${usDate(new Date(invoice.dueDate))}   Terms: ${invoice.paymentTerm}`,
    `Service period: ${invoice.invoiceDuration}`,
    `PO number: ${invoice.poNumber || '—'}`,
    '',
    `## Line items`,
    ...invoice.lineItems.map(
      (item) =>
        `${item.description}   ${item.quantity} x ${money(item.price)} = ${money(item.total)}`,
    ),
    '',
    `Subtotal: ${money(invoice.lineItemsTotal)}`,
    `Tax: ${money(invoice.taxAmount)}`,
    `Grand total: ${money(invoice.grandTotal)}`,
    `Amount paid: ${money(invoice.amountPaid)}`,
    `Balance due: ${money(invoice.balanceDue)}`,
  ];

  if (invoice.invoiceMemo) lines.push('', `Memo: ${invoice.invoiceMemo}`);

  return buildSimplePdf(lines);
}

export const INVOICE_SITES = SITES;
