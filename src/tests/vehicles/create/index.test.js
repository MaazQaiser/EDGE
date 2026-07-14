import Axios from 'axios';

import { mswServer } from '../../server';
import { createVehicleError } from '../handlers';

const vehiclesServiceEndPoint = process.env.REACT_APP_FRANCHISE;

describe('createVehicle', () => {
  // Test case 1: Successful request
  it('should create a vehicle successfully', async () => {
    // Arrange
    /* Your test data here */
    const postData = {
      makeModelYear: 'Toyota Corolla 1920',
      registeredNumber: 'ABC1234',
      createdAt: '2023-09-31',
      lastMaintenance: '2023-06-31',
    };

    const response = await Axios.post(`${vehiclesServiceEndPoint}/vehicles`, postData);

    // Assert
    expect(response.data.statusCode).toBe(200);
  });

  it('should fail to create a vehicle', async () => {
    try {
      mswServer.use(createVehicleError);
    } catch (error) {
      expect(error.response.data.statusCode).toBe(400);
    }
  });
});
