import Axios from 'axios';
import { REACT_APP_LOCATIONS_URL } from 'services/location.service';

describe('getSalesUserLocation', () => {
  test('Fetch location listing successfully', async () => {
    const userId = 2883;
    const response = await Axios.get(`${REACT_APP_LOCATIONS_URL}/web/users/${userId}/locations`);
    expect(response.data.statusCode).toBe(200);
    expect(response?.data?.data).toBeInstanceOf(Object);
  });

  it('Failed fetching locations listing', async () => {
    try {
      const userId = undefined;
      return await Axios.get(`${REACT_APP_LOCATIONS_URL}/web/users/${userId}/locations`);
    } catch (error) {
      expect(error.response.data.statusCode).toBe(404);
    }
  });
});
