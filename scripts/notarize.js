const { notarize } = require('electron-notarize');

exports.default = async function notarizing(context) {
  const { electronPlatformName, appOutDir } = context;
  if (electronPlatformName !== 'darwin') {
    return;
  }

  if (process.env.NOTARIZATION === 'none') {
    return;
  }

  const appleID = 'vasek.mlejnsky@gmail.com';
  const appName = context.packager.appInfo.productFilename;

  return await notarize({
    appBundleId: 'com.foundrylabs.devbook',
    appPath: `${appOutDir}/${appName}.app`,
    appleId: appleID,
    appleIdPassword: `@keychain:AC_PASSWORD`,
  });
};
