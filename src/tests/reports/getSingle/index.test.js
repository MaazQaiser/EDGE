/* eslint-disable no-undef */
import Axios from 'axios';

import { mswServer } from '../../server';
import { fetchSingleReportError, getReportDetailURL } from '../handler';

describe('fetchReport', () => {
  test('Fetch single report', async () => {
    const response = await Axios.get(`${getReportDetailURL}/1`);
    expect(response.data.statusCode).toBe(200);
    expect(response.data.data).toBeInstanceOf(Object);
  });

  test('Fetch single report without id', async () => {
    try {
      await Axios.get(`${getReportDetailURL}/undefined`);
    } catch (error) {
      expect(error.response.data.statusCode).toBe(404);
    }
  });

  test('Fetch single report error', async () => {
    try {
      mswServer.use(fetchSingleReportError);
    } catch (error) {
      // Verify that the error response has a status code of 500
      expect(error.response.data.statusCode).toBe(500);
      expect(error.response.data.message).toBe('Internal Server Error');
      expect(error.response.data.error).toBe('An error occurred while fetching report.');
    }
  });
});
