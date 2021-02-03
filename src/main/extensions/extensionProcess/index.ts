import path from 'path';

import {
  ExtensionMessageType,
  ToExtensionMessage,
  ExtensionStatus,
  StatusMessage,
  ExtensionResponseError,
  RequestDataMap,
} from '../message';
import { Responder } from './responseHandler';
import { ExtensionModuleHandler } from './extensionModuleHandler';

export class ExtensionProcess {
  private extensionModule: ExtensionModuleHandler;

  public constructor() {
    if (!process.send) {
      console.error('Process has no parent.');
      process.exit(1);
    }

    if (!process.env.EXTENSION_ID) {
      this.sendStatus(ExtensionStatus.Exit, { reason: `Environment variable "EXTENSION_ID" is not defined` });
      process.exit(1);
    }

    if (!process.env.EXTENSION_MODULE_PATH) {
      this.sendStatus(ExtensionStatus.Exit, { reason: `Environment variable "EXTENSION_MODULE_PATH" is not defined` });
      process.exit(1);
    }

    process.on('message', async <D>(message: ToExtensionMessage<D>) => {
      if (message.type !== ExtensionMessageType.Request) return;


      type RequestDataType = RequestDataMap[typeof message.requestType];

      const responseHandler = new Responder(message);
      const requestHandler = this.extensionModule.getExport(message.requestType);

      if (!requestHandler) {
        return responseHandler.sendErrorResponse(
          ExtensionResponseError.UnknownRequestType,
          { reason: `"${message.requestType}" handler is not present in the extension` });
      }

      try {
        console.log(message.requestType);
        const responseData = await requestHandler(message.data as unknown as RequestDataType);
        return responseHandler.sendResponse(responseData);
      } catch (error) {
        return responseHandler.sendErrorResponse(
          ExtensionResponseError.ErrorHandlingRequest,
          { reason: error.message },
        );
      }
    });

    const extensionModulePath = path.resolve(process.env.EXTENSION_MODULE_PATH);

    try {
      this.extensionModule = new ExtensionModuleHandler(extensionModulePath);
      this.sendStatus(ExtensionStatus.Ready, undefined);
    } catch (error) {
      this.sendStatus(
        ExtensionStatus.Exit,
        { reason: `Cannot load extension module from path "${extensionModulePath}"` },
      );
      process.exit(1);
    }
  }

  private sendStatus<D>(status: ExtensionStatus, data: D) {
    if (!process.send) throw new Error('Process has no parent to send response to.');

    const statusMessage: StatusMessage<D> = {
      status,
      data,
      type: ExtensionMessageType.Status,
    };
    process.send(statusMessage);
  }
}

export default require.main === module && new ExtensionProcess();
