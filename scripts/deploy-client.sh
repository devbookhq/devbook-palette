#!/bin/sh

BUNDLE=$1
BUCKET_URL="gs://testing-js-bundle"
VERSION=`cat package.json | jq -r '.version'`
BUILD_PATH=build/client/$VERSION-$BUNDLE

read -p "🚨 You are about to publish client v$VERSION-$BUNDLE. Press enter to continue."

gsutil -m -h "Cache-Control:no-cache, max-age=0" cp -r $BUILD_PATH/ $BUCKET_URL/$VERSION

echo "✅ Client v$VERSION uploaded to storage."

echo "🗑 Purging CDN cache..."

# Purge CDN cache so the new version is available immediately.
success=`curl -s https://client.usedevbook.com/__purge_cache?zone=526615871424790820a10de58e0359ee | jq -r '.success'`

echo "Was purge successful? $success"

echo "💾 Saving the latest bundle version..."

# Save the latest bundle version into KV in Cloudflare.
curl -X PUT -H "Content-Type: application/json" -d '{"version":"'$VERSION'", "bundle":"'$BUNDLE'"}' https://client.usedevbook.com/__latest-bundle


