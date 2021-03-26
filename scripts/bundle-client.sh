#!/bin/sh

VERSION=`cat package.json | jq -r '.version'`
PUBLIC_URL=https://client.usedevbook.com/$VERSION # This is an env var that React uses to prefix all assets imports.
BUNDLE=`git rev-parse --short HEAD` # Bundle is a hash value of the current commit.
BUILD_PATH=build/client/$VERSION-$BUNDLE

rm -rf build/client

echo "PUBLIC_URL=$PUBLIC_URL\nBUILD_PATH=$BUILD_PATH\nREACT_APP_BUNDLE=$BUNDLE\nREACT_APP_VERSION=$VERSION"> .env.production

echo "Bundling client v$VERSION-$BUNDLE with PUBLIC_URL set to '$PUBLIC_URL'..."

npx craco build

echo "✅ Client  bundle v$VERSION-$BUNDLE done"

