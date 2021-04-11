#!/usr/bin/env node

const esbuild = require('esbuild');
const { nodeExternalsPlugin } = require('esbuild-node-externals');

const watch = process.argv.includes('--watch');
const noMinify = process.argv.includes('--noMinify');
const passedEnv = process.argv.find(i => i.startsWith('--env=')).slice(6);

const EnvType = {
  prod: 'prod',
  staging: 'staging',
  dev: 'dev'
};

let ENVIRONMENT = EnvType.dev;
if (passedEnv === EnvType.prod || passedEnv === EnvType.staging) {
  ENVIRONMENT = passedEnv;
} 

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
  define: {
    ENVIRONMENT: `"${ENVIRONMENT}"`,
  },
  watch,
  plugins: [
    nodeExternalsPlugin({
      packagePath: './package.json',
    }),
  ],
});
