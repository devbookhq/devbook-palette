#!/bin/sh

VERSION=`cat package.json | jq -r '.version'`
# This is an env var that React uses to prefix all assets imports.
PUBLIC_URL=https://client.usedevbook.com/$VERSION
BUILD_PATH=build/client/$VERSION

echo "PUBLIC_URL=$PUBLIC_URL\nBUILD_PATH=$BUILD_PATH" > .env.production

echo "Building client v$VERSION with PUBLIC_URL set to '$PUBLIC_URL'"

npx craco build

echo "✅ Client build v$VERSION done"
