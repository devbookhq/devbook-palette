#!/bin/sh

VERSION=`cat package.json | jq -r '.version'`
# This is an env var that React uses to prefix all assets imports.
PUBLIC_URL=https://client.usedevbook.com/$VERSION
BUNDLE=`openssl rand -hex 6`
BUILD_PATH=build/client/$VERSION-$BUNDLE

rm -rf build/client

echo "PUBLIC_URL=$PUBLIC_URL\nBUILD_PATH=$BUILD_PATH\nREACT_APP_BUNDLE=$BUNDLE\nREACT_APP_VERSION=$VERSION"> .env.production

echo "Bundling client v$VERSIO-$BUNDLE with PUBLIC_URL set to '$PUBLIC_URL'..."

npx craco build

echo "✅ Client  bundle v$VERSION-$BUNDLE done"
