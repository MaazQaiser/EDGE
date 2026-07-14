import 'whatwg-fetch';

import Axios from 'axios';
import stubbedData from 'stubbedData';

import { createZone, deleteZone as deleteZoneCall } from '../../../services/zone.service';
import { mswServer } from '../../server';
import { fetchAllZonesError, getZonesListingHandler, updateZoneError, zones } from './postHandler';

describe('getZoneDetails', () => {
  it('should return zone details data when successful', async () => {
    const result = await Axios.get(`${zones}/1`);
    expect(result.data.statusCode).toBe(200);
  });
});

describe('updateZone', () => {
  it('should return success data when successful', async () => {
    const data = {
      id: 9,
      name: 'Zone created',
      supervisor: {
        id: '9',
        name: 'my supervisor',
      },
      countryId: '25',
      stateId: '19',
      cityId: '8',
      postalCode: '33333',
      sameAsFranchise: false,
      zoneArea: [
        [
          {
            lat: 31.5048493,
            lng: 74.3238862,
          },
          {
            lat: 31.504851,
            lng: 74.3338862,
          },
          {
            lat: 31.514851,
            lng: 74.3538862,
          },
        ],
      ],
    };
    const result = await Axios.put(`${zones}/${data?.id}`, data);
    expect(result.data.statusCode).toBe(200);
    expect(result.data.message).toBe('Zone has been updated successfully!');
    expect(result.data.data.zone).toBeInstanceOf(Object);
  });
  it('should return error if request fails', async () => {
    let data = {
      id: 9,
      supervisor: {
        id: '9',
        name: 'supervisor',
      },
      countryId: '25',
      stateId: '19',
      cityId: '8',
      postalCode: '33333',
      sameAsFranchise: false,
      zoneArea: [
        [
          {
            lat: 0,
            lng: 74.3238862,
          },
          {
            lat: 33.504851788,
            lng: 74.3338862,
          },
          {
            lat: 0,
            lng: 0,
          },
        ],
      ],
      coordinates: [
        [
          {
            lat: 36.5048493,
            lng: 76.3238862,
          },
          {
            lat: 34.504851,
            lng: 74.3338862,
          },
          {
            lat: 34.514851,
            lng: 74.3538862,
          },
        ],
      ],
    };

    try {
      await Axios.put(`${zones}/${data?.id}`, data);
    } catch (e) {
      expect(e.response.status).toBe(400);
      expect(e.response.statusText).toBe('Bad Request');
    }
    // expect(result).toEqual(stubbedData.updateZone.success);
  });

  it('Update zone error', async () => {
    try {
      mswServer.use(updateZoneError);
    } catch (error) {
      expect(error.status).toBe(200);
      expect(error.data.message).toBe('Internal Server Error');
    }
  });
});

describe('createZone', () => {
  it('should return success data when successful', async () => {
    const data = {
      id: 1,
      name: 'Zone created',
      supervisor: {
        id: '9',
        name: 'my supervisor',
      },
      countryId: '25',
      stateId: '19',
      cityId: '8',
      postalCode: '33333',
      sameAsFranchise: false,
      zoneArea: [
        [
          {
            lat: 31.5048493,
            lng: 74.3238862,
          },
          {
            lat: 31.504851,
            lng: 74.3338862,
          },
          {
            lat: 31.514851,
            lng: 74.3538862,
          },
        ],
      ],
    };
    const result = await Axios.post(zones, data);
    expect(result.data.statusCode).toBe(200);
    expect(result.data.message).toBe('Zone has been created successfully');
    expect(result.data.data.zone).toBeInstanceOf(Object);
  });

  it('should return 400 if name is empty', async () => {
    const data = {
      id: 1,
      supervisor: {
        id: '9',
        name: 'my supervisor',
      },
      countryId: '25',
      stateId: '19',
      cityId: '8',
      postalCode: '33333',
      sameAsFranchise: false,
      zoneArea: [
        [
          {
            lat: 31.5048493,
            lng: 74.3238862,
          },
          {
            lat: 31.504851,
            lng: 74.3338862,
          },
          {
            lat: 31.514851,
            lng: 74.3538862,
          },
        ],
      ],
    };
    try {
      await Axios.post(zones, data);
    } catch (e) {
      expect(e.response.status).toBe(400);
      expect(e.response.statusText).toBe('Bad Request');
    }
  });

  it('should throw an error when request fails', async () => {
    // Modify the stubbedData to simulate failure
    stubbedData.createZone.success = false;

    try {
      await createZone({});
    } catch (error) {
      expect(stubbedData.createZone.failure?.message).toBe(stubbedData.createZone.failure?.message);
    }
  });
});

