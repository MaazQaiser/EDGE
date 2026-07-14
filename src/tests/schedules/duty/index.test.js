import Axios from 'axios';

import { dutyServiceEndPoint, templateServiceEndPoint } from '../../../services/duty.services';
import stubbedData from '../../../stubbedData';
import { mswServer } from '../../../tests/server';
import {
  addNotesToShiftErrorMsw,
  assignDedicatedDutyErrorMsw,
  assignShiftErrorMsw,
  createTourTemplateErrorMsw,
  deleteNotesOfShiftErrorMsw,
  deleteShiftByIdErrorMsw,
  deleteTourTemplateErrorMsw,
  editDedicatedDutyErrorMsw,
  editNotesOfShiftErrorMsw,
  fetchJobsAndShiftsListBySiteIdErrorMsw,
  fetchShiftActivitiesByIdErrorMsw,
  fetchShiftDetailByIdErrorMsw,
  fetchShiftDetailForAssignmentByIdErrorMsw,
  fetchShiftDetailForSplittingByIdErrorMsw,
  fetchShiftLogsByIdErrorMsw,
  fetchTourTemplateByIdErrorMsw,
  fetchTourTemplatesBySiteIdErrorMsw,
  getAllofficersErrorMsw,
  getAllReportTemplatesErrorMsw,
  getAllSitesByOfficerIdErrorMsw,
  getAllTypeOfSites,
  getCheckpointsBySiteIdErrorMsw,
  getDefaultHourlyRateOfFranchiseErrorMsw,
  getDutiesForCalenderErrorMsw,
  getDutyDetailErrorMsw,
  getMonthDutiesForCalenderErrorMsw,
} from './handler';

const franchiseServiceEndPoint = process.env.REACT_APP_FRANCHISE;

describe('fetchCheckpointsBySiteId', () => {
  test('Fetch Checkpoints By Site Id', async () => {
    const response = await Axios.get(
      `${franchiseServiceEndPoint}/sites/8/checkpoints/checkpoint_options`,
    );

    expect(response.data.statusCode).toBe(200);
  });

  test('Fetch Checkpoints By Site Id error', async () => {
    try {
      mswServer.use(getCheckpointsBySiteIdErrorMsw);
    } catch (error) {
      expect(error.response.data.statusCode).toBe(stubbedData.checkpointsErrorRes.status);
    }
  });
});
describe('getAllTypesOfSites', () => {
  test('Get All types of sites', async () => {
    const response = await Axios.get(
      `${franchiseServiceEndPoint}/sites/functional_non_functionals`,
    );

    expect(response.data.statusCode).toBe(200);
  });

  test('Get All types of sites error', async () => {
    try {
      mswServer.use(getAllTypeOfSites);
    } catch (error) {
      expect(error.response.data.statusCode).toBe(stubbedData.checkpointsErrorRes.status);
    }
  });
});

describe('fetchDutiesForCalender', () => {
  test('Fetch Duties For Calender', async () => {
    const response = await Axios.get(`${dutyServiceEndPoint}/shiftActivityLog/summary`);

    expect(response.data.statusCode).toBe(200);
  });

  test('Fetch Duties For Calender error', async () => {
    try {
      mswServer.use(getDutiesForCalenderErrorMsw);
    } catch (error) {
      expect(error.response.data.statusCode).toBe(500);
    }
  });
});

describe('fetchDutiesForCalenderListView', () => {
  test('Fetch Duties For Calender List View', async () => {
    const response = await Axios.get(`${dutyServiceEndPoint}/shift/summaryList`);

    expect(response.data.statusCode).toBe(200);
  });

  test('Fetch Duties For Calender List View error', async () => {
    try {
      mswServer.use(getDutiesForCalenderErrorMsw);
    } catch (error) {
      expect(error.response.data.statusCode).toBe(400);
    }
  });
});

describe('fetchMonthDutiesForCalender', () => {
  test('Fetch Month Duties For Calender', async () => {
    const response = await Axios.get(`${dutyServiceEndPoint}/shiftActivityLog/aggregate`);

    expect(response.data.statusCode).toBe(200);
  });

  test('Fetch Month Duties For Calender error', async () => {
    try {
      mswServer.use(getMonthDutiesForCalenderErrorMsw);
    } catch (error) {
      expect(error.response.data.statusCode).toBe(stubbedData.dutyErrorRes.status);
    }
  });
});

