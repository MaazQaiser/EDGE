import stubbedData from '../../../stubbedData/index';
import { mswServer } from '../../server';
import { updateUserPassword, updateUserPasswordError } from '../handler';

jest.mock('axios'); // Mock the postHttpRequest function
jest.mock('../../../helper/axios');
describe('updatePassword', () => {
  test('Update password', async () => {
    mswServer.use(updateUserPassword);
  });

  test('Update password failed', async () => {
    try {
      mswServer.use(updateUserPasswordError);
    } catch (error) {
      expect(error?.response?.data?.statusCode).toBe(
        stubbedData.updatePasswordStubbedData.error.statusCode,
      );
      expect(error?.response?.data?.message).toBe(
        stubbedData.updatePasswordStubbedData.error.message,
      );
    }
  });
});
