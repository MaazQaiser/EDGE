import Axios from 'axios';
import { scoutingEndpointNode } from 'services/scout.service';

describe('getRouteLocations', () => {
  test('Fetch scout locations successfully', async () => {
    const routeId = '65dc4d73653716fdaa26ce0d';
    const response = await Axios.get(`${scoutingEndpointNode}/route/visits/${routeId}`);
    expect(response.data.statusCode).toBe(200);
    expect(response?.data?.data?.visits).toBeInstanceOf(Array);
  });

  test('Failed fetching scout locations', async () => {
    const routeId = null;
    try {
      return await Axios.get(`${scoutingEndpointNode}/route/visits/${routeId}`);
    } catch (error) {
      expect(error.response.data.statusCode).toBe(404);
    }
  });
});
