import { fork, ChildProcess } from 'child_process';
import { EventEmitter } from 'events';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { app } from 'electron';
import {
  Call,
  Status,
  FromExtensionMessage,
  Message,
  CallReturnMessage,
  StatusMessage,
  CallMessage,
  CallInput,
  CallOutput,
} from '@devbookhq/extension';

import isDev from '../utils/isDev';

interface StatusListener<D> {
  (message: StatusMessage<D>): void;
}

class Extension {
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
    const callType = Call.GetSources;

    type CurrentCallInput = CallInput[typeof callType];
    type CurrentCallOutput = CallOutput[typeof callType];

    return this.handleCall<CurrentCallInput, CurrentCallOutput>({
      callType,
      data: {},
    });
  }

  public async search(data: CallInput[Call.Search]) {
    const callType = Call.Search;

    type CurrentCallInput = CallInput[typeof callType];
    type CurrentCallOutput = CallOutput[typeof callType];

    return this.handleCall<CurrentCallInput, CurrentCallOutput>({
      callType,
      data,
    });
  }

  public constructor(public extensionID: string) {
    const root = app.getAppPath();

    const extensionProcessPath = require.resolve('@devbookhq/extension');

    const extensionModulePath = path.resolve(root, 'build', 'main', 'extensions', 'defaultExtensions', extensionID);

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

  private waitForCall<D>(id: string) {
    return new Promise<CallReturnMessage<D>>((resolve, reject) => {
      const messageHandler = (message: FromExtensionMessage<D>) => {
        if (message.type === Message.Status || message.type === Message.StatusError) return;
        if (message.id === id) {
          this.extensionProcess.off('message', messageHandler);
          switch (message.type) {
            case Message.CallReturn:
              return resolve(message);
            case Message.CallError:
              return reject(message.data);
            default:
              return reject('Unknown message type.');
          }
        }
      }
      this.extensionProcess.on('message', messageHandler);
    });
  }

  private async handleCall<I, O>(options: Pick<CallMessage<I>, 'data' | 'callType'>) {
    if (!this.isActive) throw new Error(`Extension "${this.extensionID}" is not running.`);

    const id = uuidv4();
    const callReturn = this.waitForCall<O>(id);
    const callMessage: CallMessage<I> = {
      ...options,
      type: Message.Call,
      id,
    };

    this.extensionProcess.send(callMessage);
    return (await callReturn).data;
  }
}

export default Extension;
