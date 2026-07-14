/* eslint-disable no-undef */
import Axios from 'axios';

import { mswServer } from '../../server';
import { fetchSingleTemplateError, templates } from '../handler';

describe('fetchTemplate', () => {
  test('Fetch single template', async () => {
    const response = await Axios.get(`${templates}/1`);

    expect(response.data.statusCode).toBe(200);
    expect(response.data.data.template).toBeInstanceOf(Object);
  });

  test('Fetch single template without id', async () => {
    try {
      await Axios.get(`${templates}/undefined`);
    } catch (error) {
      expect(error.response.data.statusCode).toBe(404);
    }
  });

  test('Fetch single template error', async () => {
    try {
      mswServer.use(fetchSingleTemplateError);
    } catch (error) {
      // Verify that the error response has a status code of 500
      expect(error.response.data.statusCode).toBe(500);
      expect(error.response.data.message).toBe('Internal Server Error');
      expect(error.response.data.error).toBe('An error occurred while fetching templates.');
    }
  });
});
