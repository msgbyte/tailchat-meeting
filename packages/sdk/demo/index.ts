import { TailchatMeetingClient } from '../src/index';

const client = new TailchatMeetingClient(
  process.env.TAILCHAT_MEETING_URL,
  Math.random().toString()
);

client.on('webcamProduce', (webcamProducer) => {
  const webcamEl = document.querySelector<HTMLVideoElement>('#webcam');
  webcamEl.srcObject = new MediaStream([webcamProducer.track]);
  webcamEl.autoplay = true;
});

client.on('webcamClose', () => {
  const webcamEl = document.querySelector<HTMLVideoElement>('#webcam');
  webcamEl.srcObject = null;
  webcamEl.autoplay = true;
});

client.on('micProduce', (micProducer) => {
  const volumeEl = document.querySelector<HTMLDivElement>('#volume');
  micProducer.appData.volumeWatcher.on('volumeChange', (data) => {
    volumeEl.innerText = JSON.stringify(data);
  });
});

client.on('micClose', () => {
  console.log('micClose');
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

  const peersEl = document.querySelector<HTMLButtonElement>('#peers');
  peersEl.innerText = JSON.stringify(client.room.peers);
  client.room.on('peersUpdated', (peers) => {
    console.log('peersUpdated', peers);
    peersEl.innerText = JSON.stringify(peers);
  });

  initControl();
})();

function initControl() {
  const webcamBtnEl = document.querySelector<HTMLButtonElement>('#webcam-btn');
  webcamBtnEl.addEventListener('click', () => {
    if (client.webcamEnabled) {
      client.disableWebcam();
    } else {
      client.enableWebcam();
    }
  });
  const micBtnEl = document.querySelector<HTMLButtonElement>('#mic-btn');
  micBtnEl.addEventListener('click', () => {
    if (client.micEnabled) {
      client.disableMic();
    } else {
      client.enableMic();
    }
  });
}
