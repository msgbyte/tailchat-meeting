import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { config } from '../../config';
import type { RoomClient } from '../../RoomClient';
import { generateRandomString } from '../../utils';

export type ViewLayoutType = 'auto' | 'democratic' | 'filmstrip';

export type CollaborationInfo = {
  tabId: string; // 长度为8的随机字符串
  type: 'excalidraw';
  url: string;
};

export interface RoomState {
  name: string;
  state: 'new' | 'connecting' | 'connected' | 'disconnected' | 'closed';
  locked: boolean;
  inLobby: boolean;
  signInRequired: boolean;
  overRoomLimit: boolean;
  // access code to the room if locked and joinByAccessCode == true
  accessCode: string;
  // if true: accessCode is a possibility to open the room
  joinByAccessCode: boolean;
  activeSpeakerId: string;
  torrentSupport: boolean;
  showSettings: boolean;
  fullScreenConsumer: string; // ConsumerID
  windowConsumer: string; // ConsumerID
  toolbarsVisible: boolean;
  layout: ViewLayoutType;
  selectedPeers: string[];
  spotlights: string[];
  rolesManagerPeer: string; // peerId
  settingsOpen: boolean;
  extraVideoOpen: boolean;
  hideSelfView: boolean;
  rolesManagerOpen: boolean;
  helpOpen: boolean;
  aboutOpen: boolean;
  leaveOpen: boolean;
  currentSettingsTab: 'media' | 'appearance' | 'advanced'; // media, appearance, advanced
  lockDialogOpen: boolean;
  joined: boolean;
  muteAllInProgress: boolean;
  lobbyPeersPromotionInProgress: boolean;
  stopAllVideoInProgress: boolean;
  stopAllScreenSharingInProgress: boolean;
  closeMeetingInProgress: boolean;
  clearChatInProgress: boolean;
  clearFileSharingInProgress: boolean;
  roomPermissions: unknown;
  userRoles: Map<
    number,
    {
      id: number;
      label: string;
      level: number;
      promotable: boolean;
    }
  >;
  allowWhenRoleMissing: string[];
  /**
   * 多人协同
   */
  collaboration: CollaborationInfo[];
  client: RoomClient;
}

const initialState: RoomState = {
  name: '',
  state: 'new',
  locked: false,
  inLobby: false,
  signInRequired: false,
  overRoomLimit: false,
  accessCode: '',
  joinByAccessCode: true,
  activeSpeakerId: null,
  torrentSupport: false,
  showSettings: false,
  fullScreenConsumer: null,
  windowConsumer: null,
  toolbarsVisible: true,
  layout: config.defaultLayout,
  selectedPeers: [],
  spotlights: [],
  rolesManagerPeer: null,
  settingsOpen: false,
  extraVideoOpen: false,
  hideSelfView: false,
  rolesManagerOpen: false,
  helpOpen: false,
  aboutOpen: false,
  leaveOpen: false,
  currentSettingsTab: 'media',
  lockDialogOpen: false,
  joined: false,
  muteAllInProgress: false,
  lobbyPeersPromotionInProgress: false,
  stopAllVideoInProgress: false,
  stopAllScreenSharingInProgress: false,
  closeMeetingInProgress: false,
  clearChatInProgress: false,
  clearFileSharingInProgress: false,
  roomPermissions: null,
  userRoles: null,
  allowWhenRoleMissing: null,
  collaboration: [
    // For Test
    {
      tabId: generateRandomString(8),
      type: 'excalidraw',
      url: 'https://excalidraw.com/',
    },
    {
      tabId: generateRandomString(8),
      type: 'excalidraw',
      url: 'https://excalidraw.com/',
    },
  ],
  client: null,
};

type CommonSetKey = Exclude<
  keyof RoomState,
  'state' | 'fullScreenConsumer' | 'windowConsumer' | 'selectedPeers'
>;

const roomSlice = createSlice({
  name: 'room',
  initialState,
  reducers: {
    set: {
      reducer: <K extends CommonSetKey>(
        state: RoomState,
        action: PayloadAction<{ key: K; value: RoomState[K] }>
      ) => {
        const { key, value } = action.payload;

        state[key] = value;
      },
      prepare: <K extends CommonSetKey>(key: K, value: RoomState[K]) => {
        return { payload: { key, value } };
      },
    },
    setRoomState(state, action: PayloadAction<RoomState['state']>) {
      const roomState = action.payload;

      if (roomState === 'connected') {
        state.state = roomState;
      } else {
        state.state = roomState;
        state.activeSpeakerId = null;
      }
    },
    toggleConsumerFullscreen(state, action: PayloadAction<string>) {
      const consumerId = action.payload;
      const currentConsumer = state.fullScreenConsumer;

      state.fullScreenConsumer = currentConsumer ? null : consumerId;
    },
    toggleConsumerWindow(state, action?: PayloadAction<string>) {
      const consumerId = action.payload;
      const currentConsumer = state.windowConsumer;

      if (currentConsumer === consumerId) {
        state.windowConsumer = null;
      } else {
        state.windowConsumer = consumerId;
      }
    },
    addSelectedPeer(state, action: PayloadAction<string>) {
      const peerId = action.payload;

      state.selectedPeers.push(peerId);
    },
    removeSelectedPeer(state, action: PayloadAction<string>) {
      const peerId = action.payload;

      state.selectedPeers = state.selectedPeers.filter(
        (peer) => peer !== peerId
      );
    },
    clearSelectedPeers(state) {
      state.selectedPeers = [];
    },
    clearSpotlights(state) {
      state.spotlights = [];
    },
    /**
     * 开启一个白板
     */
    createExcalidraw(state, action: PayloadAction<{ url: string }>) {
      state.collaboration.push({
        tabId: generateRandomString(8),
        type: 'excalidraw',
        url: action.payload.url,
      });
    },
    /**
     * 移除一个共享
     */
    stopCollaboration(state, action: PayloadAction<{ index: number }>) {
      const index = action.payload.index;
      if (state.collaboration[index]) {
        state.collaboration.splice(index, 1);
      }
    },
    /**
     * 移除所有共享
     */
    clearCollaboration(state) {
      state.collaboration = [];
    },
  },
});

export const roomActions = roomSlice.actions;
export const roomReducer = roomSlice.reducer;
