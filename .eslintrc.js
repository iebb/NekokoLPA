/**
 * Self-contained ESLint config.
 *
 * We deliberately do NOT `extends: '@react-native'`: that shared config pulls in
 * eslint-plugin-jest and @typescript-eslint/eslint-plugin, which only exist
 * nested under the shared config and are therefore unresolvable from here under
 * ESLint 8's eslintrc plugin resolution. Since this project has no test suite,
 * we compose the rules that actually matter from the plugins that are already
 * installed at the top level, keeping the dependency footprint small.
 */
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    ecmaFeatures: {jsx: true},
  },
  env: {
    es2022: true,
    node: true,
  },
  plugins: ['react', 'react-hooks', 'react-native', 'eslint-comments'],
  extends: ['eslint:recommended', 'plugin:react/recommended', 'prettier'],
  settings: {
    react: {version: 'detect'},
  },
  globals: {
    __DEV__: 'readonly',
    fetch: 'readonly',
    console: 'readonly',
    setTimeout: 'readonly',
    clearTimeout: 'readonly',
    setInterval: 'readonly',
    clearInterval: 'readonly',
    require: 'readonly',
    module: 'writable',
    atob: 'readonly',
    btoa: 'readonly',
    TextEncoder: 'readonly',
    Intl: 'readonly',
  },
  ignorePatterns: [
    'node_modules/',
    'android/',
    'ios/',
    'output/',
    'variants/',
    '_vendor/',
    'src/native/jsnative/web.out.js', // generated emscripten bundle
    'src/lpa/bridge/web.out.js',
  ],
  rules: {
    // Hooks correctness — these catch real bugs, so they are errors.
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',

    // React 17+ JSX transform: no need to have React in scope.
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    'react/display-name': 'off',

    'react-native/no-single-element-style-arrays': 'warn',

    'eslint-comments/no-unused-disable': 'warn',

    // Unused-variable analysis is delegated to tsc (noUnusedLocals /
    // noUnusedParameters), which understands type-only bindings.
    'no-unused-vars': 'off',
    // TS handles undefined identifiers; the base rule misfires on type names.
    'no-undef': 'off',

    'no-console': ['warn', {allow: ['warn', 'error']}],
    eqeqeq: ['warn', 'smart'],
    'no-var': 'error',
    'prefer-const': 'warn',
    'no-empty': ['warn', {allowEmptyCatch: true}],
  },
};
