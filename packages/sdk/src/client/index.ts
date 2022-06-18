import type {
  JoinOptions,
  MediaClientConsumer,
  MediaDevice,
  Peer,
  Producer,
} from '../types';
import { SignalingClient } from './signaling';
import { Logger } from '../helper/logger';
import { MediaClient } from './media';
import { DeviceClient } from './device';
import { defaultSettings, TailchatMeetingClientSettings } from './settings';
import { EventEmitter } from 'eventemitter-strict';
import { RoomClient } from './room';
import { ProducerClient } from './producer';

const logger = new Logger('client');

interface TailchatMeetingClientEventMap {
  clientClose: () => void;
}

export class TailchatMeetingClient extends EventEmitter<TailchatMeetingClientEventMap> {
  signaling?: SignalingClient;
  media?: MediaClient;
  room?: RoomClient;
  device = new DeviceClient();
  roomId?: string;
  private closed = false;
  producer = new ProducerClient(this);

  settings: TailchatMeetingClientSettings = { ...defaultSettings };

  /**
   * @param signalingHost 信令服务器地址，形如: wss://xxxx.com:443
   * @param peerId 用户的唯一标识
   */
  constructor(public signalingHost: string, public peerId: string) {
    super();
  }

  get enableWebcam() {
    return this.producer.enableWebcam;
  }

  get disableWebcam() {
    return this.producer.disableWebcam;
  }

  get webcamEnabled() {
    return this.producer.webcamEnabled;
  }

  get enableMic() {
    return this.producer.enableMic;
  }

  get disableMic() {
    return this.producer.disableMic;
  }

  get micEnabled() {
    return this.producer.micEnabled;
  }

  /**
   * 加入房间
   */
  async join(roomId: string, options: JoinOptions) {
    logger.debug('join(): %s %o', roomId, options);
    this.roomId = roomId;
    const signalingUrl = `${this.signalingHost}/?peerId=${this.peerId}&roomId=${roomId}`;
    this.signaling = new SignalingClient();
    this.signaling.connect({ url: signalingUrl });
    this.signaling.on('disconnect', () => {
      this.close();
    });
    this.media = new MediaClient(this.signaling);
    await this.media.createTransports();

    const {
      authenticated,
      roles,
      peers,
      tracker,
      roomPermissions,
      userRoles,
      allowWhenRoleMissing,
      chatHistory,
      fileHistory,
      lastNHistory,
      locked,
      lobbyPeers,
      accessCode,
    } = await this.signaling.sendRequest('join', {
      displayName: options.displayName,
      picture: options.picture,
      from: options.from,
      rtpCapabilities: this.media.rtpCapabilities,
      // returning: options.returning, //TODO: 不知道什么用，暂时保留
    });

    this.room = new RoomClient(this.signaling);
    this.room.init({
      peers,
      lobbyPeers,
    });

    logger.debug(
      '_joinRoom() joined [authenticated:"%s", peers:"%o", roles:"%o", userRoles:"%o"]',
      authenticated,
      peers,
      roles,
      userRoles
    );

    if (options.video) {
      this.enableWebcam();
    }

    if (options.audio) {
      this.enableMic();
    }

    console.log('roomInfo:', {
      authenticated,
      roles,
      peers,
      tracker,
      roomPermissions,
      userRoles,
      allowWhenRoleMissing,
      chatHistory,
      fileHistory,
      lastNHistory,
      locked,
      lobbyPeers,
      accessCode,
    });
  }

  /**
   * 关闭客户端
   */
  close() {
    if (this.closed) {
      return;
    }

    this.closed = true;
    this.signaling?.disconnect();
    this.media?.close();
    this.emit('clientClose');
  }

  /**
   * 获取所有可用设备
   * @returns
   */
  async getAvailableMediaDevices(): Promise<MediaDevice[]> {
    await this.device.updateMediaDevices();

    return this.device.allDevices;
  }

  /**
   * 根据参会者id查找消费端
   * @param peerId 参会者ID
   * @returns
   */
  getConsumersByPeerId(peerId: string) {
    const consumers = this.media?.getConsumers();

    const matched = (consumers ?? []).filter(
      (consumer) => consumer.appData.peerId === peerId
    );

    const micConsumer = matched.find(
      (consumer) => consumer.appData.source === 'mic'
    );
    const webcamConsumer = matched.find(
      (consumer) => consumer.appData.source === 'webcam'
    );
    const screenConsumer = matched.find(
      (consumer) => consumer.appData.source === 'screen'
    );
    const extraVideoConsumers = matched.filter(
      (consumer) => consumer.appData.source === 'extravideo'
    );

    return {
      /**
       * 麦克风
       */
      micConsumer,
      /**
       * 摄像头
       */
      webcamConsumer,
      /**
       * 共享屏幕
       */
      screenConsumer,
      /**
       * 额外视频源
       */
      extraVideoConsumers,
    };
  }

  /**
   * 当本地打开网络摄像头
   */
  public onWebcamProduce(callback: (webcamProducer: Producer) => void) {
    this.producer.on('webcamProduce', callback);
  }

  /**
   * 当本地网络摄像头关闭
   */
  public onWebcamClose(callback: () => void) {
    this.producer.on('webcamClose', callback);
  }

  /**
   * 当本地麦克风打开
   */
  public onMicProduce(callback: (micProducer: Producer) => void) {
    this.producer.on('micProduce', callback);
  }

  /**
   * 当本地麦克风关闭
   */
  public onMicClose(callback: () => void) {
    this.producer.on('micClose', callback);
  }

  /**
   * 当有参会者入会时的回调
   */
  public onPeerJoin(callback: (peer: Peer) => void) {
    if (!this.room) {
      logger.warn('Please call [onPeerJoin] after join room');
      return;
    }

    this.room.on('peerJoin', callback);
  }

  /**
   * 当有参会者离会时的回调
   */
  public onPeerLeave(callback: (peer: Peer) => void) {
    if (!this.room) {
      logger.warn('Please call [onPeerLeave] after join room');
      return;
    }

    this.room.on('peerLeave', callback);
  }

  /**
   * 当参会者人员信息发生变化时的回调
   */
  public onPeersUpdate(callback: (peers: Peer[]) => void) {
    if (!this.room) {
      logger.warn('Please call [onPeersUpdate] after join room');
      return;
    }

    callback(this.room.peers ?? []);
    this.room.on('peersUpdated', callback);
  }

  /**
   * 当参会者人员信息发生变化时的回调
   */
  public onPeerConsumerUpdate(
    callback: (peerId: string, consumer: MediaClientConsumer | null) => void
  ) {
    if (!this.media) {
      logger.warn('Please call [onPeerConsumerUpdate] after join room');
      return;
    }

    this.media.on('consumerCreated', (consumer) => {
      callback(consumer.appData.peerId, consumer);
    });
    this.media.on('consumerResumed', (consumer) => {
      callback(consumer.appData.peerId, consumer);
    });
    this.media.on('consumerClosed', (consumer) => {
      callback(consumer.appData.peerId, null);
    });
    this.media.on('consumerPaused', (consumer) => {
      callback(consumer.appData.peerId, null);
    });
  }
}