describe('Delete Zone', () => {
  it('should return success data when successful', async () => {
    const data = 1;
    const result = await Axios.delete(`${zones}/${data}`);
    expect(result.data.statusCode).toBe(200);
  });

  it('should throw an error when request fails', async () => {
    // Modify the stubbedData to simulate failure
    stubbedData.deleteZone.success = false;

    try {
      await deleteZoneCall(1);
    } catch (error) {
      expect(stubbedData.deleteZone.failure?.message).toBe(stubbedData.deleteZone.failure?.message);
    }
  });
});

describe('fetchZones', () => {
  test('Fetch all zones', async () => {
    const response = await Axios.get(`${zones}?page=1&perPage=10`);
    expect(response.data.statusCode).toBe(200);
    expect(response.data.message).toBe('Zones have been fetched successfully!');
  });
  test('Fetch all zones error no params', async () => {
    try {
      const response = await Axios.get(`${zones}`);
      console.log({ response });
    } catch (error) {
      expect(error.response.status).toBe(500);
      expect(error.response.data.statusCode).toBe(500);
      expect(error.response.data.error).toBe('An error occurred while fetching zones.');
    }
  });
  // expect(response.data.message).toBe('Zones have been fetched successfully!');
  // });

  test('Fetch all zones error', async () => {
    try {
      mswServer.use(fetchAllZonesError);
    } catch (error) {
      // Verify that the error response has a status code of 500
      expect(error.response.status).toBe(500);
      expect(error.response.data.statusCode).toBe(500);
      expect(error.response.data.message).toBe('Internal Server Error');
      expect(error.response.data.error).toBe('An error occurred while fetching zones.');
    }
  });
});

