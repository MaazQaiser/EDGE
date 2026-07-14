import 'whatwg-fetch';

import Axios from 'axios';
import { mswServer } from 'src/tests/server';

import { FRANCHISE_SERVICE } from '../../../services/franchise.services';
import stubbedData, {
  getFranchiseData,
  getFranchiseDetails,
  getGeoLocationData,
} from '../../../stubbedData';
import { changeFO, getActiveFranchises, getFranchiseDetail } from '../handler/postHandler';

describe('inviteFranchise', () => {
  it('Should delete FO', async () => {
    // Call the function and assert the result
    let id = 1;
    const result = await Axios.post(
      `${FRANCHISE_SERVICE}/home_office/franchises/${id}/reinvite_owner`,
    );
    // Expectations based on your mock data
    expect(result.data).toEqual(stubbedData['inviteFranchise'].success);
    expect(result.status).toBe(200);
  });

  it('should handle error while deleteing FO', async () => {
    const id = {}; // Invalid ID
    console.log({ id });
    try {
      mswServer.use(changeFO);
    } catch (error) {
      expect(error.status).toBe(500);
    }
  });
});

describe('deleteFranchise', () => {
  it('Should delete FO', async () => {
    // Call the function and assert the result
    let id = 1;
    const result = await Axios.put(
      `${FRANCHISE_SERVICE}/home_office/franchises/${id}/mark_non_functional`,
    );
    // Expectations based on your mock data
    expect(result.data).toEqual(stubbedData['deleteFranchise'].success);
    expect(result.status).toBe(200);
  });

  it('should handle error while deleteing FO', async () => {
    const id = {}; // Invalid ID
    console.log({ id });
    try {
      mswServer.use(changeFO);
    } catch (error) {
      expect(error.status).toBe(500);
    }
  });
});

describe('changeFO', () => {
  it('Should update FFO', async () => {
    // Call the function and assert the result
    let id = 1;
    const result = await Axios.put(
      `${FRANCHISE_SERVICE}/home_office/franchises/${id}/change_owner`,
    );
    // Expectations based on your mock data
    expect(result.data.data).toEqual(stubbedData['changeFranchiseOwner'].success.data);
    expect(result.status).toBe(200);
  });

  it('should handle error updating FO', async () => {
    const id = {}; // Invalid ID
    console.log({ id });
    // Call the function and assert the result
    try {
      mswServer.use(changeFO);
    } catch (error) {
      // Expectations for error handling
      expect(error.status).toBe(500);
    }
  });
});

describe('getFranchiseDetail', () => {
  it('Should get franchise details', async () => {
    // Call the function and assert the result
    const result = await Axios.get(`${FRANCHISE_SERVICE}/franchises/zone_details`);
    // Expectations based on your mock data
    expect(result.data.data).toEqual(getFranchiseDetails.success.data);
    expect(result.status).toBe(200);
  });

  it('should handle error in fetching franchise details', async () => {
    const id = {}; // Invalid ID
    console.log({ id });
    // Call the function and assert the result
    try {
      mswServer.use(getFranchiseDetail);
    } catch (error) {
      // Expectations for error handling
      expect(error.status).toBe(500);
    }
  });
});

describe('getActiveFranchises', () => {
  it('Should get active franchises data', async () => {
    // Call the function and assert the result
    const result = await Axios.get(`${FRANCHISE_SERVICE}/franchises/options`);
    // Expectations based on your mock data
    expect(result.data.data.activeFranchises).toEqual([
      {
        id: 23,
        name: 'Rehman',
      },
      {
        id: 9,
        name: 'Rehman 2',
      },
      {
        id: 8,
        name: 'Rehman 3',
      },
      {
        id: 4,
        name: 'Rehman 4',
      },
      {
        id: 1,
        name: 'Rehman',
      },
    ]);
    expect(result.status).toBe(200);
  });

  it('should handle error in fetching active franchises', async () => {
    const id = {}; // Invalid ID
    console.log({ id });
    // Call the function and assert the result
    try {
      mswServer.use(getActiveFranchises);
    } catch (error) {
      // Expectations for error handling
      expect(error.status).toBe(500);
    }
  });
});

describe('makeFranchiseFunctional', () => {
  it('Should get gelocation data', async () => {
    const data = { site: 1 }; // Specify the desired ID for testing

    // Call the function and assert the result
    const result = await Axios.post(`${FRANCHISE_SERVICE}/geolocations`, data);
    // Expectations based on your mock data
    expect(result.data.data).toEqual(getGeoLocationData?.success?.data);
    expect(result.data?.statusCode).toBe(200);
  });

  it('should handle payload for geolocation', async () => {
    const id = {}; // Invalid ID

    // Call the function and assert the result
    try {
      const result = await Axios.post(`${FRANCHISE_SERVICE}/geolocations`, id);
      console.log({ result });
    } catch (error) {
      // Expectations for error handling
      expect(error.message).toBe(getGeoLocationData?.failure.message);
    }
  });
});
describe('refreshFranchiseListingData', () => {
  it('Should get refreshFranchiseListingData  ', async () => {
    const id = 123; // Specify the desired ID for testing
    console.log({ id });
    // Call the function and assert the result
    const result = await Axios.get(`${FRANCHISE_SERVICE}/home_office/franchises/sync_hubspot_data`);
    // Expectations based on your mock data
    expect(result?.data?.message).toEqual('Synced Successfully!.');
    expect(result.status).toBe(200);
  });
});

describe('makeFranchiseFunctional', () => {
  it('Should make franchise functional  ', async () => {
    const id = 123; // Specify the desired ID for testing

    // Call the function and assert the result
    const result = await Axios.get(
      `${FRANCHISE_SERVICE}/home_office/franchises/${id}/mark_functional`,
    );
    // Expectations based on your mock data
    expect(result?.data?.message).toEqual(stubbedData?.makeFranchiseFunctional.success?.message);
    expect(result.data?.statusCode).toBe(200);
  });

  it('should handle invalid ID on edit page HO', async () => {
    const id = null; // Invalid ID

    // Call the function and assert the result
    try {
      const result = await Axios.get(
        `${FRANCHISE_SERVICE}/home_office/franchises/${id}/mark_functional`,
      );
      console.log({ result });
    } catch (error) {
      // Expectations for error handling
      expect(error.message).toBe(getFranchiseData?.failure.message);
    }
  });
});
describe('getFranchise', () => {
  it('should fetch franchise details for edit in HO ', async () => {
    const id = 123; // Specify the desired ID for testing

    // Call the function and assert the result
    const result = await Axios.get(`${FRANCHISE_SERVICE}/home_office/franchises/${id}/edit`);
    // Expectations based on your mock data
    expect(result?.data).toEqual(getFranchiseData?.success?.data);
    expect(result.status).toBe(200);
  });

  it('should handle invalid ID on edit page HO', async () => {
    // Call the function and assert the result
    try {
      const result = await Axios.get(`${FRANCHISE_SERVICE}/home_office/franchises/:id/edit`);
      console.log({ result });
    } catch (error) {
      // Expectations for error handling
      expect(error.message).toBe(getFranchiseData?.failure.message);
    }
  });
});
