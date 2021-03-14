#!/bin/sh
DIR=$1
export BUCKET=$2

cd $DIR

ls -l ./ | tr -s ' ' | cut -d' ' -f9 |
    tr ' ' '\n' |
    xargs -n 1 -I{} gsutil -h "Cache-Control:no-cache, max-age=0" cp {} gs://$BUCKET
