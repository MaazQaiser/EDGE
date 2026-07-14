// jest.config.js
module.exports = {
  type: 'module',
  testEnvironment: 'react',
  setupFilesAfterEnv: ['./src/setupTests.js'],
  moduleNameMapper: {
    '^assets/(.*)\\.svg(\\?react)?$': '<rootDir>/__mocks__/svgrMock.js',
    '^assets/(.*)\\.(png|jpg|jpeg|gif|webp|ico|bmp)$': '<rootDir>/__mocks__/fileMock.js',
    '^src/(.*)\\.svg(\\?react)?$': '<rootDir>/__mocks__/svgrMock.js',
    '^src/(.*)\\.(png|jpg|jpeg|gif|webp|ico|bmp)$': '<rootDir>/__mocks__/fileMock.js',
    '\\.(css|less|scss|sass)$': '<rootDir>/__mocks__/styleMock.js',

    '^src/(.*)$': '<rootDir>/src/$1',
    '^app/(.*)$': '<rootDir>/src/app/$1',
    '^assets/(.*)$': '<rootDir>/src/assets/$1',
    '^helper/(.*)$': '<rootDir>/src/helper/$1',
    '^utils/(.*)$': '<rootDir>/src/utils/$1',
    '^services/(.*)$': '<rootDir>/src/services/$1',
    '^salesPages/(.*)$': '<rootDir>/src/app/sales/pages/$1',
    '^commonComponents/(.*)$': '<rootDir>/src/app/components/common/$1',
    '^salesComponents/(.*)$': '<rootDir>/src/app/components/salesComponents/$1',
    '^globalUtils/(.*)$': '<rootDir>/src/utils/$1',
    '^assetsComponents/(.*)$': '<rootDir>/src/assets/$1',
    '^routerComponent/(.*)$': '<rootDir>/src/app/router/$1',
    axios: 'axios/dist/node/axios.cjs',
  },
  transform: {
    '^.+\\.jsx?$': 'babel-jest',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(@shotgunjed|query-string|decode-uri-component|split-on-first|filter-obj)/)',
  ],
};
