import Axios from 'axios';
import { mswServer } from 'src/tests/server';

import { getUserDetailError } from '../handler';

const attendanceServiceEndPoint = process.env.REACT_APP_SCHEDULING;

describe('getUserDetail', () => {
  test('Fetch user detail', async () => {
    const userId = 1;
    const response = await Axios.get(`${attendanceServiceEndPoint}/users/${userId}`);
    expect(response.data.statusCode).toBe(200);
    expect(response?.data?.data?.user).toBeInstanceOf(Object);
  });

  it('Fetch User Detail Failed', async () => {
    try {
      mswServer.use(getUserDetailError);
    } catch (error) {
      expect(error.response.data.statusCode).toBe(400);
    }
  });
});
