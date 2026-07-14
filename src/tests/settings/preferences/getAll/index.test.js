import Axios from 'axios';
import { settings } from 'services/settings.services';
import stubbedData from 'src/stubbedData';
import { mswServer } from 'src/tests/server';
import { settingsPreferencesTabMewError } from 'src/tests/settings/handler';

describe('getSettingsPreferencesTab', () => {
  test('Fetch Settings Preferences tabs information', async () => {
    const response = await Axios.get(`${settings}/preferences`);
    expect(response.data.statusCode).toBe(200);
    expect(response?.data?.data?.preferences).toBeInstanceOf(Object);
  });

  test('Fetch Settings Preferences tab error', async () => {
    try {
      mswServer.use(settingsPreferencesTabMewError);
    } catch (error) {
      const stubData = stubbedData?.settingsPreferences.get;
      expect(error.response.data.statusCode).toBe(stubData.failure.statusCode);
      expect(error.response.data.message).toBe(stubData.failure.message);
    }
  });
});
