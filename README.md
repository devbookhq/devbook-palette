# devbook

## How to set up release environment

1. Download Apple Developer Certificate to your local machine (https://support.staffbase.com/hc/en-us/articles/115003458931-Creating-the-iOS-Distribution-Certificate)
   Start with the step "Preparing the Signing of the Certificate" - there is already an existing certificate created online

2. Create app specific password for the notarization process (https://support.apple.com/en-us/HT204397)

3. Save the app specific password with the command `security add-generic-password -a "vasek.mlejnsky@gmail.com" -w <app_specific_password> -s "AC_PASSWORD"`

## How to release

Run `npm run electron:build-dev` to build the app without notarization. The notarization takes cca 15 minutes, so you want to do this when you are just testing the build.

Run `npm run electron:build` if you want to test the notarized version of the app.

Run `npm run release` if you want to build and upload the notarized app to the bucket. This command also cleans up the `dist/` directory before building the app.
EVERY USER WITH APP VERSION >=0.0.2 WILL DOWNLOAD THIS UPDATE!
