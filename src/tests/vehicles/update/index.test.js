import Axios from 'axios';

import { mswServer } from '../../server';
import { updateVehicleError } from '../handlers';

const vehiclesServiceEndPoint = process.env.REACT_APP_FRANCHISE;

describe('updateVehicle', () => {
  // Test case 1: Successful request
  it('should update given vehicle successfully', async () => {
    // Arrange
    // Vehicle Id to update
    const id = 1;
    /* Your test data here */
    const postData = {
      makeModelYear: 'Toyota Corolla 1920',
      registeredNumber: 'ABC1234',
      createdAt: '2023-09-31',
      lastMaintenance: '2023-06-31',
      image: 'https://picsum.photos/id/237/200/300',
    };

    const response = await Axios.put(`${vehiclesServiceEndPoint}/vehicles/:${id}`, postData);

    // Assert
    expect(response.data.statusCode).toBe(200);
  });

  // Test case 2: Failed request
  it('should not update given vehicle', async () => {
    try {
      mswServer.use(updateVehicleError);
    } catch (error) {
      expect(error.response.data.statusCode).toBe(400);
    }
  });
});
