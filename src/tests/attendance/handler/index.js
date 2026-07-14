import { rest } from 'msw';

// eslint-disable-next-line no-undef
const attendanceServiceEndPoint = process.env.REACT_APP_SCHEDULING;

// Get Attendances API
export const fetchAllAttendances = rest.get(
  `${attendanceServiceEndPoint}/shift/attendanceSummary`,
  async (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        message: 'success',
        statusCode: 200,
        data: {
          summary: [
            {
              officer: {
                id: 2859,
                name: 'Albert Mishima',
                franchiseId: 1,
                availability: [
                  {
                    id: 1,
                    day: 'Monday',
                    endTime: '05:00 AM',
                    startTime: '08:00 AM',
                  },
                  {
                    id: 2,
                    day: 'Tuesday',
                    endTime: '05:00 AM',
                    startTime: '08:00 AM',
                  },
                  {
                    id: 3,
                    day: 'Wednesday',
                    endTime: '05:00 AM',
                    startTime: '08:00 AM',
                  },
                  {
                    id: 4,
                    day: 'Thursday',
                    endTime: '05:00 AM',
                    startTime: '08:00 AM',
                  },
                  {
                    id: 5,
                    day: 'Friday',
                    endTime: '05:00 AM',
                    startTime: '08:00 AM',
                  },
                  {
                    id: 6,
                    day: 'Saturday',
                    endTime: '05:00 AM',
                    startTime: '08:00 AM',
                  },
                  {
                    id: 7,
                    day: 'Sunday',
                    endTime: '05:00 AM',
                    startTime: '08:00 AM',
                  },
                ],
                level: 1,
                image:
                  'https://as1.ftcdn.net/v2/jpg/02/43/51/48/1000_F_243514868_XDIMJHNNJYKLRST05XnnTj0MBpC4hdT5.jpg',
                label: 'Albert Mishima',
                value: 2859,
                isAssigned: false,
                imageUrl:
                  'https://as1.ftcdn.net/v2/jpg/02/43/51/48/1000_F_243514868_XDIMJHNNJYKLRST05XnnTj0MBpC4hdT5.jpg',
              },
              totalLateCheckins: 0,
              averageDutyHours: 0.4666666666666667,
              totalExtraShifts: 1,
              totalWorkingDays: 1,
              totalLeaves: {
                absents: 0,
                consumedLeaves: 0,
                appliedLeaves: 0,
                totalRemainingLeaves: 0,
              },
            },
          ],
          pagination: {
            page: '1',
            perPage: '10',
            totalPages: 1,
            totalCount: 1,
          },
        },
      }),
    );
  },
);

export const fetchAllAttendancesError = rest.get(
  `${attendanceServiceEndPoint}/shift/attendanceSummary`,
  async (req, res, ctx) => {
    return res(
      ctx.status(400),
      ctx.json({
        statusCode: 400,
        message: 'Error fetching attendances',
      }),
    );
  },
);

export const getUserDetail = rest.get(`${attendanceServiceEndPoint}/users/:id`, (req, res, ctx) => {
  if (!req?.params?.id || req.params.id === 'undefined') {
    res(
      ctx.status(404),
      ctx.json({
        statusCode: 404,
        message: 'User Not Found',
      }),
    );
  }

  return res(
    ctx.status(200),
    ctx.json({
      data: {
        user: {
          id: 2859,
          name: 'Albert Mishima',
          zones: [
            {
              id: 43,
              name: 'zone faizan',
            },
          ],
          email: 'faizan.ali+223@camp1.tkxel.com',
          role: 'Officer',
          slug: 'officer',
          status: 'active',
          dutyType: 'dedicated',
          joinedDate: null,
          firstName: 'Albert',
          lastName: 'Mishima',
          phoneNumber: null,
          image: 'https://signalassets.blob.core.windows.net/signal/assets/Avatar.svg',
          level: 1,
          site: 'N/A',
          skill: 'N/A',
          dob: 'N/A',
          designation: 'N/A',
          department: 'N/A',
        },
      },
      statusCode: 200,
      message: 'The record has been fetched successfully!',
    }),
  );
});

export const getUserDetailError = rest.get(
  `${attendanceServiceEndPoint}/users/:id`,
  (req, res, ctx) => {
    if (!req?.params?.id || req.params.id === 'undefined') {
      res(
        ctx.status(404),
        ctx.json({
          statusCode: 404,
          message: 'User Not Found',
        }),
      );
    }

    return res(
      ctx.status(500),
      ctx.json({
        statusCode: 500,
        message: 'Internal Server Error',
      }),
    );
  },
);

export const fetchPendingAttendanceRequests = rest.get(
  `${attendanceServiceEndPoint}/shift/leaveRequests/:id`,
  async (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        message: 'success',
        statusCode: 200,
        data: {
          data: [
            {
              id: '6582e38d165eac9e95daa6eb',
              date: '2023-12-25T00:00:00.000Z',
              reason: 'I am sick',
              overlappingShifts: [],
            },
          ],
          pagination: {
            page: 1,
            perPage: 10,
            totalPages: 1,
            totalCount: 1,
          },
        },
      }),
    );
  },
);

export const fetchPendingAttendanceRequestsError = rest.get(
  `${attendanceServiceEndPoint}/shift/leaveRequests/:id`,
  async (req, res, ctx) => {
    return res(
      ctx.status(400),
      ctx.json({
        statusCode: 400,
        message: 'Error fetching pending attendance requests',
      }),
    );
  },
);

export const fetchAttendanceLogs = rest.get(
  `${attendanceServiceEndPoint}/shift/attendanceLogs`,
  async (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        message: 'success',
        statusCode: 200,
        data: {
          logs: [
            {
              id: '658180f2fe275da83df5cbf4',
              date: '2023-12-18',
              shiftType: 'extra',
              site: {
                id: 47,
                name: 'Chaffee Industrial',
                zone: 'South B Zone',
                value: '47',
                label: 'Chaffee Industrial',
                description: '',
              },
              status: 'shiftEnded',
              startedAt: '2023-12-19T12:57:00.000Z',
              endedAt: '2023-12-19T13:25:00.000Z',
            },
          ],
          pagination: {
            page: '1',
            perPage: '10',
            totalPages: 1,
            totalCount: 1,
          },
        },
      }),
    );
  },
);

export const fetchAttendanceLogsError = rest.get(
  `${attendanceServiceEndPoint}/shift/attendanceLogs`,
  async (req, res, ctx) => {
    return res(
      ctx.status(400),
      ctx.json({
        statusCode: 400,
        message: 'Error fetching attendance logs',
      }),
    );
  },
);

export const updateAttendanceRequest = rest.patch(
  `${attendanceServiceEndPoint}/shift/bulkUpdateLeaveStatus`,
  async (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        statusCode: 200,
        message: 'Attendance request updated successfully',
      }),
    );
  },
);

export const updateAttendanceRequestError = rest.patch(
  `${attendanceServiceEndPoint}/shift/bulkUpdateLeaveStatus`,
  async (req, res, ctx) => {
    return res(
      ctx.status(500),
      ctx.json({
        statusCode: 500,
        message: 'Internal Server Error',
      }),
    );
  },
);

export const attendanceHandlers = [
  fetchAllAttendances,
  fetchAllAttendancesError,
  getUserDetail,
  getUserDetailError,
  fetchPendingAttendanceRequests,
  fetchPendingAttendanceRequestsError,
  fetchAttendanceLogs,
  fetchAttendanceLogsError,
  updateAttendanceRequest,
  updateAttendanceRequestError,
];
