/* eslint-disable no-undef */
import Axios from 'axios';

import { mswServer } from '../../server';
import { updateReportStatusError, updateShiftReportStatusApi } from '../handler';

describe('updateReportStatus', () => {
  test('update report status', async () => {
    const response = await Axios.delete(`${updateShiftReportStatusApi}/1`);

    expect(response.data.statusCode).toBe(200);
    expect(response.data.message).toBe('Report Status updated successfully');
  });

  test('update report status without id', async () => {
    try {
      await Axios.delete(`${updateShiftReportStatusApi}/undefined`);
    } catch (error) {
      expect(error.response.data.statusCode).toBe(404);
    }
  });

  test('update report status error', async () => {
    try {
      mswServer.use(updateReportStatusError);
    } catch (error) {
      // Verify that the error response has a status code of 500
      expect(error.response.data.statusCode).toBe(500);
      expect(error.response.data.message).toBe('Internal Server Error');
      expect(error.response.data.error).toBe('An error occurred while fetching reports.');
    }
  });
});
