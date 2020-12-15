# devbook

## How to set up release environment

1. Download the Apple Developer Certificate to your local machine (https://support.staffbase.com/hc/en-us/articles/115003458931-Creating-the-iOS-Distribution-Certificate). Start with the step "Preparing the Signing of the Certificate" - there is already an existing certificate created online.

2. Create an app specific password for the notarization process (https://support.apple.com/en-us/HT204397).

3. Save the app specific password with the command `security add-generic-password -a "vasek.mlejnsky@gmail.com" -w <app_specific_password> -s "AC_PASSWORD"`.

## How to release

Run `npm run electron:build-dev` to build the app WITHOUT NOTARIZATION. The notarization takes cca 15 minutes, so you don't want to notarize if you are just testing the build.

Run `npm run electron:build` if you want to build the NOTARIZED version of the app.

Run `npm run release` if you want to build the notarized app and upload it to the bucket used for both the auto-updating and as a download source. This command also cleans up the `dist/` directory before building the app.
EVERY USER WITH APP VERSION >=0.0.2 WILL DOWNLOAD THE UPDATE RELEASED WITH THIS COMMAND!

## Notes
You have to manually update download links on the landing page after the release. In theory, user can download any app with version >= 0.0.2 and it will auto-update itself to the latest version, but we still should set up a proxy link that points to the latest release.
