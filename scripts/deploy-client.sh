#!/bin/sh

set -e

export ENV='staging'

while test $# -gt 0; do
  case "$1" in
    -h|--help)
      echo "Deploys the client side of Devbook into CDN. Default behavior is to deploy to the staging environment."
      echo " "
      echo "options:"
      echo "-h, --help       show brief help"
      echo "--env=prod       deploy to production"
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

BUNDLE=`git rev-parse --short HEAD` # Bundle is a hash value of the current commit.
VERSION=`cat package.json | jq -r '.version'`
BUILD_PATH=build/client/$VERSION-$BUNDLE

BUCKET_URL="gs://client-releases-staging"
# KV namespace ID for APP_CLIENT-staging.
NAMESPACE_ID="fd89f4a75738463888a9b41b64d5d105"
if [ "$ENV" = "prod" ]; then
  BUCKET_URL="gs://client-releases-prod"
  # KV namespace ID for APP_CLIENT.
  NAMESPACE_ID="6c08f450925342c3b0d066b77eedbf25"
fi

if [ -z "$CLOUDFLARE_AUTH_EMAIL" ]; then
  echo "CLOUDFLARE_AUTH_EMAIL env var is empty"
  exit 1
fi

if [ -z "$CLOUDFLARE_AUTH_KEY" ]; then
  echo "CLOUDFLARE_AUTH_KEY env var is empty"
  exit 1
fi

if [ -z "$CLOUDFLARE_ZONE_ID" ]; then
  echo "CLOUDFLARE_ZONE_ID env var is empty"
  exit 1
fi

if [ -z "$CLOUDFLARE_ACCOUNT_ID" ]; then
  echo "CLOUDFLARE_ACCOUNT_ID env var is empty"
  exit 1
fi


read -p "🚨 You are about to deploy client v$VERSION-$BUNDLE to the **$ENV** environment. Press enter to continue."

gsutil -m -h "Cache-Control:no-cache, max-age=0" rsync -r $BUILD_PATH $BUCKET_URL/$VERSION

echo "\n\n>>> ✅ Client v$VERSION $BUNDLE uploaded to storage at URL $BUCKET_URL/$VERSION."

echo "\n\n"
read -p ">>> 🗑 Will purge the CDN cache. Press enter to continue."

# Purge CDN cache so the new version is available immediately.
response=`curl "https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/purge_cache"\
  -X POST\
  -H "Content-Type: application/json"\
  -H "X-Auth-Email: $CLOUDFLARE_AUTH_EMAIL"\
  -H "X-Auth-Key: $CLOUDFLARE_AUTH_KEY"\
  -d '{"purge_everything": true}'`

echo === RESPONSE
echo $response
echo ===

success=`echo $response | jq -r '.success'`
echo "Was the cache purge successful? $success"
if [ $success = "false" ]; then
  echo "Failed to purge the cache. Exiting."
  exit 1
fi

echo "\n\n"
read -p ">>> 💾 Will save the latest bundle version to the **$ENV** environment. Pres enter to continue."

# Save the latest bundle version into KV in Cloudflare.
response=`curl "https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/storage/kv/namespaces/$NAMESPACE_ID/values/${VERSION}"\
  -X PUT\
  -H "Content-Type: text/plain"\
  -H "X-Auth-Email: $CLOUDFLARE_AUTH_EMAIL"\
  -H "X-Auth-Key: $CLOUDFLARE_AUTH_KEY"\
  --data "$BUNDLE"`

echo === RESPONSE
echo $response
echo ===

success=`echo $response | jq -r '.success'`
echo "Was the bundle update successful? $success"
if [ $success = "false" ]; then
  echo "Failed to purge the cache. Exiting."
  exit 1
fi

echo "\n\n ✅ The client v$VERSION-$BUNDLE is deployed to the **$ENV** environment"

