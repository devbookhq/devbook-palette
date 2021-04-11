#!/bin/sh

set -e

export WATCH=''
export MINIFY=''
export ENV='dev'

while test $# -gt 0; do
  case "$1" in
    -h|--help)
      echo "Bundles the electron part of Devbook."
      echo " "
      echo "options:"
      echo "-h, --help                                  show brief help"
      echo "--watch=[true | false (default)]            watch files"
      echo "--minify=[true (default) | false]           minify files"
      echo "--env=[dev (default) | staging | prod]      bundle with prod config"
      exit 0
      ;;
    --watch*)
      export val=`echo $1 | sed -e 's/^[^=]*=//g'`
      if [ $val = "true" ]; then
          WATCH='--watch'
      fi
      shift
      ;;
    --minify*)
      export val=`echo $1 | sed -e 's/^[^=]*=//g'`
      echo $val
      if [ $val = "false" ]; then
          MINIFY='--noMinify'
      fi
      shift
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

rm -rf build/electron
mkdir -p build/electron/main
cp -R src/main/assets build/electron/main/

./scripts/esbuild.js --env=$ENV $WATCH $MINIFY

