import { rest } from 'msw';

import { zonesServiceEndPoint } from '../../../services/zone.service';
export const zones = `${zonesServiceEndPoint}/zones`;

export const fetchAllZones = rest.get(zones, async (req, res, ctx) => {
  if (req.url.searchParams.get('perPage') && req.url.searchParams.get('page')) {
    return res(
      ctx.status(200),
      ctx.json({
        statusCode: 200,
        message: 'Zones have been fetched successfully!',
        data: {
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
        },
      }),
    );
  }
  if (!req.url.searchParams.get('perPage') || !req.url.searchParams.get('page')) {
    return res(
      ctx.status(500),
      ctx.json({
        statusCode: 500,
        error: 'An error occurred while fetching zones.',
      }),
    );
  }
  return res(
    ctx.status(200),
    ctx.json({
      statusCode: 200,
      message: 'Zones have been fetched successfully!',
      data: {
        zones: [],
        totalRecords: 0,
        pagination: {
          vars: {
            page: 1,
            items: 10,
            outset: 0,
            size: [1, 4, 4, 1],
            page_param: 'page',
            params: {},
            fragment: '',
            link_extra: '',
            i18n_key: 'pagy.item_name',
            cycle: false,
            request_path: '',
            count: 0,
          },
          count: 0,
          page: 1,
          outset: 0,
          items: 10,
          last: 1,
          pages: 1,
          offset: 0,
          params: {},
          from: 0,
          to: 0,
          in: 0,
          prev: null,
          next: null,
        },
      },
    }),
  );
});

export const fetchZone = rest.get(`${zones}/1`, async (req, res, ctx) => {
  return res(
    ctx.status(200),
    ctx.json({
      statusCode: 200,
      message: 'Zone has been found successfully!',
      data: {
        zone: {
          id: 1,
          name: 'Connecticut',
          countryCode: null,
          country: null,
          state: null,
          city: null,
          address: null,
          email: null,
          dutyType: 'Hybrid',
          phoneNumber: '+123322222',
          supervisor: null,
          postalCode: null,
          sameAsFranchise: false,
          zoneArea: [
            [
              {
                lat: -35.17904790881596,
                lng: -172.06434254213943,
              },
              {
                lat: 8.528193217853897,
                lng: 82.98270668805964,
              },
              {
                lat: 60.00525884464372,
                lng: -125.01539195213348,
              },
            ],
          ],
          coordinates: [
            [
              {
                lat: -35.17904790881596,
                lng: -172.06434254213943,
              },
              {
                lat: 8.528193217853897,
                lng: 82.98270668805964,
              },
              {
                lat: 60.00525884464372,
                lng: -125.01539195213348,
              },
            ],
          ],
        },
      },
    }),
  );
});

/**
 * createZone mock request handler
 */
export const createZone = rest.post(zones, async (req, res, ctx) => {
  if (!req.body.name) {
    return res(
      ctx.status(400),
      ctx.json({
        message: "Validation failed: Name can't be blank",
        statusCode: 400,
        errorObj: {
          name: ["can't be blank"],
        },
      }),
    );
  }
  return res(
    ctx.status(200),
    ctx.json({
      statusCode: 200,
      message: 'Zone has been created successfully',
      data: {
        zone: {
          id: 13,
          name: 'Zone created',
          countryCode: 'MQ',
          country: {
            id: 25,
            name: 'Christmas Island',
          },
          state: {
            id: 19,
            name: 'Michigan',
          },
          city: {
            id: 8,
            name: 'North Melodie',
          },
          address: null,
          email: null,
          dutyType: 'Hybrid',
          phoneNumber: '+123322222',
          supervisor: null,
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
          coordinates: [
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
        },
      },
    }),
  );
});

export const updateZone = rest.put(`${zones}/9`, async (req, res, ctx) => {
  if (!req.body.name) {
    return res(
      ctx.status(400),
      ctx.json({
        message: "Validation failed: Name can't be blank",
        statusCode: 400,
        errorObj: {
          name: ["can't be blank"],
        },
      }),
    );
  }

  return res(
    ctx.status(200),
    ctx.json({
      statusCode: 200,
      message: 'Zone has been updated successfully!',
      data: {
        zone: {
          id: 9,
          name: 'Zone 9',
          countryCode: 'MQ',
          country: {
            id: 25,
            name: 'Christmas Island',
          },
          state: {
            id: 19,
            name: 'Michigan',
          },
          city: {
            id: 8,
            name: 'North Melodie',
          },
          address: null,
          email: null,
          dutyType: 'Hybrid',
          phoneNumber: '+123322222',
          supervisor: null,
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
        },
      },
    }),
  );
});

export const fetchAllZonesError = rest.get(zones, (req, res, ctx) => {
  return res(
    ctx.status(500),
    ctx.json({
      statusCode: 500,
      message: 'Internal Server Error',
      error: 'An error occurred while fetching zones.',
    }),
  );
});
export const updateZoneError = rest.put(`${zones}/9`, (req, res, ctx) => {
  return res(
    ctx.status(500),
    ctx.json({
      statusCode: 500,
      message: 'Internal Server Error',
      error: 'An error occurred while updating zone.',
    }),
  );
});
export const deleteZone = rest.delete(`${zones}/1`, (req, res, ctx) => {
  return res(
    ctx.status(200),
    ctx.json({
      statusCode: 200,
      message: 'Deleted Successfully',
    }),
  );
});

export const getZonesListingHandler = rest.get(`${zones}/options`, async (req, res, ctx) => {
  if (req.error) {
    return res(
      ctx.status(500),
      ctx.json({
        statusCode: 500,
        message: 'Internal Server Error',
        error: 'An error occurred while fetching zone.',
      }),
    );
  }
  return res(
    ctx.status(200),
    ctx.json({
      statusCode: 200,
      message: 'Zones have been fetched successfully!',
      data: {
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
      },
    }),
  );
});

export const handlers = [
  fetchAllZones,
  fetchAllZonesError,
  createZone,
  updateZone,
  getZonesListingHandler,
  updateZoneError,
  fetchZone,
  deleteZone,
];
