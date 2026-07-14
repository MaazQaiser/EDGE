/* eslint-disable no-undef */
import Axios from 'axios';
import { settings } from 'services/settings.services';
import { sitesServiceEndPoint } from 'services/sites.services';
import stubbedData from 'src/stubbedData';

describe('updatePreferencesSettings', () => {
  it('should update settings preferences tabs values', async () => {
    let payload = {
      preferences: [
        {
          id: 2,
          value: '20',
        },
      ],
    };
    const response = await Axios.put(`${settings}/preferences/update`, payload);

    const stubData = stubbedData?.settingsPreferences.update;

    expect(response.data.statusCode).toBe(stubData.success.statusCode);
    expect(response.data.message).toBe(stubData.success.message);
  });

  // Test case 2: Failed request
  it('should throw an error on failure', async () => {
    try {
      await Axios.put(`${sitesServiceEndPoint}/preferences/update`);
    } catch (e) {
      const stubData = stubbedData?.settingsPreferences.update;

      expect(e.response?.data?.statusCode).toBe(stubData.failure.statusCode);
      expect(e.response?.data?.message).toBe(stubData.failure.message);
    }
  });
});
