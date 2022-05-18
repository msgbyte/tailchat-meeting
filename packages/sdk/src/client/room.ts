import EventEmitter from 'eventemitter3';
import { Logger } from '../helper/logger';
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
  on(event: 'roomStateUpdate', listener: (roomState: RoomState) => void): this;
  on(
    event: 'activeSpeakerChanged',
    listener: (activeSpeakerId: string) => void
  ): this;
}
export class RoomClient extends EventEmitter<
  'roomStateUpdate' | 'activeSpeakerChanged'
> {
  iceServers?: RTCIceServer[]; // TODO: not used
  roomState: RoomState = {
    state: 'new',
    selectedPeers: [],
    spotlights: [],
  };
  activeSpeakerId?: string;

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
        }
      } catch (error) {
        logger.error(
          'error on signalService "notification" event [error:%o]',
          error
        );
      }
    });
  }

  private updateRoomState(state: RoomUpdate) {
    this.roomState = {
      ...this.roomState,
      ...state,
    };
    this.emit('roomStateUpdate', this.roomState);
  }

  private setActiveSpeakerId(peerId: string) {
    this.activeSpeakerId = peerId;
    this.emit('activeSpeakerChanged', this.activeSpeakerId);
  }
}
