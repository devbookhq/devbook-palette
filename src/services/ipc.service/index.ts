import ElectronService from '../electron.service';
import { IPCInvokePayload, IPCInvokeChannel, IPCInvokeReturn } from './invokeChannel';
import { IPCOnPayload, IPCOnChannel, IPCOnHandler } from './onChannel';
import { IPCSendChannel, IPCSendPayload } from './sendChannel';

export type IPCPayload = {
  [channel in IPCSendChannel | IPCInvokeChannel | IPCOnChannel]: (IPCSendPayload & IPCInvokePayload & IPCOnPayload)[channel];
}

export type IPCReturn = {
  [channel in IPCInvokeChannel]: IPCInvokeReturn[channel];
}

class IPCService {
  private constructor() { }

  static send<T extends IPCSendChannel>(channel: T, payload: IPCPayload[T]) {
    ElectronService.ipcRenderer.send(channel, payload);
  }

  static invoke<T extends IPCInvokeChannel>(channel: T, payload: IPCPayload[T]): Promise<IPCReturn[T]> {
    return ElectronService.ipcRenderer.invoke(channel, payload);
  }

  static on<T extends IPCOnChannel>(channel: T, handler: IPCOnHandler<T>) {
    return ElectronService.ipcRenderer.on(channel, handler);
  }
}

export { IPCOnChannel, IPCSendChannel, IPCInvokeChannel };
export default IPCService;
