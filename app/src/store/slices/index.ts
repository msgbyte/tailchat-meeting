import { CombinedState, combineReducers, Reducer } from '@reduxjs/toolkit';
import { intlReducer } from 'react-intl-redux';
import { meReducer } from './me';
import { chatReducer } from './chat';
import { peersReducer } from './peers';
import { filesReducer } from './files';
import { peerVolumesReducer } from './peerVolumes';
import { recorderReducer } from './recorder';
import { lobbyPeersReducer } from './lobbyPeers';
import { settingsReducer } from './settings';
import { toolareaReducer } from './toolarea';
import { transportsReducer } from './transports';
import { roomReducer } from './room';
import { notificationsReducer } from './notifications';
import { configReducer } from './config';
import { producersReducer } from './producers';
import { consumersReducer } from './consumers';

export const rootReducer = combineReducers({
  intl: intlReducer,
  room: roomReducer,
  me: meReducer,
  producers: producersReducer,
  consumers: consumersReducer,
  transports: transportsReducer,
  peers: peersReducer,
  lobbyPeers: lobbyPeersReducer,
  peerVolumes: peerVolumesReducer,
  notifications: notificationsReducer,
  toolarea: toolareaReducer,
  chat: chatReducer,
  files: filesReducer,
  recorder: recorderReducer,
  settings: settingsReducer,
  config: configReducer,
});

export type AppState = typeof rootReducer extends Reducer<
  CombinedState<infer P>
>
  ? P
  : never;
