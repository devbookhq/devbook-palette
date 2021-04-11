import { ipcMain, BrowserWindow } from 'electron';

import { IPCInvokeChannel, IPCInvokeHandler } from 'services/ipc.service/invokeChannel';
import { IPCOnChannel, IPCOnPayload } from 'services/ipc.service/onChannel';
import { IPCSendChannel, IPCSendHandler } from 'services/ipc.service/sendChannel';

class MainIPCService {
  private constructor() { }

  static send<T extends IPCOnChannel>(channel: T, window: BrowserWindow | undefined, payload: IPCOnPayload[T]) {
    window?.webContents.send(channel, payload);
  }

  static handle<T extends IPCInvokeChannel>(channel: T, handler: IPCInvokeHandler<T>) {
    ipcMain.handle(channel, handler);
  }

  static on<T extends IPCSendChannel>(channel: T, handler: IPCSendHandler<T>) {
    ipcMain.on(channel, handler);
  }
}

export { IPCInvokeChannel, IPCSendChannel, IPCOnChannel };
export default MainIPCService;
