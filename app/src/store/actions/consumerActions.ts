import { createAction } from '@reduxjs/toolkit';
import type { ConsumerType } from '../reducers/consumers';

export const addConsumer = createAction<{
  consumer: ConsumerType;
  peerId: string;
}>('ADD_CONSUMER');

export const removeConsumer = createAction<{
  consumerId: string;
  peerId: string;
}>('REMOVE_CONSUMER');

export const clearConsumers = () => ({
  type: 'CLEAR_CONSUMERS',
});

export const setConsumerPaused = (consumerId, originator) => ({
  type: 'SET_CONSUMER_PAUSED',
  payload: { consumerId, originator },
});

export const setConsumerResumed = (consumerId, originator) => ({
  type: 'SET_CONSUMER_RESUMED',
  payload: { consumerId, originator },
});

export const setConsumerCurrentLayers = (
  consumerId,
  spatialLayer,
  temporalLayer
) => ({
  type: 'SET_CONSUMER_CURRENT_LAYERS',
  payload: { consumerId, spatialLayer, temporalLayer },
});

export const setConsumerPreferredLayers = (
  consumerId,
  spatialLayer,
  temporalLayer
) => ({
  type: 'SET_CONSUMER_PREFERRED_LAYERS',
  payload: { consumerId, spatialLayer, temporalLayer },
});

export const setConsumerPriority = (consumerId, priority) => ({
  type: 'SET_CONSUMER_PRIORITY',
  payload: { consumerId, priority },
});

export const setConsumerTrack = (consumerId, track) => ({
  type: 'SET_CONSUMER_TRACK',
  payload: { consumerId, track },
});

export const setConsumerScore = (consumerId, score) => ({
  type: 'SET_CONSUMER_SCORE',
  payload: { consumerId, score },
});

export const setConsumerAudioGain = (consumerId, audioGain) => ({
  type: 'SET_CONSUMER_AUDIO_GAIN',
  payload: { consumerId, audioGain },
});

export const setConsumerOpusConfig = (consumerId, opusConfig) => ({
  type: 'SET_CONSUMER_OPUS_CONFIG',
  payload: { consumerId, opusConfig },
});
