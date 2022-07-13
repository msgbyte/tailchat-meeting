import { addConsumer, removeConsumer } from '../actions/consumerActions';

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

const initialState: Record<string, ConsumerType> = {};

const consumers = (state = initialState, action) => {
  switch (action.type) {
    case addConsumer.type: {
      const { consumer } = action.payload;

      return { ...state, [consumer.id]: consumer };
    }

    case removeConsumer.type: {
      const { consumerId } = action.payload;
      const newState = { ...state };

      delete newState[consumerId];

      return newState;
    }

    case 'SET_CONSUMER_PAUSED': {
      const { consumerId, originator } = action.payload;
      const consumer = state[consumerId];

      let newConsumer;

      if (originator === 'local')
        newConsumer = { ...consumer, locallyPaused: true };
      else newConsumer = { ...consumer, remotelyPaused: true };

      return { ...state, [consumerId]: newConsumer };
    }

    case 'SET_CONSUMER_RESUMED': {
      const { consumerId, originator } = action.payload;
      const consumer = state[consumerId];

      let newConsumer;

      if (originator === 'local')
        newConsumer = { ...consumer, locallyPaused: false };
      else newConsumer = { ...consumer, remotelyPaused: false };

      return { ...state, [consumerId]: newConsumer };
    }

    case 'SET_CONSUMER_CURRENT_LAYERS': {
      const { consumerId, spatialLayer, temporalLayer } = action.payload;
      const consumer = state[consumerId];
      const newConsumer = {
        ...consumer,
        currentSpatialLayer: spatialLayer,
        currentTemporalLayer: temporalLayer,
      };

      return { ...state, [consumerId]: newConsumer };
    }

    case 'SET_CONSUMER_PREFERRED_LAYERS': {
      const { consumerId, spatialLayer, temporalLayer } = action.payload;
      const consumer = state[consumerId];
      const newConsumer = {
        ...consumer,
        preferredSpatialLayer: spatialLayer,
        preferredTemporalLayer: temporalLayer,
      };

      return { ...state, [consumerId]: newConsumer };
    }

    case 'SET_CONSUMER_PRIORITY': {
      const { consumerId, priority } = action.payload;
      const consumer = state[consumerId];
      const newConsumer = { ...consumer, priority };

      return { ...state, [consumerId]: newConsumer };
    }

    case 'SET_CONSUMER_TRACK': {
      const { consumerId, track } = action.payload;
      const consumer = state[consumerId];
      const newConsumer = { ...consumer, track };

      return { ...state, [consumerId]: newConsumer };
    }

    case 'SET_CONSUMER_AUDIO_GAIN': {
      const { consumerId, audioGain } = action.payload;
      const consumer = state[consumerId];
      const newConsumer = { ...consumer, audioGain };

      return { ...state, [consumerId]: newConsumer };
    }

    case 'SET_CONSUMER_SCORE': {
      const { consumerId, score } = action.payload;
      const consumer = state[consumerId];

      if (!consumer) return state;

      const newConsumer = { ...consumer, score };

      return { ...state, [consumerId]: newConsumer };
    }

    case 'CLEAR_CONSUMERS': {
      return initialState;
    }

    case 'SET_CONSUMER_OPUS_CONFIG': {
      const { consumerId, opusConfig } = action.payload;
      const consumer = state[consumerId];
      const newConsumer = {
        ...consumer,
        opusConfig,
      };

      return { ...state, [consumerId]: newConsumer };
    }

    default:
      return state;
  }
};

export default consumers;
