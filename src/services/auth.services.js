import { mockAsync, mockMutationSuccess, mockSuccess } from 'src/helper/mockData/mockHelpers';
import { getMockTenantLabels, getMockUserDataResponse } from 'src/helper/mockData/mockUserData';

import { isObjectEmpty } from '../helper/utilityFunctions';

export const authServiceEndPoint = 'mock-auth';
export const userServiceEndpoint = 'mock-user';

export const authLogin = async () => {
  return mockAsync(mockSuccess('Logged in successfully'));
};

export const forgetPassword = async (postData) => {
  if (!postData?.user?.email) {
    throw { statusCode: 400, message: 'Email does not exist' };
  }
  return mockAsync(mockMutationSuccess('Email sent successfully'));
};

export const updatePassword = async (postData) => {
  if (isObjectEmpty(postData)) {
    throw { statusCode: 400, message: 'Something went wrong' };
  }
  return mockAsync(mockMutationSuccess('Password updated successfully'));
};

export const resetPassword = async (postData) => {
  if (isObjectEmpty(postData)) {
    throw { statusCode: 400, message: 'Something went wrong' };
  }
  return mockAsync(mockMutationSuccess('Password reset link sent successfully'));
};

export const getUserLoginPermission = async () => {
  return mockAsync(mockSuccess('Permissions fetched', { permissions: [] }));
};

export const getUserData = async () => {
  return mockAsync(getMockUserDataResponse());
};

export const logoutCall = async () => {
  return mockAsync(mockMutationSuccess('Logged out successfully'));
};

export const fetchTenantLabelsCall = async () => {
  return mockAsync(getMockTenantLabels());
};
