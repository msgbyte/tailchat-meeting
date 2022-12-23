<template>
  <div>
    <a-space direction="vertical">
      <div>
        远程地址: <a-tag>{{ meetingUrl }}</a-tag>
      </div>
      <div>
        房间号:
        <a-tag>
          {{ roomId }}
        </a-tag>
      </div>

      <div>
        用户名: <a-tag>{{ displayName }}</a-tag>
      </div>
      <div>
        用户头像:
        <a-avatar><img alt="avatar" :src="picture" /></a-avatar>
      </div>
      <a-space>
        <a-button
          :type="enabledWebcam ? 'primary' : 'secondary'"
          @click="switchWebcam"
        >
          {{ enabledWebcam ? '关闭' : '开启' }} 摄像头
        </a-button>
        <a-button
          :type="enabledMic ? 'primary' : 'secondary'"
          @click="switchMic"
        >
          {{ enabledMic ? '关闭' : '开启' }} 麦克风
        </a-button>
        <a-button
          :type="enableScreenSharing ? 'primary' : 'secondary'"
          @click="switchScreenSharing"
        >
          {{ enableScreenSharing ? '关闭' : '开启' }} 屏幕共享
        </a-button>
      </a-space>

      <div v-if="client">
        <Settings :client="client" />
      </div>

      <div>
        <video ref="webcamEl" :autoPlay="true"></video>
        <video ref="screenSharingEl" :autoPlay="true"></video>
        <div>
          音量信息: <span>{{ JSON.stringify(volume) }}</span>
        </div>
      </div>
      <div>
        <div>其他参会人:</div>
        <div>{{ JSON.stringify(peers) }}</div>

        <div v-for="peer in peers" :key="peer.id + consumerUpdater">
          <PeerContainer :tracks="getPeerMediaTracks(peer.id)" />
        </div>
      </div>
    </a-space>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { TailchatMeetingClient, Peer } from 'tailchat-meeting-sdk';
import PeerContainer from './Peer.vue';
import Settings from './Settings.vue';
import { AvatarGenerator } from 'random-avatar-generator';
import { Chance } from 'chance';

const chance = new Chance();

const generator = new AvatarGenerator();

const meetingUrl = process.env.TAILCHAT_MEETING_URL ?? '';
console.log('meetingUrl', meetingUrl);
const roomId = '123456789';

const client = ref<TailchatMeetingClient | null>(null);
const volume = ref({});
const peers = ref<Peer[]>([]);
const enabledWebcam = ref(false);
const enabledMic = ref(false);
const enableScreenSharing = ref(false);

const webcamEl = ref<HTMLVideoElement>();
const screenSharingEl = ref<HTMLVideoElement>();
const consumerUpdater = ref<number>(0);

const displayName = chance.name();
const picture = generator.generateRandomAvatar();

onMounted(() => {
  const _client = new TailchatMeetingClient(
    meetingUrl,
    Math.random().toString()
  );

  _client.onWebcamProduce((webcamProducer) => {
    if (webcamEl.value && webcamProducer.track) {
      webcamEl.value.srcObject = new MediaStream([webcamProducer.track]);
    }

    enabledWebcam.value = true;
  });

  _client.onWebcamClose(() => {
    if (webcamEl.value) {
      webcamEl.value.srcObject = null;
    }

    enabledWebcam.value = false;
  });

  _client.onScreenSharingProduce((screenSharingProducer) => {
    if (screenSharingEl.value && screenSharingProducer.track) {
      screenSharingEl.value.srcObject = new MediaStream([
        screenSharingProducer.track,
      ]);
    }

    enableScreenSharing.value = true;
  });

  _client.onScreenSharingClose(() => {
    if (screenSharingEl.value) {
      screenSharingEl.value.srcObject = null;
    }

    enableScreenSharing.value = false;
  });

  _client.onMicProduce((micProducer) => {
    (micProducer.appData as any).volumeWatcher.on(
      'volumeChange',
      (data: any) => {
        volume.value = data;
      }
    );

    enabledMic.value = true;
  });

  _client.onMicClose(() => {
    enabledMic.value = false;
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
      await client.value.join(roomId, {
        video: false,
        audio: false,
        displayName,
        // picture: '',
        picture,
      });

      client.value.onPeerConsumerUpdate(() => {
        consumerUpdater.value++;
      });

      const devices = await client.value.getAvailableMediaDevices();
      console.log('devices', devices);

      console.log('client.value', client.value);

      if (client.value.room) {
        peers.value = client.value.room.peers;
        client.value.room.on('peersUpdated', (_peers) => {
          peers.value = [..._peers];
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

function switchScreenSharing() {
  if (!client.value) {
    return;
  }

  if (client.value.screenSharingEnabled) {
    client.value.disableScreenSharing();
  } else {
    client.value.enableScreenSharing();
  }
}

function getPeerMediaTracks(peerId: string): MediaStreamTrack[] {
  if (!client.value || !client.value.media) {
    return [];
  }

  const { webcamConsumer, micConsumer, screenConsumer } =
    client.value.getConsumersByPeerId(peerId);

  console.log(
    'peerId, webcamConsumer',
    peerId,
    webcamConsumer?.track,
    screenConsumer?.track
  );

  return [
    webcamConsumer?.track,
    micConsumer?.track,
    screenConsumer?.track,
  ].filter<MediaStreamTrack>((item): item is MediaStreamTrack => !!item);
}
</script>
