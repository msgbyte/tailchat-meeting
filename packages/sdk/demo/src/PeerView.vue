<template>
  <video ref="videoEl" :autoplay="true" />
</template>

<script setup lang="ts">
import { effect, ref } from 'vue';

const videoEl = ref<HTMLVideoElement>();

const props = defineProps({
  track: MediaStreamTrack,
});

effect(() => {
  if (videoEl.value && props.track) {
    videoEl.value.srcObject = new MediaStream([props.track]);
  }
});
</script>
