module.exports = {
  parserOptions: {
    ecmaVersion: 2023, // You can use the appropriate ECMAScript version
    sourceType: 'module', // Specify ES module type
    ecmaFeatures: {
      jsx: true, // Enable JSX parsing
    },
  },
  settings: {
    react: {
      version: 'detect',
    },
  },

  extends: ['eslint:recommended', 'plugin:react/recommended', 'plugin:prettier/recommended'],
  plugins: ['prettier', 'simple-import-sort'],
  rules: {
    'no-unused-vars': [
      'error',
      { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' },
    ],
    'simple-import-sort/imports': 'error',
    'simple-import-sort/exports': 'error',
    'react/react-in-jsx-scope': 'off',
    'prettier/prettier': [
      'error',
      {
        endOfLine: 'auto',
        'no-trailing-spaces': 'off',
      },
    ],
    'react/prop-types': 'error',
    'no-trailing-spaces': 'off',
    'no-debugger': 'off',
    'no-undef': 'off',
    'no-console': ['error', { allow: ['warn', 'log', 'error'] }],
    'no-extra-boolean-cast': 0,
    'no-unsafe-optional-chaining': 'error',
  },
};
