#!/bin/sh

rm -rf build/electron
mkdir -p build/electron/main
cp -R src/main/assets build/electron/main/
./scripts/esbuild.js --watch --noMinify

# Uncomment this line to lint TypeScript errors
# tsc -p src/main -w --noEmit
