// @ts-check
import config from 'eslint-config-agent'
import publishablePackageJson from 'eslint-config-publishable-package-json'

export default [
  ...config,
  publishablePackageJson,
  {
    ignores: [
      '**/dist/**',
      '**/node_modules/**',
      '**/*.config.js',
      '**/*.config.ts',
      'example.js',
    ],
  },
]
