import rootConfig from '../../eslint.config.mjs';

export default [
  ...rootConfig,
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      // Plugin-specific rule overrides can go here
    },
  },
];
