const electron = window.require('electron') as typeof import('electron');

const isEnvSet = 'ELECTRON_IS_DEV' in electron.remote.process.env;
const getFromEnv = parseInt(electron.remote.process.env.ELECTRON_IS_DEV || '0', 10) === 1;
export const app = electron.app || electron.remote.app;
export const isDev = isEnvSet ? getFromEnv : !app.isPackaged;

export const ElectronStore = electron.remote.require('electron-store') as typeof import('electron-store');
export const crypto = electron.remote.require('crypto') as typeof import('crypto');
export const querystring = electron.remote.require('querystring') as typeof import('querystring');
export const childProcess = electron.remote.require('child_process') as typeof import('child_process');
export const events = electron.remote.require('events') as typeof import('events');
export const path = electron.remote.require('path') as typeof import('path');

export function openLink(url: string) {
  return electron.shell.openExternal(url);
}

export default electron;
