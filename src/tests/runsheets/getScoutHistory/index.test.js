import Axios from 'axios';
import { routingServiceEndpoint } from 'services/runsheet.services';

describe('fetchOfficersScoutingHistory', () => {
  test('Fetch officer scouting history', async () => {
    const queryParams = {
      officerId: 776,
      page: 1,
      perPage: 10,
      routeType: 'salesRoute',
    };
    const response = await Axios.get(`${routingServiceEndpoint}/route/runsheets?${queryParams}`);

    expect(response?.data?.statusCode).toBe(200);
    expect(response?.data?.data?.routes).toBeInstanceOf(Array);
  });
});
