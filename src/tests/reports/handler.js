import { rest } from 'msw';

import { FRANCHISE_SERVICE, REPORT_SERVICE } from '../../services/reports.services';
export const getAllList = `${REPORT_SERVICE}/shift/getFranchiseReports`;
export const getReportDetailURL = `${REPORT_SERVICE}shiftReport`;
export const updateShiftReportStatusApi = `${REPORT_SERVICE}/shiftReport/updateStatus`;
export const getAllOfficersList = `${FRANCHISE_SERVICE}/users/officer/options`;

export const fetchAllReports = rest.get(getAllList, async (req, res, ctx) => {
  return res(
    ctx.status(200),
    ctx.json({
      statusCode: 200,
      data: {
        shifts: [
          {
            id: 1,
            name: 'Dedicated Shift',
            startsAt: '2023-10-25T20:58:39.866Z',
            endsAt: '2023-10-25T20:58:39.866Z',
            reports: [
              {
                id: '6566e0eeaff27c5c1abd8e21',
                name: 'Report name',
                site: {
                  id: '123',
                  name: 'Site Name',
                },
                dueDate: '2023-10-25T20:58:39.866Z',
                submittedAt: '2023-10-25T20:58:39.866Z',
                officer: {
                  id: 'officer123',
                  name: "Fr. Osvaldo O'Keefe",
                  image:
                    'https://as1.ftcdn.net/v2/jpg/02/43/51/48/1000_F_243514868_XDIMJHNNJYKLRST05XnnTj0MBpC4hdT5.jpg',
                },
                status: 'rejected',
              },
              {
                id: '6566e0eeaff27c5c1abd8e22',
                name: 'Report name',
                site: {
                  id: '123',
                  name: 'Site Name',
                },
                dueDate: '2023-10-25T20:58:39.866Z',
                submitTime: '2023-10-25T20:58:39.866Z',
                officer: {
                  id: 'officer123',
                  name: "Fr. Osvaldo O'Keefe",
                  image:
                    'https://as1.ftcdn.net/v2/jpg/02/43/51/48/1000_F_243514868_XDIMJHNNJYKLRST05XnnTj0MBpC4hdT5.jpg',
                },
                status: 'accepted',
              },
              {
                id: '6566e0eeaff27c5c1abd8e23',
                name: 'Report name',
                site: {
                  id: '123',
                  name: 'Site Name',
                },
                dueDate: '2023-10-25T20:58:39.866Z',
                submitTime: '2023-10-25T20:58:39.866Z',
                officer: {
                  id: 'officer123',
                  name: "Fr. Osvaldo O'Keefe",
                  image:
                    'https://as1.ftcdn.net/v2/jpg/02/43/51/48/1000_F_243514868_XDIMJHNNJYKLRST05XnnTj0MBpC4hdT5.jpg',
                },
                status: 'submitted',
              },
            ],
          },
        ],
        pagination: {
          currentPage: 1,
          nextPage: 2,
          prevPage: null,
          totalPages: 6,
          totalCount: 11,
        },
      },
    }),
  );
});

export const fetchAllReportsError = rest.get(getAllList, (req, res, ctx) => {
  return res(
    ctx.status(500),
    ctx.json({
      statusCode: 500,
      message: 'Internal Server Error',
      error: 'An error occurred while fetching reports.',
    }),
  );
});

