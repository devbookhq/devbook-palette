import {
  ExtensionMessageType,
  ToExtensionMessage,
  ResponseMessage,
  ErrorResponseMessage,
  ExtensionResponseError,
} from '../message';

export class Responder<I, O> {
  private hasResponded = false;

  public constructor(private message: ToExtensionMessage<I>) {
    if (message.type !== ExtensionMessageType.Request) throw new Error('Message must be of the type request');
  }

  public sendResponse(data: O) {
    if (this.hasResponded) throw new Error('Input message was already responded to.');
    if (!process.send) throw new Error('Process has no parent to send response to.');

    const responseMessage: ResponseMessage<O> = {
      id: this.message.id,
      requestType: this.message.requestType,
      type: ExtensionMessageType.Response,
      data,
    };
    process.send(responseMessage);
  }

  public sendErrorResponse<D>(error: ExtensionResponseError, data: D) {
    if (this.hasResponded) throw new Error('Input message was already responded to.');
    if (!process.send) throw new Error('Process has no parent to send response to.');

    const errorResponse: ErrorResponseMessage<D> = {
      id: this.message.id,
      type: ExtensionMessageType.ErrorResponse,
      error,
      data,
    };
    process.send(errorResponse);
  }
}
