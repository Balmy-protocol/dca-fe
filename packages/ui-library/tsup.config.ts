import type { Options } from 'tsup';
// @ts-expect-error no types for esbuild-plugin-babel
import babel from 'esbuild-plugin-babel';

const env = process.env.NODE_ENV;

export const tsup: Options = {
  splitting: true,
  clean: true, // clean up the dist folder
  dts: true, // generate dts files
  // treeshake: true,
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  esbuildPlugins: [babel()],
  format: ['cjs', 'esm'], // generate cjs and esm files
  minify: env === 'production',
  bundle: env === 'production',
  skipNodeModulesBundle: true,
  watch: env === 'development',
  target: 'es2020',
  outDir: 'dist',
  entry: ['src/**/*.tsx', 'src/**/*.ts', '!(src/**/*.stories.tsx)'], //include all files under src, exclude stories
  external: ['react'],
};
