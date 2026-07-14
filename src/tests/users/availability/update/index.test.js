/* eslint-disable no-undef */
import Axios from 'axios';
import { usersServiceEndPoint } from 'services/user.services';
import stubbedData from 'src/stubbedData';

describe('updateUserAvailability', () => {
  it('should update users availability', async () => {
    let userId = 10;

    let payload = {
      availability: [
        {
          id: 1,
          startTime: 'none',
          day: 'Monday',
        },
        {
          id: 2,
          startTime: '08:00 AM',
          endTime: '05:00 AM',
          day: 'Tuesday',
        },
        {
          id: 3,
          startTime: '08:00 AM',
          endTime: '05:00 AM',
          day: 'Wednesday',
        },
        {
          id: 4,
          startTime: '08:00 AM',
          endTime: '05:00 AM',
          day: 'Thursday',
        },
        {
          id: 5,
          startTime: '08:00 AM',
          endTime: '05:00 AM',
          day: 'Friday',
        },
        {
          id: 6,
          startTime: '08:00 AM',
          endTime: '05:00 AM',
          day: 'Saturday',
        },
        {
          id: 7,
          startTime: '08:00 AM',
          endTime: '05:00 AM',
          day: 'Sunday',
        },
      ],
    };
    const response = await Axios.put(
      `${usersServiceEndPoint}/users/${userId}/update_availability`,
      payload,
    );

    const stubData = stubbedData?.usersAvailability;

    expect(response.data.statusCode).toBe(stubData.update.success.statusCode);
    expect(response.data.message).toBe(stubData.update.success.message);
  });

  // Test case 2: Failed request
  it('should throw an error on failure', async () => {
    try {
      let userId = null;
      await Axios.put(`${usersServiceEndPoint}/users/${userId}/update_availability`);
    } catch (e) {
      const stubData = stubbedData?.usersAvailability;

      expect(e.response?.data?.statusCode).toBe(stubData.update.failure.statusCode);
      expect(e.response?.data?.message).toBe(stubData.update.failure.message);
    }
  });
});
