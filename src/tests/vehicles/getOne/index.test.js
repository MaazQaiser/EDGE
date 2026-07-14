import Axios from 'axios';

import { mswServer } from '../../server';
import { getOneVehicleError } from '../handlers';

const vehiclesServiceEndPoint = process.env.REACT_APP_FRANCHISE;

describe('getVehicle', () => {
  test('Fetch Vehicle', async () => {
    const id = 1;
    const response = await Axios.get(`${vehiclesServiceEndPoint}/vehicles/${id}`);
    expect(response.data.statusCode).toBe(200);
    expect(response?.data?.data?.vehicle).toBeInstanceOf(Object);
  });

  it('Fetch Vehicle without id', async () => {
    try {
      await Axios.get(`${vehiclesServiceEndPoint}/vehicles/undefined`);
    } catch (error) {
      expect(error.response.data.statusCode).toBe(404);
    }
  });

  it('Fetch Vehicle Failed', async () => {
    try {
      mswServer.use(getOneVehicleError);
    } catch (error) {
      expect(error.response.data.statusCode).toBe(404);
    }
  });
});
