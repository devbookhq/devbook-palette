import { ExtensionRequestType, RequestDataMap, ResponseDataMap } from '../message';

type ExtensionModuleExports = { [handler in keyof typeof ExtensionRequestType]: <I, O>(data: I) => Promise<O> };

export class ExtensionModule {
  private handlers: ExtensionModuleExports;

  public getHandler(requestType: ExtensionRequestType) {
    type RequestDataType = RequestDataMap[typeof requestType];
    type ResponseDataType = ResponseDataMap[typeof requestType];

    console.log(requestType, this.handlers);
    return (data: RequestDataType) => this.handlers[requestType]<RequestDataType, ResponseDataType>(data);
  }

  constructor(extensionModulePath: string) {
    this.handlers = require(extensionModulePath);
  }
}
