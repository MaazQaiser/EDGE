import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import React from 'react';
import { EVENT_BG_COLOR_CLASSES } from 'src/app/components/common/calendar/calendarStatusWash';
import { calendarIndicatorIcons } from 'src/app/obx/pages/schedules/components/scheduleStatusIcons';
import { theme } from 'src/theme';
import { calendarShiftStatusEnum } from 'src/utils/constants/schedules';

import RouteMonthChipContent from './RouteMonthChipContent';

/**
 * What a route chip in a month cell says: the route, and that run's visit count.
 *
 * A rendered test, because every question here is about what reaches the DOM at a
 * width where most of the week card cannot — the route name is *promoted* onto the
 * chip (in the week it is the row label), the count is present at `0` and absent at
 * `null`, and the status mark comes along on every state rather than on the untinted
 * ones alone.
 *
 * `ScheduleCalendarGrid.jsx` cannot be imported here — it pulls in FullCalendar,
 * whose ESM jest's transform ignores — which is why the chip's contents live in their
 * own component, exactly as `VisitMonthChipContent` and `PatrolCardBody` do.
 * `calendar.styles.js` is out of reach for the same reason, so the sheet is stubbed
 * with recognisable names and passed in as `classes` as production passes it. The svgs
 * are mapped to a bare `<svg>` by `__mocks__/svgrMock.js`, so a glyph is identified by
 * the wrapper class the stylesheet sizes it with.
 *
 * The **count classes are asserted by name**, and that is the point of naming them
 * here: `patrolVisitCount` / `-Icon` / `-Value` are the week route card's own three
 * classes (`patrolCardBody.render.test.js` stubs the same three), so a count that is
 * ever restyled for the month would have to stop using them and this would say so.
 */

const CLASSES = {
  routeMonthChipName: 'chip-route',
  routeMonthChipMeta: 'chip-meta',
  patrolVisitCount: 'visit-count',
  patrolVisitCountIcon: 'visit-count-icon',
  patrolVisitCountValue: 'visit-count-value',
  visitStatusIcon: 'chip-mark',
};

/* Shaped like a mapped route card (`makeShift` in `schedule.mock.js`, through
   `mapShiftToCalendarEvent`): the month flattens `start` to a bare date and keeps the
   run's own window label in `name` while the route sits in `runsheetName`. */
const routeCard = (over = {}) => ({
  shiftType: 'patrol',
  name: 'Morning Patrol',
  runsheetName: 'Orlando Day Time Runsheet',
  start: '2026-08-20',
  startsAt: '2026-08-20T08:00:00.000Z',
  status: 'inProgress',
  hasNotes: true,
  isSplit: true,
  officer: { name: 'Priya Shah' },
  vehicle: { name: 'Van 4' },
  ...over,
});

const draw = (props = {}) =>
  render(
    <ThemeProvider theme={theme}>
      <RouteMonthChipContent
        classes={CLASSES}
        shift={routeCard()}
        statusIcon={calendarIndicatorIcons[calendarShiftStatusEnum.IN_PROGRESS]}
        visitCount={3}
        {...props}
      />
    </ThemeProvider>,
  );

describe('the routes month chip', () => {
  it('names the route and counts its run, in the week card`s own count treatment', () => {
    const { container } = draw();

    expect(container.querySelector('.chip-route').textContent).toBe('Orlando Day Time Runsheet');

    const count = container.querySelector('.visit-count');
    expect(count.querySelector('.visit-count-value').textContent).toBe('3');
    // The glyph reached the DOM, in the box the sheet sizes it with.
    expect(count.querySelector('.visit-count-icon svg')).not.toBeNull();
  });

  it('carries no noun of its own — not on the face, and no longer in a native title', () => {
    const { container } = draw();

    /* No word beside the figure. `Visit`/`Visits` is the tenant's own term and the chip is
       147px wide; the count is a glyph and a number, as on the week card. */
    expect(container.textContent).not.toMatch(/visits?/i);

    /* **And no `title` attribute either, which is a change.** The count used to carry one,
       and it was the only thing on this chip that said the noun — to a reader who rested on
       a 14px glyph for a second. Both nouns now come from `RouteMonthChipTooltip`, which
       covers the whole chip and says what the card is as well as what the number counts.
       Asserted as absent rather than simply dropped from the test: leaving the attribute in
       place under a MUI tooltip fires both, one over the other, saying nearly the same
       sentence — the duplication `FieldLabel` documents avoiding by refusing `describeChild`.
       If somebody restores it, this is the line that should object. */
    expect(container.querySelector('.visit-count').getAttribute('title')).toBeNull();
  });

  it('says `0` for an empty run, and nothing at all when there is no list', () => {
    /* The distinction `buildRouteVisitCounts` decides once for the whole window: a
       route running with no stops on it is a fact the list can state, so it prints
       `0`. "There is no list" prints nothing rather than a confident zero. */
    const zero = draw({ visitCount: 0 }).container;
    expect(zero.querySelector('.visit-count-value').textContent).toBe('0');

    const none = draw({ visitCount: null }).container;
    expect(none.querySelector('.visit-count')).toBeNull();
    // Losing the count does not cost the chip its route or its mark.
    expect(none.querySelector('.chip-route').textContent).toBe('Orlando Day Time Runsheet');
    expect(none.querySelector('.chip-mark')).not.toBeNull();
  });

  it('marks the status on every state, including the three the wash cannot carry', () => {
    /* The reason this is unconditional where the visits chip's mark is not: only
       `notStarted`, `inProgress` and `completed` take a wash at all, so unassigned,
       missed and cancelled runs are all the shell's plain grey and the badge is the
       only thing between them. The week's route card marks every state too. */
    [
      calendarShiftStatusEnum.IN_PROGRESS,
      calendarShiftStatusEnum.COMPLETED,
      calendarShiftStatusEnum.UNASSIGNED,
    ].forEach((status) => {
      const { container } = draw({ statusIcon: calendarIndicatorIcons[status] });
      const mark = container.querySelector('.chip-mark');

      expect(mark).not.toBeNull();
      expect(mark.querySelector('svg')).not.toBeNull();
      /* Not new information to a screen reader — the event's own `aria-label`
         (`buildEventAccessibleName`) already speaks the resolved status, and the
         footer legend names the glyph for sighted readers (D28). */
      expect(mark.getAttribute('aria-hidden')).toBe('true');
    });

    // And the untinted states really are untinted — the badge is doing the work.
    expect(EVENT_BG_COLOR_CLASSES[calendarShiftStatusEnum.UNASSIGNED]).toBeUndefined();
    expect(EVENT_BG_COLOR_CLASSES[calendarShiftStatusEnum.IN_PROGRESS]).toBe(
      'statusFillInProgress',
    );
  });

  it('drops the officer, the vehicle and the corner marks the week card carries', () => {
    /* Not an absence of wiring — the shift below has all four — but the chip's whole
       argument: at a seventh of the grid, the pair that identifies the run wins and
       the rest is one click away in the drawer the chip opens. */
    const { container } = draw();

    expect(container.textContent).not.toContain('Priya Shah');
    expect(container.textContent).not.toContain('Van 4');
    expect(container.querySelectorAll('svg')).toHaveLength(2); // the count glyph, and the badge
  });

  it('falls back to the run`s own name when a card carries no route', () => {
    // `mapShiftToCalendarEvent` falls a shift's route back to its row title, so this
    // is rare — but a chip with an empty label would be a chip that identifies nothing.
    const { container } = draw({ shift: routeCard({ runsheetName: null }) });
    expect(container.querySelector('.chip-route').textContent).toBe('Morning Patrol');
  });
});