describe('getDutyDataById', () => {
  test('Fetch Duty Detail', async () => {
    const jobId = 1;
    const shiftId = 11;
    const response = await Axios.get(`${dutyServiceEndPoint}/job/${jobId}/shift/${shiftId}`);

    expect(response.data.statusCode).toBe(200);
  });

  test('Fetch Duty Detail Error', async () => {
    try {
      mswServer.use(getDutyDetailErrorMsw);
    } catch (error) {
      expect(error.response.data.statusCode).toBe(stubbedData.dutyErrorRes.status);
    }
  });
});

describe('fetchAvailableUnavailableOfficers', () => {
  test('Fetch All Available Unavailable Officers', async () => {
    const response = await Axios.get(
      `${dutyServiceEndPoint}/shift/availableOfficers?start=2023-11-17T02:00:00.000Z&end=2023-11-17T03:15:00.000Z`,
    );

    expect(response.data.statusCode).toBe(200);
  });

  test('Fetch All Available Unavailable Officers error', async () => {
    try {
      mswServer.use(getAllofficersErrorMsw);
    } catch (error) {
      expect(error.response.data.statusCode).toBe(
        stubbedData.officersStubbedData.list.failure.statusCode,
      );
    }
  });
});

describe('fetchAllReportTemplates', () => {
  test('Fetch All Report Templates', async () => {
    const response = await Axios.get(`${templateServiceEndPoint}/templates/list`);

    expect(response.data.statusCode).toBe(200);
  });

  test('Fetch All Report Templates error', async () => {
    try {
      mswServer.use(getAllReportTemplatesErrorMsw);
    } catch (error) {
      expect(error.response.data.statusCode).toBe(stubbedData.reportsErrorRes.status);
    }
  });
});

describe('fetchAllSitesByOfficerId', () => {
  test('Fetch All Sites By Officer Id', async () => {
    const officerId = 1;
    const response = await Axios.get(
      `${dutyServiceEndPoint}/shiftassignment/officerSites/${officerId}`,
    );

    expect(response.data.statusCode).toBe(200);
  });

  test('Fetch All Sites By Officer Id error', async () => {
    try {
      mswServer.use(getAllSitesByOfficerIdErrorMsw);
    } catch (error) {
      expect(500).toBe(500);
    }
  });
});

describe('AssignDedicatedDuty', () => {
  test('Assign Dedicated Duty', async () => {
    const shifts = [
      {
        id: 550,
        name: 'Front Gate Duty',
        start: '2023-10-10T00:00:00',
        end: '2023-10-10T10:00:00',
        type: 'dedicated',
        duration: {
          startDate: '2023-07-22T00:00:00',
          endDate: '2023-12-22T00:00:00',
        },
        additionalServices: {
          visitorManagement: false,
          loadManagement: false,
        },
        assignedOfficer: {
          id: 1,
          name: 'officer 1',
          imageUrl: 'image path',
          type: 'dedicated',
          level: 2,
        },
        hourlyRate: {
          checked: true, // extra
          amount: '21',
        },
        tours: [
          {
            id: 1,
            tourName: 'tourname',
            startTime: '2023-11-14T02:00:00.000Z',
            endTime: '2023-11-14T00:20:00.000Z',
            tourCheckpoints: [
              {
                id: 11,
                deviceName: 'NFC #120', // extra
                installLocation: '4th Floor, Event Complex Hall', // extra
                instructions: '<p>Here is instructions...</p>', // extra
              },
            ],
            tourReport: {
              id: 1,
              title: 'Front door report', // extra
              description: 'Find the front door', // extra
            },
          },
        ],
      },
    ];

    const shiftId = 1;
    const response = await Axios.post(`${dutyServiceEndPoint}/shift/${shiftId}`, shifts);

    expect(response.data.statusCode).toBe(200);
  });

  test('Assign Dedicated Duty error', async () => {
    try {
      mswServer.use(assignDedicatedDutyErrorMsw);
    } catch (error) {
      expect(error.response.data.statusCode).toBe(stubbedData.createDutiesErrorRes.status);
    }
  });
});

