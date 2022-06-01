import type {
  JoinOptions,
  MediaClientConsumer,
  MediaDevice,
  UpdateWebcamParams,
} from '../types';
import { SignalingClient } from './signaling';
import { Logger } from '../helper/logger';
import { MediaClient } from './media';
import { DeviceClient } from './device';
import { getVideoConstrains } from '../consts';
import { InitClientError } from '../error';
import { defaultSettings, TailchatMeetingClientSettings } from './settings';
import { getEncodings } from '../helper/encodings';
import type { Producer } from 'mediasoup-client/lib/types';
import EventEmitter from 'eventemitter3';
import { RoomClient } from './room';

const logger = new Logger('client');

export interface TailchatMeetingClient {
  on(
    event: 'webcamProduce',
    listener: (webcamProducer: Producer) => void
  ): this;
  on(event: 'webcamClose', listener: (webcamProducerId: string) => void): this;
  on(event: 'micProduce', listener: (micProducer: Producer) => void): this;
  on(event: 'micClose', listener: (micProducerId: string) => void): this;
  on(event: 'clientClose', listener: () => void): this;
}

export class TailchatMeetingClient extends EventEmitter {
  signaling?: SignalingClient;
  media?: MediaClient;
  room?: RoomClient;
  device = new DeviceClient();
  private closed = false;

  settings: TailchatMeetingClientSettings = { ...defaultSettings };

  /**
   * @param signalingHost 信令服务器地址，形如: wss://xxxx.com:443
   * @param peerId 用户的唯一标识
   */
  constructor(public signalingHost: string, public peerId: string) {
    super();
  }

