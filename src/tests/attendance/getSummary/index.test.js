import Axios from 'axios';
import { mswServer } from 'src/tests/server';

import { fetchAllAttendancesError } from '../handler';

const attendanceServiceEndPoint = process.env.REACT_APP_SCHEDULING;

describe('getAttendanceSummary', () => {
  test('Fetch Summary', async () => {
    const query = {
      page: 1,
      perPage: 10,
    };
    const response = await Axios.get(
      `${attendanceServiceEndPoint}/shift/attendanceSummary?${query}`,
    );
    expect(response.data.statusCode).toBe(200);
    expect(response?.data?.data?.summary).toBeInstanceOf(Array);
  });

  it('Fetch Summary Failed', async () => {
    try {
      mswServer.use(fetchAllAttendancesError);
    } catch (error) {
      expect(error.response.data.statusCode).toBe(400);
    }
  });
});
