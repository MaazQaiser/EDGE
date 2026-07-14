import Axios from 'axios';
import { settings } from 'services/settings.services';
import stubbedData from 'src/stubbedData';
import { mswServer } from 'src/tests/server';
import { settingsPreferencesTabConfigsErrorMew } from 'src/tests/settings/handler';

describe('getSettingsPreferencesTabsConfig', () => {
  test('Fetch Settings Preferences tabs config', async () => {
    const response = await Axios.get(`${settings}/preferences/preferences_config`);
    expect(response.data.statusCode).toBe(200);
    expect(response?.data?.data).toBeInstanceOf(Object);
  });

  test('Fetch Settings Preferences tab config error', async () => {
    try {
      mswServer.use(settingsPreferencesTabConfigsErrorMew);
    } catch (error) {
      const stubData = stubbedData?.settingsPreferencesConfig.get;
      expect(error.response.data.statusCode).toBe(stubData.failure.statusCode);
      expect(error.response.data.message).toBe(stubData.failure.message);
    }
  });
});
