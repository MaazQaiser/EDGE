/* eslint-disable no-undef */
import Axios from 'axios';
import { mswServer } from 'src/tests/server';

import { fetchAllUsersError } from '../handler';

const usersServiceEndPoint = process.env.REACT_APP_USER;

describe('getUsers', () => {
  it('should return users data', async () => {
    // Arrange
    const query = {
      page: 1,
      perPage: 10,
    };
    const response = await Axios.get(
      `${usersServiceEndPoint}/users/officers_and_supervisors?${query}`,
    );
    expect(response.data.statusCode).toBe(200);
    expect(response?.data?.data?.officersAndSupervisors).toBeInstanceOf(Array);
  });

  it('should handle error', async () => {
    try {
      mswServer.use(fetchAllUsersError);
    } catch (error) {
      expect(error.response.data.statusCode).toBe(400);
    }
  });
});
