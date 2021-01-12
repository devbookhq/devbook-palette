const electron = window.require('electron') as typeof import('electron');

export const crypto = electron.remote.require('crypto') as typeof import('crypto');
export const querystring = electron.remote.require('querystring') as typeof import('querystring');

export default electron;
