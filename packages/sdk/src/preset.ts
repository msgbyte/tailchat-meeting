/**
 * 预设信息
 */

export interface AudioConfigPresetInfo {
  name: string;
  autoGainControl: boolean;
  echoCancellation: boolean;
  noiseSuppression: boolean;
  voiceActivatedUnmute: boolean;
  noiseThreshold: number;
  sampleRate: number;
  channelCount: number;
  sampleSize: number;
  opusStereo: boolean;
  opusDtx: boolean;
  opusFec: boolean;
  opusPtime: number;
  opusMaxPlaybackRate: number;
}

/**
 * 音频预设信息
 */
export const audioConfigPresets: Record<string, AudioConfigPresetInfo> = {
  conference: {
    name: 'Conference audio',
    autoGainControl: true, // default : true
    echoCancellation: true, // default : true
    noiseSuppression: true, // default : true
    // Automatically unmute speaking above noiseThreshold
    voiceActivatedUnmute: false, // default : false
    // This is only for voiceActivatedUnmute and audio-indicator
    noiseThreshold: -60, // default -60
    // will not eat that much bandwidth thanks to opus
    sampleRate: 48000, // default : 48000 and don't go higher
    // usually mics are mono so this saves bandwidth
    channelCount: 1, // default : 1
    sampleSize: 16, // default : 16
    // usually mics are mono so this saves bandwidth
    opusStereo: false, // default : false
    opusDtx: true, // default : true / will save bandwidth
    opusFec: true, // default : true / forward error correction
    opusPtime: 20, // minimum packet time (10, 20, 40, 60)
    opusMaxPlaybackRate: 48000, // default : 48000 and don't go higher
  },
  hifi: {
    name: 'HiFi streaming',
    autoGainControl: false, // default : true
    echoCancellation: false, // default : true
    noiseSuppression: false, // default : true
    // Automatically unmute speaking above noiseThreshold
    voiceActivatedUnmute: false, // default : false
    // This is only for voiceActivatedUnmute and audio-indicator
    noiseThreshold: -60, // default -60
    // will not eat that much bandwidth thanks to opus
    sampleRate: 48000, // default : 48000 and don't go higher
    // usually mics are mono so this saves bandwidth
    channelCount: 2, // default : 1
    sampleSize: 16, // default : 16
    // usually mics are mono so this saves bandwidth
    opusStereo: true, // default : false
    opusDtx: false, // default : true / will save bandwidth
    opusFec: true, // default : true / forward error correction
    opusPtime: 60, // minimum packet time (10, 20, 40, 60)
    opusMaxPlaybackRate: 48000, // default : 48000 and don't go higher
  },
};