export const fetchAllOfficers = rest.get(getAllOfficersList, async (req, res, ctx) => {
  return res(
    ctx.status(200),
    ctx.json({
      data: {
        officers: [
          {
            id: 143,
            name: 'Kendall Leannon',
            image:
              'https://as1.ftcdn.net/v2/jpg/02/43/51/48/1000_F_243514868_XDIMJHNNJYKLRST05XnnTj0MBpC4hdT5.jpg',
          },
          {
            id: 867,
            name: 'Faizan',
            image:
              'https://as1.ftcdn.net/v2/jpg/02/43/51/48/1000_F_243514868_XDIMJHNNJYKLRST05XnnTj0MBpC4hdT5.jpg',
          },
          {
            id: 858,
            name: 'Lucia',
            image:
              'https://as1.ftcdn.net/v2/jpg/02/43/51/48/1000_F_243514868_XDIMJHNNJYKLRST05XnnTj0MBpC4hdT5.jpg',
          },
          {
            id: 859,
            name: 'James',
            image:
              'https://as1.ftcdn.net/v2/jpg/02/43/51/48/1000_F_243514868_XDIMJHNNJYKLRST05XnnTj0MBpC4hdT5.jpg',
          },
          {
            id: 860,
            name: 'Jim',
            image:
              'https://as1.ftcdn.net/v2/jpg/02/43/51/48/1000_F_243514868_XDIMJHNNJYKLRST05XnnTj0MBpC4hdT5.jpg',
          },
          {
            id: 861,
            name: 'Shawnee',
            image:
              'https://as1.ftcdn.net/v2/jpg/02/43/51/48/1000_F_243514868_XDIMJHNNJYKLRST05XnnTj0MBpC4hdT5.jpg',
          },
          {
            id: 862,
            name: 'Erick',
            image:
              'https://as1.ftcdn.net/v2/jpg/02/43/51/48/1000_F_243514868_XDIMJHNNJYKLRST05XnnTj0MBpC4hdT5.jpg',
          },
          {
            id: 863,
            name: 'Marty',
            image:
              'https://as1.ftcdn.net/v2/jpg/02/43/51/48/1000_F_243514868_XDIMJHNNJYKLRST05XnnTj0MBpC4hdT5.jpg',
          },
          {
            id: 864,
            name: 'Shane',
            image:
              'https://as1.ftcdn.net/v2/jpg/02/43/51/48/1000_F_243514868_XDIMJHNNJYKLRST05XnnTj0MBpC4hdT5.jpg',
          },
        ],
        statusCode: 200,
        message: 'Fetched successfully.',
      },
    }),
  );
});

export const fetchAllOfficersError = rest.get(getAllOfficersList, (req, res, ctx) => {
  return res(
    ctx.status(500),
    ctx.json({
      statusCode: 500,
      message: 'Internal Server Error',
      error: 'An error occurred while fetching officers.',
    }),
  );
});

