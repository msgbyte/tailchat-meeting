import type {
  WebcamProducer,
  ScreenSharingProducer,
  MicProducer,
  Peer,
} from 'tailchat-meeting-sdk';
import create from 'zustand';
import { immer } from 'zustand/middleware/immer';

interface ProducerState {
  webcamProducer: WebcamProducer | null;
  screenSharingProducer: ScreenSharingProducer | null;
  micProducer: MicProducer | null;
}

interface MeetingState {
  producer: ProducerState;
  setProducer: (producer: Partial<ProducerState>) => void;
  peers: Map<string, Peer>;
  peerJoin: (peer: Peer) => void;
  peerLeave: (peer: Peer) => void;
}

export const useMeetingState = create<MeetingState>()(
  immer((set) => ({
    producer: {
      webcamProducer: null,
      screenSharingProducer: null,
      micProducer: null,
    },
    setProducer: (producer: Partial<ProducerState>) => {
      set((state) => {
        state.producer = {
          ...state.producer,
          ...producer,
        };
      });
    },
    peers: new Map(),
    peerJoin: (peer: Peer) => {
      set((state) => {
        state.peers.set(peer.id, peer);
      });
    },
    peerLeave: (peer: Peer) => {
      set((state) => {
        state.peers.delete(peer.id);
      });
    },
  }))
);
