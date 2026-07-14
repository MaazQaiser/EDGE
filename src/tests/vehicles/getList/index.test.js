import Axios from 'axios';

import { mswServer } from '../../server';
import { fetchAllVehiclesError } from '../handlers';

const vehiclesServiceEndPoint = process.env.REACT_APP_FRANCHISE;

describe('getVehicles', () => {
  test('Fetch Vehicles', async () => {
    const query = {
      page: 1,
      perPage: 10,
    };
    const response = await Axios.get(`${vehiclesServiceEndPoint}/vehicles?${query}`);
    expect(response.data.statusCode).toBe(200);
    expect(response?.data?.data?.vehicles).toBeInstanceOf(Array);
  });

  it('Fetch Vehicles Failed', async () => {
    try {
      mswServer.use(fetchAllVehiclesError);
    } catch (error) {
      expect(error.response.data.statusCode).toBe(400);
    }
  });
});
