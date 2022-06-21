import io, { Socket } from 'socket.io-client';
import { EventEmitter } from 'eventemitter-strict';
import { SocketTimeoutError } from '../error';
import { Logger } from '../helper/logger';
import type {
  ChatMessageData,
  ConnectWebRtcTransport,
  ConsumerData,
  CreateWebRtcTransport,
  DisplayNameData,
  FilesharingData,
  JoinData,
  PauseProducerData,
  ProduceData,
  PromotePeerData,
  ResumeProducerData,
  SignalingSendRequestMap,
  SocketInboundNotification,
  SocketOutboundRequest,
} from '../types';

const logger = new Logger('SignalingClient');

interface ServerClientEvents {
  notification: ({ method, data }: SocketInboundNotification) => void;
}

interface ClientServerEvents {
  request: (
    request: SocketOutboundRequest,
    result: (
      timeout: Error | null,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      serverError: any | null,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      responseData: any
    ) => void
  ) => void;
}

interface SignalingClientEventMap {
  // Signaling events
  connect: () => void;
  disconnect: () => void;
  reconnect: (attempt?: number) => void;
  reconnect_failed: () => void;

  // General server messages
  notification: (notification: SocketInboundNotification) => void;
}

export interface SignalingClient {
  // 增加固定类型输入输出
  sendRequest<K extends keyof SignalingSendRequestMap>(
    method: K,
    data: SignalingSendRequestMap[K][0]
  ): Promise<SignalingSendRequestMap[K][1]>;
}

export class SignalingClient extends EventEmitter<SignalingClientEventMap> {
  /**
   * 请求重试次数
   */
  requestRetries = 3;
  /**
   * 请求超时时间
   */
  requestTimeout = 20000;
  /**
   * 信令服务器的嵌套字
   */
  private socket?: Socket<ServerClientEvents, ClientServerEvents>;

  public connect({ url }: { url: string }): void {
    logger.debug('connect() [url:%s]', url);

    this.socket = io(url, {
      transports: ['websocket', 'polling'],
    });

    this.handleSocket();
  }

  public disconnect() {
    this.socket?.close();
  }

  private handleSocket(): void {
    this.socket?.on('notification', (notification) => {
      this.emit('notification', notification);
    });

    this.socket?.on('connect', () => {
      logger.debug('_handleSocket() | connected');

      this.emit('connect');
    });

    this.socket?.on('disconnect', (reason) => {
      logger.debug('_handleSocket() | disconnected [reason:%s]', reason);

      if (
        reason === 'io server disconnect' ||
        reason === 'io client disconnect'
      ) {
        logger.debug('_handleSocket() | purposefully disconnected');

        this.emit('disconnect');
      } else {
        this.emit('reconnect');
      }
    });
  }

  private sendRequestOnWire(
    socketMessage: SocketOutboundRequest
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject('No socket connection');
      } else {
        this.socket
          .timeout(this.requestTimeout)
          .emit('request', socketMessage, (timeout, serverError, response) => {
            if (timeout) reject(new SocketTimeoutError('Request timed out'));
            else if (serverError) reject(serverError);
            else resolve(response);
          });
      }
    });
  }

  public async sendRequest<T>(
    method: string,
    data?:
      | CreateWebRtcTransport
      | ConnectWebRtcTransport
      | ProduceData
      | ConsumerData
      | JoinData
      | PauseProducerData
      | ResumeProducerData
      | DisplayNameData
      | PromotePeerData
      | ChatMessageData
      | FilesharingData
      | undefined
  ): Promise<T> {
    logger.debug('sendRequest() [method:%s, data:%o]', method, data);

    for (let tries = 0; tries < this.requestRetries; tries++) {
      try {
        return await this.sendRequestOnWire({ method, data });
      } catch (error) {
        if (error instanceof SocketTimeoutError && tries < this.requestRetries)
          logger.warn('sendRequest() | timeout, retrying [attempt:%s]', tries);
        else {
          throw error;
        }
      }
    }

    throw new Error('sendRequest failed');
  }
}
