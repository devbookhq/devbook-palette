const remote = (window.require('electron') as typeof import('electron')).remote;

export const ElectronStore = remote.require('electron-store') as typeof import('electron-store');
export const crypto = remote.require('crypto') as typeof import('crypto');
export const querystring = remote.require('querystring') as typeof import('querystring');
