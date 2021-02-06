import { fork, ChildProcess } from 'child_process';
import { EventEmitter } from 'events';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import isDev from '../utils/isDev';
import { app } from 'electron';

import {
  Input,
  Status,
  FromExtensionMessage,
  Message,
  OutputMessage,
  StatusMessage,
  InputMessage,
  InputData,
  OutputData,
} from '@devbookhq/extension';

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

  private onStatus<D>(status: Status, listener: StatusListener<D>) {
    this.statusEmitter.on(status, listener);
  }

  private removeOnStatus<D>(status: Status, listener: StatusListener<D>) {
    this.statusEmitter.off(status, listener);
  }

  public onceExit(listener: StatusListener<void>) {
    if (this.isReady) {
      return listener({
        type: Message.Status,
        status: Status.Exit,
        data: undefined,
      });
    }
    const onceListener = (message: StatusMessage<void>) => {
      this.removeOnStatus(Status.Exit, onceListener);
      listener(message);
    }
    this.onStatus(Status.Exit, onceListener);
  }

  public onceReady(listener: StatusListener<void>) {
    if (this.isReady) {
      return listener({
        type: Message.Status,
        status: Status.Ready,
        data: undefined,
      });
    }
    const onceListener = (message: StatusMessage<void>) => {
      this.removeOnStatus(Status.Ready, onceListener);
      listener(message);
    }
    this.onStatus(Status.Ready, onceListener);
  }

  public async getSources() {
    const inputType = Input.GetSources;

    type RequestDataType = InputData[typeof inputType];
    type ResponseDataType = OutputData[typeof inputType];

    const result = await this.handleRequest<RequestDataType, ResponseDataType>({
      inputType,
      data: {},
    });
    return result;
  }

  public async search(data: InputData[Input.Search]) {
    const inputType = Input.Search;

    type RequestDataType = InputData[typeof inputType];
    type ResponseDataType = OutputData[typeof inputType];

    const result = await this.handleRequest<RequestDataType, ResponseDataType>({
      inputType,
      data,
    });
    return result;
  }

  public constructor(public extensionID: string) {
    const root = app.getAppPath();

    const extensionProcessPath = require.resolve('@devbookhq/extension');

    const extensionModulePath = path.resolve(root, 'build', 'main', 'extensions', 'buildInExtensions', extensionID);

    this.extensionProcess = fork(extensionProcessPath, undefined, {
      stdio: isDev ? ['inherit', 'inherit', 'inherit', 'ipc'] : ['ignore', 'ignore', 'ignore', 'ipc'],
      env: {
        ...process.env,
        EXTENSION_ID: extensionID,
        EXTENSION_MODULE_PATH: extensionModulePath,
        ELECTRON_RUN_AS_NODE: '1',
      },
      detached: (process.platform === 'win32'),
    });

    this.extensionProcess.on('message', <D>(message: FromExtensionMessage<D>) => {
      if (message.type === Message.Status) this.statusEmitter.emit(message.status, message);
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

  private waitForResponse<D>(id: string) {
    return new Promise<OutputMessage<D>>((resolve, reject) => {
      const ipcHandle = (message: FromExtensionMessage<D>) => {
        if (message.type === Message.Status || message.type === Message.StatusError) return;
        if (message.id === id) {
          this.extensionProcess.off('message', ipcHandle);
          switch (message.type) {
            case Message.Output:
              return resolve(message);
            case Message.OutputError:
              return reject(message.data);
            default:
              return reject('Unknown message type');
          }
        }
      }
      this.extensionProcess.on('message', ipcHandle);
    });
  }

  private async handleRequest<I, O>(requestOptions: Pick<InputMessage<I>, 'data' | 'inputType'>) {
    if (!this.isActive) {
      throw new Error(`Extension "${this.extensionID}" is not running`);
    }
    const id = uuidv4();
    const response = this.waitForResponse<O>(id);
    const request: InputMessage<I> = {
      ...requestOptions,
      type: Message.Input,
      id,
    };

    this.extensionProcess.send(request);
    return (await response).data;
  }
}
