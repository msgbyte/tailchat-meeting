<template>
  <div>
    <div>远程地址: {{ meetingUrl }}</div>
    <div>房间号: {{ roomId }}</div>
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

      <div v-for="peer in peers" :key="peer.id + consumerUpdater">
        <PeerView :track="getMediaWebcamTrack(peer.id, 'video')" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { TailchatMeetingClient, Peer, MediaKind } from '../../src/index';
import PeerView from './PeerView.vue';

const meetingUrl = process.env.TAILCHAT_MEETING_URL ?? '';
console.log('meetingUrl', meetingUrl);
const roomId = '123456789';

const client = ref<TailchatMeetingClient | null>(null);
const volume = ref({});
const peers = ref<Peer[]>([]);
const enabledWebcam = computed(() => client.value?.webcamEnabled ?? false);
const enabledMic = computed(() => client.value?.micEnabled ?? false);

const webcamEl = ref<HTMLVideoElement>();
const peersEl = ref<HTMLDivElement>();
const consumerUpdater = ref<number>(0);

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

  _client.media?.on('consumerCreated', () => consumerUpdater.value++);
  _client.media?.on('consumerResumed', () => consumerUpdater.value++);
  _client.media?.on('consumerClosed', () => consumerUpdater.value++);
  _client.media?.on('consumerPaused', () => consumerUpdater.value++);

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
      await client.value.join(roomId, {
        video: false,
        audio: false,
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

function getMediaWebcamTrack(peerId: string): MediaStreamTrack | undefined {
  if (!client.value || !client.value.media) {
    return;
  }

  const { webcamConsumer } = client.value.getConsumersByPeerId(peerId);

  return webcamConsumer?.track;
}
</script>
