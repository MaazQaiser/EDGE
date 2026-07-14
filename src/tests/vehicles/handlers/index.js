import { rest } from 'msw';

import stubbedData from '../../../stubbedData';

// eslint-disable-next-line no-undef
const vehiclesServiceEndPoint = process.env.REACT_APP_FRANCHISE;

export const fetchAllVehicles = rest.get(
  `${vehiclesServiceEndPoint}/vehicles`,
  async (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        data: {
          vehicles: [
            {
              id: 3,
              registrationNumber: '43234243214d',
              makeModelYear: 'Toyota Corolla 1980dc',
              image:
                'https://signalbackedassets.blob.core.windows.net/dev-backend/v5ej0vthvzx6969mwm7ofpf3zb0t?sp=r&sv=2018-11-09&se=2023-12-14T11%3A25%3A39Z&rscd=inline%3B+filename%3D%223-Mercedes-G-Class.jpg%22%3B+filename*%3DUTF-8%27%273-Mercedes-G-Class.jpg&rsct=image%2Fjpeg&sr=b&sig=eQMEGtDYTRldvO0L62xk7bvoyigbj9KojRDPbZBU%2FUo%3D',
              lastMaintenance: '2023-11-02T00:00:00.000Z',
              createdAt: '2023-11-23T11:24:33.109Z',
            },
          ],
          pagination: {
            currentPage: 1,
            nextPage: 2,
            prevPage: null,
            totalPages: 2,
            totalCount: 13,
          },
        },
        statusCode: 200,
        message: 'The record has been fetched successfully.',
      }),
    );
  },
);

export const fetchAllVehiclesError = rest.get(
  `${vehiclesServiceEndPoint}/vehicles`,
  async (req, res, ctx) => {
    return res(
      ctx.status(400),
      ctx.json({
        statusCode: 400,
        message: '',
      }),
    );
  },
);

export const deleteVehicle = rest.delete(
  `${vehiclesServiceEndPoint}/vehicles/:id`,
  async (req, res, ctx) => {
    return res(
      ctx.status(stubbedData.vehiclesStubbedData.delete.success.statusCode),
      ctx.json({
        statusCode: stubbedData.vehiclesStubbedData.delete.success.statusCode,
        message: stubbedData.vehiclesStubbedData.delete.success.message,
      }),
    );
  },
);

export const deleteVehicleError = rest.delete(
  `${vehiclesServiceEndPoint}/vehicles/:id`,
  (req, res, ctx) => {
    if (!req?.params?.id) {
      res(
        ctx.status(404),
        ctx.json({
          statusCode: 404,
          message: 'Not Found',
        }),
      );
    }

    return res(
      ctx.status(stubbedData.vehiclesStubbedData.delete.failure.statusCode),
      ctx.json({
        statusCode: stubbedData.vehiclesStubbedData.delete.failure.statusCode,
        message: stubbedData.vehiclesStubbedData.delete.failure.statusCode,
      }),
    );
  },
);

export const getOneVehicle = rest.get(
  `${vehiclesServiceEndPoint}/vehicles/:id`,
  (req, res, ctx) => {
    if (!req?.params?.id || req.params.id === 'undefined') {
      res(
        ctx.status(404),
        ctx.json({
          statusCode: 404,
          message: 'Not Found',
        }),
      );
    }

    return res(
      ctx.status(stubbedData.vehiclesStubbedData.getOne.success.statusCode),
      ctx.json({
        data: stubbedData.vehiclesStubbedData.getOne.success.data,
        statusCode: stubbedData.vehiclesStubbedData.getOne.success.statusCode,
        message: stubbedData.vehiclesStubbedData.getOne.success.message,
      }),
    );
  },
);

export const getOneVehicleError = rest.get(
  `${vehiclesServiceEndPoint}/vehicles/:id`,
  (req, res, ctx) => {
    if (!req?.params?.id || req.params.id === 'undefined') {
      res(
        ctx.status(404),
        ctx.json({
          statusCode: 404,
          message: 'Not Found',
        }),
      );
    }

    return res(
      ctx.status(stubbedData.vehiclesStubbedData.getOne.failure.statusCode),
      ctx.json({
        statusCode: stubbedData.vehiclesStubbedData.getOne.failure.statusCode,
        message: stubbedData.vehiclesStubbedData.getOne.failure.statusCode,
      }),
    );
  },
);

export const createVehicle = rest.post(`${vehiclesServiceEndPoint}/vehicles`, (req, res, ctx) => {
  return res(
    ctx.status(stubbedData.vehiclesStubbedData.create.success.statusCode),
    ctx.json({
      data: stubbedData.vehiclesStubbedData.create.success.data,
      statusCode: stubbedData.vehiclesStubbedData.create.success.statusCode,
      message: stubbedData.vehiclesStubbedData.create.success.message,
    }),
  );
});

export const createVehicleError = rest.post(
  `${vehiclesServiceEndPoint}/vehicles`,
  (req, res, ctx) => {
    return res(
      ctx.status(stubbedData.vehiclesStubbedData.create.failure.statusCode),
      ctx.json({
        statusCode: stubbedData.vehiclesStubbedData.create.failure.statusCode,
        message: stubbedData.vehiclesStubbedData.create.failure.message,
      }),
    );
  },
);

export const updateVehicle = rest.put(
  `${vehiclesServiceEndPoint}/vehicles/:id`,
  (req, res, ctx) => {
    if (!req?.params?.id || req.params.id === 'undefined') {
      res(
        ctx.status(404),
        ctx.json({
          statusCode: 404,
          message: 'Not Found',
        }),
      );
    }
    return res(
      ctx.status(stubbedData.vehiclesStubbedData.create.success.statusCode),
      ctx.json({
        data: stubbedData.vehiclesStubbedData.create.success.data,
        statusCode: stubbedData.vehiclesStubbedData.create.success.statusCode,
        message: stubbedData.vehiclesStubbedData.create.success.message,
      }),
    );
  },
);

export const updateVehicleError = rest.put(
  `${vehiclesServiceEndPoint}/vehicles/:id`,
  (req, res, ctx) => {
    if (!req?.params?.id || req.params.id === 'undefined') {
      res(
        ctx.status(404),
        ctx.json({
          statusCode: 404,
          message: 'Not Found',
        }),
      );
    }
    return res(
      ctx.status(stubbedData.vehiclesStubbedData.create.failure.statusCode),
      ctx.json({
        statusCode: stubbedData.vehiclesStubbedData.create.failure.statusCode,
        message: stubbedData.vehiclesStubbedData.create.failure.message,
      }),
    );
  },
);

export const vehicleHandlers = [
  fetchAllVehicles,
  fetchAllVehiclesError,
  deleteVehicle,
  deleteVehicleError,
  getOneVehicle,
  getOneVehicleError,
  createVehicle,
  createVehicleError,
  updateVehicle,
  updateVehicleError,
];
