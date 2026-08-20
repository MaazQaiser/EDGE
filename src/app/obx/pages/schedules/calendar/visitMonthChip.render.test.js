import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import React from 'react';
import { calendarIndicatorIcons } from 'src/app/obx/pages/schedules/components/scheduleStatusIcons';
import {
  resolveVisitState,
  VISIT_STATE_STATUS,
} from 'src/app/obx/pages/schedules/helper/visitState';
import { theme } from 'src/theme';

import VisitMonthChipContent from './VisitMonthChipContent';

/**
 * The month chip's unassigned mark: drawn for a visit with no route, and for no
 * other visit.
 *
 * A rendered test rather than a unit test of the predicate, because the predicate on
 * its own would not have caught the bug this is really guarding: the chip's fill is
 * `surfaceGreySubtle` for the unrouted state, i.e. no tint at all, so *whether the
 * element reaches the DOM* is the entire question.
 *
 * `ScheduleCalendarGrid.jsx` cannot be imported here — it pulls in FullCalendar,
 * which ships ESM that jest's transform ignores — which is why the chip's contents
 * live in their own component. `calendar.styles.js` is out of reach for the same
 * reason (it imports `@fullcalendar/react/protected-styles`), so the sheet is stubbed
 * with recognisable names; the component takes `classes` as a prop exactly as
 * `VisitMonthChipTooltip` does, so nothing is faked that production does not pass.
 *
 * The icons are mapped to a bare `<svg>` by `__mocks__/svgrMock.js`, so the mark is
 * asserted by the wrapper class the stylesheet sizes and positions it with, not by
 * the glyph's identity. That the glyph *is* the unassigned one is settled by
 * construction rather than by assertion: `statusIconFor` below is the caller's own
 * `getVisitStatusValues` expression, and the component only draws it when that same
 * resolution says `UNASSIGNED`.
 */

const CLASSES = {
  visitMonthChipCompany: 'chip-company',
  visitMonthChipSeparator: 'chip-dot',
  visitMonthChipSite: 'chip-site',
  visitStatusIcon: 'chip-mark',
};

/* Verbatim from `getVisitStatusValues` in `ScheduleCalendarGrid.jsx` — the one
   resolver the week card, the day card and this chip's tooltip all read from. */
const statusIconFor = (shift) =>
  calendarIndicatorIcons[VISIT_STATE_STATUS[resolveVisitState(shift)]];

/* Shaped like the mock's visits (`makeVisit` in `schedule.mock.js`): a routed visit
   carries both `runsheetId` and `runsheetName`, an unrouted one carries neither and
   says so explicitly. Dates are far enough out that nothing here is past — a routed
   past visit resolves to missed (D11), which is a different card. */
const FUTURE = { startsAt: '2099-08-20T13:00:00.000Z', endsAt: '2099-08-20T15:00:00.000Z' };

const routed = (extra = {}) => ({
  shiftType: 'hit',
  siteName: 'Kelvin Court Offices',
  scheduleStatus: 'notStarted',
  runsheetId: 41,
  runsheetName: 'Kelvin Court Offices Route',
  isUnassigned: false,
  hasTour: true,
  ...FUTURE,
  ...extra,
});

const unrouted = (extra = {}) => ({
  shiftType: 'hit',
  siteName: 'Langford Textiles',
  scheduleStatus: 'unassigned',
  runsheetId: null,
  runsheetName: null,
  isUnassigned: true,
  hasTour: true,
  ...FUTURE,
  ...extra,
});

const draw = (shift, props = {}) =>
  render(
    <ThemeProvider theme={theme}>
      <VisitMonthChipContent
        classes={CLASSES}
        shift={shift}
        company="Elmsworth Trust"
        site={shift.siteName}
        statusIcon={statusIconFor(shift)}
        {...props}
      />
    </ThemeProvider>,
  );

describe('the month chip marks visits with no route', () => {
  it('draws the unassigned mark on a visit that is not on a route', () => {
    const { container } = draw(unrouted());

    const mark = container.querySelector('.chip-mark');
    expect(mark).not.toBeNull();
    // The glyph itself reached the DOM, not just its wrapper.
    expect(mark.querySelector('svg')).not.toBeNull();
  });

  it('draws no mark on a visit that has a route', () => {
    const { container } = draw(routed());

    expect(container.querySelector('.chip-mark')).toBeNull();
  });

  it('marks a visit blocked for want of a tour — it has no route either', () => {
    // `hasTour: false` is the explicit denial `isBlockedWithoutTour` asks for, and
    // BLOCKED_NO_TOUR shares the unassigned status: no route can take a visit with
    // no defined work, and D6 counts it in the same band.
    const { container } = draw(unrouted({ hasTour: false, tour: null }));

    expect(container.querySelector('.chip-mark')).not.toBeNull();
  });

  it('leaves routed terminal states unmarked', () => {
    // Completed and missed are routed states: something planned them, so the chip
    // must not claim nobody did.
    ['completed', 'missed'].forEach((scheduleStatus) => {
      const { container } = draw(routed({ scheduleStatus }));
      expect(container.querySelector('.chip-mark')).toBeNull();
    });
  });

  it('still reads company · site, with the dot only between two names', () => {
    const { container } = draw(unrouted());
    expect(container.querySelector('.chip-company').textContent).toBe('Elmsworth Trust');
    expect(container.querySelector('.chip-site').textContent).toBe('Langford Textiles');
    expect(container.querySelector('.chip-dot')).not.toBeNull();

    const { container: noCompany } = draw(unrouted(), { company: '' });
    expect(noCompany.querySelector('.chip-dot')).toBeNull();
    // The mark survives losing a name — it is not positioned off either of them.
    expect(noCompany.querySelector('.chip-mark')).not.toBeNull();
  });
});
