import type { VIDEO_CONSTRAINS } from '../consts';
import type { SimulcastProfile } from '../types';

export interface TailchatMeetingClientSettings {
  resolution: keyof typeof VIDEO_CONSTRAINS;
  aspectRatio: number;
  /**
   * 视频帧率
   */
  frameRate: number;
  /**
   * 是否开启联播
   */
  simulcast: boolean;
  simulcastProfiles: Record<string, SimulcastProfile[]>;
  /**
   * 自动增益控制
   */
  autoGainControl: boolean;
  /**
   * 回声消除
   */
  echoCancellation: boolean;

  /**
   * 噪音抑制
   */
  noiseSuppression: boolean;
  /**
   * 音频采样率
   */
  sampleRate: 48000 | 44100;
  /**
   * 音频频道数
   */
  channelCount: number;
  /**
   * 采样大小
   */
  sampleSize: number;
  opusStereo: boolean;
  opusDtx: boolean;
  opusFec: boolean;
  opusPtime: number;
  opusMaxPlaybackRate: number;
}

export const defaultSettings: TailchatMeetingClientSettings = {
  resolution: 'medium',
  aspectRatio: 1.778,
  frameRate: 30,
  simulcast: true,
  simulcastProfiles: {
    '320': [
      {
        scaleResolutionDownBy: 1,
        maxBitRate: 150000,
      },
    ],
    '640': [
      {
        scaleResolutionDownBy: 2,
        maxBitRate: 150000,
      },
      {
        scaleResolutionDownBy: 1,
        maxBitRate: 500000,
      },
    ],
    '1280': [
      {
        scaleResolutionDownBy: 4,
        maxBitRate: 150000,
      },
      {
        scaleResolutionDownBy: 2,
        maxBitRate: 500000,
      },
      {
        scaleResolutionDownBy: 1,
        maxBitRate: 1200000,
      },
    ],
    '1920': [
      {
        scaleResolutionDownBy: 6,
        maxBitRate: 150000,
      },
      {
        scaleResolutionDownBy: 3,
        maxBitRate: 500000,
      },
      {
        scaleResolutionDownBy: 1,
        maxBitRate: 3500000,
      },
    ],
    '3840': [
      {
        scaleResolutionDownBy: 12,
        maxBitRate: 150000,
      },
      {
        scaleResolutionDownBy: 6,
        maxBitRate: 500000,
      },
      {
        scaleResolutionDownBy: 1,
        maxBitRate: 10000000,
      },
    ],
  },
  autoGainControl: true,
  echoCancellation: true,
  noiseSuppression: true,
  sampleRate: 48000,
  channelCount: 1,
  sampleSize: 16,
  opusStereo: false,
  opusDtx: true,
  opusFec: true,
  opusPtime: 20,
  opusMaxPlaybackRate: 48000,
};
