module.exports = {
  /**
   * **`env` exists so `no-undef` can.**
   *
   * There was no `env` block, which is the whole reason `no-undef` is `'off'` below: with no
   * declared environment every `window`, `document`, `describe` and `Promise` in the project is
   * an undefined variable, so the rule was unusable and switching it off was the only option.
   * That left a real hole — a deleted helper with one surviving call site lints clean, builds
   * clean, passes a pure-function test suite, and throws `ReferenceError` from the middle of a
   * render. It has now cost one blank screen.
   *
   * Declaring the environments costs nothing on its own and makes the rule available. It is
   * turned on for the harmonize workspace in `overrides` rather than repo-wide, because a
   * repo-wide switch surfaces about twenty existing references in eight files — some of them
   * genuinely missing imports — and fixing those is its own piece of work rather than a side
   * effect of this one.
   */
  env: {
    browser: true,
    node: true,
    es2023: true,
    jest: true,
  },
  globals: {
    /* The Maps SDK, attached to `window` by a script tag and read as a bare global. */
    google: 'readonly',
  },
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
  overrides: [
    {
      /**
       * The harmonize surfaces, with `no-undef` on.
       *
       * This is the most-edited region of the app and the one whose components are large enough
       * that a deleted helper can leave a live call site behind — which is exactly what
       * happened, and what `no-undef` catches for free now that `env` is declared. Clean at the
       * time of writing, so it is a ratchet rather than a backlog.
       *
       * **All three shells, not just the workspace.** The glob was
       * `components/harmonize/**` alone, which is one of three sibling directories, and the
       * gap cost a blank screen: `harmonizeSplit/index.jsx` grew a reference to a bare
       * `range` that the component never destructured off its hook. `vite build` passed it
       * (an undeclared identifier is legal JavaScript until it runs) and so did eslint, and
       * it threw `ReferenceError: range is not defined` on first render — the precise failure
       * mode this override exists for, in the directory next door to the one it covered.
       *
       * Scoped rather than global for the reason given at the top of this file: repo-wide it
       * finds ~20 references in eight files that want looking at individually.
       */
      files: ['src/app/obx/pages/schedules/components/harmonize*/**/*.{js,jsx}'],
      rules: { 'no-undef': 'error' },
    },
  ],
};
