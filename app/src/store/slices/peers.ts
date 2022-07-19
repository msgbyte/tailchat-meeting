import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Peer } from 'tailchat-meeting-sdk';
import { consumersActions } from '../slices/consumers';

interface PeerInfo extends Peer {
  consumers: string[];
  localRecordingState?: 'start' | 'resume' | 'pause' | 'stop';
  localRecordingConsent?: any;
  recordingStateHistory?: any;
  peerVideoInProgress?: boolean;
  peerAudioInProgress?: boolean;
  peerScreenInProgress?: boolean;
  raisedHandInProgress?: boolean;
  peerModifyRolesInProgress?: boolean;
  peerKickInProgress?: boolean;
  stopPeerAudioInProgress?: boolean;
  stopPeerVideoInProgress?: boolean;
  stopPeerScreenSharingInProgress?: boolean;
}

export interface PeersState {
  [peerId: string]: PeerInfo;
}

const initialState: PeersState = {};

const peersSlice = createSlice({
  name: 'peers',
  initialState,
  reducers: {
    addPeer: (state, action: PayloadAction<PeerInfo>) => {
      const peer = action.payload;
      state[peer.id] = peer;
    },
    removePeer: (state, action: PayloadAction<{ peerId: string }>) => {
      const { peerId } = action.payload;
      delete state[peerId];
    },
    clearPeers: (state) => {
      state = {};
    },
    setPeerDisplayName: (
      state,
      action: PayloadAction<{ displayName: string; peerId: string }>
    ) => {
      const { displayName, peerId } = action.payload;
      if (state[peerId]) {
        state[peerId].displayName = displayName;
      }
    },
    setPeerVideoInProgress: (
      state,
      action: PayloadAction<{ peerId: string; flag: boolean }>
    ) => {
      const { peerId, flag } = action.payload;
      if (state[peerId]) {
        state[peerId].peerVideoInProgress = flag;
      }
    },
    setPeerAudioInProgress: (
      state,
      action: PayloadAction<{ peerId: string; flag: boolean }>
    ) => {
      const { peerId, flag } = action.payload;
      if (state[peerId]) {
        state[peerId].peerAudioInProgress = flag;
      }
    },
    setPeerScreenInProgress: (
      state,
      action: PayloadAction<{ peerId: string; flag: boolean }>
    ) => {
      const { peerId, flag } = action.payload;
      if (state[peerId]) {
        state[peerId].peerScreenInProgress = flag;
      }
    },
    setPeerRaisedHand: (
      state,
      action: PayloadAction<{
        peerId: string;
        raisedHand: boolean;
        raisedHandTimestamp: number;
      }>
    ) => {
      const { peerId, raisedHand, raisedHandTimestamp } = action.payload;
      if (state[peerId]) {
        state[peerId].raisedHand = raisedHand;
        state[peerId].raisedHandTimestamp = raisedHandTimestamp;
      }
    },
    setPeerRaisedHandInProgress: (
      state,
      action: PayloadAction<{
        peerId: string;
        flag: boolean;
      }>
    ) => {
      const { peerId, flag } = action.payload;
      if (state[peerId]) {
        state[peerId].raisedHandInProgress = flag;
      }
    },
    setPeerPicture: (
      state,
      action: PayloadAction<{
        peerId: string;
        picture: string;
      }>
    ) => {
      const { peerId, picture } = action.payload;
      if (state[peerId]) {
        state[peerId].picture = picture;
      }
    },
    addPeerRole: (
      state,
      action: PayloadAction<{
        peerId: string;
        roleId: number;
      }>
    ) => {
      const { peerId, roleId } = action.payload;
      if (state[peerId]) {
        state[peerId].roles.push(roleId);
      }
    },
    removePeerRole: (
      state,
      action: PayloadAction<{
        peerId: string;
        roleId: number;
      }>
    ) => {
      const { peerId, roleId } = action.payload;
      if (state[peerId]) {
        state[peerId].roles = state[peerId].roles.filter(
          (_roleId) => _roleId !== roleId
        );
      }
    },
    setPeerModifyRolesInProgress: (
      state,
      action: PayloadAction<{
        peerId: string;
        flag: boolean;
      }>
    ) => {
      const { peerId, flag } = action.payload;
      if (state[peerId]) {
        state[peerId].peerModifyRolesInProgress = flag;
      }
    },
    setPeerKickInProgress: (
      state,
      action: PayloadAction<{
        peerId: string;
        flag: boolean;
      }>
    ) => {
      const { peerId, flag } = action.payload;
      if (state[peerId]) {
        state[peerId].peerKickInProgress = flag;
      }
    },
    setMutePeerInProgress: (
      state,
      action: PayloadAction<{
        peerId: string;
        flag: boolean;
      }>
    ) => {
      const { peerId, flag } = action.payload;
      if (state[peerId]) {
        state[peerId].stopPeerAudioInProgress = flag;
      }
    },
    setStopPeerVideoInProgress: (
      state,
      action: PayloadAction<{
        peerId: string;
        flag: boolean;
      }>
    ) => {
      const { peerId, flag } = action.payload;
      if (state[peerId]) {
        state[peerId].stopPeerVideoInProgress = flag;
      }
    },
    setStopPeerScreenSharingInProgress: (
      state,
      action: PayloadAction<{
        peerId: string;
        flag: boolean;
      }>
    ) => {
      const { peerId, flag } = action.payload;
      if (state[peerId]) {
        state[peerId].stopPeerScreenSharingInProgress = flag;
      }
    },
    setPeerLocalRecordingState: (
      state,
      action: PayloadAction<{
        peerId: string;
        localRecordingState: PeerInfo['localRecordingState'];
      }>
    ) => {
      const { peerId, localRecordingState } = action.payload;
      if (state[peerId]) {
        state[peerId].localRecordingState = localRecordingState;
      }
    },
    setPeerLocalRecordingConsent: (
      state,
      action: PayloadAction<{
        peerId: string;
        consent: any;
      }>
    ) => {
      const { peerId, consent } = action.payload;
      if (state[peerId]) {
        state[peerId].localRecordingConsent = consent;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(consumersActions.addConsumer, (state, action) => {
        const { consumer, peerId } = action.payload;

        if (state[peerId]) {
          state[peerId].consumers.push(consumer.id);
        }
      })
      .addCase(consumersActions.removeConsumer, (state, action) => {
        const { consumerId, peerId } = action.payload;

        if (state[peerId]) {
          state[peerId].consumers = state[peerId].consumers.filter(
            (_consumerId) => _consumerId !== consumerId
          );
        }
      });
  },
});

export const peersActions = peersSlice.actions;
export const peersReducer = peersSlice.reducer;
