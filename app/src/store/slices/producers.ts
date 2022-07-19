import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface ProducerInfo {
  id: any;
  deviceLabel?: any;
  source: string;
  paused: boolean;
  track: MediaStreamTrack;
  rtpParameters: any;
  codec: any;
  score?: number;
  locallyPaused?: boolean;
  remotelyPaused?: boolean;
}

export interface ProducersState {
  [key: string]: ProducerInfo;
}

const initialState: ProducersState = {};

const producersSlice = createSlice({
  name: 'producers',
  initialState,
  reducers: {
    addProducer(state, action: PayloadAction<ProducerInfo>) {
      const producer = action.payload;
      state[producer.id] = producer;
    },
    removeProducer(state, action: PayloadAction<string>) {
      const producerId = action.payload;
      delete state[producerId];
    },
    setProducerPaused(
      state,
      action: PayloadAction<{
        producerId: string;
        originator?: any;
      }>
    ) {
      const { producerId, originator } = action.payload;
      const producer = state[producerId];

      state[producerId] =
        originator === 'local'
          ? { ...producer, locallyPaused: true }
          : { ...producer, remotelyPaused: true };
    },
    setProducerResumed(
      state,
      action: PayloadAction<{
        producerId: string;
        originator?: any;
      }>
    ) {
      const { producerId, originator } = action.payload;
      const producer = state[producerId];

      state[producerId] =
        originator === 'local'
          ? { ...producer, locallyPaused: false }
          : { ...producer, remotelyPaused: false };
    },
    setProducerTrack(
      state,
      action: PayloadAction<{
        producerId: string;
        track: MediaStreamTrack;
      }>
    ) {
      const { producerId, track } = action.payload;
      const producer = state[producerId];
      if (producer) {
        producer.track = track;
      }
    },
    setProducerScore(
      state,
      action: PayloadAction<{
        producerId: string;
        score: number;
      }>
    ) {
      const { producerId, score } = action.payload;
      const producer = state[producerId];
      if (producer) {
        producer.score = score;
      }
    },
  },
});

export const producersActions = producersSlice.actions;
export const producersReducer = producersSlice.reducer;
