import { rest } from 'msw';
import { authServiceEndPoint } from 'services/auth.services';

import stubbedData from '../../stubbedData/index';

export const updateUserPassword = rest.post(
  `${authServiceEndPoint}/auth/change_password`,
  async (req, res, ctx) => {
    return res(
      ctx.status(stubbedData.updatePasswordStubbedData.success.statusCode),
      ctx.json({
        data: {
          message: stubbedData.updatePasswordStubbedData.success.message,
        },
      }),
    );
  },
);

export const updateUserPasswordError = rest.post(
  `${authServiceEndPoint}/auth/change_password`,
  async (req, res, ctx) => {
    return res(
      ctx.status(stubbedData.updatePasswordStubbedData.error.statusCode),
      ctx.json({
        data: {
          message: stubbedData.updatePasswordStubbedData.error.message,
        },
      }),
    );
  },
);
