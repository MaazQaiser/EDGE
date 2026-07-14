import { SCHEDULE_DUTIES } from '../../utils/constants/schedules';

export const duties = [
  {
    id: 336,
    groupId: 115,
    name: 'Extra Duty',
    startsAt: '2023-11-13T08:00:00',
    endsAt: '2023-11-13T12:00:00',
    duration: { startDate: '2023-07-22T00:00:00', endDate: '2023-12-22T00:00:00' },
    // totalHours: dayjs('2023-09-22T23:00:00').diff('2023-09-22T00:00:00', 'h'),
    requiresAttention: true,
    shiftType: SCHEDULE_DUTIES.EXTRA,
  },
];

export const dutiesMonth = [
  {
    date: '2023-11-17',
    [SCHEDULE_DUTIES.PATROL]: {
      type: SCHEDULE_DUTIES.PATROL,
      count: 1,
      requiresAttention: true,
    },
  },
];

export const shiftDetailMock = {
  shiftStartTime: '01:30PM',
  shiftEndTime: '08:00PM',
  totalNoOfTours: 5,
  completedTours: 0,
  dutyTimeInMinus: '30',
  assignedTo: 'Augustus Waters',
  officerPay: 21,
  isBehindSchedule: true,
  checkpoints: [
    {
      id: 11,
      deviceName: 'NFC #120',
      installLocation: '4th Floor, Event Complex Hall',
    },
  ],
};

export const shiftActivitiesMock = {
  shiftStartTime: '01:30PM',
  shiftEndTime: '08:00PM',
  totalNoOfTours: 5,
  completedTours: 0,
  dutyTimeInMinus: '30',
  assignedTo: 'Augustus Waters',
  officerPay: 21,
  isBehindSchedule: true,
  report: {
    title: 'Day End Report',
    description: 'check all four door locks',
    submittedAt: '12:00 PM',
  },
  tours: [
    {
      id: 11,
      tourName: 'Tour1',
      location: 'Ground Floor',
      completedCheckpoints: 5,
      totalCheckpoints: 5,
    },
  ],
};

export const shiftLogsMock = [
  {
    id: 11,
    title: 'Mike Ross clocked out',
    activityTime: '2023-11-3T020:00:00',
  },
];

// eslint-disable-next-line no-undef
