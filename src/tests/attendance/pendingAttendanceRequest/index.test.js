import Axios from 'axios';
import { mswServer } from 'src/tests/server';

import { fetchPendingAttendanceRequestsError } from '../handler';

const attendanceServiceEndPoint = process.env.REACT_APP_SCHEDULING;

describe('getPendingAttendanceRequests', () => {
  test('Fetch Attendance Requests', async () => {
    const userId = 1;
    const response = await Axios.get(`${attendanceServiceEndPoint}/shift/leaveRequests/${userId}`);
    expect(response.data.statusCode).toBe(200);
    expect(response?.data?.data?.data).toBeInstanceOf(Array);
  });

  it('Fetch Attendance Requests Failed', async () => {
    try {
      mswServer.use(fetchPendingAttendanceRequestsError);
    } catch (error) {
      expect(error.response.data.statusCode).toBe(400);
    }
  });
});
