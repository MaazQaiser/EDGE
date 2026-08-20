import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import React from 'react';
import { theme } from 'src/theme';

import PatrolCardBody from './PatrolCardBody';

/**
 * The routes reading of the main service tab draws **no vehicle**, and does not
 * lose the marks that used to share the vehicle's line doing it.
 *
 * A rendered test, because both halves of the change are questions about what
 * reaches the DOM: the vehicle glyph and its name are gone, and the status /
 * notes / split marks are still there — one row up. Asserting the predicate alone
 * would have proved neither.
 *
 * `ScheduleCalendarGrid.jsx` cannot be imported here (FullCalendar ships ESM that
 * jest's transform ignores), which is why the card's patrol body lives in its own
 * component; `calendar.styles.js` is out of reach for the same reason, so the sheet
 * is stubbed with recognisable names and passed in as `classes` exactly as
 * production passes it. The svgs are mapped to bare `<svg>` by
 * `__mocks__/svgrMock.js`, so a glyph is identified by the wrapper class the
 * stylesheet sizes it with — `carIcon` is the vehicle slot's box, and nothing else
 * on this card uses it.
 */

const CLASSES = {
  reassignedFooter: 'row',
  newReassignedFooter: 'row-new',
  reassignedFooterFlex: 'group',
  reassignedOfficerFlex: 'glyph',
  reassignedName: 'label',
  unassignedOfficerIcon: 'officer-empty',
  officerAssignTrigger: 'assign-trigger',
  eventAvatar: 'avatar',
  carIcon: 'vehicle-slot',
  splitShiftIconWrapperInView: 'split-mark',
  patrolVisitCount: 'visit-count',
  patrolVisitCountIcon: 'visit-count-icon',
  patrolVisitCountValue: 'visit-count-value',
};

/* Shaped like the patrol grid's own cards (`makeShift` in `schedule.mock.js`): a
   route card for a day, with an officer on it and a van assigned to it. */
const routeCard = {
  shiftType: 'patrol',
  name: 'Day Time Patrols',
  runsheetName: 'Day Time Patrols',
  officer: { name: 'Priya Raman', imageUrl: '' },
  vehicle: { name: 'Van 4', images: [] },
  hasNotes: true,
  isSplit: true,
};

const renderBody = (props) =>
  render(
    <ThemeProvider theme={theme}>
      <PatrolCardBody
        classes={CLASSES}
        shift={routeCard}
        statusValue="In Progress"
        statusIcon={<svg data-testid="status-mark" />}
        {...props}
      />
    </ThemeProvider>,
  );