  /**
   * 加入房间
   */
  async join(roomId: string, options: JoinOptions) {
    logger.debug('join(): %s %o', roomId, options);
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

  //#region webcam 网络摄像头
  private currentWebcamProducer?: Producer;
  get webcamEnabled() {
    return !!this.currentWebcamProducer;
  }

  async enableWebcam() {
    logger.debug('enableWebcam()');
    await this.updateWebcam({ init: true, start: true });
  }

  async disableWebcam() {
    logger.debug('disableWebcam()');

    if (!this.media) {
      throw new InitClientError();
    }

    if (!this.currentWebcamProducer) {
      return;
    }

    this.media.changeProducer(this.currentWebcamProducer.id, 'close');
    this.emit('webcamClose', this.currentWebcamProducer.id);
    this.currentWebcamProducer = undefined;
  }

  /**
   * 更新摄像头
   */
  private async updateWebcam({
    init = false,
    start = false,
    restart = false,
    newDeviceId = null,
    newResolution = null,
    newFrameRate = null,
    selectedVideoDevice = '',
  }: UpdateWebcamParams = {}) {
    logger.debug(
      'updateWebcam() [start:"%s", restart:"%s", newDeviceId:"%s", newResolution:"%s", newFrameRate:"%s"]',
      start,
      restart,
      newDeviceId,
      newResolution,
      newFrameRate
    );

    if (!this.media) {
      throw new InitClientError();
    }

    let track: MediaStreamTrack | null | undefined;
    let webcamProducer: Producer | null | undefined;

    try {
      if (!this.media.mediaCapabilities.canSendWebcam) {
        throw new Error('cannot produce video');
      }

      if (newDeviceId && !restart) {
        throw new Error('changing device requires restart');
      }

      await this.device.updateMediaDevices();

      const deviceId = this.device.getDeviceId(
        selectedVideoDevice,
        'videoinput'
      );

      if (!deviceId) {
        logger.warn('no webcam devices');
      }

      webcamProducer = this.media
        ?.getProducers()
        .find((producer) => producer.appData.source === 'webcam');

      if ((restart && webcamProducer) || start) {
        // TODO: 需要关掉旧的
        if (this.currentWebcamProducer) {
          await this.disableWebcam();
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            deviceId: { ideal: deviceId },
            ...getVideoConstrains(
              this.settings.resolution,
              this.settings.aspectRatio
            ),
            frameRate: this.settings.frameRate,
          },
        });

        track = stream.getVideoTracks()[0];

        if (!track) {
          throw new Error('no webcam track');
        }

        const { deviceId: trackDeviceId, width, height } = track.getSettings();
        logger.debug('getUserMedia track settings:', track.getSettings());

        if (this.settings.simulcast) {
          const encodings = getEncodings(
            this.media.rtpCapabilities,
            this.settings.simulcastProfiles,
            width,
            height
          );

          const resolutionScalings = encodings.map(
            (encoding) => encoding.scaleResolutionDownBy
          );

          webcamProducer = await this.media.produce({
            track,
            encodings,
            codecOptions: {
              videoGoogleStartBitrate: 1000,
            },
            appData: {
              source: 'webcam',
              width,
              height,
              resolutionScalings,
            },
          });
        } else {
          webcamProducer = await this.media.produce({
            track,
            appData: {
              source: 'webcam',
              width,
              height,
            },
          });
        }
      } else if (webcamProducer) {
        ({ track } = webcamProducer);

        await track?.applyConstraints({
          ...getVideoConstrains(
            this.settings.resolution,
            this.settings.aspectRatio
          ),
          frameRate: this.settings.frameRate,
        });
      }

      this.emit('webcamProduce', webcamProducer);
      this.currentWebcamProducer = webcamProducer;

      await this.device.updateMediaDevices();
    } catch (err) {
      logger.error('updateWebcam() [error:"%o"]', err);

      if (track) {
        track.stop();
      }

      throw err;
    }
  }
  //#endregion

  //#region mic 麦克风
  private currentMicProducer?: Producer;
  get micEnabled() {
    return !!this.currentMicProducer;
  }

  async enableMic() {
    await this.updateMic({ start: true });
  }

  async disableMic() {
    if (!this.media) {
      throw new InitClientError();
    }

    if (!this.currentMicProducer) {
      return;
    }

    this.media.changeProducer(this.currentMicProducer.id, 'close');
    this.emit('micClose', this.currentMicProducer.id);
    this.currentMicProducer = undefined;
  }

  async updateMic({
    start = false,
    restart = true,
    newDeviceId = null,
    selectedAudioDevice = '',
  } = {}) {
    logger.debug(
      'updateMic() [start:"%s", restart:"%s", newDeviceId:"%s"]',
      start,
      restart,
      newDeviceId
    );

    if (!this.media) {
      throw new InitClientError();
    }

    let track: MediaStreamTrack | null | undefined;
    let micProducer: Producer | null | undefined;

    try {
      await this.device.updateMediaDevices();

      if (!this.media.mediaCapabilities.canSendMic) {
        throw new Error('cannot produce audio');
      }

      if (newDeviceId && !restart) {
        throw new Error('changing device requires restart');
      }

      await this.device.updateMediaDevices();

      const deviceId = this.device.getDeviceId(
        selectedAudioDevice,
        'audioinput'
      );

      if (!deviceId) {
        logger.warn('no audio devices');
      }

      const {
        autoGainControl,
        echoCancellation,
        noiseSuppression,
        sampleRate,
        channelCount,
        sampleSize,
        opusStereo,
        opusDtx,
        opusFec,
        opusPtime,
        opusMaxPlaybackRate,
      } = this.settings;

      micProducer = this.media
        .getProducers()
        .find((producer) => producer.appData.source === 'mic');

      if ((restart && micProducer) || start) {
        if (micProducer) {
          await this.disableMic();
        }

        if (!track) {
          const stream = await navigator.mediaDevices.getUserMedia({
            audio: {
              deviceId: { ideal: deviceId },
              sampleRate,
              channelCount,
              autoGainControl,
              echoCancellation,
              noiseSuppression,
              sampleSize,
            },
          });

          [track] = stream.getAudioTracks();
        }

        if (!track) throw new Error('no mic track');

        micProducer = await this.media.produce({
          track,
          codecOptions: {
            opusStereo: opusStereo,
            opusFec: opusFec,
            opusDtx: opusDtx,
            opusMaxPlaybackRate: opusMaxPlaybackRate,
            opusPtime: opusPtime,
          },
          appData: { source: 'mic' },
        });
      } else if (micProducer) {
        ({ track } = micProducer);

        await track?.applyConstraints({
          sampleRate,
          channelCount,
          autoGainControl,
          echoCancellation,
          noiseSuppression,
          sampleSize,
        });
      }

      this.emit('micProduce', micProducer);
      this.currentMicProducer = micProducer;

      await this.device.updateMediaDevices();
    } catch (err) {
      logger.error('updateMic() [error:"%o"]', err);

      if (track) {
        track.stop();
      }
    }
  }
  //#endregion

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

    return { micConsumer, webcamConsumer, screenConsumer, extraVideoConsumers };
  }
}
