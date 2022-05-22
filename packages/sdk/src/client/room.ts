import EventEmitter from 'eventemitter3';
import { Logger } from '../helper/logger';
import type { LobbyPeer, Peer } from '../types';
import type { SignalingClient } from './signaling';

const logger = new Logger('MediaClient');

export type RoomConnectionState =
  | 'new'
  | 'connecting'
  | 'connected'
  | 'disconnected'
  | 'closed';
export type SettingsTab = 'media' | 'appearance';

export interface RoomState {
  name?: string;
  joined?: boolean;
  inLobby?: boolean;
  overRoomLimit?: boolean;
  activeSpeakerId?: string;
  lockInProgress?: boolean;
  localeInProgress?: boolean;
  muteAllInProgress?: boolean;
  lobbyPeersPromotionInProgress?: boolean;
  stopAllVideoInProgress?: boolean;
  closeMeetingInProgress?: boolean;
  clearChatInProgress?: boolean;
  clearFileSharingInProgress?: boolean;
  startFileSharingInProgress?: boolean;
  fullscreenConsumer?: string;
  windowedConsumer?: string;
  selectedPeers: string[];
  spotlights: string[];
  state: RoomConnectionState;
}

type RoomUpdate = Omit<RoomState, 'state' | 'selectedPeers' | 'spotlights'>;

export interface MediaClient {
  on(event: 'roomStateUpdated', listener: (roomState: RoomState) => void): this;
  on(
    event: 'activeSpeakerChanged',
    listener: (activeSpeakerId: string) => void
  ): this;
  on(event: 'peersUpdated', listener: (peers: Peer[]) => void): this;
  on(
    event: 'lobbyPeersUpdated',
    listener: (lobbyPeers: LobbyPeer[]) => void
  ): this;
}
export class RoomClient extends EventEmitter<
  | 'roomStateUpdated'
  | 'activeSpeakerChanged'
  | 'peersUpdated'
  | 'lobbyPeersUpdated'
