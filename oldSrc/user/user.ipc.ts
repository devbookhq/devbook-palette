import IPCService, { OnIPC, SendIPC } from '../services/ipc.service';

import { AuthInfo } from './authInfo';
import { User } from './user';

export function changeUserInMain(user?: User) {
  IPCService.send(SendIPC.ChangeUserInMain, user);
}

export function setAuthInOtherWindows(auth: AuthInfo) {
  IPCService.send(SendIPC.SetAuthInOtherWindows, auth);
}

export function handleGetAuthFromMainWindow(getAuth: () => AuthInfo) {
  IPCService.on(OnIPC.GetAuthFromMainWindow, () => setAuthInOtherWindows(getAuth()));
}

 