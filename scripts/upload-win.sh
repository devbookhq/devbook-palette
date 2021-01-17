BUCKET=devbook-test

gsutil cp gs://$BUCKET/latest.yml gs://$BUCKET/archive/$(date +%Y-%M-%d-%H%M)-latest-mac.yml

echo Devbook-*.exe latest.yml | tr [:space:] '\n' | xargs -n 1 -I{} gsutil -h "Cache-Control:no-cache, max-age=0" cp dist/{} gs://$BUCKET
