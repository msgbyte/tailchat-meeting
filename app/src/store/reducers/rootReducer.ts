import { CombinedState, combineReducers, Reducer } from '@reduxjs/toolkit';
import room from './room';
import { meReducer as me } from '../slices/me';
import { chatReducer as chat } from '../slices/chat';
import producers from './producers';
import consumers from './consumers';
import transports from './transports';
import lobbyPeers from './lobbyPeers';
import notifications from './notifications';
import toolarea from './toolarea';
import settings from './settings';
import config from './config';
import { intlReducer } from 'react-intl-redux';
import { peersReducer } from '../slices/peers';
import { filesReducer } from '../slices/files';
import { peerVolumesReducer } from '../slices/peerVolumes';
import { recorderReducer } from '../slices/recorder';

export const rootReducer = combineReducers({
  intl: intlReducer,
  room,
  me,
  producers,
  consumers,
  transports,
  peers: peersReducer,
  lobbyPeers,
  peerVolumes: peerVolumesReducer,
  notifications,
  toolarea,
  chat,
  files: filesReducer,
  recorder: recorderReducer,
  settings,
  config,
});

export type AppState = typeof rootReducer extends Reducer<
  CombinedState<infer P>
>
  ? P
  : never;
