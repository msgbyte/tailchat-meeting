import { EventEmitter } from 'eventemitter-strict';
import { Device } from 'mediasoup-client';
import type { Producer, ProducerOptions } from 'mediasoup-client/lib/Producer';
import type { Transport } from 'mediasoup-client/lib/Transport';
import type { RtpCapabilities } from 'mediasoup-client/lib/RtpParameters';
import { Logger } from '../helper/logger';
import hark from 'hark';
import { VolumeWatcher } from '../helper/volumeWatcher';
import type { SignalingClient } from './signaling';
import type { MediaClientConsumer, MediaSourceType } from '../types';

const logger = new Logger('MediaClient');

export type MediaChange = 'pause' | 'resume' | 'close';

interface MediaCapabilities {
  canSendMic: boolean;
  canSendWebcam: boolean;
  canShareScreen: boolean;
}

const changeEvent = {
  pause: 'Paused',
  resume: 'Resumed',
  close: 'Closed',
  consumerPaused: 'pause',
  consumerResumed: 'resume',
  consumerClosed: 'close',
  producerPaused: 'pause',
  producerResumed: 'resume',
  producerClosed: 'close',
};

interface MediaClientEventMap {
  consumerCreated: (
    consumer: MediaClientConsumer,
    producerPaused: boolean
  ) => void;
  consumerClosed: (consumer: MediaClientConsumer) => void;
  consumerPaused: (consumer: MediaClientConsumer) => void;
  consumerResumed: (consumer: MediaClientConsumer) => void;
  producerClosed: (producer: Producer) => void;
  producerPaused: (producer: Producer) => void;
  producerResumed: (producer: Producer) => void;
}

export class MediaClient extends EventEmitter<MediaClientEventMap> {
  private mediasoup: Device = new Device();
  private sendTransport: Transport | undefined;
  private recvTransport: Transport | undefined;
  private producers: Map<string, Producer> = new Map();
  private consumers: Map<string, MediaClientConsumer> = new Map();
  private tracks: Map<string, MediaStreamTrack> = new Map();

  constructor(public signaling: SignalingClient) {
    super();

    this.handleSignaling();
  }

  public close() {
    this.sendTransport?.close();
    this.recvTransport?.close();
  }

  public getConsumer(consumerId: string): MediaClientConsumer | undefined {
    return this.consumers.get(consumerId);
  }

  public getConsumers(): MediaClientConsumer[] {
    return [...this.consumers.values()];
  }

  public getProducer(producerId: string): Producer | undefined {
    return this.producers.get(producerId);
  }

  public getProducers(): Producer[] {
    return [...this.producers.values()];
  }

  /**
   * 根据来源类型查找生产者
   * @param sourceType 来源类型
   */
  public findProducerWithSourceType(
    sourceType: MediaSourceType
  ): Producer | undefined {
    return this.getProducers().find(
      (producer) => producer.appData.source === sourceType
    );
  }

  public getTrack(trackId: string): MediaStreamTrack | undefined {
    return this.tracks.get(trackId);
  }

  public addTrack(track: MediaStreamTrack): void {
    logger.debug('addTrack() [trackId:%s]', track.id);

    this.tracks.set(track.id, track);

    track.addEventListener('ended', () => {
      logger.debug('addTrack() | track "ended" [trackId:%s]', track.id);

      this.tracks.delete(track.id);
    });
  }

  public removeTrack(trackId: string | undefined): void {
    logger.debug('removeTrack() [trackId:%s]', trackId);

    trackId && this.tracks.delete(trackId);
  }

