module.exports = {
  root: true,
  env: {
    node: true
  },
  extends: ['plugin:vue/essential', '@vue/prettier'],
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-undef': 'error',
    'no-unused-vars': 'warn',
    'no-else-return': 'warn'
  },
  parserOptions: {
    parser: 'babel-eslint'
  }
}
