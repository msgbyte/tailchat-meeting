import { SelfieSegmentation, Results } from '@mediapipe/selfie_segmentation';

/* eslint-disable */

/**
 * Reference:
 * - https://github.com/jitsi/jitsi-meet/blob/HEAD/react/features/stream-effects/virtual-background/JitsiStreamBackgroundEffect.js
 * - https://github.com/akhil-rana/virtual-bg/blob/HEAD/virtual-bg.js
 */

/**
 * 应用虚拟背景功能
 */
export function applyVirtualBg(inputVideoStream: MediaStream) {
  const inputVideoElement = document.createElement('video');
  const outputCanvasElement = document.createElement('canvas');

  const firstVideoTrack = inputVideoStream.getVideoTracks()[0];
  const { height, width, frameRate } = firstVideoTrack.getSettings
    ? firstVideoTrack.getSettings()
    : firstVideoTrack.getConstraints();

  inputVideoElement.srcObject = inputVideoStream;
  inputVideoElement.autoplay = true;
  inputVideoElement.width = parseInt(String(width), 10);
  inputVideoElement.height = parseInt(String(height), 10);
  outputCanvasElement.width = parseInt(String(width), 10);
  outputCanvasElement.height = parseInt(String(height), 10);

  // segments foreground & background
  segmentBackground(inputVideoElement, outputCanvasElement);

  // applies a blur intensity of 7px to the background
  applyBlur(7);

  return (outputCanvasElement as any)
    .captureStream(frameRate)
    .getVideoTracks()[0];
}

// virtual-bg

const foregroundCanvasElement = document.createElement('canvas');
const backgroundCanvasElement = document.createElement('canvas');
const backgroundCanvasCtx = backgroundCanvasElement.getContext('2d');

let outputCanvasCtx: CanvasRenderingContext2D | null = null;
let effectType = 'blur'; // blur | video | image
let backgroundImage: HTMLImageElement | null = null;
let backgroundVideo: HTMLVideoElement | null = null;
let foregroundType = 'normal'; // normal | presenter
let presenterModeOffset = 0;

/**
 * 背景分割
 */
async function segmentBackground(
  inputVideoElement: HTMLVideoElement,
  outputCanvasElement: HTMLCanvasElement,
  modelSelection = 1
) {
  foregroundCanvasElement.width = backgroundCanvasElement.width =
    outputCanvasElement.width;
  foregroundCanvasElement.height = backgroundCanvasElement.height =
    outputCanvasElement.height;
  outputCanvasCtx = outputCanvasElement.getContext('2d');

  let selfieSegmentation = new SelfieSegmentation({
    locateFile: (file) => {
      return `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${file}`;
    },
  });
  selfieSegmentation.setOptions({
    modelSelection: modelSelection,
  });
  selfieSegmentation.onResults((results) => {
    mergeForegroundBackground(
      foregroundCanvasElement,
      backgroundCanvasElement,
      results
    );
  });

  inputVideoElement.addEventListener('play', () => {
    async function step() {
      await selfieSegmentation.send({ image: inputVideoElement });
      requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  });
}

function mergeForegroundBackground(
  foregroundCanvasElement: HTMLCanvasElement,
  backgroundCanvasElement: HTMLCanvasElement,
  results: Results
) {
  if (!backgroundCanvasCtx || !outputCanvasCtx) {
    return;
  }

  makeCanvasLayer(results, foregroundCanvasElement, 'foreground');
  if (effectType === 'blur')
    makeCanvasLayer(results, backgroundCanvasElement, 'background');
  else if (effectType === 'image' && !!backgroundImage) {
    backgroundCanvasCtx.drawImage(
      backgroundImage,
      0,
      0,
      backgroundCanvasElement.width,
      backgroundCanvasElement.height
    );
  } else if (effectType === 'video' && !!backgroundVideo) {
    backgroundCanvasCtx.drawImage(
      backgroundVideo,
      0,
      0,
      backgroundCanvasElement.width,
      backgroundCanvasElement.height
    );
  }
  outputCanvasCtx.drawImage(backgroundCanvasElement, 0, 0);
  if (foregroundType === 'presenter')
    outputCanvasCtx.drawImage(
      foregroundCanvasElement,
      foregroundCanvasElement.width * 0.5 - presenterModeOffset,
      foregroundCanvasElement.height * 0.5,
      foregroundCanvasElement.width * 0.5,
      foregroundCanvasElement.height * 0.5
    );
  else outputCanvasCtx.drawImage(foregroundCanvasElement, 0, 0);
}

function makeCanvasLayer(
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

export function applyBlur(blurIntensity = 7) {
  if (!backgroundCanvasCtx) {
    return;
  }

  effectType = 'blur';
  foregroundType = 'normal';
  backgroundCanvasCtx.filter = `blur(${blurIntensity}px)`;
}

export function applyImageBackground(image: HTMLImageElement) {
  backgroundImage = image;
  foregroundType = 'normal';
  effectType = 'image';
}

export function applyVideoBackground(video: HTMLVideoElement) {
  backgroundVideo = video;
  video.autoplay = true;
  video.loop = true;
  video.addEventListener('play', () => {
    video.muted = true;
  });
  effectType = 'video';
}

export function applyScreenBackground(stream: MediaStream) {
  const videoElement = document.createElement('video');
  videoElement.srcObject = stream;
  backgroundVideo = videoElement;

  videoElement.autoplay = true;
  videoElement.loop = true;
  videoElement.addEventListener('play', () => {
    videoElement.muted = true;
  });
  effectType = 'video';
}

export function changeForegroundType(type: string, offset = 0) {
  foregroundType = type;
  presenterModeOffset = offset;
}
