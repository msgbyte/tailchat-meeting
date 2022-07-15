import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface LobbyPeersState {
  [peerId: string]: {
    id: string;
    displayName?: string;
    picture?: string;
    promotionInProgress?: boolean;
  };
}

const initialState: LobbyPeersState = {};

const lobbyPeersSlice = createSlice({
  name: 'lobbyPeers',
  initialState,
  reducers: {
    addLobbyPeer(state, action: PayloadAction<string>) {
      const peerId = action.payload;
      state[peerId] = {
        id: peerId,
      };
    },
    removeLobbyPeer(state, action: PayloadAction<string>) {
      const peerId = action.payload;

      delete state[peerId];
    },
    setLobbyPeerDisplayName(
      state,
      action: PayloadAction<{ peerId: string; displayName: string }>
    ) {
      const { peerId, displayName } = action.payload;

      if (state[peerId]) {
        state[peerId].displayName = displayName;
      }
    },
    setLobbyPeerPicture(
      state,
      action: PayloadAction<{ peerId: string; picture: string }>
    ) {
      const { peerId, picture } = action.payload;

      if (state[peerId]) {
        state[peerId].picture = picture;
      }
    },
    setLobbyPeerPromotionInProgress(
      state,
      action: PayloadAction<{ peerId: string; promotionInProgress: boolean }>
    ) {
      const { peerId, promotionInProgress } = action.payload;

      if (state[peerId]) {
        state[peerId].promotionInProgress = promotionInProgress;
      }
    },
  },
});

export const lobbyPeersActions = lobbyPeersSlice.actions;
export const lobbyPeersReducer = lobbyPeersSlice.reducer;
