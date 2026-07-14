/* eslint-disable no-undef */
import Axios from 'axios';

import { mswServer } from '../../server';
import {
  fetchAllOfficersError,
  fetchAllReportsError,
  getAllList,
  getAllOfficersList,
} from '../handler';

describe('fetchReports', () => {
  test('Fetch all Reports', async () => {
    const response = await Axios.get(getAllList);
    expect(response.data.statusCode).toBe(200);
    expect(response.data.data.shifts).toHaveLength(1);
  });

  test('Fetch all Reports error', async () => {
    try {
      mswServer.use(fetchAllReportsError);
    } catch (error) {
      // Verify that the error response has a status code of 500
      expect(error.response.data.statusCode).toBe(500);
      expect(error.response.data.message).toBe('Internal Server Error');
      expect(error.response.data.error).toBe('An error occurred while fetching Reports.');
    }
  });
});

describe('fetchOfficers', () => {
  test('Fetch all officers', async () => {
    const response = await Axios.get(getAllOfficersList);
    expect(response.status).toBe(200);
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
