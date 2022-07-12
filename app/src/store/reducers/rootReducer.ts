import { CombinedState, combineReducers, Reducer } from '@reduxjs/toolkit';
import room from './room';
// import me from './me';
import { meReducer as me } from '../slices/me';
import producers from './producers';
import consumers from './consumers';
import transports from './transports';
import peers from './peers';
import lobbyPeers from './lobbyPeers';
import peerVolumes from './peerVolumes';
import notifications from './notifications';
import toolarea from './toolarea';
import chat from './chat';
import files from './files';
import recorder from './recorder';
import settings from './settings';
import config from './config';
import { intlReducer } from 'react-intl-redux';

export const rootReducer = combineReducers({
  intl: intlReducer,
  room,
  me,
  producers,
  consumers,
  transports,
  peers,
  lobbyPeers,
  peerVolumes,
  notifications,
  toolarea,
  chat,
  files,
  recorder,
  settings,
  config,
});

export type AppState = typeof rootReducer extends Reducer<
  CombinedState<infer P>
>
  ? P
  : never;
