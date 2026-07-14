import Axios from 'axios';

import { mswServer } from '../../server';
import { deleteVehicleError } from '../handlers';
const vehiclesServiceEndPoint = process.env.REACT_APP_FRANCHISE;

describe('Delete Vehicle', () => {
  it('should delete vehicle', async () => {
    const id = 1;
    const response = await Axios.delete(`${vehiclesServiceEndPoint}/vehicles/${id}`);
    expect(response.data.statusCode).toBe(200);
  });

  it('Delete Vehicle Failed', async () => {
    try {
      mswServer.use(deleteVehicleError);
    } catch (error) {
      expect(error.response.data.statusCode).toBe(400);
    }
  });
});
