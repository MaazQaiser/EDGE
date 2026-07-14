/* eslint-disable no-undef */
import Axios from 'axios';

import { mswServer } from '../../server';
import { fetchAllOfficersError, runsheets } from '../handler';

describe('fetchOfficers', () => {
  test('Fetch all officers', async () => {
    const response = await Axios.get(runsheets);
    expect(response.data.statusCode).toBe(200);
    expect(response.data.data.officers).toBeInstanceOf(Array);
  });

  test('Fetch all officers error', async () => {
    try {
      mswServer.use(fetchAllOfficersError);
    } catch (error) {
      // Verify that the error response has a status code of 500
      expect(error.response.data.statusCode).toBe(500);
      expect(error.response.data.message).toBe('Internal Server Error');
      expect(error.response.data.error).toBe('An error occurred while fetching officers.');
    }
  });
});
