import parser from '@babel/eslint-parser';
import security from 'eslint-plugin-security';

export default [
  {
    ...security.configs.recommended,
    files: ['src/**/*.ts'],
    languageOptions: {
      parser,
      parserOptions: {
        requireConfigFile: false,
        babelOptions: {
          babelrc: false,
          configFile: false,
          parserOpts: { plugins: ['typescript'] },
        },
      },
    },
  },
];
