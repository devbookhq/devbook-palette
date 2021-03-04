# devbook

## How to build

We use [ToDesktop](https://www.todesktop.com/) for building and releasing. 

Run `npm run build:dev` to build macOS, Windows, and Linux versions WITHOUT CODE SIGNING. The code signing takes cca 15 minutes, so you don't want to code sign if you are just testing the build. You won't be able to release this build.

Run `npm run build:prod` to build macOS, Windows, and Linux versions WITH CODE SIGNING.

## How to release

Go to https://app.todesktop.com/apps/2102273jsy18baz, and click on the "Release" button in the corresponding successful build. 
