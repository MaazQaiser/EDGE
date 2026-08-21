// jest.config.js
module.exports = {
  /* `'react'` was here and is not a real environment, so every suite died on
     `TestEnvironment is not a constructor` before a single test ran. `type:
     'module'` sat above it and is not a Jest option at all — Jest ignored it,
     which is the only reason it never surfaced as a second error. */
  testEnvironment: 'jsdom',
  /* Discovery is scoped to the app's own source, which is the only tree whose
     tests are this project's. Without it Jest walks the repo root and collects
     `build/`, every `.claude/worktrees/*` checkout, and any vendored copy of the
     frontend sitting in the working directory — ~820 suites instead of 48, plus
     haste collisions on the duplicated `__mocks__` files. `moduleNameMapper`
     resolves the real `<rootDir>/__mocks__` by explicit path, so those still
     load. */
  roots: ['<rootDir>/src'],
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
