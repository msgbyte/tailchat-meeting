import create from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
  displayName: string;
  /**
   * 是否显示自身视频
   */
  showOwnVideo: boolean;
  mirrorOwnVideo: boolean;
  mediaPerms: {
    video: boolean;
    audio: boolean;
  };
  setMediaPerms: (mediaPerms: Partial<SettingsState['mediaPerms']>) => void;
}

export const useMeetingSettings = create<SettingsState>()(
  persist(
    (set) => ({
      displayName: '',
      showOwnVideo: false,
      mirrorOwnVideo: true,
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
    }),
    {
      name: 'tailchat-meeting-settings',
    }
  )
);
