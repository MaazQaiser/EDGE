/* eslint-disable no-undef */
import Axios from 'axios';
import { mswServer } from 'src/tests/server';

import { fetchUserDetailsError } from '../handler';

const usersServiceEndPoint = process.env.REACT_APP_USER;

describe('getUserDetail', () => {
  it('should return user data', async () => {
    // Arrange
    const userId = 1;
    const response = await Axios.get(`${usersServiceEndPoint}/users/${userId}`);
    expect(response.data.statusCode).toBe(200);
    expect(response?.data?.data?.user).toBeInstanceOf(Object);
  });

  it('should handle error', async () => {
    try {
      mswServer.use(fetchUserDetailsError);
    } catch (error) {
      expect(error.response.data.statusCode).toBe(400);
    }
  });
});
