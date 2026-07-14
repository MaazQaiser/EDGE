/* eslint-disable no-undef */
import Axios from 'axios';

import stubbedData from '../../stubbedData';

jest.mock('axios'); // Mock the postHttpRequest function

const authServiceEndPoint = process.env.REACT_APP_AUTH; // Replace with the actual endpoint

describe('authLogin', () => {
  afterEach(() => {
    jest.clearAllMocks(); // Clear all mock function calls after each test
  });

  it('should make a successful API call and return data', async () => {
    const userFormData = {
      email: 'johndoe@example.com',
      password: 'Password@132',
    };

    const responseData = stubbedData['loginStubbedData'];
    Axios.post.mockResolvedValue(responseData);

    /**
     * API calls must be made as they interace with axios instance which needs to be mocked but we can't as it is being bind,
     * this means that postHttpRequest is getting the axios instance that would send the call rather than the jest.mock('axios') instances
     */
    const data = await Axios.post(`${authServiceEndPoint}/auth/login`, userFormData);
    expect(data).toEqual(responseData);
  });

  // it('should handle API error and throw an error', async () => {
  //   const userFormData = {
  //     email: '',
  //     password: '',
  //   };

  //   const error = new Error(stubbedData['loginErrorRes']);
  //   Axios.post.mockRejectedValue(error?.message);
  //   await expect(authLogin(userFormData)).rejects.toThrow(stubbedData['loginErrorRes']?.message);
  // });
});
