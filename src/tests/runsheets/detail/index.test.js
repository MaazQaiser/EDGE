/* eslint-disable no-undef */
import Axios from 'axios';

import { runsheetServiceEndPoint } from '../../../services/runsheet.services';

describe('getRunshetsByZoneId', () => {
  test('Fetch runsheets without zone id', async () => {
    const zoneId = null;

    try {
      await Axios.get(`${runsheetServiceEndPoint}/runsheets/${zoneId}`);
    } catch (error) {
      expect(error.response.data.statusCode).toBe(404);
    }
  });
});
