<template>
  <div>
    <div v-for="track in props.tracks" :key="track.id">
      <PeerView :track="track" />
    </div>
  </div>
</template>

<script setup lang="ts">
import PeerView from './PeerView.vue';

const props = withDefaults(
  defineProps<{
    tracks: MediaStreamTrack[];
  }>(),
  {
    tracks: () => [] as MediaStreamTrack[],
  }
);
</script>
