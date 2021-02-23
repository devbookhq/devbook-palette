import { v4 as uuidv4 } from 'uuid';
import type { ChildProcess } from 'child_process';
import {
  Event,
  Status,
  FromExtensionMessage,
  Message,
  EventReturnMessage,
  StatusMessage,
  EventMessage,
  EventInput,
  EventOutput,
} from '@devbookhq/extension';
import { makeAutoObservable, runInAction } from 'mobx';

import { isDev } from '../../mainCommunication/electron'
import { ExtensionID } from './extensionID';
import { events, path, childProcess, app } from '../electronRemote';
import type ExtensionsStore from './extensions.store';

interface StatusListener<D> {
  (message: StatusMessage<D>): void;
}

class Extension {
  private extensionProcess: ChildProcess;
  private statusEmitter = new events.EventEmitter();
  public isReady = false;

  public get isActive() {
    return !this.extensionProcess.killed;
  }
  public constructor(private readonly store: ExtensionsStore, public readonly extensionID: ExtensionID) {
    makeAutoObservable(this, {
      search: false,
      getSources: false,
      onceExit: false,
      onceReady: false,
    });

    const root = app.getAppPath();
    const extensionProcessPath = require.resolve('@devbookhq/extension');
    const extensionModulePath = path.resolve(root, 'build', 'main', 'extensions', 'defaultExtensions', extensionID);

    this.extensionProcess = childProcess.fork(extensionProcessPath, undefined, {
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
      runInAction(() => {
        this.isReady = true;
      });
    });

    this.onceExit(() => {
      this.terminate();
    });
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
    const eventType = Event.getSources;

    type CurrentEventInput = EventInput[typeof eventType];
    type CurrentEventOutput = EventOutput[typeof eventType];

    return this.handleEvent<CurrentEventInput, CurrentEventOutput>({
      eventType: eventType,
      data: {},
    });
  }

  public async search(data: EventInput[Event.onDidQueryChange]) {
    const eventType = Event.onDidQueryChange;

    type CurrentEventInput = EventInput[typeof eventType];
    type CurrentEventOutput = EventOutput[typeof eventType];

    return this.handleEvent<CurrentEventInput, CurrentEventOutput>({
      eventType,
      data,
    });
  }

  public terminate() {
    this.extensionProcess.kill();
  }

  private waitForEvent<D>(id: string) {
    return new Promise<EventReturnMessage<D>>((resolve, reject) => {
      const messageHandler = (message: FromExtensionMessage<D>) => {
        if (message.type !== Message.EventReturn && message.type !== Message.EventError) return;
        if (message.id === id) {
          this.extensionProcess.off('message', messageHandler);
          switch (message.type) {
            case Message.EventReturn:
              return resolve(message);
            case Message.EventError:
              return reject(message.data);
            default:
              return reject('Unknown message type.');
          }
        }
      }
      this.extensionProcess.on('message', messageHandler);
    });
  }

  private async handleEvent<I, O>(options: Pick<EventMessage<I>, 'data' | 'eventType'>) {
    if (!this.isActive) throw new Error(`Extension "${this.extensionID}" is not running.`);

    const id = uuidv4();
    const eventReturn = this.waitForEvent<O>(id);
    const eventMessage: EventMessage<I> = {
      ...options,
      type: Message.Event,
      id,
    };

    this.extensionProcess.send(eventMessage);
    return (await eventReturn).data;
  }
}

export default Extension;
