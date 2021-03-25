#!/bin/sh

BUCKET_URL="gs://testing-js-bundle"
VERSION=`cat package.json | jq -r '.version'`
BUILD_PATH=build/client/$VERSION

read -p "🚨 You are about to publish client v$VERSION. Press enter to continue."

gsutil -m -h "Cache-Control:no-cache, max-age=0" cp -r $BUILD_PATH $BUCKET_URL

echo "✅ Client v$VERSION uploaded to storage."
echo "🗑 Purging CDN cache..."

# Purge CDN cache so the new version is available immediately.
success=`curl -s https://client.usedevbook.com/__purge_cache?zone=526615871424790820a10de58e0359ee | jq -r '.success'`

echo "Was purge successful? $success"

