import type { Harker } from 'hark';
import type { types as mediasoupTypes } from 'mediasoup-client';
import type {
  MediaKind,
  RtpCapabilities,
  RtpParameters,
} from 'mediasoup-client/lib/RtpParameters';
import type { DtlsParameters } from 'mediasoup-client/lib/Transport';
import type { ProducerOptions } from 'mediasoup-client/lib/types';
import type { VolumeWatcher } from './helper/volumeWatcher';
import type { PermissionList } from './consts';

export type { MediaKind };
export type { Producer, Consumer } from 'mediasoup-client/lib/types';

export interface JoinOptions {
  video: boolean;
  audio: boolean;
  forceTcp?: boolean;
  displayName: string;
  picture: string;
  from?: string;
}

export interface WebRtcTransportInfo {
  id: string;
  iceParameters: mediasoupTypes.IceParameters;
  iceCandidates: mediasoupTypes.IceCandidate[];
  dtlsParameters: mediasoupTypes.DtlsParameters;
}

export interface RestartICEParams {
  timer: number | null;
  restarting: boolean;
}

export interface MediaDevice {
  deviceId: string;
  kind: MediaDeviceKind;
  label: string;
}

export interface PermissionInfo {
  id: number;
  label: string;
  level: number;
  promotable: boolean;
}

export interface JoinResponse {
  authenticated: boolean;
  roles: number[];
  peers: Peer[];
  /**
   * For webtorrent
   */
  tracker: string;
  roomPermissions: Record<string, PermissionInfo[]>;
  userRoles: Record<string, PermissionInfo[]>;
  allowWhenRoleMissing: string[];
  chatHistory: any[];
  fileHistory: any[];
  lastNHistory: string[];
  locked: boolean;
  lobbyPeers: LobbyPeer[];
  accessCode: string;
}

export interface UpdateWebcamParams {
  start?: boolean;
  restart?: boolean;
  newDeviceId?: any;
  selectedVideoDevice?: string;
}

export interface UpdateDeviceParams {
  start?: boolean;
}

export interface CreateWebRtcTransport {
  forceTcp: boolean;
  producing: boolean;
  consuming: boolean;
}

export interface ConnectWebRtcTransport {
  transportId: string;
  dtlsParameters: DtlsParameters;
}

export interface ProduceData {
  transportId: string;
  kind: MediaKind;
  rtpParameters: RtpParameters;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  appData?: any;
}

export interface PauseProducerData {
  producerId: string;
}

export interface ResumeProducerData {
  producerId: string;
}

export interface DisplayNameData {
  displayName: string;
}

export interface PromotePeerData {
  peerId: string;
}

export interface ChatMessageData {
  text?: string;
}

export interface FilesharingData {
  magnetURI?: string;
}

export interface SocketInboundNotification {
  method: string; // TODO: define inbound notification method strings
  data?: any; // TODO: define inbound notification data
}

export interface SocketOutboundRequest {
  method: string; // TODO: define outbound request method strings
  data?:
    | CreateWebRtcTransport
    | ConnectWebRtcTransport
    | ProduceData
    | ConsumerData
    | JoinData
    | PauseProducerData
    | ResumeProducerData
    | DisplayNameData
    | PromotePeerData
    | ChatMessageData
    | FilesharingData;
}

export interface ConsumerData {
  consumerId: string;
}

export interface JoinData {
  displayName: string;
  picture: string;
  from?: string;
  rtpCapabilities: RtpCapabilities;
  returning?: boolean;
}

export interface SimulcastProfile {
  scaleResolutionDownBy: number;
  maxBitRate: number;
}

export interface Peer {
  id: string;
  displayName?: string;
  picture?: string;
  from?: string;
  videoInProgress?: boolean;
  stopVideoInProgress?: boolean;
  audioInProgress?: boolean;
  stopAudioInProgress?: boolean;
  screenInProgress?: boolean;
  stopScreenSharingInProgress?: boolean;
  kickInProgress?: boolean;
  modifyRolesInProgress?: boolean;
  raisedHandInProgress?: boolean;
  raisedHand?: boolean;
  raisedHandTimestamp?: number;
  roles: number[]; // Role IDs
}

export interface LobbyPeer {
  id: string;
  displayName?: string;
  picture?: string;
  promotionInProgress?: boolean;
}

export interface Volume {
  volume: number;
  scaledVolume: number;
}

export type MediaSourceType =
  | 'mic'
  | 'webcam'
  | 'screen'
  | 'extravideo'
  | 'screen'
  | 'screenaudio';

export type MediaAppData = {
  peerId: string;
  source: MediaSourceType;
  hark?: Harker;
  volumeWatcher?: VolumeWatcher;
};

export interface MediaClientConsumer extends mediasoupTypes.Consumer {
  appData: MediaAppData;
}

export interface MediaClientProducerOptions extends ProducerOptions {
  appData: MediaAppData;
}

export type SignalingSendRequestMap = {
  chatMessage: [ChatMessageData, any];
  changeDisplayName: [DisplayNameData, any];
  resumeProducer: [PauseProducerData, any];
  produce: [ProduceData, any];
};

/**
 * 视频分辨率类型
 */
export type VideoResolutionType =
  | 'low'
  | 'medium'
  | 'high'
  | 'veryhigh'
  | 'ultra';

/**
 * 音频采样率
 */
export type AudioSampleRate = 8000 | 16000 | 24000 | 44100 | 48000;

/**
 * 音频通道数
 */
export type AudioChannelCount = 1 | 2;

/**
 * 音频采样大小
 */
export type AudioSampleSize = 8 | 16 | 24 | 32;

/**
 * OPUS 数据包时间
 */
export type OPUSPacketTime = 3 | 5 | 10 | 20 | 30 | 40 | 50 | 60;

/**
 * OPUS 最大回放速率
 */
export type OPUSMaxPlaybackRate = 8000 | 16000 | 24000 | 44100 | 48000;

export type RoomPermissions = Record<PermissionList, PermissionInfo[]>;
