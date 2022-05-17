import type { JoinOptions, MediaDevice, UpdateWebcamParams } from '../types';
import { SignalingClient } from './signaling';
import Logger from '../helper/logger';
import { MediaClient } from './media';
import { DeviceClient } from './device';
import { getVideoConstrains } from '../consts';
import { InitClientError } from '../error';
import { defaultSettings, TailchatMeetingClientSettings } from './settings';
import { getEncodings } from '../helper/encodings';
import type { Producer } from 'mediasoup-client/lib/types';
import EventEmitter from 'events';

const logger = new Logger('client');

export interface TailchatMeetingClient {
  on(
    event: 'webcamProduce',
    listener: (webcamProducer: Producer) => void
  ): this;
}

export class TailchatMeetingClient extends EventEmitter {
  signaling?: SignalingClient;
  media?: MediaClient;
  device = new DeviceClient();

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
      rtpCapabilities: this.media.rtpCapabilities,
      // returning: options.returning, //TODO: 不知道什么用，暂时保留
    });

    logger.debug(
      '_joinRoom() joined [authenticated:"%s", peers:"%o", roles:"%o", userRoles:"%o"]',
      authenticated,
      peers,
      roles,
      userRoles
    );

    if (options.video) {
      await this.updateWebcam({ init: true, start: true });
    }

    if (options.audio) {
      // TODO
    }
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
   * 更新摄像头
   */
  async updateWebcam({
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

      await this.device.updateMediaDevices();
    } catch (err) {
      logger.error('updateWebcam() [error:"%o"]', err);

      if (track) {
        track.stop();
      }

      throw err;
    }
  }
}
