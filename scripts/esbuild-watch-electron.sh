#!/bin/sh

rm -rf build/electron
mkdir -p build/electron/main
cp -R src/main/assets build/electron/main/
nodemon
# tsc -p src/main -w --noEmit