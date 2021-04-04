// We are not using path aliases here, because when we import this file from the main the aliases stop working.
import { StorageKey, StorageValue } from '../sync.service/storage';
export type IPCInvokeHandler<T extends IPCInvokeChannel> = (event: Electron.IpcMainInvokeEvent, payload: IPCInvokePayload[T]) => (Promise<IPCInvokeReturn[T]> | IPCInvokeReturn[T]);

export enum IPCInvokeChannel {
  UpdateStatus = 'UpdateStatus',
  StorageGet = 'StorageGet',
}

export type IPCInvokePayload = {
  [IPCInvokeChannel.UpdateStatus]: void;
  [IPCInvokeChannel.StorageGet]: { key: StorageKey };
}

export type IPCInvokeReturn<T extends StorageKey = StorageKey> = {
  [IPCInvokeChannel.UpdateStatus]: boolean;
  [IPCInvokeChannel.StorageGet]: { value: StorageValue[T] };
}