  private handleSignaling(): void {
    this.signaling.on('notification', async (notification: any) => {
      logger.debug(
        'signaling "notification" event [method:%s, data:%o]',
        notification.method,
        notification.data
      );

      try {
        switch (notification.method) {
          case 'newConsumer': {
            const {
              peerId,
              producerId,
              id,
              kind,
              rtpParameters,
              // type,
              appData,
              producerPaused,
            } = notification.data;

            if (!this.recvTransport) {
              throw new Error(
                'Consumer can not be created without recvTransport'
              );
            }

            const consumer = (await this.recvTransport.consume({
              id,
              producerId,
              kind,
              rtpParameters,
              appData: {
                ...appData,
                peerId,
              },
            })) as MediaClientConsumer;

            if (kind === 'audio') {
              const { track } = consumer;
              const harkStream = new MediaStream();

              harkStream.addTrack(track);

              const consumerHark = hark(harkStream, {
                play: false,
                interval: 100,
                threshold: -60, // TODO: get from state
                history: 100,
              });

              consumer.appData.hark = consumerHark;
              consumer.appData.volumeWatcher = new VolumeWatcher({
                hark: consumerHark,
              });
            } else {
              // 这段逻辑没看懂，先注释
              // consumer.pause();
            }

            await this.resumeConsumer(consumer, { initial: true });

            this.consumers.set(consumer.id, consumer);

            consumer.observer.once('close', () => {
              this.consumers.delete(consumer.id);
            });

            consumer.once('transportclose', () => {
              this.changeConsumer(consumer.id, 'close', false);
            });

            this.emit('consumerCreated', consumer, producerPaused);

            break;
          }

          case 'consumerPaused':
          case 'consumerResumed':
          case 'consumerClosed': {
            const { consumerId } = notification.data;

            await this.changeConsumer(
              consumerId,
              changeEvent[
                notification.method as keyof typeof changeEvent
              ] as MediaChange,
              false
            );
            break;
          }

          case 'producerPaused':
          case 'producerResumed':
          case 'producerClosed': {
            const { producerId } = notification.data;

            await this.changeProducer(
              producerId,
              changeEvent[
                notification.method as keyof typeof changeEvent
              ] as MediaChange,
              false
            );
            break;
          }
        }
      } catch (error) {
        logger.error(
          'error on signalService "notification" event [error:%o]',
          error
        );
      }
    });
  }

  get mediaCapabilities(): MediaCapabilities {
    return {
      canSendMic: this.mediasoup.canProduce('audio'),
      canSendWebcam: this.mediasoup.canProduce('video'),
      canShareScreen:
        Boolean(navigator.mediaDevices.getDisplayMedia) &&
        this.mediasoup.canProduce('video'),
    };
  }

  get rtpCapabilities(): RtpCapabilities {
    return this.mediasoup.rtpCapabilities;
  }

  public async changeConsumer(
    consumerId: string,
    change: MediaChange,
    local = true
  ): Promise<void> {
    logger.debug(`${change}Consumer [consumerId:%s]`, consumerId);
    const consumer = this.consumers.get(consumerId);

    if (local && consumer) {
      await this.signaling
        .sendRequest(`${change}Consumer`, { consumerId: consumer.id })
        .catch((error: any) =>
          logger.warn(
            `${change}Consumer, unable to ${change} server-side [consumerId:%s, error:%o]`,
            consumerId,
            error
          )
        );
    }

    if (!local) {
      this.emit(`consumer${changeEvent[change]}` as any, consumer);
    }

    consumer?.[`${change}`]();
  }

  public async changeProducer(
    producerId: string,
    change: MediaChange,
    local = true
  ): Promise<void> {
    logger.debug(`${change}Producer [producerId:%s]`, producerId);
    const producer = this.producers.get(producerId);

    if (local && producer) {
      await this.signaling
        .sendRequest(`${change}Producer`, { producerId: producer.id })
        .catch((error: any) =>
          logger.warn(
            `${change}Producer, unable to ${change} server-side [producerId:%s, error:%o]`,
            producerId,
            error
          )
        );
    }

    if (!local) {
      this.emit(`producer${changeEvent[change]}` as any, producer);
    }

    producer?.[`${change}`]();
  }

  public async createTransports(iceServers?: RTCIceServer[]): Promise<{
    sendTransport: Transport | undefined;
    recvTransport: Transport | undefined;
  }> {
    try {
      const routerRtpCapabilities =
        await this.signaling.sendRequest<RtpCapabilities>(
          'getRouterRtpCapabilities'
        );

      await this.mediasoup.load({ routerRtpCapabilities });

      this.sendTransport = await this.createTransport(
        'createSendTransport',
        iceServers
      );
      this.recvTransport = await this.createTransport(
        'createRecvTransport',
        iceServers
      );
    } catch (error) {
      logger.error('error on starting mediasoup transports [error:%o]', error);
    }

    return {
      sendTransport: this.sendTransport,
      recvTransport: this.recvTransport,
    };
  }

