/**
 * Error produced when a socket request has a timeout.
 */
export class SocketTimeoutError extends Error {
  constructor(message) {
    super(message);

    this.name = 'SocketTimeoutError';

    if (Error.hasOwnProperty('captureStackTrace'))
      // Just in V8.
      Error.captureStackTrace(this, SocketTimeoutError);
    else this.stack = new Error(message).stack;
  }
}

export class NotFoundInMediasoupError extends Error {
  constructor(message) {
    super(message);

    this.name = 'NotFoundInMediasoupError';
  }
}
