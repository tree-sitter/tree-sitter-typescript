import treesitter from 'eslint-config-treesitter';

export default [
  ...treesitter,
  {
    files: ['**/*.mjs'],
    languageOptions: {
      globals: {
        rule: 'readonly',
        seq: 'readonly',
        choice: 'readonly',
        repeat: 'readonly',
        repeat1: 'readonly',
        optional: 'readonly',
        prec: 'readonly',
        token: 'readonly',
        alias: 'readonly',
        field: 'readonly',
        reserved: 'readonly',
      },
    },
    rules: {
      'no-undef': 'error',
      'one-var': 'off',
    },
  },
];
