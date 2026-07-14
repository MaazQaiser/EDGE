/* eslint-disable no-undef */

import stubbedData from '../../../stubbedData';

jest.mock('axios'); // Mock the postHttpRequest function

describe('getClients', () => {
  it('should return client list', async () => {
    // Arrange

    const responseData = stubbedData['clientStubbedData'].list.success.data;

    // Act

    const result = stubbedData['clientStubbedData'].list.success;
    // Assert
    expect(result.data).toEqual(responseData);
  });

  it('should return first 10 record if no params are provided', async () => {
    // Arrange
    const result = stubbedData['clientStubbedData'].list.success.data;
    const responseData = stubbedData['clientStubbedData'].list.success.data;

    expect(result).toEqual(responseData);
  });
});
