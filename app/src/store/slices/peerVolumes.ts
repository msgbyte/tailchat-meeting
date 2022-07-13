import { meActions } from '../slices/me';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { peersActions } from './peers';

export interface ChatMessage {
  type: 'message';
  time: number;
  sender: 'response' | 'client';
  isRead: boolean;
  name: string;
  peerId: string;
  picture: string;
  text: string;
}

export interface PeerVolumesState {
  [peerId: string]: number;
}

const initialState: PeerVolumesState = {};

const peerVolumesSlice = createSlice({
  name: 'peerVolumes',
  initialState,
  reducers: {
    setPeerVolume: (
      state,
      action: PayloadAction<{ peerId: string; volume: number }>
    ) => {
      const { peerId, volume } = action.payload;
      const dBs = volume < -100 ? -100 : volume;

      return { ...state, [peerId]: dBs };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(meActions.setMe, (state, action) => {
        const { peerId } = action.payload;
        state[peerId] = -100;
      })
      .addCase(peersActions.addPeer, (state, action) => {
        const peer = action.payload;

        state[peer.id] = -100;
      })
      .addCase(peersActions.removePeer, (state, action) => {
        const { peerId } = action.payload;

        delete state[peerId];
      });
  },
});

export const peerVolumesActions = peerVolumesSlice.actions;
export const peerVolumesReducer = peerVolumesSlice.reducer;
