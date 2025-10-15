// @ts-check
import config from 'eslint-config-agent';

export default [
  ...config,
  {
    ignores: [
      '**/dist/**',
      '**/node_modules/**',
    ],
  },
];