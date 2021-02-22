const remote = (window.require('electron') as typeof import('electron')).remote;

export const { app } = remote.require('electron') as typeof import('electron');
export const { fork } = remote.require('child_process') as typeof import('child_process');
export const { EventEmitter } = remote.require('events') as typeof import('events');
export const path = remote.require('path') as typeof import('path');
