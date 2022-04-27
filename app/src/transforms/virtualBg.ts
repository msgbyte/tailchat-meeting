import { SelfieSegmentation, Results } from '@mediapipe/selfie_segmentation';
import { once } from 'lodash-es';
import Logger from '../Logger';

/* eslint-disable */

/**
 * Reference:
 * - https://github.com/jitsi/jitsi-meet/blob/HEAD/react/features/stream-effects/virtual-background/JitsiStreamBackgroundEffect.js
 * - https://github.com/akhil-rana/virtual-bg/blob/HEAD/virtual-bg.js
 */

const logger = new Logger('VirtualBg');

/**
 * 虚拟背景
 */
class VirtualBackgroundEffect {
  inputVideoElement = document.createElement('video');
  outputCanvasElement = document.createElement('canvas');

  constructor() {
    document.body.append(this.inputVideoElement, this.outputCanvasElement);
    document.body.append(
      this.foregroundCanvasElement,
      this.backgroundCanvasElement
    );
  }

  /**
   * 开始应用虚拟背景
   */
  start(inputVideoStream: MediaStream) {
    const firstVideoTrack = inputVideoStream.getVideoTracks()[0];
    const { height, width, frameRate } = firstVideoTrack.getSettings
      ? firstVideoTrack.getSettings()
      : firstVideoTrack.getConstraints();

    this.inputVideoElement.srcObject = inputVideoStream;
    this.inputVideoElement.width = parseInt(String(width), 10);
    this.inputVideoElement.height = parseInt(String(height), 10);
    this.outputCanvasElement.width = parseInt(String(width), 10);
    this.outputCanvasElement.height = parseInt(String(height), 10);

    this.segmentBackground().then(() => {
      this.inputVideoElement.play();
    });

    return this.outputCanvasElement
      .captureStream(Number(frameRate))
      .getVideoTracks()[0];
  }

  /**
   * 停止所有的虚拟背景
   */
  stop() {
    this.selfieSegmentation.close();
    this.selfieSegmentation = null;
  }

  /**
   * 应用背景虚化
   */
  applyBlur(blurIntensity = 7) {
    if (!this.backgroundCanvasCtx) {
      return;
    }

    this.effectType = 'blur';
    this.foregroundType = 'normal';
    this.backgroundCanvasCtx.filter = `blur(${blurIntensity}px)`;
  }

  /**
   * 应用图片背景
   */
  applyImageBackground(imageUrl: string) {
    const image = document.createElement('img');
    image.src = imageUrl;
    this.effectType = 'image';
    this.foregroundType = 'normal';
    this.backgroundImage = image;
  }

  /**
   * 应用视频背景
   */
  applyVideoBackground(video: HTMLVideoElement) {
    this.backgroundVideo = video;
    video.autoplay = true;
    video.loop = true;
    video.addEventListener('play', () => {
      video.muted = true;
    });
    this.effectType = 'video';
  }

  /**
   * 应用屏幕共享背景
   */
  applyScreenBackground(stream: MediaStream) {
    const videoElement = document.createElement('video');
    videoElement.srcObject = stream;
    this.backgroundVideo = videoElement;

    videoElement.autoplay = true;
    videoElement.loop = true;
    videoElement.addEventListener('play', () => {
      videoElement.muted = true;
    });
    this.effectType = 'video';
  }

  changeForegroundType(type: 'normal' | 'presenter', offset = 0) {
    this.foregroundType = type;
    this.presenterModeOffset = offset;
  }

  private foregroundCanvasElement = document.createElement('canvas');
  private backgroundCanvasElement = document.createElement('canvas');
  private backgroundCanvasCtx = this.backgroundCanvasElement.getContext('2d');

  private outputCanvasCtx: CanvasRenderingContext2D | null = null;
  private effectType = 'blur'; // blur | video | image
  private backgroundImage: HTMLImageElement | null = null;
  private backgroundVideo: HTMLVideoElement | null = null;
  private foregroundType = 'normal'; // normal | presenter
  private presenterModeOffset = 0;
  private selfieSegmentation: SelfieSegmentation | null = null;

