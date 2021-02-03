export enum ExtensionMessageType {
  Request = 'Request',

  Response = 'Response',
  ErrorResponse = 'ErrorResponse',

  Status = 'Status',
  ErrorStatus = 'ErrorStatus',
};

interface MessageBase<D> {
  id: string;
  type: ExtensionMessageType;
  data: D;
}

export interface RequestMessage<D> extends MessageBase<D> {
  type: ExtensionMessageType.Request;
  requestType: ExtensionRequestType;
}

export interface ResponseMessage<D> extends MessageBase<D> {
  type: ExtensionMessageType.Response;
  requestType: ExtensionRequestType;
}

export interface ErrorResponseMessage<D> extends MessageBase<D> {
  type: ExtensionMessageType.ErrorResponse;
  error: ExtensionResponseError;
}

export interface StatusMessage<D> extends Omit<MessageBase<D>, 'id'> {
  type: ExtensionMessageType.Status;
  status: ExtensionStatus;
}

export interface ErrorStatusMessage<D = undefined> extends Omit<MessageBase<D>, 'id' | 'data'> {
  type: ExtensionMessageType.ErrorStatus;
  error: ExtensionStatusError;
}

export type ToExtensionMessage<D> =
  RequestMessage<D>;

export type FromExtensionMessage<D> =
  ResponseMessage<D> |
  ErrorResponseMessage<D> |
  StatusMessage<D> |
  ErrorStatusMessage;

export enum ExtensionStatus {
  Ready = 'Ready',
  Error = 'Error',
  Exit = 'Exit',
}

export enum ExtensionResponseError {
  UnknownRequestType = 'UnknownRequestType',
  ErrorHandlingRequest = 'ErrorHandlingRequest',
}

export enum ExtensionStatusError {
  CannotLoadExtension = 'CannotLoadExtension',
}

export enum ExtensionRequestType {
  Search = 'search',
}

export interface RequestDataMap {
  [ExtensionRequestType.Search]: { query: string };
};

export interface ResponseDataMap {
  [ExtensionRequestType.Search]: { results: unknown[] };
};
