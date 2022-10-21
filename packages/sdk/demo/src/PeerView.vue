<template>
  <div>
    <div>{{ props.track?.id }}</div>
    <div>{{ props.track?.kind }}</div>

    <video
      ref="videoEl"
      :autoplay="true"
      v-if="props.track?.kind === 'video'"
    />

    <audio
      ref="videoEl"
      :autoplay="true"
      v-if="props.track?.kind === 'audio'"
    />
  </div>
</template>

<script setup lang="ts">
import { effect, ref } from 'vue';

const videoEl = ref<HTMLVideoElement>();

const props = defineProps<{
  track: MediaStreamTrack;
}>();

effect(() => {
  if (videoEl.value && props.track) {
    videoEl.value.srcObject = new MediaStream([props.track]);
    if (videoEl.value.paused) {
      videoEl.value.play();
    }
  }
});
</script>
