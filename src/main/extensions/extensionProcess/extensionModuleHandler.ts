import { request } from 'http';
import { ExtensionRequestType, RequestDataMap, ResponseDataMap } from '../message';

type ExtensionModuleExports = { [handler in keyof typeof ExtensionRequestType]: <I, O>(data: I) => Promise<O> | O };

// type Exp = (requestType: ExtensionRequestType) => ((data: RequestDataMap[typeof requestType]) => Promise<ResponseDataMap[typeof requestType]>);

export type ModuleExportsType = {
  [ExtensionRequestType.Search]: (data: RequestDataMap[ExtensionRequestType.Search]) => (Promise<ResponseDataMap[ExtensionRequestType.Search]> | ResponseDataMap[ExtensionRequestType.Search]);
  // [ExtensionRequestType.Query]: Exp(ExtensionRequestType.Query);
}

export class ExtensionModuleHandler {
  private exports: ModuleExportsType;

  public constructor(extensionModulePath: string) {
    this.exports = require(extensionModulePath);
  }
  
  public getExport(requestType: ExtensionRequestType) {
    console.log('handler', requestType);
    type RequestDataType = RequestDataMap[typeof requestType];
    type ResponseDataType = ResponseDataMap[typeof requestType];

    return (data: RequestDataType) => this.exports[requestType](data);
  }

}
