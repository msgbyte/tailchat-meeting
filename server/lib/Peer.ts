import Logger from './logger/Logger';
import { userRoles } from './access/roles';

const EventEmitter = require('events').EventEmitter;

const logger = new Logger('Peer');

const RECORDING_TYPE_LOCAL = 'local';

export class Peer extends EventEmitter {
  id: string;
  roomId: string;
  socket: any;
  email = null;
  authId = null;
  private _closed = false;
  private _joined = false;
  private _joinedTimestamp = null;
  inLobby = false;
  _authenticated = false;
  _authenticatedTimestamp = null;
  _roles = [userRoles.NORMAL];
  _displayName = false;
  _picture = null;
  from: string | null = null;
  routerId = null;
  rtpCapabilities = null;
  _raisedHand = false;
  _raisedHandTimestamp = null;
  _localRecordingState = null;
  _recordingStateHistory = [];
  _transports = new Map();
  _producers = new Map();
  _consumers = new Map();

  constructor({ id, roomId, socket }: any) {
    super();
    logger.info('constructor() [id:"%s"]', id);

    this.id = id;
    this.roomId = roomId;
    this.socket = socket;

    this._handlePeer();
  }

  close() {
    logger.info('close()');

    this._closed = true;

    // Iterate and close all mediasoup Transport associated to this Peer, so all
    // its Producers and Consumers will also be closed.
    for (const transport of this.transports.values()) {
      transport.close();
    }

    if (this.socket) this.socket.disconnect(true);

    this.emit('close');
  }

  _handlePeer() {
    if (this.socket) {
      this.socket.on('disconnect', (reason) => {
        logger.info(
          '"disconnect" event [id: %s], [reason: %s]',
          this.id,
          reason
        );

        if (this.closed) return;

        this.close();
      });
    }
  }

  get closed() {
    return this._closed;
  }

  get joined() {
    return this._joined;
  }

  set joined(joined) {
    joined
      ? (this._joinedTimestamp = Date.now())
      : (this._joinedTimestamp = null);

    this._joined = joined;
  }

  get joinedTimestamp() {
    return this._joinedTimestamp;
  }

  get authenticated() {
    return this._authenticated;
  }

  set authenticated(authenticated) {
    if (authenticated !== this._authenticated) {
      authenticated
        ? (this._authenticatedTimestamp = Date.now())
        : (this._authenticatedTimestamp = null);

      const oldAuthenticated = this._authenticated;

      this._authenticated = authenticated;

      this.emit('authenticationChanged', { oldAuthenticated });
    }
  }

  get authenticatedTimestamp() {
    return this._authenticatedTimestamp;
  }

  get roles() {
    return this._roles;
  }

  get displayName() {
    return this._displayName;
  }

  set displayName(displayName) {
    if (displayName !== this._displayName) {
      const oldDisplayName = this._displayName;

      this._displayName = displayName;

      this.emit('displayNameChanged', { oldDisplayName });
    }
  }

  get picture() {
    return this._picture;
  }

  set picture(picture) {
    if (picture !== this._picture) {
      const oldPicture = this._picture;

      this._picture = picture;

      this.emit('pictureChanged', { oldPicture });
    }
  }

  get raisedHand() {
    return this._raisedHand;
  }

  set raisedHand(raisedHand) {
    raisedHand
      ? (this._raisedHandTimestamp = Date.now())
      : (this._raisedHandTimestamp = null);

    this._raisedHand = raisedHand;
  }

  get raisedHandTimestamp() {
    return this._raisedHandTimestamp;
  }

  get transports() {
    return this._transports;
  }

  get producers() {
    return this._producers;
  }

  get consumers() {
    return this._consumers;
  }

  get localRecordingState() {
    return this._localRecordingState;
  }

  get recordingStateHistory() {
    return this._recordingStateHistory;
  }

  set localRecordingState(recordingState) {
    this._localRecordingState = recordingState;
    this.addRecordingStateHistory(recordingState, RECORDING_TYPE_LOCAL);
  }

  addRecordingStateHistory(recordingState, recordingType) {
    this.recordingStateHistory.push({
      timestamp: Date.now(),
      recordingState,
      recordingType,
    });
  }

  addRole(newRole) {
    if (
      !this._roles.some((role) => role.id === newRole.id) &&
      newRole.id !== userRoles.NORMAL.id // Can not add NORMAL
    ) {
      this._roles.push(newRole);

      logger.info('addRole() | [newRole:"%s]"', newRole);

      this.emit('gotRole', { newRole });
    }
  }

  removeRole(oldRole) {
    if (
      this._roles.some((role) => role.id === oldRole.id) &&
      oldRole.id !== userRoles.NORMAL.id // Can not remove NORMAL
    ) {
      this._roles = this._roles.filter((role) => role.id !== oldRole.id);

      logger.info('removeRole() | [oldRole:"%s]"', oldRole);

      this.emit('lostRole', { oldRole });
    }
  }

  hasRole(role) {
    return this._roles.some((myRole) => myRole.id === role.id);
  }

  addTransport(id, transport) {
    this.transports.set(id, transport);
  }

  getTransport(id) {
    return this.transports.get(id);
  }

  getConsumerTransport() {
    return Array.from(this.transports.values()).find(
      (t: any) => t.appData.consuming
    );
  }

  removeTransport(id) {
    this.transports.delete(id);
  }

  addProducer(id, producer) {
    this.producers.set(id, producer);
  }

  getProducer(id) {
    return this.producers.get(id);
  }

  removeProducer(id) {
    this.producers.delete(id);
  }

  addConsumer(id, consumer) {
    this.consumers.set(id, consumer);
  }

  getConsumer(id) {
    return this.consumers.get(id);
  }

  removeConsumer(id) {
    this.consumers.delete(id);
  }

  get peerInfo() {
    const peerInfo = {
      id: this.id,
      displayName: this.displayName,
      picture: this.picture,
      from: this.from,
      roles: this.roles.map((role) => role.id),
      raisedHand: this.raisedHand,
      raisedHandTimestamp: this.raisedHandTimestamp,
      localRecordingState: this.localRecordingState,
      recordingStateHistory: this.localRecordingStateHistory,
    };

    return peerInfo;
  }
}
