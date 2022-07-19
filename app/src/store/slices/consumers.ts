import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface ConsumerType {
  id: string;
  peerId: string;
  kind: any;
  type: any;
  locallyPaused: boolean;
  remotelyPaused: boolean;
  rtpParameters: any;
  source: any;
  width: number;
  height: number;
  resolutionScalings: any;
  spatialLayers: any;
  temporalLayers: any;
  preferredSpatialLayer: number;
  preferredTemporalLayer: number;
  currentSpatialLayer?: number;
  currentTemporalLayer?: number;
  priority: number;
  codec: string;
  track: any;
  score: any;
  audioGain: any;
  opusConfig: any;
}

export interface ConsumersState {
  [key: string]: ConsumerType;
}

const initialState: ConsumersState = {};

const consumersSlice = createSlice({
  name: 'consumers',
  initialState,
  reducers: {
    addConsumer(
      state,
      action: PayloadAction<{ consumer: ConsumerType; peerId: string }>
    ) {
      const { consumer } = action.payload;

      state[consumer.id] = consumer;
    },
    removeConsumer(
      state,
      action: PayloadAction<{ consumerId: string; peerId: string }>
    ) {
      const { consumerId } = action.payload;

      delete state[consumerId];
    },
    clearConsumers(state) {
      state = {};
    },
    setConsumerPaused(
      state,
      action: PayloadAction<{
        consumerId: string;
        originator?: 'local' | 'remote';
      }>
    ) {
      const { consumerId, originator } = action.payload;
      const consumer = state[consumerId];

      if (state[consumerId]) {
        state[consumerId] =
          originator === 'local'
            ? { ...consumer, locallyPaused: true }
            : { ...consumer, remotelyPaused: true };
      }
    },
    setConsumerResumed(
      state,
      action: PayloadAction<{
        consumerId: string;
        originator?: 'local' | 'remote';
      }>
    ) {
      const { consumerId, originator } = action.payload;
      const consumer = state[consumerId];

      if (state[consumerId]) {
        state[consumerId] =
          originator === 'local'
            ? { ...consumer, locallyPaused: false }
            : { ...consumer, remotelyPaused: false };
      }
    },
    setConsumerCurrentLayers(
      state,
      action: PayloadAction<{
        consumerId: string;
        spatialLayer: number;
        temporalLayer: number;
      }>
    ) {
      const { consumerId, spatialLayer, temporalLayer } = action.payload;

      if (state[consumerId]) {
        state[consumerId].currentSpatialLayer = spatialLayer;
        state[consumerId].currentTemporalLayer = temporalLayer;
      }
    },
    setConsumerPreferredLayers(
      state,
      action: PayloadAction<{
        consumerId: string;
        spatialLayer: number;
        temporalLayer: number;
      }>
    ) {
      const { consumerId, spatialLayer, temporalLayer } = action.payload;

      if (state[consumerId]) {
        state[consumerId].preferredSpatialLayer = spatialLayer;
        state[consumerId].preferredTemporalLayer = temporalLayer;
      }
    },
    setConsumerPriority(
      state,
      action: PayloadAction<{
        consumerId: string;
        priority: number;
      }>
    ) {
      const { consumerId, priority } = action.payload;

      if (state[consumerId]) {
        state[consumerId].priority = priority;
      }
    },
    setConsumerTrack(
      state,
      action: PayloadAction<{
        consumerId: string;
        track: MediaStreamTrack;
      }>
    ) {
      const { consumerId, track } = action.payload;

      if (state[consumerId]) {
        state[consumerId].track = track;
      }
    },
    setConsumerScore(
      state,
      action: PayloadAction<{
        consumerId: string;
        score: number;
      }>
    ) {
      const { consumerId, score } = action.payload;
      if (state[consumerId]) {
        state[consumerId].score = score;
      }
    },
    setConsumerAudioGain(
      state,
      action: PayloadAction<{
        consumerId: string;
        audioGain: number;
      }>
    ) {
      const { consumerId, audioGain } = action.payload;
      if (state[consumerId]) {
        state[consumerId].audioGain = audioGain;
      }
    },
    setConsumerOpusConfig(
      state,
      action: PayloadAction<{
        consumerId: string;
        opusConfig: any;
      }>
    ) {
      const { consumerId, opusConfig } = action.payload;
      if (state[consumerId]) {
        state[consumerId].opusConfig = opusConfig;
      }
    },
  },
});

export const consumersActions = consumersSlice.actions;
export const consumersReducer = consumersSlice.reducer;
