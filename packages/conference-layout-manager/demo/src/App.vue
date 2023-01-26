<template>
  <div class="root">
    <div>
      <button @click="() => count++">增加</button>
      <button @click="() => count--" :disabled="count <= 1">减少</button>
      <button @click="() => page--" :disabled="page === 1">前一页</button>
      <button @click="() => page++" :disabled="page >= maxPage">后一页</button>
      <div>总数: {{ count }} 当前页: {{ page }}</div>
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
          {{ item.seq }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { ConferenceLayoutManager } from '../../src/index';

const count = ref(2);
const page = ref(1);
const maxPage = ref(1);
const containerEl = ref<HTMLDivElement>();

const layoutManager = computed(() => {
  if (!containerEl.value) {
    return null;
  }

  const rect = containerEl.value.getBoundingClientRect();

  const layoutManager = new ConferenceLayoutManager({
    width: rect.width,
    height: rect.height,
    fillIfLoose: false,
  });

  return layoutManager;
});

const layout = computed(() => {
  if (!layoutManager.value) {
    return [];
  }

  layoutManager.value.updateCount(count.value);
  layoutManager.value.updatePage(page.value);

  page.value = layoutManager.value.currentPage;
  maxPage.value = layoutManager.value.maxPage;

  return layoutManager.value.getLayout();
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
