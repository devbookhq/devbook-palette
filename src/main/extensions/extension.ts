import { fork, ChildProcess } from 'child_process';
import { EventEmitter } from 'events';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

import {
  ExtensionRequestType,
  ExtensionStatus,
  FromExtensionMessage,
  ExtensionMessageType,
  ResponseMessage,
  StatusMessage,
  RequestMessage,
  RequestDataMap,
  ResponseDataMap,
} from './message';

interface StatusListener<D> {
  (message: StatusMessage<D>): void;
}

export class Extension {
  private extensionProcess: ChildProcess;
  private statusEmitter = new EventEmitter();
  private isExtensionProcessReady = false;

  public get isReady() {
    return this.isExtensionProcessReady && this.isActive;
  }

  public get isActive() {
    return !this.extensionProcess.killed;
  }

  private onStatus<D>(status: ExtensionStatus, listener: StatusListener<D>) {
    this.statusEmitter.on(status, listener);
  }

  private removeOnStatus<D = unknown>(status: ExtensionStatus, listener: StatusListener<D>) {
    this.statusEmitter.off(status, listener);
  }

  public onceExit(listener: StatusListener<undefined>) {
    if (this.isReady) {
      listener({
        type: ExtensionMessageType.Status,
        status: ExtensionStatus.Exit,
        data: undefined,
      });
      return;
    }
    const onceListener = (message: StatusMessage<undefined>) => {
      this.removeOnStatus(ExtensionStatus.Exit, onceListener);
      listener(message);
    }
    this.onStatus(ExtensionStatus.Exit, onceListener);
  }

  public onceReady(listener: StatusListener<undefined>) {
    if (this.isReady) {
      listener({
        type: ExtensionMessageType.Status,
        status: ExtensionStatus.Ready,
        data: undefined,
      });
      return;
    }
    const onceListener = (message: StatusMessage<undefined>) => {
      this.removeOnStatus(ExtensionStatus.Ready, onceListener);
      listener(message);
    }
    this.onStatus(ExtensionStatus.Ready, onceListener);
  }

  public async processQuery(query: string) {
    const requestType = ExtensionRequestType.Query;

    type RequestDataType = RequestDataMap[typeof requestType];
    type ResponseDataType = ResponseDataMap[typeof requestType];

    const result = await this.handleRequest<RequestDataType, ResponseDataType>({
      requestType: ExtensionRequestType.Query,
      data: { query },
    });
    return result;
  }

  public constructor(public extensionID: string) {
    // TODO: Change this to reflect handle the path in the non-dev version too.
    const extensionProcessPath = path.resolve('./build/main/extensions/extensionProcess/index.js');
    const extensionModulePath = path.join('lib', 'extensions', extensionID, 'src');

    this.extensionProcess = fork(extensionProcessPath, undefined, {
      // stdio: ['ignore', 'ignore', 'ignore', 'ipc'],
      stdio: ['inherit', 'inherit', 'inherit', 'ipc'],
      env: {
        ...process.env,
        EXTENSION_ID: extensionID,
        EXTENSION_MODULE_PATH: extensionModulePath,
        ELECTRON_RUN_AS_NODE: '1',
      },
      detached: (process.platform === 'win32'),
    });

    this.extensionProcess.on('message', <D>(message: FromExtensionMessage<D>) => {
      if (message.type === ExtensionMessageType.Status) this.statusEmitter.emit(message.status, message);
    });

    this.onceReady(() => {
      this.isExtensionProcessReady = true;
    });

    this.onceExit(() => {
      this.terminate();
    });
  }

  public terminate() {
    this.extensionProcess.kill();
  }

  private hookIPC<D>(id: string) {
    return new Promise<ResponseMessage<D>>((resolve, reject) => {
      const ipcHandle = (message: FromExtensionMessage<D>) => {
        if (message.type === ExtensionMessageType.Status || message.type === ExtensionMessageType.ErrorStatus) return;
        if (message.id === id) {
          this.extensionProcess.off('message', ipcHandle);
          switch (message.type) {
            case ExtensionMessageType.Response:
              return resolve(message);
            case ExtensionMessageType.ErrorResponse:
              return reject(message.error);
          }
        }
      }
      this.extensionProcess.on('message', ipcHandle);
    });
  }

  private async handleRequest<I, O>(requestOptions: Pick<RequestMessage<I>, 'data' | 'requestType'>) {
    if (!this.isActive) {
      throw new Error(`Extension "${this.extensionID}" is not running`);
    }
    const id = uuidv4();

    const responsePromise = this.hookIPC<O>(id);

    const request: RequestMessage<I> = {
      ...requestOptions,
      type: ExtensionMessageType.Request,
      id,
    };

    this.extensionProcess.send(request);
    return (await responsePromise).data;
  }
}
