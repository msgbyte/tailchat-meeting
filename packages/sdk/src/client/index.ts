import type { JoinOptions, UpdateWebcamParams } from '../types';
import { SignalingClient } from './signaling';
import Logger from '../helper/logger';
import { MediaClient } from './media';
import { DeviceClient } from './device';
import { getVideoConstrains } from '../consts';

const logger = new Logger('client');

export class TailchatMeetingClient {
  signaling?: SignalingClient;
  media?: MediaClient;
  device?: DeviceClient;

  /**
   * @param signalingHost 信令服务器地址，形如: wss://xxxx.com:443
   * @param peerId 用户的唯一标识
   */
  constructor(public signalingHost: string, public peerId: string) {}

  /**
   * 加入房间
   */
  join(roomId: string, options: JoinOptions) {
    logger.debug('join(): %s %o', roomId, options);
    const signalingUrl = `${this.signalingHost}/?peerId=${this.peerId}&roomId=${roomId}`;
    this.signaling = new SignalingClient();
    this.signaling.connect({ url: signalingUrl });

    this.media = new MediaClient(this.signaling);
    this.device = new DeviceClient();
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
  }: UpdateWebcamParams = {}) {
    logger.debug(
      'updateWebcam() [start:"%s", restart:"%s", newDeviceId:"%s", newResolution:"%s", newFrameRate:"%s"]',
      start,
      restart,
      newDeviceId,
      newResolution,
      newFrameRate
    );

    if (!this.device) {
      throw new Error('no device client');
    }

    let track: MediaStreamTrack | undefined;

    try {
      await this.device.updateMediaDevices();

      // const stream = await navigator.mediaDevices.getUserMedia({
      //   video: {
      //     deviceId: { ideal: deviceId },
      //     ...getVideoConstrains(resolution, aspectRatio),
      //     frameRate,
      //   },
      // });

      // TODO
    } catch (err) {
      logger.error('updateWebcam() [error:"%o"]', err);

      if (track) {
        track.stop();
      }

      throw err;
    }
  }
}
