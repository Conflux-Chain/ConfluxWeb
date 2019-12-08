module.exports = {
  env: {
    commonjs: true,
    es6: true,
    node: true,
    jest: true,
  },
  extends: 'airbnb-base',
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  parserOptions: {
    ecmaVersion: 2018,
  },
  rules: {
    'arrow-parens': ['error', 'as-needed', { 'requireForBlockBody': true }],
    'class-methods-use-this': 0,
    'func-names': 0, // for type format
    'function-paren-newline': 0,
    'linebreak-style': 0, // for windows and mac
    'max-classes-per-file': 0,
    'max-len': 0, // for jsdoc
    'no-await-in-loop': 0, // for loop request
    'no-else-return': 0,
    'no-param-reassign': 0, // for type format
    'no-underscore-dangle': 0, // for private attribute
    'object-curly-newline': 0,
    'operator-linebreak': 0, // for `'string' +\n`
    'prefer-destructuring': 0,
    'radix': 0, // for simplicity `parseInt`
    'yoda': 0, // for `min < number && number < max`
  },
};
