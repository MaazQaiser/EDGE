import Axios from 'axios';
import { mswServer } from 'src/tests/server';

import { updateAttendanceRequestError } from '../handler';

const attendanceServiceEndPoint = process.env.REACT_APP_SCHEDULING;

describe('updateAttendanceRequest', () => {
  test('Bulk Approve Attendance Request', async () => {
    const changePayload = {
      attendanceIds: [1],
      status: 'approved',
      supervisorComments: '',
    };
    const response = await Axios.patch(
      `${attendanceServiceEndPoint}/shift/bulkUpdateLeaveStatus`,
      changePayload,
    );
    expect(response.data.statusCode).toBe(200);
  });

  test('Bulk Reject Attendance Request', async () => {
    const changePayload = {
      attendanceIds: [1, 2],
      status: 'rejected',
      supervisorComments: 'Not available',
    };
    const response = await Axios.patch(
      `${attendanceServiceEndPoint}/shift/bulkUpdateLeaveStatus`,
      changePayload,
    );
    expect(response.data.statusCode).toBe(200);
  });

  it('Fetch Update Failed', async () => {
    try {
      mswServer.use(updateAttendanceRequestError);
    } catch (error) {
      expect(error.response.data.statusCode).toBe(400);
    }
  });
});
