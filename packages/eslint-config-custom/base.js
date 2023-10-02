require('@rushstack/eslint-patch/modern-module-resolution');

module.exports = {
  root: true,
  ignorePatterns: ['node_modules/', 'dist/', '.eslintrc.js', '**/*.css', 'turbo/', 'tsup.config.ts'],
};
