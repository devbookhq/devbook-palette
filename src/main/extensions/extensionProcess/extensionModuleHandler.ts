import { ExtensionRequestType, RequestDataMap, ResponseDataMap } from '../message';

type ExtensionModuleExports = { [handler in ExtensionRequestType]: <I, O>(data: I) => Promise<O> | O };

export type ModuleExportsType = {
  [ExtensionRequestType.Search]: (data: RequestDataMap[ExtensionRequestType.Search]) => (Promise<ResponseDataMap[ExtensionRequestType.Search]> | ResponseDataMap[ExtensionRequestType.Search]);
  [ExtensionRequestType.GetSources]: (data: RequestDataMap[ExtensionRequestType.GetSources]) => (Promise<ResponseDataMap[ExtensionRequestType.GetSources]> | ResponseDataMap[ExtensionRequestType.GetSources]);
}

export class ExtensionModuleHandler {
  private exports: ExtensionModuleExports;

  public constructor(extensionModulePath: string) {
    this.exports = require(extensionModulePath);
  }

  public getExport(requestType: ExtensionRequestType) {
    type RequestDataType = RequestDataMap[typeof requestType];
    type ResponseDataType = ResponseDataMap[typeof requestType];

    return (data: RequestDataType) => this.exports[requestType]<RequestDataType, ResponseDataType>(data);
  }
}
