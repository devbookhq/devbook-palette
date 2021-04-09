#!/usr/bin/env node

const esbuild = require('esbuild');
const { nodeExternalsPlugin } = require('esbuild-node-externals');

const watch = process.argv.includes('--watch');
const noMinify = process.argv.includes('--noMinify');

esbuild.build({
  target: 'node14',
  tsconfig: './src/main/tsconfig.json',
  platform: 'node',
  outdir: 'build/electron/main',
  minify: !noMinify,
  bundle: true,
  entryPoints: ['./src/main/index.ts'],
  sourcemap: true,
  loader: {
    '.ts': 'ts'
  },
  watch,
  plugins: [
    nodeExternalsPlugin({
      packagePath: './package.json',
    }),
  ],
});
