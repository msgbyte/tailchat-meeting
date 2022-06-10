<template>
  <div class="root">
    <div>
      <button @click="() => count++">增加</button>
      <button @click="() => count--" :disabled="count <= 1">减少</button>
      <div>总数: {{ count }}</div>
    </div>
    <div ref="containerEl" class="peers">
      <div
        v-for="(item, i) in layout"
        :key="i"
        :style="{
          left: item.left + 'px',
          top: item.top + 'px',
          width: item.cellWidth + 'px',
          height: item.cellHeight + 'px',
        }"
        class="peer"
      >
        <div>
          {{ i }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { PeerLayoutManager } from '../../src/index';

const count = ref(2);
const containerEl = ref<HTMLDivElement>();

const layout = computed(() => {
  if (!containerEl.value) {
    return [];
  }

  const rect = containerEl.value.getBoundingClientRect();

  const layoutManager = new PeerLayoutManager({
    width: rect.width,
    height: rect.height,
  });

  return layoutManager.parse(count.value);
});
</script>

<style scoped>
.root {
  display: flex;
  flex-direction: column;
  width: 800px;
  height: 600px;
}

.peers {
  position: relative;
  flex: 1;
}

.peer {
  background-color: #cccccc;
  border: 1px solid red;
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
