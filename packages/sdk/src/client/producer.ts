import { EventEmitter } from 'eventemitter-strict';
import type { TailchatMeetingClient } from '.';
import { getVideoConstrains } from '../consts';
import { InitClientError } from '../error';
import { getEncodings } from '../helper/encodings';
import { Logger } from '../helper/logger';
import type { Producer, UpdateWebcamParams } from '../types';

const logger = new Logger('producer');

interface ProducerClientEventMap {
  webcamProduce: (webcamProducer: Producer) => void;
  webcamClose: (webcamProducerId: string) => void;
  micProduce: (micProducer: Producer) => void;
  micClose: (micProducerId: string) => void;
}

/**
 * 流生产者
 */
export class ProducerClient extends EventEmitter<ProducerClientEventMap> {
  constructor(public meetingClient: TailchatMeetingClient) {
    super();
  }

  get media() {
    return this.meetingClient.media;
  }

  get device() {
    return this.meetingClient.device;
  }

  get settings() {
    return this.meetingClient.settings;
  }

  //#region webcam 网络摄像头

  private currentWebcamProducer?: Producer;
  get webcamEnabled() {
    return !!this.currentWebcamProducer;
  }

  enableWebcam = async () => {
    logger.debug('enableWebcam()');
    await this.updateWebcam({ init: true, start: true });
  };

  disableWebcam = async () => {
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
  };

  /**
   * 更新摄像头
   */
  private updateWebcam = async ({
    init = false,
    start = false,
    restart = false,
    newDeviceId = null,
    newResolution = null,
    newFrameRate = null,
    selectedVideoDevice = '',
  }: UpdateWebcamParams = {}) => {
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
        logger.debug(
          'getUserMedia track settings:',
          trackDeviceId,
          track.getSettings()
        );

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

      this.emit('webcamProduce', webcamProducer!);
      this.currentWebcamProducer = webcamProducer;

      await this.device.updateMediaDevices();
    } catch (err) {
      logger.error('updateWebcam() [error:"%o"]', err);

      if (track) {
        track.stop();
      }

      throw err;
    }
  };
  //#endregion

  //#region mic 麦克风
  private currentMicProducer?: Producer;
  get micEnabled() {
    return !!this.currentMicProducer;
  }

  enableMic = async () => {
    await this.updateMic({ start: true });
  };

  disableMic = async () => {
    if (!this.media) {
      throw new InitClientError();
    }

    if (!this.currentMicProducer) {
      return;
    }

    this.media.changeProducer(this.currentMicProducer.id, 'close');
    this.emit('micClose', this.currentMicProducer.id);
    this.currentMicProducer = undefined;
  };

  updateMic = async ({
    start = false,
    restart = true,
    newDeviceId = null,
    selectedAudioDevice = '',
  } = {}) => {
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

      this.emit('micProduce', micProducer!);
      this.currentMicProducer = micProducer;

      await this.device.updateMediaDevices();
    } catch (err) {
      logger.error('updateMic() [error:"%o"]', err);

      if (track) {
        track.stop();
      }
    }
  };
  //#endregion
}
