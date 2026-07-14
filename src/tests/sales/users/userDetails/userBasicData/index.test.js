import Axios from 'axios';
import { usersServiceEndPoint } from 'services/user.services';

describe('getUserBasicData', () => {
  test('Fetch user data successfully', async () => {
    const userId = 2883;
    const response = await Axios.get(`${usersServiceEndPoint}/users/${userId}`);
    expect(response.data.statusCode).toBe(200);
    expect(response?.data?.data?.user).toBeInstanceOf(Object);
  });

  it('Failed fetching user data', async () => {
    try {
      const userId = undefined;
      return await Axios.get(`${usersServiceEndPoint}/users/${userId}`);
    } catch (error) {
      expect(error.response.data.statusCode).toBe(404);
    }
  });
});
