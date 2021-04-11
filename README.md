# Devbook
The app has two parts.
- The client part. That's the frontend of the app that is done in React. Client is distributed through the CDN `https://client.usedevbook.com/<version>`. The electron part then loads it's content from this URL. The `version` in the URL must match the version of the app.
- The electron part. This is the actual app that is turned into binary format and distributed into users' machines.

## How to build

We use [ToDesktop](https://www.todesktop.com/) for building and releasing.

Run `npm run build:electron` to build macOS, Windows, and Linux versions WITHOUT CODE SIGNING. The code signing takes cca 15 minutes, so you don't want to code sign if you are just testing the build. You won't be able to release this build.

Run `npm run build:electron:prod` to build macOS, Windows, and Linux versions WITH CODE SIGNING.

## How to release

Go to https://app.todesktop.com/apps/2102273jsy18baz, and click on the "Release" button in the corresponding successful build.

## Local development
`npm run start`

## Deploy to staging
You must deploy the client and electron part separately.

1. Bundle client
```
npm run bundle:client:staging
```

2. Deploy client to the staging CDN
```
npm run deploy:client:staging
```

3. Build electron (unsigned build)
```
npm run build:electron:staging
```

4. Download the build from ToDesktop

## Deploy to production
You must deploy the client and electron part separately.

1. Bundle client
```
npm run bundle:client:prod
```

2. Deploy client to the production CDN
```
npm run deploy:client:prod
```

3. Build electron (signed build)
```
npm run build:electron:prod
```

4. Download the build from ToDesktop
