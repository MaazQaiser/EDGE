/* eslint-disable no-undef */
import Axios from 'axios';

import { mswServer } from '../../server';
import { fetchAllTemplatesError, templates } from '../handler';

describe('fetchTemplates', () => {
  test('Fetch all templates', async () => {
    const response = await Axios.get(templates);
    expect(response.data.statusCode).toBe(200);
    expect(response.data.data.templates).toBeInstanceOf(Array);
  });

  test('Fetch all templates error', async () => {
    try {
      mswServer.use(fetchAllTemplatesError);
    } catch (error) {
      // Verify that the error response has a status code of 500
      expect(error.response.data.statusCode).toBe(500);
      expect(error.response.data.message).toBe('Internal Server Error');
      expect(error.response.data.error).toBe('An error occurred while fetching templates.');
    }
  });
});
