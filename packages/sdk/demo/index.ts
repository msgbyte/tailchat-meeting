import { TailchatMeetingClient } from '../src/index';

const client = new TailchatMeetingClient(
  'wss://light.moonrailgun.com:4433',
  Math.random().toString()
);

client.on('webcamProduce', (webcamProducer) => {
  const webcamEl = document.querySelector<HTMLVideoElement>('#webcam');
  webcamEl.srcObject = new MediaStream([webcamProducer.track]);
  webcamEl.autoplay = true;
});

(async () => {
  await client.join('123456789', {
    video: true,
    audio: true,
    displayName: 'foo',
    picture: '',
  });

  const devices = await client.getAvailableMediaDevices();

  console.log('devices', devices);

  console.log('client', client);
})();