describe('EditDedicatedDuty', () => {
  test('Edit Dedicated Duty', async () => {
    const shifts = [
      {
        id: 550,
        name: 'Front Gate Duty',
        start: '2023-10-10T00:00:00',
        end: '2023-10-10T10:00:00',
        type: 'dedicated',
        duration: {
          startDate: '2023-07-22T00:00:00',
          endDate: '2023-12-22T00:00:00',
        },
        additionalServices: {
          visitorManagement: false,
          loadManagement: false,
        },
        assignedOfficer: {
          id: 1,
          name: 'officer 1',
          imageUrl: 'image path',
          type: 'dedicated',
          level: 2,
        },
        hourlyRate: {
          checked: true, // extra
          amount: '21',
        },
        tours: [
          {
            id: 1,
            tourName: 'tourname',
            startTime: '2023-11-14T02:00:00.000Z',
            endTime: '2023-11-14T00:20:00.000Z',
            tourCheckpoints: [
              {
                id: 11,
                deviceName: 'NFC #120', // extra
                installLocation: '4th Floor, Event Complex Hall', // extra
                instructions: '<p>Here is instructions...</p>', // extra
              },
            ],
            tourReport: {
              id: 1,
              title: 'Front door report', // extra
              description: 'Find the front door', // extra
            },
          },
        ],
      },
    ];

    const shiftId = 1;
    const response = await Axios.patch(`${dutyServiceEndPoint}/shift/update/${shiftId}`, shifts);

    expect(response.data.statusCode).toBe(200);
  });

  test('Edit Dedicated Duty error', async () => {
    try {
      mswServer.use(editDedicatedDutyErrorMsw);
    } catch (error) {
      expect(error.response.data.statusCode).toBe(stubbedData.editDutyStubbedData.error.status);
    }
  });
});

describe('fetchDefaultHourlyRateOfFranchise', () => {
  test('Fetch default hourly rate of franchise', async () => {
    const response = await Axios.get(`${franchiseServiceEndPoint}/preferences/extra_job`);

    expect(response.data.statusCode).toBe(200);
  });

  test('Fetch default hourly rate of franchise error', async () => {
    try {
      mswServer.use(getDefaultHourlyRateOfFranchiseErrorMsw);
    } catch (error) {
      expect(500).toBe(500);
    }
  });
});

describe('fetchJobsAndShiftsListBySiteId', () => {
  test('Fetch Jobs and Shifts List By Site Id', async () => {
    const response = await Axios.get(`${franchiseServiceEndPoint}/job/getJobsAndJobShifts`);
    expect(response.data.statusCode).toBe(200);
  });

  test('Fetch Jobs and Shifts List By Site Id error', async () => {
    try {
      mswServer.use(fetchJobsAndShiftsListBySiteIdErrorMsw);
    } catch (error) {
      expect(error.response.data.statusCode).toBe(500);
    }
  });
});

describe('fetchTourTemplatesBySiteId', () => {
  test('Fetch Tour Templates By Site Id', async () => {
    const response = await Axios.get(`${franchiseServiceEndPoint}/sites/1/tour_templates/list`);
    expect(response.data.statusCode).toBe(200);
  });

  test('Fetch Tour Templates By Site Id error', async () => {
    try {
      mswServer.use(fetchTourTemplatesBySiteIdErrorMsw);
    } catch (error) {
      expect(error.response.data.statusCode).toBe(500);
    }
  });
});

describe('fetchTourTemplateById', () => {
  test('Fetch Tour Template By Id', async () => {
    const response = await Axios.get(`${franchiseServiceEndPoint}/tour_templates/1`);
    expect(response.data.statusCode).toBe(200);
  });

  test('Fetch Tour Template By Id error', async () => {
    try {
      mswServer.use(fetchTourTemplateByIdErrorMsw);
    } catch (error) {
      expect(error.response.data.statusCode).toBe(500);
    }
  });
});

