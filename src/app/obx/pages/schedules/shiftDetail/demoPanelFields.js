/**
 * Two fields the side panels are designed with and the payload does not carry.
 *
 * **Prototype stand-ins, and nothing else.** The runsheet and visit panels were redrawn
 * from a design that shows a *Shift Pay Rate Override* and a collapsed *Break
 * Configurations* section. Neither exists on the shift or runsheet responses: there is no
 * override field anywhere in this codebase (the visit panel's old pay-rate row read
 * `hourlyRate` and had been commented out), and a runsheet's break rule is only ever written
 * — by the runsheet form's dropdown — never read back on the detail.
 *
 * Asked for directly: show them with demo values so the walkthrough matches the design,
 * clearly marked so they cannot be mistaken for real data.
 *
 * **How they behave.** Each reader prefers a real value and falls back to the stand-in, so
 * the day the API grows either field it wins here with no further change — and the fallback
 * is the only line to delete. The field names below are guesses at what those fields will be
 * called, which is the honest state of it: they are the names the rest of the app uses for
 * the same ideas.
 *
 * Same category as `scatterVisitsForDemo` and `harmonizedDayStack`: demo scaffolding, held
 * in one module, deleted in one commit.
 */

/** What the design prints. */
const DEMO_PAY_RATE_OVERRIDE = 29;

/**
 * The rule the design's collapsed section stands for.
 *
 * A break rule in this product is a named policy with a length, a trigger and whether the
 * officer is paid through it — the three the runsheet form asks for. Stated as rows rather
 * than a sentence so the section reads as data the panel is showing rather than as copy.
 */
const DEMO_BREAK_CONFIGURATION = {
  name: 'Standard field day',
  rows: [
    { label: 'Break', value: '30m unpaid' },
    { label: 'Taken after', value: '4h on shift' },
    { label: 'Officer paid for breaks', value: 'No' },
  ],
};

/**
 * The shift's pay rate override, in dollars.
 *
 * `payRateOverride` is the field this is waiting for; `hourlyRate` is the one that exists
 * today on some shift payloads and means something close enough to show. `0` is a legitimate
 * override and must not fall through to the stand-in, hence the null check rather than `||`.
 */
export const shiftPayRateOverride = (shiftData = {}) => {
  const real = shiftData?.payRateOverride ?? shiftData?.hourlyRate;
  return real == null ? DEMO_PAY_RATE_OVERRIDE : real;
};

/**
 * The runsheet's break configuration, as `{ name, rows }`.
 *
 * Returns the stand-in unless the payload carries a break rule with something in it — a
 * named rule with no detail would render an empty accordion, which is worse than either
 * showing the demo or hiding the section.
 */
export const breakConfiguration = (shiftData = {}) => {
  const rule = shiftData?.breakRule || shiftData?.runsheetDetails?.breakRule;
  if (!rule?.name) return DEMO_BREAK_CONFIGURATION;

  return {
    name: rule.name,
    rows: [
      rule.durationMinutes ? { label: 'Break', value: `${rule.durationMinutes}m` } : null,
      rule.afterHours ? { label: 'Taken after', value: `${rule.afterHours}h on shift` } : null,
      rule.isPayable == null
        ? null
        : { label: 'Officer paid for breaks', value: rule.isPayable ? 'Yes' : 'No' },
    ].filter(Boolean),
  };
};
