/**
 * Create a function which will call the callback function
 * after the given amount of milliseconds has passed since
 * the last time the callback function was called.
 */
export const idle = (callback, delay) => {
  let handle;

  return () => {
    if (handle) {
      clearTimeout(handle);
    }

    handle = setTimeout(callback, delay);
  };
};

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

/**
 * 是否一个可用的字符串
 * 定义为有长度的字符串
 */
export function isValidStr(str: unknown): str is string {
  return typeof str == 'string' && str !== '';
}

/**
 * 根据容器宽高计算可用空间大小
 * @param containerWidth 容器宽度
 * @param containerHeight 容器高度
 * @param aspectRatio 纵横比
 * @returns
 */
export function calcBoxSizeWithContainer(
  containerWidth: number,
  containerHeight: number,
  aspectRatio: number
) {
  let width = containerWidth;
  let height = width / aspectRatio;

  if (height > containerHeight) {
    // 需要缩放
    const scale = containerHeight / height;

    width *= scale;
    height *= scale;
  }

  return { width, height };
}
