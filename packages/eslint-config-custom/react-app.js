require('@rushstack/eslint-patch/modern-module-resolution');

const { resolve } = require('node:path');

const project = resolve(process.cwd(), 'tsconfig.json');

module.exports = {
  extends: ['./base'],
  extends: [
    // 'airbnb',
    'plugin:import/recommended',
    'plugin:eslint-comments/recommended',
    'plugin:promise/recommended',
    'plugin:jest/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:react/recommended',
    'airbnb-typescript',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'prettier',
  ],
  plugins: ['formatjs'],
  parserOptions: {
    project,
  },
  globals: {
    JSX: true,
  },
  settings: {
    'import/resolver': {
      typescript: {
        project,
      },
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      },
    },
    react: {
      version: 'detect', // React version. "detect" automatically picks the version you have installed.
    },
  },
  root: true,
  env: {
    node: true,
    browser: true,
    jest: true,
  },
  ignorePatterns: ['node_modules/', 'dist/', '.eslintrc.js', '**/*.css', 'turbo/'],
  // add rules configurations here
  rules: {
    'react-hooks/rules-of-hooks': 'off',
    'react-hooks/exhaustive-deps': 'off',
    'react/jsx-props-no-spreading': 'off',
    'react/destructuring-assignment': ['error'],
    // No jsx extension: https://github.com/facebook/create-react-app/issues/87#issuecomment-234627904
    'react/jsx-filename-extension': ['error'],
    // Use function hoisting to improve code readability
    'no-use-before-define': ['error'],
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': ['error'],
    'react/no-array-index-key': 'off',
    'import/prefer-default-export': 'off',
    '@typescript-eslint/no-unused-vars': ['error'],
    '@typescript-eslint/no-use-before-define': [
      'error',
      { functions: false, classes: true, variables: true, typedefs: true },
    ],
    'no-use-before-define': 'off',
    '@typescript-eslint/no-use-before-define': ['error'],
    'formatjs/no-offset': 'error',
    'react/require-default-props': 'off',
    // doesnt make sense to keep this active while we have ts
    'react/prop-types': 'off',
    'class-methods-use-this': 'off',
    'no-console': ['error', { allow: ['warn', 'error'] }],
    'eslint-comments/no-unlimited-disable': 'off',
    'no-param-reassign': ['error', { props: true, ignorePropertyModificationsFor: ['state'] }],
    'import/no-extraneous-dependencies': [
      'error',
      {
        peerDependencies: true,
      },
    ],
    '@typescript-eslint/no-misused-promises': ['error', { checksVoidReturn: false }],
    '@typescript-eslint/no-duplicate-enum-values': 'off',
    'react/display-name': 'off',
    'promise/catch-or-return': ['error', { allowFinally: true }],
  },
  overrides: [
    {
      files: ['*.spec.ts', '*.spec.js', '*.spec.tsx', '*.spec.jsx'],
      rules: {
        '@typescript-eslint/unbound-method': 'off',
      },
    },
  ],
};
