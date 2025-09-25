module.exports = {
  extends: [
    'react-app',
    'react-app/jest'
  ],
  rules: {
    // Disable unused variable warnings for production builds
    '@typescript-eslint/no-unused-vars': 'off',
    'react-hooks/exhaustive-deps': 'off',
    'no-loop-func': 'off',
    'no-throw-literal': 'off',
    'no-useless-escape': 'off',
    'no-empty-pattern': 'off'
  }
};
