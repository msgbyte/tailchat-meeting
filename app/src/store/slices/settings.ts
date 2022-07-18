import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { config } from '../../config';
import type {
  AudioChannelCount,
  AudioSampleRate,
  AudioSampleSize,
  OPUSMaxPlaybackRate,
  OPUSPacketTime,
  preset,
  VideoResolutionType,
} from 'tailchat-meeting-sdk';
import type { PickBooleanPropertyNames } from '../../types';

export interface SettingsState {
  displayName: string;
  selectedWebcam: string;
  selectedAudioDevice: string;
  advancedMode: boolean;
  autoGainControl: boolean;
  echoCancellation: boolean;
  noiseSuppression: boolean;
  voiceActivatedUnmute: boolean;
  noiseThreshold: number;
  audioMuted: boolean;
  videoMuted: boolean;
  // low, medium, high, veryhigh, ultra
  resolution: VideoResolutionType;
  frameRate: number;
  screenSharingResolution: VideoResolutionType;
  screenSharingFrameRate: number;
  recorderPreferredMimeType: 'video/webm';
  lastN: number;
  permanentTopBar: boolean;
  hiddenControls: boolean;
  showNotifications: boolean;
  notificationSounds: boolean;
  mirrorOwnVideo: boolean;
  hideNoVideoParticipants: boolean;
  buttonControlBar: boolean;
  drawerOverlayed: boolean;
  aspectRatio: number;
  mediaPerms: { audio: boolean; video: boolean };
  localPicture: string | null;
  audioPreset: string;
  audioPresets: Record<string, preset.AudioConfigPresetInfo>;
  sampleRate: AudioSampleRate;
  channelCount: AudioChannelCount;
  sampleSize: AudioSampleSize;
  opusStereo: boolean;
  opusDtx: boolean;
  opusFec: boolean;
  opusPtime: OPUSPacketTime;
  opusMaxPlaybackRate: OPUSMaxPlaybackRate;
  enableOpusDetails: boolean;
  recorderSupportedMimeTypes: string[];
  selectedAudioOutputDevice: string;
  virtualBackgroundEnabled: boolean;
  virtualBackgroundUrl: string | 'blur';
}

const initialState: SettingsState = {
  displayName: '',
  selectedWebcam: null,
  selectedAudioDevice: null,
  advancedMode: false,
  autoGainControl: config.autoGainControl,
  echoCancellation: config.echoCancellation,
  noiseSuppression: config.noiseSuppression,
  voiceActivatedUnmute: config.voiceActivatedUnmute,
  noiseThreshold: config.noiseThreshold,
  audioMuted: false,
  videoMuted: false,
  // low, medium, high, veryhigh, ultra
  resolution: config.resolution,
  frameRate: config.frameRate,
  screenSharingResolution: config.screenResolution,
  screenSharingFrameRate: config.screenSharingFrameRate,
  recorderPreferredMimeType: config.defaultRecorderMimeType || 'video/webm',
  lastN: 4,
  permanentTopBar: true,
  hiddenControls: false,
  showNotifications: true,
  notificationSounds: true,
  mirrorOwnVideo: true,
  hideNoVideoParticipants: false,
  buttonControlBar: config.buttonControlBar,
  drawerOverlayed: config.drawerOverlayed,
  aspectRatio: config.aspectRatio,
  mediaPerms: { audio: false, video: false },
  localPicture: null,
  audioPreset: config.audioPreset,
  audioPresets: config.audioPresets,
  sampleRate: config.sampleRate,
  channelCount: config.channelCount,
  sampleSize: config.sampleSize,
  opusStereo: config.opusStereo,
  opusDtx: config.opusDtx,
  opusFec: config.opusFec,
  opusPtime: config.opusPtime,
  opusMaxPlaybackRate: config.opusMaxPlaybackRate,
  enableOpusDetails: false,
  recorderSupportedMimeTypes: [],
  selectedAudioOutputDevice: '',
  virtualBackgroundEnabled: false,
  virtualBackgroundUrl: 'blur',
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    /**
     * 通用设置
     */
    set: {
      reducer: <K extends keyof SettingsState>(
        state: SettingsState,
        action: PayloadAction<{ key: K; value: SettingsState[K] }>
      ) => {
        const { key, value } = action.payload;

        state[key] = value;
      },
      prepare: <K extends keyof SettingsState>(
        key: K,
        value: SettingsState[K]
      ) => {
        return { payload: { key, value } };
      },
    },
    toggle<K extends PickBooleanPropertyNames<SettingsState>>(
      state: SettingsState,
      action: PayloadAction<K>
    ) {
      const key = action.payload;

      if (typeof state[key] !== 'boolean') {
        return;
      }

      state[key] = !state[key] as any;
    },
  },
});

export const settingsActions = settingsSlice.actions;
export const settingsReducer = settingsSlice.reducer;
