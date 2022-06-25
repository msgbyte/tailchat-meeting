<template>
  <div>
    <a-collapse accordion :default-active-key="['1']">
      <a-collapse-item header="设置项" key="1">
        <div>
          <a-radio-group v-model="settingView" type="button">
            <a-radio value="video">视频</a-radio>
            <a-radio value="audio">音频</a-radio>
          </a-radio-group>

          <div v-if="settingView === 'video'">
            <a-form :model="client.settings">
              <a-form-item field="resolution" label="清晰度">
                <a-radio-group
                  v-model="client.settings.resolution"
                  type="button"
                >
                  <a-radio value="low">low</a-radio>
                  <a-radio value="medium">medium</a-radio>
                  <a-radio value="high">high</a-radio>
                  <a-radio value="veryhigh">veryhigh</a-radio>
                  <a-radio value="ultra">ultra</a-radio>
                </a-radio-group>
              </a-form-item>
              <a-form-item field="frameRate" label="视频帧率">
                <a-radio-group
                  v-model="client.settings.frameRate"
                  type="button"
                >
                  <a-radio :value="5">5</a-radio>
                  <a-radio :value="30">30</a-radio>
                  <a-radio :value="60">60</a-radio>
                </a-radio-group>
              </a-form-item>
              <a-form-item field="simulcast" label="是否开启联播">
                <a-switch v-model="client.settings.simulcast" />
              </a-form-item>
              <a-form-item field="simulcastSharing" label="是否联播屏幕共享">
                <a-switch v-model="client.settings.simulcastSharing" />
              </a-form-item>
              <a-form-item
                field="screenSharingResolution"
                label="屏幕共享清晰度"
              >
                <a-radio-group
                  v-model="client.settings.screenSharingResolution"
                  type="button"
                >
                  <a-radio value="low">low</a-radio>
                  <a-radio value="medium">medium</a-radio>
                  <a-radio value="high">high</a-radio>
                  <a-radio value="veryhigh">veryhigh</a-radio>
                  <a-radio value="ultra">ultra</a-radio>
                </a-radio-group>
              </a-form-item>
            </a-form>
          </div>
          <div v-if="settingView === 'audio'">
            <a-form :model="client.settings">
              <a-form-item field="autoGainControl" label="自动增益">
                <a-switch v-model="client.settings.autoGainControl" />
              </a-form-item>
              <a-form-item field="echoCancellation" label="回声消除">
                <a-switch v-model="client.settings.echoCancellation" />
              </a-form-item>
              <a-form-item field="noiseSuppression" label="噪音抑制">
                <a-switch v-model="client.settings.noiseSuppression" />
              </a-form-item>
              <a-form-item field="sampleRate" label="采样率">
                <a-radio-group
                  v-model="client.settings.sampleRate"
                  type="button"
                >
                  <a-radio :value="48000">48000</a-radio>
                  <a-radio :value="44100">44100</a-radio>
                </a-radio-group>
              </a-form-item>
              <a-form-item field="sampleSize" label="采样大小">
                <a-radio-group
                  v-model="client.settings.sampleSize"
                  type="button"
                >
                  <a-radio :value="16">16</a-radio>
                </a-radio-group>
              </a-form-item>
              <a-form-item field="channelCount" label="音频频道数">
                <a-radio-group
                  v-model="client.settings.channelCount"
                  type="button"
                >
                  <a-radio :value="1">1</a-radio>
                  <a-radio :value="2">2</a-radio>
                </a-radio-group>
              </a-form-item>
            </a-form>
          </div>
        </div>
      </a-collapse-item>
    </a-collapse>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { TailchatMeetingClient } from '../../src';

const settingView = ref('video');

const props = defineProps<{
  client: TailchatMeetingClient;
}>();
</script>