export const fetchSingleReport = rest.get(`${getReportDetailURL}/:id`, async (req, res, ctx) => {
  if (req?.params?.id === 'undefined') {
    return res(
      ctx.status(404),
      ctx.json({
        statusCode: 404,
        message: 'Not Found!',
      }),
    );
  }
  return res(
    ctx.status(200),
    ctx.json({
      message: 'success',
      statusCode: 200,
      data: {
        supervisorId: '5f91c7ebf6e292001c2b4e71',
        templateId: '5f91c7ebf6e292001c2b4e72',
        title: 'Template 54',
        templateableType: 'tourReports',
        shiftId: '5f91c7ebf6e292001c2b4e73',
        sectionsAttributes: [
          {
            id: '5f91c7ebf6e292001c2b4e74',
            title: 'Section 1',
            description: 'This is a description for Section 1',
            questionsAttributes: [
              {
                id: '5f91c7ebf6e292001c2b4e75',
                questionStatement:
                  'How many maintenance tasks do you perform daily? (Q1 in Section 1)',
                required: false,
                instruction: 'instructions',
                responseTypeLabel: 'Number',
                optionsAttributes: [
                  {
                    id: '5f91c7ebf6e292001c2b4e76',
                    optionText: '0',
                  },
                  {
                    id: '5f91c7ebf6e292001c2b4e77',
                    optionText: '1',
                  },
                ],
                answers: ['1'],
                responseType: '1',
              },
              {
                id: '5f91c7ebf6e292001c2b4e78',
                questionStatement: "What's your favorite tool?",
                required: false,
                instruction: '',
                optionsAttributes: [
                  {
                    id: '5f91c7ebf6e292001c2b4e79',
                    optionText: 'Wrench',
                  },
                  {
                    id: '5f91c7ebf6e292001c2b4e7a',
                    optionText: 'Screwdriver',
                  },
                  {
                    id: '5f91c7ebf6e292001c2b4e7b',
                    optionText: 'Hammer',
                  },
                  {
                    id: '5f91c7ebf6e292001c2b4e7c',
                    optionText: 'Drill',
                  },
                ],
                answers: ['Wrench', 'Screwdriver', 'Hammer'],
                responseType: '2',
                responseTypeLabel: 'multiselect',
              },
            ],
          },
          {
            id: '5f91c7ebf6e292001c2b4e7d',
            title: 'Section 2',
            description: 'This is a description for Section 2',
            questionsAttributes: [
              {
                id: '5f91c7ebf6e292001c2b4e7e',
                questionStatement: 'When was the last maintenance task completed?',
                required: true,
                instruction: 'Pick a date',
                optionsAttributes: [],
                answers: ['2023-10-15'],
                responseType: '5',
                responseTypeLabel: 'date',
              },
              {
                id: '5f91c7ebf6e292001c2b4e7f',
                questionStatement: 'How many hours did the maintenance task take?',
                required: true,
                instruction: 'Specify the time',
                optionsAttributes: [],
                answers: ['03:30'],
                responseType: '7',
                responseTypeLabel: 'time',
              },
            ],
          },
          {
            id: '5f91c7ebf6e292001c2b4e80',
            title: 'Section 3',
            description: 'This is a description for Section 3',
            questionsAttributes: [
              {
                id: '5f91c7ebf6e292001c2b4e81',
                questionStatement: 'Choose the priority level for the next maintenance task',
                required: true,
                instruction: 'Pick one',
                optionsAttributes: [
                  {
                    id: '5f91c7ebf6e292001c2b4e82',
                    optionText: 'Low',
                  },
                  {
                    id: '5f91c7ebf6e292001c2b4e83',
                    optionText: 'Medium',
                  },
                  {
                    id: '5f91c7ebf6e292001c2b4e84',
                    optionText: 'High',
                  },
                ],
                answers: ['Medium'],
                responseType: '4',
                responseTypeLabel: 'radio',
              },
              {
                id: '5f91c7ebf6e292001c2b4e85',
                questionStatement: 'Share a photo of the maintenance equipment',
                required: true,
                instruction: 'Upload an image or video',
                optionsAttributes: [],
                answers: ['https://randomuser.me/api/portraits/men/12.jpg'],
                responseType: '6',
                responseTypeLabel: 'imageVideo',
              },
            ],
          },
        ],
        status: 'submitted',
        isDeleted: false,
        createdAt: '2023-11-20T17:35:34.484Z',
        submittedAt: '2023-11-20T17:35:34.484Z',
        updatedAt: null,
        deletedAt: null,
        officer: {
          name: 'Alex Johnson',
          designation: 'officer',
          type: 'hybrid',
          level: 'II',
          imageUrl: 'https://randomuser.me/api/portraits/men/89.jpg',
        },
        supervisor: {
          name: 'Emma Miller',
          designation: 'supervisor',
          type: 'dedicated',
          level: 'II',
          imageUrl: 'https://randomuser.me/api/portraits/women/56.jpg',
        },
        id: '6566e0eeaff27c5c1abd8e23',
      },
    }),
  );
});

export const fetchSingleReportError = rest.get(`${getReportDetailURL}/:id`, (req, res, ctx) => {
  return res(
    ctx.status(500),
    ctx.json({
      statusCode: 500,
      message: 'Internal Server Error',
      error: 'An error occurred while fetching reports.',
    }),
  );
});

export const updateReportStatus = rest.delete(
  `${updateShiftReportStatusApi}/:id`,
  async (req, res, ctx) => {
    if (!req?.params?.id === 'undefined') {
      return res(
        ctx.status(404),
        ctx.json({
          statusCode: 404,
          message: 'Not Found!',
        }),
      );
    }
    return res(
      ctx.status(200),
      ctx.json({
        message: 'Report Status updated successfully',
        statusCode: 200,
      }),
    );
  },
);

export const updateReportStatusError = rest.get(
  `${updateShiftReportStatusApi}/:id`,
  (req, res, ctx) => {
    return res(
      ctx.status(500),
      ctx.json({
        statusCode: 500,
        message: 'Internal Server Error',
        error: 'An error occurred while fetching reports.',
      }),
    );
  },
);

export const reportsHandler = [
  fetchAllReports,
  fetchAllReportsError,
  fetchSingleReport,
  fetchSingleReportError,
  updateReportStatus,
  updateReportStatusError,
  fetchAllOfficers,
  fetchAllOfficersError,
];
