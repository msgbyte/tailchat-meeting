import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { deviceInfo, DeviceInfo } from '../../deviceInfo';
import randomString from 'crypto-random-string';
import { uniq, without } from 'lodash-es';

export interface MeState {
  id: string;
  browser: Omit<DeviceInfo, 'bowser'>;
  picture?: string;
  from?: string;
  previewWebcamTrackId?: string;
  previewMicTrackId?: string;
  canSendMic: boolean;
  canSendWebcam: boolean;
  canShareScreen: boolean;
  canShareFiles: boolean;
  devices: MediaDeviceInfo[];
  raisedHand: boolean;
  speaking: boolean;
  autoMuted: boolean;
  // Status flags
  audioInProgress: boolean;
  videoInProgress: boolean;
  screenSharingInProgress: boolean;
  displayNameInProgress: boolean;
  raisedHandInProgress: boolean;

  // 以下是追加的
  loginEnabled: boolean;
  loggedIn: boolean;
  roles: number[]; // TODO: 类型应该为常量
  audioDevices: Record<string, MediaDeviceInfo>;
  webcamDevices: Record<string, MediaDeviceInfo>;
  audioOutputDevices: Record<string, MediaDeviceInfo>;
  audioOutputInProgress: boolean;
}

const initialState: MeState = {
  id: randomString({ length: 8 }).toLowerCase(),
  browser: deviceInfo(),
  picture: undefined,
  from: undefined,
  canSendMic: true,
  canSendWebcam: true,
  canShareScreen: true,
  canShareFiles: false,
  devices: [],
  raisedHand: false,
  speaking: false,
  autoMuted: true,
  audioInProgress: false,
  videoInProgress: false,
  screenSharingInProgress: false,
  displayNameInProgress: false,
  raisedHandInProgress: false,
  loginEnabled: false,
  loggedIn: false,
  roles: [],
  audioDevices: {},
  webcamDevices: {},
  audioOutputDevices: {},
  audioOutputInProgress: false,
};

const meSlice = createSlice({
  name: 'me',
  initialState,
  reducers: {
    setMe: (
      state,
      action: PayloadAction<{ peerId: string; loginEnabled: boolean }>
    ) => {
      state.id = action.payload.peerId;
      state.loginEnabled = action.payload.loginEnabled;
    },
    setPicture: (state, action: PayloadAction<string>) => {
      state.picture = action.payload;
    },
    setFrom: (state, action: PayloadAction<string>) => {
      state.from = action.payload;
    },
    setPreviewWebcamTrackId: (
      state,
      action: PayloadAction<string | undefined>
    ) => {
      state.previewWebcamTrackId = action.payload;
    },
    setPreviewMicTrackId: (
      state,
      action: PayloadAction<string | undefined>
    ) => {
      state.previewMicTrackId = action.payload;
    },
    setMediaCapabilities: (
      state,
      action: PayloadAction<{
        canSendMic?: boolean;
        canSendWebcam?: boolean;
        canShareScreen?: boolean;
        canShareFiles?: boolean;
      }>
    ) => {
      state = {
        ...state,
        ...action.payload,
      };
    },
    setDevices: (state, action: PayloadAction<MediaDeviceInfo[]>) => {
      state.devices = action.payload;
    },
    setRaisedHand: (state, action: PayloadAction<boolean>) => {
      state.raisedHand = action.payload;
    },
    setSpeaking: (state, action: PayloadAction<boolean>) => {
      state.speaking = action.payload;
    },
    setAutoMuted: (state, action: PayloadAction<boolean>) => {
      state.autoMuted = action.payload;
    },
    // Status flags
    setAudioInProgress: (state, action: PayloadAction<boolean>) => {
      state.audioInProgress = action.payload;
    },
    setVideoInProgress: (state, action: PayloadAction<boolean>) => {
      state.videoInProgress = action.payload;
    },
    setScreenSharingInProgress: (state, action: PayloadAction<boolean>) => {
      state.screenSharingInProgress = action.payload;
    },
    setRaiseHandInProgress: (state, action: PayloadAction<boolean>) => {
      state.raisedHandInProgress = action.payload;
    },
    setDisplayNameInProgress: (state, action: PayloadAction<boolean>) => {
      state.displayNameInProgress = action.payload;
    },
    setLoggedIn: (state, action: PayloadAction<boolean>) => {
      state.loggedIn = action.payload;
    },
    addRole: (state, action: PayloadAction<number>) => {
      state.roles = uniq([...state.roles, action.payload]);
    },
    removeRole: (state, action: PayloadAction<number>) => {
      state.roles = without(state.roles, action.payload);
    },
    setAudioDevices: (
      state,
      action: PayloadAction<Record<string, MediaDeviceInfo>>
    ) => {
      state.audioDevices = action.payload;
    },
    setAudioOutputDevices: (
      state,
      action: PayloadAction<Record<string, MediaDeviceInfo>>
    ) => {
      state.audioOutputDevices = action.payload;
    },
    setAudioOutputInProgress: (state, action: PayloadAction<boolean>) => {
      state.audioOutputInProgress = action.payload;
    },
    setWebcamDevices: (
      state,
      action: PayloadAction<Record<string, MediaDeviceInfo>>
    ) => {
      state.webcamDevices = action.payload;
    },
  },
});

export const meActions = meSlice.actions;
export const meReducer = meSlice.reducer;
