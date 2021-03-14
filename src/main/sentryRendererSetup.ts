// Each renderer process must initialize Sentry.
// We keep the initializastion in a separated module so it's consisten accross all renderers.
// Example:
// mainWindow = new BrowserWindow({
//   width: 800,
//   height: 600,
//   webPreferences: {
//     preload: path.join(__dirname, "sentry.js"), <----------
//   },
// });
//
import * as Sentry from '@sentry/electron';
Sentry.init({ dsn: 'https://221c1ac06401489f805ea5e7ae41ac3e@o551516.ingest.sentry.io/5675033' });

