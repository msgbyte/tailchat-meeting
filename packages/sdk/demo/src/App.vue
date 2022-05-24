<template>
  <div>
    <div>远程地址: {{ meetingUrl }}</div>
    <div>
      <button id="webcam-btn" @click="switchWebcam">
        {{ enabledWebcam ? '关闭' : '开启' }} 摄像头
      </button>
      <button id="mic-btn" @click="switchMic">
        {{ enabledMic ? '关闭' : '开启' }} 麦克风
      </button>
    </div>
    <div>
      <video ref="webcamEl" :autoPlay="true"></video>
      <div>
        音量信息: <span>{{ JSON.stringify(volume) }}</span>
      </div>
    </div>
    <div>
      <div>其他参会人:</div>
      <div>{{ JSON.stringify(peers) }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { TailchatMeetingClient, Peer } from '../../src/index';

const meetingUrl = process.env.TAILCHAT_MEETING_URL ?? '';
console.log('meetingUrl', meetingUrl);

const client = ref<TailchatMeetingClient | null>(null);
const volume = ref({});
const peers = ref<Peer[]>([]);
const enabledWebcam = computed(() => client.value?.webcamEnabled ?? false);
const enabledMic = computed(() => client.value?.micEnabled ?? false);

const webcamEl = ref<HTMLVideoElement>();
const peersEl = ref<HTMLDivElement>();

onMounted(() => {
  const _client = new TailchatMeetingClient(
    meetingUrl,
    Math.random().toString()
  );

  _client.on('webcamProduce', (webcamProducer) => {
    if (webcamEl.value && webcamProducer.track) {
      webcamEl.value.srcObject = new MediaStream([webcamProducer.track]);
    }
  });

  _client.on('webcamClose', () => {
    if (webcamEl.value) {
      webcamEl.value.srcObject = null;
    }
  });

  _client.on('micProduce', (micProducer) => {
    (micProducer.appData as any).volumeWatcher.on(
      'volumeChange',
      (data: any) => {
        volume.value = data;
      }
    );
  });

  _client.on('micClose', () => {
    console.log('micClose');
  });

  client.value = _client;
  joinRoom();
});

async function joinRoom() {
  (async () => {
    if (!client.value) {
      console.error('client is not found');
      return;
    }

    try {
      await client.value.join('123456789', {
        video: true,
        audio: true,
        displayName: 'foo',
        picture: '',
      });

      const devices = await client.value.getAvailableMediaDevices();
      console.log('devices', devices);

      console.log('client.value', client.value);

      if (client.value.room) {
        peers.value = client.value.room.peers;
        client.value.room.on('peersUpdated', (_peers) => {
          peers.value = _peers;
        });
      }
    } catch (err) {
      console.error(err);
    }
  })();
}

function switchWebcam() {
  if (!client.value) {
    return;
  }

  if (client.value.webcamEnabled) {
    client.value.disableWebcam();
  } else {
    client.value.enableWebcam();
  }
}

function switchMic() {
  if (!client.value) {
    return;
  }

  if (client.value.micEnabled) {
    client.value.disableMic();
  } else {
    client.value.enableMic();
  }
}
</script>