describe('fetchShiftDetailForAssignmentById', () => {
  test('Fetch Shift Detail For Assignment By Id', async () => {
    const response = await Axios.get(`${dutyServiceEndPoint}/shift/details/1`);
    expect(response.data.statusCode).toBe(200);
  });

  test('Fetch Shift Detail For Assignment By Id error', async () => {
    try {
      mswServer.use(fetchShiftDetailForAssignmentByIdErrorMsw);
    } catch (error) {
      expect(error.response.data.statusCode).toBe(500);
    }
  });
});

describe('fetchShiftDetailForSplittingById', () => {
  test('Fetch Shift Detail For Splitting By Id', async () => {
    const response = await Axios.get(`${dutyServiceEndPoint}/shift/split/1`);
    expect(response.data.statusCode).toBe(200);
  });

  test('Fetch Shift Detail For Splitting By Id error', async () => {
    try {
      mswServer.use(fetchShiftDetailForSplittingByIdErrorMsw);
    } catch (error) {
      expect(error.response.data.statusCode).toBe(500);
    }
  });
});

describe('fetchShiftDetailById', () => {
  test('Fetch Shift Detail By Id', async () => {
    const response = await Axios.get(`${dutyServiceEndPoint}/shiftActivityLog/1`);
    expect(response.data.statusCode).toBe(200);
  });

  test('Fetch Shift Detail By Id error', async () => {
    try {
      mswServer.use(fetchShiftDetailByIdErrorMsw);
    } catch (error) {
      expect(error.response.data.statusCode).toBe(500);
    }
  });
});

describe('fetchShiftActivitiesById', () => {
  test('Fetch Shift Activities By Id', async () => {
    const response = await Axios.get(`${dutyServiceEndPoint}/shiftActivityLog/activities/1`);
    expect(response.data.statusCode).toBe(200);
  });

  test('Fetch Shift Activities By Id error', async () => {
    try {
      mswServer.use(fetchShiftActivitiesByIdErrorMsw);
    } catch (error) {
      expect(error.response.data.statusCode).toBe(500);
    }
  });
});

describe('fetchShiftLogsById', () => {
  test('Fetch Shift Logs By Id', async () => {
    const response = await Axios.get(`${dutyServiceEndPoint}/shiftActivityLog/logs/1`);
    expect(response.data.statusCode).toBe(200);
  });

  test('Fetch Shift Logs By Id error', async () => {
    try {
      mswServer.use(fetchShiftLogsByIdErrorMsw);
    } catch (error) {
      expect(error.response.data.statusCode).toBe(500);
    }
  });
});

describe('addNotesToShift', () => {
  test('Add notes to shift', async () => {
    const payload = {
      note: 'test note 1',
    };
    const response = await Axios.patch(`${dutyServiceEndPoint}/shiftActivityLog/note/1`, payload);
    expect(response.data.statusCode).toBe(200);
  });

  test('Add notes to shift error', async () => {
    try {
      mswServer.use(addNotesToShiftErrorMsw);
    } catch (error) {
      expect(error.response.data.statusCode).toBe(500);
    }
  });
});

describe('editNotesOfShift', () => {
  test('Edit notes of shift', async () => {
    const payload = {
      note: 'test note 1',
    };
    const response = await Axios.patch(`${dutyServiceEndPoint}/shiftActivityLog/note/1/2`, payload);
    expect(response.data.statusCode).toBe(200);
  });

  test('Edit notes of shift error', async () => {
    try {
      mswServer.use(editNotesOfShiftErrorMsw);
    } catch (error) {
      expect(error.response.data.statusCode).toBe(500);
    }
  });
});

describe('deleteNotesOfShift', () => {
  test('Delete notes of shift', async () => {
    const response = await Axios.delete(`${dutyServiceEndPoint}/shiftActivityLog/note/1/2`);
    expect(response.data.statusCode).toBe(200);
  });

  test('Delete notes of shift error', async () => {
    try {
      mswServer.use(deleteNotesOfShiftErrorMsw);
    } catch (error) {
      expect(error.response.data.statusCode).toBe(500);
    }
  });
});

describe('deleteShiftById', () => {
  test('Delete shift by Id', async () => {
    const response = await Axios.delete(
      `${dutyServiceEndPoint}/shift/1?windowStart=2024-07-12T05:00:00.000Z&endWindow=2024-07-12T05:00:00.000Z`,
    );
    expect(response.data.statusCode).toBe(200);
  });

  test('Delete shift by Id error', async () => {
    try {
      mswServer.use(deleteShiftByIdErrorMsw);
    } catch (error) {
      expect(error.response.data.statusCode).toBe(500);
    }
  });
});

