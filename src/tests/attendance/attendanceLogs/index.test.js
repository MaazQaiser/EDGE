import Axios from 'axios';
import { mswServer } from 'src/tests/server';

import { fetchAttendanceLogsError } from '../handler';

const attendanceServiceEndPoint = process.env.REACT_APP_SCHEDULING;

describe('getAttendanceLogs', () => {
  test('Fetch Logs', async () => {
    const response = await Axios.get(`${attendanceServiceEndPoint}/shift/attendanceLogs`);
    expect(response.data.statusCode).toBe(200);
    expect(response?.data?.data?.logs).toBeInstanceOf(Array);
  });

  it('Fetch Logs Failed', async () => {
    try {
      mswServer.use(fetchAttendanceLogsError);
    } catch (error) {
      expect(error.response.data.statusCode).toBe(400);
    }
  });
});
