# devbook

## How to set up release environment

1. Download the Apple Developer Certificate to your local machine (https://developer.apple.com/account/resources/certificates/download/4H4W828NVL).

2. Create an app specific password for the notarization process (https://support.apple.com/en-us/HT204397).

3. Add the app specific password with the command `security add-generic-password -a "vasek.mlejnsky@gmail.com" -w <app_specific_password> -s "AC_PASSWORD"`.

## How to release

Run `npm run electron:build-mac-dev` to build mac app WITHOUT NOTARIZATION. The notarization takes cca 15 minutes, so you don't want to notarize if you are just testing the build.

Run `npm run electron:build-mac` to build the NOTARIZED version of the app.

Run `npm run electron:build-linux` to build the linux app. You need to temporarily set the `name` in the `package.json` to "Devbook" so users on linux can see the app name as "Devbook", instead of "com.foundrylabs.devbook".

Run `npm run upload:mac` or `npm run upload:linux` to upload all mac or linux distributions to the bucket used for both the auto-updating and as a download source. This command also updates the `latest-mac.yml` or `latest-linux.yml`.
EVERY USER WITH APP VERSION >=0.0.2 WILL DOWNLOAD THE UPDATE RELEASED WITH THIS COMMAND!

Run `npm run release:mac` or `npm run release:linux` to build and upload the latest mac or linux app. This command also cleans up the `dist/` directory before building the app.
EVERY USER WITH APP VERSION >=0.0.2 WILL DOWNLOAD THE UPDATE RELEASED WITH THIS COMMAND!
