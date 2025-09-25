module.exports = {
  extends: [
    'react-app',
    'react-app/jest'
  ],
  rules: {
    // Disable unused variable warnings for production builds
    '@typescript-eslint/no-unused-vars': 'warn',
    'react-hooks/exhaustive-deps': 'warn',
    'no-loop-func': 'warn',
    'no-throw-literal': 'warn',
    'no-useless-escape': 'warn',
    'no-empty-pattern': 'warn'
  },
  overrides: [
    {
      files: ['**/*.ts', '**/*.tsx'],
      rules: {
        // Allow unused variables in production builds
        '@typescript-eslint/no-unused-vars': 'warn'
      }
    }
  ]
};
