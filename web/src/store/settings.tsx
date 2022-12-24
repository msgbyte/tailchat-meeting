import create from 'zustand';

interface SettingsState {
  /**
   * 是否显示自身视频
   */
  showSelfVideo: boolean;
  mediaPerms: {
    video: boolean;
    audio: boolean;
  };
  setMediaPerms: (mediaPerms: Partial<SettingsState['mediaPerms']>) => void;
}

export const useMeetingSettings = create<SettingsState>((set) => ({
  showSelfVideo: false,
  mediaPerms: {
    video: false,
    audio: false,
  },
  setMediaPerms: (mediaPerms: Partial<SettingsState['mediaPerms']>) => {
    set((prev) => ({
      mediaPerms: {
        ...prev.mediaPerms,
        ...mediaPerms,
      },
    }));
  },
}));
