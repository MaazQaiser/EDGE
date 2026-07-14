import Axios from 'axios';
import { usersServiceSalesEndPoint } from 'services/user.services';

describe('getUserSalesData', () => {
  test('Fetch user sales data successfully', async () => {
    const userId = 2883;
    const response = await Axios.get(`${usersServiceSalesEndPoint}/web/users/${userId}`);
    expect(response.data.statusCode).toBe(200);
    expect(response?.data?.data).toBeInstanceOf(Object);
  });

  it('Failed fetching user sales data', async () => {
    try {
      const userId = undefined;
      return await Axios.get(`${usersServiceSalesEndPoint}/web/users/${userId}`);
    } catch (error) {
      expect(error.response.data.statusCode).toBe(404);
    }
  });
});
