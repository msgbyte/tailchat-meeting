import { CombinedState, combineReducers, Reducer } from '@reduxjs/toolkit';
import room from './room';
import { meReducer as me } from '../slices/me';
import { chatReducer as chat } from '../slices/chat';
import producers from './producers';
import consumers from './consumers';
import notifications from './notifications';
import config from './config';
import { intlReducer } from 'react-intl-redux';
import { peersReducer } from '../slices/peers';
import { filesReducer } from '../slices/files';
import { peerVolumesReducer } from '../slices/peerVolumes';
import { recorderReducer } from '../slices/recorder';
import { lobbyPeersReducer } from '../slices/lobbyPeers';
import { settingsReducer } from '../slices/settings';
import { toolareaReducer } from '../slices/toolarea';
import { transportsReducer } from '../slices/transports';

export const rootReducer = combineReducers({
  intl: intlReducer,
  room,
  me,
  producers,
  consumers,
  transports: transportsReducer,
  peers: peersReducer,
  lobbyPeers: lobbyPeersReducer,
  peerVolumes: peerVolumesReducer,
  notifications,
  toolarea: toolareaReducer,
  chat,
  files: filesReducer,
  recorder: recorderReducer,
  settings: settingsReducer,
  config,
});

export type AppState = typeof rootReducer extends Reducer<
  CombinedState<infer P>
>
  ? P
  : never;
