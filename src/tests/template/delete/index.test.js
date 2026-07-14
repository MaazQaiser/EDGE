/* eslint-disable no-undef */
import Axios from 'axios';

import { mswServer } from '../../server';
import { deleteSingleTemplateError, templates } from '../handler';

describe('deleteTemplate', () => {
  test('delete single template', async () => {
    const response = await Axios.delete(`${templates}/1`);

    expect(response.data.statusCode).toBe(200);
    expect(response.data.message).toBe('Template deleted successfully');
  });

  test('delete single template without id', async () => {
    try {
      await Axios.delete(`${templates}/undefined`);
    } catch (error) {
      expect(error.response.data.statusCode).toBe(404);
    }
  });

  test('delete single template error', async () => {
    try {
      mswServer.use(deleteSingleTemplateError);
    } catch (error) {
      // Verify that the error response has a status code of 500
      expect(error.response.data.statusCode).toBe(500);
      expect(error.response.data.message).toBe('Internal Server Error');
      expect(error.response.data.error).toBe('An error occurred while fetching templates.');
    }
  });
});