  /**
   * 背景分割
   */
  private async segmentBackground(modelSelection = 1) {
    this.foregroundCanvasElement.width = this.backgroundCanvasElement.width =
      this.outputCanvasElement.width;
    this.foregroundCanvasElement.height = this.backgroundCanvasElement.height =
      this.outputCanvasElement.height;
    this.outputCanvasCtx = this.outputCanvasElement.getContext('2d');

    if (this.selfieSegmentation) {
      logger.warn('Skip because of selfieSegmentation existed');
      return;
    }
    this.selfieSegmentation = new SelfieSegmentation({
      locateFile: (file) => {
        // return `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${file}`;
        return `/vendor/selfie_segmentation/${file}`;
      },
    });
    await this.selfieSegmentation.initialize();
    this.selfieSegmentation.setOptions({
      modelSelection: modelSelection,
    });
    this.selfieSegmentation.onResults((results) => {
      this.mergeForegroundBackground(
        this.foregroundCanvasElement,
        this.backgroundCanvasElement,
        results
      );
    });

    this.bindInputVideoElementEventListener();
  }

  /**
   * 发送事件
   */
  private bindInputVideoElementEventListener = once(() => {
    this.inputVideoElement.addEventListener('play', () => {
      const step = async () => {
        if (this.selfieSegmentation) {
          await this.selfieSegmentation.send({ image: this.inputVideoElement });
          requestAnimationFrame(step);
        }
      };

      logger.debug('Start run selfieSegmentation');
      requestAnimationFrame(step);
    });
  });

  private mergeForegroundBackground(
    foregroundCanvasElement: HTMLCanvasElement,
    backgroundCanvasElement: HTMLCanvasElement,
    results: Results
  ) {
    if (!this.backgroundCanvasCtx || !this.outputCanvasCtx) {
      return;
    }

    this.makeCanvasLayer(results, foregroundCanvasElement, 'foreground');
    if (this.effectType === 'blur') {
      this.makeCanvasLayer(results, backgroundCanvasElement, 'background');
    } else if (this.effectType === 'image' && !!this.backgroundImage) {
      this.backgroundCanvasCtx.drawImage(
        this.backgroundImage,
        0,
        0,
        backgroundCanvasElement.width,
        backgroundCanvasElement.height
      );
    } else if (this.effectType === 'video' && !!this.backgroundVideo) {
      this.backgroundCanvasCtx.drawImage(
        this.backgroundVideo,
        0,
        0,
        backgroundCanvasElement.width,
        backgroundCanvasElement.height
      );
    }
    this.outputCanvasCtx.drawImage(backgroundCanvasElement, 0, 0);
    if (this.foregroundType === 'presenter') {
      this.outputCanvasCtx.drawImage(
        foregroundCanvasElement,
        foregroundCanvasElement.width * 0.5 - this.presenterModeOffset,
        foregroundCanvasElement.height * 0.5,
        foregroundCanvasElement.width * 0.5,
        foregroundCanvasElement.height * 0.5
      );
    } else {
      this.outputCanvasCtx.drawImage(foregroundCanvasElement, 0, 0);
    }
  }

  private makeCanvasLayer(
    results: Results,
    canvasElement: HTMLCanvasElement,
    type: 'foreground' | 'background'
  ) {
    const canvasCtx = canvasElement.getContext('2d');
    if (!canvasCtx) {
      return;
    }

    canvasCtx.save();

    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    canvasCtx.drawImage(
      results.segmentationMask,
      0,
      0,
      canvasElement.width,
      canvasElement.height
    );
    if (type === 'foreground') {
      canvasCtx.globalCompositeOperation = 'source-in';
    }

    canvasCtx.drawImage(
      results.image,
      0,
      0,
      canvasElement.width,
      canvasElement.height
    );

    canvasCtx.restore();
  }
}

export const virtualBackgroundEffect = new VirtualBackgroundEffect();
