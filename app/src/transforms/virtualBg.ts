import { SelfieSegmentation, Results } from '@mediapipe/selfie_segmentation';
import { once } from 'lodash-es';
import { segmentBackground, applyBlur } from 'virtual-bg';

/* eslint-disable */

/**
 * Reference: 
 * - https://github.com/jitsi/jitsi-meet/blob/HEAD/react/features/stream-effects/virtual-background/JitsiStreamBackgroundEffect.js
 * - https://github.com/akhil-rana/virtual-bg/blob/HEAD/virtual-bg.js
 */

const init = once(async () =>
{
	const selfieSegmentation = new SelfieSegmentation({
		locateFile : (file) =>
		{
			return `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation@0.1.1632777926/${file}`;
		}
	});

	selfieSegmentation.onResults(onResults);

	await selfieSegmentation.initialize();

	return selfieSegmentation;
});

const canvasElement = document.createElement('canvas');
const canvasCtx = canvasElement.getContext('2d')!;
const activeEffect: 'background' | 'mask' | 'both' = 'mask';

function onResults(results: Results): void
{
	// Hide the spinner.
	document.body.classList.add('virtual-bg-loaded');

	// Draw the overlays.
	canvasCtx.save();

	canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

	canvasCtx.drawImage(
		results.segmentationMask, 0, 0, canvasElement.width,
		canvasElement.height);

	// Only overwrite existing pixels.
	if (activeEffect === 'mask' || activeEffect === 'both')
	{
		canvasCtx.globalCompositeOperation = 'source-in';
		// This can be a color or a texture or whatever...
		canvasCtx.fillStyle = '#00FF007F';
		canvasCtx.fillRect(0, 0, canvasElement.width, canvasElement.height);
	}
	else
	{
		canvasCtx.globalCompositeOperation = 'source-out';
		canvasCtx.fillStyle = '#0000FF7F';
		canvasCtx.fillRect(0, 0, canvasElement.width, canvasElement.height);
	}

	// Only overwrite missing pixels.
	canvasCtx.globalCompositeOperation = 'destination-atop';
	canvasCtx.drawImage(
		results.image, 0, 0, canvasElement.width, canvasElement.height);

	canvasCtx.restore();
}

/**
 * 应用虚拟背景功能
 */
// export function applyVirtualBg(inputVideoTrack: MediaStreamTrack, rateLimit = 30)
export function applyVirtualBg(inputVideoStream: MediaStream, rateLimit = 30)
{
	const inputVideoElement = document.createElement('video');
	const outputCanvasElement = document.createElement('canvas');

	document.body.append(inputVideoElement, outputCanvasElement)

	inputVideoElement.srcObject = inputVideoStream;
	inputVideoElement.autoplay = true

	// segments foreground & background
	segmentBackground(inputVideoElement, outputCanvasElement);

	// applies a blur intensity of 7px to the background 
	applyBlur(7);

	return (outputCanvasElement as any).captureStream(rateLimit).getVideoTracks()[0];

	// init().then((selfieSegmentation) =>
	// {
	// 	const firstVideoTrack = inputVideoStream.getVideoTracks()[0];
	// 	const { height, width }
	// 		= firstVideoTrack.getSettings ?
	// 			firstVideoTrack.getSettings() :
	// 			firstVideoTrack.getConstraints();

	// 	const inputVideoElement = document.createElement('video');

	// 	inputVideoElement.srcObject = inputVideoStream;
	// 	inputVideoElement.autoplay = true;
	// 	inputVideoElement.width = parseInt(String(width), 10);
	// 	inputVideoElement.height = parseInt(String(height), 10);
	// 	document.body.appendChild(inputVideoElement);
	// 	selfieSegmentation.send({
	// 		image : inputVideoElement
	// 	});
	// });

	// // TODO captureStream 有类型问题，先无视
	// const videoTrack = (canvasElement as any).captureStream(rateLimit).getVideoTracks()[0];

	// return videoTrack;
}