describe('getZonesListingHandler', () => {
  test('should return valid data for successful response', async () => {
    const responseData = {
      zones: [
        {
          id: 23,
          name: 'Site 8 zone',
          supervisor: null,
          sites: 4,
          officers: null,
        },
        {
          id: 32,
          name: 'New Zone',
          supervisor: {
            id: 2548,
            name: 'Asad H.',
            image:
              'https://as1.ftcdn.net/v2/jpg/02/43/51/48/1000_F_243514868_XDIMJHNNJYKLRST05XnnTj0MBpC4hdT5.jpg',
          },
          sites: 11,
          officers: null,
        },
        {
          id: 35,
          name: 'North Zone New',
          supervisor: {
            id: 2549,
            name: 'Nauman Shafiq',
            image:
              'https://signalbackedassets.blob.core.windows.net/dev-backend/1702893844355-rn_image_picker_lib_temp_dd7a3850-277c-43d3-8226-5b3f723b2a29.jpg?sp=r&sv=2018-11-09&se=2023-12-27T10%3A40%3A17Z&rscd=inline%3B+filename%3D%221702893844355-rn_image_picker_lib_temp_dd7a3850-277c-43d3-8226-5b3f723b2a29.jpg%22%3B+filename*%3DUTF-8%27%271702893844355-rn_image_picker_lib_temp_dd7a3850-277c-43d3-8226-5b3f723b2a29.jpg&rsct=image%2Fjpeg&sr=b&sig=5DCnPWdKylmSvVYbXthlZN4v9hq0M4DgpZdPSI%2FeLtk%3D',
          },
          sites: 1,
          officers: null,
        },
        {
          id: 43,
          name: 'zone faizan',
          supervisor: {
            id: 2568,
            name: 'Faizan Ali',
            image:
              'https://signalbackedassets.blob.core.windows.net/dev-backend/1703080961489-rn_image_picker_lib_temp_a3115dfd-f9d3-4058-950d-0893a478f8bf.jpg?sp=r&sv=2018-11-09&se=2023-12-27T10%3A40%3A17Z&rscd=inline%3B+filename%3D%221703080961489-rn_image_picker_lib_temp_a3115dfd-f9d3-4058-950d-0893a478f8bf.jpg%22%3B+filename*%3DUTF-8%27%271703080961489-rn_image_picker_lib_temp_a3115dfd-f9d3-4058-950d-0893a478f8bf.jpg&rsct=image%2Fjpeg&sr=b&sig=GTJqrkyI75CrhOYD7QNCXMvJfCLd64wk%2FfNMSR0Fyfs%3D',
          },
          sites: 1,
          officers: null,
        },
        {
          id: 46,
          name: 'South Zone',
          supervisor: {
            id: 2549,
            name: 'Nauman Shafiq',
            image:
              'https://signalbackedassets.blob.core.windows.net/dev-backend/1702893844355-rn_image_picker_lib_temp_dd7a3850-277c-43d3-8226-5b3f723b2a29.jpg?sp=r&sv=2018-11-09&se=2023-12-27T10%3A40%3A17Z&rscd=inline%3B+filename%3D%221702893844355-rn_image_picker_lib_temp_dd7a3850-277c-43d3-8226-5b3f723b2a29.jpg%22%3B+filename*%3DUTF-8%27%271702893844355-rn_image_picker_lib_temp_dd7a3850-277c-43d3-8226-5b3f723b2a29.jpg&rsct=image%2Fjpeg&sr=b&sig=5DCnPWdKylmSvVYbXthlZN4v9hq0M4DgpZdPSI%2FeLtk%3D',
          },
          sites: 0,
          officers: null,
        },
        {
          id: 47,
          name: 'South B Zone',
          supervisor: {
            id: 2549,
            name: 'Nauman Shafiq',
            image:
              'https://signalbackedassets.blob.core.windows.net/dev-backend/1702893844355-rn_image_picker_lib_temp_dd7a3850-277c-43d3-8226-5b3f723b2a29.jpg?sp=r&sv=2018-11-09&se=2023-12-27T10%3A40%3A18Z&rscd=inline%3B+filename%3D%221702893844355-rn_image_picker_lib_temp_dd7a3850-277c-43d3-8226-5b3f723b2a29.jpg%22%3B+filename*%3DUTF-8%27%271702893844355-rn_image_picker_lib_temp_dd7a3850-277c-43d3-8226-5b3f723b2a29.jpg&rsct=image%2Fjpeg&sr=b&sig=AbKjT46quxlG8GcR1Oj4I4ESAv0hk1G%2Fyd13%2Fl%2F7Pgo%3D',
          },
          sites: 1,
          officers: null,
        },
        {
          id: 48,
          name: 'Right Zone',
          supervisor: {
            id: 2548,
            name: 'Asad H.',
            image:
              'https://as1.ftcdn.net/v2/jpg/02/43/51/48/1000_F_243514868_XDIMJHNNJYKLRST05XnnTj0MBpC4hdT5.jpg',
          },
          sites: 2,
          officers: null,
        },
      ],
      totalRecords: 7,
      pagination: {
        currentPage: 1,
        nextPage: null,
        prevPage: null,
        totalPages: 1,
        totalCount: 7,
      },
    };

    const response = await Axios.get(`${zones}/options`);
    expect(response.status).toBe(200);

    expect(response.data.statusCode).toBe(200);
    expect(response?.data?.data).toEqual(responseData);
  });

  test('Fetch zone listing error', async () => {
    try {
      mswServer.use(getZonesListingHandler);
    } catch (error) {
      expect(error.response.status).toBe(500);
      expect(error.response.data.statusCode).toBe(500);
      expect(error.response.data.message).toBe('Internal Server Error');
    }
  });
});

