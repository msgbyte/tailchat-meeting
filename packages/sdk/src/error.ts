/**
 * Error produced when a socket request has a timeout.
 */
export class SocketTimeoutError extends Error {
  constructor(message: string) {
    super(message);

    this.name = 'SocketTimeoutError';

    if (Error.hasOwnProperty('captureStackTrace')) {
      // Just in V8.
      (Error as any).captureStackTrace(this, SocketTimeoutError);
    } else {
      this.stack = new Error(message).stack;
    }
  }
}

export class InitClientError extends Error {
  name = 'InitClientError';

  constructor(message?: string) {
    super(message ?? 'Client init Failed, something not ready.');
  }
}