> {
  iceServers?: RTCIceServer[]; // TODO: not used
  roomState: RoomState = {
    state: 'new',
    selectedPeers: [],
    spotlights: [],
  };
  activeSpeakerId?: string;
  peers: Peer[] = [];
  lobbyPeers: LobbyPeer[] = [];

  constructor(public signaling: SignalingClient) {
    super();

    this.handleSignaling();
  }

  handleSignaling() {
    this.signaling.on('notification', (notification) => {
      logger.debug(
        'signalingService "notification" event [method:%s, data:%o]',
        notification.method,
        notification.data
      );

      try {
        switch (notification.method) {
          case 'roomReady': {
            const { turnServers } = notification.data;

            this.iceServers = turnServers;
            this.updateRoomState({
              inLobby: false,
              joined: true,
            });
            break;
          }

          case 'enteredLobby': {
            this.updateRoomState({
              inLobby: true,
            });
            // TODO: send displayname and picture
            break;
          }

          case 'overRoomLimit': {
            this.updateRoomState({
              overRoomLimit: true,
            });
            break;
          }

          case 'roomBack': {
            break;
          }

          case 'activeSpeaker': {
            const { peerId } = notification.data;
            this.setActiveSpeakerId(peerId);
            break;
          }

          case 'newPeer': {
            const {
              id,
              displayName,
              picture,
              roles,
              raisedHand,
              raisedHandTimestamp,
            } = notification.data;

            this.peers.push({
              id,
              displayName,
              picture,
              roles,
              raisedHand,
              raisedHandTimestamp,
            });
            this.emit('peersUpdated', this.peers);
            break;
          }

          case 'peerClosed': {
            const { peerId } = notification.data;

            this.peers = this.peers.filter((peer) => peer.id !== peerId);
            this.emit('peersUpdated', this.peers);
            break;
          }

          case 'changeDisplayName':
          case 'changePicture':
          case 'raisedHand': {
            const {
              peerId,
              displayName,
              picture,
              raisedHand,
              raisedHandTimestamp,
            } = notification.data;

            this.updatePeer({
              id: peerId,
              displayName,
              picture,
              raisedHand,
              raisedHandTimestamp,
            });

            break;
          }

          case 'parkedPeer': {
            const { peerId } = notification.data;

            this.lobbyPeers.push({ id: peerId });
            break;
          }

          case 'parkedPeers': {
            const { lobbyPeers } = notification.data;

            lobbyPeers?.forEach((peer: LobbyPeer) => {
              this.lobbyPeers.push({ ...peer });
            });
            break;
          }

          case 'lobby:peerClosed': {
            const { peerId } = notification.data;

            this.lobbyPeers = this.lobbyPeers.filter((p) => p !== peerId);
            break;
          }

          case 'lobby:promotedPeer': {
            const { peerId } = notification.data;

            this.lobbyPeers = this.lobbyPeers.filter((p) => p !== peerId);
            break;
          }

          case 'lobby:changeDisplayName':
          case 'lobby:changePicture': {
            const { peerId, picture, displayName } = notification.data;

            this.updateLobbyPeer({ id: peerId, displayName, picture });
            break;
          }
        }
      } catch (error) {
        logger.error(
          'error on signalService "notification" event [error:%o]',
          error
        );
      }
    });
  }

  init({ peers, lobbyPeers }: { peers: Peer[]; lobbyPeers: LobbyPeer[] }) {
    if (peers.length > 0) {
      this.peers = peers;
      this.emit('peersUpdated', this.peers);
    }
    if (lobbyPeers.length > 0) {
      this.lobbyPeers = lobbyPeers;
      this.emit('lobbyPeersUpdated', this.lobbyPeers);
    }
  }

  private updateRoomState(state: RoomUpdate) {
    this.roomState = {
      ...this.roomState,
      ...state,
    };
    this.emit('roomStateUpdated', this.roomState);
  }

  private setActiveSpeakerId(peerId: string) {
    this.activeSpeakerId = peerId;
    this.emit('activeSpeakerChanged', this.activeSpeakerId);
  }

  private updatePeer(peerInfo: Omit<Peer, 'roles'>) {
    const peer = this.peers.find((p) => p.id === peerInfo.id);

    if (peer) {
      const {
        displayName,
        picture,
        videoInProgress,
        stopVideoInProgress,
        audioInProgress,
        stopAudioInProgress,
        screenInProgress,
        stopScreenSharingInProgress,
        kickInProgress,
        modifyRolesInProgress,
        raisedHandInProgress,
        raisedHand,
        raisedHandTimestamp,
      } = peerInfo;

      if (displayName) {
        peer.displayName = displayName;
      }
      if (picture) {
        peer.picture = picture;
      }
      if (videoInProgress !== undefined) {
        peer.videoInProgress = videoInProgress;
      }
      if (stopVideoInProgress !== undefined) {
        peer.stopVideoInProgress = stopVideoInProgress;
      }
      if (audioInProgress !== undefined) {
        peer.audioInProgress = audioInProgress;
      }
      if (stopAudioInProgress !== undefined) {
        peer.stopAudioInProgress = stopAudioInProgress;
      }
      if (screenInProgress !== undefined) {
        peer.screenInProgress = screenInProgress;
      }
      if (stopScreenSharingInProgress !== undefined) {
        peer.stopScreenSharingInProgress = stopScreenSharingInProgress;
      }
      if (kickInProgress !== undefined) {
        peer.kickInProgress = kickInProgress;
      }
      if (modifyRolesInProgress !== undefined) {
        peer.modifyRolesInProgress = modifyRolesInProgress;
      }
      if (raisedHandInProgress !== undefined) {
        peer.raisedHandInProgress = raisedHandInProgress;
      }
      if (raisedHand !== undefined) {
        peer.raisedHand = raisedHand;
      }
      if (raisedHandTimestamp !== undefined) {
        peer.raisedHandTimestamp = raisedHandTimestamp;
      }
    }
    this.emit('peersUpdated', this.peers);
  }

  private updateLobbyPeer(lobbyPeerInfo: LobbyPeer) {
    const peer = this.lobbyPeers.find((p) => p.id === lobbyPeerInfo.id);

    if (peer) {
      const { displayName, picture, promotionInProgress } = lobbyPeerInfo;

      if (displayName) {
        peer.displayName = displayName;
      }
      if (picture) {
        peer.picture = picture;
      }
      if (promotionInProgress) {
        peer.promotionInProgress = promotionInProgress;
      }
    }
    this.emit('lobbyPeersUpdated', this.peers);
  }
}
