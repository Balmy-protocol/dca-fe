/** @type {import('ts-jest').JestConfigWithTsJest} */

export default {
  roots: ['<rootDir>'],
  testMatch: ['**/*.spec.ts'],
  // This combination of preset/transformIgnorePatterns enforces that both TS and
  // JS files are transformed to CJS, and that the transform also applies to the
  // dependencies in the node_modules, so that ESM-only dependencies are supported.
  preset: 'ts-jest/presets/js-with-ts',
  // deliberately set to an empty array to allow including node_modules when transforming code:
  transformIgnorePatterns: [],
  modulePathIgnorePatterns: ['dist/', '<rootDir>/examples/'],
  coveragePathIgnorePatterns: ['.*.spec.ts', 'dist/'],
  clearMocks: true,
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  // This test environment is an extension of jsdom. This module targets the
  // browser environment only, so tests only need to run in jsdom.
  // Currently, this is still required despite the polyfills in jest setup.
  // See comments in file.
  testEnvironment: '<rootDir>/tests/customEnvironment.ts',
  // Enable injectGlobals here to support jest-mock-console
  // https://github.com/bpedersen/jest-mock-console/issues/32
  injectGlobals: true,
  // collectCoverage: true,
  // collectCoverageFrom: ["<rootDir>/src/**/*.ts"],
  moduleNameMapper: {
    '^@common(.*)': '<rootDir>src/common$1',
    '^@assets(.*)': '<rootDir>src/assets$1',
    '^@abis(.*)': '<rootDir>src/abis$1',
    '^@fonts(.*)': '<rootDir>src/fonts$1',
    '^@constants(.*)': '<rootDir>src/constants$1',
    '^@frame(.*)': '<rootDir>src/frame$1',
    '^@graphql(.*)': '<rootDir>src/graphql$1',
    '^@hooks(.*)': '<rootDir>src/hooks$1',
    '^@lang(.*)': '<rootDir>src/lang$1',
    '^@pages(.*)': '<rootDir>src/pages$1',
    '^@services(.*)': '<rootDir>src/services$1',
    '^@state(.*)': '<rootDir>src/state$1',
    '^@types(.*)': '<rootDir>src/types$1',
  },
};
