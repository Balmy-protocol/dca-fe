module.exports = {
  plugins: ['@typescript-eslint', 'eslint-comments', 'jest', 'promise', 'formatjs'],
  extends: [
    'airbnb-typescript',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'plugin:eslint-comments/recommended',
    'plugin:jest/recommended',
    'plugin:promise/recommended',
    'prettier',
  ],
  env: {
    node: true,
    browser: true,
    jest: true,
  },
  parserOptions: {
    project: './tsconfig.json',
  },
  rules: {
    // Too restrictive, writing ugly code to defend against a very unlikely scenario: https://eslint.org/docs/rules/no-prototype-builtins
    'no-prototype-builtins': 'off',
    'react/jsx-props-no-spreading': 'off',
    'react/destructuring-assignment': ['error'],
    // No jsx extension: https://github.com/facebook/create-react-app/issues/87#issuecomment-234627904
    'react/jsx-filename-extension': ['error'],
    // Use function hoisting to improve code readability
    'no-use-before-define': ['error'],
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    'react/no-array-index-key': 'off',
    'import/prefer-default-export': 'off',
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
  },
  overrides: [
    {
      files: ['*.js'],
      rules: {
        // Allow `require()`
        '@typescript-eslint/no-var-requires': 'off',
      },
    },
  ],
};
