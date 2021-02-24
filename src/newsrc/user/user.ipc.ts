import electron from '../electronRemote';
import { IPCMessage } from '../../mainCommunication/ipc';

import { AuthInfo } from './authInfo';
import { User } from './user';

export function changeUserInMain(user?: User) {
  electron.ipcRenderer.send(IPCMessage.ChangeUserInMain, user);
}

export function setAuthInOtherWindows(auth: AuthInfo) {
  electron.ipcRenderer.send(IPCMessage.SetAuthInOtherWindows, auth);
}

export function handleGetAuthFromMainWindow(getAuth: () => AuthInfo) {
  electron.ipcRenderer.on(IPCMessage.GetAuthFromMainWindow, () => setAuthInOtherWindows(getAuth()));
}