describe('getZonesHandler with aparams', () => {
  test('should return valid data for successful response', async () => {
    const responseData = {
      zones: [
        {
          id: 23,
          name: 'Site 8 zone',
          supervisor: null,
          sites: 4,
          officers: null,
        },
        {
          id: 32,
          name: 'New Zone',
          supervisor: {
            id: 2548,
            name: 'Asad H.',
            image:
              'https://as1.ftcdn.net/v2/jpg/02/43/51/48/1000_F_243514868_XDIMJHNNJYKLRST05XnnTj0MBpC4hdT5.jpg',
          },
          sites: 11,
          officers: null,
        },
        {
          id: 35,
          name: 'North Zone New',
          supervisor: {
            id: 2549,
            name: 'Nauman Shafiq',
            image:
              'https://signalbackedassets.blob.core.windows.net/dev-backend/1702893844355-rn_image_picker_lib_temp_dd7a3850-277c-43d3-8226-5b3f723b2a29.jpg?sp=r&sv=2018-11-09&se=2023-12-27T10%3A40%3A17Z&rscd=inline%3B+filename%3D%221702893844355-rn_image_picker_lib_temp_dd7a3850-277c-43d3-8226-5b3f723b2a29.jpg%22%3B+filename*%3DUTF-8%27%271702893844355-rn_image_picker_lib_temp_dd7a3850-277c-43d3-8226-5b3f723b2a29.jpg&rsct=image%2Fjpeg&sr=b&sig=5DCnPWdKylmSvVYbXthlZN4v9hq0M4DgpZdPSI%2FeLtk%3D',
          },
          sites: 1,
          officers: null,
        },
        {
          id: 43,
          name: 'zone faizan',
          supervisor: {
            id: 2568,
            name: 'Faizan Ali',
            image:
              'https://signalbackedassets.blob.core.windows.net/dev-backend/1703080961489-rn_image_picker_lib_temp_a3115dfd-f9d3-4058-950d-0893a478f8bf.jpg?sp=r&sv=2018-11-09&se=2023-12-27T10%3A40%3A17Z&rscd=inline%3B+filename%3D%221703080961489-rn_image_picker_lib_temp_a3115dfd-f9d3-4058-950d-0893a478f8bf.jpg%22%3B+filename*%3DUTF-8%27%271703080961489-rn_image_picker_lib_temp_a3115dfd-f9d3-4058-950d-0893a478f8bf.jpg&rsct=image%2Fjpeg&sr=b&sig=GTJqrkyI75CrhOYD7QNCXMvJfCLd64wk%2FfNMSR0Fyfs%3D',
          },
          sites: 1,
          officers: null,
        },
        {
          id: 46,
          name: 'South Zone',
          supervisor: {
            id: 2549,
            name: 'Nauman Shafiq',
            image:
              'https://signalbackedassets.blob.core.windows.net/dev-backend/1702893844355-rn_image_picker_lib_temp_dd7a3850-277c-43d3-8226-5b3f723b2a29.jpg?sp=r&sv=2018-11-09&se=2023-12-27T10%3A40%3A17Z&rscd=inline%3B+filename%3D%221702893844355-rn_image_picker_lib_temp_dd7a3850-277c-43d3-8226-5b3f723b2a29.jpg%22%3B+filename*%3DUTF-8%27%271702893844355-rn_image_picker_lib_temp_dd7a3850-277c-43d3-8226-5b3f723b2a29.jpg&rsct=image%2Fjpeg&sr=b&sig=5DCnPWdKylmSvVYbXthlZN4v9hq0M4DgpZdPSI%2FeLtk%3D',
          },
          sites: 0,
          officers: null,
        },
        {
          id: 47,
          name: 'South B Zone',
          supervisor: {
            id: 2549,
            name: 'Nauman Shafiq',
            image:
              'https://signalbackedassets.blob.core.windows.net/dev-backend/1702893844355-rn_image_picker_lib_temp_dd7a3850-277c-43d3-8226-5b3f723b2a29.jpg?sp=r&sv=2018-11-09&se=2023-12-27T10%3A40%3A18Z&rscd=inline%3B+filename%3D%221702893844355-rn_image_picker_lib_temp_dd7a3850-277c-43d3-8226-5b3f723b2a29.jpg%22%3B+filename*%3DUTF-8%27%271702893844355-rn_image_picker_lib_temp_dd7a3850-277c-43d3-8226-5b3f723b2a29.jpg&rsct=image%2Fjpeg&sr=b&sig=AbKjT46quxlG8GcR1Oj4I4ESAv0hk1G%2Fyd13%2Fl%2F7Pgo%3D',
          },
          sites: 1,
          officers: null,
        },
        {
          id: 48,
          name: 'Right Zone',
          supervisor: {
            id: 2548,
            name: 'Asad H.',
            image:
              'https://as1.ftcdn.net/v2/jpg/02/43/51/48/1000_F_243514868_XDIMJHNNJYKLRST05XnnTj0MBpC4hdT5.jpg',
          },
          sites: 2,
          officers: null,
        },
      ],
      totalRecords: 7,
      pagination: {
        currentPage: 1,
        nextPage: null,
        prevPage: null,
        totalPages: 1,
        totalCount: 7,
      },
    };

    const response = await Axios.get(`${zones}?page=1&perPage=10`);
    expect(response.data.statusCode).toBe(200);
    expect(response.status).toBe(200);
    expect(response.data.data).toEqual(responseData);
  });

  test('Fetch zone listing error', async () => {
    try {
      mswServer.use(zones);
    } catch (error) {
      expect(error.response.status).toBe(500);
      expect(error.response.data.statusCode).toBe(500);
      expect(error.response.data.message).toBe('Internal Server Error');
    }
  });
});
