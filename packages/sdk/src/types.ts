import type { Harker } from 'hark';
import type { types as mediasoupTypes } from 'mediasoup-client';
import type {
  MediaKind,
  RtpCapabilities,
  RtpParameters,
} from 'mediasoup-client/lib/RtpParameters';
import type { DtlsParameters } from 'mediasoup-client/lib/Transport';
import type { VolumeWatcher } from './helper/volumeWatcher';

export type { MediaKind };

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

export interface Permission {
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
  roomPermissions: Record<string, Permission[]>;
  userRoles: Record<string, Permission[]>;
  allowWhenRoleMissing: string[];
  chatHistory: any[];
  fileHistory: any[];
  lastNHistory: string[];
  locked: boolean;
  lobbyPeers: LobbyPeer[];
  accessCode: string;
}

export interface UpdateWebcamParams {
  init?: boolean;
  start?: boolean;
  restart?: boolean;
  newDeviceId?: any;
  newResolution?: any;
  newFrameRate?: any;
  selectedVideoDevice?: string;
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
  raisedHandTimestamp?: Date;
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

export interface MediaClientConsumer extends mediasoupTypes.Consumer {
  appData: {
    peerId: string;
    source: 'mic' | 'webcam' | 'screen' | 'extravideo';
    hark?: Harker;
    volumeWatcher?: VolumeWatcher;
  };
}
