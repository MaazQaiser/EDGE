import Axios from 'axios';
import dayjs from 'dayjs';
import { scoutingEndpointSales } from 'services/scout.service';

describe('getScoutRouteListing', () => {
  test('Fetch scout listing successfully', async () => {
    const query = {
      date: dayjs(new Date()).format('MM/DD/YYYY'),
    };
    const response = await Axios.get(`${scoutingEndpointSales}/web/users/routes?${query}`);
    expect(response.data.statusCode).toBe(200);
    expect(response?.data?.data?.routes).toBeInstanceOf(Array);
  });
});
