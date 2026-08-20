import { makeStyles, ServerStyleSheets } from '@mui/styles';
import React from 'react';
import { renderToString } from 'react-dom/server';
import {
  EVENT_BG_COLOR_CLASSES,
  IN_PROGRESS_WASH,
  statusFillInProgressRule,
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
 * In progress renders blue, and the same blue, everywhere a card can say it.
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
  visitFillInProgress: visitFillInProgressRule,
});

const Probe = () => {
  const classes = useProbeStyles();
  return <div className={`${classes.statusFillInProgress} ${classes.visitFillInProgress}`} />;
};

const emitCss = () => {
  const sheets = new ServerStyleSheets();
  renderToString(sheets.collect(<Probe />));
  return sheets.toString();
};

describe('the in-progress wash', () => {
  it('emits the semantic blue for the shift and V2 card', () => {
    expect(emitCss()).toMatch(/statusFillInProgress-\d+\s*\{\s*background-color:\s*#EFF8FF/i);
  });

  it('emits the same blue for the visit card, and no duty accent with it', () => {
    const css = emitCss();

    expect(css).toMatch(/visitFillInProgress-\d+\s*\{[^}]*background:\s*#EFF8FF/i);
    expect(css).toMatch(/visitFillInProgress-\d+\s*\{[^}]*border-left:\s*none/i);
  });

  it('keeps the !important both rules need to beat the card shell', () => {
    const css = emitCss();
    const rules = css.match(/#EFF8FF[^;]*/gi) || [];

    expect(rules).toHaveLength(2);
    rules.forEach((rule) => expect(rule).toMatch(/!important/));
  });

  it('is the value the Companies views paint too', () => {
    const fills = visitCardFills(theme);

    expect(fills[calendarShiftStatusEnum.IN_PROGRESS].background).toBe(IN_PROGRESS_WASH);
    expect(fills[calendarShiftStatusEnum.SHIFT_STARTED].background).toBe(IN_PROGRESS_WASH);
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

  /* End to end on the card that was reported: the demo week's one in-progress visit
     — Ormesby Business Village, Thu 20 Aug, route "Day Time Patrols" — through the
     expression `getVisitLegacyBgClass` evaluates, which is the only reason a V2 card
     gets a wash at all. Written against the payload rather than a fixture so it fails
     if the state resolver, the status map or the class map moves. */
  it('lands the demo week in-progress visit on the blue wash', () => {
    const week = buildScheduleSummary({
      windowStart: '2026-08-17',
      windowEnd: '2026-08-23',
      view: 'visits',
      groupBy: 'company',
    });
    const washFor = (visit) => EVENT_BG_COLOR_CLASSES[VISIT_STATE_STATUS[resolveVisitState(visit)]];
    const inProgress = week.shifts.filter(
      (visit) =>
        VISIT_STATE_STATUS[resolveVisitState(visit)] === calendarShiftStatusEnum.IN_PROGRESS,
    );

    // The treatment was unreachable until in-progress visits existed in the demo data.
    expect(inProgress).toHaveLength(1);
    expect(inProgress[0].siteName || inProgress[0].site?.name).toBe('Ormesby Business Village');
    expect(washFor(inProgress[0])).toBe('statusFillInProgress');
  });
});
