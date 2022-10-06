module.exports = {
  extends: ['airbnb', 'airbnb-typescript'],
  rules: {
    // A temporary hack related to IDE not resolving correct package.json
    'import/no-extraneous-dependencies': 'off',
    'react/jsx-props-no-spreading': 'off',
    'react/require-default-props': 'off',
    'jsx-a11y/no-static-element-interactions': 'off',
    'jsx-a11y/click-events-have-key-events': 'off',
    'react/button-has-type': 'off',
    'jsx-a11y/no-noninteractive-element-interactions': 'off',
    'prefer-destructuring': 'warn',
    'react/no-this-in-sfc': 'off',
    'no-plusplus': 'off',
    'no-console': 'off',
    'object-curly-newline': 'off',
    'max-len': ['error', { code: 150 }],
  },
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
    createDefaultProgram: true,
  },
};
