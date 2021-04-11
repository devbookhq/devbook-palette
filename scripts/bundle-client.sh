#!/bin/sh

set -e

export ENV='dev'

while test $# -gt 0; do
  case "$1" in
    -h|--help)
      echo "Bundles the client side of Devbook into CDN. Default behavior is to set the PUBLIC_URL react variable to the Devbook's staging CDN."
      echo " "
      echo "options:"
      echo "-h, --help       show brief help"
      echo "--env=prod       create a bundle with PUBLIC_URL set to the production CDN"
      exit 0
      ;;
    --env*)
      export ENV=`echo $1 | sed -e 's/^[^=]*=//g'`
      shift
      ;;
    *)
      break
      ;;
  esac
done

VERSION=`cat package.json | jq -r '.version'`
BUNDLE=`git rev-parse --short HEAD` # Bundle is a hash value of the current commit.
BUILD_PATH=build/client/$VERSION-$BUNDLE

PUBLIC_URL=https://client-staging.usedevbook.com/$VERSION # This is an env var that React uses to prefix all assets imports.
CLIENT_URL=https://client-staging.usedevbook.com
if [ "$ENV" = "prod" ]; then
    PUBLIC_URL=https://client.usedevbook.com/$VERSION # This is an env var that React uses to prefix all assets imports.
    CLIENT_URL=https://client.usedevbook.com
fi

rm -rf build/client

echo "PUBLIC_URL=$PUBLIC_URL\nBUILD_PATH=$BUILD_PATH\nREACT_APP_BUNDLE=$BUNDLE\nREACT_APP_VERSION=$VERSION\nREACT_APP_CLIENT_URL=$CLIENT_URL\nREACT_APP_ENVIRONMENT=$ENV"> .env.production

echo "Bundling client (**$ENV** mode) v$VERSION-$BUNDLE with PUBLIC_URL set to '$PUBLIC_URL'..."

npx craco build

echo "✅ Client  bundle v$VERSION-$BUNDLE done (**$ENV** mode)"
