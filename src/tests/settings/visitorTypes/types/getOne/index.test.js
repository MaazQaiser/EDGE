import Axios from 'axios';
import { visitor_service } from 'services/settings.services';
import stubbedData from 'src/stubbedData';

describe('getVisitorTypeById', () => {
  test('Fetch VisitorType single', async () => {
    const id = 1;
    const response = await Axios.get(`${visitor_service}/visitor_types/${id}`);

    expect(response.data.statusCode).toBe(200);
    expect(response?.data?.data?.visitorType).toBeInstanceOf(Object);
  });

  test('Fetch VisitorTypes single error', async () => {
    try {
      const id = null;
      await Axios.get(`${visitor_service}/visitor_types/${id}`);
    } catch (error) {
      const stubData = stubbedData?.typesStubbedData.getOne;
      expect(error.response.data.statusCode).toBe(stubData.failure.statusCode);
      expect(error.response.data.message).toBe(stubData.failure.message);
    }
  });
});
