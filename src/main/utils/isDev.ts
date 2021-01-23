import * as electron from 'electron';

if (typeof electron === 'string' || electron instanceof String) {
  throw new TypeError('Not running in an Electron environment!');
}

const app = electron.app || electron.remote.app;

const isEnvSet = 'ELECTRON_IS_DEV' in process.env;
const getFromEnv = parseInt(process.env.ELECTRON_IS_DEV || '0', 10) === 1;

const isDev = isEnvSet ? getFromEnv : !app.isPackaged;

export default isDev;

