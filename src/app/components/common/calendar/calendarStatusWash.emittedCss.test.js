import { makeStyles, ServerStyleSheets } from '@mui/styles';
import dayjs from 'dayjs';
import React from 'react';
import { renderToString } from 'react-dom/server';
import {
  EVENT_BG_COLOR_CLASSES,
  IN_PROGRESS_WASH,
  NOT_STARTED_WASH,
  statusFillInProgressRule,
  statusFillNotStartedRule,
  visitFillInProgressRule,
} from 'src/app/components/common/calendar/calendarStatusWash';
import { visitCardFills } from 'src/app/obx/pages/schedules/helper/visitCardInk';
import {
  resolveVisitState,
  VISIT_STATE_STATUS,
} from 'src/app/obx/pages/schedules/helper/visitState';
import { buildScheduleSummary } from 'src/stubbedData/mocks/schedule.mock';
import { theme } from 'src/theme';
import { FILTER_GO_TENANT, getBrandTokensForTenant } from 'src/theme/tenantBranding';
import { calendarShiftStatusEnum } from 'src/utils/constants/schedules';

/**
 * In progress renders the same wash everywhere a card can say it.
 *
 * **The hex used to be written into these assertions and is not any more.** Four of them
 * matched `#EFF8FF` literally, and when the card spec moved in-progress from blue to amber
 * they all failed — reporting a *colour change* as four broken tests, when what this file
 * is actually for is that the three surfaces stay in step with each other. The value is
 * `IN_PROGRESS_WASH`'s to state; this file's job is to prove that the emitted CSS, the
 * visit card and the Companies views all read it. Driven off the constant, it now passes
 * whatever the colour is and still fails the moment one surface stops following.
 *
 * The one assertion that *should* name a literal still does: the Filter Go brand token, in
 * `does not read the brand token` — that one is checking a value the wash must never equal,
 * so it has to know it.
 *
 * Asserted on the **emitted CSS** rather than on a rendered element, because the
 * whole failure mode here is a value that resolves differently per tenant behind an
 * `!important` cascade — jsdom computes neither usefully. `calendar.styles.js` cannot
 * be imported at all (it reaches FullCalendar's protected styles, which jest's
 * transform will not parse), which is why the two declarations live in
 * `calendarStatusWash.js`: the objects below are the *same objects* that sheet uses,
 * so running them through `makeStyles` emits production's own rules.
 */

const useProbeStyles = makeStyles({
  statusFillInProgress: statusFillInProgressRule,
  statusFillNotStarted: statusFillNotStartedRule,
  visitFillInProgress: visitFillInProgressRule,
});

const Probe = () => {
  const classes = useProbeStyles();
  return (
    <div
      className={`${classes.statusFillInProgress} ${classes.statusFillNotStarted} ${classes.visitFillInProgress}`}
    />
  );
};

/** The wash hex, escaped for a regex — `#` is literal but the value is not ours to assume. */
const hex = (value) => value.replace('#', '\\#');

const emitCss = () => {
  const sheets = new ServerStyleSheets();
  renderToString(sheets.collect(<Probe />));
  return sheets.toString();
};

describe('the in-progress wash', () => {
  it('emits the wash for the shift and V2 card', () => {
    expect(emitCss()).toMatch(
      new RegExp(
        `statusFillInProgress-\\d+\\s*\\{\\s*background-color:\\s*${hex(IN_PROGRESS_WASH)}`,
        'i',
      ),
    );
  });

  it('emits the same wash for the visit card, and no duty accent with it', () => {
    const css = emitCss();

    expect(css).toMatch(
      new RegExp(
        `visitFillInProgress-\\d+\\s*\\{[^}]*background:\\s*${hex(IN_PROGRESS_WASH)}`,
        'i',
      ),
    );
    expect(css).toMatch(/visitFillInProgress-\d+\s*\{[^}]*border-left:\s*none/i);
  });

  it('keeps the !important both rules need to beat the card shell', () => {
    const css = emitCss();
    const rules = css.match(new RegExp(`${hex(IN_PROGRESS_WASH)}[^;]*`, 'gi')) || [];

    expect(rules).toHaveLength(2);
    rules.forEach((rule) => expect(rule).toMatch(/!important/));
  });

  it('is the value the Companies views paint too', () => {
    const fills = visitCardFills(theme);

    expect(fills[calendarShiftStatusEnum.IN_PROGRESS].background).toBe(IN_PROGRESS_WASH);
    expect(fills[calendarShiftStatusEnum.SHIFT_STARTED].background).toBe(IN_PROGRESS_WASH);
  });
});

