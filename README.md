# Devbook
The app has two parts.
- The client part. That's the frontend of the app that is done in React. Client is distributed through the CDN `https://client.usedevbook.com/<version>`. The electron part then loads it's content from this URL. The `version` in the URL must match the version of the app.
- The electron part. This is the actual app that is turned into binary format and distributed into users' machines.

## Start in dev mode
`$ npm run start`

## Bundle the client part
`$ npm run bundle:client`

## Deploy the client
`$ npm run deploy:client`

You **must** deploy the client for the new app version you want to release before you actually release the new app version to users!

## Build the electron part
This is done through ToDesktop.

`$ npm run build:electron` for unsigned build.

`$ npm run build:electron:prod` for the signed build. This is the one that is distributed to users.

## How to build

We use [ToDesktop](https://www.todesktop.com/) for building and releasing.

Run `npm run build:electron` to build macOS, Windows, and Linux versions WITHOUT CODE SIGNING. The code signing takes cca 15 minutes, so you don't want to code sign if you are just testing the build. You won't be able to release this build.

Run `npm run build:electron:prod` to build macOS, Windows, and Linux versions WITH CODE SIGNING.

## How to release

Go to https://app.todesktop.com/apps/2102273jsy18baz, and click on the "Release" button in the corresponding successful build.
