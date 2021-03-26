#!/bin/sh

set -e

BUNDLE=`git rev-parse --short HEAD` # Bundle is a hash value of the current commit.
BUCKET_URL="gs://testing-js-bundle"
VERSION=`cat package.json | jq -r '.version'`
BUILD_PATH=build/client/$VERSION-$BUNDLE

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


read -p "🚨 You are about to publish client v$VERSION-$BUNDLE. Press enter to continue."

gsutil -m -h "Cache-Control:no-cache, max-age=0" cp -r $BUILD_PATH/ $BUCKET_URL/$VERSION

echo "✅ Client v$VERSION -$BUNDLE uploaded to storage at URL $BUCKET_URL/$VERSION."

echo "🗑 Purging CDN cache..."

# Purge CDN cache so the new version is available immediately.
success=`curl "https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/purge_cache"\
  -X POST\
  -H "Content-Type: application/json"\
  -H "X-Auth-Email: $CLOUDFLARE_AUTH_EMAIL"\
  -H "X-Auth-Key: $CLOUDFLARE_AUTH_KEY"\
  -d '{"purge_everything": true}' | jq -r '.success'`

echo "Was purge successful? $success"
if [ $success = "false" ]; then
  exit 1
fi

echo "💾 Saving the latest bundle version..."

# Save the latest bundle version into KV in Cloudflare.
NAMESPACE_ID="6c08f450925342c3b0d066b77eedbf25"
curl "https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/storage/kv/namespaces/$NAMESPACE_ID/values/${VERSION}"\
  -X PUT\
  -H "Content-Type: text/plain"\
  -H "X-Auth-Email: $CLOUDFLARE_AUTH_EMAIL"\
  -H "X-Auth-Key: $CLOUDFLARE_AUTH_KEY"\
  --data "$BUNDLE"