describe('the not-started wash', () => {
  /* Added with the card spec, which moved the amber onto in-progress and left not-started
     needing a fill of its own. It takes the same `!important` for the same reason: the card
     shell sets a background unconditionally, so a wash that does not shout is not applied. */
  it('emits the grey, with the !important the shell forces', () => {
    expect(emitCss()).toMatch(
      new RegExp(
        `statusFillNotStarted-\\d+\\s*\\{\\s*background-color:\\s*${hex(NOT_STARTED_WASH)}\\s*!important`,
        'i',
      ),
    );
  });

  it('is a distinct wash from the other two, so the three states cannot collide', () => {
    const values = new Set([
      NOT_STARTED_WASH,
      IN_PROGRESS_WASH,
      visitCardFills(theme)[calendarShiftStatusEnum.COMPLETED]?.background,
    ]);
    expect(values.size).toBe(3);
  });

  it('is routed to by not-started, where the amber used to be', () => {
    /* `dutyYellowBg` is still a perfectly good amber class and is still referenced. What it
       must not be again is the thing a *status* points at — see `EVENT_BG_COLOR_CLASSES`. */
    expect(EVENT_BG_COLOR_CLASSES[calendarShiftStatusEnum.NOT_STARTED]).toBe(
      'statusFillNotStarted',
    );
  });
});

describe('what a status may be washed with', () => {
  it('no longer routes in progress through the brand-coloured duty class', () => {
    expect(EVENT_BG_COLOR_CLASSES[calendarShiftStatusEnum.IN_PROGRESS]).toBe(
      'statusFillInProgress',
    );
    expect(Object.values(EVENT_BG_COLOR_CLASSES)).not.toContain('dutyBlueBg');
  });

  /* The reason the class could not simply be redefined, stated as a test: the token
     `dutyBlueBg` resolves is a *brand* colour, so its value is whatever the tenant
     sells under. On Filter Go that is a pale green — the exact wash the screenshot
     showed under a blue in-progress badge. */
  it('does not read the brand token, which is green on Filter Go', () => {
    const filterGo = getBrandTokensForTenant(FILTER_GO_TENANT);

    expect(filterGo.brandSubtle).toBe('#E8F7ED');
    expect(IN_PROGRESS_WASH).not.toBe(filterGo.brandSubtle);
  });

  /**
   * End to end, through the expression `getVisitLegacyBgClass` evaluates — the only reason a
   * V2 card gets a wash at all. Written against the payload rather than a fixture so it
   * fails if the state resolver, the status map or the class map moves.
   *
   * **The window is derived, where it used to be the literal `2026-08-17`–`23`.** The mock
   * decides in-progress against the real clock, so a hardcoded week stops containing one the
   * moment it falls into the past — which it had, and the test was failing for that and
   * nothing else. A test that expires on a date is a test that reports the calendar as a
   * regression.
   *
   * It also no longer demands *exactly one*. That was true of the demo book when this was
   * written and is not a property worth pinning: the mock has since grown a second
   * in-progress visit, and "the wash reaches them" does not become less true when there are
   * two of them. What is pinned is that there is at least one — without that the assertion
   * below is vacuous — and that every one of them lands on the in-progress class.
   */
  it("lands the demo week's in-progress visits on the in-progress wash", () => {
    const monday = dayjs().startOf('week');
    const week = buildScheduleSummary({
      windowStart: monday.format('YYYY-MM-DD'),
      windowEnd: monday.add(6, 'day').format('YYYY-MM-DD'),
      view: 'visits',
      groupBy: 'company',
    });
    const statusOf = (visit) => VISIT_STATE_STATUS[resolveVisitState(visit)];
    const inProgress = week.shifts.filter(
      (visit) => statusOf(visit) === calendarShiftStatusEnum.IN_PROGRESS,
    );

    /* The treatment is unreachable unless in-progress visits exist in the demo data — this
       is what stops the `forEach` below passing over an empty list. */
    expect(inProgress.length).toBeGreaterThan(0);
    inProgress.forEach((visit) =>
      expect(EVENT_BG_COLOR_CLASSES[statusOf(visit)]).toBe('statusFillInProgress'),
    );
  });
});