describe('createTourTemplate', () => {
  test('Create Tour Template', async () => {
    const payload = {
      name: 'tour temp 3',
      startTime: '2024-03-07T05:00:00.000Z',
      duration: '10',
      reportId: '55',
      checkpoints: [{ checkpointId: '204', description: null }],
    };
    const response = await Axios.post(
      `${franchiseServiceEndPoint}/sites/1/tour_templates`,
      payload,
    );
    expect(response.data.statusCode).toBe(200);
  });

  test('Create Tour Template error', async () => {
    try {
      mswServer.use(createTourTemplateErrorMsw);
    } catch (error) {
      expect(error.response.data.statusCode).toBe(500);
    }
  });
});

describe('assignShift', () => {
  test('Assign Shift', async () => {
    const payload = {
      location: {
        id: 70,
        assignmentDuration: { start: '2024-03-03T19:00:00.000Z', end: '2024-03-10T19:00:00.000Z' },
      },
      officer: {
        id: 143,
        assignmentDuration: { start: '2024-03-02T19:00:00.000Z', end: '2024-03-11T19:00:00.000Z' },
      },
      tours: [
        {
          id: '65e8355717a5275d26cd304d',
          title: 'tour temp 111',
          checkpoints: [
            {
              id: 219,
              checkpointType: 'QR Code',
              description: null,
              location: { id: 69, locationName: '5th floor' },
            },
            {
              id: 203,
              checkpointType: 'QR Code',
              description: null,
              location: { id: 70, locationName: 'GPS 5th Floor' },
            },
          ],
          windowStart: '2024-03-01T01:00:00.000Z',
          duration: 10,
          reportTemplateId: 55,
          occurances: null,
        },
      ],
      deletedTours: [],
    };
    const response = await Axios.patch(`${dutyServiceEndPoint}/shift/assign/1`, payload);
    expect(response.data.statusCode).toBe(200);
  });

  test('Assign Shift error', async () => {
    try {
      mswServer.use(assignShiftErrorMsw);
    } catch (error) {
      expect(error.response.data.statusCode).toBe(500);
    }
  });
});

describe('reassignShift', () => {
  test('Re-Assign Shift', async () => {
    const payload = {
      logId: '6627672a108a7cc15b39916d',
      officerId: 2877,
      start: '2024-04-27T12:45:00.000Z',
    };
    const response = await Axios.put(`${dutyServiceEndPoint}/shift/reassign/1`, payload);
    expect(response.data.statusCode).toBe(200);
  });

  test('Re-Assign Shift error', async () => {
    try {
      mswServer.use(assignShiftErrorMsw);
    } catch (error) {
      expect(error.response.data.statusCode).toBe(500);
    }
  });
});

describe('splitShift', () => {
  test('Split Shift', async () => {
    const payload = {
      splitType: 'custom',
      deletedShifts: ['65fbed8b9ee442bd418c88c3'],
      shifts: [
        {
          name: 'Shift 1-A',
          startsAt: '2024-03-21T12:00:00.000Z',
          endsAt: '2024-04-10T03:00:00.000Z',
          shiftDays: [1, 3, 5],
          id: '65fbe9db9ee442bd418c886d',
        },
      ],
    };
    const response = await Axios.patch(`${dutyServiceEndPoint}/shift/split/1`, payload);
    expect(response.data.statusCode).toBe(200);
  });

  test('Split Shift error', async () => {
    try {
      mswServer.use(assignShiftErrorMsw);
    } catch (error) {
      expect(error.response.data.statusCode).toBe(500);
    }
  });
});

describe('deleteTourTemplate', () => {
  test('Delete Tour Template Id', async () => {
    const response = await Axios.delete(`${franchiseServiceEndPoint}/tour_templates/1`);
    expect(response.data.statusCode).toBe(200);
  });

  test('Delete Tour Template Id error', async () => {
    try {
      mswServer.use(deleteTourTemplateErrorMsw);
    } catch (error) {
      expect(error.response.data.statusCode).toBe(500);
    }
  });
});
