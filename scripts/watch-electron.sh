#!/bin/sh

rm -rf build/electron
cp -R src/main/assets build/electron/main/
tsc -p src/main -w

