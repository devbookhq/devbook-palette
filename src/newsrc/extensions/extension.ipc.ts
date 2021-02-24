import electron from '../electronRemote';
import { IPCMessage } from '../../mainCommunication/ipc';

export function registerExtensionProcess(pid: number) {
  electron.ipcRenderer.send(IPCMessage.RegisterExtensionProcess, pid);
}

export function unregisterExtensionProcess(pid: number) {
  electron.ipcRenderer.send(IPCMessage.UnregisterExtensionProcess, pid);
}

export function killAllExtensionProcesses() {
  electron.ipcRenderer.send(IPCMessage.KillAllExtensionProcesses);
}

export function killExtensionProcess(pid: number) {
  electron.ipcRenderer.send(IPCMessage.KillExtensionProcess, pid);
}