describe('the patrol card body', () => {
  it('names the vehicle everywhere the vehicle is part of the card', () => {
    const { container, getByText } = renderBody({ showVehicle: true });

    expect(getByText('Van 4')).toBeInTheDocument();
    expect(getByText('Priya Raman')).toBeInTheDocument();
    /* The van's 16px bordered box — a named van with no photo draws `WhiteCarIcon`
       in it, an unassigned one draws `unassigned-vehicle.svg` in the same box, so
       its presence is "this card has a vehicle slot" either way. */
    expect(container.querySelectorAll('.vehicle-slot')).toHaveLength(1);
    // The vehicle keeps its own line: officer above, vehicle-and-marks below.
    expect(container.querySelectorAll('.row.row-new')).toHaveLength(1);
    expect(container.querySelector('.row.row-new')).toHaveTextContent('Van 4');
  });

  it('draws the empty vehicle slot rather than nothing when no van is assigned', () => {
    const { container } = renderBody({
      showVehicle: true,
      shift: { ...routeCard, vehicle: null },
    });

    expect(container.querySelectorAll('.vehicle-slot')).toHaveLength(1);
  });

  it('draws no vehicle at all on the routes reading', () => {
    const { container, queryByText } = renderBody({ showVehicle: false });

    expect(queryByText('Van 4')).not.toBeInTheDocument();
    // Not the empty slot either — the line is gone, not emptied.
    expect(container.querySelectorAll('.vehicle-slot')).toHaveLength(0);
  });

  it('keeps the status, notes and split marks, on the officer line', () => {
    const { container, getAllByTestId } = renderBody({ showVehicle: false });

    expect(getAllByTestId('status-mark')).toHaveLength(1);
    expect(container.querySelectorAll('.split-mark')).toHaveLength(1);

    /* The compressed shape, which survives for the window that has no visit count
       to draw: one row, officer group first, marks second — so the marks keep the
       right-hand position `reassignedFooter`'s space-between gave them when the
       vehicle held that line. */
    const row = container.querySelector('.row.row-new');
    expect(row).not.toBeNull();
    expect(row.children).toHaveLength(2);
    expect(row.children[0]).toHaveTextContent('Priya Raman');
    expect(row.children[1].querySelectorAll('[data-testid="status-mark"]')).toHaveLength(1);
  });

  describe('the visit count', () => {
    /* The routes reading's card as it actually renders: no vehicle, and a count of
       the visits this run is carrying. The title arrives already resolved, the way
       `ScheduleCalendarGrid` builds it — the noun lives there and on the card face
       nowhere. */
    const withCount = (visitCount, extra = {}) =>
      renderBody({
        showVehicle: false,
        visitCount,
        visitCountTitle: `${visitCount} Visits on this Route on this day`,
        ...extra,
      });

    it('is a figure and a mark, and no word', () => {
      const { container } = withCount(4);

      const count = container.querySelector('.visit-count');
      expect(count).not.toBeNull();
      expect(count.querySelector('.visit-count-value')).toHaveTextContent('4');
      /* The whole legibility of a bare numeral rests on these two: the hits mark the
         Runsheets listing already uses for this fact, and a tooltip that says the
         noun and the scope in the tenant's own words. */
      expect(count.querySelector('.visit-count-icon svg')).not.toBeNull();
      expect(count).toHaveAttribute('title', '4 Visits on this Route on this day');
      // And nothing spelling the unit out on the card face itself.
      expect(count).toHaveTextContent('4');
      expect(count.textContent.trim()).toBe('4');
    });

    it('takes the vehicle line back, and leaves the marks where they were', () => {
      const { container, getAllByTestId } = withCount(4);

      /* Three lines under the time again — officer, then count-and-marks — which is
         the height the card was asked to get back. The officer is no longer sharing
         a row with the marks, and the marks are in the same wrapper, in the same
         second position, that the vehicle line gave them. */
      const rows = container.querySelectorAll('.row.row-new');
      expect(rows).toHaveLength(1);
      expect(rows[0].children).toHaveLength(2);
      expect(rows[0].children[0]).toHaveClass('visit-count');
      expect(rows[0].children[1].querySelectorAll('[data-testid="status-mark"]')).toHaveLength(1);
      expect(rows[0]).not.toHaveTextContent('Priya Raman');

      // The officer keeps a line of its own, ahead of that row, with nothing on it
      // to yield width to.
      const officer = container.querySelector('.group');
      expect(officer).toHaveTextContent('Priya Raman');
      expect(officer.querySelectorAll('.visit-count')).toHaveLength(0);
      expect(getAllByTestId('status-mark')).toHaveLength(1);
      expect(container.querySelectorAll('.split-mark')).toHaveLength(1);
    });

    it('says zero for a run with nothing on it, rather than going quiet', () => {
      const { container } = withCount(0);

      /* An empty run is a fact worth reading — and a card that could show a number
         and shows nothing is indistinguishable from one whose data has not
         arrived. `0` is only ever printed when the window really has a visit list;
         see `buildRouteVisitCounts`, which answers `null` when it has none. */
      expect(container.querySelector('.visit-count-value')).toHaveTextContent('0');
      expect(container.querySelectorAll('.row.row-new')).toHaveLength(1);
    });

    it('holds its shape for a card with no officer, no marks and no visits', () => {
      const bare = {
        shiftType: 'patrol',
        name: 'Day Time Patrols',
        runsheetName: 'Day Time Patrols',
        officer: null,
        reassignedOfficer: null,
        hasNotes: false,
        isSplit: false,
      };
      const { container } = renderBody({
        showVehicle: false,
        visitCount: 0,
        visitCountTitle: '0 Visits on this Route on this day',
        shift: bare,
        canAssignOfficer: true,
        officerClickProps: { onClick: () => {} },
        statusIcon: null,
      });

      // Still the same two rows under the time line, still in the same order — the
      // empty officer slot draws its own glyph rather than collapsing the line.
      expect(container.querySelectorAll('.row.row-new')).toHaveLength(1);
      expect(container.querySelector('.visit-count-value')).toHaveTextContent('0');

      /* And the unassigned slot is still the full-width click target it was: the
         trigger is the officer group, which on this shape is a direct child of the
         card's own column — the same place the vehicle shape puts it — so nothing
         shares its line. */
      const trigger = container.querySelector('.group.assign-trigger');
      expect(trigger).not.toBeNull();
      expect(trigger.querySelectorAll('.officer-empty')).toHaveLength(1);
      // Not inside a shared row: it owns its line, so its width is the card's.
      expect(trigger.closest('.row')).toBeNull();
    });

    it('draws nothing at all where there is no count to show', () => {
      // Every surface other than the routes reading, and that reading too whenever
      // the window has no visit list (the month aggregate, a failed visits fetch) —
      // which is also when the card keeps its compressed two-line shape.
      const noCount = renderBody({ showVehicle: false }).container;
      expect(noCount.querySelectorAll('.visit-count')).toHaveLength(0);
      expect(noCount.querySelector('.row.row-new')).toHaveTextContent('Priya Raman');
      expect(
        renderBody({ showVehicle: true }).container.querySelectorAll('.visit-count'),
      ).toHaveLength(0);
    });
  });

  it('leaves the officer slot the same click target it had with a vehicle line', () => {
    const onOfficerAssignClick = jest.fn();
    const officerClickProps = { onClick: onOfficerAssignClick };
    const unassigned = { ...routeCard, officer: null, reassignedOfficer: null };

    [true, false].forEach((showVehicle) => {
      const { container, unmount } = renderBody({
        showVehicle,
        shift: unassigned,
        canAssignOfficer: true,
        officerClickProps,
      });

      const trigger = container.querySelector('.group.assign-trigger');
      expect(trigger).not.toBeNull();
      expect(trigger.querySelectorAll('.officer-empty')).toHaveLength(1);
      unmount();
    });
  });
});