  private async createTransport(
    creator: 'createSendTransport' | 'createRecvTransport',
    iceServers?: RTCIceServer[]
  ): Promise<Transport> {
    const { id, iceParameters, iceCandidates, dtlsParameters } =
      await this.signaling.sendRequest<any>('createWebRtcTransport', {
        forceTcp: false,
        producing: creator === 'createSendTransport',
        consuming: creator === 'createRecvTransport',
      });

    const transport = this.mediasoup[creator]({
      id,
      iceParameters,
      iceCandidates,
      dtlsParameters,
      iceServers,
    });

    // eslint-disable-next-line no-shadow
    transport.on('connect', ({ dtlsParameters }, callback, errback) => {
      if (!transport) {
        return;
      }

      this.signaling
        .sendRequest('connectWebRtcTransport', {
          transportId: transport.id,
          dtlsParameters,
        })
        .then(callback)
        .catch(errback);
    });

    transport.on(
      'produce',
      async ({ kind, rtpParameters, appData }, callback, errback) => {
        if (!transport) return;

        this.signaling
          .sendRequest('produce', {
            transportId: transport.id,
            kind,
            rtpParameters,
            appData,
          })
          .then(callback)
          .catch(errback);
      }
    );

    return transport;
  }

  public async produce<T extends Producer>(
    producerOptions: ProducerOptions
  ): Promise<T> {
    logger.debug('produce() [options:%o]', producerOptions);

    if (!this.sendTransport) {
      throw new Error('Producer can not be created without sendTransport');
    }

    const producer = await this.sendTransport.produce(producerOptions);

    const { kind, track } = producer;

    if (kind === 'audio' && track) {
      const harkStream = new MediaStream();

      harkStream.addTrack(track);

      const producerHark = hark(harkStream, {
        play: false,
        interval: 100,
        threshold: -60, // TODO: get from state
        history: 100,
      });

      producer.appData.hark = producerHark;
      producer.appData.volumeWatcher = new VolumeWatcher({
        hark: producerHark,
      });
    }

    this.producers.set(producer.id, producer);

    producer.observer.once('close', () => {
      this.producers.delete(producer.id);

      if (kind === 'audio') {
        (producer.appData.hark as hark.Harker).stop();
        producer.appData.volumeWatcher = null;
      }
    });

    producer.once('transportclose', () => {
      // producer 的end行为 应该都是本地
      // this.changeProducer(producer.id, 'close', false);
      this.changeProducer(producer.id, 'close', true);
    });

    producer.once('trackended', () => {
      // this.changeProducer(producer.id, 'close', false);
      // producer 的end行为 应该都是本地
      this.changeProducer(producer.id, 'close', true);
    });

    return producer as T;
  }

  private async resumeConsumer(
    consumer: MediaClientConsumer,
    { initial = false } = {}
  ) {
    logger.debug('resumeConsumer() [consumer:"%o"]', consumer);

    if ((!initial && !consumer.paused) || consumer.closed) return;

    try {
      consumer.resume();
      await this.signaling.sendRequest('resumeConsumer', {
        consumerId: consumer.id,
      });
    } catch (error: any) {
      logger.error(
        'resumeConsumer() [consumerId: %s; error:"%o"]',
        consumer.id,
        error
      );
      if (error.notFoundInMediasoupError) {
        this.closeConsumer(consumer.id);
      }
    }

    this.emit('consumerResumed', consumer);
  }

  private closeConsumer(consumerId: string) {
    const consumer = this.consumers.get(consumerId);

    if (!consumer) {
      return;
    }

    consumer.close();

    if (consumer.appData.hark != null) {
      consumer.appData.hark.stop();
    }

    this.consumers.delete(consumerId);

    this.emit('consumerClosed', consumer);
  }
}
