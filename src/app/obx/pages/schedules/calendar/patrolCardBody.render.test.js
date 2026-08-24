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
    /* **It is not drawn here any more.** The badge moved to the card's top-right
       corner, which on this card is the time line's row — rendered by
       `CalendarCardContent`, beside the missed-hits chip that shares that corner. This
       body's job ends at the officer and the marks, so the assertion worth keeping is
       that it draws no count on either shape. */
    it('is not part of the card body on any shape', () => {
      ['visit-count', 'visit-count-value', 'visit-count-icon'].forEach((cls) => {
        expect(
          renderBody({ showVehicle: false }).container.querySelectorAll(`.${cls}`),
        ).toHaveLength(0);
        expect(
          renderBody({ showVehicle: true }).container.querySelectorAll(`.${cls}`),
        ).toHaveLength(0);
      });
    });

    it('leaves the routes reading as one row of officer and marks', () => {
      const { container, getAllByTestId } = renderBody({ showVehicle: false });

      /* One row under the time line, not two: the line this shape used to spend on
         the count is exactly what moving the badge to the corner gave back. */
      const rows = container.querySelectorAll('.row.row-new');
      expect(rows).toHaveLength(1);
      expect(rows[0].children).toHaveLength(2);
      expect(rows[0].children[0]).toHaveTextContent('Priya Raman');
      expect(rows[0].children[1].querySelectorAll('[data-testid="status-mark"]')).toHaveLength(1);
      expect(getAllByTestId('status-mark')).toHaveLength(1);
    });

    it('keeps the unassigned officer slot a full-width click target', () => {
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
        shift: bare,
        canAssignOfficer: true,
        officerClickProps: { onClick: () => {} },
        statusIcon: null,
      });

      const trigger = container.querySelector('.group.assign-trigger');
      expect(trigger).not.toBeNull();
      expect(trigger.querySelectorAll('.officer-empty')).toHaveLength(1);
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
