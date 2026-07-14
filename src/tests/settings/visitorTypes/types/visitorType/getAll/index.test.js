import Axios from 'axios';
import queryString from 'query-string';
import { visitor_service } from 'services/settings.services';
import stubbedData from 'src/stubbedData';
import { mswServer } from 'src/tests/server';
import { settingsVisitorTypesErrorMew } from 'src/tests/settings/handler';

describe('get visitorTypes VisitorTypes', () => {
  test('Fetch VisitorTypes LoadTypes', async () => {
    const queryParams = {
      category: 'visitor',
      page: 1,
      perPage: 10,
    };

    const query = queryString.stringify(queryParams, {
      arrayFormat: 'index',
      skipEmptyString: true,
      skipNull: true,
    });

    const response = await Axios.get(`${visitor_service}/visitor_types?${query}`);

    expect(response.data.statusCode).toBe(200);
    expect(response?.data?.data?.visitorTypes).toBeInstanceOf(Array);
  });

  test('Fetch VisitorTypes VisitorTypes error', async () => {
    try {
      mswServer.use(settingsVisitorTypesErrorMew);
    } catch (error) {
      const stubData = stubbedData?.typesStubbedData.list;
      expect(error.response.data.statusCode).toBe(stubData.failure.statusCode);
      expect(error.response.data.message).toBe(stubData.failure.message);
    }
  });
});
