import { rest } from 'msw';
import { settings, visitor_service } from 'services/settings.services';
import { validateParamForMockApi } from 'src/helper/utilityFunctions';
import stubbedData from 'src/stubbedData';

export const settingsPreferencesTabMew = rest.get(`${settings}/preferences`, (req, res, ctx) => {
  const stubData = stubbedData?.settingsPreferences.get;

  return res(
    ctx.status(stubData.success.statusCode),
    ctx.json({
      statusCode: stubData.success.statusCode,
      message: stubData.success.message,
      data: {
        preferences: stubData.success.data.preferences,
      },
    }),
  );
});

export const settingsPreferencesTabMewError = rest.get(
  `${settings}/preferences`,
  (req, res, ctx) => {
    const stubData = stubbedData?.settingsPreferences.get;

    return res(
      ctx.status(stubData.failure.statusCode),
      ctx.json({
        statusCode: stubData.failure.statusCode,
        message: stubData.failure.message,
        data: {
          preferences: [],
        },
      }),
    );
  },
);

export const updateSettingsPreferencesTabMew = rest.put(
  `${settings}/preferences/update`,
  (req, res, ctx) => {
    const stubData = stubbedData?.settingsPreferences.update;
    if (!req?.body) {
      return res(
        ctx.status(stubData.failure.statusCode),
        ctx.json({
          statusCode: stubData.failure.statusCode,
          message: stubData.failure.message,
        }),
      );
    }

    return res(
      ctx.status(stubData.success.statusCode),
      ctx.json({
        statusCode: stubData.success.statusCode,
        message: stubData.success.message,
      }),
    );
  },
);

export const settingsPreferencesTabConfigsMew = rest.get(
  `${settings}/preferences/preferences_config`,
  (req, res, ctx) => {
    const stubData = stubbedData?.settingsPreferencesConfig.get;

    return res(
      ctx.status(stubData.success.statusCode),
      ctx.json({
        statusCode: stubData.success.statusCode,
        message: stubData.success.message,
        data: stubData.success.data,
      }),
    );
  },
);

export const settingsPreferencesTabConfigsErrorMew = rest.get(
  `${settings}/preferences/preferences_config`,
  (req, res, ctx) => {
    const stubData = stubbedData?.settingsPreferencesConfig.get;

    return res(
      ctx.status(stubData.failure.statusCode),
      ctx.json({
        statusCode: stubData.failure.statusCode,
        message: stubData.failure.message,
      }),
    );
  },
);

export const settingsVisitorTypesMew = rest.get(
  `${visitor_service}/visitor_types`,
  (req, res, ctx) => {
    const stubData = stubbedData?.typesStubbedData.list;

    return res(
      ctx.status(stubData.success.statusCode),
      ctx.json({
        statusCode: stubData.success.statusCode,
        message: stubData.success.message,
        data: {
          visitorTypes: stubData.success.data.visitorTypes,
        },
      }),
    );
  },
);

export const settingsVisitorTypesErrorMew = rest.get(
  `${visitor_service}/visitor_types`,
  (req, res, ctx) => {
    const stubData = stubbedData?.typesStubbedData.list;

    return res(
      ctx.status(stubData.failure.statusCode),
      ctx.json({
        statusCode: stubData.failure.statusCode,
        message: stubData.failure.message,
      }),
    );
  },
);

export const settingsVisitorTypesGetOneMew = rest.get(
  `${visitor_service}/visitor_types/:id`,
  (req, res, ctx) => {
    const stubData = stubbedData?.typesStubbedData.getOne;

    if (validateParamForMockApi(req)) {
      return res(
        ctx.status(stubData.failure.statusCode),
        ctx.json({
          statusCode: stubData.failure.statusCode,
          message: stubData.failure.message,
        }),
      );
    }
    return res(
      ctx.status(stubData.success.statusCode),
      ctx.json({
        statusCode: stubData.success.statusCode,
        message: stubData.success.message,
        data: {
          visitorType: stubData.success.data.visitorType,
        },
      }),
    );
  },
);

export const settingsVisitorTypesUpdateMew = rest.put(
  `${visitor_service}/visitor_types/:id`,
  (req, res, ctx) => {
    const stubData = stubbedData?.typesStubbedData.update;

    if (!req?.body || validateParamForMockApi(req)) {
      return res(
        ctx.status(stubData.failure.statusCode),
        ctx.json({
          statusCode: stubData.failure.statusCode,
          message: stubData.failure.message,
        }),
      );
    }
    return res(
      ctx.status(stubData.success.statusCode),
      ctx.json({
        statusCode: stubData.success.statusCode,
        message: stubData.success.message,
      }),
    );
  },
);

export const settingsVisitorTypesDefaultSettingsMew = rest.get(
  `${visitor_service}/visitor_types/default_settings`,
  (req, res, ctx) => {
    const stubData = stubbedData?.formSettingsListByType.list;

    if (!req.url.searchParams.get('category')) {
      return res(
        ctx.status(stubData.failure.statusCode),
        ctx.json({
          statusCode: stubData.failure.statusCode,
          message: stubData.failure.message,
        }),
      );
    }
    return res(
      ctx.status(stubData.success.statusCode),
      ctx.json({
        statusCode: stubData.success.statusCode,
        message: stubData.success.message,
        data: {
          defaultSettings: stubData.success.data.dynamicFormListTypeMock,
        },
      }),
    );
  },
);

export const settingsHandlers = [
  settingsPreferencesTabMew,
  settingsPreferencesTabMewError,
  updateSettingsPreferencesTabMew,
  settingsVisitorTypesDefaultSettingsMew,
  settingsPreferencesTabConfigsMew,
  settingsPreferencesTabConfigsErrorMew,
  settingsVisitorTypesMew,
  settingsVisitorTypesErrorMew,
  settingsVisitorTypesGetOneMew,
  settingsVisitorTypesUpdateMew,
];
