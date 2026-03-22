import antfu from '@antfu/eslint-config'

export default antfu(
  {
    type: 'lib',
    stylistic: false,
    formatters: false,
    ignores: [
      '**/dist/**',
      '**/coverage/**',
      '**/.turbo/**',
      '**/node_modules/**',
    ],
  },
  {
    rules: {
      'jsonc/sort-keys': 'off',
    },
  },
  {
    files: ['**/*.ts'],
    rules: {
      'antfu/no-top-level-await': 'off',
      'node/prefer-global/process': 'off',
      'ts/no-redeclare': 'off',
    },
  },
)
