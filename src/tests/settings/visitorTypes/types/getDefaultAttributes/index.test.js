import Axios from 'axios';
import queryString from 'query-string';
import { visitor_service } from 'services/settings.services';
import stubbedData from 'src/stubbedData';

describe('getVisitorTypeDefaultSettings', () => {
  test('Fetch VisitorType default settings', async () => {
    const queryParams = {
      category: 'truckLoad',
    };

    const query = queryString.stringify(queryParams, {
      arrayFormat: 'index',
      skipEmptyString: true,
      skipNull: true,
    });

    const response = await Axios.get(`${visitor_service}/visitor_types/default_settings?${query}`);

    expect(response.data.statusCode).toBe(200);

    expect(response?.data?.data?.defaultSettings).toBeInstanceOf(Array);
  });

  test('Fetch VisitorTypes default settings error', async () => {
    try {
      await Axios.get(`${visitor_service}/visitor_types/default_settings`);
    } catch (error) {
      const stubData = stubbedData?.formSettingsListByType.list;
      expect(error.response.data.statusCode).toBe(stubData.failure.statusCode);
      expect(error.response.data.message).toBe(stubData.failure.message);
    }
  });
});
